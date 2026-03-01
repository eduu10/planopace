"use client";

import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed w-full z-50 backdrop-blur-md border-b border-white/10 transition-all duration-300 ${
        scrolled ? "bg-black/90 shadow-lg shadow-black/50" : "bg-black/80"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between transition-all duration-300 ${
            scrolled ? "h-14" : "h-20"
          }`}
        >
          <Link href="/" className="flex-shrink-0">
            <span
              className={`font-bold italic tracking-tighter text-white transition-all duration-300 ${
                scrolled ? "text-xl" : "text-2xl"
              }`}
            >
              PLANO<span className="text-orange-500">PACE</span>
            </span>
          </Link>
          <div className="hidden md:block">
            <div
              className={`ml-10 flex items-baseline transition-all duration-300 ${
                scrolled ? "space-x-6" : "space-x-8"
              }`}
            >
              <a href="#features" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Funcionalidades</a>
              <a href="#how-it-works" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Como Funciona</a>
              <a href="#pricing" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Preços</a>
              <Link href="/login" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Entrar</Link>
              <Link
                href="/registro"
                className={`bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold transition-all transform hover:scale-105 ${
                  scrolled ? "px-5 py-1.5 text-xs" : "px-6 py-2 text-sm"
                }`}
              >
                Começar Agora
              </Link>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-black border-b border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="#features" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Funcionalidades</a>
            <a href="#how-it-works" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Como Funciona</a>
            <a href="#pricing" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Preços</a>
            <Link href="/login" className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsOpen(false)}>Entrar</Link>
            <Link href="/registro" className="block text-center bg-orange-500 text-white px-3 py-2 rounded-md text-base font-bold mt-4" onClick={() => setIsOpen(false)}>
              Começar Agora
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
