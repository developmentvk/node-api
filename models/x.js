
// POST /api/returns {customerId, movieId}

// Return 401 if client is not logged in
// Return 400 if customerId is not provided
// Return 400 if movieId is not provided
// Return 404 if no rental found for this customer/movie
// Return 400 if rental already processed
// Return 200 if valid request 
// Set the return date
// Calculate the rental fee (numberOfDays * movie.dailyRentalRate)
// Increase the stock 
// Return the rental 



// for Windows : $env:NODE_ENV="production" 
// for Other: export NODE_ENV="production"
/**
 * $env:NODE_ENV="production"
 * $env:NODE_ENV="development"
 * $env:NODE_ENV="test"
 * $env:app_password=123456
 * $env:nodeapi_jwtPrivateKey=123456
 * heroku config:set nodeapi_jwtPrivateKey=123456
 * heroku config:set NODE_ENV="production"
 * heroku config
 * heroku config:set nodeapi_db=mongodb://<dbuser>:<dbpassword>@ds123454.mlab.com:23454/node-api47
 * git push heroku master
 * $env:DEBUG="app:startup,app:db"
 * $env:DEBUG="app:*"
 * npm i jest --save-dev
 * npm i supertest --save-dev
 * $env:HTTP_PROXY=http://proxy.server.com:1234
 */
// console.log(`NODE_ENV: ${process.env.NODE_ENV}`);

/**
 * Heroku Deployment
 * 1. heroku login
 * 
 */