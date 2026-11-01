"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { ArrowRight, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";

interface HeroSlide {
  image: string;
  eyebrow: string;
  title: string;
  description: string;
}

const SLIDES: HeroSlide[] = [
  {
    image: "/images/hero/hero-1.jpg",
    eyebrow: "Photography studios",
    title: "Find the light your work deserves",
    description:
      "Daylight lofts, cyclorama walls and fully equipped photo studios — booked by the hour, in your city.",
  },
  {
    image: "/images/hero/hero-2.jpg",
    eyebrow: "Film & production stages",
    title: "Stage space without the studio lot",
    description:
      "Sound stages, cove corners and practical sets for commercials, shorts and branded content.",
  },
  {
    image: "/images/hero/hero-3.jpg",
    eyebrow: "Podcast & music rooms",
    title: "Record where the acoustics cooperate",
    description:
      "Acoustically treated podcast rooms and music suites with broadcast mics patched and ready.",
  },
];

/** Homepage hero: Swiper fade slider with dual CTAs. */
export function HeroSlider() {
  const { user } = useAuth();
  const hostHref = user ? "/add-studio" : "/register";

  return (
    <section aria-label="StudioSpace highlights" className="relative">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop
        speed={900}
        className="h-[78vh] min-h-[540px] w-full"
      >
        {SLIDES.map((slide) => (
          <SwiperSlide key={slide.title}>
            <div className="relative h-full w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                fetchPriority="high"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/20"
              />
              <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-4 pb-16 sm:px-6 lg:px-8">
                <div className="max-w-2xl text-white">
                  <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.2em] text-white/80">
                    <Camera className="h-4 w-4" aria-hidden="true" />
                    {slide.eyebrow}
                  </p>
                  <h1 className="mt-4 text-balance font-heading text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">
                    {slide.title}
                  </h1>
                  <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/85 sm:text-lg">
                    {slide.description}
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link href="/studios">
                      <Button size="lg" className="w-full sm:w-auto">
                        Explore Studios <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </Link>
                    <Link href={hostHref}>
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full border-white/50 bg-white/10 text-white hover:bg-white/20 hover:text-white sm:w-auto"
                      >
                        Host Your Space
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
