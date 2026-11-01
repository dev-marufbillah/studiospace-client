"use client";

import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Heart,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Store,
  UserRound,
} from "lucide-react";
import { DropdownMenu, DropdownItem } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/providers/AuthProvider";
import { getInitials } from "@/lib/utils";
import type { AuthUser } from "@/types";

const MENU_ITEMS = [
  { href: "/host", label: "Host Panel", icon: Store },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/add-studio", label: "Add New Studio", icon: PlusCircle },
  { href: "/my-listings", label: "My Studio Listings", icon: Store },
  { href: "/my-bookings", label: "My Bookings", icon: CalendarDays },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/profile", label: "Profile", icon: UserRound },
] as const;

/** Avatar + name trigger with the full account menu. */
export function UserDropdown({ user }: { user: AuthUser }) {
  const { signOut } = useAuth();
  const pathname = usePathname();

  return (
    <DropdownMenu
      ariaLabel="Account menu"
      trigger={
        <span className="flex items-center gap-2 rounded-full border border-transparent py-1 pl-1 pr-2 transition-colors hover:bg-accent">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt=""
              className="h-9 w-9 rounded-full border border-border object-cover"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {getInitials(user.name)}
            </span>
          )}
          <span className="hidden max-w-28 truncate text-sm font-medium md:inline">
            {user.name}
          </span>
        </span>
      }
    >
      <div className="border-b border-border px-4 pb-2 pt-1.5">
        <p className="truncate text-sm font-semibold">{user.name}</p>
        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
      </div>
      {MENU_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <DropdownItem key={item.href} href={item.href}>
            <Icon className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
            <span className={active ? "font-semibold text-primary" : ""}>{item.label}</span>
          </DropdownItem>
        );
      })}
      <div className="my-1.5 border-t border-border" />
      <DropdownItem onSelect={() => void signOut()} danger>
        <LogOut className="h-4 w-4" />
        Logout
      </DropdownItem>
    </DropdownMenu>
  );
}
