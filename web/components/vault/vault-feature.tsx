'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { ExplorerLink } from '../cluster/cluster-ui';
import { WalletButton } from '../solana/solana-provider';
import { AppHero, ellipsify } from '../ui/ui-layout';
import { useVaultProgram } from './vault-data-access';
import { VaultProgram } from './vault-ui';
import { useMemo } from 'react';
import { getVaultAccountOwnerPDA } from '@lucky/anchor';

export default function VaultFeature() {
  const { publicKey } = useWallet();
  const { programId } = useVaultProgram();
  const ownerPDA = useMemo(() => getVaultAccountOwnerPDA(), []);

  return publicKey ? (
    <div>
      <AppHero
        title="Vault"
        subtitle={'Run the program by clicking the "Run program" button.'}
      >
        <div className="flex flex-row gap-8 items-center justify-center mb-6">
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
      <VaultProgram player={publicKey} />
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
  ``;
}
