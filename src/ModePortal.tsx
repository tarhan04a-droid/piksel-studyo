import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {t} from './i18n';

/** The old view disappears before the mode changes; timers are cleared on unmount. */
export default function ModePortal({onSwap,onFinish}:{onSwap:()=>void;onFinish:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null),callbacks=useRef({onSwap,onFinish});callbacks.current={onSwap,onFinish};
 const[phase,setPhase]=useState('absorb');
 useEffect(()=>{
  const element=dialog.current;if(!element)return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
  document.documentElement.dataset.portal='absorb';element.showModal();
  const swap=setTimeout(()=>{callbacks.current.onSwap();setPhase('reveal');document.documentElement.dataset.portal='reveal'},reduced?100:900);
  const finish=setTimeout(()=>callbacks.current.onFinish(),reduced?260:1800);
  return()=>{clearTimeout(swap);clearTimeout(finish);delete document.documentElement.dataset.portal;document.body.style.overflow=oldOverflow;element.close()};
 },[]);
 return createPortal(<dialog ref={dialog} className={'mode-portal portal-'+phase} aria-label={t('Görüntü hazırlanıyor…')} onCancel={event=>event.preventDefault()}><div className="portal-vortex" aria-hidden="true"><div className="portal-center">{[0,1,2,3,4].map(index=><i className={'portal-current current-'+index} key={index}/>)}</div></div><span className="sr-only" role="status">{t('Görüntü hazırlanıyor…')}</span></dialog>,document.body);
}
