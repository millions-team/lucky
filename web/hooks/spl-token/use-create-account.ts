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

export function useCreateTokenAccount({
  address,
  callback,
}: {
  address: PublicKey;
  callback?: () => void;
}) {
  const { connection } = useConnection();
  const { wallet } = useWallet();
  const client = useQueryClient();
  const transactionToast = useTransactionToast();

  return useMutation({
    mutationKey: [
      'create-token-account',
      { endpoint: connection.rpcEndpoint, address },
    ],
    mutationFn: async (mint: PublicKey) => {
      if (!wallet?.adapter) throw new Error('Wallet not connected');

      const ata = await getAssociatedTokenAddress(mint, address);
      const instruction = createAssociatedTokenAccountInstruction(
        wallet.adapter.publicKey!, // payer
        ata, // ata
        address, // owner
        mint // mint
      );

      const { transaction } = await buildTransaction({
        payerKey: wallet.adapter.publicKey!,
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

      await client.invalidateQueries({
        queryKey: [
          'get-token-accounts',
          { endpoint: connection.rpcEndpoint, address },
        ],
      });
      await client.invalidateQueries({
        queryKey: [
          'get-token-account',
          { endpoint: connection.rpcEndpoint, address, mint },
        ],
      });

      callback && callback();
    },
    onError: (error) => {
      toast.error(`Transaction failed! ${error}`);
    },
  });
}
