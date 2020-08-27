import LineItemCtnr = require('../order/LineItemCtnr');

declare global {
    module ICustomAttributes {
        interface Order extends CustomAttributes{
        }
    }
}

/**
 * The Order class represents an order.
 */
declare class Order extends LineItemCtnr<ICustomAttributes.Order> {
    static readonly ORDER_STATUS_CANCELLED  :  number
    static readonly ORDER_STATUS_COMPLETED  :  number
    static readonly ORDER_STATUS_CREATED  :  number
    static readonly ORDER_STATUS_FAILED  :  number
    static readonly ORDER_STATUS_NEW  :  number
    static readonly ORDER_STATUS_OPEN  :  number
    static readonly ORDER_STATUS_REPLACED  :  number

    /**
     * The name of the user who has created the order. If an agent user has created the order, the agent user's name is returned. Otherwise "Customer" is returned.
     */
    readonly createdBy  :  string

    /**
     * The current order. The current order represents the most recent order in a chain of orders. For example, if Order1 was replaced by Order2, Order2 is the current representation of the order and Order1 is the original representation of the order. If you replace Order2 with Order3, Order 3 is now the current order and Order1 is still the original representation of the order. If this order has not been replaced, this method returns this order because this order is the current order.
     */
    readonly currentOrder  :  Order

    /**
     * The order number of the current order. The current order represents the most recent order in a chain of orders. For example, if Order1 was replaced by Order2, Order2 is the current representation of the order and Order1 is the original representation of the order. If you replace Order2 with Order3, Order 3 is now the current order and Order1 is still the original representation of the order. If this order has not been replaced, calling this method returns the same value as the getOrderNo() method because this order is the current order.
     */
    readonly currentOrderNo  :  string

    /**
     * The ID of the locale that was in effect when the order was placed. This is the customer's locale.
     */
    readonly customerLocaleID  :  string

    /**
     * The status of the order. Possible values are ORDER_STATUS_CREATED, ORDER_STATUS_NEW, ORDER_STATUS_OPEN, ORDER_STATUS_COMPLETED, ORDER_STATUS_CANCELLED, ORDER_STATUS_FAILED or ORDER_STATUS_REPLACED.
     */
    status  :  EnumValue<number>

    /**
     * Returns the name of the user who has created the order.
     */
    getCreatedBy() : string

    /**
     * Returns the current order.
     */
    getCurrentOrder() : Order

    /**
     * Returns the order number of the current order.
     */
    getCurrentOrderNo() : string

    /**
     * Returns the ID of the locale that was in effect when the order was placed.
     */
    getCustomerLocaleID() : string

    /**
     * Returns the status of the order. Possible values are ORDER_STATUS_CREATED, ORDER_STATUS_NEW, ORDER_STATUS_OPEN, ORDER_STATUS_COMPLETED, ORDER_STATUS_CANCELLED, ORDER_STATUS_FAILED or ORDER_STATUS_REPLACED.
     */
    getStatus() : EnumValue<number>

    /**
     * Sets the status of the order.
     * @param status
     */
    setStatus(status : number) : void

}

export = Order;
