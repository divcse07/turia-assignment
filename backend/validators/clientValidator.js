const Joi = require('joi');

const clientSchema = Joi.object({
  businessEntity: Joi.string()
    .valid('proprietorship', 'partnership', 'llp', 'private-limited', 'public-limited')
    .required()
    .messages({
      'any.required': 'Business Entity is required',
      'any.only': 'Invalid Business Entity type'
    }),
  
  businessName: Joi.string()
    .min(2)
    .max(200)
    .required()
    .messages({
      'any.required': 'Business Name is required',
      'string.min': 'Business Name must be at least 2 characters',
      'string.max': 'Business Name cannot exceed 200 characters'
    }),
  
  contactName: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'any.required': 'Contact Name is required',
      'string.min': 'Contact Name must be at least 2 characters'
    }),
  
  contactNumber: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .allow('', null)
    .messages({
      'string.pattern.base': 'Contact number must be exactly 10 digits'
    }),
  
  emailId: Joi.string()
    .email()
    .allow('', null)
    .messages({
      'string.email': 'Invalid email format'
    }),
  
  clientId: Joi.string()
    .allow('', null),
  
  currency: Joi.string()
    .default('INR'),
  
  clientCreationDate: Joi.date()
    .default(() => new Date())
    .messages({
      'date.base': 'Client Creation Date must be a valid date'
    }),
  
  gstin: Joi.string()
    .pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .allow('', null)
    .messages({
      'string.pattern.base': 'Invalid GSTIN format'
    }),
  
  state: Joi.string()
    .required()
    .messages({
      'any.required': 'State is required'
    }),
  
  gstRegistrationType: Joi.string()
    .allow('', null),
  
  pincode: Joi.string()
    .pattern(/^[0-9]{6}$/)
    .allow('', null)
    .messages({
      'string.pattern.base': 'Pincode must be 6 digits'
    }),
  
  address: Joi.string()
    .max(500)
    .allow('', null),
  
  addressLine2: Joi.string()
    .max(500)
    .allow('', null),
  
  gstRegistrationDate: Joi.date()
    .allow('', null)
    .empty('')
    .messages({
      'date.base': 'GST Registration Date must be a valid date'
    }),
  
  isVerified: Joi.boolean()
    .default(false)
});

const gstinSchema = Joi.object({
  gstin: Joi.string()
    .pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .required()
    .messages({
      'any.required': 'GSTIN is required',
      'string.pattern.base': 'Invalid GSTIN format. GSTIN must be 15 characters.'
    })
});

module.exports = {
  clientSchema,
  gstinSchema
};
