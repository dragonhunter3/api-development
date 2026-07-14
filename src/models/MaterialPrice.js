const mongoose = require('mongoose');

const materialPriceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    material: {
      type: String,
      required: true,
      enum: ['Cement', 'Steel', 'Sand', 'Bricks'],
    },
    price: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    change: {
      type: String,
      default: '0%',
    },
    trend: {
      type: String,
      enum: ['up', 'down', 'stable'],
      default: 'stable',
    },
    currency: {
      type: String,
      enum: ['PKR', 'USD', 'AED'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user has only one rate per material per currency
materialPriceSchema.index({ userId: 1, material: 1, currency: 1 }, { unique: true });

const MaterialPrice = mongoose.model('MaterialPrice', materialPriceSchema);

module.exports = MaterialPrice;
