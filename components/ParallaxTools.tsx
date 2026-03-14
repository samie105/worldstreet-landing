"use client";

import { motion } from "framer-motion";

export default function ParallaxTools() {
  return (
    <section className="relative py-32 overflow-hidden bg-[#050505] border-t border-[rgba(255,255,255,0.05)]">
       {/* Background Glow */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#bdff00] opacity-[0.03] blur-[120px] rounded-full pointer-events-none"></div>

       <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
         
         {/* Left Side Content */}
         <div className="space-y-8">
           <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
             Professional-grade <br />
             <span className="text-[#bdff00]">Analysis Tools.</span>
           </h2>
           
           <div className="space-y-6">
             <div className="glass p-6 rounded-2xl flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center shrink-0">
                  <div className="w-3 h-3 rounded-full bg-[#bdff00] box-glow"></div>
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-1">Real-Time Data</h4>
                  <p className="text-gray-400 font-body text-sm">Live streaming prices with ultra-low latency execution</p>
                </div>
             </div>

             <div className="glass p-6 rounded-2xl flex gap-4 opacity-70 hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center shrink-0">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-1">Advanced Analysis</h4>
                  <p className="text-gray-400 font-body text-sm">Professional charting tools with 100+ technical indicators</p>
                </div>
             </div>
           </div>
         </div>

         {/* Right Side Parallax Mockup */}
         <div className="relative h-[500px] w-full ml-auto">
            {/* Main Mockup Layer */}
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-0 glass rounded-3xl overflow-hidden border-[#bdff00]/20 shadow-[0_0_50px_rgba(189,255,0,0.05)]"
            >
              {/* Fake UI Header */}
              <div className="h-12 border-b border-[rgba(255,255,255,0.05)] flex items-center px-4 gap-2">
                 <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                 <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                 <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
              </div>
              {/* Fake Chart Lines */}
              <div className="p-6 h-full flex flex-col justify-end gap-3 pb-12 relative overflow-hidden">
                {/* Simulated Candlesticks */}
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                
                {/* Abstract Chart Vector */}
                <svg viewBox="0 0 400 200" className="w-full h-auto drop-shadow-[0_0_15px_rgba(189,255,0,0.3)]">
                  <path d="M0,150 L50,120 L100,160 L150,90 L200,110 L250,40 L300,80 L350,20 L400,50" fill="none" stroke="#bdff00" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M0,150 L50,120 L100,160 L150,90 L200,110 L250,40 L300,80 L350,20 L400,50 L400,200 L0,200 Z" fill="url(#gradient)" stroke="none" opacity="0.2"/>
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#bdff00"/>
                      <stop offset="100%" stopColor="transparent"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </motion.div>

            {/* Floating Component Layer (Parallax effect) */}
            <motion.div 
               initial={{ y: 50, opacity: 0 }}
               whileInView={{ y: -30, opacity: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 1, delay: 0.3 }}
               className="absolute -bottom-10 -left-10 w-64 glass p-4 rounded-2xl border-[#bdff00]/30 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex justify-between items-center mb-2">
                 <span className="text-sm font-bold">Buy BTC</span>
                 <span className="text-xs text-[#bdff00]">Execution: 0.01s</span>
              </div>
              <div className="h-10 w-full bg-[rgba(255,255,255,0.05)] rounded-lg flex items-center px-3 text-sm text-gray-400">
                Amount: 2.5
              </div>
              <button className="w-full mt-3 py-2 bg-[#bdff00] text-black font-bold rounded-lg text-sm">Target Reached</button>
            </motion.div>
         </div>

       </div>
    </section>
  );
}
