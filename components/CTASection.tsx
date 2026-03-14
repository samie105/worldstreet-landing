export default function CTASection() {
  return (
    <section className="relative w-full py-32 px-6 flex flex-col items-center justify-center text-center overflow-hidden">
      {/* Background glow or subtle gradient if needed */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#bdff00]/5 blur-[120px] rounded-[100%] pointer-events-none" />

      <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white mb-6 max-w-3xl">
        Ready to take control<br />of your crypto?
      </h2>
      <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-10">
        Join thousands of users who trust Worldstreet for secure, seamless, and efficient cryptocurrency transactions.
      </p>

      {/* Button with glow */}
      <div className="relative group">
        <div className="absolute -inset-1 rounded-full bg-[#bdff00] opacity-30 group-hover:opacity-50 blur-lg transition duration-500" />
        <a
          href="#"
          className="relative inline-flex items-center gap-2 bg-[#bdff00] text-black px-8 py-4 rounded-[100px] font-medium hover:scale-105 transition-transform duration-300"
        >
          Get started now
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 17L17 7" />
            <path d="M7 7h10v10" />
          </svg>
        </a>
      </div>
    </section>
  );
}
