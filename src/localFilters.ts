/** Full-size tools run inside the existing image worker; alpha is preserved. */
export function claheLuminance(data:Uint8ClampedArray,width:number,height:number,clipFactor=2){
 const nx=Math.min(8,width),ny=Math.min(8,height),bins=256;
 const xEdges=Array.from({length:nx+1},(_,i)=>Math.floor(i*width/nx)),yEdges=Array.from({length:ny+1},(_,i)=>Math.floor(i*height/ny));
 const centersX=xEdges.slice(0,-1).map((v,i)=>(v+xEdges[i+1]-1)/2),centersY=yEdges.slice(0,-1).map((v,i)=>(v+yEdges[i+1]-1)/2);
 const gray=(i:number)=>Math.round(.299*data[i]+.587*data[i+1]+.114*data[i+2]);
 const maps:Array<Float32Array>=[];
 for(let ty=0;ty<ny;ty++)for(let tx=0;tx<nx;tx++){
  const hist=new Float64Array(bins),count=(xEdges[tx+1]-xEdges[tx])*(yEdges[ty+1]-yEdges[ty]);
  for(let y=yEdges[ty];y<yEdges[ty+1];y++)for(let x=xEdges[tx];x<xEdges[tx+1];x++)hist[gray((y*width+x)*4)]++;
  // Constant tiles remain unchanged instead of artificially lifting flat regions.
  const map=new Float32Array(bins);if(hist.some(n=>n===count)){for(let b=0;b<bins;b++)map[b]=b;maps.push(map);continue}
  const cap=Math.max(1,Math.floor(Math.max(1,Math.min(8,clipFactor))*count/bins));let excess=0;
  for(let b=0;b<bins;b++){excess+=Math.max(0,hist[b]-cap);hist[b]=Math.min(hist[b],cap)}
  let cumulative=0;for(let b=0;b<bins;b++){cumulative+=hist[b]+excess/bins;map[b]=255*cumulative/count}maps.push(map);
 }
 function interpolation(centers:number[],length:number){return Array.from({length},(_,x)=>{if(x<=centers[0])return{a:0,b:0,w:0};const end=centers.length-1;if(x>=centers[end])return{a:end,b:end,w:0};let a=0;while(centers[a+1]<x)a++;return{a,b:a+1,w:(x-centers[a])/(centers[a+1]-centers[a])}})}
 const xs=interpolation(centersX,width),ys=interpolation(centersY,height);
 for(let y=0;y<height;y++){const v=ys[y];for(let x=0;x<width;x++){const u=xs[x],i=(y*width+x)*4,g=gray(i),top=(1-u.w)*maps[v.a*nx+u.a][g]+u.w*maps[v.a*nx+u.b][g],bottom=(1-u.w)*maps[v.b*nx+u.a][g]+u.w*maps[v.b*nx+u.b][g],shift=(1-v.w)*top+v.w*bottom-g;for(let c=0;c<3;c++)data[i+c]+=shift}}
}
export function sobelEdges(data:Uint8ClampedArray,width:number,height:number){
 const src=new Uint8Array(width*height);for(let i=0;i<src.length;i++)src[i]=Math.round(.299*data[i*4]+.587*data[i*4+1]+.114*data[i*4+2]);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const left=Math.max(0,x-1),right=Math.min(width-1,x+1),above=Math.max(0,y-1)*width,below=Math.min(height-1,y+1)*width,row=y*width;
  const gx=-src[above+left]+src[above+right]-2*src[row+left]+2*src[row+right]-src[below+left]+src[below+right];
  const gy=-src[above+left]-2*src[above+x]-src[above+right]+src[below+left]+2*src[below+x]+src[below+right];
  const value=Math.min(255,Math.hypot(gx,gy)/4),i=(row+x)*4;data[i]=data[i+1]=data[i+2]=value;
 }
}
