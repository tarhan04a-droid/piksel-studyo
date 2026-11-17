import {useState} from 'react';
import {t,useLanguage} from './i18n';
import PixelScanner from './PixelScanner';
import CnnDemo from './CnnDemo';
export default function ImageReading(){
 useLanguage();const[view,setView]=useState<'rgb'|'cnn'>('rgb');
 return <div className="image-reading"><div className="reading-selector" role="group" aria-label={t('Görüntü okuma gösterimi')}><button aria-pressed={view==='rgb'} aria-controls="image-reading-panel" onClick={()=>setView('rgb')}>{t('RGB piksel taraması')}</button><button aria-pressed={view==='cnn'} aria-controls="image-reading-panel" onClick={()=>setView('cnn')}>{t('CNN işleyişi')}</button></div><div id="image-reading-panel">{view==='rgb'?<PixelScanner/>:<CnnDemo/>}</div></div>;
}
