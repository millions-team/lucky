import { useMemo, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import {
  IconAlertTriangle,
  IconBuildingBank,
  IconCoins,
  IconDotsVertical,
  IconMoneybag,
  IconTrophy,
} from '@tabler/icons-react';

import { useBountyAccount, usePlayerGame } from '@/hooks';
import { fromBN, formatAmount, fromBigInt } from '@luckyland/anchor';

import { UpdateBounty } from './Update';
import { FundBounty } from './Fund';
import { PlayForBounty } from './Play';

export function Badge({ pda }: { pda: PublicKey }) {
  const { bountyQuery, vaultQuery, gem, trader, emptyVault, canUpdate } =
    useBountyAccount({
      pda,
    });
  const { ammo } = usePlayerGame({ bounty: pda });
  const [updating, setUpdating] = useState(false);

  const reward = useMemo(
    () =>
      gem && bountyQuery?.data?.reward
        ? formatAmount(fromBN(bountyQuery.data.reward, gem.decimals))
        : 0,
    [bountyQuery?.data?.reward, gem]
  );
  const price = useMemo(
    () =>
      trader && bountyQuery?.data?.price
        ? fromBN(bountyQuery.data.price, trader.decimals)
        : 0,
    [bountyQuery?.data?.price, trader]
  );
  const shots = useMemo(() => {
    if (!ammo.token) return 0;
    return Math.floor(ammo.token.amount / price);
  }, [ammo, price]);

  const vaultAmount = useMemo(() => {
    if (!vaultQuery.data?.amount || !gem) return '0';
    return `${formatAmount(
      fromBigInt(vaultQuery.data.amount, gem.decimals)
    )} $${gem.symbol}`;
  }, [vaultQuery.data, gem]);

  return updating && canUpdate ? (
    <UpdateBounty pda={pda} onChange={(active) => setUpdating(active)} />
  ) : (
    <div
      className={`badge badge-outline h-auto uppercase py-4 text-xl relative group ${
        vaultQuery.isPending
          ? 'badge-secondary'
          : emptyVault
          ? 'badge-error'
          : 'badge-primary animate-glow hover:shadow-glow hover:animate-none transition-transform hover:scale-110'
      }`}
    >
      {vaultQuery.isLoading ? (
        <span className="loading loading-ring loading-xs"></span>
      ) : (
        <>
          <IconTrophy />
          <div className="space-x-2 mx-2 flex max-md:flex-col items-center justify-center">
            <span
              className="cursor-default tooltip tooltip-accent"
              data-tip={gem?.name}
            >
              {reward}
            </span>

            {emptyVault ? (
              <IconAlertTriangle />
            ) : (
              <PlayForBounty
                bounty={pda}
                onSucceed={() => vaultQuery.refetch()}
              />
            )}

            <span
              className="cursor-default tooltip tooltip-accent"
              data-tip={trader?.name}
            >
              {price}
            </span>
          </div>
          <IconCoins />
          {emptyVault && <FundBounty pda={pda} />}
          {canUpdate && (
            <button
              className="btn btn-xs btn-circle btn-ghost"
              onClick={() => setUpdating(true)}
            >
              <div className="tooltip tooltip-primary" data-tip="Update Bounty">
                <IconDotsVertical />
              </div>
            </button>
          )}

          {!emptyVault && (
            <>
              <div className="absolute hidden group-hover:flex gap-2 top-[-30px]">
                <IconBuildingBank />
                <span className="tooltip tooltip-primary" data-tip="Vault">
                  {vaultAmount}
                </span>
              </div>

              <div className="absolute hidden group-hover:flex gap-2 bottom-[-30px]">
                <IconMoneybag />
                <span className="tooltip tooltip-primary" data-tip="Vault">
                  {shots}
                </span>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
