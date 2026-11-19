/** Wrap export text using the actual canvas font, without shrinking or cropping it. */
export function captionLines(ctx:CanvasRenderingContext2D,text:string,width:number){
 const lines:string[]=[];let line='';
 for(const word of text.split(/\s+/)){const next=line?`${line} ${word}`:word;if(ctx.measureText(next).width<=width){line=next;continue}if(line){lines.push(line);line=''}if(ctx.measureText(word).width<=width){line=word;continue}for(const char of word){if(line&&ctx.measureText(line+char).width>width){lines.push(line);line=''}line+=char}}
 if(line)lines.push(line);return lines;
}
export function drawCaption(ctx:CanvasRenderingContext2D,text:string,x:number,y:number,width:number,lineHeight=18){captionLines(ctx,text,width).forEach((line,i)=>ctx.fillText(line,x,y+i*lineHeight))}
