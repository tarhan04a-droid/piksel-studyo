import {useEffect,useRef,useState,type ReactNode} from 'react';
import {t,useLanguage} from './i18n';
const tools=[
 ['quick','✦','Hızlı işlemler'],['color','◐','Işık ve renk'],['detail','▦','Doku ve detay'],
 ['segment','⌗','Bölütleme'],['files','▱','Dosya araçları'],['video','▷','Video araçları'],['analysis','⌁','Analiz ve öğrenme'],['histogram','▥','Histogram'],
] as const;
type Tool=typeof tools[number][0];
export default function StudioHub({sections,activeCount}:{sections:Record<Tool,ReactNode>;activeCount:number}){
 useLanguage();const[selected,setSelected]=useState<Tool>('quick'),[open,setOpen]=useState(false);const heading=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{const show=(event:Event)=>{const key=(event as CustomEvent).detail;if(tools.some(([id])=>id===key)){setSelected(key);setOpen(true)}};window.addEventListener('pollmek-studio-tool',show);return()=>window.removeEventListener('pollmek-studio-tool',show)},[]);
 const choose=(key:Tool)=>{setSelected(key);setOpen(true)};
 return <aside className={'studio-hub'+(open?' hub-open':'')} aria-label={t('Araç merkezi')}>
  <div className="hub-top"><div><span className="hub-eyebrow">{t('Araç merkezi')}</span><h2>{t('Bir araç seç')}</h2></div></div>
  <div className="hub-state"><i/><span>{t('Etkin ayarlar')} <b>{activeCount}</b></span></div>
  <div className="hub-categories" role="group" aria-label={t('Araç kategorileri')}>{tools.map(([key,icon,label],i)=><button key={key} className={open&&selected===key?'hub-category selected':'hub-category'} aria-pressed={open&&selected===key} aria-controls={'hub-panel-'+key} onClick={()=>choose(key)}><span className="hub-category-icon" aria-hidden="true">{icon}</span><span>{t(label)}</span><small>{String(i+1).padStart(2,'0')}</small></button>)}</div>
  <div className="hub-panel-heading" hidden={!open}><h3 ref={heading}>{t(tools.find(([key])=>key===selected)![2])}</h3><button aria-label={t('Araç panelini kapat')} onClick={()=>setOpen(false)}>×</button></div>
  {tools.map(([key])=><div id={'hub-panel-'+key} className={'hub-tool-panel hub-tool-'+key} key={key} hidden={!open||selected!==key}>{sections[key]}</div>)}
  {!open&&<p className="hub-empty">{t('Fotoğrafın burada kalır. Bir kategori seç; yalnızca ihtiyacın olan ayarlar açılsın.')}</p>}
 </aside>
}
