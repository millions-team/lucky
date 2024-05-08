'use client';


import { programId, TinyAdventureIDL } from '@lucky/anchor';
import { Program } from '@coral-xyz/anchor';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useCluster } from '../cluster/cluster-data-access';
import { useAnchorProvider } from '../solana/solana-provider';
import { useTransactionToast } from '../ui/ui-layout';
import { useEffect, useState } from 'react';

export const [globalLevel1GameDataAccount] = PublicKey.findProgramAddressSync(
  [Buffer.from('level1', 'utf8')],
  programId
);

export function useTinyAdventureProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const program = new Program(TinyAdventureIDL, programId, provider);

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId)
  });

  const initialize = useMutation({
    mutationKey: ['tinyAdventure', 'initialize', { cluster }],
    mutationFn: (publicKey: PublicKey) => program.methods.initialize()
      .accounts({
        newGameDataAccount: globalLevel1GameDataAccount,
        signer: publicKey,
      })
      .rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
    },
    onError: () => toast.error('Failed to run program')
  });

  return {
    program,
    programId,
    getProgramAccount,
    initialize
  };
}

export function useGameData({ account }: { account: PublicKey }){
  const { cluster } = useCluster();
  const { program } = useTinyAdventureProgram();
  const transactionToast = useTransactionToast();

  const [playerPosition, setPlayerPosition] = useState("........")
  const [message, setMessage] = useState("")

  const gameData = useQuery({
    queryKey: ['tinyAdventure', 'fetch', { cluster, account }],
    queryFn: () => program.account.gameDataAccount.fetch(account),
  });

  useEffect(() => {
    if(!gameData?.data) return;

    const { playerPosition } = gameData.data;
    switch (playerPosition) {
      case 0:
        setPlayerPosition("o........")
        setMessage("A journey begins...")
        break
      case 1:
        setPlayerPosition("....o....")
        setMessage("")
        break
      case 2:
        setPlayerPosition("......o..")
        setMessage("")
        break
      case 3:
        setPlayerPosition(".........\\o/")
        setMessage("You have reached the end! Super!")
        break
      default:
        transactionToast("Invalid player position")
        break
    }

  }, [gameData, transactionToast])

  const moveLeft = useMutation({
    mutationKey: ['tinyAdventure', 'moveLeft', { cluster, account }],
    mutationFn: () => program.methods.moveLeft().accounts({ gameDataAccount: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return gameData.refetch();
    },
  });

  const moveRight = useMutation({
    mutationKey: ['tinyAdventure', 'moveRight', { cluster, account }],
    mutationFn: () => program.methods.moveRight().accounts({ gameDataAccount: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx);
      return gameData.refetch();
    },
  });

  return {
    gameData,
    playerPosition,
    message,
    moveLeft,
    moveRight
  }
}