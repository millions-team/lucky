import * as anchor from '@coral-xyz/anchor';
import { BN } from '@coral-xyz/anchor';
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintToChecked,
  getAccount,
} from '@solana/spl-token';

import {
  getGamesProgram,
  getGamePDA,
  getGameModePDA,
  encodeName,
  getTreasurePDA,
  getBountyPDA,
  getBountyVaultPDA,
  toBN,
  TREASURE_FORGE_COST,
  TRADER_LAUNCH_COST,
  getPlayerPDA,
  fromBN,
  fromBigInt,
  getCollectorPDA,
} from '../src/games-exports';

const DECIMALS = 8;
describe('Player', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = getGamesProgram(provider);
  const connection = provider.connection;

  const supplier = Keypair.generate();
  const secret = Keypair.generate();
  const seed = `fantasy-loot`;
  const gamePDA = getGamePDA(supplier.publicKey, secret.publicKey);
  const gameModePDA = getGameModePDA(gamePDA, seed);

  let gem: PublicKey; // Mint of token to be used for bounties.
  let trader: PublicKey; // Mint of token to be charged to players for playing the game.
  let accounts: Record<string, PublicKey>;

  const mintTo = (receiver: PublicKey, amount: BN, mint: PublicKey) =>
    mintToChecked(
      connection, // connection
      supplier, // fee payer
      mint, // mint
      receiver, // receiver (must be a token account)
      supplier, // mint authority
      amount, // amount. if your decimals is 8, you mint 10^8 for 1 token.
      DECIMALS
    );

  const getTokenAccount = (owner: PublicKey, mint: PublicKey) =>
    getOrCreateAssociatedTokenAccount(
      connection, // connection
      supplier, // fee payer
      mint, // mint
      owner // owner,
    );

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

    const bounty = getBountyPDA(gameModePDA, gem, trader);
    accounts = {
      task: gameModePDA,
      gem, // LuckyLand token.
      trader, // Lucky Shot token.
      supplier: supplier.publicKey,
      bounty,
      vault: getBountyVaultPDA(bounty),
    };
  });

  describe('Preparing the Stronghold', () => {
    const payer = Keypair.generate();

    beforeAll(async () => {
      const tx = await connection.requestAirdrop(
        payer.publicKey,
        (TREASURE_FORGE_COST + 0.1) * LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(tx);
    });

    it('Should forge a stronghold for the gem', async () => {
      const { gem } = accounts;
      const treasure = await program.account.treasure.fetchNullable(
        getTreasurePDA()
      );

      const timeout = new Promise((resolve) => {
        const id = setTimeout(() => resolve(id), treasure ? 0 : 1000);
      });

      clearTimeout(((await timeout) as NodeJS.Timeout).unref());
      await program.methods
        .forgeStronghold()
        .accounts({ gem, supplier: payer.publicKey })
        .signers([payer])
        .rpc();
    });
  });

  describe('Preparing the Escrow', () => {
    const payer = Keypair.generate();

    beforeAll(async () => {
      const tx = await connection.requestAirdrop(
        payer.publicKey,
        (TRADER_LAUNCH_COST + 0.1) * LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(tx);
    });

    it('Should launch a trader for the gem', async () => {
      const { trader } = accounts;
      const treasure = await program.account.treasure.fetchNullable(
        getTreasurePDA()
      );

      const timeout = new Promise((resolve) => {
        const id = setTimeout(() => resolve(id), treasure ? 0 : 1000);
      });

      clearTimeout(((await timeout) as NodeJS.Timeout).unref());
      await program.methods
        .launchEscrow()
        .accounts({ trader, supplier: payer.publicKey })
        .signers([payer])
        .rpc();
    });
  });

  describe('Preparing the game', () => {
    const name = encodeName('Awesome Game Modes');

    it('Should create a game', async () => {
      await program.methods
        .createGame(name)
        .accounts({ owner: supplier.publicKey, secret: secret.publicKey })
        .signers([supplier])
        .rpc();
    });

    it('Should create a game mode', async () => {
      const settings = {
        slots: 1,
        digits: 1,
        choices: 2,
        winnerChoice: 1,
        pickWinner: true,
      };

      await program.methods
        .addGameMode(seed, settings)
        .accounts({ owner: supplier.publicKey, secret: secret.publicKey })
        .signers([supplier])
        .rpc();
    });
  });

  describe('Preparing the bounty', () => {
    beforeAll(async () => {
      const reserve = await getTokenAccount(supplier.publicKey, gem);
      await mintTo(reserve.address, toBN(100_000_000, DECIMALS), gem);

      accounts['reserve'] = reserve.address;
    });

    it('Should initialize a bounty', async () => {
      const settings = {
        reward: toBN(1000, DECIMALS),
        price: toBN(0.5, DECIMALS),
      };

      await program.methods
        .issueBounty(settings)
        .accounts(accounts)
        .signers([supplier])
        .rpc();
    });

    it(`Should init bounty vault and transport the gems from reserve`, async () => {
      const { bounty: bountyPDA } = accounts;
      const bounty = await program.account.bounty.fetch(bountyPDA);
      const amount = BigInt(bounty.reward * 10);

      await program.methods
        .fundBounty(new BN(amount))
        .accounts(accounts)
        .signers([supplier])
        .rpc();
    });
  });

  describe('Play', () => {
    const player = Keypair.generate();
    const pda = getPlayerPDA(player.publicKey);

    beforeAll(async () => {
      const tx = await connection.requestAirdrop(
        player.publicKey,
        0.1 * LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(tx);

      const ammo = await getTokenAccount(player.publicKey, trader);
      const bag = await getTokenAccount(player.publicKey, gem);
      await mintTo(ammo.address, toBN(10, DECIMALS), trader);
      const collectorPDA = getCollectorPDA(trader);

      accounts['owner'] = player.publicKey;
      accounts['player'] = pda;
      accounts['collector'] = collectorPDA;
      accounts['bag'] = bag.address;
      accounts['ammo'] = ammo.address;
    });

    it('Should collect the correct price', async () => {
      const { owner, bounty, bag, collector: collectorPDA } = accounts;
      const collectorBeforeRound = await getAccount(connection, collectorPDA);
      const bountyInfo = await program.account.bounty.fetch(bounty);
      const ammo = await getTokenAccount(player.publicKey, trader);

      const price = fromBN(bountyInfo.price, DECIMALS);
      const ammoBalance = fromBigInt(ammo.amount, DECIMALS);

      expect(ammoBalance).toBeGreaterThanOrEqual(price);

      await program.methods
        .playRound()
        .accounts({
          owner,
          bounty,
          bag,
          ammo: ammo.address,
        })
        .signers([player])
        .rpc();

      const collector = await getAccount(connection, collectorPDA);
      const ammoAfterRound = await getTokenAccount(player.publicKey, trader);

      expect(fromBigInt(collector.amount, DECIMALS)).toEqual(
        fromBigInt(collectorBeforeRound.amount, DECIMALS) + price
      );
      expect(fromBigInt(ammoAfterRound.amount, DECIMALS)).toEqual(
        ammoBalance - price
      );
    });

    it('Should receive the correct reward', async () => {
      const { owner, bounty, ammo } = accounts;
      const bountyInfo = await program.account.bounty.fetch(bounty);
      const bagBeforeRound = await getTokenAccount(player.publicKey, gem);

      const reward = fromBN(bountyInfo.reward, DECIMALS);
      const bagBalance = fromBigInt(bagBeforeRound.amount, DECIMALS);

      await program.methods
        .playRound()
        .accounts({
          owner,
          bounty,
          ammo,
          bag: bagBeforeRound.address,
        })
        .signers([player])
        .rpc();

      const playerAccount = await program.account.player.fetch(pda);
      const bag = await getTokenAccount(player.publicKey, gem);

      expect(fromBigInt(bag.amount, DECIMALS)).toEqual(
        bagBalance + (playerAccount.winner ? reward : 0)
      );
    });

    it('Should be able to play multiple rounds', async () => {
      const { owner, bounty, ammo, bag } = accounts;
      const { rounds } = await program.account.player.fetch(pda);

      await program.methods
        .playRound()
        .accounts({ owner, bounty, ammo, bag })
        .signers([player])
        .rpc();

      const { rounds: countAfterRound } = await program.account.player.fetch(
        pda
      );

      expect(countAfterRound).toEqual(rounds + 1);
    });
  });
});
