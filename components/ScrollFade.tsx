"use client";

import { useEffect } from "react";

export default function ScrollFade() {
  useEffect(() => {
    // Only hide/animate elements once we know JS is actually running.
    // Without this, a slow or blocked script would leave content stuck
    // at opacity:0 (set purely in CSS) with nothing to bring it back.
    document.documentElement.classList.add("js-fade-ready");

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll(".fade-in").forEach((el) => obs.observe(el));

    // Safety net: if for any reason an element never gets observed as
    // intersecting (e.g. it starts already in view before the observer
    // attaches, or the observer API misbehaves), reveal everything after
    // a short delay so nothing is permanently invisible.
    const fallback = window.setTimeout(() => {
      document.querySelectorAll(".fade-in:not(.visible)").forEach((el) => {
        el.classList.add("visible");
      });
    }, 2500);

    return () => {
      obs.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return null;
}
