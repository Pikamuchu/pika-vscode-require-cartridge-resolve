'use strict';

var OrderMgr = require('dw/order/OrderMgr'); // TEST: dw/order/OrderMgr
var Order = require('dw/order/Order'); // TEST: dw/order/Order
var Locale = require('dw/util/Locale'); // TEST: dw/util/Locale

var OrderModel = require('*/cartridge/models/order'); // TEST: */cartridge/models/order

function getOrder(orderNumber) {
    var order = OrderMgr.getOrder(orderNumber); // TEST: OrderMgr.getOrder
    var orderModel = new OrderModel(order);
    return orderModel;
}

/**
 * Returns a list of orders for the current customer.
 *
 * @param {Object} currentCustomer - object with customer properties
 * @param {Object} querystring - querystring properties
 * @param {string} locale - the current request's locale id
 * @returns {Object} - orderModel of the current dw order object
 */
function getOrders(currentCustomer, querystring, locale) {
    var customerNo = currentCustomer.profile.customerNo;
    var customerOrders = OrderMgr.searchOrders( // TEST: OrderMgr.getOrder
        'customerNo={0} AND status!={1}',
        'creationDate desc',
        customerNo,
        Order.ORDER_STATUS_REPLACED // TEST: Order.ORDER_STATUS_REPLACED
    );

    var orders = [];
    var currentLocale = Locale.getLocale(locale); // TEST: Locale.getLocale

    while (customerOrders.hasNext()) {
        var customerOrder = customerOrders.next();
        var orderModel = new OrderModel(
            customerOrder,
            currentLocale
        );
        orders.push(orderModel);
    }

    return orders;
}

function checkSomething(orderNumber) {
    return true;
}

module.exports = {
    getOrder: getOrder,
    getOrders: getOrders,
    checkSomething: checkSomething,
};
