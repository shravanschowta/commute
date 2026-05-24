"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", icon: "home", label: "Home", fill: true },
  { href: "/routes", icon: "directions", label: "Routes", fill: false },
  { href: "/saved", icon: "bookmark", label: "Saved", fill: false },
  { href: "/profile", icon: "person", label: "Profile", fill: false },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-margin-mobile pb-4 pt-2 md:hidden bg-surface/80 backdrop-blur-lg rounded-t-xl shadow-[0_-4px_10px_rgba(0,0,0,0.05)] border-t border-outline-variant/20">
      {items.map(({ href, icon, label, fill }) => {
        const active =
          href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center justify-center transition-all duration-150 active:scale-90",
              active
                ? "bg-primary-container text-on-primary-container rounded-full px-4 py-1"
                : "text-on-surface-variant p-2 rounded-lg hover:bg-surface-container-low",
            )}
          >
            <span
              className="material-symbols-outlined"
              style={active && fill ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {icon}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wide mt-0.5">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
