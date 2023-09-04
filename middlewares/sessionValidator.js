const validate = (req, res, next) => {
  const sessionId = req.query.id ?? req.params.id;

  console.log("done");

  res.locals.sessionId = sessionId;
  next();
};

export default validate;
