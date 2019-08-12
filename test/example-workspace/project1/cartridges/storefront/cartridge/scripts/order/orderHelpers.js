'use strict';

var OrderMgr = require('dw/order/OrderMgr');
var Order = require('dw/order/Order');
var Locale = require('dw/util/Locale');

var OrderModel = require('*/cartridge/models/order');

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
    var customerOrders = OrderMgr.searchOrders(
        'customerNo={0} AND status!={1}',
        'creationDate desc',
        customerNo,
        Order.ORDER_STATUS_REPLACED
    );

    var orders = [];
    var currentLocale = Locale.getLocale(locale);

    while (customerOrders.hasNext()) {
        customerOrder = customerOrders.next();

        var orderModel = new OrderModel(
            customerOrder
        );

        orders.push(orderModel);

    }

    return {
        orders: orders
    };
}

module.exports = {
    getOrders: getOrders
};
