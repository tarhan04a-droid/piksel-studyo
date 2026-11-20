import {isMobileCutoutDevice} from './cutoutRuntime';
/// <reference lib="webworker" />
import {SamModel,AutoProcessor,RawImage,Tensor,env,type SamProcessor} from '@huggingface/transformers';
env.allowLocalModels=false;env.backends.onnx.wasm!.numThreads=1;
let model:SamModel,processor:SamProcessor,embeddings:{image_embeddings:Tensor;image_positional_embeddings:Tensor};
let originalSizes:[number,number][],reshapedSizes:[number,number][];let running=false;
self.onmessage=async(event:MessageEvent<{type:'init'|'select';image?:ImageData;points?:{x:number;y:number;positive:boolean}[]}>)=>{
 if(running)return;running=true;const transient:Tensor[]=[];
 try{
  if(event.data.type==='init'){
   if(isMobileCutoutDevice())throw new Error('mobile-memory-limit');
   const image=event.data.image;if(!image)throw new Error('image');self.postMessage({type:'status',value:'Model indiriliyor ve hazırlanıyor…'});
   const loadedModel=await SamModel.from_pretrained('Xenova/slimsam-77-uniform',{device:'wasm',dtype:'q8',revision:'5850ab45f587c112167512ffef949107115e26a0',session_options:{executionMode:'sequential',enableMemPattern:false,enableCpuMemArena:false,graphOptimizationLevel:'basic'}});
   if(!(loadedModel instanceof SamModel))throw new Error('model-type');model=loadedModel;
   processor=await AutoProcessor.from_pretrained('Xenova/slimsam-77-uniform',{revision:'5850ab45f587c112167512ffef949107115e26a0'}) as SamProcessor;
   self.postMessage({type:'status',value:'Fotoğraf modele hazırlanıyor…'});
   // The transferred pixels are reused; only embeddings and sizes survive init.
   const raw=new RawImage(image.data,image.width,image.height,4),inputs=await processor(raw);transient.push(inputs.pixel_values);
   originalSizes=inputs.original_sizes;reshapedSizes=inputs.reshaped_input_sizes;
   embeddings=await model.get_image_embeddings(inputs);
   // Future selections only need the prompt/mask decoder, not the image encoder.
   await model.sessions.model.release();delete model.sessions.model;
   self.postMessage({type:'ready'});
  }else{
   if(!model||!embeddings)throw new Error('not-ready');const points=event.data.points||[];if(!points.length||points.length>32||!points.some(point=>point.positive))throw new Error('points');
   // Reuse the image embedding rather than preprocessing 1024² pixels per click.
   const inputPoints=processor.reshape_input_points([[points.map(point=>[point.x,point.y])]],originalSizes,reshapedSizes) as Tensor;
   const inputLabels=new Tensor('int64',BigInt64Array.from(points.map(point=>point.positive?1n:0n)),[1,1,points.length]);transient.push(inputPoints,inputLabels);
   const outputs=await model({input_points:inputPoints,input_labels:inputLabels,...embeddings});transient.push(outputs.pred_masks,outputs.iou_scores);
   const scores=outputs.iou_scores.data;let best=0;for(let i=1;i<scores.length;i++)if(Number(scores[i])>Number(scores[best]))best=i;
   // Resize just the best candidate, avoiding three full-resolution masks.
   const chosen=outputs.pred_masks.slice(null,null,[best,best+1],null,null);transient.push(chosen);
   const masks=await processor.post_process_masks(chosen,originalSizes,reshapedSizes);transient.push(...masks);
   const mask=new Uint8Array(masks[0].data.length);for(let i=0;i<mask.length;i++)mask[i]=masks[0].data[i]?1:0;
   self.postMessage({type:'mask',mask},[mask.buffer]);
  }
 }catch(error){self.postMessage({type:'error',detail:error instanceof Error?error.message:String(error)})}
 finally{for(const tensor of new Set(transient))tensor.dispose();running=false}
};
