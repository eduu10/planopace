"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, CreditCard, FileText, ArrowLeft, Shield, LogOut, Columns3, Image as ImageIcon, Menu, X, Trophy, Key, Banknote } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/kanban", label: "Kanban", icon: Columns3 },
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
  { href: "/admin/planos", label: "Planos", icon: FileText },
  { href: "/admin/financeiro", label: "Financeiro", icon: CreditCard },
  { href: "/admin/vitorias", label: "Vitórias", icon: Trophy },
  { href: "/admin/galeria", label: "Galeria", icon: ImageIcon },
  { href: "/admin/asaas", label: "API Asaas", icon: Banknote },
  { href: "/admin/api", label: "API Strava", icon: Key },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, hydrate, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("planopace_user");
      if (!stored) {
        router.push("/login");
        return;
      }
      const parsed = JSON.parse(stored);
      if (parsed.role !== "admin") {
        router.push("/dashboard");
      }
    }
  }, [router]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex">
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-[#0E0E0F] border-b border-white/[0.06] flex items-center justify-between px-4 z-50 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-orange-500" />
          <span className="text-lg font-bold italic tracking-tighter">
            PLANO<span className="text-orange-500">PACE</span>
          </span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-[#0E0E0F] border-r border-white/[0.06] flex flex-col z-50 transition-transform duration-300 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}>
        {/* Logo */}
        <div className="p-6 border-b border-white/[0.06]">
          <Link href="/admin" className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-500" />
            <span className="text-xl font-bold italic tracking-tighter">
              PLANO<span className="text-orange-500">PACE</span>
            </span>
          </Link>
          <p className="text-xs text-gray-500 mt-1 ml-7">Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-orange-500/10 text-orange-500"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User + Actions */}
        <div className="p-4 border-t border-white/[0.06] space-y-2">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold">
              {user?.avatar || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user?.name || "Admin"}</p>
              <p className="text-[10px] text-gray-500 truncate">{user?.email || ""}</p>
            </div>
          </div>
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-white text-sm transition-colors px-3 py-1.5">
            <ArrowLeft className="w-4 h-4" />
            Ir para App
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:text-red-400 text-sm transition-colors px-3 py-1.5 w-full">
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-4 pt-18 min-h-screen lg:ml-64 lg:p-8 lg:pt-8">
        {children}
      </main>
    </div>
  );
}
