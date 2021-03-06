/* eslint-disable no-undef */
const {
    generateAllow,
    generateDeny,
    generateSessionId,
    queryDDB,
    isForbiddenRequest,
    ALLOWED_ORIGINS,
    setCookieString,
    getCookiesFromHeader,
} = require('coffee-util');
const {
    methodArn,
    sortObjectByKey,
    extractCookieFromSetCookie,
} = require('../helper');
const { putCoffee } = require('../../src/layer/service/coffee-service');

function coffeeUtilBlock() {
    describe('Coffee-util function test', () => {
        test('Generate session id using route', () => {
            const route = 'hket_tomcat_01';
            const sessionId = generateSessionId(route);
            expect(sessionId).toBeDefined();
            const regExp = new RegExp(`[A-Z0-9]{16}.${route}`);
            expect(sessionId).toMatch(regExp);
        });

        const apiId = 'biz4b2rqf1';
        const action = 'POST';
        const path = 'api/getCoffeeByOrder';
        test('Generate AllowPolicy', () => {
            const { region, accountId } = process.env;
            const policy = generateAllow(
                'me',
                methodArn(region, accountId, apiId, action, path),
            );
            expect(policy.policyDocument).toBeDefined();
            expect(policy.policyDocument.Statement[0].Effect).toMatch(
                /^Allow$/,
            );
        });

        test('Generate DenyPolicy', () => {
            const { region, accountId } = process.env;
            const policy = generateDeny(
                'me',
                methodArn(region, accountId, apiId, action, path),
            );
            expect(policy.policyDocument).toBeDefined();
            expect(policy.policyDocument.Statement[0].Effect).toMatch(/^Deny$/);
        });

        test('Query with ExclusiveStartKey', async () => {
            const mockCoffees = [];
            const id = generateSessionId();
            const price = 50;
            for (let i = 0; i < 3; i++) {
                const coffee = {
                    id,
                    price,
                    name: 'Cappuccino',
                    year: '1683',
                    origin: 'Italy',
                    description:
                        "A cappuccino is a coffee-based drink made primarily from espresso and milk. It consists of one-third espresso, one-third heated milk and one-third milk foam and is generally served in a 6 to 8-ounce cup. The cappuccino is considered one of the original espresso drinks representative of Italian espresso cuisine and eventually Italian-American espresso cuisine.\nAccording to legend, the word cappuccino comes from the Capuchin monastic order. In 1683, soldiers fighting for Marco d'Aviano, a monk from the order, found a hoard of coffee following a victory over the Ottomans in the Battle of Vienna. The coffee was too strong for the European's tastes, so they diluted it with cream and honey. The resulting brown beverage matched the robes of the monk, and was dubbed cappuccino after the order[1]. However, it should be noted that this event predates espresso, one the key ingredient of a cappuccino by nearly 300 years. It is more likely that this event did lead to the popularization of coffee in the West and its rapid spread throughout Europe",
                };
                const data = await putCoffee(coffee);
                mockCoffees.push(data);
            }
            const result = await queryDDB({
                TableName: process.env.COFFEE_INFO,
                ExpressionAttributeValues: {
                    ':id': id,
                    ':price': price,
                },
                KeyConditionExpression: 'id = :id and price = :price',
                Limit: 1,
            });
            const sortedMockCoffees = sortObjectByKey(mockCoffees);
            const sortedResult = sortObjectByKey(result);
            expect(JSON.stringify(sortedResult)).toEqual(
                JSON.stringify(sortedMockCoffees),
            );
        });

        test('Check request has matched origin header', () => {
            const origin = 'http://google.com';
            const isForbidden = isForbiddenRequest(ALLOWED_ORIGINS, origin);
            expect(isForbidden).toBeTruthy();
        });

        test('Generate cookie with options', () => {
            const cookieStr = setCookieString(
                'Mocha_with_Bitter_Cookie',
                'AWESOME',
                {
                    domain: 'coffeeshop.com.hk',
                    path: '',
                    secure: false,
                    httpOnly: false,
                    sameSite: false,
                },
            );
            const cookie = extractCookieFromSetCookie(cookieStr);
            expect(cookie).toBeDefined();
            expect(cookie['Mocha_with_Bitter_Cookie']).toBeDefined();
        });

        test('Generate cookie without options', () => {
            const cookieStr = setCookieString(
                'Espresso_with_options',
                'RAW_TASTE_OF_COFFEE',
            );
            expect(cookieStr.length).toBeGreaterThan(0);
        });

        test('Test default generated cookie', () => {
            const cookieStr = setCookieString('Espresso', 'DEFAULT_COOKIE');
            expect(cookieStr).toBeDefined();
            expect(cookieStr.length).toBeGreaterThan(0);
            const cookie = extractCookieFromSetCookie(cookieStr);
            console.log(cookie);
            expect(cookie['Espresso']).toBeDefined();
        });

        test('Check empty cookie', () => {
            const cookie = getCookiesFromHeader({
                Cookie: 'empty;',
            });
            expect(cookie['empty']).toMatch(/^$/);
        });
    });
}

module.exports = {
    coffeeUtilBlock,
};
