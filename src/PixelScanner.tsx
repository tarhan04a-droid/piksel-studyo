import {t,trNode,getLocale,useLanguage} from './i18n';
import {useEffect,useRef,useState} from 'react';
const columns=12,rows=8,total=columns*rows;
const fmt=(n:number)=>n.toLocaleString(getLocale());
export default function PixelScanner({showMatrix=false}:{showMatrix?:boolean}){useLanguage();
 const section=useRef<HTMLElement>(null);
 const [pixels,setPixels]=useState<number[][]>([]),[index,setIndex]=useState(0),[playing,setPlaying]=useState(false),[visible,setVisible]=useState(false);
 useEffect(()=>{
  let cancelled=false;const image=new Image();
  image.onload=()=>{const canvas=document.createElement('canvas');canvas.width=columns;canvas.height=rows;const ctx=canvas.getContext('2d');if(!ctx)return;ctx.drawImage(image,0,0,columns,rows);const data=ctx.getImageData(0,0,columns,rows).data;if(!cancelled)setPixels(Array.from({length:total},(_,i)=>Array.from(data.slice(i*4,i*4+3))))};
  image.src='/images/demos/personal/01.jpg';return()=>{cancelled=true};
 },[]);
 useEffect(()=>{const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting));if(section.current)observer.observe(section.current);return()=>observer.disconnect()},[]);
 useEffect(()=>{if(!playing||!visible||!pixels.length)return;const timer=window.setInterval(()=>setIndex(current=>{if(current>=total-1){setPlaying(false);return current}return current+1}),180);return()=>clearInterval(timer)},[playing,visible,pixels.length]);
 const rgb=pixels[index]||[0,0,0];
 return <section className="pixel-scanner" ref={section} aria-labelledby="pixel-scanner-title">
  <div className="eyebrow">{t("BİR PİKSELİN İÇİNDE")}</div><h2 id="pixel-scanner-title">{t("Görüntü nasıl okunur?")}</h2>
  <p>{t("Başlat; sol üstten sağ alta, satır satır ilerleyen çerçevenin okuduğu kırmızı, yeşil ve mavi değerlerini izle.")}</p>
  <div className="pixel-scanner-layout"><div className="pixel-grid" role="img" aria-label={t("Fotoğrafın 12 sütun ve 8 satırdan oluşan basitleştirilmiş piksel görünümü")}>
   {trNode(pixels.map((pixel,i)=><span key={i} className={'scan-pixel'+(i===index?' current':'')+(i<index?' read':'')} style={{backgroundColor:`rgb(${pixel.join(',')})`}}/>))}
   {trNode(!pixels.length&&<span>{t("Görüntü hazırlanıyor…")}</span>)}
  </div><div className="pixel-readout"><span className="pixel-position">{t("Satır ")}{trNode(fmt(Math.floor(index/columns)+1))}{t(" · Sütun ")}{trNode(fmt(index%columns+1))}</span>
   <div className="pixel-rgb">{trNode(['R','G','B'].map((name,i)=><div key={name}><span>{trNode(name)}</span><strong>{trNode(fmt(rgb[i]))}</strong><div className={'rgb-meter rgb-'+name.toLowerCase()}><span style={{width:`${rgb[i]/255*100}%`}}/></div></div>))}</div>
   <p>{t("Her piksel, her renk kanalı için 0–255 arasında bir değer taşır. Bu örnekte fotoğraf, taramayı görebilmen için ")}{trNode(fmt(total))}{t(" piksele indirildi.")}</p>
   <div className="pixel-scan-actions"><button disabled={!pixels.length} onClick={()=>{if(index===total-1)setIndex(0);setPlaying(!playing)}}>{trNode(playing?'Duraklat':index===total-1?'Tekrar oynat':'Başlat')}</button><button onClick={()=>{setPlaying(false);setIndex(0)}}>{t("Başa dön")}</button></div>
   <span className="pixel-progress" role="status">{trNode(index===total-1?'Tarama tamamlandı':playing?'Pikseller okunuyor':'Tarama duraklatıldı')}{t(" · ")}{trNode(fmt(index+1))}{t(" / ")}{trNode(fmt(total))}</span>
  </div></div>
  {showMatrix&&<div className="machine-matrix"><h3>{t('RGB piksel matrisi')}</h3><p>{t('Her hücre [R, G, B] değerlerini gösterir. Çerçeve, animasyonda okunan pikseli izler.')}</p><div className="rgb-matrix-scroll"><div className="rgb-number-matrix" dir="ltr">{pixels.map((pixel,i)=><span key={i} className={i===index?'current':''}>{pixel.join(', ')}</span>)}</div></div><pre dir="ltr"><code>{`// RGB · row-major
row = ${Math.floor(index/columns)}; column = ${index%columns};
pixel = [${rgb.join(', ')}];
index = row * ${columns} + column;`}</code></pre></div>}
 </section>
}
