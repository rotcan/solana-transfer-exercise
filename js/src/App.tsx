import React from 'react';
import { PublicKey, Connection, clusterApiUrl, LAMPORTS_PER_SOL, SystemProgram, Transaction } from "@solana/web3.js";
import { useEffect, useState } from "react";
import logo from './logo.svg';
import './App.css';
import { PhantomProvider } from './components/solana/phantom';
import { createAccountFromProgram, getAccountFromProgram, getUserKeyPair, TransactionResponseEnum, Users } from './components/solana/accounts';
import UserView from './components/solana/main/UserView';
import { blockTransaction, getAccountBalance, getTransactions, TransactionWithSignature, transferSol } from './components/solana/transactions';
import { programId } from './components/solana/program';
import TransactionsView from './components/solana/main/WalletTransactions';



function App() {

  const [balance, setBalance] = useState(0);

  const [provider, setProvider] = useState<PhantomProvider | undefined>(
    undefined
  );

  const [walletKey, setWalletKey] = useState<PhantomProvider | undefined>(
    undefined
  );
  const [blockPubkey, setBlockPubkey] = useState<any | undefined>(null);
  const [blockProgram, setBlockProgram] = useState<any | undefined>(null);
  const [transactions, setTransactions] =
    useState<Array<TransactionWithSignature>>();


  const getProvider = (): PhantomProvider | undefined => {
    if ("solana" in window) {
      // @ts-ignore
      const provider = window.solana as any;
      if (provider.isPhantom) return provider as PhantomProvider;
    }
  };
  const cluster = "http://localhost:8899";
  const connection = new Connection(
    cluster, "confirmed"
  );

  const loadTransactions = async () => {
    var provider = await getProvider();
    await getTransactions(connection, provider!.publicKey!).then((trans) => {
      console.log(trans);
      setTransactions(trans);
    });
  }
  async function airdropSOL() {
    var provider = await getProvider();
    console.log("Public key of the emitter: ", provider!.publicKey!.toBase58());

    // Establishing connection


    // I have hardcoded my secondary wallet address here. You can take this address either from user input or your DB or wherever

    // Airdrop some SOL to the sender's wallet, so that it can handle the txn fee
    var airdropSignature = await connection.requestAirdrop(
      provider!.publicKey!,
      LAMPORTS_PER_SOL,
    );

    // Confirming that the airdrop went through
    await connection.confirmTransaction(airdropSignature);
    await getUserBalance();
  }

  const createBlockAccount = async () => {
    console.log(blockProgram);
    if (blockProgram == null) {
      await createAccountFromProgram(connection, programId, getUserKeyPair(Users.Admin));
      await getBlockedAccount();

    }
  }

  const getBlockedAccount = async () => {
    const accInfo = await getAccountFromProgram(connection, programId, getUserKeyPair(Users.Admin).publicKey);
    console.log("user load");
    if (accInfo != null) {
      setBlockProgram(accInfo);
      try {
        let data = accInfo?.data;
        const blockedKey = new PublicKey(data.slice(0, 32));
        setBlockPubkey(blockedKey);
      } catch (ex: any) {

      }
    }
    console.log("blockProgram=" + blockProgram);
  }

  const processResponse = (response: TransactionResponseEnum) => {
    if (response !== undefined && response !== TransactionResponseEnum.Success) {
      switch (response) {
        case TransactionResponseEnum.AdminAccountNotCreated:
          alert("Create Admin Account before transferring money. ");
          break;
        case TransactionResponseEnum.TransferToBlockedAccount:
          alert("Trying to transfer to blocked account ");
          break;
        case TransactionResponseEnum.ProgramNotSupported:
          alert("Program not owner of the account being edited ");
          break;
        case TransactionResponseEnum.AccountNotAllowed:
          alert("Only Admin can block the other accounts ");
          break;
      }
    }
  }

  const transferSOLToOtherAccounts = async (to: PublicKey, amount: string) => {
    var wallet = getProvider();
    const response: TransactionResponseEnum = await transferSol(connection, wallet!, to, parseFloat(amount) * LAMPORTS_PER_SOL);
    await getUserBalance();
    processResponse(response);
    await loadTransactions();
  }

  const blockAccountByAdmin = async (pubkey: PublicKey) => {
    const response: TransactionResponseEnum = await blockTransaction(connection, pubkey);
    await getBlockedAccount();
    processResponse(response);
  }

  const connectWallet = async () => {
    // @ts-ignore
    const { solana } = window;

    if (solana) {
      try {
        const response = await solana.connect();
        console.log('wallet account ', response.publicKey.toString());
        setWalletKey(response.publicKey.toString());
      } catch (err) {
        // { code: 4001, message: 'User rejected the request.' }
      }
    }
  };

  const disconnectWallet = async () => {
    // @ts-ignore
    const { solana } = window;

    if (walletKey && solana) {
      await (solana as PhantomProvider).disconnect();
      setWalletKey(undefined);
    }
  };




  const getUserBalance = async () => {
    var provider = await getProvider();
    setBalance(await getAccountBalance(connection, provider!.publicKey!) / LAMPORTS_PER_SOL);
  }

  useEffect(() => {
    const provider = getProvider();

    if (provider) setProvider(provider);
    else setProvider(undefined);
    walletKey && getUserBalance();
    getBlockedAccount();
    walletKey && loadTransactions();
  }, [walletKey]);

  return (
    <div className="App">
      <header className="header">
        <div>
          <h2 className="heading">Solana Money Transfer</h2>
          {provider && !walletKey && (
            <button
              className='connect floatRight'
              onClick={connectWallet}
            >
              Connect to Phantom Wallet
            </button>
          )}
          {provider && walletKey &&
            <span className='floatRight'>
              <button
                onClick={disconnectWallet}
                className="connect"

              >
                Disconnect
              </button>


            </span>
          }

          {!provider && (
            <p>
              No provider found. Install{" "}
              <a href="https://phantom.app/">Phantom Browser extension</a>
            </p>
          )}
        </div>
        {provider && walletKey &&
          <><div className='clear'></div>
            <div className='floatRight'>Connected account <b>{walletKey}</b> (<b>{balance} SOL</b>)</div>

          </>

        }
      </header >
      <div className='Main'>
        {provider && walletKey && <button className='floatRight' onClick={airdropSOL}>Airdrop 1 Sol</button>}
        <div className='clear'></div>
        {/* <button onClick={loadAdmin}>Load Admin</button> */}
        {
          provider && walletKey
          &&
          (
            <>

              <UserView connection={connection} userType={Users.Admin} transferSOL={transferSOLToOtherAccounts} airdrop={airdropSOL}
                blockAccountByAdmin={blockAccountByAdmin} blockPubkey={blockPubkey} createBlockAccount={createBlockAccount} blockProgram={blockProgram}></UserView>
              <UserView connection={connection} userType={Users.User1} transferSOL={transferSOLToOtherAccounts} airdrop={airdropSOL} blockAccountByAdmin={blockAccountByAdmin} blockPubkey={blockPubkey} createBlockAccount={createBlockAccount} blockProgram={blockProgram}></UserView>
              <UserView connection={connection} userType={Users.User2} transferSOL={transferSOLToOtherAccounts} airdrop={airdropSOL} blockAccountByAdmin={blockAccountByAdmin} blockPubkey={blockPubkey} createBlockAccount={createBlockAccount} blockProgram={blockProgram}></UserView>
              <UserView connection={connection} userType={Users.User3} transferSOL={transferSOLToOtherAccounts} airdrop={airdropSOL} blockAccountByAdmin={blockAccountByAdmin} blockPubkey={blockPubkey} createBlockAccount={createBlockAccount} blockProgram={blockProgram}></UserView>
              <div className="app-body-mid">
                <h4>Account Transactions</h4>
                <TransactionsView transactions={transactions} />
              </div>
            </>
          )
        }
      </div>
    </div >
  );
}

export default App;
