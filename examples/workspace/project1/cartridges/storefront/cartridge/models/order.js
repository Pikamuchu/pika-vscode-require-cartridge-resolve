'use strict';

/**
 * Order class that represents the current order
 *
 * @param {dw.order.Order} order - Current user order
 * @param {dw.util.Locale} locale - Current user locale
 * @constructor
 */
function OrderModel(order, locale) {
    if (order) {
        this.orderNumber = order.currentOrderNo; // TEST order.currentOrderNo
        this.customerNo = order.customerNo; // TEST order.customerNo
        this.orderStatus = order.status; // TEST order.status
        this.language = locale.displayLanguage; // TEST order.displayLanguage
    }
}

module.exports = OrderModel;
