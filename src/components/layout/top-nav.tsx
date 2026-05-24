"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/routes", label: "Routes" },
  { href: "/saved", label: "Saved" },
  { href: "/profile", label: "Profile" },
] as const;

export function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex justify-between items-center px-margin-desktop h-16 w-full fixed top-0 z-50 bg-surface/70 backdrop-blur-md shadow-sm border-b border-outline-variant/30">
      <Link
        href="/"
        className="text-headline-md font-bold text-primary flex items-center gap-2"
      >
        <span
          className="material-symbols-outlined"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          directions_bus
        </span>
        CommuteBLR
      </Link>
      <div className="flex items-center gap-stack-lg">
        {links.map(({ href, label }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "py-1 transition-colors",
                active
                  ? "text-primary font-bold border-b-2 border-primary"
                  : "text-on-surface-variant hover:text-primary",
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="p-2 rounded-full hover:bg-surface-container-high transition-colors"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-on-surface-variant">
            notifications
          </span>
        </button>
        <button
          type="button"
          className="p-2 rounded-full hover:bg-surface-container-high transition-colors"
          aria-label="Settings"
        >
          <span className="material-symbols-outlined text-on-surface-variant">
            settings
          </span>
        </button>
      </div>
    </nav>
  );
}
