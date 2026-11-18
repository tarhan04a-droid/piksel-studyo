import {reply,originAllowed,sessionKeys,storageConfigured,redis,readBody} from '../server/relay.mjs';
const poll=`local info=redis.call('HMGET',KEYS[1],'client','seen');local client=info[1];local seen=info[2];local now=tonumber(ARGV[2]);if client and client~=ARGV[1] and seen and now-tonumber(seen)<45000 then return 'occupied' end;if client and client~=ARGV[1] then redis.call('DEL',KEYS[2]) end;if not seen or client~=ARGV[1] or now-tonumber(seen)>=30000 then redis.call('HSET',KEYS[1],'client',ARGV[1],'seen',ARGV[2]);redis.call('EXPIRE',KEYS[1],180) end;return redis.call('GET',KEYS[2]) or ''`;
const ack=`if redis.call('HGET',KEYS[1],'client')~=ARGV[1] then return 0 end;local task=redis.call('GET',KEYS[2]);if not task or cjson.decode(task).id~=ARGV[2] then return 0 end;redis.call('SET',KEYS[3],ARGV[3],'EX',45);redis.call('DEL',KEYS[2]);return 1`;
export default async function handler(req,res){
 if(!originAllowed(req)||!req.headers.origin){reply(res,403,{error:'Origin rejected'});return}
 res.setHeader('Access-Control-Allow-Origin',req.headers.origin);res.setHeader('Vary','Origin');
 if(req.method==='OPTIONS'){res.setHeader('Access-Control-Allow-Methods','POST');res.setHeader('Access-Control-Allow-Headers','Authorization, Content-Type');reply(res,204);return}
 if(req.method!=='POST'){reply(res,405,{error:'Use POST'});return}
 const keys=sessionKeys(req.headers.authorization?.replace(/^Bearer /,''));if(!keys){reply(res,401,{error:'Invalid session'});return}
 if(!storageConfigured()){reply(res,503,{error:'storage_not_configured'});return}
 let data;try{data=await readBody(req)}catch{reply(res,400,{error:'Invalid request'});return}
 if(!data||typeof data.client!=='string'||!/^[a-f0-9-]{36}$/.test(data.client)){reply(res,400,{error:'Invalid client'});return}
 try{
  if(data.action==='poll'){const task=await redis('EVAL',poll,2,keys.session,keys.task,data.client,Date.now());if(task==='occupied'){reply(res,409,{error:'Another tab is connected'});return}reply(res,200,{serverTime:Date.now(),commands:task?[JSON.parse(task)]:[]});return}
  if(data.action==='result'&&typeof data.id==='string'&&/^[a-f0-9-]{36}$/.test(data.id)){await redis('EVAL',ack,3,keys.session,keys.task,keys.result(data.id),data.client,data.id,JSON.stringify({result:data.result,isError:data.isError===true}));reply(res,200,{});return}
  if(data.action==='disconnect'){await redis('EVAL',`if redis.call('HGET',KEYS[1],'client')==ARGV[1] then redis.call('DEL',KEYS[1],KEYS[2]) end;return 1`,2,keys.session,keys.task,data.client);reply(res,200,{});return}
  reply(res,400,{error:'Invalid action'});
 }catch{reply(res,503,{error:'storage_unavailable'})}
}
