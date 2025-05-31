const mongoose = require('mongoose');

const requiredIfSeller = (fieldName) => ({
  validator: function (value) {
    return this.role !== 'seller' || (value && value.length > 0);
  },
  message: (props) => `${props.path} is required for sellers`
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  role: {
    type: String,
    enum: ['admin', 'seller', 'buyer'],
    default: 'buyer',
    required: true
  },

  storename: { type: String, validate: requiredIfSeller('storename') },
  idNumber: { type: String, validate: requiredIfSeller('idNumber') },
  photoID: { type: String, validate: requiredIfSeller('photoID') },
  realPhoto: { type: String, validate: requiredIfSeller('realPhoto') },
  country: { type: String, validate: requiredIfSeller('country') },
  storeAddress: { type: String, validate: requiredIfSeller('storeAddress') },
  phone: {
    type: String,
    validate: {
      validator: function (value) {
        return this.role !== 'seller' || /^\+\d{10,15}$/.test(value);
      },
      message: 'Valid phone number with country code is required for sellers'
    }
  }
});

module.exports = mongoose.model('User', userSchema);
