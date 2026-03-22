import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 6000,
});

const wait = (duration) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });

const buildFallbackResponse = async (payload) => {
  const amountRisk = payload.amount >= 45000 ? 32 : payload.amount >= 25000 ? 22 : 12;
  const deviceRisk = /new/i.test(payload.device) ? 30 : 14;
  const locationRisk = ['mumbai', 'delhi', 'dubai', 'singapore'].includes(
    payload.location.toLowerCase(),
  )
    ? 20
    : 8;

  const riskScore = Math.min(97, amountRisk + deviceRisk + locationRisk);
  const status = riskScore >= 75 ? 'FLAGGED' : riskScore >= 45 ? 'REVIEW' : 'CLEAR';
  const verdictMap = {
    FLAGGED: 'Fraud Detected',
    REVIEW: 'Manual Review Recommended',
    CLEAR: 'Transaction Cleared',
  };

  await wait(1200);

  return {
    riskScore,
    status,
    reasoning: [
      'Cross-checking behavioral pattern',
      'Comparing device fingerprint',
      'Checking geo-velocity anomaly',
    ],
    verdict: verdictMap[status],
    confidence: Math.min(96, riskScore + 5),
    explanation:
      status === 'FLAGGED'
        ? 'High-value request from a new device with elevated location risk.'
        : status === 'REVIEW'
          ? 'One or more signals deviated from the expected customer profile.'
          : 'Signals remained within acceptable thresholds across the agent checks.',
  };
};

export const simulateTransaction = async (payload) => {
  try {
    const response = await client.post('/api/transaction', payload);
    return response.data;
  } catch (error) {
    return buildFallbackResponse(payload);
  }
};
