import { order_info, order, vault, fill } from "../types/sui/deepbook.js"
import { poolCache } from "./poolCreationProcessor.js"  // Shared LRU cache import
import { MoveFetchConfig } from '@sentio/protos'

const fetchConfig: MoveFetchConfig = {
  resourceChanges: true,
  allEvents: true,
  inputs: true
}

/**
 * Initializes the event processors for orders, fills, modifications, flash loans, etc.
 * These handlers look up additional pool metadata (base/quote assets, fees, etc.)
 * from the shared LRU cache populated by poolCreationProcessor.
 */
export function initOrderEventsProcessor() {
  // 1) Order Info: Fills, placements, expirations
  order_info.bind()
    .onEventOrderFilled((event, ctx) => {
      const poolId = event.data_decoded.pool_id
      const cachedPool = poolCache.get(poolId)

      const baseQuantity = event.data_decoded.base_quantity
      const quoteQuantity = event.data_decoded.quote_quantity
      const baseDecimals = cachedPool?.base_decimals || 1
      const quoteDecimals = cachedPool?.quote_decimals || 1

      ctx.eventLogger.emit("deepbook_order_filled", {
        // Original fields
        pool_id: poolId,
        maker_order_id: event.data_decoded.maker_order_id,
        taker_order_id: event.data_decoded.taker_order_id,
        maker_client_order_id: event.data_decoded.maker_client_order_id,
        taker_client_order_id: event.data_decoded.taker_client_order_id,
        price: event.data_decoded.price,
        taker_is_bid: event.data_decoded.taker_is_bid,
        taker_fee: event.data_decoded.taker_fee,
        taker_fee_is_deep: event.data_decoded.taker_fee_is_deep,
        maker_fee: event.data_decoded.maker_fee,
        maker_fee_is_deep: event.data_decoded.maker_fee_is_deep,
        base_quantity: baseQuantity,
        quote_quantity: quoteQuantity,
        maker_balance_manager_id: event.data_decoded.maker_balance_manager_id,
        taker_balance_manager_id: event.data_decoded.taker_balance_manager_id,

        // Enriched from cache
        base_asset_id: cachedPool?.base_asset_id,
        base_symbol: cachedPool?.base_symbol,
        base_decimals: baseDecimals,
        quote_asset_id: cachedPool?.quote_asset_id,
        quote_symbol: cachedPool?.quote_symbol,
        quote_decimals: quoteDecimals,
        pool_created_at: cachedPool?.created_at,
        pool_sender: cachedPool?.sender,

        // Gas info + metadata
        sender: event.sender,
        storage_cost: ctx.transaction.effects?.gasUsed.storageCost,
        gas_computation: ctx.transaction.effects?.gasUsed.computationCost,
        nonrefundable_storage_fee: ctx.transaction.effects?.gasUsed.nonRefundableStorageFee,
        storage_rebate: ctx.transaction.effects?.gasUsed.storageRebate,

        // New calculated fields
        base_quantity_normalized: Number(baseQuantity) / Math.pow(10, baseDecimals),
        quote_quantity_normalized: Number(quoteQuantity) / Math.pow(10, quoteDecimals)
      })
    }, fetchConfig)
    .onEventOrderPlaced((event, ctx) => {
      const poolId = event.data_decoded.pool_id
      const cachedPool = poolCache.get(poolId)

      const placedQuantity = event.data_decoded.placed_quantity
      const baseDecimals = cachedPool?.base_decimals || 1

      ctx.eventLogger.emit("deepbook_order_placed", {
        balance_manager_id: event.data_decoded.balance_manager_id,
        pool_id: poolId,
        order_id: event.data_decoded.order_id,
        client_order_id: event.data_decoded.client_order_id,
        trader: event.data_decoded.trader,
        price: event.data_decoded.price,
        is_bid: event.data_decoded.is_bid,
        placed_quantity: placedQuantity,
        expire_timestamp: event.data_decoded.expire_timestamp,

        // Enriched from cache
        base_asset_id: cachedPool?.base_asset_id,
        base_symbol: cachedPool?.base_symbol,
        base_decimals: baseDecimals,
        quote_asset_id: cachedPool?.quote_asset_id,
        quote_symbol: cachedPool?.quote_symbol,
        quote_decimals: cachedPool?.quote_decimals,
        taker_fee: cachedPool?.taker_fee,
        maker_fee: cachedPool?.maker_fee,

        // Gas info + metadata
        sender: event.sender,
        storage_cost: ctx.transaction.effects?.gasUsed.storageCost,
        gas_computation: ctx.transaction.effects?.gasUsed.computationCost,
        nonrefundable_storage_fee: ctx.transaction.effects?.gasUsed.nonRefundableStorageFee,
        storage_rebate: ctx.transaction.effects?.gasUsed.storageRebate,

        // New calculated field
        placed_quantity_normalized: Number(placedQuantity) / Math.pow(10, baseDecimals)
      })
    }, fetchConfig)
    .onEventOrderExpired((event, ctx) => {
      const poolId = event.data_decoded.pool_id
      const cachedPool = poolCache.get(poolId)

      const originalQuantity = event.data_decoded.original_quantity
      const baseAssetQuantityCanceled = event.data_decoded.base_asset_quantity_canceled
      const baseDecimals = cachedPool?.base_decimals || 1

      ctx.eventLogger.emit("deepbook_order_expired", {
        balance_manager_id: event.data_decoded.balance_manager_id,
        pool_id: poolId,
        order_id: event.data_decoded.order_id,
        client_order_id: event.data_decoded.client_order_id,
        trader: event.data_decoded.trader,
        price: event.data_decoded.price,
        is_bid: event.data_decoded.is_bid,
        original_quantity: originalQuantity,
        base_asset_quantity_canceled: baseAssetQuantityCanceled,

        // Enriched from cache
        base_asset_id: cachedPool?.base_asset_id,
        base_symbol: cachedPool?.base_symbol,
        base_decimals: baseDecimals,
        quote_asset_id: cachedPool?.quote_asset_id,
        quote_symbol: cachedPool?.quote_symbol,
        quote_decimals: cachedPool?.quote_decimals,
        taker_fee: cachedPool?.taker_fee,
        maker_fee: cachedPool?.maker_fee,

        // Gas info + metadata
        sender: event.sender,
        storage_cost: ctx.transaction.effects?.gasUsed.storageCost,
        gas_computation: ctx.transaction.effects?.gasUsed.computationCost,
        nonrefundable_storage_fee: ctx.transaction.effects?.gasUsed.nonRefundableStorageFee,
        storage_rebate: ctx.transaction.effects?.gasUsed.storageRebate,

        // New calculated fields
        original_quantity_normalized: Number(originalQuantity) / Math.pow(10, baseDecimals),
        base_asset_quantity_canceled_normalized: Number(baseAssetQuantityCanceled) / Math.pow(10, baseDecimals)
      })
    }, fetchConfig)

  // 2) Order: Cancellations, modifications
  order.bind()
    .onEventOrderCanceled((event, ctx) => {
      const poolId = event.data_decoded.pool_id
      const cachedPool = poolCache.get(poolId)

      const originalQuantity = event.data_decoded.original_quantity
      const baseAssetQuantityCanceled = event.data_decoded.base_asset_quantity_canceled
      const baseDecimals = cachedPool?.base_decimals || 1

      ctx.eventLogger.emit("deepbook_order_canceled", {
        balance_manager_id: event.data_decoded.balance_manager_id,
        pool_id: poolId,
        order_id: event.data_decoded.order_id,
        client_order_id: event.data_decoded.client_order_id,
        trader: event.data_decoded.trader,
        price: event.data_decoded.price,
        is_bid: event.data_decoded.is_bid,
        original_quantity: originalQuantity,
        base_asset_quantity_canceled: baseAssetQuantityCanceled,

        // Enriched from cache
        base_asset_id: cachedPool?.base_asset_id,
        base_symbol: cachedPool?.base_symbol,
        base_decimals: baseDecimals,
        quote_asset_id: cachedPool?.quote_asset_id,
        quote_symbol: cachedPool?.quote_symbol,
        quote_decimals: cachedPool?.quote_decimals,
        taker_fee: cachedPool?.taker_fee,
        maker_fee: cachedPool?.maker_fee,

        // Gas info + metadata
        sender: event.sender,
        storage_cost: ctx.transaction.effects?.gasUsed.storageCost,
        gas_computation: ctx.transaction.effects?.gasUsed.computationCost,
        nonrefundable_storage_fee: ctx.transaction.effects?.gasUsed.nonRefundableStorageFee,
        storage_rebate: ctx.transaction.effects?.gasUsed.storageRebate,

        // New calculated fields
        original_quantity_normalized: Number(originalQuantity) / Math.pow(10, baseDecimals),
        base_asset_quantity_canceled_normalized: Number(baseAssetQuantityCanceled) / Math.pow(10, baseDecimals)
      })
    }, fetchConfig)
    .onEventOrderModified((event, ctx) => {
      const poolId = event.data_decoded.pool_id
      const cachedPool = poolCache.get(poolId)

      const previousQuantity = event.data_decoded.previous_quantity
      const filledQuantity = event.data_decoded.filled_quantity
      const newQuantity = event.data_decoded.new_quantity
      const baseDecimals = cachedPool?.base_decimals || 1

      ctx.eventLogger.emit("deepbook_order_modified", {
        balance_manager_id: event.data_decoded.balance_manager_id,
        pool_id: poolId,
        order_id: event.data_decoded.order_id,
        client_order_id: event.data_decoded.client_order_id,
        trader: event.data_decoded.trader,
        price: event.data_decoded.price,
        is_bid: event.data_decoded.is_bid,
        previous_quantity: previousQuantity,
        filled_quantity: filledQuantity,
        new_quantity: newQuantity,

        // Enriched from cache
        base_asset_id: cachedPool?.base_asset_id,
        base_symbol: cachedPool?.base_symbol,
        base_decimals: baseDecimals,
        quote_asset_id: cachedPool?.quote_asset_id,
        quote_symbol: cachedPool?.quote_symbol,
        quote_decimals: cachedPool?.quote_decimals,
        taker_fee: cachedPool?.taker_fee,
        maker_fee: cachedPool?.maker_fee,

        // Gas info + metadata
        sender: event.sender,
        storage_cost: ctx.transaction.effects?.gasUsed.storageCost,
        gas_computation: ctx.transaction.effects?.gasUsed.computationCost,
        nonrefundable_storage_fee: ctx.transaction.effects?.gasUsed.nonRefundableStorageFee,
        storage_rebate: ctx.transaction.effects?.gasUsed.storageRebate,

        // New calculated fields
        previous_quantity_normalized: Number(previousQuantity) / Math.pow(10, baseDecimals),
        filled_quantity_normalized: Number(filledQuantity) / Math.pow(10, baseDecimals),
        new_quantity_normalized: Number(newQuantity) / Math.pow(10, baseDecimals)
      })
    }, fetchConfig)

  // 3) Vault: Flash loan borrowed
  vault.bind()
    .onEventFlashLoanBorrowed((event, ctx) => {
      const poolId = event.data_decoded.pool_id
      const cachedPool = poolCache.get(poolId)

      const borrowQuantity = event.data_decoded.borrow_quantity
      const baseDecimals = cachedPool?.base_decimals || 1

      ctx.eventLogger.emit("deepbook_flash_loan_borrowed", {
        pool_id: poolId,
        borrow_quantity: borrowQuantity,
        type_name: event.data_decoded.type_name,

        // Enriched from cache
        base_asset_id: cachedPool?.base_asset_id,
        base_symbol: cachedPool?.base_symbol,
        base_decimals: baseDecimals,
        quote_asset_id: cachedPool?.quote_asset_id,
        quote_symbol: cachedPool?.quote_symbol,
        quote_decimals: cachedPool?.quote_decimals,
        taker_fee: cachedPool?.taker_fee,
        maker_fee: cachedPool?.maker_fee,

        // Gas info + metadata
        sender: event.sender,
        storage_cost: ctx.transaction.effects?.gasUsed.storageCost,
        gas_computation: ctx.transaction.effects?.gasUsed.computationCost,
        nonrefundable_storage_fee: ctx.transaction.effects?.gasUsed.nonRefundableStorageFee,
        storage_rebate: ctx.transaction.effects?.gasUsed.storageRebate,

        // New calculated field
        borrow_quantity_normalized: Number(borrowQuantity) / Math.pow(10, baseDecimals)
      })
    }, fetchConfig)

  // 4) Fill: Additional fill events referencing the same pool or balance_manager
  fill.bind()
    .onEventFill((event, ctx) => {
      const baseQuantity = event.data_decoded.base_quantity
      const quoteQuantity = event.data_decoded.quote_quantity
      const baseDecimals = 1 // Assuming no pool cache for fill events
      const quoteDecimals = 1

      ctx.eventLogger.emit("deepbook_fill", {
        maker_order_id: event.data_decoded.maker_order_id,
        maker_client_order_id: event.data_decoded.maker_client_order_id,
        execution_price: event.data_decoded.execution_price,
        balance_manager_id: event.data_decoded.balance_manager_id,
        expired: event.data_decoded.expired,
        completed: event.data_decoded.completed,
        original_maker_quantity: event.data_decoded.original_maker_quantity,
        base_quantity: baseQuantity,
        quote_quantity: quoteQuantity,
        taker_is_bid: event.data_decoded.taker_is_bid,
        maker_epoch: event.data_decoded.maker_epoch,
        maker_deep_price: event.data_decoded.maker_deep_price,
        taker_fee: event.data_decoded.taker_fee,
        taker_fee_is_deep: event.data_decoded.taker_fee_is_deep,
        maker_fee: event.data_decoded.maker_fee,
        maker_fee_is_deep: event.data_decoded.maker_fee_is_deep,

        // Gas info + metadata
        sender: event.sender,
        storage_cost: ctx.transaction.effects?.gasUsed.storageCost,
        gas_computation: ctx.transaction.effects?.gasUsed.computationCost,
        nonrefundable_storage_fee: ctx.transaction.effects?.gasUsed.nonRefundableStorageFee,
        storage_rebate: ctx.transaction.effects?.gasUsed.storageRebate,

        // New calculated fields
        base_quantity_normalized: Number(baseQuantity) / Math.pow(10, baseDecimals),
        quote_quantity_normalized: Number(quoteQuantity) / Math.pow(10, quoteDecimals)
      })
    }, fetchConfig)
} 