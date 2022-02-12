import { AccountInfo, Connection, Keypair, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from '@solana/web3.js';
import adminKey from './keys/admin.json';
import accountKey1 from './keys/key1.json';
import accountKey2 from './keys/key2.json';
import accountKey3 from './keys/key3.json';

export enum Users {
    Admin,
    User1,
    User2,
    User3
}

export enum TransactionResponseEnum {
    Success,
    TransferToBlockedAccount,
    AdminAccountNotCreated,
    ProgramNotSupported,
    AccountNotAllowed
}

export const ADMIN_PUBKEY = "9cnSj92djjErbqUahBcoTxmc5mL31hcaePDq971AmDEF";

export const getUserKeyPair = (user: Users) => {
    switch (user) {
        case Users.Admin:
            return getKeyPair(adminKey);
        case Users.User1:
            return getKeyPair(accountKey1);
        case Users.User2:
            return getKeyPair(accountKey2);
        case Users.User3:
            return getKeyPair(accountKey3);
    }
}

export const getKeyPair = (key: any) => {
    //const secretKey = Uint8Array.from(JSON.parse(adminKey));
    const secretKey = Uint8Array.from(key);
    return Keypair.fromSecretKey(secretKey)
}

export const ADMIN_ACCOUNT_SEED = "1";

export const getAdminAccountPublicKey = async (programId: PublicKey, adminPubKey: PublicKey) => {
    const seedStr = ADMIN_ACCOUNT_SEED;
    const profileAccountPubKey = await PublicKey.createWithSeed(
        adminPubKey,
        seedStr,
        programId,
    );
    return profileAccountPubKey;
}

export const getAccountFromProgram = async (connection: Connection, programId: PublicKey, adminPubKey: PublicKey) => {

    const profileAccountPubKey = await getAdminAccountPublicKey(programId, adminPubKey);

    let accountInfo = await connection.getAccountInfo(profileAccountPubKey);
    console.log(accountInfo);
    console.log("profileAccountPubKey=" + (accountInfo == null));
    return accountInfo;
}

export const createAccountFromProgram = async (connection: Connection, programId: PublicKey, adminKeyPair: Keypair) => {
    const size = 32;
    const rent = await connection.getMinimumBalanceForRentExemption(size);
    const seedStr = ADMIN_ACCOUNT_SEED;

    const profileAccountPubKey = await PublicKey.createWithSeed(
        adminKeyPair.publicKey,
        seedStr,
        programId,
    );

    let accountInfo = await connection.getAccountInfo(profileAccountPubKey);

    if (accountInfo === null) {
        //console.log(aliceKeyPair.publicKey);
        //let createTx = create(ProgramId, aliceKeyPair, profileAccountPubKey, 1 + 32, await connection.getMinimumBalanceForRentExemption(1 + 32));
        const instruction = SystemProgram.createAccountWithSeed({
            fromPubkey: adminKeyPair.publicKey,
            basePubkey: adminKeyPair.publicKey,
            seed: seedStr,
            newAccountPubkey: profileAccountPubKey,
            lamports: rent,
            space: size,
            programId: programId,
        });

        let txc = new Transaction();
        txc.add(instruction);
        let signers2 = [adminKeyPair];
        let txidc = await sendAndConfirmTransaction(connection, txc, signers2, {
            skipPreflight: true,
            preflightCommitment: "singleGossip",
            commitment: "singleGossip",
        });
        console.log(txidc);
    }
    accountInfo = await connection.getAccountInfo(profileAccountPubKey)
    return accountInfo;
}