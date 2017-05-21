"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var enums_1 = require("./enums");
var ckStart = 1000;
var svStart = 10000;
var rtStart = 100000;
var DateOfTransaction = new Date;
var Person = (function () {
    function Person(name, dateOfBirth, checkingAccount, savingsAccount, retirementAccount) {
        this.name = name;
        this.dateOfBirth = dateOfBirth;
        this.checkingAccount = checkingAccount;
        this.savingsAccount = savingsAccount;
        this.retirementAccount = retirementAccount;
        var ckAcctHistory = [new Transaction];
        var svAcctHistory = [new Transaction];
        var rtAcctHistory = [new Transaction];
        var accountType = 0; //checking
        this.checkingAccount = new Account(this.name, this.dateOfBirth, 1000, ckAcctHistory, accountType);
        accountType = 1;
        this.savingsAccount = new Account(this.name, this.dateOfBirth, 10000, svAcctHistory, accountType);
        accountType = 2;
        this.retirementAccount = new Account(this.name, this.dateOfBirth, 100000, rtAcctHistory, accountType);
    }
    return Person;
}());
var Transaction = (function () {
    function Transaction() {
        //public constructor(public success: boolean, public amount: number, public resultBalance: number, public transactionDate: Date, public description: string, public errorMessage: string, public transOrigin?:TransactionOrigin) {
        this.success = false;
        this.amount = 0;
        this.resultBalance = 0;
        this.transactionDate = DateOfTransaction;
        this.description = "";
        this.errorMessage = "";
        this.transOrigin = enums_1.TransactionOrigin.web;
        //}
    }
    return Transaction;
}());
function ReachedMaximumOrigin(transactionOrigin, HistoryLength, AcctHistory) {
    //var counter = HistoryLength;
    var MaxOrigin;
    var OriginCounter = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; //array is for the months, [0] is Jan, [1] Feb....etc.  The value in the array is the number of occurances
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
function LessThan60(birthday) {
    //console.log("birthday = " + birthday);
    var ageDifMs = Date.now() - birthday.getTime();
    var ageDate = new Date(ageDifMs);
    //console.log("age = " + Math.abs(ageDate.getUTCFullYear() - 1970));
    if (Math.abs(ageDate.getUTCFullYear() - 1970) < 60)
        return true;
    else
        return false;
}
var Account = (function () {
    function Account(accountHolderName, accountHolderBirthDate, balance, accountHistory, accountType) {
        this.accountHolderName = accountHolderName;
        this.accountHolderBirthDate = accountHolderBirthDate;
        this.balance = balance;
        this.accountHistory = accountHistory;
        this.accountType = accountType;
        this.accountHistory = [new Transaction];
    }
    Account.prototype.advanceDate = function (numberOfDays) {
        DateOfTransaction.getDate();
        //console.log("advance...Date = " + DateOfTransaction.getDate());
        //console.log("number of Days to add = " + numberOfDays);
        DateOfTransaction.setDate(DateOfTransaction.getDate() + numberOfDays);
        //console.log("advance...new Date = " + DateOfTransaction.getDate());
        //console.log("advance...new Date = " + DateOfTransaction);
    };
    Account.prototype.withdrawMoney = function (WithdrawAmount, transactionOrigin, description) {
        var successful;
        var MaxWeb;
        var MaxPhone;
        var mDate;
        var HistoryLength;
        var today = new Date;
        var Fee = 0;
        var trans = new Transaction;
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
            if (transactionOrigin == enums_1.TransactionOrigin.phone) {
                MaxPhone = ReachedMaximumOrigin(transactionOrigin, this.accountHistory.length, this.accountHistory);
            }
            else if (transactionOrigin == enums_1.TransactionOrigin.web) {
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
            if (transactionOrigin == enums_1.TransactionOrigin.phone) {
                MaxPhone = ReachedMaximumOrigin(transactionOrigin, this.accountHistory.length, this.accountHistory);
            }
            else if (transactionOrigin == enums_1.TransactionOrigin.web) {
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
            trans.transactionDate = DateOfTransaction; //*** find out about advanceDate  */
            trans.amount = WithdrawAmount - Fee;
            trans.description = description;
            trans.transOrigin = transactionOrigin;
            //get length of accountHistory array
            HistoryLength = this.accountHistory.length;
            //add recent transaction to the history array
            this.accountHistory[HistoryLength] = trans;
            //console.log("success.  balance = " + this.balance+"  trans date = " + trans.transactionDate);
        }
        return trans;
    };
    Account.prototype.depositMoney = function (DepositAmount, description) {
        var successful;
        var mDate;
        var trans = new Transaction;
        trans.resultBalance = this.balance;
        trans.success = false;
        /*trans.transactionDate = Date           *** find out about advanceDate  */
        trans.resultBalance = trans.resultBalance + DepositAmount;
        trans.errorMessage = "";
        trans.success = true;
        this.balance = trans.resultBalance;
        return trans;
    };
    return Account;
}());
var Startup = (function () {
    function Startup() {
    }
    Startup.main = function () {
        var i;
        var tempName;
        var tempNumber;
        var Error;
        var withdrawAmount;
        var depositAmount;
        var ckAccount;
        var svAccount;
        var rtAccount;

        var DOB = new Date('1955-01-15');
        withdrawAmount = -100;
        depositAmount = 500;
        var thePerson = new Person("Dallin", DOB, ckAccount, svAccount, rtAccount);

        console.log("Checking, withdraw: $" + withdrawAmount);
        for (i = 1; i <= 8; i++) {
            Error = thePerson.checkingAccount.withdrawMoney(withdrawAmount, enums_1.TransactionOrigin.web, "first one").errorMessage;
            if (Error.length > 0)
                console.log(Error);
            else
                console.log("Transaction #" + i + ", Balance: " + thePerson.checkingAccount.balance);
        }
        console.log("Savings PHONE, withdraw: $" + withdrawAmount);
        for (i = 1; i <= 8; i++) {
            Error = thePerson.savingsAccount.withdrawMoney(withdrawAmount, enums_1.TransactionOrigin.phone, "Savings PHONE").errorMessage;
            if (Error.length > 0)
                console.log(Error);
            else
                console.log("Transaction #" + i + ", Balance: " + thePerson.savingsAccount.balance);
        }
        console.log("Savings WEB, withdraw: $" + withdrawAmount);
        for (i = 1; i <= 8; i++) {
            Error = thePerson.savingsAccount.withdrawMoney(withdrawAmount, enums_1.TransactionOrigin.web, "Savings WEB").errorMessage;
            if (Error.length > 0)
                console.log(Error);
            else
                console.log("Transaction #" + i + ", Balance: " + thePerson.savingsAccount.balance);
        }
        console.log("Retire WEB, withdraw: $" + withdrawAmount);
        for (i = 1; i <= 8; i++) {
            Error = thePerson.retirementAccount.withdrawMoney(withdrawAmount, enums_1.TransactionOrigin.web, "Retire WEB").errorMessage;
            if (Error.length > 0)
                console.log(Error);
            else
                console.log("Transaction #" + i + ", Balance: " + thePerson.retirementAccount.balance);
        }
        console.log("Retire  PHONE, withdraw: $" + withdrawAmount);
        for (i = 1; i <= 8; i++) {
            Error = thePerson.retirementAccount.withdrawMoney(withdrawAmount, enums_1.TransactionOrigin.phone, "Retire PHONE").errorMessage;
            if (Error.length > 0)
                console.log(Error);
            else
                console.log("Transaction #" + i + ", Balance: " + thePerson.retirementAccount.balance);
        }
        console.log("ADVANCE DATE...PHONE, withdraw: $" + withdrawAmount);
        thePerson.checkingAccount.advanceDate(100);
        for (var i = 0; i <= 7; i++) {
            Error = thePerson.retirementAccount.withdrawMoney(withdrawAmount, enums_1.TransactionOrigin.phone, "ADVANCE DATE..PHONE").errorMessage;
            if (Error.length > 0)
                console.log(Error);
            else
                console.log("Transaction #" + i + ", Balance: " + thePerson.retirementAccount.balance);
        }
        console.log("DEPOSIT checking: $" + depositAmount);
        thePerson.checkingAccount.depositMoney(depositAmount, "deposit 1");
        console.log("Balance: " + thePerson.checkingAccount.balance);
        console.log("DEPOSIT savings: $" + depositAmount);
        thePerson.savingsAccount.depositMoney(depositAmount, "deposit 2");
        console.log("Balance: " + thePerson.savingsAccount.balance);
        console.log("DEPOSIT retirement: $" + depositAmount);
        thePerson.retirementAccount.depositMoney(depositAmount, "deposit 1");
        console.log("Balance: " + thePerson.retirementAccount.balance);
        return 0;
    };
    return Startup;
}());

// For testing purposes!!
//Startup.main();
