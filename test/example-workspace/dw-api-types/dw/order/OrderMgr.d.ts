import Order = require('./Order');
import Basket = require('./Basket');
import Status = require('../system/Status');
import ObjectTypeDefinition = require('../object/ObjectTypeDefinition');
import SeekableIterator = require('../util/SeekableIterator');
import Map = require('../util/Map');

/**
 * Provides static helper methods for managing orders.
 */
declare class OrderMgr {
    private constructor();

    /**
     * This method cancels an order.
     * @param order
     */
    static cancelOrder(order : Order) : Status

    /**
        This method creates an order based on a basket. If successful, the new order will be in status `Order.ORDER_STATUS_CREATED`. The basket will be removed from the session and marked for removal.
        This method throws an APIException with type **CreateOrderException** if any of the following conditions are encountered:

        - any of the totals (net, gross, tax) of the basket is N/A
        - any of the product items is not available (this takes previously reserved items into account)
        - any campaign-based coupon in the basket is invalid (see CouponLineItem.isValid()
        - the basket represents an order being edited, but the order has been already been replaced by another order
        - the basket represents an order being edited, but the customer associated with the original order is not the same as the current customer

        The method removes all empty shipments from the basket before creating the order. A shipment is said to be empty if
        - it contains no product or gift certificate line items and
        - all total prices (net, gross, tax) are 0.0

        The method decrements inventory for all products contained in the order. A previous call to `Basket.reserveInventory()` is unnecessary and discouraged within the same request. The method takes any items with reserved inventory into account, allowing an early reservation of items e.g. at the beginning of the checkout process. As described above an APIException is thrown if any item is not available.

        If the basket contains product or gift certificate line items associated with product list items, the method updates the purchased quantity of the product list items, see `ProductListItem.getPurchasedQuantity()`.

        Usage:
        ```
        var basket : Basket; // known
        try {
        var order : Order = OrderMgr.createOrder(basket);
        } catch (e if e instanceof APIException && e.type === 'CreateOrderException') {
        // handle e
        }
```
     * @param basket
     */
    static createOrder(basket : Basket) : Order

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
     * Creates an order number which is either taken from the organization or the site order series.
     */
    static createOrderSequenceNo() : string

    /**
     * Triggers the shipping order creation for an order.
     * @param order
     */
    static createShippingOrders(order : Order) : Status

    /**
     * Returns the meta data for Orders.
     */
    static describeOrder() : ObjectTypeDefinition

    /**
     * This method fails an unplaced order and is usually called if payment could not be authorized.
     * @param order
     */
    static failOrder(order : Order) : Status

    /**
     * Returns the order with the specified order number.
     * @param orderNumber
     */
    static getOrder(orderNumber : string) : Order

    /**
     * This method places an order and is usually called after payment has been authorized.
     * @param order
     */
    static placeOrder(order : Order) : Status

    /**
     * Executes a user-definable function on a set of orders.
     * @param processFunction
     * @param querystring
     * @param args
     */
    static processOrders(processFunction : Function, querystring : string, ...args : Object[]) : void

    /**
     * Searches for a single order instance.
     * @param querystring
     * @param args
     **/
    static queryOrder(querystring : string, ...args : Object[]) : Order

    /**
     * Searches for order instances.
     * @param querystring
     * @param sortstring
     * @param args
     */
    static queryOrders(querystring : string, sortstring : string, ...args : Object[]) : SeekableIterator<Order>

    /**
     * Searches for order instances.
     * @param queryAttributes
     * @param sortstring
     */
    static queryOrders(queryAttributes : Map<string, string>, sortstring : string) : SeekableIterator<Order>

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

    /**
     * This method is used to turn a CANCELLED order into an OPEN order.
     * @param order
     */
    static undoCancelOrder(order : Order) : Status

    /**
     * This method is used to turn a FAILED order into a CREATED order.
     * @param order
     */
    static undoFailOrder(order : Order) : Status

}

export = OrderMgr;
