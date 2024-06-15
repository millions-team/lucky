'use client';

import { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';

import { useVaultProgram } from './vault-data-access';

import { type Token, useOwnedTokens } from '@/hooks';
import { ExplorerLink } from '@/components/cluster/cluster-ui';
import { ellipsify } from '@/components/ui/ui-layout';
import { VaultActions } from './actions';

const { NEXT_PUBLIC_OWNER = '6nmrVvmrDD61cmHu3MqPMekT9APaZMC1x7yuokKxPYWs' } =
  process.env;
if (!NEXT_PUBLIC_OWNER) throw new Error('NEXT_PUBLIC_OWNER is not set');

const TOKENS_OWNER = new PublicKey(NEXT_PUBLIC_OWNER);

export function VaultProgram({ player }: { player: PublicKey }) {
  const { getProgramAccount } = useVaultProgram();
  const { tokens } = useOwnedTokens(TOKENS_OWNER);
  const [token, setToken] = useState<Token>(tokens[0] || { address: '_label' });

  useEffect(() => {
    if (!tokens.length || token.address === '_label') return;

    const selected = tokens.find(
      ({ address }) => address === token.address
    ) || { address: '_label' };

    setToken(selected as Token);
  }, [tokens]);

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>
          Program account not found. Make sure you have deployed the program and
          are on the correct cluster.
        </span>
      </div>
    );
  }
  return (
    <div className="flex flex-col justify-center items-center">
      <select
        className="select select-bordered w-full max-w-xs"
        value={token.address}
        onChange={(e) => {
          if (e.target.value === '_label') return;
          const selected = tokens.find(
            ({ address }) => address === e.target.value
          );
          if (selected) setToken(selected);
        }}
      >
        <option disabled value="_label">
          Select a TOKEN
        </option>
        {tokens.map(({ name, symbol, amount, address, mint }) => (
          <option key={mint.toString()} value={address}>
            {name} | {amount} ${symbol}
          </option>
        ))}
      </select>

      {token.address !== '_label' && (
        <>
          <div className="tooltip tooltip-primary my-4" data-tip="Mint">
            <ExplorerLink
              path={`account/${token.mint}`}
              label={ellipsify(token.mint.toString())}
            />
          </div>
          <VaultActions token={token} player={player} />
        </>
      )}
    </div>
  );
}
