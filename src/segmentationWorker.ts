import {connectedColorMask} from './selectionMasks';
/// <reference lib="webworker" />
export {};
type Seed={x:number;y:number;add:boolean};
self.onmessage=(event:MessageEvent<{image:ImageData;seeds:Seed[];tolerance:number;keepSelected:boolean}>)=>{
 try{
  const{image,seeds,keepSelected}=event.data,{width,height,data}=image,count=width*height;
  if(count>2000000||seeds.length>32)throw new Error('limits');
  const mask=connectedColorMask(image,seeds,event.data.tolerance);
  const output=new Uint8ClampedArray(data),overlay=new Uint8ClampedArray(data);let selected=0;
  for(let i=0;i<count;i++){if(mask[i]){selected++;overlay[i*4]=Math.round(data[i*4]*.5+35);overlay[i*4+1]=Math.round(data[i*4+1]*.5+120);overlay[i*4+2]=Math.round(data[i*4+2]*.5+85)}if(Boolean(mask[i])!==keepSelected)output[i*4+3]=0}
  self.postMessage({output,overlay,selected},[output.buffer,overlay.buffer]);
 }catch{self.postMessage({error:true})}
};
