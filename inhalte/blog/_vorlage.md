---
titel: "So schreibst du einen Blogbeitrag"
datum: 2026-09-01
aktualisiert:
kategorie: "Sonstiges"
angebot: ""
bild: ""
bildText: ""
beschreibung: "Diese Datei ist eine Vorlage. Sie erscheint nicht auf der Website, weil ihr Name mit einem Unterstrich beginnt."
---

Diese Datei ist eine **Vorlage**. Sie taucht nirgends auf der Website auf, weil
ihr Dateiname mit einem Unterstrich beginnt. Kopiere sie, wenn du einen neuen
Beitrag schreiben willst.

## Blog oder Insider?

Das ist die erste Frage, und sie entscheidet, in welchen Ordner die Datei
gehört.

**In den Blog** (`inhalte/blog`) kommt alles, was gefunden werden soll. Der
Blog steht offen, jede kann ihn lesen, Google auch. Schreib hierhin die
Themen, nach denen Leute suchen: Beschwerdebilder, Grundlagen, Fragen aus dem
Stall.

**In den Insider-Kanal** (`inhalte/insider`) kommt, was die Anmeldung wert
macht: persönliche Fälle, deine Meinung zu Produkten, alles, was du nicht im
offenen Netz stehen haben willst.

Ein Text gehört in genau einen der beiden Ordner. Denselben Beitrag an beiden
Stellen zu haben schadet, weil Google nicht weiß, welche der zwei Adressen die
richtige ist, und dann oft keine von beiden zeigt.

## So legst du einen Beitrag an

1. Kopiere diese Datei im selben Ordner.
2. Gib der Kopie einen Namen ohne Unterstrich, zum Beispiel
   `kotwasser-beim-pferd.md`. Nur Kleinbuchstaben und Bindestriche, keine
   Umlaute, keine Leerzeichen.
3. Ändere oben zwischen den drei Strichen die Angaben.
4. Schreib deinen Text darunter.

Der Dateiname wird zur Adresse. Aus `kotwasser-beim-pferd.md` wird
`pferdeliebehealthy.de/blog/kotwasser-beim-pferd`.

**Der Dateiname sollte das Wort enthalten, nach dem gesucht wird.** Bei einem
Beitrag über Kotwasser also `kotwasser-beim-pferd` und nicht
`wenn-hinten-etwas-tropft`. Der Titel darf klingen, wie du magst, die Adresse
sollte nüchtern sein.

## Die Angaben oben zwischen den Strichen

**`titel`** — die Überschrift des Beitrags. Am besten steht auch hier das Wort
darin, nach dem jemand sucht. „Kotwasser beim Pferd" findet man, „Wenn der
Darm aus dem Takt ist" nicht.

**`beschreibung`** — der wichtigste Satz am ganzen Beitrag. Er steht bei Google
unter dem Titel und entscheidet, ob jemand klickt. Ein bis zwei Sätze, die das
Thema nennen und einen Grund geben weiterzulesen.

**`datum`** — wann der Beitrag erschienen ist.

**`aktualisiert`** — wann du ihn zuletzt fachlich überarbeitet hast. Lass die
Zeile leer, solange sich nichts geändert hat. Sobald du etwas änderst, trag
das Datum ein: Ein gepflegter Fachtext wird besser bewertet als einer, der
seit Jahren unberührt daliegt, und unter dem Beitrag steht dann ein Hinweis
darauf.

**`kategorie`** — wird auf der Übersicht zum Filterknopf. Bisher verwendet:
`Magen und Darm`, `Haut, Fell und Hufe`, `Nährstoffe`, `Kritische
Futtermittel`, `Grundlagen`, `Durchs Jahr`, `Heu und Grundfutter`,
`Stoffwechsel` und `Kräuter und Öle`. Nimm eine davon, wenn sie passt. Sonst entsteht für jeden Beitrag eine eigene Kategorie, und dann
filtert man nichts mehr. Die Kategorie steuert außerdem, welche Beiträge unter
dem Text als „Weiterlesen" vorgeschlagen werden.

**`angebot`** — welches deiner Angebote unter dem Beitrag empfohlen wird.
Möglich sind `mineral`, `ratiopro`, `ganzjahresfutterplan`, `futter-check`
und `masterclass`. **Lass die Zeile leer, wenn keins wirklich passt.**

**`bild`** und **`bildText`** — ein Foto oben im Beitrag. Leg die Datei unter
`public/images/blog/` ab und schreib hier den Pfad hinein, zum Beispiel
`/images/blog/kotwasser.jpg`. Der `bildText` steht als Zeile unter dem Bild
und wird von Vorlesegeräten genutzt.

## Wie du formatierst

Eine Überschrift beginnt mit `##`, eine kleinere mit `###`.

Ein **fetter Text** steht zwischen zwei Sternchen, ein *kursiver* zwischen
einem. Ein Absatz entsteht durch eine Leerzeile.

Aufzählungen funktionieren so:

- Erster Punkt
- Zweiter Punkt

Ein Link sieht so aus: [zum Futter-Check](/futter-check-start).

> So sieht ein hervorgehobenes Zitat aus. Gut für den einen Satz, den die
> Leserin mitnehmen soll.

## Einen Partner empfehlen

Schreib an die Stelle im Text, an die die Empfehlung gehört, eine Zeile für
sich:

    [[partner:pernaturam]]

Daraus wird ein Kasten mit Name, Beschreibung, deinem Rabattcode und einem
Knopf zum Shop. Die Angaben kommen aus deiner Empfehlungsseite, stehen also
nur an einer Stelle: Änderst du dort einen Code, ändert er sich in allen
Beiträgen mit.

Diese Kurznamen gibt es:

- `biohof-elmengrund`, `pernaturam`, `mo-s-grun`, `hotte-maxe`, `natusat`
- `foten`, `cdvet`, `naturanima`, `baeralis`, `mycelium-vitalpilze`

**Um die Werbekennzeichnung musst du dich nicht kümmern.** Die Seite schaut
selbst nach, ob im Beitrag ein Rabattcode, ein Partnerlink oder ein
Partnerkasten steht, und setzt den Hinweis dann von allein oben unter die
Einleitung. Das ist Absicht: Eine vergessene Kennzeichnung ist abmahnbar, und
etwas, das man vergessen kann, sollte nicht davon abhängen, dass man daran
denkt.

Setz den Kasten dahin, wo er inhaltlich hingehört, also hinter den Absatz, der
das Thema erklärt. Nicht ans Ende des Beitrags und nicht direkt hinter einen
Hinweis auf den Tierarzt.

## Auf andere Beiträge verweisen

Ein Link auf einen anderen Beitrag sieht so aus:

    [Darmflora](/blog/gesunder-darm-gesundes-pferd-was-wirklich-hinter-darmproblemen-steckt)

Das ist mehr als Bequemlichkeit für die Leserin. Suchmaschinen folgen Links:
Ein Beitrag, auf den nur die Übersicht zeigt, gilt als Randnotiz, einer, auf
den fünf andere verweisen, als Kernthema der Seite. Drei bis vier Verweise je
Beitrag sind genug, mehr liest sich wie eine Linksammlung.

## Was einen guten Blogbeitrag ausmacht

**Beantworte die Frage im ersten Absatz.** Wer „Kotwasser Pferd" googelt, will
nicht erst deine Geschichte lesen. Sag früh, worum es geht, und erklär danach.
Das ist der Unterschied zum Insider-Beitrag, wo du erzählen darfst.

**Nutze Zwischenüberschriften.** Die meisten lesen am Handy und überfliegen
zuerst. Wer nur die Überschriften liest, soll trotzdem verstanden haben,
worauf es hinausläuft.

**Schreib über eine Sache.** Ein Beitrag, der Kotwasser, Mauke und Fellwechsel
gleichzeitig behandelt, bleibt bei niemandem hängen und wird auch von Google
zu keinem der drei Themen gezeigt.

**Sag, wann ein Tierarzt gefragt ist.** Das ist fachlich richtig, und es ist
das, was dich von den Ratgeberseiten unterscheidet, die alles mit Kräutern
lösen wollen.
