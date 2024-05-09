'use client';

import { PublicKey } from '@solana/web3.js';
import { useMemo } from 'react';
import { ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import {
  useDealerProgram,
  useDealerProgramAccount,
} from './dealer-data-access';
import { getDealerPDA } from '@lucky/anchor';

export function DealerCreate({ account }: { account: PublicKey }) {
  const { initialize } = useDealerProgram();

  return (
    <button
      className="btn btn-xs lg:btn-md btn-primary"
      onClick={() => initialize.mutateAsync(account)}
      disabled={initialize.isPending}
    >
      Create {initialize.isPending && '...'}
    </button>
  );
}

export function DealerList({ publicKey }: { publicKey: PublicKey }) {
  const pda = useMemo(() => getDealerPDA(publicKey), [publicKey]);
  const { accounts, getProgramAccount } = useDealerProgram();

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
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <DealerCard
              key={account.publicKey.toString()}
              account={account.publicKey}
              owned={account.publicKey.equals(pda)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  );
}

function DealerCard({
  account,
  owned = false,
}: {
  account: PublicKey;
  owned: boolean;
}) {
  const { accountQuery, getMutation, closeMutation } = useDealerProgramAccount({
    account,
  });

  const data = useMemo(() => accountQuery.data, [accountQuery.data]);

  return accountQuery.isLoading || !data ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div
      className={`card card-bordered border-4 text-neutral-content ${
        owned ? 'border-accent' : 'border-base-300'
      }`}
    >
      <div className="card-body items-center text-center relative">
        <div className="badge absolute right-0 top-0 badge-primary m-4 badge-lg">
          {data.count}
        </div>
        <div className="space-y-6">
          <h2
            className="card-title justify-center text-3xl cursor-pointer"
            onClick={() => accountQuery.refetch()}
          >
            {data.lastValue.toString()}
          </h2>
          <div className="card-actions justify-around">
            <button
              className="btn btn-xs lg:btn-md btn-outline"
              onClick={() => getMutation.mutateAsync()}
              disabled={getMutation.isPending}
            >
              Roll
            </button>
          </div>
          <div className="text-center space-y-4">
            <p>
              <ExplorerLink
                path={`account/${account}`}
                label={ellipsify(account.toString())}
              />
            </p>
            <button
              className="btn btn-xs btn-secondary btn-outline"
              onClick={() => {
                if (
                  !window.confirm(
                    'Are you sure you want to close this account?'
                  )
                ) {
                  return;
                }
                return closeMutation.mutateAsync();
              }}
              disabled={closeMutation.isPending}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
