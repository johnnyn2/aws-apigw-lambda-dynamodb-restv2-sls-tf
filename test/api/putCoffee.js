/* eslint-disable no-undef */
const { handler } = require('../../src/api/putCoffee');

function putCoffeeBlock() {
    describe('Put Coffee Lambda function', () => {
        jest.useFakeTimers('legacy');

        const event = {
            body: {},
            headers: {
                origin: 'http://localhost:3000',
            },
        };
        const context = {};
        beforeEach(() => {
            event.body = {};
        });
        test('Fail to put coffee when missing coffee price property', async () => {
            event.body = JSON.stringify({
                name: 'Cappuccino',
                year: '1683',
                origin: 'Italy',
                description:
                    "A cappuccino is a coffee-based drink made primarily from espresso and milk. It consists of one-third espresso, one-third heated milk and one-third milk foam and is generally served in a 6 to 8-ounce cup. The cappuccino is considered one of the original espresso drinks representative of Italian espresso cuisine and eventually Italian-American espresso cuisine.\nAccording to legend, the word cappuccino comes from the Capuchin monastic order. In 1683, soldiers fighting for Marco d'Aviano, a monk from the order, found a hoard of coffee following a victory over the Ottomans in the Battle of Vienna. The coffee was too strong for the European's tastes, so they diluted it with cream and honey. The resulting brown beverage matched the robes of the monk, and was dubbed cappuccino after the order[1]. However, it should be noted that this event predates espresso, one the key ingredient of a cappuccino by nearly 300 years. It is more likely that this event did lead to the popularization of coffee in the West and its rapid spread throughout Europe",
            });
            const result = await handler(event, context);
            expect(result).toBeDefined();
            expect(result.statusCode).toBe(500);
        });
    });
}

module.exports = {
    putCoffeeBlock,
};
