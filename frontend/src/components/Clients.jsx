import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Clients.css'

const API_BASE_URL = 'http://localhost:5000/api'

function Clients() {
  const navigate = useNavigate()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/clients`)
      
      if (response.data.success) {
        setClients(response.data.data)
      }
    } catch (err) {
      console.error('Error fetching clients:', err)
      // Use mock data if API fails
      setClients([
        {
          _id: '1',
          businessName: 'ABC Enterprises',
          contactName: 'John Doe',
          contactNumber: '+91 9876543210',
          emailId: 'john@abc.com',
          state: 'Karnataka',
          gstin: '29ABCDE1234F1Z5'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (clientId) => {
    navigate(`/clients/edit/${clientId}`)
  }

  const handleDelete = async (clientId, businessName) => {
    if (!window.confirm(`Are you sure you want to delete "${businessName}"?`)) {
      return
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/clients/${clientId}`)
      
      if (response.data.success) {
        // Remove from local state
        setClients(clients.filter(client => client._id !== clientId))
        setSnackbarMessage({ type: 'success', text: '✓ Client deleted successfully!' })
        setShowSnackbar(true)
        setTimeout(() => setShowSnackbar(false), 3000)
      }
    } catch (err) {
      console.error('Error deleting client:', err)
      setSnackbarMessage({ type: 'error', text: 'Failed to delete client. Please try again.' })
      setShowSnackbar(true)
      setTimeout(() => setShowSnackbar(false), 3000)
    }
  }

  const filteredClients = clients.filter(client =>
    client.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.emailId.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="clients-container">
        <div className="loading">Loading clients...</div>
      </div>
    )
  }

  return (
    <div className="clients-container">
      <div className="clients-header">
        <h1 style={{color:"white"}}>Clients</h1>
        <button className="add-client-btn" onClick={() => navigate('/clients/add')}>
          + Add Client
        </button>
      </div>

      {/* Snackbar notification */}
      {showSnackbar && (
        <div className={`snackbar show ${snackbarMessage.type === 'error' ? 'error' : ''}`}>
          {snackbarMessage.text}
        </div>
      )}

      <div className="clients-toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      <div className="clients-table-container">
        <table className="clients-table">
          <thead>
            <tr>
              <th>Business Name</th>
              <th>Contact Name</th>
              <th>Contact Number</th>
              <th>Email ID</th>
              <th>State</th>
              <th>GSTIN</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.length > 0 ? (
              filteredClients.map(client => (
                <tr key={client._id}>
                  <td>{client.businessName}</td>
                  <td>{client.contactName}</td>
                  <td>{client.contactNumber || '-'}</td>
                  <td>{client.emailId || '-'}</td>
                  <td>{client.state}</td>
                  <td>{client.gstin || '-'}</td>
                  <td>
                    <button 
                      className="action-btn edit-btn"
                      onClick={() => handleEdit(client._id)}
                    >
                      ✏️ 
                    </button>
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(client._id, client.businessName)}
                    >
                      🗑️ 
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">
                  {searchTerm ? 'No clients found matching your search' : 'No clients yet. Add your first client!'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Clients
