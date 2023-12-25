import type { AddressBalanceResponse } from '@stacks/stacks-blockchain-api-types';
import type { TPrincipal } from 'clarity-abi';
import { retryOnError, richFetch } from '../common/fetch.js';
import {
  type RequestOptions,
  mergeDefaultExtendedApiRequestOptions,
  mergeDefaultNodeApiRequestOptions,
} from './request.js';

export type AccountDataResponse = {
  balance: bigint;
  locked: bigint;
  unlock_height: number;
  nonce: number;
  balance_proof: string;
  nonce_proof: string;
};

export async function getAccountInfo<T extends { proof?: boolean }>(
  address: TPrincipal,
  _options?: RequestOptions & T,
): Promise<
  T extends { proof: true }
    ? AccountDataResponse
    : Omit<AccountDataResponse, 'balance_proof' | 'nonce_proof'>
> {
  const options = mergeDefaultNodeApiRequestOptions(_options);
  const url = `${options.stacksEndpoint}/v2/accounts/${address}?proof=${
    _options?.proof === true ? 1 : 0
  }`;
  const rs = await richFetch(url, {
    timeout: options.timeout,
    fetch: options.fetch,
    retries: options.retries,
    retryDelay: options.retryDelay,
    retryOn: retryOnError,
  });
  const result: AccountDataResponse = await rs.json();
  // safe-guard to ensure stacks api returns proper response
  if (typeof result.nonce !== 'number' || !(result.nonce >= 0)) {
    throw new Error(
      `Unexpected account nonce response: ${JSON.stringify(result)}`,
    );
  }
  result.balance = BigInt(result.balance);
  result.locked = BigInt(result.locked);
  return result;
}

/**
 * The latest nonce values used by an account by inspecting the mempool, microblock transactions, and anchored transactions
 */
export interface AddressNonces {
  /**
   * The latest nonce found within mempool transactions sent by this address. Will be -1 if there are no current mempool transactions for this address.
   */
  last_mempool_tx_nonce: number;
  /**
   * The latest nonce found within transactions sent by this address, including unanchored microblock transactions. Will be -1 if there are no current transactions for this address.
   */
  last_executed_tx_nonce: number;
  /**
   * The likely nonce required for creating the next transaction, based on the last nonces seen by the API. This can be incorrect if the API's mempool or transactions aren't fully synchronized, even by a small amount, or if a previous transaction is still propagating through the Stacks blockchain network when this endpoint is called.
   */
  possible_next_nonce: number;
  /**
   * Nonces that appear to be missing and likely causing a mempool transaction to be stuck.
   */
  detected_missing_nonces: number[];
  /**
   * Nonces currently in mempool for this address.
   */
  detected_mempool_nonces?: number[];
}

export async function getAccountNonces(
  address: string,
  _options?: RequestOptions,
): Promise<AddressNonces> {
  const options = mergeDefaultExtendedApiRequestOptions(_options);
  const url = `${options.stacksEndpoint}/extended/v1/address/${address}/nonces`;
  const rs = await richFetch(url, {
    timeout: options.timeout,
    fetch: options.fetch,
    retries: options.retries,
    retryDelay: options.retryDelay,
    retryOn: retryOnError,
  });
  const nonces: AddressNonces = await rs.json();
  // safe-guard to ensure stacks api returns proper response
  if (
    typeof nonces.possible_next_nonce !== 'number' ||
    !(nonces.possible_next_nonce >= 0)
  ) {
    throw new Error(
      `Unexpected account nonce response: ${JSON.stringify(nonces)}`,
    );
  }
  if (nonces.last_executed_tx_nonce == null) nonces.last_executed_tx_nonce = -1;
  if (nonces.last_mempool_tx_nonce == null) nonces.last_mempool_tx_nonce = -1;
  if (!Array.isArray(nonces.detected_missing_nonces))
    nonces.detected_missing_nonces = [];
  return nonces;
}

export interface FtBalance {
  balance: bigint;
  total_sent: bigint;
  total_received: bigint;
}
export interface NftBalance {
  count: bigint;
  total_sent: bigint;
  total_received: bigint;
}
export interface AddressUnlockSchedule {
  /**
   * Micro-STX amount locked at this block height.
   */
  amount: bigint;
  block_height: number;
}
export interface AddressTokenOfferingLocked {
  /**
   * Micro-STX amount still locked at current block height.
   */
  total_locked: bigint;
  /**
   * Micro-STX amount unlocked at current block height.
   */
  total_unlocked: bigint;
  unlock_schedule: AddressUnlockSchedule[];
}
export interface AccountBalances {
  stx: {
    balance: bigint;
    total_sent: bigint;
    total_received: bigint;
    total_fees_sent: bigint;
    total_miner_rewards_received: bigint;
    lock_tx_id: string;
    locked: bigint;
    lock_height: number;
    burnchain_lock_height: number;
    burnchain_unlock_height: number;
  };
  fungible_tokens: Record<string, FtBalance>;
  non_fungible_tokens: Record<string, NftBalance>;
  token_offering_locked?: AddressTokenOfferingLocked;
}

export async function getAccountBalances(
  address: string,
  _options?: RequestOptions,
): Promise<AccountBalances> {
  const options = mergeDefaultExtendedApiRequestOptions(_options);
  const url = `${options.stacksEndpoint}/extended/v1/address/${address}/balances`;
  const rs = await richFetch(url, {
    timeout: options.timeout,
    fetch: options.fetch,
    retries: options.retries,
    retryDelay: options.retryDelay,
    retryOn: retryOnError,
  });
  const result: AddressBalanceResponse = await rs.json();
  const balances: AccountBalances = {
    stx: {
      balance: BigInt(result.stx.balance),
      total_sent: BigInt(result.stx.total_sent),
      total_received: BigInt(result.stx.total_received),
      total_fees_sent: BigInt(result.stx.total_fees_sent),
      total_miner_rewards_received: BigInt(
        result.stx.total_miner_rewards_received,
      ),
      lock_tx_id: result.stx.lock_tx_id,
      locked: BigInt(result.stx.locked),
      lock_height: result.stx.lock_height,
      burnchain_lock_height: result.stx.burnchain_lock_height,
      burnchain_unlock_height: result.stx.burnchain_unlock_height,
    },
    fungible_tokens: {},
    non_fungible_tokens: {},
  };
  for (const [k, v] of Object.entries(result.fungible_tokens)) {
    if (v == null) continue;
    balances.fungible_tokens[k] = {
      balance: BigInt(v.balance),
      total_received: BigInt(v.total_received),
      total_sent: BigInt(v.total_sent),
    };
  }
  for (const [k, v] of Object.entries(result.non_fungible_tokens)) {
    if (v == null) continue;
    balances.non_fungible_tokens[k] = {
      count: BigInt(v.count),
      total_received: BigInt(v.total_received),
      total_sent: BigInt(v.total_sent),
    };
  }
  if (result.token_offering_locked != null) {
    balances.token_offering_locked = {
      total_locked: BigInt(result.token_offering_locked.total_locked),
      total_unlocked: BigInt(result.token_offering_locked.total_unlocked),
      unlock_schedule: result.token_offering_locked.unlock_schedule.map(
        (schedule) => ({
          amount: BigInt(schedule.amount),
          block_height: schedule.block_height,
        }),
      ),
    };
  }
  return balances;
}
