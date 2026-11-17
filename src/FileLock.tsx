import {notifyOperation} from './notifications';
import {useEffect,useRef,useState} from 'react';
import {getLocale,t,useLanguage} from './i18n';
import {lockImageFile,unlockImageFile} from './fileMarker';
type ReadyFile={url:string;name:string;size:number;unlocked:boolean};
export default function FileLock({originalFile}:{originalFile:File|null}){
 useLanguage();
 const [mode,setMode]=useState<'lock'|'unlock'>('lock'),[file,setFile]=useState<File|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[ready,setReady]=useState<ReadyFile|null>(null);
 const input=useRef<HTMLInputElement>(null),url=useRef<string|null>(null),generation=useRef(0),running=useRef(false);
 function clear(){generation.current++;if(url.current)URL.revokeObjectURL(url.current);url.current=null;setReady(null);setError('')}
 useEffect(()=>()=>{generation.current++;if(url.current)URL.revokeObjectURL(url.current)},[]);
 function choose(next:File|null){clear();setFile(next)}
 async function run(){
  if(running.current)return;
  clear();const request=generation.current;
  if(!file){setError('Önce bir dosya seç.');return}
  running.current=true;setBusy(true);
  try{
   const result=mode==='lock'?await lockImageFile(file):await unlockImageFile(file);
   if(!result)throw new Error('Bu dosyada Pollmek kilit işareti bulunamadı.');
   const name=result.name;
   if(request!==generation.current)return;
   notifyOperation(mode==='unlock'?'İşaret kaldırıldı ve dosya başlığı geri açıldı.':'Kilitli dosya hazır.');const href=URL.createObjectURL(result);url.current=href;setReady({url:href,name,size:result.size,unlocked:mode==='unlock'});
  }catch(e){if(request===generation.current)setError(e instanceof Error?e.message:'Dosya işlemi tamamlanamadı.')}finally{running.current=false;setBusy(false)}
 }
 return <section className="file-lock" aria-labelledby="file-lock-title"><h3 id="file-lock-title">{t('İşaretli dosya kilidi')}</h3><p>{t('Dosyanın ilk bölümüne rastgele konumda .pollmek işareti ekler ve başlığını geri alınabilir biçimde değiştirir. Dosya adı ve uzantısı korunur.')}</p><small>{t('Bu basit bir dosya kilididir; güvenli şifreleme değildir.')}</small>
  <div className="file-lock-tabs" role="group" aria-label={t('Dosya kilidi işlemi')}><button disabled={busy} aria-pressed={mode==='lock'} onClick={()=>{clear();setFile(null);setMode('lock')}}>{t('Kilitle')}</button><button disabled={busy} aria-pressed={mode==='unlock'} onClick={()=>{clear();setFile(null);setMode('unlock')}}>{t('Kilidi aç')}</button></div>
  <div className="file-lock-actions"><button disabled={busy} onClick={()=>input.current?.click()}>{t(mode==='lock'?'Görsel dosyası seç':'Kilitli dosyayı seç')}</button>{mode==='lock'&&originalFile&&<button disabled={busy} onClick={()=>choose(originalFile)}>{t('Yüklü fotoğrafı kullan')}</button>}</div>
  <input ref={input} hidden type="file" accept={mode==='lock'?'image/*':undefined} onChange={e=>{choose(e.target.files?.[0]||null);e.target.value=''}}/>
  {file&&<p className="file-lock-filename" dir="auto">{file.name} · {(file.size/1024).toLocaleString(getLocale(),{maximumFractionDigits:1})} KB</p>}
  <p>{t(mode==='lock'?'İşaret uzantı değildir. Dosya aynı adla indirilir; geri açmak için burada veya normal görsel yükleme alanında seç.':'Bu alan dosyayı ham veri olarak okur; resim görüntüleyicinin açabilmesi gerekmez.')}</p>
  <button className="file-lock-run" disabled={busy||!file} onClick={()=>void run()}>{t(busy?'İşlem sürüyor…':mode==='lock'?'Kilitle ve hazırla':'Kilidi aç ve hazırla')}</button>
  {error&&<p role="alert" className="lossless-error">{t(error)}</p>}{ready&&<div className="file-lock-result" role="status"><strong>{t(ready.unlocked?'İşaret kaldırıldı ve dosya başlığı geri açıldı.':'Kilitli dosya hazır.')}</strong><a href={ready.url} download={ready.name}>{t(ready.unlocked?'Orijinal görseli indir':'Kilitli dosyayı indir')}</a><span dir="auto">{ready.name} · {(ready.size/1024).toLocaleString(getLocale(),{maximumFractionDigits:1})} KB</span></div>}
 </section>
}
