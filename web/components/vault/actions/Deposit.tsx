import { useState } from 'react';
import { useOwnedToken } from '@/hooks';

import { useVaultProgram } from '../vault-data-access';
import type { ActionsProps } from './actions';

export function Deposit({ token, player, balance, onCompleted }: ActionsProps) {
  const { token: OwnedToken, refresh } = useOwnedToken(player, token.mint);
  const { deposit } = useVaultProgram({
    callback: () => refresh().then(onCompleted),
  });
  const [amount, setAmount] = useState(0);
  const image = token?.metadata?.image || './favicon.ico';

  return (
    <div className="card lg:card-side bg-base-200 shadow-xl my-8">
      <figure className="bg-base-300 relative lg:w-36">
        <img src={image} alt="Album" className="w-16" />
        <span className="absolute h-6 w-full right-0 bottom-2 text-accent font-bold text-end pr-2">
          {Intl.NumberFormat('en-US', {}).format(balance)}
        </span>
      </figure>
      <div className="card-body">
        <h2 className="card-title">Storing {token.name}</h2>
        <p>Transfer {token.name} into the vault</p>

        <form action="">
          <div className="form-control">
            <label className="label flex flex-row justify-between">
              <span className="label-text">Amount</span>
              <span
                className="text-xs text-info cursor-pointer"
                onClick={() => setAmount(OwnedToken?.amount || 0)}
              >
                {Intl.NumberFormat('en-US', {}).format(OwnedToken?.amount || 0)}
                {' $'}
                {token.symbol}
              </span>
            </label>
            <input
              type="number"
              placeholder="Amount to store"
              className="input input-bordered input-info"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
        </form>

        <div className="card-actions justify-end">
          <button
            className="btn btn-primary"
            onClick={() =>
              deposit.mutateAsync({
                mint: token.mint,
                amount: BigInt(amount) * BigInt(10 ** token.decimals),
                sender: player,
              })
            }
          >
            Transfer
          </button>
        </div>
      </div>
    </div>
  );
}
