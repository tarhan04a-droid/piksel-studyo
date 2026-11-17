// Existing sunset photograph: deterministic foreground example, not a SAM prediction.
// Keep the dark landscape connected to the bottom edge; the sky is the background.
export function segmentationExample(image:ImageData,transparent:boolean){
 const {width,height,data}=image,count=width*height,mask=new Uint8Array(count),queue=new Int32Array(count);let head=0,tail=0;
 function visit(index:number){if(mask[index])return;const p=index*4;if(.299*data[p]+.587*data[p+1]+.114*data[p+2]>58)return;mask[index]=1;queue[tail++]=index}
 for(let x=0;x<width;x++)visit((height-1)*width+x);
 while(head<tail){const index=queue[head++],x=index%width;if(x)visit(index-1);if(x<width-1)visit(index+1);if(index>=width)visit(index-width);if(index<count-width)visit(index+width)}
 const output=new ImageData(new Uint8ClampedArray(data),width,height);
 for(let i=0;i<count;i++){const p=i*4;if(transparent){if(!mask[i])output.data[p+3]=0}else if(mask[i]){output.data[p]=Math.round(data[p]*.5+35);output.data[p+1]=Math.round(data[p+1]*.5+120);output.data[p+2]=Math.round(data[p+2]*.5+85)}}
 return output;
}
