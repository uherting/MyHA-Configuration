/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
function t(t,e,i,n){var s,o=arguments.length,r=o<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,i):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,i,n);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(r=(o<3?s(r):o>3?s(e,i,r):s(e,i))||r);return o>3&&r&&Object.defineProperty(e,i,r),r
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */}const e="undefined"!=typeof window&&null!=window.customElements&&void 0!==window.customElements.polyfillWrapFlushCallback,i=(t,e,i=null)=>{for(;e!==i;){const i=e.nextSibling;t.removeChild(e),e=i}},n=`{{lit-${String(Math.random()).slice(2)}}}`,s=`\x3c!--${n}--\x3e`,o=new RegExp(`${n}|${s}`);class r{constructor(t,e){this.parts=[],this.element=e;const i=[],s=[],r=document.createTreeWalker(e.content,133,null,!1);let c=0,h=-1,u=0;const{strings:p,values:{length:g}}=t;for(;u<g;){const t=r.nextNode();if(null!==t){if(h++,1===t.nodeType){if(t.hasAttributes()){const e=t.attributes,{length:i}=e;let n=0;for(let t=0;t<i;t++)a(e[t].name,"$lit$")&&n++;for(;n-- >0;){const e=p[u],i=d.exec(e)[2],n=i.toLowerCase()+"$lit$",s=t.getAttribute(n);t.removeAttribute(n);const r=s.split(o);this.parts.push({type:"attribute",index:h,name:i,strings:r}),u+=r.length-1}}"TEMPLATE"===t.tagName&&(s.push(t),r.currentNode=t.content)}else if(3===t.nodeType){const e=t.data;if(e.indexOf(n)>=0){const n=t.parentNode,s=e.split(o),r=s.length-1;for(let e=0;e<r;e++){let i,o=s[e];if(""===o)i=l();else{const t=d.exec(o);null!==t&&a(t[2],"$lit$")&&(o=o.slice(0,t.index)+t[1]+t[2].slice(0,-"$lit$".length)+t[3]),i=document.createTextNode(o)}n.insertBefore(i,t),this.parts.push({type:"node",index:++h})}""===s[r]?(n.insertBefore(l(),t),i.push(t)):t.data=s[r],u+=r}}else if(8===t.nodeType)if(t.data===n){const e=t.parentNode;null!==t.previousSibling&&h!==c||(h++,e.insertBefore(l(),t)),c=h,this.parts.push({type:"node",index:h}),null===t.nextSibling?t.data="":(i.push(t),h--),u++}else{let e=-1;for(;-1!==(e=t.data.indexOf(n,e+1));)this.parts.push({type:"node",index:-1}),u++}}else r.currentNode=s.pop()}for(const t of i)t.parentNode.removeChild(t)}}const a=(t,e)=>{const i=t.length-e.length;return i>=0&&t.slice(i)===e},c=t=>-1!==t.index,l=()=>document.createComment(""),d=/([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;function h(t,e){const{element:{content:i},parts:n}=t,s=document.createTreeWalker(i,133,null,!1);let o=p(n),r=n[o],a=-1,c=0;const l=[];let d=null;for(;s.nextNode();){a++;const t=s.currentNode;for(t.previousSibling===d&&(d=null),e.has(t)&&(l.push(t),null===d&&(d=t)),null!==d&&c++;void 0!==r&&r.index===a;)r.index=null!==d?-1:r.index-c,o=p(n,o),r=n[o]}l.forEach(t=>t.parentNode.removeChild(t))}const u=t=>{let e=11===t.nodeType?0:1;const i=document.createTreeWalker(t,133,null,!1);for(;i.nextNode();)e++;return e},p=(t,e=-1)=>{for(let i=e+1;i<t.length;i++){const e=t[i];if(c(e))return i}return-1};
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const g=new WeakMap,m=t=>"function"==typeof t&&g.has(t),_={},f={};
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
class v{constructor(t,e,i){this.__parts=[],this.template=t,this.processor=e,this.options=i}update(t){let e=0;for(const i of this.__parts)void 0!==i&&i.setValue(t[e]),e++;for(const t of this.__parts)void 0!==t&&t.commit()}_clone(){const t=e?this.template.element.content.cloneNode(!0):document.importNode(this.template.element.content,!0),i=[],n=this.template.parts,s=document.createTreeWalker(t,133,null,!1);let o,r=0,a=0,l=s.nextNode();for(;r<n.length;)if(o=n[r],c(o)){for(;a<o.index;)a++,"TEMPLATE"===l.nodeName&&(i.push(l),s.currentNode=l.content),null===(l=s.nextNode())&&(s.currentNode=i.pop(),l=s.nextNode());if("node"===o.type){const t=this.processor.handleTextExpression(this.options);t.insertAfterNode(l.previousSibling),this.__parts.push(t)}else this.__parts.push(...this.processor.handleAttributeExpressions(l,o.name,o.strings,this.options));r++}else this.__parts.push(void 0),r++;return e&&(document.adoptNode(t),customElements.upgrade(t)),t}}
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const y=` ${n} `;class b{constructor(t,e,i,n){this.strings=t,this.values=e,this.type=i,this.processor=n}getHTML(){const t=this.strings.length-1;let e="",i=!1;for(let o=0;o<t;o++){const t=this.strings[o],r=t.lastIndexOf("\x3c!--");i=(r>-1||i)&&-1===t.indexOf("--\x3e",r+1);const a=d.exec(t);e+=null===a?t+(i?y:s):t.substr(0,a.index)+a[1]+a[2]+"$lit$"+a[3]+n}return e+=this.strings[t],e}getTemplateElement(){const t=document.createElement("template");return t.innerHTML=this.getHTML(),t}}
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const w=t=>null===t||!("object"==typeof t||"function"==typeof t),x=t=>Array.isArray(t)||!(!t||!t[Symbol.iterator]);class S{constructor(t,e,i){this.dirty=!0,this.element=t,this.name=e,this.strings=i,this.parts=[];for(let t=0;t<i.length-1;t++)this.parts[t]=this._createPart()}_createPart(){return new $(this)}_getValue(){const t=this.strings,e=t.length-1;let i="";for(let n=0;n<e;n++){i+=t[n];const e=this.parts[n];if(void 0!==e){const t=e.value;if(w(t)||!x(t))i+="string"==typeof t?t:String(t);else for(const e of t)i+="string"==typeof e?e:String(e)}}return i+=t[e],i}commit(){this.dirty&&(this.dirty=!1,this.element.setAttribute(this.name,this._getValue()))}}class ${constructor(t){this.value=void 0,this.committer=t}setValue(t){t===_||w(t)&&t===this.value||(this.value=t,m(t)||(this.committer.dirty=!0))}commit(){for(;m(this.value);){const t=this.value;this.value=_,t(this)}this.value!==_&&this.committer.commit()}}class T{constructor(t){this.value=void 0,this.__pendingValue=void 0,this.options=t}appendInto(t){this.startNode=t.appendChild(l()),this.endNode=t.appendChild(l())}insertAfterNode(t){this.startNode=t,this.endNode=t.nextSibling}appendIntoPart(t){t.__insert(this.startNode=l()),t.__insert(this.endNode=l())}insertAfterPart(t){t.__insert(this.startNode=l()),this.endNode=t.endNode,t.endNode=this.startNode}setValue(t){this.__pendingValue=t}commit(){if(null===this.startNode.parentNode)return;for(;m(this.__pendingValue);){const t=this.__pendingValue;this.__pendingValue=_,t(this)}const t=this.__pendingValue;t!==_&&(w(t)?t!==this.value&&this.__commitText(t):t instanceof b?this.__commitTemplateResult(t):t instanceof Node?this.__commitNode(t):x(t)?this.__commitIterable(t):t===f?(this.value=f,this.clear()):this.__commitText(t))}__insert(t){this.endNode.parentNode.insertBefore(t,this.endNode)}__commitNode(t){this.value!==t&&(this.clear(),this.__insert(t),this.value=t)}__commitText(t){const e=this.startNode.nextSibling,i="string"==typeof(t=null==t?"":t)?t:String(t);e===this.endNode.previousSibling&&3===e.nodeType?e.data=i:this.__commitNode(document.createTextNode(i)),this.value=t}__commitTemplateResult(t){const e=this.options.templateFactory(t);if(this.value instanceof v&&this.value.template===e)this.value.update(t.values);else{const i=new v(e,t.processor,this.options),n=i._clone();i.update(t.values),this.__commitNode(n),this.value=i}}__commitIterable(t){Array.isArray(this.value)||(this.value=[],this.clear());const e=this.value;let i,n=0;for(const s of t)i=e[n],void 0===i&&(i=new T(this.options),e.push(i),0===n?i.appendIntoPart(this):i.insertAfterPart(e[n-1])),i.setValue(s),i.commit(),n++;n<e.length&&(e.length=n,this.clear(i&&i.endNode))}clear(t=this.startNode){i(this.startNode.parentNode,t.nextSibling,this.endNode)}}class C{constructor(t,e,i){if(this.value=void 0,this.__pendingValue=void 0,2!==i.length||""!==i[0]||""!==i[1])throw new Error("Boolean attributes can only contain a single expression");this.element=t,this.name=e,this.strings=i}setValue(t){this.__pendingValue=t}commit(){for(;m(this.__pendingValue);){const t=this.__pendingValue;this.__pendingValue=_,t(this)}if(this.__pendingValue===_)return;const t=!!this.__pendingValue;this.value!==t&&(t?this.element.setAttribute(this.name,""):this.element.removeAttribute(this.name),this.value=t),this.__pendingValue=_}}class D extends S{constructor(t,e,i){super(t,e,i),this.single=2===i.length&&""===i[0]&&""===i[1]}_createPart(){return new E(this)}_getValue(){return this.single?this.parts[0].value:super._getValue()}commit(){this.dirty&&(this.dirty=!1,this.element[this.name]=this._getValue())}}class E extends ${}let k=!1;(()=>{try{const t={get capture(){return k=!0,!1}};window.addEventListener("test",t,t),window.removeEventListener("test",t,t)}catch(t){}})();class A{constructor(t,e,i){this.value=void 0,this.__pendingValue=void 0,this.element=t,this.eventName=e,this.eventContext=i,this.__boundHandleEvent=t=>this.handleEvent(t)}setValue(t){this.__pendingValue=t}commit(){for(;m(this.__pendingValue);){const t=this.__pendingValue;this.__pendingValue=_,t(this)}if(this.__pendingValue===_)return;const t=this.__pendingValue,e=this.value,i=null==t||null!=e&&(t.capture!==e.capture||t.once!==e.once||t.passive!==e.passive),n=null!=t&&(null==e||i);i&&this.element.removeEventListener(this.eventName,this.__boundHandleEvent,this.__options),n&&(this.__options=P(t),this.element.addEventListener(this.eventName,this.__boundHandleEvent,this.__options)),this.value=t,this.__pendingValue=_}handleEvent(t){"function"==typeof this.value?this.value.call(this.eventContext||this.element,t):this.value.handleEvent(t)}}const P=t=>t&&(k?{capture:t.capture,passive:t.passive,once:t.once}:t.capture)
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */;function N(t){let e=R.get(t.type);void 0===e&&(e={stringsArray:new WeakMap,keyString:new Map},R.set(t.type,e));let i=e.stringsArray.get(t.strings);if(void 0!==i)return i;const s=t.strings.join(n);return i=e.keyString.get(s),void 0===i&&(i=new r(t,t.getTemplateElement()),e.keyString.set(s,i)),e.stringsArray.set(t.strings,i),i}const R=new Map,M=new WeakMap;
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */const I=new
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
class{handleAttributeExpressions(t,e,i,n){const s=e[0];if("."===s){return new D(t,e.slice(1),i).parts}if("@"===s)return[new A(t,e.slice(1),n.eventContext)];if("?"===s)return[new C(t,e.slice(1),i)];return new S(t,e,i).parts}handleTextExpression(t){return new T(t)}};
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */"undefined"!=typeof window&&(window.litHtmlVersions||(window.litHtmlVersions=[])).push("1.2.1");const L=(t,...e)=>new b(t,e,"html",I)
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */,O=(t,e)=>`${t}--${e}`;let V=!0;void 0===window.ShadyCSS?V=!1:void 0===window.ShadyCSS.prepareTemplateDom&&(console.warn("Incompatible ShadyCSS version detected. Please update to at least @webcomponents/webcomponentsjs@2.0.2 and @webcomponents/shadycss@1.3.1."),V=!1);const F=t=>e=>{const i=O(e.type,t);let s=R.get(i);void 0===s&&(s={stringsArray:new WeakMap,keyString:new Map},R.set(i,s));let o=s.stringsArray.get(e.strings);if(void 0!==o)return o;const a=e.strings.join(n);if(o=s.keyString.get(a),void 0===o){const i=e.getTemplateElement();V&&window.ShadyCSS.prepareTemplateDom(i,t),o=new r(e,i),s.keyString.set(a,o)}return s.stringsArray.set(e.strings,o),o},H=["html","svg"],U=new Set,Y=(t,e,i)=>{U.add(t);const n=i?i.element:document.createElement("template"),s=e.querySelectorAll("style"),{length:o}=s;if(0===o)return void window.ShadyCSS.prepareTemplateStyles(n,t);const r=document.createElement("style");for(let t=0;t<o;t++){const e=s[t];e.parentNode.removeChild(e),r.textContent+=e.textContent}(t=>{H.forEach(e=>{const i=R.get(O(e,t));void 0!==i&&i.keyString.forEach(t=>{const{element:{content:e}}=t,i=new Set;Array.from(e.querySelectorAll("style")).forEach(t=>{i.add(t)}),h(t,i)})})})(t);const a=n.content;i?function(t,e,i=null){const{element:{content:n},parts:s}=t;if(null==i)return void n.appendChild(e);const o=document.createTreeWalker(n,133,null,!1);let r=p(s),a=0,c=-1;for(;o.nextNode();){c++;for(o.currentNode===i&&(a=u(e),i.parentNode.insertBefore(e,i));-1!==r&&s[r].index===c;){if(a>0){for(;-1!==r;)s[r].index+=a,r=p(s,r);return}r=p(s,r)}}}(i,r,a.firstChild):a.insertBefore(r,a.firstChild),window.ShadyCSS.prepareTemplateStyles(n,t);const c=a.querySelector("style");if(window.ShadyCSS.nativeShadow&&null!==c)e.insertBefore(c.cloneNode(!0),e.firstChild);else if(i){a.insertBefore(r,a.firstChild);const t=new Set;t.add(r),h(i,t)}};window.JSCompiler_renameProperty=(t,e)=>t;const z={toAttribute(t,e){switch(e){case Boolean:return t?"":null;case Object:case Array:return null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){switch(e){case Boolean:return null!==t;case Number:return null===t?null:Number(t);case Object:case Array:return JSON.parse(t)}return t}},j=(t,e)=>e!==t&&(e==e||t==t),q={attribute:!0,type:String,converter:z,reflect:!1,hasChanged:j};class B extends HTMLElement{constructor(){super(),this._updateState=0,this._instanceProperties=void 0,this._updatePromise=new Promise(t=>this._enableUpdatingResolver=t),this._changedProperties=new Map,this._reflectingProperties=void 0,this.initialize()}static get observedAttributes(){this.finalize();const t=[];return this._classProperties.forEach((e,i)=>{const n=this._attributeNameForProperty(i,e);void 0!==n&&(this._attributeToPropertyMap.set(n,i),t.push(n))}),t}static _ensureClassProperties(){if(!this.hasOwnProperty(JSCompiler_renameProperty("_classProperties",this))){this._classProperties=new Map;const t=Object.getPrototypeOf(this)._classProperties;void 0!==t&&t.forEach((t,e)=>this._classProperties.set(e,t))}}static createProperty(t,e=q){if(this._ensureClassProperties(),this._classProperties.set(t,e),e.noAccessor||this.prototype.hasOwnProperty(t))return;const i="symbol"==typeof t?Symbol():"__"+t,n=this.getPropertyDescriptor(t,i,e);void 0!==n&&Object.defineProperty(this.prototype,t,n)}static getPropertyDescriptor(t,e,i){return{get(){return this[e]},set(i){const n=this[t];this[e]=i,this._requestUpdate(t,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this._classProperties&&this._classProperties.get(t)||q}static finalize(){const t=Object.getPrototypeOf(this);if(t.hasOwnProperty("finalized")||t.finalize(),this.finalized=!0,this._ensureClassProperties(),this._attributeToPropertyMap=new Map,this.hasOwnProperty(JSCompiler_renameProperty("properties",this))){const t=this.properties,e=[...Object.getOwnPropertyNames(t),..."function"==typeof Object.getOwnPropertySymbols?Object.getOwnPropertySymbols(t):[]];for(const i of e)this.createProperty(i,t[i])}}static _attributeNameForProperty(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}static _valueHasChanged(t,e,i=j){return i(t,e)}static _propertyValueFromAttribute(t,e){const i=e.type,n=e.converter||z,s="function"==typeof n?n:n.fromAttribute;return s?s(t,i):t}static _propertyValueToAttribute(t,e){if(void 0===e.reflect)return;const i=e.type,n=e.converter;return(n&&n.toAttribute||z.toAttribute)(t,i)}initialize(){this._saveInstanceProperties(),this._requestUpdate()}_saveInstanceProperties(){this.constructor._classProperties.forEach((t,e)=>{if(this.hasOwnProperty(e)){const t=this[e];delete this[e],this._instanceProperties||(this._instanceProperties=new Map),this._instanceProperties.set(e,t)}})}_applyInstanceProperties(){this._instanceProperties.forEach((t,e)=>this[e]=t),this._instanceProperties=void 0}connectedCallback(){this.enableUpdating()}enableUpdating(){void 0!==this._enableUpdatingResolver&&(this._enableUpdatingResolver(),this._enableUpdatingResolver=void 0)}disconnectedCallback(){}attributeChangedCallback(t,e,i){e!==i&&this._attributeToProperty(t,i)}_propertyToAttribute(t,e,i=q){const n=this.constructor,s=n._attributeNameForProperty(t,i);if(void 0!==s){const t=n._propertyValueToAttribute(e,i);if(void 0===t)return;this._updateState=8|this._updateState,null==t?this.removeAttribute(s):this.setAttribute(s,t),this._updateState=-9&this._updateState}}_attributeToProperty(t,e){if(8&this._updateState)return;const i=this.constructor,n=i._attributeToPropertyMap.get(t);if(void 0!==n){const t=i.getPropertyOptions(n);this._updateState=16|this._updateState,this[n]=i._propertyValueFromAttribute(e,t),this._updateState=-17&this._updateState}}_requestUpdate(t,e){let i=!0;if(void 0!==t){const n=this.constructor,s=n.getPropertyOptions(t);n._valueHasChanged(this[t],e,s.hasChanged)?(this._changedProperties.has(t)||this._changedProperties.set(t,e),!0!==s.reflect||16&this._updateState||(void 0===this._reflectingProperties&&(this._reflectingProperties=new Map),this._reflectingProperties.set(t,s))):i=!1}!this._hasRequestedUpdate&&i&&(this._updatePromise=this._enqueueUpdate())}requestUpdate(t,e){return this._requestUpdate(t,e),this.updateComplete}async _enqueueUpdate(){this._updateState=4|this._updateState;try{await this._updatePromise}catch(t){}const t=this.performUpdate();return null!=t&&await t,!this._hasRequestedUpdate}get _hasRequestedUpdate(){return 4&this._updateState}get hasUpdated(){return 1&this._updateState}performUpdate(){this._instanceProperties&&this._applyInstanceProperties();let t=!1;const e=this._changedProperties;try{t=this.shouldUpdate(e),t?this.update(e):this._markUpdated()}catch(e){throw t=!1,this._markUpdated(),e}t&&(1&this._updateState||(this._updateState=1|this._updateState,this.firstUpdated(e)),this.updated(e))}_markUpdated(){this._changedProperties=new Map,this._updateState=-5&this._updateState}get updateComplete(){return this._getUpdateComplete()}_getUpdateComplete(){return this._updatePromise}shouldUpdate(t){return!0}update(t){void 0!==this._reflectingProperties&&this._reflectingProperties.size>0&&(this._reflectingProperties.forEach((t,e)=>this._propertyToAttribute(e,this[e],t)),this._reflectingProperties=void 0),this._markUpdated()}updated(t){}firstUpdated(t){}}B.finalized=!0;
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const W=t=>e=>"function"==typeof e?((t,e)=>(window.customElements.define(t,e),e))(t,e):((t,e)=>{const{kind:i,elements:n}=e;return{kind:i,elements:n,finisher(e){window.customElements.define(t,e)}}})(t,e),K=(t,e)=>"method"===e.kind&&e.descriptor&&!("value"in e.descriptor)?Object.assign(Object.assign({},e),{finisher(i){i.createProperty(e.key,t)}}):{kind:"field",key:Symbol(),placement:"own",descriptor:{},initializer(){"function"==typeof e.initializer&&(this[e.key]=e.initializer.call(this))},finisher(i){i.createProperty(e.key,t)}};function J(t){return(e,i)=>void 0!==i?((t,e,i)=>{e.constructor.createProperty(i,t)})(t,e,i):K(t,e)}
/**
@license
Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/const Z="adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,G=Symbol();class X{constructor(t,e){if(e!==G)throw new Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t}get styleSheet(){return void 0===this._styleSheet&&(Z?(this._styleSheet=new CSSStyleSheet,this._styleSheet.replaceSync(this.cssText)):this._styleSheet=null),this._styleSheet}toString(){return this.cssText}}const Q=(t,...e)=>{const i=e.reduce((e,i,n)=>e+(t=>{if(t instanceof X)return t.cssText;if("number"==typeof t)return t;throw new Error(`Value passed to 'css' function must be a 'css' function result: ${t}. Use 'unsafeCSS' to pass non-literal values, but\n            take care to ensure page security.`)})(i)+t[n+1],t[0]);return new X(i,G)};
/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
(window.litElementVersions||(window.litElementVersions=[])).push("2.3.1");const tt={};class et extends B{static getStyles(){return this.styles}static _getUniqueStyles(){if(this.hasOwnProperty(JSCompiler_renameProperty("_styles",this)))return;const t=this.getStyles();if(void 0===t)this._styles=[];else if(Array.isArray(t)){const e=(t,i)=>t.reduceRight((t,i)=>Array.isArray(i)?e(i,t):(t.add(i),t),i),i=e(t,new Set),n=[];i.forEach(t=>n.unshift(t)),this._styles=n}else this._styles=[t]}initialize(){super.initialize(),this.constructor._getUniqueStyles(),this.renderRoot=this.createRenderRoot(),window.ShadowRoot&&this.renderRoot instanceof window.ShadowRoot&&this.adoptStyles()}createRenderRoot(){return this.attachShadow({mode:"open"})}adoptStyles(){const t=this.constructor._styles;0!==t.length&&(void 0===window.ShadyCSS||window.ShadyCSS.nativeShadow?Z?this.renderRoot.adoptedStyleSheets=t.map(t=>t.styleSheet):this._needsShimAdoptedStyleSheets=!0:window.ShadyCSS.ScopingShim.prepareAdoptedCssText(t.map(t=>t.cssText),this.localName))}connectedCallback(){super.connectedCallback(),this.hasUpdated&&void 0!==window.ShadyCSS&&window.ShadyCSS.styleElement(this)}update(t){const e=this.render();super.update(t),e!==tt&&this.constructor.render(e,this.renderRoot,{scopeName:this.localName,eventContext:this}),this._needsShimAdoptedStyleSheets&&(this._needsShimAdoptedStyleSheets=!1,this.constructor._styles.forEach(t=>{const e=document.createElement("style");e.textContent=t.cssText,this.renderRoot.appendChild(e)}))}render(){return tt}}et.finalized=!0,et.render=(t,e,n)=>{if(!n||"object"!=typeof n||!n.scopeName)throw new Error("The `scopeName` option is required.");const s=n.scopeName,o=M.has(e),r=V&&11===e.nodeType&&!!e.host,a=r&&!U.has(s),c=a?document.createDocumentFragment():e;if(((t,e,n)=>{let s=M.get(e);void 0===s&&(i(e,e.firstChild),M.set(e,s=new T(Object.assign({templateFactory:N},n))),s.appendInto(e)),s.setValue(t),s.commit()})(t,c,Object.assign({templateFactory:F(s)},n)),a){const t=M.get(c);M.delete(c);const n=t.value instanceof v?t.value.template:void 0;Y(s,c,n),i(e,e.firstChild),e.appendChild(c),M.set(e,t)}!o&&r&&window.ShadyCSS.styleElement(e.host)};var it=/d{1,4}|M{1,4}|YY(?:YY)?|S{1,3}|Do|ZZ|Z|([HhMsDm])\1?|[aA]|"[^"]*"|'[^']*'/g,nt="[^\\s]+",st=/\[([^]*?)\]/gm;function ot(t,e){for(var i=[],n=0,s=t.length;n<s;n++)i.push(t[n].substr(0,e));return i}var rt=function(t){return function(e,i){var n=i[t].map((function(t){return t.toLowerCase()})).indexOf(e.toLowerCase());return n>-1?n:null}};function at(t){for(var e=[],i=1;i<arguments.length;i++)e[i-1]=arguments[i];for(var n=0,s=e;n<s.length;n++){var o=s[n];for(var r in o)t[r]=o[r]}return t}var ct=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],lt=["January","February","March","April","May","June","July","August","September","October","November","December"],dt=ot(lt,3),ht={dayNamesShort:ot(ct,3),dayNames:ct,monthNamesShort:dt,monthNames:lt,amPm:["am","pm"],DoFn:function(t){return t+["th","st","nd","rd"][t%10>3?0:(t-t%10!=10?1:0)*t%10]}},ut=at({},ht),pt=function(t,e){for(void 0===e&&(e=2),t=String(t);t.length<e;)t="0"+t;return t},gt={D:function(t){return String(t.getDate())},DD:function(t){return pt(t.getDate())},Do:function(t,e){return e.DoFn(t.getDate())},d:function(t){return String(t.getDay())},dd:function(t){return pt(t.getDay())},ddd:function(t,e){return e.dayNamesShort[t.getDay()]},dddd:function(t,e){return e.dayNames[t.getDay()]},M:function(t){return String(t.getMonth()+1)},MM:function(t){return pt(t.getMonth()+1)},MMM:function(t,e){return e.monthNamesShort[t.getMonth()]},MMMM:function(t,e){return e.monthNames[t.getMonth()]},YY:function(t){return pt(String(t.getFullYear()),4).substr(2)},YYYY:function(t){return pt(t.getFullYear(),4)},h:function(t){return String(t.getHours()%12||12)},hh:function(t){return pt(t.getHours()%12||12)},H:function(t){return String(t.getHours())},HH:function(t){return pt(t.getHours())},m:function(t){return String(t.getMinutes())},mm:function(t){return pt(t.getMinutes())},s:function(t){return String(t.getSeconds())},ss:function(t){return pt(t.getSeconds())},S:function(t){return String(Math.round(t.getMilliseconds()/100))},SS:function(t){return pt(Math.round(t.getMilliseconds()/10),2)},SSS:function(t){return pt(t.getMilliseconds(),3)},a:function(t,e){return t.getHours()<12?e.amPm[0]:e.amPm[1]},A:function(t,e){return t.getHours()<12?e.amPm[0].toUpperCase():e.amPm[1].toUpperCase()},ZZ:function(t){var e=t.getTimezoneOffset();return(e>0?"-":"+")+pt(100*Math.floor(Math.abs(e)/60)+Math.abs(e)%60,4)},Z:function(t){var e=t.getTimezoneOffset();return(e>0?"-":"+")+pt(Math.floor(Math.abs(e)/60),2)+":"+pt(Math.abs(e)%60,2)}},mt=function(t){return+t-1},_t=[null,"[1-9]\\d?"],ft=[null,nt],vt=["isPm",nt,function(t,e){var i=t.toLowerCase();return i===e.amPm[0]?0:i===e.amPm[1]?1:null}],yt=["timezoneOffset","[^\\s]*?[\\+\\-]\\d\\d:?\\d\\d|[^\\s]*?Z?",function(t){var e=(t+"").match(/([+-]|\d\d)/gi);if(e){var i=60*+e[1]+parseInt(e[2],10);return"+"===e[0]?i:-i}return 0}],bt=(rt("monthNamesShort"),rt("monthNames"),{default:"ddd MMM DD YYYY HH:mm:ss",shortDate:"M/D/YY",mediumDate:"MMM D, YYYY",longDate:"MMMM D, YYYY",fullDate:"dddd, MMMM D, YYYY",isoDate:"YYYY-MM-DD",isoDateTime:"YYYY-MM-DDTHH:mm:ssZ",shortTime:"HH:mm",mediumTime:"HH:mm:ss",longTime:"HH:mm:ss.SSS"});var wt=function(t,e,i){if(void 0===e&&(e=bt.default),void 0===i&&(i={}),"number"==typeof t&&(t=new Date(t)),"[object Date]"!==Object.prototype.toString.call(t)||isNaN(t.getTime()))throw new Error("Invalid Date pass to format");var n=[];e=(e=bt[e]||e).replace(st,(function(t,e){return n.push(e),"@@@"}));var s=at(at({},ut),i);return(e=e.replace(it,(function(e){return gt[e](t,s)}))).replace(/@@@/g,(function(){return n.shift()}))},xt=function(){try{(new Date).toLocaleDateString("i")}catch(t){return"RangeError"===t.name}return!1}()?function(t,e){return t.toLocaleDateString(e,{year:"numeric",month:"long",day:"numeric"})}:function(t){return wt(t,"mediumDate")},St=function(){try{(new Date).toLocaleString("i")}catch(t){return"RangeError"===t.name}return!1}()?function(t,e){return t.toLocaleString(e,{year:"numeric",month:"long",day:"numeric",hour:"numeric",minute:"2-digit"})}:function(t){return wt(t,"haDateTime")},$t=function(){try{(new Date).toLocaleTimeString("i")}catch(t){return"RangeError"===t.name}return!1}()?function(t,e){return t.toLocaleTimeString(e,{hour:"numeric",minute:"2-digit"})}:function(t){return wt(t,"shortTime")},Tt=[60,60,24,7],Ct=["second","minute","hour","day"];function Dt(t,e,i){void 0===i&&(i={});var n,s=((i.compareTime||new Date).getTime()-t.getTime())/1e3,o=s>=0?"past":"future";s=Math.abs(s);for(var r=0;r<Tt.length;r++){if(s<Tt[r]){s=Math.floor(s),n=e("ui.components.relative_time.duration."+Ct[r],"count",s);break}s/=Tt[r]}return void 0===n&&(n=e("ui.components.relative_time.duration.week","count",s=Math.floor(s))),!1===i.includeTense?n:e("ui.components.relative_time."+o,"time",n)}function Et(t){return t.substr(0,t.indexOf("."))}function kt(t,e,i){if("unknown"===e.state||"unavailable"===e.state)return t("state.default."+e.state);if(e.attributes.unit_of_measurement)return e.state+" "+e.attributes.unit_of_measurement;var n=function(t){return Et(t.entity_id)}(e);if("input_datetime"===n){var s;if(!e.attributes.has_time)return s=new Date(e.attributes.year,e.attributes.month-1,e.attributes.day),xt(s,i);if(!e.attributes.has_date){var o=new Date;return s=new Date(o.getFullYear(),o.getMonth(),o.getDay(),e.attributes.hour,e.attributes.minute),$t(s,i)}return s=new Date(e.attributes.year,e.attributes.month-1,e.attributes.day,e.attributes.hour,e.attributes.minute),St(s,i)}return e.attributes.device_class&&t("component."+n+".state."+e.attributes.device_class+"."+e.state)||t("component."+n+".state._."+e.state)||e.state}var At=["closed","locked","off"],Pt=function(t,e,i,n){n=n||{},i=null==i?{}:i;var s=new Event(e,{bubbles:void 0===n.bubbles||n.bubbles,cancelable:Boolean(n.cancelable),composed:void 0===n.composed||n.composed});return s.detail=i,t.dispatchEvent(s),s},Nt=function(t){Pt(window,"haptic",t)},Rt=function(t,e){return function(t,e,i){void 0===i&&(i=!0);var n,s=Et(e),o="group"===s?"homeassistant":s;switch(s){case"lock":n=i?"unlock":"lock";break;case"cover":n=i?"open_cover":"close_cover";break;default:n=i?"turn_on":"turn_off"}return t.callService(o,n,{entity_id:e})}(t,e,At.includes(t.states[e].state))},Mt=function(t,e,i,n){var s;if("double_tap"===n&&i.double_tap_action?s=i.double_tap_action:"hold"===n&&i.hold_action?s=i.hold_action:"tap"===n&&i.tap_action&&(s=i.tap_action),s||(s={action:"more-info"}),!s.confirmation||s.confirmation.exemptions&&s.confirmation.exemptions.some((function(t){return t.user===e.user.id}))||(Nt("warning"),confirm(s.confirmation.text||"Are you sure you want to "+s.action+"?")))switch(s.action){case"more-info":(i.entity||i.camera_image)&&Pt(t,"hass-more-info",{entityId:i.entity?i.entity:i.camera_image});break;case"navigate":s.navigation_path&&function(t,e,i){void 0===i&&(i=!1),i?history.replaceState(null,"",e):history.pushState(null,"",e),Pt(window,"location-changed",{replace:i})}(0,s.navigation_path);break;case"url":s.url_path&&window.open(s.url_path);break;case"toggle":i.entity&&(Rt(e,i.entity),Nt("success"));break;case"call-service":if(!s.service)return void Nt("failure");var o=s.service.split(".",2);e.callService(o[0],o[1],s.service_data),Nt("success")}};function It(t){return void 0!==t&&"none"!==t.action}const Lt={required:{icon:"tune",name:"Required",secondary:"Required options for this card to function",show:!0},actions:{icon:"gesture-tap-hold",name:"Actions",secondary:"Perform actions based on tapping/clicking",show:!1,options:{tap:{icon:"gesture-tap",name:"Tap",secondary:"Set the action to perform on tap",show:!1},hold:{icon:"gesture-tap-hold",name:"Hold",secondary:"Set the action to perform on hold",show:!1},double_tap:{icon:"gesture-double-tap",name:"Double Tap",secondary:"Set the action to perform on double tap",show:!1}}},appearance:{icon:"palette",name:"Appearance",secondary:"Customize the name, icon, etc",show:!1}};let Ot=class extends et{setConfig(t){this._config=t}get _name(){return this._config&&this._config.name||""}get _entity(){return this._config&&this._config.entity||""}get _show_warning(){return this._config&&this._config.show_warning||!1}get _show_error(){return this._config&&this._config.show_error||!1}get _tap_action(){return this._config&&this._config.tap_action||{action:"more-info"}}get _hold_action(){return this._config&&this._config.hold_action||{action:"none"}}get _double_tap_action(){return this._config&&this._config.double_tap_action||{action:"none"}}render(){if(!this.hass)return L``;const t=Object.keys(this.hass.states).filter(t=>"sensor"===t.substr(0,t.indexOf(".")));return L`
      <div class="card-config">
        <div class="option" @click=${this._toggleOption} .option=${"required"}>
          <div class="row">
            <ha-icon .icon=${"mdi:"+Lt.required.icon}></ha-icon>
            <div class="title">${Lt.required.name}</div>
          </div>
          <div class="secondary">${Lt.required.secondary}</div>
        </div>
        ${Lt.required.show?L`
              <div class="values">
                <paper-dropdown-menu
                  label="Entity (Required)"
                  @value-changed=${this._valueChanged}
                  .configValue=${"entity"}
                >
                  <paper-listbox slot="dropdown-content" .selected=${t.indexOf(this._entity)}>
                    ${t.map(t=>L`
                        <paper-item>${t}</paper-item>
                      `)}
                  </paper-listbox>
                </paper-dropdown-menu>
              </div>
            `:""}
        <div class="option" @click=${this._toggleOption} .option=${"actions"}>
          <div class="row">
            <ha-icon .icon=${"mdi:"+Lt.actions.icon}></ha-icon>
            <div class="title">${Lt.actions.name}</div>
          </div>
          <div class="secondary">${Lt.actions.secondary}</div>
        </div>
        ${Lt.actions.show?L`
              <div class="values">
                <div class="option" @click=${this._toggleAction} .option=${"tap"}>
                  <div class="row">
                    <ha-icon .icon=${"mdi:"+Lt.actions.options.tap.icon}></ha-icon>
                    <div class="title">${Lt.actions.options.tap.name}</div>
                  </div>
                  <div class="secondary">${Lt.actions.options.tap.secondary}</div>
                </div>
                ${Lt.actions.options.tap.show?L`
                      <div class="values">
                        <paper-item>Action Editors Coming Soon</paper-item>
                      </div>
                    `:""}
                <div class="option" @click=${this._toggleAction} .option=${"hold"}>
                  <div class="row">
                    <ha-icon .icon=${"mdi:"+Lt.actions.options.hold.icon}></ha-icon>
                    <div class="title">${Lt.actions.options.hold.name}</div>
                  </div>
                  <div class="secondary">${Lt.actions.options.hold.secondary}</div>
                </div>
                ${Lt.actions.options.hold.show?L`
                      <div class="values">
                        <paper-item>Action Editors Coming Soon</paper-item>
                      </div>
                    `:""}
                <div class="option" @click=${this._toggleAction} .option=${"double_tap"}>
                  <div class="row">
                    <ha-icon .icon=${"mdi:"+Lt.actions.options.double_tap.icon}></ha-icon>
                    <div class="title">${Lt.actions.options.double_tap.name}</div>
                  </div>
                  <div class="secondary">${Lt.actions.options.double_tap.secondary}</div>
                </div>
                ${Lt.actions.options.double_tap.show?L`
                      <div class="values">
                        <paper-item>Action Editors Coming Soon</paper-item>
                      </div>
                    `:""}
              </div>
            `:""}
        <div class="option" @click=${this._toggleOption} .option=${"appearance"}>
          <div class="row">
            <ha-icon .icon=${"mdi:"+Lt.appearance.icon}></ha-icon>
            <div class="title">${Lt.appearance.name}</div>
          </div>
          <div class="secondary">${Lt.appearance.secondary}</div>
        </div>
        ${Lt.appearance.show?L`
              <div class="values">
                <paper-input
                  label="Name (Optional)"
                  .value=${this._name}
                  .configValue=${"name"}
                  @value-changed=${this._valueChanged}
                ></paper-input>
                <br />
                <ha-switch
                  aria-label=${"Toggle warning "+(this._show_warning?"off":"on")}
                  .checked=${!1!==this._show_warning}
                  .configValue=${"show_warning"}
                  @change=${this._valueChanged}
                  >Show Warning?</ha-switch
                >
                <ha-switch
                  aria-label=${"Toggle error "+(this._show_error?"off":"on")}
                  .checked=${!1!==this._show_error}
                  .configValue=${"show_error"}
                  @change=${this._valueChanged}
                  >Show Error?</ha-switch
                >
              </div>
            `:""}
      </div>
    `}_toggleAction(t){this._toggleThing(t,Lt.actions.options)}_toggleOption(t){this._toggleThing(t,Lt)}_toggleThing(t,e){const i=!e[t.target.option].show;for(const[t]of Object.entries(e))e[t].show=!1;e[t.target.option].show=i,this._toggle=!this._toggle}_valueChanged(t){if(!this._config||!this.hass)return;const e=t.target;this["_"+e.configValue]!==e.value&&(e.configValue&&(""===e.value?delete this._config[e.configValue]:this._config=Object.assign(Object.assign({},this._config),{[e.configValue]:void 0!==e.checked?e.checked:e.value})),Pt(this,"config-changed",{config:this._config}))}static get styles(){return Q`
      .option {
        padding: 4px 0px;
        cursor: pointer;
      }
      .row {
        display: flex;
        margin-bottom: -14px;
        pointer-events: none;
      }
      .title {
        padding-left: 16px;
        margin-top: -6px;
        pointer-events: none;
      }
      .secondary {
        padding-left: 40px;
        color: var(--secondary-text-color);
        pointer-events: none;
      }
      .values {
        padding-left: 16px;
        background: var(--secondary-background-color);
      }
      ha-switch {
        padding-bottom: 8px;
      }
    `}};t([J()],Ot.prototype,"hass",void 0),t([J()],Ot.prototype,"_config",void 0),t([J()],Ot.prototype,"_toggle",void 0),Ot=t([W("lightning-detector-card-editor")],Ot);const Vt="ontouchstart"in window||navigator.maxTouchPoints>0||navigator.msMaxTouchPoints>0;class Ft extends HTMLElement{constructor(){super(),this.holdTime=500,this.held=!1,this.ripple=document.createElement("mwc-ripple")}connectedCallback(){Object.assign(this.style,{position:"absolute",width:Vt?"100px":"50px",height:Vt?"100px":"50px",transform:"translate(-50%, -50%)",pointerEvents:"none",zIndex:"999"}),this.appendChild(this.ripple),this.ripple.primary=!0,["touchcancel","mouseout","mouseup","touchmove","mousewheel","wheel","scroll"].forEach(t=>{document.addEventListener(t,()=>{clearTimeout(this.timer),this.stopAnimation(),this.timer=void 0},{passive:!0})})}bind(t,e){if(t.actionHandler)return;t.actionHandler=!0,t.addEventListener("contextmenu",t=>{const e=t||window.event;return e.preventDefault&&e.preventDefault(),e.stopPropagation&&e.stopPropagation(),e.cancelBubble=!0,e.returnValue=!1,!1});const i=t=>{let e,i;this.held=!1,t.touches?(e=t.touches[0].pageX,i=t.touches[0].pageY):(e=t.pageX,i=t.pageY),this.timer=window.setTimeout(()=>{this.startAnimation(e,i),this.held=!0},this.holdTime)},n=i=>{i.preventDefault(),["touchend","touchcancel"].includes(i.type)&&void 0===this.timer||(clearTimeout(this.timer),this.stopAnimation(),this.timer=void 0,this.held?Pt(t,"action",{action:"hold"}):e.hasDoubleClick?"click"===i.type&&i.detail<2||!this.dblClickTimeout?this.dblClickTimeout=window.setTimeout(()=>{this.dblClickTimeout=void 0,Pt(t,"action",{action:"tap"})},250):(clearTimeout(this.dblClickTimeout),this.dblClickTimeout=void 0,Pt(t,"action",{action:"double_tap"})):Pt(t,"action",{action:"tap"}))};t.addEventListener("touchstart",i,{passive:!0}),t.addEventListener("touchend",n),t.addEventListener("touchcancel",n),t.addEventListener("mousedown",i,{passive:!0}),t.addEventListener("click",n),t.addEventListener("keyup",t=>{13===t.keyCode&&n(t)})}startAnimation(t,e){Object.assign(this.style,{left:t+"px",top:e+"px",display:null}),this.ripple.disabled=!1,this.ripple.active=!0,this.ripple.unbounded=!0}stopAnimation(){this.ripple.active=!1,this.ripple.disabled=!0,this.style.display="none"}}customElements.define("action-handler-lightning-detector-card",Ft);const Ht=(t,e)=>{const i=(()=>{const t=document.body;if(t.querySelector("action-handler-lightning-detector-card"))return t.querySelector("action-handler-lightning-detector-card");const e=document.createElement("action-handler-lightning-detector-card");return t.appendChild(e),e})();i&&i.bind(t,e)},Ut=(Yt=(t={})=>e=>{Ht(e.committer.element,t)},(...t)=>{const e=Yt(...t);return g.set(e,!0),e});var Yt;var zt={version:"Version",invalid_configuration:"Invalid configuration",show_warning:"Show Warning"},jt={common:zt},qt={version:"Versjon",invalid_configuration:"Ikke gyldig konfiguration",show_warning:"Vis advarsel"},Bt={common:qt},Wt={en:Object.freeze({__proto__:null,common:zt,default:jt}),nb:Object.freeze({__proto__:null,common:qt,default:Bt})};function Kt(t,e="",i=""){const n=t.split(".")[0],s=t.split(".")[1],o=(localStorage.getItem("selectedLanguage")||"en").replace(/['"]+/g,"").replace("-","_");var r;try{r=Wt[o][n][s]}catch(t){r=Wt.en[n][s]}return void 0===r&&(r=Wt.en[n][s]),""!==e&&""!==i&&(r=r.replace(e,i)),r}console.info(`%c  LIGHTNING-DETECTOR-CARD \n%c  ${Kt("common.version")} 1.0.3    `,"color: orange; font-weight: bold; background: black","color: white; font-weight: bold; background: dimgray"),window.customCards=window.customCards||[],window.customCards.push({type:"lightning-detector-card",name:"Lightning Detector Card",description:"A card for displaying lightning in the local area as detected by an AS3935 sensor"});let Jt=class extends et{constructor(){super(...arguments),this.NOT_SET=-1,this._period_minutes=0,this._storm_active=!1,this._storm_ended=!0,this._firstTime=!0,this._sensorAvailable=!1,this._latestDetectionLabelID="",this._endOfStormLabelID="",this._stormEndDate=void 0}static async getConfigElement(){return document.createElement("lightning-detector-card-editor")}static getStubConfig(){return{}}setConfig(t){if(!t||t.show_error)throw new Error(Kt("common.invalid_configuration"));if(!t.entity)throw console.log("Invalid configuration. If no entity provided, you'll need to provide a remote entity"),new Error("You need to associate an entity");t.test_gui&&function(){var t=document.querySelector("home-assistant");if(t=(t=(t=(t=(t=(t=(t=(t=t&&t.shadowRoot)&&t.querySelector("home-assistant-main"))&&t.shadowRoot)&&t.querySelector("app-drawer-layout partial-panel-resolver"))&&t.shadowRoot||t)&&t.querySelector("ha-panel-lovelace"))&&t.shadowRoot)&&t.querySelector("hui-root")){var e=t.lovelace;return e.current_view=t.___curView,e}return null}().setEditMode(!0),this._config=Object.assign({name:void 0},t),t.light_color||(this._config.light_color="d3d29b"),t.medium_color||(this._config.medium_color="d49e66"),t.heavy_color||(this._config.heavy_color="d45f62"),t.ring_no_color||(this._config.ring_no_color="252629"),t.background_color||(this._config.background_color="var(--paper-card-background-color)"),t.light_text_color||(this._config.light_text_color="bdc1c6"),t.dark_text_color||(this._config.dark_text_color="000000"),console.log("- config:"),console.log(this._config),this._updateSensorAvailability()}getCardSize(){return 6}shouldUpdate(t){if(this._updateSensorAvailability(),t.has("_config"))return!0;if(this.hass&&this._config){const e=t.get("hass");if(e)return e.states[this._config.entity]!==this.hass.states[this._config.entity]}return!0}render(){var t,e,i;if(this._config.show_warning)return this.showWarning(Kt("common.show_warning"));const n=this._config.entity?this._config.entity:void 0,s=this._config.entity?this.hass.states[this._config.entity]:void 0;if(!n&&!s)return this.showWarning("Entity Unavailable");const o=kt(null===(t=this.hass)||void 0===t?void 0:t.localize,s,null===(e=this.hass)||void 0===e?void 0:e.language),r=void 0===o?"{unknown}":Dt(new Date(o),null===(i=this.hass)||void 0===i?void 0:i.localize);let a=!1;this._firstTime&&(console.log("- stateObj:"),console.log(s),this._startCardRefreshTimer(),this._config.units=null==s?void 0:s.attributes.units,this._config.ring_count=null==s?void 0:s.attributes.ring_count,this._config.ring_width=null==s?void 0:s.attributes.ring_width_km,this._config.out_of_range_count=null==s?void 0:s.attributes.out_of_range,this._config.period_in_minutes=null==s?void 0:s.attributes.period_minutes,this._period_minutes=null==s?void 0:s.attributes.period_minutes,a=!0,console.log("- post rings _config:"),console.log(this._config),this._firstTime=!1);(null==s?void 0:s.attributes.ring_count)!=this._config.ring_count&&(a=!0);if((null==s?void 0:s.attributes.units)!=this._config.units&&(a=!0),a){this._config.units=null==s?void 0:s.attributes.units,this._config.ring_count=null==s?void 0:s.attributes.ring_count,this._config.ring_width=null==s?void 0:s.attributes.ring_width_km,this._config.detail_label_count=this._config.ring_count+1;const t=this._config.ring_count;this._config.ringsImage=this._createHTMLRings(t),this._config.ringsLegend=this._createHTMLRingsLegend(t),this._config.ringsTitles=this._createHTMLRingLabels(t),this._config.cardText=this._createHTMLCardLabels(t)}const c=this._sensorAvailable&&this._storm_active?"Last report: "+r+"!":"";return L`
      <ha-card
        .header=${this._config.name}
        @action=${this._handleAction}
        .actionHandler=${Ut({hasHold:It(this._config.hold_action),hasDoubleClick:It(this._config.double_tap_action)})}
      >
        <div class="card-content">
          <div class="rings">${this._config.ringsImage} ${this._config.ringsLegend} ${this._config.ringsTitles}</div>
          ${this._config.cardText}
        </div>
        <div id="card-timestamp" class="last-heard">${c}</div>
      </ha-card>
    `}updated(t){if(!this._config)return;if(this.hass){const e=t.get("hass");e&&e.themes===this.hass.themes||function(t,e,i,n){void 0===n&&(n=!1),t._themes||(t._themes={});var s=e.default_theme;("default"===i||i&&e.themes[i])&&(s=i);var o=Object.assign({},t._themes);if("default"!==s){var r=e.themes[s];Object.keys(r).forEach((function(e){var i="--"+e;t._themes[i]="",o[i]=r[e]}))}if(t.updateStyles?t.updateStyles(o):window.ShadyCSS&&window.ShadyCSS.styleSubtree(t,o),n){var a=document.querySelector("meta[name=theme-color]");if(a){a.hasAttribute("default-content")||a.setAttribute("default-content",a.getAttribute("content"));var c=o["--primary-color"]||a.getAttribute("default-content");a.setAttribute("content",c)}}}(this,this.hass.themes,this._config.theme)}this.hass.states[this._config.entity]||this._stopCardRefreshTimer(),console.log("- changed Props: "),console.log(t);const e=this.shadowRoot,i=this._config.ring_count,n=this._getTextCardStatus(i);let s=e.getElementById("card-status");s.textContent=n;const o=this._getTextCardSubStatus();for(let t=0;t<5;t++){const i=this._calcSubstatusLabelIdFromLineIndex(t);let n="";(0==this._sensorAvailable||this._storm_active&&!this._storm_ended)&&t<o.length&&(n=o[t]);e.getElementById(i).textContent=n}const r=this._getTextCardDetail(i),a=this._config.detail_label_count;for(let t=0;t<a;t++){let i="";this._storm_active&&!this._storm_ended&&t<r.length&&(i=r[t]);const n=this._calcDetailClassIdForIndex(t);s=e.getElementById(n),s.textContent=i}for(let t=0;t<=i;t++){let i=this._calcCountLabelIdFromRingIndex(t);const n=this._getRingDictionaryForRingIndex(t).count;let s=e.getElementById(i);s.textContent=n;const o=n>0?"#000":"#fff";s.style.setProperty("color",o),i=this._calcDistanceLabelIdFromRingIndex(t),s=e.getElementById(i),s.style.setProperty("color",o);const r=this._calcRingIdFromRingIndex(t),a=e.getElementById(r),c=this._getColorForRing(t);a.style.setProperty("fill",c)}}_startCardRefreshTimer(){this._updateTimerID=setInterval(()=>this._handleCardUpdateTimerExpiration(),1e3)}_stopCardRefreshTimer(){null!=this._updateTimerID&&(clearInterval(this._updateTimerID),this._updateTimerID=void 0)}_handleCardUpdateTimerExpiration(){var t,e,i,n,s;if(1==(""!=this._getRingValueForKey("storm_first"))&&0==this._storm_active&&1==this._storm_ended&&(this._storm_active=!0,this._storm_ended=!1,console.log("* START! storm active: "+this._storm_active+", storm ended: "+this._storm_ended)),null!=this._stormEndDate&&0==this._storm_ended){(new Date).getTime()/1e3-this._stormEndDate.getTime()/1e3>=0&&(this._storm_ended=!0,this._storm_active=!1,console.log("* END! storm active: "+this._storm_active+", storm ended: "+this._storm_ended))}if(this._storm_active&&!this._storm_ended){const o=this.shadowRoot,r=this._config.entity?this.hass.states[this._config.entity]:void 0;if(null!=r){if(""!=this._latestDetectionLabelID){const e=o.getElementById(this._latestDetectionLabelID);if(null!=e){const i=this._getRingValueForKey("last");let n="None this period";""!=i&&(n=Dt(new Date(i),null===(t=this.hass)||void 0===t?void 0:t.localize));const s="Latest: "+n;e.textContent=s}}if(""!=this._endOfStormLabelID){const t=o.getElementById(this._endOfStormLabelID);if(null!=t&&null!=this._stormEndDate){const i="Ends: "+Dt(new Date(this._stormEndDate),null===(e=this.hass)||void 0===e?void 0:e.localize);t.textContent=i}}const a=o.getElementById("card-timestamp"),c=kt(null===(i=this.hass)||void 0===i?void 0:i.localize,r,null===(n=this.hass)||void 0===n?void 0:n.language),l=void 0===c?"{unknown}":Dt(new Date(c),null===(s=this.hass)||void 0===s?void 0:s.localize),d=this._sensorAvailable&&this._storm_active?"Last report: "+l:"";a.textContent=d}}}_updateSensorAvailability(){let t=!1;if(this.hass&&this._config){const e=this._config.entity?this._config.entity:void 0,i=this._config.entity?this.hass.states[this._config.entity]:void 0;if(e||i){const e="unavailable"!=this.hass.states[this._config.entity].state;t=this._sensorAvailable!=e,this._sensorAvailable=e}else this._sensorAvailable=!1,t=!0}else this._sensorAvailable=!1,t=!0;t&&console.log("* SENSOR available: "+this._sensorAvailable)}_getRingValueForKey(t){const e=this._config.entity?this.hass.states[this._config.entity]:void 0;let i="";return t in(null==e?void 0:e.attributes)&&(i=null==e?void 0:e.attributes[t]),i}_getRingDictionaryForRingIndex(t){const e=this._config.entity?this.hass.states[this._config.entity]:void 0,i="ring"+t;let n={};return i in(null==e?void 0:e.attributes)&&(n=null==e?void 0:e.attributes[i]),n}_getColorClassForRing(t){return"no-detections no-power"}_getColorForRing(t){const e=this._getRingDictionaryForRingIndex(t);let i=this._config.ring_no_color;const n=e.count;if(n>0){const t=e.energy,s=3,o=0,r=2e5,a=1e5,c=0;n>=10?t>=r?i="#ff2600":t>=a?i="#ff7158":t>c&&(i="#ff9d8b"):n>=s?t>=r?i="#ff9300":t>=a?i="#ffba5a":t>c&&(i="#ffce8c"):n>=o&&(t>=r?i="#fffb00":t>=a?i="#fffc54":t>c&&(i="#fffd8b"))}return i}_getCircleRadiusForRing(t,e){let i=0;if(this._storm_active||e>0){i=5*((2*t+2)/(2*e+2)*.85)}return i.toFixed(1)}_calcStormEndDate(){let t=void 0;const e=this._getRingValueForKey("storm_last"),i=parseInt(this._getRingValueForKey("end_minutes"),10);if(""!=e&&""!=e){const n=new Date(e);t=new Date(n.getTime()+6e4*i)}return t}_calcDistanceLabelIdFromRingIndex(t){return"dist-ring"+t+"-id"}_calcCountLabelIdFromRingIndex(t){return"ct-ring"+t+"-id"}_calcRingIdFromRingIndex(t){return"ring"+t}_calcDetailClassIdForIndex(t){return"card-detail"+t}_calcSubstatusLabelIdFromLineIndex(t){return"card-substatus"+t}_createHTMLRings(t){const e=[];if(null!=t){const i=[],n=[];for(let e=0;e<=t;e++){const s=this._getColorClassForRing(e);i.push(s);const o=this._getCircleRadiusForRing(e,t);n.push(o)}switch(t){case 7:e.push(L`
            <svg class="graphics" viewBox="0 0 10 10" width="100%">
              <circle id="ring7" class="${i[7]}" cx="5" cy="5" r="${n[7]}" />
              <circle id="ring6" class="${i[6]}" cx="5" cy="5" r="${n[6]}" />
              <circle id="ring5" class="${i[5]}" cx="5" cy="5" r="${n[5]}" />
              <circle id="ring4" class="${i[4]}" cx="5" cy="5" r="${n[4]}" />
              <circle id="ring3" class="${i[3]}" cx="5" cy="5" r="${n[3]}" />
              <circle id="ring2" class="${i[2]}" cx="5" cy="5" r="${n[2]}" />
              <circle id="ring1" class="${i[1]}" cx="5" cy="5" r="${n[1]}" />
              <circle id="ring0" class="${i[0]}" cx="5" cy="5" r="${n[0]}" />
            </svg>
          `);break;case 6:e.push(L`
            <svg class="graphics" viewBox="0 0 10 10" width="100%">
              <circle id="ring7" class="${i[6]}" cx="5" cy="5" r="${n[6]}" />
              <circle id="ring5" class="${i[5]}" cx="5" cy="5" r="${n[5]}" />
              <circle id="ring4" class="${i[4]}" cx="5" cy="5" r="${n[4]}" />
              <circle id="ring3" class="${i[3]}" cx="5" cy="5" r="${n[3]}" />
              <circle id="ring2" class="${i[2]}" cx="5" cy="5" r="${n[2]}" />
              <circle id="ring1" class="${i[1]}" cx="5" cy="5" r="${n[1]}" />
              <circle id="ring0" class="${i[0]}" cx="5" cy="5" r="${n[0]}" />
            </svg>
          `);break;case 5:e.push(L`
            <svg class="graphics" viewBox="0 0 10 10" width="100%">
              <circle id="ring5" class="${i[5]}" cx="5" cy="5" r="${n[5]}" />
              <circle id="ring4" class="${i[4]}" cx="5" cy="5" r="${n[4]}" />
              <circle id="ring3" class="${i[3]}" cx="5" cy="5" r="${n[3]}" />
              <circle id="ring2" class="${i[2]}" cx="5" cy="5" r="${n[2]}" />
              <circle id="ring1" class="${i[1]}" cx="5" cy="5" r="${n[1]}" />
              <circle id="ring0" class="${i[0]}" cx="5" cy="5" r="${n[0]}" />
            </svg>
          `);break;case 4:e.push(L`
            <svg class="graphics" viewBox="0 0 10 10" width="100%">
              <circle id="ring4" class="${i[4]}" cx="5" cy="5" r="${n[4]}" />
              <circle id="ring3" class="${i[3]}" cx="5" cy="5" r="${n[3]}" />
              <circle id="ring2" class="${i[2]}" cx="5" cy="5" r="${n[2]}" />
              <circle id="ring1" class="${i[1]}" cx="5" cy="5" r="${n[1]}" />
              <circle id="ring0" class="${i[0]}" cx="5" cy="5" r="${n[0]}" />
            </svg>
          `);break;default:e.push(L`
            <svg class="graphics" viewBox="0 0 10 10" width="100%">
              <circle id="ring3" class="${i[3]}" cx="5" cy="5" r="${n[3]}" />
              <circle id="ring2" class="${i[2]}" cx="5" cy="5" r="${n[2]}" />
              <circle id="ring1" class="${i[1]}" cx="5" cy="5" r="${n[1]}" />
              <circle id="ring0" class="${i[0]}" cx="5" cy="5" r="${n[0]}" />
            </svg>
          `)}}return e}_createHTMLRingsLegend(t){const e=[];if(null!=t){e.push(L`
          <div class="distance-legend legend-light">Distance</div>
        `),e.push(L`
          <div class="detections-legend legend-light rotate">Detections</div>
        `);const i=this._getRingValueForKey("units");for(let n=0;n<=t;n++){const t=this._getRingDictionaryForRingIndex(n),s="label-"+(0==t.count?"light":"dark");let o=t.from_units+" - "+t.to_units+" "+i,r="ring"+n+"-dist";0==n&&(o="Overhead",r="ring0 centered");const a=this._calcDistanceLabelIdFromRingIndex(n);e.push(L`
          <div id="${a}" class="${r} ${s}">${o}</div>
        `)}}return e}_createHTMLRingLabels(t){const e=[];for(let i=0;i<=t;i++){const t="ring"+i+"-det",n=this._getRingDictionaryForRingIndex(i).count,s="label-"+(0==n?"light":"dark"),o=this._calcCountLabelIdFromRingIndex(i);e.push(L`
        <div id="${o}" class="${t} ${s}">${n}</div>
      `)}return e}_createHTMLCardLabels(t){const e=[],i=[],n=this._getTextCardStatus(t),s=this._getTextCardDetail(t),o=t+1;for(let t=0;t<s.length;t++){const e=s[t];i.push(L`
          ${e}
        `)}e.push(L`
      <div id="card-status" class="status-text">${n}</div>
      <div id="card-substatus0" class="substatus-text substatus-text-ln0"></div>
      <div id="card-substatus1" class="substatus-text substatus-text-ln1"></div>
      <div id="card-substatus2" class="substatus-text substatus-text-ln2"></div>
      <div id="card-substatus3" class="substatus-text substatus-text-ln3"></div>
      <div id="card-substatus4" class="substatus-text substatus-text-ln4"></div>
    `);for(let t=0;t<o;t++){let n=L``;t<s.length&&(n=i[t]);const o=this._calcDetailClassIdForIndex(t),r="interp-text interp-text-ln"+t;e.push(L`
        <div id="${o}" class="${r}">
          ${n}
        </div>
      `)}return e}_getTextCardStatus(t){let e=0==this._sensorAvailable?"":"No Lightning in Area";if(this._storm_active&&!this._storm_ended){const i=999;let n=i,s=-1;const o=this._getRingValueForKey("units"),r=parseInt(this._getRingValueForKey("out_of_range"),10);let a=r;for(let e=0;e<=t;e++){const t=this._getRingDictionaryForRingIndex(e),o=t.count;if(a+=o,o>0){const e=t.from_units,o=t.to_units;n==i&&(n=e),o>s&&(s=o)}}const c="Lightning: "+n+" - "+s+" "+o;e=a>0&&a!=r?c:"Lightning: out-of-range"}return e}_getTextCardSubStatus(){var t,e,i;const n=[];if(0==this._sensorAvailable)n.push("Unavailable");else{let s=!1;const o=this._getRingValueForKey("storm_first");if(""!=o){const i=Dt(new Date(o),null===(t=this.hass)||void 0===t?void 0:t.localize);n.push("Started: "+i);let r="None this period";const a=this._getRingValueForKey("last");""!=a&&(r=Dt(new Date(a),null===(e=this.hass)||void 0===e?void 0:e.localize),s=!0),n.push("Latest: "+r);const c="card-substatus"+(n.length-1);this._latestDetectionLabelID=c,this._stormEndDate=void 0}else this._latestDetectionLabelID="",n.push("No storm info reported");const r=!!this._config.entity.includes("past_");if(r){const t=this._getRingValueForKey("timestamp");if(""!=t&&1==this._sensorAvailable){const e=new Date(t);n.push("As of: "+this._getUiDateTimeForTimestamp(e))}}else{let t="";if(0!=this._period_minutes&&null!=this._period_minutes){const e=1==this._period_minutes?"":"s";t=this._period_minutes+" minute"+e}this._storm_active&&""!=t&&n.push("Showing: last "+t)}if(0==s&&0==r)if(null==this._stormEndDate&&(this._stormEndDate=this._calcStormEndDate()),null!=this._stormEndDate){const t=Dt(new Date(this._stormEndDate),null===(i=this.hass)||void 0===i?void 0:i.localize);n.push("Ends: "+t);const e="card-substatus"+(n.length-1);this._endOfStormLabelID=e,n.push("at: "+this._getUiDateTimeForTimestamp(this._stormEndDate))}else this._endOfStormLabelID="",""!=o&&n.push("- bad storm end calcs?? -")}return n}_getTextCardDetail(t){const e=[],i=parseInt(this._getRingValueForKey("out_of_range"),10);if(i>0){const t=i+" detections, out-of-range";e.push(t)}for(let i=0;i<=t;i++){const t=this._getRingDictionaryForRingIndex(i),n=t.energy,s=t.count;if(s>0){let t="200k";const i=10*Math.round(n/1e4);t=i>5?i+"k+":"< 5k";const o=s+" detections, max power "+t;e.push(o)}}if(0==e.length){const t=this._getRingValueForKey("storm_last");if(""!=t){const i=new Date(t);e.push("Last: "+this._getUiDateTimeForTimestamp(i))}else e.push("No detection events...")}return e}_getUiDateTimeForTimestamp(t){return t.toLocaleTimeString("en-us",{weekday:"short",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}_handleAction(t){this.hass&&this._config&&t.detail.action&&Mt(this,this.hass,this._config,t.detail.action)}showWarning(t){return L`
      <hui-warning>${t}</hui-warning>
    `}showError(t){const e=document.createElement("hui-error-card");return e.setConfig({type:"error",error:t,origConfig:this._config}),L`
      ${e}
    `}static get styles(){return Q`
      circle {
        stroke: #8c8c8c;
        stroke-dasharray: 0 0.1;
        stroke-width: 0.03;
        stroke-linecap: round;
      }
      .graphics {
        /*background-color: orange;*/
        margin: 0px;
        padding: 0px;
      }
      .card-content {
        padding: 120px 0px 0px 0px; /* NOTE: we add +16 to top pad so we have space at top of card when no-name! */
        margin: 0px 0px 0px 0px; /* NOTE: top should be -16 if name is present */
        display: block;
        /*background-color: yellow;*/
        position: relative; /* ensure descendant abs-objects are relative this? */
      }
      .rings {
        /* background-color: green; */
        /*padding: 0px;*/
        position: relative; /* ensure descendant abs-objects are relative this? */
        margin: 0px;
        padding: 0px;
      }
      .rotate {
        writing-mode: vertical-rl;
      }

      .low {
        fill: #d3d29b;
      }
      .medium {
        fill: #d49e66;
      }
      .high {
        fill: #d45f62;
      }

      .no-detections.no-power {
        fill: #252629;
      }
      /* Bottom left text */
      .bottom-left {
        position: absolute;
        bottom: 8px;
        left: 16px;
      }

      /* Top left text */
      .top-left {
        position: absolute;
        top: 8px;
        left: 16px;
      }

      /* Top right text */
      .top-right {
        position: absolute;
        top: 8px;
        right: 16px;
      }

      /* Bottom right text */
      .bottom-right {
        position: absolute;
        top: 8px;
        right: 16px;
      }

      .status-text {
        position: absolute;
        top: 16px;
        right: 10px;
        /* font-family: Arial, Helvetica, sans-serif; */
        font-style: normal;
        font-weight: bold;
        font-size: 16px;
        line-height: 19px;
        /* color: #8c8c8c; */
        color: var(--primary-text-color);
      }
      .substatus-text-ln0 {
        position: absolute;
        top: 40px;
      }
      .substatus-text-ln1 {
        position: absolute;
        top: 56px;
      }
      .substatus-text-ln2 {
        position: absolute;
        top: 72px;
      }
      .substatus-text-ln3 {
        position: absolute;
        top: 88px;
      }
      .substatus-text-ln4 {
        position: absolute;
        top: 104px;
      }
      .substatus-text {
        position: absolute;
        right: 10px;
        /* font-family: Arial, Helvetica, sans-serif; */
        font-style: normal;
        font-size: 13px;
        line-height: 16px;
        /* color: #8c8c8c; */
        color: var(--secondary-text-color);
      }
      .interp-text-ln0 {
        position: absolute;
        top: 36px;
      }
      .interp-text-ln1 {
        position: absolute;
        top: 51px;
      }
      .interp-text-ln2 {
        position: absolute;
        top: 66px;
      }
      .interp-text-ln3 {
        position: absolute;
        top: 81px;
      }
      .interp-text-ln4 {
        position: absolute;
        top: 96px;
      }
      .interp-text-ln5 {
        position: absolute;
        top: 111px;
      }
      .interp-text-ln6 {
        position: absolute;
        top: 126px;
      }
      .interp-text-ln7 {
        position: absolute;
        top: 141px;
      }

      .interp-text {
        position: absolute;
        left: 10px;
        /* font-family: Arial, Helvetica, sans-serif; */
        font-style: normal;
        font-size: 13px;
        line-height: 16px;
        /* color: #8c8c8c; */
        text-align: right;
        color: var(--primary-text-color);
        /*background-color: orange;*/
      }

      /* Centered text */
      .centered {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      /* bottom centered on ring */
      .ring7-dist {
        position: absolute;
        bottom: 7%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
      /* bottom centered on ring */
      .ring6-dist {
        position: absolute;
        bottom: 12%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
      /* bottom centered on ring */
      .ring5-dist {
        position: absolute;
        bottom: 7.52%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
      .ring4-dist {
        position: absolute;
        bottom: 14.64%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
      .ring3-dist {
        position: absolute;
        bottom: 21.76%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
      .ring2-dist {
        position: absolute;
        bottom: 28.88%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
      .ring1-dist {
        position: absolute;
        bottom: 36%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
      .ring0-dist {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }

      /* bottom center */
      .distance-legend {
        position: absolute;
        bottom: 0.5%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
      /* left just-above-center */
      .detections-legend {
        position: absolute;
        top: 50%;
        left: 4%;
        transform: translate(-50%, -50%);
      }

      .label-dark {
        color: #000;
        font-size: 9px;
      }
      .label-light {
        color: #bdc1c6;
        font-size: 9px;
      }

      .last-heard {
        position: absolute;
        bottom: 5px;
        left: 10px;
        font-size: 12px;
        color: var(--secondary-text-color);
      }

      .legend-dark {
        color: #000;
        /* font-family: Arial, Helvetica, sans-serif; */
        font-size: 10px;
        font-weight: bold;
      }
      .legend-light {
        color: #bdc1c6;
        /* font-family: Arial, Helvetica, sans-serif; */
        font-size: 10px;
        font-weight: bold;
      }

      .ring7-det {
        position: absolute;
        top: 50%;
        left: 10.5%;
        transform: translate(-50%, -50%);
      }
      .ring6-det {
        position: absolute;
        top: 50%;
        left: 16%;
        transform: translate(-50%, -50%);
      }
      .ring5-det {
        position: absolute;
        top: 50%;
        left: 11.52%;
        transform: translate(-50%, -50%);
      }
      .ring4-det {
        position: absolute;
        top: 50%;
        left: 18.64%;
        transform: translate(-50%, -50%);
      }
      .ring3-det {
        position: absolute;
        top: 50%;
        left: 25.76%;
        transform: translate(-50%, -50%);
      }
      .ring2-det {
        position: absolute;
        top: 50%;
        left: 32.88%;
        transform: translate(-50%, -50%);
      }
      .ring1-det {
        position: absolute;
        top: 50%;
        left: 40%;
        transform: translate(-50%, -50%);
      }
      .ring0-det {
        position: absolute;
        top: 46%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    `}};t([J()],Jt.prototype,"hass",void 0),t([J()],Jt.prototype,"_config",void 0),t([J()],Jt.prototype,"_period_minutes",void 0),t([J()],Jt.prototype,"_storm_active",void 0),t([J()],Jt.prototype,"_storm_ended",void 0),Jt=t([W("lightning-detector-card")],Jt);export{Jt as LightningDetectorCard};
