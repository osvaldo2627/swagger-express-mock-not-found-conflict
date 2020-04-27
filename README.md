# Context
With the [Mock middleware](https://apitools.dev/swagger-express-middleware/docs/middleware/mock.html) from swagger-express it is possible to 
have a usable fully mocked api. It takes the swagger spec as base
and pefrom an intelligent effort to  automatically act according 
with the HTTP method. Processing the urls and payload 
to detect the target resources and perform the operations.
The result is really cool, because we may have our express application
responding to all request as if all the routes where implemented with
an in memory persisted datastore with cero logic code.

# swagger-express-mock-not-found-conflict
This package provides the following two utils middlewares to work 
with swagger-express Mock.

## mockResourceNotFound
mockResourceNotFound: By default the Mock middleware considere
POST and PATCH methods as the same operation. However by definition 
[PATCH](https://tools.ietf.org/html/rfc5789) method can return a not 
found when a client attempted to apply a patch document to a non-
existent resource and the patch document chosen cannot be applied
to a non-existent resource. Basically mockResourceNotFound middleware 
will response with 404 if the resource to be patch or deleted does not 
exist.

## mockPostConflict
If the API must return a 409 error when POST a resources that lead to a duplicated element. The default behavior of the mock middleware considering PATCH and POST as the same operation will not work. Using the mockPostConflict we may provide a property  
as primary or unique key that may lead to a duplicate items in the collection.

## install 
```js
npm i swagger-express-mock-not-found-conflict
```

## Basic Usage
```js
...
const { mockResourceNotFound, mockPostConflict } = require('swagger-express-mock-not-found-conflict')
...
app.use(
  middleware.metadata(),
  middleware.CORS(),
  middleware.parseRequest(),
  middleware.validateRequest(),
  // notFound for PATCH and DELETE
  mockResourceNotFound(mockMemoryDB),
  // id is the primary/unique key that lead to conflict 409
  mockPostConflict(mockMemoryDB, 'id'),
  middleware.mock(mockMemoryDB)
)
...
```

## Example
For a fully functional example please clone: 


## Test
```
npm run test
```