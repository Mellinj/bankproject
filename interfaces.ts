
import { TransactionOrigin } from "./enums";


interface IAccount {
    accountHolderName: string;
    accountHolderBirthDate: Date;
    balance: number;
    withdrawMoney(amount: number,
                  transactionOrigin: TransactionOrigin,
                  description?: string): ITransaction;
    depositMoney(amount: number,
                 description?: string) : ITransaction;
    accountHistory : ITransaction[];
    advanceDate(numberOfDays: number);
}

interface ITransaction
{
    success: boolean;
    // amount will be positive for deposits and negative for withdrawals:
    amount: number;
    // resultBalance will be unchanged from the previous balance when success is false.
    resultBalance: number;
    transactionDate: Date;
    description: string;
    // errorMessage will be an empty string when success is true:
    errorMessage: string;
    transOrigin: TransactionOrigin;
}

interface IPerson
{
    name: string;
    dateOfBirth: Date;
    checkingAccount: IAccount;
    savingsAccount: IAccount;
    retirementAccount: IAccount;
}

export {IAccount, ITransaction, IPerson};



