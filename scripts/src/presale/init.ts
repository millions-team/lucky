import { getAssociatedTokenAddress } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

import { type Portal } from '../utils';
import { PRESALE } from '../assets/stages';

import { getToken } from '@utils/token';
import { toBN } from '@luckyland/anchor';

export async function InitPresale(
  { sale, authority }: Portal,
  token: PublicKey
) {
  const { mint, decimals } = await getToken(token, sale.provider.connection);
  const reserve = await getAssociatedTokenAddress(mint, authority.publicKey);

  await sale.methods
    .initSale({
      start: new BN(PRESALE.start / 1000),
      end: new BN(PRESALE.end / 1000),
      min: toBN(PRESALE.min, decimals),
      max: toBN(PRESALE.max, decimals),
      prices: PRESALE.prices.map((price) => toBN(price, 9)),
      amounts: PRESALE.amounts.map((amount) => toBN(amount, decimals)),
    })
    .accounts({ token: mint, reserve })
    .rpc();
}
