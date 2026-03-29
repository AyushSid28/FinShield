import { motion } from 'framer-motion';

const TransactionIcon = () => (
  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M5 5.5h10v9H5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.5 14.5L5 11" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 11h10" strokeLinecap="round" />
  </svg>
);

const getStatusTone = (status) => {
  if (status === 'FLAGGED') return 'border-alert/[0.35] bg-alert/10 text-alert';
  if (status === 'REVIEW') return 'border-amber-300/30 bg-amber-200/10 text-amber-200';
  return 'border-emerald-300/30 bg-emerald-200/10 text-emerald-200';
};

const formatAmount = (amount) => {
  if (!amount) return '--';
  return `$${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
};

const hasValue = (v) =>
  v != null && v !== '' && v !== 'Unknown' && v !== 'unknown' && v !== 'nan' && v !== 'N/A';

const transactionRows = (data, response) => {
  if (!data) {
    return [
      ['Transaction ID', 'Awaiting payload'],
      ['Amount', '--'],
      ['Location', '--'],
      ['Device', '--'],
      ['Risk Score', '--'],
      ['Status', 'Pending'],
    ];
  }

  const rows = [
    ['Transaction ID', data.transactionId || '--'],
    ['Customer', data.customerId ? `...${data.customerId.slice(-6)}` : null],
    ['Amount', formatAmount(data.amount)],
  ];

  const loc = hasValue(data.location) ? data.location : hasValue(data.ipState) ? data.ipState : null;
  if (loc) rows.push(['Location', loc]);

  if (hasValue(data.ipCountry)) rows.push(['IP Country', data.ipCountry.toUpperCase()]);

  const devParts = [data.deviceType, data.browserType].filter(hasValue);
  if (devParts.length > 0) rows.push(['Device', devParts.join(' / ')]);

  if (hasValue(data.paymentType)) rows.push(['Payment', data.paymentType]);
  if (hasValue(data.cardType)) rows.push(['Card', data.cardType]);
  if (hasValue(data.cvvResult)) rows.push(['CVV', data.cvvResult]);

  if (data.accountAge != null) rows.push(['Acct Age', `${data.accountAge}d`]);

  rows.push(['Risk Score', response ? `${response.riskScore}%` : '--']);
  rows.push(['Status', response?.status || 'Pending']);

  return rows;
};

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
          <span>Incoming Transaction</span>
        </div>

        <div className="mt-9 grid gap-5 md:mt-12">
          {rows.map(([label, value]) =>
            value == null ? null : (
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
            ),
          )}
        </div>

        <div className="mt-auto pt-10 text-sm leading-7 text-white/[0.54]">
          Source: Microsoft R-Server Fraud Detection Dataset
        </div>
      </div>
    </motion.article>
  );
}
