import Image from "next/image";

export default function AboutSection() {
  return (
    <section id="ueber-mich" className="py-20 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-16 items-center">
        <div className="fade-in relative aspect-[3/4] rounded-[18px] overflow-hidden border border-line">
          <Image
            src="/images/yasi-portrait.jpg"
            alt="Yasemin Halac, Ernährungsberaterin für Pferde"
            fill
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover object-[50%_12%]"
          />
        </div>
        <div className="fade-in">
          <span className="block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
            Über mich
          </span>
          <h2 className="font-serif font-normal text-[26px] sm:text-[38px] leading-tight mb-6">
            Hallo, ich bin Yasi
          </h2>
          {/* Der Text ist Yasis eigener, Stand 26.08.2026, nur in Absätze
              gesetzt. Bitte nicht "glätten" — er trägt, weil er ihre Sprache
              ist und nicht die einer Werbeagentur.

              Zwei Angaben sind mit ihr abgestimmt geändert: Helena ist 28,
              nicht 27, und sie hat PPID zusätzlich zu Arthrose und COPD.
              Ihr Alter steht auch in components/RatioProAuszug.tsx — die
              beiden Stellen müssen zusammenpassen. */}
          <p className="text-ink-soft text-base mb-4.5">
            Ich bin Yasi, Ernährungsberaterin für Pferde aus Baden-Württemberg,
            und Pferde begleiten mich, seit ich denken kann. Ihre Sensibilität,
            ihre Kraft, ihre stille Art zu kommunizieren. Diese Faszination hat
            mich nie losgelassen.
          </p>
          <p className="text-ink-soft text-base mb-4.5">
            Aber der Moment, der wirklich alles verändert hat, war Helena. Als
            ihre Beschwerden schulmedizinisch als austherapiert galten, wollte
            ich das einfach nicht akzeptieren. Also fing ich an zu
            recherchieren, zu hinterfragen, auszuprobieren. Studien,
            Fachliteratur, ganzheitliche Fütterung, Pflanzenheilkunde. Ich wollte
            verstehen, wie der Pferdekörper wirklich funktioniert.
          </p>
          <p className="text-ink-soft text-base mb-4.5">
            Und es hat sich gelohnt. Mit der richtigen, individuell
            abgestimmten Fütterung und natürlicher Unterstützung gewann Helena
            Stück für Stück ihre Lebensqualität zurück. Heute ist sie trotz
            PPID, Arthrose und COPD fröhlich, wach und lebensfroh. Mit 28
            Jahren.
          </p>
          <p className="text-ink-soft text-base mb-4.5">
            Diese Erfahrung hat meinen Weg definiert. Ich kenne das Gefühl,
            wenn man das Beste für sein Pferd will und trotzdem nicht
            weiterkommt. Und ich weiß, wie viel sich verändern kann, wenn man
            den Körper ganzheitlich betrachtet und gezielt unterstützt.
          </p>
          <p className="text-ink-soft text-base mb-4.5">
            Genau deshalb habe ich die Ausbildung und meine Futterkurse
            entwickelt. Damit du nicht Jahre brauchst, um das zu verstehen, was
            ich mir mühsam erarbeitet habe.
          </p>

          {/* Der Satz, auf den alles hinausläuft — deshalb abgesetzt statt als
              vierter Absatz. Ein Absatz mehr am Ende eines langen Textes wird
              überlesen; ein abgesetzter Satz nicht. */}
          <blockquote className="border-l-2 border-rose-deep pl-5 my-7">
            <p className="font-serif text-[19px] sm:text-[21px] leading-relaxed">
              Ich bin überzeugt: Wir hätten deutlich mehr gesunde Pferde, wenn
              Pferdebesitzer besser über Fütterung Bescheid wüssten. Genau hier
              liegt das Potenzial, das ich mit meinem Wissen fördern möchte.
            </p>
          </blockquote>

          {/* ------------------------------------------------------------
              Die Zahlen und die Qualifikation, seit 08.09.2026.

              ▸ WARUM SIE HIER STEHEN
                Der Text darüber trägt emotional, belegt aber nichts. Wer
                Yasemin nicht kennt, liest eine schöne Geschichte und weiß
                danach immer noch nicht, ob dahinter Erfahrung steckt.
                Die Zahlen sind der Beleg, die Geschichte der Grund.

              ▸ DIESELBEN ZAHLEN WIE AUF /ausbildung UND IN
                components/WerDahinterSteht.tsx. Ändern sie sich, ändern
                sie sich an allen drei Stellen, sonst widerspricht sich
                die Seite selbst.

              ▸ AM 08.09.2026 VON 1.000 AUF 1.300 GESETZT. Gezählt in der
                Akademie, Tabelle `kursteilnehmer`: 1.373 Zeilen, davon
                1.365 mit mindestens einem echten Kurszugang, jede mit
                eigener Adresse. Abgerundet, damit die Zahl auch in ein
                paar Monaten noch stimmt.

              ▸ Die 500 Einzelberatungen stehen so im ZFU-Antrag und
                lassen sich nicht aus der Datenbank belegen. Nicht
                anheben, ohne dass Yasemin sie bestätigt.

              ▸ WAS HIER BEWUSST NICHT STEHT
                Tierheilpraktikerin. Die Ausbildung läuft noch (Stand
                08.09.2026), und ein Titel, den man noch nicht führen darf,
                gehört nicht auf eine Seite, die etwas verkauft. Und seit
                dem 08.09.2026 auch nicht mehr die ausbildende Stelle des
                Abschlusses, von Yasemin so entschieden. Genannt wird die
                Tätigkeit, nicht wer sie ihr bescheinigt hat.
              ------------------------------------------------------------ */}
          <div className="my-8 border-t border-line pt-7">
            <dl className="grid grid-cols-3 gap-4 sm:gap-6">
              {[
                { zahl: "500+", was: "Einzel­beratungen" },
                { zahl: "1.300+", was: "Kurs­teilnehmende" },
                { zahl: "seit 2022", was: "Pferdeliebehealthy" },
              ].map((z) => (
                <div key={z.zahl}>
                  <dt className="font-serif text-[26px] sm:text-[32px] leading-none text-rose-deep tabular-nums">
                    {z.zahl}
                  </dt>
                  <dd className="mt-2 text-[13.5px] leading-snug text-ink-soft">
                    {z.was}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Genannt wird nur, was abgeschlossen ist. Keine ZFU-Zulassung
                behaupten: Das Verfahren unter Reg.-Nr. 76270 läuft noch,
                dieselbe Regel gilt auf /ausbildung. */}
            <p className="mt-6 text-[14px] leading-relaxed text-ink-soft">
              Ausgebildete Futtermittelberaterin für Pferde, eigene Pferde
              seit 2006, seit Mai 2025 hauptberuflich. Alles, was
              ich unterrichte, habe ich vorher an echten Pferden gerechnet.
            </p>
          </div>

          <p className="text-[15px] font-medium">Yasemin Halac</p>
          <p className="text-[14px] text-ink-soft">Pferdeernährungsberaterin</p>

          {/* Der Hinweis auf Buchen im Odenwald und die Tiere stand hier
              früher — auf Yasis Wunsch raus. Der Ort steht weiterhin in der
              Fußzeile und in den strukturierten Daten in app/layout.tsx, für
              Suchen wie „Ernährungsberaterin Pferd Odenwald". */}
        </div>
      </div>
    </section>
  );
}
