const { clientSchema, gstinSchema } = require('../validators/clientValidator');

describe('Client Validator Unit Tests', () => {
  describe('clientSchema', () => {
    it('should validate correct client data', () => {
      const validData = {
        businessEntity: 'private-limited',
        businessName: 'Test Company',
        contactName: 'John Doe',
        state: 'Karnataka'
      };

      const { error } = clientSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        businessName: 'Test Company'
        // Missing businessEntity, contactName, state
      };

      const { error } = clientSchema.validate(invalidData);
      expect(error).toBeDefined();
    });

    it('should validate GSTIN format', () => {
      const dataWithInvalidGSTIN = {
        businessEntity: 'private-limited',
        businessName: 'Test Company',
        contactName: 'John Doe',
        state: 'Karnataka',
        gstin: 'INVALID_FORMAT'
      };

      const { error } = clientSchema.validate(dataWithInvalidGSTIN);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('GSTIN');
    });

    it('should validate email format', () => {
      const dataWithInvalidEmail = {
        businessEntity: 'private-limited',
        businessName: 'Test Company',
        contactName: 'John Doe',
        state: 'Karnataka',
        emailId: 'invalid-email'
      };

      const { error } = clientSchema.validate(dataWithInvalidEmail);
      expect(error).toBeDefined();
    });

    it('should validate pincode format', () => {
      const dataWithInvalidPincode = {
        businessEntity: 'private-limited',
        businessName: 'Test Company',
        contactName: 'John Doe',
        state: 'Karnataka',
        pincode: '123' // Should be 6 digits
      };

      const { error } = clientSchema.validate(dataWithInvalidPincode);
      expect(error).toBeDefined();
    });
  });

  describe('gstinSchema', () => {
    it('should validate correct GSTIN format', () => {
      const validGSTIN = { gstin: '29AAICT1443M1ZX' };
      const { error } = gstinSchema.validate(validGSTIN);
      expect(error).toBeUndefined();
    });

    it('should reject invalid GSTIN format', () => {
      const invalidGSTIN = { gstin: 'INVALID' };
      const { error } = gstinSchema.validate(invalidGSTIN);
      expect(error).toBeDefined();
    });

    it('should reject empty GSTIN', () => {
      const emptyGSTIN = { gstin: '' };
      const { error } = gstinSchema.validate(emptyGSTIN);
      expect(error).toBeDefined();
    });
  });
});
