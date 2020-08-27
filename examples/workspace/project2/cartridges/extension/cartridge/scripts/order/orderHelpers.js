'use strict';

const base = module.superModule; // TEST: module.superModule

const baseGetOrders = base.getOrders; // TEST: base.getOrders
base.getOrders = getOrders;
base.doSomethingWithOrderModel = doSomethingWithOrderModel;

function getOrders(currentCustomer, querystring, locale) {
    const Order = require("dw/order/Order"); // TEST: dw/order/Order

    const customerOrders = baseGetOrders(currentCustomer, querystring, locale);
    customerOrders.orders = customerOrders.orders.filter(function (order) {
        return order.orderStatus && order.orderStatus.value !== Order.ORDER_STATUS_FAILED; // TEST: Order.ORDER_STATUS_FAILED
    });

    return customerOrders;
}

/**
 * Do something with order model
 *
 * @param {Object} order
 */
function doSomethingWithOrderModel(order) {
  const ExampleUtils = require('*/cartridge/scripts/lib/example/utils'); // TEST: */cartridge/scripts/lib/example/utils
  ExampleUtils.doSomething(order); // TEST: ExampleUtils.doSomething
  // FIXME: node_modules cartridge not resolved
}

module.exports = base;
