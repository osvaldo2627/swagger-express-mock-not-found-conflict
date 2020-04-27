
const swagger = require('swagger-express-middleware')
const Resource = swagger.Resource
let MockStore = null

const mockResourceNotFound = (mockDB, idProp = '') => {
  MockStore = mockDB
  return mockResponse

  function mockResponse (req, res, next) {
    const { method, path } = req
    if (/delete|patch/gi.test(method)) {
      MockStore.get(path, (err, args) => {
        if (!args) {
          return res.sendStatus(404)
        }
        err ? next(err) : next()
      })
    } else {
      next()
    }
  }
}

const mockPostConflict = (mockDB, idProp = '') => {
  MockStore = mockDB
  return mockPostResponse

  function mockPostResponse (req, res, next) {
    const { method, path, body } = req
    if (/post/gi.test(method)) {
      const resource = new Resource(`${path}`, body[idProp], body)
      MockStore.get(resource, (err, args) => {
        if (args) {
          return res.sendStatus(409)
        }
        err ? next(err) : next()
      })
    } else {
      next()
    }
  }
}

module.exports = {
  mockResourceNotFound,
  mockPostConflict
}
