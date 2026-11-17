import {lazy,Suspense,useState} from 'react';
import {useQuizCompleted} from './quizProgress';
import {t,useLanguage} from './i18n';
import type {Props} from './DeepContent';
const DeepContent=lazy(()=>import('./DeepContent'));
export default function StudioDeepAnalysis(props:Props){useLanguage();const unlocked=useQuizCompleted('analysis'),[open,setOpen]=useState(false),[hint,setHint]=useState(false),requirement=t('Açmak için oyun merkezindeki görüntü işleme ve derin analiz testini tamamla.');return <section className="studio-fine-math studio-deep-analysis"><h3>{t('Derin analiz')}</h3><div className="fine-math-entry"><button aria-disabled={!unlocked} aria-expanded={unlocked&&open} title={unlocked?t(open?'Derin analizi kapat':'Derin analizi aç'):requirement} onClick={()=>{if(unlocked)setOpen(!open);else setHint(true)}}>{t(unlocked?(open?'Derin analizi kapat':'Derin analizi aç'):'Derin analiz · kilitli')}</button>{!unlocked&&<span className={'fine-lock-tip'+(hint?' visible':'')} role="status">{requirement}</span>}</div>{unlocked&&open&&<Suspense fallback={<p>{t('Görüntü hazırlanıyor…')}</p>}><DeepContent {...props}/></Suspense>}</section>}
