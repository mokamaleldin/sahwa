import fs from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{JSDOM}=require('jsdom');
const {createCanvas}=require('@napi-rs/canvas');
test('edge editor: erase, restore, undo, zoom, outside strokes, save and cancel', async()=>{
const dom=new JSDOM(fs.readFileSync('studio/index.html','utf8'),{runScripts:'outside-only',url:'https://fixture.local/studio'});
const w=dom.window,doc=w.document,backing=new WeakMap();
for(const key of ['width','height']){
 const descriptor=Object.getOwnPropertyDescriptor(w.HTMLCanvasElement.prototype,key);
 Object.defineProperty(w.HTMLCanvasElement.prototype,key,{...descriptor,set(value){descriptor.set.call(this,value);const c=backing.get(this);if(c)c[key]=value;}});
}
w.HTMLCanvasElement.prototype.getContext=function(){if(!backing.has(this))backing.set(this,createCanvas(this.width,this.height));return backing.get(this).getContext('2d');};
w.HTMLCanvasElement.prototype.getBoundingClientRect=function(){return {left:10,top:20,width:400,height:400*this.height/this.width};};
w.HTMLCanvasElement.prototype.setPointerCapture=()=>{};
w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
Object.defineProperty(doc.querySelector('#matte-stage'),'clientWidth',{value:650});
for(const file of ['matting-core.js','portrait.js','matte-editor.js'])w.eval(fs.readFileSync('public/studio-assets/'+file,'utf8'));
const original=createCanvas(64,64),cutout=createCanvas(64,64);
const oc=original.getContext('2d');oc.fillStyle='#aaa';oc.fillRect(0,0,64,64);
const cc=cutout.getContext('2d');cc.fillStyle='#aaa';cc.fillRect(12,12,40,40);
let savedAlpha;
w.SahwaPortrait.refinePersonBackground=async(image,width,height,alpha)=>{assert.equal(image,original);assert.equal(width,64);assert.equal(height,64);savedAlpha=new Float32Array(alpha);return new w.Blob(['png'],{type:'image/png'});};
const promise=w.SahwaMatteEditor.edit(original,cutout),canvas=doc.querySelector('#matte-canvas');
function alphas(){return backing.get(canvas).getContext('2d').getImageData(0,0,canvas.width,canvas.height).data.filter((_,i)=>i%4===3);}
function pointer(type,x,y){const event=new w.MouseEvent(type,{clientX:x,clientY:y,bubbles:true});Object.defineProperty(event,'pointerId',{value:1});Object.defineProperty(event,'pointerType',{value:'mouse'});canvas.dispatchEvent(event);}
const before=alphas();
pointer('pointerdown',200,210);pointer('pointermove',240,240);pointer('pointerup',240,240);
assert.notDeepEqual(alphas(),before);doc.querySelector('#matte-undo').click();assert.deepEqual(alphas(),before);
doc.querySelector('[data-matte-mode="restore"]').click();pointer('pointerdown',60,70);pointer('pointerup',60,70);assert.notDeepEqual(alphas(),before);doc.querySelector('#matte-undo').click();assert.deepEqual(alphas(),before);
// Moving outside a captured canvas must not throw or change unrelated pixels.
pointer('pointerdown',200,210);pointer('pointermove',900,900);pointer('pointerup',900,900);doc.querySelector('#matte-undo').click();assert.deepEqual(alphas(),before);
doc.querySelector('#matte-zoom').value='2';doc.querySelector('#matte-zoom').dispatchEvent(new w.Event('input'));assert.equal(doc.querySelector('#matte-zoom-value').textContent,'200%');
doc.querySelector('#matte-save').click();const blob=await promise;assert.equal(blob.type,'image/png');assert.equal(doc.querySelector('#matte-dialog').open,false);assert.ok(savedAlpha);assert.deepEqual(Array.from(savedAlpha,a=>Math.round(a*255)),Array.from(before));
const cancel=w.SahwaMatteEditor.edit(original,cutout);doc.querySelector('#matte-cancel').click();assert.equal(await cancel,null);
w.close();
});
