import {captionLines,drawCaption} from './gifCaption';
import {useEffect,useRef,useState} from 'react';
import ReadingGif from './ReadingGif';
import {t,useLanguage} from './i18n';
import './architecture.css';
import implementationSource from './ArchitectureDemo.tsx?raw';
type Step={name:string;description:string;visual:string;code:string};
const s=(name:string,description:string,visual:string,code:string):Step=>({name,description,visual,code});
const encoder=[
 s('Layer Norm','Her tokenın özellikleri normalize edilir.','vector','u = LayerNorm(x)'),
 s('Multi-Head Self-Attention','Q ve K benzerliklerinden her satırda toplamı 1 olan dikkat ağırlıkları hesaplanır. Ağırlıklar V ile birleştirilir.','attention','Q, K, V = u @ Wq, u @ Wk, u @ Wv\nA = softmax(Q @ K.T / sqrt(d_k), axis=-1)\ny = concat(heads) @ Wo'),
 s('Artık bağlantı','Dikkat çıktısı, bloğun girişine eklenir.','vector','x = x + y'),
 s('Layer Norm + MLP','Normalize edilmiş özellikler doğrusal katman, GELU ve ikinci doğrusal katmandan geçer.','network','y = W2 @ GELU(W1 @ LayerNorm(x) + b1) + b2'),
 s('Artık bağlantı ve çıktı','MLP çıktısı eklenir; token sayısı ve özellik boyutu korunur.','vector','output = x + y')];
const decoder=[s('Sürekli latent','Sıkıştırılmış uzamsal özellikler decoder girişidir. RGB piksel değildir.','patch','z: [channels, height, width]'),s('ResNet blokları','Özellikler artık bağlantılı evrişim bloklarıyla dönüştürülür. Decoder mimarisi modele göre değişir.','network','h = h + conv_block(h)'),s('Upsampling + convolution','Uzamsal çözünürlük kademeli artırılır.','decode','h = conv(upsample(h))'),s('RGB çıktı','Son katman özellikleri üç renk kanalına dönüştürür.','image','rgb = decoder(z)')];
const flows:Record<string,{title:string;steps:Step[];source:string}>={
 vit:{title:'Vision Transformer (ViT)',source:'https://arxiv.org/abs/2010.11929',steps:[s('Görüntü yamaları','Görüntü eşit boyutlu yamalara bölünür.','patch','patches = patchify(image, patch_size=P)\nN = H * W / (P * P)'),s('Doğrusal izdüşüm','Her yama düzleştirilir ve öğrenilen bir matrisle token vektörüne dönüştürülür.','vector','tokens = flatten(patches) @ W + b'),s('Konum + CLS','Konum vektörleri eklenir; sınıflandırma için CLS tokenı başa yerleştirilir.','vector','x = concat(CLS, tokens) + position'),s('Transformer encoder','Tokenlar, dikkat ve MLP bloklarından geçerek diğer yamalardan bilgi alır. İç yapı sekmesinde bloğu incele.','attention','for block in encoder:\n    x = block(x)'),s('Sınıflandırma başlığı','Gerçek ViT, CLS çıktısını sınıflandırır. Bu küçük örnekte yama özellikleri ortalanır ve sabit ağırlıklarla üç temsili skora çevrilir; gerçek sınıf tahmini yapılmaz.','scores','probabilities = softmax(head(x[0]))')]},
 encoder:{title:'ViT encoder iç yapısı',steps:encoder,source:'https://arxiv.org/abs/2010.11929'},
 dit:{title:'Diffusion Transformer (DiT)',source:'https://arxiv.org/abs/2212.09748',steps:[s('Gürültülü latent + koşul','Başlangıç gürültüsü ve zaman adımı alınır. Özgün DiT sınıfla koşullanır; metin koşullaması sonraki mimarilerde kullanılabilir.','noise','z_t = sample_noise()\nc = timestep_embedding(t) + class_embedding(y)'),s('Yamalama + tokenlar','Latent yamaları token vektörlerine dönüştürülür.','patch','x = patch_embed(z_t) + position'),s('DiT blokları','AdaLN koşullaması, self-attention ve MLP özellikleri dönüştürür.','attention','x = DiT_blocks(x, c)'),s('Yinelemeli gürültü giderme','Modelin tahmini ve örnekleyici, latent durumunu bir sonraki zaman adımına taşır. Buradaki temizlenme görsel bir temsildir.','denoise','for t in timesteps:\n    prediction = model(z_t, t, condition)\n    z_t = sampler_step(z_t, prediction, t)'),s('VAE decoder','Son latent, decoder ile RGB görüntüye dönüştürülür.','decode','image = vae.decode(z_0)')]},
 ditblock:{title:'DiT bloğu iç yapısı',source:'https://arxiv.org/abs/2212.09748',steps:[s('AdaLN koşullaması','Zaman ve sınıf koşulundan ölçek, kaydırma ve kapı değerleri üretilir.','vector','shift, scale, gate = modulation(condition)\nu = LayerNorm(x) * (1 + scale) + shift'),s('Self-attention + artık bağlantı','Tokenlar arası bilgi karışımı koşula bağlı kapıyla girişe eklenir.','attention','x = x + gate_attn * attention(u)'),s('AdaLN + MLP','İkinci normalizasyon ve özellik dönüşümü uygulanır.','network','v = modulate(LayerNorm(x), shift_mlp, scale_mlp)'),s('Kapılı artık bağlantı','MLP çıktısı ikinci kapı üzerinden eklenir.','vector','output = x + gate_mlp * MLP(v)')]},
 llm:{title:'Otoregresif görsel üretimi',source:'https://arxiv.org/abs/2012.09841',steps:[s('Metin tokenları','Komut, modele uygun token dizisine çevrilir. Bu, ayrık görsel token kullanan mimarilere bir örnektir.','vector','text_tokens = tokenizer(prompt)'),s('Nedensel transformer','Her konum yalnız önceki tokenlara ve kendisine dikkat eder.','causal','p_next = model(text_tokens, image_tokens)'),s('Sırayla görsel token üretimi','Her yeni görsel token, önceki tahminlerin ardından üretilir.','tokens','while not finished:\n    token = sample(p_next)\n    image_tokens.append(token)'),s('Kod kitabı eşleştirme','Ayrık kimlikler, öğrenilmiş kod kitabındaki vektörlerle eşleştirilir.','vector','z = codebook[image_tokens]'),s('Görsel decoder','Vektörler uzamsal ızgaraya düzenlenir ve görüntüye çözülür.','decode','image = decoder(reshape(z))')]},
 causal:{title:'Nedensel dikkat',source:'https://arxiv.org/abs/1706.03762',steps:[s('Q × Kᵀ skorları','Token çiftleri için ölçeklenmiş benzerlik skorları hesaplanır.','attention','scores = Q @ K.T / sqrt(d_k)'),s('Geleceği maskele','Üst üçgendeki gelecek konumları −∞ yapılır. Mevcut ve geçmiş tokenlar erişilebilir kalır.','causal','scores[j > i] = -inf'),s('Satır bazında Softmax','Maske sonrasında her satırın ağırlıkları toplamı 1 olur. İlk token yalnız kendisine baktığı için ağırlığı 1’dir.','causal','A = softmax(scores, axis=-1)\noutput = A @ V')]},
 i2i:{title:'Image-to-Image',source:'https://arxiv.org/abs/2112.10752',steps:[s('Kaynak görüntü','Kaynak görüntü VAE encoder ile latent uzaya aktarılır.','image','z = vae.encode(source)'),s('Kısmi gürültü','Güç değeri başlangıç zaman adımını belirler. Daha fazla gürültü, kaynaktan daha fazla uzaklaşmaya izin verir.','noise','z_t = sqrt(alpha_t) * z + sqrt(1-alpha_t) * noise'),s('Koşullu gürültü giderme','Komut koşuluyla yinelemeli örnekleme yapılır. Denoiser, modele göre U-Net veya transformer olabilir.','denoise','z_0 = denoise(z_t, prompt, start_t=t)'),s('VAE decoder','Latent, piksel görüntüsüne çözülür. Gösterimde örnek fotoğraf kullanılır; yeni görsel üretilmez.','decode','result = vae.decode(z_0)'),s('Yeni düzenleme','Yeni komutla çıktı tekrar girdi olarak kullanılabilir. Bu döngü, modelin iç düşünme adımlarını göstermez.','image','source = result\n# next edit uses a new instruction')]},
 vae:{title:'VAE decoder',steps:decoder,source:'https://arxiv.org/abs/2112.10752'},
 vq:{title:'VQ-VAE / VQGAN decoder',source:'https://arxiv.org/abs/2012.09841',steps:[s('Ayrık token kimlikleri','Her kimlik kod kitabındaki bir girdiye işaret eder.','tokens','ids = [412, 809, 153, 992]'),s('Kod kitabı','Aynı kimlik her zaman aynı kod kitabı vektörüne eşlenir.','vector','z = embedding_table[ids]'),s('2B ızgara','Vektörler uzamsal yerleşimlerine göre düzenlenir.','patch','grid = reshape(z, [height, width, channels])'),s('Decoder + upsampling','Öğrenilmiş decoder, özellik ızgarasından pikselleri oluşturur.','decode','image = decoder(grid)')]}
};
// Each model is one continuous route, including its internal blocks and decoder.
export const architectures:typeof flows={
 vit:{...flows.vit,steps:[...flows.vit.steps.slice(0,3),...flows.encoder.steps,flows.vit.steps[4]]},
 dit:{...flows.dit,steps:[...flows.dit.steps.slice(0,2),...flows.ditblock.steps,flows.dit.steps[3],...flows.vae.steps]},
 llm:{...flows.llm,steps:[flows.llm.steps[0],...flows.causal.steps,flows.llm.steps[2],...flows.vq.steps.slice(1)]},
 i2i:{...flows.i2i,steps:[...flows.i2i.steps.slice(0,3),...flows.vae.steps,flows.i2i.steps[4]]}
};
// Small, deterministic demonstration: actual image patches projected with fixed,
// untrained weights. Reused across projection, normalization and attention views.
const featureCache=new WeakMap<HTMLImageElement,number[][]>();
function patchFeatures(image:HTMLImageElement|null):number[][]{
 if(!image)return Array.from({length:16},()=>Array(6).fill(0));
 const cached=featureCache.get(image);if(cached)return cached;
 const canvas=document.createElement('canvas');canvas.width=canvas.height=32;const ctx=canvas.getContext('2d');if(!ctx)return[];
 const side=Math.min(image.naturalWidth,image.naturalHeight);ctx.drawImage(image,(image.naturalWidth-side)/2,(image.naturalHeight-side)/2,side,side,0,0,32,32);const pixels=ctx.getImageData(0,0,32,32).data;
 const features=Array.from({length:16},(_,patch)=>Array.from({length:6},(_,d)=>{let sum=0;for(let y=0;y<8;y++)for(let x=0;x<8;x++)for(let c=0;c<3;c++){const pixel=((Math.floor(patch/4)*8+y)*32+patch%4*8+x)*4+c;sum+=(pixels[pixel]/255)*Math.sin((y*24+x*3+c+1)*(d+1)*.17)}return sum/Math.sqrt(192)}));featureCache.set(image,features);return features;
}
function normalized(values:number[]){const mean=values.reduce((a,b)=>a+b,0)/values.length,variance=values.reduce((a,b)=>a+(b-mean)**2,0)/values.length;return values.map(v=>(v-mean)/Math.sqrt(variance+1e-5))}
function softmax(values:number[]){const max=Math.max(...values),exp=values.map(v=>Math.exp(v-max)),sum=exp.reduce((a,b)=>a+b,0);return exp.map(v=>v/sum)}

const palette=['#61d7dc','#ae82e9','#e7c569','#8dd9b2'];
const flowDimensions:Record<string,string[]>={vit:['4 × 4 yama','16 × D','17 × D · CLS + 16','17 × D → 17 × D','D → 3 örnek skor'],encoder:['N × D','Q · K · V → N × D','x + Attention(x)','D → 4D → D','x + MLP(x)'],dit:['zₜ + zaman + sınıf','N × D','N × D → N × D','t → t − 1 → … → 0','latent → RGB'],ditblock:['γ · β · α','x + α × Attention','D → 4D → D','x + α × MLP'],llm:['Metin → tokenlar','Alt üçgen dikkat','ID₁ → ID₂ → ID₃ → …','ID → D özellik','Izgara → RGB'],causal:['QKᵀ / √d','Gelecek = −∞','Σ her satır = 1'],i2i:['RGB → latent','z → zₜ','zₜ → … → z₀','latent → RGB','Çıktı → yeni girdi'],vae:['C × H × W','C × H × W','H → 2H → 4H','3 × H × W'],vq:['412 · 809 · 153 · 992','ID → aynı vektör','N × D → H × W × D','Izgara → RGB']};
const dimensions:typeof flowDimensions={
 vit:[...flowDimensions.vit.slice(0,3),...flowDimensions.encoder,flowDimensions.vit[4]],
 dit:[...flowDimensions.dit.slice(0,2),...flowDimensions.ditblock,flowDimensions.dit[3],...flowDimensions.vae],
 llm:[flowDimensions.llm[0],...flowDimensions.causal,flowDimensions.llm[2],...flowDimensions.vq.slice(1)],
 i2i:[...flowDimensions.i2i.slice(0,3),...flowDimensions.vae,flowDimensions.i2i[4]]
};
function visualBranch(step:Step){
 if(step.name.toLowerCase().includes('artık')||step.code.includes('output = x +'))return 'residual';
 if(step.name==='Doğrusal izdüşüm')return 'projection';
 if(step.name==='Konum + CLS')return 'position';
 if(step.name.includes('kitab'))return 'codebook';
 if(step.name.includes('Norm')&&!step.visual.includes('network'))return 'norm';
 if(step.visual==='attention'||step.visual==='causal')return 'attention';
 if(step.visual==='noise'||step.visual==='denoise')return 'noise';
 return step.visual;
}
// The same stage renderer is used by the cards, inspector and GIF export.
function drawVisual(ctx:CanvasRenderingContext2D,step:Step,progress:number,image:HTMLImageElement|null,ink='#e3eee9'){
 const features=patchFeatures(image);const selected=Math.min(15,Math.floor(progress*16));
 ctx.clearRect(0,0,380,240);ctx.lineWidth=2;ctx.font='13px sans-serif';ctx.textAlign='center';
 const text=(value:string,x:number,y:number,color=ink)=>{ctx.fillStyle=color;ctx.fillText(value,x,y)};
 const line=(x:number,y:number,xx:number,yy:number,color=palette[0])=>{ctx.strokeStyle=color;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(xx,yy);ctx.stroke()};
 const arrow=(x:number,y:number,xx:number,yy:number)=>{line(x,y,xx,yy);const a=Math.atan2(yy-y,xx-x);line(xx,yy,xx-8*Math.cos(a-.5),yy-8*Math.sin(a-.5));line(xx,yy,xx-8*Math.cos(a+.5),yy-8*Math.sin(a+.5))};
 const box=(x:number,y:number,w:number,h:number,color:string)=>{ctx.fillStyle=color+'22';ctx.strokeStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,7);ctx.fill();ctx.stroke()};
 const photo=(x:number,y:number,size:number,resolution=32)=>{if(!image)return;const tile=document.createElement('canvas');tile.width=tile.height=resolution;const c=tile.getContext('2d');if(!c)return;const side=Math.min(image.naturalWidth,image.naturalHeight);c.drawImage(image,(image.naturalWidth-side)/2,(image.naturalHeight-side)/2,side,side,0,0,resolution,resolution);ctx.imageSmoothingEnabled=false;ctx.drawImage(tile,x,y,size,size)};
 const vector=(x:number,y:number,seed:number,rows=6)=>{for(let i=0;i<rows;i++){ctx.fillStyle=palette[(i+seed)%4];ctx.globalAlpha=.2+.8*Math.min(1,Math.abs(features[seed%16]?.[i%6]||0));ctx.fillRect(x,y+i*20,22,16)}ctx.globalAlpha=1};
 const branch=visualBranch(step);
 if(branch==='residual'){
 // @stage residual

  box(20,96,58,48,palette[0]);text('x',49,125);arrow(80,120,118,120);box(120,86,115,68,palette[1]);text(step.visual==='network'?'MLP':'Dönüşüm',177,125);arrow(238,120,278,120);ctx.strokeStyle=palette[2];ctx.beginPath();ctx.moveTo(49,92);ctx.lineTo(49,48);ctx.lineTo(300,48);ctx.lineTo(300,98);ctx.stroke();text('Artık bağlantı',175,35,palette[2]);ctx.beginPath();ctx.arc(300,120,22,0,Math.PI*2);ctx.stroke();text('+',300,126);arrow(324,120,365,120);ctx.fillStyle=palette[2];ctx.beginPath();ctx.arc(49+progress*251,48,5,0,Math.PI*2);ctx.fill();text('Girdi korunur + yeni özellik',190,204);
 }else if(branch==='projection'){
 // @stage projection
if(image){const side=Math.min(image.naturalWidth,image.naturalHeight);ctx.drawImage(image,(image.naturalWidth-side)/2+selected%4*side/4,(image.naturalHeight-side)/2+Math.floor(selected/4)*side/4,side/4,side/4,22,76,82,82)}box(19,73,88,88,palette[2]);arrow(112,117,147,117);for(let i=0;i<16;i++){ctx.fillStyle=palette[i%4];ctx.fillRect(154,36+i*10,15,7)}arrow(177,117,228,117);box(234,80,66,72,palette[1]);text('W',267,123);arrow(304,117,331,117);vector(342,61,selected);text(`Yama ${selected+1}`,63,191);text('Düzleştir',165,218);text('İzdüşüm',267,191);
 }else if(branch==='position'){
 // @stage position

  for(let row=0;row<4;row++){text(row===0?'CLS':`P${row}`,30,56+row*44,row===0?palette[2]:ink);for(let col=0;col<6;col++){ctx.fillStyle=palette[(row+col)%4];ctx.fillRect(60+col*25,36+row*44,19,28)}text('+',227,56+row*44);box(250,36+row*44,85,28,palette[2]);text(`Konum ${row}`,292,55+row*44)}
 }else if(branch==='codebook'){
 // @stage codebook
const ids=[412,809,412,153];ids.forEach((id,row)=>{box(22,26+row*46,72,33,palette[row%4]);text('#'+id,58,48+row*46);arrow(100,42+row*46,143,42+row*46);for(let col=0;col<7;col++){ctx.fillStyle=palette[(id+col)%4];ctx.fillRect(155+col*25,26+row*46,18,33)}});text('Aynı ID → aynı özellik vektörü',190,231);
 }else if(branch==='norm'){
 // @stage norm
for(let i=0;i<6;i++){ctx.fillStyle=palette[i%4];const values=features[selected],out=normalized(values),h=25+Math.abs(values[i])*50,oh=25+Math.abs(out[i])*35;ctx.fillRect(24+i*22,166-h,15,h);ctx.fillRect(220+i*22,166-oh,15,oh)}arrow(161,110,209,110);text('Özellikler',88,200);text('Normalize',284,200);
 }else if(branch==='attention'){
 // @stage attention

  const causal=step.visual==='causal',raw=step.name.includes('skor')||step.name==='Q × Kᵀ skorları',mask=step.name==='Geleceği maskele';
  if(!causal){['Q','K','V'].forEach((name,i)=>{box(12,53+i*48,40,30,palette[i]);text(name,32,74+i*48);arrow(58,68+i*48,98,106)});text(raw?'Benzerlik skorları':'Dikkat ağırlıkları',204,28)}else text(mask?'Gelecek gizlenir':'Her satır bir token',190,28);
  const start=causal?100:110,cell=39;for(let row=0;row<4;row++){const scores=Array.from({length:4},(_,col)=>normalized(features[row]).reduce((sum,v,d)=>sum+v*normalized(features[col])[d],0)/Math.sqrt(6));const weights=scores.map((v,col)=>causal&&col>row?0:Math.exp(v));const sum=weights.reduce((a,b)=>a+b,0);if(row===Math.min(3,Math.floor(progress*4))){ctx.fillStyle=palette[2]+'22';ctx.fillRect(start-5,39+row*cell,160,39)}text(`T${row+1}`,start-23,67+row*cell);for(let col=0;col<4;col++){const hidden=causal&&col>row,value=weights[col]/sum;ctx.globalAlpha=progress===0?.4:1;box(start+col*cell,42+row*cell,34,33,hidden?'#80758e':palette[row%4]);ctx.globalAlpha=1;ctx.font='11px monospace';text(hidden?(mask?'−∞':'0'):raw?scores[col].toFixed(1):mask?'✓':value.toFixed(2),start+17+col*cell,63+row*cell);ctx.font='13px sans-serif'}text(`T${row+1}`,start+17+row*cell,219)}if(!causal){arrow(273,119,315,119);vector(334,60,2)}
 }else if(branch==='network'){
 // @stage network

  const xs=[45,140,238,335],counts=[4,6,6,4];for(let layer=0;layer<3;layer++)for(let a=0;a<counts[layer];a++)for(let b=0;b<counts[layer+1];b++){ctx.globalAlpha=layer/3<=progress?.48:.12;line(xs[layer],48+a*142/(counts[layer]-1),xs[layer+1],48+b*142/(counts[layer+1]-1),palette[layer])}ctx.globalAlpha=1;xs.forEach((x,layer)=>{for(let i=0;i<counts[layer];i++){ctx.fillStyle=palette[layer];ctx.beginPath();ctx.arc(x,48+i*142/(counts[layer]-1),7,0,Math.PI*2);ctx.fill()}});text('D',45,224);text('Doğrusal → GELU → Doğrusal',238,224);
 }else if(branch==='scores'){
 // @stage scores
softmax(Array.from({length:3},(_,c)=>features.reduce((sum,v)=>sum+v.reduce((a,n,d)=>a+n*Math.sin((c+1)*(d+1)),0),0)/16)).forEach((v,i)=>{text(String.fromCharCode(65+i),24,67+i*54);ctx.fillStyle=palette[i];ctx.fillRect(46,48+i*54,v*progress*235,28);text(`${Math.round(v*100)}%`,330,67+i*54)});text('Sabit ağırlıklar · toplam %100',190,228);
 }else if(branch==='tokens'){
 // @stage tokens

  const count=Math.floor(progress*16);for(let i=0;i<16;i++){ctx.globalAlpha=i<=count?1:.15;box(26+i%4*84,22+Math.floor(i/4)*49,72,37,palette[i%4]);text('#'+[412,809,153,992][i%4],62+i%4*84,46+Math.floor(i/4)*49)}ctx.globalAlpha=1;arrow(63,221,318,221);
 }else if(branch==='vector'){
 // @stage vector

  for(let i=0;i<4;i++){vector(60+i*75,65,i);text(`Token ${i+1}`,70+i*75,215)}
 }else if(branch==='decode'){
 // @stage decode

  for(let layer=0;layer<3;layer++){const size=55+layer*25,x=10+layer*116;photo(x,100-size/2,size,4*2**layer);ctx.strokeStyle=palette[layer];ctx.strokeRect(x,100-size/2,size,size);text(`${4*2**layer} × ${4*2**layer}`,x+size/2,185);if(layer<2)arrow(x+size+7,100,x+106,100)}text('Upsampling + convolution → RGB',190,225);
 }else if(branch==='noise'){
 // @stage noise

  const amount=step.visual==='noise'?.2+progress*.65:.85*(1-progress);photo(104,22,170);for(let i=0;i<1024;i++){ctx.fillStyle=`rgba(${(i*73)%256},${(i*137)%256},${(i*37)%256},${amount})`;ctx.fillRect(104+i%32*170/32,22+Math.floor(i/32)*170/32,6,6)}text(step.visual==='noise'?'Gürültü eklenir':'Gürültü adım adım azalır',190,222);ctx.fillStyle=palette[2];ctx.fillRect(104,202,170*(step.visual==='noise'?progress:1-progress),4);
 }else if(branch==='patch'){
 // @stage patch

  const latent=step.name.includes('latent')||step.name==='2B ızgara';if(latent){for(let i=0;i<64;i++){ctx.fillStyle=palette[(i*7+Math.floor(i/8))%4];ctx.globalAlpha=.3+(i%7)/10;ctx.fillRect(104+i%8*21,22+Math.floor(i/8)*21,19,19)}ctx.globalAlpha=1;text('Uzamsal özellik ızgarası',190,224)}else{const gap=3+progress*4,size=38,origin=190-(4*size+3*gap)/2;for(let i=0;i<16;i++){if(image){const side=Math.min(image.naturalWidth,image.naturalHeight),sx=(image.naturalWidth-side)/2+i%4*side/4,sy=(image.naturalHeight-side)/2+Math.floor(i/4)*side/4;ctx.drawImage(image,sx,sy,side/4,side/4,origin+i%4*(size+gap),18+Math.floor(i/4)*(size+gap),size,size)}ctx.strokeStyle=palette[2];ctx.strokeRect(origin+i%4*(size+gap),18+Math.floor(i/4)*(size+gap),size,size)}text('16 yama · uzamsal sıra korunur',190,226)}
 }else{
 // @stage image
 photo(98,16,184,64);text('Örnek kaynak görüntü',190,227)
 }
 // @stage end
 ctx.globalAlpha=1;ctx.textAlign='start';
}
const calculationSource=implementationSource.slice(implementationSource.indexOf('// Small, deterministic demonstration:'),implementationSource.indexOf('const palette='));
const drawingSource=implementationSource.slice(implementationSource.indexOf('function drawVisual('),implementationSource.indexOf('const calculationSource='));
function activeStageSource(step:Step){
 const marker=`// @stage ${visualBranch(step)}\n`;
 const start=drawingSource.indexOf(marker);
 if(start<0)return drawingSource;
 const bodyStart=start+marker.length,next=drawingSource.indexOf('// @stage ',bodyStart);
 return drawingSource.slice(bodyStart,next<0?undefined:next).replace(/\s*}else if\(branch===[^\n]+\{\s*$/, '').replace(/\s*}else\{\s*$/, '').trim();
}
function StageVisual({step,progress,image}:{step:Step;progress:number;image:HTMLImageElement|null}){
 const canvas=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{const repaint=()=>{const ctx=canvas.current?.getContext('2d');if(ctx&&canvas.current)drawVisual(ctx,step,progress,image,getComputedStyle(canvas.current).color)};repaint();const observer=new MutationObserver(repaint);observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','data-interface']});return()=>observer.disconnect()},[step,progress,image]);
 return <canvas width="380" height="240" ref={canvas} role="img" aria-label={step.name}/>;
}
export default function ArchitectureDemo({kind,showMatrix}:{kind:string;showMatrix:boolean}){
 useLanguage();const spec=architectures[kind],section=useRef<HTMLElement>(null),image=useRef<HTMLImageElement|null>(null);const[loaded,setLoaded]=useState(false),[imageError,setImageError]=useState(false),[frame,setFrame]=useState(0),[playing,setPlaying]=useState(false),[visible,setVisible]=useState(false);const stage=Math.min(spec.steps.length-1,Math.floor(frame/20)),step=spec.steps[stage],last=spec.steps.length*20-1;
 useEffect(()=>{let alive=true;const img=new Image();img.onload=()=>{if(alive){image.current=img;setLoaded(true)}};img.onerror=()=>{if(alive)setImageError(true)};img.src='/images/cnn/zebra.webp';return()=>{alive=false}},[]);
 useEffect(()=>{const observer=new IntersectionObserver(([e])=>setVisible(e.isIntersecting));if(section.current)observer.observe(section.current);return()=>observer.disconnect()},[]);
 useEffect(()=>{if(!playing||!visible)return;const timer=setInterval(()=>{if(document.visibilityState==='visible')setFrame(f=>{if(f>=last){setPlaying(false);return last}return f+1})},100);return()=>clearInterval(timer)},[playing,visible,last]);
 async function frames(){
  const canvas=document.createElement('canvas');canvas.width=380;canvas.height=300;const ctx=canvas.getContext('2d');if(!ctx)throw Error('canvas');const tile=document.createElement('canvas');tile.width=380;tile.height=240;const painter=tile.getContext('2d');if(!painter)throw Error('canvas');const result:Uint8ClampedArray[]=[];ctx.font='13px sans-serif';const height=330+Math.max(...spec.steps.map(item=>captionLines(ctx,item.description,352).length))*18;canvas.height=height;
  const samples=Math.min(6,Math.floor(40/spec.steps.length));
  for(let active=0;active<spec.steps.length;active++)for(let p=0;p<samples;p++){
   ctx.fillStyle='#0e1a22';ctx.fillRect(0,0,380,height);ctx.fillStyle='#e3eee9';ctx.font='bold 15px sans-serif';ctx.fillText(`${active+1}/${spec.steps.length} ${spec.steps[active].name}`,14,24,352);
   drawVisual(painter,spec.steps[active],p/Math.max(1,samples-1),image.current);ctx.drawImage(tile,0,30);ctx.fillStyle='#e3eee9';ctx.font='11px sans-serif';ctx.fillText(dimensions[kind]?.[active]||'',14,278,352);ctx.fillText('Eğitici gösterim · sabit / temsili işlemler · eğitilmiş model yok',14,294,352);
   ctx.fillStyle='#e3eee9';ctx.font='13px sans-serif';drawCaption(ctx,spec.steps[active].description,14,323,352);
   result.push(ctx.getImageData(0,0,380,height).data);await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
  }return{frames:result,width:380,height}
 }
 return <section className="architecture-demo" ref={section}><h2>{spec.title}</h2><p>Eğitici gösterim: ViT yama izdüşümü ve dikkat örnekleri görüntüden, sabit ve eğitilmemiş ağırlıklarla hesaplanır. Üretim, gürültü giderme ve decoder görselleri temsildir.</p><div className="architecture-actions"><button onClick={()=>{if(frame===last)setFrame(0);setPlaying(!playing)}}>{t(playing?'Duraklat':'Başlat')}</button><button onClick={()=>{setPlaying(false);setFrame(0)}}>{t('Başa dön')}</button><button disabled={stage===0} onClick={()=>{setPlaying(false);setFrame((stage-1)*20)}}>Önceki aşama</button><button disabled={stage===spec.steps.length-1} onClick={()=>{setPlaying(false);setFrame((stage+1)*20)}}>{t('Sonraki aşama')}</button><ReadingGif name={kind} draw={frames} disabled={!loaded}/></div>{imageError&&<p role="alert">{t('Örnek fotoğraf yüklenemedi.')}</p>}<ol className="architecture-pipeline">{spec.steps.map((item,i)=><li key={i} className={stage===i?'active':stage>i?'complete':''}><button aria-current={stage===i?'step':undefined} onClick={()=>{setPlaying(false);setFrame(i*20)}}>{i+1} · {item.name}</button><StageVisual step={item} progress={i<stage?1:i===stage?(frame%20)/19:0} image={loaded?image.current:null}/><small dir="ltr">{dimensions[kind]?.[i]}</small></li>)}</ol><div className="cnn-explanation architecture-explanation" role="status" aria-live="polite" aria-atomic="true"><strong>{stage+1} / {spec.steps.length} · {step.name}</strong><p>{step.description}</p></div><div className="architecture-inspector"><div><h3>{step.name}</h3><StageVisual step={step} progress={(frame%20)/19} image={loaded?image.current:null}/></div><div><h3>Aşamanın girdisi → çıktısı</h3><p className="architecture-dimension" dir="ltr">{dimensions[kind]?.[stage]}</p><p>{step.description}</p><span className="architecture-key"><i/> Token / özellik <i/> Dönüşüm <i/> Konum / artık bağlantı</span></div></div>{showMatrix&&<div className="machine-matrix"><h3>{t('Kod / matris')}</h3><p>Bu bölümde gösterimin kullandığı gerçek TypeScript kaynağı yer alır. Hesaplama kodu sabit ağırlıklı küçük örnektir; çizim kodu eğitilmiş modelin kodu değildir.</p><h4>{stage+1} · {step.name} — çalışan kod</h4><pre key={`${kind}-${stage}`} dir="ltr"><code>{activeStageSource(step)}</code></pre><details><summary>Ortak hesaplama fonksiyonları</summary><pre dir="ltr"><code>{calculationSource}</code></pre></details><details><summary>Animasyonda çalışan çizim ve dikkat hesaplama kodu</summary><pre dir="ltr"><code>{drawingSource}</code></pre></details></div>}<a href={spec.source} target="_blank" rel="noreferrer">Mimari kaynağı ↗</a></section>
}
