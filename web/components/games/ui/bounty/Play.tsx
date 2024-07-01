'use client';

import { PublicKey } from '@solana/web3.js';
import { IconDeviceGamepad2, IconTransform } from '@tabler/icons-react';
import { usePlayerGame } from '@/hooks';
import { useState } from 'react';
export function PlayForBounty({
  bounty,
  onSucceed,
}: {
  bounty: PublicKey;
  onSucceed?: () => void;
}) {
  const [playing, setPlaying] = useState(false);
  const { playRound } = usePlayerGame({ bounty, onSucceed });

  return playing ? (
    <span className="loading loading-ball loading-xs"></span>
  ) : (
    <div className="tooltip tooltip-info" data-tip="Play">
      <span className="swap swap-rotate group-hover:swap-active">
        <div className="btn btn-sm btn-circle swap-off">
          <IconTransform size={20} />
        </div>
        <div
          className="btn btn-sm btn-circle btn-outline btn-info swap-on"
          onClick={async () => {
            try {
              setPlaying(true);
              await playRound.mutateAsync();
            } catch (err) {
              console.error(err);
            } finally {
              setPlaying(false);
            }
          }}
        >
          <IconDeviceGamepad2 size={20} />
        </div>
      </span>
    </div>
  );
}
