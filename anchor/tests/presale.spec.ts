import * as anchor from '@coral-xyz/anchor';
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import {
  type Account,
  createAssociatedTokenAccount,
  createMint,
  getAccount,
  getAssociatedTokenAddress,
  mintToChecked,
} from '@solana/spl-token';
import { BN } from '@coral-xyz/anchor';

import {
  getPresaleProgram,
  getSaleKeeperPDA,
  getSalePDA,
  getSaleVaultPDA,
  toBN,
} from '../src';

const DECIMALS = 8;
describe('presale', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  const connection = provider.connection;

  anchor.setProvider(provider);
  const program = getPresaleProgram(provider);
  type Portal = typeof program;

  const { payer } = provider.wallet as anchor.Wallet;
  let token: PublicKey;

  beforeAll(async () => {
    token = await createMint(
      connection, // conneciton
      payer, // fee payer
      payer.publicKey, // mint authority
      null, // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
      DECIMALS
    );

    const ata = await createAssociatedTokenAccount(
      connection, // connection
      payer, // fee payer
      token, // mint
      payer.publicKey // owner,
    );

    await mintToChecked(
      connection, // connection
      payer, // fee payer
      token, // mint
      ata, // receiver (should be a token account)
      payer, // mint authority
      1000 * 10 ** DECIMALS, // amount. if your decimals is 8, you mint 10^8 for 1 token.
      DECIMALS
    );
  });

  describe('Initialize Presale', () => {
    it('should init the main program accounts', async () => {
      await program.methods.init().rpc();

      const keeper = getSaleKeeperPDA();
      const balance = await provider.connection.getBalance(keeper);
      expect(balance).toBeGreaterThan(0);
    });

    it('should properly initialize a new sale', async () => {
      const reserve = await getAssociatedTokenAddress(token, payer.publicKey);
      const settings = {
        prices: [0.001, 0.002, 0.003].map((x) => toBN(x, 9)),
        amounts: [10, 20, 30].map((x) => toBN(x, DECIMALS)),
        start: new BN(0),
        end: new BN(Date.now() / 1000 + 86400),
        min: toBN(1, DECIMALS),
        max: toBN(100, DECIMALS),
      };

      await program.methods
        .initSale(settings)
        .accounts({
          token,
          reserve,
        })
        .rpc();

      const salePDA = getSalePDA(token);
      const vaultPDA = getSaleVaultPDA(token);
      const keeper = getSaleKeeperPDA();
      const sale = await program.account.sale.fetch(salePDA);
      const vault = await getAccount(connection, vaultPDA);

      expect(sale.owner).toEqual(payer.publicKey);
      expect(sale.token).toEqual(token);
      expect(sale.start).not.toEqual(settings.start);
      expect(sale.end).toEqual(settings.end);
      expect(sale.min.toString()).toEqual(settings.min.toString());
      expect(sale.max.toString()).toEqual(settings.max.toString());
      expect(sale.prices.toString()).toEqual(settings.prices.toString());
      expect(sale.amounts.toString()).toEqual(settings.amounts.toString());
      expect(sale.sold.toString()).toEqual('0');

      expect(vault.owner).toEqual(keeper);
      expect(vault.amount.toString()).toEqual(
        settings.amounts.reduce((a, b) => a.add(b), new BN(0)).toString()
      );
    });
    // TODO: Create all the settings validations tests.
  });

  describe('Buy Tokens', () => {
    let salePDA: PublicKey;
    let vaultPDA: PublicKey;

    const buyer = Keypair.generate();
    let vault: Account;
    let sale: Awaited<ReturnType<Portal['account']['sale']['fetch']>>;

    beforeAll(async () => {
      await provider.connection.requestAirdrop(
        buyer.publicKey,
        LAMPORTS_PER_SOL
      );

      salePDA = getSalePDA(token);
      vaultPDA = getSaleVaultPDA(token);
    });

    beforeEach(async () => {
      vault = await getAccount(provider.connection, vaultPDA);
      sale = await program.account.sale.fetch(salePDA);
    });

    it('should buy some tokens', async () => {
      const amount = toBN(10, DECIMALS);
      const balanceBefore = await provider.connection.getBalance(salePDA);

      expect(sale.amounts[0].toNumber()).toBeGreaterThanOrEqual(
        amount.toNumber()
      );
      expect(Number(vault.amount)).toBeGreaterThanOrEqual(amount.toNumber());

      await program.methods.purchase(amount).accounts({ token }).rpc();

      const saleAfter = await program.account.sale.fetch(salePDA);
      const balanceAfter = await provider.connection.getBalance(salePDA);
      const vaultAfter = await getAccount(provider.connection, vaultPDA);

      expect(saleAfter.sold.toNumber()).toBe(sale.sold.add(amount).toNumber());
      expect(Number(vaultAfter.amount)).toBe(
        Number(vault.amount) - amount.toNumber()
      );
      expect(balanceAfter).toBeGreaterThan(balanceBefore);
    });
  });
});
