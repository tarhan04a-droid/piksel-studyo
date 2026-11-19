import {useState} from 'react';
import {t,useLanguage} from './i18n';
import PixelScanner from './PixelScanner';
import CnnDemo from './CnnDemo';
import ArchitectureDemo from './ArchitectureDemo';
export default function ImageReading(){
 useLanguage();const[view,setView]=useState<string>('rgb'),[matrix,setMatrix]=useState(false);
 return <div className="image-reading"><div className="reading-selector" role="group" aria-label={t('Görüntü okuma gösterimi')}><button aria-pressed={view==='rgb'} aria-controls="image-reading-panel" onClick={()=>setView('rgb')}>{t('RGB piksel taraması')}</button><button aria-pressed={view==='cnn'} aria-controls="image-reading-panel" onClick={()=>setView('cnn')}>{t('CNN işleyişi')}</button>{[["vit","ViT"],["dit","DiT"],["llm","LLM ile görsel üretimi"],["i2i","Image-to-Image"]].map(([key,label])=><button key={key} aria-pressed={view===key} aria-controls="image-reading-panel" onClick={()=>setView(key)}>{label}</button>)}<label className="reading-matrix-toggle"><input type="checkbox" checked={matrix} onChange={e=>setMatrix(e.target.checked)}/>{t('Kod / matris göster')}</label></div><div id="image-reading-panel">{view==='rgb'?<PixelScanner showMatrix={matrix}/>:view==='cnn'?<CnnDemo showMatrix={matrix}/>:<ArchitectureDemo key={view} kind={view} showMatrix={matrix}/>}</div></div>;
}
