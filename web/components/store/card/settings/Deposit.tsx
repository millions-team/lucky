import { useState } from 'react';
import { IconCubeSend } from '@tabler/icons-react';

import type { BaseProps } from '../card.d';
import { useStoreProgramAccount } from '../../store-data-access';

export function Deposit({ storePda }: BaseProps) {
  const { deposit, token } = useStoreProgramAccount({ storePda });
  const [amount, setAmount] = useState(0);

  return (
    token && (
      <label className="form-control flex-1 max-w-xs">
        <div className="label">
          <span className="label-text">Store Deposit</span>
          <span
            className="label-text-alt text-info cursor-pointer"
            onClick={() => setAmount(token.amount)}
          >
            {token.amount} {token.symbol}
          </span>
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
          <div className="tooltip tooltip-info" data-tip="Deposit">
            <IconCubeSend
              className={`icon rounded-full ${
                amount ? 'cursor-pointer hover:text-primary' : 'text-neutral'
              }`}
              onClick={() =>
                amount &&
                deposit.mutate(BigInt(amount) * BigInt(10 ** token.decimals))
              }
            />
          </div>
        </label>
        <div className="label">
          <span className="label-text-alt">Decimals</span>
          <span className="label-text-alt">{token.decimals}</span>
        </div>
      </label>
    )
  );
}
