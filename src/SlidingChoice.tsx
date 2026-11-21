import './learningMath.css';
export default function SlidingChoice({right,onChange,leftLabel,rightLabel,disabled=false,describedBy}:{right:boolean;onChange:(right:boolean)=>void;leftLabel:string;rightLabel:string;disabled?:boolean;describedBy?:string}){
 return <button type="button" role="switch" aria-checked={right} aria-label={rightLabel} aria-describedby={describedBy} disabled={disabled} className={'mask-view-switch'+(right?' is-mask':'')} onClick={()=>onChange(!right)}><span className="mask-view-thumb" aria-hidden="true"/><span>{leftLabel}</span><span>{rightLabel}</span></button>;
}
