import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchTransactions } from '../lib/api';

const DatabaseIcon = () => (
  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
    <ellipse cx="10" cy="5" rx="7" ry="2.5" />
    <path d="M3 5v10c0 1.38 3.13 2.5 7 2.5s7-1.12 7-2.5V5" />
    <path d="M3 10c0 1.38 3.13 2.5 7 2.5s7-1.12 7-2.5" />
  </svg>
);

const formatLabel = (txn) => {
  const isIndian = (txn.source || '').includes('Indian');
  const flag = isIndian ? '\u{1F1EE}\u{1F1F3}' : '\u{1F30D}';
  const fraud = txn.isFraud === 1 ? '\u26A0\uFE0F FRAUD' : '\u2705 LEGIT';
  const currency = isIndian ? '\u20B9' : '$';
  const amount = Number(txn.amount || 0).toFixed(2);
  const loc = txn.location || txn.ipState || '—';
  return `${flag} ${fraud} — ${currency}${amount} — ${loc}`;
};

export default function TransactionPicker({ onSelect, disabled }) {
  const [transactions, setTransactions] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions().then((data) => {
      setTransactions(data);
      setLoading(false);
    });
  }, []);

  const handleChange = (e) => {
    const idx = e.target.value;
    setSelectedIdx(idx);
    if (idx !== '') {
      onSelect(transactions[Number(idx)]);
    }
  };

  return (
    <motion.div
      className="relative z-10 mt-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center gap-3 text-sm tracking-[0.18em] text-white/70 mb-3">
        <DatabaseIcon />
        <span>Pick a Transaction to Analyze</span>
      </div>

      <select
        value={selectedIdx}
        onChange={handleChange}
        disabled={disabled || loading}
        className="w-full max-w-[640px] appearance-none rounded-2xl border border-white/[0.12] bg-white/[0.04] px-5 py-3.5 text-sm tracking-[0.06em] text-white/90 outline-none backdrop-blur-sm transition duration-300 hover:border-white/[0.24] hover:bg-white/[0.08] focus:border-white/30 focus:ring-1 focus:ring-white/20 disabled:cursor-not-allowed disabled:opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff60' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 0.75rem center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '1.25em 1.25em',
        }}
      >
        <option value="" className="bg-[#0a0a12] text-white/60">
          {loading ? 'Loading...' : 'Select a transaction'}
        </option>
        {transactions.map((txn, i) => (
          <option key={i} value={i} className="bg-[#0a0a12] text-white/90">
            {formatLabel(txn)}
          </option>
        ))}
      </select>

      {selectedIdx !== '' && transactions[Number(selectedIdx)] && (
        <div className="mt-2 flex items-center gap-3">
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wider ${
              transactions[Number(selectedIdx)].isFraud === 1
                ? 'border-red-400/30 text-red-400'
                : 'border-emerald-300/30 text-emerald-300'
            }`}
          >
            Ground Truth: {transactions[Number(selectedIdx)].isFraud === 1 ? 'FRAUD' : 'LEGITIMATE'}
          </span>
          <span className="text-[10px] text-white/30 tracking-wider">
            {(transactions[Number(selectedIdx)].source || '').includes('Indian')
              ? 'Indian UPI Dataset'
              : 'Microsoft Dataset'}
          </span>
        </div>
      )}
    </motion.div>
  );
}
