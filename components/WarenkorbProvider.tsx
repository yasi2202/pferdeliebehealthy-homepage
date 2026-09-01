"use client";

// ---------------------------------------------------------------------------
// Der Warenkorb.
//
// Er liegt im Browser der Besucherin (localStorage), nicht auf dem Server.
// Damit bleibt er beim Neuladen erhalten, ohne dass irgendwo ein Cookie
// gesetzt oder etwas über die Besucherin gespeichert wird. Kein Cookie-Banner,
// keine Datenschutzfrage.
//
// ▸ WICHTIG: Gespeichert wird nur `slug` und `menge`, niemals ein Preis.
//   Der Preis kommt bei jeder Anzeige frisch aus lib/shop.ts. Zwei Gründe:
//   Erstens wirkt eine Preisänderung sofort und nicht erst, wenn jemand
//   seinen alten Warenkorb leert. Zweitens könnte sonst jemand die
//   gespeicherten Daten im Browser bearbeiten und sich selbst einen Preis
//   von 1 Cent eintragen. Auch beim Bezahlen wird noch einmal serverseitig
//   nachgeschlagen, siehe app/api/kasse/route.ts.
// ---------------------------------------------------------------------------

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { produktFinden, type Produkt } from "@/lib/shop";

const SCHLUESSEL = "pfh_warenkorb";

/** Was im Browser liegt: nur Kennung und Anzahl. */
export type KorbEintrag = {
  slug: string;
  menge: number;
};

/** Was die Seiten daraus machen: der Eintrag plus das ganze Produkt. */
export type KorbZeile = KorbEintrag & {
  produkt: Produkt;
  zwischensumme: number;
};

type WarenkorbWert = {
  /** Zeilen mit aufgelöstem Produkt. Produkte, die es nicht mehr gibt,
   *  fallen still heraus. */
  zeilen: KorbZeile[];
  /** Summe aller Artikel in Cent, ohne Versand. */
  summe: number;
  /** Gesamtzahl der Stücke, für den Zähler in der Kopfzeile. */
  anzahl: number;
  legeRein: (slug: string, menge?: number) => void;
  setzeMenge: (slug: string, menge: number) => void;
  nimmRaus: (slug: string) => void;
  leere: () => void;
  ladeOffen: boolean;
  oeffneLade: () => void;
  schliesseLade: () => void;
  /** Erst nach dem ersten Laden im Browser true. Vorher darf nichts vom
   *  Korbinhalt gezeichnet werden, sonst weicht die erste Zeichnung von der
   *  auf dem Server ab und React beschwert sich. */
  bereit: boolean;
};

const Zusammenhang = createContext<WarenkorbWert | null>(null);

function lies(): KorbEintrag[] {
  try {
    const roh = window.localStorage.getItem(SCHLUESSEL);

    if (!roh) {
      return [];
    }

    const daten = JSON.parse(roh);

    if (!Array.isArray(daten)) {
      return [];
    }

    return daten
      .filter(
        (e): e is KorbEintrag =>
          e &&
          typeof e.slug === "string" &&
          typeof e.menge === "number" &&
          e.menge > 0,
      )
      .map((e) => ({ slug: e.slug, menge: Math.min(99, Math.round(e.menge)) }));
  } catch {
    // Kaputter Inhalt oder ein Browser, der localStorage sperrt (privates
    // Fenster, strenge Einstellung). Dann fängt der Korb eben leer an.
    return [];
  }
}

export default function WarenkorbProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [eintraege, setEintraege] = useState<KorbEintrag[]>([]);
  const [bereit, setBereit] = useState(false);
  const [ladeOffen, setLadeOffen] = useState(false);

  // Einmal beim Start aus dem Browser lesen.
  useEffect(() => {
    setEintraege(lies());
    setBereit(true);
  }, []);

  // Bei jeder Änderung zurückschreiben, aber erst nachdem gelesen wurde --
  // sonst würde der leere Anfangszustand einen vollen Korb überschreiben.
  useEffect(() => {
    if (!bereit) {
      return;
    }

    try {
      window.localStorage.setItem(SCHLUESSEL, JSON.stringify(eintraege));
    } catch {
      // Kein Speicher verfügbar. Der Korb hält dann nur, solange die Seite
      // offen ist. Das ist unschön, aber kein Grund für eine Fehlermeldung.
    }
  }, [eintraege, bereit]);

  // Zwei offene Tabs sollen denselben Korb sehen.
  useEffect(() => {
    const beiAenderung = (e: StorageEvent) => {
      if (e.key === SCHLUESSEL) {
        setEintraege(lies());
      }
    };

    window.addEventListener("storage", beiAenderung);

    return () => window.removeEventListener("storage", beiAenderung);
  }, []);

  // Solange die Lade offen ist, soll die Seite dahinter nicht scrollen.
  useEffect(() => {
    document.body.style.overflow = ladeOffen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [ladeOffen]);

  const legeRein = useCallback((slug: string, menge = 1) => {
    setEintraege((alt) => {
      const da = alt.find((e) => e.slug === slug);

      if (da) {
        return alt.map((e) =>
          e.slug === slug ? { ...e, menge: Math.min(99, e.menge + menge) } : e,
        );
      }

      return [...alt, { slug, menge: Math.min(99, menge) }];
    });
  }, []);

  const setzeMenge = useCallback((slug: string, menge: number) => {
    setEintraege((alt) =>
      menge < 1
        ? alt.filter((e) => e.slug !== slug)
        : alt.map((e) =>
            e.slug === slug ? { ...e, menge: Math.min(99, menge) } : e,
          ),
    );
  }, []);

  const nimmRaus = useCallback((slug: string) => {
    setEintraege((alt) => alt.filter((e) => e.slug !== slug));
  }, []);

  const leere = useCallback(() => setEintraege([]), []);

  const wert = useMemo<WarenkorbWert>(() => {
    const zeilen: KorbZeile[] = eintraege
      .map((e) => {
        const produkt = produktFinden(e.slug);

        if (!produkt) {
          return null;
        }

        return {
          ...e,
          produkt,
          zwischensumme: produkt.preis * e.menge,
        };
      })
      .filter((z): z is KorbZeile => z !== null);

    return {
      zeilen,
      summe: zeilen.reduce((s, z) => s + z.zwischensumme, 0),
      anzahl: zeilen.reduce((s, z) => s + z.menge, 0),
      legeRein,
      setzeMenge,
      nimmRaus,
      leere,
      ladeOffen,
      oeffneLade: () => setLadeOffen(true),
      schliesseLade: () => setLadeOffen(false),
      bereit,
    };
  }, [eintraege, legeRein, setzeMenge, nimmRaus, leere, ladeOffen, bereit]);

  return <Zusammenhang.Provider value={wert}>{children}</Zusammenhang.Provider>;
}

export function useWarenkorb(): WarenkorbWert {
  const wert = useContext(Zusammenhang);

  if (!wert) {
    throw new Error(
      "useWarenkorb braucht den WarenkorbProvider. Er steht in app/layout.tsx.",
    );
  }

  return wert;
}
