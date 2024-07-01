import { useMemo } from 'react';
import { PublicKey } from '@solana/web3.js';
import { getAccount, getAssociatedTokenAddress } from '@solana/spl-token';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { BN } from '@coral-xyz/anchor';
import toast from 'react-hot-toast';

import { useCluster } from '@/providers';

import {
  type Bounty,
  getBountyVaultPDA,
  fromBigInt,
  fromBN,
  RENEW_THRESHOLD,
} from '@luckyland/anchor';
import {
  useGamesProgram,
  useTreasureGems,
  useTollkeeperTraders,
  useTransactionToast,
} from '@/hooks';

export function useBountyAccount({ pda }: { pda: PublicKey }) {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program } = useGamesProgram();

  const { getGem } = useTreasureGems({});
  const { getTrader } = useTollkeeperTraders({});

  const bountyQuery = useQuery({
    queryKey: ['bounty', 'account', { cluster, pda }],
    queryFn: async () => {
      return program.account.bounty.fetch(pda);
    },
  });

  const gem = useMemo(() => {
    if (!bountyQuery.data) return;
    return getGem(bountyQuery.data.gem);
  }, [bountyQuery.data, getGem]);

  const trader = useMemo(() => {
    if (!bountyQuery.data) return;
    return getTrader(bountyQuery.data.trader);
  }, [bountyQuery.data, getTrader]);

  const price = useMemo(() => {
    if (!bountyQuery.data) return 0;
    return fromBN(bountyQuery.data.price, trader?.decimals);
  }, [bountyQuery.data, trader]);

  const isOwner = useMemo(() => {
    if (!publicKey || !bountyQuery.data) return false;
    return publicKey?.equals(bountyQuery.data?.owner);
  }, [publicKey, bountyQuery.data]);

  const vaultPDA = useMemo(() => getBountyVaultPDA(pda), [pda]);
  const vaultQuery = useQuery({
    queryKey: ['bounty-vault', 'account', { cluster, pda }],
    queryFn: async () => {
      try {
        return await getAccount(connection, vaultPDA);
      } catch (e: any) {
        if (e.name === 'TokenAccountNotFoundError') return null;
        throw e;
      }
    },
  });

  const emptyVault = useMemo(() => {
    return (
      !vaultQuery.data ||
      !bountyQuery.data ||
      !gem ||
      fromBigInt(vaultQuery.data.amount, gem.decimals) <
        fromBN(bountyQuery.data.reward, gem.decimals)
    );
  }, [vaultQuery.data, bountyQuery.data, gem]);

  const canUpdate = useMemo(() => {
    if (!bountyQuery.data || !vaultQuery.data || !isOwner) return false;

    return bountyQuery.data.currentlyIssued.gte(
      new BN((vaultQuery.data.amount * RENEW_THRESHOLD).toString())
    );
  }, [bountyQuery.data, vaultQuery.data, isOwner]);

  const fund = useMutation({
    mutationKey: ['bounty', 'fund', { cluster, pda }],
    mutationFn: async (amount: BN) => {
      if (!bountyQuery.data) throw new Error('Bounty not found');
      if (!publicKey) throw new Error('Wallet not connected');

      const { gem } = bountyQuery.data;
      const reserve = await getAssociatedTokenAddress(gem, publicKey);

      return program.methods
        .fundBounty(amount)
        .accounts({ gem, bounty: pda, supplier: publicKey, reserve })
        .rpc();
    },
    onSuccess: (tx) => {
      transactionToast(tx);
      return vaultQuery.refetch();
    },
    onError: (e, a, b) => {
      console.log(e, a, b);
      toast.error('Failed to fund bounty vault.');
    },
  });

  const update = useMutation({
    mutationKey: ['bounty', 'update', { cluster, pda }],
    mutationFn: (bounty: Bounty) => {
      if (!bountyQuery.data) throw new Error('Bounty not found');
      if (!publicKey) throw new Error('Wallet not connected');

      return program.methods
        .renewBounty(bounty)
        .accounts({ bounty: pda, supplier: publicKey })
        .rpc();
    },
    onSuccess: (tx) => {
      transactionToast(tx);
      return bountyQuery.refetch();
    },
    onError: (e, a, b) => {
      console.log(e, a, b);
      toast.error('Failed to update bounty.');
    },
  });

  return {
    bountyQuery,
    vaultQuery,
    isOwner,

    gem,
    trader,
    price,
    emptyVault,
    canUpdate,

    fund,
    update,
  };
}
