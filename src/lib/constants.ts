/** Canonical categories — must match studiospace-server studio.constants.ts. */
export const STUDIO_CATEGORIES = [
  "Photo Studio",
  "Sound Stage",
  "Podcast Room",
  "Music Suite",
  "Art Workshop",
  "Creative Workspace",
  "Production Space",
] as const;

export type StudioCategory = (typeof STUDIO_CATEGORIES)[number];

export interface CategoryTile {
  label: string;
  value: StudioCategory;
  description: string;
  image: string;
}

/** Homepage "Browse Categories" tiles (approved section order). */
export const CATEGORY_TILES: CategoryTile[] = [
  {
    label: "Photo Studios",
    value: "Photo Studio",
    description: "Daylight rooms, cyc walls & seamless backdrops",
    image: "/images/studios/photo-studio.jpg",
  },
  {
    label: "Sound Stages",
    value: "Sound Stage",
    description: "Controlled stages for film & commercial shoots",
    image: "/images/studios/sound-stage.jpg",
  },
  {
    label: "Podcast Rooms",
    value: "Podcast Room",
    description: "Treated rooms, broadcast mics, ready to record",
    image: "/images/studios/podcast-room.jpg",
  },
  {
    label: "Music Suites",
    value: "Music Suite",
    description: "Recording booths, rehearsal rooms & live gear",
    image: "/images/studios/music-suite.jpg",
  },
  {
    label: "Art Workshops",
    value: "Art Workshop",
    description: "Light-filled studios for makers & classes",
    image: "/images/studios/art-workshop.jpg",
  },
];

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Highest Rated" },
  { value: "price-asc", label: "Lowest Price" },
  { value: "price-desc", label: "Highest Price" },
] as const;

export type StudioSortValue = (typeof SORT_OPTIONS)[number]["value"];

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/studios", label: "Explore Studios" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/about", label: "About Us" },
] as const;

export const FOOTER_CATEGORIES = [
  { href: "/studios?category=Photo%20Studio", label: "Photo Studios" },
  { href: "/studios?category=Sound%20Stage", label: "Sound Stages" },
  { href: "/studios?category=Podcast%20Room", label: "Podcast Rooms" },
  { href: "/studios?category=Music%20Suite", label: "Music Suites" },
  { href: "/studios?category=Art%20Workshop", label: "Art Workshops" },
  { href: "/studios?category=Creative%20Workspace", label: "Creative Workspaces" },
] as const;

/**
 * Name of the HTTPOnly application JWT cookie. Must match JWT_COOKIE_NAME
 * on studiospace-server (which defaults to the same value).
 */
export const AUTH_JWT_COOKIE = "studiospace_session";

/**
 * Better Auth session cookie. Better Auth's default prefix is `better-auth`
 * (hyphen), and production HTTPS deployments prepend `__Secure-`, so the
 * proxy matches on the suffix instead of a single literal name.
 */
export const BETTER_AUTH_SESSION_COOKIE = "better-auth.session_token";

export const BETTER_AUTH_SESSION_SUFFIX = "session_token";
