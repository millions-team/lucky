import { PublicKey } from '@solana/web3.js';
import { useGameAccount } from '../games-data-access';
import { useMemo } from 'react';
import {
  IconPlayerPause,
  IconPlayerPlay,
  IconPower,
  IconTrash,
} from '@tabler/icons-react';

export function StateSwitch({ pda }: { pda: PublicKey }) {
  const { isOwner, gameQuery, activate, pause, end, close } = useGameAccount({
    pda,
  });
  const data = useMemo(() => gameQuery.data, [gameQuery.data]);

  const stateMap = {
    error: { badge: 'badge-error', actions: [] },
    created: {
      badge: 'badge-warning',
      actions: [
        {
          name: 'Activate',
          action: activate,
          Icon: IconPlayerPlay,
          color: 'btn-success',
        },
      ],
    },
    active: {
      badge: 'badge-success',
      actions: [
        {
          name: 'Pause',
          action: pause,
          Icon: IconPlayerPause,
          color: 'btn-warning',
        },
      ],
    },
    paused: {
      badge: 'badge-secondary',
      actions: [
        {
          name: 'Activate',
          action: activate,
          Icon: IconPlayerPlay,
          color: 'btn-success',
        },
        {
          name: 'Power Off',
          action: end,
          Icon: IconPower,
          color: 'btn-error',
        },
      ],
    },
    ended: {
      badge: 'badge-error',
      actions: [
        {
          name: 'Delete',
          action: close,
          Icon: IconTrash,
          color: 'btn-ghost-error',
        },
      ],
    },
  };

  const state = useMemo(
    () => Object.keys(data?.state || { error: {} })[0] as keyof typeof stateMap,
    [data?.state]
  );

  return !data ? (
    <span className="loading loading-dots loading-xs"></span>
  ) : (
    <div className="flex gap-2 justify-between items-center">
      <span
        className={`badge badge-outline uppercase ${stateMap[state].badge}`}
      >
        {state}
      </span>

      {state !== 'error' && isOwner && (
        <div className="flex gap-1">
          {stateMap[state].actions.map(({ name, action, Icon, color }) => (
            <div key={name} className="tooltip" data-tip={name}>
              <button
                className={`btn btn-sm btn-circle ${color} btn-outline`}
                onClick={() => action.mutateAsync()}
              >
                <Icon size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
