import LearningStageCards from './LearningStageCards';
import {useEffect,useRef,useState} from 'react';
import {t,useLanguage} from './i18n';
import ReadingGif from './ReadingGif';
import {drawCaption} from './gifCaption';
type Kind='files'|'video';
type Assets={photo:HTMLImageElement;frames:HTMLImageElement[];smallFrames:HTMLImageElement[];audioPeaks:number[];stats:{pngBefore:number;pngAfter:number;videoBefore:number;videoAfter:number}};
function loadImage(src:string){return new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=src})}
async function loadAssets(kind:Kind):Promise<Assets>{
 const [photo,stats,frames,smallFrames,audioPeaks]=await Promise.all([loadImage('/images/cnn/zebra.webp'),fetch('/images/learning/zebra-stats.json').then(r=>{if(!r.ok)throw Error('stats');return r.json()}),kind==='video'?Promise.all(Array.from({length:24},(_,i)=>loadImage(`/images/learning/video/frame-${String(i+1).padStart(2,'0')}.webp`))):Promise.resolve([]),kind==='video'?Promise.all(Array.from({length:24},(_,i)=>loadImage(`/images/learning/video-small/frame-${String(i+1).padStart(2,'0')}.webp`))):Promise.resolve([]),fetch('/images/learning/zebra-audio.json').then(r=>{if(!r.ok)throw Error('audio');return r.json()})]);
 return{photo,frames,smallFrames,audioPeaks,stats};
}

const pipelines:Record<string,[string,string][]>= {

 'files-1':[['PNG piksellerini oku','Görüntü pikselleri bayt dizisi olarak okunur. Sağdaki baytlar küçük bir örnektir.'],['Tekrarları bul','Aynı bayt dizileri işaretlenir; bu aşamada veri henüz kısalmaz.'],['Tekrarları referansla kodla','Tekrarlanan dizi yerine mesafe ve uzunluk yazılır. Aynı baytlar geri üretilebilir.']],
 'files-2':[['Dosya başlığını oku','PNG imzası dosya türünü tanıtır.'],['Başlık baytlarını değiştir','Başlığın baytlarına XOR uygulanır; normal görüntü okuyucusu dosyayı tanıyamaz.'],['Kilit işaretini ekle','Geri açarken bulunabilmesi için .pollmek işareti eklenir.'],['Kilit işaretini kaldır','Geri açma işlemi işareti bulur ve kaldırır.'],['Orijinal başlığı geri getir','Aynı XOR işlemi başlığı geri getirir; görüntü yeniden açılır.']],
 'video-0':[['Zamanı yeniden hesapla','Her karenin zamanı hız katsayısına bölünür.'],['Hızları karşılaştır','İki görüntü birlikte başlar; hızlı olan daha erken biter.']],
 'video-1':[['Piksel boyutunu azalt','640 × 640 kareler 320 × 320 boyutuna yeniden örneklenir.'],['Sıkıştırılmış sonucu karşılaştır','Daha küçük video daha az veri içerir; ayrıntılar değişebilir.']],
 'video-2':[['Video karelerini oku','Video, zaman sırasındaki görüntü kareleri olarak okunur.'],['Kareleri H.264 ile kodla','Karelerin içindeki ve arasındaki benzerlikler daha az veriyle kodlanır.'],['Ses ekle','Seçilen ses dosyası videoya eklenir ve AAC biçiminde saklanır. Dalga şekli sesin şiddetini gösterir.'],['Görüntü ve sesi MP4 içinde birleştir','H.264 görüntü ve AAC ses, zaman bilgileriyle aynı MP4 dosyasına yerleştirilir.']]
};
const pipelineSteps=(kind:Kind,stage:number)=>(pipelines[`${kind}-${stage}`]??[]).map(([label])=>label);

function paint(ctx:CanvasRenderingContext2D,a:Assets,kind:Kind,stage:number,p:number,rate:number,ink:string,background?:string,phase=0){
 ctx.clearRect(0,0,640,400);if(background){ctx.fillStyle=background;ctx.fillRect(0,0,640,400)}
 const x1=15,x2=355,y=55,w=270;
 const text=(value:string,x:number,y:number,max=280)=>{ctx.fillStyle=ink;ctx.font='18px sans-serif';drawCaption(ctx,t(value),x,y,max,22)};
 const image=(im:CanvasImageSource,x:number)=>ctx.drawImage(im,x,y,w,w);
 text('Girdi',x1,30);text('Sonuç',x2,30);
 if(kind==='files'){
  image(a.photo,x1);
  if(stage===0){const sx=35+100*p,sy=35+20*p,sw=Math.round(570-250*p);const crop=document.createElement('canvas');crop.width=crop.height=sw;crop.getContext('2d')!.drawImage(a.photo,sx,sy,sw,sw,0,0,sw,sw);image(crop,x2);ctx.strokeStyle='#e3c169';ctx.lineWidth=3;ctx.strokeRect(x1+sx/640*w,y+sy/640*w,sw/640*w,sw/640*w);text(`${sw} × ${sw}`,x2,355);text('Kırpılacak alan',x1,355)}
  else if(stage===1){
   ctx.drawImage(a.photo,x2,y,108,108);text('Örnek baytlar',x2+115,y+30,150);
   const raw=['18','18','18','18','42','42','18','18','18','18'],active=Math.min(9,Math.floor(p*10));
   if(phase<2){for(let i=0;i<raw.length;i++){const bx=x2+(i%5)*53,by=y+135+Math.floor(i/5)*52;ctx.fillStyle=phase===1?((i<4||i>=6)&&i<=active?'#946f2b':'#263e49'):i<=active?'#357c69':'#263e49';ctx.fillRect(bx,by,47,42);ctx.fillStyle='#fff';ctx.font='20px monospace';ctx.fillText(raw[i],bx+10,by+28)}}
   else{const tokens=['18','(1, 3)','42 42','(6, 4)'];for(let i=0;i<tokens.length;i++){const by=y+125+i*35;ctx.fillStyle=i<=Math.floor(p*4)?'#357c69':'#263e49';ctx.fillRect(x2,by,w,30);ctx.fillStyle='#fff';ctx.font='19px monospace';ctx.fillText(tokens[i],x2+12,by+22)} }
   const before=a.stats.pngBefore,after=a.stats.pngAfter,q=phase<2?0:p;ctx.fillStyle='#438f72';ctx.fillRect(x1,342,w,7);ctx.fillRect(x2,342,w*(1-q*(1-after/before)),7);text(`${(before/1024).toFixed(0)} KB`,x1,380);text(`${((before+(after-before)*q)/1024).toFixed(0)} KB`,x2,380);
  }
  else{
   const original=[0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a],changed=Math.floor(p*8);
   if(phase===2||phase===3){ctx.fillStyle='#1d3039';ctx.fillRect(x2,y,108,108);ctx.fillStyle='#e3c169';ctx.font='48px sans-serif';ctx.fillText('×',x2+39,y+69);text('Görsel okunamıyor',x2+118,y+32,150)}else ctx.drawImage(a.photo,x2,y,108,108);text(phase===0||phase===4?'PNG':'XOR A5',x2+130,y+(phase===2||phase===3?95:45),140);
   for(let i=0;i<original.length;i++){const bx=x2+(i%4)*66,by=y+130+Math.floor(i/4)*50,value=(phase===1&&i<changed)||(phase>1&&phase<4)||(phase===4&&i>=changed)?original[i]^0xa5:original[i];ctx.fillStyle=value!==original[i]?'#7a5228':'#263e49';ctx.fillRect(bx,by,60,40);ctx.fillStyle='#fff';ctx.font='20px monospace';ctx.fillText(value.toString(16).toUpperCase().padStart(2,'0'),bx+15,by+27)}
   ctx.fillStyle=ink;ctx.font='19px monospace';if(phase===2)ctx.fillText('.pollmek'.slice(0,Math.ceil(p*8)),x2+10,y+270);if(phase===3)ctx.fillText('.pollmek'.slice(Math.floor(p*8)),x2+10,y+270);text(phase===0||phase===4?'PNG imzası':'Başlık baytları değişiyor',x2,355);
  }
 }else{
  const at=Math.min(23,Math.floor(p*24)),right=stage===0?Math.min(23,Math.floor(p*24*rate)):at;
  image(a.frames[at],x1);
  if(stage===1){if(phase===0){const reduced=document.createElement('canvas');reduced.width=reduced.height=Math.round(640-320*p);reduced.getContext('2d')!.drawImage(a.frames[right],0,0,reduced.width,reduced.height);image(reduced,x2)}else image(a.smallFrames[right],x2);text('640 × 640',x1,355);text(phase===0?`${Math.round(640-320*p)} × ${Math.round(640-320*p)}`:'320 × 320 · daha az veri',x2,355)}
  else{image(a.frames[right],x2);if(stage===0){if(phase===0)text(`t′ = ${(p*6).toFixed(1)} / ${rate}`,x2,385);text(`${(p*6).toFixed(1)} / 6 s · 1×`,x1,355);text(`${Math.min(6,p*6*rate).toFixed(1)} / 6 s · ${rate}×`,x2,355);if(phase===1&&p*rate>=1)text('Bitti',x2,385)}else{if(phase===0){ctx.strokeStyle='#e3c169';ctx.lineWidth=3;ctx.strokeRect(x1,y+w*p,w,12);text('RGB → kareler',x1,355);text(`${at+1} / 24`,x2,355)}else if(phase===1){ctx.fillStyle='#101d26d9';ctx.fillRect(x2,y,w,w*(1-p));text('Kareler → H.264',x2,355)}else if(phase===2){ctx.fillStyle='#10242de8';ctx.fillRect(x2,y,w,w);for(let i=0;i<a.audioPeaks.length;i++){const h=a.audioPeaks[i]*470;ctx.fillStyle=i<=p*96?'#d9bc70':'#477c85';ctx.fillRect(x2+i*w/96,y+w/2-h/2,2,h)}text('Ses → AAC',x2,355);text(`${(p*6).toFixed(1)} / 6 s`,x1,355)}else{ctx.strokeStyle='#e3c169';ctx.lineWidth=3;ctx.strokeRect(x2,y,w,w);text('H.264 + AAC → MP4',x2,355);text('Oynatılabilir dosya',x1,355)}}}
  for(const [x,value] of [[x1,p],[x2,stage===0?Math.min(1,p*rate):p]]){ctx.fillStyle='#6f9690';ctx.fillRect(x,333,w,5);ctx.fillStyle='#d9bc70';ctx.fillRect(x,333,w*value,5)}
 }
 ctx.fillStyle=ink;ctx.font='24px sans-serif';ctx.fillText('→',310,195);
}
export default function ToolAnimation({kind,labels,rate,selectedStage,onStageChange}:{kind:Kind;labels:string[];rate:number;selectedStage?:number;onStageChange?:(stage:number)=>void}){
 const language=useLanguage(),canvas=useRef<HTMLCanvasElement>(null),host=useRef<HTMLDivElement>(null),audio=useRef<HTMLAudioElement>(null);const[assets,setAssets]=useState<Assets|null>(null),[error,setError]=useState(false),[frame,setFrame]=useState(0),[playing,setPlaying]=useState(false),[visible,setVisible]=useState(false);const stage=selectedStage??Math.min(2,Math.floor(frame/30)),steps=pipelineSteps(kind,stage),phase=selectedStage===undefined?0:Math.floor(frame/30),progress=(frame%30)/29,last=selectedStage===undefined?89:Math.max(1,steps.length)*30-1;
 const audioProgress=useRef(progress);audioProgress.current=progress;
 useEffect(()=>{const player=audio.current;if(!player)return;if(playing&&visible&&kind==='video'&&stage===2&&phase>=2){player.currentTime=Math.min(5.99,audioProgress.current*6);void player.play().catch(()=>{})}else player.pause();return()=>player.pause()},[playing,visible,phase,kind,stage]);
 const previousRate=useRef(rate);
 useEffect(()=>{if(previousRate.current!==rate&&kind==='video'&&stage===0){setFrame(0);setPlaying(true);}previousRate.current=rate},[rate,kind,stage]);
 useEffect(()=>{let active=true;loadAssets(kind).then(a=>{if(active)setAssets(a)}).catch(()=>{if(active)setError(true)});return()=>{active=false}},[kind]);
 useEffect(()=>onStageChange?.(stage),[stage,onStageChange]);
 useEffect(()=>{const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting));if(host.current)observer.observe(host.current);return()=>observer.disconnect()},[]);
 useEffect(()=>{if(!playing||!visible)return;const timer=setInterval(()=>setFrame(value=>{if(value>=last){setPlaying(false);return last}return value+1}),kind==='video'&&stage===2?200:steps.length?100:200);return()=>clearInterval(timer)},[playing,visible,last,steps.length,kind,stage]);
 useEffect(()=>{const repaint=()=>{const ctx=canvas.current?.getContext('2d');if(ctx&&canvas.current&&assets)paint(ctx,assets,kind,stage,progress,rate,getComputedStyle(canvas.current).color,undefined,phase)};repaint();const observer=new MutationObserver(repaint);observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','data-interface']});return()=>observer.disconnect()},[assets,kind,stage,phase,progress,rate,language]);
 async function gif(){if(!assets)throw Error('assets');const c=document.createElement('canvas');c.width=640;c.height=560;const ctx=c.getContext('2d');if(!ctx)throw Error('canvas');const frames:Uint8ClampedArray[]=[],delays:number[]=[],exportStages=selectedStage===undefined?[0,1,2]:[selectedStage],totalPhases=exportStages.reduce((sum,s)=>sum+Math.max(1,pipelineSteps(kind,s).length),0),samples=Math.min(24,Math.floor(40/totalPhases));for(const s of exportStages){const phases=pipelineSteps(kind,s);for(let phase=0;phase<Math.max(1,phases.length);phase++)for(let i=0;i<samples;i++){ctx.fillStyle='#101d26';ctx.fillRect(0,0,640,560);ctx.save();ctx.translate(0,50);paint(ctx,assets,kind,s,i/Math.max(1,samples-1),rate,'#e3eee9','#101d26',phase);ctx.restore();ctx.fillStyle='#e3eee9';ctx.font='20px sans-serif';drawCaption(ctx,t(phases[phase]??labels[s]),20,28,600,24);ctx.font='16px sans-serif';drawCaption(ctx,t(pipelines[`${kind}-${s}`]?.[phase]?.[1]??''),20,485,600,22);frames.push(ctx.getImageData(0,0,640,560).data);delays.push(i===samples-1?1500:250)}}return{frames,width:640,height:560,delays}}

 const note=kind==='video'?'Zebra fotoğrafından üretilmiş 6 saniyelik örnek video.':kind==='files'&&stage===1&&phase===1?'Örnek: (mesafe, uzunluk), önceki baytları tekrar kullanır. PNG ayrıca filtreleme ve Huffman kodlaması uygular.':kind==='files'&&stage===2?'Örnek başlık değişimi gösterilir; parola veya şifreleme değildir.':'Aynı zebra üzerinde önce ve sonra karşılaştırması.';
 return <div className="tool-animation" ref={host}><div className="architecture-actions"><button disabled={!assets} onClick={()=>{if(frame===last)setFrame(0);if(audio.current){if(playing||phase<2)audio.current.pause();else{audio.current.currentTime=frame===last?0:Math.min(5.99,progress*6);void audio.current.play().catch(()=>{})}}setPlaying(!playing)}}>{t(playing?'Duraklat':'Başlat')}</button><button onClick={()=>{setPlaying(false);setFrame(0)}}>{t('Başa dön')}</button><button disabled={frame<30||!steps.length} onClick={()=>{setPlaying(false);setFrame(Math.max(0,phase-1)*30)}}>{t('Önceki aşama')}</button><button disabled={!steps.length||phase>=steps.length-1} onClick={()=>{setPlaying(false);setFrame((phase+1)*30)}}>{t('Sonraki aşama')}</button><ReadingGif key={`${kind}-${rate}-${selectedStage}`} name={`zebra-${kind}-${selectedStage??'all'}`} draw={gif} disabled={!assets}/></div>{selectedStage===undefined&&<LearningStageCards labels={labels} active={stage} data={assets} revision={`${kind}-${rate}`} width={640} height={400} disabled={!assets} onSelect={i=>{setPlaying(false);setFrame(i*30+29)}} draw={(ctx,i)=>{if(assets)paint(ctx,assets,kind,i,1,rate,'#e3eee9','#101d26',Math.max(0,pipelineSteps(kind,i).length-1))}}/>}{error&&<p role="alert">{t('Örnek fotoğraf yüklenemedi.')}</p>}{selectedStage!==undefined&&steps.length>1&&<LearningStageCards labels={steps} active={phase} data={assets} revision={`${kind}-${stage}-${rate}`} width={640} height={400} disabled={!assets} onSelect={i=>{setPlaying(false);setFrame(i*30+29)}} draw={(ctx,i)=>{if(assets)paint(ctx,assets,kind,stage,1,rate,'#e3eee9','#101d26',i)}}/>}{steps.length>0&&<p className="tool-phase-description" aria-live="polite">{t(pipelines[`${kind}-${stage}`][phase][1])}</p>}<canvas ref={canvas} width="640" height="400" role="img" aria-label={t(labels[stage])}/><p className="control-help">{t(note)}</p>{kind==='video'&&stage===2&&<><audio ref={audio} preload="auto" src="/videos/learning/zebra-audio.m4a"/><p className="control-help">{t('GIF ses içermez.')}</p></>}</div>;
}
