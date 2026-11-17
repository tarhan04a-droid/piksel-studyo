/// <reference lib="webworker" />
export {};
// GIF89a with a fixed RGB332 palette. Frequent clear codes keep LZW at 9 bits.
self.onmessage=(event:MessageEvent<{frames:Uint8ClampedArray[];width:number;height:number}>)=>{
 try{
  const{frames,width,height}=event.data;if(!frames.length||frames.length>40||width*height>120000)throw new Error('GIF limits');
  const bytes:number[]=[],put=(...values:number[])=>bytes.push(...values),word=(value:number)=>put(value&255,value>>8&255),ascii=(value:string)=>{for(const char of value)put(char.charCodeAt(0))};
  ascii('GIF89a');word(width);word(height);put(0xf7,0,0);
  for(let i=0;i<256;i++)put(Math.round((i>>5)*255/7),Math.round((i>>2&7)*255/7),Math.round((i&3)*255/3));
  put(0x21,0xff,11);ascii('NETSCAPE2.0');put(3,1,0,0,0);
  for(const frame of frames){
   if(frame.length!==width*height*4)throw new Error('GIF frame');
   put(0x21,0xf9,4,4);word(50);put(0,0,0x2c);word(0);word(0);word(width);word(height);put(0,8);
   const compressed:number[]=[];let buffer=0,bits=0,count=0;
   const code=(value:number)=>{buffer|=value<<bits;bits+=9;while(bits>=8){compressed.push(buffer&255);buffer>>>=8;bits-=8}};
   code(256);
   for(let i=0;i<frame.length;i+=4){code((frame[i]>>5)<<5|(frame[i+1]>>5)<<2|frame[i+2]>>6);if(++count===200){code(256);count=0}}
   code(257);if(bits)compressed.push(buffer&255);
   for(let i=0;i<compressed.length;i+=255){const block=compressed.slice(i,i+255);put(block.length,...block)}put(0);
  }
  put(0x3b);const output=Uint8Array.from(bytes);self.postMessage({buffer:output.buffer},[output.buffer]);
 }catch{self.postMessage({error:true})}
};
