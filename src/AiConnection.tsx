import {useEffect,useRef,useState} from 'react';
import {t} from './i18n';
import type {AiCommand,AiHandler} from './aiCommands';
const remoteOrigin=location.hostname==='localhost'||location.hostname==='127.0.0.1'?'https://piksel-studyo.vercel.app':location.origin;
const idleDisconnectMs=10*60*1000;
function sessionCode(){return Array.from(crypto.getRandomValues(new Uint8Array(32)),value=>value.toString(16).padStart(2,'0')).join('')}
export default function AiConnection({onCommand}:{onCommand:AiHandler}){
 const [code,setCode]=useState(''),[enabled,setEnabled]=useState(false),[status,setStatus]=useState('Bağlı değil'),[last,setLast]=useState(''),[copyStatus,setCopyStatus]=useState('');
 const handler=useRef(onCommand),client=useRef(crypto.randomUUID());handler.current=onCommand;
 const connectorUrl=code?`${remoteOrigin}/api/mcp?session=${code}`:'';
 useEffect(()=>{
  if(!enabled||!code)return;
  let stopped=false,timer:ReturnType<typeof setTimeout>|undefined,lastCommandAt=performance.now(),failures=0;
  const controller=new AbortController(),results=new Map<string,{result:unknown;isError:boolean}>();
  const request=async(action:string,data:object)=>{const response=await fetch(remoteOrigin+'/api/bridge',{method:'POST',headers:{Authorization:`Bearer ${code}`,'Content-Type':'application/json'},body:JSON.stringify({action,client:client.current,...data}),signal:AbortSignal.any([controller.signal,AbortSignal.timeout(6000)])});const body=await response.json();if(!response.ok)throw new Error(body.error||String(response.status));return body};
  async function poll(){
   if(stopped)return;
   if(performance.now()-lastCommandAt>=idleDisconnectMs){setStatus('10 dakika AI işlemi yapılmadığı için bağlantı kapatıldı.');setEnabled(false);return}
   try{
   const data=await request('poll',{}),receivedAt=performance.now();if(stopped)return;setStatus('Stüdyo bağlantıya hazır');
   for(const command of data.commands as AiCommand[]){
    if(stopped)return;
    let answer=results.get(command.id);
    if(!answer){lastCommandAt=performance.now();try{if((data.serverTime??Date.now())+performance.now()-receivedAt>command.expires)throw new Error('Command expired; not applied');answer={result:await handler.current(command),isError:false}}catch(error){answer={result:{error:error instanceof Error?error.message:'Command failed'},isError:true}}results.set(command.id,answer);if(results.size>32)results.delete(results.keys().next().value!);setLast(command.name)}
    if(!stopped)await request('result',{id:command.id,...answer});
   }
   failures=0;
  }catch(error){if(stopped)return;const reason=error instanceof Error?error.message:'';if(reason==='storage_not_configured'||reason==='Another tab is connected'){setStatus(reason==='storage_not_configured'?'Sunucuda bağlantı deposu henüz kurulmadı.':'Başka bir sekme bağlı');setEnabled(false);return}failures++;
   if(failures>=3){setStatus('Sunucuya ulaşılamadığı için bağlantı kapatıldı. Yeniden bağlanabilirsin.');setEnabled(false);return}
   setStatus('Sunucuya ulaşılamıyor; bağlantını kontrol et.')}
  const idle=performance.now()-lastCommandAt;
  const delay=failures?5000*2**(failures-1):idle<30000?2500:idle<120000?5000:8000;
  if(!stopped)timer=setTimeout(poll,Math.min(delay,Math.max(0,idleDisconnectMs-idle)));
  }
  setStatus('Bağlanıyor…');void poll();
  return()=>{stopped=true;clearTimeout(timer);controller.abort();void fetch(remoteOrigin+'/api/bridge',{method:'POST',headers:{Authorization:`Bearer ${code}`,'Content-Type':'application/json'},body:JSON.stringify({action:'disconnect',client:client.current}),signal:AbortSignal.timeout(2000)}).catch(()=>{})};
 },[enabled,code]);
 async function copyUrl(){try{await navigator.clipboard.writeText(connectorUrl);setCopyStatus('Bağlantı kopyalandı.')}catch{setCopyStatus('Bağlantıyı seçip elle kopyalayabilirsin.')}}
 return <section className="ai-connection"><h3>{t('AI bağlantısı')}</h3><p>{t('Pollmek’i Claude gibi bir AI uygulamasına özel bağdaştırıcı olarak ekle. Fotoğraf cihazında kalır; ayarlar ve sayısal ölçümler bağlantı sunucusundan geçer.')}</p><ol><li>{t('Stüdyo bağlantısını aç ve özel bağlantını kopyala.')}</li><li>{t('Claude → Ayarlar → Bağdaştırıcılar → Özel bağdaştırıcı ekle bölümüne bu URL’yi yapıştır.')}</li><li>{t('Sohbette Pollmek araçlarını etkinleştir; düzenleme sırasında bu sekmeyi açık tut.')}</li></ol><button onClick={()=>{if(enabled){setEnabled(false);setStatus('Bağlı değil')}else{if(!code)setCode(sessionCode());setEnabled(true)}}}>{t(enabled?'Bağlantıyı kes':'Stüdyo bağlantısını aç')}</button>{connectorUrl&&<><label>{t('Özel bağdaştırıcı URL’si')}<input value={connectorUrl} readOnly dir="ltr" onFocus={e=>e.currentTarget.select()}/></label><button onClick={copyUrl}>{t('Bağlantıyı kopyala')}</button><p>{t('Bu bağlantı şifre gibidir; paylaşma. Yenilemek eski bağlantıyı geçersiz kılar.')} <button onClick={()=>{setEnabled(false);setCode('');setLast('');setCopyStatus('');setStatus('Bağlı değil')}}>{t('Bağlantıyı yenile')}</button></p></>}<p role="status">{t(status)} {t(copyStatus)}</p>{last&&<p>{t('Son AI işlemi')}: <bdi dir="ltr">{last}</bdi></p>}<p>{t('Boştayken kontroller seyrekleşir; 10 dakika AI işlemi yapılmazsa bağlantı kendiliğinden kapanır. Yeniden açınca aynı URL ile devam edebilirsin.')}</p><p>{t('Yetkiler: ayarları okuma ve değiştirme, otomatik iyileştirme, sıfırlama ve histogram. Orijinal dosya silinmez; dosya erişimi ve otomatik indirme yoktur.')}</p><p>{t('Ayrı bir AI API anahtarı gerekmez. AI uygulamanın kullanım sınırları geçerlidir. Bağlantıyı kapatmak yeni komutları durdurur; uygulanmış ayarları geri almaz.')}</p></section>;
}
