import {defaults,type Settings} from './engine';
const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));
const luminance=(data:Uint8ClampedArray,p:number)=>.299*data[p]+.587*data[p+1]+.114*data[p+2];
export type AutoAnalysis={settings:Settings;reasons:string[];mean:number;low:number;high:number;noise:number};
export function analyzeAutomatic(image:ImageData):AutoAnalysis{
 const {data,width,height}=image,hist=new Uint32Array(256),step=Math.max(1,Math.ceil(Math.sqrt(width*height/60000)));
 let count=0,sum=0,saturation=0,neutral=0,red=0,green=0,blue=0,shadows=0,lights=0;
 for(let y=0;y<height;y+=step)for(let x=0;x<width;x+=step){const p=(y*width+x)*4;if(data[p+3]<128)continue;const r=data[p],g=data[p+1],b=data[p+2],value=Math.round(luminance(data,p)),max=Math.max(r,g,b),min=Math.min(r,g,b),sat=max?(max-min)/max:0;hist[value]++;sum+=value;saturation+=sat;count++;if(value<25)shadows++;if(value>230)lights++;if(sat<.16&&value>45&&value<210){red+=r;green+=g;blue+=b;neutral++}}
 const settings={...defaults},reasons:string[]=[];
 if(!count)return{settings,reasons:['Görünür piksel bulunamadı; ayarlar korundu.'],mean:0,low:0,high:255,noise:0};
 function percentile(fraction:number){const target=Math.max(1,Math.ceil(count*fraction));let n=0;for(let i=0;i<256;i++){n+=hist[i];if(n>=target)return i}return 255}
 const low=percentile(.01),high=percentile(.99),median=percentile(.5),range=high-low;
 // Conservative gray-world balance: only near-neutral midtones vote.
 if(neutral>=Math.max(16,count*.025)&&red>0&&green>0&&blue>0){const average=(red+green+blue)/3;const gains=[red,green,blue].map(value=>clamp(1+(average/value-1)*.45,.94,1.06));if(Math.max(...gains)-Math.min(...gains)>.025){[settings.r,settings.g,settings.b]=gains.map(value=>Math.round(value*100));reasons.push('Nötr bölgelerden hafif renk dengesi uygulandı.')}}
 if(range>10&&median>4&&median<250){const target=clamp(median,105,155);let gamma=clamp(1+(Math.log(target/255)/Math.log(median/255)-1)*.65,.78,1.22);if(lights/count>.12&&gamma<1)gamma=1;if(shadows/count>.12&&gamma>1)gamma=1;settings.gamma=Math.round(gamma*100)/100;if(settings.gamma<.98)reasons.push('Koyu orta tonlar kontrollü biçimde açıldı.');else if(settings.gamma>1.02)reasons.push('Aydınlık orta tonlar kontrollü biçimde dengelendi.')}
 const adjustedLow=Math.round(255*Math.pow(low/255,settings.gamma)),adjustedHigh=Math.round(255*Math.pow(high/255,settings.gamma));
 if(range>32&&range<195&&adjustedHigh-adjustedLow>32){settings.low=clamp(adjustedLow,0,100);settings.high=clamp(adjustedHigh,160,255);settings.contrast=range<110?35:20;reasons.push('Yüzdelik ton sınırlarıyla hafif kontrast germe uygulandı.')}
 const averageSaturation=saturation/count;if(averageSaturation>.04&&averageSaturation<.2){settings.s=108;reasons.push('Düşük renk doygunluğu hafifçe artırıldı.')}else if(averageSaturation>.65){settings.s=94;reasons.push('Aşırı renk doygunluğu hafifçe azaltıldı.')}
 // Detect isolated near-black/white impulses in otherwise smooth neighbourhoods.
 const stride=Math.max(1,Math.ceil(Math.sqrt(width*height/12000))),neighbours=new Float32Array(8);let checked=0,impulses=0;
 for(let y=1;y<height-1;y+=stride)for(let x=1;x<width-1;x+=stride){const p=(y*width+x)*4;if(data[p+3]<128)continue;checked++;const center=luminance(data,p);if(center>12&&center<243)continue;let n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(dx||dy)neighbours[n++]=luminance(data,((y+dy)*width+x+dx)*4);neighbours.sort();const middle=(neighbours[3]+neighbours[4])/2;if(Math.abs(center-middle)>75&&neighbours[6]-neighbours[1]<55)impulses++}
 const noise=checked?impulses/checked:0;if(noise>.007&&impulses>=8){settings.filter='median';reasons.push('Belirgin noktasal gürültü için medyan temizleme seçildi.')}
 if(shadows/count>.15||lights/count>.15)reasons.push('Uç tonlarda kayıp olabilir; otomatik ayar kaybolmuş ayrıntıyı geri getirmez.');
 if(!reasons.length)reasons.push('Belirgin düzeltme gerektirmeyen görüntüde doğal ayarlar korundu.');
 return{settings,reasons,mean:sum/count,low,high,noise};
}
export const automaticSettings=(image:ImageData)=>analyzeAutomatic(image).settings;
