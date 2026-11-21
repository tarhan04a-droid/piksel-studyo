import {insideSelectionBox,type SelectionBox} from './selectionMasks';
/** Preserve a narrow soft edge instead of immediately thresholding model logits. */
export function maskAlphaFromLogit(value:number){
 if(!Number.isFinite(value))return value===Infinity?255:0;
 const t=Math.max(0,Math.min(1,(value+1)/2));return Math.round(255*t*t*(3-2*t));
}
export function selectedAlpha(index:number,width:number,box:SelectionBox|null,mask:Uint8Array,cleaned:Uint8Array,alpha:Uint8Array|null,smooth:boolean,invert:boolean){
 if(!insideSelectionBox(index%width,Math.floor(index/width),box))return 0;
 const selected=!!cleaned[index];let coverage=selected?255:0;
 // Confidence only softens the one-pixel contour. It must never wash out interiors.
 if(smooth&&alpha&&!(selected&&!mask[index])){
  const x=index%width,y=Math.floor(index/width),height=cleaned.length/width;let boundary=false;
  for(let dy=-1;dy<=1&&!boundary;dy++)for(let dx=-1;dx<=1;dx++){
   const xx=x+dx,yy=y+dy;if(xx<0||xx>=width||yy<0||yy>=height||!insideSelectionBox(xx,yy,box))continue;
   if(!!cleaned[yy*width+xx]!==selected){boundary=true;break}
  }
  if(boundary)coverage=selected?Math.max(128,alpha[index]):Math.min(127,alpha[index]);
 }
 return invert?255-coverage:coverage;
}
