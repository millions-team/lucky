import { PublicKey } from '@solana/web3.js';
import { useConnection } from '@solana/wallet-adapter-react';
import { useQuery } from '@tanstack/react-query';

export function useGetTokenAccount({
  address,
  mint,
}: {
  address: PublicKey;
  mint: PublicKey;
}) {
  const { connection } = useConnection();

  return useQuery({
    queryKey: [
      'get-token-account',
      { endpoint: connection.rpcEndpoint, address, mint },
    ],
    queryFn: async () => {
      const result = await connection.getParsedTokenAccountsByOwner(address, {
        mint,
      });
      return result.value[0] ?? null;
    },
  });
}
