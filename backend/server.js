const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const Client = require('./models/Client');
const masterGSTService = require('./services/masterGSTService');
const { clientSchema, gstinSchema } = require('./validators/clientValidator');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/turia-clients';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((error) => {
    console.log('⚠️  MongoDB Connection Failed. Using in-memory storage.');
    console.log('Error:', error.message);
  });

// ==================== CLIENT MANAGEMENT ROUTES ====================

// POST /api/gst/test - Test MasterGST API connection
app.post('/api/gst/test', async (req, res) => {
  try {
    const result = await masterGSTService.testConnection();
    res.json(result);
  } catch (error) {
    console.error('MasterGST Test Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to test MasterGST connection'
    });
  }
});

// POST /api/gst/verify - Verify GSTIN using MasterGST API
app.post('/api/gst/verify', async (req, res) => {
  try {
    // Validate GSTIN format
    const { error, value } = gstinSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const { gstin } = value;

    // Call MasterGST API
    const gstData = await masterGSTService.verifyGSTIN(gstin);

    res.json(gstData);
  } catch (error) {
    console.error('GST Verification Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to verify GSTIN'
    });
  }
});

// POST /api/clients - Create new client
app.post('/api/clients', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = clientSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    // Create new client
    const client = new Client(value);
    await client.save();

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: client
    });
  } catch (error) {
    console.error('Create Client Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create client'
    });
  }
});

// GET /api/clients - Get all clients
app.get('/api/clients', async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const query = {};

    // Add search functionality
    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { contactName: { $regex: search, $options: 'i' } },
        { gstin: { $regex: search, $options: 'i' } }
      ];
    }

    const clients = await Client.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Client.countDocuments(query);

    res.json({
      success: true,
      data: clients,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get Clients Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch clients'
    });
  }
});

// GET /api/clients/:id - Get client by ID
app.get('/api/clients/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error('Get Client Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch client'
    });
  }
});

// PUT /api/clients/:id - Update client
app.put('/api/clients/:id', async (req, res) => {
  try {
    // Validate request body
    const { error, value } = clientSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    const client = await Client.findByIdAndUpdate(
      req.params.id,
      value,
      { new: true, runValidators: true }
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    res.json({
      success: true,
      message: 'Client updated successfully',
      data: client
    });
  } catch (error) {
    console.error('Update Client Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update client'
    });
  }
});

// DELETE /api/clients/:id - Delete client
app.delete('/api/clients/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found'
      });
    }

    res.json({
      success: true,
      message: 'Client deleted successfully',
      data: client
    });
  } catch (error) {
    console.error('Delete Client Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete client'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// For testing
module.exports = { app, server };
