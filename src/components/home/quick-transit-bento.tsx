"use client";

import { motion } from "framer-motion";

export function QuickTransitBento() {
  return (
    <section className="lg:col-span-7 flex flex-col gap-stack-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
        <motion.div
          whileHover={{ y: -2 }}
          className="glass-panel p-5 rounded-xl border border-outline-variant/10 hover:shadow-lg transition-all group cursor-pointer"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary-fixed rounded-lg">
              <span className="material-symbols-outlined text-primary">
                directions_bus
              </span>
            </div>
            <span className="font-mono text-data-label text-secondary font-bold">
              LIVE
            </span>
          </div>
          <h3 className="text-headline-md font-semibold mb-1">Route 500-D</h3>
          <p className="text-body-md text-on-surface-variant">
            Arriving Indiranagar in 4 mins
          </p>
          <div className="mt-4 h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-primary w-2/3 group-hover:w-3/4 transition-all duration-1000" />
          </div>
        </motion.div>

        <div className="glass-panel p-5 rounded-xl border border-outline-variant/10 flex flex-col justify-between">
          <div className="flex justify-between">
            <span className="text-headline-md font-semibold">28°C</span>
            <span className="material-symbols-outlined text-amber-500 text-3xl">
              wb_sunny
            </span>
          </div>
          <div>
            <p className="text-body-md font-semibold">Perfect for Walking</p>
            <p className="font-mono text-data-label text-on-surface-variant">
              Indiranagar, Bangalore
            </p>
          </div>
        </div>

        <div className="md:col-span-2 glass-panel p-6 rounded-xl border border-outline-variant/10 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-headline-md font-semibold">Recent Journeys</h3>
            <button
              type="button"
              className="text-primary font-mono text-data-label flex items-center"
            >
              View All{" "}
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
          <div className="flex gap-stack-md overflow-x-auto scrollbar-hide">
            {[
              { icon: "work", title: "Office", sub: "Manyata Tech Park" },
              { icon: "favorite", title: "Home", sub: "Whitefield" },
              { icon: "shopping_bag", title: "Phoenix Mall", sub: "Mahadevapura" },
            ].map((item) => (
              <div
                key={item.title}
                className="min-w-[160px] p-4 bg-surface-container-low rounded-lg border border-outline-variant/10"
              >
                <span className="material-symbols-outlined text-primary mb-2">
                  {item.icon}
                </span>
                <p className="font-semibold">{item.title}</p>
                <p className="font-mono text-xs text-on-surface-variant">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
