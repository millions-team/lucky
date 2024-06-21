import type { BaseProps } from './card.d';
import { useStoreProgramAccount } from '../store-data-access';

import { useGetToken } from '@/hooks';

export function InitVault({ storePda }: BaseProps) {
  const { initVault, storeQuery } = useStoreProgramAccount({ storePda });
  const { data: token } = useGetToken({
    mint: storeQuery.data?.mint,
  });

  if (storeQuery.isPending || !token) return null;
  if (!storeQuery.data?.mint) throw new Error('Incorrect Store Initialization');

  return (
    <div className="card-body items-center text-center justify-center">
      <div className="space-y-6">
        <h2 className="card-title justify-center text-3xl cursor-pointer">
          <span className="text-accent">{token.name}</span> Vault not
          initialized
        </h2>
        <div className="card-actions justify-around">
          <button
            className="btn btn-xs lg:btn-md btn-primary"
            onClick={() => initVault.mutateAsync()}
            disabled={initVault.isPending}
          >
            Initialize
          </button>
        </div>
      </div>
    </div>
  );
}
