import {useEffect,useId,useRef,type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import {t,useLanguage} from './i18n';

/** A wide workspace keeps analysis out of the narrow tool sidebar. */
export default function AnalysisWorkspace({title,onClose,children}:{title:string;onClose:()=>void;children:ReactNode}){
 useLanguage();const dialog=useRef<HTMLDialogElement>(null),titleId=useId();
 useEffect(()=>{const element=dialog.current;if(!element)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';element.showModal();return()=>{element.close();document.body.style.overflow=previous}},[]);
 return createPortal(<dialog ref={dialog} className="analysis-workspace" aria-labelledby={titleId} onCancel={event=>{event.preventDefault();onClose()}} onClose={onClose}>
  <div className="analysis-workspace-heading"><h2 id={titleId}>{t(title)}</h2><button autoFocus onClick={onClose} aria-label={t(title==='İnce İşlemler'?'İnce İşlemleri kapat':title==='Derin analiz'?'Derin analizi kapat':'Araç panelini kapat')}>×</button></div>
  <div className="analysis-workspace-body">{children}</div>
 </dialog>,document.body);
}
