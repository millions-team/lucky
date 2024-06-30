import * as anchor from '@coral-xyz/anchor';
import { BN } from '@coral-xyz/anchor';
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import {
  Account,
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
  getEscrowPDA,
  getBountyVaultPDA,
  toBN,
  TREASURE_FORGE_COST,
  TRADER_LAUNCH_COST,
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

    const bounty = getBountyPDA(task, gem, trader);
    accounts = {
      task,
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

  describe('Issue', () => {
    describe('Safeguarded gem', () => {
      it('Should initialize a bounty', async () => {
        const { gem, task, trader } = accounts;
        const settings = {
          reward: toBN(1000, DECIMALS),
          price: toBN(0.5, DECIMALS),
        };

        await program.methods
          .issueBounty(settings)
          .accounts(accounts)
          .signers([supplier])
          .rpc();

        const bountyPDA = getBountyPDA(task, gem, trader);
        const bounty = await program.account.bounty.fetch(bountyPDA);

        expect(bounty.owner).toEqual(supplier.publicKey);
        expect(bounty.task).toEqual(task);

        expect(bounty.gem).toEqual(gem);
        expect(bounty.reward.toString()).toEqual(settings.reward.toString());

        expect(bounty.price.toString()).toEqual(settings.price.toString());
        expect(bounty.trader).toEqual(trader);

        expect(bounty.currentlyIssued.toString()).toEqual('0');
        expect(bounty.winners).toEqual(0);
        expect(bounty.totalClaimed.toString()).toEqual('0');
      });
    });

    describe('Unknown gem', () => {
      let gem: PublicKey;

      beforeAll(async () => {
        gem = await createMint(
          connection, // conneciton
          supplier, // fee payer
          supplier.publicKey, // mint authority
          null, // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
          DECIMALS
        );
      });

      it('Should fail to initialize a bounty', async () => {
        const { task, trader } = accounts;
        const settings = {
          reward: toBN(1000, DECIMALS),
          price: toBN(0.5, DECIMALS),
        };

        await expect(
          program.methods
            .issueBounty(settings)
            .accounts({ task, trader, supplier: supplier.publicKey, gem })
            .signers([supplier])
            .rpc()
        ).rejects.toThrow(/stronghold(.+)AccountNotInitialized/);
      });
    });
  });

  describe('Fund', () => {
    let reserve: Account;

    beforeAll(async () => {
      const reserve = await getTokenAccount(supplier.publicKey, gem);
      await mintTo(reserve.address, toBN(100_000_000, DECIMALS), gem);

      accounts['reserve'] = reserve.address;
      // accounts['bag'] = bag;
    });

    beforeEach(async () => {
      reserve = await getTokenAccount(supplier.publicKey, gem);
    });

    it(`Should fail to init and incorrect gem`, async () => {
      const { bounty: bountyPDA, trader } = accounts;
      const reserve = await getTokenAccount(supplier.publicKey, trader);

      const bounty = await program.account.bounty.fetch(bountyPDA);
      const amount = BigInt(bounty.reward * 10);

      await expect(
        program.methods
          .fundBounty(new BN(amount.toString()))
          .accounts({
            supplier: supplier.publicKey,
            reserve: reserve.address,
            bounty: bountyPDA,
            gem: trader,
          })
          .signers([supplier])
          .rpc()
      ).rejects.toThrow(/InvalidGem/);
    });

    it(`Should init bounty vault and transport the gems from reserve`, async () => {
      const { bounty: bountyPDA, vault: vaultPDA } = accounts;
      const bountyBeforeTransport = await program.account.bounty.fetch(
        bountyPDA
      );

      const amount = BigInt(bountyBeforeTransport.reward * 10);
      expect(bountyBeforeTransport.currentlyIssued.toString()).toEqual('0');
      expect(reserve.amount).toBeGreaterThanOrEqual(amount);

      await program.methods
        .fundBounty(new BN(amount))
        .accounts(accounts)
        .signers([supplier])
        .rpc();

      const reserveAfterTransport = await getAccount(
        connection,
        reserve.address
      );
      const bounty = await program.account.bounty.fetch(bountyPDA);
      const vault = await getAccount(connection, vaultPDA);

      expect(vault.owner).toEqual(getEscrowPDA());
      expect(reserveAfterTransport.amount).toEqual(reserve.amount - amount);
      expect(vault.amount.toString()).toEqual(amount.toString());
      expect(bounty.currentlyIssued.toString()).toEqual(
        vault.amount.toString()
      );
    });

    it('Should fail to fund bounty with uncollectible amount', async () => {
      const { bounty: bountyPDA } = accounts;

      const bounty = await program.account.bounty.fetch(bountyPDA);
      const amount = BigInt(bounty.reward * 10.5); // Not a multiple of the bounty reward.
      expect(reserve.amount).toBeGreaterThanOrEqual(amount);

      await expect(
        program.methods
          .fundBounty(new BN(amount.toString()))
          .accounts(accounts)
          .signers([supplier])
          .rpc()
      ).rejects.toThrow(/UncollectibleReward/);
    });

    it(`Should fail to fund and incorrect gem`, async () => {
      const { bounty: bountyPDA, trader } = accounts;
      const reserve = await getTokenAccount(supplier.publicKey, trader);
      const bounty = await program.account.bounty.fetch(bountyPDA);
      const amount = BigInt(bounty.reward * 10);

      await expect(
        program.methods
          .fundBounty(new BN(amount.toString()))
          .accounts({
            bounty: bountyPDA,
            reserve: reserve.address,
            gem: trader,
            supplier: supplier.publicKey,
          })
          .signers([supplier])
          .rpc()
      ).rejects.toThrow(/ConstraintTokenMint/);
    });
  });

  describe('Renew', () => {
    it('Should fail to update bounty settings if not owner', async () => {
      const { bounty } = accounts;
      const notOwner = Keypair.generate();
      const settings = {
        reward: toBN(2000, DECIMALS),
        price: toBN(1, DECIMALS),
      };

      await expect(
        program.methods
          .renewBounty(settings)
          .accounts({ bounty, supplier: notOwner.publicKey })
          .signers([notOwner])
          .rpc()
      ).rejects.toThrow(/InvalidOwner/);
    });

    it('Should fail if vault amount is not bellow the threshold', async () => {
      const settings = {
        reward: toBN(4000, DECIMALS),
        price: toBN(2, DECIMALS),
      };

      await expect(
        program.methods
          .renewBounty(settings)
          .accounts(accounts)
          .signers([supplier])
          .rpc()
      ).rejects.toThrow(/ThresholdNotReached/);
    });
  });
});
