import LineItemCtnr = require('../order/LineItemCtnr');
import EnumValue = require('../value/EnumValue');
import FilteringCollection = require('../util/FilteringCollection');
import AppeasementItem = require('./AppeasementItem');
import Money = require('../value/Money');
import Appeasement = require('./Appeasement');
import InvoiceItem = require('./InvoiceItem');
import Invoice = require('./Invoice');
import ReturnCaseItem = require('./ReturnCaseItem');
import SourceCodeGroup = require('../campaign/SourceCodeGroup');
import ReturnCase = require('./ReturnCase');
import ReturnItem = require('./ReturnItem');
import Return = require('./Return');
import ShippingOrder = require('./ShippingOrder');
import ShippingOrderItem = require('./ShippingOrderItem');
import OrderItem = require('./OrderItem');
import Status = require('../system/Status');
import Customer = require('../customer/Customer');
import Note = require('../object/Note');
import Collection = require('../util/Collection');
import OrderPaymentInstrument = require('./OrderPaymentInstrument');
import CustomAttributes = require('../object/CustomAttributes');

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
    static readonly CONFIRMATION_STATUS_CONFIRMED  :  number
    static readonly CONFIRMATION_STATUS_NOTCONFIRMED  :  number
    static readonly EXPORT_STATUS_EXPORTED  :  number
    static readonly EXPORT_STATUS_FAILED  :  number
    static readonly EXPORT_STATUS_NOTEXPORTED  :  number
    static readonly EXPORT_STATUS_READY  :  number
    static readonly ORDER_STATUS_CANCELLED  :  number
    static readonly ORDER_STATUS_COMPLETED  :  number
    static readonly ORDER_STATUS_CREATED  :  number
    static readonly ORDER_STATUS_FAILED  :  number
    static readonly ORDER_STATUS_NEW  :  number
    static readonly ORDER_STATUS_OPEN  :  number
    static readonly ORDER_STATUS_REPLACED  :  number
    static readonly PAYMENT_STATUS_NOTPAID  :  number
    static readonly PAYMENT_STATUS_PAID  :  number
    static readonly PAYMENT_STATUS_PARTPAID  :  number
    static readonly SHIPPING_STATUS_NOTSHIPPED  :  number
    static readonly SHIPPING_STATUS_PARTSHIPPED  :  number
    static readonly SHIPPING_STATUS_SHIPPED  :  number

    /**
     * The affiliate partner ID value, or null.
     */
    affiliatePartnerID  :  string | null

    /**
     * The affiliate partner name value, or null.
     */
    affiliatePartnerName  :  string | null

    /**
     * The collection of AppeasementItems associated with this order.
     */
    readonly appeasementItems  :  FilteringCollection<AppeasementItem>

    /**
     * The collection of Appeasements associated with this order.
     */
    readonly appeasements  :  FilteringCollection<Appeasement>

    /**
     * If this order was cancelled, returns the value of the cancel code or null.
     */
    cancelCode  :  EnumValue<number> | null

    /**
     * If this order was cancelled, returns the text describing why the order was cancelled or null.
     */
    cancelDescription  :  string | null

    /**
     * The sum of the captured amounts. The captured amounts are calculated on the fly. Associate a payment capture for an PaymentInstrument with an Invoice using Invoice.addCaptureTransaction(OrderPaymentInstrument, Money).
     */
    readonly capturedAmount  :  Money

    /**
     * The confirmation status of the order.
    Possible values are CONFIRMATION_STATUS_NOTCONFIRMED and CONFIRMATION_STATUS_CONFIRMED.
    */
    confirmationStatus  :  EnumValue<number>

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
     * The customer-specific reference information for the order, or null.
     */
    customerOrderReference  :  string | null

    /**
     * A date after which an order can be exported.
     */
    exportAfter  :  Date

    /**
     * The export status of the order.
    Possible values are: EXPORT_STATUS_NOTEXPORTED, EXPORT_STATUS_EXPORTED, EXPORT_STATUS_READY, and EXPORT_STATUS_FAILED.
    */
    exportStatus  :  EnumValue<number>

    /**
     * The value of an external order number associated with this order, or null.
     */
    externalOrderNo  :  string | null

    /**
     * The status of an external order associated with this order, or null.
     */
    externalOrderStatus  :  string | null

    /**
     * The text describing the external order, or null.
     */
    externalOrderText  :  string | null

    /**
     * Returns true, if the order is imported and false otherwise.
     */
    readonly imported  :  boolean

    /**
     * The collection of InvoiceItems associated with this order.
     */
    readonly invoiceItems  :  FilteringCollection<InvoiceItem>

    /**
     * The invoice number for this Order.
     */
    invoiceNo  :  string

    /**
     * The collection of Invoices associated with this order.
     */
    readonly invoices  :  FilteringCollection<Invoice>

    /**
     * The order number for this order.
     */
    readonly orderNo  :  string

    /**
     * The URL safe token for this order.
     */
    readonly orderToken  :  string

    /**
     * The original order associated with this order. The original order represents an order that was the first ancestor in a chain of orders. For example, if Order1 was replaced by Order2, Order2 is the current representation of the order and Order1 is the original representation of the order. If you replace Order2 with Order3, Order1 is still the original representation of the order. If this order is the first ancestor, this method returns this order.
     */
    readonly originalOrder  :  Order

    /**
     * The order number of the original order associated with this order. The original order represents an order that was the first ancestor in a chain of orders. For example, if Order1 was replaced by Order2, Order2 is the current representation of the order and Order1 is the original representation of the order. If you replace Order2 with Order3, Order1 is still the original representation of the order. If this order is the first ancestor, this method returns the value of getOrderNo().
     */
    readonly originalOrderNo  :  string

    /**
     * The order payment status value.
    Possible values are PAYMENT_STATUS_NOTPAID, PAYMENT_STATUS_PARTPAID or PAYMENT_STATUS_PAID.
    */
    paymentStatus  :  EnumValue<number>

    /**
     * The sum of the refunded amounts. The refunded amounts are calculated on the fly. Associate a payment refund for an PaymentInstrument with an Invoice using Invoice.addRefundTransaction(OrderPaymentInstrument, Money).
     */
    readonly refundedAmount  :  Money

    /**
     * The IP address of the remote host from which the order was created.

    If the IP address was not captured for the order because order IP logging was disabled at the time the order was created, null will be returned.
    */
    readonly remoteHost  :  string | null

    /**
     * If this order was replaced by another order, returns the value of the replace code. Otherwise. returns null.
     */
    replaceCode  :  EnumValue<number> | null

    /**
     * If this order was replaced by another order, returns the value of the replace description. Otherwise returns null.
     */
    replaceDescription  :  string | null

    /**
     * The order that this order replaced or null. For example, if you have three orders where Order1 was replaced by Order2 and Order2 was replaced by Order3, calling this method on Order3 will return Order2. Similarly, calling this method on Order1 will return null as Order1 was the original order.
     */
    readonly replacedOrder  :  Order | null

    /**
     * The order number that this order replaced or null if this order did not replace an order. For example, if you have three orders where Order1 was replaced by Order2 and Order2 was replaced by Order3, calling this method on Order3 will return the order number for Order2. Similarly, calling this method on Order1 will return null as Order1 was the original order.
     */
    readonly replacedOrderNo  :  string | null

    /**
     * The order that replaced this order, or null.
     */
    readonly replacementOrder  :  Order | null

    /**
     * If this order was replaced by another order, returns the order number that replaced this order. Otherwise returns null.
     */
    readonly replacementOrderNo  :  string | null

    /**
     * The collection of ReturnCaseItems associated with this order.
     */
    readonly returnCaseItems  :  FilteringCollection<ReturnCaseItem>

    /**
     * The collection of ReturnCases associated with this order.
     */
    readonly returnCases  :  FilteringCollection<ReturnCase>

    /**
     * The collection of ReturnItems associated with this order.
     */
    readonly returnItems  :  FilteringCollection<ReturnItem>

    /**
     * The collection of Returns associated with this order.
     */
    readonly returns  :  FilteringCollection<Return>

    /**
     * The collection of ShippingOrderItems associated with this order.
     */
    readonly shippingOrderItems  :  FilteringCollection<ShippingOrderItem>

    /**
     * The collection of ShippingOrders associated with this order.
     */
    readonly shippingOrders  :  FilteringCollection<ShippingOrder>

    /**
     * The order shipping status.
    Possible values are SHIPPING_STATUS_NOTSHIPPED, SHIPPING_STATUS_PARTSHIPPED or SHIPPING_STATUS_SHIPPED.
    */
    shippingStatus  :  EnumValue<number>

    /**
     * The source code stored with the order or null if no source code is attached to the order.
     */
    readonly sourceCode  :  string | null

    /**
     * The source code group attached to the order or null if no source code group is attached to the order.
     */
    readonly sourceCodeGroup  :  SourceCodeGroup | null

    /**
     * The source code group id stored with the order or null if no source code group is attached to the order.
     */
    readonly sourceCodeGroupID  :  string

    /**
     * The status of the order.
    Possible values are ORDER_STATUS_CREATED, ORDER_STATUS_NEW, ORDER_STATUS_OPEN, ORDER_STATUS_COMPLETED, ORDER_STATUS_CANCELLED, ORDER_STATUS_FAILED or ORDER_STATUS_REPLACED.
    */
    status  :  EnumValue<number>


    /**
     * Returns an unsorted collection of the payment instruments in this container.
     */
    getPaymentInstruments() : Collection<OrderPaymentInstrument>

    /**
     * Returns an unsorted collection of PaymentInstrument instances based on the specified payment method ID.
     * @param paymentMethodID
     */
    getPaymentInstruments(paymentMethodID : string) : Collection<OrderPaymentInstrument>
    private constructor();

    /**
     * Creates a new Appeasement associated with this order.
     * @param appeasementnumber
     */
    createAppeasement(appeasementnumber : string) : Appeasement

    /**
     * Creates a new Appeasement associated with this order.
     */
    createAppeasement() : Appeasement

    /**
     * Creates a new ReturnCase associated with this order specifying whether the ReturnCase is an RMA (return merchandise authorization).
     * @param returnCasenumber
     * @param isRMA
     */
    createReturnCase(returnCasenumber : string, isRMA : boolean) : ReturnCase

    /**
     * Creates a new ReturnCase associated with this order specifying whether the ReturnCase is an RMA (return merchandise authorization).
     * @param isRMA
     */
    createReturnCase(isRMA : boolean) : ReturnCase

    /**
     * Returns the order item with the given status which wraps a new service item which is created and added to the order.
     * @param ID
     * @param status
     */
    createServiceItem(ID : string, status : string) : OrderItem

    /**
     * Creates a new ShippingOrder for this order.
     */
    createShippingOrder() : ShippingOrder

    /**
     * Creates a new ShippingOrder for this order.
     * @param shippingOrdernumber
     */
    createShippingOrder(shippingOrdernumber : string) : ShippingOrder

    /**
     * Returns the affiliate partner ID value, or null.
     */
    getAffiliatePartnerID() : string

    /**
     * Returns the affiliate partner name value, or null.
     */
    getAffiliatePartnerName() : string

    /**
     * Returns the Appeasement associated with this order with the given appeasementnumber.
     * @param appeasementnumber
     */
    getAppeasement(appeasementnumber : string) : Appeasement

    /**
     * Returns the AppeasementItem associated with this Order with the given appeasementItemID.
     * @param appeasementItemID
     */
    getAppeasementItem(appeasementItemID : string) : AppeasementItem

    /**
     * Returns the collection of AppeasementItems associated with this order.
     */
    getAppeasementItems() : FilteringCollection<AppeasementItem>

    /**
     * Returns the collection of Appeasements associated with this order.
     */
    getAppeasements() : FilteringCollection<Appeasement>

    /**
     * If this order was cancelled, returns the value of the cancel code or null.
     */
    getCancelCode() : EnumValue<number> | null

    /**
     * If this order was cancelled, returns the text describing why the order was cancelled or null.
     */
    getCancelDescription() : string | null

    /**
     * Returns the sum of the captured amounts.
     */
    getCapturedAmount() : Money

    /**
     * Returns the confirmation status of the order.
     * Possible values are CONFIRMATION_STATUS_NOTCONFIRMED and CONFIRMATION_STATUS_CONFIRMED.
     */
    getConfirmationStatus() : EnumValue<number>

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
     * Returns the customer-specific reference information for the order, or null.
     */
    getCustomerOrderReference() : string | null

    /**
     * Returns a date after which an order can be exported.
     */
    getExportAfter() : Date

    /**
     * Returns the export status of the order.
     * Possible values are: EXPORT_STATUS_NOTEXPORTED, EXPORT_STATUS_EXPORTED, EXPORT_STATUS_READY, and EXPORT_STATUS_FAILED.
     */
    getExportStatus() : EnumValue<number>

    /**
     * Returns the value of an external order number associated with this order, or null.
     */
    getExternalOrderNo() : string | null

    /**
     * Returns the status of an external order associated with this order, or null.
     */
    getExternalOrderStatus() : string | null

    /**
     * Returns the text describing the external order, or null.
     */
    getExternalOrderText() : string | null

    /**
     * Returns the Invoice associated with this order with the given invoicenumber.
     * @param invoicenumber
     */
    getInvoice(invoicenumber : string) : Invoice

    /**
     * Returns the InvoiceItem associated with this order with the given ID.
     * @param invoiceItemID
     */
    getInvoiceItem(invoiceItemID : string) : InvoiceItem | null

    /**
     * Returns the collection of InvoiceItems associated with this order.
     */
    getInvoiceItems() : FilteringCollection<InvoiceItem>

    /**
     * Returns the invoice number for this Order.
     */
    getInvoiceNo() : string

    /**
     * Returns the collection of Invoices associated with this order.
     */
    getInvoices() : FilteringCollection<Invoice>

    /**
     * Returns the order export XML as string object.
     * @param encryptionMethod
     * @param encryptionKey
     * @param encryptUsingEKID
     *
     * @deprecated
     */
    getOrderExportXML(encryptionMethod : string, encryptionKey : string, encryptUsingEKID : boolean) : string


    /**
     * Returns the order export XML as String object.
     *
     * Example:
     * ```
     * var orderXmlAsString = order.getOrderExportXML(null, null);
     * var orderXml = new XML(orderXmlAsString);
     * ```
     * This method can be called for placed orders only, otherwise an exception will be thrown.
     * Also, an exception will be thrown if the method is called in a transaction with changes.
     * @param encryptionMethod
     * @param encryptionKey
     */
    getOrderExportXML(encryptionMethod : string, encryptionKey : string) : string;

    /**
     * Returns the OrderItem for the itemID.
     * @param itemID
     */
    getOrderItem(itemID : string) : OrderItem | null

    /**
     * Returns the order number for this order.
     */
    getOrderNo() : string

    /**
     * Returns the URL safe token for this order.
     */
    getOrderToken() : string

    /**
     * Returns the original order associated with this order.
     */
    getOriginalOrder() : Order

    /**
     * Returns the order number of the original order associated with this order.
     */
    getOriginalOrderNo() : string

    /**
     * Returns the order payment status value.
    Possible values are PAYMENT_STATUS_NOTPAID, PAYMENT_STATUS_PARTPAID or PAYMENT_STATUS_PAID.
    */
    getPaymentStatus() : EnumValue<number>

    /**
     * Returns the sum of the refunded amounts.
     */
    getRefundedAmount() : Money

    /**
     * Returns the IP address of the remote host from which the order was created.
     */
    getRemoteHost() : string

    /**
     * If this order was replaced by another order, returns the value of the replace code.
     */
    getReplaceCode() : EnumValue<number>

    /**
     * If this order was replaced by another order, returns the value of the replace description.
     */
    getReplaceDescription() : string

    /**
     * Returns the order that this order replaced or null.
     */
    getReplacedOrder() : Order | null

    /**
     * Returns the order number that this order replaced or null if this order did not replace an order.
     */
    getReplacedOrderNo() : string

    /**
     * Returns the order that replaced this order, or null.
     */
    getReplacementOrder() : Order

    /**
     * If this order was replaced by another order, returns the order number that replaced this order.
     */
    getReplacementOrderNo() : string

    /**
     * Returns the Return associated with this order with the given returnnumber.
     * @param returnnumber
     */
    getReturn(returnnumber : string) : Return

    /**
     * Returns the ReturnCase associated with this order with the given returnCasenumber.
     * @param returnCasenumber
     */
    getReturnCase(returnCasenumber : string) : ReturnCase

    /**
     * Returns the ReturnCaseItem associated with this order with the given returnCaseItemID.
     * @param returnCaseItemID
     */
    getReturnCaseItem(returnCaseItemID : string) : ReturnCaseItem

    /**
     * Returns the collection of ReturnCaseItems associated with this order.
     */
    getReturnCaseItems() : FilteringCollection<ReturnCaseItem>

    /**
     * Returns the collection of ReturnCases associated with this order.
     */
    getReturnCases() : FilteringCollection<ReturnCase>

    /**
     * Returns the ReturnItem associated with this order with the given ID.
     * @param returnItemID
     */
    getReturnItem(returnItemID : string) : ReturnItem

    /**
     * Returns the collection of ReturnItems associated with this order.
     */
    getReturnItems() : FilteringCollection<ReturnItem>

    /**
     * Returns the collection of Returns associated with this order.
     */
    getReturns() : FilteringCollection<Return>

    /**
     * Returns the ShippingOrder associated with this order with the given shippingOrdernumber.
     * @param shippingOrdernumber
     */
    getShippingOrder(shippingOrdernumber : string) : ShippingOrder

    /**
     * Returns the ShippingOrderItem associated with this order with the given shippingOrderItemID.
     * @param shippingOrderItemID
     */
    getShippingOrderItem(shippingOrderItemID : string) : ShippingOrderItem

    /**
     * Returns the collection of ShippingOrderItems associated with this order.
     */
    getShippingOrderItems() : FilteringCollection<ShippingOrderItem>

    /**
     * Returns the collection of ShippingOrders associated with this order.
     */
    getShippingOrders() : FilteringCollection<ShippingOrder>

    /**
     * Returns the order shipping status.
    Possible values are SHIPPING_STATUS_NOTSHIPPED, SHIPPING_STATUS_PARTSHIPPED or SHIPPING_STATUS_SHIPPED.
    */
    getShippingStatus() : EnumValue<number>

    /**
     * Returns the source code stored with the order or null if no source code is attached to the order.
     */
    getSourceCode() : string

    /**
     * Returns the source code group attached to the order or null if no source code group is attached to the order.
     */
    getSourceCodeGroup() : SourceCodeGroup | null

    /**
     * Returns the source code group id stored with the order or null if no source code group is attached to the order.
     */
    getSourceCodeGroupID() : string | null

    /**
     * Returns the status of the order.
    Possible values are ORDER_STATUS_CREATED, ORDER_STATUS_NEW, ORDER_STATUS_OPEN, ORDER_STATUS_COMPLETED, ORDER_STATUS_CANCELLED, ORDER_STATUS_FAILED or ORDER_STATUS_REPLACED.
    */
    getStatus() : EnumValue<number>

    /**
     * Returns true, if the order is imported and false otherwise.
     */
    isImported() : boolean

    /**
     * Ensures that the order is authorized.
     */
    reauthorize() : Status

    /**
     * Sets the affiliate partner ID value.
     * @param affiliatePartnerID
     */
    setAffiliatePartnerID(affiliatePartnerID : string) : void

    /**
     * Sets the affiliate partner name value.
     * @param affiliatePartnerName
     */
    setAffiliatePartnerName(affiliatePartnerName : string) : void

    /**
     * Sets the cancel code value.
     * @param cancelCode
     */
    setCancelCode(cancelCode : string) : void

    /**
     * Sets the description as to why the order was cancelled.
     * @param cancelDescription
     */
    setCancelDescription(cancelDescription : string) : void

    /**
     * Sets the confirmation status value.
    Possible values are CONFIRMATION_STATUS_NOTCONFIRMED or CONFIRMATION_STATUS_CONFIRMED.
    * @param status
    */
    setConfirmationStatus(status : number) : void

    /**
     * This method is used to associate the order object with the specified customer object.
     * @param customer
     */
    setCustomer(customer : Customer) : void

    /**
     * Sets the customer-specific reference information for the order.
     * @param reference
     */
    setCustomerOrderReference(reference : string) : void

    /**
     * Sets the date after which an order can be exported.
     * @param date
     */
    setExportAfter(date : Date) : void

    /**
     * Sets the export status of the order.
     *
     * Possible values are: EXPORT_STATUS_NOTEXPORTED, EXPORT_STATUS_EXPORTED, EXPORT_STATUS_READY, and EXPORT_STATUS_FAILED.
     * @param status
     */
    setExportStatus(status : number) : void

    /**
     * Sets the value of an external order number associated with this order
     * @param externalOrderNo
     */
    setExternalOrderNo(externalOrderNo : string) : void

    /**
     * Sets the status of an external order associated with this order
     * @param status
     */
    setExternalOrderStatus(status : string) : void

    /**
     * Sets the text describing the external order.
     * @param text
     */
    setExternalOrderText(text : string) : void

    /**
     * Sets the invoice number for this Order.
     * @param aValue
     */
    setInvoiceNo(aValue : string) : void

    /**
     * Sets the order status.
     * @param statusNew
     */
    setOrderStatus(statusNew : number) : void

    /**
     * Sets the order payment status.
    Possible values are PAYMENT_STATUS_NOTPAID, PAYMENT_STATUS_PARTPAID or PAYMENT_STATUS_PAID.
    * @param status
    */
    setPaymentStatus(status : number) : void

    /**
     * Sets the value of the replace code.
     * @param replaceCode
     */
    setReplaceCode(replaceCode : string) : void

    /**
     * Sets the value of the replace description.
     * @param replaceDescription
     */
    setReplaceDescription(replaceDescription : string) : void

    /**
     * Sets the order shipping status value.
    Possible values are SHIPPING_STATUS_NOTSHIPPED, SHIPPING_STATUS_PARTSHIPPED or SHIPPING_STATUS_SHIPPED.
    * @param status
    */
    setShippingStatus(status : number) : void

    /**
     * Sets the status of the order.
     * @param status
     */
    setStatus(status : number) : void

    /**
     * Tracks an order change.
     * @param text
     */
    trackOrderChange(text : string) : Note



}

export = Order;
