import {hsv,type Settings} from './engine';
export function operationCode(o:Settings){const blocks:{name:string;code:string}[]=[];
 if(o.r!==100||o.g!==100||o.b!==100)blocks.push({name:'RGB',code:`const gains = [${o.r}, ${o.g}, ${o.b}];\nchannels = channels.map((value, i) => value * gains[i] / 100);`});
 if(o.h||o.s!==100||o.v!==100)blocks.push({name:'HSV',code:`// hsv() and rgb() are the helpers in engine.ts\nlet [h, s, v] = hsv(...channels);\nh = (h + ${o.h} + 360) % 360;\ns = Math.min(1, s * ${o.s} / 100);\nv = Math.min(1, v * ${o.v} / 100);\nchannels = rgb(h, s, v);`});
 if(o.log)blocks.push({name:'Logaritma',code:`const a = ${o.log};\n// This stage receives normalized channel x (0–1).\nx = Math.log1p(a * x) / Math.log1p(a);`});
 if(o.gamma!==1)blocks.push({name:'Gama',code:`const gamma = ${o.gamma};\nx = Math.pow(x, gamma); // normalized channel`});
 if(o.contrast)blocks.push({name:'Kontrast',code:`const low = ${o.low}, high = ${o.high};\nconst amount = ${o.contrast} / 100;\nx = (x - low / 255) / (Math.max(1, high - low) / 255) * amount\n  + x * (1 - amount);`});
 if(o.negative)blocks.push({name:'Negatif · renkleri ters çevir',code:`// After normalization, gamma/log/contrast stages:\nconst channel255 = x * 255;\nconst inverted = 255 - channel255;\n\n// Isolated negative operation on an RGBA array:\nfor (let i = 0; i < pixels.length; i += 4) {\n  pixels[i]     = 255 - pixels[i];     // R\n  pixels[i + 1] = 255 - pixels[i + 1]; // G\n  pixels[i + 2] = 255 - pixels[i + 2]; // B\n  // pixels[i + 3] is alpha; preserved.\n}`});
 if(o.mode==='gray')blocks.push({name:'Gri seviye',code:`const gray = 0.299 * channels[0] + 0.587 * channels[1] + 0.114 * channels[2];\nconst mix = ${o.grayMix??100} / 100;\nchannels = channels.map(value => value * (1 - mix) + gray * mix);`});
 if(o.mode==='binary')blocks.push({name:'Siyah beyaz',code:`const gray = 0.299 * channels[0] + 0.587 * channels[1] + 0.114 * channels[2];\nchannels = Array(3).fill(gray >= ${o.threshold} ? 255 : 0);`});
 if(o.band!=='off')blocks.push({name:'Işık bandı',code:`const inside = gray >= ${o.low} && gray <= ${o.high};\nchannels = inside ? [255, 255, 255]\n  : ${o.band==='mask'?'[0, 0, 0]':'channels'};`});
 if(o.segment){const target=o.segmentColor&&/^#[0-9a-f]{6}$/i.test(o.segmentColor)?hsv(parseInt(o.segmentColor.slice(1,3),16),parseInt(o.segmentColor.slice(3,5),16),parseInt(o.segmentColor.slice(5,7),16)):null;blocks.push({name:'Bölütleme',code:target?`const [h, s, v] = hsv(...sourcePixel);
const [h0, s0, v0] = ${JSON.stringify(target)};
const distance = Math.min(Math.abs(h-h0), 360-Math.abs(h-h0));
const selected = s0 < 0.15 ? s < 0.2 && Math.abs(v-v0) < 0.2
  : distance < ${o.segmentTolerance??25} && s > 0.2;
channels = ${o.segmentHighlight?'selected ? channels.map((c,i) => c*0.55+[90,230,160][i]*0.45) : channels.map(c => c*0.3)':'Array(3).fill(selected ? 255 : 0)'};`:`const distance = Math.min(Math.abs(h - ${o.hue}), 360 - Math.abs(h - ${o.hue}));
const selected = distance < ${o.segmentTolerance??25} && s > 0.2;
channels = Array(3).fill(selected ? 255 : 0);`})}
 if(o.solo)blocks.push({name:'Yalnız kanal',code:`channels = channels.map((value, i) => ['r','g','b'][i] === '${o.solo}' ? value : 0);`});
 if(o.filter==='median')blocks.push({name:'Medyan',code:`// 3×3 values from the preceding pipeline stage, per channel.\nconst sorted = [...neighbours].sort((a, b) => a - b);\nconst value = sorted[4];\n// engine.ts uses a reusable array and insertion sort.`});
 if(o.smoothing==='mean')blocks.push({name:'Ortalama',code:`const value = neighbours.reduce((sum, value) => sum + value, 0) / 9;`});
 if(o.smoothing==='gauss')blocks.push({name:'Gauss',code:`const weights = [1,2,1, 2,4,2, 1,2,1];\nconst value = neighbours.reduce((sum, value, i) => sum + value * weights[i], 0) / 16;`});
 if(o.morphology!=='off')blocks.push({name:o.morphology==='dilate'?'Kalınlaştırma':'İnceltme',code:`const value = Math.${o.morphology==='dilate'?'max':'min'}(...neighbours); // preceding-stage 3×3 values`});
 if(o.equalize)blocks.push({name:'Histogram eşitleme',code:`// histogram is computed from the preceding stage's luminance.\nconst first = histogram.findIndex(n => n > 0);\nconst minimum = histogram[first];\nif (count > minimum) {\n  let cumulative = 0;\n  for (let k = 0; k < 256; k++) {\n    cumulative += histogram[k];\n    map[k] = Math.max(0, (cumulative - minimum) * 255 / (count - minimum));\n  }\n  // Per pixel: apply the luminance shift to each RGB channel.\n  const shift = map[gray] - gray;\n  for (let c = 0; c < 3; c++) channels[c] += shift;\n}`});
 if(o.clahe)blocks.push({name:'CLAHE',code:`claheLuminance(data, width, height, ${o.claheClip??2}); // localFilters.ts`});
 if(o.sobel)blocks.push({name:'Sobel',code:'sobelEdges(data, width, height); // localFilters.ts'});
 if(!blocks.length)blocks.push({name:'Referans',code:'const output = new ImageData(\n  new Uint8ClampedArray(source.data), source.width, source.height\n);'});
 return blocks;
}
