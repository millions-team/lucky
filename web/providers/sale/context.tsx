'use client';

import {
  type PropsWithChildren,
  createContext,
  useContext,
  useMemo,
} from 'react';
import type { Cluster } from '@solana/web3.js';

import type { SaleContext } from './sale.d';

import {
  useAnchorProvider,
  useCluster,
  ReactQueryProvider,
  ClusterProvider,
  SolanaModalProvider,
  GemsProvider,
  LuckyBagsProvider,
  ActivePlayerProvider,
} from '@/providers';
import { getPresaleProgram, getPresaleProgramId } from '@luckyland/anchor';

const Context = createContext({} as SaleContext);

function Portal({ children }: PropsWithChildren) {
  const { cluster } = useCluster();
  const provider = useAnchorProvider();

  const saleId = useMemo(
    () => getPresaleProgramId(cluster.network as Cluster),
    [cluster]
  );
  const sale = useMemo(() => getPresaleProgram(provider), [provider]);

  const value = {
    cluster,

    saleId,
    sale,
  } as SaleContext;

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function SaleProvider({ children }: PropsWithChildren) {
  return (
    <LuckyBagsProvider>
      <ReactQueryProvider>
        <ClusterProvider>
          <SolanaModalProvider>
            <Portal>
              <GemsProvider>
                <ActivePlayerProvider>{children}</ActivePlayerProvider>
              </GemsProvider>
            </Portal>
          </SolanaModalProvider>
        </ClusterProvider>
      </ReactQueryProvider>
    </LuckyBagsProvider>
  );
}

export function useSale() {
  return useContext(Context);
}
