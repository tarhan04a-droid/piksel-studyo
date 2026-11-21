/** Fill only small enclosed background components; preserve exterior and large gaps. */
export function fillSmallMaskHoles(mask:Uint8Array,width:number,height:number,maxArea:number){
 const output=mask.slice(),seen=new Uint8Array(mask.length),queue=new Uint32Array(mask.length);
 for(let start=0;start<mask.length;start++){
  if(mask[start]||seen[start])continue;
  let head=0,tail=1,touchesEdge=false;queue[0]=start;seen[start]=1;
  while(head<tail){const i=queue[head++],x=i%width,y=Math.floor(i/width);if(x===0||y===0||x===width-1||y===height-1)touchesEdge=true;
   const visit=(j:number)=>{if(!mask[j]&&!seen[j]){seen[j]=1;queue[tail++]=j}};
   if(x>0)visit(i-1);if(x<width-1)visit(i+1);if(y>0)visit(i-width);if(y<height-1)visit(i+width);
  }
  if(!touchesEdge&&tail<=maxArea)for(let j=0;j<tail;j++)output[queue[j]]=1;
 }
 return output;
}
