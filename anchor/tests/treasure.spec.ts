import * as anchor from '@coral-xyz/anchor';
import { BN } from '@coral-xyz/anchor';
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import {
  Account,
  createAssociatedTokenAccount,
  createMint,
  getAccount,
  getOrCreateAssociatedTokenAccount,
  mintToChecked,
} from '@solana/spl-token';

import {
  getGamesProgram,
  getKeeperPDA,
  getEscrowPDA,
  getTollkeeperPDA,
  getTreasurePDA,
  getStrongholdPDA,
  getCollectorPDA,
  TREASURE_FORGE_COST,
  TRADER_LAUNCH_COST,
} from '../src/games-exports';

describe('Treasure', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = getGamesProgram(provider);
  const connection = provider.connection;

  let gem: PublicKey;
  let trader: PublicKey;
  let accounts: Record<string, PublicKey>;
  const authority = Keypair.generate();

  beforeAll(async () => {
    const { payer } = provider.wallet as anchor.Wallet;

    gem = await createMint(
      connection, // conneciton
      payer, // fee payer
      payer.publicKey, // mint authority
      null, // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
      8 // decimals
    );

    trader = await createMint(
      connection, // conneciton
      payer, // fee payer
      payer.publicKey, // mint authority
      null, // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
      8 // decimals
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
      1000e8, // amount. if your decimals is 8, you mint 10^8 for 1 token.
      8 // decimals
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
          8 // decimals
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
      let trader: PublicKey;

      beforeAll(async () => {
        trader = await createMint(
          connection, // conneciton
          authority, // fee payer
          authority.publicKey, // mint authority
          null, // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
          8 // decimals
        );
      });

      it('Should launch a tollkeeper collector', async () => {
        const { tollkeeper } = accounts;
        const balance = await connection.getBalance(authority.publicKey);
        expect(balance).toBeLessThan(TRADER_LAUNCH_COST * LAMPORTS_PER_SOL);

        await program.methods
          .launchEscrow()
          .accounts({ supplier: authority.publicKey, trader })
          .signers([authority])
          .rpc();

        const collector = await getAccount(connection, getCollectorPDA(trader));
        expect(collector.owner).toEqual(tollkeeper);
        expect(collector.mint).toEqual(trader);
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
      await mintToChecked(connection, payer, gem, reserve, payer, 10e8, 8);
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
});
