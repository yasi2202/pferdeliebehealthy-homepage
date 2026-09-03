// ---------------------------------------------------------------------------
// Startvorlagen für den Newsletter.
//
// ▸ WOZU: Vor einem leeren Feld zu sitzen ist der häufigste Grund, warum ein
//   Newsletter nicht geschrieben wird. Jede Vorlage hier ist ein fertiges
//   Gerüst in deiner Stimme — du tauschst die Beispiele gegen dein Thema und
//   bist in zwanzig Minuten fertig.
//
// ▸ DIE TEXTE SIND ABSICHTLICH KONKRET und nicht „Hier steht dein Text".
//   Ein Platzhalter hilft niemandem; ein echter Satz zeigt Ton, Länge und
//   Aufbau, und lässt sich überschreiben.
//
// ▸ FACHLICHES DARIN IST EIN BEISPIEL, kein freigegebener Rat. Prüf jede
//   Zahl, bevor sie rausgeht — die Vorlage kennt weder das Pferd noch die
//   Ration.
// ---------------------------------------------------------------------------

export type Vorlage = {
  schluessel: string;
  name: string;
  wofuer: string;
  betreff: string;
  vorschautext: string;
  inhalt: string;
};

export const VORLAGEN: Vorlage[] = [
  {
    schluessel: "leer",
    name: "Leeres Blatt",
    wofuer: "Wenn du schon weisst, was du schreiben willst.",
    betreff: "",
    vorschautext: "",
    inhalt: "Hallo {{vorname}},\n\n",
  },

  {
    schluessel: "thema",
    name: "Ein Thema aus der Praxis",
    wofuer:
      "Dein Brot-und-Butter-Newsletter: ein Fütterungsthema, verständlich erklärt, am Ende ein Angebot.",
    betreff: "Warum Kotwasser im Herbst wiederkommt",
    vorschautext:
      "Es liegt fast nie am Gras, und der Fellwechsel ist nur die halbe Antwort.",
    inhalt: `Hallo {{vorname}},

jedes Jahr im Oktober häufen sich die Nachrichten in meinem Postfach, und sie klingen alle gleich: „Im Sommer war alles gut, jetzt läuft es wieder."

Das ist kein Zufall, und es liegt fast nie an dem, was zuerst verdächtigt wird.

## Was im Herbst wirklich passiert

Drei Dinge treffen gleichzeitig aufeinander:

- Das Gras wird kürzer, dafür kommt mehr Heu dazu, oft von einem Tag auf den anderen
- Der Fellwechsel zieht Nährstoffe ab, allen voran Zink und Kupfer
- Die Temperaturen schwanken um zehn Grad am Tag, und der Darm mag keine Sprünge

Der Darm reagiert auf all das gleichzeitig. Nicht, weil etwas kaputt ist, sondern weil ihm die Umstellung zu schnell ging.

> Die häufigste Antwort auf Kotwasser ist eine neue Dose. Die richtige Antwort ist fast immer weniger, dafür in Ruhe: Heu vor dem Gras, Umstellung über zwei Wochen, und erst dann über Ergänzungen nachdenken.

## Was ich stattdessen mache

Ich schaue mir zuerst das Heu an, dann die Reihenfolge der Mahlzeiten, dann erst die Dosen im Schrank. In neun von zehn Fällen steckt die Ursache in den ersten beiden Punkten.

[[knopf: Den ganzen Beitrag lesen | https://www.pferdeliebehealthy.de/blog]]

---

Wenn du bei deinem Pferd gerade nicht weiterkommst, schau dir das hier an:

[[angebot: Der Futter-Check | kostenlos | https://www.pferdeliebehealthy.de/futter-check | In zehn Minuten weisst du, wo deine Ration steht und was als Erstes dran ist.]]

PS: Antworte einfach auf diese Mail, wenn du eine Frage hast. Ich lese jede.`,
  },

  {
    schluessel: "fall",
    name: "Ein Fall aus der Beratung",
    wofuer:
      "Die Mail mit den höchsten Öffnungsraten. Menschen lesen Geschichten, keine Ratgeber.",
    betreff: "Vier Wurmkuren in einem Jahr, und dann das",
    vorschautext: "Was bei einem dreijährigen Wallach wirklich dahintersteckte.",
    inhalt: `Hallo {{vorname}},

heute erzähle ich dir von einem Fall, der mich lange beschäftigt hat. Der Name ist geändert, alles andere stimmt so.

## Die Ausgangslage

Ein dreijähriger Wallach, seit dem Frühjahr stumpfes Fell, immer wieder breiiger Kot. Innerhalb eines Jahres vier Wurmkuren, weil bei jedem Verdacht wieder entwurmt wurde. Der Kot wurde nie besser.

## Was ich gefunden habe

Nichts Dramatisches. Und genau das war das Problem: Es gab keinen einzelnen Auslöser, es waren vier kleine Dinge nebeneinander.

- Das Heu kam aus dem dritten Schnitt, sehr jung und eiweissreich
- Dazu täglich Müsli, weil er ja „aufbauen" sollte
- Ein Mineralfutter mit Zink und Kupfer im Verhältnis 9 zu 1
- Und viermal eine Wurmkur, die jedes Mal die Darmflora mitgenommen hat

> Vier Wurmkuren in einem Jahr sind kein Nebenschauplatz. Jede einzelne wirkt auf die Darmflora, und ohne Kotprobe weiss niemand, ob sie überhaupt nötig war.

## Was wir geändert haben

Heu aus dem ersten Schnitt, das Müsli weg, ein Mineralfutter mit passendem Verhältnis, und ein halbes Jahr Ruhe. Mehr nicht.

Nach acht Wochen war der Kot fest. Nach dem Fellwechsel im Frühjahr sah er aus wie ein anderes Pferd.

---

[[angebot: Die Futterberatung | ab 89 € | https://www.pferdeliebehealthy.de/futterberatung | Ich sehe mir deine Ration an, rechne sie durch und sage dir, was als Erstes dran ist.]]

PS: Wenn dir das bekannt vorkommt, antworte einfach auf diese Mail.`,
  },

  {
    schluessel: "angebot",
    name: "Ein Angebot vorstellen",
    wofuer:
      "Wenn etwas Neues fertig ist. Zwei Drittel Nutzen, ein Drittel Angebot, nicht umgekehrt.",
    betreff: "Etwas Neues, an dem ich lange gesessen habe",
    vorschautext: "Und für wen es ausdrücklich nicht gedacht ist.",
    inhalt: `Hallo {{vorname}},

die Frage, die mich am häufigsten erreicht, ist nicht „Was soll ich füttern?". Sie lautet: „Ich weiss nicht, ob das, was ich füttere, überhaupt reicht."

Genau dafür habe ich in den letzten Wochen etwas gebaut.

## Worum es geht

Beschreib hier in drei, vier Sätzen, was das Angebot ist. Nicht, was drin ist, sondern was danach anders ist. Menschen kaufen kein Inhaltsverzeichnis, sie kaufen ein Ergebnis.

## Für wen es gedacht ist

- Für dich, wenn du dein Pferd selbst fütterst und wissen willst, ob es passt
- Für dich, wenn du zwischen drei Meinungen stehst und dich entscheiden musst
- Für dich, wenn du nicht wieder eine neue Dose kaufen willst

> Nicht gedacht ist es für akute Fälle. Wenn dein Pferd Schmerzen hat, lahmt oder nicht frisst, gehört das zum Tierarzt und nicht in einen Kurs.

[[angebot: Name des Angebots | 29 € | https://www.pferdeliebehealthy.de/ | Ein Satz dazu, was danach anders ist.]]

---

" Ich hatte drei Jahre lang das Gefühl, immer nur zu raten. Nach zwei Wochen wusste ich zum ersten Mal, warum ich was füttere. | Eine Kundin, Sommer 2026

PS: Wenn du unsicher bist, ob das für dich passt, schreib mir. Ich sage dir ehrlich, wenn es nicht das Richtige ist.`,
  },

  {
    schluessel: "saison",
    name: "Zur Jahreszeit",
    wofuer:
      "Der Klassiker im Frühjahr und Herbst. Kurz, praktisch, direkt umsetzbar.",
    betreff: "Der Fellwechsel steht an, drei Dinge für die nächsten Wochen",
    vorschautext: "Kurz und praktisch, in fünf Minuten gelesen.",
    inhalt: `Hallo {{vorname}},

die Tage werden kürzer, und damit beginnt für jedes Pferd die anstrengendste Zeit des Jahres. Drei Dinge, die jetzt wirklich zählen.

## Erstens: Heu vor allem anderen

Der Fellwechsel kostet Eiweiss und Energie. Beides kommt aus dem Heu, nicht aus einer Dose. Wenn die Raufe leer ist, hilft auch das beste Mineralfutter nicht.

## Zweitens: Zink und Kupfer im richtigen Verhältnis

Nicht mehr Zink, sondern das passende Verhältnis. Wenn dein Mineralfutter neunmal so viel Zink wie Kupfer enthält, arbeitet es gegen sich selbst.

## Drittens: Geduld

Ein Fellwechsel dauert sechs bis acht Wochen. Wer in Woche zwei die dritte Dose dazustellt, sieht nicht, was gewirkt hat.

[[knopf: Mehr zum Fellwechsel | https://www.pferdeliebehealthy.de/blog]]

PS: Nächste Woche schreibe ich dir, woran du erkennst, ob dein Heu wirklich trägt.`,
  },
];

export function vorlageFinden(schluessel: string): Vorlage {
  return VORLAGEN.find((v) => v.schluessel === schluessel) ?? VORLAGEN[0];
}
