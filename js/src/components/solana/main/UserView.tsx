import { AccountInfo, Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import React, { useEffect, useState } from 'react';
import { createAccountFromProgram, getAccountFromProgram, getUserKeyPair, Users } from '../accounts';
import { programId } from '../program';
import { getAccountBalance } from '../transactions';

const UserView = ({ connection, userType, transferSOL, airdrop, blockAccountByAdmin, blockPubkey, createBlockAccount, blockProgram }:
    {
        connection: Connection, userType: Users, transferSOL: any, airdrop: any, blockAccountByAdmin: any, blockPubkey: PublicKey,
        createBlockAccount: any, blockProgram: any
    }) => {
    const [balance, setBalance] = useState(0);
    const [pubkey, setPubkey] = useState<PublicKey | undefined>();

    const [transferAmount, setTransferAmount] = useState<string | undefined>();





    const transferMoney = async () => {
        if (transferAmount == null || transferAmount === "" || parseFloat(transferAmount) <= 0) {
            alert('Please put some amount value');
            return;
        }

        await transferSOL(pubkey, transferAmount);

        // await getAccount();
        await updateBalance(pubkey!);
    }

    const blockAccount = async () => {
        await blockAccountByAdmin(pubkey);
        // await getAccount();
    }

    const updateBalance = async (key: PublicKey) => {
        console.log("updatebalance ", key);
        if (key == null)
            return;
        const val = await getAccountBalance(connection, key);
        setBalance(val / LAMPORTS_PER_SOL);
        console.log("updatebalance ", balance);

    }

    useEffect(() => {
        const b = async () => {
            const keypair = getUserKeyPair(userType);
            setPubkey(keypair.publicKey);
            await updateBalance(keypair.publicKey)
            //   await getAccount();
        }
        b();
    }, []);

    return (
        <div id={Users[userType]} className="row">
            <div className="column alignLeft">
                <span className='block'>
                    Name: {Users[userType]}
                </span>
                <span className='block'>
                    PubKey: {pubkey?.toBase58()}
                </span>
                <span className='block'>
                    Balance:{balance} Sol


                </span>
            </div>
            <div className="column alignLeft">
                <input onChange={event => setTransferAmount(event.target.value)}
                    value={transferAmount}
                    placeholder='Transfer Amount (Sol)' />


                {
                    userType === Users.Admin
                    &&
                    blockProgram == null &&
                    <div>
                        <button onClick={createBlockAccount}>Init Block Account</button>
                    </div>
                }


                {
                    userType !== Users.Admin
                    &&
                    blockProgram != null &&
                    blockPubkey != null &&
                    pubkey != null &&
                    blockPubkey.toBase58() === pubkey?.toBase58()
                    &&
                    < div >
                        Blocked!
                    </div>
                }
                {

                    blockProgram != null
                    && pubkey != null
                    &&
                    (
                        blockPubkey == null ||
                        blockPubkey.toBase58() !== pubkey?.toBase58()
                    )
                    &&
                    < div >
                        <button onClick={() => { blockAccount() }} >Block</button>
                    </div>
                }
                {

                    pubkey != null &&
                    // (
                    //     blockProgram == null ||
                    //     blockPubkey == null ||
                    //     blockPubkey.toBase58() !== pubkey?.toBase58()
                    // )
                    // &&
                    < div >
                        <button onClick={() => { setTransferAmount(""); transferMoney() }}>Transfer {
                            (
                                blockProgram != null &&
                                blockPubkey != null &&
                                blockPubkey.toBase58() === pubkey?.toBase58()
                            ) && <span>(Blocked!)</span>
                        }
                        </button>

                    </div>
                }
            </div>
            <br />
            <br />
        </div >
    )


}

export default UserView;