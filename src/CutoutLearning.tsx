import {useEffect,useState} from 'react';
import ObjectCutout from './ObjectCutout';
import {t,useLanguage} from './i18n';
export default function CutoutLearning({method}:{method:'color'|'model'}){
 useLanguage();const[image,setImage]=useState<ImageData|null>(null),[error,setError]=useState(false);
 useEffect(()=>{let active=true;const source=new Image();source.onload=()=>{const canvas=document.createElement('canvas');canvas.width=source.naturalWidth;canvas.height=source.naturalHeight;const context=canvas.getContext('2d');if(!context){if(active)setError(true);return}context.drawImage(source,0,0);if(active)setImage(context.getImageData(0,0,canvas.width,canvas.height))};source.onerror=()=>{if(active)setError(true)};source.src='/images/cnn/zebra.webp';return()=>{active=false}},[]);
 return <div className="cutout-learning"><p>{t('Bu bölüm Araç Merkezi ile aynı aracı çalıştırır. Seçimi fotoğrafın üzerinde sen yaparsın; hazır bir maske uygulanmaz.')}</p>{method==='model'&&<p className="control-help">{t('Zebra üzerinde alan çiz. Kenarın herhangi bir yerini sürükleyerek sınırı şekillendir; içindeki her şey korunur. Noktayla nesne seçimi için mevcut modeli yükleyebilirsin.')}</p>}{error&&<p role="alert">{t('Örnek fotoğraf yüklenemedi.')}</p>}{image?<ObjectCutout image={image} initialMethod={method} showGif/>:!error&&<p role="status">{t('Görüntü hazırlanıyor…')}</p>}</div>;
}
