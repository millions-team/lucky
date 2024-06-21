import { PublicKey } from '@solana/web3.js';
import { useConnection } from '@solana/wallet-adapter-react';
import { useQuery } from '@tanstack/react-query';
import type { TokenAccount } from './splt-token.d';
import { getAccount } from '@solana/spl-token';
import { getToken } from './use-get-token';

/*
 * @desc Custom hook to get all details of a token account
 *
 * @param address - the public key of the token account
 * */
export function useGetTokenAccount({ address }: { address: PublicKey }) {
  const { connection } = useConnection();

  return useQuery<TokenAccount | null>({
    queryKey: [
      'get-token-account',
      { endpoint: connection.rpcEndpoint, address },
    ],
    queryFn: async () => {
      let account;

      try {
        account = await getAccount(connection, address);
      } catch (e: any) {
        console.warn(`Invalid or non-existent account: ${e.message}`);
        return null;
      }

      const mint = account.mint;
      const token = await getToken(mint, connection);
      if (!token) throw new Error('Token not found'); // this should never happen

      return {
        ...token,
        amount: Number(account.amount / BigInt(10 ** token.decimals)),
        address: address.toString(),
      };
    },
  });
}
