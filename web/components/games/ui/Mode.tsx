import { useMemo, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import {
  IconColorSwatch,
  IconColorSwatchOff,
  IconEdit,
  IconInfoOctagon,
  IconTrash,
} from '@tabler/icons-react';

import { ExplorerLink } from '@/components/cluster/cluster-ui';
import { ellipsify } from '@/components/ui/ui-layout';
import { useGameModeAccount } from '@/hooks';

import { SettingsForm } from './SettingsForm';

export function GameMode({ pda }: { pda: PublicKey }) {
  const { isOwner, modeQuery, update, close } = useGameModeAccount({ pda });
  const data = useMemo(() => modeQuery.data, [modeQuery.data]);
  const [enableForm, setEnableForm] = useState(false);

  return enableForm ? (
    <SettingsForm
      settings={data}
      onSubmit={async (settings) => {
        await update.mutateAsync(settings);
        setEnableForm(false);
      }}
      onCancel={() => setEnableForm(false)}
    />
  ) : (
    <div className="card border-4 border-base-300">
      {data ? (
        <div className="card-body">
          <div
            className={`card-title badge badge-outline uppercase badge-info py-4 text-xl`}
          >
            <span
              className="mr-2 tooltip tooltip-left tooltip-info"
              data-tip={`Pick Winner: ${data.pickWinner ? 'Yes' : 'No'}`}
            >
              {data.pickWinner ? <IconColorSwatch /> : <IconColorSwatchOff />}
            </span>
            <div className="space-x-2">
              <span
                className="tooltip tooltip-info cursor-default"
                data-tip={'Slots'}
              >
                {data.slots}
              </span>
              <span className="cursor-none">x</span>
              <span
                className="tooltip tooltip-info cursor-default"
                data-tip={'Choices'}
              >
                {data.choices}
              </span>
            </div>
            <span
              className="ml-2 tooltip tooltip-right tooltip-info"
              data-tip={
                (data.pickWinner ? 'Default Winner: ' : 'Winner: ') +
                data.winnerChoice
              }
            >
              <IconInfoOctagon />
            </span>
          </div>

          {isOwner && (
            <>
              <button
                className="absolute top-2 left-2 btn btn-xs btn-circle tooltip tooltip-right tooltip-primary"
                onClick={() => setEnableForm(!enableForm)}
                disabled={update.isPending}
                data-tip="Update"
              >
                <IconEdit />
              </button>

              <div
                className="absolute top-2 right-2 tooltip tooltip-left tooltip-error"
                data-tip="Delete"
              >
                <button
                  className=" btn btn-xs btn-circle btn-error btn-outline"
                  onClick={() => {
                    if (
                      !window.confirm(
                        'Are you sure you want to delete this game mode?'
                      )
                    ) {
                      return;
                    }
                    return close.mutateAsync();
                  }}
                  disabled={close.isPending}
                >
                  <IconTrash size={16} />
                </button>
              </div>
            </>
          )}

          <h3
            className="tooltip tooltip-primary tooltip-left text-xs absolute bottom-2 right-2"
            data-tip="Mode"
          >
            <ExplorerLink
              path={`account/${pda}`}
              label={ellipsify(pda.toString())}
            />
          </h3>
        </div>
      ) : (
        <span className="loading loading-ball loading-lg"></span>
      )}
    </div>
  );
}
