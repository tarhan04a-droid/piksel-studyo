import {useEffect,useState} from 'react';
export type QuizKind='math'|'analysis';
export const quizKey=(kind:QuizKind)=>kind==='math'?'pollmek-math-quiz-pure-v2':'pollmek-analysis-quiz-v1';
const event='pollmek-quiz-progress';
export function announceQuizProgress(){window.dispatchEvent(new Event(event))}
export function readQuizIds(kind:QuizKind):string[]{try{const data=JSON.parse(localStorage.getItem(quizKey(kind))||'[]'),prefix=kind==='math'?'pure-math-':'analysis-',valid=new Set(Array.from({length:10},(_,i)=>prefix+String(i+1).padStart(2,'0')));return Array.isArray(data)?[...new Set(data.filter((id:unknown):id is string=>typeof id==='string'&&valid.has(id)))]:[]}catch{return[]}}
export function useQuizCompleted(kind:QuizKind){const[state,setState]=useState(()=>readQuizIds(kind).length===10);useEffect(()=>{const update=()=>setState(readQuizIds(kind).length===10);update();window.addEventListener(event,update);window.addEventListener('storage',update);return()=>{window.removeEventListener(event,update);window.removeEventListener('storage',update)}},[kind]);return state}
