"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Plus, Minus } from "lucide-react";
import Link from "next/link";

const defaultFaqs = [
  {
    question: "What is Worldstreet?",
    answer: "Worldstreet is a trusted digital trading ecosystem designed for seamlessly trading Forex, Crypto, CFDs, and managing your digital assets with top-tier security.",
  },
  {
    question: "How fast are transactions?",
    answer: "Transactions on Worldstreet are processed almost instantly, leveraging high-performance matching engines and optimized liquidity pools.",
  },
  {
    question: "Is Worldstreet secure?",
    answer: "Yes, Worldstreet employs bank-grade encryption, secure storage for funds, and rigorous security audits to ensure your assets are safe at all times.",
  },
  {
    question: "Do I need to verify my identity?",
    answer: "To comply with regulatory standards and ensure a safe trading environment, we require identity verification (KYC) for all users before standard trading.",
  },
  {
    question: "Which markets are supported?",
    answer: "We support a wide range of markets including traditional Forex pairs, major cryptocurrencies like Bitcoin and Ethereum, and various CFDs.",
  },
  {
    question: "Can I access Worldstreet on mobile?",
    answer: "Absolutely. Our fully responsive web app and upcoming dedicated mobile applications for iOS and Android allow you to trade on the go.",
  },
  {
    question: "What are the fees for transactions?",
    answer: "We offer highly competitive fee structures for both Forex and Crypto trading, with further discounts for high-volume traders.",
  },
  {
    question: "How can I contact support?",
    answer: "Our globally distributed support team is available 24/7 via live chat, email, and comprehensive help center documentation.",
  },
];

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  items?: FAQItem[];
  title?: string;
  subtitle?: string;
}

export default function FAQSection({
  items = defaultFaqs,
  title = "Your Questions, Answered",
  subtitle = "Find everything you need to know about Worldstreet, from security to supported assets."
}: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-[#050505] w-full border-t border-white/[0.08]">
      
      {/* Header Row Wrapper - Full width bottom border */}
      <div className="w-full border-b border-white/[0.08]">
        <div className="max-w-[1240px] mx-auto border-x border-white/[0.08] relative">
          
          {/* Header Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2">

            {/* Header Left (Title area) */}
            <div className="p-6 md:p-10 lg:p-12 border-b md:border-b-0 md:border-r border-white/[0.08] flex flex-col justify-center min-h-[220px] md:min-h-[260px]">
              <h2 className="text-3xl md:text-5xl lg:text-5xl font-medium mb-6 tracking-tight text-white">
                {title}
              </h2>
              <p className="text-white/60 text-base md:text-lg lg:text-xl max-w-md">
                {subtitle}
              </p>
            </div>

            {/* Header Right (Split top/bottom) */}
            <div className="flex flex-col h-full">
              <div className="flex-1 border-b border-white/[0.08] hidden md:block" />
              <div className="flex-1 p-6 md:p-10 flex items-center justify-start md:justify-end">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-3 text-[#FFCC2D] text-[15px] font-medium hover:text-[#FFE066] transition-colors group"
                >
                  Create account now
                  <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* FAQs Row Wrapper - Full width bottom border */}
      <div className="w-full border-b border-white/[0.08]">
        <div className="max-w-[1240px] mx-auto border-x border-white/[0.08] relative">
          
          {/* FAQs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2">
            {items.map((faq, index) => {
              const isOpen = openIndex === index;
              
              // Determine border classes based on position
              const isLastDesktopRow = index >= items.length - 2;
              const isLastMobileItem = index === items.length - 1;

              let borderClasses = "border-b";
              if (isLastDesktopRow) {
                if (isLastMobileItem) {
                  borderClasses = "border-b-0 md:border-b-0"; // No bottom border ever since wrapper has it
                } else {
                  borderClasses = "border-b md:border-b-0"; // Bottom border on mobile only
                }
              }

              return (
                <div
                  key={index}
                  className={`flex flex-col h-full border-white/[0.08] ${
                    index % 2 === 0 ? "md:border-r" : ""
                  } ${borderClasses}`}
                >
                  <button
                    onClick={() => toggleAccordion(index)}
                    className="w-full flex items-center justify-between p-6 md:p-8 text-left hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="text-base md:text-lg font-medium pr-8 text-white">
                      {faq.question}
                    </span>
                    <div className="text-[#FFCC2D] shrink-0">
                      {isOpen ? (
                        <Minus className="w-5 h-5 mx-0.5" />
                      ) : (
                        <Plus className="w-5 h-5 mx-0.5" />
                      )}
                    </div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 md:px-8 pb-6 md:pb-8 text-white/60">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
