import { Connection, PublicKey } from '@solana/web3.js';
import { getMint } from '@solana/spl-token';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import {
  fetchDigitalAsset,
  mplTokenMetadata,
} from '@metaplex-foundation/mpl-token-metadata';
import { fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';

export interface Token {
  mint: PublicKey;
  name: string;
  symbol: string;
  decimals: number;
  supply?: bigint;
  metadata?: any;
}

export async function getToken(
  mint: PublicKey | string | undefined | null,
  connection: Connection
): Promise<Token | null> {
  if (!mint) throw new Error('Invalid mint');
  if (typeof mint === 'string') mint = new PublicKey(mint);
  let mintAccount;

  try {
    mintAccount = await getMint(connection, mint);
  } catch (e: any) {
    console.warn(`Invalid or non-existent mint: ${e.message}`);
    return null;
  }

  let token = {
    mint,
    name: 'Unknown',
    symbol: '-',
    supply: mintAccount.supply,
    decimals: mintAccount.decimals,
  } as Token;

  try {
    const umi = createUmi(connection.rpcEndpoint).use(mplTokenMetadata());
    const asset = await fetchDigitalAsset(umi, fromWeb3JsPublicKey(mint));
    token = {
      ...token,
      name: asset.metadata.name,
      symbol: asset.metadata.symbol,
    };
    if (!asset.metadata.uri) return token;

    const metadata = await fetch(asset.metadata.uri).then((res) => res.json());

    token = {
      ...token,
      name: metadata.name || asset.metadata.name,
      symbol: metadata.symbol || asset.metadata.symbol,
      metadata,
    };
  } catch (e: any) {
    // TODO: Properly handle these errors
    console.warn(`No asset found: ${e.message}`);
  }

  return token;
}
