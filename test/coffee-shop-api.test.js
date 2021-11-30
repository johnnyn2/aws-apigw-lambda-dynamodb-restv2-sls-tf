/* eslint-disable no-undef */
const { getCoffeeByOriginBlock } = require('./api/getCoffeeByOrigin');
const { putCoffeeBlock } = require('./api/putCoffee');
const { coffeeUtilBlock } = require('./util/coffee-util');

getCoffeeByOriginBlock();

putCoffeeBlock();

coffeeUtilBlock();
