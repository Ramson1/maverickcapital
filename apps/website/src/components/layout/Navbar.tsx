"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const mainNavLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

const dropdownLinks = [
  { href: "/plans", label: "Investment Plans" },
  { href: "/market", label: "Market" },
  { href: "/blog", label: "Blog" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    const handleMobileMenuClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        mobileToggleRef.current &&
        !mobileToggleRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleMobileMenuClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleMobileMenuClickOutside);
    };
  }, [isOpen]);

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] md:w-[85%] lg:w-[75%]">
      <nav
        className="glass rounded-full shadow-2xl shadow-brand-500/10"
        style={{
          borderWidth: 2,
          borderColor: '#040365cb',
          background: 'rgba(255, 255, 255, 0.69)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      > 
        <div className="flex items-center justify-between px-6 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="Maverick Capital"
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="text-base font-bold leading-tight text-brand-900">
                Maverick
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-brand-600">
                Capital
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden lg:flex items-center gap-1">
            {mainNavLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="relative rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:text-brand-700 hover:bg-brand-50/80"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {/* More Dropdown */}
            <li className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:text-brand-700 hover:bg-brand-50/80"
              >
                More <ChevronDown className={cn("h-4 w-4 transition-transform", isDropdownOpen && "rotate-180")} />
              </button>
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-brand-100"
                  >
                    {dropdownLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsDropdownOpen(false)}
                        className="block rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-brand-50 hover:text-brand-700"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          </ul>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full px-5 py-2 text-sm font-semibold text-brand-700 transition-all hover:bg-brand-50 hover:scale-105"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-full gradient-brand px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:shadow-xl hover:shadow-brand-500/40 hover:scale-105"
            >
              Get Started
              <span className="ml-1">→</span>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            ref={mobileToggleRef}
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-full p-2 text-slate-600 transition-all hover:bg-brand-50 hover:scale-110 lg:hidden"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={mobileMenuRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden lg:hidden px-3 pb-3"
            >
              <div className="rounded-2xl bg-white/90 backdrop-blur-xl p-4" style={{ borderWidth: 2, borderColor: 'rgba(4, 3, 101, 0.5)' }}>
                <div className="space-y-1">
                  {mainNavLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-all hover:bg-brand-50 hover:text-brand-700"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                {/* Mobile More Links */}
                <div className="border-t border-slate-200/60 pt-2 mt-2">
                  {dropdownLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="block rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-all hover:bg-brand-50 hover:text-brand-700"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                <div className="flex flex-col gap-2 pt-3 mt-2 border-t border-slate-200/60">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl px-4 py-3 text-center text-sm font-semibold text-brand-700 transition-all hover:bg-brand-50"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl gradient-brand px-4 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-brand-500/30"
                  >
                    Get Started →
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
