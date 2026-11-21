import ToolLearning from './ToolLearning';
import {useState} from 'react';
import {t,useLanguage} from './i18n';
import PixelScanner from './PixelScanner';
import CnnDemo from './CnnDemo';
import ArchitectureDemo from './ArchitectureDemo';
import FilterLearning from './FilterLearning';
import OperationLearning from './OperationLearning';
import {operationMath} from './operationMath';
import './learningMath.css';
const operations=(ids:number[])=>ids.map(i=>['op-'+i,operationMath[i].name]);
const groups=[
 {id:'pixels',name:'Piksel okuma',icon:'◐',items:[['rgb','RGB piksel taraması'],...operations([0])]},
 {id:'colors',name:'Renk kanalları',icon:'◒',items:operations([4,5,7,8])},
 {id:'tones',name:'Ton ve ışık',icon:'☀',items:operations([1,2,3,16])},
 {id:'selection',name:'Eşik ve bölütleme',icon:'⌗',items:operations([6,9,15])},
 {id:'histogram',name:'Histogram',icon:'▥',items:[...operations([17]),['clahe','CLAHE']]},
 {id:'filters',name:'Filtre ve kenar',icon:'▦',items:[['blur','Bulanıklaştırma'],...operations([10]),['sobel','Sobel']]},
 {id:'morphology',name:'Morfoloji',icon:'◇',items:operations([13,14])},
 {id:'cutout',name:'Nesne ayırma',icon:'⌗',items:[['cutout-0','Renk tabanlı seçim'],['cutout-1','Nesne modeli']]},
 {id:'files',name:'Dosya araçları',icon:'▱',items:[['files-0','Kırpma ve boyut'],['files-1','PNG sıkıştırma'],['files-2','Dosya kilidi']]},
 {id:'video',name:'Video araçları',icon:'▷',items:[['video-0','Hız ve ses'],['video-1','Çözünürlük ve sıkıştırma'],['video-2','MP4 çıktısı']]},
 {id:'classifiers',name:'Sınıflandıran modeller',icon:'⌁',items:[['cnn','CNN işleyişi'],['vit','ViT']]},
 {id:'generators',name:'Üreten modeller',icon:'✦',items:[['dit','DiT'],['llm','LLM ile görsel üretimi'],['i2i','Image-to-Image']]}
];
export default function ImageReading(){
 useLanguage();const[group,setGroup]=useState('pixels'),[view,setView]=useState('rgb'),[math,setMath]=useState(true);const selected=groups.find(g=>g.id===group)!;
 return <div className="image-reading"><div className="learning-hub"><div className="hub-categories" role="group" aria-label={t('Araç kategorileri')}>{groups.map(g=><button key={g.id} className={'learning-category'+(g.id==='classifiers'?' learning-model-classifiers':g.id==='generators'?' learning-model-generators':'')+(group===g.id?' selected':'')} aria-pressed={group===g.id} aria-controls="learning-options" onClick={()=>{setGroup(g.id);setView(g.items[0][0])}}><span className="hub-category-icon" aria-hidden="true">{g.icon}</span><span>{t(g.name)}</span></button>)}</div><div id="learning-options"><h2>{t(selected.name)}</h2><div className="reading-selector" role="group" aria-label={t('Görüntü okuma gösterimi')}>{selected.items.map(([key,label])=><button key={key} aria-pressed={view===key} aria-controls="image-reading-panel" onClick={()=>setView(key)}>{t(label)}</button>)}</div></div><label className="reading-matrix-toggle"><input type="checkbox" checked={math} onChange={e=>setMath(e.target.checked)}/>{t('Matematik göster')}</label></div><div id="image-reading-panel">{['cutout-','files-','video-'].some(prefix=>view.startsWith(prefix))?<ToolLearning key={view} kind={view.split('-')[0] as 'cutout'|'files'|'video'} step={Number(view.slice(-1))} showMath={math}/>:view==='rgb'?<PixelScanner showMatrix={math}/>:view==='cnn'?<CnnDemo showMatrix={math}/>:view.startsWith('op-')?<OperationLearning key={view} operation={Number(view.slice(3))} showMath={math}/>:['clahe','sobel','blur'].includes(view)?<FilterLearning key={view} kind={view as 'clahe'|'sobel'|'blur'} showMath={math}/>:<ArchitectureDemo key={view} kind={view} showMatrix={math}/>}</div></div>;
}
