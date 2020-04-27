# Context
With the [Mock middleware](https://apitools.dev/swagger-express-middleware/docs/middleware/mock.html) from swagger-express it is possible to 
have a usable fully mocked API with zero logic code. 
It takes the swagger spec as a base
and applies some intelligence, in order to automatically mock the implementation of controllers and datastore. The result is cool, because we may have our express application responding to all HTTP request as well as a decent demo persistence store. The mock feature gets handy when we what to demo or follow a TDD implementation. 

# swagger-express-mock-not-found-conflict
This package provides the following two utils middlewares to work 
together with swagger-express Mock.

## mockResourceNotFound
mockResourceNotFound: By default the Mock middleware consider
POST and PATCH methods as the same operation. However by definition 
[PATCH](https://tools.ietf.org/html/rfc5789) method can return a not 
found when a client attempted to apply a patch document to a non-
existent resource but the patch document chosen cannot be applied
to a non-existent resource. Basically mockResourceNotFound middleware 
will response with 404 if the resource to be updated or deleted does not 
exist.

## mockPostConflict
If the API must return a 409 error for POST requests that lead to duplicated elements. The default behavior of the mock middleware considering PATCH and POST as the same operation and will not work. Using the mockPostConflict we may provide a property as a primary or unique key for the detection of duplicate items in one collection.

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
the repo from here: https://github.com/osvaldo2627/swagger-express-mock-not-found-conflict

### Running the example
> After clone
```
cd swagger-express-mock-not-found-conflict
npm i
npm start
```
>Note: The example launch a swagger-ui for testing: [localhost:3000](http://localhost:3000/api-docs/#/)


## Test
```
npm run test
```