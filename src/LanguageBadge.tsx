/** Small vector badges keep language buttons consistent across devices. */
export default function LanguageBadge({code}:{code:string}){
 return <svg viewBox="0 0 60 60" className="language-badge" aria-hidden="true" focusable="false">
 {code==='tr'?<><path fill="#e53243" d="M0 0h60v60H0z"/><circle fill="#fff" cx="24" cy="30" r="13"/><circle fill="#e53243" cx="28" cy="30" r="10.5"/><path fill="#fff" d="m39 23 1.6 4.8h5.1l-4.1 3 1.6 4.8-4.2-3-4.1 3 1.6-4.8-4.1-3h5.1Z"/></>:
 code==='en'?<><path fill="#294d80" d="M0 0h60v60H0z"/><path stroke="#fff" strokeWidth="13" d="m0 0 60 60M60 0 0 60"/><path stroke="#da4150" strokeWidth="5" d="m0 0 60 60M60 0 0 60"/><path stroke="#fff" strokeWidth="19" d="M30 0v60M0 30h60"/><path stroke="#da4150" strokeWidth="11" d="M30 0v60M0 30h60"/></>:
 code==='es'?<><path fill="#bd3040" d="M0 0h60v60H0z"/><path fill="#ffd15b" d="M0 15h60v30H0z"/><path fill="#bd3040" stroke="#e8b94b" strokeWidth="2" d="M17 25h10v11l-5 4-5-4Z"/><path stroke="#fff0c4" strokeWidth="2" d="M22 26v10M17 30h10"/></>:
 code==='pt'?<><path fill="#cf3946" d="M0 0h60v60H0z"/><path fill="#277958" d="M0 0h25v60H0z"/><circle cx="25" cy="30" r="12" fill="none" stroke="#f4d265" strokeWidth="3"/><path fill="#fff" stroke="#c43844" strokeWidth="3" d="M19 23h12v12l-6 5-6-5Z"/><path stroke="#3b719d" strokeWidth="3" d="M23 27h4m-4 5h4"/></>:
 <><path fill="#167343" d="M0 0h60v60H0z"/><text x="30" y="28" textAnchor="middle" fill="#fff" fontSize="6.3" fontFamily="Arial,sans-serif" direction="rtl">لا إله إلا الله محمد رسول الله</text><path d="M15 36h29c-2 3-6 3-10 3H16" fill="#fff"/><path d="M42 34v7m-2-5h6" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round"/></>}
 </svg>
}
