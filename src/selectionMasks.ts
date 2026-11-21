import {insideQuad,type SelectionQuad} from './quadSelection';
export type SelectionBox={x1:number;y1:number;x2:number;y2:number;corners?:SelectionQuad};
export function insideSelectionBox(x:number,y:number,box:SelectionBox|null){return !box||(box.corners?insideQuad(x,y,box.corners):x>=Math.ceil(box.x1)&&x<=Math.floor(box.x2)&&y>=Math.ceil(box.y1)&&y<=Math.floor(box.y2))}
/** A box is a hard selection boundary, not merely a suggestion to the model. */
export function constrainSelectionMask(mask:Uint8Array,width:number,height:number,box:SelectionBox|null){
 const result=mask.slice();if(box)for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(!insideSelectionBox(x,y,box))result[y*width+x]=0;return result;
}
export function connectedColorMask(image:{width:number;height:number;data:Uint8ClampedArray},seeds:{x:number;y:number;add:boolean}[],tolerance:number){
 const{width,height,data}=image,count=width*height,mask=new Uint8Array(count),visited=new Uint8Array(count),queue=new Int32Array(count),limit=3*Math.max(0,Math.min(255,tolerance))**2;
 for(const seed of seeds){const x=Math.max(0,Math.min(width-1,Math.floor(seed.x))),y=Math.max(0,Math.min(height-1,Math.floor(seed.y))),offset=(y*width+x)*4;if(!data[offset+3])continue;const r=data[offset],g=data[offset+1],b=data[offset+2];visited.fill(0);let head=0,tail=0;
  const visit=(i:number)=>{if(visited[i])return;visited[i]=1;const p=i*4;if(data[p+3]&&(data[p]-r)**2+(data[p+1]-g)**2+(data[p+2]-b)**2<=limit)queue[tail++]=i};visit(y*width+x);
  while(head<tail){const i=queue[head++];mask[i]=seed.add?1:0;const col=i%width;if(col)visit(i-1);if(col<width-1)visit(i+1);if(i>=width)visit(i-width);if(i<count-width)visit(i+width)}
 }return mask;
}
/** Rectangular isolation preserves every source pixel inside the dragged bounds. */
export function rectangleSelectionMask(width:number,height:number,box:SelectionBox){
 const mask=new Uint8Array(width*height);if(box.corners){for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(insideSelectionBox(x,y,box))mask[y*width+x]=1;return mask}const left=Math.max(0,Math.ceil(box.x1)),right=Math.min(width-1,Math.floor(box.x2)),top=Math.max(0,Math.ceil(box.y1)),bottom=Math.min(height-1,Math.floor(box.y2));
 if(left<=right)for(let y=top;y<=bottom;y++)mask.fill(1,y*width+left,y*width+right+1);
 return mask;
}
