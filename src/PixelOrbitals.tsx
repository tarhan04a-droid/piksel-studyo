import {useEffect,useRef,useState} from 'react';

/** Decorative CSS-only motion; stop when offscreen or the tab is hidden. */
export default function PixelOrbitals(){
 const host=useRef<HTMLDivElement>(null);const[running,setRunning]=useState(false);
 useEffect(()=>{let visible=false;const update=()=>setRunning(visible&&!document.hidden);const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;update()});if(host.current)observer.observe(host.current);document.addEventListener('visibilitychange',update);return()=>{observer.disconnect();document.removeEventListener('visibilitychange',update)}},[]);
 return <div ref={host} className={'pixel-orbitals'+(running?' orbitals-running':'')} aria-hidden="true">{Array.from({length:7},(_,cluster)=><div className={'orbital-cluster cluster-'+cluster} key={cluster}><div className="orbital-core"/>{[0,1,2].map(index=><div className={'pixel-orbital orbital-plane-'+index} key={index}><div className="orbital-track">{Array.from({length:24},(_,pixel)=>{const angle=pixel/24*Math.PI*2;return <b key={pixel} style={{left:50+Math.round(Math.cos(angle)*11)*4+'%',top:50+Math.round(Math.sin(angle)*11)*4+'%'}}/>})}</div><div className="orbital-spin"><i/><i/></div></div>)}</div>)}</div>;
}
