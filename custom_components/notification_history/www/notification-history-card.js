// Notification History card: the notifications recorded by the notification_history
// integration, with their image, link and buttons. Data comes from the integration's
// WebSocket commands (notification_history/list and /subscribe), not from an entity.

const CARD_VERSION = "0.1.1";

const I18N = {
  en: {
    empty: "No notifications.",
    not_loaded: "The Notification History integration is not set up.",
    more: "Show more",
    open: "Open",
    clip: "Watch clip",
    play: "Play",
    run_confirm: (t) => `Run “${t}”?`,
    run_ok: (t) => `“${t}” sent`,
    run_ko: (e) => `Failed: ${e}`,
    now: "just now",
    min: (n) => `${n} min ago`,
    hour: (n) => `${n} h ago`,
    day: (n) => `${n} d ago`,
    status: { replaced: "Replaced", removed: "Removed by HA", cleared: "Dismissed", action: (t) => `Button: ${t}` },
    f_title: "Title",
    f_limit: "Notifications shown before “Show more”",
    f_targets: "Targets (empty: all)",
    f_show_target: "Show the target name",
    f_frigate: "“Watch clip” button for Frigate snapshots",
  },
  fr: {
    empty: "Aucune notification.",
    not_loaded: "L'intégration Notification History n'est pas configurée.",
    more: "Voir plus",
    open: "Ouvrir",
    clip: "Voir le clip",
    play: "Écouter",
    run_confirm: (t) => `Lancer « ${t} » ?`,
    run_ok: (t) => `« ${t} » envoyé`,
    run_ko: (e) => `Échec : ${e}`,
    now: "à l'instant",
    min: (n) => `il y a ${n} min`,
    hour: (n) => `il y a ${n} h`,
    day: (n) => `il y a ${n} j`,
    status: { replaced: "Remplacée", removed: "Retirée par HA", cleared: "Effacée", action: (t) => `Bouton : ${t}` },
    f_title: "Titre",
    f_limit: "Notifications affichées avant « Voir plus »",
    f_targets: "Cibles (vide : toutes)",
    f_show_target: "Afficher le nom de la cible",
    f_frigate: "Bouton « Voir le clip » pour les images Frigate",
  },
};

const FRIGATE_RE = /\/api\/frigate\/(?:[^/]+\/)?notifications\/([^/]+)\/(?:thumbnail|snapshot)\.(?:jpg|png|webp)/;

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

class NotificationHistoryCard extends HTMLElement {
  static getConfigForm() {
    // Labels follow the language of the user editing the card.
    const t = (k) => (I18N[(document.querySelector("home-assistant")?.hass?.locale?.language || "en").slice(0, 2)] || I18N.en)[k];
    return {
      schema: [
        { name: "title", selector: { text: {} } },
        { name: "limit", selector: { number: { min: 1, max: 200, mode: "box" } } },
        { name: "targets", selector: { text: { multiple: true } } },
        { name: "show_target", selector: { boolean: {} } },
        { name: "frigate", selector: { boolean: {} } },
      ],
      computeLabel: (s) => t(`f_${s.name}`),
    };
  }

  static getStubConfig() {
    return { limit: 15 };
  }

  setConfig(config) {
    this._config = { limit: 15, show_target: true, frigate: true, ...config };
    this._items = null;
    this._more = false;
    this._error = null;
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    if (this._hass) this._resubscribe();
  }

  set hass(hass) {
    const first = !this._hass;
    this._hass = hass;
    if (first || hass.connection !== this._conn) this._resubscribe();
  }

  connectedCallback() {
    if (this._hass && !this._unsub) this._resubscribe();
    // Refresh relative dates once a minute.
    this._timer = setInterval(() => this._items && this._render(), 60000);
  }

  disconnectedCallback() {
    clearInterval(this._timer);
    this._unsubscribe();
  }

  getCardSize() {
    return 6;
  }

  get _t() {
    return I18N[(this._hass?.locale?.language || "en").slice(0, 2)] || I18N.en;
  }

  _filters() {
    const f = {};
    if (Array.isArray(this._config.targets) && this._config.targets.length) f.targets = this._config.targets;
    if (Array.isArray(this._config.devices) && this._config.devices.length) f.devices = this._config.devices;
    return f;
  }

  _unsubscribe() {
    if (this._unsub) {
      this._unsub.then((u) => u()).catch(() => {});
      this._unsub = null;
    }
  }

  _resubscribe() {
    if (!this._config || !this._hass) return;
    this._unsubscribe();
    this._conn = this._hass.connection;
    this._load();
    this._unsub = this._hass.connection.subscribeMessage((ev) => this._onEvent(ev), {
      type: "notification_history/subscribe",
      ...this._filters(),
    });
    this._unsub.catch((e) => {
      this._error = e;
      this._render();
    });
  }

  async _load(beforeId) {
    try {
      const res = await this._hass.callWS({
        type: "notification_history/list",
        limit: beforeId ? 50 : this._config.limit,
        ...(beforeId ? { before_id: beforeId } : {}),
        ...this._filters(),
      });
      this._error = null;
      this._items = beforeId ? [...(this._items || []), ...res.notifications] : res.notifications;
      this._more = res.more;
    } catch (e) {
      this._error = e;
    }
    this._render();
  }

  _onEvent(ev) {
    if (ev.reload) return this._load();
    const r = ev.record;
    if (!r || !this._items) return;
    const i = this._items.findIndex((x) => x.id === r.id);
    if (i >= 0) this._items[i] = r;
    else this._items = [r, ...this._items];
    this._render();
  }

  // URLs come from notify service calls, which any user or automation can make:
  // only http(s) is kept (null otherwise, so no javascript: or data: links).
  // Absolute URLs pointing at this Home Assistant become a same-origin path
  // starting with a single "/", so they work both at home and away with the
  // current session.
  _local(u) {
    if (!u || typeof u !== "string") return null;
    let url;
    try {
      url = new URL(u, window.location.origin);
    } catch (e) {
      return null;
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    const own = [window.location.origin, this._hass?.config?.external_url, this._hass?.config?.internal_url]
      .filter(Boolean)
      .map((o) => {
        try {
          return new URL(o).origin;
        } catch (e) {
          return null;
        }
      });
    if (!own.includes(url.origin)) return url.href;
    return url.pathname.replace(/^\/+/, "/") + url.search + url.hash;
  }

  _icon(n) {
    if (n.video || (this._config.frigate && FRIGATE_RE.test(n.image || ""))) return "mdi:cctv";
    if (n.image) return "mdi:image-outline";
    if (n.audio) return "mdi:volume-high";
    if ((n.target || "").includes("mobile_app") || n.device_id) return "mdi:cellphone-message";
    return "mdi:bell-outline";
  }

  _when(ts) {
    const t = this._t;
    const d = new Date(ts * 1000);
    const s = Math.max(0, (Date.now() - d.getTime()) / 1000);
    const rel = s < 60 ? t.now : s < 3600 ? t.min(Math.floor(s / 60)) : s < 86400 ? t.hour(Math.floor(s / 3600)) : t.day(Math.floor(s / 86400));
    const abs = d.toLocaleString(this._hass?.locale?.language || undefined, {
      weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
    });
    return `${rel} · ${abs}`;
  }

  _buttons(n) {
    const t = this._t;
    const out = [];
    const seen = new Set();
    const add = (b) => {
      // A link whose URL was rejected by _local() gets no button.
      if ("url" in b && !b.url) return;
      const key = b.url || `action:${b.action}`;
      if (!seen.has(key)) {
        seen.add(key);
        out.push(b);
      }
    };
    if (n.link) add({ url: this._local(n.link), label: /\.(mp4|webm|mov)(\?|$)/.test(n.link) ? t.clip : t.open, icon: "mdi:open-in-app" });
    if (n.video) add({ url: this._local(n.video), label: t.clip, icon: "mdi:play-circle-outline" });
    if (n.audio) add({ url: this._local(n.audio), label: t.play, icon: "mdi:play" });
    if (this._config.frigate && FRIGATE_RE.test(n.image || "") && this._local(n.image)) {
      add({ url: this._local(n.image).replace(/(thumbnail|snapshot)\.(jpg|png|webp).*$/, "clip.mp4"), label: t.clip, icon: "mdi:play-circle-outline" });
    }
    for (const a of n.actions || []) {
      if (a.action === "REPLY") continue;
      if (a.action === "URI" && a.uri) add({ url: this._local(a.uri), label: a.title, icon: "mdi:open-in-new" });
      else if (a.action !== "URI") add({ action: a.action, label: a.title, icon: "mdi:gesture-tap-button", record: n.id });
    }
    return out;
  }

  _status(n) {
    const s = this._t.status;
    if (n.status === "action") return s.action(n.action_title || "");
    return s[n.status] || "";
  }

  _render() {
    if (!this.shadowRoot || !this._config) return;
    const t = this._t;
    this._btns = [];
    let body;
    if (this._error) {
      body = `<div class="empty">${esc(this._error.code === "not_loaded" || this._error.code === "unknown_command" ? t.not_loaded : this._error.message || this._error)}</div>`;
    } else if (!this._items) {
      body = "";
    } else if (!this._items.length) {
      body = `<div class="empty">${t.empty}</div>`;
    } else {
      body = this._items
        .map((n) => {
          const btns = this._buttons(n)
            .map((b) => {
              this._btns.push(b);
              return `<button class="btn" data-b="${this._btns.length - 1}"><ha-icon icon="${b.icon}"></ha-icon>${esc(b.label)}</button>`;
            })
            .join("");
          const status = this._status(n);
          const head = n.title || n.message || "";
          const img = this._local(n.image);
          return `<div class="item${n.status === "replaced" || n.status === "removed" ? " dim" : ""}">
            <div class="head">
              <ha-icon icon="${this._icon(n)}"></ha-icon>
              <div class="txt">
                <div class="title">${esc(head)}</div>
                <div class="meta">${esc(this._when(n.ts))}${this._config.show_target ? ` · ${esc(n.target_name || n.target)}` : ""}</div>
              </div>
              ${status ? `<span class="status">${esc(status)}</span>` : ""}
            </div>
            ${n.title && n.message ? `<div class="msg">${esc(n.message).replace(/\n/g, "<br>")}</div>` : ""}
            ${img ? `<img class="img" loading="lazy" src="${esc(img)}" alt="">` : ""}
            ${btns ? `<div class="btns">${btns}</div>` : ""}
          </div>`;
        })
        .join("");
      if (this._more) body += `<button class="btn more" data-more>${t.more}</button>`;
    }

    this.shadowRoot.innerHTML = `<style>
        ha-card { padding: 12px; }
        .title-card { font-size: 20px; font-weight: 500; padding: 4px 4px 12px; color: var(--primary-text-color); }
        .list { display: flex; flex-direction: column; gap: 8px; }
        .item { padding: 12px 14px; border-radius: 12px; border: 1px solid var(--divider-color);
                display: flex; flex-direction: column; gap: 8px; }
        .item.dim { opacity: 0.6; }
        .head { display: flex; align-items: center; gap: 12px; }
        .head ha-icon { --mdc-icon-size: 22px; color: var(--state-icon-color, var(--primary-color)); flex: none; }
        .txt { flex: 1; min-width: 0; }
        .title { font-size: 15px; font-weight: 600; color: var(--primary-text-color); overflow-wrap: anywhere; }
        .meta { font-size: 12px; color: var(--secondary-text-color); margin-top: 2px; }
        .status { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 999px; flex: none;
                  color: var(--secondary-text-color); border: 1px solid var(--divider-color); }
        .msg { font-size: 14px; color: var(--primary-text-color); line-height: 1.4; overflow-wrap: anywhere; }
        .img { width: 100%; max-height: 220px; object-fit: cover; border-radius: 10px; cursor: zoom-in;
               background: var(--secondary-background-color); }
        .img.ko { display: none; }
        .btns { display: flex; flex-wrap: wrap; gap: 8px; }
        .btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 999px;
               border: 1px solid var(--divider-color); background: var(--secondary-background-color);
               color: var(--primary-text-color); font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }
        .btn ha-icon { --mdc-icon-size: 18px; color: var(--primary-color); }
        .more { align-self: center; }
        .empty { padding: 16px; text-align: center; color: var(--secondary-text-color); }
        .overlay { position: fixed; inset: 0; z-index: 9999; background: rgba(0, 0, 0, 0.88); display: flex;
                   align-items: center; justify-content: center; padding: 16px; }
        .overlay img, .overlay video { max-width: 100%; max-height: 100%; border-radius: 10px; }
      </style>
      <ha-card>
        ${this._config.title ? `<div class="title-card">${esc(this._config.title)}</div>` : ""}
        <div class="list">${body}</div>
      </ha-card>`;

    const root = this.shadowRoot;
    root.querySelectorAll("img.img").forEach((im) => {
      // Image gone (e.g. purged camera event): hide it rather than show a broken icon.
      im.addEventListener("error", () => im.classList.add("ko"));
      im.addEventListener("click", () => this._overlay(`<img src="${esc(im.getAttribute("src"))}" alt="">`));
    });
    root.querySelectorAll("button[data-b]").forEach((el) => el.addEventListener("click", () => this._run(this._btns[Number(el.dataset.b)])));
    const more = root.querySelector("[data-more]");
    if (more) more.addEventListener("click", () => this._load(this._items[this._items.length - 1].id));
  }

  _overlay(html) {
    const o = document.createElement("div");
    o.className = "overlay";
    o.innerHTML = html;
    o.addEventListener("click", (e) => {
      if (e.target === o || e.target.tagName === "IMG") o.remove();
    });
    this.shadowRoot.appendChild(o);
  }

  _toast(message) {
    this.dispatchEvent(new CustomEvent("hass-notification", { detail: { message }, bubbles: true, composed: true }));
  }

  async _run(b) {
    if (!b) return;
    const t = this._t;
    if (b.url) {
      if (/\.(mp4|webm|mov)(\?|$)/.test(b.url)) this._overlay(`<video src="${esc(b.url)}" controls autoplay playsinline></video>`);
      else if (/\.(mp3|m4a|wav|aac)(\?|$)/.test(b.url)) this._overlay(`<audio src="${esc(b.url)}" controls autoplay></audio>`);
      else if (b.url.startsWith("/") && !b.url.startsWith("//")) {
        window.history.pushState(null, "", b.url);
        window.dispatchEvent(new CustomEvent("location-changed"));
      } else window.open(b.url, "_blank", "noopener");
      return;
    }
    if (!window.confirm(t.run_confirm(b.label))) return;
    try {
      await this._hass.callWS({ type: "notification_history/run_action", record_id: b.record, action: b.action });
      this._toast(t.run_ok(b.label));
    } catch (e) {
      this._toast(t.run_ko(e.message || e));
    }
  }
}

customElements.define("notification-history-card", NotificationHistoryCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "notification-history-card",
  name: "Notification History",
  description: "Notifications sent by Home Assistant, with image, link and buttons.",
  documentationURL: "https://github.com/Patafoin/ha-notification-history",
});
console.info(`%c NOTIFICATION-HISTORY-CARD %c ${CARD_VERSION} `, "background:#03a9f4;color:#fff", "");
