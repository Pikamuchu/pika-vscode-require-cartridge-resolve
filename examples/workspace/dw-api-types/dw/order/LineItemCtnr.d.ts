import ExtensibleObject = require('../object/ExtensibleObject');
import Money = require('../value/Money');
import Collection = require('../util/Collection');
import LineItem = require('./LineItem');
import ProductLineItem = require('./ProductLineItem');
import HashMap = require('../util/HashMap');
import Quantity = require('../value/Quantity');
import PriceAdjustment = require('./PriceAdjustment');
import OrderAddress = require('./OrderAddress');
import BonusDiscountLineItem = require('./BonusDiscountLineItem');
import EnumValue = require('../value/EnumValue');
import CouponLineItem = require('./CouponLineItem');
import Customer = require('../customer/Customer');
import Shipment = require('./Shipment');
import GiftCertificateLineItem = require('./GiftCertificateLineItem');
import List = require('../util/List');
import PaymentInstrument = require('./PaymentInstrument');
import Note = require('../object/Note');
import Status = require('../system/Status');
import Product = require('../catalog/Product');
import ProductOptionModel = require('../catalog/ProductOptionModel');
import OrderPaymentInstrument = require('./OrderPaymentInstrument');
import ProductListItem = require('../customer/ProductListItem');
import Discount = require('../campaign/Discount');
import CustomAttributes = require('../object/CustomAttributes');

declare class LineItemCtnr<T extends CustomAttributes> extends ExtensibleObject<T> {
    /**
     * constant for Business Type B2B
     */
    static readonly BUSINESS_TYPE_B2B : number;
    /**
    * constant for Business Type B2C
    */
    static readonly BUSINESS_TYPE_B2C : number;
    /**
    * constant for Channel Type CallCenter
    */
    static readonly CHANNEL_TYPE_CALLCENTER : number
    /**
    * constant for Channel Type DSS
    */
    static readonly CHANNEL_TYPE_DSS : number
    /**
    * constant for Channel Type Facebook Ads
    */
    static readonly CHANNEL_TYPE_FACEBOOKADS : number
    /**
    * constant for Channel Type Marketplace
    */
    static readonly CHANNEL_TYPE_MARKETPLACE : number
    /**
    * constant for Channel Type Online Reservation
    */
    static readonly CHANNEL_TYPE_ONLINERESERVATION : number
    /**
    * constant for Channel Type Pinterest
    */
    static readonly CHANNEL_TYPE_PINTEREST : number
    /**
    * constant for Channel Type Store
    */
    static readonly CHANNEL_TYPE_STORE : number
    /**
    * constant for Channel Type Storefront
    */
    static readonly CHANNEL_TYPE_STOREFRONT : number
    /**
    * constant for Channel Type Subscriptions
    */
    static readonly CHANNEL_TYPE_SUBSCRIPTIONS : number
    /**
    * constant for Channel Type Twitter
    */
    static readonly CHANNEL_TYPE_TWITTER : number

    /**
     * The adjusted total gross price (including tax) in purchase currency. Adjusted merchandize prices represent the sum of product prices before services such as shipping, but after product-level and order-level adjustments.
     */
    readonly adjustedMerchandizeTotalGrossPrice : Money

    /**
     * The total net price (excluding tax) in purchase currency. Adjusted merchandize prices represent the sum of product prices before services such as shipping, but after product-level and order-level adjustments.
     */
    readonly adjustedMerchandizeTotalNetPrice : Money

    /**
     * The adjusted merchandize total price including product-level and order-level adjustments. If the line item container is based on net pricing the adjusted merchandize total net price is returned. If the line item container is based on gross pricing the adjusted merchandize total gross price is returned.
     */
    readonly adjustedMerchandizeTotalPrice : Money

    /**
     * The subtotal tax in purchase currency. Adjusted merchandize prices represent the sum of product prices before services such as shipping have been added, but after adjustment from promotions have been added.
     */
    readonly adjustedMerchandizeTotalTax : Money

    /**
     * The adjusted sum of all shipping line items of the line item container, including tax after shipping adjustments have been applied.
     */

    readonly adjustedShippingTotalGrossPrice : Money

    /**
     * The sum of all shipping line items of the line item container, excluding tax after shipping adjustments have been applied.
     */
    readonly adjustedShippingTotalNetPrice : Money

    /**
     * The adjusted shipping total price. If the line item container is based on net pricing the adjusted shipping total net price is returned. If the line item container is based on gross pricing the adjusted shipping total gross price is returned.
     */
    readonly adjustedShippingTotalPrice : Money

    /**
     * The tax of all shipping line items of the line item container after shipping adjustments have been applied.
     */
    readonly adjustedShippingTotalTax : Money

    /**
     * All product, shipping, price adjustment, and gift certificate line items of the line item container.
     */
    readonly allLineItems : Collection<LineItem>

    /**
     * All product line items of the container, no matter if they are dependent or independent. This includes option, bundled and bonus line items.
     */
    readonly allProductLineItems : Collection<ProductLineItem>

    /**
     * A hash mapping all products in the line item container to their total quantities. The total product quantity is used chiefly to validate the availability of the items in the cart. This method is not appropriate to look up prices because it returns products such as bundled line items which are included in the price of their parent and therefore have no corresponding price.
     *
     * The method counts all direct product line items, plus dependent product line items that are not option line items. It also excludes product line items that are not associated to any catalog product.
     */
    readonly allProductQuantities  :  HashMap<Product, Quantity>



    /**
     * The collection of all shipping price adjustments applied somewhere in the container. This can be adjustments applied to individual shipments or to the container itself. Note that the promotions engine only applies shipping price adjustments to the the default shipping line item of shipments, and never to the container.
     */
    readonly allShippingPriceAdjustments  :  Collection<PriceAdjustment>

    /**
     * The billing address defined for the container. Returns null if no billing address has been created yet.
     */
    readonly billingAddress  :  OrderAddress | null

    /**
     * An unsorted collection of the the bonus discount line items associated with this container.
     */
    readonly bonusDiscountLineItems  :  Collection<BonusDiscountLineItem>

    /**
     * The collection of product line items that are bonus items (where ProductLineItem.isBonusProductLineItem() is true).
     */
    readonly bonusLineItems  :  Collection<ProductLineItem>

    /**
     * The type of the business this order has been placed in.
    Possible values are BUSINESS_TYPE_B2C or BUSINESS_TYPE_B2B.
    */
    readonly businessType  :  EnumValue<number>

    /**
     * The channel type defines in which sales channel this order has been created. This can be used to distinguish order placed through Storefront, Call Center or Marketplace.
    Possible values are CHANNEL_TYPE_STOREFRONT, CHANNEL_TYPE_CALLCENTER, CHANNEL_TYPE_MARKETPLACE, CHANNEL_TYPE_DSS, CHANNEL_TYPE_STORE, CHANNEL_TYPE_PINTEREST, CHANNEL_TYPE_TWITTER, CHANNEL_TYPE_FACEBOOKADS, CHANNEL_TYPE_SUBSCRIPTIONS or CHANNEL_TYPE_ONLINERESERVATION.
    */
    readonly channelType  :  EnumValue<number>

    /**
     * A sorted collection of the coupon line items in the container. The coupon line items are returned in the order they were added to container.
     */
    readonly couponLineItems  :  Collection<CouponLineItem>

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
     * The default shipment of the line item container.
     */
    readonly defaultShipment  :  Shipment

    /**
     * The Etag of the line item container. The Etag is a hash that represents the overall container state including any associated objects like line items.
     */
    readonly etag  :  string

    /**
     * All gift certificate line items of the container.
     */
    readonly giftCertificateLineItems  :  Collection<GiftCertificateLineItem>

    /**
     * An unsorted collection of the PaymentInstrument instances that represent GiftCertificates in this container.
     */
    readonly giftCertificatePaymentInstruments  :  Collection<PaymentInstrument>

    /**
     * The total gross price of all gift certificates in the cart. Should usually be equal to total net price.
     */
    readonly giftCertificateTotalGrossPrice  :  Money

    /**
     * The total net price (excluding tax) of all gift certificates in the cart. Should usually be equal to total gross price.
     */
    readonly giftCertificateTotalNetPrice  :  Money

    /**
     * The gift certificate total price. If the line item container is based on net pricing the gift certificate total net price is returned. If the line item container is based on gross pricing the gift certificate total gross price is returned.
     */
    readonly giftCertificateTotalPrice  :  Money

    /**
     * The total tax of all gift certificates in the cart. Should usually be 0.0.
     */
    readonly giftCertificateTotalTax  :  Money

    /**
     * The total gross price (including tax) in purchase currency. Merchandize total prices represent the sum of product prices before services such as shipping or adjustment from promotions have been added.
     */
    readonly merchandizeTotalGrossPrice  :  Money

    /**
     * The total net price (excluding tax) in purchase currency. Merchandize total prices represent the sum of product prices before services such as shipping or adjustment from promotion have been added.
     */
    readonly merchandizeTotalNetPrice  :  Money

    /**
     * The merchandize total price. If the line item container is based on net pricing the merchandize total net price is returned. If the line item container is based on gross pricing the merchandize total gross price is returned.
     */
    readonly merchandizeTotalPrice  :  Money

    /**
     * The total tax in purchase currency. Merchandize total prices represent the sum of product prices before services such as shipping or adjustment from promotions have been added.
     */
    readonly merchandizeTotalTax  :  Money

    /**
     * The list of notes for this object, ordered by creation time from oldest to newest.
     */
    readonly notes  :  List<Note>

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
     * A hash map of all products in the line item container and their total quantities. The total product quantity is for example used to lookup the product price.

    The method counts all direct product line items, plus dependent product line items that are not bundled line items and no option line items. It also excludes product line items that are not associated to any catalog product, and bonus product line items.
    */
    readonly productQuantities  :  HashMap<Product, Quantity>

    /**
     * The total quantity of all product line items. Not included are bundled line items and option line items.
     */
    readonly productQuantityTotal  :  number

    /**
     * All shipments of the line item container.
    The first shipment in the returned collection is the default shipment. All other shipments are sorted ascending by shipment ID.
    */
    readonly shipments  :  Collection<Shipment>

    /**
     * The of shipping price adjustments applied to the shipping total of the container. Note that the promotions engine only applies shipping price adjustments to the the default shipping line item of shipments, and never to the container.
     */
    readonly shippingPriceAdjustments  :  Collection<PriceAdjustment>

    /**
     * The sum of all shipping line items of the line item container, including tax before shipping adjustments have been applied.
     */
    readonly shippingTotalGrossPrice  :  Money

    /**
     * The sum of all shipping line items of the line item container, excluding tax before shipping adjustments have been applied.
     */
    readonly shippingTotalNetPrice  :  Money

    /**
     * The shipping total price. If the line item container is based on net pricing the shipping total net price is returned. If the line item container is based on gross pricing the shipping total gross price is returned.
     */
    readonly shippingTotalPrice  :  Money

    /**
     * The tax of all shipping line items of the line item container before shipping adjustments have been applied.
     */
    readonly shippingTotalTax  :  Money

    /**
     * The grand total price gross of tax for LineItemCtnr, in purchase currency. Total prices represent the sum of product prices, services prices and adjustments.
     */
    readonly totalGrossPrice  :  Money

    /**
     * The grand total price for LineItemCtnr net of tax, in purchase currency. Total prices represent the sum of product prices, services prices and adjustments.
     */
    readonly totalNetPrice  :  Money
    /**
     * The grand total tax for LineItemCtnr, in purchase currency. Total prices represent the sum of product prices, services prices and adjustments.
     */
    readonly totalTax  :  Money



    /**
     * Adds a note to the object.
     * @param subject
     * @param text
     */
    addNote(subject : string, text : string) : Note

    /**
     * Create a billing address for the LineItemCtnr.
     */
    createBillingAddress() : OrderAddress

    /**
     * Creates a product line item in the container based on the passed Product and BonusDiscountLineItem.
     * @param bonusDiscountLineItem
     * @param product
     * @param optionModel
     * @param shipment
     */
    createBonusProductLineItem(bonusDiscountLineItem : BonusDiscountLineItem, product : Product, optionModel : ProductOptionModel | null, shipment : Shipment | null) : ProductLineItem

    /**
     * Creates a new CouponLineItem for this container based on the supplied coupon code.
     * @param couponCode
     * @param campaignBased
     */
    createCouponLineItem(couponCode : string, campaignBased : boolean) : CouponLineItem

    /**
     * Creates a coupon line item that is not based on the Commerce Cloud Digital campaign system and associates it with the specified coupon code.
     * @param couponCode
     */
    createCouponLineItem(couponCode : string) : CouponLineItem

    /**
     * Creates a gift certificate line item.
     * @param amount
     * @param recipientEmail
     */
    createGiftCertificateLineItem(amount : number, recipientEmail : string) : GiftCertificateLineItem

    /**
     * Creates an OrderPaymentInstrument representing a Gift Certificate.
     * @param giftCertificateCode
     * @param amount
     */
    createGiftCertificatePaymentInstrument(giftCertificateCode : string, amount : Money) : OrderPaymentInstrument

    /**
     * Creates a payment instrument using the specified payment method id and amount.
     * @param paymentMethodId
     * @param amount
     */
    createPaymentInstrument(paymentMethodId : string, amount : Money) : OrderPaymentInstrument

    /**
     * Creates an order price adjustment.
     * The promotion id is mandatory and must not be the ID of any actual promotion defined in Commerce Cloud Digital; otherwise an exception is thrown.
     * @param promotionID
     */
    createPriceAdjustment(promotionID : string) : PriceAdjustment

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
     * Creates a new product line item in the container and assigns it to the specified shipment.
     * @param product
     * @param optionModel
     * @param shipment
     */
    createProductLineItem(product : Product, optionModel : ProductOptionModel, shipment : Shipment) : ProductLineItem

    /**
     * Creates a standard shipment for the line item container.
     * @param id
     */
    createShipment(id : string) : Shipment

    /**
     * Creates a shipping price adjustment to be applied to the container.
     * @param promotionID
     */
    createShippingPriceAdjustment(promotionID : string) : PriceAdjustment

    /**
     * Returns the adjusted total gross price (including tax) in purchase currency.
     */
    getAdjustedMerchandizeTotalGrossPrice() : Money

    /**
     * Returns the total net price (excluding tax) in purchase currency.
     */
    getAdjustedMerchandizeTotalNetPrice() : Money

    /**
     * Returns the adjusted merchandize total price including product-level and order-level adjustments.
     */
    getAdjustedMerchandizeTotalPrice() : Money

    /**
     * Returns the adjusted merchandize total price including order-level adjustments if requested.
     * @param applyOrderLevelAdjustments
     */
    getAdjustedMerchandizeTotalPrice(applyOrderLevelAdjustments : boolean) : Money

    /**
     * Returns the subtotal tax in purchase currency.
     */
    getAdjustedMerchandizeTotalTax() : Money

    /**
     * Returns the adjusted sum of all shipping line items of the line item container, including tax after shipping adjustments have been applied.
     */
    getAdjustedShippingTotalGrossPrice() : Money

    /**
     * Returns the sum of all shipping line items of the line item container, excluding tax after shipping adjustments have been applied.
     */
    getAdjustedShippingTotalNetPrice() : Money

    /**
     * Returns the adjusted shipping total price.
     */
    getAdjustedShippingTotalPrice() : Money

    /**
     * Returns the tax of all shipping line items of the line item container after shipping adjustments have been applied.
     */
    getAdjustedShippingTotalTax() : Money

    /**
     * Returns all product, shipping, price adjustment, and gift certificate line items of the line item container.
     */
    getAllLineItems() : Collection<LineItem>

    /**
     * Returns all product line items of the container, no matter if they are dependent or independent.
     */
    getAllProductLineItems() : Collection<ProductLineItem>

    /**
     * Returns all product line items of the container that have a product ID equal to the specified product ID, no matter if they are dependent or independent.
     * @param productID
     */
    getAllProductLineItems(productID : string) : Collection<ProductLineItem>

    /**
     * Returns a hash mapping all products in the line item container to their total quantities.
     */
    getAllProductQuantities() : HashMap<Product, Quantity>

    /**
     * Returns the collection of all shipping price adjustments applied somewhere in the container.
     */
    getAllShippingPriceAdjustments() : Collection<PriceAdjustment>

    /**
     * Returns the billing address defined for the container.
     */
    getBillingAddress() : OrderAddress | null

    /**
     * Returns an unsorted collection of the the bonus discount line items associated with this container.
     */
    getBonusDiscountLineItems() : Collection<BonusDiscountLineItem>

    /**
     * Returns the collection of product line items that are bonus items (where ProductLineItem.isBonusProductLineItem() is true).
     */
    getBonusLineItems() : Collection<ProductLineItem>

    /**
     * Returns the type of the business this order has been placed in.
    Possible values are BUSINESS_TYPE_B2C or BUSINESS_TYPE_B2B.
    */
    getBusinessType() : EnumValue<number>

    /**
     * The channel type defines in which sales channel this order has been created.
     */
    getChannelType() : EnumValue<number>

    /**
     * Returns the coupon line item representing the specified coupon code.
     * @param couponCode
     */
    getCouponLineItem(couponCode : string) : CouponLineItem | null

    /**
     * Returns a sorted collection of the coupon line items in the container.
     */
    getCouponLineItems() : Collection<CouponLineItem>

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
     * Returns the default shipment of the line item container.
     */
    getDefaultShipment() : Shipment

    /**
     * Returns the Etag of the line item container.
     */
    getEtag() : string

    /**
     * Returns all gift certificate line items of the container.
     */
    getGiftCertificateLineItems() : Collection<GiftCertificateLineItem>

    /**
     * Returns all gift certificate line items of the container, no matter if they are dependent or independent.
     * @param giftCertificateId
     */
    getGiftCertificateLineItems(giftCertificateId : string) : Collection<GiftCertificateLineItem>

    /**
     * Returns an unsorted collection of the PaymentInstrument instances that represent GiftCertificates in this container.
     */
    getGiftCertificatePaymentInstruments() : Collection<PaymentInstrument>

    /**
     * Returns an unsorted collection containing all PaymentInstruments of type PaymentInstrument.METHOD_GIFT_CERTIFICATE where the specified code is the same code on the payment instrument.
     * @param giftCertificateCode
     */
    getGiftCertificatePaymentInstruments(giftCertificateCode : string) : Collection<PaymentInstrument>

    /**
     * Returns the total gross price of all gift certificates in the cart.
     */
    getGiftCertificateTotalGrossPrice() : Money

    /**
     * Returns the total net price (excluding tax) of all gift certificates in the cart.
     */
    getGiftCertificateTotalNetPrice() : Money

    /**
     * Returns the gift certificate total price.
     */
    getGiftCertificateTotalPrice() : Money

    /**
     * Returns the total tax of all gift certificates in the cart.
     */
    getGiftCertificateTotalTax() : Money

    /**
     * Returns the total gross price (including tax) in purchase currency.
     */
    getMerchandizeTotalGrossPrice() : Money

    /**
     * Returns the total net price (excluding tax) in purchase currency.
     */
    getMerchandizeTotalNetPrice() : Money

    /**
     * Returns the merchandize total price.
     */
    getMerchandizeTotalPrice() : Money

    /**
     * Returns the total tax in purchase currency.
     */
    getMerchandizeTotalTax() : Money

    /**
     * Returns the list of notes for this object, ordered by creation time from oldest to newest.
     */
    getNotes() : List<Note>

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
     * Returns a hash map of all products in the line item container and their total quantities.
     */
    getProductQuantities() : HashMap<Product, Quantity>

    /**
     * Returns a hash map of all products in the line item container and their total quantities.
     * @param includeBonusProducts
     */
    getProductQuantities(includeBonusProducts : boolean) : HashMap<Product, Quantity>

    /**
     * Returns the total quantity of all product line items.
     */
    getProductQuantityTotal() : number

    /**
     * Returns the shipment for the specified ID or null if no shipment with this ID exists in the line item container.
     * @param id
     */
    getShipment(id : string) : Shipment | null

    /**
     * Returns all shipments of the line item container.
     */
    getShipments() : Collection<Shipment>

    /**
     * Returns the shipping price adjustment associated with the specified promotion ID.
     * @param promotionID
     */
    getShippingPriceAdjustmentByPromotionID(promotionID : string) : PriceAdjustment

    /**
     * Returns the of shipping price adjustments applied to the shipping total of the container.
     */
    getShippingPriceAdjustments() : Collection<PriceAdjustment>

    /**
     * Returns the sum of all shipping line items of the line item container, including tax before shipping adjustments have been applied.
     */
    getShippingTotalGrossPrice() : Money

    /**
     * Returns the sum of all shipping line items of the line item container, excluding tax before shipping adjustments have been applied.
     */
    getShippingTotalNetPrice() : Money

    /**
     * Returns the shipping total price.
     */
    getShippingTotalPrice() : Money

    /**
     * Returns the tax of all shipping line items of the line item container before shipping adjustments have been applied.
     */
    getShippingTotalTax() : Money

    /**
     * Returns the grand total price gross of tax for LineItemCtnr, in purchase currency.
     */
    getTotalGrossPrice() : Money

    /**
     * Returns the grand total price for LineItemCtnr net of tax, in purchase currency.
     */
    getTotalNetPrice() : Money

    /**
     * Returns the grand total tax for LineItemCtnr, in purchase currency.
     */
    getTotalTax() : Money

    /**
     * Removes the all Payment Instruments from this container and deletes the Payment Instruments.
     */
    removeAllPaymentInstruments() : void

    /**
     * Removes the specified bonus discount line item from the line item container.
     * @param bonusDiscountLineItem
     */
    removeBonusDiscountLineItem(bonusDiscountLineItem : BonusDiscountLineItem) : void

    /**
     * Removes the specified coupon line item from the line item container.
     * @param couponLineItem
     */
    removeCouponLineItem(couponLineItem : CouponLineItem) : void

    /**
     * Removes the specified gift certificate line item from the line item container.
     * @param giftCertificateLineItem
     */
    removeGiftCertificateLineItem(giftCertificateLineItem : GiftCertificateLineItem) : void

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
     * Removes the specified shipment and all associated product, gift certificate, shipping and price adjustment line items from the line item container.
     * @param shipment
     */
    removeShipment(shipment : Shipment) : void

    /**
     * Removes the specified shipping price adjustment line item from the line item container.
     * @param priceAdjustment
     */
    removeShippingPriceAdjustment(priceAdjustment : PriceAdjustment) : void

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
     * Calculates the tax for all shipping and order-level merchandise price adjustments in this LineItemCtnr.

    The tax on each adjustment is calculated from the taxes of the line items the adjustment applies across.

    This method must be invoked at the end of tax calculation of a basket or an order.
    */
    updateOrderLevelPriceAdjustmentTax() : void

    /**
     * Recalculates the totals of the line item container.
     */
    updateTotals() : void
    /**
     * Verifies whether the manual price adjustments made for the line item container exceed the corresponding limits for the current user and the current site.
     */
    verifyPriceAdjustmentLimits() : Status



}


export = LineItemCtnr;
