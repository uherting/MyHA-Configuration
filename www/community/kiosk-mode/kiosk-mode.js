"use strict";function e(e,r){return o(e)||t(e,r)||c(e,r)||n()}function n(){throw new TypeError(
"Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}
function t(e,r){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e)){var n=[],t=!0,o=!1,a=void 0;try{for(var i,l=e[Symbol.iterator]();!(t=(
i=l.next()).done)&&(n.push(i.value),!r||n.length!==r);t=!0);}catch(e){o=!0,a=e}finally{try{t||null==l.return||l.return()}finally{if(o)throw a}}
return n}}function o(e){if(Array.isArray(e))return e}function r(e){return l(e)||i(e)||c(e)||a()}function a(){throw new TypeError(
"Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function i(e){
if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}function l(e){if(Array.isArray(e))return d(e)}function f(e,r){var n
;if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(n=c(e))||r&&e&&"number"==typeof e.length){n&&(e=n);var t=0,r=function(
){};return{s:r,n:function(){return t>=e.length?{done:!0}:{done:!1,value:e[t++]}},e:function(e){throw e},f:r}}throw new TypeError(
"Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,a=!0,
i=!1;return{s:function(){n=e[Symbol.iterator]()},n:function(){var e=n.next();return a=e.done,e},e:function(e){i=!0,o=e},f:function(){try{
a||null==n.return||n.return()}finally{if(i)throw o}}}}function c(e,r){if(e){if("string"==typeof e)return d(e,r);var n=Object.prototype.toString.call(e
).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e
):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?d(e,r):void 0}}function d(e,r){(null==r||r>e.length)&&(r=e.length);for(var n=0,
t=new Array(r);n<r;n++)t[n]=e[n];return t}var h=document.querySelector("home-assistant"),y=h.shadowRoot.querySelector("home-assistant-main"
).shadowRoot,s=y.querySelector("partial-panel-resolver"),v=y.querySelector("app-drawer-layout"),m=0;function p(){var e=y.querySelector(
"ha-panel-lovelace");return e&&(!e.lovelace||!e.lovelace.config)&&m<10&&(m++,setTimeout(function(){return p()},50)),
e&&e.lovelace&&e.lovelace.config&&e.lovelace.config.kiosk_mode?e.lovelace.config.kiosk_mode:{}}function b(e){var r=window.location.search
;return e.some(function(e){return r.includes(e)})}function w(e){return e&&!e.querySelector("#kiosk_mode")}function k(e,r){
var n=document.createElement("style");n.setAttribute("id","kiosk_mode"),n.innerHTML=e,r.appendChild(n),window.dispatchEvent(new Event("resize"))}
function g(e,r){window.localStorage.setItem(e,r)}function S(e){return"true"==window.localStorage.getItem(e)}function u(){var e=window.location.search,
r=h.hass;if(!e.includes("disable_km")){var n=S("kmHeader")||b(["kiosk","hide_header"]),t=S("kmSidebar")||b(["kiosk","hide_sidebar"]),o=p();m=0
;var a=o.admin_settings,i=o.non_admin_settings,l=o.user_settings,c=t||n,n=c?n:o.kiosk||o.hide_header,t=c?t:o.kiosk||o.hide_sidebar;if(
a&&r.user.is_admin&&(n=a.kiosk||a.hide_header,t=a.kiosk||a.hide_sidebar),i&&!r.user.is_admin&&(n=i.kiosk||i.hide_header,t=i.kiosk||i.hide_sidebar),l){
Array.isArray(l)||(l=[l]);var d=f(l);try{for(d.s();!(u=d.n()).done;){var s=u.value,u=s.users;Array.isArray(s.users)||(u=[u]),u.some(function(e){
return e.toLowerCase()==r.user.name.toLowerCase()})&&(n=s.kiosk||s.hide_header,t=s.kiosk||s.hide_sidebar)}}catch(e){d.e(e)}finally{d.f()}}(t||n)&&(i=(
l=(i=y.querySelector("ha-panel-lovelace"))?i.shadowRoot.querySelector("hui-root").shadowRoot:null)?l.querySelector("app-toolbar"):null,n&&w(l)&&(k(
"#view { min-height: 100vh !important } app-header { display: none }",l),e.includes("cache")&&g("kmHeader","true")),t&&w(v)&&(k(
":host { --app-drawer-width: 0 !important } #drawer { display: none }",v),w(i)&&k("ha-menu-button { display:none !important } ",i),e.includes("cache"
)&&g("kmSidebar","true")))}}function _(e){var r,n=f(e);try{for(n.s();!(r=n.n()).done;){var t=f(r.value.addedNodes);try{for(t.s();!(o=t.n()).done;){
var o=o.value;if("ha-panel-lovelace"==o.localName)return void new MutationObserver(x).observe(o.shadowRoot,{childList:!0})}}catch(e){t.e(e)}finally{
t.f()}}}catch(e){n.e(e)}finally{n.f()}}function x(e){var r,n=f(e);try{for(n.s();!(r=n.n()).done;){var t=f(r.value.addedNodes);try{for(t.s();!(o=t.n()
).done;){var o=o.value;if("hui-root"==o.localName)return void new MutationObserver(A).observe(o.shadowRoot,{childList:!0})}}catch(e){t.e(e)}finally{
t.f()}}}catch(e){n.e(e)}finally{n.f()}}function A(e){var r,n=f(e);try{for(n.s();!(r=n.n()).done;){var t,o=f(r.value.addedNodes);try{for(o.s();!(t=o.n(
)).done;)if("ha-app-layout"==t.value.localName)return void u()}catch(e){o.e(e)}finally{o.f()}}}catch(e){n.e(e)}finally{n.f()}}
window.location.search.includes("clear_km_cache")&&["kmHeader","kmSidebar"].forEach(function(e){return g(e,"false")}),u(),new MutationObserver(_
).observe(s,{childList:!0});for(var j={header:"%c≡ kiosk-mode".padEnd(27),ver:"%cversion 1.4.8 "},q="%c\n",E=Math.max.apply(Math,r(Object.values(j
).map(function(e){return e.length}))),I=0,O=Object.entries(j);I<O.length;I++){var M=e(O[I],1),L=M[0];j[L].length<=E&&(j[L]=j[L].padEnd(E)),
"header"==L&&(j[L]="".concat(j[L].slice(0,-1),"⋮ "))}
var N="display:inline-block;border-width:1px 1px 0 1px;border-style:solid;border-color:#424242;color:white;background:#03a9f4;font-size:12px;padding:4px 4.5px 5px 6px;"
,R="border-width:0px 1px 1px 1px;padding:7px;background:white;color:#424242;line-height:0.7;";console.info(j.header+q+j.ver,N,"","".concat(N," "
).concat(R));