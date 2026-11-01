import { HeroSlider } from "@/components/home/HeroSlider";
import { FeaturedStudios } from "@/components/home/FeaturedStudios";
import { Categories } from "@/components/home/Categories";
import { HowItWorks } from "@/components/home/HowItWorks";
import { HostGuarantee } from "@/components/home/HostGuarantee";

/** StudioSpace homepage — approved editorial section order. */
export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <FeaturedStudios />
      <Categories />
      <HowItWorks />
      <HostGuarantee />
    </>
  );
}
