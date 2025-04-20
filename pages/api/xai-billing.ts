// This API route simulates xAI billing via Vercel credits.
// It tracks a starting credit of $10.00 and increments spend as balance decreases.
import type { NextApiRequest, NextApiResponse } from 'next';

const STARTING_CREDITS = 10.00;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Use xAI or Vercel billing API
    const apiKey = process.env.XAI_API_KEY;
    // This endpoint is a placeholder. Replace with the actual endpoint from xAI/Vercel docs.
    const response = await fetch('https://api.x.ai/v1/billing/balance', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    const data = await response.json();
    // Try both 'balance' and 'credit' keys for compatibility
    const balance = parseFloat(data.balance || data.credit || '0');
    // If spend is not provided, just show balance
    let spend = null;
    if (typeof data.spend !== 'undefined') {
      spend = parseFloat(data.spend).toFixed(2);
    } else {
      spend = (STARTING_CREDITS - balance).toFixed(2);
    }
    res.status(200).json({
      balance: balance.toFixed(2),
      spend,
    });
  } catch (err) {
    res.status(200).json({
      balance: '',
      spend: '',
      error: 'Could not fetch live balance.'
    });
  }
}
