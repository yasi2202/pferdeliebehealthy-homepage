"use client";

import { useState } from "react";
import { codeSaeubern, codeTaugt } from "@/lib/empfehlungsprogramm";

// ---------------------------------------------------------------------------
// Die Bewerbung für das Empfehlungsprogramm.
//
// Schickt an app/api/weiterempfehlen. Danach ist der Eintrag angelegt, aber
// noch nicht freigeschaltet: Das macht Yasemin von Hand unter
// /admin/empfehler. Deshalb steht im Erfolgstext ausdrücklich, dass es noch
// eine Antwort braucht, und nicht etwa "es kann losgehen".
//
// ▸ WARUM DER WUNSCHCODE HIER SCHON GESÄUBERT WIRD
//   Er landet in einer Internetadresse. Ein „ü“ oder ein Leerzeichen darin
//   ergibt einen Link, der beim Weiterschicken zerbricht. Statt eine
//   Fehlermeldung zu zeigen, macht das Feld beim Tippen sichtbar, was aus
//   der Eingabe wird. Wer „Marie Müller“ tippt, sieht MARIEMUELLER stehen
//   und versteht sofort, worum es geht.
// ---------------------------------------------------------------------------

export default function EmpfehlungAnmeldung() {
  const [vorname, setVorname] = useState("");
  const [nachname, setNachname] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [kanal, setKanal] = useState("");
  const [zahlweg, setZahlweg] = useState("");
  const [unternehmerin, setUnternehmerin] = useState(false);
  const [steuernummer, setSteuernummer] = useState("");
  const [einwilligung, setEinwilligung] = useState(false);
  const [webseite, setWebseite] = useState(""); // Honigtopf gegen Spam
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState("");
  const [fertig, setFertig] = useState(false);

  // Der zweite Weg auf dieser Seite: Wer schon dabei ist und den Link zu
  // ihrem Konto verlegt hat.
  const [linkMail, setLinkMail] = useState("");
  const [linkLaeuft, setLinkLaeuft] = useState(false);
  const [linkFertig, setLinkFertig] = useState(false);

  const feld =
    "w-full px-4 py-3.5 rounded-[10px] bg-white border border-line text-ink placeholder:text-ink-soft/60 text-[15px] focus:outline-none focus:border-rose-deep";

  const beschriftung = "block text-[14px] font-medium text-ink mb-1.5";

  async function absenden(e: React.FormEvent) {
    e.preventDefault();
    if (laeuft) return;

    if (vorname.trim().length < 2) {
      setFehler("Bitte trag deinen Vornamen ein.");
      return;
    }
    if (nachname.trim().length < 2) {
      setFehler(
        "Bitte trag deinen Nachnamen ein. Ich brauche ihn für die Abrechnung.",
      );
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setFehler("Diese E-Mail-Adresse sieht nicht vollständig aus.");
      return;
    }
    if (!codeTaugt(code)) {
      setFehler(
        "Dein Wunschname für den Link braucht mindestens drei Buchstaben oder Ziffern.",
      );
      return;
    }
    if (zahlweg.trim().length < 5) {
      setFehler(
        "Bitte sag mir, wohin die Provision gehen soll: eine PayPal-Adresse oder eine IBAN.",
      );
      return;
    }
    if (!einwilligung) {
      setFehler("Ohne dein Häkchen zu den Teilnahmebedingungen geht es nicht.");
      return;
    }

    setFehler("");
    setLaeuft(true);

    try {
      const res = await fetch("/api/weiterempfehlen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          art: "anmelden",
          vorname: vorname.trim(),
          nachname: nachname.trim(),
          email: email.trim(),
          code,
          kanal: kanal.trim(),
          zahlweg: zahlweg.trim(),
          unternehmerin,
          steuernummer: steuernummer.trim(),
          webseite,
        }),
      });

      const antwort = await res.json().catch(() => ({ ok: false }));

      if (antwort.ok) {
        setFertig(true);
      } else {
        setFehler(
          antwort.fehler ??
            "Das hat gerade nicht geklappt. Versuch es bitte noch einmal.",
        );
      }
    } catch {
      setFehler(
        "Ich konnte dich gerade nicht erreichen. Prüf kurz deine Verbindung und versuch es noch einmal.",
      );
    } finally {
      setLaeuft(false);
    }
  }

  async function kontolinkAnfordern(e: React.FormEvent) {
    e.preventDefault();
    if (linkLaeuft) return;

    setLinkLaeuft(true);

    try {
      await fetch("/api/weiterempfehlen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ art: "kontolink", email: linkMail.trim() }),
      });
    } catch {
      // Auch bei einem Fehler dieselbe Antwort, siehe unten.
    } finally {
      // ▸ DIE ANTWORT IST IMMER DIESELBE, egal ob es die Adresse gibt.
      //   Sonst könnte jeder durch Ausprobieren herausfinden, wer bei
      //   Yasemin im Programm ist. Dieselbe Regel wie bei jedem
      //   Passwort-vergessen-Formular.
      setLinkLaeuft(false);
      setLinkFertig(true);
    }
  }

  if (fertig) {
    return (
      <div className="rounded-[18px] bg-cream-deep p-6 sm:p-8">
        <p className="mb-2 text-[16px] font-semibold text-ink">
          Deine Bewerbung ist bei mir.
        </p>
        <p className="text-[15px] leading-relaxed text-ink-soft">
          Ich sehe sie mir persönlich an und melde mich per Mail bei dir,
          meistens innerhalb weniger Tage. Erst danach zählt dein Link, vorher
          bringt es also nichts, ihn schon zu teilen. Bis gleich.
        </p>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={absenden} className="max-w-xl">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ea-vorname" className={beschriftung}>
              Vorname
            </label>
            <input
              id="ea-vorname"
              type="text"
              value={vorname}
              onChange={(e) => setVorname(e.target.value)}
              autoComplete="given-name"
              className={feld}
            />
          </div>

          <div>
            <label htmlFor="ea-nachname" className={beschriftung}>
              Nachname
            </label>
            <input
              id="ea-nachname"
              type="text"
              value={nachname}
              onChange={(e) => setNachname(e.target.value)}
              autoComplete="family-name"
              className={feld}
            />
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="ea-email" className={beschriftung}>
            E-Mail-Adresse
          </label>
          <input
            id="ea-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className={feld}
          />
        </div>

        <div className="mt-4">
          <label htmlFor="ea-code" className={beschriftung}>
            Wunschname für deinen Link
          </label>
          <input
            id="ea-code"
            type="text"
            value={code}
            onChange={(e) => setCode(codeSaeubern(e.target.value))}
            placeholder="MARIE"
            className={feld}
          />
          <p className="mt-1.5 text-[13.5px] text-ink-soft">
            Dein Link lautet dann{" "}
            <span className="text-ink">
              pferdeliebehealthy.de/e/{code || "MARIE"}
            </span>
            . Nur Buchstaben und Ziffern, Umlaute schreibe ich um.
          </p>
        </div>

        <div className="mt-4">
          <label htmlFor="ea-kanal" className={beschriftung}>
            Wo möchtest du empfehlen?
          </label>
          <textarea
            id="ea-kanal"
            value={kanal}
            onChange={(e) => setKanal(e.target.value)}
            rows={3}
            placeholder="Zum Beispiel: Instagram @meinname, mein Blog, in meinem Stall, in meiner Facebook-Gruppe für Kotwasser"
            className={feld}
          />
          <p className="mt-1.5 text-[13.5px] text-ink-soft">
            Das ist das Feld, auf das ich am genauesten schaue. Schreib ruhig
            zwei Sätze dazu.
          </p>
        </div>

        <div className="mt-4">
          <label htmlFor="ea-zahlweg" className={beschriftung}>
            Wohin soll die Provision gehen?
          </label>
          <input
            id="ea-zahlweg"
            type="text"
            value={zahlweg}
            onChange={(e) => setZahlweg(e.target.value)}
            placeholder="PayPal-Adresse oder IBAN"
            className={feld}
          />
        </div>

        <div className="mt-5 rounded-[14px] border border-line bg-white p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={unternehmerin}
              onChange={(e) => setUnternehmerin(e.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 accent-rose-deep"
            />
            <span className="text-[14.5px] leading-relaxed text-ink">
              Ich bin selbstständig oder gewerblich tätig und kann die
              Provision versteuern.
            </span>
          </label>

          {unternehmerin ? (
            <div className="mt-4">
              <label htmlFor="ea-steuer" className={beschriftung}>
                Steuernummer oder USt-IdNr. <span className="font-normal text-ink-soft">(freiwillig)</span>
              </label>
              <input
                id="ea-steuer"
                type="text"
                value={steuernummer}
                onChange={(e) => setSteuernummer(e.target.value)}
                className={feld}
              />
            </div>
          ) : (
            <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">
              Kein Häkchen ist kein Ausschluss. Provision ist aber immer
              Einkommen, das versteuert werden muss, auch bei kleinen
              Beträgen. Wenn du dir unsicher bist, schreib mir einfach, dann
              klären wir das zusammen.
            </p>
          )}
        </div>

        <label className="mt-5 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={einwilligung}
            onChange={(e) => setEinwilligung(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-rose-deep"
          />
          <span className="text-[14.5px] leading-relaxed text-ink-soft">
            Ich habe die{" "}
            <a
              href="/weiterempfehlen/bedingungen"
              className="text-rose-deep underline underline-offset-2"
            >
              Teilnahmebedingungen
            </a>{" "}
            gelesen und bin einverstanden. Mir ist klar, dass ich meine
            Empfehlungen als Werbung kennzeichnen muss.
          </span>
        </label>

        {/* Der Honigtopf: unsichtbar für Menschen, verlockend für Maschinen.
            Wer hier etwas einträgt, ist keine. */}
        <input
          type="text"
          value={webseite}
          onChange={(e) => setWebseite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
        />

        {fehler ? (
          <p className="mt-4 text-[14.5px] text-rose-deep">{fehler}</p>
        ) : null}

        <button
          type="submit"
          disabled={laeuft}
          className="mt-6 w-full rounded-full bg-rose-deep px-8 py-4 text-[15px] font-medium text-cream transition-colors hover:bg-ink disabled:opacity-50 sm:w-auto"
        >
          {laeuft ? "Einen Moment..." : "Bewerbung abschicken"}
        </button>
      </form>

      <div className="mt-12 border-t border-line pt-8">
        <h3 className="mb-2 text-[16px] font-semibold text-ink">
          Schon dabei und den Link zu deinem Konto verlegt?
        </h3>

        {linkFertig ? (
          <p className="text-[15px] leading-relaxed text-ink-soft">
            Wenn diese Adresse bei mir im Programm steht, ist die Mail mit
            deinem Kontolink unterwegs. Schau bitte auch kurz im Spam-Ordner
            nach.
          </p>
        ) : (
          <form
            onSubmit={kontolinkAnfordern}
            className="flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              value={linkMail}
              onChange={(e) => setLinkMail(e.target.value)}
              placeholder="Deine E-Mail-Adresse"
              aria-label="Deine E-Mail-Adresse"
              className={feld}
            />
            <button
              type="submit"
              disabled={linkLaeuft}
              className="shrink-0 rounded-full border border-rose-deep px-6 py-3.5 text-[15px] font-medium text-rose-deep transition-colors hover:bg-rose-deep hover:text-cream disabled:opacity-50"
            >
              {linkLaeuft ? "..." : "Link schicken"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
