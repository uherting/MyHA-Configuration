const VERSION = "1.0.2";
const CARD_TYPE = "advanced-area-card";
const DEFAULT_CARD_TYPE = `custom:${CARD_TYPE}`;
const ACTION_HOLD_DELAY = 500;
const REGISTRY_RETRY_MS = 10000;
const EDITOR_PREVIEW_THROTTLE_MS = 500;
const RESET_CONFIRM_MS = 4000;

// Default visual sizes – change these to tweak the card appearance globally.
const DEFAULT_TITLE_SIZE = "1.28571429rem";
const DEFAULT_ICON_SIZE = "30px";
const DEFAULT_CHIPS_MARGIN = "10px";

const DEFAULT_THRESHOLDS = {
  temperature: [
    // Lowest threshold is the "below 0" bucket; set to -50 so any real-world
    // sub-zero reading still falls inside this range.
    { value: -20, color: "#0CA1FF", icon: "" },
    { value: -10, color: "#70D1FF", icon: "" },
    { value: 0, color: "#B1E6FF", icon: "" },
    { value: 5, color: "#DAF3FF", icon: "" },
    { value: 10, color: "#FFE599", icon: "" },
    { value: 15, color: "#FFC000", icon: "" },
    { value: 20, color: "#FF9900", icon: "" },
    { value: 30, color: "#FF0000", icon: "" },
  ],
  humidity: [
    { value: 0, color: "#C2410C", icon: "" },
    { value: 20, color: "#F59E0B", icon: "" },
    { value: 30, color: "#A3E635", icon: "" },
    { value: 40, color: "#22C55E", icon: "" },
    { value: 55, color: "#14B8A6", icon: "" },
    { value: 65, color: "#06B6D4", icon: "" },
    { value: 75, color: "#3B82F6", icon: "" },
    { value: 85, color: "#1D4ED8", icon: "" },
  ],
  lux: [
    { value: 0, color: "#312E81", icon: "" },
    { value: 10, color: "#4F46E5", icon: "" },
    { value: 50, color: "#3B82F6", icon: "" },
    { value: 150, color: "#06B6D4", icon: "" },
    { value: 300, color: "#22C55E", icon: "" },
    { value: 500, color: "#84CC16", icon: "" },
    { value: 1000, color: "#EAB308", icon: "" },
    { value: 5000, color: "#F97316", icon: "" },
    { value: 10000, color: "#EA580C", icon: "" },
  ],
};

const CHIP_DEFINITIONS = {
  lights: {
    label: "Lights",
    icon: "mdi:lightbulb",
    activeColor: "#f5c542",
    inactiveColor: "rgba(255,255,255,0.38)",
  },
  temperature: {
    label: "Temperature",
    icon: "mdi:thermometer",
  },
  humidity: {
    label: "Humidity",
    icon: "mdi:water-percent",
  },
  music: {
    label: "Music",
    icon: "mdi:speaker",
    activeColor: "#43b581",
    inactiveColor: "rgba(255,255,255,0.38)",
  },
  lux: {
    label: "Lux",
    icon: "mdi:white-balance-sunny",
    inactiveColor: "rgba(255,255,255,0.38)",
  },
  // Free-form chip: any entities, a number (average, sum, min, max) or a
  // count of entities matching a condition. Can be added more than once.
  custom: {
    label: "Custom",
    icon: "mdi:counter",
    activeColor: "#43b581",
    inactiveColor: "rgba(255,255,255,0.38)",
  },
};

const CUSTOM_CHIP_AGGREGATIONS = ["avg", "sum", "min", "max", "first"];
const CUSTOM_CHIP_NUMERIC_OPERATORS = ["gt", "gte", "lt", "lte"];

// SVG paths used by icon-only ha-icon-button instances in the editor.
const MDI_PATH = {
  arrowUp: "M13,20H11V8L5.5,13.5L4.08,12.08L12,4.16L19.92,12.08L18.5,13.5L13,8V20Z",
  arrowDown: "M11,4H13V16L18.5,10.5L19.92,11.92L12,19.84L4.08,11.92L5.5,10.5L11,16V4Z",
  delete: "M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z",
};

// Numeric styling fields. Stored as raw numbers (px) and converted to CSS
// variables at render-time. An empty/undefined value means "use the
// built-in default" for that field.
const STYLING_NUMERIC_KEYS = [
  "title_font_size",
  "icon_size",
  "chips_margin",
  "chips_gap",
  "chip_padding_top",
  "chip_padding_right",
  "chip_padding_bottom",
  "chip_padding_left",
  "chip_min_width",
  "chip_radius",
  "chip_gap",
  "chip_icon_size",
  "chip_text_size",
  "indicator_gap",
  "indicator_size",
  "indicator_radius",
  "indicator_icon_size",
];

// Maps a styling field to the CSS custom property the display card reads.
const STYLING_VAR_MAP = {
  title_font_size: "--aac-title-size",
  icon_size: "--aac-icon-size",
  chips_margin: "--aac-chips-margin",
  chips_gap: "--aac-chips-gap",
  chip_padding_top: "--aac-chip-pt",
  chip_padding_right: "--aac-chip-pr",
  chip_padding_bottom: "--aac-chip-pb",
  chip_padding_left: "--aac-chip-pl",
  chip_min_width: "--aac-chip-min-width",
  chip_radius: "--aac-chip-radius",
  chip_gap: "--aac-chip-gap",
  chip_icon_size: "--aac-chip-icon-size",
  chip_text_size: "--aac-chip-text-size",
  indicator_gap: "--aac-indicator-gap",
  indicator_size: "--aac-indicator-size",
  indicator_radius: "--aac-indicator-radius",
  indicator_icon_size: "--aac-indicator-icon-size",
};

function buildStyleVars(styling) {
  if (!styling) return "";
  const parts = [];
  for (const key of STYLING_NUMERIC_KEYS) {
    const value = styling[key];
    if (value === null || value === undefined || value === "") continue;
    parts.push(`${STYLING_VAR_MAP[key]}:${value}px`);
  }
  const titleColor = resolveColor(styling.title_color);
  if (titleColor) parts.push(`--aac-title-color:${titleColor}`);
  const iconColor = resolveColor(styling.icon_color);
  if (iconColor) parts.push(`--aac-icon-color:${iconColor}`);
  return parts.join(";");
}

const HA_STATE_COLORS = new Set([
  "primary", "accent", "disabled",
  "red", "pink", "purple", "deep-purple", "indigo",
  "blue", "light-blue", "cyan", "teal",
  "green", "light-green", "lime",
  "yellow", "amber", "orange", "deep-orange",
  "brown", "light-grey", "grey", "dark-grey", "blue-grey",
  "black", "white",
]);

// Convert a stored color string into something the browser can render.
// HA's color picker returns named state colors like "primary" or "red";
// these need to be mapped to the matching CSS custom property
// (--primary-color, --red-color, ...). Hex/rgb/var() values are passed
// through unchanged.
function resolveColor(color) {
  if (!color || typeof color !== "string") return "";
  const trimmed = color.trim();
  if (!trimmed) return "";
  if (/^(#|rgb|hsl|var\()/i.test(trimmed)) {
    return trimmed;
  }
  if (HA_STATE_COLORS.has(trimmed)) {
    return `var(--${trimmed}-color)`;
  }
  return trimmed;
}

const registryCache = {
  promise: null,
  data: null,
};

// Fast lookup tables built once when the registry loads, instead of
// scanning arrays with .find() on every render.  Rebuilt lazily only
// when the underlying registry data reference changes.
const registryMaps = {
  ref: null,               // identity of the registryCache.data we indexed
  entityById: null,        // Map<entity_id, entityRegistryEntry>
  deviceById: null,        // Map<device_id, deviceRegistryEntry>
  areaById: null,          // Map<area_id, areaEntry>
  entityToArea: null,      // Map<entity_id, area_id>
};

function ensureRegistryMaps(registry) {
  if (!registry || registryMaps.ref === registry) return;
  registryMaps.ref = registry;
  registryMaps.entityById = new Map();
  registryMaps.deviceById = new Map();
  registryMaps.areaById = new Map();
  registryMaps.entityToArea = new Map();
  for (const area of registry.areas) {
    registryMaps.areaById.set(area.area_id, area);
  }
  for (const device of registry.devices) {
    registryMaps.deviceById.set(device.id, device);
  }
  for (const entry of registry.entities) {
    registryMaps.entityById.set(entry.entity_id, entry);
    // Pre-resolve entity → area so the hot path is a single Map.get.
    if (entry.area_id) {
      registryMaps.entityToArea.set(entry.entity_id, entry.area_id);
    } else if (entry.device_id) {
      const device = registryMaps.deviceById.get(entry.device_id);
      if (device?.area_id) {
        registryMaps.entityToArea.set(entry.entity_id, device.area_id);
      }
    }
  }
}

// Hoisted so `pickDisplayOverride` doesn't recreate the literal array on
// every call (hot path — runs once per indicator per render).
const NUMERIC_OPS = new Set(["gt", "gte", "lt", "lte"]);

// A finger may move this far (px) and still count as a tap / hold.
const PRESS_MOVE_TOLERANCE = 10;
// A click counts as the end of a tap only this soon after pointerup (ms).
const PENDING_TAP_MS = 1000;
// Upper bound for how long a hold waits for its trailing click (ms).
const SWALLOW_CLICK_MAX_MS = 15000;

function fireEvent(node, type, detail = {}, options = {}) {
  const event = new CustomEvent(type, {
    bubbles: options.bubbles ?? true,
    cancelable: Boolean(options.cancelable),
    composed: options.composed ?? true,
    detail,
  });
  node.dispatchEvent(event);
  return event;
}

function makeId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

// structuredClone is available in all browsers that support custom elements v1.
// Falls back to JSON round-trip only if needed (older Android WebView builds).
const clone = typeof structuredClone === "function"
  ? structuredClone
  : (value) => JSON.parse(JSON.stringify(value));

function htmlEscape(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Lazily-instantiated collator — `String.prototype.localeCompare` builds
// a fresh Intl.Collator on every call, which dominates sort cost for
// large entity lists.
let _labelCollator = null;
function _getLabelCollator() {
  if (!_labelCollator) {
    try {
      _labelCollator = new Intl.Collator(undefined, { sensitivity: "base" });
    } catch (_) {
      _labelCollator = { compare: (a, b) => (a < b ? -1 : a > b ? 1 : 0) };
    }
  }
  return _labelCollator;
}

function sortByLabel(values, getLabel) {
  const collator = _getLabelCollator();
  // Materialise labels once instead of calling getLabel twice per compare.
  const decorated = [];
  if (Array.isArray(values)) {
    for (let i = 0; i < values.length; i++) {
      decorated.push({ v: values[i], k: getLabel(values[i]) || "" });
    }
  } else {
    for (const v of values) decorated.push({ v, k: getLabel(v) || "" });
  }
  decorated.sort((a, b) => collator.compare(a.k, b.k));
  const out = new Array(decorated.length);
  for (let i = 0; i < decorated.length; i++) out[i] = decorated[i].v;
  return out;
}

function parseNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

// Fresh copy of the built-in threshold table of a chip type (empty for types
// without one, such as custom chips).
function defaultThresholds(type) {
  return (DEFAULT_THRESHOLDS[type] || []).map((threshold) => ({ ...threshold }));
}

// True when a chip's table is exactly the built-in one.
function thresholdsAreDefault(type, thresholds) {
  const defaults = defaultThresholds(type);
  if (!Array.isArray(thresholds) || thresholds.length !== defaults.length) return false;
  return defaults.every((entry, index) => {
    const other = thresholds[index];
    return other && Number(other.value) === entry.value
      && (other.color || "") === (entry.color || "")
      && (other.icon || "") === (entry.icon || "");
  });
}

function createDefaultChip(type) {
  const chip = {
    id: makeId(type),
    type,
    icon: CHIP_DEFINITIONS[type]?.icon || "mdi:circle",
    hidden_when_zero: false,
    use_custom_entities: true,
    entity_ids: [],
    thresholds: defaultThresholds(type),
    tap_action: { action: "more-info" },
    hold_action: { action: "none" },
  };
  if (type === "custom") {
    Object.assign(chip, {
      name: "",
      mode: "numeric",        // "numeric" (aggregate a value) | "count" (count matches)
      aggregation: "avg",
      attribute: "",
      unit: "",
      decimals: 1,
      count_operator: "truthy",
      count_value: "",
    });
  }
  return chip;
}

function normalizeStyling(input) {
  const source = (input && typeof input === "object") ? input : {};
  const styling = {
    show_title: source.show_title !== false,
    show_icon: source.show_icon !== false,
    title_color: typeof source.title_color === "string" ? source.title_color : "",
    icon_color: typeof source.icon_color === "string" ? source.icon_color : "",
  };
  for (const key of STYLING_NUMERIC_KEYS) {
    styling[key] = parseNumber(source[key]);
  }
  return styling;
}

const ENTITY_ACTIONS = ["more-info", "toggle"];

// Actions are stored in Home Assistant's own action format. Older versions
// of this card stored `call-service` with `service`, `service_data` and
// `entity_id`; convert those so the native action editor and HA's action
// handler understand them.
function normalizeAction(action) {
  if (!action || typeof action !== "object") return action;
  const next = { ...action };
  if (next.action === "call-service") next.action = "perform-action";
  if (next.service !== undefined) {
    if (next.perform_action === undefined) next.perform_action = next.service;
    delete next.service;
  }
  if (next.service_data !== undefined) {
    if (next.data === undefined) next.data = next.service_data;
    delete next.service_data;
  }
  if (next.entity_id !== undefined) {
    if (ENTITY_ACTIONS.includes(next.action)) {
      if (next.entity === undefined) next.entity = next.entity_id;
    } else if (next.action === "perform-action" && !next.target) {
      next.target = { entity_id: next.entity_id };
    }
    delete next.entity_id;
  }
  return next;
}

function normalizeConfig(inputConfig) {
  const config = clone(inputConfig || {});
  if (config.type !== DEFAULT_CARD_TYPE) {
    config.type = DEFAULT_CARD_TYPE;
  }
  // Multi-area support: `areas` is the source of truth. Configs that
  // pre-date multi-area used a single string `area` field — migrate it.
  if (Array.isArray(config.areas)) {
    config.areas = unique(config.areas.filter((id) => typeof id === "string" && id));
  } else if (typeof config.area === "string" && config.area) {
    config.areas = [config.area];
  } else {
    config.areas = [];
  }
  // Keep `area` mirrored to the first selected area so any external
  // code that still reads it (and our own internal helpers) keeps working.
  config.area = config.areas[0] || "";
  config.title = config.title || "";
  config.icon = config.icon || "";
  config.icon_style = ["plain", "boxed"].includes(config.icon_style) ? config.icon_style : "plain";
  config.tap_action = config.tap_action && typeof config.tap_action === "object"
    ? normalizeAction(config.tap_action)
    : { action: "none" };
  config.hold_action = config.hold_action && typeof config.hold_action === "object"
    ? normalizeAction(config.hold_action)
    : { action: "none" };
  config.chips = Array.isArray(config.chips) ? config.chips.map((chip) => ({
    ...createDefaultChip(chip.type || "lights"),
    ...chip,
    id: chip.id || makeId(chip.type || "chip"),
    use_light_color: chip.use_light_color === true,
    ...(chip.type === "custom" ? { use_custom_entities: true } : {}),
    entity_ids: unique(chip.entity_ids || []),
    thresholds: (Array.isArray(chip.thresholds) && chip.thresholds.length
      ? chip.thresholds.map((threshold) => ({
          value: parseNumber(threshold.value) ?? 0,
          color: threshold.color || "#43b581",
          icon: typeof threshold.icon === "string" ? threshold.icon : "",
        }))
      : defaultThresholds(chip.type)
    ).sort((a, b) => a.value - b.value),
    tap_action: normalizeAction(chip.tap_action) || { action: "more-info" },
    hold_action: normalizeAction(chip.hold_action) || { action: "none" },
  })) : [];
  config.activity_indicators = Array.isArray(config.activity_indicators)
    ? config.activity_indicators.map((indicator) => normalizeIndicator(indicator))
    : [];
  config.styling = normalizeStyling(config.styling);
  return config;
}

function fetchRegistryData(hass) {
  return Promise.all([
    hass.callWS({ type: "config/area_registry/list" }),
    hass.callWS({ type: "config/device_registry/list" }),
    hass.callWS({ type: "config/entity_registry/list" }),
  ]).then(([areas, devices, entities]) => ({ areas, devices, entities }));
}

async function ensureRegistry(hass) {
  if (!hass || !hass.callWS) {
    return { areas: [], devices: [], entities: [] };
  }
  if (registryCache.data) {
    return registryCache.data;
  }
  if (registryCache.promise) {
    return registryCache.promise;
  }
  registryCache.promise = fetchRegistryData(hass)
    .then((data) => {
      registryCache.data = data;
      return data;
    })
    .catch((error) => {
      console.error("advanced-area-card: failed to load registry", error);
      // Not cached: callers see `failed` and retry later instead of being
      // stuck with an empty registry until the page is reloaded.
      return { areas: [], devices: [], entities: [], failed: true };
    })
    .finally(() => {
      registryCache.promise = null;
    });
  return registryCache.promise;
}

// ─────────────────────────────────────────────────────────────────────────
// Registry freshness: one shared subscription for all card / editor
// instances. Subscribes while at least one instance is attached, reloads the
// registry (debounced) when areas, devices or entities change, and tells the
// instances only when the data actually differs.
// ─────────────────────────────────────────────────────────────────────────
const REGISTRY_EVENTS = ["area_registry_updated", "device_registry_updated", "entity_registry_updated"];
const REGISTRY_REFRESH_DELAY_MS = 1000;
const registryWatch = {
  listeners: new Set(),
  hass: null,
  subscribing: false,
  unsubscribe: null,
  timer: null,
};

function scheduleRegistryRefresh() {
  clearTimeout(registryWatch.timer);
  registryWatch.timer = setTimeout(refreshRegistry, REGISTRY_REFRESH_DELAY_MS);
}

async function refreshRegistry() {
  registryWatch.timer = null;
  const hass = registryWatch.hass;
  if (!hass?.callWS || registryWatch.listeners.size === 0) return;
  let next;
  try {
    next = await fetchRegistryData(hass);
  } catch (error) {
    // Keep the data we have; the next change event tries again.
    console.warn("advanced-area-card: failed to refresh registry", error);
    return;
  }
  if (registryWatch.listeners.size === 0) return;
  const prev = registryCache.data;
  if (prev && JSON.stringify(prev) === JSON.stringify(next)) return;
  registryCache.data = next;
  for (const listener of [...registryWatch.listeners]) listener(next);
}

function startRegistryWatch(hass) {
  const connection = hass?.connection;
  if (!connection || typeof connection.subscribeEvents !== "function") return;
  registryWatch.subscribing = true;
  Promise.allSettled(REGISTRY_EVENTS.map((type) => connection.subscribeEvents(scheduleRegistryRefresh, type)))
    .then((results) => {
      registryWatch.subscribing = false;
      const unsubs = results.filter((r) => r.status === "fulfilled").map((r) => r.value);
      const release = () => {
        for (const unsub of unsubs) {
          try { Promise.resolve(unsub()).catch(() => {}); } catch (_error) { /* connection already closed */ }
        }
        if (typeof connection.removeEventListener === "function") {
          connection.removeEventListener("ready", scheduleRegistryRefresh);
        }
      };
      if (registryWatch.listeners.size === 0) {
        release();
        return;
      }
      // After a websocket reconnect, events may have been missed: reload.
      if (typeof connection.addEventListener === "function") {
        connection.addEventListener("ready", scheduleRegistryRefresh);
      }
      registryWatch.unsubscribe = release;
    });
}

function stopRegistryWatch() {
  clearTimeout(registryWatch.timer);
  registryWatch.timer = null;
  if (registryWatch.unsubscribe) {
    registryWatch.unsubscribe();
    registryWatch.unsubscribe = null;
  }
}

// Returns a function that stops watching. Safe to call more than once.
function watchRegistry(hass, listener) {
  registryWatch.listeners.add(listener);
  registryWatch.hass = hass;
  if (!registryWatch.unsubscribe && !registryWatch.subscribing) startRegistryWatch(hass);
  return () => {
    registryWatch.listeners.delete(listener);
    if (registryWatch.listeners.size === 0) stopRegistryWatch();
  };
}

function getAreaName(area) {
  return area?.name || area?.normalized_name || area?.area_id || "Area";
}

function getAreaMeta(registry, areaId) {
  ensureRegistryMaps(registry);
  return registryMaps.areaById?.get(areaId) || null;
}

// Aggregate entity IDs across multiple areas. Uses the pre-built
// entityToArea map so it's a single pass over hass.states with O(1)
// lookups instead of O(entities × registry) scans.
function getAreasEntityIds(hass, registry, areaIds) {
  if (!Array.isArray(areaIds) || areaIds.length === 0) return [];
  ensureRegistryMaps(registry);
  const map = registryMaps.entityToArea;
  if (!map) return [];
  const wanted = areaIds.length === 1 ? null : new Set(areaIds);
  const singleId = areaIds.length === 1 ? areaIds[0] : null;
  const result = [];
  for (const entityId in hass.states) {
    const areaId = map.get(entityId);
    if (!areaId) continue;
    if (singleId ? areaId === singleId : wanted.has(areaId)) {
      result.push(entityId);
    }
  }
  return result;
}

function getConfigAreaIds(config) {
  if (!config) return [];
  if (Array.isArray(config.areas) && config.areas.length) return config.areas;
  if (typeof config.area === "string" && config.area) return [config.area];
  return [];
}

function getDomain(entityId) {
  return String(entityId || "").split(".")[0];
}

function getFriendlyName(stateObj, entityId) {
  return stateObj?.attributes?.friendly_name || entityId;
}

function getEntityLabel(hass, entityId) {
  return getFriendlyName(hass.states[entityId], entityId);
}

function getUnit(stateObj) {
  return stateObj?.attributes?.unit_of_measurement || "";
}

function isTemperatureEntity(stateObj, entityId) {
  const domain = getDomain(entityId);
  const deviceClass = stateObj?.attributes?.device_class;
  const unit = getUnit(stateObj);
  if (domain === "climate" && parseNumber(stateObj?.attributes?.current_temperature) !== null) {
    return true;
  }
  return deviceClass === "temperature" || ["°C", "°F", "K"].includes(unit);
}

function isHumidityEntity(stateObj, entityId) {
  const domain = getDomain(entityId);
  const deviceClass = stateObj?.attributes?.device_class;
  const unit = getUnit(stateObj);
  if (domain === "climate" && parseNumber(stateObj?.attributes?.current_humidity) !== null) {
    return true;
  }
  return deviceClass === "humidity" || unit === "%";
}

function isLuxEntity(stateObj) {
  const deviceClass = stateObj?.attributes?.device_class;
  const unit = getUnit(stateObj).toLowerCase();
  return deviceClass === "illuminance" || unit === "lx" || unit === "lux";
}

function getTemperatureValue(hass, stateObj, entityId) {
  const domain = getDomain(entityId);
  if (domain === "climate") {
    const numeric = parseNumber(stateObj?.attributes?.current_temperature);
    if (numeric === null) {
      return null;
    }
    return {
      value: numeric,
      unit: hass?.config?.unit_system?.temperature || "°C",
    };
  }
  const numeric = parseNumber(stateObj?.state);
  if (numeric === null) {
    return null;
  }
  return {
    value: numeric,
    unit: getUnit(stateObj) || hass?.config?.unit_system?.temperature || "°C",
  };
}

function convertTemperature(value, fromUnit, toUnit) {
  if (!Number.isFinite(value) || !fromUnit || !toUnit || fromUnit === toUnit) {
    return value;
  }
  if (fromUnit === "°F" && toUnit === "°C") {
    return (value - 32) * (5 / 9);
  }
  if (fromUnit === "°C" && toUnit === "°F") {
    return value * (9 / 5) + 32;
  }
  if (fromUnit === "K" && toUnit === "°C") {
    return value - 273.15;
  }
  if (fromUnit === "°C" && toUnit === "K") {
    return value + 273.15;
  }
  if (fromUnit === "K" && toUnit === "°F") {
    return (value - 273.15) * (9 / 5) + 32;
  }
  if (fromUnit === "°F" && toUnit === "K") {
    return (value - 32) * (5 / 9) + 273.15;
  }
  return value;
}

function getHumidityValue(stateObj, entityId) {
  const domain = getDomain(entityId);
  if (domain === "climate") {
    return parseNumber(stateObj?.attributes?.current_humidity);
  }
  return parseNumber(stateObj?.state);
}

function getLuxValue(stateObj) {
  return parseNumber(stateObj?.state);
}

function average(values) {
  if (!values.length) {
    return null;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function roundValue(value, digits = 1) {
  if (!Number.isFinite(value)) {
    return null;
  }
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

// Returns the winning threshold entry (with original `icon` field preserved)
// so the caller can use its icon override. Thresholds are pre-sorted by
// normalizeConfig, so this is a simple linear scan with zero allocations.
function resolveThresholdEntry(value, thresholds) {
  if (!thresholds || !thresholds.length || value === null || value === undefined) {
    return null;
  }
  let winner = thresholds[0];
  for (let i = 1; i < thresholds.length; i++) {
    if (value >= thresholds[i].value) {
      winner = thresholds[i];
    } else {
      break; // pre-sorted: no later entry can match
    }
  }
  return winner;
}

function formatNumber(value, digits = 0) {
  if (!Number.isFinite(value)) {
    return "0";
  }
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

// `cachedAreaEntityIds` is an optional pre-computed list of entities for the
// configured areas. When provided, skips the (relatively expensive) call to
// getAreasEntityIds. buildCardModel passes it so the list is computed once
// for all chips instead of once per chip.
// Whether an entity can be shown by a chip of this type.
function chipEntityMatchesType(type, entityId, stateObj) {
  switch (type) {
    case "lights":
      return getDomain(entityId) === "light";
    case "music":
      return getDomain(entityId) === "media_player";
    case "temperature":
      return isTemperatureEntity(stateObj, entityId);
    case "humidity":
      return isHumidityEntity(stateObj, entityId);
    case "lux":
      return isLuxEntity(stateObj, entityId);
    case "custom":
      return true;
    default:
      return false;
  }
}

function pickChipEntityIds(hass, registry, areaIds, chip, cachedAreaEntityIds) {
  const areaEntityIds = cachedAreaEntityIds || getAreasEntityIds(hass, registry, areaIds);
  const candidates = (chip.use_custom_entities || chip.type === "custom") ? (chip.entity_ids || []) : areaEntityIds;
  return unique(candidates).filter((entityId) => {
    const stateObj = hass.states[entityId];
    if (!stateObj) {
      return false;
    }
    return chipEntityMatchesType(chip.type, entityId, stateObj);
  });
}

// Averages the rgb_color attribute of all "on" lights into a single
// representative color string. Returns null when no lights report a
// color — the caller should fall back to the default/custom color.
// This is very cheap: just a few additions across a handful of entities.
function averageLightColor(hass, entityIds) {
  let r = 0, g = 0, b = 0, count = 0;
  for (let i = 0; i < entityIds.length; i++) {
    const stateObj = hass.states[entityIds[i]];
    if (!stateObj || stateObj.state !== "on") continue;
    const rgb = stateObj.attributes?.rgb_color;
    if (Array.isArray(rgb) && rgb.length >= 3) {
      r += rgb[0];
      g += rgb[1];
      b += rgb[2];
      count++;
    }
  }
  if (count === 0) return null;
  return `rgb(${Math.round(r / count)},${Math.round(g / count)},${Math.round(b / count)})`;
}

// "5 lx", "21.5°C", "42%": symbols attach directly, words get a space.
function formatChipUnit(unit) {
  if (!unit) return "";
  return /^[%°]/.test(unit) ? unit : ` ${unit}`;
}

function buildCustomChipModel(hass, chip, base, entityIds, definition) {
  // Up to `decimals` fraction digits; trailing zeros are dropped (900, not 900.0).
  const decimals = Math.min(4, Math.max(0, Math.round(parseNumber(chip.decimals) ?? 1)));
  const readRaw = (stateObj) => (chip.attribute ? getAttrPath(stateObj, chip.attribute) : stateObj.state);
  const unitOverride = typeof chip.unit === "string" ? chip.unit.trim() : "";

  if (chip.mode === "count") {
    const operator = chip.count_operator || "truthy";
    const numericOperator = CUSTOM_CHIP_NUMERIC_OPERATORS.includes(operator);
    const expected = numericOperator ? parseNumber(chip.count_value) : chip.count_value;
    let count = 0;
    for (const entityId of entityIds) {
      const stateObj = hass.states[entityId];
      if (stateObj && applyOperator(operator, readRaw(stateObj), expected)) count++;
    }
    const active = count > 0;
    return {
      ...base,
      text: `${formatNumber(count, 0)}${formatChipUnit(unitOverride)}`,
      visible: !(chip.hidden_when_zero && count === 0),
      color: active ? (chip.active_color || definition.activeColor || "#43b581") : base.mutedColor,
      active,
    };
  }

  const values = [];
  let entityUnit = "";
  for (const entityId of entityIds) {
    const stateObj = hass.states[entityId];
    if (!stateObj) continue;
    const numeric = parseNumber(readRaw(stateObj));
    if (numeric === null) continue;
    values.push(numeric);
    if (!entityUnit && !chip.attribute) entityUnit = stateObj.attributes?.unit_of_measurement || "";
  }
  const aggregation = CUSTOM_CHIP_AGGREGATIONS.includes(chip.aggregation) ? chip.aggregation : "avg";
  const value = roundValue(reduceNumeric(values, aggregation), decimals);
  const match = value === null ? null : resolveThresholdEntry(value, chip.thresholds);
  const active = value !== null;
  return {
    ...base,
    icon: match?.icon || base.icon,
    text: value === null
      ? "--"
      : `${new Intl.NumberFormat(undefined, { maximumFractionDigits: decimals }).format(value)}${formatChipUnit(unitOverride || entityUnit)}`,
    visible: !(chip.hidden_when_zero && (value || 0) === 0),
    color: active ? (match?.color || chip.active_color || definition.activeColor || "#43b581") : base.mutedColor,
    active,
  };
}

function buildChipModel(hass, registry, config, chip, cachedAreaEntityIds) {
  const definition = CHIP_DEFINITIONS[chip.type] || {};
  const entityIds = pickChipEntityIds(hass, registry, getConfigAreaIds(config), chip, cachedAreaEntityIds);
  const baseIcon = chip.icon || definition.icon || "mdi:circle";
  const base = {
    id: chip.id,
    type: chip.type,
    label: (chip.type === "custom" && chip.name) || definition.label || chip.type,
    icon: baseIcon,
    text: "--",
    visible: true,
    color: chip.active_color || definition.activeColor || "#ffffff",
    mutedColor: chip.inactive_color || definition.inactiveColor || "rgba(255,255,255,0.38)",
    entityIds,
    tap_action: chip.tap_action,
    hold_action: chip.hold_action,
    active: true,
  };

  if (chip.type === "custom") {
    return buildCustomChipModel(hass, chip, base, entityIds, definition);
  }

  if (chip.type === "lights") {
    const onCount = entityIds.filter((entityId) => hass.states[entityId]?.state === "on").length;
    const active = onCount > 0;
    let color;
    if (!active) {
      color = base.mutedColor;
    } else if (chip.use_light_color) {
      // Average the actual light colors; fall back to custom or default.
      color = averageLightColor(hass, entityIds) || chip.active_color || definition.activeColor || "#f5c542";
    } else {
      color = chip.active_color || definition.activeColor || "#f5c542";
    }
    return {
      ...base,
      text: formatNumber(onCount, 0),
      visible: !(chip.hidden_when_zero && onCount === 0),
      color,
      active,
    };
  }

  if (chip.type === "music") {
    const activeCount = entityIds.filter((entityId) => {
      const state = hass.states[entityId]?.state;
      return ["playing", "buffering", "on"].includes(state);
    }).length;
    const active = activeCount > 0;
    return {
      ...base,
      text: formatNumber(activeCount, 0),
      visible: !(chip.hidden_when_zero && activeCount === 0),
      color: active ? (chip.active_color || definition.activeColor || "#43b581") : base.mutedColor,
      active,
    };
  }

  if (chip.type === "temperature") {
    const readings = entityIds
      .map((entityId) => getTemperatureValue(hass, hass.states[entityId], entityId))
      .filter(Boolean);
    const targetUnit = readings[0]?.unit || hass?.config?.unit_system?.temperature || "°C";
    const values = readings.map((item) => convertTemperature(item.value, item.unit, targetUnit));
    const averageValue = roundValue(average(values), 1);
    const match = resolveThresholdEntry(averageValue, chip.thresholds);
    return {
      ...base,
      icon: match?.icon || baseIcon,
      text: averageValue === null ? "--" : `${formatNumber(averageValue, 1)}${targetUnit}`,
      color: match?.color || "#43b581",
      active: averageValue !== null,
    };
  }

  if (chip.type === "humidity") {
    const values = entityIds
      .map((entityId) => getHumidityValue(hass.states[entityId], entityId))
      .filter((value) => value !== null);
    const averageValue = roundValue(average(values), 0);
    const match = resolveThresholdEntry(averageValue, chip.thresholds);
    return {
      ...base,
      icon: match?.icon || baseIcon,
      text: averageValue === null ? "--" : `${formatNumber(averageValue, 0)}%`,
      color: match?.color || "#43b581",
      active: averageValue !== null,
    };
  }

  if (chip.type === "lux") {
    const values = entityIds
      .map((entityId) => getLuxValue(hass.states[entityId]))
      .filter((value) => value !== null);
    const averageValue = roundValue(average(values), 0);
    const active = (averageValue || 0) > 0;
    const match = active ? resolveThresholdEntry(averageValue, chip.thresholds) : null;
    return {
      ...base,
      icon: match?.icon || baseIcon,
      text: averageValue === null ? "--" : `${formatNumber(averageValue, 0)} lx`,
      visible: !(chip.hidden_when_zero && (averageValue || 0) === 0),
      color: active ? (match?.color || "#43b581") : base.mutedColor,
      active,
    };
  }

  return base;
}

function entityLooksLikeDoor(entityId, stateObj) {
  const deviceClass = stateObj?.attributes?.device_class;
  if (["door", "garage_door", "opening"].includes(deviceClass)) {
    return true;
  }
  return /(door|garage)/i.test(entityId || "");
}

function entityLooksLikeWindow(entityId, stateObj) {
  const deviceClass = stateObj?.attributes?.device_class;
  if (deviceClass === "window") {
    return true;
  }
  return /window/i.test(entityId || "");
}

// ─────────────────────────────────────────────────────────────────────────
// Rule-based activity indicator engine
// ─────────────────────────────────────────────────────────────────────────
//
// Indicators are driven by a small tree of rule nodes:
//   { type: "state",   entity_id, attribute?, aggregation, operator, value }
//   { type: "numeric", entity_id, attribute?, aggregation, operator, value }
//   { type: "time",    after?: "HH:MM", before?: "HH:MM" }
//   { type: "and",     rules: [...] }
//   { type: "or",      rules: [...] }
//   { type: "not",     rule:  {...} }
//
// An indicator shows when its `when` rule is true AND every `and_if` rule
// is true. The optional `for_duration` on the indicator (seconds) delays
// activation until the combined result has held long enough.
//

// Truthy values used when a rule's value is boolean-ish (e.g. "on"/"off").
const RULE_TRUTHY = new Set(["on", "open", "opening", "home", "detected", "true", "active", "playing"]);

function toEntityList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter((id) => typeof id === "string" && id);
  return typeof value === "string" && value ? [value] : [];
}

function parseHHMM(value) {
  if (typeof value !== "string") return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

// Reads an attribute from a state object via a dotted path, e.g.
// "hvac_action" or "light.brightness". Returns undefined if anything
// along the path is missing.
function getAttrPath(stateObj, path) {
  if (!stateObj || !path) return undefined;
  const parts = String(path).split(".");
  let cursor = stateObj.attributes;
  for (const part of parts) {
    if (cursor == null) return undefined;
    cursor = cursor[part];
  }
  return cursor;
}

function coerceForCompare(value) {
  // Match HA-style booleans so "on" == true works intuitively.
  if (value === true) return "on";
  if (value === false) return "off";
  return value;
}

function applyOperator(operator, left, right) {
  const op = operator || "eq";
  left = coerceForCompare(left);
  switch (op) {
    case "eq":
      // Loose comparison so "5" == 5 and "on" == "on" both work.
      return left == right;
    case "ne":
      return left != right;
    case "gt": return Number(left) > Number(right);
    case "gte": return Number(left) >= Number(right);
    case "lt": return Number(left) < Number(right);
    case "lte": return Number(left) <= Number(right);
    case "in": {
      const list = Array.isArray(right) ? right : String(right || "").split(",").map((x) => x.trim());
      return list.includes(String(left));
    }
    case "not_in": {
      const list = Array.isArray(right) ? right : String(right || "").split(",").map((x) => x.trim());
      return !list.includes(String(left));
    }
    case "contains":
      return String(left).toLowerCase().includes(String(right).toLowerCase());
    case "matches":
      try { return new RegExp(String(right)).test(String(left)); }
      catch (_e) { return false; }
    case "truthy":
      if (left === null || left === undefined) return false;
      if (typeof left === "number") return left !== 0;
      if (typeof left === "boolean") return left;
      return RULE_TRUTHY.has(String(left).toLowerCase());
    case "falsy":
      if (left === null || left === undefined) return true;
      if (typeof left === "number") return left === 0;
      if (typeof left === "boolean") return !left;
      return !RULE_TRUTHY.has(String(left).toLowerCase());
    default:
      return false;
  }
}

function reduceNumeric(values, aggregation) {
  if (!values.length) return null;
  switch (aggregation) {
    case "sum": return values.reduce((a, b) => a + b, 0);
    case "avg": return values.reduce((a, b) => a + b, 0) / values.length;
    case "min": return Math.min(...values);
    case "max": return Math.max(...values);
    case "count": return values.length;
    case "first": return values[0];
    default: return null;
  }
}

function evaluateStateRule(rule, hass) {
  const entityIds = toEntityList(rule.entity_id);
  if (!entityIds.length) return false;
  const operator = rule.operator || "eq";
  const value = rule.value;
  const results = [];
  for (const id of entityIds) {
    const stateObj = hass?.states?.[id];
    if (!stateObj) { results.push(false); continue; }
    const raw = rule.attribute
      ? getAttrPath(stateObj, rule.attribute)
      : stateObj.state;
    results.push(applyOperator(operator, raw, value));
  }
  const agg = rule.aggregation || "any";
  if (agg === "all") return results.every(Boolean);
  if (agg === "none") return !results.some(Boolean);
  return results.some(Boolean);
}

function evaluateNumericRule(rule, hass) {
  const entityIds = toEntityList(rule.entity_id);
  if (!entityIds.length) return false;
  const raws = [];
  for (const id of entityIds) {
    const stateObj = hass?.states?.[id];
    if (!stateObj) continue;
    const raw = rule.attribute
      ? getAttrPath(stateObj, rule.attribute)
      : stateObj.state;
    const numeric = parseNumber(raw);
    if (numeric !== null) raws.push(numeric);
  }
  const agg = rule.aggregation || "any";
  const operator = rule.operator || "gt";
  const threshold = parseNumber(rule.value) ?? rule.value;
  // Per-entity comparisons (any / all / none).
  if (agg === "any" || agg === "all" || agg === "none") {
    if (!raws.length) return agg === "none";
    const matches = raws.map((v) => applyOperator(operator, v, threshold));
    if (agg === "all") return matches.every(Boolean);
    if (agg === "none") return !matches.some(Boolean);
    return matches.some(Boolean);
  }
  // Aggregate-first comparisons (sum / avg / min / max / count).
  const aggregated = reduceNumeric(raws, agg);
  if (aggregated === null) return false;
  return applyOperator(operator, aggregated, threshold);
}

function evaluateTimeRule(rule, ctx) {
  const now = ctx?.now instanceof Date ? ctx.now : new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  const after = parseHHMM(rule.after);
  const before = parseHHMM(rule.before);
  if (after === null && before === null) return true;
  if (after !== null && before !== null) {
    // Overnight windows wrap (e.g. after 23:00 AND before 07:00).
    if (after <= before) return mins >= after && mins < before;
    return mins >= after || mins < before;
  }
  if (after !== null) return mins >= after;
  return mins < before;
}

function evaluateRule(rule, hass, ctx) {
  if (!rule || typeof rule !== "object") return false;
  switch (rule.type) {
    case "state": return evaluateStateRule(rule, hass);
    case "numeric": return evaluateNumericRule(rule, hass);
    case "time": return evaluateTimeRule(rule, ctx);
    case "and": return Array.isArray(rule.rules) && rule.rules.every((r) => evaluateRule(r, hass, ctx));
    case "or": return Array.isArray(rule.rules) && rule.rules.some((r) => evaluateRule(r, hass, ctx));
    case "not": return !evaluateRule(rule.rule, hass, ctx);
    default: return false;
  }
}

// Raw truth of an indicator *before* `for_duration` delay is applied.
function evaluateIndicatorRaw(indicator, hass, ctx) {
  if (!indicator || !indicator.when) return false;
  if (!evaluateRule(indicator.when, hass, ctx)) return false;
  const conditions = Array.isArray(indicator.and_if) ? indicator.and_if : [];
  for (const condition of conditions) {
    if (!evaluateRule(condition, hass, ctx)) return false;
  }
  return true;
}

// Walks an indicator's `when` rule collecting the { id, attr } pairs used
// to resolve the representative value. Extracted so the card can cache
// the result on config change instead of re-walking on every render.
function collectIndicatorRepCandidates(indicator) {
  const bucket = [];
  const walk = (rule) => {
    if (!rule) return;
    if (rule.type === "numeric" || rule.type === "state") {
      for (const id of toEntityList(rule.entity_id)) bucket.push({ id, attr: rule.attribute });
    } else if (rule.type === "and" || rule.type === "or") {
      (rule.rules || []).forEach(walk);
    } else if (rule.type === "not") {
      walk(rule.rule);
    }
  };
  walk(indicator?.when);
  return bucket;
}

// Resolves the "representative" numeric value of an indicator for use in
// display_overrides matching, tooltips and badges. Uses the first
// numeric-typed entity from the `when` rule. Accepts an optional
// precomputed candidate list to skip the rule-tree walk on the hot path.
function getIndicatorRepresentativeValue(indicator, hass, candidates) {
  const bucket = candidates || collectIndicatorRepCandidates(indicator);
  for (const { id, attr } of bucket) {
    const stateObj = hass?.states?.[id];
    if (!stateObj) continue;
    const raw = attr ? getAttrPath(stateObj, attr) : stateObj.state;
    const numeric = parseNumber(raw);
    if (numeric !== null) return { value: numeric, raw, stateObj, entityId: id };
  }
  // No numeric — fall back to first entity's raw state.
  if (bucket.length) {
    const first = bucket[0];
    const stateObj = hass?.states?.[first.id];
    if (stateObj) {
      const raw = first.attr ? getAttrPath(stateObj, first.attr) : stateObj.state;
      return { value: null, raw, stateObj, entityId: first.id };
    }
  }
  return { value: null, raw: null, stateObj: null, entityId: null };
}

// Finds the first matching display_overrides entry. Each entry carries a
// match condition and optional display property overrides. When an entry
// specifies its own entity_id (and optional attribute), the test reads
// that entity's value instead of the representative. First match wins.
function pickDisplayOverride(overrides, representative, hass) {
  if (!Array.isArray(overrides) || !overrides.length) return null;
  const { value: repNumeric, raw: repRaw } = representative || {};
  for (const entry of overrides) {
    if (!entry || !entry.match) continue;
    const operator = entry.match.operator || "gt";
    const threshold = entry.match.value;
    let numeric = repNumeric;
    let raw = repRaw;
    if (entry.match.entity_id && hass?.states) {
      const stateObj = hass.states[entry.match.entity_id];
      if (!stateObj) continue;
      raw = entry.match.attribute
        ? getAttrPath(stateObj, entry.match.attribute)
        : stateObj.state;
      numeric = parseNumber(raw);
    }
    const isNumericOp = NUMERIC_OPS.has(operator);
    const left = isNumericOp ? numeric : raw;
    if (left === null || left === undefined) continue;
    if (applyOperator(operator, left, threshold)) return entry;
  }
  return null;
}

// Walks every rule tree on an indicator collecting referenced entity ids.
function collectRuleEntityIds(rule, out) {
  if (!rule || typeof rule !== "object") return;
  if (rule.type === "state" || rule.type === "numeric") {
    for (const id of toEntityList(rule.entity_id)) out.add(id);
    return;
  }
  if (rule.type === "and" || rule.type === "or") {
    (rule.rules || []).forEach((r) => collectRuleEntityIds(r, out));
    return;
  }
  if (rule.type === "not") {
    collectRuleEntityIds(rule.rule, out);
  }
}

function collectIndicatorEntityIds(indicator) {
  const out = new Set();
  if (indicator) {
    collectRuleEntityIds(indicator.when, out);
    (indicator.and_if || []).forEach((r) => collectRuleEntityIds(r, out));
  }
  return out;
}

function ruleHasTime(rule) {
  if (!rule || typeof rule !== "object") return false;
  if (rule.type === "time") return true;
  if (rule.type === "and" || rule.type === "or") return (rule.rules || []).some(ruleHasTime);
  if (rule.type === "not") return ruleHasTime(rule.rule);
  return false;
}

function indicatorHasTime(indicator) {
  if (!indicator) return false;
  if (ruleHasTime(indicator.when)) return true;
  return (indicator.and_if || []).some(ruleHasTime);
}

// Smart defaults: given a freshly-picked entity, return a ready-to-use
// { when, display } pair. Re-used by the editor when adding a new
// indicator and by the migration when filling in a legacy record.
const BINARY_SENSOR_PRESETS = {
  motion:     { icon: "mdi:motion-sensor",  color: "#ff9800" },
  occupancy:  { icon: "mdi:motion-sensor",  color: "#ff9800" },
  presence:   { icon: "mdi:motion-sensor",  color: "#ff9800" },
  door:       { icon: "mdi:door-open",      color: "#f5c542" },
  garage_door:{ icon: "mdi:garage-open",    color: "#f5c542" },
  window:     { icon: "mdi:window-open",    color: "#f5c542" },
  opening:    { icon: "mdi:door-open",      color: "#f5c542" },
  moisture:   { icon: "mdi:water",          color: "#4fa3ff" },
  smoke:      { icon: "mdi:smoke",          color: "#ef5350" },
  gas:        { icon: "mdi:gas-cylinder",   color: "#ef5350" },
  co:         { icon: "mdi:alert",          color: "#ef5350" },
  safety:     { icon: "mdi:alert",          color: "#ef5350" },
  problem:    { icon: "mdi:alert",          color: "#ef5350" },
  sound:      { icon: "mdi:volume-high",    color: "#43b581" },
  vibration:  { icon: "mdi:vibrate",        color: "#ff9800" },
  plug:       { icon: "mdi:power-plug",     color: "#4fa3ff" },
  power:      { icon: "mdi:flash",          color: "#f5c542" },
  running:    { icon: "mdi:play-circle",    color: "#43b581" },
  tamper:     { icon: "mdi:shield-alert",   color: "#ef5350" },
  battery:    { icon: "mdi:battery-alert",  color: "#ef5350" },
  _default:   { icon: "mdi:checkbox-marked-circle", color: "#43b581" },
};

function _mkStateWhen(entityId, spec) {
  return {
    type: "state",
    entity_id: entityId ? [entityId] : [],
    attribute: spec.attribute || null,
    aggregation: spec.aggregation || "any",
    operator: spec.operator || "eq",
    value: spec.value,
    for: 0,
  };
}

function _mkNumericWhen(entityId, spec) {
  return {
    type: "numeric",
    entity_id: entityId ? [entityId] : [],
    attribute: spec.attribute || null,
    aggregation: spec.aggregation || "any",
    operator: spec.operator || "gt",
    value: spec.value,
    for: 0,
  };
}

function _mkDisplay(icon, color, overrides) {
  return {
    icon,
    color,
    display_overrides: [],
    size: null,
    icon_size: null,
    animation: (overrides && overrides.animation) || "none",
    animation_speed: (overrides && overrides.animation_speed) ?? 1,
    inactive: (overrides && overrides.inactive) || "hide",
    dim_opacity: 0.3,
    badge: null,
    tooltip: null,
  };
}

function getIndicatorDefaults(entityId, stateObj) {
  const domain = getDomain(entityId);
  const deviceClass = stateObj?.attributes?.device_class;
  const nameLower = String(entityId || "").toLowerCase();

  if (domain === "binary_sensor") {
    const preset = BINARY_SENSOR_PRESETS[deviceClass] || null;
    // device_class missing? Fall back to entity-id pattern scan.
    if (!preset) {
      if (/motion|presence|occupancy/.test(nameLower)) return getIndicatorDefaults(entityId, { attributes: { device_class: "motion" } });
      if (/window/.test(nameLower)) return getIndicatorDefaults(entityId, { attributes: { device_class: "window" } });
      if (/door|garage/.test(nameLower)) return getIndicatorDefaults(entityId, { attributes: { device_class: "door" } });
      if (/smoke/.test(nameLower)) return getIndicatorDefaults(entityId, { attributes: { device_class: "smoke" } });
      if (/moisture|leak|water/.test(nameLower)) return getIndicatorDefaults(entityId, { attributes: { device_class: "moisture" } });
    }
    const chosen = preset || BINARY_SENSOR_PRESETS._default;
    return {
      when: _mkStateWhen(entityId, { operator: "in", value: ["on", "detected", "home", "open", "opening"] }),
      display: _mkDisplay(chosen.icon, chosen.color),
    };
  }

  if (domain === "light") {
    return {
      when: _mkStateWhen(entityId, { operator: "eq", value: "on" }),
      display: _mkDisplay("mdi:lightbulb", "#f5c542"),
    };
  }
  if (domain === "switch" || domain === "input_boolean") {
    return {
      when: _mkStateWhen(entityId, { operator: "eq", value: "on" }),
      display: _mkDisplay("mdi:toggle-switch", "#4fa3ff"),
    };
  }
  if (domain === "fan") {
    return {
      when: _mkStateWhen(entityId, { operator: "eq", value: "on" }),
      display: _mkDisplay("mdi:fan", "#43b581", { animation: "spin", animation_speed: 1 }),
    };
  }
  if (domain === "media_player") {
    return {
      when: _mkStateWhen(entityId, { operator: "in", value: ["playing", "on", "paused"] }),
      display: _mkDisplay("mdi:speaker", "#43b581"),
    };
  }
  if (domain === "camera") {
    return {
      when: _mkStateWhen(entityId, { operator: "in", value: ["streaming", "recording"] }),
      display: _mkDisplay("mdi:cctv", "#4fa3ff"),
    };
  }
  if (domain === "vacuum") {
    return {
      when: _mkStateWhen(entityId, { operator: "in", value: ["cleaning", "returning"] }),
      display: _mkDisplay("mdi:robot-vacuum", "#4fa3ff"),
    };
  }
  if (domain === "cover") {
    const icon = /garage/.test(nameLower) ? "mdi:garage-open" : "mdi:window-open";
    return {
      when: _mkStateWhen(entityId, { operator: "eq", value: "open" }),
      display: _mkDisplay(icon, "#f5c542"),
    };
  }
  if (domain === "weather") {
    // Weather is usually always-visible with state-based icon swapping.
    const display = _mkDisplay("mdi:weather-partly-cloudy", "#4fa3ff", { inactive: "show" });
    display.display_overrides = [
      { match: { operator: "eq", value: "sunny" },       icon: "mdi:weather-sunny" },
      { match: { operator: "eq", value: "clear-night" }, icon: "mdi:weather-night" },
      { match: { operator: "eq", value: "rainy" },       icon: "mdi:weather-rainy" },
      { match: { operator: "eq", value: "pouring" },     icon: "mdi:weather-pouring" },
      { match: { operator: "eq", value: "snowy" },       icon: "mdi:weather-snowy" },
      { match: { operator: "eq", value: "cloudy" },      icon: "mdi:weather-cloudy" },
      { match: { operator: "eq", value: "partlycloudy" },icon: "mdi:weather-partly-cloudy" },
      { match: { operator: "eq", value: "windy" },       icon: "mdi:weather-windy" },
      { match: { operator: "eq", value: "fog" },         icon: "mdi:weather-fog" },
    ];
    return {
      when: _mkStateWhen(entityId, { operator: "ne", value: "unavailable" }),
      display,
    };
  }
  if (domain === "climate") {
    const modes = stateObj?.attributes?.hvac_modes || [];
    if (modes.includes("heat")) {
      return {
        when: _mkStateWhen(entityId, { attribute: "hvac_action", operator: "eq", value: "heating" }),
        display: _mkDisplay("mdi:radiator", "#ef5350"),
      };
    }
    if (modes.includes("cool")) {
      return {
        when: _mkStateWhen(entityId, { attribute: "hvac_action", operator: "eq", value: "cooling" }),
        display: _mkDisplay("mdi:air-conditioner", "#4fa3ff"),
      };
    }
    return {
      when: _mkStateWhen(entityId, { operator: "ne", value: "off" }),
      display: _mkDisplay("mdi:thermostat", "#4fa3ff"),
    };
  }
  if (domain === "lock") {
    return {
      when: _mkStateWhen(entityId, { operator: "eq", value: "unlocked" }),
      display: _mkDisplay("mdi:lock-open-variant", "#ef5350"),
    };
  }
  if (domain === "person" || domain === "device_tracker") {
    return {
      when: _mkStateWhen(entityId, { operator: "eq", value: "home" }),
      display: _mkDisplay("mdi:account", "#43b581"),
    };
  }
  if (domain === "sensor") {
    if (deviceClass === "temperature") {
      return {
        when: _mkNumericWhen(entityId, { operator: "gt", value: 25 }),
        display: _mkDisplay("mdi:thermometer", "#ff9800"),
      };
    }
    if (deviceClass === "humidity") {
      return {
        when: _mkNumericWhen(entityId, { operator: "gt", value: 60 }),
        display: _mkDisplay("mdi:water-percent", "#4fa3ff"),
      };
    }
    if (deviceClass === "power" || deviceClass === "apparent_power") {
      return {
        when: _mkNumericWhen(entityId, { operator: "gt", value: 100 }),
        display: _mkDisplay("mdi:flash", "#f5c542"),
      };
    }
    if (deviceClass === "energy") {
      return {
        when: _mkNumericWhen(entityId, { operator: "gt", value: 0 }),
        display: _mkDisplay("mdi:lightning-bolt", "#f5c542"),
      };
    }
    if (deviceClass === "illuminance") {
      return {
        when: _mkNumericWhen(entityId, { operator: "gt", value: 1000 }),
        display: _mkDisplay("mdi:brightness-7", "#f5c542"),
      };
    }
    if (deviceClass === "moisture") {
      return {
        when: _mkNumericWhen(entityId, { operator: "lt", value: 60 }),
        display: _mkDisplay("mdi:water", "#4fa3ff"),
      };
    }
    if (deviceClass === "pressure") {
      return {
        when: _mkNumericWhen(entityId, { operator: "gt", value: 1015 }),
        display: _mkDisplay("mdi:gauge", "#4fa3ff"),
      };
    }
    if (deviceClass === "co2" || deviceClass === "carbon_dioxide") {
      return {
        when: _mkNumericWhen(entityId, { operator: "gt", value: 1000 }),
        display: _mkDisplay("mdi:molecule-co2", "#ef5350"),
      };
    }
    // Generic sensor: numeric-or-state heuristic.
    if (parseNumber(stateObj?.state) !== null) {
      return {
        when: _mkNumericWhen(entityId, { operator: "gt", value: 0 }),
        display: _mkDisplay("mdi:gauge", "#43b581"),
      };
    }
    return {
      when: _mkStateWhen(entityId, { operator: "truthy" }),
      display: _mkDisplay("mdi:information-outline", "#43b581"),
    };
  }

  // Entity-id name fallbacks for anything we didn't recognize above.
  if (/motion|presence|occupancy/.test(nameLower)) {
    return {
      when: _mkStateWhen(entityId, { operator: "in", value: ["on", "detected", "home"] }),
      display: _mkDisplay("mdi:motion-sensor", "#ff9800"),
    };
  }
  if (/door|garage/.test(nameLower)) {
    return {
      when: _mkStateWhen(entityId, { operator: "in", value: ["on", "open", "opening"] }),
      display: _mkDisplay("mdi:door-open", "#f5c542"),
    };
  }
  if (/window/.test(nameLower)) {
    return {
      when: _mkStateWhen(entityId, { operator: "in", value: ["on", "open", "opening"] }),
      display: _mkDisplay("mdi:window-open", "#f5c542"),
    };
  }

  return {
    when: _mkStateWhen(entityId, { operator: "truthy" }),
    display: _mkDisplay("mdi:circle", "#43b581"),
  };
}

function normalizeRule(raw) {
  if (!raw || typeof raw !== "object") return null;
  const type = raw.type || "state";
  if (type === "and" || type === "or") {
    return {
      type,
      rules: Array.isArray(raw.rules) ? raw.rules.map(normalizeRule).filter(Boolean) : [],
    };
  }
  if (type === "not") {
    return { type: "not", rule: normalizeRule(raw.rule) };
  }
  if (type === "time") {
    return {
      type: "time",
      after: typeof raw.after === "string" ? raw.after : "",
      before: typeof raw.before === "string" ? raw.before : "",
    };
  }
  if (type === "numeric") {
    return {
      type: "numeric",
      entity_id: toEntityList(raw.entity_id),
      attribute: typeof raw.attribute === "string" && raw.attribute ? raw.attribute : null,
      aggregation: raw.aggregation || "any",
      operator: raw.operator || "gt",
      value: raw.value,
      for: parseNumber(raw.for) ?? 0,
    };
  }
  // Default to state rule.
  return {
    type: "state",
    entity_id: toEntityList(raw.entity_id),
    attribute: typeof raw.attribute === "string" && raw.attribute ? raw.attribute : null,
    aggregation: raw.aggregation || "any",
    operator: raw.operator || "eq",
    value: raw.value,
    for: parseNumber(raw.for) ?? 0,
  };
}

function normalizeDisplayOverrideMatch(m, defaultOp) {
  const out = { operator: m?.operator || defaultOp, value: m?.value };
  if (m?.entity_id) out.entity_id = m.entity_id;
  if (m?.attribute) out.attribute = m.attribute;
  if (m?.type) out.type = m.type;
  return out;
}

function normalizeDisplay(raw, fallback) {
  const source = (raw && typeof raw === "object") ? raw : {};
  const base = fallback || _mkDisplay("mdi:circle", "#43b581");
  const overrides = Array.isArray(source.display_overrides)
    ? source.display_overrides
        .filter((entry) => entry && entry.match)
        .map((entry) => {
          const o = { match: normalizeDisplayOverrideMatch(entry.match, "gt") };
          if (entry.icon) o.icon = entry.icon;
          if (entry.color) o.color = entry.color;
          if (entry.animation) o.animation = entry.animation;
          if (entry.animation_speed != null) o.animation_speed = entry.animation_speed;
          if (entry.size != null) o.size = entry.size;
          if (entry.icon_size != null) o.icon_size = entry.icon_size;
          if (entry.inactive) o.inactive = entry.inactive;
          if (entry.dim_opacity != null) o.dim_opacity = entry.dim_opacity;
          if (entry.tooltip) o.tooltip = entry.tooltip;
          if (entry.badge) o.badge = {
            text: typeof entry.badge.text === "string" ? entry.badge.text : "",
            color: typeof entry.badge.color === "string" ? entry.badge.color : "",
          };
          return o;
        })
    : [];
  const animation = ["none", "pulse", "spin", "blink", "bounce", "shake"].includes(source.animation)
    ? source.animation
    : base.animation;
  const inactive = ["hide", "dim", "show"].includes(source.inactive)
    ? source.inactive
    : base.inactive;
  const badge = source.badge && typeof source.badge === "object"
    ? {
        text: typeof source.badge.text === "string" ? source.badge.text : "",
        color: typeof source.badge.color === "string" ? source.badge.color : "",
      }
    : null;
  return {
    icon: typeof source.icon === "string" && source.icon ? source.icon : base.icon,
    color: typeof source.color === "string" ? source.color : base.color,
    display_overrides: overrides,
    size: parseNumber(source.size),
    icon_size: parseNumber(source.icon_size),
    animation,
    animation_speed: parseNumber(source.animation_speed) ?? base.animation_speed,
    inactive,
    dim_opacity: parseNumber(source.dim_opacity) ?? base.dim_opacity,
    badge,
    tooltip: typeof source.tooltip === "string" && source.tooltip ? source.tooltip : null,
  };
}

function normalizeIndicator(raw) {
  const source = (raw && typeof raw === "object") ? raw : {};
  const whenRule = normalizeRule(source.when) || _mkStateWhen("", { operator: "truthy" });
  const andIf = Array.isArray(source.and_if)
    ? source.and_if.map(normalizeRule).filter(Boolean)
    : [];
  const display = normalizeDisplay(source.display, null);
  return {
    id: source.id || makeId("indicator"),
    name: typeof source.name === "string" ? source.name : "",
    when: whenRule,
    and_if: andIf,
    display,
    tap_action: source.tap_action && typeof source.tap_action === "object"
      ? normalizeAction(source.tap_action)
      : { action: "more-info" },
    hold_action: source.hold_action && typeof source.hold_action === "object"
      ? normalizeAction(source.hold_action)
      : { action: "none" },
    for_duration: parseNumber(source.for_duration) ?? 0,
    // Informational only — lets the editor show the "preset" that was used
    // to seed the indicator. Never read by the runtime.
    role: typeof source.role === "string" ? source.role : "",
    entity_id: typeof source.entity_id === "string" ? source.entity_id : "",
  };
}

function detectIndicatorRole(entityId, stateObj) {
  const domain = getDomain(entityId);
  const deviceClass = stateObj?.attributes?.device_class;

  if (deviceClass === "motion" || /motion|presence|occupancy/i.test(entityId || "")) {
    return "movement";
  }
  if (entityLooksLikeWindow(entityId, stateObj)) {
    return "window";
  }
  if (entityLooksLikeDoor(entityId, stateObj)) {
    return "door";
  }
  if (domain === "fan" || /fan/i.test(entityId || "")) {
    return "fan";
  }
  if (domain === "climate") {
    const hvacModes = stateObj?.attributes?.hvac_modes || [];
    if (hvacModes.includes("cool") && !hvacModes.includes("heat")) {
      return "cooling";
    }
    if (hvacModes.includes("heat")) {
      return "heating";
    }
  }
  if (/cool|airco|ac\b|air_condition/i.test(entityId || "")) {
    return "cooling";
  }
  if (/heat|heater|radiator|boiler/i.test(entityId || "")) {
    return "heating";
  }
  return "";
}

// Interprets simple template placeholders in tooltip / badge strings.
// Supported tokens (no eval, just text substitution):
//   {{entity}}  → first entity_id referenced by the `when` rule
//   {{state}}   → raw state of that entity
//   {{value}}   → numeric representative value, if any
//   {{attr.X}}  → attributes.X of that entity
function renderIndicatorTemplate(template, representative) {
  if (!template || typeof template !== "string") return "";
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => {
    if (key === "entity") return representative.entityId || "";
    if (key === "state") return representative.raw == null ? "" : String(representative.raw);
    if (key === "value") return representative.value == null ? "" : String(representative.value);
    if (key.startsWith("attr.")) {
      const path = key.slice(5);
      const v = getAttrPath(representative.stateObj, path);
      return v == null ? "" : String(v);
    }
    return "";
  });
}

function buildIndicatorModel(hass, config, indicator, ctx) {
  const display = indicator.display || normalizeDisplay(null, null);
  // Prefer the cached eval populated by `_refreshTrueSince`: it was just
  // computed seconds ago against the same hass snapshot, so re-running
  // `evaluateIndicatorRaw` + the rep-value walk here would be pure waste.
  const cached = ctx?.indicatorEval?.get(indicator.id);
  const repCandidates = ctx?.indicatorRepCandidates?.get(indicator.id);
  const representative = cached?.representative
    || getIndicatorRepresentativeValue(indicator, hass, repCandidates);
  const rawActive = cached
    ? cached.raw
    : evaluateIndicatorRaw(indicator, hass, ctx);
  // Apply `for_duration` gate using the card-level trueSince map.
  const duration = parseNumber(indicator.for_duration) ?? 0;
  let active = rawActive;
  if (rawActive && duration > 0 && ctx?.trueSince) {
    const since = ctx.trueSince.get(indicator.id);
    const now = ctx.now ? ctx.now.getTime() : Date.now();
    if (!since || (now - since) < duration * 1000) {
      active = false;
    }
  }

  // Display override precedence: first matching display_overrides entry
  // wins; unset fields fall back to the base display defaults.
  const override = pickDisplayOverride(display.display_overrides, representative, hass);
  const color = (override?.color) || display.color || "#43b581";
  const icon = (override?.icon) || display.icon || "mdi:circle";
  const iconSize = (override?.icon_size != null ? override.icon_size : display.icon_size);
  const size = (override?.size != null ? override.size : display.size);
  const animation = override?.animation || display.animation || "none";
  const animationSpeed = parseNumber(override?.animation_speed) ?? parseNumber(display.animation_speed) ?? 1;
  const inactive = override?.inactive || display.inactive || "hide";
  const dimOpacity = (override?.dim_opacity != null ? override.dim_opacity : null) ?? parseNumber(display.dim_opacity) ?? 0.3;
  const tooltipSrc = override?.tooltip || display.tooltip;
  const badgeSrc = override?.badge || display.badge;

  // Visibility rules:
  //   hide  → only show when active, otherwise drop from the DOM
  //   dim   → always render, fade when inactive
  //   show  → always render at full opacity
  const visible = active || inactive !== "hide";
  const dim = !active && inactive === "dim";

  const tooltipText = tooltipSrc
    ? renderIndicatorTemplate(tooltipSrc, representative)
    : (indicator.name || "");
  const badge = badgeSrc
    ? {
        text: renderIndicatorTemplate(badgeSrc.text || "", representative),
        color: badgeSrc.color || "",
      }
    : null;

  return {
    id: indicator.id,
    name: indicator.name || "",
    tooltip: tooltipText,
    icon,
    color,
    iconSize,
    size,
    animation,
    animationSpeed,
    inactive,
    dimOpacity,
    badge,
    active,
    visible,
    dim,
    entityId: representative.entityId || "",
    tap_action: indicator.tap_action,
    hold_action: indicator.hold_action,
  };
}

// Returns the icon to use for the card. Custom override wins; otherwise
// falls back to the first selected area's icon, then a generic default.
function getAreasIcon(areasMeta, config) {
  if (config.icon) return config.icon;
  for (const meta of areasMeta) {
    if (meta?.icon) return meta.icon;
  }
  return "mdi:home-group";
}

// Joins all selected area names with " + ". Custom title override wins.
function getAreasTitle(areasMeta, config) {
  if (config.title) return config.title;
  const names = areasMeta.filter(Boolean).map((meta) => getAreaName(meta));
  return names.join(" + ") || "Area";
}

function buildCardModel(hass, registry, config, ctx) {
  const areaIds = getConfigAreaIds(config);
  const areasMeta = areaIds.map((id) => getAreaMeta(registry, id));
  // Compute the area entity list once and share it across all chips.
  // Prefer a precomputed list from the card (cached across renders) to
  // avoid re-scanning `hass.states` for every hass tick.
  const areaEntityIds = ctx?.areaEntityIds || getAreasEntityIds(hass, registry, areaIds);
  const chips = config.chips
    .map((chip) => buildChipModel(hass, registry, config, chip, areaEntityIds))
    .filter((chip) => chip.visible);
  const indicators = config.activity_indicators
    .map((indicator) => buildIndicatorModel(hass, config, indicator, ctx))
    .filter((indicator) => indicator.visible);
  const styling = config.styling || normalizeStyling({});
  return {
    title: getAreasTitle(areasMeta, config),
    icon: getAreasIcon(areasMeta, config),
    iconStyle: config.icon_style || "plain",
    showTitle: styling.show_title !== false,
    showIcon: styling.show_icon !== false,
    styling,
    chips,
    indicators,
    tap_action: config.tap_action || { action: "none" },
    hold_action: config.hold_action || { action: "none" },
  };
}

// Lightweight fingerprint for snapshot-based change detection. Captures
// exactly the fields that affect the rendered DOM — nothing more. Avoids
// JSON.stringify which allocates large intermediate strings and traverses
// every nested object (tap_action, hold_action, entityIds, etc.) that
// have no effect on the visual output.
function buildModelFingerprint(model) {
  let fp = `${model.title}\t${model.icon}\t${model.iconStyle}\t${model.showTitle}\t${model.showIcon}\n`;
  for (let i = 0; i < model.chips.length; i++) {
    const c = model.chips[i];
    fp += `${c.id}\t${c.icon}\t${c.text}\t${c.color}\t${c.active}\n`;
  }
  fp += "|\n";
  for (let i = 0; i < model.indicators.length; i++) {
    const ind = model.indicators[i];
    const badgeKey = ind.badge ? `${ind.badge.text}/${ind.badge.color}` : "";
    fp += `${ind.id}\t${ind.icon}\t${ind.color}\t${ind.iconSize}\t${ind.size}\t${ind.animation}\t${ind.animationSpeed}\t${ind.active}\t${ind.dim}\t${ind.tooltip}\t${badgeKey}\n`;
  }
  return fp;
}

function availableAreaEntityIds(hass, registry, areaIds) {
  return getAreasEntityIds(hass, registry, areaIds).filter((entityId) => hass.states[entityId]);
}

function getChipCandidates(hass, registry, areaIds, type) {
  return sortByLabel(availableAreaEntityIds(hass, registry, areaIds), (entityId) => getEntityLabel(hass, entityId)).filter((entityId) => {
    const stateObj = hass.states[entityId];
    if (!stateObj) {
      return false;
    }
    return type !== "custom" && chipEntityMatchesType(type, entityId, stateObj);
  });
}

// Entity selectors in the editor offer the entities of the card's areas (plus
// anything already selected) and, with the "Show all entities" switch on, all
// entities. `entityPickerList` returns the `include_entities` list for such a
// selector, or null when it should not be restricted at all.
//   areaEntityIds  Set of the entities in the card's areas, or null when unknown
//   filter         optional (entityId, stateObj, showAll) => boolean, applies in both modes
const SHOW_ALL_FIELD = "show_all_entities";

// Domains `getIndicatorDefaults` has a ready-made rule and look for. The
// "add indicator" picker offers all of them.
const INDICATOR_DOMAINS = new Set([
  "binary_sensor", "light", "switch", "input_boolean", "fan", "media_player", "camera", "vacuum",
  "cover", "weather", "climate", "lock", "person", "device_tracker", "sensor",
]);

function entityPickerList({ states, areaEntityIds, showAll, selected, filter }) {
  const keep = (entityId) => !filter || filter(entityId, states?.[entityId], Boolean(showAll));
  const chosen = (selected || []).filter(Boolean);
  if (showAll || !areaEntityIds) {
    if (!filter) return null;
    return unique([...Object.keys(states || {}).filter(keep), ...chosen]);
  }
  return unique([...Array.from(areaEntityIds).filter((entityId) => states?.[entityId] && keep(entityId)), ...chosen]);
}

class AdvancedAreaCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement("advanced-area-card-editor");
  }

  static getStubConfig() {
    return normalizeConfig({
      type: DEFAULT_CARD_TYPE,
      chips: [],
      activity_indicators: [],
    });
  }

  static get properties() {
    return {};
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = null;
    this._hass = null;
    this._registry = null;
    this._lastSnapshot = null;
    this._lastBranch = null;
    // Rule engine bookkeeping.
    this._indicatorDeps = new Map();   // entity_id -> Set<indicator_id>
    this._indicatorEntityIds = new Map(); // indicator_id -> Array<entity_id> (cached rule deps)
    this._indicatorRepCandidates = new Map(); // indicator_id -> [{id, attr}] (cached rep walk)
    this._indicatorEval = new Map();   // indicator_id -> { raw, representative } (last eval)
    this._timeIndicators = new Set();  // indicator ids whose rules depend on time-of-day
    this._trueSince = new Map();       // indicator_id -> ms timestamp since which raw rule has been true
    this._forTimers = new Map();       // indicator_id -> setTimeout id waking up when `for_duration` elapses
    this._timeTickerId = null;
    this._registryLoading = false;
    this._registryRetryTimer = null;
    this._unwatchRegistry = null;
    this._stateCount = { ref: null, n: 0 }; // memoised key count of hass.states
    // Event delegation: single set of listeners on the shadow root.
    this._modelIndex = new Map();      // "kind:id" -> modelItem
    this._delegationBound = false;
    // Persistent shadow-DOM shell. The <style>, <ha-card> and content
    // wrapper are created once and reused; re-renders only replace the
    // wrapper's innerHTML. Wiping the whole shadow root would also wipe
    // <style> nodes injected by theming tools (card-mod), which is how
    // transparent-card themes lose their background after a re-render.
    this._styleEl = null;
    this._cardEl = null;
    this._contentEl = null;
    // Perf: watched-entities cache. Only re-render / re-evaluate when
    // entities the card actually cares about changed. Invalidated only
    // when setConfig runs or the registry reference changes.
    this._watchedExplicit = new Set(); // indicator rule deps + custom chip entities
    this._watchedAreaIds = new Set();  // configured area ids
    this._watchedAreaEntities = null;  // lazy Set<entity_id> — entities in watched areas
    this._watchedAreaKey = null;       // invalidation key for the above
    this._areaEntityIdsArray = null;   // Array<entity_id> fed to buildCardModel
  }

  disconnectedCallback() {
    if (this._timeTickerId !== null) {
      clearInterval(this._timeTickerId);
      this._timeTickerId = null;
    }
    for (const id of this._forTimers.values()) clearTimeout(id);
    this._forTimers.clear();
    if (this._registryRetryTimer !== null) {
      clearTimeout(this._registryRetryTimer);
      this._registryRetryTimer = null;
    }
    this._stopRegistryWatch();
    // A press in progress must not fire its hold action after the card left
    // the DOM.
    if (this._press) {
      clearTimeout(this._press.timer);
      this._press = null;
    }
    this._pendingTap = null;
  }

  // Follow registry changes (renamed areas, moved devices, ...) while the
  // card is attached; the subscription is shared between all instances.
  _startRegistryWatch() {
    if (this._unwatchRegistry || !this._hass || !this.isConnected) return;
    this._unwatchRegistry = watchRegistry(this._hass, (registry) => {
      this._registry = registry;
      this._watchedAreaKey = null;
      this._watchedAreaEntities = null;
      this._areaEntityIdsArray = null;
      this.render();
    });
  }

  _stopRegistryWatch() {
    if (this._unwatchRegistry) {
      this._unwatchRegistry();
      this._unwatchRegistry = null;
    }
  }

  // Load the registry once; concurrent callers share the in-flight load and
  // a failed load is retried after a delay rather than on every hass update.
  _loadRegistry() {
    if (this._registry || this._registryLoading || this._registryRetryTimer !== null || !this._hass) return;
    this._registryLoading = true;
    ensureRegistry(this._hass).then((registry) => {
      this._registryLoading = false;
      if (registry.failed) {
        if (this.isConnected) {
          this._registryRetryTimer = setTimeout(() => {
            this._registryRetryTimer = null;
            this._loadRegistry();
          }, REGISTRY_RETRY_MS);
        }
        return;
      }
      this._registry = registry;
      this._watchedAreaKey = null;
      this._watchedAreaEntities = null;
      this._areaEntityIdsArray = null;
      this.render();
    });
  }

  // Number of keys in hass.states without allocating a key array. HA swaps
  // the states object on every change, so the count of the previous event is
  // reused as "prev" for the next one and shared with render().
  _getStateCount(states) {
    if (this._stateCount.ref === states) return this._stateCount.n;
    let n = 0;
    for (const _id in states) n++;
    this._stateCount = { ref: states, n };
    return n;
  }

  setConfig(config) {
    this._config = normalizeConfig(config);
    this._lastSnapshot = null;
    this._lastBranch = null;
    this._rebuildIndicatorDependencies();
    this._rebuildWatchedSets();
    this._pruneIndicatorState();
    this._updateTimeTicker();
    // Rebuild the cached rule evaluation (cleared above) and re-arm any
    // `for_duration` timers for the new config.
    if (this._hass) this._refreshTrueSince(null);
    this.render();
  }

  // Drop `for_duration` bookkeeping of indicators that are no longer in the
  // config, so removed indicators don't keep stale timers or timestamps.
  _pruneIndicatorState() {
    const ids = new Set((this._config?.activity_indicators || []).map((indicator) => indicator.id));
    for (const id of [...this._trueSince.keys()]) {
      if (!ids.has(id)) this._trueSince.delete(id);
    }
    for (const id of [...this._forTimers.keys()]) {
      if (!ids.has(id)) this._clearForTimer(id);
    }
  }

  set hass(hass) {
    const prevHass = this._hass;
    this._hass = hass;
    this._startRegistryWatch();
    if (!this._registry) {
      // Kick off registry load (one-time). First paint happens below.
      this._loadRegistry();
      this._refreshTrueSince(prevHass);
      this.render();
      return;
    }
    // Identify the subset of watched entities that actually changed. If
    // none changed, the rendered output cannot have changed either (time
    // rules are re-evaluated by the ticker) — skip the entire render path.
    // This turns a hot "runs on every HA state event" code path into a
    // cheap Map/Set lookup when the event doesn't touch anything we
    // care about.
    const changed = this._collectChangedWatchedEntities(prevHass, hass);
    if (changed === null) {
      // Full-refresh signal (first render, states count changed, etc.).
      this._refreshTrueSince(prevHass);
      this.render();
      return;
    }
    if (changed.size === 0) {
      return; // Nothing relevant changed; time rules are driven by the ticker.
    }
    this._refreshTrueSince(prevHass, changed);
    this.render();
  }

  // Compute the set of watched entities that changed between two hass
  // snapshots. Returns `null` to signal a full refresh is required
  // (first hass, entity added/removed, registry not yet loaded).
  _collectChangedWatchedEntities(prevHass, hass) {
    if (!prevHass || !hass?.states) return null;
    // New/removed entities in hass.states invalidate the area-entity
    // cache and force a full refresh (chip output for area-based chips
    // can change without an existing entity mutating).
    const prevStates = prevHass.states || {};
    const prevCount = this._getStateCount(prevStates);
    const nextCount = this._getStateCount(hass.states);
    if (prevCount !== nextCount) {
      this._watchedAreaKey = null;
      this._watchedAreaEntities = null;
      this._areaEntityIdsArray = null;
      return null;
    }
    const changed = new Set();
    for (const id of this._watchedExplicit) {
      if (prevStates[id] !== hass.states[id]) changed.add(id);
    }
    const areaEntities = this._ensureWatchedAreaEntities();
    if (areaEntities) {
      for (const id of areaEntities) {
        if (prevStates[id] !== hass.states[id]) changed.add(id);
      }
    }
    return changed;
  }

  // Resolve the set of entities in the configured areas. Cached by
  // (registry identity, area ids, state key-count) — rebuilt only when
  // the registry reloads, the config changes, or an entity is
  // added/removed from hass.states.
  _ensureWatchedAreaEntities() {
    if (!this._registry || !this._hass || this._watchedAreaIds.size === 0) {
      return null;
    }
    ensureRegistryMaps(this._registry);
    const map = registryMaps.entityToArea;
    if (!map) return null;
    const stateKeyCount = this._getStateCount(this._hass.states);
    const areaJoin = [...this._watchedAreaIds].sort().join(",");
    const key = `${registryMaps.ref ? "r" : "n"}:${areaJoin}:${stateKeyCount}`;
    if (this._watchedAreaKey === key && this._watchedAreaEntities) {
      return this._watchedAreaEntities;
    }
    const areaIds = this._watchedAreaIds;
    const set = new Set();
    for (const entityId in this._hass.states) {
      const areaId = map.get(entityId);
      if (areaId && areaIds.has(areaId)) set.add(entityId);
    }
    this._watchedAreaEntities = set;
    this._watchedAreaKey = key;
    this._areaEntityIdsArray = null; // derived list is stale
    return set;
  }

  // Build (and cache) the Array<entity_id> passed into buildCardModel,
  // so render() doesn't iterate `Object.keys(hass.states)` every tick.
  _getAreaEntityIdsForRender() {
    const set = this._ensureWatchedAreaEntities();
    if (!set) return [];
    if (!this._areaEntityIdsArray) {
      this._areaEntityIdsArray = Array.from(set);
    }
    return this._areaEntityIdsArray;
  }

  // Recompute the entity_id -> indicator_id dependency index and the set
  // of indicators that rely on time-of-day conditions. Called whenever
  // the config changes; cheap (O(rules)) and never runs on hot paths.
  _rebuildIndicatorDependencies() {
    this._indicatorDeps = new Map();
    this._indicatorEntityIds = new Map();
    this._indicatorRepCandidates = new Map();
    this._indicatorEval = new Map();
    this._timeIndicators = new Set();
    for (const indicator of (this._config?.activity_indicators || [])) {
      // Cache the rule-entity list per indicator so `_refreshTrueSince`
      // doesn't re-walk the rule tree on every hass tick.
      const entityIds = Array.from(collectIndicatorEntityIds(indicator));
      this._indicatorEntityIds.set(indicator.id, entityIds);
      // Cache the representative-value candidate walk for the same
      // reason — used by `buildIndicatorModel` on every render.
      this._indicatorRepCandidates.set(indicator.id, collectIndicatorRepCandidates(indicator));
      for (const entityId of entityIds) {
        if (!this._indicatorDeps.has(entityId)) {
          this._indicatorDeps.set(entityId, new Set());
        }
        this._indicatorDeps.get(entityId).add(indicator.id);
      }
      if (indicatorHasTime(indicator)) {
        this._timeIndicators.add(indicator.id);
      }
    }
  }

  // Rebuild the watched-entity sets from the current config. Called only
  // on setConfig (and implicitly when the registry ref changes via the
  // cache key in `_ensureWatchedAreaEntities`).
  _rebuildWatchedSets() {
    const cfg = this._config;
    this._watchedExplicit = new Set();
    this._watchedAreaIds = new Set();
    this._watchedAreaEntities = null;
    this._watchedAreaKey = null;
    this._areaEntityIdsArray = null;
    if (!cfg) return;
    // Every entity referenced by an indicator rule.
    for (const list of this._indicatorEntityIds.values()) {
      for (const id of list) this._watchedExplicit.add(id);
    }
    // Custom-entity chips reference explicit ids; area-based chips are
    // covered by the area-entity set computed lazily at hass time.
    for (const chip of (cfg.chips || [])) {
      if (chip?.use_custom_entities && Array.isArray(chip.entity_ids)) {
        for (const id of chip.entity_ids) this._watchedExplicit.add(id);
      }
    }
    for (const id of getConfigAreaIds(cfg)) this._watchedAreaIds.add(id);
  }

  // A single shared 30 s ticker for time-of-day rules — only armed when
  // at least one indicator actually needs it.
  _updateTimeTicker() {
    const needed = this._timeIndicators.size > 0;
    if (needed && this._timeTickerId === null) {
      this._timeTickerId = setInterval(() => {
        // Re-evaluate time rules (cached eval would otherwise go stale).
        this._refreshTrueSince(this._hass);
        this.render();
      }, 30000);
    } else if (!needed && this._timeTickerId !== null) {
      clearInterval(this._timeTickerId);
      this._timeTickerId = null;
    }
  }

  // Recompute the "raw rule has been true since ..." map, scheduling a
  // wake-up timer when the rule becomes true but has a `for_duration`
  // gate that's not yet satisfied. When `changedSet` is provided, only
  // indicators whose cached dependency list intersects that set (or
  // which depend on time-of-day) are re-evaluated.
  _refreshTrueSince(prevHass, changedSet) {
    if (!this._hass || !this._config) return;
    const indicators = this._config.activity_indicators || [];
    const now = Date.now();
    const ctx = { now: new Date(now), trueSince: this._trueSince };
    for (const indicator of indicators) {
      // Fast path: if none of its entities changed and it has no time
      // rules, skip re-evaluation. When a precomputed changedSet is
      // available we do an O(deps) intersection; otherwise we fall back
      // to comparing state object identities (HA reuses the same object
      // reference for entities whose state didn't change).
      let changed = false;
      if (prevHass) {
        if (this._timeIndicators.has(indicator.id)) {
          changed = true;
        } else {
          const deps = this._indicatorEntityIds.get(indicator.id) || [];
          if (changedSet) {
            for (const id of deps) {
              if (changedSet.has(id)) { changed = true; break; }
            }
          } else {
            for (const id of deps) {
              if (prevHass.states?.[id] !== this._hass.states?.[id]) {
                changed = true;
                break;
              }
            }
          }
        }
      } else {
        changed = true;
      }
      if (!changed) continue;
      const raw = evaluateIndicatorRaw(indicator, this._hass, ctx);
      // Cache raw + representative so the subsequent render doesn't
      // redo the same work against the same hass snapshot.
      const repCandidates = this._indicatorRepCandidates.get(indicator.id);
      const representative = getIndicatorRepresentativeValue(indicator, this._hass, repCandidates);
      this._indicatorEval.set(indicator.id, { raw, representative });
      if (raw) {
        if (!this._trueSince.has(indicator.id)) {
          this._trueSince.set(indicator.id, now);
        }
        const duration = parseNumber(indicator.for_duration) ?? 0;
        if (duration > 0) {
          const remaining = Math.max(0, (duration * 1000) - (now - this._trueSince.get(indicator.id)));
          if (remaining > 0) this._scheduleForTimer(indicator.id, remaining);
          else this._clearForTimer(indicator.id);
        }
      } else {
        this._trueSince.delete(indicator.id);
        this._clearForTimer(indicator.id);
      }
    }
  }

  _scheduleForTimer(indicatorId, ms) {
    this._clearForTimer(indicatorId);
    const timer = setTimeout(() => {
      this._forTimers.delete(indicatorId);
      this.render();
    }, ms);
    this._forTimers.set(indicatorId, timer);
  }

  _clearForTimer(indicatorId) {
    const existing = this._forTimers.get(indicatorId);
    if (existing) {
      clearTimeout(existing);
      this._forTimers.delete(indicatorId);
    }
  }

  getCardSize() {
    return 3;
  }

  // Sections dashboard: full width by default (12-column grid), height
  // follows the content because chips and indicators can wrap.
  getGridOptions() {
    return {
      columns: 12,
      rows: "auto",
      min_columns: 6,
    };
  }

  connectedCallback() {
    // disconnectedCallback cleared the ticker and `for_duration` timers;
    // re-arm them, otherwise those indicators stay stuck until a watched
    // entity changes.
    this._updateTimeTicker();
    this._startRegistryWatch();
    if (this._config && this._hass) {
      this._refreshTrueSince(null);
      this._loadRegistry();
    }
    this.render();
  }

  // Returns the persistent content wrapper inside <ha-card>, creating the
  // <style> + <ha-card> shell on first use. Nodes added to the shadow root
  // or ha-card by third parties (e.g. card-mod theme styles) are left
  // untouched across re-renders because we never rewrite their parents.
  _ensureShell() {
    if (!this._styleEl || this._styleEl.parentNode !== this.shadowRoot) {
      this._styleEl = document.createElement("style");
      this._styleEl.textContent = this.styles();
      this.shadowRoot.appendChild(this._styleEl);
    }
    if (!this._cardEl || this._cardEl.parentNode !== this.shadowRoot) {
      this._cardEl = document.createElement("ha-card");
      this.shadowRoot.appendChild(this._cardEl);
      this._contentEl = null;
    }
    if (!this._contentEl || this._contentEl.parentNode !== this._cardEl) {
      this._contentEl = document.createElement("div");
      this._cardEl.appendChild(this._contentEl);
    }
    return this._contentEl;
  }

  render() {
    if (!this.shadowRoot) {
      return;
    }
    if (!this._config) {
      if (this._lastBranch !== "empty") {
        if (this._cardEl && this._cardEl.parentNode === this.shadowRoot) {
          this.shadowRoot.removeChild(this._cardEl);
        }
        this._cardEl = null;
        this._contentEl = null;
        this._lastBranch = "empty";
        this._lastSnapshot = null;
      }
      return;
    }
    // Show the demo preview whenever no area is configured. This makes the
    // dashboard "Add card" picker render a meaningful sample, and does not
    // depend on hass being ready.
    if (!getConfigAreaIds(this._config).length) {
      const demoKey = `demo:${this._config.icon_style || "plain"}`;
      if (this._lastBranch === "demo" && this._lastSnapshot === demoKey) {
        return;
      }
      this.renderDemoPreview();
      this._lastBranch = "demo";
      this._lastSnapshot = demoKey;
      return;
    }
    if (!this._hass) {
      if (this._lastBranch !== "wait-hass") {
        this._ensureShell().innerHTML = `<div class="state">Waiting for Home Assistant state.</div>`;
        this._lastBranch = "wait-hass";
        this._lastSnapshot = null;
      }
      return;
    }
    if (!this._registry) {
      if (this._lastBranch !== "wait-registry") {
        this._ensureShell().innerHTML = `<div class="state">Loading area registry…</div>`;
        this._lastBranch = "wait-registry";
        this._lastSnapshot = null;
      }
      return;
    }

    const model = buildCardModel(this._hass, this._registry, this._config, {
      now: new Date(),
      trueSince: this._trueSince,
      areaEntityIds: this._getAreaEntityIdsForRender(),
      indicatorEval: this._indicatorEval,
      indicatorRepCandidates: this._indicatorRepCandidates,
    });
    // Snapshot diffing: most state events from Home Assistant don't touch
    // anything we render. Build a lightweight fingerprint of the visible
    // model and skip the entire innerHTML rebuild when nothing has changed.
    // A targeted string concat is vastly cheaper than JSON.stringify on the
    // full model object (which also allocates many intermediate strings).
    const snapshot = buildModelFingerprint(model);
    if (this._lastBranch === "card" && this._lastSnapshot === snapshot) {
      return;
    }
    this._lastBranch = "card";
    this._lastSnapshot = snapshot;
    const chipMarkup = model.chips.length
      ? model.chips
          .map((chip) => `
            <button
              class="chip ${chip.active ? "chip-active" : "chip-inactive"}"
              data-interactive="true"
              data-kind="chip"
              data-id="${htmlEscape(chip.id)}"
              title="${htmlEscape(chip.label)}"
              aria-label="${htmlEscape(`${chip.label}: ${chip.text}`)}"
            >
              <ha-icon class="chip-icon" icon="${htmlEscape(chip.icon)}"></ha-icon>
              <span class="chip-text">${htmlEscape(chip.text)}</span>
            </button>
          `)
          .join("")
      : `<div class="state-empty">No visible chips configured for this area.</div>`;

    const indicatorMarkup = model.indicators
      .map((indicator) => {
        const styleParts = [`--indicator-color:${resolveColor(indicator.color)}`];
        if (indicator.iconSize) {
          styleParts.push(`--aac-indicator-icon-size:${indicator.iconSize}px`);
        }
        if (indicator.size) {
          styleParts.push(`--aac-indicator-size:${indicator.size}px`);
        }
        // Animation speed is a multiplier — 1 = base, 0.5 = twice as fast.
        const speed = indicator.animationSpeed || 1;
        styleParts.push(`--aac-indicator-anim-duration:${(2.4 / Math.max(speed, 0.1)).toFixed(2)}s`);
        if (!indicator.active && indicator.dim) {
          styleParts.push(`--aac-indicator-dim-opacity:${indicator.dimOpacity}`);
        }
        const classList = ["indicator"];
        if (indicator.animation && indicator.animation !== "none" && indicator.active) {
          classList.push(`indicator--anim-${indicator.animation}`);
        }
        if (indicator.dim) classList.push("indicator--dim");
        if (!indicator.active && indicator.inactive === "show") classList.push("indicator--inactive-show");
        const badgeMarkup = indicator.badge && indicator.badge.text
          ? `<span class="indicator__badge" style="${indicator.badge.color ? `background:${htmlEscape(resolveColor(indicator.badge.color))}` : ""}">${htmlEscape(indicator.badge.text)}</span>`
          : "";
        const tooltip = indicator.tooltip || indicator.name || "";
        return `
        <button
          class="${classList.join(" ")}"
          data-interactive="true"
          data-kind="indicator"
          data-id="${htmlEscape(indicator.id)}"
          style="${htmlEscape(styleParts.join(";"))}"
          title="${htmlEscape(tooltip)}"
          ${tooltip ? `aria-label="${htmlEscape(tooltip)}"` : ""}
        >
          <ha-icon class="indicator-icon" icon="${htmlEscape(indicator.icon)}"></ha-icon>
          ${badgeMarkup}
        </button>
      `;
      })
      .join("");

    const cardHasAction =
      (model.tap_action && model.tap_action.action && model.tap_action.action !== "none") ||
      (model.hold_action && model.hold_action.action && model.hold_action.action !== "none");

    const styleVars = buildStyleVars(model.styling);
    const titleGroup = (model.showIcon || model.showTitle)
      ? `
            <div class="title-group" ${cardHasAction ? `data-card-action="true" tabindex="0" role="button" aria-label="${htmlEscape(model.title)}"` : ""}>
              ${model.showIcon ? `
                <div class="area-icon area-icon-${htmlEscape(model.iconStyle)}">
                  <ha-icon icon="${htmlEscape(model.icon)}"></ha-icon>
                </div>
              ` : ""}
              ${model.showTitle ? `<div class="title-text">${htmlEscape(model.title)}</div>` : ""}
            </div>
          `
      : "";

    this._ensureShell().innerHTML = `
      <div class="card-shell ${cardHasAction ? "card-clickable" : ""}" style="${htmlEscape(styleVars)}" ${cardHasAction ? `data-interactive="true" data-kind="card"` : ""}>
        <div class="header-row">
          ${titleGroup}
          <div class="indicator-row">${indicatorMarkup}</div>
        </div>
        <div class="chip-row">${chipMarkup}</div>
      </div>
    `;

    // Update the shared action-index: a single Map<"kind:id", modelItem>
    // consulted by the delegated listeners on the shadow root. Avoids
    // allocating three closures per interactive element on every render.
    this._modelIndex.clear();
    for (const chip of model.chips) this._modelIndex.set(`chip:${chip.id}`, chip);
    for (const ind of model.indicators) this._modelIndex.set(`indicator:${ind.id}`, ind);
    if (cardHasAction) {
      this._modelIndex.set("card:", {
        tap_action: model.tap_action,
        hold_action: model.hold_action,
      });
    }
    this._bindDelegation();
    // Chips still need per-element CSS vars applied after the
    // innerHTML rebuild — this is cheap and targeted.
    this.shadowRoot.querySelectorAll(".chip[data-kind='chip']").forEach((element) => {
      const chip = this._modelIndex.get(`chip:${element.dataset.id}`);
      if (!chip) return;
      element.style.setProperty("--chip-color", resolveColor(chip.color));
      element.style.setProperty("--chip-muted-color", resolveColor(chip.mutedColor));
    });
  }

  // After a hold action the finger is still down, and the click that follows
  // the release would land on whatever the action opened (a navigate shows
  // another page under the finger). Eat exactly that click. A new press
  // (pointerdown) or a timeout ends the guard so a real click is never lost.
  _swallowNextClick() {
    if (this._unswallow) this._unswallow();
    const eat = (event) => {
      event.stopImmediatePropagation();
      event.preventDefault();
      done();
    };
    const done = () => {
      window.removeEventListener("click", eat, true);
      window.removeEventListener("pointerdown", done, true);
      clearTimeout(timer);
      this._unswallow = null;
    };
    const timer = window.setTimeout(done, SWALLOW_CLICK_MAX_MS);
    window.addEventListener("click", eat, true);
    window.addEventListener("pointerdown", done, true);
    this._unswallow = done;
  }

  // Runs the tap or hold action of a chip / indicator / the card. A chip or
  // indicator whose action is "none" has no action of its own, so the press
  // goes to the card's action for the same gesture (like a click that
  // bubbles up to the card).
  _runGesture(cfg, gesture) {
    const isNone = (action) => !action || !action.action || action.action === "none";
    const own = cfg[gesture];
    if (!isNone(own)) {
      this.handleAction(own, cfg.entityIds?.[0] || cfg.entityId);
      return;
    }
    const cardCfg = this._modelIndex.get("card:");
    if (cardCfg && cardCfg !== cfg && !isNone(cardCfg[gesture])) {
      this.handleAction(cardCfg[gesture]);
    }
  }

  // Keyboard and assistive-technology activation of the card: its tap action,
  // or its hold action when it only has that one (so it stays reachable).
  _runCardKeyboardAction(cardCfg) {
    const isNone = (action) => !action || !action.action || action.action === "none";
    this._runGesture(cardCfg, isNone(cardCfg.tap_action) && !isNone(cardCfg.hold_action) ? "hold_action" : "tap_action");
  }

  // Attach one set of pointer listeners to the shadow root; they dispatch
  // to the interactive element found by walking the composed path. Runs
  // once per card lifetime — no per-render closure allocation.
  _bindDelegation() {
    if (this._delegationBound) return;
    this._delegationBound = true;
    const root = this.shadowRoot;
    const findTarget = (event) => {
      const path = event.composedPath();
      for (const node of path) {
        if (node.nodeType === 1 && node.dataset?.interactive === "true") return node;
      }
      return null;
    };
    // One press at a time, remembered by what the finger went DOWN on.
    //
    // The TAP action runs from the `click` that follows the press, not from
    // pointerup. A tap on a touch screen produces pointerup first and a click
    // a moment later at the same screen position. If the tap action navigates
    // on pointerup, the new page is already showing when that click arrives,
    // so it lands on whatever sits under the finger there (a light card, a
    // lock dialog, ...). Running the action from the click itself means
    // nothing follows it.
    //
    // The HOLD action runs from a timer while the finger is still down. The
    // click that follows the release would hit the new page in the same way,
    // so that one click is swallowed (see _swallowNextClick).
    const clearPress = () => {
      if (this._press) clearTimeout(this._press.timer);
      this._press = null;
    };
    root.addEventListener("pointerdown", (event) => {
      if (event.isPrimary === false) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      const element = findTarget(event);
      if (!element) return;
      const kind = element.dataset.kind;
      const key = `${kind}:${element.dataset.id || ""}`;
      if (!this._modelIndex.get(key)) return;
      event.preventDefault();
      if (kind === "chip" || kind === "indicator") event.stopPropagation();
      clearPress();
      this._pendingTap = null;
      const press = { key, kind, held: false, cancelled: false, x: event.clientX, y: event.clientY, id: event.pointerId, timer: 0 };
      press.timer = window.setTimeout(() => {
        press.held = true;
        // Look the config up again: a re-render may have replaced the model.
        const cfg = this._modelIndex.get(key);
        if (!cfg) return;
        const hold = cfg.hold_action;
        const own = hold && hold.action && hold.action !== "none";
        const cardCfg = this._modelIndex.get("card:");
        const cardHold = cardCfg && cardCfg !== cfg ? cardCfg.hold_action : null;
        if (own || (cardHold && cardHold.action && cardHold.action !== "none")) this._swallowNextClick();
        this._runGesture(cfg, "hold_action");
      }, ACTION_HOLD_DELAY);
      this._press = press;
    });
    // A finger that travels (scrolling, a sloppy tap) is not a tap or a hold.
    root.addEventListener("pointermove", (event) => {
      const press = this._press;
      if (!press || press.cancelled || event.pointerId !== press.id) return;
      if (Math.hypot(event.clientX - press.x, event.clientY - press.y) > PRESS_MOVE_TOLERANCE) {
        press.cancelled = true;
        clearTimeout(press.timer);
      }
    });
    root.addEventListener("pointerup", (event) => {
      const press = this._press;
      if (!press || event.pointerId !== press.id) return;
      clearPress();
      if (press.kind === "chip" || press.kind === "indicator") event.stopPropagation();
      // Remember what was pressed; the click that follows runs the tap.
      this._pendingTap = press.held || press.cancelled ? null : { key: press.key, at: Date.now() };
    });
    const cancel = (event) => {
      const press = this._press;
      if (!press || event.pointerId !== press.id) return;
      clearPress();
      this._pendingTap = null;
    };
    root.addEventListener("pointercancel", cancel);
    // Tap action. Keyboard (Enter/Space) and assistive technology send a click
    // with detail 0; a finger or mouse sends detail >= 1 after pointerup.
    root.addEventListener("click", (event) => {
      const element = findTarget(event);
      if (!element) return;
      const pending = this._pendingTap;
      this._pendingTap = null;
      if (event.detail !== 0) {
        // Pointer click: only valid right after a press that was a plain tap
        // (not a hold, not a scroll).
        if (!pending || Date.now() - pending.at > PENDING_TAP_MS) return;
        const cfgPressed = this._modelIndex.get(pending.key);
        if (!cfgPressed) return;
        event.stopPropagation();
        if (pending.key.startsWith("card:")) this._runCardKeyboardAction(cfgPressed);
        else this._runGesture(cfgPressed, "tap_action");
        return;
      }
      const cfg = this._modelIndex.get(`${element.dataset.kind}:${element.dataset.id || ""}`);
      if (!cfg) return;
      event.stopPropagation();
      if (element.dataset.kind === "card") this._runCardKeyboardAction(cfg);
      else this._runGesture(cfg, "tap_action");
    });
    // Keyboard. Enter / Space on a chip or indicator is a click (tap action).
    // The card's own action: the header (icon and name) is the focus target
    // when the card has an action; Enter / Space runs its tap action.
    // Hold action: Shift+Enter, Shift+Space, the context-menu key or
    // Shift+F10 on a chip, indicator or the header.
    let holdKeyDown = false;
    root.addEventListener("keydown", (event) => {
      if (event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;
      const path = event.composedPath();
      const header = path.find((node) => node.nodeType === 1 && node.dataset?.cardAction === "true");
      const holdKey = ((event.key === "Enter" || event.key === " ") && event.shiftKey)
        || event.key === "ContextMenu" || (event.key === "F10" && event.shiftKey);
      if (holdKey) {
        const element = findTarget(event);
        if (!element) return;
        // The card shell is only a target through its focusable header.
        if (element.dataset.kind === "card" && !header) return;
        const cfg = this._modelIndex.get(`${element.dataset.kind}:${element.dataset.id || ""}`);
        if (!cfg) return;
        // Stops the browser from also sending a click (the tap action) and,
        // for the context-menu keys, from opening its own menu.
        event.preventDefault();
        holdKeyDown = event.key === " ";
        this._runGesture(cfg, "hold_action");
        return;
      }
      if ((event.key !== "Enter" && event.key !== " ") || !header) return;
      event.preventDefault(); // Space would scroll the page
      const cardCfg = this._modelIndex.get("card:");
      if (cardCfg) this._runCardKeyboardAction(cardCfg);
    });
    // A button is clicked when Space is released; swallow that click after a
    // Shift+Space hold (Shift may already be up by then).
    root.addEventListener("keyup", (event) => {
      if (event.key === " " && holdKeyDown) {
        holdKeyDown = false;
        event.preventDefault();
      }
    });
    root.addEventListener("contextmenu", (event) => {
      if (findTarget(event)) event.preventDefault();
    });
  }

  // Renders a hard-coded "Living Room" sample card so the dashboard's
  // "Add card" picker shows a meaningful preview before the user has
  // selected an area.
  renderDemoPreview() {
    const demoModel = {
      title: "Living Room",
      icon: "mdi:sofa",
      chips: [
        {
          id: "demo-lights", type: "lights", label: "Lights",
          icon: "mdi:lightbulb", text: "3", active: true, visible: true,
          color: "#f5c542", mutedColor: "rgba(255,255,255,0.38)",
        },
        {
          id: "demo-temperature", type: "temperature", label: "Temperature",
          icon: "mdi:thermometer", text: "18°C", active: true, visible: true,
          color: "#4fa3ff", mutedColor: "rgba(255,255,255,0.38)",
        },
        {
          id: "demo-humidity", type: "humidity", label: "Humidity",
          icon: "mdi:water-percent", text: "47%", active: true, visible: true,
          color: "#43b581", mutedColor: "rgba(255,255,255,0.38)",
        },
        {
          id: "demo-music", type: "music", label: "Music",
          icon: "mdi:speaker", text: "1", active: true, visible: true,
          color: "#43b581", mutedColor: "rgba(255,255,255,0.38)",
        },
      ],
      indicators: [
        { id: "demo-movement", label: "Movement", icon: "mdi:motion-sensor", color: "#ff9800" },
        { id: "demo-door", label: "Door", icon: "mdi:door-open", color: "#f5c542" },
      ],
    };

    const chipMarkup = demoModel.chips
      .map((chip) => `
        <button class="chip chip-active" tabindex="-1">
          <ha-icon class="chip-icon" icon="${htmlEscape(chip.icon)}"></ha-icon>
          <span class="chip-text">${htmlEscape(chip.text)}</span>
        </button>
      `)
      .join("");

    const indicatorMarkup = demoModel.indicators
      .map((indicator) => `
        <button
          class="indicator"
          tabindex="-1"
          style="--indicator-color:${htmlEscape(resolveColor(indicator.color))};"
          title="${htmlEscape(indicator.label || "")}"
        >
          <ha-icon class="indicator-icon" icon="${htmlEscape(indicator.icon)}"></ha-icon>
        </button>
      `)
      .join("");

    const iconStyle = this._config?.icon_style || "plain";
    this._ensureShell().innerHTML = `
      <div class="card-shell preview-shell">
        <div class="preview-banner">Preview</div>
        <div class="header-row">
          <div class="title-group">
            <div class="area-icon area-icon-${htmlEscape(iconStyle)}">
              <ha-icon icon="${htmlEscape(demoModel.icon)}"></ha-icon>
            </div>
            <div class="title-text">${htmlEscape(demoModel.title)}</div>
          </div>
          <div class="indicator-row">${indicatorMarkup}</div>
        </div>
        <div class="chip-row">${chipMarkup}</div>
      </div>
    `;

    this.shadowRoot.querySelectorAll(".chip").forEach((element, index) => {
      const chip = demoModel.chips[index];
      if (!chip) return;
      element.style.setProperty("--chip-color", resolveColor(chip.color));
      element.style.setProperty("--chip-muted-color", resolveColor(chip.mutedColor));
    });
  }

  styles() {
    // Cache the CSS string — it's static per class and never changes.
    if (AdvancedAreaCard._stylesCache) return AdvancedAreaCard._stylesCache;
    const css = `
      :host {
        display: block;
      }
      ha-card {
        overflow: hidden;
        border-radius: var(--ha-card-border-radius, 12px);
        background: var(--ha-card-background, var(--card-background-color));
        color: var(--primary-text-color);
        box-shadow: var(--ha-card-box-shadow);
      }
      .card-shell {
        position: relative;
        padding: 20px;
      }
      .card-shell.card-clickable {
        cursor: pointer;
      }
      .header-row {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
      }
      .title-group {
        display: flex;
        align-items: center;
        gap: 16px;
        min-width: 0;
      }
      /* Focusable header (card action by keyboard): a little padding so the
         focus ring does not hug the text, cancelled by the negative margin so
         the layout does not move, and the theme's card corner radius so the
         ring is rounded like the rest of the dashboard. */
      .title-group[data-card-action] {
        padding: 4px 8px;
        margin: -4px -8px;
        border-radius: var(--ha-card-border-radius, 12px);
      }
      .area-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .area-icon-boxed {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: var(--secondary-background-color);
        color: var(--aac-icon-color, var(--primary-color));
      }
      .area-icon-boxed ha-icon {
        --mdc-icon-size: var(--aac-icon-size, 24px);
      }
      .area-icon-plain {
        color: var(--aac-icon-color, var(--primary-text-color));
      }
      .area-icon-plain ha-icon {
        --mdc-icon-size: var(--aac-icon-size, ${DEFAULT_ICON_SIZE});
      }
      .title-text {
        font-size: var(--aac-title-size, ${DEFAULT_TITLE_SIZE});
        font-weight: 600;
        line-height: 1.2;
        color: var(--aac-title-color, var(--primary-text-color));
      }
      .indicator-row {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: var(--aac-indicator-gap, 8px);
        min-height: 40px;
        flex-wrap: wrap;
        margin-left: auto;
      }
      .indicator {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: var(--aac-indicator-size, 32px);
        height: var(--aac-indicator-size, 32px);
        border: none;
        border-radius: var(--aac-indicator-radius, 999px);
        background: color-mix(in srgb, var(--indicator-color) 18%, var(--secondary-background-color));
        color: var(--indicator-color);
        box-shadow: inset 0 0 0 1px var(--divider-color);
        cursor: pointer;
        transition: opacity 180ms ease;
      }
      .indicator-icon {
        --mdc-icon-size: var(--aac-indicator-icon-size, 16px);
      }
      .indicator--dim {
        opacity: var(--aac-indicator-dim-opacity, 0.3);
        filter: grayscale(30%);
      }
      .indicator--inactive-show {
        opacity: 1;
      }
      .indicator__badge {
        position: absolute;
        top: -4px;
        right: -4px;
        min-width: 14px;
        height: 14px;
        padding: 0 4px;
        border-radius: 999px;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        font-size: 9px;
        line-height: 14px;
        font-weight: 700;
        text-align: center;
        box-sizing: border-box;
        pointer-events: none;
      }
      .indicator--anim-spin .indicator-icon {
        animation: aac-spin var(--aac-indicator-anim-duration, 2.4s) linear infinite;
      }
      .indicator--anim-pulse {
        animation: aac-pulse var(--aac-indicator-anim-duration, 2.4s) ease-in-out infinite;
      }
      .indicator--anim-blink {
        animation: aac-blink var(--aac-indicator-anim-duration, 2.4s) steps(2, start) infinite;
      }
      .indicator--anim-bounce {
        animation: aac-bounce var(--aac-indicator-anim-duration, 2.4s) ease-in-out infinite;
      }
      .indicator--anim-shake .indicator-icon {
        animation: aac-shake var(--aac-indicator-anim-duration, 2.4s) ease-in-out infinite;
      }
      .chip-row {
        display: flex;
        gap: var(--aac-chips-gap, 5px);
        flex-wrap: wrap;
        margin-top: var(--aac-chips-margin, ${DEFAULT_CHIPS_MARGIN});
      }
      .chip {
        display: inline-flex;
        align-items: center;
        gap: var(--aac-chip-gap, 5px);
        border: none;
        border-radius: var(--aac-chip-radius, 15px);
        padding: var(--aac-chip-pt, 5px) var(--aac-chip-pr, 10px) var(--aac-chip-pb, 5px) var(--aac-chip-pl, 7px);
        min-width: var(--aac-chip-min-width, 30px);
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        cursor: pointer;
        box-shadow: inset 0 0 0 1px var(--divider-color);
      }
      .chip-active {
        background: color-mix(in srgb, var(--chip-color) 14%, var(--secondary-background-color));
      }
      .chip-inactive {
        opacity: 0.78;
      }
      .chip-icon {
        --mdc-icon-size: var(--aac-chip-icon-size, 20px);
        color: var(--chip-color, var(--state-icon-color));
      }
      .chip-inactive .chip-icon {
        color: var(--chip-muted-color, var(--disabled-text-color));
      }
      .chip-text {
        font-size: var(--aac-chip-text-size, 0.85714286rem);
        font-weight: 600;
        letter-spacing: 0.01em;
      }
      .state,
      .state-empty {
        padding: 20px;
        color: var(--secondary-text-color);
      }
      .preview-banner {
        display: inline-block;
        font-size: 0.68rem;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        padding: 2px 10px;
        border-radius: 999px;
        background: var(--secondary-background-color);
        color: var(--secondary-text-color);
        margin-bottom: 14px;
      }
      .chip:focus-visible,
      .indicator:focus-visible,
      .title-group[data-card-action]:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }
      @keyframes aac-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes aac-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.14); }
      }
      @keyframes aac-blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.25; }
      }
      @keyframes aac-bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
      }
      @keyframes aac-shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-2px) rotate(-6deg); }
        75% { transform: translateX(2px) rotate(6deg); }
      }
      @media (prefers-reduced-motion: reduce) {
        .indicator--anim-spin .indicator-icon,
        .indicator--anim-shake .indicator-icon,
        .indicator--anim-pulse,
        .indicator--anim-blink,
        .indicator--anim-bounce {
          animation: none;
        }
      }
      @media (max-width: 640px) {
        .card-shell {
          padding: 16px;
        }
      }
    `;
    AdvancedAreaCard._stylesCache = css;
    return css;
  }

  // Runs the action through Home Assistant's own action handler (the
  // documented `hass-action` event), so every action type, targets and
  // data, confirmations and the assist dialog behave exactly like they do
  // on built-in cards.
  handleAction(actionConfig, fallbackEntityId) {
    const action = normalizeAction(actionConfig);
    if (!this._hass || !action?.action || action.action === "none") {
      return;
    }
    // More-info and toggle act on the chip's / indicator's own entity unless
    // the action names another one.
    const entity = action.entity || fallbackEntityId;
    fireEvent(this, "hass-action", { config: { entity, tap_action: action }, action: "tap" });
  }
}

class AdvancedAreaCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = normalizeConfig({ type: DEFAULT_CARD_TYPE });
    this._hass = null;
    this._registry = null;
    this._registryLoaded = false;
    this._registryLoading = false;
    this._registryRetryTimer = null;
    this._previewTimer = null;
    this._pendingIndicatorCandidate = "";
    this._rendering = false;
    this._suppressEvents = false;
    this._selfEmitting = false;
    this._addingArea = false;
    this._resetArmed = null;         // pending "Click again to reset" of a threshold table
    this._showAllKeys = new Set();   // entity selectors with "Show all entities" on (editor session only)
    this._areaSetCache = null;
    this._boundClick = this.handleClick.bind(this);
    this._emittedJsons = [];
    this._unwatchRegistry = null;
  }

  connectedCallback() {
    if (!this._listenersBound) {
      this._listenersBound = true;
      this.shadowRoot.addEventListener("click", this._boundClick);
    }
    this._startRegistryWatch();
    this.render();
  }

  disconnectedCallback() {
    if (this._renderRAF) {
      cancelAnimationFrame(this._renderRAF);
      this._renderRAF = null;
    }
    if (this._listenersBound) {
      this.shadowRoot.removeEventListener("click", this._boundClick);
      this._listenersBound = false;
    }
    if (this._registryRetryTimer !== null) {
      clearTimeout(this._registryRetryTimer);
      this._registryRetryTimer = null;
    }
    if (this._previewTimer !== null) {
      clearTimeout(this._previewTimer);
      this._previewTimer = null;
    }
    if (this._unwatchRegistry) {
      this._unwatchRegistry();
      this._unwatchRegistry = null;
    }
    this._disarmReset();
    // Release references for GC; they'll be repopulated on reconnect.
    // `_registry` is kept together with `_registryLoaded` (it is the shared
    // module-level cache anyway); clearing only one left the editor with
    // an empty area list after a reattach.
    this._hass = null;
  }

  setConfig(config) {
    const normalized = normalizeConfig(config);
    // Avoid re-rendering when HA bounces our own emitted config back at us.
    // Without this, every keystroke in a text field triggers a full DOM rebuild,
    // which destroys the field mid-typing and causes focus/popup glitches.
    // Keep our own config object in both bounce cases: replacing it with the
    // normalized copy would re-sort the threshold table behind the user's
    // back (and shift which row an open field edits).
    if (this._selfEmitting) {
      return;
    }
    // Fast-path: HA bounces our own emit asynchronously. If we just
    // fired config-changed within the bounce window, treat this call as
    // the bounce and skip the full re-render. Cheaper than a deep
    // serialize+compare on every keystroke.
    if (this._configEmittedAt && (performance.now() - this._configEmittedAt) < 150) {
      return;
    }
    // External change (YAML edit, etc.). Fall back to serialized compare
    // so we don't rebuild when nothing actually changed.
    const serialized = JSON.stringify(normalized);
    if (this._emittedJsons.includes(serialized)) return;
    if (this._lastConfigJson === serialized) {
      this._config = normalized;
      return;
    }
    this._lastConfigJson = serialized;
    this._config = normalized;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this._startRegistryWatch();
    if (!this._registryLoaded) {
      this.render();
      this._loadRegistry();
    } else if (this._previewTimer === null) {
      // Post-registry: don't re-render the whole editor (would clobber
      // focus/scroll). Only refresh the indicator preview panels — those
      // are the only parts whose content depends on live hass state. HA
      // sends hass on every state event, so coalesce the refreshes.
      this._previewTimer = setTimeout(() => {
        this._previewTimer = null;
        this._refreshIndicatorPreviews();
      }, EDITOR_PREVIEW_THROTTLE_MS);
    }
  }

  _startRegistryWatch() {
    if (this._unwatchRegistry || !this._hass || !this.isConnected) return;
    this._unwatchRegistry = watchRegistry(this._hass, (registry) => {
      this._registry = registry;
      this._registryLoaded = true;
      this.render();
    });
  }

  _loadRegistry() {
    if (this._registryLoaded || this._registryLoading || this._registryRetryTimer !== null || !this._hass) return;
    this._registryLoading = true;
    ensureRegistry(this._hass).then((registry) => {
      this._registryLoading = false;
      if (registry.failed) {
        if (this.isConnected) {
          this._registryRetryTimer = setTimeout(() => {
            this._registryRetryTimer = null;
            this._loadRegistry();
          }, REGISTRY_RETRY_MS);
        }
        return;
      }
      this._registry = registry;
      this._registryLoaded = true;
      this.render();
    });
  }

  _refreshIndicatorPreviews() {
    if (!this.shadowRoot || !this._config || !Array.isArray(this._config.activity_indicators)) return;
    const panels = Array.from(this.shadowRoot.querySelectorAll("ha-expansion-panel"));
    this._config.activity_indicators.forEach((indicator, i) => {
      // Build the header and inline preview markup fresh and swap them
      // into their containers. We identify containers by position because
      // each indicator panel is uniquely indexed — no IDs needed.
      // Indicator panels sit after chip panels in render order; find by
      // querying all panels and skipping the ones whose content isn't a
      // `.panel-content > [id^="indicator-"]` match.
      const panel = panels.find((p) =>
        p.querySelector(`#indicator-${i}-basic-form`)
      );
      if (!panel) return;
      const headerWrap = panel.querySelector(".panel-header");
      if (headerWrap) {
        // Replace just the previous preview wrap, if any.
        const existing = headerWrap.querySelector(".indicator-preview-wrap");
        const fresh = this.renderIndicatorPreview(indicator);
        if (existing) {
          const tpl = document.createElement("template");
          tpl.innerHTML = fresh.trim();
          existing.replaceWith(tpl.content.firstChild);
        }
      }
      const inline = panel.querySelector(".indicator-preview-inline");
      if (inline) {
        const tpl = document.createElement("template");
        tpl.innerHTML = this.renderIndicatorPreviewInline(indicator).trim();
        inline.replaceWith(tpl.content.firstChild);
      }
    });
  }

  emitConfig() {
    // Stamp the emit time so the next (asynchronous) setConfig bounce
    // from HA can be recognised within the bounce window without a deep
    // JSON compare. `_lastConfigJson` is only used for external
    // changes (YAML edits) now, so we don't need to keep it fresh here.
    this._configEmittedAt = performance.now();
    // Remember what we emitted (in the normalized shape setConfig sees) so a
    // late echo from HA, arriving after the 150 ms window or after newer
    // edits, is still recognised and doesn't replace the editor's config.
    this._emittedJsons.push(JSON.stringify(normalizeConfig(this._config)));
    if (this._emittedJsons.length > 20) this._emittedJsons.shift();
    this._selfEmitting = true;
    try {
      // Hand HA a copy: it freezes the config it receives, which would make
      // our own (still edited) object read-only.
      fireEvent(this, "config-changed", { config: clone(this._config) });
    } finally {
      this._selfEmitting = false;
    }
  }

  getAreaOptions() {
    if (!this._registry) {
      return [];
    }
    return sortByLabel(this._registry.areas, (area) => getAreaName(area));
  }

  renderChipPreview(chip) {
    const areaIds = getConfigAreaIds(this._config);
    if (!this._hass || !this._registry || !areaIds.length) {
      return `<span class="panel-meta">Preview unavailable</span>`;
    }
    const preview = buildChipModel(this._hass, this._registry, { areas: areaIds }, chip);
    return `
      <div class="chip-preview ${preview.active ? "chip-preview-active" : "chip-preview-inactive"}">
        <ha-icon icon="${htmlEscape(preview.icon)}"></ha-icon>
        <span>${htmlEscape(preview.text)}</span>
      </div>
    `;
  }

  // Compact panel-header preview: the rendered indicator button exactly as
  // it would appear on the card, plus a status pill. We ignore for_duration
  // here (pass an empty trueSince map) so users see the immediate rule
  // match rather than waiting out the hold timer.
  renderIndicatorPreview(indicator) {
    if (!this._hass) return "";
    const model = buildIndicatorModel(this._hass, this._config, indicator, {
      now: new Date(),
      trueSince: new Map(),
    });
    const rawActive = evaluateIndicatorRaw(indicator, this._hass, { now: new Date(), trueSince: new Map() });
    const styleParts = [`--indicator-color:${resolveColor(model.color)}`];
    if (model.iconSize) styleParts.push(`--aac-indicator-icon-size:${model.iconSize}px`);
    if (model.size) styleParts.push(`--aac-indicator-size:${model.size}px`);
    const speed = model.animationSpeed || 1;
    styleParts.push(`--aac-indicator-anim-duration:${(2.4 / Math.max(speed, 0.1)).toFixed(2)}s`);
    if (!rawActive && model.dim) {
      styleParts.push(`--aac-indicator-dim-opacity:${model.dimOpacity}`);
    }
    const classList = ["indicator", "indicator-preview"];
    if (model.animation && model.animation !== "none" && rawActive) {
      classList.push(`indicator--anim-${model.animation}`);
    }
    if (!rawActive && model.inactive === "dim") classList.push("indicator--dim");
    if (!rawActive && model.inactive === "show") classList.push("indicator--inactive-show");
    const badgeMarkup = model.badge && model.badge.text
      ? `<span class="indicator__badge" style="${model.badge.color ? `background:${htmlEscape(resolveColor(model.badge.color))}` : ""}">${htmlEscape(model.badge.text)}</span>`
      : "";
    const statusLabel = rawActive
      ? "Active"
      : (model.inactive === "hide" ? "Hidden" : (model.inactive === "dim" ? "Dim" : "Inactive"));
    const statusClass = rawActive ? "status-active" : "status-inactive";
    return `
      <div class="indicator-preview-wrap">
        <div
          class="${classList.join(" ")}"
          style="${htmlEscape(styleParts.join(";"))}"
        >
          <ha-icon class="indicator-icon" icon="${htmlEscape(model.icon)}"></ha-icon>
          ${badgeMarkup}
        </div>
        <span class="indicator-status-pill ${statusClass}">${htmlEscape(statusLabel)}</span>
      </div>
    `;
  }

  // Expanded-panel preview strip: shows which entity the rule resolves to
  // plus the live state so users can verify their rule at a glance.
  renderIndicatorPreviewInline(indicator) {
    if (!this._hass) {
      return `<p class="secondary panel-meta">Preview unavailable — waiting for Home Assistant state.</p>`;
    }
    const representative = getIndicatorRepresentativeValue(indicator, this._hass);
    const rawActive = evaluateIndicatorRaw(indicator, this._hass, { now: new Date(), trueSince: new Map() });
    const duration = parseNumber(indicator.for_duration) ?? 0;
    const holdHint = duration > 0
      ? ` · hold ${duration}s before activating`
      : "";
    const entityLine = representative.entityId
      ? `<code>${htmlEscape(representative.entityId)}</code> = <code>${htmlEscape(String(representative.state ?? "—"))}</code>`
      : `<span class="panel-meta">No entity resolved from the rule</span>`;
    const numericLine = representative.value !== undefined && representative.value !== null && representative.value !== ""
      ? ` (numeric: ${htmlEscape(String(representative.value))})`
      : "";
    return `
      <div class="indicator-preview-inline">
        <span class="indicator-preview-dot ${rawActive ? "dot-active" : "dot-inactive"}"></span>
        <span>${entityLine}${numericLine}</span>
        <span class="panel-meta">${rawActive ? "rule matches" : "rule does not match"}${holdHint}</span>
      </div>
    `;
  }

  _computeLabel(schemaItem) {
    const LABELS = {
      area: "Area",
      title: "Title text",
      icon: "Icon override",
      icon_style: "Icon style",
      entity_ids: "Entities",
      hidden_when_zero: "Hide when zero/inactive",
      use_light_color: "Use actual light colors",
      active_color: "Active color",
      entity_id: "Entity",
      add_entity: "Select an entity to add",
      show_all_entities: "Show all entities",
      entity: "Entity (optional, default: the first entity)",
      mode: "Show",
      count_operator: "Count entities whose value",
      count_value: "Value",
      unit: "Unit (optional)",
      decimals: "Decimals",
      role: "Role",
      color: "Color",
      fan_speed_min: "Fast spin (seconds)",
      fan_speed_max: "Slow spin (seconds)",
      action: "Action",
      navigation_path: "Navigation path",
      url_path: "URL",
      service: "Service",
      service_data: "Service data",
      value_threshold: "Min active value",
      show_title: "Show title",
      show_icon: "Show icon",
      title_font_size: "Title size (px)",
      icon_size: "Icon size (px)",
      chips_margin: "Chips top margin (px)",
      chips_gap: "Chips gap (px)",
      chip_padding_top: "Chip padding top (px)",
      chip_padding_right: "Chip padding right (px)",
      chip_padding_bottom: "Chip padding bottom (px)",
      chip_padding_left: "Chip padding left (px)",
      chip_min_width: "Chip min width (px)",
      chip_radius: "Chip radius (px)",
      chip_gap: "Chip inner gap (px)",
      chip_icon_size: "Chip icon (px)",
      chip_text_size: "Chip text (px)",
      indicator_gap: "Indicator gap (px)",
      indicator_size: "Indicator size (px)",
      indicator_radius: "Indicator radius (px)",
      indicator_icon_size: "Indicator icon (px)",
      name: "Name (optional)",
      for_duration: "Must hold for (seconds)",
      type: "Value type",
      attribute: "Attribute (optional)",
      aggregation: "Aggregation",
      operator: "Operator",
      value: "Value",
      after: "After (HH:MM)",
      before: "Before (HH:MM)",
      inactive: "When inactive",
      dim_opacity: "Dim opacity (0–1)",
      animation: "Animation",
      animation_speed: "Animation speed (x)",
      tooltip: "Tooltip (supports {{state}}, {{value}}, {{attr.X}})",
      size: "Indicator size (px)",
      badge_text: "Badge text (supports {{state}}, {{value}}, {{attr.X}})",
      badge_color: "Badge color",
    };
    return LABELS[schemaItem.name] || schemaItem.name;
  }

  _getStylingTitleSchema(styling) {
    const px = (min, max) => ({ number: { mode: "box", min, max, step: 1 } });
    if (!styling.show_title) {
      return [{ name: "show_title", selector: { boolean: {} } }];
    }
    return [
      { name: "show_title", selector: { boolean: {} } },
      { type: "grid", name: "", schema: [
        { name: "title", selector: { text: {} } },
        { name: "title_font_size", selector: px(8, 80) },
      ]},
    ];
  }

  _getStylingIconSchema(styling) {
    const px = (min, max) => ({ number: { mode: "box", min, max, step: 1 } });
    if (!styling.show_icon) {
      return [{ name: "show_icon", selector: { boolean: {} } }];
    }
    return [
      { name: "show_icon", selector: { boolean: {} } },
      { type: "grid", name: "", schema: [
        { name: "icon_style", selector: { select: { mode: "dropdown", options: [
          { value: "plain", label: "Plain (large, no background)" },
          { value: "boxed", label: "Boxed (square, primary color)" },
        ] } } },
        { name: "icon_size", selector: px(12, 120) },
      ]},
      { name: "icon", selector: { icon: {} } },
    ];
  }

  _getStylingChipsSchema() {
    const px = (min, max) => ({ number: { mode: "box", min, max, step: 1 } });
    return [
      { type: "grid", name: "", schema: [
        { name: "chips_margin", selector: px(0, 80) },
        { name: "chips_gap", selector: px(0, 60) },
      ]},
      { type: "grid", name: "", schema: [
        { name: "chip_padding_top", selector: px(0, 60) },
        { name: "chip_padding_right", selector: px(0, 60) },
        { name: "chip_padding_bottom", selector: px(0, 60) },
        { name: "chip_padding_left", selector: px(0, 60) },
      ]},
      { type: "grid", name: "", schema: [
        { name: "chip_min_width", selector: px(0, 400) },
        { name: "chip_radius", selector: px(0, 999) },
        { name: "chip_gap", selector: px(0, 40) },
      ]},
      { type: "grid", name: "", schema: [
        { name: "chip_icon_size", selector: px(8, 80) },
        { name: "chip_text_size", selector: px(8, 60) },
      ]},
    ];
  }

  _getStylingIndicatorsSchema() {
    const px = (min, max) => ({ number: { mode: "box", min, max, step: 1 } });
    return [
      { type: "grid", name: "", schema: [
        { name: "indicator_gap", selector: px(0, 40) },
        { name: "indicator_size", selector: px(16, 120) },
        { name: "indicator_radius", selector: px(0, 999) },
        { name: "indicator_icon_size", selector: px(8, 80) },
      ]},
    ];
  }

  _getChipSchema(chip) {
    if (chip.type === "custom") return this._getCustomChipSchema(chip);
    const schema = [
      ...this._entityPickerItems(`${chip.id}:entities`, "entity_ids", {
        multiple: true,
        selected: chip.entity_ids,
        filter: (entityId, stateObj) => chipEntityMatchesType(chip.type, entityId, stateObj),
      }),
      { name: "icon", selector: { icon: {} } },
    ];
    if (["lights", "music", "lux"].includes(chip.type)) {
      schema.push({ name: "hidden_when_zero", selector: { boolean: {} } });
    }
    if (chip.type === "lights") {
      schema.push({ name: "use_light_color", selector: { boolean: {} } });
    }
    return schema;
  }

  // Schema of a custom chip. Any entity can be chosen (the area's entities
  // are offered first, "Show all entities" lists everything); the attribute
  // and value pickers follow the first selected entity.
  _getCustomChipSchema(chip) {
    const first = (chip.entity_ids || [])[0] || "";
    const operator = chip.count_operator || "truthy";
    const schema = [
      ...this._entityPickerItems(`${chip.id}:entities`, "entity_ids", { multiple: true, selected: chip.entity_ids }),
      { type: "grid", name: "", schema: [
        { name: "name", selector: { text: {} } },
        { name: "icon", selector: { icon: {} } },
      ]},
      { name: "mode", selector: { select: { mode: "dropdown", options: [
        { value: "numeric", label: "A number (average, sum, …)" },
        { value: "count",   label: "A count of entities matching a condition" },
      ] } } },
      { name: "attribute", selector: first ? { attribute: { entity_id: first } } : { text: {} } },
    ];
    if (chip.mode === "count") {
      schema.push({ name: "count_operator", selector: { select: { mode: "dropdown", options: [
        { value: "truthy",   label: "Is on / open / active" },
        { value: "falsy",    label: "Is off / closed / inactive" },
        { value: "eq",       label: "Equals" },
        { value: "ne",       label: "Not equals" },
        { value: "in",       label: "Is one of" },
        { value: "not_in",   label: "Is not one of" },
        { value: "contains", label: "Contains" },
        { value: "gt",       label: "Greater than" },
        { value: "gte",      label: "Greater or equal" },
        { value: "lt",       label: "Less than" },
        { value: "lte",      label: "Less or equal" },
      ] } } });
      if (CUSTOM_CHIP_NUMERIC_OPERATORS.includes(operator)) {
        schema.push({ name: "count_value", selector: { number: { mode: "box", step: 0.1 } } });
      } else {
        const valueSelector = this._getStateValueSelector({
          entity_id: first, attribute: chip.attribute, operator,
        });
        if (valueSelector) schema.push({ name: "count_value", selector: valueSelector });
      }
    } else {
      schema.push({ type: "grid", name: "", schema: [
        { name: "aggregation", selector: { select: { mode: "dropdown", options: [
          { value: "avg",   label: "Average" },
          { value: "sum",   label: "Sum" },
          { value: "min",   label: "Minimum" },
          { value: "max",   label: "Maximum" },
          { value: "first", label: "First entity" },
        ] } } },
        { name: "decimals", selector: { number: { mode: "box", min: 0, max: 4, step: 1 } } },
      ]});
    }
    schema.push(
      { name: "unit", selector: { text: {} } },
      { name: "hidden_when_zero", selector: { boolean: {} } },
    );
    return schema;
  }

  // What the custom chip schema depends on; when it changes the chip form
  // is rebuilt so the right fields show up.
  _customChipKey(chip) {
    const first = (chip.entity_ids || [])[0] || "";
    return `${chip.mode}|${chip.count_operator}|${first}|${first ? chip.attribute || "" : ""}`;
  }

  // Keep `count_value` in the shape its operator needs (number, list or text).
  _coerceCustomChipValue(chip) {
    const operator = chip.count_operator || "truthy";
    const value = chip.count_value;
    if (CUSTOM_CHIP_NUMERIC_OPERATORS.includes(operator)) {
      chip.count_value = parseNumber(Array.isArray(value) ? value[0] : value) ?? "";
    } else if (operator === "in" || operator === "not_in") {
      chip.count_value = Array.isArray(value)
        ? value
        : String(value ?? "").split(",").map((item) => item.trim()).filter(Boolean);
    } else if (operator === "truthy" || operator === "falsy") {
      chip.count_value = "";
    } else {
      chip.count_value = Array.isArray(value) ? value.join(", ") : (value ?? "");
    }
  }

  // Cancels a pending "Click again to reset" and restores the button label.
  _disarmReset() {
    if (!this._resetArmed) return;
    clearTimeout(this._resetArmed.timer);
    if (this._resetArmed.label) this._resetArmed.label.textContent = "Reset to defaults";
    this._resetArmed = null;
  }

  // Flags rows that are out of order and shows the hint, and shows the reset
  // button while the table differs from the built-in one, without touching
  // the DOM structure (the row being edited must keep its focus).
  _markThresholdOrder(chipIndex) {
    const section = this.shadowRoot.getElementById(`chip-${chipIndex}-threshold-section`);
    const chip = this._config.chips[chipIndex];
    const thresholds = chip?.thresholds;
    if (!section || !Array.isArray(thresholds)) return;
    section.classList.toggle("threshold-section--modified", !thresholdsAreDefault(chip.type, thresholds));
    let unsorted = false;
    section.querySelectorAll(".threshold-row").forEach((row) => {
      const index = Number(row.dataset.thresholdIndex);
      const outOfOrder = index > 0 && thresholds[index].value < thresholds[index - 1].value;
      row.classList.toggle("threshold-row--unsorted", outOfOrder);
      if (outOfOrder) unsorted = true;
    });
    section.classList.toggle("threshold-section--unsorted", unsorted);
  }

  // Schema of the "add indicator" picker. Entities that already have an
  // indicator are left out. In the area view every entity of a domain that has
  // ready-made indicator defaults is offered (plus anything whose name or
  // device class suggests a role); "Show all entities" offers everything.
  _getAddIndicatorSchema() {
    const used = new Set((this._config.activity_indicators || []).flatMap((ind) => toEntityList(ind.when?.entity_id)));
    return this._entityPickerItems("add-indicator", "add_entity", {
      filter: (entityId, stateObj, showAll) => {
        if (used.has(entityId)) return false;
        if (showAll) return true;
        return INDICATOR_DOMAINS.has(getDomain(entityId)) || Boolean(stateObj && detectIndicatorRole(entityId, stateObj));
      },
    });
  }

  // ── entity selectors scoped to the card's areas ─────────────────────────

  // Set of the entities in the card's areas, or null when that is unknown
  // (no area chosen, or the registry has not loaded yet).
  _areaEntitySet() {
    const areaIds = getConfigAreaIds(this._config);
    if (!this._hass || !this._registry || !areaIds.length) return null;
    let count = 0;
    for (const _id in this._hass.states) count++;
    const areaKey = areaIds.join(",");
    const cache = this._areaSetCache;
    if (cache && cache.registry === this._registry && cache.areaKey === areaKey && cache.count === count) {
      return cache.set;
    }
    const set = new Set(getAreasEntityIds(this._hass, this._registry, areaIds));
    this._areaSetCache = { registry: this._registry, areaKey, count, set };
    return set;
  }

  // Schema items for an entity selector plus its "Show all entities" switch.
  // `scopeKey` identifies the selector; the switch state is kept per key for
  // the editor session and is never saved in the card config.
  _entityPickerItems(scopeKey, name, { multiple = false, selected = [], filter } = {}) {
    const list = entityPickerList({
      states: this._hass?.states,
      areaEntityIds: this._areaEntitySet(),
      showAll: this._showAllKeys.has(scopeKey),
      selected,
      filter,
    });
    const entity = {};
    if (multiple) entity.multiple = true;
    if (list) entity.include_entities = list;
    return [
      { name, selector: { entity } },
      { name: SHOW_ALL_FIELD, selector: { boolean: {} } },
    ];
  }

  _withShowAll(scopeKey, data) {
    return { ...data, [SHOW_ALL_FIELD]: this._showAllKeys.has(scopeKey) };
  }

  _stripShowAll(value) {
    const { [SHOW_ALL_FIELD]: _switch, ...rest } = value || {};
    return rest;
  }

  // Handles a flip of the switch in a form: updates the state, swaps the
  // selector's list in place (no re-render, so focus stays) and returns true.
  // Returns false when the change was something else.
  _applyShowAllChange(form, scopeKey, value, rebuildSchema) {
    const on = Boolean(value?.[SHOW_ALL_FIELD]);
    if (on === this._showAllKeys.has(scopeKey)) return false;
    if (on) this._showAllKeys.add(scopeKey); else this._showAllKeys.delete(scopeKey);
    form.schema = rebuildSchema();
    form.data = { ...value, [SHOW_ALL_FIELD]: on };
    return true;
  }

  // Returns the ha-form schema for a single rule node (state / numeric /
  // time / group). The `rule.type` drives which fields show up so that
  // changing the type rebuilds the form on the next render.
  _getRuleSchema(rule, scopeKey) {
    const RULE_TYPES = [
      { value: "state",   label: "Text" },
      { value: "numeric", label: "Number" },
      { value: "time",    label: "Time of day" },
      { value: "and",     label: "Group: all of (AND)" },
      { value: "or",      label: "Group: any of (OR)" },
      { value: "not",     label: "Group: NOT" },
    ];
    const schema = [
      { name: "type", selector: { select: { mode: "dropdown", options: RULE_TYPES } } },
    ];
    // Attribute picker lists the real attributes of the first selected
    // entity; free text only until an entity is chosen.
    const firstEntity = toEntityList(rule.entity_id)[0] || "";
    const attributeSelector = firstEntity
      ? { attribute: { entity_id: firstEntity } }
      : { text: {} };
    if (rule.type === "state") {
      schema.push(
        ...this._entityPickerItems(scopeKey, "entity_id", { multiple: true, selected: toEntityList(rule.entity_id) }),
        { name: "attribute", selector: attributeSelector },
        { name: "aggregation", selector: { select: { mode: "dropdown", options: [
          { value: "any",  label: "Any entity matches" },
          { value: "all",  label: "All entities match" },
          { value: "none", label: "No entity matches" },
        ] } } },
        { name: "operator", selector: { select: { mode: "dropdown", options: [
          { value: "eq",       label: "Equals" },
          { value: "ne",       label: "Not equals" },
          { value: "in",       label: "Is one of (comma-sep)" },
          { value: "not_in",   label: "Is not one of (comma-sep)" },
          { value: "contains", label: "Contains" },
          { value: "matches",  label: "Matches regex" },
          { value: "truthy",   label: "Is truthy (on / open / …)" },
          { value: "falsy",    label: "Is falsy (off / closed / …)" },
        ] } } },
      );
      const valueSelector = this._getStateValueSelector(rule);
      if (valueSelector) schema.push({ name: "value", selector: valueSelector });
    } else if (rule.type === "numeric") {
      schema.push(
        ...this._entityPickerItems(scopeKey, "entity_id", { multiple: true, selected: toEntityList(rule.entity_id) }),
        { name: "attribute", selector: attributeSelector },
        { name: "aggregation", selector: { select: { mode: "dropdown", options: [
          { value: "any",   label: "Any entity matches" },
          { value: "all",   label: "All entities match" },
          { value: "none",  label: "No entity matches" },
          { value: "sum",   label: "Sum of all" },
          { value: "avg",   label: "Average of all" },
          { value: "min",   label: "Minimum" },
          { value: "max",   label: "Maximum" },
          { value: "count", label: "Count" },
        ] } } },
        { name: "operator", selector: { select: { mode: "dropdown", options: [
          { value: "gt",  label: "Greater than" },
          { value: "gte", label: "Greater or equal" },
          { value: "lt",  label: "Less than" },
          { value: "lte", label: "Less or equal" },
          { value: "eq",  label: "Equals" },
          { value: "ne",  label: "Not equals" },
        ] } } },
        { name: "value", selector: { number: { mode: "box", step: 0.1 } } },
      );
    } else if (rule.type === "time") {
      schema.push(
        { name: "after",  selector: { text: { type: "time" } } },
        { name: "before", selector: { text: { type: "time" } } },
      );
    }
    // Groups (and/or/not) are edited through their nested rules list,
    // which is rendered separately; the schema for the parent group
    // itself only carries the type selector.
    return schema;
  }

  // Selector for the `value` of a text (state) rule. With an entity chosen
  // the native state picker offers that entity's real states (free text is
  // still allowed); `is one of` uses its multi-select. Truthy / falsy need
  // no value, and regex / contains stay plain text.
  _getStateValueSelector(rule) {
    const operator = rule.operator || "eq";
    if (operator === "truthy" || operator === "falsy") return null;
    const firstEntity = toEntityList(rule.entity_id)[0] || "";
    if (!firstEntity || !["eq", "ne", "in", "not_in"].includes(operator)) {
      return { text: {} };
    }
    const state = { entity_id: firstEntity };
    if (rule.attribute) state.attribute = rule.attribute;
    if (operator === "in" || operator === "not_in") state.multiple = true;
    return { state };
  }

  // Everything the rule schema depends on besides the rule type; when it
  // changes, the open form needs a new schema (and a re-shaped value).
  _ruleSchemaKey(rule) {
    const first = toEntityList(rule.entity_id)[0] || "";
    return `${rule.type}|${first}|${rule.operator || ""}|${first ? rule.attribute || "" : ""}`;
  }

  // Flat ha-form value for a rule. `in` / `not_in` values are arrays when
  // the multi-select state picker is used, comma-separated text otherwise.
  _ruleToFormData(rule) {
    const operator = rule.operator || (rule.type === "numeric" ? "gt" : "eq");
    let value = this._serializeRuleValue(rule);
    if (rule.type === "state" && (operator === "in" || operator === "not_in")
      && this._getStateValueSelector({ ...rule, operator })?.state) {
      value = Array.isArray(rule.value)
        ? rule.value
        : this._parseRuleValue(value, operator);
    }
    return {
      type: rule.type || "state",
      entity_id: toEntityList(rule.entity_id),
      attribute: rule.attribute || "",
      aggregation: rule.aggregation || "any",
      operator,
      value,
      after: rule.after || "",
      before: rule.before || "",
    };
  }

  // Schema for a display_overrides entry condition (value type + entity
  // + optional attribute + operator + value). Mirrors the rule schema but
  // without aggregation / time / group options.
  _getMapEntrySchema(type, entityId, scopeKey) {
    const VALUE_TYPES = [
      { value: "numeric", label: "Number" },
      { value: "state",   label: "Text" },
    ];
    const schema = [
      { name: "type", selector: { select: { mode: "dropdown", options: VALUE_TYPES } } },
      ...this._entityPickerItems(scopeKey, "entity_id", { selected: [entityId] }),
      { name: "attribute", selector: entityId
        ? { attribute: { entity_id: entityId } }
        : { text: {} } },
    ];
    if (type === "numeric") {
      schema.push(
        { name: "operator", selector: { select: { mode: "dropdown", options: [
          { value: "gt",  label: "Greater than" },
          { value: "gte", label: "Greater or equal" },
          { value: "lt",  label: "Less than" },
          { value: "lte", label: "Less or equal" },
          { value: "eq",  label: "Equals" },
          { value: "ne",  label: "Not equals" },
        ] } } },
        { name: "value", selector: { number: { mode: "box", step: 0.1 } } },
      );
    } else {
      schema.push(
        { name: "operator", selector: { select: { mode: "dropdown", options: [
          { value: "eq",       label: "Equals" },
          { value: "ne",       label: "Not equals" },
          { value: "in",       label: "Is one of (comma-sep)" },
          { value: "not_in",   label: "Is not one of (comma-sep)" },
          { value: "contains", label: "Contains" },
          { value: "matches",  label: "Matches regex" },
          { value: "truthy",   label: "Is truthy (on / open / …)" },
          { value: "falsy",    label: "Is falsy (off / closed / …)" },
        ] } } },
        { name: "value", selector: { text: {} } },
      );
    }
    return schema;
  }

  // Schema for a conditional display override — same fields as the base
  // display but every field is optional (empty = use default). The
  // "inactive" dropdown includes an empty option to mean "use default".
  _getOverrideDisplaySchema() {
    const px = (min, max) => ({ number: { mode: "box", min, max, step: 1 } });
    return [
      { type: "grid", name: "", schema: [
        { name: "icon", selector: { icon: {} } },
        { name: "inactive", selector: { select: { mode: "dropdown", options: [
          { value: "",     label: "(default)" },
          { value: "hide", label: "Hide when inactive" },
          { value: "dim",  label: "Dim when inactive" },
          { value: "show", label: "Always show" },
        ] } } },
      ]},
      { type: "grid", name: "", schema: [
        { name: "size",      selector: px(12, 120) },
        { name: "icon_size", selector: px(8, 80) },
        { name: "dim_opacity", selector: { number: { mode: "box", min: 0, max: 1, step: 0.05 } } },
      ]},
      { type: "grid", name: "", schema: [
        { name: "animation", selector: { select: { mode: "dropdown", options: [
          { value: "",       label: "(default)" },
          { value: "none",   label: "None" },
          { value: "pulse",  label: "Pulse" },
          { value: "spin",   label: "Spin" },
          { value: "blink",  label: "Blink" },
          { value: "bounce", label: "Bounce" },
          { value: "shake",  label: "Shake" },
        ] } } },
        { name: "animation_speed", selector: { number: { mode: "box", min: 0.25, max: 4, step: 0.05 } } },
      ]},
      { name: "tooltip", selector: { text: {} } },
    ];
  }

  // Schema for the "Display" panel of an indicator.
  _getIndicatorDisplaySchema() {
    const px = (min, max) => ({ number: { mode: "box", min, max, step: 1 } });
    return [
      { type: "grid", name: "", schema: [
        { name: "icon", selector: { icon: {} } },
        { name: "inactive", selector: { select: { mode: "dropdown", options: [
          { value: "hide", label: "Hide when inactive" },
          { value: "dim",  label: "Dim when inactive" },
          { value: "show", label: "Always show" },
        ] } } },
      ]},
      { type: "grid", name: "", schema: [
        { name: "size",      selector: px(12, 120) },
        { name: "icon_size", selector: px(8, 80) },
        { name: "dim_opacity", selector: { number: { mode: "box", min: 0, max: 1, step: 0.05 } } },
      ]},
      { type: "grid", name: "", schema: [
        { name: "animation", selector: { select: { mode: "dropdown", options: [
          { value: "none",   label: "None" },
          { value: "pulse",  label: "Pulse" },
          { value: "spin",   label: "Spin" },
          { value: "blink",  label: "Blink" },
          { value: "bounce", label: "Bounce" },
          { value: "shake",  label: "Shake" },
        ] } } },
        { name: "animation_speed", selector: { number: { mode: "box", min: 0.25, max: 4, step: 0.05 } } },
      ]},
      { name: "tooltip", selector: { text: {} } },
    ];
  }

  // Markup for one action field: HA's native action editor, plus an
  // optional entity picker for the actions that act on an entity but have no
  // field for it in the native editor.
  // `gesture` ("tap_action" / "hold_action") is only given for chips and
  // indicators: with action "none" they use the card's action, which gets a
  // hint when the card has one.
  _actionFormMarkup(id, action, gesture) {
    const needsEntity = ENTITY_ACTIONS.includes(action?.action);
    const cardAction = gesture ? this._config?.[gesture]?.action : "";
    const inherits = gesture && (!action?.action || action.action === "none")
      && cardAction && cardAction !== "none";
    return `<ha-form id="${id}"></ha-form>${needsEntity ? `<ha-form id="${id}-entity"></ha-form>` : ""}${
      inherits ? `<span class="secondary">None: the card's ${gesture === "tap_action" ? "tap" : "hold"} action is used.</span>` : ""
    }`;
  }

  // Wires an action field to HA's `ui_action` selector (the same editor the
  // built-in cards use). `getAction` / `setAction` read and store the
  // action object; the editor rebuilds when the action type changes.
  _setupActionForm(id, getAction, setAction) {
    this._setupForm(id, { action: getAction() }, [{ name: "action", selector: { ui_action: {} } }], (data) => {
      const prev = getAction();
      let next = data.action || { action: "none" };
      // Keep a chosen entity when switching between more-info and toggle
      // (the native editor drops keys it does not know).
      if (ENTITY_ACTIONS.includes(next.action) && ENTITY_ACTIONS.includes(prev?.action)
        && prev.entity && !next.entity) {
        next = { ...next, entity: prev.entity };
      }
      setAction(next);
      if (prev?.action !== next.action) this.render();
    });
    const scopeKey = `${id}:entity`;
    const entitySchema = () => this._entityPickerItems(scopeKey, "entity", { selected: [getAction()?.entity] });
    this._setupForm(`${id}-entity`, { entity: getAction()?.entity || "" }, entitySchema(), (data) => {
      const next = { ...getAction() };
      if (data.entity) next.entity = data.entity; else delete next.entity;
      setAction(next);
    }, { key: scopeKey, rebuild: entitySchema });
  }

  // `scope` ({ key, rebuild }) is given for forms with an entity selector
  // that has a "Show all entities" switch: `key` identifies the selector and
  // `rebuild()` returns the current schema.
  _setupForm(id, data, schema, onChange, scope) {
    const form = this.shadowRoot.getElementById(id);
    if (!form) return;
    form.hass = this._hass;
    form.data = scope ? this._withShowAll(scope.key, data) : data;
    form.schema = schema;
    form.computeLabel = (s) => this._computeLabel(s);
    form.addEventListener("value-changed", (e) => {
      if (this._suppressEvents) return;
      e.stopPropagation();
      if (scope) {
        if (this._applyShowAllChange(form, scope.key, e.detail.value, scope.rebuild)) return;
        onChange(this._stripShowAll(e.detail.value));
        return;
      }
      onChange(e.detail.value);
    });
  }

  // Wires one rule-sub-editor form. The caller passes the current rule;
  // onChange receives the normalized new rule object. Handles type changes
  // (e.g. state → numeric) by re-rendering so the schema updates.
  _bindRuleForm(formId, rule, scopeKey, onChange) {
    const form = this.shadowRoot.getElementById(formId);
    if (!form) return;
    const baseRule = rule || { type: "state" };
    let currentRule = baseRule;
    const schema = this._getRuleSchema(baseRule, scopeKey);
    // Flat form shape: the ha-form works in flat keys, so we serialize a
    // few rule fields into flat keys and round-trip them.
    const formValue = this._withShowAll(scopeKey, this._ruleToFormData(baseRule));
    let schemaKey = this._ruleSchemaKey({ ...baseRule, operator: formValue.operator });
    form.hass = this._hass;
    form.data = formValue;
    form.schema = schema;
    form.computeLabel = (s) => this._computeLabel(s);
    form.addEventListener("value-changed", (e) => {
      if (this._suppressEvents) return;
      e.stopPropagation();
      if (this._applyShowAllChange(form, scopeKey, e.detail.value, () => this._getRuleSchema(currentRule, scopeKey))) return;
      const data = this._stripShowAll(e.detail.value);
      const prevType = baseRule.type || "state";
      const newType = data.type || prevType;
      let newRule;
      if (newType === "time") {
        newRule = { type: "time", after: data.after || "", before: data.before || "" };
      } else if (newType === "numeric") {
        newRule = {
          type: "numeric",
          entity_id: toEntityList(data.entity_id),
          attribute: data.attribute || null,
          aggregation: data.aggregation || "any",
          operator: data.operator || "gt",
          value: parseNumber(data.value),
          for: parseNumber(baseRule.for) ?? 0,
        };
      } else if (newType === "and" || newType === "or") {
        newRule = { type: newType, rules: Array.isArray(baseRule.rules) ? baseRule.rules : [] };
      } else if (newType === "not") {
        newRule = { type: "not", rule: baseRule.rule || null };
      } else {
        newRule = {
          type: "state",
          entity_id: toEntityList(data.entity_id),
          attribute: data.attribute || null,
          aggregation: data.aggregation || "any",
          operator: data.operator || "eq",
          value: this._parseRuleValue(data.value, data.operator),
          for: parseNumber(baseRule.for) ?? 0,
        };
      }
      // Entity / operator / attribute changes alter which selectors apply
      // (attribute list, state picker, value field); refresh in place.
      const nextKey = this._ruleSchemaKey(newRule);
      if (nextKey !== schemaKey && newType === prevType) {
        schemaKey = nextKey;
        form.schema = this._getRuleSchema(newRule, scopeKey);
        form.data = this._withShowAll(scopeKey, this._ruleToFormData(newRule));
      }
      currentRule = newRule;
      onChange(newRule);
    });
  }

  // Serialize a rule's `value` into a text-field-friendly string. Arrays
  // become comma-separated. Used for state rules where `in`/`not_in` carry
  // list values.
  _serializeRuleValue(rule) {
    if (!rule) return "";
    const v = rule.value;
    if (Array.isArray(v)) return v.join(", ");
    if (v === null || v === undefined) return "";
    return String(v);
  }

  // Parse a text-field value back into the shape the rule expects.
  _parseRuleValue(raw, operator) {
    if (raw === null || raw === undefined) return "";
    const isList = operator === "in" || operator === "not_in";
    if (Array.isArray(raw)) {
      const items = raw.map((item) => String(item).trim()).filter(Boolean);
      return isList ? items : items.join(", ");
    }
    const text = String(raw).trim();
    if (!text) return "";
    if (isList) {
      return text.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return text;
  }

  // Color fields use HA's `ui_color` selector through ha-form, so they get
  // the native picker (theme colors, state color, none) and keep working
  // when the underlying component changes.
  _setupColorPicker(id, currentValue, defaultColor, onChange) {
    const form = this.shadowRoot.getElementById(id);
    if (!form) return;
    const options = { include_state: true, include_none: true };
    if (defaultColor) options.default_color = defaultColor;
    const label = form.dataset.label || "Color";
    form.hass = this._hass;
    form.data = { color: currentValue || "" };
    form.schema = [{ name: "color", selector: { ui_color: options } }];
    form.computeLabel = () => label;
    form.addEventListener("value-changed", (e) => {
      if (this._suppressEvents) return;
      e.stopPropagation();
      onChange(e.detail.value?.color || "");
    });
  }

  renderChipButtons() {
    const areaIds = getConfigAreaIds(this._config);
    if (!areaIds.length || !this._hass || !this._registry) {
      return `<p class="secondary">Select an area to see available chip types.</p>`;
    }
    // Custom chips can be added any number of times; presets only once.
    const available = Object.keys(CHIP_DEFINITIONS).filter(
      (type) => type === "custom" || !this._config.chips.some((chip) => chip.type === type)
    );
    return available
      .map((type) => `
        <ha-button appearance="filled" size="s" data-action="add-chip" data-type="${htmlEscape(type)}">
          <ha-icon icon="mdi:plus" slot="start"></ha-icon>
          ${htmlEscape(type === "custom" ? "Custom chip" : CHIP_DEFINITIONS[type].label)}
        </ha-button>
      `)
      .join("");
  }

  renderThresholdRows(chip, chipIndex) {
    const supportsThresholds = ["temperature", "humidity", "lux"].includes(chip.type)
      || (chip.type === "custom" && chip.mode !== "count");
    if (!supportsThresholds) {
      return "";
    }
    return `
      <div class="threshold-section" id="chip-${chipIndex}-threshold-section">
        <div class="threshold-header">
          <span class="section-label">Threshold colors</span>
          <span class="threshold-hint">Rows are out of order</span>
          <ha-button class="threshold-sort" appearance="filled" size="s" data-action="sort-thresholds" data-chip-index="${chipIndex}">
            <ha-icon icon="mdi:sort-ascending" slot="start"></ha-icon>
            Sort by value
          </ha-button>
          ${DEFAULT_THRESHOLDS[chip.type] ? `
          <ha-button class="threshold-reset" appearance="plain" size="s" data-action="reset-thresholds" data-chip-index="${chipIndex}">
            <ha-icon icon="mdi:restore" slot="start"></ha-icon>
            <span class="reset-label">Reset to defaults</span>
          </ha-button>` : ""}
          <ha-button appearance="filled" size="s" data-action="add-threshold" data-chip-index="${chipIndex}">
            <ha-icon icon="mdi:plus" slot="start"></ha-icon>
            Add row
          </ha-button>
        </div>
        ${(chip.thresholds || []).map((threshold, thresholdIndex) => `
          <div class="threshold-row" data-threshold-index="${thresholdIndex}">
            <div class="threshold-fields">
              <ha-form id="chip-${chipIndex}-threshold-${thresholdIndex}-value"></ha-form>
              <ha-form id="chip-${chipIndex}-threshold-${thresholdIndex}-color"></ha-form>
              <ha-form id="chip-${chipIndex}-threshold-${thresholdIndex}-icon" class="threshold-icon"></ha-form>
            </div>
            <ha-icon-button
              class="icon-button-danger"
              label="Remove threshold"
              data-action="remove-threshold"
              data-chip-index="${chipIndex}"
              data-threshold-index="${thresholdIndex}"
              path="${MDI_PATH.delete}"
            ></ha-icon-button>
          </div>
        `).join("")}
      </div>
    `;
  }

  renderChipEditor(chip, chipIndex) {
    const isCustom = chip.type === "custom";
    const supportsCustomColor = isCustom || (chip.type === "music") || (chip.type === "lights" && !chip.use_light_color);
    const areaIds = getConfigAreaIds(this._config);
    const candidateIds = this._hass && this._registry && areaIds.length
      ? getChipCandidates(this._hass, this._registry, areaIds, chip.type)
      : [];
    const unselectedCount = candidateIds.filter((id) => !(chip.entity_ids || []).includes(id)).length;
    return `
      <ha-expansion-panel outlined>
        <div slot="header" class="panel-header">
          <div class="panel-heading">
            <span class="panel-title">${htmlEscape((isCustom && chip.name) || CHIP_DEFINITIONS[chip.type]?.label || chip.type)}</span>
            <span class="secondary">${chip.entity_ids.length} ${chip.entity_ids.length === 1 ? "entity" : "entities"}</span>
          </div>
          ${this.renderChipPreview(chip)}
        </div>
        <div class="panel-content">
          <div class="toolbar">
            ${isCustom ? "" : `
            <ha-button appearance="filled" size="s" data-action="add-all-entities" data-chip-index="${chipIndex}" ${unselectedCount === 0 ? "disabled" : ""}>
              <ha-icon icon="mdi:playlist-plus" slot="start"></ha-icon>
              Add all entities${unselectedCount > 0 ? ` (${unselectedCount})` : ""}
            </ha-button>`}
            <span class="toolbar-spacer"></span>
            <ha-icon-button
              label="Move up"
              data-action="move-chip-up"
              data-chip-index="${chipIndex}"
              ${chipIndex === 0 ? "disabled" : ""}
              path="${MDI_PATH.arrowUp}"
            ></ha-icon-button>
            <ha-icon-button
              label="Move down"
              data-action="move-chip-down"
              data-chip-index="${chipIndex}"
              ${chipIndex === this._config.chips.length - 1 ? "disabled" : ""}
              path="${MDI_PATH.arrowDown}"
            ></ha-icon-button>
            <ha-icon-button
              class="icon-button-danger"
              label="Remove chip"
              data-action="remove-chip"
              data-chip-index="${chipIndex}"
              path="${MDI_PATH.delete}"
            ></ha-icon-button>
          </div>
          <ha-form id="chip-${chipIndex}-form"></ha-form>
          ${supportsCustomColor ? `
            <ha-form id="chip-${chipIndex}-color" class="color-form" data-label="Active color"></ha-form>
          ` : ""}
          ${this.renderThresholdRows(chip, chipIndex)}
          <div class="action-section">
            <span class="section-label">Tap action</span>
            ${this._actionFormMarkup(`chip-${chipIndex}-tap-form`, chip.tap_action, "tap_action")}
          </div>
          <div class="action-section">
            <span class="section-label">Hold action</span>
            ${this._actionFormMarkup(`chip-${chipIndex}-hold-form`, chip.hold_action, "hold_action")}
          </div>
        </div>
      </ha-expansion-panel>
    `;
  }

  renderIndicatorEditor(indicator, indicatorIndex) {
    // Title: explicit name > first entity friendly name > "Indicator N".
    const firstEntity = toEntityList(indicator.when?.entity_id)[0] || indicator.entity_id || "";
    const displayTitle = indicator.name
      || (firstEntity ? getEntityLabel(this._hass, firstEntity) : `Indicator ${indicatorIndex + 1}`);
    const conditionCount = (indicator.and_if || []).length;
    const iconHint = indicator.display?.icon || "mdi:circle";

    const whenSection = this._renderRuleNodeEditor(`indicator-${indicatorIndex}-when`, indicator.when, {
      heading: "When (trigger)",
      path: `when`,
    });
    const andIfSection = (indicator.and_if || []).map((rule, ri) =>
      this._renderRuleNodeEditor(`indicator-${indicatorIndex}-andif-${ri}`, rule, {
        heading: `Condition ${ri + 1}`,
        path: `and_if.${ri}`,
        removable: true,
        removeAction: "remove-indicator-condition",
        removeData: { indicatorIndex, conditionIndex: ri },
      })
    ).join("");

    const overridesMarkup = (indicator.display?.display_overrides || []).map((entry, oi) => `
      <ha-expansion-panel outlined class="override-panel">
        <div slot="header" class="override-header">
          <span class="override-title">Override ${oi + 1}</span>
          <ha-icon-button
            class="icon-button-danger"
            label="Remove override"
            data-action="remove-display-override"
            data-indicator-index="${indicatorIndex}"
            data-entry-index="${oi}"
            path="${MDI_PATH.delete}"
          ></ha-icon-button>
        </div>
        <div class="override-content">
          <span class="section-sublabel">Condition</span>
          <ha-form id="indicator-${indicatorIndex}-override-${oi}-match-form"></ha-form>
          <span class="section-sublabel">Display overrides (leave empty to use defaults)</span>
          <ha-form id="indicator-${indicatorIndex}-override-${oi}-display-form"></ha-form>
          <ha-form id="indicator-${indicatorIndex}-override-${oi}-color" class="color-form" data-label="Color override"></ha-form>
          <ha-form id="indicator-${indicatorIndex}-override-${oi}-badge-form"></ha-form>
          <ha-form id="indicator-${indicatorIndex}-override-${oi}-badge-color" class="color-form" data-label="Badge color override"></ha-form>
        </div>
      </ha-expansion-panel>
    `).join("");

    return `
      <ha-expansion-panel outlined>
        <div slot="header" class="panel-header">
          <div class="panel-heading">
            <span class="panel-title">
              <ha-icon icon="${htmlEscape(iconHint)}"></ha-icon>
              ${htmlEscape(displayTitle)}
            </span>
            <span class="secondary">
              ${conditionCount ? `${conditionCount} extra condition${conditionCount === 1 ? "" : "s"}` : "No extra conditions"}
            </span>
          </div>
          ${this.renderIndicatorPreview(indicator)}
        </div>
        <div class="panel-content">
          ${this.renderIndicatorPreviewInline(indicator)}
          <div class="toolbar">
            <span class="toolbar-spacer"></span>
            <ha-icon-button
              label="Move up"
              data-action="move-indicator-up"
              data-indicator-index="${indicatorIndex}"
              ${indicatorIndex === 0 ? "disabled" : ""}
              path="${MDI_PATH.arrowUp}"
            ></ha-icon-button>
            <ha-icon-button
              label="Move down"
              data-action="move-indicator-down"
              data-indicator-index="${indicatorIndex}"
              ${indicatorIndex === this._config.activity_indicators.length - 1 ? "disabled" : ""}
              path="${MDI_PATH.arrowDown}"
            ></ha-icon-button>
            <ha-icon-button
              class="icon-button-danger"
              label="Remove indicator"
              data-action="remove-indicator"
              data-indicator-index="${indicatorIndex}"
              path="${MDI_PATH.delete}"
            ></ha-icon-button>
          </div>

          <ha-form id="indicator-${indicatorIndex}-basic-form"></ha-form>

          <div class="rule-section">
            <span class="section-label">When</span>
            <p class="secondary">The primary trigger — the indicator shows when this rule is true.</p>
            ${whenSection}
          </div>

          <div class="rule-section">
            <div class="threshold-header">
              <span class="section-label">And if (optional)</span>
              <ha-button appearance="filled" size="s" data-action="add-indicator-condition" data-indicator-index="${indicatorIndex}">
                <ha-icon icon="mdi:plus" slot="start"></ha-icon>
                Add condition
              </ha-button>
            </div>
            <p class="secondary">Every extra condition must also be true for the indicator to show.</p>
            ${andIfSection}
          </div>

          <div class="rule-section">
            <span class="section-label">Display (defaults)</span>
            <ha-form id="indicator-${indicatorIndex}-display-form"></ha-form>
            <ha-form id="indicator-${indicatorIndex}-color" class="color-form" data-label="Base color"></ha-form>
            <ha-form id="indicator-${indicatorIndex}-badge-form"></ha-form>
            <ha-form id="indicator-${indicatorIndex}-badge-color" class="color-form" data-label="Badge color"></ha-form>
          </div>

          <div class="rule-section">
            <div class="threshold-header">
              <span class="section-label">Conditional display (optional)</span>
              <ha-button appearance="filled" size="s" data-action="add-display-override" data-indicator-index="${indicatorIndex}">
                <ha-icon icon="mdi:plus" slot="start"></ha-icon>
                Add override
              </ha-button>
            </div>
            <p class="secondary">Override any display property when a condition matches. First match wins. Empty fields fall back to the defaults above.</p>
            ${overridesMarkup}
          </div>

          <div class="action-section">
            <span class="section-label">Tap action</span>
            ${this._actionFormMarkup(`indicator-${indicatorIndex}-tap-form`, indicator.tap_action, "tap_action")}
          </div>
          <div class="action-section">
            <span class="section-label">Hold action</span>
            ${this._actionFormMarkup(`indicator-${indicatorIndex}-hold-form`, indicator.hold_action, "hold_action")}
          </div>
        </div>
      </ha-expansion-panel>
    `;
  }

  // Renders a single rule-node editor (used by When and by each And-if
  // condition). Produces the DOM skeleton — bindings are attached
  // separately in the render() pass.
  _renderRuleNodeEditor(id, rule, opts) {
    const removeBtn = opts && opts.removable ? `
      <ha-icon-button
        class="icon-button-danger"
        label="Remove"
        data-action="${htmlEscape(opts.removeAction)}"
        data-indicator-index="${opts.removeData.indicatorIndex}"
        data-condition-index="${opts.removeData.conditionIndex}"
        path="${MDI_PATH.delete}"
      ></ha-icon-button>
    ` : "";
    // Group rules (and/or/not) need their own nested editors; we show a
    // hint for now so the card never silently drops them. Users who want
    // the full power of nested groups can still edit via YAML.
    const isGroup = rule && (rule.type === "and" || rule.type === "or" || rule.type === "not");
    const groupHint = isGroup
      ? `<p class="secondary">Nested group — edit child rules via YAML for now.</p>`
      : "";
    return `
      <div class="rule-row">
        <div class="rule-row-header">
          <span class="section-sublabel">${htmlEscape(opts?.heading || "Rule")}</span>
          ${removeBtn}
        </div>
        <ha-form id="${htmlEscape(id)}-form"></ha-form>
        ${groupHint}
      </div>
    `;
  }

  // Coalesce multiple synchronous render() calls (setConfig + several
  // form-change handlers in the same tick) into a single DOM rebuild via
  // requestAnimationFrame. Keeps the editor responsive under rapid
  // interaction without the ping-pong of repeated innerHTML rewrites.
  render() {
    if (!this.shadowRoot || this._rendering) return;
    if (this._renderRAF) return;
    this._renderRAF = requestAnimationFrame(() => {
      this._renderRAF = null;
      this._doRender();
    });
  }

  _doRender() {
    if (!this.shadowRoot || this._rendering) {
      return;
    }
    this._rendering = true;

    // Preserve focus + selection across the innerHTML rebuild so typing
    // in an override / badge / tooltip input doesn't blur and scroll the
    // modal on every keystroke-triggered re-render.
    const focusInfo = this._saveFocus();

    const expandedPanels = new Set();
    this.shadowRoot.querySelectorAll("ha-expansion-panel").forEach((panel, index) => {
      if (panel.expanded) {
        expandedPanels.add(index);
      }
    });

    const selectedAreaIds = getConfigAreaIds(this._config);
    const areaSelected = selectedAreaIds.length > 0;
    // Each slot is rendered as its own <ha-form> area selector so the user
    // can swap the value any time. When no area is selected yet we still show
    // one empty slot so the user has somewhere to pick an area. When the
    // "Add area" button was clicked we append an extra empty slot.
    const areaSlots = selectedAreaIds.length === 0
      ? [""]
      : (this._addingArea ? [...selectedAreaIds, ""] : [...selectedAreaIds]);
    const showAddButton = areaSelected && !this._addingArea;

    const areaRowsMarkup = areaSlots.map((value, index) => {
      const showRemove = areaSlots.length > 1;
      return `
        <div class="area-row">
          <ha-form id="area-form-${index}" class="area-row-form"></ha-form>
          ${showRemove ? `
            <ha-icon-button
              class="icon-button-danger"
              label="Remove area"
              data-action="remove-area"
              data-area-index="${index}"
              path="${MDI_PATH.delete}"
            ></ha-icon-button>
          ` : ""}
        </div>
      `;
    }).join("");

    this.shadowRoot.innerHTML = `
      <style>${this.styles()}</style>
      <div class="card-config">
        <div class="area-list">${areaRowsMarkup}</div>
        ${showAddButton ? `
          <div class="area-add-row">
            <ha-button appearance="filled" size="s" data-action="show-add-area">
              <ha-icon icon="mdi:plus" slot="start"></ha-icon>
              Add area
            </ha-button>
          </div>
        ` : ""}
        <p class="secondary">
          ${this._registryLoaded
            ? (areaSelected
                ? "The card automatically uses the first area icon and joins all area names with “+”. Override either via Advanced styling."
                : "Choose an area first. The remaining settings will appear after selection.")
            : "Loading the Home Assistant area registry\u2026"}
        </p>

        ${areaSelected ? `
          <ha-expansion-panel outlined>
            <div slot="header" class="panel-header">
              <div class="panel-heading">
                <span class="panel-title">Card actions</span>
                <span class="secondary">Tap &amp; hold actions for the whole card</span>
              </div>
            </div>
            <div class="panel-content">
              <div class="action-section">
                <span class="section-label">Tap action</span>
                ${this._actionFormMarkup("card-tap-form", this._config.tap_action)}
              </div>
              <div class="action-section">
                <span class="section-label">Hold action</span>
                ${this._actionFormMarkup("card-hold-form", this._config.hold_action)}
              </div>
            </div>
          </ha-expansion-panel>

          <ha-expansion-panel outlined>
            <div slot="header" class="panel-header">
              <div class="panel-heading">
                <span class="panel-title">Advanced styling</span>
                <span class="secondary">Customize sizes, colors and spacing</span>
              </div>
            </div>
            <div class="panel-content">
              <p class="secondary">Leave a value empty to use the built-in default.</p>

              <ha-form id="styling-title-form"></ha-form>
              ${this._config.styling.show_title ? `
                <ha-form id="styling-title-color" class="color-form" data-label="Title color"></ha-form>
              ` : ""}

              <ha-form id="styling-icon-form"></ha-form>
              ${this._config.styling.show_icon ? `
                <ha-form id="styling-icon-color" class="color-form" data-label="Icon color"></ha-form>
              ` : ""}

              <div class="styling-group">
                <span class="section-label">Chips</span>
              </div>
              <ha-form id="styling-chips-form"></ha-form>

              <div class="styling-group">
                <span class="section-label">Activity indicators</span>
              </div>
              <ha-form id="styling-indicators-form"></ha-form>
            </div>
          </ha-expansion-panel>

          <div class="section-header">
            <span class="section-label">Chips</span>
            <div class="button-row">${this.renderChipButtons()}</div>
          </div>
          <p class="secondary">Chip order controls the visual order on the card. Each chip type can be added once.</p>
        ` : ""}

        ${areaSelected ? (this._config.chips || []).map((chip, i) => this.renderChipEditor(chip, i)).join("") : ""}

        ${areaSelected ? `
          <div class="section-header">
            <span class="section-label">Activity Indicators</span>
          </div>
          <p class="secondary">Pick an entity to add it as an activity indicator. The editor auto-detects a role, which you can adjust afterward.</p>
        ` : ""}

        ${areaSelected ? (this._config.activity_indicators || []).map((ind, i) => this.renderIndicatorEditor(ind, i)).join("") : ""}

        ${areaSelected ? `
          <div class="add-indicator-row">
            <ha-form id="add-indicator-form"></ha-form>
          </div>
        ` : ""}
      </div>
    `;

    // Listeners are bound once in connectedCallback — no need to
    // remove/re-add on every render.

    this._suppressEvents = true;

    areaSlots.forEach((value, index) => {
      this._setupForm(`area-form-${index}`, { area: value || "" }, [
        { name: "area", selector: { area: {} } },
      ], (data) => {
        this.handleAreaSlotChange(index, data.area || "");
      });
    });

    if (areaSelected) {
      const applyStylingNumericData = (data) => {
        for (const key of STYLING_NUMERIC_KEYS) {
          if (key in data) this._config.styling[key] = parseNumber(data[key]);
        }
      };

      // Title group: show/hide toggle + title text + title size.
      this._setupForm("styling-title-form",
        {
          show_title: this._config.styling.show_title !== false,
          title: this._config.title || "",
          title_font_size: this._config.styling.title_font_size,
        },
        this._getStylingTitleSchema(this._config.styling),
        (data) => {
          const prevShowTitle = this._config.styling.show_title;
          if ("show_title" in data) this._config.styling.show_title = data.show_title !== false;
          if ("title" in data) this._config.title = data.title || "";
          applyStylingNumericData(data);
          this.emitConfig();
          if (prevShowTitle !== this._config.styling.show_title) this.render();
        },
      );

      if (this._config.styling.show_title) {
        this._setupColorPicker("styling-title-color", this._config.styling.title_color, "", (value) => {
          this._config.styling.title_color = value;
          this.emitConfig();
        });
      }

      // Icon group: show/hide toggle + style + size + icon override.
      this._setupForm("styling-icon-form",
        {
          show_icon: this._config.styling.show_icon !== false,
          icon_style: this._config.icon_style || "plain",
          icon_size: this._config.styling.icon_size,
          icon: this._config.icon || "",
        },
        this._getStylingIconSchema(this._config.styling),
        (data) => {
          const prevShowIcon = this._config.styling.show_icon;
          if ("show_icon" in data) this._config.styling.show_icon = data.show_icon !== false;
          if ("icon_style" in data) this._config.icon_style = data.icon_style || "plain";
          if ("icon" in data) this._config.icon = data.icon || "";
          applyStylingNumericData(data);
          this.emitConfig();
          if (prevShowIcon !== this._config.styling.show_icon) this.render();
        },
      );

      if (this._config.styling.show_icon) {
        this._setupColorPicker("styling-icon-color", this._config.styling.icon_color, "", (value) => {
          this._config.styling.icon_color = value;
          this.emitConfig();
        });
      }

      // Chips styling group.
      this._setupForm("styling-chips-form",
        { ...this._config.styling },
        this._getStylingChipsSchema(),
        (data) => {
          applyStylingNumericData(data);
          this.emitConfig();
        },
      );

      // Activity indicators styling group.
      this._setupForm("styling-indicators-form",
        { ...this._config.styling },
        this._getStylingIndicatorsSchema(),
        (data) => {
          applyStylingNumericData(data);
          this.emitConfig();
        },
      );

      for (const kind of ["tap", "hold"]) {
        const key = `${kind}_action`;
        this._setupActionForm(`card-${kind}-form`, () => this._config[key], (next) => {
          this._config[key] = next;
          this.emitConfig();
        });
      }

      this._config.chips.forEach((chip, i) => {
        this._setupForm(`chip-${i}-form`, chip, this._getChipSchema(chip), (data) => {
          const target = this._config.chips[i];
          const prevUseLightColor = target.use_light_color;
          const prevCustomKey = target.type === "custom" ? this._customChipKey(target) : "";
          Object.assign(target, data);
          // Re-render when the toggle flips so the color picker appears/disappears.
          let rebuild = data.use_light_color !== undefined && data.use_light_color !== prevUseLightColor;
          if (target.type === "custom") {
            this._coerceCustomChipValue(target);
            // Mode / condition / entity changes alter which fields apply.
            if (this._customChipKey(target) !== prevCustomKey) rebuild = true;
          }
          this.emitConfig();
          if (rebuild) this.render();
        }, { key: `${chip.id}:entities`, rebuild: () => this._getChipSchema(this._config.chips[i]) });
        if ((chip.type === "custom") || (chip.type === "music") || (chip.type === "lights" && !chip.use_light_color)) {
          const def = CHIP_DEFINITIONS[chip.type]?.activeColor || "#43b581";
          this._setupColorPicker(`chip-${i}-color`, chip.active_color, def, (value) => {
            this._config.chips[i].active_color = value;
            this.emitConfig();
          });
        }
        if (Array.isArray(chip.thresholds)) {
          chip.thresholds.forEach((threshold, ti) => {
            // Value and color side by side, icon below; the CSS grid keeps
            // the spacing equal and wraps on narrow screens. Each field only
            // writes its own property.
            this._setupForm(
              `chip-${i}-threshold-${ti}-value`,
              { value: threshold.value },
              [{ name: "value", selector: { number: { mode: "box", step: 0.1 } } }],
              (data) => {
                // No sorting or re-render while typing (that would drop the
                // field's focus and make the row jump); the "Sort by value"
                // button applies the order. An empty field keeps the last
                // valid number.
                const numeric = parseNumber(data.value);
                if (numeric === null) return;
                this._config.chips[i].thresholds[ti].value = numeric;
                this.emitConfig();
                this._markThresholdOrder(i);
              },
            );
            this._setupForm(
              `chip-${i}-threshold-${ti}-color`,
              { color: threshold.color || "" },
              [{ name: "color", selector: { ui_color: { include_state: true, include_none: true, default_color: "#43b581" } } }],
              (data) => {
                this._config.chips[i].thresholds[ti].color = data.color || "";
                this.emitConfig();
                this._markThresholdOrder(i);
              },
            );
            this._setupForm(
              `chip-${i}-threshold-${ti}-icon`,
              { icon: threshold.icon || "" },
              [{ name: "icon", selector: { icon: {} } }],
              (data) => {
                this._config.chips[i].thresholds[ti].icon = data.icon || "";
                this.emitConfig();
                this._markThresholdOrder(i);
              },
            );
          });
          this._markThresholdOrder(i);
        }
        this._setupActionForm(`chip-${i}-tap-form`, () => this._config.chips[i].tap_action, (next) => {
          this._config.chips[i].tap_action = next;
          this.emitConfig();
        });
        this._setupActionForm(`chip-${i}-hold-form`, () => this._config.chips[i].hold_action, (next) => {
          this._config.chips[i].hold_action = next;
          this.emitConfig();
        });
      });

      const addIndicatorSchema = () => this._getAddIndicatorSchema();
      this._setupForm("add-indicator-form",
        { add_entity: "" },
        addIndicatorSchema(),
        (data) => {
          const entityId = data.add_entity || "";
          if (!entityId) return;
          if (!this._hass?.states?.[entityId]) return;
          const alreadyUsed = this._config.activity_indicators.some((ind) =>
            toEntityList(ind.when?.entity_id).includes(entityId)
          );
          if (alreadyUsed) return;
          const stateObj = this._hass.states[entityId];
          const defaults = getIndicatorDefaults(entityId, stateObj);
          const newIndicator = normalizeIndicator({
            name: "",
            when: defaults.when,
            and_if: [],
            display: defaults.display,
            tap_action: { action: "more-info", entity: entityId },
            hold_action: { action: "none" },
            for_duration: 0,
            role: detectIndicatorRole(entityId, stateObj) || "movement",
            entity_id: entityId,
          });
          this._config.activity_indicators = [
            ...this._config.activity_indicators,
            newIndicator,
          ];
          this.emitConfig();
          this.render();
        },
        { key: "add-indicator", rebuild: addIndicatorSchema },
      );

      this._config.activity_indicators.forEach((indicator, i) => {
        // Basic: name + for_duration.
        this._setupForm(`indicator-${i}-basic-form`,
          {
            name: indicator.name || "",
            for_duration: parseNumber(indicator.for_duration) ?? 0,
          },
          [
            { name: "name", selector: { text: {} } },
            { name: "for_duration", selector: { number: { mode: "box", min: 0, max: 86400, step: 1 } } },
          ],
          (data) => {
            this._config.activity_indicators[i].name = data.name || "";
            this._config.activity_indicators[i].for_duration = parseNumber(data.for_duration) ?? 0;
            this.emitConfig();
          },
        );

        // When: rule node editor.
        {
          const prevType = (indicator.when?.type) || "state";
          this._bindRuleForm(`indicator-${i}-when-form`, indicator.when, `${indicator.id}:when`, (newRule) => {
            this._config.activity_indicators[i].when = newRule;
            this.emitConfig();
            if (newRule.type !== prevType) this.render();
          });
        }

        // And-if: one form per condition.
        (indicator.and_if || []).forEach((condRule, ri) => {
          const prevType = (condRule?.type) || "state";
          this._bindRuleForm(`indicator-${i}-andif-${ri}-form`, condRule, `${indicator.id}:andif:${ri}`, (newRule) => {
            this._config.activity_indicators[i].and_if[ri] = newRule;
            this.emitConfig();
            if (newRule.type !== prevType) this.render();
          });
        });

        // Display: icon/inactive/size/anim/tooltip.
        const display = indicator.display || {};
        this._setupForm(`indicator-${i}-display-form`,
          {
            icon: display.icon || "",
            inactive: display.inactive || "hide",
            size: parseNumber(display.size) ?? "",
            icon_size: parseNumber(display.icon_size) ?? "",
            dim_opacity: parseNumber(display.dim_opacity) ?? 0.3,
            animation: display.animation || "none",
            animation_speed: parseNumber(display.animation_speed) ?? 1,
            tooltip: display.tooltip || "",
          },
          this._getIndicatorDisplaySchema(),
          (data) => {
            const d = this._config.activity_indicators[i].display || {};
            d.icon = data.icon || "";
            d.inactive = data.inactive || "hide";
            d.size = parseNumber(data.size);
            d.icon_size = parseNumber(data.icon_size);
            d.dim_opacity = parseNumber(data.dim_opacity) ?? 0.3;
            d.animation = data.animation || "none";
            d.animation_speed = parseNumber(data.animation_speed) ?? 1;
            d.tooltip = data.tooltip || null;
            this._config.activity_indicators[i].display = d;
            this.emitConfig();
          },
        );

        this._setupColorPicker(`indicator-${i}-color`, display.color, "#43b581", (value) => {
          this._config.activity_indicators[i].display.color = value;
          this.emitConfig();
        });

        // Conditional display overrides.
        (display.display_overrides || []).forEach((entry, oi) => {
          // Match condition form.
          const matchType = entry.match?.type || "numeric";
          const matchScopeKey = `${indicator.id}:override:${oi}`;
          const matchSchema = this._getMapEntrySchema(matchType, entry.match?.entity_id || "", matchScopeKey);
          const matchFormId = `indicator-${i}-override-${oi}-match-form`;
          let matchEntity = entry.match?.entity_id || "";
          const prevMatchType = matchType;
          this._setupForm(matchFormId,
            {
              type: matchType,
              entity_id: entry.match?.entity_id || "",
              attribute: entry.match?.attribute || "",
              operator: entry.match?.operator || (matchType === "numeric" ? "gt" : "eq"),
              value: entry.match?.value ?? "",
            },
            matchSchema,
            (data) => {
              const e = this._config.activity_indicators[i].display.display_overrides[oi];
              if (!e) return;
              const m = e.match = e.match || {};
              m.type = data.type || "numeric";
              m.operator = data.operator || "gt";
              // Only set optional keys when they have values, so shape stays
              // identical after normalizeDisplay strips empty/missing fields.
              if (data.entity_id) m.entity_id = data.entity_id; else delete m.entity_id;
              if (data.attribute) m.attribute = data.attribute; else delete m.attribute;
              const numeric = parseNumber(data.value);
              m.value = numeric !== null && String(numeric) === String(data.value).trim()
                ? numeric
                : data.value;
              this.emitConfig();
              if (data.type !== prevMatchType) {
                this.render();
              } else if ((data.entity_id || "") !== matchEntity) {
                // New entity: the attribute picker must list its attributes.
                matchEntity = data.entity_id || "";
                const matchForm = this.shadowRoot.getElementById(matchFormId);
                if (matchForm) matchForm.schema = this._getMapEntrySchema(m.type, matchEntity, matchScopeKey);
              }
            },
            {
              key: matchScopeKey,
              rebuild: () => {
                const current = this._config.activity_indicators[i].display.display_overrides[oi]?.match || {};
                return this._getMapEntrySchema(current.type || "numeric", current.entity_id || "", matchScopeKey);
              },
            },
          );
          // Display override fields.
          this._setupForm(`indicator-${i}-override-${oi}-display-form`,
            {
              icon: entry.icon || "",
              inactive: entry.inactive || "",
              size: entry.size != null ? entry.size : "",
              icon_size: entry.icon_size != null ? entry.icon_size : "",
              dim_opacity: entry.dim_opacity != null ? entry.dim_opacity : "",
              animation: entry.animation || "",
              animation_speed: entry.animation_speed != null ? entry.animation_speed : "",
              tooltip: entry.tooltip || "",
            },
            this._getOverrideDisplaySchema(),
            (data) => {
              const e = this._config.activity_indicators[i].display.display_overrides[oi];
              if (!e) return;
              // Only persist meaningful values; delete empty/null keys so the
              // config stays in sync with normalizeDisplay's output (which
              // strips unset fields). Keeping this shape-stable prevents the
              // bounced-back config from differing and triggering a re-render
              // that would kill focus mid-typing.
              const setOrDelete = (key, value) => {
                if (value === null || value === undefined || value === "") delete e[key];
                else e[key] = value;
              };
              setOrDelete("icon", data.icon || "");
              setOrDelete("inactive", data.inactive || "");
              setOrDelete("size", parseNumber(data.size));
              setOrDelete("icon_size", parseNumber(data.icon_size));
              setOrDelete("dim_opacity", parseNumber(data.dim_opacity));
              setOrDelete("animation", data.animation || "");
              setOrDelete("animation_speed", parseNumber(data.animation_speed));
              setOrDelete("tooltip", data.tooltip || "");
              this.emitConfig();
            },
          );
          // Color override picker.
          this._setupColorPicker(`indicator-${i}-override-${oi}-color`, entry.color || "", "", (value) => {
            const e = this._config.activity_indicators[i].display.display_overrides[oi];
            if (!e) return;
            if (value) e.color = value;
            else delete e.color;
            this.emitConfig();
          });
          // Badge override.
          const oBadge = entry.badge || { text: "", color: "" };
          this._setupForm(`indicator-${i}-override-${oi}-badge-form`,
            { badge_text: oBadge.text || "" },
            [{ name: "badge_text", selector: { text: {} } }],
            (data) => {
              const e = this._config.activity_indicators[i].display.display_overrides[oi];
              if (!e) return;
              const text = (data.badge_text || "").trim();
              const color = e.badge?.color || "";
              e.badge = (text || color) ? { text, color } : null;
              this.emitConfig();
            },
          );
          this._setupColorPicker(`indicator-${i}-override-${oi}-badge-color`, oBadge.color || "", "", (value) => {
            const e = this._config.activity_indicators[i].display.display_overrides[oi];
            if (!e) return;
            const text = e.badge?.text || "";
            e.badge = (text || value) ? { text, color: value } : null;
            this.emitConfig();
          });
        });

        // Badge (optional).
        const badge = display.badge || { text: "", color: "" };
        this._setupForm(`indicator-${i}-badge-form`,
          { badge_text: badge.text || "" },
          [
            { name: "badge_text", selector: { text: {} } },
          ],
          (data) => {
            const text = (data.badge_text || "").trim();
            const color = this._config.activity_indicators[i].display.badge?.color || "";
            this._config.activity_indicators[i].display.badge = (text || color)
              ? { text, color }
              : null;
            this.emitConfig();
          },
        );
        this._setupColorPicker(`indicator-${i}-badge-color`, badge.color, "", (value) => {
          const d = this._config.activity_indicators[i].display;
          const text = d.badge?.text || "";
          d.badge = (text || value) ? { text, color: value } : null;
          this.emitConfig();
        });

        this._setupActionForm(`indicator-${i}-tap-form`, () => this._config.activity_indicators[i].tap_action, (next) => {
          this._config.activity_indicators[i].tap_action = next;
          this.emitConfig();
        });
        this._setupActionForm(`indicator-${i}-hold-form`, () => this._config.activity_indicators[i].hold_action, (next) => {
          this._config.activity_indicators[i].hold_action = next;
          this.emitConfig();
        });
      });
    }

    this._suppressEvents = false;

    this.shadowRoot.querySelectorAll("ha-expansion-panel").forEach((panel, index) => {
      if (expandedPanels.has(index)) {
        panel.expanded = true;
      }
    });

    this._rendering = false;
    this._restoreFocus(focusInfo);
  }

  // Best-effort capture of the currently focused input inside this
  // editor's shadow tree. We record the id of the nearest ancestor
  // element in our shadow root (usually an `<ha-form id="...">`) plus
  // the field name inside the form and the text-selection range, so the
  // rebuilt DOM can re-focus the equivalent input.
  _saveFocus() {
    const info = { formId: null, fieldName: null, selStart: null, selEnd: null };
    try {
      let el = document.activeElement;
      const seen = new Set();
      while (el?.shadowRoot?.activeElement && !seen.has(el)) {
        seen.add(el);
        el = el.shadowRoot.activeElement;
      }
      if (!el) return info;
      if ("selectionStart" in el) {
        info.selStart = el.selectionStart;
        info.selEnd = el.selectionEnd;
      }
      // Walk up through shadow hosts to find the nearest element in our
      // own shadow root that carries an id (forms are the usual anchor).
      let node = el;
      while (node) {
        if (node.getAttribute && !info.fieldName) {
          const name = node.getAttribute("name");
          if (name) info.fieldName = name;
        }
        const root = node.getRootNode && node.getRootNode();
        if (root === this.shadowRoot && node.id) {
          info.formId = node.id;
          break;
        }
        node = node.parentNode || (root && root.host) || null;
      }
    } catch (_) { /* ignore — focus is best-effort */ }
    return info;
  }

  _restoreFocus(info) {
    if (!info?.formId) return;
    // Defer a frame so ha-form has mounted its internal inputs.
    requestAnimationFrame(() => {
      try {
        const form = this.shadowRoot.getElementById(info.formId);
        if (!form) return;
        const byName = info.fieldName
          ? form.shadowRoot?.querySelector?.(`[name="${info.fieldName}"]`)
          : null;
        const target = byName
          || form.shadowRoot?.querySelector?.("input, textarea, ha-input, ha-select")
          || null;
        if (!target) return;
        if (typeof target.focus === "function") target.focus();
        const inner = ("selectionStart" in target)
          ? target
          : target.shadowRoot?.querySelector?.("input, textarea");
        if (inner && info.selStart != null && "setSelectionRange" in inner) {
          try { inner.setSelectionRange(info.selStart, info.selEnd); } catch (_) {}
        }
      } catch (_) { /* ignore */ }
    });
  }

  styles() {
    if (AdvancedAreaCardEditor._stylesCache) return AdvancedAreaCardEditor._stylesCache;
    const css = `
      :host {
        display: block;
        color: var(--primary-text-color);
      }
      .card-config {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .area-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .area-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .area-row-form {
        flex: 1;
        min-width: 0;
      }
      .area-row .icon-button-danger {
        color: var(--error-color, #ef5350);
        flex-shrink: 0;
      }
      .area-add-row {
        display: flex;
        justify-content: flex-start;
      }
      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
        margin-top: 8px;
      }
      .section-label {
        font-size: 1rem;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      .secondary {
        color: var(--secondary-text-color);
        font-size: 0.875rem;
        margin: 0;
      }
      ha-expansion-panel {
        --expansion-panel-summary-padding: 12px 16px;
        --expansion-panel-content-padding: 0;
        display: block;
      }
      .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        width: 100%;
        padding: 4px 0;
      }
      .panel-heading {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }
      .panel-title {
        font-size: 1rem;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      .panel-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px;
        padding-top: 20px;
        border-top: 1px solid var(--divider-color);
      }
      .chip-preview {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border-radius: 18px;
        padding: 4px 10px;
        background: var(--secondary-background-color);
        font-size: 0.85rem;
        font-weight: 500;
      }
      .chip-preview ha-icon {
        --mdc-icon-size: 18px;
      }
      .chip-preview-active {
        color: var(--primary-text-color);
      }
      .chip-preview-inactive {
        color: var(--disabled-text-color, var(--secondary-text-color));
      }

      /* Indicator preview — mirrors the runtime indicator styling so
         users see exactly what will render on the card. Self-contained
         because the editor lives in its own shadow DOM. */
      .indicator-preview-wrap {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .indicator-preview {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: var(--aac-indicator-size, 32px);
        height: var(--aac-indicator-size, 32px);
        border-radius: var(--aac-indicator-radius, 999px);
        background: color-mix(in srgb, var(--indicator-color) 18%, var(--secondary-background-color));
        color: var(--indicator-color);
        --mdc-icon-size: var(--aac-indicator-icon-size, 16px);
        transition: opacity 180ms ease;
      }
      .indicator-preview.indicator--dim {
        opacity: var(--aac-indicator-dim-opacity, 0.3);
      }
      .indicator-preview .indicator__badge {
        position: absolute;
        top: -4px;
        right: -4px;
        min-width: 14px;
        height: 14px;
        padding: 0 4px;
        border-radius: 999px;
        background: var(--indicator-color);
        color: white;
        font-size: 10px;
        line-height: 14px;
        text-align: center;
      }
      .indicator-preview.indicator--anim-spin .indicator-icon {
        animation: aac-spin var(--aac-indicator-anim-duration, 2.4s) linear infinite;
      }
      .indicator-preview.indicator--anim-pulse {
        animation: aac-pulse var(--aac-indicator-anim-duration, 2.4s) ease-in-out infinite;
      }
      .indicator-preview.indicator--anim-blink {
        animation: aac-blink var(--aac-indicator-anim-duration, 2.4s) steps(2, start) infinite;
      }
      .indicator-preview.indicator--anim-bounce {
        animation: aac-bounce var(--aac-indicator-anim-duration, 2.4s) ease-in-out infinite;
      }
      .indicator-preview.indicator--anim-shake .indicator-icon {
        animation: aac-shake var(--aac-indicator-anim-duration, 2.4s) ease-in-out infinite;
      }
      @keyframes aac-spin  { to { transform: rotate(360deg); } }
      @keyframes aac-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }
      @keyframes aac-blink { 0%,100% { opacity: 1; } 50% { opacity: 0.25; } }
      @keyframes aac-bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
      @keyframes aac-shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }
      .indicator-status-pill {
        font-size: 11px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 999px;
        text-transform: uppercase;
        letter-spacing: 0.02em;
      }
      .indicator-status-pill.status-active {
        background: color-mix(in srgb, var(--success-color, #43b581) 22%, transparent);
        color: var(--success-color, #43b581);
      }
      .indicator-status-pill.status-inactive {
        background: var(--secondary-background-color);
        color: var(--secondary-text-color);
      }
      .indicator-preview-inline {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 8px;
        background: var(--secondary-background-color);
        font-size: 0.85rem;
        flex-wrap: wrap;
      }
      .indicator-preview-inline code {
        font-size: 0.85rem;
        padding: 1px 4px;
        border-radius: 4px;
        background: var(--primary-background-color);
      }
      .indicator-preview-dot {
        width: 8px;
        height: 8px;
        border-radius: 999px;
        flex-shrink: 0;
      }
      .indicator-preview-dot.dot-active {
        background: var(--success-color, #43b581);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--success-color, #43b581) 25%, transparent);
      }
      .indicator-preview-dot.dot-inactive {
        background: var(--disabled-text-color, var(--secondary-text-color));
      }
      .button-row {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .toolbar {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .toolbar-spacer {
        flex: 1;
      }
      .add-indicator-row {
        display: flex;
        align-items: flex-end;
        gap: 8px;
        flex-wrap: wrap;
      }
      .add-indicator-row ha-form {
        flex: 1;
        min-width: 200px;
      }
      .threshold-section {
        display: flex;
        flex-direction: column;
        gap: 12px;
        border-top: 1px solid var(--divider-color);
        padding-top: 16px;
      }
      .threshold-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .threshold-row {
        display: flex;
        align-items: center;
        gap: 8px;
        border-left: 3px solid transparent;
        padding-left: 6px;
      }
      .threshold-row--unsorted {
        border-left-color: var(--warning-color, #ff9800);
      }
      .threshold-hint {
        display: none;
        flex: 1 1 auto;
        font-size: 12px;
        color: var(--warning-color, #ff9800);
      }
      .threshold-sort,
      .threshold-reset {
        display: none;
      }
      .threshold-section--modified .threshold-reset {
        display: inline-flex;
      }
      .threshold-section--unsorted .threshold-hint {
        display: block;
      }
      .threshold-section--unsorted .threshold-sort {
        display: inline-flex;
      }
      .threshold-row + .threshold-row {
        margin-top: 12px;
      }
      .threshold-fields {
        flex: 1 1 auto;
        min-width: 0;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 8px;
      }
      .threshold-fields .threshold-icon {
        grid-column: 1 / -1;
      }
      .threshold-row ha-icon-button {
        flex: 0 0 auto;
      }
      .override-panel {
        margin-bottom: 8px;
      }
      .override-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
      }
      .override-title {
        font-weight: 500;
        font-size: 14px;
      }
      .override-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 8px 0;
      }
      .rule-section {
        display: flex;
        flex-direction: column;
        gap: 10px;
        border-top: 1px solid var(--divider-color);
        padding-top: 16px;
      }
      .rule-row {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 10px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
      }
      .rule-row-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      .section-sublabel {
        font-weight: 500;
        font-size: 13px;
        color: var(--secondary-text-color);
      }
      .color-form {
        display: block;
      }
      .action-section {
        display: flex;
        flex-direction: column;
        gap: 8px;
        border-top: 1px solid var(--divider-color);
        padding-top: 16px;
      }
      .styling-group {
        margin-top: 8px;
        padding-top: 16px;
        border-top: 1px solid var(--divider-color);
      }
      .styling-group .section-label {
        display: block;
      }
      ha-button {
        cursor: pointer;
      }
      ha-button[disabled] {
        cursor: default;
      }
      ha-icon-button {
        --mdc-icon-button-size: 36px;
        --mdc-icon-size: 20px;
        color: var(--secondary-text-color);
        cursor: pointer;
      }
      ha-icon-button[disabled] {
        opacity: 0.4;
        cursor: default;
        pointer-events: none;
      }
      ha-icon-button.icon-button-danger {
        color: var(--error-color);
        --icon-primary-color: var(--error-color);
      }
      /* Fallback so ha-icon-button still looks like a button before upgrade. */
      ha-icon-button:not(:defined) {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 999px;
        border: none;
        background: transparent;
        color: var(--secondary-text-color);
        cursor: pointer;
        box-sizing: border-box;
      }
      ha-icon-button.icon-button-danger:not(:defined) {
        color: var(--error-color);
      }
      /* Fallback styling so buttons still look like buttons before the
         ha-button custom element has upgraded (or if it isn't registered). */
      ha-button:not(:defined) {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        height: 36px;
        padding: 0 16px;
        border-radius: 18px;
        border: 1px solid var(--primary-color);
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        font-family: var(--mdc-typography-button-font-family, var(--paper-font-body1_-_font-family, inherit));
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        user-select: none;
        box-sizing: border-box;
      }
      ha-button[size="s"]:not(:defined) {
        height: 32px;
        padding: 0 12px;
        font-size: 0.8125rem;
      }
      ha-button[appearance="filled"]:not(:defined) {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        border-color: var(--primary-color);
      }
      ha-button[appearance="outlined"]:not(:defined) {
        background: transparent;
        color: var(--primary-color);
        border-color: var(--primary-color);
      }
      ha-button[appearance="plain"]:not(:defined) {
        background: transparent;
        color: var(--primary-color);
        border-color: transparent;
      }
      ha-button[variant="danger"]:not(:defined) {
        color: var(--error-color);
      }
      ha-button[appearance="filled"][variant="danger"]:not(:defined) {
        background: var(--error-color);
        color: var(--text-primary-color, #fff);
        border-color: var(--error-color);
      }
      ha-button[appearance="outlined"][variant="danger"]:not(:defined) {
        background: transparent;
        color: var(--error-color);
        border-color: var(--error-color);
      }
      ha-button[disabled]:not(:defined) {
        opacity: 0.5;
        cursor: default;
        pointer-events: none;
      }
      ha-form {
        display: block;
      }
    `;
    AdvancedAreaCardEditor._stylesCache = css;
    return css;
  }

  // Called when an area selector changes. index is the slot index within
  // the rendered area list — it may be past the end of config.areas when it
  // refers to the pending "new" slot added by the Add area button (or the
  // initial empty slot shown before any area has been chosen).
  handleAreaSlotChange(index, newArea) {
    const existing = getConfigAreaIds(this._config);

    // Adding a new area (initial empty slot, or the pending "add" slot).
    if (index >= existing.length) {
      if (!newArea) return;
      if (existing.includes(newArea)) {
        // Duplicate — just collapse the pending slot.
        this._addingArea = false;
        this.render();
        return;
      }
      if (existing.length === 0) {
        // First area ever: start from a freshly normalized config so chips,
        // indicators, title and icon all reset cleanly.
        this._config = normalizeConfig({ type: DEFAULT_CARD_TYPE, areas: [newArea] });
        this._pendingIndicatorCandidate = "";
      } else {
        this._config.areas = [...existing, newArea];
        this._config.area = this._config.areas[0];
      }
      this._addingArea = false;
      this.emitConfig();
      this.render();
      return;
    }

    // Editing an existing slot.
    const current = existing[index];
    if (current === newArea) return;

    if (!newArea) {
      // User cleared the selector — drop that slot.
      const next = existing.filter((_, i) => i !== index);
      if (next.length === 0) {
        this._config = normalizeConfig({ type: DEFAULT_CARD_TYPE, areas: [] });
        this._pendingIndicatorCandidate = "";
        this._addingArea = false;
      } else {
        this._config.areas = next;
        this._config.area = next[0];
      }
      this.emitConfig();
      this.render();
      return;
    }

    if (existing.includes(newArea)) {
      // Duplicate — revert the UI to the current value.
      this.render();
      return;
    }

    const next = [...existing];
    next[index] = newArea;
    this._config.areas = next;
    this._config.area = next[0];
    this.emitConfig();
    this.render();
  }

  handleClick(event) {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;

    if (action === "show-add-area") {
      if (this._addingArea) return;
      this._addingArea = true;
      this.render();
      return;
    }
    if (action === "remove-area") {
      const index = Number(button.dataset.areaIndex);
      if (!Number.isFinite(index) || index < 0) return;
      const existing = getConfigAreaIds(this._config);
      // Pending "new" slot sits just past the committed area list.
      if (this._addingArea && index === existing.length) {
        this._addingArea = false;
        this.render();
        return;
      }
      if (index >= existing.length) return;
      const next = existing.filter((_, i) => i !== index);
      if (next.length === 0) {
        // Removing the last committed area resets the editor entirely.
        this._config = normalizeConfig({ type: DEFAULT_CARD_TYPE, areas: [] });
        this._pendingIndicatorCandidate = "";
        this._addingArea = false;
      } else {
        this._config.areas = next;
        this._config.area = next[0];
      }
      this.emitConfig();
      this.render();
      return;
    }
    if (action === "add-chip") {
      const type = button.dataset.type;
      if (type && CHIP_DEFINITIONS[type] && (type === "custom" || !this._config.chips.some((c) => c.type === type))) {
        this._config.chips = [...this._config.chips, createDefaultChip(type)];
        this.emitConfig();
        this.render();
      }
      return;
    }
    if (action === "remove-chip") {
      this._config.chips = this._config.chips.filter((_, i) => i !== Number(button.dataset.chipIndex));
      this.emitConfig();
      this.render();
      return;
    }
    if (action === "move-chip-up" || action === "move-chip-down") {
      const i = Number(button.dataset.chipIndex);
      this.moveItem(this._config.chips, i, i + (action === "move-chip-up" ? -1 : 1));
      this.emitConfig();
      this.render();
      return;
    }
    if (action === "add-all-entities") {
      const chipIndex = Number(button.dataset.chipIndex);
      const chip = this._config.chips[chipIndex];
      const areaIds = getConfigAreaIds(this._config);
      if (!chip || !this._hass || !this._registry || !areaIds.length) return;
      const candidates = getChipCandidates(this._hass, this._registry, areaIds, chip.type);
      chip.entity_ids = unique([...(chip.entity_ids || []), ...candidates]);
      this.emitConfig();
      this.render();
      return;
    }
    if (action === "reset-thresholds") {
      const chipIndex = Number(button.dataset.chipIndex);
      const chip = this._config.chips[chipIndex];
      if (!chip) return;
      const label = button.querySelector(".reset-label");
      // First click arms the button, the second one (within a few seconds) resets.
      if (this._resetArmed?.button !== button) {
        this._disarmReset();
        if (label) label.textContent = "Click again to reset";
        this._resetArmed = {
          button,
          label,
          timer: setTimeout(() => this._disarmReset(), RESET_CONFIRM_MS),
        };
        return;
      }
      this._disarmReset();
      chip.thresholds = defaultThresholds(chip.type);
      this.emitConfig();
      this.render();
      return;
    }
    if (action === "sort-thresholds") {
      const chip = this._config.chips[Number(button.dataset.chipIndex)];
      if (!chip || !Array.isArray(chip.thresholds)) return;
      chip.thresholds = [...chip.thresholds].sort((a, b) => a.value - b.value);
      this.emitConfig();
      this.render();
      return;
    }
    if (action === "add-threshold") {
      const chip = this._config.chips[Number(button.dataset.chipIndex)];
      chip.thresholds = [...(chip.thresholds || []), { value: 0, color: "#43b581" }];
      this.emitConfig();
      this.render();
      return;
    }
    if (action === "remove-threshold") {
      const chip = this._config.chips[Number(button.dataset.chipIndex)];
      chip.thresholds = chip.thresholds.filter((_, i) => i !== Number(button.dataset.thresholdIndex));
      this.emitConfig();
      this.render();
      return;
    }
    if (action === "remove-indicator") {
      this._config.activity_indicators = this._config.activity_indicators.filter((_, i) => i !== Number(button.dataset.indicatorIndex));
      this.emitConfig();
      this.render();
      return;
    }
    if (action === "move-indicator-up" || action === "move-indicator-down") {
      const i = Number(button.dataset.indicatorIndex);
      this.moveItem(this._config.activity_indicators, i, i + (action === "move-indicator-up" ? -1 : 1));
      this.emitConfig();
      this.render();
      return;
    }
    if (action === "add-indicator-condition") {
      const indicator = this._config.activity_indicators[Number(button.dataset.indicatorIndex)];
      if (!indicator) return;
      indicator.and_if = [...(indicator.and_if || []), { type: "state", entity_id: [], attribute: null, aggregation: "any", operator: "eq", value: "", for: 0 }];
      this.emitConfig();
      this.render();
      return;
    }
    if (action === "remove-indicator-condition") {
      const indicator = this._config.activity_indicators[Number(button.dataset.indicatorIndex)];
      if (!indicator) return;
      indicator.and_if = (indicator.and_if || []).filter((_, i) => i !== Number(button.dataset.conditionIndex));
      this.emitConfig();
      this.render();
      return;
    }
    if (action === "add-display-override") {
      const indicator = this._config.activity_indicators[Number(button.dataset.indicatorIndex)];
      if (!indicator) return;
      indicator.display = indicator.display || {};
      indicator.display.display_overrides = [
        ...(indicator.display.display_overrides || []),
        { match: { type: "numeric", operator: "gt", value: 0 } },
      ];
      this.emitConfig();
      this.render();
      return;
    }
    if (action === "remove-display-override") {
      const indicator = this._config.activity_indicators[Number(button.dataset.indicatorIndex)];
      if (!indicator || !indicator.display) return;
      indicator.display.display_overrides = (indicator.display.display_overrides || []).filter((_, i) => i !== Number(button.dataset.entryIndex));
      this.emitConfig();
      this.render();
      return;
    }
  }

  moveItem(list, from, to) {
    if (to < 0 || to >= list.length || from === to) {
      return;
    }
    const items = [...list];
    const [entry] = items.splice(from, 1);
    items.splice(to, 0, entry);
    list.length = 0;
    list.push(...items);
  }
}

if (!customElements.get(CARD_TYPE)) {
  customElements.define(CARD_TYPE, AdvancedAreaCard);
}
if (!customElements.get("advanced-area-card-editor")) {
  customElements.define("advanced-area-card-editor", AdvancedAreaCardEditor);
}

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === CARD_TYPE)) {
  window.customCards.push({
    type: CARD_TYPE,
    name: "Advanced Area",
    description: "Area summary card with chips, thresholds, and activity indicators.",
    preview: true,
    documentationURL: "https://github.com/riaan/advanced-area-card",
  });
}

console.info(`%c ADVANCED-AREA-CARD %c ${VERSION} `, "color: white; background: #1f6b8f; font-weight: 700;", "color: #1f6b8f; background: white; font-weight: 700;");
