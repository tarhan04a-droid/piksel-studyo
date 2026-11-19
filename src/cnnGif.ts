import {captionLines,drawCaption} from './gifCaption';
export type CnnMap={size:number;values:number[]};
export async function drawCnnFrames(stages:CnnMap[][],probabilities:number[],names:string[],caption:string,descriptions:string[]){
 const canvas=document.createElement('canvas');canvas.width=380;canvas.height=240;const context=canvas.getContext('2d');if(!context)throw new Error('canvas');const ctx=context;const frames:Uint8ClampedArray[]=[];ctx.font='13px sans-serif';const height=260+Math.max(...descriptions.map(description=>captionLines(ctx,description,350).length))*18;canvas.height=height;
 function map(data:CnnMap,x:number,y:number,size:number,progress=1){const max=Math.max(1,...data.values),cell=size/data.size;ctx.fillStyle='#112725';ctx.fillRect(x,y,size,size);for(let i=0;i<Math.ceil(data.values.length*progress);i++){const value=Math.round(data.values[i]/max*255);ctx.fillStyle=`rgb(${value*.55},${value},${value*.86})`;ctx.fillRect(x+i%data.size*cell,y+Math.floor(i/data.size)*cell,Math.ceil(cell),Math.ceil(cell))}}
 for(let stage=0;stage<10;stage++)for(let step=0;step<3;step++){
  const progress=(step+1)/3;ctx.fillStyle='#0e1a22';ctx.fillRect(0,0,380,height);ctx.fillStyle='#d9eee5';ctx.font='bold 16px sans-serif';ctx.fillText(`${stage+1}/10 ${names[stage]}`,14,26,350);ctx.font='11px sans-serif';ctx.fillText(caption,14,229,350);
  if(stage<7){const maps=stages[stage];maps.forEach((data,i)=>map(data,18+i*116,62,104,progress));if(stage===0){const at=Math.min(1023,Math.floor(progress*1024)-1);ctx.strokeStyle='#ffe178';ctx.lineWidth=2;ctx.strokeRect(18+(at%32)*104/32,62+Math.floor(at/32)*104/32,5,5)}ctx.fillStyle='#d9eee5';ctx.fillText(`${maps[0].size} × ${maps[0].size} × ${maps.length}`,18,192)}
  else if(stage===7){const values=stages[6].flatMap(item=>item.values),max=Math.max(1,...values);values.forEach((value,i)=>{ctx.fillStyle=i<Math.ceil(progress*12)?`rgb(50,${80+value/max*175},160)`:'#253834';ctx.fillRect(16+i*29,80,24,76)});ctx.fillStyle='#d9eee5';ctx.fillText('3 × 2 × 2 → 12',18,192)}
  else if(stage===8){for(let a=0;a<12;a++)for(let b=0;b<6;b++){ctx.strokeStyle=b<progress*6?'#60c8af':'#23423b';ctx.beginPath();ctx.moveTo(30,53+a*12);ctx.lineTo(330,63+b*23);ctx.stroke()}for(let i=0;i<6;i++){ctx.fillStyle='#8fd5b9';ctx.beginPath();ctx.arc(330,63+i*23,5,0,Math.PI*2);ctx.fill()}}
  else probabilities.forEach((value,i)=>{ctx.fillStyle='#e0eee6';ctx.font='14px sans-serif';ctx.fillText(String.fromCharCode(65+i),18,75+i*43);ctx.fillStyle='#65c9ac';ctx.fillRect(45,61+i*43,value*progress*230,21);ctx.fillStyle='#e0eee6';ctx.fillText((value*progress*100).toFixed(1)+'%',295,77+i*43)});
  ctx.fillStyle='#d9eee5';ctx.font='13px sans-serif';drawCaption(ctx,descriptions[stage],14,254,350);
  frames.push(ctx.getImageData(0,0,380,height).data);await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
 }
 return{frames,width:380,height};
}
