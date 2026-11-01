"use client";

import { useRef, useState } from "react";
import { ImagePlus, Link2, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  id?: string;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.readAsDataURL(file);
  });
}

/**
 * Cover image picker: validates type/size, shows a preview and uploads
 * through the Express `/api/upload` proxy (imgbb key stays server-side).
 * Falls back to a manual URL field when uploads are not configured.
 */
export function ImageUploader({ value, onChange, label = "Cover image", id = "cover-image" }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showUrlField, setShowUrlField] = useState(false);

  const handleFile = async (file: File) => {
    if (!ALLOWED.includes(file.type)) {
      toast.error("Only JPEG, PNG, WebP or GIF images are allowed.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("That image is larger than 8 MB. Please compress it first.");
      return;
    }

    setUploading(true);
    setProgress(15);
    const ticker = setInterval(() => setProgress((value) => Math.min(value + 12, 88)), 350);

    try {
      const dataUrl = await readAsDataUrl(file);
      const result = await api.post<{ url: string }>("/api/upload", {
        image: dataUrl,
        name: file.name,
      });
      setProgress(100);
      onChange(result.url);
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? `${error.message} You can paste an image URL instead.`
          : "Upload failed. Paste an image URL instead."
      );
      setShowUrlField(true);
    } finally {
      clearInterval(ticker);
      setUploading(false);
      setTimeout(() => setProgress(0), 600);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>

      {value ? (
        <div className="relative overflow-hidden rounded-lg border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Cover preview" className="aspect-[16/10] w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Remove image"
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input bg-surface-muted px-4 py-10 text-center transition-colors hover:border-primary hover:bg-accent/40",
            uploading && "cursor-wait opacity-80"
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
              <span className="text-sm text-muted-foreground">Uploading… {progress}%</span>
            </>
          ) : (
            <>
              <ImagePlus className="h-6 w-6 text-primary" aria-hidden="true" />
              <span className="text-sm font-medium">Click to choose an image</span>
              <span className="text-xs text-muted-foreground">JPEG, PNG, WebP or GIF · max 8 MB</span>
            </>
          )}
        </button>
      )}

      {uploading && (
        <div
          className="h-1.5 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={ALLOWED.join(",")}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
          event.target.value = "";
        }}
      />

      <div className="flex flex-wrap items-center gap-3 text-xs">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1 font-medium text-primary hover:underline"
        >
          <Upload className="h-3.5 w-3.5" /> Choose file
        </button>
        <button
          type="button"
          onClick={() => setShowUrlField((state) => !state)}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <Link2 className="h-3.5 w-3.5" /> {showUrlField ? "Hide URL field" : "Paste image URL"}
        </button>
      </div>

      {showUrlField && (
        <Input
          type="url"
          placeholder="https://images.example.com/studio.jpg"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label="Image URL"
        />
      )}

      <p className="text-xs leading-relaxed text-muted-foreground">
        Images are hosted on imgbb through our server, so the API key never reaches the browser.
        Uploads require an{" "}
        <code className="rounded bg-muted px-1 py-0.5">IMGBB_API_KEY</code> on the backend.
      </p>
    </div>
  );
}

/** Additional gallery URL manager (comma-free, one URL per row). */
export function GalleryUploader({
  value,
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const url = draft.trim();
    if (!url) return;
    if (!/^https?:\/\/\S+$/.test(url) && !url.startsWith("/images/")) {
      toast.error("Gallery images must be an https URL or an /images path.");
      return;
    }
    if (value.includes(url)) {
      toast.info("That image is already in the gallery.");
      return;
    }
    onChange([...value, url]);
    setDraft("");
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="gallery-url">Gallery images (optional)</Label>
      <div className="flex gap-2">
        <Input
          id="gallery-url"
          placeholder="https://…/second-angle.jpg"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={add}>
          Add
        </Button>
      </div>
      {value.length > 0 && (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {value.map((url) => (
            <li key={url} className="relative overflow-hidden rounded-md border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="aspect-square w-full object-cover" />
              <button
                type="button"
                aria-label="Remove gallery image"
                onClick={() => onChange(value.filter((item) => item !== url))}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
