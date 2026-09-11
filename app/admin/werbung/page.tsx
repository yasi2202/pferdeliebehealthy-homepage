import type { Metadata } from "next";
import Link from "next/link";
import { adminEingerichtet, istAngemeldet } from "@/lib/admin-zugang";
import { supabaseAlle } from "@/lib/versand";
import {
  KAMPAGNEN,
  MINDESTENS_FUER_URTEIL,
  metaTag,
  metaZahlen,
  tagPlus,
  tageZwischen,
} from "@/lib/werbung";

// ---------------------------------------------------------------------------
// Die Auswertung der Meta-Werbung.
//
// ▸ WOZU: Vorher schrieb Yasemin jeden Morgen drei Zahlen von Hand in eine
//   Tabelle. Die Anmeldungen je Anzeige stehen aber ohnehin in der eigenen
//   Datenbank, und die Ausgaben kann Meta liefern. Diese Seite legt beides
//   nebeneinander und rechnet die Kosten je Anmeldung selbst aus.
//
// ▸ GEZÄHLT WIRD DIE BESTÄTIGTE ANMELDUNG. Nur wer den Zugangslink anklickt,
//   bekommt die Mailstrecke, und nur daran verdient die Werbung etwas. Die
//   Leads laut Meta stehen daneben als Gegenprobe: Meta zählt schon das
//   Absenden des Formulars, und nur bei denen, die eingewilligt haben.
//
// ▸ TAGE SIND META-TAGE, 9 bis 9 Uhr deutscher Zeit. Siehe lib/werbung.ts.
// ---------------------------------------------------------------------------

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Werbung",
  robots: { index: false, follow: false },
};

type Anmeldung = { quelle: string | null; bestaetigt: boolean; erstellt_am: string };

const GUT = "#4C7A57";
const STOP = "#A8443F";

function euro(z: number) {
  return z.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

function kurzDatum(tag: string) {
  const [, m, t] = tag.split("-");
  return `${t}.${m}.`;
}

export default async function WerbeAuswertung() {
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

  const k = KAMPAGNEN[KAMPAGNEN.length - 1];
  const heute = metaTag(new Date());
  const letzterTag = tagPlus(k.start, k.tage - 1);
  const bis = heute < letzterTag ? heute : letzterTag;
  const tagNummer = Math.min(Math.max(tageZwischen(k.start, heute) + 1, 0), k.tage);
  const laeuftNoch = heute <= letzterTag;

  // Einen Tag früher abfragen und dann nach Meta-Tag sieben. Die Datenbank
  // speichert Weltzeit, und der erste Meta-Tag beginnt dort erst um 7 Uhr.
  const roh =
    (await supabaseAlle<Anmeldung>(
      `stall_anmeldungen?select=quelle,bestaetigt,erstellt_am&erstellt_am=gte.${tagPlus(k.start, -1)}&order=erstellt_am`,
    )) ?? [];
  const imZeitraum = roh.filter((a) => {
    const t = metaTag(a.erstellt_am);
    return t >= k.start && t <= letzterTag;
  });
  const ueberAnzeigen = imZeitraum.filter((a) => (a.quelle || "").startsWith("meta-"));
  const ohneAnzeige = imZeitraum.length - ueberAnzeigen.length;

  const meta = await metaZahlen(k, bis);
  const metaDa = meta.stand === "ok";
  const metaZeilen = meta.stand === "ok" ? meta.zeilen : [];

  // Je Anzeige
  const jeAnzeige = k.anzeigen.map((a) => {
    const eigene = ueberAnzeigen.filter((x) => x.quelle === `meta-${a.name}`);
    const bestaetigt = eigene.filter((x) => x.bestaetigt).length;
    const m = metaZeilen.filter((z) => z.anzeige === a.name);
    const ausgabe = m.reduce((s, z) => s + z.ausgabe, 0);
    const klicks = m.reduce((s, z) => s + z.klicks, 0);
    const leads = m.reduce((s, z) => s + z.leads, 0);
    const jeAnmeldung = metaDa && bestaetigt > 0 ? ausgabe / bestaetigt : null;
    return { ...a, eingetragen: eigene.length, bestaetigt, ausgabe, klicks, leads, jeAnmeldung };
  });

  const summeBestaetigt = jeAnzeige.reduce((s, a) => s + a.bestaetigt, 0);
  const summeAusgabe = jeAnzeige.reduce((s, a) => s + a.ausgabe, 0);
  const summeKlicks = jeAnzeige.reduce((s, a) => s + a.klicks, 0);
  const summeJe = metaDa && summeBestaetigt > 0 ? summeAusgabe / summeBestaetigt : null;

  // Je Tag
  const tage: { tag: string; nummer: number; je: Record<string, number>; summe: number; ausgabe: number }[] = [];
  for (let i = 0; i <= tageZwischen(k.start, bis); i++) {
    const tag = tagPlus(k.start, i);
    const je: Record<string, number> = {};
    for (const a of k.anzeigen) {
      je[a.name] = ueberAnzeigen.filter(
        (x) => x.quelle === `meta-${a.name}` && x.bestaetigt && metaTag(x.erstellt_am) === tag,
      ).length;
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
  // Tag 5 endet am 15.09. um 9 Uhr deutscher Zeit, also steht dort der 15.09.
  const pruefungen = [
    { nummer: 5, was: "Zwischenstand ansehen", tag: tagPlus(k.start, 5) },
    { nummer: 7, was: "Abschaltregel anwenden", tag: tagPlus(k.start, 7) },
    { nummer: k.tage, was: "Entscheiden und Runde 2 planen", tag: tagPlus(letzterTag, 1) },
  ];

  function urteil(bestaetigt: number, jeAnmeldung: number | null) {
    if (jeAnmeldung === null) return { text: "–", farbe: "var(--ink-soft)" };
    if (bestaetigt < MINDESTENS_FUER_URTEIL)
      return { text: `noch zu früh, unter ${MINDESTENS_FUER_URTEIL}`, farbe: "var(--ink-soft)" };
    return jeAnmeldung <= k.grenze
      ? { text: "unter der Grenze", farbe: GUT }
      : { text: "zu teuer", farbe: STOP };
  }

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
        <p className="mb-8 text-[15px] text-ink-soft">
          {k.name} · {k.budgetTag} € am Tag · Start {kurzDatum(k.start)}
          {laeuftNoch ? ` · Tag ${tagNummer} von ${k.tage}` : " · abgeschlossen"}
        </p>

        {/* Ohne Meta-Zugang fehlen die Kosten. Das steht oben, weil es der
            eine Punkt ist, an dem etwas zu tun ist. */}
        {meta.stand === "nicht-verbunden" && (
          <div className="mb-8 rounded-[16px] border border-amber-700/30 bg-[#F8EFDD] p-5">
            <p className="mb-2 text-[15.5px] font-semibold text-ink">Die Ausgaben fehlen noch</p>
            <p className="text-[14.5px] leading-relaxed text-ink-soft">
              Die Anmeldungen unten zählt deine eigene Datenbank, die stimmen schon. Was jede
              Anzeige gekostet hat, weiß nur Meta. Sobald der Lesezugang zu Meta eingerichtet ist
              (Variable <code className="text-ink">META_ZUGRIFF</code> bei Vercel), stehen hier
              auch Ausgaben, Klicks und die Kosten je Anmeldung. Bis dahin liest du die Ausgabe
              im Werbeanzeigenmanager ab.
            </p>
          </div>
        )}
        {meta.stand === "fehler" && (
          <div className="mb-8 rounded-[16px] border border-amber-700/30 bg-[#F8EFDD] p-5">
            <p className="mb-2 text-[15.5px] font-semibold text-ink">Meta hat keine Zahlen geliefert</p>
            <p className="text-[14.5px] leading-relaxed text-ink-soft">
              Die Antwort war: „{meta.meldung}“ Meist ist der Zugang abgelaufen oder hat keine
              Leserechte für das Werbekonto. Die Anmeldungen unten sind davon nicht betroffen.
            </p>
          </div>
        )}

        {/* Die Kacheln */}
        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-[16px] border border-line bg-white p-5">
            <div className="text-[12.5px] uppercase tracking-[0.1em] text-ink-soft">Anmeldungen</div>
            <div className="mt-2 font-serif text-[28px] tabular-nums">{summeBestaetigt}</div>
            <div className="mt-1 text-[13px] text-ink-soft">über Anzeigen, bestätigt</div>
          </div>
          <div className="rounded-[16px] border border-line bg-white p-5">
            <div className="text-[12.5px] uppercase tracking-[0.1em] text-ink-soft">Ausgegeben</div>
            <div className="mt-2 font-serif text-[28px] tabular-nums">
              {metaDa ? euro(summeAusgabe) : "–"}
            </div>
            <div className="mt-1 text-[13px] text-ink-soft">
              {metaDa ? `noch ${euro(Math.max(0, k.guthaben - summeAusgabe))} Guthaben` : "Meta nicht verbunden"}
            </div>
          </div>
          <div className="rounded-[16px] border border-line bg-white p-5">
            <div className="text-[12.5px] uppercase tracking-[0.1em] text-ink-soft">Je Anmeldung</div>
            <div
              className="mt-2 font-serif text-[28px] tabular-nums"
              style={{ color: summeJe === null ? undefined : summeJe <= k.grenze ? GUT : STOP }}
            >
              {summeJe === null ? "–" : euro(summeJe)}
            </div>
            <div className="mt-1 text-[13px] text-ink-soft">Grenze {euro(k.grenze)}</div>
          </div>
          <div className="rounded-[16px] border border-line bg-cream-deep p-5">
            <div className="text-[12.5px] uppercase tracking-[0.1em] text-ink-soft">Ohne Anzeige</div>
            <div className="mt-2 font-serif text-[28px] tabular-nums">{ohneAnzeige}</div>
            <div className="mt-1 text-[13px] text-ink-soft">im selben Zeitraum</div>
          </div>
        </div>

        {/* Je Anzeige */}
        <section className="mb-10">
          <h2 className="mb-4 text-[13px] uppercase tracking-[0.12em] text-ink-soft">Je Anzeige</h2>
          <div className="overflow-x-auto rounded-[16px] border border-line bg-white">
            <table className="w-full min-w-[640px] text-left text-[14px]">
              <thead>
                <tr className="text-[12.5px] uppercase tracking-[0.08em] text-ink-soft">
                  <th className="px-5 py-3 font-medium">Anzeige</th>
                  <th className="px-5 py-3 text-right font-medium">Anmeldungen</th>
                  <th className="px-5 py-3 text-right font-medium">Ausgabe</th>
                  <th className="px-5 py-3 text-right font-medium">Klicks</th>
                  <th className="px-5 py-3 text-right font-medium">Je Anmeldung</th>
                  <th className="px-5 py-3 font-medium">Stand</th>
                </tr>
              </thead>
              <tbody>
                {jeAnzeige.map((a) => {
                  const u = urteil(a.bestaetigt, a.jeAnmeldung);
                  return (
                    <tr key={a.name} style={{ borderTop: "1px solid var(--line)" }}>
                      <td className="px-5 py-3.5">
                        <div className="font-medium">{a.name}</div>
                        <div className="text-[13px] text-ink-soft">{a.titel}</div>
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums">
                        {a.bestaetigt}
                        {a.eingetragen > a.bestaetigt && (
                          <span className="text-[12.5px] text-ink-soft"> + {a.eingetragen - a.bestaetigt} offen</span>
                        )}
                        {metaDa && (
                          <div className="text-[12.5px] text-ink-soft">Meta zählt {a.leads}</div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right tabular-nums">{metaDa ? euro(a.ausgabe) : "–"}</td>
                      <td className="px-5 py-3.5 text-right tabular-nums">{metaDa ? a.klicks : "–"}</td>
                      <td className="px-5 py-3.5 text-right font-medium tabular-nums">
                        {a.jeAnmeldung === null ? "–" : euro(a.jeAnmeldung)}
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
              Von {summeKlicks} Klicks auf den Link haben sich {summeBestaetigt} angemeldet und bestätigt, das sind{" "}
              {Math.round((summeBestaetigt / summeKlicks) * 100)} %.
            </p>
          )}
        </section>

        {/* Je Tag */}
        <section className="mb-10">
          <h2 className="mb-4 text-[13px] uppercase tracking-[0.12em] text-ink-soft">
            Je Tag, bestätigte Anmeldungen
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
            Bis Tag 4 nichts an der Kampagne ändern, jede Änderung wirft die Lernphase zurück. Eine
            Anzeige erst ab etwa {MINDESTENS_FUER_URTEIL} bestätigten Anmeldungen beurteilen, vorher
            ist der Preis Zufall. Ein früher Vorsprung heißt wenig: Meta gibt am Anfang oft einer
            Anzeige fast das ganze Budget, um sie zu testen.
          </p>
        </section>
      </div>
    </main>
  );
}
