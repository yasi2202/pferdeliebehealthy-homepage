// ---------------------------------------------------------------------------
// Findet deine Telegram-Chat-ID und schickt eine Probenachricht.
//
// Aufruf aus dem Projektordner:
//
//     node scripts/telegram-einrichten.mjs 123456789:AAF-dein-schluessel
//
//
// ▸ VORHER, IN TELEGRAM AUF DEM HANDY
//   1. Nach @BotFather suchen (der offizielle Bot von Telegram, blauer
//      Haken) und ihn anschreiben.
//   2. /newbot schicken. Er fragt nach einem Namen (zum Beispiel
//      "Pferdeliebehealthy Kasse") und nach einem Benutzernamen, der auf
//      "bot" enden muss (zum Beispiel "pferdeliebe_kasse_bot").
//   3. Er antwortet mit einem langen Schluessel. Den gibst du diesem Skript
//      mit, in Anfuehrungszeichen, falls er Sonderzeichen enthaelt.
//   4. DEINEN EIGENEN BOT oeffnen, nicht den BotFather. Am einfachsten ueber
//      den Link t.me/deinbotname, den der BotFather mitschickt. Unten steht
//      dann ein Knopf START. Erst darauf tippen, danach "hallo" schicken.
//
//      DIESER SCHRITT IST PFLICHT. Ein Bot darf niemandem von sich aus
//      schreiben. Erst wenn du ihn angeschrieben hast, kennt er dich, und
//      erst dann findet dieses Skript deine Chat-ID. Ein "hallo" an den
//      BotFather zaehlt nicht, das ist ein anderer Chat.
//
// ▸ WAS DANACH ZU TUN IST
//   Die beiden Werte, die unten ausgegeben werden, in die Vercel-Einstellungen
//   des Projekts eintragen (Settings, Environment Variables), fuer alle drei
//   Umgebungen, und danach einmal neu veroeffentlichen. Erst dann melden sich
//   die Verkaeufe.
//
// ▸ WARUM ALLES IN EINER FUNKTION STEHT
//   Unter Windows reisst process.exit() die noch offene Verbindung zu
//   Telegram mit und Node wirft danach einen Assertion-Fehler ueber den
//   eigentlichen Text. Mit einem schlichten return passiert das nicht.
// ---------------------------------------------------------------------------

async function haupt() {
  const token = process.argv[2];

  if (!token) {
    console.error(
      "\nEs fehlt der Schluessel.\n\n" +
        "  node scripts/telegram-einrichten.mjs 123456789:AAF-dein-schluessel\n",
    );
    process.exitCode = 1;
    return;
  }

  const api = (methode) => `https://api.telegram.org/bot${token}/${methode}`;

  // 1. Stimmt der Schluessel ueberhaupt?
  const wer = await fetch(api("getMe")).then((r) => r.json());

  if (!wer.ok) {
    console.error(
      `\nTelegram kennt diesen Schluessel nicht: ${wer.description}\n\n` +
        "Haeufigster Grund: beim Kopieren aus dem Chat ist ein Zeichen\n" +
        "verlorengegangen. Der Schluessel besteht aus einer Zahl, einem\n" +
        "Doppelpunkt und einer langen Zeichenfolge.\n",
    );
    process.exitCode = 1;
    return;
  }

  console.log(`\nDer Bot heisst @${wer.result.username}. Der Schluessel stimmt.`);

  // 2. Wer hat ihm geschrieben?
  //
  //    Falls noch niemand, warten wir hier ein paar Minuten und fragen immer
  //    wieder nach. So laesst sich das Handy in Ruhe zur Hand nehmen, ohne
  //    dass das Skript zwischendurch noch einmal gestartet werden muss.
  const chats = new Map();
  const bis = Date.now() + 4 * 60 * 1000;
  let gewartet = false;

  while (chats.size === 0) {
    const post = await fetch(api("getUpdates")).then((r) => r.json());

    // Telegram gibt die Nachrichten an einen Bot nur EINMAL heraus, und immer
    // nur an einen Abholer. Laeuft dieses Skript zweimal gleichzeitig, schnappt
    // ein Lauf dem anderen die Nachricht weg und beide sehen nichts. Genau das
    // ist am 05.09.2026 passiert und hat eine halbe Stunde gekostet: Die
    // Nachrichten waren laengst da, die Abfrage lieferte trotzdem eine leere
    // Liste. Deshalb hier nicht weiterlaufen, sondern deutlich sagen, was los
    // ist.
    if (post.ok === false && post.error_code === 409) {
      console.error(
        "\nEs laeuft noch ein zweites Mal dasselbe Skript, die beiden\n" +
          "nehmen sich gegenseitig die Nachrichten weg.\n\n" +
          "Schliess das andere Fenster, oder beende alle Node-Vorgaenge, und\n" +
          "schick dem Bot danach eine NEUE Nachricht. Die alten sind dann\n" +
          "leider schon verbraucht.\n",
      );
      process.exitCode = 1;
      return;
    }

    for (const eintrag of post.result ?? []) {
      const chat = eintrag.message?.chat ?? eintrag.channel_post?.chat;
      if (chat) chats.set(chat.id, chat);
    }

    if (chats.size > 0) break;

    if (!gewartet) {
      console.log(
        "\nNoch hat niemand diesem Bot geschrieben. Ich warte hier vier\n" +
          "Minuten und schaue immer wieder nach.\n\n" +
          `  Oeffne https://t.me/${wer.result.username} auf dem Handy.\n` +
          `  Oben im Chat muss "${wer.result.first_name}" stehen, nicht BotFather.\n` +
          '  Unten auf START tippen, danach "hallo" schicken.\n',
      );
      gewartet = true;
    }

    if (Date.now() > bis) {
      console.error(
        "\nEs kam nichts an, ich hoere hier auf.\n\n" +
          "Haeufigster Grund: Es war der falsche Chat. Ein 'hallo' an den\n" +
          "BotFather zaehlt nicht, das ist ein anderer Bot. Es muss dein\n" +
          `eigener sein, @${wer.result.username}.\n\n` +
          "Starte das Skript danach einfach noch einmal.\n",
      );
      process.exitCode = 1;
      return;
    }

    await new Promise((weiter) => setTimeout(weiter, 3000));
  }

  if (chats.size > 1) {
    console.log("\nMehrere Unterhaltungen gefunden:");
    for (const chat of chats.values()) {
      const name = [chat.first_name, chat.last_name].filter(Boolean).join(" ");
      console.log(`  ${chat.id}  ${name || chat.title || chat.username || ""}`);
    }
    console.log("\nGenommen wird die letzte davon.\n");
  }

  const chat = [...chats.values()].at(-1);

  // 3. Eine Probe aufs Handy, damit du es siehst und nicht nur glaubst.
  const probe = await fetch(api("sendMessage"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chat.id,
      text:
        "💛 Das hat geklappt.\n\n" +
        "Ab jetzt melde ich dir hier jeden bezahlten Kauf, " +
        "und am Abend die Uebersicht des Tages.",
    }),
  }).then((r) => r.json());

  if (!probe.ok) {
    console.error(`\nDie Probenachricht ging nicht raus: ${probe.description}\n`);
    process.exitCode = 1;
    return;
  }

  console.log(
    "\nEine Probenachricht liegt auf deinem Handy.\n\n" +
      "Diese beiden Zeilen gehoeren in die Vercel-Einstellungen:\n\n" +
      `  TELEGRAM_BOT_TOKEN=${token}\n` +
      `  TELEGRAM_CHAT_ID=${chat.id}\n\n` +
      "Danach einmal neu veroeffentlichen, dann ist es scharf.\n",
  );
}

await haupt();
