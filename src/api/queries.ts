import {createApi, retry} from '@reduxjs/toolkit/query/react';
import type {BaseQueryFn} from '@reduxjs/toolkit/query/react';
import {ApiError, apiFetch} from './client';


//refred to handlers.ts for the list of endpoints and their parameters
import type {
    Customer,
    CustomerResponse,
    Account,
    AccountsResponse,
    Transaction,
    TransactionsResponse,
    Payee,
    PayeesResponse,
} from './types'
import { withDemoParams } from './demoParams';


export const TRANSACTION_LIMIT = 8;

//refer to client.ts 
interface ApiRequest {
  path: string,
  init?: RequestInit,
}

//follow jsonError to handle errors
interface ApiFailure {
  status: number,
  message: string,
  fields?: Record<string, string>
  meta?: Record<string, unknown>
}

export function isApiFailure(error: unknown): error is ApiFailure {
  return typeof error === 'object' && error !== null && 'status' in error
}

export function toFailure(error: unknown): ApiFailure {
  if (error instanceof ApiError) {
    return { status: error.status, message: error.message, fields: error.fields }
  }
  return { status: 0, message: 'No response from the server.' }
}

// retry return unknown type, so we need to cast it to the correct type
const apiBaseQuery : BaseQueryFn<ApiRequest, unknown, ApiFailure> = async ({path, init}) => {
    try{
        return {data: await apiFetch(path, init)}
    }catch (error) {
        if (error instanceof ApiError) {
            return {
                error : {
                    status: error.status,
                    message: error.message,
                    fields: error.fields,
                    meta: error.meta,
                }
            }
        }
        return {
                error : {
                    status: 0,
                    message: 'No response from server'
                }
            }
    }
}


function read(path:string): ApiRequest {
    return {path: withDemoParams(path)};
}

export const api = createApi({
    reducerPath: 'api',
    refetchOnFocus: true,// requires setuplisteners else wont work
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: 30,
    keepUnusedDataFor: 300,
    baseQuery: retry(apiBaseQuery, {maxRetries: 0}),
    endpoints: (build)=>({
        getCustomer : build.query<Customer, void>({
            query:()=> read('/api/customer'),
            transformResponse: (response: CustomerResponse)=>response.customer,
        }),
        getAccounts: build.query<Account[], void>({
            query: ()=> read('/api/accounts'),
            transformResponse: (response: AccountsResponse)=>response.accounts,
        }),
        getTransactions: build.query<Transaction[], void>({
            query:()=> read(`/api/transactions?limit=${TRANSACTION_LIMIT}`),
            transformResponse: (response: TransactionsResponse)=>response.transactions,
        }),
        getPayees: build.query<Payee[], void>({
            query: () => read('/api/payees'),
            transformResponse: (response: PayeesResponse) => response.payees,
        }),
    })
})

export const {
    useGetCustomerQuery: useCustomer,
    useGetAccountsQuery: useAccounts,
    useGetTransactionsQuery: useTransactions,
    useGetPayeesQuery: usePayees
} = api;