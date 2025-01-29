import { _0x2 } from "@sentio/sdk/sui/builtin";
import { order_info, pool, order, vault, fill, deep_price } from "../types/sui/deepbook.js";

import {MoveFetchConfig } from '@sentio/protos'
import * as _0x1 from "@sentio/sdk/sui/builtin/0x1";

const fetchConfig: MoveFetchConfig = {
  resourceChanges: true,
  allEvents: true,
  inputs: true
}


export function initSwapProcessor() { 
    // deepbook
    order_info.bind()
    .onEventOrderFilled((event, ctx) => {
        ctx.eventLogger.emit("deepbook_order_filled", {
            pool_id: event.data_decoded.pool_id,
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
            base_quantity: event.data_decoded.base_quantity,
            quote_quantity: event.data_decoded.quote_quantity,
            maker_balance_manager_id: event.data_decoded.maker_balance_manager_id,
            taker_balance_manager_id: event.data_decoded.taker_balance_manager_id,
            sender: event.sender,
            storage_cost: ctx.transaction.effects?.gasUsed.storageCost,
            gas_computation: ctx.transaction.effects?.gasUsed.computationCost,
            nonrefundable_storage_fee: ctx.transaction.effects?.gasUsed.nonRefundableStorageFee,
            storage_rebate: ctx.transaction.effects?.gasUsed.storageRebate
        })
    }, fetchConfig)
    .onEventOrderPlaced((event, ctx) => {
        ctx.eventLogger.emit("deepbook_order_placed", {
            balance_manager_id: event.data_decoded.balance_manager_id,
            pool_id: event.data_decoded.pool_id,
            order_id: event.data_decoded.order_id,
            client_order_id: event.data_decoded.client_order_id,
            trader: event.data_decoded.trader,
            price: event.data_decoded.price,
            is_bid: event.data_decoded.is_bid,
            placed_quantity: event.data_decoded.placed_quantity,
            expire_timestamp: event.data_decoded.expire_timestamp,
            sender: event.sender,
            storage_cost: ctx.transaction.effects?.gasUsed.storageCost,
            gas_computation: ctx.transaction.effects?.gasUsed.computationCost,
            nonrefundable_storage_fee: ctx.transaction.effects?.gasUsed.nonRefundableStorageFee,
            storage_rebate: ctx.transaction.effects?.gasUsed.storageRebate
        })
    }, fetchConfig)
    .onEventOrderExpired((event, ctx) => {
        ctx.eventLogger.emit("deepbook_order_expired", {
            balance_manager_id: event.data_decoded.balance_manager_id,
            pool_id: event.data_decoded.pool_id,
            order_id: event.data_decoded.order_id,
            client_order_id: event.data_decoded.client_order_id,
            trader: event.data_decoded.trader,
            price: event.data_decoded.price,
            is_bid: event.data_decoded.is_bid,
            original_quantity: event.data_decoded.original_quantity,
            base_asset_quantity_canceled: event.data_decoded.base_asset_quantity_canceled,
            sender: event.sender,
            storage_cost: ctx.transaction.effects?.gasUsed.storageCost,
            gas_computation: ctx.transaction.effects?.gasUsed.computationCost,
            nonrefundable_storage_fee: ctx.transaction.effects?.gasUsed.nonRefundableStorageFee,
            storage_rebate: ctx.transaction.effects?.gasUsed.storageRebate
        })
    }, fetchConfig)
    .onEventOrderPlaced((event, ctx) => {
        ctx.eventLogger.emit("deepbook_order_placed", {
            balance_manager_id: event.data_decoded.balance_manager_id,
            pool_id: event.data_decoded.pool_id,
            order_id: event.data_decoded.order_id,
            client_order_id: event.data_decoded.client_order_id,
            trader: event.data_decoded.trader,
            price: event.data_decoded.price,
            is_bid: event.data_decoded.is_bid,
            placed_quantity: event.data_decoded.placed_quantity,
            expire_timestamp: event.data_decoded.expire_timestamp,
            sender: event.sender,
            storage_cost: ctx.transaction.effects?.gasUsed.storageCost,
            gas_computation: ctx.transaction.effects?.gasUsed.computationCost,
            nonrefundable_storage_fee: ctx.transaction.effects?.gasUsed.nonRefundableStorageFee,
            storage_rebate: ctx.transaction.effects?.gasUsed.storageRebate
        })
    }, fetchConfig)

    pool.bind()
    .onEventPoolCreated((event, ctx) => {
        ctx.eventLogger.emit("deepbook_pool_created", {
            pool_id: event.data_decoded.pool_id,
            base_asset_id: event.type_arguments[0],
            quote_asset_id: event.type_arguments[1],
            taker_fee: event.data_decoded.taker_fee,
            maker_fee: event.data_decoded.maker_fee,
            tick_size: event.data_decoded.tick_size,
            lot_size: event.data_decoded.lot_size,
            min_size: event.data_decoded.min_size,
            whitelisted_pool: event.data_decoded.whitelisted_pool,
            treasury_address: event.data_decoded.treasury_address,
            sender: event.sender,
            storage_cost: ctx.transaction.effects?.gasUsed.storageCost,
            gas_computation: ctx.transaction.effects?.gasUsed.computationCost,
            nonrefundable_storage_fee: ctx.transaction.effects?.gasUsed.nonRefundableStorageFee,
            storage_rebate: ctx.transaction.effects?.gasUsed.storageRebate
        })
    }, fetchConfig)

    order.bind()
    .onEventOrderCanceled((event, ctx) => {
        ctx.eventLogger.emit("deepbook_order_canceled", {
            balance_manager_id: event.data_decoded.balance_manager_id,
            pool_id: event.data_decoded.pool_id,
            order_id: event.data_decoded.order_id,
            client_order_id: event.data_decoded.client_order_id,
            trader: event.data_decoded.trader,
            price: event.data_decoded.price,
            is_bid: event.data_decoded.is_bid,
            original_quantity: event.data_decoded.original_quantity,
            base_asset_quantity_canceled: event.data_decoded.base_asset_quantity_canceled,
            sender: event.sender,
            storage_cost: ctx.transaction.effects?.gasUsed.storageCost,
            gas_computation: ctx.transaction.effects?.gasUsed.computationCost,
            nonrefundable_storage_fee: ctx.transaction.effects?.gasUsed.nonRefundableStorageFee,
            storage_rebate: ctx.transaction.effects?.gasUsed.storageRebate
        })
    }, fetchConfig)
    .onEventOrderModified((event, ctx) => {
        ctx.eventLogger.emit("deepbook_order_modified", {
            balance_manager_id: event.data_decoded.balance_manager_id,
            pool_id: event.data_decoded.pool_id,
            order_id: event.data_decoded.order_id,
            client_order_id: event.data_decoded.client_order_id,
            trader: event.data_decoded.trader,
            price: event.data_decoded.price,
            is_bid: event.data_decoded.is_bid,
            previous_quantity: event.data_decoded.previous_quantity,
            filled_quantity: event.data_decoded.filled_quantity,
            new_quantity: event.data_decoded.new_quantity,
            sender: event.sender,
            storage_cost: ctx.transaction.effects?.gasUsed.storageCost,
            gas_computation: ctx.transaction.effects?.gasUsed.computationCost,
            nonrefundable_storage_fee: ctx.transaction.effects?.gasUsed.nonRefundableStorageFee,
            storage_rebate: ctx.transaction.effects?.gasUsed.storageRebate
        })
    }, fetchConfig)

    vault.bind()
    .onEventFlashLoanBorrowed((event, ctx) => {
        ctx.eventLogger.emit("deepbook_flash_loan_borrowed", {
            pool_id: event.data_decoded.pool_id,
            borrow_quantity: event.data_decoded.borrow_quantity,
            type_name: event.data_decoded.type_name,
            sender: event.sender,
            storage_cost: ctx.transaction.effects?.gasUsed.storageCost,
            gas_computation: ctx.transaction.effects?.gasUsed.computationCost,
            nonrefundable_storage_fee: ctx.transaction.effects?.gasUsed.nonRefundableStorageFee,
            storage_rebate: ctx.transaction.effects?.gasUsed.storageRebate
        })
    }, fetchConfig)

    fill.bind()
    .onEventFill((event, ctx) => {
        ctx.eventLogger.emit("deepbook_fill", {
            maker_order_id: event.data_decoded.maker_order_id,
            maker_client_order_id: event.data_decoded.maker_client_order_id,
            execution_price: event.data_decoded.execution_price,
            balance_manager_id: event.data_decoded.balance_manager_id,
            expired: event.data_decoded.expired,
            completed: event.data_decoded.completed,
            original_maker_quantity: event.data_decoded.original_maker_quantity,
            base_quantity: event.data_decoded.base_quantity,
            quote_quantity: event.data_decoded.quote_quantity,
            taker_is_bid: event.data_decoded.taker_is_bid,
            maker_epoch: event.data_decoded.maker_epoch,
            maker_deep_price: event.data_decoded.maker_deep_price,
            taker_fee: event.data_decoded.taker_fee,
            taker_fee_is_deep: event.data_decoded.taker_fee_is_deep,
            maker_fee: event.data_decoded.maker_fee,
            maker_fee_is_deep: event.data_decoded.maker_fee_is_deep,
            sender: event.sender,
            storage_cost: ctx.transaction.effects?.gasUsed.storageCost,
            gas_computation: ctx.transaction.effects?.gasUsed.computationCost,
            nonrefundable_storage_fee: ctx.transaction.effects?.gasUsed.nonRefundableStorageFee,
            storage_rebate: ctx.transaction.effects?.gasUsed.storageRebate
        })
    }, fetchConfig)

}

initSwapProcessor();
