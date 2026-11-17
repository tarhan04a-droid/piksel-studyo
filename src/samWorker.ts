/// <reference lib="webworker" />
import {SamModel,AutoProcessor,RawImage,env,type SamProcessor,type Tensor} from '@huggingface/transformers';
env.allowLocalModels=false;env.backends.onnx.wasm!.numThreads=1;
let model:SamModel,processor:SamProcessor,raw:RawImage,embeddings:{image_embeddings:Tensor;image_positional_embeddings:Tensor};let running=false;
self.onmessage=async(event:MessageEvent<{type:'init'|'select';image?:ImageData;points?:{x:number;y:number;positive:boolean}[]}>)=>{
 if(running)return;running=true;
 try{
  if(event.data.type==='init'){
   const image=event.data.image!;self.postMessage({type:'status',value:'Model indiriliyor ve hazırlanıyor…'});
   [model,processor]=await Promise.all([SamModel.from_pretrained('Xenova/slimsam-77-uniform',{device:'wasm',dtype:'q8',revision:'5850ab45f587c112167512ffef949107115e26a0'}),AutoProcessor.from_pretrained('Xenova/slimsam-77-uniform',{revision:'5850ab45f587c112167512ffef949107115e26a0'})]) as [SamModel,SamProcessor];
   self.postMessage({type:'status',value:'Fotoğraf modele hazırlanıyor…'});raw=new RawImage(new Uint8ClampedArray(image.data),image.width,image.height,4);const inputs=await processor(raw);embeddings=await model.get_image_embeddings(inputs);self.postMessage({type:'ready'});
  }else{
   if(!model||!embeddings)throw new Error('not-ready');const points=event.data.points||[];if(!points.length||points.length>32||!points.some(point=>point.positive))throw new Error('points');
   const inputs=await processor(raw,{input_points:[[points.map(point=>[point.x,point.y])]],input_labels:[[points.map(point=>point.positive?1:0)]]});
   const outputs=await model({...inputs,...embeddings}),masks=await processor.post_process_masks(outputs.pred_masks,inputs.original_sizes,inputs.reshaped_input_sizes),scores=outputs.iou_scores.data;
   let best=0;for(let i=1;i<scores.length;i++)if(Number(scores[i])>Number(scores[best]))best=i;
   const count=raw.width*raw.height,data=masks[0].data,mask=new Uint8Array(count);for(let i=0;i<count;i++)mask[i]=data[best*count+i]?1:0;
   self.postMessage({type:'mask',mask},[mask.buffer]);
  }
 }catch(error){self.postMessage({type:'error',detail:error instanceof Error?error.message:String(error)})}finally{running=false}
};
