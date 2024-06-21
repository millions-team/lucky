'use client';

import { useMemo, useState } from 'react';
import { BN } from '@coral-xyz/anchor';

import { DECIMALS, useDataFeed } from '@/providers';

type PriceProps = {
  amount: BN; // Amount of the price in lamports
  symbol: string; // Symbol of the token
  className?: string;
};

const symbolMap: Record<string, string> = {
  USD: 'SOL',
  SOL: 'USD',
};
export function Price({ amount, symbol, className = '' }: PriceProps) {
  const [pair, setPair] = useState('USD');
  const dataFeed = useDataFeed();

  const value = useMemo(() => {
    if (!dataFeed?.answer && pair === 'SOL') return null;
    if (pair === 'USD') return amount / 10 ** DECIMALS;

    const rate = dataFeed.answer;
    const price = amount / rate;
    return Math.round(price * 100000) / 100000;
  }, [dataFeed?.answer, pair, amount]);

  return value === null ? (
    <span className="loading loading-ring loading-xs"></span>
  ) : (
    <span
      className={'cursor-pointer ' + className}
      onClick={() => setPair((prevState) => symbolMap[prevState])}
    >
      {value.toString()}
      <span className="text-sm ml-2">
        {pair}/{symbol}
      </span>
    </span>
  );
}
