"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const links = [
  { href: "/#wege", label: "Angebote" },
  { href: "/#warum", label: "Meine Haltung" },
  { href: "/#ueber-mich", label: "Über mich" },
  { href: "/#kontakt", label: "Kontakt" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    if (!isHome) return;
    const hero = document.getElementById("hero");
    if (!hero) {
      setScrolled(false);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setScrolled(entry.boundingClientRect.bottom <= 90);
      },
      { threshold: 0, rootMargin: "-90px 0px 0px 0px" }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [isHome]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const transparent = isHome && !scrolled && !menuOpen;

  return (
    <>
    <header
      className={`${
        isHome ? "absolute" : "sticky"
      } top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        transparent
          ? "bg-transparent border-transparent"
          : "bg-cream/90 backdrop-blur-md border-b border-line"
      }`}
    >
      <nav className="flex items-center justify-between max-w-6xl mx-auto px-6 sm:px-8 py-5">
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          className={`font-serif text-xl font-medium ${
            transparent
              ? "text-cream drop-shadow-[0_1px_6px_rgba(59,42,40,0.8)]"
              : "text-ink"
          }`}
        >
          Pferdeliebe
          <span className={transparent ? "text-gold" : "text-rose-deep"}>
            healthy
          </span>
        </Link>

        <div
          className={`hidden md:flex gap-9 text-[14.5px] ${
            transparent
              ? "text-cream drop-shadow-[0_1px_6px_rgba(59,42,40,0.8)]"
              : "text-ink"
          }`}
        >
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:opacity-70 transition-opacity">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/#kontakt"
            onClick={() => setMenuOpen(false)}
            className={`hidden sm:inline-block text-sm font-medium px-5 py-2.5 rounded-full transition-colors ${
              transparent
                ? "bg-white text-ink
