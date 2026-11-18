import {useEffect,useState} from 'react';
import {useQuizCompleted} from './quizProgress';
export function useModernUnlock(){
 const math=useQuizCompleted('math'),analysis=useQuizCompleted('analysis');
 const read=()=>{try{const data=JSON.parse(localStorage.getItem('pollmek-territory-collection-v1')||'[]');return Array.isArray(data)?new Set(data.filter((n:unknown)=>typeof n==='number'&&n>=3&&n<=255&&n%2===1)).size:0}catch{return 0}};
 const[count,setCount]=useState(read);
 useEffect(()=>{const update=()=>setCount(read());window.addEventListener('storage',update);window.addEventListener('pollmek-collection-progress',update);return()=>{window.removeEventListener('storage',update);window.removeEventListener('pollmek-collection-progress',update)}},[]);
 return {unlocked:math&&analysis&&count===127,count,math,analysis};
}
