import { useMemo, useState } from 'react';
import { PublicKey } from '@solana/web3.js';

import { decodeName } from '@luckyland/anchor';
import { ExplorerLink } from '@/components/cluster/cluster-ui';
import { ellipsify } from '@/components/ui/ui-layout';

import { SettingsForm } from './SettingsForm';
import { useGamesProgramAccount } from '../games-data-access';

export function GamesCard({ account }: { account: PublicKey }) {
  const { gameQuery, update, close } = useGamesProgramAccount({
    game: account,
  });
  const [enableForm, setEnableForm] = useState(false);

  const data = useMemo(() => gameQuery.data, [gameQuery.data]);
  const name = useMemo(
    () => (data?.name ? decodeName(data.name) : 'Game Settings'),
    [data?.name]
  );

  return gameQuery.isPending || !data ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : enableForm ? (
    <SettingsForm
      className="lg:m-8"
      settings={data}
      onSubmit={async (settings) => {
        await update.mutateAsync(settings);
        setEnableForm(false);
      }}
      onCancel={() => setEnableForm(false)}
    />
  ) : (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content">
      <div className="card-body items-center text-center">
        <div className="space-y-6">
          <h2
            className="card-title justify-center text-3xl cursor-pointer"
            onClick={() => gameQuery.refetch()}
          >
            {gameQuery.isLoading ? (
              <span className="loading loading-dots loading-lg"></span>
            ) : (
              name
            )}
          </h2>

          <ul className="flex flex-wrap justify-around text-start gap-4">
            <li className="text-lg">
              Slots: <span className="text-info">{data.slots}</span>
            </li>
            <li className="text-lg">
              Digits: <span className="text-info">{data.digits}</span>
            </li>
            <li className="text-lg">
              Choices: <span className="text-info">{data.choices}</span>
            </li>
            <li className="text-lg">
              {data.pickWinner ? 'Default Winner' : 'Winner'}:{' '}
              <span className="text-info">{data.winnerChoice}</span>
            </li>

            <li className="text-lg">
              Pick Winner:{' '}
              <span className="text-info">
                {data.pickWinner ? 'Yes' : 'No'}
              </span>
            </li>
          </ul>
          <div className="card-actions justify-around">
            <button
              className="btn btn-xs lg:btn-md btn-outline"
              onClick={() => setEnableForm(!enableForm)}
              disabled={update.isPending}
            >
              Update
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
                return close.mutateAsync();
              }}
              disabled={close.isPending}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
