const request = require('supertest')('http://localhost:8000');
const expect = require('chai').expect;

describe('Faker Object Generator', () => {
    it('Should generate 5 item array', async () => {
        let response = await request.get('/products-test');
        let data = response.json();
        expect(data.length).to.eql(5);
    })
})

describe('Info Route', () => {
    it('Should have data object', async () => {
        let response = await request.get('/info');
        let data = response.json();
        expect(data.hasOwnProperty('platform')).to.eql(true);
    })
})