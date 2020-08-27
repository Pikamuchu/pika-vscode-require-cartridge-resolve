const sinon = require('sinon');
const { assert } = require('chai');
const searchquire = require('searchquire');

describe('orderHelpersTest', () => {
    const orderHelpersTest = searchquire('*/cartridge/scripts/order/orderHelpers', { // TEST: */cartridge/scripts/order/orderHelpers
        basePath: '../cartridges/extension/cartridge',
        pattern: '*/cartridge/(.*)',
    });

    describe('lodash initialization', () => {
        it('Testing', () => {
            orderHelpersTest.checkSomething('1234'); // TEST: orderHelpersTest.checkSomething
            // FIXME: Autocomplete orderHelpersTest. resolves base
            // FIXME: Autocomplete orderHelpersTest. not working with
            //  let orderHelpersTest;
            //  orderHelpersTest = searchquire('*/cartridge/scripts/order/orderHelpers'
        });
    });
});
