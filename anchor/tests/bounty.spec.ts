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
  toBN,
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
    beforeAll(async () => {
      const payer = supplier;

      const reserve = await createAssociatedTokenAccount(
        connection, // connection
        payer, // fee payer
        gem, // mint
        payer.publicKey // owner,
      );

      // const bag = await createAssociatedTokenAccount(
      //   connection, // connection
      //   payer, // fee payer
      //   trader, // mint
      //   payer.publicKey // owner,
      // );

      await Promise.all(
        [
          [gem, toBN(100_000_000, DECIMALS), reserve],
          // [trader, toBN(100, DECIMALS), bag],
        ].map(([mint, amount, receiver]) =>
          mintToChecked(
            connection, // connection
            payer, // fee payer
            mint, // mint
            receiver, // receiver (must be a token account)
            payer, // mint authority
            amount, // amount. if your decimals is 8, you mint 10^8 for 1 token.
            DECIMALS
          )
        )
      );

      accounts['reserve'] = reserve;
      // accounts['bag'] = bag;
    });

    it('Should forge and stockpile the stronghold for the gem', async () => {
      const { reserve: account } = accounts;

      await program.methods
        .forgeStronghold()
        .accounts(accounts)
        .signers([supplier])
        .rpc();

      const reserve = await getAccount(connection, account);
      await program.methods
        .stockpileGems(new BN(reserve.amount.toString()))
        .accounts(accounts)
        .signers([supplier])
        .rpc();
    });

    it('Should forge a stronghold for the trader', async () => {
      const { trader: gem } = accounts;

      // Forge a stronghold to test failure test cases.
      await program.methods
        .forgeStronghold()
        .accounts({ gem, supplier: supplier.publicKey })
        .signers([supplier])
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

  describe('Fund', () => {
    it(`Should fail to init and incorrect gem`, async () => {
      const { bounty: bountyPDA, trader } = accounts;
      const strongholdPDA = getStrongholdPDA(trader);
      const stronghold = await getAccount(connection, strongholdPDA);

      const bounty = await program.account.bounty.fetch(bountyPDA);
      const amount = BigInt(bounty.reward * 10);
      expect(stronghold.amount.toString()).toEqual('0');

      await expect(
        program.methods
          .fundBounty(new BN(amount.toString()))
          .accounts({
            bounty: bountyPDA,
            gem: trader,
            supplier: supplier.publicKey,
          })
          .signers([supplier])
          .rpc()
      ).rejects.toThrow(/InvalidGem/);
    });

    it(`Should init bounty vault and transport the gems from stronghold`, async () => {
      const { bounty: bountyPDA, vault: vaultPDA } = accounts;
      const strongholdPDA = getStrongholdPDA(gem);
      const strongholdBeforeTransport = await getAccount(
        connection,
        strongholdPDA
      );
      const bountyBeforeTransport = await program.account.bounty.fetch(
        bountyPDA
      );

      const amount = BigInt(bountyBeforeTransport.reward * 10);
      expect(bountyBeforeTransport.currentlyIssued.toString()).toEqual('0');
      expect(strongholdBeforeTransport.amount).toBeGreaterThanOrEqual(amount);

      await program.methods
        .fundBounty(new BN(amount))
        .accounts(accounts)
        .signers([supplier])
        .rpc();

      const stronghold = await getAccount(connection, strongholdPDA);
      const bounty = await program.account.bounty.fetch(bountyPDA);
      const vault = await getAccount(connection, vaultPDA);

      expect(vault.owner).toEqual(getKeeperPDA());
      expect(stronghold.amount).toEqual(
        strongholdBeforeTransport.amount - amount
      );
      expect(vault.amount.toString()).toEqual(amount.toString());
      expect(bounty.currentlyIssued.toString()).toEqual(
        vault.amount.toString()
      );
    });

    it('Should fail to fund bounty with uncollectible amount', async () => {
      const { bounty: bountyPDA } = accounts;
      const strongholdPDA = getStrongholdPDA(gem);
      const stronghold = await getAccount(connection, strongholdPDA);

      const bounty = await program.account.bounty.fetch(bountyPDA);
      const amount = BigInt(bounty.reward * 10.5); // Not a multiple of the bounty reward.
      expect(stronghold.amount).toBeGreaterThanOrEqual(amount);

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
      const strongholdPDA = getStrongholdPDA(trader);
      const stronghold = await getAccount(connection, strongholdPDA);

      const bounty = await program.account.bounty.fetch(bountyPDA);
      const amount = BigInt(bounty.reward * 10);
      expect(stronghold.amount.toString()).toEqual('0');

      await expect(
        program.methods
          .fundBounty(new BN(amount.toString()))
          .accounts({
            bounty: bountyPDA,
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
