"use strict";function e(e,t){return o(e)||r(e,t)||c(e,t)||n()}function n(){throw new TypeError(
"Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}
function r(e,t){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e)){var n=[],r=!0,o=!1,a=void 0;try{for(var i,s=e[Symbol.iterator]();!(r=(
i=s.next()).done)&&(n.push(i.value),!t||n.length!==t);r=!0);}catch(e){o=!0,a=e}finally{try{r||null==s.return||s.return()}finally{if(o)throw a}}
return n}}function o(e){if(Array.isArray(e))return e}function t(e){return s(e)||i(e)||c(e)||a()}function a(){throw new TypeError(
"Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function i(e){
if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}function s(e){if(Array.isArray(e))return d(e)}function v(e,t){var n
;if("undefined"==typeof Symbol||null==e[Symbol.iterator]){if(Array.isArray(e)||(n=c(e))||t&&e&&"number"==typeof e.length){n&&(e=n);var r=0,t=function(
){};return{s:t,n:function(){return r>=e.length?{done:!0}:{done:!1,value:e[r++]}},e:function(e){throw e},f:t}}throw new TypeError(
"Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,a=!0,
i=!1;return{s:function(){n=e[Symbol.iterator]()},n:function(){var e=n.next();return a=e.done,e},e:function(e){i=!0,o=e},f:function(){try{
a||null==n.return||n.return()}finally{if(i)throw o}}}}function c(e,t){if(e){if("string"==typeof e)return d(e,t);var n=Object.prototype.toString.call(e
).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e
):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?d(e,t):void 0}}function d(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,
r=new Array(t);n<t;n++)r[n]=e[n];return r}var k=document.querySelector("home-assistant"),l=k.shadowRoot.querySelector("home-assistant-main"
).shadowRoot,u=l.querySelector("partial-panel-resolver"),b=l.querySelector("app-drawer-layout"),w=0;function h(){var e=l.querySelector(
"ha-panel-lovelace");!g("disable_km")&&e&&f(e)}function f(t){w++;try{var e=t.lovelace.config.kiosk_mode||{};m(t,e)}catch(e){w<40&&setTimeout(function(
){return f(t)},50)}}function _(e){return Array.isArray(e)?e:[e]}function g(e){return _(e).some(function(e){return window.location.search.includes(e)})
}function S(e,t){window.localStorage.setItem(e,t)}function x(e){return"true"==window.localStorage.getItem(e)}function y(e){return e.querySelector(
"#kiosk_mode_".concat(e.localName))}function A(e,t){var n;y(t)||((n=document.createElement("style")).setAttribute("id","kiosk_mode_".concat(
t.localName)),n.innerHTML=e,t.appendChild(n))}function I(e){_(e).forEach(function(e){y(e)&&e.querySelector("#kiosk_mode_".concat(e.localName)).remove(
)})}function m(e,t){w=0;var n=k.hass,r=e.shadowRoot.querySelector("hui-root").shadowRoot,o=r.querySelector("app-toolbar"),a=t.admin_settings,
i=t.non_admin_settings,s=t.entity_settings,c=t.user_settings,d=x("kmHeader")||g(["kiosk","hide_header"]),e=(l=x("kmSidebar")||g(["kiosk",
"hide_sidebar"]))||d,d=e?d:t.kiosk||t.hide_header,l=e?l:t.kiosk||t.hide_sidebar;if(a&&n.user.is_admin&&(d=a.kiosk||a.hide_header,
l=a.kiosk||a.hide_sidebar),i&&!n.user.is_admin&&(d=i.kiosk||i.hide_header,l=i.kiosk||i.hide_sidebar),s){var u=v(s);try{for(u.s();!(y=u.n()).done;){
var h=y.value,f=Object.keys(h.entity)[0],y=h.entity[f];window.kiosk_entities.push(f),n.states[f].state==y&&("hide_header"in h&&(d=h.hide_header),
"hide_sidebar"in h&&(l=h.hide_sidebar),"kiosk"in h&&(d=l=h.kiosk))}}catch(e){u.e(e)}finally{u.f()}}if(c){var m=v(_(c));try{for(m.s();!(p=m.n()).done;
){var p=p.value;_(p.users).some(function(e){return e.toLowerCase()==n.user.name.toLowerCase()})&&(d=p.kiosk||p.hide_header,l=p.kiosk||p.hide_sidebar)}
}catch(e){m.e(e)}finally{m.f()}}d?(A("#view{min-height:100vh !important}app-header{display:none}",r),g("cache")&&S("kmHeader","true")):I(r),l?(A(
":host{--app-drawer-width:0 !important}#drawer{display:none}",b),A("ha-menu-button{display:none !important}",o),g("cache")&&S("kmSidebar","true")):I([
o,b]),window.dispatchEvent(new Event("resize"))}function p(){window.hassConnection.then(function(e){var t=e.conn;t.socket.onclose=function(){
window.kiosk_interval=setInterval(function(){t.connected&&clearInterval(window.kiosk_interval),p()},1e3)},t.socket.onmessage=function(e){
window.kiosk_entities.length<1||!e.data||(e=JSON.parse(e.data).event)&&"state_changed"==e.event_type&&window.kiosk_entities.includes(e.data.entity_id
)&&e.data.new_state.state!=e.data.old_state.state&&h()}})}function j(e){q(e,"ha-panel-lovelace",E)}function E(e){q(e,"hui-root",O)}function O(e){q(e,
"ha-app-layout",null)}function q(e,t,n){var r,o=v(e);try{for(o.s();!(r=o.n()).done;){var a=v(r.value.addedNodes);try{for(a.s();!(i=a.n()).done;){
var i=i.value;if(i.localName==t)return void(n?new MutationObserver(n).observe(i.shadowRoot,{childList:!0}):h())}}catch(e){a.e(e)}finally{a.f()}}
}catch(e){o.e(e)}finally{o.f()}}window.kiosk_entities=[],g("clear_km_cache")&&["kmHeader","kmSidebar"].forEach(function(e){return S(e,"false")}),h(),
p(),new MutationObserver(j).observe(u,{childList:!0});for(var M={header:"%c≡ kiosk-mode".padEnd(27),ver:"%cversion 1.5.8 "},N="%c\n",C=Math.max.apply(
Math,t(Object.values(M).map(function(e){return e.length}))),L=0,R=Object.entries(M);L<R.length;L++){var T=e(R[L],1),H=T[0];M[H].length<=C&&(
M[H]=M[H].padEnd(C)),"header"==H&&(M[H]="".concat(M[H].slice(0,-1),"⋮ "))}
var z="display:inline-block;border-width:1px 1px 0 1px;border-style:solid;border-color:#424242;color:white;background:#03a9f4;font-size:12px;padding:4px 4.5px 5px 6px;"
,J="border-width:0px 1px 1px 1px;padding:7px;background:white;color:#424242;line-height:0.7;";console.info(M.header+N+M.ver,z,"","".concat(z," "
).concat(J));