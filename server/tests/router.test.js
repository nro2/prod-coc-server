const routes = require('../routes');
const assert = require("assert");
const request = require('supertest')

const express = require('express');
const app = express();
app.use('/', routes);



describe("Tests routes", ()=> {

    it("This should fail", () => {
        return request(app).get('/').then(function(response){
            assert.equal(response.status, 200)
        })
    })
})
