import { pool } from "../types/sui/deepbook.js"
import { LRUCache } from 'lru-cache'
import { MoveFetchConfig } from '@sentio/protos'
import { SuiContext, SuiNetwork } from '@sentio/sdk/sui'
import { CoinMetadata } from '@mysten/sui.js/client'
import { normalizeSuiAddress } from '@mysten/sui.js/utils'

const coinsMetadata = new Map<string, CoinMetadata | null>()

// Create or export the shared LRU
// (We'll import this same instance from orderProcessors)
export const poolCache = new LRUCache<string, any>({
  max: 100_000 
  // No TTL => indefinite caching
})

// Optional: If you need to reindex from earliest block
const fetchConfig: MoveFetchConfig = {
  resourceChanges: true,
  allEvents: true,
  inputs: true
}


export function initPoolCreationProcessor() {
  pool.bind({})
    .onEventPoolCreated(async (event, ctx: SuiContext) => {
      const poolId = event.data_decoded.pool_id

      // Get base_asset_id and quote_asset_id
      const baseAssetId = event.type_arguments[0]
      const quoteAssetId = event.type_arguments[1]

      // Fetch coin metadata for each
      const baseMeta: CoinMetadata | null | undefined = await getCoinMetadata(ctx, baseAssetId)
      const quoteMeta: CoinMetadata | null | undefined = await getCoinMetadata(ctx, quoteAssetId)

      const poolData = {
        base_asset_id: baseAssetId,
        base_symbol: baseMeta?.symbol ?? null,
        base_decimals: baseMeta?.decimals ?? null,
        quote_asset_id: quoteAssetId,
        quote_symbol: quoteMeta?.symbol ?? null,
        quote_decimals: quoteMeta?.decimals ?? null,
        taker_fee: event.data_decoded.taker_fee,
        maker_fee: event.data_decoded.maker_fee,
        tick_size: event.data_decoded.tick_size,
        lot_size: event.data_decoded.lot_size,
        min_size: event.data_decoded.min_size,
        whitelisted_pool: event.data_decoded.whitelisted_pool,
        treasury_address: event.data_decoded.treasury_address,
      }
      poolCache.set(poolId, poolData)

      ctx.eventLogger.emit("deepbook_pool_created", {
        pool_id: poolId,
        ...poolData,
        sender: event.sender,
        storage_cost: ctx.transaction.effects?.gasUsed.storageCost,
        gas_computation: ctx.transaction.effects?.gasUsed.computationCost,
        nonrefundable_storage_fee: ctx.transaction.effects?.gasUsed.nonRefundableStorageFee,
        storage_rebate: ctx.transaction.effects?.gasUsed.storageRebate
      })
    }, fetchConfig)
} 


// Create a separate LRU cache for coin metadata
const coinMetadataCache = new LRUCache<string, CoinMetadata | null>({
  max: 10_000 // Adjust the size as needed
})

export async function getCoinMetadata(ctx: SuiContext, coinType: string) {
    if (!coinType.startsWith('0x')) {
      coinType = '0x' + coinType
    }
    // coinType = normalizeSuiAddress(coinType)
    let metadata = coinMetadataCache.get(coinType)
    if (metadata === undefined) {
      try {
        const data = await ctx.client.getCoinMetadata({ coinType })
        if (data) {
          metadata = data
          coinMetadataCache.set(coinType, metadata)
        }
      } catch (e) {
        console.warn('getCoinMetadata failed with', e.message)
        coinMetadataCache.set(coinType, null)
      }
    }
    return metadata
  }