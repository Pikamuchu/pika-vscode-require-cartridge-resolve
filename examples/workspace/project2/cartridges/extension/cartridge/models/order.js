'use strict';

var base = module.superModule;

/**
 * Order class that represents the current order.
 *
 * @param {dw.order.LineItemCtnr} lineItemContainer - Current users's basket/order
 * @constructor
 */
function OrderModel(lineItemContainer) {
    base.call(this, lineItemContainer);

    this.invoice = lineItemContainer && lineItemContainer.custom.something;
}

module.exports = OrderModel;
