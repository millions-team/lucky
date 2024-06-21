import { useMemo } from 'react';

import type { BaseProps } from '../card.d';
import { useStoreProgramAccount } from '../../store-data-access';
import { DECIMALS } from '@/providers';

export function PriceUpdate({ storePda }: BaseProps) {
  const { update, storeQuery } = useStoreProgramAccount({
    storePda,
  });
  const price = useMemo(() => {
    if (!storeQuery.data?.price) return 0;
    return storeQuery.data.price / 10 ** DECIMALS;
  }, [storeQuery.data?.price]);

  return (
    <button
      className="btn btn-xs lg:btn-md btn-outline"
      onClick={() => {
        const value = Number(
          window.prompt('Update token price:', price.toString() ?? '0')
        );
        if (value === price || isNaN(value)) return;

        return update.mutateAsync(value * 10 ** DECIMALS);
      }}
      disabled={update.isPending}
    >
      Update Price
    </button>
  );
}
