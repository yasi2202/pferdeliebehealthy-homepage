import type { Metadata } from "next";
import Link from "next/link";
import { adminEingerichtet, istAngemeldet } from "@/lib/admin-zugang";
import { supabaseAlle } from "@/lib/versand";
import { KAMPAGNEN, metaTag, metaZahlen, tagPlus, tageZwischen } from "@/lib/werbung";

// ---------------------------------------------------------------------------
// Die Auswertung der Meta-Werbung.
//
// ▸ WOZU: Vorher schrieb Yasemin jeden Morgen drei Zahlen von Hand in eine
//   Tabelle. Was eine Anzeige gebracht hat, steht aber ohnehin in der eigenen
//   Datenbank, und die Ausgaben kann Meta liefern. Diese Seite legt beides
//   nebeneinander und rechnet die Kosten je Ergebnis selbst aus.
//
// ▸ WAS ALS ERGEBNIS ZÄHLT, hängt an der Kampagne (`ziel` in lib/werbung.ts):
//   - Anmeldungen: die BESTÄTIGTE Equista-Anmeldung. Nur wer den Zugangslink
//     anklickt, bekommt die Mailstrecke, und nur daran verdient die Werbung.
//   - Verkauf: der bezahlte Kauf. Zum Umsatz einer Anzeige gehört auch das
//     angenommene Angebot danach (Upsell), denn ohne die Anzeige gäbe es auch
//     das nicht. Es hängt über `gehoert_zu` am ersten Kauf.
//   Was Meta selbst zählt, steht jeweils daneben als Gegenprobe. Meta sieht
//   nur, wer der Messung zugestimmt hat.
//
// ▸ TAGE SIND META-TAGE, 9 bis 9 Uhr deutscher Zeit. Siehe lib/werbung.ts.
// ---------------------------------------------------------------------------

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Werbung",
  robots: { index: false, follow: false },
};

type Anmeldung = { quelle: string | null; bestaetigt: boolean; erstellt_am: string };
type Bestellung = {
  nummer: string;
  quelle: string | null;
  gehoert_zu: string | null;
  gesamt: number;
  bezahlt_am: string | null;
};

/** Ein Ergebnis mit dem Meta-Tag, an dem es entstand, und dem Geld dazu. */
type Ergebnis = { anzeige: string; tag: string; cent: number };

const GUT = "#4C7A57";
const STOP = "#A8443F";

function euro(z: number) {
  return z.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

function kurzDatum(tag: string) {
  const [, m, t] = tag.split("-");
  return `${t}.${m}.`;
}

export default async function WerbeAuswertung({
  searchParams,
}: {
  searchParams: Promise<{ k?: string }>;
}) {
  if (!adminEingerichtet() || !(await istAngemeldet())) {
    return (
      <main className="px-6 py-20">
        <div className="mx-auto max-w-lg text-center">
          <p className="text-[15px] text-ink-soft">
            Bitte zuerst{" "}
            <Link href="/admin" className="text-rose-deep underline underline-offset-2">
              anmelden
            </Link>
            .
          </p>
        </div>
      </main>
    );
  }

  // Welche Kampagne? Ohne Angabe die neueste.
  const { k: wahl } = await searchParams;
  const index =
    wahl !== undefined && /^\d+$/.test(wahl) && Number(wahl) < KAMPAGNEN.length
      ? Number(wahl)
      : KAMPAGNEN.length - 1;
  const k = KAMPAGNEN[index];
  const verkauf = k.ziel === "verkauf";
  const wort = verkauf
    ? { einzahl: "Kauf", mehrzahl: "Käufe", je: "Je Kauf" }
    : { einzahl: "Anmeldung", mehrzahl: "Anmeldungen", je: "Je Anmeldung" };

  const heute = metaTag(new Date());
  const letzterTag = tagPlus(k.start, k.tage - 1);
  const bis = heute < letzterTag ? heute : letzterTag;
  const tagNummer = Math.min(Math.max(tageZwischen(k.start, heute) + 1, 0), k.tage);
  const laeuftNoch = heute <= letzterTag;
  const imZeitraum = (zeit: string) => {
    const t = metaTag(zeit);
    return t >= k.start && t <= letzterTag;
  };

  // Einen Tag früher abfragen und dann nach Meta-Tag sieben. Die Datenbank
  // speichert Weltzeit, und der erste Meta-Tag beginnt dort erst um 7 Uhr.
  const abfrageAb = tagPlus(k.start, -1);

  const ergebnisse: Ergebnis[] = [];
  let offenJe: Record<string, number> = {};
  let ohneAnzeige = 0;
  let umsatzOhneAnzeige = 0;
  let spalteFehlt = false;

  if (!verkauf) {
    const roh =
      (await supabaseAlle<Anmeldung>(
        `stall_anmeldungen?select=quelle,bestaetigt,erstellt_am&erstellt_am=gte.${abfrageAb}&order=erstellt_am`,
      )) ?? [];
    const zeitraum = roh.filter((a) => imZeitraum(a.erstellt_am));
    offenJe = {};
    for (const a of zeitraum) {
      const q = a.quelle || "";
      if (!q.startsWith("meta-")) {
        ohneAnzeige += 1;
        continue;
      }
      const anzeige = q.slice(5);
      if (a.bestaetigt) ergebnisse.push({ anzeige, tag: metaTag(a.erstellt_am), cent: 0 });
      else offenJe[anzeige] = (offenJe[anzeige] ?? 0) + 1;
    }
  } else {
    // Ohne die Spalte `quelle` (datenbank/werbung-quelle.sql) scheitert die
    // Abfrage. Dann steht oben ein Hinweis, statt still null Käufe zu zeigen.
    const roh = await supabaseAlle<Bestellung>(
      `digitalbestellungen?select=nummer,quelle,gehoert_zu,gesamt,bezahlt_am&status=eq.bezahlt&bezahlt_am=gte.${abfrageAb}`,
    );
    if (roh === null) {
      spalteFehlt = true;
    } else {
      const erste = roh.filter((b) => !b.gehoert_zu && b.bezahlt_am && imZeitraum(b.bezahlt_am));
      const angebote = roh.filter((b) => b.gehoert_zu);
      for (const b of erste) {
        const dazu = angebote
          .filter((a) => a.gehoert_zu === b.nummer)
          .reduce((s, a) => s + (a.gesamt || 0), 0);
        const cent = (b.gesamt || 0) + dazu;
        const q = b.quelle || "";
        if (q.startsWith("meta-")) {
          ergebnisse.push({ anzeige: q.slice(5), tag: metaTag(b.bezahlt_am as string), cent });
        } else {
          ohneAnzeige += 1;
          umsatzOhneAnzeige += cent;
        }
      }
    }
  }

  const meta = await metaZahlen(k, bis);
  const metaDa = meta.stand === "ok";
  const metaZeilen = meta.stand === "ok" ? meta.zeilen : [];

  // Je Anzeige
  const jeAnzeige = k.anzeigen.map((a) => {
    const eigene = ergebnisse.filter((e) => e.anzeige === a.name);
    const anzahl = eigene.length;
    const umsatz = eigene.reduce((s, e) => s + e.cent, 0) / 100;
    const m = metaZeilen.filter((z) => z.anzeige === a.name);
    const ausgabe = m.reduce((s, z) => s + z.ausgabe, 0);
    const klicks = m.reduce((s, z) => s + z.klicks, 0);
    const metaZaehlt = m.reduce((s, z) => s + (verkauf ? z.kaeufe : z.leads), 0);
    const kassen = m.reduce((s, z) => s + z.kassen, 0);
    const jeErgebnis = metaDa && anzahl > 0 ? ausgabe / anzahl : null;
    return { ...a, anzahl, offen: offenJe[a.name] ?? 0, umsatz, ausgabe, klicks, metaZaehlt, kassen, jeErgebnis };
  });

  const summeAnzahl = jeAnzeige.reduce((s, a) => s + a.anzahl, 0);
  const summeAusgabe = jeAnzeige.reduce((s, a) => s + a.ausgabe, 0);
  const summeKlicks = jeAnzeige.reduce((s, a) => s + a.klicks, 0);
  const summeUmsatz = jeAnzeige.reduce((s, a) => s + a.umsatz, 0);
  const summeJe = metaDa && summeAnzahl > 0 ? summeAusgabe / summeAnzahl : null;

  // Je Tag
  const tage: { tag: string; nummer: number; je: Record<string, number>; summe: number; ausgabe: number }[] = [];
  for (let i = 0; i <= tageZwischen(k.start, bis); i++) {
    const tag = tagPlus(k.start, i);
    const je: Record<string, number> = {};
    for (const a of k.anzeigen) {
      je[a.name] = ergebnisse.filter((e) => e.anzeige === a.name && e.tag === tag).length;
    }
    tage.push({
      tag,
      nummer: i + 1,
      je,
      summe: Object.values(je).reduce((s, n) => s + n, 0),
      ausgabe: metaZeilen.filter((z) => z.tag === tag).reduce((s, z) => s + z.ausgabe, 0),
    });
  }
  tage.reverse(); // der neueste Tag oben

  // Nachgesehen wird am Morgen nach dem Meta-Tag, wenn er abgeschlossen ist.
  // Tag 5 endet am Morgen des sechsten Tages um 9 Uhr deutscher Zeit.
  const punkte =
    k.tage >= 14
      ? [
          { nummer: 5, was: "Zwischenstand ansehen" },
          { nummer: 7, was: "Abschaltregel anwenden" },
          { nummer: k.tage, was: "Entscheiden und die nächste Runde planen" },
        ]
      : [
          { nummer: Math.ceil(k.tage / 2), was: "Zwischenstand ansehen" },
          { nummer: k.tage, was: "Entscheiden: weitermachen oder aufhören" },
        ];
  const pruefungen = punkte.map((p) => ({ ...p, tag: tagPlus(k.start, p.nummer) }));

  function urteil(a: (typeof jeAnzeige)[number]) {
    if (a.jeErgebnis === null) return { text: "–", farbe: "var(--ink-soft)" };
    if (a.anzahl < k.mindestens)
      return { text: `noch zu früh, unter ${k.mindestens}`, farbe: "var(--ink-soft)" };
    if (verkauf) {
      return a.umsatz >= a.ausgabe
        ? { text: "trägt sich", farbe: GUT }
        : { text: "kostet mehr als es bringt", farbe: STOP };
    }
    return a.jeErgebnis <= k.grenze
      ? { text: "unter der Grenze", farbe: GUT }
      : { text: "zu teuer", farbe: STOP };
  }

  const kachel = "rounded-[16px] border border-line bg-white p-5";
  const kachelName = "text-[12.5px] uppercase tracking-[0.1em] text-ink-soft";
  const kachelZahl = "mt-2 font-serif text-[28px] tabular-nums";
  const kachelFuss = "mt-1 text-[13px] text-ink-soft";

  return (
    <main className="px-6 py-12 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="font-serif text-[32px] font-normal leading-tight tracking-tight sm:text-[40px]">
            Werbung
          </h1>
          <nav className="flex flex-wrap gap-5 text-[14.5px]">
            <Link href="/admin" className="text-rose-deep underline underline-offset-2">
              Auswertung
            </Link>
            <Link href="/admin/stall-organizer" className="text-rose-deep underline underline-offset-2">
              Stall Organizer
            </Link>
          </nav>
        </div>

        {KAMPAGNEN.length > 1 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {KAMPAGNEN.map((kk, i) => (
              <Link
                key={kk.name}
                href={`/admin/werbung?k=${i}`}
                className={
                  i === index
                    ? "rounded-full bg-ink px-4 py-1.5 text-[13.5px] text-cream"
                    : "rounded-full border border-line bg-white px-4 py-1.5 text-[13.5px] text-ink"
                }
              >
                {kk.name}
              </Link>
            ))}
          </div>
        )}

        <p className="mb-8 text-[15px] text-ink-soft">
          {k.name} · {verkauf ? "Ziel Verkauf" : "Ziel Anmeldungen"} · {k.budgetTag} € am Tag · Start{" "}
          {kurzDatum(k.start)}
          {laeuftNoch ? ` · Tag ${tagNummer} von ${k.tage}` : " · abgeschlossen"}
        </p>

        {spalteFehlt && (
          <div className="mb-8 rounded-[16px] border border-amber-700/30 bg-[#F8EFDD] p-5">
            <p className="mb-2 text-[15.5px] font-semibold text-ink">Käufe haben noch keine Herkunft</p>
            <p className="text-[14.5px] leading-relaxed text-ink-soft">
              Die Datenbank kennt die Spalte <code className="text-ink">quelle</code> für Käufe noch
              nicht. Einmal <code className="text-ink">datenbank/werbung-quelle.sql</code> im
              SQL-Editor von Supabase ausführen. Bis dahin verkauft die Kasse ganz normal, nur ohne
              zu wissen, über welche Anzeige.
            </p>
          </div>
        )}

        {/* Ohne Meta-Zugang fehlen die Kosten. Das steht oben, weil es der
            eine Punkt ist, an dem etwas zu tun ist. */}
        {meta.stand === "nicht-verbunden" && (
          <div className="mb-8 rounded-[16px] border border-amber-700/30 bg-[#F8EFDD] p-5">
            <p className="mb-2 text-[15.5px] font-semibold text-ink">Die Ausgaben fehlen noch</p>
            <p className="text-[14.5px] leading-relaxed text-ink-soft">
              Die {wort.mehrzahl} unten zählt deine eigene Datenbank, die stimmen schon. Was jede
              Anzeige gekostet hat, weiß nur Meta. Sobald der Lesezugang zu Meta eingerichtet ist
              (Variable <code className="text-ink">META_ZUGRIFF</code> bei Vercel), stehen hier
              auch Ausgaben, Klicks und die Kosten je {wort.einzahl}. Bis dahin liest du die Ausgabe
              im Werbeanzeigenmanager ab.
            </p>
          </div>
        )}
        {meta.stand === "fehler" && (
          <div className="mb-8 rounded-[16px] border border-amber-700/30 bg-[#F8EFDD] p-5">
            <p className="mb-2 text-[15.5px] font-semibold text-ink">Meta hat keine Zahlen geliefert</p>
            <p className="text-[14.5px] leading-relaxed text-ink-soft">
              Die Antwort war: „{meta.meldung}“ Meist ist der Zugang abgelaufen oder hat keine
              Leserechte für das Werbekonto. Die eigenen Zahlen unten sind davon nicht betroffen.
            </p>
          </div>
        )}

        {/* Die Kacheln */}
        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className={kachel}>
            <div className={kachelName}>{wort.mehrzahl}</div>
            <div className={kachelZahl}>{summeAnzahl}</div>
            <div className={kachelFuss}>{verkauf ? "über Anzeigen, bezahlt" : "über Anzeigen, bestätigt"}</div>
          </div>
          <div className={kachel}>
            <div className={kachelName}>Ausgegeben</div>
            <div className={kachelZahl}>{metaDa ? euro(summeAusgabe) : "–"}</div>
            <div className={kachelFuss}>
              {metaDa ? `von ${euro(k.guthaben)} für diese Kampagne` : "Meta nicht verbunden"}
            </div>
          </div>
          <div className={kachel}>
            <div className={kachelName}>{wort.je}</div>
            <div
              className={kachelZahl}
              style={{
                color:
                  summeJe === null || verkauf ? undefined : summeJe <= k.grenze ? GUT : STOP,
              }}
            >
              {summeJe === null ? "–" : euro(summeJe)}
            </div>
            <div className={kachelFuss}>Grenze {euro(k.grenze)}</div>
          </div>
          {verkauf ? (
            <div className={kachel}>
              <div className={kachelName}>Umsatz</div>
              <div
                className={kachelZahl}
                style={{ color: metaDa && summeAusgabe > 0 ? (summeUmsatz >= summeAusgabe ? GUT : STOP) : undefined }}
              >
                {euro(summeUmsatz)}
              </div>
              <div className={kachelFuss}>
                {metaDa && summeAusgabe > 0
                  ? `${euro(summeUmsatz / summeAusgabe)} je Werbe-Euro`
                  : `ohne Anzeige: ${ohneAnzeige} Käufe, ${euro(umsatzOhneAnzeige / 100)}`}
              </div>
            </div>
          ) : (
            <div className="rounded-[16px] border border-line bg-cream-deep p-5">
              <div className={kachelName}>Ohne Anzeige</div>
              <div className={kachelZahl}>{ohneAnzeige}</div>
              <div className={kachelFuss}>im selben Zeitraum</div>
            </div>
          )}
        </div>

        {/* Je Anzeige */}
        <section className="mb-10">
          <h2 className="mb-4 text-[13px] uppercase tracking-[0.12em] text-ink-soft">Je Anzeige</h2>
          <div className="overflow-x-auto rounded-[16px] border border-line bg-white">
            <table className="w-full min-w-[680px] text-left text-[14px]">
              <thead>
                <tr className="text-[12.5px] uppercase tracking-[0.08em] text-ink-soft">
                  <th className="px-5 py-3 font-medium">Anzeige</th>
                  <th className="px-5 py-3 text-right font-medium">{wort.mehrzahl}</th>
                  {verkauf && <th className="px-5 py-3 text-right font-medium">Umsatz</th>}
                  <th className="px-5 py-3 text-right font-medium">Ausgabe</th>
                  <th className="px-5 py-3 text-right font-medium">Klicks</th>
                  <th className="px-5 py-3 text-right font-medium">{wort.je}</th>
                  <th className="px-5 py-3 font-medium">Stand</th>
                </tr>
              </thead>
              <tbody>
                {jeAnzeige.map((a) => {
                  const u = urteil(a);
                  return (
                    <tr key={a.name} style={{ borderTop: "1px solid var(--line)" }}>
                      <td className="px-5 py-3.5">
                        <div className="font-medium">{a.name}</div>
                        <div className="text-[13px] text-ink-soft">{a.titel}</div>
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums">
                        {a.anzahl}
                        {a.offen > 0 && <span className="text-[12.5px] text-ink-soft"> + {a.offen} offen</span>}
                        {metaDa && (
                          <div className="text-[12.5px] text-ink-soft">
                            Meta zählt {a.metaZaehlt}
                            {verkauf ? ` · ${a.kassen} an der Kasse` : ""}
                          </div>
                        )}
                      </td>
                      {verkauf && <td className="px-5 py-3.5 text-right tabular-nums">{euro(a.umsatz)}</td>}
                      <td className="px-5 py-3.5 text-right tabular-nums">{metaDa ? euro(a.ausgabe) : "–"}</td>
                      <td className="px-5 py-3.5 text-right tabular-nums">{metaDa ? a.klicks : "–"}</td>
                      <td className="px-5 py-3.5 text-right font-medium tabular-nums">
                        {a.jeErgebnis === null ? "–" : euro(a.jeErgebnis)}
                      </td>
                      <td className="px-5 py-3.5 text-[13px]" style={{ color: u.farbe }}>
                        {u.text}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {metaDa && summeKlicks > 0 && (
            <p className="mt-3 text-[13.5px] text-ink-soft">
              Von {summeKlicks} Klicks auf den Link wurden {summeAnzahl} {wort.mehrzahl}, das sind{" "}
              {Math.round((summeAnzahl / summeKlicks) * 100)} %.
            </p>
          )}
          {verkauf && (
            <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-ink-soft">
              Zum Umsatz einer Anzeige zählt auch das angenommene Angebot nach dem Kauf. Käufe ohne
              Herkunft stehen nicht hier, darunter auch alle, die über die Mailstrecke kaufen.
            </p>
          )}
        </section>

        {/* Je Tag */}
        <section className="mb-10">
          <h2 className="mb-4 text-[13px] uppercase tracking-[0.12em] text-ink-soft">
            Je Tag, {verkauf ? "bezahlte Käufe" : "bestätigte Anmeldungen"}
          </h2>
          <div className="overflow-x-auto rounded-[16px] border border-line bg-white">
            <table className="w-full min-w-[520px] text-left text-[14px]">
              <thead>
                <tr className="text-[12.5px] uppercase tracking-[0.08em] text-ink-soft">
                  <th className="px-5 py-3 font-medium">Tag</th>
                  {k.anzeigen.map((a) => (
                    <th key={a.name} className="px-5 py-3 text-right font-medium">
                      {a.name}
                    </th>
                  ))}
                  <th className="px-5 py-3 text-right font-medium">Zusammen</th>
                  {metaDa && <th className="px-5 py-3 text-right font-medium">Ausgabe</th>}
                </tr>
              </thead>
              <tbody>
                {tage.map((t) => (
                  <tr key={t.tag} style={{ borderTop: "1px solid var(--line)" }}>
                    <td className="whitespace-nowrap px-5 py-3">
                      <span className="font-medium">Tag {t.nummer}</span>
                      <span className="text-ink-soft"> · {kurzDatum(t.tag)}</span>
                      {t.tag === heute && <span className="text-[12.5px] text-ink-soft"> · läuft noch</span>}
                    </td>
                    {k.anzeigen.map((a) => (
                      <td key={a.name} className="px-5 py-3 text-right tabular-nums">
                        {t.je[a.name]}
                      </td>
                    ))}
                    <td className="px-5 py-3 text-right font-medium tabular-nums">{t.summe}</td>
                    {metaDa && <td className="px-5 py-3 text-right tabular-nums">{euro(t.ausgabe)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-ink-soft">
            Ein Tag läuft hier wie bei Meta von 9 bis 9 Uhr deutscher Zeit, weil das Werbekonto in
            der Zeitzone Los Angeles rechnet. Deshalb passen die Zahlen genau zu denen im
            Werbeanzeigenmanager.
          </p>
        </section>

        {/* Prüftermine und Regeln */}
        <section className="mb-10">
          <h2 className="mb-4 text-[13px] uppercase tracking-[0.12em] text-ink-soft">Prüftermine</h2>
          <div className="overflow-hidden rounded-[16px] border border-line bg-white">
            {pruefungen.map((p, i) => {
              const vorbei = heute > p.tag;
              return (
                <div
                  key={p.nummer}
                  className="flex items-baseline justify-between gap-4 px-5 py-3.5"
                  style={{ borderTop: i === 0 ? "none" : "1px solid var(--line)" }}
                >
                  <span className="text-[15px]" style={{ color: vorbei ? "var(--ink-soft)" : undefined }}>
                    <span className="font-medium">Nach Tag {p.nummer}</span> · {p.was}
                  </span>
                  <span className="text-[14px] tabular-nums text-ink-soft">am {kurzDatum(p.tag)}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-4 max-w-2xl text-[13.5px] leading-relaxed text-ink-soft">
            In den ersten vier Tagen nichts an der Kampagne ändern, jede Änderung wirft die
            Lernphase zurück. Eine Anzeige erst ab etwa {k.mindestens} {wort.mehrzahl} beurteilen,
            vorher ist der Preis Zufall. Ein früher Vorsprung heißt wenig: Meta gibt am Anfang oft
            einer Anzeige fast das ganze Budget, um sie zu testen.
          </p>
        </section>
      </div>
    </main>
  );
}
