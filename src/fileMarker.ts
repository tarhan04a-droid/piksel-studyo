const marker=new TextEncoder().encode('.pollmek');
const headerSize=16,searchSize=256;
function imageType(bytes:Uint8Array){
 const text=new TextDecoder().decode(bytes),ascii=(start:number,end:number)=>String.fromCharCode(...bytes.subarray(start,end));
 if([137,80,78,71,13,10,26,10].every((value,i)=>bytes[i]===value))return 'image/png';
 if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'image/jpeg';
 if(text.startsWith('GIF87a')||text.startsWith('GIF89a'))return 'image/gif';
 if(text.startsWith('RIFF')&&text.slice(8,12)==='WEBP')return 'image/webp';
 if(text.startsWith('BM'))return 'image/bmp';
 if((bytes[0]===73&&bytes[1]===73&&bytes[2]===42&&bytes[3]===0)||(bytes[0]===77&&bytes[1]===77&&bytes[2]===0&&bytes[3]===42))return 'image/tiff';
 if(ascii(4,8)==='ftyp'){const brand=ascii(8,12);if(['avif','avis'].includes(brand))return 'image/avif';if(['heic','heix','hevc','hevx','mif1','msf1'].includes(brand))return 'image/heic'}
 if(/^\s*(?:<\?xml[^>]*>\s*)?<svg[\s>]/i.test(text))return 'image/svg+xml';
 return null;
}
function markerPositions(bytes:Uint8Array){const positions:number[]=[];for(let i=headerSize;i<=Math.min(searchSize,bytes.length-marker.length);i++)if(marker.every((value,j)=>bytes[i+j]===value))positions.push(i);return positions}
function toggleHeader(bytes:Uint8Array){const copy=bytes.slice();for(let i=0;i<headerSize;i++)copy[i]^=0xa5;return copy}
export async function lockImageFile(file:File){
 const prefix=new Uint8Array(await file.slice(0,searchSize+marker.length).arrayBuffer());
 if(markerPositions(prefix).length&&!imageType(prefix))throw new Error('Bu dosya zaten işaretli. Önce geri aç.');
 if(file.size<headerSize||!imageType(prefix))throw new Error('Desteklenen bir görsel dosyası seç (PNG, JPEG, GIF, WebP, BMP, TIFF, AVIF veya HEIC).');
 // Reject ambiguous originals rather than remove a natural occurrence on restore.
 if(markerPositions(prefix).length)throw new Error('Bu dosyanın başlığında aynı işaret zaten var; dosya değiştirilmedi.');
 const slots=Math.min(searchSize,file.size)-headerSize+1,random=new Uint32Array(1);let value:number;const limit=Math.floor(0x100000000/slots)*slots;do{crypto.getRandomValues(random);value=random[0]}while(value>=limit);
 const offset=headerSize+value%slots,head=toggleHeader(prefix.subarray(0,headerSize));
 return new File([head,file.slice(headerSize,offset),marker,file.slice(offset)],file.name,{type:'application/octet-stream',lastModified:file.lastModified});
}
export async function unlockImageFile(file:File):Promise<File|null>{
 const prefix=new Uint8Array(await file.slice(0,searchSize+marker.length).arrayBuffer());
 // Ordinary images are left untouched, even when their data contains this word.
 if(imageType(prefix))return null;
 const positions=markerPositions(prefix);if(!positions.length)return null;
 if(positions.length!==1)throw new Error('Birden fazla işaret bulundu; yanlış veri silmemek için dosya değiştirilmedi.');
 const offset=positions[0],head=toggleHeader(prefix.subarray(0,headerSize)),restoredPrefix=new Uint8Array(prefix.length-marker.length);restoredPrefix.set(head);restoredPrefix.set(prefix.subarray(headerSize,offset),headerSize);restoredPrefix.set(prefix.subarray(offset+marker.length),offset);
 const type=imageType(restoredPrefix);if(!type)throw new Error('İşaret bulundu ancak görüntü başlığı geri açılamadı.');
 return new File([head,file.slice(headerSize,offset),file.slice(offset+marker.length)],file.name,{type,lastModified:file.lastModified});
}
