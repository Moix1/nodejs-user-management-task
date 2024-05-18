const Log = require('../models/Log');

const logAction = (action) => {
  return async (req, res, next) => {
    try {
      const log = new Log({
        userId: req.user._id,
        action,
        data: req.body,
      });
      await log.save();
    } catch (error) {
      console.error('Failed to log action:', error);
    }
    next();
  };
};

module.exports = logAction;
