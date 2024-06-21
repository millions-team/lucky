import { useState } from 'react';
import { IconMoneybag } from '@tabler/icons-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

import type { BaseProps } from '../card.d';
import { useStoreProgramAccount } from '../../store-data-access';

import { BalanceSol } from '@/components/account/account-ui';
import { useGetBalance } from '@/components/account/account-data-access';
import { useWallet } from '@solana/wallet-adapter-react';

export function Withdraw({ storePda }: BaseProps) {
  const { publicKey } = useWallet();
  if (!publicKey) throw new Error('Wallet not connected');

  const balance = useGetBalance({ address: publicKey });
  const { withdraw, balanceQuery } = useStoreProgramAccount({
    storePda,
    callback: () => balance.refetch(),
  });

  const [amount, setAmount] = useState(0);

  return (
    <label className="form-control w-full max-w-xs">
      <div className="label">
        <span className="label-text">Available</span>
        {balanceQuery.isLoading || !balanceQuery.data ? (
          <span className="loading loading-ring loading-sm"></span>
        ) : (
          <span
            className="label-text-alt text-info cursor-pointer"
            onClick={() => setAmount(balanceQuery.data / LAMPORTS_PER_SOL)}
          >
            <BalanceSol balance={balanceQuery.data} /> SOL
          </span>
        )}
      </div>
      <label className="input input-bordered flex items-center gap-2">
        SOL
        <input
          type="number"
          placeholder="Amount"
          className="grow"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <div className="tooltip tooltip-info" data-tip="Withdraw">
          <IconMoneybag
            className={`icon rounded-full ${
              amount ? 'cursor-pointer hover:text-primary' : 'text-neutral'
            }`}
            onClick={() =>
              amount && withdraw.mutate(BigInt(amount * LAMPORTS_PER_SOL))
            }
          />
        </div>
      </label>
      <div className="label">
        <span className="label-text-alt">Balance</span>
        {balance.isLoading || !balance.data ? (
          <span className="loading loading-ring loading-sm"></span>
        ) : (
          <span className="label-text-alt">
            <BalanceSol balance={balance.data} /> SOL
          </span>
        )}
      </div>
    </label>
  );
}
