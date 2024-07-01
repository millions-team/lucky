import { PublicKey } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTransactionToast } from '@/components/ui/ui-layout';
import toast from 'react-hot-toast';
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
} from '@solana/spl-token';

import { buildTransaction } from '@/utils';
import { usePlayer } from '@/hooks';

export function useCreateTokenAccount({
  mint,
  callback,
}: {
  mint: PublicKey;
  callback?: () => void;
}) {
  const { connection } = useConnection();
  const { owner: address } = usePlayer();
  const { wallet } = useWallet();
  const client = useQueryClient();
  const transactionToast = useTransactionToast();

  return useMutation({
    mutationKey: [
      'create-token-account',
      { endpoint: connection.rpcEndpoint, address, mint },
    ],
    mutationFn: async () => {
      if (!wallet?.adapter) throw new Error('Wallet not connected');

      const ata = await getAssociatedTokenAddress(mint, address);
      const instruction = createAssociatedTokenAccountInstruction(
        address, // payer
        ata, // ata
        address, // owner
        mint // mint
      );

      const { transaction } = await buildTransaction({
        payerKey: address,
        connection,
        instructions: [instruction],
      });

      const signature = await wallet.adapter.sendTransaction(
        transaction,
        connection
      );

      return { signature, mint };
    },
    onSuccess: async ({ signature, mint }) => {
      if (signature) transactionToast(signature, 'Token account created');
      const endpoint = connection.rpcEndpoint;

      await client.invalidateQueries({
        queryKey: ['get-token-account', { endpoint, address }],
      });
      await client.invalidateQueries({
        queryKey: ['get-token-accounts', { endpoint, address }],
      });
      await client.invalidateQueries({
        queryKey: ['get-owned-token-account', { endpoint, address, mint }],
      });

      callback && callback();
    },
    onError: (error) => {
      toast.error(`Transaction failed! ${error}`);
    },
  });
}
