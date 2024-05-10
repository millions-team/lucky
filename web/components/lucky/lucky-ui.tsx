'use client';

import { PublicKey } from '@solana/web3.js';
import { useMemo, useState } from 'react';
import { ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import { useLuckyProgram, useLuckyProgramAccount } from './lucky-data-access';
import { DealerOptions, getLuckyPlayerPDA } from '@lucky/anchor';
import { IconCashBanknote, IconSparkles } from '@tabler/icons-react';

const BOUNTY = 20000;
const MIN_CHOICES = 4;
const DIGITS = 6;
const POWER_MULTIPLIER = 5;

type Slot = Omit<DealerOptions, 'luckyShoot'> & {
  chunk: number;
  multiplier: number;
};

const SLOTS: Slot[] = Array.from({ length: DIGITS })
  .map((_, i) => ({
    chunk: i + 1,
    slots: DIGITS / (i + 1),
  }))
  .filter(({ chunk, slots }) => DIGITS % chunk === 0)
  .map(({ chunk, slots }, i) => ({
    chunk,
    slots,
    multiplier: slots > 1 ? Math.floor(slots * (10 / (i + 1))) : 1,
    choices: MIN_CHOICES + DIGITS / slots - 1,
  }))
  .sort(({ slots: a }, { slots: b }) => a - b);
export function LuckyCreate({ publicKey }: { publicKey: PublicKey }) {
  const { initialize } = useLuckyProgram();

  return (
    <button
      className="btn btn-xs lg:btn-md btn-primary"
      onClick={() => initialize.mutateAsync(publicKey)}
      disabled={initialize.isPending}
    >
      Create {initialize.isPending && '...'}
    </button>
  );
}

export function LuckyList({ publicKey }: { publicKey: PublicKey }) {
  const pda = useMemo(() => getLuckyPlayerPDA(publicKey), [publicKey]);
  const { getProgramAccount } = useLuckyProgram();
  const [slots, setSlots] = useState(0);
  const [powerWinner, setPowerWinner] = useState(slots > 0);
  const options = useMemo(() => SLOTS, []);
  const winner = useMemo(
    () => Math.floor(options[slots].choices / 2),
    [options, slots]
  );

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
      <div className="flex flex-col justify-center items-center gap-3">
        <label className="cursor-pointer label">
          <span className="label-text mr-2">
            x{POWER_MULTIPLIER} Lucky Rabbit
          </span>
          <input
            type="checkbox"
            disabled={slots < 1}
            className="toggle toggle-success"
            checked={powerWinner}
            onChange={(e) => setPowerWinner(e.target.checked)}
          />
        </label>
        <input
          className="range"
          type="range"
          value={slots}
          min={0}
          max={options.length - 1}
          step="1"
          onChange={(e) => setSlots(Number(e.target.value))}
        />
        <div className="w-full flex justify-between text-xs px-2">
          {options.map(({ slots, multiplier }, i) => (
            <div key={i}>
              <span>{slots}</span>
              {multiplier > 1 && (
                <span>
                  {' | x'}
                  {multiplier * (powerWinner ? POWER_MULTIPLIER : 1)}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center">
          <IconCashBanknote className="h-20 w-20" />
          <h2>
            Bounty:{' '}
            {new Intl.NumberFormat('en-US').format(
              BOUNTY *
                options[slots].multiplier *
                (powerWinner ? POWER_MULTIPLIER : 1)
            )}{' '}
            $LUCKY
          </h2>
        </div>
        <div className="flex flex-row">
          {options[slots].choices} | Winner: {winner}
        </div>
      </div>

      <div className="">
        <LuckyCard
          owned={true}
          account={pda}
          slots={options[slots]}
          powerWinner={powerWinner}
        />
      </div>
    </div>
  );
}

function LuckyCard({
  account,
  slots,
  owned = false,
  powerWinner,
}: {
  account: PublicKey;
  slots: Slot;
  owned?: boolean;
  powerWinner: boolean;
}) {
  const { accountQuery, playMutation, closeMutation } = useLuckyProgramAccount({
    account,
  });
  const data = useMemo(() => accountQuery.data, [accountQuery.data]);

  if (accountQuery.isLoading)
    return <span className="loading loading-spinner loading-lg"></span>;

  if (!data)
    return (
      <div className="text-center">
        <h2 className={'text-2xl'}>No account</h2>
        No accounts found. Create one above to get started.
      </div>
    );

  const { count, lastValue, winner, winningCount } = data;
  const parts = lastValue ? SplitValue(lastValue, slots.chunk) : [];

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div
      className={`card card-bordered border-4 text-neutral-content ${
        owned ? 'border-secondary' : 'border-base-300'
      }`}
    >
      <div className="card-body items-center text-center">
        <div className="badge absolute left-0 bottom-0 badge-primary m-4 badge-lg">
          {count}
        </div>
        <div className="badge absolute right-0 top-0 badge-accent m-4 badge-lg">
          <IconSparkles className="mr-2 fill-yellow-300" />
          {winningCount}
        </div>
        <div className="space-y-6 mt-4">
          <h2
            className={`card-title justify-center text-3xl cursor-pointer px-4 rounded-2xl ${
              winner ? 'border-primary border-2 border-dotted' : ''
            }`}
            onClick={() => accountQuery.refetch()}
          >
            {parts.map((part, i) => (
              <div key={i} className="relative p-2">
                <span className="text-2xl">{part}</span>
                <span className="absolute bottom-0 right-0 text-xs">
                  {part % slots.choices}
                </span>
              </div>
            ))}
          </h2>
          <div className="card-actions justify-around">
            <button
              className="btn btn-xs lg:btn-md btn-outline btn-accent"
              onClick={() =>
                playMutation.mutateAsync({ ...slots, luckyShoot: powerWinner })
              }
              disabled={playMutation.isPending}
            >
              Play
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
        {winner && (
          <div className="badge absolute left-0 top-0 m-4 text-xl">🎉</div>
        )}
      </div>
    </div>
  );
}

function SplitValue(value: number, size = 2) {
  const digits = value.toString().split('');
  if (digits.length % size !== 0) throw new Error('Invalid chunk size');

  const parts: number[] = [];
  while (digits.length) {
    const chunk = digits.splice(0, size);
    parts.push(Number(chunk.join('')));
  }

  return parts;
}
