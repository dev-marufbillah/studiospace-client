"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TagInputProps {
  id: string;
  label: string;
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  hint?: string;
}

/** Chip-style list editor for amenities and equipment. */
export function TagInput({ id, label, value, onChange, placeholder, hint }: TagInputProps) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const item = draft.trim();
    if (!item) return;
    if (item.length > 40) return;
    if (value.some((existing) => existing.toLowerCase() === item.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...value, item]);
    setDraft("");
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <Input
          id={id}
          value={draft}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={add} aria-label={`Add ${label}`}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2 pt-1">
          {value.map((item) => (
            <li
              key={item}
              className="flex items-center gap-1.5 rounded-full border border-border bg-accent px-3 py-1 text-sm text-accent-foreground"
            >
              {item}
              <button
                type="button"
                aria-label={`Remove ${item}`}
                onClick={() => onChange(value.filter((existing) => existing !== item))}
                className="rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10"
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
