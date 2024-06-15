import { PublicKey } from '@solana/web3.js';
import { useConnection } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import {
  fetchDigitalAsset,
  mplTokenMetadata,
} from '@metaplex-foundation/mpl-token-metadata';
import { useGetTokenAccount } from './use-get-account';
import type { Token } from './splt-token.d';

export function useOwnedToken(address: PublicKey, mint: PublicKey) {
  const { connection } = useConnection();
  const {
    data: tokenAccount,
    isLoading,
    refetch,
  } = useGetTokenAccount({
    address,
    mint,
  });
  const [token, setToken] = useState<Token>();

  useEffect(() => {
    if (!tokenAccount) return setToken(undefined);

    const umi = createUmi(connection.rpcEndpoint).use(mplTokenMetadata());
    const { account, pubkey: _address } = tokenAccount;
    const address = _address.toString();
    const decimals = account.data.parsed.info.tokenAmount.decimals;
    const amount = account.data.parsed.info.tokenAmount.uiAmount;

    fetchDigitalAsset(umi, account.data.parsed.info.mint)
      .then(async (asset) => {
        const metadata = await fetch(asset.metadata.uri).then((res) =>
          res.json()
        );

        return setToken({
          mint,
          address,
          name: metadata.name || asset.metadata.name,
          symbol: metadata.symbol || asset.metadata.symbol,
          metadata,
          decimals,
          amount,
        });
      })
      .catch((error) => {
        console.warn(`Invalid Mint Token: ${error.message}`);
        return setToken({
          mint,
          address,
          name: account.data.parsed.info.name || 'Unknown',
          symbol: account.data.parsed.info.symbol || '-',
          decimals,
          amount,
        });
      });
  }, [connection, tokenAccount]);

  return {
    token,
    isLoading,
    refresh: () => refetch(),
  };
}
