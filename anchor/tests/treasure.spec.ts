import * as anchor from '@coral-xyz/anchor';
import { BN, Program } from '@coral-xyz/anchor';
import { Keypair, PublicKey } from '@solana/web3.js';
import {
  Account,
  createAssociatedTokenAccount,
  createMint,
  getAccount,
  getOrCreateAssociatedTokenAccount,
  mintToChecked,
} from '@solana/spl-token';

import { Games } from '../target/types/games';
import { getKeeperPDA, getStrongholdPDA } from '../src/games-exports';

describe('Treasure', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Games as Program<Games>;
  const connection = provider.connection;

  let mint: PublicKey;
  let accounts: Record<string, PublicKey>;

  beforeAll(async () => {
    const { payer } = provider.wallet as anchor.Wallet;

    mint = await createMint(
      connection, // conneciton
      payer, // fee payer
      payer.publicKey, // mint authority
      null, // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
      8 // decimals
    );

    const ata = await createAssociatedTokenAccount(
      connection, // connection
      payer, // fee payer
      mint, // mint
      payer.publicKey // owner,
    );

    accounts = {
      keeper: getKeeperPDA(),
      stronghold: getStrongholdPDA(mint),
      supplier: payer.publicKey,
      gem: mint,
    };

    await mintToChecked(
      connection, // connection
      payer, // fee payer
      mint, // mint
      ata, // receiver (should be a token account)
      payer, // mint authority
      1000e8, // amount. if your decimals is 8, you mint 10^8 for 1 token.
      8 // decimals
    );
  });

  it('Should initialize Keeper & Stronghold', async () => {
    const { payer } = provider.wallet as anchor.Wallet;

    await program.methods
      .forgeStronghold()
      .accounts(accounts)
      .signers([payer])
      .rpc();

    const { keeper, stronghold } = accounts;
    const vaultAccount = await getAccount(connection, stronghold);

    expect(vaultAccount.owner).toEqual(keeper);
    expect(vaultAccount.amount.toString()).toEqual('0');
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
        mint,
        sender.publicKey
      );

      reserve = address;
      await mintToChecked(connection, payer, mint, reserve, payer, 10e8, 8);
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
    let receiver: Keypair;
    let receiverTokenAccount: PublicKey;
    let receiverAccount: Account;

    beforeAll(async () => {
      const { payer } = provider.wallet as anchor.Wallet;
      receiver = Keypair.generate();
      receiverTokenAccount = await createAssociatedTokenAccount(
        connection,
        payer,
        mint,
        receiver.publicKey
      );
    });

    beforeEach(async () => {
      receiverAccount = await getAccount(connection, receiverTokenAccount);
    });

    it('Should withdraw tokens', async () => {
      const { payer } = provider.wallet as anchor.Wallet;
      const { stronghold } = accounts;
      const vaultBeforeWithdraw = await getAccount(connection, stronghold);
      const amount = vaultBeforeWithdraw.amount / BigInt(2);
      expect(amount).toBeGreaterThan(BigInt(0));

      await program.methods
        .retrieveGems(new BN(amount))
        .accounts({
          ...accounts,
          reserve: receiverTokenAccount,
        })
        .signers([payer])
        .rpc();

      const vaultAccount = await getAccount(connection, stronghold);
      const receiverAfterWithdraw = await getAccount(
        connection,
        receiverTokenAccount
      );
      expect(vaultAccount.amount).toEqual(vaultBeforeWithdraw.amount - amount);
      expect(receiverAfterWithdraw.amount).toEqual(
        receiverAccount.amount + amount
      );
    });

    it('Should fail to withdraw more than the vault has', async () => {
      const { payer } = provider.wallet as anchor.Wallet;
      const { stronghold } = accounts;
      const vaultBeforeWithdraw = await getAccount(connection, stronghold);
      const amount = vaultBeforeWithdraw.amount * BigInt(2);

      try {
        await program.methods
          .retrieveGems(new BN(amount))
          .accounts({
            ...accounts,
            reserve: receiverTokenAccount,
          })
          .signers([payer])
          .rpc();
        fail('Should have failed');
      } catch (err) {
        const vaultAccount = await getAccount(connection, stronghold);
        expect(err.toString()).toContain('custom program error: 0x1');
        expect(vaultAccount.amount).toEqual(vaultBeforeWithdraw.amount);
      }
    });
  });
});
