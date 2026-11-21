export const rgbHex=(r:number,g:number,b:number)=>'#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('');
/** Swatches are source pixels, never synthetic bucket averages. */
export function imageColorPalette(image:ImageData){
 const buckets=new Map<string,{color:string;rgb:number[];count:number}>(),stride=Math.max(1,Math.ceil(image.width*image.height/4096));
 for(let pixel=0;pixel<image.width*image.height;pixel+=stride){const i=pixel*4;if(image.data[i+3]<128)continue;const rgb=Array.from(image.data.subarray(i,i+3)),key=rgb.map(v=>Math.floor(v/32)).join('-'),entry=buckets.get(key);if(entry)entry.count++;else buckets.set(key,{color:rgbHex(rgb[0],rgb[1],rgb[2]),rgb,count:1})}
 const candidates=[...buckets.values()].sort((a,b)=>b.count-a.count),chosen:typeof candidates=[];
 for(const distance of [48,24])for(const candidate of candidates){if(chosen.length>=12)break;if(chosen.every(c=>Math.hypot(...c.rgb.map((v,i)=>v-candidate.rgb[i]))>=distance))chosen.push(candidate)}
 return chosen.map(c=>c.color);
}
