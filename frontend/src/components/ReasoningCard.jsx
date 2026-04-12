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

const riskBarColor = (risk) => {
  if (risk >= 0.66) return 'bg-red-400';
  if (risk >= 0.33) return 'bg-amber-400';
  return 'bg-emerald-400';
};

const riskTextColor = (risk) => {
  if (risk >= 0.66) return 'text-red-400';
  if (risk >= 0.33) return 'text-amber-300';
  return 'text-emerald-400';
};

const AGENT_WEIGHTS = {
  behavioral_agent: { label: 'Behavioral', weight: 0.30, color: 'bg-blue-400' },
  temporal_agent:   { label: 'Temporal',   weight: 0.20, color: 'bg-purple-400' },
  geo_agent:        { label: 'Geo',        weight: 0.25, color: 'bg-cyan-400' },
  device_agent:     { label: 'Device',     weight: 0.25, color: 'bg-pink-400' },
};

const AGENT_FORMULAS = {
  behavioral_agent: 'Z = (x - μ) / σ',
  temporal_agent: 'risk = 1 - e^(-λ·d)',
  geo_agent: 'R = σ((d-100)/60)',
  device_agent: 'H = -Σ pᵢ·log₂(pᵢ)',
};

function AgentNode({ node, signals }) {
  if (node.id === 'llm_agent') return null;
  const pct = Math.round((node.risk ?? 0.5) * 100);
  const meta = AGENT_WEIGHTS[node.id];
  const formula = AGENT_FORMULAS[node.id];

  let mathDetail = null;
  if (node.id === 'behavioral_agent' && signals?.behavioral) {
    const s = signals.behavioral;
    mathDetail = `Z-score: ${s.z_score?.toFixed(2) ?? '—'}  |  σ-risk: ${s.statistical_risk?.toFixed(2) ?? '—'}`;
  }
  if (node.id === 'temporal_agent' && signals?.temporal) {
    mathDetail = `Decay composite: ${signals.temporal.decay_risk?.toFixed(2) ?? '—'}`;
  }

  return (
    <motion.div
      className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between text-xs tracking-[0.18em]">
        <div className="flex items-center gap-2">
          <span className="text-white/80">{node.name}</span>
          {meta && (
            <span className="text-[9px] text-white/30 tracking-wider">w={meta.weight}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-mono ${riskTextColor(node.risk)}`}>{pct}%</span>
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wider ${
              node.label === 'High'
                ? 'border-red-400/30 text-red-400'
                : node.label === 'Medium'
                  ? 'border-amber-300/30 text-amber-300'
                  : 'border-emerald-300/30 text-emerald-300'
            }`}
          >
            {node.label}
          </span>
        </div>
      </div>

      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className={`h-full rounded-full ${riskBarColor(node.risk)}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>

      {formula && (
        <p className="mt-1.5 text-[9px] font-mono text-white/25 tracking-wider">
          {formula}{mathDetail ? `  →  ${mathDetail}` : ''}
        </p>
      )}

      <p className="mt-1.5 text-[11px] leading-5 text-white/50">{node.reason}</p>
    </motion.div>
  );
}

function WeightedBreakdown({ agents, compositeRisk }) {
  const agentRisks = agents.filter((a) => a.id !== 'llm_agent');
  if (agentRisks.length === 0) return null;

  const segments = agentRisks.map((a) => {
    const meta = AGENT_WEIGHTS[a.id];
    if (!meta) return null;
    return { ...a, ...meta, contribution: meta.weight * (a.risk ?? 0.5) };
  }).filter(Boolean);

  const totalWeight = segments.reduce((s, seg) => s + seg.weight, 0);
  const composite = compositeRisk ?? segments.reduce((s, seg) => s + seg.contribution, 0) / totalWeight;

  return (
    <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-[0.24em] text-white/40">Weighted Composite</span>
        <span className={`text-sm font-mono font-semibold ${riskTextColor(composite)}`}>
          {Math.round(composite * 100)}%
        </span>
      </div>

      <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/[0.04]">
        {segments.map((seg) => (
          <motion.div
            key={seg.id}
            className={`h-full ${seg.color} first:rounded-l-full last:rounded-r-full`}
            style={{ opacity: 0.5 + (seg.risk ?? 0) * 0.5 }}
            initial={{ width: 0 }}
            animate={{ width: `${(seg.weight / totalWeight) * 100}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            title={`${seg.label}: ${Math.round((seg.risk ?? 0) * 100)}% × ${seg.weight}`}
          />
        ))}
      </div>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((seg) => (
          <div key={seg.id} className="flex items-center gap-1.5 text-[9px] text-white/40">
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${seg.color}`} />
            <span>{seg.label} {Math.round(seg.weight * 100)}%</span>
          </div>
        ))}
      </div>

      <p className="mt-1.5 text-[9px] font-mono text-white/20 tracking-wider">
        R = Σ(wᵢ·rᵢ) / Σ(wᵢ) = {composite.toFixed(4)}
      </p>
    </div>
  );
}

export default function ReasoningCard({ apiResponse, loading, reasoningSteps, isTyping }) {
  const verdict = apiResponse?.verdict || 'Awaiting Simulation';
  const confidence = apiResponse?.confidence ? `${apiResponse.confidence}%` : 'XX%';
  const isFlagged = apiResponse?.status === 'FLAGGED';
  const isReview = apiResponse?.status === 'REVIEW';
  const showAnalysing = loading || isTyping;
  const pipelineUsed = apiResponse?.pipelineUsed;
  const agents = apiResponse?.agents?.filter((a) => a.id !== 'llm_agent') || [];
  const llmAgent = apiResponse?.agents?.find((a) => a.id === 'llm_agent');
  const signals = apiResponse?.signals || {};

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[1.02rem] tracking-[0.18em] text-white/90">
            <ShieldIcon />
            <span>Agent Reasoning</span>
          </div>
          {apiResponse && (
            <span
              className={`rounded-full border px-2.5 py-1 text-[10px] tracking-[0.16em] ${
                pipelineUsed
                  ? 'border-emerald-400/25 text-emerald-400/80'
                  : 'border-amber-300/25 text-amber-300/80'
              }`}
            >
              {pipelineUsed ? 'LIVE PIPELINE' : 'SIMULATION'}
            </span>
          )}
        </div>

        <div className="mt-7 space-y-3 font-mono text-[0.92rem] leading-6 text-white/[0.72] md:mt-10">
          <p className="text-white/[0.68]">
            {statusMessage}
            {showAnalysing && <span className="ml-1 inline-block h-5 w-[1px] animate-blink bg-white/80 align-middle" />}
          </p>

          {agents.length > 0 ? (
            <>
              <div className="space-y-2.5">
                {agents.map((node) => (
                  <AgentNode key={node.id} node={node} signals={signals} />
                ))}
              </div>

              <WeightedBreakdown
                agents={apiResponse?.agents || []}
                compositeRisk={apiResponse?.compositeRisk}
              />
            </>
          ) : reasoningSteps.length > 0 ? (
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

        <div className="mt-auto pt-8">
          <div className="flex items-center gap-3 text-[1rem] tracking-[0.18em] text-white/90">
            <VerdictIcon />
            <span>Verdict</span>
          </div>

          <div className="mt-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div
              className={`inline-flex w-fit items-center gap-2 rounded-[12px] border px-5 py-3 text-sm tracking-[0.16em] ${
                isFlagged
                  ? 'animate-alert border-alert/40 bg-verdict/[0.55] text-alert shadow-alert'
                  : isReview
                    ? 'border-amber-300/25 bg-amber-300/[0.08] text-amber-200'
                    : 'border-emerald-300/25 bg-emerald-300/[0.08] text-emerald-300'
              }`}
            >
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-current" />
              <span>{verdict}</span>
            </div>

            <p className="text-sm tracking-[0.18em] text-white/[0.78]">Confidence: {confidence}</p>
          </div>

          {llmAgent && (
            <div className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.24em] text-white/40 mb-1.5">LLM Decision Reasoning</p>
              <p className="text-sm leading-6 text-white/[0.65]">{llmAgent.reasoning}</p>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-[10px] font-mono text-white/30">
                  {llmAgent.decision} → {llmAgent.action}
                </span>
              </div>
            </div>
          )}

          <div className="mt-5">
            <p className="text-sm tracking-[0.2em] text-white/[0.84]">
              {isFlagged ? 'Why Flagged?' : 'Rationale'}
            </p>
            <p className="mt-2 max-w-[28rem] text-sm leading-7 text-white/[0.50]">
              {apiResponse?.explanation || 'The verdict rationale will appear after the simulation completes.'}
            </p>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
