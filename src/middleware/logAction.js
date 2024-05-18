const Log = require('../models/Log');

const logAction = (action) => {
  return async (req, res, next) => {
    try {
      const log = new Log({
        userId: req.user ? req.user.userId : null,
        action,
        timestamp: new Date(),
        details: req.body,
        ip: req.ip,
      });
      await log.save();
      next();
    } catch (error) {
      console.error('Error logging action:', error);
      next();
    }
  };
};

module.exports = logAction;
