'use strict';

/**
 * Order class that represents the current order
 * 
 * @param {dw.order.LineItemCtnr} lineItemContainer - Current users's basket/order
 * @constructor
 */
function OrderModel(lineItemContainer) {
    if (lineItemContainer) {
        this.orderNumber = Object.hasOwnProperty.call(lineItemContainer, 'orderNo')
        this.customerNo = lineItemContainer.customerNo;;
        this.orderStatus = Object.hasOwnProperty.call(lineItemContainer, 'status')
        this.productQuantityTotal = lineItemContainer.productQuantityTotal
    }
}

module.exports = OrderModel;
