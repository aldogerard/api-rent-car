export const successReq = (res, status, message, data) => {
  res.json({
    status,
    success: true,
    message,
    data,
  });
};

export const failedReq = (res, status, message = "An error occurred!") => {
  res.json({
    status,
    success: false,
    message,
  });
};
