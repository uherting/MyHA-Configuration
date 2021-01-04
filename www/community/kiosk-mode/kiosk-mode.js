"use strict";function e(e,r){return o(e)||n(e,r)||d(e,r)||t()}function t(){throw new TypeError(
"Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}
function n(e,r){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e)){var t=[],n=!0,o=!1,a=void 0;try{for(var i,l=e[Symbol.iterator]();!(n=(
i=l.next()).done)&&(t.push(i.value),!r||t.length!==r);n=!0);}catch(e){o=!0,a=e}finally{try{n||null==l.return||l.return()}finally{if(o)throw a}}
return t}}function o(e){if(Array.isArray(e))return e}function r(e){return l(e)||i(e)||d(e)||a()}function a(){throw new TypeError(
"Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function i(e){
if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}function l(e){if(Array.isArray(e))return c(e)}function u(e,r){var t
;if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(t=d(e))||r&&e&&"number"==typeof e.length){t&&(e=t);var n=0,r=function(
){};return{s:r,n:function(){return n>=e.length?{done:!0}:{done:!1,value:e[n++]}},e:function(e){throw e},f:r}}throw new TypeError(
"Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,a=!0,
i=!1;return{s:function(){t=e[Symbol.iterator]()},n:function(){var e=t.next();return a=e.done,e},e:function(e){i=!0,o=e},f:function(){try{
a||null==t.return||t.return()}finally{if(i)throw o}}}}function d(e,r){if(e){if("string"==typeof e)return c(e,r);var t=Object.prototype.toString.call(e
).slice(8,-1);return"Object"===t&&e.constructor&&(t=e.constructor.name),"Map"===t||"Set"===t?Array.from(e
):"Arguments"===t||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)?c(e,r):void 0}}function c(e,r){(null==r||r>e.length)&&(r=e.length);for(var t=0,
n=new Array(r);t<r;t++)n[t]=e[t];return n}var s,f=document.querySelector("home-assistant"),h=f.shadowRoot.querySelector("home-assistant-main"
).shadowRoot,y=h.querySelector("partial-panel-resolver"),v=h.querySelector("app-drawer-layout"),m=0,p={};function b(){m++;try{var e=s.lovelace.config
;p=e.kiosk_mode||{},A()}catch(e){m<40&&setTimeout(function(){return b()},50)}}function w(e){var r=window.location.search;return e.some(function(e){
return r.includes(e)})}function k(e){return e&&!e.querySelector("#kiosk_mode")}function S(e,r){var t=document.createElement("style");t.setAttribute(
"id","kiosk_mode"),t.innerHTML=e,r.appendChild(t),window.dispatchEvent(new Event("resize"))}function g(e,r){window.localStorage.setItem(e,r)}
function _(e){return"true"==window.localStorage.getItem(e)}function x(){s=h.querySelector("ha-panel-lovelace"),!window.location.search.includes(
"disable_km")&&s&&b()}function A(){var r=f.hass;m=0;var e=_("kmHeader")||w(["kiosk","hide_header"]),t=_("kmSidebar")||w(["kiosk","hide_sidebar"]),
n=p.admin_settings,o=p.non_admin_settings,a=p.user_settings,i=t||e,e=i?e:p.kiosk||p.hide_header,t=i?t:p.kiosk||p.hide_sidebar;if(n&&r.user.is_admin&&(
e=n.kiosk||n.hide_header,t=n.kiosk||n.hide_sidebar),o&&!r.user.is_admin&&(e=o.kiosk||o.hide_header,t=o.kiosk||o.hide_sidebar),a){Array.isArray(a)||(
a=[a]);var l=u(a);try{for(l.s();!(c=l.n()).done;){var d=c.value,c=d.users;Array.isArray(d.users)||(c=[c]),c.some(function(e){return e.toLowerCase(
)==r.user.name.toLowerCase()})&&(e=d.kiosk||d.hide_header,t=d.kiosk||d.hide_sidebar)}}catch(e){l.e(e)}finally{l.f()}}(t||e)&&(o=(a=(o=h.querySelector(
"ha-panel-lovelace"))?o.shadowRoot.querySelector("hui-root").shadowRoot:null)?a.querySelector("app-toolbar"):null,e&&k(a)&&(S(
"#view { min-height: 100vh !important } app-header { display: none }",a),url.includes("cache")&&g("kmHeader","true")),t&&k(v)&&(S(
":host { --app-drawer-width: 0 !important } #drawer { display: none }",v),k(o)&&S("ha-menu-button { display:none !important } ",o),url.includes(
"cache")&&g("kmSidebar","true")))}function j(e){var r,t=u(e);try{for(t.s();!(r=t.n()).done;){var n=u(r.value.addedNodes);try{for(n.s();!(o=n.n()
).done;){var o=o.value;if("ha-panel-lovelace"==o.localName)return void new MutationObserver(q).observe(o.shadowRoot,{childList:!0})}}catch(e){n.e(e)
}finally{n.f()}}}catch(e){t.e(e)}finally{t.f()}}function q(e){var r,t=u(e);try{for(t.s();!(r=t.n()).done;){var n=u(r.value.addedNodes);try{for(n.s(
);!(o=n.n()).done;){var o=o.value;if("hui-root"==o.localName)return void new MutationObserver(E).observe(o.shadowRoot,{childList:!0})}}catch(e){n.e(e)
}finally{n.f()}}}catch(e){t.e(e)}finally{t.f()}}function E(e){var r,t=u(e);try{for(t.s();!(r=t.n()).done;){var n,o=u(r.value.addedNodes);try{for(o.s(
);!(n=o.n()).done;)if("ha-app-layout"==n.value.localName)return p={},void x()}catch(e){o.e(e)}finally{o.f()}}}catch(e){t.e(e)}finally{t.f()}}
window.location.search.includes("clear_km_cache")&&["kmHeader","kmSidebar"].forEach(function(e){return g(e,"false")}),x(),new MutationObserver(j
).observe(y,{childList:!0});for(var I={header:"%c≡ kiosk-mode".padEnd(27),ver:"%cversion 1.5.3 "},O="%c\n",M=Math.max.apply(Math,r(Object.values(I
).map(function(e){return e.length}))),L=0,N=Object.entries(I);L<N.length;L++){var R=e(N[L],1),T=R[0];I[T].length<=M&&(I[T]=I[T].padEnd(M)),
"header"==T&&(I[T]="".concat(I[T].slice(0,-1),"⋮ "))}
var C="display:inline-block;border-width:1px 1px 0 1px;border-style:solid;border-color:#424242;color:white;background:#03a9f4;font-size:12px;padding:4px 4.5px 5px 6px;"
,H="border-width:0px 1px 1px 1px;padding:7px;background:white;color:#424242;line-height:0.7;";console.info(I.header+O+I.ver,C,"","".concat(C," "
).concat(H));