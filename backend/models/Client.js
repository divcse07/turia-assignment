const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  businessEntity: {
    type: String,
    required: [true, 'Business Entity is required'],
    enum: ['proprietorship', 'partnership', 'llp', 'private-limited', 'public-limited']
  },
  businessName: {
    type: String,
    required: [true, 'Business Name is required'],
    trim: true
  },
  contactName: {
    type: String,
    required: [true, 'Contact Name is required'],
    trim: true
  },
  contactNumber: {
    type: String,
    trim: true
  },
  emailId: {
    type: String,
    trim: true,
    lowercase: true
  },
  clientId: {
    type: String,
    trim: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  clientCreationDate: {
    type: Date,
    default: Date.now
  },
  gstin: {
    type: String,
    trim: true,
    uppercase: true
  },
  state: {
    type: String,
    required: [true, 'State is required']
  },
  gstRegistrationType: {
    type: String,
    default: 'Regular'
  },
  pincode: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  addressLine2: {
    type: String,
    trim: true
  },
  gstRegistrationDate: {
    type: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add index for faster queries
clientSchema.index({ gstin: 1 });
clientSchema.index({ businessName: 1 });

module.exports = mongoose.model('Client', clientSchema);
