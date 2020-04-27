const express = require('express')
const app = express()
const swagger = require('swagger-express-middleware')
const request = require('supertest')

const MemoryDataStore = swagger.MemoryDataStore
const Resource = swagger.Resource
const mockMemoryDB = new MemoryDataStore()
const { express: errMiddleware } = require('agnostic-http-error-handler')()

// Loading test records resources into mockDB
const testData = require('../test/fixtures')

const path = require('path')
const swaggerSpec = path.join(__dirname, 'swagger.yaml')

// Getting notFound and Conflict mock middlewares
const { mockResourceNotFound, mockPostConflict } = require('../index')

mockMemoryDB.save(
  new Resource('/holiday-api/holidays/testId1', testData[0]),
  new Resource('/holiday-api/holidays/testId2', testData[1])
)

const server = new Promise((resolve, reject) => {
  swagger(swaggerSpec, app, (err, middleware) => {
    if (err) {
      reject(err)
    }

    app.use(
      middleware.metadata(),
      middleware.CORS(),
      middleware.files({
        apiPath: '/swagger'
      }),
      middleware.parseRequest(),
      middleware.validateRequest(),
      // Adding notFound and Conflict Middleware
      mockResourceNotFound(mockMemoryDB),
      // id is the primary key or property to look for conflict 409
      mockPostConflict(mockMemoryDB, 'id'),
      middleware.mock(mockMemoryDB)
    )
    app.use(errMiddleware)
    resolve(app)
  })
})

describe('swagger-express-mock-not-found-conflict', function () {
  it('should run the server', function (done) {
    server.then(app => {
      app.listen(3000, () => {
        console.log('Service is now running')
        done()
      })
    })
  })

  it('should response with 409 for post with conflict item in the collection', function (done) {
    request(app)
      .post('/holiday-api/holidays/')
      .send(testData[0])
      .set('Accept', 'application/json')
      .expect(409, done)
  })

  it('should response 200 and the new added item', function (done) {
    const item = { ...testData[0] }
    delete item.id
    request(app)
      .post('/holiday-api/holidays/')
      .send(item)
      .set('Accept', 'application/json')
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err)
        if (res.body.name === item.name &&
          res.body.address === item.address) {
          done()
        }
      })
  })

  it('should response with 404 for patch on a not found item', function (done) {
    request(app)
      .patch('/holiday-api/holidays/noResourceId')
      .send({ name: 'some name that will not update' })
      .set('Accept', 'application/json')
      .expect(404, done)
  })

  it('should response with 200 and the updated item', function (done) {
    request(app)
      .patch('/holiday-api/holidays/testId1')
      .send({ name: 'some updated name' })
      .set('Accept', 'application/json')
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err)
        if (res.body.name === 'some updated name') {
          done()
        }
      })
  })

  it('should response with 404 for delete with not found item', function (done) {
    request(app)
      .delete('/holiday-api/holidays/noResourceId')
      .expect(404, done)
  })

  it('should response with 200 and the deleted item', function (done) {
    request(app)
      .delete('/holiday-api/holidays/testId2')
      .expect(200)
      .end(function (err, res) {
        if (err) throw err
        if (res.body.id === 'testId2') {
          done()
        }
      })
  })
})
