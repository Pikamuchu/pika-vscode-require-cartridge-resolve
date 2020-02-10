'use strict';

var server = require('server');

server.extend(module.superModule);

server.append('OrderDetail', function (req, res, next) {
    var OrderHelpers = require('*/cartridge/scripts/order/orderHelpers');
    OrderHelpers.addShipmentStoreInfoToOrderModel(res.getViewData().order);
    next();
});

module.exports = server.exports();
