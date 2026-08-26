"use client";

import { useEffect } from "react";
import { merkeInsider } from "@/lib/insider-merker";

// ---------------------------------------------------------------------------
// Markiert diesen Browser als Insider. Zeigt selbst nichts an.
//
// Steht auf der Bestätigungsseite: Wer den Link aus der Bestätigungsmail
// anklickt, ist ab jetzt Insider — auch dann, wenn er sich auf einem anderen
// Gerät eingetragen hat und die Mail hier öffnet.
// ---------------------------------------------------------------------------

export default function InsiderMerken() {
  useEffect(() => {
    merkeInsider();
  }, []);
  return null;
}
