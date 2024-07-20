import * as anchor from '@coral-xyz/anchor';
import { BN } from '@coral-xyz/anchor';
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import {
  type Account,
  createAssociatedTokenAccount,
  createMint,
  getAccount,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  mintToChecked,
} from '@solana/spl-token';
import { CHAINLINK_STORE_PROGRAM_ID } from '@chainlink/solana-sdk';

import {
  getGamesProgram,
  getKeeperPDA,
  getEscrowPDA,
  getTollkeeperPDA,
  getTreasurePDA,
  getStrongholdPDA,
  getCollectorPDA,
  getStorePDA,
  TREASURE_FORGE_COST,
  TRADER_LAUNCH_COST,
  toBN,
  toBigInt,
  fromBigInt,
} from '../src/games-exports';

const DECIMALS = 8;
// Chainlink MAIN-NET feed (SOL/USD)
const feed = new PublicKey('CH31Xns5z3M1cTAbKW34jcxPPciazARpijcHj9rxtemt');

// This could make the tests fail if loaded account have a HUGE difference in price.
const RATE = toBigInt(15726570000); // 157.26570000 USD/SOL
const PRICE = toBigInt(1, 8); // Rate have 8 decimals
describe('Treasure', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = getGamesProgram(provider);
  const connection = provider.connection;

  let gem: PublicKey;
  let trader: PublicKey;
  let secondTrader: PublicKey;
  let accounts: Record<string, PublicKey>;
  const authority = Keypair.generate();

  beforeAll(async () => {
    const { payer } = provider.wallet as anchor.Wallet;

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
      DECIMALS / 2
    );

    const ata = await createAssociatedTokenAccount(
      connection, // connection
      payer, // fee payer
      gem, // mint
      payer.publicKey // owner,
    );

    accounts = {
      keeper: getKeeperPDA(),
      escrow: getEscrowPDA(),
      tollkeeper: getTollkeeperPDA(),
      treasure: getTreasurePDA(),
      stronghold: getStrongholdPDA(gem),
      gem,
      trader,
    };

    await mintToChecked(
      connection, // connection
      payer, // fee payer
      gem, // mint
      ata, // receiver (should be a token account)
      payer, // mint authority
      1000 * 10 ** DECIMALS, // amount. if your decimals is 8, you mint 10^8 for 1 token.
      DECIMALS
    );
  });

  describe('Build', () => {
    beforeAll(async () => {
      const tx = await connection.requestAirdrop(
        authority.publicKey,
        0.1 * LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(tx);
    });

    it('Should create the keeper, escrow, tollkeeper, and treasure accounts', async () => {
      const { treasure: pda } = accounts;
      const _ = await program.account.treasure.fetchNullable(pda);
      expect(_).toBeNull();

      await program.methods
        .createTreasure()
        .accounts({ authority: authority.publicKey })
        .signers([authority])
        .rpc();

      const keeper = await connection.getAccountInfo(accounts.keeper);
      const escrow = await connection.getAccountInfo(accounts.escrow);
      const tollkeeper = await connection.getAccountInfo(accounts.tollkeeper);
      const treasure = await program.account.treasure.fetch(pda);

      expect(keeper.owner).toEqual(program.programId);
      expect(escrow.owner).toEqual(program.programId);
      expect(tollkeeper.owner).toEqual(program.programId);
      expect(treasure.authority).toEqual(authority.publicKey);
    });

    it('Should fail to create the treasure if it already exists', async () => {
      await expect(
        program.methods
          .createTreasure()
          .accounts({ authority: authority.publicKey })
          .signers([authority])
          .rpc()
      ).rejects.toThrow(/custom program error: 0x0/);
    });
  });

  describe('Forge', () => {
    describe('By Authority', () => {
      let gem: PublicKey;

      beforeAll(async () => {
        gem = await createMint(
          connection, // conneciton
          authority, // fee payer
          authority.publicKey, // mint authority
          null, // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
          DECIMALS
        );
      });

      it('Should forge a stronghold without charge', async () => {
        const balance = await connection.getBalance(authority.publicKey);
        expect(balance).toBeLessThan(TREASURE_FORGE_COST * LAMPORTS_PER_SOL);

        await program.methods
          .forgeStronghold()
          .accounts({ gem, supplier: authority.publicKey })
          .signers([authority])
          .rpc();

        const stronghold = await getAccount(connection, getStrongholdPDA(gem));
        expect(stronghold.owner).toEqual(accounts.keeper);
        expect(stronghold.mint).toEqual(gem);
        expect(stronghold.amount.toString()).toEqual('0');
      });
    });

    describe('By Non-Authority', () => {
      const payer = Keypair.generate();

      beforeAll(async () => {
        const tx = await connection.requestAirdrop(
          payer.publicKey,
          (TREASURE_FORGE_COST + 0.01) * LAMPORTS_PER_SOL
        );
        await connection.confirmTransaction(tx);
      });

      it('Should forge a Stronghold and charge the payer for the cost', async () => {
        const { gem, keeper } = accounts;
        const balanceBeforeForge = await connection.getBalance(keeper);
        const cost = TREASURE_FORGE_COST * LAMPORTS_PER_SOL;

        await program.methods
          .forgeStronghold()
          .accounts({ gem, supplier: payer.publicKey })
          .signers([payer])
          .rpc();

        const stronghold = await getAccount(connection, accounts.stronghold);
        const balance = await connection.getBalance(keeper);

        expect(balance).toEqual(balanceBeforeForge + cost);
        expect(stronghold.owner).toEqual(accounts.keeper);
        expect(stronghold.mint).toEqual(gem);
        expect(stronghold.amount.toString()).toEqual('0');
      });
    });
  });

  describe('Launch', () => {
    describe('By Authority', () => {
      beforeAll(async () => {
        secondTrader = await createMint(
          connection, // conneciton
          authority, // fee payer
          authority.publicKey, // mint authority
          null, // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
          DECIMALS
        );
      });

      it('Should launch a tollkeeper collector', async () => {
        const { tollkeeper } = accounts;
        const balance = await connection.getBalance(authority.publicKey);
        expect(balance).toBeLessThan(TRADER_LAUNCH_COST * LAMPORTS_PER_SOL);

        await program.methods
          .launchEscrow()
          .accounts({ supplier: authority.publicKey, trader: secondTrader })
          .signers([authority])
          .rpc();

        const collector = await getAccount(
          connection,
          getCollectorPDA(secondTrader)
        );
        expect(collector.owner).toEqual(tollkeeper);
        expect(collector.mint).toEqual(secondTrader);
        expect(collector.amount.toString()).toEqual('0');
      });
    });

    describe('By Non-Authority', () => {
      const payer = Keypair.generate();

      beforeAll(async () => {
        const tx = await connection.requestAirdrop(
          payer.publicKey,
          (TRADER_LAUNCH_COST + 0.1) * LAMPORTS_PER_SOL
        );
        await connection.confirmTransaction(tx);
      });

      it('Should launch a tollkeeper collector and charge the payer for the cost', async () => {
        const { trader, tollkeeper } = accounts;
        const balanceBeforeLaunch = await connection.getBalance(tollkeeper);
        const cost = TRADER_LAUNCH_COST * LAMPORTS_PER_SOL;

        await program.methods
          .launchEscrow()
          .accounts({ supplier: payer.publicKey, trader })
          .signers([payer])
          .rpc();

        const collector = await getAccount(connection, getCollectorPDA(trader));
        const balance = await connection.getBalance(tollkeeper);

        expect(balance).toEqual(balanceBeforeLaunch + cost);
        expect(collector.owner).toEqual(tollkeeper);
        expect(collector.mint).toEqual(trader);
        expect(collector.amount.toString()).toEqual('0');
      });
    });
  });

  describe('Deposit', () => {
    const { payer } = provider.wallet as anchor.Wallet;
    const sender = Keypair.generate();
    let reserve: PublicKey;
    let senderAccount: Account;

    beforeAll(async () => {
      const { address } = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        gem,
        sender.publicKey
      );

      reserve = address;
      await mintToChecked(
        connection,
        payer,
        gem,
        reserve,
        payer,
        10 * 10 ** DECIMALS,
        DECIMALS
      );
    });

    beforeEach(async () => {
      senderAccount = await getAccount(connection, reserve);
    });

    it('Should store gems', async () => {
      const { stronghold } = accounts;

      const { amount } = senderAccount;
      const vaultBeforeDeposit = await getAccount(connection, stronghold);

      await program.methods
        .stockpileGems(new BN(amount))
        .accounts({
          ...accounts,
          supplier: sender.publicKey,
          reserve,
        })
        .signers([sender])
        .rpc();

      const vaultAccount = await getAccount(connection, stronghold);
      const senderAfterDeposit = await getAccount(connection, reserve);
      expect(vaultAccount.amount).toEqual(vaultBeforeDeposit.amount + amount);
      expect(senderAfterDeposit.amount.toString()).toEqual('0');
    });
  });

  describe('Withdraw', () => {
    describe('By Authority', () => {
      let reserve: PublicKey;

      beforeAll(async () => {
        reserve = await createAssociatedTokenAccount(
          connection,
          authority,
          gem,
          authority.publicKey
        );
      });

      it('Should withdraw gems', async () => {
        const { stronghold } = accounts;
        const reserveBeforeWithdraw = await getAccount(connection, reserve);
        const strongholdBeforeWithdraw = await getAccount(
          connection,
          stronghold
        );

        const amount = strongholdBeforeWithdraw.amount / BigInt(2);
        expect(amount).toBeGreaterThan(0);

        await program.methods
          .retrieveGems(new BN(amount))
          .accounts({ gem, reserve, authority: authority.publicKey })
          .signers([authority])
          .rpc();

        const reserveAfterWithdraw = await getAccount(connection, reserve);
        const strongholdAfterWithdraw = await getAccount(
          connection,
          stronghold
        );
        expect(strongholdAfterWithdraw.amount).toEqual(
          strongholdBeforeWithdraw.amount - amount
        );
        expect(reserveAfterWithdraw.amount).toEqual(
          reserveBeforeWithdraw.amount + amount
        );
      });
    });

    describe('By Non-Authority', () => {
      const receiver = Keypair.generate();
      let reserve: PublicKey;

      beforeAll(async () => {
        const tx = await connection.requestAirdrop(
          receiver.publicKey,
          0.01 * LAMPORTS_PER_SOL
        );
        await connection.confirmTransaction(tx);

        reserve = await createAssociatedTokenAccount(
          connection,
          receiver,
          gem,
          receiver.publicKey
        );
      });

      it('Should fail with InvalidAuthority', async () => {
        const { stronghold } = accounts;
        const vaultBeforeWithdraw = await getAccount(connection, stronghold);
        const amount = vaultBeforeWithdraw.amount * BigInt(2);
        expect(amount).toBeGreaterThan(0);

        await expect(
          program.methods
            .retrieveGems(new BN(amount))
            .accounts({ gem, reserve, authority: receiver.publicKey })
            .signers([receiver])
            .rpc()
        ).rejects.toThrow(/InvalidAuthority/);
      });
    });
  });

  describe('Store', () => {
    let storePda: PublicKey;

    beforeAll(async () => {
      storePda = getStorePDA(trader, feed);
    });

    describe('Define', () => {
      describe('By Authority', () => {
        it('Should define a new store for the trader', async () => {
          const price = toBN(0.5, DECIMALS);

          await program.methods
            .launchStore({ price })
            .accounts({ authority: authority.publicKey, trader, feed })
            .signers([authority])
            .rpc();

          const store = await program.account.store.fetch(storePda);

          expect(store.feed).toEqual(feed);
          expect(store.trader).toEqual(trader);
          expect(store.price).toEqual(price);
        });

        it('Should update the store price', async () => {
          const price = new BN(PRICE.toString()); // 1 USD/TRADER => This will be the last price
          const existingStore = await program.account.store.fetch(storePda);
          expect(existingStore.price).not.toEqual(price);

          await program.methods
            .launchStore({ price })
            .accounts({ authority: authority.publicKey, trader, feed })
            .signers([authority])
            .rpc();

          const store = await program.account.store.fetch(storePda);

          expect(store.feed).toEqual(feed);
          expect(store.trader).toEqual(trader);
          expect(store.price).toEqual(price);
        });
      });

      describe('By Non-Authority', () => {
        const payer = Keypair.generate();

        beforeAll(async () => {
          const tx = await connection.requestAirdrop(
            payer.publicKey,
            0.1 * LAMPORTS_PER_SOL
          );
          await connection.confirmTransaction(tx);
        });

        it('Should fail to define a new store | Only Treasure Authority allowed', async () => {
          await expect(
            program.methods
              .launchStore({ price: toBN(100) })
              .accounts({
                authority: payer.publicKey,
                trader: secondTrader,
                feed,
              })
              .signers([payer])
              .rpc()
          ).rejects.toThrow(/InvalidAuthority/);
        });
      });
    });

    describe('Stock', () => {
      const { payer } = provider.wallet as anchor.Wallet;
      const sender = Keypair.generate();
      let reserve: PublicKey;
      let senderAccount: Account;

      beforeAll(async () => {
        const { address } = await getOrCreateAssociatedTokenAccount(
          connection,
          payer,
          trader,
          sender.publicKey
        );

        reserve = address;
        await mintToChecked(
          connection,
          payer,
          trader,
          reserve,
          payer,
          toBigInt(1000000000, DECIMALS / 2),
          DECIMALS / 2
        );
      });

      beforeEach(async () => {
        senderAccount = await getAccount(connection, reserve);
      });

      it('Should fill collector vault with trader', async () => {
        const collector = getCollectorPDA(trader);

        const { amount } = senderAccount;
        const vaultBeforeDeposit = await getAccount(connection, collector);
        expect(amount).toBeGreaterThan(0);

        await program.methods
          .storeFill(new BN(amount))
          .accounts({
            trader,
            reserve,
            supplier: sender.publicKey,
          })
          .signers([sender])
          .rpc();

        const vaultAccount = await getAccount(connection, collector);
        const senderAfterDeposit = await getAccount(connection, reserve);
        expect(vaultAccount.amount).toEqual(vaultBeforeDeposit.amount + amount);
        expect(senderAfterDeposit.amount.toString()).toEqual('0');
      });
    });

    describe('Sale', () => {
      const receiver = Keypair.generate();
      let reserve: PublicKey;
      const chainlinkProgram = CHAINLINK_STORE_PROGRAM_ID;

      beforeAll(async () => {
        const tx = await connection.requestAirdrop(
          receiver.publicKey,
          50 * LAMPORTS_PER_SOL
        );
        await connection.confirmTransaction(tx);

        reserve = await getAssociatedTokenAddress(receiver.publicKey, trader);
      });

      it('Should initialize the payer account on first purchase', async () => {
        await expect(getAccount(connection, reserve)).rejects.toThrow();
        const amount = toBigInt(200, DECIMALS / 2);

        await program.methods
          .storeFirstTrade(new BN(amount.toString()))
          .accounts({
            payer: receiver.publicKey,
            receiver: reserve,
            store: storePda,
            trader,
            feed,
            chainlinkProgram,
          })
          .signers([receiver])
          .rpc();

        const payerAccountAfter = await getAccount(connection, reserve);
        expect(payerAccountAfter.amount).toEqual(amount);
      });

      it('Should purchase some trader tokens from the store', async () => {
        const amount = toBigInt(10, DECIMALS / 2);
        const balanceBeforePurchase = await getAccount(connection, reserve);
        const collector = await getAccount(connection, getCollectorPDA(trader));
        expect(collector.amount).toBeGreaterThan(amount);

        await program.methods
          .storeSale(new BN(amount.toString()))
          .accounts({
            trader,
            feed,
            receiver: reserve,
            payer: receiver.publicKey,
            chainlinkProgram,
          })
          .signers([receiver])
          .rpc();

        const balance = await getAccount(connection, reserve);
        expect(balance.amount.toString()).toEqual(
          (balanceBeforePurchase.amount + amount).toString()
        );
      });

      it('Should charge the receiver for the purchase', async () => {
        const balance = await connection.getBalance(receiver.publicKey);

        const gas = 1 / fromBigInt(RATE, 8);
        const rate = Number(PRICE) / Number(RATE);
        const available = balance / LAMPORTS_PER_SOL - gas;
        const amount = toBN(available / rate, DECIMALS / 2);

        const collector = await getAccount(connection, getCollectorPDA(trader));
        expect(collector.amount).toBeGreaterThan(amount.toNumber());

        await program.methods
          .storeSale(amount)
          .accounts({
            trader,
            feed,
            receiver: reserve,
            payer: receiver.publicKey,
            chainlinkProgram,
          })
          .signers([receiver])
          .rpc();

        const balanceAfter = await connection.getBalance(receiver.publicKey);
        expect(balanceAfter / (gas * LAMPORTS_PER_SOL)).toBeCloseTo(1, 0);
      });

      it('Should fail with not enough balance', async () => {
        const amount = toBN(10, DECIMALS / 2);

        await expect(
          program.methods
            .storeSale(amount)
            .accounts({
              trader,
              feed,
              receiver: reserve,
              payer: receiver.publicKey,
              chainlinkProgram,
            })
            .signers([receiver])
            .rpc()
        ).rejects.toThrow(/custom program error: 0x1/);
      });
    });

    describe('Withdraw', () => {
      describe('By Non-Authority', () => {
        const payer = Keypair.generate();

        beforeAll(async () => {
          const tx = await connection.requestAirdrop(
            payer.publicKey,
            0.1 * LAMPORTS_PER_SOL
          );
          await connection.confirmTransaction(tx);
        });

        it('Should fail to withdraw from store | Only Store Authority allowed', async () => {
          const { trader } = accounts;

          await expect(
            program.methods
              .storeWithdraw(new BN(0))
              .accounts({ store: storePda, authority: payer.publicKey })
              .signers([payer])
              .rpc()
          ).rejects.toThrow(/InvalidAuthority/);
        });
      });

      describe('By Authority', () => {
        it('Should withdraw amount from store balance', async () => {
          const storeBalanceBeforeWithdraw = await connection.getBalance(
            storePda
          );
          const receiverBalanceBeforeWithdraw = await connection.getBalance(
            authority.publicKey
          );
          const rent = await connection.getMinimumBalanceForRentExemption(88);
          const amount = Math.floor((storeBalanceBeforeWithdraw - rent) / 2);

          expect(storeBalanceBeforeWithdraw).toBeGreaterThan(rent);
          expect(amount).toBeGreaterThan(0);

          await program.methods
            .storeWithdraw(new BN(amount))
            .accounts({ store: storePda, authority: authority.publicKey })
            .signers([authority])
            .rpc();

          const storeBalance = await connection.getBalance(storePda);
          const receiverBalance = await connection.getBalance(
            authority.publicKey
          );

          expect(storeBalance).toEqual(storeBalanceBeforeWithdraw - amount);

          const expectedReceiverBalance =
            receiverBalanceBeforeWithdraw + amount;
          expect(expectedReceiverBalance / receiverBalance).toBeCloseTo(1);
        });

        it('Should withdraw all available balance from store', async () => {
          const storeBalanceBeforeWithdraw = await connection.getBalance(
            storePda
          );
          const receiverBalanceBeforeWithdraw = await connection.getBalance(
            authority.publicKey
          );
          const rent = await connection.getMinimumBalanceForRentExemption(88);

          expect(storeBalanceBeforeWithdraw).toBeGreaterThan(rent);

          await program.methods
            .storeWithdraw(new BN(0))
            .accounts({ store: storePda, authority: authority.publicKey })
            .signers([authority])
            .rpc();

          const storeBalance = await connection.getBalance(storePda);
          const receiverBalance = await connection.getBalance(
            authority.publicKey
          );

          const amount = storeBalanceBeforeWithdraw - rent;
          expect(storeBalance).toEqual(rent);

          const expectedReceiverBalance =
            receiverBalanceBeforeWithdraw + amount;
          expect(expectedReceiverBalance / receiverBalance).toBeCloseTo(1);
        });
      });
    });
  });
});
