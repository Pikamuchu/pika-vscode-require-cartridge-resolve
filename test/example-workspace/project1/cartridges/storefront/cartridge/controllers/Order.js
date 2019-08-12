'use strict';

var server = require('server');

var Resource = require('dw/web/Resource');

server.get(
    'OrderDetail',
    function (req, res, next) {
        var OrderMgr = require('dw/order/OrderMgr');
        var OrderModel = require('*/cartridge/models/order');
        var Locale = require('dw/util/Locale');

        var order = OrderMgr.getOrder(req.querystring.ID);
        var token = req.querystring.token ? req.querystring.token : null;

        var config = {
            numberOfLineItems: '*'
        };

        var currentLocale = Locale.getLocale(req.locale.id);

        var orderModel = new OrderModel(
            order,
            { config: config, countryCode: currentLocale.country, containerView: 'order' }
        );

        res.render('order/orderDetail', {
            order: orderModel
        });

        return next();
    }
);

server.get(
    'OrderList',
    server.middleware.https,
    consentTracking.consent,
    userLoggedIn.validateLoggedInAjax,
    function (req, res, next) {
        var OrderHelpers = require('*/cartridge/scripts/order/orderHelpers');

        var data = res.getViewData();
        if (data && !data.loggedin) {
            res.json();
            return next();
        }

        var ordersResult = OrderHelpers.getOrders(
            req.currentCustomer,
            req.querystring,
            req.locale.id
        );
        var orders = ordersResult.orders;
        var filterValues = ordersResult.filterValues;

        res.render('order/orderList', {
            orders: orders
        });
        return next();
    }
);

module.exports = server.exports();
