/* eslint-disable no-undef */
const { handler } = require('../../src/api/getCoffeeByOrigin');
const { handler: putCoffeeHandler } = require('../../src/api/putCoffee');

describe('Get Coffee By Origin Lambda function', () => {
    jest.useFakeTimers('legacy');

    const event = {
        queryStringParameters: {},
        body: {},
    };
    const context = {};

    beforeEach(() => {
        event.queryStringParameters = {};
    });

    test('Successfully query coffee by origin', async () => {
        event.body = JSON.stringify({
            name: 'Yuanyang',
            price: 20,
            origin: 'Hong Kong',
            description:
                'Yuanyang or "coffee with tea" is a popular beverage in Hong Kong, made of a mixture of coffee and Hong Kong-style milk tea. It was originally served at "dai pai dongs" (open air food vendors) and "cha chaan tengs" (cafe), but is now available in various types of restaurants. It can be served hot or cold. The name yuanyang, which refers to Mandarin Ducks, is a symbol of conjugal love in Chinese culture, as the birds usually appear in pairs and the male and female look very different. This same connotation of a "pair" of two unlike items is used to name this drink.',
        });
        const putCoffeeResult = await putCoffeeHandler(event, context);
        expect(putCoffeeResult).toBeDefined();
        expect(putCoffeeResult.statusCode).toBe(200);
        const putResultBody = JSON.parse(putCoffeeResult.body);
        expect(Object.keys(putResultBody).length).toBeGreaterThan(0);
        event.queryStringParameters['origin'] = 'Hong Kong';
        const result = await handler(event, context);
        expect(result).toBeDefined();
        expect(result.statusCode).toBe(200);
        const body = JSON.parse(result.body);
        expect(body.length).toBeGreaterThan(0);
    });

    test('Fail to get coffee due to missing origin param', async () => {
        const result = await handler(event, context);
        expect(result).toBeDefined();
        expect(result.statusCode).toBe(500);
    });
});
