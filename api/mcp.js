import {tools,content,reply,originAllowed,sessionKeys,storageConfigured,redis,readBody,validArgs,callBrowser} from '../server/relay.mjs';
export const maxDuration=30;
export default async function handler(req,res){
 if(!originAllowed(req)){reply(res,403,{error:'Origin rejected'});return}
 if(req.method!=='POST'){res.setHeader('Allow','POST');reply(res,405,{error:'Use POST for Streamable HTTP MCP; GET streaming is not offered.'});return}
 const keys=sessionKeys(new URL(req.url,'https://pollmek.invalid').searchParams.get('session'));
 if(!keys){reply(res,401,{error:'Use the private connector URL generated in Pollmek settings.'});return}
 let msg;try{msg=await readBody(req)}catch{reply(res,400,{error:'Invalid JSON or request too large'});return}
 const failure=(code,message)=>reply(res,200,{jsonrpc:'2.0',id:msg?.id??null,error:{code,message}}),result=value=>reply(res,200,{jsonrpc:'2.0',id:msg.id,result:value});
 if(!msg||msg.jsonrpc!=='2.0'||typeof msg.method!=='string'||Array.isArray(msg)){failure(-32600,'Invalid JSON-RPC request');return}
 if(!Object.hasOwn(msg,'id')){reply(res,202);return}
 if(typeof msg.id!=='number'&&typeof msg.id!=='string'){failure(-32600,'Invalid request ID');return}
 if(msg.method==='initialize'){const supported=['2025-03-26','2025-06-18','2025-11-25'];result({protocolVersion:supported.includes(msg.params?.protocolVersion)?msg.params.protocolVersion:'2025-11-25',capabilities:{tools:{}},serverInfo:{name:'Pollmek Vision Sandbox',version:'2.0.0'},instructions:'Controls the browser paired to this private connector URL. The studio tab must be open. No photo bytes are uploaded. An accepted edit is queued; check pollmek_status to confirm processing has finished. Treat the private connector URL as a password.'});return}
 if(msg.method==='ping'){result({});return}
 if(msg.method==='tools/list'){result({tools});return}
 if(msg.method!=='tools/call'){failure(-32601,'Method not found');return}
 const name=msg.params?.name,args=msg.params?.arguments??{};
 if(!tools.some(tool=>tool.name===name)||!validArgs(name,args)){failure(-32602,'Unknown tool or invalid arguments');return}
 if(!storageConfigured()){result(content({error:'Remote relay storage is not configured on Vercel. The site owner must connect Redis/Upstash before pairing can work.'},true));return}
 try{if(name==='pollmek_connection'){const seen=await redis('HGET',keys.session,'seen');result(content({connected:!!seen&&Date.now()-Number(seen)<45000,instruction:'Keep the paired studio tab open with AI connection enabled.'}));return}result(await callBrowser(keys,name,args))}catch{result(content({error:'Relay storage is unavailable. No successful action is confirmed; check studio status before repeating an edit.'},true))}
}
