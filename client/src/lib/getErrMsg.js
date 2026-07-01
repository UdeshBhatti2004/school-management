export const getErrMsg = (err) =>
  err?.data?.message || err?.message || 'Something went wrong';