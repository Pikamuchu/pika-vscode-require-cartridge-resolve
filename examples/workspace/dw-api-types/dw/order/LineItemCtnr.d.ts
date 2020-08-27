import ExtensibleObject = require('../object/ExtensibleObject');
import CustomAttributes = require('../object/CustomAttributes');

declare class LineItemCtnr<T extends CustomAttributes> extends ExtensibleObject<T> {

    /**
     * The currency code for this line item container. The currency code is a 3-character currency mnemonic such as 'USD' or 'EUR'. The currency code represents the currency in which the calculation is made, and in which the buyer sees all prices in the store front.
     */
    readonly currencyCode  :  string

    /**
     * The customer associated with this container.
     */
    readonly customer  :  Customer

    /**
     * The email of the customer associated with this container.
     */
    readonly customerEmail  :  string

    /**
     * The name of the customer associated with this container.
     */
    readonly customerName  :  string

    /**
     * The customer number of the customer associated with this container.
     */
    readonly customerNo  :  string

    /**
     * An unsorted collection of the payment instruments in this container.
     */
    readonly paymentInstruments  :  Collection<OrderPaymentInstrument>

    /**
     * The collection of price adjustments that have been applied to the totals such as promotion on the purchase value (i.e. $10 Off or 10% Off). The price adjustments are sorted by the order in which they were applied to the order by the promotions engine.
     */
    readonly priceAdjustments  :  Collection<PriceAdjustment>

    /**
     * The product line items of the container that are not dependent on other product line items. This includes line items representing bonus products in the container but excludes option, bundled, and bonus line items. The returned collection is sorted by the position attribute of the product line items.
     */
    readonly productLineItems  :  Collection<ProductLineItem>

    /**
     * Creates an order level price adjustment for a specific discount.
    The promotion id is mandatory and must not be the ID of any actual promotion defined in Commerce Cloud Digital; otherwise an exception is thrown.
    * @param promotionID
    * @param discount
    */
    createPriceAdjustment(promotionID : string, discount : Discount) : PriceAdjustment

    /**
     * Creates a new product line item in the container and assigns it to the specified shipment.
     * @param productID
     * @param shipment
     */
    createProductLineItem(productID : string, shipment : Shipment) : ProductLineItem

    /**
     * Creates a new product line item in the basket and assigns it to the specified shipment.
     * @param productListItem
     * @param shipment
     */
    createProductLineItem(productListItem : ProductListItem, shipment : Shipment) : ProductLineItem

    /**
     * Returns the currency code for this line item container.
     */
    getCurrencyCode() : string

    /**
     * Returns the customer associated with this container.
     */
    getCustomer() : Customer

    /**
     * Returns the email of the customer associated with this container.
     */
    getCustomerEmail() : string

    /**
     * Returns the name of the customer associated with this container.
     */
    getCustomerName() : string

    /**
     * Returns the customer number of the customer associated with this container.
     */
    getCustomerNo() : string

    /**
     * Returns an unsorted collection of the payment instruments in this container.
     */
    getPaymentInstruments() : Collection<OrderPaymentInstrument>

    /**
     * Returns an unsorted collection of PaymentInstrument instances based on the specified payment method ID.
     * @param paymentMethodID
     */
    getPaymentInstruments(paymentMethodID : string) : Collection<OrderPaymentInstrument>

    /**
     * Returns the price adjustment associated to the specified promotion ID.
     * @param promotionID
     */
    getPriceAdjustmentByPromotionID(promotionID : string) : PriceAdjustment

    /**
     * Returns the collection of price adjustments that have been applied to the totals such as promotion on the purchase value (i.e.
     */
    getPriceAdjustments() : Collection<PriceAdjustment>

    /**
     * Returns the product line items of the container that are not dependent on other product line items.
     */
    getProductLineItems() : Collection<ProductLineItem>

    /**
     * Returns the product line items of the container that have a product ID equal to the specified product ID and that are not dependent on other product line items.
     * @param productID
     */
    getProductLineItems(productID : string) : Collection<ProductLineItem>

    /**
     * Removes the specified Payment Instrument from this container and deletes the Payment Instrument.
     * @param pi
     */
    removePaymentInstrument(pi : PaymentInstrument) : void

    /**
     * Removes the specified price adjustment line item from the line item container.
     * @param priceAdjustment
     */
    removePriceAdjustment(priceAdjustment : PriceAdjustment) : void

    /**
     * Removes the specified product line item from the line item container.
     * @param productLineItem
     */
    removeProductLineItem(productLineItem : ProductLineItem) : void

    /**
     * Sets the email address of the customer associated with this container.
     * @param aValue
     */
    setCustomerEmail(aValue : string) : void

    /**
     * Sets the name of the customer associated with this container.
     * @param aValue
     */
    setCustomerName(aValue : string) : void

    /**
     * Sets the customer number of the customer associated with this container.
     * @param customerNo
     */
    setCustomerNo(customerNo : string) : void

    /**
     * Recalculates the totals of the line item container.
     */
    updateTotals() : void
}

export = LineItemCtnr;
