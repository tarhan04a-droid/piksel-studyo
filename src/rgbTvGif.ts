import {captionLines,drawCaption} from './gifCaption';
type Options={pixels:number[][];source?:HTMLImageElement;modern:boolean;light:boolean;title:string;rowLabel:string;columnLabel:string;describe:(index:number)=>string};
/** Draw exports directly at their final resolution: no screenshot or DOM rasterizer. */
export async function drawRgbTvGif({pixels,source,modern,light,title,rowLabel,columnLabel,describe}:Options){
 const columns=32,rows=32,total=columns*rows;
 const width=640,canvas=document.createElement('canvas');canvas.width=width;const ctx=canvas.getContext('2d');if(!ctx||pixels.length!==total)throw Error('RGB pixels');
 ctx.font='13px sans-serif';const height=418+Math.max(...Array.from({length:total},(_,i)=>captionLines(ctx,describe(i),588).length))*18;canvas.height=height;
 const frames:Uint8ClampedArray[]=[];
 const ink=modern?(light?'#39264d':'#faf0de'):'#d8e4c9',muted=modern?(light?'#675274':'#c8b9cf'):'#a7b5a0',gold=light&&modern?'#795b1b':'#d9bc70';
 function gradient(x:number,y:number,w:number,h:number,colors:string[]){const g=ctx!.createLinearGradient(x,y,x+w,y+h);colors.forEach((c,i)=>g.addColorStop(i/(colors.length-1),c));return g}
 function round(x:number,y:number,w:number,h:number,r:number,fill:string|CanvasGradient,stroke?:string){ctx!.beginPath();ctx!.roundRect(x,y,w,h,r);ctx!.fillStyle=fill;ctx!.fill();if(stroke){ctx!.strokeStyle=stroke;ctx!.lineWidth=1;ctx!.stroke()}}
 function text(value:string,x:number,y:number,size=12,color=ink,bold=false){ctx!.fillStyle=color;ctx!.font=`${bold?'600 ':''}${size}px sans-serif`;ctx!.fillText(value,x,y)}
 function circle(x:number,y:number,r:number,fill:string,stroke?:string){ctx!.beginPath();ctx!.arc(x,y,r,0,Math.PI*2);ctx!.fillStyle=fill;ctx!.fill();if(stroke){ctx!.strokeStyle=stroke;ctx!.stroke()}}
 function grid(x:number,y:number,w:number,h:number,at:number){const cw=w/columns,ch=h/rows;if(source){ctx!.imageSmoothingEnabled=true;ctx!.imageSmoothingQuality='high';ctx!.drawImage(source,x,y,w,h)}else pixels.forEach((p,i)=>{ctx!.fillStyle=`rgb(${p.join(',')})`;ctx!.fillRect(x+i%columns*cw,y+Math.floor(i/columns)*ch,Math.ceil(cw),Math.ceil(ch))});const sx=x+at%columns*cw,sy=y+Math.floor(at/columns)*ch;ctx!.lineWidth=2;ctx!.strokeStyle='#07191e';ctx!.strokeRect(sx,sy,cw,ch);ctx!.lineWidth=1;ctx!.strokeStyle='#fff9db';ctx!.strokeRect(sx+1,sy+1,cw-2,ch-2)}
 for(let frame=0;frame<32;frame++){
  const at=Math.round(frame*(total-1)/31),rgb=pixels[at];ctx.fillStyle=modern?gradient(0,0,640,height,light?['#fdf8f0','#f3e5d1','#e8d5f0']:['#251334','#160e24','#302039']):gradient(0,0,640,height,['#071c22','#0b131b','#102b2b']);ctx.fillRect(0,0,width,height);
  // Quiet surface texture; the animation is in the scan, not in decoration.
  ctx.fillStyle=modern?(light?'#9c814c18':'#dbc27c12'):'#9cc7b612';for(let x=12;x<640;x+=12)for(let y=12;y<height;y+=12)ctx.fillRect(x,y,1,1);
  text('P O L L M E K   /   '+(modern?'VISION 02':'COLOURVISION 01'),26,24,9,gold);text(title,26,52,22,ink,true);
  if(modern){
   // Brushed bezel, clean glass and two angular feet match the modern home TV.
   ctx.save();ctx.translate(51,0);
   ctx.save();ctx.shadowColor='#00000066';ctx.shadowBlur=15;ctx.shadowOffsetY=9;round(24,75,490,234,4,gradient(24,75,490,234,['#a5988a','#292431','#0b0a0e','#9e8d73']),'#c6ad73');ctx.restore();
   round(28,79,482,214,1,'#09090d');ctx.save();ctx.beginPath();ctx.rect(28,79,482,214);ctx.clip();grid(28,79,482,214,at);ctx.fillStyle=gradient(28,79,482,214,['#ffffff16','#ffffff00']);ctx.fillRect(28,79,482,214);ctx.restore();
   
   ctx.fillStyle='#0c0b12';ctx.fillRect(28,293,482,12);text(`RGB · ${String(at+1).padStart(2,'0')} / ${total}`,38,302,8,'#e8d5a3');text('P O L L M E K',227,302,6,'#d9bc70');circle(499,299,1.5,'#d9bc70');
   for(const x of [91,421]){ctx.fillStyle=gradient(x,309,35,16,['#82727d','#21182a']);ctx.beginPath();ctx.moveTo(x+12,309);ctx.lineTo(x+23,309);ctx.lineTo(x+35,325);ctx.lineTo(x,325);ctx.closePath();ctx.fill()}
   ctx.restore();
  }else{
   // The wooden case, antenna, ivory CRT surround and mechanical controls.
   ctx.strokeStyle='#c2c8ad';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(239,77);ctx.lineTo(212,61);ctx.moveTo(239,77);ctx.lineTo(264,61);ctx.stroke();circle(239,77,9,'#65725b');
   round(24,76,492,250,8,'#8d3418','#d3a776');round(29,81,482,240,3,'#492e20','#dd8c51');round(35,86,470,230,1,'#242d23','#9d9b76');
   text('P O L L M E K',48,102,9,'#d8d7ae',true);text('COLOURVISION · MODEL 01',343,102,6,'#b2b79e');
   round(46,111,399,181,24,'#b9b995','#e2ddba');round(55,119,381,165,19,'#122a25');ctx.save();ctx.beginPath();ctx.roundRect(55,119,381,165,19);ctx.clip();grid(55,119,381,165,at);
   ctx.fillStyle='#06161b33';for(let y=120;y<284;y+=3)ctx.fillRect(55,y,381,1);ctx.fillStyle=gradient(55,119,381,165,['#ffffff20','#ffffff00']);ctx.fillRect(55,119,381,165);ctx.restore();
   circle(472,118,2,'#f36537');text('POWER',461,128,5,'#ced4ae');circle(472,151,15,'#313b2a','#c7c6ae');for(let i=0;i<12;i++){const a=i*Math.PI/6;ctx.strokeStyle='#8c957c';ctx.beginPath();ctx.moveTo(472+8*Math.cos(a),151+8*Math.sin(a));ctx.lineTo(472+12*Math.cos(a),151+12*Math.sin(a));ctx.stroke()}ctx.save();ctx.translate(472,151);ctx.rotate(-.6);round(-12,-2,24,4,1,'#bcbda5');ctx.restore();
   for(const y of [179,207]){round(455,y-10,34,21,2,gradient(455,y-10,34,21,['#6f785f','#303b2b']),'#8c947c');text(y===179?'CH +':'CH −',461,y+3,7,'#e5e5c8',true)}
   circle(472,245,15,'#263526','#9caa88');for(let i=0;i<10;i++){const a=i*Math.PI/5;ctx.strokeStyle='#8b987c';ctx.beginPath();ctx.moveTo(472,245);ctx.lineTo(472+13*Math.cos(a),245+13*Math.sin(a));ctx.stroke()}round(458,269,28,31,14,'#172519','#526b4b');for(let x=463;x<484;x+=4){ctx.strokeStyle='#4e6648';ctx.beginPath();ctx.moveTo(x,275);ctx.lineTo(x,295);ctx.stroke()}
   round(44,300,399,10,1,'#172619','#68785d');ctx.fillStyle='#060f0b';ctx.fillRect(110,303,264,3);circle(102,304,1.5,'#a7d386');for(const x of [73,446]){ctx.fillStyle='#384534';ctx.fillRect(x,326,17,8)}
  }
  // Numeric readout and meters are driven by exactly the highlighted source pixel.
  const cardY=342;['R','G','B'].forEach((name,i)=>{const x=26+i*198,color=['#ef5875','#48c88d','#599df2'][i];round(x,cardY,184,43,10,modern?(light?'#fffaf0dd':'#130d20bb'):'#122721','#8c8b7040');text(name,x+12,cardY+18,11,color,true);text(String(rgb[i]),x+37,cardY+19,16,ink,true);ctx.fillStyle=modern?(light?'#d8cbbb':'#47344e'):'#334c3b';ctx.fillRect(x+12,cardY+29,160,4);ctx.fillStyle=color;ctx.fillRect(x+12,cardY+29,160*rgb[i]/255,4)});
  text(`${rowLabel} ${Math.floor(at/columns)+1}  ·  ${columnLabel} ${at%columns+1}`,modern?386:295,modern?330:337,10,muted);ctx.fillStyle=ink;ctx.font='13px sans-serif';drawCaption(ctx,describe(at),26,410,588);frames.push(ctx.getImageData(0,0,width,height).data);await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
 }
 return{frames,width,height};
}
