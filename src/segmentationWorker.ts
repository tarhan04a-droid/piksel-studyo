/// <reference lib="webworker" />
export {};
type Seed={x:number;y:number;add:boolean};
self.onmessage=(event:MessageEvent<{image:ImageData;seeds:Seed[];tolerance:number;keepSelected:boolean}>)=>{
 try{
  const{image,seeds,keepSelected}=event.data,{width,height,data}=image,count=width*height;
  if(count>2000000||seeds.length>32)throw new Error('limits');
  const tolerance=Math.max(0,Math.min(255,event.data.tolerance)),limit=3*tolerance*tolerance,mask=new Uint8Array(count),visited=new Uint8Array(count),queue=new Int32Array(count);
  for(const seed of seeds){
   const x=Math.max(0,Math.min(width-1,Math.floor(seed.x))),y=Math.max(0,Math.min(height-1,Math.floor(seed.y))),start=y*width+x,offset=start*4;
   if(!data[offset+3])continue;
   const r=data[offset],g=data[offset+1],b=data[offset+2];visited.fill(0);let head=0,tail=0;
   function visit(index:number){if(visited[index])return;visited[index]=1;const p=index*4,dr=data[p]-r,dg=data[p+1]-g,db=data[p+2]-b;if(data[p+3]&&dr*dr+dg*dg+db*db<=limit)queue[tail++]=index}
   visit(start);
   while(head<tail){const index=queue[head++];mask[index]=seed.add?1:0;const col=index%width;if(col)visit(index-1);if(col<width-1)visit(index+1);if(index>=width)visit(index-width);if(index<count-width)visit(index+width)}
  }
  const output=new Uint8ClampedArray(data),overlay=new Uint8ClampedArray(data);let selected=0;
  for(let i=0;i<count;i++){if(mask[i]){selected++;overlay[i*4]=Math.round(data[i*4]*.5+35);overlay[i*4+1]=Math.round(data[i*4+1]*.5+120);overlay[i*4+2]=Math.round(data[i*4+2]*.5+85)}if(Boolean(mask[i])!==keepSelected)output[i*4+3]=0}
  self.postMessage({output,overlay,selected},[output.buffer,overlay.buffer]);
 }catch{self.postMessage({error:true})}
};
