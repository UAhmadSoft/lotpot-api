// apply restricting to specific members
const AppError = require('../utils/appError');
module.exports = (...role) => {
  //  roles is an array like ['admin','lead-guide'] using res-parameter syntax
  return (req, res, next) => {
    if (!role.includes(req.user.role)) {
      return next(
        new AppError(' you do not have permission to perform this action', 403)
      );
    }
    next();
  };
};
