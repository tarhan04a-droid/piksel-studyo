import {useState,type ReactNode} from 'react';
import AnalysisWorkspace from './AnalysisWorkspace';
import {t,useLanguage} from './i18n';
export default function ToolWorkspace({title,children}:{title:string;children:ReactNode}){
 useLanguage();const[open,setOpen]=useState(false);
 return <section className="tool-workspace-entry"><button className="tool-workspace-trigger" aria-haspopup="dialog" aria-expanded={open} onClick={()=>setOpen(true)}><span>{t(title)}</span><span aria-hidden="true">↗</span></button>{open&&<AnalysisWorkspace title={title} onClose={()=>setOpen(false)}>{children}</AnalysisWorkspace>}</section>
}
