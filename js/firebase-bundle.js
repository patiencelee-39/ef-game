!function(){"use strict";var e={};
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */const t="${JSCORE_VERSION}",n=function(e,t){if(!e)throw i(t)},i=function(e){return new Error("Firebase Database ("+t+") INTERNAL ASSERT FAILED: "+e)},s=function(e){const t=[];let n=0;for(let i=0;i<e.length;i++){let s=e.charCodeAt(i);s<128?t[n++]=s:s<2048?(t[n++]=s>>6|192,t[n++]=63&s|128):55296==(64512&s)&&i+1<e.length&&56320==(64512&e.charCodeAt(i+1))?(s=65536+((1023&s)<<10)+(1023&e.charCodeAt(++i)),t[n++]=s>>18|240,t[n++]=s>>12&63|128,t[n++]=s>>6&63|128,t[n++]=63&s|128):(t[n++]=s>>12|224,t[n++]=s>>6&63|128,t[n++]=63&s|128)}return t},r={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:"function"==typeof atob,encodeByteArray(e,t){if(!Array.isArray(e))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=t?this.byteToCharMapWebSafe_:this.byteToCharMap_,i=[];for(let s=0;s<e.length;s+=3){const t=e[s],r=s+1<e.length,o=r?e[s+1]:0,a=s+2<e.length,c=a?e[s+2]:0,h=t>>2,l=(3&t)<<4|o>>4;let u=(15&o)<<2|c>>6,d=63&c;a||(d=64,r||(u=64)),i.push(n[h],n[l],n[u],n[d])}return i.join("")},encodeString(e,t){return this.HAS_NATIVE_SUPPORT&&!t?btoa(e):this.encodeByteArray(s(e),t)},decodeString(e,t){return this.HAS_NATIVE_SUPPORT&&!t?atob(e):function(e){const t=[];let n=0,i=0;for(;n<e.length;){const s=e[n++];if(s<128)t[i++]=String.fromCharCode(s);else if(s>191&&s<224){const r=e[n++];t[i++]=String.fromCharCode((31&s)<<6|63&r)}else if(s>239&&s<365){const r=((7&s)<<18|(63&e[n++])<<12|(63&e[n++])<<6|63&e[n++])-65536;t[i++]=String.fromCharCode(55296+(r>>10)),t[i++]=String.fromCharCode(56320+(1023&r))}else{const r=e[n++],o=e[n++];t[i++]=String.fromCharCode((15&s)<<12|(63&r)<<6|63&o)}}return t.join("")}(this.decodeStringToByteArray(e,t))},decodeStringToByteArray(e,t){this.init_();const n=t?this.charToByteMapWebSafe_:this.charToByteMap_,i=[];for(let s=0;s<e.length;){const t=n[e.charAt(s++)],r=s<e.length?n[e.charAt(s)]:0;++s;const a=s<e.length?n[e.charAt(s)]:64;++s;const c=s<e.length?n[e.charAt(s)]:64;if(++s,null==t||null==r||null==a||null==c)throw new o;const h=t<<2|r>>4;if(i.push(h),64!==a){const e=r<<4&240|a>>2;if(i.push(e),64!==c){const e=a<<6&192|c;i.push(e)}}}return i},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let e=0;e<this.ENCODED_VALS.length;e++)this.byteToCharMap_[e]=this.ENCODED_VALS.charAt(e),this.charToByteMap_[this.byteToCharMap_[e]]=e,this.byteToCharMapWebSafe_[e]=this.ENCODED_VALS_WEBSAFE.charAt(e),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[e]]=e,e>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(e)]=e,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(e)]=e)}}};
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class o extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const a=function(e){const t=s(e);return r.encodeByteArray(t,!0)},c=function(e){return a(e).replace(/\./g,"")},h=function(e){try{return r.decodeString(e,!0)}catch(t){console.error("base64Decode failed: ",t)}return null};
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
function l(e){return u(void 0,e)}function u(e,t){if(!(t instanceof Object))return t;switch(t.constructor){case Date:return new Date(t.getTime());case Object:void 0===e&&(e={});break;case Array:e=[];break;default:return t}for(const n in t)t.hasOwnProperty(n)&&d(n)&&(e[n]=u(e[n],t[n]));return e}function d(e){return"__proto__"!==e}
/**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
/**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
const f=()=>function(){if("undefined"!=typeof self)return self;if("undefined"!=typeof window)return window;if("undefined"!=typeof global)return global;throw new Error("Unable to locate global object.")}().__FIREBASE_DEFAULTS__,p=()=>{try{return f()||(()=>{if("undefined"==typeof process)return;const t=e.__FIREBASE_DEFAULTS__;return t?JSON.parse(t):void 0})()||(()=>{if("undefined"==typeof document)return;let e;try{e=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch(n){return}const t=e&&h(e[1]);return t&&JSON.parse(t)})()}catch(t){return void console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`)}},g=e=>{var t,n;return null===(n=null===(t=p())||void 0===t?void 0:t.emulatorHosts)||void 0===n?void 0:n[e]},m=e=>{const t=g(e);if(!t)return;const n=t.lastIndexOf(":");if(n<=0||n+1===t.length)throw new Error(`Invalid host ${t} with no separate hostname and port!`);const i=parseInt(t.substring(n+1),10);return"["===t[0]?[t.substring(1,n-1),i]:[t.substring(0,n),i]},_=()=>{var e;return null===(e=p())||void 0===e?void 0:e.config},y=e=>{var t;return null===(t=p())||void 0===t?void 0:t[`_${e}`]};
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
class v{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,n)=>{t?this.reject(t):this.resolve(n),"function"==typeof e&&(this.promise.catch(()=>{}),1===e.length?e(t):e(t,n))}}}
/**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */function w(e,t){if(e.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const n=t||"demo-project",i=e.iat||0,s=e.sub||e.user_id;if(!s)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const r=Object.assign({iss:`https://securetoken.google.com/${n}`,aud:n,iat:i,exp:i+3600,auth_time:i,sub:s,user_id:s,firebase:{sign_in_provider:"custom",identities:{}}},e);return[c(JSON.stringify({alg:"none",type:"JWT"})),c(JSON.stringify(r)),""].join(".")}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */function T(){return"undefined"!=typeof navigator&&"string"==typeof navigator.userAgent?navigator.userAgent:""}function I(){return"undefined"!=typeof window&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(T())}function b(){return"object"==typeof navigator&&"ReactNative"===navigator.product}function C(){return!function(){var e;const t=null===(e=p())||void 0===e?void 0:e.forceEnvironment;if("node"===t)return!0;if("browser"===t)return!1;try{return"[object process]"===Object.prototype.toString.call(global.process)}catch(n){return!1}}()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}class E extends Error{constructor(e,t,n){super(t),this.code=e,this.customData=n,this.name="FirebaseError",Object.setPrototypeOf(this,E.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,S.prototype.create)}}class S{constructor(e,t,n){this.service=e,this.serviceName=t,this.errors=n}create(e,...t){const n=t[0]||{},i=`${this.service}/${e}`,s=this.errors[e],r=s?function(e,t){return e.replace(k,(e,n)=>{const i=t[n];return null!=i?String(i):`<${n}?>`})}(s,n):"Error",o=`${this.serviceName}: ${r} (${i}).`;return new E(i,o,n)}}const k=/\{\$([^}]+)}/g;
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */function N(e){return JSON.parse(e)}function A(e){return JSON.stringify(e)}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */const R=function(e){let t={},n={},i={},s="";try{const r=e.split(".");t=N(h(r[0])||""),n=N(h(r[1])||""),s=r[2],i=n.d||{},delete n.d}catch(r){}return{header:t,claims:n,data:i,signature:s}};
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
function P(e,t){return Object.prototype.hasOwnProperty.call(e,t)}function D(e,t){return Object.prototype.hasOwnProperty.call(e,t)?e[t]:void 0}function x(e){for(const t in e)if(Object.prototype.hasOwnProperty.call(e,t))return!1;return!0}function O(e,t,n){const i={};for(const s in e)Object.prototype.hasOwnProperty.call(e,s)&&(i[s]=t.call(n,e[s],s,e));return i}function L(e,t){if(e===t)return!0;const n=Object.keys(e),i=Object.keys(t);for(const s of n){if(!i.includes(s))return!1;const n=e[s],r=t[s];if(M(n)&&M(r)){if(!L(n,r))return!1}else if(n!==r)return!1}for(const s of i)if(!n.includes(s))return!1;return!0}function M(e){return null!==e&&"object"==typeof e}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */function F(e){const t=[];for(const[n,i]of Object.entries(e))Array.isArray(i)?i.forEach(e=>{t.push(encodeURIComponent(n)+"="+encodeURIComponent(e))}):t.push(encodeURIComponent(n)+"="+encodeURIComponent(i));return t.length?"&"+t.join("&"):""}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class U{constructor(){this.chain_=[],this.buf_=[],this.W_=[],this.pad_=[],this.inbuf_=0,this.total_=0,this.blockSize=64,this.pad_[0]=128;for(let e=1;e<this.blockSize;++e)this.pad_[e]=0;this.reset()}reset(){this.chain_[0]=1732584193,this.chain_[1]=4023233417,this.chain_[2]=2562383102,this.chain_[3]=271733878,this.chain_[4]=3285377520,this.inbuf_=0,this.total_=0}compress_(e,t){t||(t=0);const n=this.W_;if("string"==typeof e)for(let l=0;l<16;l++)n[l]=e.charCodeAt(t)<<24|e.charCodeAt(t+1)<<16|e.charCodeAt(t+2)<<8|e.charCodeAt(t+3),t+=4;else for(let l=0;l<16;l++)n[l]=e[t]<<24|e[t+1]<<16|e[t+2]<<8|e[t+3],t+=4;for(let l=16;l<80;l++){const e=n[l-3]^n[l-8]^n[l-14]^n[l-16];n[l]=4294967295&(e<<1|e>>>31)}let i,s,r=this.chain_[0],o=this.chain_[1],a=this.chain_[2],c=this.chain_[3],h=this.chain_[4];for(let l=0;l<80;l++){l<40?l<20?(i=c^o&(a^c),s=1518500249):(i=o^a^c,s=1859775393):l<60?(i=o&a|c&(o|a),s=2400959708):(i=o^a^c,s=3395469782);const e=(r<<5|r>>>27)+i+h+s+n[l]&4294967295;h=c,c=a,a=4294967295&(o<<30|o>>>2),o=r,r=e}this.chain_[0]=this.chain_[0]+r&4294967295,this.chain_[1]=this.chain_[1]+o&4294967295,this.chain_[2]=this.chain_[2]+a&4294967295,this.chain_[3]=this.chain_[3]+c&4294967295,this.chain_[4]=this.chain_[4]+h&4294967295}update(e,t){if(null==e)return;void 0===t&&(t=e.length);const n=t-this.blockSize;let i=0;const s=this.buf_;let r=this.inbuf_;for(;i<t;){if(0===r)for(;i<=n;)this.compress_(e,i),i+=this.blockSize;if("string"==typeof e){for(;i<t;)if(s[r]=e.charCodeAt(i),++r,++i,r===this.blockSize){this.compress_(s),r=0;break}}else for(;i<t;)if(s[r]=e[i],++r,++i,r===this.blockSize){this.compress_(s),r=0;break}}this.inbuf_=r,this.total_+=t}digest(){const e=[];let t=8*this.total_;this.inbuf_<56?this.update(this.pad_,56-this.inbuf_):this.update(this.pad_,this.blockSize-(this.inbuf_-56));for(let i=this.blockSize-1;i>=56;i--)this.buf_[i]=255&t,t/=256;this.compress_(this.buf_);let n=0;for(let i=0;i<5;i++)for(let t=24;t>=0;t-=8)e[n]=this.chain_[i]>>t&255,++n;return e}}class V{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(e=>{this.error(e)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,n){let i;if(void 0===e&&void 0===t&&void 0===n)throw new Error("Missing Observer.");i=function(e,t){if("object"!=typeof e||null===e)return!1;for(const n of t)if(n in e&&"function"==typeof e[n])return!0;return!1}(e,["next","error","complete"])?e:{next:e,error:t,complete:n},void 0===i.next&&(i.next=q),void 0===i.error&&(i.error=q),void 0===i.complete&&(i.complete=q);const s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?i.error(this.finalError):i.complete()}catch(e){}}),this.observers.push(i),s}unsubscribeOne(e){void 0!==this.observers&&void 0!==this.observers[e]&&(delete this.observers[e],this.observerCount-=1,0===this.observerCount&&void 0!==this.onNoObservers&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(void 0!==this.observers&&void 0!==this.observers[e])try{t(this.observers[e])}catch(n){"undefined"!=typeof console&&console.error&&console.error(n)}})}close(e){this.finalized||(this.finalized=!0,void 0!==e&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function q(){}function j(e,t){return`${e} failed: ${t} argument `}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */const B=function(e){let t=0;for(let n=0;n<e.length;n++){const i=e.charCodeAt(n);i<128?t++:i<2048?t+=2:i>=55296&&i<=56319?(t+=4,n++):t+=3}return t};
/**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
function z(e){return e&&e._delegate?e._delegate:e}class ${constructor(e,t,n){this.name=e,this.instanceFactory=t,this.type=n,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}
/**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */const W="[DEFAULT]";
/**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class H{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const e=new v;if(this.instancesDeferred.set(t,e),this.isInitialized(t)||this.shouldAutoInitialize())try{const n=this.getOrInitializeService({instanceIdentifier:t});n&&e.resolve(n)}catch(n){}}return this.instancesDeferred.get(t).promise}getImmediate(e){var t;const n=this.normalizeInstanceIdentifier(null==e?void 0:e.identifier),i=null!==(t=null==e?void 0:e.optional)&&void 0!==t&&t;if(!this.isInitialized(n)&&!this.shouldAutoInitialize()){if(i)return null;throw Error(`Service ${this.name} is not available`)}try{return this.getOrInitializeService({instanceIdentifier:n})}catch(s){if(i)return null;throw s}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,this.shouldAutoInitialize()){if(function(e){return"EAGER"===e.instantiationMode}
/**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */(e))try{this.getOrInitializeService({instanceIdentifier:W})}catch(t){}for(const[e,n]of this.instancesDeferred.entries()){const i=this.normalizeInstanceIdentifier(e);try{const e=this.getOrInitializeService({instanceIdentifier:i});n.resolve(e)}catch(t){}}}}clearInstance(e=W){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(e=>"INTERNAL"in e).map(e=>e.INTERNAL.delete()),...e.filter(e=>"_delete"in e).map(e=>e._delete())])}isComponentSet(){return null!=this.component}isInitialized(e=W){return this.instances.has(e)}getOptions(e=W){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,n=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(n))throw Error(`${this.name}(${n}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const i=this.getOrInitializeService({instanceIdentifier:n,options:t});for(const[s,r]of this.instancesDeferred.entries()){n===this.normalizeInstanceIdentifier(s)&&r.resolve(i)}return i}onInit(e,t){var n;const i=this.normalizeInstanceIdentifier(t),s=null!==(n=this.onInitCallbacks.get(i))&&void 0!==n?n:new Set;s.add(e),this.onInitCallbacks.set(i,s);const r=this.instances.get(i);return r&&e(r,i),()=>{s.delete(e)}}invokeOnInitCallbacks(e,t){const n=this.onInitCallbacks.get(t);if(n)for(const s of n)try{s(e,t)}catch(i){}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let n=this.instances.get(e);if(!n&&this.component&&(n=this.component.instanceFactory(this.container,{instanceIdentifier:(i=e,i===W?void 0:i),options:t}),this.instances.set(e,n),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(n,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,n)}catch(s){}var i;return n||null}normalizeInstanceIdentifier(e=W){return this.component?this.component.multipleInstances?e:W:e}shouldAutoInitialize(){return!!this.component&&"EXPLICIT"!==this.component.instantiationMode}}class K{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new H(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */var G,Q;(Q=G||(G={}))[Q.DEBUG=0]="DEBUG",Q[Q.VERBOSE=1]="VERBOSE",Q[Q.INFO=2]="INFO",Q[Q.WARN=3]="WARN",Q[Q.ERROR=4]="ERROR",Q[Q.SILENT=5]="SILENT";const Y={debug:G.DEBUG,verbose:G.VERBOSE,info:G.INFO,warn:G.WARN,error:G.ERROR,silent:G.SILENT},J=G.INFO,X={[G.DEBUG]:"log",[G.VERBOSE]:"log",[G.INFO]:"info",[G.WARN]:"warn",[G.ERROR]:"error"},Z=(e,t,...n)=>{if(t<e.logLevel)return;const i=(new Date).toISOString(),s=X[t];if(!s)throw new Error(`Attempted to log a message with an invalid logType (value: ${t})`);console[s](`[${i}]  ${e.name}:`,...n)};class ee{constructor(e){this.name=e,this._logLevel=J,this._logHandler=Z,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in G))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel="string"==typeof e?Y[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if("function"!=typeof e)throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,G.DEBUG,...e),this._logHandler(this,G.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,G.VERBOSE,...e),this._logHandler(this,G.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,G.INFO,...e),this._logHandler(this,G.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,G.WARN,...e),this._logHandler(this,G.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,G.ERROR,...e),this._logHandler(this,G.ERROR,...e)}}let te,ne;const ie=new WeakMap,se=new WeakMap,re=new WeakMap,oe=new WeakMap,ae=new WeakMap;let ce={get(e,t,n){if(e instanceof IDBTransaction){if("done"===t)return se.get(e);if("objectStoreNames"===t)return e.objectStoreNames||re.get(e);if("store"===t)return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return ue(e[t])},set:(e,t,n)=>(e[t]=n,!0),has:(e,t)=>e instanceof IDBTransaction&&("done"===t||"store"===t)||t in e};function he(e){return e!==IDBDatabase.prototype.transaction||"objectStoreNames"in IDBTransaction.prototype?(ne||(ne=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])).includes(e)?function(...t){return e.apply(de(this),t),ue(ie.get(this))}:function(...t){return ue(e.apply(de(this),t))}:function(t,...n){const i=e.call(de(this),t,...n);return re.set(i,t.sort?t.sort():[t]),ue(i)}}function le(e){return"function"==typeof e?he(e):(e instanceof IDBTransaction&&function(e){if(se.has(e))return;const t=new Promise((t,n)=>{const i=()=>{e.removeEventListener("complete",s),e.removeEventListener("error",r),e.removeEventListener("abort",r)},s=()=>{t(),i()},r=()=>{n(e.error||new DOMException("AbortError","AbortError")),i()};e.addEventListener("complete",s),e.addEventListener("error",r),e.addEventListener("abort",r)});se.set(e,t)}(e),t=e,(te||(te=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])).some(e=>t instanceof e)?new Proxy(e,ce):e);var t}function ue(e){if(e instanceof IDBRequest)return function(e){const t=new Promise((t,n)=>{const i=()=>{e.removeEventListener("success",s),e.removeEventListener("error",r)},s=()=>{t(ue(e.result)),i()},r=()=>{n(e.error),i()};e.addEventListener("success",s),e.addEventListener("error",r)});return t.then(t=>{t instanceof IDBCursor&&ie.set(t,e)}).catch(()=>{}),ae.set(t,e),t}(e);if(oe.has(e))return oe.get(e);const t=le(e);return t!==e&&(oe.set(e,t),ae.set(t,e)),t}const de=e=>ae.get(e);const fe=["get","getKey","getAll","getAllKeys","count"],pe=["put","add","delete","clear"],ge=new Map;function me(e,t){if(!(e instanceof IDBDatabase)||t in e||"string"!=typeof t)return;if(ge.get(t))return ge.get(t);const n=t.replace(/FromIndex$/,""),i=t!==n,s=pe.includes(n);if(!(n in(i?IDBIndex:IDBObjectStore).prototype)||!s&&!fe.includes(n))return;const r=async function(e,...t){const r=this.transaction(e,s?"readwrite":"readonly");let o=r.store;return i&&(o=o.index(t.shift())),(await Promise.all([o[n](...t),s&&r.done]))[0]};return ge.set(t,r),r}ce=(e=>({...e,get:(t,n,i)=>me(t,n)||e.get(t,n,i),has:(t,n)=>!!me(t,n)||e.has(t,n)}))(ce);
/**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
class _e{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(e=>{if(function(e){const t=e.getComponent();return"VERSION"===(null==t?void 0:t.type)}(e)){const t=e.getImmediate();return`${t.library}/${t.version}`}return null}).filter(e=>e).join(" ")}}const ye="@firebase/app",ve="0.10.13",we=new ee("@firebase/app"),Te="@firebase/app-compat",Ie="@firebase/analytics-compat",be="@firebase/analytics",Ce="@firebase/app-check-compat",Ee="@firebase/app-check",Se="@firebase/auth",ke="@firebase/auth-compat",Ne="@firebase/database",Ae="@firebase/data-connect",Re="@firebase/database-compat",Pe="@firebase/functions",De="@firebase/functions-compat",xe="@firebase/installations",Oe="@firebase/installations-compat",Le="@firebase/messaging",Me="@firebase/messaging-compat",Fe="@firebase/performance",Ue="@firebase/performance-compat",Ve="@firebase/remote-config",qe="@firebase/remote-config-compat",je="@firebase/storage",Be="@firebase/storage-compat",ze="@firebase/firestore",$e="@firebase/vertexai-preview",We="@firebase/firestore-compat",He="firebase",Ke="[DEFAULT]",Ge={[ye]:"fire-core",[Te]:"fire-core-compat",[be]:"fire-analytics",[Ie]:"fire-analytics-compat",[Ee]:"fire-app-check",[Ce]:"fire-app-check-compat",[Se]:"fire-auth",[ke]:"fire-auth-compat",[Ne]:"fire-rtdb",[Ae]:"fire-data-connect",[Re]:"fire-rtdb-compat",[Pe]:"fire-fn",[De]:"fire-fn-compat",[xe]:"fire-iid",[Oe]:"fire-iid-compat",[Le]:"fire-fcm",[Me]:"fire-fcm-compat",[Fe]:"fire-perf",[Ue]:"fire-perf-compat",[Ve]:"fire-rc",[qe]:"fire-rc-compat",[je]:"fire-gcs",[Be]:"fire-gcs-compat",[ze]:"fire-fst",[We]:"fire-fst-compat",[$e]:"fire-vertex","fire-js":"fire-js",[He]:"fire-js-all"},Qe=new Map,Ye=new Map,Je=new Map;function Xe(e,t){try{e.container.addComponent(t)}catch(n){we.debug(`Component ${t.name} failed to register with FirebaseApp ${e.name}`,n)}}function Ze(e){const t=e.name;if(Je.has(t))return we.debug(`There were multiple attempts to register component ${t}.`),!1;Je.set(t,e);for(const n of Qe.values())Xe(n,e);for(const n of Ye.values())Xe(n,e);return!0}function et(e,t){const n=e.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),e.container.getProvider(t)}function tt(e){return void 0!==e.settings}
/**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */const nt=new S("app","Firebase",{"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."});
/**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
class it{constructor(e,t,n){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},t),this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=n,this.container.addComponent(new $("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw nt.create("app-deleted",{appName:this._name})}}
/**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */const st="10.14.1";function rt(e,t={}){let n=e;if("object"!=typeof t){t={name:t}}const i=Object.assign({name:Ke,automaticDataCollectionEnabled:!1},t),s=i.name;if("string"!=typeof s||!s)throw nt.create("bad-app-name",{appName:String(s)});if(n||(n=_()),!n)throw nt.create("no-options");const r=Qe.get(s);if(r){if(L(n,r.options)&&L(i,r.config))return r;throw nt.create("duplicate-app",{appName:s})}const o=new K(s);for(const c of Je.values())o.addComponent(c);const a=new it(n,i,o);return Qe.set(s,a),a}function ot(e=Ke){const t=Qe.get(e);if(!t&&e===Ke&&_())return rt();if(!t)throw nt.create("no-app",{appName:e});return t}function at(e,t,n){var i;let s=null!==(i=Ge[e])&&void 0!==i?i:e;n&&(s+=`-${n}`);const r=s.match(/\s|\//),o=t.match(/\s|\//);if(r||o){const e=[`Unable to register library "${s}" with version "${t}":`];return r&&e.push(`library name "${s}" contains illegal characters (whitespace or "/")`),r&&o&&e.push("and"),o&&e.push(`version name "${t}" contains illegal characters (whitespace or "/")`),void we.warn(e.join(" "))}Ze(new $(`${s}-version`,()=>({library:s,version:t}),"VERSION"))}
/**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */const ct="firebase-heartbeat-store";let ht=null;function lt(){return ht||(ht=function(e,t,{blocked:n,upgrade:i,blocking:s,terminated:r}={}){const o=indexedDB.open(e,t),a=ue(o);return i&&o.addEventListener("upgradeneeded",e=>{i(ue(o.result),e.oldVersion,e.newVersion,ue(o.transaction),e)}),n&&o.addEventListener("blocked",e=>n(e.oldVersion,e.newVersion,e)),a.then(e=>{r&&e.addEventListener("close",()=>r()),s&&e.addEventListener("versionchange",e=>s(e.oldVersion,e.newVersion,e))}).catch(()=>{}),a}("firebase-heartbeat-database",1,{upgrade:(e,t)=>{if(0===t)try{e.createObjectStore(ct)}catch(n){console.warn(n)}}}).catch(e=>{throw nt.create("idb-open",{originalErrorMessage:e.message})})),ht}async function ut(e,t){try{const n=(await lt()).transaction(ct,"readwrite"),i=n.objectStore(ct);await i.put(t,dt(e)),await n.done}catch(n){if(n instanceof E)we.warn(n.message);else{const e=nt.create("idb-set",{originalErrorMessage:null==n?void 0:n.message});we.warn(e.message)}}}function dt(e){return`${e.name}!${e.options.appId}`}
/**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class ft{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new gt(t),this._heartbeatsCachePromise=this._storage.read().then(e=>(this._heartbeatsCache=e,e))}async triggerHeartbeat(){var e,t;try{const n=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=pt();if(null==(null===(e=this._heartbeatsCache)||void 0===e?void 0:e.heartbeats)&&(this._heartbeatsCache=await this._heartbeatsCachePromise,null==(null===(t=this._heartbeatsCache)||void 0===t?void 0:t.heartbeats)))return;if(this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(e=>e.date===i))return;return this._heartbeatsCache.heartbeats.push({date:i,agent:n}),this._heartbeatsCache.heartbeats=this._heartbeatsCache.heartbeats.filter(e=>{const t=new Date(e.date).valueOf();return Date.now()-t<=2592e6}),this._storage.overwrite(this._heartbeatsCache)}catch(n){we.warn(n)}}async getHeartbeatsHeader(){var e;try{if(null===this._heartbeatsCache&&await this._heartbeatsCachePromise,null==(null===(e=this._heartbeatsCache)||void 0===e?void 0:e.heartbeats)||0===this._heartbeatsCache.heartbeats.length)return"";const t=pt(),{heartbeatsToSend:n,unsentEntries:i}=function(e,t=1024){const n=[];let i=e.slice();for(const s of e){const e=n.find(e=>e.agent===s.agent);if(e){if(e.dates.push(s.date),mt(n)>t){e.dates.pop();break}}else if(n.push({agent:s.agent,dates:[s.date]}),mt(n)>t){n.pop();break}i=i.slice(1)}return{heartbeatsToSend:n,unsentEntries:i}}(this._heartbeatsCache.heartbeats),s=c(JSON.stringify({version:2,heartbeats:n}));return this._heartbeatsCache.lastSentHeartbeatDate=t,i.length>0?(this._heartbeatsCache.heartbeats=i,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}catch(t){return we.warn(t),""}}}function pt(){return(new Date).toISOString().substring(0,10)}class gt{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return!!function(){try{return"object"==typeof indexedDB}catch(e){return!1}}()&&new Promise((e,t)=>{try{let n=!0;const i="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(i);s.onsuccess=()=>{s.result.close(),n||self.indexedDB.deleteDatabase(i),e(!0)},s.onupgradeneeded=()=>{n=!1},s.onerror=()=>{var e;t((null===(e=s.error)||void 0===e?void 0:e.message)||"")}}catch(n){t(n)}}).then(()=>!0).catch(()=>!1)}async read(){if(await this._canUseIndexedDBPromise){const e=await async function(e){try{const t=(await lt()).transaction(ct),n=await t.objectStore(ct).get(dt(e));return await t.done,n}catch(t){if(t instanceof E)we.warn(t.message);else{const e=nt.create("idb-get",{originalErrorMessage:null==t?void 0:t.message});we.warn(e.message)}}}(this.app);return(null==e?void 0:e.heartbeats)?e:{heartbeats:[]}}return{heartbeats:[]}}async overwrite(e){var t;if(await this._canUseIndexedDBPromise){const n=await this.read();return ut(this.app,{lastSentHeartbeatDate:null!==(t=e.lastSentHeartbeatDate)&&void 0!==t?t:n.lastSentHeartbeatDate,heartbeats:e.heartbeats})}}async add(e){var t;if(await this._canUseIndexedDBPromise){const n=await this.read();return ut(this.app,{lastSentHeartbeatDate:null!==(t=e.lastSentHeartbeatDate)&&void 0!==t?t:n.lastSentHeartbeatDate,heartbeats:[...n.heartbeats,...e.heartbeats]})}}}function mt(e){return c(JSON.stringify({version:2,heartbeats:e})).length}
/**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */var _t;_t="",Ze(new $("platform-logger",e=>new _e(e),"PRIVATE")),Ze(new $("heartbeat",e=>new ft(e),"PRIVATE")),at(ye,ve,_t),at(ye,ve,"esm2017"),at("fire-js","");function yt(e,t){var n={};for(var i in e)Object.prototype.hasOwnProperty.call(e,i)&&t.indexOf(i)<0&&(n[i]=e[i]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var s=0;for(i=Object.getOwnPropertySymbols(e);s<i.length;s++)t.indexOf(i[s])<0&&Object.prototype.propertyIsEnumerable.call(e,i[s])&&(n[i[s]]=e[i[s]])}return n}function vt(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
at("firebase","10.14.1","app"),"function"==typeof SuppressedError&&SuppressedError;const wt=vt,Tt=new S("auth","Firebase",{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}),It=new ee("@firebase/auth");function bt(e,...t){It.logLevel<=G.ERROR&&It.error(`Auth (${st}): ${e}`,...t)}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */function Ct(e,...t){throw Nt(e,...t)}function Et(e,...t){return Nt(e,...t)}function St(e,t,n){const i=Object.assign(Object.assign({},wt()),{[t]:n});return new S("auth","Firebase",i).create(t,{appName:e.name})}function kt(e){return St(e,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Nt(e,...t){if("string"!=typeof e){const n=t[0],i=[...t.slice(1)];return i[0]&&(i[0].appName=e.name),e._errorFactory.create(n,...i)}return Tt.create(e,...t)}function At(e,t,...n){if(!e)throw Nt(t,...n)}function Rt(e){const t="INTERNAL ASSERTION FAILED: "+e;throw bt(t),new Error(t)}function Pt(e,t){e||Rt(t)}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */function Dt(){var e;return"undefined"!=typeof self&&(null===(e=self.location)||void 0===e?void 0:e.href)||""}function xt(){var e;return"undefined"!=typeof self&&(null===(e=self.location)||void 0===e?void 0:e.protocol)||null}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */function Ot(){return"undefined"==typeof navigator||!navigator||!("onLine"in navigator)||"boolean"!=typeof navigator.onLine||"http:"!==xt()&&"https:"!==xt()&&!function(){const e="object"==typeof chrome?chrome.runtime:"object"==typeof browser?browser.runtime:void 0;return"object"==typeof e&&void 0!==e.id}()&&!("connection"in navigator)||navigator.onLine}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
class Lt{constructor(e,t){this.shortDelay=e,this.longDelay=t,Pt(t>e,"Short delay should be less than long delay!"),this.isMobile=I()||b()}get(){return Ot()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */function Mt(e,t){Pt(e.emulator,"Emulator should always be set here");const{url:n}=e.emulator;return t?`${n}${t.startsWith("/")?t.slice(1):t}`:n}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Ft{static initialize(e,t,n){this.fetchImpl=e,t&&(this.headersImpl=t),n&&(this.responseImpl=n)}static fetch(){return this.fetchImpl?this.fetchImpl:"undefined"!=typeof self&&"fetch"in self?self.fetch:"undefined"!=typeof globalThis&&globalThis.fetch?globalThis.fetch:"undefined"!=typeof fetch?fetch:void Rt("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){return this.headersImpl?this.headersImpl:"undefined"!=typeof self&&"Headers"in self?self.Headers:"undefined"!=typeof globalThis&&globalThis.Headers?globalThis.Headers:"undefined"!=typeof Headers?Headers:void Rt("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){return this.responseImpl?this.responseImpl:"undefined"!=typeof self&&"Response"in self?self.Response:"undefined"!=typeof globalThis&&globalThis.Response?globalThis.Response:"undefined"!=typeof Response?Response:void Rt("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */const Ut={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"},Vt=new Lt(3e4,6e4);
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */function qt(e,t){return e.tenantId&&!t.tenantId?Object.assign(Object.assign({},t),{tenantId:e.tenantId}):t}async function jt(e,t,n,i,s={}){return Bt(e,s,async()=>{let s={},r={};i&&("GET"===t?r=i:s={body:JSON.stringify(i)});const o=F(Object.assign({key:e.config.apiKey},r)).slice(1),a=await e._getAdditionalHeaders();a["Content-Type"]="application/json",e.languageCode&&(a["X-Firebase-Locale"]=e.languageCode);const c=Object.assign({method:t,headers:a},s);return"undefined"!=typeof navigator&&"Cloudflare-Workers"===navigator.userAgent||(c.referrerPolicy="no-referrer"),Ft.fetch()($t(e,e.config.apiHost,n,o),c)})}async function Bt(e,t,n){e._canInitEmulator=!1;const i=Object.assign(Object.assign({},Ut),t);try{const t=new Wt(e),s=await Promise.race([n(),t.promise]);t.clearNetworkTimeout();const r=await s.json();if("needConfirmation"in r)throw Ht(e,"account-exists-with-different-credential",r);if(s.ok&&!("errorMessage"in r))return r;{const t=s.ok?r.errorMessage:r.error.message,[n,o]=t.split(" : ");if("FEDERATED_USER_ID_ALREADY_LINKED"===n)throw Ht(e,"credential-already-in-use",r);if("EMAIL_EXISTS"===n)throw Ht(e,"email-already-in-use",r);if("USER_DISABLED"===n)throw Ht(e,"user-disabled",r);const a=i[n]||n.toLowerCase().replace(/[_\s]+/g,"-");if(o)throw St(e,a,o);Ct(e,a)}}catch(s){if(s instanceof E)throw s;Ct(e,"network-request-failed",{message:String(s)})}}async function zt(e,t,n,i,s={}){const r=await jt(e,t,n,i,s);return"mfaPendingCredential"in r&&Ct(e,"multi-factor-auth-required",{_serverResponse:r}),r}function $t(e,t,n,i){const s=`${t}${n}?${i}`;return e.config.emulator?Mt(e.config,s):`${e.config.apiScheme}://${s}`}class Wt{constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((e,t)=>{this.timer=setTimeout(()=>t(Et(this.auth,"network-request-failed")),Vt.get())})}clearNetworkTimeout(){clearTimeout(this.timer)}}function Ht(e,t,n){const i={appName:e.name};n.email&&(i.email=n.email),n.phoneNumber&&(i.phoneNumber=n.phoneNumber);const s=Et(e,t,i);return s.customData._tokenResponse=n,s}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */async function Kt(e,t){return jt(e,"POST","/v1/accounts:lookup",t)}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */function Gt(e){if(e)try{const t=new Date(Number(e));if(!isNaN(t.getTime()))return t.toUTCString()}catch(t){}}function Qt(e){return 1e3*Number(e)}function Yt(e){const[t,n,i]=e.split(".");if(void 0===t||void 0===n||void 0===i)return bt("JWT malformed, contained fewer than 3 sections"),null;try{const e=h(n);return e?JSON.parse(e):(bt("Failed to decode base64 JWT payload"),null)}catch(s){return bt("Caught error parsing JWT payload as JSON",null==s?void 0:s.toString()),null}}function Jt(e){const t=Yt(e);return At(t,"internal-error"),At(void 0!==t.exp,"internal-error"),At(void 0!==t.iat,"internal-error"),Number(t.exp)-Number(t.iat)}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */async function Xt(e,t,n=!1){if(n)return t;try{return await t}catch(i){throw i instanceof E&&function({code:e}){return"auth/user-disabled"===e||"auth/user-token-expired"===e}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */(i)&&e.auth.currentUser===e&&await e.auth.signOut(),i}}class Zt{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,null!==this.timerId&&clearTimeout(this.timerId))}getInterval(e){var t;if(e){const e=this.errorBackoff;return this.errorBackoff=Math.min(2*this.errorBackoff,96e4),e}{this.errorBackoff=3e4;const e=(null!==(t=this.user.stsTokenManager.expirationTime)&&void 0!==t?t:0)-Date.now()-3e5;return Math.max(0,e)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){return void("auth/network-request-failed"===(null==e?void 0:e.code)&&this.schedule(!0))}this.schedule()}}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class en{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=Gt(this.lastLoginAt),this.creationTime=Gt(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}
/**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */async function tn(e){var t;const n=e.auth,i=await e.getIdToken(),s=await Xt(e,Kt(n,{idToken:i}));At(null==s?void 0:s.users.length,n,"internal-error");const r=s.users[0];e._notifyReloadListener(r);const o=(null===(t=r.providerUserInfo)||void 0===t?void 0:t.length)?nn(r.providerUserInfo):[],a=(c=e.providerData,h=o,[...c.filter(e=>!h.some(t=>t.providerId===e.providerId)),...h]);var c,h;const l=e.isAnonymous,u=!(e.email&&r.passwordHash||(null==a?void 0:a.length)),d=!!l&&u,f={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:a,metadata:new en(r.createdAt,r.lastLoginAt),isAnonymous:d};Object.assign(e,f)}function nn(e){return e.map(e=>{var{providerId:t}=e,n=yt(e,["providerId"]);return{providerId:t,uid:n.rawId||"",displayName:n.displayName||null,email:n.email||null,phoneNumber:n.phoneNumber||null,photoURL:n.photoUrl||null}})}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
class sn{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){At(e.idToken,"internal-error"),At(void 0!==e.idToken,"internal-error"),At(void 0!==e.refreshToken,"internal-error");const t="expiresIn"in e&&void 0!==e.expiresIn?Number(e.expiresIn):Jt(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){At(0!==e.length,"internal-error");const t=Jt(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return t||!this.accessToken||this.isExpired?(At(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null):this.accessToken}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:n,refreshToken:i,expiresIn:s}=await async function(e,t){const n=await Bt(e,{},async()=>{const n=F({grant_type:"refresh_token",refresh_token:t}).slice(1),{tokenApiHost:i,apiKey:s}=e.config,r=$t(e,i,"/v1/token",`key=${s}`),o=await e._getAdditionalHeaders();return o["Content-Type"]="application/x-www-form-urlencoded",Ft.fetch()(r,{method:"POST",headers:o,body:n})});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}(e,t);this.updateTokensAndExpiration(n,i,Number(s))}updateTokensAndExpiration(e,t,n){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+1e3*n}static fromJSON(e,t){const{refreshToken:n,accessToken:i,expirationTime:s}=t,r=new sn;return n&&(At("string"==typeof n,"internal-error",{appName:e}),r.refreshToken=n),i&&(At("string"==typeof i,"internal-error",{appName:e}),r.accessToken=i),s&&(At("number"==typeof s,"internal-error",{appName:e}),r.expirationTime=s),r}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new sn,this.toJSON())}_performRefresh(){return Rt("not implemented")}}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */function rn(e,t){At("string"==typeof e||void 0===e,"internal-error",{appName:t})}class on{constructor(e){var{uid:t,auth:n,stsTokenManager:i}=e,s=yt(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new Zt(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=t,this.auth=n,this.stsTokenManager=i,this.accessToken=i.accessToken,this.displayName=s.displayName||null,this.email=s.email||null,this.emailVerified=s.emailVerified||!1,this.phoneNumber=s.phoneNumber||null,this.photoURL=s.photoURL||null,this.isAnonymous=s.isAnonymous||!1,this.tenantId=s.tenantId||null,this.providerData=s.providerData?[...s.providerData]:[],this.metadata=new en(s.createdAt||void 0,s.lastLoginAt||void 0)}async getIdToken(e){const t=await Xt(this,this.stsTokenManager.getToken(this.auth,e));return At(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return async function(e,t=!1){const n=z(e),i=await n.getIdToken(t),s=Yt(i);At(s&&s.exp&&s.auth_time&&s.iat,n.auth,"internal-error");const r="object"==typeof s.firebase?s.firebase:void 0,o=null==r?void 0:r.sign_in_provider;return{claims:s,token:i,authTime:Gt(Qt(s.auth_time)),issuedAtTime:Gt(Qt(s.iat)),expirationTime:Gt(Qt(s.exp)),signInProvider:o||null,signInSecondFactor:(null==r?void 0:r.sign_in_second_factor)||null}}(this,e)}reload(){return async function(e){const t=z(e);await tn(t),await t.auth._persistUserIfCurrent(t),t.auth._notifyListenersIfCurrent(t)}(this)}_assign(e){this!==e&&(At(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(e=>Object.assign({},e)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new on(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return t.metadata._copy(this.metadata),t}_onReload(e){At(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let n=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),n=!0),t&&await tn(this),await this.auth._persistUserIfCurrent(this),n&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(tt(this.auth.app))return Promise.reject(kt(this.auth));const e=await this.getIdToken();return await Xt(this,async function(e,t){return jt(e,"POST","/v1/accounts:delete",t)}(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){var n,i,s,r,o,a,c,h;const l=null!==(n=t.displayName)&&void 0!==n?n:void 0,u=null!==(i=t.email)&&void 0!==i?i:void 0,d=null!==(s=t.phoneNumber)&&void 0!==s?s:void 0,f=null!==(r=t.photoURL)&&void 0!==r?r:void 0,p=null!==(o=t.tenantId)&&void 0!==o?o:void 0,g=null!==(a=t._redirectEventId)&&void 0!==a?a:void 0,m=null!==(c=t.createdAt)&&void 0!==c?c:void 0,_=null!==(h=t.lastLoginAt)&&void 0!==h?h:void 0,{uid:y,emailVerified:v,isAnonymous:w,providerData:T,stsTokenManager:I}=t;At(y&&I,e,"internal-error");const b=sn.fromJSON(this.name,I);At("string"==typeof y,e,"internal-error"),rn(l,e.name),rn(u,e.name),At("boolean"==typeof v,e,"internal-error"),At("boolean"==typeof w,e,"internal-error"),rn(d,e.name),rn(f,e.name),rn(p,e.name),rn(g,e.name),rn(m,e.name),rn(_,e.name);const C=new on({uid:y,auth:e,email:u,emailVerified:v,displayName:l,isAnonymous:w,photoURL:f,phoneNumber:d,tenantId:p,stsTokenManager:b,createdAt:m,lastLoginAt:_});return T&&Array.isArray(T)&&(C.providerData=T.map(e=>Object.assign({},e))),g&&(C._redirectEventId=g),C}static async _fromIdTokenResponse(e,t,n=!1){const i=new sn;i.updateFromServerResponse(t);const s=new on({uid:t.localId,auth:e,stsTokenManager:i,isAnonymous:n});return await tn(s),s}static async _fromGetAccountInfoResponse(e,t,n){const i=t.users[0];At(void 0!==i.localId,"internal-error");const s=void 0!==i.providerUserInfo?nn(i.providerUserInfo):[],r=!(i.email&&i.passwordHash||(null==s?void 0:s.length)),o=new sn;o.updateFromIdToken(n);const a=new on({uid:i.localId,auth:e,stsTokenManager:o,isAnonymous:r}),c={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:s,metadata:new en(i.createdAt,i.lastLoginAt),isAnonymous:!(i.email&&i.passwordHash||(null==s?void 0:s.length))};return Object.assign(a,c),a}}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */const an=new Map;function cn(e){Pt(e instanceof Function,"Expected a class definition");let t=an.get(e);return t?(Pt(t instanceof e,"Instance stored in cache mismatched with class"),t):(t=new e,an.set(e,t),t)}
/**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class hn{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return void 0===t?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}hn.type="NONE";const ln=hn;
/**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */function un(e,t,n){return`firebase:${e}:${t}:${n}`}class dn{constructor(e,t,n){this.persistence=e,this.auth=t,this.userKey=n;const{config:i,name:s}=this.auth;this.fullUserKey=un(this.userKey,i.apiKey,s),this.fullPersistenceKey=un("persistence",i.apiKey,s),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);return e?on._fromJSON(this.auth,e):null}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();return await this.removeCurrentUser(),this.persistence=e,t?this.setCurrentUser(t):void 0}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,n="authUser"){if(!t.length)return new dn(cn(ln),e,n);const i=(await Promise.all(t.map(async e=>{if(await e._isAvailable())return e}))).filter(e=>e);let s=i[0]||cn(ln);const r=un(n,e.config.apiKey,e.name);let o=null;for(const h of t)try{const t=await h._get(r);if(t){const n=on._fromJSON(e,t);h!==s&&(o=n),s=h;break}}catch(c){}const a=i.filter(e=>e._shouldAllowMigration);return s._shouldAllowMigration&&a.length?(s=a[0],o&&await s._set(r,o.toJSON()),await Promise.all(t.map(async e=>{if(e!==s)try{await e._remove(r)}catch(c){}})),new dn(s,e,n)):new dn(s,e,n)}}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */function fn(e){const t=e.toLowerCase();if(t.includes("opera/")||t.includes("opr/")||t.includes("opios/"))return"Opera";if(_n(t))return"IEMobile";if(t.includes("msie")||t.includes("trident/"))return"IE";if(t.includes("edge/"))return"Edge";if(pn(t))return"Firefox";if(t.includes("silk/"))return"Silk";if(vn(t))return"Blackberry";if(wn(t))return"Webos";if(gn(t))return"Safari";if((t.includes("chrome/")||mn(t))&&!t.includes("edge/"))return"Chrome";if(yn(t))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,n=e.match(t);if(2===(null==n?void 0:n.length))return n[1]}return"Other"}function pn(e=T()){return/firefox\//i.test(e)}function gn(e=T()){const t=e.toLowerCase();return t.includes("safari/")&&!t.includes("chrome/")&&!t.includes("crios/")&&!t.includes("android")}function mn(e=T()){return/crios\//i.test(e)}function _n(e=T()){return/iemobile/i.test(e)}function yn(e=T()){return/android/i.test(e)}function vn(e=T()){return/blackberry/i.test(e)}function wn(e=T()){return/webos/i.test(e)}function Tn(e=T()){return/iphone|ipad|ipod/i.test(e)||/macintosh/i.test(e)&&/mobile/i.test(e)}function In(){return function(){const e=T();return e.indexOf("MSIE ")>=0||e.indexOf("Trident/")>=0}()&&10===document.documentMode}function bn(e=T()){return Tn(e)||yn(e)||wn(e)||vn(e)||/windows phone/i.test(e)||_n(e)}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */function Cn(e,t=[]){let n;switch(e){case"Browser":n=fn(T());break;case"Worker":n=`${fn(T())}-${e}`;break;default:n=e}const i=t.length?t.join(","):"FirebaseCore-web";return`${n}/JsCore/${st}/${i}`}
/**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class En{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const n=t=>new Promise((n,i)=>{try{n(e(t))}catch(s){i(s)}});n.onAbort=t,this.queue.push(n);const i=this.queue.length-1;return()=>{this.queue[i]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const n of this.queue)await n(e),n.onAbort&&t.push(n.onAbort)}catch(n){t.reverse();for(const e of t)try{e()}catch(i){}throw this.auth._errorFactory.create("login-blocked",{originalMessage:null==n?void 0:n.message})}}}
/**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Sn{constructor(e){var t,n,i,s;const r=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=null!==(t=r.minPasswordLength)&&void 0!==t?t:6,r.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=r.maxPasswordLength),void 0!==r.containsLowercaseCharacter&&(this.customStrengthOptions.containsLowercaseLetter=r.containsLowercaseCharacter),void 0!==r.containsUppercaseCharacter&&(this.customStrengthOptions.containsUppercaseLetter=r.containsUppercaseCharacter),void 0!==r.containsNumericCharacter&&(this.customStrengthOptions.containsNumericCharacter=r.containsNumericCharacter),void 0!==r.containsNonAlphanumericCharacter&&(this.customStrengthOptions.containsNonAlphanumericCharacter=r.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,"ENFORCEMENT_STATE_UNSPECIFIED"===this.enforcementState&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=null!==(i=null===(n=e.allowedNonAlphanumericCharacters)||void 0===n?void 0:n.join(""))&&void 0!==i?i:"",this.forceUpgradeOnSignin=null!==(s=e.forceUpgradeOnSignin)&&void 0!==s&&s,this.schemaVersion=e.schemaVersion}validatePassword(e){var t,n,i,s,r,o;const a={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,a),this.validatePasswordCharacterOptions(e,a),a.isValid&&(a.isValid=null===(t=a.meetsMinPasswordLength)||void 0===t||t),a.isValid&&(a.isValid=null===(n=a.meetsMaxPasswordLength)||void 0===n||n),a.isValid&&(a.isValid=null===(i=a.containsLowercaseLetter)||void 0===i||i),a.isValid&&(a.isValid=null===(s=a.containsUppercaseLetter)||void 0===s||s),a.isValid&&(a.isValid=null===(r=a.containsNumericCharacter)||void 0===r||r),a.isValid&&(a.isValid=null===(o=a.containsNonAlphanumericCharacter)||void 0===o||o),a}validatePasswordLengthOptions(e,t){const n=this.customStrengthOptions.minPasswordLength,i=this.customStrengthOptions.maxPasswordLength;n&&(t.meetsMinPasswordLength=e.length>=n),i&&(t.meetsMaxPasswordLength=e.length<=i)}validatePasswordCharacterOptions(e,t){let n;this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);for(let i=0;i<e.length;i++)n=e.charAt(i),this.updatePasswordCharacterOptionsStatuses(t,n>="a"&&n<="z",n>="A"&&n<="Z",n>="0"&&n<="9",this.allowedNonAlphanumericCharacters.includes(n))}updatePasswordCharacterOptionsStatuses(e,t,n,i,s){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=n)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=i)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=s))}}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class kn{constructor(e,t,n,i){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=n,this.config=i,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new An(this),this.idTokenSubscription=new An(this),this.beforeStateQueue=new En(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=Tt,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=i.sdkClientVersion}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=cn(t)),this._initializationPromise=this.queue(async()=>{var n,i;if(!this._deleted&&(this.persistenceManager=await dn.create(this,e),!this._deleted)){if(null===(n=this._popupRedirectResolver)||void 0===n?void 0:n._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch(s){}await this.initializeCurrentUser(t),this.lastNotifiedUid=(null===(i=this.currentUser)||void 0===i?void 0:i.uid)||null,this._deleted||(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();return this.currentUser||e?this.currentUser&&e&&this.currentUser.uid===e.uid?(this._currentUser._assign(e),void(await this.currentUser.getIdToken())):void(await this._updateCurrentUser(e,!0)):void 0}async initializeCurrentUserFromIdToken(e){try{const t=await Kt(this,{idToken:e}),n=await on._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(n)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var t;if(tt(this.app)){const e=this.app.settings.authIdToken;return e?new Promise(t=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(e).then(t,t))}):this.directlySetCurrentUser(null)}const n=await this.assertedPersistence.getCurrentUser();let i=n,s=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const n=null===(t=this.redirectUser)||void 0===t?void 0:t._redirectEventId,r=null==i?void 0:i._redirectEventId,o=await this.tryRedirectSignIn(e);n&&n!==r||!(null==o?void 0:o.user)||(i=o.user,s=!0)}if(!i)return this.directlySetCurrentUser(null);if(!i._redirectEventId){if(s)try{await this.beforeStateQueue.runMiddleware(i)}catch(r){i=n,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(r))}return i?this.reloadAndSetCurrentUserOrClear(i):this.directlySetCurrentUser(null)}return At(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===i._redirectEventId?this.directlySetCurrentUser(i):this.reloadAndSetCurrentUserOrClear(i)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch(n){await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await tn(e)}catch(t){if("auth/network-request-failed"!==(null==t?void 0:t.code))return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=function(){if("undefined"==typeof navigator)return null;const e=navigator;return e.languages&&e.languages[0]||e.language||null}()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(tt(this.app))return Promise.reject(kt(this));const t=e?z(e):null;return t&&At(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&At(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return tt(this.app)?Promise.reject(kt(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return tt(this.app)?Promise.reject(kt(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(cn(e))})}_getRecaptchaConfig(){return null==this.tenantId?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return null===this.tenantId?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await async function(e,t={}){return jt(e,"GET","/v2/passwordPolicy",qt(e,t))}
/**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */(this),t=new Sn(e);null===this.tenantId?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistence(){return this.assertedPersistence.persistence.type}_updateErrorMap(e){this._errorFactory=new S("auth","Firebase",e())}onAuthStateChanged(e,t,n){return this.registerStateListener(this.authStateSubscription,e,t,n)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,n){return this.registerStateListener(this.idTokenSubscription,e,t,n)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const n=this.onAuthStateChanged(()=>{n(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:await this.currentUser.getIdToken()};null!=this.tenantId&&(t.tenantId=this.tenantId),await async function(e,t){return jt(e,"POST","/v2/accounts:revokeToken",qt(e,t))}(this,t)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:null===(e=this._currentUser)||void 0===e?void 0:e.toJSON()}}async _setRedirectUser(e,t){const n=await this.getOrInitRedirectPersistenceManager(t);return null===e?n.removeCurrentUser():n.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&cn(e)||this._popupRedirectResolver;At(t,this,"argument-error"),this.redirectPersistenceManager=await dn.create(this,[cn(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,n;return this._isInitialized&&await this.queue(async()=>{}),(null===(t=this._currentUser)||void 0===t?void 0:t._redirectEventId)===e?this._currentUser:(null===(n=this.redirectUser)||void 0===n?void 0:n._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const n=null!==(t=null===(e=this.currentUser)||void 0===e?void 0:e.uid)&&void 0!==t?t:null;this.lastNotifiedUid!==n&&(this.lastNotifiedUid=n,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,n,i){if(this._deleted)return()=>{};const s="function"==typeof t?t:t.next.bind(t);let r=!1;const o=this._isInitialized?Promise.resolve():this._initializationPromise;if(At(o,this,"internal-error"),o.then(()=>{r||s(this.currentUser)}),"function"==typeof t){const s=e.addObserver(t,n,i);return()=>{r=!0,s()}}{const n=e.addObserver(t);return()=>{r=!0,n()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return At(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){e&&!this.frameworks.includes(e)&&(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=Cn(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const t={"X-Client-Version":this.clientVersion};this.app.options.appId&&(t["X-Firebase-gmpid"]=this.app.options.appId);const n=await(null===(e=this.heartbeatServiceProvider.getImmediate({optional:!0}))||void 0===e?void 0:e.getHeartbeatsHeader());n&&(t["X-Firebase-Client"]=n);const i=await this._getAppCheckToken();return i&&(t["X-Firebase-AppCheck"]=i),t}async _getAppCheckToken(){var e;const t=await(null===(e=this.appCheckServiceProvider.getImmediate({optional:!0}))||void 0===e?void 0:e.getToken());return(null==t?void 0:t.error)&&function(e,...t){It.logLevel<=G.WARN&&It.warn(`Auth (${st}): ${e}`,...t)}(`Error while retrieving App Check token: ${t.error}`),null==t?void 0:t.token}}function Nn(e){return z(e)}class An{constructor(e){this.auth=e,this.observer=null,this.addObserver=function(e,t){const n=new V(e,t);return n.subscribe.bind(n)}(e=>this.observer=e)}get next(){return At(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */let Rn={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function Pn(e,t,n){const i=Nn(e);At(i._canInitEmulator,i,"emulator-config-failed"),At(/^https?:\/\//.test(t),i,"invalid-emulator-scheme");const s=Dn(t),{host:r,port:o}=function(e){const t=Dn(e),n=/(\/\/)?([^?#/]+)/.exec(e.substr(t.length));if(!n)return{host:"",port:null};const i=n[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(i);if(s){const e=s[1];return{host:e,port:xn(i.substr(e.length+1))}}{const[e,t]=i.split(":");return{host:e,port:xn(t)}}}(t),a=null===o?"":`:${o}`;i.config.emulator={url:`${s}//${r}${a}/`},i.settings.appVerificationDisabledForTesting=!0,i.emulatorConfig=Object.freeze({host:r,port:o,protocol:s.replace(":",""),options:Object.freeze({disableWarnings:!1})}),function(){function e(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}"undefined"!=typeof console&&"function"==typeof console.info&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials.");"undefined"!=typeof window&&"undefined"!=typeof document&&("loading"===document.readyState?window.addEventListener("DOMContentLoaded",e):e())}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */()}function Dn(e){const t=e.indexOf(":");return t<0?"":e.substr(0,t+1)}function xn(e){if(!e)return null;const t=Number(e);return isNaN(t)?null:t}class On{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return Rt("not implemented")}_getIdTokenResponse(e){return Rt("not implemented")}_linkToIdToken(e,t){return Rt("not implemented")}_getReauthenticationResolver(e){return Rt("not implemented")}}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */async function Ln(e,t){return zt(e,"POST","/v1/accounts:signInWithIdp",qt(e,t))}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Mn extends On{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new Mn(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):Ct("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t="string"==typeof e?JSON.parse(e):e,{providerId:n,signInMethod:i}=t,s=yt(t,["providerId","signInMethod"]);if(!n||!i)return null;const r=new Mn(n,i);return r.idToken=s.idToken||void 0,r.accessToken=s.accessToken||void 0,r.secret=s.secret,r.nonce=s.nonce,r.pendingToken=s.pendingToken||null,r}_getIdTokenResponse(e){return Ln(e,this.buildRequest())}_linkToIdToken(e,t){const n=this.buildRequest();return n.idToken=t,Ln(e,n)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,Ln(e,t)}buildRequest(){const e={requestUri:"http://localhost",returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=F(t)}return e}}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Fn{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}
/**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Un extends Fn{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Vn extends Un{constructor(){super("facebook.com")}static credential(e){return Mn._fromParams({providerId:Vn.PROVIDER_ID,signInMethod:Vn.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Vn.credentialFromTaggedObject(e)}static credentialFromError(e){return Vn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e))return null;if(!e.oauthAccessToken)return null;try{return Vn.credential(e.oauthAccessToken)}catch(t){return null}}}Vn.FACEBOOK_SIGN_IN_METHOD="facebook.com",Vn.PROVIDER_ID="facebook.com";
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
class qn extends Un{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return Mn._fromParams({providerId:qn.PROVIDER_ID,signInMethod:qn.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return qn.credentialFromTaggedObject(e)}static credentialFromError(e){return qn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:n}=e;if(!t&&!n)return null;try{return qn.credential(t,n)}catch(i){return null}}}qn.GOOGLE_SIGN_IN_METHOD="google.com",qn.PROVIDER_ID="google.com";
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
class jn extends Un{constructor(){super("github.com")}static credential(e){return Mn._fromParams({providerId:jn.PROVIDER_ID,signInMethod:jn.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return jn.credentialFromTaggedObject(e)}static credentialFromError(e){return jn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e))return null;if(!e.oauthAccessToken)return null;try{return jn.credential(e.oauthAccessToken)}catch(t){return null}}}jn.GITHUB_SIGN_IN_METHOD="github.com",jn.PROVIDER_ID="github.com";
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
class Bn extends Un{constructor(){super("twitter.com")}static credential(e,t){return Mn._fromParams({providerId:Bn.PROVIDER_ID,signInMethod:Bn.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return Bn.credentialFromTaggedObject(e)}static credentialFromError(e){return Bn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:n}=e;if(!t||!n)return null;try{return Bn.credential(t,n)}catch(i){return null}}}Bn.TWITTER_SIGN_IN_METHOD="twitter.com",Bn.PROVIDER_ID="twitter.com";
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
class zn{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,n,i=!1){const s=await on._fromIdTokenResponse(e,n,i),r=$n(n);return new zn({user:s,providerId:r,_tokenResponse:n,operationType:t})}static async _forOperation(e,t,n){await e._updateTokensIfNecessary(n,!0);const i=$n(n);return new zn({user:e,providerId:i,_tokenResponse:n,operationType:t})}}function $n(e){return e.providerId?e.providerId:"phoneNumber"in e?"phone":null}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */async function Wn(e){var t;if(tt(e.app))return Promise.reject(kt(e));const n=Nn(e);if(await n._initializationPromise,null===(t=n.currentUser)||void 0===t?void 0:t.isAnonymous)return new zn({user:n.currentUser,providerId:null,operationType:"signIn"});const i=
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */await async function(e,t){return zt(e,"POST","/v1/accounts:signUp",qt(e,t))}(n,{returnSecureToken:!0}),s=await zn._fromIdTokenResponse(n,"signIn",i,!0);return await n._updateCurrentUser(s.user),s}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Hn extends E{constructor(e,t,n,i){var s;super(t.code,t.message),this.operationType=n,this.user=i,Object.setPrototypeOf(this,Hn.prototype),this.customData={appName:e.name,tenantId:null!==(s=e.tenantId)&&void 0!==s?s:void 0,_serverResponse:t.customData._serverResponse,operationType:n}}static _fromErrorAndOperation(e,t,n,i){return new Hn(e,t,n,i)}}function Kn(e,t,n,i){return("reauthenticate"===t?n._getReauthenticationResolver(e):n._getIdTokenResponse(e)).catch(n=>{if("auth/multi-factor-auth-required"===n.code)throw Hn._fromErrorAndOperation(e,n,t,i);throw n})}const Gn="__sak";
/**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Qn{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(Gn,"1"),this.storage.removeItem(Gn),Promise.resolve(!0)):Promise.resolve(!1)}catch(e){return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Yn extends Qn{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=bn(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const n=this.storage.getItem(t),i=this.localCache[t];n!==i&&e(t,i,n)}}onStorageEvent(e,t=!1){if(!e.key)return void this.forAllChangedKeys((e,t,n)=>{this.notifyListeners(e,n)});const n=e.key;t?this.detachListener():this.stopPolling();const i=()=>{const e=this.storage.getItem(n);(t||this.localCache[n]!==e)&&this.notifyListeners(n,e)},s=this.storage.getItem(n);In()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(i,10):i()}notifyListeners(e,t){this.localCache[e]=t;const n=this.listeners[e];if(n)for(const i of Array.from(n))i(t?JSON.parse(t):t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,n)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:n}),!0)})},1e3)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){0===Object.keys(this.listeners).length&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),0===this.listeners[e].size&&delete this.listeners[e]),0===Object.keys(this.listeners).length&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}Yn.type="LOCAL";const Jn=Yn;
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Xn extends Qn{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}Xn.type="SESSION";const Zn=Xn;
/**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
/**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
class ei{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(t=>t.isListeningto(e));if(t)return t;const n=new ei(e);return this.receivers.push(n),n}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:n,eventType:i,data:s}=t.data,r=this.handlersMap[i];if(!(null==r?void 0:r.size))return;t.ports[0].postMessage({status:"ack",eventId:n,eventType:i});const o=Array.from(r).map(async e=>e(t.origin,s)),a=await function(e){return Promise.all(e.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}(o);t.ports[0].postMessage({status:"done",eventId:n,eventType:i,response:a})}_subscribe(e,t){0===Object.keys(this.handlersMap).length&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),t&&0!==this.handlersMap[e].size||delete this.handlersMap[e],0===Object.keys(this.handlersMap).length&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
function ti(e="",t=10){let n="";for(let i=0;i<t;i++)n+=Math.floor(10*Math.random());return e+n}
/**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */ei.receivers=[];class ni{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,n=50){const i="undefined"!=typeof MessageChannel?new MessageChannel:null;if(!i)throw new Error("connection_unavailable");let s,r;return new Promise((o,a)=>{const c=ti("",20);i.port1.start();const h=setTimeout(()=>{a(new Error("unsupported_event"))},n);r={messageChannel:i,onMessage(e){const t=e;if(t.data.eventId===c)switch(t.data.status){case"ack":clearTimeout(h),s=setTimeout(()=>{a(new Error("timeout"))},3e3);break;case"done":clearTimeout(s),o(t.data.response);break;default:clearTimeout(h),clearTimeout(s),a(new Error("invalid_response"))}}},this.handlers.add(r),i.port1.addEventListener("message",r.onMessage),this.target.postMessage({eventType:e,eventId:c,data:t},[i.port2])}).finally(()=>{r&&this.removeMessageHandler(r)})}}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */function ii(){return window}
/**
   * @license
   * Copyright 2020 Google LLC.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
function si(){return void 0!==ii().WorkerGlobalScope&&"function"==typeof ii().importScripts}
/**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
const ri="firebaseLocalStorageDb",oi="firebaseLocalStorage",ai="fbase_key";class ci{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function hi(e,t){return e.transaction([oi],t?"readwrite":"readonly").objectStore(oi)}function li(){const e=indexedDB.open(ri,1);return new Promise((t,n)=>{e.addEventListener("error",()=>{n(e.error)}),e.addEventListener("upgradeneeded",()=>{const t=e.result;try{t.createObjectStore(oi,{keyPath:ai})}catch(i){n(i)}}),e.addEventListener("success",async()=>{const n=e.result;n.objectStoreNames.contains(oi)?t(n):(n.close(),await function(){const e=indexedDB.deleteDatabase(ri);return new ci(e).toPromise()}(),t(await li()))})})}async function ui(e,t,n){const i=hi(e,!0).put({[ai]:t,value:n});return new ci(i).toPromise()}function di(e,t){const n=hi(e,!0).delete(t);return new ci(n).toPromise()}class fi{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db||(this.db=await li()),this.db}async _withRetries(e){let t=0;for(;;)try{const t=await this._openDb();return await e(t)}catch(n){if(t++>3)throw n;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return si()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=ei._getInstance(si()?self:null),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var e,t;if(this.activeServiceWorker=await async function(){if(!(null===navigator||void 0===navigator?void 0:navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch(e){return null}}(),!this.activeServiceWorker)return;this.sender=new ni(this.activeServiceWorker);const n=await this.sender._send("ping",{},800);n&&(null===(e=n[0])||void 0===e?void 0:e.fulfilled)&&(null===(t=n[0])||void 0===t?void 0:t.value.includes("keyChanged"))&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){var t;if(this.sender&&this.activeServiceWorker&&((null===(t=null===navigator||void 0===navigator?void 0:navigator.serviceWorker)||void 0===t?void 0:t.controller)||null)===this.activeServiceWorker)try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch(t){}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await li();return await ui(e,Gn,"1"),await di(e,Gn),!0}catch(e){}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(n=>ui(n,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(t=>async function(e,t){const n=hi(e,!1).get(t),i=await new ci(n).toPromise();return void 0===i?null:i.value}(t,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>di(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(e=>{const t=hi(e,!1).getAll();return new ci(t).toPromise()});if(!e)return[];if(0!==this.pendingWrites)return[];const t=[],n=new Set;if(0!==e.length)for(const{fbase_key:i,value:s}of e)n.add(i),JSON.stringify(this.localCache[i])!==JSON.stringify(s)&&(this.notifyListeners(i,s),t.push(i));for(const i of Object.keys(this.localCache))this.localCache[i]&&!n.has(i)&&(this.notifyListeners(i,null),t.push(i));return t}notifyListeners(e,t){this.localCache[e]=t;const n=this.listeners[e];if(n)for(const i of Array.from(n))i(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),800)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){0===Object.keys(this.listeners).length&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),0===this.listeners[e].size&&delete this.listeners[e]),0===Object.keys(this.listeners).length&&this.stopPolling()}}fi.type="LOCAL";const pi=fi;
/**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
function gi(e,t){return t?cn(t):(At(e._popupRedirectResolver,e,"argument-error"),e._popupRedirectResolver)}
/**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */new Lt(3e4,6e4);class mi extends On{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Ln(e,this._buildIdpRequest())}_linkToIdToken(e,t){return Ln(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return Ln(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function _i(e){
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
return async function(e,t,n=!1){if(tt(e.app))return Promise.reject(kt(e));const i="signIn",s=await Kn(e,i,t),r=await zn._fromIdTokenResponse(e,i,s);return n||await e._updateCurrentUser(r.user),r}(e.auth,new mi(e),e.bypassAuthState)}function yi(e){const{auth:t,user:n}=e;return At(n,t,"internal-error"),
/**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
async function(e,t,n=!1){const{auth:i}=e;if(tt(i.app))return Promise.reject(kt(i));const s="reauthenticate";try{const r=await Xt(e,Kn(i,s,t,e),n);At(r.idToken,i,"internal-error");const o=Yt(r.idToken);At(o,i,"internal-error");const{sub:a}=o;return At(e.uid===a,i,"user-mismatch"),zn._forOperation(e,s,r)}catch(r){throw"auth/user-not-found"===(null==r?void 0:r.code)&&Ct(i,"user-mismatch"),r}}(n,new mi(e),e.bypassAuthState)}async function vi(e){const{auth:t,user:n}=e;return At(n,t,"internal-error"),async function(e,t,n=!1){const i=await Xt(e,t._linkToIdToken(e.auth,await e.getIdToken()),n);return zn._forOperation(e,"link",i)}(n,new mi(e),e.bypassAuthState)}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class wi{constructor(e,t,n,i,s=!1){this.auth=e,this.resolver=n,this.user=i,this.bypassAuthState=s,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(n){this.reject(n)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:n,postBody:i,tenantId:s,error:r,type:o}=e;if(r)return void this.reject(r);const a={auth:this.auth,requestUri:t,sessionId:n,tenantId:s||void 0,postBody:i||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(o)(a))}catch(c){this.reject(c)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return _i;case"linkViaPopup":case"linkViaRedirect":return vi;case"reauthViaPopup":case"reauthViaRedirect":return yi;default:Ct(this.auth,"internal-error")}}resolve(e){Pt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Pt(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */const Ti=new Lt(2e3,1e4);async function Ii(e,t,n){if(tt(e.app))return Promise.reject(Et(e,"operation-not-supported-in-this-environment"));const i=Nn(e);!function(e,t,n){if(!(t instanceof n))throw n.name!==t.constructor.name&&Ct(e,"argument-error"),St(e,"argument-error",`Type of ${t.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}(e,t,Fn);const s=gi(i,n);return new bi(i,"signInViaPopup",t,s).executeNotNull()}class bi extends wi{constructor(e,t,n,i,s){super(e,t,i,s),this.provider=n,this.authWindow=null,this.pollId=null,bi.currentPopupAction&&bi.currentPopupAction.cancel(),bi.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return At(e,this.auth,"internal-error"),e}async onExecution(){Pt(1===this.filter.length,"Popup operations only handle one event");const e=ti();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(e=>{this.reject(e)}),this.resolver._isIframeWebStorageSupported(this.auth,e=>{e||this.reject(Et(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return(null===(e=this.authWindow)||void 0===e?void 0:e.associatedEvent)||null}cancel(){this.reject(Et(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,bi.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,n;(null===(n=null===(t=this.authWindow)||void 0===t?void 0:t.window)||void 0===n?void 0:n.closed)?this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(Et(this.auth,"popup-closed-by-user"))},8e3):this.pollId=window.setTimeout(e,Ti.get())};e()}}bi.currentPopupAction=null;
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
const Ci="pendingRedirect",Ei=new Map;class Si extends wi{constructor(e,t,n=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,n),this.eventId=null}async execute(){let e=Ei.get(this.auth._key());if(!e){try{const t=await async function(e,t){const n=function(e){return un(Ci,e.config.apiKey,e.name)}(t),i=function(e){return cn(e._redirectPersistence)}(e);if(!(await i._isAvailable()))return!1;const s="true"===await i._get(n);return await i._remove(n),s}(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(t)}catch(t){e=()=>Promise.reject(t)}Ei.set(this.auth._key(),e)}return this.bypassAuthState||Ei.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if("signInViaRedirect"===e.type)return super.onAuthEvent(e);if("unknown"!==e.type){if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}else this.resolve(null)}async onExecution(){}cleanUp(){}}function ki(e,t){Ei.set(e._key(),t)}async function Ni(e,t,n=!1){if(tt(e.app))return Promise.reject(kt(e));const i=Nn(e),s=gi(i,t),r=new Si(i,s,n),o=await r.execute();return o&&!n&&(delete o.user._redirectEventId,await i._persistUserIfCurrent(o.user),await i._setRedirectUser(null,t)),o}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Ai{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(n=>{this.isEventForConsumer(e,n)&&(t=!0,this.sendToConsumer(e,n),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!function(e){switch(e.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Pi(e);default:return!1}}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var n;if(e.error&&!Pi(e)){const i=(null===(n=e.error.code)||void 0===n?void 0:n.split("auth/")[1])||"internal-error";t.onError(Et(this.auth,i))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const n=null===t.eventId||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&n}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=6e5&&this.cachedEventUids.clear(),this.cachedEventUids.has(Ri(e))}saveEventToCache(e){this.cachedEventUids.add(Ri(e)),this.lastProcessedEventTime=Date.now()}}function Ri(e){return[e.type,e.eventId,e.sessionId,e.tenantId].filter(e=>e).join("-")}function Pi({type:e,error:t}){return"unknown"===e&&"auth/no-auth-event"===(null==t?void 0:t.code)}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
const Di=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,xi=/^https?/;async function Oi(e){if(e.config.emulator)return;const{authorizedDomains:t}=await async function(e,t={}){return jt(e,"GET","/v1/projects",t)}(e);for(const i of t)try{if(Li(i))return}catch(n){}Ct(e,"unauthorized-domain")}function Li(e){const t=Dt(),{protocol:n,hostname:i}=new URL(t);if(e.startsWith("chrome-extension://")){const s=new URL(e);return""===s.hostname&&""===i?"chrome-extension:"===n&&e.replace("chrome-extension://","")===t.replace("chrome-extension://",""):"chrome-extension:"===n&&s.hostname===i}if(!xi.test(n))return!1;if(Di.test(e))return i===e;const s=e.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(i)}
/**
   * @license
   * Copyright 2020 Google LLC.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */const Mi=new Lt(3e4,6e4);function Fi(){const e=ii().___jsl;if(null==e?void 0:e.H)for(const t of Object.keys(e.H))if(e.H[t].r=e.H[t].r||[],e.H[t].L=e.H[t].L||[],e.H[t].r=[...e.H[t].L],e.CP)for(let n=0;n<e.CP.length;n++)e.CP[n]=null}function Ui(e){return new Promise((t,n)=>{var i,s,r,o;function a(){Fi(),gapi.load("gapi.iframes",{callback:()=>{t(gapi.iframes.getContext())},ontimeout:()=>{Fi(),n(Et(e,"network-request-failed"))},timeout:Mi.get()})}if(null===(s=null===(i=ii().gapi)||void 0===i?void 0:i.iframes)||void 0===s?void 0:s.Iframe)t(gapi.iframes.getContext());else{if(!(null===(r=ii().gapi)||void 0===r?void 0:r.load)){const t=`__${"iframefcb"}${Math.floor(1e6*Math.random())}`;return ii()[t]=()=>{gapi.load?a():n(Et(e,"network-request-failed"))},(o=`${Rn.gapiScript}?onload=${t}`,Rn.loadJS(o)).catch(e=>n(e))}a()}}).catch(e=>{throw Vi=null,e})}let Vi=null;
/**
   * @license
   * Copyright 2020 Google LLC.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
const qi=new Lt(5e3,15e3),ji={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},Bi=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function zi(e){const t=e.config;At(t.authDomain,e,"auth-domain-config-required");const n=t.emulator?Mt(t,"emulator/auth/iframe"):`https://${e.config.authDomain}/__/auth/iframe`,i={apiKey:t.apiKey,appName:e.name,v:st},s=Bi.get(e.config.apiHost);s&&(i.eid=s);const r=e._getFrameworks();return r.length&&(i.fw=r.join(",")),`${n}?${F(i).slice(1)}`}async function $i(e){const t=await function(e){return Vi=Vi||Ui(e),Vi}(e),n=ii().gapi;return At(n,e,"internal-error"),t.open({where:document.body,url:zi(e),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:ji,dontclear:!0},t=>new Promise(async(n,i)=>{await t.restyle({setHideOnLeave:!1});const s=Et(e,"network-request-failed"),r=ii().setTimeout(()=>{i(s)},qi.get());function o(){ii().clearTimeout(r),n(t)}t.ping(o).then(o,()=>{i(s)})}))}
/**
   * @license
   * Copyright 2020 Google LLC.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */const Wi={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"};class Hi{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch(e){}}}function Ki(e,t,n,i=500,s=600){const r=Math.max((window.screen.availHeight-s)/2,0).toString(),o=Math.max((window.screen.availWidth-i)/2,0).toString();let a="";const c=Object.assign(Object.assign({},Wi),{width:i.toString(),height:s.toString(),top:r,left:o}),h=T().toLowerCase();n&&(a=mn(h)?"_blank":n),pn(h)&&(t=t||"http://localhost",c.scrollbars="yes");const l=Object.entries(c).reduce((e,[t,n])=>`${e}${t}=${n},`,"");if(function(e=T()){var t;return Tn(e)&&!!(null===(t=window.navigator)||void 0===t?void 0:t.standalone)}(h)&&"_self"!==a)return function(e,t){const n=document.createElement("a");n.href=e,n.target=t;const i=document.createEvent("MouseEvent");i.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(i)}
/**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */(t||"",a),new Hi(null);const u=window.open(t||"",a,l);At(u,e,"popup-blocked");try{u.focus()}catch(d){}return new Hi(u)}const Gi="__/auth/handler",Qi="emulator/auth/handler",Yi=encodeURIComponent("fac");async function Ji(e,t,n,i,s,r){At(e.config.authDomain,e,"auth-domain-config-required"),At(e.config.apiKey,e,"invalid-api-key");const o={apiKey:e.config.apiKey,appName:e.name,authType:n,redirectUrl:i,v:st,eventId:s};if(t instanceof Fn){t.setDefaultLanguage(e.languageCode),o.providerId=t.providerId||"",x(t.getCustomParameters())||(o.customParameters=JSON.stringify(t.getCustomParameters()));for(const[e,t]of Object.entries({}))o[e]=t}if(t instanceof Un){const e=t.getScopes().filter(e=>""!==e);e.length>0&&(o.scopes=e.join(","))}e.tenantId&&(o.tid=e.tenantId);const a=o;for(const l of Object.keys(a))void 0===a[l]&&delete a[l];const c=await e._getAppCheckToken(),h=c?`#${Yi}=${encodeURIComponent(c)}`:"";return`${function({config:e}){if(!e.emulator)return`https://${e.authDomain}/${Gi}`;return Mt(e,Qi)}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */(e)}?${F(a).slice(1)}${h}`}const Xi="webStorageSupport";const Zi=class{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=Zn,this._completeRedirectFn=Ni,this._overrideRedirectResult=ki}async _openPopup(e,t,n,i){var s;Pt(null===(s=this.eventManagers[e._key()])||void 0===s?void 0:s.manager,"_initialize() not called before _openPopup()");return Ki(e,await Ji(e,t,n,Dt(),i),ti())}async _openRedirect(e,t,n,i){await this._originValidation(e);return function(e){ii().location.href=e}(await Ji(e,t,n,Dt(),i)),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:e,promise:n}=this.eventManagers[t];return e?Promise.resolve(e):(Pt(n,"If manager is not set, promise should be"),n)}const n=this.initAndGetManager(e);return this.eventManagers[t]={promise:n},n.catch(()=>{delete this.eventManagers[t]}),n}async initAndGetManager(e){const t=await $i(e),n=new Ai(e);return t.register("authEvent",t=>{At(null==t?void 0:t.authEvent,e,"invalid-auth-event");return{status:n.onEvent(t.authEvent)?"ACK":"ERROR"}},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:n},this.iframes[e._key()]=t,n}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(Xi,{type:Xi},n=>{var i;const s=null===(i=null==n?void 0:n[0])||void 0===i?void 0:i[Xi];void 0!==s&&t(!!s),Ct(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=Oi(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return bn()||gn()||Tn()}};var es="@firebase/auth",ts="1.7.9";
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
class ns{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),(null===(e=this.auth.currentUser)||void 0===e?void 0:e.uid)||null}async getToken(e){if(this.assertAuthConfigured(),await this.auth._initializationPromise,!this.auth.currentUser)return null;return{accessToken:await this.auth.currentUser.getIdToken(e)}}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(t=>{e((null==t?void 0:t.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){At(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
/**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
const is=y("authIdTokenMaxAge")||300;let ss=null;var rs;Rn={loadJS:e=>new Promise((t,n)=>{const i=document.createElement("script");var s,r;i.setAttribute("src",e),i.onload=t,i.onerror=e=>{const t=Et("internal-error");t.customData=e,n(t)},i.type="text/javascript",i.charset="UTF-8",(null!==(r=null===(s=document.getElementsByTagName("head"))||void 0===s?void 0:s[0])&&void 0!==r?r:document).appendChild(i)}),gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="},rs="Browser",Ze(new $("auth",(e,{options:t})=>{const n=e.getProvider("app").getImmediate(),i=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:r,authDomain:o}=n.options;At(r&&!r.includes(":"),"invalid-api-key",{appName:n.name});const a={apiKey:r,authDomain:o,clientPlatform:rs,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:Cn(rs)},c=new kn(n,i,s,a);return function(e,t){const n=(null==t?void 0:t.persistence)||[],i=(Array.isArray(n)?n:[n]).map(cn);(null==t?void 0:t.errorMap)&&e._updateErrorMap(t.errorMap),e._initializeWithPersistence(i,null==t?void 0:t.popupRedirectResolver)}(c,t),c},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,n)=>{e.getProvider("auth-internal").initialize()})),Ze(new $("auth-internal",e=>{const t=Nn(e.getProvider("auth").getImmediate());return new ns(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),at(es,ts,function(e){switch(e){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}(rs)),at(es,ts,"esm2017");var os={};const as="@firebase/database",cs="1.0.8";
/**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
let hs="";
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
class ls{constructor(e){this.domStorage_=e,this.prefix_="firebase:"}set(e,t){null==t?this.domStorage_.removeItem(this.prefixedName_(e)):this.domStorage_.setItem(this.prefixedName_(e),A(t))}get(e){const t=this.domStorage_.getItem(this.prefixedName_(e));return null==t?null:N(t)}remove(e){this.domStorage_.removeItem(this.prefixedName_(e))}prefixedName_(e){return this.prefix_+e}toString(){return this.domStorage_.toString()}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class us{constructor(){this.cache_={},this.isInMemoryStorage=!0}set(e,t){null==t?delete this.cache_[e]:this.cache_[e]=t}get(e){return P(this.cache_,e)?this.cache_[e]:null}remove(e){delete this.cache_[e]}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */const ds=function(e){try{if("undefined"!=typeof window&&void 0!==window[e]){const t=window[e];return t.setItem("firebase:sentinel","cache"),t.removeItem("firebase:sentinel"),new ls(t)}}catch(t){}return new us},fs=ds("localStorage"),ps=ds("sessionStorage"),gs=new ee("@firebase/database"),ms=function(){let e=1;return function(){return e++}}(),_s=function(e){const t=function(e){const t=[];let i=0;for(let s=0;s<e.length;s++){let r=e.charCodeAt(s);if(r>=55296&&r<=56319){const t=r-55296;s++,n(s<e.length,"Surrogate pair missing trail surrogate."),r=65536+(t<<10)+(e.charCodeAt(s)-56320)}r<128?t[i++]=r:r<2048?(t[i++]=r>>6|192,t[i++]=63&r|128):r<65536?(t[i++]=r>>12|224,t[i++]=r>>6&63|128,t[i++]=63&r|128):(t[i++]=r>>18|240,t[i++]=r>>12&63|128,t[i++]=r>>6&63|128,t[i++]=63&r|128)}return t}(e),i=new U;i.update(t);const s=i.digest();return r.encodeByteArray(s)},ys=function(...e){let t="";for(let n=0;n<e.length;n++){const i=e[n];Array.isArray(i)||i&&"object"==typeof i&&"number"==typeof i.length?t+=ys.apply(null,i):t+="object"==typeof i?A(i):i,t+=" "}return t};let vs=null,ws=!0;const Ts=function(...e){if(!0===ws&&(ws=!1,null===vs&&!0===ps.get("logging_enabled")&&(n(!0,"Can't turn on custom loggers persistently."),gs.logLevel=G.VERBOSE,vs=gs.log.bind(gs))),vs){const t=ys.apply(null,e);vs(t)}},Is=function(e){return function(...t){Ts(e,...t)}},bs=function(...e){const t="FIREBASE INTERNAL ERROR: "+ys(...e);gs.error(t)},Cs=function(...e){const t=`FIREBASE FATAL ERROR: ${ys(...e)}`;throw gs.error(t),new Error(t)},Es=function(...e){const t="FIREBASE WARNING: "+ys(...e);gs.warn(t)},Ss=function(e){return"number"==typeof e&&(e!=e||e===Number.POSITIVE_INFINITY||e===Number.NEGATIVE_INFINITY)},ks="[MIN_NAME]",Ns="[MAX_NAME]",As=function(e,t){if(e===t)return 0;if(e===ks||t===Ns)return-1;if(t===ks||e===Ns)return 1;{const n=Fs(e),i=Fs(t);return null!==n?null!==i?n-i===0?e.length-t.length:n-i:-1:null!==i?1:e<t?-1:1}},Rs=function(e,t){return e===t?0:e<t?-1:1},Ps=function(e,t){if(t&&e in t)return t[e];throw new Error("Missing required key ("+e+") in object: "+A(t))},Ds=function(e){if("object"!=typeof e||null===e)return A(e);const t=[];for(const i in e)t.push(i);t.sort();let n="{";for(let i=0;i<t.length;i++)0!==i&&(n+=","),n+=A(t[i]),n+=":",n+=Ds(e[t[i]]);return n+="}",n},xs=function(e,t){const n=e.length;if(n<=t)return[e];const i=[];for(let s=0;s<n;s+=t)s+t>n?i.push(e.substring(s,n)):i.push(e.substring(s,s+t));return i};function Os(e,t){for(const n in e)e.hasOwnProperty(n)&&t(n,e[n])}const Ls=function(e){n(!Ss(e),"Invalid JSON number");const t=1023;let i,s,r,o,a;0===e?(s=0,r=0,i=1/e==-1/0?1:0):(i=e<0,(e=Math.abs(e))>=Math.pow(2,-1022)?(o=Math.min(Math.floor(Math.log(e)/Math.LN2),t),s=o+t,r=Math.round(e*Math.pow(2,52-o)-Math.pow(2,52))):(s=0,r=Math.round(e/Math.pow(2,-1074))));const c=[];for(a=52;a;a-=1)c.push(r%2?1:0),r=Math.floor(r/2);for(a=11;a;a-=1)c.push(s%2?1:0),s=Math.floor(s/2);c.push(i?1:0),c.reverse();const h=c.join("");let l="";for(a=0;a<64;a+=8){let e=parseInt(h.substr(a,8),2).toString(16);1===e.length&&(e="0"+e),l+=e}return l.toLowerCase()};const Ms=new RegExp("^-?(0*)\\d{1,10}$"),Fs=function(e){if(Ms.test(e)){const t=Number(e);if(t>=-2147483648&&t<=2147483647)return t}return null},Us=function(e){try{e()}catch(t){setTimeout(()=>{const e=t.stack||"";throw Es("Exception was thrown by user callback.",e),t},Math.floor(0))}},Vs=function(e,t){const n=setTimeout(e,t);return"number"==typeof n&&"undefined"!=typeof Deno&&Deno.unrefTimer?Deno.unrefTimer(n):"object"==typeof n&&n.unref&&n.unref(),n};
/**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
class qs{constructor(e,t){this.appName_=e,this.appCheckProvider=t,this.appCheck=null==t?void 0:t.getImmediate({optional:!0}),this.appCheck||null==t||t.get().then(e=>this.appCheck=e)}getToken(e){return this.appCheck?this.appCheck.getToken(e):new Promise((t,n)=>{setTimeout(()=>{this.appCheck?this.getToken(e).then(t,n):t(null)},0)})}addTokenChangeListener(e){var t;null===(t=this.appCheckProvider)||void 0===t||t.get().then(t=>t.addTokenListener(e))}notifyForInvalidToken(){Es(`Provided AppCheck credentials for the app named "${this.appName_}" are invalid. This usually indicates your app was not initialized correctly.`)}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class js{constructor(e,t,n){this.appName_=e,this.firebaseOptions_=t,this.authProvider_=n,this.auth_=null,this.auth_=n.getImmediate({optional:!0}),this.auth_||n.onInit(e=>this.auth_=e)}getToken(e){return this.auth_?this.auth_.getToken(e).catch(e=>e&&"auth/token-not-initialized"===e.code?(Ts("Got auth/token-not-initialized error.  Treating as null token."),null):Promise.reject(e)):new Promise((t,n)=>{setTimeout(()=>{this.auth_?this.getToken(e).then(t,n):t(null)},0)})}addTokenChangeListener(e){this.auth_?this.auth_.addAuthTokenListener(e):this.authProvider_.get().then(t=>t.addAuthTokenListener(e))}removeTokenChangeListener(e){this.authProvider_.get().then(t=>t.removeAuthTokenListener(e))}notifyForInvalidToken(){let e='Provided authentication credentials for the app named "'+this.appName_+'" are invalid. This usually indicates your app was not initialized correctly. ';"credential"in this.firebaseOptions_?e+='Make sure the "credential" property provided to initializeApp() is authorized to access the specified "databaseURL" and is from the correct project.':"serviceAccount"in this.firebaseOptions_?e+='Make sure the "serviceAccount" property provided to initializeApp() is authorized to access the specified "databaseURL" and is from the correct project.':e+='Make sure the "apiKey" and "databaseURL" properties provided to initializeApp() match the values provided for your app at https://console.firebase.google.com/.',Es(e)}}class Bs{constructor(e){this.accessToken=e}getToken(e){return Promise.resolve({accessToken:this.accessToken})}addTokenChangeListener(e){e(this.accessToken)}removeTokenChangeListener(e){}notifyForInvalidToken(){}}Bs.OWNER="owner";
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
const zs=/(console\.firebase|firebase-console-\w+\.corp|firebase\.corp)\.google\.com/,$s="ac",Ws="websocket",Hs="long_polling";
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
class Ks{constructor(e,t,n,i,s=!1,r="",o=!1,a=!1){this.secure=t,this.namespace=n,this.webSocketOnly=i,this.nodeAdmin=s,this.persistenceKey=r,this.includeNamespaceInQueryParams=o,this.isUsingEmulator=a,this._host=e.toLowerCase(),this._domain=this._host.substr(this._host.indexOf(".")+1),this.internalHost=fs.get("host:"+e)||this._host}isCacheableHost(){return"s-"===this.internalHost.substr(0,2)}isCustomHost(){return"firebaseio.com"!==this._domain&&"firebaseio-demo.com"!==this._domain}get host(){return this._host}set host(e){e!==this.internalHost&&(this.internalHost=e,this.isCacheableHost()&&fs.set("host:"+this._host,this.internalHost))}toString(){let e=this.toURLString();return this.persistenceKey&&(e+="<"+this.persistenceKey+">"),e}toURLString(){const e=this.secure?"https://":"http://",t=this.includeNamespaceInQueryParams?`?ns=${this.namespace}`:"";return`${e}${this.host}/${t}`}}function Gs(e,t,i){let s;if(n("string"==typeof t,"typeof type must == string"),n("object"==typeof i,"typeof params must == object"),t===Ws)s=(e.secure?"wss://":"ws://")+e.internalHost+"/.ws?";else{if(t!==Hs)throw new Error("Unknown connection type: "+t);s=(e.secure?"https://":"http://")+e.internalHost+"/.lp?"}(function(e){return e.host!==e.internalHost||e.isCustomHost()||e.includeNamespaceInQueryParams})(e)&&(i.ns=e.namespace);const r=[];return Os(i,(e,t)=>{r.push(e+"="+t)}),s+r.join("&")}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Qs{constructor(){this.counters_={}}incrementCounter(e,t=1){P(this.counters_,e)||(this.counters_[e]=0),this.counters_[e]+=t}get(){return l(this.counters_)}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */const Ys={},Js={};function Xs(e){const t=e.toString();return Ys[t]||(Ys[t]=new Qs),Ys[t]}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
class Zs{constructor(e){this.onMessage_=e,this.pendingResponses=[],this.currentResponseNum=0,this.closeAfterResponse=-1,this.onClose=null}closeAfter(e,t){this.closeAfterResponse=e,this.onClose=t,this.closeAfterResponse<this.currentResponseNum&&(this.onClose(),this.onClose=null)}handleResponse(e,t){for(this.pendingResponses[e]=t;this.pendingResponses[this.currentResponseNum];){const e=this.pendingResponses[this.currentResponseNum];delete this.pendingResponses[this.currentResponseNum];for(let t=0;t<e.length;++t)e[t]&&Us(()=>{this.onMessage_(e[t])});if(this.currentResponseNum===this.closeAfterResponse){this.onClose&&(this.onClose(),this.onClose=null);break}this.currentResponseNum++}}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */const er="start";class tr{constructor(e,t,n,i,s,r,o){this.connId=e,this.repoInfo=t,this.applicationId=n,this.appCheckToken=i,this.authToken=s,this.transportSessionId=r,this.lastSessionId=o,this.bytesSent=0,this.bytesReceived=0,this.everConnected_=!1,this.log_=Is(e),this.stats_=Xs(t),this.urlFn=e=>(this.appCheckToken&&(e[$s]=this.appCheckToken),Gs(t,Hs,e))}open(e,t){this.curSegmentNum=0,this.onDisconnect_=t,this.myPacketOrderer=new Zs(e),this.isClosed_=!1,this.connectTimeoutTimer_=setTimeout(()=>{this.log_("Timed out trying to connect."),this.onClosed_(),this.connectTimeoutTimer_=null},Math.floor(3e4)),function(e){if("complete"===document.readyState)e();else{let t=!1;const n=function(){document.body?t||(t=!0,e()):setTimeout(n,Math.floor(10))};document.addEventListener?(document.addEventListener("DOMContentLoaded",n,!1),window.addEventListener("load",n,!1)):document.attachEvent&&(document.attachEvent("onreadystatechange",()=>{"complete"===document.readyState&&n()}),window.attachEvent("onload",n))}}(()=>{if(this.isClosed_)return;this.scriptTagHolder=new nr((...e)=>{const[t,n,i,s,r]=e;if(this.incrementIncomingBytes_(e),this.scriptTagHolder)if(this.connectTimeoutTimer_&&(clearTimeout(this.connectTimeoutTimer_),this.connectTimeoutTimer_=null),this.everConnected_=!0,t===er)this.id=n,this.password=i;else{if("close"!==t)throw new Error("Unrecognized command received: "+t);n?(this.scriptTagHolder.sendNewPolls=!1,this.myPacketOrderer.closeAfter(n,()=>{this.onClosed_()})):this.onClosed_()}},(...e)=>{const[t,n]=e;this.incrementIncomingBytes_(e),this.myPacketOrderer.handleResponse(t,n)},()=>{this.onClosed_()},this.urlFn);const e={};e[er]="t",e.ser=Math.floor(1e8*Math.random()),this.scriptTagHolder.uniqueCallbackIdentifier&&(e.cb=this.scriptTagHolder.uniqueCallbackIdentifier),e.v="5",this.transportSessionId&&(e.s=this.transportSessionId),this.lastSessionId&&(e.ls=this.lastSessionId),this.applicationId&&(e.p=this.applicationId),this.appCheckToken&&(e[$s]=this.appCheckToken),"undefined"!=typeof location&&location.hostname&&zs.test(location.hostname)&&(e.r="f");const t=this.urlFn(e);this.log_("Connecting via long-poll to "+t),this.scriptTagHolder.addTag(t,()=>{})})}start(){this.scriptTagHolder.startLongPoll(this.id,this.password),this.addDisconnectPingFrame(this.id,this.password)}static forceAllow(){tr.forceAllow_=!0}static forceDisallow(){tr.forceDisallow_=!0}static isAvailable(){return!!tr.forceAllow_||!(tr.forceDisallow_||"undefined"==typeof document||null==document.createElement||"object"==typeof window&&window.chrome&&window.chrome.extension&&!/^chrome/.test(window.location.href)||"object"==typeof Windows&&"object"==typeof Windows.UI)}markConnectionHealthy(){}shutdown_(){this.isClosed_=!0,this.scriptTagHolder&&(this.scriptTagHolder.close(),this.scriptTagHolder=null),this.myDisconnFrame&&(document.body.removeChild(this.myDisconnFrame),this.myDisconnFrame=null),this.connectTimeoutTimer_&&(clearTimeout(this.connectTimeoutTimer_),this.connectTimeoutTimer_=null)}onClosed_(){this.isClosed_||(this.log_("Longpoll is closing itself"),this.shutdown_(),this.onDisconnect_&&(this.onDisconnect_(this.everConnected_),this.onDisconnect_=null))}close(){this.isClosed_||(this.log_("Longpoll is being closed."),this.shutdown_())}send(e){const t=A(e);this.bytesSent+=t.length,this.stats_.incrementCounter("bytes_sent",t.length);const n=a(t),i=xs(n,1840);for(let s=0;s<i.length;s++)this.scriptTagHolder.enqueueSegment(this.curSegmentNum,i.length,i[s]),this.curSegmentNum++}addDisconnectPingFrame(e,t){this.myDisconnFrame=document.createElement("iframe");const n={dframe:"t"};n.id=e,n.pw=t,this.myDisconnFrame.src=this.urlFn(n),this.myDisconnFrame.style.display="none",document.body.appendChild(this.myDisconnFrame)}incrementIncomingBytes_(e){const t=A(e).length;this.bytesReceived+=t,this.stats_.incrementCounter("bytes_received",t)}}class nr{constructor(e,t,n,i){this.onDisconnect=n,this.urlFn=i,this.outstandingRequests=new Set,this.pendingSegs=[],this.currentSerial=Math.floor(1e8*Math.random()),this.sendNewPolls=!0;{this.uniqueCallbackIdentifier=ms(),window["pLPCommand"+this.uniqueCallbackIdentifier]=e,window["pRTLPCB"+this.uniqueCallbackIdentifier]=t,this.myIFrame=nr.createIFrame_();let n="";if(this.myIFrame.src&&"javascript:"===this.myIFrame.src.substr(0,11)){n='<script>document.domain="'+document.domain+'";<\/script>'}const i="<html><body>"+n+"</body></html>";try{this.myIFrame.doc.open(),this.myIFrame.doc.write(i),this.myIFrame.doc.close()}catch(s){Ts("frame writing exception"),s.stack&&Ts(s.stack),Ts(s)}}}static createIFrame_(){const e=document.createElement("iframe");if(e.style.display="none",!document.body)throw"Document body has not initialized. Wait to initialize Firebase until after the document is ready.";document.body.appendChild(e);try{e.contentWindow.document||Ts("No IE domain setting required")}catch(t){const n=document.domain;e.src="javascript:void((function(){document.open();document.domain='"+n+"';document.close();})())"}return e.contentDocument?e.doc=e.contentDocument:e.contentWindow?e.doc=e.contentWindow.document:e.document&&(e.doc=e.document),e}close(){this.alive=!1,this.myIFrame&&(this.myIFrame.doc.body.textContent="",setTimeout(()=>{null!==this.myIFrame&&(document.body.removeChild(this.myIFrame),this.myIFrame=null)},Math.floor(0)));const e=this.onDisconnect;e&&(this.onDisconnect=null,e())}startLongPoll(e,t){for(this.myID=e,this.myPW=t,this.alive=!0;this.newRequest_(););}newRequest_(){if(this.alive&&this.sendNewPolls&&this.outstandingRequests.size<(this.pendingSegs.length>0?2:1)){this.currentSerial++;const e={};e.id=this.myID,e.pw=this.myPW,e.ser=this.currentSerial;let t=this.urlFn(e),n="",i=0;for(;this.pendingSegs.length>0;){if(!(this.pendingSegs[0].d.length+30+n.length<=1870))break;{const e=this.pendingSegs.shift();n=n+"&seg"+i+"="+e.seg+"&ts"+i+"="+e.ts+"&d"+i+"="+e.d,i++}}return t+=n,this.addLongPollTag_(t,this.currentSerial),!0}return!1}enqueueSegment(e,t,n){this.pendingSegs.push({seg:e,ts:t,d:n}),this.alive&&this.newRequest_()}addLongPollTag_(e,t){this.outstandingRequests.add(t);const n=()=>{this.outstandingRequests.delete(t),this.newRequest_()},i=setTimeout(n,Math.floor(25e3));this.addTag(e,()=>{clearTimeout(i),n()})}addTag(e,t){setTimeout(()=>{try{if(!this.sendNewPolls)return;const n=this.myIFrame.doc.createElement("script");n.type="text/javascript",n.async=!0,n.src=e,n.onload=n.onreadystatechange=function(){const e=n.readyState;e&&"loaded"!==e&&"complete"!==e||(n.onload=n.onreadystatechange=null,n.parentNode&&n.parentNode.removeChild(n),t())},n.onerror=()=>{Ts("Long-poll script failed to load: "+e),this.sendNewPolls=!1,this.close()},this.myIFrame.doc.body.appendChild(n)}catch(n){}},Math.floor(1))}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */let ir=null;"undefined"!=typeof MozWebSocket?ir=MozWebSocket:"undefined"!=typeof WebSocket&&(ir=WebSocket);class sr{constructor(e,t,n,i,s,r,o){this.connId=e,this.applicationId=n,this.appCheckToken=i,this.authToken=s,this.keepaliveTimer=null,this.frames=null,this.totalFrames=0,this.bytesSent=0,this.bytesReceived=0,this.log_=Is(this.connId),this.stats_=Xs(t),this.connURL=sr.connectionURL_(t,r,o,i,n),this.nodeAdmin=t.nodeAdmin}static connectionURL_(e,t,n,i,s){const r={v:"5"};return"undefined"!=typeof location&&location.hostname&&zs.test(location.hostname)&&(r.r="f"),t&&(r.s=t),n&&(r.ls=n),i&&(r[$s]=i),s&&(r.p=s),Gs(e,Ws,r)}open(e,t){this.onDisconnect=t,this.onMessage=e,this.log_("Websocket connecting to "+this.connURL),this.everConnected_=!1,fs.set("previous_websocket_failure",!0);try{let e;this.mySock=new ir(this.connURL,[],e)}catch(n){this.log_("Error instantiating WebSocket.");const e=n.message||n.data;return e&&this.log_(e),void this.onClosed_()}this.mySock.onopen=()=>{this.log_("Websocket connected."),this.everConnected_=!0},this.mySock.onclose=()=>{this.log_("Websocket connection was disconnected."),this.mySock=null,this.onClosed_()},this.mySock.onmessage=e=>{this.handleIncomingFrame(e)},this.mySock.onerror=e=>{this.log_("WebSocket error.  Closing connection.");const t=e.message||e.data;t&&this.log_(t),this.onClosed_()}}start(){}static forceDisallow(){sr.forceDisallow_=!0}static isAvailable(){let e=!1;if("undefined"!=typeof navigator&&navigator.userAgent){const t=/Android ([0-9]{0,}\.[0-9]{0,})/,n=navigator.userAgent.match(t);n&&n.length>1&&parseFloat(n[1])<4.4&&(e=!0)}return!e&&null!==ir&&!sr.forceDisallow_}static previouslyFailed(){return fs.isInMemoryStorage||!0===fs.get("previous_websocket_failure")}markConnectionHealthy(){fs.remove("previous_websocket_failure")}appendFrame_(e){if(this.frames.push(e),this.frames.length===this.totalFrames){const e=this.frames.join("");this.frames=null;const t=N(e);this.onMessage(t)}}handleNewFrameCount_(e){this.totalFrames=e,this.frames=[]}extractFrameCount_(e){if(n(null===this.frames,"We already have a frame buffer"),e.length<=6){const t=Number(e);if(!isNaN(t))return this.handleNewFrameCount_(t),null}return this.handleNewFrameCount_(1),e}handleIncomingFrame(e){if(null===this.mySock)return;const t=e.data;if(this.bytesReceived+=t.length,this.stats_.incrementCounter("bytes_received",t.length),this.resetKeepAlive(),null!==this.frames)this.appendFrame_(t);else{const e=this.extractFrameCount_(t);null!==e&&this.appendFrame_(e)}}send(e){this.resetKeepAlive();const t=A(e);this.bytesSent+=t.length,this.stats_.incrementCounter("bytes_sent",t.length);const n=xs(t,16384);n.length>1&&this.sendString_(String(n.length));for(let i=0;i<n.length;i++)this.sendString_(n[i])}shutdown_(){this.isClosed_=!0,this.keepaliveTimer&&(clearInterval(this.keepaliveTimer),this.keepaliveTimer=null),this.mySock&&(this.mySock.close(),this.mySock=null)}onClosed_(){this.isClosed_||(this.log_("WebSocket is closing itself"),this.shutdown_(),this.onDisconnect&&(this.onDisconnect(this.everConnected_),this.onDisconnect=null))}close(){this.isClosed_||(this.log_("WebSocket is being closed"),this.shutdown_())}resetKeepAlive(){clearInterval(this.keepaliveTimer),this.keepaliveTimer=setInterval(()=>{this.mySock&&this.sendString_("0"),this.resetKeepAlive()},Math.floor(45e3))}sendString_(e){try{this.mySock.send(e)}catch(t){this.log_("Exception thrown from WebSocket.send():",t.message||t.data,"Closing connection."),setTimeout(this.onClosed_.bind(this),0)}}}sr.responsesRequiredToBeHealthy=2,sr.healthyTimeout=3e4;
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
class rr{constructor(e){this.initTransports_(e)}static get ALL_TRANSPORTS(){return[tr,sr]}static get IS_TRANSPORT_INITIALIZED(){return this.globalTransportInitialized_}initTransports_(e){const t=sr&&sr.isAvailable();let n=t&&!sr.previouslyFailed();if(e.webSocketOnly&&(t||Es("wss:// URL used, but browser isn't known to support websockets.  Trying anyway."),n=!0),n)this.transports_=[sr];else{const e=this.transports_=[];for(const t of rr.ALL_TRANSPORTS)t&&t.isAvailable()&&e.push(t);rr.globalTransportInitialized_=!0}}initialTransport(){if(this.transports_.length>0)return this.transports_[0];throw new Error("No transports available")}upgradeTransport(){return this.transports_.length>1?this.transports_[1]:null}}rr.globalTransportInitialized_=!1;class or{constructor(e,t,n,i,s,r,o,a,c,h){this.id=e,this.repoInfo_=t,this.applicationId_=n,this.appCheckToken_=i,this.authToken_=s,this.onMessage_=r,this.onReady_=o,this.onDisconnect_=a,this.onKill_=c,this.lastSessionId=h,this.connectionCount=0,this.pendingDataMessages=[],this.state_=0,this.log_=Is("c:"+this.id+":"),this.transportManager_=new rr(t),this.log_("Connection created"),this.start_()}start_(){const e=this.transportManager_.initialTransport();this.conn_=new e(this.nextTransportId_(),this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,null,this.lastSessionId),this.primaryResponsesRequired_=e.responsesRequiredToBeHealthy||0;const t=this.connReceiver_(this.conn_),n=this.disconnReceiver_(this.conn_);this.tx_=this.conn_,this.rx_=this.conn_,this.secondaryConn_=null,this.isHealthy_=!1,setTimeout(()=>{this.conn_&&this.conn_.open(t,n)},Math.floor(0));const i=e.healthyTimeout||0;i>0&&(this.healthyTimeout_=Vs(()=>{this.healthyTimeout_=null,this.isHealthy_||(this.conn_&&this.conn_.bytesReceived>102400?(this.log_("Connection exceeded healthy timeout but has received "+this.conn_.bytesReceived+" bytes.  Marking connection healthy."),this.isHealthy_=!0,this.conn_.markConnectionHealthy()):this.conn_&&this.conn_.bytesSent>10240?this.log_("Connection exceeded healthy timeout but has sent "+this.conn_.bytesSent+" bytes.  Leaving connection alive."):(this.log_("Closing unhealthy connection after timeout."),this.close()))},Math.floor(i)))}nextTransportId_(){return"c:"+this.id+":"+this.connectionCount++}disconnReceiver_(e){return t=>{e===this.conn_?this.onConnectionLost_(t):e===this.secondaryConn_?(this.log_("Secondary connection lost."),this.onSecondaryConnectionLost_()):this.log_("closing an old connection")}}connReceiver_(e){return t=>{2!==this.state_&&(e===this.rx_?this.onPrimaryMessageReceived_(t):e===this.secondaryConn_?this.onSecondaryMessageReceived_(t):this.log_("message on old connection"))}}sendRequest(e){const t={t:"d",d:e};this.sendData_(t)}tryCleanupConnection(){this.tx_===this.secondaryConn_&&this.rx_===this.secondaryConn_&&(this.log_("cleaning up and promoting a connection: "+this.secondaryConn_.connId),this.conn_=this.secondaryConn_,this.secondaryConn_=null)}onSecondaryControl_(e){if("t"in e){const t=e.t;"a"===t?this.upgradeIfSecondaryHealthy_():"r"===t?(this.log_("Got a reset on secondary, closing it"),this.secondaryConn_.close(),this.tx_!==this.secondaryConn_&&this.rx_!==this.secondaryConn_||this.close()):"o"===t&&(this.log_("got pong on secondary."),this.secondaryResponsesRequired_--,this.upgradeIfSecondaryHealthy_())}}onSecondaryMessageReceived_(e){const t=Ps("t",e),n=Ps("d",e);if("c"===t)this.onSecondaryControl_(n);else{if("d"!==t)throw new Error("Unknown protocol layer: "+t);this.pendingDataMessages.push(n)}}upgradeIfSecondaryHealthy_(){this.secondaryResponsesRequired_<=0?(this.log_("Secondary connection is healthy."),this.isHealthy_=!0,this.secondaryConn_.markConnectionHealthy(),this.proceedWithUpgrade_()):(this.log_("sending ping on secondary."),this.secondaryConn_.send({t:"c",d:{t:"p",d:{}}}))}proceedWithUpgrade_(){this.secondaryConn_.start(),this.log_("sending client ack on secondary"),this.secondaryConn_.send({t:"c",d:{t:"a",d:{}}}),this.log_("Ending transmission on primary"),this.conn_.send({t:"c",d:{t:"n",d:{}}}),this.tx_=this.secondaryConn_,this.tryCleanupConnection()}onPrimaryMessageReceived_(e){const t=Ps("t",e),n=Ps("d",e);"c"===t?this.onControl_(n):"d"===t&&this.onDataMessage_(n)}onDataMessage_(e){this.onPrimaryResponse_(),this.onMessage_(e)}onPrimaryResponse_(){this.isHealthy_||(this.primaryResponsesRequired_--,this.primaryResponsesRequired_<=0&&(this.log_("Primary connection is healthy."),this.isHealthy_=!0,this.conn_.markConnectionHealthy()))}onControl_(e){const t=Ps("t",e);if("d"in e){const n=e.d;if("h"===t){const e=Object.assign({},n);this.repoInfo_.isUsingEmulator&&(e.h=this.repoInfo_.host),this.onHandshake_(e)}else if("n"===t){this.log_("recvd end transmission on primary"),this.rx_=this.secondaryConn_;for(let e=0;e<this.pendingDataMessages.length;++e)this.onDataMessage_(this.pendingDataMessages[e]);this.pendingDataMessages=[],this.tryCleanupConnection()}else"s"===t?this.onConnectionShutdown_(n):"r"===t?this.onReset_(n):"e"===t?bs("Server Error: "+n):"o"===t?(this.log_("got pong on primary."),this.onPrimaryResponse_(),this.sendPingOnPrimaryIfNecessary_()):bs("Unknown control packet command: "+t)}}onHandshake_(e){const t=e.ts,n=e.v,i=e.h;this.sessionId=e.s,this.repoInfo_.host=i,0===this.state_&&(this.conn_.start(),this.onConnectionEstablished_(this.conn_,t),"5"!==n&&Es("Protocol version mismatch detected"),this.tryStartUpgrade_())}tryStartUpgrade_(){const e=this.transportManager_.upgradeTransport();e&&this.startUpgrade_(e)}startUpgrade_(e){this.secondaryConn_=new e(this.nextTransportId_(),this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,this.sessionId),this.secondaryResponsesRequired_=e.responsesRequiredToBeHealthy||0;const t=this.connReceiver_(this.secondaryConn_),n=this.disconnReceiver_(this.secondaryConn_);this.secondaryConn_.open(t,n),Vs(()=>{this.secondaryConn_&&(this.log_("Timed out trying to upgrade."),this.secondaryConn_.close())},Math.floor(6e4))}onReset_(e){this.log_("Reset packet received.  New host: "+e),this.repoInfo_.host=e,1===this.state_?this.close():(this.closeConnections_(),this.start_())}onConnectionEstablished_(e,t){this.log_("Realtime connection established."),this.conn_=e,this.state_=1,this.onReady_&&(this.onReady_(t,this.sessionId),this.onReady_=null),0===this.primaryResponsesRequired_?(this.log_("Primary connection is healthy."),this.isHealthy_=!0):Vs(()=>{this.sendPingOnPrimaryIfNecessary_()},Math.floor(5e3))}sendPingOnPrimaryIfNecessary_(){this.isHealthy_||1!==this.state_||(this.log_("sending ping on primary."),this.sendData_({t:"c",d:{t:"p",d:{}}}))}onSecondaryConnectionLost_(){const e=this.secondaryConn_;this.secondaryConn_=null,this.tx_!==e&&this.rx_!==e||this.close()}onConnectionLost_(e){this.conn_=null,e||0!==this.state_?1===this.state_&&this.log_("Realtime connection lost."):(this.log_("Realtime connection failed."),this.repoInfo_.isCacheableHost()&&(fs.remove("host:"+this.repoInfo_.host),this.repoInfo_.internalHost=this.repoInfo_.host)),this.close()}onConnectionShutdown_(e){this.log_("Connection shutdown command received. Shutting down..."),this.onKill_&&(this.onKill_(e),this.onKill_=null),this.onDisconnect_=null,this.close()}sendData_(e){if(1!==this.state_)throw"Connection is not connected";this.tx_.send(e)}close(){2!==this.state_&&(this.log_("Closing realtime connection."),this.state_=2,this.closeConnections_(),this.onDisconnect_&&(this.onDisconnect_(),this.onDisconnect_=null))}closeConnections_(){this.log_("Shutting down all connections"),this.conn_&&(this.conn_.close(),this.conn_=null),this.secondaryConn_&&(this.secondaryConn_.close(),this.secondaryConn_=null),this.healthyTimeout_&&(clearTimeout(this.healthyTimeout_),this.healthyTimeout_=null)}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class ar{put(e,t,n,i){}merge(e,t,n,i){}refreshAuthToken(e){}refreshAppCheckToken(e){}onDisconnectPut(e,t,n){}onDisconnectMerge(e,t,n){}onDisconnectCancel(e,t){}reportStats(e){}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class cr{constructor(e){this.allowedEvents_=e,this.listeners_={},n(Array.isArray(e)&&e.length>0,"Requires a non-empty array")}trigger(e,...t){if(Array.isArray(this.listeners_[e])){const n=[...this.listeners_[e]];for(let e=0;e<n.length;e++)n[e].callback.apply(n[e].context,t)}}on(e,t,n){this.validateEventType_(e),this.listeners_[e]=this.listeners_[e]||[],this.listeners_[e].push({callback:t,context:n});const i=this.getInitialEvent(e);i&&t.apply(n,i)}off(e,t,n){this.validateEventType_(e);const i=this.listeners_[e]||[];for(let s=0;s<i.length;s++)if(i[s].callback===t&&(!n||n===i[s].context))return void i.splice(s,1)}validateEventType_(e){n(this.allowedEvents_.find(t=>t===e),"Unknown event: "+e)}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class hr extends cr{constructor(){super(["online"]),this.online_=!0,"undefined"==typeof window||void 0===window.addEventListener||I()||(window.addEventListener("online",()=>{this.online_||(this.online_=!0,this.trigger("online",!0))},!1),window.addEventListener("offline",()=>{this.online_&&(this.online_=!1,this.trigger("online",!1))},!1))}static getInstance(){return new hr}getInitialEvent(e){return n("online"===e,"Unknown event type: "+e),[this.online_]}currentlyOnline(){return this.online_}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class lr{constructor(e,t){if(void 0===t){this.pieces_=e.split("/");let t=0;for(let e=0;e<this.pieces_.length;e++)this.pieces_[e].length>0&&(this.pieces_[t]=this.pieces_[e],t++);this.pieces_.length=t,this.pieceNum_=0}else this.pieces_=e,this.pieceNum_=t}toString(){let e="";for(let t=this.pieceNum_;t<this.pieces_.length;t++)""!==this.pieces_[t]&&(e+="/"+this.pieces_[t]);return e||"/"}}function ur(){return new lr("")}function dr(e){return e.pieceNum_>=e.pieces_.length?null:e.pieces_[e.pieceNum_]}function fr(e){return e.pieces_.length-e.pieceNum_}function pr(e){let t=e.pieceNum_;return t<e.pieces_.length&&t++,new lr(e.pieces_,t)}function gr(e){return e.pieceNum_<e.pieces_.length?e.pieces_[e.pieces_.length-1]:null}function mr(e,t=0){return e.pieces_.slice(e.pieceNum_+t)}function _r(e){if(e.pieceNum_>=e.pieces_.length)return null;const t=[];for(let n=e.pieceNum_;n<e.pieces_.length-1;n++)t.push(e.pieces_[n]);return new lr(t,0)}function yr(e,t){const n=[];for(let i=e.pieceNum_;i<e.pieces_.length;i++)n.push(e.pieces_[i]);if(t instanceof lr)for(let i=t.pieceNum_;i<t.pieces_.length;i++)n.push(t.pieces_[i]);else{const e=t.split("/");for(let t=0;t<e.length;t++)e[t].length>0&&n.push(e[t])}return new lr(n,0)}function vr(e){return e.pieceNum_>=e.pieces_.length}function wr(e,t){const n=dr(e),i=dr(t);if(null===n)return t;if(n===i)return wr(pr(e),pr(t));throw new Error("INTERNAL ERROR: innerPath ("+t+") is not within outerPath ("+e+")")}function Tr(e,t){const n=mr(e,0),i=mr(t,0);for(let s=0;s<n.length&&s<i.length;s++){const e=As(n[s],i[s]);if(0!==e)return e}return n.length===i.length?0:n.length<i.length?-1:1}function Ir(e,t){if(fr(e)!==fr(t))return!1;for(let n=e.pieceNum_,i=t.pieceNum_;n<=e.pieces_.length;n++,i++)if(e.pieces_[n]!==t.pieces_[i])return!1;return!0}function br(e,t){let n=e.pieceNum_,i=t.pieceNum_;if(fr(e)>fr(t))return!1;for(;n<e.pieces_.length;){if(e.pieces_[n]!==t.pieces_[i])return!1;++n,++i}return!0}class Cr{constructor(e,t){this.errorPrefix_=t,this.parts_=mr(e,0),this.byteLength_=Math.max(1,this.parts_.length);for(let n=0;n<this.parts_.length;n++)this.byteLength_+=B(this.parts_[n]);Er(this)}}function Er(e){if(e.byteLength_>768)throw new Error(e.errorPrefix_+"has a key path longer than 768 bytes ("+e.byteLength_+").");if(e.parts_.length>32)throw new Error(e.errorPrefix_+"path specified exceeds the maximum depth that can be written (32) or object contains a cycle "+Sr(e))}function Sr(e){return 0===e.parts_.length?"":"in property '"+e.parts_.join(".")+"'"}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class kr extends cr{constructor(){let e,t;super(["visible"]),"undefined"!=typeof document&&void 0!==document.addEventListener&&(void 0!==document.hidden?(t="visibilitychange",e="hidden"):void 0!==document.mozHidden?(t="mozvisibilitychange",e="mozHidden"):void 0!==document.msHidden?(t="msvisibilitychange",e="msHidden"):void 0!==document.webkitHidden&&(t="webkitvisibilitychange",e="webkitHidden")),this.visible_=!0,t&&document.addEventListener(t,()=>{const t=!document[e];t!==this.visible_&&(this.visible_=t,this.trigger("visible",t))},!1)}static getInstance(){return new kr}getInitialEvent(e){return n("visible"===e,"Unknown event type: "+e),[this.visible_]}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */const Nr=1e3;class Ar extends ar{constructor(e,t,n,i,s,r,o,a){if(super(),this.repoInfo_=e,this.applicationId_=t,this.onDataUpdate_=n,this.onConnectStatus_=i,this.onServerInfoUpdate_=s,this.authTokenProvider_=r,this.appCheckTokenProvider_=o,this.authOverride_=a,this.id=Ar.nextPersistentConnectionId_++,this.log_=Is("p:"+this.id+":"),this.interruptReasons_={},this.listens=new Map,this.outstandingPuts_=[],this.outstandingGets_=[],this.outstandingPutCount_=0,this.outstandingGetCount_=0,this.onDisconnectRequestQueue_=[],this.connected_=!1,this.reconnectDelay_=Nr,this.maxReconnectDelay_=3e5,this.securityDebugCallback_=null,this.lastSessionId=null,this.establishConnectionTimer_=null,this.visible_=!1,this.requestCBHash_={},this.requestNumber_=0,this.realtime_=null,this.authToken_=null,this.appCheckToken_=null,this.forceTokenRefresh_=!1,this.invalidAuthTokenCount_=0,this.invalidAppCheckTokenCount_=0,this.firstConnection_=!0,this.lastConnectionAttemptTime_=null,this.lastConnectionEstablishedTime_=null,a)throw new Error("Auth override specified in options, but not supported on non Node.js platforms");kr.getInstance().on("visible",this.onVisible_,this),-1===e.host.indexOf("fblocal")&&hr.getInstance().on("online",this.onOnline_,this)}sendRequest(e,t,i){const s=++this.requestNumber_,r={r:s,a:e,b:t};this.log_(A(r)),n(this.connected_,"sendRequest call when we're not connected not allowed."),this.realtime_.sendRequest(r),i&&(this.requestCBHash_[s]=i)}get(e){this.initConnection_();const t=new v,n={action:"g",request:{p:e._path.toString(),q:e._queryObject},onComplete:e=>{const n=e.d;"ok"===e.s?t.resolve(n):t.reject(n)}};this.outstandingGets_.push(n),this.outstandingGetCount_++;const i=this.outstandingGets_.length-1;return this.connected_&&this.sendGet_(i),t.promise}listen(e,t,i,s){this.initConnection_();const r=e._queryIdentifier,o=e._path.toString();this.log_("Listen called for "+o+" "+r),this.listens.has(o)||this.listens.set(o,new Map),n(e._queryParams.isDefault()||!e._queryParams.loadsAllData(),"listen() called for non-default but complete query"),n(!this.listens.get(o).has(r),"listen() called twice for same path/queryId.");const a={onComplete:s,hashFn:t,query:e,tag:i};this.listens.get(o).set(r,a),this.connected_&&this.sendListen_(a)}sendGet_(e){const t=this.outstandingGets_[e];this.sendRequest("g",t.request,n=>{delete this.outstandingGets_[e],this.outstandingGetCount_--,0===this.outstandingGetCount_&&(this.outstandingGets_=[]),t.onComplete&&t.onComplete(n)})}sendListen_(e){const t=e.query,n=t._path.toString(),i=t._queryIdentifier;this.log_("Listen on "+n+" for "+i);const s={p:n};e.tag&&(s.q=t._queryObject,s.t=e.tag),s.h=e.hashFn(),this.sendRequest("q",s,s=>{const r=s.d,o=s.s;Ar.warnOnListenWarnings_(r,t);(this.listens.get(n)&&this.listens.get(n).get(i))===e&&(this.log_("listen response",s),"ok"!==o&&this.removeListen_(n,i),e.onComplete&&e.onComplete(o,r))})}static warnOnListenWarnings_(e,t){if(e&&"object"==typeof e&&P(e,"w")){const n=D(e,"w");if(Array.isArray(n)&&~n.indexOf("no_index")){const e='".indexOn": "'+t._queryParams.getIndex().toString()+'"',n=t._path.toString();Es(`Using an unspecified index. Your data will be downloaded and filtered on the client. Consider adding ${e} at ${n} to your security rules for better performance.`)}}}refreshAuthToken(e){this.authToken_=e,this.log_("Auth token refreshed"),this.authToken_?this.tryAuth():this.connected_&&this.sendRequest("unauth",{},()=>{}),this.reduceReconnectDelayIfAdminCredential_(e)}reduceReconnectDelayIfAdminCredential_(e){(e&&40===e.length||function(e){const t=R(e).claims;return"object"==typeof t&&!0===t.admin}(e))&&(this.log_("Admin auth credential detected.  Reducing max reconnect time."),this.maxReconnectDelay_=3e4)}refreshAppCheckToken(e){this.appCheckToken_=e,this.log_("App check token refreshed"),this.appCheckToken_?this.tryAppCheck():this.connected_&&this.sendRequest("unappeck",{},()=>{})}tryAuth(){if(this.connected_&&this.authToken_){const e=this.authToken_,t=function(e){const t=R(e).claims;return!!t&&"object"==typeof t&&t.hasOwnProperty("iat")}(e)?"auth":"gauth",n={cred:e};null===this.authOverride_?n.noauth=!0:"object"==typeof this.authOverride_&&(n.authvar=this.authOverride_),this.sendRequest(t,n,t=>{const n=t.s,i=t.d||"error";this.authToken_===e&&("ok"===n?this.invalidAuthTokenCount_=0:this.onAuthRevoked_(n,i))})}}tryAppCheck(){this.connected_&&this.appCheckToken_&&this.sendRequest("appcheck",{token:this.appCheckToken_},e=>{const t=e.s,n=e.d||"error";"ok"===t?this.invalidAppCheckTokenCount_=0:this.onAppCheckRevoked_(t,n)})}unlisten(e,t){const i=e._path.toString(),s=e._queryIdentifier;this.log_("Unlisten called for "+i+" "+s),n(e._queryParams.isDefault()||!e._queryParams.loadsAllData(),"unlisten() called for non-default but complete query");this.removeListen_(i,s)&&this.connected_&&this.sendUnlisten_(i,s,e._queryObject,t)}sendUnlisten_(e,t,n,i){this.log_("Unlisten on "+e+" for "+t);const s={p:e};i&&(s.q=n,s.t=i),this.sendRequest("n",s)}onDisconnectPut(e,t,n){this.initConnection_(),this.connected_?this.sendOnDisconnect_("o",e,t,n):this.onDisconnectRequestQueue_.push({pathString:e,action:"o",data:t,onComplete:n})}onDisconnectMerge(e,t,n){this.initConnection_(),this.connected_?this.sendOnDisconnect_("om",e,t,n):this.onDisconnectRequestQueue_.push({pathString:e,action:"om",data:t,onComplete:n})}onDisconnectCancel(e,t){this.initConnection_(),this.connected_?this.sendOnDisconnect_("oc",e,null,t):this.onDisconnectRequestQueue_.push({pathString:e,action:"oc",data:null,onComplete:t})}sendOnDisconnect_(e,t,n,i){const s={p:t,d:n};this.log_("onDisconnect "+e,s),this.sendRequest(e,s,e=>{i&&setTimeout(()=>{i(e.s,e.d)},Math.floor(0))})}put(e,t,n,i){this.putInternal("p",e,t,n,i)}merge(e,t,n,i){this.putInternal("m",e,t,n,i)}putInternal(e,t,n,i,s){this.initConnection_();const r={p:t,d:n};void 0!==s&&(r.h=s),this.outstandingPuts_.push({action:e,request:r,onComplete:i}),this.outstandingPutCount_++;const o=this.outstandingPuts_.length-1;this.connected_?this.sendPut_(o):this.log_("Buffering put: "+t)}sendPut_(e){const t=this.outstandingPuts_[e].action,n=this.outstandingPuts_[e].request,i=this.outstandingPuts_[e].onComplete;this.outstandingPuts_[e].queued=this.connected_,this.sendRequest(t,n,n=>{this.log_(t+" response",n),delete this.outstandingPuts_[e],this.outstandingPutCount_--,0===this.outstandingPutCount_&&(this.outstandingPuts_=[]),i&&i(n.s,n.d)})}reportStats(e){if(this.connected_){const t={c:e};this.log_("reportStats",t),this.sendRequest("s",t,e=>{if("ok"!==e.s){const t=e.d;this.log_("reportStats","Error sending stats: "+t)}})}}onDataMessage_(e){if("r"in e){this.log_("from server: "+A(e));const t=e.r,n=this.requestCBHash_[t];n&&(delete this.requestCBHash_[t],n(e.b))}else{if("error"in e)throw"A server-side error has occurred: "+e.error;"a"in e&&this.onDataPush_(e.a,e.b)}}onDataPush_(e,t){this.log_("handleServerMessage",e,t),"d"===e?this.onDataUpdate_(t.p,t.d,!1,t.t):"m"===e?this.onDataUpdate_(t.p,t.d,!0,t.t):"c"===e?this.onListenRevoked_(t.p,t.q):"ac"===e?this.onAuthRevoked_(t.s,t.d):"apc"===e?this.onAppCheckRevoked_(t.s,t.d):"sd"===e?this.onSecurityDebugPacket_(t):bs("Unrecognized action received from server: "+A(e)+"\nAre you using the latest client?")}onReady_(e,t){this.log_("connection ready"),this.connected_=!0,this.lastConnectionEstablishedTime_=(new Date).getTime(),this.handleTimestamp_(e),this.lastSessionId=t,this.firstConnection_&&this.sendConnectStats_(),this.restoreState_(),this.firstConnection_=!1,this.onConnectStatus_(!0)}scheduleConnect_(e){n(!this.realtime_,"Scheduling a connect when we're already connected/ing?"),this.establishConnectionTimer_&&clearTimeout(this.establishConnectionTimer_),this.establishConnectionTimer_=setTimeout(()=>{this.establishConnectionTimer_=null,this.establishConnection_()},Math.floor(e))}initConnection_(){!this.realtime_&&this.firstConnection_&&this.scheduleConnect_(0)}onVisible_(e){e&&!this.visible_&&this.reconnectDelay_===this.maxReconnectDelay_&&(this.log_("Window became visible.  Reducing delay."),this.reconnectDelay_=Nr,this.realtime_||this.scheduleConnect_(0)),this.visible_=e}onOnline_(e){e?(this.log_("Browser went online."),this.reconnectDelay_=Nr,this.realtime_||this.scheduleConnect_(0)):(this.log_("Browser went offline.  Killing connection."),this.realtime_&&this.realtime_.close())}onRealtimeDisconnect_(){if(this.log_("data client disconnected"),this.connected_=!1,this.realtime_=null,this.cancelSentTransactions_(),this.requestCBHash_={},this.shouldReconnect_()){if(this.visible_){if(this.lastConnectionEstablishedTime_){(new Date).getTime()-this.lastConnectionEstablishedTime_>3e4&&(this.reconnectDelay_=Nr),this.lastConnectionEstablishedTime_=null}}else this.log_("Window isn't visible.  Delaying reconnect."),this.reconnectDelay_=this.maxReconnectDelay_,this.lastConnectionAttemptTime_=(new Date).getTime();const e=(new Date).getTime()-this.lastConnectionAttemptTime_;let t=Math.max(0,this.reconnectDelay_-e);t=Math.random()*t,this.log_("Trying to reconnect in "+t+"ms"),this.scheduleConnect_(t),this.reconnectDelay_=Math.min(this.maxReconnectDelay_,1.3*this.reconnectDelay_)}this.onConnectStatus_(!1)}async establishConnection_(){if(this.shouldReconnect_()){this.log_("Making a connection attempt"),this.lastConnectionAttemptTime_=(new Date).getTime(),this.lastConnectionEstablishedTime_=null;const t=this.onDataMessage_.bind(this),i=this.onReady_.bind(this),s=this.onRealtimeDisconnect_.bind(this),r=this.id+":"+Ar.nextConnectionId_++,o=this.lastSessionId;let a=!1,c=null;const h=function(){c?c.close():(a=!0,s())},l=function(e){n(c,"sendRequest call when we're not connected not allowed."),c.sendRequest(e)};this.realtime_={close:h,sendRequest:l};const u=this.forceTokenRefresh_;this.forceTokenRefresh_=!1;try{const[e,n]=await Promise.all([this.authTokenProvider_.getToken(u),this.appCheckTokenProvider_.getToken(u)]);a?Ts("getToken() completed but was canceled"):(Ts("getToken() completed. Creating connection."),this.authToken_=e&&e.accessToken,this.appCheckToken_=n&&n.token,c=new or(r,this.repoInfo_,this.applicationId_,this.appCheckToken_,this.authToken_,t,i,s,e=>{Es(e+" ("+this.repoInfo_.toString()+")"),this.interrupt("server_kill")},o))}catch(e){this.log_("Failed to get token: "+e),a||(this.repoInfo_.nodeAdmin&&Es(e),h())}}}interrupt(e){Ts("Interrupting connection for reason: "+e),this.interruptReasons_[e]=!0,this.realtime_?this.realtime_.close():(this.establishConnectionTimer_&&(clearTimeout(this.establishConnectionTimer_),this.establishConnectionTimer_=null),this.connected_&&this.onRealtimeDisconnect_())}resume(e){Ts("Resuming connection for reason: "+e),delete this.interruptReasons_[e],x(this.interruptReasons_)&&(this.reconnectDelay_=Nr,this.realtime_||this.scheduleConnect_(0))}handleTimestamp_(e){const t=e-(new Date).getTime();this.onServerInfoUpdate_({serverTimeOffset:t})}cancelSentTransactions_(){for(let e=0;e<this.outstandingPuts_.length;e++){const t=this.outstandingPuts_[e];t&&"h"in t.request&&t.queued&&(t.onComplete&&t.onComplete("disconnect"),delete this.outstandingPuts_[e],this.outstandingPutCount_--)}0===this.outstandingPutCount_&&(this.outstandingPuts_=[])}onListenRevoked_(e,t){let n;n=t?t.map(e=>Ds(e)).join("$"):"default";const i=this.removeListen_(e,n);i&&i.onComplete&&i.onComplete("permission_denied")}removeListen_(e,t){const n=new lr(e).toString();let i;if(this.listens.has(n)){const e=this.listens.get(n);i=e.get(t),e.delete(t),0===e.size&&this.listens.delete(n)}else i=void 0;return i}onAuthRevoked_(e,t){Ts("Auth token revoked: "+e+"/"+t),this.authToken_=null,this.forceTokenRefresh_=!0,this.realtime_.close(),"invalid_token"!==e&&"permission_denied"!==e||(this.invalidAuthTokenCount_++,this.invalidAuthTokenCount_>=3&&(this.reconnectDelay_=3e4,this.authTokenProvider_.notifyForInvalidToken()))}onAppCheckRevoked_(e,t){Ts("App check token revoked: "+e+"/"+t),this.appCheckToken_=null,this.forceTokenRefresh_=!0,"invalid_token"!==e&&"permission_denied"!==e||(this.invalidAppCheckTokenCount_++,this.invalidAppCheckTokenCount_>=3&&this.appCheckTokenProvider_.notifyForInvalidToken())}onSecurityDebugPacket_(e){this.securityDebugCallback_?this.securityDebugCallback_(e):"msg"in e&&console.log("FIREBASE: "+e.msg.replace("\n","\nFIREBASE: "))}restoreState_(){this.tryAuth(),this.tryAppCheck();for(const e of this.listens.values())for(const t of e.values())this.sendListen_(t);for(let e=0;e<this.outstandingPuts_.length;e++)this.outstandingPuts_[e]&&this.sendPut_(e);for(;this.onDisconnectRequestQueue_.length;){const e=this.onDisconnectRequestQueue_.shift();this.sendOnDisconnect_(e.action,e.pathString,e.data,e.onComplete)}for(let e=0;e<this.outstandingGets_.length;e++)this.outstandingGets_[e]&&this.sendGet_(e)}sendConnectStats_(){const e={};e["sdk.js."+hs.replace(/\./g,"-")]=1,I()?e["framework.cordova"]=1:b()&&(e["framework.reactnative"]=1),this.reportStats(e)}shouldReconnect_(){const e=hr.getInstance().currentlyOnline();return x(this.interruptReasons_)&&e}}Ar.nextPersistentConnectionId_=0,Ar.nextConnectionId_=0;
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
class Rr{constructor(e,t){this.name=e,this.node=t}static Wrap(e,t){return new Rr(e,t)}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Pr{getCompare(){return this.compare.bind(this)}indexedValueChanged(e,t){const n=new Rr(ks,e),i=new Rr(ks,t);return 0!==this.compare(n,i)}minPost(){return Rr.MIN}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */let Dr;class xr extends Pr{static get __EMPTY_NODE(){return Dr}static set __EMPTY_NODE(e){Dr=e}compare(e,t){return As(e.name,t.name)}isDefinedOn(e){throw i("KeyIndex.isDefinedOn not expected to be called.")}indexedValueChanged(e,t){return!1}minPost(){return Rr.MIN}maxPost(){return new Rr(Ns,Dr)}makePost(e,t){return n("string"==typeof e,"KeyIndex indexValue must always be a string."),new Rr(e,Dr)}toString(){return".key"}}const Or=new xr;
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */let Lr=class{constructor(e,t,n,i,s=null){this.isReverse_=i,this.resultGenerator_=s,this.nodeStack_=[];let r=1;for(;!e.isEmpty();)if(r=t?n(e.key,t):1,i&&(r*=-1),r<0)e=this.isReverse_?e.left:e.right;else{if(0===r){this.nodeStack_.push(e);break}this.nodeStack_.push(e),e=this.isReverse_?e.right:e.left}}getNext(){if(0===this.nodeStack_.length)return null;let e,t=this.nodeStack_.pop();if(e=this.resultGenerator_?this.resultGenerator_(t.key,t.value):{key:t.key,value:t.value},this.isReverse_)for(t=t.left;!t.isEmpty();)this.nodeStack_.push(t),t=t.right;else for(t=t.right;!t.isEmpty();)this.nodeStack_.push(t),t=t.left;return e}hasNext(){return this.nodeStack_.length>0}peek(){if(0===this.nodeStack_.length)return null;const e=this.nodeStack_[this.nodeStack_.length-1];return this.resultGenerator_?this.resultGenerator_(e.key,e.value):{key:e.key,value:e.value}}},Mr=class e{constructor(t,n,i,s,r){this.key=t,this.value=n,this.color=null!=i?i:e.RED,this.left=null!=s?s:Ur.EMPTY_NODE,this.right=null!=r?r:Ur.EMPTY_NODE}copy(t,n,i,s,r){return new e(null!=t?t:this.key,null!=n?n:this.value,null!=i?i:this.color,null!=s?s:this.left,null!=r?r:this.right)}count(){return this.left.count()+1+this.right.count()}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||!!e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min_(){return this.left.isEmpty()?this:this.left.min_()}minKey(){return this.min_().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,n){let i=this;const s=n(e,i.key);return i=s<0?i.copy(null,null,null,i.left.insert(e,t,n),null):0===s?i.copy(null,t,null,null,null):i.copy(null,null,null,null,i.right.insert(e,t,n)),i.fixUp_()}removeMin_(){if(this.left.isEmpty())return Ur.EMPTY_NODE;let e=this;return e.left.isRed_()||e.left.left.isRed_()||(e=e.moveRedLeft_()),e=e.copy(null,null,null,e.left.removeMin_(),null),e.fixUp_()}remove(e,t){let n,i;if(n=this,t(e,n.key)<0)n.left.isEmpty()||n.left.isRed_()||n.left.left.isRed_()||(n=n.moveRedLeft_()),n=n.copy(null,null,null,n.left.remove(e,t),null);else{if(n.left.isRed_()&&(n=n.rotateRight_()),n.right.isEmpty()||n.right.isRed_()||n.right.left.isRed_()||(n=n.moveRedRight_()),0===t(e,n.key)){if(n.right.isEmpty())return Ur.EMPTY_NODE;i=n.right.min_(),n=n.copy(i.key,i.value,null,null,n.right.removeMin_())}n=n.copy(null,null,null,null,n.right.remove(e,t))}return n.fixUp_()}isRed_(){return this.color}fixUp_(){let e=this;return e.right.isRed_()&&!e.left.isRed_()&&(e=e.rotateLeft_()),e.left.isRed_()&&e.left.left.isRed_()&&(e=e.rotateRight_()),e.left.isRed_()&&e.right.isRed_()&&(e=e.colorFlip_()),e}moveRedLeft_(){let e=this.colorFlip_();return e.right.left.isRed_()&&(e=e.copy(null,null,null,null,e.right.rotateRight_()),e=e.rotateLeft_(),e=e.colorFlip_()),e}moveRedRight_(){let e=this.colorFlip_();return e.left.left.isRed_()&&(e=e.rotateRight_(),e=e.colorFlip_()),e}rotateLeft_(){const t=this.copy(null,null,e.RED,null,this.right.left);return this.right.copy(null,null,this.color,t,null)}rotateRight_(){const t=this.copy(null,null,e.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,t)}colorFlip_(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth_(){const e=this.check_();return Math.pow(2,e)<=this.count()+1}check_(){if(this.isRed_()&&this.left.isRed_())throw new Error("Red node has red child("+this.key+","+this.value+")");if(this.right.isRed_())throw new Error("Right child of ("+this.key+","+this.value+") is red");const e=this.left.check_();if(e!==this.right.check_())throw new Error("Black depths differ");return e+(this.isRed_()?0:1)}};Mr.RED=!0,Mr.BLACK=!1;let Fr,Ur=class e{constructor(t,n=e.EMPTY_NODE){this.comparator_=t,this.root_=n}insert(t,n){return new e(this.comparator_,this.root_.insert(t,n,this.comparator_).copy(null,null,Mr.BLACK,null,null))}remove(t){return new e(this.comparator_,this.root_.remove(t,this.comparator_).copy(null,null,Mr.BLACK,null,null))}get(e){let t,n=this.root_;for(;!n.isEmpty();){if(t=this.comparator_(e,n.key),0===t)return n.value;t<0?n=n.left:t>0&&(n=n.right)}return null}getPredecessorKey(e){let t,n=this.root_,i=null;for(;!n.isEmpty();){if(t=this.comparator_(e,n.key),0===t){if(n.left.isEmpty())return i?i.key:null;for(n=n.left;!n.right.isEmpty();)n=n.right;return n.key}t<0?n=n.left:t>0&&(i=n,n=n.right)}throw new Error("Attempted to find predecessor key for a nonexistent key.  What gives?")}isEmpty(){return this.root_.isEmpty()}count(){return this.root_.count()}minKey(){return this.root_.minKey()}maxKey(){return this.root_.maxKey()}inorderTraversal(e){return this.root_.inorderTraversal(e)}reverseTraversal(e){return this.root_.reverseTraversal(e)}getIterator(e){return new Lr(this.root_,null,this.comparator_,!1,e)}getIteratorFrom(e,t){return new Lr(this.root_,e,this.comparator_,!1,t)}getReverseIteratorFrom(e,t){return new Lr(this.root_,e,this.comparator_,!0,t)}getReverseIterator(e){return new Lr(this.root_,null,this.comparator_,!0,e)}};
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
function Vr(e,t){return As(e.name,t.name)}function qr(e,t){return As(e,t)}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */Ur.EMPTY_NODE=new class{copy(e,t,n,i,s){return this}insert(e,t,n){return new Mr(e,t,null)}remove(e,t){return this}count(){return 0}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}check_(){return 0}isRed_(){return!1}};const jr=function(e){return"number"==typeof e?"number:"+Ls(e):"string:"+e},Br=function(e){if(e.isLeafNode()){const t=e.val();n("string"==typeof t||"number"==typeof t||"object"==typeof t&&P(t,".sv"),"Priority must be a string or number.")}else n(e===Fr||e.isEmpty(),"priority of unexpected type.");n(e===Fr||e.getPriority().isEmpty(),"Priority nodes can't have a priority of their own.")};
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
let zr,$r,Wr;class Hr{constructor(e,t=Hr.__childrenNodeConstructor.EMPTY_NODE){this.value_=e,this.priorityNode_=t,this.lazyHash_=null,n(void 0!==this.value_&&null!==this.value_,"LeafNode shouldn't be created with null/undefined value."),Br(this.priorityNode_)}static set __childrenNodeConstructor(e){zr=e}static get __childrenNodeConstructor(){return zr}isLeafNode(){return!0}getPriority(){return this.priorityNode_}updatePriority(e){return new Hr(this.value_,e)}getImmediateChild(e){return".priority"===e?this.priorityNode_:Hr.__childrenNodeConstructor.EMPTY_NODE}getChild(e){return vr(e)?this:".priority"===dr(e)?this.priorityNode_:Hr.__childrenNodeConstructor.EMPTY_NODE}hasChild(){return!1}getPredecessorChildName(e,t){return null}updateImmediateChild(e,t){return".priority"===e?this.updatePriority(t):t.isEmpty()&&".priority"!==e?this:Hr.__childrenNodeConstructor.EMPTY_NODE.updateImmediateChild(e,t).updatePriority(this.priorityNode_)}updateChild(e,t){const i=dr(e);return null===i?t:t.isEmpty()&&".priority"!==i?this:(n(".priority"!==i||1===fr(e),".priority must be the last token in a path"),this.updateImmediateChild(i,Hr.__childrenNodeConstructor.EMPTY_NODE.updateChild(pr(e),t)))}isEmpty(){return!1}numChildren(){return 0}forEachChild(e,t){return!1}val(e){return e&&!this.getPriority().isEmpty()?{".value":this.getValue(),".priority":this.getPriority().val()}:this.getValue()}hash(){if(null===this.lazyHash_){let e="";this.priorityNode_.isEmpty()||(e+="priority:"+jr(this.priorityNode_.val())+":");const t=typeof this.value_;e+=t+":",e+="number"===t?Ls(this.value_):this.value_,this.lazyHash_=_s(e)}return this.lazyHash_}getValue(){return this.value_}compareTo(e){return e===Hr.__childrenNodeConstructor.EMPTY_NODE?1:e instanceof Hr.__childrenNodeConstructor?-1:(n(e.isLeafNode(),"Unknown node type"),this.compareToLeafNode_(e))}compareToLeafNode_(e){const t=typeof e.value_,i=typeof this.value_,s=Hr.VALUE_TYPE_ORDER.indexOf(t),r=Hr.VALUE_TYPE_ORDER.indexOf(i);return n(s>=0,"Unknown leaf type: "+t),n(r>=0,"Unknown leaf type: "+i),s===r?"object"===i?0:this.value_<e.value_?-1:this.value_===e.value_?0:1:r-s}withIndex(){return this}isIndexed(){return!0}equals(e){if(e===this)return!0;if(e.isLeafNode()){const t=e;return this.value_===t.value_&&this.priorityNode_.equals(t.priorityNode_)}return!1}}Hr.VALUE_TYPE_ORDER=["object","boolean","number","string"];const Kr=new class extends Pr{compare(e,t){const n=e.node.getPriority(),i=t.node.getPriority(),s=n.compareTo(i);return 0===s?As(e.name,t.name):s}isDefinedOn(e){return!e.getPriority().isEmpty()}indexedValueChanged(e,t){return!e.getPriority().equals(t.getPriority())}minPost(){return Rr.MIN}maxPost(){return new Rr(Ns,new Hr("[PRIORITY-POST]",Wr))}makePost(e,t){const n=$r(e);return new Rr(t,new Hr("[PRIORITY-POST]",n))}toString(){return".priority"}},Gr=Math.log(2);
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Qr{constructor(e){var t;this.count=(t=e+1,parseInt(Math.log(t)/Gr,10)),this.current_=this.count-1;const n=(i=this.count,parseInt(Array(i+1).join("1"),2));var i;this.bits_=e+1&n}nextBitIsOne(){const e=!(this.bits_&1<<this.current_);return this.current_--,e}}const Yr=function(e,t,n,i){e.sort(t);const s=function(t,i){const r=i-t;let o,a;if(0===r)return null;if(1===r)return o=e[t],a=n?n(o):o,new Mr(a,o.node,Mr.BLACK,null,null);{const c=parseInt(r/2,10)+t,h=s(t,c),l=s(c+1,i);return o=e[c],a=n?n(o):o,new Mr(a,o.node,Mr.BLACK,h,l)}},r=function(t){let i=null,r=null,o=e.length;const a=function(t,i){const r=o-t,a=o;o-=t;const h=s(r+1,a),l=e[r],u=n?n(l):l;c(new Mr(u,l.node,i,null,h))},c=function(e){i?(i.left=e,i=e):(r=e,i=e)};for(let e=0;e<t.count;++e){const n=t.nextBitIsOne(),i=Math.pow(2,t.count-(e+1));n?a(i,Mr.BLACK):(a(i,Mr.BLACK),a(i,Mr.RED))}return r}(new Qr(e.length));return new Ur(i||t,r)};
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */let Jr;const Xr={};class Zr{constructor(e,t){this.indexes_=e,this.indexSet_=t}static get Default(){return n(Xr&&Kr,"ChildrenNode.ts has not been loaded"),Jr=Jr||new Zr({".priority":Xr},{".priority":Kr}),Jr}get(e){const t=D(this.indexes_,e);if(!t)throw new Error("No index defined for "+e);return t instanceof Ur?t:null}hasIndex(e){return P(this.indexSet_,e.toString())}addIndex(e,t){n(e!==Or,"KeyIndex always exists and isn't meant to be added to the IndexMap.");const i=[];let s=!1;const r=t.getIterator(Rr.Wrap);let o,a=r.getNext();for(;a;)s=s||e.isDefinedOn(a.node),i.push(a),a=r.getNext();o=s?Yr(i,e.getCompare()):Xr;const c=e.toString(),h=Object.assign({},this.indexSet_);h[c]=e;const l=Object.assign({},this.indexes_);return l[c]=o,new Zr(l,h)}addToIndexes(e,t){const i=O(this.indexes_,(i,s)=>{const r=D(this.indexSet_,s);if(n(r,"Missing index implementation for "+s),i===Xr){if(r.isDefinedOn(e.node)){const n=[],i=t.getIterator(Rr.Wrap);let s=i.getNext();for(;s;)s.name!==e.name&&n.push(s),s=i.getNext();return n.push(e),Yr(n,r.getCompare())}return Xr}{const n=t.get(e.name);let s=i;return n&&(s=s.remove(new Rr(e.name,n))),s.insert(e,e.node)}});return new Zr(i,this.indexSet_)}removeFromIndexes(e,t){const n=O(this.indexes_,n=>{if(n===Xr)return n;{const i=t.get(e.name);return i?n.remove(new Rr(e.name,i)):n}});return new Zr(n,this.indexSet_)}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */let eo;class to{constructor(e,t,i){this.children_=e,this.priorityNode_=t,this.indexMap_=i,this.lazyHash_=null,this.priorityNode_&&Br(this.priorityNode_),this.children_.isEmpty()&&n(!this.priorityNode_||this.priorityNode_.isEmpty(),"An empty node cannot have a priority")}static get EMPTY_NODE(){return eo||(eo=new to(new Ur(qr),null,Zr.Default))}isLeafNode(){return!1}getPriority(){return this.priorityNode_||eo}updatePriority(e){return this.children_.isEmpty()?this:new to(this.children_,e,this.indexMap_)}getImmediateChild(e){if(".priority"===e)return this.getPriority();{const t=this.children_.get(e);return null===t?eo:t}}getChild(e){const t=dr(e);return null===t?this:this.getImmediateChild(t).getChild(pr(e))}hasChild(e){return null!==this.children_.get(e)}updateImmediateChild(e,t){if(n(t,"We should always be passing snapshot nodes"),".priority"===e)return this.updatePriority(t);{const n=new Rr(e,t);let i,s;t.isEmpty()?(i=this.children_.remove(e),s=this.indexMap_.removeFromIndexes(n,this.children_)):(i=this.children_.insert(e,t),s=this.indexMap_.addToIndexes(n,this.children_));const r=i.isEmpty()?eo:this.priorityNode_;return new to(i,r,s)}}updateChild(e,t){const i=dr(e);if(null===i)return t;{n(".priority"!==dr(e)||1===fr(e),".priority must be the last token in a path");const s=this.getImmediateChild(i).updateChild(pr(e),t);return this.updateImmediateChild(i,s)}}isEmpty(){return this.children_.isEmpty()}numChildren(){return this.children_.count()}val(e){if(this.isEmpty())return null;const t={};let n=0,i=0,s=!0;if(this.forEachChild(Kr,(r,o)=>{t[r]=o.val(e),n++,s&&to.INTEGER_REGEXP_.test(r)?i=Math.max(i,Number(r)):s=!1}),!e&&s&&i<2*n){const e=[];for(const n in t)e[n]=t[n];return e}return e&&!this.getPriority().isEmpty()&&(t[".priority"]=this.getPriority().val()),t}hash(){if(null===this.lazyHash_){let e="";this.getPriority().isEmpty()||(e+="priority:"+jr(this.getPriority().val())+":"),this.forEachChild(Kr,(t,n)=>{const i=n.hash();""!==i&&(e+=":"+t+":"+i)}),this.lazyHash_=""===e?"":_s(e)}return this.lazyHash_}getPredecessorChildName(e,t,n){const i=this.resolveIndex_(n);if(i){const n=i.getPredecessorKey(new Rr(e,t));return n?n.name:null}return this.children_.getPredecessorKey(e)}getFirstChildName(e){const t=this.resolveIndex_(e);if(t){const e=t.minKey();return e&&e.name}return this.children_.minKey()}getFirstChild(e){const t=this.getFirstChildName(e);return t?new Rr(t,this.children_.get(t)):null}getLastChildName(e){const t=this.resolveIndex_(e);if(t){const e=t.maxKey();return e&&e.name}return this.children_.maxKey()}getLastChild(e){const t=this.getLastChildName(e);return t?new Rr(t,this.children_.get(t)):null}forEachChild(e,t){const n=this.resolveIndex_(e);return n?n.inorderTraversal(e=>t(e.name,e.node)):this.children_.inorderTraversal(t)}getIterator(e){return this.getIteratorFrom(e.minPost(),e)}getIteratorFrom(e,t){const n=this.resolveIndex_(t);if(n)return n.getIteratorFrom(e,e=>e);{const n=this.children_.getIteratorFrom(e.name,Rr.Wrap);let i=n.peek();for(;null!=i&&t.compare(i,e)<0;)n.getNext(),i=n.peek();return n}}getReverseIterator(e){return this.getReverseIteratorFrom(e.maxPost(),e)}getReverseIteratorFrom(e,t){const n=this.resolveIndex_(t);if(n)return n.getReverseIteratorFrom(e,e=>e);{const n=this.children_.getReverseIteratorFrom(e.name,Rr.Wrap);let i=n.peek();for(;null!=i&&t.compare(i,e)>0;)n.getNext(),i=n.peek();return n}}compareTo(e){return this.isEmpty()?e.isEmpty()?0:-1:e.isLeafNode()||e.isEmpty()?1:e===no?-1:0}withIndex(e){if(e===Or||this.indexMap_.hasIndex(e))return this;{const t=this.indexMap_.addIndex(e,this.children_);return new to(this.children_,this.priorityNode_,t)}}isIndexed(e){return e===Or||this.indexMap_.hasIndex(e)}equals(e){if(e===this)return!0;if(e.isLeafNode())return!1;{const t=e;if(this.getPriority().equals(t.getPriority())){if(this.children_.count()===t.children_.count()){const e=this.getIterator(Kr),n=t.getIterator(Kr);let i=e.getNext(),s=n.getNext();for(;i&&s;){if(i.name!==s.name||!i.node.equals(s.node))return!1;i=e.getNext(),s=n.getNext()}return null===i&&null===s}return!1}return!1}}resolveIndex_(e){return e===Or?null:this.indexMap_.get(e.toString())}}to.INTEGER_REGEXP_=/^(0|[1-9]\d*)$/;const no=new class extends to{constructor(){super(new Ur(qr),to.EMPTY_NODE,Zr.Default)}compareTo(e){return e===this?0:1}equals(e){return e===this}getPriority(){return this}getImmediateChild(e){return to.EMPTY_NODE}isEmpty(){return!1}};Object.defineProperties(Rr,{MIN:{value:new Rr(ks,to.EMPTY_NODE)},MAX:{value:new Rr(Ns,no)}}),xr.__EMPTY_NODE=to.EMPTY_NODE,Hr.__childrenNodeConstructor=to,Fr=no,function(e){Wr=e}(no);function io(e,t=null){if(null===e)return to.EMPTY_NODE;if("object"==typeof e&&".priority"in e&&(t=e[".priority"]),n(null===t||"string"==typeof t||"number"==typeof t||"object"==typeof t&&".sv"in t,"Invalid priority type found: "+typeof t),"object"==typeof e&&".value"in e&&null!==e[".value"]&&(e=e[".value"]),"object"!=typeof e||".sv"in e){return new Hr(e,io(t))}if(e instanceof Array){let n=to.EMPTY_NODE;return Os(e,(t,i)=>{if(P(e,t)&&"."!==t.substring(0,1)){const e=io(i);!e.isLeafNode()&&e.isEmpty()||(n=n.updateImmediateChild(t,e))}}),n.updatePriority(io(t))}{const n=[];let i=!1;if(Os(e,(e,t)=>{if("."!==e.substring(0,1)){const s=io(t);s.isEmpty()||(i=i||!s.getPriority().isEmpty(),n.push(new Rr(e,s)))}}),0===n.length)return to.EMPTY_NODE;const s=Yr(n,Vr,e=>e.name,qr);if(i){const e=Yr(n,Kr.getCompare());return new to(s,io(t),new Zr({".priority":e},{".priority":Kr}))}return new to(s,io(t),Zr.Default)}}!function(e){$r=e}(io);
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
class so extends Pr{constructor(e){super(),this.indexPath_=e,n(!vr(e)&&".priority"!==dr(e),"Can't create PathIndex with empty path or .priority key")}extractChild(e){return e.getChild(this.indexPath_)}isDefinedOn(e){return!e.getChild(this.indexPath_).isEmpty()}compare(e,t){const n=this.extractChild(e.node),i=this.extractChild(t.node),s=n.compareTo(i);return 0===s?As(e.name,t.name):s}makePost(e,t){const n=io(e),i=to.EMPTY_NODE.updateChild(this.indexPath_,n);return new Rr(t,i)}maxPost(){const e=to.EMPTY_NODE.updateChild(this.indexPath_,no);return new Rr(Ns,e)}toString(){return mr(this.indexPath_,0).join("/")}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */const ro=new class extends Pr{compare(e,t){const n=e.node.compareTo(t.node);return 0===n?As(e.name,t.name):n}isDefinedOn(e){return!0}indexedValueChanged(e,t){return!e.equals(t)}minPost(){return Rr.MIN}maxPost(){return Rr.MAX}makePost(e,t){const n=io(e);return new Rr(t,n)}toString(){return".value"}};
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */function oo(e){return{type:"value",snapshotNode:e}}function ao(e,t){return{type:"child_added",snapshotNode:t,childName:e}}function co(e,t){return{type:"child_removed",snapshotNode:t,childName:e}}function ho(e,t,n){return{type:"child_changed",snapshotNode:t,childName:e,oldSnap:n}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
class lo{constructor(e){this.index_=e}updateChild(e,t,i,s,r,o){n(e.isIndexed(this.index_),"A node must be indexed if only a child is updated");const a=e.getImmediateChild(t);return a.getChild(s).equals(i.getChild(s))&&a.isEmpty()===i.isEmpty()?e:(null!=o&&(i.isEmpty()?e.hasChild(t)?o.trackChildChange(co(t,a)):n(e.isLeafNode(),"A child remove without an old child only makes sense on a leaf node"):a.isEmpty()?o.trackChildChange(ao(t,i)):o.trackChildChange(ho(t,i,a))),e.isLeafNode()&&i.isEmpty()?e:e.updateImmediateChild(t,i).withIndex(this.index_))}updateFullNode(e,t,n){return null!=n&&(e.isLeafNode()||e.forEachChild(Kr,(e,i)=>{t.hasChild(e)||n.trackChildChange(co(e,i))}),t.isLeafNode()||t.forEachChild(Kr,(t,i)=>{if(e.hasChild(t)){const s=e.getImmediateChild(t);s.equals(i)||n.trackChildChange(ho(t,i,s))}else n.trackChildChange(ao(t,i))})),t.withIndex(this.index_)}updatePriority(e,t){return e.isEmpty()?to.EMPTY_NODE:e.updatePriority(t)}filtersNodes(){return!1}getIndexedFilter(){return this}getIndex(){return this.index_}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class uo{constructor(e){this.indexedFilter_=new lo(e.getIndex()),this.index_=e.getIndex(),this.startPost_=uo.getStartPost_(e),this.endPost_=uo.getEndPost_(e),this.startIsInclusive_=!e.startAfterSet_,this.endIsInclusive_=!e.endBeforeSet_}getStartPost(){return this.startPost_}getEndPost(){return this.endPost_}matches(e){const t=this.startIsInclusive_?this.index_.compare(this.getStartPost(),e)<=0:this.index_.compare(this.getStartPost(),e)<0,n=this.endIsInclusive_?this.index_.compare(e,this.getEndPost())<=0:this.index_.compare(e,this.getEndPost())<0;return t&&n}updateChild(e,t,n,i,s,r){return this.matches(new Rr(t,n))||(n=to.EMPTY_NODE),this.indexedFilter_.updateChild(e,t,n,i,s,r)}updateFullNode(e,t,n){t.isLeafNode()&&(t=to.EMPTY_NODE);let i=t.withIndex(this.index_);i=i.updatePriority(to.EMPTY_NODE);const s=this;return t.forEachChild(Kr,(e,t)=>{s.matches(new Rr(e,t))||(i=i.updateImmediateChild(e,to.EMPTY_NODE))}),this.indexedFilter_.updateFullNode(e,i,n)}updatePriority(e,t){return e}filtersNodes(){return!0}getIndexedFilter(){return this.indexedFilter_}getIndex(){return this.index_}static getStartPost_(e){if(e.hasStart()){const t=e.getIndexStartName();return e.getIndex().makePost(e.getIndexStartValue(),t)}return e.getIndex().minPost()}static getEndPost_(e){if(e.hasEnd()){const t=e.getIndexEndName();return e.getIndex().makePost(e.getIndexEndValue(),t)}return e.getIndex().maxPost()}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class fo{constructor(e){this.withinDirectionalStart=e=>this.reverse_?this.withinEndPost(e):this.withinStartPost(e),this.withinDirectionalEnd=e=>this.reverse_?this.withinStartPost(e):this.withinEndPost(e),this.withinStartPost=e=>{const t=this.index_.compare(this.rangedFilter_.getStartPost(),e);return this.startIsInclusive_?t<=0:t<0},this.withinEndPost=e=>{const t=this.index_.compare(e,this.rangedFilter_.getEndPost());return this.endIsInclusive_?t<=0:t<0},this.rangedFilter_=new uo(e),this.index_=e.getIndex(),this.limit_=e.getLimit(),this.reverse_=!e.isViewFromLeft(),this.startIsInclusive_=!e.startAfterSet_,this.endIsInclusive_=!e.endBeforeSet_}updateChild(e,t,n,i,s,r){return this.rangedFilter_.matches(new Rr(t,n))||(n=to.EMPTY_NODE),e.getImmediateChild(t).equals(n)?e:e.numChildren()<this.limit_?this.rangedFilter_.getIndexedFilter().updateChild(e,t,n,i,s,r):this.fullLimitUpdateChild_(e,t,n,s,r)}updateFullNode(e,t,n){let i;if(t.isLeafNode()||t.isEmpty())i=to.EMPTY_NODE.withIndex(this.index_);else if(2*this.limit_<t.numChildren()&&t.isIndexed(this.index_)){let e;i=to.EMPTY_NODE.withIndex(this.index_),e=this.reverse_?t.getReverseIteratorFrom(this.rangedFilter_.getEndPost(),this.index_):t.getIteratorFrom(this.rangedFilter_.getStartPost(),this.index_);let n=0;for(;e.hasNext()&&n<this.limit_;){const t=e.getNext();if(this.withinDirectionalStart(t)){if(!this.withinDirectionalEnd(t))break;i=i.updateImmediateChild(t.name,t.node),n++}}}else{let e;i=t.withIndex(this.index_),i=i.updatePriority(to.EMPTY_NODE),e=this.reverse_?i.getReverseIterator(this.index_):i.getIterator(this.index_);let n=0;for(;e.hasNext();){const t=e.getNext();n<this.limit_&&this.withinDirectionalStart(t)&&this.withinDirectionalEnd(t)?n++:i=i.updateImmediateChild(t.name,to.EMPTY_NODE)}}return this.rangedFilter_.getIndexedFilter().updateFullNode(e,i,n)}updatePriority(e,t){return e}filtersNodes(){return!0}getIndexedFilter(){return this.rangedFilter_.getIndexedFilter()}getIndex(){return this.index_}fullLimitUpdateChild_(e,t,i,s,r){let o;if(this.reverse_){const e=this.index_.getCompare();o=(t,n)=>e(n,t)}else o=this.index_.getCompare();const a=e;n(a.numChildren()===this.limit_,"");const c=new Rr(t,i),h=this.reverse_?a.getFirstChild(this.index_):a.getLastChild(this.index_),l=this.rangedFilter_.matches(c);if(a.hasChild(t)){const e=a.getImmediateChild(t);let n=s.getChildAfterChild(this.index_,h,this.reverse_);for(;null!=n&&(n.name===t||a.hasChild(n.name));)n=s.getChildAfterChild(this.index_,n,this.reverse_);const u=null==n?1:o(n,c);if(l&&!i.isEmpty()&&u>=0)return null!=r&&r.trackChildChange(ho(t,i,e)),a.updateImmediateChild(t,i);{null!=r&&r.trackChildChange(co(t,e));const i=a.updateImmediateChild(t,to.EMPTY_NODE);return null!=n&&this.rangedFilter_.matches(n)?(null!=r&&r.trackChildChange(ao(n.name,n.node)),i.updateImmediateChild(n.name,n.node)):i}}return i.isEmpty()?e:l&&o(h,c)>=0?(null!=r&&(r.trackChildChange(co(h.name,h.node)),r.trackChildChange(ao(t,i))),a.updateImmediateChild(t,i).updateImmediateChild(h.name,to.EMPTY_NODE)):e}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class po{constructor(){this.limitSet_=!1,this.startSet_=!1,this.startNameSet_=!1,this.startAfterSet_=!1,this.endSet_=!1,this.endNameSet_=!1,this.endBeforeSet_=!1,this.limit_=0,this.viewFrom_="",this.indexStartValue_=null,this.indexStartName_="",this.indexEndValue_=null,this.indexEndName_="",this.index_=Kr}hasStart(){return this.startSet_}isViewFromLeft(){return""===this.viewFrom_?this.startSet_:"l"===this.viewFrom_}getIndexStartValue(){return n(this.startSet_,"Only valid if start has been set"),this.indexStartValue_}getIndexStartName(){return n(this.startSet_,"Only valid if start has been set"),this.startNameSet_?this.indexStartName_:ks}hasEnd(){return this.endSet_}getIndexEndValue(){return n(this.endSet_,"Only valid if end has been set"),this.indexEndValue_}getIndexEndName(){return n(this.endSet_,"Only valid if end has been set"),this.endNameSet_?this.indexEndName_:Ns}hasLimit(){return this.limitSet_}hasAnchoredLimit(){return this.limitSet_&&""!==this.viewFrom_}getLimit(){return n(this.limitSet_,"Only valid if limit has been set"),this.limit_}getIndex(){return this.index_}loadsAllData(){return!(this.startSet_||this.endSet_||this.limitSet_)}isDefault(){return this.loadsAllData()&&this.index_===Kr}copy(){const e=new po;return e.limitSet_=this.limitSet_,e.limit_=this.limit_,e.startSet_=this.startSet_,e.startAfterSet_=this.startAfterSet_,e.indexStartValue_=this.indexStartValue_,e.startNameSet_=this.startNameSet_,e.indexStartName_=this.indexStartName_,e.endSet_=this.endSet_,e.endBeforeSet_=this.endBeforeSet_,e.indexEndValue_=this.indexEndValue_,e.endNameSet_=this.endNameSet_,e.indexEndName_=this.indexEndName_,e.index_=this.index_,e.viewFrom_=this.viewFrom_,e}}function go(e){const t={};if(e.isDefault())return t;let i;if(e.index_===Kr?i="$priority":e.index_===ro?i="$value":e.index_===Or?i="$key":(n(e.index_ instanceof so,"Unrecognized index type!"),i=e.index_.toString()),t.orderBy=A(i),e.startSet_){const n=e.startAfterSet_?"startAfter":"startAt";t[n]=A(e.indexStartValue_),e.startNameSet_&&(t[n]+=","+A(e.indexStartName_))}if(e.endSet_){const n=e.endBeforeSet_?"endBefore":"endAt";t[n]=A(e.indexEndValue_),e.endNameSet_&&(t[n]+=","+A(e.indexEndName_))}return e.limitSet_&&(e.isViewFromLeft()?t.limitToFirst=e.limit_:t.limitToLast=e.limit_),t}function mo(e){const t={};if(e.startSet_&&(t.sp=e.indexStartValue_,e.startNameSet_&&(t.sn=e.indexStartName_),t.sin=!e.startAfterSet_),e.endSet_&&(t.ep=e.indexEndValue_,e.endNameSet_&&(t.en=e.indexEndName_),t.ein=!e.endBeforeSet_),e.limitSet_){t.l=e.limit_;let n=e.viewFrom_;""===n&&(n=e.isViewFromLeft()?"l":"r"),t.vf=n}return e.index_!==Kr&&(t.i=e.index_.toString()),t}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class _o extends ar{constructor(e,t,n,i){super(),this.repoInfo_=e,this.onDataUpdate_=t,this.authTokenProvider_=n,this.appCheckTokenProvider_=i,this.log_=Is("p:rest:"),this.listens_={}}reportStats(e){throw new Error("Method not implemented.")}static getListenId_(e,t){return void 0!==t?"tag$"+t:(n(e._queryParams.isDefault(),"should have a tag if it's not a default query."),e._path.toString())}listen(e,t,n,i){const s=e._path.toString();this.log_("Listen called for "+s+" "+e._queryIdentifier);const r=_o.getListenId_(e,n),o={};this.listens_[r]=o;const a=go(e._queryParams);this.restRequest_(s+".json",a,(e,t)=>{let a=t;if(404===e&&(a=null,e=null),null===e&&this.onDataUpdate_(s,a,!1,n),D(this.listens_,r)===o){let t;t=e?401===e?"permission_denied":"rest_error:"+e:"ok",i(t,null)}})}unlisten(e,t){const n=_o.getListenId_(e,t);delete this.listens_[n]}get(e){const t=go(e._queryParams),n=e._path.toString(),i=new v;return this.restRequest_(n+".json",t,(e,t)=>{let s=t;404===e&&(s=null,e=null),null===e?(this.onDataUpdate_(n,s,!1,null),i.resolve(s)):i.reject(new Error(s))}),i.promise}refreshAuthToken(e){}restRequest_(e,t={},n){return t.format="export",Promise.all([this.authTokenProvider_.getToken(!1),this.appCheckTokenProvider_.getToken(!1)]).then(([i,s])=>{i&&i.accessToken&&(t.auth=i.accessToken),s&&s.token&&(t.ac=s.token);const r=(this.repoInfo_.secure?"https://":"http://")+this.repoInfo_.host+e+"?ns="+this.repoInfo_.namespace+F(t);this.log_("Sending REST request for "+r);const o=new XMLHttpRequest;o.onreadystatechange=()=>{if(n&&4===o.readyState){this.log_("REST Response for "+r+" received. status:",o.status,"response:",o.responseText);let t=null;if(o.status>=200&&o.status<300){try{t=N(o.responseText)}catch(e){Es("Failed to parse JSON response for "+r+": "+o.responseText)}n(null,t)}else 401!==o.status&&404!==o.status&&Es("Got unsuccessful REST response for "+r+" Status: "+o.status),n(o.status);n=null}},o.open("GET",r,!0),o.send()})}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class yo{constructor(){this.rootNode_=to.EMPTY_NODE}getNode(e){return this.rootNode_.getChild(e)}updateSnapshot(e,t){this.rootNode_=this.rootNode_.updateChild(e,t)}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */function vo(){return{value:null,children:new Map}}function wo(e,t,n){if(vr(t))e.value=n,e.children.clear();else if(null!==e.value)e.value=e.value.updateChild(t,n);else{const i=dr(t);e.children.has(i)||e.children.set(i,vo());wo(e.children.get(i),t=pr(t),n)}}function To(e,t){if(vr(t))return e.value=null,e.children.clear(),!0;if(null!==e.value){if(e.value.isLeafNode())return!1;{const n=e.value;return e.value=null,n.forEachChild(Kr,(t,n)=>{wo(e,new lr(t),n)}),To(e,t)}}if(e.children.size>0){const n=dr(t);if(t=pr(t),e.children.has(n)){To(e.children.get(n),t)&&e.children.delete(n)}return 0===e.children.size}return!0}function Io(e,t,n){null!==e.value?n(t,e.value):function(e,t){e.children.forEach((e,n)=>{t(n,e)})}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */(e,(e,i)=>{Io(i,new lr(t.toString()+"/"+e),n)})}class bo{constructor(e){this.collection_=e,this.last_=null}get(){const e=this.collection_.get(),t=Object.assign({},e);return this.last_&&Os(this.last_,(e,n)=>{t[e]=t[e]-n}),this.last_=e,t}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Co{constructor(e,t){this.server_=t,this.statsToReport_={},this.statsListener_=new bo(e);const n=1e4+2e4*Math.random();Vs(this.reportStats_.bind(this),Math.floor(n))}reportStats_(){const e=this.statsListener_.get(),t={};let n=!1;Os(e,(e,i)=>{i>0&&P(this.statsToReport_,e)&&(t[e]=i,n=!0)}),n&&this.server_.reportStats(t),Vs(this.reportStats_.bind(this),Math.floor(2*Math.random()*3e5))}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */var Eo,So;function ko(e){return{fromUser:!1,fromServer:!0,queryId:e,tagged:!0}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */(So=Eo||(Eo={}))[So.OVERWRITE=0]="OVERWRITE",So[So.MERGE=1]="MERGE",So[So.ACK_USER_WRITE=2]="ACK_USER_WRITE",So[So.LISTEN_COMPLETE=3]="LISTEN_COMPLETE";class No{constructor(e,t,n){this.path=e,this.affectedTree=t,this.revert=n,this.type=Eo.ACK_USER_WRITE,this.source={fromUser:!0,fromServer:!1,queryId:null,tagged:!1}}operationForChild(e){if(vr(this.path)){if(null!=this.affectedTree.value)return n(this.affectedTree.children.isEmpty(),"affectedTree should not have overlapping affected paths."),this;{const t=this.affectedTree.subtree(new lr(e));return new No(ur(),t,this.revert)}}return n(dr(this.path)===e,"operationForChild called for unrelated child."),new No(pr(this.path),this.affectedTree,this.revert)}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Ao{constructor(e,t){this.source=e,this.path=t,this.type=Eo.LISTEN_COMPLETE}operationForChild(e){return vr(this.path)?new Ao(this.source,ur()):new Ao(this.source,pr(this.path))}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Ro{constructor(e,t,n){this.source=e,this.path=t,this.snap=n,this.type=Eo.OVERWRITE}operationForChild(e){return vr(this.path)?new Ro(this.source,ur(),this.snap.getImmediateChild(e)):new Ro(this.source,pr(this.path),this.snap)}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Po{constructor(e,t,n){this.source=e,this.path=t,this.children=n,this.type=Eo.MERGE}operationForChild(e){if(vr(this.path)){const t=this.children.subtree(new lr(e));return t.isEmpty()?null:t.value?new Ro(this.source,ur(),t.value):new Po(this.source,ur(),t)}return n(dr(this.path)===e,"Can't get a merge for a child not on the path of the operation"),new Po(this.source,pr(this.path),this.children)}toString(){return"Operation("+this.path+": "+this.source.toString()+" merge: "+this.children.toString()+")"}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Do{constructor(e,t,n){this.node_=e,this.fullyInitialized_=t,this.filtered_=n}isFullyInitialized(){return this.fullyInitialized_}isFiltered(){return this.filtered_}isCompleteForPath(e){if(vr(e))return this.isFullyInitialized()&&!this.filtered_;const t=dr(e);return this.isCompleteForChild(t)}isCompleteForChild(e){return this.isFullyInitialized()&&!this.filtered_||this.node_.hasChild(e)}getNode(){return this.node_}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class xo{constructor(e){this.query_=e,this.index_=this.query_._queryParams.getIndex()}}function Oo(e,t,n,s,r,o){const a=s.filter(e=>e.type===n);a.sort((t,n)=>function(e,t,n){if(null==t.childName||null==n.childName)throw i("Should only compare child_ events.");const s=new Rr(t.childName,t.snapshotNode),r=new Rr(n.childName,n.snapshotNode);return e.index_.compare(s,r)}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */(e,t,n)),a.forEach(n=>{const i=function(e,t,n){return"value"===t.type||"child_removed"===t.type||(t.prevName=n.getPredecessorChildName(t.childName,t.snapshotNode,e.index_)),t}(e,n,o);r.forEach(s=>{s.respondsTo(n.type)&&t.push(s.createEvent(i,e.query_))})})}function Lo(e,t){return{eventCache:e,serverCache:t}}function Mo(e,t,n,i){return Lo(new Do(t,n,i),e.serverCache)}function Fo(e,t,n,i){return Lo(e.eventCache,new Do(t,n,i))}function Uo(e){return e.eventCache.isFullyInitialized()?e.eventCache.getNode():null}function Vo(e){return e.serverCache.isFullyInitialized()?e.serverCache.getNode():null}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */let qo;class jo{constructor(e,t=(()=>(qo||(qo=new Ur(Rs)),qo))()){this.value=e,this.children=t}static fromObject(e){let t=new jo(null);return Os(e,(e,n)=>{t=t.set(new lr(e),n)}),t}isEmpty(){return null===this.value&&this.children.isEmpty()}findRootMostMatchingPathAndValue(e,t){if(null!=this.value&&t(this.value))return{path:ur(),value:this.value};if(vr(e))return null;{const n=dr(e),i=this.children.get(n);if(null!==i){const s=i.findRootMostMatchingPathAndValue(pr(e),t);if(null!=s){return{path:yr(new lr(n),s.path),value:s.value}}return null}return null}}findRootMostValueAndPath(e){return this.findRootMostMatchingPathAndValue(e,()=>!0)}subtree(e){if(vr(e))return this;{const t=dr(e),n=this.children.get(t);return null!==n?n.subtree(pr(e)):new jo(null)}}set(e,t){if(vr(e))return new jo(t,this.children);{const n=dr(e),i=(this.children.get(n)||new jo(null)).set(pr(e),t),s=this.children.insert(n,i);return new jo(this.value,s)}}remove(e){if(vr(e))return this.children.isEmpty()?new jo(null):new jo(null,this.children);{const t=dr(e),n=this.children.get(t);if(n){const i=n.remove(pr(e));let s;return s=i.isEmpty()?this.children.remove(t):this.children.insert(t,i),null===this.value&&s.isEmpty()?new jo(null):new jo(this.value,s)}return this}}get(e){if(vr(e))return this.value;{const t=dr(e),n=this.children.get(t);return n?n.get(pr(e)):null}}setTree(e,t){if(vr(e))return t;{const n=dr(e),i=(this.children.get(n)||new jo(null)).setTree(pr(e),t);let s;return s=i.isEmpty()?this.children.remove(n):this.children.insert(n,i),new jo(this.value,s)}}fold(e){return this.fold_(ur(),e)}fold_(e,t){const n={};return this.children.inorderTraversal((i,s)=>{n[i]=s.fold_(yr(e,i),t)}),t(e,this.value,n)}findOnPath(e,t){return this.findOnPath_(e,ur(),t)}findOnPath_(e,t,n){const i=!!this.value&&n(t,this.value);if(i)return i;if(vr(e))return null;{const i=dr(e),s=this.children.get(i);return s?s.findOnPath_(pr(e),yr(t,i),n):null}}foreachOnPath(e,t){return this.foreachOnPath_(e,ur(),t)}foreachOnPath_(e,t,n){if(vr(e))return this;{this.value&&n(t,this.value);const i=dr(e),s=this.children.get(i);return s?s.foreachOnPath_(pr(e),yr(t,i),n):new jo(null)}}foreach(e){this.foreach_(ur(),e)}foreach_(e,t){this.children.inorderTraversal((n,i)=>{i.foreach_(yr(e,n),t)}),this.value&&t(e,this.value)}foreachChild(e){this.children.inorderTraversal((t,n)=>{n.value&&e(t,n.value)})}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Bo{constructor(e){this.writeTree_=e}static empty(){return new Bo(new jo(null))}}function zo(e,t,n){if(vr(t))return new Bo(new jo(n));{const i=e.writeTree_.findRootMostValueAndPath(t);if(null!=i){const s=i.path;let r=i.value;const o=wr(s,t);return r=r.updateChild(o,n),new Bo(e.writeTree_.set(s,r))}{const i=new jo(n),s=e.writeTree_.setTree(t,i);return new Bo(s)}}}function $o(e,t,n){let i=e;return Os(n,(e,n)=>{i=zo(i,yr(t,e),n)}),i}function Wo(e,t){if(vr(t))return Bo.empty();{const n=e.writeTree_.setTree(t,new jo(null));return new Bo(n)}}function Ho(e,t){return null!=Ko(e,t)}function Ko(e,t){const n=e.writeTree_.findRootMostValueAndPath(t);return null!=n?e.writeTree_.get(n.path).getChild(wr(n.path,t)):null}function Go(e){const t=[],n=e.writeTree_.value;return null!=n?n.isLeafNode()||n.forEachChild(Kr,(e,n)=>{t.push(new Rr(e,n))}):e.writeTree_.children.inorderTraversal((e,n)=>{null!=n.value&&t.push(new Rr(e,n.value))}),t}function Qo(e,t){if(vr(t))return e;{const n=Ko(e,t);return new Bo(null!=n?new jo(n):e.writeTree_.subtree(t))}}function Yo(e){return e.writeTree_.isEmpty()}function Jo(e,t){return Xo(ur(),e.writeTree_,t)}function Xo(e,t,i){if(null!=t.value)return i.updateChild(e,t.value);{let s=null;return t.children.inorderTraversal((t,r)=>{".priority"===t?(n(null!==r.value,"Priority writes must always be leaf nodes"),s=r.value):i=Xo(yr(e,t),r,i)}),i.getChild(e).isEmpty()||null===s||(i=i.updateChild(yr(e,".priority"),s)),i}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */function Zo(e,t){return da(t,e)}function ea(e,t){const i=e.allWrites.findIndex(e=>e.writeId===t);n(i>=0,"removeWrite called with nonexistent writeId.");const s=e.allWrites[i];e.allWrites.splice(i,1);let r=s.visible,o=!1,a=e.allWrites.length-1;for(;r&&a>=0;){const t=e.allWrites[a];t.visible&&(a>=i&&ta(t,s.path)?r=!1:br(s.path,t.path)&&(o=!0)),a--}if(r){if(o)return function(e){e.visibleWrites=ia(e.allWrites,na,ur()),e.allWrites.length>0?e.lastWriteId=e.allWrites[e.allWrites.length-1].writeId:e.lastWriteId=-1}(e),!0;if(s.snap)e.visibleWrites=Wo(e.visibleWrites,s.path);else{Os(s.children,t=>{e.visibleWrites=Wo(e.visibleWrites,yr(s.path,t))})}return!0}return!1}function ta(e,t){if(e.snap)return br(e.path,t);for(const n in e.children)if(e.children.hasOwnProperty(n)&&br(yr(e.path,n),t))return!0;return!1}function na(e){return e.visible}function ia(e,t,n){let s=Bo.empty();for(let r=0;r<e.length;++r){const o=e[r];if(t(o)){const e=o.path;let t;if(o.snap)br(n,e)?(t=wr(n,e),s=zo(s,t,o.snap)):br(e,n)&&(t=wr(e,n),s=zo(s,ur(),o.snap.getChild(t)));else{if(!o.children)throw i("WriteRecord should have .snap or .children");if(br(n,e))t=wr(n,e),s=$o(s,t,o.children);else if(br(e,n))if(t=wr(e,n),vr(t))s=$o(s,ur(),o.children);else{const e=D(o.children,dr(t));if(e){const n=e.getChild(pr(t));s=zo(s,ur(),n)}}}}}return s}function sa(e,t,n,i,s){if(i||s){const r=Qo(e.visibleWrites,t);if(!s&&Yo(r))return n;if(s||null!=n||Ho(r,ur())){const r=function(e){return(e.visible||s)&&(!i||!~i.indexOf(e.writeId))&&(br(e.path,t)||br(t,e.path))};return Jo(ia(e.allWrites,r,t),n||to.EMPTY_NODE)}return null}{const i=Ko(e.visibleWrites,t);if(null!=i)return i;{const i=Qo(e.visibleWrites,t);if(Yo(i))return n;if(null!=n||Ho(i,ur())){return Jo(i,n||to.EMPTY_NODE)}return null}}}function ra(e,t,n,i){return sa(e.writeTree,e.treePath,t,n,i)}function oa(e,t){return function(e,t,n){let i=to.EMPTY_NODE;const s=Ko(e.visibleWrites,t);if(s)return s.isLeafNode()||s.forEachChild(Kr,(e,t)=>{i=i.updateImmediateChild(e,t)}),i;if(n){const s=Qo(e.visibleWrites,t);return n.forEachChild(Kr,(e,t)=>{const n=Jo(Qo(s,new lr(e)),t);i=i.updateImmediateChild(e,n)}),Go(s).forEach(e=>{i=i.updateImmediateChild(e.name,e.node)}),i}return Go(Qo(e.visibleWrites,t)).forEach(e=>{i=i.updateImmediateChild(e.name,e.node)}),i}(e.writeTree,e.treePath,t)}function aa(e,t,i,s){return function(e,t,i,s,r){n(s||r,"Either existingEventSnap or existingServerSnap must exist");const o=yr(t,i);if(Ho(e.visibleWrites,o))return null;{const t=Qo(e.visibleWrites,o);return Yo(t)?r.getChild(i):Jo(t,r.getChild(i))}}(e.writeTree,e.treePath,t,i,s)}function ca(e,t){return function(e,t){return Ko(e.visibleWrites,t)}(e.writeTree,yr(e.treePath,t))}function ha(e,t,n,i,s,r){return function(e,t,n,i,s,r,o){let a;const c=Qo(e.visibleWrites,t),h=Ko(c,ur());if(null!=h)a=h;else{if(null==n)return[];a=Jo(c,n)}if(a=a.withIndex(o),a.isEmpty()||a.isLeafNode())return[];{const e=[],t=o.getCompare(),n=r?a.getReverseIteratorFrom(i,o):a.getIteratorFrom(i,o);let c=n.getNext();for(;c&&e.length<s;)0!==t(c,i)&&e.push(c),c=n.getNext();return e}}(e.writeTree,e.treePath,t,n,i,s,r)}function la(e,t,n){return function(e,t,n,i){const s=yr(t,n),r=Ko(e.visibleWrites,s);if(null!=r)return r;if(i.isCompleteForChild(n))return Jo(Qo(e.visibleWrites,s),i.getNode().getImmediateChild(n));return null}(e.writeTree,e.treePath,t,n)}function ua(e,t){return da(yr(e.treePath,t),e.writeTree)}function da(e,t){return{treePath:e,writeTree:t}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class fa{constructor(){this.changeMap=new Map}trackChildChange(e){const t=e.type,s=e.childName;n("child_added"===t||"child_changed"===t||"child_removed"===t,"Only child changes supported for tracking"),n(".priority"!==s,"Only non-priority child changes can be tracked.");const r=this.changeMap.get(s);if(r){const n=r.type;if("child_added"===t&&"child_removed"===n)this.changeMap.set(s,ho(s,e.snapshotNode,r.snapshotNode));else if("child_removed"===t&&"child_added"===n)this.changeMap.delete(s);else if("child_removed"===t&&"child_changed"===n)this.changeMap.set(s,co(s,r.oldSnap));else if("child_changed"===t&&"child_added"===n)this.changeMap.set(s,ao(s,e.snapshotNode));else{if("child_changed"!==t||"child_changed"!==n)throw i("Illegal combination of changes: "+e+" occurred after "+r);this.changeMap.set(s,ho(s,e.snapshotNode,r.oldSnap))}}else this.changeMap.set(s,e)}getChanges(){return Array.from(this.changeMap.values())}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */const pa=new class{getCompleteChild(e){return null}getChildAfterChild(e,t,n){return null}};class ga{constructor(e,t,n=null){this.writes_=e,this.viewCache_=t,this.optCompleteServerCache_=n}getCompleteChild(e){const t=this.viewCache_.eventCache;if(t.isCompleteForChild(e))return t.getNode().getImmediateChild(e);{const t=null!=this.optCompleteServerCache_?new Do(this.optCompleteServerCache_,!0,!1):this.viewCache_.serverCache;return la(this.writes_,e,t)}}getChildAfterChild(e,t,n){const i=null!=this.optCompleteServerCache_?this.optCompleteServerCache_:Vo(this.viewCache_),s=ha(this.writes_,i,t,1,n,e);return 0===s.length?null:s[0]}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */function ma(e,t,s,r,o){const a=new fa;let c,h;if(s.type===Eo.OVERWRITE){const i=s;i.source.fromUser?c=va(e,t,i.path,i.snap,r,o,a):(n(i.source.fromServer,"Unknown source."),h=i.source.tagged||t.serverCache.isFiltered()&&!vr(i.path),c=ya(e,t,i.path,i.snap,r,o,h,a))}else if(s.type===Eo.MERGE){const i=s;i.source.fromUser?c=function(e,t,n,i,s,r,o){let a=t;return i.foreach((i,c)=>{const h=yr(n,i);wa(t,dr(h))&&(a=va(e,a,h,c,s,r,o))}),i.foreach((i,c)=>{const h=yr(n,i);wa(t,dr(h))||(a=va(e,a,h,c,s,r,o))}),a}(e,t,i.path,i.children,r,o,a):(n(i.source.fromServer,"Unknown source."),h=i.source.tagged||t.serverCache.isFiltered(),c=Ia(e,t,i.path,i.children,r,o,h,a))}else if(s.type===Eo.ACK_USER_WRITE){const i=s;c=i.revert?function(e,t,i,s,r,o){let a;if(null!=ca(s,i))return t;{const c=new ga(s,t,r),h=t.eventCache.getNode();let l;if(vr(i)||".priority"===dr(i)){let i;if(t.serverCache.isFullyInitialized())i=ra(s,Vo(t));else{const e=t.serverCache.getNode();n(e instanceof to,"serverChildren would be complete if leaf node"),i=oa(s,e)}l=e.filter.updateFullNode(h,i,o)}else{const n=dr(i);let r=la(s,n,t.serverCache);null==r&&t.serverCache.isCompleteForChild(n)&&(r=h.getImmediateChild(n)),l=null!=r?e.filter.updateChild(h,n,r,pr(i),c,o):t.eventCache.getNode().hasChild(n)?e.filter.updateChild(h,n,to.EMPTY_NODE,pr(i),c,o):h,l.isEmpty()&&t.serverCache.isFullyInitialized()&&(a=ra(s,Vo(t)),a.isLeafNode()&&(l=e.filter.updateFullNode(l,a,o)))}return a=t.serverCache.isFullyInitialized()||null!=ca(s,ur()),Mo(t,l,a,e.filter.filtersNodes())}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */(e,t,i.path,r,o,a):function(e,t,n,i,s,r,o){if(null!=ca(s,n))return t;const a=t.serverCache.isFiltered(),c=t.serverCache;if(null!=i.value){if(vr(n)&&c.isFullyInitialized()||c.isCompleteForPath(n))return ya(e,t,n,c.getNode().getChild(n),s,r,a,o);if(vr(n)){let i=new jo(null);return c.getNode().forEachChild(Or,(e,t)=>{i=i.set(new lr(e),t)}),Ia(e,t,n,i,s,r,a,o)}return t}{let h=new jo(null);return i.foreach((e,t)=>{const i=yr(n,e);c.isCompleteForPath(i)&&(h=h.set(e,c.getNode().getChild(i)))}),Ia(e,t,n,h,s,r,a,o)}}(e,t,i.path,i.affectedTree,r,o,a)}else{if(s.type!==Eo.LISTEN_COMPLETE)throw i("Unknown operation type: "+s.type);c=function(e,t,n,i,s){const r=t.serverCache,o=Fo(t,r.getNode(),r.isFullyInitialized()||vr(n),r.isFiltered());return _a(e,o,n,i,pa,s)}(e,t,s.path,r,a)}const l=a.getChanges();return function(e,t,n){const i=t.eventCache;if(i.isFullyInitialized()){const s=i.getNode().isLeafNode()||i.getNode().isEmpty(),r=Uo(e);(n.length>0||!e.eventCache.isFullyInitialized()||s&&!i.getNode().equals(r)||!i.getNode().getPriority().equals(r.getPriority()))&&n.push(oo(Uo(t)))}}(t,c,l),{viewCache:c,changes:l}}function _a(e,t,i,s,r,o){const a=t.eventCache;if(null!=ca(s,i))return t;{let c,h;if(vr(i))if(n(t.serverCache.isFullyInitialized(),"If change path is empty, we must have complete server data"),t.serverCache.isFiltered()){const n=Vo(t),i=oa(s,n instanceof to?n:to.EMPTY_NODE);c=e.filter.updateFullNode(t.eventCache.getNode(),i,o)}else{const n=ra(s,Vo(t));c=e.filter.updateFullNode(t.eventCache.getNode(),n,o)}else{const l=dr(i);if(".priority"===l){n(1===fr(i),"Can't have a priority with additional path components");const r=a.getNode();h=t.serverCache.getNode();const o=aa(s,i,r,h);c=null!=o?e.filter.updatePriority(r,o):a.getNode()}else{const n=pr(i);let u;if(a.isCompleteForChild(l)){h=t.serverCache.getNode();const e=aa(s,i,a.getNode(),h);u=null!=e?a.getNode().getImmediateChild(l).updateChild(n,e):a.getNode().getImmediateChild(l)}else u=la(s,l,t.serverCache);c=null!=u?e.filter.updateChild(a.getNode(),l,u,n,r,o):a.getNode()}}return Mo(t,c,a.isFullyInitialized()||vr(i),e.filter.filtersNodes())}}function ya(e,t,n,i,s,r,o,a){const c=t.serverCache;let h;const l=o?e.filter:e.filter.getIndexedFilter();if(vr(n))h=l.updateFullNode(c.getNode(),i,null);else if(l.filtersNodes()&&!c.isFiltered()){const e=c.getNode().updateChild(n,i);h=l.updateFullNode(c.getNode(),e,null)}else{const e=dr(n);if(!c.isCompleteForPath(n)&&fr(n)>1)return t;const s=pr(n),r=c.getNode().getImmediateChild(e).updateChild(s,i);h=".priority"===e?l.updatePriority(c.getNode(),r):l.updateChild(c.getNode(),e,r,s,pa,null)}const u=Fo(t,h,c.isFullyInitialized()||vr(n),l.filtersNodes());return _a(e,u,n,s,new ga(s,u,r),a)}function va(e,t,n,i,s,r,o){const a=t.eventCache;let c,h;const l=new ga(s,t,r);if(vr(n))h=e.filter.updateFullNode(t.eventCache.getNode(),i,o),c=Mo(t,h,!0,e.filter.filtersNodes());else{const s=dr(n);if(".priority"===s)h=e.filter.updatePriority(t.eventCache.getNode(),i),c=Mo(t,h,a.isFullyInitialized(),a.isFiltered());else{const r=pr(n),h=a.getNode().getImmediateChild(s);let u;if(vr(r))u=i;else{const e=l.getCompleteChild(s);u=null!=e?".priority"===gr(r)&&e.getChild(_r(r)).isEmpty()?e:e.updateChild(r,i):to.EMPTY_NODE}if(h.equals(u))c=t;else{c=Mo(t,e.filter.updateChild(a.getNode(),s,u,r,l,o),a.isFullyInitialized(),e.filter.filtersNodes())}}}return c}function wa(e,t){return e.eventCache.isCompleteForChild(t)}function Ta(e,t,n){return n.foreach((e,n)=>{t=t.updateChild(e,n)}),t}function Ia(e,t,n,i,s,r,o,a){if(t.serverCache.getNode().isEmpty()&&!t.serverCache.isFullyInitialized())return t;let c,h=t;c=vr(n)?i:new jo(null).setTree(n,i);const l=t.serverCache.getNode();return c.children.inorderTraversal((n,i)=>{if(l.hasChild(n)){const c=Ta(0,t.serverCache.getNode().getImmediateChild(n),i);h=ya(e,h,new lr(n),c,s,r,o,a)}}),c.children.inorderTraversal((n,i)=>{const c=!t.serverCache.isCompleteForChild(n)&&null===i.value;if(!l.hasChild(n)&&!c){const c=Ta(0,t.serverCache.getNode().getImmediateChild(n),i);h=ya(e,h,new lr(n),c,s,r,o,a)}}),h}class ba{constructor(e,t){this.query_=e,this.eventRegistrations_=[];const n=this.query_._queryParams,i=new lo(n.getIndex()),s=(r=n).loadsAllData()?new lo(r.getIndex()):r.hasLimit()?new fo(r):new uo(r);var r;this.processor_=function(e){return{filter:e}}(s);const o=t.serverCache,a=t.eventCache,c=i.updateFullNode(to.EMPTY_NODE,o.getNode(),null),h=s.updateFullNode(to.EMPTY_NODE,a.getNode(),null),l=new Do(c,o.isFullyInitialized(),i.filtersNodes()),u=new Do(h,a.isFullyInitialized(),s.filtersNodes());this.viewCache_=Lo(u,l),this.eventGenerator_=new xo(this.query_)}get query(){return this.query_}}function Ca(e,t){const n=Vo(e.viewCache_);return n&&(e.query._queryParams.loadsAllData()||!vr(t)&&!n.getImmediateChild(dr(t)).isEmpty())?n.getChild(t):null}function Ea(e){return 0===e.eventRegistrations_.length}function Sa(e,t,i){const s=[];if(i){n(null==t,"A cancel should cancel all event registrations.");const r=e.query._path;e.eventRegistrations_.forEach(e=>{const t=e.createCancelEvent(i,r);t&&s.push(t)})}if(t){let n=[];for(let i=0;i<e.eventRegistrations_.length;++i){const s=e.eventRegistrations_[i];if(s.matches(t)){if(t.hasAnyCallback()){n=n.concat(e.eventRegistrations_.slice(i+1));break}}else n.push(s)}e.eventRegistrations_=n}else e.eventRegistrations_=[];return s}function ka(e,t,i,s){t.type===Eo.MERGE&&null!==t.source.queryId&&(n(Vo(e.viewCache_),"We should always have a full cache before handling merges"),n(Uo(e.viewCache_),"Missing event cache, even though we have a server cache"));const r=e.viewCache_,o=ma(e.processor_,r,t,i,s);var a,c;return a=e.processor_,c=o.viewCache,n(c.eventCache.getNode().isIndexed(a.filter.getIndex()),"Event snap not indexed"),n(c.serverCache.getNode().isIndexed(a.filter.getIndex()),"Server snap not indexed"),n(o.viewCache.serverCache.isFullyInitialized()||!r.serverCache.isFullyInitialized(),"Once a server snap is complete, it should never go back"),e.viewCache_=o.viewCache,Na(e,o.changes,o.viewCache.eventCache.getNode(),null)}function Na(e,t,n,i){const s=i?[i]:e.eventRegistrations_;return function(e,t,n,i){const s=[],r=[];return t.forEach(t=>{var n;"child_changed"===t.type&&e.index_.indexedValueChanged(t.oldSnap,t.snapshotNode)&&r.push((n=t.childName,{type:"child_moved",snapshotNode:t.snapshotNode,childName:n}))}),Oo(e,s,"child_removed",t,i,n),Oo(e,s,"child_added",t,i,n),Oo(e,s,"child_moved",r,i,n),Oo(e,s,"child_changed",t,i,n),Oo(e,s,"value",t,i,n),s}(e.eventGenerator_,t,n,s)}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */let Aa,Ra;class Pa{constructor(){this.views=new Map}}function Da(e,t,i,s){const r=t.source.queryId;if(null!==r){const o=e.views.get(r);return n(null!=o,"SyncTree gave us an op for an invalid query."),ka(o,t,i,s)}{let n=[];for(const r of e.views.values())n=n.concat(ka(r,t,i,s));return n}}function xa(e,t,n,i,s){const r=t._queryIdentifier,o=e.views.get(r);if(!o){let e=ra(n,s?i:null),r=!1;e?r=!0:i instanceof to?(e=oa(n,i),r=!1):(e=to.EMPTY_NODE,r=!1);const o=Lo(new Do(e,r,!1),new Do(i,s,!1));return new ba(t,o)}return o}function Oa(e,t,n,i,s,r){const o=xa(e,t,i,s,r);return e.views.has(t._queryIdentifier)||e.views.set(t._queryIdentifier,o),function(e,t){e.eventRegistrations_.push(t)}(o,n),function(e,t){const n=e.viewCache_.eventCache,i=[];n.getNode().isLeafNode()||n.getNode().forEachChild(Kr,(e,t)=>{i.push(ao(e,t))});return n.isFullyInitialized()&&i.push(oo(n.getNode())),Na(e,i,n.getNode(),t)}(o,n)}function La(e,t,i,s){const r=t._queryIdentifier,o=[];let a=[];const c=qa(e);if("default"===r)for(const[n,h]of e.views.entries())a=a.concat(Sa(h,i,s)),Ea(h)&&(e.views.delete(n),h.query._queryParams.loadsAllData()||o.push(h.query));else{const t=e.views.get(r);t&&(a=a.concat(Sa(t,i,s)),Ea(t)&&(e.views.delete(r),t.query._queryParams.loadsAllData()||o.push(t.query)))}return c&&!qa(e)&&o.push(new(n(Aa,"Reference.ts has not been loaded"),Aa)(t._repo,t._path)),{removed:o,events:a}}function Ma(e){const t=[];for(const n of e.views.values())n.query._queryParams.loadsAllData()||t.push(n);return t}function Fa(e,t){let n=null;for(const i of e.views.values())n=n||Ca(i,t);return n}function Ua(e,t){if(t._queryParams.loadsAllData())return ja(e);{const n=t._queryIdentifier;return e.views.get(n)}}function Va(e,t){return null!=Ua(e,t)}function qa(e){return null!=ja(e)}function ja(e){for(const t of e.views.values())if(t.query._queryParams.loadsAllData())return t;return null}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */let Ba=1;class za{constructor(e){this.listenProvider_=e,this.syncPointTree_=new jo(null),this.pendingWriteTree_={visibleWrites:Bo.empty(),allWrites:[],lastWriteId:-1},this.tagToQueryMap=new Map,this.queryToTagMap=new Map}}function $a(e,t,i,s,r){return function(e,t,i,s,r){n(s>e.lastWriteId,"Stacking an older write on top of newer ones"),void 0===r&&(r=!0),e.allWrites.push({path:t,snap:i,writeId:s,visible:r}),r&&(e.visibleWrites=zo(e.visibleWrites,t,i)),e.lastWriteId=s}(e.pendingWriteTree_,t,i,s,r),r?Za(e,new Ro({fromUser:!0,fromServer:!1,queryId:null,tagged:!1},t,i)):[]}function Wa(e,t,i,s){!function(e,t,i,s){n(s>e.lastWriteId,"Stacking an older merge on top of newer ones"),e.allWrites.push({path:t,children:i,writeId:s,visible:!0}),e.visibleWrites=$o(e.visibleWrites,t,i),e.lastWriteId=s}(e.pendingWriteTree_,t,i,s);const r=jo.fromObject(i);return Za(e,new Po({fromUser:!0,fromServer:!1,queryId:null,tagged:!1},t,r))}function Ha(e,t,n=!1){const i=function(e,t){for(let n=0;n<e.allWrites.length;n++){const i=e.allWrites[n];if(i.writeId===t)return i}return null}(e.pendingWriteTree_,t);if(ea(e.pendingWriteTree_,t)){let t=new jo(null);return null!=i.snap?t=t.set(ur(),!0):Os(i.children,e=>{t=t.set(new lr(e),!0)}),Za(e,new No(i.path,t,n))}return[]}function Ka(e,t,n){return Za(e,new Ro({fromUser:!1,fromServer:!0,queryId:null,tagged:!1},t,n))}function Ga(e,t,n,i,s=!1){const r=t._path,o=e.syncPointTree_.get(r);let a=[];if(o&&("default"===t._queryIdentifier||Va(o,t))){const c=La(o,t,n,i);0===o.views.size&&(e.syncPointTree_=e.syncPointTree_.remove(r));const h=c.removed;if(a=c.events,!s){const n=-1!==h.findIndex(e=>e._queryParams.loadsAllData()),s=e.syncPointTree_.findOnPath(r,(e,t)=>qa(t));if(n&&!s){const t=e.syncPointTree_.subtree(r);if(!t.isEmpty()){const n=function(e){return e.fold((e,t,n)=>{if(t&&qa(t)){return[ja(t)]}{let e=[];return t&&(e=Ma(t)),Os(n,(t,n)=>{e=e.concat(n)}),e}})}(t);for(let t=0;t<n.length;++t){const i=n[t],s=i.query,r=nc(e,i);e.listenProvider_.startListening(cc(s),ic(e,s),r.hashFn,r.onComplete)}}}if(!s&&h.length>0&&!i)if(n){const n=null;e.listenProvider_.stopListening(cc(t),n)}else h.forEach(t=>{const n=e.queryToTagMap.get(sc(t));e.listenProvider_.stopListening(cc(t),n)})}!function(e,t){for(let n=0;n<t.length;++n){const i=t[n];if(!i._queryParams.loadsAllData()){const t=sc(i),n=e.queryToTagMap.get(t);e.queryToTagMap.delete(t),e.tagToQueryMap.delete(n)}}}(e,h)}return a}function Qa(e,t,n,i){const s=rc(e,i);if(null!=s){const i=oc(s),r=i.path,o=i.queryId,a=wr(r,t);return ac(e,r,new Ro(ko(o),a,n))}return[]}function Ya(e,t,i,s=!1){const r=t._path;let o=null,a=!1;e.syncPointTree_.foreachOnPath(r,(e,t)=>{const n=wr(e,r);o=o||Fa(t,n),a=a||qa(t)});let c,h=e.syncPointTree_.get(r);if(h?(a=a||qa(h),o=o||Fa(h,ur())):(h=new Pa,e.syncPointTree_=e.syncPointTree_.set(r,h)),null!=o)c=!0;else{c=!1,o=to.EMPTY_NODE;e.syncPointTree_.subtree(r).foreachChild((e,t)=>{const n=Fa(t,ur());n&&(o=o.updateImmediateChild(e,n))})}const l=Va(h,t);if(!l&&!t._queryParams.loadsAllData()){const i=sc(t);n(!e.queryToTagMap.has(i),"View does not exist, but we have a tag");const s=Ba++;e.queryToTagMap.set(i,s),e.tagToQueryMap.set(s,i)}let u=Oa(h,t,i,Zo(e.pendingWriteTree_,r),o,c);if(!l&&!a&&!s){const i=Ua(h,t);u=u.concat(function(e,t,i){const s=t._path,r=ic(e,t),o=nc(e,i),a=e.listenProvider_.startListening(cc(t),r,o.hashFn,o.onComplete),c=e.syncPointTree_.subtree(s);if(r)n(!qa(c.value),"If we're adding a query, it shouldn't be shadowed");else{const t=c.fold((e,t,n)=>{if(!vr(e)&&t&&qa(t))return[ja(t).query];{let e=[];return t&&(e=e.concat(Ma(t).map(e=>e.query))),Os(n,(t,n)=>{e=e.concat(n)}),e}});for(let n=0;n<t.length;++n){const i=t[n];e.listenProvider_.stopListening(cc(i),ic(e,i))}}return a}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */(e,t,i))}return u}function Ja(e,t,n){const i=e.pendingWriteTree_,s=e.syncPointTree_.findOnPath(t,(e,n)=>{const i=Fa(n,wr(e,t));if(i)return i});return sa(i,t,s,n,!0)}function Xa(e,t){const n=t._path;let i=null;e.syncPointTree_.foreachOnPath(n,(e,t)=>{const s=wr(e,n);i=i||Fa(t,s)});let s=e.syncPointTree_.get(n);s?i=i||Fa(s,ur()):(s=new Pa,e.syncPointTree_=e.syncPointTree_.set(n,s));const r=null!=i,o=r?new Do(i,!0,!1):null;return function(e){return Uo(e.viewCache_)}(xa(s,t,Zo(e.pendingWriteTree_,t._path),r?o.getNode():to.EMPTY_NODE,r))}function Za(e,t){return ec(t,e.syncPointTree_,null,Zo(e.pendingWriteTree_,ur()))}function ec(e,t,n,i){if(vr(e.path))return tc(e,t,n,i);{const s=t.get(ur());null==n&&null!=s&&(n=Fa(s,ur()));let r=[];const o=dr(e.path),a=e.operationForChild(o),c=t.children.get(o);if(c&&a){const e=n?n.getImmediateChild(o):null,t=ua(i,o);r=r.concat(ec(a,c,e,t))}return s&&(r=r.concat(Da(s,e,i,n))),r}}function tc(e,t,n,i){const s=t.get(ur());null==n&&null!=s&&(n=Fa(s,ur()));let r=[];return t.children.inorderTraversal((t,s)=>{const o=n?n.getImmediateChild(t):null,a=ua(i,t),c=e.operationForChild(t);c&&(r=r.concat(tc(c,s,o,a)))}),s&&(r=r.concat(Da(s,e,i,n))),r}function nc(e,t){const n=t.query,i=ic(e,n);return{hashFn:()=>{const e=function(e){return e.viewCache_.serverCache.getNode()}(t)||to.EMPTY_NODE;return e.hash()},onComplete:t=>{if("ok"===t)return i?function(e,t,n){const i=rc(e,n);if(i){const n=oc(i),s=n.path,r=n.queryId,o=wr(s,t);return ac(e,s,new Ao(ko(r),o))}return[]}(e,n._path,i):function(e,t){return Za(e,new Ao({fromUser:!1,fromServer:!0,queryId:null,tagged:!1},t))}(e,n._path);{const i=function(e,t){let n="Unknown Error";"too_big"===e?n="The data requested exceeds the maximum size that can be accessed with a single request.":"permission_denied"===e?n="Client doesn't have permission to access the desired data.":"unavailable"===e&&(n="The service is unavailable");const i=new Error(e+" at "+t._path.toString()+": "+n);return i.code=e.toUpperCase(),i}(t,n);return Ga(e,n,null,i)}}}}function ic(e,t){const n=sc(t);return e.queryToTagMap.get(n)}function sc(e){return e._path.toString()+"$"+e._queryIdentifier}function rc(e,t){return e.tagToQueryMap.get(t)}function oc(e){const t=e.indexOf("$");return n(-1!==t&&t<e.length-1,"Bad queryKey."),{queryId:e.substr(t+1),path:new lr(e.substr(0,t))}}function ac(e,t,i){const s=e.syncPointTree_.get(t);n(s,"Missing sync point for query tag that we're tracking");return Da(s,i,Zo(e.pendingWriteTree_,t),null)}function cc(e){return e._queryParams.loadsAllData()&&!e._queryParams.isDefault()?new(n(Ra,"Reference.ts has not been loaded"),Ra)(e._repo,e._path):e}class hc{constructor(e){this.node_=e}getImmediateChild(e){const t=this.node_.getImmediateChild(e);return new hc(t)}node(){return this.node_}}class lc{constructor(e,t){this.syncTree_=e,this.path_=t}getImmediateChild(e){const t=yr(this.path_,e);return new lc(this.syncTree_,t)}node(){return Ja(this.syncTree_,this.path_)}}const uc=function(e,t,i){return e&&"object"==typeof e?(n(".sv"in e,"Unexpected leaf node or priority contents"),"string"==typeof e[".sv"]?dc(e[".sv"],t,i):"object"==typeof e[".sv"]?fc(e[".sv"],t):void n(!1,"Unexpected server value: "+JSON.stringify(e,null,2))):e},dc=function(e,t,i){if("timestamp"===e)return i.timestamp;n(!1,"Unexpected server value: "+e)},fc=function(e,t,i){e.hasOwnProperty("increment")||n(!1,"Unexpected server value: "+JSON.stringify(e,null,2));const s=e.increment;"number"!=typeof s&&n(!1,"Unexpected increment value: "+s);const r=t.node();if(n(null!=r,"Expected ChildrenNode.EMPTY_NODE for nulls"),!r.isLeafNode())return s;const o=r.getValue();return"number"!=typeof o?s:o+s},pc=function(e,t,n,i){return mc(t,new lc(n,e),i)},gc=function(e,t,n){return mc(e,new hc(t),n)};function mc(e,t,n){const i=e.getPriority().val(),s=uc(i,t.getImmediateChild(".priority"),n);let r;if(e.isLeafNode()){const i=e,r=uc(i.getValue(),t,n);return r!==i.getValue()||s!==i.getPriority().val()?new Hr(r,io(s)):e}{const i=e;return r=i,s!==i.getPriority().val()&&(r=r.updatePriority(new Hr(s))),i.forEachChild(Kr,(e,i)=>{const s=mc(i,t.getImmediateChild(e),n);s!==i&&(r=r.updateImmediateChild(e,s))}),r}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class _c{constructor(e="",t=null,n={children:{},childCount:0}){this.name=e,this.parent=t,this.node=n}}function yc(e,t){let n=t instanceof lr?t:new lr(t),i=e,s=dr(n);for(;null!==s;){const e=D(i.node.children,s)||{children:{},childCount:0};i=new _c(s,i,e),n=pr(n),s=dr(n)}return i}function vc(e){return e.node.value}function wc(e,t){e.node.value=t,Ec(e)}function Tc(e){return e.node.childCount>0}function Ic(e,t){Os(e.node.children,(n,i)=>{t(new _c(n,e,i))})}function bc(e,t,n,i){n&&t(e),Ic(e,e=>{bc(e,t,!0)})}function Cc(e){return new lr(null===e.parent?e.name:Cc(e.parent)+"/"+e.name)}function Ec(e){null!==e.parent&&function(e,t,n){const i=function(e){return void 0===vc(e)&&!Tc(e)}(n),s=P(e.node.children,t);i&&s?(delete e.node.children[t],e.node.childCount--,Ec(e)):i||s||(e.node.children[t]=n.node,e.node.childCount++,Ec(e))}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */(e.parent,e.name,e)}const Sc=/[\[\].#$\/\u0000-\u001F\u007F]/,kc=/[\[\].#$\u0000-\u001F\u007F]/,Nc=10485760,Ac=function(e){return"string"==typeof e&&0!==e.length&&!Sc.test(e)},Rc=function(e){return"string"==typeof e&&0!==e.length&&!kc.test(e)},Pc=function(e){return null===e||"string"==typeof e||"number"==typeof e&&!Ss(e)||e&&"object"==typeof e&&P(e,".sv")},Dc=function(e,t,n,i){i&&void 0===t||xc(j(e,"value"),t,n)},xc=function(e,t,n){const i=n instanceof lr?new Cr(n,e):n;if(void 0===t)throw new Error(e+"contains undefined "+Sr(i));if("function"==typeof t)throw new Error(e+"contains a function "+Sr(i)+" with contents = "+t.toString());if(Ss(t))throw new Error(e+"contains "+t.toString()+" "+Sr(i));if("string"==typeof t&&t.length>Nc/3&&B(t)>Nc)throw new Error(e+"contains a string greater than "+Nc+" utf8 bytes "+Sr(i)+" ('"+t.substring(0,50)+"...')");if(t&&"object"==typeof t){let n=!1,s=!1;if(Os(t,(t,r)=>{if(".value"===t)n=!0;else if(".priority"!==t&&".sv"!==t&&(s=!0,!Ac(t)))throw new Error(e+" contains an invalid key ("+t+") "+Sr(i)+'.  Keys must be non-empty strings and can\'t contain ".", "#", "$", "/", "[", or "]"');var o,a;a=t,(o=i).parts_.length>0&&(o.byteLength_+=1),o.parts_.push(a),o.byteLength_+=B(a),Er(o),xc(e,r,i),function(e){const t=e.parts_.pop();e.byteLength_-=B(t),e.parts_.length>0&&(e.byteLength_-=1)}(i)}),n&&s)throw new Error(e+' contains ".value" child '+Sr(i)+" in addition to actual children.")}},Oc=function(e,t,n,i){const s=j(e,"values");if(!t||"object"!=typeof t||Array.isArray(t))throw new Error(s+" must be an object containing the children to replace.");const r=[];Os(t,(e,t)=>{const i=new lr(e);if(xc(s,t,yr(n,i)),".priority"===gr(i)&&!Pc(t))throw new Error(s+"contains an invalid value for '"+i.toString()+"', which must be a valid Firebase priority (a string, finite number, server value, or null).");r.push(i)}),function(e,t){let n,i;for(n=0;n<t.length;n++){i=t[n];const s=mr(i);for(let t=0;t<s.length;t++)if(".priority"===s[t]&&t===s.length-1);else if(!Ac(s[t]))throw new Error(e+"contains an invalid key ("+s[t]+") in path "+i.toString()+'. Keys must be non-empty strings and can\'t contain ".", "#", "$", "/", "[", or "]"')}t.sort(Tr);let s=null;for(n=0;n<t.length;n++){if(i=t[n],null!==s&&br(s,i))throw new Error(e+"contains a path "+s.toString()+" that is ancestor of another path "+i.toString());s=i}}(s,r)},Lc=function(e,t,n,i){if(!Rc(n))throw new Error(j(e,t)+'was an invalid path = "'+n+'". Paths must be non-empty strings and can\'t contain ".", "#", "$", "[", or "]"')},Mc=function(e,t){if(".info"===dr(t))throw new Error(e+" failed = Can't modify data under /.info/")},Fc=function(e,t){const n=t.path.toString();if("string"!=typeof t.repoInfo.host||0===t.repoInfo.host.length||!Ac(t.repoInfo.namespace)&&"localhost"!==t.repoInfo.host.split(":")[0]||0!==n.length&&!function(e){return e&&(e=e.replace(/^\/*\.info(\/|$)/,"/")),Rc(e)}(n))throw new Error(j(e,"url")+'must be a valid firebase URL and the path can\'t contain ".", "#", "$", "[", or "]".')};
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
class Uc{constructor(){this.eventLists_=[],this.recursionDepth_=0}}function Vc(e,t){let n=null;for(let i=0;i<t.length;i++){const s=t[i],r=s.getPath();null===n||Ir(r,n.path)||(e.eventLists_.push(n),n=null),null===n&&(n={events:[],path:r}),n.events.push(s)}n&&e.eventLists_.push(n)}function qc(e,t,n){Vc(e,n),Bc(e,e=>Ir(e,t))}function jc(e,t,n){Vc(e,n),Bc(e,e=>br(e,t)||br(t,e))}function Bc(e,t){e.recursionDepth_++;let n=!0;for(let i=0;i<e.eventLists_.length;i++){const s=e.eventLists_[i];if(s){t(s.path)?(zc(e.eventLists_[i]),e.eventLists_[i]=null):n=!1}}n&&(e.eventLists_=[]),e.recursionDepth_--}function zc(e){for(let t=0;t<e.events.length;t++){const n=e.events[t];if(null!==n){e.events[t]=null;const i=n.getEventRunner();vs&&Ts("event: "+n.toString()),Us(i)}}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class $c{constructor(e,t,n,i){this.repoInfo_=e,this.forceRestClient_=t,this.authTokenProvider_=n,this.appCheckProvider_=i,this.dataUpdateCount=0,this.statsListener_=null,this.eventQueue_=new Uc,this.nextWriteId_=1,this.interceptServerDataCallback_=null,this.onDisconnect_=vo(),this.transactionQueueTree_=new _c,this.persistentConnection_=null,this.key=this.repoInfo_.toURLString()}toString(){return(this.repoInfo_.secure?"https://":"http://")+this.repoInfo_.host}}function Wc(e,t,n){if(e.stats_=Xs(e.repoInfo_),e.forceRestClient_||("object"==typeof window&&window.navigator&&window.navigator.userAgent||"").search(/googlebot|google webmaster tools|bingbot|yahoo! slurp|baiduspider|yandexbot|duckduckbot/i)>=0)e.server_=new _o(e.repoInfo_,(t,n,i,s)=>{Gc(e,t,n,i,s)},e.authTokenProvider_,e.appCheckProvider_),setTimeout(()=>Qc(e,!0),0);else{if(null!=n){if("object"!=typeof n)throw new Error("Only objects are supported for option databaseAuthVariableOverride");try{A(n)}catch(i){throw new Error("Invalid authOverride provided: "+i)}}e.persistentConnection_=new Ar(e.repoInfo_,t,(t,n,i,s)=>{Gc(e,t,n,i,s)},t=>{Qc(e,t)},t=>{!function(e,t){Os(t,(t,n)=>{Yc(e,t,n)})}(e,t)},e.authTokenProvider_,e.appCheckProvider_,n),e.server_=e.persistentConnection_}e.authTokenProvider_.addTokenChangeListener(t=>{e.server_.refreshAuthToken(t)}),e.appCheckProvider_.addTokenChangeListener(t=>{e.server_.refreshAppCheckToken(t.token)}),e.statsReporter_=function(e,t){const n=e.toString();return Js[n]||(Js[n]=t()),Js[n]}(e.repoInfo_,()=>new Co(e.stats_,e.server_)),e.infoData_=new yo,e.infoSyncTree_=new za({startListening:(t,n,i,s)=>{let r=[];const o=e.infoData_.getNode(t._path);return o.isEmpty()||(r=Ka(e.infoSyncTree_,t._path,o),setTimeout(()=>{s("ok")},0)),r},stopListening:()=>{}}),Yc(e,"connected",!1),e.serverSyncTree_=new za({startListening:(t,n,i,s)=>(e.server_.listen(t,i,n,(n,i)=>{const r=s(n,i);jc(e.eventQueue_,t._path,r)}),[]),stopListening:(t,n)=>{e.server_.unlisten(t,n)}})}function Hc(e){const t=e.infoData_.getNode(new lr(".info/serverTimeOffset")).val()||0;return(new Date).getTime()+t}function Kc(e){return(t=(t={timestamp:Hc(e)})||{}).timestamp=t.timestamp||(new Date).getTime(),t;var t}function Gc(e,t,n,i,s){e.dataUpdateCount++;const r=new lr(t);n=e.interceptServerDataCallback_?e.interceptServerDataCallback_(t,n):n;let o=[];if(s)if(i){const t=O(n,e=>io(e));o=function(e,t,n,i){const s=rc(e,i);if(s){const i=oc(s),r=i.path,o=i.queryId,a=wr(r,t),c=jo.fromObject(n);return ac(e,r,new Po(ko(o),a,c))}return[]}(e.serverSyncTree_,r,t,s)}else{const t=io(n);o=Qa(e.serverSyncTree_,r,t,s)}else if(i){const t=O(n,e=>io(e));o=function(e,t,n){const i=jo.fromObject(n);return Za(e,new Po({fromUser:!1,fromServer:!0,queryId:null,tagged:!1},t,i))}(e.serverSyncTree_,r,t)}else{const t=io(n);o=Ka(e.serverSyncTree_,r,t)}let a=r;o.length>0&&(a=rh(e,r)),jc(e.eventQueue_,a,o)}function Qc(e,t){Yc(e,"connected",t),!1===t&&function(e){th(e,"onDisconnectEvents");const t=Kc(e),n=vo();Io(e.onDisconnect_,ur(),(i,s)=>{const r=pc(i,s,e.serverSyncTree_,t);wo(n,i,r)});let i=[];Io(n,ur(),(t,n)=>{i=i.concat(Ka(e.serverSyncTree_,t,n));const s=lh(e,t);rh(e,s)}),e.onDisconnect_=vo(),jc(e.eventQueue_,ur(),i)}(e)}function Yc(e,t,n){const i=new lr("/.info/"+t),s=io(n);e.infoData_.updateSnapshot(i,s);const r=Ka(e.infoSyncTree_,i,s);jc(e.eventQueue_,i,r)}function Jc(e){return e.nextWriteId_++}function Xc(e,t,n){e.server_.onDisconnectCancel(t.toString(),(i,s)=>{"ok"===i&&To(e.onDisconnect_,t),nh(e,n,i,s)})}function Zc(e,t,n,i){const s=io(n);e.server_.onDisconnectPut(t.toString(),s.val(!0),(n,r)=>{"ok"===n&&wo(e.onDisconnect_,t,s),nh(e,i,n,r)})}function eh(e,t,n){let i;i=".info"===dr(t._path)?Ga(e.infoSyncTree_,t,n):Ga(e.serverSyncTree_,t,n),qc(e.eventQueue_,t._path,i)}function th(e,...t){let n="";e.persistentConnection_&&(n=e.persistentConnection_.id+":"),Ts(n,...t)}function nh(e,t,n,i){t&&Us(()=>{if("ok"===n)t(null);else{const e=(n||"error").toUpperCase();let s=e;i&&(s+=": "+i);const r=new Error(s);r.code=e,t(r)}})}function ih(e,t,n){return Ja(e.serverSyncTree_,t,n)||to.EMPTY_NODE}function sh(e,t=e.transactionQueueTree_){if(t||hh(e,t),vc(t)){const i=ah(e,t);n(i.length>0,"Sending zero length transaction queue");i.every(e=>0===e.status)&&function(e,t,i){const s=i.map(e=>e.currentWriteId),r=ih(e,t,s);let o=r;const a=r.hash();for(let l=0;l<i.length;l++){const e=i[l];n(0===e.status,"tryToSendTransactionQueue_: items in queue should all be run."),e.status=1,e.retryCount++;const s=wr(t,e.path);o=o.updateChild(s,e.currentOutputSnapshotRaw)}const c=o.val(!0),h=t;e.server_.put(h.toString(),c,n=>{th(e,"transaction put response",{path:h.toString(),status:n});let s=[];if("ok"===n){const n=[];for(let t=0;t<i.length;t++)i[t].status=2,s=s.concat(Ha(e.serverSyncTree_,i[t].currentWriteId)),i[t].onComplete&&n.push(()=>i[t].onComplete(null,!0,i[t].currentOutputSnapshotResolved)),i[t].unwatcher();hh(e,yc(e.transactionQueueTree_,t)),sh(e,e.transactionQueueTree_),jc(e.eventQueue_,t,s);for(let e=0;e<n.length;e++)Us(n[e])}else{if("datastale"===n)for(let e=0;e<i.length;e++)3===i[e].status?i[e].status=4:i[e].status=0;else{Es("transaction at "+h.toString()+" failed: "+n);for(let e=0;e<i.length;e++)i[e].status=4,i[e].abortReason=n}rh(e,t)}},a)}(e,Cc(t),i)}else Tc(t)&&Ic(t,t=>{sh(e,t)})}function rh(e,t){const i=oh(e,t),s=Cc(i);return function(e,t,i){if(0===t.length)return;const s=[];let r=[];const o=t.filter(e=>0===e.status),a=o.map(e=>e.currentWriteId);for(let c=0;c<t.length;c++){const o=t[c],h=wr(i,o.path);let l,u=!1;if(n(null!==h,"rerunTransactionsUnderNode_: relativePath should not be null."),4===o.status)u=!0,l=o.abortReason,r=r.concat(Ha(e.serverSyncTree_,o.currentWriteId,!0));else if(0===o.status)if(o.retryCount>=25)u=!0,l="maxretry",r=r.concat(Ha(e.serverSyncTree_,o.currentWriteId,!0));else{const n=ih(e,o.path,a);o.currentInputSnapshot=n;const i=t[c].update(n.val());if(void 0!==i){xc("transaction failed: Data returned ",i,o.path);let t=io(i);"object"==typeof i&&null!=i&&P(i,".priority")||(t=t.updatePriority(n.getPriority()));const s=o.currentWriteId,c=Kc(e),h=gc(t,n,c);o.currentOutputSnapshotRaw=t,o.currentOutputSnapshotResolved=h,o.currentWriteId=Jc(e),a.splice(a.indexOf(s),1),r=r.concat($a(e.serverSyncTree_,o.path,h,o.currentWriteId,o.applyLocally)),r=r.concat(Ha(e.serverSyncTree_,s,!0))}else u=!0,l="nodata",r=r.concat(Ha(e.serverSyncTree_,o.currentWriteId,!0))}jc(e.eventQueue_,i,r),r=[],u&&(t[c].status=2,function(e){setTimeout(e,Math.floor(0))}(t[c].unwatcher),t[c].onComplete&&("nodata"===l?s.push(()=>t[c].onComplete(null,!1,t[c].currentInputSnapshot)):s.push(()=>t[c].onComplete(new Error(l),!1,null))))}hh(e,e.transactionQueueTree_);for(let n=0;n<s.length;n++)Us(s[n]);sh(e,e.transactionQueueTree_)}(e,ah(e,i),s),s}function oh(e,t){let n,i=e.transactionQueueTree_;for(n=dr(t);null!==n&&void 0===vc(i);)i=yc(i,n),n=dr(t=pr(t));return i}function ah(e,t){const n=[];return ch(e,t,n),n.sort((e,t)=>e.order-t.order),n}function ch(e,t,n){const i=vc(t);if(i)for(let s=0;s<i.length;s++)n.push(i[s]);Ic(t,t=>{ch(e,t,n)})}function hh(e,t){const n=vc(t);if(n){let e=0;for(let t=0;t<n.length;t++)2!==n[t].status&&(n[e]=n[t],e++);n.length=e,wc(t,n.length>0?n:void 0)}Ic(t,t=>{hh(e,t)})}function lh(e,t){const n=Cc(oh(e,t)),i=yc(e.transactionQueueTree_,t);return function(e,t){let n=e.parent;for(;null!==n;){if(t(n))return!0;n=n.parent}}(i,t=>{uh(e,t)}),uh(e,i),bc(i,t=>{uh(e,t)}),n}function uh(e,t){const i=vc(t);if(i){const s=[];let r=[],o=-1;for(let t=0;t<i.length;t++)3===i[t].status||(1===i[t].status?(n(o===t-1,"All SENT items should be at beginning of queue."),o=t,i[t].status=3,i[t].abortReason="set"):(n(0===i[t].status,"Unexpected transaction status in abort"),i[t].unwatcher(),r=r.concat(Ha(e.serverSyncTree_,i[t].currentWriteId,!0)),i[t].onComplete&&s.push(i[t].onComplete.bind(null,new Error("set"),!1,null))));-1===o?wc(t,void 0):i.length=o+1,jc(e.eventQueue_,Cc(t),r);for(let e=0;e<s.length;e++)Us(s[e])}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */const dh=function(e,t){const n=fh(e),i=n.namespace;"firebase.com"===n.domain&&Cs(n.host+" is no longer supported. Please use <YOUR FIREBASE>.firebaseio.com instead"),i&&"undefined"!==i||"localhost"===n.domain||Cs("Cannot parse Firebase url. Please use https://<YOUR FIREBASE>.firebaseio.com"),n.secure||"undefined"!=typeof window&&window.location&&window.location.protocol&&-1!==window.location.protocol.indexOf("https:")&&Es("Insecure Firebase access from a secure page. Please use https in calls to new Firebase().");const s="ws"===n.scheme||"wss"===n.scheme;return{repoInfo:new Ks(n.host,n.secure,i,s,t,"",i!==n.subdomain),path:new lr(n.pathString)}},fh=function(e){let t="",n="",i="",s="",r="",o=!0,a="https",c=443;if("string"==typeof e){let h=e.indexOf("//");h>=0&&(a=e.substring(0,h-1),e=e.substring(h+2));let l=e.indexOf("/");-1===l&&(l=e.length);let u=e.indexOf("?");-1===u&&(u=e.length),t=e.substring(0,Math.min(l,u)),l<u&&(s=function(e){let t="";const n=e.split("/");for(let s=0;s<n.length;s++)if(n[s].length>0){let e=n[s];try{e=decodeURIComponent(e.replace(/\+/g," "))}catch(i){}t+="/"+e}return t}(e.substring(l,u)));const d=function(e){const t={};"?"===e.charAt(0)&&(e=e.substring(1));for(const n of e.split("&")){if(0===n.length)continue;const i=n.split("=");2===i.length?t[decodeURIComponent(i[0])]=decodeURIComponent(i[1]):Es(`Invalid query segment '${n}' in query '${e}'`)}return t}(e.substring(Math.min(e.length,u)));h=t.indexOf(":"),h>=0?(o="https"===a||"wss"===a,c=parseInt(t.substring(h+1),10)):h=t.length;const f=t.slice(0,h);if("localhost"===f.toLowerCase())n="localhost";else if(f.split(".").length<=2)n=f;else{const e=t.indexOf(".");i=t.substring(0,e).toLowerCase(),n=t.substring(e+1),r=i}"ns"in d&&(r=d.ns)}return{host:t,port:c,domain:n,subdomain:i,secure:o,scheme:a,pathString:s,namespace:r}},ph="-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz",gh=function(){let e=0;const t=[];return function(i){const s=i===e;let r;e=i;const o=new Array(8);for(r=7;r>=0;r--)o[r]=ph.charAt(i%64),i=Math.floor(i/64);n(0===i,"Cannot push at time == 0");let a=o.join("");if(s){for(r=11;r>=0&&63===t[r];r--)t[r]=0;t[r]++}else for(r=0;r<12;r++)t[r]=Math.floor(64*Math.random());for(r=0;r<12;r++)a+=ph.charAt(t[r]);return n(20===a.length,"nextPushId: Length should be 20."),a}}();
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
class mh{constructor(e,t,n,i){this.eventType=e,this.eventRegistration=t,this.snapshot=n,this.prevName=i}getPath(){const e=this.snapshot.ref;return"value"===this.eventType?e._path:e.parent._path}getEventType(){return this.eventType}getEventRunner(){return this.eventRegistration.getEventRunner(this)}toString(){return this.getPath().toString()+":"+this.eventType+":"+A(this.snapshot.exportVal())}}class _h{constructor(e,t,n){this.eventRegistration=e,this.error=t,this.path=n}getPath(){return this.path}getEventType(){return"cancel"}getEventRunner(){return this.eventRegistration.getEventRunner(this)}toString(){return this.path.toString()+":cancel"}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class yh{constructor(e,t){this.snapshotCallback=e,this.cancelCallback=t}onValue(e,t){this.snapshotCallback.call(null,e,t)}onCancel(e){return n(this.hasCancelCallback,"Raising a cancel event on a listener with no cancel callback"),this.cancelCallback.call(null,e)}get hasCancelCallback(){return!!this.cancelCallback}matches(e){return this.snapshotCallback===e.snapshotCallback||void 0!==this.snapshotCallback.userCallback&&this.snapshotCallback.userCallback===e.snapshotCallback.userCallback&&this.snapshotCallback.context===e.snapshotCallback.context}}
/**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class vh{constructor(e,t){this._repo=e,this._path=t}cancel(){const e=new v;return Xc(this._repo,this._path,e.wrapCallback(()=>{})),e.promise}remove(){Mc("OnDisconnect.remove",this._path);const e=new v;return Zc(this._repo,this._path,null,e.wrapCallback(()=>{})),e.promise}set(e){Mc("OnDisconnect.set",this._path),Dc("OnDisconnect.set",e,this._path,!1);const t=new v;return Zc(this._repo,this._path,e,t.wrapCallback(()=>{})),t.promise}setWithPriority(e,t){Mc("OnDisconnect.setWithPriority",this._path),Dc("OnDisconnect.setWithPriority",e,this._path,!1),function(e,t){if(Ss(t))throw new Error(j(e,"priority")+"is "+t.toString()+", but must be a valid Firebase priority (a string, finite number, server value, or null).");if(!Pc(t))throw new Error(j(e,"priority")+"must be a valid Firebase priority (a string, finite number, server value, or null).")}("OnDisconnect.setWithPriority",t);const n=new v;return function(e,t,n,i,s){const r=io(n,i);e.server_.onDisconnectPut(t.toString(),r.val(!0),(n,i)=>{"ok"===n&&wo(e.onDisconnect_,t,r),nh(0,s,n,i)})}(this._repo,this._path,e,t,n.wrapCallback(()=>{})),n.promise}update(e){Mc("OnDisconnect.update",this._path),Oc("OnDisconnect.update",e,this._path);const t=new v;return function(e,t,n,i){if(x(n))return Ts("onDisconnect().update() called with empty data.  Don't do anything."),void nh(0,i,"ok",void 0);e.server_.onDisconnectMerge(t.toString(),n,(s,r)=>{"ok"===s&&Os(n,(n,i)=>{const s=io(i);wo(e.onDisconnect_,yr(t,n),s)}),nh(0,i,s,r)})}(this._repo,this._path,e,t.wrapCallback(()=>{})),t.promise}}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class wh{constructor(e,t,n,i){this._repo=e,this._path=t,this._queryParams=n,this._orderByCalled=i}get key(){return vr(this._path)?null:gr(this._path)}get ref(){return new Th(this._repo,this._path)}get _queryIdentifier(){const e=mo(this._queryParams),t=Ds(e);return"{}"===t?"default":t}get _queryObject(){return mo(this._queryParams)}isEqual(e){if(!((e=z(e))instanceof wh))return!1;const t=this._repo===e._repo,n=Ir(this._path,e._path),i=this._queryIdentifier===e._queryIdentifier;return t&&n&&i}toJSON(){return this.toString()}toString(){return this._repo.toString()+function(e){let t="";for(let n=e.pieceNum_;n<e.pieces_.length;n++)""!==e.pieces_[n]&&(t+="/"+encodeURIComponent(String(e.pieces_[n])));return t||"/"}(this._path)}}class Th extends wh{constructor(e,t){super(e,t,new po,!1)}get parent(){const e=_r(this._path);return null===e?null:new Th(this._repo,e)}get root(){let e=this;for(;null!==e.parent;)e=e.parent;return e}}class Ih{constructor(e,t,n){this._node=e,this.ref=t,this._index=n}get priority(){return this._node.getPriority().val()}get key(){return this.ref.key}get size(){return this._node.numChildren()}child(e){const t=new lr(e),n=Ch(this.ref,e);return new Ih(this._node.getChild(t),n,Kr)}exists(){return!this._node.isEmpty()}exportVal(){return this._node.val(!0)}forEach(e){if(this._node.isLeafNode())return!1;return!!this._node.forEachChild(this._index,(t,n)=>e(new Ih(n,Ch(this.ref,t),Kr)))}hasChild(e){const t=new lr(e);return!this._node.getChild(t).isEmpty()}hasChildren(){return!this._node.isLeafNode()&&!this._node.isEmpty()}toJSON(){return this.exportVal()}val(){return this._node.val()}}function bh(e,t){return(e=z(e))._checkNotDeleted("ref"),void 0!==t?Ch(e._root,t):e._root}function Ch(e,t){var n,i,s;return null===dr((e=z(e))._path)?(n="child",i="path",(s=t)&&(s=s.replace(/^\/*\.info(\/|$)/,"/")),Lc(n,i,s)):Lc("child","path",t),new Th(e._repo,yr(e._path,t))}function Eh(e,t){e=z(e),Mc("set",e._path),Dc("set",t,e._path,!1);const n=new v;return function(e,t,n,i,s){th(e,"set",{path:t.toString(),value:n,priority:i});const r=Kc(e),o=io(n,i),a=Ja(e.serverSyncTree_,t),c=gc(o,a,r),h=Jc(e),l=$a(e.serverSyncTree_,t,c,h,!0);Vc(e.eventQueue_,l),e.server_.put(t.toString(),o.val(!0),(n,i)=>{const r="ok"===n;r||Es("set at "+t+" failed: "+n);const o=Ha(e.serverSyncTree_,h,!r);jc(e.eventQueue_,t,o),nh(0,s,n,i)});const u=lh(e,t);rh(e,u),jc(e.eventQueue_,u,[])}(e._repo,e._path,t,null,n.wrapCallback(()=>{})),n.promise}function Sh(e,t){Oc("update",t,e._path);const n=new v;return function(e,t,n,i){th(e,"update",{path:t.toString(),value:n});let s=!0;const r=Kc(e),o={};if(Os(n,(n,i)=>{s=!1,o[n]=pc(yr(t,n),io(i),e.serverSyncTree_,r)}),s)Ts("update() called with empty data.  Don't do anything."),nh(0,i,"ok",void 0);else{const s=Jc(e),r=Wa(e.serverSyncTree_,t,o,s);Vc(e.eventQueue_,r),e.server_.merge(t.toString(),n,(n,r)=>{const o="ok"===n;o||Es("update at "+t+" failed: "+n);const a=Ha(e.serverSyncTree_,s,!o),c=a.length>0?rh(e,t):t;jc(e.eventQueue_,c,a),nh(0,i,n,r)}),Os(n,n=>{const i=lh(e,yr(t,n));rh(e,i)}),jc(e.eventQueue_,t,[])}}(e._repo,e._path,t,n.wrapCallback(()=>{})),n.promise}function kh(e){e=z(e);const t=new yh(()=>{}),n=new Nh(t);return function(e,t,n){const i=Xa(e.serverSyncTree_,t);return null!=i?Promise.resolve(i):e.server_.get(t).then(i=>{const s=io(i).withIndex(t._queryParams.getIndex());let r;if(Ya(e.serverSyncTree_,t,n,!0),t._queryParams.loadsAllData())r=Ka(e.serverSyncTree_,t._path,s);else{const n=ic(e.serverSyncTree_,t);r=Qa(e.serverSyncTree_,t._path,s,n)}return jc(e.eventQueue_,t._path,r),Ga(e.serverSyncTree_,t,n,null,!0),s},n=>(th(e,"get for query "+A(t)+" failed: "+n),Promise.reject(new Error(n))))}(e._repo,e,n).then(t=>new Ih(t,new Th(e._repo,e._path),e._queryParams.getIndex()))}class Nh{constructor(e){this.callbackContext=e}respondsTo(e){return"value"===e}createEvent(e,t){const n=t._queryParams.getIndex();return new mh("value",this,new Ih(e.snapshotNode,new Th(t._repo,t._path),n))}getEventRunner(e){return"cancel"===e.getEventType()?()=>this.callbackContext.onCancel(e.error):()=>this.callbackContext.onValue(e.snapshot,null)}createCancelEvent(e,t){return this.callbackContext.hasCancelCallback?new _h(this,e,t):null}matches(e){return e instanceof Nh&&(!e.callbackContext||!this.callbackContext||e.callbackContext.matches(this.callbackContext))}hasAnyCallback(){return null!==this.callbackContext}}class Ah{constructor(e,t){this.eventType=e,this.callbackContext=t}respondsTo(e){let t="children_added"===e?"child_added":e;return t="children_removed"===t?"child_removed":t,this.eventType===t}createCancelEvent(e,t){return this.callbackContext.hasCancelCallback?new _h(this,e,t):null}createEvent(e,t){n(null!=e.childName,"Child events should have a childName.");const i=Ch(new Th(t._repo,t._path),e.childName),s=t._queryParams.getIndex();return new mh(e.type,this,new Ih(e.snapshotNode,i,s),e.prevName)}getEventRunner(e){return"cancel"===e.getEventType()?()=>this.callbackContext.onCancel(e.error):()=>this.callbackContext.onValue(e.snapshot,e.prevName)}matches(e){return e instanceof Ah&&(this.eventType===e.eventType&&(!this.callbackContext||!e.callbackContext||this.callbackContext.matches(e.callbackContext)))}hasAnyCallback(){return!!this.callbackContext}}function Rh(e,t,n,i,s){const r=new yh(n,void 0),o="value"===t?new Nh(r):new Ah(t,r);return function(e,t,n){let i;i=".info"===dr(t._path)?Ya(e.infoSyncTree_,t,n):Ya(e.serverSyncTree_,t,n),qc(e.eventQueue_,t._path,i)}(e._repo,e,o),()=>eh(e._repo,e,o)}!function(e){n(!Aa,"__referenceConstructor has already been defined"),Aa=e}(Th),function(e){n(!Ra,"__referenceConstructor has already been defined"),Ra=e}(Th);
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
const Ph={};let Dh=!1;function xh(e,t,n,i,s){let r=i||e.options.databaseURL;void 0===r&&(e.options.projectId||Cs("Can't determine Firebase Database URL. Be sure to include  a Project ID when calling firebase.initializeApp()."),Ts("Using default host for project ",e.options.projectId),r=`${e.options.projectId}-default-rtdb.firebaseio.com`);let o,a=dh(r,s),c=a.repoInfo;"undefined"!=typeof process&&os&&(o=os.FIREBASE_DATABASE_EMULATOR_HOST),o?(r=`http://${o}?ns=${c.namespace}`,a=dh(r,s),c=a.repoInfo):a.repoInfo.secure;const h=new js(e.name,e.options,t);Fc("Invalid Firebase Database URL",a),vr(a.path)||Cs("Database URL must point to the root of a Firebase Database (not including a child path).");const l=function(e,t,n,i){let s=Ph[t.name];s||(s={},Ph[t.name]=s);let r=s[e.toURLString()];r&&Cs("Database initialized multiple times. Please make sure the format of the database URL matches with each database() call.");return r=new $c(e,Dh,n,i),s[e.toURLString()]=r,r}(c,e,h,new qs(e.name,n));return new Oh(l,e)}class Oh{constructor(e,t){this._repoInternal=e,this.app=t,this.type="database",this._instanceStarted=!1}get _repo(){return this._instanceStarted||(Wc(this._repoInternal,this.app.options.appId,this.app.options.databaseAuthVariableOverride),this._instanceStarted=!0),this._repoInternal}get _root(){return this._rootInternal||(this._rootInternal=new Th(this._repo,ur())),this._rootInternal}_delete(){return null!==this._rootInternal&&(!function(e,t){const n=Ph[t];n&&n[e.key]===e||Cs(`Database ${t}(${e.repoInfo_}) has already been deleted.`),function(e){e.persistentConnection_&&e.persistentConnection_.interrupt("repo_interrupt")}(e),delete n[e.key]}(this._repo,this.app.name),this._repoInternal=null,this._rootInternal=null),Promise.resolve()}_checkNotDeleted(e){null===this._rootInternal&&Cs("Cannot call "+e+" on a deleted database.")}}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
const Lh={".sv":"timestamp"};Ar.prototype.simpleListen=function(e,t){this.sendRequest("q",{p:e},t)},Ar.prototype.echo=function(e,t){this.sendRequest("echo",{d:e},t)},
/**
   * @license
   * Copyright 2021 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
function(e){hs=st,Ze(new $("database",(e,{instanceIdentifier:t})=>xh(e.getProvider("app").getImmediate(),e.getProvider("auth-internal"),e.getProvider("app-check-internal"),t),"PUBLIC").setMultipleInstances(!0)),at(as,cs,e),at(as,cs,"esm2017")}();var Mh,Fh,Uh="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};
/** @license
  Copyright The Closure Library Authors.
  SPDX-License-Identifier: Apache-2.0
  */(function(){var e;
/** @license
    
         Copyright The Closure Library Authors.
         SPDX-License-Identifier: Apache-2.0
        */function t(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}function n(e,t,n){n||(n=0);var i=Array(16);if("string"==typeof t)for(var s=0;16>s;++s)i[s]=t.charCodeAt(n++)|t.charCodeAt(n++)<<8|t.charCodeAt(n++)<<16|t.charCodeAt(n++)<<24;else for(s=0;16>s;++s)i[s]=t[n++]|t[n++]<<8|t[n++]<<16|t[n++]<<24;t=e.g[0],n=e.g[1],s=e.g[2];var r=e.g[3],o=t+(r^n&(s^r))+i[0]+3614090360&4294967295;o=(n=(s=(r=(t=(n=(s=(r=(t=(n=(s=(r=(t=(n=(s=(r=(t=(n=(s=(r=(t=(n=(s=(r=(t=(n=(s=(r=(t=(n=(s=(r=(t=(n=(s=(r=(t=(n=(s=(r=(t=(n=(s=(r=(t=(n=(s=(r=(t=(n=(s=(r=(t=(n=(s=(r=(t=(n=(s=(r=(t=n+(o<<7&4294967295|o>>>25))+((o=r+(s^t&(n^s))+i[1]+3905402710&4294967295)<<12&4294967295|o>>>20))+((o=s+(n^r&(t^n))+i[2]+606105819&4294967295)<<17&4294967295|o>>>15))+((o=n+(t^s&(r^t))+i[3]+3250441966&4294967295)<<22&4294967295|o>>>10))+((o=t+(r^n&(s^r))+i[4]+4118548399&4294967295)<<7&4294967295|o>>>25))+((o=r+(s^t&(n^s))+i[5]+1200080426&4294967295)<<12&4294967295|o>>>20))+((o=s+(n^r&(t^n))+i[6]+2821735955&4294967295)<<17&4294967295|o>>>15))+((o=n+(t^s&(r^t))+i[7]+4249261313&4294967295)<<22&4294967295|o>>>10))+((o=t+(r^n&(s^r))+i[8]+1770035416&4294967295)<<7&4294967295|o>>>25))+((o=r+(s^t&(n^s))+i[9]+2336552879&4294967295)<<12&4294967295|o>>>20))+((o=s+(n^r&(t^n))+i[10]+4294925233&4294967295)<<17&4294967295|o>>>15))+((o=n+(t^s&(r^t))+i[11]+2304563134&4294967295)<<22&4294967295|o>>>10))+((o=t+(r^n&(s^r))+i[12]+1804603682&4294967295)<<7&4294967295|o>>>25))+((o=r+(s^t&(n^s))+i[13]+4254626195&4294967295)<<12&4294967295|o>>>20))+((o=s+(n^r&(t^n))+i[14]+2792965006&4294967295)<<17&4294967295|o>>>15))+((o=n+(t^s&(r^t))+i[15]+1236535329&4294967295)<<22&4294967295|o>>>10))+((o=t+(s^r&(n^s))+i[1]+4129170786&4294967295)<<5&4294967295|o>>>27))+((o=r+(n^s&(t^n))+i[6]+3225465664&4294967295)<<9&4294967295|o>>>23))+((o=s+(t^n&(r^t))+i[11]+643717713&4294967295)<<14&4294967295|o>>>18))+((o=n+(r^t&(s^r))+i[0]+3921069994&4294967295)<<20&4294967295|o>>>12))+((o=t+(s^r&(n^s))+i[5]+3593408605&4294967295)<<5&4294967295|o>>>27))+((o=r+(n^s&(t^n))+i[10]+38016083&4294967295)<<9&4294967295|o>>>23))+((o=s+(t^n&(r^t))+i[15]+3634488961&4294967295)<<14&4294967295|o>>>18))+((o=n+(r^t&(s^r))+i[4]+3889429448&4294967295)<<20&4294967295|o>>>12))+((o=t+(s^r&(n^s))+i[9]+568446438&4294967295)<<5&4294967295|o>>>27))+((o=r+(n^s&(t^n))+i[14]+3275163606&4294967295)<<9&4294967295|o>>>23))+((o=s+(t^n&(r^t))+i[3]+4107603335&4294967295)<<14&4294967295|o>>>18))+((o=n+(r^t&(s^r))+i[8]+1163531501&4294967295)<<20&4294967295|o>>>12))+((o=t+(s^r&(n^s))+i[13]+2850285829&4294967295)<<5&4294967295|o>>>27))+((o=r+(n^s&(t^n))+i[2]+4243563512&4294967295)<<9&4294967295|o>>>23))+((o=s+(t^n&(r^t))+i[7]+1735328473&4294967295)<<14&4294967295|o>>>18))+((o=n+(r^t&(s^r))+i[12]+2368359562&4294967295)<<20&4294967295|o>>>12))+((o=t+(n^s^r)+i[5]+4294588738&4294967295)<<4&4294967295|o>>>28))+((o=r+(t^n^s)+i[8]+2272392833&4294967295)<<11&4294967295|o>>>21))+((o=s+(r^t^n)+i[11]+1839030562&4294967295)<<16&4294967295|o>>>16))+((o=n+(s^r^t)+i[14]+4259657740&4294967295)<<23&4294967295|o>>>9))+((o=t+(n^s^r)+i[1]+2763975236&4294967295)<<4&4294967295|o>>>28))+((o=r+(t^n^s)+i[4]+1272893353&4294967295)<<11&4294967295|o>>>21))+((o=s+(r^t^n)+i[7]+4139469664&4294967295)<<16&4294967295|o>>>16))+((o=n+(s^r^t)+i[10]+3200236656&4294967295)<<23&4294967295|o>>>9))+((o=t+(n^s^r)+i[13]+681279174&4294967295)<<4&4294967295|o>>>28))+((o=r+(t^n^s)+i[0]+3936430074&4294967295)<<11&4294967295|o>>>21))+((o=s+(r^t^n)+i[3]+3572445317&4294967295)<<16&4294967295|o>>>16))+((o=n+(s^r^t)+i[6]+76029189&4294967295)<<23&4294967295|o>>>9))+((o=t+(n^s^r)+i[9]+3654602809&4294967295)<<4&4294967295|o>>>28))+((o=r+(t^n^s)+i[12]+3873151461&4294967295)<<11&4294967295|o>>>21))+((o=s+(r^t^n)+i[15]+530742520&4294967295)<<16&4294967295|o>>>16))+((o=n+(s^r^t)+i[2]+3299628645&4294967295)<<23&4294967295|o>>>9))+((o=t+(s^(n|~r))+i[0]+4096336452&4294967295)<<6&4294967295|o>>>26))+((o=r+(n^(t|~s))+i[7]+1126891415&4294967295)<<10&4294967295|o>>>22))+((o=s+(t^(r|~n))+i[14]+2878612391&4294967295)<<15&4294967295|o>>>17))+((o=n+(r^(s|~t))+i[5]+4237533241&4294967295)<<21&4294967295|o>>>11))+((o=t+(s^(n|~r))+i[12]+1700485571&4294967295)<<6&4294967295|o>>>26))+((o=r+(n^(t|~s))+i[3]+2399980690&4294967295)<<10&4294967295|o>>>22))+((o=s+(t^(r|~n))+i[10]+4293915773&4294967295)<<15&4294967295|o>>>17))+((o=n+(r^(s|~t))+i[1]+2240044497&4294967295)<<21&4294967295|o>>>11))+((o=t+(s^(n|~r))+i[8]+1873313359&4294967295)<<6&4294967295|o>>>26))+((o=r+(n^(t|~s))+i[15]+4264355552&4294967295)<<10&4294967295|o>>>22))+((o=s+(t^(r|~n))+i[6]+2734768916&4294967295)<<15&4294967295|o>>>17))+((o=n+(r^(s|~t))+i[13]+1309151649&4294967295)<<21&4294967295|o>>>11))+((r=(t=n+((o=t+(s^(n|~r))+i[4]+4149444226&4294967295)<<6&4294967295|o>>>26))+((o=r+(n^(t|~s))+i[11]+3174756917&4294967295)<<10&4294967295|o>>>22))^((s=r+((o=s+(t^(r|~n))+i[2]+718787259&4294967295)<<15&4294967295|o>>>17))|~t))+i[9]+3951481745&4294967295,e.g[0]=e.g[0]+t&4294967295,e.g[1]=e.g[1]+(s+(o<<21&4294967295|o>>>11))&4294967295,e.g[2]=e.g[2]+s&4294967295,e.g[3]=e.g[3]+r&4294967295}function i(e,t){this.h=t;for(var n=[],i=!0,s=e.length-1;0<=s;s--){var r=0|e[s];i&&r==t||(n[s]=r,i=!1)}this.g=n}!function(e,t){function n(){}n.prototype=t.prototype,e.D=t.prototype,e.prototype=new n,e.prototype.constructor=e,e.C=function(e,n,i){for(var s=Array(arguments.length-2),r=2;r<arguments.length;r++)s[r-2]=arguments[r];return t.prototype[n].apply(e,s)}}(t,function(){this.blockSize=-1}),t.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0},t.prototype.u=function(e,t){void 0===t&&(t=e.length);for(var i=t-this.blockSize,s=this.B,r=this.h,o=0;o<t;){if(0==r)for(;o<=i;)n(this,e,o),o+=this.blockSize;if("string"==typeof e){for(;o<t;)if(s[r++]=e.charCodeAt(o++),r==this.blockSize){n(this,s),r=0;break}}else for(;o<t;)if(s[r++]=e[o++],r==this.blockSize){n(this,s),r=0;break}}this.h=r,this.o+=t},t.prototype.v=function(){var e=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);e[0]=128;for(var t=1;t<e.length-8;++t)e[t]=0;var n=8*this.o;for(t=e.length-8;t<e.length;++t)e[t]=255&n,n/=256;for(this.u(e),e=Array(16),t=n=0;4>t;++t)for(var i=0;32>i;i+=8)e[n++]=this.g[t]>>>i&255;return e};var s={};function r(e){return-128<=e&&128>e?function(e,t){var n=s;return Object.prototype.hasOwnProperty.call(n,e)?n[e]:n[e]=t(e)}(e,function(e){return new i([0|e],0>e?-1:0)}):new i([0|e],0>e?-1:0)}function o(e){if(isNaN(e)||!isFinite(e))return a;if(0>e)return d(o(-e));for(var t=[],n=1,s=0;e>=n;s++)t[s]=e/n|0,n*=4294967296;return new i(t,0)}var a=r(0),c=r(1),h=r(16777216);function l(e){if(0!=e.h)return!1;for(var t=0;t<e.g.length;t++)if(0!=e.g[t])return!1;return!0}function u(e){return-1==e.h}function d(e){for(var t=e.g.length,n=[],s=0;s<t;s++)n[s]=~e.g[s];return new i(n,~e.h).add(c)}function f(e,t){return e.add(d(t))}function p(e,t){for(;(65535&e[t])!=e[t];)e[t+1]+=e[t]>>>16,e[t]&=65535,t++}function g(e,t){this.g=e,this.h=t}function m(e,t){if(l(t))throw Error("division by zero");if(l(e))return new g(a,a);if(u(e))return t=m(d(e),t),new g(d(t.g),d(t.h));if(u(t))return t=m(e,d(t)),new g(d(t.g),t.h);if(30<e.g.length){if(u(e)||u(t))throw Error("slowDivide_ only works with positive integers.");for(var n=c,i=t;0>=i.l(e);)n=_(n),i=_(i);var s=y(n,1),r=y(i,1);for(i=y(i,2),n=y(n,2);!l(i);){var h=r.add(i);0>=h.l(e)&&(s=s.add(n),r=h),i=y(i,1),n=y(n,1)}return t=f(e,s.j(t)),new g(s,t)}for(s=a;0<=e.l(t);){for(n=Math.max(1,Math.floor(e.m()/t.m())),i=48>=(i=Math.ceil(Math.log(n)/Math.LN2))?1:Math.pow(2,i-48),h=(r=o(n)).j(t);u(h)||0<h.l(e);)h=(r=o(n-=i)).j(t);l(r)&&(r=c),s=s.add(r),e=f(e,h)}return new g(s,e)}function _(e){for(var t=e.g.length+1,n=[],s=0;s<t;s++)n[s]=e.i(s)<<1|e.i(s-1)>>>31;return new i(n,e.h)}function y(e,t){var n=t>>5;t%=32;for(var s=e.g.length-n,r=[],o=0;o<s;o++)r[o]=0<t?e.i(o+n)>>>t|e.i(o+n+1)<<32-t:e.i(o+n);return new i(r,e.h)}(e=i.prototype).m=function(){if(u(this))return-d(this).m();for(var e=0,t=1,n=0;n<this.g.length;n++){var i=this.i(n);e+=(0<=i?i:4294967296+i)*t,t*=4294967296}return e},e.toString=function(e){if(2>(e=e||10)||36<e)throw Error("radix out of range: "+e);if(l(this))return"0";if(u(this))return"-"+d(this).toString(e);for(var t=o(Math.pow(e,6)),n=this,i="";;){var s=m(n,t).g,r=((0<(n=f(n,s.j(t))).g.length?n.g[0]:n.h)>>>0).toString(e);if(l(n=s))return r+i;for(;6>r.length;)r="0"+r;i=r+i}},e.i=function(e){return 0>e?0:e<this.g.length?this.g[e]:this.h},e.l=function(e){return u(e=f(this,e))?-1:l(e)?0:1},e.abs=function(){return u(this)?d(this):this},e.add=function(e){for(var t=Math.max(this.g.length,e.g.length),n=[],s=0,r=0;r<=t;r++){var o=s+(65535&this.i(r))+(65535&e.i(r)),a=(o>>>16)+(this.i(r)>>>16)+(e.i(r)>>>16);s=a>>>16,o&=65535,a&=65535,n[r]=a<<16|o}return new i(n,-2147483648&n[n.length-1]?-1:0)},e.j=function(e){if(l(this)||l(e))return a;if(u(this))return u(e)?d(this).j(d(e)):d(d(this).j(e));if(u(e))return d(this.j(d(e)));if(0>this.l(h)&&0>e.l(h))return o(this.m()*e.m());for(var t=this.g.length+e.g.length,n=[],s=0;s<2*t;s++)n[s]=0;for(s=0;s<this.g.length;s++)for(var r=0;r<e.g.length;r++){var c=this.i(s)>>>16,f=65535&this.i(s),g=e.i(r)>>>16,m=65535&e.i(r);n[2*s+2*r]+=f*m,p(n,2*s+2*r),n[2*s+2*r+1]+=c*m,p(n,2*s+2*r+1),n[2*s+2*r+1]+=f*g,p(n,2*s+2*r+1),n[2*s+2*r+2]+=c*g,p(n,2*s+2*r+2)}for(s=0;s<t;s++)n[s]=n[2*s+1]<<16|n[2*s];for(s=t;s<2*t;s++)n[s]=0;return new i(n,0)},e.A=function(e){return m(this,e).h},e.and=function(e){for(var t=Math.max(this.g.length,e.g.length),n=[],s=0;s<t;s++)n[s]=this.i(s)&e.i(s);return new i(n,this.h&e.h)},e.or=function(e){for(var t=Math.max(this.g.length,e.g.length),n=[],s=0;s<t;s++)n[s]=this.i(s)|e.i(s);return new i(n,this.h|e.h)},e.xor=function(e){for(var t=Math.max(this.g.length,e.g.length),n=[],s=0;s<t;s++)n[s]=this.i(s)^e.i(s);return new i(n,this.h^e.h)},t.prototype.digest=t.prototype.v,t.prototype.reset=t.prototype.s,t.prototype.update=t.prototype.u,Fh=t,i.prototype.add=i.prototype.add,i.prototype.multiply=i.prototype.j,i.prototype.modulo=i.prototype.A,i.prototype.compare=i.prototype.l,i.prototype.toNumber=i.prototype.m,i.prototype.toString=i.prototype.toString,i.prototype.getBits=i.prototype.i,i.fromNumber=o,i.fromString=function e(t,n){if(0==t.length)throw Error("number format error: empty string");if(2>(n=n||10)||36<n)throw Error("radix out of range: "+n);if("-"==t.charAt(0))return d(e(t.substring(1),n));if(0<=t.indexOf("-"))throw Error('number format error: interior "-" character');for(var i=o(Math.pow(n,8)),s=a,r=0;r<t.length;r+=8){var c=Math.min(8,t.length-r),h=parseInt(t.substring(r,r+c),n);8>c?(c=o(Math.pow(n,c)),s=s.j(c).add(o(h))):s=(s=s.j(i)).add(o(h))}return s},Mh=i}).apply(void 0!==Uh?Uh:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{});var Vh,qh,jh,Bh,zh,$h,Wh,Hh,Kh="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};
/** @license
  Copyright The Closure Library Authors.
  SPDX-License-Identifier: Apache-2.0
  */(function(){var e,t="function"==typeof Object.defineProperties?Object.defineProperty:function(e,t,n){return e==Array.prototype||e==Object.prototype||(e[t]=n.value),e};var n=function(e){e=["object"==typeof globalThis&&globalThis,e,"object"==typeof window&&window,"object"==typeof self&&self,"object"==typeof Kh&&Kh];for(var t=0;t<e.length;++t){var n=e[t];if(n&&n.Math==Math)return n}throw Error("Cannot find global object")}(this);!function(e,i){if(i)e:{var s=n;e=e.split(".");for(var r=0;r<e.length-1;r++){var o=e[r];if(!(o in s))break e;s=s[o]}(i=i(r=s[e=e[e.length-1]]))!=r&&null!=i&&t(s,e,{configurable:!0,writable:!0,value:i})}}("Array.prototype.values",function(e){return e||function(){return function(e,t){e instanceof String&&(e+="");var n=0,i=!1,s={next:function(){if(!i&&n<e.length){var s=n++;return{value:t(s,e[s]),done:!1}}return i=!0,{done:!0,value:void 0}}};return s[Symbol.iterator]=function(){return s},s}(this,function(e,t){return t})}});
/** @license
    
         Copyright The Closure Library Authors.
         SPDX-License-Identifier: Apache-2.0
        */
var i=i||{},s=this||self;function r(e){var t=typeof e;return"array"==(t="object"!=t?t:e?Array.isArray(e)?"array":t:"null")||"object"==t&&"number"==typeof e.length}function o(e){var t=typeof e;return"object"==t&&null!=e||"function"==t}function a(e,t,n){return e.call.apply(e.bind,arguments)}function c(e,t,n){if(!e)throw Error();if(2<arguments.length){var i=Array.prototype.slice.call(arguments,2);return function(){var n=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(n,i),e.apply(t,n)}}return function(){return e.apply(t,arguments)}}function h(e,t,n){return(h=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?a:c).apply(null,arguments)}function l(e,t){var n=Array.prototype.slice.call(arguments,1);return function(){var t=n.slice();return t.push.apply(t,arguments),e.apply(this,t)}}function u(e,t){function n(){}n.prototype=t.prototype,e.aa=t.prototype,e.prototype=new n,e.prototype.constructor=e,e.Qb=function(e,n,i){for(var s=Array(arguments.length-2),r=2;r<arguments.length;r++)s[r-2]=arguments[r];return t.prototype[n].apply(e,s)}}function d(e){const t=e.length;if(0<t){const n=Array(t);for(let i=0;i<t;i++)n[i]=e[i];return n}return[]}function f(e,t){for(let n=1;n<arguments.length;n++){const t=arguments[n];if(r(t)){const n=e.length||0,i=t.length||0;e.length=n+i;for(let s=0;s<i;s++)e[n+s]=t[s]}else e.push(t)}}function p(e){return/^[\s\xa0]*$/.test(e)}function g(){var e=s.navigator;return e&&(e=e.userAgent)?e:""}function m(e){return m[" "](e),e}m[" "]=function(){};var _=!(-1==g().indexOf("Gecko")||-1!=g().toLowerCase().indexOf("webkit")&&-1==g().indexOf("Edge")||-1!=g().indexOf("Trident")||-1!=g().indexOf("MSIE")||-1!=g().indexOf("Edge"));function y(e,t,n){for(const i in e)t.call(n,e[i],i,e)}function v(e){const t={};for(const n in e)t[n]=e[n];return t}const w="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function T(e,t){let n,i;for(let s=1;s<arguments.length;s++){for(n in i=arguments[s],i)e[n]=i[n];for(let t=0;t<w.length;t++)n=w[t],Object.prototype.hasOwnProperty.call(i,n)&&(e[n]=i[n])}}function I(e){var t=1;e=e.split(":");const n=[];for(;0<t&&e.length;)n.push(e.shift()),t--;return e.length&&n.push(e.join(":")),n}function b(e){s.setTimeout(()=>{throw e},0)}function C(){var e=A;let t=null;return e.g&&(t=e.g,e.g=e.g.next,e.g||(e.h=null),t.next=null),t}var E=new class{constructor(e,t){this.i=e,this.j=t,this.h=0,this.g=null}get(){let e;return 0<this.h?(this.h--,e=this.g,this.g=e.next,e.next=null):e=this.i(),e}}(()=>new S,e=>e.reset());class S{constructor(){this.next=this.g=this.h=null}set(e,t){this.h=e,this.g=t,this.next=null}reset(){this.next=this.g=this.h=null}}let k,N=!1,A=new class{constructor(){this.h=this.g=null}add(e,t){const n=E.get();n.set(e,t),this.h?this.h.next=n:this.g=n,this.h=n}},R=()=>{const e=s.Promise.resolve(void 0);k=()=>{e.then(P)}};var P=()=>{for(var e;e=C();){try{e.h.call(e.g)}catch(n){b(n)}var t=E;t.j(e),100>t.h&&(t.h++,e.next=t.g,t.g=e)}N=!1};function D(){this.s=this.s,this.C=this.C}function x(e,t){this.type=e,this.g=this.target=t,this.defaultPrevented=!1}D.prototype.s=!1,D.prototype.ma=function(){this.s||(this.s=!0,this.N())},D.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()},x.prototype.h=function(){this.defaultPrevented=!0};var O=function(){if(!s.addEventListener||!Object.defineProperty)return!1;var e=!1,t=Object.defineProperty({},"passive",{get:function(){e=!0}});try{const e=()=>{};s.addEventListener("test",e,t),s.removeEventListener("test",e,t)}catch(n){}return e}();function L(e,t){if(x.call(this,e?e.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,e){var n=this.type=e.type,i=e.changedTouches&&e.changedTouches.length?e.changedTouches[0]:null;if(this.target=e.target||e.srcElement,this.g=t,t=e.relatedTarget){if(_){e:{try{m(t.nodeName);var s=!0;break e}catch(r){}s=!1}s||(t=null)}}else"mouseover"==n?t=e.fromElement:"mouseout"==n&&(t=e.toElement);this.relatedTarget=t,i?(this.clientX=void 0!==i.clientX?i.clientX:i.pageX,this.clientY=void 0!==i.clientY?i.clientY:i.pageY,this.screenX=i.screenX||0,this.screenY=i.screenY||0):(this.clientX=void 0!==e.clientX?e.clientX:e.pageX,this.clientY=void 0!==e.clientY?e.clientY:e.pageY,this.screenX=e.screenX||0,this.screenY=e.screenY||0),this.button=e.button,this.key=e.key||"",this.ctrlKey=e.ctrlKey,this.altKey=e.altKey,this.shiftKey=e.shiftKey,this.metaKey=e.metaKey,this.pointerId=e.pointerId||0,this.pointerType="string"==typeof e.pointerType?e.pointerType:M[e.pointerType]||"",this.state=e.state,this.i=e,e.defaultPrevented&&L.aa.h.call(this)}}u(L,x);var M={2:"touch",3:"pen",4:"mouse"};L.prototype.h=function(){L.aa.h.call(this);var e=this.i;e.preventDefault?e.preventDefault():e.returnValue=!1};var F="closure_listenable_"+(1e6*Math.random()|0),U=0;function V(e,t,n,i,s){this.listener=e,this.proxy=null,this.src=t,this.type=n,this.capture=!!i,this.ha=s,this.key=++U,this.da=this.fa=!1}function q(e){e.da=!0,e.listener=null,e.proxy=null,e.src=null,e.ha=null}function j(e){this.src=e,this.g={},this.h=0}function B(e,t){var n=t.type;if(n in e.g){var i,s=e.g[n],r=Array.prototype.indexOf.call(s,t,void 0);(i=0<=r)&&Array.prototype.splice.call(s,r,1),i&&(q(t),0==e.g[n].length&&(delete e.g[n],e.h--))}}function z(e,t,n,i){for(var s=0;s<e.length;++s){var r=e[s];if(!r.da&&r.listener==t&&r.capture==!!n&&r.ha==i)return s}return-1}j.prototype.add=function(e,t,n,i,s){var r=e.toString();(e=this.g[r])||(e=this.g[r]=[],this.h++);var o=z(e,t,i,s);return-1<o?(t=e[o],n||(t.fa=!1)):((t=new V(t,this.src,r,!!i,s)).fa=n,e.push(t)),t};var $="closure_lm_"+(1e6*Math.random()|0),W={};function H(e,t,n,i,s){if(Array.isArray(t)){for(var r=0;r<t.length;r++)H(e,t[r],n,i,s);return null}return n=Z(n),e&&e[F]?e.K(t,n,!!o(i)&&!!i.capture,s):function(e,t,n,i,s,r){if(!t)throw Error("Invalid event type");var a=o(s)?!!s.capture:!!s,c=J(e);if(c||(e[$]=c=new j(e)),n=c.add(t,n,i,a,r),n.proxy)return n;if(i=function(){function e(n){return t.call(e.src,e.listener,n)}const t=Y;return e}(),n.proxy=i,i.src=e,i.listener=n,e.addEventListener)O||(s=a),void 0===s&&(s=!1),e.addEventListener(t.toString(),i,s);else if(e.attachEvent)e.attachEvent(Q(t.toString()),i);else{if(!e.addListener||!e.removeListener)throw Error("addEventListener and attachEvent are unavailable.");e.addListener(i)}return n}(e,t,n,!1,i,s)}function K(e,t,n,i,s){if(Array.isArray(t))for(var r=0;r<t.length;r++)K(e,t[r],n,i,s);else i=o(i)?!!i.capture:!!i,n=Z(n),e&&e[F]?(e=e.i,(t=String(t).toString())in e.g&&(-1<(n=z(r=e.g[t],n,i,s))&&(q(r[n]),Array.prototype.splice.call(r,n,1),0==r.length&&(delete e.g[t],e.h--)))):e&&(e=J(e))&&(t=e.g[t.toString()],e=-1,t&&(e=z(t,n,i,s)),(n=-1<e?t[e]:null)&&G(n))}function G(e){if("number"!=typeof e&&e&&!e.da){var t=e.src;if(t&&t[F])B(t.i,e);else{var n=e.type,i=e.proxy;t.removeEventListener?t.removeEventListener(n,i,e.capture):t.detachEvent?t.detachEvent(Q(n),i):t.addListener&&t.removeListener&&t.removeListener(i),(n=J(t))?(B(n,e),0==n.h&&(n.src=null,t[$]=null)):q(e)}}}function Q(e){return e in W?W[e]:W[e]="on"+e}function Y(e,t){if(e.da)e=!0;else{t=new L(t,this);var n=e.listener,i=e.ha||e.src;e.fa&&G(e),e=n.call(i,t)}return e}function J(e){return(e=e[$])instanceof j?e:null}var X="__closure_events_fn_"+(1e9*Math.random()>>>0);function Z(e){return"function"==typeof e?e:(e[X]||(e[X]=function(t){return e.handleEvent(t)}),e[X])}function ee(){D.call(this),this.i=new j(this),this.M=this,this.F=null}function te(e,t){var n,i=e.F;if(i)for(n=[];i;i=i.F)n.push(i);if(e=e.M,i=t.type||t,"string"==typeof t)t=new x(t,e);else if(t instanceof x)t.target=t.target||e;else{var s=t;T(t=new x(i,e),s)}if(s=!0,n)for(var r=n.length-1;0<=r;r--){var o=t.g=n[r];s=ne(o,i,!0,t)&&s}if(s=ne(o=t.g=e,i,!0,t)&&s,s=ne(o,i,!1,t)&&s,n)for(r=0;r<n.length;r++)s=ne(o=t.g=n[r],i,!1,t)&&s}function ne(e,t,n,i){if(!(t=e.i.g[String(t)]))return!0;t=t.concat();for(var s=!0,r=0;r<t.length;++r){var o=t[r];if(o&&!o.da&&o.capture==n){var a=o.listener,c=o.ha||o.src;o.fa&&B(e.i,o),s=!1!==a.call(c,i)&&s}}return s&&!i.defaultPrevented}function ie(e,t,n){if("function"==typeof e)n&&(e=h(e,n));else{if(!e||"function"!=typeof e.handleEvent)throw Error("Invalid listener argument");e=h(e.handleEvent,e)}return 2147483647<Number(t)?-1:s.setTimeout(e,t||0)}function se(e){e.g=ie(()=>{e.g=null,e.i&&(e.i=!1,se(e))},e.l);const t=e.h;e.h=null,e.m.apply(null,t)}u(ee,D),ee.prototype[F]=!0,ee.prototype.removeEventListener=function(e,t,n,i){K(this,e,t,n,i)},ee.prototype.N=function(){if(ee.aa.N.call(this),this.i){var e,t=this.i;for(e in t.g){for(var n=t.g[e],i=0;i<n.length;i++)q(n[i]);delete t.g[e],t.h--}}this.F=null},ee.prototype.K=function(e,t,n,i){return this.i.add(String(e),t,!1,n,i)},ee.prototype.L=function(e,t,n,i){return this.i.add(String(e),t,!0,n,i)};class re extends D{constructor(e,t){super(),this.m=e,this.l=t,this.h=null,this.i=!1,this.g=null}j(e){this.h=arguments,this.g?this.i=!0:se(this)}N(){super.N(),this.g&&(s.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function oe(e){D.call(this),this.h=e,this.g={}}u(oe,D);var ae=[];function ce(e){y(e.g,function(e,t){this.g.hasOwnProperty(t)&&G(e)},e),e.g={}}oe.prototype.N=function(){oe.aa.N.call(this),ce(this)},oe.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var he=s.JSON.stringify,le=s.JSON.parse,ue=class{stringify(e){return s.JSON.stringify(e,void 0)}parse(e){return s.JSON.parse(e,void 0)}};function de(){}function fe(e){return e.h||(e.h=e.i())}function pe(){}de.prototype.h=null;var ge={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function me(){x.call(this,"d")}function _e(){x.call(this,"c")}u(me,x),u(_e,x);var ye={},ve=null;function we(){return ve=ve||new ee}function Te(e){x.call(this,ye.La,e)}function Ie(e){const t=we();te(t,new Te(t))}function be(e,t){x.call(this,ye.STAT_EVENT,e),this.stat=t}function Ce(e){const t=we();te(t,new be(t,e))}function Ee(e,t){x.call(this,ye.Ma,e),this.size=t}function Se(e,t){if("function"!=typeof e)throw Error("Fn must not be null and must be a function");return s.setTimeout(function(){e()},t)}function ke(){this.g=!0}function Ne(e,t,n,i){e.info(function(){return"XMLHTTP TEXT ("+t+"): "+function(e,t){if(!e.g)return t;if(!t)return null;try{var n=JSON.parse(t);if(n)for(e=0;e<n.length;e++)if(Array.isArray(n[e])){var i=n[e];if(!(2>i.length)){var s=i[1];if(Array.isArray(s)&&!(1>s.length)){var r=s[0];if("noop"!=r&&"stop"!=r&&"close"!=r)for(var o=1;o<s.length;o++)s[o]=""}}}return he(n)}catch(a){return t}}(e,n)+(i?" "+i:"")})}ye.La="serverreachability",u(Te,x),ye.STAT_EVENT="statevent",u(be,x),ye.Ma="timingevent",u(Ee,x),ke.prototype.xa=function(){this.g=!1},ke.prototype.info=function(){};var Ae,Re={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},Pe={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"};function De(){}function xe(e,t,n,i){this.j=e,this.i=t,this.l=n,this.R=i||1,this.U=new oe(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new Oe}function Oe(){this.i=null,this.g="",this.h=!1}u(De,de),De.prototype.g=function(){return new XMLHttpRequest},De.prototype.i=function(){return{}},Ae=new De;var Le={},Me={};function Fe(e,t,n){e.L=1,e.v=ht(st(t)),e.m=n,e.P=!0,Ue(e,null)}function Ue(e,t){e.F=Date.now(),je(e),e.A=st(e.v);var n=e.A,i=e.R;Array.isArray(i)||(i=[String(i)]),It(n.i,"t",i),e.C=0,n=e.j.J,e.h=new Oe,e.g=ln(e.j,n?t:null,!e.m),0<e.O&&(e.M=new re(h(e.Y,e,e.g),e.O)),t=e.U,n=e.g,i=e.ca;var s="readystatechange";Array.isArray(s)||(s&&(ae[0]=s.toString()),s=ae);for(var r=0;r<s.length;r++){var o=H(n,s[r],i||t.handleEvent,!1,t.h||t);if(!o)break;t.g[o.key]=o}t=e.H?v(e.H):{},e.m?(e.u||(e.u="POST"),t["Content-Type"]="application/x-www-form-urlencoded",e.g.ea(e.A,e.u,e.m,t)):(e.u="GET",e.g.ea(e.A,e.u,null,t)),Ie(),function(e,t,n,i,s,r){e.info(function(){if(e.g)if(r)for(var o="",a=r.split("&"),c=0;c<a.length;c++){var h=a[c].split("=");if(1<h.length){var l=h[0];h=h[1];var u=l.split("_");o=2<=u.length&&"type"==u[1]?o+(l+"=")+h+"&":o+(l+"=redacted&")}}else o=null;else o=r;return"XMLHTTP REQ ("+i+") [attempt "+s+"]: "+t+"\n"+n+"\n"+o})}(e.i,e.u,e.A,e.l,e.R,e.m)}function Ve(e){return!!e.g&&("GET"==e.u&&2!=e.L&&e.j.Ca)}function qe(e,t){var n=e.C,i=t.indexOf("\n",n);return-1==i?Me:(n=Number(t.substring(n,i)),isNaN(n)?Le:(i+=1)+n>t.length?Me:(t=t.slice(i,i+n),e.C=i+n,t))}function je(e){e.S=Date.now()+e.I,Be(e,e.I)}function Be(e,t){if(null!=e.B)throw Error("WatchDog timer not null");e.B=Se(h(e.ba,e),t)}function ze(e){e.B&&(s.clearTimeout(e.B),e.B=null)}function $e(e){0==e.j.G||e.J||rn(e.j,e)}function We(e){ze(e);var t=e.M;t&&"function"==typeof t.ma&&t.ma(),e.M=null,ce(e.U),e.g&&(t=e.g,e.g=null,t.abort(),t.ma())}function He(e,t){try{var n=e.j;if(0!=n.G&&(n.g==e||Je(n.h,e)))if(!e.K&&Je(n.h,e)&&3==n.G){try{var i=n.Da.g.parse(t)}catch(l){i=null}if(Array.isArray(i)&&3==i.length){var s=i;if(0==s[0]){e:if(!n.u){if(n.g){if(!(n.g.F+3e3<e.F))break e;sn(n),Kt(n)}en(n),Ce(18)}}else n.za=s[1],0<n.za-n.T&&37500>s[2]&&n.F&&0==n.v&&!n.C&&(n.C=Se(h(n.Za,n),6e3));if(1>=Ye(n.h)&&n.ca){try{n.ca()}catch(l){}n.ca=void 0}}else an(n,11)}else if((e.K||n.g==e)&&sn(n),!p(t))for(s=n.Da.g.parse(t),t=0;t<s.length;t++){let h=s[t];if(n.T=h[0],h=h[1],2==n.G)if("c"==h[0]){n.K=h[1],n.ia=h[2];const t=h[3];null!=t&&(n.la=t,n.j.info("VER="+n.la));const s=h[4];null!=s&&(n.Aa=s,n.j.info("SVER="+n.Aa));const l=h[5];null!=l&&"number"==typeof l&&0<l&&(i=1.5*l,n.L=i,n.j.info("backChannelRequestTimeoutMs_="+i)),i=n;const u=e.g;if(u){const e=u.g?u.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(e){var r=i.h;r.g||-1==e.indexOf("spdy")&&-1==e.indexOf("quic")&&-1==e.indexOf("h2")||(r.j=r.l,r.g=new Set,r.h&&(Xe(r,r.h),r.h=null))}if(i.D){const e=u.g?u.g.getResponseHeader("X-HTTP-Session-Id"):null;e&&(i.ya=e,ct(i.I,i.D,e))}}n.G=3,n.l&&n.l.ua(),n.ba&&(n.R=Date.now()-e.F,n.j.info("Handshake RTT: "+n.R+"ms"));var o=e;if((i=n).qa=hn(i,i.J?i.ia:null,i.W),o.K){Ze(i.h,o);var a=o,c=i.L;c&&(a.I=c),a.B&&(ze(a),je(a)),i.g=o}else Zt(i);0<n.i.length&&Qt(n)}else"stop"!=h[0]&&"close"!=h[0]||an(n,7);else 3==n.G&&("stop"==h[0]||"close"==h[0]?"stop"==h[0]?an(n,7):Ht(n):"noop"!=h[0]&&n.l&&n.l.ta(h),n.v=0)}Ie()}catch(l){}}xe.prototype.ca=function(e){e=e.target;const t=this.M;t&&3==Bt(e)?t.j():this.Y(e)},xe.prototype.Y=function(e){try{if(e==this.g)e:{const d=Bt(this.g);var t=this.g.Ba();this.g.Z();if(!(3>d)&&(3!=d||this.g&&(this.h.h||this.g.oa()||zt(this.g)))){this.J||4!=d||7==t||Ie(),ze(this);var n=this.g.Z();this.X=n;t:if(Ve(this)){var i=zt(this.g);e="";var r=i.length,o=4==Bt(this.g);if(!this.h.i){if("undefined"==typeof TextDecoder){We(this),$e(this);var a="";break t}this.h.i=new s.TextDecoder}for(t=0;t<r;t++)this.h.h=!0,e+=this.h.i.decode(i[t],{stream:!(o&&t==r-1)});i.length=0,this.h.g+=e,this.C=0,a=this.h.g}else a=this.g.oa();if(this.o=200==n,function(e,t,n,i,s,r,o){e.info(function(){return"XMLHTTP RESP ("+i+") [ attempt "+s+"]: "+t+"\n"+n+"\n"+r+" "+o})}(this.i,this.u,this.A,this.l,this.R,d,n),this.o){if(this.T&&!this.K){t:{if(this.g){var c,h=this.g;if((c=h.g?h.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!p(c)){var l=c;break t}}l=null}if(!(n=l)){this.o=!1,this.s=3,Ce(12),We(this),$e(this);break e}Ne(this.i,this.l,n,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,He(this,n)}if(this.P){let e;for(n=!0;!this.J&&this.C<a.length;){if(e=qe(this,a),e==Me){4==d&&(this.s=4,Ce(14),n=!1),Ne(this.i,this.l,null,"[Incomplete Response]");break}if(e==Le){this.s=4,Ce(15),Ne(this.i,this.l,a,"[Invalid Chunk]"),n=!1;break}Ne(this.i,this.l,e,null),He(this,e)}if(Ve(this)&&0!=this.C&&(this.h.g=this.h.g.slice(this.C),this.C=0),4!=d||0!=a.length||this.h.h||(this.s=1,Ce(16),n=!1),this.o=this.o&&n,n){if(0<a.length&&!this.W){this.W=!0;var u=this.j;u.g==this&&u.ba&&!u.M&&(u.j.info("Great, no buffering proxy detected. Bytes received: "+a.length),tn(u),u.M=!0,Ce(11))}}else Ne(this.i,this.l,a,"[Invalid Chunked Response]"),We(this),$e(this)}else Ne(this.i,this.l,a,null),He(this,a);4==d&&We(this),this.o&&!this.J&&(4==d?rn(this.j,this):(this.o=!1,je(this)))}else(function(e){const t={};e=(e.g&&2<=Bt(e)&&e.g.getAllResponseHeaders()||"").split("\r\n");for(let i=0;i<e.length;i++){if(p(e[i]))continue;var n=I(e[i]);const s=n[0];if("string"!=typeof(n=n[1]))continue;n=n.trim();const r=t[s]||[];t[s]=r,r.push(n)}!function(e,t){for(const n in e)t.call(void 0,e[n],n,e)}(t,function(e){return e.join(", ")})})(this.g),400==n&&0<a.indexOf("Unknown SID")?(this.s=3,Ce(12)):(this.s=0,Ce(13)),We(this),$e(this)}}}catch(d){}},xe.prototype.cancel=function(){this.J=!0,We(this)},xe.prototype.ba=function(){this.B=null;const e=Date.now();0<=e-this.S?(function(e,t){e.info(function(){return"TIMEOUT: "+t})}(this.i,this.A),2!=this.L&&(Ie(),Ce(17)),We(this),this.s=2,$e(this)):Be(this,this.S-e)};var Ke=class{constructor(e,t){this.g=e,this.map=t}};function Ge(e){this.l=e||10,s.PerformanceNavigationTiming?e=0<(e=s.performance.getEntriesByType("navigation")).length&&("hq"==e[0].nextHopProtocol||"h2"==e[0].nextHopProtocol):e=!!(s.chrome&&s.chrome.loadTimes&&s.chrome.loadTimes()&&s.chrome.loadTimes().wasFetchedViaSpdy),this.j=e?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function Qe(e){return!!e.h||!!e.g&&e.g.size>=e.j}function Ye(e){return e.h?1:e.g?e.g.size:0}function Je(e,t){return e.h?e.h==t:!!e.g&&e.g.has(t)}function Xe(e,t){e.g?e.g.add(t):e.h=t}function Ze(e,t){e.h&&e.h==t?e.h=null:e.g&&e.g.has(t)&&e.g.delete(t)}function et(e){if(null!=e.h)return e.i.concat(e.h.D);if(null!=e.g&&0!==e.g.size){let t=e.i;for(const n of e.g.values())t=t.concat(n.D);return t}return d(e.i)}function tt(e,t){if(e.forEach&&"function"==typeof e.forEach)e.forEach(t,void 0);else if(r(e)||"string"==typeof e)Array.prototype.forEach.call(e,t,void 0);else for(var n=function(e){if(e.na&&"function"==typeof e.na)return e.na();if(!e.V||"function"!=typeof e.V){if("undefined"!=typeof Map&&e instanceof Map)return Array.from(e.keys());if(!("undefined"!=typeof Set&&e instanceof Set)){if(r(e)||"string"==typeof e){var t=[];e=e.length;for(var n=0;n<e;n++)t.push(n);return t}t=[],n=0;for(const i in e)t[n++]=i;return t}}}(e),i=function(e){if(e.V&&"function"==typeof e.V)return e.V();if("undefined"!=typeof Map&&e instanceof Map||"undefined"!=typeof Set&&e instanceof Set)return Array.from(e.values());if("string"==typeof e)return e.split("");if(r(e)){for(var t=[],n=e.length,i=0;i<n;i++)t.push(e[i]);return t}for(i in t=[],n=0,e)t[n++]=e[i];return t}(e),s=i.length,o=0;o<s;o++)t.call(void 0,i[o],n&&n[o],e)}Ge.prototype.cancel=function(){if(this.i=et(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&0!==this.g.size){for(const e of this.g.values())e.cancel();this.g.clear()}};var nt=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function it(e){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,e instanceof it){this.h=e.h,rt(this,e.j),this.o=e.o,this.g=e.g,ot(this,e.s),this.l=e.l;var t=e.i,n=new yt;n.i=t.i,t.g&&(n.g=new Map(t.g),n.h=t.h),at(this,n),this.m=e.m}else e&&(t=String(e).match(nt))?(this.h=!1,rt(this,t[1]||"",!0),this.o=lt(t[2]||""),this.g=lt(t[3]||"",!0),ot(this,t[4]),this.l=lt(t[5]||"",!0),at(this,t[6]||"",!0),this.m=lt(t[7]||"")):(this.h=!1,this.i=new yt(null,this.h))}function st(e){return new it(e)}function rt(e,t,n){e.j=n?lt(t,!0):t,e.j&&(e.j=e.j.replace(/:$/,""))}function ot(e,t){if(t){if(t=Number(t),isNaN(t)||0>t)throw Error("Bad port number "+t);e.s=t}else e.s=null}function at(e,t,n){t instanceof yt?(e.i=t,function(e,t){t&&!e.j&&(vt(e),e.i=null,e.g.forEach(function(e,t){var n=t.toLowerCase();t!=n&&(wt(this,t),It(this,n,e))},e)),e.j=t}(e.i,e.h)):(n||(t=ut(t,mt)),e.i=new yt(t,e.h))}function ct(e,t,n){e.i.set(t,n)}function ht(e){return ct(e,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),e}function lt(e,t){return e?t?decodeURI(e.replace(/%25/g,"%2525")):decodeURIComponent(e):""}function ut(e,t,n){return"string"==typeof e?(e=encodeURI(e).replace(t,dt),n&&(e=e.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),e):null}function dt(e){return"%"+((e=e.charCodeAt(0))>>4&15).toString(16)+(15&e).toString(16)}it.prototype.toString=function(){var e=[],t=this.j;t&&e.push(ut(t,ft,!0),":");var n=this.g;return(n||"file"==t)&&(e.push("//"),(t=this.o)&&e.push(ut(t,ft,!0),"@"),e.push(encodeURIComponent(String(n)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),null!=(n=this.s)&&e.push(":",String(n))),(n=this.l)&&(this.g&&"/"!=n.charAt(0)&&e.push("/"),e.push(ut(n,"/"==n.charAt(0)?gt:pt,!0))),(n=this.i.toString())&&e.push("?",n),(n=this.m)&&e.push("#",ut(n,_t)),e.join("")};var ft=/[#\/\?@]/g,pt=/[#\?:]/g,gt=/[#\?]/g,mt=/[#\?@]/g,_t=/#/g;function yt(e,t){this.h=this.g=null,this.i=e||null,this.j=!!t}function vt(e){e.g||(e.g=new Map,e.h=0,e.i&&function(e,t){if(e){e=e.split("&");for(var n=0;n<e.length;n++){var i=e[n].indexOf("="),s=null;if(0<=i){var r=e[n].substring(0,i);s=e[n].substring(i+1)}else r=e[n];t(r,s?decodeURIComponent(s.replace(/\+/g," ")):"")}}}(e.i,function(t,n){e.add(decodeURIComponent(t.replace(/\+/g," ")),n)}))}function wt(e,t){vt(e),t=bt(e,t),e.g.has(t)&&(e.i=null,e.h-=e.g.get(t).length,e.g.delete(t))}function Tt(e,t){return vt(e),t=bt(e,t),e.g.has(t)}function It(e,t,n){wt(e,t),0<n.length&&(e.i=null,e.g.set(bt(e,t),d(n)),e.h+=n.length)}function bt(e,t){return t=String(t),e.j&&(t=t.toLowerCase()),t}function Ct(e,t,n,i,s){try{s&&(s.onload=null,s.onerror=null,s.onabort=null,s.ontimeout=null),i(n)}catch(r){}}function Et(){this.g=new ue}function St(e,t,n){const i=n||"";try{tt(e,function(e,n){let s=e;o(e)&&(s=he(e)),t.push(i+n+"="+encodeURIComponent(s))})}catch(s){throw t.push(i+"type="+encodeURIComponent("_badmap")),s}}function kt(e){this.l=e.Ub||null,this.j=e.eb||!1}function Nt(e,t){ee.call(this),this.D=e,this.o=t,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}function At(e){e.j.read().then(e.Pa.bind(e)).catch(e.ga.bind(e))}function Rt(e){e.readyState=4,e.l=null,e.j=null,e.v=null,Pt(e)}function Pt(e){e.onreadystatechange&&e.onreadystatechange.call(e)}function Dt(e){let t="";return y(e,function(e,n){t+=n,t+=":",t+=e,t+="\r\n"}),t}function xt(e,t,n){e:{for(i in n){var i=!1;break e}i=!0}i||(n=Dt(n),"string"==typeof e?null!=n&&encodeURIComponent(String(n)):ct(e,t,n))}function Ot(e){ee.call(this),this.headers=new Map,this.o=e||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}(e=yt.prototype).add=function(e,t){vt(this),this.i=null,e=bt(this,e);var n=this.g.get(e);return n||this.g.set(e,n=[]),n.push(t),this.h+=1,this},e.forEach=function(e,t){vt(this),this.g.forEach(function(n,i){n.forEach(function(n){e.call(t,n,i,this)},this)},this)},e.na=function(){vt(this);const e=Array.from(this.g.values()),t=Array.from(this.g.keys()),n=[];for(let i=0;i<t.length;i++){const s=e[i];for(let e=0;e<s.length;e++)n.push(t[i])}return n},e.V=function(e){vt(this);let t=[];if("string"==typeof e)Tt(this,e)&&(t=t.concat(this.g.get(bt(this,e))));else{e=Array.from(this.g.values());for(let n=0;n<e.length;n++)t=t.concat(e[n])}return t},e.set=function(e,t){return vt(this),this.i=null,Tt(this,e=bt(this,e))&&(this.h-=this.g.get(e).length),this.g.set(e,[t]),this.h+=1,this},e.get=function(e,t){return e&&0<(e=this.V(e)).length?String(e[0]):t},e.toString=function(){if(this.i)return this.i;if(!this.g)return"";const e=[],t=Array.from(this.g.keys());for(var n=0;n<t.length;n++){var i=t[n];const r=encodeURIComponent(String(i)),o=this.V(i);for(i=0;i<o.length;i++){var s=r;""!==o[i]&&(s+="="+encodeURIComponent(String(o[i]))),e.push(s)}}return this.i=e.join("&")},u(kt,de),kt.prototype.g=function(){return new Nt(this.l,this.j)},kt.prototype.i=function(e){return function(){return e}}({}),u(Nt,ee),(e=Nt.prototype).open=function(e,t){if(0!=this.readyState)throw this.abort(),Error("Error reopening a connection");this.B=e,this.A=t,this.readyState=1,Pt(this)},e.send=function(e){if(1!=this.readyState)throw this.abort(),Error("need to call open() first. ");this.g=!0;const t={headers:this.u,method:this.B,credentials:this.m,cache:void 0};e&&(t.body=e),(this.D||s).fetch(new Request(this.A,t)).then(this.Sa.bind(this),this.ga.bind(this))},e.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&4!=this.readyState&&(this.g=!1,Rt(this)),this.readyState=0},e.Sa=function(e){if(this.g&&(this.l=e,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=e.headers,this.readyState=2,Pt(this)),this.g&&(this.readyState=3,Pt(this),this.g)))if("arraybuffer"===this.responseType)e.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(void 0!==s.ReadableStream&&"body"in e){if(this.j=e.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;At(this)}else e.text().then(this.Ra.bind(this),this.ga.bind(this))},e.Pa=function(e){if(this.g){if(this.o&&e.value)this.response.push(e.value);else if(!this.o){var t=e.value?e.value:new Uint8Array(0);(t=this.v.decode(t,{stream:!e.done}))&&(this.response=this.responseText+=t)}e.done?Rt(this):Pt(this),3==this.readyState&&At(this)}},e.Ra=function(e){this.g&&(this.response=this.responseText=e,Rt(this))},e.Qa=function(e){this.g&&(this.response=e,Rt(this))},e.ga=function(){this.g&&Rt(this)},e.setRequestHeader=function(e,t){this.u.append(e,t)},e.getResponseHeader=function(e){return this.h&&this.h.get(e.toLowerCase())||""},e.getAllResponseHeaders=function(){if(!this.h)return"";const e=[],t=this.h.entries();for(var n=t.next();!n.done;)n=n.value,e.push(n[0]+": "+n[1]),n=t.next();return e.join("\r\n")},Object.defineProperty(Nt.prototype,"withCredentials",{get:function(){return"include"===this.m},set:function(e){this.m=e?"include":"same-origin"}}),u(Ot,ee);var Lt=/^https?$/i,Mt=["POST","PUT"];function Ft(e,t){e.h=!1,e.g&&(e.j=!0,e.g.abort(),e.j=!1),e.l=t,e.m=5,Ut(e),qt(e)}function Ut(e){e.A||(e.A=!0,te(e,"complete"),te(e,"error"))}function Vt(e){if(e.h&&void 0!==i&&(!e.v[1]||4!=Bt(e)||2!=e.Z()))if(e.u&&4==Bt(e))ie(e.Ea,0,e);else if(te(e,"readystatechange"),4==Bt(e)){e.h=!1;try{const i=e.Z();e:switch(i){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var t=!0;break e;default:t=!1}var n;if(!(n=t)){var r;if(r=0===i){var o=String(e.D).match(nt)[1]||null;!o&&s.self&&s.self.location&&(o=s.self.location.protocol.slice(0,-1)),r=!Lt.test(o?o.toLowerCase():"")}n=r}if(n)te(e,"complete"),te(e,"success");else{e.m=6;try{var a=2<Bt(e)?e.g.statusText:""}catch(c){a=""}e.l=a+" ["+e.Z()+"]",Ut(e)}}finally{qt(e)}}}function qt(e,t){if(e.g){jt(e);const i=e.g,s=e.v[0]?()=>{}:null;e.g=null,e.v=null,t||te(e,"ready");try{i.onreadystatechange=s}catch(n){}}}function jt(e){e.I&&(s.clearTimeout(e.I),e.I=null)}function Bt(e){return e.g?e.g.readyState:0}function zt(e){try{if(!e.g)return null;if("response"in e.g)return e.g.response;switch(e.H){case"":case"text":return e.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in e.g)return e.g.mozResponseArrayBuffer}return null}catch(t){return null}}function $t(e,t,n){return n&&n.internalChannelParams&&n.internalChannelParams[e]||t}function Wt(e){this.Aa=0,this.i=[],this.j=new ke,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=$t("failFast",!1,e),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=$t("baseRetryDelayMs",5e3,e),this.cb=$t("retryDelaySeedMs",1e4,e),this.Wa=$t("forwardChannelMaxRetries",2,e),this.wa=$t("forwardChannelRequestTimeoutMs",2e4,e),this.pa=e&&e.xmlHttpFactory||void 0,this.Xa=e&&e.Tb||void 0,this.Ca=e&&e.useFetchStreams||!1,this.L=void 0,this.J=e&&e.supportsCrossDomainXhr||!1,this.K="",this.h=new Ge(e&&e.concurrentRequestLimit),this.Da=new Et,this.P=e&&e.fastHandshake||!1,this.O=e&&e.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=e&&e.Rb||!1,e&&e.xa&&this.j.xa(),e&&e.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&e&&e.detectBufferingProxy||!1,this.ja=void 0,e&&e.longPollingTimeout&&0<e.longPollingTimeout&&(this.ja=e.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}function Ht(e){if(Gt(e),3==e.G){var t=e.U++,n=st(e.I);if(ct(n,"SID",e.K),ct(n,"RID",t),ct(n,"TYPE","terminate"),Jt(e,n),(t=new xe(e,e.j,t)).L=2,t.v=ht(st(n)),n=!1,s.navigator&&s.navigator.sendBeacon)try{n=s.navigator.sendBeacon(t.v.toString(),"")}catch(i){}!n&&s.Image&&((new Image).src=t.v,n=!0),n||(t.g=ln(t.j,null),t.g.ea(t.v)),t.F=Date.now(),je(t)}cn(e)}function Kt(e){e.g&&(tn(e),e.g.cancel(),e.g=null)}function Gt(e){Kt(e),e.u&&(s.clearTimeout(e.u),e.u=null),sn(e),e.h.cancel(),e.s&&("number"==typeof e.s&&s.clearTimeout(e.s),e.s=null)}function Qt(e){if(!Qe(e.h)&&!e.s){e.s=!0;var t=e.Ga;k||R(),N||(k(),N=!0),A.add(t,e),e.B=0}}function Yt(e,t){var n;n=t?t.l:e.U++;const i=st(e.I);ct(i,"SID",e.K),ct(i,"RID",n),ct(i,"AID",e.T),Jt(e,i),e.m&&e.o&&xt(i,e.m,e.o),n=new xe(e,e.j,n,e.B+1),null===e.m&&(n.H=e.o),t&&(e.i=t.D.concat(e.i)),t=Xt(e,n,1e3),n.I=Math.round(.5*e.wa)+Math.round(.5*e.wa*Math.random()),Xe(e.h,n),Fe(n,i,t)}function Jt(e,t){e.H&&y(e.H,function(e,n){ct(t,n,e)}),e.l&&tt({},function(e,n){ct(t,n,e)})}function Xt(e,t,n){n=Math.min(e.i.length,n);var i=e.l?h(e.l.Na,e.l,e):null;e:{var s=e.i;let t=-1;for(;;){const e=["count="+n];-1==t?0<n?(t=s[0].g,e.push("ofs="+t)):t=0:e.push("ofs="+t);let o=!0;for(let a=0;a<n;a++){let n=s[a].g;const c=s[a].map;if(n-=t,0>n)t=Math.max(0,s[a].g-100),o=!1;else try{St(c,e,"req"+n+"_")}catch(r){i&&i(c)}}if(o){i=e.join("&");break e}}}return e=e.i.splice(0,n),t.D=e,i}function Zt(e){if(!e.g&&!e.u){e.Y=1;var t=e.Fa;k||R(),N||(k(),N=!0),A.add(t,e),e.v=0}}function en(e){return!(e.g||e.u||3<=e.v)&&(e.Y++,e.u=Se(h(e.Fa,e),on(e,e.v)),e.v++,!0)}function tn(e){null!=e.A&&(s.clearTimeout(e.A),e.A=null)}function nn(e){e.g=new xe(e,e.j,"rpc",e.Y),null===e.m&&(e.g.H=e.o),e.g.O=0;var t=st(e.qa);ct(t,"RID","rpc"),ct(t,"SID",e.K),ct(t,"AID",e.T),ct(t,"CI",e.F?"0":"1"),!e.F&&e.ja&&ct(t,"TO",e.ja),ct(t,"TYPE","xmlhttp"),Jt(e,t),e.m&&e.o&&xt(t,e.m,e.o),e.L&&(e.g.I=e.L);var n=e.g;e=e.ia,n.L=1,n.v=ht(st(t)),n.m=null,n.P=!0,Ue(n,e)}function sn(e){null!=e.C&&(s.clearTimeout(e.C),e.C=null)}function rn(e,t){var n=null;if(e.g==t){sn(e),tn(e),e.g=null;var i=2}else{if(!Je(e.h,t))return;n=t.D,Ze(e.h,t),i=1}if(0!=e.G)if(t.o)if(1==i){n=t.m?t.m.length:0,t=Date.now()-t.F;var s=e.B;te(i=we(),new Ee(i,n)),Qt(e)}else Zt(e);else if(3==(s=t.s)||0==s&&0<t.X||!(1==i&&function(e,t){return!(Ye(e.h)>=e.h.j-(e.s?1:0)||(e.s?(e.i=t.D.concat(e.i),0):1==e.G||2==e.G||e.B>=(e.Va?0:e.Wa)||(e.s=Se(h(e.Ga,e,t),on(e,e.B)),e.B++,0)))}(e,t)||2==i&&en(e)))switch(n&&0<n.length&&(t=e.h,t.i=t.i.concat(n)),s){case 1:an(e,5);break;case 4:an(e,10);break;case 3:an(e,6);break;default:an(e,2)}}function on(e,t){let n=e.Ta+Math.floor(Math.random()*e.cb);return e.isActive()||(n*=2),n*t}function an(e,t){if(e.j.info("Error code "+t),2==t){var n=h(e.fb,e),i=e.Xa;const t=!i;i=new it(i||"//www.google.com/images/cleardot.gif"),s.location&&"http"==s.location.protocol||rt(i,"https"),ht(i),t?function(e,t){const n=new ke;if(s.Image){const i=new Image;i.onload=l(Ct,n,"TestLoadImage: loaded",!0,t,i),i.onerror=l(Ct,n,"TestLoadImage: error",!1,t,i),i.onabort=l(Ct,n,"TestLoadImage: abort",!1,t,i),i.ontimeout=l(Ct,n,"TestLoadImage: timeout",!1,t,i),s.setTimeout(function(){i.ontimeout&&i.ontimeout()},1e4),i.src=e}else t(!1)}(i.toString(),n):function(e,t){new ke;const n=new AbortController,i=setTimeout(()=>{n.abort(),Ct(0,0,!1,t)},1e4);fetch(e,{signal:n.signal}).then(e=>{clearTimeout(i),e.ok?Ct(0,0,!0,t):Ct(0,0,!1,t)}).catch(()=>{clearTimeout(i),Ct(0,0,!1,t)})}(i.toString(),n)}else Ce(2);e.G=0,e.l&&e.l.sa(t),cn(e),Gt(e)}function cn(e){if(e.G=0,e.ka=[],e.l){const t=et(e.h);0==t.length&&0==e.i.length||(f(e.ka,t),f(e.ka,e.i),e.h.i.length=0,d(e.i),e.i.length=0),e.l.ra()}}function hn(e,t,n){var i=n instanceof it?st(n):new it(n);if(""!=i.g)t&&(i.g=t+"."+i.g),ot(i,i.s);else{var r=s.location;i=r.protocol,t=t?t+"."+r.hostname:r.hostname,r=+r.port;var o=new it(null);i&&rt(o,i),t&&(o.g=t),r&&ot(o,r),n&&(o.l=n),i=o}return n=e.D,t=e.ya,n&&t&&ct(i,n,t),ct(i,"VER",e.la),Jt(e,i),i}function ln(e,t,n){if(t&&!e.J)throw Error("Can't create secondary domain capable XhrIo object.");return(t=e.Ca&&!e.pa?new Ot(new kt({eb:n})):new Ot(e.pa)).Ha(e.J),t}function un(){}function dn(){}function fn(e,t){ee.call(this),this.g=new Wt(t),this.l=e,this.h=t&&t.messageUrlParams||null,e=t&&t.messageHeaders||null,t&&t.clientProtocolHeaderRequired&&(e?e["X-Client-Protocol"]="webchannel":e={"X-Client-Protocol":"webchannel"}),this.g.o=e,e=t&&t.initMessageHeaders||null,t&&t.messageContentType&&(e?e["X-WebChannel-Content-Type"]=t.messageContentType:e={"X-WebChannel-Content-Type":t.messageContentType}),t&&t.va&&(e?e["X-WebChannel-Client-Profile"]=t.va:e={"X-WebChannel-Client-Profile":t.va}),this.g.S=e,(e=t&&t.Sb)&&!p(e)&&(this.g.m=e),this.v=t&&t.supportsCrossDomainXhr||!1,this.u=t&&t.sendRawJson||!1,(t=t&&t.httpSessionIdParam)&&!p(t)&&(this.g.D=t,null!==(e=this.h)&&t in e&&(t in(e=this.h)&&delete e[t])),this.j=new mn(this)}function pn(e){me.call(this),e.__headers__&&(this.headers=e.__headers__,this.statusCode=e.__status__,delete e.__headers__,delete e.__status__);var t=e.__sm__;if(t){e:{for(const n in t){e=n;break e}e=void 0}(this.i=e)&&(e=this.i,t=null!==t&&e in t?t[e]:void 0),this.data=t}else this.data=e}function gn(){_e.call(this),this.status=1}function mn(e){this.g=e}(e=Ot.prototype).Ha=function(e){this.J=e},e.ea=function(e,t,n,i){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+e);t=t?t.toUpperCase():"GET",this.D=e,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():Ae.g(),this.v=this.o?fe(this.o):fe(Ae),this.g.onreadystatechange=h(this.Ea,this);try{this.B=!0,this.g.open(t,String(e),!0),this.B=!1}catch(o){return void Ft(this,o)}if(e=n||"",n=new Map(this.headers),i)if(Object.getPrototypeOf(i)===Object.prototype)for(var r in i)n.set(r,i[r]);else{if("function"!=typeof i.keys||"function"!=typeof i.get)throw Error("Unknown input type for opt_headers: "+String(i));for(const e of i.keys())n.set(e,i.get(e))}i=Array.from(n.keys()).find(e=>"content-type"==e.toLowerCase()),r=s.FormData&&e instanceof s.FormData,!(0<=Array.prototype.indexOf.call(Mt,t,void 0))||i||r||n.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[s,a]of n)this.g.setRequestHeader(s,a);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{jt(this),this.u=!0,this.g.send(e),this.u=!1}catch(o){Ft(this,o)}},e.abort=function(e){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=e||7,te(this,"complete"),te(this,"abort"),qt(this))},e.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),qt(this,!0)),Ot.aa.N.call(this)},e.Ea=function(){this.s||(this.B||this.u||this.j?Vt(this):this.bb())},e.bb=function(){Vt(this)},e.isActive=function(){return!!this.g},e.Z=function(){try{return 2<Bt(this)?this.g.status:-1}catch(e){return-1}},e.oa=function(){try{return this.g?this.g.responseText:""}catch(e){return""}},e.Oa=function(e){if(this.g){var t=this.g.responseText;return e&&0==t.indexOf(e)&&(t=t.substring(e.length)),le(t)}},e.Ba=function(){return this.m},e.Ka=function(){return"string"==typeof this.l?this.l:String(this.l)},(e=Wt.prototype).la=8,e.G=1,e.connect=function(e,t,n,i){Ce(0),this.W=e,this.H=t||{},n&&void 0!==i&&(this.H.OSID=n,this.H.OAID=i),this.F=this.X,this.I=hn(this,null,this.W),Qt(this)},e.Ga=function(e){if(this.s)if(this.s=null,1==this.G){if(!e){this.U=Math.floor(1e5*Math.random()),e=this.U++;const s=new xe(this,this.j,e);let r=this.o;if(this.S&&(r?(r=v(r),T(r,this.S)):r=this.S),null!==this.m||this.O||(s.H=r,r=null),this.P)e:{for(var t=0,n=0;n<this.i.length;n++){var i=this.i[n];if(void 0===(i="__data__"in i.map&&"string"==typeof(i=i.map.__data__)?i.length:void 0))break;if(4096<(t+=i)){t=n;break e}if(4096===t||n===this.i.length-1){t=n+1;break e}}t=1e3}else t=1e3;t=Xt(this,s,t),ct(n=st(this.I),"RID",e),ct(n,"CVER",22),this.D&&ct(n,"X-HTTP-Session-Id",this.D),Jt(this,n),r&&(this.O?t="headers="+encodeURIComponent(String(Dt(r)))+"&"+t:this.m&&xt(n,this.m,r)),Xe(this.h,s),this.Ua&&ct(n,"TYPE","init"),this.P?(ct(n,"$req",t),ct(n,"SID","null"),s.T=!0,Fe(s,n,null)):Fe(s,n,t),this.G=2}}else 3==this.G&&(e?Yt(this,e):0==this.i.length||Qe(this.h)||Yt(this))},e.Fa=function(){if(this.u=null,nn(this),this.ba&&!(this.M||null==this.g||0>=this.R)){var e=2*this.R;this.j.info("BP detection timer enabled: "+e),this.A=Se(h(this.ab,this),e)}},e.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,Ce(10),Kt(this),nn(this))},e.Za=function(){null!=this.C&&(this.C=null,Kt(this),en(this),Ce(19))},e.fb=function(e){e?(this.j.info("Successfully pinged google.com"),Ce(2)):(this.j.info("Failed to ping google.com"),Ce(1))},e.isActive=function(){return!!this.l&&this.l.isActive(this)},(e=un.prototype).ua=function(){},e.ta=function(){},e.sa=function(){},e.ra=function(){},e.isActive=function(){return!0},e.Na=function(){},dn.prototype.g=function(e,t){return new fn(e,t)},u(fn,ee),fn.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},fn.prototype.close=function(){Ht(this.g)},fn.prototype.o=function(e){var t=this.g;if("string"==typeof e){var n={};n.__data__=e,e=n}else this.u&&((n={}).__data__=he(e),e=n);t.i.push(new Ke(t.Ya++,e)),3==t.G&&Qt(t)},fn.prototype.N=function(){this.g.l=null,delete this.j,Ht(this.g),delete this.g,fn.aa.N.call(this)},u(pn,me),u(gn,_e),u(mn,un),mn.prototype.ua=function(){te(this.g,"a")},mn.prototype.ta=function(e){te(this.g,new pn(e))},mn.prototype.sa=function(e){te(this.g,new gn)},mn.prototype.ra=function(){te(this.g,"b")},dn.prototype.createWebChannel=dn.prototype.g,fn.prototype.send=fn.prototype.o,fn.prototype.open=fn.prototype.m,fn.prototype.close=fn.prototype.close,Hh=function(){return new dn},Wh=function(){return we()},$h=ye,zh={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},Re.NO_ERROR=0,Re.TIMEOUT=8,Re.HTTP_ERROR=6,Bh=Re,Pe.COMPLETE="complete",jh=Pe,pe.EventType=ge,ge.OPEN="a",ge.CLOSE="b",ge.ERROR="c",ge.MESSAGE="d",ee.prototype.listen=ee.prototype.K,qh=pe,Ot.prototype.listenOnce=Ot.prototype.L,Ot.prototype.getLastError=Ot.prototype.Ka,Ot.prototype.getLastErrorCode=Ot.prototype.Ba,Ot.prototype.getStatus=Ot.prototype.Z,Ot.prototype.getResponseJson=Ot.prototype.Oa,Ot.prototype.getResponseText=Ot.prototype.oa,Ot.prototype.send=Ot.prototype.ea,Ot.prototype.setWithCredentials=Ot.prototype.Ha,Vh=Ot}).apply(void 0!==Kh?Kh:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{});const Gh="@firebase/firestore";
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Qh{constructor(e){this.uid=e}isAuthenticated(){return null!=this.uid}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}Qh.UNAUTHENTICATED=new Qh(null),Qh.GOOGLE_CREDENTIALS=new Qh("google-credentials-uid"),Qh.FIRST_PARTY=new Qh("first-party-uid"),Qh.MOCK_USER=new Qh("mock-user");
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
let Yh="10.14.0";
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */const Jh=new ee("@firebase/firestore");function Xh(){return Jh.logLevel}function Zh(e,...t){if(Jh.logLevel<=G.DEBUG){const n=t.map(nl);Jh.debug(`Firestore (${Yh}): ${e}`,...n)}}function el(e,...t){if(Jh.logLevel<=G.ERROR){const n=t.map(nl);Jh.error(`Firestore (${Yh}): ${e}`,...n)}}function tl(e,...t){if(Jh.logLevel<=G.WARN){const n=t.map(nl);Jh.warn(`Firestore (${Yh}): ${e}`,...n)}}function nl(e){if("string"==typeof e)return e;try{
/**
      * @license
      * Copyright 2020 Google LLC
      *
      * Licensed under the Apache License, Version 2.0 (the "License");
      * you may not use this file except in compliance with the License.
      * You may obtain a copy of the License at
      *
      *   http://www.apache.org/licenses/LICENSE-2.0
      *
      * Unless required by applicable law or agreed to in writing, software
      * distributed under the License is distributed on an "AS IS" BASIS,
      * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
      * See the License for the specific language governing permissions and
      * limitations under the License.
      */
return t=e,JSON.stringify(t)}catch(n){return e}var t}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */function il(e="Unexpected state"){const t=`FIRESTORE (${Yh}) INTERNAL ASSERTION FAILED: `+e;throw el(t),new Error(t)}function sl(e,t){e||il()}function rl(e,t){return e}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */const ol={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class al extends E{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class cl{constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class hl{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class ll{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(Qh.UNAUTHENTICATED))}shutdown(){}}class ul{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}}class dl{constructor(e){this.t=e,this.currentUser=Qh.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){sl(void 0===this.o);let n=this.i;const i=e=>this.i!==n?(n=this.i,t(e)):Promise.resolve();let s=new cl;this.o=()=>{this.i++,this.currentUser=this.u(),s.resolve(),s=new cl,e.enqueueRetryable(()=>i(this.currentUser))};const r=()=>{const t=s;e.enqueueRetryable(async()=>{await t.promise,await i(this.currentUser)})},o=e=>{Zh("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=e,this.o&&(this.auth.addAuthTokenListener(this.o),r())};this.t.onInit(e=>o(e)),setTimeout(()=>{if(!this.auth){const e=this.t.getImmediate({optional:!0});e?o(e):(Zh("FirebaseAuthCredentialsProvider","Auth not yet detected"),s.resolve(),s=new cl)}},0),r()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(t=>this.i!==e?(Zh("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):t?(sl("string"==typeof t.accessToken),new hl(t.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return sl(null===e||"string"==typeof e),new Qh(e)}}class fl{constructor(e,t,n){this.l=e,this.h=t,this.P=n,this.type="FirstParty",this.user=Qh.FIRST_PARTY,this.I=new Map}T(){return this.P?this.P():null}get headers(){this.I.set("X-Goog-AuthUser",this.l);const e=this.T();return e&&this.I.set("Authorization",e),this.h&&this.I.set("X-Goog-Iam-Authorization-Token",this.h),this.I}}class pl{constructor(e,t,n){this.l=e,this.h=t,this.P=n}getToken(){return Promise.resolve(new fl(this.l,this.h,this.P))}start(e,t){e.enqueueRetryable(()=>t(Qh.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class gl{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class ml{constructor(e){this.A=e,this.forceRefresh=!1,this.appCheck=null,this.R=null}start(e,t){sl(void 0===this.o);const n=e=>{null!=e.error&&Zh("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${e.error.message}`);const n=e.token!==this.R;return this.R=e.token,Zh("FirebaseAppCheckTokenProvider",`Received ${n?"new":"existing"} token.`),n?t(e.token):Promise.resolve()};this.o=t=>{e.enqueueRetryable(()=>n(t))};const i=e=>{Zh("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=e,this.o&&this.appCheck.addTokenListener(this.o)};this.A.onInit(e=>i(e)),setTimeout(()=>{if(!this.appCheck){const e=this.A.getImmediate({optional:!0});e?i(e):Zh("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(e=>e?(sl("string"==typeof e.token),this.R=e.token,new gl(e.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */function _l(e){const t="undefined"!=typeof self&&(self.crypto||self.msCrypto),n=new Uint8Array(e);if(t&&"function"==typeof t.getRandomValues)t.getRandomValues(n);else for(let i=0;i<e;i++)n[i]=Math.floor(256*Math.random());return n}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class yl{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(256/62);let n="";for(;n.length<20;){const i=_l(40);for(let s=0;s<i.length;++s)n.length<20&&i[s]<t&&(n+=e.charAt(i[s]%62))}return n}}function vl(e,t){return e<t?-1:e>t?1:0}function wl(e,t,n){return e.length===t.length&&e.every((e,i)=>n(e,t[i]))}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Tl{constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new al(ol.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new al(ol.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<-62135596800)throw new al(ol.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new al(ol.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}static now(){return Tl.fromMillis(Date.now())}static fromDate(e){return Tl.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),n=Math.floor(1e6*(e-1e3*t));return new Tl(t,n)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/1e6}_compareTo(e){return this.seconds===e.seconds?vl(this.nanoseconds,e.nanoseconds):vl(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{seconds:this.seconds,nanoseconds:this.nanoseconds}}valueOf(){const e=this.seconds- -62135596800;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Il{constructor(e){this.timestamp=e}static fromTimestamp(e){return new Il(e)}static min(){return new Il(new Tl(0,0))}static max(){return new Il(new Tl(253402300799,999999999))}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class bl{constructor(e,t,n){void 0===t?t=0:t>e.length&&il(),void 0===n?n=e.length-t:n>e.length-t&&il(),this.segments=e,this.offset=t,this.len=n}get length(){return this.len}isEqual(e){return 0===bl.comparator(this,e)}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof bl?e.forEach(e=>{t.push(e)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=void 0===e?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return 0===this.length}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,n=this.limit();t<n;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const n=Math.min(e.length,t.length);for(let i=0;i<n;i++){const n=e.get(i),s=t.get(i);if(n<s)return-1;if(n>s)return 1}return e.length<t.length?-1:e.length>t.length?1:0}}class Cl extends bl{construct(e,t,n){return new Cl(e,t,n)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const n of e){if(n.indexOf("//")>=0)throw new al(ol.INVALID_ARGUMENT,`Invalid segment (${n}). Paths must not contain // in them.`);t.push(...n.split("/").filter(e=>e.length>0))}return new Cl(t)}static emptyPath(){return new Cl([])}}const El=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class Sl extends bl{construct(e,t,n){return new Sl(e,t,n)}static isValidIdentifier(e){return El.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),Sl.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return 1===this.length&&"__name__"===this.get(0)}static keyField(){return new Sl(["__name__"])}static fromServerFormat(e){const t=[];let n="",i=0;const s=()=>{if(0===n.length)throw new al(ol.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(n),n=""};let r=!1;for(;i<e.length;){const t=e[i];if("\\"===t){if(i+1===e.length)throw new al(ol.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const t=e[i+1];if("\\"!==t&&"."!==t&&"`"!==t)throw new al(ol.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);n+=t,i+=2}else"`"===t?(r=!r,i++):"."!==t||r?(n+=t,i++):(s(),i++)}if(s(),r)throw new al(ol.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new Sl(t)}static emptyPath(){return new Sl([])}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class kl{constructor(e){this.path=e}static fromPath(e){return new kl(Cl.fromString(e))}static fromName(e){return new kl(Cl.fromString(e).popFirst(5))}static empty(){return new kl(Cl.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return null!==e&&0===Cl.comparator(this.path,e.path)}toString(){return this.path.toString()}static comparator(e,t){return Cl.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new kl(new Cl(e.slice()))}}function Nl(e){return new Al(e.readTime,e.key,-1)}class Al{constructor(e,t,n){this.readTime=e,this.documentKey=t,this.largestBatchId=n}static min(){return new Al(Il.min(),kl.empty(),-1)}static max(){return new Al(Il.max(),kl.empty(),-1)}}function Rl(e,t){let n=e.readTime.compareTo(t.readTime);return 0!==n?n:(n=kl.comparator(e.documentKey,t.documentKey),0!==n?n:vl(e.largestBatchId,t.largestBatchId)
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */)}class Pl{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */async function Dl(e){if(e.code!==ol.FAILED_PRECONDITION||"The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab."!==e.message)throw e;Zh("LocalStore","Unexpectedly lost primary lease")}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class xl{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(e=>{this.isDone=!0,this.result=e,this.nextCallback&&this.nextCallback(e)},e=>{this.isDone=!0,this.error=e,this.catchCallback&&this.catchCallback(e)})}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&il(),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new xl((n,i)=>{this.nextCallback=t=>{this.wrapSuccess(e,t).next(n,i)},this.catchCallback=e=>{this.wrapFailure(t,e).next(n,i)}})}toPromise(){return new Promise((e,t)=>{this.next(e,t)})}wrapUserFunction(e){try{const t=e();return t instanceof xl?t:xl.resolve(t)}catch(t){return xl.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction(()=>e(t)):xl.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction(()=>e(t)):xl.reject(t)}static resolve(e){return new xl((t,n)=>{t(e)})}static reject(e){return new xl((t,n)=>{n(e)})}static waitFor(e){return new xl((t,n)=>{let i=0,s=0,r=!1;e.forEach(e=>{++i,e.next(()=>{++s,r&&s===i&&t()},e=>n(e))}),r=!0,s===i&&t()})}static or(e){let t=xl.resolve(!1);for(const n of e)t=t.next(e=>e?xl.resolve(e):n());return t}static forEach(e,t){const n=[];return e.forEach((e,i)=>{n.push(t.call(this,e,i))}),this.waitFor(n)}static mapArray(e,t){return new xl((n,i)=>{const s=e.length,r=new Array(s);let o=0;for(let a=0;a<s;a++){const c=a;t(e[c]).next(e=>{r[c]=e,++o,o===s&&n(r)},e=>i(e))}})}static doWhile(e,t){return new xl((n,i)=>{const s=()=>{!0===e()?t().next(()=>{s()},i):n()};s()})}}function Ol(e){return"IndexedDbTransactionError"===e.name}
/**
   * @license
   * Copyright 2018 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Ll{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=e=>this.ie(e),this.se=e=>t.writeSequenceNumber(e))}ie(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.se&&this.se(e),e}}function Ml(e){return null==e}function Fl(e){return 0===e&&1/e==-1/0}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
function Ul(e){let t=0;for(const n in e)Object.prototype.hasOwnProperty.call(e,n)&&t++;return t}function Vl(e,t){for(const n in e)Object.prototype.hasOwnProperty.call(e,n)&&t(n,e[n])}function ql(e){for(const t in e)if(Object.prototype.hasOwnProperty.call(e,t))return!1;return!0}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */Ll.oe=-1;class jl{constructor(e,t){this.comparator=e,this.root=t||zl.EMPTY}insert(e,t){return new jl(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,zl.BLACK,null,null))}remove(e){return new jl(this.comparator,this.root.remove(e,this.comparator).copy(null,null,zl.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const n=this.comparator(e,t.key);if(0===n)return t.value;n<0?t=t.left:n>0&&(t=t.right)}return null}indexOf(e){let t=0,n=this.root;for(;!n.isEmpty();){const i=this.comparator(e,n.key);if(0===i)return t+n.left.size;i<0?n=n.left:(t+=n.left.size+1,n=n.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,n)=>(e(t,n),!1))}toString(){const e=[];return this.inorderTraversal((t,n)=>(e.push(`${t}:${n}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Bl(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Bl(this.root,e,this.comparator,!1)}getReverseIterator(){return new Bl(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Bl(this.root,e,this.comparator,!0)}}class Bl{constructor(e,t,n,i){this.isReverse=i,this.nodeStack=[];let s=1;for(;!e.isEmpty();)if(s=t?n(e.key,t):1,t&&i&&(s*=-1),s<0)e=this.isReverse?e.left:e.right;else{if(0===s){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(0===this.nodeStack.length)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class zl{constructor(e,t,n,i,s){this.key=e,this.value=t,this.color=null!=n?n:zl.RED,this.left=null!=i?i:zl.EMPTY,this.right=null!=s?s:zl.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,n,i,s){return new zl(null!=e?e:this.key,null!=t?t:this.value,null!=n?n:this.color,null!=i?i:this.left,null!=s?s:this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,n){let i=this;const s=n(e,i.key);return i=s<0?i.copy(null,null,null,i.left.insert(e,t,n),null):0===s?i.copy(null,t,null,null,null):i.copy(null,null,null,null,i.right.insert(e,t,n)),i.fixUp()}removeMin(){if(this.left.isEmpty())return zl.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let n,i=this;if(t(e,i.key)<0)i.left.isEmpty()||i.left.isRed()||i.left.left.isRed()||(i=i.moveRedLeft()),i=i.copy(null,null,null,i.left.remove(e,t),null);else{if(i.left.isRed()&&(i=i.rotateRight()),i.right.isEmpty()||i.right.isRed()||i.right.left.isRed()||(i=i.moveRedRight()),0===t(e,i.key)){if(i.right.isEmpty())return zl.EMPTY;n=i.right.min(),i=i.copy(n.key,n.value,null,null,i.right.removeMin())}i=i.copy(null,null,null,null,i.right.remove(e,t))}return i.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,zl.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,zl.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw il();if(this.right.isRed())throw il();const e=this.left.check();if(e!==this.right.check())throw il();return e+(this.isRed()?0:1)}}zl.EMPTY=null,zl.RED=!0,zl.BLACK=!1,zl.EMPTY=new class{constructor(){this.size=0}get key(){throw il()}get value(){throw il()}get color(){throw il()}get left(){throw il()}get right(){throw il()}copy(e,t,n,i,s){return this}insert(e,t,n){return new zl(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
class $l{constructor(e){this.comparator=e,this.data=new jl(this.comparator)}has(e){return null!==this.data.get(e)}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,n)=>(e(t),!1))}forEachInRange(e,t){const n=this.data.getIteratorFrom(e[0]);for(;n.hasNext();){const i=n.getNext();if(this.comparator(i.key,e[1])>=0)return;t(i.key)}}forEachWhile(e,t){let n;for(n=void 0!==t?this.data.getIteratorFrom(t):this.data.getIterator();n.hasNext();)if(!e(n.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new Wl(this.data.getIterator())}getIteratorFrom(e){return new Wl(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(e=>{t=t.add(e)}),t}isEqual(e){if(!(e instanceof $l))return!1;if(this.size!==e.size)return!1;const t=this.data.getIterator(),n=e.data.getIterator();for(;t.hasNext();){const e=t.getNext().key,i=n.getNext().key;if(0!==this.comparator(e,i))return!1}return!0}toArray(){const e=[];return this.forEach(t=>{e.push(t)}),e}toString(){const e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){const t=new $l(this.comparator);return t.data=e,t}}class Wl{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Hl{constructor(e){this.fields=e,e.sort(Sl.comparator)}static empty(){return new Hl([])}unionWith(e){let t=new $l(Sl.comparator);for(const n of this.fields)t=t.add(n);for(const n of e)t=t.add(n);return new Hl(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return wl(this.fields,e.fields,(e,t)=>e.isEqual(t))}}
/**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Kl extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Gl{constructor(e){this.binaryString=e}static fromBase64String(e){const t=function(e){try{return atob(e)}catch(t){throw"undefined"!=typeof DOMException&&t instanceof DOMException?new Kl("Invalid base64 string: "+t):t}}(e);return new Gl(t)}static fromUint8Array(e){const t=function(e){let t="";for(let n=0;n<e.length;++n)t+=String.fromCharCode(e[n]);return t}(e);return new Gl(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return e=this.binaryString,btoa(e);var e}toUint8Array(){return function(e){const t=new Uint8Array(e.length);for(let n=0;n<e.length;n++)t[n]=e.charCodeAt(n);return t}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return vl(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}Gl.EMPTY_BYTE_STRING=new Gl("");const Ql=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function Yl(e){if(sl(!!e),"string"==typeof e){let t=0;const n=Ql.exec(e);if(sl(!!n),n[1]){let e=n[1];e=(e+"000000000").substr(0,9),t=Number(e)}const i=new Date(e);return{seconds:Math.floor(i.getTime()/1e3),nanos:t}}return{seconds:Jl(e.seconds),nanos:Jl(e.nanos)}}function Jl(e){return"number"==typeof e?e:"string"==typeof e?Number(e):0}function Xl(e){return"string"==typeof e?Gl.fromBase64String(e):Gl.fromUint8Array(e)}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */function Zl(e){var t,n;return"server_timestamp"===(null===(n=((null===(t=null==e?void 0:e.mapValue)||void 0===t?void 0:t.fields)||{}).__type__)||void 0===n?void 0:n.stringValue)}function eu(e){const t=e.mapValue.fields.__previous_value__;return Zl(t)?eu(t):t}function tu(e){const t=Yl(e.mapValue.fields.__local_write_time__.timestampValue);return new Tl(t.seconds,t.nanos)}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class nu{constructor(e,t,n,i,s,r,o,a,c){this.databaseId=e,this.appId=t,this.persistenceKey=n,this.host=i,this.ssl=s,this.forceLongPolling=r,this.autoDetectLongPolling=o,this.longPollingOptions=a,this.useFetchStreams=c}}class iu{constructor(e,t){this.projectId=e,this.database=t||"(default)"}static empty(){return new iu("","")}get isDefaultDatabase(){return"(default)"===this.database}isEqual(e){return e instanceof iu&&e.projectId===this.projectId&&e.database===this.database}}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */const su={};function ru(e){return"nullValue"in e?0:"booleanValue"in e?1:"integerValue"in e||"doubleValue"in e?2:"timestampValue"in e?3:"stringValue"in e?5:"bytesValue"in e?6:"referenceValue"in e?7:"geoPointValue"in e?8:"arrayValue"in e?9:"mapValue"in e?Zl(e)?4:function(e){return"__max__"===(((e.mapValue||{}).fields||{}).__type__||{}).stringValue}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */(e)?9007199254740991:function(e){var t,n;return"__vector__"===(null===(n=((null===(t=null==e?void 0:e.mapValue)||void 0===t?void 0:t.fields)||{}).__type__)||void 0===n?void 0:n.stringValue)}(e)?10:11:il()}function ou(e,t){if(e===t)return!0;const n=ru(e);if(n!==ru(t))return!1;switch(n){case 0:case 9007199254740991:return!0;case 1:return e.booleanValue===t.booleanValue;case 4:return tu(e).isEqual(tu(t));case 3:return function(e,t){if("string"==typeof e.timestampValue&&"string"==typeof t.timestampValue&&e.timestampValue.length===t.timestampValue.length)return e.timestampValue===t.timestampValue;const n=Yl(e.timestampValue),i=Yl(t.timestampValue);return n.seconds===i.seconds&&n.nanos===i.nanos}(e,t);case 5:return e.stringValue===t.stringValue;case 6:return i=t,Xl(e.bytesValue).isEqual(Xl(i.bytesValue));case 7:return e.referenceValue===t.referenceValue;case 8:return function(e,t){return Jl(e.geoPointValue.latitude)===Jl(t.geoPointValue.latitude)&&Jl(e.geoPointValue.longitude)===Jl(t.geoPointValue.longitude)}(e,t);case 2:return function(e,t){if("integerValue"in e&&"integerValue"in t)return Jl(e.integerValue)===Jl(t.integerValue);if("doubleValue"in e&&"doubleValue"in t){const n=Jl(e.doubleValue),i=Jl(t.doubleValue);return n===i?Fl(n)===Fl(i):isNaN(n)&&isNaN(i)}return!1}(e,t);case 9:return wl(e.arrayValue.values||[],t.arrayValue.values||[],ou);case 10:case 11:return function(e,t){const n=e.mapValue.fields||{},i=t.mapValue.fields||{};if(Ul(n)!==Ul(i))return!1;for(const s in n)if(n.hasOwnProperty(s)&&(void 0===i[s]||!ou(n[s],i[s])))return!1;return!0}(e,t);default:return il()}var i}function au(e,t){return void 0!==(e.values||[]).find(e=>ou(e,t))}function cu(e,t){if(e===t)return 0;const n=ru(e),i=ru(t);if(n!==i)return vl(n,i);switch(n){case 0:case 9007199254740991:return 0;case 1:return vl(e.booleanValue,t.booleanValue);case 2:return function(e,t){const n=Jl(e.integerValue||e.doubleValue),i=Jl(t.integerValue||t.doubleValue);return n<i?-1:n>i?1:n===i?0:isNaN(n)?isNaN(i)?0:-1:1}(e,t);case 3:return hu(e.timestampValue,t.timestampValue);case 4:return hu(tu(e),tu(t));case 5:return vl(e.stringValue,t.stringValue);case 6:return function(e,t){const n=Xl(e),i=Xl(t);return n.compareTo(i)}(e.bytesValue,t.bytesValue);case 7:return function(e,t){const n=e.split("/"),i=t.split("/");for(let s=0;s<n.length&&s<i.length;s++){const e=vl(n[s],i[s]);if(0!==e)return e}return vl(n.length,i.length)}(e.referenceValue,t.referenceValue);case 8:return function(e,t){const n=vl(Jl(e.latitude),Jl(t.latitude));return 0!==n?n:vl(Jl(e.longitude),Jl(t.longitude))}(e.geoPointValue,t.geoPointValue);case 9:return lu(e.arrayValue,t.arrayValue);case 10:return function(e,t){var n,i,s,r;const o=e.fields||{},a=t.fields||{},c=null===(n=o.value)||void 0===n?void 0:n.arrayValue,h=null===(i=a.value)||void 0===i?void 0:i.arrayValue,l=vl((null===(s=null==c?void 0:c.values)||void 0===s?void 0:s.length)||0,(null===(r=null==h?void 0:h.values)||void 0===r?void 0:r.length)||0);return 0!==l?l:lu(c,h)}(e.mapValue,t.mapValue);case 11:return function(e,t){if(e===su&&t===su)return 0;if(e===su)return 1;if(t===su)return-1;const n=e.fields||{},i=Object.keys(n),s=t.fields||{},r=Object.keys(s);i.sort(),r.sort();for(let o=0;o<i.length&&o<r.length;++o){const e=vl(i[o],r[o]);if(0!==e)return e;const t=cu(n[i[o]],s[r[o]]);if(0!==t)return t}return vl(i.length,r.length)}(e.mapValue,t.mapValue);default:throw il()}}function hu(e,t){if("string"==typeof e&&"string"==typeof t&&e.length===t.length)return vl(e,t);const n=Yl(e),i=Yl(t),s=vl(n.seconds,i.seconds);return 0!==s?s:vl(n.nanos,i.nanos)}function lu(e,t){const n=e.values||[],i=t.values||[];for(let s=0;s<n.length&&s<i.length;++s){const e=cu(n[s],i[s]);if(e)return e}return vl(n.length,i.length)}function uu(e){return du(e)}function du(e){return"nullValue"in e?"null":"booleanValue"in e?""+e.booleanValue:"integerValue"in e?""+e.integerValue:"doubleValue"in e?""+e.doubleValue:"timestampValue"in e?function(e){const t=Yl(e);return`time(${t.seconds},${t.nanos})`}(e.timestampValue):"stringValue"in e?e.stringValue:"bytesValue"in e?Xl(e.bytesValue).toBase64():"referenceValue"in e?function(e){return kl.fromName(e).toString()}(e.referenceValue):"geoPointValue"in e?function(e){return`geo(${e.latitude},${e.longitude})`}(e.geoPointValue):"arrayValue"in e?function(e){let t="[",n=!0;for(const i of e.values||[])n?n=!1:t+=",",t+=du(i);return t+"]"}(e.arrayValue):"mapValue"in e?function(e){const t=Object.keys(e.fields||{}).sort();let n="{",i=!0;for(const s of t)i?i=!1:n+=",",n+=`${s}:${du(e.fields[s])}`;return n+"}"}(e.mapValue):il()}function fu(e,t){return{referenceValue:`projects/${e.projectId}/databases/${e.database}/documents/${t.path.canonicalString()}`}}function pu(e){return!!e&&"integerValue"in e}function gu(e){return!!e&&"arrayValue"in e}function mu(e){return!!e&&"nullValue"in e}function _u(e){return!!e&&"doubleValue"in e&&isNaN(Number(e.doubleValue))}function yu(e){return!!e&&"mapValue"in e}function vu(e){if(e.geoPointValue)return{geoPointValue:Object.assign({},e.geoPointValue)};if(e.timestampValue&&"object"==typeof e.timestampValue)return{timestampValue:Object.assign({},e.timestampValue)};if(e.mapValue){const t={mapValue:{fields:{}}};return Vl(e.mapValue.fields,(e,n)=>t.mapValue.fields[e]=vu(n)),t}if(e.arrayValue){const t={arrayValue:{values:[]}};for(let n=0;n<(e.arrayValue.values||[]).length;++n)t.arrayValue.values[n]=vu(e.arrayValue.values[n]);return t}return Object.assign({},e)}class wu{constructor(e){this.value=e}static empty(){return new wu({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let n=0;n<e.length-1;++n)if(t=(t.mapValue.fields||{})[e.get(n)],!yu(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=vu(t)}setAll(e){let t=Sl.emptyPath(),n={},i=[];e.forEach((e,s)=>{if(!t.isImmediateParentOf(s)){const e=this.getFieldsMap(t);this.applyChanges(e,n,i),n={},i=[],t=s.popLast()}e?n[s.lastSegment()]=vu(e):i.push(s.lastSegment())});const s=this.getFieldsMap(t);this.applyChanges(s,n,i)}delete(e){const t=this.field(e.popLast());yu(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return ou(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let n=0;n<e.length;++n){let i=t.mapValue.fields[e.get(n)];yu(i)&&i.mapValue.fields||(i={mapValue:{fields:{}}},t.mapValue.fields[e.get(n)]=i),t=i}return t.mapValue.fields}applyChanges(e,t,n){Vl(t,(t,n)=>e[t]=n);for(const i of n)delete e[i]}clone(){return new wu(vu(this.value))}}function Tu(e){const t=[];return Vl(e.fields,(e,n)=>{const i=new Sl([e]);if(yu(n)){const e=Tu(n.mapValue).fields;if(0===e.length)t.push(i);else for(const n of e)t.push(i.child(n))}else t.push(i)}),new Hl(t)
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */}class Iu{constructor(e,t,n,i,s,r,o){this.key=e,this.documentType=t,this.version=n,this.readTime=i,this.createTime=s,this.data=r,this.documentState=o}static newInvalidDocument(e){return new Iu(e,0,Il.min(),Il.min(),Il.min(),wu.empty(),0)}static newFoundDocument(e,t,n,i){return new Iu(e,1,t,Il.min(),n,i,0)}static newNoDocument(e,t){return new Iu(e,2,t,Il.min(),Il.min(),wu.empty(),0)}static newUnknownDocument(e,t){return new Iu(e,3,t,Il.min(),Il.min(),wu.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(Il.min())||2!==this.documentType&&0!==this.documentType||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=wu.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=wu.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=Il.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return 1===this.documentState}get hasCommittedMutations(){return 2===this.documentState}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return 0!==this.documentType}isFoundDocument(){return 1===this.documentType}isNoDocument(){return 2===this.documentType}isUnknownDocument(){return 3===this.documentType}isEqual(e){return e instanceof Iu&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new Iu(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}
/**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class bu{constructor(e,t){this.position=e,this.inclusive=t}}function Cu(e,t,n){let i=0;for(let s=0;s<e.position.length;s++){const r=t[s],o=e.position[s];if(i=r.field.isKeyField()?kl.comparator(kl.fromName(o.referenceValue),n.key):cu(o,n.data.field(r.field)),"desc"===r.dir&&(i*=-1),0!==i)break}return i}function Eu(e,t){if(null===e)return null===t;if(null===t)return!1;if(e.inclusive!==t.inclusive||e.position.length!==t.position.length)return!1;for(let n=0;n<e.position.length;n++)if(!ou(e.position[n],t.position[n]))return!1;return!0}
/**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Su{constructor(e,t="asc"){this.field=e,this.dir=t}}function ku(e,t){return e.dir===t.dir&&e.field.isEqual(t.field)}
/**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Nu{}class Au extends Nu{constructor(e,t,n){super(),this.field=e,this.op=t,this.value=n}static create(e,t,n){return e.isKeyField()?"in"===t||"not-in"===t?this.createKeyFieldInFilter(e,t,n):new Mu(e,t,n):"array-contains"===t?new qu(e,n):"in"===t?new ju(e,n):"not-in"===t?new Bu(e,n):"array-contains-any"===t?new zu(e,n):new Au(e,t,n)}static createKeyFieldInFilter(e,t,n){return"in"===t?new Fu(e,n):new Uu(e,n)}matches(e){const t=e.data.field(this.field);return"!="===this.op?null!==t&&this.matchesComparison(cu(t,this.value)):null!==t&&ru(this.value)===ru(t)&&this.matchesComparison(cu(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return 0===e;case"!=":return 0!==e;case">":return e>0;case">=":return e>=0;default:return il()}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class Ru extends Nu{constructor(e,t){super(),this.filters=e,this.op=t,this.ae=null}static create(e,t){return new Ru(e,t)}matches(e){return Pu(this)?void 0===this.filters.find(t=>!t.matches(e)):void 0!==this.filters.find(t=>t.matches(e))}getFlattenedFilters(){return null!==this.ae||(this.ae=this.filters.reduce((e,t)=>e.concat(t.getFlattenedFilters()),[])),this.ae}getFilters(){return Object.assign([],this.filters)}}function Pu(e){return"and"===e.op}function Du(e){return function(e){for(const t of e.filters)if(t instanceof Ru)return!1;return!0}(e)&&Pu(e)}function xu(e){if(e instanceof Au)return e.field.canonicalString()+e.op.toString()+uu(e.value);if(Du(e))return e.filters.map(e=>xu(e)).join(",");{const t=e.filters.map(e=>xu(e)).join(",");return`${e.op}(${t})`}}function Ou(e,t){return e instanceof Au?(n=e,(i=t)instanceof Au&&n.op===i.op&&n.field.isEqual(i.field)&&ou(n.value,i.value)):e instanceof Ru?function(e,t){return t instanceof Ru&&e.op===t.op&&e.filters.length===t.filters.length&&e.filters.reduce((e,n,i)=>e&&Ou(n,t.filters[i]),!0)}(e,t):void il();var n,i}function Lu(e){return e instanceof Au?`${(t=e).field.canonicalString()} ${t.op} ${uu(t.value)}`:e instanceof Ru?function(e){return e.op.toString()+" {"+e.getFilters().map(Lu).join(" ,")+"}"}(e):"Filter";var t}class Mu extends Au{constructor(e,t,n){super(e,t,n),this.key=kl.fromName(n.referenceValue)}matches(e){const t=kl.comparator(e.key,this.key);return this.matchesComparison(t)}}class Fu extends Au{constructor(e,t){super(e,"in",t),this.keys=Vu("in",t)}matches(e){return this.keys.some(t=>t.isEqual(e.key))}}class Uu extends Au{constructor(e,t){super(e,"not-in",t),this.keys=Vu("not-in",t)}matches(e){return!this.keys.some(t=>t.isEqual(e.key))}}function Vu(e,t){var n;return((null===(n=t.arrayValue)||void 0===n?void 0:n.values)||[]).map(e=>kl.fromName(e.referenceValue))}class qu extends Au{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return gu(t)&&au(t.arrayValue,this.value)}}class ju extends Au{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return null!==t&&au(this.value.arrayValue,t)}}class Bu extends Au{constructor(e,t){super(e,"not-in",t)}matches(e){if(au(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return null!==t&&!au(this.value.arrayValue,t)}}class zu extends Au{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!gu(t)||!t.arrayValue.values)&&t.arrayValue.values.some(e=>au(this.value.arrayValue,e))}}
/**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class $u{constructor(e,t=null,n=[],i=[],s=null,r=null,o=null){this.path=e,this.collectionGroup=t,this.orderBy=n,this.filters=i,this.limit=s,this.startAt=r,this.endAt=o,this.ue=null}}function Wu(e,t=null,n=[],i=[],s=null,r=null,o=null){return new $u(e,t,n,i,s,r,o)}function Hu(e){const t=rl(e);if(null===t.ue){let e=t.path.canonicalString();null!==t.collectionGroup&&(e+="|cg:"+t.collectionGroup),e+="|f:",e+=t.filters.map(e=>xu(e)).join(","),e+="|ob:",e+=t.orderBy.map(e=>{return(t=e).field.canonicalString()+t.dir;var t}).join(","),Ml(t.limit)||(e+="|l:",e+=t.limit),t.startAt&&(e+="|lb:",e+=t.startAt.inclusive?"b:":"a:",e+=t.startAt.position.map(e=>uu(e)).join(",")),t.endAt&&(e+="|ub:",e+=t.endAt.inclusive?"a:":"b:",e+=t.endAt.position.map(e=>uu(e)).join(",")),t.ue=e}return t.ue}function Ku(e,t){if(e.limit!==t.limit)return!1;if(e.orderBy.length!==t.orderBy.length)return!1;for(let n=0;n<e.orderBy.length;n++)if(!ku(e.orderBy[n],t.orderBy[n]))return!1;if(e.filters.length!==t.filters.length)return!1;for(let n=0;n<e.filters.length;n++)if(!Ou(e.filters[n],t.filters[n]))return!1;return e.collectionGroup===t.collectionGroup&&!!e.path.isEqual(t.path)&&!!Eu(e.startAt,t.startAt)&&Eu(e.endAt,t.endAt)}function Gu(e){return kl.isDocumentKey(e.path)&&null===e.collectionGroup&&0===e.filters.length}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Qu{constructor(e,t=null,n=[],i=[],s=null,r="F",o=null,a=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=n,this.filters=i,this.limit=s,this.limitType=r,this.startAt=o,this.endAt=a,this.ce=null,this.le=null,this.he=null,this.startAt,this.endAt}}function Yu(e){return new Qu(e)}function Ju(e){return 0===e.filters.length&&null===e.limit&&null==e.startAt&&null==e.endAt&&(0===e.explicitOrderBy.length||1===e.explicitOrderBy.length&&e.explicitOrderBy[0].field.isKeyField())}function Xu(e){return null!==e.collectionGroup}function Zu(e){const t=rl(e);if(null===t.ce){t.ce=[];const e=new Set;for(const i of t.explicitOrderBy)t.ce.push(i),e.add(i.field.canonicalString());const n=t.explicitOrderBy.length>0?t.explicitOrderBy[t.explicitOrderBy.length-1].dir:"asc";(function(e){let t=new $l(Sl.comparator);return e.filters.forEach(e=>{e.getFlattenedFilters().forEach(e=>{e.isInequality()&&(t=t.add(e.field))})}),t})(t).forEach(i=>{e.has(i.canonicalString())||i.isKeyField()||t.ce.push(new Su(i,n))}),e.has(Sl.keyField().canonicalString())||t.ce.push(new Su(Sl.keyField(),n))}return t.ce}function ed(e){const t=rl(e);return t.le||(t.le=function(e,t){if("F"===e.limitType)return Wu(e.path,e.collectionGroup,t,e.filters,e.limit,e.startAt,e.endAt);{t=t.map(e=>{const t="desc"===e.dir?"asc":"desc";return new Su(e.field,t)});const n=e.endAt?new bu(e.endAt.position,e.endAt.inclusive):null,i=e.startAt?new bu(e.startAt.position,e.startAt.inclusive):null;return Wu(e.path,e.collectionGroup,t,e.filters,e.limit,n,i)}}(t,Zu(e))),t.le}function td(e,t){const n=e.filters.concat([t]);return new Qu(e.path,e.collectionGroup,e.explicitOrderBy.slice(),n,e.limit,e.limitType,e.startAt,e.endAt)}function nd(e,t,n){return new Qu(e.path,e.collectionGroup,e.explicitOrderBy.slice(),e.filters.slice(),t,n,e.startAt,e.endAt)}function id(e,t){return Ku(ed(e),ed(t))&&e.limitType===t.limitType}function sd(e){return`${Hu(ed(e))}|lt:${e.limitType}`}function rd(e){return`Query(target=${function(e){let t=e.path.canonicalString();return null!==e.collectionGroup&&(t+=" collectionGroup="+e.collectionGroup),e.filters.length>0&&(t+=`, filters: [${e.filters.map(e=>Lu(e)).join(", ")}]`),Ml(e.limit)||(t+=", limit: "+e.limit),e.orderBy.length>0&&(t+=`, orderBy: [${e.orderBy.map(e=>{return`${(t=e).field.canonicalString()} (${t.dir})`;var t}).join(", ")}]`),e.startAt&&(t+=", startAt: ",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map(e=>uu(e)).join(",")),e.endAt&&(t+=", endAt: ",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map(e=>uu(e)).join(",")),`Target(${t})`}(ed(e))}; limitType=${e.limitType})`}function od(e,t){return t.isFoundDocument()&&function(e,t){const n=t.key.path;return null!==e.collectionGroup?t.key.hasCollectionId(e.collectionGroup)&&e.path.isPrefixOf(n):kl.isDocumentKey(e.path)?e.path.isEqual(n):e.path.isImmediateParentOf(n)}(e,t)&&function(e,t){for(const n of Zu(e))if(!n.field.isKeyField()&&null===t.data.field(n.field))return!1;return!0}(e,t)&&function(e,t){for(const n of e.filters)if(!n.matches(t))return!1;return!0}(e,t)&&(i=t,!((n=e).startAt&&!function(e,t,n){const i=Cu(e,t,n);return e.inclusive?i<=0:i<0}(n.startAt,Zu(n),i)||n.endAt&&!function(e,t,n){const i=Cu(e,t,n);return e.inclusive?i>=0:i>0}(n.endAt,Zu(n),i)));var n,i}function ad(e){return(t,n)=>{let i=!1;for(const s of Zu(e)){const e=cd(s,t,n);if(0!==e)return e;i=i||s.field.isKeyField()}return 0}}function cd(e,t,n){const i=e.field.isKeyField()?kl.comparator(t.key,n.key):function(e,t,n){const i=t.data.field(e),s=n.data.field(e);return null!==i&&null!==s?cu(i,s):il()}(e.field,t,n);switch(e.dir){case"asc":return i;case"desc":return-1*i;default:return il()}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class hd{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),n=this.inner[t];if(void 0!==n)for(const[i,s]of n)if(this.equalsFn(i,e))return s}has(e){return void 0!==this.get(e)}set(e,t){const n=this.mapKeyFn(e),i=this.inner[n];if(void 0===i)return this.inner[n]=[[e,t]],void this.innerSize++;for(let s=0;s<i.length;s++)if(this.equalsFn(i[s][0],e))return void(i[s]=[e,t]);i.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),n=this.inner[t];if(void 0===n)return!1;for(let i=0;i<n.length;i++)if(this.equalsFn(n[i][0],e))return 1===n.length?delete this.inner[t]:n.splice(i,1),this.innerSize--,!0;return!1}forEach(e){Vl(this.inner,(t,n)=>{for(const[i,s]of n)e(i,s)})}isEmpty(){return ql(this.inner)}size(){return this.innerSize}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */const ld=new jl(kl.comparator);function ud(){return ld}const dd=new jl(kl.comparator);function fd(...e){let t=dd;for(const n of e)t=t.insert(n.key,n);return t}function pd(e){let t=dd;return e.forEach((e,n)=>t=t.insert(e,n.overlayedDocument)),t}function gd(){return _d()}function md(){return _d()}function _d(){return new hd(e=>e.toString(),(e,t)=>e.isEqual(t))}const yd=new jl(kl.comparator),vd=new $l(kl.comparator);function wd(...e){let t=vd;for(const n of e)t=t.add(n);return t}const Td=new $l(vl);
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
function Id(e,t){if(e.useProto3Json){if(isNaN(t))return{doubleValue:"NaN"};if(t===1/0)return{doubleValue:"Infinity"};if(t===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Fl(t)?"-0":t}}function bd(e){return{integerValue:""+e}}function Cd(e,t){return function(e){return"number"==typeof e&&Number.isInteger(e)&&!Fl(e)&&e<=Number.MAX_SAFE_INTEGER&&e>=Number.MIN_SAFE_INTEGER}(t)?bd(t):Id(e,t)}
/**
   * @license
   * Copyright 2018 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Ed{constructor(){this._=void 0}}function Sd(e,t,n){return e instanceof Ad?function(e,t){const n={fields:{__type__:{stringValue:"server_timestamp"},__local_write_time__:{timestampValue:{seconds:e.seconds,nanos:e.nanoseconds}}}};return t&&Zl(t)&&(t=eu(t)),t&&(n.fields.__previous_value__=t),{mapValue:n}}(n,t):e instanceof Rd?Pd(e,t):e instanceof Dd?xd(e,t):function(e,t){const n=Nd(e,t),i=Ld(n)+Ld(e.Pe);return pu(n)&&pu(e.Pe)?bd(i):Id(e.serializer,i)}(e,t)}function kd(e,t,n){return e instanceof Rd?Pd(e,t):e instanceof Dd?xd(e,t):n}function Nd(e,t){return e instanceof Od?pu(n=t)||(i=n)&&"doubleValue"in i?t:{integerValue:0}:null;var n,i}class Ad extends Ed{}class Rd extends Ed{constructor(e){super(),this.elements=e}}function Pd(e,t){const n=Md(t);for(const i of e.elements)n.some(e=>ou(e,i))||n.push(i);return{arrayValue:{values:n}}}class Dd extends Ed{constructor(e){super(),this.elements=e}}function xd(e,t){let n=Md(t);for(const i of e.elements)n=n.filter(e=>!ou(e,i));return{arrayValue:{values:n}}}class Od extends Ed{constructor(e,t){super(),this.serializer=e,this.Pe=t}}function Ld(e){return Jl(e.integerValue||e.doubleValue)}function Md(e){return gu(e)&&e.arrayValue.values?e.arrayValue.values.slice():[]}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Fd{constructor(e,t){this.field=e,this.transform=t}}class Ud{constructor(e,t){this.version=e,this.transformResults=t}}class Vd{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new Vd}static exists(e){return new Vd(void 0,e)}static updateTime(e){return new Vd(e)}get isNone(){return void 0===this.updateTime&&void 0===this.exists}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function qd(e,t){return void 0!==e.updateTime?t.isFoundDocument()&&t.version.isEqual(e.updateTime):void 0===e.exists||e.exists===t.isFoundDocument()}class jd{}function Bd(e,t){if(!e.hasLocalMutations||t&&0===t.fields.length)return null;if(null===t)return e.isNoDocument()?new Xd(e.key,Vd.none()):new Kd(e.key,e.data,Vd.none());{const n=e.data,i=wu.empty();let s=new $l(Sl.comparator);for(let e of t.fields)if(!s.has(e)){let t=n.field(e);null===t&&e.length>1&&(e=e.popLast(),t=n.field(e)),null===t?i.delete(e):i.set(e,t),s=s.add(e)}return new Gd(e.key,i,new Hl(s.toArray()),Vd.none())}}function zd(e,t,n){var i;e instanceof Kd?function(e,t,n){const i=e.value.clone(),s=Yd(e.fieldTransforms,t,n.transformResults);i.setAll(s),t.convertToFoundDocument(n.version,i).setHasCommittedMutations()}(e,t,n):e instanceof Gd?function(e,t,n){if(!qd(e.precondition,t))return void t.convertToUnknownDocument(n.version);const i=Yd(e.fieldTransforms,t,n.transformResults),s=t.data;s.setAll(Qd(e)),s.setAll(i),t.convertToFoundDocument(n.version,s).setHasCommittedMutations()}(e,t,n):(i=n,t.convertToNoDocument(i.version).setHasCommittedMutations())}function $d(e,t,n,i){return e instanceof Kd?function(e,t,n,i){if(!qd(e.precondition,t))return n;const s=e.value.clone(),r=Jd(e.fieldTransforms,i,t);return s.setAll(r),t.convertToFoundDocument(t.version,s).setHasLocalMutations(),null}(e,t,n,i):e instanceof Gd?function(e,t,n,i){if(!qd(e.precondition,t))return n;const s=Jd(e.fieldTransforms,i,t),r=t.data;return r.setAll(Qd(e)),r.setAll(s),t.convertToFoundDocument(t.version,r).setHasLocalMutations(),null===n?null:n.unionWith(e.fieldMask.fields).unionWith(e.fieldTransforms.map(e=>e.field))}(e,t,n,i):(s=t,r=n,qd(e.precondition,s)?(s.convertToNoDocument(s.version).setHasLocalMutations(),null):r);var s,r}function Wd(e,t){let n=null;for(const i of e.fieldTransforms){const e=t.data.field(i.field),s=Nd(i.transform,e||null);null!=s&&(null===n&&(n=wu.empty()),n.set(i.field,s))}return n||null}function Hd(e,t){return e.type===t.type&&!!e.key.isEqual(t.key)&&!!e.precondition.isEqual(t.precondition)&&(n=e.fieldTransforms,i=t.fieldTransforms,!!(void 0===n&&void 0===i||n&&i&&wl(n,i,(e,t)=>function(e,t){return e.field.isEqual(t.field)&&(n=e.transform,i=t.transform,n instanceof Rd&&i instanceof Rd||n instanceof Dd&&i instanceof Dd?wl(n.elements,i.elements,ou):n instanceof Od&&i instanceof Od?ou(n.Pe,i.Pe):n instanceof Ad&&i instanceof Ad);var n,i}(e,t)))&&(0===e.type?e.value.isEqual(t.value):1!==e.type||e.data.isEqual(t.data)&&e.fieldMask.isEqual(t.fieldMask)));var n,i}class Kd extends jd{constructor(e,t,n,i=[]){super(),this.key=e,this.value=t,this.precondition=n,this.fieldTransforms=i,this.type=0}getFieldMask(){return null}}class Gd extends jd{constructor(e,t,n,i,s=[]){super(),this.key=e,this.data=t,this.fieldMask=n,this.precondition=i,this.fieldTransforms=s,this.type=1}getFieldMask(){return this.fieldMask}}function Qd(e){const t=new Map;return e.fieldMask.fields.forEach(n=>{if(!n.isEmpty()){const i=e.data.field(n);t.set(n,i)}}),t}function Yd(e,t,n){const i=new Map;sl(e.length===n.length);for(let s=0;s<n.length;s++){const r=e[s],o=r.transform,a=t.data.field(r.field);i.set(r.field,kd(o,a,n[s]))}return i}function Jd(e,t,n){const i=new Map;for(const s of e){const e=s.transform,r=n.data.field(s.field);i.set(s.field,Sd(e,r,t))}return i}class Xd extends jd{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class Zd extends jd{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class ef{constructor(e,t,n,i){this.batchId=e,this.localWriteTime=t,this.baseMutations=n,this.mutations=i}applyToRemoteDocument(e,t){const n=t.mutationResults;for(let i=0;i<this.mutations.length;i++){const t=this.mutations[i];t.key.isEqual(e.key)&&zd(t,e,n[i])}}applyToLocalView(e,t){for(const n of this.baseMutations)n.key.isEqual(e.key)&&(t=$d(n,e,t,this.localWriteTime));for(const n of this.mutations)n.key.isEqual(e.key)&&(t=$d(n,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const n=md();return this.mutations.forEach(i=>{const s=e.get(i.key),r=s.overlayedDocument;let o=this.applyToLocalView(r,s.mutatedFields);o=t.has(i.key)?null:o;const a=Bd(r,o);null!==a&&n.set(i.key,a),r.isValidDocument()||r.convertToNoDocument(Il.min())}),n}keys(){return this.mutations.reduce((e,t)=>e.add(t.key),wd())}isEqual(e){return this.batchId===e.batchId&&wl(this.mutations,e.mutations,(e,t)=>Hd(e,t))&&wl(this.baseMutations,e.baseMutations,(e,t)=>Hd(e,t))}}class tf{constructor(e,t,n,i){this.batch=e,this.commitVersion=t,this.mutationResults=n,this.docVersions=i}static from(e,t,n){sl(e.mutations.length===n.length);let i=function(){return yd}();const s=e.mutations;for(let r=0;r<s.length;r++)i=i.insert(s[r].key,n[r].version);return new tf(e,t,n,i)}}
/**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class nf{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return null!==e&&this.mutation===e.mutation}toString(){return`Overlay{\n      largestBatchId: ${this.largestBatchId},\n      mutation: ${this.mutation.toString()}\n    }`}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class sf{constructor(e,t){this.count=e,this.unchangedNames=t}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */var rf,of;function af(e){if(void 0===e)return el("GRPC error has no .code"),ol.UNKNOWN;switch(e){case rf.OK:return ol.OK;case rf.CANCELLED:return ol.CANCELLED;case rf.UNKNOWN:return ol.UNKNOWN;case rf.DEADLINE_EXCEEDED:return ol.DEADLINE_EXCEEDED;case rf.RESOURCE_EXHAUSTED:return ol.RESOURCE_EXHAUSTED;case rf.INTERNAL:return ol.INTERNAL;case rf.UNAVAILABLE:return ol.UNAVAILABLE;case rf.UNAUTHENTICATED:return ol.UNAUTHENTICATED;case rf.INVALID_ARGUMENT:return ol.INVALID_ARGUMENT;case rf.NOT_FOUND:return ol.NOT_FOUND;case rf.ALREADY_EXISTS:return ol.ALREADY_EXISTS;case rf.PERMISSION_DENIED:return ol.PERMISSION_DENIED;case rf.FAILED_PRECONDITION:return ol.FAILED_PRECONDITION;case rf.ABORTED:return ol.ABORTED;case rf.OUT_OF_RANGE:return ol.OUT_OF_RANGE;case rf.UNIMPLEMENTED:return ol.UNIMPLEMENTED;case rf.DATA_LOSS:return ol.DATA_LOSS;default:return il()}}(of=rf||(rf={}))[of.OK=0]="OK",of[of.CANCELLED=1]="CANCELLED",of[of.UNKNOWN=2]="UNKNOWN",of[of.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",of[of.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",of[of.NOT_FOUND=5]="NOT_FOUND",of[of.ALREADY_EXISTS=6]="ALREADY_EXISTS",of[of.PERMISSION_DENIED=7]="PERMISSION_DENIED",of[of.UNAUTHENTICATED=16]="UNAUTHENTICATED",of[of.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",of[of.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",of[of.ABORTED=10]="ABORTED",of[of.OUT_OF_RANGE=11]="OUT_OF_RANGE",of[of.UNIMPLEMENTED=12]="UNIMPLEMENTED",of[of.INTERNAL=13]="INTERNAL",of[of.UNAVAILABLE=14]="UNAVAILABLE",of[of.DATA_LOSS=15]="DATA_LOSS";
/**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
const cf=new Mh([4294967295,4294967295],0);function hf(e){const t=(new TextEncoder).encode(e),n=new Fh;return n.update(t),new Uint8Array(n.digest())}function lf(e){const t=new DataView(e.buffer),n=t.getUint32(0,!0),i=t.getUint32(4,!0),s=t.getUint32(8,!0),r=t.getUint32(12,!0);return[new Mh([n,i],0),new Mh([s,r],0)]}class uf{constructor(e,t,n){if(this.bitmap=e,this.padding=t,this.hashCount=n,t<0||t>=8)throw new df(`Invalid padding: ${t}`);if(n<0)throw new df(`Invalid hash count: ${n}`);if(e.length>0&&0===this.hashCount)throw new df(`Invalid hash count: ${n}`);if(0===e.length&&0!==t)throw new df(`Invalid padding when bitmap length is 0: ${t}`);this.Ie=8*e.length-t,this.Te=Mh.fromNumber(this.Ie)}Ee(e,t,n){let i=e.add(t.multiply(Mh.fromNumber(n)));return 1===i.compare(cf)&&(i=new Mh([i.getBits(0),i.getBits(1)],0)),i.modulo(this.Te).toNumber()}de(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(0===this.Ie)return!1;const t=hf(e),[n,i]=lf(t);for(let s=0;s<this.hashCount;s++){const e=this.Ee(n,i,s);if(!this.de(e))return!1}return!0}static create(e,t,n){const i=e%8==0?0:8-e%8,s=new Uint8Array(Math.ceil(e/8)),r=new uf(s,i,t);return n.forEach(e=>r.insert(e)),r}insert(e){if(0===this.Ie)return;const t=hf(e),[n,i]=lf(t);for(let s=0;s<this.hashCount;s++){const e=this.Ee(n,i,s);this.Ae(e)}}Ae(e){const t=Math.floor(e/8),n=e%8;this.bitmap[t]|=1<<n}}class df extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class ff{constructor(e,t,n,i,s){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=n,this.documentUpdates=i,this.resolvedLimboDocuments=s}static createSynthesizedRemoteEventForCurrentChange(e,t,n){const i=new Map;return i.set(e,pf.createSynthesizedTargetChangeForCurrentChange(e,t,n)),new ff(Il.min(),i,new jl(vl),ud(),wd())}}class pf{constructor(e,t,n,i,s){this.resumeToken=e,this.current=t,this.addedDocuments=n,this.modifiedDocuments=i,this.removedDocuments=s}static createSynthesizedTargetChangeForCurrentChange(e,t,n){return new pf(n,t,wd(),wd(),wd())}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class gf{constructor(e,t,n,i){this.Re=e,this.removedTargetIds=t,this.key=n,this.Ve=i}}class mf{constructor(e,t){this.targetId=e,this.me=t}}class _f{constructor(e,t,n=Gl.EMPTY_BYTE_STRING,i=null){this.state=e,this.targetIds=t,this.resumeToken=n,this.cause=i}}class yf{constructor(){this.fe=0,this.ge=Tf(),this.pe=Gl.EMPTY_BYTE_STRING,this.ye=!1,this.we=!0}get current(){return this.ye}get resumeToken(){return this.pe}get Se(){return 0!==this.fe}get be(){return this.we}De(e){e.approximateByteSize()>0&&(this.we=!0,this.pe=e)}ve(){let e=wd(),t=wd(),n=wd();return this.ge.forEach((i,s)=>{switch(s){case 0:e=e.add(i);break;case 2:t=t.add(i);break;case 1:n=n.add(i);break;default:il()}}),new pf(this.pe,this.ye,e,t,n)}Ce(){this.we=!1,this.ge=Tf()}Fe(e,t){this.we=!0,this.ge=this.ge.insert(e,t)}Me(e){this.we=!0,this.ge=this.ge.remove(e)}xe(){this.fe+=1}Oe(){this.fe-=1,sl(this.fe>=0)}Ne(){this.we=!0,this.ye=!0}}class vf{constructor(e){this.Le=e,this.Be=new Map,this.ke=ud(),this.qe=wf(),this.Qe=new jl(vl)}Ke(e){for(const t of e.Re)e.Ve&&e.Ve.isFoundDocument()?this.$e(t,e.Ve):this.Ue(t,e.key,e.Ve);for(const t of e.removedTargetIds)this.Ue(t,e.key,e.Ve)}We(e){this.forEachTarget(e,t=>{const n=this.Ge(t);switch(e.state){case 0:this.ze(t)&&n.De(e.resumeToken);break;case 1:n.Oe(),n.Se||n.Ce(),n.De(e.resumeToken);break;case 2:n.Oe(),n.Se||this.removeTarget(t);break;case 3:this.ze(t)&&(n.Ne(),n.De(e.resumeToken));break;case 4:this.ze(t)&&(this.je(t),n.De(e.resumeToken));break;default:il()}})}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.Be.forEach((e,n)=>{this.ze(n)&&t(n)})}He(e){const t=e.targetId,n=e.me.count,i=this.Je(t);if(i){const s=i.target;if(Gu(s))if(0===n){const e=new kl(s.path);this.Ue(t,e,Iu.newNoDocument(e,Il.min()))}else sl(1===n);else{const i=this.Ye(t);if(i!==n){const n=this.Ze(e),s=n?this.Xe(n,e,i):1;if(0!==s){this.je(t);const e=2===s?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Qe=this.Qe.insert(t,e)}}}}}Ze(e){const t=e.me.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:n="",padding:i=0},hashCount:s=0}=t;let r,o;try{r=Xl(n).toUint8Array()}catch(a){if(a instanceof Kl)return tl("Decoding the base64 bloom filter in existence filter failed ("+a.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw a}try{o=new uf(r,i,s)}catch(a){return tl(a instanceof df?"BloomFilter error: ":"Applying bloom filter failed: ",a),null}return 0===o.Ie?null:o}Xe(e,t,n){return t.me.count===n-this.nt(e,t.targetId)?0:2}nt(e,t){const n=this.Le.getRemoteKeysForTarget(t);let i=0;return n.forEach(n=>{const s=this.Le.tt(),r=`projects/${s.projectId}/databases/${s.database}/documents/${n.path.canonicalString()}`;e.mightContain(r)||(this.Ue(t,n,null),i++)}),i}rt(e){const t=new Map;this.Be.forEach((n,i)=>{const s=this.Je(i);if(s){if(n.current&&Gu(s.target)){const t=new kl(s.target.path);null!==this.ke.get(t)||this.it(i,t)||this.Ue(i,t,Iu.newNoDocument(t,e))}n.be&&(t.set(i,n.ve()),n.Ce())}});let n=wd();this.qe.forEach((e,t)=>{let i=!0;t.forEachWhile(e=>{const t=this.Je(e);return!t||"TargetPurposeLimboResolution"===t.purpose||(i=!1,!1)}),i&&(n=n.add(e))}),this.ke.forEach((t,n)=>n.setReadTime(e));const i=new ff(e,t,this.Qe,this.ke,n);return this.ke=ud(),this.qe=wf(),this.Qe=new jl(vl),i}$e(e,t){if(!this.ze(e))return;const n=this.it(e,t.key)?2:0;this.Ge(e).Fe(t.key,n),this.ke=this.ke.insert(t.key,t),this.qe=this.qe.insert(t.key,this.st(t.key).add(e))}Ue(e,t,n){if(!this.ze(e))return;const i=this.Ge(e);this.it(e,t)?i.Fe(t,1):i.Me(t),this.qe=this.qe.insert(t,this.st(t).delete(e)),n&&(this.ke=this.ke.insert(t,n))}removeTarget(e){this.Be.delete(e)}Ye(e){const t=this.Ge(e).ve();return this.Le.getRemoteKeysForTarget(e).size+t.addedDocuments.size-t.removedDocuments.size}xe(e){this.Ge(e).xe()}Ge(e){let t=this.Be.get(e);return t||(t=new yf,this.Be.set(e,t)),t}st(e){let t=this.qe.get(e);return t||(t=new $l(vl),this.qe=this.qe.insert(e,t)),t}ze(e){const t=null!==this.Je(e);return t||Zh("WatchChangeAggregator","Detected inactive target",e),t}Je(e){const t=this.Be.get(e);return t&&t.Se?null:this.Le.ot(e)}je(e){this.Be.set(e,new yf),this.Le.getRemoteKeysForTarget(e).forEach(t=>{this.Ue(e,t,null)})}it(e,t){return this.Le.getRemoteKeysForTarget(e).has(t)}}function wf(){return new jl(kl.comparator)}function Tf(){return new jl(kl.comparator)}const If=(()=>({asc:"ASCENDING",desc:"DESCENDING"}))(),bf=(()=>({"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"}))(),Cf=(()=>({and:"AND",or:"OR"}))();class Ef{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function Sf(e,t){return e.useProto3Json||Ml(t)?t:{value:t}}function kf(e,t){return e.useProto3Json?`${new Date(1e3*t.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+t.nanoseconds).slice(-9)}Z`:{seconds:""+t.seconds,nanos:t.nanoseconds}}function Nf(e,t){return e.useProto3Json?t.toBase64():t.toUint8Array()}function Af(e,t){return kf(e,t.toTimestamp())}function Rf(e){return sl(!!e),Il.fromTimestamp(function(e){const t=Yl(e);return new Tl(t.seconds,t.nanos)}(e))}function Pf(e,t){return Df(e,t).canonicalString()}function Df(e,t){const n=(i=e,new Cl(["projects",i.projectId,"databases",i.database])).child("documents");var i;return void 0===t?n:n.child(t)}function xf(e){const t=Cl.fromString(e);return sl(Jf(t)),t}function Of(e,t){return Pf(e.databaseId,t.path)}function Lf(e,t){const n=xf(t);if(n.get(1)!==e.databaseId.projectId)throw new al(ol.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+n.get(1)+" vs "+e.databaseId.projectId);if(n.get(3)!==e.databaseId.database)throw new al(ol.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+n.get(3)+" vs "+e.databaseId.database);return new kl(Uf(n))}function Mf(e,t){return Pf(e.databaseId,t)}function Ff(e){return new Cl(["projects",e.databaseId.projectId,"databases",e.databaseId.database]).canonicalString()}function Uf(e){return sl(e.length>4&&"documents"===e.get(4)),e.popFirst(5)}function Vf(e,t,n){return{name:Of(e,t),fields:n.value.mapValue.fields}}function qf(e,t){return{documents:[Mf(e,t.path)]}}function jf(e,t){const n={structuredQuery:{}},i=t.path;let s;null!==t.collectionGroup?(s=i,n.structuredQuery.from=[{collectionId:t.collectionGroup,allDescendants:!0}]):(s=i.popLast(),n.structuredQuery.from=[{collectionId:i.lastSegment()}]),n.parent=Mf(e,s);const r=function(e){if(0!==e.length)return Qf(Ru.create(e,"and"))}(t.filters);r&&(n.structuredQuery.where=r);const o=function(e){if(0!==e.length)return e.map(e=>{return{field:Kf((t=e).field),direction:$f(t.dir)};var t})}(t.orderBy);o&&(n.structuredQuery.orderBy=o);const a=Sf(e,t.limit);return null!==a&&(n.structuredQuery.limit=a),t.startAt&&(n.structuredQuery.startAt={before:(c=t.startAt).inclusive,values:c.position}),t.endAt&&(n.structuredQuery.endAt=function(e){return{before:!e.inclusive,values:e.position}}(t.endAt)),{_t:n,parent:s};var c}function Bf(e){let t=function(e){const t=xf(e);return 4===t.length?Cl.emptyPath():Uf(t)}(e.parent);const n=e.structuredQuery,i=n.from?n.from.length:0;let s=null;if(i>0){sl(1===i);const e=n.from[0];e.allDescendants?s=e.collectionId:t=t.child(e.collectionId)}let r=[];n.where&&(r=function(e){const t=zf(e);return t instanceof Ru&&Du(t)?t.getFilters():[t]}(n.where));let o=[];n.orderBy&&(o=n.orderBy.map(e=>{return new Su(Gf((t=e).field),function(e){switch(e){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(t.direction));var t}));let a=null;n.limit&&(a=function(e){let t;return t="object"==typeof e?e.value:e,Ml(t)?null:t}(n.limit));let c=null;n.startAt&&(c=function(e){const t=!!e.before,n=e.values||[];return new bu(n,t)}(n.startAt));let h=null;return n.endAt&&(h=function(e){const t=!e.before,n=e.values||[];return new bu(n,t)}(n.endAt)),function(e,t,n,i,s,r,o,a){return new Qu(e,t,n,i,s,r,o,a)}(t,s,o,r,a,"F",c,h)}function zf(e){return void 0!==e.unaryFilter?function(e){switch(e.unaryFilter.op){case"IS_NAN":const t=Gf(e.unaryFilter.field);return Au.create(t,"==",{doubleValue:NaN});case"IS_NULL":const n=Gf(e.unaryFilter.field);return Au.create(n,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=Gf(e.unaryFilter.field);return Au.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const s=Gf(e.unaryFilter.field);return Au.create(s,"!=",{nullValue:"NULL_VALUE"});default:return il()}}(e):void 0!==e.fieldFilter?(t=e,Au.create(Gf(t.fieldFilter.field),function(e){switch(e){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";default:return il()}}(t.fieldFilter.op),t.fieldFilter.value)):void 0!==e.compositeFilter?function(e){return Ru.create(e.compositeFilter.filters.map(e=>zf(e)),function(e){switch(e){case"AND":return"and";case"OR":return"or";default:return il()}}(e.compositeFilter.op))}(e):il();var t}function $f(e){return If[e]}function Wf(e){return bf[e]}function Hf(e){return Cf[e]}function Kf(e){return{fieldPath:e.canonicalString()}}function Gf(e){return Sl.fromServerFormat(e.fieldPath)}function Qf(e){return e instanceof Au?function(e){if("=="===e.op){if(_u(e.value))return{unaryFilter:{field:Kf(e.field),op:"IS_NAN"}};if(mu(e.value))return{unaryFilter:{field:Kf(e.field),op:"IS_NULL"}}}else if("!="===e.op){if(_u(e.value))return{unaryFilter:{field:Kf(e.field),op:"IS_NOT_NAN"}};if(mu(e.value))return{unaryFilter:{field:Kf(e.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Kf(e.field),op:Wf(e.op),value:e.value}}}(e):e instanceof Ru?function(e){const t=e.getFilters().map(e=>Qf(e));return 1===t.length?t[0]:{compositeFilter:{op:Hf(e.op),filters:t}}}(e):il()}function Yf(e){const t=[];return e.fields.forEach(e=>t.push(e.canonicalString())),{fieldPaths:t}}function Jf(e){return e.length>=4&&"projects"===e.get(0)&&"databases"===e.get(2)}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Xf{constructor(e,t,n,i,s=Il.min(),r=Il.min(),o=Gl.EMPTY_BYTE_STRING,a=null){this.target=e,this.targetId=t,this.purpose=n,this.sequenceNumber=i,this.snapshotVersion=s,this.lastLimboFreeSnapshotVersion=r,this.resumeToken=o,this.expectedCount=a}withSequenceNumber(e){return new Xf(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new Xf(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new Xf(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new Xf(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Zf{constructor(e){this.ct=e}}function ep(e){const t=Bf({parent:e.parent,structuredQuery:e.structuredQuery});return"LAST"===e.limitType?nd(t,t.limit,"L"):t}
/**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class tp{constructor(){this.un=new np}addToCollectionParentIndex(e,t){return this.un.add(t),xl.resolve()}getCollectionParents(e,t){return xl.resolve(this.un.getEntries(t))}addFieldIndex(e,t){return xl.resolve()}deleteFieldIndex(e,t){return xl.resolve()}deleteAllFieldIndexes(e){return xl.resolve()}createTargetIndexes(e,t){return xl.resolve()}getDocumentsMatchingTarget(e,t){return xl.resolve(null)}getIndexType(e,t){return xl.resolve(0)}getFieldIndexes(e,t){return xl.resolve([])}getNextCollectionGroupToUpdate(e){return xl.resolve(null)}getMinOffset(e,t){return xl.resolve(Al.min())}getMinOffsetFromCollectionGroup(e,t){return xl.resolve(Al.min())}updateCollectionGroup(e,t,n){return xl.resolve()}updateIndexEntries(e,t){return xl.resolve()}}class np{constructor(){this.index={}}add(e){const t=e.lastSegment(),n=e.popLast(),i=this.index[t]||new $l(Cl.comparator),s=!i.has(n);return this.index[t]=i.add(n),s}has(e){const t=e.lastSegment(),n=e.popLast(),i=this.index[t];return i&&i.has(n)}getEntries(e){return(this.index[e]||new $l(Cl.comparator)).toArray()}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class ip{constructor(e){this.Ln=e}next(){return this.Ln+=2,this.Ln}static Bn(){return new ip(0)}static kn(){return new ip(-1)}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class sp{constructor(){this.changes=new hd(e=>e.toString(),(e,t)=>e.isEqual(t)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,Iu.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const n=this.changes.get(t);return void 0!==n?xl.resolve(n):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
/**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class rp{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class op{constructor(e,t,n,i){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=n,this.indexManager=i}getDocument(e,t){let n=null;return this.documentOverlayCache.getOverlay(e,t).next(i=>(n=i,this.remoteDocumentCache.getEntry(e,t))).next(e=>(null!==n&&$d(n.mutation,e,Hl.empty(),Tl.now()),e))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next(t=>this.getLocalViewOfDocuments(e,t,wd()).next(()=>t))}getLocalViewOfDocuments(e,t,n=wd()){const i=gd();return this.populateOverlays(e,i,t).next(()=>this.computeViews(e,t,i,n).next(e=>{let t=fd();return e.forEach((e,n)=>{t=t.insert(e,n.overlayedDocument)}),t}))}getOverlayedDocuments(e,t){const n=gd();return this.populateOverlays(e,n,t).next(()=>this.computeViews(e,t,n,wd()))}populateOverlays(e,t,n){const i=[];return n.forEach(e=>{t.has(e)||i.push(e)}),this.documentOverlayCache.getOverlays(e,i).next(e=>{e.forEach((e,n)=>{t.set(e,n)})})}computeViews(e,t,n,i){let s=ud();const r=_d(),o=_d();return t.forEach((e,t)=>{const o=n.get(t.key);i.has(t.key)&&(void 0===o||o.mutation instanceof Gd)?s=s.insert(t.key,t):void 0!==o?(r.set(t.key,o.mutation.getFieldMask()),$d(o.mutation,t,o.mutation.getFieldMask(),Tl.now())):r.set(t.key,Hl.empty())}),this.recalculateAndSaveOverlays(e,s).next(e=>(e.forEach((e,t)=>r.set(e,t)),t.forEach((e,t)=>{var n;return o.set(e,new rp(t,null!==(n=r.get(e))&&void 0!==n?n:null))}),o))}recalculateAndSaveOverlays(e,t){const n=_d();let i=new jl((e,t)=>e-t),s=wd();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next(e=>{for(const s of e)s.keys().forEach(e=>{const r=t.get(e);if(null===r)return;let o=n.get(e)||Hl.empty();o=s.applyToLocalView(r,o),n.set(e,o);const a=(i.get(s.batchId)||wd()).add(e);i=i.insert(s.batchId,a)})}).next(()=>{const r=[],o=i.getReverseIterator();for(;o.hasNext();){const i=o.getNext(),a=i.key,c=i.value,h=md();c.forEach(e=>{if(!s.has(e)){const i=Bd(t.get(e),n.get(e));null!==i&&h.set(e,i),s=s.add(e)}}),r.push(this.documentOverlayCache.saveOverlays(e,a,h))}return xl.waitFor(r)}).next(()=>n)}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next(t=>this.recalculateAndSaveOverlays(e,t))}getDocumentsMatchingQuery(e,t,n,i){return s=t,kl.isDocumentKey(s.path)&&null===s.collectionGroup&&0===s.filters.length?this.getDocumentsMatchingDocumentQuery(e,t.path):Xu(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,n,i):this.getDocumentsMatchingCollectionQuery(e,t,n,i);var s}getNextDocuments(e,t,n,i){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,n,i).next(s=>{const r=i-s.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,n.largestBatchId,i-s.size):xl.resolve(gd());let o=-1,a=s;return r.next(t=>xl.forEach(t,(t,n)=>(o<n.largestBatchId&&(o=n.largestBatchId),s.get(t)?xl.resolve():this.remoteDocumentCache.getEntry(e,t).next(e=>{a=a.insert(t,e)}))).next(()=>this.populateOverlays(e,t,s)).next(()=>this.computeViews(e,a,t,wd())).next(e=>({batchId:o,changes:pd(e)})))})}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new kl(t)).next(e=>{let t=fd();return e.isFoundDocument()&&(t=t.insert(e.key,e)),t})}getDocumentsMatchingCollectionGroupQuery(e,t,n,i){const s=t.collectionGroup;let r=fd();return this.indexManager.getCollectionParents(e,s).next(o=>xl.forEach(o,o=>{const a=(c=t,h=o.child(s),new Qu(h,null,c.explicitOrderBy.slice(),c.filters.slice(),c.limit,c.limitType,c.startAt,c.endAt));var c,h;return this.getDocumentsMatchingCollectionQuery(e,a,n,i).next(e=>{e.forEach((e,t)=>{r=r.insert(e,t)})})}).next(()=>r))}getDocumentsMatchingCollectionQuery(e,t,n,i){let s;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,n.largestBatchId).next(r=>(s=r,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,n,s,i))).next(e=>{s.forEach((t,n)=>{const i=n.getKey();null===e.get(i)&&(e=e.insert(i,Iu.newInvalidDocument(i)))});let n=fd();return e.forEach((e,i)=>{const r=s.get(e);void 0!==r&&$d(r.mutation,i,Hl.empty(),Tl.now()),od(t,i)&&(n=n.insert(e,i))}),n})}}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class ap{constructor(e){this.serializer=e,this.hr=new Map,this.Pr=new Map}getBundleMetadata(e,t){return xl.resolve(this.hr.get(t))}saveBundleMetadata(e,t){return this.hr.set(t.id,{id:(n=t).id,version:n.version,createTime:Rf(n.createTime)}),xl.resolve();var n}getNamedQuery(e,t){return xl.resolve(this.Pr.get(t))}saveNamedQuery(e,t){return this.Pr.set(t.name,{name:(n=t).name,query:ep(n.bundledQuery),readTime:Rf(n.readTime)}),xl.resolve();var n}}
/**
   * @license
   * Copyright 2022 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class cp{constructor(){this.overlays=new jl(kl.comparator),this.Ir=new Map}getOverlay(e,t){return xl.resolve(this.overlays.get(t))}getOverlays(e,t){const n=gd();return xl.forEach(t,t=>this.getOverlay(e,t).next(e=>{null!==e&&n.set(t,e)})).next(()=>n)}saveOverlays(e,t,n){return n.forEach((n,i)=>{this.ht(e,t,i)}),xl.resolve()}removeOverlaysForBatchId(e,t,n){const i=this.Ir.get(n);return void 0!==i&&(i.forEach(e=>this.overlays=this.overlays.remove(e)),this.Ir.delete(n)),xl.resolve()}getOverlaysForCollection(e,t,n){const i=gd(),s=t.length+1,r=new kl(t.child("")),o=this.overlays.getIteratorFrom(r);for(;o.hasNext();){const e=o.getNext().value,r=e.getKey();if(!t.isPrefixOf(r.path))break;r.path.length===s&&e.largestBatchId>n&&i.set(e.getKey(),e)}return xl.resolve(i)}getOverlaysForCollectionGroup(e,t,n,i){let s=new jl((e,t)=>e-t);const r=this.overlays.getIterator();for(;r.hasNext();){const e=r.getNext().value;if(e.getKey().getCollectionGroup()===t&&e.largestBatchId>n){let t=s.get(e.largestBatchId);null===t&&(t=gd(),s=s.insert(e.largestBatchId,t)),t.set(e.getKey(),e)}}const o=gd(),a=s.getIterator();for(;a.hasNext()&&(a.getNext().value.forEach((e,t)=>o.set(e,t)),!(o.size()>=i)););return xl.resolve(o)}ht(e,t,n){const i=this.overlays.get(n.key);if(null!==i){const e=this.Ir.get(i.largestBatchId).delete(n.key);this.Ir.set(i.largestBatchId,e)}this.overlays=this.overlays.insert(n.key,new nf(t,n));let s=this.Ir.get(t);void 0===s&&(s=wd(),this.Ir.set(t,s)),this.Ir.set(t,s.add(n.key))}}
/**
   * @license
   * Copyright 2024 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class hp{constructor(){this.sessionToken=Gl.EMPTY_BYTE_STRING}getSessionToken(e){return xl.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,xl.resolve()}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class lp{constructor(){this.Tr=new $l(up.Er),this.dr=new $l(up.Ar)}isEmpty(){return this.Tr.isEmpty()}addReference(e,t){const n=new up(e,t);this.Tr=this.Tr.add(n),this.dr=this.dr.add(n)}Rr(e,t){e.forEach(e=>this.addReference(e,t))}removeReference(e,t){this.Vr(new up(e,t))}mr(e,t){e.forEach(e=>this.removeReference(e,t))}gr(e){const t=new kl(new Cl([])),n=new up(t,e),i=new up(t,e+1),s=[];return this.dr.forEachInRange([n,i],e=>{this.Vr(e),s.push(e.key)}),s}pr(){this.Tr.forEach(e=>this.Vr(e))}Vr(e){this.Tr=this.Tr.delete(e),this.dr=this.dr.delete(e)}yr(e){const t=new kl(new Cl([])),n=new up(t,e),i=new up(t,e+1);let s=wd();return this.dr.forEachInRange([n,i],e=>{s=s.add(e.key)}),s}containsKey(e){const t=new up(e,0),n=this.Tr.firstAfterOrEqual(t);return null!==n&&e.isEqual(n.key)}}class up{constructor(e,t){this.key=e,this.wr=t}static Er(e,t){return kl.comparator(e.key,t.key)||vl(e.wr,t.wr)}static Ar(e,t){return vl(e.wr,t.wr)||kl.comparator(e.key,t.key)}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class dp{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.Sr=1,this.br=new $l(up.Er)}checkEmpty(e){return xl.resolve(0===this.mutationQueue.length)}addMutationBatch(e,t,n,i){const s=this.Sr;this.Sr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const r=new ef(s,t,n,i);this.mutationQueue.push(r);for(const o of i)this.br=this.br.add(new up(o.key,s)),this.indexManager.addToCollectionParentIndex(e,o.key.path.popLast());return xl.resolve(r)}lookupMutationBatch(e,t){return xl.resolve(this.Dr(t))}getNextMutationBatchAfterBatchId(e,t){const n=t+1,i=this.vr(n),s=i<0?0:i;return xl.resolve(this.mutationQueue.length>s?this.mutationQueue[s]:null)}getHighestUnacknowledgedBatchId(){return xl.resolve(0===this.mutationQueue.length?-1:this.Sr-1)}getAllMutationBatches(e){return xl.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const n=new up(t,0),i=new up(t,Number.POSITIVE_INFINITY),s=[];return this.br.forEachInRange([n,i],e=>{const t=this.Dr(e.wr);s.push(t)}),xl.resolve(s)}getAllMutationBatchesAffectingDocumentKeys(e,t){let n=new $l(vl);return t.forEach(e=>{const t=new up(e,0),i=new up(e,Number.POSITIVE_INFINITY);this.br.forEachInRange([t,i],e=>{n=n.add(e.wr)})}),xl.resolve(this.Cr(n))}getAllMutationBatchesAffectingQuery(e,t){const n=t.path,i=n.length+1;let s=n;kl.isDocumentKey(s)||(s=s.child(""));const r=new up(new kl(s),0);let o=new $l(vl);return this.br.forEachWhile(e=>{const t=e.key.path;return!!n.isPrefixOf(t)&&(t.length===i&&(o=o.add(e.wr)),!0)},r),xl.resolve(this.Cr(o))}Cr(e){const t=[];return e.forEach(e=>{const n=this.Dr(e);null!==n&&t.push(n)}),t}removeMutationBatch(e,t){sl(0===this.Fr(t.batchId,"removed")),this.mutationQueue.shift();let n=this.br;return xl.forEach(t.mutations,i=>{const s=new up(i.key,t.batchId);return n=n.delete(s),this.referenceDelegate.markPotentiallyOrphaned(e,i.key)}).next(()=>{this.br=n})}On(e){}containsKey(e,t){const n=new up(t,0),i=this.br.firstAfterOrEqual(n);return xl.resolve(t.isEqual(i&&i.key))}performConsistencyCheck(e){return this.mutationQueue.length,xl.resolve()}Fr(e,t){return this.vr(e)}vr(e){return 0===this.mutationQueue.length?0:e-this.mutationQueue[0].batchId}Dr(e){const t=this.vr(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class fp{constructor(e){this.Mr=e,this.docs=new jl(kl.comparator),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const n=t.key,i=this.docs.get(n),s=i?i.size:0,r=this.Mr(t);return this.docs=this.docs.insert(n,{document:t.mutableCopy(),size:r}),this.size+=r-s,this.indexManager.addToCollectionParentIndex(e,n.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const n=this.docs.get(t);return xl.resolve(n?n.document.mutableCopy():Iu.newInvalidDocument(t))}getEntries(e,t){let n=ud();return t.forEach(e=>{const t=this.docs.get(e);n=n.insert(e,t?t.document.mutableCopy():Iu.newInvalidDocument(e))}),xl.resolve(n)}getDocumentsMatchingQuery(e,t,n,i){let s=ud();const r=t.path,o=new kl(r.child("")),a=this.docs.getIteratorFrom(o);for(;a.hasNext();){const{key:e,value:{document:o}}=a.getNext();if(!r.isPrefixOf(e.path))break;e.path.length>r.length+1||Rl(Nl(o),n)<=0||(i.has(o.key)||od(t,o))&&(s=s.insert(o.key,o.mutableCopy()))}return xl.resolve(s)}getAllFromCollectionGroup(e,t,n,i){il()}Or(e,t){return xl.forEach(this.docs,e=>t(e))}newChangeBuffer(e){return new pp(this)}getSize(e){return xl.resolve(this.size)}}class pp extends sp{constructor(e){super(),this.cr=e}applyChanges(e){const t=[];return this.changes.forEach((n,i)=>{i.isValidDocument()?t.push(this.cr.addEntry(e,i)):this.cr.removeEntry(n)}),xl.waitFor(t)}getFromCache(e,t){return this.cr.getEntry(e,t)}getAllFromCache(e,t){return this.cr.getEntries(e,t)}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class gp{constructor(e){this.persistence=e,this.Nr=new hd(e=>Hu(e),Ku),this.lastRemoteSnapshotVersion=Il.min(),this.highestTargetId=0,this.Lr=0,this.Br=new lp,this.targetCount=0,this.kr=ip.Bn()}forEachTarget(e,t){return this.Nr.forEach((e,n)=>t(n)),xl.resolve()}getLastRemoteSnapshotVersion(e){return xl.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return xl.resolve(this.Lr)}allocateTargetId(e){return this.highestTargetId=this.kr.next(),xl.resolve(this.highestTargetId)}setTargetsMetadata(e,t,n){return n&&(this.lastRemoteSnapshotVersion=n),t>this.Lr&&(this.Lr=t),xl.resolve()}Kn(e){this.Nr.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.kr=new ip(t),this.highestTargetId=t),e.sequenceNumber>this.Lr&&(this.Lr=e.sequenceNumber)}addTargetData(e,t){return this.Kn(t),this.targetCount+=1,xl.resolve()}updateTargetData(e,t){return this.Kn(t),xl.resolve()}removeTargetData(e,t){return this.Nr.delete(t.target),this.Br.gr(t.targetId),this.targetCount-=1,xl.resolve()}removeTargets(e,t,n){let i=0;const s=[];return this.Nr.forEach((r,o)=>{o.sequenceNumber<=t&&null===n.get(o.targetId)&&(this.Nr.delete(r),s.push(this.removeMatchingKeysForTargetId(e,o.targetId)),i++)}),xl.waitFor(s).next(()=>i)}getTargetCount(e){return xl.resolve(this.targetCount)}getTargetData(e,t){const n=this.Nr.get(t)||null;return xl.resolve(n)}addMatchingKeys(e,t,n){return this.Br.Rr(t,n),xl.resolve()}removeMatchingKeys(e,t,n){this.Br.mr(t,n);const i=this.persistence.referenceDelegate,s=[];return i&&t.forEach(t=>{s.push(i.markPotentiallyOrphaned(e,t))}),xl.waitFor(s)}removeMatchingKeysForTargetId(e,t){return this.Br.gr(t),xl.resolve()}getMatchingKeysForTargetId(e,t){const n=this.Br.yr(t);return xl.resolve(n)}containsKey(e,t){return xl.resolve(this.Br.containsKey(t))}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class mp{constructor(e,t){this.qr={},this.overlays={},this.Qr=new Ll(0),this.Kr=!1,this.Kr=!0,this.$r=new hp,this.referenceDelegate=e(this),this.Ur=new gp(this),this.indexManager=new tp,this.remoteDocumentCache=new fp(e=>this.referenceDelegate.Wr(e)),this.serializer=new Zf(t),this.Gr=new ap(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.Kr=!1,Promise.resolve()}get started(){return this.Kr}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new cp,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let n=this.qr[e.toKey()];return n||(n=new dp(t,this.referenceDelegate),this.qr[e.toKey()]=n),n}getGlobalsCache(){return this.$r}getTargetCache(){return this.Ur}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Gr}runTransaction(e,t,n){Zh("MemoryPersistence","Starting transaction:",e);const i=new _p(this.Qr.next());return this.referenceDelegate.zr(),n(i).next(e=>this.referenceDelegate.jr(i).next(()=>e)).toPromise().then(e=>(i.raiseOnCommittedEvent(),e))}Hr(e,t){return xl.or(Object.values(this.qr).map(n=>()=>n.containsKey(e,t)))}}class _p extends Pl{constructor(e){super(),this.currentSequenceNumber=e}}class yp{constructor(e){this.persistence=e,this.Jr=new lp,this.Yr=null}static Zr(e){return new yp(e)}get Xr(){if(this.Yr)return this.Yr;throw il()}addReference(e,t,n){return this.Jr.addReference(n,t),this.Xr.delete(n.toString()),xl.resolve()}removeReference(e,t,n){return this.Jr.removeReference(n,t),this.Xr.add(n.toString()),xl.resolve()}markPotentiallyOrphaned(e,t){return this.Xr.add(t.toString()),xl.resolve()}removeTarget(e,t){this.Jr.gr(t.targetId).forEach(e=>this.Xr.add(e.toString()));const n=this.persistence.getTargetCache();return n.getMatchingKeysForTargetId(e,t.targetId).next(e=>{e.forEach(e=>this.Xr.add(e.toString()))}).next(()=>n.removeTargetData(e,t))}zr(){this.Yr=new Set}jr(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return xl.forEach(this.Xr,n=>{const i=kl.fromPath(n);return this.ei(e,i).next(e=>{e||t.removeEntry(i,Il.min())})}).next(()=>(this.Yr=null,t.apply(e)))}updateLimboDocument(e,t){return this.ei(e,t).next(e=>{e?this.Xr.delete(t.toString()):this.Xr.add(t.toString())})}Wr(e){return 0}ei(e,t){return xl.or([()=>xl.resolve(this.Jr.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.Hr(e,t)])}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class vp{constructor(e,t,n,i){this.targetId=e,this.fromCache=t,this.$i=n,this.Ui=i}static Wi(e,t){let n=wd(),i=wd();for(const s of t.docChanges)switch(s.type){case 0:n=n.add(s.doc.key);break;case 1:i=i.add(s.doc.key)}return new vp(e,t.fromCache,n,i)}}
/**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class wp{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}
/**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Tp{constructor(){this.Gi=!1,this.zi=!1,this.ji=100,this.Hi=C()?8:function(e){const t=e.match(/Android ([\d.]+)/i),n=t?t[1].split(".").slice(0,2).join("."):"-1";return Number(n)}(T())>0?6:4}initialize(e,t){this.Ji=e,this.indexManager=t,this.Gi=!0}getDocumentsMatchingQuery(e,t,n,i){const s={result:null};return this.Yi(e,t).next(e=>{s.result=e}).next(()=>{if(!s.result)return this.Zi(e,t,i,n).next(e=>{s.result=e})}).next(()=>{if(s.result)return;const n=new wp;return this.Xi(e,t,n).next(i=>{if(s.result=i,this.zi)return this.es(e,t,n,i.size)})}).next(()=>s.result)}es(e,t,n,i){return n.documentReadCount<this.ji?(Xh()<=G.DEBUG&&Zh("QueryEngine","SDK will not create cache indexes for query:",rd(t),"since it only creates cache indexes for collection contains","more than or equal to",this.ji,"documents"),xl.resolve()):(Xh()<=G.DEBUG&&Zh("QueryEngine","Query:",rd(t),"scans",n.documentReadCount,"local documents and returns",i,"documents as results."),n.documentReadCount>this.Hi*i?(Xh()<=G.DEBUG&&Zh("QueryEngine","The SDK decides to create cache indexes for query:",rd(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,ed(t))):xl.resolve())}Yi(e,t){if(Ju(t))return xl.resolve(null);let n=ed(t);return this.indexManager.getIndexType(e,n).next(i=>0===i?null:(null!==t.limit&&1===i&&(t=nd(t,null,"F"),n=ed(t)),this.indexManager.getDocumentsMatchingTarget(e,n).next(i=>{const s=wd(...i);return this.Ji.getDocuments(e,s).next(i=>this.indexManager.getMinOffset(e,n).next(n=>{const r=this.ts(t,i);return this.ns(t,r,s,n.readTime)?this.Yi(e,nd(t,null,"F")):this.rs(e,r,t,n)}))})))}Zi(e,t,n,i){return Ju(t)||i.isEqual(Il.min())?xl.resolve(null):this.Ji.getDocuments(e,n).next(s=>{const r=this.ts(t,s);return this.ns(t,r,n,i)?xl.resolve(null):(Xh()<=G.DEBUG&&Zh("QueryEngine","Re-using previous result from %s to execute query: %s",i.toString(),rd(t)),this.rs(e,r,t,function(e,t){const n=e.toTimestamp().seconds,i=e.toTimestamp().nanoseconds+1,s=Il.fromTimestamp(1e9===i?new Tl(n+1,0):new Tl(n,i));return new Al(s,kl.empty(),t)}(i,-1)).next(e=>e))})}ts(e,t){let n=new $l(ad(e));return t.forEach((t,i)=>{od(e,i)&&(n=n.add(i))}),n}ns(e,t,n,i){if(null===e.limit)return!1;if(n.size!==t.size)return!0;const s="F"===e.limitType?t.last():t.first();return!!s&&(s.hasPendingWrites||s.version.compareTo(i)>0)}Xi(e,t,n){return Xh()<=G.DEBUG&&Zh("QueryEngine","Using full collection scan to execute query:",rd(t)),this.Ji.getDocumentsMatchingQuery(e,t,Al.min(),n)}rs(e,t,n,i){return this.Ji.getDocumentsMatchingQuery(e,n,i).next(e=>(t.forEach(t=>{e=e.insert(t.key,t)}),e))}}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Ip{constructor(e,t,n,i){this.persistence=e,this.ss=t,this.serializer=i,this.os=new jl(vl),this._s=new hd(e=>Hu(e),Ku),this.us=new Map,this.cs=e.getRemoteDocumentCache(),this.Ur=e.getTargetCache(),this.Gr=e.getBundleCache(),this.ls(n)}ls(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new op(this.cs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.cs.setIndexManager(this.indexManager),this.ss.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",t=>e.collect(t,this.os))}}async function bp(e,t){const n=rl(e);return await n.persistence.runTransaction("Handle user change","readonly",e=>{let i;return n.mutationQueue.getAllMutationBatches(e).next(s=>(i=s,n.ls(t),n.mutationQueue.getAllMutationBatches(e))).next(t=>{const s=[],r=[];let o=wd();for(const e of i){s.push(e.batchId);for(const t of e.mutations)o=o.add(t.key)}for(const e of t){r.push(e.batchId);for(const t of e.mutations)o=o.add(t.key)}return n.localDocuments.getDocuments(e,o).next(e=>({hs:e,removedBatchIds:s,addedBatchIds:r}))})})}function Cp(e){const t=rl(e);return t.persistence.runTransaction("Get last remote snapshot version","readonly",e=>t.Ur.getLastRemoteSnapshotVersion(e))}function Ep(e,t){const n=rl(e),i=t.snapshotVersion;let s=n.os;return n.persistence.runTransaction("Apply remote event","readwrite-primary",e=>{const r=n.cs.newChangeBuffer({trackRemovals:!0});s=n.os;const o=[];t.targetChanges.forEach((r,a)=>{const c=s.get(a);if(!c)return;o.push(n.Ur.removeMatchingKeys(e,r.removedDocuments,a).next(()=>n.Ur.addMatchingKeys(e,r.addedDocuments,a)));let h=c.withSequenceNumber(e.currentSequenceNumber);var l,u,d;null!==t.targetMismatches.get(a)?h=h.withResumeToken(Gl.EMPTY_BYTE_STRING,Il.min()).withLastLimboFreeSnapshotVersion(Il.min()):r.resumeToken.approximateByteSize()>0&&(h=h.withResumeToken(r.resumeToken,i)),s=s.insert(a,h),u=h,d=r,(0===(l=c).resumeToken.approximateByteSize()||u.snapshotVersion.toMicroseconds()-l.snapshotVersion.toMicroseconds()>=3e8||d.addedDocuments.size+d.modifiedDocuments.size+d.removedDocuments.size>0)&&o.push(n.Ur.updateTargetData(e,h))});let a=ud(),c=wd();if(t.documentUpdates.forEach(i=>{t.resolvedLimboDocuments.has(i)&&o.push(n.persistence.referenceDelegate.updateLimboDocument(e,i))}),o.push(function(e,t,n){let i=wd(),s=wd();return n.forEach(e=>i=i.add(e)),t.getEntries(e,i).next(e=>{let i=ud();return n.forEach((n,r)=>{const o=e.get(n);r.isFoundDocument()!==o.isFoundDocument()&&(s=s.add(n)),r.isNoDocument()&&r.version.isEqual(Il.min())?(t.removeEntry(n,r.readTime),i=i.insert(n,r)):!o.isValidDocument()||r.version.compareTo(o.version)>0||0===r.version.compareTo(o.version)&&o.hasPendingWrites?(t.addEntry(r),i=i.insert(n,r)):Zh("LocalStore","Ignoring outdated watch update for ",n,". Current version:",o.version," Watch version:",r.version)}),{Ps:i,Is:s}})}(e,r,t.documentUpdates).next(e=>{a=e.Ps,c=e.Is})),!i.isEqual(Il.min())){const t=n.Ur.getLastRemoteSnapshotVersion(e).next(t=>n.Ur.setTargetsMetadata(e,e.currentSequenceNumber,i));o.push(t)}return xl.waitFor(o).next(()=>r.apply(e)).next(()=>n.localDocuments.getLocalViewOfDocuments(e,a,c)).next(()=>a)}).then(e=>(n.os=s,e))}function Sp(e,t){const n=rl(e);return n.persistence.runTransaction("Get next mutation batch","readonly",e=>(void 0===t&&(t=-1),n.mutationQueue.getNextMutationBatchAfterBatchId(e,t)))}async function kp(e,t,n){const i=rl(e),s=i.os.get(t),r=n?"readwrite":"readwrite-primary";try{n||await i.persistence.runTransaction("Release target",r,e=>i.persistence.referenceDelegate.removeTarget(e,s))}catch(o){if(!Ol(o))throw o;Zh("LocalStore",`Failed to update sequence numbers for target ${t}: ${o}`)}i.os=i.os.remove(t),i._s.delete(s.target)}function Np(e,t,n){const i=rl(e);let s=Il.min(),r=wd();return i.persistence.runTransaction("Execute query","readwrite",e=>function(e,t,n){const i=rl(e),s=i._s.get(n);return void 0!==s?xl.resolve(i.os.get(s)):i.Ur.getTargetData(t,n)}(i,e,ed(t)).next(t=>{if(t)return s=t.lastLimboFreeSnapshotVersion,i.Ur.getMatchingKeysForTargetId(e,t.targetId).next(e=>{r=e})}).next(()=>i.ss.getDocumentsMatchingQuery(e,t,n?s:Il.min(),n?r:wd())).next(e=>(function(e,t,n){let i=e.us.get(t)||Il.min();n.forEach((e,t)=>{t.readTime.compareTo(i)>0&&(i=t.readTime)}),e.us.set(t,i)}(i,function(e){return e.collectionGroup||(e.path.length%2==1?e.path.lastSegment():e.path.get(e.path.length-2))}(t),e),{documents:e,Ts:r})))}class Ap{constructor(){this.activeTargetIds=Td}fs(e){this.activeTargetIds=this.activeTargetIds.add(e)}gs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Vs(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class Rp{constructor(){this.so=new Ap,this.oo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,n){}addLocalQueryTarget(e,t=!0){return t&&this.so.fs(e),this.oo[e]||"not-current"}updateQueryState(e,t,n){this.oo[e]=t}removeLocalQueryTarget(e){this.so.gs(e)}isLocalQueryTarget(e){return this.so.activeTargetIds.has(e)}clearQueryState(e){delete this.oo[e]}getAllActiveQueryTargets(){return this.so.activeTargetIds}isActiveQueryTarget(e){return this.so.activeTargetIds.has(e)}start(){return this.so=new Ap,Promise.resolve()}handleUserChange(e,t,n){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}
/**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Pp{_o(e){}shutdown(){}}
/**
   * @license
   * Copyright 2019 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Dp{constructor(){this.ao=()=>this.uo(),this.co=()=>this.lo(),this.ho=[],this.Po()}_o(e){this.ho.push(e)}shutdown(){window.removeEventListener("online",this.ao),window.removeEventListener("offline",this.co)}Po(){window.addEventListener("online",this.ao),window.addEventListener("offline",this.co)}uo(){Zh("ConnectivityMonitor","Network connectivity changed: AVAILABLE");for(const e of this.ho)e(0)}lo(){Zh("ConnectivityMonitor","Network connectivity changed: UNAVAILABLE");for(const e of this.ho)e(1)}static D(){return"undefined"!=typeof window&&void 0!==window.addEventListener&&void 0!==window.removeEventListener}}
/**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */let xp=null;function Op(){return null===xp?xp=268435456+Math.round(2147483648*Math.random()):xp++,"0x"+xp.toString(16)
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */}const Lp={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Mp{constructor(e){this.Io=e.Io,this.To=e.To}Eo(e){this.Ao=e}Ro(e){this.Vo=e}mo(e){this.fo=e}onMessage(e){this.po=e}close(){this.To()}send(e){this.Io(e)}yo(){this.Ao()}wo(){this.Vo()}So(e){this.fo(e)}bo(e){this.po(e)}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */const Fp="WebChannelConnection";class Up extends class{constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;const t=e.ssl?"https":"http",n=encodeURIComponent(this.databaseId.projectId),i=encodeURIComponent(this.databaseId.database);this.Do=t+"://"+e.host,this.vo=`projects/${n}/databases/${i}`,this.Co="(default)"===this.databaseId.database?`project_id=${n}`:`project_id=${n}&database_id=${i}`}get Fo(){return!1}Mo(e,t,n,i,s){const r=Op(),o=this.xo(e,t.toUriEncodedString());Zh("RestConnection",`Sending RPC '${e}' ${r}:`,o,n);const a={"google-cloud-resource-prefix":this.vo,"x-goog-request-params":this.Co};return this.Oo(a,i,s),this.No(e,o,a,n).then(t=>(Zh("RestConnection",`Received RPC '${e}' ${r}: `,t),t),t=>{throw tl("RestConnection",`RPC '${e}' ${r} failed with error: `,t,"url: ",o,"request:",n),t})}Lo(e,t,n,i,s,r){return this.Mo(e,t,n,i,s)}Oo(e,t,n){e["X-Goog-Api-Client"]="gl-js/ fire/"+Yh,e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),t&&t.headers.forEach((t,n)=>e[n]=t),n&&n.headers.forEach((t,n)=>e[n]=t)}xo(e,t){const n=Lp[e];return`${this.Do}/v1/${t}:${n}`}terminate(){}}{constructor(e){super(e),this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}No(e,t,n,i){const s=Op();return new Promise((r,o)=>{const a=new Vh;a.setWithCredentials(!0),a.listenOnce(jh.COMPLETE,()=>{try{switch(a.getLastErrorCode()){case Bh.NO_ERROR:const t=a.getResponseJson();Zh(Fp,`XHR for RPC '${e}' ${s} received:`,JSON.stringify(t)),r(t);break;case Bh.TIMEOUT:Zh(Fp,`RPC '${e}' ${s} timed out`),o(new al(ol.DEADLINE_EXCEEDED,"Request time out"));break;case Bh.HTTP_ERROR:const n=a.getStatus();if(Zh(Fp,`RPC '${e}' ${s} failed with status:`,n,"response text:",a.getResponseText()),n>0){let e=a.getResponseJson();Array.isArray(e)&&(e=e[0]);const t=null==e?void 0:e.error;if(t&&t.status&&t.message){const e=function(e){const t=e.toLowerCase().replace(/_/g,"-");return Object.values(ol).indexOf(t)>=0?t:ol.UNKNOWN}(t.status);o(new al(e,t.message))}else o(new al(ol.UNKNOWN,"Server responded with status "+a.getStatus()))}else o(new al(ol.UNAVAILABLE,"Connection failed."));break;default:il()}}finally{Zh(Fp,`RPC '${e}' ${s} completed.`)}});const c=JSON.stringify(i);Zh(Fp,`RPC '${e}' ${s} sending request:`,i),a.send(t,"POST",c,n,15)})}Bo(e,t,n){const i=Op(),s=[this.Do,"/","google.firestore.v1.Firestore","/",e,"/channel"],r=Hh(),o=Wh(),a={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},c=this.longPollingOptions.timeoutSeconds;void 0!==c&&(a.longPollingTimeout=Math.round(1e3*c)),this.useFetchStreams&&(a.useFetchStreams=!0),this.Oo(a.initMessageHeaders,t,n),a.encodeInitMessageHeaders=!0;const h=s.join("");Zh(Fp,`Creating RPC '${e}' stream ${i}: ${h}`,a);const l=r.createWebChannel(h,a);let u=!1,d=!1;const f=new Mp({Io:t=>{d?Zh(Fp,`Not sending because RPC '${e}' stream ${i} is closed:`,t):(u||(Zh(Fp,`Opening RPC '${e}' stream ${i} transport.`),l.open(),u=!0),Zh(Fp,`RPC '${e}' stream ${i} sending:`,t),l.send(t))},To:()=>l.close()}),p=(e,t,n)=>{e.listen(t,e=>{try{n(e)}catch(t){setTimeout(()=>{throw t},0)}})};return p(l,qh.EventType.OPEN,()=>{d||(Zh(Fp,`RPC '${e}' stream ${i} transport opened.`),f.yo())}),p(l,qh.EventType.CLOSE,()=>{d||(d=!0,Zh(Fp,`RPC '${e}' stream ${i} transport closed`),f.So())}),p(l,qh.EventType.ERROR,t=>{d||(d=!0,tl(Fp,`RPC '${e}' stream ${i} transport errored:`,t),f.So(new al(ol.UNAVAILABLE,"The operation could not be completed")))}),p(l,qh.EventType.MESSAGE,t=>{var n;if(!d){const s=t.data[0];sl(!!s);const r=s,o=r.error||(null===(n=r[0])||void 0===n?void 0:n.error);if(o){Zh(Fp,`RPC '${e}' stream ${i} received error:`,o);const t=o.status;let n=function(e){const t=rf[e];if(void 0!==t)return af(t)}(t),s=o.message;void 0===n&&(n=ol.INTERNAL,s="Unknown error status: "+t+" with message "+o.message),d=!0,f.So(new al(n,s)),l.close()}else Zh(Fp,`RPC '${e}' stream ${i} received:`,s),f.bo(s)}}),p(o,$h.STAT_EVENT,t=>{t.stat===zh.PROXY?Zh(Fp,`RPC '${e}' stream ${i} detected buffering proxy`):t.stat===zh.NOPROXY&&Zh(Fp,`RPC '${e}' stream ${i} detected no buffering proxy`)}),setTimeout(()=>{f.wo()},0),f}}function Vp(){return"undefined"!=typeof document?document:null}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */function qp(e){return new Ef(e,!0)}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class jp{constructor(e,t,n=1e3,i=1.5,s=6e4){this.ui=e,this.timerId=t,this.ko=n,this.qo=i,this.Qo=s,this.Ko=0,this.$o=null,this.Uo=Date.now(),this.reset()}reset(){this.Ko=0}Wo(){this.Ko=this.Qo}Go(e){this.cancel();const t=Math.floor(this.Ko+this.zo()),n=Math.max(0,Date.now()-this.Uo),i=Math.max(0,t-n);i>0&&Zh("ExponentialBackoff",`Backing off for ${i} ms (base delay: ${this.Ko} ms, delay with jitter: ${t} ms, last attempt: ${n} ms ago)`),this.$o=this.ui.enqueueAfterDelay(this.timerId,i,()=>(this.Uo=Date.now(),e())),this.Ko*=this.qo,this.Ko<this.ko&&(this.Ko=this.ko),this.Ko>this.Qo&&(this.Ko=this.Qo)}jo(){null!==this.$o&&(this.$o.skipDelay(),this.$o=null)}cancel(){null!==this.$o&&(this.$o.cancel(),this.$o=null)}zo(){return(Math.random()-.5)*this.Ko}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Bp{constructor(e,t,n,i,s,r,o,a){this.ui=e,this.Ho=n,this.Jo=i,this.connection=s,this.authCredentialsProvider=r,this.appCheckCredentialsProvider=o,this.listener=a,this.state=0,this.Yo=0,this.Zo=null,this.Xo=null,this.stream=null,this.e_=0,this.t_=new jp(e,t)}n_(){return 1===this.state||5===this.state||this.r_()}r_(){return 2===this.state||3===this.state}start(){this.e_=0,4!==this.state?this.auth():this.i_()}async stop(){this.n_()&&await this.close(0)}s_(){this.state=0,this.t_.reset()}o_(){this.r_()&&null===this.Zo&&(this.Zo=this.ui.enqueueAfterDelay(this.Ho,6e4,()=>this.__()))}a_(e){this.u_(),this.stream.send(e)}async __(){if(this.r_())return this.close(0)}u_(){this.Zo&&(this.Zo.cancel(),this.Zo=null)}c_(){this.Xo&&(this.Xo.cancel(),this.Xo=null)}async close(e,t){this.u_(),this.c_(),this.t_.cancel(),this.Yo++,4!==e?this.t_.reset():t&&t.code===ol.RESOURCE_EXHAUSTED?(el(t.toString()),el("Using maximum backoff delay to prevent overloading the backend."),this.t_.Wo()):t&&t.code===ol.UNAUTHENTICATED&&3!==this.state&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),null!==this.stream&&(this.l_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.mo(t)}l_(){}auth(){this.state=1;const e=this.h_(this.Yo),t=this.Yo;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([e,n])=>{this.Yo===t&&this.P_(e,n)},t=>{e(()=>{const e=new al(ol.UNKNOWN,"Fetching auth token failed: "+t.message);return this.I_(e)})})}P_(e,t){const n=this.h_(this.Yo);this.stream=this.T_(e,t),this.stream.Eo(()=>{n(()=>this.listener.Eo())}),this.stream.Ro(()=>{n(()=>(this.state=2,this.Xo=this.ui.enqueueAfterDelay(this.Jo,1e4,()=>(this.r_()&&(this.state=3),Promise.resolve())),this.listener.Ro()))}),this.stream.mo(e=>{n(()=>this.I_(e))}),this.stream.onMessage(e=>{n(()=>1==++this.e_?this.E_(e):this.onNext(e))})}i_(){this.state=5,this.t_.Go(async()=>{this.state=0,this.start()})}I_(e){return Zh("PersistentStream",`close with error: ${e}`),this.stream=null,this.close(4,e)}h_(e){return t=>{this.ui.enqueueAndForget(()=>this.Yo===e?t():(Zh("PersistentStream","stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class zp extends Bp{constructor(e,t,n,i,s,r){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,n,i,r),this.serializer=s}T_(e,t){return this.connection.Bo("Listen",e,t)}E_(e){return this.onNext(e)}onNext(e){this.t_.reset();const t=function(e,t){let n;if("targetChange"in t){t.targetChange;const s="NO_CHANGE"===(i=t.targetChange.targetChangeType||"NO_CHANGE")?0:"ADD"===i?1:"REMOVE"===i?2:"CURRENT"===i?3:"RESET"===i?4:il(),r=t.targetChange.targetIds||[],o=function(e,t){return e.useProto3Json?(sl(void 0===t||"string"==typeof t),Gl.fromBase64String(t||"")):(sl(void 0===t||t instanceof Buffer||t instanceof Uint8Array),Gl.fromUint8Array(t||new Uint8Array))}(e,t.targetChange.resumeToken),a=t.targetChange.cause,c=a&&function(e){const t=void 0===e.code?ol.UNKNOWN:af(e.code);return new al(t,e.message||"")}(a);n=new _f(s,r,o,c||null)}else if("documentChange"in t){t.documentChange;const i=t.documentChange;i.document,i.document.name,i.document.updateTime;const s=Lf(e,i.document.name),r=Rf(i.document.updateTime),o=i.document.createTime?Rf(i.document.createTime):Il.min(),a=new wu({mapValue:{fields:i.document.fields}}),c=Iu.newFoundDocument(s,r,o,a),h=i.targetIds||[],l=i.removedTargetIds||[];n=new gf(h,l,c.key,c)}else if("documentDelete"in t){t.documentDelete;const i=t.documentDelete;i.document;const s=Lf(e,i.document),r=i.readTime?Rf(i.readTime):Il.min(),o=Iu.newNoDocument(s,r),a=i.removedTargetIds||[];n=new gf([],a,o.key,o)}else if("documentRemove"in t){t.documentRemove;const i=t.documentRemove;i.document;const s=Lf(e,i.document),r=i.removedTargetIds||[];n=new gf([],r,s,null)}else{if(!("filter"in t))return il();{t.filter;const e=t.filter;e.targetId;const{count:i=0,unchangedNames:s}=e,r=new sf(i,s),o=e.targetId;n=new mf(o,r)}}var i;return n}(this.serializer,e),n=function(e){if(!("targetChange"in e))return Il.min();const t=e.targetChange;return t.targetIds&&t.targetIds.length?Il.min():t.readTime?Rf(t.readTime):Il.min()}(e);return this.listener.d_(t,n)}A_(e){const t={};t.database=Ff(this.serializer),t.addTarget=function(e,t){let n;const i=t.target;if(n=Gu(i)?{documents:qf(e,i)}:{query:jf(e,i)._t},n.targetId=t.targetId,t.resumeToken.approximateByteSize()>0){n.resumeToken=Nf(e,t.resumeToken);const i=Sf(e,t.expectedCount);null!==i&&(n.expectedCount=i)}else if(t.snapshotVersion.compareTo(Il.min())>0){n.readTime=kf(e,t.snapshotVersion.toTimestamp());const i=Sf(e,t.expectedCount);null!==i&&(n.expectedCount=i)}return n}(this.serializer,e);const n=function(e,t){const n=function(e){switch(e){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return il()}}(t.purpose);return null==n?null:{"goog-listen-tags":n}}(this.serializer,e);n&&(t.labels=n),this.a_(t)}R_(e){const t={};t.database=Ff(this.serializer),t.removeTarget=e,this.a_(t)}}class $p extends Bp{constructor(e,t,n,i,s,r){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,n,i,r),this.serializer=s}get V_(){return this.e_>0}start(){this.lastStreamToken=void 0,super.start()}l_(){this.V_&&this.m_([])}T_(e,t){return this.connection.Bo("Write",e,t)}E_(e){return sl(!!e.streamToken),this.lastStreamToken=e.streamToken,sl(!e.writeResults||0===e.writeResults.length),this.listener.f_()}onNext(e){sl(!!e.streamToken),this.lastStreamToken=e.streamToken,this.t_.reset();const t=function(e,t){return e&&e.length>0?(sl(void 0!==t),e.map(e=>function(e,t){let n=e.updateTime?Rf(e.updateTime):Rf(t);return n.isEqual(Il.min())&&(n=Rf(t)),new Ud(n,e.transformResults||[])}(e,t))):[]}(e.writeResults,e.commitTime),n=Rf(e.commitTime);return this.listener.g_(n,t)}p_(){const e={};e.database=Ff(this.serializer),this.a_(e)}m_(e){const t={streamToken:this.lastStreamToken,writes:e.map(e=>function(e,t){let n;if(t instanceof Kd)n={update:Vf(e,t.key,t.value)};else if(t instanceof Xd)n={delete:Of(e,t.key)};else if(t instanceof Gd)n={update:Vf(e,t.key,t.data),updateMask:Yf(t.fieldMask)};else{if(!(t instanceof Zd))return il();n={verify:Of(e,t.key)}}return t.fieldTransforms.length>0&&(n.updateTransforms=t.fieldTransforms.map(e=>function(e,t){const n=t.transform;if(n instanceof Ad)return{fieldPath:t.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(n instanceof Rd)return{fieldPath:t.field.canonicalString(),appendMissingElements:{values:n.elements}};if(n instanceof Dd)return{fieldPath:t.field.canonicalString(),removeAllFromArray:{values:n.elements}};if(n instanceof Od)return{fieldPath:t.field.canonicalString(),increment:n.Pe};throw il()}(0,e))),t.precondition.isNone||(n.currentDocument=(i=e,void 0!==(s=t.precondition).updateTime?{updateTime:Af(i,s.updateTime)}:void 0!==s.exists?{exists:s.exists}:il())),n;var i,s}(this.serializer,e))};this.a_(t)}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Wp extends class{}{constructor(e,t,n,i){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=n,this.serializer=i,this.y_=!1}w_(){if(this.y_)throw new al(ol.FAILED_PRECONDITION,"The client has already been terminated.")}Mo(e,t,n,i){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([s,r])=>this.connection.Mo(e,Df(t,n),i,s,r)).catch(e=>{throw"FirebaseError"===e.name?(e.code===ol.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),e):new al(ol.UNKNOWN,e.toString())})}Lo(e,t,n,i,s){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([r,o])=>this.connection.Lo(e,Df(t,n),i,r,o,s)).catch(e=>{throw"FirebaseError"===e.name?(e.code===ol.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),e):new al(ol.UNKNOWN,e.toString())})}terminate(){this.y_=!0,this.connection.terminate()}}class Hp{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.S_=0,this.b_=null,this.D_=!0}v_(){0===this.S_&&(this.C_("Unknown"),this.b_=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.b_=null,this.F_("Backend didn't respond within 10 seconds."),this.C_("Offline"),Promise.resolve())))}M_(e){"Online"===this.state?this.C_("Unknown"):(this.S_++,this.S_>=1&&(this.x_(),this.F_(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.C_("Offline")))}set(e){this.x_(),this.S_=0,"Online"===e&&(this.D_=!1),this.C_(e)}C_(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}F_(e){const t=`Could not reach Cloud Firestore backend. ${e}\nThis typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.D_?(el(t),this.D_=!1):Zh("OnlineStateTracker",t)}x_(){null!==this.b_&&(this.b_.cancel(),this.b_=null)}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Kp{constructor(e,t,n,i,s){this.localStore=e,this.datastore=t,this.asyncQueue=n,this.remoteSyncer={},this.O_=[],this.N_=new Map,this.L_=new Set,this.B_=[],this.k_=s,this.k_._o(e=>{n.enqueueAndForget(async()=>{ng(this)&&(Zh("RemoteStore","Restarting streams for network reachability change."),await async function(e){const t=rl(e);t.L_.add(4),await Qp(t),t.q_.set("Unknown"),t.L_.delete(4),await Gp(t)}(this))})}),this.q_=new Hp(n,i)}}async function Gp(e){if(ng(e))for(const t of e.B_)await t(!0)}async function Qp(e){for(const t of e.B_)await t(!1)}function Yp(e,t){const n=rl(e);n.N_.has(t.targetId)||(n.N_.set(t.targetId,t),tg(n)?eg(n):wg(n).r_()&&Xp(n,t))}function Jp(e,t){const n=rl(e),i=wg(n);n.N_.delete(t),i.r_()&&Zp(n,t),0===n.N_.size&&(i.r_()?i.o_():ng(n)&&n.q_.set("Unknown"))}function Xp(e,t){if(e.Q_.xe(t.targetId),t.resumeToken.approximateByteSize()>0||t.snapshotVersion.compareTo(Il.min())>0){const n=e.remoteSyncer.getRemoteKeysForTarget(t.targetId).size;t=t.withExpectedCount(n)}wg(e).A_(t)}function Zp(e,t){e.Q_.xe(t),wg(e).R_(t)}function eg(e){e.Q_=new vf({getRemoteKeysForTarget:t=>e.remoteSyncer.getRemoteKeysForTarget(t),ot:t=>e.N_.get(t)||null,tt:()=>e.datastore.serializer.databaseId}),wg(e).start(),e.q_.v_()}function tg(e){return ng(e)&&!wg(e).n_()&&e.N_.size>0}function ng(e){return 0===rl(e).L_.size}function ig(e){e.Q_=void 0}async function sg(e){e.q_.set("Online")}async function rg(e){e.N_.forEach((t,n)=>{Xp(e,t)})}async function og(e,t){ig(e),tg(e)?(e.q_.M_(t),eg(e)):e.q_.set("Unknown")}async function ag(e,t,n){if(e.q_.set("Online"),t instanceof _f&&2===t.state&&t.cause)try{await async function(e,t){const n=t.cause;for(const i of t.targetIds)e.N_.has(i)&&(await e.remoteSyncer.rejectListen(i,n),e.N_.delete(i),e.Q_.removeTarget(i))}(e,t)}catch(i){Zh("RemoteStore","Failed to remove targets %s: %s ",t.targetIds.join(","),i),await cg(e,i)}else if(t instanceof gf?e.Q_.Ke(t):t instanceof mf?e.Q_.He(t):e.Q_.We(t),!n.isEqual(Il.min()))try{const t=await Cp(e.localStore);n.compareTo(t)>=0&&await function(e,t){const n=e.Q_.rt(t);return n.targetChanges.forEach((n,i)=>{if(n.resumeToken.approximateByteSize()>0){const s=e.N_.get(i);s&&e.N_.set(i,s.withResumeToken(n.resumeToken,t))}}),n.targetMismatches.forEach((t,n)=>{const i=e.N_.get(t);if(!i)return;e.N_.set(t,i.withResumeToken(Gl.EMPTY_BYTE_STRING,i.snapshotVersion)),Zp(e,t);const s=new Xf(i.target,t,n,i.sequenceNumber);Xp(e,s)}),e.remoteSyncer.applyRemoteEvent(n)}(e,n)}catch(s){Zh("RemoteStore","Failed to raise snapshot:",s),await cg(e,s)}}async function cg(e,t,n){if(!Ol(t))throw t;e.L_.add(1),await Qp(e),e.q_.set("Offline"),n||(n=()=>Cp(e.localStore)),e.asyncQueue.enqueueRetryable(async()=>{Zh("RemoteStore","Retrying IndexedDB access"),await n(),e.L_.delete(1),await Gp(e)})}function hg(e,t){return t().catch(n=>cg(e,n,t))}async function lg(e){const t=rl(e),n=Tg(t);let i=t.O_.length>0?t.O_[t.O_.length-1].batchId:-1;for(;ug(t);)try{const e=await Sp(t.localStore,i);if(null===e){0===t.O_.length&&n.o_();break}i=e.batchId,dg(t,e)}catch(s){await cg(t,s)}fg(t)&&pg(t)}function ug(e){return ng(e)&&e.O_.length<10}function dg(e,t){e.O_.push(t);const n=Tg(e);n.r_()&&n.V_&&n.m_(t.mutations)}function fg(e){return ng(e)&&!Tg(e).n_()&&e.O_.length>0}function pg(e){Tg(e).start()}async function gg(e){Tg(e).p_()}async function mg(e){const t=Tg(e);for(const n of e.O_)t.m_(n.mutations)}async function _g(e,t,n){const i=e.O_.shift(),s=tf.from(i,t,n);await hg(e,()=>e.remoteSyncer.applySuccessfulWrite(s)),await lg(e)}async function yg(e,t){t&&Tg(e).V_&&await async function(e,t){if(function(e){switch(e){default:return il();case ol.CANCELLED:case ol.UNKNOWN:case ol.DEADLINE_EXCEEDED:case ol.RESOURCE_EXHAUSTED:case ol.INTERNAL:case ol.UNAVAILABLE:case ol.UNAUTHENTICATED:return!1;case ol.INVALID_ARGUMENT:case ol.NOT_FOUND:case ol.ALREADY_EXISTS:case ol.PERMISSION_DENIED:case ol.FAILED_PRECONDITION:case ol.ABORTED:case ol.OUT_OF_RANGE:case ol.UNIMPLEMENTED:case ol.DATA_LOSS:return!0}}(n=t.code)&&n!==ol.ABORTED){const n=e.O_.shift();Tg(e).s_(),await hg(e,()=>e.remoteSyncer.rejectFailedWrite(n.batchId,t)),await lg(e)}var n}(e,t),fg(e)&&pg(e)}async function vg(e,t){const n=rl(e);n.asyncQueue.verifyOperationInProgress(),Zh("RemoteStore","RemoteStore received new credentials");const i=ng(n);n.L_.add(3),await Qp(n),i&&n.q_.set("Unknown"),await n.remoteSyncer.handleCredentialChange(t),n.L_.delete(3),await Gp(n)}function wg(e){return e.K_||(e.K_=function(e,t,n){const i=rl(e);return i.w_(),new zp(t,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,n)}(e.datastore,e.asyncQueue,{Eo:sg.bind(null,e),Ro:rg.bind(null,e),mo:og.bind(null,e),d_:ag.bind(null,e)}),e.B_.push(async t=>{t?(e.K_.s_(),tg(e)?eg(e):e.q_.set("Unknown")):(await e.K_.stop(),ig(e))})),e.K_}function Tg(e){return e.U_||(e.U_=function(e,t,n){const i=rl(e);return i.w_(),new $p(t,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,n)}(e.datastore,e.asyncQueue,{Eo:()=>Promise.resolve(),Ro:gg.bind(null,e),mo:yg.bind(null,e),f_:mg.bind(null,e),g_:_g.bind(null,e)}),e.B_.push(async t=>{t?(e.U_.s_(),await lg(e)):(await e.U_.stop(),e.O_.length>0&&(Zh("RemoteStore",`Stopping write stream with ${e.O_.length} pending writes`),e.O_=[]))})),e.U_
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */}class Ig{constructor(e,t,n,i,s){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=n,this.op=i,this.removalCallback=s,this.deferred=new cl,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(e=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,n,i,s){const r=Date.now()+n,o=new Ig(e,t,r,i,s);return o.start(n),o}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){null!==this.timerHandle&&(this.clearTimeout(),this.deferred.reject(new al(ol.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>null!==this.timerHandle?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){null!==this.timerHandle&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function bg(e,t){if(el("AsyncQueue",`${t}: ${e}`),Ol(e))return new al(ol.UNAVAILABLE,`${t}: ${e}`);throw e}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Cg{constructor(e){this.comparator=e?(t,n)=>e(t,n)||kl.comparator(t.key,n.key):(e,t)=>kl.comparator(e.key,t.key),this.keyedMap=fd(),this.sortedSet=new jl(this.comparator)}static emptySet(e){return new Cg(e.comparator)}has(e){return null!=this.keyedMap.get(e)}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((t,n)=>(e(t),!1))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof Cg))return!1;if(this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),n=e.sortedSet.getIterator();for(;t.hasNext();){const e=t.getNext().key,i=n.getNext().key;if(!e.isEqual(i))return!1}return!0}toString(){const e=[];return this.forEach(t=>{e.push(t.toString())}),0===e.length?"DocumentSet ()":"DocumentSet (\n  "+e.join("  \n")+"\n)"}copy(e,t){const n=new Cg;return n.comparator=this.comparator,n.keyedMap=e,n.sortedSet=t,n}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Eg{constructor(){this.W_=new jl(kl.comparator)}track(e){const t=e.doc.key,n=this.W_.get(t);n?0!==e.type&&3===n.type?this.W_=this.W_.insert(t,e):3===e.type&&1!==n.type?this.W_=this.W_.insert(t,{type:n.type,doc:e.doc}):2===e.type&&2===n.type?this.W_=this.W_.insert(t,{type:2,doc:e.doc}):2===e.type&&0===n.type?this.W_=this.W_.insert(t,{type:0,doc:e.doc}):1===e.type&&0===n.type?this.W_=this.W_.remove(t):1===e.type&&2===n.type?this.W_=this.W_.insert(t,{type:1,doc:n.doc}):0===e.type&&1===n.type?this.W_=this.W_.insert(t,{type:2,doc:e.doc}):il():this.W_=this.W_.insert(t,e)}G_(){const e=[];return this.W_.inorderTraversal((t,n)=>{e.push(n)}),e}}class Sg{constructor(e,t,n,i,s,r,o,a,c){this.query=e,this.docs=t,this.oldDocs=n,this.docChanges=i,this.mutatedKeys=s,this.fromCache=r,this.syncStateChanged=o,this.excludesMetadataChanges=a,this.hasCachedResults=c}static fromInitialDocuments(e,t,n,i,s){const r=[];return t.forEach(e=>{r.push({type:0,doc:e})}),new Sg(e,t,Cg.emptySet(t),r,n,i,!0,!1,s)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&id(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,n=e.docChanges;if(t.length!==n.length)return!1;for(let i=0;i<t.length;i++)if(t[i].type!==n[i].type||!t[i].doc.isEqual(n[i].doc))return!1;return!0}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class kg{constructor(){this.z_=void 0,this.j_=[]}H_(){return this.j_.some(e=>e.J_())}}class Ng{constructor(){this.queries=Ag(),this.onlineState="Unknown",this.Y_=new Set}terminate(){!function(e,t){const n=rl(e),i=n.queries;n.queries=Ag(),i.forEach((e,n)=>{for(const i of n.j_)i.onError(t)})}(this,new al(ol.ABORTED,"Firestore shutting down"))}}function Ag(){return new hd(e=>sd(e),id)}async function Rg(e,t){const n=rl(e);let i=3;const s=t.query;let r=n.queries.get(s);r?!r.H_()&&t.J_()&&(i=2):(r=new kg,i=t.J_()?0:1);try{switch(i){case 0:r.z_=await n.onListen(s,!0);break;case 1:r.z_=await n.onListen(s,!1);break;case 2:await n.onFirstRemoteStoreListen(s)}}catch(o){const e=bg(o,`Initialization of query '${rd(t.query)}' failed`);return void t.onError(e)}n.queries.set(s,r),r.j_.push(t),t.Z_(n.onlineState),r.z_&&t.X_(r.z_)&&Og(n)}async function Pg(e,t){const n=rl(e),i=t.query;let s=3;const r=n.queries.get(i);if(r){const e=r.j_.indexOf(t);e>=0&&(r.j_.splice(e,1),0===r.j_.length?s=t.J_()?0:1:!r.H_()&&t.J_()&&(s=2))}switch(s){case 0:return n.queries.delete(i),n.onUnlisten(i,!0);case 1:return n.queries.delete(i),n.onUnlisten(i,!1);case 2:return n.onLastRemoteStoreUnlisten(i);default:return}}function Dg(e,t){const n=rl(e);let i=!1;for(const s of t){const e=s.query,t=n.queries.get(e);if(t){for(const e of t.j_)e.X_(s)&&(i=!0);t.z_=s}}i&&Og(n)}function xg(e,t,n){const i=rl(e),s=i.queries.get(t);if(s)for(const r of s.j_)r.onError(n);i.queries.delete(t)}function Og(e){e.Y_.forEach(e=>{e.next()})}var Lg,Mg;(Mg=Lg||(Lg={})).ea="default",Mg.Cache="cache";class Fg{constructor(e,t,n){this.query=e,this.ta=t,this.na=!1,this.ra=null,this.onlineState="Unknown",this.options=n||{}}X_(e){if(!this.options.includeMetadataChanges){const t=[];for(const n of e.docChanges)3!==n.type&&t.push(n);e=new Sg(e.query,e.docs,e.oldDocs,t,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.na?this.ia(e)&&(this.ta.next(e),t=!0):this.sa(e,this.onlineState)&&(this.oa(e),t=!0),this.ra=e,t}onError(e){this.ta.error(e)}Z_(e){this.onlineState=e;let t=!1;return this.ra&&!this.na&&this.sa(this.ra,e)&&(this.oa(this.ra),t=!0),t}sa(e,t){if(!e.fromCache)return!0;if(!this.J_())return!0;const n="Offline"!==t;return(!this.options._a||!n)&&(!e.docs.isEmpty()||e.hasCachedResults||"Offline"===t)}ia(e){if(e.docChanges.length>0)return!0;const t=this.ra&&this.ra.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&!0===this.options.includeMetadataChanges}oa(e){e=Sg.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.na=!0,this.ta.next(e)}J_(){return this.options.source!==Lg.Cache}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Ug{constructor(e){this.key=e}}class Vg{constructor(e){this.key=e}}class qg{constructor(e,t){this.query=e,this.Ta=t,this.Ea=null,this.hasCachedResults=!1,this.current=!1,this.da=wd(),this.mutatedKeys=wd(),this.Aa=ad(e),this.Ra=new Cg(this.Aa)}get Va(){return this.Ta}ma(e,t){const n=t?t.fa:new Eg,i=t?t.Ra:this.Ra;let s=t?t.mutatedKeys:this.mutatedKeys,r=i,o=!1;const a="F"===this.query.limitType&&i.size===this.query.limit?i.last():null,c="L"===this.query.limitType&&i.size===this.query.limit?i.first():null;if(e.inorderTraversal((e,t)=>{const h=i.get(e),l=od(this.query,t)?t:null,u=!!h&&this.mutatedKeys.has(h.key),d=!!l&&(l.hasLocalMutations||this.mutatedKeys.has(l.key)&&l.hasCommittedMutations);let f=!1;h&&l?h.data.isEqual(l.data)?u!==d&&(n.track({type:3,doc:l}),f=!0):this.ga(h,l)||(n.track({type:2,doc:l}),f=!0,(a&&this.Aa(l,a)>0||c&&this.Aa(l,c)<0)&&(o=!0)):!h&&l?(n.track({type:0,doc:l}),f=!0):h&&!l&&(n.track({type:1,doc:h}),f=!0,(a||c)&&(o=!0)),f&&(l?(r=r.add(l),s=d?s.add(e):s.delete(e)):(r=r.delete(e),s=s.delete(e)))}),null!==this.query.limit)for(;r.size>this.query.limit;){const e="F"===this.query.limitType?r.last():r.first();r=r.delete(e.key),s=s.delete(e.key),n.track({type:1,doc:e})}return{Ra:r,fa:n,ns:o,mutatedKeys:s}}ga(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,n,i){const s=this.Ra;this.Ra=e.Ra,this.mutatedKeys=e.mutatedKeys;const r=e.fa.G_();r.sort((e,t)=>function(e,t){const n=e=>{switch(e){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return il()}};return n(e)-n(t)}(e.type,t.type)||this.Aa(e.doc,t.doc)),this.pa(n),i=null!=i&&i;const o=t&&!i?this.ya():[],a=0===this.da.size&&this.current&&!i?1:0,c=a!==this.Ea;return this.Ea=a,0!==r.length||c?{snapshot:new Sg(this.query,e.Ra,s,r,e.mutatedKeys,0===a,c,!1,!!n&&n.resumeToken.approximateByteSize()>0),wa:o}:{wa:o}}Z_(e){return this.current&&"Offline"===e?(this.current=!1,this.applyChanges({Ra:this.Ra,fa:new Eg,mutatedKeys:this.mutatedKeys,ns:!1},!1)):{wa:[]}}Sa(e){return!this.Ta.has(e)&&!!this.Ra.has(e)&&!this.Ra.get(e).hasLocalMutations}pa(e){e&&(e.addedDocuments.forEach(e=>this.Ta=this.Ta.add(e)),e.modifiedDocuments.forEach(e=>{}),e.removedDocuments.forEach(e=>this.Ta=this.Ta.delete(e)),this.current=e.current)}ya(){if(!this.current)return[];const e=this.da;this.da=wd(),this.Ra.forEach(e=>{this.Sa(e.key)&&(this.da=this.da.add(e.key))});const t=[];return e.forEach(e=>{this.da.has(e)||t.push(new Vg(e))}),this.da.forEach(n=>{e.has(n)||t.push(new Ug(n))}),t}ba(e){this.Ta=e.Ts,this.da=wd();const t=this.ma(e.documents);return this.applyChanges(t,!0)}Da(){return Sg.fromInitialDocuments(this.query,this.Ra,this.mutatedKeys,0===this.Ea,this.hasCachedResults)}}class jg{constructor(e,t,n){this.query=e,this.targetId=t,this.view=n}}class Bg{constructor(e){this.key=e,this.va=!1}}class zg{constructor(e,t,n,i,s,r){this.localStore=e,this.remoteStore=t,this.eventManager=n,this.sharedClientState=i,this.currentUser=s,this.maxConcurrentLimboResolutions=r,this.Ca={},this.Fa=new hd(e=>sd(e),id),this.Ma=new Map,this.xa=new Set,this.Oa=new jl(kl.comparator),this.Na=new Map,this.La=new lp,this.Ba={},this.ka=new Map,this.qa=ip.kn(),this.onlineState="Unknown",this.Qa=void 0}get isPrimaryClient(){return!0===this.Qa}}async function $g(e,t,n=!0){const i=um(e);let s;const r=i.Fa.get(t);return r?(i.sharedClientState.addLocalQueryTarget(r.targetId),s=r.view.Da()):s=await Hg(i,t,n,!0),s}async function Wg(e,t){const n=um(e);await Hg(n,t,!0,!1)}async function Hg(e,t,n,i){const s=await function(e,t){const n=rl(e);return n.persistence.runTransaction("Allocate target","readwrite",e=>{let i;return n.Ur.getTargetData(e,t).next(s=>s?(i=s,xl.resolve(i)):n.Ur.allocateTargetId(e).next(s=>(i=new Xf(t,s,"TargetPurposeListen",e.currentSequenceNumber),n.Ur.addTargetData(e,i).next(()=>i))))}).then(e=>{const i=n.os.get(e.targetId);return(null===i||e.snapshotVersion.compareTo(i.snapshotVersion)>0)&&(n.os=n.os.insert(e.targetId,e),n._s.set(t,e.targetId)),e})}(e.localStore,ed(t)),r=s.targetId,o=e.sharedClientState.addLocalQueryTarget(r,n);let a;return i&&(a=await async function(e,t,n,i,s){e.Ka=(t,n,i)=>async function(e,t,n,i){let s=t.view.ma(n);s.ns&&(s=await Np(e.localStore,t.query,!1).then(({documents:e})=>t.view.ma(e,s)));const r=i&&i.targetChanges.get(t.targetId),o=i&&null!=i.targetMismatches.get(t.targetId),a=t.view.applyChanges(s,e.isPrimaryClient,r,o);return rm(e,t.targetId,a.wa),a.snapshot}(e,t,n,i);const r=await Np(e.localStore,t,!0),o=new qg(t,r.Ts),a=o.ma(r.documents),c=pf.createSynthesizedTargetChangeForCurrentChange(n,i&&"Offline"!==e.onlineState,s),h=o.applyChanges(a,e.isPrimaryClient,c);rm(e,n,h.wa);const l=new jg(t,n,o);return e.Fa.set(t,l),e.Ma.has(n)?e.Ma.get(n).push(t):e.Ma.set(n,[t]),h.snapshot}(e,t,r,"current"===o,s.resumeToken)),e.isPrimaryClient&&n&&Yp(e.remoteStore,s),a}async function Kg(e,t,n){const i=rl(e),s=i.Fa.get(t),r=i.Ma.get(s.targetId);if(r.length>1)return i.Ma.set(s.targetId,r.filter(e=>!id(e,t))),void i.Fa.delete(t);i.isPrimaryClient?(i.sharedClientState.removeLocalQueryTarget(s.targetId),i.sharedClientState.isActiveQueryTarget(s.targetId)||await kp(i.localStore,s.targetId,!1).then(()=>{i.sharedClientState.clearQueryState(s.targetId),n&&Jp(i.remoteStore,s.targetId),im(i,s.targetId)}).catch(Dl)):(im(i,s.targetId),await kp(i.localStore,s.targetId,!0))}async function Gg(e,t){const n=rl(e),i=n.Fa.get(t),s=n.Ma.get(i.targetId);n.isPrimaryClient&&1===s.length&&(n.sharedClientState.removeLocalQueryTarget(i.targetId),Jp(n.remoteStore,i.targetId))}async function Qg(e,t,n){const i=function(e){const t=rl(e);return t.remoteStore.remoteSyncer.applySuccessfulWrite=Zg.bind(null,t),t.remoteStore.remoteSyncer.rejectFailedWrite=em.bind(null,t),t}(e);try{const e=await function(e,t){const n=rl(e),i=Tl.now(),s=t.reduce((e,t)=>e.add(t.key),wd());let r,o;return n.persistence.runTransaction("Locally write mutations","readwrite",e=>{let a=ud(),c=wd();return n.cs.getEntries(e,s).next(e=>{a=e,a.forEach((e,t)=>{t.isValidDocument()||(c=c.add(e))})}).next(()=>n.localDocuments.getOverlayedDocuments(e,a)).next(s=>{r=s;const o=[];for(const e of t){const t=Wd(e,r.get(e.key).overlayedDocument);null!=t&&o.push(new Gd(e.key,t,Tu(t.value.mapValue),Vd.exists(!0)))}return n.mutationQueue.addMutationBatch(e,i,o,t)}).next(t=>{o=t;const i=t.applyToLocalDocumentSet(r,c);return n.documentOverlayCache.saveOverlays(e,t.batchId,i)})}).then(()=>({batchId:o.batchId,changes:pd(r)}))}(i.localStore,t);i.sharedClientState.addPendingMutation(e.batchId),function(e,t,n){let i=e.Ba[e.currentUser.toKey()];i||(i=new jl(vl)),i=i.insert(t,n),e.Ba[e.currentUser.toKey()]=i}(i,e.batchId,n),await cm(i,e.changes),await lg(i.remoteStore)}catch(s){const e=bg(s,"Failed to persist write");n.reject(e)}}async function Yg(e,t){const n=rl(e);try{const e=await Ep(n.localStore,t);t.targetChanges.forEach((e,t)=>{const i=n.Na.get(t);i&&(sl(e.addedDocuments.size+e.modifiedDocuments.size+e.removedDocuments.size<=1),e.addedDocuments.size>0?i.va=!0:e.modifiedDocuments.size>0?sl(i.va):e.removedDocuments.size>0&&(sl(i.va),i.va=!1))}),await cm(n,e,t)}catch(i){await Dl(i)}}function Jg(e,t,n){const i=rl(e);if(i.isPrimaryClient&&0===n||!i.isPrimaryClient&&1===n){const e=[];i.Fa.forEach((n,i)=>{const s=i.view.Z_(t);s.snapshot&&e.push(s.snapshot)}),function(e,t){const n=rl(e);n.onlineState=t;let i=!1;n.queries.forEach((e,n)=>{for(const s of n.j_)s.Z_(t)&&(i=!0)}),i&&Og(n)}(i.eventManager,t),e.length&&i.Ca.d_(e),i.onlineState=t,i.isPrimaryClient&&i.sharedClientState.setOnlineState(t)}}async function Xg(e,t,n){const i=rl(e);i.sharedClientState.updateQueryState(t,"rejected",n);const s=i.Na.get(t),r=s&&s.key;if(r){let e=new jl(kl.comparator);e=e.insert(r,Iu.newNoDocument(r,Il.min()));const n=wd().add(r),s=new ff(Il.min(),new Map,new jl(vl),e,n);await Yg(i,s),i.Oa=i.Oa.remove(r),i.Na.delete(t),am(i)}else await kp(i.localStore,t,!1).then(()=>im(i,t,n)).catch(Dl)}async function Zg(e,t){const n=rl(e),i=t.batch.batchId;try{const e=await function(e,t){const n=rl(e);return n.persistence.runTransaction("Acknowledge batch","readwrite-primary",e=>{const i=t.batch.keys(),s=n.cs.newChangeBuffer({trackRemovals:!0});return function(e,t,n,i){const s=n.batch,r=s.keys();let o=xl.resolve();return r.forEach(e=>{o=o.next(()=>i.getEntry(t,e)).next(t=>{const r=n.docVersions.get(e);sl(null!==r),t.version.compareTo(r)<0&&(s.applyToRemoteDocument(t,n),t.isValidDocument()&&(t.setReadTime(n.commitVersion),i.addEntry(t)))})}),o.next(()=>e.mutationQueue.removeMutationBatch(t,s))}(n,e,t,s).next(()=>s.apply(e)).next(()=>n.mutationQueue.performConsistencyCheck(e)).next(()=>n.documentOverlayCache.removeOverlaysForBatchId(e,i,t.batch.batchId)).next(()=>n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(e,function(e){let t=wd();for(let n=0;n<e.mutationResults.length;++n)e.mutationResults[n].transformResults.length>0&&(t=t.add(e.batch.mutations[n].key));return t}(t))).next(()=>n.localDocuments.getDocuments(e,i))})}(n.localStore,t);nm(n,i,null),tm(n,i),n.sharedClientState.updateMutationState(i,"acknowledged"),await cm(n,e)}catch(s){await Dl(s)}}async function em(e,t,n){const i=rl(e);try{const e=await function(e,t){const n=rl(e);return n.persistence.runTransaction("Reject batch","readwrite-primary",e=>{let i;return n.mutationQueue.lookupMutationBatch(e,t).next(t=>(sl(null!==t),i=t.keys(),n.mutationQueue.removeMutationBatch(e,t))).next(()=>n.mutationQueue.performConsistencyCheck(e)).next(()=>n.documentOverlayCache.removeOverlaysForBatchId(e,i,t)).next(()=>n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(e,i)).next(()=>n.localDocuments.getDocuments(e,i))})}(i.localStore,t);nm(i,t,n),tm(i,t),i.sharedClientState.updateMutationState(t,"rejected",n),await cm(i,e)}catch(s){await Dl(s)}}function tm(e,t){(e.ka.get(t)||[]).forEach(e=>{e.resolve()}),e.ka.delete(t)}function nm(e,t,n){const i=rl(e);let s=i.Ba[i.currentUser.toKey()];if(s){const e=s.get(t);e&&(n?e.reject(n):e.resolve(),s=s.remove(t)),i.Ba[i.currentUser.toKey()]=s}}function im(e,t,n=null){e.sharedClientState.removeLocalQueryTarget(t);for(const i of e.Ma.get(t))e.Fa.delete(i),n&&e.Ca.$a(i,n);e.Ma.delete(t),e.isPrimaryClient&&e.La.gr(t).forEach(t=>{e.La.containsKey(t)||sm(e,t)})}function sm(e,t){e.xa.delete(t.path.canonicalString());const n=e.Oa.get(t);null!==n&&(Jp(e.remoteStore,n),e.Oa=e.Oa.remove(t),e.Na.delete(n),am(e))}function rm(e,t,n){for(const i of n)i instanceof Ug?(e.La.addReference(i.key,t),om(e,i)):i instanceof Vg?(Zh("SyncEngine","Document no longer in limbo: "+i.key),e.La.removeReference(i.key,t),e.La.containsKey(i.key)||sm(e,i.key)):il()}function om(e,t){const n=t.key,i=n.path.canonicalString();e.Oa.get(n)||e.xa.has(i)||(Zh("SyncEngine","New document in limbo: "+n),e.xa.add(i),am(e))}function am(e){for(;e.xa.size>0&&e.Oa.size<e.maxConcurrentLimboResolutions;){const t=e.xa.values().next().value;e.xa.delete(t);const n=new kl(Cl.fromString(t)),i=e.qa.next();e.Na.set(i,new Bg(n)),e.Oa=e.Oa.insert(n,i),Yp(e.remoteStore,new Xf(ed(Yu(n.path)),i,"TargetPurposeLimboResolution",Ll.oe))}}async function cm(e,t,n){const i=rl(e),s=[],r=[],o=[];i.Fa.isEmpty()||(i.Fa.forEach((e,a)=>{o.push(i.Ka(a,t,n).then(e=>{var t;if((e||n)&&i.isPrimaryClient){const s=e?!e.fromCache:null===(t=null==n?void 0:n.targetChanges.get(a.targetId))||void 0===t?void 0:t.current;i.sharedClientState.updateQueryState(a.targetId,s?"current":"not-current")}if(e){s.push(e);const t=vp.Wi(a.targetId,e);r.push(t)}}))}),await Promise.all(o),i.Ca.d_(s),await async function(e,t){const n=rl(e);try{await n.persistence.runTransaction("notifyLocalViewChanges","readwrite",e=>xl.forEach(t,t=>xl.forEach(t.$i,i=>n.persistence.referenceDelegate.addReference(e,t.targetId,i)).next(()=>xl.forEach(t.Ui,i=>n.persistence.referenceDelegate.removeReference(e,t.targetId,i)))))}catch(i){if(!Ol(i))throw i;Zh("LocalStore","Failed to update sequence numbers: "+i)}for(const s of t){const e=s.targetId;if(!s.fromCache){const t=n.os.get(e),i=t.snapshotVersion,s=t.withLastLimboFreeSnapshotVersion(i);n.os=n.os.insert(e,s)}}}(i.localStore,r))}async function hm(e,t){const n=rl(e);if(!n.currentUser.isEqual(t)){Zh("SyncEngine","User change. New user:",t.toKey());const e=await bp(n.localStore,t);n.currentUser=t,s="'waitForPendingWrites' promise is rejected due to a user change.",(i=n).ka.forEach(e=>{e.forEach(e=>{e.reject(new al(ol.CANCELLED,s))})}),i.ka.clear(),n.sharedClientState.handleUserChange(t,e.removedBatchIds,e.addedBatchIds),await cm(n,e.hs)}var i,s}function lm(e,t){const n=rl(e),i=n.Na.get(t);if(i&&i.va)return wd().add(i.key);{let e=wd();const i=n.Ma.get(t);if(!i)return e;for(const t of i){const i=n.Fa.get(t);e=e.unionWith(i.view.Va)}return e}}function um(e){const t=rl(e);return t.remoteStore.remoteSyncer.applyRemoteEvent=Yg.bind(null,t),t.remoteStore.remoteSyncer.getRemoteKeysForTarget=lm.bind(null,t),t.remoteStore.remoteSyncer.rejectListen=Xg.bind(null,t),t.Ca.d_=Dg.bind(null,t.eventManager),t.Ca.$a=xg.bind(null,t.eventManager),t}class dm{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=qp(e.databaseInfo.databaseId),this.sharedClientState=this.Wa(e),this.persistence=this.Ga(e),await this.persistence.start(),this.localStore=this.za(e),this.gcScheduler=this.ja(e,this.localStore),this.indexBackfillerScheduler=this.Ha(e,this.localStore)}ja(e,t){return null}Ha(e,t){return null}za(e){return function(e,t,n,i){return new Ip(e,t,n,i)}(this.persistence,new Tp,e.initialUser,this.serializer)}Ga(e){return new mp(yp.Zr,this.serializer)}Wa(e){return new Rp}async terminate(){var e,t;null===(e=this.gcScheduler)||void 0===e||e.stop(),null===(t=this.indexBackfillerScheduler)||void 0===t||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}dm.provider={build:()=>new dm};class fm{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=e=>Jg(this.syncEngine,e,1),this.remoteStore.remoteSyncer.handleCredentialChange=hm.bind(null,this.syncEngine),await async function(e,t){const n=rl(e);t?(n.L_.delete(2),await Gp(n)):t||(n.L_.add(2),await Qp(n),n.q_.set("Unknown"))}(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return new Ng}createDatastore(e){const t=qp(e.databaseInfo.databaseId),n=(i=e.databaseInfo,new Up(i));var i;return function(e,t,n,i){return new Wp(e,t,n,i)}(e.authCredentials,e.appCheckCredentials,n,t)}createRemoteStore(e){return t=this.localStore,n=this.datastore,i=e.asyncQueue,s=e=>Jg(this.syncEngine,e,0),r=Dp.D()?new Dp:new Pp,new Kp(t,n,i,s,r);var t,n,i,s,r}createSyncEngine(e,t){return function(e,t,n,i,s,r,o){const a=new zg(e,t,n,i,s,r);return o&&(a.Qa=!0),a}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await async function(e){const t=rl(e);Zh("RemoteStore","RemoteStore shutting down."),t.L_.add(5),await Qp(t),t.k_.shutdown(),t.q_.set("Unknown")}(this.remoteStore),null===(e=this.datastore)||void 0===e||e.terminate(),null===(t=this.eventManager)||void 0===t||t.terminate()}}fm.provider={build:()=>new fm};
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
class pm{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ya(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ya(this.observer.error,e):el("Uncaught Error in snapshot listener:",e.toString()))}Za(){this.muted=!0}Ya(e,t){setTimeout(()=>{this.muted||e(t)},0)}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class gm{constructor(e,t,n,i,s){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=n,this.databaseInfo=i,this.user=Qh.UNAUTHENTICATED,this.clientId=yl.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=s,this.authCredentials.start(n,async e=>{Zh("FirestoreClient","Received user=",e.uid),await this.authCredentialListener(e),this.user=e}),this.appCheckCredentials.start(n,e=>(Zh("FirestoreClient","Received new app check token=",e),this.appCheckCredentialListener(e,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new cl;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const n=bg(t,"Failed to shutdown persistence");e.reject(n)}}),e.promise}}async function mm(e,t){e.asyncQueue.verifyOperationInProgress(),Zh("FirestoreClient","Initializing OfflineComponentProvider");const n=e.configuration;await t.initialize(n);let i=n.initialUser;e.setCredentialChangeListener(async e=>{i.isEqual(e)||(await bp(t.localStore,e),i=e)}),t.persistence.setDatabaseDeletedListener(()=>e.terminate()),e._offlineComponents=t}async function _m(e,t){e.asyncQueue.verifyOperationInProgress();const n=await async function(e){if(!e._offlineComponents)if(e._uninitializedComponentsProvider){Zh("FirestoreClient","Using user provided OfflineComponentProvider");try{await mm(e,e._uninitializedComponentsProvider._offline)}catch(t){const s=t;if(!("FirebaseError"===(n=s).name?n.code===ol.FAILED_PRECONDITION||n.code===ol.UNIMPLEMENTED:!("undefined"!=typeof DOMException&&n instanceof DOMException)||22===n.code||20===n.code||11===n.code))throw s;tl("Error using user provided cache. Falling back to memory cache: "+s),await mm(e,new dm)}}else Zh("FirestoreClient","Using default OfflineComponentProvider"),await mm(e,new dm);var n;return e._offlineComponents}(e);Zh("FirestoreClient","Initializing OnlineComponentProvider"),await t.initialize(n,e.configuration),e.setCredentialChangeListener(e=>vg(t.remoteStore,e)),e.setAppCheckTokenChangeListener((e,n)=>vg(t.remoteStore,n)),e._onlineComponents=t}async function ym(e){return e._onlineComponents||(e._uninitializedComponentsProvider?(Zh("FirestoreClient","Using user provided OnlineComponentProvider"),await _m(e,e._uninitializedComponentsProvider._online)):(Zh("FirestoreClient","Using default OnlineComponentProvider"),await _m(e,new fm))),e._onlineComponents}async function vm(e){const t=await ym(e),n=t.eventManager;return n.onListen=$g.bind(null,t.syncEngine),n.onUnlisten=Kg.bind(null,t.syncEngine),n.onFirstRemoteStoreListen=Wg.bind(null,t.syncEngine),n.onLastRemoteStoreUnlisten=Gg.bind(null,t.syncEngine),n}
/**
   * @license
   * Copyright 2023 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
function wm(e){const t={};return void 0!==e.timeoutSeconds&&(t.timeoutSeconds=e.timeoutSeconds),t
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */}const Tm=new Map;
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */function Im(e,t,n){if(!n)throw new al(ol.INVALID_ARGUMENT,`Function ${e}() cannot be called with an empty ${t}.`)}function bm(e){if(!kl.isDocumentKey(e))throw new al(ol.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${e} has ${e.length}.`)}function Cm(e){if(kl.isDocumentKey(e))throw new al(ol.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${e} has ${e.length}.`)}function Em(e){if(void 0===e)return"undefined";if(null===e)return"null";if("string"==typeof e)return e.length>20&&(e=`${e.substring(0,20)}...`),JSON.stringify(e);if("number"==typeof e||"boolean"==typeof e)return""+e;if("object"==typeof e){if(e instanceof Array)return"an array";{const n=(t=e).constructor?t.constructor.name:null;return n?`a custom ${n} object`:"an object"}}var t;return"function"==typeof e?"a function":il()}function Sm(e,t){if("_delegate"in e&&(e=e._delegate),!(e instanceof t)){if(t.name===e.constructor.name)throw new al(ol.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const n=Em(e);throw new al(ol.INVALID_ARGUMENT,`Expected type '${t.name}', but it was: ${n}`)}}return e}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
class km{constructor(e){var t,n;if(void 0===e.host){if(void 0!==e.ssl)throw new al(ol.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host="firestore.googleapis.com",this.ssl=!0}else this.host=e.host,this.ssl=null===(t=e.ssl)||void 0===t||t;if(this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,void 0===e.cacheSizeBytes)this.cacheSizeBytes=41943040;else{if(-1!==e.cacheSizeBytes&&e.cacheSizeBytes<1048576)throw new al(ol.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}(function(e,t,n,i){if(!0===t&&!0===i)throw new al(ol.INVALID_ARGUMENT,`${e} and ${n} cannot be used together.`)})("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:void 0===e.experimentalAutoDetectLongPolling?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=wm(null!==(n=e.experimentalLongPollingOptions)&&void 0!==n?n:{}),function(e){if(void 0!==e.timeoutSeconds){if(isNaN(e.timeoutSeconds))throw new al(ol.INVALID_ARGUMENT,`invalid long polling timeout: ${e.timeoutSeconds} (must not be NaN)`);if(e.timeoutSeconds<5)throw new al(ol.INVALID_ARGUMENT,`invalid long polling timeout: ${e.timeoutSeconds} (minimum allowed value is 5)`);if(e.timeoutSeconds>30)throw new al(ol.INVALID_ARGUMENT,`invalid long polling timeout: ${e.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&(t=this.experimentalLongPollingOptions,n=e.experimentalLongPollingOptions,t.timeoutSeconds===n.timeoutSeconds)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams;var t,n}}class Nm{constructor(e,t,n,i){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=n,this._app=i,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new km({}),this._settingsFrozen=!1,this._terminateTask="notTerminated"}get app(){if(!this._app)throw new al(ol.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return"notTerminated"!==this._terminateTask}_setSettings(e){if(this._settingsFrozen)throw new al(ol.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new km(e),void 0!==e.credentials&&(this._authCredentials=function(e){if(!e)return new ll;switch(e.type){case"firstParty":return new pl(e.sessionIndex||"0",e.iamToken||null,e.authTokenFactory||null);case"provider":return e.client;default:throw new al(ol.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return"notTerminated"===this._terminateTask&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){"notTerminated"===this._terminateTask?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(e){const t=Tm.get(e);t&&(Zh("ComponentProvider","Removing Datastore"),Tm.delete(e),t.terminate())}(this),Promise.resolve()}}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
class Am{constructor(e,t,n){this.converter=t,this._query=n,this.type="query",this.firestore=e}withConverter(e){return new Am(this.firestore,e,this._query)}}class Rm{constructor(e,t,n){this.converter=t,this._key=n,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Pm(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new Rm(this.firestore,e,this._key)}}class Pm extends Am{constructor(e,t,n){super(e,t,Yu(n)),this._path=n,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new Rm(this.firestore,null,new kl(e))}withConverter(e){return new Pm(this.firestore,e,this._path)}}function Dm(e,t,...n){if(e=z(e),Im("collection","path",t),e instanceof Nm){const i=Cl.fromString(t,...n);return Cm(i),new Pm(e,null,i)}{if(!(e instanceof Rm||e instanceof Pm))throw new al(ol.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const i=e._path.child(Cl.fromString(t,...n));return Cm(i),new Pm(e.firestore,null,i)}}function xm(e,t,...n){if(e=z(e),1===arguments.length&&(t=yl.newId()),Im("doc","path",t),e instanceof Nm){const i=Cl.fromString(t,...n);return bm(i),new Rm(e,null,new kl(i))}{if(!(e instanceof Rm||e instanceof Pm))throw new al(ol.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const i=e._path.child(Cl.fromString(t,...n));return bm(i),new Rm(e.firestore,e instanceof Pm?e.converter:null,new kl(i))}}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Om{constructor(e=Promise.resolve()){this.Pu=[],this.Iu=!1,this.Tu=[],this.Eu=null,this.du=!1,this.Au=!1,this.Ru=[],this.t_=new jp(this,"async_queue_retry"),this.Vu=()=>{const e=Vp();e&&Zh("AsyncQueue","Visibility state changed to "+e.visibilityState),this.t_.jo()},this.mu=e;const t=Vp();t&&"function"==typeof t.addEventListener&&t.addEventListener("visibilitychange",this.Vu)}get isShuttingDown(){return this.Iu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.fu(),this.gu(e)}enterRestrictedMode(e){if(!this.Iu){this.Iu=!0,this.Au=e||!1;const t=Vp();t&&"function"==typeof t.removeEventListener&&t.removeEventListener("visibilitychange",this.Vu)}}enqueue(e){if(this.fu(),this.Iu)return new Promise(()=>{});const t=new cl;return this.gu(()=>this.Iu&&this.Au?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Pu.push(e),this.pu()))}async pu(){if(0!==this.Pu.length){try{await this.Pu[0](),this.Pu.shift(),this.t_.reset()}catch(e){if(!Ol(e))throw e;Zh("AsyncQueue","Operation failed with retryable error: "+e)}this.Pu.length>0&&this.t_.Go(()=>this.pu())}}gu(e){const t=this.mu.then(()=>(this.du=!0,e().catch(e=>{this.Eu=e,this.du=!1;throw el("INTERNAL UNHANDLED ERROR: ",function(e){let t=e.message||"";return e.stack&&(t=e.stack.includes(e.message)?e.stack:e.message+"\n"+e.stack),t}(e)),e}).then(e=>(this.du=!1,e))));return this.mu=t,t}enqueueAfterDelay(e,t,n){this.fu(),this.Ru.indexOf(e)>-1&&(t=0);const i=Ig.createAndSchedule(this,e,t,n,e=>this.yu(e));return this.Tu.push(i),i}fu(){this.Eu&&il()}verifyOperationInProgress(){}async wu(){let e;do{e=this.mu,await e}while(e!==this.mu)}Su(e){for(const t of this.Tu)if(t.timerId===e)return!0;return!1}bu(e){return this.wu().then(()=>{this.Tu.sort((e,t)=>e.targetTimeMs-t.targetTimeMs);for(const t of this.Tu)if(t.skipDelay(),"all"!==e&&t.timerId===e)break;return this.wu()})}Du(e){this.Ru.push(e)}yu(e){const t=this.Tu.indexOf(e);this.Tu.splice(t,1)}}function Lm(e){return function(e,t){if("object"!=typeof e||null===e)return!1;const n=e;for(const i of t)if(i in n&&"function"==typeof n[i])return!0;return!1}(e,["next","error","complete"])}class Mm extends Nm{constructor(e,t,n,i){super(e,t,n,i),this.type="firestore",this._queue=new Om,this._persistenceKey=(null==i?void 0:i.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new Om(e),this._firestoreClient=void 0,await e}}}function Fm(e){if(e._terminated)throw new al(ol.FAILED_PRECONDITION,"The client has already been terminated.");return e._firestoreClient||function(e){var t,n,i;const s=e._freezeSettings(),r=(o=e._databaseId,a=(null===(t=e._app)||void 0===t?void 0:t.options.appId)||"",c=e._persistenceKey,h=s,new nu(o,a,c,h.host,h.ssl,h.experimentalForceLongPolling,h.experimentalAutoDetectLongPolling,wm(h.experimentalLongPollingOptions),h.useFetchStreams));var o,a,c,h;e._componentsProvider||(null===(n=s.localCache)||void 0===n?void 0:n._offlineComponentProvider)&&(null===(i=s.localCache)||void 0===i?void 0:i._onlineComponentProvider)&&(e._componentsProvider={_offline:s.localCache._offlineComponentProvider,_online:s.localCache._onlineComponentProvider}),e._firestoreClient=new gm(e._authCredentials,e._appCheckCredentials,e._queue,r,e._componentsProvider&&function(e){const t=null==e?void 0:e._online.build();return{_offline:null==e?void 0:e._offline.build(t),_online:t}}(e._componentsProvider))}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */(e),e._firestoreClient}class Um{constructor(e){this._byteString=e}static fromBase64String(e){try{return new Um(Gl.fromBase64String(e))}catch(t){throw new al(ol.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new Um(Gl.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Vm{constructor(...e){for(let t=0;t<e.length;++t)if(0===e[t].length)throw new al(ol.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new Sl(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class qm{constructor(e){this._methodName=e}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class jm{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new al(ol.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new al(ol.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}toJSON(){return{latitude:this._lat,longitude:this._long}}_compareTo(e){return vl(this._lat,e._lat)||vl(this._long,e._long)}}
/**
   * @license
   * Copyright 2024 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class Bm{constructor(e){this._values=(e||[]).map(e=>e)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(e,t){if(e.length!==t.length)return!1;for(let n=0;n<e.length;++n)if(e[n]!==t[n])return!1;return!0}(this._values,e._values)}}
/**
   * @license
   * Copyright 2017 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */const zm=/^__.*__$/;class $m{constructor(e,t,n){this.data=e,this.fieldMask=t,this.fieldTransforms=n}toMutation(e,t){return null!==this.fieldMask?new Gd(e,this.data,this.fieldMask,t,this.fieldTransforms):new Kd(e,this.data,t,this.fieldTransforms)}}class Wm{constructor(e,t,n){this.data=e,this.fieldMask=t,this.fieldTransforms=n}toMutation(e,t){return new Gd(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function Hm(e){switch(e){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw il()}}class Km{constructor(e,t,n,i,s,r){this.settings=e,this.databaseId=t,this.serializer=n,this.ignoreUndefinedProperties=i,void 0===s&&this.vu(),this.fieldTransforms=s||[],this.fieldMask=r||[]}get path(){return this.settings.path}get Cu(){return this.settings.Cu}Fu(e){return new Km(Object.assign(Object.assign({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Mu(e){var t;const n=null===(t=this.path)||void 0===t?void 0:t.child(e),i=this.Fu({path:n,xu:!1});return i.Ou(e),i}Nu(e){var t;const n=null===(t=this.path)||void 0===t?void 0:t.child(e),i=this.Fu({path:n,xu:!1});return i.vu(),i}Lu(e){return this.Fu({path:void 0,xu:!0})}Bu(e){return c_(e,this.settings.methodName,this.settings.ku||!1,this.path,this.settings.qu)}contains(e){return void 0!==this.fieldMask.find(t=>e.isPrefixOf(t))||void 0!==this.fieldTransforms.find(t=>e.isPrefixOf(t.field))}vu(){if(this.path)for(let e=0;e<this.path.length;e++)this.Ou(this.path.get(e))}Ou(e){if(0===e.length)throw this.Bu("Document fields must not be empty");if(Hm(this.Cu)&&zm.test(e))throw this.Bu('Document fields cannot begin and end with "__"')}}class Gm{constructor(e,t,n){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=n||qp(e)}Qu(e,t,n,i=!1){return new Km({Cu:e,methodName:t,qu:n,path:Sl.emptyPath(),xu:!1,ku:i},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function Qm(e){const t=e._freezeSettings(),n=qp(e._databaseId);return new Gm(e._databaseId,!!t.ignoreUndefinedProperties,n)}function Ym(e,t,n,i,s,r={}){const o=e.Qu(r.merge||r.mergeFields?2:0,t,n,s);s_("Data must be an object, but it was:",o,i);const a=n_(i,o);let c,h;if(r.merge)c=new Hl(o.fieldMask),h=o.fieldTransforms;else if(r.mergeFields){const e=[];for(const i of r.mergeFields){const s=r_(t,i,n);if(!o.contains(s))throw new al(ol.INVALID_ARGUMENT,`Field '${s}' is specified in your field mask but missing from your input data.`);h_(e,s)||e.push(s)}c=new Hl(e),h=o.fieldTransforms.filter(e=>c.covers(e.field))}else c=null,h=o.fieldTransforms;return new $m(new wu(a),c,h)}class Jm extends qm{_toFieldTransform(e){if(2!==e.Cu)throw 1===e.Cu?e.Bu(`${this._methodName}() can only appear at the top level of your update data`):e.Bu(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof Jm}}class Xm extends qm{_toFieldTransform(e){return new Fd(e.path,new Ad)}isEqual(e){return e instanceof Xm}}function Zm(e,t,n,i){const s=e.Qu(1,t,n);s_("Data must be an object, but it was:",s,i);const r=[],o=wu.empty();Vl(i,(e,i)=>{const a=a_(t,e,n);i=z(i);const c=s.Nu(a);if(i instanceof Jm)r.push(a);else{const e=t_(i,c);null!=e&&(r.push(a),o.set(a,e))}});const a=new Hl(r);return new Wm(o,a,s.fieldTransforms)}function e_(e,t,n,i,s,r){const o=e.Qu(1,t,n),a=[r_(t,i,n)],c=[s];if(r.length%2!=0)throw new al(ol.INVALID_ARGUMENT,`Function ${t}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let d=0;d<r.length;d+=2)a.push(r_(t,r[d])),c.push(r[d+1]);const h=[],l=wu.empty();for(let d=a.length-1;d>=0;--d)if(!h_(h,a[d])){const e=a[d];let t=c[d];t=z(t);const n=o.Nu(e);if(t instanceof Jm)h.push(e);else{const i=t_(t,n);null!=i&&(h.push(e),l.set(e,i))}}const u=new Hl(h);return new Wm(l,u,o.fieldTransforms)}function t_(e,t){if(i_(e=z(e)))return s_("Unsupported field value:",t,e),n_(e,t);if(e instanceof qm)return function(e,t){if(!Hm(t.Cu))throw t.Bu(`${e._methodName}() can only be used with update() and set()`);if(!t.path)throw t.Bu(`${e._methodName}() is not currently supported inside arrays`);const n=e._toFieldTransform(t);n&&t.fieldTransforms.push(n)}(e,t),null;if(void 0===e&&t.ignoreUndefinedProperties)return null;if(t.path&&t.fieldMask.push(t.path),e instanceof Array){if(t.settings.xu&&4!==t.Cu)throw t.Bu("Nested arrays are not supported");return function(e,t){const n=[];let i=0;for(const s of e){let e=t_(s,t.Lu(i));null==e&&(e={nullValue:"NULL_VALUE"}),n.push(e),i++}return{arrayValue:{values:n}}}(e,t)}return function(e,t){if(null===(e=z(e)))return{nullValue:"NULL_VALUE"};if("number"==typeof e)return Cd(t.serializer,e);if("boolean"==typeof e)return{booleanValue:e};if("string"==typeof e)return{stringValue:e};if(e instanceof Date){const n=Tl.fromDate(e);return{timestampValue:kf(t.serializer,n)}}if(e instanceof Tl){const n=new Tl(e.seconds,1e3*Math.floor(e.nanoseconds/1e3));return{timestampValue:kf(t.serializer,n)}}if(e instanceof jm)return{geoPointValue:{latitude:e.latitude,longitude:e.longitude}};if(e instanceof Um)return{bytesValue:Nf(t.serializer,e._byteString)};if(e instanceof Rm){const n=t.databaseId,i=e.firestore._databaseId;if(!i.isEqual(n))throw t.Bu(`Document reference is for database ${i.projectId}/${i.database} but should be for database ${n.projectId}/${n.database}`);return{referenceValue:Pf(e.firestore._databaseId||t.databaseId,e._key.path)}}if(e instanceof Bm)return n=t,{mapValue:{fields:{__type__:{stringValue:"__vector__"},value:{arrayValue:{values:e.toArray().map(e=>{if("number"!=typeof e)throw n.Bu("VectorValues must only contain numeric values.");return Id(n.serializer,e)})}}}}};var n;throw t.Bu(`Unsupported field value: ${Em(e)}`)}(e,t)}function n_(e,t){const n={};return ql(e)?t.path&&t.path.length>0&&t.fieldMask.push(t.path):Vl(e,(e,i)=>{const s=t_(i,t.Mu(e));null!=s&&(n[e]=s)}),{mapValue:{fields:n}}}function i_(e){return!("object"!=typeof e||null===e||e instanceof Array||e instanceof Date||e instanceof Tl||e instanceof jm||e instanceof Um||e instanceof Rm||e instanceof qm||e instanceof Bm)}function s_(e,t,n){if(!i_(n)||("object"!=typeof(i=n)||null===i||Object.getPrototypeOf(i)!==Object.prototype&&null!==Object.getPrototypeOf(i))){const i=Em(n);throw"an object"===i?t.Bu(e+" a custom object"):t.Bu(e+" "+i)}var i}function r_(e,t,n){if((t=z(t))instanceof Vm)return t._internalPath;if("string"==typeof t)return a_(e,t);throw c_("Field path arguments must be of type string or ",e,!1,void 0,n)}const o_=new RegExp("[~\\*/\\[\\]]");function a_(e,t,n){if(t.search(o_)>=0)throw c_(`Invalid field path (${t}). Paths must not contain '~', '*', '/', '[', or ']'`,e,!1,void 0,n);try{return new Vm(...t.split("."))._internalPath}catch(i){throw c_(`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,e,!1,void 0,n)}}function c_(e,t,n,i,s){const r=i&&!i.isEmpty(),o=void 0!==s;let a=`Function ${t}() called with invalid data`;n&&(a+=" (via `toFirestore()`)"),a+=". ";let c="";return(r||o)&&(c+=" (found",r&&(c+=` in field ${i}`),o&&(c+=` in document ${s}`),c+=")"),new al(ol.INVALID_ARGUMENT,a+e+c)}function h_(e,t){return e.some(e=>e.isEqual(t))}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class l_{constructor(e,t,n,i,s){this._firestore=e,this._userDataWriter=t,this._key=n,this._document=i,this._converter=s}get id(){return this._key.path.lastSegment()}get ref(){return new Rm(this._firestore,this._converter,this._key)}exists(){return null!==this._document}data(){if(this._document){if(this._converter){const e=new u_(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const t=this._document.data.field(d_("DocumentSnapshot.get",e));if(null!==t)return this._userDataWriter.convertValue(t)}}}class u_ extends l_{data(){return super.data()}}function d_(e,t){return"string"==typeof t?a_(e,t):t instanceof Vm?t._internalPath:t._delegate._internalPath}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */function f_(e){if("L"===e.limitType&&0===e.explicitOrderBy.length)throw new al(ol.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class p_{}class g_ extends p_{}class m_ extends g_{constructor(e,t,n){super(),this._field=e,this._op=t,this._value=n,this.type="where"}static _create(e,t,n){return new m_(e,t,n)}_apply(e){const t=this._parse(e);return E_(e._query,t),new Am(e.firestore,e.converter,td(e._query,t))}_parse(e){const t=Qm(e.firestore),n=function(e,t,n,i,s,r,o){let a;if(s.isKeyField()){if("array-contains"===r||"array-contains-any"===r)throw new al(ol.INVALID_ARGUMENT,`Invalid Query. You can't perform '${r}' queries on documentId().`);if("in"===r||"not-in"===r){C_(o,r);const t=[];for(const n of o)t.push(b_(i,e,n));a={arrayValue:{values:t}}}else a=b_(i,e,o)}else"in"!==r&&"not-in"!==r&&"array-contains-any"!==r||C_(o,r),a=function(e,t,n,i=!1){return t_(n,e.Qu(i?4:3,t))}(n,t,o,"in"===r||"not-in"===r);return Au.create(s,r,a)}(e._query,"where",t,e.firestore._databaseId,this._field,this._op,this._value);return n}}function __(e,t,n){const i=t,s=d_("where",e);return m_._create(s,i,n)}class y_ extends p_{constructor(e,t){super(),this.type=e,this._queryConstraints=t}static _create(e,t){return new y_(e,t)}_parse(e){const t=this._queryConstraints.map(t=>t._parse(e)).filter(e=>e.getFilters().length>0);return 1===t.length?t[0]:Ru.create(t,this._getOperator())}_apply(e){const t=this._parse(e);return 0===t.getFilters().length?e:(function(e,t){let n=e;const i=t.getFlattenedFilters();for(const s of i)E_(n,s),n=td(n,s)}(e._query,t),new Am(e.firestore,e.converter,td(e._query,t)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return"and"===this.type?"and":"or"}}class v_ extends g_{constructor(e,t){super(),this._field=e,this._direction=t,this.type="orderBy"}static _create(e,t){return new v_(e,t)}_apply(e){const t=function(e,t,n){if(null!==e.startAt)throw new al(ol.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(null!==e.endAt)throw new al(ol.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new Su(t,n)}(e._query,this._field,this._direction);return new Am(e.firestore,e.converter,function(e,t){const n=e.explicitOrderBy.concat([t]);return new Qu(e.path,e.collectionGroup,n,e.filters.slice(),e.limit,e.limitType,e.startAt,e.endAt)}(e._query,t))}}function w_(e,t="asc"){const n=t,i=d_("orderBy",e);return v_._create(i,n)}class T_ extends g_{constructor(e,t,n){super(),this.type=e,this._limit=t,this._limitType=n}static _create(e,t,n){return new T_(e,t,n)}_apply(e){return new Am(e.firestore,e.converter,nd(e._query,this._limit,this._limitType))}}function I_(e){return function(e,t){if(t<=0)throw new al(ol.INVALID_ARGUMENT,`Function ${e}() requires a positive number, but it was: ${t}.`)}("limit",e),T_._create("limit",e,"F")}function b_(e,t,n){if("string"==typeof(n=z(n))){if(""===n)throw new al(ol.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!Xu(t)&&-1!==n.indexOf("/"))throw new al(ol.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${n}' contains a '/' character.`);const i=t.path.child(Cl.fromString(n));if(!kl.isDocumentKey(i))throw new al(ol.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${i}' is not because it has an odd number of segments (${i.length}).`);return fu(e,new kl(i))}if(n instanceof Rm)return fu(e,n._key);throw new al(ol.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${Em(n)}.`)}function C_(e,t){if(!Array.isArray(e)||0===e.length)throw new al(ol.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${t.toString()}' filters.`)}function E_(e,t){const n=function(e,t){for(const n of e)for(const e of n.getFlattenedFilters())if(t.indexOf(e.op)>=0)return e.op;return null}(e.filters,function(e){switch(e){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(t.op));if(null!==n)throw n===t.op?new al(ol.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${t.op.toString()}' filter.`):new al(ol.INVALID_ARGUMENT,`Invalid query. You cannot use '${t.op.toString()}' filters with '${n.toString()}' filters.`)}class S_{convertValue(e,t="none"){switch(ru(e)){case 0:return null;case 1:return e.booleanValue;case 2:return Jl(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(Xl(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw il()}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const n={};return Vl(e,(e,i)=>{n[e]=this.convertValue(i,t)}),n}convertVectorValue(e){var t,n,i;const s=null===(i=null===(n=null===(t=e.fields)||void 0===t?void 0:t.value.arrayValue)||void 0===n?void 0:n.values)||void 0===i?void 0:i.map(e=>Jl(e.doubleValue));return new Bm(s)}convertGeoPoint(e){return new jm(Jl(e.latitude),Jl(e.longitude))}convertArray(e,t){return(e.values||[]).map(e=>this.convertValue(e,t))}convertServerTimestamp(e,t){switch(t){case"previous":const n=eu(e);return null==n?null:this.convertValue(n,t);case"estimate":return this.convertTimestamp(tu(e));default:return null}}convertTimestamp(e){const t=Yl(e);return new Tl(t.seconds,t.nanos)}convertDocumentKey(e,t){const n=Cl.fromString(e);sl(Jf(n));const i=new iu(n.get(1),n.get(3)),s=new kl(n.popFirst(5));return i.isEqual(t)||el(`Document ${s} contains a document reference within a different database (${i.projectId}/${i.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),s}}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */function k_(e,t,n){let i;return i=e?n&&(n.merge||n.mergeFields)?e.toFirestore(t,n):e.toFirestore(t):t,i
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */}class N_{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class A_ extends l_{constructor(e,t,n,i,s,r){super(e,t,n,i,r),this._firestore=e,this._firestoreImpl=e,this.metadata=s}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new R_(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const n=this._document.data.field(d_("DocumentSnapshot.get",e));if(null!==n)return this._userDataWriter.convertValue(n,t.serverTimestamps)}}}class R_ extends A_{data(e={}){return super.data(e)}}class P_{constructor(e,t,n,i){this._firestore=e,this._userDataWriter=t,this._snapshot=i,this.metadata=new N_(i.hasPendingWrites,i.fromCache),this.query=n}get docs(){const e=[];return this.forEach(t=>e.push(t)),e}get size(){return this._snapshot.docs.size}get empty(){return 0===this.size}forEach(e,t){this._snapshot.docs.forEach(n=>{e.call(t,new R_(this._firestore,this._userDataWriter,n.key,n,new N_(this._snapshot.mutatedKeys.has(n.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new al(ol.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=function(e,t){if(e._snapshot.oldDocs.isEmpty()){let t=0;return e._snapshot.docChanges.map(n=>{const i=new R_(e._firestore,e._userDataWriter,n.doc.key,n.doc,new N_(e._snapshot.mutatedKeys.has(n.doc.key),e._snapshot.fromCache),e.query.converter);return n.doc,{type:"added",doc:i,oldIndex:-1,newIndex:t++}})}{let n=e._snapshot.oldDocs;return e._snapshot.docChanges.filter(e=>t||3!==e.type).map(t=>{const i=new R_(e._firestore,e._userDataWriter,t.doc.key,t.doc,new N_(e._snapshot.mutatedKeys.has(t.doc.key),e._snapshot.fromCache),e.query.converter);let s=-1,r=-1;return 0!==t.type&&(s=n.indexOf(t.doc.key),n=n.delete(t.doc.key)),1!==t.type&&(n=n.add(t.doc),r=n.indexOf(t.doc.key)),{type:D_(t.type),doc:i,oldIndex:s,newIndex:r}})}}(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}}function D_(e){switch(e){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return il()}}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */function x_(e){e=Sm(e,Rm);const t=Sm(e.firestore,Mm);return function(e,t,n={}){const i=new cl;return e.asyncQueue.enqueueAndForget(async()=>function(e,t,n,i,s){const r=new pm({next:a=>{r.Za(),t.enqueueAndForget(()=>Pg(e,o));const c=a.docs.has(n);!c&&a.fromCache?s.reject(new al(ol.UNAVAILABLE,"Failed to get document because the client is offline.")):c&&a.fromCache&&i&&"server"===i.source?s.reject(new al(ol.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):s.resolve(a)},error:e=>s.reject(e)}),o=new Fg(Yu(n.path),r,{includeMetadataChanges:!0,_a:!0});return Rg(e,o)}(await vm(e),e.asyncQueue,t,n,i)),i.promise}(Fm(t),e._key).then(n=>F_(t,e,n))}class O_ extends S_{constructor(e){super(),this.firestore=e}convertBytes(e){return new Um(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new Rm(this.firestore,null,t)}}function L_(e){e=Sm(e,Am);const t=Sm(e.firestore,Mm),n=Fm(t),i=new O_(t);return f_(e._query),function(e,t,n={}){const i=new cl;return e.asyncQueue.enqueueAndForget(async()=>function(e,t,n,i,s){const r=new pm({next:n=>{r.Za(),t.enqueueAndForget(()=>Pg(e,o)),n.fromCache&&"server"===i.source?s.reject(new al(ol.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):s.resolve(n)},error:e=>s.reject(e)}),o=new Fg(n,r,{includeMetadataChanges:!0,_a:!0});return Rg(e,o)}(await vm(e),e.asyncQueue,t,n,i)),i.promise}(n,e._query).then(n=>new P_(t,i,e,n))}function M_(e,t){return function(e,t){const n=new cl;return e.asyncQueue.enqueueAndForget(async()=>Qg(await function(e){return ym(e).then(e=>e.syncEngine)}(e),t,n)),n.promise}(Fm(e),t)}function F_(e,t,n){const i=n.docs.get(t._key),s=new O_(e);return new A_(e,s,t._key,i,new N_(n.hasPendingWrites,n.fromCache),t.converter)}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */class U_{constructor(e,t){this._firestore=e,this._commitHandler=t,this._mutations=[],this._committed=!1,this._dataReader=Qm(e)}set(e,t,n){this._verifyNotCommitted();const i=V_(e,this._firestore),s=k_(i.converter,t,n),r=Ym(this._dataReader,"WriteBatch.set",i._key,s,null!==i.converter,n);return this._mutations.push(r.toMutation(i._key,Vd.none())),this}update(e,t,n,...i){this._verifyNotCommitted();const s=V_(e,this._firestore);let r;return r="string"==typeof(t=z(t))||t instanceof Vm?e_(this._dataReader,"WriteBatch.update",s._key,t,n,i):Zm(this._dataReader,"WriteBatch.update",s._key,t),this._mutations.push(r.toMutation(s._key,Vd.exists(!0))),this}delete(e){this._verifyNotCommitted();const t=V_(e,this._firestore);return this._mutations=this._mutations.concat(new Xd(t._key,Vd.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new al(ol.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}}function V_(e,t){if((e=z(e)).firestore!==t)throw new al(ol.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return e}
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */!function(e,t=!0){Yh=st,Ze(new $("firestore",(e,{instanceIdentifier:n,options:i})=>{const s=e.getProvider("app").getImmediate(),r=new Mm(new dl(e.getProvider("auth-internal")),new ml(e.getProvider("app-check-internal")),function(e,t){if(!Object.prototype.hasOwnProperty.apply(e.options,["projectId"]))throw new al(ol.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new iu(e.options.projectId,t)}(s,n),s);return i=Object.assign({useFetchStreams:t},i),r._setSettings(i),r},"PUBLIC").setMultipleInstances(!0)),at(Gh,"4.7.3",e),at(Gh,"4.7.3","esm2017")}();const q_={apiKey:"AIzaSyBs9g8H0lL0SYR0FOs2FLkDAJE2bNTB-GE",authDomain:"efgame-634af.firebaseapp.com",databaseURL:"https://efgame-634af-default-rtdb.asia-southeast1.firebasedatabase.app",projectId:"efgame-634af",storageBucket:"efgame-634af.firebasestorage.app",messagingSenderId:"681595552501",appId:"1:681595552501:web:a24cb6e02e0c8063e7bbbc"},j_=rt(q_),B_=function(e=ot()){const t=et(e,"auth");if(t.isInitialized())return t.getImmediate();const n=
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
function(e,t){const n=et(e,"auth");if(n.isInitialized()){const e=n.getImmediate();if(L(n.getOptions(),null!=t?t:{}))return e;Ct(e,"already-initialized")}return n.initialize({options:t})}(e,{popupRedirectResolver:Zi,persistence:[pi,Jn,Zn]}),i=y("authTokenSyncURL");if(i&&"boolean"==typeof isSecureContext&&isSecureContext){const e=new URL(i,location.origin);if(location.origin===e.origin){const t=(s=e.toString(),async e=>{const t=e&&await e.getIdTokenResult(),n=t&&((new Date).getTime()-Date.parse(t.issuedAtTime))/1e3;if(n&&n>is)return;const i=null==t?void 0:t.token;ss!==i&&(ss=i,await fetch(s,{method:i?"POST":"DELETE",headers:i?{Authorization:`Bearer ${i}`}:{}}))});!function(e,t,n){z(e).beforeAuthStateChanged(t,n)}(n,t,()=>t(n.currentUser)),function(e,t,n,i){z(e).onIdTokenChanged(t,n,i)}(n,e=>t(e))}}var s;const r=g("auth");return r&&Pn(n,`http://${r}`),n}(j_),z_=function(e=ot(),t){const n=et(e,"database").getImmediate({identifier:t});if(!n._instanceStarted){const e=m("database");e&&function(e,t,n,i={}){e=z(e),e._checkNotDeleted("useEmulator"),e._instanceStarted&&Cs("Cannot call useEmulator() after instance has already been initialized.");const s=e._repoInternal;let r;if(s.repoInfo_.nodeAdmin)i.mockUserToken&&Cs('mockUserToken is not supported by the Admin SDK. For client access with mock users, please use the "firebase" package instead of "firebase-admin".'),r=new Bs(Bs.OWNER);else if(i.mockUserToken){const t="string"==typeof i.mockUserToken?i.mockUserToken:w(i.mockUserToken,e.app.options.projectId);r=new Bs(t)}!function(e,t,n,i){e.repoInfo_=new Ks(`${t}:${n}`,!1,e.repoInfo_.namespace,e.repoInfo_.webSocketOnly,e.repoInfo_.nodeAdmin,e.repoInfo_.persistenceKey,e.repoInfo_.includeNamespaceInQueryParams,!0),i&&(e.authTokenProvider_=i)}(s,t,n,r)}(n,...e)}return n}(j_),$_=function(e){const t="string"==typeof e?e:"(default)",n=et("object"==typeof e?e:ot(),"firestore").getImmediate({identifier:t});if(!n._initialized){const e=m("firestore");e&&function(e,t,n,i={}){var s;const r=(e=Sm(e,Nm))._getSettings(),o=`${t}:${n}`;if("firestore.googleapis.com"!==r.host&&r.host!==o&&tl("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."),e._setSettings(Object.assign(Object.assign({},r),{host:o,ssl:!1})),i.mockUserToken){let t,n;if("string"==typeof i.mockUserToken)t=i.mockUserToken,n=Qh.MOCK_USER;else{t=w(i.mockUserToken,null===(s=e._app)||void 0===s?void 0:s.options.projectId);const r=i.mockUserToken.sub||i.mockUserToken.user_id;if(!r)throw new al(ol.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");n=new Qh(r)}e._authCredentials=new ul(new hl(t,n))}}(n,...e)}return n}(j_);function W_(e){const t={once:t=>kh(e).then(e=>H_(e)),on:(t,n)=>"value"===t?function(e,t){return Rh(e,"value",t)}(e,e=>n(H_(e))):"child_added"===t?function(e,t){return Rh(e,"child_added",t)}(e,e=>n(H_(e))):void 0,off(){var t;eh((t=e)._repo,t,null)},set:t=>Eh(e,t),update:t=>Sh(e,t),push(t){const n=function(e,t){e=z(e),Mc("push",e._path),Dc("push",t,e._path,!0);const n=Hc(e._repo),i=gh(n),s=Ch(e,i),r=Ch(e,i);let o;return o=Promise.resolve(r),s.then=o.then.bind(o),s.catch=o.then.bind(o,void 0),s}(e);return void 0!==t?Eh(n,t).then(()=>W_(n)):W_(n)},remove(){return Mc("remove",(t=e)._path),Eh(t,null);var t},onDisconnect(){const t=(n=z(n=e),new vh(n._repo,n._path));var n;return{set:e=>t.set(e),update:e=>t.update(e),remove:()=>t.remove(),cancel:()=>t.cancel()}},child:t=>W_(Ch(e,t)),ref:e=>W_(bh(z_,e)),_ref:e,key:e.key};return t}function H_(e){return{val:()=>e.val(),exists:()=>e.exists(),key:e.key,ref:W_(e.ref),forEach(t){e.forEach(e=>{t(H_(e))})},numChildren:()=>e.size}}const K_={ref:e=>W_(bh(z_,e))};function G_(e){return{get:()=>x_(e).then(e=>Q_(e)),set:(t,n)=>function(e,t,n){e=Sm(e,Rm);const i=Sm(e.firestore,Mm),s=k_(e.converter,t,n);return M_(i,[Ym(Qm(i),"setDoc",e._key,s,null!==e.converter,n).toMutation(e._key,Vd.none())])}(e,t,n||{}),update:t=>function(e,t,n,...i){e=Sm(e,Rm);const s=Sm(e.firestore,Mm),r=Qm(s);let o;return o="string"==typeof(t=z(t))||t instanceof Vm?e_(r,"updateDoc",e._key,t,n,i):Zm(r,"updateDoc",e._key,t),M_(s,[o.toMutation(e._key,Vd.exists(!0))])}(e,t),delete(){return M_(Sm((t=e).firestore,Mm),[new Xd(t._key,Vd.none())]);var t},collection:t=>J_(Dm(e,t)),get id(){return e.id},get ref(){return e}}}function Q_(e){return{data:()=>e.data(),exists:e.exists(),get id(){return e.id},get ref(){return e.ref}}}function Y_(e){return{get empty(){return e.empty},get size(){return e.size},get docs(){return e.docs.map(e=>Q_(e))},forEach(t){e.forEach(e=>t(Q_(e)))}}}function J_(e,t){const n=t?[...t]:[],i=e;function s(){return 0===n.length?i:function(e,t,...n){let i=[];t instanceof p_&&i.push(t),i=i.concat(n),function(e){const t=e.filter(e=>e instanceof y_).length,n=e.filter(e=>e instanceof m_).length;if(t>1||t>0&&n>0)throw new al(ol.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(i);for(const s of i)e=s._apply(e);return e}(i,...n)}return{doc:t=>G_(t?xm(e,t):xm(e)),add:t=>function(e,t){const n=Sm(e.firestore,Mm),i=xm(e),s=k_(e.converter,t);return M_(n,[Ym(Qm(e.firestore),"addDoc",i._key,s,null!==e.converter,{}).toMutation(i._key,Vd.exists(!1))]).then(()=>i)}(e,t).then(e=>G_(e)),get:()=>L_(s()).then(e=>Y_(e)),where:(t,i,s)=>J_(e,[...n,__(t,i,s)]),orderBy:(t,i)=>J_(e,[...n,w_(t,i||"asc")]),limit:t=>J_(e,[...n,I_(t)]),onSnapshot:(e,t)=>function(e,...t){var n,i,s;e=z(e);let r={includeMetadataChanges:!1,source:"default"},o=0;"object"!=typeof t[o]||Lm(t[o])||(r=t[o],o++);const a={includeMetadataChanges:r.includeMetadataChanges,source:r.source};if(Lm(t[o])){const e=t[o];t[o]=null===(n=e.next)||void 0===n?void 0:n.bind(e),t[o+1]=null===(i=e.error)||void 0===i?void 0:i.bind(e),t[o+2]=null===(s=e.complete)||void 0===s?void 0:s.bind(e)}let c,h,l;if(e instanceof Rm)h=Sm(e.firestore,Mm),l=Yu(e._key.path),c={next:n=>{t[o]&&t[o](F_(h,e,n))},error:t[o+1],complete:t[o+2]};else{const n=Sm(e,Am);h=Sm(n.firestore,Mm),l=n._query;const i=new O_(h);c={next:e=>{t[o]&&t[o](new P_(h,i,n,e))},error:t[o+1],complete:t[o+2]},f_(e._query)}return function(e,t,n,i){const s=new pm(i),r=new Fg(t,s,n);return e.asyncQueue.enqueueAndForget(async()=>Rg(await vm(e),r)),()=>{s.Za(),e.asyncQueue.enqueueAndForget(async()=>Pg(await vm(e),r))}}(Fm(h),l,a,c)}(s(),e?t=>e(Y_(t)):void 0,t)}}const X_={collection:e=>J_(Dm($_,e)),batch(){const e=(Fm(t=Sm(t=$_,Mm)),new U_(t,e=>M_(t,e)));
/**
   * @license
   * Copyright 2020 Google LLC
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *   http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   */
var t;return{delete(t){e.delete(t.ref||t)},set(t,n,i){e.set(t.ref||t,n,i||{})},update(t,n){e.update(t.ref||t,n)},commit:()=>e.commit()}}},Z_={signInAnonymously:()=>Wn(B_),signInWithPopup:e=>Ii(B_,e),onAuthStateChanged(e){return t=e,z(B_).onAuthStateChanged(t,n,i);var t,n,i},get currentUser(){return B_.currentUser}};async function ey(){try{const e=Date.now(),t=K_.ref("rooms"),n=(await t.once("value")).val();if(!n)return;let i=0;const s=[];Object.entries(n).forEach(([n,r])=>{r.expiresAt&&r.expiresAt<e&&(console.log(`🗑️ 刪除過期房間: ${n}`),s.push(t.child(n).remove()),i++)}),await Promise.all(s),i>0&&console.log(`✅ 已清理 ${i} 個過期房間`)}catch(e){console.error("❌ 清理過期房間失敗:",e)}}window.firebaseServices={database:K_,auth:Z_,firestore:X_,config:q_},window.firebase={apps:[j_],initializeApp:()=>j_,auth:Object.assign(function(){return Z_},{GoogleAuthProvider:qn}),database:Object.assign(function(){return K_},{ServerValue:{TIMESTAMP:Lh}}),firestore:Object.assign(function(){return X_},{FieldValue:{serverTimestamp:()=>new Xm("serverTimestamp"),delete:()=>new Jm("deleteField")}})},Z_.signInAnonymously().then(()=>{console.log("✅ 匿名登入成功"),ey(),setInterval(ey,6e5)}).catch(e=>{console.error("❌ 匿名登入失敗:",e)}),console.log("🔥 Firebase modular SDK 已載入 (bundle)")}();
