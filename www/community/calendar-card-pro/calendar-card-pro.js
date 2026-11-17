const e=globalThis,t=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,n=Symbol(),i=new WeakMap;let r=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const n=this.t;if(t&&void 0===e){const t=void 0!==n&&1===n.length;t&&(e=i.get(n)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&i.set(n,e))}return e}toString(){return this.cssText}};const a=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,n,i)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(n)+e[i+1],e[0]);return new r(i,e,n)},o=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const n of e.cssRules)t+=n.cssText;return(e=>new r("string"==typeof e?e:e+"",void 0,n))(t)})(e):e,{is:s,defineProperty:l,getOwnPropertyDescriptor:d,getOwnPropertyNames:c,getOwnPropertySymbols:u,getPrototypeOf:h}=Object,m=globalThis,p=m.trustedTypes,f=p?p.emptyScript:"",g=m.reactiveElementPolyfillSupport,v=(e,t)=>e,_={toAttribute(e,t){switch(t){case Boolean:e=e?f:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=null!==e;break;case Number:n=null===e?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch(e){n=null}}return n}},y=(e,t)=>!s(e,t),w={attribute:!0,type:String,converter:_,reflect:!1,useDefault:!1,hasChanged:y};Symbol.metadata??=Symbol("metadata"),m.litPropertyMetadata??=new WeakMap;let b=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=w){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const n=Symbol(),i=this.getPropertyDescriptor(e,n,t);void 0!==i&&l(this.prototype,e,i)}}static getPropertyDescriptor(e,t,n){const{get:i,set:r}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:i,set(t){const a=i?.call(this);r?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??w}static _$Ei(){if(this.hasOwnProperty(v("elementProperties")))return;const e=h(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(v("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(v("properties"))){const e=this.properties,t=[...c(e),...u(e)];for(const n of t)this.createProperty(n,e[n])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const n=this._$Eu(e,t);void 0!==n&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const n=new Set(e.flat(1/0).reverse());for(const e of n)t.unshift(o(e))}else void 0!==e&&t.push(o(e));return t}static _$Eu(e,t){const n=t.attribute;return!1===n?void 0:"string"==typeof n?n:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const n=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((n,i)=>{if(t)n.adoptedStyleSheets=i.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const t of i){const i=document.createElement("style"),r=e.litNonce;void 0!==r&&i.setAttribute("nonce",r),i.textContent=t.cssText,n.appendChild(i)}})(n,this.constructor.elementStyles),n}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){const n=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,n);if(void 0!==i&&!0===n.reflect){const r=(void 0!==n.converter?.toAttribute?n.converter:_).toAttribute(t,n.type);this._$Em=e,null==r?this.removeAttribute(i):this.setAttribute(i,r),this._$Em=null}}_$AK(e,t){const n=this.constructor,i=n._$Eh.get(e);if(void 0!==i&&this._$Em!==i){const e=n.getPropertyOptions(i),r="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:_;this._$Em=i;const a=r.fromAttribute(t,e.type);this[i]=a??this._$Ej?.get(i)??a,this._$Em=null}}requestUpdate(e,t,n,i=!1,r){if(void 0!==e){const a=this.constructor;if(!1===i&&(r=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??y)(r,t)||n.useDefault&&n.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:i,wrapped:r},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==r||void 0!==a)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===i&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,n]of e){const{wrapped:e}=n,i=this[t];!0!==e||this._$AL.has(t)||void 0===i||this.C(t,void 0,n,i)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};b.elementStyles=[],b.shadowRootOptions={mode:"open"},b[v("elementProperties")]=new Map,b[v("finalized")]=new Map,g?.({ReactiveElement:b}),(m.reactiveElementVersions??=[]).push("2.1.2");const x=globalThis,k=e=>e,$=x.trustedTypes,T=$?$.createPolicy("lit-html",{createHTML:e=>e}):void 0,S="$lit$",M=`lit$${Math.random().toFixed(9).slice(2)}$`,D="?"+M,C=`<${D}>`,A=document,E=()=>A.createComment(""),L=e=>null===e||"object"!=typeof e&&"function"!=typeof e,P=Array.isArray,N="[ \t\n\f\r]",I=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,F=/-->/g,R=/>/g,O=RegExp(`>|${N}(?:([^\\s"'>=/]+)(${N}*=${N}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),z=/'/g,j=/"/g,H=/^(?:script|style|textarea|title)$/i,W=e=>(t,...n)=>({_$litType$:e,strings:t,values:n}),B=W(1),q=W(2),U=Symbol.for("lit-noChange"),V=Symbol.for("lit-nothing"),G=new WeakMap,K=A.createTreeWalker(A,129);function Y(e,t){if(!P(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==T?T.createHTML(t):t}class J{constructor({strings:e,_$litType$:t},n){let i;this.parts=[];let r=0,a=0;const o=e.length-1,s=this.parts,[l,d]=((e,t)=>{const n=e.length-1,i=[];let r,a=2===t?"<svg>":3===t?"<math>":"",o=I;for(let t=0;t<n;t++){const n=e[t];let s,l,d=-1,c=0;for(;c<n.length&&(o.lastIndex=c,l=o.exec(n),null!==l);)c=o.lastIndex,o===I?"!--"===l[1]?o=F:void 0!==l[1]?o=R:void 0!==l[2]?(H.test(l[2])&&(r=RegExp("</"+l[2],"g")),o=O):void 0!==l[3]&&(o=O):o===O?">"===l[0]?(o=r??I,d=-1):void 0===l[1]?d=-2:(d=o.lastIndex-l[2].length,s=l[1],o=void 0===l[3]?O:'"'===l[3]?j:z):o===j||o===z?o=O:o===F||o===R?o=I:(o=O,r=void 0);const u=o===O&&e[t+1].startsWith("/>")?" ":"";a+=o===I?n+C:d>=0?(i.push(s),n.slice(0,d)+S+n.slice(d)+M+u):n+M+(-2===d?t:u)}return[Y(e,a+(e[n]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),i]})(e,t);if(this.el=J.createElement(l,n),K.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(i=K.nextNode())&&s.length<o;){if(1===i.nodeType){if(i.hasAttributes())for(const e of i.getAttributeNames())if(e.endsWith(S)){const t=d[a++],n=i.getAttribute(e).split(M),o=/([.?@])?(.*)/.exec(t);s.push({type:1,index:r,name:o[2],strings:n,ctor:"."===o[1]?te:"?"===o[1]?ne:"@"===o[1]?ie:ee}),i.removeAttribute(e)}else e.startsWith(M)&&(s.push({type:6,index:r}),i.removeAttribute(e));if(H.test(i.tagName)){const e=i.textContent.split(M),t=e.length-1;if(t>0){i.textContent=$?$.emptyScript:"";for(let n=0;n<t;n++)i.append(e[n],E()),K.nextNode(),s.push({type:2,index:++r});i.append(e[t],E())}}}else if(8===i.nodeType)if(i.data===D)s.push({type:2,index:r});else{let e=-1;for(;-1!==(e=i.data.indexOf(M,e+1));)s.push({type:7,index:r}),e+=M.length-1}r++}}static createElement(e,t){const n=A.createElement("template");return n.innerHTML=e,n}}function X(e,t,n=e,i){if(t===U)return t;let r=void 0!==i?n._$Co?.[i]:n._$Cl;const a=L(t)?void 0:t._$litDirective$;return r?.constructor!==a&&(r?._$AO?.(!1),void 0===a?r=void 0:(r=new a(e),r._$AT(e,n,i)),void 0!==i?(n._$Co??=[])[i]=r:n._$Cl=r),void 0!==r&&(t=X(e,r._$AS(e,t.values),r,i)),t}class Z{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:n}=this._$AD,i=(e?.creationScope??A).importNode(t,!0);K.currentNode=i;let r=K.nextNode(),a=0,o=0,s=n[0];for(;void 0!==s;){if(a===s.index){let t;2===s.type?t=new Q(r,r.nextSibling,this,e):1===s.type?t=new s.ctor(r,s.name,s.strings,this,e):6===s.type&&(t=new re(r,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(r=K.nextNode(),a++)}return K.currentNode=A,i}p(e){let t=0;for(const n of this._$AV)void 0!==n&&(void 0!==n.strings?(n._$AI(e,n,t),t+=n.strings.length-2):n._$AI(e[t])),t++}}class Q{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,i){this.type=2,this._$AH=V,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=X(this,e,t),L(e)?e===V||null==e||""===e?(this._$AH!==V&&this._$AR(),this._$AH=V):e!==this._$AH&&e!==U&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>P(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==V&&L(this._$AH)?this._$AA.nextSibling.data=e:this.T(A.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:n}=e,i="number"==typeof n?this._$AC(e):(void 0===n.el&&(n.el=J.createElement(Y(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===i)this._$AH.p(t);else{const e=new Z(i,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=G.get(e.strings);return void 0===t&&G.set(e.strings,t=new J(e)),t}k(e){P(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let n,i=0;for(const r of e)i===t.length?t.push(n=new Q(this.O(E()),this.O(E()),this,this.options)):n=t[i],n._$AI(r),i++;i<t.length&&(this._$AR(n&&n._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=k(e).nextSibling;k(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class ee{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,i,r){this.type=1,this._$AH=V,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=r,n.length>2||""!==n[0]||""!==n[1]?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=V}_$AI(e,t=this,n,i){const r=this.strings;let a=!1;if(void 0===r)e=X(this,e,t,0),a=!L(e)||e!==this._$AH&&e!==U,a&&(this._$AH=e);else{const i=e;let o,s;for(e=r[0],o=0;o<r.length-1;o++)s=X(this,i[n+o],t,o),s===U&&(s=this._$AH[o]),a||=!L(s)||s!==this._$AH[o],s===V?e=V:e!==V&&(e+=(s??"")+r[o+1]),this._$AH[o]=s}a&&!i&&this.j(e)}j(e){e===V?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class te extends ee{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===V?void 0:e}}class ne extends ee{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==V)}}class ie extends ee{constructor(e,t,n,i,r){super(e,t,n,i,r),this.type=5}_$AI(e,t=this){if((e=X(this,e,t,0)??V)===U)return;const n=this._$AH,i=e===V&&n!==V||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,r=e!==V&&(n===V||i);i&&this.element.removeEventListener(this.name,this,n),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class re{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){X(this,e)}}const ae={I:Q},oe=x.litHtmlPolyfillSupport;oe?.(J,Q),(x.litHtmlVersions??=[]).push("3.3.3");const se=(e,t,n)=>{const i=n?.renderBefore??t;let r=i._$litPart$;if(void 0===r){const e=n?.renderBefore??null;i._$litPart$=r=new Q(t.insertBefore(E(),e),e,void 0,n??{})}return r._$AI(e),r},le=globalThis;let de=class extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=se(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return U}};de._$litElement$=!0,de.finalized=!0,le.litElementHydrateSupport?.({LitElement:de});const ce=le.litElementPolyfillSupport;ce?.({LitElement:de}),(le.litElementVersions??=[]).push("4.2.2");const ue={attribute:!0,type:String,converter:_,reflect:!1,hasChanged:y},he=(e=ue,t,n)=>{const{kind:i,metadata:r}=n;let a=globalThis.litPropertyMetadata.get(r);if(void 0===a&&globalThis.litPropertyMetadata.set(r,a=new Map),"setter"===i&&((e=Object.create(e)).wrapped=!0),a.set(n.name,e),"accessor"===i){const{name:i}=n;return{set(n){const r=t.get.call(this);t.set.call(this,n),this.requestUpdate(i,r,e,!0,n)},init(t){return void 0!==t&&this.C(i,void 0,e,t),t}}}if("setter"===i){const{name:i}=n;return function(n){const r=this[i];t.call(this,n),this.requestUpdate(i,r,e,!0,n)}}throw Error("Unsupported decorator location: "+i)};function me(e){return(t,n)=>"object"==typeof n?he(e,t,n):((e,t,n)=>{const i=t.hasOwnProperty(n);return t.constructor.createProperty(n,e),i?Object.getOwnPropertyDescriptor(t,n):void 0})(e,t,n)}function pe(e){return me({...e,state:!0,attribute:!1})}const fe="5.3.0",ge="cache_data_",ve="📅 Calendar Card Pro",_e="add-event",ye="reset",we="back",be=["expand","refresh",_e,ye,we],xe="details",ke="ignore_location",$e=1e3,Te=864e5,Se={POINTER_MOVE_TOLERANCE:8,ADD_SLOT_MINUTES:15,SWIPE_MIN_DISTANCE:48,SWIPE_MIN_SLOPE_RATIO:1.5,SWIPE_EDGE_GUARD:20,SWIPE_NUDGE_MAX:40,SWIPE_ARRIVAL_OFFSET:32,TOOLBAR_SWITCHER_LABEL_MIN_WIDTH:248,TOOLBAR_COMMAND_WIDTH:36,TOOLBAR_COMMAND_GAP:8,TOOLBAR_SWITCHER_SEGMENT_WIDTH:34,TOOLBAR_SWITCHER_TRACK_PADDING:3,TOOLBAR_ROW_INSET:{list:34,column:34,grid:34},LEGEND_UNFOLD_MARGIN:2,SEPARATOR_SPACING:{WEEK:1,MONTH:1.5},HOLD_INDICATOR_OPACITY:.2,HOLD_INDICATOR:{TOUCH_SIZE:100,POINTER_SIZE:50}},Me=["Germany","Deutschland","United States","USA","United States of America","United Kingdom","Great Britain","France","Italy","Italia","Spain","España","Netherlands","Nederland","Austria","Österreich","Switzerland","Schweiz"];let De;function Ce(){return void 0===De&&(De="undefined"==typeof CSS||"function"!=typeof CSS.supports||CSS.supports("color","color-mix(in srgb, red, blue)")),De}const Ae=new Map([["color-mix(in srgb, var(--divider-color) 50%, transparent)","rgba(128, 128, 128, 0.12)"],["color-mix(in srgb, var(--primary-text-color) 4%, transparent)","rgba(128, 128, 128, 0.08)"],["color-mix(in srgb, var(--primary-color, #03a9f4) 31%, transparent)","rgba(128, 128, 128, 0.31)"],["color-mix(in srgb, var(--primary-text-color) 60%, transparent)","var(--secondary-text-color)"]]);function Ee(e){const t=Ae.get(e);return void 0===t||Ce()?e:t}function Le(e){return"home-assistant"===e}const Pe=/^person\.[a-z0-9_]+$/;function Ne(e){return"string"==typeof e&&Pe.test(e)}const Ie={sunday:0,sun:0,monday:1,mon:1,tuesday:2,tue:2,wednesday:3,wed:3,thursday:4,thu:4,friday:5,fri:5,saturday:6,sat:6},Fe="start_of_week";function Re(e){return new Date(e.getFullYear(),e.getMonth(),e.getDate())}function Oe(e,t){return new Date(e.getFullYear(),e.getMonth(),e.getDate()+t)}function ze(e,t){const n=(t-e.getDay()+7)%7;return Oe(e,n)}function je(e,t){const n=(e.getDay()-t+7)%7;return Oe(e,-n)}function He(e){const t=[];let n="";for(const i of e)"+"===i||"-"===i?(t.push(n),n=i):n+=i;return t.push(n),t}function We(e){const t=String(e).replace(/\s+/g,"").toLowerCase();return""!==t&&He(t)[0]===Fe}const Be="en",qe=new Set(["bg","ca","cs","da","de","el","en","en-gb","es","et","fi","fr","he","hr","hu","is","it","ko","lt","lv","nb","nl","nn","pl","pt","ro","ru","sk","sl","sr","sr-latn","sv","th","tr","uk","vi","zh-cn","zh-tw"]),Ue=new Set(["he"]),Ve=new Map;function Ge(e,t){const n=`${e||""}:${t?.language||""}`;if(Ve.has(n))return Ve.get(n);let i;if(e&&""!==e.trim()){const t=e.toLowerCase();if(qe.has(t))return i=t,Ve.set(n,i),i}if(t?.language){const e=t.language.toLowerCase();if(qe.has(e))return i=e,Ve.set(n,i),i;const r=e.split(/[-_]/)[0];if(r!==e&&qe.has(r))return i=r,Ve.set(n,i),i}return i=Be,Ve.set(n,i),i}const Ke={nn:"nb"};function Ye(e){const[t,...n]=e.split("-"),i=Ke[t.toLowerCase()];return i?[e,[i,...n].join("-")]:[e]}function Je(e){const t=Ye(e);return t.some(e=>e.toLowerCase()===Be)?t:[...t,Be]}const Xe=[];let Ze=0;function Qe(){const e=new Map;return Xe.push(e),e}function et(){Ze+=1;for(const e of Xe)e.clear()}function tt(e){return Object.entries(e).map(([e,t])=>`${e}:${t};`).join("")}const nt=new Map;function it(e,t){if(e.startsWith("var("))return function(e,t){return Ce()?`color-mix(in srgb, ${e} ${t}%, transparent)`:function(e){return`rgba(128, 128, 128, ${e/100})`}(t)}(e,t);const n=`${e}|${t}`,i=nt.get(n);if(void 0!==i)return i;const r=function(e,t){if("transparent"===e)return e;const n=document.createElement("div");n.style.display="none",n.style.color=e,document.body.appendChild(n);const i=getComputedStyle(n).color;if(document.body.removeChild(n),!i)return e;const r=i.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);if(r){const[,e,n,i]=r;return`rgba(${e}, ${n}, ${i}, ${t/100})`}const a=i.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)$/);if(a){const[,e,n,i]=a;return`rgba(${e}, ${n}, ${i}, ${t/100})`}return e}(e,t);return nt.set(n,r),r}function rt(e){return/^[a-z][a-z0-9]*:[a-z0-9]/i.test(e)&&!e.startsWith("http")}function at(e){if(void 0===e||!1===e)return"none";if(!0===e)return"dot";if("string"==typeof e){const t=e.toLowerCase();return"dot"===t||"pulse"===t||"glow"===t||"tile"===t?t:""===e.trim()?"dot":rt(e)?"mdi":e.startsWith("/")||/^https?:\/\//i.test(e)||/\.(apng|avif|bmp|gif|ico|jpe?g|png|svg|webp)(?:[?#]|$)/i.test(e)?"image":"emoji"}return"none"}function ot(e){return"none"===e||"icon"===e||"image"===e||"text"===e}function st(e,t){return ot(t)?t:function(e){return"string"!=typeof e||""===e?"none":Le(e)?"icon":Ne(e)?"image":rt(e)?"icon":e.startsWith("/")||/^https?:\/\//i.test(e)||/\.(apng|avif|bmp|gif|ico|jpe?g|png|svg|webp)(?:[?#]|$)/i.test(e)?"image":"text"}(e)}function lt(e,t){return We(e)&&void 0!==t?`_fdw${t}`:""}function dt(e){let t=0;for(let n=0;n<e.length;n++)t=(t<<5)-t+e.charCodeAt(n),t&=t;return Math.abs(t).toString(36)}const ct=new Date(2e3,0,1,13,0,0);function ut(e){try{return!new Intl.DateTimeFormat(Je(e),{hour:"numeric"}).formatToParts(ct).some(e=>"dayPeriod"===e.type)}catch{return}}function ht(e){return"object"==typeof e&&null!==e&&!Array.isArray(e)}const mt=["below","title"];function pt(e){if("string"==typeof e){const t=e.toLowerCase().trim();if(mt.includes(t))return t}return"below"}function ft(e){if(e.scroll_long_titles)return"line";const t=Number(e.title_max_lines)||0;return 1===t?"line":t>1?"cap":"wrap"}function gt(e,t){return Boolean(e.scroll_long_titles)||"grid"!==t&&"title"===pt(e.time_position)&&"line"===ft(e)}const vt=["title","time"],_t=["subtle","outline","tinted","filled"],yt=["accent","text"],wt="accent";let bt=!1;function xt(){const e=globalThis,t=e.calendarCardProLogLevel;return"number"==typeof t&&Number.isInteger(t)&&t>=0&&t<=3?t:!0===e.calendarCardProDebug?3:0}const kt={title:["background: #424242","color: white","display: inline-block","line-height: 20px","text-align: center","border-radius: 20px 0 0 20px","font-size: 12px","font-weight: bold","padding: 4px 8px 4px 12px","margin: 5px 0"].join(";"),version:["background: #4fc3f7","color: white","display: inline-block","line-height: 20px","text-align: center","border-radius: 0 20px 20px 0","font-size: 12px","font-weight: bold","padding: 4px 12px 4px 8px","margin: 5px 0"].join(";"),prefix:["color: #4fc3f7","font-weight: bold"].join(";"),error:["color: #f44336","font-weight: bold"].join(";"),warn:["color: #ff9800","font-weight: bold"].join(";")};function $t(e,t,...n){if(xt()<0)return;const i=function(e){if(null!=e){if("string"==typeof e)return e;if("object"==typeof e)try{return{...e}}catch{try{return{value:JSON.stringify(e)}}catch{return{value:String(e)}}}return String(e)}}(t);if(e instanceof Error){const t=e.message||"Unknown error",r="string"==typeof i?` during ${i}`:"",[a,o]=At(`Error${r}: ${t}`,kt.error);console.error(a,o),e.stack&&console.error(e.stack),i&&"object"==typeof i&&console.error("Context:",{...i,timestamp:(new Date).toISOString()}),n.length>0&&console.error("Additional data:",...n)}else if("string"==typeof e){const t="string"==typeof i?` during ${i}`:"",[r,a]=At(`${e}${t}`,kt.error);i&&"object"==typeof i?console.error(r,a,{context:{...i,timestamp:(new Date).toISOString()},...n.length>0?{additionalData:n}:{}}):n.length>0?console.error(r,a,...n):console.error(r,a)}else{const t="string"==typeof i?` during ${i}`:"",[r,a]=At(`Unknown error${t}:`,kt.error);console.error(r,a,e),i&&"object"==typeof i&&console.error("Context:",{...i,timestamp:(new Date).toISOString()}),n.length>0&&console.error("Additional data:",...n)}}function Tt(e,...t){Ct(1,e,kt.warn,console.warn,...t)}function St(e,...t){const[n,i]=At(e,kt.warn);t.length>0?console.warn(n,i,...t):console.warn(n,i)}function Mt(e,...t){Ct(2,e,kt.prefix,console.log,...t)}function Dt(e,...t){Ct(3,e,kt.prefix,console.log,...t)}function Ct(e,t,n,i,...r){if(xt()<e)return;const[a,o]=At(t,n);r.length>0?i(a,o,...r):i(a,o)}function At(e,t){return[`%c[${ve}] ${e}`,t]}const Et=new Set(["user","state","numeric_state","screen","time","view_columns","location"]),Lt=new Set(["screen","user","view_columns","location","time"]),Pt=new Set(["and","or","not"]),Nt=["sun","mon","tue","wed","thu","fri","sat"],It=/^\w+\.\w+$/,Ft=864e5;function Rt(e){if(null!=e)return Array.isArray(e)?e.length>0?e:void 0:[e]}const Ot=new WeakMap;function zt(e,t){return void 0===e||!0===function(e,t){const n=t.core;if(n){const i=An(e,t.entityId??"");if(i.questions.some(({key:e})=>"error"===n(e)))return;const r=i.evaluate(e=>Vt(e,t),e=>{const t=n(e);return"error"===t?void 0:t});if(void 0!==r)return!0===r}return jt(e.filter(e=>!qt(e)).map(e=>Vt(e,t)))}(e,t)}function jt(e){let t=!1;for(const n of e){if(!1===n)return!1;void 0===n&&(t=!0)}return!t||void 0}function Ht(e){let t=!1;for(const n of e){if(!0===n)return!0;void 0===n&&(t=!0)}return!!t&&void 0}function Wt(e){return"object"==typeof e&&null!==e&&!Array.isArray(e)}function Bt(e){return void 0!==e.for||void 0!==e.value_template}function qt(e){return Wt(e)&&!1===e.enabled}function Ut(e){if(null!=e)return Array.isArray(e)?e:[e]}function Vt(e,t){if(!Wt(e))return;if("enabled"in e&&"boolean"!=typeof e.enabled)return;if(!("condition"in e))return Bt(e)?void 0:Yt(e,t);const n=e.condition;if("string"==typeof n){if(Pt.has(n)){if(void 0===e.conditions)return!0;const i=(Ut(e.conditions)??[]).filter(e=>!qt(e)).map(e=>Vt(e,t));if("or"===n)return Ht(i);const r=jt(i);return"not"===n?void 0===r?void 0:!r:r}if(Et.has(n)&&!Bt(e))switch(n){case"user":return function(e,t){const n=Ut(e.users),i=t.hass?.user?.id;return void 0!==n&&"string"==typeof i&&n.includes(i)}(e,t);case"screen":return"string"==typeof e.media_query&&""!==e.media_query&&t.matches(e.media_query);case"time":return function(e,t){const n=Qt(t.hass),i=t.now,r=nn(n,i),a=Ut(e.weekdays);if(a&&a.length>0&&!a.includes(Nt[r.weekday]))return!1;const o=sn(e.after),s=sn(e.before);if(!o&&!s)return!0;const l=o?on(e.after):null,d=s?on(e.before):null;if(o&&null===l||s&&null===d)return!1;const c=e=>an(n,r.year,r.month,r.day,e),u=null===l?void 0:c(l),h=null===d?void 0:c(d);return void 0!==u&&void 0!==h?h<u?i>=u||i<=h:i>=u&&i<=h:void 0!==u?i>=u:i<=h}(e,t);case"numeric_state":return function(e,t){if("entity_id"in e)return function(e,t){const n=Zt(e.above,t),i=Zt(e.below,t);return null===n||null===i||void 0===n&&void 0===i?void 0:Xt(e,t,e=>{const t=Number(e.state);if(""!==e.state&&!Number.isNaN(t))return(void 0===n||n<t)&&(void 0===i||t<i)})}(e,t);const n="string"==typeof e.entity&&""!==e.entity?e.entity:t.entityId,i=Gt(t,n);if(!i)return!wn(e)&&void 0;const r=e.attribute,a="string"==typeof r&&""!==r?i.attributes?.[r]:i.state,o=Number(a);if(Number.isNaN(o))return!1;const s=e=>Number("string"==typeof e?Kt(t,e)??e:e),l=s(e.above),d=s(e.below);return(void 0===e.above||null===e.above||Number.isNaN(l)||l<o)&&(void 0===e.below||null===e.below||Number.isNaN(d)||d>o)}(e,t);case"view_columns":return!0;case"location":return function(e,t){const n=t.hass,i=cn(n);if(!i)return!1;const r=e.locations;if(null!=r){if(!Array.isArray(r)&&"string"!=typeof r)return!1;if(r.includes(i.state))return!0}if(!0===e.away&&"not_home"===i.state)return!0;if(!mn(e.target))return!1;const a=function(e,t){const n=gn.get(t);let i=n?.zones;if(!n||n.entities!==e?.entities||n.devices!==e?.devices||n.areas!==e?.areas){const n=Object.values(e?.entities??{}),r=e?.devices??{},a=Object.values(e?.areas??{}),o=Wt(t.exclude)?fn(t.exclude,n,r,a):new Set;i=[...fn(t,n,r,a)].filter(e=>"zone"===dn(e)&&!o.has(e)),gn.set(t,{entities:e?.entities,devices:e?.devices,areas:e?.areas,zones:i})}return(i??[]).filter(t=>void 0!==e?.states?.[t])}(n,e.target),o=i.attributes?.in_zones;if(!Array.isArray(o)||0===o.length)return"not_home"!==i.state&&a.some(e=>un(n,e)===i.state);if("active_zone"===e.match_mode){const e=o.find(e=>un(n,e)===i.state);return void 0!==e&&a.includes(e)}return o.some(e=>a.includes(e))}(e,t);default:return Yt(e,t)}}}function Gt(e,t){if("string"==typeof t&&""!==t)return e.hass?.states?.[t]}function Kt(e,t){if("string"==typeof t&&It.test(t))return Gt(e,t)?.state}function Yt(e,t){if("entity_id"in e)return function(e,t){const n=Ut(e.state);if(!n||0===n.length)return;if(n.some(e=>"string"==typeof e&&Jt(e)))return;const i=n.map(e=>String(e));return Xt(e,t,e=>i.includes(e.state))}(e,t);const n="string"==typeof e.entity&&""!==e.entity?e.entity:t.entityId,i=Gt(t,n);if(!i&&!wn(e))return;let r;if(i)if("string"==typeof e.attribute&&""!==e.attribute){const t=i.attributes?.[e.attribute];r=null==t?"unknown":String(t)}else r=i.state;else r="unknown";const a=e.state??e.state_not;if(null==a)return!1;const o=(Ut(a)??[]).flatMap(e=>{const n=Kt(t,e);return void 0===n?[e]:[e,n]}).includes(r);return void 0!==e.state&&null!==e.state?o:!o}function Jt(e){return Number.isNaN(Number(e))&&It.test(e)}function Xt(e,t,n){if(void 0!==e.attribute)return;const i=e.match??"all";if("all"!==i&&"any"!==i)return;const r=function(e){const t=Ut(e.entity_id);if(t&&0!==t.length&&t.every(e=>"string"==typeof e&&""!==e))return t}(e);if(!r)return;const a=r.map(e=>{const i=Gt(t,e);return i?n(i):void 0});return"any"===i?Ht(a):jt(a)}function Zt(e,t){if(null==e)return;if("number"==typeof e)return Number.isFinite(e)?e:null;if("string"!=typeof e)return null;const n=Number(e);if(""!==e.trim()&&!Number.isNaN(n))return n;if(!It.test(e))return null;const i=Gt(t,e)?.state,r=Number(i);return void 0===i||""===i||Number.isNaN(r)?null:r}function Qt(e){const t=Intl.DateTimeFormat().resolvedOptions().timeZone;return"server"===e?.locale?.time_zone&&e.config?.time_zone&&tn(e.config.time_zone)?e.config.time_zone:t}const en=new Map;function tn(e){let t=en.get(e);if(void 0===t){try{t=new Intl.DateTimeFormat("en-US",{timeZone:e,hourCycle:"h23",year:"numeric",month:"numeric",day:"numeric",hour:"numeric",minute:"numeric",second:"numeric",weekday:"short"})}catch{t=null}en.set(e,t)}return t}function nn(e,t){const n=tn(e)??tn("UTC"),i={};for(const{type:e,value:r}of n.formatToParts(t))i[e]=r;const r=Number(i.year),a=Number(i.month)-1,o=Number(i.day);return{year:r,month:a,day:o,weekday:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(i.weekday),asUtc:Date.UTC(r,a,o,Number(i.hour),Number(i.minute),Number(i.second))}}function rn(e,t){const n=t-(t%1e3+1e3)%1e3;return nn(e,n).asUtc-n}function an(e,t,n,i,r){const a=Date.UTC(t,n,i)+r,o=rn(e,a-Ft),s=rn(e,a+Ft),l=[a-o,a-s].filter(t=>t+rn(e,t)===a);return l.length>0?Math.min(...l):a-o}function on(e){if("string"!=typeof e)return null;const t=e.split(":");if(t.length<2||t.length>3||!t.every(e=>/^\d+$/.test(e)))return null;const[n,i,r=0]=t.map(Number);return n>23||i>59||r>59?null:1e3*(60*(60*n+i)+r)}function sn(e){return null!=e&&""!==e}const ln=new Map;function dn(e){const t=e.indexOf(".");return t<0?"":e.slice(0,t)}function cn(e){const t=e?.user?.id;if(!t)return;const n=ln.get(t);if(n){const i=e?.states?.[n];if(i?.attributes?.user_id===t)return i}for(const n of function(e){return Object.keys(e?.entities??{}).filter(e=>"person"===dn(e))}(e)){const i=e?.states?.[n];if(i?.attributes?.user_id===t)return ln.set(t,n),i}}function un(e,t){const n=e?.states?.[t];if(n&&!n.attributes?.passive)return"zone.home"===t?"home":n.attributes?.friendly_name}const hn=["entity_id","device_id","area_id","floor_id","label_id"];function mn(e,t=!0){return Wt(e)&&Object.entries(e).every(([e,n])=>"exclude"===e?t&&mn(n,!1):hn.includes(e)&&function(e){return"string"==typeof e||Array.isArray(e)&&e.every(e=>"string"==typeof e)}(n))}function pn(e){return Ut(e)??[]}function fn(e,t,n,i){const r=new Set(pn(e.entity_id)),a=new Set(pn(e.device_id)),o=new Set(pn(e.area_id)),s=new Set(a),l=e=>"zone"===dn(e.entity_id),d=e=>t.some(t=>t.device_id===e&&l(t)),c=e=>Object.values(n).filter(t=>t.area_id?t.area_id===e:!!t.parent_device_id&&n[t.parent_device_id]?.area_id===e),u=e=>c(e).some(e=>d(e.id))||t.some(t=>t.area_id===e&&l(t));for(const s of pn(e.label_id)){for(const e of i)e.labels?.includes(s)&&u(e.area_id)&&o.add(e.area_id);for(const e of Object.values(n))e.labels?.includes(s)&&d(e.id)&&a.add(e.id);for(const e of t)e.labels?.includes(s)&&l(e)&&r.add(e.entity_id)}for(const t of pn(e.floor_id))for(const e of i)e.floor_id===t&&u(e.area_id)&&o.add(e.area_id);const h=new Set(a);for(const e of o){for(const t of c(e))d(t.id)&&a.add(t.id);for(const n of t)n.area_id===e&&l(n)&&r.add(n.entity_id)}for(const e of Object.values(n))e.parent_device_id&&s.has(e.parent_device_id)&&(a.add(e.id),h.add(e.id));for(const e of a)for(const n of t)n.device_id===e&&l(n)&&(!h.has(e)&&n.area_id||r.add(n.entity_id));return r}const gn=new WeakMap;function vn(e){const t=Object.keys(e?.entities??{}).filter(e=>{const t=dn(e);return"person"===t||"zone"===t});t.push("zone.home");const n=e?.user?.id,i=n?ln.get(n):void 0;i&&t.push(i);const r=cn(e)?.attributes?.in_zones;if(Array.isArray(r))for(const e of r)"string"==typeof e&&t.push(e);return t}function _n(e){return"string"==typeof e.condition&&Pt.has(e.condition)}function yn(e){return"string"==typeof e&&Jt(e)}function wn(e){return"numeric_state"===e.condition?[e.above,e.below].some(yn):void 0!==e.attribute||[...Ut(e.state)??[],...Ut(e.state_not)??[]].some(yn)}function bn(e){if(!Wt(e))return!1;if(_n(e))return(Ut(e.conditions)??[]).every(e=>bn(e));if(!("condition"in e))return!wn(e)&&("entity_id"in e||!Bt(e));const t=e.condition;return"string"==typeof t&&!Lt.has(t)&&("state"!==t&&"numeric_state"!==t||"entity_id"in e||!Bt(e)&&!wn(e))}function xn(e){const t={};for(const n of["alias","note","enabled"])n in e&&(t[n]=e[n]);return t}function kn(e,t){if("conditions"in e&&e.conditions)return{...e,conditions:(Ut(e.conditions)??[]).map(e=>Wt(e)?kn(e,t):e)};const n=e.condition??"state";return"state"!==n&&"numeric_state"!==n||"entity_id"in e?e:{...e,entity:e.entity||t}}const $n=Symbol("unmet");function Tn(e,t){if(null==e)return;const n="number"==typeof e?e:Number(e);return Number.isNaN(n)?"string"==typeof e&&It.test(e)?e:void 0:Number.isFinite(n)?n:"above"===t==n>0?$n:void 0}function Sn(e){if(!("condition"in e))return Mn({condition:"state",...e});if(_n(e)){const t=xn(e);if(void 0===e.conditions)return{...t,condition:"and",conditions:[]};const n=(Ut(e.conditions)??[]).map(e=>Sn(e));return"not"===e.condition?{...t,condition:"not",conditions:[{condition:"and",conditions:n}]}:{...t,condition:e.condition,conditions:n}}return"state"===e.condition?Mn(e):"numeric_state"===e.condition?function(e){if("entity_id"in e)return e;const t=xn(e);if(!e.entity)return{...t,condition:"not",conditions:[{condition:"and",conditions:[]}]};const n=Tn(e.above,"above"),i=Tn(e.below,"below");if(n===$n||i===$n)return{...t,condition:"not",conditions:[{condition:"and",conditions:[]}]};const r=JSON.stringify(e.entity);return void 0===n&&void 0===i?{...t,condition:"template",value_template:void 0===e.attribute?`{{ is_number(states(${r})) }}`:`{{ is_number(state_attr(${r}, ${JSON.stringify(e.attribute)})) }}`}:{...t,condition:"numeric_state",entity_id:e.entity,...void 0!==e.attribute?{attribute:e.attribute}:{},...void 0!==n?{above:n}:{},...void 0!==i?{below:i}:{}}}(e):e}function Mn(e){if("entity_id"in e)return e;const t=xn(e);if(!e.entity||void 0===e.state&&void 0===e.state_not)return{...t,condition:"not",conditions:[{condition:"and",conditions:[]}]};const n={condition:"state",entity_id:e.entity,...void 0!==e.attribute?{attribute:e.attribute}:{}};return void 0!==e.state?{...t,...n,state:e.state}:{...t,condition:"not",conditions:[{...n,state:e.state_not}]}}function Dn(e){return(t,n)=>{let i=!1;for(const r of e){const e=r(t,n);if(!1===e)return!1;void 0===e&&(i=!0)}return!i||void 0}}const Cn=new WeakMap;function An(e,t){let n=Cn.get(e);n||(n=new Map,Cn.set(e,n));const i=n.get(t);if(i)return i;const r=new Map,a=e=>{const t=function(e){const t=[],n=JSON.stringify(e,(e,n)=>("number"!=typeof n||Number.isFinite(n)||t.push(String(n)),n));return t.length>0?`${n}|${t.join(",")}`:n}(e);return r.has(t)||r.set(t,{key:t,condition:e}),(e,n)=>n(t)},o=(e,t)=>{const n=[],i=[];for(const t of e)qt(t)||(bn(t)?n.push(t):i.push(t));const r=[];1===n.length&&r.push(a(Sn(n[0]))),n.length>1&&r.push(a({condition:t,conditions:n.map(Sn)}));for(const e of i)r.push(s(e));return r},s=e=>{if(!Wt(e))return()=>{};if("enabled"in e&&"boolean"!=typeof e.enabled)return()=>{};if(_n(e)){const i=Ut(e.conditions)??[];return"or"===e.condition?(n=o(i,"or"),(e,t)=>{let i=!1;for(const r of n){const n=r(e,t);if(!0===n)return!0;void 0===n&&(i=!0)}return!!i&&void 0}):"not"===e.condition?(t=Dn(o(i,"and")),(e,n)=>{const i=t(e,n);return void 0===i?void 0:!i}):Dn(o(i,"and"))}var t,n;return t=>t(e)},l=Dn(o(e.map(e=>Wt(e)?kn(e,t):e),"and")),d={questions:[...r.values()],evaluate:l};return n.set(t,d),d}function En(e,t){return An(e,t).questions}function Ln(e,t){for(const n of e){if(!Wt(n))continue;t(n);const e=Ut(n.conditions);e&&"string"==typeof n.condition&&Pt.has(n.condition)&&Ln(e,t)}}function Pn(e){const t=new Set;return Ln(e,e=>{"screen"===e.condition&&"string"==typeof e.media_query&&""!==e.media_query&&t.add(e.media_query)}),[...t]}function Nn(e,t,n){const i=[];if(Ln(e,e=>{"time"===e.condition&&i.push(e)}),0===i.length)return null;const r=Qt(t),a=nn(r,n),o=new Date(Date.UTC(a.year,a.month,a.day+1)),s=(e,t)=>an(r,e.year,e.month,e.day,t),l={year:o.getUTCFullYear(),month:o.getUTCMonth(),day:o.getUTCDate()},d=(e,t)=>{const i=s(a,e)+t;return i>n?i:s(l,e)+t},c=[s(l,0)];for(const e of i){const t=sn(e.after)?on(e.after):null,n=sn(e.before)?on(e.before):null;null!==t&&c.push(d(t,0)),null!==n&&c.push(d(n,1))}return Math.min(...c)}function In(e){const t=new Set;for(const n of e){if(!Wt(n)){t.add("malformed");continue}const e="condition"in n?n.condition:"state";if("string"!=typeof e)t.add("malformed");else if(Pt.has(e)){const e=Ut(n.conditions);e&&In(e).forEach(e=>t.add(e))}else{if(bn(n))continue;void 0!==n.for?t.add(`${e} with for`):void 0!==n.value_template&&t.add(`${e} with value_template`)}}return[...t]}const Fn={hidden:new Set,calendars:new Set};function Rn(e,t){return`${e}\0${function(e){let t=Ot.get(e);return void 0===t&&(t=JSON.stringify(e)??"",Ot.set(e,t)),t}(t)}`}function On(e,t){if(e.size!==t.size)return!1;for(const n of e)if(!t.has(n))return!1;return!0}function zn(e,t){if(0===t.hidden.size)return!1;const n=e._matchedConfig?.visibility;return void 0!==n&&t.hidden.has(Rn(e._entityId??"",n))}const jn={config_version:void 0,entities:[],view:"list",start_date:void 0,days_to_show:3,compact_days_to_show:void 0,compact_events_to_show:void 0,compact_events_complete_days:!1,event_order:"earliest_first",skip_first_events:void 0,show_empty_days:!1,show_empty_today:!1,hide_when_empty:!1,empty_day_text:void 0,filter_duplicates:!1,duplicate_accent_color:void 0,split_multiday_events:!1,multiday_banners:!0,event_type:"all",language:void 0,title:void 0,title_font_size:void 0,title_color:void 0,background_color:"var(--ha-card-background)",accent_color:"var(--primary-color, #03a9f4)",vertical_line_width:"2px",day_spacing:"10px",event_gap:"0px",event_spacing:"4px",additional_card_spacing:"0px",height:"auto",max_height:"none",first_day_of_week:"system",show_week_numbers:null,show_current_week_number:!0,week_number_font_size:"12px",week_number_color:"var(--primary-text-color)",week_number_background_color:"color-mix(in srgb, var(--primary-color, #03a9f4) 31%, transparent)",day_separator_width:"0px",day_separator_color:"var(--secondary-text-color)",week_separator_width:"0px",week_separator_color:"color-mix(in srgb, var(--primary-color, #03a9f4) 31%, transparent)",month_separator_width:"0px",month_separator_color:"var(--primary-text-color)",today_indicator:"tile",today_indicator_position:"15% 50%",today_indicator_color:"var(--primary-color, #03a9f4)",today_indicator_size:"6px",date_vertical_alignment:"middle",weekday_font_size:"14px",weekday_color:"var(--primary-text-color)",day_font_size:"26px",day_color:"var(--primary-text-color)",show_month:!0,month_font_size:"12px",month_color:"var(--primary-text-color)",weekend_weekday_color:void 0,weekend_day_color:void 0,weekend_month_color:void 0,today_weekday_color:void 0,today_day_color:void 0,today_month_color:void 0,today_date_scale:1,today_date_font_weight:"default",past_date_scale:1,past_date_font_weight:"default",past_date_opacity:100,event_background_opacity:0,past_event_opacity:60,show_past_events:!1,show_countdown:!1,show_countdown_allday:!0,countdown_exact_days:!1,countdown_max_days:void 0,show_progress_bar:!1,show_now_indicator:!0,now_color:"#34d399",progress_bar_color:"var(--secondary-text-color)",progress_bar_height:"0.75em",progress_bar_width:void 0,event_icon_vertical_alignment:"top",event_font_size:"14px",event_color:"var(--primary-text-color)",empty_day_color:"var(--primary-text-color)",show_time:!0,time_position:"below",show_single_allday_time:!0,show_multiday_allday_time:!0,allday_badge:"off",allday_badge_style:"subtle",allday_badge_color:"accent",time_24h:"system",time_two_digit_hours:!1,show_end_time:!0,show_duration:!1,time_font_size:"12px",time_color:"var(--secondary-text-color)",time_icon_size:"14px",time_max_lines:0,show_location:!0,show_location_allday:!0,remove_location_country:!1,location_font_size:"12px",location_color:"var(--secondary-text-color)",location_icon_size:"14px",location_max_lines:0,show_description:!1,show_description_allday:!0,title_max_lines:0,scroll_long_titles:!1,description_max_lines:0,description_font_size:"12px",description_color:"var(--secondary-text-color)",description_icon_size:"14px",weather:{entity:void 0,position:"date",date:{show_conditions:!0,show_high_temp:!0,show_low_temp:!1,show_uv_index:!1,uv_index_threshold:0,icon_size:"14px",font_size:"12px"},event:{show_conditions:!0,show_temp:!0,show_uv_index:!1,uv_index_threshold:0,daily_forecast_fallback:!0,max_lines:0,icon_size:"14px",font_size:"12px"}},tap_action:{action:"none"},hold_action:{action:"none"},day_tap_action:{action:"none"},event_tap_action:{action:"none"},event_hold_action:{action:"none"},open_links:!1,allow_event_edit:!0,allow_event_delete:!0,toolbar:{show:!1,navigation:!0,add_event:!0,view_switcher:!0,reset:!1,refresh:!0,search:!0,legend:"menu",buttons:[]},refresh_interval:30,refresh_on_navigate:!0,list:void 0,column:void 0,time_grid:void 0};function Hn(e,t=0){const n="string"==typeof e&&""!==e.trim()?Number(e):e;if("number"==typeof n&&Number.isFinite(n)&&!(n<t))return n}function Wn(e){const t=Hn(e);return void 0!==t&&t<=100?t:void 0}const Bn={light:"var(--ha-font-weight-light, 300)",regular:"var(--ha-font-weight-normal, 400)",normal:"var(--ha-font-weight-normal, 400)",medium:"var(--ha-font-weight-medium, 500)",bold:"var(--ha-font-weight-bold, 700)"};function qn(e){const t="string"==typeof e?e.trim().toLowerCase():e;if("default"===t)return"";if("string"==typeof t&&Object.prototype.hasOwnProperty.call(Bn,t))return Bn[t];const n=Hn(t,1);return void 0!==n&&n<=1e3?String(n):void 0}function Un(e,t="past_event_opacity"){null==e||"string"==typeof e&&""===e.trim()||void 0!==Wn(e)||Tt(`Ignoring "${t}": expected a finite percentage from 0 to 100.`)}const Vn={max_events_to_show:"compact_events_to_show",vertical_line_color:"accent_color",horizontal_line_width:"day_separator_width",horizontal_line_color:"day_separator_color",row_spacing:"day_spacing"},Gn={max_events_to_show:"compact_events_to_show"};function Kn(e,t){const n={...e};for(const[i,r]of Object.entries(t)){const t=e[i];n[i]=ht(r)&&ht(t)?Kn(t,r):r}return n}const Yn=[!1,"menu","chips"];function Jn(e){const t=jn.toolbar,n=ht(e.toolbar)?e.toolbar:{},i=e=>"boolean"==typeof n[e]?n[e]:t[e],r=Yn.includes(n.legend)?n.legend:t.legend;return{show:i("show"),navigation:i("navigation"),addEvent:i("add_event"),viewSwitcher:i("view_switcher"),reset:i("reset"),refresh:i("refresh"),search:i("search"),legend:r,buttons:Array.isArray(n.buttons)?n.buttons.filter(Xn):[]}}function Xn(e){if(!ht(e))return!1;const{icon:t,name:n,entity:i,tap_action:r}=e,a=e=>null==e;return"string"==typeof t&&""!==t.trim()&&(a(n)||"string"==typeof n)&&(a(i)||"string"==typeof i)&&(a(r)||ht(r))}function Zn(e){return e.days_to_show=Hn(e.days_to_show,1)??jn.days_to_show,e.refresh_interval=Hn(e.refresh_interval,1)??jn.refresh_interval,e.event_background_opacity=Hn(e.event_background_opacity,0)??jn.event_background_opacity,Un(e.past_event_opacity),e.past_event_opacity=Wn(e.past_event_opacity)??jn.past_event_opacity,e.today_date_scale=Hn(e.today_date_scale,Number.MIN_VALUE)??1,e.past_date_scale=Hn(e.past_date_scale,Number.MIN_VALUE)??1,e.past_date_opacity=Wn(e.past_date_opacity)??100,void 0===qn(e.today_date_font_weight)&&(e.today_date_font_weight="default"),void 0===qn(e.past_date_font_weight)&&(e.past_date_font_weight="default"),e.compact_days_to_show=Hn(e.compact_days_to_show,1),e.compact_events_to_show=Hn(e.compact_events_to_show,0),e.countdown_max_days=Hn(e.countdown_max_days,0),e.skip_first_events=Hn(e.skip_first_events,0),e}function Qn(e,t){return ti(ei(jn,e),t,e)}function ei(e,t){let n=e;for(const e of t.split("."))n=Ci(n)?n[e]:void 0;return n}function ti(e,t,n){const i=function(e,t){return function(e){return"string"==typeof e&&/^-?\d+(?:\.\d+)?px$/.test(e)}(e)||void 0!==t&&Ti.has(t)}(e,n);if(null==t)return i?e:t;const r=void 0===n?void 0:si(n);if(void 0!==r)return r(t)??e;const a=Si(t);return void 0===a?t:i?`${a}px`:t}const ni=new Set(["today_indicator_size","time_icon_size","location_icon_size","description_icon_size","weather.date.icon_size","weather.event.icon_size"]),ii=new Set(["title_font_size","week_number_font_size","weekday_font_size","day_font_size","month_font_size","event_font_size","time_font_size","location_font_size","description_font_size","weather.date.font_size","weather.event.font_size"]),ri=new Set(["vertical_line_width"]),ai={thin:"1px",medium:"3px",thick:"5px",none:"0px"},oi=[...ni,...ii,...ri];function si(e){return ni.has(e)?_i:ri.has(e)?wi:ii.has(e)?yi:void 0}const li="(?:px|cm|mm|q|in|pt|pc|r?em|r?ex|r?cap|r?ch|r?ic|r?lh|[sld]?v(?:w|h|i|b|min|max)|cq(?:w|h|i|b|min|max))",di=new RegExp(`^\\+?(?:\\d*\\.)?\\d+(?:e[+-]?\\d+)?${li}$`,"i"),ci=new RegExp(`(\\d)\\s+(${li})(?![a-z])`,"gi"),ui=new RegExp(`(\\d)\\s+(${li}|%)(?![a-z])`,"gi"),hi=/^\+?(?:\d*\.)?\d+(?:e[+-]?\d+)?%$/i,mi=/^(?:xx-small|x-small|small|medium|large|x-large|xx-large|xxx-large|larger|smaller|math|inherit|initial|unset|revert|revert-layer)$/i,pi=/^[a-z][a-z-]*\([\s\S]*\)$/i,fi=/[\s;]+$/,gi=/!\s*important$/i;function vi(e,t){return"undefined"==typeof CSS||"function"!=typeof CSS.supports||CSS.supports(e,t)}function _i(e){return bi(e,xi)}function yi(e){return bi(e,ki)}function wi(e){return("string"==typeof e?ai[e.trim().toLowerCase()]:void 0)??_i(e)}function bi(e,t){if("string"!=typeof e)return t(e);const n=e.replace(fi,"").trim();if(!gi.test(n))return t(n);const i=t(n.replace(gi,"").replace(fi,"").trim());return void 0===i?void 0:`${i} !important`}function xi(e){const t=Si(e),n=void 0!==t?`${t}px`:"string"==typeof e?e.replace(ci,"$1$2"):"";return di.test(n)||pi.test(n)&&!n.includes("%")&&vi("border-top-width",n)?n:void 0}function ki(e){const t=Si(e),n=void 0!==t?`${t}px`:"string"==typeof e?e.replace(ui,"$1$2"):"";return di.test(n)||hi.test(n)||mi.test(n)||pi.test(n)&&vi("font-size",n)?n:void 0}function $i(e,t,n=e){if(!function(e,t){const n=si(e);return void 0!==n&&null!=t&&!("string"==typeof t&&""===t.trim())&&void 0===n(t)}(e,t))return;const i=ii.has(e)?'a CSS font size such as "14px", "1.2em", "120%" or "large"':ri.has(e)?'a non-negative CSS length such as "2px" or "0.2em", or "thin", "medium" or "thick"':'a non-negative CSS length such as "6px" or "0.5em"',r=ei(jn,e),a=void 0===r?"Ignoring it.":`Falling back to "${String(r)}".`;Tt(`Invalid ${n} ${JSON.stringify(t)}: expected ${i}. ${a}`)}const Ti=new Set(["title_font_size","progress_bar_width","progress_bar_height","height","max_height","axis_width"]);function Si(e){if("number"==typeof e)return Number.isFinite(e)?`${e}`:void 0;if("string"!=typeof e)return;const t=e.trim();return/^-?\d+(?:\.\d+)?$/.test(t)?t:void 0}function Mi(e){return Di(e,jn),e}function Di(e,t,n){let i=!1;for(const r of Object.keys(e)){const a=e[r],o=t[r],s=void 0===n?r:`${n}.${r}`;if(Ci(a)&&Ci(o)){const t={...a};Di(t,o,s)&&(e[r]=t,i=!0);continue}const l=ti(o,a,s);l!==a&&(e[r]=l,i=!0)}return i}function Ci(e){return"object"==typeof e&&null!==e&&!Array.isArray(e)}function Ai(e){return Array.isArray(e)?e.map(e=>"string"==typeof e?{entity:e,color:void 0,accent_color:void 0,label_icon_color:void 0}:e&&"object"==typeof e&&e.entity?{entity:e.entity,name:"string"==typeof e.name&&""!==e.name.trim()?e.name.trim():void 0,show_in_legend:"boolean"==typeof e.show_in_legend?e.show_in_legend:void 0,label:e.label,label_type:ot(e.label_type)?e.label_type:void 0,color:e.color||void 0,accent_color:e.accent_color||void 0,label_icon_color:e.label_icon_color||void 0,text_scale:Hn(e.text_scale,Number.MIN_VALUE),show_time:e.show_time,show_location:e.show_location,location_icon:e.location_icon||void 0,show_description:e.show_description,show_weather:"boolean"==typeof e.show_weather?e.show_weather:void 0,compact_events_to_show:Hn(e.compact_events_to_show,0),blocklist:e.blocklist,allowlist:e.allowlist,filter_field:e.filter_field,replace_field:e.replace_field,replace_pattern:e.replace_pattern,replace_with:e.replace_with,split_multiday_events:e.split_multiday_events,multiday_banners:e.multiday_banners,event_type:e.event_type,days_of_week:e.days_of_week,allday_expires_at:e.allday_expires_at,visibility:Rt(e.visibility)}:null).filter(Boolean):[]}function Ei(e){return JSON.stringify((e||[]).map(e=>{const t="string"==typeof e?{entity:e}:e;return Object.keys(t).sort().map(e=>[e,t[e]])}))}const Li=["event_type"],Pi={columns:"full",rows:"auto"};function Ni(e){return{toolbar:{show:!0},event_tap_action:{action:xe},day_tap_action:{action:_e},...void 0===e?{}:{weather:{entity:e}}}}function Ii(e){return{type:"custom:calendar-card-pro",config_version:5,entities:[...e],days_to_show:3}}function Fi(e){const t=function(e){if(!e||"object"!=typeof e)return null;if("states"in e&&"object"==typeof e.states){const t=Object.keys(e.states).find(e=>e.startsWith("calendar."));if(t)return t}return Object.keys(e).find(e=>e.startsWith("calendar."))||null}(e);return{...Ii(t?[t]:[]),_description:t?void 0:"A calendar card that displays events from multiple calendars with individual styling. Add a calendar integration to Home Assistant to use this card."}}function Ri(e){return"home-assistant"===e}const Oi="accent";function zi(e){return e===Oi}const ji=new Set(["primary","accent","red","pink","purple","deep-purple","indigo","blue","light-blue","cyan","teal","green","light-green","lime","yellow","amber","orange","deep-orange","brown","light-grey","grey","dark-grey","blue-grey","black","white","primary-text","secondary-text","disabled"]);function Hi(e){return ji.has(e)?`var(--${e}-color)`:e}let Wi,Bi,qi,Ui=new Map,Vi=!1,Gi=0,Ki=!1,Yi=0,Ji=0;const Xi=new WeakSet,Zi=new Set;function Qi(){return Ui}function er(){for(const e of Zi)e()}function tr(e){const t=function(e,t){if("function"==typeof e.callWS)return e.callWS(t);const n=e.connection;return n&&"function"==typeof n.sendMessagePromise?n.sendMessagePromise(t):void 0}(e,{type:"config/entity_registry/list"});if(!t)return void(Ki||(Ki=!0,Dt("This instance exposes no WebSocket command API, so Home Assistant calendar colors are unavailable; configured colors are used instead")));const n=Yi;return t.then(e=>n===Yi&&(Ui=function(e){const t=new Map;for(const n of e??[]){const e=n?.entity_id;if("string"!=typeof e||!e.startsWith("calendar."))continue;const i=n.options?.calendar?.color;"string"==typeof i&&""!==i&&t.set(e,Hi(i))}return t}(e),Vi=!0,Ji=0,ir(),Dt(`Loaded ${Ui.size} calendar colors from the entity registry`),!0)).catch(e=>(Dt("Could not read calendar colors from the entity registry",e),!1))}function nr(e){const t=tr(e);if(!t)return;const n=Yi;Wi=t.then(t=>{n===Yi&&(Wi=void 0,t?er():function(e){if(Vi||qi||0===Zi.size)return;Ji+=1;const t=Math.min(6e4*2**Math.min(Ji-1,20),18e5);qi={timer:setTimeout(()=>rr(!1),t),hass:e}}(e))})}function ir(){qi&&(clearTimeout(qi.timer),qi=void 0)}function rr(e){const t=qi?.hass;ir(),e&&(Ji=0),t&&!Vi&&!Wi&&Zi.size>0&&nr(t)}function ar(e){Zi.delete(e),0===Zi.size&&(Gi++,Yi++,Bi&&(Bi(),Bi=void 0),Vi=!1,Wi=void 0,Ji=0,ir())}const or=["days_to_show","show_empty_days","show_empty_today","empty_day_text","empty_day_color","split_multiday_events","show_past_events","filter_duplicates","duplicate_accent_color","vertical_line_width","event_spacing","event_gap","day_spacing","additional_card_spacing","height","max_height","today_indicator","today_indicator_size","today_indicator_color","weekday_font_size","day_font_size","show_month","month_font_size","today_date_scale","today_date_font_weight","past_date_scale","past_date_font_weight","past_date_opacity","event_background_opacity","past_event_opacity","event_color","event_font_size","show_countdown","show_countdown_allday","countdown_exact_days","countdown_max_days","show_progress_bar","show_now_indicator","now_color","progress_bar_color","progress_bar_height","progress_bar_width","event_icon_vertical_alignment","show_time","time_position","show_single_allday_time","show_multiday_allday_time","allday_badge","allday_badge_style","allday_badge_color","time_two_digit_hours","show_end_time","show_duration","time_color","time_font_size","time_icon_size","time_max_lines","show_location","show_location_allday","remove_location_country","location_color","location_font_size","location_icon_size","location_max_lines","show_description","show_description_allday","title_max_lines","scroll_long_titles","description_max_lines","description_color","description_font_size","description_icon_size","show_week_numbers","show_current_week_number","week_number_font_size","week_number_color","week_number_background_color","day_separator_width","day_separator_color","week_separator_width","week_separator_color","month_separator_width","month_separator_color"],sr=[...or,"multiday_banners"],lr=[...or,"compact_days_to_show","compact_events_to_show","compact_events_complete_days","event_order","skip_first_events","date_vertical_alignment","today_indicator_position"],dr=["list","column","grid"],cr=new Set(["column","grid"]),ur={date_vertical_alignment:new Set(["list"]),today_indicator_position:new Set(["list"]),compact_events_to_show:new Set(["list"]),compact_days_to_show:new Set(["list"]),compact_events_complete_days:new Set(["list"]),event_order:new Set(["list"]),skip_first_events:new Set(["list"]),split_multiday_events:new Set(["list","column"]),multiday_banners:new Set(["grid"]),empty_day_text:new Set(["list","column"]),empty_day_color:new Set(["list","column"]),show_now_indicator:new Set(["list","column"]),show_single_allday_time:new Set(["list","column"]),show_multiday_allday_time:new Set(["list","column"]),show_location_allday:new Set(["list","column"]),show_description_allday:new Set(["list","column"]),show_countdown_allday:new Set(["list","column"]),allday_badge:new Set(["list","column"]),allday_badge_style:new Set(["list","column"]),allday_badge_color:new Set(["list","column"]),time_position:new Set(["list","column"]),event_spacing:new Set(["list","column"]),event_gap:new Set(["list","column"]),time_max_lines:new Set(["list","column"]),open_links:new Set(["list","column"])};function hr(e,t){const n=Object.prototype.hasOwnProperty.call(ur,e)?ur[e]:void 0;return void 0===n||n.has(t)}function mr(e,t){return"latest_first"===e.event_order&&hr("event_order",t)}const pr=new Set(["entities","start_date","first_day_of_week","weather","refresh_interval","refresh_on_navigate"]),fr={day_header_gap:"8px",day_header_separator_width:"0px",day_header_separator_color:"var(--divider-color)",min_day_width:140,min_days_fallback:"list"},gr={day_header_gap:"8px",day_header_separator_width:"1px",day_header_separator_color:"color-mix(in srgb, var(--divider-color) 50%, transparent)",min_day_width:100,min_days_to_show:1,min_days_fallback:"list",start_time:"07:00",end_time:"22:00",slot_minutes:60,weekend_background_color:"color-mix(in srgb, var(--primary-text-color) 4%, transparent)",today_background_color:"transparent",hour_height:"48px",show_now_line:!0,max_simultaneous_events:3,overlap_layout:"cascade",allday_band_max_rows:3,axis_width:"max-content",show_axis_labels:!0,axis_label_minutes:60,hour_line_width:"1px",hour_line_color:"color-mix(in srgb, var(--divider-color) 50%, transparent)",allday_band_line_width:"2px",allday_band_line_color:"color-mix(in srgb, var(--divider-color) 50%, transparent)"};function vr(e,t){const n=Wr(e,"column");return n&&jr(n,t)?function(e,t){const n=fr[e];if("number"==typeof n){const e="number"==typeof t?t:Number.parseFloat(String(t));return Number.isFinite(e)&&e>0?e:n}return"min_days_fallback"===e?"cramp"===t||"list"===t?t:n:String(ti(n,t,e))}(t,n[t]):fr[t]}const _r=/^(\d+(?:\.\d+)?)px$/i;function yr(e){const t=gr.axis_width,n=String(ti(t,e,"axis_width"));return"max-content"===n||_r.test(n)?{value:n,usedFallback:!1}:{value:t,usedFallback:!0}}function wr(e,t){const n=Wr(e,"grid");return n&&jr(n,t)?function(e,t){const n=gr[e];if("min_days_fallback"===e)return"cramp"===t||"list"===t?t:n;if("overlap_layout"===e)return"cascade"===t||"columns"===t?t:n;if("boolean"==typeof n)return"boolean"==typeof t?t:n;if("number"==typeof n){const i="number"==typeof t?t:Number.parseFloat(String(t));return"slot_minutes"===e?[15,20,30,60].includes(i)?i:n:"axis_label_minutes"===e?[30,60,120,180].includes(i)?i:n:"allday_band_max_rows"===e||"max_simultaneous_events"===e?Number.isFinite(i)&&i>0?Math.max(1,Math.floor(i)):n:Number.isFinite(i)&&i>0?i:n}return"start_time"===e||"end_time"===e?"string"==typeof t||"number"==typeof t?String(t):"":"weekend_background_color"===e||"today_background_color"===e?"string"==typeof t?t:n:"axis_width"===e?yr(t).value:String(ti(n,t,e))}(t,n[t]):gr[t]}function br(e){const t=/^([-+]?(?:\d*\.)?\d+)[a-z%]*$/i.exec(e.trim());return null!==t&&0===Number.parseFloat(t[1])}function xr(e){const t=e.event_gap;return"string"==typeof t&&!t.trim().startsWith("-")&&!br(t)}function kr(e,t){const n=e.trim(),i=/^([-+]?(?:\d*\.)?\d+)([a-z%]*)$/i.exec(n);if(i){const e=i[2]||"px";return`${Number.parseFloat(i[1])*t}${e}`}return`calc(${t} * (${n}))`}const $r=new Map([["xx-small",9.6],["x-small",12],["small",128/9],["medium",16],["large",19.2],["x-large",24],["xx-large",32],["xxx-large",48]]),Tr=/((?:\d*\.)?\d+(?:e[+-]?\d+)?)%/gi,Sr=new Map([["larger",1.2],["smaller",1/1.2],["math",1],["inherit",1],["unset",1],["revert",1],["revert-layer",1]]),Mr=new RegExp(`(^|[^\\w-])(${[...$r.keys(),...Sr.keys(),"initial"].join("|")})(?![\\w-])`,"gi");function Dr(e,t){const n=e.trim().replace(/\s*!\s*important$/i,"").trim(),i=Cr(n,t);if(void 0!==i)return i;const r=/^\+?((?:\d*\.)?\d+(?:e[+-]?\d+)?)%$/i.exec(n);return r?Number.parseFloat(r[1])*t/100+"em":kr(n.replace(Tr,(e,t)=>Number.parseFloat(t)/100+"em").replace(Mr,(e,t,n)=>`${t}${Cr(n,1)??n}`),t)}function Cr(e,t){const n=e.toLowerCase(),i=$r.get("initial"===n?"medium":n);if(void 0!==i)return i*t+"px";const r=Sr.get(n);return void 0===r?void 0:t*r+"em"}const Ar=/\s*!\s*important\s*$/i,Er=new Map([["xx-small",9],["x-small",10],["small",13],["medium",16],["initial",16],["large",18],["x-large",24],["xx-large",32],["xxx-large",48]]),Lr=new RegExp(`(^|[^\\w-])(${[...Er.keys()].join("|")})(?![\\w-])`,"gi"),Pr=new Set(["inherit","initial","unset","revert","revert-layer"]),Nr=new Set(["em","ex","ch","cap","ic","lh"]),Ir=new Set(["px","cm","mm","q","in","pt","pc","rem","rex","rch","rcap","ric","rlh",...["vw","vh","vi","vb","vmin","vmax"].flatMap(e=>[e,`s${e}`,`l${e}`,`d${e}`]),"cqw","cqh","cqi","cqb","cqmin","cqmax"]),Fr=/(^|[^\w.-])([-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)([a-z]+)(?![\w-])/gi;function Rr(e,t){const n=e.trim().replace(Ar,"").trim();return Ar.test(e)?`${t(n)} !important`:t(n)}function Or(e,t,n="1em"){return Rr(e,e=>{const i=e.toLowerCase();if(Pr.has(i))return Or(n,t);const r=Er.get(i);return void 0!==r?r*t+"px":Dr(e.replace(Lr,(e,t,n)=>`${t}${Er.get(n.toLowerCase())}px`),t)})}function zr(e,t,n=!0){return Rr(e,e=>/var\(/i.test(e)?`calc(${t} * (${e}))`:e.replace(Fr,(e,i,r,a)=>{const o=a.toLowerCase();return Ir.has(o)||!n&&Nr.has(o)?`${i}${Number.parseFloat(r)*t}${a}`:e}))}function jr(e,t){return Object.prototype.hasOwnProperty.call(e,t)&&!function(e,t){return void 0===t||("past_event_opacity"===e||"past_date_opacity"===e?void 0===Wn(t):"today_date_scale"===e||"past_date_scale"===e?void 0===Hn(t,Number.MIN_VALUE):"today_date_font_weight"===e||"past_date_font_weight"===e?void 0===qn(t):"countdown_max_days"===e&&void 0===Hn(t,0))}(t,e[t])}const Hr={list:{blockKey:"list",overrideKeys:lr,onlyKeys:[],onlyDefaults:{},defaultOverrides:{}},column:{blockKey:"column",overrideKeys:or,onlyKeys:["day_header_gap","day_header_separator_width","day_header_separator_color","min_day_width","min_days_to_show","min_days_fallback"],onlyDefaults:fr,defaultOverrides:{show_empty_days:!0,split_multiday_events:!0}},grid:{blockKey:"time_grid",overrideKeys:sr,onlyKeys:["day_header_gap","day_header_separator_width","day_header_separator_color","min_day_width","min_days_to_show","min_days_fallback","start_time","end_time","slot_minutes","weekend_background_color","today_background_color","hour_height","show_now_line","max_simultaneous_events","overlap_layout","allday_band_max_rows","axis_width","show_axis_labels","axis_label_minutes","hour_line_width","hour_line_color","allday_band_line_width","allday_band_line_color"],onlyDefaults:gr,defaultOverrides:{day_separator_width:"1px",day_separator_color:"color-mix(in srgb, var(--divider-color) 50%, transparent)",day_spacing:"1px",description_color:Oi,event_background_opacity:20,event_color:Oi,event_font_size:"12px",location_color:Oi,progress_bar_color:Oi,time_color:Oi,progress_bar_width:"100%",show_empty_days:!0,show_location:!1,show_past_events:!0}}};function Wr(e,t){const n=Hr[t];if(!n)return;const i=e[n.blockKey];return i&&"object"==typeof i?i:void 0}function Br(e){return"list"===e}function qr(e){switch(e){case"column":return"column-view";case"grid":return"grid-view";case"list":return""}}function Ur(e,t,n){const i=Hr[n];if(!i)return e[t];const r=Wr(e,n);return r&&jr(r,t)?Zn({...e,[t]:Qn(t,r[t])})[t]:i.defaultOverrides[t]??e[t]}function Vr(e,t){const n=Hr[t];if(!n)return e;const i=Wr(e,t),r={...n.defaultOverrides};if(i)for(const e of n.overrideKeys){const t=e;jr(i,t)&&(r[e]=Qn(e,i[t]))}return 0===Object.keys(r).length?e:Zn({...e,...r})}function Gr(e,t){const n=Hr[t];if(!n)return;!function(e,t){for(const n of t.onlyKeys)Object.prototype.hasOwnProperty.call(e,n)&&Zr({kind:"view-only",key:n,from:null,to:[t.blockKey]})}(e,n);const i=Wr(e,t);if(!i)return;const r=new Set([...n.overrideKeys,...n.onlyKeys]);Un(i.past_event_opacity,`${n.blockKey}.past_event_opacity`);for(const e of oi)r.has(e)&&$i(e,i[e],`${n.blockKey}.${e}`);for(const t of Xr(e,n))Zr(t)}function Kr(e){return Object.values(Hr).filter(t=>t.overrideKeys.includes(e)||t.onlyKeys.includes(e)).map(e=>e.blockKey)}let Yr;function Jr(){if(void 0===Yr){const e=Ai([{entity:"calendar.probe"}])[0]??{};Yr=new Set(Object.keys(e).filter(e=>"entity"!==e&&!Object.prototype.hasOwnProperty.call(jn,e)))}return Yr}function Xr(e,t){const n=e[t.blockKey];if(!n||"object"!=typeof n||Array.isArray(n))return[];const i=new Set([...t.overrideKeys,...t.onlyKeys]),r=t.blockKey,a=[];for(const e of Object.keys(n)){if(i.has(e))continue;const t=Kr(e);pr.has(e)?a.push({kind:"fetch-time",key:e,from:r,to:[null]}):t.length>0?a.push({kind:"wrong-view",key:e,from:r,to:t}):Object.prototype.hasOwnProperty.call(jn,e)?a.push({kind:"card-wide",key:e,from:r,to:[null]}):Jr().has(e)?a.push({kind:"calendar",key:e,from:r,to:[]}):a.push({kind:"unknown",key:e,from:r,to:[]})}return a}function Zr(e){const{key:t,from:n}=e,i=`${n}.${t}`;switch(e.kind){case"fetch-time":return void Tt(`Ignoring "${i}": it determines which events are loaded from Home Assistant, so it cannot differ between views — switching views would have to refetch. Set "${t}" at the top level instead.`);case"card-wide":return void Tt(`Ignoring "${i}": "${t}" is a valid top-level option but cannot be overridden per view. Set it at the top level instead.`);case"wrong-view":return void Tt(`Ignoring "${i}": it belongs in ${e.to.map(e=>`"${e}:"`).join(" or ")}, not in "${n}:".`);case"view-only":for(const n of e.to)Tt(`Ignoring top-level "${t}": it is a ${n}-view-only option and has no effect outside the "${n}:" block. Move it to "${n}: { ${t}: ... }".`);return;case"calendar":return void Tt(`Ignoring "${null===n?t:i}": it is an option of one calendar. Set it on that calendar under "entities:".`);case"unknown":Tt(`Ignoring "${i}": not a recognized option.`)}}function Qr(e){return e.trim().startsWith("-")?jn.day_spacing:e}function ea(e,t){const n=_r.exec(e.trim());return n?Number.parseFloat(n[1]):t}function ta(e,t){return ea(Qr(e),t)}Object.fromEntries(Object.entries(Hr).map(([e,t])=>[e,t.blockKey])),new Set(Object.values(Hr).flatMap(e=>e.onlyKeys));const na=ta(jn.day_spacing,10),ia=ea(jn.time_font_size,12);function ra(e,t){return ta(String(Ur(e,"day_spacing",t)),na)}function aa(e,t){return Math.max(1,Math.floor(Ur(e,"days_to_show",t)))}function oa(e){return Hr[e]?.onlyDefaults??fr}function sa(e,t){const n=Wr(e,t),i=oa(t).min_day_width,r="number"==typeof i?i:fr.min_day_width,a=n&&Object.prototype.hasOwnProperty.call(n,"min_day_width")?n.min_day_width:r,o="number"==typeof a?a:Number.parseFloat(String(a));return Number.isFinite(o)&&o>0?o:r}function la(e,t="column"){const n=aa(e,t),i=Wr(e,t),r=oa(t).min_days_to_show,a="number"==typeof r&&Number.isFinite(r)?Math.floor(r):n;if(!i||!Object.prototype.hasOwnProperty.call(i,"min_days_to_show"))return Math.min(n,Math.max(1,a));const o=i.min_days_to_show,s="number"==typeof o?o:Number.parseFloat(String(o));return Number.isFinite(s)?Math.min(n,Math.max(1,Math.floor(s))):Math.min(n,Math.max(1,a))}function da(e,t="column"){const n=Wr(e,t),i=oa(t).min_days_fallback;return"cramp"===(n&&Object.prototype.hasOwnProperty.call(n,"min_days_fallback")?n.min_days_fallback:i)?"cramp":"list"}function ca(e){const t=Jn(e);if(t.show&&t.viewSwitcher)return dr;const n=e.view;return cr.has(n)&&"list"===da(e,n)?[n,"list"]:[n]}function ua(e){return Math.max(...ca(e).map(t=>Ur(e,"days_to_show",t)))}function ha(e){const t=ua(e);return Number.isFinite(t)&&t!==e.days_to_show?{...e,days_to_show:t}:e}function ma(e,t,n){const i=ra(e,n),r=sa(e,n)+i,a=function(e,t,n){if("grid"!==t)return 0;const i=String(wr(e,"axis_width")).trim(),r=_r.exec(i),a=null!==r?Number.parseFloat(r[1]):"max-content"!==i||wr(e,"show_axis_labels")?function(e,t){const n=Number(wr(e,"axis_label_minutes"))%60==0?48:72;return ea(String(Ur(e,"time_font_size",t)),ia)/ia*(n-12)+12}(e,t):0;return a+n}(e,n,i);if(r<=0)return 0;const o=Math.floor((t-32+i-a)/r+1e-9);return Math.max(0,Math.min(aa(e,n),o))}function pa(e,t,n,i){const r=aa(t,e);if(!cr.has(e))return{view:e,columns:0};if(null===n||n<=0)return{view:e,columns:r};const a=Math.min(la(t,e),r),o=fa(e,t,n,i);return o>=a?{view:e,columns:Math.min(o,r)}:"cramp"===da(t,e)?{view:e,columns:a}:{view:"list",columns:0}}function fa(e,t,n,i){const r=i&&i.view===e?i.columns:0,a=function(e,t="column"){const n=sa(e,t)+ra(e,t);return Math.max(0,Math.min(16,(n-1)/2))}(t,e),o=ma(t,n,e);return o>r?ma(t,n-a,e):o<r?ma(t,n+a,e):o}function ga(e,t,n){const i=pa(e,t,n,null);return i.view===e?i:pa(e,t,n,{view:e,columns:aa(t,e)})}function va(e){if(!e||!e.length)return;const t=e[0];return"string"==typeof t?t:t.entity}function _a(e,t,n){const i=new Event("hass-action",{bubbles:!0,composed:!0});i.detail={config:t,action:n},e.dispatchEvent(i)}function ya(e,t){switch(e.action){case"expand":t.expand?.();break;case"refresh":t.refresh?.();break;case _e:t.addEvent?.();break;case ye:t.reset?.();break;case we:t.back?.(e);break;default:return!1}return Dt(`Executed ${e.action} action`),!0}function wa(e,t,n,i={},r=t.entities){const a="hold"===n?t.hold_action:t.tap_action;a&&"none"!==a.action&&(ya(a,i)||(_a(e,{entity:va(r),tap_action:t.tap_action,hold_action:t.hold_action},n),Dt(`Delegated ${n} action (${a.action}) to HA native handler`)))}function ba(e,t,n){return 0!==(Number(e?.states?.[t]?.attributes?.supported_features??0)&n)}async function xa(e,t){if("function"!=typeof e.callWS)throw new Error("Home Assistant offers no WebSocket connection to write with");await e.callWS(t)}function ka(e,t,n){return xa(e,{type:"calendar/event/create",entity_id:t,event:n})}function $a(e,t,n){return xa(e,{type:"calendar/event/update",entity_id:t.entityId,uid:t.uid,...t.recurrenceId?{recurrence_id:t.recurrenceId,recurrence_range:t.range??""}:{},event:n})}function Ta(e,t){return xa(e,{type:"calendar/event/delete",entity_id:t.entityId,uid:t.uid,...t.recurrenceId?{recurrence_id:t.recurrenceId,recurrence_range:t.range??""}:{}})}function Sa(e){if("string"==typeof e)return e||void 0;const t=e?.message;return"string"==typeof t&&t?t:void 0}const Ma="ui.components.calendar.event.add",Da="Add event";function Ca(e){const t=e?.localize?.(Ma);return t&&t!==Ma?t:void 0}function Aa(e,t){return e.find(e=>!t.has(e))??e[0]}function Ea(e){const t=e.split("/").find(e=>""!==e);return void 0===t?"/":`/${t}`}const La="calendar-card-pro-calendars-changed";function Pa(e,t,n){return"ids"in e?e.ids.some(e=>t.includes(e)):t.some(t=>ba(n,t,e.feature))}function Na(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var Ia,Fa={exports:{}};function Ra(){return Ia||(Ia=1,Fa.exports=function(){var e=6e4,t=36e5,n="millisecond",i="second",r="minute",a="hour",o="day",s="week",l="month",d="quarter",c="year",u="date",h="Invalid Date",m=/^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,p=/\[([^\]]+)]|YYYY|YY|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,f={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),ordinal:function(e){var t=["th","st","nd","rd"],n=e%100;return"["+e+(t[(n-20)%10]||t[n]||t[0])+"]"}},g=function(e,t,n){var i=String(e);return!i||i.length>=t?e:""+Array(t+1-i.length).join(n)+e},v={s:g,z:function(e){var t=-e.utcOffset(),n=Math.abs(t),i=Math.floor(n/60),r=n%60;return(t<=0?"+":"-")+g(i,2,"0")+":"+g(r,2,"0")},m:function e(t,n){if(t.date()<n.date())return-e(n,t);var i=12*(n.year()-t.year())+(n.month()-t.month()),r=t.clone().add(i,l),a=n-r<0,o=t.clone().add(i+(a?-1:1),l);return+(-(i+(n-r)/(a?r-o:o-r))||0)},a:function(e){return e<0?Math.ceil(e)||0:Math.floor(e)},p:function(e){return{M:l,y:c,w:s,d:o,D:u,h:a,m:r,s:i,ms:n,Q:d}[e]||String(e||"").toLowerCase().replace(/s$/,"")},u:function(e){return void 0===e}},_="en",y={};y[_]=f;var w="$isDayjsObject",b=function(e){return e instanceof T||!(!e||!e[w])},x=function e(t,n,i){var r;if(!t)return _;if("string"==typeof t){var a=t.toLowerCase();y[a]&&(r=a),n&&(y[a]=n,r=a);var o=t.split("-");if(!r&&o.length>1)return e(o[0])}else{var s=t.name;y[s]=t,r=s}return!i&&r&&(_=r),r||!i&&_},k=function(e,t){if(b(e))return e.clone();var n="object"==typeof t?t:{};return n.date=e,n.args=arguments,new T(n)},$=v;$.l=x,$.i=b,$.w=function(e,t){return k(e,{locale:t.$L,utc:t.$u,x:t.$x,$offset:t.$offset})};var T=function(){function f(e){this.$L=x(e.locale,null,!0),this.parse(e),this.$x=this.$x||e.x||{},this[w]=!0}var g=f.prototype;return g.parse=function(e){this.$d=function(e){var t=e.date,n=e.utc;if(null===t)return new Date(NaN);if($.u(t))return new Date;if(t instanceof Date)return new Date(t);if("string"==typeof t&&!/Z$/i.test(t)){var i=t.match(m);if(i){var r=i[2]-1||0,a=(i[7]||"0").substring(0,3);return n?new Date(Date.UTC(i[1],r,i[3]||1,i[4]||0,i[5]||0,i[6]||0,a)):new Date(i[1],r,i[3]||1,i[4]||0,i[5]||0,i[6]||0,a)}}return new Date(t)}(e),this.init()},g.init=function(){var e=this.$d;this.$y=e.getFullYear(),this.$M=e.getMonth(),this.$D=e.getDate(),this.$W=e.getDay(),this.$H=e.getHours(),this.$m=e.getMinutes(),this.$s=e.getSeconds(),this.$ms=e.getMilliseconds()},g.$utils=function(){return $},g.isValid=function(){return!(this.$d.toString()===h)},g.isSame=function(e,t){var n=k(e);return this.startOf(t)<=n&&n<=this.endOf(t)},g.isAfter=function(e,t){return k(e)<this.startOf(t)},g.isBefore=function(e,t){return this.endOf(t)<k(e)},g.$g=function(e,t,n){return $.u(e)?this[t]:this.set(n,e)},g.unix=function(){return Math.floor(this.valueOf()/1e3)},g.valueOf=function(){return this.$d.getTime()},g.startOf=function(e,t){var n=this,d=!!$.u(t)||t,h=$.p(e),m=function(e,t){var i=$.w(n.$u?Date.UTC(n.$y,t,e):new Date(n.$y,t,e),n);return d?i:i.endOf(o)},p=function(e,t){return $.w(n.toDate()[e].apply(n.toDate("s"),(d?[0,0,0,0]:[23,59,59,999]).slice(t)),n)},f=this.$W,g=this.$M,v=this.$D,_="set"+(this.$u?"UTC":"");switch(h){case c:return d?m(1,0):m(31,11);case l:return d?m(1,g):m(0,g+1);case s:var y=this.$locale().weekStart||0,w=(f<y?f+7:f)-y;return m(d?v-w:v+(6-w),g);case o:case u:return p(_+"Hours",0);case a:return p(_+"Minutes",1);case r:return p(_+"Seconds",2);case i:return p(_+"Milliseconds",3);default:return this.clone()}},g.endOf=function(e){return this.startOf(e,!1)},g.$set=function(e,t){var s,d=$.p(e),h="set"+(this.$u?"UTC":""),m=(s={},s[o]=h+"Date",s[u]=h+"Date",s[l]=h+"Month",s[c]=h+"FullYear",s[a]=h+"Hours",s[r]=h+"Minutes",s[i]=h+"Seconds",s[n]=h+"Milliseconds",s)[d],p=d===o?this.$D+(t-this.$W):t;if(d===l||d===c){var f=this.clone().set(u,1);f.$d[m](p),f.init(),this.$d=f.set(u,Math.min(this.$D,f.daysInMonth())).$d}else m&&this.$d[m](p);return this.init(),this},g.set=function(e,t){return this.clone().$set(e,t)},g.get=function(e){return this[$.p(e)]()},g.add=function(n,d){var u,h=this;n=Number(n);var m=$.p(d),p=function(e){var t=k(h);return $.w(t.date(t.date()+Math.round(e*n)),h)};if(m===l)return this.set(l,this.$M+n);if(m===c)return this.set(c,this.$y+n);if(m===o)return p(1);if(m===s)return p(7);var f=(u={},u[r]=e,u[a]=t,u[i]=1e3,u)[m]||1,g=this.$d.getTime()+n*f;return $.w(g,this)},g.subtract=function(e,t){return this.add(-1*e,t)},g.format=function(e){var t=this,n=this.$locale();if(!this.isValid())return n.invalidDate||h;var i=e||"YYYY-MM-DDTHH:mm:ssZ",r=$.z(this),a=this.$H,o=this.$m,s=this.$M,l=n.weekdays,d=n.months,c=n.meridiem,u=function(e,n,r,a){return e&&(e[n]||e(t,i))||r[n].slice(0,a)},m=function(e){return $.s(a%12||12,e,"0")},f=c||function(e,t,n){var i=e<12?"AM":"PM";return n?i.toLowerCase():i};return i.replace(p,function(e,i){return i||function(e){switch(e){case"YY":return String(t.$y).slice(-2);case"YYYY":return $.s(t.$y,4,"0");case"M":return s+1;case"MM":return $.s(s+1,2,"0");case"MMM":return u(n.monthsShort,s,d,3);case"MMMM":return u(d,s);case"D":return t.$D;case"DD":return $.s(t.$D,2,"0");case"d":return String(t.$W);case"dd":return u(n.weekdaysMin,t.$W,l,2);case"ddd":return u(n.weekdaysShort,t.$W,l,3);case"dddd":return l[t.$W];case"H":return String(a);case"HH":return $.s(a,2,"0");case"h":return m(1);case"hh":return m(2);case"a":return f(a,o,!0);case"A":return f(a,o,!1);case"m":return String(o);case"mm":return $.s(o,2,"0");case"s":return String(t.$s);case"ss":return $.s(t.$s,2,"0");case"SSS":return $.s(t.$ms,3,"0");case"Z":return r}return null}(e)||r.replace(":","")})},g.utcOffset=function(){return 15*-Math.round(this.$d.getTimezoneOffset()/15)},g.diff=function(n,u,h){var m,p=this,f=$.p(u),g=k(n),v=(g.utcOffset()-this.utcOffset())*e,_=this-g,y=function(){return $.m(p,g)};switch(f){case c:m=y()/12;break;case l:m=y();break;case d:m=y()/3;break;case s:m=(_-v)/6048e5;break;case o:m=(_-v)/864e5;break;case a:m=_/t;break;case r:m=_/e;break;case i:m=_/1e3;break;default:m=_}return h?m:$.a(m)},g.daysInMonth=function(){return this.endOf(l).$D},g.$locale=function(){return y[this.$L]},g.locale=function(e,t){if(!e)return this.$L;var n=this.clone(),i=x(e,t,!0);return i&&(n.$L=i),n},g.clone=function(){return $.w(this.$d,this)},g.toDate=function(){return new Date(this.valueOf())},g.toJSON=function(){return this.isValid()?this.toISOString():null},g.toISOString=function(){return this.$d.toISOString()},g.toString=function(){return this.$d.toUTCString()},f}(),S=T.prototype;return k.prototype=S,[["$ms",n],["$s",i],["$m",r],["$H",a],["$W",o],["$M",l],["$y",c],["$D",u]].forEach(function(e){S[e[1]]=function(t){return this.$g(t,e[0],e[1])}}),k.extend=function(e,t){return e.$i||(e(t,T,k),e.$i=!0),k},k.locale=x,k.isDayjs=b,k.unix=function(e){return k(1e3*e)},k.en=y[_],k.Ls=y,k.p={},k}()),Fa.exports}var Oa,za,ja=Na(Ra()),Ha={exports:{}},Wa=(Oa||(Oa=1,Ha.exports=function(e,t,n){e=e||{};var i=t.prototype,r={future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"};function a(e,t,n,r){return i.fromToBase(e,t,n,r)}n.en.relativeTime=r,i.fromToBase=function(t,i,a,o,s){for(var l,d,c,u=a.$locale().relativeTime||r,h=e.thresholds||[{l:"s",r:44,d:"second"},{l:"m",r:89},{l:"mm",r:44,d:"minute"},{l:"h",r:89},{l:"hh",r:21,d:"hour"},{l:"d",r:35},{l:"dd",r:25,d:"day"},{l:"M",r:45},{l:"MM",r:10,d:"month"},{l:"y",r:17},{l:"yy",d:"year"}],m=h.length,p=0;p<m;p+=1){var f=h[p];f.d&&(l=o?n(t).diff(a,f.d,!0):a.diff(t,f.d,!0));var g=(e.rounding||Math.round)(Math.abs(l));if(c=l>0,g<=f.r||!f.r){g<=1&&p>0&&(f=h[p-1]);var v=u[f.l];s&&(g=s(""+g)),d="string"==typeof v?v.replace("%d",g):v(g,i,f.l,c);break}}if(i)return d;var _=c?u.future:u.past;return"function"==typeof _?_(d):_.replace("%s",d)},i.to=function(e,t){return a(e,t,this,!0)},i.from=function(e,t){return a(e,t,this)};var o=function(e){return e.$u?n.utc():n()};i.toNow=function(e){return this.to(o(this),e)},i.fromNow=function(e){return this.from(o(this),e)}}),Ha.exports),Ba=Na(Wa);za||(za=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(Ra()),t={name:"bg",relativeTime:{future:"след %s",past:"преди %s",s:"няколко секунди",m:"минута",mm:"%d минути",h:"час",hh:"%d часа",d:"ден",dd:"%d дена",M:"месец",MM:"%d месеца",y:"година",yy:"%d години"}};e.default.locale(t,null,!0)}());var qa;qa||(qa=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(Ra()),t={name:"ca",relativeTime:{future:"d'aquí %s",past:"fa %s",s:"uns segons",m:"un minut",mm:"%d minuts",h:"una hora",hh:"%d hores",d:"un dia",dd:"%d dies",M:"un mes",MM:"%d mesos",y:"un any",yy:"%d anys"}};e.default.locale(t,null,!0)}());var Ua;Ua||(Ua=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(Ra());function t(e){return e>1&&e<5&&1!=~~(e/10)}function n(e,n,i,r){var a=e+" ";switch(i){case"s":return n||r?"pár sekund":"pár sekundami";case"m":return n?"minuta":r?"minutu":"minutou";case"mm":return n||r?a+(t(e)?"minuty":"minut"):a+"minutami";case"h":return n?"hodina":r?"hodinu":"hodinou";case"hh":return n||r?a+(t(e)?"hodiny":"hodin"):a+"hodinami";case"d":return n||r?"den":"dnem";case"dd":return n||r?a+(t(e)?"dny":"dní"):a+"dny";case"M":return n||r?"měsíc":"měsícem";case"MM":return n||r?a+(t(e)?"měsíce":"měsíců"):a+"měsíci";case"y":return n||r?"rok":"rokem";case"yy":return n||r?a+(t(e)?"roky":"let"):a+"lety"}}var i={name:"cs",relativeTime:{future:"za %s",past:"před %s",s:n,m:n,mm:n,h:n,hh:n,d:n,dd:n,M:n,MM:n,y:n,yy:n}};e.default.locale(i,null,!0)}());var Va;Va||(Va=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(Ra()),t={name:"da",relativeTime:{future:"om %s",past:"%s siden",s:"få sekunder",m:"et minut",mm:"%d minutter",h:"en time",hh:"%d timer",d:"en dag",dd:"%d dage",M:"en måned",MM:"%d måneder",y:"et år",yy:"%d år"}};e.default.locale(t,null,!0)}());var Ga;Ga||(Ga=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(Ra()),t={s:"ein paar Sekunden",m:["eine Minute","einer Minute"],mm:"%d Minuten",h:["eine Stunde","einer Stunde"],hh:"%d Stunden",d:["ein Tag","einem Tag"],dd:["%d Tage","%d Tagen"],M:["ein Monat","einem Monat"],MM:["%d Monate","%d Monaten"],y:["ein Jahr","einem Jahr"],yy:["%d Jahre","%d Jahren"]};function n(e,n,i){var r=t[i];return Array.isArray(r)&&(r=r[n?0:1]),r.replace("%d",e)}var i={name:"de",relativeTime:{future:"in %s",past:"vor %s",s:n,m:n,mm:n,h:n,hh:n,d:n,dd:n,M:n,MM:n,y:n,yy:n}};e.default.locale(i,null,!0)}());var Ka;Ka||(Ka=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(Ra()),t={name:"el",relativeTime:{future:"σε %s",past:"πριν %s",s:"μερικά δευτερόλεπτα",m:"ένα λεπτό",mm:"%d λεπτά",h:"μία ώρα",hh:"%d ώρες",d:"μία μέρα",dd:"%d μέρες",M:"ένα μήνα",MM:"%d μήνες",y:"ένα χρόνο",yy:"%d χρόνια"}};e.default.locale(t,null,!0)}());var Ya;Ya||(Ya=1,"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),"January_February_March_April_May_June_July_August_September_October_November_December".split("_"));var Ja;Ja||(Ja=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(Ra()),t={name:"es",relativeTime:{future:"en %s",past:"hace %s",s:"unos segundos",m:"un minuto",mm:"%d minutos",h:"una hora",hh:"%d horas",d:"un día",dd:"%d días",M:"un mes",MM:"%d meses",y:"un año",yy:"%d años"}};e.default.locale(t,null,!0)}());var Xa;Xa||(Xa=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(Ra());function t(e,t,n,i){var r={s:["mõne sekundi","mõni sekund","paar sekundit"],m:["ühe minuti","üks minut"],mm:["%d minuti","%d minutit"],h:["ühe tunni","tund aega","üks tund"],hh:["%d tunni","%d tundi"],d:["ühe päeva","üks päev"],M:["kuu aja","kuu aega","üks kuu"],MM:["%d kuu","%d kuud"],y:["ühe aasta","aasta","üks aasta"],yy:["%d aasta","%d aastat"]};return t?(r[n][2]?r[n][2]:r[n][1]).replace("%d",e):(i?r[n][0]:r[n][1]).replace("%d",e)}var n={name:"et",relativeTime:{future:"%s pärast",past:"%s tagasi",s:t,m:t,mm:t,h:t,hh:t,d:t,dd:"%d päeva",M:t,MM:t,y:t,yy:t}};e.default.locale(n,null,!0)}());var Za;Za||(Za=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(Ra());function t(e,t,n,i){var r={s:"muutama sekunti",m:"minuutti",mm:"%d minuuttia",h:"tunti",hh:"%d tuntia",d:"päivä",dd:"%d päivää",M:"kuukausi",MM:"%d kuukautta",y:"vuosi",yy:"%d vuotta",numbers:"nolla_yksi_kaksi_kolme_neljä_viisi_kuusi_seitsemän_kahdeksan_yhdeksän".split("_")},a={s:"muutaman sekunnin",m:"minuutin",mm:"%d minuutin",h:"tunnin",hh:"%d tunnin",d:"päivän",dd:"%d päivän",M:"kuukauden",MM:"%d kuukauden",y:"vuoden",yy:"%d vuoden",numbers:"nollan_yhden_kahden_kolmen_neljän_viiden_kuuden_seitsemän_kahdeksan_yhdeksän".split("_")},o=i&&!t?a:r,s=o[n];return e<10?s.replace("%d",o.numbers[e]):s.replace("%d",e)}var n={name:"fi",relativeTime:{future:"%s päästä",past:"%s sitten",s:t,m:t,mm:t,h:t,hh:t,d:t,dd:t,M:t,MM:t,y:t,yy:t}};e.default.locale(n,null,!0)}());var Qa;Qa||(Qa=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(Ra()),t={name:"fr",relativeTime:{future:"dans %s",past:"il y a %s",s:"quelques secondes",m:"une minute",mm:"%d minutes",h:"une heure",hh:"%d heures",d:"un jour",dd:"%d jours",M:"un mois",MM:"%d mois",y:"un an",yy:"%d ans"}};e.default.locale(t,null,!0)}());var eo;eo||(eo=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(Ra()),t={s:"מספר שניות",ss:"%d שניות",m:"דקה",mm:"%d דקות",h:"שעה",hh:"%d שעות",hh2:"שעתיים",d:"יום",dd:"%d ימים",dd2:"יומיים",M:"חודש",MM:"%d חודשים",MM2:"חודשיים",y:"שנה",yy:"%d שנים",yy2:"שנתיים"};function n(e,n,i){return(t[i+(2===e?"2":"")]||t[i]).replace("%d",e)}var i={name:"he",relativeTime:{future:"בעוד %s",past:"לפני %s",s:n,m:n,mm:n,h:n,hh:n,d:n,dd:n,M:n,MM:n,y:n,yy:n}};e.default.locale(i,null,!0)}());var to;to||(to=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(Ra()),t={name:"hr",relativeTime:{future:"za %s",past:"prije %s",s:"sekunda",m:"minuta",mm:"%d minuta",h:"sat",hh:"%d sati",d:"dan",dd:"%d dana",M:"mjesec",MM:"%d mjeseci",y:"godina",yy:"%d godine"}};e.default.locale(t,null,!0)}());var no;no||(no=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(Ra()),t={name:"hu",relativeTime:{future:"%s múlva",past:"%s",s:function(e,t,n,i){return"néhány másodperc"+(i||t?"":"e")},m:function(e,t,n,i){return"egy perc"+(i||t?"":"e")},mm:function(e,t,n,i){return e+" perc"+(i||t?"":"e")},h:function(e,t,n,i){return"egy "+(i||t?"óra":"órája")},hh:function(e,t,n,i){return e+" "+(i||t?"óra":"órája")},d:function(e,t,n,i){return"egy "+(i||t?"nap":"napja")},dd:function(e,t,n,i){return e+" "+(i||t?"nap":"napja")},M:function(e,t,n,i){return"egy "+(i||t?"hónap":"hónapja")},MM:function(e,t,n,i){return e+" "+(i||t?"hónap":"hónapja")},y:function(e,t,n,i){return"egy "+(i||t?"év":"éve")},yy:function(e,t,n,i){return e+" "+(i||t?"év":"éve")}}};e.default.locale(t,null,!0)}());var io;io||(io=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(Ra()),t={s:["nokkrar sekúndur","nokkrar sekúndur","nokkrum sekúndum"],m:["mínúta","mínútu","mínútu"],mm:["mínútur","mínútur","mínútum"],h:["klukkustund","klukkustund","klukkustund"],hh:["klukkustundir","klukkustundir","klukkustundum"],d:["dagur","dag","degi"],dd:["dagar","daga","dögum"],M:["mánuður","mánuð","mánuði"],MM:["mánuðir","mánuði","mánuðum"],y:["ár","ár","ári"],yy:["ár","ár","árum"]};function n(e,n,i,r){var a=function(e,n,i,r){var a=r?0:i?1:2,o=2===e.length&&n%10==1?e[0]:e,s=t[o][a];return 1===e.length?s:"%d "+s}(i,e,r,n);return a.replace("%d",e)}var i={name:"is",relativeTime:{future:"eftir %s",past:"fyrir %s síðan",s:n,m:n,mm:n,h:n,hh:n,d:n,dd:n,M:n,MM:n,y:n,yy:n}};e.default.locale(i,null,!0)}());var ro;ro||(ro=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(Ra()),t={name:"it",relativeTime:{future:"tra %s",past:"%s fa",s:"qualche secondo",m:"un minuto",mm:"%d minuti",h:"un'ora",hh:"%d ore",d:"un giorno",dd:"%d giorni",M:"un mese",MM:"%d mesi",y:"un anno",yy:"%d anni"}};e.default.locale(t,null,!0)}());var ao;ao||(ao=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(Ra()),t={name:"ko",relativeTime:{future:"%s 후",past:"%s 전",s:"몇 초",m:"1분",mm:"%d분",h:"한 시간",hh:"%d시간",d:"하루",dd:"%d일",M:"한 달",MM:"%d달",y:"일 년",yy:"%d년"}};e.default.locale(t,null,!0)}());var oo;oo||(oo=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(Ra()),t={name:"lt",relativeTime:{future:"už %s",past:"prieš %s",s:"kelias sekundes",m:"minutę",mm:"%d minutes",h:"valandą",hh:"%d valandas",d:"dieną",dd:"%d dienas",M:"mėnesį",MM:"%d mėnesius",y:"metus",yy:"%d metus"}};e.default.locale(t,null,!0)}());var so;so||(so=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(Ra()),t={name:"lv",relativeTime:{future:"pēc %s",past:"pirms %s",s:"dažām sekundēm",m:"minūtes",mm:"%d minūtēm",h:"stundas",hh:"%d stundām",d:"dienas",dd:"%d dienām",M:"mēneša",MM:"%d mēnešiem",y:"gada",yy:"%d gadiem"}};e.default.locale(t,null,!0)}());var lo;lo||(lo=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(Ra()),t={name:"nb",relativeTime:{future:"om %s",past:"%s siden",s:"noen sekunder",m:"ett minutt",mm:"%d minutter",h:"en time",hh:"%d timer",d:"en dag",dd:"%d dager",M:"en måned",MM:"%d måneder",y:"ett år",yy:"%d år"}};e.default.locale(t,null,!0)}());var co;co||(co=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(Ra()),t={name:"nl",relativeTime:{future:"over %s",past:"%s geleden",s:"een paar seconden",m:"een minuut",mm:"%d minuten",h:"een uur",hh:"%d uur",d:"een dag",dd:"%d dagen",M:"een maand",MM:"%d maanden",y:"een jaar",yy:"%d jaar"}};e.default.locale(t,null,!0)}());var uo;uo||(uo=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(Ra()),t={name:"nn",relativeTime:{future:"om %s",past:"for %s sidan",s:"nokre sekund",m:"eitt minutt",mm:"%d minutt",h:"ein time",hh:"%d timar",d:"ein dag",dd:"%d dagar",M:"ein månad",MM:"%d månadar",y:"eitt år",yy:"%d år"}};e.default.locale(t,null,!0)}());var ho;ho||(ho=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(Ra());function t(e){return e%10<5&&e%10>1&&~~(e/10)%10!=1}function n(e,n,i){var r=e+" ";switch(i){case"m":return n?"minuta":"minutę";case"mm":return r+(t(e)?"minuty":"minut");case"h":return n?"godzina":"godzinę";case"hh":return r+(t(e)?"godziny":"godzin");case"MM":return r+(t(e)?"miesiące":"miesięcy");case"yy":return r+(t(e)?"lata":"lat")}}var i={name:"pl",relativeTime:{future:"za %s",past:"%s temu",s:"kilka sekund",m:n,mm:n,h:n,hh:n,d:"1 dzień",dd:"%d dni",M:"miesiąc",MM:n,y:"rok",yy:n}};e.default.locale(i,null,!0)}());var mo;mo||(mo=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(Ra()),t={name:"pt",relativeTime:{future:"em %s",past:"há %s",s:"alguns segundos",m:"um minuto",mm:"%d minutos",h:"uma hora",hh:"%d horas",d:"um dia",dd:"%d dias",M:"um mês",MM:"%d meses",y:"um ano",yy:"%d anos"}};e.default.locale(t,null,!0)}());var po;po||(po=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(Ra()),t={name:"ro",relativeTime:{future:"peste %s",past:"acum %s",s:"câteva secunde",m:"un minut",mm:"%d minute",h:"o oră",hh:"%d ore",d:"o zi",dd:"%d zile",M:"o lună",MM:"%d luni",y:"un an",yy:"%d ani"}};e.default.locale(t,null,!0)}());var fo;fo||(fo=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(Ra());function t(e,t,n){var i,r;return"m"===n?t?"минута":"минуту":e+" "+(i=+e,r={mm:t?"минута_минуты_минут":"минуту_минуты_минут",hh:"час_часа_часов",dd:"день_дня_дней",MM:"месяц_месяца_месяцев",yy:"год_года_лет"}[n].split("_"),i%10==1&&i%100!=11?r[0]:i%10>=2&&i%10<=4&&(i%100<10||i%100>=20)?r[1]:r[2])}var n={name:"ru",relativeTime:{future:"через %s",past:"%s назад",s:"несколько секунд",m:t,mm:t,h:"час",hh:t,d:"день",dd:t,M:"месяц",MM:t,y:"год",yy:t}};e.default.locale(n,null,!0)}());var go;go||(go=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(Ra());function t(e){return e>1&&e<5&&1!=~~(e/10)}function n(e,n,i,r){var a=e+" ";switch(i){case"s":return n||r?"pár sekúnd":"pár sekundami";case"m":return n?"minúta":r?"minútu":"minútou";case"mm":return n||r?a+(t(e)?"minúty":"minút"):a+"minútami";case"h":return n?"hodina":r?"hodinu":"hodinou";case"hh":return n||r?a+(t(e)?"hodiny":"hodín"):a+"hodinami";case"d":return n||r?"deň":"dňom";case"dd":return n||r?a+(t(e)?"dni":"dní"):a+"dňami";case"M":return n||r?"mesiac":"mesiacom";case"MM":return n||r?a+(t(e)?"mesiace":"mesiacov"):a+"mesiacmi";case"y":return n||r?"rok":"rokom";case"yy":return n||r?a+(t(e)?"roky":"rokov"):a+"rokmi"}}var i={name:"sk",relativeTime:{future:"za %s",past:"pred %s",s:n,m:n,mm:n,h:n,hh:n,d:n,dd:n,M:n,MM:n,y:n,yy:n}};e.default.locale(i,null,!0)}());var vo;vo||(vo=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(Ra());function t(e){return e%100==2}function n(e){return e%100==3||e%100==4}function i(e,i,r,a){var o=e+" ";switch(r){case"s":return i||a?"nekaj sekund":"nekaj sekundami";case"m":return i?"ena minuta":"eno minuto";case"mm":return t(e)?o+(i||a?"minuti":"minutama"):n(e)?o+(i||a?"minute":"minutami"):o+(i||a?"minut":"minutami");case"h":return i?"ena ura":"eno uro";case"hh":return t(e)?o+(i||a?"uri":"urama"):n(e)?o+(i||a?"ure":"urami"):o+(i||a?"ur":"urami");case"d":return i||a?"en dan":"enim dnem";case"dd":return t(e)?o+(i||a?"dneva":"dnevoma"):o+(i||a?"dni":"dnevi");case"M":return i||a?"en mesec":"enim mesecem";case"MM":return t(e)?o+(i||a?"meseca":"mesecema"):n(e)?o+(i||a?"mesece":"meseci"):o+(i||a?"mesecev":"meseci");case"y":return i||a?"eno leto":"enim letom";case"yy":return t(e)?o+(i||a?"leti":"letoma"):n(e)?o+(i||a?"leta":"leti"):o+(i||a?"let":"leti")}}var r={name:"sl",relativeTime:{future:"čez %s",past:"pred %s",s:i,m:i,mm:i,h:i,hh:i,d:i,dd:i,M:i,MM:i,y:i,yy:i}};e.default.locale(r,null,!0)}());var _o;_o||(_o=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(Ra()),t={words:{m:["jedan minut","jednog minuta"],mm:["%d minut","%d minuta","%d minuta"],h:["jedan sat","jednog sata"],hh:["%d sat","%d sata","%d sati"],d:["jedan dan","jednog dana"],dd:["%d dan","%d dana","%d dana"],M:["jedan mesec","jednog meseca"],MM:["%d mesec","%d meseca","%d meseci"],y:["jednu godinu","jedne godine"],yy:["%d godinu","%d godine","%d godina"]},correctGrammarCase:function(e,t){return e%10>=1&&e%10<=4&&(e%100<10||e%100>=20)?e%10==1?t[0]:t[1]:t[2]},relativeTimeFormatter:function(e,n,i,r){var a=t.words[i];if(1===i.length)return"y"===i&&n?"jedna godina":r||n?a[0]:a[1];var o=t.correctGrammarCase(e,a);return"yy"===i&&n&&"%d godinu"===o?e+" godina":o.replace("%d",e)}},n={name:"sr",relativeTime:{future:"za %s",past:"pre %s",s:"nekoliko sekundi",m:t.relativeTimeFormatter,mm:t.relativeTimeFormatter,h:t.relativeTimeFormatter,hh:t.relativeTimeFormatter,d:t.relativeTimeFormatter,dd:t.relativeTimeFormatter,M:t.relativeTimeFormatter,MM:t.relativeTimeFormatter,y:t.relativeTimeFormatter,yy:t.relativeTimeFormatter}};e.default.locale(n,null,!0)}());var yo;yo||(yo=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(Ra()),t={words:{m:["један минут","једног минута"],mm:["%d минут","%d минута","%d минута"],h:["један сат","једног сата"],hh:["%d сат","%d сата","%d сати"],d:["један дан","једног дана"],dd:["%d дан","%d дана","%d дана"],M:["један месец","једног месеца"],MM:["%d месец","%d месеца","%d месеци"],y:["једну годину","једне године"],yy:["%d годину","%d године","%d година"]},correctGrammarCase:function(e,t){return e%10>=1&&e%10<=4&&(e%100<10||e%100>=20)?e%10==1?t[0]:t[1]:t[2]},relativeTimeFormatter:function(e,n,i,r){var a=t.words[i];if(1===i.length)return"y"===i&&n?"једна година":r||n?a[0]:a[1];var o=t.correctGrammarCase(e,a);return"yy"===i&&n&&"%d годину"===o?e+" година":o.replace("%d",e)}},n={name:"sr-cyrl",relativeTime:{future:"за %s",past:"пре %s",s:"неколико секунди",m:t.relativeTimeFormatter,mm:t.relativeTimeFormatter,h:t.relativeTimeFormatter,hh:t.relativeTimeFormatter,d:t.relativeTimeFormatter,dd:t.relativeTimeFormatter,M:t.relativeTimeFormatter,MM:t.relativeTimeFormatter,y:t.relativeTimeFormatter,yy:t.relativeTimeFormatter}};e.default.locale(n,null,!0)}());var wo;wo||(wo=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(Ra()),t={name:"sv",relativeTime:{future:"om %s",past:"för %s sedan",s:"några sekunder",m:"en minut",mm:"%d minuter",h:"en timme",hh:"%d timmar",d:"en dag",dd:"%d dagar",M:"en månad",MM:"%d månader",y:"ett år",yy:"%d år"}};e.default.locale(t,null,!0)}());var bo;bo||(bo=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(Ra()),t={name:"th",relativeTime:{future:"อีก %s",past:"%sที่แล้ว",s:"ไม่กี่วินาที",m:"1 นาที",mm:"%d นาที",h:"1 ชั่วโมง",hh:"%d ชั่วโมง",d:"1 วัน",dd:"%d วัน",M:"1 เดือน",MM:"%d เดือน",y:"1 ปี",yy:"%d ปี"}};e.default.locale(t,null,!0)}());var xo;xo||(xo=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(Ra()),t={name:"tr",relativeTime:{future:"%s sonra",past:"%s önce",s:"birkaç saniye",m:"bir dakika",mm:"%d dakika",h:"bir saat",hh:"%d saat",d:"bir gün",dd:"%d gün",M:"bir ay",MM:"%d ay",y:"bir yıl",yy:"%d yıl"}};e.default.locale(t,null,!0)}());var ko;ko||(ko=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(Ra());function t(e,t,n){var i,r;return"m"===n?t?"хвилина":"хвилину":"h"===n?t?"година":"годину":e+" "+(i=+e,r={ss:t?"секунда_секунди_секунд":"секунду_секунди_секунд",mm:t?"хвилина_хвилини_хвилин":"хвилину_хвилини_хвилин",hh:t?"година_години_годин":"годину_години_годин",dd:"день_дні_днів",MM:"місяць_місяці_місяців",yy:"рік_роки_років"}[n].split("_"),i%10==1&&i%100!=11?r[0]:i%10>=2&&i%10<=4&&(i%100<10||i%100>=20)?r[1]:r[2])}var n={name:"uk",relativeTime:{future:"за %s",past:"%s тому",s:"декілька секунд",m:t,mm:t,h:t,hh:t,d:"день",dd:t,M:"місяць",MM:t,y:"рік",yy:t}};e.default.locale(n,null,!0)}());var $o;$o||($o=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(Ra()),t={name:"vi",relativeTime:{future:"%s tới",past:"%s trước",s:"vài giây",m:"một phút",mm:"%d phút",h:"một giờ",hh:"%d giờ",d:"một ngày",dd:"%d ngày",M:"một tháng",MM:"%d tháng",y:"một năm",yy:"%d năm"}};e.default.locale(t,null,!0)}());var To;To||(To=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(Ra()),t={name:"zh-cn",relativeTime:{future:"%s内",past:"%s前",s:"几秒",m:"1 分钟",mm:"%d 分钟",h:"1 小时",hh:"%d 小时",d:"1 天",dd:"%d 天",M:"1 个月",MM:"%d 个月",y:"1 年",yy:"%d 年"}};e.default.locale(t,null,!0)}());var So;So||(So=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(Ra()),t={name:"zh-tw",relativeTime:{future:"%s內",past:"%s前",s:"幾秒",m:"1 分鐘",mm:"%d 分鐘",h:"1 小時",hh:"%d 小時",d:"1 天",dd:"%d 天",M:"1 個月",MM:"%d 個月",y:"1 年",yy:"%d 年"}};e.default.locale(t,null,!0)}()),ja.extend(Ba);const Mo=Qe();function Do(e,t,n,i=("day"===t&&1===e?"auto":"always")){const r=Po(n),a=`${r}:${i}`;let o=Mo.get(a);return o||(o=new Intl.RelativeTimeFormat(Je(r),{numeric:i}),Mo.set(a,o)),o.format(e,t)}const Co=Qe();function Ao(e){const t=Po(e);let n=Co.get(t);if(void 0===n){const e=new Intl.RelativeTimeFormat(Je(t),{numeric:"auto"}),i=e.format(0,"second");n=i.charAt(0).toLocaleUpperCase(e.resolvedOptions().locale)+i.slice(1),Co.set(t,n)}return n}function Eo(e,t,n){const i=Po(t),r=Lo[i]??i,a=ja(e).locale(r);return n?a.from(ja(n)):a.fromNow()}const Lo={sr:"sr-cyrl","sr-latn":"sr"};function Po(e){const t=e.toLowerCase();if("zh-cn"===t||"zh-tw"===t||"sr-latn"===t)return t;const n=t.split("-")[0];return["bg","ca","cs","da","de","el","en","es","et","fi","fr","he","hr","hu","is","it","ko","lt","lv","nb","nl","nn","pl","pt","ro","ru","sk","sl","sr","sr-latn","sv","th","tr","uk","vi","zh-cn","zh-tw"].includes(n)?n:Be}const No={bg:{daysOfWeek:["нед.","пон.","вт.","ср.","четв.","пет.","съб."],fullDaysOfWeek:["неделя","понеделник","вторник","сряда","четвъртък","петък","събота"],months:["ян.","фев.","мар","апр.","май","юни","юли","авг.","септ.","окт.","ноем.","дек."],allDay:"цял ден",multiDay:"до",at:"в",separator:", ",viewList:"Списък",viewColumns:"Колони",viewGrid:"Решетка",endsToday:"приключва днес",endsTomorrow:"приключва утре",dayOfEvent:"Ден {day} от {days}",durationTotal:"общо {duration}",noEvents:"Няма събития",loading:"Зареждане на календара със събития...",error:"Грешка: календарът не е намерен или не е конфигуриран правилно",loadFailed:"Неуспешно зареждане:",newEvent:"Ново събитие",showAll:"Показване на всички",hideAll:"Скриване на всички"},cs:{daysOfWeek:["Ne","Po","Út","St","Čt","Pá","So"],fullDaysOfWeek:["neděle","pondělí","úterý","středy","čtvrtka","pátku","soboty"],months:["Led","Úno","Bře","Dub","Kvě","Čvn","Čvc","Srp","Zář","Říj","Lis","Pro"],allDay:"celý den",multiDay:"do",at:"v",separator:", ",viewList:"Seznam",viewColumns:"Sloupce",viewGrid:"Mřížka",endsToday:"končí dnes",endsTomorrow:"končí zítra",dayOfEvent:"Den {day} z {days}",durationTotal:"celkem {duration}",noEvents:"Žádné události",loading:"Načítání událostí z kalendáře...",error:"Chyba: Entita kalendáře nebyla nalezena nebo je nesprávně nakonfigurována",loadFailed:"Nepodařilo se načíst:",newEvent:"Nová událost",showAll:"Zobrazit všechny",hideAll:"Skrýt všechny"},ca:{daysOfWeek:["Dg","Dl","Dm","Dc","Dj","Dv","Ds"],fullDaysOfWeek:["diumenge","dilluns","dimarts","dimecres","dijous","divendres","dissabte"],months:["Gen","Febr","Març","Abr","Maig","Juny","Jul","Ag","Set","Oct","Nov","Des"],allDay:"tot el dia",multiDay:"fins",at:"a les",separator:", ",viewList:"Llista",viewColumns:"Columnes",viewGrid:"Quadrícula",endsToday:"acaba avui",endsTomorrow:"acaba demà",dayOfEvent:"Dia {day} de {days}",durationTotal:"{duration} en total",noEvents:"Cap esdeveniment",loading:"Carregant esdeveniments...",error:"Error: No s'ha trobat l'entitat del calendari o aquesta està mal configurada",loadFailed:"No s'ha pogut carregar:",newEvent:"Esdeveniment nou",showAll:"Mostra-ho tot",hideAll:"Amaga-ho tot"},da:{daysOfWeek:["Søn","Man","Tir","Ons","Tor","Fre","Lør"],fullDaysOfWeek:["søndag","mandag","tirsdag","onsdag","torsdag","fredag","lørdag"],months:["Jan","Feb","Mar","Apr","Maj","Jun","Jul","Aug","Sep","Okt","Nov","Dec"],allDay:"hele dagen",multiDay:"indtil",at:"kl.",separator:", ",viewList:"Liste",viewColumns:"Kolonner",viewGrid:"Gitter",endsToday:"slutter i dag",endsTomorrow:"slutter i morgen",dayOfEvent:"Dag {day} af {days}",durationTotal:"{duration} i alt",noEvents:"Ingen begivenheder",loading:"Indlæser kalenderbegivenheder...",error:"Fejl: Kalenderenheden blev ikke fundet eller er ikke konfigureret korrekt",loadFailed:"Kunne ikke indlæses:",newEvent:"Ny begivenhed",showAll:"Vis alle",hideAll:"Skjul alle"},de:{daysOfWeek:["So","Mo","Di","Mi","Do","Fr","Sa"],fullDaysOfWeek:["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"],months:["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"],allDay:"ganztägig",multiDay:"bis",at:"um",separator:", ",viewList:"Liste",viewColumns:"Spalten",viewGrid:"Zeitraster",endsToday:"endet heute",endsTomorrow:"endet morgen",dayOfEvent:"Tag {day} von {days}",durationTotal:"{duration} insgesamt",noEvents:"Keine Termine",loading:"Kalendereinträge werden geladen...",error:"Fehler: Kalender-Entität nicht gefunden oder falsch konfiguriert",loadFailed:"Laden fehlgeschlagen:",newEvent:"Neuer Termin",showAll:"Alle anzeigen",hideAll:"Alle ausblenden"},el:{daysOfWeek:["Κυρ","Δευ","Τρι","Τετ","Πεμ","Παρ","Σαβ"],fullDaysOfWeek:["την Κυριακή","τη Δευτέρα","την Τρίτη","την Τετάρτη","την Πέμπτη","την Παρασκευή","το Σάββατο"],months:["Ιαν","Φεβ","Μαρ","Απρ","Μαϊ","Ιουν","Ιουλ","Αυγ","Σεπ","Οκτ","Νοε","Δεκ"],allDay:"Ολοήμερο",multiDay:"έως",at:"στις",separator:", ",viewList:"Λίστα",viewColumns:"Στήλες",viewGrid:"Πλέγμα",endsToday:"λήγει σήμερα",endsTomorrow:"λήγει αύριο",dayOfEvent:"Ημέρα {day} από {days}",durationTotal:"{duration} συνολικά",noEvents:"Δεν υπάρχουν γεγονότα",loading:"Φόρτωση ημερολογίου...",error:"Σφάλμα: Η οντότητα ημερολογίου δεν βρέθηκε ή δεν έχει ρυθμιστεί σωστά",loadFailed:"Αποτυχία φόρτωσης:",newEvent:"Νέο γεγονός",showAll:"Εμφάνιση όλων",hideAll:"Απόκρυψη όλων"},en:{daysOfWeek:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],fullDaysOfWeek:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],months:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],allDay:"all day",multiDay:"until",at:"at",separator:", ",viewList:"List",viewColumns:"Columns",viewGrid:"Grid",endsToday:"ends today",endsTomorrow:"ends tomorrow",dayOfEvent:"Day {day} of {days}",durationTotal:"{duration} total",noEvents:"No events",loading:"Loading calendar events...",error:"Error: Calendar entity not found or improperly configured",loadFailed:"Couldn't load:",newEvent:"New event",showAll:"Show all",hideAll:"Hide all"},"en-gb":{daysOfWeek:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],fullDaysOfWeek:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],months:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],allDay:"all day",multiDay:"until",at:"at",separator:", ",viewList:"List",viewColumns:"Columns",viewGrid:"Grid",endsToday:"ends today",endsTomorrow:"ends tomorrow",dayOfEvent:"Day {day} of {days}",durationTotal:"{duration} total",noEvents:"No events",loading:"Loading calendar events...",error:"Error: Calendar entity not found or improperly configured",loadFailed:"Couldn't load:",newEvent:"New event",showAll:"Show all",hideAll:"Hide all"},es:{daysOfWeek:["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"],fullDaysOfWeek:["domingo","lunes","martes","miércoles","jueves","viernes","sábado"],months:["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"],allDay:"todo el día",multiDay:"hasta el",at:"a las",separator:", ",viewList:"Lista",viewColumns:"Columnas",viewGrid:"Rejilla",endsToday:"termina hoy",endsTomorrow:"termina mañana",dayOfEvent:"Día {day} de {days}",durationTotal:"{duration} en total",noEvents:"No hay eventos",loading:"Cargando eventos del calendario...",error:"Error: La entidad del calendario no se encontró o está mal configurada",loadFailed:"No se pudo cargar:",newEvent:"Nuevo evento",showAll:"Mostrar todos",hideAll:"Ocultar todos"},et:{daysOfWeek:["P","E","T","K","N","R","L"],fullDaysOfWeek:["pühapäevani","esmaspäevani","teisipäevani","kolmapäevani","neljapäevani","reedeni","laupäevani"],months:["Jaan","Veebr","Märts","Apr","Mai","Juuni","Juuli","Aug","Sept","Okt","Nov","Dets"],allDay:"kogu päev",multiDay:"kuni",at:"kell",separator:", ",viewList:"Loetelu",viewColumns:"Veerud",viewGrid:"Ajaraster",endsToday:"lõpeb täna",endsTomorrow:"lõpeb homme",dayOfEvent:"Päev {day}/{days}",durationTotal:"kokku {duration}",noEvents:"Sündmusi pole",loading:"Kalendrisündmuste laadimine...",error:"Viga: kalendri entiteeti ei leitud või see on valesti seadistatud",loadFailed:"Laadimine ebaõnnestus:",newEvent:"Uus sündmus",showAll:"Näita kõiki",hideAll:"Peida kõik"},fi:{daysOfWeek:["Su","Ma","Ti","Ke","To","Pe","La"],fullDaysOfWeek:["sunnuntaina","maanantaina","tiistaina","keskiviikkona","torstaina","perjantaina","lauantaina"],months:["Tammi","Helmi","Maalis","Huhti","Touko","Kesä","Heinä","Elo","Syys","Loka","Marras","Joulu"],allDay:"koko päivä",multiDay:"päättyy",at:"klo",separator:", ",viewList:"Lista",viewColumns:"Sarakkeet",viewGrid:"Ruudukko",endsToday:"päättyy tänään",endsTomorrow:"päättyy huomenna",dayOfEvent:"Päivä {day}/{days}",durationTotal:"yhteensä {duration}",noEvents:"Ei tapahtumia",loading:"Ladataan kalenteritapahtumia...",error:"Virhe: Kalenteriyksikköä ei löydy tai se on väärin määritetty",loadFailed:"Lataus epäonnistui:",newEvent:"Uusi tapahtuma",showAll:"Näytä kaikki",hideAll:"Piilota kaikki"},fr:{daysOfWeek:["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"],fullDaysOfWeek:["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"],months:["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"],allDay:"toute la journée",multiDay:"jusqu'au",at:"à",separator:", ",viewList:"Liste",viewColumns:"Colonnes",viewGrid:"Grille",endsToday:"finit aujourd'hui",endsTomorrow:"finit demain",dayOfEvent:"Jour {day} sur {days}",durationTotal:"{duration} au total",noEvents:"Aucun événement",loading:"Chargement des événements...",error:"Erreur: Entité de calendrier introuvable ou mal configurée",loadFailed:"Échec du chargement:",newEvent:"Nouvel événement",showAll:"Tout afficher",hideAll:"Tout masquer"},he:{daysOfWeek:["א'","ב'","ג'","ד'","ה'","ו'","ש'"],fullDaysOfWeek:["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"],months:["ינו","פבר","מרץ","אפר","מאי","יונ","יול","אוג","ספט","אוק","נוב","דצמ"],allDay:"כל-היום",multiDay:"עד",endsToday:"מסתיים היום",endsTomorrow:"מסתיים מחר",dayOfEvent:"יום {day} מתוך {days}",durationTotal:"{duration} בסך הכול",at:"בשעה",separator:", ",viewList:"רשימה",viewColumns:"עמודות",viewGrid:"רשת",noEvents:"אין אירועים",loading:"טוען אירועי לוח שנה...",error:"שגיאה: ישות לוח השנה לא נמצאה או לא מוגדרת כראוי",loadFailed:"הטעינה נכשלה:",newEvent:"אירוע חדש",showAll:"הצגת הכל",hideAll:"הסתרת הכל"},hr:{daysOfWeek:["Ned","Pon","Uto","Sri","Čet","Pet","Sub"],fullDaysOfWeek:["nedjelje","ponedjeljka","utorka","srijede","četvrtka","petka","subote"],months:["Sij","Velj","Ožu","Tra","Svi","Lip","Srp","Kol","Ruj","Lis","Stu","Pro"],allDay:"cijeli dan",multiDay:"do",at:"u",separator:", ",viewList:"Popis",viewColumns:"Stupci",viewGrid:"Mreža",endsToday:"završava danas",endsTomorrow:"završava sutra",dayOfEvent:"Dan {day} od {days}",durationTotal:"ukupno {duration}",noEvents:"Nema događaja",loading:"Učitavanje događaja...",error:"Greška: Kalendar entitet nije pronađen ili je neispravno postavljen",loadFailed:"Učitavanje nije uspjelo:",newEvent:"Novi događaj",showAll:"Pokaži sve",hideAll:"Sakrij sve"},hu:{daysOfWeek:["Vas","Hét","Kedd","Sze","Csüt","Pén","Szo"],fullDaysOfWeek:["vasárnap","hétfő","kedd","szerda","csütörtök","péntek","szombat"],months:["Jan","Feb","Már","Ápr","Máj","Jún","Júl","Aug","Szep","Okt","Nov","Dec"],allDay:"egész napos",multiDay:"eddig:",endsToday:"ma {at} ér véget",endsTomorrow:"holnap {at} ér véget",dayOfEvent:"{day}/{days}. nap",durationTotal:"összesen {duration}",at:"{time}-kor",separator:", ",viewList:"Lista",viewColumns:"Oszlopok",viewGrid:"Rács",noEvents:"Nincs esemény",loading:"Naptárbejegyzések betöltése...",error:"Hiba: Naptár entitás nem található vagy nem megfelelően konfigutált",loadFailed:"Nem sikerült betölteni:",newEvent:"Új esemény",showAll:"Összes megjelenítése",hideAll:"Összes elrejtése"},is:{daysOfWeek:["Sun","Mán","Þri","Mið","Fim","Fös","Lau"],fullDaysOfWeek:["sunnudagur","mánudagur","þriðjudagur","miðvikudagur","fimmtudagur","föstudagur","laugardagur"],months:["Jan","Feb","Mar","Apr","Maí","Jún","Júl","Ágú","Sep","Okt","Nóv","Des"],allDay:"Allur dagurinn",multiDay:"þar til",at:"kl",separator:", ",viewList:"Listi",viewColumns:"Dálkar",viewGrid:"Tímatafla",endsToday:"lýkur í dag",endsTomorrow:"lýkur á morgun",dayOfEvent:"Dagur {day} af {days}",durationTotal:"{duration} alls",noEvents:"Engir viðburðir",loading:"Hleður inn dagatal...",error:"Villa: Dagatalseining finnst ekki eða er vanstillt",loadFailed:"Tókst ekki að hlaða inn:",newEvent:"Nýr viðburður",showAll:"Sýna öll",hideAll:"Fela öll"},it:{daysOfWeek:["Dom","Lun","Mar","Mer","Gio","Ven","Sab"],fullDaysOfWeek:["domenica","lunedì","martedì","mercoledì","giovedì","venerdì","sabato"],months:["Gen","Feb","Mar","Apr","Mag","Giu","Lug","Ago","Set","Ott","Nov","Dic"],allDay:"tutto il giorno",multiDay:"fino a",at:"alle",separator:", ",viewList:"Lista",viewColumns:"Colonne",viewGrid:"Griglia oraria",endsToday:"termina oggi",endsTomorrow:"termina domani",dayOfEvent:"Giorno {day} di {days}",durationTotal:"{duration} in totale",noEvents:"Nessun evento",loading:"Caricamento eventi del calendario...",error:"Errore: entità calendario non trovata o configurata in modo errato",loadFailed:"Impossibile caricare:",newEvent:"Nuovo evento",showAll:"Mostra tutti",hideAll:"Nascondi tutti"},ko:{daysOfWeek:["일","월","화","수","목","금","토"],fullDaysOfWeek:["일요일","월요일","화요일","수요일","목요일","금요일","토요일"],months:["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"],allDay:"종일",multiDay:"~",at:"{time}",separator:", ",viewList:"목록",viewColumns:"열",viewGrid:"그리드",endsToday:"오늘 {at}에 종료",endsTomorrow:"내일 {at}에 종료",dayOfEvent:"{days}일 중 {day}일째",durationTotal:"총 {duration}",noEvents:"일정 없음",loading:"캘린더 일정을 불러오는 중...",error:"오류: 캘린더 엔티티를 찾을 수 없거나 잘못 설정되었습니다",loadFailed:"불러오지 못함:",newEvent:"새 일정",showAll:"모두 표시",hideAll:"모두 숨기기"},lt:{daysOfWeek:["Sek","Pir","Ant","Tre","Ket","Pen","Šeš"],fullDaysOfWeek:["sekmadienio","pirmadienio","antradienio","trečiadienio","ketvirtadienio","penktadienio","šeštadienio"],months:["Sau","Vas","Kov","Bal","Geg","Bir","Lie","Rgp","Rgs","Spa","Lap","Grd"],allDay:"visą dieną",multiDay:"iki",at:"{time}",separator:", ",viewList:"Sąrašas",viewColumns:"Stulpeliai",viewGrid:"Laiko tinklelis",endsToday:"baigiasi šiandien",endsTomorrow:"baigiasi rytoj",dayOfEvent:"Diena {day} iš {days}",durationTotal:"iš viso {duration}",noEvents:"Nėra įvykių",loading:"Įkeliami kalendoriaus įvykiai...",error:"Klaida: Kalendoriaus objektas nerastas arba neteisingai sukonfigūruotas",loadFailed:"Nepavyko įkelti:",newEvent:"Naujas įvykis",showAll:"Rodyti visus",hideAll:"Slėpti visus"},lv:{daysOfWeek:["Sv","Pr","Ot","Tr","Ce","Pk","Se"],fullDaysOfWeek:["svētdienai","pirmdienai","otrdienai","trešdienai","ceturtdienai","piektdienai","sestdienai"],months:["Jan","Feb","Mar","Apr","Mai","Jūn","Jūl","Aug","Sep","Okt","Nov","Dec"],allDay:"visu dienu",multiDay:"līdz",at:"plkst.",separator:", ",viewList:"Saraksts",viewColumns:"Kolonnas",viewGrid:"Laika režģis",endsToday:"beidzas šodien",endsTomorrow:"beidzas rīt",dayOfEvent:"Diena {day} no {days}",durationTotal:"kopā {duration}",noEvents:"Nav notikumu",loading:"Ielādē kalendāra notikumus...",error:"Kļūda: Kalendāra entitīja nav atrasta vai nav pareizi konfigurēta",loadFailed:"Neizdevās ielādēt:",newEvent:"Jauns notikums",showAll:"Rādīt visus",hideAll:"Paslēpt visus"},nb:{daysOfWeek:["Søn","Man","Tir","Ons","Tor","Fre","Lør"],fullDaysOfWeek:["søndag","mandag","tirsdag","onsdag","torsdag","fredag","lørdag"],months:["jan","feb","mar","apr","mai","jun","jul","aug","sep","okt","nov","des"],allDay:"hele dagen",multiDay:"til",at:"kl.",separator:", ",viewList:"Liste",viewColumns:"Kolonner",viewGrid:"Tidsrutenett",endsToday:"slutter i dag",endsTomorrow:"slutter i morgen",dayOfEvent:"Dag {day} av {days}",durationTotal:"{duration} totalt",noEvents:"Ingen hendelser",loading:"Laster kalenderhendelser...",error:"Feil: Kalenderenheten ble ikke funnet eller er ikke konfigurert riktig",loadFailed:"Kunne ikke lastes:",newEvent:"Ny hendelse",showAll:"Vis alle",hideAll:"Skjul alle"},nl:{daysOfWeek:["Zo","Ma","Di","Wo","Do","Vr","Za"],fullDaysOfWeek:["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"],months:["Jan","Feb","Mrt","Apr","Mei","Jun","Jul","Aug","Sep","Okt","Nov","Dec"],allDay:"hele dag",multiDay:"tot",at:"om",separator:", ",viewList:"Lijst",viewColumns:"Kolommen",viewGrid:"Rooster",endsToday:"eindigt vandaag",endsTomorrow:"eindigt morgen",dayOfEvent:"Dag {day} van {days}",durationTotal:"{duration} in totaal",noEvents:"Geen afspraken",loading:"Kalender afspraken laden...",error:"Fout: Kalender niet gevonden of verkeerd geconfigureerd",loadFailed:"Laden mislukt:",newEvent:"Nieuwe afspraak",showAll:"Alles weergeven",hideAll:"Alles verbergen"},nn:{daysOfWeek:["Søn","Mån","Tys","Ons","Tor","Fre","Lau"],fullDaysOfWeek:["søndag","måndag","tysdag","onsdag","torsdag","fredag","laurdag"],months:["jan","feb","mar","apr","mai","jun","jul","aug","sep","okt","nov","des"],allDay:"heile dagen",multiDay:"til",at:"kl.",separator:", ",viewList:"Liste",viewColumns:"Kolonnar",viewGrid:"Rutenett",endsToday:"sluttar i dag",endsTomorrow:"sluttar i morgon",dayOfEvent:"Dag {day} av {days}",durationTotal:"{duration} totalt",noEvents:"Ingen hendingar",loading:"Lastar kalenderhendingar...",error:"Feil: Kalendereininga vart ikkje funnen eller er ikkje konfigurert riktig",loadFailed:"Kunne ikkje lastast:",newEvent:"Ny hending",showAll:"Vis alle",hideAll:"Skjul alle"},pl:{daysOfWeek:["Nd","Pn","Wt","Śr","Cz","Pt","Sb"],fullDaysOfWeek:["niedzieli","poniedziałku","wtorku","środy","czwartku","piątku","soboty"],months:["sty","lut","mar","kwi","maj","cze","lip","sie","wrz","paź","lis","gru"],allDay:"cały dzień",multiDay:"do",at:"o",separator:", ",viewList:"Lista",viewColumns:"Kolumny",viewGrid:"Siatka czasu",endsToday:"kończy się dziś",endsTomorrow:"kończy się jutro",dayOfEvent:"Dzień {day} z {days}",durationTotal:"łącznie {duration}",noEvents:"Brak wydarzeń",loading:"Ładowanie wydarzeń z kalendarza...",error:"Błąd: encja kalendarza nie została znaleziona lub jest niepoprawnie skonfigurowana",loadFailed:"Nie udało się wczytać:",newEvent:"Nowe wydarzenie",showAll:"Pokaż wszystkie",hideAll:"Ukryj wszystkie"},pt:{daysOfWeek:["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"],fullDaysOfWeek:["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"],months:["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"],allDay:"o dia todo",multiDay:"até",at:"às",separator:", ",viewList:"Lista",viewColumns:"Colunas",viewGrid:"Grade",endsToday:"termina hoje",endsTomorrow:"termina amanhã",dayOfEvent:"Dia {day} de {days}",durationTotal:"{duration} no total",noEvents:"Nenhum evento",loading:"Carregando eventos do calendário...",error:"Erro: A entidade do calendário não foi encontrada ou está configurada incorretamente",loadFailed:"Não foi possível carregar:",newEvent:"Novo evento",showAll:"Mostrar todos",hideAll:"Ocultar todos"},ro:{daysOfWeek:["Du","Lu","Ma","Mi","Jo","Vi","Sâ"],fullDaysOfWeek:["duminică","luni","marți","miercuri","joi","vineri","sâmbătă"],months:["Ian","Feb","Mart","Apr","Mai","Iun","Iul","Aug","Sept","Oct","Nov","Dec"],allDay:"toată ziua",multiDay:"până",at:"la",separator:", ",viewList:"Listă",viewColumns:"Coloane",viewGrid:"Grilă",endsToday:"se încheie astăzi",endsTomorrow:"se încheie mâine",dayOfEvent:"Ziua {day} din {days}",durationTotal:"{duration} în total",noEvents:"Nu sunt evenimente",loading:"Încărcare evenimente de calendar...",error:"Eroare: Entitatea de calendar nu a fost găsită sau este configurată incorect",loadFailed:"Nu s-a putut încărca:",newEvent:"Eveniment nou",showAll:"Arată toate",hideAll:"Ascunde toate"},ru:{daysOfWeek:["Вс","Пн","Вт","Ср","Чт","Пт","Сб"],fullDaysOfWeek:["воскресенья","понедельника","вторника","среды","четверга","пятницы","субботы"],months:["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"],allDay:"весь день",multiDay:"до",at:"в",separator:", ",viewList:"Список",viewColumns:"Столбцы",viewGrid:"Сетка",endsToday:"заканчивается сегодня",endsTomorrow:"заканчивается завтра",dayOfEvent:"День {day} из {days}",durationTotal:"всего {duration}",noEvents:"Нет событий",loading:"Загрузка событий календаря...",error:"Ошибка: Объект календарь, не найден или неправильно настроен",loadFailed:"Не удалось загрузить:",newEvent:"Новое событие",showAll:"Показать все",hideAll:"Скрыть все"},sl:{daysOfWeek:["ned","pon","tor","sre","čet","pet","sob"],fullDaysOfWeek:["nedelje","ponedeljka","torka","srede","četrtka","petka","sobote"],months:["jan","feb","mar","apr","maj","jun","jul","avg","sep","okt","nov","dec"],allDay:"cel dan",multiDay:"do",at:"ob",separator:", ",viewList:"Seznam",viewColumns:"Stolpci",viewGrid:"Mreža",endsToday:"konča se danes",endsTomorrow:"konča se jutri",dayOfEvent:"Dan {day} od {days}",durationTotal:"skupaj {duration}",noEvents:"Ni dogodkov",loading:"Nalagam dogodke...",error:"Napaka: Entiteta ni bila najdena ali pa je nepravilno konfigurirana.",loadFailed:"Nalaganje ni uspelo:",newEvent:"Nov dogodek",showAll:"Prikaži vse",hideAll:"Skrij vse"},sk:{daysOfWeek:["Ne","Po","Ut","St","Št","Pi","So"],fullDaysOfWeek:["nedele","pondelka","utorka","stredy","štvrtka","piatku","soboty"],months:["Jan","Feb","Mar","Apr","Máj","Jún","Júl","Aug","Sep","Okt","Nov","Dec"],allDay:"celý deň",multiDay:"do",at:"o",separator:", ",viewList:"Zoznam",viewColumns:"Stĺpce",viewGrid:"Časová mriežka",endsToday:"končí dnes",endsTomorrow:"končí zajtra",dayOfEvent:"Deň {day} z {days}",durationTotal:"spolu {duration}",noEvents:"Žiadne udalosti",loading:"Načítavam udalosti z kalendára...",error:"Chyba: Entita kalendára nebola nájdená alebo je nesprávne nakonfigurovaná",loadFailed:"Nepodarilo sa načítať:",newEvent:"Nová udalosť",showAll:"Zobraziť všetky",hideAll:"Skryť všetky"},sr:{daysOfWeek:["Нед","Пон","Уто","Сре","Чет","Пет","Суб"],fullDaysOfWeek:["недеље","понедељка","уторка","среде","четвртка","петка","суботе"],months:["јан","феб","мар","апр","мај","јун","јул","авг","сеп","окт","нов","дец"],allDay:"цео дан",multiDay:"до",at:"у",separator:", ",viewList:"Листа",viewColumns:"Колоне",viewGrid:"Мрежа",endsToday:"завршава се данас",endsTomorrow:"завршава се сутра",dayOfEvent:"Дан {day} од {days}",durationTotal:"укупно {duration}",noEvents:"Нема догађаја",loading:"Учитавање догађаја из календара...",error:"Грешка: Ентитет календара није пронађен или је неисправно конфигурисан",loadFailed:"Неуспешно учитавање:",newEvent:"Нови догађај",showAll:"Прикажи све",hideAll:"Сакриј све"},"sr-latn":{daysOfWeek:["Ned","Pon","Uto","Sre","Čet","Pet","Sub"],fullDaysOfWeek:["nedelje","ponedeljka","utorka","srede","četvrtka","petka","subote"],months:["jan","feb","mar","apr","maj","jun","jul","avg","sep","okt","nov","dec"],allDay:"ceo dan",multiDay:"do",at:"u",separator:", ",viewList:"Lista",viewColumns:"Kolone",viewGrid:"Mreža",endsToday:"završava se danas",endsTomorrow:"završava se sutra",dayOfEvent:"Dan {day} od {days}",durationTotal:"ukupno {duration}",noEvents:"Nema događaja",loading:"Učitavanje događaja iz kalendara...",error:"Greška: Entitet kalendara nije pronađen ili je neispravno konfigurisan",loadFailed:"Neuspešno učitavanje:",newEvent:"Novi događaj",showAll:"Prikaži sve",hideAll:"Sakrij sve"},sv:{daysOfWeek:["Sön","Mån","Tis","Ons","Tors","Fre","Lör"],fullDaysOfWeek:["söndag","måndag","tisdag","onsdag","torsdag","fredag","lördag"],months:["Jan","Feb","Mar","Apr","Maj","Jun","Jul","Aug","Sep","Okt","Nov","Dec"],allDay:"heldag",multiDay:"till",at:"vid",separator:", ",viewList:"Lista",viewColumns:"Kolumner",viewGrid:"Tidsrutnät",endsToday:"slutar idag",endsTomorrow:"slutar imorgon",dayOfEvent:"Dag {day} av {days}",durationTotal:"{duration} totalt",noEvents:"Inga händelser",loading:"Laddar kalenderhändelser...",error:"Fel: Kalenderentiteten hittades inte eller är felaktigt konfigurerad.",loadFailed:"Kunde inte läsas in:",newEvent:"Ny händelse",showAll:"Visa alla",hideAll:"Göm alla"},uk:{daysOfWeek:["Нд","Пн","Вт","Ср","Чт","Пт","Сб"],fullDaysOfWeek:["неділі","понеділка","вівторка","середи","четверга","п'ятниці","суботи"],months:["січ","лют","бер","кві","тра","чер","лип","сер","вер","жов","лис","гру"],allDay:"весь день",multiDay:"до",at:"о",separator:", ",viewList:"Список",viewColumns:"Стовпці",viewGrid:"Сітка",endsToday:"закінчується сьогодні",endsTomorrow:"закінчується завтра",dayOfEvent:"День {day} з {days}",durationTotal:"загалом {duration}",noEvents:"Немає подій",loading:"Завантаження подій календаря...",error:"Помилка: Cутність календаря не знайдено або налаштовано неправильно",loadFailed:"Не вдалося завантажити:",newEvent:"Нова подія",showAll:"Показати всі",hideAll:"Сховати всі"},vi:{daysOfWeek:["CN","T.2","T.3","T.4","T.5","T.6","T.7"],fullDaysOfWeek:["chủ nhật","thứ hai","thứ ba","thứ tư","thứ năm","thứ sáu","thứ bảy"],months:["Th1","Th2","Th3","Th4","Th5","Th6","Th7","Th8","Th9","Th10","Th11","Th12"],allDay:"cả ngày",multiDay:"đến",at:"lúc",separator:", ",viewList:"Danh sách",viewColumns:"Cột",viewGrid:"Lưới",endsToday:"kết thúc hôm nay",endsTomorrow:"kết thúc ngày mai",dayOfEvent:"Ngày thứ {day}/{days}",durationTotal:"tổng cộng {duration}",noEvents:"Không có sự kiện",loading:"Đang tải sự kiện...",error:"Lỗi: Không tìm thấy lịch hoặc cấu hình không đúng",loadFailed:"Không tải được:",newEvent:"Sự kiện mới",showAll:"Hiện tất cả",hideAll:"Ẩn tất cả"},th:{daysOfWeek:["อา.","จ.","อ.","พ.","พฤ.","ศ.","ส."],fullDaysOfWeek:["วันอาทิตย์","วันจันทร์","วันอังคาร","วันพุธ","วันพฤหัสบดี","วันศุกร์","วันเสาร์"],months:["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."],allDay:"ตลอดวัน",multiDay:"ถึง",at:"เวลา",separator:" ",viewList:"รายการ",viewColumns:"คอลัมน์",viewGrid:"ตาราง",endsToday:"สิ้นสุดวันนี้",endsTomorrow:"สิ้นสุดพรุ่งนี้",dayOfEvent:"วันที่ {day} จาก {days}",durationTotal:"รวม {duration}",noEvents:"ไม่มีเหตุการณ์",loading:"กำลังโหลดเหตุการณ์ปฏิทิน...",error:"ข้อผิดพลาด: ไม่พบเอนทิตีปฏิทินหรือมีการตั้งค่าที่ไม่ถูกต้อง",loadFailed:"โหลดไม่สำเร็จ:",newEvent:"เหตุการณ์ใหม่",showAll:"แสดงทั้งหมด",hideAll:"ซ่อนทั้งหมด"},tr:{daysOfWeek:["Paz","Pzt","Sal","Çar","Per","Cum","Cmt"],fullDaysOfWeek:["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"],months:["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"],allDay:"tüm gün",multiDay:"bitiş:",at:"saat",separator:", ",viewList:"Liste",viewColumns:"Sütunlar",viewGrid:"Izgara",endsToday:"bitiş: bugün",endsTomorrow:"bitiş: yarın",dayOfEvent:"{days} günün {day}. günü",durationTotal:"toplam {duration}",noEvents:"Etkinlik yok",loading:"Takvim etkinlikleri yükleniyor...",error:"Hata: Takvim içeriği bulunamadı veya yanlış yapılandırılmış",loadFailed:"Yüklenemedi:",newEvent:"Yeni etkinlik",showAll:"Tümünü göster",hideAll:"Tümünü gizle"},"zh-cn":{daysOfWeek:["日","一","二","三","四","五","六"],fullDaysOfWeek:["星期日","星期一","星期二","星期三","星期四","星期五","星期六"],months:["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],allDay:"整天",multiDay:"直到",at:"{time}",separator:"，",viewList:"列表",viewColumns:"列",viewGrid:"网格",endsToday:"今天 {at} 结束",endsTomorrow:"明天 {at} 结束",dayOfEvent:"第{day}天，共{days}天",durationTotal:"共{duration}",noEvents:"没有活动",loading:"正在加载日历事件...",error:"错误：找不到日历实体或配置不正确",loadFailed:"无法加载：",newEvent:"新活动",showAll:"全部显示",hideAll:"全部隐藏"},"zh-tw":{daysOfWeek:["日","一","二","三","四","五","六"],fullDaysOfWeek:["星期日","星期一","星期二","星期三","星期四","星期五","星期六"],months:["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],allDay:"整天",multiDay:"直到",at:"{time}",separator:"，",viewList:"列表",viewColumns:"欄",viewGrid:"網格",endsToday:"今天 {at} 結束",endsTomorrow:"明天 {at} 結束",dayOfEvent:"第{day}天，共{days}天",durationTotal:"共{duration}",noEvents:"沒有活動",loading:"正在加載日曆事件...",error:"錯誤：找不到日曆實體或配置不正確",loadFailed:"無法載入：",newEvent:"新活動",showAll:"顯示全部",hideAll:"隱藏全部"}};function Io(e){const t=e?.toLowerCase()||Be;return No[t]||No[Be]}const Fo=" ";function Ro({end:e,duration:t,allDayLabel:n}){return t&&void 0===n?`${e??""}${Fo}${t}`:e}function Oo({duration:e,allDayLabel:t}){return e&&void 0===t?`${Fo}${e}`:void 0}function zo(e,t,n,i){return jo(Ho(e,t,n,i),n)}function jo({allDayLabel:e,text:t,duration:n},i){const r=n?`${Fo}${n}`:"";if(void 0===e)return Xo(`${t}${r}`);const{separator:a}=Io(i);return Xo(`${t?`${e}${a}${t}`:e}${r}`)}function Ho(e,t,n,i){const r=function(e,t,n,i){const r=!e.start.dateTime;let a,o;r?(a=Zo(e.start.date||""),o=Zo(e.end.date||"")):(a=new Date(e.start.dateTime||""),o=new Date(e.end.dateTime||""));const s=Io(n);if(r){const e=new Date(o);return e.setDate(e.getDate()-1),a.toDateString()!==e.toDateString()?{allDayLabel:s.allDay,text:Ts(e,n,s)}:{allDayLabel:s.allDay,text:""}}const l=hs(t,i);return a.toDateString()!==o.toDateString()?{text:$s(a,o,n,s,l,t.time_two_digit_hours)}:{...ws(a,o,t.show_end_time,l,t.time_two_digit_hours)}}(e,t,n,i),a=t.show_duration?Wo(e,n):null;return a?{...r,duration:a}:r}function Wo(e,t,n){const i=function(e){return e._gridSource?{...e._gridSource,part:!0===e._isMultiDaySegment&&!e._gridSegmentStartsEvent}:e._isMultiDaySegment&&e._sourceStart&&e._sourceEnd?{start:e._sourceStart,end:e._sourceEnd,part:!0}:{start:e.start,end:e.end,part:!1}}(e),r=function(e,t){if(e.date&&t.date){const n=as(Zo(e.date),Zo(t.date));return n>=1?{days:n,hours:0,minutes:0}:null}if(!e.dateTime||!t.dateTime)return null;const n=os(e,t),i=new Date(e.dateTime),r=new Date(t.dateTime);if(!(r.getTime()>i.getTime())||ys(i,r))return null;if(n){let e=as(i,r),t=ss(r)-ss(i);t<0&&(e-=1,t+=864e5);let n=Math.round(t/6e4);return n>=1440&&(e+=1,n-=1440),{days:e,hours:Math.floor(n/60),minutes:n%60}}const a=Math.max(1,Math.round((r.getTime()-i.getTime())/6e4));return{days:0,hours:Math.floor(a/60),minutes:a%60}}(i.start,i.end),a=r?function(e,t){let n=Bo.get(t);void 0===n&&(n=function(e){const t=Intl.ListFormat;try{const n=(t,n)=>new Intl.NumberFormat(Je(e),{style:"unit",unit:t,unitDisplay:n}),i={days:n("day","long"),hours:n("hour","short"),minutes:n("minute","short")},r=t?new t(Je(e),{type:"unit",style:"short"}):null;return e=>{const t=["days","hours","minutes"].filter(t=>e[t]>0).map(t=>i[t].format(e[t]));return r?r.format(t):t.join(", ")}}catch{return null}}(t),Bo.set(t,n));try{return n?n(e):null}catch{return null}}(r,t):null;return a?`⁨(${n??i.part?Io(t).durationTotal.replace("{duration}",()=>a):a})⁩`:null}const Bo=Qe();function qo(e,t){if(e.end?.dateTime){const n=new Date(e.end.dateTime),i=e.start?.dateTime?new Date(e.start.dateTime):n,r=n.getTime()>i.getTime()?new Date(n.getTime()-1):n;return t.getTime()>n.getTime()?{end:n,days:as(r,t)}:null}if(e.end?.date){const n=Zo(e.end.date);n.setDate(n.getDate()-1);const i=as(n,t);return i>=1?{end:Zo(e.end.date),days:i}:null}return null}function Uo(e,t=new Date){return!!e.start?.dateTime&&0===qo(e,t)?.days}const Vo=new Map;function Go(e,t=!0){if(!e)return"";if(!1===t)return e;const n=e.trim();if("string"==typeof t&&"true"!==t){const e=function(e){if(Vo.has(e))return Vo.get(e)??null;let t=null;try{t=new RegExp(`(${e})\\s*$`,"i")}catch{Tt(`Ignoring "remove_location_country": ${JSON.stringify(e)} is not a valid regular expression. Locations are shown unchanged.`)}return Vo.set(e,t),t}(t);return null===e?n:n.replace(e,"").replace(/,?\s*$/,"")}for(const e of Me)if(n.endsWith(e))return n.slice(0,n.length-e.length).replace(/,?\s*$/,"");return n}const Ko=/microsoft\s+teams|teams\.microsoft\.(?:com|us)|teams\.live\.com/i;const Yo=/^[a-zA-Z/!?]$/;function Jo(e){if(!e)return"";const t=document.createElement("textarea");return t.innerHTML=function(e){const t=e.lastIndexOf(">"),n=e.lastIndexOf("--\x3e"),i=(t,n,i)=>n<i?-1:e.indexOf(t,i),r=r=>{if(e.startsWith("\x3c!--",r)){if(">"===e.charAt(r+4))return r+5;if(e.startsWith("->",r+4))return r+6;const t=i("--\x3e",n,r+4);if(-1!==t)return t+3}if(Yo.test(e.charAt(r+1))){const e=i(">",t,r+2);if(-1!==e)return e+1}return-1};let a="",o=0;for(let t=e.indexOf("<");-1!==t;){const n=r(t);-1===n?t=e.indexOf("<",t+1):(a+=e.slice(o,t),o=n,t=e.indexOf("<",n))}return a+e.slice(o)}(e),t.value.trim()}function Xo(e){return e&&0!==e.length?e.charAt(0).toUpperCase()+e.slice(1):e}function Zo(e){const[t,n,i]=e.split("-").map(Number);return new Date(t,n-1,i)}function Qo(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}const es={AF:[4,5],BH:[5,6],DZ:[5,6],EG:[5,6],IL:[5,6],IN:[0],IQ:[5,6],IR:[5],JO:[5,6],KW:[5,6],LY:[5,6],OM:[5,6],QA:[5,6],SA:[5,6],SD:[5,6],SY:[5,6],UG:[0],YE:[5,6]},ts={ar:[5,6],fa:[5],he:[5,6],hi:[0],ml:[0],ta:[0],te:[0]},ns=[0,6];function is(e){const t=e?.config?.country;if(t)return es[t.toUpperCase()]??ns;const n=e?.locale?.language;if(!n)return ns;const i=n.toLowerCase();return ts[i]??ts[i.split("-")[0]]??ns}function rs(e,t){return is(t).includes(e.getDay())}function as(e,t){const n=Date.UTC(e.getFullYear(),e.getMonth(),e.getDate()),i=Date.UTC(t.getFullYear(),t.getMonth(),t.getDate());return Math.round((i-n)/864e5)}function os(e,t){let n,i;if(e?.date&&t?.date)n=Zo(e.date),i=Zo(t.date),i.setDate(i.getDate()-1);else{if(!e?.dateTime||!t?.dateTime)return null;{n=new Date(e.dateTime);const r=new Date(t.dateTime),a=as(n,r);if(!(a>=2||1===a&&ss(r)>=ss(n)))return null;i=new Date(r.getTime()-1)}}const r=as(n,i)+1;return r>=2?{first:n,days:r}:null}function ss(e){return 1e3*(60*(60*e.getHours()+e.getMinutes())+e.getSeconds())+e.getMilliseconds()}function ls(e,t=!0,n=!1){let i=e.getHours();const r=e.getMinutes();if(!t){const e=i>=12?"PM":"AM";return i=i%12||12,`${n?ms(i):i}:${ms(r)} ${e}`}return`${n?ms(i):i}:${ms(r)}`}const ds=/\d{1,2}(?::\d{2})? [AP]M/g,cs=/[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/u;function us(e,t=""){return e.replace(ds,(n,i)=>{const r=n.replace(" "," "),a=function(e){const t=[...e.replace(ds,"")];for(let e=t.length-1;e>=0;e--){if(cs.test(t[e]))return"rtl";if(/\p{L}/u.test(t[e]))return"ltr"}return null}(t+e.slice(0,i));return"ltr"===a?r:`⁨${r}⁩${"rtl"===a?"‏":""}`})}function hs(e,t){return!0===e.time_24h||!1!==e.time_24h&&function(e,t=!0){if(!e)return t;const n=()=>e.language?ut(e.language)??t:t;if("24"===e.time_format)return!0;if("12"===e.time_format)return!1;if("language"===e.time_format&&e.language)return n();if("system"===e.time_format){const e="undefined"==typeof navigator?void 0:navigator.language;return(e?ut(e):void 0)??n()}return t}(t?.locale,!1)}function ms(e){return e.toString().padStart(2,"0")}function ps(e){const t=new Date(Date.UTC(e.getFullYear(),e.getMonth(),e.getDate()));t.setUTCDate(t.getUTCDate()+4-(t.getUTCDay()||7));const n=Date.UTC(t.getUTCFullYear(),0,1);return Math.ceil(((t.getTime()-n)/864e5+1)/7)}const fs=["sunday","monday","tuesday","wednesday","thursday","friday","saturday"],gs={af:0,ar:6,bn:0,en:0,"en-gb":1,fa:6,he:0,hi:0,id:0,is:0,ja:0,ko:0,ml:0,pt:0,"pt-br":0,ta:0,te:0,th:0,ur:0,"zh-hans":1,"zh-hant":0};function vs(e,t){if("sunday"===e)return 0;if("monday"===e)return 1;const n=fs.indexOf(t?.first_weekday??"");return-1!==n?n:t?.language?function(e){const t=e.toLowerCase();return gs[t]??gs[t.split("-")[0]]??1}(t.language):1}function _s(e){return e||"iso"}function ys(e,t){return Math.floor(e.getTime()/6e4)===Math.floor(t.getTime()/6e4)}function ws(e,t,n,i=!0,r=!1){const a=ls(e,i,r);if(!n||ys(e,t))return{text:a};const o=` - ${ls(t,i,r)}`;return{text:`${a}${o}`,end:o}}function bs(e,t){return e.at.includes("{time}")?e.at.replace("{time}",()=>t):`${e.at} ${t}`}function xs(e,t,n){const i=bs(t,n);return e.includes("{at}")?e.replace("{at}",()=>i):`${e} ${i}`}function ks(e){const t=/\S*\{at\}\S*/.exec(e);if(!t)return e;const n=e.slice(0,t.index).trim(),i=e.slice(t.index+t[0].length).trim();return`${n}${/\p{Script=Han}$/u.test(n)&&/^\p{Script=Han}/u.test(i)?"":" "}${i}`.trim()}function $s(e,t,n,i,r=!0,a=!1){const o=new Date,s=new Date(o.getFullYear(),o.getMonth(),o.getDate()),l=new Date(s);l.setDate(l.getDate()+1);const d=e=>ls(e,r,a);let c;if(t.toDateString()===s.toDateString())c=xs(i.endsToday,i,d(t));else if(t.toDateString()===l.toDateString())c=xs(i.endsTomorrow,i,d(t));else{const e=bs(i,d(t));c=`${Ms(t,n,i)} ${e}`}if(s.getTime()<=e.getTime()){const n=d(e);return t.toDateString()===s.toDateString()||t.toDateString()===l.toDateString()?`${n}${i.separator}${c}`:`${n}${i.endsToday.startsWith(`${i.multiDay} `)?i.separator:" "}${i.multiDay} ${c}`}return t.toDateString()===s.toDateString()||t.toDateString()===l.toDateString()?c:`${i.multiDay} ${c}`}function Ts(e,t,n){const i=new Date,r=new Date(i.getFullYear(),i.getMonth(),i.getDate()),a=new Date(r);return a.setDate(a.getDate()+1),e.toDateString()===r.toDateString()?ks(n.endsToday):e.toDateString()===a.toDateString()?ks(n.endsTomorrow):`${n.multiDay} ${Ms(e,t,n)}`}const Ss=Qe();function Ms(e,t,n){const i=n.fullDaysOfWeek[e.getDay()],r=t?.toLowerCase()||Be,a=function(e){let t=Ss.get(e);if(void 0!==t)return t;t=null;try{if(function(e,t){try{return e.supportedLocalesOf(Ye(t)).length>0}catch{return!1}}(Intl.DateTimeFormat,e)){const n={weekday:"long",day:"numeric",timeZone:"UTC"},i=new Intl.DateTimeFormat(Je(e),{...n,month:"short"}),r=i.formatToParts(Date.UTC(2e3,9,23,12)).find(e=>"month"===e.type);t=/^\d+$/.test(r?.value??"")?new Intl.DateTimeFormat(Je(e),{...n,month:"long"}):i}}catch{t=null}return Ss.set(e,t),t}(No[r]?r:Be);if(a){const t=new Date(Date.UTC(e.getFullYear(),e.getMonth(),e.getDate(),12));return a.formatToParts(t).map(e=>"weekday"===e.type?i:e.value).join("")}const o=e.getDate(),s=n.months[e.getMonth()];switch(function(e){const t=e?.toLowerCase()||"";return"de"===t||"hr"===t||"sr"===t||"sr-latn"===t?"day-dot-month":"en"===t||"hu"===t?"month-day":"day-month"}(t)){case"day-dot-month":return`${i}, ${o}. ${s}`;case"month-day":return`${i}, ${s} ${o}`;default:return`${i}, ${o} ${s}`}}const Ds=new Map;function Cs(e){return void 0===e||""===e?void 0:e}function As(e,t,n){const i=Cs(t),r=Cs(n);return void 0===i&&void 0===r?null:{field:"location"===e||"description"===e?e:"title",pattern:i,replacement:r}}function Es(e,t,n){if(null===t||t.field!==n||""===e)return{text:e,replacedWholeField:!1};if(void 0===t.pattern)return{text:t.replacement??"",replacedWholeField:!0};const i=function(e){if(Ds.has(e))return Ds.get(e)??null;let t=null;try{t=new RegExp(e,"gi")}catch{Tt(`Ignoring "replace_pattern": ${JSON.stringify(e)} is not a valid regular expression. Event text is shown unchanged.`)}return Ds.set(e,t),t}(t.pattern);return null===i?{text:e,replacedWholeField:!1}:{text:e.replace(i,t.replacement??""),replacedWholeField:!1}}function Ls(e){const t=e?.action;return"string"!=typeof t||""===t||"none"===t?"none":t===xe?"details":be.includes(t)?"none":"forward"}const Ps=new Set(["title","location","description"]),Ns=new Set(["url_path","navigation_path"]),Is=new Set(["data","service_data"]),Fs=new Set(["http","https"]),Rs=new RegExp(`\\{(${["title","start","end","all_day","location","description","calendar"].join("|")})\\}`,"g");class Os extends Error{}function zs(e,t,n,i){if("string"==typeof e){const{text:r,filled:a}=function(e,t,n){const i=void 0!==n.key&&Ns.has(n.key),r=i?function(e){const t=["?","#"].map(t=>e.indexOf(t)).filter(e=>e>=0);return t.length?Math.min(...t):1/0}(e):n.payload?0:1/0;let a=!1;return{text:e.replace(Rs,(e,n,o)=>{if(Ps.has(n)&&o<r)throw new Os;a=!0;const s=t[n];return i?encodeURIComponent(s):s}),filled:a}}(e,t,n);return a&&void 0!==n.key&&i.add(n.key),r}if(Array.isArray(e))return e.map(e=>zs(e,t,n,i));if(e&&"object"==typeof e){const r="confirmation"===n.key&&!n.payload;return Object.fromEntries(Object.entries(e).map(([e,a])=>[e,zs(a,t,{key:e,payload:n.payload||Is.has(e)||r&&"text"===e},i)]))}return e}function js(e){const t=e._source??e;return t.end?.dateTime??t.end?.date??void 0}function Hs(e){if(e._isEmptyDay)return;const t=e._source??e,n=t.start.dateTime??t.start.date;return n?{summary:t.summary??"",dtstart:n,dtend:js(e)??n,description:t.description??void 0,location:t.location??void 0,uid:t.uid??void 0,recurrence_id:t.recurrence_id??void 0,rrule:t.rrule??void 0,status:"string"==typeof t.status?t.status:void 0}:void 0}function Ws(e){const t=e._matchedConfig;return{location:!1===t?.show_location,description:!1===t?.show_description}}function Bs(e){const t=e._source??e,n=e._matchedConfig,i=As(n?.replace_field,n?.replace_pattern,n?.replace_with),r=(e,t)=>Es(e,i,t).text,a=t.description??"";return{title:r(t.summary??"","title"),location:r(t.location??"","location"),description:"description"===i?.field?r(Jo(a),"description"):a}}function qs(e){e.style.opacity="0",e.style.transition="opacity 300ms ease-out",setTimeout(()=>{e.parentNode&&(e.parentNode.removeChild(e),Dt("Removed hold indicator"))},300)}function Us(e){const t=e.getBoundingClientRect(),n={left:t.left,top:t.top,right:t.right,bottom:t.bottom},i=e.closest(".event");if(!i||function(e){const t=e.trim().toLowerCase();if(!t||"transparent"===t)return!1;const n=/\/\s*([\d.]+%?)\s*\)$/.exec(t)??/^rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+%?)\s*\)$/.exec(t);if(!n)return!0;const i=Number.parseFloat(n[1]);return Number.isNaN(i)||i>0}(getComputedStyle(i).backgroundColor))return n;if("rtl"===getComputedStyle(i).direction)return n;const r=[],a=document.createRange();if("function"!=typeof a.getClientRects)return n;const o=document.createTreeWalker(e,NodeFilter.SHOW_TEXT);for(let e=o.nextNode();e;e=o.nextNode())if(e.nodeValue?.trim()){a.selectNodeContents(e);for(const e of Array.from(a.getClientRects()))r.push(e)}const s=function(e){const t=e.filter(e=>e.right>e.left).sort((e,t)=>e.left-t.left);if(!t.length)return;let n=t[0].right;for(const e of t.slice(1)){if(e.left>n+48)break;n=Math.max(n,e.right)}return n}(r);return void 0===s?n:{...n,right:Math.min(n.right,s)}}function Vs(e){const t=new Date(e);return t.setHours(0,0,0,0),t.getTime()}function Gs(e,t){const n=new Date(Vs(e));return n.setHours(0,t,0,0),n}function Ks(e,t,n){const i=Se.ADD_SLOT_MINUTES,r=Gs(e.timestamp,e.minute);if(!n)return{allDay:!1,start:r,end:new Date(r.getTime()+36e5)};const a=Gs(t.timestamp,t.minute),o=a<r?{start:a,end:Gs(e.timestamp,e.minute+i)}:{start:r,end:Gs(t.timestamp,t.minute+i)},s=o.end>o.start?o.end:new Date(o.start.getTime()+60*i*1e3);return{allDay:!1,start:o.start,end:s}}function Ys(e,t){const[n,i]=[Vs(e),Vs(t)].sort((e,t)=>e-t);return{allDay:!0,start:new Date(n),end:new Date(i)}}function Js(e,t){return e.allDay===t.allDay&&e.start.getTime()===t.start.getTime()&&e.end.getTime()===t.end.getTime()}const Xs=/^(\d{4})-(\d{2})-(\d{2})$/,Zs=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;function Qs(e){const t=Xs.exec(e);if(!t)return;const n=new Date(Number(t[1]),Number(t[2])-1,Number(t[3]));return Number.isNaN(n.getTime())?void 0:n}function el(e,t){const n=new Date(e);return n.setDate(n.getDate()+t),n}function tl(e,t){const n=Xs.test(e);if(n){const i=Qs(e),r=Qs(t);if(!i)return;const a=r?el(r,-1):i;return{allDay:n,start:i,end:a<i?i:a}}if(!Zs.test(e))return;const i=new Date(e),r=new Date(t);return Number.isNaN(i.getTime())?void 0:{allDay:n,start:i,end:Number.isNaN(r.getTime())?new Date(i):r}}function nl(e){const t=e=>String(e).padStart(2,"0");return`${e.getFullYear()}-${t(e.getMonth()+1)}-${t(e.getDate())}`}function il(e){const t=e=>String(e).padStart(2,"0");return`${t(e.getHours())}:${t(e.getMinutes())}`}function rl(e){if(e.allDay)return{dtstart:nl(e.start),dtend:nl(el(e.end,1))};const t=e=>`${e.toISOString().slice(0,19)}Z`;return{dtstart:t(e.start),dtend:t(e.end)}}function al(e,t){return Math.round((Date.UTC(t.getFullYear(),t.getMonth(),t.getDate())-Date.UTC(e.getFullYear(),e.getMonth(),e.getDate()))/864e5)}function ol(e,t){const n=Qs(t);if(n)return new Date(n.getFullYear(),n.getMonth(),n.getDate(),e.getHours(),e.getMinutes())}function sl(e,t){const n=/^(\d{1,2}):(\d{2})/.exec(t);if(!n)return;const i=Number(n[1]),r=Number(n[2]);return i>23||r>59?void 0:new Date(e.getFullYear(),e.getMonth(),e.getDate(),i,r)}function ll(e,t){return e.allDay?{allDay:!0,start:t,end:el(t,al(e.start,e.end))}:{allDay:!1,start:t,end:new Date(t.getTime()+(e.end.getTime()-e.start.getTime()))}}function dl(e,t,n){if(t===e.allDay)return e;if(t){const t=new Date(e.start.getFullYear(),e.start.getMonth(),e.start.getDate()),n=0===e.end.getHours()&&0===e.end.getMinutes()&&e.end>e.start?new Date(e.end.getTime()-1):e.end,i=new Date(n.getFullYear(),n.getMonth(),n.getDate());return{allDay:!0,start:t,end:i<t?t:i}}const i=new Date(e.start.getFullYear(),e.start.getMonth(),e.start.getDate(),n);return nl(e.end)>nl(e.start)?{allDay:!1,start:i,end:new Date(e.end.getFullYear(),e.end.getMonth(),e.end.getDate(),n+1)}:{allDay:!1,start:i,end:new Date(i.getTime()+36e5)}}function cl(e,t,n,i){const r=i-n;return e.height>0&&r>0?n+Math.min(1,Math.max(0,(t-e.top)/e.height))*r:n}function ul(e,t,n){return!(!n||t!==e.entityId||n.uid!==e.uid)&&(n.recurrence_id??void 0)===e.recurrenceId&&tl(n.dtstart,n.dtend)?.start.getTime()===e.start}const hl=/(?:^|\s)year[:=](\d{4})(?!\w)/i,ml=new RegExp(hl.source,"gi");function pl(e){return e.replace(ml,"").replace(/[^\S\n]{2,}/g," ").replace(/[^\S\n]+\n/g,"\n").replace(/\n{3,}/g,"\n\n").trim()}function fl(e,t){return e.trim().length>0?`${e} (${t})`:`(${t})`}const gl="07:00",vl="22:00",_l=/^(\d{2}):(\d{2})$/;function yl(e){if("string"!=typeof e)return null;const t=_l.exec(e);if(!t)return null;const n=Number(t[1]),i=Number(t[2]);return i>59?null:24===n?0===i?1440:null:n<24?60*n+i:null}function wl(e,t){const n=yl(e),i=yl(t);return null===n||null===i||n>=i?{startMin:yl(gl),endMin:yl(vl),usedFallback:!0}:{startMin:n,endMin:i,usedFallback:!1}}function bl(e){return Number.isFinite(e)&&e>0?e:60}function xl(e,t){return e%60==0||t<60&&t>0&&e%t===0}function kl(e){return 60*e.getHours()+e.getMinutes()+e.getSeconds()/60+e.getMilliseconds()/6e4}function $l(e){return new Date(e.getFullYear(),e.getMonth(),e.getDate())}function Tl(e,t){return new Date(e.getFullYear(),e.getMonth(),e.getDate()+t)}function Sl(e,t,n){return!(!Number.isFinite(e)||!Number.isFinite(t)||t<e)&&(t===e?e>=n.startMin&&e<n.endMin:t>n.startMin&&e<n.endMin)}function Ml(e,t,n){if(!Sl(e,t,n))return null;const i=n.endMin-n.startMin,r=Math.max(e,n.startMin),a=Math.min(t,n.endMin);return{topPct:(r-n.startMin)/i*100,heightPct:(a-r)/i*100,clippedTop:e<n.startMin,clippedBottom:t>n.endMin}}function Dl(e,t,n){const i=e=>xl(Math.floor(e),n)||xl(Math.ceil(e),n),r=(e,t)=>e!==t&&e.endMin>e.startMin&&e.endMin===t.startMin&&e.x0Pct<t.x1Pct&&t.x0Pct<e.x1Pct;return e.map(n=>({ruledStart:n.startMin<=t.startMin||i(n.startMin),ruledEnd:i(n.endMin),touchedAbove:e.some(e=>r(e,n)),touchedBelow:e.some(e=>r(n,e))}))}function Cl(e,t){const n=kl(e);return n<t.startMin||n>=t.endMin?null:(n-t.startMin)/(t.endMin-t.startMin)*100}const Al={at:-1/0,held:!1};function El(e){return{at:e.endMin,held:e.endMin===e.startMin}}function Ll(e,t){return e.held?e.at<t:e.at<=t}function Pl(e,t){return e.at!==t.at?e.at>t.at?e:t:{at:e.at,held:e.held||t.held}}function Nl(e,t){const n=[];let i=Al;for(const r of e){const e=t(r);Ll(i,e.startMin)&&(n.push([]),i=Al),n[n.length-1].push(r),i=Pl(i,El(e))}return n}function Il(e,t,n,i,r){const a=n>i?t-function(e,t,n){const i=Math.min(.25*e,e/(t+1));return n>0?Math.min(n,i):i}(t-e,i,r):t;return{start:e,end:t,share:(a-e)/Math.min(n,i),overflowStart:a}}function Fl(e,t){const n=[];return e.map(e=>{let i=n.findIndex(t=>Ll(t,e.startMin));return i<0&&(i=n.length),i<t&&(n[i]=El(e)),{event:e,laneIndex:i}})}const Rl=1e-6;function Ol(e,t){const n=e?.depth??0,i=t?.depth??0;return n!==i?n>i:(e?.order??-1)>(t?.order??-1)}function zl(e,t){for(let n=t.host;n;n=n.host)if(n===e)return!0;return!1}function jl(e,t){return!Ll(e.release,t.event.startMin)}function Hl(e,t,n,i,r){const a=[],o=new Map;for(const s of e){const e=Math.max(s.startMin,t.startMin);let l=null;for(const t of a){if(Ll(t.release,s.startMin))continue;const i=!t.hidden&&!r.has(t.order)&&t.depth<n.maxDepth&&e-t.top>=(n.hostThresholdMin?.(t.event)??n.thresholdMin)?t:t.host;Ol(i,l)&&(l=i)}let d=o.get(l);d&&!Ll(d.release,s.startMin)||(d={release:Al,laneReleases:[],needed:0,members:[],region:null},o.set(l,d));let c=d.laneReleases.findIndex(e=>Ll(e,s.startMin));c<0&&(c=d.laneReleases.length),c<i&&(d.laneReleases[c]=El(s)),d.release=Pl(d.release,El(s)),d.needed=Math.max(d.needed,c+1);const u={event:s,order:a.length,top:e,bottom:Math.max(e,Math.min(s.endMin,t.endMin)),release:El(s),host:l,depth:(l?.depth??0)+1,children:[],cluster:d,laneIndex:Math.min(c,i),hidden:c>=i,x0:0,x1:100,contentX1:100,contentEnd:e,raised:!1};l?.children.push(u),d.members.push(u),a.push(u)}for(const e of a){const t=e.cluster;if(!t.region){const r=e.host?e.host.x0+n.indentPct:0;let o=e.host?e.host.x1:100;for(const n of a){if(n.order>=e.order)break;t.members.some(e=>jl(n,e))&&!zl(n,e)&&n.x0>r+Rl&&(o=Math.min(o,n.x0))}t.region=Il(r,o,t.needed,i,n.stripPct??1/0)}const{start:r,end:o,share:s,overflowStart:l}=t.region;e.x0=e.hidden?l:r+e.laneIndex*s,e.x1=e.hidden||t.needed<=i?o:l;for(const t of a){if(t.order>=e.order)break;jl(t,e)&&(zl(t,e)?e.raised=!0:(t.x0>e.x0+Rl&&(e.x1=Math.min(e.x1,t.x0)),t.x0<e.x1-Rl&&e.x0<t.x1-Rl&&(e.raised=!0)))}}const s=Wl(a);for(const e of a){e.contentEnd=e.children.reduce((e,t)=>Math.min(e,t.top),e.bottom),e.contentX1=e.x1;const n=[...a.filter(t=>t.order>e.order&&!t.hidden&&!zl(e,t)).map(e=>({x0:e.x0,top:e.top,bottom:e.bottom})),...s.map(e=>({x0:e.x0Pct,top:Math.max(e.startMin,t.startMin),bottom:Math.min(e.endMin,t.endMin)}))],i=e.contentEnd>e.top?e.contentEnd:e.top+Rl;for(const t of n){const n=t.bottom>t.top?t.bottom:t.top+Rl;t.top<i&&n>e.top&&t.x0>e.x0+Rl&&(e.contentX1=Math.min(e.contentX1,t.x0))}}return a}function Wl(e){const t=new Map;for(const n of e)n.hidden&&t.set(n.cluster,[...t.get(n.cluster)??[],n]);return Array.from(t.values()).flatMap(e=>Nl(e,e=>e.event).map(e=>({startMin:Math.min(...e.map(e=>e.event.startMin)),endMin:Math.max(...e.map(e=>e.event.endMin)),x0Pct:e[0].x0,x1Pct:Math.min(...e.map(e=>e.x1)),hidden:e.map(e=>e.event)})))}function Bl(e){return{placed:e.filter(e=>!e.hidden).map(e=>({...e.event,x0Pct:e.x0,x1Pct:e.x1,contentX1Pct:e.contentX1,contentEndMin:e.contentEnd,depth:e.depth,raised:e.raised})),overflows:Wl(e)}}function ql(e,t,n){const i={start:e.start,end:e.end};if(e.start.dateTime)return function(e,t,n){if(!e.start.dateTime||!e.end.dateTime)return[e];const i=new Date(e.start.dateTime),r=new Date(e.end.dateTime);if(Number.isNaN(i.getTime())||Number.isNaN(r.getTime())||r<i)return[];if(r.getTime()===i.getTime())return i>=t&&i<n?[{...e,start:{dateTime:i.toISOString()},end:{dateTime:r.toISOString()},_isMultiDaySegment:!1,_gridSegmentStartsEvent:!0}]:[];const a=r>n?n:r,o=[];for(let s=$l(i<t?t:i);s<a&&s<n;s=Tl(s,1)){const t=Tl(s,1),n=i>s?i:s,a=r<t?r:t;a<=n||o.push({...e,start:{dateTime:n.toISOString()},end:{dateTime:a.toISOString()},_isMultiDaySegment:o.length>0||n>i||a<r,_gridSegmentStartsEvent:n.getTime()===i.getTime()})}return o}(e,t,n).filter(e=>void 0!==e.end.dateTime).map(e=>({...e,_gridSource:i}));if(!e.start.date||!e.end.date)return[];const r=Zo(e.start.date),a=Zo(e.end.date);if(Qo(r)!==e.start.date||Qo(a)!==e.end.date||a<=r)return[];const o=[];for(let s=r<t?$l(t):r;s<a&&s<n;s=Tl(s,1))o.push({...e,start:{date:Qo(s)},end:{date:Qo(Tl(s,1))},_gridSource:i});return o}function Ul(e){if(!e.start.dateTime||!e.end.dateTime)return null;const t=new Date(e.start.dateTime),n=new Date(e.end.dateTime);if(Number.isNaN(t.getTime())||Number.isNaN(n.getTime())||n<t)return null;const i=!1===e._gridSegmentStartsEvent&&t.getTime()===$l(t).getTime()?0:kl(t),r=kl(n);let a=as(t,n)>0?1440:r;return Math.floor(a)<=Math.floor(i)&&n.getTimezoneOffset()>t.getTimezoneOffset()&&(a=i+(n.getTime()-t.getTime())/6e4),{startMin:i,endMin:a}}function Vl(e,t){if(t.length<1)return null;let n,i;if(e.start.date)n=Zo(e.start.date),i=e.end.date?Tl(Zo(e.end.date),-1):n;else{if(!e.start.dateTime||!e.end.dateTime)return null;{const t=new Date(e.start.dateTime),r=new Date(e.end.dateTime);n=$l(t),i=$l(r>t?new Date(r.getTime()-1):t)}}if(Number.isNaN(n.getTime())||Number.isNaN(i.getTime())||i<n)return null;const r=t.map(e=>$l(e)),a=r.map((e,t)=>({day:e,index:t})).filter(({day:e})=>e>=n&&e<=i).map(({index:e})=>e);if(0===a.length)return null;const o=a[0],s=a[a.length-1];return{columnIndex:o,span:s-o+1,continuesBefore:n<r[o],continuesAfter:i>r[s]}}const Gl=new WeakMap;let Kl=0;function Yl(){return Kl}const Jl=new Map;function Xl(e){let t=0;for(const n of e)t+=Jl.get(n)??0;return t}function Zl(e){const t=e?.connection;return t&&"function"==typeof t.subscribeMessage?t:null}function Ql(e){let t=Gl.get(e);if(t)return t;const n={connection:e,support:"unknown",unsupportedAt:0,probe:null,subscriptions:new Map,listeners:new Set};return t=n,Gl.set(e,n),e.addEventListener?.("ready",()=>{"no"===n.support&&(n.support="unknown"),td(n,"*");for(const e of[...n.subscriptions.values()])"refused"!==e.state?(e.reconnecting=!0,clearTimeout(e.silenceTimer),e.silenceTimer=setTimeout(()=>{Tt(`No live update for ${e.entityId} since reconnecting`),id(n,e),td(n,e.entityId)},3e4)):(id(n,e),td(n,e.entityId))}),n}function ed(e,t){return`${e}|${t.start.toISOString()}|${t.end.toISOString()}`}function td(e,t){for(const n of[...e.listeners])n(t)}function nd(e){const t=[...e.waiters];e.waiters.clear();for(const e of t)e()}function id(e,t){t.closed||(t.closed=!0,clearTimeout(t.closeTimer),clearTimeout(t.silenceTimer),clearTimeout(t.stateTimer),e.subscriptions.get(t.key)===t&&e.subscriptions.delete(t.key),!1===e.connection.connected||t.reconnecting||t.unsubscribe.then(e=>e?.()),nd(t))}function rd(e,t){t.closed||(t.state="refused",nd(t),td(e,t.entityId))}function ad(e,t,n){const i=Zl(e);if(!i)return null;const r=Ql(i);if("no"===r.support&&Date.now()-r.unsupportedAt>=18e5&&(r.support="unknown"),"no"===r.support)return null;const a=ed(t,n);let o=r.subscriptions.get(a);if(!o){if(!1===i.connected)return null;o={key:a,entityId:t,state:"pending",events:[],fingerprint:"",version:0,raw:void 0,refs:0,closed:!1,pushedAt:0,seenState:void 0,seenAt:0,stateTimer:void 0,reconnecting:!1,closeTimer:void 0,silenceTimer:void 0,waiters:new Set,unsubscribe:Promise.resolve(null)},r.subscriptions.set(a,o),function(e,t,n,i,r){let a;const o=()=>{if(n.closed)return Promise.resolve(null);if("no"===e.support||!1===t.connected)return rd(e,n),a?.(),Promise.resolve(null);const o=setTimeout(()=>{"pending"===n.state&&(Tt(`No answer to the live subscription for ${n.entityId}`),rd(e,n)),a?.()},5e3);return t.subscribeMessage(t=>function(e,t,n,i){if(t.closed)return void setTimeout(()=>{t.unsubscribe.then(e=>e?.())},0);clearTimeout(t.silenceTimer),t.silenceTimer=void 0,t.reconnecting=!1,clearTimeout(t.stateTimer),t.stateTimer=void 0,t.pushedAt=Date.now();const r=n?.events,a="live"===t.state;let o=!1;if(Array.isArray(r)){const e=JSON.stringify(r);if("live"!==t.state||e!==t.raw){const n=r.flatMap(e=>function(e,t){if(!e||"object"!=typeof e)return null;const{start:n,end:i,all_day:r,...a}=e;if("string"!=typeof n||"string"!=typeof i)return null;const o=!0===r||void 0===r&&cd.test(n),s=e=>o?{date:e}:{dateTime:ud(e,t)};return{...a,start:s(n),end:s(i)}}(e,i)??[]),a=hd(n);o="live"!==t.state||a!==t.fingerprint,o&&(t.version=++Kl),t.state="live",t.raw=e,t.events=n,t.fingerprint=a}}else o="failed"!==t.state,t.state="failed",t.raw=void 0;o&&a&&Jl.set(t.entityId,(Jl.get(t.entityId)??0)+1),nd(t),o&&td(e,t.entityId)}(e,n,t,r),{type:"calendar/event/subscribe",entity_id:n.entityId,start:i.start.toISOString(),end:i.end.toISOString()}).then(t=>(e.support="yes",()=>{Promise.resolve().then(t).catch(()=>{})}),t=>{const i="string"==typeof t?.code?t.code:void 0;return"unknown_command"===i?(e.support="no",e.unsupportedAt=Date.now(),Mt("Home Assistant cannot push calendar changes; polling instead")):i&&(e.support="yes",Tt(`Live updates refused for ${n.entityId}: ${i}`)),rd(e,n),null}).finally(()=>{clearTimeout(o),a?.()})};if("unknown"!==e.support)n.unsubscribe=o();else if(e.probe)n.unsubscribe=e.probe.then(o);else{const t=new Promise(n=>{a=()=>{e.probe===t&&(e.probe=null),n()}});e.probe=t,n.unsubscribe=o()}}(r,i,o,n,e.config?.time_zone)}const s=o;s.refs+=1,clearTimeout(s.closeTimer),s.closeTimer=void 0;let l=!1;return{subscription:s,release:e=>{l||(l=!0,s.refs-=1,s.refs>0||s.closed||(e<=0?id(r,s):s.closeTimer=setTimeout(()=>id(r,s),e)))}}}function od(e,t,n){return ad(e,t,n)?.release??null}function sd(e,t,n){const i=Zl(e),r=i?Gl.get(i)?.subscriptions.get(ed(t,n)):void 0;if(r)return{state:r.state,fingerprint:r.fingerprint,version:r.version,reconnecting:r.reconnecting}}const ld=new Map,dd=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/,cd=/^\d{4}-\d{2}-\d{2}$/;function ud(e,t){if(!t||!dd.test(e))return e;const n=Date.parse(e);if(Number.isNaN(n))return e;let i=ld.get(t);try{i||(i=new Intl.DateTimeFormat("en-US",{timeZone:t,hourCycle:"h23",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"}),ld.set(t,i))}catch{return e}const r={};for(const{type:e,value:t}of i.formatToParts(n))r[e]=t;const a=Date.UTC(Number(r.year),Number(r.month)-1,Number(r.day),Number(r.hour),Number(r.minute),Number(r.second)),o=Math.round((a-n)/6e4);if(!Number.isFinite(o))return e;const s=o<0?"-":"+",l=e=>String(e).padStart(2,"0"),d=l(Math.floor(Math.abs(o)/60)),c=l(Math.abs(o)%60);return`${r.year}-${r.month}-${r.day}T${r.hour}:${r.minute}:${r.second}${s}${d}:${c}`}function hd(e){const t=e=>e?.date?`d${e.date}`:e?.dateTime?`t${Date.parse(e.dateTime)}`:"";return e.map(e=>{const n=e,i=Object.keys(n).filter(e=>"start"!==e&&"end"!==e&&!e.startsWith("_")).sort().flatMap(e=>{const t=n[e];return null==t||""===t?[]:[e,"string"==typeof t?t:JSON.stringify(t)]});return JSON.stringify([t(e.start),t(e.end),i])}).sort().join("\n")}const md=new Map,pd=new Map;function fd(e,t){if("persistent"===e){const e=hc(t),n=function(e){const t=pd.get(e);return t?(pd.delete(e),Date.now()-t.entry.timestamp>=864e5?null:(pd.set(e,t),t.writeGeneration===vd()||t.entry.expired?t.entry:{...t.entry,expired:!0})):null}(t);return n&&(!e||n.timestamp>e.timestamp)?n:e}const n=md.get(t);if(!n)return null;return n.writeGeneration!==vd()||Date.now()-n.entry.timestamp>=864e5?(md.delete(t),null):(md.delete(t),md.set(t,n),n.entry)}const gd=Symbol.for("calendar-card-pro.write-generation");function vd(){return globalThis[gd]??0}const _d=new Map,yd=new Map;let wd=0;function bd(e,t,n,i="persistent"){const r=vs(t.first_day_of_week,e.locale),a=function(e,t,n,i,r){const a=t.map(e=>"string"==typeof e?e:e.entity).sort().join("_");let o="";if(i)try{o=i.includes("T")?i.split("T")[0]:i}catch{o=i}const s=o?`_${o}`:"",l=lt(o,r);return`${ge}${e}_${a}_${n}${s}${l}${fe}`}(n,t.entities,t.days_to_show,t.start_date,r),o=dc(t.days_to_show,t.start_date,r);return{cacheKey:a,firstDayOfWeek:r,window:o,signature:`${i}|${a}|${o.start.toISOString()}|${o.end.toISOString()}`,store:i}}function xd(e,t,n,i="persistent"){const r=bd(e,t,n,i),a=fd(i,r.cacheKey);if(!a)return null;const o=Date.now();return{...$d(a,Ed(a,o),t,r.firstDayOfWeek),due:Ad(a,t,r.window,o),inFlight:_d.has(r.signature)}}async function kd(e,t,n,i="cache",r=0,a,o="persistent",s){const l=bd(e,t,n,o);if("cache"===i){const e=fd(o,l.cacheKey),n=Date.now();if(e&&!Ad(e,t,l.window,n))return Mt(`Using ${e.events.length} events from cache`),$d(e,Ed(e,n),t,l.firstDayOfWeek)}let d=_d.get(l.signature);d&&!function(e,t,n){return!e.expired&&(("page"!==e.store||e.writeGeneration===vd())&&("reload"===t?void 0!==n&&e.writeGeneration>=n:"live"!==t||e.liveChanges>=Yl()))}(d,i,a)&&(d=void 0),d?Mt("Joining an in-flight request for the same calendars and window"):d=function(e,t,n,i,r){const a=++wd;yd.set(`${n.store}|${n.cacheKey}`,a);const o={writeGeneration:vd(),store:n.store,calendars:Md(t.entities),expired:!1,settled:new Map,watchers:new Set,load:r,liveChanges:Yl()};return o.promise=async function(e,t,n,i,r,a){Mt("Fetching events from API");const o=Md(t.entities),s="live"===a.load?function(e,t,n,i,r){const a=new Set,o=fd(n.store,n.cacheKey);if(!o||o.expired)return a;for(const s of i){const i=sd(e,s,n.window);if("live"===i?.state&&!i.reconnecting)continue;if(o.failedEntities?.includes(s)){"number"==typeof o.retryAt&&r<o.retryAt&&a.add(s);continue}const l=Dd(o,s);void 0!==l&&r-l<mc(t)&&a.add(s)}return a}(e,t,n,o,Date.now()):new Set,l=t.entities.map(e=>"string"==typeof e?{entity:e,color:"var(--primary-text-color)"}:e).filter(e=>!s.has(e.entity)),{events:d,failedEntities:c}=await lc(e,l,n.window,(e,t)=>{a.settled.set(e,t);for(const e of[...a.watchers])e()},"reload"!==a.load),u=Date.now(),h=fd(n.store,n.cacheKey),m=new Set(c),p=new Set([...s].filter(e=>h?.failedEntities?.includes(e))),f=864e5,g={},v=[...d];for(const e of o){if(s.has(e)){const t=h?Dd(h,e):void 0;if(void 0===t||u-t>=f)continue;g[e]=t,v.push(...h.events.filter(t=>t._entityId===e));continue}if(!m.has(e)){g[e]=u;continue}const t=h?Dd(h,e):void 0;void 0===t||u-t>=f||(g[e]=t,v.push(...h.events.filter(t=>t._entityId===e)))}const _={events:v,timestamp:u,window:{start:n.window.start.toISOString(),end:n.window.end.toISOString()},lastSuccess:g};if(0===m.size&&p.size>0)_.failedEntities=o.filter(e=>p.has(e)),_.failureCount=h?.failureCount??1,_.retryAt=h?.retryAt;else if(m.size>0){for(const e of p)m.add(e);const e=(h?h.failedEntities?.length?h.failureCount??1:0:r)+1;_.failedEntities=o.filter(e=>m.has(e)),_.failureCount=e,_.retryAt=u+function(e,t){const n=Math.min(Math.max(e-1,0),20);return Math.min(6e4*2**n,mc(t))}(e,t);const n=v.length-d.length;Tt(`${m.size} of ${o.length} calendar(s) failed to load (attempt ${e}); keeping ${n} previously loaded event(s), retrying in ${Math.round((_.retryAt-u)/1e3)}s`)}else 0===v.length&&(_.ttlMs=15e3,Mt("No events returned; caching empty result briefly (15s)"));return a.expired&&(_.expired=!0),yd.get(`${n.store}|${n.cacheKey}`)===i?function(e,t,n,i){if("persistent"!==e)for(md.delete(t),md.set(t,{entry:n,writeGeneration:i});md.size>16;)md.delete(md.keys().next().value);else!function(e,t){try{Mt(`Caching ${t.events.length} events`);const n=JSON.stringify(t);return localStorage.setItem(e,n),localStorage.getItem(e)===n&&null!==hc(e)}catch(e){return $t("Failed to cache calendar events:",e),!1}}(t,n)?function(e,t,n){for(pd.delete(e),pd.set(e,{entry:t,writeGeneration:n});pd.size>16;)pd.delete(pd.keys().next().value)}(t,n,i):pd.delete(t)}(n.store,n.cacheKey,_,a.writeGeneration):Mt("A newer request for the same calendars has started; not caching this response"),_}(e,t,n,a,i,o).finally(()=>{_d.get(n.signature)===o&&_d.delete(n.signature)}),_d.set(n.signature,o),o}(e,t,l,r,i);const c=d,u=s?()=>{const e=[...c.settled.values()].flatMap(e=>e??[]);if(0===e.length)return;const n=Date.now();s({raw:e,events:Ld(e,t,l.firstDayOfWeek),failedEntities:[],lastSuccess:Object.fromEntries([...c.settled].flatMap(([e,t])=>t?[[e,n]]:[])),fetchedAt:n,loadedAt:n,nextAttemptAt:n+mc(t)})}:void 0;u&&(c.watchers.add(u),c.settled.size>0&&u());try{const e=await c.promise;return $d(e,e.events,t,l.firstDayOfWeek)}finally{u&&c.watchers.delete(u)}}function $d(e,t,n,i){return{raw:t,events:Ld(t,n,i),failedEntities:[...e.failedEntities??[]],lastSuccess:Object.fromEntries(Md(n.entities).flatMap(t=>{const n=Dd(e,t);return void 0===n?[]:[[t,n]]})),fetchedAt:e.timestamp,loadedAt:Td(e,t),nextAttemptAt:Cd(e,n)}}function Td(e,t){let n=e.timestamp;for(const i of new Set(t.map(e=>e._entityId))){if(!i)continue;const t=Dd(e,i);void 0!==t&&t<n&&(n=t)}return n}function Sd(e,t){return{window:bd(e,t,"").window,entityIds:Md(t.entities)}}function Md(e){return[...new Set(e.map(e=>"string"==typeof e?e:e.entity))]}function Dd(e,t){const n=e.lastSuccess?.[t];return"number"==typeof n?n:e.lastSuccess||e.failedEntities?.includes(t)?void 0:e.timestamp}function Cd(e,t){const n=e.timestamp+mc(t);return e.failedEntities?.length?"number"==typeof e.retryAt?Math.min(e.retryAt,n):e.timestamp:n}function Ad(e,t,n,i){if(n&&e.window&&(e.window.start!==n.start.toISOString()||e.window.end!==n.end.toISOString()))return!0;if(e.expired)return!0;if(e.failedEntities?.length)return i>=Cd(e,t);const r="number"==typeof e.ttlMs&&e.ttlMs>0?e.ttlMs:mc(t);return i-e.timestamp>=r}function Ed(e,t){return e.events.filter(n=>{if(!n._entityId)return!0;const i=Dd(e,n._entityId)??e.timestamp;return t-i<864e5})}function Ld(e,t,n){const i=Bd(e,t),r=pc(t,n),a=new Date(r);return a.setDate(a.getDate()+t.days_to_show),i.filter(e=>{if(!e.start)return!1;let t;if(e.start.dateTime)t=new Date(e.start.dateTime);else{if(!e.start.date)return!1;t=Zo(e.start.date)}return t<a})}function Pd(e){return{start:e.start,end:ht(e.end)?e.end:void 0,summary:e.summary,location:e.location,description:e.description,uid:e.uid,recurrence_id:e.recurrence_id,rrule:e.rrule,status:e.status}}function Nd(e){let t=0;const n=e.flatMap(e=>{if(!e||!ht(e.start))return[];if(null!=e.end&&!ht(e.end))return[];const n=ht(e.end)?e.end:void 0;if([e.start.date,e.start.dateTime,n?.date,n?.dateTime,e.summary,e.location,e.description].some(e=>null!=e&&"string"!=typeof e))return[];if(e.start.dateTime){const i=Date.parse(e.start.dateTime);if(e.start.date||n?.date||!Number.isFinite(i))return[];if(n?.dateTime){const t=Date.parse(n.dateTime);if(!Number.isFinite(t))return[];if(t>=i)return[e]}return t++,[{...e,end:{dateTime:e.start.dateTime},_source:e._source??Pd(e)}]}return!n||n.dateTime?[]:[e.start.date,n.date].every(e=>"string"==typeof e&&Qo(Zo(e))===e)&&n.date>e.start.date?[e]:[]}),i=e.length-n.length;return i>0&&Tt(`Ignoring ${i} malformed calendar event(s): expected matching, parseable start/end values and string text fields`),t>0&&Tt(`Showing ${t} timed event(s) whose end is missing or before their start at their start time`),n}function Id(e,t,n){return e>=n?e:t.toDateString()===n.toDateString()||t>n?n:e}const Fd=/^(\d{1,2}):([0-5]\d)(?::([0-5]\d))?$/,Rd=new Set;function Od(e){if("string"!=typeof e)return null;const t=Fd.exec(e.trim());if(!t)return null;const n=Number(t[1]);return n>23?null:{hours:n,minutes:Number(t[2]),seconds:t[3]?Number(t[3]):0}}function zd(e,t){const n=Od(t);if(!n){if("string"==typeof t&&""!==t.trim()){const e=t.trim();Rd.has(e)||(Rd.add(e),Tt(`Invalid allday_expires_at value "${e}" — expected a time such as 10:00`))}const n=new Date(e);return n.setDate(n.getDate()+1),n.setHours(0,0,0,0),n}const i=new Date(e);return i.setHours(n.hours,n.minutes,n.seconds,0),i}function jd(e,t){return void 0!==e.start.dateTime&&!0===(ic(e._entityId,"multiday_banners",t,e)??t.multiday_banners)&&null!==os(e.start,e.end)}function Hd(e,t,n,i,r="list",a){const o=Vr(t,r),s=Nd(e),l=o.show_empty_days,d=n&&Br(r),c=!d&&Br(r),u=mr(o,r),h=(e,t)=>u?t.timestamp-e.timestamp:e.timestamp-t.timestamp,m=Boolean(o.show_progress_bar)&&"grid"!==r,p=pc(o,vs(o.first_day_of_week,a?.locale)),f=new Date(p),g=new Date(f);g.setHours(23,59,59,999);const v=new Date(f);v.setDate(v.getDate()+o.days_to_show);const _=new Map,y=new Map,w=o.filter_duplicates===ke,b="never"===function(e){switch(e){case"grid":return"never";case"column":case"list":return"inherit"}}(r),x=b?function(e,t){const n=e=>jd(e,t);if(!t.filter_duplicates)return new Set(e.filter(n));const i=t.filter_duplicates===ke,r=new Map,a=new Map;for(const n of e){const e=Xd(n,i);r.set(n,e);const o=a.get(e);(!o||Wd(n._entityId,t)<Wd(o._entityId,t))&&a.set(e,n)}return new Set(e.filter(e=>n(a.get(r.get(e)))))}(s,o):void 0,k=s.flatMap(e=>{const t=b?ql(e,f,v):function(e,t){const n=[];for(const i of e){if(!Ud(i,t)){n.push(i);continue}if(!qd(i)){n.push(i);continue}const e=Gd(i);n.push(...e)}return n}([e],o),n=x?.has(e)?t.map(e=>({...e,_gridBanner:!0})):t;if(o.filter_duplicates){const t=Xd(e,w);n.forEach(e=>_.set(e,t))}return n}),$=new Date,T=k.filter(e=>{if(!e?.start||!e?.end)return!1;const t=!e.start.dateTime;let n,i;if(t){if(n=e.start.date?Zo(e.start.date):null,i=e.end.date?Zo(e.end.date):null,i){const e=new Date(i);e.setDate(e.getDate()-1),i=e}}else n=e.start.dateTime?new Date(e.start.dateTime):null,i=e.end.dateTime?new Date(e.end.dateTime):null;if(!n||!i)return!1;if(n>=v)return!1;if(!(n>=f&&n<=g||n>g||i>=f))return!1;if(!o.show_past_events){const n=e._gridBanner&&e._gridSource?.end.dateTime?new Date(e._gridSource.end.dateTime):i;if(!t&&n<$)return!1;const r=e._splitFromTimedEvent?void 0:ic(e._entityId,"allday_expires_at",o,e),a=e._gridSource?.end.date?Tl(Zo(e._gridSource.end.date),-1):i;if(t&&$>=zd(a,r))return!1}const r=function(e){const t=e?.days_of_week;return"weekdays"===t||"weekends"===t?t:void 0}(e._matchedConfig);return!(r&&!function(e,t,n){return rs(e,n)===("weekends"===t)}(Id(n,i,f),r,a)||(o.filter_duplicates&&y.set(e,Qo(Id(n,i,f))),0))}),S=new Map;if(o.filter_duplicates&&"grid"!==r)for(const e of T){const t=_.get(e),n=S.get(t);(!n||Wd(e._entityId,o)<Wd(n._entityId,o))&&S.set(t,e)}const M=function(e,t,n,i=Xd){if(!n||e.length<2)return e;const r=new Set,a=new Set,o=new Map;for(const n of t.entities){const t="string"==typeof n?n:n.entity;for(const n of e){if(n._entityId!==t)continue;const e=i(n),s=o.get(e);s?s.some(e=>e.entityId===t)||s.push({entityId:t,config:n._matchedConfig}):o.set(e,[{entityId:t,config:n._matchedConfig}]),r.has(e)||(r.add(e),a.add(n))}}const s=[];for(const t of e){const e=i(t);if(!a.has(t)&&r.has(e))continue;const n=o.get(e);s.push(n&&n.length>1?{...t,_mergedFrom:n}:t)}return s}(T,o,Boolean(o.filter_duplicates),e=>{const t=_.get(e),n=S.get(t),i=void 0!==n&&!n._isMultiDaySegment;return JSON.stringify([t,i?null:y.get(e)])}),D={};M.length>0&&M.forEach(e=>{let t,n;if(e.start.dateTime)t=e.start.dateTime?new Date(e.start.dateTime):null,n=e.end.dateTime?new Date(e.end.dateTime):null;else if(t=e.start.date?Zo(e.start.date):null,n=e.end.date?Zo(e.end.date):null,n){const e=new Date(n);e.setDate(e.getDate()-1),n=e}if(!t||!n)return;const r=Id(t,n,f),a=Qo(r),s=Io(i);D[a]||(D[a]={weekday:s.daysOfWeek[r.getDay()],day:r.getDate(),month:s.months[r.getMonth()],timestamp:r.getTime(),events:[]});const l=ic(e._entityId,"show_description",o,e)??o.show_description,d=e.description||"",c=function(e){return e.length>0&&/year/i.test(e)}(d),u=l||c?Jo(d):"",h=c?function(e){const t=hl.exec(e);return t?Number(t[1]):null}(u):null,p=e._gridSource?.start??e._sourceStart,g=p?.dateTime?new Date(p.dateTime):p?.date?Zo(p.date):t,v=null===h?null:function(e,t){const n=e-t;return n>=1?n:null}(g.getFullYear(),h),_=e.summary||"",y=As(ic(e._entityId,"replace_field",o,e),ic(e._entityId,"replace_pattern",o,e),ic(e._entityId,"replace_with",o,e)),w=Es(_,y,"title"),b=w.replacedWholeField||""!==_.trim()&&""===w.text.trim();D[a].events.push({summary:null===v||b?w.text:fl(w.text,v),location:ic(e._entityId,"show_location",o,e)??o.show_location?Es(Go(e.location||"",o.remove_location_country),y,"location").text:"",description:l?Es(null===h?u:pl(u),y,"description").text:"",start:e.start,end:e.end,_entityId:e._entityId,_entityLabel:Qd(e._entityId,o,e),_matchedConfig:e._matchedConfig,_mergedFrom:e._mergedFrom,_source:e._source,_isEmptyDay:e._isEmptyDay,_isCustomEmptyText:e._isCustomEmptyText,_isMultiDaySegment:e._isMultiDaySegment,_sourceStart:e._sourceStart,_sourceEnd:e._sourceEnd,_splitFromTimedEvent:e._splitFromTimedEvent,_dayOfEvent:m?sc(e,r)??void 0:void 0,_gridSegmentStartsEvent:e._gridSegmentStartsEvent,_gridSource:e._gridSource,_gridBanner:e._gridBanner})});const C=vs(o.first_day_of_week,a?.locale);Object.values(D).forEach(e=>{const t=new Date(e.timestamp);e.weekNumber=fc(t,o,C),e.monthNumber=t.getMonth()}),Object.values(D).forEach(e=>{e.events.sort((e,t)=>{const n=!e.start.dateTime,i=!t.start.dateTime;if(n&&!i)return-1;if(!n&&i)return 1;let r,a;if(r=n&&e.start.date?Zo(e.start.date).getTime():e.start.dateTime?new Date(e.start.dateTime).getTime():0,a=i&&t.start.date?Zo(t.start.date).getTime():t.start.dateTime?new Date(t.start.dateTime).getTime():0,n&&i&&r===a){const n=Wd(e._entityId,o),i=Wd(t._entityId,o);return n!==i?n-i:(e.summary||"").localeCompare(t.summary||"",void 0,{sensitivity:"base"})}return r-a}),u&&e.events.reverse()});const A=c?Math.min(o.compact_days_to_show||o.days_to_show,o.days_to_show):o.days_to_show;let E,L=Object.values(D).sort(h);if(c){const e=new Map;for(const t of L){const n=[];for(const i of t.events){if(i._isEmptyDay){n.push(i);continue}const t=i._entityId,r=i._matchedConfig;let a=-1;r?a=o.entities.findIndex(e=>"object"==typeof e&&e===r):t&&(a=o.entities.findIndex(e=>"string"==typeof e&&e===t));const s=-1!==a?`${t}__${a}`:t||"",l=r?.compact_events_to_show;if("number"!=typeof l||!Number.isFinite(l)){n.push(i);continue}const d=e.get(s)||0;d<l&&(n.push(i),e.set(s,d+1))}t.events=n}}const P=hr("skip_first_events",r)?Math.floor(o.skip_first_events??0):0;if(P>0){let e,t=P;if(L=L.filter(n=>0===t||(n.events.length>t?(n.events=n.events.slice(t),t=0,e=n,!0):(t-=n.events.length,n.events.length>0&&(e=n),n.events=[],!1))),e){const t=new Date(e.timestamp),n=e.events.length>0?0:u?-1:1;E=new Date(t.getFullYear(),t.getMonth(),t.getDate()+n)}}if(L=L.slice(0,A||3),d||l||(L=L.filter(e=>e.events.length>0&&!(1===e.events.length&&e.events[0]._isEmptyDay))),c){const e=o.compact_events_to_show;if("number"==typeof e&&Number.isFinite(e)){let t=[],n=0;if(o.compact_events_complete_days){const i=new Set;for(const t of L)if((1!==t.events.length||!t.events[0]._isEmptyDay)&&n<e&&t.events.length>0){const r=Math.min(t.events.length,e-n);r>0&&(i.add(Qo(new Date(t.timestamp))),n+=r)}t=L.filter(e=>{const t=Qo(new Date(e.timestamp));return i.has(t)})}else{t=[];for(const i of L){if(n>=e&&(1!==i.events.length||!i.events[0]._isEmptyDay))break;if(1===i.events.length&&i.events[0]._isEmptyDay){t.push(i);continue}const r=e-n;if(r>0&&i.events.length>0){const e={...i,events:i.events.slice(0,r)};t.push(e),n+=e.events.length}}}L=t}}let N;if(o.show_empty_today&&!l){const e=new Date($.getFullYear(),$.getMonth(),$.getDate()),t=as(f,e),n=Boolean(D[Qo(e)]),i=void 0!==E&&(u?e>E:e<E);t>=0&&t<o.days_to_show&&!n&&!i&&(N=e)}const I=L.length;if(l||0===L.length||N){const e=Io(i),t=o.empty_day_text,n=Boolean(t),r=t||e.noEvents,a=(e,t=0)=>new Date(e.getFullYear(),e.getMonth(),e.getDate()+t),s=a(p),m=a(p,o.days_to_show-1),f=E?new Date(Math.min(Math.max(E.getTime(),s.getTime()),m.getTime())):u?m:s;let g;if(d)g=A;else if(0===L.length)g=l?A:1;else if(c&&o.compact_events_to_show){const e=L.map(e=>e.timestamp),t=new Date(u?Math.min(...e):Math.max(...e));g=Math.abs(as(f,t))+1}else g=A;const v=a(f,(u?-1:1)*(g-1));let _=u?v:f,y=u?f:v;_<s&&(_=s),y>m&&(y=m),N&&(_=new Date(N),y=new Date(N));const w=new Set(L.map(e=>Qo(new Date(e.timestamp)))),b=[...L],x=as(_,y);for(let t=0;t<=x;t++){const i=new Date(_);i.setDate(_.getDate()+t);const a=Qo(i);if(!w.has(a)){const t=fc(i,o,C),s={weekday:e.daysOfWeek[i.getDay()],day:i.getDate(),month:e.months[i.getMonth()],timestamp:i.getTime(),events:[{summary:r,start:{date:a},end:{date:a},_entityId:"_empty_day_",_isEmptyDay:!0,_isCustomEmptyText:n,location:""}],weekNumber:t,monthNumber:i.getMonth()};b.push(s)}}b.sort(h),L=b}const F=N&&L.length>I?1:0;return L.slice(0,A+F)}function Wd(e,t){if(!e)return Number.MAX_SAFE_INTEGER;const n=t.entities.findIndex(t=>"string"==typeof t?t===e:t.entity===e);return-1!==n?n:Number.MAX_SAFE_INTEGER}function Bd(e,t){const n=[],i=Nd(e);return t.entities.forEach(e=>{const r="string"==typeof e?e:e.entity,a=i.filter(e=>e._entityId===r);if(0===a.length)return;const o=function(e,t,n){if("string"==typeof t)return Yd(e,Kd(void 0,n));let i=Yd(e,Kd(t,n));const r=t.filter_field;if(t.allowlist)try{const e=new RegExp(t.allowlist,"i");i=i.filter(t=>{const n=Jd(t,r);return Boolean(n&&e.test(n))})}catch(e){Tt(`Invalid allowlist pattern: ${t.allowlist}`,e)}if(t.blocklist)try{const e=new RegExp(t.blocklist,"i");i=i.filter(t=>{const n=Jd(t,r);return!(n&&e.test(n))})}catch(e){Tt(`Invalid blocklist pattern: ${t.blocklist}`,e)}return i}(a,e,t),s=o.map(n=>{const i={...n,_source:n._source??Pd(n),_matchedConfig:"object"==typeof e?e:void 0};return i._entityLabel=Qd(r,t,i),i});n.push(...s)}),Dt(`Processed ${n.length} events after filtering`),n}function qd(e){if(!e.start||!e.end)return!1;if(e.start.date&&e.end.date){const t=Zo(e.start.date),n=Zo(e.end.date);return n.setDate(n.getDate()-1),t.toDateString()!==n.toDateString()}if(e.start.dateTime&&e.end.dateTime){const t=new Date(e.start.dateTime),n=new Date(e.end.dateTime);return t.toDateString()!==n.toDateString()}return!1}function Ud(e,t){return e._entityId&&e._matchedConfig&&void 0!==e._matchedConfig.split_multiday_events?e._matchedConfig.split_multiday_events:t.split_multiday_events}function Vd(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}function Gd(e){const t=[],n=e._sourceStart??e.start,i=e._sourceEnd??e.end;if(e.start.date&&e.end.date){const r=Zo(e.start.date),a=Zo(e.end.date);a.setDate(a.getDate()-1);const o=Vd(a);for(let a=new Date(r);Vd(a)<=o;a.setDate(a.getDate()+1)){const r=Vd(a),o=new Date(a);o.setDate(o.getDate()+1);const s=Vd(o),l={...e,start:{date:r},end:{date:s},_isMultiDaySegment:!0,_sourceStart:n,_sourceEnd:i};t.push(l)}}else if(e.start.dateTime&&e.end.dateTime){const r=new Date(e.start.dateTime),a=new Date(e.end.dateTime),o=new Date(r);if(o.setHours(23,59,59,999),new Date(o.getTime()+1)<a){const s={...e,start:{dateTime:r.toISOString()},end:{dateTime:o.toISOString()},_isMultiDaySegment:!0,_sourceStart:n,_sourceEnd:i,_splitFromTimedEvent:!0};t.push(s);const l=new Date(r);l.setDate(l.getDate()+1),l.setHours(0,0,0,0);const d=new Date(a);d.setHours(0,0,0,0);for(let r=new Date(l);r<d;r.setDate(r.getDate()+1)){const a=Vd(r),o=new Date(r);o.setDate(o.getDate()+1);const s=Vd(o),l={...e,start:{date:a},end:{date:s},_isMultiDaySegment:!0,_sourceStart:n,_sourceEnd:i,_splitFromTimedEvent:!0};t.push(l)}if(a>d){const r={...e,start:{dateTime:d.toISOString()},end:{dateTime:a.toISOString()},_isMultiDaySegment:!0,_sourceStart:n,_sourceEnd:i,_splitFromTimedEvent:!0};t.push(r)}}else t.push({...e})}return t}function Kd(e,t){const n=e?.event_type??t.event_type;return"timed"===n||"all_day"===n?n:"all"}function Yd(e,t){if("all"===t)return[...e];const n="all_day"===t;return e.filter(e=>!e.start.dateTime===n)}function Jd(e,t){return"location"===t?e.location:"description"===t?e.description:e.summary}function Xd(e,t=!1){const n=e.summary||"",i=t?"":e.location||"";let r="";return r=e.start.dateTime?`${new Date(e.start.dateTime).getTime()}|${e.end.dateTime?new Date(e.end.dateTime).getTime():0}`:`${e.start.date||""}|${e.end.date||""}`,`${n}|${r}|${i}`}function Zd(e,t,n,i,r){if(!e)return"var(--calendar-card-line-color-vertical)";let a;a=i&&i._matchedConfig?i._matchedConfig:t.entities.find(t=>"string"==typeof t&&t===e||"object"==typeof t&&t.entity===e);const o=function(e,t,n,i){const r=i?.get(e),a="string"==typeof n?void 0:n?.accent_color;if(Ri(a)){if(r)return r}else if(a)return a;return Ri(t.accent_color)?r??jn.accent_color:t.accent_color||jn.accent_color}(e,t,a,r);return void 0===n||0===n||isNaN(n)?o:it(o,n)}function Qd(e,t,n){if(!e)return;if(n&&n._matchedConfig)return n._matchedConfig.label;const i=t.entities.find(t=>"string"==typeof t&&t===e||"object"==typeof t&&t.entity===e);return i&&"string"!=typeof i?i.label:void 0}function ec(e,t,n,i){const r=Qd(e,t,n),a=Le(r),o=Ne(r);if(!a&&!o)return r;const s=ic(e,"label_type",t,n);return ot(s)&&s!==(a?"icon":"image")?r:o?function(e,t){if(!e)return;const n=t?.states?.[e]?.attributes?.entity_picture;return"string"==typeof n&&""!==n?n:void 0}(r,i):function(e,t){if(!e)return;const n=t?.states?.[e]?.attributes?.icon;return"string"==typeof n&&""!==n?n:void 0}(e,i)}function tc(e,t,n,i){const r=Qd(e,t,n);if(!r||!Ne(r))return"";const a=i?.states?.[r]?.attributes?.friendly_name;return"string"==typeof a?a.trim():""}function nc(e,t,n){const i=e._mergedFrom;if(!i||i.length<2)return;const r=[],a=new Set;for(const o of i){const i={...e,_entityId:o.entityId,_matchedConfig:o.config},s=ec(o.entityId,t,i,n);s&&(a.has(s)||(a.add(s),r.push({value:s,iconColor:ic(o.entityId,"label_icon_color",t,i),type:ic(o.entityId,"label_type",t,i),alt:tc(o.entityId,t,i,n)})))}return r.length>1?r:void 0}function ic(e,t,n,i){if(!e)return;if(i&&i._matchedConfig)return i._matchedConfig[t];const r=n.entities.find(t=>"string"==typeof t&&t===e||"object"==typeof t&&t.entity===e);return r&&"string"!=typeof r?r[t]:void 0}function rc(e){if(!e||e._isEmptyDay)return!1;const t=new Date;if(!e.start.dateTime)return!1;const n=e.start.dateTime?new Date(e.start.dateTime):null,i=e.end.dateTime?new Date(e.end.dateTime):null;return!(!n||!i)&&t>=n&&t<i}function ac(e){const t=function(e){return e._isEmptyDay?null:e.start.dateTime&&e.end.dateTime?[new Date(e.start.dateTime),new Date(e.end.dateTime)]:e._splitFromTimedEvent&&e.start.date&&e.end.date?[Zo(e.start.date),Zo(e.end.date)]:null}(e);if(!t)return null;const n=new Date;if(!(n>=t[0]&&n<t[1]))return null;const i=function(e){const t=e._gridSource??(e._splitFromTimedEvent?{start:e._sourceStart,end:e._sourceEnd}:null),n=t?.start?.dateTime,i=t?.end?.dateTime;return n&&i?[new Date(n),new Date(i)]:null}(e),[r,a]=i&&i[1].getTime()>i[0].getTime()?i:t,o=a.getTime()-r.getTime(),s=n.getTime()-r.getTime();return Math.min(100,Math.max(0,Math.floor(s/o*100)))}function oc(e){return null!==os(e._sourceStart??e.start,e._sourceEnd??e.end)}function sc(e,t){const n=os(e._sourceStart??e.start,e._sourceEnd??e.end);if(!n)return null;const i=as(n.first,t)+1;return{day:i>=1&&i<=n.days?i:null,days:n.days}}async function lc(e,t,n,i,r=!1){const a=Md(t),o=`start=${n.start.toISOString()}&end=${n.end.toISOString()}`,s=r?function(e,t,n){const i=Zl(e);if(!i)return null;const r=Ql(i);for(const e of t){const t=r.subscriptions.get(ed(e,n));"refused"===t?.state&&id(r,t)}const a=t.flatMap(t=>od(e,t,n)??[]);return 0===a.length?null:e=>{for(const t of a)t(e)}}(e,a,n):null,l=await Promise.all(a.map(async t=>{const i=`calendars/${t}?${o}`;try{const r=s?await async function(e,t,n){const i=ad(e,t,n);if(!i)return;const{subscription:r,release:a}=i;try{return("pending"===r.state||r.reconnecting)&&await new Promise(e=>{const t=setTimeout(n,3e4);function n(){clearTimeout(t),r.waiters.delete(n),e()}r.waiters.add(n)}),"live"!==r.state||r.closed||r.reconnecting?void 0:r.events}finally{a(5e3)}}(e,t,n):void 0;Mt(r?`Using live events for ${t}`:`Fetching calendar events with path: ${i}`);const a=r??await function(e,t,n){let i;const r=new Promise((e,t)=>{i=setTimeout(()=>t(new Error(n)),3e4)});return Promise.race([e,r]).finally(()=>clearTimeout(i))}(e.callApi("GET",i),0,`${t} did not answer within 30s`);return a&&Array.isArray(a)?{entityId:t,events:a.map(e=>({...e,_entityId:t}))}:(Tt(`Invalid response for ${t}`),{entityId:t,events:null})}catch(e){return $t(`Failed to fetch events for ${t}:`,e),{entityId:t,events:null}}}).map(e=>e.then(e=>(i?.(e.entityId,e.events),e)))).finally(()=>s?.(5e3)),d=[],c=[];for(const e of l)e.events?d.push(...e.events):c.push(e.entityId);return{events:d,failedEntities:c}}function dc(e,t,n,i=new Date){let r;const a=()=>new Date(i.getFullYear(),i.getMonth(),i.getDate()),o=null==t?"":String(t);if(""!==o.trim())try{const e=o.trim(),t=function(e,t,n){const i=String(e).replace(/\s+/g,"").toLowerCase();if(""===i)return{kind:"nomatch"};const r=He(i),a=r[0],o=r.slice(1);let s;if("today"===a)s=Re(n);else if(a===Fe)s=function(e,t){return je(e,(t%7+7)%7)}(n,t);else if(a in Ie)s=ze(Re(n),Ie[a]);else{if(""!==a)return{kind:"nomatch"};s=Re(n)}if(o.length>8)return{kind:"error",message:"too many operators (maximum 8)"};for(const e of o){const t="-"===e[0]?-1:1,n=e.slice(1);if(""===n)return{kind:"error",message:`dangling "${e[0]}" with no value`};if(n in Ie){const e=Ie[n];s=t>0?ze(s,e):je(s,e);continue}const i=n.match(/^(\d+)w$/);if(i){s=Oe(s,t*parseInt(i[1],10)*7);continue}const r=n.match(/^(\d+)$/);if(!r)return{kind:"error",message:`unrecognized operand "${n}"`};s=Oe(s,t*parseInt(r[1],10))}return{kind:"ok",date:s}}(e,n,i);if("ok"===t.kind)r=t.date,isNaN(r.getTime())?(Tt(`start_date "${e}" resolved outside the supported date range. Falling back to today.`),r=a()):Mt(`Resolved start_date "${e}" to ${Qo(r)}`);else if("error"===t.kind)Tt(`Invalid start_date "${e}": ${t.message}. Falling back to today.`),r=a();else if(e.includes("T"))r=new Date(e),isNaN(r.getTime())&&(Tt(`Invalid ISO date: ${e}, falling back to today`),r=a());else{const[t,n,i]=e.split("-").map(Number);t&&n&&i&&n>=1&&n<=12&&i>=1&&i<=31?(r=new Date(t,n-1,i),r.getFullYear()===t&&r.getMonth()===n-1&&r.getDate()===i||(Tt(`Impossible date: ${e}, falling back to today`),r=a())):(Tt(`Malformed date: ${e}, falling back to today`),r=a())}}catch(e){Tt(`Error parsing date: ${o}, falling back to today`,e),r=a()}else r=a();r.setHours(0,0,0,0);const s=new Date(r),l=parseInt(e.toString())||3;return s.setDate(r.getDate()+l),{start:r,end:s}}function cc(e){const t=new Date,n=new Date(t.getFullYear(),t.getMonth(),t.getDate()+7,12);return dc(1,e,1,t).start.getTime()!==dc(1,e,1,n).start.getTime()}function uc(e){return[...new Set([...Object.keys(e.lastSuccess??{}),...e.failedEntities??[],...e.events.flatMap(e=>e._entityId?[e._entityId]:[])])]}function hc(e){try{const t=localStorage.getItem(e);if(!t)return null;const n=JSON.parse(t);if(!function(e){if("object"!=typeof e||null===e||Array.isArray(e))return!1;const t=e;return!("number"!=typeof t.timestamp||!Number.isFinite(t.timestamp))&&!!Array.isArray(t.events)&&t.events.every(e=>"object"==typeof e&&null!==e&&!Array.isArray(e))}(n))return localStorage.removeItem(e),Tt(`Malformed cache entry removed for ${e}`),null;const i=864e5;return Date.now()-n.timestamp>=i?(localStorage.removeItem(e),Mt(`Cache older than 24h removed for ${e}`),null):n}catch(t){Tt("Cache error:",t);try{localStorage.removeItem(e)}catch{}return null}}function mc(e){return 60*(e?.refresh_interval||30)*1e3}function pc(e,t){if(e.start_date&&""!==String(e.start_date).trim())return dc(e.days_to_show,e.start_date,t).start;const n=new Date;return new Date(n.getFullYear(),n.getMonth(),n.getDate())}function fc(e,t,n){let i=function(e,t,n){const i=_s(t);return"iso"===i?ps(e):"simple"===i?function(e,t=0){const n=Date.UTC(e.getFullYear(),e.getMonth(),e.getDate()),i=Date.UTC(e.getFullYear(),0,1),r=Math.round((n-i)/864e5),a=(new Date(i).getUTCDay()-t+7)%7;return Math.ceil((r+a+1)/7)}(e,n):null}(e,t.show_week_numbers,n);if("iso"===_s(t.show_week_numbers)&&0===n&&0===e.getDay()){const t=new Date(e);t.setDate(t.getDate()+1),i=ps(t)}return i}function gc(e){return new Date(e.getFullYear(),e.getMonth(),e.getDate())}function vc(e,t){return new Date(e.getFullYear(),e.getMonth(),e.getDate()+t)}function _c(e){return Qo(e)}function yc(e){return Zo(e)}function wc(e,t){const n=Math.max(1,Math.floor(e)||1);return t>0&&t<n?t:n}function bc(e,t=!1){return t?vc(e.start,e.days-1):gc(e.start)}function xc(e,t){const n=as(e.start,gc(t));return n>=0&&n<e.days}const kc=Qe();function $c(e,t,n){const i=`${e}|${t?"y":""}|${n?"w":""}`;let r=kc.get(i);return r||(r=new Intl.DateTimeFormat(Je(e),{...n?{weekday:"short"}:{},month:"short",day:"numeric",...t?{year:"numeric"}:{}}),kc.set(i,r)),r}function Tc(e,t,n){const i=gc(e.start),r=vc(i,Math.max(1,e.days)-1),a=n.getFullYear();if(e.days<=1)return $c(t,i.getFullYear()!==a,!0).format(i);if(i.getFullYear()===r.getFullYear()){const e=$c(t,i.getFullYear()!==a,!1),n=Mc($c(t,!1,!1));return"function"==typeof e.formatRange?e.formatRange(i,r):`${e.format(i)}${n}${e.format(r)}`}const o=r.getFullYear()!==function(e){const t=e.getFullYear();return e.getTime()-new Date(t,0,1).getTime()<=new Date(t+1,0,1).getTime()-e.getTime()?t:t+1}(n),s=$c(t,!1,!1),l=$c(t,o,!1);return`${s.format(i)}${Mc(s)}${l.format(r)}`}const Sc=new WeakMap;function Mc(e){let t=Sc.get(e);if(void 0===t){const n="function"==typeof e.formatRangeToParts?e.formatRangeToParts(new Date(2e3,0,31),new Date(2e3,1,1)):[],i=n.map(e=>e.source).lastIndexOf("startRange"),r=n.findIndex(e=>"endRange"===e.source),a=n.map(e=>e.source).lastIndexOf("endRange"),o=(e,t)=>n.slice(e,t).map(e=>e.value).join(""),s=i>=0&&r>i?o(i+1,r):"",l=a>=0?o(a+1,n.length):"";t=(l&&s.startsWith(l)?s.slice(l.length):s)||" – ",Sc.set(e,t)}return t}const Dc=/^\p{L}+/u;function Cc(e,t,n="long"){const i=function(e,t){const n=`${e}|month|${t}`;let i=kc.get(n);return i||(i=new Intl.DateTimeFormat(Je(e),{month:t,year:"numeric"}),kc.set(n,i)),i}(t,n),r=i.formatToParts(e);let a=i.format(e);if("month"===r[0]?.type){const e=i.resolvedOptions().locale;a=a.charAt(0).toLocaleUpperCase(e)+a.slice(1)}if(r.reduce((e,t)=>e+t.value.length,0)!==a.length)return[{text:a,month:!1}];const o=[],s=(e,t)=>{if(!e)return;const n=o[o.length-1];n&&n.month===t?n.text+=e:o.push({text:e,month:t})};let l=0;return r.forEach((e,t)=>{let n=a.slice(l,l+e.value.length);l+=e.value.length;const i=r[t-1];if("literal"===e.type&&"month"===i?.type&&/^\d+$/.test(i.value)){const e=Dc.exec(n)?.[0]??"";s(e,!0),n=n.slice(e.length)}s(n,"month"===e.type)}),o}const Ac=Qe();function Ec(e,t="long"){const n=`${e}|${t}`;let i=Ac.get(n);return i||(i=Array.from({length:12},(n,i)=>Cc(new Date(2e3,i,1),e,t)),Ac.set(n,i)),i}function Lc(e,t){return $c(t,!1,!0).format(e)}const Pc=Qe();function Nc(e){let t=Pc.get(e);if(void 0===t){const n=new Intl.RelativeTimeFormat(Je(e),{numeric:"auto"}),i=n.format(0,"day");t=i.charAt(0).toLocaleUpperCase(n.resolvedOptions().locale)+i.slice(1),Pc.set(e,t)}return t}function Ic(e,t,n,i=!1){return xc(e,n)?Nc(t):Tc({start:bc(e,i),days:1},t,n)}const Fc=/[\u0300-\u036f\u1ab0-\u1aff\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f]/g;function Rc(e,t){const n=e.getFullYear()+t,i=e.getMonth(),r=new Date(n,i+1,0).getDate();return new Date(n,i,Math.min(e.getDate(),r))}function Oc(e){const t=gc(e),n=Rc(t,-1),i=vc(Rc(t,1),1);return{start:n,end:i,days:as(n,i),key:Qo(n)}}function zc(e){if(e?.dateTime){const t=new Date(e.dateTime);return isNaN(t.getTime())?null:t}return e?.date?Zo(e.date):null}const jc=new Map;function Hc(e,t){return Wc(e.toLocaleLowerCase(t),t).normalize("NFD").replace(Fc,"").replace(/ς/g,"σ")}function Wc(e,t){return void 0!==t&&/^tr\b/i.test(t)?e.replace(/ı/g,"i"):e}function Bc(e,t){const n=function(e){if(!jc.has(e)){let t;try{t=Intl.getCanonicalLocales(e)[0]}catch{t=void 0}jc.set(e,t)}return jc.get(e)}(t);if(/^[\t\n\r\x20-\x7e]*$/.test(e))return{text:Wc(e.toLocaleLowerCase(n),n)};let i="";const r=[],a=[];for(let t=0;t<e.length;){const o=(e.codePointAt(t)??0)>65535?2:1,s=Hc(e.slice(t,t+o),n);for(let e=0;e<s.length;e+=1)r.push(t),a.push(t+o);for(let e=a.length-1;""===s&&e>=0&&a[e]===t;e-=1)a[e]=t+o;i+=s,t+=o}return{text:i,map:{from:r,to:a}}}function qc(e,t){if(!t)return;const n=e.text.indexOf(t);if(n<0)return;const i=n+t.length-1;return e.map?[e.map.from[n],e.map.to[i]]:[n,i+1]}function Uc(e){const t=e._source?.start??e._gridSource?.start??e._sourceStart??e.start;if(t?.dateTime){const e=Date.parse(t.dateTime);return isNaN(e)?t.dateTime:new Date(e).toISOString()}return t?.date??""}function Vc(e){const t=e._source;return{entityId:e._entityId??"",uid:t?.uid||void 0,recurrenceId:t?.recurrence_id||void 0,start:Uc(e),summary:t?.summary??e.summary??""}}function Gc(e,t){if(e._isEmptyDay||e._entityId!==t.entityId)return!1;if(Uc(e)!==t.start)return!1;const n=e._source;return t.uid?n?.uid===t.uid&&(n?.recurrence_id||void 0)===t.recurrenceId:!n?.uid&&(n?.summary??e.summary??"")===t.summary}function Kc(e){return[...new Set(e.map(e=>"string"==typeof e?e:e.entity))]}class Yc{constructor(e,t){this._host=e,this._events=t,this._load=null,this._panel=null}get isOpen(){return null!==this._panel}prepare(e=Date.now()){const t=this._host(),n=t.hass;if(!n)return;const i=this._load;i&&this._current(i,t,e)?i.failed.size>0&&0===i.pending.size&&this._fetch(i,[...i.failed],n,t.config):this._start(t,n,e)}wordsChanged(){this._panel?.changed()}visibilityChanged(){this._panel?.changed()}calendarsChanged(e=Date.now()){const t=this._load;if(!this._panel||!t)return;const n=this._host();n.hass&&!this._current(t,n,e)&&(Dt("Search: a calendar changed while the panel is open; loading the year again"),this._start(n,n.hass,e),this._panel.changed())}_current(e,t,n){const i=Kc(t.config.entities);return e.window.key===Oc(new Date(n)).key&&e.ids===i.join("\0")&&e.writeGeneration===vd()&&e.liveChanges===Xl(i)&&n-e.startedAt<mc(t.config)}_start(e,t,n){const i=Kc(e.config.entities),r={window:Oc(new Date(n)),ids:i.join("\0"),startedAt:n,writeGeneration:vd(),liveChanges:Xl(i),answered:new Map,failed:new Set,pending:new Set,version:0};this._load=r,this._rows=void 0,this._fetch(r,i,t,e.config)}_fetch(e,t,n,i){for(const n of t)e.pending.add(n),e.failed.delete(n);const r=i.entities.map(e=>"string"==typeof e?{entity:e}:e).filter(e=>t.includes(e.entity));Dt(`Search: loading ${t.length} calendar(s) from ${e.window.key} for ${e.window.days} days`),lc(n,r,e.window,(t,n)=>{this._load===e&&(e.pending.delete(t),n?e.answered.set(t,n):e.failed.add(t),e.version+=1,this._panel?.changed())})}close(){this._panel?.close()}get loading(){return(this._load?.pending.size??0)>0}get failed(){const e=this._host();return[...this._load?.failed??[]].filter(t=>!e.visibility.calendars.has(t)).map(t=>e.failedNameOf(t))}find(e){const t=this._host(),n=Date.now();return function(e,t,n,i,r=200){const a=Bc(t.trim(),n).text;if(!a)return{term:t,total:0,groups:[]};const o=[],s=[];for(const t of e){const e=qc(t.folded.title,a),n=qc(t.folded.location,a);(e||n||t.folded.description.includes(a))&&(t.end>i?o:s).push({row:t,title:e,location:n})}o.sort((e,t)=>e.row.start-t.row.start||e.row.end-t.row.end),s.sort((e,t)=>t.row.start-e.row.start||t.row.end-e.row.end);const l=[];return[...o,...s].slice(0,Math.max(0,r)).forEach((e,t)=>{const n=t>=o.length,i=l[l.length-1];i&&i.key===e.row.monthKey&&i.past===n?i.hits.push(e):l.push({key:e.row.monthKey,past:n,label:e.row.month,hits:[e]})}),{term:t,total:o.length+s.length,groups:l}}(this._rowsFor(t,n),e,t.language,n)}attach(e){return this._panel=e,()=>{this._panel===e&&(this._panel=null),this._events.gone()}}pick(e){const t=this._rows?.rows.find(t=>t.id===e);t&&this._events.picked(t)}_rowsFor(e,t){const n=this._load,i=Qo(new Date(t)),r=[e.held,n,n?.version,e.config,e.viewConfig,e.view,e.language,e.hidden,e.visibility,e.today,e.hass?.locale,i,Ze],a=this._rows;if(a&&a.key.every((e,t)=>e===r[t]))return a.rows;const o=n?[...n.answered.values()].flat():[],s=[...e.held.filter(e=>{return t=e._entityId,!(null!==n&&(n.answered.has(t??"")||n.failed.has(t??"")));var t}),...o.length>0?Bd(o,e.config):[]].filter(t=>!e.hidden.has(t._entityId??"")&&!zn(t,e.visibility));let l=[];if(s.length>0){const r=n?.window??Oc(new Date(t)),a=function(e,t,n){const i={start_date:t.key,days_to_show:t.days,show_past_events:!0,show_empty_days:!1,show_empty_today:!1,event_order:"earliest_first",skip_first_events:0},r={...e,...i},a=Hr[n]?.blockKey;if(a){const t=e[a];r[a]={...t&&"object"==typeof t?t:{},...i}}return r}(e.viewConfig,r,e.view),o=function(e,t,n){if("grid"!==n)return e;const i=wl(wr(t,"start_time"),wr(t,"end_time"));return e.map(e=>({...e,events:e.events.filter(e=>{if(!e.start.dateTime||e._gridBanner)return!0;const t=Ul(e);return null!==t&&Sl(t.startMin,t.endMin,i)})}))}(Hd(s,a,!0,e.language,e.view,e.hass),a,e.view),d=this._describer(e,i);l=function(e){const t=new Map;for(const n of e){const e=t.get(n.id)??0;t.set(n.id,e+1),e>0&&(n.id=`${n.id}#${e}`)}return e}(function(e){const t=new WeakMap,n=new Set,i=[];for(const r of e)for(const e of r.events){if(e._isEmptyDay)continue;const r=e._gridSource?.start??e._sourceStart??e.start,a=e._gridSource?.end??e._sourceEnd??e.end,o=zc(r),s=zc(a);if(o&&s){if(e._isMultiDaySegment||e._gridSource){const i=e._source??e._gridSource;if(i){const n=t.get(i)??new Set;if(n.has(e._matchedConfig))continue;n.add(e._matchedConfig),t.set(i,n)}else{const t=JSON.stringify([e._entityId,o.getTime(),s.getTime(),e.summary,e.location,e.description]);if(n.has(t))continue;n.add(t)}}i.push({event:e,startPoint:r,endPoint:a,start:o,end:s})}}return i}(o).map(d))}return this._rows={key:r,rows:l},l}_describer(e,t){const n=e.language,i=new Map,r=new Map,a=new Map,o=(e,t,n)=>(e.has(t)||e.set(t,n()),e.get(t));return({event:s,startPoint:l,endPoint:d,start:c,end:u})=>{const h=s._entityId??"",m=Qo(c),p=s.summary??"",f=s.location??"";return{id:JSON.stringify([h,c.getTime(),u.getTime(),p,s._source?.uid??null,s._source?.recurrence_id??null]),entityId:h,title:p,location:f,folded:{title:Bc(p,n),location:Bc(f,n),description:Bc(s.description??"",n).text},start:c.getTime(),end:u.getTime(),day:m,monthKey:m.slice(0,7),month:o(a,m.slice(0,7),()=>function(e,t,n="long"){return Cc(e,t,n).map(e=>e.text).join("")}(c,n)),dayText:m===t?e.today??Nc(n):Lc(c,n),timeText:zo({...s,start:l,end:d},e.viewConfig,n,e.hass),color:o(i,s._matchedConfig??h,()=>e.colorOf(s)),calendar:o(r,h,()=>e.nameOf(h)),target:Vc(s)}}}}function Jc(e,t,n){if(n&&!e._isEmptyDay)return{event:e,color:t}}function Xc(e){const t=new Date(e),n=e=>String(e).padStart(2,"0");return`calendar-card-day-${t.getFullYear()}-${n(t.getMonth()+1)}-${n(t.getDate())}`}function Zc(e){return e?.calendarCardEventTap}function Qc(e,t){for(const n of e){if(n===t)return;const e=Zc(n);if(e)return{element:n,target:e}}}const eu=Object.freeze({kind:"covered"}),tu=Object.freeze({kind:"columns",among:"children"}),nu=Object.freeze({kind:"columns",among:"siblings",allDay:!0});function iu(e){return{kind:"day",timestamp:e}}function ru(e){return e?.calendarCardDaySlot}function au(e,t,n,i){const r=Se.ADD_SLOT_MINUTES,a=i-n,o=e.height>0&&a>0?Math.min(i-1,n+Math.min(1,Math.max(0,(t-e.top)/e.height))*a):n;return Math.min(1440-r,Math.max(0,Math.floor(o/r)*r))}function ou(e,t,n){let i;for(const r of e){const e=ru(r);if(!e||"day"!==e.kind&&"time"!==e.kind)continue;const a=r.getBoundingClientRect();if(!(t.x<a.left||t.x>=a.right||n&&t.y<a.top)){if("day"===e.kind)return{element:r,timestamp:e.timestamp};i??={element:r,timestamp:e.timestamp}}}return i}function su(e,t,n,i=!1){for(const r of e){if(r===t)return;const e=ru(r);if(!i&&("covered"===e?.kind||Zc(r)))return;if(!e||"covered"===e.kind)continue;const a=r;if("day"===e.kind)return{element:a,timestamp:e.timestamp};if("time"===e.kind){const t=a.getBoundingClientRect();return{element:a,timestamp:e.timestamp,minute:au(t,n.y,e.startMin,e.endMin),band:{startMin:e.startMin,endMin:e.endMin}}}const o="children"===e.among?a:a.parentElement;if(!o)return;const s=ou(o.children,n,"children"===e.among);return s&&e.allDay?{...s,allDay:!0}:s}}function lu(e,t,n){const i=n.endMin-n.startMin;if(!(i>0))return{topPct:0,heightPct:0};const r=Math.min(n.endMin,Math.max(n.startMin,e)),a=Math.min(n.endMin,Math.max(n.startMin,t));return{topPct:(r-n.startMin)/i*100,heightPct:Math.max(0,a-r)/i*100}}function du(e,t){let n;for(const i of e){const e=ru(i);if(!e||"day"!==e.kind&&"time"!==e.kind)continue;const r=i.getBoundingClientRect(),a=t<r.left?r.left-t:t>=r.right?t-r.right+1:0;(!n||a<n.distance)&&(n={element:i,distance:a,slot:e})}if(!n)return;const{element:i,slot:r}=n;return"time"===r.kind?{element:i,timestamp:r.timestamp,band:{startMin:r.startMin,endMin:r.endMin}}:"day"===r.kind?{element:i,timestamp:r.timestamp}:void 0}function cu(e){return e?.calendarCardDayAdd}var uu="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z",hu="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z",mu="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z",pu="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z",fu=Object.defineProperty,gu=(e,t,n,i)=>{for(var r,a=void 0,o=e.length-1;o>=0;o--)(r=e[o])&&(a=r(t,n,a)||a);return a&&fu(t,n,a),a};const vu=12,_u=24,yu=10,wu="cubic-bezier(0.37, 0, 0.63, 1)";function bu(e,t,n,i,r){const a=e.arrow,o="bottom"===a?.side?e.top+t-n:e.top,s=Math.max(i.top+vu,Math.min(o,i.bottom-vu-n));if(!a||"top"===a.side||"bottom"===a.side||void 0===r)return{left:e.left,top:s,arrow:a};const l=Math.min(Math.max(_u,r-s),n-_u);return{left:e.left,top:s,arrow:{side:a.side,at:l}}}function xu(e,t){return e?.left===t?.left&&e?.top===t?.top&&e?.arrow?.side===t?.arrow?.side&&e?.arrow?.at===t?.arrow?.at}function ku(e){return function(e,t){if(!t)return{top:0,bottom:e};const n=t.offsetTop<1?0:Math.min(t.offsetTop,e),i=t.offsetTop+t.height;return{top:n,bottom:e-i<1?e:Math.max(n,i)}}(window.innerHeight,e?window.visualViewport:void 0)}function $u(e){return"left"===e.side||"right"===e.side?`${e.side} ${e.at}px`:`${e.at}px ${e.side}`}function Tu(e,t,n,i="right"){const r=(e.left+e.right)/2,a="right"===i?r-32:r+32-t,o=Math.min(Math.max(vu,a),Math.max(vu,n-t-vu));return{left:o,at:Math.min(Math.max(_u,r-o),t-_u)}}function Su(e,t,n,i){if(!e)return{left:Math.max(vu,(n.width-i)/2),top:Math.max(vu,(n.height-t)/2)};const r=e.rect??{left:e.x,right:e.x,top:e.y,bottom:e.y};return e.below?function(e,t,n,i){const{width:r,height:a}=n,{left:o,at:s}=Tu(e,i,r),l=e.bottom+yu,d=e.top-yu-t;return l+t>a-vu&&d>=vu?{left:o,top:d,arrow:{side:"bottom",at:s}}:{left:o,top:Math.max(vu,Math.min(l,a-t-vu)),arrow:{side:"top",at:s}}}(r,t,n,i):function(e,t,n,i){const{width:r,height:a}=n,o=(e.top+e.bottom)/2;let s="left",l=e.right+10;l+i>r-vu&&(s="right",l=e.left-10-i),l<vu&&(s=void 0,l=Math.max(vu,(r-i)/2));const d=Math.min(Math.max(vu,o-t/2),a-t-vu),c=Math.min(Math.max(_u,o-d),t-_u);return{left:l,top:d,arrow:s?{side:s,at:c}:void 0}}(r,t,n,i)}function Mu(e,t,n=0){return e?n>0?`bottom:${n}px;`:"":t?`left:${t.left}px;top:${t.top}px;`:"visibility:hidden;"}function Du(e){return e?B`<span class="grabber" aria-hidden="true"></span>`:V}function Cu(e){return e?B`<span
        class="arrow ${e.side}"
        style="${"left"===e.side||"right"===e.side?"top":"left"}:${e.at}px"
        ><span class="beak"
          ><span class="glass"></span
          ><svg viewBox="0 0 15 7" aria-hidden="true">
            <path d=${"M0 6.75C3.15 6.75 3.75 0.25 7.5 0.25C11.25 0.25 11.85 6.75 15 6.75"}></path></svg></span
      ></span>`:V}const Au=a`
  :host {
    font-family:
      -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  dialog {
    inset: auto;
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    overflow: visible;
    max-width: none;
    max-height: none;
    position: fixed;
    color: var(--text);
  }
  dialog::backdrop {
    background: transparent;
  }
  dialog.sheet {
    inset: auto 0 0 0;
    width: 100%;
  }
  dialog.popover[open][data-placed] > .panel {
    animation:
      pop-grow 230ms cubic-bezier(0.33, 1, 0.68, 1),
      pop-fade 180ms cubic-bezier(0, 0, 0.58, 1);
  }
  dialog.popover[open][data-placed] > .arrow {
    animation:
      pop-grow 230ms cubic-bezier(0.33, 1, 0.68, 1),
      pop-fade 180ms cubic-bezier(0, 0, 0.58, 1);
  }
  dialog.sheet[open][data-placed] > .panel {
    animation: sheet-in 220ms cubic-bezier(0.2, 0.9, 0.3, 1);
  }
  @keyframes pop-grow {
    from {
      transform: scale(0.1);
    }
  }
  @keyframes pop-fade {
    from {
      opacity: 0;
    }
  }
  @keyframes sheet-in {
    from {
      transform: translateY(24px);
      opacity: 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    dialog.popover[open][data-placed] > .panel,
    dialog.popover[open][data-placed] > .arrow,
    dialog.sheet[open][data-placed] > .panel {
      animation: none;
    }
  }
  dialog.sheet::backdrop {
    background: rgba(0, 0, 0, 0.25);
  }
  .light {
    --pop-bg: rgba(246, 246, 246, 0.82);
    --pop-edge: rgba(0, 0, 0, 0.12);
    --pop-outline: rgba(0, 0, 0, 0.22);
    --cell: rgba(0, 0, 0, 0.045);
    --cell-hover: rgba(0, 0, 0, 0.07);
    --text: rgba(0, 0, 0, 0.86);
    --dim: rgba(0, 0, 0, 0.36);
    --button: rgba(0, 0, 0, 0.07);
    --accent: #007aff;
    --danger: #ff3b30;
    color-scheme: light;
  }
  .dark {
    --pop-bg: rgba(44, 44, 46, 0.78);
    --pop-edge: rgba(255, 255, 255, 0.14);
    --pop-outline: rgba(255, 255, 255, 0.2);
    --cell: rgba(255, 255, 255, 0.075);
    --cell-hover: rgba(255, 255, 255, 0.11);
    --text: rgba(255, 255, 255, 0.92);
    --dim: rgba(255, 255, 255, 0.42);
    --button: rgba(255, 255, 255, 0.13);
    --accent: #0a84ff;
    --danger: #ff453a;
    color-scheme: dark;
  }
  .panel {
    position: relative;
    box-sizing: border-box;
    width: 340px;
    max-height: calc(100vh - 24px);
    overflow-y: auto;
    --panel-end: 12px;
    padding: 14px 14px var(--panel-end);
    display: flex;
    flex-direction: column;
    gap: 9px;
    background: var(--pop-bg);
    -webkit-backdrop-filter: blur(28px) saturate(170%);
    backdrop-filter: blur(28px) saturate(170%);
    border-radius: 16px;
    box-shadow:
      inset 0 0 0 0.5px var(--pop-outline),
      0 18px 50px rgba(0, 0, 0, 0.35);
    font-size: 15px;
    line-height: 1.35;
  }
  .sheet .panel {
    width: 100%;
    max-height: 85vh;
    border-radius: 18px 18px 0 0;
    --panel-end: calc(16px + env(safe-area-inset-bottom));
  }
  .sheet.lifted .panel {
    --panel-end: 16px;
  }
  .grabber {
    align-self: center;
    width: 36px;
    height: 5px;
    border-radius: 3px;
    background: var(--dim);
  }
  .arrow {
    position: absolute;
    width: 0;
    height: 0;
    transform-origin: 0 0;
  }
  .arrow.top {
    top: 0;
  }
  .arrow.bottom {
    top: 100%;
  }
  .arrow.left {
    left: 0;
  }
  .arrow.right {
    left: 100%;
  }
  .beak {
    position: absolute;
    left: 0;
    top: 0;
    transform-origin: 0 0;
  }
  .arrow.right .beak {
    transform: rotate(90deg);
  }
  .arrow.bottom .beak {
    transform: rotate(180deg);
  }
  .arrow.left .beak {
    transform: rotate(-90deg);
  }
  .beak > * {
    position: absolute;
    left: -7.5px;
    top: -6.5px;
    width: 15px;
    height: 7px;
  }
  .glass {
    background: var(--pop-bg);
    -webkit-backdrop-filter: blur(28px) saturate(170%);
    backdrop-filter: blur(28px) saturate(170%);
    clip-path: path('M0 6.75C3.15 6.75 3.75 0.25 7.5 0.25C11.25 0.25 11.85 6.75 15 6.75L15 7L0 7Z');
  }
  .beak svg {
    overflow: visible;
  }
  .beak path {
    fill: none;
    stroke: var(--pop-outline);
    stroke-width: 0.5;
  }
  .reveal:not(:focus-visible),
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
  }
  .spinner {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 2px solid var(--button);
    border-top-color: var(--accent);
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .spinner {
      animation: none;
    }
  }
`,Eu=a`
  .group {
    display: grid;
    grid-template-columns: 5px minmax(0, 1fr);
    gap: 0 10px;
  }
  .bar {
    border-radius: 3px;
    background: var(--event-color);
  }
  .stack {
    display: flex;
    flex-direction: column;
    gap: 9px;
    min-width: 0;
  }
  .cell {
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    padding: 10px 14px;
    border: 0;
    border-radius: 11px;
    background: var(--cell);
    color: var(--text);
    font: inherit;
    text-align: start;
    overflow-wrap: anywhere;
  }
  input.cell,
  textarea.cell,
  button.cell,
  .cell[tabindex] {
    cursor: text;
  }
  button.cell {
    cursor: pointer;
  }
  .cell:hover {
    background: var(--cell-hover);
  }
  .cell:focus-visible,
  input:focus-visible,
  select:focus-visible,
  textarea:focus-visible,
  button:focus-visible,
  a:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--accent) 55%, transparent);
    outline-offset: 0;
  }
  @supports not (color: color-mix(in srgb, red, blue)) {
    .cell:focus-visible,
    input:focus-visible,
    select:focus-visible,
    textarea:focus-visible,
    button:focus-visible,
    a:focus-visible {
      outline: 2px solid var(--accent);
    }
  }
  input.cell,
  textarea.cell {
    outline-offset: -1px;
  }
`;function Lu(e,t,n){const i=getComputedStyle(e),r=e=>"auto"===e||"scroll"===e;if(0!==n&&r(i.overflowY)){const t=e.scrollHeight-e.clientHeight;if(t>0&&(n<0?e.scrollTop>0:e.scrollTop<t-1))return!0}if(0!==t&&r(i.overflowX)){const n=e.scrollWidth-e.clientWidth,[r,a]="rtl"===i.direction?[-n,0]:[0,n];if(n>0&&(t<0?e.scrollLeft>r+1:e.scrollLeft<a-1))return!0}return!1}const Pu={" ":1,PageDown:1,End:1,ArrowDown:1,PageUp:-1,Home:-1,ArrowUp:-1},Nu=new Set(["text","search","email","url","tel","password"]),Iu=new Set(["checkbox","radio","button","submit","reset","color","file"]),Fu=/^(?:button|checkbox|switch|radio|tab|option|menuitem(?:checkbox|radio)?)$/;class Ru extends de{constructor(){super(...arguments),this._sheet=!1,this._lift=0,this._scrolls=!1,this._closing=!1,this._wantOpen=!1,this._scrollGuarded=!1,this._openedAt=0,this._backdropDown=!1,this._watchingRoom=!1,this._onWheel=e=>{e.ctrlKey||this._scrollsPanel(e,e.deltaX,e.deltaY)||e.preventDefault()},this._onTouchStart=e=>{const t=e.touches[0];this._touchAt=1===e.touches.length&&t?{x:t.clientX,y:t.clientY}:void 0},this._onTouchMove=e=>{const t=e.touches[0],n=this._touchAt;if(1!==e.touches.length||!t||!n)return;this._touchAt={x:t.clientX,y:t.clientY};const i=n.x-t.clientX,r=n.y-t.clientY;e.cancelable&&!this._scrollsPanel(e,i,r)&&e.preventDefault()},this._onPagingKey=e=>{if(e.defaultPrevented||e.isComposing||e.ctrlKey||e.metaKey||e.altKey)return;const t=Pu[e.key];if(!t)return;const n=" "===e.key&&e.shiftKey?-t:t;(function(e,t){if(!(e instanceof HTMLElement))return!1;if(e.isContentEditable)return!0;if(e instanceof HTMLTextAreaElement||e instanceof HTMLSelectElement)return!0;if(e instanceof HTMLInputElement){const n=e.type.toLowerCase();if(Nu.has(n)){if("PageDown"===t||"PageUp"===t)return!1;if("Home"!==t&&"End"!==t)return!0;const n="Home"===t?0:e.value.length;return!(e.selectionStart===n&&e.selectionEnd===n)}return!Iu.has(n)||" "===t}return" "===t&&(e instanceof HTMLButtonElement||"summary"===e.localName||Fu.test(e.getAttribute("role")??""))})(e.composedPath()[0],e.key)||this._scrollsPanel(e,0,n)||e.preventDefault()},this._onRoomChange=()=>this._keepInView(),this._onFocusMove=()=>{clearTimeout(this._focusSettling),this._focusSettling=setTimeout(this._onRoomChange,0)},this._keepKeys=e=>{1!==e.key.length||e.ctrlKey||e.altKey||e.metaKey||e.stopPropagation()}}updated(e){super.updated(e);const t=this._dialog;if(this._wantOpen&&t?.open)return this._wantOpen=!1,this._openedAt=Date.now(),this._backdropDown=!1,this._position(),void this.updateComplete.then(()=>this._focusStart());if(this._wantOpen&&t&&this.isConnected&&!t.open){this._wantOpen=!1,this._openedAt=Date.now();try{t.showModal()}catch(e){Tt(`${this._logName}: could not open`,e)}this._guardScroll(t.open),this._position(),this.updateComplete.then(()=>this._focusStart())}}disconnectedCallback(){super.disconnectedCallback(),this._guardScroll(!1),this._watchRoom(!1)}_focusStart(){const e=this._dialog;e?.open&&e.querySelector("[autofocus]")?.focus({preventScroll:!0})}_guardScroll(e){e!==this._scrollGuarded&&(this._scrollGuarded=e,e?(window.addEventListener("wheel",this._onWheel,{capture:!0,passive:!1}),window.addEventListener("touchstart",this._onTouchStart,{capture:!0,passive:!0}),window.addEventListener("touchmove",this._onTouchMove,{capture:!0,passive:!1}),window.addEventListener("keydown",this._onPagingKey,{capture:!0})):(window.removeEventListener("wheel",this._onWheel,{capture:!0}),window.removeEventListener("touchstart",this._onTouchStart,{capture:!0}),window.removeEventListener("touchmove",this._onTouchMove,{capture:!0}),window.removeEventListener("keydown",this._onPagingKey,{capture:!0}),this._touchAt=void 0))}_scrollsPanel(e,t,n){const i=this._dialog,r=e.composedPath();return!!i&&r.includes(i)&&function(e,t,n,i){for(const r of e){if(r===t)return!1;if(r instanceof Element&&Lu(r,n,i))return!0}return!1}(r,i,t,n)}get _dialog(){return this.renderRoot?.querySelector("dialog")??null}get _panel(){return this.renderRoot?.querySelector(".panel")??null}_position(){const e=window.innerWidth,t=ku(this._typing);if(this._sheet=e<600,this._watchRoom(!0),this._sheet)return this._place=void 0,this._opened=void 0,this._placedWidth=void 0,void this._keepInView();this._placedWidth=e,this._lift=0,this._placeBeside(t,e),this._measureScroll()}_placeBeside(e,t){const n=e.bottom-e.top-24,i=Math.min(this._panel?.offsetHeight??420,n),r=this._anchor,a=Su(r,i,{width:t,height:e.bottom},this._panelWidth),o=r&&!r.below?function(e){return e.rect?(e.rect.top+e.rect.bottom)/2:e.y}(r):void 0;this._opened={place:a,height:i,target:o},this._maxHeight=n,this._place=bu(a,i,i,e,o)}_keepInView(){if(!this.isConnected||!this._dialog?.open||this._closing)return;const e=window.innerWidth,t=this._placedWidth;if(e<600!==this._sheet||void 0!==t&&t!==e)return void this._placeAfresh();const n=window.innerHeight,i=ku(this._typing);if(this._sheet){const e=i.top>0||i.bottom<n;return this._lift=n-i.bottom,this._maxHeight=e?Math.min(.85*n,i.bottom-i.top-vu):void 0,void this._measureScroll()}void 0!==t&&this._panel&&(this._keepBeside(i),this._measureScroll())}_keepBeside(e){const t=this._opened,n=this._panel;if(!t||!n)return;const i=e.bottom-e.top-24;this._maxHeight=i;const r=bu(t.place,t.height,Math.min(n.offsetHeight,i),e,t.target);xu(r,this._place)||(this._place=r)}_measureScroll(){const e=this._panel;this._scrolls=!!e&&e.scrollHeight>e.clientHeight+1}_placeAfresh(){this._sheet=window.innerWidth<600,this._opened=void 0,this._placedWidth=void 0,this._lift=0,this._maxHeight=void 0,this.updateComplete.then(()=>{this.isConnected&&this._dialog?.open&&!this._closing&&this._position()})}get _typing(){const e=this.renderRoot?.activeElement;return!!e?.matches?.('textarea, input:not([type="checkbox"]):not([type="radio"]):not([type="date"]):not([type="time"]):not([type="datetime-local"])')}_watchRoom(e){if(!e){if(this._sizeWatch?.disconnect(),!this._watchingRoom)return;return this._watchingRoom=!1,this._watchedViewport?.removeEventListener("resize",this._onRoomChange),this._watchedViewport?.removeEventListener("scroll",this._onRoomChange),this._watchedViewport=void 0,window.removeEventListener("resize",this._onRoomChange),this.renderRoot?.removeEventListener("focusin",this._onFocusMove),this.renderRoot?.removeEventListener("focusout",this._onFocusMove),void clearTimeout(this._focusSettling)}if("undefined"!=typeof ResizeObserver){this._sizeWatch??=new ResizeObserver(this._onRoomChange),this._sizeWatch.disconnect();const e=this._panel;e&&this._sizeWatch.observe(e)}this._watchingRoom||(this._watchingRoom=!0,this._watchedViewport=window.visualViewport,this._watchedViewport?.addEventListener("resize",this._onRoomChange),this._watchedViewport?.addEventListener("scroll",this._onRoomChange),window.addEventListener("resize",this._onRoomChange),this.renderRoot?.addEventListener("focusin",this._onFocusMove),this.renderRoot?.addEventListener("focusout",this._onFocusMove))}get _roomStyle(){return void 0===this._maxHeight?"":`max-height:${this._maxHeight}px;`}_finish(){this._wantOpen=!1;const e=this._leave();return e.length?(this._closing=!0,this._leaving=e,Promise.race([Promise.all(e.map(e=>e.finished)),new Promise(e=>setTimeout(e,380))]).catch(()=>{}).then(()=>{this._leaving===e&&this._closeNow()})):this._closeNow(),this._fireClosed(),!0}_closeNow(){const e=this._dialog;e?.open&&e.close(),this._guardScroll(!1),this._watchRoom(!1),this._opened=void 0,this._placedWidth=void 0,this._lift=0,this._maxHeight=void 0,this._scrolls=!1,this._leaving?.forEach(e=>e.cancel()),this._leaving=void 0,this._closing=!1,this._clear()}_leave(){const e=this._dialog,t=e?.querySelector(".panel");if(!e?.open||!t||"function"!=typeof t.animate)return[];if(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)return[];const n=e=>({duration:180,easing:e,fill:"forwards"});if(this._sheet)return[t.animate([{transform:"none",opacity:1},{transform:"translateY(24px)",opacity:0}],n("ease-in"))];const i=[t.animate([{transform:"scale(1)"},{transform:"scale(0.15)"}],n(wu)),t.animate([{opacity:1},{opacity:0}],n("ease"))],r=e.querySelector(".arrow");return r&&i.push(r.animate([{transform:"scale(1)"},{transform:"scale(0.15)"}],n(wu)),r.animate([{opacity:1},{opacity:0}],n("ease"))),i}_fireClosed(){const e=this._onClosed;this._onClosed=void 0,e?.(),this.dispatchEvent(new CustomEvent("dialog-closed",{bubbles:!0,composed:!0,detail:{dialog:this.localName}}))}_isBackdropPress(e){return!(e.target!==this._dialog||!this._backdropDown)&&(this._backdropDown=!1,Date.now()-this._openedAt>=300)}}gu([me({attribute:!1})],Ru.prototype,"hass"),gu([pe()],Ru.prototype,"_sheet"),gu([pe()],Ru.prototype,"_place"),gu([pe()],Ru.prototype,"_lift"),gu([pe()],Ru.prototype,"_maxHeight"),gu([pe()],Ru.prototype,"_scrolls"),gu([pe()],Ru.prototype,"_closing");const Ou="calendar-card-pro-places";function zu(e){return e.trim().toLowerCase().replace(/\s+/g," ")}function ju(e,t){if(!e.radius)return 15;const n=Math.max(-85,Math.min(85,e.latitude)),i=2*e.radius/t,r=Math.floor(Math.log2(156543.034*Math.cos(n*Math.PI/180)/i));return Math.max(5,Math.min(15,r))}function Hu(e){return zu(e).normalize("NFD").replace(/[\u0300-\u036f]/g,"")}const Wu=new Set(["PPL","PPLA","PPLA2","PPLA3","PPLA4","PPLA5","PPLC","PPLG"]);function Bu(e,t,n,i){const[r,a]=e.split(","),o=Hu(r),s=n?.toUpperCase(),l="number"==typeof i?.latitude&&"number"==typeof i.longitude?{latitude:i.latitude,longitude:i.longitude}:void 0,d=e=>!!l&&function(e,t){const n=(e.latitude+t.latitude)/2*Math.PI/180,i=(t.longitude-e.longitude)*Math.cos(n)*111.32,r=110.57*(t.latitude-e.latitude);return Math.hypot(i,r)}(l,{latitude:e.latitude,longitude:e.longitude})<=100,c=t.filter(e=>{if("string"!=typeof e.name||Hu(e.name)!==o)return!1;if("string"!=typeof e.feature_code||!Wu.has(e.feature_code))return!1;if("number"!=typeof e.latitude||"number"!=typeof e.longitude)return!1;const t=Number(e.population)||0;return void 0!==a||s&&e.country_code===s||d(e)?t>=5e3:t>=1e6||"PPLC"===e.feature_code&&t>=1e5}),u=c.find(d)??c[0];if(!u)return;const h=Number(u.population)||0;return{latitude:u.latitude,longitude:u.longitude,zoom:h>=1e6?11:h>=1e5?12:13,source:"open-meteo"}}function qu(){try{const e=globalThis.localStorage?.getItem(Ou),t=e?JSON.parse(e):{};return t&&"object"==typeof t?t:{}}catch{return{}}}function Uu(e,t){try{const n=qu();n[e]=t;const i=Object.keys(n);i.length>300&&i.sort((e,t)=>n[e].at-n[t].at).slice(0,i.length-300).forEach(e=>delete n[e]),globalThis.localStorage?.setItem(Ou,JSON.stringify(n))}catch{}}const Vu=new Map;async function Gu(e,t,n){const i=function(e,t){const n=zu(e);if(n&&t?.states)for(const[e,i]of Object.entries(t.states)){if(!e.startsWith("zone."))continue;if(![String(i.attributes?.friendly_name??""),e.slice(5).replace(/_/g," ")].some(e=>e&&zu(e)===n))continue;const t=Number(i.attributes?.latitude),r=Number(i.attributes?.longitude);if(!Number.isFinite(t)||!Number.isFinite(r))continue;const a=Number(i.attributes?.radius);return a>0&&Number.isFinite(a)?{latitude:t,longitude:r,radius:a}:{latitude:t,longitude:r}}}(e,t);return i?{latitude:i.latitude,longitude:i.longitude,zoom:ju(i,n),source:"zone"}:async function(e,t,n=Date.now(),i=globalThis.fetch?.bind(globalThis)){const r=function(e){const t=e.trim().replace(/\s+/g," ");if(t.length<2||t.length>60)return;if(/[\d@/:]/.test(t))return;const n=t.split(",").map(e=>e.trim());return n.length>2||n.some(e=>!e)||n[0].split(" ").length>4?void 0:t}(e);if(!r||!i)return;const a=Hu(r),o=qu()[a];if(o&&1===o.rule&&n-o.at<o.for)return o.place;const s=Vu.get(a);if(s)return s;const l=(async()=>{try{let e;for(const n of function(e){const t=(e?.locale?.language??"en").slice(0,2).toLowerCase();let n;try{const t=e?.config?.country;n=t?new Intl.Locale(`und-${t}`).maximize().language:void 0}catch{n=void 0}return[...new Set([t,n,"en"].filter(e=>!!e))]}(t)){const a=`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(r)}&count=10&language=${encodeURIComponent(n)}&format=json`,o=await i(a);if(!o.ok)throw new Error(`Open-Meteo answered ${o.status}`);const s=await o.json(),l=Array.isArray(s?.results)?s.results:[];if(e=Bu(r,l,t?.config?.country,t?.config),e)break}return Uu(a,{at:n,place:e,for:e?2592e6:6048e5,rule:1}),e}catch{return void Uu(a,{at:n,for:36e5,rule:1})}finally{Vu.delete(a)}})();return Vu.set(a,l),l}(e,t)}let Ku;function Yu(e){return`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.trim())}`}const Ju=["MO","TU","WE","TH","FR","SA","SU"],Xu={daily:30,weekly:13,monthly:12,yearly:5},Zu=new Map([["DAILY","daily"],["WEEKLY","weekly"],["MONTHLY","monthly"],["YEARLY","yearly"]]),Qu=["FREQ","INTERVAL","COUNT","UNTIL","BYDAY","BYMONTHDAY","WKST"],eh=[1,2,3,4,-1],th=new Map([[1,"st"],[21,"st"],[31,"st"],[2,"nd"],[22,"nd"],[3,"rd"],[23,"rd"]]),nh=/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z?))?$/,ih=/^(\d{4})-(\d{2})-(\d{2})$/,rh=/^([+-]?)(\d{1,2})(MO|TU|WE|TH|FR|SA|SU)$/,ah=/^([+-]?)(\d{1,2})$/,oh=/^\d+$/;function sh(e,t,n){const i=new Date(0);return i.setUTCFullYear(e,t,n),i}function lh(e,t){return sh(e,t+1,0).getUTCDate()}function dh(e,t,n){const i=(e,t)=>String(e).padStart(t,"0");return`${i(e,4)}-${i(t,2)}-${i(n,2)}`}function ch(e,t,n){return t>=1&&t<=12&&n>=1&&n<=lh(e,t-1)}function uh(e){return Ju[(e.getDay()+6)%7]}function hh(e){if(null==e||""===e.trim())return{kind:"none"};const t=function(e){const t=function(e){const t=new Map;for(const n of e.trim().replace(/^RRULE:/i,"").split(";")){if(""===n.trim())continue;const e=n.indexOf("=");if(e<0)return;const i=n.slice(0,e).trim().toUpperCase(),r=n.slice(e+1).trim().toUpperCase();if(!r||t.has(i)||!Qu.includes(i))return;t.set(i,r)}return t}(e),n=t&&Zu.get(t.get("FREQ")??"");if(!t||!n)return;const i=t.get("INTERVAL"),r=void 0===i?1:mh(i),a=function(e){const t=e.get("COUNT"),n=e.get("UNTIL");if(void 0===t||void 0===n){if(void 0!==t){const e=mh(t);return void 0===e?void 0:{kind:"after",count:e}}if(void 0!==n){const e=function(e){const t=nh.exec(e);if(!t)return;const[n,i,r]=[Number(t[1]),Number(t[2]),Number(t[3])];if(!ch(n,i,r))return;if(void 0===t[4])return dh(n,i,r);const[a,o,s]=[Number(t[4]),Number(t[5]),Number(t[6])];if(a>23||o>59||s>60)return;if(!t[7])return dh(n,i,r);const l=sh(n,i-1,r);return l.setUTCHours(a,o,s),dh(l.getFullYear(),l.getMonth()+1,l.getDate())}(n);return void 0===e?void 0:{kind:"on",until:e}}return{kind:"never"}}}(t);if(void 0===r||!a)return;const o=t.get("BYDAY"),s=t.get("BYMONTHDAY");let l,d=[];if("weekly"===n){if(void 0!==s)return;if(void 0!==o){const e=function(e){const t=e.split(",").map(e=>e.trim());return t.every(ph)&&new Set(t).size===t.length?t:void 0}(o);if(!e)return;d=e}}else if("monthly"===n){if(void 0!==o&&void 0!==s)return;const e=o??s;if(void 0!==e&&(l=void 0!==o?function(e){const t=rh.exec(e);if(!t)return;const n=("-"===t[1]?-1:1)*Number(t[2]);return eh.includes(n)?{kind:"weekday",nth:n,weekday:t[3]}:void 0}(e):function(e){const t=ah.exec(e);if(!t)return;const n=("-"===t[1]?-1:1)*Number(t[2]);return-1===n?{kind:"last-day"}:n>=1&&n<=31?{kind:"day",day:n}:void 0}(e),!l))return}else if(void 0!==o||void 0!==s)return;const c=t.get("WKST");if(void 0!==c){if(!ph(c))return;if("weekly"===n&&r>1&&d.length>0&&"MO"!==c)return}const u={freq:n,interval:r,weekdays:d,end:a};return l&&(u.monthly=l),u}(e);return t?{kind:"rule",rule:t}:{kind:"custom",raw:e}}function mh(e){const t=Number(e);return oh.test(e)&&Number.isSafeInteger(t)&&t>=1?t:void 0}function ph(e){return Ju.includes(e)}function fh(e,t){const n={freq:e,interval:1,weekdays:"weekly"===e?[uh(t)]:[],end:{kind:"never"}};return"monthly"===e&&(n.monthly={kind:"day",day:t.getDate()}),n}function gh(e,t,n=new Date){const i=Xu[t];if("never"===e)return{kind:e};if("after"===e)return{kind:e,count:i};const[r,a,o]=[n.getFullYear(),n.getMonth(),n.getDate()];if("daily"===t||"weekly"===t){const n=sh(r,a,o+i*("weekly"===t?7:1));return{kind:e,until:dh(n.getUTCFullYear(),n.getUTCMonth()+1,n.getUTCDate())}}const s=12*r+a+i*("yearly"===t?12:1),l=Math.floor(s/12),d=s-12*l;return{kind:e,until:dh(l,d+1,Math.min(o,lh(l,d)))}}function vh(e){const t=e.getDate(),n=uh(e),i=lh(e.getFullYear(),e.getMonth()),r=t+7>i,a=[{kind:"day",day:t}];return(!r||t<=28)&&a.push({kind:"weekday",nth:Math.floor((t-1)/7)+1,weekday:n}),r&&a.push({kind:"weekday",nth:-1,weekday:n}),t===i&&a.push({kind:"last-day"}),a}function _h(e,t){const{allDay:n,start:i}=t;if(Number.isNaN(i.getTime()))throw new RangeError("Invalid start date");if(!Number.isInteger(e.interval)||e.interval<1)throw new RangeError(`Invalid interval: ${e.interval}`);const r=[`FREQ=${e.freq.toUpperCase()}`];if(e.interval>1&&r.push(`INTERVAL=${e.interval}`),"after"===e.end.kind){if(!Number.isInteger(e.end.count)||e.end.count<1)throw new RangeError(`Invalid count: ${e.end.count}`);r.push(`COUNT=${e.end.count}`)}if("weekly"===e.freq){const t=e.weekdays.filter((t,n)=>e.weekdays.indexOf(t)===n);if(!t.every(ph))throw new RangeError(`Invalid weekdays: ${String(t)}`);t.length>0&&r.push(`BYDAY=${t.join(",")}`)}if("monthly"===e.freq&&e.monthly){const t=function(e,t){switch(e.kind){case"day":if(!Number.isInteger(e.day)||e.day<1||e.day>31)throw new RangeError(`Invalid day of the month: ${e.day}`);return e.day===t.getDate()?void 0:`BYMONTHDAY=${e.day}`;case"weekday":if(!eh.includes(e.nth)||!ph(e.weekday))throw new RangeError(`Invalid monthly weekday: ${e.nth}${e.weekday}`);return`BYDAY=${e.nth>0?"+":""}${e.nth}${e.weekday}`;case"last-day":return"BYMONTHDAY=-1"}}(e.monthly,i);t&&r.push(t)}return"on"===e.end.kind&&r.push(`UNTIL=${function(e,t,n){const i=function(e){const t=ih.exec(e);if(!t)return;const[n,i,r]=[Number(t[1]),Number(t[2]),Number(t[3])];return ch(n,i,r)?[n,i,r]:void 0}(e);if(!i)throw new RangeError(`Invalid end date: ${e}`);if(t)return e.replace(/-/g,"");const r=new Date(n.getTime());return r.setFullYear(i[0],i[1]-1,i[2]),`${r.toISOString().slice(0,19).replace(/[-:]/g,"")}Z`}(e.end.until,n,i)}`),r.join(";")}const yh=["SU","MO","TU","WE","TH","FR","SA"];function wh(e,t){return JSON.stringify(e)===JSON.stringify(t)}function bh(e,t,n){if("rule"!==e.kind)return e;const i=e.rule;if("weekly"===i.freq){const r=yh[t.getDay()],a=yh[n.getDay()];return 1===i.weekdays.length&&i.weekdays[0]===r&&r!==a?{kind:"rule",rule:{...i,weekdays:[a]}}:e}if("monthly"===i.freq&&i.monthly){const r=vh(t).find(e=>wh(e,i.monthly));if(!r)return e;const a=vh(n),o=a.find(e=>function(e,t){return e.kind===t.kind&&("weekday"!==e.kind||"weekday"!==t.kind||Math.sign(e.nth)===Math.sign(t.nth))}(e,r))??a[0];return wh(o,i.monthly)?e:{kind:"rule",rule:{...i,monthly:o}}}return e}function xh(e){return Boolean(e)&&!/(?:^|;)COUNT=/i.test(e??"")}function kh(e){return $h(e)??""}function $h(e){return"custom"===e.repeat.kind?e.repeat.raw:"rule"===e.repeat.kind?_h(e.repeat.rule,{allDay:e.times.allDay,start:e.times.start}):void 0}function Th(e,t,n){const i=rl(e.times),r=t&&kh(e)===kh(t)?t.storedRule:$h(e);return{summary:e.summary.trim(),dtstart:i.dtstart,dtend:i.dtend,description:e.description,location:e.location,...r&&""!==n?{rrule:r}:{}}}const Sh=/<a\b([^<>]*)>((?:(?!<a\b)[\s\S])*?)<\/a\s*>/gi,Mh=/\bhref\s*=\s*(?:"([^"<>]*)"|'([^'<>]*)'|([^\s<>]+))/i,Dh=/^https?:\/\/[^\s<>"']+$/i,Ch=/\bhttps?:\/\/[^\s<>"']+/gi,Ah=/[.,;:!?'"]/,Eh=/<br\s*\/?>|<\/(?:p|div|li|h[1-6]|tr)\s*>/gi,Lh=[57344,63743];function Ph(e,t){return e.split(t).length-1}function Nh(e){const t=Ph(e,"(");let n=Ph(e,")"),i=e.length;for(;;){const r=e.charAt(i-1);if(Ah.test(r))i--;else{if(!(")"===r&&n>t))return e.slice(0,i);n--,i--}}}function Ih(e){const t=[];let n=0;for(const i of e.matchAll(Ch)){const r=Nh(i[0]),a=i.index??0;a>n&&t.push({text:e.slice(n,a)}),t.push({text:r,href:r}),n=a+r.length}return n<e.length&&t.push({text:e.slice(n)}),t}function Fh(e,t="",n=""){const i=[];return{marked:e.replace(Sh,(e,r,a)=>{const o=Mh.exec(r);return o?(i.push({href:o[1]??o[2]??o[3]??"",words:a}),`${t}${i.length-1}${n}`):e}),anchors:i}}function Rh(e){const t=function(e){const t=e.includes("&#")?e+Jo(e):e,n=new Set;for(let e=0;e<t.length;e++){const i=t.charCodeAt(e);i>=Lh[0]&&i<=Lh[1]&&n.add(i)}const i=[];for(let e=Lh[0];e<=Lh[1]&&i.length<2;e++)n.has(e)||i.push(String.fromCharCode(e));return 2===i.length?[i[0],i[1]]:void 0}(e);if(!t)return{marked:e,anchors:[],mark:/(?!)/};const[n,i]=t;return{...Fh(e,n,i),mark:new RegExp(`${n}(\\d+)${i}`)}}function Oh(e,t){if(Dh.test(t.trim()))return Ih(t);const n=function(e){const t=e.trim();return/^https?:\/\//i.test(t)?t:void 0}(Jo(e));return[n&&t?{text:t,href:n}:{text:t}]}function zh(e){return e.some(e=>"href"in e)}function jh(e,t){if(!e)return[];if(t&&/<a\b/i.test(t)){const{marked:n,anchors:i,mark:r}=Rh(t),a=[];Jo(n).split(r).forEach((e,t)=>{if(t%2==0)return void a.push(...Ih(e));const n=i[Number(e)];n&&a.push(...Oh(n.href,Jo(n.words)))});const o=a.filter(e=>""!==e.text);if(o.map(e=>e.text).join("")===e)return o}return Ih(e)}function Hh(e,t){const n=jh(e.location,t?.location),i=jh(e.description,t?.description);return{location:zh(n)?n:void 0,description:zh(i)?i:void 0}}var Wh=Object.defineProperty,Bh=(e,t,n,i)=>{for(var r,a=void 0,o=e.length-1;o>=0;o--)(r=e[o])&&(a=r(t,n,a)||a);return a&&Wh(t,n,a),a};const qh="calendar-card-pro-event-popover",Uh={summary:["ui.components.calendar.event.summary","Summary"],location:["ui.components.calendar.event.location","Location"],description:["ui.components.calendar.event.description","Description"],allDay:["ui.components.calendar.event.all_day","All day"],start:["ui.components.calendar.event.start","Start"],end:["ui.components.calendar.event.end","End"],calendar:["ui.components.calendar.label","Calendar"],tentative:["ui.components.calendar.event.tentative","Tentative"],repeat:["ui.components.calendar.event.repeat.label","Repeat"],interval:["ui.components.calendar.event.repeat.interval.label","Repeat interval"],monthly:["ui.components.calendar.event.repeat.monthly.label","Repeat monthly"],endLabel:["ui.components.calendar.event.repeat.end.label","End"],never:["ui.components.calendar.event.repeat.end.never","Never"],after:["ui.components.calendar.event.repeat.end.after","After"],on:["ui.components.calendar.event.repeat.end.on","On"],occurrences:["ui.components.calendar.event.repeat.end_after.ocurrences","occurrences"],thisEvent:["ui.components.calendar.event.recurrence_range.this_event","Only this event"],future:["ui.components.calendar.event.recurrence_range.this_and_future","This and all future events"],deletePrompt:["ui.components.calendar.event.confirm_delete.prompt","Do you want to delete this event?"],deleteRecurring:["ui.components.calendar.event.confirm_delete.recurring_prompt","Which events do you want to delete?"],updateRecurring:["ui.components.calendar.event.confirm_update.recurring_prompt","Which events do you want to update?"],missing:["ui.components.calendar.event.not_all_required_fields","Not all required fields are filled in"],duration:["ui.components.calendar.event.invalid_duration","The duration of the event is not valid. Please check start and end date."],delete:["ui.common.delete","Delete"],save:["ui.common.save","Save"],add:["ui.common.add","Add"],edit:["ui.common.edit","Edit"],cancel:["ui.common.cancel","Cancel"],close:["ui.common.close","Close"]},Vh="Unknown error",Gh=["none","daily","weekly","monthly","yearly"],Kh=["MO","TU","WE","TH","FR","SA","SU"];class Yh extends Ru{constructor(){super(...arguments),this._phase="edit",this._ghostPossible=!1,this._touched=!1,this._openId=0,this._logName="Event popover",this._panelWidth=340,this._onCancel=e=>{e.preventDefault(),"update"!==this._phase&&"delete"!==this._phase?this._requestClose("discard"):this._backOut()},this._onPointerDown=e=>{this._backdropDown=e.target===this._dialog,this._ghostPossible=!1},this._ghostGuard={handleEvent:e=>{this._ghostPossible&&(Date.now()-this._openedAt>700?this._ghostPossible=!1:(e.preventDefault(),e.stopPropagation(),"click"===e.type&&(this._ghostPossible=!1)))},capture:!0},this._ghostFocus={handleEvent:e=>{if(!this._ghostPossible||Date.now()-this._openedAt>700)return;const t=e.target;t&&"popover-title"!==t.id&&t.matches("input, textarea, select")&&(t.blur(),this._focusStart())},capture:!0},this._onClick={handleEvent:e=>{this._ghostGuard.handleEvent(e),e.defaultPrevented||this._isBackdropPress(e)&&this._requestClose("save")},capture:!0}}get _anchor(){return this._params?.anchor}_clear(){this._params=void 0,this._draft=void 0,this._original=void 0,this._timedBefore=void 0}showDialog(e){this._closing&&this._closeNow();const t=function(e,t=new Date){if("new"===e.mode){const n=e.times?.start??new Date(t.getFullYear(),t.getMonth(),t.getDate(),t.getHours()),i=e.times??{allDay:!1,start:n,end:new Date(n.getTime()+36e5)};return{calendarId:e.calendarId,summary:"",location:"",description:"",times:i,repeat:{kind:"none"}}}const n=e.entry;if(!n)return;const i=tl(n.dtstart,n.dtend);return i?{calendarId:e.calendarId,summary:n.summary??"",location:n.location??"",description:n.description??"",times:i,repeat:hh(n.rrule),storedRule:n.rrule||void 0}:void 0}(e);if(!t)return Tt("Event popover: the event has no readable start"),void this._fireClosed();this._params=e,this._original={...t,times:{...t.times}},this._draft="event"===e.mode&&e.moved?function(e,t){return{...e,times:t,repeat:bh(e.repeat,e.times.start,t.start)}}(t,e.moved):t,this._timedBefore=void 0,this._onClosed=e.closed,this._editing=void 0;const n=e.anchor?.pointerType;this._touched="touch"===n||"pen"===n,this._ghostPossible=this._touched,this._phase=this._recurring&&this._dropped?"update":"edit",this._error=void 0,this._map=void 0,this._place=void 0,this._openId++,this._wantOpen=!0,this.requestUpdate(),this._loadMap()}closeDialog(){return this._requestClose("save")}updated(e){super.updated(e);const t=e;if(t.has("_phase")){const e=t.get("_phase");"update"===this._phase||"delete"===this._phase?this.renderRoot.querySelector(".ask button")?.focus():"edit"!==this._phase||"update"!==e&&"delete"!==e||this._focusStart()}}get _titleFirst(){return"new"===this._params?.mode&&!this._touched}get _editable(){return"new"===this._params?.mode||Boolean(this._params?.canEdit)}get _dirty(){return Boolean(this._draft&&this._original&&(e=this._draft,t=this._original,e.calendarId!==t.calendarId||e.summary!==t.summary||e.location!==t.location||e.description!==t.description||e.times.allDay!==t.times.allDay||e.times.start.getTime()!==t.times.start.getTime()||e.times.end.getTime()!==t.times.end.getTime()||kh(e)!==kh(t)));var e,t}get _recurring(){return Boolean(this._params?.entry?.recurrence_id)}get _dropped(){return"event"===this._params?.mode&&void 0!==this._params.moved}_backOut(){"update"===this._phase&&this._dropped?this._requestClose("discard"):this._phase="edit"}get _busy(){return"saving"===this._phase}_requestClose(e,t){if(this._closing)return!0;if(this._busy)return!1;const n=this._params,i=this._draft;if(!n||!i)return this._finish();if("discard"===e||!this._editable||!this._dirty)return this._finish();const r=function(e){return e.summary.trim()&&e.calendarId?(t=e.times,Number.isNaN(t.start.getTime())||Number.isNaN(t.end.getTime())||!(t.allDay?t.end>=t.start:t.end>t.start)?"duration":void 0):"missing";var t}(i);return r?(this._error=this._t("missing"===r?"missing":"duration"),!1):"event"===n.mode&&this._recurring&&void 0===t?(this._phase="update",this._editing=void 0,!1):(this._save(t),!1)}async _save(e){const t=this._params,n=this._draft,i=this._original,r=this.hass;if(!t||!n||!r)return;const a=this._openId;if(this._phase="saving",this._editing=void 0,this._error=void 0,"event"!==t.mode||n.calendarId===t.calendarId){try{if("new"===t.mode)await ka(r,n.calendarId,Th(n,void 0));else{const a=t.entry;if(!a?.uid)throw new Error("The event has no identifier to save it by");await $a(r,{entityId:t.calendarId,uid:a.uid,recurrenceId:a.recurrence_id,range:e},Th(n,i,a.recurrence_id?e:void 0))}}catch(e){if(Tt("Event popover: saving failed",e),a!==this._openId)return;return this._phase="edit",void(this._error=Sa(e)??Vh)}t.updated(n.calendarId),a===this._openId&&this._finish()}else await this._move(r,t,n,i,e,a)}async _move(e,t,n,i,r,a){const o=t.entry,s=t.calendarId;let l=!1;try{if(!o?.uid)throw new Error("The event has no identifier to move it by");const t=o.recurrence_id?r??"":void 0,a=Th(n,i,t);if("THISANDFUTURE"===t&&!xh(a.rrule))throw new Error("This series cannot be moved from here on");await ka(e,n.calendarId,a),l=!0,await Ta(e,{entityId:s,uid:o.uid,recurrenceId:o.recurrence_id,range:t})}catch(e){if(Tt("Event popover: moving failed",e),l&&t.updated(n.calendarId),a!==this._openId)return;return this._phase="edit",this._error=Sa(e)??Vh,void(l&&this._settle(n))}t.updated(n.calendarId,s),a===this._openId&&this._finish()}get _seriesMovable(){const e=this._draft;return!!e&&xh(Th(e,this._original,"THISANDFUTURE").rrule)}_settle(e){const t=this._params;t&&(this._params={...t,display:void 0,canEdit:!1,canDelete:!1},this._original={...e,times:{...e.times}})}async _delete(e){const t=this._params,n=t?.entry,i=this.hass;if(this._busy||!t||!n?.uid||!i)return;const r=this._openId;this._phase="saving",this._error=void 0;try{await Ta(i,{entityId:t.calendarId,uid:n.uid,recurrenceId:n.recurrence_id,range:n.recurrence_id?e:void 0})}catch(e){if(Tt("Event popover: deleting failed",e),r!==this._openId)return;return this._phase="delete",void(this._error=Sa(e)??Vh)}t.updated(t.calendarId),r===this._openId&&this._finish()}_update(e){this._draft&&!this._busy&&(this._draft={...this._draft,...e},this._error=void 0,this._params?.changed?.(this._draft))}_setTimes(e){const t=this._draft;t&&this._update({times:e,repeat:bh(t.repeat,t.times.start,e.start)})}_setStartDate(e){const t=this._draft,n=t&&ol(t.times.start,e);t&&n&&this._setTimes(ll(t.times,n))}_setStartTime(e){const t=this._draft,n=t&&sl(t.times.start,e);t&&n&&this._setTimes(ll(t.times,n))}_setEndDate(e){const t=this._draft,n=t&&ol(t.times.end,e);t&&n&&this._setTimes({...t.times,end:n})}_setEndTime(e){const t=this._draft,n=t&&sl(t.times.end,e);t&&n&&this._setTimes({...t.times,end:n})}_setAllDay(e){const t=this._draft;if(!t)return;e&&!t.times.allDay&&(this._timedBefore=t.times);const n=this._timedBefore;this._setTimes(!e&&t.times.allDay&&n?function(e,t){const n=dl(t,!0,0),i=al(n.start,e.start),r=al(n.end,e.end)-i,a=el(t.start,i),o=el(t.end,i+r);return{allDay:!1,start:a,end:o>a?o:new Date(a.getTime()+t.end.getTime()-t.start.getTime())}}(t.times,n):dl(t.times,e,(new Date).getHours()))}_setFrequency(e){const t=this._draft;t&&this._update({repeat:"none"===e?{kind:"none"}:{kind:"rule",rule:fh(e,t.times.start)}})}_setRule(e){const t=this._draft?.repeat;"rule"===t?.kind&&this._update({repeat:{kind:"rule",rule:{...t.rule,...e}}})}_toggleWeekday(e){const t=this._draft?.repeat;if("rule"!==t?.kind)return;const n=t.rule.weekdays.includes(e)?t.rule.weekdays.filter(t=>t!==e):Kh.filter(n=>n===e||t.rule.weekdays.includes(n));n.length&&this._setRule({weekdays:n})}_setEnd(e){const t=this._draft?.repeat;"rule"===t?.kind&&this._setRule({end:gh(e,t.rule.freq)})}async _loadMap(){const e=this._params,t=(e?.display?.location??e?.entry?.location??"").trim();if(!e||"event"!==e.mode||!t||e.hidden?.location)return;const n=await Gu(t,this.hass,312);if(!n||this._params!==e)return;const i=await async function(e,t=Date.now()){if(!e||"function"!=typeof e.callWS)return;const n=e.connection??e;if(Ku&&Ku.hass===n&&t-Ku.at<12e5)return Ku.token;try{const i=await e.callWS({type:"map_tiles/access_token"});if("string"!=typeof i?.token||!i.token)return;return Ku={hass:n,token:i.token,at:t},i.token}catch{return}}(this.hass);if(!i||this._params!==e)return;const r=(window.devicePixelRatio??1)>=1.5?2:1,{tiles:a,tileSize:o}=function(e,t,n,i=1,r=15){const a=r+(2===i?1:0),o=256/i,s=function(e,t){const n=2**t,i=Math.max(-85.0511,Math.min(85.0511,e.latitude))*Math.PI/180;return{x:(e.longitude+180)/360*n,y:(1-Math.log(Math.tan(i)+1/Math.cos(i))/Math.PI)/2*n}}(e,a),l=s.x*o-t.width/2,d=s.y*o-t.height/2,c=2**a,u=[];for(let e=Math.floor(l/o);e<=Math.floor((l+t.width)/o);e++)for(let i=Math.floor(d/o);i<=Math.floor((d+t.height)/o);i++){if(i<0||i>=c)continue;const t=(e%c+c)%c;u.push({url:`/api/map_tiles/raster/${a}/${t}/${i}.png?token=${encodeURIComponent(n)}`,left:e*o-l,top:i*o-d})}return{tiles:u,tileSize:o}}(n,{width:312,height:120},i,r,n.zoom);this._map={tiles:a,tileSize:o,href:Yu(t),label:t,source:n.source}}_t(e){const[t,n]=Uh[e],i=this.hass?.localize?.(t);return i&&i!==t?i:n}_haKey(e,t){const n=this.hass?.localize?.(e);return n&&n!==e?n:t}_ruleText(e){if(e)return function(e,t,n){const i=hh(e);if("rule"===i.kind)try{return function(e,t,n){const i=[],r=e=>{const n="ui.components.calendar.event.rrule."+e,i=t(n);return i&&i!==n?i:""},a=e=>{const t=r(e);return t||i.push(e),t},o=e=>e%100!=1,s=e=>-1===e?a("last"):`${e}${r(th.get(e)??"th")}`,l=new Intl.DateTimeFormat(Je(n),{weekday:"long",timeZone:"UTC"}),d=e=>l.format(Date.UTC(2024,0,1+Ju.indexOf(e),12)),c=[a("every")],{interval:u}=e,h=1!==u?[String(u)]:[];switch(e.freq){case"daily":c.push(...h,a(o(u)?"days":"day"));break;case"weekly":{const t=Ju.filter(t=>e.weekdays.includes(t)),n=5===t.length&&!t.includes("SA")&&!t.includes("SU");1!==u&&c.push(...h,a(o(u)?"weeks":"week")),n?c.push(...1===u?[a("weekday")]:[a("on"),a("weekdays")]):7===t.length?c.push(a(o(u)?"days":"day")):(1===u&&c.push(a("week")),t.length>0&&c.push(a("on"),t.map(d).join(", ")));break}case"monthly":{c.push(...h,a(o(u)?"months":"month"));const{monthly:t}=e;t&&c.push(a("on the"),"day"===t.kind?s(t.day):"last-day"===t.kind?s(-1):`${s(t.nth)} ${d(t.weekday)}`);break}case"yearly":c.push(...h,a(o(u)?"years":"year"))}if("on"===e.end.kind){const[t,i,r]=e.end.until.split("-").map(Number),o=new Intl.DateTimeFormat(Je(n),{year:"numeric",month:"long",day:"numeric",timeZone:"UTC"}).format(sh(t,i-1,r).setUTCHours(12));c.push(a("until"),o)}else if("after"===e.end.kind){const{count:t}=e.end;c.push(a("for"),String(t),a(o(t)?"times":"time"))}if(i.length>0)return;const m=c.join(" ");return m.charAt(0).toUpperCase()+m.slice(1)}(i.rule,t,n)}catch(e){if(e instanceof RangeError)return;throw e}}(e,e=>this.hass?.localize?.(e)??"",this._params?.language??"en")??e}render(){const e=this._params,t=this._draft;if(!e||!t)return B`<dialog></dialog>`;const n=this._calendar(t.calendarId)?.color??e.color??"var(--primary-color)",i=this._place,r=this._displayed("title");return B`
      <dialog
        class="${e.dark?"dark":"light"} ${this._sheet?"sheet":"popover"}${this._lift>0?" lifted":""}"
        ?data-placed=${this._sheet||!!i}
        style=${Mu(this._sheet,i,this._lift)}
        aria-labelledby="popover-title"
        @cancel=${this._onCancel}
        @pointerdown=${this._onPointerDown}
        @click=${this._onClick}
        @mousedown=${this._ghostGuard}
        @mouseup=${this._ghostGuard}
        @focusin=${this._ghostFocus}
        @keydown=${this._keepKeys}
      >
        <div
          class=${this._scrolls?"panel scrolls":"panel"}
          style="--event-color:${n};${this._roomStyle}${i?.arrow?`transform-origin:${$u(i.arrow)}`:""}"
          ?inert=${this._busy||this._closing}
        >
          ${Du(this._sheet)}
          <h2
            id="popover-title"
            class="visually-hidden"
            tabindex="-1"
            ?autofocus=${!this._titleFirst}
          >
            ${r||this._t("summary")}
          </h2>
          <button class="btn reveal" @click=${()=>this._requestClose("save")}>
            ${this._t("close")}
          </button>
          <div class="group">
            <span class="bar"></span>
            <div class="stack">${this._renderTitle()} ${this._renderTime()}</div>
          </div>
          ${this._renderLocation()} ${this._renderCalendar()} ${this._renderDescription()}
          ${this._renderMap()} ${this._renderError()} ${this._renderQuestion()}
          ${this._renderFoot()}
        </div>
        ${Cu(i?.arrow)}
      </dialog>
    `}_displayed(e){const t=this._draft,n=this._original;if(!t)return"";const i="title"===e?"summary":e,r=n&&t[i]!==n[i],a=this._params?.display;return!a||r||this._editing===e?t[i]:a[e]??t[i]}_calendar(e){return this._params?.calendars.find(t=>t.id===e)}_renderTitle(){const e=this._displayed("title");return this._editable?B`<input
      class="cell title"
      ?autofocus=${this._titleFirst}
      .value=${e}
      placeholder=${this._t("summary")}
      aria-label=${this._t("summary")}
      @focus=${()=>this._editing="title"}
      @blur=${()=>"title"===this._editing&&(this._editing=void 0)}
      @input=${e=>this._update({summary:e.target.value})}
      @keydown=${e=>{"Enter"!==e.key||e.isComposing||this._requestClose("save")}}
    />`:B`<div class="cell title">${e}</div>
        ${"tentative"===this._params?.entry?.status?B`<span class="badge">${this._t("tentative")}</span>`:V}`}_renderTime(){const e=this._params,t=this._draft,n=function(e,t,n){const i=new Intl.DateTimeFormat(Je(t),{month:"short",day:"numeric",year:"numeric"}),r=new Intl.DateTimeFormat(Je(t),{hour:"numeric",minute:"2-digit",hour12:!n}),a=nl(e.start)===nl(e.end);if(e.allDay)return a?i.format(e.start):`${i.format(e.start)} – ${i.format(e.end)}`;const o=0===e.end.getHours()&&0===e.end.getMinutes()?el(e.end,-1):e.end;return nl(e.start)===nl(o)?`${i.format(e.start)}  ${r.format(e.start)} – ${r.format(e.end)}`:`${i.format(e.start)} ${r.format(e.start)} – ${i.format(e.end)} ${r.format(e.end)}`}(t.times,e.language,e.hour24),i=$h(t),r="custom"===t.repeat.kind?this._ruleText(t.repeat.raw):this._ruleText(i);if("time"!==this._editing){const e=B`<div class="when">${n}</div>
        ${t.times.allDay?B`<div class="sub">${this._t("allDay")}</div>`:V}
        ${r?B`<div class="sub">${r}</div>`:this._editable?B`<div class="sub dim">${this._t("repeat")}</div>`:V}`;return this._editable?B`<button
            class="cell time"
            aria-expanded="false"
            @click=${()=>this._editing="time"}
          >
            ${e}
          </button>`:B`<div class="cell time">${e}</div>`}const a=t.times;return B`<div class="cell time open" role="group" aria-label=${n}>
      <label class="row">
        <span class="key">${this._t("allDay")}</span>
        <input
          type="checkbox"
          role="switch"
          class="switch"
          .checked=${a.allDay}
          @change=${e=>this._setAllDay(e.target.checked)}
        />
      </label>
      <div class="row">
        <span class="key">${this._t("start")}</span>
        <span class="fields">
          <input
            type="date"
            aria-label=${this._t("start")}
            .value=${nl(a.start)}
            @change=${e=>this._setStartDate(e.target.value)}
          />
          ${a.allDay?V:B`<input
                  type="time"
                  aria-label=${this._t("start")}
                  .value=${il(a.start)}
                  @change=${e=>this._setStartTime(e.target.value)}
                />`}
        </span>
      </div>
      <div class="row">
        <span class="key">${this._t("end")}</span>
        <span class="fields">
          <input
            type="date"
            aria-label=${this._t("end")}
            .value=${nl(a.end)}
            @change=${e=>this._setEndDate(e.target.value)}
          />
          ${a.allDay?V:B`<input
                  type="time"
                  aria-label=${this._t("end")}
                  .value=${il(a.end)}
                  @change=${e=>this._setEndTime(e.target.value)}
                />`}
        </span>
      </div>
      <div class="divider"></div>
      ${this._renderRepeat()}
      <button class="done" @click=${()=>this._editing=void 0}>${n}</button>
    </div>`}_renderRepeat(){const e=this._draft,t=e.repeat,n="rule"===t.kind?t.rule.freq:"none"===t.kind?"none":"",i=e=>this._haKey(`ui.components.calendar.event.repeat.freq.${e}`,e),r=B`<label class="row">
      <span class="key">${this._t("repeat")}</span>
      <select
        aria-label=${this._t("repeat")}
        @change=${e=>this._setFrequency(e.target.value)}
      >
        ${"custom"===t.kind?B`<option value="" selected>${this._ruleText(t.raw)}</option>`:V}
        ${Gh.map(e=>B`<option value=${e} ?selected=${e===n}>${i(e)}</option>`)}
      </select>
    </label>`;if("rule"!==t.kind)return r;const a=t.rule,o="yearly"===a.freq?void 0:this._haKey(`ui.components.calendar.event.repeat.interval.${a.freq}`,a.freq),s="monthly"===a.freq?vh(e.times.start):[],l=t=>this._ruleText(_h({freq:"monthly",interval:a.interval,weekdays:[],monthly:t,end:{kind:"never"}},{allDay:e.times.allDay,start:e.times.start}));return B`${r}
      ${o?B`<label class="row">
              <span class="key">${this._t("interval")}</span>
              <span class="fields">
                <input
                  type="number"
                  min="1"
                  class="short"
                  aria-label=${this._t("interval")}
                  .value=${String(a.interval)}
                  @change=${e=>{const t=Math.max(1,Math.round(Number(e.target.value)||1));this._setRule({interval:t})}}
                />
                ${o}
              </span>
            </label>`:V}
      ${"weekly"===a.freq?B`<div class="days" role="group" aria-label=${this._t("repeat")}>
              ${Kh.map(e=>B`<button
                    class="day ${a.weekdays.includes(e)?"on":""}"
                    aria-pressed=${a.weekdays.includes(e)?"true":"false"}
                    @click=${()=>this._toggleWeekday(e)}
                  >
                    ${this._haKey(`ui.components.calendar.event.repeat.weekly.weekday.${e.toLowerCase()}`,e)}
                  </button>`)}
            </div>`:V}
      ${s.length?B`<label class="row">
              <span class="key">${this._t("monthly")}</span>
              <select
                aria-label=${this._t("monthly")}
                @change=${e=>this._setRule({monthly:s[Number(e.target.value)]})}
              >
                ${s.map((e,t)=>B`<option value=${t} ?selected=${((e,t)=>JSON.stringify(e)===JSON.stringify(t))(e,a.monthly)}>
                      ${l(e)}
                    </option>`)}
              </select>
            </label>`:V}
      <label class="row">
        <span class="key">${this._t("endLabel")}</span>
        <span class="fields">
          <select
            aria-label=${this._t("endLabel")}
            @change=${e=>this._setEnd(e.target.value)}
          >
            <option value="never" ?selected=${"never"===a.end.kind}>
              ${this._t("never")}
            </option>
            <option value="after" ?selected=${"after"===a.end.kind}>
              ${this._t("after")}
            </option>
            <option value="on" ?selected=${"on"===a.end.kind}>${this._t("on")}</option>
          </select>
          ${"after"===a.end.kind?B`<input
                    type="number"
                    min="1"
                    class="short"
                    aria-label=${this._t("occurrences")}
                    .value=${String(a.end.count)}
                    @change=${e=>this._setRule({end:{kind:"after",count:Math.max(1,Math.round(Number(e.target.value)||1))}})}
                  />
                  ${this._t("occurrences")}`:"on"===a.end.kind?B`<input
                    type="date"
                    aria-label=${this._t("on")}
                    .value=${a.end.until}
                    @change=${e=>{const t=e.target.value;Qs(t)&&this._setRule({end:{kind:"on",until:t}})}}
                  />`:V}
        </span>
      </label>`}_renderLocation(){if(this._params?.hidden?.location)return V;const e=this._displayed("location"),t=e&&!this._map?B`<a
            class="pin"
            href=${Yu(e)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label=${`${this._t("location")}: ${e}`}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d=${"M12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5M12,2A7,7 0 0,1 19,9C19,14.25 12,22 12,22C12,22 5,14.25 5,9A7,7 0 0,1 12,2M12,4A5,5 0 0,0 7,9C7,10 7,12 12,18.71C17,12 17,10 17,9A5,5 0 0,0 12,4Z"}></path></svg>
          </a>`:V;return this._editable?B`<div class="cell with-pin">
      <input
        class="plain"
        .value=${e}
        placeholder=${this._t("location")}
        aria-label=${this._t("location")}
        @focus=${()=>this._editing="location"}
        @blur=${()=>"location"===this._editing&&(this._editing=void 0)}
        @input=${e=>this._update({location:e.target.value})}
      />
      ${t}
    </div>`:e?B`<div class="cell with-pin">
            <span class="text">${this._linked(e)}</span>${t}
          </div>`:V}_renderCalendar(){const e=this._params,t=this._draft,n=this._calendar(t.calendarId),i=e=>B`<span class="dot" style="background:${e}"></span>`;return!this._editable||e.calendars.length<2?B`<div class="cell calendar">
        ${i(n?.color??e.color??"var(--primary-color)")}
        <span>${n?.name??t.calendarId}</span>
      </div>`:B`<label class="cell calendar popup">
      ${i(n?.color??"var(--primary-color)")}
      <select
        aria-label=${this._t("calendar")}
        @change=${e=>this._update({calendarId:e.target.value})}
      >
        ${e.calendars.map(e=>B`<option value=${e.id} ?selected=${e.id===t.calendarId}>
              ${e.name}
            </option>`)}
      </select>
    </label>`}_renderDescription(){if(this._params?.hidden?.description)return V;const e=this._displayed("description");if(!this._editable||"description"!==this._editing){if(!e&&!this._editable)return V;const t=function(e){if(!e)return[];const{marked:t,anchors:n,mark:i}=Rh(e),r=Jo(t.replace(Eh,"\n")).replace(/\n{3,}/g,"\n\n"),a=[];return r.split(i).forEach((e,t)=>{if(t%2==0)return void a.push(...Ih(e));const i=n[Number(e)];if(!i)return;const r=Jo(i.words)||Jo(i.href);a.push(...Oh(i.href,r))}),a.filter(e=>""!==e.text)}(e),n=e=>{e.target?.closest?.("a")||(this._editing="description",this.updateComplete.then(()=>this.renderRoot.querySelector("textarea")?.focus()))};return this._editable?B`<div class="cell notes ${e?"":"dim"}" @click=${n}>
            <button
              class="btn reveal"
              aria-label=${`${this._t("edit")}: ${this._t("description")}`}
            >
              ${this._t("edit")}
            </button>
            <span class="lines">${e?this._pieces(t):this._t("description")}</span>
          </div>`:B`<div class="cell notes"><span class="lines">${this._pieces(t)}</span></div>`}return B`<textarea
      class="cell notes"
      rows="3"
      aria-label=${this._t("description")}
      .value=${e}
      placeholder=${this._t("description")}
      @blur=${()=>"description"===this._editing&&(this._editing=void 0)}
      @input=${e=>this._update({description:e.target.value})}
    ></textarea>`}_linked(e){return this._pieces(Ih(e))}_pieces(e){return B`${e.map(e=>"href"in e?B`<a href=${e.href} target="_blank" rel="noopener noreferrer">${e.text}</a>`:e.text)}`}_renderMap(){const e=this._map;if(!e||"location"===this._editing)return V;const t=(e,t)=>B`<a href=${e} target="_blank" rel="noopener noreferrer">${t}</a>`;return B`<div class="map">
      <a
        class="map-link"
        href=${e.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label=${`${this._t("location")}: ${e.label}`}
      >
        ${e.tiles.map(t=>B`<img
              alt=""
              src=${t.url}
              draggable="false"
              style="left:${t.left}px;top:${t.top}px;width:${e.tileSize}px;height:${e.tileSize}px"
            />`)}
        <span class="marker" aria-hidden="true"></span>
      </a>
      <span class="attribution"
        >©
        ${t("https://www.openstreetmap.org/copyright","OpenStreetMap")}${"open-meteo"===e.source?B` · ${t("https://open-meteo.com/","Open-Meteo")}`:V}</span
      >
    </div>`}_renderError(){return this._error?B`<div class="error" role="alert">${this._error}</div>`:V}_renderQuestion(){if("update"===this._phase){const e=!(this._draft?.calendarId!==this._params?.calendarId)||this._seriesMovable;return B`<div class="ask" role="group" aria-label=${this._t("updateRecurring")}>
        <b>${this._t("updateRecurring")}</b>
        ${e?B`<button
                class="btn primary"
                @click=${()=>{this._requestClose("save","THISANDFUTURE")}}
              >
                ${this._t("future")}
              </button>`:V}
        <button class="btn" @click=${()=>{this._requestClose("save","")}}>
          ${this._t("thisEvent")}
        </button>
        <button class="btn" @click=${()=>this._backOut()}>${this._t("cancel")}</button>
      </div>`}return"delete"!==this._phase?V:this._recurring?B`<div class="ask" role="group" aria-label=${this._t("deleteRecurring")}>
      <b>${this._t("deleteRecurring")}</b>
      <button class="btn danger" @click=${()=>{this._delete("")}}>
        ${this._t("thisEvent")}
      </button>
      <button class="btn danger" @click=${()=>{this._delete("THISANDFUTURE")}}>
        ${this._t("future")}
      </button>
      <button class="btn" @click=${()=>this._phase="edit"}>${this._t("cancel")}</button>
    </div>`:B`<div class="ask" role="group" aria-label=${this._t("deletePrompt")}>
        <b>${this._t("deletePrompt")}</b>
        <button class="btn danger" @click=${()=>{this._delete("")}}>
          ${this._t("delete")}
        </button>
        <button class="btn" @click=${()=>this._phase="edit"}>${this._t("cancel")}</button>
      </div>`}_renderFoot(){const e=this._params;if("saving"===this._phase)return B`<div class="foot"><span class="spinner" role="progressbar"></span></div>`;if("edit"!==this._phase)return V;const t="event"===e.mode&&e.canDelete,n=this._editable&&this._dirty;return t||n?B`<div class="foot">
      ${t?B`<button class="btn" @click=${()=>this._phase="delete"}>
              ${this._t("delete")}
            </button>`:V}
      ${n?B`<button class="btn end" @click=${()=>this._requestClose("discard")}>
                ${this._t("cancel")}
              </button>
              <button class="btn primary" @click=${()=>this._requestClose("save")}>
                ${this._t("new"===e.mode?"add":"save")}
              </button>`:V}
    </div>`:V}}Yh.styles=a`
    ${Au}
    ${Eu}
    .title {
      font-size: 21px;
      font-weight: 500;
      padding: 12px 14px;
    }
    .title::placeholder,
    input::placeholder,
    textarea::placeholder,
    .dim {
      color: var(--dim);
    }
    .badge {
      align-self: flex-start;
      padding: 1px 10px;
      border-radius: 10px;
      border: 1px solid var(--pop-edge);
      font-size: 12px;
      color: var(--dim);
    }
    .when {
      font-weight: 600;
      font-size: 16px;
      white-space: pre-wrap;
    }
    .sub {
      margin-top: 5px;
    }
    .open {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .row {
      display: grid;
      grid-template-columns: 76px minmax(0, 1fr);
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }
    .key {
      color: var(--dim);
      text-align: end;
    }
    .fields {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
    }
    .open input:not(.switch),
    .open select,
    .calendar select {
      height: 28px;
      padding: 0 8px;
      border: 0;
      border-radius: 6px;
      background: var(--button);
      color: var(--text);
      font: inherit;
      font-size: 14px;
      font-variant-numeric: tabular-nums;
      min-width: 0;
    }
    option {
      background-color: Canvas;
      color: CanvasText;
    }
    .short {
      width: 56px;
    }
    .switch {
      justify-self: start;
      appearance: none;
      width: 34px;
      height: 20px;
      margin: 0;
      border-radius: 10px;
      background: var(--button);
      position: relative;
      cursor: pointer;
    }
    .switch::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
      transition: left 0.15s;
    }
    .switch:checked {
      background: #34c759;
    }
    .switch:checked::after {
      left: 16px;
    }
    .divider {
      height: 1px;
      background: var(--pop-edge);
    }
    .days {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      padding-inline-start: 84px;
    }
    .day {
      min-width: 32px;
      height: 26px;
      padding: 0 6px;
      border: 0;
      border-radius: 13px;
      background: var(--button);
      color: var(--text);
      font: inherit;
      font-size: 12px;
      cursor: pointer;
    }
    .day.on {
      background: var(--accent);
      color: #fff;
    }
    .done {
      align-self: flex-end;
      border: 0;
      background: transparent;
      color: var(--accent);
      font: inherit;
      font-size: 13px;
      cursor: pointer;
    }
    .with-pin {
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }
    .with-pin .text,
    .plain {
      flex: 1;
      min-width: 0;
    }
    .plain {
      padding: 0;
      border: 0;
      background: transparent;
      color: inherit;
      font: inherit;
    }
    .pin {
      flex: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 26px;
      border-radius: 7px;
      background: var(--button);
      color: var(--text);
    }
    .pin svg {
      width: 16px;
      height: 16px;
      fill: currentColor;
    }
    .calendar {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .calendar select {
      flex: 1;
      background: transparent;
      padding: 0;
    }
    .dot {
      flex: none;
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    .notes {
      min-height: 2.6em;
      resize: vertical;
    }
    .lines {
      white-space: pre-line;
    }
    a {
      color: var(--accent);
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    .map {
      position: relative;
      display: block;
      height: 120px;
      border-radius: 11px;
      overflow: hidden;
      background: var(--cell);
    }
    .map img {
      position: absolute;
      max-width: none;
      user-select: none;
    }
    .dark .map img {
      filter: invert(1) hue-rotate(180deg) brightness(0.9) contrast(0.9) saturate(0.6);
    }
    .marker {
      position: absolute;
      left: calc(50% - 12px);
      top: calc(50% - 28px);
      width: 24px;
      height: 24px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      background: #ff453a;
      border: 2px solid #fff;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
    }
    .map-link {
      position: absolute;
      inset: 0;
      display: block;
    }
    .attribution {
      position: absolute;
      right: 6px;
      bottom: 4px;
      padding: 0 4px;
      border-radius: 3px;
      font-size: 9px;
      color: #333;
      background: rgba(255, 255, 255, 0.7);
    }
    .attribution a {
      color: inherit;
    }
    .error {
      padding: 8px 12px;
      border-radius: 9px;
      font-size: 13px;
      color: var(--danger);
      background: color-mix(in srgb, var(--danger) 12%, transparent);
    }
    @supports not (color: color-mix(in srgb, red, blue)) {
      .error {
        background: var(--cell);
      }
    }
    .ask {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 8px 4px 2px;
      text-align: center;
    }
    .ask b {
      margin-bottom: 4px;
      font-size: 15px;
    }
    .foot {
      position: sticky;
      bottom: calc(-1 * var(--panel-end));
      display: flex;
      align-items: center;
      gap: 8px;
      margin: -3px -14px calc(-1 * var(--panel-end));
      padding: 6px 14px var(--panel-end);
    }
    .scrolls .foot {
      background: var(--pop-bg);
      -webkit-backdrop-filter: blur(28px) saturate(170%);
      backdrop-filter: blur(28px) saturate(170%);
      box-shadow: inset 0 0.5px 0 var(--pop-edge);
    }
    .foot .end {
      margin-inline-start: auto;
    }
    .btn {
      height: 28px;
      padding: 0 14px;
      border: 0;
      border-radius: 7px;
      background: var(--button);
      color: var(--text);
      font: inherit;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
    }
    .ask .btn {
      width: 100%;
      height: 30px;
    }
    .btn.primary {
      background: var(--accent);
      color: #fff;
    }
    .btn.danger {
      color: var(--danger);
    }
    @media (prefers-reduced-motion: reduce) {
      .switch::after {
        transition: none;
      }
    }
  `,Bh([pe()],Yh.prototype,"_params"),Bh([pe()],Yh.prototype,"_draft"),Bh([pe()],Yh.prototype,"_editing"),Bh([pe()],Yh.prototype,"_phase"),Bh([pe()],Yh.prototype,"_error"),Bh([pe()],Yh.prototype,"_map"),customElements.get(qh)||customElements.define(qh,Yh);const Jh=e=>(...t)=>({_$litDirective$:e,values:t});let Xh=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,n){this._$Ct=e,this._$AM=t,this._$Ci=n}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};const Zh=Jh(class extends Xh{constructor(e){if(super(e),1!==e.type||"class"!==e.name||e.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(e){return" "+Object.keys(e).filter(t=>e[t]).join(" ")+" "}update(e,[t]){if(void 0===this.st){this.st=new Set,void 0!==e.strings&&(this.nt=new Set(e.strings.join(" ").split(/\s/).filter(e=>""!==e)));for(const e in t)t[e]&&!this.nt?.has(e)&&this.st.add(e);return this.render(t)}const n=e.element.classList;for(const e of this.st)e in t||(n.remove(e),this.st.delete(e));for(const e in t){const i=!!t[e];i===this.st.has(e)||this.nt?.has(e)||(i?(n.add(e),this.st.add(e)):(n.remove(e),this.st.delete(e)))}return U}}),{I:Qh}=ae,em=e=>e,tm=()=>document.createComment(""),nm=(e,t,n)=>{const i=e._$AA.parentNode,r=void 0===t?e._$AB:t._$AA;if(void 0===n){const t=i.insertBefore(tm(),r),a=i.insertBefore(tm(),r);n=new Qh(t,a,e,e.options)}else{const t=n._$AB.nextSibling,a=n._$AM,o=a!==e;if(o){let t;n._$AQ?.(e),n._$AM=e,void 0!==n._$AP&&(t=e._$AU)!==a._$AU&&n._$AP(t)}if(t!==r||o){let e=n._$AA;for(;e!==t;){const t=em(e).nextSibling;em(i).insertBefore(e,r),e=t}}}return n},im=(e,t,n=e)=>(e._$AI(t,n),e),rm={},am=(e,t=rm)=>e._$AH=t,om=e=>{e._$AR(),e._$AA.remove()},sm=(e,t,n)=>{const i=new Map;for(let r=t;r<=n;r++)i.set(e[r],r);return i},lm=Jh(class extends Xh{constructor(e){if(super(e),2!==e.type)throw Error("repeat() can only be used in text expressions")}dt(e,t,n){let i;void 0===n?n=t:void 0!==t&&(i=t);const r=[],a=[];let o=0;for(const t of e)r[o]=i?i(t,o):o,a[o]=n(t,o),o++;return{values:a,keys:r}}render(e,t,n){return this.dt(e,t,n).values}update(e,[t,n,i]){const r=(e=>e._$AH)(e),{values:a,keys:o}=this.dt(t,n,i);if(!Array.isArray(r))return this.ut=o,a;const s=this.ut??=[],l=[];let d,c,u=0,h=r.length-1,m=0,p=a.length-1;for(;u<=h&&m<=p;)if(null===r[u])u++;else if(null===r[h])h--;else if(s[u]===o[m])l[m]=im(r[u],a[m]),u++,m++;else if(s[h]===o[p])l[p]=im(r[h],a[p]),h--,p--;else if(s[u]===o[p])l[p]=im(r[u],a[p]),nm(e,l[p+1],r[u]),u++,p--;else if(s[h]===o[m])l[m]=im(r[h],a[m]),nm(e,r[u],r[h]),h--,m++;else if(void 0===d&&(d=sm(o,m,p),c=sm(s,u,h)),d.has(s[u]))if(d.has(s[h])){const t=c.get(o[m]),n=void 0!==t?r[t]:null;if(null===n){const t=nm(e,r[u]);im(t,a[m]),l[m]=t}else l[m]=im(n,a[m]),nm(e,r[u],n),r[t]=null;m++}else om(r[h]),h--;else om(r[u]),u++;for(;m<=p;){const t=nm(e,l[p+1]);im(t,a[m]),l[m++]=t}for(;u<=h;){const e=r[u++];null!==e&&om(e)}return this.ut=o,am(e,l),U}}),dm="important",cm=" !"+dm,um=Jh(class extends Xh{constructor(e){if(super(e),1!==e.type||"style"!==e.name||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,n)=>{const i=e[n];return null==i?t:t+`${n=n.includes("-")?n:n.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${i};`},"")}update(e,[t]){const{style:n}=e.element;if(void 0===this.ft)return this.ft=new Set(Object.keys(t)),this.render(t);for(const e of this.ft)null==t[e]&&(this.ft.delete(e),e.includes("-")?n.removeProperty(e):n[e]=null);for(const e in t){const i=t[e];if(null!=i){this.ft.add(e);const t="string"==typeof i&&i.endsWith(cm);e.includes("-")||t?n.setProperty(e,t?i.slice(0,-11):i,t?dm:""):n[e]=i}}return U}});function hm(e,t){const n=function(e){const t=e?.translationMetadata?.translations,n=e?.language??e?.locale?.language;if(t&&n)return t[n]?.isRTL?"rtl":"ltr"}(t),i=function(e){return Ue.has(e)?"rtl":"ltr"}(e);return void 0===n||n===i?"":"rtl"===i?"‏":"‎"}function mm(e,t){return t&&e?`${t}${e}${t}`:e}const pm=/([^\S\u00A0\u2007\u202F]+)/u,fm=/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Bopomofo}\p{Script=Thai}\p{Script=Lao}\p{Script=Khmer}\p{Script=Myanmar}]/u,gm=/[\p{Script=Hebrew}\p{Script=Arabic}\p{Script=Syriac}\p{Script=Thaana}\p{Script=Nko}\p{Script=Samaritan}\p{Script=Mandaic}\p{Script=Adlam}]/u,vm=/\p{L}/u,_m=/[\p{Script=Thai}\p{Script=Lao}\p{Script=Khmer}\p{Script=Myanmar}]/u,ym=Intl.Segmenter,wm=ym?new ym(void 0,{granularity:"word"}):null,bm=/[\s\S]*?[\p{L}\p{N}][-\u2010\u2013\u2014](?=[\p{L}\p{N}])|[\s\S]+/gu;function xm(e){const t=e.match(/[\p{L}\u200E\u200F\u061C]/u)?.[0];if(t)return"‎"===t?"ltr":"‏"===t||"؜"===t||gm.test(t)?"rtl":"ltr"}const km={"sr-latn":"sr-Latn","zh-cn":"zh-Hans","zh-tw":"zh-Hant"},$m=["clear-night","cloudy","exceptional","fog","hail","lightning","lightning-rainy","partlycloudy","pouring","rainy","snowy","snowy-rainy","sunny","windy","windy-variant"];function Tm(e,t){if(!e)return;const n=function(e){const t=e.toLowerCase(),n=km[t];if(n)return n;const[i,r]=t.split("-");return r?`${i}-${r.toUpperCase()}`:i}(Ge(t,e.locale)),i=e.locale?.language;return i&&i.toLowerCase()===n.toLowerCase()?void 0:n}const Sm=new Map,Mm=new Map,Dm=new Set;const Cm=new Set;function Am(e,t){Dm.has(e)||(Dm.add(e),Dt(`Could not load weather conditions in ${e} (${t}); conditions will follow Home Assistant's language instead`))}function Em(e){return e?.position||"date"}const Lm={"clear-night":"mdi:weather-night",cloudy:"mdi:weather-cloudy",fog:"mdi:weather-fog",hail:"mdi:weather-hail",lightning:"mdi:weather-lightning","lightning-rainy":"mdi:weather-lightning-rainy",partlycloudy:"mdi:weather-partly-cloudy",pouring:"mdi:weather-pouring",rainy:"mdi:weather-rainy",snowy:"mdi:weather-snowy","snowy-rainy":"mdi:weather-snowy-rainy",sunny:"mdi:weather-sunny",windy:"mdi:weather-windy","windy-variant":"mdi:weather-windy-variant",exceptional:"mdi:weather-cloudy-alert"},Pm={sunny:"mdi:weather-night",partlycloudy:"mdi:weather-night-partly-cloudy","lightning-rainy":"mdi:weather-lightning"},Nm=new Set;async function Im(e,t,n,i){if(!e?.connection||!t?.weather?.entity)return;const r=t.weather.entity;try{return await e.connection.subscribeMessage(e=>{if(e&&Array.isArray(e.forecast)){const t=function(e,t){const n={};return e&&Array.isArray(e)?(e.forEach(e=>{if(!e.datetime)return;let i,r,a,o=!1;"hourly"===t?(a=new Date(e.datetime),r=a.getHours(),o=function(e,t){return"boolean"==typeof e?!e:t>=18||t<6}(e.is_daytime,r),i=`${Qo(a)}_${r}`):(a=new Date(e.datetime),i=Qo(a));const s=function(e,t){return t&&Pm[e]?Pm[e]:Lm[e]||"mdi:weather-cloudy-alert"}(e.condition,o);n[i]={icon:s,condition:e.condition,temperature:Math.round(e.temperature),templow:void 0!==e.templow?Math.round(e.templow):void 0,datetime:e.datetime,hour:r,uv_index:void 0!==e.uv_index?Math.round(e.uv_index):void 0}}),n):n}(e.forecast,n);i(t)}},{type:"weather/subscribe_forecast",forecast_type:n,entity_id:r})}catch(e){return void $t("Failed to subscribe to weather forecast",{entity:r,forecast_type:n,error:e})}}function Fm(e,t,n){const i=Em(t.weather);if("date"!==i&&"both"!==i||!t.weather?.entity||!n?.daily)return V;const r=function(e,t){if(t)return t[Qo(e)]}(e,n.daily);if(!r)return V;const a=t.weather?.date||{},o=!1!==a.show_conditions,s=!1!==a.show_high_temp,l=!0===a.show_uv_index&&void 0!==r.uv_index&&r.uv_index>=(a.uv_index_threshold??0),d=!0===a.show_low_temp&&!l&&void 0!==r.templow;return B`
    <div class="weather">${o?B`<ha-icon .icon=${r.icon}></ha-icon>`:V}${s?B`<span class="weather-temp-high">${r.temperature}°</span>`:V}${d?B`<span class="weather-temp-low">/${r.templow}°</span>`:V}${l?B`<span class="weather-uv-index">UV${r.uv_index}</span>`:V}</div>
  `}function Rm(e){const t=new Date,n=new Date(t.getFullYear(),t.getMonth(),t.getDate()),i=new Date(e),r=i.toDateString(),a=new Date(n);return a.setDate(a.getDate()+1),{isToday:r===n.toDateString(),isTomorrow:r===a.toDateString(),isPast:new Date(i.getFullYear(),i.getMonth(),i.getDate())<n}}function Om(e,t,n){const i=t?e.today_date_scale:n?e.past_date_scale:1;return"number"==typeof i&&i>0?i:1}function zm(e,t){return Or(e.replace(/^\s*initial(?=\s*(?:!\s*important\s*)?$)/i,"medium"),t)}function jm(e){return Math.max(1,Om(e,!0,!1),Om(e,!1,!0))}function Hm(e,t,n,i,r=V,a,o,s,l){const d=tp(t,i,"inline"),c=d!==V,u=a?B`<div
        class="column-header-separator"
        style=${um({borderTopWidth:a.width,borderTopColor:Ee(a.color),borderTopStyle:"solid"})}
      ></div>`:V;return B`
    <div
      class=${l?"column-day-header day-add-button":"column-day-header"}
      id=${l?V:s??V}
      role=${l?"button":V}
      tabindex=${l?"0":V}
      aria-label=${l?l.label:V}
      aria-describedby=${l&&s?s:V}
      .calendarCardDayAdd=${l?.timestamp}
    >
      <div
        class=${Zh({"column-date-content":!0,"with-today-indicator":c,"with-today-tile":Bm(t)})}
        id=${l&&s?s:V}
      >
        ${d}
        ${qm(e,t,n,i,r,o)}
      </div>
    </div>
    ${u}
  `}function Wm(e,t,n){return B`
    <div
      class="column-week-number"
      style=${um({gridColumn:String(n),gridRow:"1",...t?{}:{visibility:"hidden"}})}
    >
      <div class="week-number">${e??""}</div>
    </div>
  `}function Bm(e){return Boolean(e.today_indicator)&&"tile"===at(e.today_indicator)}function qm(e,t,n,i,r=V,a){const o=rs(e,a),{isPast:s}=Rm(e.getTime()),l=Om(t,i,s),d=e=>1===l?e:zm(e,l),c=qn(i?t.today_date_font_weight:s?t.past_date_font_weight:"default")||void 0,u=s&&t.past_date_opacity>=0&&t.past_date_opacity<100?String(t.past_date_opacity/100):void 0;let h=t.weekday_color,m=t.day_color,p=t.month_color;o&&(h=t.weekend_weekday_color||h,m=t.weekend_day_color||m,p=t.weekend_month_color||p);const f=i&&Bm(t);i&&(h=t.today_weekday_color||h,m=t.today_day_color||o&&t.weekend_day_color||(f?"var(--calendar-card-today-indicator-ink)":m),p=t.today_month_color||p);const g=Io(n),v=hm(n,a),_=mm(g.daysOfWeek[e.getDay()],v),y=e.getDate(),w=mm(g.months[e.getMonth()],v);return B`
    <div
      class="weekday"
      style=${um({"font-size":d(t.weekday_font_size),color:h,"font-weight":c,opacity:u})}
    >
      ${_}
    </div>
    <div
      class=${f?"day today-tile":"day"}
      style=${um({"font-size":d(t.day_font_size),color:m,"font-weight":c,opacity:u})}
    >
      ${y}
    </div>
    ${t.show_month?B`
          <div
            class="month"
            style=${um({"font-size":d(t.month_font_size),color:p,"font-weight":c,opacity:u})}
          >
            ${w}
          </div>
        `:V}
    ${r}
  `}const Um=/[\u2000-\u3300]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDC00-\uDFFF]/,Vm=/[\s\p{L}]/u;function Gm(e,t,n,i=""){if(!e)return V;const r=st(e,n);if("none"===r)return V;if("icon"===r)return B`<ha-icon icon="${e}" class="label-icon" style=${t?`color: ${t};`:V}></ha-icon>`;if("image"===r)return B`<img src="${e}" class="label-image" alt=${i} />`;const a=function(e){return Um.test(e)&&!Vm.test(e)}(e)?" label-emoji":"";return B`<span class="calendar-label${a}">${e}</span>`}function Km(e,t,n,i,r,a,o=!1,s="",l){const d=!!e._isEmptyDay,c=d&&!e._isCustomEmptyText,u=e._matchedConfig?.color||t.event_color,h=d?"var(--calendar-card-empty-day-color)":zi(u)?void 0:u,m=e._matchedConfig?.label_icon_color,p=e._matchedConfig?.label_type,f=c?`✓ ${e.summary}`:e.summary,g=void 0!==l?ft(t):void 0,v=Boolean(t.scroll_long_titles)||"line"===g,_=Boolean(t.scroll_long_titles),y=o&&!v?B`<span class="title-words"
          >${function(e){const t=e.split(pm),n=t.findIndex((e,t)=>t%2==0&&vm.test(e));if(gm.test(e)){const e=-1===n?t.length:n+1,i=t.slice(e),r=i.slice(1).join("");return[...t.slice(0,e).flatMap((e,t)=>""===e?[]:t%2==1?[{kind:"space",text:e}]:(e.match(bm)??[e]).map(e=>({kind:"word",text:e}))),...i.length&&i[0]?[{kind:"space",text:i[0]}]:[],...r?[{kind:"text",text:r}]:[]]}return t.flatMap((e,t)=>""===e?[]:t%2==1?[{kind:"space",text:e}]:fm.test(e)?t===n?function(e){let t="";for(const{segment:n}of wm?wm.segment(e):[]){if(t+=n,!vm.test(n))continue;if(!_m.test(n))break;const i=e.slice(t.length);return i?[{kind:"word",text:t},{kind:"text",text:i}]:[{kind:"word",text:t}]}return[{kind:"text",text:e}]}(e):[{kind:"text",text:e}]:(e.match(bm)??[e]).map(e=>({kind:"word",text:e})))}(f??"").map(e=>"word"===e.kind?B`<span class="title-word">${e.text}</span>`:"text"===e.kind?B`<span class="title-run">${e.text}</span>`:e.text)}</span
        >`:f,w=r?`allday-title-pill allday-pill-${r.mode}`+(r.inheritsText?" allday-source-text":""):"",b=r?`--calendar-card-event-accent: ${r.accent};`+(r.inheritsText?` --badge-source: ${h};`:""):"",x=r?B`<span
        class=${w}
        style=${b}
        >${y}</span
      >`:y,k=a?a.map(e=>Gm(e.value,e.iconColor,e.type,e.alt)):n?Gm(n,m,p,s):V,$=Array.isArray(k)?k.some(e=>e!==V):k!==V,T=_?B`<span class="event-title-scroll">${x}</span>`:x,S=`event-title ${d?"empty-day-title":""}${v?" title-scrollable":""}`,M=void 0===h?V:`color: ${h}`,D=v?d?V:xm(e.summary??"")??V:o?"auto":V,C=!o&&!v&&!d&&t.title_max_lines>0?xm(e.summary??"")??V:V,A=$?B`${k}<span class=${S} style=${M} dir=${D}>${T}</span>`:B`<span
          class=${S}
          style=${M}
          dir=${D}
        >
          ${T}
        </span>`;return l&&v?B`
      <div class="summary-row">
        <div class="summary summary-scroll">${A}</div>
        <div class="title-aside">
          ${Jm(e,t,i)}${l}
        </div>
      </div>
    `:l?B`
      <div class="summary-row title-wrap${"cap"===g?" title-capped":""}">
        <div class="summary" dir=${C}>${A}<span class="title-room"></span></div>
        <div class="title-aside">
          <span class="title-strut" aria-hidden="true">\u2060</span>${Jm(e,t,i)}${l}
        </div>
      </div>
    `:B`
    <div class="summary-row">
      <div class="summary${v?" summary-scroll":""}" dir=${C}>
        ${A}
      </div>
      ${Jm(e,t,i)}
    </div>
  `}function Ym(e,t){return function(e){const t=Em(e);return!(!e?.entity||"event"!==t&&"both"!==t)}(e.weather)&&!1!==ic(t._entityId,"show_weather",e,t)}function Jm(e,t,n,i="title",r){const a=Xm(e,t,n,i,r);if(!a)return B``;const{forecast:o,showIcon:s,showTemp:l,showUvIndex:d,conditionText:c}=a;return B`
    <div class="event-weather">${s?B`<ha-icon .icon=${o.icon}></ha-icon>`:V}<span class="event-weather-text">${l?B`<span>${o.temperature}°</span>`:V}${d?B`<span class="weather-uv-index">UV${o.uv_index}</span>`:V}${c?B`<span class="weather-condition">${c}</span>`:V}</span></div>
  `}function Xm(e,t,n,i="title",r){if(!Ym(t,e)||!n?.hourly)return null;if(e.end?.dateTime){const t=new Date;if(new Date(e.end.dateTime)<t)return null}const a=t.weather?.event||{},o=function(e,t,n,i=!1){if(e.start.date&&!e.start.dateTime&&n)return n[Qo(Zo(e.start.date))];if(!e.start.dateTime)return;const r=new Date(e.start.dateTime),a=Qo(r),o=r.getHours();if(t){const e=t[`${a}_${o}`];if(e)return e;let n=-1,i=24;if(Object.keys(t).forEach(e=>{if(e.startsWith(a)){const t=e.split("_")[1],r=parseInt(t);if(!isNaN(r)){const e=Math.abs(r-o);e<i&&(i=e,n=r)}}}),n>=0)return t[`${a}_${n}`]}return i&&n?n[a]:void 0}(e,n.hourly,n.daily,!1!==a.daily_forecast_fallback);if(!o)return null;const s=!1!==a.show_conditions,l=!1!==a.show_temp,d=!0===a.show_uv_index&&void 0!==o.uv_index&&o.uv_index>=(a.uv_index_threshold??0),c="row"===i,u=c||s,h=c&&s?function(e,t,n,i){if(!e||!t||!n)return;const r=Tm(e,i);if(r){const e=function(e,t){const n=Sm.get(e);if(!n)return;const i=n[t];return i||function(e,t){const n=`${e}:${t}`;Cm.has(n)||(Cm.add(n),Dt(`Home Assistant has no "${t}" for ${e}; that condition will follow the instance's language instead`))}(e,t),i}(r,n);if(e)return e}const a=e.states?.[t];if(!a||"function"!=typeof e.formatEntityState)return;const o=e.formatEntityState(a,n);return o?(o!==n||Nm.has(n)||(Nm.add(n),Dt(`Weather condition "${n}" came back untranslated from ${t}; Home Assistant returned the raw token, so the row will show it as-is`)),o):void 0}(r,t.weather?.entity,o.condition,t.language):void 0;return{forecast:o,showIcon:u,showTemp:l,showUvIndex:d,conditionText:h}}function Zm(e){return e.map(e=>"href"in e?B`<a class="event-link" href=${e.href} target="_blank" rel="noopener noreferrer"
          >${e.text}</a
        >`:e.text)}function Qm(e,t,n,i={}){const{weatherForecasts:r,weatherPlacement:a="title",progressPlacement:o="inline",countdownPlacement:s="trailing",hass:l,splitTimeEnd:d=!1,titleWords:c=!1,links:u=!1,timePosition:h="below"}=i,m="title"===h,p=m?"row":o,f=m?"text":s,{eventTime:g,eventTimeEnd:v,eventTimeDuration:_,allDayBadge:y,titlePill:w,eventLocation:b,locationIcon:x,eventDescription:k,shouldShowTime:$,countdownStr:T,dayCounter:S=null,countUp:M=!1,progressPercentage:D,entityLabel:C,entityLabelAlt:A,mergedLabels:E,nowLabel:L,languageMark:P=""}=n,N=e=>mm(e,P),I=T??S,F=null===T&&null!==S?"time-countdown day-counter":M?"time-countdown count-up":"time-countdown",R=u?Hh({location:b,description:k},e._source):void 0,O=R?.location?Zm(R.location):b,z=R?.description?Zm(R.description):k,j=null!==D&&t.show_progress_bar,H=j&&"inline"===p,W=j&&"row"===p?B`
          <div class="progress-bar progress-bar-row">
            <div class="progress-bar-filled" style="width: ${D}%"></div>
          </div>
        `:V,q="title"===a?r:void 0,U="row"===a&&Ym(t,e)?Jm(e,t,r,"row",l):V,G="text"===f&&null!==I,K=null===I?null:N(I),Y=G?null:K,J=d&&v&&g.endsWith(v)&&g!==v?v:null,X=J?g.slice(0,-J.length):g,Z=J&&_&&J.endsWith(_)&&J!==_?_:null,Q=Z&&J?J.slice(0,-Z.length):null,ee=g?Z&&null!==Q?B`<span>${N(us(X))}<span class="time-end"><span class="time-end-reading">${N(us(Q,X))}</span><span class="time-duration">${N(Z)}</span></span></span>`:J?B`<span>${N(us(X))}<span class="time-end">${N(us(J,X))}</span></span>`:B`<span>${N(us(g))}</span>`:V,te=y?B`<span
        class=${"allday-badge allday-pill-"+y.mode+(y.inheritsText?" allday-source-text":"")}
        lang=${y.lang}
        style=${`--calendar-card-event-accent: ${y.accent};`+(y.inheritsText?" --badge-source: var(--calendar-card-color-time);":"")}
        >${y.label}</span
      >`:V,ne=G?B`<span class="time-text">${ee}<span class=${F}>${K}</span></span>`:ee,ie=L?B`<span class="now-time"><span class="now-indicator">${L}</span>${ne}</span>`:ne;return m&&($||I)?function(e){const{shouldShowTime:t,allDayBadgeEl:n,timeContent:i,countdownStr:r,countdownClass:a}=e,o=t?B`<div class="time"><div class="time-actual">${n}${i}</div></div>`:B`<div class="time"><div class=${a}>${r}</div></div>`;return B`
    <div class="event-content time-beside-title">
      ${e.title(o)}
      <div class="time-location">
        ${e.progressRow} ${e.weatherRow}
        ${e.eventLocation?B`<div class="location">
                <ha-icon icon="${e.locationIcon}"></ha-icon>
                <span>${e.locationText}</span>
              </div>`:V}
        ${e.eventDescription?B`<div class="description">
                <ha-icon icon="mdi:information-outline"></ha-icon>
                <span>${e.descriptionText}</span>
              </div>`:V}
      </div>
    </div>
  `}({title:n=>Km(e,t,C,q,w,E,c,A,n),shouldShowTime:$,allDayBadgeEl:te,timeContent:ie,countdownStr:K,countdownClass:F,progressRow:W,weatherRow:U,eventLocation:b,locationIcon:x,locationText:O,eventDescription:k,descriptionText:z}):B`
    <div class="event-content">
      ${Km(e,t,C,q,w,E,c,A)}
      <div class="time-location">
        ${W}
        ${$?B`
              <div class="time">
                <div class="time-actual">
                  <ha-icon icon=${L?"mdi:clock":"mdi:clock-outline"}></ha-icon>
                  ${te}${ie}
                </div>
                ${Y?B`<div class=${F}>${Y}</div>`:H?B`
                        <div class="progress-bar">
                          <div
                            class="progress-bar-filled"
                            style="width: ${D}%"
                          ></div>
                        </div>
                      `:V}
              </div>
            `:I?B`
                <div class="time">
                  <div class="time-actual"></div>
                  <div class=${F}>${K}</div>
                </div>
              `:H?B`
                  <div class="time">
                    <div class="time-actual"></div>
                    <div class="progress-bar">
                      <div class="progress-bar-filled" style="width: ${D}%"></div>
                    </div>
                  </div>
                `:V}
        ${U}
        ${b?B`
              <div class="location">
                <ha-icon icon="${x}"></ha-icon>
                <span>${O}</span>
              </div>
            `:""}
        ${k?B`
              <div class="description">
                <ha-icon icon="mdi:information-outline"></ha-icon>
                <span>${z}</span>
              </div>
            `:""}
      </div>
    </div>
  `}function ep(){return B`<span class="event-accent-bar"></span>`}function tp(e,t,n="absolute"){if(!e.today_indicator||!t)return V;const i=e.today_indicator,r=at(i);if("none"===r||"tile"===r)return V;const a="inline"===n?{}:function(e){const t={position:"absolute",transform:"translate(var(--calendar-card-today-indicator-shift, -50%), -50%)"},n=e.trim().split(/\s+/);return n.length>=1&&(t["inset-inline-start"]=n[0]),n.length>=2?t.top=n[1]:t.top="50%",t}(e.today_indicator_position);return B`
    <div class="today-indicator-container${"inline"===n?" inline":""}">
      ${function(e,t,n){let i="";switch(e){case"dot":case"pulse":case"glow":i="mdi:circle";break;case"mdi":i="string"==typeof t?t:"mdi:circle";break;case"image":return"string"==typeof t?B` <img
          src="${t}"
          class="today-indicator image"
          style=${um(n)}
          alt="Today"
        />`:V;case"emoji":return"string"==typeof t?B` <span class="today-indicator emoji" style=${um(n)}>
          ${t}
        </span>`:V;default:return V}return i?B` <ha-icon
      icon="${i}"
      class="today-indicator ${e}"
      style=${um(n)}
    >
    </ha-icon>`:V}(r,i,a)}
    </div>
  `}const np=[["event_color","--calendar-card-color-event","ink"],["time_color","--calendar-card-color-time","ink"],["location_color","--calendar-card-color-location","ink"],["description_color","--calendar-card-color-description","ink"],["progress_bar_color","--calendar-card-progress-bar-color","raw"]];np.map(([e])=>e);const ip="--calendar-card-accent-ink",rp=np.find(([e])=>"event_color"===e)[1];function ap(e,t,n=!1){const i={};if(n||!t)return i;for(const[n,r,a]of np)zi(e[n])&&(i[r]="ink"===a?`var(${ip})`:t);const r=e.weather?.event?.color;return(zi(r)||!r&&i[rp])&&(i["--calendar-card-weather-event-color"]=`var(${ip})`),Object.values(i).some(e=>e.includes(ip))&&(i["--calendar-card-accent-ink-source"]=t),i}function op(e,t){return e>0?String(Math.min(e,t)):"none"}function sp(e){return e.accent_color&&!Ri(e.accent_color)?e.accent_color:String(jn.accent_color)}const lp=/(?:^|[^\w-])(?:var|attr)\(/i;function dp(e){return lp.test(e)?"0.125em":Dr(e,.125)}function cp(e){if(1===Om(e,!0,!1)&&1===Om(e,!1,!0))return{};const t=jm(e),n=e=>zm(e,t).replace(/\s*!\s*important\s*$/i,""),i=n(e.day_font_size);return{"--calendar-card-date-strut":'"\\200b"',"--calendar-card-date-weekday-row":n(e.weekday_font_size),"--calendar-card-date-weekday-align":"end","--calendar-card-date-day-strut-size":i,"--calendar-card-date-text-strut-size":e.show_month?`max(${i}, ${n(e.month_font_size)})`:i}}function up(e){const t={"--calendar-card-background-color":e.background_color,"--calendar-card-font-size-weekday":e.weekday_font_size,"--calendar-card-font-size-day":e.day_font_size,"--calendar-card-font-size-month":e.month_font_size,"--calendar-card-font-size-event":e.event_font_size,"--calendar-card-font-size-time":e.time_font_size,"--calendar-card-font-size-location":e.location_font_size,"--calendar-card-font-size-description":e.description_font_size,"--calendar-card-color-weekday":e.weekday_color,"--calendar-card-color-day":e.day_color,"--calendar-card-color-month":e.month_color,"--calendar-card-color-event":e.event_color,"--calendar-card-color-time":e.time_color,"--calendar-card-color-location":e.location_color,"--calendar-card-color-description":e.description_color,"--calendar-card-line-color-vertical":sp(e),"--calendar-card-line-width-vertical":e.vertical_line_width,"--calendar-card-day-spacing":e.day_spacing,"--calendar-card-event-spacing":e.event_spacing,"--calendar-card-past-event-opacity":String(e.past_event_opacity/100),"--calendar-card-spacing-additional":e.additional_card_spacing,"--calendar-card-height":e.height||"auto","--calendar-card-max-height":e.max_height,"--calendar-card-progress-bar-color":e.progress_bar_color,"--calendar-card-now-color":e.now_color,"--calendar-card-progress-bar-height":e.progress_bar_height,"--calendar-card-icon-size-time":e.time_icon_size||"14px","--calendar-card-icon-size-location":e.location_icon_size||"14px","--calendar-card-icon-size-description":e.description_icon_size||"14px","--calendar-card-description-max-lines":e.description_max_lines>0?String(e.description_max_lines):"none","--calendar-card-title-max-lines":e.title_max_lines>0?String(e.title_max_lines):"none","--calendar-card-grid-title-lines-compact":op(e.title_max_lines,1),"--calendar-card-grid-title-lines-medium":op(e.title_max_lines,2),"--calendar-card-grid-title-lines-expanded":op(e.title_max_lines,3),"--calendar-card-time-max-lines":e.time_max_lines>0?String(e.time_max_lines):"none","--calendar-card-location-max-lines":e.location_max_lines>0?String(e.location_max_lines):"none","--calendar-card-title-display":e.title_max_lines>0?"-webkit-box":"inline","--calendar-card-time-display":e.time_max_lines>0?"-webkit-box":"inline","--calendar-card-title-overflow":e.title_max_lines>0?"hidden":"visible","--calendar-card-time-overflow":e.time_max_lines>0?"hidden":"visible","--calendar-card-location-overflow":e.location_max_lines>0?"hidden":"visible","--calendar-card-description-overflow":e.description_max_lines>0?"hidden":"visible","--calendar-card-title-ink-room":e.title_max_lines>0?"0.375em":"0px","--calendar-card-time-ink-room":e.time_max_lines>0?"0.375em":"0px","--calendar-card-title-inline-room":e.title_max_lines>0?"var(--calendar-card-inline-room)":"0px","--calendar-card-time-inline-room":e.time_max_lines>0?"var(--calendar-card-inline-room)":"0px","--calendar-card-event-inline-room":dp(e.event_font_size),"--calendar-card-grid-text-inline-room":`max(${[e.event_font_size,e.time_font_size,e.location_font_size,e.description_font_size].map(dp).join(", ")})`,"--calendar-card-summary-end-margin":e.title_max_lines>0?"0.2em":"0px","--calendar-card-title-end-margin":e.title_max_lines>0?"2px":"0px","--calendar-card-date-column-width":Dr(e.day_font_size,1.75*jm(e)),...cp(e),"--calendar-card-date-column-vertical-alignment":e.date_vertical_alignment,"--calendar-card-event-icon-vertical-alignment":"top"===e.event_icon_vertical_alignment?"flex-start":"bottom"===e.event_icon_vertical_alignment?"flex-end":"center","--calendar-card-event-border-radius":"calc(var(--ha-card-border-radius, 10px) / 2)","--ha-ripple-hover-opacity":"0.04","--ha-ripple-hover-color":sp(e),"--ha-ripple-pressed-opacity":"0.12","--ha-ripple-pressed-color":sp(e),"--calendar-card-today-indicator-color":e.today_indicator_color,"--calendar-card-today-indicator-size":e.today_indicator_size,"--calendar-card-week-number-font-size":e.week_number_font_size,"--calendar-card-week-number-color":e.week_number_color,"--calendar-card-week-number-bg-color":e.week_number_background_color,"--calendar-card-empty-day-color":e.empty_day_color===jn.empty_day_color?"color-mix(in srgb, var(--primary-text-color) 60%, transparent)":e.empty_day_color,"--calendar-card-weather-date-icon-size":e.weather?.date?.icon_size||"14px","--calendar-card-weather-date-font-size":e.weather?.date?.font_size||"12px","--calendar-card-weather-date-color":e.weather?.date?.color||"var(--primary-text-color)","--calendar-card-weather-event-icon-size":e.weather?.event?.icon_size||"14px","--calendar-card-weather-event-font-size":e.weather?.event?.font_size||"12px","--calendar-card-weather-event-max-lines":(e.weather?.event?.max_lines??0)>0?String(e.weather?.event?.max_lines):"none","--calendar-card-weather-event-condition-display":(e.weather?.event?.max_lines??0)>0?"-webkit-inline-box":"inline","--calendar-card-weather-condition-inline-room":(e.weather?.event?.max_lines??0)>0?"var(--calendar-card-inline-room)":"0px"};for(const[n,i]of np)zi(e[n])&&(t[i]=String(jn[n]));e.progress_bar_width&&(t["--calendar-card-progress-bar-width"]=e.progress_bar_width),e.title_font_size&&(t["--calendar-card-font-size-title"]=e.title_font_size),e.title_color&&(t["--calendar-card-color-title"]=e.title_color),xr(e)&&(t["--calendar-card-event-gap"]=e.event_gap),e.event_background_opacity>0&&(t["--calendar-card-event-accent-side-radius"]="var(--calendar-card-event-border-radius)",t["--calendar-card-event-accent-bar-inset"]="4px",Ce()&&(t["--calendar-card-event-wash-hover"]="color-mix(in srgb, currentColor 6%, transparent)",t["--calendar-card-event-wash-pressed"]="color-mix(in srgb, currentColor 10%, transparent)")),e.weather?.event?.color&&!zi(e.weather.event.color)&&(t["--calendar-card-weather-event-color"]=e.weather.event.color);for(const[e,n]of Object.entries(t))t[e]=Ee(n);return t}const hp=a`
  repeating-linear-gradient(
    to bottom,
    var(--calendar-card-grid-slot-color) var(--calendar-card-grid-slot-offset)
      calc(var(--calendar-card-grid-slot-offset) + var(--calendar-card-grid-rule-width)),
    transparent
      calc(var(--calendar-card-grid-slot-offset) + var(--calendar-card-grid-rule-width))
      calc(var(--calendar-card-grid-slot-offset) + var(--calendar-card-grid-slot-pct))
  ),
  repeating-linear-gradient(
    to bottom,
    var(--calendar-card-grid-rule-color) var(--calendar-card-grid-hour-offset)
      calc(var(--calendar-card-grid-hour-offset) + var(--calendar-card-grid-rule-width)),
    transparent
      calc(var(--calendar-card-grid-hour-offset) + var(--calendar-card-grid-rule-width))
      calc(var(--calendar-card-grid-hour-offset) + var(--calendar-card-grid-hour-pct))
  )
`,mp=a`
  :host {
    display: block;
    height: 100%;
    --calendar-card-inline-room: 1px;
  }
  @supports (width: round(1px, 1px)) and (contain-intrinsic-size: 1px) {
    :host {
      --calendar-card-inline-room: round(up, 0.125em, 1px);
    }
  }
  ha-card {
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
    padding: calc(var(--calendar-card-spacing-additional) + 16px) 16px
      calc(var(--calendar-card-spacing-additional) + 16px) 8px;
    background: var(--calendar-card-background-color, var(--card-background-color));
    cursor: default;
    transition-property: background-color, border-color, box-shadow, color;
    --calendar-card-event-row-room: 1px;
    --calendar-card-grid-block-room: 1px;
  }
  @supports (width: round(1px, 1px)) and (contain-intrinsic-size: 1px) {
    ha-card,
    .event-text-scaled {
      --calendar-card-event-row-room: round(
        up,
        var(--calendar-card-event-inline-room, 0.125em),
        1px
      );
      --calendar-card-grid-block-room: round(
        up,
        var(--calendar-card-grid-text-inline-room, 0.125em),
        1px
      );
    }
  }
  ha-card:dir(rtl) {
    padding: calc(var(--calendar-card-spacing-additional) + 16px) 8px
      calc(var(--calendar-card-spacing-additional) + 16px) 16px;
  }
  ha-card.card-interactive {
    cursor: pointer;
  }
  ha-card.swipe-paging,
  ha-card.swipe-paging .content-container,
  ha-card.swipe-paging .content-container * {
    touch-action: pan-y;
    touch-action: pan-y pinch-zoom;
  }
  ha-card:focus {
    outline: none;
  }
  ha-card:focus-visible,
  ha-card:has(> .card-tap-control:focus-visible) {
    outline: 2px solid var(--calendar-card-line-color-vertical);
  }
  .card-tap-control {
    position: absolute;
    inset: 0;
    margin: 0;
    padding: 0;
    border: 0;
    background: none;
    opacity: 0;
    pointer-events: none;
  }
  .header-container,
  .content-container {
    width: 100%;
  }
  .content-container {
    max-height: var(--calendar-card-max-height, none);
    height: var(--calendar-card-height, auto);
    overflow-x: hidden;
    overflow-y: auto;
    padding-bottom: 1px;
    hyphens: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .content-container:hover {
    scrollbar-width: thin;
    scrollbar-color: var(--secondary-text-color) transparent;
    -ms-overflow-style: auto;
  }
  .card-header-placeholder {
    height: 0;
  }
  .card-header {
    float: left;
    float: inline-start;
    margin: 0 0 16px;
    margin-inline-start: 8px;
    padding: 0;
    color: var(--calendar-card-color-title, var(--primary-text-color));
    font-size: var(--calendar-card-font-size-title, var(--ha-card-header-font-size, 24px));
    font-weight: var(--ha-font-weight-normal, 400);
    letter-spacing: -0.012em;
    line-height: 1.33;
  }
  .toolbar-identity > .card-header {
    float: none;
    contain: inline-size;
    min-height: 1.2em;
    margin: 0;
    color: var(--secondary-text-color);
    font-size: var(--ha-font-size-m, 14px);
    font-weight: var(--ha-font-weight-medium, 500);
    letter-spacing: normal;
    line-height: 1.2;
  }
  .card-toolbar {
    box-sizing: border-box;
    min-width: 0;
    padding-inline-start: 8px;
  }
  .card-toolbar.toolbar-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }
  .toolbar-start,
  .toolbar-end {
    display: flex;
    flex: 1 1 0;
    align-items: center;
    gap: 8px;
    min-width: max-content;
  }
  .toolbar-end {
    justify-content: flex-end;
  }
  .card-toolbar.toolbar-heading {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    margin-bottom: 12px;
  }
  .toolbar-identity {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-width: 0;
  }
  .toolbar-heading.chips-shown > .toolbar-identity {
    flex: 1 1 0;
    min-width: max-content;
  }
  .toolbar-heading > .toolbar-heading-end {
    margin-block-end: calc(var(--calendar-card-heading-middle, 15px) - 12px);
  }
  .toolbar-heading-end {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: flex-end;
    margin-inline-start: auto;
  }
  .toolbar-heading.chips-shown > .toolbar-heading-end {
    flex: 1 1 0;
    min-width: max-content;
  }
  .toolbar-month {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, max-content);
    align-items: center;
    align-self: stretch;
    min-width: 0;
    color: var(--calendar-card-color-title, var(--primary-text-color));
    font-size: var(--calendar-card-font-size-title, var(--ha-card-header-font-size, 24px));
    font-weight: var(--ha-font-weight-normal, 400);
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.012em;
    line-height: 1.2;
  }
  .toolbar-month.with-picker {
    margin-inline-start: -8px;
  }
  .toolbar-month-reserve,
  .toolbar-month-probe {
    display: grid;
    white-space: nowrap;
  }
  .toolbar-month-reserve > span,
  .toolbar-month-probe > span {
    grid-area: 1 / 1;
  }
  .toolbar-month.with-picker .toolbar-month-reserve,
  .toolbar-month.with-picker .toolbar-month-probe {
    padding-inline: 8px 28px;
  }
  .toolbar-month-reserve {
    grid-area: 1 / 1;
    overflow: hidden;
    visibility: hidden;
  }
  .toolbar-month-measure {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    width: 0;
    height: 0;
    overflow: hidden;
    visibility: hidden;
    pointer-events: none;
  }
  .toolbar-month-probe {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
  }
  .toolbar-month-slot {
    position: relative;
    display: flex;
    grid-area: 1 / 1;
    justify-self: start;
    min-width: 0;
    max-width: 100%;
  }
  .toolbar-month-button {
    position: relative;
    display: inline-flex;
    align-items: center;
    box-sizing: border-box;
    min-width: 0;
    max-width: 100%;
    margin: 0;
    padding-block: 0;
    padding-inline: 8px 4px;
    border: none;
    border-radius: 999px;
    background: transparent;
    color: inherit;
    font: inherit;
    letter-spacing: inherit;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .toolbar-month-label {
    display: flex;
    align-items: center;
    min-width: 0;
    white-space: nowrap;
  }
  .toolbar-month-text {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  @supports (overflow: clip) and (contain-intrinsic-size: 1px) {
    .toolbar-month-text {
      overflow-x: clip;
      overflow-y: visible;
      min-width: 0;
    }
  }
  .toolbar-month-name {
    font-weight: var(--ha-font-weight-bold, 700);
  }
  .toolbar-month-icon {
    flex: none;
    width: 24px;
    height: 24px;
    fill: currentColor;
    color: var(--secondary-text-color);
  }
  .toolbar-month-cap {
    display: inline-block;
    width: 0;
    height: 0.7em;
    height: 1cap;
    vertical-align: baseline;
  }
  .toolbar-range-text {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }
  .date-navigation {
    display: inline-flex;
    flex: none;
    align-items: center;
    gap: 4px;
    height: 24px;
  }
  .date-navigation-segment {
    width: 24px;
    height: 24px;
    padding: 0;
    border-radius: 12px;
    background: var(--calendar-card-toolbar-fill);
  }
  .date-navigation-segment .toolbar-button-icon {
    width: 15px;
    height: 15px;
  }
  .date-navigation-segment .date-navigation-direction {
    width: 21px;
    height: 21px;
  }
  .date-navigation-direction:dir(rtl) {
    transform: scaleX(-1);
  }
  .toolbar-date-input {
    position: absolute;
    inset: 0;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    border: 0;
    opacity: 0;
    pointer-events: none;
  }
  .content-container.page-pending {
    opacity: 0.5;
    transition: opacity 120ms ease 150ms;
  }
  .card-toolbar {
    --calendar-card-toolbar-fill: color-mix(in srgb, var(--primary-text-color) 8%, transparent);
    --calendar-card-toolbar-fill-hover: color-mix(
      in srgb,
      var(--ha-ripple-hover-color) 12%,
      var(--calendar-card-toolbar-fill)
    );
    --calendar-card-toolbar-fill-pressed: color-mix(
      in srgb,
      var(--ha-ripple-pressed-color) 20%,
      var(--calendar-card-toolbar-fill)
    );
    --calendar-card-toolbar-selected: var(
      --calendar-card-background-color,
      var(--card-background-color)
    );
  }
  @supports not (color: color-mix(in srgb, red, blue)) {
    .card-toolbar {
      --calendar-card-toolbar-fill: rgba(128, 128, 128, 0.15);
      --calendar-card-toolbar-fill-hover: rgba(128, 128, 128, 0.24);
      --calendar-card-toolbar-fill-pressed: rgba(128, 128, 128, 0.32);
    }
  }
  @supports (color: light-dark(#000, #fff)) {
    .card-toolbar {
      --calendar-card-toolbar-selected: light-dark(
        var(--calendar-card-background-color, var(--card-background-color)),
        color-mix(
          in srgb,
          var(--primary-text-color) 22%,
          var(--calendar-card-background-color, var(--card-background-color))
        )
      );
    }
  }
  .toolbar-button,
  .view-switcher-segment,
  .date-navigation-segment {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    box-sizing: border-box;
    margin: 0;
    border: none;
    color: var(--primary-text-color);
    font-family: inherit;
    font-size: var(--ha-font-size-m, 14px);
    font-weight: var(--ha-font-weight-medium, 500);
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .toolbar-button {
    width: 36px;
    height: 36px;
    padding: 0;
    border-radius: 18px;
    background: var(--calendar-card-toolbar-fill);
  }
  .toolbar-button-icon {
    flex: none;
    width: 20px;
    height: 20px;
    fill: currentColor;
  }
  .custom-button-icon,
  .custom-menu-icon {
    --mdc-icon-size: 1em;
    --icon-primary-color: currentColor;
    flex: none;
    margin: 0;
    font-size: 20px;
  }
  .view-switcher {
    display: inline-flex;
    align-items: center;
    box-sizing: border-box;
    height: 36px;
    padding: 3px;
    border-radius: 18px;
    background: var(--calendar-card-toolbar-fill);
  }
  .view-switcher-segment {
    height: 30px;
    padding: 0 14px;
    border-radius: 15px;
    background: transparent;
    color: var(--secondary-text-color);
  }
  .view-switcher-segment.icon-only {
    width: 34px;
    padding: 0;
  }
  .view-switcher-segment.selected {
    background: var(--calendar-card-toolbar-selected);
    background-color: var(
      --calendar-card-toolbar-selected-surface,
      var(--calendar-card-toolbar-selected)
    );
    color: var(--primary-text-color);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  }
  .view-switcher-probe {
    display: none;
    --calendar-card-surface-value: var(--calendar-card-toolbar-selected);
    background: var(--calendar-card-toolbar-selected);
  }
  .view-switcher-probe.view-switcher-page {
    background: none;
    background-color: var(--primary-background-color);
  }
  .view-switcher-segment.unavailable {
    opacity: 0.38;
    cursor: default;
  }
  .view-switcher-icon {
    flex: none;
    width: 24px;
    height: 16px;
  }
  .toolbar-button::before,
  .view-switcher-segment::before,
  .date-navigation-segment::before,
  .legend-chip::before {
    content: '';
    position: absolute;
    inset: -4px;
  }
  .view-switcher-segment::before {
    inset-block: -7px;
    inset-inline: 0;
  }
  .view-switcher-segment:first-child::before {
    inset-inline-start: -7px;
  }
  .view-switcher-segment:last-child::before {
    inset-inline-end: -7px;
  }
  .legend-chip::before,
  .date-navigation-segment::before {
    inset-block: -10px;
    inset-inline: -2px;
  }
  .date-navigation-segment:first-child::before {
    inset-inline-start: -6px;
  }
  .date-navigation-segment:last-child::before {
    inset-inline-end: -6px;
  }
  .toolbar-month-button::before {
    content: '';
    position: absolute;
    inset-block: -2px -10px;
    inset-inline: 0;
  }
  .refresh-button.busy .toolbar-button-icon {
    animation: ccp-spin 1s linear infinite;
  }
  .refresh-button.busy.unasked .toolbar-button-icon {
    animation-delay: 150ms;
  }
  .toolbar-button.refresh-button.refresh-done,
  .toolbar-button.reset-button.reset-done,
  .date-navigation .date-navigation-segment.home-done {
    background: color-mix(
      in srgb,
      var(--success-color, #4caf50) 20%,
      var(--calendar-card-toolbar-fill)
    );
  }
  .toolbar-button.refresh-button.refresh-failed {
    background: color-mix(
      in srgb,
      var(--error-color, #db4437) 20%,
      var(--calendar-card-toolbar-fill)
    );
  }
  @supports not (color: color-mix(in srgb, red, blue)) {
    .toolbar-button.refresh-button.refresh-done,
    .toolbar-button.reset-button.reset-done,
    .date-navigation .date-navigation-segment.home-done,
    .toolbar-button.refresh-button.refresh-failed {
      background: var(--calendar-card-toolbar-fill);
    }
  }
  .refresh-done .toolbar-button-icon,
  .reset-done .toolbar-button-icon,
  .home-done .toolbar-button-icon,
  .refresh-done .loading-indicator-icon {
    fill: var(--success-color, #4caf50);
  }
  .refresh-failed .toolbar-button-icon,
  .refresh-failed .loading-indicator-icon {
    fill: var(--error-color, #db4437);
  }
  .toolbar-button.reset-button.unavailable:not(.reset-done) {
    background: var(--calendar-card-toolbar-fill);
    opacity: 0.38;
    cursor: default;
  }
  .toolbar-button.reset-button.unavailable:not(.alone):not(:focus-visible) {
    visibility: hidden;
    opacity: 0;
    transition:
      opacity 200ms ease,
      visibility 0s linear 200ms;
  }
  @media (prefers-reduced-motion: reduce) {
    .toolbar-button.reset-button.unavailable:not(.alone):not(:focus-visible) {
      transition: none;
    }
  }
  .legend-button {
    position: relative;
  }
  .legend-button.filtered::after {
    content: '';
    position: absolute;
    top: 5px;
    inset-inline-end: 5px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--primary-color);
    box-shadow: 0 0 0 2px var(--calendar-card-background-color, var(--card-background-color));
  }
  .toolbar-legend {
    flex: 0 1 auto;
    box-sizing: border-box;
    min-width: 0;
    overflow: hidden;
    margin: -10px -4px;
    margin-block-end: calc(var(--calendar-card-heading-middle, 15px) - 22px);
    padding: 10px 4px;
    cursor: default;
  }
  .legend-chips {
    display: flex;
    gap: 5px;
    width: max-content;
  }
  .legend-chip {
    position: relative;
    display: inline-flex;
    align-items: center;
    box-sizing: border-box;
    height: 24px;
    margin: 0;
    padding: 0 12px;
    border: none;
    border-radius: 12px;
    background: color-mix(in srgb, var(--calendar-card-legend-color) 24%, transparent);
    color: var(--primary-text-color);
    font-family: inherit;
    font-size: var(--ha-font-size-m, 14px);
    font-weight: var(--ha-font-weight-medium, 500);
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .legend-chip.hidden-calendar {
    background: var(--calendar-card-toolbar-fill);
    color: var(--secondary-text-color);
  }
  .legend-chip-label {
    min-width: 0;
    max-width: 14em;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-block: 0.5em;
    margin-block: -0.5em;
  }
  .toolbar-month-text,
  .legend-chip-label,
  .column-date-content .weather {
    padding-inline: var(--calendar-card-inline-room);
    margin-inline: calc(-1 * var(--calendar-card-inline-room));
  }
  .legend-menu,
  .custom-menu {
    position: fixed;
    inset: auto;
    box-sizing: border-box;
    min-width: 200px;
    max-width: calc(100vw - 16px);
    margin: 0;
    padding: 6px;
    overflow: auto;
    border: none;
    border-radius: var(--ha-card-border-radius, 12px);
    background: var(--ha-card-background, var(--card-background-color, #fff));
    background-color: var(
      --calendar-card-legend-menu-surface,
      var(--ha-card-background, var(--card-background-color, #fff))
    );
    color: var(--primary-text-color);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.24);
    font-family: inherit;
    font-size: var(--ha-font-size-m, 14px);
    font-weight: var(--ha-font-weight-normal, 400);
    line-height: 1.4;
  }
  .legend-menu::backdrop,
  .custom-menu::backdrop {
    background: transparent;
  }
  .legend-menu-surface,
  .custom-menu-surface {
    display: none;
    --calendar-card-surface-value: var(--ha-card-background, var(--card-background-color, #fff));
    background: var(--ha-card-background, var(--card-background-color, #fff));
  }
  .legend-menu-page,
  .custom-menu-page {
    display: none;
    background-color: var(--primary-background-color);
  }
  .legend-menu-list,
  .custom-menu-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .legend-menu-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
    margin-block-end: 6px;
  }
  .legend-menu-action {
    box-sizing: border-box;
    min-width: 0;
    min-height: 36px;
    margin: 0;
    padding-block: 4px;
    padding-inline: 12px;
    border: none;
    border-radius: 18px;
    background: var(--calendar-card-toolbar-fill);
    color: var(--primary-text-color);
    font-family: inherit;
    font-size: inherit;
    font-weight: var(--ha-font-weight-medium, 500);
    line-height: 1.2;
    text-align: center;
    overflow-wrap: anywhere;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .legend-menu-action.unavailable {
    opacity: 0.38;
    cursor: default;
  }
  .legend-menu-row {
    display: flex;
    align-items: center;
    gap: 10px;
    box-sizing: border-box;
    min-height: 40px;
    padding-block: 4px;
    padding-inline: 10px 12px;
    border-radius: 10px;
    background: color-mix(in srgb, var(--calendar-card-legend-color) 24%, transparent);
    font-weight: var(--ha-font-weight-medium, 500);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .legend-menu-row.hidden-calendar {
    background: var(--calendar-card-toolbar-fill);
    color: var(--secondary-text-color);
  }
  .legend-menu-check {
    flex: none;
    width: 18px;
    height: 18px;
    margin: 0;
    accent-color: var(--calendar-card-legend-color);
    cursor: pointer;
  }
  .legend-menu-label,
  .custom-menu-label {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .custom-menu-row {
    display: flex;
    align-items: center;
    gap: 10px;
    box-sizing: border-box;
    width: 100%;
    min-height: 40px;
    margin: 0;
    padding-block: 4px;
    padding-inline: 10px 12px;
    border: none;
    border-radius: 10px;
    background: transparent;
    color: var(--primary-text-color);
    font-family: inherit;
    font-size: inherit;
    font-weight: var(--ha-font-weight-medium, 500);
    line-height: inherit;
    text-align: start;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  @media (hover: hover) {
    .toolbar-button:hover,
    .view-switcher-segment:not(.selected):not(.unavailable):hover,
    .date-navigation-segment:hover,
    .custom-menu-row:hover,
    .legend-menu-action:not(.unavailable):hover,
    .toolbar-month-button:hover {
      background: var(--calendar-card-toolbar-fill-hover);
    }
  }
  .toolbar-button:active,
  .view-switcher-segment:not(.selected):not(.unavailable):active,
  .date-navigation-segment:active,
  .custom-menu-row:active,
  .legend-menu-action:not(.unavailable):active,
  .toolbar-month-button:active {
    background: var(--calendar-card-toolbar-fill-pressed);
  }
  @media (hover: hover) {
    .legend-chip:hover,
    .legend-menu-row:hover {
      background: color-mix(in srgb, var(--calendar-card-legend-color) 34%, transparent);
    }
    .legend-chip.hidden-calendar:hover,
    .legend-menu-row.hidden-calendar:hover {
      background: var(--calendar-card-toolbar-fill-hover);
    }
  }
  .legend-chip:active,
  .legend-menu-row:active {
    background: color-mix(in srgb, var(--calendar-card-legend-color) 44%, transparent);
  }
  .legend-chip.hidden-calendar:active,
  .legend-menu-row.hidden-calendar:active {
    background: var(--calendar-card-toolbar-fill-pressed);
  }
  @supports not (color: color-mix(in srgb, red, blue)) {
    .legend-chip,
    .legend-menu-row {
      background: rgba(128, 128, 128, 0.24);
      box-shadow: inset 0 0 0 2px var(--calendar-card-legend-color);
    }
    .legend-chip.hidden-calendar,
    .legend-menu-row.hidden-calendar {
      box-shadow: none;
    }
    @media (hover: hover) {
      .legend-chip:hover,
      .legend-menu-row:hover {
        background: rgba(128, 128, 128, 0.34);
      }
    }
    .legend-chip:active,
    .legend-menu-row:active {
      background: rgba(128, 128, 128, 0.44);
    }
  }
  ha-card:has(.toolbar-button:hover) > ha-ripple,
  ha-card:has(.toolbar-month-button:hover) > ha-ripple,
  ha-card:has(.view-switcher:hover) > ha-ripple,
  ha-card:has(.date-navigation:hover) > ha-ripple,
  ha-card:has(.toolbar-legend:hover) > ha-ripple,
  ha-card:has(.legend-menu:hover) > ha-ripple,
  ha-card:has(.custom-menu:hover) > ha-ripple {
    --ha-ripple-hover-opacity: 0;
  }
  .toolbar-button:focus,
  .view-switcher-segment:focus,
  .date-navigation-segment:focus,
  .toolbar-month-button:focus,
  .legend-chip:focus,
  .legend-menu:focus,
  .legend-menu-action:focus,
  .custom-menu:focus,
  .custom-menu-row:focus {
    outline: none;
  }
  .toolbar-button:focus-visible,
  .view-switcher-segment:focus-visible,
  .date-navigation-segment:focus-visible,
  .toolbar-month-button:focus-visible,
  .legend-chip:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }
  .legend-menu-row:has(.legend-menu-check:focus-visible),
  .legend-menu-action:focus-visible,
  .custom-menu-row:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: -2px;
  }
  .week-row-table {
    width: 100%;
    table-layout: fixed;
    padding-inline-start: 8px;
    border-spacing: 0;
    border: none !important;
  }
  .week-number-cell,
  .separator-cell {
    height: 100%;
  }
  .week-number-cell {
    width: var(--calendar-card-date-column-width);
    position: relative;
    text-align: center;
    vertical-align: middle;
    padding-inline-end: 12px;
  }
  .week-number {
    width: 2.5em;
    height: 1.5em;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: var(--calendar-card-week-number-font-size);
    font-weight: 500;
    color: var(--calendar-card-week-number-color);
    background-color: var(--calendar-card-week-number-bg-color);
    border-radius: 999px;
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  @supports (-webkit-touch-callout: none) {
    .week-number {
      padding-top: 0.1em;
    }
  }
  .separator-cell {
    vertical-align: middle;
  }
  .separator-line {
    width: 100%;
    height: var(--separator-border-width, 0);
    background-color: var(--separator-border-color, transparent);
    display: var(--separator-display, none);
  }
  .separator {
    width: 100%;
    margin-inline-start: 8px;
  }
  .week-separator {
    width: 100%;
    margin-inline-start: 8px;
    border-top-style: solid;
  }
  .month-separator {
    width: 100%;
    margin-inline-start: 8px;
    border-top-style: solid;
  }
  table {
    width: 100%;
    table-layout: fixed;
    border-spacing: 0;
    border-collapse: separate;
    margin-bottom: var(--calendar-card-day-spacing);
  }
  .day-table {
    border: none !important;
  }
  .event-gap-cell {
    height: var(--calendar-card-event-gap);
    padding: 0;
  }
  table:last-of-type {
    margin-bottom: 0;
    border-bottom: 0;
  }
  .date-column {
    width: var(--calendar-card-date-column-width);
    min-width: var(--calendar-card-date-column-width);
    max-width: var(--calendar-card-date-column-width);
    vertical-align: var(--calendar-card-date-column-vertical-alignment);
    text-align: center;
    position: relative;
    padding-inline-start: 8px;
    padding-inline-end: 12px;
  }
  .today-indicator-container:not(.inline) {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
    --calendar-card-today-indicator-shift: -50%;
  }
  .weekday {
    font-size: var(--calendar-card-font-size-weekday);
    line-height: 1;
    color: var(--calendar-card-color-weekday);
  }
  .day {
    font-size: var(--calendar-card-font-size-day);
    line-height: 1;
    font-weight: 500;
    color: var(--calendar-card-color-day);
  }
  .month {
    font-size: var(--calendar-card-font-size-month);
    line-height: 1;
    text-transform: uppercase;
    color: var(--calendar-card-color-month);
  }
  .day.today-tile {
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: 1.45em;
    height: 1.2em;
    margin: 0.15em auto;
    border-radius: 0.27em;
    font-variant-numeric: proportional-nums;
    background: var(--calendar-card-today-indicator-color);
    --calendar-card-today-indicator-ink: var(--text-primary-color, #fff);
  }
  @supports (corner-shape: squircle) {
    .day.today-tile {
      border-radius: 0.456em;
      corner-shape: squircle;
    }
  }
  @supports (text-box: trim-both cap alphabetic) {
    .day.today-tile {
      display: block;
      text-align: center;
      align-content: center;
      text-box: trim-both cap alphabetic;
    }
  }
  @supports (color: color-mix(in oklab, red, blue)) {
    .day.today-tile {
      background: color-mix(
        in oklab,
        var(--calendar-card-today-indicator-color) 25%,
        var(--calendar-card-background-color, var(--card-background-color))
      );
      --calendar-card-today-indicator-ink: color-mix(
        in oklab,
        var(--calendar-card-today-indicator-color) 45%,
        var(--primary-text-color)
      );
    }
  }
  @supports (color: oklch(from red l c h)) and (content-visibility: auto) and
    (width: round(1px, 1px)) {
    .day.today-tile {
      background: oklch(
        from
          color-mix(
            in oklab,
            var(--calendar-card-today-indicator-color) 25%,
            var(--calendar-card-background-color, var(--card-background-color))
          )
          l calc(c * 1.8) h
      );
      --calendar-card-today-indicator-ink: oklch(
        from
          color-mix(
            in oklab,
            var(--calendar-card-today-indicator-color) 45%,
            var(--primary-text-color)
          )
          l calc(c * 2.2) h / 1
      );
    }
  }
  .today-indicator-container {
    color: var(--calendar-card-today-indicator-color);
    pointer-events: none;
    z-index: 1;
  }
  .today-indicator-container.inline {
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }
  ha-icon.today-indicator {
    --mdc-icon-size: var(--calendar-card-today-indicator-size);
  }
  .today-indicator-container:not(.inline):dir(rtl) {
    --calendar-card-today-indicator-shift: 50%;
  }
  img.today-indicator.image {
    width: var(--calendar-card-today-indicator-size);
    height: auto;
    max-height: var(--calendar-card-today-indicator-size);
    object-fit: contain;
  }
  span.today-indicator.emoji {
    font-size: var(--calendar-card-today-indicator-size);
    line-height: 1;
  }
  ha-icon.today-indicator.pulse {
    animation: pulse-animation 2s infinite ease-in-out;
  }
  .today-indicator-container:not(.inline) ha-icon.today-indicator.pulse {
    animation-name: pulse-animation-placed;
  }
  @media (prefers-reduced-motion: reduce) {
    ha-icon.today-indicator.pulse,
    .today-indicator-container:not(.inline) ha-icon.today-indicator.pulse {
      animation: none;
    }
  }
  ha-icon.today-indicator.glow {
    filter: drop-shadow(
      0 0 calc(var(--calendar-card-today-indicator-size) * 0.5)
        var(--calendar-card-today-indicator-color)
    );
  }
  @keyframes pulse-animation {
    0% {
      transform: scale(0.95);
      opacity: 0.7;
    }
    50% {
      transform: scale(1.1);
      opacity: 1;
    }
    100% {
      transform: scale(0.95);
      opacity: 0.7;
    }
  }
  @keyframes pulse-animation-placed {
    0% {
      transform: translate(var(--calendar-card-today-indicator-shift, -50%), -50%) scale(0.95);
      opacity: 0.7;
    }
    50% {
      transform: translate(var(--calendar-card-today-indicator-shift, -50%), -50%) scale(1.1);
      opacity: 1;
    }
    100% {
      transform: translate(var(--calendar-card-today-indicator-shift, -50%), -50%) scale(0.95);
      opacity: 0.7;
    }
  }
  .date-column .weather,
  .column-date-content .weather {
    font-size: var(--calendar-card-weather-date-font-size, 12px);
    color: var(--calendar-card-weather-date-color, var(--primary-text-color));
  }
  .date-column .weather {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .weather ha-icon {
    margin-inline-end: 1px;
  }
  .date-column .weather ha-icon,
  .column-date-content .weather ha-icon {
    --mdc-icon-size: var(--calendar-card-weather-date-icon-size, 14px);
  }
  .weather-temp-high,
  .weather-temp-low {
    line-height: 1;
    vertical-align: middle;
  }
  .weather-temp-high {
    font-weight: 500;
  }
  .weather-temp-low {
    opacity: 0.8;
  }
  .weather .weather-uv-index {
    line-height: 1;
    vertical-align: middle;
    font-weight: 500;
    margin-inline-start: 2px;
  }
  .column-date-content .weather .weather-temp-high + .weather-uv-index {
    margin-inline-start: 0;
    margin-left: 2px;
  }
  .event-weather .weather-uv-index {
    font-weight: 500;
    margin-inline-start: 2px;
  }
  .summary-row .event-weather-text > span + .weather-uv-index {
    margin-inline-start: 0;
    margin-left: 2px;
  }
  .event {
    padding: var(--calendar-card-event-spacing) 0;
    padding-inline-start: calc(12px + var(--calendar-card-line-width-vertical));
    border-radius: 0;
  }
  td.event,
  .column-events > .event {
    position: relative;
  }
  .event {
    --calendar-card-accent-ink: color-mix(
      in srgb,
      var(--calendar-card-accent-ink-source) 30%,
      var(--primary-text-color)
    );
  }
  @supports not (color: color-mix(in srgb, red, blue)) {
    .event {
      --calendar-card-accent-ink: var(--primary-text-color);
    }
  }
  @supports (color: color-mix(in oklab, red, blue)) {
    .event {
      --calendar-card-accent-ink: color-mix(
        in oklab,
        var(--calendar-card-accent-ink-source) 45%,
        var(--primary-text-color)
      );
    }
  }
  @supports (color: oklch(from red l c h)) and (content-visibility: auto) and
    (width: round(1px, 1px)) {
    .event {
      --calendar-card-accent-ink: oklch(
        from
          color-mix(in oklab, var(--calendar-card-accent-ink-source) 45%, var(--primary-text-color))
          l calc(c * 2.2) h
      );
    }
  }
  .event-now {
    --calendar-card-now-ink: color-mix(
      in srgb,
      var(--calendar-card-now-color, #34d399) 30%,
      var(--primary-text-color)
    );
  }
  @supports not (color: color-mix(in srgb, red, blue)) {
    .event-now {
      --calendar-card-now-ink: var(--primary-text-color);
    }
  }
  @supports (color: color-mix(in oklab, red, blue)) {
    .event-now {
      --calendar-card-now-ink: color-mix(
        in oklab,
        var(--calendar-card-now-color, #34d399) 45%,
        var(--primary-text-color)
      );
    }
  }
  @supports (color: oklch(from red l c h)) and (content-visibility: auto) and
    (width: round(1px, 1px)) {
    .event-now {
      --calendar-card-now-ink: oklch(
        from
          color-mix(
            in oklab,
            var(--calendar-card-now-color, #34d399) 45%,
            var(--primary-text-color)
          )
          l calc(c * 2.2) h
      );
    }
  }
  .event-now .time-actual {
    color: var(--calendar-card-now-ink);
  }
  .time .now-time > span:not(.now-indicator) {
    display: inline;
  }
  .time .now-time > span {
    vertical-align: baseline;
  }
  .time .now-indicator {
    --calendar-card-now-gap: 0.35em;
    display: inline-flex;
    align-items: baseline;
    gap: var(--calendar-card-now-gap);
    margin-inline-end: calc(var(--calendar-card-now-gap) - 0.0675em);
    font-weight: 600;
    overflow-wrap: anywhere;
  }
  .time .now-indicator::after {
    content: '';
    flex: none;
    align-self: center;
    width: 0.2em;
    height: 0.2em;
    border-radius: 50%;
    background: currentColor;
  }
  .event-first {
    border-start-start-radius: var(--calendar-card-event-accent-side-radius, 0px);
    border-start-end-radius: var(--calendar-card-event-border-radius);
  }
  .event-last {
    border-end-start-radius: var(--calendar-card-event-accent-side-radius, 0px);
    border-end-end-radius: var(--calendar-card-event-border-radius);
  }
  .with-event-gap .event {
    border-start-start-radius: var(--calendar-card-event-accent-side-radius, 0px);
    border-start-end-radius: var(--calendar-card-event-border-radius);
    border-end-end-radius: var(--calendar-card-event-border-radius);
    border-end-start-radius: var(--calendar-card-event-accent-side-radius, 0px);
  }
  .event-accent-bar {
    --calendar-card-event-accent-bar-corner-inset: max(
      var(--calendar-card-event-accent-bar-inset, 2px),
      calc(var(--calendar-card-event-accent-side-radius, 0px) - 4px)
    );
    position: absolute;
    inset-inline-start: var(--calendar-card-event-accent-bar-inset, 0px);
    inset-block-start: var(--calendar-card-event-accent-bar-inset, 0px);
    inset-block-end: var(--calendar-card-event-accent-bar-inset, -1px);
    width: 0;
    border-inline-start: var(--calendar-card-line-width-vertical) solid
      var(--calendar-card-event-accent-bar-color);
    border-radius: calc(var(--calendar-card-event-accent-bar-inset, 0px) * 999);
    pointer-events: none;
  }
  .event-first > .event-accent-bar {
    inset-block-start: var(--calendar-card-event-accent-bar-corner-inset);
    border-start-start-radius: 999px;
    border-start-end-radius: 999px;
  }
  .event-last > .event-accent-bar {
    inset-block-end: var(--calendar-card-event-accent-bar-corner-inset);
    border-end-start-radius: 999px;
    border-end-end-radius: 999px;
  }
  .with-event-gap .event > .event-accent-bar {
    inset-block: var(--calendar-card-event-accent-bar-corner-inset);
    border-radius: 999px;
  }
  .past-event .event-content {
    opacity: var(--calendar-card-past-event-opacity, 0.6);
  }
  .grid-banner.past-event .grid-banner-title,
  .grid-banner.past-event .grid-banner-time {
    opacity: var(--calendar-card-past-event-opacity, 0.6);
  }
  .event-content {
    display: flex;
    flex-direction: column;
  }
  td.event .event-content:has(> .time-location > *),
  .column-events > .event > .event-content:has(> .time-location > *) {
    --calendar-card-event-ink-shift: 0.13em;
  }
  td.event .event-content:has(> .time-location > *) > .summary-row > .summary,
  .column-events > .event > .event-content:has(> .time-location > *) > .summary-row > .summary {
    padding-top: calc(
      0.2em - var(--calendar-card-event-ink-shift) + var(--calendar-card-summary-ink-room, 0px)
    );
    margin-top: calc(-1 * var(--calendar-card-summary-ink-room, 0px));
  }
  td.event .event-content:has(> .time-location > *)::after,
  .column-events > .event > .event-content:has(> .time-location > *)::after {
    content: '';
    flex: none;
    height: var(--calendar-card-event-ink-shift);
    font-size: var(--calendar-card-font-size-event);
  }
  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  .summary {
    flex: 1;
    overflow: hidden;
    overflow-wrap: break-word;
    font-size: var(--calendar-card-font-size-event);
    line-height: 1.2;
    padding-block: calc(0.2em + var(--calendar-card-summary-ink-room, 0px)) 0.2em;
    margin-top: calc(-1 * var(--calendar-card-summary-ink-room, 0px));
    --calendar-card-summary-inline-room: var(--calendar-card-inline-room);
    padding-inline: var(--calendar-card-summary-inline-room);
    margin-inline: calc(-1 * var(--calendar-card-summary-inline-room));
    -webkit-line-clamp: var(--calendar-card-title-max-lines);
  }
  @supports (overflow: clip) and (contain-intrinsic-size: 1px) {
    .summary {
      overflow-x: clip;
      overflow-y: visible;
      min-width: 0;
    }
  }
  .summary:not(:only-child) {
    margin-inline-end: calc(12px - var(--calendar-card-summary-inline-room));
  }
  .summary-row:dir(rtl) > .summary[dir='ltr'],
  .summary-row:dir(ltr) > .summary[dir='rtl'] {
    flex: 0 1 auto;
  }
  .summary-row:dir(rtl) > .summary[dir='ltr']:not(:only-child),
  .summary-row:dir(ltr) > .summary[dir='rtl']:not(:only-child) {
    margin-inline-end: calc(-1 * var(--calendar-card-summary-inline-room));
    margin-inline-start: calc(12px - var(--calendar-card-summary-inline-room));
  }
  .event-title {
    font-weight: 500;
    line-height: 1.2;
    color: var(--calendar-card-color-event);
    padding-bottom: 2px;
    text-indent: 0;
    display: var(--calendar-card-title-display);
    -webkit-box-orient: vertical;
    -webkit-line-clamp: var(--calendar-card-title-max-lines);
    overflow: hidden;
    padding-top: var(--calendar-card-title-ink-room, 0px);
    margin-top: calc(-1 * var(--calendar-card-title-ink-room, 0px));
    padding-inline: var(--calendar-card-title-inline-room, 0px);
    margin-inline: calc(-1 * var(--calendar-card-title-inline-room, 0px));
  }
  .summary:not(.summary-scroll):has(> .event-title:not(:only-child)) {
    display: var(--calendar-card-title-display);
    -webkit-box-orient: vertical;
    --calendar-card-summary-ink-room: min(var(--calendar-card-title-ink-room), 0.25em);
  }
  @supports (overflow: clip) and (contain-intrinsic-size: 1px) {
    .summary:not(.summary-scroll):has(> .event-title:not(:only-child)) {
      overflow-y: var(--calendar-card-title-overflow);
    }
  }
  .summary:not(.summary-scroll):has(> .event-title:not(:only-child)) > .event-title {
    display: inline;
    --calendar-card-title-ink-room: 0px;
    --calendar-card-title-inline-room: 0px;
  }
  td.event
    .event-content
    > .summary-row:not(.title-wrap)
    > .summary:not(.summary-scroll):has(> .event-title:not(:only-child)),
  .column-events
    > .event
    > .event-content
    > .summary-row:not(.title-wrap)
    > .summary:not(.summary-scroll):has(> .event-title:not(:only-child)) {
    padding-bottom: calc(0.2em - var(--calendar-card-summary-end-margin, 0px));
    margin-bottom: var(--calendar-card-summary-end-margin, 0px);
  }
  td.event
    .event-content
    > .summary-row:not(.title-wrap)
    > .summary:not(.summary-scroll)
    > .event-title:only-child,
  .column-events
    > .event
    > .event-content
    > .summary-row:not(.title-wrap)
    > .summary:not(.summary-scroll)
    > .event-title:only-child {
    padding-bottom: calc(2px - var(--calendar-card-title-end-margin, 0px));
    margin-bottom: var(--calendar-card-title-end-margin, 0px);
  }
  .summary[data-title-unhyphenated] > .event-title {
    hyphens: none;
  }
  .summary:has(> .label-icon) > .event-title,
  .summary:has(> .label-image) > .event-title,
  .summary:has(> .label-icon) > .calendar-label,
  .summary:has(> .label-image) > .calendar-label {
    vertical-align: middle;
  }
  .summary:has(> .label-icon),
  .summary:has(> .label-image) {
    text-indent: calc(-1 * (1em + 4px));
    padding-inline-start: calc(1em + 4px + var(--calendar-card-summary-inline-room));
  }
  .summary:has(> .label-emoji) {
    text-indent: calc(-1 * (1.25em + 4px));
    padding-inline-start: calc(1.25em + 4px + var(--calendar-card-summary-inline-room));
  }
  .summary-scroll {
    display: flex;
    align-items: center;
    min-width: 0;
  }
  .summary-scroll[data-scroll-labels] > :not(.event-title) {
    flex-shrink: 0;
    white-space: nowrap;
  }
  .summary.summary-scroll:has(> .label-icon),
  .summary.summary-scroll:has(> .label-image),
  .summary.summary-scroll:has(> .label-emoji) {
    text-indent: 0;
    padding-inline-start: var(--calendar-card-summary-inline-room);
  }
  .summary-scroll > .event-title.title-scrollable {
    flex: 1 1 auto;
    min-width: 0;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    --calendar-card-title-ink-room: 0px;
    --calendar-card-title-inline-room: var(--calendar-card-inline-room);
  }
  @supports (overflow: clip) and (contain-intrinsic-size: 1px) {
    .summary-scroll > .event-title.title-scrollable {
      overflow-x: clip;
      overflow-y: visible;
    }
  }
  .summary-scroll:dir(rtl) > .event-title.title-scrollable[dir='ltr'],
  .summary-scroll:dir(ltr) > .event-title.title-scrollable[dir='rtl'] {
    flex: 0 1 auto;
  }
  @supports not selector(:dir(ltr)) {
    .summary-scroll > .event-title.title-scrollable[dir] {
      direction: inherit;
    }
  }
  .summary-scroll:has(> :not(.event-title)) > .event-title {
    padding-bottom: 0;
  }
  .event-title.title-scrollable .event-title-scroll {
    display: inline;
  }
  @media (prefers-reduced-motion: no-preference) {
    .event-title.title-scrollable.title-overflowing {
      text-overflow: clip;
    }
    .event-title.title-scrollable.title-overflowing .event-title-scroll {
      display: inline-block;
      animation: calendar-card-title-scroll var(--calendar-card-title-scroll-duration, 8s) linear
        infinite;
      will-change: transform;
    }
    .event-title.title-scrollable[data-title-motion='pending'] {
      text-overflow: ellipsis;
    }
    .event-title.title-scrollable[data-title-motion='pending'] .event-title-scroll {
      display: inline;
      animation: none;
      transform: none;
      will-change: auto;
    }
    .event-title.title-scrollable.title-overflowing[data-title-motion='a'] .event-title-scroll,
    .event-title.title-scrollable.title-overflowing[data-title-motion='b'] .event-title-scroll {
      animation-duration: var(--calendar-card-title-cohort-period);
      animation-timing-function: var(--calendar-card-title-cohort-curve);
    }
    .event-title.title-scrollable.title-overflowing[data-title-motion='a'] .event-title-scroll {
      animation-name: calendar-card-title-cohort-a;
    }
    .event-title.title-scrollable.title-overflowing[data-title-motion='b'] .event-title-scroll {
      animation-name: calendar-card-title-cohort-b;
    }
  }
  @keyframes calendar-card-title-scroll {
    0%,
    15% {
      transform: translateX(0);
    }
    85%,
    100% {
      transform: translateX(
        calc(
          var(--calendar-card-title-scroll-direction, -1) *
            var(--calendar-card-title-scroll-distance, 0px)
        )
      );
    }
  }
  @keyframes calendar-card-title-cohort-a {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(
        calc(
          var(--calendar-card-title-scroll-direction, -1) *
            var(--calendar-card-title-scroll-distance, 0px)
        )
      );
    }
  }
  @keyframes calendar-card-title-cohort-b {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(
        calc(
          var(--calendar-card-title-scroll-direction, -1) *
            var(--calendar-card-title-scroll-distance, 0px)
        )
      );
    }
  }
  :host(.calendar-card-title-scroll-paused)
    .event-title.title-scrollable.title-overflowing
    .event-title-scroll {
    animation-play-state: paused;
  }
  .calendar-label {
    display: inline;
    margin-inline-end: 4px;
  }
  .calendar-label {
    unicode-bidi: plaintext;
  }
  .calendar-label::after {
    content: '\\200B';
  }
  .label-icon {
    --mdc-icon-size: 1em;
    vertical-align: middle;
    margin-inline-end: 4px;
  }
  .label-image {
    height: 1em;
    width: auto;
    vertical-align: middle;
    margin-inline-end: 4px;
  }
  .event-weather {
    display: flex;
    align-items: center;
    font-weight: 500;
    margin-inline-start: 8px;
    margin-inline-end: 12px;
  }
  .event-weather ha-icon {
    margin-inline-end: 2px;
    --mdc-icon-size: var(--calendar-card-weather-event-icon-size, 14px);
    color: var(--calendar-card-weather-event-color, var(--secondary-text-color));
  }
  .event-text-scaled :where(.summary-row, .title-aside) > .event-weather ha-icon {
    --mdc-icon-size: var(
      --calendar-card-weather-event-title-icon-size,
      var(--calendar-card-weather-event-icon-size, 14px)
    );
  }
  .event-weather .event-weather-text {
    color: var(--calendar-card-weather-event-color, var(--secondary-text-color));
  }
  :where(.summary-row) > .event-weather > .event-weather-text {
    font-size: var(--calendar-card-weather-event-font-size, 12px);
  }
  .time-location {
    display: flex;
    flex-direction: column;
    margin-top: 0;
  }
  .time,
  .location,
  .description {
    display: flex;
    align-items: var(--calendar-card-event-icon-vertical-alignment);
    line-height: 1.2;
    margin-top: 2px;
    margin-inline-end: 12px;
  }
  td.event .time-location > :first-child,
  .column-events > .event .time-location > :first-child,
  .grid-event .time-location > :first-child {
    margin-top: 0;
  }
  .time span,
  .location span,
  .description span {
    display: inline-block;
    vertical-align: middle;
    overflow-wrap: break-word;
  }
  .time {
    font-size: var(--calendar-card-font-size-time);
    color: var(--calendar-card-color-time);
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    flex-wrap: wrap;
    row-gap: 2px;
    column-gap: 8px;
  }
  .time-actual {
    display: flex;
    align-items: var(--calendar-card-event-icon-vertical-alignment);
  }
  .time .time-actual:has(.allday-badge) {
    align-items: center;
    min-width: 0;
  }
  .time .time-actual .time-text {
    min-width: 0;
    flex: 1 1 auto;
  }
  .time .time-actual .time-text > span {
    display: var(--calendar-card-time-display);
    vertical-align: baseline;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: var(--calendar-card-time-max-lines);
    overflow: hidden;
    padding-top: var(--calendar-card-time-ink-room, 0px);
    margin-top: calc(-1 * var(--calendar-card-time-ink-room, 0px));
    padding-inline: var(--calendar-card-time-inline-room, 0px);
    margin-inline: calc(-1 * var(--calendar-card-time-inline-room, 0px));
  }
  .time .time-actual .time-text > .time-countdown {
    display: inline;
    -webkit-line-clamp: none;
    overflow: visible;
    padding-top: 0;
    margin-top: 0;
    padding-inline: 0;
    margin-inline-start: 4px;
    margin-inline-end: 0;
    white-space: normal;
    unicode-bidi: isolate;
  }
  .time .time-actual .time-text > .time-countdown::before {
    content: '\\2060·\\200B';
    margin-inline-end: 4px;
    unicode-bidi: isolate;
  }
  .time .time-actual .allday-badge + .time-text > .time-countdown:first-child {
    margin-inline-start: 0;
  }
  .time-countdown {
    text-align: right;
    color: var(--calendar-card-color-time);
    margin-inline-start: auto;
    margin-inline-end: 12px;
    white-space: nowrap;
    hyphens: manual;
  }
  td.event .time-location > .time > .time-countdown {
    flex-shrink: 0;
    max-width: 100%;
    white-space: normal;
    overflow-wrap: break-word;
    text-align: end;
  }
  .location {
    font-size: var(--calendar-card-font-size-location);
    color: var(--calendar-card-color-location);
  }
  .description {
    font-size: var(--calendar-card-font-size-description);
    color: var(--calendar-card-color-description);
  }
  .time-beside-title > .summary-row {
    align-items: baseline;
  }
  .time-beside-title > .summary-row > .summary-scroll > .event-title {
    align-self: baseline;
  }
  .time-beside-title > .summary-row > .title-aside {
    display: flex;
    align-items: baseline;
    flex: none;
    max-width: calc(60% - 12px);
    min-width: min-content;
  }
  :where(.title-aside) > .event-weather > .event-weather-text {
    font-size: var(--calendar-card-weather-event-font-size, 12px);
    align-self: baseline;
  }
  .time-beside-title .summary-row .title-aside > .event-weather {
    margin-inline-end: 0;
  }
  .time-beside-title .summary-row .title-aside > .event-weather + .time::before {
    content: '·';
    margin-inline: 4px;
  }
  .time-beside-title .summary-row .title-aside > .time {
    width: auto;
    margin-top: 0;
    padding-inline-start: 0;
    flex-wrap: nowrap;
    justify-content: flex-end;
    align-items: baseline;
    column-gap: 0;
    text-align: end;
  }
  .time-beside-title .summary-row .title-aside > .time > .time-actual {
    margin-inline-start: 0;
    justify-content: flex-end;
  }
  .time-beside-title .summary-row .title-aside > .time .now-indicator {
    overflow-wrap: normal;
  }
  .time-beside-title .summary-row .title-aside > .time > .time-countdown {
    margin-inline: 0;
    text-align: end;
    white-space: normal;
  }
  .time-beside-title .summary-row .title-aside > .time > .time-countdown::before {
    content: none;
  }
  .time-beside-title > .summary-row.title-wrap {
    display: block;
    position: relative;
    width: auto;
    margin-inline-end: 12px;
    --calendar-card-title-room-gap: 12px;
  }
  .time-beside-title > .summary-row.title-wrap > .summary:not(.summary-scroll) {
    display: flow-root;
    margin-inline: calc(-1 * var(--calendar-card-summary-inline-room));
    --calendar-card-summary-ink-room: 0px;
  }
  @supports (overflow: clip) and (contain-intrinsic-size: 1px) {
    .time-beside-title > .summary-row.title-wrap > .summary:not(.summary-scroll) {
      overflow-y: visible;
    }
  }
  .time-beside-title > .summary-row.title-wrap > .summary > .event-title {
    display: inline;
    --calendar-card-title-ink-room: 0px;
    --calendar-card-title-inline-room: 0px;
  }
  .time-beside-title > .summary-row.title-wrap > .summary > .title-room {
    display: none;
  }
  .time-beside-title > .summary-row.title-wrap[data-title-fit] > .summary > .title-room {
    display: block;
    width: var(--calendar-card-title-room-width);
    height: var(--calendar-card-title-room-height);
  }
  .time-beside-title > .summary-row.title-wrap[data-title-fit='ltr'] > .summary > .title-room {
    float: right;
    margin-left: var(--calendar-card-title-room-gap);
  }
  .time-beside-title > .summary-row.title-wrap[data-title-fit='rtl'] > .summary > .title-room {
    float: left;
    margin-right: var(--calendar-card-title-room-gap);
  }
  .time-beside-title > .summary-row.title-wrap > .title-aside {
    display: flex;
    align-items: baseline;
    width: max-content;
    max-width: calc(
      100% - 2 * var(--calendar-card-title-row-room, 0px) - var(--calendar-card-title-room-gap)
    );
    margin-inline-start: auto;
    line-height: 1.2;
  }
  .time-beside-title > .summary-row.title-wrap > .title-aside > .title-strut {
    font-size: var(--calendar-card-font-size-event);
  }
  .time-beside-title > .summary-row.title-wrap > .title-aside > .time {
    margin-inline-end: 0;
  }
  .time-beside-title .summary-row .title-aside > .time > .time-actual > .allday-badge:last-child {
    margin-inline-end: 0;
  }
  .time-beside-title > .summary-row.title-wrap[data-title-fit] > .title-aside {
    position: absolute;
    top: calc(100% - var(--calendar-card-title-pad) - var(--calendar-card-title-room-height));
  }
  .time-beside-title > .summary-row.title-wrap[data-title-fit='ltr'] > .title-aside {
    right: var(--calendar-card-title-row-room, 0px);
  }
  .time-beside-title > .summary-row.title-wrap[data-title-fit='rtl'] > .title-aside {
    left: var(--calendar-card-title-row-room, 0px);
  }
  .time-beside-title > .summary-row.title-wrap[data-title-cut=''] {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: var(--calendar-card-title-max-lines);
    overflow: hidden;
    margin-bottom: var(--calendar-card-title-pad);
    padding-top: 0.375em;
    margin-top: -0.375em;
    padding-inline: var(--calendar-card-event-row-room);
    margin-inline: calc(-1 * var(--calendar-card-event-row-room))
      calc(12px - var(--calendar-card-event-row-room));
    --calendar-card-title-row-room: var(--calendar-card-event-row-room);
  }
  .time-beside-title > .summary-row.title-wrap[data-title-cut=''] > .summary:not(.summary-scroll) {
    display: block;
    overflow: visible;
    padding-bottom: 0;
    --calendar-card-summary-inline-room: 0px;
  }
  .time-beside-title > .summary-row.title-wrap[data-title-cut=''] > .summary::before {
    content: '';
    width: calc(var(--calendar-card-title-room-width) + var(--calendar-card-title-room-gap));
    height: var(--calendar-card-title-cut-end);
    shape-outside: inset(var(--calendar-card-title-cut-start) 0 0 0);
  }
  .time-beside-title
    > .summary-row.title-wrap[data-title-fit='ltr'][data-title-cut='']
    > .summary::before {
    float: right;
  }
  .time-beside-title
    > .summary-row.title-wrap[data-title-fit='rtl'][data-title-cut='']
    > .summary::before {
    float: left;
  }
  .time-beside-title > .summary-row.title-wrap[data-title-cut] > .summary > .title-room {
    display: none;
  }
  .time-beside-title > .summary-row.title-wrap[data-title-cut=''] > .title-aside {
    top: calc(100% - var(--calendar-card-title-room-height));
  }
  .time-beside-title > .summary-row.title-wrap[data-title-cut='below'] {
    padding-bottom: var(--calendar-card-title-cut-below);
  }
  .time-beside-title
    > .summary-row.title-wrap[data-title-cut='below']
    > .summary:not(.summary-scroll) {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: var(--calendar-card-title-max-lines);
    padding-bottom: 0;
    overflow-y: hidden;
    --calendar-card-summary-ink-room: 0.25em;
  }
  .event-link {
    color: inherit;
    text-decoration: underline;
    text-decoration-thickness: from-font;
    text-underline-offset: 0.15em;
  }
  .event-link:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 0;
    border-radius: 2px;
  }
  .location span:has(> .event-link:focus-visible),
  .description span:has(> .event-link:focus-visible) {
    -webkit-line-clamp: none;
  }
  ha-card:has(.event-link:hover, .event-link:active, .event-link:focus-visible) > ha-ripple {
    --ha-ripple-hover-opacity: 0;
    --ha-ripple-pressed-opacity: 0;
  }
  .allday-badge,
  .allday-title-pill {
    --badge-ink: color-mix(
      in srgb,
      var(--calendar-card-event-accent) 30%,
      var(--primary-text-color)
    );
    --badge-wash: color-mix(
      in srgb,
      var(--calendar-card-event-accent) 10%,
      var(--calendar-card-background-color, var(--card-background-color))
    );
    --badge-solid: var(--calendar-card-event-accent);
    display: inline-block;
    box-sizing: border-box;
    max-width: 100%;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    border-radius: 999px;
  }
  @supports not (color: color-mix(in srgb, red, blue)) {
    .allday-badge,
    .allday-title-pill {
      --badge-ink: var(--primary-text-color);
      --badge-wash: rgba(128, 128, 128, 0.1);
    }
  }
  .allday-pill-tinted {
    color: var(--badge-ink);
    background-color: var(--badge-wash);
    box-shadow: inset 0 0 0 1px var(--badge-solid);
  }
  .allday-badge {
    font-size: 0.85em;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    line-height: 1.05;
    padding-block: 0.193em 0.127em;
    padding-inline: 0.5em;
    margin-inline-end: 5px;
  }
  .allday-title-pill {
    font-size: 0.95em;
    line-height: 1.16;
    padding-block: 0.21em;
    padding-inline: 0.55em;
    font-weight: 400;
    vertical-align: middle;
    margin-block: -0.17em;
  }
  @supports (text-box-trim: trim-both) and (text-box-edge: cap alphabetic) {
    .allday-badge {
      text-box-trim: trim-both;
      text-box-edge: cap alphabetic;
      padding-block: 0.3295em;
    }
  }
  .allday-pill-subtle {
    color: var(--badge-ink);
    background-color: var(--badge-wash);
    box-shadow: none;
  }
  .allday-pill-outline {
    color: var(--badge-solid);
    background-color: transparent;
    box-shadow: inset 0 0 0 1px currentColor;
  }
  .allday-pill-filled {
    color: var(--calendar-card-background-color, var(--card-background-color));
    background-color: color-mix(
      in srgb,
      var(--badge-solid) 85%,
      var(--calendar-card-background-color, var(--card-background-color))
    );
    box-shadow: none;
  }
  @supports not (color: color-mix(in srgb, red, blue)) {
    .allday-pill-filled {
      background-color: var(--badge-solid);
    }
  }
  @supports (color: color-mix(in oklab, red, blue)) {
    .allday-badge,
    .allday-title-pill {
      --badge-ink: color-mix(
        in oklab,
        var(--calendar-card-event-accent) 45%,
        var(--primary-text-color)
      );
      --badge-wash: color-mix(
        in oklab,
        var(--calendar-card-event-accent) 14%,
        var(--calendar-card-background-color, var(--card-background-color))
      );
    }
  }
  @supports (color: oklch(from red l c h)) and (content-visibility: auto) and
    (width: round(1px, 1px)) {
    .allday-badge,
    .allday-title-pill {
      --badge-ink: oklch(
        from color-mix(in oklab, var(--calendar-card-event-accent) 45%, var(--primary-text-color)) l
          calc(c * 2.2) h
      );
      --badge-wash: oklch(
        from
          color-mix(
            in oklab,
            var(--calendar-card-event-accent) 14%,
            var(--calendar-card-background-color, var(--card-background-color))
          )
          l calc(c * 1.8) h
      );
    }
  }
  @supports (color: oklch(from red l c h)) and (content-visibility: auto) and
    (width: round(1px, 1px)) {
    .allday-pill-filled {
      color: oklch(from var(--badge-solid) clamp(0, calc((l - 0.55) * -1000), 1) 0 h);
      background-color: var(--badge-solid);
    }
  }
  .allday-badge.allday-source-text,
  .allday-title-pill.allday-source-text {
    --badge-ink: var(--badge-source);
    --badge-wash: color-mix(in srgb, var(--badge-source) 14%, transparent);
    --badge-solid: var(--badge-source);
  }
  @supports not (color: color-mix(in srgb, red, blue)) {
    .allday-badge.allday-source-text,
    .allday-title-pill.allday-source-text {
      --badge-wash: rgba(128, 128, 128, 0.26);
    }
  }
  .time-location .event-weather {
    display: flex;
    flex-wrap: nowrap;
    row-gap: 2px;
    align-items: var(--calendar-card-event-icon-vertical-alignment);
    font-size: var(--calendar-card-weather-event-font-size, 12px);
    line-height: 1.2;
    font-weight: normal;
    margin-top: 2px;
    margin-inline-start: 0;
    margin-inline-end: 12px;
    padding-inline-start: calc(var(--calendar-card-weather-event-icon-size, 14px) + 4px);
  }
  .time-location .event-weather ha-icon {
    margin-inline-end: 4px;
    margin-inline-start: calc(-1 * (var(--calendar-card-weather-event-icon-size, 14px) + 4px));
    color: var(--calendar-card-weather-event-color, var(--secondary-text-color));
  }
  .time-location .event-weather .event-weather-text {
    min-width: 0;
    flex: 1 1 auto;
    color: var(--calendar-card-weather-event-color, var(--secondary-text-color));
    overflow-wrap: break-word;
  }
  .time-location .event-weather .weather-condition {
    display: var(--calendar-card-weather-event-condition-display);
    -webkit-box-orient: vertical;
    -webkit-line-clamp: var(--calendar-card-weather-event-max-lines);
    overflow: hidden;
    hyphens: manual;
    padding-inline: var(--calendar-card-weather-condition-inline-room, 0px);
    margin-inline: calc(-1 * var(--calendar-card-weather-condition-inline-room, 0px));
  }
  .time-location .event-weather .event-weather-text > span + span::before {
    content: '\\2060·\\200B';
    margin-inline-start: 4px;
    margin-inline-end: 4px;
  }
  .time-location .event-weather:dir(rtl) .event-weather-text > span + span::before {
    unicode-bidi: isolate;
  }
  .event-weather:dir(rtl) .event-weather-text > span {
    unicode-bidi: isolate;
  }
  .time-location .event-weather .weather-uv-index {
    margin-inline-start: 0;
    font-weight: normal;
  }
  .description span {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: var(--calendar-card-description-max-lines);
    overflow: hidden;
  }
  .time .time-actual > span:not(.time-text):not(.allday-badge):not(.now-time) {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: var(--calendar-card-time-max-lines);
    overflow: hidden;
  }
  .location span {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: var(--calendar-card-location-max-lines);
    overflow: hidden;
  }
  .time .time-actual > span:not(.time-text):not(.allday-badge):not(.now-time),
  .location span,
  .description span {
    padding-top: 0.375em;
    margin-top: -0.375em;
    padding-inline: var(--calendar-card-inline-room);
    margin-inline: calc(-1 * var(--calendar-card-inline-room));
  }
  @supports (overflow: clip) and (contain-intrinsic-size: 1px) {
    .time .time-actual > span:not(.time-text):not(.allday-badge):not(.now-time) {
      overflow-x: clip;
      overflow-y: var(--calendar-card-time-overflow);
      min-width: 0;
    }
    .location span {
      overflow-x: clip;
      overflow-y: var(--calendar-card-location-overflow);
      min-width: 0;
    }
    .description span {
      overflow-x: clip;
      overflow-y: var(--calendar-card-description-overflow);
      min-width: 0;
    }
  }
  .progress-bar {
    width: var(--calendar-card-progress-bar-width, 60px);
    height: var(--calendar-card-progress-bar-height);
    background-color: color-mix(in srgb, var(--calendar-card-progress-bar-color) 20%, transparent);
    border-radius: 999px;
    overflow: hidden;
    margin-inline-start: auto;
    margin-inline-end: 12px;
  }
  .progress-bar-row {
    width: var(--calendar-card-progress-bar-width, 80%);
    margin-inline-start: 0;
    margin-top: 2px;
    font-size: var(--calendar-card-font-size-time);
  }
  .progress-bar-filled {
    height: 100%;
    background-color: var(--calendar-card-progress-bar-color);
    border-start-start-radius: 999px;
    border-end-start-radius: 999px;
  }
  @supports not (color: color-mix(in srgb, red, blue)) {
    .progress-bar {
      background-color: rgba(128, 128, 128, 0.2);
    }
  }
  ha-icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    position: relative;
    vertical-align: top;
    top: 0;
    margin-inline-end: 4px;
  }
  .time ha-icon {
    --mdc-icon-size: var(--calendar-card-icon-size-time, 14px);
  }
  .location ha-icon {
    --mdc-icon-size: var(--calendar-card-icon-size-location, 14px);
  }
  .description ha-icon {
    --mdc-icon-size: var(--calendar-card-icon-size-description, 14px);
  }
  .loading,
  .error {
    text-align: center;
    padding: 16px;
  }
  .error {
    color: var(--error-color);
  }
  .fetch-error {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    margin: 8px 0 0;
    margin-inline-start: 8px;
    color: var(--error-color);
    font-size: 12px;
    line-height: 16px;
  }
  .calendar-card-pro.column-view .fetch-error,
  .calendar-card-pro.grid-view .fetch-error {
    margin-inline-start: 0;
  }
  .fetch-error-icon {
    flex: none;
    --mdc-icon-size: 1.25em;
  }
  .fetch-error-text {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .event-interactive {
    cursor: pointer;
  }
  @media (hover: hover) {
    .event-interactive:hover {
      box-shadow: inset 0 0 0 100vmax
        color-mix(in srgb, var(--ha-ripple-hover-color) 8%, transparent);
    }
  }
  .event-interactive:active {
    box-shadow: inset 0 0 0 100vmax
      color-mix(in srgb, var(--ha-ripple-pressed-color) 16%, transparent);
  }
  @supports (content-visibility: auto) {
    @media (hover: hover) {
      .event-interactive:hover {
        box-shadow: inset 0 0 0 100vmax
          var(
            --calendar-card-event-wash-hover,
            color-mix(in srgb, var(--ha-ripple-hover-color) 8%, transparent)
          );
      }
    }
    .event-interactive:active {
      box-shadow: inset 0 0 0 100vmax
        var(
          --calendar-card-event-wash-pressed,
          color-mix(in srgb, var(--ha-ripple-pressed-color) 16%, transparent)
        );
    }
  }
  @supports not (color: color-mix(in srgb, red, blue)) {
    @media (hover: hover) {
      .event-interactive:hover {
        box-shadow: inset 0 0 0 100vmax rgba(128, 128, 128, 0.08);
      }
    }
    .event-interactive:active {
      box-shadow: inset 0 0 0 100vmax rgba(128, 128, 128, 0.16);
    }
  }
  .event-interactive:focus {
    outline: none;
  }
  .event-interactive:focus-visible {
    outline: 2px solid var(--calendar-card-line-color-vertical);
    outline-offset: -2px;
  }
  .column-events > .event-interactive:focus-visible {
    outline: none;
  }
  .column-events > .event-interactive:focus-visible::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    outline: 2px solid var(--calendar-card-line-color-vertical);
    outline-offset: -2px;
    pointer-events: none;
  }
  td.event.search-ring::after,
  .column-events > .event.search-ring::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
  }
  td.event.search-ring::after,
  .column-events > .event.search-ring::after,
  .grid-event.search-ring,
  .grid-banner.search-ring {
    outline: 2px solid var(--primary-color);
    outline-offset: -2px;
    animation: ccp-search-ring 2s ease-out forwards;
  }
  .column-events > .event.search-ring:focus-visible::after,
  .grid-event.search-ring:focus-visible,
  .grid-banner.search-ring:focus-visible {
    animation-name: ccp-search-ring-to-focus;
  }
  @keyframes ccp-search-ring {
    75% {
      outline-color: var(--primary-color);
    }
    100% {
      outline-color: transparent;
    }
  }
  @keyframes ccp-search-ring-to-focus {
    75% {
      outline-color: var(--primary-color);
    }
    100% {
      outline-color: var(--calendar-card-line-color-vertical);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    td.event.search-ring::after,
    .column-events > .event.search-ring::after,
    .column-events > .event.search-ring:focus-visible::after,
    .grid-event.search-ring,
    .grid-event.search-ring:focus-visible,
    .grid-banner.search-ring,
    .grid-banner.search-ring:focus-visible {
      animation: none;
    }
  }
  ha-card:has(.event-interactive:hover, .event-interactive:active, .event-interactive:focus-visible)
    > ha-ripple {
    --ha-ripple-hover-opacity: 0;
    --ha-ripple-pressed-opacity: 0;
  }
  ha-card[data-own-press] > ha-ripple {
    --ha-ripple-pressed-opacity: 0;
  }
  .event-tappable {
    position: relative;
    isolation: isolate;
  }
  .event-button,
  .event-button::before,
  .event-button::after {
    border-radius: inherit;
  }
  .event-button::before,
  .event-button::after {
    content: '';
    position: absolute;
    inset: 0;
  }
  .event-button::before {
    z-index: -1;
  }
  .event-button::after {
    pointer-events: none;
  }
  @media (hover: hover) {
    .event-button.event-interactive:hover {
      box-shadow: none;
    }
    .event-button:hover::before {
      background-color: var(
        --calendar-card-event-wash-hover,
        color-mix(in srgb, var(--ha-ripple-hover-color) 8%, transparent)
      );
    }
  }
  .event-button.event-interactive:active {
    box-shadow: none;
  }
  .event-button:active::before {
    background-color: var(
      --calendar-card-event-wash-pressed,
      color-mix(in srgb, var(--ha-ripple-pressed-color) 16%, transparent)
    );
  }
  @supports not (color: color-mix(in srgb, red, blue)) {
    @media (hover: hover) {
      .event-button:hover::before {
        background-color: rgba(128, 128, 128, 0.08);
      }
    }
    .event-button:active::before {
      background-color: rgba(128, 128, 128, 0.16);
    }
  }
  .event-button.event-interactive:focus-visible {
    outline: none;
  }
  .event-button:focus-visible::after {
    outline: 2px solid var(--calendar-card-line-color-vertical);
    outline-offset: -2px;
  }
  .date-column:has(> .day-add-button),
  .day-add-button {
    cursor: pointer;
  }
  @media (hover: hover) {
    .date-column:has(> .day-add-button):hover,
    .column-day-header.day-add-button:hover {
      background-color: color-mix(in srgb, var(--ha-ripple-hover-color) 8%, transparent);
    }
  }
  .day-table[data-add-pressed] td.date-column,
  .day-column[data-add-pressed] > .column-day-header,
  .grid-day-header[data-add-pressed] > .column-day-header {
    background-color: color-mix(in srgb, var(--ha-ripple-pressed-color) 16%, transparent);
  }
  .grid-day-body[data-add-pressed]::before {
    content: '';
    position: absolute;
    inset-inline: 0;
    top: var(--calendar-card-add-hour-top, 0);
    height: var(--calendar-card-add-hour-height, 0);
    background-color: color-mix(in srgb, var(--ha-ripple-pressed-color) 16%, transparent);
    pointer-events: none;
  }
  @supports not (color: color-mix(in srgb, red, blue)) {
    @media (hover: hover) {
      .date-column:has(> .day-add-button):hover {
        background-color: rgba(128, 128, 128, 0.08);
      }
      .column-day-header.day-add-button:hover {
        background-color: rgba(128, 128, 128, 0.08);
      }
    }
    .day-table[data-add-pressed] td.date-column,
    .day-column[data-add-pressed] > .column-day-header,
    .grid-day-header[data-add-pressed] > .column-day-header,
    .grid-day-body[data-add-pressed]::before {
      background-color: rgba(128, 128, 128, 0.16);
    }
  }
  .grid-new-event {
    display: contents;
  }
  .grid-new-event > * {
    pointer-events: none;
  }
  .grid-event[data-move-origin] {
    opacity: 0.35;
  }
  .grid-event[data-move-origin='dropped'],
  .grid-event-backdrop:has(+ .grid-event[data-move-origin='dropped']) {
    visibility: hidden;
  }
  ha-card:has(.day-add-button) .grid-day-body,
  ha-card:has(.day-add-button) .grid-allday-band {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
  }
  .day-add-button:focus {
    outline: none;
  }
  .day-add-button:focus-visible {
    outline: 2px solid var(--calendar-card-line-color-vertical);
    outline-offset: -2px;
  }
  ha-card:has(
      [data-add-pressed],
      [data-add-draft],
      .day-add-button:hover,
      .day-add-button:focus-visible
    )
    > ha-ripple {
    --ha-ripple-hover-opacity: 0;
    --ha-ripple-pressed-opacity: 0;
  }
  .loading-indicator {
    position: absolute;
    top: calc(3.5px + max(0px, (var(--ha-card-border-radius, 12px) - 12px) * 0.15));
    inset-inline-end: calc(3.5px + max(0px, (var(--ha-card-border-radius, 12px) - 12px) * 0.15));
    width: 16px;
    height: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    z-index: 5;
    pointer-events: none;
  }
  .loading-indicator .spinner {
    box-sizing: border-box;
    width: 14px;
    height: 14px;
    border: 2px solid color-mix(in srgb, var(--primary-text-color) 25%, transparent);
    border-top-color: var(--primary-text-color);
    border-radius: 50%;
    animation: ccp-spin 0.8s linear infinite;
  }
  @supports not (color: color-mix(in srgb, red, blue)) {
    .loading-indicator .spinner {
      border: 2px solid rgba(128, 128, 128, 0.45);
      border-top-color: var(--primary-text-color);
    }
  }
  .loading-indicator-icon {
    width: 16px;
    height: 16px;
  }
  .loading-indicator.unasked {
    animation: ccp-appear 0s linear 150ms both;
  }
  @keyframes ccp-appear {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes ccp-spin {
    to {
      transform: rotate(360deg);
    }
  }
  .calendar-card-pro.column-view {
    padding-inline: 16px;
  }
  .calendar-card-pro.column-view .content-container {
    margin-inline-end: -16px;
    padding-inline-end: 16px;
  }
  .calendar-card-pro.column-view .card-header {
    margin-inline-start: 0;
  }
  .calendar-card-pro.column-view .card-toolbar {
    padding-inline-start: 0;
  }
  .column-grid {
    display: grid;
    grid-template-rows: auto auto;
    align-items: start;
    width: 100%;
  }
  .day-column {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .column-day-header {
    position: relative;
    padding-bottom: var(--calendar-card-column-header-gap, 8px);
  }
  .column-date-content {
    display: grid;
    grid-template-columns: auto auto 1fr;
    grid-template-areas:
      'weekday weekday .'
      'day month weather';
    align-items: baseline;
    column-gap: 6px;
    row-gap: 2px;
    position: relative;
    z-index: 2;
    min-width: 0;
    grid-template-rows: minmax(var(--calendar-card-date-weekday-row, auto), auto) auto;
  }
  .column-date-content::before,
  .column-date-content::after {
    content: var(--calendar-card-date-strut, none);
    grid-area: day;
    justify-self: start;
    width: 0;
    visibility: hidden;
    line-height: 1;
    pointer-events: none;
  }
  .column-date-content::before {
    font-size: var(--calendar-card-date-text-strut-size);
  }
  .column-date-content::after {
    content: none;
  }
  .column-date-content.with-today-tile::before {
    display: flex;
    align-items: center;
    min-height: 1.2em;
  }
  .column-date-content.with-today-tile::after {
    content: var(--calendar-card-date-strut, none);
    font-size: var(--calendar-card-date-day-strut-size);
    display: flex;
    align-items: center;
    box-sizing: border-box;
    height: 1.2em;
    margin: 0;
  }
  @supports (text-box: trim-both cap alphabetic) {
    .column-date-content.with-today-tile::after {
      display: block;
      align-content: center;
      text-box: trim-both cap alphabetic;
    }
  }
  .column-date-content .weekday {
    grid-area: weekday;
    align-self: var(--calendar-card-date-weekday-align, auto);
  }
  .column-date-content .day {
    grid-area: day;
  }
  .column-date-content.with-today-tile .day:not(.today-tile) {
    display: flex;
    align-items: center;
    min-height: 1.2em;
  }
  .column-date-content .day.today-tile {
    margin: 0;
  }
  .column-date-content .month {
    grid-area: month;
  }
  .column-date-content .today-indicator-container.inline {
    grid-area: weekday;
    justify-self: start;
    align-self: center;
    z-index: 3;
  }
  .column-date-content.with-today-indicator .weekday {
    padding-inline-start: calc(var(--calendar-card-today-indicator-size, 6px) + 4px);
  }
  .column-date-content .weather {
    grid-area: weather;
    justify-self: start;
    align-self: baseline;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .column-header-separator {
    margin-bottom: var(--calendar-card-column-header-gap, 8px);
  }
  .column-grid > .column-week-number {
    justify-self: start;
    margin-bottom: 2px;
  }
  .column-events {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .column-events.with-event-gap {
    row-gap: var(--calendar-card-event-gap);
  }
  .column-events .time-countdown,
  .column-events .progress-bar {
    margin-inline-end: 0;
  }
  .column-events .time {
    justify-content: flex-start;
    box-sizing: border-box;
    column-gap: 4px;
    padding-inline-start: calc(var(--calendar-card-icon-size-time, 14px) + 4px);
  }
  .column-events .time-actual {
    margin-inline-start: calc(-1 * (var(--calendar-card-icon-size-time, 14px) + 4px));
  }
  .column-events .time-countdown {
    margin-inline-start: 0;
    text-align: start;
    white-space: normal;
    overflow-wrap: anywhere;
  }
  .column-events .time-countdown::before {
    content: '·';
    margin-inline-end: 4px;
    overflow-wrap: normal;
  }
  .column-events .time-actual:has(> .allday-badge + .time-text),
  .time-beside-title .time-actual:has(> .allday-badge + .time-text) {
    flex-wrap: wrap;
    margin-inline-start: 0;
  }
  .column-events .time-actual:has(> .allday-badge + .time-text) > ha-icon {
    margin-inline-start: calc(-1 * (var(--calendar-card-icon-size-time, 14px) + 4px));
  }
  .column-events .time-actual:has(> .allday-badge + .time-text) > .allday-badge,
  .time-beside-title .time-actual:has(> .allday-badge + .time-text) > .allday-badge {
    max-width: calc(100% - 5px);
  }
  .column-events
    .time-actual:has(> .allday-badge + .time-text > .time-countdown:first-child)
    > .allday-badge,
  .time-beside-title
    .time-actual:has(> .allday-badge + .time-text > .time-countdown:first-child)
    > .allday-badge {
    max-width: calc(100% - 9px - 0.5em);
  }
  .column-events .time-actual .allday-badge + .time-text:has(> .time-countdown:first-child),
  .column-events .time-actual .allday-badge + .time-text > .time-countdown:first-child,
  .time-beside-title .time-actual .allday-badge + .time-text:has(> .time-countdown:first-child),
  .time-beside-title .time-actual .allday-badge + .time-text > .time-countdown:first-child {
    display: contents;
  }
  .column-separator {
    align-self: stretch;
    justify-self: start;
    pointer-events: none;
  }
  .calendar-card-pro.grid-view {
    --calendar-card-grid-inset: 16px;
    padding-inline: var(--calendar-card-grid-inset);
  }
  .calendar-card-pro.grid-view .card-header {
    margin-inline-start: 0;
  }
  .calendar-card-pro.grid-view .card-toolbar {
    padding-inline-start: 0;
  }
  .grid-container {
    display: grid;
    grid-template-rows:
      auto auto var(--calendar-card-grid-allday-height, auto)
      var(--calendar-card-grid-body-height, 720px);
    width: 100%;
    margin-inline: calc(-1 * var(--calendar-card-grid-inset));
    padding-inline: var(--calendar-card-grid-inset);
    --calendar-card-grid-event-gap: 1px;
  }
  .grid-axis {
    position: relative;
    box-sizing: border-box;
    padding-inline: ${4}px ${8}px;
    overflow: hidden;
  }
  .grid-axis-sizer {
    visibility: hidden;
    pointer-events: none;
    height: 0;
    overflow: hidden;
  }
  .grid-axis-sizer span {
    display: block;
    font-size: var(--calendar-card-font-size-time);
    line-height: 1;
    white-space: nowrap;
  }
  .grid-axis-label {
    position: absolute;
    top: clamp(0px, calc(var(--calendar-card-grid-axis-label-top) - 0.5em), calc(100% - 1em));
    inset-inline-end: 8px;
    font-size: var(--calendar-card-font-size-time);
    line-height: 1;
    color: var(--secondary-text-color);
    white-space: nowrap;
  }
  .grid-rules {
    background-image: ${hp};
    -webkit-mask-image: linear-gradient(
      to bottom,
      transparent 0 var(--calendar-card-grid-rule-width),
      #000 var(--calendar-card-grid-rule-width)
    );
    mask-image: linear-gradient(
      to bottom,
      transparent 0 var(--calendar-card-grid-rule-width),
      #000 var(--calendar-card-grid-rule-width)
    );
    pointer-events: none;
  }
  .grid-separator {
    background-color: var(--calendar-card-grid-rule-paint);
    pointer-events: none;
    z-index: 1;
  }
  .grid-boundary {
    background-color: var(--calendar-card-grid-rule-paint);
    pointer-events: none;
    z-index: 3;
  }
  .grid-boundary-body-end {
    height: var(--calendar-card-grid-rule-width);
  }
  .grid-day-header {
    min-width: 0;
  }
  .grid-container > .column-week-number {
    justify-self: start;
    margin-bottom: 2px;
  }
  .grid-allday-band {
    display: grid;
    row-gap: 2px;
    padding-block-start: calc(var(--calendar-card-grid-band-top-width, 0px) + 2px);
    padding-block-end: calc(var(--calendar-card-grid-band-bottom-width, 0px) + 2px);
    z-index: 2;
    min-height: 0;
    overflow-y: auto;
    align-content: start;
  }
  .grid-banner {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    min-width: 0;
    padding: 1px 6px;
    border-radius: 999px;
  }
  .grid-banner.continues-before {
    border-start-start-radius: 4px;
    border-end-start-radius: 4px;
  }
  .grid-banner.continues-after {
    border-start-end-radius: 4px;
    border-end-end-radius: 4px;
  }
  .grid-banner-title {
    font-size: var(--calendar-card-font-size-event);
    font-weight: 500;
    line-height: 1.2;
    color: var(--calendar-card-color-event);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-inline: var(--calendar-card-inline-room);
    margin-inline: calc(-1 * var(--calendar-card-inline-room));
  }
  @supports (overflow: clip) and (contain-intrinsic-size: 1px) {
    .grid-banner-title {
      overflow-x: clip;
      overflow-y: visible;
      min-width: 0;
    }
  }
  .grid-banner.continues-before .grid-banner-title::before {
    content: '\\25C2\\00A0';
  }
  .grid-banner.continues-after .grid-banner-title::after {
    content: '\\00A0\\25B8';
  }
  .grid-banner-timed {
    position: relative;
    container: calendar-card-grid-banner / inline-size;
    font-size: var(--calendar-card-font-size-event);
  }
  .grid-banner-timed .grid-banner-title {
    font-size: inherit;
  }
  .grid-banner-content {
    display: flex;
    flex: 1 1 auto;
    align-items: center;
    gap: 0.5em;
    min-width: 0;
  }
  .grid-banner-time {
    flex: none;
    font-size: inherit;
    line-height: 1.2;
    color: var(--calendar-card-color-event);
    white-space: nowrap;
  }
  .grid-banner-time-end {
    margin-inline-start: auto;
  }
  @container calendar-card-grid-banner (width < 12em) {
    .grid-banner-two-times .grid-banner-time-end {
      display: none;
    }
  }
  @container calendar-card-grid-banner (width < 8em) {
    .grid-banner-time {
      display: none;
    }
  }
  @container calendar-card-grid-banner (width < 16em) {
    .grid-banner-long-times.grid-banner-two-times .grid-banner-time-end {
      display: none;
    }
  }
  @container calendar-card-grid-banner (width < 11em) {
    .grid-banner-long-times .grid-banner-time {
      display: none;
    }
  }
  .grid-banner-lasts {
    container: calendar-card-grid-banner / inline-size;
    font-size: var(--calendar-card-font-size-event);
  }
  .grid-banner-lasts .grid-banner-title {
    font-size: inherit;
  }
  .grid-banner-duration {
    flex: none;
    margin-inline-start: 0.35em;
    font-size: inherit;
    font-weight: 500;
    line-height: 1.2;
    color: var(--calendar-card-color-event);
    white-space: nowrap;
  }
  .grid-banner-timed .grid-banner-duration {
    margin-inline-start: 0;
  }
  .grid-banner-lasts.continues-after .grid-banner-title::after {
    content: none;
  }
  .grid-banner-lasts.continues-after .grid-banner-duration::after {
    content: '\\00A0\\25B8';
  }
  @container calendar-card-grid-banner (width < 10em) {
    .grid-banner-duration {
      display: none;
    }
    .grid-banner-lasts.continues-after .grid-banner-title::after {
      content: '\\00A0\\25B8';
    }
  }
  @container calendar-card-grid-banner (width < 20em) {
    .grid-banner-timed .grid-banner-duration {
      display: none;
    }
    .grid-banner-timed.grid-banner-lasts.continues-after .grid-banner-title::after {
      content: '\\00A0\\25B8';
    }
  }
  @container calendar-card-grid-banner (width < 24em) {
    .grid-banner-long-times .grid-banner-duration {
      display: none;
    }
    .grid-banner-lasts.continues-after .grid-banner-long-times .grid-banner-title::after {
      content: '\\00A0\\25B8';
    }
  }
  .grid-day-body {
    position: relative;
    min-width: 0;
  }
  .grid-day-plane {
    position: absolute;
    inset: 0;
    container-type: size;
  }
  .grid-weekend {
    background-color: var(--calendar-card-grid-weekend, transparent);
    pointer-events: none;
  }
  .grid-today {
    background-color: var(--calendar-card-grid-today, transparent);
    pointer-events: none;
  }
  .grid-event,
  .grid-event-backdrop {
    position: absolute;
    box-sizing: border-box;
    overflow: hidden;
    --calendar-card-grid-block-floor: 14px;
    --calendar-card-grid-block-min-height: min(var(--calendar-card-grid-block-floor), 100%);
    min-height: var(--calendar-card-grid-block-min-height);
    max-height: 100%;
    padding: 2px 4px;
    --calendar-card-grid-text-start: calc(6px + var(--calendar-card-line-width-vertical));
    padding-inline-start: var(--calendar-card-grid-text-start);
    border-radius: 4px;
    line-height: 1.25;
    container: calendar-card-grid-event / size;
    --calendar-card-grid-block-gap-above: calc(
      var(--calendar-card-grid-event-gap) + var(--calendar-card-grid-rule-width)
    );
    --calendar-card-grid-block-gap-below: var(--calendar-card-grid-event-gap);
    top: clamp(
      0px,
      calc(var(--calendar-card-grid-block-top) + var(--calendar-card-grid-block-gap-above)),
      calc(100% - var(--calendar-card-grid-block-min-height))
    );
    height: calc(
      var(--calendar-card-grid-block-height) - var(--calendar-card-grid-block-gap-above) - var(
          --calendar-card-grid-block-gap-below
        )
    );
  }
  .grid-event-accessible {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .grid-event-disclosure,
  .grid-event-disclosure .event-content {
    display: flex;
    flex-direction: column;
    min-height: 0;
    height: 100%;
  }
  .grid-event-disclosure .summary-row {
    --calendar-card-grid-title-eligible: 0;
    display: none;
    flex: 0 0 auto;
    min-height: 0;
    overflow: hidden;
    padding-inline: var(--calendar-card-event-row-room);
    margin-inline: calc(-1 * var(--calendar-card-event-row-room));
  }
  @supports (overflow: clip) and (contain-intrinsic-size: 1px) {
    .grid-event-disclosure .summary-row {
      overflow-x: clip;
      overflow-y: visible;
    }
  }
  .grid-event-disclosure .summary {
    min-height: 0;
    padding-block: var(--calendar-card-summary-ink-room, 0px) 0;
    margin-top: calc(-1 * var(--calendar-card-summary-ink-room, 0px));
    padding-inline-start: var(--calendar-card-summary-inline-room);
    text-indent: 0;
  }
  .grid-event-disclosure .summary,
  .grid-event-disclosure .event-title {
    -webkit-line-clamp: var(--calendar-card-grid-title-lines-compact);
  }
  .grid-event-disclosure .event-title {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
    --calendar-card-title-inline-room: var(--calendar-card-inline-room);
    overflow-wrap: break-word;
    word-break: normal;
    hyphens: manual;
  }
  @supports (overflow: clip) and (contain-intrinsic-size: 1px) {
    .grid-event-disclosure .event-title {
      overflow-x: clip;
      overflow-y: var(--calendar-card-title-overflow);
    }
  }
  .grid-event-disclosure .title-word {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: top;
    padding-inline: var(--calendar-card-inline-room);
    margin-inline: calc(-1 * var(--calendar-card-inline-room));
  }
  @supports (overflow: clip) and (contain-intrinsic-size: 1px) {
    .grid-event-disclosure .title-word {
      overflow-x: clip;
      overflow-y: visible;
    }
  }
  .grid-event:not(
      [data-grid-title-fit='measuring'],
      [data-grid-title-fit='compact'],
      [data-grid-title-fit='blank']
    )
    .grid-event-disclosure
    .summary:not(.summary-scroll):has(> .label-icon, > .label-image):has(> .event-title .title-word)
    > .event-title {
    vertical-align: baseline;
  }
  .grid-event:not(
      [data-grid-title-fit='measuring'],
      [data-grid-title-fit='compact'],
      [data-grid-title-fit='blank']
    )
    .grid-event-disclosure
    .summary:not(.summary-scroll):has(> .label-icon, > .label-image)
    .title-word {
    vertical-align: middle;
  }
  .grid-event:not(
      [data-grid-title-fit='measuring'],
      [data-grid-title-fit='compact'],
      [data-grid-title-fit='blank']
    )
    .grid-event-disclosure
    .title-words
    > .title-word:first-child {
    max-width: calc(100% - var(--calendar-card-grid-title-label-run, 0px));
  }
  .grid-event:not(
      [data-grid-title-fit='measuring'],
      [data-grid-title-fit='compact'],
      [data-grid-title-fit='blank']
    )
    .grid-event-disclosure
    .title-words
    > .title-word[data-grid-title-cut] {
    max-width: var(--calendar-card-grid-title-cut-room);
  }
  .grid-event:not(
      [data-grid-title-fit='measuring'],
      [data-grid-title-fit='compact'],
      [data-grid-title-fit='blank']
    )
    .grid-event-disclosure
    .title-words
    > .title-word[data-grid-title-cut]::after {
    content: '\\2026';
  }
  .grid-event:not(
      [data-grid-title-fit='measuring'],
      [data-grid-title-fit='compact'],
      [data-grid-title-fit='blank']
    )
    .grid-event-disclosure
    .title-words
    > .title-word[data-grid-title-cut]
    ~ * {
    display: none;
  }
  .grid-event:not(
      [data-grid-title-fit='measuring'],
      [data-grid-title-fit='compact'],
      [data-grid-title-fit='blank']
    )
    .grid-event-disclosure
    .summary[data-grid-title-lines],
  .grid-event:not(
      [data-grid-title-fit='measuring'],
      [data-grid-title-fit='compact'],
      [data-grid-title-fit='blank']
    )
    .grid-event-disclosure
    .summary[data-grid-title-lines]
    > .event-title {
    -webkit-line-clamp: var(--calendar-card-grid-title-fit-lines);
    padding-bottom: 0;
    overflow-y: hidden;
    --calendar-card-summary-ink-room: 0.375em;
    --calendar-card-title-ink-room: 0.375em;
  }
  .grid-event-disclosure .summary:not(.summary-scroll):has(> .event-title:not(:only-child)) {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    --calendar-card-summary-ink-room: var(--calendar-card-title-ink-room);
  }
  .grid-event:not(
      [data-grid-title-fit='measuring'],
      [data-grid-title-fit='compact'],
      [data-grid-title-fit='blank'],
      [data-grid-title-gap='yielded']
    )
    .grid-event-disclosure
    .summary:not(.summary-scroll):not([data-grid-title-lines]):has(
      > .event-title:not(:only-child)
    ) {
    padding-bottom: 2px;
  }
  .grid-event-disclosure
    .summary:not(.summary-scroll):has(> .event-title:not(:only-child))
    > .event-title {
    display: inline;
    --calendar-card-title-ink-room: 0px;
    --calendar-card-title-inline-room: 0px;
  }
  .grid-event-disclosure .summary:dir(ltr) > .event-title {
    text-align: left;
  }
  .grid-event-disclosure .summary:dir(rtl) > .event-title {
    text-align: right;
  }
  .grid-event-disclosure .label-icon,
  .grid-event-disclosure .label-image {
    unicode-bidi: isolate;
  }
  .grid-event-disclosure .time-location,
  .grid-event-disclosure .time,
  .grid-event-disclosure .location,
  .grid-event-disclosure .description,
  .grid-event-disclosure .event-weather {
    flex: 0 0 auto;
  }
  .grid-event-disclosure .location,
  .grid-event-disclosure .description,
  .grid-event-disclosure .event-weather {
    margin-inline-end: 0;
  }
  .grid-event-disclosure .time,
  .grid-event-disclosure .time-actual,
  .grid-event-disclosure .time-text {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .grid-event-disclosure .time {
    padding-inline: var(--calendar-card-inline-room);
    margin-inline: calc(-1 * var(--calendar-card-inline-room))
      calc(12px - var(--calendar-card-inline-room));
  }
  .grid-event-disclosure .time-actual {
    padding-inline: var(--calendar-card-inline-room);
    margin-inline: calc(-1 * var(--calendar-card-inline-room));
  }
  @supports (overflow: clip) and (contain-intrinsic-size: 1px) {
    .grid-event-disclosure .time,
    .grid-event-disclosure .time-actual {
      overflow-x: clip;
      overflow-y: visible;
    }
  }
  .grid-event-disclosure .time {
    flex-wrap: nowrap;
  }
  .grid-event-disclosure .time .time-actual .time-text {
    overflow: visible;
    text-overflow: clip;
    white-space: normal;
  }
  .grid-event-disclosure .time .time-actual > span:not(.time-text):not(.allday-badge) {
    display: block;
    text-overflow: ellipsis;
    padding-top: 0;
    margin-top: 0;
  }
  .grid-event-disclosure {
    --calendar-card-time-display: inline;
    --calendar-card-time-max-lines: none;
    --calendar-card-time-overflow: visible;
    --calendar-card-time-ink-room: 0px;
    --calendar-card-time-inline-room: 0px;
  }
  .grid-event.clipped-top,
  .grid-event-backdrop.clipped-top {
    border-start-start-radius: 0;
    border-start-end-radius: 0;
  }
  .grid-event.clipped-bottom,
  .grid-event-backdrop.clipped-bottom {
    border-end-start-radius: 0;
    border-end-end-radius: 0;
  }
  .grid-event.clipped-top::before,
  .grid-event.clipped-bottom::after {
    content: '';
    position: absolute;
    inset-inline: var(--calendar-card-grid-text-start) 4px;
    border-block-start: 1px dashed currentColor;
    opacity: 0.45;
    pointer-events: none;
  }
  .grid-event.clipped-top::before {
    top: 0;
  }
  .grid-event.clipped-bottom::after {
    bottom: 0;
  }
  .grid-event > .event-accent-bar {
    inset-inline-start: 3px;
    inset-block: 3px;
    border-radius: 999px;
  }
  .grid-event.clipped-top > .event-accent-bar {
    inset-block-start: 0;
    border-start-start-radius: 0;
    border-start-end-radius: 0;
  }
  .grid-event.clipped-bottom > .event-accent-bar {
    inset-block-end: 0;
    border-end-start-radius: 0;
    border-end-end-radius: 0;
  }
  .grid-event.clipped-top.event-interactive:focus-visible > .event-accent-bar {
    inset-block-start: 2px;
  }
  .grid-event.clipped-bottom.event-interactive:focus-visible > .event-accent-bar {
    inset-block-end: 2px;
  }
  .grid-event-disclosure .time,
  .grid-event-disclosure .location,
  .grid-event-disclosure .description,
  .grid-event-disclosure .event-weather,
  .grid-event-disclosure .progress-bar-row {
    display: none;
  }
  .grid-event-disclosure .grid-event-detail-clipped {
    display: none !important;
  }
  @container calendar-card-grid-event (min-height: 19px) {
    .grid-event-disclosure .summary-row {
      --calendar-card-grid-title-eligible: 1;
      display: flex;
    }
  }
  @container calendar-card-grid-event (min-height: 36px) {
    .grid-event-disclosure .summary,
    .grid-event-disclosure .event-title {
      -webkit-line-clamp: var(--calendar-card-grid-title-lines-medium);
    }
  }
  @container calendar-card-grid-event (min-height: 19px) {
    .grid-event-disclosure:where(.grid-time-fits) .time {
      display: block;
    }
  }
  @container calendar-card-grid-event (min-height: 40px) {
    .grid-event-disclosure:where(.grid-time-fits) .summary,
    .grid-event-disclosure:where(.grid-time-fits) .event-title {
      -webkit-line-clamp: var(--calendar-card-grid-title-lines-compact);
    }
  }
  .time .time-actual .time-end {
    display: inline;
    vertical-align: baseline;
  }
  .time .time-actual .time-end > .time-end-reading,
  .time .time-actual .time-end > .time-duration {
    display: inline;
    vertical-align: baseline;
  }
  .grid-event-disclosure.grid-time-no-icon .time .time-actual > ha-icon {
    display: none;
  }
  .grid-event-disclosure.grid-time-no-end .time .time-actual .time-end {
    display: none;
  }
  .grid-event-disclosure.grid-time-no-end-reading .time .time-actual .time-end-reading {
    display: none;
  }
  .grid-event-disclosure.grid-time-no-countdown .time .time-actual .time-text > .time-countdown {
    display: none;
  }
  .grid-event-disclosure.grid-time-no-countdown .time .time-actual .time-text {
    white-space: nowrap;
  }
  .grid-event-disclosure.grid-time-wrap .time .time-actual .time-end {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-inline: var(--calendar-card-inline-room);
    margin-inline: calc(-1 * var(--calendar-card-inline-room));
  }
  .grid-event-disclosure.grid-time-wrap .time .time-actual .time-text .time-end {
    display: inline;
    overflow: visible;
    text-overflow: clip;
    padding-inline: 0;
    margin-inline: 0;
  }
  .grid-event-disclosure.grid-time-wrap .time .time-actual .time-text .time-end::before {
    content: '\\A';
    white-space: pre;
  }
  .grid-event-disclosure .time .time-actual .time-text > .time-countdown {
    overflow-wrap: break-word;
    hyphens: manual;
  }
  .grid-event-disclosure .time-location > .progress-bar-row:first-child + * {
    margin-top: 0;
  }
  @container calendar-card-grid-event (min-height: 48px) {
    .grid-event-disclosure .progress-bar-row {
      display: block;
    }
    .grid-event-disclosure .time-location > .progress-bar-row:first-child + * {
      margin-top: 2px;
    }
  }
  @container calendar-card-grid-event (min-height: 72px) {
    .grid-event-disclosure .summary,
    .grid-event-disclosure .event-title {
      -webkit-line-clamp: var(--calendar-card-grid-title-lines-medium);
    }
    .grid-event-disclosure .location,
    .grid-event-disclosure .description,
    .grid-event-disclosure .event-weather {
      display: flex;
    }
  }
  @container calendar-card-grid-event (min-height: 96px) {
    .grid-event-disclosure .summary,
    .grid-event-disclosure .event-title {
      -webkit-line-clamp: var(--calendar-card-grid-title-lines-expanded);
    }
  }
  .grid-event:is(
      [data-grid-title-fit='measuring'],
      [data-grid-title-fit='compact'],
      [data-grid-title-fit='blank']
    )
    .grid-event-disclosure {
    position: absolute;
    inset-block: 1px;
    inset-inline: var(--calendar-card-grid-text-start) 4px;
    height: auto;
    justify-content: center;
  }
  .grid-event.clipped-top:is(
      [data-grid-title-fit='measuring'],
      [data-grid-title-fit='compact'],
      [data-grid-title-fit='blank']
    )
    .grid-event-disclosure {
    inset-block-start: 2px;
  }
  .grid-event.clipped-bottom:is(
      [data-grid-title-fit='measuring'],
      [data-grid-title-fit='compact'],
      [data-grid-title-fit='blank']
    )
    .grid-event-disclosure {
    inset-block-end: 2px;
  }
  .grid-event:is(
      [data-grid-title-fit='measuring'],
      [data-grid-title-fit='compact'],
      [data-grid-title-fit='blank']
    )
    .event-content {
    height: auto;
  }
  .grid-event[data-grid-title-fit] .summary-row {
    transform: translateY(var(--calendar-card-grid-title-shift, 0px));
  }
  .grid-event:is(
      [data-grid-title-fit='measuring'],
      [data-grid-title-fit='compact'],
      [data-grid-title-fit='blank']
    )
    .summary-row {
    display: flex;
    overflow: visible;
  }
  .grid-event:is(
      [data-grid-title-fit='measuring'],
      [data-grid-title-fit='compact'],
      [data-grid-title-fit='blank']
    )
    .summary {
    display: flex !important;
    align-items: center;
    min-width: 0;
    padding: 0;
    margin: 0;
    text-indent: 0;
    overflow: visible;
    white-space: nowrap;
    -webkit-line-clamp: unset;
    zoom: var(--calendar-card-grid-title-scale, 1);
  }
  .grid-event:is(
      [data-grid-title-fit='measuring'],
      [data-grid-title-fit='compact'],
      [data-grid-title-fit='blank']
    )
    .summary
    > :not(.event-title) {
    flex: 0 0 auto;
    white-space: nowrap;
  }
  .grid-event:is(
      [data-grid-title-fit='measuring'],
      [data-grid-title-fit='compact'],
      [data-grid-title-fit='blank']
    )
    .summary
    > .event-title {
    display: block !important;
    flex: 1 1 auto;
    min-width: 0;
    padding: 0 var(--calendar-card-inline-room);
    margin-inline: calc(-1 * var(--calendar-card-inline-room));
    text-overflow: ellipsis;
    -webkit-line-clamp: unset;
    --calendar-card-title-ink-room: 0px;
  }
  @supports (overflow: clip) and (contain-intrinsic-size: 1px) {
    .grid-event:is(
        [data-grid-title-fit='measuring'],
        [data-grid-title-fit='compact'],
        [data-grid-title-fit='blank']
      )
      .summary
      > .event-title {
      overflow-x: clip;
      overflow-y: visible;
    }
  }
  .grid-event:is(
      [data-grid-title-fit='measuring'],
      [data-grid-title-fit='compact'],
      [data-grid-title-fit='blank']
    )
    .title-word {
    display: inline;
    max-width: none;
    overflow: visible;
    vertical-align: baseline;
    padding-inline: 0;
    margin-inline: 0;
  }
  @media (prefers-reduced-motion: no-preference) {
    .grid-event[data-grid-title-fit='compact']
      .summary
      > .event-title.title-scrollable.title-overflowing:not([data-title-motion='pending']) {
      text-overflow: clip;
    }
  }
  .grid-event:is([data-grid-title-fit='measuring'], [data-grid-title-fit='blank'])
    .event-title-scroll {
    display: inline !important;
    animation: none !important;
    transform: none !important;
    will-change: auto;
  }
  .grid-event:is(
      [data-grid-title-fit='measuring'],
      [data-grid-title-fit='compact'],
      [data-grid-title-fit='blank']
    )
    .time-location {
    display: none;
  }
  .grid-event:is([data-grid-title-fit='measuring'], [data-grid-title-fit='blank']) .summary-row {
    visibility: hidden;
  }
  .grid-event-raised {
    isolation: isolate;
  }
  .grid-event-backdrop {
    --calendar-card-grid-backdrop-base: var(
      --calendar-card-background-color,
      var(--card-background-color)
    );
    --calendar-card-grid-backdrop-rules-y: calc(
      -1 *
        clamp(
          0px,
          calc(var(--calendar-card-grid-raised-top) + var(--calendar-card-grid-block-gap-above)),
          calc(100cqh - min(var(--calendar-card-grid-block-floor), 100cqh))
        )
    );
    container: none;
    padding: 0;
    background-color: var(--calendar-card-grid-backdrop-base);
    pointer-events: none;
  }
  .grid-event-backdrop-ground,
  .grid-event-backdrop-rules {
    position: absolute;
    inset: 0;
  }
  .grid-event-backdrop-ground {
    -webkit-mask-image: linear-gradient(
      var(--calendar-card-grid-backdrop-base),
      var(--calendar-card-grid-backdrop-base)
    );
    mask-image: linear-gradient(
      var(--calendar-card-grid-backdrop-base),
      var(--calendar-card-grid-backdrop-base)
    );
  }
  .grid-day-body.weekend .grid-event-backdrop-ground {
    background-color: var(--calendar-card-grid-weekend, transparent);
  }
  .grid-day-body.today .grid-event-backdrop-ground {
    background-color: var(--calendar-card-grid-today, transparent);
  }
  .grid-day-body.today.weekend .grid-event-backdrop-ground {
    background-color: var(
      --calendar-card-grid-today,
      var(--calendar-card-grid-weekend, transparent)
    );
  }
  .grid-event-backdrop-rules {
    background-image: ${hp};
    background-size: 100% 100cqh;
    background-position: 0 var(--calendar-card-grid-backdrop-rules-y);
    background-repeat: no-repeat;
    -webkit-mask-image: linear-gradient(
      to bottom,
      transparent 0 var(--calendar-card-grid-rule-width),
      #000 var(--calendar-card-grid-rule-width)
    );
    mask-image: linear-gradient(
      to bottom,
      transparent 0 var(--calendar-card-grid-rule-width),
      #000 var(--calendar-card-grid-rule-width)
    );
    -webkit-mask-size: 100% 100cqh;
    mask-size: 100% 100cqh;
    -webkit-mask-position: 0 var(--calendar-card-grid-backdrop-rules-y);
    mask-position: 0 var(--calendar-card-grid-backdrop-rules-y);
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
  }
  .grid-event-raised > .grid-event-accessible::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    box-sizing: border-box;
    border: 1px solid
      color-mix(in srgb, var(--calendar-card-event-accent-bar-color, transparent) 20%, transparent);
    border-radius: 4px;
    pointer-events: none;
  }
  .grid-event-raised.clipped-top > .grid-event-accessible::before {
    border-start-start-radius: 0;
    border-start-end-radius: 0;
  }
  .grid-event-raised.clipped-bottom > .grid-event-accessible::before {
    border-end-start-radius: 0;
    border-end-end-radius: 0;
  }
  @supports not (color: color-mix(in srgb, red, blue)) {
    .grid-event-raised > .grid-event-accessible::before {
      border: 1px solid rgba(128, 128, 128, 0.2);
    }
  }
  .grid-event.grid-event-content-limited {
    container: none;
  }
  .grid-event.grid-event-content-limited .grid-event-disclosure {
    --calendar-card-grid-text-gaps: calc(
      var(--calendar-card-grid-block-gap-above) + var(--calendar-card-grid-block-gap-below)
    );
    --calendar-card-grid-text-gutters: calc(2 * var(--calendar-card-grid-event-gap));
    --calendar-card-grid-text-chrome: calc(
      var(--calendar-card-grid-text-start) + 4px + var(--calendar-card-grid-text-gutters)
    );
    container: calendar-card-grid-event / size;
    height: calc(
      var(--calendar-card-grid-text-block-ratio, 1) *
        (100% + 4px + var(--calendar-card-grid-text-gaps)) -
        (4px + var(--calendar-card-grid-text-gaps))
    );
    width: calc(
      var(--calendar-card-grid-text-inline-ratio, 1) *
        (100% + var(--calendar-card-grid-text-chrome)) - var(--calendar-card-grid-text-chrome)
    );
    overflow: hidden;
    padding-inline-start: var(--calendar-card-grid-block-room);
    margin-inline-start: calc(-1 * var(--calendar-card-grid-block-room));
  }
  .grid-event.grid-event-content-limited:is(
      [data-grid-title-fit='measuring'],
      [data-grid-title-fit='compact'],
      [data-grid-title-fit='blank']
    )
    .grid-event-disclosure {
    inset-block-end: auto;
    inset-inline-end: auto;
    height: calc(
      var(--calendar-card-grid-text-block-ratio, 1) * (100% + var(--calendar-card-grid-text-gaps)) -
        (2px + var(--calendar-card-grid-text-gaps))
    );
    width: calc(
      var(--calendar-card-grid-text-inline-ratio, 1) *
        (100% + var(--calendar-card-grid-text-gutters)) - var(--calendar-card-grid-text-chrome)
    );
  }
  .grid-event-overflow {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-inline: 0;
    overflow: visible;
    border: 1px dashed var(--secondary-text-color);
    background: transparent;
    color: var(--secondary-text-color);
  }
  .grid-event-overflow-label {
    font-size: var(--calendar-card-font-size-time);
    white-space: nowrap;
  }
  .grid-now-line {
    position: absolute;
    inset-inline: 0;
    height: 2px;
    background: var(--calendar-card-now-color, #34d399);
    pointer-events: none;
  }
  @supports (background-position: 0 calc(1cqh - clamp(0px, 1cqh, 100cqh))) {
    .grid-day-plane-now .grid-event-now {
      background-image: linear-gradient(
        var(--calendar-card-now-color, #34d399),
        var(--calendar-card-now-color, #34d399)
      );
      background-repeat: no-repeat;
      background-size: 100% 2px;
      background-position: 0
        calc(
          var(--calendar-card-grid-now-y) - clamp(
              0px,
              calc(
                var(--calendar-card-grid-block-top-cqh) + var(--calendar-card-grid-block-gap-above)
              ),
              calc(100cqh - min(var(--calendar-card-grid-block-floor), 100cqh))
            )
        );
    }
  }
  .grid-now-dot {
    position: absolute;
    inset-inline-start: -3px;
    width: 8px;
    height: 8px;
    margin-top: -3px;
    border-radius: 50%;
    background: var(--calendar-card-now-color, #34d399);
    pointer-events: none;
    z-index: 2;
  }
`,pp=[{option:"event_font_size",property:"--calendar-card-font-size-event",kind:"text"},{option:"time_font_size",property:"--calendar-card-font-size-time",kind:"text"},{option:"location_font_size",property:"--calendar-card-font-size-location",kind:"text"},{option:"description_font_size",property:"--calendar-card-font-size-description",kind:"text"},{option:"time_icon_size",property:"--calendar-card-icon-size-time",kind:"icon"},{option:"location_icon_size",property:"--calendar-card-icon-size-location",kind:"icon"},{option:"description_icon_size",property:"--calendar-card-icon-size-description",kind:"icon"},{option:"weather.event.font_size",property:"--calendar-card-weather-event-font-size",kind:"text",unsetAs:"12px"},{option:"weather.event.icon_size",property:"--calendar-card-weather-event-icon-size",kind:"icon"}];function fp(e,t){if(e._isEmptyDay)return 1;const n=ic(e._entityId,"text_scale",t,e);return"number"==typeof n&&Number.isFinite(n)&&n>0?n:1}const gp="event-text-scaled",vp=new WeakMap,_p=Object.freeze({});function yp(e,t){if(1===t||!Number.isFinite(t)||t<=0)return _p;let n=vp.get(e);n||(n=new Map,vp.set(e,n));const i=n.get(t);if(i)return i;const r=up(e),a=up(function(e,t,n){const i={...e},r={...e.weather?.event??{}};for(const{option:e,property:a,kind:o,unsetAs:s}of pp){const l=t[a];if("string"!=typeof l)continue;const d="text"===o?Or(l,n,s):zr(l,n),c=/^weather\.event\.(.+)$/.exec(e);c?r[c[1]]=d:i[e]=d}return i.weather={...e.weather??{},event:r},i}(e,r,t)),o={};for(const[e,t]of Object.entries(a))r[e]!==t&&(o[e]=t);const s=r["--calendar-card-weather-event-icon-size"];if("string"==typeof s){const e=zr(s,t,!1);e!==(o["--calendar-card-weather-event-icon-size"]??s)&&(o["--calendar-card-weather-event-title-icon-size"]=e)}return n.set(t,o),o}function wp(e){const t=Boolean(e._isEmptyDay),n=new Date,i=new Date(n.getFullYear(),n.getMonth(),n.getDate());let r=!1;if(t)r=!!e.start.date&&Zo(e.start.date)<i;else if(e.start.dateTime){const t=e.end.dateTime?new Date(e.end.dateTime):null;r=null!==t&&n>t}else{let t=e.end.date?Zo(e.end.date):null;if(t){const e=new Date(t);e.setDate(e.getDate()-1),t=e}r=null!==t&&i>t}return r}function bp(e,t,n,i=wp(e)){const r=!e.start.dateTime;if(!t.show_countdown||r&&!t.show_countdown_allday||e._isEmptyDay)return null;if(t.show_progress_bar&&e._dayOfEvent&&function(e,t){const n=e._sourceStart??e.start,i=n?.dateTime?new Date(n.dateTime):n?.date?Zo(n.date):null;return null!==i&&i<=t}(e,new Date))return null;const a={exactDays:Boolean(t.countdown_exact_days),maxDays:t.countdown_max_days};return i?function(e,t="en",n={}){if(e._isEmptyDay)return null;const i=new Date,r=qo(e,i);if(!r)return null;const{days:a}=r;if(void 0!==n.maxDays&&a>n.maxDays)return null;if(a>=1&&n.exactDays)return Do(-a,"day",t,"always");if(1===a)return Do(-1,"day",t,"auto");if(a>1){const e=new Date(i.getFullYear(),i.getMonth(),i.getDate());return Eo(new Date(i.getFullYear(),i.getMonth(),i.getDate()-a),t,e)}const o=Math.round((i.getTime()-r.end.getTime())/36e5);return o>=2?Do(-o,"hour",t):Eo(r.end,t,i)}(e,n,a):function(e,t="en",n={}){if(e._isEmptyDay||!e.start)return null;const i=new Date,r=e.start.dateTime?new Date(e.start.dateTime):e.start.date?Zo(e.start.date):null;if(!r||r<=i)return null;const a=as(i,r);if(void 0!==n.maxDays&&a>n.maxDays)return null;if(a>=1&&n.exactDays)return Do(a,"day",t,"always");if(1===a)return Do(1,"day",t);if(a>1){const e=new Date(i.getFullYear(),i.getMonth(),i.getDate());return Eo(new Date(r.getFullYear(),r.getMonth(),r.getDate()),t,e)}const o=Math.round((r.getTime()-i.getTime())/36e5);return o>=2?Do(o,"hour",t):Eo(r,t,i)}(e,n,a)}function xp(e,t,n){const i=new Set;if("once_per_day"!==t.show_countdown)return i;const r=new Date;let a=null;return e.forEach((e,o)=>{const s=bp(e,t,n);if(null===s)return;const l=void 0!==e.start.dateTime&&0===as(r,new Date(e.start.dateTime))||Uo(e,r);s!==a||l||i.add(o),a=s}),i}function kp(e){return{...e,contentParts:{...e.contentParts,countdownStr:null,countUp:!1}}}function $p(e,t,n,i){const r=Boolean(e._isEmptyDay),a=wp(e),o=Qi(),s=e._mergedFrom&&e._mergedFrom.length>1?t.duplicate_accent_color:void 0,l=s||Zd(e._entityId,t,void 0,e,o),d=t.event_background_opacity>0?t.event_background_opacity:0,c=d>0?s?it(s,d):Zd(e._entityId,t,d,e,o):"",u=ic(e._entityId,"show_time",t,e)??t.show_time,h=!e.start.dateTime,m=function(e){if(e.start.dateTime)return!1;const t=Zo(e.start.date||""),n=Zo(e.end.date||"");return n.setDate(n.getDate()-1),t.toDateString()!==n.toDateString()}(e),p=u&&!(h&&!m&&!t.show_single_allday_time)&&!(m&&!t.show_multiday_allday_time)&&!r,f=bp(e,t,n,a),g=t.show_progress_bar&&!r?e._dayOfEvent:void 0,v=null!=g?.day?function(e,t,n){return Io(n).dayOfEvent.replace("{day}",()=>String(e)).replace("{days}",()=>String(t))}(g.day,g.days,n):null,_=rc(e),y=t.show_progress_bar&&!g?ac(e):null,w=_&&t.show_now_indicator&&!r&&!oc(e)?Ao(n):null,b=Ho(e,t,n,i),x=function(e){if("string"==typeof e){const t=e.toLowerCase().trim();return vt.includes(t)?t:null}return null}(t.allday_badge),k=function(e){if("string"==typeof e){const t=e.toLowerCase().trim();if(_t.includes(t))return t}return"subtle"}(t.allday_badge_style),$=void 0!==b.allDayLabel,T=function(e){if("string"!=typeof e)return{source:wt};const t=e.trim();if(""===t)return{source:wt};const n=t.toLowerCase();return yt.includes(n)?{source:n}:{source:"custom",color:t}}(t.allday_badge_color),S="custom"===T.source?T.color:l,M="text"===T.source,D="time"===x&&$?{label:b.allDayLabel,lang:n,accent:S,mode:k,inheritsText:M}:void 0,C="title"===x&&$&&!r?{accent:S,mode:k,inheritsText:M}:void 0,A=D?function({text:e,duration:t}){return t?e?`${e}${Fo}${t}`:t:e}(b):jo(b,n),{location:E,description:L}=Tp(e,t),P=(F=E,ic(e._entityId,"location_icon",t,e)||(function(e){return Boolean(e)&&Ko.test(e)}(F)?"mdi:microsoft-teams":"mdi:map-marker-outline")),N=fp(e,t),I={eventTime:A,eventTimeEnd:Ro(b),eventTimeDuration:Oo(b),allDayBadge:D,titlePill:C,eventLocation:E,locationIcon:P,eventDescription:L,entityLabel:ec(e._entityId,t,e,i),entityLabelAlt:tc(e._entityId,t,e,i),mergedLabels:nc(e,t,i),shouldShowTime:p,countdownStr:f,dayCounter:v,countUp:null!==f&&a,progressPercentage:y,nowLabel:w,languageMark:hm(n,i)};var F;return{isEmptyDay:r,isPastEvent:a,isNow:null!==w,entityAccentColor:l,entityAccentBackgroundColor:c,accentTextProperties:ap(t,l,r),textScaleProperties:yp(t,N),textScaled:1!==N,contentParts:I}}function Tp(e,t){const n=!e.start.dateTime&&!e._splitFromTimedEvent;return{location:n&&!t.show_location_allday?"":e.location||"",description:n&&!t.show_description_allday?"":e.description||""}}function Sp(e){return!0===e.open_links&&"none"===Ls(e.event_tap_action)&&"none"===Ls(e.event_hold_action)}function Mp(e,t){if(Array.isArray(e))for(const n of e){if(null===n||"object"!=typeof n)continue;const{entity:e,name:i}=n;if(e===t&&"string"==typeof i&&""!==i.trim())return i.trim()}}function Dp(e,t,n){return Mp(t?.entities,e)??function(e,t){const n=t?.states?.[e]?.attributes?.friendly_name;return"string"==typeof n&&""!==n.trim()?n:void 0}(e,n)??e}function Cp(e,t,n){const i=Mp(t?.entities,e);return void 0!==i&&void 0===n?.states?.[e]?`${i} (${e})`:Dp(e,t,n)}function Ap(e,t,n,i){return(t.mergedLabels??(t.entityLabel?[{value:t.entityLabel,type:e._matchedConfig?.label_type}]:[])).flatMap(({value:r,type:a})=>{const o=st(r,a);if("none"===o)return[];if("text"===o)return[r];const s=t.mergedLabels?e._mergedFrom?.find(({entityId:t,config:a})=>ec(t,n,{...e,_matchedConfig:a},i)===r):void 0,l=s?.entityId??e._entityId,d=s?{...e,_matchedConfig:s.config}:e,c=Qd(l,n,d);if(void 0!==c&&Ne(c)){const e=i?.states[c]?.attributes.friendly_name;return["string"==typeof e&&e.trim()?e:c]}return l?[Dp(l,n,i)]:[]})}function Ep(e,t,n){const i=n??30;if(!e||!Number.isFinite(t)||t<=0||!Number.isFinite(e.bodyHeightPx)||e.bodyHeightPx<=0||!Number.isFinite(e.fontPx)||e.fontPx<=0||!Number.isFinite(e.chromePx))return i;const r=e.bodyHeightPx/t,a=(Math.max(24,2*e.fontPx)+Math.max(0,e.chromePx-7))/r,o=e=>Math.min(t+1,Math.max(30,5*Math.ceil((e-.05)/5))),s=o(a);if(void 0===n||s>=n)return s;const l=o(a+2);return l<n?l:n}function Lp(e,t){return"number"==typeof e?e:e.get(t)??e.get(1)??30}const Pp="grid-scale-probe";function Np(e){const t=[],n=[];for(const i of e.events){if(i._isEmptyDay)continue;if(!i.start.dateTime||i._gridBanner){t.push(i);continue}const e=Ul(i);e&&n.push({...i,...e})}return{allDay:t,timed:n}}function Ip(e,t){return e.isNewMonth&&!br(t.month_separator_width)?{kind:"month",width:t.month_separator_width,color:t.month_separator_color}:e.isNewWeek&&!br(t.week_separator_width)?{kind:"week",width:t.week_separator_width,color:t.week_separator_color}:br(t.day_separator_width)?null:{kind:"day",width:t.day_separator_width,color:t.day_separator_color}}function Fp(e,t,n,i,r){return B`
    <div
      class="grid-boundary grid-boundary-${e}"
      aria-hidden="true"
      style=${um({gridColumn:"2 / -1",gridRow:String(i),alignSelf:r,height:t,"--calendar-card-grid-rule-paint":Ee(n)})}
    ></div>
  `}function Rp(e,t,n=-1){const i=[];return e.forEach((r,a)=>{const o=new Date(r.timestamp);if(!rs(o,t))return;if(a===n)return;const s=i[i.length-1];void 0!==s&&s.start+s.span===a&&1===as(new Date(e[a-1].timestamp),o)?s.span+=1:i.push({start:a,span:1})}),i.map(({start:e,span:t})=>B`
      <div
        class="grid-weekend"
        aria-hidden="true"
        style=${um({gridColumn:`${e+2} / span ${t}`,gridRow:"3 / span 2"})}
      ></div>
    `)}function Op(e){return B`
    <div
      class="grid-today"
      aria-hidden="true"
      style=${um({gridColumn:`${e+2} / span 1`,gridRow:"3 / span 2"})}
    ></div>
  `}function zp(e){const t=e.trim().toLowerCase();return""!==t&&"transparent"!==t&&"none"!==t}function jp(e,t,n){const i=Math.floor(e/60)%24,r=String(e%60).padStart(2,"0");if(t)return n?`${i}:${r}`:String(i);const a=i<12?"AM":"PM",o=i%12==0?12:i%12;return n?`${o}:${r} ${a}`:`${o} ${a}`}function Hp(e,t,n){const i=e.endMin-e.startMin,r=t/i*100,a=60/i*100,o=(t-e.startMin%t)%t/i*100,s=(60-e.startMin%60)%60/i*100,l=Ee(n);return{"--calendar-card-grid-rule-color":l,"--calendar-card-grid-slot-color":t<60?l:"transparent","--calendar-card-grid-slot-pct":`${r}%`,"--calendar-card-grid-hour-pct":`${a}%`,"--calendar-card-grid-slot-offset":`${o}%`,"--calendar-card-grid-hour-offset":`${s}%`}}function Wp(e,t){return{"--calendar-card-grid-block-top":`${e.topPct}%`,"--calendar-card-grid-block-height":`${e.heightPct}%`,...Bp(e,t),...e.clippedBottom||t.touchedBelow||!t.ruledEnd?{"--calendar-card-grid-block-gap-below":"0px"}:{}}}function Bp(e,t){const n="--calendar-card-grid-block-gap-above";return e.clippedTop?{[n]:"0px"}:t.ruledStart?t.touchedAbove?{[n]:"max(var(--calendar-card-grid-rule-width), var(--calendar-card-grid-event-gap))"}:{}:{[n]:"var(--calendar-card-grid-event-gap)"}}function qp(e,t){return{style:{insetInlineStart:`calc(${e}% + var(--calendar-card-grid-event-gap))`,width:`calc(${t-e}% - var(--calendar-card-grid-event-gap) * 2)`},raised:!1,contentLimited:!1}}function Up(e,t){const n=e.x1Pct-e.x0Pct,i=Math.max(e.startMin,t.startMin),r=Math.min(e.endMin,t.endMin)-i,a=r>0?(e.contentEndMin-i)/r:1,o=n>0?(e.contentX1Pct-e.x0Pct)/n:1,s=a<.999999,l=o<.999999;return{style:{...qp(e.x0Pct,e.x1Pct).style,...s?{"--calendar-card-grid-text-block-ratio":String(a)}:{},...l?{"--calendar-card-grid-text-inline-ratio":String(o)}:{}},raised:e.raised,contentLimited:s||l}}function Vp(e,t,n,i,r,a,o,s,l=!1,d,c=null){const u=$p(e,r,a,s),h=Jc(e,u.entityAccentColor,l),m=function(e,t,n,i,r){const a=t.nowLabel?{...t,nowLabel:null}:t,o={...a,eventTime:"",eventTimeEnd:void 0,eventTimeDuration:void 0,shouldShowTime:!1,countdownStr:null,countUp:!1};if(e._isMultiDaySegment&&!e._gridSegmentStartsEvent){const r=n.show_duration&&t.shouldShowTime?Wo(e,i):null;return r?{...o,eventTime:r,shouldShowTime:!0}:o}const s=e._gridSource??(e._isMultiDaySegment?void 0:e),l=s?.start.dateTime?new Date(s.start.dateTime):void 0,d=s?.end.dateTime?new Date(s.end.dateTime):void 0;if(!(void 0!==s&&void 0!==l&&void 0!==d&&d.getTime()>l.getTime()&&as(l,d)>0)){if(!e._isMultiDaySegment)return a;const t=e.start.dateTime?new Date(e.start.dateTime):void 0;if(!t||Number.isNaN(t.getTime()))return o;const i=hs(n,r);return{...a,eventTime:ls(t,i,n.time_two_digit_hours),eventTimeEnd:void 0}}const c={...e,start:s.start,end:s.end},u=wp(c),h=bp(c,n,i,u),m={...a,countdownStr:h,countUp:null!==h&&u},p=hs(n,r),f=ls(l,p,n.time_two_digit_hours),g=n.show_duration?Wo({...e,start:s.start,end:s.end},i):null,v=g?` ${g}`:"";if(!n.show_end_time)return{...m,eventTime:`${f}${v}`,eventTimeEnd:v||void 0,eventTimeDuration:v||void 0};const _=e=>0===e.getHours()&&0===e.getMinutes(),y=as(l,d),w=1===y&&d.getTime()===$l(d).getTime()&&_(d)&&!_(l)?"":` ⁦(+${y})⁩`,b=` - ${ls(d,p,n.time_two_digit_hours)}${w}${v}`;return{...m,eventTime:`${f}${b}`,eventTimeEnd:b,eventTimeDuration:v||void 0}}(e,u.contentParts,r,a,s),p=u.entityAccentBackgroundColor,f=null!==c&&e.startMin<=c&&c<e.endMin,g=i.raised?B`<div
        class=${Zh({"grid-event-backdrop":!0,"clipped-top":t.clippedTop,"clipped-bottom":t.clippedBottom})}
        aria-hidden="true"
        style=${um({...Wp(t,n),...i.style,"--calendar-card-grid-raised-top":`${t.topPct}cqh`})}
        .calendarCardDaySlot=${eu}
      >
        <div class="grid-event-backdrop-ground">
          <div class="grid-event-backdrop-rules"></div>
        </div>
      </div>`:V;return B`
    ${g}
    <div
      class=${Zh({event:!0,"grid-event":!0,"past-event":u.isPastEvent,"clipped-top":t.clippedTop,"clipped-bottom":t.clippedBottom,"grid-event-raised":i.raised,"grid-event-content-limited":i.contentLimited,"grid-event-now":f,"event-interactive":void 0!==h,"search-ring":!0===e._searchRing,[gp]:u.textScaled})}
      style=${um({...Wp(t,n),...i.style,...f?{"--calendar-card-grid-block-top-cqh":`${t.topPct}cqh`}:{},"--calendar-card-event-accent-bar-color":u.entityAccentColor,backgroundColor:p,...u.accentTextProperties,...u.textScaleProperties})}
      role=${h?"button":V}
      tabindex=${h?"0":V}
      aria-describedby=${h&&d?d:V}
      .calendarCardEventTap=${h}
      .calendarCardDaySlot=${eu}
    >
      ${ep()}
      <div
        class="grid-event-accessible"
        role="group"
        lang=${a}
        aria-label=${function(e,t,n,i,r,a){const o=e._gridSource?{...e,start:e._gridSource.start,end:e._gridSource.end}:e,s=o.start.dateTime!==e.start.dateTime||o.end.dateTime!==e.end.dateTime?$p(o,n,i,a).contentParts:t,l=Xm(e,n,r,"row",a),d=wr(n,"show_now_line")&&rc(e)?Ao(i):"";return[...Ap(e,t,n,a),e.summary,d,s.shouldShowTime?s.eventTime:"",s.countdownStr,t.eventLocation,t.eventDescription,l?.showTemp?`${l.forecast.temperature}°`:"",l?.showUvIndex?`UV${l.forecast.uv_index}`:"",l?.conditionText,null!==t.progressPercentage&&n.show_progress_bar?`${Math.round(t.progressPercentage)}%`:""].filter(e=>"string"==typeof e&&e.trim().length>0).map(e=>`⁨${e.trim()}⁩`).join(", ")}(e,u.contentParts,r,a,o,s)}
      ></div>
      <div class="grid-event-disclosure" aria-hidden="true">
        ${Qm(e,r,m,{weatherForecasts:o,weatherPlacement:"row",progressPlacement:"row",countdownPlacement:"text",hass:s,splitTimeEnd:!0,titleWords:!0})}
      </div>
    </div>
  `}function Gp(e,t,n,i,r,a,o=!1,s){const l=$p(e,i,r,a),d=Jc(e,l.entityAccentColor,o),c=void 0!==e.start.dateTime,u=c?function(e,t,n,i,r){const a={start:null,end:null,long:!1};if(!n.shouldShowTime||!e.start.dateTime||!e.end.dateTime)return a;const o=new Date(e.start.dateTime),s=new Date(e.end.dateTime);if(Number.isNaN(o.getTime())||Number.isNaN(s.getTime()))return a;const l=hs(i,r),d=e=>e.getTime()===$l(e).getTime()?null:us(ls(e,l,i.time_two_digit_hours));return{start:t.continuesBefore?null:d(o),end:t.continuesAfter||!i.show_end_time?null:d(s),long:!l}}(e,t,l.contentParts,i,a):null,h=i.show_duration&&l.contentParts.shouldShowTime?Wo(e,r,function(e,t){if(t.continuesBefore||t.continuesAfter)return!0;const n=e._gridSource??e,i=n.start.date&&n.end.date?as(Zo(n.start.date),Zo(n.end.date)):os(n.start,n.end)?.days??1;return t.span<i}(e,t)):null,m=h?B`<span class="grid-banner-duration">${h}</span>`:V;return B`
    <div
      class=${Zh({event:!0,"grid-banner":!0,"grid-banner-timed":c,"grid-banner-lasts":null!==h,"past-event":l.isPastEvent,"continues-before":t.continuesBefore,"continues-after":t.continuesAfter,"event-interactive":void 0!==d,"search-ring":!0===e._searchRing,[gp]:l.textScaled})}
      style=${um({gridColumn:`${t.columnIndex+2} / span ${t.span}`,...void 0===n?{}:{gridRow:String(n)},backgroundColor:l.entityAccentBackgroundColor,...l.accentTextProperties,...l.textScaleProperties})}
      role=${d?"button":V}
      tabindex=${d?"0":V}
      aria-describedby=${d&&s?s:V}
      .calendarCardEventTap=${d}
      .calendarCardDaySlot=${eu}
    >
      ${u?function(e,t,n,i,r,a,o=V){return B`<div
      class="grid-event-accessible"
      role="group"
      lang=${r}
      aria-label=${function(e,t,n,i){return[...Ap(e,t,n,i),e.summary,t.shouldShowTime?t.eventTime:""].filter(e=>"string"==typeof e&&e.trim().length>0).map(e=>`⁨${e.trim()}⁩`).join(", ")}(e,n,i,a)}
    ></div>
    <div
      class=${Zh({"grid-banner-content":!0,"grid-banner-two-times":null!==t.start&&null!==t.end,"grid-banner-long-times":t.long})}
      aria-hidden="true"
    >
      ${null===t.start?V:B`<span class="grid-banner-time">${t.start}</span>`}
      <span class="grid-banner-title">${e.summary??""}</span>${o}
      ${null===t.end?V:B`<span class="grid-banner-time grid-banner-time-end">${t.end}</span>`}
    </div>`}(e,u,l.contentParts,i,r,a,m):h?B`<span class="grid-banner-title">${e.summary??""}</span>${m}`:B`<span class="grid-banner-title">${e.summary??""}</span>`}
    </div>
  `}const Kp="grid-new-event";function Yp(e,t,n,i,r,a,o,s){const l=Ml(e.startMin,e.endMin,t);if(!l)return V;const[d]=Dl([{...e,x0Pct:0,x1Pct:100}],t,wr(r,"slot_minutes"));return Vp(e,l,d,{...qp(0,100),raised:n},r,a,o,s,!1,void 0,i)}function Jp(e,t,n,i,r){return Gp(e,t,void 0,n,i,r)}function Xp(e,t){const n=[],i=e.map(e=>$l(new Date(e.timestamp))),r=new Map;e.forEach((e,t)=>{for(const n of Np(e).allDay){const e=n._gridSource??n;let i=r.get(e);i||(i=new Map,r.set(e,i));const a=JSON.stringify(n._mergedFrom?.map(e=>e.entityId)??[]),o=i.get(a);o?o.columns.push(t):i.set(a,{event:{...n,...e},columns:[t]})}});const a=[...r.values()].flatMap(e=>[...e.values()]);for(const{event:e,columns:t}of a){const r=[];for(const e of t){const t=r[r.length-1];t&&t.last+1===e?t.last=e:r.push({first:e,last:e})}for(const{first:t,last:a}of r){const r=Vl(e,i.slice(t,a+1));r&&n.push({event:e,placement:{...r,columnIndex:r.columnIndex+t}})}}n.sort((e,t)=>t.placement.span-e.placement.span||e.placement.columnIndex-t.placement.columnIndex);const o=[],s=[];for(const e of n){const n=e.placement.columnIndex,i=n+e.placement.span;let r=o.findIndex(e=>e.every(([e,t])=>i<=e||n>=t));if(r<0){if(o.length>=t)continue;r=o.length,o.push([])}o[r].push([n,i]),s.push({...e,row:r+1})}return s}function Zp(e,t,n,i,r,a=new Date,o=30,s=1/0,l=!1,d,c=!1){if(0===e.length)return B`<div class="grid-container"></div>`;const u=wl(wr(t,"start_time"),wr(t,"end_time")),h=wr(t,"slot_minutes"),m=wr(t,"hour_height"),p=wr(t,"axis_width"),f=wr(t,"max_simultaneous_events"),g=wr(t,"show_now_line"),v=wr(t,"show_axis_labels"),_=wr(t,"allday_band_max_rows"),y=wr(t,"day_header_gap"),w=wr(t,"weekend_background_color"),b=wr(t,"today_background_color"),x=wr(t,"hour_line_width"),k=wr(t,"hour_line_color"),$=(u.endMin-u.startMin)/60,T=Qr(t.day_spacing),S=(M=e).map((e,t)=>{const n=t>0?M[t-1]:void 0;return{isNewWeek:!n||e.weekNumber!==n.weekNumber,isNewMonth:Boolean(n&&e.monthNumber!==n.monthNumber)}});var M;const D=e.map(e=>l||d?Xc(e.timestamp):void 0),C=Xp(e,_),A=C.reduce((e,t)=>Math.max(e,t.row),0),E=Math.max(A,c?1:0),L=S.map((e,n)=>({separator:Ip(e,t),index:n})).filter(({separator:e,index:t})=>null!==e&&t>0).map(({separator:e,index:t})=>function(e,t,n){return B`
    <div
      class="grid-separator grid-separator-${e.kind}"
      style=${um({gridColumn:String(t+2),gridRow:"3 / span 2",width:e.width,"--calendar-card-grid-rule-paint":Ee(e.color),marginInlineStart:`calc(-0.5 * (${n} + ${e.width}))`})}
    ></div>
  `}(e,t,T)),P=wr(t,"day_header_separator_width"),N=wr(t,"day_header_separator_color"),I=wr(t,"allday_band_line_width"),F=wr(t,"allday_band_line_color"),R=[...E>0&&!br(P)?[Fp("band-top",P,N,3,"start")]:[],...br(I)?[]:[Fp("band-bottom",I,F,E>0?3:4,E>0?"end":"start")]],O=null!=t.height&&""!==t.height&&"auto"!==t.height,z="cramp"===da(t,"grid"),j=O&&A>0;return B`
    <div
      class="grid-container"
      tabindex=${z?"0":V}
      style=${um({gridTemplateColumns:`${p} repeat(${e.length}, minmax(${z?"2rem":"0"}, 1fr))`,...z?{overflowX:"auto"}:{},columnGap:T,"--calendar-card-grid-body-height":O?"minmax(50%, 1fr)":`calc(${m} * ${$})`,...O?{height:"100%","--calendar-card-grid-allday-height":"minmax(0, auto)"}:{},"--calendar-card-column-header-gap":y,"--calendar-card-grid-band-top-width":P,"--calendar-card-grid-band-bottom-width":I,"--calendar-card-grid-rule-width":x,...Hp(u,h,k),...zp(w)?{"--calendar-card-grid-weekend":Ee(w)}:{},...zp(b)?{"--calendar-card-grid-today":Ee(b)}:{}})}
    >
      ${function(e,t,n,i){const r=zp(n),a=zp(i);if(!r&&!a)return V;const o=a?e.findIndex(e=>Rm(e.timestamp).isToday):-1;return[...r?Rp(e,t,o):[],...-1===o?[]:[Op(o)]]}(e,r,w,b)}
      ${function(e,t){const n=e.map((n,i)=>{const r=i>0?e[i-1]:void 0;return!(r&&n.weekNumber===r.weekNumber||0===i&&!t.show_current_week_number)});return null!==t.show_week_numbers&&n.some(Boolean)?e.map((e,t)=>Wm(e.weekNumber,n[t],t+2)):e.map(()=>V)}(e,t)}
      ${e.map((e,a)=>function(e,t,n,i,r,a,o,s){const l=new Date(e.timestamp),{isToday:d,isTomorrow:c,isPast:u}=Rm(e.timestamp),h=Fm(l,t,r);return B`
    <div
      class=${Zh({"grid-day-header":!0,today:d,tomorrow:c,"future-day":!d,"past-day":u,weekend:rs(l,a)})}
      style=${um({gridColumn:String(i+2),gridRow:"2"})}
      .calendarCardDaySlot=${iu(e.timestamp)}
    >
      ${Hm(l,t,n,d,h,null,a,o,s&&{label:s.label,timestamp:e.timestamp})}
    </div>
  `}(e,t,n,a,i,r,D[a],d))}
      ${E>0?B`
              <div
                class="grid-allday-band"
                role=${j?"group":V}
                aria-label=${j?Xo(Io(n).allDay):V}
                tabindex=${j?"0":V}
                style=${um({gridColumn:`1 / span ${e.length+1}`,gridRow:"3",gridTemplateColumns:"subgrid",gridTemplateRows:`repeat(${E}, auto)`})}
                .calendarCardDaySlot=${nu}
              >
                ${C.map(e=>Gp(e.event,e.placement,e.row,t,n,r,l,D[e.placement.columnIndex]))}
              </div>
            `:V}
      ${v?function(e,t,n){const i=e.endMin-e.startMin,r=hs(t,n),a=bl(Number(wr(t,"axis_label_minutes"))),o=a%60!=0,s=function(e,t){const n=bl(t),i=[];for(let t=Math.ceil(e.startMin/n)*n;t<=e.endMin;t+=n)i.push(t);return i}(e,a).map(t=>({text:us(jp(t,r,o)),topPct:(t-e.startMin)/i*100}));return B`
    <div class="grid-axis" style=${um({gridColumn:"1",gridRow:"4"})}>
      <div class="grid-axis-sizer" aria-hidden="true">
        ${s.map(({text:e})=>B`<span>${e}</span>`)}
      </div>
      ${s.map(({text:e,topPct:t})=>B`<div
            class="grid-axis-label"
            style=${um({"--calendar-card-grid-axis-label-top":`${t}%`})}
          >
            ${e}
          </div>`)}
    </div>
  `}(u,t,r):V} ${W=e.length,B`
    <div
      class="grid-rules"
      aria-hidden="true"
      style=${um({gridColumn:`2 / span ${W}`,gridRow:"4"})}
    ></div>
  `}
      ${function(e,t){return xl(e.endMin,t)}(u,h)?(H=k,B`
    <div
      class="grid-boundary grid-boundary-body-end"
      aria-hidden="true"
      style=${um({gridColumn:"2 / -1",gridRow:"4",alignSelf:"end","--calendar-card-grid-rule-paint":Ee(H)})}
    ></div>
  `):V}
      ${e.map((e,d)=>function(e,t,n,i,r,a,o,s,l,d,c,u,h=!1,m){const p=new Date(e.timestamp),{isToday:f,isPast:g}=Rm(e.timestamp),{timed:v}=Np(e),_=v.filter(e=>Sl(e.startMin,e.endMin,t)),y="cascade"===wr(n,"overlap_layout"),w=[],b=[];if(y){const e=function(e,t,n){const i=Number.isFinite(n.maxLanes)?Math.max(1,Math.floor(n.maxLanes)):1,r=100/(i+1),a=[...e].sort((e,t)=>e.startMin-t.startMin||t.endMin-e.endMin),o=new Set;for(;;){const e=Hl(a,t,n,i,o),s=e.filter(e=>!e.hidden&&null!==e.host&&(e.x1-e.x0<r-Rl||e.contentX1-e.x0<r-Rl)).map(e=>e.host.order).filter(e=>!o.has(e));if(0===s.length)return Bl(e);s.forEach(e=>o.add(e))}}(_,t,{thresholdMin:Lp(o,1),hostThresholdMin:e=>Lp(o,fp(e,n)),indentPct:6,maxDepth:3,maxLanes:a,stripPct:s});for(const n of e.placed)w.push({event:n,horizontal:Up(n,t),span:n});for(const t of e.overflows)b.push({overflow:t,horizontal:qp(t.x0Pct,t.x1Pct),span:t})}else{const{placed:e,overflows:t}=function(e,t,n=1/0){const i=Number.isFinite(t)?Math.max(1,Math.floor(t)):1,r=[...e].sort((e,t)=>e.startMin-t.startMin||t.endMin-e.endMin),a=[];let o=[],s=Al;for(const e of r)o.length>0&&Ll(s,e.startMin)&&(a.push(o),o=[],s=Al),o.push(e),s=Pl(s,El(e));o.length>0&&a.push(o);const l=[],d=[];for(const e of a){const t=Fl(e,i),r=t.reduce((e,t)=>Math.max(e,t.laneIndex+1),0),{share:a,overflowStart:o}=Il(0,100,r,i,n),s=e=>({laneIndex:e,x0Pct:e*a,x1Pct:(e+1)*a});if(r<=i){for(const e of t)l.push({...e.event,...s(e.laneIndex),laneCount:r});continue}const c=t.filter(e=>e.laneIndex<i),u=t.filter(e=>e.laneIndex>=i).map(e=>e.event),h=i+1;for(const e of c)l.push({...e.event,...s(e.laneIndex),laneCount:h});for(const e of Nl(u,e=>e))d.push({startMin:Math.min(...e.map(e=>e.startMin)),endMin:Math.max(...e.map(e=>e.endMin)),laneIndex:i,laneCount:h,x0Pct:o,x1Pct:100,hidden:e})}return{placed:l,overflows:d}}(_,a,s);for(const t of e)w.push({event:t,horizontal:qp(t.x0Pct,t.x1Pct),span:t});for(const e of t)b.push({overflow:e,horizontal:qp(e.x0Pct,e.x1Pct),span:e})}const x=Dl([...w,...b].map(({span:e})=>e),t,wr(n,"slot_minutes")),k=new Date(d);k.setSeconds(0,0);const $=l&&f?Cl(k,t):null,T=null===$?null:kl(k),S=um({top:`${$}%`});return B`
    <div
      class=${Zh({"grid-day-body":!0,today:f,"past-day":g,weekend:rs(p,u)})}
      style=${um({gridColumn:String(r+2),gridRow:"4"})}
      .calendarCardDaySlot=${M=e.timestamp,D=t.startMin,C=t.endMin,{kind:"time",timestamp:M,startMin:D,endMin:C}}
    >
      ${null===$?V:B`<div class="grid-now-line" aria-hidden="true" style=${S}></div>`}
      <div
        class=${Zh({"grid-day-plane":!0,"grid-day-plane-now":null!==$})}
        style=${um(null===$?{}:{"--calendar-card-grid-now-y":`${$}cqh`})}
      >
        ${lm(w,({event:e},t)=>`${e._entityId}-${e.summary}-${t}`,({event:e,horizontal:r},a)=>{const o=Ml(e.startMin,e.endMin,t);return o?Vp(e,o,x[a],r,n,i,c,u,h,m,T):V})}
        ${b.map(({overflow:e,horizontal:n},r)=>{const a=Ml(e.startMin,e.endMin,t);return a?function(e,t,n,i,r){const a=mm(`+${e.hidden.length}`,r);return B`
    <div
      class="event grid-event grid-event-overflow"
      title=${e.hidden.map(e=>e.summary??"").join("\n")}
      style=${um({...Wp(t,n),...i.style})}
      .calendarCardDaySlot=${eu}
    >
      <div class="grid-event-overflow-label">${a}</div>
    </div>
  `}(e,a,x[w.length+r],n,hm(i,u)):V})}
      </div>
      ${null===$?V:B`<div class="grid-now-dot" aria-hidden="true" style=${S}></div>`}
    </div>
  `;var M,D,C}(e,u,t,n,d,f,o,s,g,a,i,r,l,D[d]))}
      ${L} ${R}
    </div>
  `;var H,W}const Qp="#010203",ef=/\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\([^()]*\)|#[0-9a-f]{3,8}\b|\btransparent\b/gi,tf=/\b(?:url|image|image-set|cross-fade|element|paint|color-mix)\(|\bcurrentcolor\b/i;function nf(e,t){if(e.fillStyle=Qp,e.fillStyle=t,e.fillStyle===Qp)return;e.clearRect(0,0,1,1),e.fillRect(0,0,1,1);const[n,i,r,a]=e.getImageData(0,0,1,1).data;return[n,i,r,a]}function rf(e,t,n){const i=getComputedStyle(e),r=i.backgroundColor,a=i.backgroundImage,o=function(e,t){const n=e.createElement("canvas");n.width=1,n.height=1;const i=n.getContext("2d",{willReadFrequently:!0});if(!i)return;const r=nf(i,t.background);if(!r)return;const a=""===(o=t.image)||"none"===o?[]:tf.test(o)?void 0:o.match(ef)??void 0;var o;return a?.length&&a.every(e=>255===nf(i,e)?.[3])?void 0:function(e,t,n){if(255===e[3])return;let i=void 0!==n&&.2126*n[0]+.7152*n[1]+.0722*n[2]>127.5?[0,0,0]:[255,255,255];for(const n of[t,e]){if(!n)continue;const e=n[3]/255;i=i.map((t,i)=>n[i]*e+t*(1-e))}const[r,a,o]=i.map(Math.round);return`rgb(${r}, ${a}, ${o})`}(r,nf(i,t.page()),nf(i,t.ink))}(e.ownerDocument,{background:r,image:a,ink:getComputedStyle(n).color,page:()=>getComputedStyle(t).backgroundColor});return void 0!==o?o:""!==a&&"none"!==a||function(e){const t=e.trim();return""!==t&&"undefined"!=typeof CSS&&"function"==typeof CSS.supports&&!CSS.supports("background-color",t)}(i.getPropertyValue("--calendar-card-surface-value"))?r:void 0}function af(e,t,n){void 0===n?e.style.removeProperty(t):e.style.getPropertyValue(t)!==n&&e.style.setProperty(t,n)}const of=new Map;function sf(e,t){const n=e.scrollTop;e.style.maxHeight="";const i=e.getBoundingClientRect(),r=e.ownerDocument.defaultView,a="rtl"===getComputedStyle(t).direction,o=t.getBoundingClientRect(),s=function(e,t,n,i){const r=i?e.right-t.width:e.left,a=Math.max(8,n.width-8-t.width),o=Math.min(Math.max(r,8),a),s=n.height-e.bottom-4-8,l=e.top-4-8;if(t.height<=s)return{left:o,top:e.bottom+4,maxHeight:void 0};if(t.height<=l)return{left:o,top:e.top-4-t.height,maxHeight:void 0};if(s>=l)return{left:o,top:e.bottom+4,maxHeight:Math.max(0,s)};const d=Math.max(0,l);return{left:o,top:e.top-4-d,maxHeight:d}}(o,{width:i.width,height:i.height},{width:r?.innerWidth??i.width,height:r?.innerHeight??i.height},a);return e.style.left=`${s.left}px`,e.style.top=`${s.top}px`,void 0!==s.maxHeight&&(e.style.maxHeight=`${s.maxHeight}px`),e.scrollTop=n,{top:o.top,left:o.left}}function lf(e,t){const n=e.querySelector(`:scope > .${t.surface}`),i=e.querySelector(`:scope > .${t.page}`),r=n&&i?rf(n,i,e):void 0;af(e,"--calendar-card-legend-menu-surface",n&&i?r??getComputedStyle(n).backgroundColor:void 0)}function df(e,t){const n=of.get(e);n&&(n.reason??=t,e.open?e.close():cf(e))}function cf(e){const t=of.get(e);if(!t)return;of.delete(e),t.stop(),t.opener.setAttribute("aria-expanded","false");const n=t.reason??"escape";("escape"===n||!t.pressed&&("backdrop"===n||"button"===n))&&t.opener.isConnected&&t.opener.focus({preventScroll:!0})}function uf(e,t,n,i){of.has(t)?df(t,"button"):n||function(e,t,n,i){if(e.open||of.has(e)||!e.isConnected)return;try{e.showModal()}catch{return}const r=sf(e,t);lf(e,i),n&&e.focus({preventScroll:!0}),t.setAttribute("aria-expanded","true");const a=e.ownerDocument.defaultView??window,o=n=>{if(n.composedPath().includes(e))return;const i=of.get(e);i&&!function(e,t){const n=e.getBoundingClientRect();return Math.abs(n.top-t.top)>=.5||Math.abs(n.left-t.left)>=.5}(t,i.placedAt)||df(e,"scroll")},s=()=>df(e,"resize"),l=()=>cf(e);a.addEventListener("scroll",o,{capture:!0,passive:!0}),a.addEventListener("resize",s),e.addEventListener("close",l),of.set(e,{opener:t,pressed:n,parts:i,reason:void 0,placedAt:r,stop:()=>{a.removeEventListener("scroll",o,{capture:!0}),a.removeEventListener("resize",s),e.removeEventListener("close",l)}})}(t,e.currentTarget,e.detail>0,i)}function hf(e){e.stopPropagation();const t=e.currentTarget;if(e.target!==t)return;const n=t.getBoundingClientRect();e.clientX>=n.left&&e.clientX<=n.right&&e.clientY>=n.top&&e.clientY<=n.bottom||df(t,"backdrop")}function mf(e,t){for(const[n,i]of[...of])void 0!==t&&i.parts.kind!==t||n.isConnected&&!e.contains(n)||df(n,"gone")}function pf(e,t){return[...of].some(([n,i])=>(void 0===t||i.parts.kind===t)&&e.contains(n))}const ff="Calendars",gf="calendar-card-pro-legend-changed",vf={kind:"legend",surface:"legend-menu-surface",page:"legend-menu-page"};function _f(e){e.stopPropagation()}function yf(e){return um({"--calendar-card-legend-color":e.color})}function wf(e,t,n,i){return B`<button
    type="button"
    class=${n?"legend-menu-action unavailable":"legend-menu-action"}
    data-action=${t?"show-all":"hide-all"}
    aria-disabled=${n?"true":V}
    ?autofocus=${i}
    @click=${()=>{e.inert||n||e.onSetAll(t)}}
  >
    ${t?e.showAllLabel:e.hideAllLabel}
  </button>`}function bf(e){const t=[];for(const n of e){const e="string"==typeof n?n:n?.entity;"string"!=typeof e||""===e||t.includes(e)||t.push(e)}return t.filter(t=>!1!==function(e,t){if(Array.isArray(e))for(const n of e){if(null===n||"object"!=typeof n)continue;const{entity:e,show_in_legend:i}=n;if(e===t&&"boolean"==typeof i)return i}}(e,t))}const xf={list:[["2","3","10","7","2"],["15","3","31","7","2",".4"],["2","12.5","10","7","2"],["15","12.5","31","7","2",".4"],["2","22","10","7","2"],["15","22","31","7","2",".4"]],column:[["2","3","13","5","2"],["17.5","3","13","5","2"],["33","3","13","5","2"],["2","10.5","13","18.5","2",".4"],["17.5","10.5","13","18.5","2",".4"],["33","10.5","13","18.5","2",".4"]],grid:[["9","3","11","4","1.5"],["22","3","11","4","1.5"],["35","3","11","4","1.5"],["9","9","24","3","1.5",".55"],["2","15.5","5","1.5",".75",".5"],["2","21","5","1.5",".75",".5"],["2","26.5","5","1.5",".75",".5"],["9","14.5","11","6","1.5",".4"],["9","23","11","5","1.5",".4"],["22","14.5","11","13.5","1.5",".4"],["35","19","11","7","1.5",".4"]]},kf="Refresh",$f="Reset",Tf={kind:"overflow",surface:"custom-menu-surface",page:"custom-menu-page"},Sf={list:"viewList",column:"viewColumns",grid:"viewGrid"};function Mf(e){e.stopPropagation()}const Df=new WeakMap,Cf=new WeakSet;function Af(e){try{return e.matches(":open")}catch{return}}function Ef(e){const t=e.pointerType||"mouse";return e.detail>0?{x:e.clientX,y:e.clientY,pointerType:t}:void 0}function Lf(e){return[...jf(e)?[{kind:"filter"}]:[],...e.addEvent?[{kind:"add"}]:[],...(e.customButtons??[]).map((e,t)=>({kind:"button",index:t}))]}function Pf(e,t){switch(t.kind){case"filter":{const t=jf(e);return t?function(e){const t=e.name??ff,n=e.calendars.some(e=>!e.shown),i=e.calendars.every(e=>!e.shown),r=wf(e,!0,!n,n),a=wf(e,!1,i,!n);return B`<button
      type="button"
      class=${n?"toolbar-button legend-button filtered":"toolbar-button legend-button"}
      aria-haspopup="dialog"
      aria-expanded="false"
      aria-label=${t}
      title=${e.name??V}
      @pointerdown=${_f}
      @click=${t=>{t.stopPropagation();const n=(i=t.currentTarget,i.parentElement?.querySelector("dialog.legend-menu")??null);var i;n&&uf(t,n,e.inert,vf)}}
    >
      <svg class="toolbar-button-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d=${"M6 1H8V3H16V1H18V3H19C20.11 3 21 3.9 21 5V11H19V8H5V19H15V21H5C3.9 21 3 20.11 3 19V5C3 3.9 3.9 3 5 3H6V1M17 21L18.8 22.77C19.3 23.27 20 22.87 20 22.28V18L22.8 14.6C23.3 13.9 22.8 13 22 13H15C14.2 13 13.7 14 14.2 14.6L17 18V21"}></path>
      </svg>
    </button>
    <dialog
      class="legend-menu"
      tabindex="-1"
      aria-label=${t}
      @pointerdown=${_f}
      @click=${hf}
    >
      <div class="legend-menu-actions">${r}${a}</div>
      <div class="legend-menu-list" role="group" aria-label=${t}>
        ${e.calendars.map(t=>B`<label
              class=${t.shown?"legend-menu-row":"legend-menu-row hidden-calendar"}
              style=${yf(t)}
              data-calendar=${t.id}
            >
              <input
                type="checkbox"
                class="legend-menu-check"
                .checked=${t.shown}
                @change=${n=>{const i=n.currentTarget;e.inert?i.checked=t.shown:e.onToggle(t.id)}}
              />
              <span class="legend-menu-label">${t.name}</span>
            </label>`)}
      </div>
      <span class="legend-menu-surface" aria-hidden="true"></span>
      <span class="legend-menu-page" aria-hidden="true"></span>
    </dialog>`}(t):V}case"add":return e.addEvent?(n=e.addEvent,B`<button
    type="button"
    class="toolbar-button add-event-button"
    aria-label=${n.label??Da}
    title=${n.label??V}
    @pointerdown=${Mf}
    @click=${e=>{e.stopPropagation(),n.onActivate(e.currentTarget,Ef(e))}}
  >
    <svg class="toolbar-button-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d=${mu}></path>
    </svg>
  </button>`):V;case"button":{const n=e.customButtons?.[t.index];return n?function(e){return B`<button
    type="button"
    class="toolbar-button custom-button"
    aria-label=${e.label}
    title=${e.tooltip??V}
    @pointerdown=${Mf}
    @click=${t=>{t.stopPropagation(),e.onActivate(t.currentTarget,Ef(t))}}
  >
    <ha-icon class="custom-button-icon" icon=${e.icon} aria-hidden="true"></ha-icon>
  </button>`}(n):V}}var n}function Nf(e,t){const n=t.menuName??"Menu";return B`<button
      type="button"
      class="toolbar-button custom-menu-button"
      aria-haspopup="dialog"
      aria-expanded="false"
      aria-label=${n}
      title=${t.menuName??V}
      @pointerdown=${Mf}
      @click=${e=>{e.stopPropagation();const n=(i=e.currentTarget,i.parentElement?.querySelector("dialog.custom-menu")??null);var i;n&&uf(e,n,t.inert,Tf)}}
    >
      <svg class="toolbar-button-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d=${"M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z"}></path>
      </svg>
    </button>
    <dialog
      class="custom-menu"
      tabindex="-1"
      aria-label=${n}
      @pointerdown=${Mf}
      @click=${hf}
    >
      <div class="custom-menu-list" role="group" aria-label=${n}>
        ${t.plan.overflow.map(t=>{const n=function(e,t){if("add"===t.kind&&e.addEvent)return{icon:B`<svg
        class="toolbar-button-icon custom-menu-icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path d=${mu}></path>
      </svg>`,label:e.addEvent.label??Da,onActivate:e.addEvent.onActivate};const n="button"===t.kind?e.customButtons?.[t.index]:void 0;return n?{icon:B`<ha-icon class="custom-menu-icon" icon=${n.icon} aria-hidden="true"></ha-icon>`,label:n.label,onActivate:n.onActivate}:void 0}(e,t);return n?B`<button type="button" class="custom-menu-row" @click=${i=n.onActivate,e=>{e.stopPropagation();const t=e.currentTarget.closest("dialog"),n=t?.previousElementSibling;t&&n instanceof HTMLElement&&(df(t,"picked"),i(n,Ef(e)))}}>
                ${n.icon}
                <span class="custom-menu-label">${n.label}</span>
              </button>`:V;var i})}
      </div>
      <span class="custom-menu-surface" aria-hidden="true"></span>
      <span class="custom-menu-page" aria-hidden="true"></span>
    </dialog>`}const If={idle:"",turning:"busy",done:"refresh-done",failed:"refresh-failed"},Ff={idle:pu,turning:pu,done:uu,failed:"M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z"};const Rf=B`<span class="view-switcher-probe" aria-hidden="true"></span
  ><span class="view-switcher-probe view-switcher-page" aria-hidden="true"></span>`;function Of(e){return e.map(e=>e.month?B`<span class="toolbar-month-name">${e.text}</span>`:e.text)}function zf(e){return e.map(e=>B`<span>${Of(e)}</span>`)}function jf(e){return e.legend?.folded?e.legend:void 0}function Hf(e,t){if(!function(e){return Boolean(Lf(e).length>0||e.viewSwitcher||e.reset||e.refresh||e.search)}(e))return V;const n=0===Lf(e).length&&!e.viewSwitcher&&!e.refresh&&!e.search;return B`<div class="card-toolbar toolbar-actions">
    <div class="toolbar-start">${function(e){const t=e.startFold;return t&&0!==t.plan.overflow.length?[...t.plan.visible.map(t=>Pf(e,t)),Nf(e,t)]:Lf(e).map(t=>Pf(e,t))}(e)}</div>
    ${e.viewSwitcher?function(e,t){return B`<div
    class="view-switcher"
    role="group"
    @pointerdown=${Mf}
    @click=${Mf}
  >
    ${e.views.map(n=>{const i=n.view===e.selected,r=["view-switcher-segment",i?"selected":"",n.available?"":"unavailable",t?"":"icon-only"].filter(e=>""!==e).join(" ");return B`<button
        type="button"
        class=${r}
        data-view=${n.view}
        aria-pressed=${i?"true":"false"}
        aria-disabled=${n.available?V:"true"}
        aria-label=${t?V:n.label}
        title=${t?V:n.label}
        @pointerdown=${Mf}
        @click=${t=>{t.stopPropagation(),n.available&&e.onSelect(n.view)}}
      >
        ${t?B`<span class="toolbar-button-label">${n.label}</span>`:(a=n.view,B`<svg
    class="view-switcher-icon"
    viewBox=${"0 0 48 32"}
    aria-hidden="true"
    focusable="false"
  >
    <g fill="currentColor">
      ${xf[a].map(([e,t,n,i,r,a])=>q`<rect x=${e} y=${t} width=${n} height=${i} rx=${r} opacity=${a??V}></rect>`)}
    </g>
  </svg>`)}${i?Rf:V}
      </button>`;var a})}
  </div>`}(e.viewSwitcher,t):V}
    <div class="toolbar-end">
      ${e.reset?function(e,t){const n=e.active?void 0:e.confirmation,i=["toolbar-button","reset-button",t?"alone":"",n?"reset-done":"",e.active||"showing"===n?"":"unavailable"].filter(e=>""!==e).join(" ");return B`<button
    type="button"
    class=${i}
    aria-disabled=${e.active?V:"true"}
    aria-label=${e.label??$f}
    title=${e.label??V}
    @pointerdown=${Mf}
    @click=${t=>{t.stopPropagation(),e.active&&e.onActivate()}}
  >
    <svg class="toolbar-button-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d=${n?uu:"M13.5,7A6.5,6.5 0 0,1 20,13.5A6.5,6.5 0 0,1 13.5,20H10V18H13.5C16,18 18,16 18,13.5C18,11 16,9 13.5,9H7.83L10.91,12.09L9.5,13.5L4,8L9.5,2.5L10.92,3.91L7.83,7H13.5M6,18H8V20H6V18Z"}></path>
    </svg>
  </button>`}(e.reset,n):V}
      ${e.refresh?function(e){const t=["toolbar-button","refresh-button",If[e.phase],e.unasked?"unasked":""].filter(e=>""!==e).join(" ");return B`<button
    type="button"
    class=${t}
    aria-label=${e.label??kf}
    title=${e.label??V}
    @pointerdown=${Mf}
    @click=${t=>{t.stopPropagation(),e.onActivate()}}
  >
    <svg class="toolbar-button-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d=${Ff[e.phase]}></path>
    </svg>
  </button>`}(e.refresh):V}
      ${e.search?(i=e.search,B`<button
    type="button"
    class="toolbar-button search-button"
    aria-haspopup="dialog"
    aria-label=${i.label??"Search"}
    title=${i.label??V}
    @pointerdown=${Mf}
    @click=${e=>{e.stopPropagation(),i.onActivate(e.currentTarget,Ef(e))}}
  >
    <svg class="toolbar-button-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d=${hu}></path>
    </svg>
  </button>`):V}
    </div>
  </div>`;var i}function Wf(e,t){const n=function(e){return void 0!==e.legend&&!e.legend.folded}(e)?e.legend:void 0,i=e.heading,r=["card-toolbar","toolbar-heading",n?"chips-shown":"",i?.short?"short-month":""].filter(e=>""!==e).join(" ");return B`<div class=${r}>
    <div class="toolbar-identity">
      ${t}${i?function(e,t){const n=mm(e.range,e.languageMark??""),i=B`<span class="toolbar-month-reserve" aria-hidden="true"
    >${zf(e.reserve)}</span
  >`,r=B`<span class="toolbar-month-measure" aria-hidden="true"
    ><span class="toolbar-month-probe">${zf(e.full)}</span></span
  >`,a=B`<span id="toolbar-range-text" class="toolbar-range-text" aria-live="polite"
    >${n}</span
  >`;if(!t)return B`<div class="toolbar-month">
      ${i}
      <span class="toolbar-month-slot">
        <span class="toolbar-month-label" title=${n}
          ><bdi class="toolbar-month-text"
            ><span class="toolbar-month-cap"></span>${Of(e.text)}</bdi
          ></span
        >
      </span>
      ${r}${a}
    </div>`;const o=e=>e?.parentElement?.querySelector("input.toolbar-date-input")??null;return B`<div class="toolbar-month with-picker">
    ${i}
    <span class="toolbar-month-slot">
      <button
        type="button"
        class="toolbar-month-button"
        title=${n}
        aria-describedby="toolbar-range-text"
        @pointerdown=${e=>{Mf(e);const t=o(e.currentTarget);if(!t)return;Cf.delete(t);const n=Df.get(t);n&&(n(),Cf.add(t),t.blur())}}
        @click=${e=>{e.stopPropagation();const n=e.currentTarget,i=o(n);if(!i)return;if(Cf.delete(i)&&e.detail>0)return;if(t.inert)return;const r=n.getRootNode().activeElement===n?n:null;i.value=t.pickerValue,i.focus({preventScroll:!0});try{i.showPicker(),function(e,t){Df.get(e)?.();const n=[],i=()=>{Df.delete(e);for(const[t,i]of n)e.removeEventListener(t,i);e.setAttribute("aria-hidden","true")},r=()=>{Df.has(e)&&(i(),function(e){return e.getRootNode().activeElement===e}(e)&&(t?.isConnected?t.focus({preventScroll:!0}):e.blur()))},a=(t,i)=>{e.addEventListener(t,i),n.push([t,i])};if(a("blur",i),a("change",r),a("keydown",e=>{"Escape"===e.key&&r()}),Df.set(e,i),e.removeAttribute("aria-hidden"),!0!==Af(e))return;const o=()=>{Df.has(e)&&(e.isConnected&&!0===Af(e)?requestAnimationFrame(o):r())};requestAnimationFrame(o)}(i,r)}catch{i.click()}}}
      >
        <span class="toolbar-month-label"
          ><bdi class="toolbar-month-text"
            ><span class="toolbar-month-cap"></span>${Of(e.text)}</bdi
          ><svg class="toolbar-month-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d=${"M7,10L12,15L17,10H7Z"}></path></svg
        ></span>
      </button>
      <input
        type="date"
        class="toolbar-date-input"
        tabindex="-1"
        aria-hidden="true"
        aria-labelledby="toolbar-range-text"
        .value=${t.pickerValue}
        @click=${Mf}
        @change=${e=>{const n=e.target.value;n&&t.onPick(n)}}
      />
    </span>
    ${r}${a}
  </div>`}(i,e.navigation):V}
    </div>
    ${n?function(e){const t=e.name??ff;return B`<div
    class="toolbar-legend"
    role="group"
    aria-label=${t}
    @pointerdown=${_f}
    @click=${_f}
  >
    <div class="legend-chips">
      ${e.calendars.map(t=>B`<button
            type="button"
            class=${t.shown?"legend-chip":"legend-chip hidden-calendar"}
            style=${yf(t)}
            data-calendar=${t.id}
            aria-pressed=${t.shown?"true":"false"}
            @click=${()=>{e.inert||e.onToggle(t.id)}}
          >
            <span class="legend-chip-label">${t.name}</span>
          </button>`)}
    </div>
  </div>`}(n):V}
    <div class="toolbar-heading-end">
      ${e.navigation?function(e){const t=mm(e.homeName,e.languageMark??""),n=(e,t,n,i,r,a=!1)=>B`<button
      type="button"
      class=${a?"date-navigation-segment home-done":"date-navigation-segment"}
      aria-label=${e??t}
      title=${e??V}
      @pointerdown=${Mf}
      @click=${(e=>t=>{t.stopPropagation(),e()})(i)}
    >
      <svg
        class=${r?"toolbar-button-icon date-navigation-direction":"toolbar-button-icon"}
        viewBox="0 0 24 24"
        aria-hidden="true"
        focusable="false"
      >
        <path d=${n}></path>
      </svg>
    </button>`;return B`<div
    class="date-navigation"
    role="group"
    aria-labelledby="toolbar-range-text"
    @pointerdown=${Mf}
    @click=${Mf}
  >
    ${n(e.previousName,"Previous","M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z",e.onPrevious,!0)}
    ${e.homeConfirming?n(t,t,"M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z",e.onHome,!1,!0):n(t,t,"M12 5.69L17 10.19V18H15V12H9V18H7V10.19L12 5.69M12 3L2 12H5V20H11V14H13V20H19V12H22",e.onHome,!1)}
    ${n(e.nextName,"Next","M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z",e.onNext,!0)}
  </div>`}(e.navigation):V}
    </div>
  </div>`}function Bf(e,t){return e.isNewMonth&&!br(t.month_separator_width)?{kind:"month",width:t.month_separator_width,color:t.month_separator_color}:e.isNewWeek&&!br(t.week_separator_width)?{kind:"week",width:t.week_separator_width,color:t.week_separator_color}:br(t.day_separator_width)?null:{kind:"day",width:t.day_separator_width,color:t.day_separator_color}}function qf(e,t,n,i,r,a=!1,o){const s=vr(t,"day_header_gap"),l=Qr(t.day_spacing),d=function(e){return e.map((t,n)=>{const i=n>0?e[n-1]:void 0;return{isNewWeek:!i||t.weekNumber!==i.weekNumber,isNewMonth:Boolean(i&&t.monthNumber!==i.monthNumber)}})}(e),c=function(e,t,n){const i=t.map((e,t)=>e.isNewWeek&&!(0===t&&!n.show_current_week_number));return null!==n.show_week_numbers&&i.some(Boolean)?e.map((e,t)=>function(e,t,n){return Wm(e,t,n+1)}(e.weekNumber,i[t],t)):e.map(()=>V)}(e,d,t),u=d.map((e,n)=>({separator:Bf(e,t),index:n})).filter(({separator:e,index:t})=>null!==e&&t>0).map(({separator:e,index:t})=>function(e,t,n){return B`
    <div
      class="column-separator column-separator-${e.kind}"
      style=${um({gridColumn:String(t+1),gridRow:"day"===e.kind?"2":"1 / -1",width:e.width,backgroundColor:Ee(e.color),marginInlineStart:`calc(-0.5 * (${n} + ${e.width}))`})}
    ></div>
  `}(e,t,l));return B`
    <div
      class="column-grid"
      style=${um({gridTemplateColumns:`repeat(${e.length}, minmax(0, 1fr))`,columnGap:l,"--calendar-card-column-header-gap":s})}
      .calendarCardDaySlot=${tu}
    >
      ${c}
      ${e.map((e,s)=>function(e,t,n,i,r,a,o=!1,s){const l=new Date(e.timestamp),{isToday:d,isTomorrow:c,isPast:u}=Rm(e.timestamp),h=rs(l,a),m=Fm(l,t,r),p=o||s?Xc(e.timestamp):void 0,f=vr(t,"day_header_separator_width"),g=vr(t,"day_header_separator_color"),v=br(f)?null:{width:f,color:g},_=xp(e.events,t,n);return B`
    <div
      class=${Zh({"day-column":!0,today:d,tomorrow:c,"future-day":!d,"past-day":u,weekend:h})}
      style=${um({gridColumn:String(i+1),gridRow:"2"})}
      .calendarCardDaySlot=${iu(e.timestamp)}
    >
      ${Hm(l,t,n,d,m,v,a,p,s&&{label:s.label,timestamp:e.timestamp})}
      <div
        class=${xr(t)?"column-events with-event-gap":"column-events"}
      >
        ${lm(e.events,(e,t)=>`${e._entityId}-${e.summary}-${t}`,(i,s)=>function(e,t,n,i,r,a,o,s=!1,l,d=!1){const c=$p(e,i,r,o),u=d?kp(c):c,h=Jc(e,u.entityAccentColor,s),m=0===n,p=n===t.events.length-1,f={event:!0,"event-first":m,"event-middle":!m&&!p,"event-last":p,"past-event":u.isPastEvent,"event-interactive":void 0!==h,"event-now":u.isNow,"search-ring":!0===e._searchRing,[gp]:u.textScaled};return B`
    <div
      class=${Zh(f)}
      style="--calendar-card-event-accent-bar-color: ${u.entityAccentColor}; background-color: ${u.entityAccentBackgroundColor};${tt({...u.accentTextProperties,...u.textScaleProperties})}"
      role=${h?"button":V}
      tabindex=${h?"0":V}
      aria-describedby=${h&&l?l:V}
      .calendarCardEventTap=${h}
      .calendarCardDaySlot=${e._isEmptyDay?void 0:eu}
    >
      ${ep()}
      ${Qm(e,i,u.contentParts,{weatherForecasts:a,weatherPlacement:"row",progressPlacement:"row",countdownPlacement:"text",hass:o,links:Sp(i),timePosition:pt(i.time_position)})}
    </div>
  `}(i,e,s,t,n,r,a,o,p,_.has(s)))}
      </div>
    </div>
  `}(e,t,n,s,i,r,a,o))}
      ${u}
    </div>
  `}function Uf(e,t,n){return"grid"===e?function(e,t){if(0===e.length)return!1;if(Xp(e,wr(t,"allday_band_max_rows")).length>0)return!0;const n=wl(wr(t,"start_time"),wr(t,"end_time"));return e.some(e=>Np(e).timed.some(e=>Sl(e.startMin,e.endMin,n)))}(t,n):t.some(e=>e.events.some(e=>!e._isEmptyDay))}function Vf(e,t,n){const i=Io(t),r=hm(t,n);return"loading"===e?B`
      <div class="calendar-card">
        <div class="loading">${mm(i.loading,r)}</div>
      </div>
    `:B`
    <div class="calendar-card">
      <div class="error">${mm(i.error,r)}</div>
    </div>
  `}function Gf(e,t,n,i="day"){if("day"===i)return{borderTopWidth:e,borderTopColor:Ee(t),borderTopStyle:"solid",marginTop:"0px",marginBottom:n.day_spacing};let r=Se.SEPARATOR_SPACING.WEEK;"month"===i&&(r=Se.SEPARATOR_SPACING.MONTH);const a=kr(n.day_spacing,r);return{borderTopWidth:e,borderTopColor:Ee(t),borderTopStyle:"solid",marginTop:a,marginBottom:a}}function Kf(e,t,n,i,r=!1,a="day"){if(br(e)||r)return V;const o=Gf(e,t,i,a);return B`<div class="${n}" style=${um(o)}></div>`}function Yf(e){return Kf(e.month_separator_width,e.month_separator_color,"month-separator",e,!1,"month")}function Jf(e,t=!1){return Kf(e.week_separator_width,e.week_separator_color,"week-separator",e,t,"week")}function Xf(e,t,n,i,r,a=!1,o){return B`
    ${e.map((s,l)=>{const d=l>0?e[l-1]:void 0,c=s.weekNumber??null;let u=!1;u=!d||s.weekNumber!==d.weekNumber;const h=d&&s.monthNumber!==d.monthNumber,m=0===l,p={isNewWeek:u,isNewMonth:Boolean(h)};let f=V;return!h||br(t.month_separator_width)||u&&null!==t.show_week_numbers?u&&(f=m&&null!==t.show_week_numbers&&!t.show_current_week_number?h?Yf(t):Jf(t,m):null!==t.show_week_numbers?function(e,t,n,i=!1){if(null===e)return V;const r=t?Se.SEPARATOR_SPACING.MONTH:Se.SEPARATOR_SPACING.WEEK,a={marginTop:i?"0px":kr(n.day_spacing,r/2-1),marginBottom:kr(n.day_spacing,r/2)},o={};return i?o["--separator-display"]="none":t&&!br(n.month_separator_width)?(o["--separator-border-width"]=n.month_separator_width,o["--separator-border-color"]=Ee(n.month_separator_color),o["--separator-display"]="block"):br(n.week_separator_width)?o["--separator-display"]="none":(o["--separator-border-width"]=n.week_separator_width,o["--separator-border-color"]=Ee(n.week_separator_color),o["--separator-display"]="block"),B`
    <table class="week-row-table" style=${um(a)}>
      <tr>
        <td class="week-number-cell">
          <div class="week-number">${e}</div>
        </td>
        <td class="separator-cell" style=${um(o)}>
          <div class="separator-line"></div>
        </td>
      </tr>
    </table>
  `}(c,Boolean(h),t,m):Jf(t,m)):f=Yf(t),B`
        ${f}
        ${function(e,t,n,i,r,a,o,s=!1,l){const{isToday:d,isTomorrow:c,isPast:u}=Rm(e.timestamp),h=rs(new Date(e.timestamp),o);let m=V;const p=r?.isNewMonth||!1,f=r?.isNewWeek||!1,g=p&&!br(t.month_separator_width),v=f&&(null!==t.show_week_numbers||!br(t.week_separator_width)),_=s||l?Xc(e.timestamp):void 0,y=xr(t),w=xp(e.events,t,n),b=t.day_separator_width,x=t.day_separator_color;if(i&&!br(b)&&!g&&!v){const e=Gf(b,x,t,"day");m=B`<div class="separator" style=${um(e)}></div>`}return B`
    ${m}
    <table
      class=${Zh({"day-table":!0,today:d,tomorrow:c,"future-day":!d,"past-day":u,weekend:h,"with-event-gap":y})}
      .calendarCardDaySlot=${iu(e.timestamp)}
    >
      ${lm(e.events,(e,t)=>`${e._entityId}-${e.summary}-${t}`,(i,r)=>{const c=function(e,t,n,i,r,a,o,s,l=!1,d,c,u=!1){const h=$p(e,i,r,s),m=u?kp(h):h,p=Jc(e,m.entityAccentColor,l),f=new Date(t.timestamp),g=rs(f,s),v=0===n,_=n===t.events.length-1,y=!v&&!_,w=xr(i)?2*t.events.length-1:t.events.length,b={event:!0,"event-first":v,"event-middle":y,"event-last":_,"past-event":m.isPastEvent,"event-tappable":void 0!==p,"event-now":m.isNow,"search-ring":!0===e._searchRing,[gp]:m.textScaled};return B`
    <tr>
      ${0===n?B`
            <td
              class="date-column ${g?"weekend":""}"
              rowspan="${w}"
              style="position: relative;"
              id=${c?V:d??V}
            >
              ${function(e,t,n,i){return n?B`<div
    class="day-add-button"
    role="button"
    tabindex="0"
    aria-label=${n.label}
    aria-describedby=${i??V}
    .calendarCardDayAdd=${t}
  >
    <div class="day-add-date" id=${i??V}>${e}</div>
  </div>`:e}(function(e,t,n,i,r,a){return qm(e,t,n,i,Fm(e,t,r),a)}(f,i,r,a,o,s),t.timestamp,c,d)}
              ${tp(i,a)}
            </td>
          `:""}
      <td
        class=${Zh(b)}
        .calendarCardDaySlot=${e._isEmptyDay?void 0:eu}
        style="--calendar-card-event-accent-bar-color: ${m.entityAccentColor}; background-color: ${m.entityAccentBackgroundColor};${tt({...m.accentTextProperties,...m.textScaleProperties})}"
      >
        ${ep()}
        ${function(e,t,n){return t?B`<div
    class="event-button event-interactive"
    role="button"
    tabindex="0"
    aria-describedby=${n??V}
    .calendarCardEventTap=${t}
  >
    ${e}
  </div>`:e}(Qm(e,i,m.contentParts,{weatherForecasts:o,links:Sp(i),timePosition:pt(i.time_position)}),p,d)}
      </td>
    </tr>
  `}(i,e,r,t,n,d,a,o,s,_,l,w.has(r));return y&&r>0?B`${B`<tr class="event-gap-row" aria-hidden="true">
    <td class="event-gap-cell"></td>
  </tr>`}${c}`:c})}
    </table>
  `}(s,t,n,d,p,i,r,a,o)}
      `})}
  `}var Zf=Object.defineProperty,Qf=(e,t,n,i)=>{for(var r,a=void 0,o=e.length-1;o>=0;o--)(r=e[o])&&(a=r(t,n,a)||a);return a&&Zf(t,n,a),a};const eg="calendar-card-pro-search";function tg(e){return Math.min(240,Math.max(0,e))}const ng={search:["ui.common.search","Search"],close:["ui.common.close","Close"],noMatch:["ui.components.combo-box.no_match","No matching items found"],noResults:["ui.components.combo-box.no_results","No results for {term}"],count:["ui.components.combo-box.result_count","{count} results for {term}"],failed:["ui.components.calendar.event_retrieval_error","Could not retrieve events for calendars"]};class ig extends Ru{constructor(){super(...arguments),this._term="",this._status="",this._version=0,this._logName="Search",this._panelWidth=440,this._onCancel=e=>{e.preventDefault(),this._close()},this._onPointerDown=e=>{this._backdropDown=e.target===this._dialog},this._onClick=e=>{this._isBackdropPress(e)&&this._close()}}get _anchor(){return this._params?.anchor}_clear(){clearTimeout(this._announceTimer),this._announceTimer=void 0;const e=this._detach;this._detach=void 0,this._params=void 0,this._found=void 0,this._term="",this._active=void 0,this._status="",this._hang=void 0,this._foot=void 0,e?.()}showDialog(e){this._closing&&this._closeNow(),this._detach?.(),this._params=e,this._onClosed=e.closed,this._found=void 0,this._term="",this._active=void 0,this._status="",this._place=void 0,this._hang=void 0,this._foot=void 0,this._maxHeight=void 0,this._detach=e.source.attach({changed:()=>this._changed(),close:()=>this._close()}),this._wantOpen=!0,this.requestUpdate()}closeDialog(){return this._close(),!0}_close(){!this._closing&&this._params&&this._finish()}_placeBeside(e,t){this._hang=function(e,t,n,i){if(!e){const{left:e}=Su(void 0,240,{width:n,height:i.bottom},440),t=i.bottom-i.top-24;return{opened:{left:e,top:i.top+vu},keeps:tg(t)}}const r=e.rect??{left:e.x,right:e.x,top:e.y,bottom:e.y},{left:a,at:o}=Tu(r,440,n,t),s=i.bottom-r.bottom-yu-vu,l=r.top-yu-vu-i.top;if(s<240&&l>s){const e=tg(l);return{opened:{left:a,top:r.top-yu-e,arrow:{side:"bottom",at:o}},keeps:e}}return{opened:{left:a,top:r.bottom+yu,arrow:{side:"top",at:o}},keeps:tg(s)}}(this._params?.anchor,this._params?.hang,t,e),this._keepBeside(e)}_keepBeside(e){const t=this._hang;if(!t)return;const{place:n,maxHeight:i,bottom:r}=function(e,t,n){const{opened:i,keeps:r}=e,{left:a,top:o,arrow:s}=bu(i,r,r,t);if("bottom"===s?.side){const e=Math.min(o+r,t.bottom-vu);return{place:{left:a,top:e,arrow:s},maxHeight:Math.max(0,e-t.top-vu),bottom:n-e}}return{place:{left:a,top:o,arrow:s},maxHeight:Math.max(0,t.bottom-vu-o)}}(t,e,window.innerHeight);xu(n,this._place)||(this._place=n),this._maxHeight=i,this._foot=r}_changed(){this._version+=1,this._term.trim()&&this._scheduleAnnounce()}get _results(){const e=this._params?.source;if(!e)return;const t=this._found;if(t&&t.term===this._term&&t.version===this._version)return t.results;const n=e.find(this._term);return this._found={term:this._term,version:this._version,results:n},n}_drawnRows(){return(this._results?.groups??[]).flatMap(e=>e.hits.map(e=>e.row))}_onInput(e){this._term=e.target.value,this._active=void 0,this._scheduleAnnounce()}_onKeyDown(e){if(e.isComposing)return;const t=this._drawnRows(),n=t.findIndex(e=>e.id===this._active);switch(e.key){case"ArrowDown":case"ArrowUp":{if(e.preventDefault(),0===t.length)return;const i="ArrowDown"===e.key?1:-1,r=n<0?i>0?0:t.length-1:(n+i+t.length)%t.length;return this._active=t[r].id,void this.updateComplete.then(()=>this.renderRoot.querySelector('[role="option"][aria-selected="true"]')?.scrollIntoView?.({block:"nearest"}))}case"Enter":return void(n>=0&&(e.preventDefault(),this._pick(t[n].id)));case"Escape":return e.preventDefault(),void this._close()}}_pick(e){const t=this._params?.source;t&&!this._closing&&(this._close(),t.pick(e))}_scheduleAnnounce(){clearTimeout(this._announceTimer),this._announceTimer=setTimeout(()=>{this._announceTimer=void 0,this._status=this._statusText()},500)}_statusText(){const e=this._term.trim();if(!e)return"";const t=`‘${e}’`,n=this._results?.total??0;return 0===n?this._localized(ng.noResults[0],{term:t})??this._localized(ng.noMatch[0])??ng.noResults[1].replace("{term}",t):this._localized(ng.count[0],{count:n,term:t})??`${n} ${1===n?"result":"results"} for ${t}`}_localized(e,t){const n=t?this.hass?.localize?.(e,t):this.hass?.localize?.(e);return n&&n!==e?n:void 0}_named(e){return this._localized(ng[e][0])??ng[e][1]}render(){const e=this._params;if(!e)return B`<dialog></dialog>`;const t=this._place,n=this._foot,i=t&&void 0!==n?`left:${t.left}px;top:auto;bottom:${n}px;`:Mu(this._sheet,t,this._lift),r=[`--past-opacity:${e.pastOpacity}`,void 0!==this._maxHeight?`max-height:${this._maxHeight}px`:"",t?.arrow?`transform-origin:${$u(t.arrow)}`:""].filter(e=>""!==e).join(";"),a=this._results,o=this._localized(ng.search[0]),s=this._drawnRows(),l=s.findIndex(e=>e.id===this._active),d=this._term.trim();return B`
      <dialog
        class="${e.dark?"dark":"light"} ${this._sheet?"sheet":"popover"}${this._lift>0?" lifted":""}"
        ?data-placed=${this._sheet||!!t}
        style=${i}
        aria-label=${this._named("search")}
        @cancel=${this._onCancel}
        @pointerdown=${this._onPointerDown}
        @click=${this._onClick}
        @keydown=${this._keepKeys}
      >
        <div class="panel search" style=${r} ?inert=${this._closing}>
          ${Du(this._sheet)}
          <div class="cell field">
            <span class="field-mark" aria-hidden="true">
              ${e.source.loading?B`<span class="field-wait">
                      ${this._renderMagnifier()}
                      <span class="field-ring"><span class="spinner"></span></span>
                    </span>`:this._renderMagnifier()}
            </span>
            <input
              type="search"
              class="field-input"
              role="combobox"
              autofocus
              autocomplete="off"
              autocapitalize="off"
              spellcheck="false"
              enterkeyhint="search"
              aria-autocomplete="list"
              aria-controls="search-results"
              aria-expanded=${s.length>0?"true":"false"}
              aria-activedescendant=${l>=0?`search-option-${l}`:V}
              aria-label=${this._named("search")}
              placeholder=${o??V}
              .value=${this._term}
              @input=${this._onInput}
              @keydown=${this._onKeyDown}
            />
            <button
              type="button"
              class="field-close"
              aria-label=${this._named("close")}
              title=${this._localized(ng.close[0])??V}
              @click=${()=>this._close()}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d=${"M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"}></path>
              </svg>
            </button>
          </div>
          <div class="visually-hidden" role="status">${this._status}</div>
          ${this._renderResults(a,s,l)}
          ${d&&0===a?.total&&!e.source.loading?this._renderNote(this._localized(ng.noMatch[0])):V}
          ${this._renderFailed(e.source.failed)}
        </div>
        ${Cu(t?.arrow)}
      </dialog>
    `}_renderMagnifier(){return B`<svg class="field-icon" viewBox="0 0 24 24" focusable="false">
      <path d=${hu}></path>
    </svg>`}_renderResults(e,t,n){const i=e?.groups??[],r=i.findIndex(e=>e.past);let a=0;return B`<div
      class=${t.length>0?"results":"results empty"}
      id="search-results"
      role="listbox"
      lang=${this._params?.language??V}
      aria-label=${this._named("search")}
    >
      ${i.map((e,t)=>{const i=["month",e.past?"past":"",t===r&&r>0?"past-start":""].filter(e=>""!==e).join(" "),o=a;return a+=e.hits.length,B`<div class=${i} role="group" aria-labelledby="search-month-${t}">
          <div class="month-name" id="search-month-${t}" role="presentation">${e.label}</div>
          ${e.hits.map((e,t)=>this._renderHit(e,o+t,o+t===n))}
        </div>`})}
    </div>`}_renderHit(e,t,n){const i=e.row,r=[i.title,i.dayText,i.timeText,i.calendar].filter(e=>""!==e.trim()).join(", ");return B`<div
      class="cell group result"
      id="search-option-${t}"
      role="option"
      aria-selected=${n?"true":"false"}
      aria-label=${r}
      style="--event-color:${i.color}"
      @click=${()=>this._pick(i.id)}
    >
      <span class="bar"></span>
      <span class="lines">
        <span class="result-title">${rg(i.title,e.title)}</span>
        <span class="result-detail"
          >${i.dayText} ·
          ${i.timeText}${i.location?B` · ${rg(i.location,e.location)}`:V}</span
        >
      </span>
    </div>`}_renderNote(e,t=!1){return e?B`<div class=${t?"note error":"note"}>${e}</div>`:V}_renderFailed(e){if(0===e.length)return V;const t=this._localized(ng.failed[0]);return t?this._renderNote(`${t}: ${e.join(", ")}`,!0):V}}function rg(e,t){if(!t)return e;const[n,i]=t;return B`${e.slice(0,n)}<mark>${e.slice(n,i)}</mark>${e.slice(i)}`}ig.styles=a`
    ${Au}
    ${Eu}
    .light {
      --mark: rgba(255, 204, 0, 0.45);
    }
    .dark {
      --mark: rgba(255, 214, 10, 0.34);
    }
    .panel.search {
      width: 440px;
      overflow: hidden;
      gap: 8px;
    }
    .sheet .panel.search {
      width: 100%;
      height: 85vh;
    }
    .field {
      flex: none;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 6px 6px 12px;
    }
    .field:focus-within {
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 55%, transparent);
    }
    @supports not (color: color-mix(in srgb, red, blue)) {
      .field:focus-within {
        box-shadow: 0 0 0 2px var(--accent);
      }
    }
    .field-mark,
    .field-wait {
      flex: none;
      display: grid;
      place-items: center;
      width: 20px;
      height: 20px;
    }
    .field-wait > * {
      grid-area: 1 / 1;
    }
    .field-icon {
      width: 20px;
      height: 20px;
      fill: var(--dim);
    }
    .field-wait > .field-icon {
      animation: field-wait-hide 0s linear 1s both;
    }
    .field-ring {
      display: flex;
      animation: field-wait-show 0s linear 1s both;
    }
    .field-ring .spinner {
      box-sizing: border-box;
      width: 16px;
      height: 16px;
    }
    @keyframes field-wait-hide {
      to {
        opacity: 0;
      }
    }
    @keyframes field-wait-show {
      from {
        opacity: 0;
      }
    }
    .field-input {
      flex: 1;
      min-width: 0;
      height: 32px;
      padding: 0;
      border: 0;
      background: transparent;
      color: var(--text);
      font: inherit;
      font-size: 16px;
      appearance: none;
    }
    .field-input:focus-visible {
      outline: none;
    }
    .field-input::-webkit-search-cancel-button,
    .field-input::-webkit-search-decoration {
      appearance: none;
    }
    .field-input::placeholder {
      color: var(--dim);
    }
    .field-close {
      flex: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      padding: 0;
      border: 0;
      border-radius: 50%;
      background: var(--button);
      color: var(--text);
      cursor: pointer;
    }
    .field-close svg {
      width: 16px;
      height: 16px;
      fill: currentColor;
    }
    .results {
      flex: 0 1 auto;
      min-height: 0;
      overflow-y: auto;
      overscroll-behavior: contain;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .results.empty {
      display: none;
    }
    .month {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .month.past-start {
      margin-top: 4px;
      padding-top: 10px;
      border-top: 1px solid var(--pop-edge);
    }
    .month-name {
      padding: 2px 4px 0;
      font-size: 12px;
      font-weight: 600;
      color: var(--dim);
    }
    .result {
      padding: 8px 12px 8px 10px;
      cursor: pointer;
    }
    .result[aria-selected='true'] {
      background: color-mix(in srgb, var(--accent) 18%, var(--cell));
    }
    @supports not (color: color-mix(in srgb, red, blue)) {
      .result[aria-selected='true'] {
        background: var(--cell);
        box-shadow: inset 0 0 0 2px var(--accent);
      }
    }
    .past .result > * {
      opacity: var(--past-opacity, 0.6);
    }
    .lines {
      display: flex;
      flex-direction: column;
      min-width: 0;
      gap: 2px;
    }
    .result-title,
    .result-detail {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .result-title {
      font-weight: 500;
    }
    .result-detail {
      font-size: 13px;
      color: var(--dim);
    }
    mark {
      border-radius: 3px;
      background: var(--mark);
      color: inherit;
    }
    .note {
      padding: 2px 4px;
      font-size: 13px;
      color: var(--dim);
    }
    .note.error {
      color: var(--danger);
    }
  `,Qf([pe()],ig.prototype,"_params"),Qf([pe()],ig.prototype,"_term"),Qf([pe()],ig.prototype,"_active"),Qf([pe()],ig.prototype,"_status"),Qf([pe()],ig.prototype,"_foot"),Qf([pe()],ig.prototype,"_version"),customElements.get(eg)||customElements.define(eg,ig);const ag={"en-gb":"en-GB","sr-latn":"sr-Latn","zh-cn":"zh-Hans","zh-tw":"zh-Hant"},og=new Map;function sg(e){const t=Intl[e];return"function"==typeof t?.__addLocaleData?t:void 0}function lg(e,t){try{const[n]=Intl.getCanonicalLocales(t);return new e([n]).resolvedOptions().locale.toLowerCase()===n.toLowerCase()}catch{return!1}}async function dg(e,t,n){let i=!1;for(const r of Je(n)){if(lg(t,r))return"held";const n=ag[r.toLowerCase()]??r;try{const i=await fetch(`/static/locale-data/intl-${e.toLowerCase()}/${n}.json`);if(i.ok)return t.__addLocaleData(await i.json()),et(),"added"}catch{i=!0}}return i?"unreachable":"absent"}function cg(e){return Number.parseFloat(e)||0}function ug(e){return(e.ownerDocument.defaultView??window).getComputedStyle(e)}function hg(e,t=e.getBoundingClientRect()){const n=ug(e),i=cg(n.borderLeftWidth)+cg(n.paddingLeft),r=cg(n.borderRightWidth)+cg(n.paddingRight);if(0===i&&0===r)return t;const a=Number.parseFloat(n.width),o=Number.isFinite(a)?"border-box"===n.boxSizing?a:a+i+r:0,s=o>0&&t.width>0?t.width/o:1;return new DOMRect(t.left+i*s,t.top,Math.max(0,t.width-(i+r)*s),t.height)}function mg(e){const t=ug(e);return e.clientWidth-cg(t.paddingLeft)-cg(t.paddingRight)}const pg=new WeakMap;function fg(e){let t=pg.get(e);if(t)return t;const n={epoch:0,support:"unknown",warned:!1,listeners:new Set};return pg.set(e,n),e.addEventListener?.("ready",()=>{n.epoch+=1,"no"===n.support&&(n.support="unknown");for(const e of[...n.listeners])e()}),t=n,t}function gg(e){const t=e?.connection;return t&&"function"==typeof t.subscribeMessage?t:null}const vg=new Set(["unknown_command","unauthorized"]);class _g{constructor(e){this.changed=e,this.connection=null,this.questions=new Map,this.onReady=()=>this._retryRefused()}answer(e,t){if(gg(t)===this.connection)return this.questions.get(e)?.answer}sync(e,t){const n=t.size>0?gg(e):this.connection;if(n!==this.connection&&(this.stop(),this.connection=n,n&&fg(n).listeners.add(this.onReady)),n){for(const e of[...this.questions.values()])t.has(e.key)||this._close(e);for(const[e,i]of t)this.questions.has(e)||this._ask(n,e,i)}}stop(){for(const e of[...this.questions.values()])this._close(e);this.connection&&fg(this.connection).listeners.delete(this.onReady),this.connection=null}_ask(e,t,n){const i=fg(e),r={key:t,answer:void 0,refused:!1,closed:!1,pushedIn:-1,unsubscribe:Promise.resolve(null)};this.questions.set(t,r),"no"!==i.support&&!1!==e.connected?r.unsubscribe=e.subscribeMessage(e=>this._receive(r,i,e),{type:"subscribe_condition",condition:n}).then(e=>(i.support="yes",()=>{Promise.resolve().then(e).catch(()=>{})}),e=>{const t="string"==typeof e?.code?e.code:void 0;return void 0!==t&&vg.has(t)?(i.support="no",r.refused=!0,i.warned||(i.warned=!0,Tt(`Visibility: Home Assistant does not judge conditions for this card (${t}). Calendars whose conditions only it can judge (template, sun, zone, device, a state held for a while) stay hidden; that needs Home Assistant 2026.10.`)),null):(i.support="yes",Tt(`Visibility: Home Assistant cannot judge ${JSON.stringify(n)}: ${String(e?.message??t??"no reason given")}. Its calendar stays hidden.`),r.closed||(r.answer="error",this.changed()),null)}):r.refused=!0}_receive(e,t,n){if(e.pushedIn=t.epoch,e.closed)return void e.unsubscribe.then(e=>e?.());let i;"boolean"==typeof n?.result||null===n?.result?i=n.result:void 0!==n?.error&&(i="error","error"!==e.answer)&&Tt(`Visibility: Home Assistant cannot judge a condition, so its calendar stays hidden: ${String(n.error).replace(/\s+/g," ").trim()}`),void 0!==i&&i!==e.answer&&(e.answer=i,this.changed())}_close(e){if(e.closed)return;e.closed=!0,this.questions.delete(e.key);const t=this.connection;!e.refused&&t&&!1!==t.connected&&e.pushedIn===fg(t).epoch&&e.unsubscribe.then(e=>e?.())}_retryRefused(){let e=!1;for(const t of[...this.questions.values()])t.refused&&(this.questions.delete(t.key),e=!0);e&&this.changed()}}const yg=1/64,wg={time:!1,icon:!1,end:!1,wrap:!1},bg={time:!0,icon:!1,end:!1,wrap:!1},xg=["grid-time-fits","grid-time-no-icon","grid-time-no-end","grid-time-no-end-reading","grid-time-wrap","grid-time-no-countdown"];function kg(e){const t=e.querySelector(".grid-event-disclosure"),n=t?.querySelector(".time");return t&&n?{disclosure:t,time:n,icon:n.querySelector(".time-actual > ha-icon"),end:n.querySelector(".time-end"),duration:n.querySelector(".time-end > .time-duration"),countdown:n.querySelector(".time-text > .time-countdown")}:null}function $g(e){if(!e.countdown)return 0;const t=e.countdown.ownerDocument.createRange();return t.selectNodeContents(e.countdown),t.getBoundingClientRect().width}function Tg(e){e.disclosure.classList.remove(...xg),e.time.style.display="block"}function Sg(e){return mg(e.time)}function Mg(e){e.time.style.width="max-content"}function Dg(e){e.disclosure.classList.add("grid-time-no-icon","grid-time-wrap")}function Cg(e){if(!e.end)return 0;const t=$g(e);return t<=0?hg(e.time).width:function(e,t,n=0){return Math.max(n,e-t)}(function(e){const t=hg(e.time),n=e.countdown?.getClientRects(),i=n?.[n.length-1];if(!i)return t.width;return"rtl"===e.time.ownerDocument.defaultView?.getComputedStyle(e.time).direction?t.right-i.left:i.right-t.left}(e),t,function(e){const t=e.end?.parentElement;if(!t||!e.end)return 0;const n=t.ownerDocument.createRange();n.setStartBefore(t.firstChild??e.end),n.setEndBefore(e.end);const i=n.getBoundingClientRect();if(i.width<=0)return 0;const r=hg(e.time);return"rtl"===e.time.ownerDocument.defaultView?.getComputedStyle(e.time).direction?r.right-i.left:i.right-r.left}(e))}function Ag(e){e.disclosure.classList.remove("grid-time-no-icon","grid-time-wrap")}function Eg(e,t){e.time.style.removeProperty("display"),e.time.style.removeProperty("width"),t.time&&(e.disclosure.classList.add("grid-time-fits"),t.icon||e.disclosure.classList.add("grid-time-no-icon"),t.end||e.disclosure.classList.add(t.duration?"grid-time-no-end-reading":"grid-time-no-end"),t.wrap&&e.disclosure.classList.add("grid-time-wrap"),!1===t.countdown&&e.disclosure.classList.add("grid-time-no-countdown"))}function Lg(e){const t=e.ownerDocument.defaultView?.getComputedStyle(e),n=t?(Number.parseFloat(t.marginLeft)||0)+(Number.parseFloat(t.marginRight)||0):0;return e.getBoundingClientRect().width+n}function Pg(e){const t=Ng(e);if(!Ig(e))return t;const{available:n,words:i=0}=e;return t.time&&i<=n+yg?t:Rg(e,t,!1)}function Ng(e){const{available:t,full:n,icon:i,end:r,wrapped:a,words:o=0,duration:s=0}=e;if(![t,n,i,r,a,o,s].every(Number.isFinite))return wg;if(t<=0||n<=0)return wg;const l=t+yg,d=n-o-i;if(d+i<=l)return{time:!0,icon:!0,end:!0,wrap:!1};if(d<=l)return{time:!0,icon:!1,end:!0,wrap:!1};const c=d-r;return r>0&&a>0&&Math.max(a,c)<=l?{time:!0,icon:!1,end:!0,wrap:!0}:s>0&&s<r&&c+s<=l?{time:!0,icon:!1,end:!1,wrap:!1,duration:!0}:c<=l?bg:wg}function Ig(e){return(e.words??0)>0||(e.separator??0)>0}function Fg(e){const{full:t,icon:n,end:i,wrapped:r,words:a=0,separator:o=0}=e,s=t-a-o;return{...e,full:s,words:0,separator:0,wrapped:r>0?Math.max(s-n-i,r-o):0}}function Rg(e,t,n){const i=Fg(e),r=Ng(n?{...i,wrapped:0}:i);return r.time?{...r,icon:r.icon&&t.icon,countdown:!1}:wg}function Og(e,t){e.disclosure.classList.remove(...xg),Eg(e,t)}const zg=1/64,jg=10,Hg="--calendar-card-grid-title-label-run",Wg="--calendar-card-grid-title-cut-room",Bg="--calendar-card-grid-title-fit-lines",qg="data-grid-title-cut",Ug="data-grid-title-lines",Vg=Intl.Segmenter,Gg=Vg?new Vg(void 0,{granularity:"grapheme"}):null,Kg=new WeakMap;function Yg(e,t,n){if(![e,t,n].every(Number.isFinite)||e<=0||t<=0||n<=0)return null;if(t<=n)return e;const i=Math.min(e,jg),r=e*n/t;return r<i?null:Math.max(i,e-Math.ceil(e-r))}function Jg(e,t,n){const i=Math.ceil(e-t-1e-7);return n?e-Math.max(0,i-1):Math.max(Math.min(e,jg),e-i-1)}function Xg(e){const t=e.trim();if(!/[\p{L}\p{N}\p{S}]/u.test(t))return"";if(!Gg)return t;for(const{segment:e,index:n}of Gg.segment(t))if(/[\p{L}\p{N}\p{S}]/u.test(e))return t.slice(0,n+e.length);return""}function Zg(e,t,n,i){return[e,t,n,i].every(Number.isFinite)&&e>0&&n>0&&(t<=e||n+i<=e)}function Qg(e){delete e.block.dataset.gridTitleFit,e.summary.style.removeProperty("--calendar-card-grid-title-scale"),e.summary.style.removeProperty(Hg),e.summary.style.removeProperty(Bg),e.summary.removeAttribute(Ug),e.row.style.removeProperty("--calendar-card-grid-title-shift");for(const t of Array.from(e.summary.querySelectorAll(`[${qg}]`)))t.removeAttribute(qg),t.style.removeProperty(Wg)}function ev(e){const t=e.querySelector(".grid-event-disclosure"),n=t?.querySelector(".summary"),i=t?.querySelector(".summary-row"),r=n?.querySelector(".event-title");return t&&n&&i&&r?{block:e,disclosure:t,summary:n,row:i,title:r,previousMode:e.dataset.gridTitleFit}:null}function tv(e){let t=Kg.get(e);return t||(t=e.createRange(),Kg.set(e,t)),t}function nv(e,t){e.setStart(t,0),e.collapse(!0)}function iv(e){for(let t=e.parentElement;t;t=t.parentElement){const e=getComputedStyle(t).display;if("inline"!==e&&"contents"!==e)return t}return null}function rv(e){const t=e.getBoundingClientRect(),n=getComputedStyle(e),i=-Math.min(0,hv(n.marginTop));if(0===i)return t;const r=hv(n.height),a=r>0?r+("border-box"===n.boxSizing?0:hv(n.paddingTop)+hv(n.paddingBottom)+hv(n.borderTopWidth)+hv(n.borderBottomWidth)):0,o=a>0?t.height/a:1;return new DOMRect(t.left,t.top+i*o,t.width,t.height-i*o)}function av(e,t){if(!t)return e;const n=(e.top+e.bottom)/2;if(n<t.top||n>t.bottom)return e;const i=Math.max(e.top,t.top),r=Math.min(e.bottom,t.bottom);return i===e.top&&r===e.bottom?e:new DOMRect(e.left,i,e.width,r-i)}function ov(e){const t=e.ownerDocument,n=t.createTreeWalker(e,NodeFilter.SHOW_TEXT),i=[],r=tv(t);try{for(let e=n.nextNode();e;e=n.nextNode()){const t=e.textContent??"",n=t.search(/\S/u);if(n<0)continue;r.setStart(e,n),r.setEnd(e,t.trimEnd().length);const a=iv(e);i.push({node:e,start:n,text:t.slice(n).trimEnd(),rects:Array.from(r.getClientRects(),e=>av(e,a?rv(a):void 0))})}return i}finally{nv(r,t)}}function sv(e){const t=e[0],n=function(e){if(!Gg){const t=e.length-1;return e.some(e=>""!==Xg(e))?{run:t,length:e[t].length}:null}for(const[t,n]of e.entries()){const e=Xg(n);if(e)return{run:t,length:e.length}}return null}(e.map(e=>e.text)),i=t?.node.ownerDocument;if(!t||!n||!i)return 0;const r=e[n.run],a=tv(i);try{return a.setStart(t.node,t.start),a.setEnd(r.node,r.start+n.length),a.getBoundingClientRect().width}finally{nv(a,i)}}function lv(e){const t=e[0],n=e[e.length-1],i=t?.node.ownerDocument;if(e.length<=1||!i)return e.flatMap(e=>e.rects).reduce((e,t)=>e+t.width,0);const r=tv(i);try{return r.setStart(t.node,t.start),r.setEnd(n.node,n.start+n.text.length),r.getBoundingClientRect().width}finally{nv(r,i)}}function dv(e){return Array.from(e.summary.children).flatMap(t=>t===e.title?[]:t.matches(".calendar-label")?ov(t).flatMap(e=>e.rects):Array.from(t.getClientRects()))}function cv(e){return{top:Math.min(...e.map(e=>e.top)),bottom:Math.max(...e.map(e=>e.bottom))}}function uv(e,t){return e.top>=t.top-zg&&e.bottom<=t.bottom+zg}function hv(e){return Number.parseFloat(e)||0}function mv(e){return"1"===getComputedStyle(e.row).getPropertyValue("--calendar-card-grid-title-eligible").trim()}function pv(e){return Array.from(e.querySelectorAll("img")).every(e=>e.complete&&e.naturalWidth>0)}function fv(e){const t=Array.from(e).flatMap(e=>{const t=e.parentElement,n=e.closest(".grid-event")?.dataset.gridTitleFit;if(!t?.matches(".summary-scroll")||"compact"===n||"blank"===n||"measuring"===n)return[];const i=Array.from(t.children).filter(t=>t!==e);return i.some(e=>e.matches(".calendar-label:not(.label-emoji)"))?[{title:e,summary:t,labels:i,reserved:t.hasAttribute("data-scroll-labels")}]:(t.removeAttribute("data-scroll-labels"),[])});if(!t.length)return;const n=t[0].title.ownerDocument.createElement("canvas").getContext("2d"),i=new Set;let r=!1;for(const{summary:e}of t)e.setAttribute("data-scroll-labels","");try{for(const{title:e,summary:r,labels:a}of t){const t=getComputedStyle(r),o=hv(t.width)+("border-box"===t.boxSizing?0:hv(t.paddingLeft)+hv(t.paddingRight)+hv(t.borderLeftWidth)+hv(t.borderRightWidth)),s=r.getBoundingClientRect(),l=o>0?s.width/o:0,d=s.left+(hv(t.borderLeftWidth)+hv(t.paddingLeft))*l,c=s.right-(hv(t.borderRightWidth)+hv(t.paddingRight))*l,u=e.getBoundingClientRect(),h=getComputedStyle(e),m=ov(e),p=m[0],f=getComputedStyle(p?.node.parentElement??e);n&&(n.font=f.font||`${f.fontSize} ${f.fontFamily}`);const g=n?(n.measureText("…").width+hv(f.letterSpacing))*l:1/0,v=(hv(h.paddingLeft)+hv(h.paddingRight)+hv(h.borderLeftWidth)+hv(h.borderRightWidth))*l,_=a.every(e=>{const t=e.getBoundingClientRect();return t.width>0&&t.left>=d-zg&&t.right<=c+zg});l>0&&_&&pv(r)&&Zg(u.width-v,lv(m),sv(m),g)&&i.add(r)}r=!0}finally{for(const e of t)e.summary.toggleAttribute("data-scroll-labels",r?i.has(e.summary):e.reserved)}}function gv(e){const t=hv(getComputedStyle(e).height);return t>0?e.getBoundingClientRect().height/t:1}function vv(e){const t=getComputedStyle(e.block),n=e.block.getBoundingClientRect(),i=gv(e.block),r={top:n.top+(hv(t.borderTopWidth)+hv(t.paddingTop))*i,bottom:n.bottom-(hv(t.borderBottomWidth)+hv(t.paddingBottom))*i};if(e.block.classList.contains("grid-event-content-limited")){const t=e.disclosure.getBoundingClientRect();return{top:Math.max(r.top,t.top),bottom:Math.min(r.bottom,t.bottom)}}return r}function _v(e){const t=vv(e),n=e.row.getBoundingClientRect(),i=e.summary.getBoundingClientRect();return{summary:i,visible:{top:Math.max(t.top,n.top,i.top),bottom:Math.min(t.bottom,n.bottom,i.bottom)}}}function yv(e){if(!mv(e)||!pv(e.summary))return!1;const t=ov(e.title),n=t[0]?.rects[0];if(!n||n.height<=0)return!1;const{visible:i,summary:r}=_v(e),a=hg(e.summary,r),o=dv(e);return uv(n,i)&&o.every(e=>uv(e,i)&&e.left>=a.left-zg&&e.right<=a.right+zg)}function wv(e){const t=getComputedStyle(e);return"border-box"===t.boxSizing?hv(t.width)-hv(t.paddingLeft)-hv(t.paddingRight)-hv(t.borderLeftWidth)-hv(t.borderRightWidth):hv(t.width)}function bv(e,t){if(!e)return 1/0;const n=getComputedStyle(t);return e.font=n.font||`${n.fontSize} ${n.fontFamily}`,e.measureText("…").width+hv(n.letterSpacing)}function xv(e){return(e.top+e.bottom)/2}function kv(e){return"word"===e.kind?e.node.matches(".title-words > .title-word"):!!e.node.parentElement?.matches(".title-words > .title-run")}function $v(e){const t=vv(e),n=e.row.getBoundingClientRect(),i=ov(e.summary).flatMap(e=>e.rects),r=cv([n,...i.filter(e=>uv(e,n)),...dv(e)]);if(!uv(r,t))return null;const a=(t.top+t.bottom-r.top-r.bottom)/2,o=Math.max(0,...i.map(e=>e.height));return Math.abs(a)>o+zg?null:a/gv(e.block)}function Tv(e,t){const n=gv(e.block),i=ov(e.title),r=getComputedStyle(i[0]?.node.parentElement??e.title),a=hg(e.title),o=e.row.getBoundingClientRect(),s=e.summary.getBoundingClientRect(),l=e.disclosure.getBoundingClientRect(),d=i.flatMap(e=>e.rects),c=dv(e),u=cv([o,...d,...c]),h=hv(getComputedStyle(e.summary).zoom)||1;t&&(t.font=r.font||`${r.fontSize} ${r.fontFamily}`);const m=t?(t.measureText("…").width+hv(r.letterSpacing))*n*h:1/0,p=lv(i),f=sv(i),g=c.every(e=>e.left>=s.left-zg&&e.right<=s.right+zg&&e.width>0);return{target:e,font:hv(r.fontSize),textFonts:[hv(r.fontSize),...Array.from(e.summary.querySelectorAll(".calendar-label")).flatMap(e=>ov(e).map(t=>hv(getComputedStyle(t.node.parentElement??e).fontSize)))],height:(u.bottom-u.top)/n,available:l.height/n,shift:(l.top+l.bottom-u.top-u.bottom)/(2*n),textFits:d.every(e=>uv(e,a)),readable:g&&pv(e.summary)&&Zg(a.width,p,f,m)}}function Sv(e){return e.textFits&&e.height<=e.available+zg}const Mv=/^[a-z0-9_]+\.[a-z0-9_]+$/,Dv=new WeakMap,Cv=new WeakMap;let Av=!0;function Ev(e){return"string"==typeof e&&(e.includes("{{")||e.includes("{%"))}class Lv{constructor(e){this.callbacks=e,this._hasConnected=!1,this._version=0}update(e,t){const n=Ev(t)?t:void 0,i=e?.connection,r=!this._hasConnected&&Boolean(i);i&&(this._hasConnected=!0),n===this._template&&i===this._connection||(this._template=n,this._connection=i,this._version++,this._clearPending(),this._teardown(),n&&e&&(r?this._subscribe(e,n,this._version):this._debounceId=setTimeout(()=>{this._debounceId=void 0,this._subscribe(e,n,this._version)},300)))}destroy(){this._version++,this._template=void 0,this._connection=void 0,this._hasConnected=!1,this._clearPending(),this._teardown()}async _subscribe(e,t,n){const i=await async function(e,t,n){const i=e?.connection;if(!i||!t)return;const r=e=>{if(e&&"error"in e)return"WARNING"===e.level?void Dt("Template warning",{template:t,error:e.error}):($t("Template render error",{template:t,error:e.error}),void n.onError(e.error));var i;e&&"result"in e&&n.onResult(null==(i=e.result)?"":"string"==typeof i?i:String(i))},a=e=>i.subscribeMessage(r,{type:"render_template",template:t,...e?{report_errors:!0}:{}});try{return await a(Av)}catch(e){if(Av&&function(e){return"invalid_format"===e?.code}(e)){Av=!1,Tt("Home Assistant rejected the render_template `report_errors` option; falling back to basic template rendering (requires 2023.9+ for error reporting)");try{return await a(!1)}catch(e){return void $t("Failed to subscribe to template",{template:t,error:e})}}const i=e?.message;return $t("Failed to subscribe to template",{template:t,error:e}),void n.onError(i??String(e))}}(e,t,{onResult:e=>{n===this._version&&this.callbacks.onResult(e)},onError:e=>{n===this._version&&this.callbacks.onError(e)}});i&&(n===this._version?this._unsubscribe=i:i())}_clearPending(){this._debounceId&&(clearTimeout(this._debounceId),this._debounceId=void 0)}_teardown(){if(this._unsubscribe){try{this._unsubscribe()}catch(e){Tt("Failed to unsubscribe from template",e)}this._unsubscribe=void 0}}}const Pv="data-title-fit",Nv="data-title-cut",Iv={width:"--calendar-card-title-room-width",height:"--calendar-card-title-room-height",pad:"--calendar-card-title-pad",start:"--calendar-card-title-cut-start",end:"--calendar-card-title-cut-end",below:"--calendar-card-title-cut-below"},Fv="--calendar-card-title-room-gap",Rv=[Iv.start,Iv.end,Iv.below];function Ov(e){e.removeAttribute(Nv);for(const t of Rv)e.style.removeProperty(t)}function zv(e){Ov(e),e.removeAttribute(Pv);for(const t of Object.values(Iv))e.style.removeProperty(t)}function jv(e){return parseFloat(e)||0}const Hv="data-title-unhyphenated",Wv=/[\p{L}\p{M}\u00AD]/u;function Bv(e){if(!Number.isFinite(e)||e<0)throw new RangeError("Title overflow must be a finite, nonnegative distance.");const t=Math.max(2.8,e/45),n=Math.min(.6,Math.max(.2,e/360));return{start:.6,forward:t,end:.6,back:n,total:.6+t+.6+n}}function qv(e,t){const{start:n,forward:i,end:r,total:a}=Bv(e);if(!Number.isFinite(t)||t<a)throw new RangeError("The title cohort period must contain every complete title trip.");const o=e=>`${(e/t*100).toFixed(10)}%`;return`linear(0 0%, 0 ${o(n)}, 1 ${o(n+i)}, 1 ${o(n+i+r)}, 0 ${o(a)}, 0 100%)`}function Uv(e,t){return e.distance===t.distance&&e.direction===t.direction&&e.signature===t.signature}function Vv(e){let t=0;for(const n of e.values())t=Math.max(t,Bv(n.distance).total);return t}class Gv{constructor(){this._members=new Map,this._desired=new Map,this._period=0,this._pending=!1}get members(){return this._members}get period(){return this._period}get pending(){return this._pending}get empty(){return 0===this._desired.size}update(e){this._desired=new Map(e);const t=[];for(const[n,i]of this._members){const r=e.get(n);r&&Uv(i,r)||(this._members.delete(n),t.push(n))}return this._pending=this._members.size!==e.size||Vv(e)!==this._period,t}retire(e){this._members.delete(e)}commit(){this._members=new Map(this._desired),this._period=Vv(this._members),this._pending=!1}clear(){this._members.clear(),this._desired.clear(),this._period=0,this._pending=!1}}const Kv="data-title-motion",Yv="--calendar-card-title-cohort-period",Jv="--calendar-card-title-cohort-curve",Xv="calendar-card-title-scroll-paused",Zv=["calendar-card-title-cohort-a","calendar-card-title-cohort-b"];class Qv{constructor(e,t){this.host=e,this.remeasure=t,this.targets=new Map,this.active=new Map,this.cohort=new Gv,this.motion=matchMedia("(prefers-reduced-motion: reduce)"),this.hostVisible=!1,this.hostHasBox=!0,this.frame=null,this.generation=0,this.nameIndex=0,this.disposed=!1,this.fallback=!1,this.motionChanged=()=>{this.fallback||this.reset(),this.refresh(),this.motion.matches||this.remeasure()},this.visibilityChanged=()=>{this.refresh()},this.intersections=new IntersectionObserver(t=>{const n=t.find(t=>t.target===e);n&&(this.hostHasBox=n.boundingClientRect.width>0&&n.boundingClientRect.height>0,this.hostVisible=this.visible(n));for(const e of t){const t=this.targets.get(e.target);t&&(t.visible=this.visible(e))}this.refresh()}),this.intersections.observe(e),this.motion.addEventListener("change",this.motionChanged),e.ownerDocument.addEventListener("visibilitychange",this.visibilityChanged)}get enhanced(){return!this.fallback}visible(e){return e.isIntersecting&&e.intersectionRect.width>0&&e.intersectionRect.height>0}get paused(){if(!this.hostVisible||this.host.ownerDocument.hidden)return!0;for(const e of this.targets.values())if(e.visible)return!1;return!0}sync(e){const t=new Set(e);for(const e of this.targets.keys())t.has(e)||(this.intersections.unobserve(e),this.targets.delete(e),this.clearTitle(e));for(const e of t)this.targets.has(e)||(this.targets.set(e,{visible:!1}),this.fallback||e.setAttribute(Kv,"pending"),this.intersections.observe(e));this.refresh()}measure(e){for(const t of e){const e=this.targets.get(t.title);e&&(e.measurement=t)}this.refresh()}refresh(){if(this.disposed)return;if(this.host.classList.toggle(Xv,this.paused),this.fallback)return;if(this.motion.matches||!this.hostHasBox)return void this.reset();if(this.paused)return void this.cancelFrame();const e=new Map;for(const[t,{visible:n,measurement:i}]of this.targets){const r=t.closest(".grid-event")?.dataset.gridTitleFit;n&&i&&t.isConnected&&t.contains(i.content)&&t.classList.contains("title-scrollable")&&!t.classList.contains("empty-day-title")&&i.distance>1&&"blank"!==r&&"measuring"!==r&&e.set(i.content,i)}const t=[...this.active].filter(([,{animation:e}])=>"idle"===e.playState).map(([e])=>e);for(const e of t)this.cohort.retire(e),this.withdraw(e);for(const t of this.cohort.update(e))this.withdraw(t);this.bindLeader(),this.cohort.empty?this.reset():0===this.cohort.members.size&&this.scheduleCommit()}withdraw(e){const t=this.active.get(e);t&&this.targets.has(t.title)&&t.title.setAttribute(Kv,"pending"),this.clearTiming(e),this.active.delete(e)}bindLeader(){const e=this.cohort.members.keys().next().value;if(e===this.leader)return;if(this.stopLeader?.(),this.stopLeader=void 0,this.leader=e,!e)return;const t=this.generation,n=Zv[this.nameIndex],i=i=>{t===this.generation&&i.target===e&&i.animationName===n&&this.cohort.pending&&!this.paused&&this.scheduleCommit()};e.addEventListener("animationiteration",i),this.stopLeader=()=>e.removeEventListener("animationiteration",i)}scheduleCommit(){null===this.frame&&(this.frame=requestAnimationFrame(()=>{if(this.frame=null,!(this.disposed||this.fallback||this.paused||this.motion.matches)&&(this.refresh(),this.cancelFrame(),this.cohort.pending&&!this.cohort.empty)){if(this.leader){const e=this.active.get(this.leader)?.animation.effect?.getComputedTiming();if("number"!=typeof e?.progress||!Number.isFinite(e.progress)||"number"!=typeof e.duration||!Number.isFinite(e.duration)||e.duration<=0)return void this.useFallback("Native title animation phase is unavailable.");if(e.progress*e.duration>600)return}this.commit()}}))}commit(){this.stopLeader?.(),this.stopLeader=void 0,this.leader=void 0,this.generation+=1,this.nameIndex=1-this.nameIndex,this.cohort.commit();const e=this.cohort.period,t=new Map;for(const[e,n]of this.targets)n.measurement&&t.set(n.measurement.content,e);for(const[n,i]of this.cohort.members){const r=t.get(n);n.style.setProperty(Yv,`${e}s`),n.style.setProperty(Jv,qv(i.distance,e)),r.setAttribute(Kv,0===this.nameIndex?"a":"b")}const n=[...this.cohort.members.keys()].map(e=>({content:e,animation:e.getAnimations().find(e=>e instanceof CSSAnimation&&e.animationName===Zv[this.nameIndex])})),i=this.host.ownerDocument.timeline.currentTime;if("number"!=typeof i||n.some(({animation:e})=>!e))this.useFallback("Native title animation effects or document clock are unavailable.");else{try{for(const{animation:e}of n)e.startTime=i}catch(e){return void this.useFallback("Native title animation clocks could not be aligned.",e)}this.active.clear();for(const{content:e,animation:i}of n)this.active.set(e,{title:t.get(e),animation:i});this.bindLeader(),Dt("Title motion cohort committed; native startTime aligned once per member",{generation:this.generation,members:n.length,periodSeconds:e,startTime:i})}}useFallback(e,t){Tt(`${e} Keeping independent legacy title scrolling.`,t),this.reset(),this.fallback=!0;for(const e of this.targets.keys())this.clearTitle(e)}cancelFrame(){null!==this.frame&&cancelAnimationFrame(this.frame),this.frame=null}reset(){this.cancelFrame(),this.stopLeader?.(),this.stopLeader=void 0,this.leader=void 0,this.generation+=1;for(const e of this.active.keys())this.clearTiming(e);this.active.clear(),this.cohort.clear();for(const e of this.targets.keys())e.setAttribute(Kv,"pending"),this.clearTiming(e.querySelector(".event-title-scroll"))}clearTiming(e){e?.style.removeProperty(Yv),e?.style.removeProperty(Jv)}clearTitle(e){e.removeAttribute(Kv),this.clearTiming(e.querySelector(".event-title-scroll"))}dispose(){this.disposed=!0,this.reset(),this.intersections.disconnect(),this.motion.removeEventListener("change",this.motionChanged),this.host.ownerDocument.removeEventListener("visibilitychange",this.visibilityChanged);for(const e of this.targets.keys())this.clearTitle(e);this.targets.clear(),this.host.classList.remove(Xv)}}function e_(e){const{TOOLBAR_COMMAND_WIDTH:t,TOOLBAR_COMMAND_GAP:n}=Se;return e<=0?0:e*t+(e-1)*n}function t_(e,t,n=0){const{start:i}=e,r=i.length-1;if(r<2)return{visible:i,overflow:[]};const a=n=>function(e,t){const n=Se.TOOLBAR_COMMAND_GAP,i=e.views>0?function(e){const{TOOLBAR_SWITCHER_SEGMENT_WIDTH:t,TOOLBAR_SWITCHER_TRACK_PADDING:n}=Se;return e<=0?0:e*t+2*n}(e.views)+n:0;return e.insetPx+e_(t)+n+i+e_(e.end.length)}(e,n)<=t;let o=0;if(!a(i.length))for(o=2;o<r&&!a(i.length-o+1);)o+=1;return o=Math.max(o,n),1===o&&(o=2),o=Math.min(o,r),{visible:i.slice(0,i.length-o),overflow:i.slice(i.length-o)}}const n_="calendar_card_pro_view_choice",i_=["list","column","grid"];function r_(e){return Array.isArray(e)?`[${e.map(e=>void 0===e?"null":r_(e)).join(",")}]`:ht(e)?`{${Object.keys(e).filter(t=>void 0!==e[t]).sort().map(t=>`${JSON.stringify(t)}:${r_(e[t])}`).join(",")}}`:JSON.stringify(e)??"null"}function a_(e){const t=r_(e);return`${dt(t)}${t.length.toString(36)}`}function o_(){try{return"undefined"==typeof localStorage?null:localStorage}catch{return null}}function s_(e){return i_.some(t=>t===e)}function l_(e){if(!Array.isArray(e))return;const t=[...new Set(e.filter(e=>"string"==typeof e&&""!==e))];return t.length>0?t:void 0}function d_(e){if(e)try{return e.getItem(n_)}catch{return}}function c_(e){if(null==e)return{};let t;try{t=JSON.parse(e)}catch{return{}}if(!ht(t)||1!==t.version)return{};if(!ht(t.choices))return{};const n={};for(const[e,i]of Object.entries(t.choices)){if(!ht(i)||"number"!=typeof i.at)continue;const t=s_(i.view)?i.view:void 0,r=l_(i.hidden);void 0===t&&void 0===r||(n[e]={...void 0!==t?{view:t}:{},...void 0!==r?{hidden:r}:{},at:i.at})}return n}function u_(e){return c_(d_(e))}function h_(e,t){if(!e)return!1;const n=Object.entries(t).sort(([,e],[,t])=>t.at-e.at).slice(0,50);try{if(0===n.length)return e.removeItem(n_),!0;const t={version:1,choices:Object.fromEntries(n)};return e.setItem(n_,JSON.stringify(t)),!0}catch{return!1}}function m_(e,t,n,i){const r=u_(n),a=r[e],o={...a,...t,at:i};if(void 0===o.view&&delete o.view,void 0!==o.hidden&&0!==o.hidden.length||delete o.hidden,void 0===o.view&&void 0===o.hidden){if(!a)return null!==n;delete r[e]}else r[e]=o;return h_(n,r)}function p_(e,t=o_()){const n=d_(t);if(void 0!==n)return c_(n)[e]?.hidden??[]}var f_=Object.defineProperty,g_=Object.getOwnPropertyDescriptor,v_=(e,t,n,i)=>{for(var r,a=i>1?void 0:i?g_(t,n):t,o=e.length-1;o>=0;o--)(r=e[o])&&(a=(i?r(t,n,a):r(a))||a);return i&&a&&f_(t,n,a),a};function __(e,t){const n=e,i=n?.CalendarCardProEditor;if("function"!=typeof i)throw new Error("Calendar Card Pro: the editor file was found but is not the card’s editor. This usually means another file of the same name is installed alongside it — put the card’s files in a folder of their own, or reinstall through HACS, which does that for you. The card itself is unaffected.");const r=n?.EDITOR_VERSION;r!==fe&&Tt(`Editor file is v${r??"unknown"} but the card is v${fe}. Both files come from the same release, so one of them is stale — hard-refresh the browser, and if that does not help, reinstall so the card and editor files are replaced together.`),customElements.get(t)||customElements.define(t,i)}function y_(e,t){for(let n=t;n;){e.observe(n,{attributes:!0,attributeOldValue:!0,attributeFilter:["style","class","dir","lang"]});const t=n.getRootNode();n=n.parentElement??(t instanceof ShadowRoot?t.host:null)}}function w_(e,t){if(e.target!==t||"class"!==e.attributeName)return!1;const n=e=>e.split(/\s+/).filter(e=>e&&"calendar-card-title-scroll-paused"!==e).sort().join(" ");return n(e.oldValue??"")===n(t.className)}function b_(e){e.classList.remove("title-overflowing"),e.style.removeProperty("--calendar-card-title-scroll-distance"),e.style.removeProperty("--calendar-card-title-scroll-direction"),e.style.removeProperty("--calendar-card-title-scroll-duration")}function x_(e){if("childList"!==e.type)return!1;const t=e.target instanceof Element?e.target:e.target.parentElement;return!t?.closest(`.${Kp}`)&&[...Array.from(e.addedNodes),...Array.from(e.removedNodes)].some(e=>e instanceof Element&&!e.classList.contains(Pp)&&!e.classList.contains(Kp))}function k_(e){if(!(e instanceof Element))return;const t=e.getBoundingClientRect();return{x:t.left+t.width/2,y:t.top+t.height/2,rect:Us(e)}}function $_(){return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches??!1}function T_(e){try{return window.matchMedia?.(e)?.matches??!1}catch{return!1}}function S_(e){e.style.removeProperty("transform"),e.getAttribute("style")||e.removeAttribute("style")}function M_(e){return e.scrollHeight>e.clientHeight+1}function D_(e){if(e.lineHeight.endsWith("px")){const t=Number.parseFloat(e.lineHeight);if(Number.isFinite(t)&&t>0)return t}const t=Number.parseFloat(e.fontSize);return Number.isFinite(t)&&t>0?1.2*t:0}function C_(e,t,n){if(n<=0)return 0;const i=e-1;return Math.max(1,Math.round(t/n))-Math.max(0,Math.ceil(i/n))}const A_=[{selector:".description",lineProperty:"--calendar-card-description-max-lines"},{selector:".location",lineProperty:"--calendar-card-location-max-lines"},{selector:".event-weather",lineProperty:null},{selector:".progress-bar-row",lineProperty:null},{selector:".time",lineProperty:null}],E_='[role="button"][tabindex]',L_=new Set,P_={instanceId:"",events:[],raw:[],loadedAt:{},fetchedAt:0};function N_(e,t){const n=void 0===t?void 0:e.loadedAt[t];return"number"==typeof n?n:e.fetchedAt}const I_=new Set;function F_(e){return e.reduce((e,t)=>e+t.events.filter(e=>!e._isEmptyDay).length,0)}let R_=class extends de{constructor(){super(),this.config={...jn},this.events=[],this.isInitialLoad=!0,this.isLoading=!1,this.isExpanded=!1,this.weatherForecasts={daily:{},hourly:{}},this.preview=!1,this.editMode=!1,this.connectedWhileHidden=!0,this._eventsInstanceId="",this._liveReleases=[],this._liveCalendars=new Set,this._liveUnlisten=null,this._liveConnection=null,this._liveSyncTimer=null,this._liveDriftLoaded="",this._drawnRaw=[],this._drawnLoadedAt={},this._completeDrawing=P_,this._eventRequestGeneration=0,this._partialCommit=null,this._partialTimer=null,this._language="",this._intlLanguage="",this._lastUpdateTime=0,this._eventsFetchedAt=0,this._appearLoadPending=!1,this._failureCountHint=0,this._failureCountQuery="",this._weatherUnsubscribers=[],this._weatherSetupVersion=0,this._weatherSetupPending=!1,this._failedEntities=[],this._activePointerId=null,this._pointerStart=null,this._pointerMoved=!1,this._holdTriggered=!1,this._holdTimer=null,this._holdIndicator=null,this._pointerCaptureTarget=null,this._capturedPointerId=null,this._releasingPointerCapture=!1,this._pointerTapTarget=null,this._pointerSwipeable=!1,this._swipeNudge=null,this._swipeMotion=null,this._swipeArrival=null,this._derivedClick=null,this._spaceArmedOn=null,this._pointerDayHit=null,this._pointerAddContext=null,this._pointerDayAdd=null,this._pointerHandedTo=null,this._pointerOnLink=!1,this._pointerDraftFrom=null,this._draft=null,this._move=null,this._newShown=null,this._newHosts=new Map,this._newObserved=new Set,this._swallowTouchEndUntil=0,this._liftingTouch=!1,this._washedDay=null,this._bandOpenForNew=!1,this._handleLegendChanged=e=>{const t=e.detail;t&&t.source!==this&&this._wantsLegend&&t.fingerprint===this._configFingerprint&&(this._adoptHiddenCalendars(t.hidden),this._hiddenMatchesStorage=t.stored)},this._handleStorageChanged=e=>{const t=e;if(!this._wantsLegend||null===this._configFingerprint)return;const n=o_();if(null===n||t.storageArea!==n)return;const i=function(e,t){if(null===e.key)return[];if(e.key!==n_)return;const n=c_(e.oldValue)[t]?.hidden??[],i=c_(e.newValue)[t]?.hidden??[];return n.length===i.length&&n.every(e=>i.includes(e))?void 0:i}(t,this._configFingerprint);void 0!==i&&(this._adoptHiddenCalendars(i),this._hiddenMatchesStorage=!0)},this._handleCalendarsChanged=e=>{const t=e.detail;t&&t.source!==this&&function(e,t,n){return Pa(e.changed,t,n)}(t,this.config.entities.map(e=>"string"==typeof e?e:e.entity),this.safeHass)&&(this._markHomeStaleIfAway(),this.refreshEvents(t.writeGeneration),this._search?.calendarsChanged())},this._openEventDetails=(e,t,n)=>{if(this._isBeingEdited)return void Dt("Not opening the event popover while the card is being edited");const i=this._detailsParams(e,t,n);i&&this._openPopover(i)},this._measuredWidthPx=null,this._toolbarWidthPx=null,this._toolbarLabelsOverflowed=null,this._monthFit=null,this._configFingerprint=null,this._viewChoice=null,this._hiddenCalendars=L_,this._hiddenMatchesStorage=!1,this._refreshPhase="idle",this._refreshTicket=0,this._resetConfirmation=null,this._homeConfirming=!1,this._refreshAwaitsLoad=null,this._shownEventsCache=null,this._visibility=Fn,this._visibilityChanged=!1,this._visibilityQueries=new Map,this._visibilityTimerId=null,this._visibilityTimerAt=null,this._coreConditions=new _g(()=>{Dt("Visibility: Home Assistant answered a condition"),this.requestUpdate()}),this._legendFold=null,this._legendWidthPx=null,this._legendUnfoldedAtPx=null,this._legendFitRaf=null,this._toolbarRow=null,this._startFoldGuard=null,this._focusBeforeFold=null,this._tapFocusBefore=null,this._toolbarFontGeneration=0,this._toolbarFontsCleanup=null,this._toolbarLabelMinWidthPx=null,this._search=null,this._searchRing=null,this._searchRingDrawn=!1,this._searchPanelGone=!0,this._pageRequested=null,this._pageShown=null,this._loadedDaysShown=null,this._pageConfigs=null,this._homeStale=!1,this._homeWindowCache=null,this._effectiveView="list",this._columnCount=0,this._cascadeThresholds=new Map([[1,30]]),this._overflowStripPct=1/0,this._gridScaleRaf=null,this._resizeObserver=null,this._gridDisclosureObserver=null,this._gridDisclosureRaf=null,this._gridDisclosureReleaseRaf=null,this._gridDisclosureTargets=new Map,this._gridDisclosureDirty=new Set,this._gridDisclosureMutations=null,this._gridDisclosureAssetsCleanup=null,this._gridDisclosureObservedSizes=new WeakMap,this._gridDisclosureSuppressRo=!1,this._gridDisclosureSuppressGeneration=0,this._gridDisclosureFontsCleanup=null,this._nowLineTimerId=null,this._nowLineDayKey=null,this._bareUpdateRequests=0,this._bareUpdateRequestsSeen=0,this._clockRepainting=!1,this._bareUpdatePending=!1,this._clockTimerId=null,this._clockTimerAt=null,this._midnightTimerId=null,this._midnightArmedDay=null,this._followsTodayCache=null,this._nowBoundaryTimerId=null,this._nowBoundaryAt=null,this._nowBoundaryEvents=null,this._nowBoundaryConfig=null,this._widthSettleTimerId=null,this._titleScrollObserver=null,this._titleScrollIntersectionObserver=null,this._titleScrollMutations=null,this._titleScrollRaf=null,this._titleScrollFontsCleanup=null,this._titleMotion=null,this._titleFitObserver=null,this._titleFitMutations=null,this._titleFitRaf=null,this._titleFitFontsCleanup=null,this._handleVisibilityChange=()=>{this._syncNowLineTimer(),this._syncNowBoundaryTimer(),this._syncClockTimer(),"visible"===document.visibilityState&&((this._wantsNowLine||this._wantsNowBoundary)&&this.requestUpdate(),this._resyncHiddenCalendars(),Date.now()-this._lastUpdateTime>3e5&&(Dt("Visibility changed to visible, updating events"),this.updateEvents("cache")))},this._onEntityColorsChanged=()=>{this.requestUpdate()},this._onLiveChange=e=>{this._search?.calendarsChanged(),("*"===e||this._liveCalendars.has(e))&&null===this._liveSyncTimer&&(this._liveSyncTimer=window.setTimeout(()=>{this._liveSyncTimer=null,this._syncLive()},0))},this._draftSecondContact=e=>{this._drawingPress&&e.pointerId!==this._activePointerId&&this._endGesture()},this._swallowTouchEnd=e=>{Date.now()>this._swallowTouchEndUntil||(this._swallowTouchEndUntil=0,e.cancelable&&e.preventDefault())},this._draftKeyDown=e=>{"Escape"===e.key&&this._drawingPress&&(e.preventDefault(),e.stopPropagation(),this._endGesture())},this._draftTouchMove={handleEvent:e=>{this._drawingPress&&e.cancelable&&e.preventDefault()},passive:!1},this._refuseNativeDrag=e=>{this._move&&e.cancelable&&e.preventDefault()},function(e){bt||(console.groupCollapsed(`%c${ve}%cv${e} `,kt.title,kt.version),console.log("%c Description: %c A calendar card that supports multiple calendars with individual styling. ","font-weight: bold","font-weight: normal"),console.log("%c GitHub: %c https://github.com/alexpfau/calendar-card-pro ","font-weight: bold","font-weight: normal"),console.groupEnd(),bt=!0)}(fe)}static async getConfigElement(){if(!customElements.get("calendar-card-pro-editor"))try{__(await(import(function(e){const t=new URL("./editor.js",e);return t.search=new URL(e).search,t.href}(import.meta.url))),"calendar-card-pro-editor")}catch(e){const t=e instanceof Error?e.message:String(e);throw $t(e,"loading the editor file"),new Error(`Calendar Card Pro: the editor could not be loaded because one of the card’s files is missing. Reinstalling the card in HACS restores it. The card itself is unaffected. (${t})`)}return document.createElement("calendar-card-pro-editor")}getGridOptions(){return{columns:"full",rows:"auto"}}get _instanceId(){return this._instanceIdForPage(null)}_cardActionRuns(e){const t="hold"===e?this.config.hold_action:this.config.tap_action;return!(!t||"none"===t.action)&&(t.action===_e?this._canAddEvents:t.action===ye?this._canReset:t.action!==we||!this._isBeingEdited)}get _hasTapAction(){return this._cardActionRuns("tap")}get _hasHoldAction(){return this._cardActionRuns("hold")}get _writableCalendars(){const e=this._visibility.calendars.size?[...this._failedEntities,...this._visibility.calendars]:this._failedEntities;return function(e,t,n=[]){if(!e?.states)return[];const i=[];for(const r of t){const t="string"==typeof r?r:r?.entity;!t||i.includes(t)||n.includes(t)||ba(e,t,1)&&i.push(t)}return i}(this.safeHass,this.config.entities,e)}get _canAddEvents(){return!this._isBeingEdited&&this._writableCalendars.length>0}get _dayTapsActive(){const e=this.config.day_tap_action;return e?.action===_e&&this._canAddEvents}get _dayAddButtons(){if(this._dayTapsActive)return{label:Ca(this.safeHass)??Da}}_refreshAfterWrite(e,t){this._markHomeStaleIfAway();const n=this.safeHass;!function(e){for(const t of _d.values())"persistent"===t.store&&e(t.calendars)&&(t.expired=!0);const t=[];try{for(let e=0;e<localStorage.length;e+=1){const n=localStorage.key(e);n?.startsWith(ge)&&n.endsWith(fe)&&t.push(n)}}catch(e){return void Tt("Could not list cached events:",e)}for(const n of t){const t=hc(n);if(t&&!t.expired&&e(uc(t)))try{localStorage.setItem(n,JSON.stringify({...t,expired:!0}))}catch(e){Tt("Could not expire cached events, removing them:",e);try{localStorage.removeItem(n)}catch{}}}}(t=>Pa(e,t,n));const i=function(){const e=vd()+1;return globalThis[gd]=e,e}();this.refreshEvents(i).then(()=>t?.()),this._search?.calendarsChanged(),function(e,t,n){window.dispatchEvent(new CustomEvent(La,{detail:{changed:t,writeGeneration:n,source:e}}))}(this,e,i)}_resyncHiddenCalendars(){if(!this._wantsLegend||null===this._configFingerprint||!this._hiddenMatchesStorage)return;const e=p_(this._configFingerprint);if(void 0===e)return;const t=new Set(bf(this.config.entities)),n=e.filter(e=>t.has(e)),i=this._hiddenCalendars;n.length===i.size&&n.every(e=>i.has(e))||this._adoptHiddenCalendars(n)}_adoptHiddenCalendars(e){const t=new Set(bf(this.config.entities)),n=e.filter(e=>t.has(e));this._hiddenCalendars=n.length>0?new Set(n):L_,this.requestUpdate()}_markHomeStaleIfAway(){null===this._pageRequested&&null===this._pageShown||(this._homeStale=!0)}_detailsParams(e,t,n){const i=e._entityId,r=Hs(e);if(!i||!r)return;const a=this._popoverCalendar(i,t),o=this._eventPermissions(e,r),s=o.canEdit&&o.canDelete?this._writableCalendars.filter(e=>e!==i):[];return{mode:"event",calendarId:i,entry:r,display:Bs(e),hidden:Ws(e),color:a.color,calendars:[a,...s.map(e=>this._popoverCalendar(e))],...o,anchor:n,updated:(...e)=>this._refreshAfterWrite({ids:e.length?e:[i]})}}_eventPermissions(e,t){return function(e,t,n,i){const r=t._entityId,a=(t._mergedFrom?.length??0)>1;return!r||!n.uid||a||i.failedEntities.includes(r)?{canEdit:!1,canDelete:!1}:{canEdit:i.allowEdit&&ba(e,r,4)&&void 0!==js(t),canDelete:i.allowDelete&&ba(e,r,2)}}(this.safeHass,e,t,{allowEdit:!1!==this.config.allow_event_edit,allowDelete:!1!==this.config.allow_event_delete,failedEntities:this._failedEntities})}_openPopover(e){const t=this.safeHass,n={...e,language:t?.locale?.language??this._language??"en",hour24:hs(this.config,t),dark:this._panelsDark()};this._liftingTouch&&(this._swallowTouchEndUntil=Date.now()+$e);const i=new Event("show-dialog",{bubbles:!0,composed:!0});i.detail={dialogTag:qh,dialogImport:()=>customElements.whenDefined(qh),dialogParams:n},this.dispatchEvent(i),Dt(`Opened the event popover for ${e.calendarId}`)}_popoverCalendar(e,t){const n=t??Zd(e,this.config,void 0,void 0,Qi());return{id:e,name:Dp(e,this.config,this.safeHass),color:this._resolvedColor(n)}}_resolvedColor(e){const t=getComputedStyle(this);let n=e;for(let e=0;e<3&&/var\(--calendar-card-/.test(n);e++)n=n.replace(/var\((--calendar-card-[\w-]+)(?:,\s*([^()]*))?\)/g,(e,n,i)=>t.getPropertyValue(n).trim()||i?.trim()||"var(--primary-color)");return n}get _eventTapRuns(){return"none"!==Ls(this.config.event_tap_action)}get _eventHoldRuns(){return"none"!==Ls(this.config.event_hold_action)}get _isBeingEdited(){return this.preview||this.editMode}get _eventsActivatable(){return(this._eventTapRuns||this._eventHoldRuns)&&!this._isBeingEdited}_runEventAction({event:e,color:t},n,i){const r="hold"===n?this.config.event_hold_action:this.config.event_tap_action,a=Ls(r);if("details"===a)return Dt(`Executing event ${n} action: details`),void this._openEventDetails(e,t,i);if("forward"!==a||!r||this._isBeingEdited)return;const o=function(e,t){const n=new Set,i={action:e.action};try{for(const[r,a]of Object.entries(e))"action"!==r&&(i[r]=zs(a,t,{key:r,payload:Is.has(r)},n))}catch(e){if(e instanceof Os)return;throw e}if("url"===i.action&&n.has("url_path")){const e=(r=String(i.url_path??""),/^\s*([a-z][a-z0-9+.-]*):/i.exec(r)?.[1]?.toLowerCase());if(void 0!==e&&!Fs.has(e))return}var r;return i}(r,function(e){const t=e._source??e,n=t.start?.dateTime??t.start?.date??"",i=t.end?.dateTime??t.end?.date??"",r=!t.start?.dateTime&&Boolean(t.start?.date),a=e._matchedConfig,o=As(a?.replace_field,a?.replace_pattern,a?.replace_with),s=(e,t)=>Es(e??"",o,t).text;return{title:s(t.summary,"title"),start:n,end:i,all_day:r?"true":"false",location:s(t.location,"location"),description:s(t.description?Jo(t.description):"","description"),calendar:e._entityId??""}}(e));o?(_a(this,{entity:e._entityId,[`${n}_action`]:o},n),Dt(`Delegated event ${n} action (${o.action}) to HA native handler`)):Tt(`Not running event ${n} action: it puts an event's text outside its data or URL query, or its URL would not open over http or https`)}_eventTapAt(e,t=this._pathOf(e)){if(this._eventsActivatable&&t)return Qc(t,e.currentTarget)}_pathOf(e){return"function"==typeof e.composedPath?e.composedPath():void 0}_pressPath(e){const t=this._pathOf(e);if(!t||"touch"!==e.pointerType||"grid"!==this.effectiveView)return t&&{path:t,lifts:!0};const n=Qc(t,e.currentTarget);if(!n)return{path:t,lifts:!0};const i={x:e.clientX,y:e.clientY},r=function(e,t){const n=e.elementFromPoint;if("function"==typeof n)return n.call(e,t.x,t.y)}(this.renderRoot,i);if(void 0===r||r&&n.element.contains(r))return{path:t,lifts:!0};const a=r?function(e){const t=[];for(let n=e;n;)t.push(n),n=n instanceof ShadowRoot?n.host:n.parentNode;return t}(r):[],o=this._dayTapsActive&&(Qc(a,e.currentTarget)??su(a,e.currentTarget,i));return Dt("A touch reached an event it is not on; "+(o?"reading it from under the finger":"it lifts nothing")),o?{path:a,lifts:!0,handedTo:n.element}:{path:t,lifts:!1}}_cardActions(e,t){return{expand:()=>this.toggleExpanded(),refresh:()=>this._requestRefresh(),addEvent:()=>this._addEventAt(e??void 0,t),reset:()=>this._resetFromAction(),back:e=>this._goBack(e)}}_goBack(e){if(this._isBeingEdited)return void Dt("Not going back while the card is being edited");const t=function(e,t,n){if(function(e){return"object"==typeof e&&null!==e&&void 0!==e.from}(e))return{kind:"history"};const i="string"==typeof n?n.trim():"";return{kind:"replace",path:""!==i?i:Ea(t)}}(window.history.state,window.location.pathname,e.navigation_path);if("history"===t.kind)return Dt("Going back to the page before this one"),void window.history.back();Dt(`No page of Home Assistant's behind this one; going to ${t.path}`),_a(this,{tap_action:{action:"navigate",navigation_path:t.path,navigation_replace:!0}},"tap")}get safeHass(){return this.hass||null}get effectiveLanguage(){return!this._language&&this.hass&&(this._language=Ge(this.config.language,this.hass.locale)),this._language||"en"}get groupedEvents(){return Hd(this._shownEvents,this.effectiveConfig,this.isExpanded,this.effectiveLanguage,this.effectiveView,this.hass)}get _activeHiddenCalendars(){return this._wantsLegend&&!this._isBeingEdited?this._hiddenCalendars:L_}get _shownEvents(){const e=this._activeHiddenCalendars,t=this._visibility;if(0===e.size&&0===t.hidden.size)return this.events;const n=this._shownEventsCache;if(n&&n.events===this.events&&n.hidden===e&&n.visibility===t)return n.shown;const i=this.events.filter(t=>this._eventShown(t,e));return this._shownEventsCache={events:this.events,hidden:e,visibility:t,shown:i},i}_eventShown(e,t=this._activeHiddenCalendars){return!t.has(e._entityId??"")&&!zn(e,this._visibility)}_refreshVisibility(){const e=this._isBeingEdited?Fn:function(e,t){const n=new Set,i=new Set,r=new Set;for(const a of e){if("string"==typeof a){i.add(a);continue}const e=a.visibility;e&&!zt(e,{...t,entityId:a.entity})?(n.add(Rn(a.entity,e)),r.add(a.entity)):i.add(a.entity)}for(const e of i)r.delete(e);return 0===n.size?Fn:{hidden:n,calendars:r}}(this.config.entities??[],{hass:this.hass,now:Date.now(),matches:T_,core:e=>this._coreConditions.answer(e,this.hass)});this._visibilityChanged=!function(e,t){return e===t||On(e.hidden,t.hidden)&&On(e.calendars,t.calendars)}(e,this._visibility),this._visibilityChanged&&(this._visibility=e,Dt(`Visibility: ${e.hidden.size} entr${1===e.hidden.size?"y":"ies"} hidden`))}get _shownEntries(){const e=this._visibility.calendars;return 0===e.size?this.config.entities:this.config.entities.filter(t=>!e.has("string"==typeof t?t:t.entity))}get _shownFailures(){const e=this._visibility.calendars;return 0===e.size?this._failedEntities:this._failedEntities.filter(t=>!e.has(t))}get _holdsShownEvent(){const e=this._visibility;return 0===e.hidden.size?this.events.length>0:this.events.some(t=>!zn(t,e))}get _legendHidesAShownCalendar(){const e=this._activeHiddenCalendars;if(0===e.size)return!1;const t=this._visibility.calendars;return 0===t.size||[...e].some(e=>!t.has(e))}_legendCalendarIds(){const e=bf(this.config.entities),t=this._visibility.calendars;return 0===t.size?e:e.filter(e=>!t.has(e))}get requestedView(){return this._viewChoice??this.config.view}get effectiveView(){return this._isBeingEdited?this.config.view:this._effectiveView}get _shownColumnCount(){return this._isBeingEdited&&this.requestedView!==this.config.view?pa(this.config.view,this.config,this._measuredWidthPx,null).columns:this._columnCount}get effectiveConfig(){const e=this.effectiveView,t=this._configForPage(this._pageShown),n=this._loadedDaysShown,i=this._effectiveConfigCache;if(i&&i.config===t&&i.view===e&&i.loadedDays===n)return i.resolved;let r=Vr(t,e);const a=r.days_to_show;return null!==n&&a>n&&(r={...r,days_to_show:n}),this._effectiveConfigCache={config:t,view:e,loadedDays:n,resolved:r,configuredDays:a},r}_configForPage(e){if(null===e)return this.config;this._pageConfigs?.config!==this.config&&(this._pageConfigs={config:this.config,pages:new Map});const t=this._pageConfigs.pages.get(e);if(t)return t;const n={...this.config,start_date:e,show_past_events:!0};for(const e of dr){const t=Hr[e]?.blockKey,i=t?this.config[t]:void 0;t&&ht(i)&&"show_past_events"in i&&(n[t]={...i,show_past_events:!0})}return this._pageConfigs.pages.set(e,n),n}_instanceIdForPage(e){return function(e,t,n,i){const r=e.map(e=>"string"==typeof e?e:e.entity).sort().join("_");let a="";if(n)try{a=n.includes("T")?n.split("T")[0]:n}catch{a=n}return dt(`calendar_${r}_${t}${a?`_${a}`:""}${lt(a,i)}`)}(this.config.entities,ua(this.config),e??this.config.start_date,vs(this.config.first_day_of_week,this.hass?.locale))}_loadConfigForPage(e){return ha(this._configForPage(e))}get _viewDays(){return this.effectiveConfig,this._effectiveConfigCache.configuredDays}get _wantsNavigation(){const e=Jn(this.config);return e.show&&e.navigation}get _swipeAvailable(){return this._wantsNavigation&&!this._isBeingEdited&&!("grid"===this.effectiveView&&function(e,t,n,i){if(!cr.has(e)||i.view!==e)return!1;if(null===n||n<=0)return!1;if("cramp"!==da(t,e))return!1;const r=Math.min(la(t,e),aa(t,e));return fa(e,t,n,i)<r}("grid",this.config,this._measuredWidthPx,{view:this._effectiveView,columns:this._columnCount}))}get _shedColumns(){return"list"===this.effectiveView?0:this._shownColumnCount}_homeWindowStart(e){const t=vs(this.config.first_day_of_week,this.hass?.locale),n=[Qo(e),this.config.start_date??"",this.config.days_to_show,t].join("|");if(this._homeWindowCache?.key!==n){const{start:e}=dc(this.config.days_to_show,this.config.start_date,t);this._homeWindowCache={key:n,start:e}}return this._homeWindowCache.start}_homeRange(e=new Date){return function(e,t,n,i){const r=gc(e),a=Math.max(1,Math.floor(t)||1),o=wc(a,n);if(o===a)return{start:r,days:o};const s=as(r,gc(i));return{start:vc(r,Math.min(Math.max(s,0),a-o)),days:o}}(this._homeWindowStart(e),this._viewDays,this._shedColumns,e)}get _listsLatestFirst(){return mr(this.effectiveConfig,this.effectiveView)}_pageRange(e,t=new Date){return null===e?this._homeRange(t):{start:yc(e),days:wc(this._viewDays,this._shedColumns)}}get effectiveTitle(){return Ev(this.config.title)?this.renderedTitle??"":this.config.title}get isTitlePending(){return Ev(this.config.title)&&void 0===this.renderedTitle}get visibleEventCount(){const e=this.effectiveLanguage,t=this.effectiveView,n=vs(this.config.first_day_of_week,this.hass?.locale),i=is(this.hass).join(","),r=Date.now(),a=this._visibleCountCache,o=this._shownEvents;if(a&&a.events===o&&a.config===this.config&&a.view===t&&a.language===e&&a.firstWeekday===n&&a.weekendDaysKey===i&&a.evaluatedAt===r)return a.count;const s=o.length?F_(Hd(o,this.effectiveConfig,!0,e,t,this.hass)):0;return this._visibleCountCache={events:o,config:this.config,view:t,language:e,firstWeekday:n,weekendDaysKey:i,evaluatedAt:r,count:s},s}_anyReachableViewHasEvents(){if(this.visibleEventCount>0)return!0;const e=this._shownEvents;if(0===e.length)return!1;const t=this.effectiveView;return ca(this.config).some(n=>n!==t&&F_(Hd(e,this.config,!0,this.effectiveLanguage,n,this.hass))>0)}static get styles(){return mp}connectedCallback(){super.connectedCallback(),Dt("Component connected"),this.startRefreshTimer(),this._appearLoadPending=!0,this.updateEvents("navigate"),this._scheduleWeatherSetup(),this._updateTitleSubscription(),document.addEventListener("visibilitychange",this._handleVisibilityChange),window.addEventListener(La,this._handleCalendarsChanged),window.addEventListener(gf,this._handleLegendChanged),window.addEventListener("storage",this._handleStorageChanged),this._resyncHiddenCalendars(),this.config?.entities?.some(e=>"string"!=typeof e&&e.visibility)&&this.requestUpdate(),this._syncEntityColors(),this._startWidthObserver(),this._syncTitleScroll(),this._syncTitleFits(),this._syncGridDisclosureSafety()}disconnectedCallback(){super.disconnectedCallback(),this._stopWidthObserver(),this._stopGridDisclosureObserver(),this._stopTitleScrollObserver(),this._stopTitleFits(),mf(this.renderRoot),this._search?.close(),this._settleSearchRing(),this._toolbarFontsCleanup?.(),this._toolbarFontsCleanup=null,this._settleResetConfirmation(),this._settleHomeConfirmation(),null!==this._legendFitRaf&&(cancelAnimationFrame(this._legendFitRaf),this._legendFitRaf=null),this._weatherSetupVersion++,this._weatherSetupPending=!1,this._cleanupWeatherSubscriptions(),this._titleSubscription?.destroy(),this._titleSubscription=void 0,this._eventRequestGeneration++,this.isLoading=!1,this._settleRefreshPhase(),this._refreshTimerId&&(clearTimeout(this._refreshTimerId),this._refreshTimerId=void 0),this._initialLoadRetryId&&(clearTimeout(this._initialLoadRetryId),this._initialLoadRetryId=void 0),this._endGesture(),this._derivedClick=null,this._spaceArmedOn=null,this._swipeArrival=null,this._swipeMotion?.cancel(),this._swipeMotion=null,this._stopNowLineTimer(),this._stopMidnightTimer(),this._stopNowBoundaryTimer(),this._stopClockTimer(),this._stopVisibilityWatch(),this._cancelPartialCommit(),this._releaseLive(),document.removeEventListener("visibilitychange",this._handleVisibilityChange),window.removeEventListener(La,this._handleCalendarsChanged),window.removeEventListener(gf,this._handleLegendChanged),window.removeEventListener("storage",this._handleStorageChanged),ar(this._onEntityColorsChanged),Dt("Component disconnected")}_startWidthObserver(){this._resizeObserver||"undefined"==typeof ResizeObserver||(this._resizeObserver=new ResizeObserver(e=>{const t=e[0]?.contentRect?.width;"number"==typeof t&&t>0&&(null!==this._toolbarWidthPx&&Math.abs(t-this._toolbarWidthPx)>.5&&(mf(this.renderRoot),this._search?.close()),this._syncToolbarLabels(t),this._scheduleLegendFit(),this._scheduleWidthMeasurement(t)),this._scheduleGridScaleSync()}),this._resizeObserver.observe(this))}_syncToolbarLabels(e){const t=[Se.TOOLBAR_SWITCHER_LABEL_MIN_WIDTH,this._toolbarLabelMinWidthPx,this._monthFit?.fullFromPx].filter(e=>"number"==typeof e),n=e=>null===e?"":t.map(t=>e>=t?1:0).join(""),i=n(e)!==n(this._toolbarWidthPx),r=this._startHidden(e)!==this._startHidden(this._toolbarWidthPx),a=this._toolbarLabelsOverflowed,o=null!==a&&e>a.widthPx&&(this._toolbarWidthPx??0)<=a.widthPx;e!==this._toolbarWidthPx&&(this._startFoldGuard=null),this._toolbarWidthPx=e,(i||r||o)&&Jn(this.config).show&&this.requestUpdate()}_scheduleWidthMeasurement(e){null!==this._widthSettleTimerId&&clearTimeout(this._widthSettleTimerId),this._widthSettleTimerId=window.setTimeout(()=>{this._widthSettleTimerId=null,this._handleWidthMeasured(e)},100)}get _wantsNowLine(){return"grid"===this.effectiveView&&wr(this.config,"show_now_line")}_syncNowLineTimer(){if(!this.isConnected||!this._wantsNowLine||"hidden"===document.visibilityState)return void this._stopNowLineTimer();if(null!==this._nowLineTimerId)return;this._nowLineTimerId=window.setInterval(()=>{this._tickNowLine()},6e4);const e=Qo(new Date);if(null!==this._nowLineDayKey&&e!==this._nowLineDayKey)return this._nowLineDayKey=e,Dt("Local day rolled over while the now-line timer was stopped, refreshing events"),void this.updateEvents("cache");this._nowLineDayKey=e}_stopNowLineTimer(){null!==this._nowLineTimerId&&(clearInterval(this._nowLineTimerId),this._nowLineTimerId=null)}get _windowFollowsToday(){const e=this.config.start_date;return null!==this._followsTodayCache&&this._followsTodayCache.startDate===e||(this._followsTodayCache={startDate:e,follows:cc(e)}),this._followsTodayCache.follows}get _wantsMidnightTimer(){return("grid"===this.effectiveView||"column"===this.effectiveView)&&this._shownColumnCount>0&&this._shownColumnCount<this.effectiveConfig.days_to_show||this._windowFollowsToday}_syncMidnightTimer(){if(!this.isConnected||!this._wantsMidnightTimer)return void this._stopMidnightTimer();const e=new Date,t=Qo(e),n=null!==this._midnightTimerId&&null!==this._midnightArmedDay&&this._midnightArmedDay!==t;this._stopMidnightTimer(),this._midnightArmedDay=t,n&&this._onMidnight();const i=new Date(e.getFullYear(),e.getMonth(),e.getDate()+1,0,0,1);this._midnightTimerId=window.setTimeout(()=>{this._midnightTimerId=null,this._midnightArmedDay=null,this._onMidnight()},i.getTime()-e.getTime())}_onMidnight(){this.requestUpdate(),this._claimRollover()&&this.updateEvents("cache")}_claimRollover(){if(!this._wantsNowLine)return!0;const e=Qo(new Date);return this._nowLineDayKey!==e&&(this._nowLineDayKey=e,!0)}_stopMidnightTimer(){null!==this._midnightTimerId&&(clearTimeout(this._midnightTimerId),this._midnightTimerId=null)}get _wantsNowBoundary(){return"list"===this.effectiveView||"column"===this.effectiveView||"grid"===this.effectiveView&&!this._wantsNowLine}_syncNowBoundaryTimer(){const e=this.isConnected&&this._wantsNowBoundary&&"hidden"!==document.visibilityState,t=this._shownEvents,n=this.effectiveConfig,i=e&&null!==this._nowBoundaryTimerId&&this._nowBoundaryEvents===t&&this._nowBoundaryConfig===n&&null!==this._nowBoundaryAt&&this._nowBoundaryAt>Date.now()?this._nowBoundaryAt:e?function(e,t,n){let i=null;const r=new Date(t),a=new Date(r.getFullYear(),r.getMonth(),r.getDate()+1).getTime(),o=e=>{e>t&&(null===i||e<i)&&(i=e)};for(const t of e){if(t._isEmptyDay)continue;if(n&&!n.show_past_events&&t.start?.date&&t.end?.date){const e=ic(t._entityId,"allday_expires_at",n,t);if(Od(e)){const n=Zo(t.end.date);n.setDate(n.getDate()-1);const i=Zo(t.start.date),a=new Date(r.getFullYear(),r.getMonth(),r.getDate());i<a&&i.setTime(a.getTime());for(let t=0;t<2&&i<=n;t++,i.setDate(i.getDate()+1))o(zd(i,e).getTime())}continue}if(!t.start?.dateTime||!t.end?.dateTime)continue;const e=new Date(t.start.dateTime).getTime(),i=new Date(t.end.dateTime).getTime();(e<a&&i>a?[e,i,a]:[e,i]).forEach(o)}return i}(t,Date.now(),n):null;if(null===i)return void this._stopNowBoundaryTimer();this._stopNowBoundaryTimer(),this._nowBoundaryAt=i,this._nowBoundaryEvents=t,this._nowBoundaryConfig=n;const r=Math.min(i-Date.now()+1e3,Te);this._nowBoundaryTimerId=window.setTimeout(()=>{this._nowBoundaryTimerId=null,this._nowBoundaryAt=null,this.requestUpdate()},r)}_stopNowBoundaryTimer(){null!==this._nowBoundaryTimerId&&(clearTimeout(this._nowBoundaryTimerId),this._nowBoundaryTimerId=null),this._nowBoundaryAt=null,this._nowBoundaryEvents=null,this._nowBoundaryConfig=null}_tickNowLine(){const e=Qo(new Date);if(null!==this._nowLineDayKey&&e!==this._nowLineDayKey)return this._nowLineDayKey=e,Dt("Local day rolled over, refreshing events"),void this.updateEvents("cache");this._nowLineDayKey=e,this._clockRepainting=!0;try{this.requestUpdate()}finally{this._clockRepainting=!1}}_nextClockRepaint(e){if(this._wantsNowLine)return null;const t=new Date(e),n=new Date(t.getFullYear(),t.getMonth(),t.getDate()+1,0,0,1).getTime();return this._drawsMovingClockText(e,n)?Math.min(e+6e4,n):n}_drawsMovingClockText(e,t){const n=this.effectiveConfig,i=n.show_countdown,r=n.show_progress_bar;if(!i&&!r)return!1;const a="grid"!==this.effectiveView,o=n.show_past_events;return this._shownEvents.some(n=>{if(n._isEmptyDay)return!1;if(r&&(!a||!oc(n))&&null!==ac(n))return!0;if(!i||!n.start?.dateTime)return!1;const s=new Date(n.start.dateTime).getTime();return s>e&&s<t||o&&Uo(n,new Date(e))})}_syncClockTimer(){const e=this.isConnected&&"hidden"!==document.visibilityState?this._nextClockRepaint(Date.now()):null;null!==e?(this._stopClockTimer(),this._clockTimerAt=e,this._clockTimerId=window.setTimeout(()=>this._tickClock(),Math.max(0,e-Date.now()))):this._stopClockTimer()}_stopClockTimer(){null!==this._clockTimerId&&(clearTimeout(this._clockTimerId),this._clockTimerId=null),this._clockTimerAt=null}_syncVisibilityWatch(){const e=this.isConnected&&!this._isBeingEdited?this.config?.entities??[]:[];this._coreConditions.sync(this.hass,function(e){const t=new Map;for(const n of e)if("string"!=typeof n&&n.visibility)for(const{key:e,condition:i}of En(n.visibility,n.entity))t.set(e,i);return t}(e));const t=new Set(function(e){const t=new Set;for(const n of e)if("string"!=typeof n&&n.visibility)for(const e of Pn(n.visibility))t.add(e);return[...t]}(e));for(const[e,n]of this._visibilityQueries)t.has(e)||(n(),this._visibilityQueries.delete(e));for(const e of t)this._visibilityQueries.has(e)||this._visibilityQueries.set(e,this._listenToMediaQuery(e));const n=function(e,t,n){let i=null;for(const r of e){if("string"==typeof r||!r.visibility)continue;const e=Nn(r.visibility,t,n);null!==e&&(null===i||e<i)&&(i=e)}return i}(e,this.hass,Date.now());if(null===n)return void this._stopVisibilityTimer();if(null!==this._visibilityTimerId&&this._visibilityTimerAt===n)return;this._stopVisibilityTimer(),this._visibilityTimerAt=n;const i=Math.min(n-Date.now()+1e3,Te);this._visibilityTimerId=window.setTimeout(()=>{this._visibilityTimerId=null,this._visibilityTimerAt=null,Dt("Visibility: a time condition may have turned"),this.requestUpdate()},Math.max(0,i))}_listenToMediaQuery(e){let t;try{t=window.matchMedia?.(e)}catch{t=void 0}if(!t?.addEventListener)return()=>{};const n=()=>{Dt(`Visibility: ${e} now ${t?.matches?"matches":"does not match"}`),this.requestUpdate()};return t.addEventListener("change",n),()=>t?.removeEventListener("change",n)}_stopVisibilityTimer(){null!==this._visibilityTimerId&&(clearTimeout(this._visibilityTimerId),this._visibilityTimerId=null),this._visibilityTimerAt=null}_stopVisibilityWatch(){for(const e of this._visibilityQueries.values())e();this._visibilityQueries.clear(),this._stopVisibilityTimer(),this._coreConditions.stop()}_tickClock(){Dt(`Clock repaint due ${new Date(this._clockTimerAt??Date.now()).toISOString()}`),this._clockTimerId=null,this._clockTimerAt=null,this._clockRepainting=!0;try{this.requestUpdate()}finally{this._clockRepainting=!1}}requestUpdate(...e){void 0===e[0]&&(this._bareUpdatePending=!0,this._clockRepainting||(this._bareUpdateRequests=(this._bareUpdateRequests??0)+1)),super.requestUpdate(...e)}shouldUpdate(e){const t=this._bareUpdatePending;return this._bareUpdatePending=!1,e.has("hass")&&this.hass&&function(e){const t=Zl(e),n=t?Gl.get(t):void 0;if(!n)return;const i=Date.now();for(const t of n.subscriptions.values()){if("live"!==t.state&&"failed"!==t.state)continue;const r=e.states?.[t.entityId],a=t.seenState,o=t.seenAt;t.seenState=r,t.seenAt=i,void 0===a||r===a||t.stateTimer||r&&("unavailable"!==r.state||!0!==r.attributes?.restored)&&t.pushedAt>=o-2e3||(t.stateTimer=setTimeout(()=>{t.stateTimer=void 0,Tt(`No live update for ${t.entityId} after its state changed`),id(n,t),td(n,t.entityId)},3e4))}}(this.hass),!(!t&&1===e.size&&e.has("hass"))||function(e,t,n){if(!e||!t)return e!==t;const i=e,r=t;for(const e of Object.keys(r))if("states"!==e&&r[e]!==i[e])return!0;for(const e of Object.keys(i))if(!(e in r))return!0;if(e.states===t.states)return!1;for(const i of n)if(e.states?.[i]!==t.states?.[i])return!0;return!1}(e.get("hass"),this.hass,function(e,t){const n=function(e){const t=Dv.get(e);if(t)return t;const n=new Set,i=new Set,r=e=>{if("string"!=typeof e){if(null!==e&&"object"==typeof e&&!i.has(e)){i.add(e);for(const t of Array.isArray(e)?e:Object.values(e))r(t)}}else Mv.test(e)&&n.add(e)};return r(e),Dv.set(e,n),n}(e);let i=Cv.get(e);return void 0===i&&(i=function(e){let t=!1;for(const n of e)if("string"!=typeof n&&n.visibility&&(Ln(n.visibility,e=>{"location"===e.condition&&(t=!0)}),t))return!0;return!1}(e.entities??[]),Cv.set(e,i)),i?new Set([...n,...vn(t)]):n}(this.config,this.hass))}_stopWidthObserver(){this._resizeObserver?.disconnect(),this._resizeObserver=null,null!==this._widthSettleTimerId&&(clearTimeout(this._widthSettleTimerId),this._widthSettleTimerId=null),null!==this._gridScaleRaf&&(cancelAnimationFrame(this._gridScaleRaf),this._gridScaleRaf=null)}_scheduleGridScaleSync(){null===this._gridScaleRaf&&"undefined"!=typeof requestAnimationFrame&&(this._gridScaleRaf=requestAnimationFrame(()=>{this._gridScaleRaf=null,this._syncCascadeThreshold(),this._syncOverflowStrip()}))}_syncCascadeThreshold(){if(!this.isConnected||"grid"!==this.effectiveView||"cascade"!==wr(this.effectiveConfig,"overlap_layout"))return;const e=wl(wr(this.effectiveConfig,"start_time"),wr(this.effectiveConfig,"end_time")),t=this._cascadeThresholds,n=(i=function(e){const t=e.querySelector(".grid-day-body"),n=e.querySelector(".grid-event:not(.grid-event-overflow)");if(!t||!n||t.clientHeight<=0)return null;const i=document.createElement("div");i.className=Pp,i.setAttribute("aria-hidden","true"),i.style.cssText="position:absolute;visibility:hidden;pointer-events:none;inset-inline-start:0;top:0;width:0;font-size:var(--calendar-card-font-size-event);height:calc(2 * var(--calendar-card-grid-event-gap, 1px) + var(--calendar-card-grid-rule-width, 1px));",t.appendChild(i);try{const e=Number.parseFloat(getComputedStyle(i).fontSize),r=Number.parseFloat(getComputedStyle(i).height)||0,a=getComputedStyle(n),o=(Number.parseFloat(a.paddingTop)||0)+(Number.parseFloat(a.paddingBottom)||0);return{bodyHeightPx:t.clientHeight,fontPx:e,chromePx:r+o}}finally{i.remove()}}(this.renderRoot),r=e.endMin-e.startMin,a=function(e){const t=new Set([1]);for(const n of e.entities??[]){if("object"!=typeof n||null===n)continue;const e=n.text_scale;"number"==typeof e&&Number.isFinite(e)&&e>0&&t.add(e)}return[...t]}(this.effectiveConfig),o=t,new Map(a.map(e=>[e,Ep(i&&{...i,fontPx:i.fontPx*e},r,o.get(e))])));var i,r,a,o;const s=[...n].filter(([e,n])=>n!==Lp(t,e));this._cascadeThresholds=n,s.length>0&&(Dt(`Cascade threshold ${s.map(([e,n])=>`${1===e?"":`at ${e}x `}${Lp(t,e)} -> ${n}`).join(", ")} minutes`),this.requestUpdate())}_syncOverflowStrip(){if(!this.isConnected||"grid"!==this.effectiveView)return;const e=function(e,t){if(!(e&&e.dayWidthPx>0&&e.labelFontPx>0))return t;const n=28*Math.max(1,e.labelFontPx/12);return Number.isFinite(t)&&Math.abs(t/100*e.dayWidthPx-n)<1?t:n/e.dayWidthPx*100}(function(e){const t=e.querySelector(".grid-event-overflow-label"),n=t?.closest(".grid-day-body");return!t||!n||n.clientWidth<=0?null:{dayWidthPx:n.clientWidth,labelFontPx:Number.parseFloat(getComputedStyle(t).fontSize)}}(this.renderRoot),this._overflowStripPct);e!==this._overflowStripPct&&(Dt(`Overflow strip ${this._overflowStripPct} -> ${e}% of a day column`),this._overflowStripPct=e,this.requestUpdate())}_stopGridDisclosureObserver(){this._gridDisclosureObserver?.disconnect(),this._gridDisclosureObserver=null,this._gridDisclosureFontsCleanup?.(),this._gridDisclosureFontsCleanup=null,this._gridDisclosureMutations?.disconnect(),this._gridDisclosureMutations=null,this._gridDisclosureAssetsCleanup?.(),this._gridDisclosureAssetsCleanup=null,this._gridDisclosureTargets.clear(),this._gridDisclosureDirty.clear(),null!==this._gridDisclosureRaf&&(cancelAnimationFrame(this._gridDisclosureRaf),this._gridDisclosureRaf=null),null!==this._gridDisclosureReleaseRaf&&(cancelAnimationFrame(this._gridDisclosureReleaseRaf),this._gridDisclosureReleaseRaf=null),this._gridDisclosureSuppressGeneration+=1,this._gridDisclosureSuppressRo=!1}_applyGridDisclosureSafety(e){this._gridDisclosureSuppressGeneration+=1;const t=this._gridDisclosureSuppressGeneration;this._gridDisclosureSuppressRo=!0;const n=Array.from(e??this.renderRoot.querySelectorAll(".grid-event:not(.grid-event-overflow)")),i=n.map(ev).filter(e=>null!==e);i.forEach(Qg);for(const e of n)delete e.dataset.gridTitleGap;fv(i.map(e=>e.title));try{const e=n.flatMap(e=>{const t=e.querySelector(".grid-event-disclosure .event-content");if(!t)return[];const n=A_.map(e=>({lineProperty:e.lineProperty,element:t.querySelector(e.selector)})).filter(e=>null!==e.element);for(const e of n)e.element.classList.remove("grid-event-detail-clipped"),e.lineProperty&&e.element.style.removeProperty(e.lineProperty);return[{block:e,content:t,detailRows:n,withdrawn:[]}]}),t=this._applyGridTimeFit(n);(function(e){const t=e.flatMap(e=>{const t=Array.from(e.summary.children).filter(t=>t!==e.title),n=function(e){const t=e.querySelector(".title-words");for(const e of Array.from(t?.childNodes??[])){if(e.nodeType===Node.ELEMENT_NODE)return e===t?.firstElementChild&&e.matches(".title-word")?e:null;if(e.nodeType===Node.TEXT_NODE&&e.textContent?.trim())return null}return null}(e.title);return t.length&&n&&!e.summary.matches(".summary-scroll")?[{target:e,labels:t,word:n}]:[]});if(!t.length)return;const n=document.createElement("canvas").getContext("2d"),i=t.flatMap(({target:e,labels:t,word:i})=>{if(!mv(e)||!pv(e.summary))return[];const r=gv(e.block);let a=0;for(const e of t){const t=e.getClientRects();if(1!==t.length||t[0].width<=0)return[];const n=getComputedStyle(e);a+=t[0].width/r+hv(n.marginLeft)+hv(n.marginRight)}const o=sv(ov(i))/r,s=wv(e.summary)-a;return o>0&&o+bv(n,i)<=s+zg?[{target:e,run:a}]:[]});for(const{target:e,run:t}of i)e.summary.style.setProperty(Hg,`${t}px`)})(i),function(e){if(!e.length)return;const t=document.createElement("canvas").getContext("2d"),n=e.flatMap(e=>{const n=function(e,t){if(e.summary.matches(".summary-scroll")||!mv(e)||!pv(e.summary))return null;const n=function(e){const t=Array.from(e.summary.children).flatMap(t=>t===e.title?[]:[{kind:"label",node:t,rects:t.matches(".calendar-label")?ov(t).flatMap(e=>e.rects):Array.from(t.getClientRects())}]);for(const n of ov(e.title)){const i=n.node.parentElement?.closest(".title-word");i&&e.title.contains(i)?t[t.length-1]?.node!==i&&t.push({kind:"word",node:i,rects:[hg(i)]}):t.push({kind:"text",node:n.node,rects:n.rects})}return t}(e),i=function(e){const t=[];for(const n of e.filter(e=>e.height>0).sort((e,t)=>e.top-t.top)){const e=t[t.length-1];e&&xv(n)<=e.bottom+zg?(e.top=Math.min(e.top,n.top),e.bottom=Math.max(e.bottom,n.bottom)):t.push({top:n.top,bottom:n.bottom})}return t}(n.flatMap(e=>e.rects)),{visible:r}=_v(e);let a=0;for(;a<i.length&&uv(i[a],r);)a+=1;if(0===a||a===i.length)return null;const o=i[a-1],s=e=>xv(e)>=o.top-zg&&xv(e)<=o.bottom+zg,l=n.filter(e=>"label"!==e.kind);let d=l.length-1;for(;d>=0&&!l[d].rects.some(s);)d-=1;if(d<0)return null;const c={target:e,lines:a,word:null,room:0},u=gv(e.block),h=n.flatMap(e=>e.rects.filter(s)),m=wv(e.summary)*u-(Math.max(...h.map(e=>e.right))-Math.min(...h.map(e=>e.left))),p=e=>e.rects.filter(s).reduce((e,t)=>e+t.width,0),f=(e,t)=>{const n=e?.rects.filter(s)??[],i=t.rects.filter(s);return n.length&&i.length?function(e,t){return Math.max(0,t.left-e.right,e.left-t.right)}(n[n.length-1],i[0]):0};if("text"===l[d].kind){let n=m,i=d;for(;i>=0&&"text"===l[i].kind&&l[i].rects.some(s);i--)n+=p(l[i])+f(l[i-1],l[i]);const r=bv(t,l[d].node.parentElement??e.title);if(i<0||!l[i].rects.some(s)||n>=(r+1)*u)return c}let g=m;for(let n=d;n>=0&&l[n].rects.some(s);n-=1){const i=l[n];if(g+=p(i),"text"===i.kind){const r=bv(t,i.node.parentElement??e.title);if(g+f(l[n-1],i)>=(r+1)*u)return c}if("word"===i.kind&&l.slice(n+1).every(kv)){const n=i.node,r=sv(ov(n));if(r>0&&r+bv(t,n)*u<=g+zg)return{target:e,lines:a,word:n,room:g/u-zg}}g+=f(l[n-1],i)}return c}(e,t);return n?[n]:[]});for(const{target:e,lines:t,word:i,room:r}of n)i?(i.setAttribute(qg,""),i.style.setProperty(Wg,`${r}px`)):(e.summary.setAttribute(Ug,""),e.summary.style.setProperty(Bg,String(t)))}(i);const r=e.filter(({content:e})=>M_(e));for(const{block:e}of r)e.dataset.gridTitleGap="yielded";const a=e.flatMap(e=>{const n=t.get(e.block);return n&&M_(e.content)?[n]:[]});for(const{target:e,fallback:t}of a)Og(e,t);for(const{selector:t}of A_){const n=e.flatMap(e=>{if(!M_(e.content))return[];const n=e.detailRows.find(({element:e})=>e.matches(t));return n&&0!==n.element.getClientRects().length?[{transaction:e,row:n,lines:n.lineProperty?this._gridDetailLineCount(e.content,n.element):0}]:[]});for(const{row:e,lines:t}of n)e.lineProperty&&t>0&&e.element.style.setProperty(e.lineProperty,String(t));const i=n.filter(({transaction:e,lines:t})=>t<1||M_(e.content));for(const{transaction:e,row:t}of i)t.lineProperty&&t.element.style.removeProperty(t.lineProperty),t.element.classList.add("grid-event-detail-clipped"),e.withdrawn.push(t.element)}const o=e.filter(({content:e})=>M_(e));for(const{withdrawn:e}of o)e.forEach(e=>e.classList.remove("grid-event-detail-clipped"));const s=e.filter(({block:e})=>e.dataset.gridTitleGap),l=s.map(({content:e})=>!M_(e));for(const{block:e}of s)delete e.dataset.gridTitleGap;const d=s.map(({content:e},t)=>l[t]&&M_(e));s.forEach(({block:e},t)=>{d[t]&&(e.dataset.gridTitleGap="yielded")});const c=[],u=[];for(const e of i){if(!yv(e)){c.push(e);continue}const t=A_.flatMap(({selector:t})=>Array.from(e.disclosure.querySelectorAll(t)));t.length&&t.every(e=>0===e.getClientRects().length)&&u.push(e)}!function(e){const t=e.map(e=>({target:e,shift:$v(e)}));for(const{target:e,shift:n}of t)null!==n&&(e.row.style.setProperty("--calendar-card-grid-title-shift",`${n}px`),e.block.dataset.gridTitleFit="centered")}(u),function(e){if(!e.length)return;const t=document.createElement("canvas").getContext("2d");for(const t of e)t.block.dataset.gridTitleFit="measuring";try{const n=e.map(e=>Tv(e,t)).map(e=>{const t=function(e,t){if(![e,...t].every(e=>Number.isFinite(e)&&e>0)||!t.length)return null;const n=e*Math.max(...t.map(e=>Math.min(e,jg)/e));return n<=Math.min(e,jg)+1e-7?Math.min(e,jg):e-Math.floor(e-n+1e-7)}(e.font,e.textFonts);return{...e,minimum:t,candidate:Math.max(t??e.font,Yg(e.font,e.height,e.available)??Math.min(e.font,jg))}});for(const{target:e,candidate:t,font:i}of n)e.summary.style.setProperty("--calendar-card-grid-title-scale",String(i>0?t/i:1));const i=n.map(e=>({...e,result:Tv(e.target,t)})).map(e=>({...e,neighbor:Math.max(e.minimum??e.font,Jg(e.font,e.candidate,Sv(e.result)))}));for(const{target:e,neighbor:t,font:n}of i)e.summary.style.setProperty("--calendar-card-grid-title-scale",String(n>0?t/n:1));const r=i.map(e=>({...e,neighborResult:Tv(e.target,t)}));for(const{target:e,candidate:t,font:n,minimum:i,result:a,neighbor:o,neighborResult:s}of r){const r=Sv(s)&&(o>t||!Sv(a)),l=r?s:a;e.summary.style.setProperty("--calendar-card-grid-title-scale",String(n>0?(r?o:t)/n:1));const d=null!==i&&Sv(l)&&l.readable;e.row.style.setProperty("--calendar-card-grid-title-shift",`${l.shift}px`),e.block.dataset.gridTitleFit=d?"compact":"blank"}}finally{for(const t of e)"measuring"===t.block.dataset.gridTitleFit&&(t.block.dataset.gridTitleFit="blank")}}(c);const h=i.flatMap(e=>{const t=e.block.dataset.gridTitleFit,n="compact"===t||"compact"===e.previousMode||"blank"===e.previousMode;return"blank"!==t&&n&&e.title.classList.contains("title-scrollable")?[e.title]:[]});h.length&&this._measureTitleScroll(h),this._titleMotion?.refresh()}finally{null!==this._gridDisclosureReleaseRaf&&cancelAnimationFrame(this._gridDisclosureReleaseRaf),this._gridDisclosureReleaseRaf=requestAnimationFrame(()=>{this._gridDisclosureReleaseRaf=requestAnimationFrame(()=>{this._gridDisclosureReleaseRaf=null,t===this._gridDisclosureSuppressGeneration&&(this._gridDisclosureSuppressRo=!1)})})}}_applyGridTimeFit(e){const t=e.map(e=>({block:e,target:kg(e)})).filter(e=>null!==e.target),n=new Map;if(0===t.length)return n;const i=t.map(({target:e})=>e);i.forEach(Tg);const r=i.map(Sg);i.forEach(Mg);const a=i.map((e,t)=>function(e,t,n=0){const i=$g(e);return{available:t,full:hg(e.time).width,icon:e.icon?Lg(e.icon):0,end:e.end?Lg(e.end):0,duration:e.duration?Lg(e.duration):0,wrapped:n,words:i,separator:e.countdown?Lg(e.countdown)-i:0}}(e,r[t]));i.forEach(Dg);const o=i.map(Cg);i.forEach(Ag);const s=a.map((e,t)=>({...e,wrapped:o[t]})),l=s.map(Pg);return t.forEach(({block:e,target:t},i)=>{Eg(t,l[i]);const r=function(e,t){if(!1===t.countdown){if(!t.wrap)return null;const n=Ng({...Fg(e),wrapped:0});return{...n.time?n:bg,icon:!1,countdown:!1}}if(!t.time)return null;const n=Ng({...e,wrapped:0,words:0});return t.wrap?n.time?n:Ig(e)?Rg(e,t,!0):bg:n.time===t.time&&n.icon===t.icon&&n.end===t.end&&n.wrap===t.wrap&&n.duration===t.duration?null:n.time?n:Rg(e,t,!0)}(s[i],l[i]);r&&n.set(e,{target:t,fallback:r})}),n}_gridDetailLineCount(e,t){const n=t.querySelector("span")??t,i=D_(getComputedStyle(n)),r=C_(e.scrollHeight-e.clientHeight,n.getBoundingClientRect().height,i);return Math.max(0,r)}_scheduleGridDisclosureSafety(e=!0){e&&this._gridDisclosureTargets.forEach(e=>this._gridDisclosureDirty.add(e)),null===this._gridDisclosureRaf&&(this._gridDisclosureRaf=requestAnimationFrame(()=>{if(this._gridDisclosureRaf=null,!this.isConnected||"grid"!==this.effectiveView)return;const e=Array.from(this._gridDisclosureDirty).filter(e=>e.isConnected);this._gridDisclosureDirty.clear(),e.length&&this._applyGridDisclosureSafety(e)}))}_syncGridDisclosureSafety(e=!0){if(!this.isConnected||"grid"!==this.effectiveView||"undefined"==typeof ResizeObserver)return void this._stopGridDisclosureObserver();if(!e&&this._gridDisclosureObserver)return;const t=this.renderRoot.querySelectorAll(".grid-event:not(.grid-event-overflow)");t.length?(this._gridDisclosureObserver||(this._gridDisclosureObserver=new ResizeObserver(e=>{let t=!1;for(const n of e){const e=this._gridDisclosureObservedSizes.get(n.target),i={width:n.contentRect.width,height:n.contentRect.height};if(this._gridDisclosureObservedSizes.set(n.target,i),void 0===e||e.width!==i.width||e.height!==i.height){const e=this._gridDisclosureTargets.get(n.target);e&&this._gridDisclosureDirty.add(e),t=!0}}this._gridDisclosureSuppressRo&&!t||t&&this._scheduleGridDisclosureSafety(!1)}),this._watchGridDisclosureFonts()),this._observeGridDisclosureTargets(t),this._scheduleGridDisclosureSafety()):this._stopGridDisclosureObserver()}_observeGridDisclosureTargets(e){const t=new Set(e);for(const[e,n]of this._gridDisclosureTargets)t.has(n)&&n.contains(e)||(this._gridDisclosureObserver?.unobserve(e),this._gridDisclosureTargets.delete(e));t.forEach(e=>{for(const t of[e,...e.querySelectorAll(".summary, .event-title")])this._gridDisclosureTargets.has(t)||(this._gridDisclosureTargets.set(t,e),this._gridDisclosureObserver?.observe(t))})}_reconcileGridStructure(){this.isConnected&&"grid"===this.effectiveView&&this._gridDisclosureObserver&&(this._observeGridDisclosureTargets(this.renderRoot.querySelectorAll(".grid-event:not(.grid-event-overflow)")),this._scheduleGridDisclosureSafety(!0),this._scheduleGridScaleSync())}_watchGridDisclosureFonts(){const e=e=>{if(!(e.target instanceof HTMLImageElement&&e.target.matches(".label-image")))return;const t=e.target.closest(".grid-event");t&&(this._gridDisclosureDirty.add(t),this._scheduleGridDisclosureSafety(!1))};this.renderRoot.addEventListener("load",e,!0),this.renderRoot.addEventListener("error",e,!0),this._gridDisclosureAssetsCleanup=()=>{this.renderRoot.removeEventListener("load",e,!0),this.renderRoot.removeEventListener("error",e,!0)};const t=document.fonts;if(t){let e=!0;const n=()=>{e&&this._scheduleGridDisclosureSafety()};t.ready.then(n),"function"==typeof t.addEventListener&&t.addEventListener("loadingdone",n),this._gridDisclosureFontsCleanup=()=>{e=!1,"function"==typeof t.removeEventListener&&t.removeEventListener("loadingdone",n)}}"undefined"!=typeof MutationObserver&&(this._gridDisclosureMutations=new MutationObserver(e=>{let t=!1,n=!1;for(const i of e)if("attributes"===i.type){if(w_(i,this))continue;t=!0}else{const e=i.target instanceof Element?i.target:i.target.parentElement,r=e?.closest(".grid-event:not(.grid-event-overflow)");r?this._gridDisclosureDirty.add(r):e?.closest("style")?t=!0:x_(i)&&(n=!0)}n&&this._reconcileGridStructure(),(t||this._gridDisclosureDirty.size)&&this._scheduleGridDisclosureSafety(t)}),this._gridDisclosureMutations.observe(this.renderRoot,{childList:!0,characterData:!0,subtree:!0}),y_(this._gridDisclosureMutations,this))}_homeWeekMoved(e){const t=e.get("hass"),n=this.config?.start_date;if(!t||!this.hass||null!==this._pageRequested)return!1;if("string"!=typeof n||!We(n))return!1;const i=this.config.first_day_of_week;return vs(i,t.locale)!==vs(i,this.hass.locale)}_gridDisclosureChanged(e){if(this._visibilityChanged)return!0;if(0===e.size)return this._bareUpdateRequests!==this._bareUpdateRequestsSeen;if(1!==e.size||!e.has("hass"))return!0;const t=e.get("hass");return!t||!this.hass||t.locale?.language!==this.hass.locale?.language||t.locale?.time_format!==this.hass.locale?.time_format||t.locale?.first_weekday!==this.hass.locale?.first_weekday||this.config.entities.some(e=>{const n="string"==typeof e?e:e.entity,i="string"==typeof e?void 0:e.label;return t.states[n]!==this.hass?.states[n]||i?.startsWith("person.")&&t.states[i]!==this.hass?.states[i]})}_handleWidthMeasured(e){const t=null===this._measuredWidthPx&&null!==this._viewChoice?ga(this.requestedView,this.config,e):(n=this.requestedView,i=this.config,r=this._measuredWidthPx,a=e,o={view:this._effectiveView,columns:this._columnCount},pa(n,i,a,null===r?null:o));var n,i,r,a,o;const s=this._offeredViewsKey(),l=this._shownColumnCount,d=this._swipeAvailable;this._measuredWidthPx=e,t.view!==this._effectiveView||t.columns!==this._columnCount?(Dt(`Layout changed from ${this._effectiveView}/${this._columnCount} to ${t.view}/${t.columns} at ${Math.round(e)}px`),this._effectiveView=t.view,this._columnCount=t.columns,this.requestUpdate()):this._offeredViewsKey()===s&&this._shownColumnCount===l&&this._swipeAvailable===d||this.requestUpdate()}willUpdate(e){this._refreshVisibility(),pf(this.renderRoot,"legend")&&!this._legendMenuMayStayOpen()&&mf(this.renderRoot,"legend"),pf(this.renderRoot,"overflow")&&!this._startMenuMayStayOpen()&&mf(this.renderRoot,"overflow"),this._search?.isOpen&&(this._isBeingEdited||this.hidden||!this._searchButton())&&this._search.close(),this._focusBeforeFold=this._focusedStartControl(),this._tapFocusBefore=this._focusedTapTarget(),(e.has("hass")||e.has("config")&&e.get("config")?.language!==this.config.language)&&(this._language=Ge(this.config.language,this.hass?.locale)),(e.has("hass")||e.has("config"))&&this._loadIntlLocaleData()}_loadIntlLocaleData(){const e=this._language,t=dr.some(e=>Vr(this.config,e).show_duration),n=t?`${e}:durations`:e;if(n===this._intlLanguage)return;this._intlLanguage=n;const i=["DateTimeFormat","RelativeTimeFormat"];t&&i.push("NumberFormat","ListFormat"),function(e,t,n){const i=[];for(const r of t){const t=sg(r);if(!t||lg(t,e))continue;const a=`${r}:${e.toLowerCase()}`;let o=og.get(a);o||(o=dg(r,t,e),og.set(a,o),o.then(e=>{"unreachable"===e&&og.delete(a)})),i.push(o.then(e=>"added"===e&&(n?.(),!0)))}0!==i.length&&Promise.all(i).then(e=>e.includes(!0))}(e,i,()=>{this.requestUpdate(),this._search?.wordsChanged()})}updated(e){this._syncNewShown(),this._keepTapFocus(),this._visibilityChanged&&this._search?.visibilityChanged(),(e.has("editMode")||e.has("preview"))&&this._isBeingEdited&&null!==this._pageRequested&&(this._requestPage(null),this._loadPage()),this._syncNowLineTimer(),this._syncMidnightTimer(),this._syncReplacedRefresh(),this._syncNowBoundaryTimer(),this._syncClockTimer(),this._syncVisibilityWatch(),this._syncSwipeArrival();const t=this._gridDisclosureChanged(e);this._bareUpdateRequestsSeen=this._bareUpdateRequests,this._syncGridDisclosureSafety(t),t&&(this._syncCascadeThreshold(),this._syncOverflowStrip());const n=e.has("hass")&&this.hass&&!e.get("hass");n&&this._appearLoadPending?this.updateEvents("navigate"):!this._appearLoadPending&&this._homeWeekMoved(e)&&this.updateEvents("cache");const i=e.get("config"),r=e.has("config")&&this.config?.weather?.entity!==i?.weather?.entity,a=r||e.has("config")&&this.config?.weather?.position!==i?.weather?.position;r&&(this.weatherForecasts={daily:{},hourly:{}},this._weatherSetupVersion++,this._cleanupWeatherSubscriptions()),(n||a)&&this._scheduleWeatherSetup(),this.config?.weather?.entity&&function(e,t,n){const i=Tm(e,t);if(!e||!i)return;if(Sm.has(i))return;const r=Mm.get(i);if(r)return void r.push(n);const a=function(e,t){if("function"==typeof e.callWS)return e.callWS(t);const n=e.connection;return n&&"function"==typeof n.sendMessagePromise?n.sendMessagePromise(t):void 0}(e,{type:"frontend/get_translations",language:i,category:"entity_component",integration:"weather"});if(!a)return void Am(i,"this instance exposes no WebSocket command API");const o=[n];Mm.set(i,o),a.then(e=>{const t=function(e){const t=e?.resources;if(!t)return{};const n={};for(const[e,i]of Object.entries(t))e.startsWith("component.weather.entity_component._.state.")&&"string"==typeof i&&i&&(n[e.slice(43)]=i);return n}(e);if(0!==Object.keys(t).length){Sm.set(i,t),function(e,t){const n=$m.filter(e=>!t[e]);0!==n.length&&Dt(`Home Assistant returned ${Object.keys(t).length} weather conditions for ${e}, without ${n.join(", ")}; those will follow the instance's language instead`)}(i,t),Dt(`Loaded ${Object.keys(t).length} weather conditions in ${i}`);for(const e of o)e()}else Am(i,"Home Assistant returned no condition strings")}).catch(e=>{Am(i,String(e))}).finally(()=>{Mm.delete(i)})}(this.hass,this.config.language,()=>this.requestUpdate()),this._syncEntityColors(),(e.has("hass")||e.has("config"))&&this._updateTitleSubscription(),this._applyVisibility(),this._syncTitleScroll(),this._syncTitleFits(),this._syncToolbarLabelFit(),this._syncMonthFit(),this._syncHeadingMiddle(),this._syncLegendFit(!1),this._handFocusToMenu(),this._syncStartFoldFit(),this._syncSearchRing(),function(e){for(const t of e.querySelectorAll(".legend-chip-label")){const e=t.closest(".legend-chip");e&&(t.scrollWidth>t.clientWidth+.5?e.setAttribute("title",t.textContent??""):e.removeAttribute("title"))}}(this.renderRoot),function(e){for(const[t,n]of[...of])t.isConnected&&n.opener.isConnected?e.contains(t)&&(n.placedAt=sf(t,n.opener),lf(t,n.parts)):df(t,"gone")}(this.renderRoot),function(e){for(const t of e.querySelectorAll(".view-switcher-segment")){const[e,n]=t.classList.contains("selected")?t.querySelectorAll(":scope > .view-switcher-probe"):[];af(t,"--calendar-card-toolbar-selected-surface",e&&n?rf(e,n,t):void 0)}}(this.renderRoot)}_updateTitleSubscription(){if(this.isConnected)return Ev(this.config.title)?(this._titleSubscription||(this._titleSubscription=new Lv({onResult:e=>{this.renderedTitle=e},onError:()=>{void 0===this.renderedTitle&&(this.renderedTitle="")}})),void this._titleSubscription.update(this.hass,this.config.title)):(this._titleSubscription&&(this._titleSubscription.destroy(),this._titleSubscription=void 0),void(this.renderedTitle=void 0))}_applyVisibility(){const e=!(this.isInitialLoad||this.safeHass&&0!==this.config.entities.length),t=!(!0!==this.config.hide_when_empty||null!==this._pageRequested||null!==this._pageShown||this._legendHidesAShownCalendar||this.preview||this.editMode||e||0!==this._shownFailures.length||this._anyReachableViewHasEvents());this.hidden!==t&&(Dt(`hide_when_empty: ${t?"hiding":"revealing"} card`),t&&(mf(this.renderRoot),this._search?.close()),this.hidden=t,this.style.display=t?"none":"",this.dispatchEvent(new CustomEvent("card-visibility-changed",{detail:{value:!t},bubbles:!0,composed:!0})))}_syncTitleScroll(){if(!this.isConnected||!gt(this.effectiveConfig,this.effectiveView))return void this._stopTitleScrollObserver();const e=this.renderRoot.querySelectorAll(".event-title.title-scrollable"),t=Array.from(e).filter(e=>e.querySelector(".event-title-scroll"));if(e.forEach(e=>{t.includes(e)||b_(e)}),this._stopTitleScrollObserver(0===e.length),!e.length)return;t.length||this._stopTitleMotion(),t.length&&!this._titleMotion&&"undefined"!=typeof CSS&&CSS.supports("animation-timing-function","linear(0, 1, 0)")&&"undefined"!=typeof CSSAnimation&&"undefined"!=typeof Animation&&"undefined"!=typeof AnimationEffect&&"function"==typeof AnimationEffect.prototype.getComputedTiming&&"function"==typeof Object.getOwnPropertyDescriptor(Animation.prototype,"startTime")?.set&&"function"==typeof Element.prototype.getAnimations&&"undefined"!=typeof IntersectionObserver&&"function"==typeof matchMedia&&"function"==typeof matchMedia("(prefers-reduced-motion: reduce)").addEventListener&&void 0!==document.timeline&&(this._titleMotion=new Qv(this,()=>this._scheduleTitleScrollMeasure())),this._titleMotion?.sync(t),"undefined"!=typeof ResizeObserver&&(this._titleScrollObserver=new ResizeObserver(()=>this._scheduleTitleScrollMeasure()),this._titleScrollObserver.observe(this),e.forEach(e=>{this._titleScrollObserver?.observe(e);const t=e.parentElement;t&&(this._titleScrollObserver?.observe(t),Array.from(t.children).forEach(e=>this._titleScrollObserver?.observe(e)))})),t.length&&!this._titleMotion&&"undefined"!=typeof IntersectionObserver&&(this._titleScrollIntersectionObserver=new IntersectionObserver(e=>{const t=e.every(e=>!e.isIntersecting);this.classList.toggle("calendar-card-title-scroll-paused",t)}),this._titleScrollIntersectionObserver.observe(this)),"undefined"!=typeof MutationObserver&&(this._titleScrollMutations=new MutationObserver(e=>{e.some(e=>!w_(e,this))&&this._scheduleTitleScrollMeasure()}),this._titleScrollMutations.observe(this.renderRoot,{childList:!0,characterData:!0,subtree:!0}),y_(this._titleScrollMutations,this));const n=document.fonts;if(n){let e=!0;const t=()=>{e&&this._scheduleTitleScrollMeasure()};n.ready.then(t),"function"==typeof n.addEventListener&&n.addEventListener("loadingdone",t),this._titleScrollFontsCleanup=()=>{e=!1,"function"==typeof n.removeEventListener&&n.removeEventListener("loadingdone",t)}}this._scheduleTitleScrollMeasure()}_scheduleTitleScrollMeasure(){null!==this._titleScrollRaf&&cancelAnimationFrame(this._titleScrollRaf),this._titleScrollRaf=requestAnimationFrame(()=>{this._titleScrollRaf=null,this.isConnected&&gt(this.effectiveConfig,this.effectiveView)&&this._measureTitleScroll()})}_measureTitleScroll(e=this.renderRoot.querySelectorAll(".event-title.title-scrollable")){const t=Array.from(e);fv(t);const n=t.flatMap(e=>{const t=e.closest(".grid-event")?.dataset.gridTitleFit;if("blank"===t||"measuring"===t)return[];const n=e.querySelector(".event-title-scroll");return n?[{title:e,content:n}]:[]}),i=this._titleMotion?.enhanced?n.filter(({content:e})=>"inline"===getComputedStyle(e).display).map(({content:e})=>({content:e,display:e.style.getPropertyValue("display"),priority:e.style.getPropertyPriority("display")})):[];for(const{content:e}of i)e.style.setProperty("display","inline-block","important");let r;try{r=n.map(({title:e,content:t})=>{const n=getComputedStyle(e);return{title:e,content:t,distance:t.offsetWidth-mg(e),direction:"rtl"===n.direction?1:-1,signature:JSON.stringify([t.textContent,n.font,n.letterSpacing,n.wordSpacing,n.textTransform])}})}finally{for(const{content:e,display:t,priority:n}of i)t?e.style.setProperty("display",t,n):e.style.removeProperty("display")}r.forEach(({title:e,distance:t,direction:n})=>{if(t>1&&!e.classList.contains("empty-day-title")){const i=Math.max(4,t/(45*.7));e.style.setProperty("--calendar-card-title-scroll-distance",`${t}px`),e.style.setProperty("--calendar-card-title-scroll-direction",String(n)),e.style.setProperty("--calendar-card-title-scroll-duration",`${i.toFixed(2)}s`),e.classList.add("title-overflowing")}else b_(e)}),this._titleMotion?.measure(r)}_stopTitleMotion(){this._titleMotion?.dispose(),this._titleMotion=null,this.classList.remove("calendar-card-title-scroll-paused")}_stopTitleScrollObserver(e=!0){this._titleScrollObserver?.disconnect(),this._titleScrollObserver=null,this._titleScrollIntersectionObserver?.disconnect(),this._titleScrollIntersectionObserver=null,this._titleScrollMutations?.disconnect(),this._titleScrollMutations=null,this._titleScrollFontsCleanup?.(),this._titleScrollFontsCleanup=null,null!==this._titleScrollRaf&&(cancelAnimationFrame(this._titleScrollRaf),this._titleScrollRaf=null),e&&(this._stopTitleMotion(),this.renderRoot.querySelectorAll("[data-scroll-labels]").forEach(e=>{e.removeAttribute("data-scroll-labels")}))}_syncTitleFits(){this._stopTitleFits();const e=this.isConnected?Array.from(this.renderRoot.querySelectorAll(".summary-row.title-wrap")):[],t=this.isConnected?this._cappedTitles():[];if(!e.length&&!t.length)return this.renderRoot.querySelectorAll(`[${Pv}]`).forEach(zv),void this.renderRoot.querySelectorAll(`[${Hv}]`).forEach(e=>e.removeAttribute(Hv));if(this._measureTitleFits(),"undefined"!=typeof ResizeObserver){const n=new ResizeObserver(()=>this._scheduleTitleFits());this._titleFitObserver=n,n.observe(this),e.forEach(e=>{e.querySelectorAll(":scope > .summary, :scope > .title-aside").forEach(e=>n.observe(e))}),t.forEach(e=>n.observe(e))}"undefined"!=typeof MutationObserver&&(this._titleFitMutations=new MutationObserver(e=>{e.some(e=>!w_(e,this))&&this._scheduleTitleFits()}),y_(this._titleFitMutations,this));const n=document.fonts;if(n){let e=!0;const t=()=>{e&&this._scheduleTitleFits()};n.ready.then(t),"function"==typeof n.addEventListener&&n.addEventListener("loadingdone",t),this._titleFitFontsCleanup=()=>{e=!1,"function"==typeof n.removeEventListener&&n.removeEventListener("loadingdone",t)}}}_measureTitleFits(){const e=this.effectiveConfig;this.renderRoot.querySelectorAll(`[${Hv}]`).forEach(e=>e.removeAttribute(Hv)),function(e,t){const n=Array.from(e);n.forEach(Ov);const i=t>=2,r=[],a=n.flatMap(e=>{const t=function(e){const t=e.querySelector(":scope > .summary"),n=e.querySelector(":scope > .title-aside");if(!t||!n||!t.offsetWidth)return null;const i=t.getBoundingClientRect().width;return{row:e,summary:t,aside:n,direction:"rtl"===getComputedStyle(e).direction?"rtl":"ltr",scale:Math.abs(i-t.offsetWidth)<1?1:i/t.offsetWidth||1}}(e);if(!t)return r.push(e),[];const{summary:n,aside:i,scale:a}=t,o=getComputedStyle(n),s=i.getBoundingClientRect(),l=parseFloat(getComputedStyle(e).getPropertyValue(Fv)),d=n.clientWidth-jv(o.getPropertyValue("padding-inline-start"))-jv(o.getPropertyValue("padding-inline-end")),c=i.querySelector(":scope > .title-strut")?.getBoundingClientRect(),u=!!c&&(c.top-s.top)/a>.5;return[{...t,lineHeight:jv(o.lineHeight),pad:jv(o.paddingBottom),width:u?d:s.width/a,height:s.height/a,avail:d,gap:Number.isFinite(l)?l:12}]});r.forEach(zv);for(const{row:e,direction:t,width:n,height:i,pad:r}of a)e.setAttribute(Pv,t),e.style.setProperty(Iv.width,`${n}px`),e.style.setProperty(Iv.height,`${i}px`),e.style.setProperty(Iv.pad,`${r}px`);if(!i)return;const o=a.flatMap(e=>{if(!(e.lineHeight>0))return[];const n=function(e,t){const{summary:n,scale:i,lineHeight:r,pad:a,width:o,height:s,avail:l,gap:d}=e,c=getComputedStyle(n),u=n.getBoundingClientRect(),h=u.top/i+jv(c.paddingTop),m=u.bottom/i-a-h,p=(t+.5)*r;if(m<=p)return null;const f=n.querySelector(":scope > .title-room")?.getBoundingClientRect();if(!f)return null;const g=Array.from(n.querySelector(".event-title")?.getClientRects()??[]).filter(e=>e.width>0),v=g[g.length-1],_=v&&f.top>=(v.top+v.bottom)/2?f.top/i-h:m;return s>(t-.5)*r||l-o-d<2*r?_>p?"below":null:""}(e,t);return null===n?[]:[{...e,cut:n}]});for(const{row:e,cut:t,height:n,pad:i}of o)e.setAttribute(Nv,t),"below"===t&&e.style.setProperty(Iv.below,`${n+i}px`);const s=o.filter(({cut:e})=>""===e).map(({row:e,summary:t,scale:n,lineHeight:i})=>{const r=t.getBoundingClientRect().top/n+jv(getComputedStyle(t).paddingTop),a=e.getBoundingClientRect().bottom/n-r;return{row:e,start:a-i/2,end:a}});for(const{row:e,start:t,end:n}of s)e.style.setProperty(Iv.start,`${t}px`),e.style.setProperty(Iv.end,`${n}px`)}(this.renderRoot.querySelectorAll(".summary-row.title-wrap"),function(e,t){return"grid"!==t&&"title"===pt(e.time_position)&&"cap"===ft(e)}(e,this.effectiveView)&&Number(e.title_max_lines)||0),function(e){const t=Array.from(e);if(t.forEach(e=>e.removeAttribute(Hv)),!t.length)return;const n=document.createElement("canvas").getContext("2d");t.filter(e=>function(e,t){const n=e.querySelector(".event-title");if(!n)return!1;const i=function(e,t){for(const n of[t,e,e.parentElement]){if(!(n instanceof HTMLElement))continue;const e=getComputedStyle(n);if(/^\d+$/.test(e.webkitLineClamp)&&"visible"!==e.overflowY&&n.scrollHeight>n.clientHeight+1)return n}return null}(e,n);if(!i)return!1;const r=getComputedStyle(i),a=i.getBoundingClientRect(),o=i.offsetWidth>0&&Math.abs(a.width-i.offsetWidth)>=1?a.width/i.offsetWidth:1,s=a.bottom-jv(r.paddingBottom)*o,l=[],d=n.ownerDocument,c=d.createTreeWalker(n,NodeFilter.SHOW_TEXT),u=d.createRange();for(let e=c.nextNode();e;e=c.nextNode())for(let t=0;t<e.length;t+=1)u.setStart(e,t),u.setEnd(e,t+1),l.push({text:e.data[t],rect:u.getBoundingClientRect()});u.setStart(d,0),u.collapse(!0);const h=i===e.parentElement?e:i,m=getComputedStyle(h),p=(jv(m.lineHeight)||jv(r.lineHeight))*o,f=l.findIndex(({rect:e})=>e.height>0&&e.bottom>s+p/4);if(f<=0)return!1;const g=l[f-1].text,v=l[f].text;if(!Wv.test(g)||!Wv.test(v))return!1;const _=l.slice(0,f).filter(({rect:e})=>{const t=(e.top+e.bottom)/2;return e.height>0&&t>s-p&&t<=s});if(!_.length||!t)return!0;const y=getComputedStyle(n);t.font=y.font||`${y.fontWeight} ${y.fontSize} ${y.fontFamily}`;const w=t.measureText(`${_.map(({text:e})=>e).join("")}‐…`).width*o,b=h.getBoundingClientRect(),x=i===e.parentElement?(jv(i.style.getPropertyValue(Iv.width))+(jv(getComputedStyle(i).getPropertyValue(Fv))||0))*o:0,k=.2*o;return"rtl"===m.direction?_[0].rect.right-w>=b.left+jv(m.paddingLeft)*o+x-k:_[0].rect.left+w<=b.right-jv(m.paddingRight)*o-x+k}(e,n)).forEach(e=>e.setAttribute(Hv,""))}(this._cappedTitles())}_cappedTitles(){return e=this.effectiveConfig,"grid"!==(t=this.effectiveView)&&Number(e.title_max_lines)>0&&!gt(e,t)?Array.from(this.renderRoot.querySelectorAll(".summary:not(.summary-scroll)")):[];var e,t}_scheduleTitleFits(){null!==this._titleFitRaf&&cancelAnimationFrame(this._titleFitRaf),this._titleFitRaf=requestAnimationFrame(()=>{this._titleFitRaf=null,this.isConnected&&this._measureTitleFits()})}_stopTitleFits(){this._titleFitObserver?.disconnect(),this._titleFitObserver=null,this._titleFitMutations?.disconnect(),this._titleFitMutations=null,this._titleFitFontsCleanup?.(),this._titleFitFontsCleanup=null,null!==this._titleFitRaf&&(cancelAnimationFrame(this._titleFitRaf),this._titleFitRaf=null)}getCustomStyles(){return up(this.effectiveConfig)}_syncEntityColors(){var e,t,n;this.isConnected&&(Ri((e=this.config).accent_color)||(e.entities??[]).some(e=>"object"==typeof e&&null!==e&&Ri(e.accent_color))?(t=this.hass,n=this._onEntityColorsChanged,t&&(Zi.add(n),function(e){const t=e.connection;if(Bi||!t||"function"!=typeof t.subscribeEvents)return;Bi=()=>{};const n=++Gi;t.subscribeEvents(()=>{if(n!==Gi)return;const t=tr(e);t&&t.then(e=>{e&&er()})},"entity_registry_updated").then(e=>{n===Gi?Bi=e:e()}).catch(()=>{n===Gi&&(Bi=void 0)})}(t),function(e){const t=e.connection;t&&"function"==typeof t.addEventListener&&!Xi.has(t)&&(Xi.add(t),t.addEventListener("ready",()=>{qi?.hass.connection===t&&rr(!0)}))}(t),qi?qi.hass=t:Vi||Wi||nr(t))):ar(this._onEntityColorsChanged))}startRefreshTimer(){this._scheduleRefresh(Date.now()+this._refreshIntervalMs())}_scheduleRefresh(e){if(this._refreshTimerId&&(clearTimeout(this._refreshTimerId),this._refreshTimerId=void 0),!this.isConnected)return;const t=Math.min(Math.max(e-Date.now(),1e3),2**31-1);this._refreshTimerId=window.setTimeout(()=>{this._refreshTimerId=void 0,this.updateEvents("cache")},t),Dt(`Scheduled next refresh in ${Math.round(t/1e3)}s`)}_syncLive(){null!==this._liveSyncTimer&&(clearTimeout(this._liveSyncTimer),this._liveSyncTimer=null);const e=this.safeHass;if(!this.isConnected||!e||!this.config.entities?.length||this.isLoading)return;this._liveConnection!==e.connection&&(this._liveUnlisten?.(),this._liveUnlisten=function(e,t){const n=Zl(e);if(!n)return()=>{};const i=Ql(n);return i.listeners.add(t),()=>i.listeners.delete(t)}(e,this._onLiveChange),this._liveConnection=e.connection);const t=this._pageShown,n=this._loadConfigForPage(t),i=Sd(e,n),r=i.entityIds.flatMap(t=>od(e,t,i.window)??[]);for(const e of this._liveReleases)e(0);this._liveReleases=r,this._liveCalendars=new Set(i.entityIds);const a=null===t?"persistent":"page",o=r.length>0&&function(e,t,n){return t.length>0&&t.every(t=>"live"===sd(e,t,n)?.state)}(e,i.entityIds,i.window);if(0===r.length||!o){if(!this._refreshTimerId){const i=xd(e,n,this._instanceIdForPage(t),a);this._scheduleRefresh(i?.nextAttemptAt??Date.now()+this._refreshIntervalMs())}if(0===r.length)return}const s=function(e,t,n,i){const{window:r}=bd(e,t,""),a=[];for(const o of Md(t.entities)){const t=sd(e,o,r);if("live"!==t?.state||t.reconnecting)continue;const s=n.filter(e=>e._entityId===o);(i.includes(o)||hd(s)!==t.fingerprint)&&a.push(`${o}@${t.version}`)}return a}(e,n,this._drawnRaw,this._failedEntities).join();if(s&&s!==this._liveDriftLoaded)return Mt(`Live update: ${s}`),this._liveDriftLoaded=s,void this.updateEvents("live");o&&this._refreshTimerId&&(Dt("Every calendar shown is live; not polling"),clearTimeout(this._refreshTimerId),this._refreshTimerId=void 0)}_releaseLive(){null!==this._liveSyncTimer&&(clearTimeout(this._liveSyncTimer),this._liveSyncTimer=null);for(const e of this._liveReleases)e(5e3);this._liveReleases=[],this._liveCalendars=new Set,this._liveUnlisten?.(),this._liveUnlisten=null,this._liveConnection=null}_refreshIntervalMs(){return mc(this.config)}_scheduleWeatherSetup(){this._weatherSetupPending||(this._weatherSetupPending=!0,queueMicrotask(()=>{this._weatherSetupPending=!1,this.isConnected&&this._setupWeatherSubscriptions()}))}async _setupWeatherSubscriptions(){const e=++this._weatherSetupVersion;if(this._cleanupWeatherSubscriptions(),!this.config?.weather?.entity||!this.hass)return;const t=function(e){if(!e||!e.entity)return[];const t=Em(e);return"none"===t?[]:"date"===t?["daily"]:["daily","hourly"]}(this.config.weather);for(const n of t){if(this._weatherSetupVersion!==e)return;const t=await Im(this.hass,this.config,n,t=>{this._weatherSetupVersion===e&&(this.weatherForecasts={...this.weatherForecasts,[n]:t},this.requestUpdate())});if(this._weatherSetupVersion!==e)return void(t&&t());t&&this._weatherUnsubscribers.push(t)}}_cleanupWeatherSubscriptions(){const e=this._weatherUnsubscribers.length;e>0&&Dt(`Unsubscribing ${e} weather forecast subscription(s)`),this._weatherUnsubscribers.forEach(e=>{try{"function"==typeof e&&e()}catch(e){Tt("Failed to unsubscribe weather forecast",e)}}),this._weatherUnsubscribers=[]}_releaseActivePointerCapture(){this._releasingPointerCapture=!0;try{if(this._pointerCaptureTarget&&null!==this._capturedPointerId&&this._pointerCaptureTarget.hasPointerCapture?.(this._capturedPointerId))try{this._pointerCaptureTarget.releasePointerCapture(this._capturedPointerId)}catch{}this._pointerCaptureTarget=null,this._capturedPointerId=null}finally{this._releasingPointerCapture=!1}}_captureActivePointer(e){this._releaseActivePointerCapture();const t=e.currentTarget;if(t instanceof Element&&"function"==typeof t.setPointerCapture)try{t.setPointerCapture(e.pointerId),this._pointerCaptureTarget=t,this._capturedPointerId=e.pointerId}catch{}}_handlePointerDown(e){if(this._draft&&e.pointerId!==this._activePointerId)return;if("number"==typeof e.button&&0!==e.button)return;const t=this._pressPath(e),n=t?.path,i=this._startsOnRowLink(e,n),r=i?void 0:this._eventTapAt(e,n),a=i||r?void 0:this._dayHitAt(e,n);e.currentTarget?.toggleAttribute?.("data-own-press",Boolean(i||r||a));const o=this._swipeStartsAt(e),s=this._draftAnchorFor(a),l=t?.lifts?this._moveFrom(e,r,t.path):void 0,d=!i&&(void 0!==s||void 0!==l||this._holdRunsFor(r));(i?o:this._hasTapAction||d||r||a||o)&&!1!==e.isPrimary&&null===this._activePointerId&&(this._activePointerId=e.pointerId,this._pointerStart={x:e.clientX,y:e.clientY},this._pointerMoved=!1,this._holdTriggered=!1,this._pointerTapTarget=r??null,this._pointerDayHit=a??null,this._pointerAddContext=i?null:this._addContextAt(e,n)??null,this._pointerDayAdd=i?null:this._dayAddAt(e,n)?.element??null,this._pointerHandedTo=t?.handedTo??null,this._pointerSwipeable=o,this._pointerOnLink=i,this._pointerDraftFrom=s??null,this._move=l??null,this._derivedClick=null,i||this._captureActivePointer(e),this._washDay(a),this._holdIndicator&&(qs(this._holdIndicator),this._holdIndicator=null),d&&(this._holdTimer&&clearTimeout(this._holdTimer),this._holdTimer=window.setTimeout(()=>{if(this._activePointerId===e.pointerId){if(this._holdTriggered=!0,this._washDay(void 0),this._pointerDraftFrom)return void this._startDraft();if(this._move)return void this._startMove();this._holdIndicator&&(qs(this._holdIndicator),this._holdIndicator=null),this._holdIndicator=function(e,t){const n=document.createElement("div");n.style.position="fixed",n.style.pointerEvents="none",n.style.borderRadius="50%",n.style.backgroundColor=t.accent_color,n.style.opacity=`${Se.HOLD_INDICATOR_OPACITY}`,n.style.transform="translate(-50%, -50%) scale(0)",n.style.transition="transform 200ms ease-out",n.style.left=e.clientX+"px",n.style.top=e.clientY+"px";const i="touch"===e.pointerType?Se.HOLD_INDICATOR.TOUCH_SIZE:Se.HOLD_INDICATOR.POINTER_SIZE;return n.style.width=`${i}px`,n.style.height=`${i}px`,document.body.appendChild(n),setTimeout(()=>{n.style.transform="translate(-50%, -50%) scale(1)"},10),Dt("Created hold indicator"),n}(e,this.config)}},500)))}_syncNewShown(){const e=this._newShown;e&&(this._draftContext()===e.context?this._paintNew():this._drawingPress?this._draftStillShown():this._dropNew())}get _drawingPress(){return Boolean(this._draft||this._move?.started)}_draftAnchorFor(e){if(e&&"grid"===this.effectiveView&&this._dayTapsActive){if(e.allDay)return{allDay:!0,timestamp:e.timestamp};if(void 0!==e.minute)return{allDay:!1,point:{timestamp:e.timestamp,minute:e.minute}}}}_startDraft(){const e=this._pointerDraftFrom;e&&!this._draft&&(this._dropNew(),this._draft={anchor:e,moved:!1,under:this._pointerDayHit?.element??null},this._newShown={times:e.allDay?Ys(e.timestamp,e.timestamp):Ks(e.point,e.point,!1),title:"",calendarId:this._draftCalendarId(),context:this._draftContext(),inPopover:!1,saved:!1,arrived:!1},window.addEventListener("keydown",this._draftKeyDown,!0),window.addEventListener("pointerdown",this._draftSecondContact,!0),this._paintNew())}_draftContext(){const e=[...this.renderRoot.querySelectorAll(".grid-day-body")].map(e=>{const t=ru(e);return"time"===t?.kind?Vs(t.timestamp):""});return[this.effectiveView,this._pageShown,this._drawsNewEvents,...e].join("|")}_draftStillShown(){return!(!this._drawingPress||!this._newShown||this._draftContext()!==this._newShown.context&&(Dt("The days an event was drawn on are gone; throwing the press away"),this._endGesture(),1))}_moveDraft(e,t){if(!this._draftStillShown())return;const n=this._draft,i=this._newShown;if(!n||!i)return;const r=n.anchor,a=i.times;if(r.allDay){const t=du(this.renderRoot.querySelectorAll(".grid-day-header"),e);if(!t)return;i.times=Ys(r.timestamp,t.timestamp),n.under=t.element}else{const a=du(this.renderRoot.querySelectorAll(".grid-day-body"),e);if(!a?.band)return;const o={timestamp:a.timestamp,minute:au(a.element.getBoundingClientRect(),t,a.band.startMin,a.band.endMin)};(function(e,t){return Vs(e.timestamp)===Vs(t.timestamp)&&e.minute===t.minute})(o,r.point)||(n.moved=!0),i.times=Ks(r.point,o,n.moved),n.under=a.element}Js(a,i.times)||this._paintNew()}_paintNew(){const e=this._newShown;if(!e)return this._clearNewDrawing(),void this._markMoveOrigin();const t=this.effectiveConfig,n=this.effectiveLanguage,i=this.safeHass,r=(e,t)=>[...this.renderRoot.querySelectorAll(e)].flatMap(e=>{const n=ru(e);return n?.kind===t?[{element:e,slot:n,day:Vs(n.timestamp)}]:[]}),a=new Map,o=r(".grid-day-header","day").map(({day:e})=>e),s=this._newEventByDay(e,o);if(e.times.allDay||[...s.values()].some(e=>e._gridBanner)){const e=s,r=o.flatMap((t,n)=>e.has(t)?[n]:[]),l=e.values().next().value,d=[];if(l&&r.length){const e={...l,...l._gridSource??{}};let a=0;for(let s=1;s<=r.length;s++){if(s<r.length&&r[s]===r[s-1]+1)continue;const l=r[a],c=Vl(e,o.slice(l,r[s-1]+1).map(e=>new Date(e)));c&&d.push(Jp(e,{...c,columnIndex:c.columnIndex+l},t,n,i)),a=s}}this._openBandForNew(d.length>0);const c=this.renderRoot.querySelector(".grid-allday-band");c&&d.length&&a.set(c,d)}else{this._openBandForNew(!1);const o=r(".grid-day-body","time"),s=this._newEventByDay(e,o.map(({day:e})=>e)),l=wr(t,"show_now_line"),d=new Date;d.setSeconds(0,0);for(const{element:e,slot:r,day:c}of o){const o=e.querySelector(":scope > .grid-day-plane"),u=s.get(c),h=u&&Ul(u);if("time"!==r.kind||!o||!u||!h)continue;const m={startMin:r.startMin,endMin:r.endMin,usedFallback:!1},p=l&&c===Vs(d.getTime())&&null!==Cl(d,m)?kl(d):null,f=this._coversAnEvent(o,h.startMin,h.endMin,m);a.set(o,Yp({...u,...h},m,f,p,t,n,this.weatherForecasts,i))}}for(const[e,t]of this._newHosts)a.has(e)&&t.parentNode===e||this._removeNewHost(e);for(const[e,t]of a){let n=this._newHosts.get(e);n?se(t,n,{host:this}):(n=document.createElement("div"),n.className=Kp,n.setAttribute("data-add-draft",""),n.setAttribute("aria-hidden","true"),se(t,n,{host:this}),e.append(n),this._newHosts.set(e,n))}this._fitNewBlocks(),this._markMoveOrigin()}_coversAnEvent(e,t,n,i){const{topPct:r,heightPct:a}=lu(t,n,i);return[...e.querySelectorAll(":scope > .grid-event")].some(e=>{const t=parseFloat(e.style.getPropertyValue("--calendar-card-grid-block-top")),n=parseFloat(e.style.getPropertyValue("--calendar-card-grid-block-height"));return t<r+a&&r<t+n})}_fitNewBlocks(){for(const e of[...this._newObserved])if(!e.isConnected){for(const[t,n]of this._gridDisclosureTargets)n===e&&(this._gridDisclosureObserver?.unobserve(t),this._gridDisclosureTargets.delete(t));this._newObserved.delete(e)}const e=[...this._newHosts.values()].flatMap(e=>[...e.querySelectorAll(":scope > .grid-event")]);if(!e.length)return;this._gridDisclosureObserver||this._syncGridDisclosureSafety(!1);const t=this._gridDisclosureObserver;if(!t)return;let n=!1;for(const i of e){this._newObserved.add(i);for(const e of[i,...i.querySelectorAll(".summary, .event-title")])this._gridDisclosureTargets.has(e)||(this._gridDisclosureTargets.set(e,i),t.observe(e),this._gridDisclosureDirty.add(i),n=!0)}n&&(this._scheduleGridDisclosureSafety(!1),this._syncTitleScroll())}_removeNewHost(e){this._newHosts.get(e)?.remove(),this._newHosts.delete(e)}_clearNewDrawing(){for(const e of[...this._newHosts.keys()])this._removeNewHost(e);this._fitNewBlocks()}_endDraft(){this._draft&&(this._draft=null,window.removeEventListener("keydown",this._draftKeyDown,!0),window.removeEventListener("pointerdown",this._draftSecondContact,!0),this._newShown?.inPopover||this._dropNew())}_dropNew(){this._clearNewDrawing(),this._newShown=null,this._markMoveOrigin(),this._openBandForNew(!1),void 0!==this._newTimer&&(clearTimeout(this._newTimer),this._newTimer=void 0)}_openBandForNew(e){e!==this._bandOpenForNew&&(this._bandOpenForNew=e,this.requestUpdate())}_followNew(e){const t=this._newShown;t?.inPopover&&(t.times=e.times,t.title=e.summary,t.calendarId=e.calendarId,t.location=e.location,t.description=e.description,this._paintNew())}_newClosed(){const e=this._newShown;e?.inPopover&&(e.inPopover=!1,e.saved&&!e.arrived?this._awaitArrival(e):this._dropNew())}_awaitArrival(e){this._newShown!==e||e.arrived||(void 0!==this._newTimer&&clearTimeout(this._newTimer),this._newTimer=window.setTimeout(()=>{this._newTimer=void 0,this._newShown===e&&this._dropNew()},5e3))}_newArrived(e){this._newShown===e&&(e.arrived=!0,e.inPopover||this._dropNew())}get _drawsNewEvents(){return"grid"===this.effectiveView&&this._dayTapsActive}_draftCalendarId(){return Aa(this._writableCalendars,this._activeHiddenCalendars)}_newEventSource(e){const{times:t}=e,n={start:t.allDay?{date:Qo(t.start)}:{dateTime:t.start.toISOString()},end:t.allDay?{date:Qo((i=t.end,new Date(i.getFullYear(),i.getMonth(),i.getDate()+1)))}:{dateTime:t.end.toISOString()}};var i;return e.moving?{...e.moving.source,...n,_entityId:e.calendarId}:{summary:e.title.trim()||Io(this.effectiveLanguage).newEvent,...n,...e.location?.trim()&&{location:e.location},...e.description?.trim()&&{description:e.description},_entityId:e.calendarId}}_newEventByDay(e,t){const n=this.effectiveConfig,i=this._newEventSource(e),r=new Map,[a]=Bd([i],n);if(a){const e=Hd([a],n,this.isExpanded,this.effectiveLanguage,this.effectiveView,this.hass);for(const t of e){const e=t.events.find(e=>!e._isEmptyDay);e&&r.set(Vs(t.timestamp),e)}if(r.size)return r}if(!t.length)return r;const o=n.entities.find(e=>"object"==typeof e&&e.entity===i._entityId),s={...i,..."object"==typeof o&&{_matchedConfig:o}};s._entityLabel=Qd(i._entityId,n,s);const l=new Date(Math.min(...t)),d=new Date(Math.max(...t)),c=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1),u=jd(s,n);for(const e of ql(s,l,c)){const t=e.start.dateTime?new Date(e.start.dateTime):Zo(e.start.date??"");r.set(Vs(t.getTime()),u?{...e,_gridBanner:!0}:e)}return r}_draftBoxOn(e){const t=e.getBoundingClientRect(),n=ru(e),i=this._newShown?.times,r=i&&!i.allDay&&"time"===n?.kind?function(e,t){const n=new Date(Vs(t)),i=new Date(Vs(t));if(i.setDate(i.getDate()+1),e.end<=n||e.start>=i)return;const r=e=>60*e.getHours()+e.getMinutes();return{fromMin:e.start<=n?0:r(e.start),untilMin:e.end>=i?1440:r(e.end)}}(i,n.timestamp):void 0;if(!r||"time"!==n?.kind)return t;const{topPct:a,heightPct:o}=lu(r.fromMin,r.untilMin,n),s=t.top+t.height*a/100;return{left:t.left,right:t.right,top:s,bottom:s+t.height*o/100}}get _movesEvents(){return"grid"===this.effectiveView&&!this._isBeingEdited&&!1!==this.config.allow_event_edit&&[this.config.event_tap_action,this.config.event_hold_action].some(e=>"details"===Ls(e))}_moveFrom(e,t,n){if(!t||!this._movesEvents)return;const i=t.element;if(!(i instanceof Element&&i.classList.contains("grid-event")))return;const{event:r}=t.target,a=r._entityId,o=Hs(r);if(!a||!o?.uid)return;const s=function(e){const t=tl(e.dtstart,e.dtend);if(!t||t.allDay)return;const n=t.start.getTime(),i=t.end.getTime();return i<n?void 0:Vs(n)===Vs(Math.max(n,i-1))?t:void 0}(o);if(!s||!this._eventPermissions(r,o).canEdit)return;const l=n.find(e=>"time"===ru(e)?.kind),d=ru(l);return l&&"time"===d?.kind?{element:i,target:t.target,entry:o,times:s,key:{entityId:a,uid:o.uid,recurrenceId:o.recurrence_id,start:s.start.getTime()},grab:{timestamp:d.timestamp,minute:cl(l.getBoundingClientRect(),e.clientY,d.startMin,d.endMin)},started:!1,left:!1,under:l}:void 0}_startMove(){const e=this._move;if(!e||e.started||this._draft)return;this._dropNew(),e.started=!0,this._washDay(void 0),this._holdIndicator&&(qs(this._holdIndicator),this._holdIndicator=null);const{event:t}=e.target;this._newShown={times:e.times,title:"",calendarId:e.key.entityId,context:this._draftContext(),inPopover:!1,saved:!1,arrived:!1,moving:{key:e.key,source:t._source??t}},window.addEventListener("keydown",this._draftKeyDown,!0),window.addEventListener("pointerdown",this._draftSecondContact,!0),this._paintNew()}_followMove(e,t){if(!this._draftStillShown())return;const n=this._move,i=this._newShown;if(!n||!i)return;const r=du(this.renderRoot.querySelectorAll(".grid-day-body"),e);if(!r?.band)return;const a={timestamp:r.timestamp,minute:cl(r.element.getBoundingClientRect(),t,r.band.startMin,r.band.endMin)},o=function(e,t,n){const i=Se.ADD_SLOT_MINUTES,r=e.start,a=e.end.getTime()-r.getTime(),o=60*r.getHours()+r.getMinutes(),s=Math.ceil(a/6e4),l=Math.ceil(-o/i),d=Math.max(l,Math.min(Math.floor((1439-o)/i),Math.floor((1440-o-s)/i)));let c=Math.min(d,Math.max(l,Math.round((n.minute-t.minute)/i)));const u=al(new Date(Vs(t.timestamp)),new Date(Vs(n.timestamp))),h=el(new Date(Vs(r.getTime())),u),m=e=>{const t=Gs(h.getTime(),o+e*i);t.setSeconds(r.getSeconds(),r.getMilliseconds());const n=6e4*(r.getTimezoneOffset()-t.getTimezoneOffset()),a=new Date(t.getTime()+n);return 0!==n&&function(e,t){return nl(e)===nl(t)&&e.getHours()===t.getHours()&&e.getMinutes()===t.getMinutes()&&e.getSeconds()===t.getSeconds()}(a,t)?a:t};let p=m(c);for(let e=0;e<8&&c>l;e++){const e=p.getTime()+a;if(Vs(Math.max(p.getTime(),e-1))===Vs(p.getTime()))break;c-=1,p=m(c)}return{allDay:!1,start:p,end:new Date(p.getTime()+a)}}(n.times,n.grab,a);n.under=r.element,Js(i.times,o)||(i.times=o,Js(o,n.times)||(n.left=!0),this._paintNew())}_dropMove(e,t,n){if(!e.entry.recurrence_id&&!e.entry.rrule)return t.saved=!0,this._markMoveOrigin(),void this._writeMove(e,t);const i=e.under?this._draftBoxOn(e.under):void 0,r=this._detailsParams(e.target.event,e.target.color,{x:n.clientX,y:n.clientY,pointerType:n.pointerType,rect:i});r&&(t.inPopover=!0,this._openPopover({...r,moved:t.times,updated:(...n)=>(this._newShown===t&&(t.saved=!0,this._markMoveOrigin()),this._refreshAfterWrite({ids:n.length?n:[e.key.entityId]},()=>this._newArrived(t))),closed:()=>{this._newShown===t&&this._newClosed()}}))}async _writeMove(e,t){const n=this.safeHass,i=e.key.entityId;try{if(!n)throw new Error("Home Assistant is not connected");await $a(n,{entityId:i,uid:e.key.uid},(r=e.entry,a=t.times,{summary:r.summary,...rl(a),...void 0!==r.description&&{description:r.description},...void 0!==r.location&&{location:r.location}}))}catch(e){return Tt("Moving the event failed",e),this._newShown===t&&this._dropNew(),void this._notify(Sa(e)??"Unknown error")}var r,a;Dt(`Moved an event of ${i}`),this._refreshAfterWrite({ids:[i]},()=>this._newArrived(t)),this._awaitArrival(t)}_notify(e){const t=new Event("hass-notification",{bubbles:!0,composed:!0});t.detail={message:e},this.dispatchEvent(t)}_endMove(){const e=this._move;if(!e)return;if(this._move=null,!e.started)return;this._derivedClick={element:e.element,deadline:Date.now()+$e},this._draft||(window.removeEventListener("keydown",this._draftKeyDown,!0),window.removeEventListener("pointerdown",this._draftSecondContact,!0));const t=this._newShown;!t?.moving||t.inPopover||t.saved||this._dropNew()}_markMoveOrigin(){const e=this._newShown,t=e?.moving?.key,n=e?.saved?"dropped":"lifted",i=this.renderRoot.querySelectorAll(t?".grid-event":"[data-move-origin]");for(const e of i){const i=t&&!e.closest(`.${Kp}`)?Zc(e):void 0;void 0!==t&&void 0!==i&&ul(t,i.event._entityId,Hs(i.event))?e.getAttribute("data-move-origin")!==n&&e.setAttribute("data-move-origin",n):e.removeAttribute("data-move-origin")}}_startsOnRowLink(e,t){return!!t&&function(e,t){for(const n of e){if(n===t)return!1;if("a"===n.localName&&n.classList?.contains("event-link"))return!0}return!1}(t,e.currentTarget)}_holdRunsFor(e){return null!=e&&this._eventHoldRuns||this._hasHoldAction}_dayHitAt(e,t){if(this._dayTapsActive&&t)return su(t,e.currentTarget,{x:e.clientX,y:e.clientY})}_addContextAt(e,t){const n=e=>e?.action===_e;if((n(this.config.tap_action)||n(this.config.hold_action))&&this._canAddEvents&&t)return su(t,e.currentTarget,{x:e.clientX,y:e.clientY},!0)}_dayAddAt(e,t=this._pathOf(e)){if(this._dayTapsActive&&t)return function(e,t){for(const n of e){if(n===t)return;const e=cu(n);if(void 0!==e)return{element:n,timestamp:e}}}(t,e.currentTarget)}_washDay(e){const t=this._washedDay;if(t&&(t.removeAttribute("data-add-pressed"),t instanceof HTMLElement&&(t.style.removeProperty("--calendar-card-add-hour-top"),t.style.removeProperty("--calendar-card-add-hour-height")),this._washedDay=null),e){if(e.element.setAttribute("data-add-pressed",""),void 0!==e.minute&&e.band&&e.element instanceof HTMLElement){const{topPct:t,heightPct:n}=lu(e.minute,e.minute+60,e.band);e.element.style.setProperty("--calendar-card-add-hour-top",`${t}%`),e.element.style.setProperty("--calendar-card-add-hour-height",`${n}%`)}this._washedDay=e.element}}_handlePointerMove(e){if(e.pointerId!==this._activePointerId||!this._pointerStart)return;if(this._draft)return void this._moveDraft(e.clientX,e.clientY);if(this._move?.started)return void this._followMove(e.clientX,e.clientY);if(this._holdTriggered)return;const t=e.clientX-this._pointerStart.x,n=e.clientY-this._pointerStart.y;if(!this._pointerMoved){if(Math.hypot(t,n)<=Se.POINTER_MOVE_TOLERANCE)return;if(this._move&&"mouse"===e.pointerType)return this._holdTimer&&(clearTimeout(this._holdTimer),this._holdTimer=null),this._pointerMoved=!0,this._startMove(),void this._followMove(e.clientX,e.clientY);if(this._pointerDraftFrom&&"mouse"===e.pointerType)return this._holdTimer&&(clearTimeout(this._holdTimer),this._holdTimer=null),this._holdTriggered=!0,this._washDay(void 0),this._startDraft(),void this._moveDraft(e.clientX,e.clientY);this._pointerMoved=!0,this._washDay(void 0),this._holdTimer&&(clearTimeout(this._holdTimer),this._holdTimer=null),this._holdIndicator&&(qs(this._holdIndicator),this._holdIndicator=null)}this._pointerSwipeable&&this._nudgeSwipe(t,n)}_handlePointerUp(e){if(e.pointerId!==this._activePointerId)return;if("number"==typeof e.button&&0!==e.button)return;this._liftingTouch="touch"===e.pointerType,this._holdTimer&&(clearTimeout(this._holdTimer),this._holdTimer=null);const t=this._pointerTapTarget,n=this._pointerDayHit,i={...this._pointerStart??{x:e.clientX,y:e.clientY},pointerType:e.pointerType,rect:t?k_(t.element)?.rect:void 0},r=this._cardActions(this._pointerAddContext,i);let a=!1;const o=this._move?.started&&this._draftStillShown()?this._move:null,s=o?this._newShown:null,l=this._draftStillShown()?this._draft:null,d=l?this._newShown:null;if(o&&s&&o.left)Js(s.times,o.times)||(this._releasePressFocus(),this._dropMove(o,s,e));else if(l&&d){Dt("Adding the event drawn");const t=l.under?this._draftBoxOn(l.under):void 0;this._releasePressFocus(),this._openCreateEventDialog(d.times,{x:e.clientX,y:e.clientY,pointerType:e.pointerType,rect:t},!0),a=!0}else if(this._holdTriggered)t&&this._eventHoldRuns?(this._releasePressFocus(),this._runEventAction(t.target,"hold",i)):this._hasHoldAction&&(Dt("Executing hold action"),this._releasePressFocus(),wa(this,this.config,"hold",r,this._shownEntries));else if(this._pointerMoved){if(this._pointerSwipeable){const t=this._pointerStart;t&&this._swipeEnded(e.clientX-t.x,e.clientY-t.y)}}else this._pointerOnLink||(t&&this._eventTapRuns?(this._releasePressFocus(),this._runEventAction(t.target,"tap",i)):n&&this._dayTapsActive?(Dt("Executing day tap action"),this._releasePressFocus(),this._addEventAt(n,i),a=!0):this._hasTapAction&&(Dt("Executing tap action"),this._releasePressFocus(),wa(this,this.config,"tap",r,this._shownEntries),a=!0));const c=this._pointerHandedTo??(t?t.element:this._pointerDayAdd??(a?null:void 0));this._derivedClick=void 0===c?null:{element:c,deadline:Date.now()+$e},this._endGesture()}_releasePressFocus(){const e=this.shadowRoot?.activeElement;e instanceof HTMLElement&&e.blur()}_handlePointerCancel(e){e.pointerId===this._activePointerId&&this._endGesture()}_endGesture(){this._holdTimer&&(clearTimeout(this._holdTimer),this._holdTimer=null),this._releaseActivePointerCapture(),this._activePointerId=null,this._pointerStart=null,this._pointerMoved=!1,this._holdTriggered=!1,this._pointerTapTarget=null,this._pointerDayHit=null,this._pointerAddContext=null,this._pointerDayAdd=null,this._pointerHandedTo=null,this._pointerSwipeable=!1,this._pointerOnLink=!1,this._pointerDraftFrom=null,this._liftingTouch=!1,this._endDraft(),this._endMove(),this._washDay(void 0),this._springBackSwipe(),this._holdIndicator&&(qs(this._holdIndicator),this._holdIndicator=null)}_handlePointerLeave(e){if(e.pointerId!==this._activePointerId)return;const t=e.currentTarget;t instanceof Element&&this._capturedPointerId===e.pointerId&&t.hasPointerCapture?.(e.pointerId)||this._handlePointerCancel(e)}_handleLostPointerCapture(e){this._releasingPointerCapture||e.pointerId!==this._activePointerId&&e.pointerId!==this._capturedPointerId||this._handlePointerCancel(e)}_swipeStartsAt(e){if("touch"!==e.pointerType&&"pen"!==e.pointerType)return!1;if(!this._swipeAvailable)return!1;const t=Se.SWIPE_EDGE_GUARD,n=window.innerWidth;return e.clientX>=t&&(!(n>0)||e.clientX<=n-t)}_swipeDirection(e,t){const n=Math.abs(e);if(n<Se.SWIPE_MIN_DISTANCE)return 0;if(n<Se.SWIPE_MIN_SLOPE_RATIO*Math.abs(t))return 0;const i=this.renderRoot?.querySelector("ha-card");return e<0!=(i instanceof Element&&"rtl"===getComputedStyle(i).direction)?1:-1}_swipeEnded(e,t){const n=this._swipeDirection(e,t);if(0===n||!this._swipeAvailable)return;Dt("Swipe pages "+(n>0?"forward":"back"));const i=this._pageRequested;this._stepPage(n),this._pageRequested===i||$_()||(this._swipeArrival={page:this._pageRequested,from:e<0?1:-1})}_nudgeSwipe(e,t){const n=Math.abs(e)>=Se.SWIPE_MIN_SLOPE_RATIO*Math.abs(t);let i=this._swipeNudge;if(!i){if(!n||$_())return;const e=this.renderRoot.querySelector(".content-container");if(!e)return;this._swipeMotion?.cancel(),this._swipeMotion=null,i=this._swipeNudge={element:e,offset:0}}const r=n?function(e){const t=Se.SWIPE_NUDGE_MAX;return Math.sign(e)*t*(1-Math.exp(-Math.abs(e)/(2*t)))}(e):0;r!==i.offset&&(i.offset=r,0===r?S_(i.element):i.element.style.transform=`translateX(${r.toFixed(1)}px)`)}_springBackSwipe(){const e=this._swipeNudge;e&&(this._swipeNudge=null,S_(e.element),0!==e.offset&&this._startSwipeMotion(e.element,[{transform:`translateX(${e.offset.toFixed(1)}px)`},{transform:"translateX(0)"}],180))}_startSwipeMotion(e,t,n){if(this._swipeMotion?.cancel(),this._swipeMotion=null,"function"!=typeof e.animate||$_())return;const i=e.animate(t,{duration:n,easing:"ease-out"});i.finished?.catch(()=>{}),this._swipeMotion=i}_syncSwipeArrival(){const e=this._swipeArrival;if(!e)return;if(!this._swipeAvailable)return void(this._swipeArrival=null);if(this._pageShown!==e.page||this.isInitialLoad)return;this._swipeArrival=null;const t=this.renderRoot.querySelector(".content-container");if(!t)return;const n=e.from*Se.SWIPE_ARRIVAL_OFFSET;this._startSwipeMotion(t,[{transform:`translateX(${n}px)`,opacity:0},{transform:"translateX(0)",opacity:1}],220)}_handleKeyDown(e){if(!this._handleEventKeyDown(e)&&!(null!=e.currentTarget&&e.target!==e.currentTarget||"Enter"!==e.key&&" "!==e.key)){if(!this._hasTapAction)return;e.preventDefault(),wa(this,this.config,"tap",this._cardActions(null,k_(e.target)),this._shownEntries)}}_keyTargetOn(e){const t=this._eventsActivatable?Zc(e):void 0;if(t)return{event:t};const n=this._dayTapsActive?cu(e):void 0;return void 0===n?void 0:{day:n}}_activate(e,t){"event"in e?this._runEventAction(e.event,this._eventTapRuns?"tap":"hold",t):(Dt("Executing day tap action"),this._addEventAt(void 0,t,e.day))}_handleEventKeyDown(e){if("Enter"!==e.key&&" "!==e.key)return!1;const t=this._keyTargetOn(e.target);return!!t&&(e.preventDefault(),e.stopPropagation(),e.repeat||("Enter"===e.key?this._activate(t,k_(e.target)):this._spaceArmedOn=e.target),!0)}_handleKeyUp(e){if(" "!==e.key)return;const t=this._spaceArmedOn;this._spaceArmedOn=null;const n=this._keyTargetOn(e.target);n&&null!==t&&t===e.target&&(e.preventDefault(),e.stopPropagation(),this._activate(n,k_(e.target)))}_handleClick(e){const t=this._eventTapAt(e),n=t?void 0:this._dayAddAt(e),i=this._derivedClick;i&&Date.now()>i.deadline&&(this._derivedClick=null);const r=t?.element??n?.element??null;if(this._derivedClick&&(null===r||r===this._derivedClick.element))return this._derivedClick=null,void(r&&e.stopPropagation());r&&(e.stopPropagation(),t?this._activate({event:t.target},k_(t.element)):n&&this._activate({day:n.timestamp},k_(n.element)))}setConfig(e){const t=this.config,n=this._instanceId;for(const t of function(e){const t=e,n=[];for(const[e,i]of Object.entries(Vn))e in t&&n.push(`"${e}" was removed in v3.0.0 and is being ignored — use "${i}"`);const i=t.entities;return Array.isArray(i)&&i.forEach((e,t)=>{if("object"!=typeof e||null===e)return;const i=e;for(const[e,r]of Object.entries(Gn))e in i&&n.push(`"${e}" on entities[${t}] was removed in v3.0.0 and is being ignored — use "${r}"`)}),n}(e))St(t);const i=Kn(jn,e);this.config=i,this.config.entities=Ai(this.config.entities),Zn(this.config),function(e){for(const t of oi)$i(t,ei(e,t))}(this.config),Mi(this.config),function(e){const t=e.view;if(dr.includes(t))return;const n=dr.map(e=>`"${e}"`).join(" or ");Tt(`Ignoring "view: ${JSON.stringify(t)}": not a recognized view. Expected ${n}. Falling back to "list".`),e.view="list"}(this.config),function(e){for(const t of function(e){if(!e||"object"!=typeof e)return[];const t=[],n=new Set;for(const i of Object.values(Hr))for(const r of i.onlyKeys)!n.has(r)&&Object.prototype.hasOwnProperty.call(e,r)&&(n.add(r),t.push({kind:"view-only",key:r,from:null,to:Kr(r)}));for(const n of Object.keys(e))Jr().has(n)&&t.push({kind:"calendar",key:n,from:null,to:[]});for(const n of Object.values(Hr))t.push(...Xr(e,n));return t}(e))"calendar"===t.kind&&null===t.from&&Zr(t);for(const t of Object.keys(Hr))Gr(e,t)}(this.config);for(const e of function(e){const t=ht(e.toolbar)?e.toolbar.buttons:void 0;return Array.isArray(t)?t.filter(e=>!Xn(e)):[]}(this.config))Tt(`Toolbar button left out, as it cannot be drawn as written: ${JSON.stringify(e)}. Each needs an icon; a name and an entity are text, and a tap_action is an action.`);for(const e of this.config.entities){const t="string"!=typeof e&&e.visibility?In(e.visibility):[];"string"!=typeof e&&0!==t.length&&Tt(`${e.entity}: some of its visibility conditions cannot be judged (${t.join(", ")}) and hide it wherever they would decide. A state or numeric_state condition that waits (for) or templates (value_template) needs entity_id, as Home Assistant's own Visibility editor writes it.`)}if(this.config.time_grid){const e=wr(this.config,"start_time"),t=wr(this.config,"end_time");wl(e,t).usedFallback&&Tt(`Invalid time_grid time range "${e} - ${t}": expected HH:mm bounds with the end after the start (24:00 is allowed for the end). Falling back to ${gl}-${vl}.`);const n=this.config.time_grid.axis_width;void 0!==n&&yr(n).usedFallback&&Tt(`Invalid time_grid axis_width "${n}": expected a pixel length such as "128px", or "max-content". Other CSS lengths cannot be reserved before the grid is laid out, so the day columns would be fitted against the wrong axis width. Falling back to "max-content".`)}const r=this._syncDeviceChoice(e)&&null!==this._pageRequested;r&&this._requestPage(null);const a=pa(this.requestedView,this.config,this._measuredWidthPx,null===this._measuredWidthPx?null:{view:this._effectiveView,columns:this._columnCount});this._effectiveView=a.view,this._columnCount=a.columns,this._instanceId!==n&&this._setFailures([]);const o=function(e,t){if(!e||0===Object.keys(e).length)return!0;const n=(e.entities||[]).map(e=>"string"==typeof e?e:e.entity).sort().join(","),i=(t.entities||[]).map(e=>"string"==typeof e?e:e.entity).sort().join(","),r=e?.refresh_interval!==t?.refresh_interval,a=n!==i||e.days_to_show!==t.days_to_show||e.start_date!==t.start_date||e.first_day_of_week!==t.first_day_of_week;return(a||r)&&Dt("Configuration change requires data refresh"),a||r}(ha(t),ha(this.config));var s,l;o?(Dt("Configuration changed, refreshing data"),this.updateEvents(this._appearLoadPending?"navigate":"network")):(s=t,l=this.config,s&&0!==Object.keys(s).length&&(Ei(s.entities)!==Ei(l.entities)||Li.some(e=>s[e]!==l[e]))?(Dt("Per-calendar configuration changed, reprocessing cached data"),this.updateEvents("reprocess")):r&&this._loadPage())}_syncDeviceChoice(e){const t=a_(e);if(t===this._configFingerprint)return!1;this._configFingerprint=t;const n=this._wantsViewSwitcher?function(e,t=o_()){return u_(t)[e]?.view}(t):void 0;this._viewChoice=void 0!==n&&n!==this.config.view?n:null;const i=new Set(bf(this.config.entities)),r=this._wantsLegend?p_(t):void 0,a=(r??[]).filter(e=>i.has(e));return this._hiddenCalendars=a.length>0?new Set(a):L_,this._hiddenMatchesStorage=void 0!==r,this._legendFold=null,!0}refreshEvents(e){return this.updateEvents("reload",e)}async updateEvents(e="cache",t){const n=!0===e?"network":!1===e?"cache":e;if(Dt(`Updating events (${n})`),!this.isConnected)return;const i=++this._eventRequestGeneration,r=()=>i!==this._eventRequestGeneration;this.safeHass&&this._initialLoadRetryId&&(clearTimeout(this._initialLoadRetryId),this._initialLoadRetryId=void 0);const a=this.safeHass;if(!a||!this.config.entities.length)return this.isLoading=!1,void(a?(this._loadedDaysShown=null,this._setFailures([]),this.isInitialLoad=!1):(this._initialLoadRetryId&&clearTimeout(this._initialLoadRetryId),this._initialLoadRetryId=window.setTimeout(()=>{this.updateEvents(n,t)},1500)));const o="navigate"===n;this._appearLoadPending=!1;const s=this._pageRequested,l=this._loadConfigForPage(s),d=this._instanceIdForPage(s),c=null===s?"persistent":"page",u="network"!==n&&"reload"!==n&&"live"!==n;this._failureCountQuery!==d&&(this._failureCountHint=0,this._failureCountQuery=d),"reload"===n&&function(e,t){const n=Zl(e),i=n?Gl.get(n):void 0;if(!i)return;const r=new Set;for(const e of[...i.subscriptions.values()])t.includes(e.entityId)&&(id(i,e),r.add(e.entityId));for(const e of r)td(i,e)}(a,Sd(a,l).entityIds);let h=null;if(u)try{h=xd(a,l,d,c)}catch(e){Tt("Could not read cached events:",e)}null===h||"navigate"!==n&&"page"!==n&&"reprocess"!==n&&h.due||!h?o&&this.events.length>0&&this._dropUndrawableResidentEvents():(Mt(`Drawing ${h.events.length} cached events`),this._commitEvents(h,d,s,l.days_to_show));const m=h?Date.now()-h.fetchedAt:1/0;if(!(!h||h.inFlight||"reprocess"!==n&&h.due||o&&!0===l.refresh_on_navigate&&0===h.failedEntities.length&&m>=5e3)&&h)return this.isLoading=!1,this._scheduleRefresh(h.nextAttemptAt),void this._syncLive();try{if(this.isLoading=!0,await this.updateComplete,r())return void Dt("Discarding a superseded event request");const e=this.isInitialLoad||!this._drawsEventOn(s),o=this._completeDrawing;let u;try{u=await kd(a,l,d,"reload"===n||"live"===n?n:"network",this._failureCountHint,t,c,e?e=>this._schedulePartialCommit(e,d,s,i):void 0)}finally{this._cancelPartialCommit(i)}if(r())return void Dt("Discarding a superseded event response");const h=u.failedEntities??[];h.length>0&&Tt(`Could not load calendar(s): ${h.join(", ")}`),this._failureCountHint=h.length>0?this._failureCountHint+1:0;const m=o.instanceId===d,p=h.length>0&&o.events.length>0&&m;this._commitEvents(p?this._keepFailedCalendars(a,l,u,o):u,d,s,l.days_to_show),this.isLoading=!1,this._scheduleRefresh(u.nextAttemptAt??Date.now()+this._refreshIntervalMs()),this._syncLive(),0===h.length&&Mt("Event update completed successfully")}catch(e){if(r())return void Dt("Ignoring a failure from a superseded event request");$t("Failed to update events:",e),this._failureCountHint+=1,this._setFailures(Array.from(new Set(l.entities.map(e=>"string"==typeof e?e:e.entity)))),this.isLoading=!1,this.isInitialLoad=!1,this._scheduleRefresh(Date.now()+Math.min(6e4*2**Math.min(this._failureCountHint-1,20),this._refreshIntervalMs())),this._syncLive()}}_commitEvents(e,t,n,i){const r=e.failedEntities??[];this.events=[...e.events??[]],this._eventsInstanceId=t,this._pageShown=n,this._loadedDaysShown=i,this._eventsFetchedAt=e.loadedAt??e.fetchedAt??Date.now(),this._drawnRaw=e.raw??[],this._drawnLoadedAt=e.lastSuccess??{},this._completeDrawing={instanceId:t,events:this.events,raw:this._drawnRaw,loadedAt:this._drawnLoadedAt,fetchedAt:this._eventsFetchedAt},this._liveDriftLoaded="",this._setFailures(r),this.isInitialLoad=!1,0===r.length&&(this._lastUpdateTime=Date.now(),this._failureCountHint=0)}_keepFailedCalendars(e,t,n,i){const r=n.lastSuccess??{},a=Date.now(),o=Object.fromEntries((n.failedEntities??[]).flatMap(e=>{if("number"==typeof r[e])return[];const t=N_(i,e);return a-t<864e5?[[e,t]]:[]})),s=i.raw.filter(e=>"number"==typeof o[e._entityId??""]);return 0===s.length?n:(Tt(`Keeping the last events drawn of ${[...new Set(s.map(e=>e._entityId))].join(", ")}, which the cache could not carry`),function(e,t,n,i,r){const a=[...n.raw??[],...i],o=vs(t.first_day_of_week,e.locale),s={...n.lastSuccess};let l=n.loadedAt??n.fetchedAt??Date.now();for(const e of i){const t=e._entityId?r[e._entityId]:void 0;e._entityId&&void 0!==t&&(s[e._entityId]=t,l=Math.min(l,t))}return{...n,raw:a,events:Ld(a,t,o),lastSuccess:s,loadedAt:l}}(e,t,n,s,o))}_drawnLoadedAtOf(e){return N_({loadedAt:this._drawnLoadedAt,fetchedAt:this._eventsFetchedAt},e)}_schedulePartialCommit(e,t,n,i){i===this._eventRequestGeneration&&(this._partialCommit={partial:e,instanceId:t,page:n,generation:i},null===this._partialTimer&&(this._partialTimer=window.setTimeout(()=>{this._partialTimer=null;const e=this._partialCommit;this._partialCommit=null,e&&e.generation===this._eventRequestGeneration&&this.isConnected&&this._partialDrawsAnEvent(e.partial.events,e.page)&&(this.events=[...e.partial.events],this._drawnRaw=e.partial.raw??[],this._drawnLoadedAt=e.partial.lastSuccess??{},this._eventsInstanceId=e.instanceId,this._pageShown=e.page,this._eventsFetchedAt=e.partial.fetchedAt,this._setFailures([]),this.isInitialLoad=!1)},0)))}_drawsEventOn(e){if(0===this.events.length)return!1;let t=this._daysOnScreen(this.groupedEvents,this._pageShown);if(e!==this._pageShown){const n=this._daysSpan(e);t=t.filter(e=>e.timestamp>=n.from&&e.timestamp<n.until)}return Uf(this.effectiveView,t,this.effectiveConfig)}_daysSpan(e){const t=this._pageRange(e);return{from:t.start.getTime(),until:vc(t.start,t.days).getTime()}}_daysOnScreen(e,t){if("list"===this.effectiveView)return e;const n=this._shownColumnCount;if(this._wantsNavigation&&n>0&&n<this._viewDays){const n=this._pageRange(t),i=n.start.getTime(),r=vc(n.start,n.days).getTime();return e.filter(e=>e.timestamp>=i&&e.timestamp<r)}if(n<=0||n>=e.length)return e;const i=function(e,t,n){if(t<=0||t>=e.length)return 0;const i=new Date(n.getFullYear(),n.getMonth(),n.getDate()).getTime(),r=e.findIndex(e=>e.timestamp>=i);return Math.min(-1===r?e.length:r,e.length-t)}(e,n,new Date);return e.slice(i,i+n)}_partialDrawsAnEvent(e,t){const n=e.filter(e=>this._eventShown(e)),i=Vr(this._configForPage(t),this.effectiveView),r=Hd(n,i,this.isExpanded,this.effectiveLanguage,this.effectiveView,this.hass);return Uf(this.effectiveView,this._daysOnScreen(r,t),i)}_cancelPartialCommit(e){void 0!==e&&this._partialCommit?.generation!==e||(null!==this._partialTimer&&(clearTimeout(this._partialTimer),this._partialTimer=null),this._partialCommit=null)}_setFailures(e){const t=e.length!==this._failedEntities.length||e.some((e,t)=>e!==this._failedEntities[t]);this._failedEntities=[...e],t&&this.requestUpdate()}_dropUndrawableResidentEvents(){if(""===this._eventsInstanceId)return;const e=Date.now(),t=this._eventsInstanceId===this._instanceIdForPage(this._pageRequested),n=n=>t&&e-this._drawnLoadedAtOf(n._entityId)<864e5,i=this.events.filter(n);if(i.length>0){if(i.length===this.events.length)return;return this._eventsFetchedAt=Math.min(...i.map(e=>this._drawnLoadedAtOf(e._entityId))),this.events=i,void(this._drawnRaw=this._drawnRaw.filter(n))}this.events=[],this._drawnRaw=[],this._drawnLoadedAt={},this._eventsInstanceId="",this._setFailures([]),this.isInitialLoad=!0}hasCompactModeLimits(){if(!Br(this.effectiveView))return!1;const e=e=>"number"==typeof e&&Number.isFinite(e),t=this.effectiveConfig;return!(!e(t.compact_events_to_show)&&!e(t.compact_days_to_show))||(t.entities??[]).some(t=>{return"object"==typeof t&&null!==t&&e(t.compact_events_to_show)&&(n=t,!(0!==(i=this._visibility).hidden.size&&"string"!=typeof n&&n.visibility&&i.hidden.has(Rn(n.entity,n.visibility))));var n,i})}toggleExpanded(){this.hasCompactModeLimits()&&(this.isExpanded=!this.isExpanded)}handleAction(e){const t=e===this.config.hold_action?"hold":"tap";wa(this,this.config,t,this._cardActions(),this._shownEntries)}render(){const e=this.getCustomStyles(),t={keyDown:e=>this._handleKeyDown(e),keyUp:e=>this._handleKeyUp(e),click:e=>this._handleClick(e),pointerDown:e=>this._handlePointerDown(e),pointerMove:e=>this._handlePointerMove(e),pointerUp:e=>this._handlePointerUp(e),pointerCancel:e=>this._handlePointerCancel(e),pointerLeave:e=>this._handlePointerLeave(e),lostPointerCapture:e=>this._handleLostPointerCapture(e),touchMove:this._drawsNewEvents||this._movesEvents?this._draftTouchMove:void 0,touchEnd:this._swallowTouchEnd,nativeDrag:this._movesEvents?this._refuseNativeDrag:void 0};let n,i=!1;const r=this._dayAddButtons,a=e=>this._daysOnScreen(e,this._pageShown),o=e=>"grid"===this.effectiveView?Zp(e,this.effectiveConfig,this.effectiveLanguage,this.weatherForecasts,this.safeHass,void 0,this._cascadeThresholds,this._overflowStripPct,this._eventsActivatable,r,this._bandOpenForNew):"column"===this.effectiveView?qf(e,this.effectiveConfig,this.effectiveLanguage,this.weatherForecasts,this.safeHass,this._eventsActivatable,r):Xf(e,this.effectiveConfig,this.effectiveLanguage,this.weatherForecasts,this.safeHass,this._eventsActivatable,r);if(this.isInitialLoad)n=Vf("loading",this.effectiveLanguage,this.hass);else if(this.safeHass&&this.config.entities.length)if(this._shownFailures.length>0&&!this._holdsShownEvent)n=B``;else{const e=this._searchRing,t=function(e,t){if(!t)return{days:e,found:!1};let n=!1;const i=e.map(e=>e.events.some(e=>Gc(e,t))?(n=!0,{...e,events:e.events.map(e=>Gc(e,t)?{...e,_searchRing:!0}:e)}):e);return{days:n?i:e,found:n}}(a(this.groupedEvents),e&&this._pageShown===e.page?e.target:null);this._searchRingDrawn=t.found;const s=t.days;n=o(s),i=void 0!==r&&s.length>0||this._eventsActivatable&&Uf(this.effectiveView,s,this.effectiveConfig)||function(e,t,n){return!(!ur.open_links.has(e)||!Sp(n))&&t.some(e=>e.events.some(e=>{if(e._isEmptyDay)return!1;const t=Hh(Tp(e,n),e._source);return void 0!==t.location||void 0!==t.description}))}(this.effectiveView,s,this.effectiveConfig)}else n=Vf("error",this.effectiveLanguage,this.hass);const s=this._headerToolbar();return function(e,t,n,i,r=!1,a=!1,o="list",s=!1,l=!1,d=V,c={},u=!1,h=!1,m="idle",p=!1,f){const g=s||l,v=s&&!u,_=s&&u&&f?B`<button
          class="card-tap-control"
          type="button"
          aria-label=${f.label}
          aria-expanded=${void 0===f.expanded?V:String(f.expanded)}
          @click=${e=>{e.stopPropagation(),f.activate(e.currentTarget)}}
        ></button>`:V,y=g?B`<ha-ripple></ha-ripple>`:V,w=_===V?y:B`${_}${y}`,b=Boolean(t||a)?B`<h1 class="card-header">${t}</h1>`:B`<div class="card-header-placeholder"></div>`,x=function(e,t){if(!(e.addEvent||e.customButtons?.length||e.viewSwitcher||e.navigation||e.reset||e.refresh||e.search||e.legend))return;const n=!0===e.labeled;return B`${Hf(e,n)}${Wf(e,t)}`}(c,b),k=x?"header-container has-toolbar":"header-container",$=h?"content-container page-pending":"content-container",T=["calendar-card-pro",qr(o),g?"card-interactive":"",p?"swipe-paging":""].filter(e=>""!==e).join(" ");return B`
    <ha-card
      class=${T}
      style=${um(e)}
      tabindex=${s&&_===V?"0":V}
      role=${v?"button":V}
      aria-busy=${r?"true":"false"}
      @keydown=${i.keyDown}
      @keyup=${i.keyUp}
      @click=${i.click}
      @pointerdown=${i.pointerDown}
      @pointermove=${i.pointerMove}
      @pointerup=${i.pointerUp}
      @pointercancel=${i.pointerCancel}
      @pointerleave=${i.pointerLeave}
      @lostpointercapture=${i.lostPointerCapture}
      @touchmove=${i.touchMove??V}
      @touchend=${i.touchEnd??V}
      @selectstart=${i.nativeDrag??V}
      @dragstart=${i.nativeDrag??V}
    >
      ${w}
      ${c.refresh?V:"done"===m||"failed"===m?(S=m,B`<div
    class=${`loading-indicator ${If[S]}`}
    aria-hidden="true"
  >
    <svg class="loading-indicator-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d=${Ff[S]}></path>
    </svg>
  </div>`):r||"turning"===m?B`
                  <div
                    class=${"turning"===m?"loading-indicator":"loading-indicator unasked"}
                    role="status"
                    aria-live="polite"
                    title="Loading"
                  >
                    <div class="spinner" aria-hidden="true"></div>
                  </div>
                `:V}

      <!-- Title is always rendered with the same structure, even if empty.
           A templated title holds the h1 open from first paint, so the header
           does not gain 16px of margin the moment its value arrives. That is a
           claim about the *pending* window only: once a value is in hand the
           header behaves exactly as it would for a static title of the same
           text, so a template resolving to an empty string collapses back to
           the zero-height placeholder rather than leaving an empty heading
           taking up space forever. -->
      <div class=${k}>
        ${x??b}
      </div>

      <!-- Content container is always present -->
      <div class=${$}>${n}</div>
      ${d}
    </ha-card>
  `;var S}(e,this.effectiveTitle,n,t,this.isLoading,this.isTitlePending,this.effectiveView,this._hasTapAction,this._hasHoldAction,this._renderFetchErrorNotice(),s,this._hostsControls(s,i),this._pageRequested!==this._pageShown&&!this.isInitialLoad,this._refreshPhase,this._swipeAvailable,this._tapControl())}_focusedTapTarget(){const e=this.shadowRoot?.activeElement;return e?e.matches("ha-card")?"card":e.matches(".card-tap-control")?"control":null:null}_keepTapFocus(){const e=this._tapFocusBefore;if(this._tapFocusBefore=null,!e)return;const t=this.shadowRoot?.querySelector("ha-card"),n=t?.querySelector(":scope > .card-tap-control"),i=n??(t?.hasAttribute("tabindex")?t:null);i&&i!==this.shadowRoot?.activeElement&&(null===this._focusedTapTarget()&&this.shadowRoot?.activeElement||i.focus({preventScroll:!0}))}_tapControl(){if(!this._hasTapAction)return;const e=this.config.tap_action?.action,t=e=>wa(this,this.config,"tap",this._cardActions(null,k_(e)),this._shownEntries),n=this._commandName(e);if(n)return{label:n.word??n.fallback,activate:t};const i=this._shownEntries[0],r="string"==typeof i?i:i?.entity;return{label:this.effectiveTitle?.trim()||(r?this._calendarName(r):""),expanded:"expand"===e&&this.hasCompactModeLimits()?this.isExpanded:void 0,activate:t}}_headerToolbar(){const e=this._legend(),t={heading:this._monthHeading(void 0!==e&&!e.folded),navigation:this._dateNavigation(),legend:e,viewSwitcher:this._viewSwitcher(),reset:this._resetButton(),refresh:this._refreshButton(),search:this._searchButton(),addEvent:this._addEventButton(),customButtons:this._customButtons()};return this._toolbarRow=this._actionRow(t),t.startFold=this._startFold(this._toolbarRow),this._toolbarLabelMinWidthPx=this._toolbarLabelMinWidth(t),{labeled:this._toolbarLabeledFor(t),...t}}_toolbarLabeledFor(e){const t=this._toolbarLabelMinWidth(e);if(null===this._toolbarWidthPx||null===t)return!1;const n=this._toolbarLabelsOverflowed,i=this._toolbarLabelSignature(e);return!(n&&n.signature===i&&this._toolbarWidthPx<=n.widthPx)&&this._toolbarWidthPx>=t}_toolbarLabelMinWidth(e){if(!e.viewSwitcher)return null;const t=[e.reset,e.refresh,e.search].filter(e=>void 0!==e).length;return Se.TOOLBAR_SWITCHER_LABEL_MIN_WIDTH+e_(Lf(e).length)+e_(t)}_toolbarLabelSignature(e){return[this.effectiveLanguage,e.viewSwitcher?"views":"",e.addEvent?"add":"",e.reset?"reset":"",e.refresh?"refresh":"",e.search?"search":"",e.legend?.folded?"filter":"",`buttons:${e.customButtons?.length??0}`].join("\0")}_syncToolbarLabelFit(){const e=this.renderRoot.querySelector(".toolbar-actions");if(!e||!e.querySelector(".toolbar-button-label"))return;const t=e.getBoundingClientRect();if(0===t.width)return;const n=[...e.querySelectorAll(".toolbar-button, .view-switcher")].map(e=>e.getBoundingClientRect()).filter(e=>e.width>0&&e.height>0);if(0===n.length)return;const i=n.some(e=>e.right>t.right+.5||e.left<t.left-.5),r=Math.min(...n.map(e=>e.bottom)),a=n.some(e=>e.top>r-.5);(i||a)&&(Dt(`View switcher words do not fit at ${this._toolbarWidthPx}px`),this._toolbarLabelsOverflowed={widthPx:this._toolbarWidthPx??0,signature:this._toolbarLabelSignature(this._headerToolbar())},this.requestUpdate())}_hostsControls(e,t){return void 0!==e.navigation||void 0!==e.legend||void 0!==e.viewSwitcher||void 0!==e.reset||void 0!==e.refresh||void 0!==e.search||void 0!==e.addEvent||void 0!==e.customButtons||t}_renderFetchErrorNotice(){const e=this._shownFailures;return this.isInitialLoad||0===e.length?V:function(e,t,n){const i=mm(Io(t).loadFailed,hm(t,n));return B`
    <div class="fetch-error" role="status">
      <ha-icon class="fetch-error-icon" icon="mdi:alert-circle-outline"></ha-icon>
      <span class="fetch-error-text">${i} ${e.join(", ")}</span>
    </div>
  `}(e.map(e=>Cp(e,this.config,this.hass)),this.effectiveLanguage,this.hass)}_calendarName(e){return Dp(e,this.config,this.hass)}_haString(e){const t=this.hass?.localize?.(e);return t&&t!==e?t:void 0}_newEventDate(){const e=this._pageRange(this._pageShown);return function(e,t,n=new Date){const i=new Date(e.getFullYear(),e.getMonth(),e.getDate()+t);return n>=e&&n<i?new Date(n):new Date(e)}(e.start,e.days)}_addEventButton(){const e=Jn(this.config);if(e.show&&e.addEvent&&0!==this._writableCalendars.length)return{label:Ca(this.safeHass),onActivate:(e,t)=>{t&&this._releasePressFocus();const n=k_(e);this._addEventAt(void 0,n&&{...n,...t&&{pointerType:t.pointerType},below:!0})}}}_addEventAt(e,t,n){const i=e?.timestamp??n,r=void 0===i?function(e){const t=new Date(e.getFullYear(),e.getMonth(),e.getDate(),e.getHours());return{allDay:!1,start:t,end:new Date(t.getTime()+36e5)}}(this._newEventDate()):function(e,t,n=new Date){const i=new Date(e);if(i.setHours(0,0,0,0),"all-day"===t)return{allDay:!0,start:i,end:new Date(i)};const r=new Date(i);return void 0===t?r.setHours(n.getHours(),0,0,0):r.setHours(0,t,0,0),{allDay:!1,start:r,end:new Date(r.getTime()+36e5)}}(i,e?.allDay?"all-day":e?.minute),a=void 0!==e&&(void 0!==e.minute||!0===e.allDay);this._openCreateEventDialog(r,t,a)}_openCreateEventDialog(e,t,n=!1){if(this._isBeingEdited)return Dt("Not opening a new event while the card is being edited"),void this._dropNew();const i=this._writableCalendars,r=Aa(i,this._activeHiddenCalendars);if(!r)return void this._dropNew();let a=this._draft?this._newShown:null;a||this._dropNew(),n&&this._drawsNewEvents&&(a??={times:e,title:"",context:this._draftContext(),inPopover:!1,saved:!1,arrived:!1},a.times=e,a.calendarId=r,a.inPopover=!0,this._newShown=a,this._paintNew());const o=null!==a&&a.inPopover;this._openPopover({mode:"new",calendarId:r,calendars:i.map(e=>this._popoverCalendar(e)),times:e,canEdit:!0,canDelete:!1,anchor:t,updated:(...e)=>{const t=o&&a&&this._newShown===a?a:null;return t&&(t.saved=!0),this._refreshAfterWrite(e.length?{ids:e}:{feature:1},t?()=>this._newArrived(t):void 0)},changed:o?e=>{this._newShown===a&&this._followNew(e)}:void 0,closed:o?()=>{this._newShown===a&&this._newClosed()}:void 0})}_monthHeading(e){if(!Jn(this.config).show)return;const t=new Date,n=this.effectiveLanguage,i=this._pageRange(this._pageRequested,t),r=!e&&this._monthFormShort(),a=r?"short":"long";return{text:Cc(bc(i,this._listsLatestFirst),n,a),reserve:Ec(n,a),full:Ec(n,"long"),short:r,range:Tc(i,n,t),languageMark:hm(n,this.hass)}}_monthFitSignature(){return[this.effectiveLanguage,this.effectiveView,String(this._toolbarFontGeneration),this._wantsNavigation?"navigation":"",String(this.config.title_font_size??"")].join("\0")}_monthFormShort(){const e=this._monthFit;return!(!e||null===this._toolbarWidthPx)&&e.signature===this._monthFitSignature()&&this._toolbarWidthPx<e.fullFromPx}_syncMonthFit(){if(!this.isConnected)return;const e=this.renderRoot.querySelector(".toolbar-heading"),t=e?.querySelector(".toolbar-month"),n=t?.querySelector(".toolbar-month-probe");if(!e||!t||!n)return;this._watchToolbarFonts();const i=this.getBoundingClientRect().width,r=n.getBoundingClientRect().width,a=e.getBoundingClientRect(),o=t.getBoundingClientRect();if(i<=0||r<=0||a.width<=0)return;const s=getComputedStyle(e),l=parseFloat(s.columnGap)||0,d=e.querySelector(".date-navigation"),c=e.querySelector(".toolbar-heading-end")?(d?.getBoundingClientRect().width??0)+l:0,u=i+r-(("rtl"===s.direction?o.right-a.left-(parseFloat(s.paddingLeft)||0):a.right-(parseFloat(s.paddingRight)||0)-o.left)-c)-.5,h=this._monthFormShort();this._monthFit={signature:this._monthFitSignature(),fullFromPx:u},this._monthFormShort()!==h&&(Dt(`Month heading ${h?"fits in full":"shortened"} at ${Math.round(i)}px`),this.requestUpdate())}_syncHeadingMiddle(){const e=this.renderRoot.querySelector(".toolbar-heading"),t=e?.querySelector(".toolbar-month-cap");if(!e||!t)return;const n=e.getBoundingClientRect();if(n.height<=0)return;const i=t.getBoundingClientRect(),r=n.bottom-(parseFloat(getComputedStyle(e).paddingBottom)||0),a=`${Math.max(0,r-(i.top+i.bottom)/2).toFixed(2)}px`;e.style.getPropertyValue("--calendar-card-heading-middle")!==a&&e.style.setProperty("--calendar-card-heading-middle",a)}_dateNavigation(){if(!this._wantsNavigation)return;const e=new Date,t=this.effectiveLanguage,n=this._pageRange(this._pageRequested,e),i=this._listsLatestFirst;return{homeName:Ic(this._homeRange(e),t,e,i),languageMark:hm(t,this.hass),previousName:this._haString("ui.common.previous"),nextName:this._haString("ui.common.next"),inert:this._isBeingEdited,pickerValue:_c(bc(n,i)),homeConfirming:this._homeConfirming&&null===this._pageRequested,onPrevious:()=>this._stepPage(-1),onHome:()=>this._pressHome(),onNext:()=>this._stepPage(1),onPick:e=>this._pickDate(e)}}_pressHome(){const e=null!==this._pageRequested;this._goToPage(null),e&&null===this._pageRequested&&(clearTimeout(this._homeConfirmTimer),this._homeConfirming=!0,this._homeConfirmTimer=setTimeout(()=>{this._homeConfirmTimer=void 0,this._homeConfirming=!1,this.requestUpdate()},1e3))}_settleHomeConfirmation(){clearTimeout(this._homeConfirmTimer),this._homeConfirmTimer=void 0,this._homeConfirming=!1}_stepPage(e){const t=this._pageRange(this._pageRequested);this._goToPage(function(e,t,n){return vc(e,n*t)}(t.start,t.days,e))}_pickDate(e){if(!/^\d{4}-\d{2}-\d{2}$/.test(e))return;const t=yc(e);if(isNaN(t.getTime()))return;const n=this._homeRange();this._goToPage(xc(n,t)?null:function(e,t,n){const i=Math.max(1,n),r=as(t.start,gc(e));return vc(t.start,Math.floor(r/i)*i)}(t,n,n.days))}_goToPage(e){if(this._isBeingEdited)return void Dt("Not paging while the card is being edited");const t=_c(this._homeRange().start),n=null===e?null:_c(e),i=null===n||n===t?null:n;i!==this._pageRequested&&(Dt(`Paging to ${i??"home"}`),this._requestPage(i),this.requestUpdate(),this._loadPage())}_requestPage(e){this._pageRequested=e,this._swipeArrival=null,this._searchRing&&this._searchRing.page!==e&&this._settleSearchRing()}_loadPage(){if(null===this._pageRequested&&this._homeStale)return this._homeStale=!1,void this.updateEvents("network");this.updateEvents("page")}_refreshButton(){const e=Jn(this.config);if(e.show&&e.refresh)return{label:this._haString("ui.common.refresh"),phase:"idle"!==this._refreshPhase?this._refreshPhase:this.isLoading?"turning":"idle",unasked:"idle"===this._refreshPhase&&this.isLoading,onActivate:()=>{this._isBeingEdited?Dt("Not refreshing from the toolbar while the card is being edited"):this._requestRefresh()}}}_requestRefresh(){if("idle"!==this._refreshPhase)return void Dt("Not refreshing: the last refresh is still showing");if(this.isLoading||this.isInitialLoad)return void Dt("Not refreshing: a load is already under way");Dt("Refreshing on request");const e=++this._refreshTicket,t=Date.now();this._setRefreshPhase("turning");const n=this.refreshEvents(),i=this._eventRequestGeneration;n.then(()=>!1,()=>!0).then(n=>{e===this._refreshTicket&&(i!==this._eventRequestGeneration&&this.isLoading?this._refreshAwaitsLoad={ticket:e,startedAt:t}:this._showRefreshOutcome(t,n||this._shownFailures.length>0))})}_showRefreshOutcome(e,t){const n=Math.max(0,1e3-(Date.now()-e));this._refreshPhaseTimer=setTimeout(()=>{this._setRefreshPhase(t?"failed":"done"),this._refreshPhaseTimer=setTimeout(()=>this._settleRefreshPhase(),1500)},n)}_syncReplacedRefresh(){const e=this._refreshAwaitsLoad;e&&!this.isLoading&&(this._refreshAwaitsLoad=null,e.ticket===this._refreshTicket&&this._showRefreshOutcome(e.startedAt,this._shownFailures.length>0))}_setRefreshPhase(e){this._refreshPhase=e,this.requestUpdate()}_settleRefreshPhase(){this._refreshTicket++,this._refreshAwaitsLoad=null,clearTimeout(this._refreshPhaseTimer),this._refreshPhaseTimer=void 0,"idle"!==this._refreshPhase&&this._setRefreshPhase("idle")}_searchButton(){const e=Jn(this.config);if(e.show&&e.search&&e.navigation)return{label:this._haString("ui.common.search"),onActivate:(e,t)=>this._openSearch(e,t)}}_openSearch(e,t){if(this._isBeingEdited)return void Dt("Not searching while the card is being edited");const n=this._search??=new Yc(()=>this._searchHost(),{picked:e=>this._pickSearchResult(e),gone:()=>this._searchGone()});if(n.isOpen)return;n.prepare(),e.focus({preventScroll:!0}),this._searchPanelGone=!1;const i=k_(e),r={source:n,anchor:i&&{...i,...t&&{pointerType:t.pointerType},below:!0},hang:"rtl"===getComputedStyle(e).direction?"right":"left",dark:this._panelsDark(),language:this.effectiveLanguage,pastOpacity:this.effectiveConfig.past_event_opacity/100},a=new Event("show-dialog",{bubbles:!0,composed:!0});a.detail={dialogTag:eg,dialogImport:()=>customElements.whenDefined(eg),dialogParams:r},this.dispatchEvent(a),Dt("Opened the search panel")}_searchHost(){return{hass:this.hass,config:this.config,viewConfig:this.effectiveConfig,view:this.effectiveView,language:this.effectiveLanguage,hidden:this._activeHiddenCalendars,visibility:this._visibility,held:this.events,today:this._haString("ui.components.calendar.today"),colorOf:e=>this._resolvedColor(Zd(e._entityId,this.config,void 0,e,Qi())),nameOf:e=>this._calendarName(e),failedNameOf:e=>Cp(e,this.config,this.hass)}}_pickSearchResult(e){this._settleSearchRing(),this._pickDate(e.day),this._searchRing={target:e.target,page:this._pageRequested,focus:!0},Dt(`Search: paging to ${e.day} to ring a result`),this.requestUpdate()}_searchGone(){const e=e=>requestAnimationFrame(()=>setTimeout(e));e(()=>e(()=>{this._searchPanelGone=!0,this.requestUpdate()}))}_syncSearchRing(){const e=this._searchRing;if(e){if(void 0===e.until)if(this._searchRingDrawn)e.until=Date.now()+2e3,clearTimeout(this._searchRingTimer),this._searchRingTimer=setTimeout(()=>this._settleSearchRing(),2e3);else if(this._pageShown===e.page&&!this.isLoading&&!this.isInitialLoad)return Dt("Search: the page does not draw the result picked; nothing to ring"),void(this._searchRing=null);if(e.focus&&void 0!==e.until&&this._searchPanelGone){e.focus=!1;const t=this.renderRoot.querySelector(".search-ring"),n=t?.matches(E_)?t:t?.querySelector(E_);n?.focus({preventScroll:!0}),t?.scrollIntoView?.({block:"nearest",inline:"nearest"})}}}_settleSearchRing(){clearTimeout(this._searchRingTimer),this._searchRingTimer=void 0,null!==this._searchRing&&(this._searchRing=null,this.requestUpdate())}_panelsDark(){return this.safeHass?.themes?.darkMode??window.matchMedia?.("(prefers-color-scheme: dark)")?.matches??!1}get _wantsLegend(){const e=Jn(this.config);return e.show&&!1!==e.legend&&bf(this.config.entities).length>0}get _wantsLegendChips(){return this._wantsLegend&&"chips"===Jn(this.config).legend}_legend(){if(!this._wantsLegend)return;const e=this._legendCalendarIds();if(0===e.length)return;const t=this._activeHiddenCalendars,n=Qi(),i=Io(this.effectiveLanguage),r=e.map(e=>({id:e,name:this._calendarName(e),color:Zd(e,this.effectiveConfig,void 0,void 0,n),shown:!t.has(e)}));return{calendars:r,name:this._haString("ui.components.calendar.my_calendars"),folded:!this._wantsLegendChips||this._legendFoldedFor(this._legendSignature(r)),inert:this._isBeingEdited,showAllLabel:i.showAll,hideAllLabel:i.hideAll,onToggle:e=>this._toggleCalendar(e),onSetAll:e=>this._setAllCalendars(e)}}_legendSignature(e){return[this.effectiveLanguage,this.effectiveView,String(this._toolbarFontGeneration),this._wantsNavigation?"navigation":"",String(this.config.title_font_size??""),...e.map(e=>`${e.id}${e.name}`)].join("\0")}_legendFoldedFor(e){const t=this._legendFold;return!(!t||t.signature!==e)&&(null===this._legendWidthPx||this._legendWidthPx<t.unfoldAtPx)}_legendMenuMayStayOpen(){return!(!this._wantsLegend||this._isBeingEdited||this.hidden)&&!0===this._legend()?.folded}_toggleCalendar(e){const t=new Set(this._hiddenCalendars);t.has(e)?t.delete(e):t.add(e),this._hideCalendars(t,`${t.has(e)?"Hid":"Showed"} ${e}`)}_setAllCalendars(e){const t=this._legendCalendarIds(),n=[...this._hiddenCalendars].filter(e=>!t.includes(e)),i=new Set(e?n:[...n,...t]);this._hideCalendars(i,e?"Showed every calendar":"Hid every calendar")}_hideCalendars(e,t){this._isBeingEdited?Dt("Not hiding calendars while the card is being edited"):this._wantsLegend&&(this._hiddenCalendars=e.size>0?e:L_,null!==this._configFingerprint&&(this._hiddenMatchesStorage=function(e,t,n=o_(),i=Date.now()){return m_(e,{hidden:l_(t)},n,i)}(this._configFingerprint,[...e])),this._announceHiddenCalendars([...e],this._hiddenMatchesStorage),Dt(t),this.requestUpdate())}_announceHiddenCalendars(e,t){if(null===this._configFingerprint)return;const n={fingerprint:this._configFingerprint,hidden:e,stored:t,source:this};window.dispatchEvent(new CustomEvent(gf,{detail:n}))}_syncLegendFit(e=!0){if(!this.isConnected||!this._wantsLegendChips)return;this._watchToolbarFonts();const t=this.getBoundingClientRect().width;if(t<=0)return;if(e||null===this._legendWidthPx)this._legendWidthPx=t;else if(Math.abs(t-this._legendWidthPx)>.5)return void this._scheduleLegendFit();const n=this.renderRoot.querySelector(".toolbar-legend"),i=n?.querySelector(".legend-chips");if(!n||!i){const n=null!==this.renderRoot.querySelector(".legend-button");return void(e&&n&&!1===this._legend()?.folded&&(this._legendUnfoldedAtPx=t,this.requestUpdate()))}const r=i.getBoundingClientRect().width,a=this._legendChipsRoom(n);if(r<=0||null===a)return;if(r<=a+.5)return void(this._legendUnfoldedAtPx=null);const o=this._legend();if(!o)return;const s=Math.ceil(t+r-a)+Se.LEGEND_UNFOLD_MARGIN;this._legendWidthPx=t,this._legendFold={signature:this._legendSignature(o.calendars),unfoldAtPx:Math.max(s,(this._legendUnfoldedAtPx??0)+1)},this._legendUnfoldedAtPx=null,Dt(`Legend chips need ${Math.ceil(r)}px of ${Math.floor(a)}px; folded until ${this._legendFold.unfoldAtPx}px`),this.requestUpdate()}_legendChipsRoom(e){const t=e.parentElement,n=t?.querySelector(".toolbar-month-probe");if(!t||!n)return null;const i=t.getBoundingClientRect().width,r=n.getBoundingClientRect().width;if(i<=0||r<=0)return null;const a=getComputedStyle(t),o=getComputedStyle(e),s=e=>parseFloat(e)||0,l=t.querySelector(".date-navigation"),d=t.querySelector(".toolbar-month"),c=d?s(getComputedStyle(d).marginInlineStart):0;return i-s(a.paddingLeft)-s(a.paddingRight)-(r+c)-(l?.getBoundingClientRect().width??0)-2*s(a.columnGap)-s(o.paddingLeft)-s(o.paddingRight)-s(o.marginLeft)-s(o.marginRight)}_scheduleLegendFit(){this._wantsLegendChips&&null===this._legendFitRaf&&(this._legendFitRaf=requestAnimationFrame(()=>{this._legendFitRaf=null,this._syncLegendFit()}))}_watchToolbarFonts(){if(this._toolbarFontsCleanup)return;const e="undefined"==typeof document?void 0:document.fonts;if(!e||"function"!=typeof e.addEventListener)return;const t=()=>{this.isConnected&&Jn(this.config).show&&(this._toolbarFontGeneration++,this.requestUpdate())};e.addEventListener("loadingdone",t),this._toolbarFontsCleanup=()=>e.removeEventListener("loadingdone",t)}_customButtons(){const e=Jn(this.config);if(e.show&&0!==e.buttons.length)return e.buttons.map(e=>({icon:e.icon.trim(),...this._customButtonNames(e),onActivate:(t,n)=>this._pressCustomButton(e,t,n)}))}_customButtonNames(e){const t="string"==typeof e.name?e.name.trim():"";if(""!==t)return{label:t,tooltip:t};const n=this._commandName(e.tap_action?.action);if(n)return{label:n.word??n.fallback,tooltip:n.word};const i=e.icon.trim(),r=function(e){return e.slice(e.indexOf(":")+1).split(/[-_\s]+/).filter(e=>""!==e).join(" ")}(i)||i;return I_.has(i)||(I_.add(i),Dt(`Toolbar button ${i} has no name; screen readers hear "${r}"`)),{label:r,tooltip:void 0}}_commandName(e){switch(e){case we:return{word:this._haString("ui.common.back"),fallback:"Back"};case"refresh":return{word:this._haString("ui.common.refresh"),fallback:kf};case _e:return{word:Ca(this.safeHass),fallback:Da};case ye:return{word:this._haString("ui.common.reset"),fallback:$f};default:return}}_pressCustomButton(e,t,n){if(this._isBeingEdited)return void Dt("Not running a toolbar button while the card is being edited");n&&this._releasePressFocus();const i=k_(t),r=i&&{...i,...n&&{pointerType:n.pointerType},below:!0};!function(e,t,n,i={}){const r=t.tap_action;r&&"string"==typeof r.action&&"none"!==r.action&&(ya(r,i)||(_a(e,{entity:t.entity??va(n),tap_action:r},"tap"),Dt(`Delegated toolbar button action (${r.action}) to HA native handler`)))}(this,e,this._shownEntries,this._cardActions(null,r))}_actionRow(e){const t=[];return e.reset&&t.push("reset"),e.refresh&&t.push("refresh"),e.search&&t.push("search"),{start:Lf(e),end:t,views:e.viewSwitcher?.views.length??0,insetPx:Se.TOOLBAR_ROW_INSET[this.effectiveView]}}_startFold(e){const t=this._toolbarWidthPx??0,n=t_(e,t,this._startFoldAtLeast(e,t));if(0!==n.overflow.length)return{plan:n,menuName:this._haString("ui.common.menu"),inert:this._isBeingEdited}}_startHidden(e){const t=this._toolbarRow;if(null===t)return 0;const n=e??0;return t_(t,n,this._startFoldAtLeast(t,n)).overflow.length}_startFoldAtLeast(e,t){const n=this._startFoldGuard;return null===n||n.widthPx!==t?0:n.signature===JSON.stringify(e)?n.atLeast:0}_syncStartFoldFit(){const e=this._toolbarWidthPx,t=this._toolbarRow,n=this.renderRoot.querySelector(".toolbar-actions");if(null===e||null===t||!n)return;if(n.querySelector(".toolbar-button-label"))return;const i=n.getBoundingClientRect();if(0===i.width)return;const r=[...n.querySelectorAll(".toolbar-button, .view-switcher")].map(e=>e.getBoundingClientRect()).filter(e=>e.width>0&&e.height>0);if(0===r.length)return;const a=r.some(e=>e.right>i.right+.5||e.left<i.left-.5),o=Math.min(...r.map(e=>e.bottom)),s=r.some(e=>e.top>o-.5);if(!a&&!s)return;const l=this._startHidden(e);l>=t.start.length-1||t.start.length<3||(Dt(`Toolbar row does not fit on one line at ${e}px; folding one more control`),this._startFoldGuard={widthPx:e,signature:JSON.stringify(t),atLeast:l+1},this.requestUpdate())}_startMenuMayStayOpen(){return!this._isBeingEdited&&!this.hidden&&void 0!==this._headerToolbar().startFold}_focusedStartControl(){const e=this.renderRoot.activeElement;return e instanceof HTMLElement&&!0===e.parentElement?.classList.contains("toolbar-start")?e.classList.contains("add-event-button")?{kind:"add"}:e.classList.contains("custom-button")?{kind:"button",index:[...this.renderRoot.querySelectorAll(".toolbar-start > .custom-button")].indexOf(e)}:null:null}_handFocusToMenu(){const e=this._focusBeforeFold;this._focusBeforeFold=null;const t=this._toolbarRow,n=this._toolbarWidthPx;if(null===e||null===t||null===n)return;const{overflow:i}=t_(t,n,this._startFoldAtLeast(t,n));i.some(t=>t.kind===e.kind&&("button"!==t.kind||"button"===e.kind&&t.index===e.index))&&this.renderRoot.querySelector(".custom-menu-button")?.focus({preventScroll:!0})}get _wantsViewSwitcher(){const e=Jn(this.config);return e.show&&e.viewSwitcher}_viewFits(e){return!cr.has(e)||e===this._effectiveView||ga(e,this.config,this._measuredWidthPx).view===e}_offeredViewsKey(){return this._wantsViewSwitcher?dr.filter(e=>this._viewFits(e)).join(","):""}_viewSwitcher(){if(!this._wantsViewSwitcher)return;const e=this._isBeingEdited,t=Io(this.effectiveLanguage),n=dr.map(n=>({view:n,label:t[Sf[n]],available:e||this._viewFits(n)}));return n.filter(e=>e.available).length<2?void 0:{views:n,selected:this.effectiveView,onSelect:e=>this._chooseView(e)}}_chooseView(e){if(this._isBeingEdited)return void Dt("Not switching views while the card is being edited");if(!this._wantsViewSwitcher||!this._viewFits(e))return;const t=e===this.config.view?null:e;if(null!==this._configFingerprint&&function(e,t,n=o_(),i=Date.now()){m_(e,{view:t},n,i)}(this._configFingerprint,t??void 0),t===this._viewChoice&&e===this._effectiveView)return;this._viewChoice=t;const n=ga(this.requestedView,this.config,this._measuredWidthPx);Dt(`Switched to ${e}, drawn as ${n.view}/${n.columns}`),this._effectiveView=n.view,this._columnCount=n.columns,this.requestUpdate()}get _hasExpandAction(){const e=this.config.tap_action,t=this.config.hold_action;return"expand"===e?.action||"expand"===t?.action}get _hasResettable(){return this._wantsNavigation||this._wantsViewSwitcher||this._wantsLegend||this._hasExpandAction}get _wantsReset(){const e=Jn(this.config);return e.show&&e.reset&&this._hasResettable}get _canReset(){return!this._isBeingEdited&&(this._hasResettable||this.isExpanded&&this.hasCompactModeLimits())}get _differsFromConfiguration(){return!this._isBeingEdited&&(null!==this._pageRequested||this._viewChoiceShows||this._legendHidesAShownCalendar||this.isExpanded&&this.hasCompactModeLimits())}get _viewChoiceShows(){return null!==this._viewChoice&&ga(this.config.view,this.config,this._measuredWidthPx).view!==this._effectiveView}_resetButton(){if(this._wantsReset)return{label:this._haString("ui.common.reset"),active:this._differsFromConfiguration,confirmation:this._resetConfirmation??void 0,onActivate:()=>this._resetToConfiguration()}}_confirmReset(){clearTimeout(this._resetConfirmTimer),this._resetConfirmation="showing",this._resetConfirmTimer=setTimeout(()=>{this._resetConfirmation="leaving",this.requestUpdate(),this._resetConfirmTimer=setTimeout(()=>{this._resetConfirmTimer=void 0,this._resetConfirmation=null,this.requestUpdate()},200)},1e3)}_settleResetConfirmation(){clearTimeout(this._resetConfirmTimer),this._resetConfirmTimer=void 0,this._resetConfirmation=null}_resetToConfiguration(){if(this._isBeingEdited)Dt("Not resetting while the card is being edited");else if(this._canReset){if(Dt("Resetting to the configuration"),null!==this._configFingerprint&&(this._hiddenMatchesStorage=function(e,t=o_()){const n=u_(t);return Object.prototype.hasOwnProperty.call(n,e)?(delete n[e],h_(t,n)):null!==t}(this._configFingerprint)),null!==this._viewChoice){this._viewChoice=null;const e=ga(this.requestedView,this.config,this._measuredWidthPx);this._effectiveView=e.view,this._columnCount=e.columns}this._hiddenCalendars.size>0&&(this._hiddenCalendars=L_,this._announceHiddenCalendars([],this._hiddenMatchesStorage)),this.isExpanded=!1,this._goToPage(null),this._wantsReset&&this._confirmReset(),this.requestUpdate()}}_resetFromAction(){this._differsFromConfiguration?this._resetToConfiguration():Dt("Nothing to reset")}};R_.getStubConfig=Fi,v_([me({attribute:!1})],R_.prototype,"hass",2),v_([me({attribute:!1})],R_.prototype,"config",2),v_([me({attribute:!1})],R_.prototype,"events",2),v_([me({attribute:!1})],R_.prototype,"isInitialLoad",2),v_([me({attribute:!1})],R_.prototype,"isLoading",2),v_([me({attribute:!1})],R_.prototype,"isExpanded",2),v_([me({attribute:!1})],R_.prototype,"weatherForecasts",2),v_([me({attribute:!1})],R_.prototype,"renderedTitle",2),v_([me({type:Boolean})],R_.prototype,"preview",2),v_([me({type:Boolean})],R_.prototype,"editMode",2),R_=v_([(e=>(t,n)=>{void 0!==n?n.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)})("calendar-card-pro")],R_);const O_=customElements.get("calendar-card-pro");O_&&(O_.getStubConfig=Fi),window.customCards=window.customCards||[],window.customCards.push({type:"calendar-card-pro",name:"Calendar Card Pro",preview:!0,description:"A calendar card that supports multiple calendars with individual styling.",documentationURL:"https://calendar-card-pro.alexpfau.com",getEntitySuggestion:function(e,t){if("string"!=typeof t||"calendar"!==t.split(".")[0])return null;if(!e||"object"!=typeof e)return null;const n=e.states;if(!n||"object"!=typeof n||!n[t])return null;const i=function(e){if(!e||"object"!=typeof e)return;const t=Object.keys(e).filter(e=>e.startsWith("weather."));return 1===t.length?t[0]:void 0}(n);return[{label:"Interactive List",config:{...Ii([t]),...Ni(i),grid_options:{...Pi}}},{label:"Interactive Time Grid",config:{...Ii([t]),view:"grid",...Ni(i),grid_options:{...Pi}}},{config:{...Ii([t]),grid_options:{...Pi}}},{label:"Columns",config:{...Ii([t]),view:"column",grid_options:{...Pi}}},{label:"Time Grid",config:{...Ii([t]),view:"grid",grid_options:{...Pi}}}]}});export{A_ as GRID_DETAIL_ROWS,__ as adoptEditorComponent,C_ as fittedGridDetailLines,M_ as gridContentOverflows,D_ as resolveLineHeightPx};
