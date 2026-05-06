<template>
  <div class="relative mt-8 flex min-[1024px]:mt-0 min-[1024px]:py-[0.4rem] min-[1024px]:pr-0 min-[1024px]:pl-20 min-[1024px]:before:absolute min-[1024px]:before:bottom-[calc(50%+25px)] min-[1024px]:before:left-0 min-[1024px]:before:h-[calc(50%-25px)] min-[1024px]:before:border-l min-[1024px]:before:border-[#2a2a2a] min-[1024px]:first:before:hidden min-[1024px]:after:absolute min-[1024px]:after:top-[calc(50%+25px)] min-[1024px]:after:left-0 min-[1024px]:after:h-[calc(50%-25px)] min-[1024px]:after:border-l min-[1024px]:after:border-[#2a2a2a] min-[1024px]:last:after:hidden">
    <i class="flex h-8 w-8 place-content-center place-items-center text-neutral-300 min-[1024px]:absolute min-[1024px]:top-[calc(50%-25px)] min-[1024px]:left-[-26px] min-[1024px]:h-[50px] min-[1024px]:w-[50px] min-[1024px]:rounded-lg min-[1024px]:border min-[1024px]:border-[#2a2a2a] min-[1024px]:bg-[#0f0f0f]">
      <slot name="icon"></slot>
    </i>
    <div class="ml-4 flex-1">
      <h3 class="mb-[0.4rem] text-[1.2rem] font-medium text-white">
        <slot name="heading"></slot>
      </h3>
      <slot></slot>
    </div>
  </div>
</template>
