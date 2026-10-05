import { Request, Response } from 'express';

// Live relative exchange rates base: USD
const CURRENCY_RATES: Record<string, { symbol: string; rate: number; name: string }> = {
  USD: { symbol: '$', rate: 1.0, name: 'US Dollar' },
  INR: { symbol: '₹', rate: 84.5, name: 'Indian Rupee' },
  EUR: { symbol: '€', rate: 0.92, name: 'Euro' },
  GBP: { symbol: '£', rate: 0.78, name: 'British Pound' },
  CAD: { symbol: 'C$', rate: 1.36, name: 'Canadian Dollar' },
  AUD: { symbol: 'A$', rate: 1.52, name: 'Australian Dollar' },
  SGD: { symbol: 'S$', rate: 1.34, name: 'Singapore Dollar' },
  AED: { symbol: 'AED ', rate: 3.67, name: 'UAE Dirham' },
  JPY: { symbol: '¥', rate: 154.0, name: 'Japanese Yen' },
};

export async function getCurrencies(_req: Request, res: Response): Promise<void> {
  res.json({
    success: true,
    data: {
      base: 'USD',
      updatedAt: new Date().toISOString(),
      currencies: CURRENCY_RATES,
    },
  });
}

export async function convertCurrency(req: Request, res: Response): Promise<void> {
  try {
    const amount = parseFloat(req.query.amount as string) || 0;
    const from = ((req.query.from as string) || 'USD').toUpperCase();
    const to = ((req.query.to as string) || 'INR').toUpperCase();

    const fromRate = CURRENCY_RATES[from]?.rate || 1.0;
    const toRate = CURRENCY_RATES[to]?.rate || 1.0;

    // Convert from origin to USD, then to target
    const amountInUsd = amount / fromRate;
    const convertedAmount = Math.round(amountInUsd * toRate * 100) / 100;

    res.json({
      success: true,
      data: {
        originalAmount: amount,
        fromCurrency: from,
        toCurrency: to,
        convertedAmount,
        rate: Math.round((toRate / fromRate) * 10000) / 10000,
        symbol: CURRENCY_RATES[to]?.symbol || '',
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Conversion failed' });
  }
}
