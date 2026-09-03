import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ProduktKarte from "@/components/ProduktKarte";
import { kategorien, produkte, shopSichtbar, versandhinweis } from "@/lib/shop";
import { digitalprodukte, type DigitalProdukt } from "@/lib/digital";
import { preisText } from "@/lib/shop";
import { url } from "@/lib/seo";

// ---------------------------------------------------------------------------
// Der Shop: alles, was es zu kaufen gibt.
//
// ▸ WAS SICH AM 01.09.2026 GEÄNDERT HAT
//   Vorher standen hier nur die drei Futtermittel. Die elf digitalen Angebote
//   hatten zwar Verkaufsseiten, waren aber nirgends verlinkt: Wer nicht über
//   Google kam, fand sie nicht. Jetzt stehen sie hier oben, und ein Klick auf
//   eine Kachel führt auf die zugehörige Seite.
//
// ▸ WARUM DIE DIGITALEN OBEN STEHEN
//   Sie sind das, was Yasemin verkauft. Die Futtermittel sind ein Zusatz, und
//   sie sind zurzeit ohnehin ausgeblendet, weil der alte WooCommerce-Shop
//   noch läuft. Der Schalter dafür ist `shopSichtbar` in lib/shop.ts.
//
// ▸ WARUM NACH THEMA GRUPPIERT UND NICHT NUR NACH PREIS
//   Elf Angebote in einer Reihe sind eine Liste, aus der man aussteigt. Wer
//   ein Nachschlagewerk sucht, sucht nicht in den Kursen, und wer klein
//   anfangen will, will nicht zuerst die Ausbildung sehen. Innerhalb jeder
//   Gruppe steht das günstigste oben.
//
// ▸ ALLES KOMMT AUS lib/digital.ts UND lib/shop.ts. Ein neues Produkt
//   erscheint hier von selbst, sobald es dort steht. Es gibt keine zweite
//   Liste, die man vergessen könnte.
// ---------------------------------------------------------------------------

const TITEL = "Shop: Kurse, Werkzeuge und Futtermittel für dein Pferd";
const BESCHREIBUNG =
  "Vom kleinen Ratgeber bis zur Ausbildung: Kurse, Werkzeuge und persönliche Begleitung rund um die natürliche Fütterung deines Pferdes.";

export const metadata: Metadata = {
  alternates: { canonical: "/shop" },
  title: TITEL,
  description: BESCHREIBUNG,
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Pferdeliebehealthy",
    title: `${TITEL} | Pferdeliebehealthy`,
    description: BESCHREIBUNG,
    url: "/shop",
    images: [{ url: "/images/vorschau.jpg", width: 1200, height: 630 }],
  },
};

// ▸ NUR TITEL, KEIN BEISATZ.
//   Bis zum 02.09.2026 stand unter jeder Gruppenüberschrift noch ein Satz
//   („Kurze Hefte zu einer einzelnen Frage" und so weiter). Der ist raus:
//   Auf einer Übersicht will man die Ware sehen, nicht lesen, wie sie
//   gemeint ist. Erklärt wird auf der Produktseite, dort ist Platz dafür.
//   Auch die Konkurrenz führt ihre Kategorien ohne Beisatz.
const gruppen = [
  { schluessel: "einstieg" as const, titel: "Zum Einstieg" },
  { schluessel: "kurs" as const, titel: "Kurse" },
  { schluessel: "werkzeug" as const, titel: "Werkzeuge" },
  { schluessel: "begleitung" as const, titel: "Persönliche Begleitung" },
];

/** Ob ein Angebot noch nicht buchbar ist. Siehe `verkaufAb` in digital.ts. */
function nochNicht(p: DigitalProdukt): Date | null {
  if (!p.verkaufAb) return null;
  const start = new Date(`${p.verkaufAb}T00:00:00+02:00`);
  return new Date() < start ? start : null;
}

// ---------------------------------------------------------------------------
// ▸ DIE KACHELN SIND COVER, KEINE BILDSCHIRMFOTOS.
//
//   Bis zum 01.09.2026 stand in jeder Kachel ein Ausschnitt aus dem Programm.
//   Das sah nach Fehler aus: Ein Bildschirmfoto ist auf 380 Pixel Breite ein
//   grauer Fleck mit unlesbarer Schrift, und drei Kacheln hatten überhaupt
//   kein Bild, sondern ein Buchsymbol. Die Reihe wirkte zusammengewürfelt.
//
//   Der Blick zu Sarah Ullrich (pferdegesundhe.it, der größte Shop in dieser
//   Nische) zeigt, wie es dort gelöst ist: KEIN einziges Bildschirmfoto in
//   einer Kachel. Stattdessen trägt jedes Produkt ein Cover -- eine ruhige
//   Fläche mit einem farbigen Kasten darauf, in dem der Produktname steht.
//   Bei ihren zwölf Kräuterkram-Monaten ist es sogar zwölfmal derselbe
//   Hintergrund; unterschieden wird allein über den Kasten. Dazu eine
//   Rabattfahne, wo etwas reduziert ist.
//
//   Genau das steht hier, in deinen Farben: heller Grund je Gruppe, darauf
//   immer derselbe dunkle Kasten. Man erkennt auf einen Blick, was zusammen-
//   gehört, und liest den Namen auch auf dem Handy noch.
//
// ▸ WARUM DER GRUND NACH GRUPPE GEHT UND NICHT NACH PRODUKT
//   Weil es zurzeit nur drei brauchbare Fotos gibt. Ein Foto pro Produkt wäre
//   schöner, aber halb bebildert ist schlechter als gar nicht: Dann steht ein
//   Foto neben einer Farbfläche, und das sieht aus wie eine vergessene Datei.
//   Sobald Fotos da sind, kommt hier `foto` dazu -- eine Zeile pro Gruppe
//   oder, wenn gewünscht, pro Produkt.
//
// ▸ DAS BILDSCHIRMFOTO IST NICHT WEG.
//   Es steht weiter auf der Verkaufsseite, wo es groß genug ist, um etwas zu
//   zeigen. Nur in der Übersicht hat es nichts verloren.
// ---------------------------------------------------------------------------
const COVER: Record<
  DigitalProdukt["gruppe"],
  {
    grund: string;
    zeile: string;
    // `schnitt` sagt, welcher Teil des Fotos im Quadrat stehen bleibt. Das
    // muss je Foto anders sein: Beim Mähnenkamm ist das Interessante unten
    // links, bei dir und Helena sind es die Köpfe, also oben.
    foto?: { datei: string; alt: string; schnitt: string };
  }
> = {
  einstieg: { grund: "bg-cream-deep", zeile: "E-Book" },
  kurs: {
    grund: "bg-rose",
    zeile: "Online-Kurs",
    // Der Mähnenkamm ist das Bild, an dem in fast jedem Kurs etwas hängt:
    // Fell, Stoffwechsel, Fütterung. Als Hintergrund ist er ruhig genug,
    // dass der Kasten darauf noch liest.
    foto: {
      datei: "/images/kacheln/maehne.jpg",
      alt: "Nahaufnahme von Mähne und Fell",
      schnitt: "object-center",
    },
  },
  werkzeug: { grund: "bg-gold", zeile: "Werkzeug" },
  begleitung: {
    grund: "bg-ink",
    zeile: "Persönliche Begleitung",
    // Die Begleitung ist das Einzige, wo ein Mensch im Spiel ist. Deshalb
    // steht hier dein Foto und keine Farbfläche.
    foto: {
      datei: "/images/yasi-helena.jpg",
      alt: "Yasemin mit ihrer Stute Helena",
      schnitt: "object-[50%_72%]",
    },
  },
};

// ▸ WARUM DIE KLEINE ZEILE NICHT AUS `art` KOMMT.
//   `art` in digital.ts ist eine RECHTLICHE Einordnung („kurs",
//   „dienstleistung", „fernunterricht"). Sie entscheidet über Widerruf und
//   Rechnung, nicht darüber, was jemand kauft: Der Salzratgeber steht dort
//   als „kurs", ist aber ein Heft. Stünde „Online-Kurs" auf dem Cover, wäre
//   das schlicht falsch.
//
//   Deshalb hier eine eigene Beschriftung je Angebot. Wo nichts steht, gilt
//   die Zeile der Gruppe. Der Darmaufbau ist der Grund für diese Tabelle:
//   Er liegt bei den Kursen, ist aber ein E-Book -- so steht es auch in
//   seinem eigenen Kurztext.
// ▸ EIN EIGENES FOTO FÜR EINZELNE ANGEBOTE.
//   Was hier steht, sticht das Foto der Gruppe. So kann ein Bild nach dem
//   anderen dazukommen, ohne dass vorher alle fertig sein müssen: Wo noch
//   nichts steht, gilt weiter der Grund der Gruppe.
//
//   Die Bilder liegen zugeschnitten unter /images/kacheln/. Quadratisch und
//   900 Pixel, mehr braucht eine Kachel nicht, und kleinere Dateien laden
//   auf dem Handy schneller.
const FOTO: Record<
  string,
  { datei: string; alt: string; schnitt: string }
> = {
  salzratgeber: {
    datei: "/images/kacheln/salzleckstein.jpg",
    alt: "Pferd leckt an einem Salzleckstein an der Stallwand",
    schnitt: "object-center",
  },
  "magen-reset": {
    datei: "/images/kacheln/heunetz.jpg",
    alt: "Pferd frisst Heu aus einem engmaschigen Heunetz",
    schnitt: "object-center",
  },
  "symptom-navigator": {
    datei: "/images/kacheln/nuestern.jpg",
    alt: "Nahaufnahme der Nüstern eines Pferdes",
    schnitt: "object-center",
  },
  ratiopro: {
    datei: "/images/kacheln/messbecher.jpg",
    alt: "Messbecher mit Pellets neben einer Küchenwaage",
    schnitt: "object-center",
  },
  // ▸ DAS DRITTE BILD AN DIESER STELLE, UND DAS ERSTE BRAUCHBARE.
  //   Die erste Vorlage zeigte ein ganzes Pferd auf der Herbstweide, und
  //   daran stimmte einiges nicht: Die Vorderbeine setzten mitten am Bauch an
  //   statt an der Schulter, die Brust fehlte, von den Hinterbeinen war nur
  //   eines zu sehen, Hufe hatte es keine. Der Ausschnitt auf Kopf und Hals
  //   rettete das nur halb, dort zog sich das Pferd sichtbar in die Laenge.
  //   Enger ging nicht, der Kopf mass im Original nur 400 Pixel.
  //
  //   Jetzt ist es ein eigens erzeugtes Portraet: scharf, richtig gebaut, und
  //   das Herbstlaub bleibt, worum es beim Ganzjahresplan geht.
  //
  //   Merke fuer das naechste Mal: Ganzkoerperpferde aus einem Bildgenerator
  //   sind fast immer falsch gebaut, und wegschneiden hilft nur begrenzt.
  //   Gleich ein Portraet erzeugen lassen.
  ganzjahresfutterplan: {
    datei: "/images/kacheln/weide.jpg",
    alt: "Pferd auf der Weide vor herbstlichem Laub",
    schnitt: "object-center",
  },
  ausbildung: {
    datei: "/images/kacheln/buecher.jpg",
    alt: "Stapel Fachbücher zur Pferdefütterung, daneben ein Ordner und ein Notizbuch",
    schnitt: "object-center",
  },
  // Vier Schalen fuer vier Jahreszeiten: Heu, Pellets, Kraeuter, Mineral.
  // Das Foto von Yasemin und Helena stand hier kurz, steht aber weiter auf
  // der Verkaufsseite; in der Kachel passt das Jahresmotiv besser zum
  // Angebot.
  "pferdeliebe-365": {
    datei: "/images/kacheln/vier-schalen.jpg",
    alt: "Vier Schalen mit Heu, Pellets, Kräutern und Mineralpulver",
    schnitt: "object-center",
  },
  darmaufbau: {
    datei: "/images/kacheln/heu-cobs.jpg",
    alt: "Heu und Grascobs auf einem Holztisch",
    schnitt: "object-center",
  },
  basisfutterkurs: {
    datei: "/images/kacheln/futtereimer.jpg",
    alt: "Futtereimer mit Müsli aus Pellets, Flocken und Getreide",
    schnitt: "object-center",
  },
  "mineral-klarheit": {
    datei: "/images/kacheln/mineralfutter.jpg",
    alt: "Schale mit Mineralpulver neben einem Messbecher mit Pellets",
    schnitt: "object-center",
  },
  equidesk: {
    datei: "/images/kacheln/schreibtisch.jpg",
    alt: "Schreibtisch mit Laptop, Notizbuch und Kaffeetasse, daneben ein Halfter",
    schnitt: "object-center",
  },
};

// ▸ WO EIN LANGER NAME GETRENNT WERDEN DARF.
//   Auf dem Handy ist eine Kachel keine 130 Pixel breit, „Ganzjahresfutter-
//   plan" passt dort in keine Zeile. `hyphens-auto` trennt zwar nach den
//   Regeln der Seitensprache, aber nur, wenn der Browser deutsche
//   Trennmuster geladen hat. Chrome tut das nicht immer, und dann bricht
//   `break-words` hart mitten im Wort: „Ganzjahresfutt / erplan".
//
//   Das Zeichen unten (­) ist ein weiches Trennzeichen. Es ist
//   unsichtbar, solange das Wort in eine Zeile passt, und wird zum
//   Bindestrich, sobald umgebrochen werden muss. Damit sieht die Trennung in
//   jedem Browser gleich aus.
//
//   Nur Namen eintragen, bei denen es wirklich klemmt. Wer hier alles
//   einträgt, pflegt eine Liste, die niemand braucht.
const TRENNUNG: Record<string, string> = {
  ganzjahresfutterplan: "Ganzjahres­futterplan",
};

const ZEILE: Record<string, string> = {
  salzratgeber: "E-Book",
  "magen-reset": "E-Book",
  darmaufbau: "E-Book",
  "mineral-klarheit": "Online-Kurs",
  ganzjahresfutterplan: "Online-Kurs",
  basisfutterkurs: "Online-Kurs",
  "symptom-navigator": "Nachschlagewerk",
  ratiopro: "Rechner",
  equidesk: "Software",
  ausbildung: "Ausbildung",
  "pferdeliebe-365": "1:1 Begleitung",
};

function DigitalKarte({ p }: { p: DigitalProdukt }) {
  const start = nochNicht(p);
  const rabatt = Boolean(p.statt && p.statt > p.preis);
  // Die Fahne zeigt gerundete Prozent. Unter fünf Prozent bleibt sie weg:
  // „-3 %" wirkt kleinlich und lenkt vom Preis ab, der ohnehin darunter steht.
  const prozent = rabatt ? Math.round((1 - p.preis / p.statt!) * 100) : 0;
  const gruppenCover = COVER[p.gruppe];
  const foto = FOTO[p.slug] ?? gruppenCover.foto;
  const cover = { ...gruppenCover, foto };

  return (
    // ▸ `min-w-0` AUF DEM RASTERFELD, sonst laeuft die ganze Kachel aus dem
    //   Bildschirm. Rasterfelder haben wie Flex-Kinder `min-width: auto`: Die
    //   Spalte wird nie schmaler als ihr breitester Inhalt, auch wenn das
    //   Raster nur die halbe Bildschirmbreite hergibt. Auf dem Handy hat das
    //   die rechte Spalte ueber den Rand geschoben, samt Bild und Preis.
    //
    //   Am 02.09.2026 zweimal angefasst: Erst nur der Namenskasten, das hat
    //   den Text gerettet, aber nicht die Kachel. Erst mit dieser Zeile ist
    //   der waagerechte Ueberlauf weg.
    <li className="min-w-0">
      <Link
        href={`/${p.slug}`}
        className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[18px] border border-line bg-white transition-colors hover:border-rose-deep"
      >
        <div
          className={`relative aspect-square w-full overflow-hidden border-b border-line ${cover.grund}`}
        >
          {cover.foto && (
            <>
              {/* Das Foto ist Hintergrund, kein Inhalt: Der Name daneben sagt
                  schon alles, deshalb bleibt `alt` leer. Sonst liest ein
                  Screenreader die Kachel doppelt vor. */}
              <Image
                src={cover.foto.datei}
                alt=""
                fill
                sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw"
                className={`object-cover ${cover.foto.schnitt}`}
              />

              {/* ▸ NUR UNTEN ABDUNKELN, NICHT ÜBERALL.
                  Vorher lag eine gleichmäßige Schicht über dem ganzen Bild.
                  Der Kasten hob sich davon zwar ab, aber die Fotos wirkten
                  düster, gerade das Heunetz im Gegenlicht. Jetzt läuft die
                  Abdunklung von oben nach unten: Das Motiv bleibt hell, und
                  dort, wo der Kasten sitzt, ist der Grund ruhig genug. */}
              <span
                className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/5 to-ink/45"
                aria-hidden="true"
              />
            </>
          )}

          {rabatt && prozent >= 5 && (
            <span className="absolute left-0 top-5 z-10 bg-rose-deep px-3 py-1 text-[12px] font-semibold tabular-nums tracking-wide text-white">
              -{prozent} %
            </span>
          )}

          {/* ▸ DER NAME STEHT NUR HIER, NICHT NOCH EINMAL DARUNTER.
              Sonst stünde er zweimal untereinander. Es ist trotzdem die
              Überschrift der Kachel, deshalb ist es ein h3 -- die Gliederung
              der Seite bleibt damit richtig. */}
          {/* Bei einer Farbfläche steht der Kasten mittig, das ist die ruhige
              Anordnung. Auf einem Foto rutscht er nach unten -- sonst läge er
              genau auf dem Gesicht, und bei „Persönliche Begleitung" ist das
              Gesicht der Grund, warum das Foto überhaupt dort steht. */}
          <div
            className={`absolute inset-0 flex justify-center p-3 sm:p-6 ${
              cover.foto ? "items-end" : "items-center"
            }`}
          >
            {/* ▸ DER KASTEN IST EIN ETIKETT, KEIN AUFGEKLEBTER BLOCK.
                Erste Fassung war eine volle dunkle Fläche. Die saß auf dem
                Foto wie ein Pflaster. Drei Kleinigkeiten machen daraus ein
                Cover:

                - Er ist leicht durchscheinend und weichgezeichnet, das Motiv
                  darunter bleibt zu ahnen, statt abgedeckt zu sein.
                - Eine feine Linie läuft innen umlaufend mit. Das ist der
                  Griff, mit dem Buchumschläge seit jeher arbeiten, und er
                  kostet nichts an Lesbarkeit.
                - Der Name steht in der Schrift der Überschriften, die kleine
                  Zeile darunter gesperrt in Versalien. Zusammen liest sich
                  das als Titel und Untertitel, nicht als Beschriftung. */}
            <h3 className="relative w-full min-w-0 max-w-[88%] bg-ink/80 px-3 py-5 text-center text-cream shadow-lg backdrop-blur-[3px] sm:max-w-[78%] sm:px-5 sm:py-7">
              <span
                className="pointer-events-none absolute inset-[5px] border border-cream/25 sm:inset-[7px]"
                aria-hidden="true"
              />

              {/* ▸ HIER MUSS GETRENNT WERDEN, SONST LAEUFT DER NAME UEBER.
                  "Ganzjahresfutterplan" ist ein Wort und bricht von allein
                  nirgends um. Auf dem Handy ist eine Kachel keine 180 Pixel
                  breit, der Name sprengte den Kasten und ragte ueber den
                  Bildrand hinaus -- gemeldet am 02.09.2026 mit einem Foto vom
                  iPhone.

                  `hyphens-auto` trennt nach den Regeln der Seitensprache, und
                  die steht in app/layout.tsx auf "de". Daraus wird
                  "Ganzjahres-futterplan". `break-words` ist der Notnagel fuer
                  den Fall, dass ein Browser keine Trennmuster hat: Dann bricht
                  das Wort hart, aber es bricht.

                  ▸ NUR AM BILDSCHIRM PRUEFEN REICHT NICHT. Am Rechner ist die
                    Kachel breit genug, dort faellt es nicht auf.

                  ▸ UND DAS ALLEIN REICHTE NICHT. Der Kasten steckt in einem
                    Flex-Container, und Flex-Kinder haben `min-width: auto`:
                    Sie schrumpfen nicht unter die Breite ihres laengsten
                    Wortes, egal was `max-w` sagt. Erst `min-w-0` erlaubt das
                    Schrumpfen, und erst dann greifen Trennung und Umbruch.
                    Genau daran ist der erste Versuch gescheitert. */}
              <span className="relative block break-words hyphens-auto font-serif text-[14px] leading-tight sm:text-[19px] md:text-[21px]">
                {TRENNUNG[p.slug] ?? p.kurzname}
              </span>

              <span
                className="relative mx-auto mt-2 block h-px w-6 bg-cream/45 sm:mt-3 sm:w-9"
                aria-hidden="true"
              />

              {/* „NACHSCHLAGEWERK" ist gesperrt fast so breit wie die Kachel.
                  Deshalb auf dem Handy weniger Sperrung und Umbruch erlaubt. */}
              <span className="relative mt-2 block break-words text-[8.5px] font-semibold uppercase tracking-[0.1em] text-cream/75 sm:mt-3 sm:text-[10.5px] sm:tracking-[0.18em]">
                {ZEILE[p.slug] ?? cover.zeile}
              </span>
            </h3>
          </div>
        </div>

        <div className="flex flex-grow flex-col p-4 sm:p-7">
          <p className="mb-4 flex-grow text-[13px] leading-relaxed text-ink-soft sm:mb-5 sm:text-[14.5px]">
            {p.kurz}
          </p>

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            {rabatt && (
              <span className="text-[12.5px] text-ink-soft line-through tabular-nums sm:text-[14px]">
                {preisText(p.statt!)}
              </span>
            )}
            <span className="font-serif text-[18px] tabular-nums sm:text-[22px]">
              {preisText(p.preis)}
            </span>

            {/* Ein Angebot, das noch nicht buchbar ist, gehört trotzdem in die
                Übersicht: Es baut Vorfreude auf. Verschwiegen werden darf der
                Starttermin aber nicht, sonst klickt jemand und stößt an der
                Kasse auf eine Absage. */}
            {start && (
              <span className="text-[13.5px] text-rose-deep">
                ab {start.toLocaleDateString("de-DE")}
              </span>
            )}
          </div>
        </div>
      </Link>
    </li>
  );
}

export default function ShopSeite() {
  return (
    <main>
      {/* ----------------------------------------------------------- Kopf */}
      {/* ▸ EIN SCHMALER FARBBALKEN MIT EINEM WORT, MEHR NICHT.
          Vorher stand hier ein dunkler Block mit Überschrift und einem
          Absatz Fließtext. Zwei Dinge stimmten daran nicht: Das Dunkel war
          zu schwer für eine Seite, auf der es ums Aussuchen geht, und der
          Text erklärte etwas, das niemand liest, der gerade stöbern will.

          Der Blick zur Konkurrenz (pferdegesundhe.it) zeigt dieselbe Lösung
          wie in jedem gewachsenen Shop: ein flacher Balken in der
          Markenfarbe, darin zentriert der Name der Kategorie in Versalien.
          Kein Satz, keine Einleitung. Wer hier ankommt, will die Ware sehen,
          und die beginnt eine Bildschirmhöhe früher als vorher.

          Der Titel und die Beschreibung für Google stehen weiter oben in
          `metadata`, dort gehen sie durch diese Kürzung nicht verloren. */}
      <section className="bg-rose-deep px-6 py-10 text-center sm:px-8 sm:py-12">
        <h1 className="font-serif text-[26px] font-normal uppercase tracking-[0.18em] text-white sm:text-[32px]">
          Shop
        </h1>
      </section>

      {gruppen.map((g) => {
        const dieser = digitalprodukte
          .filter((p) => p.gruppe === g.schluessel)
          .sort((a, b) => a.preis - b.preis);

        if (dieser.length === 0) return null;

        return (
          <section key={g.schluessel} className="px-6 py-14 sm:px-8 sm:py-16">
            <div className="mx-auto max-w-6xl">
              <h2 className="mb-8 font-serif text-[26px] font-normal leading-[1.15] tracking-tight sm:text-[32px]">
                {g.titel}
              </h2>

              {/* Auf dem Handy stehen ZWEI Kacheln nebeneinander, nicht eine.
                  Eine einzelne quadratische Kachel füllt sonst den halben
                  Bildschirm, und man scrollt an drei Angeboten vorbei, bevor
                  das vierte kommt. Zwei nebeneinander ist auch das, was jeder
                  Shop macht -- man sieht sofort, dass es eine Auswahl ist. */}
              <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
                {dieser.map((p) => (
                  <DigitalKarte key={p.slug} p={p} />
                ))}
              </ul>
            </div>
          </section>
        );
      })}

      {/* ---------------------------------------------------- Futtermittel */}
      {/* Nur, wenn der Futtershop freigeschaltet ist. Solange der alte
          WooCommerce-Shop noch läuft, wären es zwei Shops mit getrennten
          Beständen. Der Schalter sitzt in lib/shop.ts. */}
      {shopSichtbar && (
        <>
          {kategorien.map((k) => {
            const dieser = produkte.filter((p) => p.kategorie === k.schluessel);

            if (dieser.length === 0) return null;

            return (
              <section
                key={k.schluessel}
                className="px-6 py-14 sm:px-8 sm:py-16"
              >
                <div className="mx-auto max-w-6xl">
                  <h2 className="mb-8 font-serif text-[26px] font-normal leading-[1.15] tracking-tight sm:text-[32px]">
                    {k.name}
                  </h2>

                  <ul className="grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {dieser.map((p) => (
                      <ProduktKarte key={p.slug} produkt={p} />
                    ))}
                  </ul>
                </div>
              </section>
            );
          })}

          <section className="px-6 pb-14 sm:px-8">
            <div className="mx-auto max-w-6xl">
              <div className="max-w-3xl rounded-[18px] bg-cream-deep p-6 sm:p-7">
                <h2 className="font-serif text-[19px]">Gut zu wissen</h2>

                <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
                  Alle Preise verstehen sich inklusive Mehrwertsteuer und
                  zuzüglich Versandkosten. {versandhinweis}{" "}
                  Ergänzungsfuttermittel sind kein Arzneimittel. Sie ersetzen
                  weder eine tierärztliche Behandlung noch eine
                  bedarfsgerechte Grundration aus Heu und Weide. Wenn du
                  unsicher bist, ob etwas zu deinem Pferd passt, mach lieber
                  erst den{" "}
                  <Link
                    href="/futter-check"
                    className="text-rose-deep underline underline-offset-4 hover:text-ink"
                  >
                    Futter-Check
                  </Link>
                  .
                </p>

                <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
                  Alles zu Bezahlung, Lieferzeiten und Rückgabe steht auf der
                  Seite{" "}
                  <Link
                    href="/zahlung-und-versand"
                    className="text-rose-deep underline underline-offset-4 hover:text-ink"
                  >
                    Zahlung und Versand
                  </Link>
                  .
                </p>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ------------------------------------------------------- Was fehlt */}
      {/* Der Insider kostet nichts und taucht deshalb in keiner Preisgruppe
          auf. Ihn ganz zu verschweigen wäre trotzdem schade. */}
      <section className="px-6 pb-20 sm:px-8 sm:pb-28">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[24px] bg-cream-deep p-8 sm:p-12">
            <div className="max-w-2xl">
              <h2 className="mb-4 font-serif text-[24px] font-normal leading-[1.15] tracking-tight sm:text-[30px]">
                Und etwas, das nichts kostet.
              </h2>

              <p className="mb-6 text-[16px] leading-relaxed text-ink-soft">
                Der Pferdeliebe Insider ist mein kostenloser Kanal: regelmäßig
                ein Thema aus der Praxis, was in echten Rationen schiefgeht,
                Zusatzfutter ehrlich eingeordnet, Laborwerte lesen lernen.
                Dazu jeden Monat eine Empfehlung mit Rabattcode.
              </p>

              <Link
                href="/insider"
                className="inline-block rounded-full bg-ink px-7 py-3.5 text-[15px] font-medium text-cream transition-colors hover:bg-rose-deep"
              >
                Insider werden
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sagt Google, dass hier eine Produktliste steht. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Shop von Pferdeliebehealthy",
            itemListElement: [
              ...digitalprodukte.map((p, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: url(`/${p.slug}`),
                name: p.name,
              })),
              ...(shopSichtbar
                ? produkte.map((p, i) => ({
                    "@type": "ListItem",
                    position: digitalprodukte.length + i + 1,
                    url: url(`/shop/${p.slug}`),
                    name: p.name,
                  }))
                : []),
            ],
          }),
        }}
      />
    </main>
  );
}
