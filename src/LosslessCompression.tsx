import {notifyOperation} from './notifications';
import FileLock from './FileLock';
import {t,trNode,getLocale,useLanguage} from './i18n';
import {useEffect,useRef,useState} from 'react';
type Result={url:string;name:string;before:number;after:number;smaller:boolean;width:number;height:number};
const size=(value:number)=>(value/1024).toLocaleString(getLocale(),{maximumFractionDigits:1})+' KB';
export default function LosslessCompression({image,disabled,originalFile}:{image:ImageData;disabled:boolean;originalFile:File|null}){useLanguage();
 const [working,setWorking]=useState(false),[result,setResult]=useState<Result|null>(null),[error,setError]=useState('');
 const input=useRef<HTMLInputElement>(null),worker=useRef<Worker|null>(null),outputUrl=useRef<string|null>(null),request=useRef(0);
 function clear(){request.current++;worker.current?.terminate();worker.current=null;if(outputUrl.current)URL.revokeObjectURL(outputUrl.current);outputUrl.current=null;setResult(null);setWorking(false);setError('')}
 useEffect(()=>{clear();return()=>{request.current++;worker.current?.terminate();if(outputUrl.current)URL.revokeObjectURL(outputUrl.current)}},[image,originalFile]);
 async function compress(file?:File){
  if(working||!file)return;clear();const id=request.current;setWorking(true);
  try{
   if(file.size>64*1024*1024)throw new Error('64 MB veya daha küçük bir PNG seç.');
   const data=await file.arrayBuffer();if(request.current!==id)return;
   const instance=new Worker(new URL('./losslessWorker.ts',import.meta.url),{type:'module'});worker.current=instance;
   instance.onmessage=(event:MessageEvent<{buffer?:ArrayBuffer;error?:string;before:number;after:number;smaller:boolean;width:number;height:number}>)=>{
    if(request.current!==id)return;instance.terminate();worker.current=null;setWorking(false);
    if(event.data.error||!event.data.buffer){setError(event.data.error||'Dosya sıkıştırılamadı.');return}
    notifyOperation('PNG işlemi tamamlandı. Dosyan indirilmeye hazır.');const url=URL.createObjectURL(new Blob([event.data.buffer],{type:'image/png'}));outputUrl.current=url;setResult({...event.data,url,name:file.name.replace(/\.[^.]+$/,'')+(event.data.smaller?'-kayipsiz.png':'.png')});
   };
   instance.onerror=()=>{if(request.current!==id)return;instance.terminate();worker.current=null;setWorking(false);setError('Sıkıştırma tamamlanamadı. Daha küçük bir PNG ile tekrar dene.')};
   instance.postMessage(data,[data]);
  }catch(e){if(request.current!==id)return;setWorking(false);setError(e instanceof Error?e.message:'Dosya sıkıştırılamadı.')}
 }
 async function compressCurrent(){
  if(working||disabled)return;
  try{const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;canvas.getContext('2d')!.putImageData(image,0,0);const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('PNG hazırlanamadı.')),'image/png'));await compress(new File([blob],'pollmek.png',{type:'image/png'}))}catch{setError('PNG hazırlanamadı.')}
 }
 return <details className="lossless-panel"><summary>{t("Dosya araçları · küçült ve kilitle")}</summary><h3>{t("Kayıpsız küçült · PNG")}</h3><p>{t("PNG’nin piksel verisini, çözünürlüğünü ve diğer dosya bilgilerini korur. Küçülmezse orijinal dosya sunulur.")}</p><div className="lossless-actions"><button disabled={working} onClick={()=>input.current?.click()}>{t("PNG seç ve küçült")}</button>{trNode(originalFile?.type==='image/png'&&<button disabled={working||disabled} onClick={()=>void compress(originalFile)}>{t("Yüklediğim PNG’yi küçült")}</button>)}<button disabled={working||disabled} onClick={()=>void compressCurrent()}>{t("Düzenlenmiş PNG’yi küçült")}</button></div><input ref={input} type="file" hidden accept="image/png,.png" onChange={e=>{void compress(e.target.files?.[0]);e.target.value=''}}/><small>{t("Düzenlenmiş PNG, mevcut önizlemenin boyutunu kullanır. JPEG kayıpsız sıkıştırması bu araçta desteklenmez; JPEG indirme seçeneği ayrı kalır.")}</small>
 {trNode(working&&<p role="status">{t("Piksel verisi korunarak sıkıştırılıyor… ")}<button onClick={clear}>{t("İptal")}</button></p>)}{trNode(error&&<p className="lossless-error" role="alert">{trNode(error)}</p>)}
 {trNode(result&&<div className="lossless-result"><div role="status"><strong>{trNode(result.smaller?'Dosyan küçüldü':'Bu dosya zaten iyi sıkıştırılmış')}</strong><dl><div><dt>{t("Önce")}</dt><dd>{trNode(size(result.before))}</dd></div><div><dt>{t("Sonra")}</dt><dd>{trNode(size(result.after))}</dd></div><div><dt>{t("Kazanç")}</dt><dd>{t("%")}{trNode(((result.before-result.after)/result.before*100).toLocaleString(getLocale(),{maximumFractionDigits:1}))}</dd></div></dl><p>{trNode(result.width.toLocaleString(getLocale()))}{t(" × ")}{trNode(result.height.toLocaleString(getLocale()))}{t(" piksel · ")}{trNode(result.smaller?'Piksel verisi birebir korundu.':'Orijinal dosya korundu.')}</p></div><img src={result.url} alt={t("Kayıpsız PNG sonucu")}/><a href={result.url} download={result.name}>{trNode(result.smaller?'Küçültülmüş PNG’yi indir':'Orijinal PNG’yi indir')}</a></div>)}
 <FileLock originalFile={originalFile}/>
 </details>
}
