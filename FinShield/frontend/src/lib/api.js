import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 120000,
});

export const fetchTransactions = async () => {
  try {
    const response = await client.get('/api/transactions');
    return response.data;
  } catch {
    return [];
  }
};

export const simulateTransaction = async (payload) => {
  try {
    const response = await client.post('/api/transaction', payload);
    return response.data;
  } catch {
    return {
      riskScore: 50,
      status: 'REVIEW',
      reasoning: ['Pipeline unavailable — using client fallback'],
      verdict: 'Manual Review Recommended',
      confidence: 55,
      explanation: 'Could not reach the backend pipeline.',
      pipelineUsed: false,
    };
  }
};
