import { useEffect, useMemo } from 'react';
import { useOwnedToken } from '@/hooks';
import { getStrongholdPDA } from '@luckyland/anchor';

import { ExplorerLink } from '@/components/cluster/cluster-ui';
import { ellipsify } from '@/components/ui/ui-layout';

import type { AccountsProps } from './actions';
import { CreateTokenAccount } from '@/components/shared';

export function Accounts({
  token: { mint },
  player,
  onEnabled,
}: AccountsProps) {
  const vaultPDA = useMemo(() => getStrongholdPDA(mint), [mint]);
  const { token, isLoading, refresh } = useOwnedToken(player, mint);
  useEffect(() => onEnabled(Boolean(token)), [token]);

  return (
    <>
      <ul className="flex flex-row gap-8 items-center justify-center my-6">
        <li className="tooltip tooltip-secondary" data-tip="Vault Account">
          <ExplorerLink
            path={`account/${vaultPDA}`}
            label={ellipsify(vaultPDA.toString())}
          />
        </li>
        {token && (
          <li className="tooltip tooltip-info" data-tip="Wallet Account">
            <ExplorerLink
              path={`account/${token.address}`}
              label={ellipsify(token.address.toString())}
            />
          </li>
        )}
      </ul>
      {!token &&
        (isLoading ? (
          <span className="loading loading-ball loading-lg"></span>
        ) : (
          <CreateTokenAccount
            mint={mint}
            onChange={(success) => success && refresh()}
          />
        ))}
    </>
  );
}
