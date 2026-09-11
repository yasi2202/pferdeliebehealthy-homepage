"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CSSProperties, MouseEvent, ReactNode } from "react";

// ---------------------------------------------------------------------------
// Ein Link zur Kasse, der die Herkunft aus der Adresse mitnimmt.
//
// ▸ WOZU: Eine Anzeige führt auf die Verkaufsseite, etwa
//   /mineral-klarheit?von=meta-zink. Gekauft wird aber eine Seite weiter, in
//   der Kasse. Ohne diesen Link käme die Kasse ohne ?von= an, und der Kauf
//   stünde ohne Herkunft in der Datenbank. Dann wüsste /admin/werbung nicht,
//   welche Anzeige Geld gebracht hat.
//
// ▸ WARUM ÜBER DIE ADRESSE UND NICHT IM BROWSER GESPEICHERT: Etwas im Browser
//   abzulegen, das nicht unbedingt nötig ist, verlangt nach § 25 TDDDG eine
//   Einwilligung. Die Herkunft einer Anzeige ist nicht unbedingt nötig. Über
//   die Adresse weitergereicht wird nichts abgelegt, und die Kasse liest den
//   Wert erst beim Klick aus der Adresse, genau wie den Kulanzschlüssel.
//
// Ohne ?von= in der Adresse ist er ein ganz normaler Link. Ein Klick mit
// gedrückter Strg- oder Umschalttaste (neuer Tab) geht ebenfalls den normalen
// Weg; die Herkunft fehlt dann, aber der Kauf klappt.
// ---------------------------------------------------------------------------

export default function KasseLink({
  href,
  className,
  style,
  children,
}: {
  href: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const router = useRouter();

  function klick(e: MouseEvent<HTMLAnchorElement>) {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const von = new URLSearchParams(window.location.search).get("von");
    const sauber = (von || "").toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 40);
    if (!sauber) return;
    e.preventDefault();
    router.push(`${href}${href.includes("?") ? "&" : "?"}von=${encodeURIComponent(sauber)}`);
  }

  return (
    <Link href={href} className={className} style={style} onClick={klick}>
      {children}
    </Link>
  );
}
