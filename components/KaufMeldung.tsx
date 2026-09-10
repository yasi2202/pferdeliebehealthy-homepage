"use client";

import { useEffect, useRef } from "react";
import { melde } from "@/lib/messung";

// ---------------------------------------------------------------------------
// Meldet einen bezahlten Kauf an die Werbemessung.
//
// ▸ ER STEHT AUF DER DANKESEITE, ABER NICHT AUF JEDER. Die Dankeseite lässt
//   sich von jedem aufrufen; nur mit gültigem Schlüssel steht dort ein
//   wirklich bezahlter Kauf. Deshalb wird dieser Baustein von der Seite nur
//   dann eingesetzt, wenn der Kauf geprüft und bezahlt ist. Sonst zählte
//   Meta Käufe, die es nie gab, und suchte die Anzeigen danach aus.
//
// ▸ DIE BESTELLNUMMER IST DIE EREIGNISKENNUNG. Wer die Seite neu lädt oder
//   den Link später noch einmal öffnet, löst dieselbe Nummer aus, und Meta
//   zählt sie nur einmal.
//
// Der Betrag kommt in Cent herein, weil er in der Datenbank so steht. Meta
// will Euro, deshalb die Teilung hier und nicht an der Aufrufstelle.
// ---------------------------------------------------------------------------

export default function KaufMeldung({
  nummer,
  centBetrag,
  artikel,
}: {
  nummer: string;
  centBetrag: number;
  artikel: string[];
}) {
  const schonGemeldet = useRef(false);

  useEffect(() => {
    if (schonGemeldet.current) return;
    schonGemeldet.current = true;
    melde(
      "Purchase",
      {
        value: Math.round(centBetrag) / 100,
        currency: "EUR",
        content_name: artikel.join(", "),
        content_type: "product",
      },
      nummer,
    );
  }, [nummer, centBetrag, artikel]);

  return null;
}
