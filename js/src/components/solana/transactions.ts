//empty

import { ConfirmedTransaction, Connection, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction, TransactionError, TransactionInstruction, TransactionResponse } from "@solana/web3.js";
import BN from "bn.js";
import { getAccountFromProgram, getAdminAccountPublicKey, getUserKeyPair, TransactionResponseEnum, Users } from "./accounts";
import { PhantomProvider } from "./phantom";
import { programId } from "./program";
import { Buffer } from 'buffer';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const abc = 'abc';

export const getAccountBalance = async (connection: Connection, pubkey: PublicKey) => {
    const val = await connection.getBalance(pubkey);
    return val;
}

const transfer = (from: PublicKey, to: PublicKey, admin: PublicKey, programId: PublicKey, amount: string) => {
    const idx = Buffer.from(
        Uint8Array.of(0, ...new BN(amount).toArray("le", 8))
    );
    return new TransactionInstruction({
        keys: [
            {
                pubkey: from,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: to,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: admin,
                isSigner: false,
                isWritable: false,
            },
            {
                pubkey: SystemProgram.programId,
                isSigner: false,
                isWritable: false,
            },
        ],
        data: idx,
        programId: programId,
    });
};

const block = async (pubkey: PublicKey, adminPubKey: PublicKey) => {
    // const idx = Buffer.from(
    //     Uint8Array.of(1, ...new BN(pubkey.toBuffer()))
    // );
    const adminAccountKey = await getAdminAccountPublicKey(programId, adminPubKey);
    const idx = Buffer.concat([Buffer.from([1]), pubkey.toBuffer()]);
    console.log(idx.length);
    return new TransactionInstruction({
        keys: [
            {
                pubkey: adminAccountKey,
                isSigner: false,
                isWritable: true,
            },
        ],
        data: idx,
        programId: programId,
    });

}


export const transferSol = async (connection: Connection, from: PhantomProvider, to: PublicKey, amount: Number):
    Promise<TransactionResponseEnum> => {
    const adminKeyPair = getUserKeyPair(Users.Admin);
    const adminAccount = getAccountFromProgram(connection, programId, adminKeyPair.publicKey);
    if (adminAccount != null) {
        const adminAccountPubKey = await getAdminAccountPublicKey(programId, adminKeyPair.publicKey);

        const transferTx = transfer(from!.publicKey!, to, adminAccountPubKey, programId, "" + amount);
        //signers.push(programAccountKey);
        let tx = new Transaction();
        tx.add(transferTx);
        // let signers = [from!]
        //const idx = Buffer.from(new Uint8Array([0]))

        // Setting the variables for the transaction
        tx.feePayer = await from!.publicKey!;
        let blockhashObj = await connection.getRecentBlockhash();
        tx.recentBlockhash = await blockhashObj.blockhash;

        // Transaction constructor initialized successfully
        if (tx) {
            console.log("Txn created successfully");
        }
        try {
            // Request creator to sign the transaction (allow the transaction)
            let signed = await from!.signTransaction(tx);
            // The signature is generated
            let signature = await connection.sendRawTransaction(signed.serialize());
            // Confirm whether the transaction went through or not

            const response = await connection.confirmTransaction(signature);
            console.log(response.value);
            return TransactionResponseEnum.Success;
        } catch (err: any) {
            console.log(err);
            if (String(err).indexOf("custom program error: 0x1") > -1)
                return TransactionResponseEnum.TransferToBlockedAccount;
        }

    }
    return TransactionResponseEnum.AdminAccountNotCreated;
}

export const blockTransaction = async (connection: Connection, pubkey: PublicKey): Promise<TransactionResponseEnum> => {

    let tx2 = new Transaction();
    const adminKeyPair = getUserKeyPair(Users.Admin);
    let transferIx2 = await block(pubkey, adminKeyPair.publicKey);
    tx2.add(transferIx2);

    try {
        //const idx = Buffer.from(new Uint8Array([0]))
        let signers3 = [adminKeyPair];
        let txid2 = await sendAndConfirmTransaction(connection, tx2, signers3, {
            skipPreflight: true,
            preflightCommitment: "singleGossip",
            commitment: "singleGossip",
        });
        console.log(txid2);
    } catch (e) {
        const estr = String(e);
        console.log(estr);
        console.log(estr.split(' ')[4]);
        if (estr.indexOf('"Custom":2') > -1) {
            return TransactionResponseEnum.ProgramNotSupported;
        } else if (estr.indexOf('{"Custom":3}') > -1) {
            return TransactionResponseEnum.AccountNotAllowed;
        }
    }
    return TransactionResponseEnum.Success;
}



export class TransactionWithSignature {
    constructor(
        public signature: string,
        public confirmedTransaction: TransactionResponse
    ) { }
}

export async function getTransactions(
    connection: Connection,
    address: PublicKey
): Promise<Array<TransactionWithSignature>> {
    const transSignatures = await connection.getConfirmedSignaturesForAddress2(
        address
    );
    console.log("transSignatures");
    console.log(transSignatures);
    const transactions = new Array<TransactionWithSignature>();
    for (let i = 0; i < transSignatures.length; i++) {
        const signature = transSignatures[i].signature;
        const confirmedTransaction = await connection.getTransaction(
            signature,
        );
        if (confirmedTransaction) {
            const transWithSignature = new TransactionWithSignature(
                signature,
                confirmedTransaction
            );
            transactions.push(transWithSignature);
        }
    }
    return transactions;
}

