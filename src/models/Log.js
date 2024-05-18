const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  timestamp: { type: Date, required: true },
  details: { type: Object, required: true },
});

module.exports = mongoose.model('Log', logSchema);
