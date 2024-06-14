import { PublicKey } from '@solana/web3.js';
import { useConnection } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import {
  fetchAllDigitalAsset,
  mplTokenMetadata,
} from '@metaplex-foundation/mpl-token-metadata';
import { useGetTokenAccounts } from '@/components/account/account-data-access';
import type { Token } from './splt-token.d';

export function useOwnedTokens(address: PublicKey) {
  const { connection } = useConnection();
  const { data: tokenAccounts, refetch } = useGetTokenAccounts({ address });
  const [tokens, setTokens] = useState<Token[]>([]);

  useEffect(() => {
    if (!tokenAccounts?.length) return;

    const mints = tokenAccounts.map((t) => t.account.data.parsed.info.mint);
    const umi = createUmi(connection.rpcEndpoint).use(mplTokenMetadata());

    fetchAllDigitalAsset(umi, mints).then(async (assets) => {
      const tokens = await Promise.all(
        mints.map(async (pubkey, i) => {
          const asset = assets.find(
            (a) => a.mint.publicKey.toString() === pubkey
          );
          const { account, pubkey: _address } = tokenAccounts[i];
          const address = _address.toString();
          const mint = new PublicKey(pubkey);
          const decimals = account.data.parsed.info.tokenAmount.decimals;
          const amount = account.data.parsed.info.tokenAmount.uiAmount;

          if (!asset)
            return {
              mint,
              address,
              name: account.data.parsed.info.name || 'Unknown',
              symbol: account.data.parsed.info.symbol || '-',
              decimals,
              amount,
            };
          const metadata = await fetch(asset.metadata.uri).then((res) =>
            res.json()
          );

          return {
            mint,
            address,
            name: metadata.name || asset.metadata.name,
            symbol: metadata.symbol || asset.metadata.symbol,
            metadata,
            decimals,
            amount,
          };
        })
      );

      setTokens(tokens);
    });
  }, [connection, tokenAccounts]);

  return {
    tokens,
    refresh: () => refetch(),
  };
}
