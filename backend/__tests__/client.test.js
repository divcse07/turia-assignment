const request = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../server');
const Client = require('../models/Client');

describe('Client API Integration Tests', () => {
  let clientId;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect('mongodb://localhost:27017/turia-clients-test');
    }
  });

  afterAll(async () => {
    // Clean up and close connections
    await Client.deleteMany({});
    await mongoose.connection.close();
    server.close();
  });

  beforeEach(async () => {
    // Clear clients before each test
    await Client.deleteMany({});
  });

  describe('POST /api/clients', () => {
    it('should create a new client with valid data', async () => {
      const clientData = {
        businessEntity: 'private-limited',
        businessName: 'Test Company Ltd',
        contactName: 'John Doe',
        state: 'Karnataka',
        gstin: '29AAICT1443M1ZX'
      };

      const response = await request(app)
        .post('/api/clients')
        .send(clientData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.businessName).toBe('Test Company Ltd');
      
      clientId = response.body.data._id;
    });

    it('should return 400 for missing required fields', async () => {
      const invalidData = {
        businessName: 'Test Company'
        // Missing businessEntity, contactName, and state
      };

      const response = await request(app)
        .post('/api/clients')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid GSTIN format', async () => {
      const invalidData = {
        businessEntity: 'private-limited',
        businessName: 'Test Company',
        contactName: 'John Doe',
        state: 'Karnataka',
        gstin: 'INVALID_GSTIN'
      };

      const response = await request(app)
        .post('/api/clients')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/clients', () => {
    beforeEach(async () => {
      // Create test clients
      await Client.create([
        {
          businessEntity: 'private-limited',
          businessName: 'Company A',
          contactName: 'Alice',
          state: 'Karnataka'
        },
        {
          businessEntity: 'partnership',
          businessName: 'Company B',
          contactName: 'Bob',
          state: 'Maharashtra'
        }
      ]);
    });

    it('should return all clients', async () => {
      const response = await request(app)
        .get('/api/clients')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should search clients by name', async () => {
      const response = await request(app)
        .get('/api/clients?search=Company A')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].businessName).toBe('Company A');
    });
  });

  describe('GET /api/clients/:id', () => {
    it('should return a client by ID', async () => {
      const client = await Client.create({
        businessEntity: 'private-limited',
        businessName: 'Test Company',
        contactName: 'John Doe',
        state: 'Karnataka'
      });

      const response = await request(app)
        .get(`/api/clients/${client._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.businessName).toBe('Test Company');
    });

    it('should return 404 for non-existent client', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/clients/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/clients/:id', () => {
    it('should update a client', async () => {
      const client = await Client.create({
        businessEntity: 'private-limited',
        businessName: 'Old Name',
        contactName: 'John Doe',
        state: 'Karnataka'
      });

      const updateData = {
        businessEntity: 'private-limited',
        businessName: 'New Name',
        contactName: 'John Doe',
        state: 'Karnataka'
      };

      const response = await request(app)
        .put(`/api/clients/${client._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.businessName).toBe('New Name');
    });
  });

  describe('DELETE /api/clients/:id', () => {
    it('should delete a client', async () => {
      const client = await Client.create({
        businessEntity: 'private-limited',
        businessName: 'Test Company',
        contactName: 'John Doe',
        state: 'Karnataka'
      });

      const response = await request(app)
        .delete(`/api/clients/${client._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify deletion
      const deletedClient = await Client.findById(client._id);
      expect(deletedClient).toBeNull();
    });
  });

  describe('POST /api/gst/verify', () => {
    it('should verify a valid GSTIN', async () => {
      const response = await request(app)
        .post('/api/gst/verify')
        .send({ gstin: '29AAICT1443M1ZX' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.gstin).toBe('29AAICT1443M1ZX');
      expect(response.body).toHaveProperty('businessName');
    });

    it('should return 400 for invalid GSTIN format', async () => {
      const response = await request(app)
        .post('/api/gst/verify')
        .send({ gstin: 'INVALID' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('ok');
    });
  });
});
