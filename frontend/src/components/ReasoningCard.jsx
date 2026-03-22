import { motion } from 'framer-motion';

const ShieldIcon = () => (
  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M10 2.8L15.2 4.9V9c0 3.7-2 6.1-5.2 7.7C6.8 15.1 4.8 12.7 4.8 9V4.9L10 2.8Z" strokeLinejoin="round" />
    <path d="M7.4 10.2l1.6 1.6 3.6-3.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const VerdictIcon = () => (
  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M10 4.2v4.8" strokeLinecap="round" />
    <path d="M10 12.8h.01" strokeLinecap="round" />
    <path d="M17 10c0 3.87-3.13 7-7 7s-7-3.13-7-7 3.13-7 7-7 7 3.13 7 7Z" />
  </svg>
);

export default function ReasoningCard({ apiResponse, loading, reasoningSteps, isTyping }) {
  const verdict = apiResponse?.verdict || 'Awaiting Simulation';
  const confidence = apiResponse?.confidence ? `${apiResponse.confidence}%` : 'XX%';
  const isFlagged = apiResponse?.status === 'FLAGGED';
  const showAnalysing = loading || isTyping;
  const verdictLabel = isFlagged ? 'Why Flagged?' : 'Rationale';
  const statusMessage = showAnalysing
    ? 'Agent Analysing...'
    : apiResponse
      ? 'Signal trace complete.'
      : 'Awaiting agent activation.';

  return (
    <motion.article
      className="glass-card min-h-[400px] p-7 md:min-h-[450px] md:p-9"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.08 }}
    >
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-center gap-3 text-[1.02rem] tracking-[0.18em] text-white/90">
          <ShieldIcon />
          <span>Agent Reasoning</span>
        </div>

        <div className="mt-9 space-y-3 font-mono text-[0.92rem] leading-6 text-white/[0.72] md:mt-12">
          <p className="text-white/[0.68]">
            {statusMessage}
            {showAnalysing && <span className="ml-1 inline-block h-5 w-[1px] animate-blink bg-white/80 align-middle" />}
          </p>

          {reasoningSteps.length > 0 ? (
            reasoningSteps.map((step) => (
              <motion.p
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                {step}...
              </motion.p>
            ))
          ) : (
            <p className="text-white/[0.38]">Reasoning output will stream here line by line.</p>
          )}
        </div>

        <div className="mt-auto pt-10">
          <div className="flex items-center gap-3 text-[1rem] tracking-[0.18em] text-white/90">
            <VerdictIcon />
            <span>Verdict</span>
          </div>

          <div className="mt-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div
              className={`inline-flex w-fit items-center gap-2 rounded-[12px] border px-5 py-3 text-sm tracking-[0.16em] ${
                isFlagged
                  ? 'animate-alert border-alert/40 bg-verdict/[0.55] text-alert shadow-alert'
                  : 'border-white/[0.12] bg-white/[0.08] text-white/[0.86]'
              }`}
            >
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-current" />
              <span>{verdict}</span>
            </div>

            <p className="text-sm tracking-[0.18em] text-white/[0.78]">Confidence Score: {confidence}</p>
          </div>

          <div className="mt-6">
            <p className="text-sm tracking-[0.2em] text-white/[0.84]">{verdictLabel}</p>
            <p className="mt-3 max-w-[28rem] text-sm leading-7 text-white/[0.58]">
              {apiResponse?.explanation || 'The verdict rationale will appear after the simulation completes.'}
            </p>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
