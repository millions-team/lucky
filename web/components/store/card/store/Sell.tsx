import { useMemo, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { IconExchange } from '@tabler/icons-react';

import type { BaseProps } from '../card';
import { useStoreProgramAccount } from '../../store-data-access';

import { DECIMALS, useDataFeed } from '@/providers';
import { useGetBalance } from '@/components/account/account-data-access';
import { BalanceSol } from '@/components/account/account-ui';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export function Sell({ storePda }: BaseProps) {
  const { publicKey } = useWallet();
  if (!publicKey) throw new Error('Wallet not connected');

  const balance = useGetBalance({ address: publicKey });
  const { sell, token, storeQuery, vaultQuery } = useStoreProgramAccount({
    storePda,
    callback: () => balance.refetch(),
  });
  const [amount, setAmount] = useState(0);

  const dataFeed = useDataFeed();
  const gas = useMemo(
    () => (dataFeed?.answer ? 1 / (dataFeed.answer.toNumber() / DECIMALS) : 0),
    [dataFeed?.answer]
  );

  return (
    token && (
      <label className="form-control w-full max-w-xs">
        <div className="label">
          <span className="label-text">Buy</span>
          {balance.isPending || !balance.data ? (
            <span className="loading loading-ball loading-xs"></span>
          ) : (
            <span
              className="label-text-alt text-info cursor-pointer"
              onClick={() => {
                if (
                  !dataFeed?.answer ||
                  !storeQuery.data?.price ||
                  !vaultQuery.data?.amount ||
                  !balance.data
                )
                  return;
                const rate =
                  storeQuery.data.price.toNumber() / dataFeed.answer.toNumber();
                const amount = balance.data / LAMPORTS_PER_SOL - gas;
                const max = amount / rate;
                const { amount: vaultBalance } = vaultQuery.data;

                setAmount(
                  Math.min(Math.round(max * 10000) / 10000, vaultBalance)
                );
              }}
            >
              <BalanceSol balance={balance.data} /> SOL
            </span>
          )}
        </div>
        <label className="input input-bordered flex items-center gap-2">
          {token.symbol}
          <input
            type="number"
            placeholder="Amount"
            className="grow"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <div className="tooltip tooltip-info" data-tip="Buy">
            <IconExchange
              className={`icon rounded-full ${
                amount ? 'cursor-pointer hover:text-primary' : 'text-neutral'
              }`}
              onClick={() => {
                const _amount = amount * 10 ** token.decimals;
                return sell.mutate(BigInt(_amount));
              }}
            />
          </div>
        </label>
        <div className="label">
          <span className="label-text-alt">Balance</span>
          <span className="label-text-alt">
            {Intl.NumberFormat('en-US').format(token.amount)} {token.symbol}
          </span>
        </div>
      </label>
    )
  );
}
