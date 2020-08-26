'use strict';

var base = module.superModule; // TEST module.superModule

/**
 * Order class that represents the current order.
 *
 * @param {dw.order.Order} order - Current user order // TEST dw.order.Order
 * @constructor
 */
function OrderModel(order) {
    base.call(this, order); // TEST base.call

    this.customerEmail = order && order.customerEmail; // TEST order.customerEmail
}

module.exports = OrderModel;
