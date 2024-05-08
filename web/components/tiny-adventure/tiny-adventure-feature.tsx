'use client';


import { useWallet } from '@solana/wallet-adapter-react';
import { ExplorerLink } from '../cluster/cluster-ui';
import { WalletButton } from '../solana/solana-provider';
import { AppHero, ellipsify } from '../ui/ui-layout';
import { useTinyAdventureProgram } from './tiny-adventure-data-access';
import { TinyAdventureCreate, TinyAdventureProgram } from './tiny-adventure-ui';

export default function TinyAdventureFeature() {
  const { publicKey } = useWallet();
  const { programId } = useTinyAdventureProgram();

  return publicKey ? (
    <div>
      <AppHero title="TinyAdventure" subtitle={'Run the program by clicking the "Run program" button.'}>
        <p className="mb-6">
          <ExplorerLink path={`account/${programId}`} label={ellipsify(programId.toString())} />
        </p>
        <TinyAdventureCreate account={publicKey} />
      </AppHero>
      <TinyAdventureProgram account={publicKey}/>
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
