import { useMemo } from 'react';

import type { BaseProps } from './card.d';
import { useStoreProgramAccount } from '../store-data-access';
import { InitVault } from './InitVault';

import { ExplorerLink } from '@/components/cluster/cluster-ui';
import { Price } from '@/components/shared';

export function Layout({
  storePda,
  children,
}: BaseProps & { children: React.ReactNode }) {
  const { storeQuery, vaultQuery, vaultPDA, isOwner } = useStoreProgramAccount({
    storePda,
  });

  const token = useMemo(() => vaultQuery.data, [vaultQuery.data]);
  const balance = useMemo(() => token?.amount || 0, [token?.amount]);
  const image = token?.metadata?.image || './favicon.ico';

  if (!vaultQuery.isPending && !token && !isOwner) return null;

  return (
    <div className="card card-bordered lg:card-side border-accent border-4 text-neutral-content bg-base-100">
      {!storeQuery.data || vaultQuery.isPending ? (
        <div className="card-body justify-center items-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : !token ? (
        <InitVault storePda={storePda} />
      ) : (
        <>
          <div className="bg-base-300 flex flex-col justify-between lg:w-36 min-h-48 h-full p-2 gap-8">
            <span className="text-primary font-bold text-center">
              {token.symbol}
            </span>
            <figure>
              <img src={image} alt="Album" className="w-16" />
            </figure>
            <span
              className="tooltip text-end tooltip-right tooltip-accent"
              data-tip="Vault"
            >
              <ExplorerLink
                path={`account/${vaultPDA}`}
                label={Intl.NumberFormat('en-US', {}).format(balance)}
                className="text-accent font-bold link"
              />
            </span>
          </div>
          <div className="card-body">
            <h2
              className="card-title text-secondary justify-between"
              onClick={() => storeQuery.refetch()}
            >
              <span
                className="tooltip tooltip-left tooltip-info"
                data-tip="Store"
              >
                <Price amount={storeQuery.data?.price} symbol={token.symbol} />
              </span>
              <span className="tooltip tooltip-primary" data-tip="Mint">
                <ExplorerLink
                  path={`account/${token.mint}`}
                  label={token.name}
                  className="text-3xl text-primary font-bold link"
                />
              </span>
            </h2>

            {children}
          </div>
        </>
      )}
    </div>
  );
}
