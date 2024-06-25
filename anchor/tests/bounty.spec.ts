import * as anchor from '@coral-xyz/anchor';
import { BN, Program } from '@coral-xyz/anchor';
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import {
  createAssociatedTokenAccount,
  createMint,
  mintToChecked,
} from '@solana/spl-token';

import { Games } from '../target/types/games';
import {
  getGamePDA,
  getGameModePDA,
  getBountyPDA,
  encodeName,
} from '../src/games-exports';

const DECIMALS = 8;
const USD_SOL_FEED_ADDRESS = new PublicKey(
  '99B2bTijsU6f1GCT73HmdR7HCFFjGMBcPZY6jZ96ynrR'
);

describe('Bounty', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Games as Program<Games>;
  const connection = provider.connection;

  const supplier = Keypair.generate();
  const secret = Keypair.generate();
  const seed = `fantasy-loot`;
  const gamePDA = getGamePDA(supplier.publicKey, secret.publicKey);
  const task = getGameModePDA(gamePDA, seed);

  let mint: PublicKey;
  let accounts: Record<string, PublicKey>;

  beforeAll(async () => {
    const payer = supplier;
    const tx = await connection.requestAirdrop(
      supplier.publicKey,
      5 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(tx);

    mint = await createMint(
      connection, // conneciton
      payer, // fee payer
      payer.publicKey, // mint authority
      null, // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
      DECIMALS
    );

    const ata = await createAssociatedTokenAccount(
      connection, // connection
      payer, // fee payer
      mint, // mint
      payer.publicKey // owner,
    );

    accounts = {
      supplier: supplier.publicKey,
      gem: mint,
      task,
    };

    await mintToChecked(
      connection, // connection
      payer, // fee payer
      mint, // mint
      ata, // receiver (should be a token account)
      payer, // mint authority
      1000e8, // amount. if your decimals is 8, you mint 10^8 for 1 token.
      DECIMALS
    );

    const name = encodeName('Awesome Game Modes');

    await program.methods
      .createGame(name)
      .accounts({ owner: payer.publicKey, secret: secret.publicKey })
      .signers([payer])
      .rpc();

    await program.methods
      .addGameMode(seed, {
        game: gamePDA,
        slots: 1,
        digits: 1,
        choices: 2,
        winnerChoice: 1,
        pickWinner: true,
      })
      .accounts({ owner: payer.publicKey, secret: secret.publicKey })
      .signers([payer])
      .rpc();
  });

  it('Should initialize a bounty', async () => {
    const { gem, task } = accounts;
    const settings = {
      gem,
      task,
      price: new BN(0.5 * 10 ** DECIMALS),
      reward: new BN(20000 * 10 ** DECIMALS),
      merchandise: USD_SOL_FEED_ADDRESS,
    };

    await program.methods
      .issueBounty(settings)
      .accounts(accounts)
      .signers([supplier])
      .rpc();

    const bountyPDA = getBountyPDA(gem, task);
    const bounty = await program.account.bounty.fetch(bountyPDA);

    expect(bounty.gem).toEqual(settings.gem);
    expect(bounty.task).toEqual(settings.task);
    expect(bounty.price.toString()).toEqual(settings.price.toString());
    expect(bounty.reward.toString()).toEqual(settings.reward.toString());
    expect(bounty.merchandise).toEqual(settings.merchandise);
  });
});
