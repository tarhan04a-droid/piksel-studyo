/// <reference lib="webworker" />
export {};
// GIF89a with a content-adaptive global palette. Clear codes keep LZW at 9 bits.
self.onmessage=(event:MessageEvent<{frames:Uint8ClampedArray[];width:number;height:number}>)=>{
 try{
  const{frames,width,height}=event.data;if(!frames.length||frames.length>40||width*height>400000||frames.length*width*height>16000000)throw new Error('GIF limits');
  // Weighted median-cut over sampled RGB555 colors preserves the device palette.
  const histogram=new Uint32Array(32768);for(const frame of frames)for(let i=0;i<frame.length;i+=16)histogram[(frame[i]>>3)<<10|(frame[i+1]>>3)<<5|frame[i+2]>>3]++;
  type Color={r:number;g:number;b:number;n:number};type Bucket={colors:Color[];axis:'r'|'g'|'b';score:number};
  function bucket(colors:Color[]):Bucket{let axis:'r'|'g'|'b'='r',range=-1;for(const key of ['r','g','b'] as const){let min=31,max=0;for(const c of colors){min=Math.min(min,c[key]);max=Math.max(max,c[key])}if(max-min>range){range=max-min;axis=key}}return{colors,axis,score:colors.length>1?range*Math.sqrt(colors.reduce((sum,c)=>sum+c.n,0)):0}}
  const colors:Color[]=[];for(let i=0;i<histogram.length;i++)if(histogram[i])colors.push({r:i>>10,g:i>>5&31,b:i&31,n:histogram[i]});
  const buckets=[bucket(colors)];while(buckets.length<256){let best=0;for(let i=1;i<buckets.length;i++)if(buckets[i].score>buckets[best].score)best=i;const item=buckets[best];if(!item.score)break;item.colors.sort((a,b)=>a[item.axis]-b[item.axis]);const half=item.colors.reduce((sum,c)=>sum+c.n,0)/2;let count=0,at=0;while(at<item.colors.length-1&&count<half)count+=item.colors[at++].n;at=Math.max(1,at);buckets.splice(best,1,bucket(item.colors.slice(0,at)),bucket(item.colors.slice(at)))}
  const palette=buckets.map(item=>{const count=item.colors.reduce((sum,c)=>sum+c.n,0);return ['r','g','b'].map(key=>Math.round(item.colors.reduce((sum,c)=>sum+c[key as 'r'|'g'|'b']*c.n,0)/count*255/31))});while(palette.length<256)palette.push([0,0,0]);
  const lookup=new Int16Array(32768);lookup.fill(-1);const index=(r:number,g:number,b:number)=>{const key=(r>>3)<<10|(g>>3)<<5|b>>3;if(lookup[key]>=0)return lookup[key];let best=0,distance=Infinity;for(let i=0;i<palette.length;i++){const p=palette[i],d=(r-p[0])**2+(g-p[1])**2+(b-p[2])**2;if(d<distance){distance=d;best=i}}lookup[key]=best;return best};
  // Flush each encoded frame into a typed chunk instead of retaining millions
  // of JS numbers for the entire animation.
  const bytes:number[]=[],chunks:Uint8Array[]=[],flush=()=>{chunks.push(Uint8Array.from(bytes));bytes.length=0},put=(...values:number[])=>bytes.push(...values),word=(value:number)=>put(value&255,value>>8&255),ascii=(value:string)=>{for(const char of value)put(char.charCodeAt(0))};
  ascii('GIF89a');word(width);word(height);put(0xf7,0,0);
  for(const color of palette)put(...color);
  put(0x21,0xff,11);ascii('NETSCAPE2.0');put(3,1,0,0,0);
  for(const frame of frames){
   if(frame.length!==width*height*4)throw new Error('GIF frame');
   put(0x21,0xf9,4,4);word(50);put(0,0,0x2c);word(0);word(0);word(width);word(height);put(0,8);
   const compressed:number[]=[];let buffer=0,bits=0,count=0;
   const code=(value:number)=>{buffer|=value<<bits;bits+=9;while(bits>=8){compressed.push(buffer&255);buffer>>>=8;bits-=8}};
   code(256);
   for(let i=0;i<frame.length;i+=4){code(index(frame[i],frame[i+1],frame[i+2]));if(++count===200){code(256);count=0}}
   code(257);if(bits)compressed.push(buffer&255);
   for(let i=0;i<compressed.length;i+=255){const block=compressed.slice(i,i+255);put(block.length,...block)}put(0);flush();
  }
  put(0x3b);flush();const output=new Uint8Array(chunks.reduce((sum,chunk)=>sum+chunk.length,0));let offset=0;for(const chunk of chunks){output.set(chunk,offset);offset+=chunk.length}self.postMessage({buffer:output.buffer},[output.buffer]);
 }catch{self.postMessage({error:true})}
};
