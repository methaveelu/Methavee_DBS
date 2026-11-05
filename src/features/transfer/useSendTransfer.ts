import { api } from '../../api/queries'
import type { CreateTransferRequest, TransferResponse } from '../../api/types'

const READS = ['getCustomer', 'getAccounts', 'getTransactions'] as const

// Fetch again even if the cached copy looks fresh, and add no subscriber.
const REFRESH = { forceRefetch: true, subscribe: false }

const transferApi = api.injectEndpoints({
  endpoints: (build) => ({
    sendTransfer: build.mutation<TransferResponse, CreateTransferRequest>({

      async queryFn(request, { dispatch }, _extraOptions, baseQuery) {
        const sent = await baseQuery({
          path: '/api/transfers',
          init: {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(request),
          },
        })
        if (sent.error) return { error: sent.error }

        await Promise.all(
          READS.map(async (read) => {
            await dispatch(api.util.getRunningQueryThunk(read, undefined))
            await dispatch(api.endpoints[read].initiate(undefined, REFRESH))
          }),
        )

        return { data: sent.data as TransferResponse }
      },
    }),
  }),
})

export const { useSendTransferMutation: useSendTransfer } = transferApi