import { afterEach, describe, expect, it } from 'vitest'
import { ApiError, apiFetch } from './client'
import { withDemoParams } from './demoParams'
import type {
  AccountsResponse,
  CustomerResponse,
  PayeesResponse,
  TransactionsResponse,
} from './types'

describe('withDemoParams', () => {
  describe('when the page URL has no demo params', () => {
    it('returns the path unchanged', () => {
      expect(withDemoParams('/api/accounts', '')).toBe('/api/accounts')
    })

    it('keeps the query the path already has', () => {
      expect(withDemoParams('/api/transactions?limit=8', '')).toBe(
        '/api/transactions?limit=8',
      )
    })
  })

  describe('copying demo params from the page URL', () => {
    it('copies scenario=error', () => {
      expect(withDemoParams('/api/accounts', '?scenario=error')).toBe(
        '/api/accounts?scenario=error',
      )
    })

    it('copies scenario=empty', () => {
      expect(withDemoParams('/api/accounts', '?scenario=empty')).toBe(
        '/api/accounts?scenario=empty',
      )
    })

    it('copies delay', () => {
      expect(withDemoParams('/api/accounts', '?delay=1500')).toBe(
        '/api/accounts?delay=1500',
      )
    })

    it('copies delay=0, because 0 is a real value and not a missing one', () => {
      expect(withDemoParams('/api/accounts', '?delay=0')).toBe(
        '/api/accounts?delay=0',
      )
    })

    it('copies scenario and delay together', () => {
      expect(withDemoParams('/api/accounts', '?scenario=error&delay=1000')).toBe(
        '/api/accounts?scenario=error&delay=1000',
      )
    })

    it('reads the page query without a leading question mark', () => {
      expect(withDemoParams('/api/accounts', 'scenario=error')).toBe(
        '/api/accounts?scenario=error',
      )
    })
  })

  describe('combining with the query the path already has', () => {
    it('adds to the existing params with one question mark', () => {
      expect(withDemoParams('/api/transactions?limit=8', '?scenario=error')).toBe(
        '/api/transactions?limit=8&scenario=error',
      )
    })

    it('lets the page value replace a demo param already on the path', () => {
      expect(
        withDemoParams('/api/accounts?scenario=empty', '?scenario=error'),
      ).toBe('/api/accounts?scenario=error')
    })

    it('keeps special characters encoded', () => {
      expect(
        withDemoParams('/api/transactions?q=fair%26price', '?delay=1500'),
      ).toBe('/api/transactions?q=fair%26price&delay=1500')
    })
  })

  describe('page params it should not copy', () => {
    it('ignores params that are not on the demo list', () => {
      expect(withDemoParams('/api/accounts', '?utm_source=email')).toBe(
        '/api/accounts',
      )
    })

    it('does not let the page change a real API param', () => {
      expect(withDemoParams('/api/transactions?limit=8', '?limit=50')).toBe(
        '/api/transactions?limit=8',
      )
    })

    it('copies only the demo params from a mixed page URL', () => {
      expect(
        withDemoParams('/api/accounts', '?utm_source=email&scenario=error'),
      ).toBe('/api/accounts?scenario=error')
    })

    it('ignores a demo param with an empty value', () => {
      expect(withDemoParams('/api/accounts', '?scenario=&delay=')).toBe(
        '/api/accounts',
      )
    })

    it('leaves the path value alone when the page value is empty', () => {
      expect(withDemoParams('/api/accounts?delay=100', '?delay=')).toBe(
        '/api/accounts?delay=100',
      )
    })
  })

  describe('default page search', () => {
    afterEach(() => window.history.pushState({}, '', '/'))

    it('reads window.location.search when no search is passed', () => {
      window.history.pushState({}, '', '/?scenario=error&delay=1000')

      expect(withDemoParams('/api/accounts')).toBe(
        '/api/accounts?scenario=error&delay=1000',
      )
    })

    it('returns the path unchanged when the page URL has no query', () => {
      window.history.pushState({}, '', '/')

      expect(withDemoParams('/api/accounts')).toBe('/api/accounts')
    })
  })
})

// These run the helper's URL through apiFetch and the real mock handlers, so
// they prove the hooks do what the contract says. delay=0 keeps them fast.
describe('withDemoParams against the mock API', () => {
  describe('scenario=error', () => {
    it.each(['/api/customer', '/api/accounts', '/api/transactions', '/api/payees'])(
      'makes GET %s fail with 500 INTERNAL_ERROR',
      async (path) => {
        const error = await apiFetch(
          withDemoParams(path, '?scenario=error&delay=0'),
        ).catch((caught: unknown) => caught)

        expect(error).toBeInstanceOf(ApiError)
        expect(error).toMatchObject({ status: 500, code: 'INTERNAL_ERROR' })
      },
    )
  })

  describe('scenario=empty', () => {
    const search = '?scenario=empty&delay=0'

    it('returns no accounts', async () => {
      const { accounts } = await apiFetch<AccountsResponse>(
        withDemoParams('/api/accounts', search),
      )

      expect(accounts).toEqual([])
    })

    it('returns no transactions and a total of 0', async () => {
      const { transactions, total } = await apiFetch<TransactionsResponse>(
        withDemoParams('/api/transactions?limit=8', search),
      )

      expect(transactions).toEqual([])
      expect(total).toBe(0)
    })

    it('returns no payees', async () => {
      const { payees } = await apiFetch<PayeesResponse>(
        withDemoParams('/api/payees', search),
      )

      expect(payees).toEqual([])
    })

    it('has no effect on customer, which is not a list', async () => {
      const { customer } = await apiFetch<CustomerResponse>(
        withDemoParams('/api/customer', search),
      )

      expect(customer.id).toBe('cus_001')
    })
  })

  describe('delay', () => {
    it('slows the response down', async () => {
      const startedAt = performance.now()

      await apiFetch(withDemoParams('/api/accounts', '?delay=700'))

      expect(performance.now() - startedAt).toBeGreaterThanOrEqual(650)
    })
  })

  describe('no demo params', () => {
    it('returns the normal data', async () => {
      const { accounts } = await apiFetch<AccountsResponse>(
        withDemoParams('/api/accounts', ''),
      )

      expect(accounts).toHaveLength(3)
    })

    it('keeps the normal query working next to a demo param', async () => {
      const { transactions, total } = await apiFetch<TransactionsResponse>(
        withDemoParams('/api/transactions?limit=8', '?delay=0'),
      )

      expect(transactions).toHaveLength(8)
      expect(total).toBeGreaterThan(8)
    })
  })
})
