
// It overrides default express error handler
function handleError(err, req, res, next){

  // if res has statusCode set then send that else 500(server error)
  const statusCode = res.statusCode? res.statusCode : 500;

  res.status(statusCode)
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV == 'production' ? null : err.stack 
  })
}

module.exports = {
  handleError,
}