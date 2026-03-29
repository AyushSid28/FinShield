import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import BackgroundEffects from './components/BackgroundEffects';
import Controls from './components/Controls';
import Hero from './components/Hero';
import Navbar from './components/Navbar';
import ReasoningCard from './components/ReasoningCard';
import TransactionCard from './components/TransactionCard';
import TransactionPicker from './components/TransactionPicker';
import { simulateTransaction } from './lib/api';

export default function App() {
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [transactionData, setTransactionData] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reasoningSteps, setReasoningSteps] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const cardsRef = useRef(null);
  const requestIdRef = useRef(0);

  const downloadPayload = useMemo(() => {
    if (!transactionData || !apiResponse) {
      return null;
    }

    return {
      transaction: transactionData,
      result: apiResponse,
      generatedAt: new Date().toISOString(),
    };
  }, [apiResponse, transactionData]);

  useEffect(() => {
    if (!apiResponse?.reasoning?.length) {
      setReasoningSteps([]);
      setIsTyping(false);
      return undefined;
    }

    setReasoningSteps([]);
    setIsTyping(true);

    const timers = apiResponse.reasoning.map((step, index) =>
      window.setTimeout(() => {
        setReasoningSteps((current) => [...current, step]);

        if (index === apiResponse.reasoning.length - 1) {
          setIsTyping(false);
        }
      }, 650 * (index + 1)),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [apiResponse]);

  const handleSelect = (txn) => {
    setSelectedTxn(txn);
    setApiResponse(null);
    setReasoningSteps([]);
  };

  const handleStart = async () => {
    if (loading) return;

    const txn = selectedTxn;
    if (!txn) return;

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setLoading(true);
    setReasoningSteps([]);
    setApiResponse(null);

    const payload = {
      transactionId: txn.transactionId,
      amount: txn.amount,
      location: txn.location || txn.ipState || '',
      device: txn.deviceId || 'unknown',
      customerId: txn.customerId,
      merchant: txn.merchant || 'Unknown',
      timestamp: txn.timestamp || new Date().toISOString(),
      deviceType: txn.deviceType || '',
      ipCountry: txn.ipCountry || '',
      isProxyIP: String(txn.isProxyIP ?? 'FALSE'),
      browserType: txn.browserType || '',
      paymentType: txn.paymentType || '',
      cvvResult: txn.cvvResult || '',
      shippingCountry: txn.shippingCountry || '',
      billingCountry: txn.billingCountry || '',
      accountAge: txn.accountAge ?? 0,
      recentRejects: txn.recentRejects ?? 0,
    };

    setTransactionData({ ...txn, ...payload });

    const response = await simulateTransaction(payload);

    if (requestIdRef.current !== requestId) return;

    setApiResponse(response);
    setLoading(false);

    setTimeout(() => {
      cardsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  };

  const handleReset = () => {
    requestIdRef.current += 1;
    setLoading(false);
    setSelectedTxn(null);
    setTransactionData(null);
    setApiResponse(null);
    setReasoningSteps([]);
    setIsTyping(false);
  };

  const handleSeeAction = () => {
    cardsRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const handleDownload = () => {
    if (!downloadPayload) return;

    const blob = new Blob([JSON.stringify(downloadPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${downloadPayload.transaction.transactionId}-fraud-report.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-shell relative isolate min-h-screen overflow-hidden bg-shell text-white">
      <BackgroundEffects />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1240px] flex-col px-5 pb-12 sm:px-8 md:px-10 lg:px-12">
        <Navbar canDownload={Boolean(downloadPayload)} onDownload={handleDownload} />

        <Hero onSeeAction={handleSeeAction} />

        <TransactionPicker onSelect={handleSelect} disabled={loading} />

        <Controls
          loading={loading}
          onStart={handleStart}
          onReset={handleReset}
          canStart={Boolean(selectedTxn)}
        />

        <section
          ref={cardsRef}
          className="relative z-10 mt-10 grid gap-8 pb-16 md:mt-12 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-7"
        >
          <TransactionCard transactionData={transactionData} apiResponse={apiResponse} />

          <motion.div
            aria-hidden="true"
            className="mx-auto hidden h-[5px] w-24 rounded-full bg-white/85 shadow-[0_0_24px_rgba(255,255,255,0.6)] lg:block"
            animate={{ opacity: [0.45, 1, 0.45], scaleX: [0.9, 1, 0.9] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          <ReasoningCard
            apiResponse={apiResponse}
            loading={loading}
            reasoningSteps={reasoningSteps}
            isTyping={isTyping}
          />
        </section>

        <footer className="relative z-10 mt-auto flex justify-center pt-8 text-center text-sm tracking-[0.42em] text-white/[0.74]">
          <p>&lt;/&gt; Proudly developed by Group 9</p>
        </footer>
      </div>
    </div>
  );
}
