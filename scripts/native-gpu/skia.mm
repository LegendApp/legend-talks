#import <Metal/Metal.h>
#include "include/core/SkCanvas.h"
#include "include/core/SkData.h"
#include "include/core/SkPaint.h"
#include "include/effects/SkRuntimeEffect.h"
#include "include/gpu/ganesh/GrDirectContext.h"
#include "include/gpu/ganesh/SkSurfaceGanesh.h"
#include "include/gpu/ganesh/mtl/GrMtlBackendContext.h"
#include "include/gpu/ganesh/mtl/GrMtlDirectContext.h"
#include <fstream>
#include <iostream>
#include <vector>
#include <chrono>
int main(int argc,char** argv) { @autoreleasepool {
  if(argc!=7) return 2;
  auto device=MTLCreateSystemDefaultDevice(); auto queue=[device newCommandQueue];
  GrMtlBackendContext backend; backend.fDevice.reset((const void*)CFRetain((CFTypeRef)device)); backend.fQueue.reset((const void*)CFRetain((CFTypeRef)queue));
  auto context=GrDirectContexts::MakeMetal(backend); if(!context) return 3;
  int width=std::stoi(argv[2]),height=std::stoi(argv[3]),samples=std::stoi(argv[5]);
  auto surface=SkSurfaces::RenderTarget(context.get(),skgpu::Budgeted::kYes,SkImageInfo::Make(width,height,kRGBA_8888_SkColorType,kPremul_SkAlphaType));
  std::ifstream source(argv[1]); std::string code((std::istreambuf_iterator<char>(source)),{});
  auto result=SkRuntimeEffect::MakeForShader(SkString(code.c_str())); if(!result.effect) {std::cerr<<result.errorText.c_str();return 4;}
  auto data=SkData::MakeFromFileName(argv[4]); if(!data || data->size()!=result.effect->uniformSize()) {std::cerr<<"Uniform size "<<result.effect->uniformSize();return 5;}
  auto blank=SkRuntimeEffect::MakeForShader(SkString("half4 main(float2 p){return half4(0);}"));
  SkRuntimeEffect::ChildPtr child(blank.effect->makeShader(nullptr, nullptr, 0));
  auto shader=result.effect->makeShader(data, SkSpan<const SkRuntimeEffect::ChildPtr>(result.effect->children().empty()?nullptr:&child,result.effect->children().size()));
  SkPaint paint; paint.setShader(shader); uint64_t ticks=0;
  for(int i=-5;i<samples;i++) {
    auto start=std::chrono::steady_clock::now(); surface->getCanvas()->clear(SK_ColorTRANSPARENT);surface->getCanvas()->drawRect(SkRect::MakeWH(width,height),paint);
    GrFlushInfo info; info.fGpuStatsFlags=skgpu::GpuStatsFlags::kElapsedTime;info.fFinishedContext=&ticks;
    info.fFinishedWithStatsProc=[](void* p,const skgpu::GpuStats& stats){*(uint64_t*)p=stats.elapsedTime;};
    context->flush(surface.get(),info);context->submit(GrSyncCpu::kYes);
    if(i>=0) std::cout<<ticks/1e6<<","<<std::chrono::duration<double,std::milli>(std::chrono::steady_clock::now()-start).count()<<"\n";
  }
  std::vector<unsigned char> pixels(width*height*4); if(!surface->readPixels(SkImageInfo::Make(width,height,kRGBA_8888_SkColorType,kPremul_SkAlphaType),pixels.data(),width*4,0,0))return 6;
  std::ofstream image(argv[6],std::ios::binary);image.write((char*)pixels.data(),pixels.size());
  std::cerr<<"Metal device: "<<[[device name] UTF8String]<<"\n";
} }
