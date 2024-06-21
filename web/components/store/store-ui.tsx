'use client';

import { PublicKey } from '@solana/web3.js';
import { useState } from 'react';

import { ellipsify } from '../ui/ui-layout';

import { useStoreProgram } from './store-data-access';
import { StoreCard } from './card';

import { type TokenAccount, useOwnedTokens } from '@/hooks';
import { DECIMALS } from '@/providers';

export function StoreCreate({ owner }: { owner: PublicKey }) {
  const { initialize } = useStoreProgram();
  const { tokens, refresh } = useOwnedTokens(owner);

  const [token, setToken] = useState<TokenAccount | undefined>(undefined);
  const [price, setPrice] = useState<number>(0);
  const [confirmed, setConfirm] = useState<boolean>(false);

  return confirmed ? (
    <button
      className="btn btn-xs lg:btn-md btn-primary"
      onClick={() => {
        if (!token || !price) return;
        const tokenMint = token.mint;
        const _price = BigInt(price * 10 ** DECIMALS);
        return initialize.mutateAsync({ tokenMint, price: _price });
      }}
      disabled={initialize.isPending}
    >
      Create {initialize.isPending && '...'}
    </button>
  ) : (
    <div className="space-y-4 flex flex-col justify-center items-center">
      <div className="flex items-center">
        <label htmlFor="tokenMint">
          Token Mint
          <select
            id="tokenMint"
            className="select select-bordered w-full max-w-xs"
            value={token?.mint.toString() ?? ''}
            onChange={(e) =>
              setToken(tokens.find((t) => t.mint.toString() === e.target.value))
            }
          >
            <option value={''}>Select a token</option>
            {tokens.map((token) => (
              <option key={token.mint.toString()} value={token.mint.toString()}>
                {token.name} | ({ellipsify(token.mint.toString())})
              </option>
            ))}
          </select>
        </label>
        <button
          className="btn btn-xs lg:btn-md btn-outline"
          onClick={() => refresh()}
        >
          Refresh
        </button>
      </div>
      <label className="form-control w-full max-w-xs">
        <div className="label">
          <span className="label-text">Token Price (${token?.symbol})</span>
          <span className="label-text-alt">USD/SOL</span>
        </div>
        <label className="input input-bordered flex items-center gap-2">
          USD
          <input
            type="number"
            placeholder="Price"
            className="grow"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
        </label>
        <div className="label">
          <span className="label-text-alt">Decimals</span>
          <span className="label-text-alt">{token?.decimals}</span>
        </div>
      </label>
      <button
        className="btn btn-xs lg:btn-md btn-primary"
        onClick={() => setConfirm(true)}
      >
        Continue
      </button>
    </div>
  );
}

export function StoreList() {
  const { stores, getProgramAccount } = useStoreProgram();

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
    <div className={'space-y-6'}>
      {stores.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : stores.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4 lg:p-8">
          {stores.data?.map((pda) => (
            <StoreCard
              key={pda.publicKey.toString()}
              storePda={pda.publicKey}
            />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No Stores</h2>
          No Stores found. Create one above to get started.
        </div>
      )}
    </div>
  );
}
