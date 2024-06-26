import { config } from 'dotenv';
config();

import { Cluster } from '@solana/web3.js';
import {
  getAccount,
  getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token';
import { keypairIdentity, Metaplex, token } from '@metaplex-foundation/js';
import { TokenStandard } from '@metaplex-foundation/mpl-token-metadata';
import { BN } from '@coral-xyz/anchor';

import {
  CLUSTERS,
  loadOrCreateKeypair,
  createConnection,
  createProvider,
  getAndFillBalance,
  confirmAndLogTransaction,
} from './utils';
import {
  getGamesProgram,
  getKeeperPDA,
  getStrongholdPDA,
} from '@luckyland/anchor';

const { CLUSTER, METADATA_API_URL } = process.env;
if (!METADATA_API_URL) throw new Error('METADATA_API_URL is required');
if (!CLUSTER) throw new Error('CLUSTER is required');

const cluster = CLUSTERS[CLUSTER as keyof typeof CLUSTERS];
if (!cluster) throw new Error(`Cluster ${CLUSTER} not found`);

console.log('Create a semi fungible token and initialize a vault');
console.log(`Cluster: ${cluster.name} | Endpoint: ${cluster.endpoint}`);
console.log('Metadata API URL: ' + METADATA_API_URL);
console.log(`------------------------------------------------`);

const mintAuthority = loadOrCreateKeypair('./mint-authority.json');
const supplier = mintAuthority.publicKey;
const splToken = loadOrCreateKeypair('./spl-token-id.json');

const connection = createConnection(cluster);
const provider = createProvider(connection, mintAuthority);

const decimals = 9;

const keeperPDA = getKeeperPDA();

(async () => {
  console.log('Fetching supplier balance...');
  await getAndFillBalance(supplier, connection, cluster);

  const metaplex = new Metaplex(connection).use(keypairIdentity(mintAuthority));
  const createdSFT = await metaplex.nfts().createSft({
    uri: METADATA_API_URL,
    name: 'Luckyland',
    symbol: 'lucky',
    sellerFeeBasisPoints: 0,
    updateAuthority: mintAuthority,
    mintAuthority: mintAuthority,
    decimals: decimals,
    tokenStandard: TokenStandard.Fungible,
    isMutable: true,
    useNewMint: splToken,
  });

  console.log(
    'Creating semi fungible spl token with address: ' + createdSFT.sft.address
  );

  const gem = createdSFT.mintAddress;
  const strongholdPDA = getStrongholdPDA(gem, cluster.network as Cluster);
  const mintDecimals = Math.pow(10, decimals);

  const mintResult = await metaplex.nfts().mint({
    nftOrSft: createdSFT.sft,
    authority: mintAuthority,
    toOwner: supplier,
    amount: token(100 * mintDecimals),
  });

  console.log('Mint to result: ' + mintResult.response.signature);
  const reserve = await getOrCreateAssociatedTokenAccount(
    connection,
    mintAuthority,
    gem,
    supplier
  );

  console.log(`------------------------------------------------`);
  console.log(`Gem: ${gem}`);
  console.log(`Supplier: ${supplier}`);
  console.log('Reserve: ' + reserve.address);
  console.log('Keeper: ' + keeperPDA);
  console.log('Stronghold: ' + strongholdPDA);
  console.log(`------------------------------------------------`);

  const confirmOptions = { skipPreflight: true };
  const program = getGamesProgram(provider);

  const txHash = await program.methods
    .forgeStronghold()
    .accounts({ gem })
    .rpc(confirmOptions);

  console.log(`Initialize`);

  await confirmAndLogTransaction(txHash, connection, cluster);
  console.log(`Stronghold initialized.`);
  console.log(`------------------------------------------------`);

  let reserveInfo = await getAccount(connection, reserve.address);
  let strongholdInfo = await getAccount(connection, strongholdPDA);
  console.log('Reserve amount: ' + reserveInfo.amount / BigInt(mintDecimals));
  console.log(
    'Stronghold amount: ' + strongholdInfo.amount / BigInt(mintDecimals)
  );
  console.log(`------------------------------------------------`);
  console.log('Stockpile gems...');
  const depositTx = await program.methods
    .stockpileGems(new BN(reserveInfo.amount.toString()))
    .accounts({ gem, reserve: reserve.address })
    .rpc(confirmOptions);

  await confirmAndLogTransaction(depositTx, connection, cluster);
  console.log('Stockpile complete.');

  reserveInfo = await getAccount(connection, reserve.address);
  strongholdInfo = await getAccount(connection, strongholdPDA);
  console.log('Reserve amount: ' + reserveInfo.amount / BigInt(mintDecimals));
  console.log(
    'Stronghold amount: ' + strongholdInfo.amount / BigInt(mintDecimals)
  );
  console.log(`------------------------------------------------`);
  console.log('Program execution complete.');
})();
