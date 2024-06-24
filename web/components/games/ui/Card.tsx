import { useMemo, useState } from 'react';
import { PublicKey } from '@solana/web3.js';

import { ExplorerLink } from '@/components/cluster/cluster-ui';
import { ellipsify } from '@/components/ui/ui-layout';
import { decodeName } from '@luckyland/anchor';

import { useGameAccount } from '../games-data-access';
import { SettingsForm } from './SettingsForm';
import { GameMode } from './Mode';
import { StateSwitch } from './StateSwitch';

export function GameCard({
  pda,
  modes,
}: {
  pda: PublicKey;
  modes: Array<{ publicKey: PublicKey }>;
}) {
  const { isOwner, gameQuery, createGameMode } = useGameAccount({
    pda,
    callback: () => setAdd(false),
  });
  const [add, setAdd] = useState(false);

  const name = useMemo(
    () =>
      gameQuery.data?.name ? decodeName(gameQuery.data.name) : 'Game Details',
    [gameQuery.data?.name]
  );

  return add && isOwner ? (
    <SettingsForm
      title={`Add New Mode`}
      subtitle={name}
      onSubmit={async (settings) => {
        await createGameMode(settings);
      }}
      onCancel={() => setAdd(false)}
    />
  ) : (
    <div className="card card-bordered border-accent border-4 text-neutral-content max-w-xl w-full">
      <div className="card-body items-center text-center">
        <div className="space-y-6">
          <h2 className="card-title justify-center text-3xl">
            {name}
            <div className="absolute top-0 p-4 w-full">
              <StateSwitch pda={pda} />
            </div>
          </h2>

          <div className="flex flex-col items-center gap-4">
            <p className="tooltip tooltip-primary" data-tip="Game">
              <ExplorerLink
                path={`account/${pda}`}
                label={ellipsify(pda.toString())}
              />
            </p>
            {isOwner && (
              <button
                className="btn btn-xs btn-info btn-outline"
                onClick={() => setAdd(true)}
              >
                + Add Mode
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-4 justify-around items-center">
            {modes.map(({ publicKey }, i) => (
              <GameMode key={i} pda={publicKey} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
