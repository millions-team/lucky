import { ed25519 } from '@noble/curves/ed25519';

import type { WalletName } from '@solana/wallet-adapter-base';
import {
  BaseSignInMessageSignerWalletAdapter,
  isVersionedTransaction,
  WalletNotConnectedError,
  WalletReadyState,
} from '@solana/wallet-adapter-base';
import {
  type SolanaSignInInput,
  type SolanaSignInOutput,
} from '@solana/wallet-standard-features';
import { createSignInMessage } from '@solana/wallet-standard-util';
import {
  Keypair,
  Transaction,
  TransactionVersion,
  VersionedTransaction,
} from '@solana/web3.js';

import type { LuckyBagProviderContext } from './LuckyWallet.d';

export const LuckyWalletName = 'Lucky Bag' as WalletName<'Burner Wallet'>;
/**
 * This burner wallet adapter is unsafe to use and is only included to provide an easy way for applications to test
 * Wallet Adapter without using a third-party wallet.
 */
export class LuckyWalletAdapter extends BaseSignInMessageSignerWalletAdapter {
  name = LuckyWalletName;
  url = 'https://github.com/anza-xyz/wallet-adapter#usage';
  icon =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzQiIGhlaWdodD0iMzAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0zNCAxMC42djIuN2wtOS41IDE2LjVoLTQuNmw2LTEwLjVhMi4xIDIuMSAwIDEgMCAyLTMuNGw0LjgtOC4zYTQgNCAwIDAgMSAxLjMgM1ptLTQuMyAxOS4xaC0uNmw0LjktOC40djQuMmMwIDIuMy0yIDQuMy00LjMgNC4zWm0yLTI4LjRjLS4zLS44LTEtMS4zLTItMS4zaC0xLjlsLTIuNCA0LjNIMzBsMS43LTNabS0zIDVoLTQuNkwxMC42IDI5LjhoNC43TDI4LjggNi40Wk0xOC43IDBoNC42bC0yLjUgNC4zaC00LjZMMTguNiAwWk0xNSA2LjRoNC42TDYgMjkuOEg0LjJjLS44IDAtMS43LS4zLTIuNC0uOEwxNSA2LjRaTTE0IDBIOS40TDcgNC4zaDQuNkwxNCAwWm0tMy42IDYuNEg1LjdMMCAxNi4ydjhMMTAuMyA2LjRaTTQuMyAwaC40TDAgOC4ydi00QzAgMiAxLjkgMCA0LjMgMFoiIGZpbGw9IiM5OTQ1RkYiLz48L3N2Zz4=';
  supportedTransactionVersions: ReadonlySet<TransactionVersion> = new Set([
    'legacy',
    0,
  ]);

  private _connecting;

  constructor(private context: LuckyBagProviderContext) {
    super();
    this._connecting = false;
  }

  private get wallet() {
    return this.context.bag;
  }

  private get _keypair() {
    return this.wallet?.kp || null;
  }

  get connecting() {
    return this._connecting;
  }

  get publicKey() {
    return this._keypair && this._keypair.publicKey;
  }

  get readyState() {
    return WalletReadyState.Installed;
  }

  async connect(): Promise<void> {
    if (this.connecting) return;

    try {
      let publicKey = this.publicKey;
      this._connecting = true;

      if (!publicKey) {
        let bag = this.context.openBag();
        if (!bag)
          bag = this.context.addBag({
            name: 'Lucky Bag',
            kp: Keypair.generate(),
          });

        publicKey = bag.kp.publicKey;
      }

      this.emit('connect', publicKey);
    } catch (error: any) {
      this.emit('error', error);
      throw error;
    } finally {
      this._connecting = false;
    }
  }

  async disconnect(): Promise<void> {
    this.emit('disconnect');
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T
  ): Promise<T> {
    if (!this._keypair) throw new WalletNotConnectedError();

    if (isVersionedTransaction(transaction)) {
      transaction.sign([this._keypair]);
    } else {
      transaction.partialSign(this._keypair);
    }

    return transaction;
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    if (!this._keypair) throw new WalletNotConnectedError();

    return ed25519.sign(message, this._keypair.secretKey.slice(0, 32));
  }

  async signIn(input: SolanaSignInInput = {}): Promise<SolanaSignInOutput> {
    if (!this._keypair) throw new WalletNotConnectedError();

    const { publicKey, secretKey } = this._keypair;
    const domain = input.domain || window.location.host;
    const address = input.address || publicKey.toBase58();

    const signedMessage = createSignInMessage({
      ...input,
      domain,
      address,
    });
    const signature = ed25519.sign(signedMessage, secretKey.slice(0, 32));

    this.emit('connect', publicKey);

    return {
      account: {
        address,
        publicKey: publicKey.toBytes(),
        chains: [],
        features: [],
      },
      signedMessage,
      signature,
    };
  }
}
