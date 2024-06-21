import { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useConnection } from '@solana/wallet-adapter-react';

import { useGetOwnedTokenAccount } from './use-get-owned-token-account';
import { TokenAccount } from './splt-token.d';
import { useGetToken } from './use-get-token';

export function useOwnedToken(address: PublicKey, mint?: PublicKey) {
  const { connection } = useConnection();
  const tokenAccount = useGetOwnedTokenAccount({
    address,
    mint,
  });
  const tokenDetails = useGetToken({ mint });
  const [token, setToken] = useState<TokenAccount>();
  const isLoading = tokenAccount.isLoading || tokenDetails.isLoading;

  useEffect(() => {
    if (tokenAccount.isPending || tokenDetails.isPending) return;

    if (!tokenAccount?.data) return setToken(undefined);
    if (!tokenDetails?.data) return setToken(undefined);

    const { account, pubkey } = tokenAccount.data;
    const amount = account.data.parsed.info.tokenAmount.uiAmount;

    setToken({
      ...tokenDetails.data,
      address: pubkey.toString(),
      amount,
    });
  }, [
    connection,
    tokenAccount.data,
    tokenAccount.isPending,
    tokenDetails.data,
    tokenDetails.isPending,
  ]);

  return {
    token,
    isLoading,
    refresh: () => tokenAccount.refetch(),
  };
}
