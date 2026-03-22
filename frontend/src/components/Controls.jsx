const PlayIcon = () => (
  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M6 4.8L14 10l-8 5.2V4.8Z" fill="currentColor" stroke="none" />
  </svg>
);

const ResetIcon = () => (
  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M4 9.8A6 6 0 1 0 6.4 5" strokeLinecap="round" />
    <path d="M4 4.8v4.4h4.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Loader = () => (
  <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />
);

export default function Controls({ loading, onStart, onReset }) {
  return (
    <div className="relative z-10 mt-16 flex flex-wrap items-center gap-4 text-sm tracking-[0.2em] text-white/90 md:mt-20">
      <button
        type="button"
        onClick={onStart}
        disabled={loading}
        className="inline-flex items-center gap-3 rounded-full border border-white/[0.12] bg-white/[0.04] px-5 py-3 uppercase transition duration-300 hover:scale-[1.03] hover:border-white/[0.24] hover:bg-white/10 hover:shadow-glow disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.05] disabled:text-white/[0.35] disabled:shadow-none"
      >
        {loading ? <Loader /> : <PlayIcon />}
        <span>Start Simulation</span>
      </button>

      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-3 rounded-full border border-transparent px-3 py-3 uppercase text-white/[0.82] transition duration-300 hover:scale-[1.03] hover:text-white"
      >
        <ResetIcon />
        <span>Reset</span>
      </button>
    </div>
  );
}
