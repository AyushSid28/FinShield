import { motion } from 'framer-motion';

const TransactionIcon = () => (
  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M5 5.5h10v9H5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.5 14.5L5 11" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 11h10" strokeLinecap="round" />
  </svg>
);

const getStatusTone = (status) => {
  if (status === 'FLAGGED') {
    return 'border-alert/[0.35] bg-alert/10 text-alert';
  }
  if (status === 'REVIEW') {
    return 'border-amber-300/30 bg-amber-200/10 text-amber-200';
  }
  return 'border-emerald-300/30 bg-emerald-200/10 text-emerald-200';
};

const transactionRows = (transactionData, apiResponse) => [
  ['Transaction ID', transactionData?.transactionId || 'Awaiting payload'],
  ['Amount', transactionData ? `₹${transactionData.amount.toLocaleString('en-IN')}` : '--'],
  ['Location', transactionData?.location || '--'],
  ['Device', transactionData?.device || '--'],
  ['Risk Score', apiResponse ? `${apiResponse.riskScore}%` : '--'],
  ['Status', apiResponse?.status || 'Pending'],
];

export default function TransactionCard({ transactionData, apiResponse }) {
  const rows = transactionRows(transactionData, apiResponse);
  const status = apiResponse?.status || 'Pending';

  return (
    <motion.article
      className="glass-card min-h-[400px] p-7 md:min-h-[450px] md:p-9"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-center gap-3 text-[1.02rem] tracking-[0.18em] text-white/90">
          <TransactionIcon />
          <span>Incoming Transactions</span>
        </div>

        <div className="mt-9 grid gap-5 md:mt-12">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="flex items-start justify-between gap-5 border-b border-white/[0.06] pb-4 last:border-b-0 last:pb-0"
            >
              <p className="stat-label">{label}</p>
              {label === 'Status' ? (
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium tracking-[0.22em] ${getStatusTone(status)}`}
                >
                  {value}
                </span>
              ) : (
                <p className="stat-value text-right">{value}</p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-auto pt-10 text-sm leading-7 text-white/[0.54]">
          Input packet mirrors the transaction request body sent to the fraud engine.
        </div>
      </div>
    </motion.article>
  );
}
