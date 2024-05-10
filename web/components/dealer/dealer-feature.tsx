'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '../solana/solana-provider';
import { AppHero, ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import { useDealerProgram } from './dealer-data-access';
import { DealerCreate, DealerList } from './dealer-ui';

export default function DealerFeature() {
  const { publicKey } = useWallet();
  const { programId } = useDealerProgram();

  return publicKey ? (
    <div>
      <AppHero
        title="Dealer"
        subtitle={
          'Create a new account by clicking the "Create" button. The state of a account is stored on-chain and can be manipulated by calling the program\'s method (roll).'
        }
      >
        <p className="mb-6">
          <ExplorerLink
            path={`account/${programId}`}
            label={ellipsify(programId.toString())}
          />
        </p>
        <DealerCreate account={publicKey} />
      </AppHero>
      <DealerList publicKey={publicKey} />
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
