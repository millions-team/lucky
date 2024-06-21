import { PublicKey } from '@solana/web3.js';
import { useConnection } from '@solana/wallet-adapter-react';
import { useQuery } from '@tanstack/react-query';

// TODO: Read this from somewhere.
const STORE_SIZE = 48; // 48 bytes

export const useStoreBalance = (address: PublicKey) => {
  const { connection } = useConnection();

  const minimumBalance = useQuery({
    queryKey: ['store-minimum-balance', { endpoint: connection.rpcEndpoint }],
    queryFn: () => connection.getMinimumBalanceForRentExemption(STORE_SIZE),
  });

  return useQuery({
    queryKey: ['store-balance', { endpoint: connection.rpcEndpoint, address }],
    queryFn: async () => {
      if (!minimumBalance.data) throw new Error('Minimum balance not loaded');

      const rent = minimumBalance.data;
      const balance = await connection.getBalance(address);

      return balance - rent;
    },
  });
};
