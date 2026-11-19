import {useEffect,useRef,useState} from 'react';
import {t} from './i18n';
export type GifFrames={frames:Uint8ClampedArray[];width:number;height:number};
export default function ReadingGif({name,draw,disabled=false}:{name:string;draw:()=>Promise<GifFrames>;disabled?:boolean}){
 const[busy,setBusy]=useState(false),[url,setUrl]=useState(''),[error,setError]=useState(false);const worker=useRef<Worker|null>(null),active=useRef(true),blobUrl=useRef('');
 useEffect(()=>{active.current=true;return()=>{active.current=false;worker.current?.terminate();if(blobUrl.current)URL.revokeObjectURL(blobUrl.current)}},[]);
 async function prepare(){if(busy)return;setBusy(true);setError(false);try{const data=await draw();if(!active.current)return;const w=new Worker(new URL('./cnnGifWorker.ts',import.meta.url),{type:'module'});worker.current=w;const fail=()=>{w.terminate();worker.current=null;if(active.current){setBusy(false);setError(true)}};w.onerror=fail;w.onmessage=(e:MessageEvent<{buffer?:ArrayBuffer}>)=>{if(!e.data.buffer){fail();return}w.terminate();worker.current=null;if(!active.current)return;if(blobUrl.current)URL.revokeObjectURL(blobUrl.current);blobUrl.current=URL.createObjectURL(new Blob([e.data.buffer],{type:'image/gif'}));setUrl(blobUrl.current);setBusy(false)};w.postMessage(data,data.frames.map(frame=>frame.buffer))}catch{if(active.current){setBusy(false);setError(true)}}}
 return <span className="reading-gif"><button disabled={disabled||busy} onClick={()=>void prepare()}>{t(busy?'GIF hazırlanıyor…':'Animasyonu GIF olarak hazırla')}</button>{url&&<a href={url} download={`pollmek-${name}.gif`}>{t('GIF indir')}</a>}{error&&<span role="alert">{t('GIF hazırlanamadı. Tekrar dene.')}</span>}</span>
}
