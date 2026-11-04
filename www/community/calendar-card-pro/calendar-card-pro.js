const e=globalThis,t=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,n=Symbol(),i=new WeakMap;let r=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==n)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const n=this.t;if(t&&void 0===e){const t=void 0!==n&&1===n.length;t&&(e=i.get(n)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),t&&i.set(n,e))}return e}toString(){return this.cssText}};const a=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,n,i)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(n)+e[i+1],e[0]);return new r(i,e,n)},o=t?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const n of e.cssRules)t+=n.cssText;return(e=>new r("string"==typeof e?e:e+"",void 0,n))(t)})(e):e,{is:s,defineProperty:l,getOwnPropertyDescriptor:d,getOwnPropertyNames:c,getOwnPropertySymbols:u,getPrototypeOf:h}=Object,m=globalThis,p=m.trustedTypes,_=p?p.emptyScript:"",g=m.reactiveElementPolyfillSupport,f=(e,t)=>e,v={toAttribute(e,t){switch(t){case Boolean:e=e?_:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=null!==e;break;case Number:n=null===e?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch(e){n=null}}return n}},y=(e,t)=>!s(e,t),w={attribute:!0,type:String,converter:v,reflect:!1,useDefault:!1,hasChanged:y};Symbol.metadata??=Symbol("metadata"),m.litPropertyMetadata??=new WeakMap;let b=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=w){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const n=Symbol(),i=this.getPropertyDescriptor(e,n,t);void 0!==i&&l(this.prototype,e,i)}}static getPropertyDescriptor(e,t,n){const{get:i,set:r}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:i,set(t){const a=i?.call(this);r?.call(this,t),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??w}static _$Ei(){if(this.hasOwnProperty(f("elementProperties")))return;const e=h(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(f("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(f("properties"))){const e=this.properties,t=[...c(e),...u(e)];for(const n of t)this.createProperty(n,e[n])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const n=this._$Eu(e,t);void 0!==n&&this._$Eh.set(n,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const n=new Set(e.flat(1/0).reverse());for(const e of n)t.unshift(o(e))}else void 0!==e&&t.push(o(e));return t}static _$Eu(e,t){const n=t.attribute;return!1===n?void 0:"string"==typeof n?n:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const n of t.keys())this.hasOwnProperty(n)&&(e.set(n,this[n]),delete this[n]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const n=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((n,i)=>{if(t)n.adoptedStyleSheets=i.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const t of i){const i=document.createElement("style"),r=e.litNonce;void 0!==r&&i.setAttribute("nonce",r),i.textContent=t.cssText,n.appendChild(i)}})(n,this.constructor.elementStyles),n}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$AK(e,n)}_$ET(e,t){const n=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,n);if(void 0!==i&&!0===n.reflect){const r=(void 0!==n.converter?.toAttribute?n.converter:v).toAttribute(t,n.type);this._$Em=e,null==r?this.removeAttribute(i):this.setAttribute(i,r),this._$Em=null}}_$AK(e,t){const n=this.constructor,i=n._$Eh.get(e);if(void 0!==i&&this._$Em!==i){const e=n.getPropertyOptions(i),r="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:v;this._$Em=i;const a=r.fromAttribute(t,e.type);this[i]=a??this._$Ej?.get(i)??a,this._$Em=null}}requestUpdate(e,t,n,i=!1,r){if(void 0!==e){const a=this.constructor;if(!1===i&&(r=this[e]),n??=a.getPropertyOptions(e),!((n.hasChanged??y)(r,t)||n.useDefault&&n.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,n))))return;this.C(e,t,n)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:n,reflect:i,wrapped:r},a){n&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==r||void 0!==a)||(this._$AL.has(e)||(this.hasUpdated||n||(t=void 0),this._$AL.set(e,t)),!0===i&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,n]of e){const{wrapped:e}=n,i=this[t];!0!==e||this._$AL.has(t)||void 0===i||this.C(t,void 0,n,i)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};b.elementStyles=[],b.shadowRootOptions={mode:"open"},b[f("elementProperties")]=new Map,b[f("finalized")]=new Map,g?.({ReactiveElement:b}),(m.reactiveElementVersions??=[]).push("2.1.2");const M=globalThis,k=e=>e,x=M.trustedTypes,$=x?x.createPolicy("lit-html",{createHTML:e=>e}):void 0,D="$lit$",S=`lit$${Math.random().toFixed(9).slice(2)}$`,T="?"+S,L=`<${T}>`,Y=document,C=()=>Y.createComment(""),E=e=>null===e||"object"!=typeof e&&"function"!=typeof e,A=Array.isArray,P="[ \t\n\f\r]",H=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,z=/-->/g,F=/>/g,j=RegExp(`>|${P}(?:([^\\s"'>=/]+)(${P}*=${P}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),O=/'/g,I=/"/g,N=/^(?:script|style|textarea|title)$/i,R=e=>(t,...n)=>({_$litType$:e,strings:t,values:n}),W=R(1),B=R(2),q=Symbol.for("lit-noChange"),U=Symbol.for("lit-nothing"),V=new WeakMap,G=Y.createTreeWalker(Y,129);function K(e,t){if(!A(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==$?$.createHTML(t):t}class J{constructor({strings:e,_$litType$:t},n){let i;this.parts=[];let r=0,a=0;const o=e.length-1,s=this.parts,[l,d]=((e,t)=>{const n=e.length-1,i=[];let r,a=2===t?"<svg>":3===t?"<math>":"",o=H;for(let t=0;t<n;t++){const n=e[t];let s,l,d=-1,c=0;for(;c<n.length&&(o.lastIndex=c,l=o.exec(n),null!==l);)c=o.lastIndex,o===H?"!--"===l[1]?o=z:void 0!==l[1]?o=F:void 0!==l[2]?(N.test(l[2])&&(r=RegExp("</"+l[2],"g")),o=j):void 0!==l[3]&&(o=j):o===j?">"===l[0]?(o=r??H,d=-1):void 0===l[1]?d=-2:(d=o.lastIndex-l[2].length,s=l[1],o=void 0===l[3]?j:'"'===l[3]?I:O):o===I||o===O?o=j:o===z||o===F?o=H:(o=j,r=void 0);const u=o===j&&e[t+1].startsWith("/>")?" ":"";a+=o===H?n+L:d>=0?(i.push(s),n.slice(0,d)+D+n.slice(d)+S+u):n+S+(-2===d?t:u)}return[K(e,a+(e[n]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),i]})(e,t);if(this.el=J.createElement(l,n),G.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(i=G.nextNode())&&s.length<o;){if(1===i.nodeType){if(i.hasAttributes())for(const e of i.getAttributeNames())if(e.endsWith(D)){const t=d[a++],n=i.getAttribute(e).split(S),o=/([.?@])?(.*)/.exec(t);s.push({type:1,index:r,name:o[2],strings:n,ctor:"."===o[1]?te:"?"===o[1]?ne:"@"===o[1]?ie:ee}),i.removeAttribute(e)}else e.startsWith(S)&&(s.push({type:6,index:r}),i.removeAttribute(e));if(N.test(i.tagName)){const e=i.textContent.split(S),t=e.length-1;if(t>0){i.textContent=x?x.emptyScript:"";for(let n=0;n<t;n++)i.append(e[n],C()),G.nextNode(),s.push({type:2,index:++r});i.append(e[t],C())}}}else if(8===i.nodeType)if(i.data===T)s.push({type:2,index:r});else{let e=-1;for(;-1!==(e=i.data.indexOf(S,e+1));)s.push({type:7,index:r}),e+=S.length-1}r++}}static createElement(e,t){const n=Y.createElement("template");return n.innerHTML=e,n}}function Z(e,t,n=e,i){if(t===q)return t;let r=void 0!==i?n._$Co?.[i]:n._$Cl;const a=E(t)?void 0:t._$litDirective$;return r?.constructor!==a&&(r?._$AO?.(!1),void 0===a?r=void 0:(r=new a(e),r._$AT(e,n,i)),void 0!==i?(n._$Co??=[])[i]=r:n._$Cl=r),void 0!==r&&(t=Z(e,r._$AS(e,t.values),r,i)),t}class X{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:n}=this._$AD,i=(e?.creationScope??Y).importNode(t,!0);G.currentNode=i;let r=G.nextNode(),a=0,o=0,s=n[0];for(;void 0!==s;){if(a===s.index){let t;2===s.type?t=new Q(r,r.nextSibling,this,e):1===s.type?t=new s.ctor(r,s.name,s.strings,this,e):6===s.type&&(t=new re(r,this,e)),this._$AV.push(t),s=n[++o]}a!==s?.index&&(r=G.nextNode(),a++)}return G.currentNode=Y,i}p(e){let t=0;for(const n of this._$AV)void 0!==n&&(void 0!==n.strings?(n._$AI(e,n,t),t+=n.strings.length-2):n._$AI(e[t])),t++}}class Q{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,n,i){this.type=2,this._$AH=U,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=n,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=Z(this,e,t),E(e)?e===U||null==e||""===e?(this._$AH!==U&&this._$AR(),this._$AH=U):e!==this._$AH&&e!==q&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>A(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==U&&E(this._$AH)?this._$AA.nextSibling.data=e:this.T(Y.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:n}=e,i="number"==typeof n?this._$AC(e):(void 0===n.el&&(n.el=J.createElement(K(n.h,n.h[0]),this.options)),n);if(this._$AH?._$AD===i)this._$AH.p(t);else{const e=new X(i,this),n=e.u(this.options);e.p(t),this.T(n),this._$AH=e}}_$AC(e){let t=V.get(e.strings);return void 0===t&&V.set(e.strings,t=new J(e)),t}k(e){A(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let n,i=0;for(const r of e)i===t.length?t.push(n=new Q(this.O(C()),this.O(C()),this,this.options)):n=t[i],n._$AI(r),i++;i<t.length&&(this._$AR(n&&n._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=k(e).nextSibling;k(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class ee{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,n,i,r){this.type=1,this._$AH=U,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=r,n.length>2||""!==n[0]||""!==n[1]?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=U}_$AI(e,t=this,n,i){const r=this.strings;let a=!1;if(void 0===r)e=Z(this,e,t,0),a=!E(e)||e!==this._$AH&&e!==q,a&&(this._$AH=e);else{const i=e;let o,s;for(e=r[0],o=0;o<r.length-1;o++)s=Z(this,i[n+o],t,o),s===q&&(s=this._$AH[o]),a||=!E(s)||s!==this._$AH[o],s===U?e=U:e!==U&&(e+=(s??"")+r[o+1]),this._$AH[o]=s}a&&!i&&this.j(e)}j(e){e===U?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class te extends ee{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===U?void 0:e}}class ne extends ee{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==U)}}class ie extends ee{constructor(e,t,n,i,r){super(e,t,n,i,r),this.type=5}_$AI(e,t=this){if((e=Z(this,e,t,0)??U)===q)return;const n=this._$AH,i=e===U&&n!==U||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,r=e!==U&&(n===U||i);i&&this.element.removeEventListener(this.name,this,n),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class re{constructor(e,t,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){Z(this,e)}}const ae={I:Q},oe=M.litHtmlPolyfillSupport;oe?.(J,Q),(M.litHtmlVersions??=[]).push("3.3.3");const se=globalThis;let le=class extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,n)=>{const i=n?.renderBefore??t;let r=i._$litPart$;if(void 0===r){const e=n?.renderBefore??null;i._$litPart$=r=new Q(t.insertBefore(C(),e),e,void 0,n??{})}return r._$AI(e),r})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return q}};le._$litElement$=!0,le.finalized=!0,se.litElementHydrateSupport?.({LitElement:le});const de=se.litElementPolyfillSupport;de?.({LitElement:le}),(se.litElementVersions??=[]).push("4.2.2");const ce={attribute:!0,type:String,converter:v,reflect:!1,hasChanged:y},ue=(e=ce,t,n)=>{const{kind:i,metadata:r}=n;let a=globalThis.litPropertyMetadata.get(r);if(void 0===a&&globalThis.litPropertyMetadata.set(r,a=new Map),"setter"===i&&((e=Object.create(e)).wrapped=!0),a.set(n.name,e),"accessor"===i){const{name:i}=n;return{set(n){const r=t.get.call(this);t.set.call(this,n),this.requestUpdate(i,r,e,!0,n)},init(t){return void 0!==t&&this.C(i,void 0,e,t),t}}}if("setter"===i){const{name:i}=n;return function(n){const r=this[i];t.call(this,n),this.requestUpdate(i,r,e,!0,n)}}throw Error("Unsupported decorator location: "+i)};function he(e){return(t,n)=>"object"==typeof n?ue(e,t,n):((e,t,n)=>{const i=t.hasOwnProperty(n);return t.constructor.createProperty(n,e),i?Object.getOwnPropertyDescriptor(t,n):void 0})(e,t,n)}const me="5.0.0",pe="📅 Calendar Card Pro",_e={POINTER_MOVE_TOLERANCE:8,TOOLBAR_SWITCHER_LABEL_MIN_WIDTH:248,TOOLBAR_COMMAND_WIDTH:36,TOOLBAR_COMMAND_GAP:8,LEGEND_UNFOLD_MARGIN:2,SEPARATOR_SPACING:{WEEK:1,MONTH:1.5},HOLD_INDICATOR_OPACITY:.2,HOLD_INDICATOR:{TOUCH_SIZE:100,POINTER_SIZE:50}},ge=["Germany","Deutschland","United States","USA","United States of America","United Kingdom","Great Britain","France","Italy","Italia","Spain","España","Netherlands","Nederland","Austria","Österreich","Switzerland","Schweiz"];function fe(e){return"home-assistant"===e}const ve=/^person\.[a-z0-9_]+$/;function ye(e){return"string"==typeof e&&ve.test(e)}function we(e){return Object.entries(e).map(([e,t])=>`${e}:${t};`).join("")}const be=new Map;function Me(e,t){const n=`${e}|${t}`,i=be.get(n);if(void 0!==i)return i;const r=function(e,t){if(e.startsWith("var("))return`color-mix(in srgb, ${e} ${t}%, transparent)`;if("transparent"===e)return e;const n=document.createElement("div");n.style.display="none",n.style.color=e,document.body.appendChild(n);const i=getComputedStyle(n).color;if(document.body.removeChild(n),!i)return e;const r=i.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);if(r){const[,e,n,i]=r;return`rgba(${e}, ${n}, ${i}, ${t/100})`}const a=i.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)$/);if(a){const[,e,n,i]=a;return`rgba(${e}, ${n}, ${i}, ${t/100})`}return e}(e,t);return be.set(n,r),r}function ke(e){return/^[a-z][a-z0-9]*:[a-z0-9]/i.test(e)&&!e.startsWith("http")}function xe(e){return void 0===e||!1===e?"none":!0===e?"dot":"string"==typeof e?"dot"===e||"pulse"===e||"glow"===e||"tile"===e?e:""===e.trim()?"dot":ke(e)?"mdi":e.startsWith("/")||/^https?:\/\//i.test(e)||/\.(apng|avif|bmp|gif|ico|jpe?g|png|svg|webp)(?:[?#]|$)/i.test(e)?"image":"emoji":"none"}function $e(e){return"none"===e||"icon"===e||"image"===e||"text"===e}function De(e,t){return $e(t)?t:function(e){return"string"!=typeof e||""===e?"none":fe(e)?"icon":ye(e)?"image":ke(e)?"icon":e.startsWith("/")||/^https?:\/\//i.test(e)||/\.(apng|avif|bmp|gif|ico|jpe?g|png|svg|webp)(?:[?#]|$)/i.test(e)?"image":"text"}(e)}function Se(){return Math.random().toString(36).substring(2,15)}function Te(e,t,n,i){const r=e.map(e=>"string"==typeof e?e:e.entity).sort().join("_");let a="";if(n)try{a=n.includes("T")?n.split("T")[0]:n}catch{a=n}return Le(`calendar_${r}_${t}${a?`_${a}`:""}${i?`_fdw${i}`:""}`)}function Le(e){let t=0;for(let n=0;n<e.length;n++)t=(t<<5)-t+e.charCodeAt(n),t&=t;return Math.abs(t).toString(36)}const Ye=new Date(2e3,0,1,13,0,0);function Ce(e){try{return!new Intl.DateTimeFormat(e,{hour:"numeric"}).formatToParts(Ye).some(e=>"dayPeriod"===e.type)}catch{return}}function Ee(e){return"object"==typeof e&&null!==e&&!Array.isArray(e)}const Ae=["title","time"],Pe=["subtle","outline","tinted","filled"],He=["accent","text"],ze="accent";let Fe=!1;function je(){const e=globalThis,t=e.calendarCardProLogLevel;return"number"==typeof t&&Number.isInteger(t)&&t>=0&&t<=3?t:!0===e.calendarCardProDebug?3:0}const Oe={title:["background: #424242","color: white","display: inline-block","line-height: 20px","text-align: center","border-radius: 20px 0 0 20px","font-size: 12px","font-weight: bold","padding: 4px 8px 4px 12px","margin: 5px 0"].join(";"),version:["background: #4fc3f7","color: white","display: inline-block","line-height: 20px","text-align: center","border-radius: 0 20px 20px 0","font-size: 12px","font-weight: bold","padding: 4px 12px 4px 8px","margin: 5px 0"].join(";"),prefix:["color: #4fc3f7","font-weight: bold"].join(";"),error:["color: #f44336","font-weight: bold"].join(";"),warn:["color: #ff9800","font-weight: bold"].join(";")};function Ie(e,t,...n){if(je()<0)return;const i=function(e){if(null!=e){if("string"==typeof e)return e;if("object"==typeof e)try{return{...e}}catch{try{return{value:JSON.stringify(e)}}catch{return{value:String(e)}}}return String(e)}}(t);if(e instanceof Error){const t=e.message||"Unknown error",r="string"==typeof i?` during ${i}`:"",[a,o]=Ue(`Error${r}: ${t}`,Oe.error);console.error(a,o),e.stack&&console.error(e.stack),i&&"object"==typeof i&&console.error("Context:",{...i,timestamp:(new Date).toISOString()}),n.length>0&&console.error("Additional data:",...n)}else if("string"==typeof e){const t="string"==typeof i?` during ${i}`:"",[r,a]=Ue(`${e}${t}`,Oe.error);i&&"object"==typeof i?console.error(r,a,{context:{...i,timestamp:(new Date).toISOString()},...n.length>0?{additionalData:n}:{}}):n.length>0?console.error(r,a,...n):console.error(r,a)}else{const t="string"==typeof i?` during ${i}`:"",[r,a]=Ue(`Unknown error${t}:`,Oe.error);console.error(r,a,e),i&&"object"==typeof i&&console.error("Context:",{...i,timestamp:(new Date).toISOString()}),n.length>0&&console.error("Additional data:",...n)}}function Ne(e,...t){qe(1,e,Oe.warn,console.warn,...t)}function Re(e,...t){const[n,i]=Ue(e,Oe.warn);t.length>0?console.warn(n,i,...t):console.warn(n,i)}function We(e,...t){qe(2,e,Oe.prefix,console.log,...t)}function Be(e,...t){qe(3,e,Oe.prefix,console.log,...t)}function qe(e,t,n,i,...r){if(je()<e)return;const[a,o]=Ue(t,n);r.length>0?i(a,o,...r):i(a,o)}function Ue(e,t){return[`%c[${pe}] ${e}`,t]}const Ve={config_version:void 0,entities:[],view:"list",start_date:void 0,days_to_show:3,compact_days_to_show:void 0,compact_events_to_show:void 0,compact_events_complete_days:!1,show_empty_days:!1,show_empty_today:!1,hide_when_empty:!1,empty_day_text:void 0,filter_duplicates:!1,duplicate_accent_color:void 0,split_multiday_events:!1,event_type:"all",language:void 0,title:void 0,title_font_size:void 0,title_color:void 0,background_color:"var(--ha-card-background)",accent_color:"var(--primary-color, #03a9f4)",vertical_line_width:"2px",day_spacing:"10px",event_gap:"0px",event_spacing:"4px",additional_card_spacing:"0px",height:"auto",max_height:"none",first_day_of_week:"system",show_week_numbers:null,show_current_week_number:!0,week_number_font_size:"12px",week_number_color:"var(--primary-text-color)",week_number_background_color:"color-mix(in srgb, var(--primary-color, #03a9f4) 31%, transparent)",day_separator_width:"0px",day_separator_color:"var(--secondary-text-color)",week_separator_width:"0px",week_separator_color:"color-mix(in srgb, var(--primary-color, #03a9f4) 31%, transparent)",month_separator_width:"0px",month_separator_color:"var(--primary-text-color)",today_indicator:"tile",today_indicator_position:"15% 50%",today_indicator_color:"var(--primary-color, #03a9f4)",today_indicator_size:"6px",date_vertical_alignment:"middle",weekday_font_size:"14px",weekday_color:"var(--primary-text-color)",day_font_size:"26px",day_color:"var(--primary-text-color)",show_month:!0,month_font_size:"12px",month_color:"var(--primary-text-color)",weekend_weekday_color:void 0,weekend_day_color:void 0,weekend_month_color:void 0,today_weekday_color:void 0,today_day_color:void 0,today_month_color:void 0,event_background_opacity:0,past_event_opacity:60,show_past_events:!1,show_countdown:!1,show_countdown_allday:!0,show_progress_bar:!1,show_now_indicator:!0,now_color:"#34d399",progress_bar_color:"var(--secondary-text-color)",progress_bar_height:"0.75em",progress_bar_width:void 0,event_icon_vertical_alignment:"top",event_font_size:"14px",event_color:"var(--primary-text-color)",empty_day_color:"var(--primary-text-color)",show_time:!0,show_single_allday_time:!0,show_multiday_allday_time:!0,allday_badge:"off",allday_badge_style:"subtle",allday_badge_color:"accent",time_24h:"system",time_two_digit_hours:!1,show_end_time:!0,time_font_size:"12px",time_color:"var(--secondary-text-color)",time_icon_size:"14px",time_max_lines:0,show_location:!0,show_location_allday:!0,remove_location_country:!1,location_font_size:"12px",location_color:"var(--secondary-text-color)",location_icon_size:"14px",location_max_lines:0,show_description:!1,show_description_allday:!0,title_max_lines:0,scroll_long_titles:!1,description_max_lines:0,description_font_size:"12px",description_color:"var(--secondary-text-color)",description_icon_size:"14px",weather:{entity:void 0,position:"date",date:{show_conditions:!0,show_high_temp:!0,show_low_temp:!1,show_uv_index:!1,uv_index_threshold:0,icon_size:"14px",font_size:"12px"},event:{show_conditions:!0,show_temp:!0,show_uv_index:!1,uv_index_threshold:0,daily_forecast_fallback:!0,max_lines:0,icon_size:"14px",font_size:"12px"}},tap_action:{action:"none"},hold_action:{action:"none"},event_tap_action:{action:"none"},allow_event_edit:!0,allow_event_delete:!0,toolbar:{show:!1,navigation:!0,add_event:!0,view_switcher:!0,reset:!1,refresh:!0,legend:"menu"},refresh_interval:30,refresh_on_navigate:!0,list:void 0,column:void 0,time_grid:void 0};function Ge(e,t=0){const n="string"==typeof e&&""!==e.trim()?Number(e):e;if("number"==typeof n&&Number.isFinite(n)&&!(n<t))return n}function Ke(e){const t=Ge(e);return void 0!==t&&t<=100?t:void 0}function Je(e,t="past_event_opacity"){null==e||"string"==typeof e&&""===e.trim()||void 0!==Ke(e)||Ne(`Ignoring "${t}": expected a finite percentage from 0 to 100.`)}const Ze={max_events_to_show:"compact_events_to_show",vertical_line_color:"accent_color",horizontal_line_width:"day_separator_width",horizontal_line_color:"day_separator_color",row_spacing:"day_spacing"},Xe={max_events_to_show:"compact_events_to_show"};function Qe(e,t){const n={...e};for(const[i,r]of Object.entries(t)){const t=e[i];n[i]=Ee(r)&&Ee(t)?Qe(t,r):r}return n}const et=[!1,"menu","chips"];function tt(e){const t=Ve.toolbar,n=Ee(e.toolbar)?e.toolbar:{},i=e=>"boolean"==typeof n[e]?n[e]:t[e],r=et.includes(n.legend)?n.legend:t.legend;return{show:i("show"),navigation:i("navigation"),addEvent:i("add_event"),viewSwitcher:i("view_switcher"),reset:i("reset"),refresh:i("refresh"),legend:r}}function nt(e){return e.days_to_show=Ge(e.days_to_show,1)??Ve.days_to_show,e.refresh_interval=Ge(e.refresh_interval,1)??Ve.refresh_interval,e.event_background_opacity=Ge(e.event_background_opacity,0)??Ve.event_background_opacity,Je(e.past_event_opacity),e.past_event_opacity=Ke(e.past_event_opacity)??Ve.past_event_opacity,e.compact_days_to_show=Ge(e.compact_days_to_show,1),e.compact_events_to_show=Ge(e.compact_events_to_show,0),e}function it(e,t){return at(rt(Ve,e),t,e)}function rt(e,t){let n=e;for(const e of t.split("."))n=At(n)?n[e]:void 0;return n}function at(e,t,n){const i=function(e,t){return function(e){return"string"==typeof e&&/^-?\d+(?:\.\d+)?px$/.test(e)}(e)||void 0!==t&&Lt.has(t)}(e,n);if(null==t)return i?e:t;const r=void 0===n?void 0:ut(n);if(void 0!==r)return r(t)??e;const a=Yt(t);return void 0===a?t:i?`${a}px`:t}const ot=new Set(["today_indicator_size","time_icon_size","location_icon_size","description_icon_size","weather.date.icon_size","weather.event.icon_size"]),st=new Set(["title_font_size","week_number_font_size","weekday_font_size","day_font_size","month_font_size","event_font_size","time_font_size","location_font_size","description_font_size","weather.date.font_size","weather.event.font_size"]),lt=new Set(["vertical_line_width"]),dt={thin:"1px",medium:"3px",thick:"5px",none:"0px"},ct=[...ot,...st,...lt];function ut(e){return ot.has(e)?Mt:lt.has(e)?xt:st.has(e)?kt:void 0}const ht="(?:px|cm|mm|q|in|pt|pc|r?em|r?ex|r?cap|r?ch|r?ic|r?lh|[sld]?v(?:w|h|i|b|min|max)|cq(?:w|h|i|b|min|max))",mt=new RegExp(`^\\+?(?:\\d*\\.)?\\d+(?:e[+-]?\\d+)?${ht}$`,"i"),pt=new RegExp(`(\\d)\\s+(${ht})(?![a-z])`,"gi"),_t=new RegExp(`(\\d)\\s+(${ht}|%)(?![a-z])`,"gi"),gt=/^\+?(?:\d*\.)?\d+(?:e[+-]?\d+)?%$/i,ft=/^(?:xx-small|x-small|small|medium|large|x-large|xx-large|xxx-large|larger|smaller|math|inherit|initial|unset|revert|revert-layer)$/i,vt=/^[a-z][a-z-]*\([\s\S]*\)$/i,yt=/[\s;]+$/,wt=/!\s*important$/i;function bt(e,t){return"undefined"==typeof CSS||"function"!=typeof CSS.supports||CSS.supports(e,t)}function Mt(e){return $t(e,Dt)}function kt(e){return $t(e,St)}function xt(e){return("string"==typeof e?dt[e.trim().toLowerCase()]:void 0)??Mt(e)}function $t(e,t){if("string"!=typeof e)return t(e);const n=e.replace(yt,"").trim();if(!wt.test(n))return t(n);const i=t(n.replace(wt,"").replace(yt,"").trim());return void 0===i?void 0:`${i} !important`}function Dt(e){const t=Yt(e),n=void 0!==t?`${t}px`:"string"==typeof e?e.replace(pt,"$1$2"):"";return mt.test(n)||vt.test(n)&&!n.includes("%")&&bt("border-top-width",n)?n:void 0}function St(e){const t=Yt(e),n=void 0!==t?`${t}px`:"string"==typeof e?e.replace(_t,"$1$2"):"";return mt.test(n)||gt.test(n)||ft.test(n)||vt.test(n)&&bt("font-size",n)?n:void 0}function Tt(e,t,n=e){if(!function(e,t){const n=ut(e);return void 0!==n&&null!=t&&!("string"==typeof t&&""===t.trim())&&void 0===n(t)}(e,t))return;const i=st.has(e)?'a CSS font size such as "14px", "1.2em", "120%" or "large"':lt.has(e)?'a non-negative CSS length such as "2px" or "0.2em", or "thin", "medium" or "thick"':'a non-negative CSS length such as "6px" or "0.5em"',r=rt(Ve,e),a=void 0===r?"Ignoring it.":`Falling back to "${String(r)}".`;Ne(`Invalid ${n} ${JSON.stringify(t)}: expected ${i}. ${a}`)}const Lt=new Set(["title_font_size","progress_bar_width","progress_bar_height","height","max_height","axis_width"]);function Yt(e){if("number"==typeof e)return Number.isFinite(e)?`${e}`:void 0;if("string"!=typeof e)return;const t=e.trim();return/^-?\d+(?:\.\d+)?$/.test(t)?t:void 0}function Ct(e){return Et(e,Ve),e}function Et(e,t,n){let i=!1;for(const r of Object.keys(e)){const a=e[r],o=t[r],s=void 0===n?r:`${n}.${r}`;if(At(a)&&At(o)){const t={...a};Et(t,o,s)&&(e[r]=t,i=!0);continue}const l=at(o,a,s);l!==a&&(e[r]=l,i=!0)}return i}function At(e){return"object"==typeof e&&null!==e&&!Array.isArray(e)}function Pt(e){return JSON.stringify((e||[]).map(e=>{const t="string"==typeof e?{entity:e}:e;return Object.keys(t).sort().map(e=>[e,t[e]])}))}const Ht=["event_type"],zt={columns:"full",rows:"auto"};function Ft(e){return{type:"custom:calendar-card-pro",config_version:5,entities:[...e],days_to_show:3}}function jt(e){const t=function(e){if(!e||"object"!=typeof e)return null;if("states"in e&&"object"==typeof e.states){const t=Object.keys(e.states).find(e=>e.startsWith("calendar."));if(t)return t}return Object.keys(e).find(e=>e.startsWith("calendar."))||null}(e);return{...Ft(t?[t]:[]),_description:t?void 0:"A calendar card that displays events from multiple calendars with individual styling. Add a calendar integration to Home Assistant to use this card."}}function Ot(e){return"home-assistant"===e}const It="accent";function Nt(e){return e===It}const Rt=new Set(["primary","accent","red","pink","purple","deep-purple","indigo","blue","light-blue","cyan","teal","green","light-green","lime","yellow","amber","orange","deep-orange","brown","light-grey","grey","dark-grey","blue-grey","black","white","primary-text","secondary-text","disabled"]);function Wt(e){return Rt.has(e)?`var(--${e}-color)`:e}let Bt,qt,Ut=new Map,Vt=!1,Gt=0,Kt=!1;const Jt=new Set;function Zt(){return Ut}function Xt(){for(const e of Jt)e()}function Qt(e){const t=function(e,t){if("function"==typeof e.callWS)return e.callWS(t);const n=e.connection;return n&&"function"==typeof n.sendMessagePromise?n.sendMessagePromise(t):void 0}(e,{type:"config/entity_registry/list"});if(t)return t.then(e=>{Ut=function(e){const t=new Map;for(const n of e??[]){const e=n?.entity_id;if("string"!=typeof e||!e.startsWith("calendar."))continue;const i=n.options?.calendar?.color;"string"==typeof i&&""!==i&&t.set(e,Wt(i))}return t}(e),Vt=!0,Be(`Loaded ${Ut.size} calendar colors from the entity registry`)}).catch(e=>{Be("Could not read calendar colors from the entity registry",e)});Kt||(Kt=!0,Be("This instance exposes no WebSocket command API, so Home Assistant calendar colors are unavailable; configured colors are used instead"))}function en(e){Jt.delete(e),0===Jt.size&&(Gt++,qt&&(qt(),qt=void 0),Vt=!1)}const tn=["days_to_show","show_empty_days","show_empty_today","empty_day_text","empty_day_color","split_multiday_events","show_past_events","filter_duplicates","duplicate_accent_color","vertical_line_width","event_spacing","event_gap","day_spacing","additional_card_spacing","height","max_height","today_indicator","today_indicator_size","today_indicator_color","weekday_font_size","day_font_size","show_month","month_font_size","event_background_opacity","past_event_opacity","event_color","event_font_size","show_countdown","show_countdown_allday","show_progress_bar","show_now_indicator","now_color","progress_bar_color","progress_bar_height","progress_bar_width","event_icon_vertical_alignment","show_time","show_single_allday_time","show_multiday_allday_time","allday_badge","allday_badge_style","allday_badge_color","time_two_digit_hours","show_end_time","time_color","time_font_size","time_icon_size","time_max_lines","show_location","show_location_allday","remove_location_country","location_color","location_font_size","location_icon_size","location_max_lines","show_description","show_description_allday","title_max_lines","scroll_long_titles","description_max_lines","description_color","description_font_size","description_icon_size","show_week_numbers","show_current_week_number","week_number_font_size","week_number_color","week_number_background_color","day_separator_width","day_separator_color","week_separator_width","week_separator_color","month_separator_width","month_separator_color"],nn=tn,rn=[...tn,"compact_days_to_show","compact_events_to_show","compact_events_complete_days","date_vertical_alignment","today_indicator_position"],an=["list","column","grid"],on=new Set(["column","grid"]),sn=new Set(["entities","start_date","first_day_of_week","weather","refresh_interval","refresh_on_navigate"]),ln={day_header_gap:"8px",day_header_separator_width:"0px",day_header_separator_color:"var(--divider-color)",min_day_width:140,min_days_fallback:"list"},dn={day_header_gap:"8px",day_header_separator_width:"1px",day_header_separator_color:"color-mix(in srgb, var(--divider-color) 50%, transparent)",min_day_width:100,min_days_to_show:1,min_days_fallback:"list",start_time:"07:00",end_time:"22:00",slot_minutes:60,weekend_background_color:"color-mix(in srgb, var(--primary-text-color) 4%, transparent)",hour_height:"48px",show_now_line:!0,max_simultaneous_events:3,overlap_layout:"cascade",allday_band_max_rows:3,axis_width:"max-content",show_axis_labels:!0,axis_label_minutes:60,hour_line_width:"1px",hour_line_color:"color-mix(in srgb, var(--divider-color) 50%, transparent)",allday_band_line_width:"2px",allday_band_line_color:"color-mix(in srgb, var(--divider-color) 50%, transparent)"};function cn(e,t){const n=$n(e,"column");return n&&kn(n,t)?function(e,t){const n=ln[e];if("number"==typeof n){const e="number"==typeof t?t:Number.parseFloat(String(t));return Number.isFinite(e)&&e>0?e:n}return"min_days_fallback"===e?"cramp"===t||"list"===t?t:n:String(at(n,t,e))}(t,n[t]):ln[t]}const un=/^(\d+(?:\.\d+)?)px$/i;function hn(e){const t=dn.axis_width,n=String(at(t,e,"axis_width"));return"max-content"===n||un.test(n)?{value:n,usedFallback:!1}:{value:t,usedFallback:!0}}function mn(e,t){const n=$n(e,"grid");return n&&kn(n,t)?function(e,t){const n=dn[e];if("min_days_fallback"===e)return"cramp"===t||"list"===t?t:n;if("overlap_layout"===e)return"cascade"===t||"columns"===t?t:n;if("boolean"==typeof n)return"boolean"==typeof t?t:n;if("number"==typeof n){const i="number"==typeof t?t:Number.parseFloat(String(t));return"slot_minutes"===e?[15,20,30,60].includes(i)?i:n:"axis_label_minutes"===e?[30,60,120,180].includes(i)?i:n:"allday_band_max_rows"===e||"max_simultaneous_events"===e?Number.isFinite(i)&&i>0?Math.max(1,Math.floor(i)):n:Number.isFinite(i)&&i>0?i:n}return"start_time"===e||"end_time"===e?"string"==typeof t||"number"==typeof t?String(t):"":"weekend_background_color"===e?"string"==typeof t?t:n:"axis_width"===e?hn(t).value:String(at(n,t,e))}(t,n[t]):dn[t]}function pn(e){const t=/^([-+]?(?:\d*\.)?\d+)[a-z%]*$/i.exec(e.trim());return null!==t&&0===Number.parseFloat(t[1])}function _n(e){const t=e.event_gap;return"string"==typeof t&&!t.trim().startsWith("-")&&!pn(t)}function gn(e,t){const n=e.trim(),i=/^([-+]?(?:\d*\.)?\d+)([a-z%]*)$/i.exec(n);if(i){const e=i[2]||"px";return`${Number.parseFloat(i[1])*t}${e}`}return`calc(${t} * (${n}))`}const fn=new Map([["xx-small",9.6],["x-small",12],["small",128/9],["medium",16],["large",19.2],["x-large",24],["xx-large",32],["xxx-large",48]]),vn=/((?:\d*\.)?\d+(?:e[+-]?\d+)?)%/gi,yn=new Map([["larger",1.2],["smaller",1/1.2],["math",1],["inherit",1],["unset",1],["revert",1],["revert-layer",1]]),wn=new RegExp(`(^|[^\\w-])(${[...fn.keys(),...yn.keys(),"initial"].join("|")})(?![\\w-])`,"gi");function bn(e,t){const n=e.trim().replace(/\s*!\s*important$/i,"").trim(),i=Mn(n,t);if(void 0!==i)return i;const r=/^\+?((?:\d*\.)?\d+(?:e[+-]?\d+)?)%$/i.exec(n);return r?Number.parseFloat(r[1])*t/100+"em":gn(n.replace(vn,(e,t)=>Number.parseFloat(t)/100+"em").replace(wn,(e,t,n)=>`${t}${Mn(n,1)??n}`),t)}function Mn(e,t){const n=e.toLowerCase(),i=fn.get("initial"===n?"medium":n);if(void 0!==i)return i*t+"px";const r=yn.get(n);return void 0===r?void 0:t*r+"em"}function kn(e,t){return Object.prototype.hasOwnProperty.call(e,t)&&void 0!==e[t]&&("past_event_opacity"!==t||void 0!==Ke(e[t]))}const xn={list:{blockKey:"list",overrideKeys:rn,onlyKeys:[],onlyDefaults:{},defaultOverrides:{}},column:{blockKey:"column",overrideKeys:tn,onlyKeys:["day_header_gap","day_header_separator_width","day_header_separator_color","min_day_width","min_days_to_show","min_days_fallback"],onlyDefaults:ln,defaultOverrides:{show_empty_days:!0,split_multiday_events:!0}},grid:{blockKey:"time_grid",overrideKeys:nn,onlyKeys:["day_header_gap","day_header_separator_width","day_header_separator_color","min_day_width","min_days_to_show","min_days_fallback","start_time","end_time","slot_minutes","weekend_background_color","hour_height","show_now_line","max_simultaneous_events","overlap_layout","allday_band_max_rows","axis_width","show_axis_labels","axis_label_minutes","hour_line_width","hour_line_color","allday_band_line_width","allday_band_line_color"],onlyDefaults:dn,defaultOverrides:{day_separator_width:"1px",day_separator_color:"color-mix(in srgb, var(--divider-color) 50%, transparent)",day_spacing:"1px",description_color:It,event_background_opacity:20,event_color:It,event_font_size:"12px",location_color:It,progress_bar_color:It,time_color:It,progress_bar_width:"100%",show_empty_days:!0,show_location:!1,show_past_events:!0}}};function $n(e,t){const n=xn[t];if(!n)return;const i=e[n.blockKey];return i&&"object"==typeof i?i:void 0}function Dn(e){return"list"===e}function Sn(e){switch(e){case"column":return"column-view";case"grid":return"grid-view";case"list":return""}}function Tn(e,t,n){const i=xn[n];if(!i)return e[t];const r=$n(e,n);return r&&kn(r,t)?nt({...e,[t]:it(t,r[t])})[t]:i.defaultOverrides[t]??e[t]}function Ln(e,t){const n=xn[t];if(!n)return e;const i=$n(e,t),r={...n.defaultOverrides};if(i)for(const e of n.overrideKeys){const t=e;kn(i,t)&&(r[e]=it(e,i[t]))}return 0===Object.keys(r).length?e:nt({...e,...r})}function Yn(e,t){const n=xn[t];if(!n)return;!function(e,t){for(const n of t.onlyKeys)Object.prototype.hasOwnProperty.call(e,n)&&Ne(`Ignoring top-level "${n}": it is a ${t.blockKey}-view-only option and has no effect outside the "${t.blockKey}:" block. Move it to "${t.blockKey}: { ${n}: ... }".`)}(e,n);const i=$n(e,t);if(!i)return;const r=new Set([...n.overrideKeys,...n.onlyKeys]);Je(i.past_event_opacity,`${n.blockKey}.past_event_opacity`);for(const e of ct)r.has(e)&&Tt(e,i[e],`${n.blockKey}.${e}`);for(const e of Object.keys(i))r.has(e)||(sn.has(e)?Ne(`Ignoring "${n.blockKey}.${e}": it determines which events are loaded from Home Assistant, so it cannot differ between views — switching views would have to refetch. Set "${e}" at the top level instead.`):Object.prototype.hasOwnProperty.call(Ve,e)?Ne(`Ignoring "${n.blockKey}.${e}": "${e}" is a valid top-level option but cannot be overridden per view. Set it at the top level instead.`):Ne(`Ignoring "${n.blockKey}.${e}": not a recognized option.`))}function Cn(e){return e.trim().startsWith("-")?Ve.day_spacing:e}function En(e,t){const n=un.exec(e.trim());return n?Number.parseFloat(n[1]):t}function An(e,t){return En(Cn(e),t)}Object.fromEntries(Object.entries(xn).map(([e,t])=>[e,t.blockKey])),new Set(Object.values(xn).flatMap(e=>e.onlyKeys));const Pn=An(Ve.day_spacing,10),Hn=En(Ve.time_font_size,12);function zn(e,t){return An(String(Tn(e,"day_spacing",t)),Pn)}function Fn(e,t){return Math.max(1,Math.floor(Tn(e,"days_to_show",t)))}function jn(e){return xn[e]?.onlyDefaults??ln}function On(e,t){const n=$n(e,t),i=jn(t).min_day_width,r="number"==typeof i?i:ln.min_day_width,a=n&&Object.prototype.hasOwnProperty.call(n,"min_day_width")?n.min_day_width:r,o="number"==typeof a?a:Number.parseFloat(String(a));return Number.isFinite(o)&&o>0?o:r}function In(e,t="column"){const n=$n(e,t),i=jn(t).min_days_fallback;return"cramp"===(n&&Object.prototype.hasOwnProperty.call(n,"min_days_fallback")?n.min_days_fallback:i)?"cramp":"list"}function Nn(e){const t=tt(e);if(t.show&&t.viewSwitcher)return an;const n=e.view;return on.has(n)&&"list"===In(e,n)?[n,"list"]:[n]}function Rn(e){return Math.max(...Nn(e).map(t=>Tn(e,"days_to_show",t)))}function Wn(e){const t=Rn(e);return Number.isFinite(t)&&t!==e.days_to_show?{...e,days_to_show:t}:e}function Bn(e,t,n){const i=zn(e,n),r=On(e,n)+i,a=function(e,t,n){if("grid"!==t)return 0;const i=String(mn(e,"axis_width")).trim(),r=un.exec(i),a=null!==r?Number.parseFloat(r[1]):"max-content"!==i||mn(e,"show_axis_labels")?function(e,t){const n=Number(mn(e,"axis_label_minutes"))%60==0?48:72;return En(String(Tn(e,"time_font_size",t)),Hn)/Hn*(n-12)+12}(e,t):0;return a+n}(e,n,i);if(r<=0)return 0;const o=Math.floor((t-32+i-a)/r+1e-9);return Math.max(0,Math.min(Fn(e,n),o))}function qn(e,t,n,i){const r=Fn(t,e);if(!on.has(e))return{view:e,columns:0};if(null===n||n<=0)return{view:e,columns:r};const a=Math.min(function(e,t="column"){const n=Fn(e,t),i=$n(e,t),r=jn(t).min_days_to_show,a="number"==typeof r&&Number.isFinite(r)?Math.floor(r):n;if(!i||!Object.prototype.hasOwnProperty.call(i,"min_days_to_show"))return Math.min(n,Math.max(1,a));const o=i.min_days_to_show,s="number"==typeof o?o:Number.parseFloat(String(o));return Number.isFinite(s)?Math.min(n,Math.max(1,Math.floor(s))):Math.min(n,Math.max(1,a))}(t,e),r),o=i&&i.view===e?i.columns:0,s=function(e,t="column"){const n=On(e,t)+zn(e,t);return Math.max(0,Math.min(16,(n-1)/2))}(t,e),l=Bn(t,n,e);let d=l;return l>o?d=Bn(t,n-s,e):l<o&&(d=Bn(t,n+s,e)),d>=a?{view:e,columns:Math.min(d,r)}:"cramp"===In(t,e)?{view:e,columns:a}:{view:"list",columns:0}}function Un(e,t,n){return qn(e,t,n,null===n?null:{view:e,columns:Fn(t,e)})}function Vn(e,t,n){const i=new Event("hass-action",{bubbles:!0,composed:!0});i.detail={config:t,action:n},e.dispatchEvent(i)}function Gn(e,t,n,i={}){const r="hold"===n?t.hold_action:t.tap_action;if(r&&"none"!==r.action)return"expand"===r.action?(i.expand?.(),void Be("Executed expand action")):"refresh"===r.action?(i.refresh?.(),void Be("Executed refresh action")):(Vn(e,{entity:function(e){if(!e||!e.length)return;const t=e[0];return"string"==typeof t?t:t.entity}(t.entities),tap_action:t.tap_action,hold_action:t.hold_action},n),void Be(`Delegated ${n} action (${r.action}) to HA native handler`))}const Kn="dialog-calendar-event-editor",Jn="dialog-calendar-event-detail",Zn="ha-full-calendar";function Xn(e,t,n){return 0!==(Number(e?.states?.[t]?.attributes?.supported_features??0)&n)}const Qn={[Kn]:{method:"_createEvent",invoke:(e,t)=>e.call({_activeView:void 0,dispatchEvent:t},void 0)},[Jn]:{method:"_handleEventClick",invoke:(e,t,n)=>e.call({hass:{states:{}},dispatchEvent:t},{event:{extendedProps:{calendar:n,eventData:{}},backgroundColor:""}})}},ei=new Map;let ti;function ni(e,t){if(customElements.get(e))return Promise.resolve();let n=ei.get(e);return n||(n=function(e,t){let n;const i=new Promise((e,i)=>{n=window.setTimeout(()=>i(new Error(`${t} was not defined within 10000ms`)),1e4)});return Promise.race([e,i]).finally(()=>window.clearTimeout(n))}(t(),e).finally(()=>ei.delete(e)),ei.set(e,n)),n}async function ii(e,t){let n;ti=t;let i=!1;try{await function(e,t){return ni(e,()=>async function(e,t){await ni(Zn,()=>async function(e){const t=window.loadCardHelpers;if("function"!=typeof t)throw new Error("window.loadCardHelpers is unavailable");const n=await t();if("function"!=typeof n?.createCardElement)throw new Error("Home Assistant card helpers have no createCardElement");n.createCardElement({type:"calendar",entities:[e]}),await customElements.whenDefined(Zn)}(t));const n=Qn[e],i=customElements.get(Zn)?.prototype,r=i?.[n.method];if("function"!=typeof r)throw new Error(`${Zn} has no ${n.method} handler`);let a;if(await n.invoke(r,t=>{const n=t.detail;return n?.dialogTag===e&&(a=n.dialogImport),!0},t),"function"!=typeof a)throw new Error(`${Zn}.${n.method} did not supply an import for ${e}`);await a(),await customElements.whenDefined(e)}(e,t))}(e,t.params.calendarId)}catch(e){i=!0,n=e}if(ti!==t)return;if(ti=void 0,i)return Ne(`Could not load ${e}, falling back`,n),void t.fallback();const r=new Event("show-dialog",{bubbles:!0,composed:!0});r.detail={dialogTag:e,dialogImport:()=>customElements.whenDefined(e),dialogParams:t.params},t.node.dispatchEvent(r),Be(`Opened ${e} for ${t.params.calendarId}`)}const ri="ui.components.calendar.event.add";function ai(e){const t=e?.localize?.(ri);return t&&t!==ri?t:void 0}const oi="calendar-card-pro-calendars-changed";function si(e){const t=e._source??e;return t.end?.dateTime??t.end?.date??void 0}function li(e,t,n,i){const r=t._entityId,a=(t._mergedFrom?.length??0)>1;return!r||!n.uid||a||i.failedEntities.includes(r)?{canEdit:!1,canDelete:!1}:{canEdit:i.allowEdit&&Xn(e,r,4)&&void 0!==si(t),canDelete:i.allowDelete&&Xn(e,r,2)}}function di(e){e.style.opacity="0",e.style.transition="opacity 300ms ease-out",setTimeout(()=>{e.parentNode&&(e.parentNode.removeChild(e),Be("Removed hold indicator"))},300)}function ci(e,t,n){if(n&&!e._isEmptyDay)return{event:e,color:t}}function ui(e){const t=new Date(e),n=e=>String(e).padStart(2,"0");return`calendar-card-day-${t.getFullYear()}-${n(t.getMonth()+1)}-${n(t.getDate())}`}function hi(e){return e?.calendarCardEventTap}var mi="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z",pi="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z";const _i=e=>(...t)=>({_$litDirective$:e,values:t});let gi=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,n){this._$Ct=e,this._$AM=t,this._$Ci=n}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};const fi="important",vi=" !"+fi,yi=_i(class extends gi{constructor(e){if(super(e),1!==e.type||"style"!==e.name||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,n)=>{const i=e[n];return null==i?t:t+`${n=n.includes("-")?n:n.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${i};`},"")}update(e,[t]){const{style:n}=e.element;if(void 0===this.ft)return this.ft=new Set(Object.keys(t)),this.render(t);for(const e of this.ft)null==t[e]&&(this.ft.delete(e),e.includes("-")?n.removeProperty(e):n[e]=null);for(const e in t){const i=t[e];if(null!=i){this.ft.add(e);const t="string"==typeof i&&i.endsWith(vi);e.includes("-")||t?n.setProperty(e,t?i.slice(0,-11):i,t?fi:""):n[e]=i}}return q}}),wi="Calendars",bi="calendar-card-pro-legend-changed",Mi="#010203",ki=/\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\([^()]*\)|#[0-9a-f]{3,8}\b|\btransparent\b/gi,xi=/\b(?:url|image|image-set|cross-fade|element|paint|color-mix)\(|\bcurrentcolor\b/i;function $i(e,t){if(e.fillStyle=Mi,e.fillStyle=t,e.fillStyle===Mi)return;e.clearRect(0,0,1,1),e.fillRect(0,0,1,1);const[n,i,r,a]=e.getImageData(0,0,1,1).data;return[n,i,r,a]}function Di(e){e.style.removeProperty("background-color");const t=e.ownerDocument.createElement("canvas");t.width=1,t.height=1;const n=t.getContext("2d",{willReadFrequently:!0});if(!n)return;const i=getComputedStyle(e),r=$i(n,i.backgroundColor);if(!r)return;const a=""===(o=i.backgroundImage)||"none"===o?[]:xi.test(o)?void 0:o.match(ki)??void 0;var o;if(a?.length&&a.every(e=>255===$i(n,e)?.[3]))return;const s=function(e,t,n){if(255===e[3])return;let i=void 0!==n&&.2126*n[0]+.7152*n[1]+.0722*n[2]>127.5?[0,0,0]:[255,255,255];for(const n of[t,e]){if(!n)continue;const e=n[3]/255;i=i.map((t,i)=>n[i]*e+t*(1-e))}const[r,a,o]=i.map(Math.round);return`rgb(${r}, ${a}, ${o})`}(r,$i(n,function(e){const t=e.ownerDocument.createElement("span");t.style.display="none",t.style.backgroundColor="var(--primary-background-color)",e.append(t);const n=getComputedStyle(t).backgroundColor;return t.remove(),n}(e)),$i(n,i.color));s&&(e.style.backgroundColor=s)}const Si=new Map;function Ti(e,t){const n=e.scrollTop;e.style.maxHeight="";const i=e.getBoundingClientRect(),r=e.ownerDocument.defaultView,a="rtl"===getComputedStyle(t).direction,o=function(e,t,n,i){const r=i?e.right-t.width:e.left,a=Math.max(8,n.width-8-t.width),o=Math.min(Math.max(r,8),a),s=n.height-e.bottom-4-8,l=e.top-4-8;if(t.height<=s)return{left:o,top:e.bottom+4,maxHeight:void 0};if(t.height<=l)return{left:o,top:e.top-4-t.height,maxHeight:void 0};if(s>=l)return{left:o,top:e.bottom+4,maxHeight:Math.max(0,s)};const d=Math.max(0,l);return{left:o,top:e.top-4-d,maxHeight:d}}(t.getBoundingClientRect(),{width:i.width,height:i.height},{width:r?.innerWidth??i.width,height:r?.innerHeight??i.height},a);e.style.left=`${o.left}px`,e.style.top=`${o.top}px`,void 0!==o.maxHeight&&(e.style.maxHeight=`${o.maxHeight}px`),e.scrollTop=n}function Li(e,t){const n=Si.get(e);n&&(n.reason??=t,e.open?e.close():Yi(e))}function Yi(e){const t=Si.get(e);if(!t)return;Si.delete(e),t.stop(),t.opener.setAttribute("aria-expanded","false");const n=t.reason??"escape";("escape"===n||"backdrop"===n||"button"===n)&&t.opener.isConnected&&t.opener.focus({preventScroll:!0})}function Ci(e){for(const t of[...Si.keys()])t.isConnected&&!e.contains(t)||Li(t,"gone")}function Ei(e){e.stopPropagation()}function Ai(e){return yi({"--calendar-card-legend-color":e.color})}function Pi(e){const t=[];for(const n of e){const e="string"==typeof n?n:n?.entity;"string"!=typeof e||""===e||t.includes(e)||t.push(e)}return t}const Hi=_i(class extends gi{constructor(e){if(super(e),1!==e.type||"class"!==e.name||e.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(e){return" "+Object.keys(e).filter(t=>e[t]).join(" ")+" "}update(e,[t]){if(void 0===this.st){this.st=new Set,void 0!==e.strings&&(this.nt=new Set(e.strings.join(" ").split(/\s/).filter(e=>""!==e)));for(const e in t)t[e]&&!this.nt?.has(e)&&this.st.add(e);return this.render(t)}const n=e.element.classList;for(const e of this.st)e in t||(n.remove(e),this.st.delete(e));for(const e in t){const i=!!t[e];i===this.st.has(e)||this.nt?.has(e)||(i?(n.add(e),this.st.add(e)):(n.remove(e),this.st.delete(e)))}return q}}),{I:zi}=ae,Fi=e=>e,ji=()=>document.createComment(""),Oi=(e,t,n)=>{const i=e._$AA.parentNode,r=void 0===t?e._$AB:t._$AA;if(void 0===n){const t=i.insertBefore(ji(),r),a=i.insertBefore(ji(),r);n=new zi(t,a,e,e.options)}else{const t=n._$AB.nextSibling,a=n._$AM,o=a!==e;if(o){let t;n._$AQ?.(e),n._$AM=e,void 0!==n._$AP&&(t=e._$AU)!==a._$AU&&n._$AP(t)}if(t!==r||o){let e=n._$AA;for(;e!==t;){const t=Fi(e).nextSibling;Fi(i).insertBefore(e,r),e=t}}}return n},Ii=(e,t,n=e)=>(e._$AI(t,n),e),Ni={},Ri=(e,t=Ni)=>e._$AH=t,Wi=e=>{e._$AR(),e._$AA.remove()},Bi=(e,t,n)=>{const i=new Map;for(let r=t;r<=n;r++)i.set(e[r],r);return i},qi=_i(class extends gi{constructor(e){if(super(e),2!==e.type)throw Error("repeat() can only be used in text expressions")}dt(e,t,n){let i;void 0===n?n=t:void 0!==t&&(i=t);const r=[],a=[];let o=0;for(const t of e)r[o]=i?i(t,o):o,a[o]=n(t,o),o++;return{values:a,keys:r}}render(e,t,n){return this.dt(e,t,n).values}update(e,[t,n,i]){const r=(e=>e._$AH)(e),{values:a,keys:o}=this.dt(t,n,i);if(!Array.isArray(r))return this.ut=o,a;const s=this.ut??=[],l=[];let d,c,u=0,h=r.length-1,m=0,p=a.length-1;for(;u<=h&&m<=p;)if(null===r[u])u++;else if(null===r[h])h--;else if(s[u]===o[m])l[m]=Ii(r[u],a[m]),u++,m++;else if(s[h]===o[p])l[p]=Ii(r[h],a[p]),h--,p--;else if(s[u]===o[p])l[p]=Ii(r[u],a[p]),Oi(e,l[p+1],r[u]),u++,p--;else if(s[h]===o[m])l[m]=Ii(r[h],a[m]),Oi(e,r[u],r[h]),h--,m++;else if(void 0===d&&(d=Bi(o,m,p),c=Bi(s,u,h)),d.has(s[u]))if(d.has(s[h])){const t=c.get(o[m]),n=void 0!==t?r[t]:null;if(null===n){const t=Oi(e,r[u]);Ii(t,a[m]),l[m]=t}else l[m]=Ii(n,a[m]),Oi(e,r[u],n),r[t]=null;m++}else Wi(r[h]),h--;else Wi(r[u]),u++;for(;m<=p;){const t=Oi(e,l[p+1]);Ii(t,a[m]),l[m++]=t}for(;u<=h;){const e=r[u++];null!==e&&Wi(e)}return this.ut=o,Ri(e,l),q}});const Ui={bg:{daysOfWeek:["нед.","пон.","вт.","ср.","четв.","пет.","съб."],fullDaysOfWeek:["неделя","понеделник","вторник","сряда","четвъртък","петък","събота"],months:["ян.","фев.","мар","апр.","май","юни","юли","авг.","септ.","окт.","ноем.","дек."],allDay:"цял ден",multiDay:"до",at:"в",viewList:"Списък",viewColumns:"Колони",viewGrid:"Решетка",endsToday:"приключва днес",endsTomorrow:"приключва утре",noEvents:"Няма събития",loading:"Зареждане на календара със събития...",error:"Грешка: календарът не е намерен или не е конфигуриран правилно",loadFailed:"Неуспешно зареждане:"},cs:{daysOfWeek:["Ne","Po","Út","St","Čt","Pá","So"],fullDaysOfWeek:["Neděle","Pondělí","Úterý","Středa","Čtvrtek","Pátek","Sobota"],months:["Led","Úno","Bře","Dub","Kvě","Čvn","Čvc","Srp","Zář","Říj","Lis","Pro"],allDay:"celý den",multiDay:"do",at:"v",viewList:"Seznam",viewColumns:"Sloupce",viewGrid:"Mřížka",endsToday:"končí dnes",endsTomorrow:"končí zítra",noEvents:"Žádné události",loading:"Načítání událostí z kalendáře...",error:"Chyba: Entita kalendáře nebyla nalezena nebo je nesprávně nakonfigurována",loadFailed:"Nepodařilo se načíst:"},ca:{daysOfWeek:["Dg","Dl","Dm","Dc","Dj","Dv","Ds"],fullDaysOfWeek:["Diumenge","Dilluns","Dimarts","Dimecres","Dijous","Divendres","Dissabte"],months:["Gen","Febr","Març","Abr","Maig","Juny","Jul","Ag","Set","Oct","Nov","Des"],allDay:"tot el dia",multiDay:"fins a",at:"a les",viewList:"Llista",viewColumns:"Columnes",viewGrid:"Quadrícula",endsToday:"acaba avui",endsTomorrow:"acaba damà",noEvents:"Cap esdeveniment",loading:"Carregant esdeveniments...",error:"Error: No s'ha trobat l'entitat del calendari o aquesta està mal configurada",loadFailed:"No s'ha pogut carregar:"},da:{daysOfWeek:["Søn","Man","Tir","Ons","Tor","Fre","Lør"],fullDaysOfWeek:["søndag","mandag","tirsdag","onsdag","torsdag","fredag","lørdag"],months:["Jan","Feb","Mar","Apr","Maj","Jun","Jul","Aug","Sep","Okt","Nov","Dec"],allDay:"hele dagen",multiDay:"indtil",at:"kl.",viewList:"Liste",viewColumns:"Kolonner",viewGrid:"Gitter",endsToday:"slutter i dag",endsTomorrow:"slutter i morgen",noEvents:"Ingen begivenheder",loading:"Indlæser kalenderbegivenheder...",error:"Fejl: Kalenderenheden blev ikke fundet eller er ikke konfigureret korrekt",loadFailed:"Kunne ikke indlæses:"},de:{daysOfWeek:["So","Mo","Di","Mi","Do","Fr","Sa"],fullDaysOfWeek:["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"],months:["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"],allDay:"ganztägig",multiDay:"bis",at:"um",viewList:"Liste",viewColumns:"Spalten",viewGrid:"Zeitraster",endsToday:"endet heute",endsTomorrow:"endet morgen",noEvents:"Keine Termine",loading:"Kalendereinträge werden geladen...",error:"Fehler: Kalender-Entität nicht gefunden oder falsch konfiguriert",loadFailed:"Laden fehlgeschlagen:"},el:{daysOfWeek:["Κυρ","Δευ","Τρι","Τετ","Πεμ","Παρ","Σαβ"],fullDaysOfWeek:["Κυριακή","Δευτέρα","Τρίτη","Τετάρτη","Πέμπτη","Παρασκευή","Σάββατο"],months:["Ιαν","Φεβ","Μαρ","Απρ","Μαϊ","Ιουν","Ιουλ","Αυγ","Σεπ","Οκτ","Νοε","Δεκ"],allDay:"Ολοήμερο",multiDay:"έως",at:"στις",viewList:"Λίστα",viewColumns:"Στήλες",viewGrid:"Πλέγμα",endsToday:"λήγει σήμερα",endsTomorrow:"λήγει αύριο",noEvents:"Δεν υπάρχουν γεγονότα",loading:"Φόρτωση ημερολογίου...",error:"Σφάλμα: Η οντότητα ημερολογίου δεν βρέθηκε ή δεν έχει ρυθμιστεί σωστά",loadFailed:"Αποτυχία φόρτωσης:"},en:{daysOfWeek:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],fullDaysOfWeek:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],months:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],allDay:"all day",multiDay:"until",at:"at",viewList:"List",viewColumns:"Columns",viewGrid:"Grid",endsToday:"ends today",endsTomorrow:"ends tomorrow",noEvents:"No events",loading:"Loading calendar events...",error:"Error: Calendar entity not found or improperly configured",loadFailed:"Couldn't load:"},"en-gb":{daysOfWeek:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],fullDaysOfWeek:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],months:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],allDay:"all day",multiDay:"until",at:"at",viewList:"List",viewColumns:"Columns",viewGrid:"Grid",endsToday:"ends today",endsTomorrow:"ends tomorrow",noEvents:"No events",loading:"Loading calendar events...",error:"Error: Calendar entity not found or improperly configured",loadFailed:"Couldn't load:"},es:{daysOfWeek:["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"],fullDaysOfWeek:["domingo","lunes","martes","miércoles","jueves","viernes","sábado"],months:["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"],allDay:"todo el día",multiDay:"hasta",at:"a las",viewList:"Lista",viewColumns:"Columnas",viewGrid:"Rejilla",endsToday:"termina hoy",endsTomorrow:"termina mañana",noEvents:"No hay eventos",loading:"Cargando eventos del calendario...",error:"Error: La entidad del calendario no se encontró o está mal configurada",loadFailed:"No se pudo cargar:"},et:{daysOfWeek:["P","E","T","K","N","R","L"],fullDaysOfWeek:["pühapäev","esmaspäev","teisipäev","kolmapäev","neljapäev","reede","laupäev"],months:["Jaan","Veebr","Märts","Apr","Mai","Juuni","Juuli","Aug","Sept","Okt","Nov","Dets"],allDay:"kogu päev",multiDay:"kuni",at:"kell",viewList:"Loetelu",viewColumns:"Veerud",viewGrid:"Ajaraster",endsToday:"lõpeb täna",endsTomorrow:"lõpeb homme",noEvents:"Sündmusi pole",loading:"Kalendrisündmuste laadimine...",error:"Viga: kalendri entiteeti ei leitud või see on valesti seadistatud",loadFailed:"Laadimine ebaõnnestus:"},fi:{daysOfWeek:["Su","Ma","Ti","Ke","To","Pe","La"],fullDaysOfWeek:["Sunnuntai","Maanantai","Tiistai","Keskiviikko","Torstai","Perjantai","Lauantai"],months:["Tammi","Helmi","Maalis","Huhti","Touko","Kesä","Heinä","Elo","Syys","Loka","Marras","Joulu"],allDay:"koko päivä",multiDay:"asti",at:"klo",viewList:"Lista",viewColumns:"Sarakkeet",viewGrid:"Ruudukko",endsToday:"päättyy tänään",endsTomorrow:"päättyy huomenna",noEvents:"Ei tapahtumia",loading:"Ladataan kalenteritapahtumia...",error:"Virhe: Kalenteriyksikköä ei löydy tai se on väärin määritetty",loadFailed:"Lataus epäonnistui:"},fr:{daysOfWeek:["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"],fullDaysOfWeek:["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"],months:["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Août","Sep","Oct","Nov","Déc"],allDay:"toute la journée",multiDay:"jusqu'au",at:"à",viewList:"Liste",viewColumns:"Colonnes",viewGrid:"Grille",endsToday:"finit aujourd'hui",endsTomorrow:"finit demain",noEvents:"Aucun événement",loading:"Chargement des événements...",error:"Erreur: Entité de calendrier introuvable ou mal configurée",loadFailed:"Échec du chargement:"},he:{daysOfWeek:["א'","ב'","ג'","ד'","ה'","ו'","ש'"],fullDaysOfWeek:["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"],months:["ינו","פבר","מרץ","אפר","מאי","יונ","יול","אוג","ספט","אוק","נוב","דצמ"],allDay:"כל-היום",multiDay:"עד",endsToday:"מסתיים היום",endsTomorrow:"מסתיים מחר",at:"בשעה",viewList:"רשימה",viewColumns:"עמודות",viewGrid:"רשת",noEvents:"אין אירועים",loading:"טוען אירועי לוח שנה...",error:"שגיאה: ישות לוח השנה לא נמצאה או לא מוגדרת כראוי",loadFailed:"הטעינה נכשלה:"},hr:{daysOfWeek:["Ned","Pon","Uto","Sri","Čet","Pet","Sub"],fullDaysOfWeek:["Nedjelja","Ponedjeljak","Utorak","Srijeda","Četvrtak","Petak","Subota"],months:["Sij","Velj","Ožu","Tra","Svi","Lip","Srp","Kol","Ruj","Lis","Stu","Pro"],allDay:"cijeli dan",multiDay:"do",at:"u",viewList:"Popis",viewColumns:"Stupci",viewGrid:"Mreža",endsToday:"završava danas",endsTomorrow:"završava sutra",noEvents:"Nema događaja",loading:"Učitavanje događaja...",error:"Greška: Kalendar entitet nije pronađen ili je neispravno postavljen",loadFailed:"Učitavanje nije uspjelo:"},hu:{daysOfWeek:["Vas","Hét","Kedd","Sze","Csüt","Pén","Szo"],fullDaysOfWeek:["Vasárnap","Hétfő","Kedd","Szerda","Csütörtök","Péntek","Szombat"],months:["Jan","Feb","Már","Ápr","Máj","Jún","Júl","Aug","Szep","Okt","Nov","Dec"],allDay:"egész napos",multiDay:"eddig:",endsToday:"ma este ér véget",endsTomorrow:"holnap ér véget",at:"itt:",viewList:"Lista",viewColumns:"Oszlopok",viewGrid:"Rács",noEvents:"Nincs esemény",loading:"Naptárbejegyzések betöltése...",error:"Hiba: Naptár entitás nem található vagy nem megfelelően konfigutált",loadFailed:"Nem sikerült betölteni:"},is:{daysOfWeek:["Sun","Mán","Þri","Mið","Fim","Fös","Lau"],fullDaysOfWeek:["sunnudagur","mánudagur","þriðjudagur","miðvikudagur","fimmtudagur","föstudagur","laugardagur"],months:["Jan","Feb","Mar","Apr","Maí","Jún","Júl","Ágú","Sep","Okt","Nóv","Des"],allDay:"Allur dagurinn",multiDay:"þar til",at:"kl",viewList:"Listi",viewColumns:"Dálkar",viewGrid:"Tímatafla",endsToday:"lýkur í dag",endsTomorrow:"lýkur á morgun",noEvents:"Engir viðburðir",loading:"Hleður inn dagatal...",error:"Villa: Dagatalseining finnst ekki eða er vanstillt",loadFailed:"Tókst ekki að hlaða inn:"},it:{daysOfWeek:["Dom","Lun","Mar","Mer","Gio","Ven","Sab"],fullDaysOfWeek:["domenica","lunedì","martedì","mercoledì","giovedì","venerdì","sabato"],months:["Gen","Feb","Mar","Apr","Mag","Giu","Lug","Ago","Set","Ott","Nov","Dic"],allDay:"tutto il giorno",multiDay:"fino a",at:"alle",viewList:"Lista",viewColumns:"Colonne",viewGrid:"Griglia oraria",endsToday:"termina oggi",endsTomorrow:"termina domani",noEvents:"Nessun evento",loading:"Caricamento eventi del calendario...",error:"Errore: entità calendario non trovata o configurata in modo errato",loadFailed:"Impossibile caricare:"},ko:{daysOfWeek:["일","월","화","수","목","금","토"],fullDaysOfWeek:["일요일","월요일","화요일","수요일","목요일","금요일","토요일"],months:["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"],allDay:"종일",multiDay:"~",at:"에",viewList:"목록",viewColumns:"열",viewGrid:"그리드",endsToday:"오늘 종료",endsTomorrow:"내일 종료",noEvents:"일정 없음",loading:"캘린더 일정을 불러오는 중...",error:"오류: 캘린더 엔티티를 찾을 수 없거나 잘못 설정되었습니다",loadFailed:"불러오지 못함:"},lt:{daysOfWeek:["Sek","Pir","Ant","Tre","Ket","Pen","Šeš"],fullDaysOfWeek:["Sekmadienis","Pirmadienis","Antradienis","Trečiadienis","Ketvirtadienis","Penktadienis","Šeštadienis"],months:["Sau","Vas","Kov","Bal","Geg","Bir","Lie","Rgp","Rgs","Spa","Lap","Grd"],allDay:"visą dieną",multiDay:"iki",at:"į",viewList:"Sąrašas",viewColumns:"Stulpeliai",viewGrid:"Laiko tinklelis",endsToday:"baigiasi šiandien",endsTomorrow:"baigiasi rytoj",noEvents:"Nėra įvykių",loading:"Įkeliami kalendoriaus įvykiai...",error:"Klaida: Kalendoriaus objektas nerastas arba neteisingai sukonfigūruotas",loadFailed:"Nepavyko įkelti:"},lv:{daysOfWeek:["Sv","Pr","Ot","Tr","Ce","Pk","Se"],fullDaysOfWeek:["Svētdiena","Pirmdiena","Otrdiena","Trešdiena","Ceturtdiena","Piektdiena","Sestdiena"],months:["Jan","Feb","Mar","Apr","Mai","Jūn","Jūl","Aug","Sep","Okt","Nov","Dec"],allDay:"visu dienu",multiDay:"līdz",at:"plkst.",viewList:"Saraksts",viewColumns:"Kolonnas",viewGrid:"Laika režģis",endsToday:"beidzas šodien",endsTomorrow:"beidzas rīt",noEvents:"Nav notikumu",loading:"Ielādē kalendāra notikumus...",error:"Kļūda: Kalendāra entitīja nav atrasta vai nav pareizi konfigurēta",loadFailed:"Neizdevās ielādēt:"},nb:{daysOfWeek:["Søn","Man","Tir","Ons","Tor","Fre","Lør"],fullDaysOfWeek:["søndag","mandag","tirsdag","onsdag","torsdag","fredag","lørdag"],months:["jan","feb","mar","apr","mai","jun","jul","aug","sep","okt","nov","des"],allDay:"hele dagen",multiDay:"til",at:"kl. ",viewList:"Liste",viewColumns:"Kolonner",viewGrid:"Tidsrutenett",endsToday:"slutter i dag",endsTomorrow:"slutter i morgen",noEvents:"Ingen hendelser",loading:"Laster kalenderhendelser...",error:"Feil: Kalenderenheten ble ikke funnet eller er ikke konfigurert riktig",loadFailed:"Kunne ikke lastes:"},nl:{daysOfWeek:["Zo","Ma","Di","Wo","Do","Vr","Za"],fullDaysOfWeek:["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"],months:["Jan","Feb","Mrt","Apr","Mei","Jun","Jul","Aug","Sep","Okt","Nov","Dec"],allDay:"hele dag",multiDay:"tot",at:"om",viewList:"Lijst",viewColumns:"Kolommen",viewGrid:"Rooster",endsToday:"eindigt vandaag",endsTomorrow:"eindigt morgen",noEvents:"Geen afspraken",loading:"Kalender afspraken laden...",error:"Fout: Kalender niet gevonden of verkeerd geconfigureerd",loadFailed:"Laden mislukt:"},nn:{daysOfWeek:["Søn","Mån","Tys","Ons","Tor","Fre","Lau"],fullDaysOfWeek:["søndag","måndag","tysdag","onsdag","torsdag","fredag","laurdag"],months:["jan","feb","mar","apr","mai","jun","jul","aug","sep","okt","nov","des"],allDay:"heile dagen",multiDay:"til",at:"kl. ",viewList:"Liste",viewColumns:"Kolonnar",viewGrid:"Rutenett",endsToday:"sluttar i dag",endsTomorrow:"sluttar i morgon",noEvents:"Ingen hendingar",loading:"Lastar kalenderhendingar...",error:"Feil: Kalendereininga vart ikkje funnen eller er ikkje konfigurert riktig",loadFailed:"Kunne ikkje lastast:"},pl:{daysOfWeek:["Nd","Pn","Wt","Śr","Cz","Pt","Sb"],fullDaysOfWeek:["niedzieli","poniedziałku","wtorku","środy","czwartku","piątku","soboty"],months:["sty","lut","mar","kwi","maj","cze","lip","sie","wrz","paź","lis","gru"],allDay:"cały dzień",multiDay:"do",at:"o",viewList:"Lista",viewColumns:"Kolumny",viewGrid:"Siatka czasu",endsToday:"kończy się dziś",endsTomorrow:"kończy się jutro",noEvents:"Brak wydarzeń",loading:"Ładowanie wydarzeń z kalendarza...",error:"Błąd: encja kalendarza nie została znaleziona lub jest niepoprawnie skonfigurowana",loadFailed:"Nie udało się wczytać:"},pt:{daysOfWeek:["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"],fullDaysOfWeek:["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"],months:["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"],allDay:"o dia todo",multiDay:"até",at:"às",viewList:"Lista",viewColumns:"Colunas",viewGrid:"Grade",endsToday:"termina hoje",endsTomorrow:"termina amanhã",noEvents:"Nenhum evento",loading:"Carregando eventos do calendário...",error:"Erro: A entidade do calendário não foi encontrada ou está configurada incorretamente",loadFailed:"Não foi possível carregar:"},ro:{daysOfWeek:["Du","Lu","Ma","Mi","Jo","Vi","Sâ"],fullDaysOfWeek:["Duminică","Luni","Marți","Miercuri","Joi","Vineri","Sâmbătă"],months:["Ian","Feb","Mart","Apr","Mai","Iun","Iul","Aug","Sept","Oct","Nov","Dec"],allDay:"toată ziua",multiDay:"până la",at:"la",viewList:"Listă",viewColumns:"Coloane",viewGrid:"Grilă",endsToday:"se încheie astăzi",endsTomorrow:"se încheie mâine",noEvents:"Nu sunt evenimente",loading:"Încărcare evenimente de calendar...",error:"Eroare: Entitatea de calendar nu a fost găsită sau este configurată incorect",loadFailed:"Nu s-a putut încărca:"},ru:{daysOfWeek:["Вс","Пн","Вт","Ср","Чт","Пт","Сб"],fullDaysOfWeek:["воскресенья","понедельника","вторника","среды","четверга","пятницы","субботы"],months:["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"],allDay:"весь день",multiDay:"до",at:"в",viewList:"Список",viewColumns:"Столбцы",viewGrid:"Сетка",endsToday:"заканчивается сегодня",endsTomorrow:"заканчивается завтра",noEvents:"Нет событий",loading:"Загрузка событий календаря...",error:"Ошибка: Объект календарь, не найден или неправильно настроен",loadFailed:"Не удалось загрузить:"},sl:{daysOfWeek:["ned","pon","tor","sre","čet","pet","sob"],fullDaysOfWeek:["nedelja","ponedeljek","torek","sreda","četrtek","petek","sobota"],months:["jan","feb","mar","apr","maj","jun","jul","avg","sep","okt","nov","dec"],allDay:"cel dan",multiDay:"do",at:"ob",viewList:"Seznam",viewColumns:"Stolpci",viewGrid:"Mreža",endsToday:"konča se danes",endsTomorrow:"konča se jutri",noEvents:"Ni dogodkov",loading:"Nalagam dogodke...",error:"Napaka: Entiteta ni bila najdena ali pa je nepravilno konfigurirana.",loadFailed:"Nalaganje ni uspelo:"},sk:{daysOfWeek:["Ne","Po","Ut","St","Št","Pi","So"],fullDaysOfWeek:["Nedeľa","Pondelok","Utorok","Streda","Štvrtok","Piatok","Sobota"],months:["Jan","Feb","Mar","Apr","Máj","Jún","Júl","Aug","Sep","Okt","Nov","Dec"],allDay:"celý deň",multiDay:"do",at:"v",viewList:"Zoznam",viewColumns:"Stĺpce",viewGrid:"Časová mriežka",endsToday:"končí dnes",endsTomorrow:"končí zajtra",noEvents:"Žiadne udalosti",loading:"Načítavam udalosti z kalendára...",error:"Chyba: Entita kalendára nebola nájdená alebo je nesprávne nakonfigurovaná",loadFailed:"Nepodarilo sa načítať:"},sv:{daysOfWeek:["Sön","Mån","Tis","Ons","Tors","Fre","Lör"],fullDaysOfWeek:["söndag","måndag","tisdag","onsdag","torsdag","fredag","lördag"],months:["Jan","Feb","Mar","Apr","Maj","Jun","Jul","Aug","Sep","Okt","Nov","Dec"],allDay:"heldag",multiDay:"till",at:"vid",viewList:"Lista",viewColumns:"Kolumner",viewGrid:"Tidsrutnät",endsToday:"slutar idag",endsTomorrow:"slutar imorgon",noEvents:"Inga händelser",loading:"Laddar kalenderhändelser...",error:"Fel: Kalenderentiteten hittades inte eller är felaktigt konfigurerad.",loadFailed:"Kunde inte läsas in:"},uk:{daysOfWeek:["Нд","Пн","Вт","Ср","Чт","Пт","Сб"],fullDaysOfWeek:["неділі","понеділка","вівторка","середи","четверга","п'ятниці","суботи"],months:["січ","лют","бер","кві","тра","чер","лип","сер","вер","жов","лис","гру"],allDay:"весь день",multiDay:"до",at:"об",viewList:"Список",viewColumns:"Стовпці",viewGrid:"Сітка",endsToday:"закінчується сьогодні",endsTomorrow:"закінчується завтра",noEvents:"Немає подій",loading:"Завантаження подій календаря...",error:"Помилка: Cутність календаря не знайдено або налаштовано неправильно",loadFailed:"Не вдалося завантажити:"},vi:{daysOfWeek:["CN","T.2","T.3","T.4","T.5","T.6","T.7"],fullDaysOfWeek:["chủ nhật","thứ hai","thứ ba","thứ tư","thứ năm","thứ sáu","thứ bảy"],months:["Th1","Th2","Th3","Th4","Th5","Th6","Th7","Th8","Th9","Th10","Th11","Th12"],allDay:"cả ngày",multiDay:"đến",at:"lúc",viewList:"Danh sách",viewColumns:"Cột",viewGrid:"Lưới",endsToday:"kết thúc hôm nay",endsTomorrow:"kết thúc ngày mai",noEvents:"Không có sự kiện",loading:"Đang tải sự kiện...",error:"Lỗi: Không tìm thấy lịch hoặc cấu hình không đúng",loadFailed:"Không tải được:"},th:{daysOfWeek:["อา.","จ.","อ.","พ.","พฤ.","ศ.","ส."],fullDaysOfWeek:["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์","เสาร์"],months:["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."],allDay:"ตลอดวัน",multiDay:"ถึง",at:"เวลา",viewList:"รายการ",viewColumns:"คอลัมน์",viewGrid:"ตาราง",endsToday:"สิ้นสุดวันนี้",endsTomorrow:"สิ้นสุดพรุ่งนี้",noEvents:"ไม่มีเหตุการณ์",loading:"กำลังโหลดเหตุการณ์ปฏิทิน...",error:"ข้อผิดพลาด: ไม่พบเอนทิตีปฏิทินหรือมีการตั้งค่าที่ไม่ถูกต้อง",loadFailed:"โหลดไม่สำเร็จ:"},tr:{daysOfWeek:["Paz","Pzt","Sal","Çar","Per","Cum","Cmt"],fullDaysOfWeek:["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"],months:["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"],allDay:"tüm gün",multiDay:"değin",at:"da",viewList:"Liste",viewColumns:"Sütunlar",viewGrid:"Izgara",endsToday:"bugün sona eriyor",endsTomorrow:"yarın sona eriyor",noEvents:"Etkinlik yok",loading:"Takvim etkinlikleri yükleniyor...",error:"Hata: Takvim içeriği bulunamadı veya yanlış yapılandırılmış",loadFailed:"Yüklenemedi:"},"zh-cn":{daysOfWeek:["日","一","二","三","四","五","六"],fullDaysOfWeek:["星期日","星期一","星期二","星期三","星期四","星期五","星期六"],months:["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],allDay:"整天",multiDay:"直到",at:"在",viewList:"列表",viewColumns:"列",viewGrid:"网格",endsToday:"今天结束",endsTomorrow:"明天结束",noEvents:"没有活动",loading:"正在加载日历事件...",error:"错误：找不到日历实体或配置不正确",loadFailed:"无法加载："},"zh-tw":{daysOfWeek:["日","一","二","三","四","五","六"],fullDaysOfWeek:["星期日","星期一","星期二","星期三","星期四","星期五","星期六"],months:["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"],allDay:"整天",multiDay:"直到",at:"在",viewList:"列表",viewColumns:"欄",viewGrid:"網格",endsToday:"今天結束",endsTomorrow:"明天結束",noEvents:"沒有活動",loading:"正在加載日曆事件...",error:"錯誤：找不到日曆實體或配置不正確",loadFailed:"無法載入："}},Vi="en",Gi=new Map;function Ki(e,t){const n=`${e||""}:${t?.language||""}`;if(Gi.has(n))return Gi.get(n);let i;if(e&&""!==e.trim()){const t=e.toLowerCase();if(Ui[t])return i=t,Gi.set(n,i),i}if(t?.language){const e=t.language.toLowerCase();if(Ui[e])return i=e,Gi.set(n,i),i;const r=e.split(/[-_]/)[0];if(r!==e&&Ui[r])return i=r,Gi.set(n,i),i}return i=Vi,Gi.set(n,i),i}function Ji(e){const t=e?.toLowerCase()||Vi;return Ui[t]||Ui[Vi]}function Zi(e){const t=e?.toLowerCase()||"";return"de"===t||"hr"===t?"day-dot-month":"en"===t||"hu"===t?"month-day":"day-month"}function Xi(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var Qi,er={exports:{}};function tr(){return Qi||(Qi=1,er.exports=function(){var e=6e4,t=36e5,n="millisecond",i="second",r="minute",a="hour",o="day",s="week",l="month",d="quarter",c="year",u="date",h="Invalid Date",m=/^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,p=/\[([^\]]+)]|YYYY|YY|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,_={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),ordinal:function(e){var t=["th","st","nd","rd"],n=e%100;return"["+e+(t[(n-20)%10]||t[n]||t[0])+"]"}},g=function(e,t,n){var i=String(e);return!i||i.length>=t?e:""+Array(t+1-i.length).join(n)+e},f={s:g,z:function(e){var t=-e.utcOffset(),n=Math.abs(t),i=Math.floor(n/60),r=n%60;return(t<=0?"+":"-")+g(i,2,"0")+":"+g(r,2,"0")},m:function e(t,n){if(t.date()<n.date())return-e(n,t);var i=12*(n.year()-t.year())+(n.month()-t.month()),r=t.clone().add(i,l),a=n-r<0,o=t.clone().add(i+(a?-1:1),l);return+(-(i+(n-r)/(a?r-o:o-r))||0)},a:function(e){return e<0?Math.ceil(e)||0:Math.floor(e)},p:function(e){return{M:l,y:c,w:s,d:o,D:u,h:a,m:r,s:i,ms:n,Q:d}[e]||String(e||"").toLowerCase().replace(/s$/,"")},u:function(e){return void 0===e}},v="en",y={};y[v]=_;var w="$isDayjsObject",b=function(e){return e instanceof $||!(!e||!e[w])},M=function e(t,n,i){var r;if(!t)return v;if("string"==typeof t){var a=t.toLowerCase();y[a]&&(r=a),n&&(y[a]=n,r=a);var o=t.split("-");if(!r&&o.length>1)return e(o[0])}else{var s=t.name;y[s]=t,r=s}return!i&&r&&(v=r),r||!i&&v},k=function(e,t){if(b(e))return e.clone();var n="object"==typeof t?t:{};return n.date=e,n.args=arguments,new $(n)},x=f;x.l=M,x.i=b,x.w=function(e,t){return k(e,{locale:t.$L,utc:t.$u,x:t.$x,$offset:t.$offset})};var $=function(){function _(e){this.$L=M(e.locale,null,!0),this.parse(e),this.$x=this.$x||e.x||{},this[w]=!0}var g=_.prototype;return g.parse=function(e){this.$d=function(e){var t=e.date,n=e.utc;if(null===t)return new Date(NaN);if(x.u(t))return new Date;if(t instanceof Date)return new Date(t);if("string"==typeof t&&!/Z$/i.test(t)){var i=t.match(m);if(i){var r=i[2]-1||0,a=(i[7]||"0").substring(0,3);return n?new Date(Date.UTC(i[1],r,i[3]||1,i[4]||0,i[5]||0,i[6]||0,a)):new Date(i[1],r,i[3]||1,i[4]||0,i[5]||0,i[6]||0,a)}}return new Date(t)}(e),this.init()},g.init=function(){var e=this.$d;this.$y=e.getFullYear(),this.$M=e.getMonth(),this.$D=e.getDate(),this.$W=e.getDay(),this.$H=e.getHours(),this.$m=e.getMinutes(),this.$s=e.getSeconds(),this.$ms=e.getMilliseconds()},g.$utils=function(){return x},g.isValid=function(){return!(this.$d.toString()===h)},g.isSame=function(e,t){var n=k(e);return this.startOf(t)<=n&&n<=this.endOf(t)},g.isAfter=function(e,t){return k(e)<this.startOf(t)},g.isBefore=function(e,t){return this.endOf(t)<k(e)},g.$g=function(e,t,n){return x.u(e)?this[t]:this.set(n,e)},g.unix=function(){return Math.floor(this.valueOf()/1e3)},g.valueOf=function(){return this.$d.getTime()},g.startOf=function(e,t){var n=this,d=!!x.u(t)||t,h=x.p(e),m=function(e,t){var i=x.w(n.$u?Date.UTC(n.$y,t,e):new Date(n.$y,t,e),n);return d?i:i.endOf(o)},p=function(e,t){return x.w(n.toDate()[e].apply(n.toDate("s"),(d?[0,0,0,0]:[23,59,59,999]).slice(t)),n)},_=this.$W,g=this.$M,f=this.$D,v="set"+(this.$u?"UTC":"");switch(h){case c:return d?m(1,0):m(31,11);case l:return d?m(1,g):m(0,g+1);case s:var y=this.$locale().weekStart||0,w=(_<y?_+7:_)-y;return m(d?f-w:f+(6-w),g);case o:case u:return p(v+"Hours",0);case a:return p(v+"Minutes",1);case r:return p(v+"Seconds",2);case i:return p(v+"Milliseconds",3);default:return this.clone()}},g.endOf=function(e){return this.startOf(e,!1)},g.$set=function(e,t){var s,d=x.p(e),h="set"+(this.$u?"UTC":""),m=(s={},s[o]=h+"Date",s[u]=h+"Date",s[l]=h+"Month",s[c]=h+"FullYear",s[a]=h+"Hours",s[r]=h+"Minutes",s[i]=h+"Seconds",s[n]=h+"Milliseconds",s)[d],p=d===o?this.$D+(t-this.$W):t;if(d===l||d===c){var _=this.clone().set(u,1);_.$d[m](p),_.init(),this.$d=_.set(u,Math.min(this.$D,_.daysInMonth())).$d}else m&&this.$d[m](p);return this.init(),this},g.set=function(e,t){return this.clone().$set(e,t)},g.get=function(e){return this[x.p(e)]()},g.add=function(n,d){var u,h=this;n=Number(n);var m=x.p(d),p=function(e){var t=k(h);return x.w(t.date(t.date()+Math.round(e*n)),h)};if(m===l)return this.set(l,this.$M+n);if(m===c)return this.set(c,this.$y+n);if(m===o)return p(1);if(m===s)return p(7);var _=(u={},u[r]=e,u[a]=t,u[i]=1e3,u)[m]||1,g=this.$d.getTime()+n*_;return x.w(g,this)},g.subtract=function(e,t){return this.add(-1*e,t)},g.format=function(e){var t=this,n=this.$locale();if(!this.isValid())return n.invalidDate||h;var i=e||"YYYY-MM-DDTHH:mm:ssZ",r=x.z(this),a=this.$H,o=this.$m,s=this.$M,l=n.weekdays,d=n.months,c=n.meridiem,u=function(e,n,r,a){return e&&(e[n]||e(t,i))||r[n].slice(0,a)},m=function(e){return x.s(a%12||12,e,"0")},_=c||function(e,t,n){var i=e<12?"AM":"PM";return n?i.toLowerCase():i};return i.replace(p,function(e,i){return i||function(e){switch(e){case"YY":return String(t.$y).slice(-2);case"YYYY":return x.s(t.$y,4,"0");case"M":return s+1;case"MM":return x.s(s+1,2,"0");case"MMM":return u(n.monthsShort,s,d,3);case"MMMM":return u(d,s);case"D":return t.$D;case"DD":return x.s(t.$D,2,"0");case"d":return String(t.$W);case"dd":return u(n.weekdaysMin,t.$W,l,2);case"ddd":return u(n.weekdaysShort,t.$W,l,3);case"dddd":return l[t.$W];case"H":return String(a);case"HH":return x.s(a,2,"0");case"h":return m(1);case"hh":return m(2);case"a":return _(a,o,!0);case"A":return _(a,o,!1);case"m":return String(o);case"mm":return x.s(o,2,"0");case"s":return String(t.$s);case"ss":return x.s(t.$s,2,"0");case"SSS":return x.s(t.$ms,3,"0");case"Z":return r}return null}(e)||r.replace(":","")})},g.utcOffset=function(){return 15*-Math.round(this.$d.getTimezoneOffset()/15)},g.diff=function(n,u,h){var m,p=this,_=x.p(u),g=k(n),f=(g.utcOffset()-this.utcOffset())*e,v=this-g,y=function(){return x.m(p,g)};switch(_){case c:m=y()/12;break;case l:m=y();break;case d:m=y()/3;break;case s:m=(v-f)/6048e5;break;case o:m=(v-f)/864e5;break;case a:m=v/t;break;case r:m=v/e;break;case i:m=v/1e3;break;default:m=v}return h?m:x.a(m)},g.daysInMonth=function(){return this.endOf(l).$D},g.$locale=function(){return y[this.$L]},g.locale=function(e,t){if(!e)return this.$L;var n=this.clone(),i=M(e,t,!0);return i&&(n.$L=i),n},g.clone=function(){return x.w(this.$d,this)},g.toDate=function(){return new Date(this.valueOf())},g.toJSON=function(){return this.isValid()?this.toISOString():null},g.toISOString=function(){return this.$d.toISOString()},g.toString=function(){return this.$d.toUTCString()},_}(),D=$.prototype;return k.prototype=D,[["$ms",n],["$s",i],["$m",r],["$H",a],["$W",o],["$M",l],["$y",c],["$D",u]].forEach(function(e){D[e[1]]=function(t){return this.$g(t,e[0],e[1])}}),k.extend=function(e,t){return e.$i||(e(t,$,k),e.$i=!0),k},k.locale=M,k.isDayjs=b,k.unix=function(e){return k(1e3*e)},k.en=y[v],k.Ls=y,k.p={},k}()),er.exports}var nr,ir,rr=Xi(tr()),ar={exports:{}},or=(nr||(nr=1,ar.exports=function(e,t,n){e=e||{};var i=t.prototype,r={future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"};function a(e,t,n,r){return i.fromToBase(e,t,n,r)}n.en.relativeTime=r,i.fromToBase=function(t,i,a,o,s){for(var l,d,c,u=a.$locale().relativeTime||r,h=e.thresholds||[{l:"s",r:44,d:"second"},{l:"m",r:89},{l:"mm",r:44,d:"minute"},{l:"h",r:89},{l:"hh",r:21,d:"hour"},{l:"d",r:35},{l:"dd",r:25,d:"day"},{l:"M",r:45},{l:"MM",r:10,d:"month"},{l:"y",r:17},{l:"yy",d:"year"}],m=h.length,p=0;p<m;p+=1){var _=h[p];_.d&&(l=o?n(t).diff(a,_.d,!0):a.diff(t,_.d,!0));var g=(e.rounding||Math.round)(Math.abs(l));if(c=l>0,g<=_.r||!_.r){g<=1&&p>0&&(_=h[p-1]);var f=u[_.l];s&&(g=s(""+g)),d="string"==typeof f?f.replace("%d",g):f(g,i,_.l,c);break}}if(i)return d;var v=c?u.future:u.past;return"function"==typeof v?v(d):v.replace("%s",d)},i.to=function(e,t){return a(e,t,this,!0)},i.from=function(e,t){return a(e,t,this)};var o=function(e){return e.$u?n.utc():n()};i.toNow=function(e){return this.to(o(this),e)},i.fromNow=function(e){return this.from(o(this),e)}}),ar.exports),sr=Xi(or);ir||(ir=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(tr()),t={name:"bg",weekdays:"неделя_понеделник_вторник_сряда_четвъртък_петък_събота".split("_"),weekdaysShort:"нед_пон_вто_сря_чет_пет_съб".split("_"),weekdaysMin:"нд_пн_вт_ср_чт_пт_сб".split("_"),months:"януари_февруари_март_април_май_юни_юли_август_септември_октомври_ноември_декември".split("_"),monthsShort:"яну_фев_мар_апр_май_юни_юли_авг_сеп_окт_ное_дек".split("_"),weekStart:1,ordinal:function(e){var t=e%100;if(t>10&&t<20)return e+"-ти";var n=e%10;return 1===n?e+"-ви":2===n?e+"-ри":7===n||8===n?e+"-ми":e+"-ти"},formats:{LT:"H:mm",LTS:"H:mm:ss",L:"D.MM.YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY H:mm",LLLL:"dddd, D MMMM YYYY H:mm"},relativeTime:{future:"след %s",past:"преди %s",s:"няколко секунди",m:"минута",mm:"%d минути",h:"час",hh:"%d часа",d:"ден",dd:"%d дена",M:"месец",MM:"%d месеца",y:"година",yy:"%d години"}};e.default.locale(t,null,!0)}());var lr;lr||(lr=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(tr()),t={name:"ca",weekdays:"Diumenge_Dilluns_Dimarts_Dimecres_Dijous_Divendres_Dissabte".split("_"),weekdaysShort:"Dg._Dl._Dt._Dc._Dj._Dv._Ds.".split("_"),weekdaysMin:"Dg_Dl_Dt_Dc_Dj_Dv_Ds".split("_"),months:"Gener_Febrer_Març_Abril_Maig_Juny_Juliol_Agost_Setembre_Octubre_Novembre_Desembre".split("_"),monthsShort:"Gen._Febr._Març_Abr._Maig_Juny_Jul._Ag._Set._Oct._Nov._Des.".split("_"),weekStart:1,formats:{LT:"H:mm",LTS:"H:mm:ss",L:"DD/MM/YYYY",LL:"D MMMM [de] YYYY",LLL:"D MMMM [de] YYYY [a les] H:mm",LLLL:"dddd D MMMM [de] YYYY [a les] H:mm",ll:"D MMM YYYY",lll:"D MMM YYYY, H:mm",llll:"ddd D MMM YYYY, H:mm"},relativeTime:{future:"d'aquí %s",past:"fa %s",s:"uns segons",m:"un minut",mm:"%d minuts",h:"una hora",hh:"%d hores",d:"un dia",dd:"%d dies",M:"un mes",MM:"%d mesos",y:"un any",yy:"%d anys"},ordinal:function(e){return e+(1===e||3===e?"r":2===e?"n":4===e?"t":"è")}};e.default.locale(t,null,!0)}());var dr;dr||(dr=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(tr());function t(e){return e>1&&e<5&&1!=~~(e/10)}function n(e,n,i,r){var a=e+" ";switch(i){case"s":return n||r?"pár sekund":"pár sekundami";case"m":return n?"minuta":r?"minutu":"minutou";case"mm":return n||r?a+(t(e)?"minuty":"minut"):a+"minutami";case"h":return n?"hodina":r?"hodinu":"hodinou";case"hh":return n||r?a+(t(e)?"hodiny":"hodin"):a+"hodinami";case"d":return n||r?"den":"dnem";case"dd":return n||r?a+(t(e)?"dny":"dní"):a+"dny";case"M":return n||r?"měsíc":"měsícem";case"MM":return n||r?a+(t(e)?"měsíce":"měsíců"):a+"měsíci";case"y":return n||r?"rok":"rokem";case"yy":return n||r?a+(t(e)?"roky":"let"):a+"lety"}}var i={name:"cs",weekdays:"neděle_pondělí_úterý_středa_čtvrtek_pátek_sobota".split("_"),weekdaysShort:"ne_po_út_st_čt_pá_so".split("_"),weekdaysMin:"ne_po_út_st_čt_pá_so".split("_"),months:"leden_únor_březen_duben_květen_červen_červenec_srpen_září_říjen_listopad_prosinec".split("_"),monthsShort:"led_úno_bře_dub_kvě_čvn_čvc_srp_zář_říj_lis_pro".split("_"),weekStart:1,yearStart:4,ordinal:function(e){return e+"."},formats:{LT:"H:mm",LTS:"H:mm:ss",L:"DD.MM.YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY H:mm",LLLL:"dddd D. MMMM YYYY H:mm",l:"D. M. YYYY"},relativeTime:{future:"za %s",past:"před %s",s:n,m:n,mm:n,h:n,hh:n,d:n,dd:n,M:n,MM:n,y:n,yy:n}};e.default.locale(i,null,!0)}());var cr;cr||(cr=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(tr()),t={name:"da",weekdays:"søndag_mandag_tirsdag_onsdag_torsdag_fredag_lørdag".split("_"),weekdaysShort:"søn._man._tirs._ons._tors._fre._lør.".split("_"),weekdaysMin:"sø._ma._ti._on._to._fr._lø.".split("_"),months:"januar_februar_marts_april_maj_juni_juli_august_september_oktober_november_december".split("_"),monthsShort:"jan._feb._mar._apr._maj_juni_juli_aug._sept._okt._nov._dec.".split("_"),weekStart:1,yearStart:4,ordinal:function(e){return e+"."},formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD.MM.YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY HH:mm",LLLL:"dddd [d.] D. MMMM YYYY [kl.] HH:mm"},relativeTime:{future:"om %s",past:"%s siden",s:"få sekunder",m:"et minut",mm:"%d minutter",h:"en time",hh:"%d timer",d:"en dag",dd:"%d dage",M:"en måned",MM:"%d måneder",y:"et år",yy:"%d år"}};e.default.locale(t,null,!0)}());var ur;ur||(ur=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(tr()),t={s:"ein paar Sekunden",m:["eine Minute","einer Minute"],mm:"%d Minuten",h:["eine Stunde","einer Stunde"],hh:"%d Stunden",d:["ein Tag","einem Tag"],dd:["%d Tage","%d Tagen"],M:["ein Monat","einem Monat"],MM:["%d Monate","%d Monaten"],y:["ein Jahr","einem Jahr"],yy:["%d Jahre","%d Jahren"]};function n(e,n,i){var r=t[i];return Array.isArray(r)&&(r=r[n?0:1]),r.replace("%d",e)}var i={name:"de",weekdays:"Sonntag_Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag".split("_"),weekdaysShort:"So._Mo._Di._Mi._Do._Fr._Sa.".split("_"),weekdaysMin:"So_Mo_Di_Mi_Do_Fr_Sa".split("_"),months:"Januar_Februar_März_April_Mai_Juni_Juli_August_September_Oktober_November_Dezember".split("_"),monthsShort:"Jan._Feb._März_Apr._Mai_Juni_Juli_Aug._Sept._Okt._Nov._Dez.".split("_"),ordinal:function(e){return e+"."},weekStart:1,yearStart:4,formats:{LTS:"HH:mm:ss",LT:"HH:mm",L:"DD.MM.YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY HH:mm",LLLL:"dddd, D. MMMM YYYY HH:mm"},relativeTime:{future:"in %s",past:"vor %s",s:n,m:n,mm:n,h:n,hh:n,d:n,dd:n,M:n,MM:n,y:n,yy:n}};e.default.locale(i,null,!0)}());var hr;hr||(hr=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(tr()),t={name:"el",weekdays:"Κυριακή_Δευτέρα_Τρίτη_Τετάρτη_Πέμπτη_Παρασκευή_Σάββατο".split("_"),weekdaysShort:"Κυρ_Δευ_Τρι_Τετ_Πεμ_Παρ_Σαβ".split("_"),weekdaysMin:"Κυ_Δε_Τρ_Τε_Πε_Πα_Σα".split("_"),months:"Ιανουάριος_Φεβρουάριος_Μάρτιος_Απρίλιος_Μάιος_Ιούνιος_Ιούλιος_Αύγουστος_Σεπτέμβριος_Οκτώβριος_Νοέμβριος_Δεκέμβριος".split("_"),monthsShort:"Ιαν_Φεβ_Μαρ_Απρ_Μαι_Ιουν_Ιουλ_Αυγ_Σεπτ_Οκτ_Νοε_Δεκ".split("_"),ordinal:function(e){return e},weekStart:1,relativeTime:{future:"σε %s",past:"πριν %s",s:"μερικά δευτερόλεπτα",m:"ένα λεπτό",mm:"%d λεπτά",h:"μία ώρα",hh:"%d ώρες",d:"μία μέρα",dd:"%d μέρες",M:"ένα μήνα",MM:"%d μήνες",y:"ένα χρόνο",yy:"%d χρόνια"},formats:{LT:"h:mm A",LTS:"h:mm:ss A",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY h:mm A",LLLL:"dddd, D MMMM YYYY h:mm A"}};e.default.locale(t,null,!0)}());var mr;mr||(mr=1,"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),"January_February_March_April_May_June_July_August_September_October_November_December".split("_"));var pr;pr||(pr=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(tr()),t={name:"es",monthsShort:"ene_feb_mar_abr_may_jun_jul_ago_sep_oct_nov_dic".split("_"),weekdays:"domingo_lunes_martes_miércoles_jueves_viernes_sábado".split("_"),weekdaysShort:"dom._lun._mar._mié._jue._vie._sáb.".split("_"),weekdaysMin:"do_lu_ma_mi_ju_vi_sá".split("_"),months:"enero_febrero_marzo_abril_mayo_junio_julio_agosto_septiembre_octubre_noviembre_diciembre".split("_"),weekStart:1,formats:{LT:"H:mm",LTS:"H:mm:ss",L:"DD/MM/YYYY",LL:"D [de] MMMM [de] YYYY",LLL:"D [de] MMMM [de] YYYY H:mm",LLLL:"dddd, D [de] MMMM [de] YYYY H:mm"},relativeTime:{future:"en %s",past:"hace %s",s:"unos segundos",m:"un minuto",mm:"%d minutos",h:"una hora",hh:"%d horas",d:"un día",dd:"%d días",M:"un mes",MM:"%d meses",y:"un año",yy:"%d años"},ordinal:function(e){return e+"º"}};e.default.locale(t,null,!0)}());var _r;_r||(_r=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(tr());function t(e,t,n,i){var r={s:["mõne sekundi","mõni sekund","paar sekundit"],m:["ühe minuti","üks minut"],mm:["%d minuti","%d minutit"],h:["ühe tunni","tund aega","üks tund"],hh:["%d tunni","%d tundi"],d:["ühe päeva","üks päev"],M:["kuu aja","kuu aega","üks kuu"],MM:["%d kuu","%d kuud"],y:["ühe aasta","aasta","üks aasta"],yy:["%d aasta","%d aastat"]};return t?(r[n][2]?r[n][2]:r[n][1]).replace("%d",e):(i?r[n][0]:r[n][1]).replace("%d",e)}var n={name:"et",weekdays:"pühapäev_esmaspäev_teisipäev_kolmapäev_neljapäev_reede_laupäev".split("_"),weekdaysShort:"P_E_T_K_N_R_L".split("_"),weekdaysMin:"P_E_T_K_N_R_L".split("_"),months:"jaanuar_veebruar_märts_aprill_mai_juuni_juuli_august_september_oktoober_november_detsember".split("_"),monthsShort:"jaan_veebr_märts_apr_mai_juuni_juuli_aug_sept_okt_nov_dets".split("_"),ordinal:function(e){return e+"."},weekStart:1,relativeTime:{future:"%s pärast",past:"%s tagasi",s:t,m:t,mm:t,h:t,hh:t,d:t,dd:"%d päeva",M:t,MM:t,y:t,yy:t},formats:{LT:"H:mm",LTS:"H:mm:ss",L:"DD.MM.YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY H:mm",LLLL:"dddd, D. MMMM YYYY H:mm"}};e.default.locale(n,null,!0)}());var gr;gr||(gr=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(tr());function t(e,t,n,i){var r={s:"muutama sekunti",m:"minuutti",mm:"%d minuuttia",h:"tunti",hh:"%d tuntia",d:"päivä",dd:"%d päivää",M:"kuukausi",MM:"%d kuukautta",y:"vuosi",yy:"%d vuotta",numbers:"nolla_yksi_kaksi_kolme_neljä_viisi_kuusi_seitsemän_kahdeksan_yhdeksän".split("_")},a={s:"muutaman sekunnin",m:"minuutin",mm:"%d minuutin",h:"tunnin",hh:"%d tunnin",d:"päivän",dd:"%d päivän",M:"kuukauden",MM:"%d kuukauden",y:"vuoden",yy:"%d vuoden",numbers:"nollan_yhden_kahden_kolmen_neljän_viiden_kuuden_seitsemän_kahdeksan_yhdeksän".split("_")},o=i&&!t?a:r,s=o[n];return e<10?s.replace("%d",o.numbers[e]):s.replace("%d",e)}var n={name:"fi",weekdays:"sunnuntai_maanantai_tiistai_keskiviikko_torstai_perjantai_lauantai".split("_"),weekdaysShort:"su_ma_ti_ke_to_pe_la".split("_"),weekdaysMin:"su_ma_ti_ke_to_pe_la".split("_"),months:"tammikuu_helmikuu_maaliskuu_huhtikuu_toukokuu_kesäkuu_heinäkuu_elokuu_syyskuu_lokakuu_marraskuu_joulukuu".split("_"),monthsShort:"tammi_helmi_maalis_huhti_touko_kesä_heinä_elo_syys_loka_marras_joulu".split("_"),ordinal:function(e){return e+"."},weekStart:1,yearStart:4,relativeTime:{future:"%s päästä",past:"%s sitten",s:t,m:t,mm:t,h:t,hh:t,d:t,dd:t,M:t,MM:t,y:t,yy:t},formats:{LT:"HH.mm",LTS:"HH.mm.ss",L:"DD.MM.YYYY",LL:"D. MMMM[ta] YYYY",LLL:"D. MMMM[ta] YYYY, [klo] HH.mm",LLLL:"dddd, D. MMMM[ta] YYYY, [klo] HH.mm",l:"D.M.YYYY",ll:"D. MMM YYYY",lll:"D. MMM YYYY, [klo] HH.mm",llll:"ddd, D. MMM YYYY, [klo] HH.mm"}};e.default.locale(n,null,!0)}());var fr;fr||(fr=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(tr()),t={name:"fr",weekdays:"dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi".split("_"),weekdaysShort:"dim._lun._mar._mer._jeu._ven._sam.".split("_"),weekdaysMin:"di_lu_ma_me_je_ve_sa".split("_"),months:"janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre".split("_"),monthsShort:"janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.".split("_"),weekStart:1,yearStart:4,formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd D MMMM YYYY HH:mm"},relativeTime:{future:"dans %s",past:"il y a %s",s:"quelques secondes",m:"une minute",mm:"%d minutes",h:"une heure",hh:"%d heures",d:"un jour",dd:"%d jours",M:"un mois",MM:"%d mois",y:"un an",yy:"%d ans"},ordinal:function(e){return e+(1===e?"er":"")}};e.default.locale(t,null,!0)}());var vr;vr||(vr=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(tr()),t={s:"מספר שניות",ss:"%d שניות",m:"דקה",mm:"%d דקות",h:"שעה",hh:"%d שעות",hh2:"שעתיים",d:"יום",dd:"%d ימים",dd2:"יומיים",M:"חודש",MM:"%d חודשים",MM2:"חודשיים",y:"שנה",yy:"%d שנים",yy2:"שנתיים"};function n(e,n,i){return(t[i+(2===e?"2":"")]||t[i]).replace("%d",e)}var i={name:"he",weekdays:"ראשון_שני_שלישי_רביעי_חמישי_שישי_שבת".split("_"),weekdaysShort:"א׳_ב׳_ג׳_ד׳_ה׳_ו׳_ש׳".split("_"),weekdaysMin:"א׳_ב׳_ג׳_ד׳_ה׳_ו_ש׳".split("_"),months:"ינואר_פברואר_מרץ_אפריל_מאי_יוני_יולי_אוגוסט_ספטמבר_אוקטובר_נובמבר_דצמבר".split("_"),monthsShort:"ינו_פבר_מרץ_אפר_מאי_יונ_יול_אוג_ספט_אוק_נוב_דצמ".split("_"),relativeTime:{future:"בעוד %s",past:"לפני %s",s:n,m:n,mm:n,h:n,hh:n,d:n,dd:n,M:n,MM:n,y:n,yy:n},ordinal:function(e){return e},format:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D [ב]MMMM YYYY",LLL:"D [ב]MMMM YYYY HH:mm",LLLL:"dddd, D [ב]MMMM YYYY HH:mm",l:"D/M/YYYY",ll:"D MMM YYYY",lll:"D MMM YYYY HH:mm",llll:"ddd, D MMM YYYY HH:mm"},formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D [ב]MMMM YYYY",LLL:"D [ב]MMMM YYYY HH:mm",LLLL:"dddd, D [ב]MMMM YYYY HH:mm",l:"D/M/YYYY",ll:"D MMM YYYY",lll:"D MMM YYYY HH:mm",llll:"ddd, D MMM YYYY HH:mm"}};e.default.locale(i,null,!0)}());var yr;yr||(yr=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(tr()),t="siječnja_veljače_ožujka_travnja_svibnja_lipnja_srpnja_kolovoza_rujna_listopada_studenoga_prosinca".split("_"),n="siječanj_veljača_ožujak_travanj_svibanj_lipanj_srpanj_kolovoz_rujan_listopad_studeni_prosinac".split("_"),i=/D[oD]?(\[[^[\]]*\]|\s)+MMMM?/,r=function(e,r){return i.test(r)?t[e.month()]:n[e.month()]};r.s=n,r.f=t;var a={name:"hr",weekdays:"nedjelja_ponedjeljak_utorak_srijeda_četvrtak_petak_subota".split("_"),weekdaysShort:"ned._pon._uto._sri._čet._pet._sub.".split("_"),weekdaysMin:"ne_po_ut_sr_če_pe_su".split("_"),months:r,monthsShort:"sij._velj._ožu._tra._svi._lip._srp._kol._ruj._lis._stu._pro.".split("_"),weekStart:1,formats:{LT:"H:mm",LTS:"H:mm:ss",L:"DD.MM.YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY H:mm",LLLL:"dddd, D. MMMM YYYY H:mm"},relativeTime:{future:"za %s",past:"prije %s",s:"sekunda",m:"minuta",mm:"%d minuta",h:"sat",hh:"%d sati",d:"dan",dd:"%d dana",M:"mjesec",MM:"%d mjeseci",y:"godina",yy:"%d godine"},ordinal:function(e){return e+"."}};e.default.locale(a,null,!0)}());var wr;wr||(wr=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(tr()),t={name:"hu",weekdays:"vasárnap_hétfő_kedd_szerda_csütörtök_péntek_szombat".split("_"),weekdaysShort:"vas_hét_kedd_sze_csüt_pén_szo".split("_"),weekdaysMin:"v_h_k_sze_cs_p_szo".split("_"),months:"január_február_március_április_május_június_július_augusztus_szeptember_október_november_december".split("_"),monthsShort:"jan_feb_márc_ápr_máj_jún_júl_aug_szept_okt_nov_dec".split("_"),ordinal:function(e){return e+"."},weekStart:1,relativeTime:{future:"%s múlva",past:"%s",s:function(e,t,n,i){return"néhány másodperc"+(i||t?"":"e")},m:function(e,t,n,i){return"egy perc"+(i||t?"":"e")},mm:function(e,t,n,i){return e+" perc"+(i||t?"":"e")},h:function(e,t,n,i){return"egy "+(i||t?"óra":"órája")},hh:function(e,t,n,i){return e+" "+(i||t?"óra":"órája")},d:function(e,t,n,i){return"egy "+(i||t?"nap":"napja")},dd:function(e,t,n,i){return e+" "+(i||t?"nap":"napja")},M:function(e,t,n,i){return"egy "+(i||t?"hónap":"hónapja")},MM:function(e,t,n,i){return e+" "+(i||t?"hónap":"hónapja")},y:function(e,t,n,i){return"egy "+(i||t?"év":"éve")},yy:function(e,t,n,i){return e+" "+(i||t?"év":"éve")}},formats:{LT:"H:mm",LTS:"H:mm:ss",L:"YYYY.MM.DD.",LL:"YYYY. MMMM D.",LLL:"YYYY. MMMM D. H:mm",LLLL:"YYYY. MMMM D., dddd H:mm"}};e.default.locale(t,null,!0)}());var br;br||(br=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(tr()),t={s:["nokkrar sekúndur","nokkrar sekúndur","nokkrum sekúndum"],m:["mínúta","mínútu","mínútu"],mm:["mínútur","mínútur","mínútum"],h:["klukkustund","klukkustund","klukkustund"],hh:["klukkustundir","klukkustundir","klukkustundum"],d:["dagur","dag","degi"],dd:["dagar","daga","dögum"],M:["mánuður","mánuð","mánuði"],MM:["mánuðir","mánuði","mánuðum"],y:["ár","ár","ári"],yy:["ár","ár","árum"]};function n(e,n,i,r){var a=function(e,n,i,r){var a=r?0:i?1:2,o=2===e.length&&n%10==1?e[0]:e,s=t[o][a];return 1===e.length?s:"%d "+s}(i,e,r,n);return a.replace("%d",e)}var i={name:"is",weekdays:"sunnudagur_mánudagur_þriðjudagur_miðvikudagur_fimmtudagur_föstudagur_laugardagur".split("_"),months:"janúar_febrúar_mars_apríl_maí_júní_júlí_ágúst_september_október_nóvember_desember".split("_"),weekStart:1,weekdaysShort:"sun_mán_þri_mið_fim_fös_lau".split("_"),monthsShort:"jan_feb_mar_apr_maí_jún_júl_ágú_sep_okt_nóv_des".split("_"),weekdaysMin:"Su_Má_Þr_Mi_Fi_Fö_La".split("_"),ordinal:function(e){return e},formats:{LT:"H:mm",LTS:"H:mm:ss",L:"DD.MM.YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY [kl.] H:mm",LLLL:"dddd, D. MMMM YYYY [kl.] H:mm"},relativeTime:{future:"eftir %s",past:"fyrir %s síðan",s:n,m:n,mm:n,h:n,hh:n,d:n,dd:n,M:n,MM:n,y:n,yy:n}};e.default.locale(i,null,!0)}());var Mr;Mr||(Mr=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(tr()),t={name:"it",weekdays:"domenica_lunedì_martedì_mercoledì_giovedì_venerdì_sabato".split("_"),weekdaysShort:"dom_lun_mar_mer_gio_ven_sab".split("_"),weekdaysMin:"do_lu_ma_me_gi_ve_sa".split("_"),months:"gennaio_febbraio_marzo_aprile_maggio_giugno_luglio_agosto_settembre_ottobre_novembre_dicembre".split("_"),weekStart:1,monthsShort:"gen_feb_mar_apr_mag_giu_lug_ago_set_ott_nov_dic".split("_"),formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd D MMMM YYYY HH:mm"},relativeTime:{future:"tra %s",past:"%s fa",s:"qualche secondo",m:"un minuto",mm:"%d minuti",h:"un'ora",hh:"%d ore",d:"un giorno",dd:"%d giorni",M:"un mese",MM:"%d mesi",y:"un anno",yy:"%d anni"},ordinal:function(e){return e+"º"}};e.default.locale(t,null,!0)}());var kr;kr||(kr=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(tr()),t={name:"ko",weekdays:"일요일_월요일_화요일_수요일_목요일_금요일_토요일".split("_"),weekdaysShort:"일_월_화_수_목_금_토".split("_"),weekdaysMin:"일_월_화_수_목_금_토".split("_"),months:"1월_2월_3월_4월_5월_6월_7월_8월_9월_10월_11월_12월".split("_"),monthsShort:"1월_2월_3월_4월_5월_6월_7월_8월_9월_10월_11월_12월".split("_"),ordinal:function(e){return e+"일"},formats:{LT:"A h:mm",LTS:"A h:mm:ss",L:"YYYY.MM.DD.",LL:"YYYY년 MMMM D일",LLL:"YYYY년 MMMM D일 A h:mm",LLLL:"YYYY년 MMMM D일 dddd A h:mm",l:"YYYY.MM.DD.",ll:"YYYY년 MMMM D일",lll:"YYYY년 MMMM D일 A h:mm",llll:"YYYY년 MMMM D일 dddd A h:mm"},meridiem:function(e){return e<12?"오전":"오후"},relativeTime:{future:"%s 후",past:"%s 전",s:"몇 초",m:"1분",mm:"%d분",h:"한 시간",hh:"%d시간",d:"하루",dd:"%d일",M:"한 달",MM:"%d달",y:"일 년",yy:"%d년"}};e.default.locale(t,null,!0)}());var xr;xr||(xr=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(tr()),t="sausio_vasario_kovo_balandžio_gegužės_birželio_liepos_rugpjūčio_rugsėjo_spalio_lapkričio_gruodžio".split("_"),n="sausis_vasaris_kovas_balandis_gegužė_birželis_liepa_rugpjūtis_rugsėjis_spalis_lapkritis_gruodis".split("_"),i=/D[oD]?(\[[^\[\]]*\]|\s)+MMMM?|MMMM?(\[[^\[\]]*\]|\s)+D[oD]?/,r=function(e,r){return i.test(r)?t[e.month()]:n[e.month()]};r.s=n,r.f=t;var a={name:"lt",weekdays:"sekmadienis_pirmadienis_antradienis_trečiadienis_ketvirtadienis_penktadienis_šeštadienis".split("_"),weekdaysShort:"sek_pir_ant_tre_ket_pen_šeš".split("_"),weekdaysMin:"s_p_a_t_k_pn_š".split("_"),months:r,monthsShort:"sau_vas_kov_bal_geg_bir_lie_rgp_rgs_spa_lap_grd".split("_"),ordinal:function(e){return e+"."},weekStart:1,relativeTime:{future:"už %s",past:"prieš %s",s:"kelias sekundes",m:"minutę",mm:"%d minutes",h:"valandą",hh:"%d valandas",d:"dieną",dd:"%d dienas",M:"mėnesį",MM:"%d mėnesius",y:"metus",yy:"%d metus"},format:{LT:"HH:mm",LTS:"HH:mm:ss",L:"YYYY-MM-DD",LL:"YYYY [m.] MMMM D [d.]",LLL:"YYYY [m.] MMMM D [d.], HH:mm [val.]",LLLL:"YYYY [m.] MMMM D [d.], dddd, HH:mm [val.]",l:"YYYY-MM-DD",ll:"YYYY [m.] MMMM D [d.]",lll:"YYYY [m.] MMMM D [d.], HH:mm [val.]",llll:"YYYY [m.] MMMM D [d.], ddd, HH:mm [val.]"},formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"YYYY-MM-DD",LL:"YYYY [m.] MMMM D [d.]",LLL:"YYYY [m.] MMMM D [d.], HH:mm [val.]",LLLL:"YYYY [m.] MMMM D [d.], dddd, HH:mm [val.]",l:"YYYY-MM-DD",ll:"YYYY [m.] MMMM D [d.]",lll:"YYYY [m.] MMMM D [d.], HH:mm [val.]",llll:"YYYY [m.] MMMM D [d.], ddd, HH:mm [val.]"}};e.default.locale(a,null,!0)}());var $r;$r||($r=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(tr()),t={name:"lv",weekdays:"svētdiena_pirmdiena_otrdiena_trešdiena_ceturtdiena_piektdiena_sestdiena".split("_"),months:"janvāris_februāris_marts_aprīlis_maijs_jūnijs_jūlijs_augusts_septembris_oktobris_novembris_decembris".split("_"),weekStart:1,weekdaysShort:"Sv_P_O_T_C_Pk_S".split("_"),monthsShort:"jan_feb_mar_apr_mai_jūn_jūl_aug_sep_okt_nov_dec".split("_"),weekdaysMin:"Sv_P_O_T_C_Pk_S".split("_"),ordinal:function(e){return e},formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD.MM.YYYY.",LL:"YYYY. [gada] D. MMMM",LLL:"YYYY. [gada] D. MMMM, HH:mm",LLLL:"YYYY. [gada] D. MMMM, dddd, HH:mm"},relativeTime:{future:"pēc %s",past:"pirms %s",s:"dažām sekundēm",m:"minūtes",mm:"%d minūtēm",h:"stundas",hh:"%d stundām",d:"dienas",dd:"%d dienām",M:"mēneša",MM:"%d mēnešiem",y:"gada",yy:"%d gadiem"}};e.default.locale(t,null,!0)}());var Dr;Dr||(Dr=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(tr()),t={name:"nb",weekdays:"søndag_mandag_tirsdag_onsdag_torsdag_fredag_lørdag".split("_"),weekdaysShort:"sø._ma._ti._on._to._fr._lø.".split("_"),weekdaysMin:"sø_ma_ti_on_to_fr_lø".split("_"),months:"januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember".split("_"),monthsShort:"jan._feb._mars_april_mai_juni_juli_aug._sep._okt._nov._des.".split("_"),ordinal:function(e){return e+"."},weekStart:1,yearStart:4,formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD.MM.YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY [kl.] HH:mm",LLLL:"dddd D. MMMM YYYY [kl.] HH:mm"},relativeTime:{future:"om %s",past:"%s siden",s:"noen sekunder",m:"ett minutt",mm:"%d minutter",h:"en time",hh:"%d timer",d:"en dag",dd:"%d dager",M:"en måned",MM:"%d måneder",y:"ett år",yy:"%d år"}};e.default.locale(t,null,!0)}());var Sr;Sr||(Sr=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(tr()),t={name:"nl",weekdays:"zondag_maandag_dinsdag_woensdag_donderdag_vrijdag_zaterdag".split("_"),weekdaysShort:"zo._ma._di._wo._do._vr._za.".split("_"),weekdaysMin:"zo_ma_di_wo_do_vr_za".split("_"),months:"januari_februari_maart_april_mei_juni_juli_augustus_september_oktober_november_december".split("_"),monthsShort:"jan_feb_mrt_apr_mei_jun_jul_aug_sep_okt_nov_dec".split("_"),ordinal:function(e){return"["+e+(1===e||8===e||e>=20?"ste":"de")+"]"},weekStart:1,yearStart:4,formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD-MM-YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd D MMMM YYYY HH:mm"},relativeTime:{future:"over %s",past:"%s geleden",s:"een paar seconden",m:"een minuut",mm:"%d minuten",h:"een uur",hh:"%d uur",d:"een dag",dd:"%d dagen",M:"een maand",MM:"%d maanden",y:"een jaar",yy:"%d jaar"}};e.default.locale(t,null,!0)}());var Tr;Tr||(Tr=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(tr()),t={name:"nn",weekdays:"sundag_måndag_tysdag_onsdag_torsdag_fredag_laurdag".split("_"),weekdaysShort:"sun_mån_tys_ons_tor_fre_lau".split("_"),weekdaysMin:"su_må_ty_on_to_fr_la".split("_"),months:"januar_februar_mars_april_mai_juni_juli_august_september_oktober_november_desember".split("_"),monthsShort:"jan_feb_mar_apr_mai_jun_jul_aug_sep_okt_nov_des".split("_"),ordinal:function(e){return e+"."},weekStart:1,relativeTime:{future:"om %s",past:"for %s sidan",s:"nokre sekund",m:"eitt minutt",mm:"%d minutt",h:"ein time",hh:"%d timar",d:"ein dag",dd:"%d dagar",M:"ein månad",MM:"%d månadar",y:"eitt år",yy:"%d år"},formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD.MM.YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY [kl.] H:mm",LLLL:"dddd D. MMMM YYYY [kl.] HH:mm"}};e.default.locale(t,null,!0)}());var Lr;Lr||(Lr=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(tr());function t(e){return e%10<5&&e%10>1&&~~(e/10)%10!=1}function n(e,n,i){var r=e+" ";switch(i){case"m":return n?"minuta":"minutę";case"mm":return r+(t(e)?"minuty":"minut");case"h":return n?"godzina":"godzinę";case"hh":return r+(t(e)?"godziny":"godzin");case"MM":return r+(t(e)?"miesiące":"miesięcy");case"yy":return r+(t(e)?"lata":"lat")}}var i="stycznia_lutego_marca_kwietnia_maja_czerwca_lipca_sierpnia_września_października_listopada_grudnia".split("_"),r="styczeń_luty_marzec_kwiecień_maj_czerwiec_lipiec_sierpień_wrzesień_październik_listopad_grudzień".split("_"),a=/D MMMM/,o=function(e,t){return a.test(t)?i[e.month()]:r[e.month()]};o.s=r,o.f=i;var s={name:"pl",weekdays:"niedziela_poniedziałek_wtorek_środa_czwartek_piątek_sobota".split("_"),weekdaysShort:"ndz_pon_wt_śr_czw_pt_sob".split("_"),weekdaysMin:"Nd_Pn_Wt_Śr_Cz_Pt_So".split("_"),months:o,monthsShort:"sty_lut_mar_kwi_maj_cze_lip_sie_wrz_paź_lis_gru".split("_"),ordinal:function(e){return e+"."},weekStart:1,yearStart:4,relativeTime:{future:"za %s",past:"%s temu",s:"kilka sekund",m:n,mm:n,h:n,hh:n,d:"1 dzień",dd:"%d dni",M:"miesiąc",MM:n,y:"rok",yy:n},formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD.MM.YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd, D MMMM YYYY HH:mm"}};e.default.locale(s,null,!0)}());var Yr;Yr||(Yr=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(tr()),t={name:"pt",weekdays:"domingo_segunda-feira_terça-feira_quarta-feira_quinta-feira_sexta-feira_sábado".split("_"),weekdaysShort:"dom_seg_ter_qua_qui_sex_sab".split("_"),weekdaysMin:"Do_2ª_3ª_4ª_5ª_6ª_Sa".split("_"),months:"janeiro_fevereiro_março_abril_maio_junho_julho_agosto_setembro_outubro_novembro_dezembro".split("_"),monthsShort:"jan_fev_mar_abr_mai_jun_jul_ago_set_out_nov_dez".split("_"),ordinal:function(e){return e+"º"},weekStart:1,yearStart:4,formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D [de] MMMM [de] YYYY",LLL:"D [de] MMMM [de] YYYY [às] HH:mm",LLLL:"dddd, D [de] MMMM [de] YYYY [às] HH:mm"},relativeTime:{future:"em %s",past:"há %s",s:"alguns segundos",m:"um minuto",mm:"%d minutos",h:"uma hora",hh:"%d horas",d:"um dia",dd:"%d dias",M:"um mês",MM:"%d meses",y:"um ano",yy:"%d anos"}};e.default.locale(t,null,!0)}());var Cr;Cr||(Cr=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(tr()),t={name:"ro",weekdays:"Duminică_Luni_Marți_Miercuri_Joi_Vineri_Sâmbătă".split("_"),weekdaysShort:"Dum_Lun_Mar_Mie_Joi_Vin_Sâm".split("_"),weekdaysMin:"Du_Lu_Ma_Mi_Jo_Vi_Sâ".split("_"),months:"Ianuarie_Februarie_Martie_Aprilie_Mai_Iunie_Iulie_August_Septembrie_Octombrie_Noiembrie_Decembrie".split("_"),monthsShort:"Ian._Febr._Mart._Apr._Mai_Iun._Iul._Aug._Sept._Oct._Nov._Dec.".split("_"),weekStart:1,formats:{LT:"H:mm",LTS:"H:mm:ss",L:"DD.MM.YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY H:mm",LLLL:"dddd, D MMMM YYYY H:mm"},relativeTime:{future:"peste %s",past:"acum %s",s:"câteva secunde",m:"un minut",mm:"%d minute",h:"o oră",hh:"%d ore",d:"o zi",dd:"%d zile",M:"o lună",MM:"%d luni",y:"un an",yy:"%d ani"},ordinal:function(e){return e}};e.default.locale(t,null,!0)}());var Er;Er||(Er=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(tr()),t="января_февраля_марта_апреля_мая_июня_июля_августа_сентября_октября_ноября_декабря".split("_"),n="январь_февраль_март_апрель_май_июнь_июль_август_сентябрь_октябрь_ноябрь_декабрь".split("_"),i="янв._февр._мар._апр._мая_июня_июля_авг._сент._окт._нояб._дек.".split("_"),r="янв._февр._март_апр._май_июнь_июль_авг._сент._окт._нояб._дек.".split("_"),a=/D[oD]?(\[[^[\]]*\]|\s)+MMMM?/;function o(e,t,n){var i,r;return"m"===n?t?"минута":"минуту":e+" "+(i=+e,r={mm:t?"минута_минуты_минут":"минуту_минуты_минут",hh:"час_часа_часов",dd:"день_дня_дней",MM:"месяц_месяца_месяцев",yy:"год_года_лет"}[n].split("_"),i%10==1&&i%100!=11?r[0]:i%10>=2&&i%10<=4&&(i%100<10||i%100>=20)?r[1]:r[2])}var s=function(e,i){return a.test(i)?t[e.month()]:n[e.month()]};s.s=n,s.f=t;var l=function(e,t){return a.test(t)?i[e.month()]:r[e.month()]};l.s=r,l.f=i;var d={name:"ru",weekdays:"воскресенье_понедельник_вторник_среда_четверг_пятница_суббота".split("_"),weekdaysShort:"вск_пнд_втр_срд_чтв_птн_сбт".split("_"),weekdaysMin:"вс_пн_вт_ср_чт_пт_сб".split("_"),months:s,monthsShort:l,weekStart:1,yearStart:4,formats:{LT:"H:mm",LTS:"H:mm:ss",L:"DD.MM.YYYY",LL:"D MMMM YYYY г.",LLL:"D MMMM YYYY г., H:mm",LLLL:"dddd, D MMMM YYYY г., H:mm"},relativeTime:{future:"через %s",past:"%s назад",s:"несколько секунд",m:o,mm:o,h:"час",hh:o,d:"день",dd:o,M:"месяц",MM:o,y:"год",yy:o},ordinal:function(e){return e},meridiem:function(e){return e<4?"ночи":e<12?"утра":e<17?"дня":"вечера"}};e.default.locale(d,null,!0)}());var Ar;Ar||(Ar=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(tr());function t(e){return e>1&&e<5&&1!=~~(e/10)}function n(e,n,i,r){var a=e+" ";switch(i){case"s":return n||r?"pár sekúnd":"pár sekundami";case"m":return n?"minúta":r?"minútu":"minútou";case"mm":return n||r?a+(t(e)?"minúty":"minút"):a+"minútami";case"h":return n?"hodina":r?"hodinu":"hodinou";case"hh":return n||r?a+(t(e)?"hodiny":"hodín"):a+"hodinami";case"d":return n||r?"deň":"dňom";case"dd":return n||r?a+(t(e)?"dni":"dní"):a+"dňami";case"M":return n||r?"mesiac":"mesiacom";case"MM":return n||r?a+(t(e)?"mesiace":"mesiacov"):a+"mesiacmi";case"y":return n||r?"rok":"rokom";case"yy":return n||r?a+(t(e)?"roky":"rokov"):a+"rokmi"}}var i={name:"sk",weekdays:"nedeľa_pondelok_utorok_streda_štvrtok_piatok_sobota".split("_"),weekdaysShort:"ne_po_ut_st_št_pi_so".split("_"),weekdaysMin:"ne_po_ut_st_št_pi_so".split("_"),months:"január_február_marec_apríl_máj_jún_júl_august_september_október_november_december".split("_"),monthsShort:"jan_feb_mar_apr_máj_jún_júl_aug_sep_okt_nov_dec".split("_"),weekStart:1,yearStart:4,ordinal:function(e){return e+"."},formats:{LT:"H:mm",LTS:"H:mm:ss",L:"DD.MM.YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY H:mm",LLLL:"dddd D. MMMM YYYY H:mm",l:"D. M. YYYY"},relativeTime:{future:"za %s",past:"pred %s",s:n,m:n,mm:n,h:n,hh:n,d:n,dd:n,M:n,MM:n,y:n,yy:n}};e.default.locale(i,null,!0)}());var Pr;Pr||(Pr=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(tr());function t(e){return e%100==2}function n(e){return e%100==3||e%100==4}function i(e,i,r,a){var o=e+" ";switch(r){case"s":return i||a?"nekaj sekund":"nekaj sekundami";case"m":return i?"ena minuta":"eno minuto";case"mm":return t(e)?o+(i||a?"minuti":"minutama"):n(e)?o+(i||a?"minute":"minutami"):o+(i||a?"minut":"minutami");case"h":return i?"ena ura":"eno uro";case"hh":return t(e)?o+(i||a?"uri":"urama"):n(e)?o+(i||a?"ure":"urami"):o+(i||a?"ur":"urami");case"d":return i||a?"en dan":"enim dnem";case"dd":return t(e)?o+(i||a?"dneva":"dnevoma"):o+(i||a?"dni":"dnevi");case"M":return i||a?"en mesec":"enim mesecem";case"MM":return t(e)?o+(i||a?"meseca":"mesecema"):n(e)?o+(i||a?"mesece":"meseci"):o+(i||a?"mesecev":"meseci");case"y":return i||a?"eno leto":"enim letom";case"yy":return t(e)?o+(i||a?"leti":"letoma"):n(e)?o+(i||a?"leta":"leti"):o+(i||a?"let":"leti")}}var r={name:"sl",weekdays:"nedelja_ponedeljek_torek_sreda_četrtek_petek_sobota".split("_"),months:"januar_februar_marec_april_maj_junij_julij_avgust_september_oktober_november_december".split("_"),weekStart:1,weekdaysShort:"ned._pon._tor._sre._čet._pet._sob.".split("_"),monthsShort:"jan._feb._mar._apr._maj._jun._jul._avg._sep._okt._nov._dec.".split("_"),weekdaysMin:"ne_po_to_sr_če_pe_so".split("_"),ordinal:function(e){return e+"."},formats:{LT:"H:mm",LTS:"H:mm:ss",L:"DD.MM.YYYY",LL:"D. MMMM YYYY",LLL:"D. MMMM YYYY H:mm",LLLL:"dddd, D. MMMM YYYY H:mm",l:"D. M. YYYY"},relativeTime:{future:"čez %s",past:"pred %s",s:i,m:i,mm:i,h:i,hh:i,d:i,dd:i,M:i,MM:i,y:i,yy:i}};e.default.locale(r,null,!0)}());var Hr;Hr||(Hr=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(tr()),t={name:"sv",weekdays:"söndag_måndag_tisdag_onsdag_torsdag_fredag_lördag".split("_"),weekdaysShort:"sön_mån_tis_ons_tor_fre_lör".split("_"),weekdaysMin:"sö_må_ti_on_to_fr_lö".split("_"),months:"januari_februari_mars_april_maj_juni_juli_augusti_september_oktober_november_december".split("_"),monthsShort:"jan_feb_mar_apr_maj_jun_jul_aug_sep_okt_nov_dec".split("_"),weekStart:1,yearStart:4,ordinal:function(e){var t=e%10;return"["+e+(1===t||2===t?"a":"e")+"]"},formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"YYYY-MM-DD",LL:"D MMMM YYYY",LLL:"D MMMM YYYY [kl.] HH:mm",LLLL:"dddd D MMMM YYYY [kl.] HH:mm",lll:"D MMM YYYY HH:mm",llll:"ddd D MMM YYYY HH:mm"},relativeTime:{future:"om %s",past:"för %s sedan",s:"några sekunder",m:"en minut",mm:"%d minuter",h:"en timme",hh:"%d timmar",d:"en dag",dd:"%d dagar",M:"en månad",MM:"%d månader",y:"ett år",yy:"%d år"}};e.default.locale(t,null,!0)}());var zr;zr||(zr=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(tr()),t={name:"th",weekdays:"อาทิตย์_จันทร์_อังคาร_พุธ_พฤหัสบดี_ศุกร์_เสาร์".split("_"),weekdaysShort:"อาทิตย์_จันทร์_อังคาร_พุธ_พฤหัส_ศุกร์_เสาร์".split("_"),weekdaysMin:"อา._จ._อ._พ._พฤ._ศ._ส.".split("_"),months:"มกราคม_กุมภาพันธ์_มีนาคม_เมษายน_พฤษภาคม_มิถุนายน_กรกฎาคม_สิงหาคม_กันยายน_ตุลาคม_พฤศจิกายน_ธันวาคม".split("_"),monthsShort:"ม.ค._ก.พ._มี.ค._เม.ย._พ.ค._มิ.ย._ก.ค._ส.ค._ก.ย._ต.ค._พ.ย._ธ.ค.".split("_"),formats:{LT:"H:mm",LTS:"H:mm:ss",L:"DD/MM/YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY เวลา H:mm",LLLL:"วันddddที่ D MMMM YYYY เวลา H:mm"},relativeTime:{future:"อีก %s",past:"%sที่แล้ว",s:"ไม่กี่วินาที",m:"1 นาที",mm:"%d นาที",h:"1 ชั่วโมง",hh:"%d ชั่วโมง",d:"1 วัน",dd:"%d วัน",M:"1 เดือน",MM:"%d เดือน",y:"1 ปี",yy:"%d ปี"},ordinal:function(e){return e+"."}};e.default.locale(t,null,!0)}());var Fr;Fr||(Fr=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(tr()),t={name:"tr",weekdays:"Pazar_Pazartesi_Salı_Çarşamba_Perşembe_Cuma_Cumartesi".split("_"),weekdaysShort:"Paz_Pts_Sal_Çar_Per_Cum_Cts".split("_"),weekdaysMin:"Pz_Pt_Sa_Ça_Pe_Cu_Ct".split("_"),months:"Ocak_Şubat_Mart_Nisan_Mayıs_Haziran_Temmuz_Ağustos_Eylül_Ekim_Kasım_Aralık".split("_"),monthsShort:"Oca_Şub_Mar_Nis_May_Haz_Tem_Ağu_Eyl_Eki_Kas_Ara".split("_"),weekStart:1,formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD.MM.YYYY",LL:"D MMMM YYYY",LLL:"D MMMM YYYY HH:mm",LLLL:"dddd, D MMMM YYYY HH:mm"},relativeTime:{future:"%s sonra",past:"%s önce",s:"birkaç saniye",m:"bir dakika",mm:"%d dakika",h:"bir saat",hh:"%d saat",d:"bir gün",dd:"%d gün",M:"bir ay",MM:"%d ay",y:"bir yıl",yy:"%d yıl"},ordinal:function(e){return e+"."}};e.default.locale(t,null,!0)}());var jr;jr||(jr=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(tr()),t="січня_лютого_березня_квітня_травня_червня_липня_серпня_вересня_жовтня_листопада_грудня".split("_"),n="січень_лютий_березень_квітень_травень_червень_липень_серпень_вересень_жовтень_листопад_грудень".split("_"),i=/D[oD]?(\[[^[\]]*\]|\s)+MMMM?/;function r(e,t,n){var i,r;return"m"===n?t?"хвилина":"хвилину":"h"===n?t?"година":"годину":e+" "+(i=+e,r={ss:t?"секунда_секунди_секунд":"секунду_секунди_секунд",mm:t?"хвилина_хвилини_хвилин":"хвилину_хвилини_хвилин",hh:t?"година_години_годин":"годину_години_годин",dd:"день_дні_днів",MM:"місяць_місяці_місяців",yy:"рік_роки_років"}[n].split("_"),i%10==1&&i%100!=11?r[0]:i%10>=2&&i%10<=4&&(i%100<10||i%100>=20)?r[1]:r[2])}var a=function(e,r){return i.test(r)?t[e.month()]:n[e.month()]};a.s=n,a.f=t;var o={name:"uk",weekdays:"неділя_понеділок_вівторок_середа_четвер_п’ятниця_субота".split("_"),weekdaysShort:"ндл_пнд_втр_срд_чтв_птн_сбт".split("_"),weekdaysMin:"нд_пн_вт_ср_чт_пт_сб".split("_"),months:a,monthsShort:"січ_лют_бер_квіт_трав_черв_лип_серп_вер_жовт_лист_груд".split("_"),weekStart:1,relativeTime:{future:"за %s",past:"%s тому",s:"декілька секунд",m:r,mm:r,h:r,hh:r,d:"день",dd:r,M:"місяць",MM:r,y:"рік",yy:r},ordinal:function(e){return e},formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD.MM.YYYY",LL:"D MMMM YYYY р.",LLL:"D MMMM YYYY р., HH:mm",LLLL:"dddd, D MMMM YYYY р., HH:mm"}};e.default.locale(o,null,!0)}());var Or;Or||(Or=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(tr()),t={name:"vi",weekdays:"chủ nhật_thứ hai_thứ ba_thứ tư_thứ năm_thứ sáu_thứ bảy".split("_"),months:"tháng 1_tháng 2_tháng 3_tháng 4_tháng 5_tháng 6_tháng 7_tháng 8_tháng 9_tháng 10_tháng 11_tháng 12".split("_"),weekStart:1,weekdaysShort:"CN_T2_T3_T4_T5_T6_T7".split("_"),monthsShort:"Th01_Th02_Th03_Th04_Th05_Th06_Th07_Th08_Th09_Th10_Th11_Th12".split("_"),weekdaysMin:"CN_T2_T3_T4_T5_T6_T7".split("_"),ordinal:function(e){return e},formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"DD/MM/YYYY",LL:"D MMMM [năm] YYYY",LLL:"D MMMM [năm] YYYY HH:mm",LLLL:"dddd, D MMMM [năm] YYYY HH:mm",l:"DD/M/YYYY",ll:"D MMM YYYY",lll:"D MMM YYYY HH:mm",llll:"ddd, D MMM YYYY HH:mm"},relativeTime:{future:"%s tới",past:"%s trước",s:"vài giây",m:"một phút",mm:"%d phút",h:"một giờ",hh:"%d giờ",d:"một ngày",dd:"%d ngày",M:"một tháng",MM:"%d tháng",y:"một năm",yy:"%d năm"}};e.default.locale(t,null,!0)}());var Ir;Ir||(Ir=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(tr()),t={name:"zh-cn",weekdays:"星期日_星期一_星期二_星期三_星期四_星期五_星期六".split("_"),weekdaysShort:"周日_周一_周二_周三_周四_周五_周六".split("_"),weekdaysMin:"日_一_二_三_四_五_六".split("_"),months:"一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月".split("_"),monthsShort:"1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月".split("_"),ordinal:function(e,t){return"W"===t?e+"周":e+"日"},weekStart:1,yearStart:4,formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"YYYY/MM/DD",LL:"YYYY年M月D日",LLL:"YYYY年M月D日Ah点mm分",LLLL:"YYYY年M月D日ddddAh点mm分",l:"YYYY/M/D",ll:"YYYY年M月D日",lll:"YYYY年M月D日 HH:mm",llll:"YYYY年M月D日dddd HH:mm"},relativeTime:{future:"%s内",past:"%s前",s:"几秒",m:"1 分钟",mm:"%d 分钟",h:"1 小时",hh:"%d 小时",d:"1 天",dd:"%d 天",M:"1 个月",MM:"%d 个月",y:"1 年",yy:"%d 年"},meridiem:function(e,t){var n=100*e+t;return n<600?"凌晨":n<900?"早上":n<1100?"上午":n<1300?"中午":n<1800?"下午":"晚上"}};e.default.locale(t,null,!0)}());var Nr;Nr||(Nr=1,function(){var e=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(tr()),t={name:"zh-tw",weekdays:"星期日_星期一_星期二_星期三_星期四_星期五_星期六".split("_"),weekdaysShort:"週日_週一_週二_週三_週四_週五_週六".split("_"),weekdaysMin:"日_一_二_三_四_五_六".split("_"),months:"一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月".split("_"),monthsShort:"1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月".split("_"),ordinal:function(e,t){return"W"===t?e+"週":e+"日"},formats:{LT:"HH:mm",LTS:"HH:mm:ss",L:"YYYY/MM/DD",LL:"YYYY年M月D日",LLL:"YYYY年M月D日 HH:mm",LLLL:"YYYY年M月D日dddd HH:mm",l:"YYYY/M/D",ll:"YYYY年M月D日",lll:"YYYY年M月D日 HH:mm",llll:"YYYY年M月D日dddd HH:mm"},relativeTime:{future:"%s內",past:"%s前",s:"幾秒",m:"1 分鐘",mm:"%d 分鐘",h:"1 小時",hh:"%d 小時",d:"1 天",dd:"%d 天",M:"1 個月",MM:"%d 個月",y:"1 年",yy:"%d 年"},meridiem:function(e,t){var n=100*e+t;return n<600?"凌晨":n<900?"早上":n<1100?"上午":n<1300?"中午":n<1800?"下午":"晚上"}};e.default.locale(t,null,!0)}()),rr.extend(sr);const Rr=new Map;function Wr(e,t,n){const i=Vr(n),r="day"===t&&1===e?"auto":"always",a=`${i}:${r}`;let o=Rr.get(a);return o||(o=new Intl.RelativeTimeFormat(i,{numeric:r}),Rr.set(a,o)),o.format(e,t)}const Br=new Map;function qr(e){const t=Vr(e);let n=Br.get(t);if(void 0===n){const e=new Intl.RelativeTimeFormat(t,{numeric:"auto"}).format(0,"second");n=e.charAt(0).toLocaleUpperCase(t)+e.slice(1),Br.set(t,n)}return n}function Ur(e,t,n){const i=Vr(t),r=rr(e).locale(i);return n?r.from(rr(n)):r.fromNow()}function Vr(e){const t=e.toLowerCase();if("zh-cn"===t||"zh-tw"===t)return t;const n=t.split("-")[0];return["bg","ca","cs","da","de","el","en","es","et","fi","fr","he","hr","hu","is","it","ko","lt","lv","nb","nl","nn","pl","pt","ro","ru","sk","sl","sv","th","tr","uk","vi","zh-cn","zh-tw"].includes(n)?n:"en"}const Gr=new Map;function Kr(e,t=!0){if(!e)return"";if(!1===t)return e;const n=e.trim();if("string"==typeof t&&"true"!==t){const e=function(e){if(Gr.has(e))return Gr.get(e)??null;let t=null;try{t=new RegExp(`(${e})\\s*$`,"i")}catch{Ne(`Ignoring "remove_location_country": ${JSON.stringify(e)} is not a valid regular expression. Locations are shown unchanged.`)}return Gr.set(e,t),t}(t);return null===e?n:n.replace(e,"").replace(/,?\s*$/,"")}for(const e of ge)if(n.endsWith(e))return n.slice(0,n.length-e.length).replace(/,?\s*$/,"");return n}const Jr=/microsoft\s+teams|teams\.microsoft\.(?:com|us)|teams\.live\.com/i;const Zr=/<!--(?:-?>|[\s\S]*?-->)|<[a-zA-Z][^>]*>|<\/[^>]*>|<[!?][^>]*>/g;function Xr(e){return e&&0!==e.length?e.charAt(0).toUpperCase()+e.slice(1):e}function Qr(e){const[t,n,i]=e.split("-").map(Number);return new Date(t,n-1,i)}function ea(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}const ta={AF:[4,5],BH:[5,6],DZ:[5,6],EG:[5,6],IL:[5,6],IN:[0],IQ:[5,6],IR:[5],JO:[5,6],KW:[5,6],LY:[5,6],OM:[5,6],QA:[5,6],SA:[5,6],SD:[5,6],SY:[5,6],UG:[0],YE:[5,6]},na={ar:[5,6],fa:[5],he:[5,6],hi:[0],ml:[0],ta:[0],te:[0]},ia=[0,6];function ra(e){const t=e?.config?.country;if(t)return ta[t.toUpperCase()]??ia;const n=e?.locale?.language;if(!n)return ia;const i=n.toLowerCase();return na[i]??na[i.split("-")[0]]??ia}function aa(e,t){return ra(t).includes(e.getDay())}function oa(e,t){const n=Date.UTC(e.getFullYear(),e.getMonth(),e.getDate()),i=Date.UTC(t.getFullYear(),t.getMonth(),t.getDate());return Math.round((i-n)/864e5)}function sa(e,t=!0,n=!1){let i=e.getHours();const r=e.getMinutes();if(!t){const e=i>=12?"PM":"AM";return i=i%12||12,`${n?da(i):i}:${da(r)} ${e}`}return`${n?da(i):i}:${da(r)}`}function la(e,t){return!0===e.time_24h||!1!==e.time_24h&&function(e,t=!0){if(!e)return t;const n=()=>e.language?Ce(e.language)??t:t;if("24"===e.time_format)return!0;if("12"===e.time_format)return!1;if("language"===e.time_format&&e.language)return n();if("system"===e.time_format){const e="undefined"==typeof navigator?void 0:navigator.language;return(e?Ce(e):void 0)??n()}return t}(t?.locale,!1)}function da(e){return e.toString().padStart(2,"0")}function ca(e){const t=new Date(Date.UTC(e.getFullYear(),e.getMonth(),e.getDate()));t.setUTCDate(t.getUTCDate()+4-(t.getUTCDay()||7));const n=Date.UTC(t.getUTCFullYear(),0,1);return Math.ceil(((t.getTime()-n)/864e5+1)/7)}const ua=["sunday","monday","tuesday","wednesday","thursday","friday","saturday"],ha={af:0,ar:6,bn:0,en:0,"en-gb":1,fa:6,he:0,hi:0,id:0,is:0,ja:0,ko:0,ml:0,pt:0,"pt-br":0,ta:0,te:0,th:0,ur:0,"zh-hans":1,"zh-hant":0};function ma(e,t){if("sunday"===e)return 0;if("monday"===e)return 1;const n=ua.indexOf(t?.first_weekday??"");return-1!==n?n:t?.language?function(e){const t=e.toLowerCase();return ha[t]??ha[t.split("-")[0]]??1}(t.language):1}function pa(e){return e||"iso"}function _a(e,t,n,i=!0,r=!1){const a=sa(e,i,r);if(!n||function(e,t){return Math.floor(e.getTime()/6e4)===Math.floor(t.getTime()/6e4)}(e,t))return{text:a};const o=` - ${sa(t,i,r)}`;return{text:`${a}${o}`,end:o}}function ga(e,t,n,i,r=!0,a=!1){const o=new Date,s=new Date(o.getFullYear(),o.getMonth(),o.getDate()),l=new Date(s);l.setDate(l.getDate()+1);const d=e=>sa(e,r,a);let c;if(t.toDateString()===s.toDateString())c=`${i.endsToday} ${i.at} ${d(t)}`;else if(t.toDateString()===l.toDateString())c=`${i.endsTomorrow} ${i.at} ${d(t)}`;else{const e=t.getDate(),r=i.months[t.getMonth()],a=i.fullDaysOfWeek[t.getDay()],o=d(t);switch(Zi(n)){case"day-dot-month":c=`${a}, ${e}. ${r} ${i.at} ${o}`;break;case"month-day":c=`${a}, ${r} ${e} ${i.at} ${o}`;break;default:c=`${a}, ${e} ${r} ${i.at} ${o}`}}if(s.getTime()<=e.getTime()){const n=d(e);return t.toDateString()===s.toDateString()||t.toDateString()===l.toDateString()?`${n}, ${c}`:`${n} ${i.multiDay} ${c}`}return t.toDateString()===s.toDateString()||t.toDateString()===l.toDateString()?c:`${i.multiDay} ${c}`}function fa(e,t,n){const i=new Date,r=new Date(i.getFullYear(),i.getMonth(),i.getDate()),a=new Date(r);if(a.setDate(a.getDate()+1),e.toDateString()===r.toDateString())return n.endsToday;if(e.toDateString()===a.toDateString())return n.endsTomorrow;const o=e.getDate(),s=n.months[e.getMonth()],l=n.fullDaysOfWeek[e.getDay()];switch(Zi(t)){case"day-dot-month":return`${n.multiDay} ${l}, ${o}. ${s}`;case"month-day":return`${n.multiDay} ${l}, ${s} ${o}`;default:return`${n.multiDay} ${l}, ${o} ${s}`}}const va=/([^\S\u00A0\u2007\u202F]+)/u,ya=/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Bopomofo}\p{Script=Thai}\p{Script=Lao}\p{Script=Khmer}\p{Script=Myanmar}]/u,wa=/[\p{Script=Hebrew}\p{Script=Arabic}\p{Script=Syriac}\p{Script=Thaana}\p{Script=Nko}\p{Script=Samaritan}\p{Script=Mandaic}\p{Script=Adlam}]/u,ba=/(?<=[\p{L}\p{N}][-\u2010\u2013\u2014])(?=[\p{L}\p{N}])/u,Ma={"zh-cn":"zh-Hans","zh-tw":"zh-Hant"},ka=["clear-night","cloudy","exceptional","fog","hail","lightning","lightning-rainy","partlycloudy","pouring","rainy","snowy","snowy-rainy","sunny","windy","windy-variant"];function xa(e,t){if(!e)return;const n=function(e){const t=e.toLowerCase(),n=Ma[t];if(n)return n;const[i,r]=t.split("-");return r?`${i}-${r.toUpperCase()}`:i}(Ki(t,e.locale)),i=e.locale?.language;return i&&i.toLowerCase()===n.toLowerCase()?void 0:n}const $a=new Map,Da=new Map,Sa=new Set;const Ta=new Set;function La(e,t){Sa.has(e)||(Sa.add(e),Be(`Could not load weather conditions in ${e} (${t}); conditions will follow Home Assistant's language instead`))}function Ya(e){return e?.position||"date"}const Ca={"clear-night":"mdi:weather-night",cloudy:"mdi:weather-cloudy",fog:"mdi:weather-fog",hail:"mdi:weather-hail",lightning:"mdi:weather-lightning","lightning-rainy":"mdi:weather-lightning-rainy",partlycloudy:"mdi:weather-partly-cloudy",pouring:"mdi:weather-pouring",rainy:"mdi:weather-rainy",snowy:"mdi:weather-snowy","snowy-rainy":"mdi:weather-snowy-rainy",sunny:"mdi:weather-sunny",windy:"mdi:weather-windy","windy-variant":"mdi:weather-windy-variant",exceptional:"mdi:weather-cloudy-alert"},Ea={sunny:"mdi:weather-night",partlycloudy:"mdi:weather-night-partly-cloudy","lightning-rainy":"mdi:weather-lightning"},Aa=new Set;async function Pa(e,t,n,i){if(!e?.connection||!t?.weather?.entity)return;const r=t.weather.entity;try{return await e.connection.subscribeMessage(e=>{if(e&&Array.isArray(e.forecast)){const t=function(e,t){const n={};return e&&Array.isArray(e)?(e.forEach(e=>{if(!e.datetime)return;let i,r,a,o=!1;"hourly"===t?(a=new Date(e.datetime),r=a.getHours(),o=function(e,t){return"boolean"==typeof e?!e:t>=18||t<6}(e.is_daytime,r),i=`${ea(a)}_${r}`):(a=new Date(e.datetime),i=ea(a));const s=function(e,t){return t&&Ea[e]?Ea[e]:Ca[e]||"mdi:weather-cloudy-alert"}(e.condition,o);n[i]={icon:s,condition:e.condition,temperature:Math.round(e.temperature),templow:void 0!==e.templow?Math.round(e.templow):void 0,datetime:e.datetime,hour:r,uv_index:void 0!==e.uv_index?Math.round(e.uv_index):void 0}}),n):n}(e.forecast,n);i(t)}},{type:"weather/subscribe_forecast",forecast_type:n,entity_id:r})}catch(e){return void Ie("Failed to subscribe to weather forecast",{entity:r,forecast_type:n,error:e})}}function Ha(e,t,n){const i=Ya(t.weather);if("date"!==i&&"both"!==i||!t.weather?.entity||!n?.daily)return U;const r=function(e,t){if(t)return t[ea(e)]}(e,n.daily);if(!r)return U;const a=t.weather?.date||{},o=!1!==a.show_conditions,s=!1!==a.show_high_temp,l=!0===a.show_uv_index&&void 0!==r.uv_index&&r.uv_index>=(a.uv_index_threshold??0),d=!0===a.show_low_temp&&!l&&void 0!==r.templow;return W`
    <div class="weather">${o?W`<ha-icon .icon=${r.icon}></ha-icon>`:U}${s?W`<span class="weather-temp-high">${r.temperature}°</span>`:U}${d?W`<span class="weather-temp-low">/${r.templow}°</span>`:U}${l?W`<span class="weather-uv-index">UV${r.uv_index}</span>`:U}</div>
  `}function za(e){const t=new Date,n=new Date(t.getFullYear(),t.getMonth(),t.getDate()),i=new Date(e).toDateString(),r=new Date(n);return r.setDate(r.getDate()+1),{isToday:i===n.toDateString(),isTomorrow:i===r.toDateString()}}function Fa(e,t,n,i,r=U,a,o,s){const l=Ka(t,i,"inline"),d=l!==U,c=a?W`<div
        class="column-header-separator"
        style=${yi({borderTopWidth:a.width,borderTopColor:a.color,borderTopStyle:"solid"})}
      ></div>`:U;return W`
    <div class="column-day-header" id=${s??U}>
      <div
        class=${Hi({"column-date-content":!0,"with-today-indicator":d,"with-today-tile":Oa(t)})}
      >
        ${l}
        ${Ia(e,t,n,i,r,o)}
      </div>
    </div>
    ${c}
  `}function ja(e,t,n){return W`
    <div
      class="column-week-number"
      style=${yi({gridColumn:String(n),gridRow:"1",...t?{}:{visibility:"hidden"}})}
    >
      <div class="week-number">${e??""}</div>
    </div>
  `}function Oa(e){return Boolean(e.today_indicator)&&"tile"===xe(e.today_indicator)}function Ia(e,t,n,i,r=U,a){const o=aa(e,a);let s=t.weekday_color,l=t.day_color,d=t.month_color;o&&(s=t.weekend_weekday_color||s,l=t.weekend_day_color||l,d=t.weekend_month_color||d);const c=i&&Oa(t);i&&(s=t.today_weekday_color||s,l=t.today_day_color||o&&t.weekend_day_color||(c?"var(--calendar-card-today-indicator-ink)":l),d=t.today_month_color||d);const u=Ji(n),h=u.daysOfWeek[e.getDay()],m=e.getDate(),p=u.months[e.getMonth()];return W`
    <div
      class="weekday"
      style=${yi({"font-size":t.weekday_font_size,color:s})}
    >
      ${h}
    </div>
    <div
      class=${c?"day today-tile":"day"}
      style=${yi({"font-size":t.day_font_size,color:l})}
    >
      ${m}
    </div>
    ${t.show_month?W`
          <div
            class="month"
            style=${yi({"font-size":t.month_font_size,color:d})}
          >
            ${p}
          </div>
        `:U}
    ${r}
  `}const Na=/[\u2000-\u3300]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDC00-\uDFFF]/,Ra=/[\s\p{L}]/u;function Wa(e,t,n,i=""){if(!e)return U;const r=De(e,n);if("none"===r)return U;if("icon"===r)return W`<ha-icon icon="${e}" class="label-icon" style=${t?`color: ${t};`:U}></ha-icon>`;if("image"===r)return W`<img src="${e}" class="label-image" alt=${i} />`;const a=function(e){return Na.test(e)&&!Ra.test(e)}(e)?" label-emoji":"";return W`<span class="calendar-label${a}">${e}</span>`}function Ba(e){const t=Ya(e.weather);return!(!e.weather?.entity||"event"!==t&&"both"!==t)}function qa(e,t,n,i="title",r){const a=Ua(e,t,n,i,r);if(!a)return W``;const{forecast:o,showIcon:s,showTemp:l,showUvIndex:d,conditionText:c}=a;return W`
    <div class="event-weather">${s?W`<ha-icon .icon=${o.icon}></ha-icon>`:U}<span class="event-weather-text">${l?W`<span>${o.temperature}°</span>`:U}${d?W`<span class="weather-uv-index">UV${o.uv_index}</span>`:U}${c?W`<span class="weather-condition">${c}</span>`:U}</span></div>
  `}function Ua(e,t,n,i="title",r){if(!Ba(t)||!n?.hourly)return null;if(e.end?.dateTime){const t=new Date;if(new Date(e.end.dateTime)<t)return null}const a=t.weather?.event||{},o=function(e,t,n,i=!1){if(e.start.date&&!e.start.dateTime&&n)return n[ea(Qr(e.start.date))];if(!e.start.dateTime)return;const r=new Date(e.start.dateTime),a=ea(r),o=r.getHours();if(t){const e=t[`${a}_${o}`];if(e)return e;let n=-1,i=24;if(Object.keys(t).forEach(e=>{if(e.startsWith(a)){const t=e.split("_")[1],r=parseInt(t);if(!isNaN(r)){const e=Math.abs(r-o);e<i&&(i=e,n=r)}}}),n>=0)return t[`${a}_${n}`]}return i&&n?n[a]:void 0}(e,n.hourly,n.daily,!1!==a.daily_forecast_fallback);if(!o)return null;const s=!1!==a.show_conditions,l=!1!==a.show_temp,d=!0===a.show_uv_index&&void 0!==o.uv_index&&o.uv_index>=(a.uv_index_threshold??0),c="row"===i,u=c||s,h=c&&s?function(e,t,n,i){if(!e||!t||!n)return;const r=xa(e,i);if(r){const e=function(e,t){const n=$a.get(e);if(!n)return;const i=n[t];return i||function(e,t){const n=`${e}:${t}`;Ta.has(n)||(Ta.add(n),Be(`Home Assistant has no "${t}" for ${e}; that condition will follow the instance's language instead`))}(e,t),i}(r,n);if(e)return e}const a=e.states?.[t];if(!a||"function"!=typeof e.formatEntityState)return;const o=e.formatEntityState(a,n);return o?(o!==n||Aa.has(n)||(Aa.add(n),Be(`Weather condition "${n}" came back untranslated from ${t}; Home Assistant returned the raw token, so the row will show it as-is`)),o):void 0}(r,t.weather?.entity,o.condition,t.language):void 0;return{forecast:o,showIcon:u,showTemp:l,showUvIndex:d,conditionText:h}}function Va(e,t,n,i={}){const{weatherForecasts:r,weatherPlacement:a="title",progressPlacement:o="inline",countdownPlacement:s="trailing",hass:l,splitTimeEnd:d=!1,titleWords:c=!1}=i,{eventTime:u,eventTimeEnd:h,allDayBadge:m,titlePill:p,eventLocation:_,locationIcon:g,eventDescription:f,shouldShowTime:v,countdownStr:y,progressPercentage:w,entityLabel:b,entityLabelAlt:M,mergedLabels:k,nowLabel:x}=n,$=null!==w&&t.show_progress_bar,D=$&&"inline"===o,S=$&&"row"===o?W`
          <div class="progress-bar progress-bar-row">
            <div class="progress-bar-filled" style="width: ${w}%"></div>
          </div>
        `:U,T="title"===a?r:void 0,L="row"===a&&Ba(t)?qa(e,t,r,"row",l):U,Y="text"===s&&null!==y,C=Y?null:y,E=d&&h&&u.endsWith(h)&&u!==h?h:null,A=u?E?W`<span>${u.slice(0,-E.length)}<span class="time-end">${E}</span></span>`:W`<span>${u}</span>`:U,P=m?W`<span
        class=${"allday-badge allday-pill-"+m.mode+(m.inheritsText?" allday-source-text":"")}
        lang=${m.lang}
        style=${`--calendar-card-event-accent: ${m.accent};`+(m.inheritsText?" --badge-source: var(--calendar-card-color-time);":"")}
        >${m.label}</span
      >`:U,H=Y?W`<span class="time-text">${A}<span class="time-countdown">${y}</span></span>`:A,z=x?W`<span class="now-time"><span class="now-indicator">${x}</span>${H}</span>`:H;return W`
    <div class="event-content">
      ${function(e,t,n,i,r,a,o=!1,s=""){const l=!!e._isEmptyDay,d=l&&!e._isCustomEmptyText,c=e._matchedConfig?.color||t.event_color,u=l?"var(--calendar-card-empty-day-color)":Nt(c)?void 0:c,h=e._matchedConfig?.label_icon_color,m=e._matchedConfig?.label_type,p=d?`✓ ${e.summary}`:e.summary,_=t.scroll_long_titles,g=o&&!_?W`<span class="title-words"
          >${function(e){return wa.test(e)?e?[{kind:"text",text:e}]:[]:e.split(va).flatMap((e,t)=>""===e?[]:t%2==1?[{kind:"space",text:e}]:ya.test(e)?[{kind:"text",text:e}]:e.split(ba).map(e=>({kind:"word",text:e})))}(p??"").map(e=>"word"===e.kind?W`<span class="title-word">${e.text}</span>`:"text"===e.kind?W`<span class="title-run">${e.text}</span>`:e.text)}</span
        >`:p,f=r?`allday-title-pill allday-pill-${r.mode}`+(r.inheritsText?" allday-source-text":""):"",v=r?`--calendar-card-event-accent: ${r.accent};`+(r.inheritsText?` --badge-source: ${u};`:""):"",y=r?W`<span
        class=${f}
        style=${v}
        >${g}</span
      >`:g,w=a?a.map(e=>Wa(e.value,e.iconColor,e.type,e.alt)):n?Wa(n,h,m,s):U,b=Array.isArray(w)?w.some(e=>e!==U):w!==U,M=_?W`<span class="event-title-scroll">${y}</span>`:y,k=`event-title ${l?"empty-day-title":""}${_?" title-scrollable":""}`,x=void 0===u?U:`color: ${u}`,$=o&&!_?"auto":U,D=b?W`${w}<span class=${k} style=${x} dir=${$}>${M}</span>`:W`<span
          class=${k}
          style=${x}
          dir=${$}
        >
          ${M}
        </span>`;return W`
    <div class="summary-row">
      <div class="summary${_?" summary-scroll":""}">
        ${D}
      </div>
      ${qa(e,t,i)}
    </div>
  `}(e,t,b,T,p,k,c,M)}
      <div class="time-location">
        ${S}
        ${v?W`
              <div class="time">
                <div class="time-actual">
                  <ha-icon icon=${x?"mdi:clock":"mdi:clock-outline"}></ha-icon>
                  ${P}${z}
                </div>
                ${C?W`<div class="time-countdown">${C}</div>`:D?W`
                        <div class="progress-bar">
                          <div
                            class="progress-bar-filled"
                            style="width: ${w}%"
                          ></div>
                        </div>
                      `:U}
              </div>
            `:y?W`
                <div class="time">
                  <div class="time-actual"></div>
                  <div class="time-countdown">${y}</div>
                </div>
              `:D?W`
                  <div class="time">
                    <div class="time-actual"></div>
                    <div class="progress-bar">
                      <div class="progress-bar-filled" style="width: ${w}%"></div>
                    </div>
                  </div>
                `:U}
        ${L}
        ${_?W`
              <div class="location">
                <ha-icon icon="${g}"></ha-icon>
                <span>${_}</span>
              </div>
            `:""}
        ${f?W`
              <div class="description">
                <ha-icon icon="mdi:information-outline"></ha-icon>
                <span>${f}</span>
              </div>
            `:""}
      </div>
    </div>
  `}function Ga(){return W`<span class="event-accent-bar"></span>`}function Ka(e,t,n="absolute"){if(!e.today_indicator||!t)return U;const i=e.today_indicator,r=xe(i);if("none"===r||"tile"===r)return U;const a="inline"===n?{}:function(e){const t={position:"absolute",transform:"translate(-50%, -50%)"},n=e.trim().split(/\s+/);return n.length>=1&&(t.left=n[0]),n.length>=2?t.top=n[1]:t.top="50%",t}(e.today_indicator_position);return W`
    <div class="today-indicator-container${"inline"===n?" inline":""}">
      ${function(e,t,n){let i="";switch(e){case"dot":case"pulse":case"glow":i="mdi:circle";break;case"mdi":i="string"==typeof t?t:"mdi:circle";break;case"image":return"string"==typeof t?W` <img
          src="${t}"
          class="today-indicator image"
          style=${yi(n)}
          alt="Today"
        />`:U;case"emoji":return"string"==typeof t?W` <span class="today-indicator emoji" style=${yi(n)}>
          ${t}
        </span>`:U;default:return U}return i?W` <ha-icon
      icon="${i}"
      class="today-indicator ${e}"
      style=${yi(n)}
    >
    </ha-icon>`:U}(r,i,a)}
    </div>
  `}const Ja=[["event_color","--calendar-card-color-event","ink"],["time_color","--calendar-card-color-time","ink"],["location_color","--calendar-card-color-location","ink"],["description_color","--calendar-card-color-description","ink"],["progress_bar_color","--calendar-card-progress-bar-color","raw"]];Ja.map(([e])=>e);const Za="--calendar-card-accent-ink",Xa=Ja.find(([e])=>"event_color"===e)[1];function Qa(e,t,n=!1){const i={};if(n||!t)return i;for(const[n,r,a]of Ja)Nt(e[n])&&(i[r]="ink"===a?`var(${Za})`:t);const r=e.weather?.event?.color;return(Nt(r)||!r&&i[Xa])&&(i["--calendar-card-weather-event-color"]=`var(${Za})`),Object.values(i).some(e=>e.includes(Za))&&(i["--calendar-card-accent-ink-source"]=t),i}const eo=/(?:^|\s)year[:=](\d{4})(?!\w)/i,to=new RegExp(eo.source,"gi");function no(e){return e.replace(to,"").replace(/[^\S\n]{2,}/g," ").replace(/[^\S\n]+\n/g,"\n").replace(/\n{3,}/g,"\n\n").trim()}function io(e,t){return e.trim().length>0?`${e} (${t})`:`(${t})`}const ro="07:00",ao="22:00",oo=/^(\d{2}):(\d{2})$/;function so(e){if("string"!=typeof e)return null;const t=oo.exec(e);if(!t)return null;const n=Number(t[1]),i=Number(t[2]);return i>59?null:24===n?0===i?1440:null:n<24?60*n+i:null}function lo(e,t){const n=so(e),i=so(t);return null===n||null===i||n>=i?{startMin:so(ro),endMin:so(ao),usedFallback:!0}:{startMin:n,endMin:i,usedFallback:!1}}function co(e){return Number.isFinite(e)&&e>0?e:60}function uo(e,t){return e%60==0||t<60&&t>0&&e%t===0}function ho(e){return 60*e.getHours()+e.getMinutes()+e.getSeconds()/60+e.getMilliseconds()/6e4}function mo(e){return new Date(e.getFullYear(),e.getMonth(),e.getDate())}function po(e,t){return new Date(e.getFullYear(),e.getMonth(),e.getDate()+t)}function _o(e,t,n){return!(!Number.isFinite(e)||!Number.isFinite(t)||t<e)&&(t===e?e>=n.startMin&&e<n.endMin:t>n.startMin&&e<n.endMin)}function go(e,t,n){if(!_o(e,t,n))return null;const i=n.endMin-n.startMin,r=Math.max(e,n.startMin),a=Math.min(t,n.endMin);return{topPct:(r-n.startMin)/i*100,heightPct:(a-r)/i*100,clippedTop:e<n.startMin,clippedBottom:t>n.endMin}}const fo={at:-1/0,held:!1};function vo(e){return{at:e.endMin,held:e.endMin===e.startMin}}function yo(e,t){return e.held?e.at<t:e.at<=t}function wo(e,t){return e.at!==t.at?e.at>t.at?e:t:{at:e.at,held:e.held||t.held}}function bo(e,t){const n=[];let i=fo;for(const r of e){const e=t(r);yo(i,e.startMin)&&(n.push([]),i=fo),n[n.length-1].push(r),i=wo(i,vo(e))}return n}function Mo(e,t,n,i,r){const a=n>i?t-function(e,t,n){const i=Math.min(.25*e,e/(t+1));return n>0?Math.min(n,i):i}(t-e,i,r):t;return{start:e,end:t,share:(a-e)/Math.min(n,i),overflowStart:a}}function ko(e,t){const n=[];return e.map(e=>{let i=n.findIndex(t=>yo(t,e.startMin));return i<0&&(i=n.length),i<t&&(n[i]=vo(e)),{event:e,laneIndex:i}})}const xo=1e-6;function $o(e,t){const n=e?.depth??0,i=t?.depth??0;return n!==i?n>i:(e?.order??-1)>(t?.order??-1)}function Do(e,t){for(let n=t.host;n;n=n.host)if(n===e)return!0;return!1}function So(e,t){return!yo(e.release,t.event.startMin)}function To(e,t,n,i,r){const a=[],o=new Map;for(const s of e){const e=Math.max(s.startMin,t.startMin);let l=null;for(const t of a){if(yo(t.release,s.startMin))continue;const i=!t.hidden&&!r.has(t.order)&&t.depth<n.maxDepth&&e-t.top>=n.thresholdMin?t:t.host;$o(i,l)&&(l=i)}let d=o.get(l);d&&!yo(d.release,s.startMin)||(d={release:fo,laneReleases:[],needed:0,members:[],region:null},o.set(l,d));let c=d.laneReleases.findIndex(e=>yo(e,s.startMin));c<0&&(c=d.laneReleases.length),c<i&&(d.laneReleases[c]=vo(s)),d.release=wo(d.release,vo(s)),d.needed=Math.max(d.needed,c+1);const u={event:s,order:a.length,top:e,bottom:Math.max(e,Math.min(s.endMin,t.endMin)),release:vo(s),host:l,depth:(l?.depth??0)+1,children:[],cluster:d,laneIndex:Math.min(c,i),hidden:c>=i,x0:0,x1:100,contentX1:100,contentEnd:e,raised:!1};l?.children.push(u),d.members.push(u),a.push(u)}for(const e of a){const t=e.cluster;if(!t.region){const r=e.host?e.host.x0+n.indentPct:0;let o=e.host?e.host.x1:100;for(const n of a){if(n.order>=e.order)break;t.members.some(e=>So(n,e))&&!Do(n,e)&&n.x0>r+xo&&(o=Math.min(o,n.x0))}t.region=Mo(r,o,t.needed,i,n.stripPct??1/0)}const{start:r,end:o,share:s,overflowStart:l}=t.region;e.x0=e.hidden?l:r+e.laneIndex*s,e.x1=e.hidden||t.needed<=i?o:l;for(const t of a){if(t.order>=e.order)break;So(t,e)&&(Do(t,e)?e.raised=!0:(t.x0>e.x0+xo&&(e.x1=Math.min(e.x1,t.x0)),t.x0<e.x1-xo&&e.x0<t.x1-xo&&(e.raised=!0)))}}const s=Lo(a);for(const e of a){e.contentEnd=e.children.reduce((e,t)=>Math.min(e,t.top),e.bottom),e.contentX1=e.x1;const n=[...a.filter(t=>t.order>e.order&&!t.hidden&&!Do(e,t)).map(e=>({x0:e.x0,top:e.top,bottom:e.bottom})),...s.map(e=>({x0:e.x0Pct,top:Math.max(e.startMin,t.startMin),bottom:Math.min(e.endMin,t.endMin)}))],i=e.contentEnd>e.top?e.contentEnd:e.top+xo;for(const t of n){const n=t.bottom>t.top?t.bottom:t.top+xo;t.top<i&&n>e.top&&t.x0>e.x0+xo&&(e.contentX1=Math.min(e.contentX1,t.x0))}}return a}function Lo(e){const t=new Map;for(const n of e)n.hidden&&t.set(n.cluster,[...t.get(n.cluster)??[],n]);return Array.from(t.values()).flatMap(e=>bo(e,e=>e.event).map(e=>({startMin:Math.min(...e.map(e=>e.event.startMin)),endMin:Math.max(...e.map(e=>e.event.endMin)),x0Pct:e[0].x0,x1Pct:Math.min(...e.map(e=>e.x1)),hidden:e.map(e=>e.event)})))}function Yo(e){return{placed:e.filter(e=>!e.hidden).map(e=>({...e.event,x0Pct:e.x0,x1Pct:e.x1,contentX1Pct:e.contentX1,contentEndMin:e.contentEnd,depth:e.depth,raised:e.raised})),overflows:Lo(e)}}function Co(e){if(!e.start.dateTime||!e.end.dateTime)return null;const t=new Date(e.start.dateTime),n=new Date(e.end.dateTime);if(Number.isNaN(t.getTime())||Number.isNaN(n.getTime())||n<t)return null;const i=ho(t),r=ho(n);let a=oa(t,n)>0?1440:r;return Math.floor(a)<=Math.floor(i)&&n.getTimezoneOffset()>t.getTimezoneOffset()&&(a=i+(n.getTime()-t.getTime())/6e4),{startMin:i,endMin:a}}function Eo(e,t){if(!e.start.date||t.length<1)return null;const n=Qr(e.start.date),i=e.end.date?po(Qr(e.end.date),-1):n;if(Number.isNaN(n.getTime())||Number.isNaN(i.getTime())||i<n)return null;const r=t.map(e=>mo(e)),a=r.map((e,t)=>({day:e,index:t})).filter(({day:e})=>e>=n&&e<=i).map(({index:e})=>e);if(0===a.length)return null;const o=a[0],s=a[a.length-1];return{columnIndex:o,span:s-o+1,continuesBefore:n<r[o],continuesAfter:i>r[s]}}const Ao={sunday:0,sun:0,monday:1,mon:1,tuesday:2,tue:2,wednesday:3,wed:3,thursday:4,thu:4,friday:5,fri:5,saturday:6,sat:6},Po="start_of_week";function Ho(e){return new Date(e.getFullYear(),e.getMonth(),e.getDate())}function zo(e,t){return new Date(e.getFullYear(),e.getMonth(),e.getDate()+t)}function Fo(e,t){const n=(t-e.getDay()+7)%7;return zo(e,n)}function jo(e,t){const n=(e.getDay()-t+7)%7;return zo(e,-n)}function Oo(e){const t=[];let n="";for(const i of e)"+"===i||"-"===i?(t.push(n),n=i):n+=i;return t.push(n),t}const Io=new Map;function No(e){return void 0===e||""===e?void 0:e}function Ro(e,t,n){if(null===t||t.field!==n||""===e)return{text:e,replacedWholeField:!1};if(void 0===t.pattern)return{text:t.replacement??"",replacedWholeField:!0};const i=function(e){if(Io.has(e))return Io.get(e)??null;let t=null;try{t=new RegExp(e,"gi")}catch{Ne(`Ignoring "replace_pattern": ${JSON.stringify(e)} is not a valid regular expression. Event text is shown unchanged.`)}return Io.set(e,t),t}(t.pattern);return null===i?{text:e,replacedWholeField:!1}:{text:e.replace(i,t.replacement??""),replacedWholeField:!1}}const Wo=new Map;function Bo(e,t){if("persistent"===e)return Ls(t);const n=Wo.get(t);if(!n)return null;return n.writeGeneration!==Uo()||Date.now()-n.entry.timestamp>=864e5?(Wo.delete(t),null):(Wo.delete(t),Wo.set(t,n),n.entry)}const qo=Symbol.for("calendar-card-pro.write-generation");function Uo(){return globalThis[qo]??0}const Vo=new Map,Go=new Map;let Ko=0;function Jo(e,t,n,i="persistent"){const r=ma(t.first_day_of_week,e.locale),a=function(e,t,n,i,r){const a=t.map(e=>"string"==typeof e?e:e.entity).sort().join("_");let o="";if(i)try{o=i.includes("T")?i.split("T")[0]:i}catch{o=i}return`cache_data_${e}_${a}_${n}${o?`_${o}`:""}${function(e){const t=String(e).replace(/\s+/g,"").toLowerCase();return""!==t&&Oo(t)[0]===Po}(o)&&void 0!==r?`_fdw${r}`:""}${me}`}(n,t.entities,t.days_to_show,t.start_date,r),o=Ts(t.days_to_show,t.start_date,r);return{cacheKey:a,firstDayOfWeek:r,window:o,signature:`${i}|${a}|${o.start.toISOString()}|${o.end.toISOString()}`,store:i}}async function Zo(e,t,n,i="cache",r=0,a,o="persistent"){const s=Jo(e,t,n,o);if("cache"===i){const e=Bo(o,s.cacheKey),n=Date.now();if(e&&!is(e,t,s.window,n))return We(`Using ${e.events.length} events from cache`),Xo(e,rs(e,n),t,s.firstDayOfWeek)}let l=Vo.get(s.signature);l&&"reload"===i&&(void 0!==a&&l.writeGeneration>=a||(l=void 0)),l?We("Joining an in-flight request for the same calendars and window"):l=function(e,t,n,i){const r=++Ko;Go.set(`${n.store}|${n.cacheKey}`,r);const a={writeGeneration:Uo()};return a.promise=async function(e,t,n,i,r,a){We("Fetching events from API");const o=t.entities.map(e=>"string"==typeof e?{entity:e,color:"var(--primary-text-color)"}:e),{events:s,failedEntities:l}=await async function(e,t,n){const i=es(t),r=`start=${n.start.toISOString()}&end=${n.end.toISOString()}`,a=await Promise.all(i.map(async t=>{const n=`calendars/${t}?${r}`;We(`Fetching calendar events with path: ${n}`);try{const i=await function(e,t,n){let i;const r=new Promise((e,t)=>{i=setTimeout(()=>t(new Error(n)),3e4)});return Promise.race([e,r]).finally(()=>clearTimeout(i))}(e.callApi("GET",n),0,`${t} did not answer within 30s`);return i&&Array.isArray(i)?{entityId:t,events:i.map(e=>({...e,_entityId:t}))}:(Ne(`Invalid response for ${t}`),{entityId:t,events:null})}catch(e){return Ie(`Failed to fetch events for ${t}:`,e),{entityId:t,events:null}}})),o=[],s=[];for(const e of a)e.events?o.push(...e.events):s.push(e.entityId);return{events:o,failedEntities:s}}(e,o,n.window),d=Date.now(),c=Bo(n.store,n.cacheKey),u=new Set(l),h=es(t.entities),m={},p=[...s];for(const e of h){if(!u.has(e)){m[e]=d;continue}const t=c?ts(c,e):void 0;void 0===t||d-t>=864e5||(m[e]=t,p.push(...c.events.filter(t=>t._entityId===e)))}const _={events:p,timestamp:d,window:{start:n.window.start.toISOString(),end:n.window.end.toISOString()},lastSuccess:m};if(u.size>0){const e=(c?c.failedEntities?.length?c.failureCount??1:0:r)+1;_.failedEntities=h.filter(e=>u.has(e)),_.failureCount=e,_.retryAt=d+function(e,t){const n=Math.min(Math.max(e-1,0),20);return Math.min(6e4*2**n,Ys(t))}(e,t);const n=p.length-s.length;Ne(`${u.size} of ${h.length} calendar(s) failed to load (attempt ${e}); keeping ${n} previously loaded event(s), retrying in ${Math.round((_.retryAt-d)/1e3)}s`)}else 0===p.length&&(_.ttlMs=15e3,We("No events returned; caching empty result briefly (15s)"));return Go.get(`${n.store}|${n.cacheKey}`)===i?function(e,t,n,i){if("persistent"!==e)for(Wo.delete(t),Wo.set(t,{entry:n,writeGeneration:i});Wo.size>16;)Wo.delete(Wo.keys().next().value);else!function(e,t){try{return We(`Caching ${t.events.length} events`),localStorage.setItem(e,JSON.stringify(t)),null!==Ls(e)}catch(e){return Ie("Failed to cache calendar events:",e),!1}}(t,n)}(n.store,n.cacheKey,_,a):We("A newer request for the same calendars has started; not caching this response"),_}(e,t,n,r,i,a.writeGeneration).finally(()=>{Vo.get(n.signature)===a&&Vo.delete(n.signature)}),Vo.set(n.signature,a),a}(e,t,s,r);const d=await l.promise;return Xo(d,d.events,t,s.firstDayOfWeek)}function Xo(e,t,n,i){return{events:as(t,n,i),failedEntities:[...e.failedEntities??[]],fetchedAt:e.timestamp,loadedAt:Qo(e,t),nextAttemptAt:ns(e,n)}}function Qo(e,t){let n=e.timestamp;for(const i of new Set(t.map(e=>e._entityId))){if(!i)continue;const t=ts(e,i);void 0!==t&&t<n&&(n=t)}return n}function es(e){return[...new Set(e.map(e=>"string"==typeof e?e:e.entity))]}function ts(e,t){const n=e.lastSuccess?.[t];return"number"==typeof n?n:e.lastSuccess||e.failedEntities?.includes(t)?void 0:e.timestamp}function ns(e,t){const n=e.timestamp+Ys(t);return e.failedEntities?.length?"number"==typeof e.retryAt?Math.min(e.retryAt,n):e.timestamp:n}function is(e,t,n,i){if(n&&e.window&&(e.window.start!==n.start.toISOString()||e.window.end!==n.end.toISOString()))return!0;if(e.failedEntities?.length)return i>=ns(e,t);const r="number"==typeof e.ttlMs&&e.ttlMs>0?e.ttlMs:Ys(t);return i-e.timestamp>=r}function rs(e,t){return e.events.filter(n=>{if(!n._entityId)return!0;const i=ts(e,n._entityId)??e.timestamp;return t-i<864e5})}function as(e,t,n){const i=function(e,t){const n=[],i=ss(e);return t.entities.forEach(e=>{const r="string"==typeof e?e:e.entity,a=i.filter(e=>e._entityId===r);if(0===a.length)return;const o=function(e,t,n){if("string"==typeof t)return vs(e,fs(void 0,n));let i=vs(e,fs(t,n));const r=t.filter_field;if(t.allowlist)try{const e=new RegExp(t.allowlist,"i");i=i.filter(t=>{const n=ys(t,r);return Boolean(n&&e.test(n))})}catch(e){Ne(`Invalid allowlist pattern: ${t.allowlist}`,e)}if(t.blocklist)try{const e=new RegExp(t.blocklist,"i");i=i.filter(t=>{const n=ys(t,r);return!(n&&e.test(n))})}catch(e){Ne(`Invalid blocklist pattern: ${t.blocklist}`,e)}return i}(a,e,t),s=o.map(n=>{const i={...n,_source:n._source??os(n),_matchedConfig:"object"==typeof e?e:void 0};return i._entityLabel=Ms(r,t,i),i});n.push(...s)}),Be(`Processed ${n.length} events after filtering`),n}(e,t),r=Cs(t,n),a=new Date(r);return a.setDate(a.getDate()+t.days_to_show),i.filter(e=>{if(!e.start)return!1;let t;if(e.start.dateTime)t=new Date(e.start.dateTime);else{if(!e.start.date)return!1;t=Qr(e.start.date)}return t<a})}function os(e){return{start:e.start,end:Ee(e.end)?e.end:void 0,summary:e.summary,location:e.location,description:e.description,uid:e.uid,recurrence_id:e.recurrence_id,rrule:e.rrule,status:e.status}}function ss(e){let t=0;const n=e.flatMap(e=>{if(!e||!Ee(e.start))return[];if(null!=e.end&&!Ee(e.end))return[];const n=Ee(e.end)?e.end:void 0;if([e.start.date,e.start.dateTime,n?.date,n?.dateTime,e.summary,e.location,e.description].some(e=>null!=e&&"string"!=typeof e))return[];if(e.start.dateTime){const i=Date.parse(e.start.dateTime);if(e.start.date||n?.date||!Number.isFinite(i))return[];if(n?.dateTime){const t=Date.parse(n.dateTime);if(!Number.isFinite(t))return[];if(t>=i)return[e]}return t++,[{...e,end:{dateTime:e.start.dateTime},_source:e._source??os(e)}]}return!n||n.dateTime?[]:[e.start.date,n.date].every(e=>"string"==typeof e&&ea(Qr(e))===e)&&n.date>e.start.date?[e]:[]}),i=e.length-n.length;return i>0&&Ne(`Ignoring ${i} malformed calendar event(s): expected matching, parseable start/end values and string text fields`),t>0&&Ne(`Showing ${t} timed event(s) whose end is missing or before their start at their start time`),n}function ls(e,t,n){return e>=n?e:t.toDateString()===n.toDateString()||t>n?n:e}const ds=/^(\d{1,2}):([0-5]\d)(?::([0-5]\d))?$/,cs=new Set;function us(e,t,n,i,r="list",a){const o=Ln(t,r),s=ss(e),l=o.show_empty_days,d=n&&Dn(r),c=!d&&Dn(r),u=Cs(o,ma(o.first_day_of_week,a?.locale)),h=new Date(u),m=new Date(h);m.setHours(23,59,59,999);const p=new Date(h);p.setDate(p.getDate()+o.days_to_show);const _=new Map,g=new Map,f=s.flatMap(e=>{const t="never"===function(e){switch(e){case"grid":return"never";case"column":case"list":return"inherit"}}(r)?function(e,t,n){const i={start:e.start,end:e.end};if(e.start.dateTime)return function(e,t,n){if(!e.start.dateTime||!e.end.dateTime)return[e];const i=new Date(e.start.dateTime),r=new Date(e.end.dateTime);if(Number.isNaN(i.getTime())||Number.isNaN(r.getTime())||r<i)return[];if(r.getTime()===i.getTime())return i>=t&&i<n?[{...e,start:{dateTime:i.toISOString()},end:{dateTime:r.toISOString()},_isMultiDaySegment:!1,_gridSegmentStartsEvent:!0}]:[];const a=r>n?n:r,o=[];for(let s=mo(i<t?t:i);s<a&&s<n;s=po(s,1)){const t=po(s,1),n=i>s?i:s,a=r<t?r:t;a<=n||o.push({...e,start:{dateTime:n.toISOString()},end:{dateTime:a.toISOString()},_isMultiDaySegment:o.length>0||n>i||a<r,_gridSegmentStartsEvent:n.getTime()===i.getTime()})}return o}(e,t,n).filter(e=>void 0!==e.end.dateTime).map(e=>({...e,_gridSource:i}));if(!e.start.date||!e.end.date)return[];const r=Qr(e.start.date),a=Qr(e.end.date);if(ea(r)!==e.start.date||ea(a)!==e.end.date||a<=r)return[];const o=[];for(let s=r<t?mo(t):r;s<a&&s<n;s=po(s,1))o.push({...e,start:{date:ea(s)},end:{date:ea(po(s,1))},_gridSource:i});return o}(e,h,p):function(e,t){const n=[];for(const i of e){if(!ps(i,t)){n.push(i);continue}if(!ms(i)){n.push(i);continue}const e=gs(i);n.push(...e)}return n}([e],o);if(o.filter_duplicates){const n=ws(e);t.forEach(e=>_.set(e,n))}return t}),v=new Date,y=f.filter(e=>{if(!e?.start||!e?.end)return!1;const t=!e.start.dateTime;let n,i;if(t){if(n=e.start.date?Qr(e.start.date):null,i=e.end.date?Qr(e.end.date):null,i){const e=new Date(i);e.setDate(e.getDate()-1),i=e}}else n=e.start.dateTime?new Date(e.start.dateTime):null,i=e.end.dateTime?new Date(e.end.dateTime):null;if(!n||!i)return!1;if(n>=p)return!1;if(!(n>=h&&n<=m||n>m||i>=h))return!1;if(!o.show_past_events){if(!t&&i<v)return!1;const n=e._splitFromTimedEvent?void 0:Ds(e._entityId,"allday_expires_at",o,e),r=e._gridSource?.end.date?po(Qr(e._gridSource.end.date),-1):i;if(t&&v>=function(e,t){const n=function(e){if("string"!=typeof e)return null;const t=ds.exec(e.trim());if(!t)return null;const n=Number(t[1]);return n>23?null:{hours:n,minutes:Number(t[2]),seconds:t[3]?Number(t[3]):0}}(t);if(!n){if("string"==typeof t&&""!==t.trim()){const e=t.trim();cs.has(e)||(cs.add(e),Ne(`Invalid allday_expires_at value "${e}" — expected a time such as 10:00`))}const n=new Date(e);return n.setDate(n.getDate()+1),n.setHours(0,0,0,0),n}const i=new Date(e);return i.setHours(n.hours,n.minutes,n.seconds,0),i}(r,n))return!1}const r=function(e){const t=e?.days_of_week;return"weekdays"===t||"weekends"===t?t:void 0}(e._matchedConfig);return!(r&&!function(e,t,n){return aa(e,n)===("weekends"===t)}(ls(n,i,h),r,a)||(o.filter_duplicates&&g.set(e,ea(ls(n,i,h))),0))}),w=new Map;if(o.filter_duplicates&&"grid"!==r)for(const e of y){const t=_.get(e),n=w.get(t);(!n||hs(e._entityId,o)<hs(n._entityId,o))&&w.set(t,e)}const b=function(e,t,n,i=ws){if(!n||e.length<2)return e;const r=new Set,a=new Set,o=new Map;for(const n of t.entities){const t="string"==typeof n?n:n.entity;for(const n of e){if(n._entityId!==t)continue;const e=i(n),s=o.get(e);s?s.some(e=>e.entityId===t)||s.push({entityId:t,config:n._matchedConfig}):o.set(e,[{entityId:t,config:n._matchedConfig}]),r.has(e)||(r.add(e),a.add(n))}}const s=[];for(const t of e){const e=i(t);if(!a.has(t)&&r.has(e))continue;const n=o.get(e);s.push(n&&n.length>1?{...t,_mergedFrom:n}:t)}return s}(y,o,o.filter_duplicates,e=>{const t=_.get(e),n=w.get(t),i=void 0!==n&&!n._isMultiDaySegment;return JSON.stringify([t,i?null:g.get(e)])}),M={};b.length>0&&b.forEach(e=>{let t,n;if(e.start.dateTime)t=e.start.dateTime?new Date(e.start.dateTime):null,n=e.end.dateTime?new Date(e.end.dateTime):null;else if(t=e.start.date?Qr(e.start.date):null,n=e.end.date?Qr(e.end.date):null,n){const e=new Date(n);e.setDate(e.getDate()-1),n=e}if(!t||!n)return;const r=ls(t,n,h),a=ea(r),s=Ji(i);M[a]||(M[a]={weekday:s.daysOfWeek[r.getDay()],day:r.getDate(),month:s.months[r.getMonth()],timestamp:r.getTime(),events:[]});const l=Ds(e._entityId,"show_description",o,e)??o.show_description,d=e.description||"",c=function(e){return e.length>0&&/year/i.test(e)}(d),u=l||c?function(e){if(!e)return"";const t=e.replace(Zr,""),n=document.createElement("textarea");return n.innerHTML=t,n.value.trim()}(d):"",m=c?function(e){const t=eo.exec(e);return t?Number(t[1]):null}(u):null,p=e._gridSource?.start??e._sourceStart,_=p?.dateTime?new Date(p.dateTime):p?.date?Qr(p.date):t,g=null===m?null:function(e,t){const n=e-t;return n>=1?n:null}(_.getFullYear(),m),f=e.summary||"",v=function(e,t,n){const i=No(t),r=No(n);return void 0===i&&void 0===r?null:{field:"location"===e||"description"===e?e:"title",pattern:i,replacement:r}}(Ds(e._entityId,"replace_field",o,e),Ds(e._entityId,"replace_pattern",o,e),Ds(e._entityId,"replace_with",o,e)),y=Ro(f,v,"title"),w=y.replacedWholeField||""!==f.trim()&&""===y.text.trim();M[a].events.push({summary:null===g||w?y.text:io(y.text,g),location:Ds(e._entityId,"show_location",o,e)??o.show_location?Ro(Kr(e.location||"",o.remove_location_country),v,"location").text:"",description:l?Ro(null===m?u:no(u),v,"description").text:"",start:e.start,end:e.end,_entityId:e._entityId,_entityLabel:Ms(e._entityId,o,e),_matchedConfig:e._matchedConfig,_mergedFrom:e._mergedFrom,_source:e._source,_isEmptyDay:e._isEmptyDay,_isCustomEmptyText:e._isCustomEmptyText,_isMultiDaySegment:e._isMultiDaySegment,_sourceStart:e._sourceStart,_sourceEnd:e._sourceEnd,_splitFromTimedEvent:e._splitFromTimedEvent,_gridSegmentStartsEvent:e._gridSegmentStartsEvent,_gridSource:e._gridSource})});const k=ma(o.first_day_of_week,a?.locale);Object.values(M).forEach(e=>{const t=new Date(e.timestamp);e.weekNumber=Es(t,o,k),e.monthNumber=t.getMonth()}),Object.values(M).forEach(e=>{e.events.sort((e,t)=>{const n=!e.start.dateTime,i=!t.start.dateTime;if(n&&!i)return-1;if(!n&&i)return 1;let r,a;if(r=n&&e.start.date?Qr(e.start.date).getTime():e.start.dateTime?new Date(e.start.dateTime).getTime():0,a=i&&t.start.date?Qr(t.start.date).getTime():t.start.dateTime?new Date(t.start.dateTime).getTime():0,n&&i&&r===a){const n=hs(e._entityId,o),i=hs(t._entityId,o);return n!==i?n-i:(e.summary||"").localeCompare(t.summary||"",void 0,{sensitivity:"base"})}return r-a})});const x=c?Math.min(o.compact_days_to_show||o.days_to_show,o.days_to_show):o.days_to_show;let $,D=Object.values(M).sort((e,t)=>e.timestamp-t.timestamp).slice(0,x||3);if(c){const e=new Map;for(const t of D){const n=[];for(const i of t.events){if(i._isEmptyDay){n.push(i);continue}const t=i._entityId,r=i._matchedConfig;let a=-1;r?a=o.entities.findIndex(e=>"object"==typeof e&&e===r):t&&(a=o.entities.findIndex(e=>"string"==typeof e&&e===t));const s=-1!==a?`${t}__${a}`:t||"",l=r?.compact_events_to_show;if("number"!=typeof l||!Number.isFinite(l)){n.push(i);continue}const d=e.get(s)||0;d<l&&(n.push(i),e.set(s,d+1))}t.events=n}}if(d||l||(D=D.filter(e=>e.events.length>0&&!(1===e.events.length&&e.events[0]._isEmptyDay))),c){const e=o.compact_events_to_show;if("number"==typeof e&&Number.isFinite(e)){let t=[],n=0;if(o.compact_events_complete_days){const i=new Set;for(const t of D)if((1!==t.events.length||!t.events[0]._isEmptyDay)&&n<e&&t.events.length>0){const r=Math.min(t.events.length,e-n);r>0&&(i.add(ea(new Date(t.timestamp))),n+=r)}t=D.filter(e=>{const t=ea(new Date(e.timestamp));return i.has(t)})}else{t=[];for(const i of D){if(n>=e&&(1!==i.events.length||!i.events[0]._isEmptyDay))break;if(1===i.events.length&&i.events[0]._isEmptyDay){t.push(i);continue}const r=e-n;if(r>0&&i.events.length>0){const e={...i,events:i.events.slice(0,r)};t.push(e),n+=e.events.length}}}D=t}}if(o.show_empty_today&&!l){const e=new Date(v.getFullYear(),v.getMonth(),v.getDate()),t=oa(h,e),n=Boolean(M[ea(e)]);t>=0&&t<o.days_to_show&&!n&&($=e)}const S=D.length;if(l||0===D.length||$){const e=Ji(i),t=o.empty_day_text,n=Boolean(t),r=t||e.noEvents;let a,s=new Date(u);if(d)a=new Date(u),a.setDate(a.getDate()+x-1);else if(0===D.length)l?(a=new Date(u),a.setDate(a.getDate()+x-1)):a=new Date(u);else if(c&&o.compact_events_to_show)if(D.length>0){const e=Math.max(...D.map(e=>e.timestamp));a=new Date(e)}else a=new Date(u);else a=new Date(u),a.setDate(a.getDate()+x-1);$&&(s=new Date($),a=new Date($));const h=new Set(D.map(e=>ea(new Date(e.timestamp)))),m=[...D],p=oa(s,a);for(let t=0;t<=p;t++){const i=new Date(s);i.setDate(s.getDate()+t);const a=ea(i);if(!h.has(a)){const t=Es(i,o,k),s={weekday:e.daysOfWeek[i.getDay()],day:i.getDate(),month:e.months[i.getMonth()],timestamp:i.getTime(),events:[{summary:r,start:{date:a},end:{date:a},_entityId:"_empty_day_",_isEmptyDay:!0,_isCustomEmptyText:n,location:""}],weekNumber:t,monthNumber:i.getMonth()};m.push(s)}}m.sort((e,t)=>e.timestamp-t.timestamp),D=m}const T=$&&D.length>S?1:0;return D.slice(0,x+T)}function hs(e,t){if(!e)return Number.MAX_SAFE_INTEGER;const n=t.entities.findIndex(t=>"string"==typeof t?t===e:t.entity===e);return-1!==n?n:Number.MAX_SAFE_INTEGER}function ms(e){if(!e.start||!e.end)return!1;if(e.start.date&&e.end.date){const t=new Date(e.start.date),n=new Date(e.end.date);return n.setDate(n.getDate()-1),t.toDateString()!==n.toDateString()}if(e.start.dateTime&&e.end.dateTime){const t=new Date(e.start.dateTime),n=new Date(e.end.dateTime);return t.toDateString()!==n.toDateString()}return!1}function ps(e,t){return e._entityId&&e._matchedConfig&&void 0!==e._matchedConfig.split_multiday_events?e._matchedConfig.split_multiday_events:t.split_multiday_events}function _s(e){return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}function gs(e){const t=[],n=e._sourceStart??e.start,i=e._sourceEnd??e.end;if(e.start.date&&e.end.date){const r=Qr(e.start.date),a=Qr(e.end.date);a.setDate(a.getDate()-1);for(let o=new Date(r);o<=a;o.setDate(o.getDate()+1)){const r=_s(o),a=new Date(o);a.setDate(a.getDate()+1);const s=_s(a),l={...e,start:{date:r},end:{date:s},_isMultiDaySegment:!0,_sourceStart:n,_sourceEnd:i};t.push(l)}}else if(e.start.dateTime&&e.end.dateTime){const r=new Date(e.start.dateTime),a=new Date(e.end.dateTime),o=new Date(r);if(o.setHours(23,59,59,999),new Date(o.getTime()+1)<a){const s={...e,start:{dateTime:r.toISOString()},end:{dateTime:o.toISOString()},_isMultiDaySegment:!0,_sourceStart:n,_sourceEnd:i,_splitFromTimedEvent:!0};t.push(s);const l=new Date(r);l.setDate(l.getDate()+1),l.setHours(0,0,0,0);const d=new Date(a);d.setHours(0,0,0,0);for(let r=new Date(l);r<d;r.setDate(r.getDate()+1)){const a=_s(r),o=new Date(r);o.setDate(o.getDate()+1);const s=_s(o),l={...e,start:{date:a},end:{date:s},_isMultiDaySegment:!0,_sourceStart:n,_sourceEnd:i,_splitFromTimedEvent:!0};t.push(l)}if(a>d){const r={...e,start:{dateTime:d.toISOString()},end:{dateTime:a.toISOString()},_isMultiDaySegment:!0,_sourceStart:n,_sourceEnd:i,_splitFromTimedEvent:!0};t.push(r)}}else t.push({...e})}return t}function fs(e,t){const n=e?.event_type??t.event_type;return"timed"===n||"all_day"===n?n:"all"}function vs(e,t){if("all"===t)return[...e];const n="all_day"===t;return e.filter(e=>!e.start.dateTime===n)}function ys(e,t){return"location"===t?e.location:"description"===t?e.description:e.summary}function ws(e){const t=e.summary||"",n=e.location||"";let i="";return i=e.start.dateTime?`${new Date(e.start.dateTime).getTime()}|${e.end.dateTime?new Date(e.end.dateTime).getTime():0}`:`${e.start.date||""}|${e.end.date||""}`,`${t}|${i}|${n}`}function bs(e,t,n,i,r){if(!e)return"var(--calendar-card-line-color-vertical)";let a;a=i&&i._matchedConfig?i._matchedConfig:t.entities.find(t=>"string"==typeof t&&t===e||"object"==typeof t&&t.entity===e);const o=function(e,t,n,i){const r=i?.get(e),a="string"==typeof n?void 0:n?.accent_color;if(Ot(a)){if(r)return r}else if(a)return a;return Ot(t.accent_color)?r??Ve.accent_color:t.accent_color||Ve.accent_color}(e,t,a,r);return void 0===n||0===n||isNaN(n)?o:Me(o,n)}function Ms(e,t,n){if(!e)return;if(n&&n._matchedConfig)return n._matchedConfig.label;const i=t.entities.find(t=>"string"==typeof t&&t===e||"object"==typeof t&&t.entity===e);return i&&"string"!=typeof i?i.label:void 0}function ks(e,t,n,i){const r=Ms(e,t,n),a=fe(r),o=ye(r);if(!a&&!o)return r;const s=Ds(e,"label_type",t,n);return $e(s)&&s!==(a?"icon":"image")?r:o?function(e,t){if(!e)return;const n=t?.states?.[e]?.attributes?.entity_picture;return"string"==typeof n&&""!==n?n:void 0}(r,i):function(e,t){if(!e)return;const n=t?.states?.[e]?.attributes?.icon;return"string"==typeof n&&""!==n?n:void 0}(e,i)}function xs(e,t,n,i){const r=Ms(e,t,n);if(!r||!ye(r))return"";const a=i?.states?.[r]?.attributes?.friendly_name;return"string"==typeof a?a.trim():""}function $s(e,t,n){const i=e._mergedFrom;if(!i||i.length<2)return;const r=[],a=new Set;for(const o of i){const i={...e,_entityId:o.entityId,_matchedConfig:o.config},s=ks(o.entityId,t,i,n);s&&(a.has(s)||(a.add(s),r.push({value:s,iconColor:Ds(o.entityId,"label_icon_color",t,i),type:Ds(o.entityId,"label_type",t,i),alt:xs(o.entityId,t,i,n)})))}return r.length>1?r:void 0}function Ds(e,t,n,i){if(!e)return;if(i&&i._matchedConfig)return i._matchedConfig[t];const r=n.entities.find(t=>"string"==typeof t&&t===e||"object"==typeof t&&t.entity===e);return r&&"string"!=typeof r?r[t]:void 0}function Ss(e){if(!e||e._isEmptyDay)return!1;const t=new Date;if(!e.start.dateTime)return!1;const n=e.start.dateTime?new Date(e.start.dateTime):null,i=e.end.dateTime?new Date(e.end.dateTime):null;return!(!n||!i)&&t>=n&&t<i}function Ts(e,t,n){let i;const r=()=>{const e=new Date;return new Date(e.getFullYear(),e.getMonth(),e.getDate())},a=null==t?"":String(t);if(""!==a.trim())try{const e=a.trim(),t=function(e,t,n){const i=String(e).replace(/\s+/g,"").toLowerCase();if(""===i)return{kind:"nomatch"};const r=Oo(i),a=r[0],o=r.slice(1);let s;if("today"===a)s=Ho(n);else if(a===Po)s=function(e,t){return jo(e,(t%7+7)%7)}(n,t);else if(a in Ao)s=Fo(Ho(n),Ao[a]);else{if(""!==a)return{kind:"nomatch"};s=Ho(n)}if(o.length>8)return{kind:"error",message:"too many operators (maximum 8)"};for(const e of o){const t="-"===e[0]?-1:1,n=e.slice(1);if(""===n)return{kind:"error",message:`dangling "${e[0]}" with no value`};if(n in Ao){const e=Ao[n];s=t>0?Fo(s,e):jo(s,e);continue}const i=n.match(/^(\d+)w$/);if(i){s=zo(s,t*parseInt(i[1],10)*7);continue}const r=n.match(/^(\d+)$/);if(!r)return{kind:"error",message:`unrecognized operand "${n}"`};s=zo(s,t*parseInt(r[1],10))}return{kind:"ok",date:s}}(e,n,new Date);if("ok"===t.kind)i=t.date,isNaN(i.getTime())?(Ne(`start_date "${e}" resolved outside the supported date range. Falling back to today.`),i=r()):We(`Resolved start_date "${e}" to ${ea(i)}`);else if("error"===t.kind)Ne(`Invalid start_date "${e}": ${t.message}. Falling back to today.`),i=r();else if(e.includes("T"))i=new Date(e),isNaN(i.getTime())&&(Ne(`Invalid ISO date: ${e}, falling back to today`),i=r());else{const[t,n,a]=e.split("-").map(Number);t&&n&&a&&n>=1&&n<=12&&a>=1&&a<=31?(i=new Date(t,n-1,a),i.getFullYear()===t&&i.getMonth()===n-1&&i.getDate()===a||(Ne(`Impossible date: ${e}, falling back to today`),i=r())):(Ne(`Malformed date: ${e}, falling back to today`),i=r())}}catch(e){Ne(`Error parsing date: ${a}, falling back to today`,e),i=r()}else i=r();i.setHours(0,0,0,0);const o=new Date(i),s=parseInt(e.toString())||3;return o.setDate(i.getDate()+s),o.setHours(23,59,59,999),{start:i,end:o}}function Ls(e){try{const t=localStorage.getItem(e);if(!t)return null;const n=JSON.parse(t);if(!function(e){if("object"!=typeof e||null===e||Array.isArray(e))return!1;const t=e;return!("number"!=typeof t.timestamp||!Number.isFinite(t.timestamp))&&!!Array.isArray(t.events)&&t.events.every(e=>"object"==typeof e&&null!==e&&!Array.isArray(e))}(n))return localStorage.removeItem(e),Ne(`Malformed cache entry removed for ${e}`),null;const i=864e5;return Date.now()-n.timestamp>=i?(localStorage.removeItem(e),We(`Cache older than 24h removed for ${e}`),null):n}catch(t){Ne("Cache error:",t);try{localStorage.removeItem(e)}catch{}return null}}function Ys(e){return 60*(e?.refresh_interval||30)*1e3}function Cs(e,t){if(e.start_date&&""!==String(e.start_date).trim())return Ts(e.days_to_show,e.start_date,t).start;const n=new Date;return new Date(n.getFullYear(),n.getMonth(),n.getDate())}function Es(e,t,n){let i=function(e,t,n){const i=pa(t);return"iso"===i?ca(e):"simple"===i?function(e,t=0){const n=Date.UTC(e.getFullYear(),e.getMonth(),e.getDate()),i=Date.UTC(e.getFullYear(),0,1),r=Math.round((n-i)/864e5),a=(new Date(i).getUTCDay()-t+7)%7;return Math.ceil((r+a+1)/7)}(e,n):null}(e,t.show_week_numbers,n);if("iso"===pa(t.show_week_numbers)&&0===n&&0===e.getDay()){const t=new Date(e);t.setDate(t.getDate()+1),i=ca(t)}return i}function As(e,t,n,i){const r=Boolean(e._isEmptyDay),a=new Date,o=new Date(a.getFullYear(),a.getMonth(),a.getDate());let s=!1;if(r)s=!!e.start.date&&Qr(e.start.date)<o;else if(e.start.dateTime){const t=e.end.dateTime?new Date(e.end.dateTime):null;s=null!==t&&a>t}else{let t=e.end.date?Qr(e.end.date):null;if(t){const e=new Date(t);e.setDate(e.getDate()-1),t=e}s=null!==t&&o>t}const l=Zt(),d=e._mergedFrom&&e._mergedFrom.length>1?t.duplicate_accent_color:void 0,c=d||bs(e._entityId,t,void 0,e,l),u=t.event_background_opacity>0?t.event_background_opacity:0,h=u>0?d?Me(d,u):bs(e._entityId,t,u,e,l):"",m=Ds(e._entityId,"show_time",t,e)??t.show_time,p=!e.start.dateTime,_=function(e){if(e.start.dateTime)return!1;const t=Qr(e.start.date||""),n=Qr(e.end.date||"");return n.setDate(n.getDate()-1),t.toDateString()!==n.toDateString()}(e),g=m&&!(p&&!_&&!t.show_single_allday_time)&&!(_&&!t.show_multiday_allday_time)&&!r;let f=null;!t.show_countdown||p&&!t.show_countdown_allday||r||s||(f=function(e,t="en"){if(e._isEmptyDay||!e.start)return null;const n=new Date,i=e.start.dateTime?new Date(e.start.dateTime):e.start.date?Qr(e.start.date):null;if(!i||i<=n)return null;const r=oa(n,i);if(1===r)return Wr(1,"day",t);if(r>1){const e=new Date(n.getFullYear(),n.getMonth(),n.getDate());return Ur(new Date(i.getFullYear(),i.getMonth(),i.getDate()),t,e)}const a=Math.round((i.getTime()-n.getTime())/36e5);return a>=2?Wr(a,"hour",t):Ur(i,t,n)}(e,n));const v=Ss(e),y=t.show_progress_bar?function(e){const t=function(e){return e._isEmptyDay?null:e.start.dateTime&&e.end.dateTime?[new Date(e.start.dateTime),new Date(e.end.dateTime)]:e._splitFromTimedEvent&&e.start.date&&e.end.date?[Qr(e.start.date),Qr(e.end.date)]:null}(e);if(!t)return null;const n=new Date;if(!(n>=t[0]&&n<t[1]))return null;const i=function(e){const t=e._gridSource??(e._splitFromTimedEvent?{start:e._sourceStart,end:e._sourceEnd}:null),n=t?.start?.dateTime,i=t?.end?.dateTime;return n&&i?[new Date(n),new Date(i)]:null}(e),[r,a]=i&&i[1].getTime()>i[0].getTime()?i:t,o=a.getTime()-r.getTime(),s=n.getTime()-r.getTime();return Math.min(100,Math.max(0,Math.floor(s/o*100)))}(e):null,w=v&&t.show_now_indicator&&!r?qr(n):null,b=function(e,t,n,i){const r=!e.start.dateTime;let a,o;r?(a=Qr(e.start.date||""),o=Qr(e.end.date||"")):(a=new Date(e.start.dateTime||""),o=new Date(e.end.dateTime||""));const s=Ji(n);if(r){const e=new Date(o);return e.setDate(e.getDate()-1),a.toDateString()!==e.toDateString()?{allDayLabel:s.allDay,text:fa(e,n,s)}:{allDayLabel:s.allDay,text:""}}const l=la(t,i);return a.toDateString()!==o.toDateString()?{text:ga(a,o,n,s,l,t.time_two_digit_hours)}:{..._a(a,o,t.show_end_time,l,t.time_two_digit_hours)}}(e,t,n,i),M=function(e){if("string"==typeof e){const t=e.toLowerCase().trim();return Ae.includes(t)?t:null}return null}(t.allday_badge),k=function(e){if("string"==typeof e){const t=e.toLowerCase().trim();if(Pe.includes(t))return t}return"subtle"}(t.allday_badge_style),x=void 0!==b.allDayLabel,$=function(e){if("string"!=typeof e)return{source:ze};const t=e.trim();if(""===t)return{source:ze};const n=t.toLowerCase();return He.includes(n)?{source:n}:{source:"custom",color:t}}(t.allday_badge_color),D="custom"===$.source?$.color:c,S="text"===$.source,T="time"===M&&x?{label:b.allDayLabel,lang:n,accent:D,mode:k,inheritsText:S}:void 0,L="title"===M&&x&&!r?{accent:D,mode:k,inheritsText:S}:void 0,Y=T?b.text:function({allDayLabel:e,text:t}){return Xr(void 0===e?t:t?`${e}, ${t}`:e)}(b),C=p&&!e._splitFromTimedEvent,E=C&&!t.show_location_allday?"":e.location||"",A=C&&!t.show_description_allday?"":e.description||"",P=(z=E,Ds(e._entityId,"location_icon",t,e)||(function(e){return Boolean(e)&&Jr.test(e)}(z)?"mdi:microsoft-teams":"mdi:map-marker-outline")),H={eventTime:Y,eventTimeEnd:b.end,allDayBadge:T,titlePill:L,eventLocation:E,locationIcon:P,eventDescription:A,entityLabel:ks(e._entityId,t,e,i),entityLabelAlt:xs(e._entityId,t,e,i),mergedLabels:$s(e,t,i),shouldShowTime:g,countdownStr:f,progressPercentage:y,nowLabel:w};var z;return{isEmptyDay:r,isPastEvent:s,isNow:null!==w,entityAccentColor:c,entityAccentBackgroundColor:h,accentTextProperties:Qa(t,c,r),contentParts:H}}function Ps(e,t,n,i){return(t.mergedLabels??(t.entityLabel?[{value:t.entityLabel,type:e._matchedConfig?.label_type}]:[])).flatMap(({value:r,type:a})=>{const o=De(r,a);if("none"===o)return[];if("text"===o)return[r];const s=t.mergedLabels?e._mergedFrom?.find(({entityId:t,config:a})=>ks(t,n,{...e,_matchedConfig:a},i)===r):void 0,l=s?.entityId??e._entityId,d=s?{...e,_matchedConfig:s.config}:e,c=Ms(l,n,d),u=ye(c)?c:l,h=u&&i?.states[u]?.attributes.friendly_name;return"string"==typeof h&&h.trim()?[h]:u?[u]:[]})}const Hs="grid-scale-probe";function zs(e){const t=[],n=[];for(const i of e.events){if(i._isEmptyDay)continue;if(!i.start.dateTime){t.push(i);continue}const e=Co(i);e&&n.push({...i,...e})}return{allDay:t,timed:n}}function Fs(e,t){return e.isNewMonth&&!pn(t.month_separator_width)?{kind:"month",width:t.month_separator_width,color:t.month_separator_color}:e.isNewWeek&&!pn(t.week_separator_width)?{kind:"week",width:t.week_separator_width,color:t.week_separator_color}:pn(t.day_separator_width)?null:{kind:"day",width:t.day_separator_width,color:t.day_separator_color}}function js(e,t,n,i,r){return W`
    <div
      class="grid-boundary grid-boundary-${e}"
      aria-hidden="true"
      style=${yi({gridColumn:"2 / -1",gridRow:String(i),alignSelf:r,height:t,"--calendar-card-grid-rule-paint":n})}
    ></div>
  `}function Os(e){const t=e.trim().toLowerCase();return""!==t&&"transparent"!==t&&"none"!==t}function Is(e,t,n){const i=Math.floor(e/60)%24,r=String(e%60).padStart(2,"0");if(t)return n?`${i}:${r}`:String(i);const a=i<12?"AM":"PM",o=i%12==0?12:i%12;return n?`${o}:${r} ${a}`:`${o} ${a}`}function Ns(e,t,n){const i=e.endMin-e.startMin;return{"--calendar-card-grid-rule-color":n,"--calendar-card-grid-slot-color":t<60?n:"transparent","--calendar-card-grid-slot-pct":t/i*100+"%","--calendar-card-grid-hour-pct":60/i*100+"%","--calendar-card-grid-slot-offset":(t-e.startMin%t)%t/i*100+"%","--calendar-card-grid-hour-offset":(60-e.startMin%60)%60/i*100+"%"}}function Rs(e,t){return{"--calendar-card-grid-block-top":`${e.topPct}%`,"--calendar-card-grid-block-height":`${e.heightPct}%`,...Ws(e,t),...e.clippedBottom||t.touchedBelow||!t.ruledEnd?{"--calendar-card-grid-block-gap-below":"0px"}:{}}}function Ws(e,t){const n="--calendar-card-grid-block-gap-above";return e.clippedTop?{[n]:"0px"}:t.ruledStart?t.touchedAbove?{[n]:"max(var(--calendar-card-grid-rule-width), var(--calendar-card-grid-event-gap))"}:{}:{[n]:"var(--calendar-card-grid-event-gap)"}}function Bs(e,t){return{style:{insetInlineStart:`calc(${e}% + var(--calendar-card-grid-event-gap))`,width:`calc(${t-e}% - var(--calendar-card-grid-event-gap) * 2)`},raised:!1,contentLimited:!1}}function qs(e,t){const n=e.x1Pct-e.x0Pct,i=Math.max(e.startMin,t.startMin),r=Math.min(e.endMin,t.endMin)-i,a=r>0?(e.contentEndMin-i)/r:1,o=n>0?(e.contentX1Pct-e.x0Pct)/n:1,s=a<.999999,l=o<.999999;return{style:{...Bs(e.x0Pct,e.x1Pct).style,...s?{"--calendar-card-grid-text-block-ratio":String(a)}:{},...l?{"--calendar-card-grid-text-inline-ratio":String(o)}:{}},raised:e.raised,contentLimited:s||l}}function Us(e,t){const n=[],i=e.map(e=>mo(new Date(e.timestamp))),r=new Map;e.forEach((e,t)=>{for(const n of zs(e).allDay){const e=n._gridSource??n;let i=r.get(e);i||(i=new Map,r.set(e,i));const a=JSON.stringify(n._mergedFrom?.map(e=>e.entityId)??[]),o=i.get(a);o?o.columns.push(t):i.set(a,{event:{...n,...e},columns:[t]})}});const a=[...r.values()].flatMap(e=>[...e.values()]);for(const{event:e,columns:t}of a){const r=[];for(const e of t){const t=r[r.length-1];t&&t.last+1===e?t.last=e:r.push({first:e,last:e})}for(const{first:t,last:a}of r){const r=Eo(e,i.slice(t,a+1));r&&n.push({event:e,placement:{...r,columnIndex:r.columnIndex+t}})}}n.sort((e,t)=>t.placement.span-e.placement.span||e.placement.columnIndex-t.placement.columnIndex);const o=[],s=[];for(const e of n){const n=e.placement.columnIndex,i=n+e.placement.span;let r=o.findIndex(e=>e.every(([e,t])=>i<=e||n>=t));if(r<0){if(o.length>=t)continue;r=o.length,o.push([])}o[r].push([n,i]),s.push({...e,row:r+1})}return s}function Vs(e,t,n,i,r,a=new Date,o=30,s=1/0,l=!1){if(0===e.length)return W`<div class="grid-container"></div>`;const d=lo(mn(t,"start_time"),mn(t,"end_time")),c=mn(t,"slot_minutes"),u=mn(t,"hour_height"),h=mn(t,"axis_width"),m=mn(t,"max_simultaneous_events"),p=mn(t,"show_now_line"),_=mn(t,"show_axis_labels"),g=mn(t,"allday_band_max_rows"),f=mn(t,"day_header_gap"),v=mn(t,"weekend_background_color"),y=mn(t,"hour_line_width"),w=mn(t,"hour_line_color"),b=(d.endMin-d.startMin)/60,M=Cn(t.day_spacing),k=(x=e).map((e,t)=>{const n=t>0?x[t-1]:void 0;return{isNewWeek:!n||e.weekNumber!==n.weekNumber,isNewMonth:Boolean(n&&e.monthNumber!==n.monthNumber)}});var x;const $=e.map(e=>l?ui(e.timestamp):void 0),D=Us(e,g),S=D.reduce((e,t)=>Math.max(e,t.row),0),T=k.map((e,n)=>({separator:Fs(e,t),index:n})).filter(({separator:e,index:t})=>null!==e&&t>0).map(({separator:e,index:t})=>function(e,t,n){return W`
    <div
      class="grid-separator grid-separator-${e.kind}"
      style=${yi({gridColumn:String(t+2),gridRow:"3 / span 2",width:e.width,"--calendar-card-grid-rule-paint":e.color,marginInlineStart:`calc(-0.5 * (${n} + ${e.width}))`})}
    ></div>
  `}(e,t,M)),L=mn(t,"day_header_separator_width"),Y=mn(t,"day_header_separator_color"),C=mn(t,"allday_band_line_width"),E=mn(t,"allday_band_line_color"),A=[...S>0&&!pn(L)?[js("band-top",L,Y,3,"start")]:[],...pn(C)?[]:[js("band-bottom",C,E,S>0?3:4,S>0?"end":"start")]],P=null!=t.height&&""!==t.height&&"auto"!==t.height,H="cramp"===In(t,"grid");return W`
    <div
      class="grid-container"
      tabindex=${H?"0":U}
      style=${yi({gridTemplateColumns:`${h} repeat(${e.length}, minmax(${H?"2rem":"0"}, 1fr))`,...H?{overflowX:"auto"}:{},columnGap:M,"--calendar-card-grid-body-height":P?"minmax(50%, 1fr)":`calc(${u} * ${b})`,...P?{height:"100%","--calendar-card-grid-allday-height":"minmax(0, auto)"}:{},"--calendar-card-column-header-gap":f,"--calendar-card-grid-band-top-width":L,"--calendar-card-grid-band-bottom-width":C,"--calendar-card-grid-rule-width":y,...Ns(d,c,w),...Os(v)?{"--calendar-card-grid-weekend":v}:{}})}
    >
      ${Os(v)?function(e,t){const n=[];return e.forEach((i,r)=>{const a=new Date(i.timestamp);if(!aa(a,t))return;const o=n[n.length-1];void 0!==o&&o.start+o.span===r&&1===oa(new Date(e[r-1].timestamp),a)?o.span+=1:n.push({start:r,span:1})}),n.map(({start:e,span:t})=>W`
      <div
        class="grid-weekend"
        aria-hidden="true"
        style=${yi({gridColumn:`${e+2} / span ${t}`,gridRow:"3 / span 2"})}
      ></div>
    `)}(e,r):U}
      ${function(e,t){const n=e.map((n,i)=>{const r=i>0?e[i-1]:void 0;return!(r&&n.weekNumber===r.weekNumber||0===i&&!t.show_current_week_number)});return null!==t.show_week_numbers&&n.some(Boolean)?e.map((e,t)=>ja(e.weekNumber,n[t],t+2)):e.map(()=>U)}(e,t)}
      ${e.map((e,a)=>function(e,t,n,i,r,a,o){const s=new Date(e.timestamp),{isToday:l,isTomorrow:d}=za(e.timestamp),c=Ha(s,t,r);return W`
    <div
      class=${Hi({"grid-day-header":!0,today:l,tomorrow:d,"future-day":!l,weekend:aa(s,a)})}
      style=${yi({gridColumn:String(i+2),gridRow:"2"})}
    >
      ${Fa(s,t,n,l,c,null,a,o)}
    </div>
  `}(e,t,n,a,i,r,$[a]))}
      ${S>0?W`
              <div
                class="grid-allday-band"
                role=${P?"group":U}
                aria-label=${P?Xr(Ji(n).allDay):U}
                tabindex=${P?"0":U}
                style=${yi({gridColumn:`1 / span ${e.length+1}`,gridRow:"3",gridTemplateColumns:"subgrid",gridTemplateRows:`repeat(${S}, auto)`})}
              >
                ${D.map(e=>function(e,t,n,i,r,a,o=!1,s){const l=As(e,i,r,a),d=ci(e,l.entityAccentColor,o);return W`
    <div
      class=${Hi({event:!0,"grid-banner":!0,"past-event":l.isPastEvent,"continues-before":t.continuesBefore,"continues-after":t.continuesAfter,"event-interactive":void 0!==d})}
      style=${yi({gridColumn:`${t.columnIndex+2} / span ${t.span}`,gridRow:String(n),backgroundColor:l.entityAccentBackgroundColor,...l.accentTextProperties})}
      role=${d?"button":U}
      tabindex=${d?"0":U}
      aria-describedby=${d&&s?s:U}
      .calendarCardEventTap=${d}
    >
      <span class="grid-banner-title">${e.summary??""}</span>
    </div>
  `}(e.event,e.placement,e.row,t,n,r,l,$[e.placement.columnIndex]))}
              </div>
            `:U}
      ${_?function(e,t,n){const i=e.endMin-e.startMin,r=la(t,n),a=co(Number(mn(t,"axis_label_minutes"))),o=a%60!=0,s=function(e,t){const n=co(t),i=[];for(let t=Math.ceil(e.startMin/n)*n;t<=e.endMin;t+=n)i.push(t);return i}(e,a).map(t=>({text:Is(t,r,o),topPct:(t-e.startMin)/i*100}));return W`
    <div class="grid-axis" style=${yi({gridColumn:"1",gridRow:"4"})}>
      <div class="grid-axis-sizer" aria-hidden="true">
        ${s.map(({text:e})=>W`<span>${e}</span>`)}
      </div>
      ${s.map(({text:e,topPct:t})=>W`<div
            class="grid-axis-label"
            style=${yi({"--calendar-card-grid-axis-label-top":`${t}%`})}
          >
            ${e}
          </div>`)}
    </div>
  `}(d,t,r):U} ${F=e.length,W`
    <div
      class="grid-rules"
      aria-hidden="true"
      style=${yi({gridColumn:`2 / span ${F}`,gridRow:"4"})}
    ></div>
  `}
      ${function(e,t){return uo(e.endMin,t)}(d,c)?(z=w,W`
    <div
      class="grid-boundary grid-boundary-body-end"
      aria-hidden="true"
      style=${yi({gridColumn:"2 / -1",gridRow:"4",alignSelf:"end","--calendar-card-grid-rule-paint":z})}
    ></div>
  `):U}
      ${e.map((e,c)=>function(e,t,n,i,r,a,o,s,l,d,c,u,h=!1,m){const p=new Date(e.timestamp),{isToday:_}=za(e.timestamp),{timed:g}=zs(e),f=g.filter(e=>_o(e.startMin,e.endMin,t)),v="cascade"===mn(n,"overlap_layout"),y=[],w=[];if(v){const e=function(e,t,n){const i=Number.isFinite(n.maxLanes)?Math.max(1,Math.floor(n.maxLanes)):1,r=100/(i+1),a=[...e].sort((e,t)=>e.startMin-t.startMin||t.endMin-e.endMin),o=new Set;for(;;){const e=To(a,t,n,i,o),s=e.filter(e=>!e.hidden&&null!==e.host&&(e.x1-e.x0<r-xo||e.contentX1-e.x0<r-xo)).map(e=>e.host.order).filter(e=>!o.has(e));if(0===s.length)return Yo(e);s.forEach(e=>o.add(e))}}(f,t,{thresholdMin:o,indentPct:6,maxDepth:3,maxLanes:a,stripPct:s});for(const n of e.placed)y.push({event:n,horizontal:qs(n,t),span:n});for(const t of e.overflows)w.push({overflow:t,horizontal:Bs(t.x0Pct,t.x1Pct),span:t})}else{const{placed:e,overflows:t}=function(e,t,n=1/0){const i=Number.isFinite(t)?Math.max(1,Math.floor(t)):1,r=[...e].sort((e,t)=>e.startMin-t.startMin||t.endMin-e.endMin),a=[];let o=[],s=fo;for(const e of r)o.length>0&&yo(s,e.startMin)&&(a.push(o),o=[],s=fo),o.push(e),s=wo(s,vo(e));o.length>0&&a.push(o);const l=[],d=[];for(const e of a){const t=ko(e,i),r=t.reduce((e,t)=>Math.max(e,t.laneIndex+1),0),{share:a,overflowStart:o}=Mo(0,100,r,i,n),s=e=>({laneIndex:e,x0Pct:e*a,x1Pct:(e+1)*a});if(r<=i){for(const e of t)l.push({...e.event,...s(e.laneIndex),laneCount:r});continue}const c=t.filter(e=>e.laneIndex<i),u=t.filter(e=>e.laneIndex>=i).map(e=>e.event),h=i+1;for(const e of c)l.push({...e.event,...s(e.laneIndex),laneCount:h});for(const e of bo(u,e=>e))d.push({startMin:Math.min(...e.map(e=>e.startMin)),endMin:Math.max(...e.map(e=>e.endMin)),laneIndex:i,laneCount:h,x0Pct:o,x1Pct:100,hidden:e})}return{placed:l,overflows:d}}(f,a,s);for(const t of e)y.push({event:t,horizontal:Bs(t.x0Pct,t.x1Pct),span:t});for(const e of t)w.push({overflow:e,horizontal:Bs(e.x0Pct,e.x1Pct),span:e})}const b=function(e,t,n){const i=e=>uo(Math.floor(e),n)||uo(Math.ceil(e),n),r=(e,t)=>e!==t&&e.endMin>e.startMin&&e.endMin===t.startMin&&e.x0Pct<t.x1Pct&&t.x0Pct<e.x1Pct;return e.map(n=>({ruledStart:n.startMin<=t.startMin||i(n.startMin),ruledEnd:i(n.endMin),touchedAbove:e.some(e=>r(e,n)),touchedBelow:e.some(e=>r(n,e))}))}([...y,...w].map(({span:e})=>e),t,mn(n,"slot_minutes")),M=new Date(d);M.setSeconds(0,0);const k=l&&_?function(e,t){const n=ho(e);return n<t.startMin||n>=t.endMin?null:(n-t.startMin)/(t.endMin-t.startMin)*100}(M,t):null,x=null===k?null:ho(M),$=yi({top:`${k}%`});return W`
    <div
      class=${Hi({"grid-day-body":!0,today:_,weekend:aa(p,u)})}
      style=${yi({gridColumn:String(r+2),gridRow:"4"})}
    >
      ${null===k?U:W`<div class="grid-now-line" aria-hidden="true" style=${$}></div>`}
      <div
        class=${Hi({"grid-day-plane":!0,"grid-day-plane-now":null!==k})}
        style=${yi(null===k?{}:{"--calendar-card-grid-now-y":`${k}cqh`})}
      >
        ${qi(y,({event:e},t)=>`${e._entityId}-${e.summary}-${t}`,({event:e,horizontal:r},a)=>{const o=go(e.startMin,e.endMin,t);return o?function(e,t,n,i,r,a,o,s,l=!1,d,c=null){const u=As(e,r,a,s),h=ci(e,u.entityAccentColor,l),m=function(e,t,n,i){const r=t.nowLabel?{...t,nowLabel:null}:t;if(!e._isMultiDaySegment)return r;if(!e._gridSegmentStartsEvent||!e.start.dateTime)return{...r,eventTime:"",eventTimeEnd:void 0,shouldShowTime:!1,countdownStr:null};const a=new Date(e.start.dateTime);if(Number.isNaN(a.getTime()))return{...r,eventTime:"",eventTimeEnd:void 0,shouldShowTime:!1,countdownStr:null};const o=la(n,i);return{...r,eventTime:sa(a,o,n.time_two_digit_hours),eventTimeEnd:void 0}}(e,u.contentParts,r,s),p=u.entityAccentBackgroundColor,_=null!==c&&e.startMin<=c&&c<e.endMin,g=i.raised?W`<div
        class=${Hi({"grid-event-backdrop":!0,"clipped-top":t.clippedTop,"clipped-bottom":t.clippedBottom})}
        aria-hidden="true"
        style=${yi({...Rs(t,n),...i.style,"--calendar-card-grid-raised-top":`${t.topPct}cqh`})}
      >
        <div class="grid-event-backdrop-ground">
          <div class="grid-event-backdrop-rules"></div>
        </div>
      </div>`:U;return W`
    ${g}
    <div
      class=${Hi({event:!0,"grid-event":!0,"past-event":u.isPastEvent,"clipped-top":t.clippedTop,"clipped-bottom":t.clippedBottom,"grid-event-raised":i.raised,"grid-event-content-limited":i.contentLimited,"grid-event-now":_,"event-interactive":void 0!==h})}
      style=${yi({...Rs(t,n),...i.style,..._?{"--calendar-card-grid-block-top-cqh":`${t.topPct}cqh`}:{},"--calendar-card-event-accent-bar-color":u.entityAccentColor,backgroundColor:p,...u.accentTextProperties})}
      role=${h?"button":U}
      tabindex=${h?"0":U}
      aria-describedby=${h&&d?d:U}
      .calendarCardEventTap=${h}
    >
      ${Ga()}
      <div
        class="grid-event-accessible"
        role="group"
        lang=${a}
        aria-label=${function(e,t,n,i,r,a){const o=e._gridSource?{...e,start:e._gridSource.start,end:e._gridSource.end}:e,s=o.start.dateTime!==e.start.dateTime||o.end.dateTime!==e.end.dateTime?As(o,n,i,a).contentParts:t,l=Ua(e,n,r,"row",a),d=mn(n,"show_now_line")&&Ss(e)?qr(i):"";return[...Ps(e,t,n,a),e.summary,d,s.shouldShowTime?s.eventTime:"",s.countdownStr,t.eventLocation,t.eventDescription,l?.showTemp?`${l.forecast.temperature}°`:"",l?.showUvIndex?`UV${l.forecast.uv_index}`:"",l?.conditionText,null!==t.progressPercentage&&n.show_progress_bar?`${Math.round(t.progressPercentage)}%`:""].filter(e=>"string"==typeof e&&e.trim().length>0).map(e=>`⁨${e.trim()}⁩`).join(", ")}(e,u.contentParts,r,a,o,s)}
      ></div>
      <div class="grid-event-disclosure" aria-hidden="true">
        ${Va(e,r,m,{weatherForecasts:o,weatherPlacement:"row",progressPlacement:"row",countdownPlacement:"text",hass:s,splitTimeEnd:!0,titleWords:!0})}
      </div>
    </div>
  `}(e,o,b[a],r,n,i,c,u,h,m,x):U})}
        ${w.map(({overflow:e,horizontal:n},i)=>{const r=go(e.startMin,e.endMin,t);return r?function(e,t,n,i){const r=`+${e.hidden.length}`;return W`
    <div
      class="event grid-event grid-event-overflow"
      title=${e.hidden.map(e=>e.summary??"").join("\n")}
      style=${yi({...Rs(t,n),...i.style})}
    >
      <div class="grid-event-overflow-label">${r}</div>
    </div>
  `}(e,r,b[y.length+i],n):U})}
      </div>
      ${null===k?U:W`<div class="grid-now-dot" aria-hidden="true" style=${$}></div>`}
    </div>
  `}(e,d,t,n,c,m,o,s,p,a,i,r,l,$[c]))}
      ${T} ${A}
    </div>
  `;var z,F}const Gs={list:[["2","3","10","7","2"],["15","3","31","7","2",".4"],["2","12.5","10","7","2"],["15","12.5","31","7","2",".4"],["2","22","10","7","2"],["15","22","31","7","2",".4"]],column:[["2","3","13","5","2"],["17.5","3","13","5","2"],["33","3","13","5","2"],["2","10.5","13","18.5","2",".4"],["17.5","10.5","13","18.5","2",".4"],["33","10.5","13","18.5","2",".4"]],grid:[["9","3","11","4","1.5"],["22","3","11","4","1.5"],["35","3","11","4","1.5"],["9","9","24","3","1.5",".55"],["2","15.5","5","1.5",".75",".5"],["2","21","5","1.5",".75",".5"],["2","26.5","5","1.5",".75",".5"],["9","14.5","11","6","1.5",".4"],["9","23","11","5","1.5",".4"],["22","14.5","11","13.5","1.5",".4"],["35","19","11","7","1.5",".4"]]},Ks={list:"viewList",column:"viewColumns",grid:"viewGrid"};function Js(e){e.stopPropagation()}const Zs=new WeakMap,Xs=new WeakSet;function Qs(e){try{return e.matches(":open")}catch{return}}const el={idle:"",turning:"busy",done:"refresh-done",failed:"refresh-failed"},tl={idle:pi,turning:pi,done:mi,failed:"M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z"};function nl(e){return e.map(e=>e.month?W`<span class="toolbar-month-name">${e.text}</span>`:e.text)}function il(e){return e.map(e=>W`<span>${nl(e)}</span>`)}function rl(e){return e.legend?.folded?e.legend:void 0}function al(e,t){if(!function(e){return Boolean(rl(e)||e.addEvent||e.viewSwitcher||e.reset||e.refresh)}(e))return U;const n=rl(e),i=!(n||e.addEvent||e.viewSwitcher||e.refresh);return W`<div
    class="card-toolbar toolbar-actions"
    @pointerdown=${Js}
    @click=${Js}
  >
    <div class="toolbar-start">
      ${n?function(e){const t=e.name??wi,n=e.calendars.some(e=>!e.shown);return W`<button
      type="button"
      class=${n?"toolbar-button legend-button filtered":"toolbar-button legend-button"}
      aria-haspopup="dialog"
      aria-expanded="false"
      aria-label=${t}
      title=${e.name??U}
      @pointerdown=${Ei}
      @click=${t=>{t.stopPropagation();const n=t.currentTarget,i=(e=>e.parentElement?.querySelector("dialog.legend-menu")??null)(n);i&&(Si.has(i)?Li(i,"button"):e.inert||function(e,t){if(e.open||Si.has(e)||!e.isConnected)return;try{e.showModal()}catch{return}Ti(e,t),Di(e),t.setAttribute("aria-expanded","true");const n=e.ownerDocument.defaultView??window,i=t=>{t.composedPath().includes(e)||Li(e,"scroll")},r=()=>Li(e,"resize"),a=()=>Yi(e);n.addEventListener("scroll",i,{capture:!0,passive:!0}),n.addEventListener("resize",r),e.addEventListener("close",a),Si.set(e,{opener:t,reason:void 0,stop:()=>{n.removeEventListener("scroll",i,{capture:!0}),n.removeEventListener("resize",r),e.removeEventListener("close",a)}})}(i,n))}}
    >
      <svg class="toolbar-button-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d=${"M6 1H8V3H16V1H18V3H19C20.11 3 21 3.9 21 5V11H19V8H5V19H15V21H5C3.9 21 3 20.11 3 19V5C3 3.9 3.9 3 5 3H6V1M17 21L18.8 22.77C19.3 23.27 20 22.87 20 22.28V18L22.8 14.6C23.3 13.9 22.8 13 22 13H15C14.2 13 13.7 14 14.2 14.6L17 18V21"}></path>
      </svg>
    </button>
    <dialog
      class="legend-menu"
      aria-label=${t}
      @pointerdown=${Ei}
      @click=${e=>{e.stopPropagation();const t=e.currentTarget;if(e.target!==t)return;const n=t.getBoundingClientRect();e.clientX>=n.left&&e.clientX<=n.right&&e.clientY>=n.top&&e.clientY<=n.bottom||Li(t,"backdrop")}}
    >
      <div class="legend-menu-list" role="group" aria-label=${t}>
        ${e.calendars.map(t=>W`<label
              class=${t.shown?"legend-menu-row":"legend-menu-row hidden-calendar"}
              style=${Ai(t)}
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
    </dialog>`}(n):U}
      ${e.addEvent?(r=e.addEvent,W`<button
    type="button"
    class="toolbar-button add-event-button"
    aria-label=${r.label??"Add event"}
    title=${r.label??U}
    @pointerdown=${Js}
    @click=${e=>{e.stopPropagation(),r.onActivate()}}
  >
    <svg class="toolbar-button-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d=${"M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"}></path>
    </svg>
  </button>`):U}
    </div>
    ${e.viewSwitcher?function(e,t){return W`<div class="view-switcher" role="group">
    ${e.views.map(n=>{const i=n.view===e.selected,r=["view-switcher-segment",i?"selected":"",n.available?"":"unavailable",t?"":"icon-only"].filter(e=>""!==e).join(" ");return W`<button
        type="button"
        class=${r}
        data-view=${n.view}
        aria-pressed=${i?"true":"false"}
        aria-disabled=${n.available?U:"true"}
        aria-label=${t?U:n.label}
        title=${t?U:n.label}
        @pointerdown=${Js}
        @click=${t=>{t.stopPropagation(),n.available&&e.onSelect(n.view)}}
      >
        ${t?W`<span class="toolbar-button-label">${n.label}</span>`:(a=n.view,W`<svg
    class="view-switcher-icon"
    viewBox=${"0 0 48 32"}
    aria-hidden="true"
    focusable="false"
  >
    <g fill="currentColor">
      ${Gs[a].map(([e,t,n,i,r,a])=>B`<rect x=${e} y=${t} width=${n} height=${i} rx=${r} opacity=${a??U}></rect>`)}
    </g>
  </svg>`)}
      </button>`;var a})}
  </div>`}(e.viewSwitcher,t):U}
    <div class="toolbar-end">
      ${e.reset?function(e,t){const n=e.active?void 0:e.confirmation,i=["toolbar-button","reset-button",t?"alone":"",n?"reset-done":"",e.active||"showing"===n?"":"unavailable"].filter(e=>""!==e).join(" ");return W`<button
    type="button"
    class=${i}
    aria-disabled=${e.active?U:"true"}
    aria-label=${e.label??"Reset"}
    title=${e.label??U}
    @pointerdown=${Js}
    @click=${t=>{t.stopPropagation(),e.active&&e.onActivate()}}
  >
    <svg class="toolbar-button-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d=${n?mi:"M13.5,7A6.5,6.5 0 0,1 20,13.5A6.5,6.5 0 0,1 13.5,20H10V18H13.5C16,18 18,16 18,13.5C18,11 16,9 13.5,9H7.83L10.91,12.09L9.5,13.5L4,8L9.5,2.5L10.92,3.91L7.83,7H13.5M6,18H8V20H6V18Z"}></path>
    </svg>
  </button>`}(e.reset,i):U}
      ${e.refresh?function(e){const t=["toolbar-button","refresh-button",el[e.phase],e.unasked?"unasked":""].filter(e=>""!==e).join(" ");return W`<button
    type="button"
    class=${t}
    aria-label=${e.label??"Refresh"}
    title=${e.label??U}
    @pointerdown=${Js}
    @click=${t=>{t.stopPropagation(),e.onActivate()}}
  >
    <svg class="toolbar-button-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d=${tl[e.phase]}></path>
    </svg>
  </button>`}(e.refresh):U}
    </div>
  </div>`;var r}function ol(e){const t=e.target;t?.closest?.(".card-header")||e.stopPropagation()}function sl(e,t){const n=function(e){return void 0!==e.legend&&!e.legend.folded}(e)?e.legend:void 0,i=e.heading,r=["card-toolbar","toolbar-heading",n?"chips-shown":"",i?.short?"short-month":""].filter(e=>""!==e).join(" ");return W`<div
    class=${r}
    @pointerdown=${ol}
    @click=${ol}
  >
    <div class="toolbar-identity">
      ${t}${i?function(e,t){const n=W`<span class="toolbar-month-reserve" aria-hidden="true"
    >${il(e.reserve)}</span
  >`,i=W`<span class="toolbar-month-measure" aria-hidden="true"
    ><span class="toolbar-month-probe">${il(e.full)}</span></span
  >`,r=W`<span id="toolbar-range-text" class="toolbar-range-text" aria-live="polite"
    >${e.range}</span
  >`;if(!t)return W`<div class="toolbar-month">
      ${n}
      <span class="toolbar-month-slot">
        <span class="toolbar-month-label" title=${e.range}
          ><bdi class="toolbar-month-text"
            ><span class="toolbar-month-cap"></span>${nl(e.text)}</bdi
          ></span
        >
      </span>
      ${i}${r}
    </div>`;const a=e=>e?.parentElement?.querySelector("input.toolbar-date-input")??null;return W`<div class="toolbar-month with-picker">
    ${n}
    <span class="toolbar-month-slot">
      <button
        type="button"
        class="toolbar-month-button"
        title=${e.range}
        aria-describedby="toolbar-range-text"
        @pointerdown=${e=>{Js(e);const t=a(e.currentTarget);if(!t)return;Xs.delete(t);const n=Zs.get(t);n&&(n(),Xs.add(t),t.blur())}}
        @click=${e=>{e.stopPropagation();const n=e.currentTarget,i=a(n);if(!i)return;if(Xs.delete(i)&&e.detail>0)return;if(t.inert)return;const r=n.getRootNode().activeElement===n?n:null;i.value=t.pickerValue,i.focus({preventScroll:!0});try{i.showPicker(),function(e,t){Zs.get(e)?.();const n=[],i=()=>{Zs.delete(e);for(const[t,i]of n)e.removeEventListener(t,i);e.setAttribute("aria-hidden","true")},r=()=>{Zs.has(e)&&(i(),function(e){return e.getRootNode().activeElement===e}(e)&&(t?.isConnected?t.focus({preventScroll:!0}):e.blur()))},a=(t,i)=>{e.addEventListener(t,i),n.push([t,i])};if(a("blur",i),a("change",r),a("keydown",e=>{"Escape"===e.key&&r()}),Zs.set(e,i),e.removeAttribute("aria-hidden"),!0!==Qs(e))return;const o=()=>{Zs.has(e)&&(e.isConnected&&!0===Qs(e)?requestAnimationFrame(o):r())};requestAnimationFrame(o)}(i,r)}catch{i.click()}}}
      >
        <span class="toolbar-month-label"
          ><bdi class="toolbar-month-text"
            ><span class="toolbar-month-cap"></span>${nl(e.text)}</bdi
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
        @change=${e=>{const n=e.target.value;n&&t.onPick(n)}}
      />
    </span>
    ${i}${r}
  </div>`}(i,e.navigation):U}
    </div>
    ${n?function(e){const t=e.name??wi;return W`<div
    class="toolbar-legend"
    role="group"
    aria-label=${t}
    @pointerdown=${Ei}
    @click=${Ei}
  >
    <div class="legend-chips">
      ${e.calendars.map(t=>W`<button
            type="button"
            class=${t.shown?"legend-chip":"legend-chip hidden-calendar"}
            style=${Ai(t)}
            data-calendar=${t.id}
            aria-pressed=${t.shown?"true":"false"}
            @click=${()=>{e.inert||e.onToggle(t.id)}}
          >
            <span class="legend-chip-label">${t.name}</span>
          </button>`)}
    </div>
  </div>`}(n):U}
    <div class="toolbar-heading-end">
      ${e.navigation?function(e){const t=(e,t,n,i,r,a=!1)=>W`<button
      type="button"
      class=${a?"date-navigation-segment home-done":"date-navigation-segment"}
      aria-label=${e??t}
      title=${e??U}
      @pointerdown=${Js}
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
    </button>`;return W`<div class="date-navigation" role="group" aria-labelledby="toolbar-range-text">
    ${t(e.previousName,"Previous","M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z",e.onPrevious,!0)}
    ${e.homeConfirming?t(e.homeName,e.homeName,"M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z",e.onHome,!1,!0):t(e.homeName,e.homeName,"M12 5.69L17 10.19V18H15V12H9V18H7V10.19L12 5.69M12 3L2 12H5V20H11V14H13V20H19V12H22",e.onHome,!1)}
    ${t(e.nextName,"Next","M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z",e.onNext,!0)}
  </div>`}(e.navigation):U}
    </div>
  </div>`}function ll(e,t){return e.isNewMonth&&!pn(t.month_separator_width)?{kind:"month",width:t.month_separator_width,color:t.month_separator_color}:e.isNewWeek&&!pn(t.week_separator_width)?{kind:"week",width:t.week_separator_width,color:t.week_separator_color}:pn(t.day_separator_width)?null:{kind:"day",width:t.day_separator_width,color:t.day_separator_color}}function dl(e,t,n,i,r,a=!1){const o=cn(t,"day_header_gap"),s=Cn(t.day_spacing),l=function(e){return e.map((t,n)=>{const i=n>0?e[n-1]:void 0;return{isNewWeek:!i||t.weekNumber!==i.weekNumber,isNewMonth:Boolean(i&&t.monthNumber!==i.monthNumber)}})}(e),d=function(e,t,n){const i=t.map((e,t)=>e.isNewWeek&&!(0===t&&!n.show_current_week_number));return null!==n.show_week_numbers&&i.some(Boolean)?e.map((e,t)=>function(e,t,n){return ja(e,t,n+1)}(e.weekNumber,i[t],t)):e.map(()=>U)}(e,l,t),c=l.map((e,n)=>({separator:ll(e,t),index:n})).filter(({separator:e,index:t})=>null!==e&&t>0).map(({separator:e,index:t})=>function(e,t,n){return W`
    <div
      class="column-separator column-separator-${e.kind}"
      style=${yi({gridColumn:String(t+1),gridRow:"day"===e.kind?"2":"1 / -1",width:e.width,backgroundColor:e.color,marginInlineStart:`calc(-0.5 * (${n} + ${e.width}))`})}
    ></div>
  `}(e,t,s));return W`
    <div
      class="column-grid"
      style=${yi({gridTemplateColumns:`repeat(${e.length}, minmax(0, 1fr))`,columnGap:s,"--calendar-card-column-header-gap":o})}
    >
      ${d}
      ${e.map((e,o)=>function(e,t,n,i,r,a,o=!1){const s=new Date(e.timestamp),{isToday:l,isTomorrow:d}=za(e.timestamp),c=aa(s,a),u=Ha(s,t,r),h=o?ui(e.timestamp):void 0,m=cn(t,"day_header_separator_width"),p=cn(t,"day_header_separator_color"),_=pn(m)?null:{width:m,color:p};return W`
    <div
      class=${Hi({"day-column":!0,today:l,tomorrow:d,"future-day":!l,weekend:c})}
      style=${yi({gridColumn:String(i+1),gridRow:"2"})}
    >
      ${Fa(s,t,n,l,u,_,a,h)}
      <div
        class=${_n(t)?"column-events with-event-gap":"column-events"}
      >
        ${qi(e.events,(e,t)=>`${e._entityId}-${e.summary}-${t}`,(i,s)=>function(e,t,n,i,r,a,o,s=!1,l){const d=As(e,i,r,o),c=ci(e,d.entityAccentColor,s),u=0===n,h=n===t.events.length-1,m={event:!0,"event-first":u,"event-middle":!u&&!h,"event-last":h,"past-event":d.isPastEvent,"event-interactive":void 0!==c,"event-now":d.isNow};return W`
    <div
      class=${Hi(m)}
      style="--calendar-card-event-accent-bar-color: ${d.entityAccentColor}; background-color: ${d.entityAccentBackgroundColor};${we(d.accentTextProperties)}"
      role=${c?"button":U}
      tabindex=${c?"0":U}
      aria-describedby=${c&&l?l:U}
      .calendarCardEventTap=${c}
    >
      ${Ga()}
      ${Va(e,i,d.contentParts,{weatherForecasts:a,weatherPlacement:"row",progressPlacement:"row",countdownPlacement:"text",hass:o})}
    </div>
  `}(i,e,s,t,n,r,a,o,h))}
      </div>
    </div>
  `}(e,t,n,o,i,r,a))}
      ${c}
    </div>
  `}function cl(e,t){const n=Ji(t);return"loading"===e?W`
      <div class="calendar-card">
        <div class="loading">${n.loading}</div>
      </div>
    `:W`
    <div class="calendar-card">
      <div class="error">${n.error}</div>
    </div>
  `}function ul(e,t,n,i="day"){if("day"===i)return{borderTopWidth:e,borderTopColor:t,borderTopStyle:"solid",marginTop:"0px",marginBottom:n.day_spacing};let r=_e.SEPARATOR_SPACING.WEEK;"month"===i&&(r=_e.SEPARATOR_SPACING.MONTH);const a=gn(n.day_spacing,r);return{borderTopWidth:e,borderTopColor:t,borderTopStyle:"solid",marginTop:a,marginBottom:a}}function hl(e,t,n,i,r=!1,a="day"){if(pn(e)||r)return U;const o=ul(e,t,i,a);return W`<div class="${n}" style=${yi(o)}></div>`}function ml(e){return hl(e.month_separator_width,e.month_separator_color,"month-separator",e,!1,"month")}function pl(e,t=!1){return hl(e.week_separator_width,e.week_separator_color,"week-separator",e,t,"week")}function _l(e,t,n,i,r,a=!1){return W`
    ${e.map((o,s)=>{const l=s>0?e[s-1]:void 0,d=o.weekNumber??null;let c=!1;c=!l||o.weekNumber!==l.weekNumber;const u=l&&o.monthNumber!==l.monthNumber,h=0===s,m={isNewWeek:c,isNewMonth:Boolean(u)};let p=U;return!u||pn(t.month_separator_width)||c&&null!==t.show_week_numbers?c&&(p=h&&null!==t.show_week_numbers&&!t.show_current_week_number?u?ml(t):pl(t,h):null!==t.show_week_numbers?function(e,t,n,i=!1){if(null===e)return U;const r=t?_e.SEPARATOR_SPACING.MONTH:_e.SEPARATOR_SPACING.WEEK,a={marginTop:i?"0px":gn(n.day_spacing,r/2-1),marginBottom:gn(n.day_spacing,r/2)},o={};return i?o["--separator-display"]="none":t&&!pn(n.month_separator_width)?(o["--separator-border-width"]=n.month_separator_width,o["--separator-border-color"]=n.month_separator_color,o["--separator-display"]="block"):pn(n.week_separator_width)?o["--separator-display"]="none":(o["--separator-border-width"]=n.week_separator_width,o["--separator-border-color"]=n.week_separator_color,o["--separator-display"]="block"),W`
    <table class="week-row-table" style=${yi(a)}>
      <tr>
        <td class="week-number-cell">
          <div class="week-number">${e}</div>
        </td>
        <td class="separator-cell" style=${yi(o)}>
          <div class="separator-line"></div>
        </td>
      </tr>
    </table>
  `}(d,Boolean(u),t,h):pl(t,h)):p=ml(t),W`
        ${p}
        ${function(e,t,n,i,r,a,o,s=!1){const{isToday:l,isTomorrow:d}=za(e.timestamp),c=aa(new Date(e.timestamp),o);let u=U;const h=r?.isNewMonth||!1,m=r?.isNewWeek||!1,p=h&&!pn(t.month_separator_width),_=m&&(null!==t.show_week_numbers||!pn(t.week_separator_width)),g=s?ui(e.timestamp):void 0,f=_n(t),v=t.day_separator_width,y=t.day_separator_color;if(i&&!pn(v)&&!p&&!_){const e=ul(v,y,t,"day");u=W`<div class="separator" style=${yi(e)}></div>`}return W`
    ${u}
    <table
      class=${Hi({"day-table":!0,today:l,tomorrow:d,"future-day":!l,weekend:c,"with-event-gap":f})}
    >
      ${qi(e.events,(e,t)=>`${e._entityId}-${e.summary}-${t}`,(i,r)=>{const d=function(e,t,n,i,r,a,o,s,l=!1,d){const c=As(e,i,r,s),u=ci(e,c.entityAccentColor,l),h=new Date(t.timestamp),m=aa(h,s),p=0===n,_=n===t.events.length-1,g=!p&&!_,f=_n(i)?2*t.events.length-1:t.events.length,v={event:!0,"event-first":p,"event-middle":g,"event-last":_,"past-event":c.isPastEvent,"event-tappable":void 0!==u,"event-now":c.isNow};return W`
    <tr>
      ${0===n?W`
            <td
              class="date-column ${m?"weekend":""}"
              rowspan="${f}"
              style="position: relative;"
              id=${d??U}
            >
              ${function(e,t,n,i,r,a){return Ia(e,t,n,i,Ha(e,t,r),a)}(h,i,r,a,o,s)}
              ${Ka(i,a)}
            </td>
          `:""}
      <td
        class=${Hi(v)}
        style="--calendar-card-event-accent-bar-color: ${c.entityAccentColor}; background-color: ${c.entityAccentBackgroundColor};${we(c.accentTextProperties)}"
      >
        ${Ga()}
        ${function(e,t,n){return t?W`<div
    class="event-button event-interactive"
    role="button"
    tabindex="0"
    aria-describedby=${n??U}
    .calendarCardEventTap=${t}
  >
    ${e}
  </div>`:e}(Va(e,i,c.contentParts,{weatherForecasts:o}),u,d)}
      </td>
    </tr>
  `}(i,e,r,t,n,l,a,o,s,g);return f&&r>0?W`${W`<tr class="event-gap-row" aria-hidden="true">
    <td class="event-gap-cell"></td>
  </tr>`}${d}`:d})}
    </table>
  `}(o,t,n,l,m,i,r,a)}
      `})}
  `}function gl(e,t){return e>0?String(Math.min(e,t)):"none"}function fl(e){return e.accent_color&&!Ot(e.accent_color)?e.accent_color:String(Ve.accent_color)}const vl=a`
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
`,yl=a`
  :host {
    display: block;
    height: 100%;
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
  }
  ha-card.card-interactive {
    cursor: pointer;
  }
  ha-card:focus {
    outline: none;
  }
  ha-card:focus-visible {
    outline: 2px solid var(--calendar-card-line-color-vertical);
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
    margin: 0 0 16px 8px;
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
    color: var(--primary-text-color);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
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
  }
  .legend-menu {
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
    color: var(--primary-text-color);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.24);
    font-family: inherit;
    font-size: var(--ha-font-size-m, 14px);
    font-weight: var(--ha-font-weight-normal, 400);
    line-height: 1.4;
  }
  .legend-menu::backdrop {
    background: transparent;
  }
  .legend-menu-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .legend-menu-row {
    display: flex;
    align-items: center;
    gap: 10px;
    box-sizing: border-box;
    min-height: 40px;
    padding: 4px 12px 4px 10px;
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
  .legend-menu-label {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  @media (hover: hover) {
    .toolbar-button:hover,
    .view-switcher-segment:not(.selected):not(.unavailable):hover,
    .date-navigation-segment:hover,
    .toolbar-month-button:hover {
      background: var(--calendar-card-toolbar-fill-hover);
    }
  }
  .toolbar-button:active,
  .view-switcher-segment:not(.selected):not(.unavailable):active,
  .date-navigation-segment:active,
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
  ha-card:has(.card-toolbar:hover):not(:has(.toolbar-identity > .card-header:hover)) > ha-ripple {
    --ha-ripple-hover-opacity: 0;
  }
  .toolbar-button:focus,
  .view-switcher-segment:focus,
  .date-navigation-segment:focus,
  .toolbar-month-button:focus,
  .legend-chip:focus,
  .legend-menu:focus {
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
  .legend-menu-row:has(.legend-menu-check:focus-visible) {
    outline: 2px solid var(--primary-color);
    outline-offset: -2px;
  }
  .week-row-table {
    width: 100%;
    table-layout: fixed;
    padding-left: 8px;
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
    padding-right: 12px;
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
    margin-left: 8px;
  }
  .week-separator {
    width: 100%;
    margin-left: 8px;
    border-top-style: solid;
  }
  .month-separator {
    width: 100%;
    margin-left: 8px;
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
    padding-left: 8px;
    padding-right: 12px;
  }
  .today-indicator-container:not(.inline) {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
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
  @supports (color: color-mix(in oklch, red, blue)) {
    .day.today-tile {
      background: color-mix(
        in oklch,
        var(--calendar-card-today-indicator-color) 25%,
        var(--calendar-card-background-color, var(--card-background-color))
      );
      --calendar-card-today-indicator-ink: color-mix(
        in oklch,
        var(--calendar-card-today-indicator-color) 45%,
        var(--primary-text-color)
      );
    }
  }
  @supports (color: oklch(from red l c h)) {
    .day.today-tile {
      background: oklch(
        from
          color-mix(
            in oklch,
            var(--calendar-card-today-indicator-color) 25%,
            var(--calendar-card-background-color, var(--card-background-color))
          )
          l calc(c * 1.8) h
      );
      --calendar-card-today-indicator-ink: oklch(
        from
          color-mix(
            in oklch,
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
    margin-right: 1px;
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
    margin-left: 2px;
  }
  .event-weather .weather-uv-index {
    font-weight: 500;
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
  @supports (color: color-mix(in oklch, red, blue)) {
    .event {
      --calendar-card-accent-ink: color-mix(
        in oklch,
        var(--calendar-card-accent-ink-source) 45%,
        var(--primary-text-color)
      );
    }
  }
  @supports (color: oklch(from red l c h)) {
    .event {
      --calendar-card-accent-ink: oklch(
        from
          color-mix(in oklch, var(--calendar-card-accent-ink-source) 45%, var(--primary-text-color))
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
  @supports (color: color-mix(in oklch, red, blue)) {
    .event-now {
      --calendar-card-now-ink: color-mix(
        in oklch,
        var(--calendar-card-now-color, #34d399) 45%,
        var(--primary-text-color)
      );
    }
  }
  @supports (color: oklch(from red l c h)) {
    .event-now {
      --calendar-card-now-ink: oklch(
        from
          color-mix(
            in oklch,
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
  .grid-banner.past-event .grid-banner-title {
    opacity: var(--calendar-card-past-event-opacity, 0.6);
  }
  .event-content {
    display: flex;
    flex-direction: column;
  }
  td.event > .event-content:has(> .time-location > *),
  .column-events > .event > .event-content:has(> .time-location > *) {
    --calendar-card-event-ink-shift: 0.13em;
  }
  td.event > .event-content:has(> .time-location > *) > .summary-row > .summary,
  .column-events > .event > .event-content:has(> .time-location > *) > .summary-row > .summary {
    padding-top: calc(0.2em - var(--calendar-card-event-ink-shift));
  }
  td.event > .event-content:has(> .time-location > *)::after,
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
    padding-block: 0.2em;
    -webkit-line-clamp: var(--calendar-card-title-max-lines);
  }
  .summary:not(:only-child) {
    margin-inline-end: 12px;
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
  }
  .summary:not(.summary-scroll):has(> .event-title:not(:only-child)) {
    display: var(--calendar-card-title-display);
    -webkit-box-orient: vertical;
  }
  .summary:not(.summary-scroll):has(> .event-title:not(:only-child)) > .event-title {
    display: inline;
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
    padding-inline-start: calc(1em + 4px);
  }
  .summary:has(> .label-emoji) {
    text-indent: calc(-1 * (1.25em + 4px));
    padding-inline-start: calc(1.25em + 4px);
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
    padding-inline-start: 0;
  }
  .summary-scroll > .event-title.title-scrollable {
    flex: 1 1 auto;
    min-width: 0;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
    margin-right: 4px;
  }
  .calendar-label::after {
    content: '\\200B';
  }
  .label-icon {
    --mdc-icon-size: 1em;
    vertical-align: middle;
    margin-right: 4px;
  }
  .label-image {
    height: 1em;
    width: auto;
    vertical-align: middle;
    margin-right: 4px;
  }
  .event-weather {
    display: flex;
    align-items: center;
    font-weight: 500;
    margin-left: 8px;
    margin-right: 12px;
  }
  .event-weather ha-icon {
    margin-right: 2px;
    --mdc-icon-size: var(--calendar-card-weather-event-icon-size, 14px);
    color: var(--calendar-card-weather-event-color, var(--secondary-text-color));
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
  }
  .time .time-actual .time-text > .time-countdown {
    display: inline;
    -webkit-line-clamp: none;
    overflow: visible;
    margin-inline-start: 4px;
    margin-inline-end: 0;
    white-space: normal;
  }
  .time .time-actual .time-text > .time-countdown::before {
    content: '\\2060·\\200B';
    margin-inline-end: 4px;
  }
  .time .time-actual .allday-badge + .time-text > .time-countdown {
    margin-inline-start: 0;
  }
  .time-countdown {
    text-align: right;
    color: var(--calendar-card-color-time);
    margin-inline-start: auto;
    margin-inline-end: 12px;
    white-space: nowrap;
  }
  .location {
    font-size: var(--calendar-card-font-size-location);
    color: var(--calendar-card-color-location);
  }
  .description {
    font-size: var(--calendar-card-font-size-description);
    color: var(--calendar-card-color-description);
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
  @supports (color: color-mix(in oklch, red, blue)) {
    .allday-badge,
    .allday-title-pill {
      --badge-ink: color-mix(
        in oklch,
        var(--calendar-card-event-accent) 45%,
        var(--primary-text-color)
      );
      --badge-wash: color-mix(
        in oklch,
        var(--calendar-card-event-accent) 14%,
        var(--calendar-card-background-color, var(--card-background-color))
      );
    }
  }
  @supports (color: oklch(from red l c h)) {
    .allday-badge,
    .allday-title-pill {
      --badge-ink: oklch(
        from color-mix(in oklch, var(--calendar-card-event-accent) 45%, var(--primary-text-color)) l
          calc(c * 2.2) h
      );
      --badge-wash: oklch(
        from
          color-mix(
            in oklch,
            var(--calendar-card-event-accent) 14%,
            var(--calendar-card-background-color, var(--card-background-color))
          )
          l calc(c * 1.8) h
      );
    }
  }
  @supports (color: oklch(from red l c h)) {
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
  }
  .time-location .event-weather .event-weather-text > span + span::before {
    content: '\\2060·\\200B';
    margin-inline-start: 4px;
    margin-inline-end: 4px;
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
    border-radius: 999px 0 0 999px;
  }
  ha-icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    position: relative;
    vertical-align: top;
    top: 0;
    margin-right: 4px;
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
  ha-card:has(.event-interactive:hover, .event-interactive:active, .event-interactive:focus-visible)
    > ha-ripple {
    --ha-ripple-hover-opacity: 0;
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
  .event-button.event-interactive:focus-visible {
    outline: none;
  }
  .event-button:focus-visible::after {
    outline: 2px solid var(--calendar-card-line-color-vertical);
    outline-offset: -2px;
  }
  .loading-indicator {
    position: absolute;
    top: calc(3.5px + max(0px, (var(--ha-card-border-radius, 12px) - 12px) * 0.15));
    right: calc(3.5px + max(0px, (var(--ha-card-border-radius, 12px) - 12px) * 0.15));
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
  .loading-indicator-icon {
    width: 16px;
    height: 16px;
  }
  @keyframes ccp-spin {
    to {
      transform: rotate(360deg);
    }
  }
  .calendar-card-pro.column-view {
    padding-inline: 16px;
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
  }
  .column-date-content .weekday {
    grid-area: weekday;
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
  }
  .column-events .time-countdown::before {
    content: '·';
    margin-inline-end: 4px;
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
    background-image: ${vl};
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
  }
  .grid-banner.continues-before .grid-banner-title::before {
    content: '\\25C2\\00A0';
  }
  .grid-banner.continues-after .grid-banner-title::after {
    content: '\\00A0\\25B8';
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
  }
  .grid-event-disclosure .summary {
    min-height: 0;
    padding-block: 0;
    padding-inline-start: 0;
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
    overflow-wrap: break-word;
    word-break: normal;
    hyphens: manual;
  }
  .grid-event-disclosure .title-word {
    display: inline-block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: top;
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
  }
  .grid-event-disclosure .summary:not(.summary-scroll):has(> .event-title:not(:only-child)) {
    display: -webkit-box;
    -webkit-box-orient: vertical;
  }
  .grid-event-disclosure
    .summary:not(.summary-scroll):has(> .event-title:not(:only-child))
    > .event-title {
    display: inline;
  }
  .grid-event-disclosure .summary:dir(ltr) > .event-title {
    text-align: left;
  }
  .grid-event-disclosure .summary:dir(rtl) > .event-title {
    text-align: right;
  }
  .grid-event-disclosure .calendar-label,
  .grid-event-disclosure .label-icon,
  .grid-event-disclosure .label-image {
    margin-right: 0;
    margin-inline-end: 4px;
    unicode-bidi: isolate;
  }
  .grid-event-disclosure .time-location,
  .grid-event-disclosure .time,
  .grid-event-disclosure .location,
  .grid-event-disclosure .description,
  .grid-event-disclosure .event-weather {
    flex: 0 0 auto;
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
  }
  .grid-event-disclosure {
    --calendar-card-time-display: inline;
    --calendar-card-time-max-lines: none;
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
  .grid-event-disclosure.grid-time-no-icon .time .time-actual > ha-icon {
    display: none;
  }
  .grid-event-disclosure.grid-time-no-end .time .time-actual .time-end {
    display: none;
  }
  .grid-event-disclosure.grid-time-wrap .time .time-actual .time-end {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
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
    padding: 0;
    text-overflow: ellipsis;
    -webkit-line-clamp: unset;
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
  }
  .grid-event:is(
      [data-grid-title-fit='measuring'],
      [data-grid-title-fit='compact'],
      [data-grid-title-fit='blank']
    )
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
  .grid-event-backdrop-rules {
    background-image: ${vl};
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
    .grid-day-plane-now > .grid-event-now {
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
`,wl={time:!1,icon:!1,end:!1,wrap:!1},bl=["grid-time-fits","grid-time-no-icon","grid-time-no-end","grid-time-wrap"];function Ml(e){const t=e.querySelector(".grid-event-disclosure"),n=t?.querySelector(".time");return t&&n?{disclosure:t,time:n,icon:n.querySelector(".time-actual > ha-icon"),end:n.querySelector(".time-end")}:null}function kl(e){e.disclosure.classList.remove(...bl),e.time.style.display="block"}function xl(e){return e.time.clientWidth}function $l(e){e.time.style.width="max-content"}function Dl(e){e.disclosure.classList.add("grid-time-no-icon","grid-time-wrap")}function Sl(e){return e.end?e.time.getBoundingClientRect().width:0}function Tl(e){e.disclosure.classList.remove("grid-time-no-icon","grid-time-wrap")}function Ll(e){const t=e.ownerDocument.defaultView?.getComputedStyle(e),n=t?(Number.parseFloat(t.marginLeft)||0)+(Number.parseFloat(t.marginRight)||0):0;return e.getBoundingClientRect().width+n}function Yl(e){e.disclosure.classList.remove("grid-time-wrap"),e.disclosure.classList.add("grid-time-no-end")}const Cl=1/64,El=10,Al="--calendar-card-grid-title-label-run",Pl="--calendar-card-grid-title-cut-room",Hl="--calendar-card-grid-title-fit-lines",zl="data-grid-title-cut",Fl="data-grid-title-lines",jl=Intl.Segmenter,Ol=jl?new jl(void 0,{granularity:"grapheme"}):null,Il=new WeakMap;function Nl(e,t,n){if(![e,t,n].every(Number.isFinite)||e<=0||t<=0||n<=0)return null;if(t<=n)return e;const i=Math.min(e,El),r=e*n/t;return r<i?null:Math.max(i,e-Math.ceil(e-r))}function Rl(e,t,n){const i=Math.ceil(e-t-1e-7);return n?e-Math.max(0,i-1):Math.max(Math.min(e,El),e-i-1)}function Wl(e){const t=e.trim();if(!/[\p{L}\p{N}\p{S}]/u.test(t))return"";if(!Ol)return t;for(const{segment:e,index:n}of Ol.segment(t))if(/[\p{L}\p{N}\p{S}]/u.test(e))return t.slice(0,n+e.length);return""}function Bl(e,t,n,i){return[e,t,n,i].every(Number.isFinite)&&e>0&&n>0&&(t<=e||n+i<=e)}function ql(e){delete e.block.dataset.gridTitleFit,e.summary.style.removeProperty("--calendar-card-grid-title-scale"),e.summary.style.removeProperty(Al),e.summary.style.removeProperty(Hl),e.summary.removeAttribute(Fl),e.row.style.removeProperty("--calendar-card-grid-title-shift");for(const t of Array.from(e.summary.querySelectorAll(`[${zl}]`)))t.removeAttribute(zl),t.style.removeProperty(Pl)}function Ul(e){const t=e.querySelector(".grid-event-disclosure"),n=t?.querySelector(".summary"),i=t?.querySelector(".summary-row"),r=n?.querySelector(".event-title");return t&&n&&i&&r?{block:e,disclosure:t,summary:n,row:i,title:r,previousMode:e.dataset.gridTitleFit}:null}function Vl(e){let t=Il.get(e);return t||(t=e.createRange(),Il.set(e,t)),t}function Gl(e,t){e.setStart(t,0),e.collapse(!0)}function Kl(e){for(let t=e.parentElement;t;t=t.parentElement){const e=getComputedStyle(t).display;if("inline"!==e&&"contents"!==e)return t}return null}function Jl(e,t){if(!t)return e;const n=(e.top+e.bottom)/2;if(n<t.top||n>t.bottom)return e;const i=Math.max(e.top,t.top),r=Math.min(e.bottom,t.bottom);return i===e.top&&r===e.bottom?e:new DOMRect(e.left,i,e.width,r-i)}function Zl(e){const t=e.ownerDocument,n=t.createTreeWalker(e,NodeFilter.SHOW_TEXT),i=[],r=Vl(t);try{for(let e=n.nextNode();e;e=n.nextNode()){const t=e.textContent??"",n=t.search(/\S/u);if(n<0)continue;r.setStart(e,n),r.setEnd(e,t.trimEnd().length);const a=Kl(e)?.getBoundingClientRect();i.push({node:e,start:n,text:t.slice(n).trimEnd(),rects:Array.from(r.getClientRects(),e=>Jl(e,a))})}return i}finally{Gl(r,t)}}function Xl(e){const t=e[0],n=function(e){if(!Ol){const t=e.length-1;return e.some(e=>""!==Wl(e))?{run:t,length:e[t].length}:null}for(const[t,n]of e.entries()){const e=Wl(n);if(e)return{run:t,length:e.length}}return null}(e.map(e=>e.text)),i=t?.node.ownerDocument;if(!t||!n||!i)return 0;const r=e[n.run],a=Vl(i);try{return a.setStart(t.node,t.start),a.setEnd(r.node,r.start+n.length),a.getBoundingClientRect().width}finally{Gl(a,i)}}function Ql(e){const t=e[0],n=e[e.length-1],i=t?.node.ownerDocument;if(e.length<=1||!i)return e.flatMap(e=>e.rects).reduce((e,t)=>e+t.width,0);const r=Vl(i);try{return r.setStart(t.node,t.start),r.setEnd(n.node,n.start+n.text.length),r.getBoundingClientRect().width}finally{Gl(r,i)}}function ed(e){return Array.from(e.summary.children).flatMap(t=>t===e.title?[]:t.matches(".calendar-label")?Zl(t).flatMap(e=>e.rects):Array.from(t.getClientRects()))}function td(e){return{top:Math.min(...e.map(e=>e.top)),bottom:Math.max(...e.map(e=>e.bottom))}}function nd(e,t){return e.top>=t.top-Cl&&e.bottom<=t.bottom+Cl}function id(e){return Number.parseFloat(e)||0}function rd(e){return"1"===getComputedStyle(e.row).getPropertyValue("--calendar-card-grid-title-eligible").trim()}function ad(e){return Array.from(e.querySelectorAll("img")).every(e=>e.complete&&e.naturalWidth>0)}function od(e){const t=Array.from(e).flatMap(e=>{const t=e.parentElement,n=e.closest(".grid-event")?.dataset.gridTitleFit;if(!t?.matches(".summary-scroll")||"compact"===n||"blank"===n||"measuring"===n)return[];const i=Array.from(t.children).filter(t=>t!==e);return i.some(e=>e.matches(".calendar-label:not(.label-emoji)"))?[{title:e,summary:t,labels:i,reserved:t.hasAttribute("data-scroll-labels")}]:(t.removeAttribute("data-scroll-labels"),[])});if(!t.length)return;const n=t[0].title.ownerDocument.createElement("canvas").getContext("2d"),i=new Set;let r=!1;for(const{summary:e}of t)e.setAttribute("data-scroll-labels","");try{for(const{title:e,summary:r,labels:a}of t){const t=getComputedStyle(r),o=id(t.width)+("border-box"===t.boxSizing?0:id(t.paddingLeft)+id(t.paddingRight)+id(t.borderLeftWidth)+id(t.borderRightWidth)),s=r.getBoundingClientRect(),l=o>0?s.width/o:0,d=s.left+(id(t.borderLeftWidth)+id(t.paddingLeft))*l,c=s.right-(id(t.borderRightWidth)+id(t.paddingRight))*l,u=e.getBoundingClientRect(),h=getComputedStyle(e),m=Zl(e),p=m[0],_=getComputedStyle(p?.node.parentElement??e);n&&(n.font=_.font||`${_.fontSize} ${_.fontFamily}`);const g=n?(n.measureText("…").width+id(_.letterSpacing))*l:1/0,f=(id(h.paddingLeft)+id(h.paddingRight)+id(h.borderLeftWidth)+id(h.borderRightWidth))*l,v=a.every(e=>{const t=e.getBoundingClientRect();return t.width>0&&t.left>=d-Cl&&t.right<=c+Cl});l>0&&v&&ad(r)&&Bl(u.width-f,Ql(m),Xl(m),g)&&i.add(r)}r=!0}finally{for(const e of t)e.summary.toggleAttribute("data-scroll-labels",r?i.has(e.summary):e.reserved)}}function sd(e){const t=id(getComputedStyle(e).height);return t>0?e.getBoundingClientRect().height/t:1}function ld(e){const t=getComputedStyle(e.block),n=e.block.getBoundingClientRect(),i=sd(e.block),r={top:n.top+(id(t.borderTopWidth)+id(t.paddingTop))*i,bottom:n.bottom-(id(t.borderBottomWidth)+id(t.paddingBottom))*i};if(e.block.classList.contains("grid-event-content-limited")){const t=e.disclosure.getBoundingClientRect();return{top:Math.max(r.top,t.top),bottom:Math.min(r.bottom,t.bottom)}}return r}function dd(e){const t=ld(e),n=e.row.getBoundingClientRect(),i=e.summary.getBoundingClientRect();return{summary:i,visible:{top:Math.max(t.top,n.top,i.top),bottom:Math.min(t.bottom,n.bottom,i.bottom)}}}function cd(e){if(!rd(e)||!ad(e.summary))return!1;const t=Zl(e.title),n=t[0]?.rects[0];if(!n||n.height<=0)return!1;const{visible:i,summary:r}=dd(e),a=ed(e);return nd(n,i)&&a.every(e=>nd(e,i)&&e.left>=r.left-Cl&&e.right<=r.right+Cl)}function ud(e){const t=getComputedStyle(e);return"border-box"===t.boxSizing?id(t.width)-id(t.paddingLeft)-id(t.paddingRight)-id(t.borderLeftWidth)-id(t.borderRightWidth):id(t.width)}function hd(e,t){if(!e)return 1/0;const n=getComputedStyle(t);return e.font=n.font||`${n.fontSize} ${n.fontFamily}`,e.measureText("…").width+id(n.letterSpacing)}function md(e){return(e.top+e.bottom)/2}function pd(e){return"word"===e.kind?e.node.matches(".title-words > .title-word"):!!e.node.parentElement?.matches(".title-words > .title-run")}function _d(e){const t=ld(e),n=e.row.getBoundingClientRect(),i=Zl(e.summary).flatMap(e=>e.rects),r=td([n,...i.filter(e=>nd(e,n)),...ed(e)]);if(!nd(r,t))return null;const a=(t.top+t.bottom-r.top-r.bottom)/2,o=Math.max(0,...i.map(e=>e.height));return Math.abs(a)>o+Cl?null:a/sd(e.block)}function gd(e,t){const n=sd(e.block),i=Zl(e.title),r=getComputedStyle(i[0]?.node.parentElement??e.title),a=e.title.getBoundingClientRect(),o=e.row.getBoundingClientRect(),s=e.summary.getBoundingClientRect(),l=e.disclosure.getBoundingClientRect(),d=i.flatMap(e=>e.rects),c=ed(e),u=td([o,...d,...c]),h=id(getComputedStyle(e.summary).zoom)||1;t&&(t.font=r.font||`${r.fontSize} ${r.fontFamily}`);const m=t?(t.measureText("…").width+id(r.letterSpacing))*n*h:1/0,p=Ql(i),_=Xl(i),g=c.every(e=>e.left>=s.left-Cl&&e.right<=s.right+Cl&&e.width>0);return{target:e,font:id(r.fontSize),textFonts:[id(r.fontSize),...Array.from(e.summary.querySelectorAll(".calendar-label")).flatMap(e=>Zl(e).map(t=>id(getComputedStyle(t.node.parentElement??e).fontSize)))],height:(u.bottom-u.top)/n,available:l.height/n,shift:(l.top+l.bottom-u.top-u.bottom)/(2*n),textFits:d.every(e=>nd(e,a)),readable:g&&ad(e.summary)&&Bl(a.width,p,_,m)}}function fd(e){return e.textFits&&e.height<=e.available+Cl}function vd(e){return new Date(e.getFullYear(),e.getMonth(),e.getDate())}function yd(e,t){return new Date(e.getFullYear(),e.getMonth(),e.getDate()+t)}function wd(e){return ea(e)}function bd(e){return Qr(e)}function Md(e,t){const n=Math.max(1,Math.floor(e)||1);return t>0&&t<n?t:n}function kd(e,t){const n=oa(e.start,vd(t));return n>=0&&n<e.days}function xd(e){try{return Intl.DateTimeFormat.supportedLocalesOf([e]).length>0?e:"en"}catch{return"en"}}const $d=new Map;function Dd(e,t,n){const i=`${e}|${t?"y":""}|${n?"w":""}`;let r=$d.get(i);return r||(r=new Intl.DateTimeFormat(xd(e),{...n?{weekday:"short"}:{},month:"short",day:"numeric",...t?{year:"numeric"}:{}}),$d.set(i,r)),r}function Sd(e,t,n){const i=vd(e.start),r=yd(i,Math.max(1,e.days)-1),a=n.getFullYear();if(e.days<=1)return Dd(t,i.getFullYear()!==a,!0).format(i);if(i.getFullYear()===r.getFullYear()){const e=Dd(t,i.getFullYear()!==a,!1),n=Ld(Dd(t,!1,!1));return"function"==typeof e.formatRange?e.formatRange(i,r):`${e.format(i)}${n}${e.format(r)}`}const o=r.getFullYear()!==function(e){const t=e.getFullYear();return e.getTime()-new Date(t,0,1).getTime()<=new Date(t+1,0,1).getTime()-e.getTime()?t:t+1}(n),s=Dd(t,!1,!1),l=Dd(t,o,!1);return`${s.format(i)}${Ld(s)}${l.format(r)}`}const Td=new WeakMap;function Ld(e){let t=Td.get(e);if(void 0===t){const n="function"==typeof e.formatRangeToParts?e.formatRangeToParts(new Date(2e3,0,31),new Date(2e3,1,1)):[],i=n.map(e=>e.source).lastIndexOf("startRange"),r=n.findIndex(e=>"endRange"===e.source),a=n.map(e=>e.source).lastIndexOf("endRange"),o=(e,t)=>n.slice(e,t).map(e=>e.value).join(""),s=i>=0&&r>i?o(i+1,r):"",l=a>=0?o(a+1,n.length):"";t=(l&&s.startsWith(l)?s.slice(l.length):s)||" – ",Td.set(e,t)}return t}const Yd=/^\p{L}+/u;function Cd(e,t,n="long"){const i=function(e,t){const n=`${e}|month|${t}`;let i=$d.get(n);return i||(i=new Intl.DateTimeFormat(xd(e),{month:t,year:"numeric"}),$d.set(n,i)),i}(t,n),r=i.formatToParts(e);let a=i.format(e);if("month"===r[0]?.type){const e=i.resolvedOptions().locale;a=a.charAt(0).toLocaleUpperCase(e)+a.slice(1)}if(r.reduce((e,t)=>e+t.value.length,0)!==a.length)return[{text:a,month:!1}];const o=[],s=(e,t)=>{if(!e)return;const n=o[o.length-1];n&&n.month===t?n.text+=e:o.push({text:e,month:t})};let l=0;return r.forEach((e,t)=>{let n=a.slice(l,l+e.value.length);l+=e.value.length;const i=r[t-1];if("literal"===e.type&&"month"===i?.type&&/^\d+$/.test(i.value)){const e=Yd.exec(n)?.[0]??"";s(e,!0),n=n.slice(e.length)}s(n,"month"===e.type)}),o}const Ed=new Map;function Ad(e,t="long"){const n=`${e}|${t}`;let i=Ed.get(n);return i||(i=Array.from({length:12},(n,i)=>Cd(new Date(2e3,i,1),e,t)),Ed.set(n,i)),i}const Pd=new Map;function Hd(e,t,n){return kd(e,n)?function(e){let t=Pd.get(e);if(void 0===t){const n=xd(e),i=new Intl.RelativeTimeFormat(n,{numeric:"auto"}).format(0,"day");t=i.charAt(0).toLocaleUpperCase(n)+i.slice(1),Pd.set(e,t)}return t}(t):Sd({start:e.start,days:1},t,n)}let zd=!0;function Fd(e){return"string"==typeof e&&(e.includes("{{")||e.includes("{%"))}class jd{constructor(e){this.callbacks=e,this._hasConnected=!1,this._version=0}update(e,t){const n=Fd(t)?t:void 0,i=e?.connection,r=!this._hasConnected&&Boolean(i);i&&(this._hasConnected=!0),n===this._template&&i===this._connection||(this._template=n,this._connection=i,this._version++,this._clearPending(),this._teardown(),n&&e&&(r?this._subscribe(e,n,this._version):this._debounceId=setTimeout(()=>{this._debounceId=void 0,this._subscribe(e,n,this._version)},300)))}destroy(){this._version++,this._template=void 0,this._connection=void 0,this._hasConnected=!1,this._clearPending(),this._teardown()}async _subscribe(e,t,n){const i=await async function(e,t,n){const i=e?.connection;if(!i||!t)return;const r=e=>{if(e&&"error"in e)return"WARNING"===e.level?void Be("Template warning",{template:t,error:e.error}):(Ie("Template render error",{template:t,error:e.error}),void n.onError(e.error));var i;e&&"result"in e&&n.onResult(null==(i=e.result)?"":"string"==typeof i?i:String(i))},a=e=>i.subscribeMessage(r,{type:"render_template",template:t,...e?{report_errors:!0}:{}});try{return await a(zd)}catch(e){if(zd&&function(e){return"invalid_format"===e?.code}(e)){zd=!1,Ne("Home Assistant rejected the render_template `report_errors` option; falling back to basic template rendering (requires 2023.9+ for error reporting)");try{return await a(!1)}catch(e){return void Ie("Failed to subscribe to template",{template:t,error:e})}}const i=e?.message;return Ie("Failed to subscribe to template",{template:t,error:e}),void n.onError(i??String(e))}}(e,t,{onResult:e=>{n===this._version&&this.callbacks.onResult(e)},onError:e=>{n===this._version&&this.callbacks.onError(e)}});i&&(n===this._version?this._unsubscribe=i:i())}_clearPending(){this._debounceId&&(clearTimeout(this._debounceId),this._debounceId=void 0)}_teardown(){if(this._unsubscribe){try{this._unsubscribe()}catch(e){Ne("Failed to unsubscribe from template",e)}this._unsubscribe=void 0}}}function Od(e){if(!Number.isFinite(e)||e<0)throw new RangeError("Title overflow must be a finite, nonnegative distance.");const t=Math.max(2.8,e/45),n=Math.min(.6,Math.max(.2,e/360));return{start:.6,forward:t,end:.6,back:n,total:.6+t+.6+n}}function Id(e,t){const{start:n,forward:i,end:r,total:a}=Od(e);if(!Number.isFinite(t)||t<a)throw new RangeError("The title cohort period must contain every complete title trip.");const o=e=>`${(e/t*100).toFixed(10)}%`;return`linear(0 0%, 0 ${o(n)}, 1 ${o(n+i)}, 1 ${o(n+i+r)}, 0 ${o(a)}, 0 100%)`}function Nd(e,t){return e.distance===t.distance&&e.direction===t.direction&&e.signature===t.signature}function Rd(e){let t=0;for(const n of e.values())t=Math.max(t,Od(n.distance).total);return t}class Wd{constructor(){this._members=new Map,this._desired=new Map,this._period=0,this._pending=!1}get members(){return this._members}get period(){return this._period}get pending(){return this._pending}get empty(){return 0===this._desired.size}update(e){this._desired=new Map(e);const t=[];for(const[n,i]of this._members){const r=e.get(n);r&&Nd(i,r)||(this._members.delete(n),t.push(n))}return this._pending=this._members.size!==e.size||Rd(e)!==this._period,t}retire(e){this._members.delete(e)}commit(){this._members=new Map(this._desired),this._period=Rd(this._members),this._pending=!1}clear(){this._members.clear(),this._desired.clear(),this._period=0,this._pending=!1}}const Bd="data-title-motion",qd="--calendar-card-title-cohort-period",Ud="--calendar-card-title-cohort-curve",Vd="calendar-card-title-scroll-paused",Gd=["calendar-card-title-cohort-a","calendar-card-title-cohort-b"];class Kd{constructor(e,t){this.host=e,this.remeasure=t,this.targets=new Map,this.active=new Map,this.cohort=new Wd,this.motion=matchMedia("(prefers-reduced-motion: reduce)"),this.hostVisible=!1,this.hostHasBox=!0,this.frame=null,this.generation=0,this.nameIndex=0,this.disposed=!1,this.fallback=!1,this.motionChanged=()=>{this.fallback||this.reset(),this.refresh(),this.motion.matches||this.remeasure()},this.visibilityChanged=()=>{this.refresh()},this.intersections=new IntersectionObserver(t=>{const n=t.find(t=>t.target===e);n&&(this.hostHasBox=n.boundingClientRect.width>0&&n.boundingClientRect.height>0,this.hostVisible=this.visible(n));for(const e of t){const t=this.targets.get(e.target);t&&(t.visible=this.visible(e))}this.refresh()}),this.intersections.observe(e),this.motion.addEventListener("change",this.motionChanged),e.ownerDocument.addEventListener("visibilitychange",this.visibilityChanged)}get enhanced(){return!this.fallback}visible(e){return e.isIntersecting&&e.intersectionRect.width>0&&e.intersectionRect.height>0}get paused(){if(!this.hostVisible||this.host.ownerDocument.hidden)return!0;for(const e of this.targets.values())if(e.visible)return!1;return!0}sync(e){const t=new Set(e);for(const e of this.targets.keys())t.has(e)||(this.intersections.unobserve(e),this.targets.delete(e),this.clearTitle(e));for(const e of t)this.targets.has(e)||(this.targets.set(e,{visible:!1}),this.fallback||e.setAttribute(Bd,"pending"),this.intersections.observe(e));this.refresh()}measure(e){for(const t of e){const e=this.targets.get(t.title);e&&(e.measurement=t)}this.refresh()}refresh(){if(this.disposed)return;if(this.host.classList.toggle(Vd,this.paused),this.fallback)return;if(this.motion.matches||!this.hostHasBox)return void this.reset();if(this.paused)return void this.cancelFrame();const e=new Map;for(const[t,{visible:n,measurement:i}]of this.targets){const r=t.closest(".grid-event")?.dataset.gridTitleFit;n&&i&&t.isConnected&&t.contains(i.content)&&t.classList.contains("title-scrollable")&&!t.classList.contains("empty-day-title")&&i.distance>1&&"compact"!==r&&"blank"!==r&&"measuring"!==r&&e.set(i.content,i)}const t=[...this.active].filter(([,{animation:e}])=>"idle"===e.playState).map(([e])=>e);for(const e of t)this.cohort.retire(e),this.withdraw(e);for(const t of this.cohort.update(e))this.withdraw(t);this.bindLeader(),this.cohort.empty?this.reset():0===this.cohort.members.size&&this.scheduleCommit()}withdraw(e){const t=this.active.get(e);t&&this.targets.has(t.title)&&t.title.setAttribute(Bd,"pending"),this.clearTiming(e),this.active.delete(e)}bindLeader(){const e=this.cohort.members.keys().next().value;if(e===this.leader)return;if(this.stopLeader?.(),this.stopLeader=void 0,this.leader=e,!e)return;const t=this.generation,n=Gd[this.nameIndex],i=i=>{t===this.generation&&i.target===e&&i.animationName===n&&this.cohort.pending&&!this.paused&&this.scheduleCommit()};e.addEventListener("animationiteration",i),this.stopLeader=()=>e.removeEventListener("animationiteration",i)}scheduleCommit(){null===this.frame&&(this.frame=requestAnimationFrame(()=>{if(this.frame=null,!(this.disposed||this.fallback||this.paused||this.motion.matches)&&(this.refresh(),this.cancelFrame(),this.cohort.pending&&!this.cohort.empty)){if(this.leader){const e=this.active.get(this.leader)?.animation.effect?.getComputedTiming();if("number"!=typeof e?.progress||!Number.isFinite(e.progress)||"number"!=typeof e.duration||!Number.isFinite(e.duration)||e.duration<=0)return void this.useFallback("Native title animation phase is unavailable.");if(e.progress*e.duration>600)return}this.commit()}}))}commit(){this.stopLeader?.(),this.stopLeader=void 0,this.leader=void 0,this.generation+=1,this.nameIndex=1-this.nameIndex,this.cohort.commit();const e=this.cohort.period,t=new Map;for(const[e,n]of this.targets)n.measurement&&t.set(n.measurement.content,e);for(const[n,i]of this.cohort.members){const r=t.get(n);n.style.setProperty(qd,`${e}s`),n.style.setProperty(Ud,Id(i.distance,e)),r.setAttribute(Bd,0===this.nameIndex?"a":"b")}const n=[...this.cohort.members.keys()].map(e=>({content:e,animation:e.getAnimations().find(e=>e instanceof CSSAnimation&&e.animationName===Gd[this.nameIndex])})),i=this.host.ownerDocument.timeline.currentTime;if("number"!=typeof i||n.some(({animation:e})=>!e))this.useFallback("Native title animation effects or document clock are unavailable.");else{try{for(const{animation:e}of n)e.startTime=i}catch(e){return void this.useFallback("Native title animation clocks could not be aligned.",e)}this.active.clear();for(const{content:e,animation:i}of n)this.active.set(e,{title:t.get(e),animation:i});this.bindLeader(),Be("Title motion cohort committed; native startTime aligned once per member",{generation:this.generation,members:n.length,periodSeconds:e,startTime:i})}}useFallback(e,t){Ne(`${e} Keeping independent legacy title scrolling.`,t),this.reset(),this.fallback=!0;for(const e of this.targets.keys())this.clearTitle(e)}cancelFrame(){null!==this.frame&&cancelAnimationFrame(this.frame),this.frame=null}reset(){this.cancelFrame(),this.stopLeader?.(),this.stopLeader=void 0,this.leader=void 0,this.generation+=1;for(const e of this.active.keys())this.clearTiming(e);this.active.clear(),this.cohort.clear();for(const e of this.targets.keys())e.setAttribute(Bd,"pending"),this.clearTiming(e.querySelector(".event-title-scroll"))}clearTiming(e){e?.style.removeProperty(qd),e?.style.removeProperty(Ud)}clearTitle(e){e.removeAttribute(Bd),this.clearTiming(e.querySelector(".event-title-scroll"))}dispose(){this.disposed=!0,this.reset(),this.intersections.disconnect(),this.motion.removeEventListener("change",this.motionChanged),this.host.ownerDocument.removeEventListener("visibilitychange",this.visibilityChanged);for(const e of this.targets.keys())this.clearTitle(e);this.targets.clear(),this.host.classList.remove(Vd)}}const Jd="calendar_card_pro_view_choice",Zd=["list","column","grid"];function Xd(e){return Array.isArray(e)?`[${e.map(e=>void 0===e?"null":Xd(e)).join(",")}]`:Ee(e)?`{${Object.keys(e).filter(t=>void 0!==e[t]).sort().map(t=>`${JSON.stringify(t)}:${Xd(e[t])}`).join(",")}}`:JSON.stringify(e)??"null"}function Qd(e){const t=Xd(e);return`${Le(t)}${t.length.toString(36)}`}function ec(){try{return"undefined"==typeof localStorage?null:localStorage}catch{return null}}function tc(e){return Zd.some(t=>t===e)}function nc(e){if(!Array.isArray(e))return;const t=[...new Set(e.filter(e=>"string"==typeof e&&""!==e))];return t.length>0?t:void 0}function ic(e){if(!e)return{};let t;try{const n=e.getItem(Jd);if(null===n)return{};t=JSON.parse(n)}catch{return{}}if(!Ee(t)||1!==t.version)return{};if(!Ee(t.choices))return{};const n={};for(const[e,i]of Object.entries(t.choices)){if(!Ee(i)||"number"!=typeof i.at)continue;const t=tc(i.view)?i.view:void 0,r=nc(i.hidden);void 0===t&&void 0===r||(n[e]={...void 0!==t?{view:t}:{},...void 0!==r?{hidden:r}:{},at:i.at})}return n}function rc(e,t){if(!e)return;const n=Object.entries(t).sort(([,e],[,t])=>t.at-e.at).slice(0,50);try{if(0===n.length)return void e.removeItem(Jd);const t={version:1,choices:Object.fromEntries(n)};e.setItem(Jd,JSON.stringify(t))}catch{}}function ac(e,t,n,i){const r=ic(n),a=r[e],o={...a,...t,at:i};if(void 0===o.view&&delete o.view,void 0!==o.hidden&&0!==o.hidden.length||delete o.hidden,void 0===o.view&&void 0===o.hidden){if(!a)return;delete r[e]}else r[e]=o;rc(n,r)}var oc=Object.defineProperty,sc=Object.getOwnPropertyDescriptor,lc=(e,t,n,i)=>{for(var r,a=i>1?void 0:i?sc(t,n):t,o=e.length-1;o>=0;o--)(r=e[o])&&(a=(i?r(t,n,a):r(a))||a);return i&&a&&oc(t,n,a),a};function dc(e,t){const n=e,i=n?.CalendarCardProEditor;if("function"!=typeof i)throw new Error("Calendar Card Pro: the editor file was found but is not the card’s editor. This usually means another file of the same name is installed alongside it — put the card’s files in a folder of their own, or reinstall through HACS, which does that for you. The card itself is unaffected.");const r=n?.EDITOR_VERSION;r!==me&&Ne(`Editor file is v${r??"unknown"} but the card is v${me}. Both files come from the same release, so one of them is stale — hard-refresh the browser, and if that does not help, reinstall so the card and editor files are replaced together.`),customElements.get(t)||customElements.define(t,i)}function cc(e,t){for(let n=t;n;){e.observe(n,{attributes:!0,attributeOldValue:!0,attributeFilter:["style","class","dir","lang"]});const t=n.getRootNode();n=n.parentElement??(t instanceof ShadowRoot?t.host:null)}}function uc(e,t){if(e.target!==t||"class"!==e.attributeName)return!1;const n=e=>e.split(/\s+/).filter(e=>e&&"calendar-card-title-scroll-paused"!==e).sort().join(" ");return n(e.oldValue??"")===n(t.className)}function hc(e){return"childList"===e.type&&[...Array.from(e.addedNodes),...Array.from(e.removedNodes)].some(e=>e instanceof Element&&!e.classList.contains(Hs))}function mc(e){return e.scrollHeight>e.clientHeight+1}function pc(e){if(e.lineHeight.endsWith("px")){const t=Number.parseFloat(e.lineHeight);if(Number.isFinite(t)&&t>0)return t}const t=Number.parseFloat(e.fontSize);return Number.isFinite(t)&&t>0?1.2*t:0}function _c(e,t,n){if(n<=0)return 0;const i=e-1;return Math.max(1,Math.round(t/n))-Math.max(0,Math.ceil(i/n))}const gc=[{selector:".description",lineProperty:"--calendar-card-description-max-lines"},{selector:".location",lineProperty:"--calendar-card-location-max-lines"},{selector:".event-weather",lineProperty:null},{selector:".progress-bar-row",lineProperty:null},{selector:".time",lineProperty:null}],fc=new Set;function vc(e){return e.reduce((e,t)=>e+t.events.filter(e=>!e._isEmptyDay).length,0)}let yc=class extends le{constructor(){super(),this.config={...Ve},this.events=[],this.isInitialLoad=!0,this.isLoading=!1,this.isExpanded=!1,this.weatherForecasts={daily:{},hourly:{}},this.preview=!1,this.editMode=!1,this.connectedWhileHidden=!0,this._instanceId=Se(),this._eventsInstanceId="",this._eventRequestGeneration=0,this._language="",this._lastUpdateTime=0,this._eventsFetchedAt=0,this._appearLoadPending=!1,this._failureCountHint=0,this._weatherUnsubscribers=[],this._weatherSetupVersion=0,this._weatherSetupPending=!1,this._hasFetchError=!1,this._failedEntities=[],this._activePointerId=null,this._pointerStart=null,this._pointerMoved=!1,this._holdTriggered=!1,this._holdTimer=null,this._holdIndicator=null,this._pointerCaptureTarget=null,this._capturedPointerId=null,this._releasingPointerCapture=!1,this._pointerTapTarget=null,this._derivedClick=null,this._spaceArmedOn=null,this._handleLegendChanged=e=>{const t=e.detail;if(!t||t.source===this||!this._wantsLegend)return;if(t.fingerprint!==this._configFingerprint)return;const n=new Set(Pi(this.config.entities)),i=t.hidden.filter(e=>n.has(e));this._hiddenCalendars=i.length>0?new Set(i):fc,this.requestUpdate()},this._handleCalendarsChanged=e=>{const t=e.detail;t&&t.source!==this&&function(e,t,n){const{changed:i}=e;return"ids"in i?i.ids.some(e=>t.includes(e)):t.some(e=>Xn(n,e,i.feature))}(t,this.config.entities.map(e=>"string"==typeof e?e:e.entity),this.safeHass)&&(this._markHomeStaleIfAway(),this.refreshEvents(t.writeGeneration))},this._openEventDetails=(e,t)=>{if(this._isBeingEdited)return void Be("Not opening event details while the card is being edited");const n=e._entityId,i=function(e){if(e._isEmptyDay)return;const t=e._source??e,n=t.start.dateTime??t.start.date;return n?{summary:t.summary??"",dtstart:n,dtend:si(e)??n,description:t.description??void 0,location:t.location??void 0,uid:t.uid??void 0,recurrence_id:t.recurrence_id??void 0,rrule:t.rrule??void 0,status:"string"==typeof t.status?t.status:void 0}:void 0}(e);var r,a;n&&i&&(r=this,a={calendarId:n,entry:i,color:t,...li(this.safeHass,e,i,{allowEdit:!1!==this.config.allow_event_edit,allowDelete:!1!==this.config.allow_event_delete,failedEntities:this._failedEntities}),updated:()=>this._refreshAfterWrite({ids:[n]})},ii(Jn,{node:r,params:a,fallback:()=>function(e,t){e.dispatchEvent(new CustomEvent("hass-more-info",{bubbles:!0,composed:!0,detail:{entityId:t}}))}(r,a.calendarId)}))},this._measuredWidthPx=null,this._toolbarWidthPx=null,this._toolbarLabelsOverflowed=null,this._monthFit=null,this._configFingerprint=null,this._viewChoice=null,this._hiddenCalendars=fc,this._refreshPhase="idle",this._refreshTicket=0,this._resetConfirmation=null,this._homeConfirming=!1,this._refreshAwaitsLoad=null,this._shownEventsCache=null,this._legendFold=null,this._legendWidthPx=null,this._legendUnfoldedAtPx=null,this._legendFitRaf=null,this._toolbarFontGeneration=0,this._toolbarFontsCleanup=null,this._toolbarLabelMinWidthPx=null,this._cardActionCallbacks={expand:()=>this.toggleExpanded(),refresh:()=>this._requestRefresh()},this._pageRequested=null,this._pageShown=null,this._pageConfigs=null,this._homeStale=!1,this._homeWindowCache=null,this._effectiveView="list",this._columnCount=0,this._cascadeThresholdMin=30,this._overflowStripPct=1/0,this._gridScaleRaf=null,this._resizeObserver=null,this._gridDisclosureObserver=null,this._gridDisclosureRaf=null,this._gridDisclosureReleaseRaf=null,this._gridDisclosureTargets=new Map,this._gridDisclosureDirty=new Set,this._gridDisclosureMutations=null,this._gridDisclosureAssetsCleanup=null,this._gridDisclosureObservedSizes=new WeakMap,this._gridDisclosureSuppressRo=!1,this._gridDisclosureSuppressGeneration=0,this._gridDisclosureFontsCleanup=null,this._nowLineTimerId=null,this._nowLineDayKey=null,this._bareUpdateRequests=0,this._bareUpdateRequestsSeen=0,this._nowLineRepainting=!1,this._midnightTimerId=null,this._nowBoundaryTimerId=null,this._nowBoundaryAt=null,this._nowBoundaryEvents=null,this._widthSettleTimerId=null,this._titleScrollObserver=null,this._titleScrollIntersectionObserver=null,this._titleScrollMutations=null,this._titleScrollRaf=null,this._titleScrollFontsCleanup=null,this._titleMotion=null,this._handleVisibilityChange=()=>{this._syncNowLineTimer(),this._syncNowBoundaryTimer(),"visible"===document.visibilityState&&((this._wantsNowLine||this._wantsNowBoundary)&&this.requestUpdate(),Date.now()-this._lastUpdateTime>3e5&&(Be("Visibility changed to visible, updating events"),this.updateEvents("cache")))},this._onEntityColorsChanged=()=>{this.requestUpdate()},this._instanceId=Se(),function(e){Fe||(console.groupCollapsed(`%c${pe}%cv${e} `,Oe.title,Oe.version),console.log("%c Description: %c A calendar card that supports multiple calendars with individual styling. ","font-weight: bold","font-weight: normal"),console.log("%c GitHub: %c https://github.com/alexpfau/calendar-card-pro ","font-weight: bold","font-weight: normal"),console.groupEnd(),Fe=!0)}(me)}static async getConfigElement(){if(!customElements.get("calendar-card-pro-editor"))try{dc(await(import(function(e){const t=new URL("./editor.js",e);return t.search=new URL(e).search,t.href}(import.meta.url))),"calendar-card-pro-editor")}catch(e){const t=e instanceof Error?e.message:String(e);throw Ie(e,"loading the editor file"),new Error(`Calendar Card Pro: the editor could not be loaded because one of the card’s files is missing. Reinstalling the card in HACS restores it. The card itself is unaffected. (${t})`)}return document.createElement("calendar-card-pro-editor")}getGridOptions(){return{columns:"full",rows:"auto"}}get _hasTapAction(){return Boolean(this.config.tap_action&&"none"!==this.config.tap_action.action)}get _hasHoldAction(){return Boolean(this.config.hold_action&&"none"!==this.config.hold_action.action)}get _hasCardAction(){return this._hasTapAction||this._hasHoldAction}_refreshAfterWrite(e){this._markHomeStaleIfAway();const t=function(){const e=Uo()+1;return globalThis[qo]=e,e}();this.refreshEvents(t),function(e,t,n){window.dispatchEvent(new CustomEvent(oi,{detail:{changed:t,writeGeneration:n,source:e}}))}(this,e,t)}_markHomeStaleIfAway(){null===this._pageRequested&&null===this._pageShown||(this._homeStale=!0)}get _eventTapOpensDetails(){const e=this.config.event_tap_action;return"details"===e?.action}get _isBeingEdited(){return this.preview||this.editMode}get _eventsActivatable(){return this._eventTapOpensDetails&&!this._isBeingEdited}_runEventTapAction({event:e,color:t}){Be("Executing event tap action"),this._openEventDetails(e,t)}_eventTapAt(e){if(this._eventsActivatable&&"function"==typeof e.composedPath)return function(e,t){for(const n of e){if(n===t)return;const e=hi(n);if(e)return{element:n,target:e}}}(e.composedPath(),e.currentTarget)}get safeHass(){return this.hass||null}get effectiveLanguage(){return!this._language&&this.hass&&(this._language=Ki(this.config.language,this.hass.locale)),this._language||"en"}get groupedEvents(){return us(this._shownEvents,this.effectiveConfig,this.isExpanded,this.effectiveLanguage,this.effectiveView,this.hass)}get _activeHiddenCalendars(){return this._wantsLegend&&!this._isBeingEdited?this._hiddenCalendars:fc}get _shownEvents(){const e=this._activeHiddenCalendars;if(0===e.size)return this.events;const t=this._shownEventsCache;if(t&&t.events===this.events&&t.hidden===e)return t.shown;const n=this.events.filter(t=>!e.has(t._entityId??""));return this._shownEventsCache={events:this.events,hidden:e,shown:n},n}get requestedView(){return this._viewChoice??this.config.view}get effectiveView(){return this._isBeingEdited?this.config.view:this._effectiveView}get _shownColumnCount(){return this._isBeingEdited&&this.requestedView!==this.config.view?qn(this.config.view,this.config,this._measuredWidthPx,null).columns:this._columnCount}get effectiveConfig(){const e=this.effectiveView,t=this._configForPage(this._pageShown),n=this._effectiveConfigCache;if(n&&n.config===t&&n.view===e)return n.resolved;const i=Ln(t,e);return this._effectiveConfigCache={config:t,view:e,resolved:i},i}_configForPage(e){if(null===e)return this.config;this._pageConfigs?.config!==this.config&&(this._pageConfigs={config:this.config,pages:new Map});const t=this._pageConfigs.pages.get(e);if(t)return t;const n={...this.config,start_date:e,show_past_events:!0};for(const e of an){const t=xn[e]?.blockKey,i=t?this.config[t]:void 0;t&&Ee(i)&&"show_past_events"in i&&(n[t]={...i,show_past_events:!0})}return this._pageConfigs.pages.set(e,n),n}_instanceIdForPage(e){return null===e?this._instanceId:Te(this.config.entities,Rn(this.config),e,this.config.first_day_of_week)}_loadConfigForPage(e){return Wn(this._configForPage(e))}get _viewDays(){return this.effectiveConfig.days_to_show}get _wantsNavigation(){const e=tt(this.config);return e.show&&e.navigation}get _shedColumns(){return"list"===this.effectiveView?0:this._shownColumnCount}_homeWindowStart(e){const t=ma(this.config.first_day_of_week,this.hass?.locale),n=[ea(e),this.config.start_date??"",this.config.days_to_show,t].join("|");if(this._homeWindowCache?.key!==n){const{start:e}=Ts(this.config.days_to_show,this.config.start_date,t);this._homeWindowCache={key:n,start:e}}return this._homeWindowCache.start}_homeRange(e=new Date){return function(e,t,n,i){const r=vd(e),a=Math.max(1,Math.floor(t)||1),o=Md(a,n);if(o===a)return{start:r,days:o};const s=oa(r,vd(i));return{start:yd(r,Math.min(Math.max(s,0),a-o)),days:o}}(this._homeWindowStart(e),this._viewDays,this._shedColumns,e)}_pageRange(e,t=new Date){return null===e?this._homeRange(t):{start:bd(e),days:Md(this._viewDays,this._shedColumns)}}get effectiveTitle(){return Fd(this.config.title)?this.renderedTitle??"":this.config.title}get isTitlePending(){return Fd(this.config.title)&&void 0===this.renderedTitle}get visibleEventCount(){const e=this.effectiveLanguage,t=this.effectiveView,n=ma(this.config.first_day_of_week,this.hass?.locale),i=ra(this.hass).join(","),r=Date.now(),a=this._visibleCountCache,o=this._shownEvents;if(a&&a.events===o&&a.config===this.config&&a.view===t&&a.language===e&&a.firstWeekday===n&&a.weekendDaysKey===i&&a.evaluatedAt===r)return a.count;const s=o.length?vc(us(o,this.effectiveConfig,!0,e,t,this.hass)):0;return this._visibleCountCache={events:o,config:this.config,view:t,language:e,firstWeekday:n,weekendDaysKey:i,evaluatedAt:r,count:s},s}_anyReachableViewHasEvents(){if(this.visibleEventCount>0)return!0;const e=this._shownEvents;if(0===e.length)return!1;const t=this.effectiveView;return Nn(this.config).some(n=>n!==t&&vc(us(e,this.config,!0,this.effectiveLanguage,n,this.hass))>0)}static get styles(){return yl}connectedCallback(){super.connectedCallback(),Be("Component connected"),this.startRefreshTimer(),this._appearLoadPending=!0,this.updateEvents("navigate"),this._scheduleWeatherSetup(),this._updateTitleSubscription(),document.addEventListener("visibilitychange",this._handleVisibilityChange),window.addEventListener(oi,this._handleCalendarsChanged),window.addEventListener(bi,this._handleLegendChanged),this._syncEntityColors(),this._startWidthObserver(),this._syncTitleScroll(),this._syncGridDisclosureSafety()}disconnectedCallback(){super.disconnectedCallback(),this._stopWidthObserver(),this._stopGridDisclosureObserver(),this._stopTitleScrollObserver(),Ci(this.renderRoot),this._toolbarFontsCleanup?.(),this._toolbarFontsCleanup=null,this._settleResetConfirmation(),this._settleHomeConfirmation(),null!==this._legendFitRaf&&(cancelAnimationFrame(this._legendFitRaf),this._legendFitRaf=null),this._weatherSetupVersion++,this._weatherSetupPending=!1,this._cleanupWeatherSubscriptions(),this._titleSubscription?.destroy(),this._titleSubscription=void 0,this._eventRequestGeneration++,this.isLoading=!1,this._settleRefreshPhase(),this._refreshTimerId&&(clearTimeout(this._refreshTimerId),this._refreshTimerId=void 0),this._initialLoadRetryId&&(clearTimeout(this._initialLoadRetryId),this._initialLoadRetryId=void 0),this._endGesture(),this._derivedClick=null,this._spaceArmedOn=null,this._stopNowLineTimer(),this._stopMidnightTimer(),this._stopNowBoundaryTimer(),document.removeEventListener("visibilitychange",this._handleVisibilityChange),window.removeEventListener(oi,this._handleCalendarsChanged),window.removeEventListener(bi,this._handleLegendChanged),en(this._onEntityColorsChanged),Be("Component disconnected")}_startWidthObserver(){this._resizeObserver||"undefined"==typeof ResizeObserver||(this._resizeObserver=new ResizeObserver(e=>{const t=e[0]?.contentRect?.width;"number"==typeof t&&t>0&&(null!==this._toolbarWidthPx&&Math.abs(t-this._toolbarWidthPx)>.5&&Ci(this.renderRoot),this._syncToolbarLabels(t),this._scheduleLegendFit(),this._scheduleWidthMeasurement(t)),this._scheduleGridScaleSync()}),this._resizeObserver.observe(this))}_syncToolbarLabels(e){const t=[_e.TOOLBAR_SWITCHER_LABEL_MIN_WIDTH,this._toolbarLabelMinWidthPx,this._monthFit?.fullFromPx].filter(e=>"number"==typeof e),n=e=>null===e?"":t.map(t=>e>=t?1:0).join(""),i=n(e)!==n(this._toolbarWidthPx),r=this._toolbarLabelsOverflowed,a=null!==r&&e>r.widthPx&&(this._toolbarWidthPx??0)<=r.widthPx;this._toolbarWidthPx=e,(i||a)&&tt(this.config).show&&this.requestUpdate()}_scheduleWidthMeasurement(e){null!==this._widthSettleTimerId&&clearTimeout(this._widthSettleTimerId),this._widthSettleTimerId=window.setTimeout(()=>{this._widthSettleTimerId=null,this._handleWidthMeasured(e)},100)}get _wantsNowLine(){return"grid"===this.effectiveView&&mn(this.config,"show_now_line")}_syncNowLineTimer(){if(!this.isConnected||!this._wantsNowLine||"hidden"===document.visibilityState)return void this._stopNowLineTimer();if(null!==this._nowLineTimerId)return;this._nowLineTimerId=window.setInterval(()=>{this._tickNowLine()},6e4);const e=ea(new Date);if(null!==this._nowLineDayKey&&e!==this._nowLineDayKey)return this._nowLineDayKey=e,Be("Local day rolled over while the now-line timer was stopped, refreshing events"),void this.updateEvents("network");this._nowLineDayKey=e}_stopNowLineTimer(){null!==this._nowLineTimerId&&(clearInterval(this._nowLineTimerId),this._nowLineTimerId=null)}_syncMidnightTimer(){if(!(this.isConnected&&("grid"===this.effectiveView||"column"===this.effectiveView)&&this._shownColumnCount>0&&this._shownColumnCount<this.effectiveConfig.days_to_show))return void this._stopMidnightTimer();if(null!==this._midnightTimerId)return;const e=new Date,t=new Date(e.getFullYear(),e.getMonth(),e.getDate()+1,0,0,1);this._midnightTimerId=window.setTimeout(()=>{this._midnightTimerId=null,this.requestUpdate(),this.updateEvents("cache")},t.getTime()-e.getTime())}_stopMidnightTimer(){null!==this._midnightTimerId&&(clearTimeout(this._midnightTimerId),this._midnightTimerId=null)}get _wantsNowBoundary(){return"list"===this.effectiveView||"column"===this.effectiveView||"grid"===this.effectiveView&&!this._wantsNowLine}_syncNowBoundaryTimer(){const e=this.isConnected&&this._wantsNowBoundary&&"hidden"!==document.visibilityState,t=this._shownEvents;if(e&&null!==this._nowBoundaryTimerId&&this._nowBoundaryEvents===t&&null!==this._nowBoundaryAt&&this._nowBoundaryAt>Date.now())return;const n=e?function(e,t){let n=null;const i=new Date(t),r=new Date(i.getFullYear(),i.getMonth(),i.getDate()+1).getTime();for(const i of e){if(i._isEmptyDay||!i.start?.dateTime||!i.end?.dateTime)continue;const e=new Date(i.start.dateTime).getTime(),a=new Date(i.end.dateTime).getTime(),o=e<r&&a>r?[e,a,r]:[e,a];for(const e of o)e>t&&(null===n||e<n)&&(n=e)}return n}(t,Date.now()):null;if(null===n)return void this._stopNowBoundaryTimer();if(null!==this._nowBoundaryTimerId&&this._nowBoundaryAt===n)return;this._stopNowBoundaryTimer(),this._nowBoundaryAt=n,this._nowBoundaryEvents=t;const i=Math.min(n-Date.now()+1e3,864e5);this._nowBoundaryTimerId=window.setTimeout(()=>{this._nowBoundaryTimerId=null,this._nowBoundaryAt=null,this.requestUpdate()},i)}_stopNowBoundaryTimer(){null!==this._nowBoundaryTimerId&&(clearTimeout(this._nowBoundaryTimerId),this._nowBoundaryTimerId=null),this._nowBoundaryAt=null,this._nowBoundaryEvents=null}_tickNowLine(){const e=ea(new Date);if(null!==this._nowLineDayKey&&e!==this._nowLineDayKey)return this._nowLineDayKey=e,Be("Local day rolled over, refreshing events"),void this.updateEvents("network");this._nowLineDayKey=e,this._nowLineRepainting=!0;try{this.requestUpdate()}finally{this._nowLineRepainting=!1}}requestUpdate(...e){void 0!==e[0]||this._nowLineRepainting||(this._bareUpdateRequests=(this._bareUpdateRequests??0)+1),super.requestUpdate(...e)}_stopWidthObserver(){this._resizeObserver?.disconnect(),this._resizeObserver=null,null!==this._widthSettleTimerId&&(clearTimeout(this._widthSettleTimerId),this._widthSettleTimerId=null),null!==this._gridScaleRaf&&(cancelAnimationFrame(this._gridScaleRaf),this._gridScaleRaf=null)}_scheduleGridScaleSync(){null===this._gridScaleRaf&&"undefined"!=typeof requestAnimationFrame&&(this._gridScaleRaf=requestAnimationFrame(()=>{this._gridScaleRaf=null,this._syncCascadeThreshold(),this._syncOverflowStrip()}))}_syncCascadeThreshold(){if(!this.isConnected||"grid"!==this.effectiveView||"cascade"!==mn(this.effectiveConfig,"overlap_layout"))return;const e=lo(mn(this.effectiveConfig,"start_time"),mn(this.effectiveConfig,"end_time")),t=function(e,t,n){const i=n??30;if(!e||!Number.isFinite(t)||t<=0||!Number.isFinite(e.bodyHeightPx)||e.bodyHeightPx<=0||!Number.isFinite(e.fontPx)||e.fontPx<=0||!Number.isFinite(e.chromePx))return i;const r=e.bodyHeightPx/t,a=(Math.max(24,2*e.fontPx)+Math.max(0,e.chromePx-7))/r,o=e=>Math.min(t+1,Math.max(30,5*Math.ceil((e-.05)/5))),s=o(a);if(void 0===n||s>=n)return s;const l=o(a+2);return l<n?l:n}(function(e){const t=e.querySelector(".grid-day-body"),n=e.querySelector(".grid-event:not(.grid-event-overflow)");if(!t||!n||t.clientHeight<=0)return null;const i=document.createElement("div");i.className=Hs,i.setAttribute("aria-hidden","true"),i.style.cssText="position:absolute;visibility:hidden;pointer-events:none;inset-inline-start:0;top:0;width:0;font-size:var(--calendar-card-font-size-event);height:calc(2 * var(--calendar-card-grid-event-gap, 1px) + var(--calendar-card-grid-rule-width, 1px));",t.appendChild(i);try{const e=Number.parseFloat(getComputedStyle(i).fontSize),r=Number.parseFloat(getComputedStyle(i).height)||0,a=getComputedStyle(n),o=(Number.parseFloat(a.paddingTop)||0)+(Number.parseFloat(a.paddingBottom)||0);return{bodyHeightPx:t.clientHeight,fontPx:e,chromePx:r+o}}finally{i.remove()}}(this.renderRoot),e.endMin-e.startMin,this._cascadeThresholdMin);t!==this._cascadeThresholdMin&&(Be(`Cascade threshold ${this._cascadeThresholdMin} -> ${t} minutes`),this._cascadeThresholdMin=t,this.requestUpdate())}_syncOverflowStrip(){if(!this.isConnected||"grid"!==this.effectiveView)return;const e=function(e,t){if(!(e&&e.dayWidthPx>0&&e.labelFontPx>0))return t;const n=28*Math.max(1,e.labelFontPx/12);return Number.isFinite(t)&&Math.abs(t/100*e.dayWidthPx-n)<1?t:n/e.dayWidthPx*100}(function(e){const t=e.querySelector(".grid-event-overflow-label"),n=t?.closest(".grid-day-body");return!t||!n||n.clientWidth<=0?null:{dayWidthPx:n.clientWidth,labelFontPx:Number.parseFloat(getComputedStyle(t).fontSize)}}(this.renderRoot),this._overflowStripPct);e!==this._overflowStripPct&&(Be(`Overflow strip ${this._overflowStripPct} -> ${e}% of a day column`),this._overflowStripPct=e,this.requestUpdate())}_stopGridDisclosureObserver(){this._gridDisclosureObserver?.disconnect(),this._gridDisclosureObserver=null,this._gridDisclosureFontsCleanup?.(),this._gridDisclosureFontsCleanup=null,this._gridDisclosureMutations?.disconnect(),this._gridDisclosureMutations=null,this._gridDisclosureAssetsCleanup?.(),this._gridDisclosureAssetsCleanup=null,this._gridDisclosureTargets.clear(),this._gridDisclosureDirty.clear(),null!==this._gridDisclosureRaf&&(cancelAnimationFrame(this._gridDisclosureRaf),this._gridDisclosureRaf=null),null!==this._gridDisclosureReleaseRaf&&(cancelAnimationFrame(this._gridDisclosureReleaseRaf),this._gridDisclosureReleaseRaf=null),this._gridDisclosureSuppressGeneration+=1,this._gridDisclosureSuppressRo=!1}_applyGridDisclosureSafety(e){this._gridDisclosureSuppressGeneration+=1;const t=this._gridDisclosureSuppressGeneration;this._gridDisclosureSuppressRo=!0;const n=Array.from(e??this.renderRoot.querySelectorAll(".grid-event:not(.grid-event-overflow)")),i=n.map(Ul).filter(e=>null!==e);i.forEach(ql),od(i.map(e=>e.title));try{const e=n.flatMap(e=>{const t=e.querySelector(".grid-event-disclosure .event-content");if(!t)return[];const n=gc.map(e=>({lineProperty:e.lineProperty,element:t.querySelector(e.selector)})).filter(e=>null!==e.element);for(const e of n)e.element.classList.remove("grid-event-detail-clipped"),e.lineProperty&&e.element.style.removeProperty(e.lineProperty);return[{block:e,content:t,detailRows:n,withdrawn:[]}]}),t=this._applyGridTimeFit(n);(function(e){const t=e.flatMap(e=>{const t=Array.from(e.summary.children).filter(t=>t!==e.title),n=function(e){const t=e.querySelector(".title-words");for(const e of Array.from(t?.childNodes??[])){if(e.nodeType===Node.ELEMENT_NODE)return e===t?.firstElementChild&&e.matches(".title-word")?e:null;if(e.nodeType===Node.TEXT_NODE&&e.textContent?.trim())return null}return null}(e.title);return t.length&&n&&!e.summary.matches(".summary-scroll")?[{target:e,labels:t,word:n}]:[]});if(!t.length)return;const n=document.createElement("canvas").getContext("2d"),i=t.flatMap(({target:e,labels:t,word:i})=>{if(!rd(e)||!ad(e.summary))return[];const r=sd(e.block);let a=0;for(const e of t){const t=e.getClientRects();if(1!==t.length||t[0].width<=0)return[];const n=getComputedStyle(e);a+=t[0].width/r+id(n.marginLeft)+id(n.marginRight)}const o=Xl(Zl(i))/r,s=ud(e.summary)-a;return o>0&&o+hd(n,i)<=s+Cl?[{target:e,run:a}]:[]});for(const{target:e,run:t}of i)e.summary.style.setProperty(Al,`${t}px`)})(i),function(e){if(!e.length)return;const t=document.createElement("canvas").getContext("2d"),n=e.flatMap(e=>{const n=function(e,t){if(e.summary.matches(".summary-scroll")||!rd(e)||!ad(e.summary))return null;const n=function(e){const t=Array.from(e.summary.children).flatMap(t=>t===e.title?[]:[{kind:"label",node:t,rects:t.matches(".calendar-label")?Zl(t).flatMap(e=>e.rects):Array.from(t.getClientRects())}]);for(const n of Zl(e.title)){const i=n.node.parentElement?.closest(".title-word");i&&e.title.contains(i)?t[t.length-1]?.node!==i&&t.push({kind:"word",node:i,rects:[i.getBoundingClientRect()]}):t.push({kind:"text",node:n.node,rects:n.rects})}return t}(e),i=function(e){const t=[];for(const n of e.filter(e=>e.height>0).sort((e,t)=>e.top-t.top)){const e=t[t.length-1];e&&md(n)<=e.bottom+Cl?(e.top=Math.min(e.top,n.top),e.bottom=Math.max(e.bottom,n.bottom)):t.push({top:n.top,bottom:n.bottom})}return t}(n.flatMap(e=>e.rects)),{visible:r}=dd(e);let a=0;for(;a<i.length&&nd(i[a],r);)a+=1;if(0===a||a===i.length)return null;const o=i[a-1],s=e=>md(e)>=o.top-Cl&&md(e)<=o.bottom+Cl,l=n.filter(e=>"label"!==e.kind);let d=l.length-1;for(;d>=0&&!l[d].rects.some(s);)d-=1;if(d<0)return null;const c={target:e,lines:a,word:null,room:0},u=sd(e.block),h=n.flatMap(e=>e.rects.filter(s)),m=ud(e.summary)*u-(Math.max(...h.map(e=>e.right))-Math.min(...h.map(e=>e.left))),p=e=>e.rects.filter(s).reduce((e,t)=>e+t.width,0),_=(e,t)=>{const n=e?.rects.filter(s)??[],i=t.rects.filter(s);return n.length&&i.length?function(e,t){return Math.max(0,t.left-e.right,e.left-t.right)}(n[n.length-1],i[0]):0};if("text"===l[d].kind){let n=m,i=d;for(;i>=0&&"text"===l[i].kind&&l[i].rects.some(s);i--)n+=p(l[i])+_(l[i-1],l[i]);const r=hd(t,l[d].node.parentElement??e.title);if(i<0||!l[i].rects.some(s)||n>=(r+1)*u)return c}let g=m;for(let n=d;n>=0&&l[n].rects.some(s);n-=1){const i=l[n];if(g+=p(i),"text"===i.kind){const r=hd(t,i.node.parentElement??e.title);if(g+_(l[n-1],i)>=(r+1)*u)return c}if("word"===i.kind&&l.slice(n+1).every(pd)){const n=i.node,r=Xl(Zl(n));if(r>0&&r+hd(t,n)*u<=g+Cl)return{target:e,lines:a,word:n,room:g/u-Cl}}g+=_(l[n-1],i)}return c}(e,t);return n?[n]:[]});for(const{target:e,lines:t,word:i,room:r}of n)i?(i.setAttribute(zl,""),i.style.setProperty(Pl,`${r}px`)):(e.summary.setAttribute(Fl,""),e.summary.style.setProperty(Hl,String(t)))}(i);const r=e.filter(e=>t.has(e.block)&&mc(e.content));for(const e of r){const n=t.get(e.block);n&&Yl(n)}for(const{selector:t}of gc){const n=e.flatMap(e=>{if(!mc(e.content))return[];const n=e.detailRows.find(({element:e})=>e.matches(t));return n&&0!==n.element.getClientRects().length?[{transaction:e,row:n,lines:n.lineProperty?this._gridDetailLineCount(e.content,n.element):0}]:[]});for(const{row:e,lines:t}of n)e.lineProperty&&t>0&&e.element.style.setProperty(e.lineProperty,String(t));const i=n.filter(({transaction:e,lines:t})=>t<1||mc(e.content));for(const{transaction:e,row:t}of i)t.lineProperty&&t.element.style.removeProperty(t.lineProperty),t.element.classList.add("grid-event-detail-clipped"),e.withdrawn.push(t.element)}const a=e.filter(({content:e})=>mc(e));for(const{withdrawn:e}of a)e.forEach(e=>e.classList.remove("grid-event-detail-clipped"));const o=[],s=[];for(const e of i){if(!cd(e)){o.push(e);continue}const t=gc.flatMap(({selector:t})=>Array.from(e.disclosure.querySelectorAll(t)));t.length&&t.every(e=>0===e.getClientRects().length)&&s.push(e)}!function(e){const t=e.map(e=>({target:e,shift:_d(e)}));for(const{target:e,shift:n}of t)null!==n&&(e.row.style.setProperty("--calendar-card-grid-title-shift",`${n}px`),e.block.dataset.gridTitleFit="centered")}(s),function(e){if(!e.length)return;const t=document.createElement("canvas").getContext("2d");for(const t of e)t.block.dataset.gridTitleFit="measuring";try{const n=e.map(e=>gd(e,t)).map(e=>{const t=function(e,t){if(![e,...t].every(e=>Number.isFinite(e)&&e>0)||!t.length)return null;const n=e*Math.max(...t.map(e=>Math.min(e,El)/e));return n<=Math.min(e,El)+1e-7?Math.min(e,El):e-Math.floor(e-n+1e-7)}(e.font,e.textFonts);return{...e,minimum:t,candidate:Math.max(t??e.font,Nl(e.font,e.height,e.available)??Math.min(e.font,El))}});for(const{target:e,candidate:t,font:i}of n)e.summary.style.setProperty("--calendar-card-grid-title-scale",String(i>0?t/i:1));const i=n.map(e=>({...e,result:gd(e.target,t)})).map(e=>({...e,neighbor:Math.max(e.minimum??e.font,Rl(e.font,e.candidate,fd(e.result)))}));for(const{target:e,neighbor:t,font:n}of i)e.summary.style.setProperty("--calendar-card-grid-title-scale",String(n>0?t/n:1));const r=i.map(e=>({...e,neighborResult:gd(e.target,t)}));for(const{target:e,candidate:t,font:n,minimum:i,result:a,neighbor:o,neighborResult:s}of r){const r=fd(s)&&(o>t||!fd(a)),l=r?s:a;e.summary.style.setProperty("--calendar-card-grid-title-scale",String(n>0?(r?o:t)/n:1));const d=null!==i&&fd(l)&&l.readable;e.row.style.setProperty("--calendar-card-grid-title-shift",`${l.shift}px`),e.block.dataset.gridTitleFit=d?"compact":"blank"}}finally{for(const t of e)"measuring"===t.block.dataset.gridTitleFit&&(t.block.dataset.gridTitleFit="blank")}}(o);const l=i.filter(e=>("compact"===e.previousMode||"blank"===e.previousMode)&&"compact"!==e.block.dataset.gridTitleFit&&"blank"!==e.block.dataset.gridTitleFit&&e.title.classList.contains("title-scrollable")).map(e=>e.title);l.length&&this._measureTitleScroll(l),this._titleMotion?.refresh()}finally{null!==this._gridDisclosureReleaseRaf&&cancelAnimationFrame(this._gridDisclosureReleaseRaf),this._gridDisclosureReleaseRaf=requestAnimationFrame(()=>{this._gridDisclosureReleaseRaf=requestAnimationFrame(()=>{this._gridDisclosureReleaseRaf=null,t===this._gridDisclosureSuppressGeneration&&(this._gridDisclosureSuppressRo=!1)})})}}_applyGridTimeFit(e){const t=e.map(e=>({block:e,target:Ml(e)})).filter(e=>null!==e.target),n=new Map;if(0===t.length)return n;const i=t.map(({target:e})=>e);i.forEach(kl);const r=i.map(xl);i.forEach($l);const a=i.map((e,t)=>function(e,t,n=0){return{available:t,full:e.time.getBoundingClientRect().width,icon:e.icon?Ll(e.icon):0,end:e.end?Ll(e.end):0,wrapped:n}}(e,r[t]));i.forEach(Dl);const o=i.map(Sl);i.forEach(Tl);const s=a.map((e,t)=>function(e){const{available:t,full:n,icon:i,end:r,wrapped:a}=e;if(![t,n,i,r,a].every(Number.isFinite))return wl;if(t<=0||n<=0)return wl;const o=t+.015625;return n<=o?{time:!0,icon:!0,end:!0,wrap:!1}:n-i<=o?{time:!0,icon:!1,end:!0,wrap:!1}:r>0&&a>0&&a<=o?{time:!0,icon:!1,end:!0,wrap:!0}:n-i-r<=o?{time:!0,icon:!1,end:!1,wrap:!1}:wl}({...e,wrapped:o[t]}));return t.forEach(({block:e,target:t},i)=>{!function(e,t){e.time.style.removeProperty("display"),e.time.style.removeProperty("width"),t.time&&(e.disclosure.classList.add("grid-time-fits"),t.icon||e.disclosure.classList.add("grid-time-no-icon"),t.end||e.disclosure.classList.add("grid-time-no-end"),t.wrap&&e.disclosure.classList.add("grid-time-wrap"))}(t,s[i]),s[i].wrap&&n.set(e,t)}),n}_gridDetailLineCount(e,t){const n=t.querySelector("span")??t,i=pc(getComputedStyle(n)),r=_c(e.scrollHeight-e.clientHeight,n.getBoundingClientRect().height,i);return Math.max(0,r)}_scheduleGridDisclosureSafety(e=!0){e&&this._gridDisclosureTargets.forEach(e=>this._gridDisclosureDirty.add(e)),null===this._gridDisclosureRaf&&(this._gridDisclosureRaf=requestAnimationFrame(()=>{if(this._gridDisclosureRaf=null,!this.isConnected||"grid"!==this.effectiveView)return;const e=Array.from(this._gridDisclosureDirty).filter(e=>e.isConnected);this._gridDisclosureDirty.clear(),e.length&&this._applyGridDisclosureSafety(e)}))}_syncGridDisclosureSafety(e=!0){if(!this.isConnected||"grid"!==this.effectiveView||"undefined"==typeof ResizeObserver)return void this._stopGridDisclosureObserver();if(!e&&this._gridDisclosureObserver)return;const t=this.renderRoot.querySelectorAll(".grid-event:not(.grid-event-overflow)");t.length?(this._gridDisclosureObserver||(this._gridDisclosureObserver=new ResizeObserver(e=>{let t=!1;for(const n of e){const e=this._gridDisclosureObservedSizes.get(n.target),i={width:n.contentRect.width,height:n.contentRect.height};if(this._gridDisclosureObservedSizes.set(n.target,i),void 0===e||e.width!==i.width||e.height!==i.height){const e=this._gridDisclosureTargets.get(n.target);e&&this._gridDisclosureDirty.add(e),t=!0}}this._gridDisclosureSuppressRo&&!t||t&&this._scheduleGridDisclosureSafety(!1)}),this._watchGridDisclosureFonts()),this._observeGridDisclosureTargets(t),this._scheduleGridDisclosureSafety()):this._stopGridDisclosureObserver()}_observeGridDisclosureTargets(e){const t=new Set(e);for(const[e,n]of this._gridDisclosureTargets)t.has(n)&&n.contains(e)||(this._gridDisclosureObserver?.unobserve(e),this._gridDisclosureTargets.delete(e));t.forEach(e=>{for(const t of[e,...e.querySelectorAll(".summary, .event-title")])this._gridDisclosureTargets.has(t)||(this._gridDisclosureTargets.set(t,e),this._gridDisclosureObserver?.observe(t))})}_reconcileGridStructure(){this.isConnected&&"grid"===this.effectiveView&&this._gridDisclosureObserver&&(this._observeGridDisclosureTargets(this.renderRoot.querySelectorAll(".grid-event:not(.grid-event-overflow)")),this._scheduleGridDisclosureSafety(!0),this._scheduleGridScaleSync())}_watchGridDisclosureFonts(){const e=e=>{if(!(e.target instanceof HTMLImageElement&&e.target.matches(".label-image")))return;const t=e.target.closest(".grid-event");t&&(this._gridDisclosureDirty.add(t),this._scheduleGridDisclosureSafety(!1))};this.renderRoot.addEventListener("load",e,!0),this.renderRoot.addEventListener("error",e,!0),this._gridDisclosureAssetsCleanup=()=>{this.renderRoot.removeEventListener("load",e,!0),this.renderRoot.removeEventListener("error",e,!0)};const t=document.fonts;if(t){let e=!0;const n=()=>{e&&this._scheduleGridDisclosureSafety()};t.ready.then(n),"function"==typeof t.addEventListener&&t.addEventListener("loadingdone",n),this._gridDisclosureFontsCleanup=()=>{e=!1,"function"==typeof t.removeEventListener&&t.removeEventListener("loadingdone",n)}}"undefined"!=typeof MutationObserver&&(this._gridDisclosureMutations=new MutationObserver(e=>{let t=!1,n=!1;for(const i of e)if("attributes"===i.type){if(uc(i,this))continue;t=!0}else{const e=i.target instanceof Element?i.target:i.target.parentElement,r=e?.closest(".grid-event:not(.grid-event-overflow)");r?this._gridDisclosureDirty.add(r):e?.closest("style")?t=!0:hc(i)&&(n=!0)}n&&this._reconcileGridStructure(),(t||this._gridDisclosureDirty.size)&&this._scheduleGridDisclosureSafety(t)}),this._gridDisclosureMutations.observe(this.renderRoot,{childList:!0,characterData:!0,subtree:!0}),cc(this._gridDisclosureMutations,this))}_gridDisclosureChanged(e){if(0===e.size)return this._bareUpdateRequests!==this._bareUpdateRequestsSeen;if(1!==e.size||!e.has("hass"))return!0;const t=e.get("hass");return!t||!this.hass||t.locale?.language!==this.hass.locale?.language||t.locale?.time_format!==this.hass.locale?.time_format||t.locale?.first_weekday!==this.hass.locale?.first_weekday||this.config.entities.some(e=>{const n="string"==typeof e?e:e.entity,i="string"==typeof e?void 0:e.label;return t.states[n]!==this.hass?.states[n]||i?.startsWith("person.")&&t.states[i]!==this.hass?.states[i]})}_handleWidthMeasured(e){const t=null===this._measuredWidthPx&&null!==this._viewChoice?Un(this.requestedView,this.config,e):(n=this.requestedView,i=this.config,r=this._measuredWidthPx,a=e,o={view:this._effectiveView,columns:this._columnCount},qn(n,i,a,null===r?null:o));var n,i,r,a,o;const s=this._offeredViewsKey(),l=this._shownColumnCount;this._measuredWidthPx=e,t.view!==this._effectiveView||t.columns!==this._columnCount?(Be(`Layout changed from ${this._effectiveView}/${this._columnCount} to ${t.view}/${t.columns} at ${Math.round(e)}px`),this._effectiveView=t.view,this._columnCount=t.columns,this.requestUpdate()):this._offeredViewsKey()===s&&this._shownColumnCount===l||this.requestUpdate()}willUpdate(e){var t;t=this.renderRoot,[...Si.keys()].some(e=>t.contains(e))&&!this._legendMenuMayStayOpen()&&Ci(this.renderRoot),(e.has("hass")||e.has("config")&&e.get("config")?.language!==this.config.language)&&(this._language=Ki(this.config.language,this.hass?.locale))}updated(e){(e.has("editMode")||e.has("preview"))&&this._isBeingEdited&&null!==this._pageRequested&&(this._requestPage(null),this._loadPage()),this._syncNowLineTimer(),this._syncMidnightTimer(),this._syncReplacedRefresh(),this._syncNowBoundaryTimer();const t=this._gridDisclosureChanged(e);this._bareUpdateRequestsSeen=this._bareUpdateRequests,this._syncGridDisclosureSafety(t),t&&(this._syncCascadeThreshold(),this._syncOverflowStrip());const n=e.has("hass")&&this.hass&&!e.get("hass");n&&this._appearLoadPending&&this.updateEvents("navigate");const i=e.get("config"),r=e.has("config")&&this.config?.weather?.entity!==i?.weather?.entity,a=r||e.has("config")&&this.config?.weather?.position!==i?.weather?.position;r&&(this.weatherForecasts={daily:{},hourly:{}},this._weatherSetupVersion++,this._cleanupWeatherSubscriptions()),(n||a)&&this._scheduleWeatherSetup(),this.config?.weather?.entity&&function(e,t,n){const i=xa(e,t);if(!e||!i)return;if($a.has(i))return;const r=Da.get(i);if(r)return void r.push(n);const a=function(e,t){if("function"==typeof e.callWS)return e.callWS(t);const n=e.connection;return n&&"function"==typeof n.sendMessagePromise?n.sendMessagePromise(t):void 0}(e,{type:"frontend/get_translations",language:i,category:"entity_component",integration:"weather"});if(!a)return void La(i,"this instance exposes no WebSocket command API");const o=[n];Da.set(i,o),a.then(e=>{const t=function(e){const t=e?.resources;if(!t)return{};const n={};for(const[e,i]of Object.entries(t))e.startsWith("component.weather.entity_component._.state.")&&"string"==typeof i&&i&&(n[e.slice(43)]=i);return n}(e);if(0!==Object.keys(t).length){$a.set(i,t),function(e,t){const n=ka.filter(e=>!t[e]);0!==n.length&&Be(`Home Assistant returned ${Object.keys(t).length} weather conditions for ${e}, without ${n.join(", ")}; those will follow the instance's language instead`)}(i,t),Be(`Loaded ${Object.keys(t).length} weather conditions in ${i}`);for(const e of o)e()}else La(i,"Home Assistant returned no condition strings")}).catch(e=>{La(i,String(e))}).finally(()=>{Da.delete(i)})}(this.hass,this.config.language,()=>this.requestUpdate()),this._syncEntityColors(),(e.has("hass")||e.has("config"))&&this._updateTitleSubscription(),this._applyVisibility(),this._syncTitleScroll(),this._syncToolbarLabelFit(),this._syncMonthFit(),this._syncHeadingMiddle(),this._syncLegendFit(!1),function(e){for(const t of e.querySelectorAll(".legend-chip-label")){const e=t.closest(".legend-chip");e&&(t.scrollWidth>t.clientWidth+.5?e.setAttribute("title",t.textContent??""):e.removeAttribute("title"))}}(this.renderRoot),function(e){for(const[t,n]of[...Si])t.isConnected&&n.opener.isConnected?e.contains(t)&&(Ti(t,n.opener),Di(t)):Li(t,"gone")}(this.renderRoot)}_updateTitleSubscription(){if(this.isConnected)return Fd(this.config.title)?(this._titleSubscription||(this._titleSubscription=new jd({onResult:e=>{this.renderedTitle=e},onError:()=>{void 0===this.renderedTitle&&(this.renderedTitle="")}})),void this._titleSubscription.update(this.hass,this.config.title)):(this._titleSubscription&&(this._titleSubscription.destroy(),this._titleSubscription=void 0),void(this.renderedTitle=void 0))}_applyVisibility(){const e=!(this.isInitialLoad||this.safeHass&&0!==this.config.entities.length),t=!(!0!==this.config.hide_when_empty||null!==this._pageRequested||null!==this._pageShown||0!==this._activeHiddenCalendars.size||this.preview||this.editMode||e||this._hasFetchError||this._anyReachableViewHasEvents());this.hidden!==t&&(Be(`hide_when_empty: ${t?"hiding":"revealing"} card`),t&&Ci(this.renderRoot),this.hidden=t,this.style.display=t?"none":"",this.dispatchEvent(new CustomEvent("card-visibility-changed",{detail:{value:!t},bubbles:!0,composed:!0})))}_syncTitleScroll(){if(!this.isConnected||!this.effectiveConfig.scroll_long_titles)return void this._stopTitleScrollObserver();const e=this.renderRoot.querySelectorAll(".event-title.title-scrollable");if(this._stopTitleScrollObserver(0===e.length),!e.length)return;!this._titleMotion&&"undefined"!=typeof CSS&&CSS.supports("animation-timing-function","linear(0, 1, 0)")&&"undefined"!=typeof CSSAnimation&&"undefined"!=typeof Animation&&"undefined"!=typeof AnimationEffect&&"function"==typeof AnimationEffect.prototype.getComputedTiming&&"function"==typeof Object.getOwnPropertyDescriptor(Animation.prototype,"startTime")?.set&&"function"==typeof Element.prototype.getAnimations&&"undefined"!=typeof IntersectionObserver&&"function"==typeof matchMedia&&"function"==typeof matchMedia("(prefers-reduced-motion: reduce)").addEventListener&&void 0!==document.timeline&&(this._titleMotion=new Kd(this,()=>this._scheduleTitleScrollMeasure())),this._titleMotion?.sync(e),"undefined"!=typeof ResizeObserver&&(this._titleScrollObserver=new ResizeObserver(()=>this._scheduleTitleScrollMeasure()),this._titleScrollObserver.observe(this),e.forEach(e=>{this._titleScrollObserver?.observe(e);const t=e.parentElement;t&&(this._titleScrollObserver?.observe(t),Array.from(t.children).forEach(e=>this._titleScrollObserver?.observe(e)))})),this._titleMotion||"undefined"==typeof IntersectionObserver||(this._titleScrollIntersectionObserver=new IntersectionObserver(e=>{const t=e.every(e=>!e.isIntersecting);this.classList.toggle("calendar-card-title-scroll-paused",t)}),this._titleScrollIntersectionObserver.observe(this)),"undefined"!=typeof MutationObserver&&(this._titleScrollMutations=new MutationObserver(e=>{e.some(e=>!uc(e,this))&&this._scheduleTitleScrollMeasure()}),this._titleScrollMutations.observe(this.renderRoot,{childList:!0,characterData:!0,subtree:!0}),cc(this._titleScrollMutations,this));const t=document.fonts;if(t){let e=!0;const n=()=>{e&&this._scheduleTitleScrollMeasure()};t.ready.then(n),"function"==typeof t.addEventListener&&t.addEventListener("loadingdone",n),this._titleScrollFontsCleanup=()=>{e=!1,"function"==typeof t.removeEventListener&&t.removeEventListener("loadingdone",n)}}this._scheduleTitleScrollMeasure()}_scheduleTitleScrollMeasure(){null!==this._titleScrollRaf&&cancelAnimationFrame(this._titleScrollRaf),this._titleScrollRaf=requestAnimationFrame(()=>{this._titleScrollRaf=null,this.isConnected&&this.effectiveConfig.scroll_long_titles&&this._measureTitleScroll()})}_measureTitleScroll(e=this.renderRoot.querySelectorAll(".event-title.title-scrollable")){const t=Array.from(e);od(t);const n=t.flatMap(e=>{const t=e.closest(".grid-event")?.dataset.gridTitleFit;if("compact"===t||"blank"===t||"measuring"===t)return[];const n=e.querySelector(".event-title-scroll");return n?[{title:e,content:n}]:[]}),i=this._titleMotion?.enhanced?n.filter(({content:e})=>"inline"===getComputedStyle(e).display).map(({content:e})=>({content:e,display:e.style.getPropertyValue("display"),priority:e.style.getPropertyPriority("display")})):[];for(const{content:e}of i)e.style.setProperty("display","inline-block","important");let r;try{r=n.map(({title:e,content:t})=>{const n=getComputedStyle(e);return{title:e,content:t,distance:t.offsetWidth-e.clientWidth,direction:"rtl"===n.direction?1:-1,signature:JSON.stringify([t.textContent,n.font,n.letterSpacing,n.wordSpacing,n.textTransform])}})}finally{for(const{content:e,display:t,priority:n}of i)t?e.style.setProperty("display",t,n):e.style.removeProperty("display")}r.forEach(({title:e,distance:t,direction:n})=>{if(t>1&&!e.classList.contains("empty-day-title")){const i=Math.max(4,t/(45*.7));e.style.setProperty("--calendar-card-title-scroll-distance",`${t}px`),e.style.setProperty("--calendar-card-title-scroll-direction",String(n)),e.style.setProperty("--calendar-card-title-scroll-duration",`${i.toFixed(2)}s`),e.classList.add("title-overflowing")}else e.classList.remove("title-overflowing"),e.style.removeProperty("--calendar-card-title-scroll-distance"),e.style.removeProperty("--calendar-card-title-scroll-direction"),e.style.removeProperty("--calendar-card-title-scroll-duration")}),this._titleMotion?.measure(r)}_stopTitleScrollObserver(e=!0){this._titleScrollObserver?.disconnect(),this._titleScrollObserver=null,this._titleScrollIntersectionObserver?.disconnect(),this._titleScrollIntersectionObserver=null,this._titleScrollMutations?.disconnect(),this._titleScrollMutations=null,this._titleScrollFontsCleanup?.(),this._titleScrollFontsCleanup=null,null!==this._titleScrollRaf&&(cancelAnimationFrame(this._titleScrollRaf),this._titleScrollRaf=null),e&&(this._titleMotion?.dispose(),this._titleMotion=null,this.renderRoot.querySelectorAll("[data-scroll-labels]").forEach(e=>{e.removeAttribute("data-scroll-labels")}),this.classList.remove("calendar-card-title-scroll-paused"))}getCustomStyles(){return function(e){const t={"--calendar-card-background-color":e.background_color,"--calendar-card-font-size-weekday":e.weekday_font_size,"--calendar-card-font-size-day":e.day_font_size,"--calendar-card-font-size-month":e.month_font_size,"--calendar-card-font-size-event":e.event_font_size,"--calendar-card-font-size-time":e.time_font_size,"--calendar-card-font-size-location":e.location_font_size,"--calendar-card-font-size-description":e.description_font_size,"--calendar-card-color-weekday":e.weekday_color,"--calendar-card-color-day":e.day_color,"--calendar-card-color-month":e.month_color,"--calendar-card-color-event":e.event_color,"--calendar-card-color-time":e.time_color,"--calendar-card-color-location":e.location_color,"--calendar-card-color-description":e.description_color,"--calendar-card-line-color-vertical":fl(e),"--calendar-card-line-width-vertical":e.vertical_line_width,"--calendar-card-day-spacing":e.day_spacing,"--calendar-card-event-spacing":e.event_spacing,"--calendar-card-past-event-opacity":String(e.past_event_opacity/100),"--calendar-card-spacing-additional":e.additional_card_spacing,"--calendar-card-height":e.height||"auto","--calendar-card-max-height":e.max_height,"--calendar-card-progress-bar-color":e.progress_bar_color,"--calendar-card-now-color":e.now_color,"--calendar-card-progress-bar-height":e.progress_bar_height,"--calendar-card-icon-size-time":e.time_icon_size||"14px","--calendar-card-icon-size-location":e.location_icon_size||"14px","--calendar-card-icon-size-description":e.description_icon_size||"14px","--calendar-card-description-max-lines":e.description_max_lines>0?String(e.description_max_lines):"none","--calendar-card-title-max-lines":e.title_max_lines>0?String(e.title_max_lines):"none","--calendar-card-grid-title-lines-compact":gl(e.title_max_lines,1),"--calendar-card-grid-title-lines-medium":gl(e.title_max_lines,2),"--calendar-card-grid-title-lines-expanded":gl(e.title_max_lines,3),"--calendar-card-time-max-lines":e.time_max_lines>0?String(e.time_max_lines):"none","--calendar-card-location-max-lines":e.location_max_lines>0?String(e.location_max_lines):"none","--calendar-card-title-display":e.title_max_lines>0?"-webkit-box":"inline","--calendar-card-time-display":e.time_max_lines>0?"-webkit-box":"inline","--calendar-card-date-column-width":bn(e.day_font_size,1.75),"--calendar-card-date-column-vertical-alignment":e.date_vertical_alignment,"--calendar-card-event-icon-vertical-alignment":"top"===e.event_icon_vertical_alignment?"flex-start":"bottom"===e.event_icon_vertical_alignment?"flex-end":"center","--calendar-card-event-border-radius":"calc(var(--ha-card-border-radius, 10px) / 2)","--ha-ripple-hover-opacity":"0.04","--ha-ripple-hover-color":fl(e),"--ha-ripple-pressed-opacity":"0.12","--ha-ripple-pressed-color":fl(e),"--calendar-card-today-indicator-color":e.today_indicator_color,"--calendar-card-today-indicator-size":e.today_indicator_size,"--calendar-card-week-number-font-size":e.week_number_font_size,"--calendar-card-week-number-color":e.week_number_color,"--calendar-card-week-number-bg-color":e.week_number_background_color,"--calendar-card-empty-day-color":e.empty_day_color===Ve.empty_day_color?"color-mix(in srgb, var(--primary-text-color) 60%, transparent)":e.empty_day_color,"--calendar-card-weather-date-icon-size":e.weather?.date?.icon_size||"14px","--calendar-card-weather-date-font-size":e.weather?.date?.font_size||"12px","--calendar-card-weather-date-color":e.weather?.date?.color||"var(--primary-text-color)","--calendar-card-weather-event-icon-size":e.weather?.event?.icon_size||"14px","--calendar-card-weather-event-font-size":e.weather?.event?.font_size||"12px","--calendar-card-weather-event-max-lines":(e.weather?.event?.max_lines??0)>0?String(e.weather?.event?.max_lines):"none","--calendar-card-weather-event-condition-display":(e.weather?.event?.max_lines??0)>0?"-webkit-inline-box":"inline"};for(const[n,i]of Ja)Nt(e[n])&&(t[i]=String(Ve[n]));return e.progress_bar_width&&(t["--calendar-card-progress-bar-width"]=e.progress_bar_width),e.title_font_size&&(t["--calendar-card-font-size-title"]=e.title_font_size),e.title_color&&(t["--calendar-card-color-title"]=e.title_color),_n(e)&&(t["--calendar-card-event-gap"]=e.event_gap),e.event_background_opacity>0&&(t["--calendar-card-event-accent-side-radius"]="var(--calendar-card-event-border-radius)",t["--calendar-card-event-accent-bar-inset"]="4px",t["--calendar-card-event-wash-hover"]="color-mix(in srgb, currentColor 6%, transparent)",t["--calendar-card-event-wash-pressed"]="color-mix(in srgb, currentColor 10%, transparent)"),e.weather?.event?.color&&!Nt(e.weather.event.color)&&(t["--calendar-card-weather-event-color"]=e.weather.event.color),t}(this.effectiveConfig)}_syncEntityColors(){var e;this.isConnected&&(Ot((e=this.config).accent_color)||(e.entities??[]).some(e=>"object"==typeof e&&null!==e&&Ot(e.accent_color))?function(e,t){if(!e)return;if(Jt.add(t),function(e){const t=e.connection;if(qt||!t||"function"!=typeof t.subscribeEvents)return;qt=()=>{};const n=++Gt;t.subscribeEvents(()=>{const t=Qt(e);t&&t.then(Xt)},"entity_registry_updated").then(e=>{n===Gt?qt=e:e()}).catch(()=>{n===Gt&&(qt=void 0)})}(e),Vt||Bt)return;const n=Qt(e);n&&(Bt=n.then(()=>{Bt=void 0,Xt()}))}(this.hass,this._onEntityColorsChanged):en(this._onEntityColorsChanged))}startRefreshTimer(){this._scheduleRefresh(Date.now()+this._refreshIntervalMs())}_scheduleRefresh(e){if(this._refreshTimerId&&(clearTimeout(this._refreshTimerId),this._refreshTimerId=void 0),!this.isConnected)return;const t=Math.min(Math.max(e-Date.now(),1e3),2**31-1);this._refreshTimerId=window.setTimeout(()=>{this._refreshTimerId=void 0,this.updateEvents("cache")},t),Be(`Scheduled next refresh in ${Math.round(t/1e3)}s`)}_refreshIntervalMs(){return Ys(this.config)}_scheduleWeatherSetup(){this._weatherSetupPending||(this._weatherSetupPending=!0,queueMicrotask(()=>{this._weatherSetupPending=!1,this.isConnected&&this._setupWeatherSubscriptions()}))}async _setupWeatherSubscriptions(){const e=++this._weatherSetupVersion;if(this._cleanupWeatherSubscriptions(),!this.config?.weather?.entity||!this.hass)return;const t=function(e){if(!e||!e.entity)return[];const t=Ya(e);return"none"===t?[]:"date"===t?["daily"]:["daily","hourly"]}(this.config.weather);for(const n of t){if(this._weatherSetupVersion!==e)return;const t=await Pa(this.hass,this.config,n,t=>{this._weatherSetupVersion===e&&(this.weatherForecasts={...this.weatherForecasts,[n]:t},this.requestUpdate())});if(this._weatherSetupVersion!==e)return void(t&&t());t&&this._weatherUnsubscribers.push(t)}}_cleanupWeatherSubscriptions(){const e=this._weatherUnsubscribers.length;e>0&&Be(`Unsubscribing ${e} weather forecast subscription(s)`),this._weatherUnsubscribers.forEach(e=>{try{"function"==typeof e&&e()}catch(e){Ne("Failed to unsubscribe weather forecast",e)}}),this._weatherUnsubscribers=[]}_releaseActivePointerCapture(){this._releasingPointerCapture=!0;try{if(this._pointerCaptureTarget&&null!==this._capturedPointerId&&this._pointerCaptureTarget.hasPointerCapture?.(this._capturedPointerId))try{this._pointerCaptureTarget.releasePointerCapture(this._capturedPointerId)}catch{}this._pointerCaptureTarget=null,this._capturedPointerId=null}finally{this._releasingPointerCapture=!1}}_captureActivePointer(e){this._releaseActivePointerCapture();const t=e.currentTarget;if(t instanceof Element&&"function"==typeof t.setPointerCapture)try{t.setPointerCapture(e.pointerId),this._pointerCaptureTarget=t,this._capturedPointerId=e.pointerId}catch{}}_handlePointerDown(e){if("number"==typeof e.button&&0!==e.button)return;const t=this._eventTapAt(e);(this._hasCardAction||t)&&!1!==e.isPrimary&&null===this._activePointerId&&(this._activePointerId=e.pointerId,this._pointerStart={x:e.clientX,y:e.clientY},this._pointerMoved=!1,this._holdTriggered=!1,this._pointerTapTarget=t??null,this._derivedClick=null,this._captureActivePointer(e),this._holdIndicator&&(di(this._holdIndicator),this._holdIndicator=null),this.config.hold_action&&"none"!==this.config.hold_action.action&&(this._holdTimer&&clearTimeout(this._holdTimer),this._holdTimer=window.setTimeout(()=>{this._activePointerId===e.pointerId&&(this._holdTriggered=!0,this._holdIndicator&&(di(this._holdIndicator),this._holdIndicator=null),this._holdIndicator=function(e,t){const n=document.createElement("div");n.style.position="fixed",n.style.pointerEvents="none",n.style.borderRadius="50%",n.style.backgroundColor=t.accent_color,n.style.opacity=`${_e.HOLD_INDICATOR_OPACITY}`,n.style.transform="translate(-50%, -50%) scale(0)",n.style.transition="transform 200ms ease-out",n.style.left=e.clientX+"px",n.style.top=e.clientY+"px";const i="touch"===e.pointerType?_e.HOLD_INDICATOR.TOUCH_SIZE:_e.HOLD_INDICATOR.POINTER_SIZE;return n.style.width=`${i}px`,n.style.height=`${i}px`,document.body.appendChild(n),setTimeout(()=>{n.style.transform="translate(-50%, -50%) scale(1)"},10),Be("Created hold indicator"),n}(e,this.config))},500)))}_handlePointerMove(e){if(e.pointerId!==this._activePointerId||this._pointerMoved||this._holdTriggered||!this._pointerStart)return;const t=e.clientX-this._pointerStart.x,n=e.clientY-this._pointerStart.y;Math.hypot(t,n)<=_e.POINTER_MOVE_TOLERANCE||(this._pointerMoved=!0,this._holdTimer&&(clearTimeout(this._holdTimer),this._holdTimer=null),this._holdIndicator&&(di(this._holdIndicator),this._holdIndicator=null))}_handlePointerUp(e){if(e.pointerId!==this._activePointerId)return;if("number"==typeof e.button&&0!==e.button)return;this._holdTimer&&(clearTimeout(this._holdTimer),this._holdTimer=null);const t=this._pointerTapTarget;let n=!1;!this._pointerMoved&&this._holdTriggered&&this.config.hold_action&&"none"!==this.config.hold_action.action?(Be("Executing hold action"),Gn(this,this.config,"hold",this._cardActionCallbacks)):this._pointerMoved||this._holdTriggered||!t?this._pointerMoved||this._holdTriggered||!this.config.tap_action||"none"===this.config.tap_action.action||(Be("Executing tap action"),Gn(this,this.config,"tap",this._cardActionCallbacks),n=!0):this._runEventTapAction(t.target);const i=t?t.element:n?null:void 0;this._derivedClick=void 0===i?null:{element:i,deadline:Date.now()+1e3},this._endGesture()}_handlePointerCancel(e){e.pointerId===this._activePointerId&&this._endGesture()}_endGesture(){this._holdTimer&&(clearTimeout(this._holdTimer),this._holdTimer=null),this._releaseActivePointerCapture(),this._activePointerId=null,this._pointerStart=null,this._pointerMoved=!1,this._holdTriggered=!1,this._pointerTapTarget=null,this._holdIndicator&&(di(this._holdIndicator),this._holdIndicator=null)}_handlePointerLeave(e){if(e.pointerId!==this._activePointerId)return;const t=e.currentTarget;t instanceof Element&&this._capturedPointerId===e.pointerId&&t.hasPointerCapture?.(e.pointerId)||this._handlePointerCancel(e)}_handleLostPointerCapture(e){this._releasingPointerCapture||e.pointerId!==this._activePointerId&&e.pointerId!==this._capturedPointerId||this._handlePointerCancel(e)}_handleKeyDown(e){if(!this._handleEventKeyDown(e)&&!(null!=e.currentTarget&&e.target!==e.currentTarget||"Enter"!==e.key&&" "!==e.key)){if(!this.config.tap_action||"none"===this.config.tap_action.action)return;e.preventDefault(),Gn(this,this.config,"tap",this._cardActionCallbacks)}}_handleEventKeyDown(e){if("Enter"!==e.key&&" "!==e.key)return!1;const t=this._eventsActivatable?hi(e.target):void 0;return!!t&&(e.preventDefault(),e.stopPropagation(),e.repeat||("Enter"===e.key?this._runEventTapAction(t):this._spaceArmedOn=e.target),!0)}_handleKeyUp(e){if(" "!==e.key)return;const t=this._spaceArmedOn;this._spaceArmedOn=null;const n=this._eventsActivatable?hi(e.target):void 0;n&&null!==t&&t===e.target&&(e.preventDefault(),e.stopPropagation(),this._runEventTapAction(n))}_handleClick(e){const t=this._eventTapAt(e),n=this._derivedClick;n&&Date.now()>n.deadline&&(this._derivedClick=null);const i=t?t.element:null;if(this._derivedClick&&(null===i||i===this._derivedClick.element))return this._derivedClick=null,void(t&&e.stopPropagation());t&&(e.stopPropagation(),this._runEventTapAction(t.target))}setConfig(e){const t=this.config,n=this._instanceId;for(const t of function(e){const t=e,n=[];for(const[e,i]of Object.entries(Ze))e in t&&n.push(`"${e}" was removed in v3.0.0 and is being ignored — use "${i}"`);const i=t.entities;return Array.isArray(i)&&i.forEach((e,t)=>{if("object"!=typeof e||null===e)return;const i=e;for(const[e,r]of Object.entries(Xe))e in i&&n.push(`"${e}" on entities[${t}] was removed in v3.0.0 and is being ignored — use "${r}"`)}),n}(e))Re(t);const i=Qe(Ve,e);var r;if(this.config=i,this.config.entities=(r=this.config.entities,Array.isArray(r)?r.map(e=>"string"==typeof e?{entity:e,color:void 0,accent_color:void 0,label_icon_color:void 0}:e&&"object"==typeof e&&e.entity?{entity:e.entity,label:e.label,label_type:$e(e.label_type)?e.label_type:void 0,color:e.color||void 0,accent_color:e.accent_color||void 0,label_icon_color:e.label_icon_color||void 0,show_time:e.show_time,show_location:e.show_location,location_icon:e.location_icon||void 0,show_description:e.show_description,compact_events_to_show:Ge(e.compact_events_to_show,0),blocklist:e.blocklist,allowlist:e.allowlist,filter_field:e.filter_field,replace_field:e.replace_field,replace_pattern:e.replace_pattern,replace_with:e.replace_with,split_multiday_events:e.split_multiday_events,event_type:e.event_type,days_of_week:e.days_of_week,allday_expires_at:e.allday_expires_at}:null).filter(Boolean):[]),nt(this.config),function(e){for(const t of ct)Tt(t,rt(e,t))}(this.config),Ct(this.config),function(e){const t=e.view;if(an.includes(t))return;const n=an.map(e=>`"${e}"`).join(" or ");Ne(`Ignoring "view: ${JSON.stringify(t)}": not a recognized view. Expected ${n}. Falling back to "list".`),e.view="list"}(this.config),function(e){for(const t of Object.keys(xn))Yn(e,t)}(this.config),this.config.time_grid){const e=mn(this.config,"start_time"),t=mn(this.config,"end_time");lo(e,t).usedFallback&&Ne(`Invalid time_grid time range "${e} - ${t}": expected HH:mm bounds with the end after the start (24:00 is allowed for the end). Falling back to ${ro}-${ao}.`);const n=this.config.time_grid.axis_width;void 0!==n&&hn(n).usedFallback&&Ne(`Invalid time_grid axis_width "${n}": expected a pixel length such as "128px", or "max-content". Other CSS lengths cannot be reserved before the grid is laid out, so the day columns would be fitted against the wrong axis width. Falling back to "max-content".`)}const a=this._syncDeviceChoice(e)&&null!==this._pageRequested;a&&this._requestPage(null);const o=qn(this.requestedView,this.config,this._measuredWidthPx,null===this._measuredWidthPx?null:{view:this._effectiveView,columns:this._columnCount});this._effectiveView=o.view,this._columnCount=o.columns,this._instanceId=Te(this.config.entities,Rn(this.config),this.config.start_date,this.config.first_day_of_week),this._instanceId!==n&&(this._setFailures([]),this._failureCountHint=0);const s=function(e,t){if(!e||0===Object.keys(e).length)return!0;const n=(e.entities||[]).map(e=>"string"==typeof e?e:e.entity).sort().join(","),i=(t.entities||[]).map(e=>"string"==typeof e?e:e.entity).sort().join(","),r=e?.refresh_interval!==t?.refresh_interval,a=n!==i||e.days_to_show!==t.days_to_show||e.start_date!==t.start_date||e.first_day_of_week!==t.first_day_of_week;return(a||r)&&Be("Configuration change requires data refresh"),a||r}(Wn(t),Wn(this.config));var l,d;s?(Be("Configuration changed, refreshing data"),this.updateEvents(this._appearLoadPending?"navigate":"network")):(l=t,d=this.config,l&&0!==Object.keys(l).length&&(Pt(l.entities)!==Pt(d.entities)||Ht.some(e=>l[e]!==d[e]))?(Be("Per-calendar configuration changed, reprocessing cached data"),this.updateEvents("reprocess")):a&&this._loadPage())}_syncDeviceChoice(e){const t=Qd(e);if(t===this._configFingerprint)return!1;this._configFingerprint=t;const n=this._wantsViewSwitcher?function(e,t=ec()){return ic(t)[e]?.view}(t):void 0;this._viewChoice=void 0!==n&&n!==this.config.view?n:null;const i=new Set(Pi(this.config.entities)),r=this._wantsLegend?function(e,t=ec()){return ic(t)[e]?.hidden??[]}(t).filter(e=>i.has(e)):[];return this._hiddenCalendars=r.length>0?new Set(r):fc,this._legendFold=null,!0}refreshEvents(e){return this.updateEvents("reload",e)}async updateEvents(e="cache",t){const n=!0===e?"network":!1===e?"cache":e;if(Be(`Updating events (${n})`),!this.isConnected)return;const i=++this._eventRequestGeneration,r=()=>i!==this._eventRequestGeneration;this.safeHass&&this._initialLoadRetryId&&(clearTimeout(this._initialLoadRetryId),this._initialLoadRetryId=void 0);const a=this.safeHass;if(!a||!this.config.entities.length)return this.isLoading=!1,void(a?(this._setFailures([]),this.isInitialLoad=!1):(this._initialLoadRetryId&&clearTimeout(this._initialLoadRetryId),this._initialLoadRetryId=window.setTimeout(()=>{this.updateEvents(n,t)},1500)));const o="navigate"===n;this._appearLoadPending=!1;const s=this._pageRequested,l=this._loadConfigForPage(s),d=this._instanceIdForPage(s),c=null===s?"persistent":"page";let u=null;if("network"!==n&&"reload"!==n)try{u=function(e,t,n,i="persistent"){const r=Jo(e,t,n,i),a=Bo(i,r.cacheKey);if(!a)return null;const o=Date.now();return{...Xo(a,rs(a,o),t,r.firstDayOfWeek),due:is(a,t,r.window,o),inFlight:Vo.has(r.signature)}}(a,l,d,c)}catch(e){Ne("Could not read cached events:",e)}null===u||"navigate"!==n&&"page"!==n&&"reprocess"!==n&&u.due||!u?o&&this.events.length>0&&!this._residentEventsDrawable()&&(this.events=[],this._eventsInstanceId="",this._setFailures([]),this.isInitialLoad=!0):(We(`Drawing ${u.events.length} cached events`),this._commitEvents(u,d,s));const h=u?Date.now()-u.fetchedAt:1/0;if(!(!u||u.inFlight||"reprocess"!==n&&u.due||o&&!0===l.refresh_on_navigate&&0===u.failedEntities.length&&h>=5e3)&&u)return this.isLoading=!1,void this._scheduleRefresh(u.nextAttemptAt);try{if(this.isLoading=!0,await this.updateComplete,r())return void Be("Discarding a superseded event request");const e=await Zo(a,l,d,"reload"===n?"reload":"network",this._failureCountHint,t,c);if(r())return void Be("Discarding a superseded event response");const i=e.failedEntities??[];i.length>0&&Ne(`Could not load calendar(s): ${i.join(", ")}`),this._failureCountHint=i.length>0?this._failureCountHint+1:0;const o=this._eventsInstanceId===d,u=864e5;i.length>0&&0===e.events.length&&this.events.length>0&&o&&Date.now()-this._eventsFetchedAt<u?(Ne("Refresh failed and returned nothing — keeping previously loaded events"),this._setFailures(i),this.isInitialLoad=!1):this._commitEvents(e,d,s),this.isLoading=!1,this._scheduleRefresh(e.nextAttemptAt??Date.now()+this._refreshIntervalMs()),0===i.length&&We("Event update completed successfully")}catch(e){if(r())return void Be("Ignoring a failure from a superseded event request");Ie("Failed to update events:",e),this._failureCountHint+=1,this._setFailures(Array.from(new Set(l.entities.map(e=>"string"==typeof e?e:e.entity)))),this.isLoading=!1,this.isInitialLoad=!1,this._scheduleRefresh(Date.now()+Math.min(6e4*2**Math.min(this._failureCountHint-1,20),this._refreshIntervalMs()))}}_commitEvents(e,t,n){const i=e.failedEntities??[];this.events=[...e.events??[]],this._eventsInstanceId=t,this._pageShown=n,this._eventsFetchedAt=e.loadedAt??e.fetchedAt??Date.now(),this._setFailures(i),this.isInitialLoad=!1,0===i.length&&(this._lastUpdateTime=Date.now(),this._failureCountHint=0)}_setFailures(e){const t=e.length!==this._failedEntities.length||e.some((e,t)=>e!==this._failedEntities[t]);this._failedEntities=[...e],this._hasFetchError=e.length>0,t&&this.requestUpdate()}_residentEventsDrawable(){if(""===this._eventsInstanceId)return!0;return this._eventsInstanceId===this._instanceIdForPage(this._pageRequested)&&Date.now()-this._eventsFetchedAt<864e5}hasCompactModeLimits(){if(!Dn(this.effectiveView))return!1;const e=e=>"number"==typeof e&&Number.isFinite(e),t=this.effectiveConfig;return!(!e(t.compact_events_to_show)&&!e(t.compact_days_to_show))||(t.entities??[]).some(t=>"object"==typeof t&&null!==t&&e(t.compact_events_to_show))}toggleExpanded(){this.hasCompactModeLimits()&&(this.isExpanded=!this.isExpanded)}handleAction(e){const t=e===this.config.hold_action?"hold":"tap";Gn(this,this.config,t,this._cardActionCallbacks)}render(){const e=this.getCustomStyles(),t={keyDown:e=>this._handleKeyDown(e),keyUp:e=>this._handleKeyUp(e),click:e=>this._handleClick(e),pointerDown:e=>this._handlePointerDown(e),pointerMove:e=>this._handlePointerMove(e),pointerUp:e=>this._handlePointerUp(e),pointerCancel:e=>this._handlePointerCancel(e),pointerLeave:e=>this._handlePointerLeave(e),lostPointerCapture:e=>this._handleLostPointerCapture(e)};let n,i=!1;const r=e=>{const t=this._shownColumnCount;if(this._wantsNavigation&&t>0&&t<this._viewDays){const t=this._pageRange(this._pageShown),n=t.start.getTime(),i=yd(t.start,t.days).getTime();return e.filter(e=>e.timestamp>=n&&e.timestamp<i)}if(t<=0||t>=e.length)return e;const n=function(e,t,n){if(t<=0||t>=e.length)return 0;const i=new Date(n.getFullYear(),n.getMonth(),n.getDate()).getTime(),r=e.findIndex(e=>e.timestamp>=i);return Math.min(-1===r?e.length:r,e.length-t)}(e,t,new Date);return e.slice(n,n+t)},a=e=>"list"===this.effectiveView?e:r(e),o=e=>"grid"===this.effectiveView?Vs(e,this.effectiveConfig,this.effectiveLanguage,this.weatherForecasts,this.safeHass,void 0,this._cascadeThresholdMin,this._overflowStripPct,this._eventsActivatable):"column"===this.effectiveView?dl(e,this.effectiveConfig,this.effectiveLanguage,this.weatherForecasts,this.safeHass,this._eventsActivatable):_l(e,this.effectiveConfig,this.effectiveLanguage,this.weatherForecasts,this.safeHass,this._eventsActivatable);if(this.isInitialLoad)n=cl("loading",this.effectiveLanguage);else if(this.safeHass&&this.config.entities.length)if(0===this.events.length&&this._hasFetchError)n=W``;else{const e=a(this.groupedEvents);n=o(e),i=this._eventsActivatable&&function(e,t,n){return"grid"===e?function(e,t){if(0===e.length)return!1;if(Us(e,mn(t,"allday_band_max_rows")).length>0)return!0;const n=lo(mn(t,"start_time"),mn(t,"end_time"));return e.some(e=>zs(e).timed.some(e=>_o(e.startMin,e.endMin,n)))}(t,n):t.some(e=>e.events.some(e=>!e._isEmptyDay))}(this.effectiveView,e,this.effectiveConfig)}else n=cl("error",this.effectiveLanguage);const s=this._headerToolbar();return function(e,t,n,i,r=!1,a=!1,o="list",s=!1,l=!1,d=U,c={},u=!1,h=!1,m="idle"){const p=s||l,_=s&&!u,g=Boolean(t||a)?W`<h1 class="card-header">${t}</h1>`:W`<div class="card-header-placeholder"></div>`,f=function(e,t){if(!(e.addEvent||e.viewSwitcher||e.navigation||e.reset||e.refresh||e.legend))return;const n=!0===e.labeled;return W`${al(e,n)}${sl(e,t)}`}(c,g),v=f?"header-container has-toolbar":"header-container",y=h?"content-container page-pending":"content-container",w=["calendar-card-pro",Sn(o),p?"card-interactive":""].filter(e=>""!==e).join(" ");return W`
    <ha-card
      class=${w}
      style=${yi(e)}
      tabindex=${s?"0":U}
      role=${_?"button":U}
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
    >
      ${p?W`<ha-ripple></ha-ripple>`:U}
      ${c.refresh?U:"done"===m||"failed"===m?(b=m,W`<div
    class=${`loading-indicator ${el[b]}`}
    aria-hidden="true"
  >
    <svg class="loading-indicator-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d=${tl[b]}></path>
    </svg>
  </div>`):r||"turning"===m?W`
                  <div class="loading-indicator" role="status" aria-live="polite" title="Loading">
                    <div class="spinner" aria-hidden="true"></div>
                  </div>
                `:U}

      <!-- Title is always rendered with the same structure, even if empty.
           A templated title holds the h1 open from first paint, so the header
           does not gain 16px of margin the moment its value arrives. That is a
           claim about the *pending* window only: once a value is in hand the
           header behaves exactly as it would for a static title of the same
           text, so a template resolving to an empty string collapses back to
           the zero-height placeholder rather than leaving an empty heading
           taking up space forever. -->
      <div class=${v}>
        ${f??g}
      </div>

      <!-- Content container is always present -->
      <div class=${y}>${n}</div>
      ${d}
    </ha-card>
  `;var b}(e,this.effectiveTitle,n,t,this.isLoading,this.isTitlePending,this.effectiveView,this._hasTapAction,this._hasHoldAction,this._renderFetchErrorNotice(),s,this._hostsControls(s,i),this._pageRequested!==this._pageShown&&!this.isInitialLoad,this._refreshPhase)}_headerToolbar(){const e=this._legend(),t={heading:this._monthHeading(void 0!==e&&!e.folded),navigation:this._dateNavigation(),legend:e,viewSwitcher:this._viewSwitcher(),reset:this._resetButton(),refresh:this._refreshButton(),addEvent:this._addEventButton()};return this._toolbarLabelMinWidthPx=this._toolbarLabelMinWidth(t),{labeled:this._toolbarLabeledFor(t),...t}}_toolbarLabeledFor(e){const t=this._toolbarLabelMinWidth(e);if(null===this._toolbarWidthPx||null===t)return!1;const n=this._toolbarLabelsOverflowed,i=this._toolbarLabelSignature(e);return!(n&&n.signature===i&&this._toolbarWidthPx<=n.widthPx)&&this._toolbarWidthPx>=t}_toolbarLabelMinWidth(e){if(!e.viewSwitcher)return null;const{TOOLBAR_COMMAND_WIDTH:t,TOOLBAR_COMMAND_GAP:n}=_e,i=e=>0===e?0:e*t+(e-1)*n,r=[e.legend?.folded?e.legend:void 0,e.addEvent],a=[e.reset,e.refresh],o=e=>e.filter(e=>void 0!==e).length;return _e.TOOLBAR_SWITCHER_LABEL_MIN_WIDTH+i(o(r))+i(o(a))}_toolbarLabelSignature(e){return[this.effectiveLanguage,e.viewSwitcher?"views":"",e.addEvent?"add":"",e.reset?"reset":"",e.refresh?"refresh":"",e.legend?.folded?"filter":""].join("\0")}_syncToolbarLabelFit(){const e=this.renderRoot.querySelector(".toolbar-actions");if(!e||!e.querySelector(".toolbar-button-label"))return;const t=e.getBoundingClientRect();if(0===t.width)return;const n=[...e.querySelectorAll(".toolbar-button, .view-switcher")].map(e=>e.getBoundingClientRect()).filter(e=>e.width>0&&e.height>0);if(0===n.length)return;const i=n.some(e=>e.right>t.right+.5||e.left<t.left-.5),r=Math.min(...n.map(e=>e.bottom)),a=n.some(e=>e.top>r-.5);(i||a)&&(Be(`View switcher words do not fit at ${this._toolbarWidthPx}px`),this._toolbarLabelsOverflowed={widthPx:this._toolbarWidthPx??0,signature:this._toolbarLabelSignature(this._headerToolbar())},this.requestUpdate())}_hostsControls(e,t){return void 0!==e.navigation||void 0!==e.legend||void 0!==e.viewSwitcher||void 0!==e.reset||void 0!==e.refresh||void 0!==e.addEvent||t}_renderFetchErrorNotice(){return this.isInitialLoad||0===this._failedEntities.length?U:function(e,t){const n=Ji(t);return W`
    <div class="fetch-error" role="status">
      <ha-icon class="fetch-error-icon" icon="mdi:alert-circle-outline"></ha-icon>
      <span class="fetch-error-text">${n.loadFailed} ${e.join(", ")}</span>
    </div>
  `}(this._failedEntities.map(e=>this._calendarName(e)),this.effectiveLanguage)}_calendarName(e){const t=this.hass?.states?.[e]?.attributes?.friendly_name;return"string"==typeof t&&""!==t.trim()?t:e}_haString(e){const t=this.hass?.localize?.(e);return t&&t!==e?t:void 0}_newEventDate(){const e=this._pageRange(this._pageShown);return function(e,t,n=new Date){const i=new Date(e);return i.setDate(i.getDate()+t),n>=e&&n<i?new Date(n):new Date(e)}(e.start,e.days)}_addEventButton(){const e=tt(this.config);if(!e.show||!e.addEvent)return;const t=function(e,t,n=[]){if(!e?.states)return[];const i=[];for(const r of t){const t="string"==typeof r?r:r?.entity;!t||i.includes(t)||n.includes(t)||Xn(e,t,1)&&i.push(t)}return i}(this.safeHass,this.config.entities,this._failedEntities);return 0!==t.length?{label:ai(this.safeHass),onActivate:()=>this._openCreateEventDialog(t[0])}:void 0}_openCreateEventDialog(e){var t,n;this._isBeingEdited?Be("Not opening the new-event dialog while the card is being edited"):(t=this,n={calendarId:e,selectedDate:this._newEventDate(),updated:()=>this._refreshAfterWrite({feature:1})},ii(Kn,{node:t,params:n,fallback:()=>function(e){Vn(e,{tap_action:{action:"navigate",navigation_path:"/calendar"}},"tap")}(t)}))}_monthHeading(e){if(!tt(this.config).show)return;const t=new Date,n=this.effectiveLanguage,i=this._pageRange(this._pageRequested,t),r=!e&&this._monthFormShort(),a=r?"short":"long";return{text:Cd(i.start,n,a),reserve:Ad(n,a),full:Ad(n,"long"),short:r,range:Sd(i,n,t)}}_monthFitSignature(){return[this.effectiveLanguage,this.effectiveView,String(this._toolbarFontGeneration),this._wantsNavigation?"navigation":"",String(this.config.title_font_size??"")].join("\0")}_monthFormShort(){const e=this._monthFit;return!(!e||null===this._toolbarWidthPx)&&e.signature===this._monthFitSignature()&&this._toolbarWidthPx<e.fullFromPx}_syncMonthFit(){if(!this.isConnected)return;const e=this.renderRoot.querySelector(".toolbar-heading"),t=e?.querySelector(".toolbar-month"),n=t?.querySelector(".toolbar-month-probe");if(!e||!t||!n)return;this._watchToolbarFonts();const i=this.getBoundingClientRect().width,r=n.getBoundingClientRect().width,a=e.getBoundingClientRect(),o=t.getBoundingClientRect();if(i<=0||r<=0||a.width<=0)return;const s=getComputedStyle(e),l=parseFloat(s.columnGap)||0,d=e.querySelector(".date-navigation"),c=e.querySelector(".toolbar-heading-end")?(d?.getBoundingClientRect().width??0)+l:0,u=i+r-(("rtl"===s.direction?o.right-a.left-(parseFloat(s.paddingLeft)||0):a.right-(parseFloat(s.paddingRight)||0)-o.left)-c)-.5,h=this._monthFormShort();this._monthFit={signature:this._monthFitSignature(),fullFromPx:u},this._monthFormShort()!==h&&(Be(`Month heading ${h?"fits in full":"shortened"} at ${Math.round(i)}px`),this.requestUpdate())}_syncHeadingMiddle(){const e=this.renderRoot.querySelector(".toolbar-heading"),t=e?.querySelector(".toolbar-month-cap");if(!e||!t)return;const n=e.getBoundingClientRect();if(n.height<=0)return;const i=t.getBoundingClientRect(),r=n.bottom-(parseFloat(getComputedStyle(e).paddingBottom)||0),a=`${Math.max(0,r-(i.top+i.bottom)/2).toFixed(2)}px`;e.style.getPropertyValue("--calendar-card-heading-middle")!==a&&e.style.setProperty("--calendar-card-heading-middle",a)}_dateNavigation(){if(!this._wantsNavigation)return;const e=new Date,t=this.effectiveLanguage,n=this._pageRange(this._pageRequested,e);return{homeName:Hd(this._homeRange(e),t,e),previousName:this._haString("ui.common.previous"),nextName:this._haString("ui.common.next"),inert:this._isBeingEdited,pickerValue:wd(n.start),homeConfirming:this._homeConfirming&&null===this._pageRequested,onPrevious:()=>this._stepPage(-1),onHome:()=>this._pressHome(),onNext:()=>this._stepPage(1),onPick:e=>this._pickDate(e)}}_pressHome(){const e=null!==this._pageRequested;this._goToPage(null),e&&null===this._pageRequested&&(clearTimeout(this._homeConfirmTimer),this._homeConfirming=!0,this._homeConfirmTimer=setTimeout(()=>{this._homeConfirmTimer=void 0,this._homeConfirming=!1,this.requestUpdate()},1e3))}_settleHomeConfirmation(){clearTimeout(this._homeConfirmTimer),this._homeConfirmTimer=void 0,this._homeConfirming=!1}_stepPage(e){const t=this._pageRange(this._pageRequested);this._goToPage(function(e,t,n){return yd(e,n*t)}(t.start,t.days,e))}_pickDate(e){if(!/^\d{4}-\d{2}-\d{2}$/.test(e))return;const t=bd(e);if(isNaN(t.getTime()))return;const n=this._homeRange();this._goToPage(kd(n,t)?null:function(e,t,n){const i=Math.max(1,n),r=oa(t.start,vd(e));return yd(t.start,Math.floor(r/i)*i)}(t,n,n.days))}_goToPage(e){if(this._isBeingEdited)return void Be("Not paging while the card is being edited");const t=wd(this._homeRange().start),n=null===e?null:wd(e),i=null===n||n===t?null:n;i!==this._pageRequested&&(Be(`Paging to ${i??"home"}`),this._requestPage(i),this.requestUpdate(),this._loadPage())}_requestPage(e){this._pageRequested=e,this._failureCountHint=0}_loadPage(){if(null===this._pageRequested&&this._homeStale)return this._homeStale=!1,void this.updateEvents("network");this.updateEvents("page")}_refreshButton(){const e=tt(this.config);if(e.show&&e.refresh)return{label:this._haString("ui.common.refresh"),phase:"idle"!==this._refreshPhase?this._refreshPhase:this.isLoading?"turning":"idle",unasked:"idle"===this._refreshPhase&&this.isLoading,onActivate:()=>{this._isBeingEdited?Be("Not refreshing from the toolbar while the card is being edited"):this._requestRefresh()}}}_requestRefresh(){if("idle"!==this._refreshPhase)return void Be("Not refreshing: the last refresh is still showing");if(this.isLoading||this.isInitialLoad)return void Be("Not refreshing: a load is already under way");Be("Refreshing on request");const e=++this._refreshTicket,t=Date.now();this._setRefreshPhase("turning");const n=this.refreshEvents(),i=this._eventRequestGeneration;n.then(()=>!1,()=>!0).then(n=>{e===this._refreshTicket&&(i!==this._eventRequestGeneration&&this.isLoading?this._refreshAwaitsLoad={ticket:e,startedAt:t}:this._showRefreshOutcome(t,n||this._hasFetchError))})}_showRefreshOutcome(e,t){const n=Math.max(0,1e3-(Date.now()-e));this._refreshPhaseTimer=setTimeout(()=>{this._setRefreshPhase(t?"failed":"done"),this._refreshPhaseTimer=setTimeout(()=>this._settleRefreshPhase(),1500)},n)}_syncReplacedRefresh(){const e=this._refreshAwaitsLoad;e&&!this.isLoading&&(this._refreshAwaitsLoad=null,e.ticket===this._refreshTicket&&this._showRefreshOutcome(e.startedAt,this._hasFetchError))}_setRefreshPhase(e){this._refreshPhase=e,this.requestUpdate()}_settleRefreshPhase(){this._refreshTicket++,this._refreshAwaitsLoad=null,clearTimeout(this._refreshPhaseTimer),this._refreshPhaseTimer=void 0,"idle"!==this._refreshPhase&&this._setRefreshPhase("idle")}get _wantsLegend(){const e=tt(this.config);return e.show&&!1!==e.legend}get _wantsLegendChips(){const e=tt(this.config);return e.show&&"chips"===e.legend}_legend(){if(!this._wantsLegend)return;const e=Pi(this.config.entities);if(0===e.length)return;const t=this._activeHiddenCalendars,n=Zt(),i=e.map(e=>({id:e,name:this._calendarName(e),color:bs(e,this.effectiveConfig,void 0,void 0,n),shown:!t.has(e)}));return{calendars:i,name:this._haString("ui.components.calendar.my_calendars"),folded:!this._wantsLegendChips||this._legendFoldedFor(this._legendSignature(i)),inert:this._isBeingEdited,onToggle:e=>this._toggleCalendar(e)}}_legendSignature(e){return[this.effectiveLanguage,this.effectiveView,String(this._toolbarFontGeneration),this._wantsNavigation?"navigation":"",String(this.config.title_font_size??""),...e.map(e=>`${e.id}${e.name}`)].join("\0")}_legendFoldedFor(e){const t=this._legendFold;return!(!t||t.signature!==e)&&(null===this._legendWidthPx||this._legendWidthPx<t.unfoldAtPx)}_legendMenuMayStayOpen(){return!(!this._wantsLegend||this._isBeingEdited||this.hidden)&&!0===this._legend()?.folded}_toggleCalendar(e){if(this._isBeingEdited)return void Be("Not hiding calendars while the card is being edited");if(!this._wantsLegend)return;const t=new Set(this._hiddenCalendars);t.has(e)?t.delete(e):t.add(e),this._hiddenCalendars=t.size>0?t:fc,null!==this._configFingerprint&&function(e,t,n=ec(),i=Date.now()){ac(e,{hidden:nc(t)},n,i)}(this._configFingerprint,[...t]),this._announceHiddenCalendars([...t]),Be(`${t.has(e)?"Hid":"Showed"} ${e}`),this.requestUpdate()}_announceHiddenCalendars(e){if(null===this._configFingerprint)return;const t={fingerprint:this._configFingerprint,hidden:e,source:this};window.dispatchEvent(new CustomEvent(bi,{detail:t}))}_syncLegendFit(e=!0){if(!this.isConnected||!this._wantsLegendChips)return;this._watchToolbarFonts();const t=this.getBoundingClientRect().width;if(t<=0)return;if(e||null===this._legendWidthPx)this._legendWidthPx=t;else if(Math.abs(t-this._legendWidthPx)>.5)return void this._scheduleLegendFit();const n=this.renderRoot.querySelector(".toolbar-legend"),i=n?.querySelector(".legend-chips");if(!n||!i){const n=null!==this.renderRoot.querySelector(".legend-button");return void(e&&n&&!1===this._legend()?.folded&&(this._legendUnfoldedAtPx=t,this.requestUpdate()))}const r=i.getBoundingClientRect().width,a=this._legendChipsRoom(n);if(r<=0||null===a)return;if(r<=a+.5)return void(this._legendUnfoldedAtPx=null);const o=this._legend();if(!o)return;const s=Math.ceil(t+r-a)+_e.LEGEND_UNFOLD_MARGIN;this._legendWidthPx=t,this._legendFold={signature:this._legendSignature(o.calendars),unfoldAtPx:Math.max(s,(this._legendUnfoldedAtPx??0)+1)},this._legendUnfoldedAtPx=null,Be(`Legend chips need ${Math.ceil(r)}px of ${Math.floor(a)}px; folded until ${this._legendFold.unfoldAtPx}px`),this.requestUpdate()}_legendChipsRoom(e){const t=e.parentElement,n=t?.querySelector(".toolbar-month-probe");if(!t||!n)return null;const i=t.getBoundingClientRect().width,r=n.getBoundingClientRect().width;if(i<=0||r<=0)return null;const a=getComputedStyle(t),o=getComputedStyle(e),s=e=>parseFloat(e)||0,l=t.querySelector(".date-navigation"),d=t.querySelector(".toolbar-month"),c=d?s(getComputedStyle(d).marginInlineStart):0;return i-s(a.paddingLeft)-s(a.paddingRight)-(r+c)-(l?.getBoundingClientRect().width??0)-2*s(a.columnGap)-s(o.paddingLeft)-s(o.paddingRight)-s(o.marginLeft)-s(o.marginRight)}_scheduleLegendFit(){this._wantsLegendChips&&null===this._legendFitRaf&&(this._legendFitRaf=requestAnimationFrame(()=>{this._legendFitRaf=null,this._syncLegendFit()}))}_watchToolbarFonts(){if(this._toolbarFontsCleanup)return;const e="undefined"==typeof document?void 0:document.fonts;if(!e||"function"!=typeof e.addEventListener)return;const t=()=>{this.isConnected&&tt(this.config).show&&(this._toolbarFontGeneration++,this.requestUpdate())};e.addEventListener("loadingdone",t),this._toolbarFontsCleanup=()=>e.removeEventListener("loadingdone",t)}get _wantsViewSwitcher(){const e=tt(this.config);return e.show&&e.viewSwitcher}_viewFits(e){return!on.has(e)||e===this._effectiveView||Un(e,this.config,this._measuredWidthPx).view===e}_offeredViewsKey(){return this._wantsViewSwitcher?an.filter(e=>this._viewFits(e)).join(","):""}_viewSwitcher(){if(!this._wantsViewSwitcher)return;const e=this._isBeingEdited,t=Ji(this.effectiveLanguage),n=an.map(n=>({view:n,label:t[Ks[n]],available:e||this._viewFits(n)}));return n.filter(e=>e.available).length<2?void 0:{views:n,selected:this.effectiveView,onSelect:e=>this._chooseView(e)}}_chooseView(e){if(this._isBeingEdited)return void Be("Not switching views while the card is being edited");if(!this._wantsViewSwitcher||!this._viewFits(e))return;const t=e===this.config.view?null:e;if(null!==this._configFingerprint&&function(e,t,n=ec(),i=Date.now()){ac(e,{view:t},n,i)}(this._configFingerprint,t??void 0),t===this._viewChoice&&e===this._effectiveView)return;this._viewChoice=t;const n=Un(this.requestedView,this.config,this._measuredWidthPx);Be(`Switched to ${e}, drawn as ${n.view}/${n.columns}`),this._effectiveView=n.view,this._columnCount=n.columns,this.requestUpdate()}get _hasExpandAction(){const e=this.config.tap_action,t=this.config.hold_action;return"expand"===e?.action||"expand"===t?.action}get _wantsReset(){const e=tt(this.config);return!(!e.show||!e.reset)&&(e.navigation||e.viewSwitcher||!1!==e.legend||this._hasExpandAction)}get _differsFromConfiguration(){return!this._isBeingEdited&&(null!==this._pageRequested||null!==this._viewChoice||this._activeHiddenCalendars.size>0||this.isExpanded&&this.hasCompactModeLimits())}_resetButton(){if(this._wantsReset)return{label:this._haString("ui.common.reset"),active:this._differsFromConfiguration,confirmation:this._resetConfirmation??void 0,onActivate:()=>this._resetToConfiguration()}}_confirmReset(){clearTimeout(this._resetConfirmTimer),this._resetConfirmation="showing",this._resetConfirmTimer=setTimeout(()=>{this._resetConfirmation="leaving",this.requestUpdate(),this._resetConfirmTimer=setTimeout(()=>{this._resetConfirmTimer=void 0,this._resetConfirmation=null,this.requestUpdate()},200)},1e3)}_settleResetConfirmation(){clearTimeout(this._resetConfirmTimer),this._resetConfirmTimer=void 0,this._resetConfirmation=null}_resetToConfiguration(){if(this._isBeingEdited)Be("Not resetting while the card is being edited");else if(this._wantsReset){if(Be("Resetting to the configuration"),null!==this._configFingerprint&&function(e,t=ec()){const n=ic(t);Object.prototype.hasOwnProperty.call(n,e)&&(delete n[e],rc(t,n))}(this._configFingerprint),null!==this._viewChoice){this._viewChoice=null;const e=Un(this.requestedView,this.config,this._measuredWidthPx);this._effectiveView=e.view,this._columnCount=e.columns}this._hiddenCalendars.size>0&&(this._hiddenCalendars=fc,this._announceHiddenCalendars([])),this.isExpanded=!1,this._goToPage(null),this._confirmReset(),this.requestUpdate()}}};yc.getStubConfig=jt,lc([he({attribute:!1})],yc.prototype,"hass",2),lc([he({attribute:!1})],yc.prototype,"config",2),lc([he({attribute:!1})],yc.prototype,"events",2),lc([he({attribute:!1})],yc.prototype,"isInitialLoad",2),lc([he({attribute:!1})],yc.prototype,"isLoading",2),lc([he({attribute:!1})],yc.prototype,"isExpanded",2),lc([he({attribute:!1})],yc.prototype,"weatherForecasts",2),lc([he({attribute:!1})],yc.prototype,"renderedTitle",2),lc([he({type:Boolean})],yc.prototype,"preview",2),lc([he({type:Boolean})],yc.prototype,"editMode",2),yc=lc([(e=>(t,n)=>{void 0!==n?n.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)})("calendar-card-pro")],yc);const wc=customElements.get("calendar-card-pro");wc&&(wc.getStubConfig=jt),window.customCards=window.customCards||[],window.customCards.push({type:"calendar-card-pro",name:"Calendar Card Pro",preview:!0,description:"A calendar card that supports multiple calendars with individual styling.",documentationURL:"https://github.com/alexpfau/calendar-card-pro",getEntitySuggestion:function(e,t){if("string"!=typeof t||"calendar"!==t.split(".")[0])return null;if(!e||"object"!=typeof e)return null;const n=e.states;return n&&"object"==typeof n&&n[t]?[{config:{...Ft([t]),grid_options:{...zt}}},{label:"Columns",config:{...Ft([t]),view:"column",grid_options:{...zt}}},{label:"Time Grid",config:{...Ft([t]),view:"grid",grid_options:{...zt}}}]:null}});export{gc as GRID_DETAIL_ROWS,dc as adoptEditorComponent,_c as fittedGridDetailLines,mc as gridContentOverflows,pc as resolveLineHeightPx};
