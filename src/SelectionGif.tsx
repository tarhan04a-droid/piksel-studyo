import ReadingGif from './ReadingGif';
import {t} from './i18n';
import {drawCaption} from './gifCaption';
export type SelectionFrames={overlay:ImageData;output:ImageData};
export default function SelectionGif({source,selection}:{source:ImageData;selection:SelectionFrames}){
 async function draw(){
  const thumbnail=(image:ImageData)=>{const full=document.createElement('canvas');full.width=image.width;full.height=image.height;full.getContext('2d')!.putImageData(image,0,0);const small=document.createElement('canvas');small.width=small.height=256;const ctx=small.getContext('2d')!;const scale=Math.min(256/image.width,256/image.height),width=image.width*scale,height=image.height*scale;ctx.drawImage(full,(256-width)/2,(256-height)/2,width,height);full.width=full.height=0;return small};
  const original=thumbnail(source),overlay=thumbnail(selection.overlay),output=thumbnail(selection.output),canvas=document.createElement('canvas');canvas.width=640;canvas.height=440;const ctx=canvas.getContext('2d');if(!ctx)throw Error('canvas');const frames:Uint8ClampedArray[]=[],delays:number[]=[];
  for(let phase=0;phase<2;phase++)for(let i=0;i<12;i++){
   const p=i/11;ctx.fillStyle='#101d26';ctx.fillRect(0,0,640,440);ctx.fillStyle='#e3eee9';ctx.font='20px sans-serif';drawCaption(ctx,t(phase===0?'Seçim · yeşil alan':'Şeffaf sonuç'),20,30,600,24);ctx.drawImage(original,20,65);for(let y=0;y<16;y++)for(let x=0;x<16;x++){ctx.fillStyle=(x+y)%2?'#aaa':'#eee';ctx.fillRect(364+x*16,65+y*16,16,16)}
   if(phase===0){ctx.drawImage(original,364,65);ctx.save();ctx.beginPath();ctx.rect(364,65,256*p,256);ctx.clip();ctx.drawImage(overlay,364,65);ctx.restore()}else{ctx.drawImage(output,364,65);ctx.save();ctx.beginPath();ctx.rect(364+256*p,65,256*(1-p),256);ctx.clip();ctx.drawImage(overlay,364,65);ctx.restore()}
   ctx.fillStyle='#e3eee9';ctx.font='16px sans-serif';drawCaption(ctx,t('Bu GIF senin hesaplanan seçimini gösterir; modelin iç hesaplamalarının animasyonu değildir.'),20,365,600,22);frames.push(ctx.getImageData(0,0,640,440).data);delays.push(i===11?1500:150)
  }return{frames,width:640,height:440,delays};
 }
 return <ReadingGif name="nesne-secimi" draw={draw}/>;
}
