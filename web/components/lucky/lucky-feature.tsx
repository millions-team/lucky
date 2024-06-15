'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '../solana/solana-provider';
import { AppHero, ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import { useLuckyProgram } from './lucky-data-access';
import { LuckyCreate, LuckyList } from './lucky-ui';

export default function LuckyFeature() {
  const { publicKey } = useWallet();
  const { programId, vaultPDA, bountyPDA } = useLuckyProgram();

  return publicKey ? (
    <div className="mx-4 lg:max-w-4xl lg:mx-auto">
      <AppHero
        title="Lucky"
        subtitle={
          'Create a new account by clicking the "Create" button. The state of a account is stored on-chain and can be manipulated by calling the program\'s methods (increment, decrement, set, and close).'
        }
      >
        <div className="flex flex-row gap-8 items-center justify-center mb-6">
          <p className="tooltip tooltip-primary" data-tip="Program">
            <ExplorerLink
              path={`account/${programId}`}
              label={ellipsify(programId.toString())}
            />
          </p>
          <p className="tooltip tooltip-secondary" data-tip="Vault">
            <ExplorerLink
              path={`account/${vaultPDA}`}
              label={ellipsify(vaultPDA.toString())}
            />
          </p>
          <p className="tooltip tooltip-accent" data-tip="Bounty">
            <ExplorerLink
              path={`account/${bountyPDA}`}
              label={ellipsify(bountyPDA.toString())}
            />
          </p>
        </div>
        <LuckyCreate publicKey={publicKey} />
      </AppHero>
      <LuckyList publicKey={publicKey} />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  );
}
