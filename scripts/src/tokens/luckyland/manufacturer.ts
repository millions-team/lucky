import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import {
  getOrCreateAssociatedTokenAccount,
  mintToChecked,
} from '@solana/spl-token';

import { keypairIdentity, Metaplex } from '@metaplex-foundation/js';
import { TokenStandard } from '@metaplex-foundation/mpl-token-metadata';

import {
  NAME,
  SYMBOL,
  DECIMALS,
  PIECES_PER_GEM,
  idPath,
  ID_NAME,
} from './constants';
import { loadOrCreateKeypair } from '../../utils';

const { LUCKYLAND_METADATA_API_URL: uri } = process.env;
if (!uri) throw new Error('LUCKYLAND_METADATA_API_URL is required');

let manufacturer: Metaplex;

export async function ForgeGems(
  market: Connection,
  payer: Keypair,
  amount = BigInt(0)
) {
  console.log(`------------------ ForgeGems ------------------`);
  console.log(
    `Forging (${formatAmount(amount, false)}) ${NAME} gems on ${
      market.rpcEndpoint
    } market...`
  );

  activateManufacturer(market, payer);
  console.log(`------------------------------------------------`);
  const { gem, minter } = await forgeMatrix();
  console.log(`------------------------------------------------`);
  const supplier = payer;
  let reserve = await checkBalance(market, supplier, gem);
  console.log(`------------------------------------------------`);
  if (amount <= 0) {
    console.log(`No gems to forge.`);
    return { gem, reserve };
  }

  await issueGems(
    market,
    payer,
    gem,
    reserve.address,
    minter,
    amount * PIECES_PER_GEM
  );
  console.log(`------------------------------------------------`);
  reserve = await checkBalance(market, supplier, gem);

  return { gem, reserve };
}

export function formatAmount(amount: bigint, raw = true) {
  const _amount = raw ? amount / PIECES_PER_GEM : amount;
  return `${Intl.NumberFormat().format(_amount)} $${SYMBOL}`;
}

function activateManufacturer(market: Connection, payer: Keypair) {
  if (manufacturer) return manufacturer;

  manufacturer = new Metaplex(market).use(keypairIdentity(payer));
  console.log(`Manufacturer activated...`);
  return manufacturer;
}

async function forgeMatrix() {
  const gemId = loadOrCreateKeypair(idPath(ID_NAME.GEM));
  const authorityId = loadOrCreateKeypair(idPath(ID_NAME.MINTER));
  const gem = gemId.publicKey;

  try {
    console.log(`Creating ${NAME} matrix...`);
    console.log(`Metadata API URL: ${uri}`);
    console.log(`Decimals: ${DECIMALS}`);

    await manufacturer.nfts().createSft({
      uri,
      name: NAME,
      symbol: SYMBOL,
      decimals: DECIMALS,
      useNewMint: gemId,
      mintAuthority: authorityId,
      updateAuthority: authorityId,
      tokenStandard: TokenStandard.Fungible,
      sellerFeeBasisPoints: 0,
      isMutable: true,
    });

    console.log(`Gem's matrix forged: ${gem}`);
    console.log(
      `Pieces per gem: ${Intl.NumberFormat().format(PIECES_PER_GEM)}`
    );
  } catch (e) {
    if (!e.message.includes('already in use')) throw e;

    console.log(`Gem's matrix already exists`);
  }

  return { gem, minter: authorityId };
}

async function issueGems(
  market: Connection,
  payer: Keypair,
  gem: PublicKey,
  reserve: PublicKey,
  minter: Keypair,
  amount: bigint
) {
  console.log(`Issuing ${formatAmount(amount)} gems...`);
  console.log(`Recipient: ${reserve}`);

  const tx = await mintToChecked(
    market,
    payer,
    gem,
    reserve, // receiver (should be a token account)
    minter, // mint authority
    amount, // amount. if your decimals is 8, you mint 10^8 for 1 token.
    DECIMALS // decimals
  );

  console.log(`Successfully minted ${formatAmount(amount)} gems.`);
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
  console.log(`Supplier reserve chamber: ${reserve.address}`);
  console.log(`Chamber balance: ${formatAmount(reserve.amount)}`);

  return reserve;
}
