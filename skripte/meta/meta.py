# ---------------------------------------------------------------------------
# Kampagnen bei Meta anlegen, ohne sich durch den Werbeanzeigenmanager zu
# klicken.
#
# WARUM ES DAS GIBT: Die erste Kampagne von Hand hat am 10. und 11.09.2026
# einen ganzen Tag gekostet. Yasemin: „Das muss schneller gehen.“ Ab jetzt
# beschreibt eine JSON-Datei die Kampagne, dieses Skript legt sie an, und
# Yasemin schaltet sie im Werbeanzeigenmanager nur noch ein.
#
# ALLES ENTSTEHT PAUSIERT. Eingeschaltet wird nie von hier aus, sondern von
# Yasemin, nachdem sie drübergeschaut hat.
#
# Aufruf (aus diesem Ordner):
#   python meta.py pruefen                  liest nur: Konto, Seite, Instagram,
#                                           Zielgruppen, Pixel. Legt nichts an.
#   python meta.py anlegen kampagne.json    legt eine Kampagne aus der Datei an
#
# Der Zugang steht als META_ZUGRIFF in ../../.env.local (nicht im Projekt
# versioniert). Er darf Anzeigen anlegen: nie in eine Datei im Projekt, nie in
# eine Mail, nie in den Chat.
#
# Aufbau einer Kampagnendatei: siehe beispiel-kampagne.json daneben.
# ---------------------------------------------------------------------------
import json, sys, pathlib, urllib.parse, urllib.request, urllib.error

VERSION = "v23.0"
KONTO = "act_87791925"
PIXEL = "1061479973538555"

# Seite und Instagram-Konto, unter denen die Anzeigen erscheinen. Ausgelesen
# am 11.09.2026 aus den laufenden Equista-Anzeigen. Über die Seite selbst
# kommt der Schlüssel nicht an das Instagram-Konto (dafür bräuchte es einen
# Seiten-Schlüssel), und `me/accounts` liefert die Seite nicht. Das Werbekonto
# kennt sie aber über `promote_pages`, das wird zur Sicherheit geprüft.
# ACHTUNG: In älteren Anzeigen steht ein anderes Instagram-Konto
# (17841458554986326) und die Glückspferdchen-Seite 105853909900928. Nicht
# verwechseln.
SEITE = "104031209322367"
INSTAGRAM = "17841466406397108"
HIER = pathlib.Path(__file__).resolve().parent
UMGEBUNG = HIER.parent.parent / ".env.local"

# Worauf eine Kampagne zielt, und was Meta dafür braucht.
ZIELE = {
    "verkauf": {"objective": "OUTCOME_SALES", "ereignis": "PURCHASE"},
    "anmeldungen": {"objective": "OUTCOME_LEADS", "ereignis": "LEAD"},
}

# Metas KI-Veränderungen an Text, Bild und Knopf. Alle aus: Eine KI, die den
# Text „verbessert“, kann eine Heilaussage hineinschreiben, für die Yasemin
# haftet. Meta benennt diese Schalter gelegentlich um; lehnt die Schnittstelle
# einen Namen ab, legt das Skript ohne sie an und sagt Bescheid.
KI_AUS = ["image_touchups", "text_optimizations", "inline_comment",
          "image_brightness_and_contrast", "enhance_cta", "add_text_overlay",
          "image_templates", "music"]


def zugang():
    if UMGEBUNG.exists():
        for z in UMGEBUNG.read_text(encoding="utf-8").splitlines():
            if z.startswith("META_ZUGRIFF="):
                return z.split("=", 1)[1].strip().strip('"')
    sys.exit("META_ZUGRIFF fehlt in .env.local")


TOKEN = ""


class MetaFehler(Exception):
    pass


def graph(methode, pfad, daten=None):
    adresse = f"https://graph.facebook.com/{VERSION}/{pfad}"
    if methode == "GET":
        req = urllib.request.Request(adresse + ("&" if "?" in adresse else "?")
                                     + urllib.parse.urlencode({"access_token": TOKEN}))
    else:
        felder = {k: (json.dumps(v, ensure_ascii=False) if isinstance(v, (dict, list)) else v)
                  for k, v in (daten or {}).items()}
        felder["access_token"] = TOKEN
        req = urllib.request.Request(adresse, data=urllib.parse.urlencode(felder).encode("utf-8"), method="POST")
    try:
        with urllib.request.urlopen(req) as a:
            antwort = json.loads(a.read().decode("utf-8"))
    except urllib.error.HTTPError as f:
        antwort = json.loads(f.read().decode("utf-8") or "{}")
    # Meta schickt manche Fehler mit Status 200 und einem Feld „error“ (am
    # 12.09.2026 die Sicherheitsprüfung „Bitte authentifiziere dein Konto“).
    # Ohne diese Prüfung lief das Werkzeug weiter und brach dann an einer
    # fehlenden Kennung ab.
    if isinstance(antwort, dict) and "error" in antwort:
        fehler = antwort["error"]
        raise MetaFehler(" | ".join(x for x in [fehler.get("message"), fehler.get("error_user_title"),
                                                 fehler.get("error_user_msg")] if x))
    return antwort


def grundlagen():
    konto = graph("GET", f"{KONTO}?fields=name,currency,timezone_name,account_status,balance")
    seiten = graph("GET", f"{KONTO}/promote_pages?fields=id,name")["data"]
    seite = next((s for s in seiten if s["id"] == SEITE), None)
    ig = {"id": INSTAGRAM, "username": "pferdeliebehealthy"} if seite else None
    zielgruppen = graph("GET", f"{KONTO}/customaudiences?fields=id,name&limit=200")["data"]
    pixel = graph("GET", f"{PIXEL}?fields=name,last_fired_time")
    return konto, seite, ig, zielgruppen, pixel


def pruefen():
    konto, seite, ig, zielgruppen, pixel = grundlagen()
    print("Werbekonto:", konto.get("name"), konto.get("currency"), konto.get("timezone_name"),
          "Status", konto.get("account_status"))
    print("Facebook-Seite:", seite and f'{seite["name"]} ({seite["id"]})')
    print("Instagram:", ig and f'{ig.get("username")} ({ig["id"]})')
    print("Zielgruppen:", ", ".join(z["name"] for z in zielgruppen) or "keine")
    print("Pixel:", pixel.get("name"), "zuletzt aktiv", pixel.get("last_fired_time"))
    return seite, ig, zielgruppen


def anlegen(datei):
    plan = json.loads(pathlib.Path(datei).read_text(encoding="utf-8"))
    ziel = ZIELE[plan["kampagne"]["ziel"]]
    seite, ig, zielgruppen = pruefen()
    if not (seite and ig):
        sys.exit("Seite oder Instagram-Konto fehlt, deshalb wird nichts angelegt.")

    # Erst alles prüfen, dann anlegen: Ein Fehler mittendrin hinterliesse eine
    # halbe Kampagne.
    for a in plan["anzeigen"]:
        if not pathlib.Path(a["bild"]).exists():
            sys.exit(f"Bild fehlt: {a['bild']}")
        if "?von=meta-" not in a["link"]:
            sys.exit(f"Link ohne ?von=meta-…: {a['link']}. Ohne die Kennung zählt /admin/werbung nichts.")
    ag = plan["anzeigengruppe"]
    ca = None
    if ag.get("custom_audience"):
        ca = next((z for z in zielgruppen if z["name"] == ag["custom_audience"]), None)
        if not ca:
            sys.exit(f"Zielgruppe nicht gefunden: {ag['custom_audience']}")

    # ▸ ERST DIE ANZEIGEN, DANN DIE KAMPAGNE. Bilder und Anzeigenbeiträge
    #   hängen an keiner Kampagne und lassen sich vorab anlegen. Scheitern sie
    #   (am 11.09.2026: „App im Entwicklungsmodus“), bleibt so keine halbe,
    #   leere Kampagne im Werbekonto liegen.
    protokoll = {"datei": str(datei), "anzeigen": {}}
    hinweise = []
    kreative = []
    import base64
    for a in plan["anzeigen"]:
        roh = base64.b64encode(pathlib.Path(a["bild"]).read_bytes()).decode("ascii")
        bild = graph("POST", f"{KONTO}/adimages", {"bytes": roh})
        bild_hash = next(iter(bild["images"].values()))["hash"]
        kreativ_daten = {
            "name": f'{plan["kampagne"]["name"]} · {a["name"]}',
            "object_story_spec": {
                "page_id": seite["id"],
                "instagram_user_id": ig["id"],
                "link_data": {
                    "link": a["link"],
                    "message": a["text"],
                    "name": a["ueberschrift"],
                    "description": a["beschreibung"],
                    "image_hash": bild_hash,
                    "call_to_action": {"type": "LEARN_MORE", "value": {"link": a["link"]}},
                },
            },
            "degrees_of_freedom_spec": {"creative_features_spec": {f: {"enroll_status": "OPT_OUT"} for f in KI_AUS}},
        }
        try:
            kreativ = graph("POST", f"{KONTO}/adcreatives", kreativ_daten)
        except MetaFehler as f:
            if "Entwicklungsmodus" in str(f) or "development mode" in str(f).lower():
                raise
            hinweise.append(f'{a["name"]}: KI-Schalter nicht gesetzt ({f}). Im Werbeanzeigenmanager bei „Standardeinstellungen überprüfen“ ausschalten.')
            del kreativ_daten["degrees_of_freedom_spec"]
            kreativ = graph("POST", f"{KONTO}/adcreatives", kreativ_daten)
        kreative.append((a, kreativ["id"]))
        print("Anzeigenbeitrag vorbereitet:", a["name"])

    kampagne = graph("POST", f"{KONTO}/campaigns", {
        "name": plan["kampagne"]["name"],
        "objective": ziel["objective"],
        "status": "PAUSED",
        "special_ad_categories": [],
        "daily_budget": int(round(plan["kampagne"]["tagesbudget_eur"] * 100)),
        "bid_strategy": "LOWEST_COST_WITHOUT_CAP",
    })
    protokoll["kampagne"] = kampagne["id"]
    print("Kampagne angelegt:", kampagne["id"])

    targeting = {"geo_locations": {"countries": ag.get("laender", ["DE", "AT", "CH"])}, "age_min": 18}
    if ca:
        targeting["custom_audiences"] = [{"id": ca["id"]}]
    # Nur die angegebene Zielgruppe, nicht darüber hinaus, wenn so gewünscht.
    targeting["targeting_automation"] = {"advantage_audience": 0 if ag.get("nur_custom_audience") else 1}
    gruppe = graph("POST", f"{KONTO}/adsets", {
        "name": ag["name"],
        "campaign_id": kampagne["id"],
        "status": "PAUSED",
        "billing_event": "IMPRESSIONS",
        "optimization_goal": "OFFSITE_CONVERSIONS",
        "promoted_object": {"pixel_id": PIXEL, "custom_event_type": ziel["ereignis"]},
        "targeting": targeting,
        "dsa_beneficiary": "Pferdeliebehealthy (Yasemin Halac)",
        "dsa_payor": "Yasemin Halac",
    })
    protokoll["anzeigengruppe"] = gruppe["id"]
    print("Anzeigengruppe angelegt:", gruppe["id"])

    for a, kreativ_id in kreative:
        anzeige = graph("POST", f"{KONTO}/ads", {
            "name": a["name"], "adset_id": gruppe["id"],
            "creative": {"creative_id": kreativ_id}, "status": "PAUSED",
        })
        protokoll["anzeigen"][a["name"]] = anzeige["id"]
        print("Anzeige angelegt:", a["name"], anzeige["id"])

    (HIER / "protokoll.json").write_text(json.dumps(protokoll, indent=2, ensure_ascii=False), encoding="utf-8")
    print("\nFertig. Alles PAUSIERT, bitte im Werbeanzeigenmanager ansehen und die Kampagne einschalten.")
    for h in hinweise:
        print("Hinweis:", h)


if __name__ == "__main__":
    TOKEN = zugang()
    try:
        if len(sys.argv) > 2 and sys.argv[1] == "anlegen":
            anlegen(sys.argv[2])
        else:
            pruefen()
    except MetaFehler as f:
        sys.exit(f"Meta lehnt ab: {f}")
