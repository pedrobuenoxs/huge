const response = (
  res,
  statusCode = 200,
  success = false,
  message = "",
  data = {}
) => {
  console.log("response", statusCode, success, message, data);
  res.status(statusCode);
  res.json({
    success,
    message,
    data,
  });

  res.end();
};

export default response;
