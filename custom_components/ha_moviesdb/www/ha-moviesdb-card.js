/**
 * HA MoviesDB – Lovelace-Karte
 *
 * Reines Vanilla-Web-Component (keine Build-Schritte, kein lit-Import nötig),
 * damit die Karte einfach als statische Datei von der Integration ausgeliefert
 * werden kann. Kommuniziert ausschließlich über die WebSocket-Befehle des
 * "ha_moviesdb"-Custom-Components.
 */

// Der komplette Inhalt läuft in einer eigenen, isolierten Funktion (IIFE).
// Grund: const/class-Deklarationen auf oberster Ebene eines klassischen
// <script>-Tags teilen sich den globalen Gültigkeitsbereich der gesamten
// Seite. Würde diese Datei aus irgendeinem Grund zweimal geladen (z.B. durch
// eine noch nicht bereinigte alte Registrierung nach einem Update), würde
// die zweite Ausführung sonst mit einem fatalen "Identifier 'DOMAIN' has
// already been declared" abstürzen, bevor überhaupt eine interne Prüfung
// greifen könnte. Innerhalb der Funktion ist das kein Problem mehr, und die
// customElements.get()-Prüfung unten sorgt dafür, dass eine zweite
// Ausführung einfach folgenlos bleibt statt abzustürzen.
(function () {
  "use strict";

const DOMAIN = "ha_moviesdb";

// --- Mehrsprachigkeit -------------------------------------------------------
// Die Kartensprache folgt der Sprache des angemeldeten Home-Assistant-Benutzers
// (hass.locale.language). Deutsch und Englisch sind fest eingebaut. Für weitere
// Sprachen lädt die Karte optional www/translations/<sprache>.json (z.B.
// fr.json) - fehlt die Datei oder ein Schlüssel, wird Englisch verwendet.
const TRANSLATIONS = {
  de: {
    tab_watchlist: "Watchlist",
    tab_archive: "Archiv",
    tab_search: "Film hinzufügen",
    tab_nowplaying: "Im Kino",
    nowplaying_hint: "Aktuell im Kino in {region} · Datenquelle: themoviedb.org (kostenlose API)",
    nowplaying_hint_generic: "Aktuell im Kino · Datenquelle: themoviedb.org (kostenlose API)",
    loading_nowplaying: "Lade Kinofilme …",
    empty_nowplaying: "Aktuell wurden keine Kinofilme gefunden.",
    err_nowplaying: "Kinofilme konnten nicht geladen werden.",
    mode_nowplaying: "Derzeit",
    mode_upcoming: "Demnächst",
    upcoming_hint: "Demnächst im Kino in {region} · Datenquelle: themoviedb.org (kostenlose API)",
    upcoming_hint_generic: "Demnächst im Kino · Datenquelle: themoviedb.org (kostenlose API)",
    loading_upcoming: "Lade kommende Kinofilme …",
    empty_upcoming: "Aktuell wurden keine kommenden Kinofilme gefunden.",
    err_upcoming: "Kommende Kinofilme konnten nicht geladen werden.",
    trailer_link: "▶ Trailer auf YouTube ansehen",
    loading_trailer: "Suche Trailer …",
    no_overview: "Keine Beschreibung verfügbar.",
    empty_watchlist: "Noch keine Filme in der Watchlist. Wechsle oben zu „Film hinzufügen“ oder „Im Kino“, um loszulegen.",
    empty_archive: "Noch keine archivierten Filme. Markiere einen Film in der Detailansicht als gesehen, um ihn ins Archiv zu verschieben.",
    available: "Verfügbar: {list}",
    search_placeholder: "Filmtitel eingeben …",
    filter_placeholder: "Liste durchsuchen …",
    no_filter_results: "Keine Filme in dieser Liste gefunden.",
    data_source: "Datenquelle: themoviedb.org (kostenlose API)",
    searching: "Suche läuft …",
    no_results: "Keine Treffer.",
    added: "Hinzugefügt",
    add: "Hinzufügen",
    back: "‹ Zurück zur Übersicht",
    loading_movie: "Lade Film …",
    mark_unwatched: "Als ungesehen markieren",
    mark_watched: "Als gesehen markieren",
    unarchive: "Aus Archiv zurückholen",
    archive: "Ins Archiv verschieben",
    remove: "Aus Watchlist entfernen",
    available_on_title: "Verfügbar auf",
    loading_availability: "Lade Verfügbarkeit …",
    cat_flatrate: "Streaming (Abo)",
    cat_free: "Kostenlos",
    cat_ads: "Kostenlos mit Werbung",
    cat_rent: "Leihen",
    cat_buy: "Kaufen",
    no_availability_region: "Aktuell keine bekannte Streaming-Verfügbarkeit in {region}.",
    no_availability: "Aktuell keine bekannte Streaming-Verfügbarkeit.",
    hint_providers: "Tipp: Trage deine Streamingdienste unter Einstellungen → Geräte & Dienste → HA MoviesDB → Konfigurieren ein, damit sie hier hervorgehoben werden.",
    all_options_link: "Alle Optionen auf TMDB ansehen",
    attribution_suffix: " · Daten von JustWatch, bereitgestellt über TMDB.",
    attribution_only: "Verfügbarkeitsdaten von JustWatch, bereitgestellt über TMDB.",
    movie_fallback: "Film",
    added_toast: "„{title}“ wurde zur Watchlist hinzugefügt.",
    err_load_list: "Konnte Watchlist nicht laden. Ist die Integration eingerichtet?",
    err_search: "Suche fehlgeschlagen.",
    err_add: "Film konnte nicht hinzugefügt werden.",
    err_remove: "Film konnte nicht entfernt werden.",
    err_load_movie: "Film konnte nicht geladen werden.",
    err_watched: "Konnte Sehstatus nicht ändern.",
    err_archived: "Konnte Archivstatus nicht ändern.",
    err_not_configured: "Die Integration ist nicht eingerichtet.",
    err_not_found: "Der Film wird nicht verfolgt.",
    err_tmdb: "Fehler bei der Kommunikation mit themoviedb.org. Details stehen im Home-Assistant-Log.",
    editor_text: "Diese Karte hat keine Konfigurationsoptionen. Breite und Höhe lassen sich über den Reiter „Layout“ einstellen. Region und eigene Streamingdienste werden unter Einstellungen → Geräte & Dienste → HA MoviesDB → Konfigurieren eingestellt.",
    card_description: "Film-Watchlist mit themoviedb.org als Datenquelle – inkl. Streaming-Verfügbarkeit.",
  },
  en: {
    tab_watchlist: "Watchlist",
    tab_archive: "Archive",
    tab_search: "Add movie",
    tab_nowplaying: "In theaters",
    nowplaying_hint: "Currently in theaters in {region} · Data source: themoviedb.org (free API)",
    nowplaying_hint_generic: "Currently in theaters · Data source: themoviedb.org (free API)",
    loading_nowplaying: "Loading movies in theaters …",
    empty_nowplaying: "No movies in theaters found right now.",
    err_nowplaying: "Could not load the movies in theaters.",
    mode_nowplaying: "Now playing",
    mode_upcoming: "Coming soon",
    upcoming_hint: "Coming soon to theaters in {region} · Data source: themoviedb.org (free API)",
    upcoming_hint_generic: "Coming soon to theaters · Data source: themoviedb.org (free API)",
    loading_upcoming: "Loading upcoming movies …",
    empty_upcoming: "No upcoming movies found right now.",
    err_upcoming: "Could not load the upcoming movies.",
    trailer_link: "▶ Watch trailer on YouTube",
    loading_trailer: "Looking for a trailer …",
    no_overview: "No description available.",
    empty_watchlist: "No movies on your watchlist yet. Switch to “Add movie” or “In theaters” above to get started.",
    empty_archive: "No archived movies yet. Mark a movie as watched in its detail view to move it to the archive.",
    available: "Available: {list}",
    search_placeholder: "Enter movie title …",
    filter_placeholder: "Search this list …",
    no_filter_results: "No movies found in this list.",
    data_source: "Data source: themoviedb.org (free API)",
    searching: "Searching …",
    no_results: "No results.",
    added: "Added",
    add: "Add",
    back: "‹ Back to overview",
    loading_movie: "Loading movie …",
    mark_unwatched: "Mark as unwatched",
    mark_watched: "Mark as watched",
    unarchive: "Restore from archive",
    archive: "Move to archive",
    remove: "Remove from watchlist",
    available_on_title: "Available on",
    loading_availability: "Loading availability …",
    cat_flatrate: "Streaming (subscription)",
    cat_free: "Free",
    cat_ads: "Free with ads",
    cat_rent: "Rent",
    cat_buy: "Buy",
    no_availability_region: "No known streaming availability in {region} right now.",
    no_availability: "No known streaming availability right now.",
    hint_providers: "Tip: Enter your streaming services under Settings → Devices & Services → HA MoviesDB → Configure to have them highlighted here.",
    all_options_link: "See all options on TMDB",
    attribution_suffix: " · Data from JustWatch, provided via TMDB.",
    attribution_only: "Availability data from JustWatch, provided via TMDB.",
    movie_fallback: "Movie",
    added_toast: "“{title}” was added to the watchlist.",
    err_load_list: "Could not load the watchlist. Is the integration set up?",
    err_search: "Search failed.",
    err_add: "Could not add the movie.",
    err_remove: "Could not remove the movie.",
    err_load_movie: "Could not load the movie.",
    err_watched: "Could not change the watched status.",
    err_archived: "Could not change the archive status.",
    err_not_configured: "The integration is not set up.",
    err_not_found: "This movie is not on your watchlist.",
    err_tmdb: "Error communicating with themoviedb.org. See the Home Assistant log for details.",
    editor_text: "This card has no configuration options. Width and height can be set on the “Layout” tab. Region and your own streaming services are set under Settings → Devices & Services → HA MoviesDB → Configure.",
    card_description: "Movie watchlist using themoviedb.org as data source – including streaming availability.",
  },
};

const EXTRA_TABLES = {};

function detectLang(hass) {
  const raw =
    (hass && ((hass.locale && hass.locale.language) || hass.language)) ||
    (typeof navigator !== "undefined" ? navigator.language : "") ||
    "en";
  const lang = String(raw).toLowerCase().split(/[-_]/)[0];
  return /^[a-z]{2,3}$/.test(lang) ? lang : "en";
}

function loadExtraTable(lang, onLoaded) {
  if (TRANSLATIONS[lang] || lang in EXTRA_TABLES) return;
  EXTRA_TABLES[lang] = null;
  fetch(`/${DOMAIN}/translations/${lang}.json`)
    .then((r) => (r.ok ? r.json() : null))
    .then((table) => {
      if (table && typeof table === "object") {
        EXTRA_TABLES[lang] = table;
        onLoaded();
      }
    })
    .catch(() => {
      // Keine Übersetzungsdatei für diese Sprache - Englisch bleibt aktiv.
    });
}

function translate(lang, key, vars) {
  const table = TRANSLATIONS[lang] || EXTRA_TABLES[lang] || {};
  let text = table[key] !== undefined ? table[key] : TRANSLATIONS.en[key];
  if (text === undefined) return key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.split(`{${name}}`).join(String(value));
    }
  }
  return text;
}

// Hinweis: Es wird bewusst KEIN Google-Fonts-Import genutzt (das würde bei
// jedem Kartenaufruf die IP-Adresse an Google übertragen, was in
// Deutschland ohne Einwilligung als DSGVO-Verstoß gilt, vgl. LG München I,
// Urt. v. 20.01.2022 - 3 O 17493/20). Stattdessen kommen robuste
// System-Font-Stacks zum Einsatz, die auf jedem Gerät ohne Netzwerkzugriff
// vorhanden sind.
const HEADLINE_FONT =
  "'Arial Narrow', 'Roboto Condensed', 'Helvetica Neue', Arial, sans-serif";
const BODY_FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif";

const PROVIDER_CATEGORY_ORDER = ["flatrate", "free", "ads", "rent", "buy"];

const STYLES = `
  :host {
    --tmdb-bg: #12141c;
    --tmdb-surface: #1b1e29;
    --tmdb-surface-alt: #232738;
    --tmdb-border: #2a2f42;
    --tmdb-accent: #e8b34d;
    --tmdb-accent-soft: rgba(232, 179, 77, 0.16);
    --tmdb-watched: #4fb286;
    --tmdb-text: #eef0f5;
    --tmdb-text-muted: #8b93a7;
    display: flex;
    flex-direction: column;
    /* In einer Sections-Ansicht mit fester Zeilenzahl gibt die Rasterzelle
       eine echte Pixelhöhe vor - height:100% füllt sie dann komplett aus.
       Ohne eine solche Zelle (Masonry, "auto" Zeilen) hat der Elternknoten
       keine definierte Höhe, wodurch height:100% laut CSS-Spezifikation zu
       "auto" wird - die Karte wächst dann ganz normal mit ihrem Inhalt. */
    height: 100%;
    font-family: ${BODY_FONT};
    color: var(--tmdb-text);
  }

  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    background: var(--tmdb-bg);
    border-radius: 14px;
    overflow: hidden;
    border: 1px solid var(--tmdb-border);
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 20px 14px 20px;
    background: linear-gradient(180deg, var(--tmdb-surface) 0%, var(--tmdb-bg) 100%);
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .header-title img {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    flex-shrink: 0;
  }

  .header h1 {
    font-family: ${HEADLINE_FONT};
    font-weight: 700;
    font-size: 24px;
    letter-spacing: 0.2px;
    margin: 0;
  }

  .sprocket-rule {
    height: 10px;
    background-image: radial-gradient(circle, var(--tmdb-border) 2.5px, transparent 2.6px);
    background-size: 16px 10px;
    background-position: 8px center;
    opacity: 0.7;
  }

  .tabs {
    display: flex;
    gap: 4px;
    padding: 0 20px;
    background: var(--tmdb-surface);
    overflow-x: auto;
    scrollbar-width: none;
  }

  .tab {
    flex: none;
    white-space: nowrap;
    padding: 10px 4px;
    margin-right: 20px;
    font-size: 14px;
    font-weight: 600;
    color: var(--tmdb-text-muted);
    border-bottom: 2px solid transparent;
    cursor: pointer;
    user-select: none;
  }

  .tab.active {
    color: var(--tmdb-accent);
    border-bottom-color: var(--tmdb-accent);
  }

  .body {
    position: relative;
    flex: 1 1 auto;
    min-height: 120px;
    max-height: 520px;
    overflow-y: auto;
    padding: 16px 20px 20px 20px;
  }

  .search-row {
    display: flex;
    gap: 8px;
    margin-bottom: 14px;
  }

  input[type="text"] {
    flex: 1;
    background: var(--tmdb-surface-alt);
    border: 1px solid var(--tmdb-border);
    border-radius: 8px;
    color: var(--tmdb-text);
    padding: 10px 12px;
    font-size: 14px;
    font-family: inherit;
  }

  input[type="text"]:focus {
    outline: none;
    border-color: var(--tmdb-accent);
  }

  .hint {
    color: var(--tmdb-text-muted);
    font-size: 13px;
    padding: 4px 2px 10px 2px;
  }

  .hint a { color: var(--tmdb-text-muted); }

  .error {
    color: #e88b8b;
    font-size: 13px;
    padding: 8px 0;
  }

  .toast {
    position: absolute;
    left: 50%;
    top: 8px;
    transform: translateX(-50%) translateY(0);
    background: var(--tmdb-surface-alt);
    border: 1px solid var(--tmdb-watched);
    color: var(--tmdb-text);
    font-size: 13px;
    font-weight: 600;
    padding: 10px 18px;
    border-radius: 999px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
    opacity: 1;
    max-width: calc(100% - 32px);
    text-align: center;
    pointer-events: none;
    z-index: 20;
    transition: opacity 0.25s ease, transform 0.25s ease;
    animation: toast-in 0.2s ease;
  }
  .toast.toast-hide {
    opacity: 0;
    transform: translateX(-50%) translateY(-6px);
  }
  @keyframes toast-in {
    from { opacity: 0; transform: translateX(-50%) translateY(-6px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  .result-list { display: flex; flex-direction: column; gap: 8px; padding-right: 4px; }

  .result-row {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--tmdb-surface);
    border: 1px solid var(--tmdb-border);
    border-radius: 10px;
    padding: 8px 10px;
    cursor: pointer;
  }
  .result-row:hover { border-color: var(--tmdb-accent); }

  .poster {
    width: 42px;
    height: 60px;
    border-radius: 6px;
    object-fit: cover;
    background: var(--tmdb-surface-alt);
    flex-shrink: 0;
  }

  .result-info { flex: 1; min-width: 0; }
  .result-title { font-weight: 600; font-size: 14px; }
  .result-meta { color: var(--tmdb-text-muted); font-size: 12px; margin-top: 2px; }

  button.pill,
  a.pill {
    background: var(--tmdb-accent-soft);
    color: var(--tmdb-accent);
    border: 1px solid transparent;
    border-radius: 999px;
    padding: 6px 14px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    text-decoration: none;
  }
  button.pill:hover,
  a.pill:hover { border-color: var(--tmdb-accent); }
  .button-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
  .mode-switch { display: flex; gap: 8px; margin-bottom: 10px; }
  button.pill.active { background: var(--tmdb-accent); color: var(--tmdb-bg); }
  button.pill:disabled { opacity: 0.5; cursor: default; }
  button.pill.danger { background: transparent; color: var(--tmdb-text-muted); }
  button.pill.danger:hover { color: #e88b8b; border-color: #e88b8b; }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 14px;
    padding-right: 4px;
  }

  .movie-card {
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .movie-card .poster { width: 100%; height: 168px; border-radius: 8px; }

  .movie-card .title { font-size: 13px; font-weight: 600; line-height: 1.25; }

  .status-badge {
    display: inline-block;
    align-self: flex-start;
    font-size: 10.5px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 999px;
    white-space: nowrap;
    background: rgba(79, 178, 134, 0.18);
    color: var(--tmdb-watched);
  }

  .available-badge {
    font-size: 10.5px;
    color: var(--tmdb-accent);
  }

  .empty {
    color: var(--tmdb-text-muted);
    font-size: 14px;
    padding: 20px 4px;
    text-align: center;
  }

  /* Detailansicht */
  .detail-header { display: flex; gap: 14px; margin-bottom: 14px; }
  .detail-header .poster { width: 70px; height: 100px; }
  .detail-header .meta { flex: 1; min-width: 0; }
  .detail-header h2 {
    font-family: ${HEADLINE_FONT};
    font-size: 22px;
    font-weight: 700;
    margin: 0 0 4px 0;
  }
  .overview {
    font-size: 13.5px;
    color: var(--tmdb-text-muted);
    line-height: 1.4;
    margin-top: 8px;
  }
  .back-link {
    color: var(--tmdb-text-muted);
    font-size: 13px;
    cursor: pointer;
    margin-bottom: 10px;
    display: inline-block;
  }
  .back-link:hover { color: var(--tmdb-accent); }

  .section-title {
    font-family: ${HEADLINE_FONT};
    font-size: 16px;
    font-weight: 700;
    margin: 18px 0 8px 0;
  }

  .provider-group { margin-bottom: 12px; }
  .provider-group .label {
    font-size: 12px;
    font-weight: 600;
    color: var(--tmdb-text-muted);
    margin-bottom: 6px;
  }
  .provider-row { display: flex; flex-wrap: wrap; gap: 8px; }
  .provider-logo {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    object-fit: cover;
    background: var(--tmdb-surface-alt);
    opacity: 0.45;
    border: 2px solid transparent;
  }
  .provider-logo.mine {
    opacity: 1;
    border-color: var(--tmdb-accent);
  }

  .loading { color: var(--tmdb-text-muted); font-size: 14px; padding: 20px 4px; }

  .tmdb-attribution {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border-top: 1px solid var(--tmdb-border);
    background: var(--tmdb-surface);
  }
  .tmdb-attribution img {
    height: 14px;
    width: auto;
    opacity: 0.85;
    flex-shrink: 0;
  }
  .tmdb-attribution span {
    color: var(--tmdb-text-muted);
    font-size: 10.5px;
    line-height: 1.4;
  }
  .tmdb-attribution a { color: var(--tmdb-text-muted); }

  .provider-attribution {
    font-size: 10.5px;
    color: var(--tmdb-text-muted);
    margin-top: 4px;
  }
  .provider-attribution a { color: var(--tmdb-text-muted); }
`;

class HaMoviesDbCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._activeTab = "watchlist";
    this._tracked = [];
    this._searchQuery = "";
    this._searchResults = null;
    this._searching = false;
    this._listFilter = "";
    this._cinemaMode = "nowplaying";
    this._cinema = {
      nowplaying: { items: null, region: "", loading: false, loadedAt: 0 },
      upcoming: { items: null, region: "", loading: false, loadedAt: 0 },
    };
    this._preview = null;
    this._trailers = {};
    this._trailerLoading = new Set();
    this._listScroll = 0;
    this._scrollOverride = null;
    this._selectedMovieId = null;
    this._detail = null;
    this._settings = { region: "", providers: [] };
    this._error = null;
    this._successMessage = null;
    this._successTimeout = null;
    this._successFadeTimeout = null;
    this._initialized = false;
    this._searchDebounce = null;
  }

  setConfig(config) {
    this._config = config || {};
  }

  set hass(hass) {
    this._hass = hass;
    loadExtraTable(detectLang(hass), () => this._render());
    if (!this._initialized) {
      this._initialized = true;
      this._render();
      this._loadTracked();
      this._loadSettings();
    }
  }

  getCardSize() {
    return 8;
  }

  getGridOptions() {
    // Erlaubt in der "Sections"-Ansicht das Anpassen von Breite UND Höhe per
    // Ziehen am Rand im Dashboard-Editor. Standard: volle Breite (12 Spalten),
    // 8 Zeilen.
    return {
      columns: 12,
      rows: 8,
      min_columns: 6,
      max_columns: 12,
      min_rows: 4,
      max_rows: 16,
    };
  }

  static getStubConfig() {
    return {};
  }

  static getConfigElement() {
    // Diese Karte hat keine Konfigurationsoptionen, deshalb reicht ein
    // leerer/minimaler Editor. Entscheidend ist aber, DASS überhaupt einer
    // vorhanden ist: Ohne getConfigElement() zeigt Home Assistant im
    // Karten-Editor-Dialog gar keine Tab-Leiste an (weder "Sichtbarkeit"
    // noch "Layout"), sondern nur eine reine YAML-Ansicht.
    return document.createElement("ha-moviesdb-card-editor");
  }

  async _loadTracked() {
    try {
      const res = await this._hass.callWS({ type: `${DOMAIN}/list_tracked` });
      this._tracked = res.movies || [];
      this._error = null;
    } catch (err) {
      this._error = this._t("err_load_list");
    }
    this._render();
  }

  async _loadSettings() {
    try {
      const res = await this._hass.callWS({ type: `${DOMAIN}/get_settings` });
      this._settings = res || { region: "", providers: [] };
    } catch (err) {
      // Einstellungen sind nur für die Hervorhebung wichtig - ein Fehler
      // hier soll die Karte nicht blockieren.
    }
    this._render();
  }

  async _doSearch(query) {
    this._searching = true;
    this._render();
    try {
      const res = await this._hass.callWS({ type: `${DOMAIN}/search`, query });
      this._searchResults = res.results || [];
      this._error = null;
    } catch (err) {
      this._error = this._errText(err, "err_search");
      this._searchResults = [];
    }
    this._searching = false;
    this._render();
  }

  async _loadCinema(source, force = false) {
    // Die Kinolisten ändern sich höchstens täglich - nicht bei jedem Wechsel
    // neu laden (das Backend cached zusätzlich).
    const state = this._cinema[source];
    const fresh = Date.now() - state.loadedAt < 30 * 60 * 1000;
    if (state.loading || (!force && state.items !== null && fresh)) return;
    state.loading = true;
    this._render();
    try {
      const type = source === "upcoming" ? "upcoming" : "now_playing";
      const res = await this._hass.callWS({ type: `${DOMAIN}/${type}` });
      state.items = res.results || [];
      state.region = res.region || "";
      state.loadedAt = Date.now();
      this._error = null;
    } catch (err) {
      this._error = this._errText(err, `err_${source}`);
      state.items = state.items || [];
    }
    state.loading = false;
    this._render();
  }

  async _addMovie(movieId, source = "search") {
    this._error = null;
    try {
      const list = source === "search" ? this._searchResults : this._cinema[source].items;
      const item = list ? list.find((r) => r.movie_id === movieId) : null;
      await this._hass.callWS({ type: `${DOMAIN}/add_movie`, movie_id: movieId });
      await this._loadTracked();
      this._successMessage = this._t("added_toast", {
        title: item ? item.title : this._t("movie_fallback"),
      });
      this._render();
      clearTimeout(this._successTimeout);
      clearTimeout(this._successFadeTimeout);
      this._successFadeTimeout = setTimeout(() => {
        const toast = this.shadowRoot.querySelector(".toast");
        if (toast) toast.classList.add("toast-hide");
      }, 700);
      this._successTimeout = setTimeout(() => {
        this._successMessage = null;
        if (source === "search") {
          clearTimeout(this._searchDebounce);
          this._searchQuery = "";
          this._searchResults = null;
        }
        this._render();
      }, 1000);
    } catch (err) {
      this._error = this._errText(err, "err_add");
      this._render();
    }
  }

  async _removeMovie(movieId) {
    try {
      await this._hass.callWS({ type: `${DOMAIN}/remove_movie`, movie_id: movieId });
    } catch (err) {
      this._error = this._errText(err, "err_remove");
    }
    if (this._selectedMovieId === movieId) {
      this._selectedMovieId = null;
      this._detail = null;
    }
    await this._loadTracked();
  }

  async _openMovie(movieId) {
    this._selectedMovieId = movieId;
    this._detail = null;
    this._render();
    try {
      this._detail = await this._hass.callWS({ type: `${DOMAIN}/get_movie`, movie_id: movieId });
      this._error = null;
    } catch (err) {
      this._error = this._errText(err, "err_load_movie");
      this._render();
      return;
    }
    this._render();
    // Verfügbarkeit gezielt auffrischen statt bis zu 12h alte Daten aus dem
    // Cache anzuzeigen, und die Einstellungen erneut laden, falls sich Region
    // oder eigene Anbieter seit dem letzten Öffnen der Karte geändert haben.
    this._loadSettings();
    try {
      const providers = await this._hass.callWS({
        type: `${DOMAIN}/get_watch_providers`,
        movie_id: movieId,
      });
      if (this._selectedMovieId === movieId && this._detail) {
        this._detail.watch_providers = providers;
        this._render();
      }
    } catch (err) {
      // Watch-Provider-Refresh ist optional - der zuvor gecachte Stand aus
      // get_movie() bleibt sichtbar, falls er vorhanden ist.
    }
  }

  async _setWatched(movieId, watched) {
    this._error = null;
    if (this._detail && this._detail.movie_id === movieId) {
      this._detail.watched_at = watched ? new Date().toISOString() : null;
    }
    this._render();
    try {
      await this._hass.callWS({ type: `${DOMAIN}/set_watched`, movie_id: movieId, watched });
      if (watched) {
        // "Als gesehen markieren" verschiebt den Film per Definition auch
        // gleich ins Archiv (siehe README) - zwei bewusst getrennte
        // Backend-Aufrufe statt eines Kombi-Befehls, siehe Architekturplan.
        await this._setArchived(movieId, true, /* skipRender */ true);
      }
    } catch (err) {
      this._error = this._errText(err, "err_watched");
    }
    await this._loadTracked();
    this._render();
  }

  async _setArchived(movieId, archived, skipRender) {
    this._error = null;
    try {
      await this._hass.callWS({ type: `${DOMAIN}/set_archived`, movie_id: movieId, archived });
      if (this._detail && this._detail.movie_id === movieId) {
        this._detail.archived = archived;
      }
    } catch (err) {
      this._error = this._errText(err, "err_archived");
    }
    if (skipRender) return;
    await this._loadTracked();
    this._render();
  }

  _t(key, vars) {
    return translate(detectLang(this._hass), key, vars);
  }

  _errText(err, fallbackKey) {
    const code = err && err.code;
    if (code === "not_configured") return this._t("err_not_configured");
    if (code === "not_found") return this._t("err_not_found");
    if (code === "tmdb_error") return this._t("err_tmdb");
    return this._t(fallbackKey);
  }

  _fmtRuntime(minutes) {
    if (!minutes) return "";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h && m) return `${h}h ${m}min`;
    if (h) return `${h}h`;
    return `${m}min`;
  }

  _myProviderIds() {
    return new Set((this._settings.providers || []).map((p) => p.provider_id));
  }

  _render() {
    const root = this.shadowRoot;

    // Fokus + Cursorposition merken, damit ein Re-Render (z.B. während der
    // Live-Suche) nicht aus dem Eingabefeld herausspringt.
    const active = root.activeElement;
    let focusInfo = null;
    if (active && active.dataset && active.dataset.focusId) {
      focusInfo = {
        id: active.dataset.focusId,
        selectionStart: active.selectionStart,
        selectionEnd: active.selectionEnd,
      };
    }

    // Scroll-Position merken: .body wird unten komplett neu aufgebaut, ein
    // frisches Element startet sonst immer bei scrollTop 0.
    const oldBody = root.querySelector(".body");
    const savedScrollTop =
      this._scrollOverride !== null ? this._scrollOverride : oldBody ? oldBody.scrollTop : 0;
    this._scrollOverride = null;

    // Den neuen Kartenzustand komplett losgelöst vom Dokument aufbauen (kein
    // einziges Element hängt währenddessen im Shadow-DOM), damit am Ende nur
    // ein einziger, atomarer Austausch passiert (robuster gegenüber
    // Browser-Erweiterungen mit eigenem MutationObserver).
    const card = this._el("div", "card");
    card.appendChild(this._renderHeader());
    card.appendChild(this._el("div", "sprocket-rule"));

    const body = this._el("div", "body");
    if (this._error) {
      const err = this._el("div", "error");
      err.textContent = this._error;
      body.appendChild(err);
    }

    if (this._selectedMovieId) {
      body.appendChild(this._renderDetail());
    } else if (this._preview) {
      body.appendChild(this._renderPreview());
    } else if (this._activeTab === "watchlist") {
      body.appendChild(this._renderWatchlist());
    } else if (this._activeTab === "archive") {
      body.appendChild(this._renderArchive());
    } else if (this._activeTab === "nowplaying") {
      body.appendChild(this._renderCinema());
    } else {
      body.appendChild(this._renderSearch());
    }
    card.appendChild(body);
    card.appendChild(this._renderTmdbAttribution());

    if (this._successMessage) {
      const toast = this._el("div", "toast");
      toast.textContent = this._successMessage;
      body.appendChild(toast);
    }

    if (!this._styleEl) {
      this._styleEl = document.createElement("style");
      this._styleEl.textContent = STYLES;
      root.appendChild(this._styleEl);
    }
    const oldCard = root.querySelector(".card");
    if (oldCard) {
      oldCard.replaceWith(card);
    } else {
      root.appendChild(card);
    }

    body.scrollTop = savedScrollTop;

    if (focusInfo) {
      const toFocus = root.querySelector(`[data-focus-id="${focusInfo.id}"]`);
      if (toFocus) {
        toFocus.focus();
        try {
          toFocus.setSelectionRange(focusInfo.selectionStart, focusInfo.selectionEnd);
        } catch {
          // manche Input-Typen unterstützen setSelectionRange nicht - egal
        }
      }
    }
  }

  _renderHeader() {
    const wrap = this._el("div");
    const header = this._el("div", "header");
    const titleRow = this._el("div", "header-title");
    const icon = document.createElement("img");
    icon.src = `/${DOMAIN}/ha-moviesdb-icon.png`;
    icon.alt = "";
    titleRow.appendChild(icon);
    const h1 = this._el("h1");
    h1.textContent = "HA MoviesDB";
    titleRow.appendChild(h1);
    header.appendChild(titleRow);
    wrap.appendChild(header);

    if (!this._selectedMovieId && !this._preview) {
      const activeCount = this._tracked.filter((m) => !m.archived).length;
      const archivedCount = this._tracked.filter((m) => m.archived).length;

      const tabs = this._el("div", "tabs");
      const tabWatchlist = this._el(
        "div",
        "tab" + (this._activeTab === "watchlist" ? " active" : "")
      );
      tabWatchlist.textContent = `${this._t("tab_watchlist")}${activeCount ? " (" + activeCount + ")" : ""}`;
      tabWatchlist.addEventListener("click", () => {
        this._activeTab = "watchlist";
        this._render();
      });
      const tabArchive = this._el("div", "tab" + (this._activeTab === "archive" ? " active" : ""));
      tabArchive.textContent = `${this._t("tab_archive")}${archivedCount ? " (" + archivedCount + ")" : ""}`;
      tabArchive.addEventListener("click", () => {
        this._activeTab = "archive";
        this._render();
      });
      const tabNowPlaying = this._el(
        "div",
        "tab" + (this._activeTab === "nowplaying" ? " active" : "")
      );
      tabNowPlaying.textContent = this._t("tab_nowplaying");
      tabNowPlaying.addEventListener("click", () => {
        this._activeTab = "nowplaying";
        this._render();
        this._loadCinema(this._cinemaMode);
      });
      const tabSearch = this._el("div", "tab" + (this._activeTab === "search" ? " active" : ""));
      tabSearch.textContent = this._t("tab_search");
      tabSearch.addEventListener("click", () => {
        this._activeTab = "search";
        this._render();
      });
      tabs.appendChild(tabWatchlist);
      tabs.appendChild(tabArchive);
      tabs.appendChild(tabNowPlaying);
      tabs.appendChild(tabSearch);
      wrap.appendChild(tabs);
    }
    return wrap;
  }

  _renderWatchlist() {
    return this._renderMovieGrid(
      this._tracked.filter((m) => !m.archived),
      this._t("empty_watchlist")
    );
  }

  _renderArchive() {
    return this._renderMovieGrid(
      this._tracked.filter((m) => m.archived),
      this._t("empty_archive")
    );
  }

  _renderMovieGrid(list, emptyText) {
    const wrap = this._el("div");
    if (!list.length) {
      const empty = this._el("div", "empty");
      empty.textContent = emptyText;
      wrap.appendChild(empty);
      return wrap;
    }

    // Filter über Watchlist und Archiv hinweg geteilt (Titel, ohne Groß-/Kleinschreibung)
    const row = this._el("div", "search-row");
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = this._t("filter_placeholder");
    input.value = this._listFilter;
    input.dataset.focusId = "list-filter";
    input.addEventListener("input", (e) => {
      this._listFilter = e.target.value;
      this._render();
    });
    row.appendChild(input);
    wrap.appendChild(row);

    const needle = this._listFilter.trim().toLowerCase();
    if (needle) {
      list = list.filter((m) => (m.title || "").toLowerCase().includes(needle));
    }
    if (!list.length) {
      const empty = this._el("div", "empty");
      empty.textContent = this._t("no_filter_results");
      wrap.appendChild(empty);
      return wrap;
    }
    const grid = this._el("div", "grid");
    for (const m of list) {
      const cardEl = this._el("div", "movie-card");
      cardEl.addEventListener("click", () => this._openMovie(m.movie_id));

      const img = document.createElement("img");
      img.className = "poster";
      img.loading = "lazy";
      if (m.image) img.src = m.image;
      cardEl.appendChild(img);

      const title = this._el("div", "title");
      title.textContent = m.title || m.movie_id;
      cardEl.appendChild(title);

      if (m.release_year) {
        const badge = this._el("div", "status-badge");
        badge.textContent = m.release_year;
        cardEl.appendChild(badge);
      }

      if (m.available_on && m.available_on.length) {
        const avail = this._el("div", "available-badge");
        avail.textContent = this._t("available", { list: m.available_on.join(", ") });
        cardEl.appendChild(avail);
      }

      grid.appendChild(cardEl);
    }
    wrap.appendChild(grid);
    return wrap;
  }

  _renderSearch() {
    const wrap = this._el("div");
    const row = this._el("div", "search-row");
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = this._t("search_placeholder");
    input.value = this._searchQuery;
    input.dataset.focusId = "search-input";
    input.addEventListener("input", (e) => {
      this._searchQuery = e.target.value;
      clearTimeout(this._searchDebounce);
      const q = this._searchQuery.trim();
      this._searchDebounce = setTimeout(() => {
        if (q.length < 2) {
          this._searchResults = null;
          this._render();
        } else {
          this._doSearch(q);
        }
      }, 500);
    });
    row.appendChild(input);
    wrap.appendChild(row);

    const hint = this._el("div", "hint");
    hint.textContent = this._t("data_source");
    wrap.appendChild(hint);

    if (this._searching) {
      const loading = this._el("div", "loading");
      loading.textContent = this._t("searching");
      wrap.appendChild(loading);
      return wrap;
    }

    if (this._searchResults === null) {
      return wrap;
    }

    if (!this._searchResults.length) {
      const empty = this._el("div", "empty");
      empty.textContent = this._t("no_results");
      wrap.appendChild(empty);
      return wrap;
    }

    wrap.appendChild(this._renderResultList(this._searchResults, "search"));
    return wrap;
  }

  _renderCinema() {
    const wrap = this._el("div");
    const source = this._cinemaMode;
    const state = this._cinema[source];

    // Umschalter "Derzeit" / "Demnächst" (Standard: Derzeit)
    const modes = this._el("div", "mode-switch");
    for (const mode of ["nowplaying", "upcoming"]) {
      const btn = document.createElement("button");
      btn.className = "pill" + (mode === source ? " active" : "");
      btn.textContent = this._t(`mode_${mode}`);
      btn.addEventListener("click", () => {
        if (this._cinemaMode === mode) return;
        this._cinemaMode = mode;
        this._render();
        this._loadCinema(mode);
      });
      modes.appendChild(btn);
    }
    wrap.appendChild(modes);

    const hint = this._el("div", "hint");
    const region = state.region || this._settings.region;
    hint.textContent = region
      ? this._t(`${source === "upcoming" ? "upcoming" : "nowplaying"}_hint`, { region })
      : this._t(`${source === "upcoming" ? "upcoming" : "nowplaying"}_hint_generic`);
    wrap.appendChild(hint);

    if (state.loading && !(state.items && state.items.length)) {
      const loading = this._el("div", "loading");
      loading.textContent = this._t(`loading_${source}`);
      wrap.appendChild(loading);
      return wrap;
    }

    if (state.items === null) {
      return wrap;
    }

    if (!state.items.length) {
      const empty = this._el("div", "empty");
      empty.textContent = this._t(`empty_${source}`);
      wrap.appendChild(empty);
      return wrap;
    }

    wrap.appendChild(this._renderResultList(state.items, source));
    return wrap;
  }

  _fmtDate(iso) {
    if (!iso) return "";
    const date = new Date(`${iso}T00:00:00`);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleDateString(detectLang(this._hass), {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  _renderResultList(items, source) {
    // "Hinzugefügt" folgt immer dem aktuellen Stand der Watchlist, nicht dem
    // Zeitpunkt, an dem die (ggf. zwischengespeicherte) Liste geladen wurde.
    const trackedIds = new Set(this._tracked.map((m) => m.movie_id));
    const list = this._el("div", "result-list");
    for (const r of items) {
      const row2 = this._el("div", "result-row");
      row2.addEventListener("click", () => this._openPreview(r, source));
      const img = document.createElement("img");
      img.className = "poster";
      img.loading = "lazy";
      if (r.image) img.src = r.image;
      row2.appendChild(img);

      const info = this._el("div", "result-info");
      const t = this._el("div", "result-title");
      t.textContent = r.title;
      const m = this._el("div", "result-meta");
      m.textContent = this._resultMeta(r, source);
      info.appendChild(t);
      info.appendChild(m);
      row2.appendChild(info);

      row2.appendChild(this._renderAddButton(r, source, trackedIds.has(r.movie_id)));

      list.appendChild(row2);
    }
    return list;
  }

  _resultMeta(r, source) {
    return (source === "nowplaying" || source === "upcoming") && r.release_date
      ? this._fmtDate(r.release_date)
      : [r.release_year].filter(Boolean).join(" · ");
  }

  _renderAddButton(r, source, isTracked) {
    const btn = document.createElement("button");
    btn.className = "pill";
    if (isTracked) {
      btn.textContent = this._t("added");
      btn.disabled = true;
    } else {
      btn.textContent = this._t("add");
      btn.addEventListener("click", (e) => {
        // Der Klick gehört dem Button, nicht der Zeile (sonst öffnet sich die Vorschau).
        e.stopPropagation();
        this._addMovie(r.movie_id, source);
      });
    }
    return btn;
  }

  _openPreview(item, source) {
    const body = this.shadowRoot.querySelector(".body");
    this._listScroll = body ? body.scrollTop : 0;
    this._scrollOverride = 0;
    this._preview = { item, source };
    this._render();
    this._loadTrailer(item.movie_id);
  }

  _closePreview() {
    this._preview = null;
    this._scrollOverride = this._listScroll;
    this._render();
  }

  async _loadTrailer(movieId) {
    if (movieId in this._trailers || this._trailerLoading.has(movieId)) return;
    this._trailerLoading.add(movieId);
    this._render();
    try {
      const res = await this._hass.callWS({ type: `${DOMAIN}/get_trailer`, movie_id: movieId });
      this._trailers[movieId] = res.trailer || null;
    } catch (err) {
      // Der Trailer ist eine Zusatzinfo: bei einem Fehler wird einfach kein
      // Link gezeigt (und beim nächsten Öffnen erneut versucht).
    }
    this._trailerLoading.delete(movieId);
    this._render();
  }

  _renderPreview() {
    const { item, source } = this._preview;
    const wrap = this._el("div");
    const back = this._el("div", "back-link");
    back.textContent = this._t("back");
    back.addEventListener("click", () => this._closePreview());
    wrap.appendChild(back);

    const header = this._el("div", "detail-header");
    const img = document.createElement("img");
    img.className = "poster";
    if (item.image) img.src = item.image;
    header.appendChild(img);

    const meta = this._el("div", "meta");
    const h2 = this._el("h2");
    h2.textContent = item.title;
    meta.appendChild(h2);
    const metaLine = this._el("div", "result-meta");
    metaLine.textContent = this._resultMeta(item, source);
    meta.appendChild(metaLine);

    const btnRow = this._el("div", "button-row");
    const isTracked = this._tracked.some((m) => m.movie_id === item.movie_id);
    btnRow.appendChild(this._renderAddButton(item, source, isTracked));

    const trailer = this._trailers[item.movie_id];
    if (trailer) {
      const link = document.createElement("a");
      link.className = "pill";
      link.href = trailer.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = this._t("trailer_link");
      btnRow.appendChild(link);
    }
    meta.appendChild(btnRow);

    if (this._trailerLoading.has(item.movie_id)) {
      const loading = this._el("div", "result-meta");
      loading.textContent = this._t("loading_trailer");
      meta.appendChild(loading);
    }

    const overview = this._el("div", "overview");
    overview.textContent = item.overview || this._t("no_overview");
    meta.appendChild(overview);

    header.appendChild(meta);
    wrap.appendChild(header);
    return wrap;
  }

  _renderDetail() {
    const wrap = this._el("div");
    const back = this._el("div", "back-link");
    back.textContent = this._t("back");
    back.addEventListener("click", () => {
      this._selectedMovieId = null;
      this._detail = null;
      this._render();
    });
    wrap.appendChild(back);

    if (!this._detail) {
      const loading = this._el("div", "loading");
      loading.textContent = this._t("loading_movie");
      wrap.appendChild(loading);
      return wrap;
    }

    const d = this._detail;
    const header = this._el("div", "detail-header");
    const img = document.createElement("img");
    img.className = "poster";
    if (d.image) img.src = d.image;
    header.appendChild(img);

    const meta = this._el("div", "meta");
    const h2 = this._el("h2");
    h2.textContent = d.title;
    meta.appendChild(h2);
    const metaLine = this._el("div", "result-meta");
    metaLine.textContent = [d.release_year, this._fmtRuntime(d.runtime)]
      .filter(Boolean)
      .join(" · ");
    meta.appendChild(metaLine);

    const btnRow = this._el("div");
    btnRow.style.display = "flex";
    btnRow.style.flexWrap = "wrap";
    btnRow.style.gap = "8px";
    btnRow.style.marginTop = "8px";

    const watchedBtn = document.createElement("button");
    watchedBtn.className = "pill";
    watchedBtn.textContent = d.watched_at ? this._t("mark_unwatched") : this._t("mark_watched");
    watchedBtn.addEventListener("click", () => this._setWatched(d.movie_id, !d.watched_at));
    btnRow.appendChild(watchedBtn);

    const archiveBtn = document.createElement("button");
    archiveBtn.className = "pill";
    archiveBtn.textContent = d.archived ? this._t("unarchive") : this._t("archive");
    archiveBtn.addEventListener("click", () => this._setArchived(d.movie_id, !d.archived));
    btnRow.appendChild(archiveBtn);

    const removeBtn = document.createElement("button");
    removeBtn.className = "pill danger";
    removeBtn.textContent = this._t("remove");
    removeBtn.addEventListener("click", () => this._removeMovie(d.movie_id));
    btnRow.appendChild(removeBtn);

    meta.appendChild(btnRow);

    if (d.overview) {
      const overview = this._el("div", "overview");
      overview.textContent = d.overview;
      meta.appendChild(overview);
    }

    header.appendChild(meta);
    wrap.appendChild(header);

    wrap.appendChild(this._renderWatchProviders(d.watch_providers));

    const backBottom = this._el("div", "back-link");
    backBottom.style.marginTop = "16px";
    backBottom.textContent = this._t("back");
    backBottom.addEventListener("click", () => {
      this._selectedMovieId = null;
      this._detail = null;
      this._render();
    });
    wrap.appendChild(backBottom);

    return wrap;
  }

  _renderWatchProviders(providers) {
    const wrap = this._el("div");
    const title = this._el("div", "section-title");
    title.textContent = this._t("available_on_title");
    wrap.appendChild(title);

    if (!providers) {
      const loading = this._el("div", "loading");
      loading.textContent = this._t("loading_availability");
      wrap.appendChild(loading);
      return wrap;
    }

    const myIds = this._myProviderIds();
    let hasAny = false;
    for (const category of PROVIDER_CATEGORY_ORDER) {
      const list = providers[category] || [];
      if (!list.length) continue;
      hasAny = true;

      const group = this._el("div", "provider-group");
      const label = this._el("div", "label");
      label.textContent = this._t("cat_" + category);
      group.appendChild(label);

      const row = this._el("div", "provider-row");
      for (const p of list) {
        const logo = document.createElement("img");
        logo.className = "provider-logo" + (myIds.has(p.provider_id) ? " mine" : "");
        logo.title = p.provider_name;
        logo.alt = p.provider_name;
        if (p.logo_path) logo.src = p.logo_path;
        row.appendChild(logo);
      }
      group.appendChild(row);
      wrap.appendChild(group);
    }

    if (!hasAny) {
      const empty = this._el("div", "empty");
      empty.textContent = this._settings.region
        ? this._t("no_availability_region", { region: this._settings.region })
        : this._t("no_availability");
      wrap.appendChild(empty);
    }

    if (myIds.size === 0) {
      const hint = this._el("div", "hint");
      hint.textContent = this._t("hint_providers");
      wrap.appendChild(hint);
    }

    // Pflicht-Attribution laut TMDB Watch-Provider-API-Nutzungsbedingungen
    // (https://developer.themoviedb.org/docs/watch-providers-attribution-requirement):
    // Die Verfügbarkeitsdaten stammen von JustWatch und werden über TMDB
    // durchgereicht - Wortlaut vor Release gegen die aktuellen Bedingungen
    // prüfen (siehe README, analog zum allgemeinen TMDB-Hinweis unten).
    const attribution = this._el("div", "provider-attribution");
    if (providers.link) {
      const link = document.createElement("a");
      link.href = providers.link;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = this._t("all_options_link");
      attribution.appendChild(link);
      attribution.append(this._t("attribution_suffix"));
    } else {
      attribution.textContent = this._t("attribution_only");
    }
    wrap.appendChild(attribution);

    return wrap;
  }

  _renderTmdbAttribution() {
    // Pflichthinweis laut TMDB API-Nutzungsbedingungen
    // (https://www.themoviedb.org/api-terms-of-use): Text + Logo, weniger
    // prominent als das eigene App-Logo im Header.
    const wrap = this._el("div", "tmdb-attribution");
    const logo = document.createElement("img");
    // /local/ = <config>/www/ liegt außerhalb von custom_components und
    // übersteht HACS-Updates; der alte Ablageort bleibt als Fallback.
    const sources = [
      `/local/${DOMAIN}/tmdb-logo.svg`,
      `/local/${DOMAIN}/tmdb-logo.png`,
      `/${DOMAIN}/tmdb-logo.svg`,
    ];
    let sourceIndex = 0;
    logo.alt = "TMDB";
    logo.addEventListener("error", () => {
      sourceIndex += 1;
      if (sourceIndex < sources.length) {
        logo.src = sources[sourceIndex];
      } else {
        logo.style.display = "none";
      }
    });
    logo.src = sources[0];
    wrap.appendChild(logo);

    const text = document.createElement("span");
    const link = document.createElement("a");
    link.href = "https://www.themoviedb.org/";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "TMDB";
    text.append(
      "This product uses the TMDB API but is not endorsed or certified by ",
      link,
      "."
    );
    wrap.appendChild(text);
    return wrap;
  }

  _el(tag, className) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    return e;
  }
}

// Minimaler Konfigurations-Editor: Diese Karte hat keine einstellbaren
// Optionen (nur `type: custom:ha-moviesdb-card`), daher genügt ein kurzer
// Hinweistext. Wichtig ist vor allem, DASS die Klasse existiert - siehe
// Kommentar bei getConfigElement() oben.
class HaMoviesDbCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config || {};
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    loadExtraTable(detectLang(hass), () => this._updateText());
    this._updateText();
  }

  _updateText() {
    const p = this.shadowRoot && this.shadowRoot.querySelector("p");
    if (p) p.textContent = translate(detectLang(this._hass), "editor_text");
  }

  _render() {
    if (this.shadowRoot) {
      this._updateText();
      return;
    }
    const root = this.attachShadow({ mode: "open" });
    root.innerHTML = `
      <style>
        p {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
          font-size: 14px;
          color: var(--secondary-text-color, #6b7280);
          padding: 16px 4px;
          margin: 0;
        }
      </style>
      <p></p>
    `;
    this._updateText();
  }
}
if (!customElements.get("ha-moviesdb-card-editor")) {
  customElements.define("ha-moviesdb-card-editor", HaMoviesDbCardEditor);
}

// Absicherung: Falls das Skript aus irgendeinem Grund mehrfach im selben
// Browser-Tab landet (z.B. Reste aus einer älteren, noch nicht bereinigten
// Registrierung nach einem Update ohne kompletten HA-Neustart), würde ein
// zweiter customElements.define()-Aufruf für denselben Namen einen fatalen,
// nicht abfangbaren Fehler auslösen. Deshalb hier defensiv prüfen.
if (!customElements.get("ha-moviesdb-card")) {
  customElements.define("ha-moviesdb-card", HaMoviesDbCard);
}

window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === "ha-moviesdb-card")) {
  window.customCards.push({
    type: "ha-moviesdb-card",
    name: "HA MoviesDB",
    description: translate(detectLang(null), "card_description"),
    preview: false,
  });
}
})();
