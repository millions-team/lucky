import type { BaseProps } from '../card.d';

import { Sell } from './Sell';

export function Store({ storePda }: BaseProps) {
  return (
    <div className="card-actions justify-around">
      <Sell storePda={storePda} />
    </div>
  );
}
