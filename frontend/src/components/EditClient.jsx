import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import './AddClient.css'

const API_BASE_URL = 'http://localhost:5000/api'

function EditClient() {
  const navigate = useNavigate()
  const { id } = useParams()
  
  const [formData, setFormData] = useState({
    businessEntity: '',
    businessName: '',
    contactName: '',
    contactNumber: '',
    emailId: '',
    clientId: '',
    currency: 'INR',
    clientCreationDate: '',
    gstin: '',
    state: 'Karnataka',
    gstRegistrationType: 'Regular',
    pincode: '',
    address: '',
    addressLine2: '',
    gstRegistrationDate: ''
  })

  const [activeTab, setActiveTab] = useState('details')
  const [gstinVerified, setGstinVerified] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showSnackbar, setShowSnackbar] = useState(false)

  useEffect(() => {
    fetchClient()
  }, [id])

  const fetchClient = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/clients/${id}`)
      
      if (response.data.success) {
        const client = response.data.data
        setFormData({
          businessEntity: client.businessEntity || '',
          businessName: client.businessName || '',
          contactName: client.contactName || '',
          contactNumber: client.contactNumber || '',
          emailId: client.emailId || '',
          clientId: client.clientId || '',
          currency: client.currency || 'INR',
          clientCreationDate: client.clientCreationDate ? client.clientCreationDate.split('T')[0] : '',
          gstin: client.gstin || '',
          state: client.state || 'Karnataka',
          gstRegistrationType: client.gstRegistrationType || 'Regular',
          pincode: client.pincode || '',
          address: client.address || '',
          addressLine2: client.addressLine2 || '',
          gstRegistrationDate: client.gstRegistrationDate ? client.gstRegistrationDate.split('T')[0] : ''
        })
        if (client.gstin) {
          setGstinVerified(true)
        }
      }
    } catch (err) {
      console.error('Error fetching client:', err)
      setMessage({ type: 'error', text: 'Failed to load client data' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Reset GSTIN verification if GSTIN is changed
    if (name === 'gstin' && gstinVerified) {
      setGstinVerified(false)
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.businessEntity) {
      newErrors.businessEntity = 'Business Entity is required'
    }
    if (!formData.businessName || formData.businessName.trim().length < 2) {
      newErrors.businessName = 'Business Name is required (min 2 characters)'
    }
    if (!formData.contactName || formData.contactName.trim().length < 2) {
      newErrors.contactName = 'Contact Name is required (min 2 characters)'
    }
    if (!formData.state) {
      newErrors.state = 'State is required'
    }
    if (formData.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstin)) {
      newErrors.gstin = 'Invalid GSTIN format'
    }
    if (formData.gstin && !gstinVerified) {
      newErrors.gstin = 'Please verify GSTIN before saving'
    }
    if (formData.emailId && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailId)) {
      newErrors.emailId = 'Invalid email format'
    }
    if (formData.pincode && !/^[0-9]{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits'
    }
    if (formData.contactNumber && !/^[0-9]{10}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Contact number must be exactly 10 digits'
    }
    if (formData.gstRegistrationDate && isNaN(Date.parse(formData.gstRegistrationDate))) {
      newErrors.gstRegistrationDate = 'Invalid date format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleVerifyGSTIN = async () => {
    if (!formData.gstin) {
      setMessage({ type: 'error', text: 'Please enter GSTIN first' })
      return
    }

    if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstin)) {
      setMessage({ type: 'error', text: 'Invalid GSTIN format. GSTIN must be 15 characters.' })
      setErrors(prev => ({ ...prev, gstin: 'Invalid GSTIN format' }))
      return
    }

    setVerifying(true)
    setMessage({ type: '', text: '' })
    setErrors(prev => ({ ...prev, gstin: '' }))

    try {
      const response = await axios.post(`${API_BASE_URL}/gst/verify`, {
        gstin: formData.gstin
      })

      if (response.data.success) {
        // Auto-fill data from GST API
        setFormData(prev => ({
          ...prev,
          businessName: response.data.businessName || prev.businessName,
          address: response.data.address || prev.address,
          state: response.data.state || prev.state,
          pincode: response.data.pincode || prev.pincode,
          gstRegistrationDate: response.data.registrationDate || prev.gstRegistrationDate
        }))
        
        setGstinVerified(true)
        setErrors(prev => ({ ...prev, gstin: '' }))
        setMessage({ type: 'success', text: '✓ GSTIN verified successfully! Business details auto-filled.' })
      }
    } catch (error) {
      console.error('GSTIN Verification Error:', error)
      const errorMsg = error.response?.data?.error || 'Failed to verify GSTIN. Please try again.'
      setMessage({ 
        type: 'error', 
        text: errorMsg
      })
      setErrors(prev => ({ ...prev, gstin: errorMsg }))
      setGstinVerified(false)
    } finally {
      setVerifying(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Please fix the validation errors' })
      setShowSnackbar(true)
      setTimeout(() => setShowSnackbar(false), 3000)
      return
    }

    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await axios.put(`${API_BASE_URL}/clients/${id}`, formData)

      if (response.data.success) {
        setMessage({ type: 'success', text: '✓ Client updated successfully!' })
        setShowSnackbar(true)
        
        // Hide snackbar and navigate after 2 seconds
        setTimeout(() => {
          setShowSnackbar(false)
          navigate('/')
        }, 2000)
      }
    } catch (error) {
      console.error('Update Client Error:', error)
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to update client. Please try again.' 
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All changes will be lost.')) {
      navigate('/')
    }
  }

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ]

  if (loading) {
    return (
      <div className="add-client-container">
        <div className="loading">Loading client data...</div>
      </div>
    )
  }

  return (
    <div className="add-client-container">
      <div className="add-client-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Clients
        </button>
        <h1>Edit Client</h1>
      </div>

      {message.text && (
        <div className={`message-banner ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Snackbar notification */}
      {showSnackbar && (
        <div className={`snackbar show ${message.type === 'error' ? 'error' : ''}`}>
          {message.type === 'success' ? '✓ Client updated successfully!' : message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="add-client-form">
        {/* Main Details Section */}
        <div className="form-section">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="businessEntity">
                Business Entity <span className="required">*</span>
              </label>
              <select
                id="businessEntity"
                name="businessEntity"
                value={formData.businessEntity}
                onChange={handleChange}
                required
                className={errors.businessEntity ? 'error' : ''}
              >
                <option value="">Select..</option>
                <option value="proprietorship">Proprietorship</option>
                <option value="partnership">Partnership</option>
                <option value="llp">LLP</option>
                <option value="private-limited">Private Limited</option>
                <option value="public-limited">Public Limited</option>
              </select>
              {errors.businessEntity && <span className="error-text">{errors.businessEntity}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="businessName">
                Business Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Business Name"
                required
                className={errors.businessName ? 'error' : ''}
              />
              {errors.businessName && <span className="error-text">{errors.businessName}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="contactName">
                Contact Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="contactName"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                placeholder="Contact Name"
                required
                className={errors.contactName ? 'error' : ''}
              />
              {errors.contactName && <span className="error-text">{errors.contactName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="contactNumber">Contact Number</label>
              <input
                type="tel"
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="Contact Number"
                maxLength="10"
                className={errors.contactNumber ? 'error' : ''}
              />
              {errors.contactNumber && <span className="error-text">{errors.contactNumber}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="emailId">Email ID</label>
              <input
                type="email"
                id="emailId"
                name="emailId"
                value={formData.emailId}
                onChange={handleChange}
                placeholder="Email ID"
                className={errors.emailId ? 'error' : ''}
              />
              {errors.emailId && <span className="error-text">{errors.emailId}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="clientId">Client ID</label>
              <input
                type="text"
                id="clientId"
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                placeholder="Client ID"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="currency">Currency</label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
              >
                <option value="INR">Rupees INR ₹</option>
                <option value="USD">US Dollar USD $</option>
                <option value="EUR">Euro EUR €</option>
                <option value="GBP">British Pound GBP £</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="clientCreationDate">Client Creation Date</label>
              <input
                type="date"
                id="clientCreationDate"
                name="clientCreationDate"
                value={formData.clientCreationDate}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            type="button"
            className={`tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Other Details
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'additional' ? 'active' : ''}`}
            onClick={() => setActiveTab('additional')}
          >
            /
          </button>
        </div>

        {/* Other Details Section */}
        {activeTab === 'details' && (
          <div className="form-section other-details">
            <div className="form-row">
              <div className="form-group gstin-group">
                <label htmlFor="gstin">GSTIN</label>
                <div className="input-with-button">
                  <input
                    type="text"
                    id="gstin"
                    name="gstin"
                    value={formData.gstin}
                    onChange={handleChange}
                    placeholder="GSTIN"
                    maxLength="15"
                    className={errors.gstin ? 'error' : gstinVerified ? 'verified' : ''}
                  />
                  <button
                    type="button"
                    className="verify-button"
                    onClick={handleVerifyGSTIN}
                    disabled={verifying || !formData.gstin}
                  >
                    {verifying ? '⏳ Verifying...' : '✓ Verify'}
                  </button>
                </div>
                {errors.gstin && <span className="error-text">{errors.gstin}</span>}
                {gstinVerified && <span className="success-text">✓ Verified</span>}
              </div>

              <div className="form-group">
                <label htmlFor="state">
                  State <span className="required">*</span>
                </label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className={errors.state ? 'error' : ''}
                >
                  {indianStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {errors.state && <span className="error-text">{errors.state}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="gstRegistrationType">GST Registration Type</label>
                <input
                  type="text"
                  id="gstRegistrationType"
                  name="gstRegistrationType"
                  value={formData.gstRegistrationType}
                  onChange={handleChange}
                  placeholder="Regular"
                />
              </div>

              <div className="form-group">
                <label htmlFor="pincode">Pincode</label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder=""
                  maxLength="6"
                  className={errors.pincode ? 'error' : ''}
                />
                {errors.pincode && <span className="error-text">{errors.pincode}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder=""
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="addressLine2">Addres Line 2</label>
                <input
                  type="text"
                  id="addressLine2"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  placeholder=""
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="gstRegistrationDate">GST Registration Date</label>
                <input
                  type="date"
                  id="gstRegistrationDate"
                  name="gstRegistrationDate"
                  value={formData.gstRegistrationDate}
                  onChange={handleChange}
                  placeholder="DD/MM/YYYY"
                  className={errors.gstRegistrationDate ? 'error' : ''}
                />
                {errors.gstRegistrationDate && <span className="error-text">{errors.gstRegistrationDate}</span>}
              </div>
              <div className="form-group"></div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={handleCancel} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="save-button" disabled={saving}>
            {saving ? 'Updating...' : 'Update'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditClient
