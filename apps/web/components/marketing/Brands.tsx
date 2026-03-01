"use client";

import { motion } from "framer-motion";

const brands = [
  {
    name: "Nike",
    svg: (
      <svg viewBox="0 0 200 70" fill="currentColor">
        <path d="M180 5C180 5 50 50 32 61C14 72 5 66 14 54C23 42 68 28 68 28L180 5Z" />
      </svg>
    ),
  },
  {
    name: "ASICS",
    svg: (
      <svg viewBox="0 0 200 50" fill="currentColor">
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="38" fontWeight="900" fontFamily="Arial, sans-serif" letterSpacing="6">ASICS</text>
      </svg>
    ),
  },
  {
    name: "adidas",
    svg: (
      <svg viewBox="0 0 200 60" fill="currentColor">
        <rect x="60" y="2" width="8" height="22" rx="1" transform="rotate(-15 64 13)" />
        <rect x="78" y="0" width="8" height="28" rx="1" transform="rotate(-8 82 14)" />
        <rect x="96" y="0" width="8" height="32" rx="1" />
        <text x="50%" y="78%" dominantBaseline="middle" textAnchor="middle" fontSize="28" fontWeight="900" fontFamily="Arial, sans-serif" letterSpacing="4">adidas</text>
      </svg>
    ),
  },
  {
    name: "New Balance",
    svg: (
      <svg viewBox="0 0 200 50" fill="currentColor">
        <text x="50%" y="38%" dominantBaseline="middle" textAnchor="middle" fontSize="24" fontWeight="900" fontFamily="Arial, sans-serif" letterSpacing="1">NEW</text>
        <text x="50%" y="72%" dominantBaseline="middle" textAnchor="middle" fontSize="18" fontWeight="700" fontFamily="Arial, sans-serif" letterSpacing="4">BALANCE</text>
      </svg>
    ),
  },
  {
    name: "MIZUNO",
    svg: (
      <svg viewBox="0 0 200 50" fill="currentColor">
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="34" fontWeight="900" fontFamily="Arial, sans-serif" letterSpacing="8">MIZUNO</text>
      </svg>
    ),
  },
  {
    name: "OAKLEY",
    svg: (
      <svg viewBox="0 0 200 50" fill="currentColor">
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="32" fontWeight="900" fontFamily="Arial, sans-serif" letterSpacing="6">OAKLEY</text>
      </svg>
    ),
  },
  {
    name: "Under Armour",
    svg: (
      <svg viewBox="0 0 200 50" fill="currentColor">
        <text x="50%" y="38%" dominantBaseline="middle" textAnchor="middle" fontSize="20" fontWeight="900" fontFamily="Arial, sans-serif" letterSpacing="3">UNDER</text>
        <text x="50%" y="72%" dominantBaseline="middle" textAnchor="middle" fontSize="18" fontWeight="900" fontFamily="Arial, sans-serif" letterSpacing="4">ARMOUR</text>
      </svg>
    ),
  },
  {
    name: "GARMIN",
    svg: (
      <svg viewBox="0 0 200 50" fill="currentColor">
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="34" fontWeight="900" fontFamily="Arial, sans-serif" letterSpacing="6">GARMIN</text>
      </svg>
    ),
  },
  {
    name: "HOKA",
    svg: (
      <svg viewBox="0 0 200 50" fill="currentColor">
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="40" fontWeight="900" fontFamily="Arial, sans-serif" letterSpacing="10">HOKA</text>
      </svg>
    ),
  },
  {
    name: "SAUCONY",
    svg: (
      <svg viewBox="0 0 200 50" fill="currentColor">
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="30" fontWeight="900" fontFamily="Arial, sans-serif" letterSpacing="5">SAUCONY</text>
      </svg>
    ),
  },
];

function BrandCard({ brand }: { brand: (typeof brands)[number] }) {
  return (
    <div className="group relative flex-shrink-0 w-44 mx-4 cursor-pointer">
      <div className="relative flex items-center justify-center h-20 overflow-hidden">
        {/* White logo (base) */}
        <div className="absolute inset-0 flex items-center justify-center w-full h-full text-white/80 transition-all duration-700 ease-out group-hover:opacity-0 group-hover:scale-110">
          <div className="w-32 h-12">{brand.svg}</div>
        </div>
        {/* Orange logo (hover paint effect) — clip from left to right */}
        <div
          className="absolute inset-0 flex items-center justify-center w-full h-full text-orange-500 transition-all duration-700 ease-out"
          style={{
            clipPath: "inset(0 100% 0 0)",
          }}
        >
          <div className="w-32 h-12 drop-shadow-[0_0_12px_rgba(249,115,22,0.6)]">
            {brand.svg}
          </div>
        </div>
      </div>
      {/* Glow line under */}
      <div className="h-[2px] mx-6 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full w-0 bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-700 ease-out group-hover:w-full rounded-full shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
      </div>
      <style jsx>{`
        .group:hover [style*="clip-path"] {
          clip-path: inset(0 0% 0 0) !important;
        }
      `}</style>
    </div>
  );
}

export default function Brands() {
  return (
    <section className="py-24 bg-zinc-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.03),transparent_70%)]" />

      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 px-4"
        >
          <span className="text-orange-500 font-mono text-sm tracking-widest uppercase font-bold">
            Marcas que inspiram
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white mt-3 mb-4">
            Corra com as{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
              melhores marcas
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            As maiores marcas do mundo da corrida estão no DNA dos nossos atletas.
            Treino inteligente combina com equipamento de alta performance.
          </p>
        </motion.div>

        {/* Infinite slider */}
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-zinc-950 to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-zinc-950 to-transparent pointer-events-none" />

          <div className="flex animate-brands-slide hover:[animation-play-state:paused]">
            {/* First set */}
            {brands.map((brand) => (
              <BrandCard key={`a-${brand.name}`} brand={brand} />
            ))}
            {/* Duplicate for seamless loop */}
            {brands.map((brand) => (
              <BrandCard key={`b-${brand.name}`} brand={brand} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
