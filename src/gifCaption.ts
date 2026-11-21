/** Wrap export text using the actual canvas font, without shrinking or cropping it. */
export function captionLines(ctx:CanvasRenderingContext2D,text:string,width:number){
 const lines:string[]=[];let line='';
 for(const word of text.split(/\s+/)){const next=line?`${line} ${word}`:word;if(ctx.measureText(next).width<=width){line=next;continue}if(line){lines.push(line);line=''}if(ctx.measureText(word).width<=width){line=word;continue}for(const char of word){if(line&&ctx.measureText(line+char).width>width){lines.push(line);line=''}line+=char}}
 if(line)lines.push(line);return lines;
}
export function drawCaption(ctx:CanvasRenderingContext2D,text:string,x:number,y:number,width:number,lineHeight=18){captionLines(ctx,text,width).forEach((line,i)=>ctx.fillText(line,x,y+i*lineHeight))}
/** Fit a complete multiline formula into its export panel. */
export function drawMathBlock(ctx:CanvasRenderingContext2D,text:string,x:number,y:number,width:number,height:number){
 let size=13,lines:string[]=[];
 do{ctx.font=`${size}px monospace`;lines=text.split('\n').flatMap(line=>captionLines(ctx,line,width));if(lines.length*(size+4)<=height||size===10)break;size--}while(size>=10);
 lines.forEach((line,i)=>ctx.fillText(line,x,y+i*(size+4)));
}
