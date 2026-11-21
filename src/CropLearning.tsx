import {useEffect,useRef,useState} from 'react';
import CropTool,{type CropRect} from './CropTool';
import {t,useLanguage} from './i18n';

// Use the same editable contour as the Studio crop tool, without changing its photo.
export default function CropLearning(){
 useLanguage();const[result,setResult]=useState(''),[size,setSize]=useState(''),[error,setError]=useState(false),generation=useRef(0),url=useRef('');
 useEffect(()=>()=>{generation.current++;if(url.current)URL.revokeObjectURL(url.current)},[]);
 async function apply(rect:CropRect){
  const job=++generation.current;setError(false);
  try{const photo=new Image();photo.src='/images/cnn/zebra.webp';await photo.decode();
   const x=Math.floor(rect.x*photo.naturalWidth),y=Math.floor(rect.y*photo.naturalHeight),canvas=document.createElement('canvas');
   canvas.width=Math.max(1,Math.round(rect.width*photo.naturalWidth));canvas.height=Math.max(1,Math.round(rect.height*photo.naturalHeight));const ctx=canvas.getContext('2d');if(!ctx)throw Error('canvas');
   if(rect.corners){ctx.beginPath();rect.corners.forEach((p,i)=>{const px=p.x*photo.naturalWidth-x,py=p.y*photo.naturalHeight-y;if(i)ctx.lineTo(px,py);else ctx.moveTo(px,py)});ctx.closePath();ctx.clip()}
   ctx.drawImage(photo,-x,-y);const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('png');if(job!==generation.current)return;
   if(url.current)URL.revokeObjectURL(url.current);url.current=URL.createObjectURL(blob);setResult(url.current);setSize(`${canvas.width} × ${canvas.height}`);
  }catch{if(job===generation.current)setError(true)}
 }
 return <div className="crop-learning"><p>{t('Kenarın istediğin yerine basıp sürükle; seçim sınırını fotoğrafa göre şekillendir. Uygula ile gerçek kırpma sonucunu gör.')}</p><CropTool image="/images/cnn/zebra.webp" onApply={apply} onClose={()=>{generation.current++;setResult('');setError(false)}}/>{error&&<p role="alert">{t('Örnek fotoğraf yüklenemedi.')}</p>}{result&&<figure><img src={result} alt={t('Kırpma sonucu')}/><figcaption>{t('Kırpma sonucu')} · <span dir="ltr">{size}</span></figcaption></figure>}<p>{t('Seçimin içindeki pikseller korunur, dışı kaldırılır. Serbest sınırda kalan boşluklar şeffaftır; görüntünün içeriği tanınmaz veya yeniden üretilmez.')}</p></div>
}
