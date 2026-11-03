import type {Account, Customer, Transaction} from '../../src/api/types';


//total amount less the credit amount = checking + savings
export function depositAccounts(accounts: Account[]): Account[] {
    return accounts.filter((account)=> account.type !== 'credit');
}

export function totalAvailable(accounts: Account[]): number {
    const cents = depositAccounts(accounts).reduce((total, account) => total + Math.round(account.balance*100), 0);
    return cents/100;
}

export function remainingDailyLimit(customer: Customer):number{
    const cents = Math.round(customer.dailyTransferLimit * 100) - Math.round(customer.transferredToday * 100);
    return cents/100;
}

//handle search based on Filter the list by description **or** category
export function searchAccounts(transactions: Transaction[], searchTerm: string): Transaction[] {
    const term = searchTerm.trim().toLowerCase();
    if(!term) return transactions;
    return transactions.filter((transaction)=> 
        transaction.description.toLowerCase().includes(term) || transaction.category.toLowerCase().includes(term)
    )
}


