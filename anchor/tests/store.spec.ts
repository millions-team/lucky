import * as anchor from '@coral-xyz/anchor';
import { BN, Program } from '@coral-xyz/anchor';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import {
  Account,
  createAssociatedTokenAccount,
  createMint,
  getAccount,
  mintToChecked,
} from '@solana/spl-token';

import {
  Store,
  getStorePDA,
  getStoreVaultPDA,
  getMintAuthorityPDA,
} from '../src/store-exports';

describe('store', () => {
  const RATE = 13249075000; // USD/SOL price from chainlink on-chain data feed.

  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Store as Program<Store>;
  const connection = provider.connection;

  let mint: PublicKey;
  let accounts: Record<string, PublicKey>;
  let vaultPDA: PublicKey;

  beforeAll(async () => {
    const { payer } = provider.wallet as anchor.Wallet;

    mint = await createMint(
      connection, // connection
      payer, // fee payer
      payer.publicKey, // mint authority
      null, // freeze authority
      9 // decimals
    );

    const ata = await createAssociatedTokenAccount(
      connection, // connection
      payer, // fee payer
      mint, // mint
      payer.publicKey // owner,
    );

    accounts = {
      store: getStorePDA(payer.publicKey, mint),
      owner: payer.publicKey,
      tokenMint: mint,
      targetAccount: ata,
    };

    vaultPDA = getStoreVaultPDA(accounts.store);

    await mintToChecked(
      connection,
      payer,
      mint,
      ata, // receiver (should be a token account)
      payer, // mint authority
      1000e8, // amount. if your decimals is 8, you mint 10^8 for 1 token.
      9 // decimals
    );
  });

  it('Should initialize the store', async () => {
    const { payer } = provider.wallet as anchor.Wallet;
    const price = new BN((10 * 10 ** 8) / RATE);

    await program.methods
      .initialize(price)
      .accounts(accounts)
      .signers([payer])
      .rpc();

    const { store } = accounts;
    const storeAccount = await program.account.store.fetch(store);

    expect(storeAccount.price.toString()).toEqual(price.toString());
    expect(storeAccount.mint).toEqual(mint);
  });

  it('Should initialize the store vault', async () => {
    const { payer } = provider.wallet as anchor.Wallet;

    await program.methods
      .initializeVault()
      .accounts(accounts)
      .signers([payer])
      .rpc();

    const vaultAccount = await getAccount(connection, vaultPDA);
    const authorityPDA = getMintAuthorityPDA();

    expect(vaultAccount.owner).toEqual(authorityPDA);
    expect(vaultAccount.amount.toString()).toEqual('0');
  });

  describe('Deposit', () => {
    it('Should deposit tokens', async () => {
      const { payer } = provider.wallet as anchor.Wallet;

      const { targetAccount } = accounts;

      const senderAccount = await getAccount(connection, targetAccount);
      const vaultBeforeDeposit = await getAccount(connection, vaultPDA);
      const { amount } = senderAccount;

      await program.methods
        .deposit(new BN(amount))
        .accounts(accounts)
        .signers([payer])
        .rpc();

      const vaultAccount = await getAccount(connection, vaultPDA);
      const senderAfterDeposit = await getAccount(connection, targetAccount);

      expect(vaultAccount.amount).toEqual(vaultBeforeDeposit.amount + amount);
      expect(senderAfterDeposit.amount.toString()).toEqual('0');
    });
  });

  describe('Sell', () => {
    // TODO: This rate should be fetched from chainlink data feed.
    const GAS = 0.0005 * LAMPORTS_PER_SOL; // 0.0005 SOL

    const receiver = {} as {
      account: Account;
      balance: number;
      publicKey: PublicKey;
      tokenAccount: PublicKey;
    };

    beforeAll(async () => {
      receiver.publicKey = accounts.owner;
      receiver.tokenAccount = accounts.targetAccount;
    });

    beforeEach(async () => {
      receiver.account = await getAccount(connection, receiver.tokenAccount);
      receiver.balance = await connection.getBalance(receiver.publicKey);
    });

    it('Should sell tokens', async () => {
      const { payer } = provider.wallet as anchor.Wallet;

      const vaultBeforeSell = await getAccount(connection, vaultPDA);
      const amount = vaultBeforeSell.amount / BigInt(2);
      expect(amount).toBeGreaterThan(BigInt(0));

      await program.methods
        .sell(new BN(amount))
        .accounts({
          ...accounts,
        })
        .signers([payer])
        .rpc();

      const vaultAccount = await getAccount(connection, vaultPDA);
      const receiverAfterWithdraw = await getAccount(
        connection,
        receiver.tokenAccount
      );

      expect(vaultAccount.amount).toEqual(vaultBeforeSell.amount - amount);
      expect(receiverAfterWithdraw.amount).toEqual(
        receiver.account.amount + amount
      );
    });

    it('Should charge the correct amount', async () => {
      const { payer } = provider.wallet as anchor.Wallet;
      const { store } = accounts;

      const storeBalanceBeforeSell = await connection.getBalance(store);
      const vaultAccount = await getAccount(connection, vaultPDA);
      const amount = vaultAccount.amount / BigInt(2);
      expect(amount).toBeGreaterThan(BigInt(0));

      const tx = await program.methods
        .sell(new BN(amount))
        .accounts(accounts)
        .signers([payer])
        .rpc();

      // fetch tx + fee + gas
      // const tran = await connection.getParsedTransaction(tx);
      // const txCost = tran.meta?.fee || 0;

      const { price } = await program.account.store.fetch(store);
      const receiverBalanceAfterSell = await connection.getBalance(
        receiver.publicKey
      );
      const storeBalance = await connection.getBalance(store);

      const priceInSol = Math.floor(
        (price.toNumber() * LAMPORTS_PER_SOL) / RATE
      );
      const cost = Math.floor((Number(amount) * priceInSol) / LAMPORTS_PER_SOL);

      // const gas = receiver.balance - receiverBalanceAfterSell - cost;
      // expect(gas).toBeLessThanOrEqual(GAS);
      expect(receiverBalanceAfterSell).toBeLessThanOrEqual(
        receiver.balance - cost
      );
      expect(storeBalance).toEqual(storeBalanceBeforeSell + cost);
    });
  });

  describe('Update', () => {
    it('Should update the store', async () => {
      const { payer } = provider.wallet as anchor.Wallet;
      const { store } = accounts;
      const { price: priceBeforeUpdate } = await program.account.store.fetch(
        store
      );
      const newPrice = priceBeforeUpdate.add(new BN(1000));

      await program.methods
        .update(newPrice)
        .accounts(accounts)
        .signers([payer])
        .rpc();

      const { price } = await program.account.store.fetch(store);

      expect(price.toString()).toEqual(newPrice.toString());
    });
  });

  describe('Withdraw', () => {
    beforeAll(async () => {
      const { store } = accounts;
      // transfer some SOL to the store
      const tx = await connection.requestAirdrop(store, 5 * LAMPORTS_PER_SOL);
      await connection.confirmTransaction(tx);
    });

    it('Should withdraw store lamports', async () => {
      const { payer } = provider.wallet as anchor.Wallet;
      const { store } = accounts;

      const storeBalanceBeforeWithdraw = await connection.getBalance(store);
      const receiverBalanceBeforeWithdraw = await connection.getBalance(
        payer.publicKey
      );
      const rent = await connection.getMinimumBalanceForRentExemption(48);
      const amount = Math.floor((storeBalanceBeforeWithdraw - rent) / 2);

      expect(storeBalanceBeforeWithdraw).toBeGreaterThan(rent);
      expect(amount).toBeGreaterThan(0);

      await program.methods
        .withdraw(new BN(amount))
        .accounts(accounts)
        .signers([payer])
        .rpc();

      const storeBalance = await connection.getBalance(store);
      const receiverBalance = await connection.getBalance(payer.publicKey);

      expect(storeBalance).toEqual(storeBalanceBeforeWithdraw - amount);

      const expectedReceiverBalance = receiverBalanceBeforeWithdraw + amount;
      expect(expectedReceiverBalance / receiverBalance).toBeCloseTo(1);
    });
  });

  describe('Close', () => {
    it('Should close the store', async () => {
      const { payer } = provider.wallet as anchor.Wallet;

      await program.methods.close().accounts(accounts).signers([payer]).rpc();

      const { store } = accounts;
      const storeAccount = await program.account.store.fetchNullable(store);

      expect(storeAccount).toBeNull();
    });
  });
});
