import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import {
  getOrCreateAssociatedTokenAccount,
  mintToChecked,
} from '@solana/spl-token';

import { type Metaplex } from '@metaplex-foundation/js';
import { TokenStandard } from '@metaplex-foundation/mpl-token-metadata';

import {
  NAME,
  SYMBOL,
  DECIMALS,
  PIECES_PER_TOKEN,
  idPath,
  ID_NAME,
} from './constants';
import { getManufacturer, getMetadataURI } from '../utils';
import { formatter, loadOrCreateKeypair } from '../../utils';

const formatAmount = formatter(PIECES_PER_TOKEN, SYMBOL);
let manufacturer: Metaplex;

export async function ForgeTrader(
  market: Connection,
  payer: Keypair,
  amount = BigInt(0)
) {
  console.log(`------------------ ForgeTrader ------------------`);
  console.log(
    `Forging (${formatAmount(amount, false)}) ${NAME} tokens on ${
      market.rpcEndpoint
    } market...`
  );

  manufacturer = getManufacturer(market, payer);
  console.log(`------------------------------------------------`);
  const { trader, minter } = await forgeMatrix();
  console.log(`------------------------------------------------`);
  const supplier = payer;
  let store = await checkBalance(market, supplier, trader);
  console.log(`------------------------------------------------`);
  if (amount <= 0) {
    console.log(`No trades to issue.`);
    return { trader, store };
  }

  await issueTokens(
    market,
    payer,
    trader,
    store.address,
    minter,
    amount * PIECES_PER_TOKEN
  );
  console.log(`------------------------------------------------`);
  store = await checkBalance(market, supplier, trader);

  return { trader, store };
}

async function forgeMatrix() {
  const tokenId = loadOrCreateKeypair(idPath(ID_NAME.TRADER));
  const authorityId = loadOrCreateKeypair(idPath(ID_NAME.MINTER));
  const trader = tokenId.publicKey;
  const uri = getMetadataURI(SYMBOL);

  try {
    console.log(`Creating ${NAME} matrix...`);
    console.log(`Metadata API URL: ${uri}`);
    console.log(`Decimals: ${DECIMALS}`);

    await manufacturer.nfts().createSft({
      uri,
      name: NAME,
      symbol: SYMBOL,
      decimals: DECIMALS,
      useNewMint: tokenId,
      mintAuthority: authorityId,
      updateAuthority: authorityId,
      tokenStandard: TokenStandard.Fungible,
      sellerFeeBasisPoints: 0,
      isMutable: true,
    });

    console.log(`Token's matrix forged: ${trader}`);
    console.log(
      `Pieces per trade: ${Intl.NumberFormat().format(PIECES_PER_TOKEN)}`
    );
  } catch (e) {
    if (!e.message.includes('already in use')) throw e;

    console.log(`Trade's matrix already exists`);
  }

  return { trader, minter: authorityId };
}

async function issueTokens(
  market: Connection,
  payer: Keypair,
  gem: PublicKey,
  store: PublicKey,
  minter: Keypair,
  amount: bigint
) {
  console.log(`Issuing ${formatAmount(amount)} tokens...`);
  console.log(`Recipient: ${store}`);

  const tx = await mintToChecked(
    market,
    payer,
    gem,
    store, // receiver (should be a token account)
    minter, // mint authority
    amount, // amount. if your decimals is 8, you mint 10^8 for 1 token.
    DECIMALS // decimals
  );

  console.log(`Successfully minted ${formatAmount(amount)} tokens.`);
  console.log(`Issued signature: ${tx}`);

  return tx;
}

async function checkBalance(
  market: Connection,
  supplier: Keypair,
  gem: PublicKey
) {
  const reserve = await getOrCreateAssociatedTokenAccount(
    market,
    supplier,
    gem,
    supplier.publicKey
  );

  console.log(`Supplier: ${supplier.publicKey}`);
  console.log(`Supplier store: ${reserve.address}`);
  console.log(`Store balance: ${formatAmount(reserve.amount)}`);

  return reserve;
}
