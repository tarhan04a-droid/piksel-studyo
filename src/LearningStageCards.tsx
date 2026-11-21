import {useEffect,useRef} from 'react';
import {t,useLanguage} from './i18n';
type Props={labels:string[];active:number;onSelect:(index:number)=>void;draw:(ctx:CanvasRenderingContext2D,index:number)=>void;data:unknown;revision?:string;disabled?:boolean;width?:number;height?:number};
function Preview({index,draw,data,revision,width,height}:{index:number;draw:Props['draw'];data:unknown;revision?:string;width:number;height:number}){
 const language=useLanguage(),canvas=useRef<HTMLCanvasElement>(null),latest=useRef(draw);latest.current=draw;
 useEffect(()=>{const paint=()=>{const node=canvas.current,ctx=node?.getContext('2d');if(!node||!ctx)return;ctx.clearRect(0,0,width,height);if(data)latest.current(ctx,index)};paint();const observer=new MutationObserver(paint);observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','data-interface']});return()=>observer.disconnect()},[data,revision,language,index,width,height]);
 return <canvas ref={canvas} width={width} height={height} aria-hidden="true"/>;
}
export default function LearningStageCards({labels,active,onSelect,draw,data,revision,disabled=false,width=256,height=256}:Props){
 useLanguage();return <ol className="architecture-pipeline learning-stage-cards" aria-label={t('Aşamalar')}>{labels.map((label,index)=><li key={label} className={active===index?'active':index<active?'complete':''}><button type="button" disabled={disabled} aria-pressed={active===index} onClick={()=>onSelect(index)}><span>{index+1} · {t(label)}</span><Preview index={index} draw={draw} data={data} revision={revision} width={width} height={height}/></button></li>)}</ol>;
}
