'use strict';

var base = module.superModule;

var baseGetOrders = base.getOrders;
base.getOrders = getOrders;
base.addSomethingToOrderModel = addSomethingToOrderModel;

function getOrders(currentCustomer, querystring, locale) {
    var Order = require('dw/order/Order');

    var customerOrders = baseGetOrders(currentCustomer, querystring, locale);
    customerOrders.orders = customerOrders.orders.filter(function (order) {
        return order.orderStatus && order.orderStatus.value !== Order.ORDER_STATUS_FAILED;
    });

    return customerOrders;
}

/**
 * Adds shipment store info to Order model.
 *
 * @param {Object} order
 */
function addSomethingToOrderModel(order) {
    order.something = 'something';
}

module.exports = base;
