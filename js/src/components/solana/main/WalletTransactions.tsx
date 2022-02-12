import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import React, { FC } from "react";
import { TransactionWithSignature } from "../transactions";

interface TransactionsViewProps {
    transactions?: Array<TransactionWithSignature>;
}

const TransactionsView: FC<TransactionsViewProps> = ({ transactions }) => {
    const getTransactions = () => {
        return transactions?.map((trans) => {
            return <TransactionItemView key={trans.signature} transaction={trans} />;
        });
    };

    return <div>{getTransactions()}</div>;
};

interface TransactionItemViewProps {
    transaction: TransactionWithSignature;
}
const TransactionItemView: FC<TransactionItemViewProps> = ({ transaction }) => {
    const getTransactionItems = () => {
        const signature = transaction.signature?.toString();
        const meta = transaction.confirmedTransaction.meta;
        const trans = transaction.confirmedTransaction.transaction;
        const sender = transaction.confirmedTransaction.transaction.message.accountKeys[0].toBase58();
        const receiver = transaction.confirmedTransaction.transaction.message.accountKeys[1].toBase58();
        let amount = 0;
        if (meta) {
            amount = meta.preBalances[0] - meta.postBalances[0];
        }
        return (
            <>
                <li key={signature + "signature"}>
                    <label>Tx:</label> &nbsp;
                    {signature}
                </li>
                <li key={signature + "fee"}>
                    <label>Fee:</label>&nbsp;
                    {meta?.fee! / LAMPORTS_PER_SOL} Sol
                </li>
                <li key={signature + "amount"}>
                    <label>Sent Amount:</label>&nbsp;
                    {amount / LAMPORTS_PER_SOL} Sol
                </li>
                <li key={signature + "sender"}>
                    <label>Sender:</label>&nbsp;
                    {sender}
                </li>
                <li key={signature + "sender-balance"}>
                    <label>Sender Balance:</label>&nbsp;
                    {meta?.postBalances[0]! / LAMPORTS_PER_SOL} Sol
                </li>
                <li key={signature + "receiver"}>
                    <label>Receiver:</label>&nbsp;
                    {receiver}
                </li>
                <li key={signature + "receiver-balance"}>
                    <label>Receiver Balance:</label>&nbsp;
                    {meta?.postBalances[1]! / LAMPORTS_PER_SOL} Sol
                </li>
            </>
        );
    };

    return (
        <div className="trans-item">
            <ul className="trans-meta">{getTransactionItems()}</ul>
        </div>
    );
};

export default TransactionsView;