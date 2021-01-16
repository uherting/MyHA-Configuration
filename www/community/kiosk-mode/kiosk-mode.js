"use strict";function e(e,t){return i(e)||o(e,t)||d(e,t)||n()}function n(){throw new TypeError(
"Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}
function o(e,t){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e)){var n=[],o=!0,i=!1,r=void 0;try{for(var a,s=e[Symbol.iterator]();!(o=(
a=s.next()).done)&&(n.push(a.value),!t||n.length!==t);o=!0);}catch(e){i=!0,r=e}finally{try{o||null==s.return||s.return()}finally{if(i)throw r}}
return n}}function i(e){if(Array.isArray(e))return e}function t(e){return s(e)||a(e)||d(e)||r()}function r(){throw new TypeError(
"Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function a(e){
if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}function s(e){if(Array.isArray(e))return c(e)}function _(e,t){var n
;if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(n=d(e))||t&&e&&"number"==typeof e.length){n&&(e=n);var o=0,t=function(
){};return{s:t,n:function(){return o>=e.length?{done:!0}:{done:!1,value:e[o++]}},e:function(e){throw e},f:t}}throw new TypeError(
"Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var i,r=!0,
a=!1;return{s:function(){n=e[Symbol.iterator]()},n:function(){var e=n.next();return r=e.done,e},e:function(e){a=!0,i=e},f:function(){try{
r||null==n.return||n.return()}finally{if(a)throw i}}}}function d(e,t){if(e){if("string"==typeof e)return c(e,t);var n=Object.prototype.toString.call(e
).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e
):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?c(e,t):void 0}}function c(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,
o=new Array(t);n<t;n++)o[n]=e[n];return o}var g=document.querySelector("home-assistant"),l=g.shadowRoot.querySelector("home-assistant-main"
).shadowRoot,u=l.querySelector("partial-panel-resolver"),S=l.querySelector("app-drawer-layout"),E=g.hass.user,x=0;function h(){var e,
t=l.querySelector("ha-panel-lovelace");!A("disable_km")&&t&&(e=g.hass.panelUrl,window.kioskModeEntities[e]||(window.kioskModeEntities[e]=[]),f(t,e))}
function f(t,n){x++;try{var e=t.lovelace.config.kiosk_mode||{};k(t,e,n)}catch(e){x<40?setTimeout(function(){return f(t)},50):(console.log(
"Lovelace config not found, continuing with default configuration."),k(t,{},n))}}function M(e){return Array.isArray(e)?e:[e]}function A(e){return M(e
).some(function(e){return window.location.search.includes(e)})}function I(e,t){M(e).forEach(function(e){return window.localStorage.setItem(e,t)})}
function j(e){return"true"==window.localStorage.getItem(e)}function m(e){return e.querySelector("#kiosk_mode_".concat(e.localName))}function O(e,t){
var n;m(t)||((n=document.createElement("style")).setAttribute("id","kiosk_mode_".concat(t.localName)),n.innerHTML=e,t.appendChild(n))}function q(e){M(
e).forEach(function(e){m(e)&&e.querySelector("#kiosk_mode_".concat(e.localName)).remove()})}function k(e,t,n){x=0;var o=e.shadowRoot.querySelector(
"hui-root").shadowRoot,i=o.querySelector("app-toolbar"),r=g.hass.states,a=t.admin_settings,s=t.non_admin_settings,d=t.entity_settings,
c=t.user_settings,l=t.mobile_settings,u=!1,h=!1,f=j("kmHeader")||A(["kiosk","hide_header"]),e=(m=j("kmSidebar")||A(["kiosk","hide_sidebar"]))||f,
f=e?f:t.kiosk||t.hide_header,m=e?m:t.kiosk||t.hide_sidebar;if(a&&E.is_admin&&(f=a.kiosk||a.hide_header,m=a.kiosk||a.hide_sidebar,
u=a.ignore_entity_settings,h=a.ignore_mobile_settings),s&&!E.is_admin&&(f=s.kiosk||s.hide_header,m=s.kiosk||s.hide_sidebar,u=s.ignore_entity_settings,
h=s.ignore_mobile_settings),c){var k=_(M(c));try{for(k.s();!(y=k.n()).done;){var y=y.value;M(y.users).some(function(e){return e.toLowerCase(
)==E.name.toLowerCase()})&&(f=y.kiosk||y.hide_header,m=y.kiosk||y.hide_sidebar,u=y.ignore_entity_settings,h=y.ignore_mobile_settings)}}catch(e){k.e(e)
}finally{k.f()}}if(l&&!h&&(c=l.custom_width||812,window.innerWidth<=c&&(f=l.kiosk||l.hide_header,m=l.kiosk||l.hide_sidebar,u=l.ignore_entity_settings)
),d&&!u){var w=_(d);try{for(w.s();!(v=w.n()).done;){var p=v.value,b=Object.keys(p.entity)[0],v=p.entity[b];window.kioskModeEntities[n].includes(b
)||window.kioskModeEntities[n].push(b),r[b].state==v&&("hide_header"in p&&(f=p.hide_header),"hide_sidebar"in p&&(m=p.hide_sidebar),"kiosk"in p&&(
f=m=p.kiosk))}}catch(e){w.e(e)}finally{w.f()}}f?(O("#view{min-height:100vh !important;--header-height:0;}app-header{display:none;}",o),A("cache")&&I(
"kmHeader","true")):q(o),m?(O(":host{--app-drawer-width:0 !important;}#drawer{display:none;}",S),O("ha-menu-button{display:none !important;}",i),A(
"cache")&&I("kmSidebar","true")):q([i,S]),window.dispatchEvent(new Event("resize"))}function y(){window.hassConnection.then(function(e){var t=e.conn
;t.connected&&(t.socket.onclose=function(){window.kioskModeEntities.interval=setInterval(function(){t.connected&&clearInterval(
window.kioskModeEntities.interval),y()},5e3)},t.socket.onmessage=function(t){var e=window.kioskModeEntities[g.hass.panelUrl]
;t.data&&e&&e.length&&e.some(function(e){return t.data.includes(e)&&t.data.includes("state_changed")})&&((e=JSON.parse(t.data).event.data
).new_state.state!=e.old_state.state&&h())},window.kioskModeEntities.watch=!0)})}function w(e){v(e,"ha-panel-lovelace",p)}function p(e){v(e,"hui-root"
,b)}function b(e){v(e,"ha-app-layout",null)}function v(e,t,n){e.forEach(function(e){e.addedNodes.forEach(function(e){e.localName==t&&(
n?new MutationObserver(n).observe(e.shadowRoot,{childList:!0}):h())})})}window.kioskModeEntities={},A("clear_km_cache")&&I(["kmHeader","kmSidebar"],
"false"),h(),window.kioskModeEntities.watch||y(),new MutationObserver(w).observe(u,{childList:!0});for(var L={header:"%c≡ kiosk-mode".padEnd(27),
ver:"%cversion 1.6.3 "},N="%c\n",C=Math.max.apply(Math,t(Object.values(L).map(function(e){return e.length}))),R=0,T=Object.entries(L);R<T.length;R++){
var H=e(T[R],1),U=H[0];L[U].length<=C&&(L[U]=L[U].padEnd(C)),"header"==U&&(L[U]="".concat(L[U].slice(0,-1),"⋮ "))}
var z="display:inline-block;border-width:1px 1px 0 1px;border-style:solid;border-color:#424242;color:white;background:#03a9f4;font-size:12px;padding:4px 4.5px 5px 6px;"
,J="border-width:0px 1px 1px 1px;padding:7px;background:white;color:#424242;line-height:0.7;";console.info(L.header+N+L.ver,z,"","".concat(z," "
).concat(J));