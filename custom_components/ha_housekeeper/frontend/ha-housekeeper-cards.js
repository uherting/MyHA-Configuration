// GENERATED FILE - do not edit. Edit cards-src/*.js and run: node scripts/build_panel.mjs

const LANGUAGES = [{"code":"de","name":"Deutsch","patterns":["de"],"quotes":["„","“"],"lowerKind":false},{"code":"en","name":"English","patterns":["en"],"quotes":["“","”"],"lowerKind":true},{"code":"fr","name":"Français","patterns":["fr"],"quotes":["« "," »"],"lowerKind":true,"status":"community","v":"ccf6e77282"},{"code":"es","name":"Español","patterns":["es"],"quotes":["“","”"],"lowerKind":true,"status":"community","v":"5d0a1bfdd5"},{"code":"pt","name":"Português","patterns":["pt","pt-pt","pt-br"],"quotes":["«","»"],"lowerKind":true,"status":"community","v":"cb8c9a1377"},{"code":"it","name":"Italiano","patterns":["it"],"quotes":["«","»"],"lowerKind":true,"status":"community","v":"5ee44fcbef"},{"code":"sk","name":"Slovenčina","patterns":["sk"],"quotes":["„","“"],"lowerKind":false,"status":"community","v":"6b5aac0cb8"},{"code":"ru","name":"Русский","patterns":["ru"],"quotes":["«","»"],"lowerKind":false,"status":"community","v":"42be12290e"},{"code":"zh-Hans","name":"简体中文","patterns":["zh-hans","zh-cn","zh-sg"],"quotes":["“","”"],"lowerKind":false,"status":"community","v":"8c906e80f1"}];

// The languages of the panel. The list itself (LANGUAGES) is languages.json, put in front of the bundle by the build.

// The language for a Home Assistant language code: an exact match of a pattern, else the main part
// (de-AT -> de), else English. Written like this so zh-Hant does not fall to zh-Hans.
function matchLanguage(list, code) {
  const full = String(code || "en").toLowerCase().replace(/_/g, "-"), main = full.split("-")[0];
  const find = key => list.find(l => l.patterns.includes(key));
  return (find(full) || find(main))?.code || "en";
}

const languageInfo = code => LANGUAGES.find(l => l.code === code) || LANGUAGES.find(l => l.code === "en");

// A text with its own plural forms: the form of the number (`count`, else `n`, else the first number
// the text names, like {days}), else `other`.
// The number may already be formatted ("1.234", "1 234"): only its digits count. Plural texts are for whole numbers.
function pluralText(forms, lang, vars) {
  let form = "other";
  try {
    const toNumber = raw => (typeof raw === "number" ? raw : Number(String(raw).replace(/[^\d]/g, "") || NaN));
    const named = [...String(forms.other ?? "").matchAll(/\{(\w+)\}/g)].map(m => m[1]);
    const key = ["count", "n", ...named].find(k => vars && k in vars && !Number.isNaN(toNumber(vars[k])));
    form = new Intl.PluralRules(lang).select(toNumber(vars?.[key]));
  } catch (_) { /* no number: the general form */ }
  return forms[form] ?? forms.other ?? "";
}

// Texts of the Lovelace cards. German and English live here; every other language is a file,
// frontend/i18n/cards/<code>.json, that a card fetches once (see 20-texts.js). A text that is missing shows in English.
// Keys: card* are shown on a card, edit_* label the card editor (edit_<field>, edit_<field>_<option>, edit_<field>_help).
const CARD_TEXT = {
  de: {
    cardNotFound: "HA Housekeeper wurde nicht gefunden. Ist die Integration eingerichtet?",
    cardNoData: "Noch keine Daten: der erste Scan steht noch aus.",
    cardQuietHidden: "Im Ruhezustand ist diese Karte ausgeblendet. Im Editor siehst du sie trotzdem.",
    cardOpenPanel: "Im Panel öffnen →",
    edit_title: "Titel",
    edit_quiet: "Im Ruhezustand", edit_quiet_summary: "Zusammenfassung zeigen", edit_quiet_hide: "Karte ausblenden",
    edit_quiet_help: "Ruhezustand heißt: nichts zu tun. Ausgeblendet verschwindet die Karte vom Dashboard, bis wieder etwas anliegt.",
    edit_tap: "Tipp öffnet", edit_tap_panel: "Panel von Housekeeper", edit_tap_none: "Nichts",
    edit_tap_help: "Ins Panel kommen nur Administratoren.",
    edit_compact: "Kompakt",
    cardTopic_down: "Ausgefallen",
    cardTopic_broken_references: "Kaputte Verweise",
    cardTopic_failing_automations: "Fehlerhafte Automationen",
    cardTopic_unneeded: "Überflüssig",
    cardHealthOk: "Alles in Ordnung",
    cardHealthAttention: {"one": "{n} Objekt braucht Aufmerksamkeit", "other": "{n} Objekte brauchen Aufmerksamkeit"},
    cardHealthUrgent: "Es gibt Dringendes",
    cardHealthScanBad: "Der Scan läuft nicht durch",
    cardScanOld: "Die Zahlen können veraltet sein.",
    cardLastScan: "Letzter Scan {ago}",
    cardScan: "Scan",
    cardScanning: "Scan läuft …",
    cardSince: "Seit dem letzten Scan:",
    cardNew: "+{n} neu",
    cardResolved: "−{n} behoben",
    cardNoChanges: "Keine Änderungen seit dem letzten Scan",
    cardNoFindings: "Keine offenen Befunde",
    edit_tiles: "Kacheln",
    edit_tiles_findings: "Nur bei Befunden",
    edit_tiles_always: "Immer",
    edit_tiles_never: "Nie",
    edit_changes: "Änderungen seit dem letzten Scan zeigen",
    edit_scan_button: "Scan-Knopf zeigen",
    edit_scan_button_help: "Nur Administratoren sehen den Knopf.",
    cardBatTitle: "Batterien",
    cardBatWeakestSub: "Schwächste {n} von {total}",
    cardBatRoundSub: {"one": "In den nächsten {days} Tagen: {n} Batterie", "other": "In den nächsten {days} Tagen: {n} Batterien"},
    cardBatLowChip: {"one": "{n} schwach", "other": "{n} schwach"},
    cardBatAllGood: "Alles gut",
    cardBatQuietSub: "{total} überwacht · niedrigste {lowest} %",
    cardBatQuietFoot: "Keine Batterie unter dem Grenzwert",
    cardBatNext: "Nächster Wechsel voraussichtlich im {when}",
    cardBatLowNow: "Wechsel fällig",
    cardBatDays: {"one": "ca. {n} Tag", "other": "ca. {n} Tage"},
    cardBatWeeks: {"one": "ca. {n} Woche", "other": "ca. {n} Wochen"},
    cardBatMonths: {"one": "ca. {n} Monat", "other": "ca. {n} Monate"},
    cardBatSoon: "in Kürze",
    cardBatStable: "kaum Verbrauch",
    cardBatFollows: "Prognose folgt",
    cardBatQEstimate: "Schätzung",
    cardBatQStable: "stabil",
    cardBatQFew: "zu wenig Daten",
    cardBatRound: "Wechselrunde",
    cardBatNoArea: "Ohne Bereich",
    cardBatShopping: "Einkaufsliste",
    cardBatUnknown: "Typ unbekannt",
    cardBatUnknownHint: "Typ im Panel setzen",
    cardBatNoRechargeable: "Akkus („Rechargeable“) stehen nicht auf der Liste",
    edit_view: "Ansicht",
    edit_view_weakest: "Schwächste",
    edit_view_round: "Wechselrunde",
    edit_view_both: "Beides",
    edit_rows: "Zeilen bei „Schwächste“",
    edit_shopping: "Einkaufsliste zeigen",
    edit_shopping_help: "Die Einkaufsliste gehört zur Wechselrunde.",
    edit_forecast: "Prognose und Güte zeigen",
    cardFnTitle: "Hausfunktionen",
    cardFnCount: {"one": "{n} Funktion", "other": "{n} Funktionen"},
    cardFnProblems: {"one": "{n} gestört", "other": "{n} gestört"},
    cardFnUnverified: {"one": "{n} nicht überprüfbar", "other": "{n} nicht überprüfbar"},
    cardFnAllOk: "Alles in Ordnung",
    cardFnMembers: {"one": "{ok} von {total} Objekt erreichbar", "other": "{ok} von {total} Objekten erreichbar"},
    cardFnDown: "{name} ist nicht erreichbar",
    cardFnStale: "{name} meldet nichts mehr",
    cardFnBelow: "{name} liegt unter dem Mindestwert",
    cardFnMemberOff: "{name} ist deaktiviert",
    cardFnOff: "Funktion ausgeschaltet",
    cardFnUnsure: "Zustand nicht sicher bekannt",
    cardFnWindow: "{n} Tage",
    cardFnNone: "Noch keine Hausfunktion angelegt. Du legst sie im Panel an.",
    edit_entities: "Funktionen",
    edit_entities_help: "Leer lassen für alle Funktionen.",
    edit_history: "Verlauf",
    edit_history_30: "30 Tage",
    edit_history_14: "14 Tage",
    edit_history_7: "7 Tage",
    edit_history_0: "Aus",
    cardApTitle: "Pausierte Integrationen",
    cardApOnSub: "Auto-Pause ist an",
    cardApChip: {"one": "{n} pausiert", "other": "{n} pausiert"},
    cardApNone: "Keine Integration pausiert",
    cardApAllRuns: "Alles läuft",
    cardApOff: "Auto-Pause ist aus",
    cardApOffSub: "Housekeeper pausiert nichts von selbst",
    cardApEnable: "Im Panel einschalten →",
    cardApWhyAuto: {"one": "{n} Fehlversuch", "other": "{n} Fehlversuche"},
    cardApWhyManual: "von dir pausiert",
    cardApSince: "pausiert {ago}",
    cardApNext: "Nächster Versuch {when}",
    cardApTrying: "Versuch läuft …",
    cardApExhausted: {"one": "Aufgegeben: nach {n} Tag nicht wieder eingerichtet", "other": "Aufgegeben: nach {n} Tagen nicht wieder eingerichtet"},
    cardApStep: "Versuch {done} von {total} · alle {step} Std.",
    cardApFoot: {"one": "Die Pause endet spätestens nach {n} Tag", "other": "Die Pause endet spätestens nach {n} Tagen"},
    cardApMenu: "Aktionen",
    cardApTry: "Jetzt versuchen",
    cardApResume: "Pause beenden",
    cardApNever: "Nie pausieren",
    cardApOpen: "Im Panel öffnen",
    cardApTried: "Neuer Versuch gestartet",
    cardApResumed: "Pause beendet",
    cardApExcluded: "Von der Auto-Pause ausgenommen",
    cardApFailed: "Das hat nicht geklappt: {detail}",
    edit_actions: "Aktionen im Menü",
    edit_actions_help: "Nur Administratoren sehen das Menü.",
    edit_progress: "Fortschritt der Versuche zeigen",
    cardUpTitle: "Nach dem Update",
    cardUpNone: "Es wurde noch kein Update beobachtet.",
    cardUpHidden: "Diese Karte erscheint nur kurz nach einem Update. Im Editor siehst du sie trotzdem.",
    cardUpWorse: "Seit dem Update läuft etwas nicht mehr",
    cardUpPending: "Housekeeper prüft nach dem Update",
    cardUpFine: "Update ohne Auffälligkeiten",
    cardUpUnknown: "Nach dem Update nicht sicher zu sagen",
    cardUpChip: {"one": "{n} Ding", "other": "{n} Dinge"},
    cardUpAllFine: "Alles läuft",
    cardUpFirstCheck: "Die erste Prüfung kommt {when}.",
    cardUpFineNote: "Nichts läuft schlechter als vor dem Update.",
    cardUpTransientNote: {"one": "{n} Objekt war kurz weg und ist wieder da.", "other": "{n} Objekte waren kurz weg und sind wieder da."},
    cardUpUnknownNote: "Housekeeper konnte nicht alles lesen. Das Urteil steht noch aus.",
    cardUpHa: "Home Assistant {to}",
    cardUpOs: "Betriebssystem {to}",
    cardUpSupervisor: "Supervisor {to}",
    cardUpType_config_entry: "Integration",
    cardUpType_device: "Gerät",
    cardUpType_automation: "Automation",
    cardUpType_script: "Skript",
    cardUpType_scene: "Szene",
    cardUpType_entity: "Entität",
    cardUpType_other: "Objekt",
    cardUpStatus_unavailable: "Nicht erreichbar",
    cardUpStatus_problem: "Problem",
    cardUpStatus_stopped: "Gestoppt",
    cardUpMore: {"one": "und {n} weiteres", "other": "und {n} weitere"},
    cardUpFindings: {"one": "{n} neuer Befund", "other": "{n} neue Befunde"},
    cardUpRepairs: {"one": "{n} neuer Reparaturhinweis", "other": "{n} neue Reparaturhinweise"},
    cardUpStart: "Start dauerte {took} (sonst {usual})",
    cardUpStartOnly: "Start dauerte {took}",
    cardDurMin: "{m} min {s} s",
    cardDurSec: "{s} s",
    edit_show_hours: "Sichtbar nach dem Update",
    edit_show_hours_1: "1 Stunde",
    edit_show_hours_3: "3 Stunden",
    edit_show_hours_6: "6 Stunden",
    edit_show_hours_24: "24 Stunden",
    edit_start: "Startdauer zeigen",
    cardOvHealth: "Zustand",
    cardOvBatteries: "Batterien",
    cardOvFunctions: "Funktionen",
    cardOvAutoPause: "Auto-Pause",
    cardOvUpdate: "Update",
    cardOvStart: "Startzeit",
    cardOvDatabase: "Datenbank",
    cardOvBackup: "Backup",
    cardOvVacation: "Urlaubsmodus",
    cardOvTabs: "Abschnitte",
    cardOvNone: "Keine Abschnitte gewählt.",
    edit_sections: "Abschnitte",
    edit_sections_help: "Die Optionen einer einzelnen Karte setzt du im YAML: ein Eintrag wie { type: batteries, rows: 3 }.",
    edit_sections_health: "Zustand des Hauses",
    edit_sections_batteries: "Batterien",
    edit_sections_functions: "Hausfunktionen",
    edit_sections_auto_pause: "Pausierte Integrationen",
    edit_sections_update: "Nach dem Update",
    edit_sections_start: "Startzeit",
    edit_sections_database: "Datenbank",
    edit_sections_backup: "Backup",
    edit_sections_vacation: "Urlaubsmodus",
    edit_layout: "Darstellung",
    edit_layout_tabs: "Reiter",
    edit_layout_stacked: "Untereinander",
    cardStTitle: "Startzeit",
    cardStLast: "Letzter Start {ago}",
    cardStUsual: "sonst {usual}",
    cardStSlower: "{n} % langsamer als sonst",
    cardStNormal: "wie sonst",
    cardStQuietSub: "{took} · wie sonst",
    cardStSlowest: "Starten am längsten",
    cardStNotLoaded: "nicht geladen",
    edit_slowest: "Langsamste Integrationen",
    edit_slowest_help: "0 blendet die Liste aus.",
    cardDbTitle: "Datenbank",
    cardDbEstimated: "geschätzt",
    cardDbGrowing: "wächst schnell",
    cardDbWalLarge: "Journal groß",
    cardDbOk: "in Ordnung",
    cardDbQuietSub: "{size} · unauffällig",
    cardDbGrowth: {"one": "{change} in {days} Tag", "other": "{change} in {days} Tagen"},
    cardDbPerDay: "ca. {size} pro Tag",
    cardDbWal: "Journal (WAL)",
    cardDbWalNormal: "normal",
    cardDbWalBig: "groß",
    cardDbKeep: "Aufbewahrung",
    cardDbKeepDays: {"one": "{n} Tag", "other": "{n} Tage"},
    edit_history_90: "90 Tage",
    edit_facts: "Journal und Aufbewahrung zeigen",
    cardBkTitle: "Backup",
    cardBkLast: "Letztes Backup {ago}",
    cardBkNone: "Kein Backup gefunden",
    cardBkOk: "in Ordnung",
    cardBkWarn: "Hinweis",
    cardBkBad: "Schutz fehlt",
    cardBkUnclearChip: "unbekannt",
    cardBkUnclear: "Home Assistant liefert den Backup-Stand nicht.",
    cardBkOutside: "Die Backups entstehen außerhalb von Home Assistant.",
    cardBkNoCopy: "Kein Backup außer Haus",
    cardBkNoCopyNote: "Fällt der Datenträger aus, sind die Backups mit weg.",
    cardBkOld: "Das Backup ist alt: {age}",
    cardBkRunFailed: "Der letzte automatische Lauf ist fehlgeschlagen.",
    cardBkCopyFailed: "Ein Backup hat nicht jedes Ziel erreicht.",
    cardBkSizeOdd: "Das letzte Backup hat eine ungewöhnliche Größe.",
    cardBkCheck: "Im Panel ansehen, was auffällt.",
    cardBkAge: "Alter",
    cardBkHours: "{n} Std.",
    cardBkDays: {"one": "{n} Tag", "other": "{n} Tage"},
    cardBkLimit: "Grenze {age}",
    cardBkExternal: "Kopie extern",
    cardBkYes: "Ja",
    cardBkNo: "Nein",
    cardBkPlaces: {"one": "{n} Ort", "other": "{n} Orte"},
    cardBkSize: "Größe",
    cardBkSizeUsual: "wie üblich",
    cardBkSizeUnusual: "ungewöhnlich",
    cardBkFailed: "Fehlgeschlagen",
    cardBkInWeek: "in 7 Tagen",
    cardBkDaysAgo: {"one": "vor {n} Tag", "other": "vor {n} Tagen"},
    cardBkToday: "heute",
    cardBkEncrypted: "Verschlüsselt",
    cardVaTitle: "Urlaubsmodus",
    cardVaChipOn: "an",
    cardVaChipOff: "aus",
    cardVaChipAfter: "Nachfrist",
    cardVaChipUntil: "bis {date}",
    cardVaSourceCal: "Abwesenheit laut „{name}“ (Kalender)",
    cardVaSource: "Abwesenheit laut „{name}“",
    cardVaAfterSub: "Der Urlaub ist vorbei, die Nachfrist läuft bis {until}.",
    cardVaOff: "Kein Urlaubsmodus",
    cardVaUnset: "Kein Schalter für den Urlaubsmodus gewählt.",
    cardVaSince: "Seit",
    cardVaLeft: {"one": "noch {n} Tag", "other": "noch {n} Tage"},
    cardVaHeld: "Stumm gehalten",
    cardVaHeldSub: "erwartete Ausfälle",
    cardVaGrace: "Nachfrist",
    cardVaGraceHours: "{n} Std.",
    cardVaGraceSub: "nach dem Urlaub",
    cardVaRules: "Ausnahmeregeln zur Abwesenheit sind aktiv ({n}).",
    cardVaRestore: "Nichts davon wird gelöscht, die Meldungen kommen zurück.",
    cardVaHidden: "Diese Karte ist ohne Urlaubsmodus ausgeblendet. Hier im Editor siehst du sie trotzdem.",
    edit_numbers: "Zahlen zeigen",
    edit_numbers_help: "Stumm gehalten, Nachfrist und Ausnahmeregeln.",
    edit_source: "Quelle nennen",
  },
  en: {
    cardNotFound: "HA Housekeeper was not found. Is the integration set up?",
    cardNoData: "No data yet: the first scan is still to come.",
    cardQuietHidden: "This card is hidden while everything is quiet. You still see it here in the editor.",
    cardOpenPanel: "Open in the panel →",
    edit_title: "Title",
    edit_quiet: "When quiet", edit_quiet_summary: "Show the summary", edit_quiet_hide: "Hide the card",
    edit_quiet_help: "Quiet means there is nothing to do. Hidden removes the card from the dashboard until something is due again.",
    edit_tap: "A tap opens", edit_tap_panel: "The Housekeeper panel", edit_tap_none: "Nothing",
    edit_tap_help: "Only administrators can open the panel.",
    edit_compact: "Compact",
    cardTopic_down: "Down",
    cardTopic_broken_references: "Broken references",
    cardTopic_failing_automations: "Failing automations",
    cardTopic_unneeded: "Unneeded",
    cardHealthOk: "All in order",
    cardHealthAttention: {"one": "{n} object needs attention", "other": "{n} objects need attention"},
    cardHealthUrgent: "Something is urgent",
    cardHealthScanBad: "The scan is not getting through",
    cardScanOld: "The numbers may be out of date.",
    cardLastScan: "Last scan {ago}",
    cardScan: "Scan",
    cardScanning: "Scanning …",
    cardSince: "Since the last scan:",
    cardNew: "+{n} new",
    cardResolved: "−{n} fixed",
    cardNoChanges: "No changes since the last scan",
    cardNoFindings: "No open findings",
    edit_tiles: "Tiles",
    edit_tiles_findings: "Only when there are findings",
    edit_tiles_always: "Always",
    edit_tiles_never: "Never",
    edit_changes: "Show the changes since the last scan",
    edit_scan_button: "Show the scan button",
    edit_scan_button_help: "Only administrators see the button.",
    cardBatTitle: "Batteries",
    cardBatWeakestSub: "Weakest {n} of {total}",
    cardBatRoundSub: {"one": "In the next {days} days: {n} battery", "other": "In the next {days} days: {n} batteries"},
    cardBatLowChip: {"one": "{n} low", "other": "{n} low"},
    cardBatAllGood: "All good",
    cardBatQuietSub: "{total} watched · lowest {lowest} %",
    cardBatQuietFoot: "No battery below the limit",
    cardBatNext: "Next change expected in {when}",
    cardBatLowNow: "Change due",
    cardBatDays: {"one": "about {n} day", "other": "about {n} days"},
    cardBatWeeks: {"one": "about {n} week", "other": "about {n} weeks"},
    cardBatMonths: {"one": "about {n} month", "other": "about {n} months"},
    cardBatSoon: "soon",
    cardBatStable: "hardly any use",
    cardBatFollows: "Forecast follows",
    cardBatQEstimate: "Estimate",
    cardBatQStable: "stable",
    cardBatQFew: "too little data",
    cardBatRound: "Round of changes",
    cardBatNoArea: "No area",
    cardBatShopping: "Shopping list",
    cardBatUnknown: "Type unknown",
    cardBatUnknownHint: "set the type in the panel",
    cardBatNoRechargeable: "Rechargeable batteries are not on the list",
    edit_view: "View",
    edit_view_weakest: "Weakest",
    edit_view_round: "Round of changes",
    edit_view_both: "Both",
    edit_rows: "Rows for “Weakest”",
    edit_shopping: "Show the shopping list",
    edit_shopping_help: "The shopping list belongs to the round of changes.",
    edit_forecast: "Show the forecast and its quality",
    cardFnTitle: "Home functions",
    cardFnCount: {"one": "{n} function", "other": "{n} functions"},
    cardFnProblems: {"one": "{n} impaired", "other": "{n} impaired"},
    cardFnUnverified: {"one": "{n} not verifiable", "other": "{n} not verifiable"},
    cardFnAllOk: "All in order",
    cardFnMembers: {"one": "{ok} of {total} object reachable", "other": "{ok} of {total} objects reachable"},
    cardFnDown: "{name} cannot be reached",
    cardFnStale: "{name} has stopped reporting",
    cardFnBelow: "{name} is below its minimum",
    cardFnMemberOff: "{name} is disabled",
    cardFnOff: "Function switched off",
    cardFnUnsure: "State not known for sure",
    cardFnWindow: "{n} days",
    cardFnNone: "No home function yet. You create them in the panel.",
    edit_entities: "Functions",
    edit_entities_help: "Leave empty for all functions.",
    edit_history: "History",
    edit_history_30: "30 days",
    edit_history_14: "14 days",
    edit_history_7: "7 days",
    edit_history_0: "Off",
    cardApTitle: "Paused integrations",
    cardApOnSub: "Auto-pause is on",
    cardApChip: {"one": "{n} paused", "other": "{n} paused"},
    cardApNone: "No integration is paused",
    cardApAllRuns: "All running",
    cardApOff: "Auto-pause is off",
    cardApOffSub: "Housekeeper pauses nothing by itself",
    cardApEnable: "Switch on in the panel →",
    cardApWhyAuto: {"one": "{n} failed attempt", "other": "{n} failed attempts"},
    cardApWhyManual: "paused by you",
    cardApSince: "paused {ago}",
    cardApNext: "Next attempt {when}",
    cardApTrying: "Trying now …",
    cardApExhausted: {"one": "Given up: not set up again in {n} day", "other": "Given up: not set up again in {n} days"},
    cardApStep: "Attempt {done} of {total} · every {step} h",
    cardApFoot: {"one": "The pause ends after {n} day at the latest", "other": "The pause ends after {n} days at the latest"},
    cardApMenu: "Actions",
    cardApTry: "Try now",
    cardApResume: "End the pause",
    cardApNever: "Never pause",
    cardApOpen: "Open in the panel",
    cardApTried: "A new attempt has started",
    cardApResumed: "Pause ended",
    cardApExcluded: "Excluded from auto-pause",
    cardApFailed: "That did not work: {detail}",
    edit_actions: "Actions in the menu",
    edit_actions_help: "Only administrators see the menu.",
    edit_progress: "Show the progress of the attempts",
    cardUpTitle: "After the update",
    cardUpNone: "No update has been watched yet.",
    cardUpHidden: "This card appears only for a while after an update. You still see it here in the editor.",
    cardUpWorse: "Something has stopped working since the update",
    cardUpPending: "Housekeeper is checking after the update",
    cardUpFine: "Update without anything unusual",
    cardUpUnknown: "Not sure after the update",
    cardUpChip: {"one": "{n} thing", "other": "{n} things"},
    cardUpAllFine: "All running",
    cardUpFirstCheck: "The first check comes {when}.",
    cardUpFineNote: "Nothing runs worse than before the update.",
    cardUpTransientNote: {"one": "{n} object was briefly gone and is back.", "other": "{n} objects were briefly gone and are back."},
    cardUpUnknownNote: "Housekeeper could not read everything. The verdict is still open.",
    cardUpHa: "Home Assistant {to}",
    cardUpOs: "Operating system {to}",
    cardUpSupervisor: "Supervisor {to}",
    cardUpType_config_entry: "Integration",
    cardUpType_device: "Device",
    cardUpType_automation: "Automation",
    cardUpType_script: "Script",
    cardUpType_scene: "Scene",
    cardUpType_entity: "Entity",
    cardUpType_other: "Object",
    cardUpStatus_unavailable: "Unreachable",
    cardUpStatus_problem: "Problem",
    cardUpStatus_stopped: "Stopped",
    cardUpMore: {"one": "and {n} more", "other": "and {n} more"},
    cardUpFindings: {"one": "{n} new finding", "other": "{n} new findings"},
    cardUpRepairs: {"one": "{n} new repair hint", "other": "{n} new repair hints"},
    cardUpStart: "The start took {took} (usually {usual})",
    cardUpStartOnly: "The start took {took}",
    cardDurMin: "{m} min {s} s",
    cardDurSec: "{s} s",
    edit_show_hours: "Visible after the update",
    edit_show_hours_1: "1 hour",
    edit_show_hours_3: "3 hours",
    edit_show_hours_6: "6 hours",
    edit_show_hours_24: "24 hours",
    edit_start: "Show the start time",
    cardOvHealth: "Health",
    cardOvBatteries: "Batteries",
    cardOvFunctions: "Functions",
    cardOvAutoPause: "Auto-pause",
    cardOvUpdate: "Update",
    cardOvStart: "Start time",
    cardOvDatabase: "Database",
    cardOvBackup: "Backup",
    cardOvVacation: "Vacation mode",
    cardOvTabs: "Sections",
    cardOvNone: "No sections chosen.",
    edit_sections: "Sections",
    edit_sections_help: "Set the options of a single card in YAML: an entry like { type: batteries, rows: 3 }.",
    edit_sections_health: "House health",
    edit_sections_batteries: "Batteries",
    edit_sections_functions: "Home functions",
    edit_sections_auto_pause: "Paused integrations",
    edit_sections_update: "After the update",
    edit_sections_start: "Start time",
    edit_sections_database: "Database",
    edit_sections_backup: "Backup",
    edit_sections_vacation: "Vacation mode",
    edit_layout: "Layout",
    edit_layout_tabs: "Tabs",
    edit_layout_stacked: "One below the other",
    cardStTitle: "Start time",
    cardStLast: "Last start {ago}",
    cardStUsual: "usually {usual}",
    cardStSlower: "{n} % slower than usual",
    cardStNormal: "as usual",
    cardStQuietSub: "{took} · as usual",
    cardStSlowest: "Slowest to start",
    cardStNotLoaded: "not loaded",
    edit_slowest: "Slowest integrations",
    edit_slowest_help: "0 hides the list.",
    cardDbTitle: "Database",
    cardDbEstimated: "estimated",
    cardDbGrowing: "growing fast",
    cardDbWalLarge: "journal large",
    cardDbOk: "in order",
    cardDbQuietSub: "{size} · nothing unusual",
    cardDbGrowth: {"one": "{change} in {days} day", "other": "{change} in {days} days"},
    cardDbPerDay: "about {size} a day",
    cardDbWal: "Journal (WAL)",
    cardDbWalNormal: "normal",
    cardDbWalBig: "large",
    cardDbKeep: "Retention",
    cardDbKeepDays: {"one": "{n} day", "other": "{n} days"},
    edit_history_90: "90 days",
    edit_facts: "Show the journal and the retention",
    cardBkTitle: "Backup",
    cardBkLast: "Latest backup {ago}",
    cardBkNone: "No backup found",
    cardBkOk: "in order",
    cardBkWarn: "needs a look",
    cardBkBad: "protection missing",
    cardBkUnclearChip: "unknown",
    cardBkUnclear: "Home Assistant does not report the backup state.",
    cardBkOutside: "The backups are made outside Home Assistant.",
    cardBkNoCopy: "No backup off the device",
    cardBkNoCopyNote: "If the drive fails, the backups are gone too.",
    cardBkOld: "The backup is old: {age}",
    cardBkRunFailed: "The last automatic run failed.",
    cardBkCopyFailed: "A backup did not reach every target.",
    cardBkSizeOdd: "The latest backup has an unusual size.",
    cardBkCheck: "Look in the panel at what stands out.",
    cardBkAge: "Age",
    cardBkHours: "{n} h",
    cardBkDays: {"one": "{n} day", "other": "{n} days"},
    cardBkLimit: "limit {age}",
    cardBkExternal: "Off-site copy",
    cardBkYes: "Yes",
    cardBkNo: "No",
    cardBkPlaces: {"one": "{n} place", "other": "{n} places"},
    cardBkSize: "Size",
    cardBkSizeUsual: "as usual",
    cardBkSizeUnusual: "unusual",
    cardBkFailed: "Failed",
    cardBkInWeek: "in 7 days",
    cardBkDaysAgo: {"one": "{n} day ago", "other": "{n} days ago"},
    cardBkToday: "today",
    cardBkEncrypted: "Encrypted",
    cardVaTitle: "Vacation mode",
    cardVaChipOn: "on",
    cardVaChipOff: "off",
    cardVaChipAfter: "grace period",
    cardVaChipUntil: "until {date}",
    cardVaSourceCal: "Away according to “{name}” (calendar)",
    cardVaSource: "Away according to “{name}”",
    cardVaAfterSub: "The vacation is over; the grace period runs until {until}.",
    cardVaOff: "No vacation mode",
    cardVaUnset: "No switch has been chosen for the vacation mode.",
    cardVaSince: "Since",
    cardVaLeft: {"one": "{n} day left", "other": "{n} days left"},
    cardVaHeld: "Held back",
    cardVaHeldSub: "expected failures",
    cardVaGrace: "Grace period",
    cardVaGraceHours: "{n} h",
    cardVaGraceSub: "after the vacation",
    cardVaRules: "Exception rules for absence are active ({n}).",
    cardVaRestore: "Nothing is deleted; the reports come back.",
    cardVaHidden: "This card is hidden while there is no vacation mode. You still see it here in the editor.",
    edit_numbers: "Show the numbers",
    edit_numbers_help: "Held back, grace period and exception rules.",
    edit_source: "Name the source",
  },
};

// The look shared by all cards. A card uses the colors of the chosen Home Assistant theme, not its own.
const CARD_CSS = `
  :host { display: block; }
  ha-card { overflow: hidden; }
  .hk-head { display: flex; gap: 12px; align-items: center; padding: 14px 16px; }
  .hk-head.line { border-bottom: 1px solid var(--divider-color); }
  .hk-head .hk-t { flex: 1; min-width: 0; }
  .hk-head .hk-t b { display: block; font-size: 16px; color: var(--primary-text-color); }
  .hk-head .hk-t small { color: var(--secondary-text-color); font-size: 12px; }
  .hk-compact .hk-head { padding: 10px 12px; }
  .hk-chip { font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 99px; white-space: nowrap; background: var(--secondary-background-color); color: var(--secondary-text-color); }
  .hk-chip.warn { background: color-mix(in srgb, var(--warning-color) 18%, var(--card-background-color)); color: var(--primary-text-color); }
  .hk-chip.bad { background: color-mix(in srgb, var(--error-color) 16%, var(--card-background-color)); color: var(--primary-text-color); }
  .hk-foot { display: flex; gap: 14px; flex-wrap: wrap; padding: 10px 16px; font-size: 12.5px; color: var(--secondary-text-color); border-top: 1px solid var(--divider-color); }
  .hk-foot .hk-sp { flex: 1; }
  .hk-link { color: var(--primary-color); font-weight: 600; cursor: pointer; }
  .hk-note { padding: 14px 16px; color: var(--secondary-text-color); font-size: 13px; }
  .hk-note + .hk-note { padding-top: 0; }
  .hk-dot { width: 38px; height: 38px; border-radius: 50%; flex: none; display: grid; place-items: center; font-size: 18px; font-weight: 700; color: #fff; }
  .hk-dot.ok { background: var(--success-color); }
  .hk-dot.warn { background: var(--warning-color); }
  .hk-dot.bad { background: var(--error-color); }
  .hk-btn { min-height: 36px; padding: 6px 12px; border-radius: 10px; border: 1px solid var(--divider-color); background: var(--card-background-color); color: var(--primary-text-color); font: inherit; font-weight: 600; font-size: 13px; cursor: pointer; white-space: nowrap; }
  .hk-btn[disabled] { opacity: .6; cursor: default; }
  .hk-tiles { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1px; background: var(--divider-color); border-top: 1px solid var(--divider-color); }
  .hk-tiles + .hk-foot { border-top: 1px solid var(--divider-color); }
  .hk-tile { background: var(--card-background-color); padding: 12px 14px; min-width: 0; box-shadow: none; }
  .hk-tile.go { cursor: pointer; }
  .hk-tile .n { font-size: 26px; font-weight: 700; line-height: 1.1; color: var(--primary-text-color); }
  .hk-tile .l { font-size: 12px; color: var(--secondary-text-color); margin-top: 2px; }
  .hk-tile.zero .n { color: var(--secondary-text-color); font-weight: 600; }
  .hk-tile.warn { box-shadow: inset 0 3px 0 var(--warning-color); }
  .hk-tile.bad { box-shadow: inset 0 3px 0 var(--error-color); }
  .hk-compact .hk-tile { padding: 8px 10px; }
  .hk-compact .hk-tile .n { font-size: 20px; }
  @media (max-width: 520px) { .hk-tiles { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  .hk-up { color: var(--error-color); font-weight: 600; }
  .hk-down { color: var(--success-color); font-weight: 600; }
  .hk-row { display: grid; gap: 12px; align-items: center; padding: 10px 16px; border-top: 1px solid var(--divider-color); }
  .hk-head.line + .hk-row { border-top: 0; }
  .hk-row.r3 { grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr) auto; }
  .hk-row.r2 { grid-template-columns: minmax(0, 1fr) auto; }
  .hk-name b { display: block; font-size: 13.5px; color: var(--primary-text-color); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .hk-name small, .hk-right small { display: block; color: var(--secondary-text-color); font-size: 12px; }
  .hk-right { text-align: right; min-width: 70px; }
  .hk-right b { font-size: 14px; color: var(--primary-text-color); }
  .hk-q { display: inline-block; font-size: 11px; font-weight: 600; padding: 1px 7px; border-radius: 99px; background: var(--secondary-background-color); color: var(--secondary-text-color); margin-top: 2px; }
  .hk-bar { height: 8px; border-radius: 99px; background: var(--secondary-background-color); overflow: hidden; }
  .hk-bar i { display: block; height: 100%; border-radius: 99px; background: var(--success-color); }
  .hk-bar.warn i { background: var(--warning-color); }
  .hk-bar.bad i { background: var(--error-color); }
  .hk-area { padding: 8px 16px 2px; font-size: 12px; font-weight: 700; color: var(--primary-color); border-top: 1px solid var(--divider-color); }
  .hk-sec { padding: 10px 16px 4px; font-size: 11px; letter-spacing: .05em; text-transform: uppercase; color: var(--secondary-text-color); font-weight: 600; }
  .hk-sec.top { border-top: 1px solid var(--divider-color); }
  .hk-shop { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 4px 14px; padding: 4px 16px 12px; align-items: baseline; }
  .hk-shop .q { font-weight: 700; font-size: 15px; text-align: right; min-width: 52px; color: var(--primary-text-color); }
  .hk-shop .q.mute { color: var(--secondary-text-color); }
  .hk-shop .w b { font-size: 13.5px; color: var(--primary-text-color); }
  .hk-shop .w small { color: var(--secondary-text-color); font-size: 12px; }
  @media (max-width: 520px) { .hk-row.r3 { grid-template-columns: minmax(0, 1fr) auto; } .hk-row.r3 .hk-bar { display: none; } }
  .hk-row.fn { grid-template-columns: 22px minmax(0, 1.2fr) minmax(0, 1fr) auto; }
  .hk-row.go { cursor: pointer; }
  .hk-st { width: 14px; height: 14px; border-radius: 50%; justify-self: center; background: var(--disabled-text-color, #bdbdbd); }
  .hk-st.ok { background: var(--success-color); }
  .hk-st.warn { background: var(--warning-color); }
  .hk-st.bad { background: var(--error-color); }
  .hk-name small.bad { color: var(--error-color); font-weight: 600; }
  .hk-name small.warn { color: var(--warning-color); font-weight: 600; }
  .hk-strip { display: flex; gap: 1px; height: 18px; }
  .hk-strip i { flex: 1; min-width: 2px; background: var(--success-color); opacity: .8; border-radius: 1px; }
  .hk-strip i.problem { background: var(--error-color); opacity: 1; }
  .hk-strip i.flapping { background: var(--warning-color); opacity: 1; }
  .hk-strip i.unverified { background: var(--disabled-text-color, #bdbdbd); opacity: .8; }
  .hk-strip i.none { background: var(--secondary-background-color); opacity: 1; }
  @media (max-width: 520px) { .hk-row.fn { grid-template-columns: 22px minmax(0, 1fr) auto; } .hk-row.fn .hk-strip { display: none; } }
  .hk-row.ap { grid-template-columns: minmax(0, 1fr) 34px; align-items: start; }
  .hk-next { font-size: 13px; font-weight: 600; color: var(--primary-text-color); margin-top: 4px; }
  .hk-row.ap .hk-bar { margin: 6px 0 2px; max-width: 280px; }
  .hk-kebab { width: 34px; height: 34px; border-radius: 10px; border: 1px solid transparent; background: none; color: var(--secondary-text-color); font-size: 18px; font-weight: 700; cursor: pointer; }
  .hk-kebab.open, .hk-kebab:hover { border-color: var(--divider-color); background: var(--secondary-background-color); color: var(--primary-text-color); }
  .hk-backdrop { position: fixed; inset: 0; z-index: 9; }
  .hk-menu { position: fixed; z-index: 10; min-width: 210px; border: 1px solid var(--divider-color); border-radius: 12px; background: var(--card-background-color); box-shadow: 0 8px 24px rgba(0, 0, 0, .25); padding: 6px; display: grid; }
  .hk-menu button { text-align: left; padding: 8px 10px; border: 0; border-radius: 8px; background: none; color: var(--primary-text-color); font: inherit; font-size: 13px; cursor: pointer; }
  .hk-menu button:first-child { font-weight: 600; background: var(--secondary-background-color); }
  .hk-menu button:hover { background: var(--secondary-background-color); }
  ha-card.hk-alert { border-top: 3px solid var(--warning-color); }
  .hk-tag { font-size: 12px; font-weight: 600; white-space: nowrap; }
  .hk-tag.bad { color: var(--error-color); }
  .hk-ovtitle { padding: 14px 16px 0; font-size: 16px; font-weight: 600; color: var(--primary-text-color); }
  .hk-ovtabs { display: flex; gap: 4px; flex-wrap: wrap; padding: 8px 12px 0; border-bottom: 1px solid var(--divider-color); }
  .hk-tab { display: inline-flex; gap: 6px; align-items: center; padding: 8px 12px; border: 0; border-bottom: 2px solid transparent; background: none; color: var(--secondary-text-color); font: inherit; font-weight: 600; font-size: 13px; cursor: pointer; }
  .hk-tab.on { color: var(--primary-color); border-bottom-color: var(--primary-color); }
  .hk-badge { min-width: 18px; padding: 0 6px; border-radius: 99px; background: var(--warning-color); color: #fff; font-size: 11px; font-weight: 700; line-height: 18px; text-align: center; }
  .hk-pane { display: none; }
  .hk-pane.in.open { display: block; }
  .hk-ov.stacked .hk-ovtabs { display: none; }
  .hk-ov.stacked .hk-pane.in { display: block; }
  .hk-pane.in + .hk-pane.in { border-top: 1px solid var(--divider-color); }
  .hk-ov.stacked .hk-pane.in:first-child { border-top: 0; }
  @media (max-width: 520px) { .hk-ovtabs { display: none; } .hk-pane.in { display: block; } }
  .hk-big { padding: 14px 16px 4px; display: flex; align-items: baseline; gap: 10px; }
  .hk-big b { font-size: 28px; color: var(--primary-text-color); }
  .hk-big span { color: var(--secondary-text-color); font-size: 13px; }
  .hk-bars { display: flex; align-items: flex-end; gap: 6px; height: 76px; padding: 6px 16px 12px; }
  .hk-bars i { flex: 1; background: var(--primary-color); opacity: .6; border-radius: 4px 4px 0 0; }
  .hk-bars i.now { opacity: 1; }
  .hk-bars i.hi { background: var(--warning-color); opacity: 1; }
  .hk-right b.warnt { color: var(--warning-color); }
  .hk-line { display: block; margin: 0 16px 6px; width: calc(100% - 32px); height: 44px; }
  .hk-line path { fill: none; stroke: var(--primary-color); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
  .hk-line .a { fill: color-mix(in srgb, var(--primary-color) 14%, transparent); stroke: none; }
  .hk-facts { display: grid; gap: 1px; background: var(--divider-color); border-top: 1px solid var(--divider-color); }
  .hk-facts.n1 { grid-template-columns: 1fr; }
  .hk-facts.n2 { grid-template-columns: 1fr 1fr; }
  .hk-fact { background: var(--card-background-color); padding: 12px 14px; min-width: 0; }
  .hk-fact .l { font-size: 11px; letter-spacing: .04em; text-transform: uppercase; color: var(--secondary-text-color); font-weight: 600; }
  .hk-fact .v { font-size: 17px; font-weight: 700; margin-top: 2px; color: var(--primary-text-color); }
  .hk-fact .v.warnt { color: var(--warning-color); }
  .hk-fact .v.good { color: var(--success-color); }
  .hk-fact .v.badt { color: var(--error-color); }
  .hk-facts.n3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .hk-stripbox { padding: 12px 16px 4px; }
  .hk-stripbox .hk-strip { height: 22px; gap: 3px; }
  .hk-striplab { display: flex; justify-content: space-between; padding: 4px 0 8px; font-size: 11px; color: var(--secondary-text-color); }
  .hk-fact .s { font-size: 12px; color: var(--secondary-text-color); }
  .hk-banner { padding: 8px 16px; font-size: 12.5px; color: var(--secondary-text-color); background: var(--secondary-background-color); border-bottom: 1px dashed var(--divider-color); }
`;

// The language of a card and its texts. German and English are in CARD_TEXT; any other language is fetched once
// (it is shared by every card on the page) and the cards that wait for it draw themselves again.
const CardTexts = {
  loading: {},
  listeners: new Set(),

  // The language of the person looking at the dashboard.
  language(hass) {
    return matchLanguage(LANGUAGES, hass?.locale?.language || hass?.language);
  },

  // Fetch the texts of a language besides German and English; until they are here, English shows.
  ensure(code) {
    const entry = LANGUAGES.find(l => l.code === code);
    if (!entry?.v || CARD_TEXT[code] || this.loading[code]) return;
    this.loading[code] = true;
    fetch(`/ha_housekeeper/i18n/cards/${code}.json?v=${entry.v}`)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(texts => { CARD_TEXT[code] = texts; this.listeners.forEach(refresh => refresh()); })
      .catch(() => { delete this.loading[code]; }); // stays English; the next card that asks tries again
  },

  has(code, key) {
    return Boolean(CARD_TEXT[code]?.[key] || CARD_TEXT.en[key]);
  },

  // A text may be a string or, for a language with more plural forms, an object {one, few, many, other}.
  t(code, key, vars) {
    let text = CARD_TEXT[code]?.[key] || CARD_TEXT.en[key] || key;
    if (text && typeof text === "object") text = pluralText(text, code, vars);
    return vars ? text.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? "") : text;
  },
};

// What every card shares: finding the Housekeeper entities, deciding whether the card shows, and the frame.
// A concrete card extends HKCard (see 90-register.js) and fills in the parts marked "a card overrides".
const HK_PLATFORM = "ha_housekeeper";
const HK_PANEL_PATH = "/ha-housekeeper";
const HK_DEFAULTS = { quiet: "summary", tap: "panel", compact: false };

// The Housekeeper entities by the translation key of their sensor: { findings: ["sensor.…"], monitor: [... one per function] }.
// The card finds them itself in the entity registry of the frontend, so nobody has to pick an entity.
function findEntities(entities) {
  const byKey = {};
  for (const item of Object.values(entities || {})) {
    if (item?.platform !== HK_PLATFORM || !item.translation_key) continue;
    (byKey[item.translation_key] ||= []).push(item.entity_id);
  }
  return { byKey };
}

// Whether a card shows. "show": normal; "hide": nothing, because it is quiet and the person chose to hide it;
// "placeholder": quiet and hidden, but somebody is editing the dashboard and must still find the card.
function cardVisibility(quiet, choice, editing) {
  if (!quiet || choice !== "hide") return "show";
  return editing ? "placeholder" : "hide";
}

// A short fingerprint of the states a card shows, so it draws itself only when one of them changed.
function watchSignature(hass, ids) {
  return ids.map(id => `${id}:${hass?.states?.[id]?.last_updated || "-"}`).join("|");
}

const escapeHtml = value => String(value ?? "—").replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));

class HKCard extends HTMLElement {
  // A card overrides: static tag (the element name), static pickerName and pickerDescription (English, the picker does not translate).
  static get editorTag() { return `${this.tag}-editor`; }
  static getConfigElement() { return globalThis.document.createElement(this.editorTag); }
  static getStubConfig() { return {}; }
  // A card overrides: the defaults of its own options (merged after the common ones).
  static get defaults() { return {}; }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = null;
    this._hass = null;
    this._sig = null;
    this._found = null;
    this._entities = null;
    this.refresh = () => this.update(true);
  }

  connectedCallback() {
    CardTexts.listeners.add(this.refresh);
    this.update(true);
    // "12 minutes ago" and "in 54 minutes" go stale while nothing changes, so the card looks again every minute.
    if (typeof globalThis.setInterval === "function" && !this._clock) this._clock = globalThis.setInterval(() => this.update(), 60000);
  }
  disconnectedCallback() {
    CardTexts.listeners.delete(this.refresh);
    if (this._clock) { globalThis.clearInterval(this._clock); this._clock = null; }
  }

  setConfig(config) {
    if (!config || typeof config !== "object") throw new Error("Invalid configuration");
    this._config = { ...HK_DEFAULTS, ...this.constructor.defaults, ...config };
    this.update(true);
  }

  set hass(hass) {
    this._hass = hass;
    CardTexts.ensure(this.lang);
    this.update();
  }

  get lang() { return CardTexts.language(this._hass); }
  t(key, vars) { return CardTexts.t(this.lang, key, vars); }
  esc(value) { return escapeHtml(value); }
  getCardSize() { return 3; }

  // The Housekeeper entities, worked out again only when the registry changed.
  found() {
    const registry = this._hass?.entities;
    if (!this._found || this._entities !== registry) { this._found = findEntities(registry); this._entities = registry; }
    return this._found;
  }

  // The entity id for a translation key in a domain (a sensor and an event can share a key).
  idOf(key, domain = "sensor") {
    return this.found().byKey[key]?.find(id => id.startsWith(`${domain}.`)) || null;
  }

  // The state of that entity, or null.
  stateOf(key, domain = "sensor") {
    const id = this.idOf(key, domain);
    return (id && this._hass?.states?.[id]) || null;
  }

  // "in 54 minutes" for a time ahead, in the language of the card; "" when the time is not known.
  until(iso) {
    const then = Date.parse(iso || "");
    if (!Number.isFinite(then)) return "";
    const minutes = Math.max(0, Math.round((then - Date.now()) / 60000));
    const [value, unit] = minutes < 60 ? [minutes, "minute"] : minutes < 1440 ? [Math.round(minutes / 60), "hour"] : [Math.round(minutes / 1440), "day"];
    try { return new Intl.RelativeTimeFormat(this.lang, { numeric: "auto" }).format(value, unit); } catch (_) { return ""; }
  }

  // A short message at the foot of the screen, the way Home Assistant shows them.
  toast(message) { this.dispatchEvent(new CustomEvent("hass-notification", { detail: { message }, bubbles: true, composed: true })); }

  // "12 minutes ago" for a time, in the language of the card; "" when the time is not known.
  ago(iso) {
    const then = Date.parse(iso || "");
    if (!Number.isFinite(then)) return "";
    const minutes = Math.max(0, Math.round((Date.now() - then) / 60000));
    const [value, unit] = minutes < 60 ? [minutes, "minute"] : minutes < 1440 ? [Math.round(minutes / 60), "hour"] : [Math.round(minutes / 1440), "day"];
    try { return new Intl.RelativeTimeFormat(this.lang, { numeric: "auto" }).format(-value, unit); } catch (_) { return ""; }
  }

  // A card overrides: the entity ids whose changes it shows (default: every Housekeeper entity).
  watchedIds() { return Object.values(this.found().byKey).flat(); }
  // A card overrides: true while there is nothing to do (the "Show the summary / Hide the card" choice applies).
  isQuiet() { return false; }
  // A card overrides: false while the first scan has not delivered its numbers.
  hasData() { return true; }
  // A card overrides: the text key of its title, shown when the configuration has no title of its own.
  get titleKey() { return "cardTitle"; }
  // A card overrides: the HTML of the card without the frame.
  renderBody() { return ""; }
  // A card overrides: how many things in it call for a look (the overview card shows it on the tab).
  attention() { return 0; }
  // A card overrides: the text that says in the editor why the card would be hidden, and a class for its frame.
  hiddenKey() { return "cardQuietHidden"; }
  frameClass() { return ""; }

  titleText() { return this._config?.title || this.t(this.titleKey); }
  editing() { return this.preview === true || this.editMode === true || this._hass?.editMode === true; }
  mode() { return cardVisibility(this.isQuiet(), this._config.quiet, this.editing()); }

  // Draw again when the language, the shown states or the visibility changed (or when forced).
  update(force = false) {
    if (!this._config || !this._hass) return;
    const sig = [Math.floor(Date.now() / 60000), this.lang, this.mode(), Boolean(this._hass.user?.is_admin), watchSignature(this._hass, this.watchedIds()), JSON.stringify(this._config)].join("#");
    if (!force && sig === this._sig) return;
    this._sig = sig;
    this.render();
  }

  render() {
    const mode = this.mode();
    this.style.display = mode === "hide" ? "none" : "";
    if (mode === "hide") { this.shadowRoot.innerHTML = ""; return; }
    let body;
    if (!Object.keys(this.found().byKey).length) body = `<div class="hk-note">${this.esc(this.t("cardNotFound"))}</div>`;
    else if (!this.hasData()) body = `<div class="hk-note">${this.esc(this.t("cardNoData"))}</div>`;
    else body = this.renderBody();
    const banner = mode === "placeholder" ? `<div class="hk-banner">${this.esc(this.t(this.hiddenKey()))}</div>` : "";
    const frame = [this._config.compact ? "hk-compact" : "", this.frameClass()].filter(Boolean).join(" ");
    this.shadowRoot.innerHTML = `<style>${CARD_CSS}</style><ha-card class="${frame}">${banner}${body}</ha-card>`;
    this.shadowRoot.querySelectorAll("[data-hk-panel]").forEach(el => el.addEventListener("click", () => this.openPanel(el.getAttribute("data-hk-panel"))));
    this.shadowRoot.querySelectorAll("[data-hk-act]").forEach(el => el.addEventListener("click", event => this.act(el.getAttribute("data-hk-act"), event)));
  }

  // A card overrides: what a click on an element with data-hk-act does.
  act(_name, _event) {}

  // Open the Housekeeper panel when the configuration allows it and the person is an administrator. The panel
  // reads its deep link from the query (view=findingsNav&filter=topic:down).
  openPanel(query = "") {
    if (this._config?.tap === "none" || !this._hass?.user?.is_admin) return;
    globalThis.history.pushState(null, "", query ? `${HK_PANEL_PATH}?${query}` : HK_PANEL_PATH);
    globalThis.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
  }

  // The head of a card: a title, a line below it and, on the right, what the card puts there (a chip, a button).
  head(subtitle = "", right = "", line = false, left = "", title = this.titleText()) {
    return `<div class="hk-head${line ? " line" : ""}">${left}<div class="hk-t"><b>${this.esc(title)}</b>${subtitle ? `<small>${this.esc(subtitle)}</small>` : ""}</div>${right}</div>`;
  }

  // The foot of a card: a line on the left, the link to the panel on the right (only for administrators).
  foot(left = "", query = "") { return this.footHtml(this.esc(left), query); }

  // The same with a left part that is HTML already (the caller escaped it).
  footHtml(leftHtml = "", query = "") {
    const link = this._config.tap !== "none" && this._hass?.user?.is_admin ? `<span class="hk-link" data-hk-panel="${this.esc(query)}">${this.esc(this.t("cardOpenPanel"))}</span>` : "";
    return `<div class="hk-foot"><span>${leftHtml}</span><span class="hk-sp"></span>${link}</div>`;
  }
}

// The card editor: one form for the options every card has plus the options of the card itself.
// The form is Home Assistant's own (ha-form), so the editor looks like the rest of the dashboard editor.
function commonSchema(t) {
  const choice = (name, values) => ({ name, selector: { select: { mode: "dropdown", options: values.map(value => ({ value, label: t(`edit_${name}_${value}`) })) } } });
  return [
    { name: "title", selector: { text: {} } },
    choice("quiet", ["summary", "hide"]),
    choice("tap", ["panel", "none"]),
    { name: "compact", selector: { boolean: {} } },
  ];
}

function makeEditor(CardClass) {
  return class extends HTMLElement {
    constructor() {
      super();
      this._config = null;
      this._hass = null;
      this._form = null;
      this.refresh = () => this.render();
    }

    connectedCallback() { CardTexts.listeners.add(this.refresh); }
    disconnectedCallback() { CardTexts.listeners.delete(this.refresh); }

    setConfig(config) { this._config = { ...HK_DEFAULTS, ...CardClass.defaults, ...config }; this.render(); }
    set hass(hass) { this._hass = hass; CardTexts.ensure(CardTexts.language(hass)); this.render(); }

    // The options of the card itself come after the common ones; a card names them in static editorSchema(t).
    schema() {
      const t = key => CardTexts.t(CardTexts.language(this._hass), key);
      return [...commonSchema(t), ...(CardClass.editorSchema ? CardClass.editorSchema(t) : [])];
    }

    render() {
      if (!this._config || !this._hass) return;
      const lang = CardTexts.language(this._hass);
      if (!this._form) {
        this._form = globalThis.document.createElement("ha-form");
        this._form.addEventListener("value-changed", event => {
          event.stopPropagation();
          this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: event.detail.value }, bubbles: true, composed: true }));
        });
        this.appendChild(this._form);
      }
      this._form.hass = this._hass;
      this._form.data = this._config;
      this._form.schema = this.schema();
      this._form.computeLabel = field => CardTexts.t(lang, `edit_${field.name}`);
      this._form.computeHelper = field => (CardTexts.has(lang, `edit_${field.name}_help`) ? CardTexts.t(lang, `edit_${field.name}_help`) : "");
    }
  };
}

// The health card: how the house is doing at a glance, without opening the panel. The numbers are those of the
// tiles on the overview page of the panel; they come from the sensor "house health" and its attributes.
const HK_TOPICS = ["down", "broken_references", "failing_automations", "unneeded"];

class HKHealthCard extends HKCard {
  static tag = "ha-housekeeper-health-card";
  static pickerName = "HA Housekeeper: House health";
  static pickerDescription = "How the house is doing: what is down, broken, failing or no longer needed, and what changed since the last scan.";
  static get defaults() { return { tiles: "findings", changes: true, scan_button: true }; }

  static editorSchema(t) {
    return [
      { name: "tiles", selector: { select: { mode: "dropdown", options: ["findings", "always", "never"].map(value => ({ value, label: t(`edit_tiles_${value}`) })) } } },
      { name: "changes", selector: { boolean: {} } },
      { name: "scan_button", selector: { boolean: {} } },
    ];
  }

  watchedIds() { return ["house_health", "scan_health", "activity", "last_scan"].map(key => this.idOf(key)).filter(Boolean); }

  // Where the numbers come from: the state of the house, the health of the scans and what Housekeeper does right now.
  health() { return this.stateOf("house_health"); }
  scanState() { return this.stateOf("scan_health")?.state; }
  scanBroken() { return ["failed", "stale"].includes(this.scanState()); }
  scanning() { return this.stateOf("activity")?.state === "scanning"; }

  hasData() { return Boolean(this.health()) && !["unknown", "unavailable"].includes(this.health().state); }
  attention() {
    if (this.scanBroken()) return 1;
    return this.hasData() && this.health().state !== "ok" ? this.health().attributes?.objects || 0 : 0;
  }
  // Quiet is: nothing is due and the scans run. A card that cannot trust its numbers never hides.
  isQuiet() { return this.hasData() && this.health().state === "ok" && !this.scanBroken(); }

  // The colour of the dot and the sentence beside it.
  verdict() {
    const attrs = this.health().attributes || {}, n = attrs.objects || 0;
    if (this.scanBroken()) return { tone: "bad", glyph: "!", text: this.t("cardHealthScanBad") };
    if (this.health().state === "urgent") return { tone: "bad", glyph: "!", text: this.t("cardHealthUrgent") };
    if (this.health().state === "attention") return { tone: "warn", glyph: "!", text: this.t("cardHealthAttention", { n, count: n }) };
    return { tone: "ok", glyph: "✓", text: this.t("cardHealthOk") };
  }

  tile(name, topics) {
    const info = topics[name] || {}, n = info.objects || 0;
    const tone = n && info.level === "high" ? "bad" : n && info.level === "medium" ? "warn" : n ? "" : "zero";
    const go = this._config.tap !== "none" && this._hass?.user?.is_admin && n;
    const link = go ? ` data-hk-panel="view=findingsNav&amp;filter=topic:${name}"` : "";
    return `<div class="hk-tile ${tone}${go ? " go" : ""}"${link}><div class="n">${this.esc(n)}</div><div class="l">${this.esc(this.t(`cardTopic_${name}`))}</div></div>`;
  }

  // What changed since the scan before: "+2 new · −1 fixed", or the plain statement that nothing did.
  changesHtml(attrs, any) {
    if (!this._config.changes || attrs.new == null) return "";
    const parts = [attrs.new ? `<span class="hk-up">${this.esc(this.t("cardNew", { n: attrs.new }))}</span>` : "", attrs.resolved ? `<span class="hk-down">${this.esc(this.t("cardResolved", { n: attrs.resolved }))}</span>` : ""].filter(Boolean);
    return parts.length ? `${this.esc(this.t("cardSince"))} ${parts.join(" · ")}` : any ? this.esc(this.t("cardNoChanges")) : "";
  }

  renderBody() {
    const attrs = this.health().attributes || {}, topics = attrs.topics || {};
    const verdict = this.verdict(), scanAgo = this.ago(this.stateOf("last_scan")?.state);
    const subtitle = this.scanBroken() ? this.t("cardScanOld") : scanAgo ? this.t("cardLastScan", { ago: scanAgo }) : "";
    const title = this._config.title, busy = this.scanning();
    const button = this._config.scan_button && this._hass?.user?.is_admin && this.idOf("scan", "button")
      ? `<button type="button" class="hk-btn" data-hk-act="scan"${busy ? " disabled" : ""}>${this.esc(busy ? this.t("cardScanning") : `⟳ ${this.t("cardScan")}`)}</button>` : "";
    const head = this.head(title ? [verdict.text, subtitle].filter(Boolean).join(" · ") : subtitle, button, false, `<span class="hk-dot ${verdict.tone}">${verdict.glyph}</span>`, title || verdict.text);
    const any = HK_TOPICS.some(name => (topics[name]?.objects || 0) > 0);
    const tiles = this._config.tiles === "always" || (this._config.tiles === "findings" && any)
      ? `<div class="hk-tiles">${HK_TOPICS.map(name => this.tile(name, topics)).join("")}</div>` : "";
    const left = [any || this.scanBroken() ? "" : this.esc(this.t("cardNoFindings")), this.changesHtml(attrs, any)].filter(Boolean).join(" · ");
    return head + tiles + this.footHtml(left, "");
  }

  // The scan button: the same entity the panel and automations use.
  act(name) {
    const id = this.idOf("scan", "button");
    if (name === "scan" && id && this._hass?.user?.is_admin && !this.scanning()) this._hass.callService("button", "press", { entity_id: id });
  }
}

// The battery card: the weakest batteries with a forecast, the next round of changes by area and what to buy for it.
// The numbers come from the sensor "weakest battery" and its attributes; the forecast is read once a day, so until it
// is there the card sorts by level and says "forecast follows".
class HKBatteryCard extends HKCard {
  static tag = "ha-housekeeper-battery-card";
  static pickerName = "HA Housekeeper: Batteries";
  static pickerDescription = "The weakest batteries with a forecast, the next round of changes by area and what to buy for it.";
  static get defaults() { return { view: "weakest", rows: 5, shopping: true, forecast: true }; }

  static editorSchema(t) {
    return [
      { name: "view", selector: { select: { mode: "dropdown", options: ["weakest", "round", "both"].map(value => ({ value, label: t(`edit_view_${value}`) })) } } },
      { name: "rows", selector: { number: { min: 3, max: 10, mode: "box" } } },
      { name: "shopping", selector: { boolean: {} } },
      { name: "forecast", selector: { boolean: {} } },
    ];
  }

  get titleKey() { return "cardBatTitle"; }
  watchedIds() { return ["battery_weakest", "battery_next_change"].map(key => this.idOf(key)).filter(Boolean); }

  data() { return this.stateOf("battery_weakest")?.attributes || {}; }
  hasData() { return Array.isArray(this.data().weakest); }
  attention() { return this.hasData() ? this.data().low || 0 : 0; }
  // Quiet is: no battery is low and none is due within the round.
  isQuiet() { return this.hasData() && !this.data().low && !(this.data().round || []).length; }

  // "about 5 days", "about 3 weeks", "about 4 months": the unit that fits the distance.
  span(days) {
    if (days < 1) return this.t("cardBatSoon");
    if (days < 14) return this.t("cardBatDays", { n: days, count: days });
    if (days < 60) { const n = Math.round(days / 7); return this.t("cardBatWeeks", { n, count: n }); }
    const n = Math.round(days / 30);
    return this.t("cardBatMonths", { n, count: n });
  }

  // What the forecast of one battery says, and how far to trust it.
  outlook(item) {
    const quality = { estimate: "cardBatQEstimate", stable: "cardBatQStable", few_data: "cardBatQFew" }[item.quality];
    const text = item.quality === "low" ? this.t("cardBatLowNow")
      : item.quality === "estimate" ? this.span(item.days_left ?? 0)
      : item.quality === "stable" ? this.t("cardBatStable")
      : this.t("cardBatFollows");
    return { text, quality: quality ? this.t(quality) : "" };
  }

  tone(item) { return item.low ? "bad" : item.days_left != null && item.days_left <= (this.data().round_days || 14) ? "warn" : "ok"; }

  weakestRow(item) {
    const out = this._config.forecast ? this.outlook(item) : { text: "", quality: "" };
    const where = [item.area, item.type].filter(Boolean).join(" · ");
    const bar = item.percent == null ? "<div></div>" : `<div class="hk-bar ${this.tone(item)}"><i style="width:${Math.max(2, Math.min(100, item.percent))}%"></i></div>`;
    const percent = item.percent == null ? "" : `<b>${this.esc(item.percent)} %</b>`;
    return `<div class="hk-row r3"><div class="hk-name"><b>${this.esc(item.name)}</b>${where ? `<small>${this.esc(where)}</small>` : ""}</div>${bar}<div class="hk-right">${percent}${out.text ? `<small>${this.esc(out.text)}</small>` : ""}${out.quality ? `<span class="hk-q">${this.esc(out.quality)}</span>` : ""}</div></div>`;
  }

  // The round of the next days, by area: the nearest area first, inside it the soonest.
  roundHtml(items) {
    const groups = new Map();
    for (const item of items) {
      const key = item.area || "";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    }
    const soonest = list => Math.min(...list.map(i => i.days_left ?? 0));
    const ordered = [...groups.entries()].sort((a, b) => soonest(a[1]) - soonest(b[1]) || a[0].localeCompare(b[0]));
    return ordered.map(([area, list]) => `<div class="hk-area">${this.esc(area || this.t("cardBatNoArea"))}</div>${list.map(item => {
      const out = this.outlook(item);
      return `<div class="hk-row r2"><div class="hk-name"><b>${this.esc(item.name)}</b>${item.type ? `<small>${this.esc(item.type)}</small>` : ""}</div><div class="hk-right"><b>${this.esc(out.text)}</b></div></div>`;
    }).join("")}`).join("");
  }

  shoppingHtml(data) {
    const lines = (data.shopping || []).map(entry => `<span class="q">${this.esc(entry.count)} ×</span><span class="w"><b>${this.esc(entry.type)}</b><br><small>${this.esc(entry.names.join(", "))}</small></span>`);
    const unknown = data.unknown_type || [];
    if (unknown.length) lines.push(`<span class="q mute">${this.esc(unknown.length)}</span><span class="w"><b>${this.esc(this.t("cardBatUnknown"))}</b><br><small>${this.esc(unknown.join(", "))} · ${this.esc(this.t("cardBatUnknownHint"))}</small></span>`);
    return lines.length ? `<div class="hk-sec">${this.esc(this.t("cardBatShopping"))}</div><div class="hk-shop">${lines.join("")}</div>` : "";
  }

  // When the first battery will probably run low, said in months: "in March".
  nextText() {
    const when = Date.parse(this.stateOf("battery_next_change")?.state || "");
    if (!Number.isFinite(when) || when < Date.now() - 86400000) return "";
    const date = new Date(when), sameYear = date.getFullYear() === new Date().getFullYear();
    try { return this.t("cardBatNext", { when: new Intl.DateTimeFormat(this.lang, sameYear ? { month: "long" } : { month: "long", year: "numeric" }).format(date) }); } catch (_) { return ""; }
  }

  renderBody() {
    const data = this.data(), view = this._config.view, round = data.round || [], low = data.low || 0;
    const showWeakest = view === "weakest" || view === "both", showRound = view === "round" || view === "both";
    const chip = low ? `<span class="hk-chip warn">${this.esc(this.t("cardBatLowChip", { n: low, count: low }))}</span>` : `<span class="hk-chip">${this.esc(this.t("cardBatAllGood"))}</span>`;
    if (this.isQuiet()) {
      const sub = data.lowest == null ? "" : this.t("cardBatQuietSub", { total: data.total || 0, lowest: data.lowest });
      return this.head(sub, chip) + this.foot([this.t("cardBatQuietFoot"), this.nextText()].filter(Boolean).join(" · "), "view=batteries");
    }
    const rows = (data.weakest || []).slice(0, Number(this._config.rows) || 5);
    const sub = showWeakest ? this.t("cardBatWeakestSub", { n: rows.length, total: data.total || 0 })
      : this.t("cardBatRoundSub", { days: data.round_days || 14, n: round.length, count: round.length });
    let body = this.head(sub, chip, true);
    if (showWeakest) body += rows.map(item => this.weakestRow(item)).join("");
    if (showRound && round.length) {
      body += `<div class="hk-sec top">${this.esc(this.t("cardBatRound"))}</div>${this.roundHtml(round)}`;
      if (this._config.shopping) body += this.shoppingHtml(data);
    }
    return body + this.foot(this._config.shopping && showRound ? this.t("cardBatNoRechargeable") : "", "view=batteries");
  }
}

// The home functions card: one row per function (heating, alarm, photovoltaics ...) with its state now, the reason in
// words, how many of its objects are fine and the days of the last weeks as a strip. The numbers come from the sensor
// of each function (its state and attributes); the strip is Housekeeper's own record, no query of the history.
class HKFunctionsCard extends HKCard {
  static tag = "ha-housekeeper-functions-card";
  static pickerName = "HA Housekeeper: Home functions";
  static pickerDescription = "Heating, alarm, photovoltaics: the functions of the house with their state, the reason and the last weeks.";
  static get defaults() { return { entities: [], history: "30" }; }

  static editorSchema(t) {
    return [
      { name: "entities", selector: { entity: { multiple: true, filter: { integration: "ha_housekeeper", domain: "sensor" } } } },
      { name: "history", selector: { select: { mode: "dropdown", options: ["30", "14", "7", "0"].map(value => ({ value, label: t(`edit_history_${value}`) })) } } },
    ];
  }

  get titleKey() { return "cardFnTitle"; }

  // The sensors of the functions, the chosen ones when the configuration names some. Worst first, then by name.
  functions() {
    const chosen = new Set(this._config.entities || []);
    const rank = { problem: 0, unverified: 1, ok: 2, disabled: 3 };
    return (this.found().byKey.monitor || [])
      .filter(id => id.startsWith("sensor.") && (!chosen.size || chosen.has(id)))
      .map(id => ({ id, state: this._hass?.states?.[id] }))
      .filter(f => f.state)
      .sort((a, b) => (rank[a.state.state] ?? 4) - (rank[b.state.state] ?? 4) || this.fname(a).localeCompare(this.fname(b)));
  }

  // The name of a function; before its first result the sensor has none of its own, so the name of the entity stands in.
  fname(item) { return String(item.state?.attributes?.function_name || item.state?.attributes?.friendly_name || item.id); }

  watchedIds() { return this.functions().map(f => f.id); }
  hasData() { return true; }
  attention() { return this.functions().filter(f => ["problem", "unverified"].includes(f.state.state)).length; }
  // Quiet is: every function is fine.
  isQuiet() { return this.functions().length > 0 && this.functions().every(f => f.state.state === "ok"); }

  // What is wrong, in words: the object and what it does, or that the state is not sure.
  reason(attrs, state) {
    if (state === "disabled") return this.t("cardFnOff");
    const name = attrs.problem_object || attrs.function_name || "";
    if (state === "unverified") return this.t("cardFnUnsure");
    const code = String(attrs.reason || "");
    if (code === "disabled") return this.t("cardFnMemberOff", { name });
    if (code === "rule_stale") return this.t("cardFnStale", { name });
    if (code === "rule_below_min") return this.t("cardFnBelow", { name });
    return this.t("cardFnDown", { name });
  }

  strip(days) {
    const count = Number(this._config.history);
    if (!count || !Array.isArray(days) || !days.length) return "<div></div>";
    return `<div class="hk-strip">${days.slice(-count).map(day => `<i class="${this.esc(day || "none")}"></i>`).join("")}</div>`;
  }

  row(item) {
    const state = item.state.state, attrs = item.state.attributes || {};
    const tone = { ok: "ok", problem: "bad", unverified: "warn", disabled: "off" }[state] || "off";
    const sub = state === "ok" || state === "disabled" && !attrs.members_total
      ? this.t("cardFnMembers", { ok: attrs.members_ok ?? 0, total: attrs.members_total ?? 0, count: attrs.members_total ?? 0 })
      : this.reason(attrs, state);
    const go = this._config.tap !== "none" && this._hass?.user?.is_admin && attrs.function_id;
    const link = go ? ` data-hk-panel="view=monitor&amp;function=${this.esc(attrs.function_id)}"` : "";
    const available = attrs.availability_30d == null ? "—" : `${String(attrs.availability_30d).replace(".", this.decimal())} %`;
    return `<div class="hk-row fn${go ? " go" : ""}"${link}><span class="hk-st ${tone}"></span><div class="hk-name"><b>${this.esc(this.fname(item))}</b><small class="${state === "problem" ? "bad" : state === "unverified" ? "warn" : ""}">${this.esc(sub)}</small></div>${this.strip(attrs.history_30d)}<div class="hk-right"><b>${this.esc(available)}</b><small>${this.esc(this.t("cardFnWindow", { n: 30 }))}</small></div></div>`;
  }

  decimal() { try { return (1.5).toLocaleString(this.lang).replace(/\d/g, ""); } catch (_) { return "."; } }

  renderBody() {
    const list = this.functions(), troubled = list.filter(f => f.state.state === "problem").length, unsure = list.filter(f => f.state.state === "unverified").length;
    if (!list.length) return this.head("", "") + `<div class="hk-note">${this.esc(this.t("cardFnNone"))}</div>` + this.foot("", "view=monitor");
    const chip = troubled ? `<span class="hk-chip bad">${this.esc(this.t("cardFnProblems", { n: troubled, count: troubled }))}</span>`
      : unsure ? `<span class="hk-chip warn">${this.esc(this.t("cardFnUnverified", { n: unsure, count: unsure }))}</span>`
      : `<span class="hk-chip">${this.esc(this.t("cardFnAllOk"))}</span>`;
    return this.head(this.t("cardFnCount", { n: list.length, count: list.length }), chip, true) + list.map(item => this.row(item)).join("") + this.foot("", "view=monitor");
  }
}

// The auto-pause card: integrations that are paused because they keep failing, with the time to the next attempt.
// The numbers come from the sensor "paused integrations" and its attributes. The menu of a row (try now, end the
// pause, never pause it) is for administrators and calls the same command as the panel.
class HKAutoPauseCard extends HKCard {
  static tag = "ha-housekeeper-auto-pause-card";
  static pickerName = "HA Housekeeper: Auto-pause";
  static pickerDescription = "Integrations that are paused because they keep failing, with the time to the next attempt.";
  static get defaults() { return { actions: true, progress: true }; }

  static editorSchema() {
    return [
      { name: "actions", selector: { boolean: {} } },
      { name: "progress", selector: { boolean: {} } },
    ];
  }

  get titleKey() { return "cardApTitle"; }
  watchedIds() { return [this.idOf("auto_pause")].filter(Boolean); }
  data() { return this.stateOf("auto_pause")?.attributes || {}; }
  hasData() { return Array.isArray(this.data().paused); }
  attention() { return this.hasData() ? this.data().paused.length : 0; }
  // Quiet is: auto-pause is on and nothing is paused. A card that says "off" is no news to hide.
  isQuiet() { return this.hasData() && this.data().enabled === true && !this.data().paused.length; }
  canAct() { return Boolean(this._config.actions && this._hass?.user?.is_admin); }

  row(item) {
    const why = item.reason === "manual" ? this.t("cardApWhyManual") : this.t("cardApWhyAuto", { n: item.failures ?? 0, count: item.failures ?? 0 });
    const next = item.exhausted ? this.t("cardApExhausted", { n: this.data().max_days || 7, count: this.data().max_days || 7 })
      : item.trying ? this.t("cardApTrying")
      : this.t("cardApNext", { when: this.until(item.next) });
    const share = Math.min(100, Math.round(((item.attempts_done || 0) / (item.attempts_total || 1)) * 100));
    const progress = this._config.progress && !item.exhausted
      ? `<div class="hk-bar warn"><i style="width:${Math.max(3, share)}%"></i></div><small>${this.esc(this.t("cardApStep", { done: item.attempts_done, total: item.attempts_total, step: item.step_hours }))}</small>` : "";
    const kebab = this.canAct() ? `<button type="button" class="hk-kebab${this._menu?.id === item.entry_id ? " open" : ""}" data-hk-act="menu:${this.esc(item.entry_id)}" aria-label="${this.esc(this.t("cardApMenu"))}">⋮</button>` : "<span></span>";
    return `<div class="hk-row ap"><div class="hk-name"><b>${this.esc(item.title)}</b><small>${this.esc(why)} · ${this.esc(this.t("cardApSince", { ago: this.ago(item.since) }))}</small><div class="hk-next">${this.esc(next)}</div>${progress}</div>${kebab}</div>`;
  }

  // The menu sits at the button, in front of everything (the card clips what runs over its edge).
  menuHtml() {
    const menu = this._menu;
    if (!menu || !this.canAct()) return "";
    const item = (name, key) => `<button type="button" data-hk-act="${name}:${this.esc(menu.id)}">${this.esc(this.t(key))}</button>`;
    return `<div class="hk-backdrop" data-hk-act="menu-close"></div><div class="hk-menu" style="top:${menu.top}px;right:${menu.right}px">${item("try", "cardApTry")}${item("resume", "cardApResume")}${item("never", "cardApNever")}<button type="button" data-hk-act="open">${this.esc(this.t("cardApOpen"))}</button></div>`;
  }

  renderBody() {
    const data = this.data(), paused = data.paused || [], admin = this._hass?.user?.is_admin && this._config.tap !== "none";
    if (!paused.length && !data.enabled) {
      const link = admin ? `<span class="hk-link" data-hk-panel="view=autopause">${this.esc(this.t("cardApEnable"))}</span>` : "";
      return this.head(this.t("cardApOffSub"), link, false, "", this.t("cardApOff"));
    }
    if (!paused.length) return this.head(this.t("cardApNone"), `<span class="hk-chip">${this.esc(this.t("cardApAllRuns"))}</span>`);
    const days = data.max_days || 7;
    return this.head(this.t("cardApOnSub"), `<span class="hk-chip">${this.esc(this.t("cardApChip", { n: paused.length, count: paused.length }))}</span>`, true)
      + paused.map(item => this.row(item)).join("") + this.foot(this.t("cardApFoot", { n: days, count: days }), "view=autopause") + this.menuHtml();
  }

  act(name, event) {
    const [action, id] = String(name).split(":");
    if (action === "menu-close") { this._menu = null; this.update(true); return; }
    if (action === "menu") {
      const box = event?.currentTarget?.getBoundingClientRect?.();
      this._menu = this._menu?.id === id ? null : { id, top: Math.round((box?.bottom ?? 0) + 4), right: Math.round((globalThis.innerWidth ?? 0) - (box?.right ?? 0)) };
      this.update(true);
      return;
    }
    if (action === "open") { this._menu = null; this.openPanel("view=autopause"); this.update(true); return; }
    if (["try", "resume", "never"].includes(action) && this.canAct()) this.run(action, id);
  }

  // Do what the menu says through the command of the panel; say how it went.
  async run(action, id) {
    this._menu = null;
    const done = { try: "cardApTried", resume: "cardApResumed", never: "cardApExcluded" }[action];
    try {
      await this._hass.callWS({ type: "ha_housekeeper/auto_pause_set", action, entry_id: id, ...(action === "never" ? { on: true } : {}) });
      this.toast(this.t(done));
    } catch (err) {
      this.toast(this.t("cardApFailed", { detail: err?.message || String(err) }));
    }
    this.update(true);
  }
}

// The vacation mode card: whether the mode is on, where it comes from, how many failures it holds back and how long the
// grace period after it is. Pure display: the switch belongs to the helper or the calendar the person chose, so the card
// has none. Without a vacation mode it is hidden (in the editor only a placeholder). When the switch is a calendar, the
// card reads "since" and "until" from that calendar's own attributes; a helper has no end.
class HKVacationCard extends HKCard {
  static tag = "ha-housekeeper-vacation-card";
  static pickerName = "HA Housekeeper: Vacation mode";
  static pickerDescription = "Shows while the vacation mode is on: the source, the period and how many failures are held back.";
  static get defaults() { return { quiet: "hide", numbers: true, source: true }; }

  static editorSchema() {
    return [
      { name: "numbers", selector: { boolean: {} } },
      { name: "source", selector: { boolean: {} } },
    ];
  }

  get titleKey() { return "cardVaTitle"; }
  data() { return this.stateOf("vacation")?.attributes || {}; }
  verdict() { return this.stateOf("vacation")?.state; }
  watchedIds() { return [this.idOf("vacation"), this.data().entity].filter(Boolean); }
  hasData() { return ["off", "on", "after", "unset"].includes(this.verdict()); }
  attention() { return 0; }
  // Quiet is: there is no vacation mode to show.
  isQuiet() { return this.verdict() !== "on" && this.verdict() !== "after"; }
  hiddenKey() { return "cardVaHidden"; }

  source() {
    const entity = this.data().entity, state = entity && this._hass?.states?.[entity];
    return { id: entity, state, name: state?.attributes?.friendly_name || entity || "", calendar: Boolean(entity?.startsWith("calendar.")) };
  }

  // A time of a calendar ("2026-11-17 00:00:00", local) as a Date, or null.
  when(value) {
    const date = new Date(String(value || "").replace(" ", "T"));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  day(date) {
    try { return new Intl.DateTimeFormat(this.lang, { day: "numeric", month: "short" }).format(date); } catch (_) { return date.toDateString(); }
  }

  // The end of a calendar event as the last day of the absence: an all-day event ends at midnight of the day after it.
  lastDay(end, allDay) {
    if (!end || !allDay || end.getHours() || end.getMinutes() || end.getSeconds()) return end;
    const day = new Date(end);
    day.setDate(day.getDate() - 1);
    return day;
  }

  fact(label, value, sub) {
    return `<div class="hk-fact"><div class="l">${this.esc(label)}</div><div class="v">${this.esc(value)}</div>${sub ? `<div class="s">${this.esc(sub)}</div>` : ""}</div>`;
  }

  facts(data, since, until) {
    if (!this._config.numbers) return "";
    const cells = [];
    if (since) {
      const left = until ? Math.max(0, Math.ceil((until - Date.now()) / 86400000)) : null;
      cells.push(this.fact(this.t("cardVaSince"), this.day(since), left == null ? "" : this.t("cardVaLeft", { n: left, count: left })));
    }
    cells.push(this.fact(this.t("cardVaHeld"), String(data.held ?? 0), this.t("cardVaHeldSub")));
    if (data.grace_hours != null) cells.push(this.fact(this.t("cardVaGrace"), this.t("cardVaGraceHours", { n: data.grace_hours }), this.t("cardVaGraceSub")));
    return `<div class="hk-facts n${cells.length}">${cells.join("")}</div>`;
  }

  renderBody() {
    const data = this.data(), verdict = this.verdict(), src = this.source(), link = "view=exceptions";
    if (verdict === "unset") return this.head(this.t("cardVaUnset"), `<span class="hk-chip">${this.esc(this.t("cardVaChipOff"))}</span>`) + this.foot("", link);
    if (verdict === "off") return this.head(this.t("cardVaOff"), `<span class="hk-chip">${this.esc(this.t("cardVaChipOff"))}</span>`) + this.foot("", link);
    const attrs = src.calendar && src.state?.attributes || {}, since = this.when(attrs.start_time), until = this.when(attrs.end_time);
    let sub = "", chip;
    if (verdict === "after") {
      const end = new Date(data.after_until);
      sub = this.t("cardVaAfterSub", { until: Number.isNaN(end.getTime()) ? "" : this.day(end) }).replace(/\.\.$/, "."); // a short month already ends in a full stop
      chip = this.t("cardVaChipAfter");
    } else {
      if (this._config.source && src.name) sub = this.t(src.calendar ? "cardVaSourceCal" : "cardVaSource", { name: src.name });
      const last = this.lastDay(until, attrs.all_day);
      chip = last ? this.t("cardVaChipUntil", { date: this.day(last) }) : this.t("cardVaChipOn");
    }
    const rules = data.rules && this._config.numbers
      ? `<div class="hk-note">${this.esc(this.t("cardVaRules", { n: data.rules }))} <small>${this.esc(this.t("cardVaRestore"))}</small></div>` : "";
    return this.head(sub, `<span class="hk-chip warn">${this.esc(chip)}</span>`, true) + this.facts(data, verdict === "on" ? since : null, until) + rules + this.foot("", link);
  }
}

// The card after the update: it appears when an update was watched and says what has stopped working since, in the
// words of the watch ("since", never "because"). It shows for a few hours after the update and is hidden otherwise.
// The numbers come from the sensor "after the update" and its attributes.
class HKUpdateCard extends HKCard {
  static tag = "ha-housekeeper-update-card";
  static pickerName = "HA Housekeeper: After the update";
  static pickerDescription = "Appears after an update and shows what has stopped working since, and how long the start took.";
  static get defaults() { return { show_hours: "6", start: true }; }

  static editorSchema(t) {
    return [
      { name: "show_hours", selector: { select: { mode: "dropdown", options: ["1", "3", "6", "24"].map(value => ({ value, label: t(`edit_show_hours_${value}`) })) } } },
      { name: "start", selector: { boolean: {} } },
    ];
  }

  get titleKey() { return "cardUpTitle"; }
  watchedIds() { return [this.idOf("update_watch")].filter(Boolean); }
  verdict() { return this.stateOf("update_watch")?.state; }
  data() { return this.stateOf("update_watch")?.attributes || {}; }
  // "unknown" is also what Home Assistant says for a sensor without a value; only a watch that was judged "unknown" has data.
  hasData() {
    const state = this.verdict();
    return state === "unknown" ? Boolean(this.data().started_at) : Boolean(state) && state !== "unavailable";
  }
  attention() {
    if (this.verdict() !== "worse" || !this.inWindow()) return 0;
    const data = this.data();
    return (data.problems_total || 0) + (data.new_findings || 0) + (data.new_repairs || 0);
  }
  // Quiet is: the update changed nothing for the worse.
  isQuiet() { return ["stable", "transient"].includes(this.verdict()); }
  hiddenKey() { return this.inWindow() ? "cardQuietHidden" : "cardUpHidden"; }
  frameClass() { return this.verdict() === "worse" ? "hk-alert" : ""; }

  // The card shows only for a while after the update that was watched.
  inWindow() {
    const started = Date.parse(this.data().started_at || "");
    return Number.isFinite(started) && this.verdict() !== "none" && Date.now() - started <= Number(this._config.show_hours) * 3600000;
  }

  mode() {
    if (!this.inWindow()) return this.editing() ? "placeholder" : "hide";
    return super.mode();
  }

  // "Home Assistant 2026.11.1, Operating system 14.0": what was updated.
  what() {
    const keys = { ha_version: "cardUpHa", os_version: "cardUpOs", supervisor_version: "cardUpSupervisor" };
    return (this.data().triggers || []).map(t => this.t(keys[t.kind] || "cardUpHa", { to: t.to ?? "" })).join(", ");
  }

  duration(seconds) {
    const total = Math.round(seconds), m = Math.floor(total / 60), s = total % 60;
    return m ? this.t("cardDurMin", { m, s }) : this.t("cardDurSec", { s });
  }

  startLine(data) {
    if (!this._config.start || !Number.isFinite(data.start_seconds)) return "";
    const took = this.duration(data.start_seconds);
    return Number.isFinite(data.start_usual_seconds) ? this.t("cardUpStart", { took, usual: this.duration(data.start_usual_seconds) }) : this.t("cardUpStartOnly", { took });
  }

  problemRow(item) {
    const type = this.t(`cardUpType_${["config_entry", "device", "automation", "script", "scene", "entity"].includes(item.type) ? item.type : "other"}`);
    const status = this.t(`cardUpStatus_${["unavailable", "problem", "stopped"].includes(item.status) ? item.status : "unavailable"}`);
    return `<div class="hk-row r2"><div class="hk-name"><b>${this.esc(item.name)}</b><small>${this.esc(type)}</small></div><span class="hk-tag bad">${this.esc(status)}</span></div>`;
  }

  renderBody() {
    const data = this.data(), state = this.verdict(), title = this._config.title, ago = this.ago(data.started_at);
    const sub = [this.what(), ago].filter(Boolean).join(" · ");
    const head = (text, right = "", line = false, tone = "") => this.head(title ? [text, sub].filter(Boolean).join(" · ") : sub, right, line, tone ? `<span class="hk-dot ${tone}">${tone === "ok" ? "✓" : "!"}</span>` : "", title || text);
    const foot = this.footHtml(this.esc(this.startLine(data)), "view=findingsNav");
    if (state === "none") return head(this.t("cardUpTitle")) + `<div class="hk-note">${this.esc(this.t("cardUpNone"))}</div>`;
    if (state === "pending") {
      const when = this.until(data.next_check);
      return head(this.t("cardUpPending"), "", false, "warn") + (when ? `<div class="hk-note">${this.esc(this.t("cardUpFirstCheck", { when }))}</div>` : "") + foot;
    }
    if (state === "worse") {
      const things = (data.problems_total || 0) + (data.new_findings || 0) + (data.new_repairs || 0);
      const chip = `<span class="hk-chip warn">${this.esc(this.t("cardUpChip", { n: things, count: things }))}</span>`;
      const more = (data.problems_total || 0) - (data.problems || []).length;
      const notes = [
        more > 0 ? this.t("cardUpMore", { n: more, count: more }) : "",
        data.new_findings ? this.t("cardUpFindings", { n: data.new_findings, count: data.new_findings }) : "",
        data.new_repairs ? this.t("cardUpRepairs", { n: data.new_repairs, count: data.new_repairs }) : "",
      ].filter(Boolean).map(text => `<div class="hk-note">${this.esc(text)}</div>`).join("");
      return head(this.t("cardUpWorse"), chip, true, "warn") + (data.problems || []).map(item => this.problemRow(item)).join("") + notes + foot;
    }
    if (state === "unknown") return head(this.t("cardUpUnknown"), "", false, "warn") + `<div class="hk-note">${this.esc(this.t("cardUpUnknownNote"))}</div>` + foot;
    const note = state === "transient" && data.transient ? this.t("cardUpTransientNote", { n: data.transient, count: data.transient }) : this.t("cardUpFineNote");
    return head(this.t("cardUpFine"), `<span class="hk-chip">${this.esc(this.t("cardUpAllFine"))}</span>`, false, "ok") + `<div class="hk-note">${this.esc(note)}</div>` + foot;
  }
}

// The start time card: how long the last start of Home Assistant took against the usual, the last starts as bars and
// the integrations that took longest. The figures are those of the start page of the panel; they come from the
// sensor "start time" and its attributes.
class HKStartCard extends HKCard {
  static tag = "ha-housekeeper-start-card";
  static pickerName = "HA Housekeeper: Start time";
  static pickerDescription = "How long the last start took against the usual, the last starts and the integrations that took longest.";
  static get defaults() { return { history: "14", slowest: 3 }; }

  static editorSchema(t) {
    return [
      { name: "history", selector: { select: { mode: "dropdown", options: ["14", "30", "7", "0"].map(value => ({ value, label: t(`edit_history_${value}`) })) } } },
      { name: "slowest", selector: { number: { min: 0, max: 10, mode: "box" } } },
    ];
  }

  get titleKey() { return "cardStTitle"; }
  watchedIds() { return [this.idOf("start_time")].filter(Boolean); }
  data() { return this.stateOf("start_time")?.attributes || {}; }
  seconds() { const value = Number(this.stateOf("start_time")?.state); return Number.isFinite(value) ? value : null; }
  hasData() { return this.seconds() !== null; }
  attention() { return this.hasData() && this.data().slower ? 1 : 0; }
  // Quiet is: the start took about as long as usual.
  isQuiet() { return this.hasData() && !this.data().slower; }

  duration(seconds) {
    const total = Math.round(seconds), m = Math.floor(total / 60), s = total % 60;
    return m ? this.t("cardDurMin", { m, s }) : this.t("cardDurSec", { s });
  }

  // The last starts as bars, the last one in colour; the height is the share of the longest start shown.
  bars(history, slower) {
    const count = Number(this._config.history);
    if (!count || !Array.isArray(history) || history.length < 2) return "";
    const rows = history.slice(-count), top = Math.max(...rows, 1);
    return `<div class="hk-bars">${rows.map((value, i) => `<i class="${i === rows.length - 1 ? (slower ? "hi" : "now") : ""}" style="height:${Math.max(6, Math.round((value / top) * 100))}%"></i>`).join("")}</div>`;
  }

  slowestHtml(list) {
    const rows = (list || []).slice(0, Number(this._config.slowest) || 0);
    if (!rows.length) return "";
    return `<div class="hk-sec top">${this.esc(this.t("cardStSlowest"))}</div>${rows.map(item => `<div class="hk-row r2"><div class="hk-name"><b>${this.esc(item.name)}</b>${item.state && item.state !== "loaded" ? `<small>${this.esc(this.t("cardStNotLoaded"))}</small>` : ""}</div><div class="hk-right"><b class="${item === rows[0] && this.data().slower ? "warnt" : ""}">${this.esc(this.duration(item.seconds))}</b></div></div>`).join("")}`;
  }

  renderBody() {
    const data = this.data(), seconds = this.seconds(), ago = this.ago(data.started_at);
    const sub = ago ? this.t("cardStLast", { ago }) : "";
    if (this.isQuiet()) {
      return this.head(this.t("cardStQuietSub", { took: this.duration(seconds) }), `<span class="hk-chip">${this.esc(this.t("cardStNormal"))}</span>`) + this.foot("", "view=storage");
    }
    const chip = data.change_percent != null ? `<span class="hk-chip warn">${this.esc(this.t("cardStSlower", { n: data.change_percent }))}</span>` : "";
    const usual = data.usual_seconds != null ? `<span>${this.esc(this.t("cardStUsual", { usual: this.duration(data.usual_seconds) }))}</span>` : "";
    return this.head(sub, chip, true) + `<div class="hk-big"><b>${this.esc(this.duration(seconds))}</b>${usual}</div>` + this.bars(data.history, data.slower) + this.slowestHtml(data.slowest) + this.foot("", "view=storage");
  }
}

// The database card, the simple variant: how big the database is, whether it grows fast, the line of the daily sizes
// and what the recorder keeps. Everything comes from the sensor "database size" and its attributes, which a scan reads
// from the files and from the daily sizes Housekeeper has noted; which entities write the most is on the database
// page of the panel.
// Home Assistant shows a size in the unit of the person's choice and says which one in the attribute.
const HK_BYTE_UNITS = { B: 1, kB: 1e3, MB: 1e6, GB: 1e9, TB: 1e12, KiB: 1024, MiB: 1024 ** 2, GiB: 1024 ** 3, TiB: 1024 ** 4 };

class HKDatabaseCard extends HKCard {
  static tag = "ha-housekeeper-database-card";
  static pickerName = "HA Housekeeper: Database";
  static pickerDescription = "How big the database is, whether it grows fast and what the recorder keeps.";
  static get defaults() { return { history: "30", facts: true }; }

  static editorSchema(t) {
    return [
      { name: "history", selector: { select: { mode: "dropdown", options: ["30", "90", "14", "7", "0"].map(value => ({ value, label: t(`edit_history_${value}`) })) } } },
      { name: "facts", selector: { boolean: {} } },
    ];
  }

  get titleKey() { return "cardDbTitle"; }
  watchedIds() { return [this.idOf("database_size")].filter(Boolean); }
  data() { return this.stateOf("database_size")?.attributes || {}; }
  bytes() {
    const state = this.stateOf("database_size"), value = Number(state?.state);
    return state && Number.isFinite(value) ? value * (HK_BYTE_UNITS[state.attributes?.unit_of_measurement] ?? 1) : null;
  }
  hasData() { return this.bytes() !== null; }
  attention() { return this.hasData() && !this.isQuiet() ? 1 : 0; }
  // Quiet is: it does not grow fast and the journal is not large.
  isQuiet() { return this.hasData() && !this.data().growing_fast && !this.data().wal_large; }

  // "3,4 GB" or "180 MB": gigabytes from one gigabyte on, in the number format of the language; `sign` adds + and −.
  size(bytes, sign = false) {
    const big = Math.abs(bytes) >= 1024 ** 3;
    try {
      return new Intl.NumberFormat(this.lang, { style: "unit", unit: big ? "gigabyte" : "megabyte", unitDisplay: "short", maximumFractionDigits: big ? 1 : 0, signDisplay: sign ? "exceptZero" : "auto" }).format(bytes / (big ? 1024 ** 3 : 1024 ** 2));
    } catch (_) { return `${Math.round(bytes / 1024 ** 2)} MB`; }
  }

  engine(data) {
    const name = { sqlite: "SQLite", mysql: "MariaDB/MySQL", postgresql: "PostgreSQL" }[data.dialect] || data.dialect || "";
    return [name, data.estimated ? this.t("cardDbEstimated") : ""].filter(Boolean).join(" · ");
  }

  // The daily sizes as a line with the area under it, as wide as the card.
  line(history) {
    const count = Number(this._config.history);
    const rows = count && Array.isArray(history) ? history.slice(-count) : [];
    if (rows.length < 2) return "";
    const w = 300, h = 44, lo = Math.min(...rows), hi = Math.max(...rows), span = Math.max(hi - lo, 1);
    const points = rows.map((value, i) => `${((i / (rows.length - 1)) * w).toFixed(1)} ${(h - 4 - ((value - lo) / span) * (h - 8)).toFixed(1)}`);
    return `<svg class="hk-line" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img"><path class="a" d="M${points.join(" L")} L${w} ${h} L0 ${h}Z"/><path d="M${points.join(" L")}"/></svg>`;
  }

  facts(data) {
    if (!this._config.facts) return "";
    const cells = [];
    if (data.wal_bytes != null) cells.push(`<div class="hk-fact"><div class="l">${this.esc(this.t("cardDbWal"))}</div><div class="v ${data.wal_large ? "warnt" : ""}">${this.esc(this.size(data.wal_bytes))}</div><div class="s">${this.esc(this.t(data.wal_large ? "cardDbWalBig" : "cardDbWalNormal"))}</div></div>`);
    if (data.keep_days != null) cells.push(`<div class="hk-fact"><div class="l">${this.esc(this.t("cardDbKeep"))}</div><div class="v">${this.esc(this.t("cardDbKeepDays", { n: data.keep_days, count: data.keep_days }))}</div><div class="s">Recorder</div></div>`);
    return cells.length ? `<div class="hk-facts n${cells.length}">${cells.join("")}</div>` : "";
  }

  renderBody() {
    const data = this.data(), bytes = this.bytes();
    if (this.isQuiet()) {
      return this.head(this.t("cardDbQuietSub", { size: this.size(bytes) }), `<span class="hk-chip">${this.esc(this.t("cardDbOk"))}</span>`) + this.foot("", "view=recorder");
    }
    const chip = `<span class="hk-chip warn">${this.esc(this.t(data.growing_fast ? "cardDbGrowing" : "cardDbWalLarge"))}</span>`;
    const parts = [];
    if (data.change_bytes != null && data.change_days) parts.push(this.t("cardDbGrowth", { change: this.size(data.change_bytes, true), days: data.change_days, count: data.change_days }));
    if (data.per_day > 0) parts.push(this.t("cardDbPerDay", { size: this.size(data.per_day) }));
    const big = `<div class="hk-big"><b>${this.esc(this.size(bytes))}</b>${parts.length ? `<span>${this.esc(parts.join(" · "))}</span>` : ""}</div>`;
    return this.head(this.engine(data), chip, true) + big + this.line(data.history) + this.facts(data) + this.foot("", "view=recorder");
  }
}

// The overview card: the cards of this integration as the sections of one card, in tabs or one below the other.
// It has no logic of its own: each section is the card itself, kept alive and given the same hass, so a section looks
// and acts exactly like the single card. A tab shows how many things in its section call for a look.
// The first five are the default; the others are chosen in the editor or in YAML.
const HK_SECTION_KEYS = ["health", "batteries", "functions", "auto_pause", "update", "backup", "start", "database", "vacation"];
const HK_SECTION_DEFAULT = ["health", "batteries", "functions", "auto_pause", "update"];
const HK_SECTION_LABELS = { health: "cardOvHealth", batteries: "cardOvBatteries", functions: "cardOvFunctions", auto_pause: "cardOvAutoPause", update: "cardOvUpdate", backup: "cardOvBackup", start: "cardOvStart", database: "cardOvDatabase", vacation: "cardOvVacation" };
const hkSectionClass = key => ({ health: HKHealthCard, batteries: HKBatteryCard, functions: HKFunctionsCard, auto_pause: HKAutoPauseCard, update: HKUpdateCard, backup: HKBackupCard, start: HKStartCard, database: HKDatabaseCard, vacation: HKVacationCard })[key];

// The sections of the configuration: a name ("batteries") or an entry with the options of that card
// ({ type: "batteries", rows: 3 }). An unknown name and a repeated one are left out. `common` is what every
// section gets unless its entry says otherwise.
function sectionSpecs(sections, common) {
  const seen = new Set(), out = [];
  for (const item of Array.isArray(sections) ? sections : []) {
    const spec = typeof item === "string" ? { type: item } : item;
    const key = spec?.type;
    if (!HK_SECTION_KEYS.includes(key) || seen.has(key)) continue;
    seen.add(key);
    const { type, ...options } = spec;
    // The vacation card is there only while the mode is on, whatever the rest of the sections do when quiet.
    out.push({ key, config: { ...common, ...(key === "vacation" ? { quiet: "hide" } : {}), ...options } });
  }
  return out;
}

// Which sections show and which one is open: the one the person picked, else the first with something to look at.
function overviewPlan(keys, hidden, attention, picked) {
  const shown = keys.filter(key => !hidden.has(key));
  const open = shown.includes(picked) ? picked : shown.find(key => (attention[key] || 0) > 0) || shown[0] || null;
  return { shown, open };
}

class HKOverviewCard extends HKCard {
  static tag = "ha-housekeeper-overview-card";
  static pickerName = "HA Housekeeper: Overview";
  static pickerDescription = "The health of the house, batteries, home functions, auto-pause, the update, backup, start time, database and vacation mode in one card, in tabs.";
  static get defaults() { return { sections: [...HK_SECTION_DEFAULT], layout: "tabs" }; }

  static editorSchema(t) {
    return [
      { name: "sections", selector: { select: { multiple: true, mode: "list", options: HK_SECTION_KEYS.map(value => ({ value, label: t(`edit_sections_${value}`) })) } } },
      { name: "layout", selector: { select: { mode: "dropdown", options: ["tabs", "stacked"].map(value => ({ value, label: t(`edit_layout_${value}`) })) } } },
    ];
  }

  getCardSize() { return 6; }
  watchedIds() { return []; }

  // The sections live on between updates: only a new configuration builds them again.
  update(force = false) {
    if (!this._config || !this._hass) return;
    if (force || !this._sections) this.build();
    for (const el of this._sections.values()) { el.preview = this.preview === true; el.hass = this._hass; }
    this.arrange();
  }

  build() {
    const { tap, compact, quiet } = this._config, common = { tap, compact, quiet };
    const doc = globalThis.document, root = this.shadowRoot;
    const title = this._config.title ? `<div class="hk-ovtitle">${this.esc(this._config.title)}</div>` : "";
    root.innerHTML = `<style>${CARD_CSS}</style><ha-card><div class="hk-ov ${this._config.layout === "stacked" ? "stacked" : ""}">${title}<div class="hk-ovtabs" role="tablist"></div><div class="hk-ovpanes"></div></div></ha-card>`;
    const panes = root.querySelector(".hk-ovpanes");
    this._sections = new Map();
    this._panes = new Map();
    this._tabsHtml = null; // the tab bar is new, so it is drawn again
    for (const { key, config } of sectionSpecs(this._config.sections, common)) {
      const el = doc.createElement(hkSectionClass(key).tag);
      // The section is no card of its own here: the frame is the one of the overview.
      el.style.cssText = "--ha-card-border-width: 0; --ha-card-box-shadow: none; --ha-card-border-radius: 0; --ha-card-background: transparent;";
      el.setConfig(config);
      const pane = doc.createElement("div");
      pane.setAttribute("role", "tabpanel");
      pane.appendChild(el);
      panes.appendChild(pane);
      this._sections.set(key, el);
      this._panes.set(key, pane);
    }
    const tabs = root.querySelector(".hk-ovtabs");
    tabs.setAttribute("aria-label", this.t("cardOvTabs"));
    tabs.addEventListener("click", event => { const key = event.target.closest?.("[data-hk-tab]")?.getAttribute("data-hk-tab"); if (key) this.pick(key); });
    tabs.addEventListener("keydown", event => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
      if (!step || !this._shown?.length) return;
      event.preventDefault();
      this.pick(this._shown[(this._shown.indexOf(this._open) + step + this._shown.length) % this._shown.length], true);
    });
  }

  pick(key, focus = false) {
    this._picked = key;
    this.arrange();
    if (focus) this.shadowRoot.querySelector(`[data-hk-tab="${key}"]`)?.focus?.();
  }

  // Which sections show, which one is open, and the tab bar to match.
  arrange() {
    const keys = [...this._sections.keys()];
    const hidden = new Set(keys.filter(key => this._sections.get(key).style.display === "none"));
    const attention = Object.fromEntries(keys.map(key => [key, this._sections.get(key).attention()]));
    const { shown, open } = overviewPlan(keys, hidden, attention, this._picked);
    this._shown = shown; this._open = open;
    this.style.display = !shown.length && this.preview !== true ? "none" : "";
    for (const [key, pane] of this._panes) pane.className = `hk-pane${shown.includes(key) ? " in" : ""}${key === open ? " open" : ""}`;
    const html = shown.map(key => `<button type="button" role="tab" class="hk-tab${key === open ? " on" : ""}" aria-selected="${key === open}" tabindex="${key === open ? 0 : -1}" data-hk-tab="${key}">${this.esc(this.t(HK_SECTION_LABELS[key]))}${attention[key] ? `<span class="hk-badge">${this.esc(attention[key])}</span>` : ""}</button>`).join("");
    const tabs = this.shadowRoot.querySelector(".hk-ovtabs");
    if (tabs && this._tabsHtml !== html) { tabs.innerHTML = html || `<span class="hk-note">${this.esc(this.t("cardOvNone"))}</span>`; this._tabsHtml = html; }
  }
}

// The backup card: how old the newest backup is, whether a copy lies off the device and the last week as a strip. The
// verdict and the figures come from the sensor "backup protection" and its attributes, which the scan fills from the
// backup report; the limits are those of the backup protection in the panel. Red is only for a missing protection.
class HKBackupCard extends HKCard {
  static tag = "ha-housekeeper-backup-card";
  static pickerName = "HA Housekeeper: Backup";
  static pickerDescription = "How old the newest backup is, whether a copy lies off the device and the last week.";
  static get defaults() { return { history: "7", facts: true }; }

  static editorSchema(t) {
    return [
      { name: "history", selector: { select: { mode: "dropdown", options: ["7", "0"].map(value => ({ value, label: t(`edit_history_${value}`) })) } } },
      { name: "facts", selector: { boolean: {} } },
    ];
  }

  get titleKey() { return "cardBkTitle"; }
  watchedIds() { return [this.idOf("backup")].filter(Boolean); }
  data() { return this.stateOf("backup")?.attributes || {}; }
  verdict() { return this.stateOf("backup")?.state; }
  hasData() { return ["ok", "warn", "bad", "unclear"].includes(this.verdict()); }
  attention() { return ["warn", "bad"].includes(this.verdict()) ? 1 : 0; }
  // Quiet is: the backups are in order.
  isQuiet() { return this.verdict() === "ok"; }

  // "9 h" under two days, then days.
  age(hours) {
    return hours < 48 ? this.t("cardBkHours", { n: Math.round(hours), count: Math.round(hours) }) : this.t("cardBkDays", { n: Math.round(hours / 24), count: Math.round(hours / 24) });
  }

  size(bytes) {
    const big = bytes >= 1024 ** 3;
    try {
      return new Intl.NumberFormat(this.lang, { style: "unit", unit: big ? "gigabyte" : "megabyte", unitDisplay: "short", maximumFractionDigits: big ? 1 : 0 }).format(bytes / (big ? 1024 ** 3 : 1024 ** 2));
    } catch (_) { return `${Math.round(bytes / 1024 ** 2)} MB`; }
  }

  // The sentence under the title: what is wrong, in the order of weight; else when the last backup was made.
  reason(data) {
    if (data.age_hours == null) return this.t("cardBkNone");
    if (data.external_copy === false) return this.t("cardBkNoCopy");
    if (data.limit_hours != null && data.age_hours > data.limit_hours) return this.t("cardBkOld", { age: this.age(data.age_hours) });
    if (data.last_run_failed) return this.t("cardBkRunFailed");
    if (data.failed_days) return this.t("cardBkCopyFailed");
    if (data.size_unusual) return this.t("cardBkSizeOdd");
    return this.t("cardBkCheck");
  }

  fact(label, value, sub, tone = "") {
    return `<div class="hk-fact"><div class="l">${this.esc(label)}</div><div class="v ${tone}">${this.esc(value)}</div>${sub ? `<div class="s">${this.esc(sub)}</div>` : ""}</div>`;
  }

  facts(data) {
    if (!this._config.facts) return "";
    const cells = [];
    if (data.age_hours != null) {
      const old = data.limit_hours != null && data.age_hours > data.limit_hours;
      cells.push(this.fact(this.t("cardBkAge"), this.age(data.age_hours), data.limit_hours != null ? this.t("cardBkLimit", { age: this.age(data.limit_hours) }) : "", old ? "warnt" : "good"));
    }
    if (data.external_copy != null) {
      cells.push(this.fact(this.t("cardBkExternal"), this.t(data.external_copy ? "cardBkYes" : "cardBkNo"), data.external_count ? this.t("cardBkPlaces", { n: data.external_count, count: data.external_count }) : "", data.external_copy ? "good" : "badt"));
    }
    if (data.failed_days) cells.push(this.fact(this.t("cardBkFailed"), String(data.failed_days), this.t("cardBkInWeek"), "warnt"));
    else if (data.size != null) cells.push(this.fact(this.t("cardBkSize"), this.size(data.size), data.size_unusual == null ? "" : this.t(data.size_unusual ? "cardBkSizeUnusual" : "cardBkSizeUsual"), data.size_unusual ? "warnt" : ""));
    return cells.length ? `<div class="hk-facts n${cells.length}">${cells.join("")}</div>` : "";
  }

  // One cell a day, the oldest first: a backup, a backup that did not reach every target, no backup.
  strip(days) {
    if (this._config.history === "0" || !Array.isArray(days) || !days.length) return "";
    const cls = { ok: "", failed: "flapping", none: "none" };
    return `<div class="hk-stripbox"><div class="hk-strip">${days.map(day => `<i class="${cls[day] ?? "none"}"></i>`).join("")}</div><div class="hk-striplab"><span>${this.esc(this.t("cardBkDaysAgo", { n: days.length - 1, count: days.length - 1 }))}</span><span>${this.esc(this.t("cardBkToday"))}</span></div></div>`;
  }

  renderBody() {
    const data = this.data(), verdict = this.verdict(), ago = this.ago(data.newest_at);
    if (verdict === "unclear") {
      return this.head(this.t(data.outside ? "cardBkOutside" : "cardBkUnclear"), `<span class="hk-chip">${this.esc(this.t("cardBkUnclearChip"))}</span>`) + this.foot("", "view=maintenance&tab=backup");
    }
    const last = ago ? this.t("cardBkLast", { ago }) : this.t("cardBkNone");
    if (verdict === "ok") {
      return this.head(last, `<span class="hk-chip">${this.esc(this.t("cardBkOk"))}</span>`) + this.foot("", "view=maintenance&tab=backup");
    }
    const chip = `<span class="hk-chip ${verdict === "bad" ? "bad" : "warn"}">${this.esc(this.t(verdict === "bad" ? "cardBkBad" : "cardBkWarn"))}</span>`;
    const foot = data.external_copy === false ? this.t("cardBkNoCopyNote") : data.encrypted ? this.t("cardBkEncrypted") : "";
    return this.head(this.reason(data), chip, true) + this.facts(data) + this.strip(data.history) + this.foot(foot, "view=maintenance&tab=backup");
  }
}

// Every card is registered here: its element, its editor and its entry in the card picker.
// The picker shows English only, it has no way to translate a name.
function registerCard(CardClass) {
  const tag = CardClass.tag;
  if (!customElements.get(tag)) customElements.define(tag, CardClass);
  if (!customElements.get(CardClass.editorTag)) customElements.define(CardClass.editorTag, makeEditor(CardClass));
  const list = (globalThis.customCards ||= []);
  if (!list.some(card => card.type === tag)) {
    list.push({ type: tag, name: CardClass.pickerName, description: CardClass.pickerDescription, preview: true, documentationURL: "https://github.com/bertel2020/HA-Housekeeper" });
  }
}

registerCard(HKHealthCard);
registerCard(HKBatteryCard);
registerCard(HKFunctionsCard);
registerCard(HKAutoPauseCard);
registerCard(HKUpdateCard);
registerCard(HKVacationCard);
registerCard(HKStartCard);
registerCard(HKDatabaseCard);
registerCard(HKBackupCard);
registerCard(HKOverviewCard);
