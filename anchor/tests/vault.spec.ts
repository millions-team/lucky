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

import {
  Vault,
  getTokenVaultPDA,
  getVaultAccountOwnerPDA,
} from '../src/vault-exports';

describe('vault', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Vault as Program<Vault>;
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
      signer: payer.publicKey,
      tokenAccountOwnerPda: getVaultAccountOwnerPDA(),
      vaultTokenAccount: getTokenVaultPDA(mint),
      mintOfTokenBeingSent: mint,
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

  it('Should initialize Owner & Vault', async () => {
    const { payer } = provider.wallet as anchor.Wallet;

    await program.methods
      .initialize()
      .accounts({
        ...accounts,
      })
      .signers([payer])
      .rpc();

    const { tokenAccountOwnerPda, vaultTokenAccount } = accounts;
    const vaultAccount = await getAccount(connection, vaultTokenAccount);

    expect(vaultAccount.owner).toEqual(tokenAccountOwnerPda);
    expect(vaultAccount.amount.toString()).toEqual('0');
  });

  describe('Deposit', () => {
    const { payer } = provider.wallet as anchor.Wallet;
    const sender = Keypair.generate();
    let senderTokenAccount: PublicKey;
    let senderAccount: Account;

    beforeAll(async () => {
      const { address } = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        mint,
        sender.publicKey
      );

      senderTokenAccount = address;
      await mintToChecked(
        connection,
        payer,
        mint,
        senderTokenAccount,
        payer,
        10e8,
        8
      );
    });

    beforeEach(async () => {
      senderAccount = await getAccount(connection, senderTokenAccount);
    });

    it('Should deposit tokens', async () => {
      const { vaultTokenAccount } = accounts;

      const { amount } = senderAccount;
      const vaultBeforeDeposit = await getAccount(
        connection,
        vaultTokenAccount
      );

      await program.methods
        .transferIn(new BN(amount))
        .accounts({
          ...accounts,
          signer: sender.publicKey,
          senderTokenAccount,
        })
        .signers([sender])
        .rpc();

      const vaultAccount = await getAccount(connection, vaultTokenAccount);
      const senderAfterDeposit = await getAccount(
        connection,
        senderTokenAccount
      );
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
      const { vaultTokenAccount } = accounts;
      const vaultBeforeWithdraw = await getAccount(
        connection,
        vaultTokenAccount
      );
      const amount = vaultBeforeWithdraw.amount / BigInt(2);
      expect(amount).toBeGreaterThan(BigInt(0));

      await program.methods
        .transferOut(new BN(amount))
        .accounts({
          ...accounts,
          senderTokenAccount: receiverTokenAccount,
        })
        .signers([payer])
        .rpc();

      const vaultAccount = await getAccount(connection, vaultTokenAccount);
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
      const { vaultTokenAccount } = accounts;
      const vaultBeforeWithdraw = await getAccount(
        connection,
        vaultTokenAccount
      );
      const amount = vaultBeforeWithdraw.amount * BigInt(2);

      try {
        await program.methods
          .transferOut(new BN(amount))
          .accounts({
            ...accounts,
            senderTokenAccount: receiverTokenAccount,
          })
          .signers([payer])
          .rpc();
        fail('Should have failed');
      } catch (err) {
        const vaultAccount = await getAccount(connection, vaultTokenAccount);
        expect(err.toString()).toContain('custom program error: 0x1');
        expect(vaultAccount.amount).toEqual(vaultBeforeWithdraw.amount);
      }
    });
  });
});
