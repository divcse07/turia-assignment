const masterGSTService = require('../services/masterGSTService');

describe('MasterGST Service Unit Tests', () => {
  describe('verifyGSTIN - Valid Test GSTINs', () => {
    it('should return mock data for ICICI BANK test GSTIN', async () => {
      const result = await masterGSTService.verifyGSTIN('29AAICT1443M1ZX');
      
      expect(result).toHaveProperty('success');
      expect(result.success).toBe(true);
      expect(result.gstin).toBe('29AAICT1443M1ZX');
      expect(result.businessName).toBe('ICICI BANK LIMITED');
      expect(result).toHaveProperty('address');
      expect(result).toHaveProperty('state');
      expect(result.isMockData).toBe(true);
    });

    it('should return mock data for AMAZON test GSTIN', async () => {
      const result = await masterGSTService.verifyGSTIN('27AAACT4481M1ZV');
      
      expect(result).toHaveProperty('success');
      expect(result.success).toBe(true);
      expect(result.gstin).toBe('27AAACT4481M1ZV');
      expect(result.businessName).toBe('AMAZON SELLER SERVICES PRIVATE LIMITED');
      expect(result.isMockData).toBe(true);
    });

    it('should return mock data for TCS test GSTIN', async () => {
      const result = await masterGSTService.verifyGSTIN('29AABCT2727Q1ZG');
      
      expect(result).toHaveProperty('success');
      expect(result.success).toBe(true);
      expect(result.gstin).toBe('29AABCT2727Q1ZG');
      expect(result.businessName).toBe('TATA CONSULTANCY SERVICES LIMITED');
      expect(result.isMockData).toBe(true);
    });
  });

  describe('verifyGSTIN - Valid Format but Non-existent GSTIN', () => {
    it('should throw error for valid format but non-existent GSTIN', async () => {
      await expect(
        masterGSTService.verifyGSTIN('27ABCDE1234F1Z5')
      ).rejects.toThrow('GSTIN not found');
    });

    it('should throw error for another non-existent GSTIN', async () => {
      await expect(
        masterGSTService.verifyGSTIN('29XYZAB1234C1Z9')
      ).rejects.toThrow('GSTIN not found');
    });
  });

  describe('verifyGSTIN - Invalid GSTIN Format', () => {
    it('should throw error for too short GSTIN', async () => {
      await expect(
        masterGSTService.verifyGSTIN('29AAICT1443')
      ).rejects.toThrow('Failed to verify GSTIN');
    });

    it('should throw error for too long GSTIN', async () => {
      await expect(
        masterGSTService.verifyGSTIN('29AAICT1443M1ZX123')
      ).rejects.toThrow('Failed to verify GSTIN');
    });

    it('should throw error for lowercase GSTIN', async () => {
      await expect(
        masterGSTService.verifyGSTIN('29aaict1443m1zx')
      ).rejects.toThrow('GSTIN not found');
    });

    it('should throw error for GSTIN with special characters', async () => {
      await expect(
        masterGSTService.verifyGSTIN('29-AICT-1443M1ZX')
      ).rejects.toThrow('Failed to verify GSTIN');
    });

    it('should throw error for invalid random text', async () => {
      await expect(
        masterGSTService.verifyGSTIN('INVALID123')
      ).rejects.toThrow('Failed to verify GSTIN');
    });

    it('should throw error for empty GSTIN', async () => {
      await expect(
        masterGSTService.verifyGSTIN('')
      ).rejects.toThrow('Failed to verify GSTIN');
    });
  });

  describe('getMockGSTData', () => {
    it('should return properly formatted mock data for known GSTIN', () => {
      const result = masterGSTService.getMockGSTData('29AAICT1443M1ZX');
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('gstin');
      expect(result).toHaveProperty('businessName');
      expect(result).toHaveProperty('address');
      expect(result).toHaveProperty('state');
      expect(result).toHaveProperty('pincode');
      expect(result).toHaveProperty('verified');
      expect(result.isMockData).toBe(true);
      expect(result.source).toBe('Mock Data');
    });

    it('should throw error for unknown GSTIN', () => {
      expect(() => {
        masterGSTService.getMockGSTData('27ABCDE1234F1Z5');
      }).toThrow('GSTIN not found');
    });
  });
});
