import { ExplorerLink } from '@/components/cluster/cluster-ui';
import { ellipsify } from '@/components/ui/ui-layout';

import type { BaseProps } from '../card.d';
import { useStoreProgramAccount } from '../../store-data-access';

export function Accounts({ storePda }: BaseProps) {
  const { vaultPDA, vaultQuery } = useStoreProgramAccount({ storePda });

  return (
    <div className="flex flex-row gap-8">
      <p className="tooltip tooltip-info" data-tip="Store">
        <ExplorerLink
          path={`account/${storePda}`}
          label={ellipsify(storePda.toString())}
        />
      </p>
      <p className="tooltip tooltip-accent" data-tip="Vault">
        <ExplorerLink
          path={`account/${vaultPDA}`}
          label={ellipsify(vaultPDA.toString())}
        />
      </p>

      <p className="tooltip tooltip-primary" data-tip="Mint">
        <ExplorerLink
          path={`account/${vaultQuery.data?.mint}`}
          label={ellipsify(vaultQuery.data?.mint.toString())}
        />
      </p>
    </div>
  );
}
