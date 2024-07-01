import type { BaseProps } from '../card.d';

import { PriceUpdate } from './PriceUpdate';
import { CloseStore } from './CloseStore';
import { Accounts } from './Accounts';
import { Deposit } from './Deposit';
import { Withdraw } from './Withdraw';

export function Settings({ storePda }: BaseProps) {
  return (
    <>
      <Accounts storePda={storePda} />

      <div className="card-actions flex-col justify-center items-center">
        <PriceUpdate storePda={storePda} />
        <div className="flex flex-wrap gap-8 justify-center">
          <Deposit storePda={storePda} />
          <Withdraw storePda={storePda} />
        </div>
        <CloseStore storePda={storePda} />
      </div>
    </>
  );
}
