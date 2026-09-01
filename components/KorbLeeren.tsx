"use client";

// ---------------------------------------------------------------------------
// Leert den Warenkorb, sobald die Dankeseite geladen ist.
//
// Bewusst erst hier und nicht schon beim Absprung zu Stripe: Wer die
// Bezahlung abbricht und zurückkommt, soll seinen Warenkorb noch vorfinden
// und nicht alles neu zusammensuchen müssen.
// ---------------------------------------------------------------------------

import { useEffect } from "react";
import { useWarenkorb } from "@/components/WarenkorbProvider";

export default function KorbLeeren() {
  const { leere, bereit } = useWarenkorb();

  useEffect(() => {
    if (bereit) {
      leere();
    }
  }, [bereit, leere]);

  return null;
}
