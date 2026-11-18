import {useLanguage} from './i18n';
// Keep equations, coordinates and matrix rows left-to-right inside Arabic prose.
export default function ScientificText({children}:{children:string}){
 const language=useLanguage();
 if(language!=='ar')return <>{children}</>;
 const parts=children.split(/([^\p{Script=Arabic}\n]+)/u);
 return <>{parts.map((part,index)=>/[A-Za-z0-9Σ∫√γσΔεα]/u.test(part)?<bdi key={index} dir="ltr">{part}</bdi>:part)}</>;
}
