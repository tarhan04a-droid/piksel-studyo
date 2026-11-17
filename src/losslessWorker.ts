import {Unzlib,zlibSync} from 'fflate';
const signature=[137,80,78,71,13,10,26,10];
const maxRaw=128*1024*1024;
function join(parts:Uint8Array[]){const output=new Uint8Array(parts.reduce((sum,p)=>sum+p.length,0));let offset=0;for(const part of parts){output.set(part,offset);offset+=part.length}return output}
function inflate(data:Uint8Array){const parts:Uint8Array[]=[];let size=0;const stream=new Unzlib(chunk=>{size+=chunk.length;if(size>maxRaw)throw new Error('Bu PNG tarayıcıda sıkıştırmak için fazla büyük.');parts.push(chunk)});for(let i=0;i<data.length;i+=1024)stream.push(data.subarray(i,i+1024),i+1024>=data.length);return join(parts)}
function crc32(data:Uint8Array){let crc=0xffffffff;for(const byte of data){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0)}return (crc^0xffffffff)>>>0}
function idat(data:Uint8Array){const chunk=new Uint8Array(data.length+12),view=new DataView(chunk.buffer);view.setUint32(0,data.length);chunk.set([73,68,65,84],4);chunk.set(data,8);view.setUint32(data.length+8,crc32(chunk.subarray(4,data.length+8)));return chunk}
self.onmessage=(event:MessageEvent<ArrayBuffer>)=>{
 try{
  const input=new Uint8Array(event.data),view=new DataView(event.data);
  if(!signature.every((byte,i)=>input[i]===byte))throw new Error('Kayıpsız küçültme için bir PNG dosyası seç.');
  const chunks:{type:string;bytes:Uint8Array;data:Uint8Array}[]=[];let offset=8,ended=false,idatEnded=false,hasIdat=false;
  while(offset+12<=input.length){
   const length=view.getUint32(offset);if(length>input.length-offset-12)throw new Error('PNG dosyası eksik veya bozuk.');
   const type=String.fromCharCode(...input.subarray(offset+4,offset+8)),end=offset+12+length;
   if(crc32(input.subarray(offset+4,end-4))!==view.getUint32(end-4))throw new Error('PNG dosyasının bütünlük kontrolü başarısız.');
   if(type==='IDAT'){if(idatEnded)throw new Error('PNG veri sırası geçersiz.');hasIdat=true}else if(hasIdat)idatEnded=true;
   chunks.push({type,bytes:input.subarray(offset,end),data:input.subarray(offset+8,end-4)});offset=end;
   if(type==='IEND'){ended=true;break}
  }
  if(!ended||!hasIdat||chunks[0]?.type!=='IHDR'||chunks[0].data.length!==13)throw new Error('Geçerli bir PNG dosyası seç.');
  const raw=inflate(join(chunks.filter(c=>c.type==='IDAT').map(c=>c.data))),compressed=zlibSync(raw,{level:9});
  // Verify the filtered pixel bytes are identical before offering a rewritten PNG.
  const restored=inflate(compressed);if(restored.length!==raw.length||!raw.every((byte,i)=>byte===restored[i]))throw new Error('Piksel verisi korunamadığı için işlem iptal edildi.');
  const parts=[input.subarray(0,8)];let written=false;
  for(const chunk of chunks){if(chunk.type==='IDAT'){if(!written){parts.push(idat(compressed));written=true}}else parts.push(chunk.bytes)}
  if(offset<input.length)parts.push(input.subarray(offset));
  const candidate=join(parts),smaller=candidate.length<input.length,output=smaller?candidate:input;
  self.postMessage({buffer:output.buffer,before:input.length,after:output.length,smaller,width:view.getUint32(16),height:view.getUint32(20)},{transfer:[output.buffer]});
 }catch(error){self.postMessage({error:error instanceof Error?error.message:'Dosya sıkıştırılamadı.'})}
};
