"use strict";function e(e,t){return r(e)||o(e,t)||c(e,t)||n()}function n(){throw new TypeError(
"Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}
function o(e,t){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e)){var n=[],o=!0,r=!1,i=void 0;try{for(var a,s=e[Symbol.iterator]();!(o=(
a=s.next()).done)&&(n.push(a.value),!t||n.length!==t);o=!0);}catch(e){r=!0,i=e}finally{try{o||null==s.return||s.return()}finally{if(r)throw i}}
return n}}function r(e){if(Array.isArray(e))return e}function t(e){return s(e)||a(e)||c(e)||i()}function i(){throw new TypeError(
"Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function a(e){
if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}function s(e){if(Array.isArray(e))return d(e)}function v(e,t){var n
;if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(n=c(e))||t&&e&&"number"==typeof e.length){n&&(e=n);var o=0,t=function(
){};return{s:t,n:function(){return o>=e.length?{done:!0}:{done:!1,value:e[o++]}},e:function(e){throw e},f:t}}throw new TypeError(
"Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var r,i=!0,
a=!1;return{s:function(){n=e[Symbol.iterator]()},n:function(){var e=n.next();return i=e.done,e},e:function(e){a=!0,r=e},f:function(){try{
i||null==n.return||n.return()}finally{if(a)throw r}}}}function c(e,t){if(e){if("string"==typeof e)return d(e,t);var n=Object.prototype.toString.call(e
).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e
):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?d(e,t):void 0}}function d(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,
o=new Array(t);n<t;n++)o[n]=e[n];return o}var b=document.querySelector("home-assistant"),l=b.shadowRoot.querySelector("home-assistant-main"
).shadowRoot,u=l.querySelector("partial-panel-resolver"),_=l.querySelector("app-drawer-layout"),g=b.hass.user,S=0;function h(){var e,
t=l.querySelector("ha-panel-lovelace");!x("disable_km")&&t&&(e=b.hass.panelUrl,window.kioskModeEntities[e]||(window.kioskModeEntities[e]=[]),f(t,e))}
function f(t,n){S++;try{var e=t.lovelace.config.kiosk_mode||{};m(t,e,n)}catch(e){S<40?setTimeout(function(){return f(t)},50):(console.log(
"Lovelace config not found, continuing with default configuration."),m(t,{},n))}}function E(e){return Array.isArray(e)?e:[e]}function x(e){return E(e
).some(function(e){return window.location.search.includes(e)})}function M(e,t){E(e).forEach(function(e){return window.localStorage.setItem(e,t)})}
function A(e){return"true"==window.localStorage.getItem(e)}function y(e){return e.querySelector("#kiosk_mode_".concat(e.localName))}function I(e,t){
var n;y(t)||((n=document.createElement("style")).setAttribute("id","kiosk_mode_".concat(t.localName)),n.innerHTML=e,t.appendChild(n))}function j(e){E(
e).forEach(function(e){y(e)&&e.querySelector("#kiosk_mode_".concat(e.localName)).remove()})}function m(e,t,n){S=0;var o=e.shadowRoot.querySelector(
"hui-root").shadowRoot,r=o.querySelector("app-toolbar"),i=b.hass.states,a=t.admin_settings,s=t.non_admin_settings,c=t.entity_settings,
d=t.user_settings,l=!1,u=A("kmHeader")||x(["kiosk","hide_header"]),e=(h=A("kmSidebar")||x(["kiosk","hide_sidebar"]))||u,u=e?u:t.kiosk||t.hide_header,
h=e?h:t.kiosk||t.hide_sidebar;if(a&&g.is_admin&&(u=a.kiosk||a.hide_header,h=a.kiosk||a.hide_sidebar,l=a.ignore_entity_settings),s&&!g.is_admin&&(
u=s.kiosk||s.hide_header,h=s.kiosk||s.hide_sidebar,l=s.ignore_entity_settings),d){var f=v(E(d));try{for(f.s();!(y=f.n()).done;){var y=y.value;E(
y.users).some(function(e){return e.toLowerCase()==g.name.toLowerCase()})&&(u=y.kiosk||y.hide_header,h=y.kiosk||y.hide_sidebar,
l=y.ignore_entity_settings)}}catch(e){f.e(e)}finally{f.f()}}if(c&&!l){var m=v(c);try{for(m.s();!(w=m.n()).done;){var k=w.value,p=Object.keys(k.entity
)[0],w=k.entity[p];window.kioskModeEntities[n].includes(p)||window.kioskModeEntities[n].push(p),i[p].state==w&&("hide_header"in k&&(u=k.hide_header),
"hide_sidebar"in k&&(h=k.hide_sidebar),"kiosk"in k&&(u=h=k.kiosk))}}catch(e){m.e(e)}finally{m.f()}}u?(I(
"#view{min-height:100vh !important;--header-height:0;}app-header{display:none;}",o),x("cache")&&M("kmHeader","true")):j(o),h?(I(
":host{--app-drawer-width:0 !important;}#drawer{display:none;}",_),I("ha-menu-button{display:none !important;}",r),x("cache")&&M("kmSidebar","true")
):j([r,_]),window.dispatchEvent(new Event("resize"))}function k(){window.hassConnection.then(function(e){var t=e.conn;t.connected&&(
t.socket.onclose=function(){window.kioskModeEntities.interval=setInterval(function(){t.connected&&clearInterval(window.kioskModeEntities.interval),k()
},5e3)},t.socket.onmessage=function(t){var e=window.kioskModeEntities[b.hass.panelUrl];t.data&&e&&e.length&&e.some(function(e){return t.data.includes(
e)&&t.data.includes("state_changed")})&&((e=JSON.parse(t.data).event.data).new_state.state!=e.old_state.state&&h())},window.kioskModeEntities.watch=!0
)})}function p(e){q(e,"ha-panel-lovelace",w)}function w(e){q(e,"hui-root",O)}function O(e){q(e,"ha-app-layout",null)}function q(e,t,n){e.forEach(
function(e){e.addedNodes.forEach(function(e){e.localName==t&&(n?new MutationObserver(n).observe(e.shadowRoot,{childList:!0}):h())})})}
window.kioskModeEntities={},x("clear_km_cache")&&M(["kmHeader","kmSidebar"],"false"),h(),window.kioskModeEntities.watch||k(),new MutationObserver(p
).observe(u,{childList:!0});for(var L={header:"%c≡ kiosk-mode".padEnd(27),ver:"%cversion 1.6.2 "},N="%c\n",C=Math.max.apply(Math,t(Object.values(L
).map(function(e){return e.length}))),R=0,T=Object.entries(L);R<T.length;R++){var H=e(T[R],1),U=H[0];L[U].length<=C&&(L[U]=L[U].padEnd(C)),
"header"==U&&(L[U]="".concat(L[U].slice(0,-1),"⋮ "))}
var z="display:inline-block;border-width:1px 1px 0 1px;border-style:solid;border-color:#424242;color:white;background:#03a9f4;font-size:12px;padding:4px 4.5px 5px 6px;"
,J="border-width:0px 1px 1px 1px;padding:7px;background:white;color:#424242;line-height:0.7;";console.info(L.header+N+L.ver,z,"","".concat(z," "
).concat(J));