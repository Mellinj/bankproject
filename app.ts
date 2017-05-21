
import { TransactionOrigin  } from './enums';
import { IAccount, ITransaction, IPerson, } from './interfaces';

var ckStart: number = 1000;
var svStart: number = 10000;
var rtStart: number = 100000;
type acctHistArray = Array<Transaction>;
var DateOfTransaction = new Date;


class Person implements IPerson {

    constructor(public name: string, public dateOfBirth: Date, public checkingAccount: IAccount, public savingsAccount: IAccount, public retirementAccount: IAccount) {
        var ckAcctHistory: acctHistArray = [new Transaction];
        var svAcctHistory: acctHistArray = [new Transaction];
        var rtAcctHistory: acctHistArray = [new Transaction];
        var accountType = 0; //checking
        this.checkingAccount = new Account(this.name, this.dateOfBirth, 1000, ckAcctHistory, accountType);
        accountType = 1;
        this.savingsAccount = new Account(this.name, this.dateOfBirth, 10000, svAcctHistory, accountType);
        accountType = 2;
        this.retirementAccount = new Account(this.name, this.dateOfBirth, 100000, rtAcctHistory, accountType);

    }
}

class Transaction implements ITransaction {
    //public constructor(public success: boolean, public amount: number, public resultBalance: number, public transactionDate: Date, public description: string, public errorMessage: string, public transOrigin?:TransactionOrigin) {
    success = false;
    amount = 0;
    resultBalance = 0;
    transactionDate = DateOfTransaction;
    description = "";
    errorMessage = "";
    transOrigin = TransactionOrigin.web;
    //}
}

function ReachedMaximumOrigin(transactionOrigin: TransactionOrigin, HistoryLength: number, AcctHistory:ITransaction[]): boolean {
    //var counter = HistoryLength;
    var MaxOrigin: boolean;
    var OriginCounter:number[] = [0,0,0,0,0,0,0,0,0,0,0,0];    //array is for the months, [0] is Jan, [1] Feb....etc.  The value in the array is the number of occurances

    var monthNum = 0;
    MaxOrigin = false;
    for (var i = 0; i < HistoryLength; i++) {
        monthNum = AcctHistory[i].transactionDate.getUTCMonth();
        //console.log("month = " + monthNum);
        // console.log(" AcctHistory[" + i + "].transOrigin = " + AcctHistory[i].transOrigin.valueOf() + "    transactionOrigin = " + transactionOrigin.valueOf());
        if (AcctHistory[i].transOrigin == transactionOrigin.valueOf()) {

            //console.log("History Origin = " + AcctHistory[i].transOrigin + "    transactionOrigin.valueOf() = " + AcctHistory[i].transOrigin.valueOf());

            OriginCounter[monthNum] = OriginCounter[monthNum] + 1;

            //console.log("OriginCount[" + monthNum + "] = " + OriginCounter[monthNum]);

            if (OriginCounter[monthNum] >= 6) {
                MaxOrigin = true;
                //console.log("REACHED MAX");
            }
        }
    }
    return MaxOrigin;
}

function LessThan60(birthday: Date): boolean {
    //console.log("birthday = " + birthday);
    let ageDifMs = Date.now() - birthday.getTime()
    let ageDate = new Date(ageDifMs)
    //console.log("age = " + Math.abs(ageDate.getUTCFullYear() - 1970));
    if (Math.abs(ageDate.getUTCFullYear() - 1970) < 60)
        return true;
    else
        return false;
}

class Account implements IAccount {
    constructor(public accountHolderName: string, public accountHolderBirthDate: Date, public balance: number, public accountHistory:Array<ITransaction>, public accountType?: number) {
        this.accountHistory = [new Transaction];

    }


    advanceDate(numberOfDays: number) {
        DateOfTransaction.getDate();
        //console.log("advance...Date = " + DateOfTransaction.getDate());
        //console.log("number of Days to add = " + numberOfDays);
        DateOfTransaction.setDate(DateOfTransaction.getDate() + numberOfDays);
        //console.log("advance...new Date = " + DateOfTransaction.getDate());
        //console.log("advance...new Date = " + DateOfTransaction);
    }


    withdrawMoney(WithdrawAmount:number, transactionOrigin:TransactionOrigin, description:string){
        var successful: boolean;
        var MaxWeb: boolean;
        var MaxPhone: boolean;
        var mDate: Date;
        var HistoryLength: number;
        var today = new Date;
        var Fee = 0;
        let trans = new Transaction;

        trans.resultBalance = this.balance;
        trans.success = false;
        MaxWeb = false;
        MaxPhone = false;

        //console.log("account Type = "+ this.accountType);

        //acountType 0=checking, 1=savings, 2=retirement
        if (this.accountType == 0) {
            //console.log("checking, withdrawAmt = "+WithdrawAmount+"  this.balance = "+this.balance);
            if (WithdrawAmount <= this.balance) {
                //trans.resultBalance = trans.resultBalance + WithdrawAmount;
                trans.errorMessage = "";
                trans.success = true;
            }
            else {
                trans.success = false;
                trans.errorMessage = "Sorry, not enough money in account";
            }
        }
        else if (this.accountType == 2) {
            //console.log("retirement");
            //test if web origin
            if (transactionOrigin == TransactionOrigin.phone) {
                MaxPhone = ReachedMaximumOrigin(transactionOrigin, this.accountHistory.length, this.accountHistory);
            }
            else if (transactionOrigin == TransactionOrigin.web) {
                MaxWeb = ReachedMaximumOrigin(transactionOrigin, this.accountHistory.length, this.accountHistory);

            }
            //if less than 60 years old
            if (LessThan60(this.accountHolderBirthDate)) {
                Fee = WithdrawAmount * .1;
            }
        }
        else if (this.accountType == 1) {
            //test if web origin
            //console.log("History length = " + this.accountHistory.length);

            if (transactionOrigin == TransactionOrigin.phone) {
                MaxPhone = ReachedMaximumOrigin(transactionOrigin, this.accountHistory.length, this.accountHistory);
            }
            else if (transactionOrigin == TransactionOrigin.web) {
                MaxWeb = ReachedMaximumOrigin(transactionOrigin, this.accountHistory.length, this.accountHistory);

            }
        }

        if ((!MaxWeb) && (!MaxPhone)) {

            if (Math.abs(WithdrawAmount) <= this.balance) {

                trans.errorMessage = "";
                trans.success = true;
            }
            else {
                trans.success = false;
                trans.errorMessage = "Sorry, not enough money in account";

            }
        }
        else if (MaxWeb) {
            trans.success = false;
            trans.errorMessage = "Sorry, you have reached the maximum of 6 web withdrawals for the month";
        }
        else if (MaxPhone) {
            trans.success = false;
            trans.errorMessage = "Sorry, you have reached the maximum of 6 phone withdrawals for the month";
        }

        if (trans.success) {
            trans.resultBalance = trans.resultBalance + WithdrawAmount - Fee;
            this.balance = trans.resultBalance;
            trans.transactionDate = DateOfTransaction;          //*** find out about advanceDate  */
            trans.amount = WithdrawAmount-Fee;
            trans.description = description;
            trans.transOrigin = transactionOrigin;
            //get length of accountHistory array
            HistoryLength = this.accountHistory.length;
            //add recent transaction to the history array
            this.accountHistory[HistoryLength] = trans;

            //console.log("success.  balance = " + this.balance+"  trans date = " + trans.transactionDate);
        }
        return trans;
    }

    depositMoney(DepositAmount:number, description:string) {
        var successful: boolean;
        var mDate: Date;
        let trans = new Transaction;

        trans.resultBalance = this.balance;
        trans.success = false;
        /*trans.transactionDate = Date           *** find out about advanceDate  */

        trans.resultBalance = trans.resultBalance + DepositAmount;
        trans.errorMessage = "";
        trans.success = true;

        this.balance = trans.resultBalance;
        return trans;
    }


}

class Startup {
    public static main(): number {
        var i: number;
        var tempName: string;
        var tempNumber: number;
        var Error: string;
        var withdrawAmount: number;
        var depositAmount: number;
        let ckAccount: IAccount;
        let svAccount: IAccount;
        let rtAccount: IAccount;

        var DOB = new Date('1965-02-23');
        withdrawAmount = -100;
        depositAmount = 500;


        let thePerson = new Person("Dallin", DOB, ckAccount, svAccount, rtAccount);


        console.log("Checking, withdraw: $" + withdrawAmount);
        for (i = 1; i <= 8; i++) {
            Error = thePerson.checkingAccount.withdrawMoney(withdrawAmount, TransactionOrigin.web, "first one").errorMessage;
            if (Error.length > 0)
                console.log(Error);
            else
                console.log("Transaction #" + i +", Balance: " + thePerson.checkingAccount.balance);
        }

        console.log("Savings PHONE, withdraw: $" + withdrawAmount);
        for (i = 1; i <= 8; i++) {
            Error = thePerson.savingsAccount.withdrawMoney(withdrawAmount, TransactionOrigin.phone, "Savings PHONE").errorMessage;
            if (Error.length > 0)
                console.log(Error);
            else
                console.log("Transaction #" + i +", Balance: " + thePerson.savingsAccount.balance);
        }
        console.log("Savings WEB, withdraw: $" + withdrawAmount);
        for (i = 1; i <= 8; i++) {
            Error = thePerson.savingsAccount.withdrawMoney(withdrawAmount, TransactionOrigin.web, "Savings WEB").errorMessage;
            if (Error.length > 0)
                console.log(Error);
            else
                console.log("Transaction #"+i+", Balance: " + thePerson.savingsAccount.balance);
        }

        console.log("Retire WEB, withdraw: $" + withdrawAmount);
        for (i = 1; i <= 8; i++) {
            Error = thePerson.retirementAccount.withdrawMoney(withdrawAmount, TransactionOrigin.web, "Retire WEB").errorMessage;
            if (Error.length > 0)
                console.log(Error);
            else
                console.log("Transaction #" + i +", Balance: " + thePerson.retirementAccount.balance);
        }
        console.log("Retire  PHONE, withdraw: $" + withdrawAmount);
        for (i = 1; i <= 8; i++) {
            Error = thePerson.retirementAccount.withdrawMoney(withdrawAmount, TransactionOrigin.phone, "Retire PHONE").errorMessage;
            if (Error.length > 0)
                console.log(Error);
            else
                console.log("Transaction #" + i +", Balance: "+thePerson.retirementAccount.balance);
        }


        console.log("ADVANCE DATE...PHONE, withdraw: $"+withdrawAmount);
        thePerson.checkingAccount.advanceDate(100);

        for (var i = 0; i <= 7; i++) {
            Error = thePerson.retirementAccount.withdrawMoney(withdrawAmount, TransactionOrigin.phone, "ADVANCE DATE..PHONE").errorMessage;
            if (Error.length > 0)
                console.log(Error);
            else
                console.log("Transaction #" + i +", Balance: " + thePerson.retirementAccount.balance);
        }

        console.log("DEPOSIT checking: $"+depositAmount);
        thePerson.checkingAccount.depositMoney(depositAmount, "deposit 1");
        console.log("Balance: " + thePerson.checkingAccount.balance);

        console.log("DEPOSIT savings: $" + depositAmount);
        thePerson.savingsAccount.depositMoney(depositAmount, "deposit 2");
        console.log("Balance: " + thePerson.savingsAccount.balance);

        console.log("DEPOSIT retirement: $" + depositAmount);
        thePerson.retirementAccount.depositMoney(depositAmount, "deposit 1");
        console.log("Balance: " + thePerson.retirementAccount.balance);

        return 0;
    }
}

Startup.main();
