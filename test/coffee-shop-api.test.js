/* eslint-disable no-undef */
const { getCoffeeByOriginBlock } = require('./api/getCoffeeByOrigin');
const { putCoffeeBlock } = require('./api/putCoffee');
const { coffeeUtilBlock } = require('./util/coffee-util');
const { createTable } = require('../createTable');

beforeAll(() => createTable(), 20000);

getCoffeeByOriginBlock();

putCoffeeBlock();

coffeeUtilBlock();
