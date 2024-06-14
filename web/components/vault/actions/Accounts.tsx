import { useEffect, useMemo } from 'react';
import { useOwnedToken } from '@/hooks';
import { getTokenVaultPDA } from '@lucky/anchor';

import { useCreateTokenAccount } from '@/components/account/account-data-access';
import { ExplorerLink } from '@/components/cluster/cluster-ui';
import { ellipsify } from '@/components/ui/ui-layout';

import type { AccountsProps } from './actions.d';

export function Accounts({
  token: { mint },
  player,
  onEnabled,
}: AccountsProps) {
  const vaultPDA = useMemo(() => getTokenVaultPDA(mint), [mint]);
  const { token, isLoading, refresh } = useOwnedToken(player, mint);
  const createAccount = useCreateTokenAccount({
    address: player,
    callback: refresh,
  });

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
          <div className="card max-w-md bg-base-100 my-8 border-2 border-accent">
            <div className="card-body">
              <h2 className="card-title">No Token Account</h2>
              <p>
                You need to create an account for this token before you can
                interact with the vault.
              </p>

              <div className="card-actions justify-end mt-8">
                <button
                  className="btn btn-primary"
                  onClick={() => createAccount.mutateAsync(mint)}
                >
                  Create Token Account
                </button>
              </div>
            </div>
          </div>
        ))}
    </>
  );
}
