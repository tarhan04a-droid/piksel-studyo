import {process,type Settings} from './engine';
type ImageJob={id:number;image:ImageData;settings:Settings;format?:'jpeg'|'png';scale?:number;batch?:boolean};
self.onmessage=async(event:MessageEvent<ImageJob>)=>{
 const {id,image,settings,format='png',scale=100,batch=false}=event.data;
 try{
  const width=Math.max(1,Math.round(image.width*scale/100)),height=Math.max(1,Math.round(image.height*scale/100));
  if(batch&&(width>8192||height>8192||width*height>24000000))throw new Error('export size');
  const result=process(image,settings);let blob:Blob|undefined;
  try{if(typeof OffscreenCanvas!=='undefined'){
   const canvas=new OffscreenCanvas(result.width,result.height);canvas.getContext('2d')!.putImageData(result,0,0);
   let target=canvas;if(scale!==100){target=new OffscreenCanvas(width,height);const ctx=target.getContext('2d')!;ctx.imageSmoothingQuality='high';ctx.drawImage(canvas,0,0,width,height)}
   blob=await target.convertToBlob({type:format==='jpeg'?'image/jpeg':'image/png',quality:.95});
  }}catch{}
  // Batch results need only the encoded file; don't clone a full-resolution raster back too.
  if(batch&&blob)self.postMessage({id,blob,width,height});
  else self.postMessage({id,result,blob,width,height},{transfer:[result.data.buffer as ArrayBuffer]});
 }catch{self.postMessage({id,error:true})}
};
