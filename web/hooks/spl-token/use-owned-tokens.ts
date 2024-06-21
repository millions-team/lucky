import { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useConnection } from '@solana/wallet-adapter-react';

import { useGetTokenAccounts } from '@/components/account/account-data-access';
import type { TokenAccount } from './splt-token.d';
import { getToken } from './use-get-token';

export function useOwnedTokens(address: PublicKey) {
  const { connection } = useConnection();
  const { data: tokenAccounts, refetch } = useGetTokenAccounts({ address });
  const [tokens, setTokens] = useState<TokenAccount[]>([]);

  useEffect(() => {
    if (!tokenAccounts?.length) return;

    const mints = tokenAccounts.map((t) => t.account.data.parsed.info.mint);
    Promise.all(mints.map((mint) => getToken(mint, connection)))
      .then((tokens) =>
        tokens.map((token, i) => {
          const { account, pubkey } = tokenAccounts[i];
          const address = pubkey.toString();
          const decimals = account.data.parsed.info.tokenAmount.decimals;
          const amount = account.data.parsed.info.tokenAmount.uiAmount;

          return {
            ...token,
            address,
            decimals,
            amount,
          } as TokenAccount;
        })
      )
      .then(setTokens);
  }, [connection, tokenAccounts]);

  return {
    tokens,
    refresh: () => refetch(),
  };
}
