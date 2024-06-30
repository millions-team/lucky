import { PublicKey } from '@solana/web3.js';
import { useConnection } from '@solana/wallet-adapter-react';
import { useQuery } from '@tanstack/react-query';

import { type Token, getToken } from '@utils/token';

export function useGetToken({ mint }: { mint?: PublicKey }) {
  const { connection } = useConnection();

  return useQuery<Token | null>({
    queryKey: ['get-token', { endpoint: connection.rpcEndpoint, mint }],
    queryFn: () => getToken(mint, connection),
  });
}
