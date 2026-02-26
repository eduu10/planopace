"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Dumbbell, TrendingUp, User } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/treino", label: "Treino", icon: Dumbbell },
  { href: "/evolucao", label: "Evolução", icon: TrendingUp },
  { href: "/perfil", label: "Perfil", icon: User },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      {/* Top bar */}
      <header className="fixed top-0 w-full z-50 bg-[#0A0A0B]/80 backdrop-blur-md border-b border-white/[0.06] px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <span className="text-xl font-bold italic tracking-tighter">
            PLANO<span className="text-orange-500">PACE</span>
          </span>
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-sm font-bold">
            J
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="pt-16 pb-20 max-w-lg mx-auto px-4">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 w-full z-50 bg-[#0A0A0B]/90 backdrop-blur-md border-t border-white/[0.06]">
        <div className="max-w-lg mx-auto flex justify-around py-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                  isActive ? "text-orange-500" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
