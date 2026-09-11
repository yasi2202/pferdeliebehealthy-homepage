import type { Metadata } from "next";
import Link from "next/link";
import { adminEingerichtet, istAngemeldet } from "@/lib/admin-zugang";
import { supabaseAlle, supabaseZaehlen } from "@/lib/versand";

// ---------------------------------------------------------------------------
// Die Auswertung der Stall-Organizer-Anmeldungen.
//
// ▸ WOZU SIE DA IST: Der Link wird an mehreren Stellen geteilt, in der
//   Instagram-Bio, in einer Story, im Newsletter. Ohne diese Seite müsste
//   Yasemin in Supabase nachsehen, und selbst dort stünde bei jeder Zeile nur
//   "website".
//
// ▸ BESTÄTIGT UND OFFEN STEHEN GETRENNT, so wie in der Adressliste nebenan.
//   Anschreiben darf sie nur die bestätigten; wer beides zusammenzählt, hält
//   seinen Verteiler für grösser als er ist.
//
// ▸ DIE HERKUNFT KOMMT AUS `?von=` in der Adresse und landet über
//   app/api/stall-organizer in der Spalte `quelle`. Alte Zeilen, die vor dem
//   07.09.2026 entstanden sind, stehen deshalb alle unter "website".
// ---------------------------------------------------------------------------

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stall Organizer",
  robots: { index: false, follow: false },
};

type Anmeldung = {
  email: string;
  vorname: string | null;
  bestaetigt: boolean;
  erstellt_am: string;
  bestaetigt_am: string | null;
  quelle: string | null;
};

const BASIS = "https://www.pferdeliebehealthy.de/stall-organizer";

/* Die Kanäle, für die es fertige Links gibt. Mehr braucht es selten: Was
   nicht in dieser Liste steht, lässt sich trotzdem anhängen, jede Angabe in
   `?von=` wird gespeichert. */
const KANAELE = [
  { schluessel: "instagram", name: "Instagram, Bio", wozu: "Der Link im Profil" },
  { schluessel: "story", name: "Instagram, Story", wozu: "Der Link-Sticker" },
  { schluessel: "beitrag", name: "Instagram, Beitrag", wozu: "In der Bildunterschrift" },
  { schluessel: "newsletter", name: "Newsletter", wozu: "In einer Mail an deine Liste" },
];

function tagSchluessel(d: Date) {
  return d.toISOString().slice(0, 10);
}

function deDatum(iso: string | null) {
  if (!iso) return "–";
  const d = new Date(iso);
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default async function StallOrganizerAuswertung() {
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

  // Gezählt wird über den Kopf der Antwort, nicht über die Länge der Liste:
  // Supabase liefert höchstens tausend Zeilen auf einmal.
  const bestaetigt = await supabaseZaehlen("stall_anmeldungen?bestaetigt=is.true");
  const offen = await supabaseZaehlen("stall_anmeldungen?bestaetigt=is.false");

  const alle =
    (await supabaseAlle<Anmeldung>(
      "stall_anmeldungen?select=email,vorname,bestaetigt,erstellt_am,bestaetigt_am,quelle&order=erstellt_am.desc",
    )) ?? [];

  const jetzt = new Date();
  const vorTagen = (n: number) => new Date(jetzt.getTime() - n * 86400000);
  const sieben = alle.filter((a) => new Date(a.erstellt_am) >= vorTagen(7)).length;
  const dreissig = alle.filter((a) => new Date(a.erstellt_am) >= vorTagen(30)).length;

  // Vierzehn Tage nebeneinander. Länger wird auf einem Handy zu schmal, und
  // was vor drei Wochen war, sagt über eine laufende Aktion wenig.
  const tage: { markierung: string; zahl: number; datum: string }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = vorTagen(i);
    const k = tagSchluessel(d);
    tage.push({
      markierung: `${d.getDate()}.`,
      datum: k,
      zahl: alle.filter((a) => (a.erstellt_am || "").slice(0, 10) === k).length,
    });
  }
  const hoechster = Math.max(...tage.map((t) => t.zahl), 1);

  // Nach Herkunft, die häufigste zuerst.
  const herkunft = new Map<string, { gesamt: number; bestaetigt: number }>();
  for (const a of alle) {
    const k = a.quelle || "unbekannt";
    const e = herkunft.get(k) ?? { gesamt: 0, bestaetigt: 0 };
    e.gesamt += 1;
    if (a.bestaetigt) e.bestaetigt += 1;
    herkunft.set(k, e);
  }
  const nachHerkunft = [...herkunft.entries()].sort((a, b) => b[1].gesamt - a[1].gesamt);

  const neueste = alle.slice(0, 40);

  // Landen die Anmeldungen im Newsletter-Verteiler?
  //
  // Der Versand nimmt die Ansicht `alle_anmeldungen`, und die schaute bis zum
  // 07.09.2026 nur in Futter-Check und Insider. Statt das im Kopf zu behalten,
  // wird hier nachgesehen: Taucht eine bestätigte Stall-Adresse dort auf?
  const beispiel = alle.find((a) => a.bestaetigt)?.email ?? null;
  let imVerteiler: boolean | null = null;
  if (beispiel) {
    const treffer = await supabaseAlle<{ email: string }>(
      `alle_anmeldungen?select=email&email=eq.${encodeURIComponent(beispiel.toLowerCase())}`,
    );
    imVerteiler = Array.isArray(treffer) && treffer.length > 0;
  }

  return (
    <main className="px-6 py-12 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="font-serif text-[32px] font-normal leading-tight tracking-tight sm:text-[40px]">
            Stall Organizer
          </h1>
          <nav className="flex flex-wrap gap-5 text-[14.5px]">
            <Link href="/admin" className="text-rose-deep underline underline-offset-2">
              Auswertung
            </Link>
            <Link href="/admin/adressen" className="text-rose-deep underline underline-offset-2">
              Adressen
            </Link>
            <Link href="/admin/newsletter" className="text-rose-deep underline underline-offset-2">
              Newsletter
            </Link>
            <Link href="/admin/werbung" className="text-rose-deep underline underline-offset-2">
              Werbung
            </Link>
          </nav>
        </div>

        {/* Der Verteiler. Steht ganz oben, weil hier etwas zu tun sein kann:
            Ohne die Ansicht bekommt niemand von ihnen den Newsletter. */}
        {imVerteiler === false && (
          <div className="mb-8 rounded-[16px] border border-amber-700/30 bg-[#F8EFDD] p-5">
            <p className="mb-2 text-[15.5px] font-semibold text-ink">
              Diese Adressen bekommen den Newsletter noch nicht
            </p>
            <p className="text-[14.5px] leading-relaxed text-ink-soft">
              Der Versand nimmt die Sammelansicht <code>alle_anmeldungen</code>, und die kennt
              den Stall Organizer noch nicht. Einmal die Datei{" "}
              <code className="text-ink">datenbank/stall-in-newsletter.sql</code> im SQL-Editor
              von Supabase ausführen, dann sind alle bisherigen und alle künftigen Anmeldungen
              dabei. Die Mailstrecke läuft davon unabhängig und ist nicht betroffen.
            </p>
          </div>
        )}
        {imVerteiler === true && (
          <div className="mb-8 rounded-[16px] border border-line bg-white p-5">
            <p className="text-[14.5px] leading-relaxed text-ink-soft">
              <span className="font-semibold text-ink">Im Newsletter-Verteiler.</span> Wer sich
              hier einträgt und den Zugangslink anklickt, steht in{" "}
              <Link href="/admin/adressen" className="text-rose-deep underline underline-offset-2">
                Adressen
              </Link>{" "}
              und bekommt den Newsletter, zusätzlich zur Mailstrecke.
            </p>
          </div>
        )}

        {/* Die vier Zahlen */}
        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-[16px] border border-line bg-white p-5">
            <div className="text-[12.5px] uppercase tracking-[0.1em] text-ink-soft">
              Bestätigt
            </div>
            <div className="mt-2 font-serif text-[28px] tabular-nums">
              {bestaetigt < 0 ? "?" : bestaetigt}
            </div>
            <div className="mt-1 text-[13px] text-ink-soft">bekommt Post</div>
          </div>
          <div className="rounded-[16px] border border-line bg-cream-deep p-5">
            <div className="text-[12.5px] uppercase tracking-[0.1em] text-ink-soft">
              Noch offen
            </div>
            <div className="mt-2 font-serif text-[28px] tabular-nums">
              {offen < 0 ? "?" : offen}
            </div>
            <div className="mt-1 text-[13px] text-ink-soft">Link nicht geklickt</div>
          </div>
          <div className="rounded-[16px] border border-line bg-white p-5">
            <div className="text-[12.5px] uppercase tracking-[0.1em] text-ink-soft">
              Letzte 7 Tage
            </div>
            <div className="mt-2 font-serif text-[28px] tabular-nums">{sieben}</div>
            <div className="mt-1 text-[13px] text-ink-soft">neu eingetragen</div>
          </div>
          <div className="rounded-[16px] border border-line bg-white p-5">
            <div className="text-[12.5px] uppercase tracking-[0.1em] text-ink-soft">
              Letzte 30 Tage
            </div>
            <div className="mt-2 font-serif text-[28px] tabular-nums">{dreissig}</div>
            <div className="mt-1 text-[13px] text-ink-soft">neu eingetragen</div>
          </div>
        </div>

        {/* Vierzehn Tage */}
        <section className="mb-10">
          <h2 className="mb-4 text-[13px] uppercase tracking-[0.12em] text-ink-soft">
            Die letzten vierzehn Tage
          </h2>
          <div className="rounded-[16px] border border-line bg-white p-5">
            <div className="flex items-end gap-2" style={{ height: 120 }}>
              {tage.map((t) => (
                <div key={t.datum} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full flex-1 items-end">
                    <div
                      title={`${t.datum}: ${t.zahl}`}
                      className="w-full rounded-[6px]"
                      style={{
                        height: `${t.zahl === 0 ? 3 : Math.max(8, (t.zahl / hoechster) * 100)}%`,
                        background: t.zahl === 0 ? "var(--cream-deep)" : "var(--rose-deep)",
                        opacity: t.zahl === 0 ? 1 : 0.45 + 0.55 * (t.zahl / hoechster),
                      }}
                    />
                  </div>
                  <span className="text-[11px] tabular-nums text-ink-soft">{t.markierung}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Woher */}
        <section className="mb-10">
          <h2 className="mb-4 text-[13px] uppercase tracking-[0.12em] text-ink-soft">
            Woher sie kommen
          </h2>
          {nachHerkunft.length === 0 ? (
            <p className="text-[15px] text-ink-soft">Noch niemand eingetragen.</p>
          ) : (
            <div className="overflow-hidden rounded-[16px] border border-line bg-white">
              {nachHerkunft.map(([k, e], i) => (
                <div
                  key={k}
                  className="flex items-baseline justify-between gap-4 px-5 py-3.5"
                  style={{ borderTop: i === 0 ? "none" : "1px solid var(--line)" }}
                >
                  <span className="text-[15px] font-medium">{k}</span>
                  <span className="text-[14px] tabular-nums text-ink-soft">
                    {e.gesamt} eingetragen · {e.bestaetigt} bestätigt
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Die Links */}
        <section className="mb-10">
          <h2 className="mb-2 text-[13px] uppercase tracking-[0.12em] text-ink-soft">
            Deine Links
          </h2>
          <p className="mb-4 max-w-2xl text-[14.5px] leading-relaxed text-ink-soft">
            Für jede Stelle ein eigener Link. Es ist dieselbe Seite, nur mit einer Kennzeichnung
            am Ende, die oben in der Liste auftaucht. Du kannst dir jederzeit weitere ausdenken:
            alles hinter <code className="text-ink">?von=</code> wird gespeichert.
          </p>
          <div className="overflow-hidden rounded-[16px] border border-line bg-white">
            {KANAELE.map((k, i) => (
              <div
                key={k.schluessel}
                className="px-5 py-4"
                style={{ borderTop: i === 0 ? "none" : "1px solid var(--line)" }}
              >
                <div className="mb-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-[15px] font-medium">{k.name}</span>
                  <span className="text-[13px] text-ink-soft">{k.wozu}</span>
                </div>
                <code className="block break-all text-[13.5px] text-rose-deep">
                  {BASIS}?von={k.schluessel}
                </code>
              </div>
            ))}
          </div>
        </section>

        {/* Die letzten Anmeldungen */}
        <section>
          <h2 className="mb-4 text-[13px] uppercase tracking-[0.12em] text-ink-soft">
            Die letzten Anmeldungen
          </h2>
          {neueste.length === 0 ? (
            <p className="text-[15px] text-ink-soft">Noch niemand eingetragen.</p>
          ) : (
            <div className="overflow-x-auto rounded-[16px] border border-line bg-white">
              <table className="w-full text-left text-[14px]">
                <thead>
                  <tr className="text-[12.5px] uppercase tracking-[0.08em] text-ink-soft">
                    <th className="px-5 py-3 font-medium">Eingetragen</th>
                    <th className="px-5 py-3 font-medium">Adresse</th>
                    <th className="px-5 py-3 font-medium">Woher</th>
                    <th className="px-5 py-3 font-medium">Bestätigt</th>
                  </tr>
                </thead>
                <tbody>
                  {neueste.map((a) => (
                    <tr key={a.email} style={{ borderTop: "1px solid var(--line)" }}>
                      <td className="whitespace-nowrap px-5 py-3 tabular-nums text-ink-soft">
                        {deDatum(a.erstellt_am)}
                      </td>
                      <td className="px-5 py-3">
                        {a.email}
                        {a.vorname ? (
                          <span className="text-ink-soft"> · {a.vorname}</span>
                        ) : null}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-ink-soft">
                        {a.quelle || "–"}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3">
                        {a.bestaetigt ? (
                          <span className="text-[13px] font-medium text-ink">
                            ja · {deDatum(a.bestaetigt_am)}
                          </span>
                        ) : (
                          <span className="text-[13px] text-ink-soft">noch nicht</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-4 max-w-2xl text-[13.5px] leading-relaxed text-ink-soft">
            Wer nicht bestätigt hat, hat den Zugangslink in der Mail nicht angeklickt. Diese
            Adressen bekommen weder die Mailstrecke noch den Newsletter. Wer den Organizer aus der
            Akademie heraus geholt hat, steht mit der Herkunft „akademie" da.
          </p>
        </section>
      </div>
    </main>
  );
}
