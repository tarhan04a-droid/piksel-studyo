export type SelectionPoint={x:number;y:number};
// Existing consumers keep this name; an editable boundary may have more than four points.
export type SelectionQuad=SelectionPoint[];
export type SelectionRect={x:number;y:number;width:number;height:number;corners?:SelectionQuad};
export function rectCorners(rect:SelectionRect):SelectionQuad{return rect.corners??[{x:rect.x,y:rect.y},{x:rect.x+rect.width,y:rect.y},{x:rect.x+rect.width,y:rect.y+rect.height},{x:rect.x,y:rect.y+rect.height}]}
export function quadBounds(corners:SelectionQuad):SelectionRect{const xs=corners.map(p=>p.x),ys=corners.map(p=>p.y),x=Math.min(...xs),y=Math.min(...ys);return{x,y,width:Math.max(...xs)-x,height:Math.max(...ys)-y,corners}}
const cross=(a:SelectionPoint,b:SelectionPoint,c:SelectionPoint)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
function onSegment(a:SelectionPoint,b:SelectionPoint,p:SelectionPoint){return Math.abs(cross(a,b,p))<1e-9&&p.x>=Math.min(a.x,b.x)-1e-9&&p.x<=Math.max(a.x,b.x)+1e-9&&p.y>=Math.min(a.y,b.y)-1e-9&&p.y<=Math.max(a.y,b.y)+1e-9}
function intersects(a:SelectionPoint,b:SelectionPoint,c:SelectionPoint,d:SelectionPoint){return cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0||onSegment(a,b,c)||onSegment(a,b,d)||onSegment(c,d,a)||onSegment(c,d,b)}
export function validQuad(points:SelectionQuad){
 if(points.length<3||points.length>64)return false;let area=0;
 for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];if(!Number.isFinite(a.x)||!Number.isFinite(a.y)||Math.hypot(a.x-b.x,a.y-b.y)<1e-6)return false;area+=a.x*b.y-b.x*a.y;for(let j=i+1;j<points.length;j++){if(j===i+1||i===0&&j===points.length-1)continue;if(intersects(a,b,points[j],points[(j+1)%points.length]))return false}}
 return Math.abs(area)>1e-8;
}
export function insideQuad(x:number,y:number,points:SelectionQuad){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[j],b=points[i];if(Math.abs((b.x-a.x)*(y-a.y)-(b.y-a.y)*(x-a.x))<1e-9&&x>=Math.min(a.x,b.x)-1e-9&&x<=Math.max(a.x,b.x)+1e-9&&y>=Math.min(a.y,b.y)-1e-9&&y<=Math.max(a.y,b.y)+1e-9)return true;if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)inside=!inside}return inside}
