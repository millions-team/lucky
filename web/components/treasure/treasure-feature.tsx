'use client';

import { useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getKeeperPDA } from '@luckyland/anchor';

import { WalletButton } from '@/providers';
import { AppHero, ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import { useTreasureProgram } from './treasure-data-access';
import { TreasureProgram } from './treasure-ui';

export default function TreasureFeature() {
  const { publicKey } = useWallet();
  const { programId } = useTreasureProgram();
  const ownerPDA = useMemo(() => getKeeperPDA(), []);

  return publicKey ? (
    <div>
      <AppHero
        title="Treasury"
        subtitle={`Here you can safely store your treasures.
          So they could be redeemed as loots by the lucky adventurers.`}
      >
        <div className="flex flex-row gap-8 items-center justify-center">
          <p className="tooltip tooltip-primary" data-tip="Program">
            <ExplorerLink
              path={`account/${programId}`}
              label={ellipsify(programId.toString())}
            />
          </p>
          <p className="tooltip tooltip-accent" data-tip="Vault Owner">
            <ExplorerLink
              path={`account/${ownerPDA}`}
              label={ellipsify(ownerPDA.toString())}
            />
          </p>
        </div>
      </AppHero>
      <TreasureProgram player={publicKey} />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton className="btn btn-primary" />
        </div>
      </div>
    </div>
  );
}
