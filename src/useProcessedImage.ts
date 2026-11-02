import {useEffect,useRef,useState} from 'react';
import {process,type Settings} from './engine';
type Job={id:number;image:ImageData;settings:Settings};
// One active job and one latest pending job: never queue every slider movement.
export function useProcessedImage(source:ImageData,settings:Settings){
 const [result,setResult]=useState({image:source,source,settings,id:0,blob:undefined as Blob|undefined});
 const [error,setError]=useState(false);
 const worker=useRef<Worker|null>(null),pending=useRef<Job|null>(null),active=useRef<Job|null>(null),latest=useRef(0),timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 function dispatch(){if(active.current||!pending.current)return;const job=pending.current;pending.current=null;active.current=job;if(worker.current){worker.current.postMessage(job)}else{try{complete(job,process(job.image,job.settings))}catch{active.current=null;setError(true)}}}
 function complete(job:Job,image:ImageData,blob?:Blob){active.current=null;if(job.id===latest.current){setResult({image,source:job.image,settings:job.settings,id:job.id,blob});setError(false)}dispatch()}
 useEffect(()=>{let instance:Worker|null=null;try{instance=new Worker(new URL('./imageWorker.ts',import.meta.url),{type:'module'});worker.current=instance;instance.onmessage=(event:MessageEvent<{id:number;result?:ImageData;blob?:Blob;error?:boolean}>)=>{const job=active.current;if(!job||job.id!==event.data.id)return;if(event.data.result)complete(job,event.data.result,event.data.blob);else{active.current=null;setError(true);dispatch()}};instance.onerror=()=>{instance?.terminate();worker.current=null;const job=active.current;active.current=null;if(!pending.current&&job)pending.current=job;dispatch()}}catch{worker.current=null}return()=>{instance?.terminate();worker.current=null;active.current=null;pending.current=null;if(timer.current)clearTimeout(timer.current)}},[]);
 useEffect(()=>{const job={id:++latest.current,image:source,settings:{...settings}};pending.current=job;setError(false);if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(dispatch,60);return()=>{if(timer.current)clearTimeout(timer.current)}},[source,settings]);
 return {previewBlob:result.blob,output:result.image,processedSource:result.source,appliedSettings:result.settings,processing:!error&&(result.source!==source||result.settings!==settings&&result.id!==latest.current),error};
}
