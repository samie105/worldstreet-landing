import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function AboutPage() {
  return (
    <main className="flex flex-col w-full relative bg-[#050505] min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-[#FFCC2D]/10 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] backdrop-blur-md mb-8">
            <div className="w-2 h-2 rounded-full bg-[#FFCC2D] box-glow animate-pulse" />
            <span className="text-sm font-medium text-gray-300">About Worldstreet</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">
            Empowering the Global <br />
            <span className="text-[#FFCC2D]">Digital Economy</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto">
            Worldstreet is a multi-sector digital ecosystem built to bridge the gap between traditional finance and the decentralized future. We provide secure, fast, and seamless trading for crypto, forex, and fiat.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-6 border-t border-[rgba(255,255,255,0.05)] relative bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-6">
              To democratize access to financial markets by providing an intuitive, reliable, and comprehensive trading platform. Whether you're exchanging cryptocurrency, trading forex, or managing fiat, Worldstreet is built to put the power of a global financial hub directly in your hands.
            </p>
            <p className="text-gray-400 text-lg leading-relaxed">
              We focus on minimizing fees, executing trades at lightning speed, and offering a robust suite of tools that both beginners and seasoned veterans can rely on.
            </p>
          </div>
          <div className="glass p-8 md:p-12 rounded-3xl border border-[rgba(255,255,255,0.05)] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFCC2D]/5 blur-[80px] rounded-full pointer-events-none" />
            <h2 className="text-3xl font-bold mb-6 text-white relative z-10">Why Choose Us?</h2>
            <ul className="space-y-6 relative z-10">
              {[
                { title: "Security First", desc: "Enterprise-grade encryption protecting your digital assets." },
                { title: "Global Reach", desc: "Trade seamlessly across borders in multiple currencies." },
                { title: "Lightning Fast", desc: "Our engine executes millions of trades per second." }
              ].map((item, idx) => (
                <li key={idx} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[rgba(255,204,45,0.1)] flex items-center justify-center shrink-0 border border-[#FFCC2D]/20">
                    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#FFCC2D]">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                    <p className="text-gray-400 text-sm">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Stats/Metrics Section */}
      <section className="py-24 px-6 border-t border-[rgba(255,255,255,0.05)]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { label: "Quarterly Volume", value: "$40B+" },
              { label: "Active Traders", value: "2M+" },
              { label: "Countries Supported", value: "150+" },
              { label: "Uptime", value: "99.99%" }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-[#FFCC2D] font-medium uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}