import * as anchor from '@coral-xyz/anchor';
import { BN } from '@coral-xyz/anchor';
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import {
  createAssociatedTokenAccount,
  createMint,
  getAccount,
  mintToChecked,
} from '@solana/spl-token';

import {
  getGamesProgram,
  getGamePDA,
  getGameModePDA,
  encodeName,
  getKeeperPDA,
  getStrongholdPDA,
  getBountyPDA,
  getBountyVaultPDA,
} from '../src/games-exports';

const DECIMALS = 8;
describe('Bounty', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = getGamesProgram(provider);
  const connection = provider.connection;

  const supplier = Keypair.generate();
  const secret = Keypair.generate();
  const seed = `fantasy-loot`;
  const gamePDA = getGamePDA(supplier.publicKey, secret.publicKey);
  const task = getGameModePDA(gamePDA, seed);

  let gem: PublicKey; // Mint of token to be used for bounties.
  let trader: PublicKey; // Mint of token to be charged to players for playing the game.
  let accounts: Record<string, PublicKey>;

  beforeAll(async () => {
    const payer = supplier;
    const tx = await connection.requestAirdrop(
      supplier.publicKey,
      0.5 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(tx);

    gem = await createMint(
      connection, // conneciton
      payer, // fee payer
      payer.publicKey, // mint authority
      null, // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
      DECIMALS
    );

    trader = await createMint(
      connection, // conneciton
      payer, // fee payer
      payer.publicKey, // mint authority
      null, // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
      DECIMALS
    );

    const reserve = await createAssociatedTokenAccount(
      connection, // connection
      payer, // fee payer
      gem, // mint
      payer.publicKey // owner,
    );

    accounts = {
      task,
      gem, // LuckyLand token.
      trader, // Lucky Shot token.
      supplier: supplier.publicKey,
    };

    const amount = 1000 * 10 ** DECIMALS;
    await mintToChecked(
      connection, // connection
      payer, // fee payer
      gem, // mint
      reserve, // receiver (must be a token account)
      payer, // mint authority
      amount, // amount. if your decimals is 8, you mint 10^8 for 1 token.
      DECIMALS
    );

    const name = encodeName('Awesome Game Modes');

    // Create a game and a game mode.
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

    // Forge a stronghold and stockpile gems.
    await program.methods
      .forgeStronghold()
      .accounts(accounts)
      .signers([payer])
      .rpc();

    await program.methods
      .stockpileGems(new BN(amount))
      .accounts({
        ...accounts,
        reserve,
      })
      .signers([payer])
      .rpc();
  });

  it('Should initialize a bounty', async () => {
    const { gem, task, trader } = accounts;
    const settings = {
      task, // Game mode. This is ignored here. It assigns the one in the accounts.

      gem, // Token to be used for bounties. This is ignored here. It assigns the one in the accounts.
      reward: new BN(20000 * 10 ** DECIMALS),

      price: new BN(0.5 * 10 ** DECIMALS),
      trader, // Token to be charged to players for playing the game. This is ignored here. It assigns the one in the accounts.
    };

    await program.methods
      .issueBounty(settings)
      .accounts(accounts)
      .signers([supplier])
      .rpc();

    const bountyPDA = getBountyPDA(task, gem, trader);
    const bounty = await program.account.bounty.fetch(bountyPDA);

    expect(bounty.task).toEqual(settings.task);

    expect(bounty.gem).toEqual(settings.gem);
    expect(bounty.reward.toString()).toEqual(settings.reward.toString());

    expect(bounty.price.toString()).toEqual(settings.price.toString());
    expect(bounty.trader).toEqual(settings.trader);
  });

  it(`Should init bounty vault and transport the gems from stronghold`, async () => {
    const { gem, task, trader } = accounts;
    const strongholdPDA = getStrongholdPDA(gem);
    const strongholdBeforeTransport = await getAccount(
      connection,
      strongholdPDA
    );
    const amount = strongholdBeforeTransport.amount;
    expect(amount).toBeGreaterThan(0);

    await program.methods
      .fundBounty(new BN(amount))
      .accounts(accounts)
      .signers([supplier])
      .rpc();

    const bountyPDA = getBountyPDA(task, gem, trader);
    const vaultPDA = getBountyVaultPDA(bountyPDA);

    const stronghold = await getAccount(connection, strongholdPDA);
    const vault = await getAccount(connection, vaultPDA);

    expect(vault.owner).toEqual(getKeeperPDA());
    expect(stronghold.amount.toString()).toEqual('0');
    expect(vault.amount.toString()).toEqual(amount.toString());
  });
});
