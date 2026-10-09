#include "webgpu.h"
#include <fstream>
#include <iostream>
#include <vector>
#include <thread>
#include <chrono>
static WGPUInstance instance; static WGPUDevice device;static WGPUAdapter adapter;static bool done;static bool failed;
void wait() { for(int i=0;!done && i<100000;i++){wgpuInstanceProcessEvents(instance);std::this_thread::sleep_for(std::chrono::microseconds(20));}if(!done)exit(20); }
WGPUStringView str(const char* x){return {x,WGPU_STRLEN};}
WGPUBuffer buffer(uint64_t size,WGPUBufferUsage usage){auto d=WGPU_BUFFER_DESCRIPTOR_INIT;d.size=size;d.usage=usage;return wgpuDeviceCreateBuffer(device,&d);}
WGPUTexture texture(int w,int h,WGPUTextureFormat format,WGPUTextureUsage usage){auto d=WGPU_TEXTURE_DESCRIPTOR_INIT;d.size={(uint32_t)w,(uint32_t)h,1};d.format=format;d.usage=usage;return wgpuDeviceCreateTexture(device,&d);}
WGPURenderPipeline pipeline(WGPUShaderModule module,WGPUPipelineLayout layout,WGPUTextureFormat format,bool particle,bool over,const char* fragment){
 auto d=WGPU_RENDER_PIPELINE_DESCRIPTOR_INIT;d.layout=layout;d.vertex.module=module;d.vertex.entryPoint=str(particle?"particleVertex":"vertexMain");
 auto blend=WGPU_BLEND_STATE_INIT;blend.color.srcFactor=WGPUBlendFactor_One;blend.color.dstFactor=over?WGPUBlendFactor_OneMinusSrcAlpha:WGPUBlendFactor_One;blend.alpha.srcFactor=WGPUBlendFactor_One;blend.alpha.dstFactor=WGPUBlendFactor_OneMinusSrcAlpha;
 auto target=WGPU_COLOR_TARGET_STATE_INIT;target.format=format;target.blend=particle?&blend:nullptr;
 auto f=WGPU_FRAGMENT_STATE_INIT;f.module=module;f.entryPoint=str(fragment);f.targetCount=1;f.targets=&target;d.fragment=&f;return wgpuDeviceCreateRenderPipeline(device,&d);
}
int main(int argc,char** argv){
 if(argc!=10)return 2; int width=std::stoi(argv[2]),height=std::stoi(argv[3]),count=std::stoi(argv[5]),samples=std::stoi(argv[6]);bool composite=std::stoi(argv[7]),over=std::stoi(argv[8]);
 instance=wgpuCreateInstance(nullptr);auto a=WGPU_REQUEST_ADAPTER_OPTIONS_INIT;a.backendType=WGPUBackendType_Metal;
 auto ac=WGPU_REQUEST_ADAPTER_CALLBACK_INFO_INIT;ac.mode=WGPUCallbackMode_AllowProcessEvents;ac.callback=[](WGPURequestAdapterStatus,WGPUAdapter v,WGPUStringView,void*,void*){adapter=v;done=true;};wgpuInstanceRequestAdapter(instance,&a,ac);wait();if(!adapter)return 3;
 done=false;auto dd=WGPU_DEVICE_DESCRIPTOR_INIT;WGPUFeatureName features[]={WGPUFeatureName_TimestampQuery};dd.requiredFeatures=features;dd.requiredFeatureCount=1;
 dd.uncapturedErrorCallbackInfo.callback=[](WGPUDevice const*,WGPUErrorType,WGPUStringView m,void*,void*){std::cerr.write(m.data,m.length);failed=true;};
 auto dc=WGPU_REQUEST_DEVICE_CALLBACK_INFO_INIT;dc.mode=WGPUCallbackMode_AllowProcessEvents;dc.callback=[](WGPURequestDeviceStatus,WGPUDevice v,WGPUStringView m,void*,void*){device=v;done=true;if(!v)std::cerr.write(m.data,m.length);};wgpuAdapterRequestDevice(adapter,&dd,dc);wait();if(!device)return 4;
 std::ifstream source(argv[1]);std::string code((std::istreambuf_iterator<char>(source)),{});auto s=WGPU_SHADER_SOURCE_WGSL_INIT;s.code={code.data(),code.size()};auto sd=WGPU_SHADER_MODULE_DESCRIPTOR_INIT;sd.nextInChain=&s.chain;auto module=wgpuDeviceCreateShaderModule(device,&sd);
 std::ifstream raw(argv[4],std::ios::binary);std::vector<char> data((std::istreambuf_iterator<char>(raw)),{});
 auto queue=wgpuDeviceGetQueue(device);auto clock=buffer(32,WGPUBufferUsage_Uniform|WGPUBufferUsage_CopyDst);auto values=buffer(data.size(),WGPUBufferUsage_Storage|WGPUBufferUsage_CopyDst);wgpuQueueWriteBuffer(queue,values,0,data.data(),data.size());
 WGPUBindGroupLayoutEntry e[2]={WGPU_BIND_GROUP_LAYOUT_ENTRY_INIT,WGPU_BIND_GROUP_LAYOUT_ENTRY_INIT};e[0].binding=0;e[0].visibility=WGPUShaderStage_Vertex|WGPUShaderStage_Fragment;e[0].buffer.type=WGPUBufferBindingType_Uniform;e[1].binding=5;e[1].visibility=e[0].visibility;e[1].buffer.type=WGPUBufferBindingType_ReadOnlyStorage;
 auto ld=WGPU_BIND_GROUP_LAYOUT_DESCRIPTOR_INIT;ld.entryCount=2;ld.entries=e;auto layout=wgpuDeviceCreateBindGroupLayout(device,&ld);
 WGPUBindGroupEntry be[2]={WGPU_BIND_GROUP_ENTRY_INIT,WGPU_BIND_GROUP_ENTRY_INIT};be[0].binding=0;be[0].buffer=clock;be[0].size=32;be[1].binding=5;be[1].buffer=values;be[1].size=data.size();auto bd=WGPU_BIND_GROUP_DESCRIPTOR_INIT;bd.layout=layout;bd.entryCount=2;bd.entries=be;auto group=wgpuDeviceCreateBindGroup(device,&bd);
 auto pl=WGPU_PIPELINE_LAYOUT_DESCRIPTOR_INIT;pl.bindGroupLayoutCount=1;pl.bindGroupLayouts=&layout;auto pipelineLayout=wgpuDeviceCreatePipelineLayout(device,&pl);
 auto target=texture(width,height,WGPUTextureFormat_RGBA8Unorm,WGPUTextureUsage_RenderAttachment|WGPUTextureUsage_CopySrc);auto field=composite?texture(width,height,WGPUTextureFormat_RGBA16Float,WGPUTextureUsage_RenderAttachment|WGPUTextureUsage_TextureBinding):target;auto targetView=wgpuTextureCreateView(target,nullptr);auto fieldView=wgpuTextureCreateView(field,nullptr);
 auto format=composite?WGPUTextureFormat_RGBA16Float:WGPUTextureFormat_RGBA8Unorm;auto base=pipeline(module,pipelineLayout,format,false,over,"fragmentMain");auto particles=count?pipeline(module,pipelineLayout,format,true,over,"particleFragment"):nullptr;
 WGPURenderPipeline lens=nullptr;WGPUBindGroup lensGroup=nullptr;
 if(composite){WGPUBindGroupLayoutEntry le[2]={WGPU_BIND_GROUP_LAYOUT_ENTRY_INIT,WGPU_BIND_GROUP_LAYOUT_ENTRY_INIT};le[0].binding=0;le[0].visibility=WGPUShaderStage_Fragment;le[0].sampler.type=WGPUSamplerBindingType_Filtering;le[1].binding=1;le[1].visibility=WGPUShaderStage_Fragment;le[1].texture.sampleType=WGPUTextureSampleType_Float;le[1].texture.viewDimension=WGPUTextureViewDimension_2D;
 auto ll=WGPU_BIND_GROUP_LAYOUT_DESCRIPTOR_INIT;ll.entryCount=2;ll.entries=le;auto lensLayout=wgpuDeviceCreateBindGroupLayout(device,&ll);WGPUBindGroupLayout layouts[2]={layout,lensLayout};pl.bindGroupLayoutCount=2;pl.bindGroupLayouts=layouts;auto fullLayout=wgpuDeviceCreatePipelineLayout(device,&pl);lens=pipeline(module,fullLayout,WGPUTextureFormat_RGBA8Unorm,false,over,"compositeFragment");
 auto sm=WGPU_SAMPLER_DESCRIPTOR_INIT;sm.minFilter=WGPUFilterMode_Linear;sm.magFilter=WGPUFilterMode_Linear;auto sampler=wgpuDeviceCreateSampler(device,&sm);WGPUBindGroupEntry lb[2]={WGPU_BIND_GROUP_ENTRY_INIT,WGPU_BIND_GROUP_ENTRY_INIT};lb[0].binding=0;lb[0].sampler=sampler;lb[1].binding=1;lb[1].textureView=fieldView;bd.layout=lensLayout;bd.entries=lb;lensGroup=wgpuDeviceCreateBindGroup(device,&bd);}
 auto qd=WGPU_QUERY_SET_DESCRIPTOR_INIT;qd.type=WGPUQueryType_Timestamp;qd.count=composite?4:2;auto query=wgpuDeviceCreateQuerySet(device,&qd);auto resolved=buffer(32,WGPUBufferUsage_QueryResolve|WGPUBufferUsage_CopySrc);auto read=buffer(32,WGPUBufferUsage_CopyDst|WGPUBufferUsage_MapRead);
 for(int i=-5;i<samples;i++){
 auto start=std::chrono::steady_clock::now();auto enc=wgpuDeviceCreateCommandEncoder(device,nullptr);
 auto attachment=WGPU_RENDER_PASS_COLOR_ATTACHMENT_INIT;attachment.view=fieldView;attachment.loadOp=WGPULoadOp_Clear;attachment.storeOp=WGPUStoreOp_Store;
 WGPUPassTimestampWrites stamps={};stamps.querySet=query;stamps.beginningOfPassWriteIndex=0;stamps.endOfPassWriteIndex=1;auto passd=WGPU_RENDER_PASS_DESCRIPTOR_INIT;passd.colorAttachmentCount=1;passd.colorAttachments=&attachment;passd.timestampWrites=&stamps;
 auto pass=wgpuCommandEncoderBeginRenderPass(enc,&passd);wgpuRenderPassEncoderSetBindGroup(pass,0,group,0,nullptr);wgpuRenderPassEncoderSetPipeline(pass,base);wgpuRenderPassEncoderDraw(pass,3,1,0,0);if(particles){wgpuRenderPassEncoderSetPipeline(pass,particles);wgpuRenderPassEncoderDraw(pass,6,count,0,0);}wgpuRenderPassEncoderEnd(pass);wgpuRenderPassEncoderRelease(pass);
 if(composite){attachment.view=targetView;stamps.beginningOfPassWriteIndex=2;stamps.endOfPassWriteIndex=3;pass=wgpuCommandEncoderBeginRenderPass(enc,&passd);wgpuRenderPassEncoderSetPipeline(pass,lens);wgpuRenderPassEncoderSetBindGroup(pass,0,group,0,nullptr);wgpuRenderPassEncoderSetBindGroup(pass,1,lensGroup,0,nullptr);wgpuRenderPassEncoderDraw(pass,3,1,0,0);wgpuRenderPassEncoderEnd(pass);wgpuRenderPassEncoderRelease(pass);}
 wgpuCommandEncoderResolveQuerySet(enc,query,0,qd.count,resolved,0);wgpuCommandEncoderCopyBufferToBuffer(enc,resolved,0,read,0,32);auto commands=wgpuCommandEncoderFinish(enc,nullptr);wgpuQueueSubmit(queue,1,&commands);wgpuCommandBufferRelease(commands);wgpuCommandEncoderRelease(enc);
 done=false;auto mc=WGPU_BUFFER_MAP_CALLBACK_INFO_INIT;mc.mode=WGPUCallbackMode_AllowProcessEvents;mc.callback=[](WGPUMapAsyncStatus status,WGPUStringView,void*,void*){done=true;if(status!=WGPUMapAsyncStatus_Success)failed=true;};wgpuBufferMapAsync(read,WGPUMapMode_Read,0,32,mc);wait();auto ticks=(const uint64_t*)wgpuBufferGetConstMappedRange(read,0,32);if(!ticks)return 5;double ms=(ticks[1]-ticks[0]+(composite?ticks[3]-ticks[2]:0))/1e6;wgpuBufferUnmap(read);if(i>=0)std::cout<<ms<<","<<std::chrono::duration<double,std::milli>(std::chrono::steady_clock::now()-start).count()<<"\n";
 }
 auto row=(width*4+255)/256*256;auto pixels=buffer(row*height,WGPUBufferUsage_CopyDst|WGPUBufferUsage_MapRead);auto enc=wgpuDeviceCreateCommandEncoder(device,nullptr);auto src=WGPU_TEXEL_COPY_TEXTURE_INFO_INIT;src.texture=target;auto dst=WGPU_TEXEL_COPY_BUFFER_INFO_INIT;dst.buffer=pixels;dst.layout.bytesPerRow=row;dst.layout.rowsPerImage=height;WGPUExtent3D extent={(uint32_t)width,(uint32_t)height,1};wgpuCommandEncoderCopyTextureToBuffer(enc,&src,&dst,&extent);auto commands=wgpuCommandEncoderFinish(enc,nullptr);wgpuQueueSubmit(queue,1,&commands);
 done=false;auto mc=WGPU_BUFFER_MAP_CALLBACK_INFO_INIT;mc.mode=WGPUCallbackMode_AllowProcessEvents;mc.callback=[](WGPUMapAsyncStatus,WGPUStringView,void*,void*){done=true;};wgpuBufferMapAsync(pixels,WGPUMapMode_Read,0,row*height,mc);wait();auto bytes=(const char*)wgpuBufferGetConstMappedRange(pixels,0,row*height);std::ofstream image(argv[9],std::ios::binary);for(int y=0;y<height;y++)image.write(bytes+y*row,width*4);wgpuBufferUnmap(pixels);
 wgpuDeviceDestroy(device);return failed?1:0;
}
