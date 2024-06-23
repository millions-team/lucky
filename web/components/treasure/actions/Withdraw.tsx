import { useState } from 'react';
import { useOwnedToken } from '@/hooks';

import type { ActionsProps } from './actions';
import { useTreasureProgram } from '../treasure-data-access';

export function Withdraw({
  token,
  player,
  balance,
  onCompleted,
}: ActionsProps) {
  const { token: OwnedToken, refresh } = useOwnedToken(player, token.mint);
  const { withdraw } = useTreasureProgram({
    callback: () => refresh().then(onCompleted),
  });
  const [amount, setAmount] = useState(0);
  const image = token?.metadata?.image || './favicon.ico';

  return (
    <div className="card lg:card-side bg-base-200 shadow-xl my-8">
      <div className="card-body">
        <h2 className="card-title">Withdrawing {token.name}</h2>
        <p>Transfer {token.name} out of the stronghold</p>

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
              placeholder="Amount to withdraw"
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
              withdraw.mutateAsync({
                mint: token.mint,
                amount: BigInt(amount) * BigInt(10 ** token.decimals),
                sender: player,
              })
            }
          >
            Retrieve
          </button>
        </div>
      </div>
      <figure className="bg-base-300 relative lg:w-36">
        <img src={image} alt="Album" className="w-16" />
        <div className="absolute w-full h-6 right-0 top-2 text-accent font-bold pr-2 text-end">
          {Intl.NumberFormat('en-US', {}).format(balance)}
        </div>
      </figure>
    </div>
  );
}
