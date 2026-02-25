<template>
  <div class="not-found-container min-h-screen w-full flex items-center justify-center p-6 bg-[#f8f9fa] overflow-hidden">
    <!-- Bubble Background Elements -->
    <div class="absolute w-64 h-64 bg-[#D4AF37] rounded-full opacity-20 blur-3xl -top-10 -left-10 mix-blend-multiply pointer-events-none"></div>
    <div class="absolute w-96 h-96 bg-[#171717] rounded-full opacity-5 blur-3xl -bottom-20 -right-20 mix-blend-multiply pointer-events-none"></div>
    
    <div class="relative z-10 max-w-2xl w-full text-center flex flex-col items-center justify-center space-y-10">
      
      <!-- Playful 404 Numbers -->
      <div class="flex items-center justify-center space-x-3 sm:space-x-6 mb-4 select-none">
        <div class="clay-number bg-white text-[#171717] border-[3px] sm:border-[4px] border-[#171717] rounded-[24px] sm:rounded-[32px] w-24 h-32 sm:w-32 sm:h-44 flex items-center justify-center text-7xl sm:text-9xl font-black shadow-[4px_4px_0px_#171717,inset_-2px_-4px_0px_rgba(0,0,0,0.05)] sm:shadow-[8px_8px_0px_#171717,inset_-4px_-8px_0px_rgba(0,0,0,0.05)] transform -rotate-6 hover:rotate-0 hover:scale-105 transition-all duration-300">
          4
        </div>
        <div class="clay-number bg-[#D4AF37] text-white border-[3px] sm:border-[4px] border-[#171717] rounded-[24px] sm:rounded-[32px] w-24 h-32 sm:w-32 sm:h-44 flex items-center justify-center text-7xl sm:text-9xl font-black shadow-[4px_4px_0px_#171717,inset_-2px_-4px_0px_rgba(0,0,0,0.1)] sm:shadow-[8px_8px_0px_#171717,inset_-4px_-8px_0px_rgba(0,0,0,0.1)] transform rotate-6 hover:rotate-0 hover:scale-105 transition-all duration-300">
          0
        </div>
        <div class="clay-number bg-white text-[#171717] border-[3px] sm:border-[4px] border-[#171717] rounded-[24px] sm:rounded-[32px] w-24 h-32 sm:w-32 sm:h-44 flex items-center justify-center text-7xl sm:text-9xl font-black shadow-[4px_4px_0px_#171717,inset_-2px_-4px_0px_rgba(0,0,0,0.05)] sm:shadow-[8px_8px_0px_#171717,inset_-4px_-8px_0px_rgba(0,0,0,0.05)] transform -rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-300">
          4
        </div>
      </div>

      <!-- Text Content -->
      <div class="bg-white border-[3px] sm:border-[4px] border-[#171717] rounded-[24px] p-8 sm:p-10 shadow-[6px_6px_0px_#171717,inset_-2px_-4px_0px_rgba(0,0,0,0.02)] max-w-xl w-full">
        <h1 class="font-primary text-3xl sm:text-4xl font-bold text-[#171717] mb-4 tracking-wide">
          Oops! You're lost.
        </h1>
        <p class="font-secondary text-base sm:text-lg text-[#404040] mb-8 leading-relaxed">
          The page you are looking for seems to have wandered off. Let's get you back to familiar territory!
        </p>

        <!-- CTA Button -->
        <button 
          @click="goHome"
          class="font-primary cursor-pointer text-lg font-bold bg-[#171717] text-white px-8 py-4 rounded-[16px] border-[3px] border-[#171717] shadow-[4px_4px_0px_#D4AF37] hover:shadow-[0px_0px_0px_#D4AF37] hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#D4AF37]/50 active:scale-95 flex items-center justify-center mx-auto space-x-3 w-full sm:w-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span>Take Me Home</span>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const goHome = () => {
	router.push("/");
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;500;600;700&display=swap');

.font-primary {
  font-family: 'Fredoka', sans-serif;
}

.font-secondary {
  font-family: 'Nunito', sans-serif;
}

.clay-number {
  font-family: 'Fredoka', sans-serif;
}

.not-found-container {
  font-family: 'Nunito', sans-serif;
}
</style>
