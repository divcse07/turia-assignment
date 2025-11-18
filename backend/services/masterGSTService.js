const axios = require('axios');

class MasterGSTService {
  constructor() {
    this.baseURL = process.env.MASTERGST_API_URL || 'https://api.mastergst.com';
    this.clientId = process.env.MASTERGST_CLIENT_ID;
    this.clientSecret = process.env.MASTERGST_CLIENT_SECRET;
    this.email = process.env.MASTERGST_EMAIL || 'apisales@mastergst.com';
  }

  /**
   * Verify GSTIN using MasterGST Public API
   * @param {string} gstin - 15 character GSTIN
   */
  async verifyGSTIN(gstin) {
    try {
      console.log(`� Verifying GSTIN: ${gstin}`);
      
      if (!this.clientId || !this.clientSecret) {
        throw new Error('MasterGST credentials not configured. Please set MASTERGST_CLIENT_ID and MASTERGST_CLIENT_SECRET in .env file');
      }

      // Call the public/search endpoint
      const url = `${this.baseURL}/public/search?email=${encodeURIComponent(this.email)}&gstin=${gstin}`;
      const response = await axios.get(url, {
        headers: {
          'Accept': 'application/json',
          'client_id': this.clientId,
          'client_secret': this.clientSecret
        },
        timeout: 15000
      });

      // Check if we got valid data
      if (response.data && response.data.data) {
        const data = response.data.data;
        
        console.log('✅ GSTIN Verified via MasterGST API');
        console.log('Company:', data.lgnm);
        
        return {
          success: true,
          gstin: gstin,
          businessName: data.lgnm || data.tradeNam || '',
          tradeName: data.tradeNam || '',
          address: this.formatAddress(data.pradr?.addr || data.pradr),
          state: data.pradr?.addr?.stcd || data.pradr?.stcd || '',
          pincode: data.pradr?.addr?.pncd || data.pradr?.pncd || '',
          registrationDate: data.rgdt || '',
          status: data.sts || 'Active',
          taxpayerType: data.dty || '',
          constitution: data.ctb || '',
          stateJurisdiction: data.stjCd || '',
          verified: true,
          source: 'MasterGST API',
          rawData: data
        };
      } else if (response.data && response.data.status_cd === "0") {
        // API responded with error
        const errorMsg = response.data.error?.message || response.data.status_desc || 'GSTIN verification failed';
        
        // Check for specific backend connectivity issues
        if (errorMsg.includes('UnknownHostException') || errorMsg.includes('devapi.gst.gov.in')) {
          console.log('⚠️  MasterGST backend cannot connect to GST portal');
          throw new Error('GST portal is temporarily unavailable. Please try again later.');
        }
        
        console.log('⚠️  MasterGST API Error:', errorMsg);
        throw new Error(errorMsg);
      } else {
        console.log('⚠️  GSTIN not found in MasterGST database');
        throw new Error('GSTIN not found. Please verify the GSTIN number.');
      }
      
    } catch (error) {
      console.error('❌ GSTIN Verification Error:', error.response?.data || error.message);
      
      // If it's already our formatted error, rethrow it
      if (error.message && !error.response) {
        throw error;
      }
      
      // Handle API errors
      if (error.response?.data) {
        const apiError = error.response.data;
        
        // Check for backend connectivity issues
        if (apiError.error?.message?.includes('UnknownHostException') || 
            apiError.error?.message?.includes('devapi.gst.gov.in')) {
          throw new Error('GST portal is temporarily unavailable. Please try again later.');
        }
        
        if (apiError.status_desc) {
          throw new Error(apiError.status_desc);
        }
        if (apiError.error?.message) {
          throw new Error(apiError.error.message);
        }
      }
      
      throw new Error('Failed to verify GSTIN. Please check the GSTIN number and try again.');
    }
  }

  /**
   * Format address from MasterGST API response
   */
  formatAddress(addressObj) {
    if (!addressObj) return '';
    
    const parts = [
      addressObj.bno,
      addressObj.bnm,
      addressObj.flno,
      addressObj.st,
      addressObj.loc,
      addressObj.locality,
      addressObj.dst,
      addressObj.stcd,
      addressObj.pncd
    ];
    
    return parts.filter(p => p).join(', ');
  }
}

module.exports = new MasterGSTService();
