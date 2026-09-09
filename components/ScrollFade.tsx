"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// ---------------------------------------------------------------------------
// Das sanfte Einblenden beim Scrollen.
//
// AM 09.09.2026 UMGEBAUT. Vorher lief es so: Sobald das Skript ansprang, kam
// "js-fade-ready" ans html-Element, und damit sprangen ALLE 48 Abschnitte der
// Startseite auf einen Schlag auf opacity 0. Auch die, die gerade auf dem
// Bildschirm standen.
//
// Das hatte zwei Folgen, beide teuer:
//
// 1. Sichtbar. Der erste Bildschirm war schon aufgebaut, dann verschwand er
//    und kam über eine Dreiviertelsekunde zurück. Google misst genau das als
//    Speed Index, also wie lange es dauert, bis das Bild fertig dasteht, und
//    die Seite lag dort bei 4,5 Sekunden. Für die Besucherin sieht es aus wie
//    ein Flackern, nicht wie eine Animation.
//
// 2. Rechenzeit. 48 Elemente gleichzeitig auf durchsichtig, verschoben und
//    mit einer Überblendung versehen, das ist eine Neuberechnung des ganzen
//    Seitenlayouts in dem Moment, in dem der Browser eigentlich das erste
//    Bild malen soll.
//
// Jetzt wird zuerst geschaut, was ohnehin schon im Bild steht. Das bleibt
// stehen und wird gar nicht erst versteckt. Erst danach kommt
// "js-fade-ready" dazu, und nur was darunter liegt, blendet sich beim
// Scrollen ein. Sichtbar ist der Unterschied nur oben: Der erste Bildschirm
// flackert nicht mehr. Alles Weitere blendet sich ein wie vorher.
//
// Die Masse und Position der Elemente liefert der Beobachter selbst mit
// (boundingClientRect). Sie eigens abzufragen wäre der falsche Weg: Das
// zwingt den Browser, sofort das ganze Layout durchzurechnen, also genau
// das, was hier eingespart werden soll.
//
// DER NOTNAGEL IST WEG, und das mit Absicht. Früher stand hier ein Zeitgeber,
// der nach 2,5 Sekunden alles sichtbar schaltete, falls der Beobachter
// versagt. Er war nicht nur unnötig, er hat den Zweck aufgehoben: Nach 2,5
// Sekunden war die ganze Seite eingeblendet, wer danach nach unten scrollte,
// sah keine Animation mehr. Unnötig ist er, weil versteckt jetzt erst wird,
// nachdem der Beobachter sich gemeldet hat. Meldet er sich nie, wird auch
// nichts versteckt, und alles steht einfach da.
// ---------------------------------------------------------------------------

export default function ScrollFade() {
  // Der Pfad steht bewusst in den Abhaengigkeiten des Effekts weiter unten.
  //
  // Ohne ihn lief das hier nur ein einziges Mal, beim allerersten Laden.
  // Wer auf eine Unterseite ging und ueber das Menue zurueckkam, bekam eine
  // vollstaendig leere Startseite: der Inhalt war neu aufgebaut, der
  // Beobachter kannte ihn nicht mehr, und "js-fade-ready" stand weiterhin
  // am html-Element -- also blieb alles auf opacity 0 stehen.
  const pfad = usePathname();

  useEffect(() => {
    let ersteMeldung = true;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            return;
          }

          // Nur beim allerersten Durchgang: Was zwar noch nicht zu 15 Prozent
          // im Bild ist, aber mit einem Zipfel hereinragt, darf auch nicht
          // verschwinden. Sonst blinkt der untere Rand des ersten
          // Bildschirms.
          if (ersteMeldung) {
            const r = e.boundingClientRect;
            if (r.top < window.innerHeight && r.bottom > 0) {
              e.target.classList.add("visible");
            }
          }
        });

        // Erst jetzt verstecken, was übrig ist. Vorher nicht: Bis hierher
        // weiss niemand, was auf dem Bildschirm steht.
        if (ersteMeldung) {
          ersteMeldung = false;
          document.documentElement.classList.add("js-fade-ready");
        }
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll(".fade-in").forEach((el) => obs.observe(el));

    return () => obs.disconnect();
  }, [pfad]);

  return null;
}
