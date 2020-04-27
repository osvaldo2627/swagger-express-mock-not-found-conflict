const express = require('express')
const app = express()
const swagger = require('swagger-express-middleware')
const swaggerUi = require('swagger-ui-express')
const { express: errMiddleware } = require('agnostic-http-error-handler')()

const MemoryDataStore = swagger.MemoryDataStore
const Resource = swagger.Resource
const mockMemoryDB = new MemoryDataStore()

// Loading test records resources into mockDB
const testData = require('../test/fixtures')
mockMemoryDB.save(
  new Resource('/holiday-api/holidays/testId1', testData[0]),
  new Resource('/holiday-api/holidays/testId2', testData[1])
)

const path = require('path')
const swaggerSpec = path.join(__dirname, '../test/swagger.yaml')

// Getting notFound and Conflict mock middlewares
const { mockResourceNotFound, mockPostConflict } = require('../index')

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

    // Just for testing the api with swagger-ui
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(null, {
      swaggerOptions: { url: '/swagger' }
    }))

    app.use(errMiddleware)
    resolve(app)
  })
})

server.then(app => {
  console.log('server 1')
  app.listen(3000, () => {
    console.log('Service is now running')
  })
})
