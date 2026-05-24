import { MapBackground } from "@/components/layout/map-background";
import { MetroStatusCard } from "@/components/home/metro-status-card";
import { QuickTransitBento } from "@/components/home/quick-transit-bento";
import { RouteSearchForm } from "@/components/search/route-search-form";

export default function HomePage() {
  return (
    <main className="relative min-h-screen w-full">
      <MapBackground />
      <div className="relative z-10 pt-20 md:pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-stack-lg">
        <section className="lg:col-span-5 flex flex-col gap-stack-lg">
          <RouteSearchForm />
          <MetroStatusCard />
        </section>
        <QuickTransitBento />
      </div>
      <button
        type="button"
        className="fixed bottom-24 right-margin-mobile md:hidden w-14 h-14 bg-primary rounded-full shadow-[0_4px_10px_rgba(0,85,164,0.3)] flex items-center justify-center text-white active:scale-95 transition-transform z-40"
        aria-label="Scan QR"
      >
        <span
          className="material-symbols-outlined text-2xl"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          qr_code_scanner
        </span>
      </button>
    </main>
  );
}
