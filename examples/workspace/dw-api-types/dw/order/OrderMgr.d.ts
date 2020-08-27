import Order = require('./Order');

/**
 * Provides static helper methods for managing orders.
 */
declare class OrderMgr {
    private constructor();

    /**
     * This method is identical to `createOrder(Basket)` but allows the optional specification of an `orderNo`.
     * @param basket
     * @param orderNo optional order number, an order number will be generated if null specified
     */
    static createOrder(basket : Basket, orderNo : string | null) : Order

    /**
     * Creates an order number.
     */
    static createOrderNo() : string

    /**
     * Returns the order with the specified order number.
     * @param orderNumber
     */
    static getOrder(orderNumber : string) : Order

    /**
     * Searches for a single order instance.
     * @param querystring
     * @param args
     */
    static searchOrder(querystring : string, ...args : Object[]) : Order | null

    /**
     * Searches for order instances.
     * @param querystring
     * @param sortstring
     * @param args
     * @param */
    static searchOrders(querystring : string, sortstring : string, ...args : Object[]) : SeekableIterator<Order>

    /**
     * Searches for order instances.
     * @param queryAttributes
     * @param sortstring
     */
    static searchOrders(queryAttributes : Map<string, string>, sortstring : string) : SeekableIterator<Order>

}

export = OrderMgr;
