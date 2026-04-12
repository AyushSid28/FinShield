import { motion } from 'framer-motion';

const ArrowIcon = () => (
  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 14L14 4" strokeLinecap="round" />
    <path d="M6 4h8v8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Hero({ onSeeAction }) {
  return (
    <section className="relative z-10 max-w-[780px] pt-10 md:pt-14">
      <motion.p
        className="eyebrow mb-5"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        Real-Time Fraud Intelligence
      </motion.p>

      <motion.h1
        className="max-w-[760px] text-[54px] font-medium leading-[0.94] tracking-[-0.05em] text-white sm:text-[72px] md:text-[92px]"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
      >
        <span className="gradient-heading">Agentic AI</span> - Flagging
        <br />
        Transactions
      </motion.h1>

      <motion.p
        className="mt-7 max-w-[640px] text-lg leading-[1.35] text-soft md:text-[1.95rem]"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.18 }}
      >
        Autonomous intelligence that intercepts fraud before it becomes loss.
      </motion.p>

      <motion.button
        type="button"
        onClick={onSeeAction}
        className="mt-10 inline-flex items-center gap-3 rounded-[18px] border border-white/[0.22] bg-white/[0.04] px-5 py-3 text-sm font-medium tracking-[0.08em] text-white transition duration-300 hover:scale-[1.03] hover:bg-white/10 hover:shadow-glow md:mt-12"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.24 }}
      >
        <ArrowIcon />
        <span>See it in Action</span>
      </motion.button>
    </section>
  );
}
