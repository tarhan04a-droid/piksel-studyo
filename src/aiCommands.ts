import type {Settings} from './engine';
import schema from './aiSettingsSchema.json';
export type AiCommand={id:string;name:string;arguments:Record<string,unknown>;expires:number};
export type AiHandler=(command:AiCommand)=>unknown|Promise<unknown>;
export function aiSettingsPatch(input:unknown,current:Settings):Settings{
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('settings must be an object');
 const patch=input as Record<string,unknown>;
 if(!Object.keys(patch).length)throw new Error('settings must not be empty');
 for(const [key,value] of Object.entries(patch)){
  const rule=(schema as Record<string,{type:string;enum?:unknown[];minimum?:number;maximum?:number}>)[key];
  if(!Object.hasOwn(schema,key)||!rule)throw new Error(`Unknown setting: ${key}`);
  if(rule.enum?!rule.enum.includes(value):rule.type==='boolean'?typeof value!=='boolean':typeof value!=='number'||!Number.isFinite(value)||(rule.type==='integer'&&!Number.isInteger(value))||value<(rule.minimum??-Infinity)||value>(rule.maximum??Infinity))throw new Error(`Invalid setting: ${key}`);
 }
 const next={...current,...patch} as Settings;
 if(next.low>=next.high)throw new Error('low must be smaller than high');
 return next;
}
