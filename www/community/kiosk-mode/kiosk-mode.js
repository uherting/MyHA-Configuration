"use strict";function e(e,t){return o(e)||n(e,t)||d(e,t)||r()}function r(){throw new TypeError(
"Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}
function n(e,t){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e)){var r=[],n=!0,o=!1,a=void 0;try{for(var i,s=e[Symbol.iterator]();!(n=(
i=s.next()).done)&&(r.push(i.value),!t||r.length!==t);n=!0);}catch(e){o=!0,a=e}finally{try{n||null==s.return||s.return()}finally{if(o)throw a}}
return r}}function o(e){if(Array.isArray(e))return e}function t(e){return s(e)||i(e)||d(e)||a()}function a(){throw new TypeError(
"Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function i(e){
if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}function s(e){if(Array.isArray(e))return l(e)}function v(e,t){var r
;if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(r=d(e))||t&&e&&"number"==typeof e.length){r&&(e=r);var n=0,t=function(
){};return{s:t,n:function(){return n>=e.length?{done:!0}:{done:!1,value:e[n++]}},e:function(e){throw e},f:t}}throw new TypeError(
"Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,a=!0,
i=!1;return{s:function(){r=e[Symbol.iterator]()},n:function(){var e=r.next();return a=e.done,e},e:function(e){i=!0,o=e},f:function(){try{
a||null==r.return||r.return()}finally{if(i)throw o}}}}function d(e,t){if(e){if("string"==typeof e)return l(e,t);var r=Object.prototype.toString.call(e
).slice(8,-1);return"Object"===r&&e.constructor&&(r=e.constructor.name),"Map"===r||"Set"===r?Array.from(e
):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?l(e,t):void 0}}function l(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,
n=new Array(t);r<t;r++)n[r]=e[r];return n}var m=document.querySelector("home-assistant"),k=m.shadowRoot.querySelector("home-assistant-main"
).shadowRoot,c=k.querySelector("partial-panel-resolver"),p=k.querySelector("app-drawer-layout");window.kiosk_entities=[];var u,w=0,b={};function h(){
w++;try{var e=u.lovelace.config;b=e.kiosk_mode||{},y()}catch(e){w<40&&setTimeout(function(){return h()},50)}}function _(e){
var t=window.location.search;return e.some(function(e){return t.includes(e)})}function S(e){return e&&!e.querySelector("#kiosk_mode")}function g(e,t){
var r=document.createElement("style"),n="app-toolbar"==t.localName?"kiosk_mode_menu":"kiosk_mode";r.setAttribute("id",n),r.innerHTML=e,t.appendChild(r
),window.dispatchEvent(new Event("resize"))}function x(e,t){window.localStorage.setItem(e,t)}function A(e){return"true"==window.localStorage.getItem(e
)}function f(){u=k.querySelector("ha-panel-lovelace"),!window.location.search.includes("disable_km")&&u&&h()}function y(){var t=m.hass;w=0;var e=A(
"kmHeader")||_(["kiosk","hide_header"]),r=A("kmSidebar")||_(["kiosk","hide_sidebar"]),n=b.admin_settings,o=b.non_admin_settings,a=b.user_settings,
i=b.entity_settings,s=r||e,e=s?e:b.kiosk||b.hide_header,r=s?r:b.kiosk||b.hide_sidebar;if(n&&t.user.is_admin&&(e=n.kiosk||n.hide_header,
r=n.kiosk||n.hide_sidebar),o&&!t.user.is_admin&&(e=o.kiosk||o.hide_header,r=o.kiosk||o.hide_sidebar),a){Array.isArray(a)||(a=[a]);var d=v(a);try{for(
d.s();!(c=d.n()).done;){var l=c.value,c=l.users;Array.isArray(l.users)||(c=[c]),c.some(function(e){return e.toLowerCase()==t.user.name.toLowerCase()}
)&&(e=l.kiosk||l.hide_header,r=l.kiosk||l.hide_sidebar)}}catch(e){d.e(e)}finally{d.f()}}if(i){var u=v(i);try{for(u.s();!(y=u.n()).done;){var h=y.value
,f=Object.keys(h.entity)[0];window.kiosk_entities.includes(f)||window.kiosk_entities.push(f);var y=h.entity[f];t.states[f].state==y&&("kiosk"in h?(
e=h.kiosk,r=h.kiosk):("hide_header"in h&&(e=h.hide_header),"hide_sidebar"in h&&(r=h.hide_sidebar)))}}catch(e){u.e(e)}finally{u.f()}}a=k.querySelector(
"ha-panel-lovelace"),i=a?a.shadowRoot.querySelector("hui-root").shadowRoot:null,a=i?i.querySelector("app-toolbar"):null;(r||e)&&(e&&S(i)&&(g(
"#view { min-height: 100vh !important } app-header { display: none }",i),url.includes("cache")&&x("kmHeader","true")),r&&S(p)&&(g(
":host { --app-drawer-width: 0 !important } #drawer { display: none }",p),S(a)&&g("ha-menu-button { display:none !important } ",a),url.includes(
"cache")&&x("kmSidebar","true"))),e||S(i)||i.querySelector("#kiosk_mode").remove(),r||S(p)||p.querySelector("#kiosk_mode").remove(),
!r&&a.querySelector("#kiosk_mode_menu")&&a.querySelector("#kiosk_mode_menu").remove(),window.dispatchEvent(new Event("resize"))}function q(e){var t,
r=v(e);try{for(r.s();!(t=r.n()).done;){var n=v(t.value.addedNodes);try{for(n.s();!(o=n.n()).done;){var o=o.value;if("ha-panel-lovelace"==o.localName
)return void new MutationObserver(E).observe(o.shadowRoot,{childList:!0})}}catch(e){n.e(e)}finally{n.f()}}}catch(e){r.e(e)}finally{r.f()}}function E(e
){var t,r=v(e);try{for(r.s();!(t=r.n()).done;){var n=v(t.value.addedNodes);try{for(n.s();!(o=n.n()).done;){var o=o.value;if("hui-root"==o.localName
)return void new MutationObserver(O).observe(o.shadowRoot,{childList:!0})}}catch(e){n.e(e)}finally{n.f()}}}catch(e){r.e(e)}finally{r.f()}}function O(e
){var t,r=v(e);try{for(r.s();!(t=r.n()).done;){var n,o=v(t.value.addedNodes);try{for(o.s();!(n=o.n()).done;)if("ha-app-layout"==n.value.localName
)return window.kiosk_entities=[],b={},void f()}catch(e){o.e(e)}finally{o.f()}}}catch(e){r.e(e)}finally{r.f()}}window.location.search.includes(
"clear_km_cache")&&["kmHeader","kmSidebar"].forEach(function(e){return x(e,"false")}),f(),new MutationObserver(q).observe(c,{childList:!0}),
window.hassConnection.then(function(e){return e.conn.socket.onmessage=function(e){window.kiosk_entities.length<1||(e=JSON.parse(e.data).event
)&&"state_changed"==e.event_type&&e.data.new_state.state!=e.data.old_state.state&&window.kiosk_entities.includes(e.data.entity_id)&&(b={},f())}});for(
var j={header:"%c≡ kiosk-mode".padEnd(27),ver:"%cversion 1.5.4 "},I="%c\n",N=Math.max.apply(Math,t(Object.values(j).map(function(e){return e.length}))
),M=0,L=Object.entries(j);M<L.length;M++){var R=e(L[M],1),C=R[0];j[C].length<=N&&(j[C]=j[C].padEnd(N)),"header"==C&&(j[C]="".concat(j[C].slice(0,-1),
"⋮ "))}
var T="display:inline-block;border-width:1px 1px 0 1px;border-style:solid;border-color:#424242;color:white;background:#03a9f4;font-size:12px;padding:4px 4.5px 5px 6px;"
,H="border-width:0px 1px 1px 1px;padding:7px;background:white;color:#424242;line-height:0.7;";console.info(j.header+I+j.ver,T,"","".concat(T," "
).concat(H));