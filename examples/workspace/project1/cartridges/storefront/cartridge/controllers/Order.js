'use strict';

var server = require('server');

server.get(
    'OrderDetail',
    server.middleware.https,
    userLogin.validate,
    function (req, res, next) {
        var OrderMgr = require('dw/order/OrderMgr'); // TEST dw/order/OrderMgr
        var OrderModel = require('*/cartridge/models/order'); // TEST */cartridge/models/order
        var Locale = require('dw/util/Locale'); // TEST dw/util/Locale

        var order = OrderMgr.getOrder(req.querystring.ID); // TEST OrderMgr.getOrder
        var token = req.querystring.token ? req.querystring.token : null;

        var currentLocale = Locale.getLocale(req.locale.id);

        var orderModel = new OrderModel(order, currentLocale);

        res.render('order/orderDetail', {
            order: orderModel
        });

        return next();
    }
);

server.get(
    'OrderList',
    server.middleware.https,
    userLogin.validate,
    function (req, res, next) {
        var OrderHelpers = require('*/cartridge/scripts/order/orderHelpers'); // TEST */cartridge/scripts/order/orderHelpers

        var ordersResult = OrderHelpers.getOrders( // TEST OrderHelpers.getOrders
            req.currentCustomer,
            req.querystring,
            req.locale.id
        );

        res.render('order/orderList', {
            orders: ordersResult.orders
        });

        return next();
    }
);

module.exports = server.exports();
