const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // Serve static files

// Utility functions for file operations
const readDataFromFile = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading data file:', error);
        return { pets: [], volunteers: [], donations: [] };
    }
};

const writeDataToFile = (data) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing data file:', error);
        return false;
    }
};

// Helper function to generate new ID
const generateId = (array) => {
    return array.length > 0 ? Math.max(...array.map(item => item.id)) + 1 : 1;
};

// Helper function to filter data based on query parameters
const filterData = (data, queryParams) => {
    return data.filter(item => {
        for (const [key, value] of Object.entries(queryParams)) {
            if (key === '_limit') continue; // Skip limit parameter
            if (item[key] && item[key].toString().toLowerCase().includes(value.toLowerCase())) {
                continue;
            } else {
                return false;
            }
        }
        return true;
    });
};

// Routes for serving HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/service.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'service.html'));
});

app.get('/availpets.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'availpets.html'));
});

// API Routes

// Welcome endpoint
app.get('/api', (req, res) => {
    res.json({
        message: 'Welcome to Pawtner Hope Foundation API',
        version: '2.0.0',
        endpoints: {
            'GET /api/pets': 'Get all pets with optional filters',
            'POST /api/pets': 'Create a new pet',
            'PUT /api/pets/:id': 'Update a pet by ID',
            'DELETE /api/pets/:id': 'Delete a pet by ID',
            'GET /api/volunteers': 'Get all volunteers with optional filters',
            'POST /api/volunteers': 'Create a new volunteer',
            'PUT /api/volunteers/:id': 'Update a volunteer by ID',
            'DELETE /api/volunteers/:id': 'Delete a volunteer by ID',
            'GET /api/donations': 'Get all donations with optional filters',
            'POST /api/donations': 'Create a new donation',
            'PUT /api/donations/:id': 'Update a donation by ID',
            'DELETE /api/donations/:id': 'Delete a donation by ID',
            'GET /api/stats': 'Get statistics'
        }
    });
});

// PETS CRUD Operations

// GET all pets with filtering
app.get('/api/pets', (req, res) => {
    try {
        const data = readDataFromFile();
        let pets = data.pets || [];

        // Apply filters
        const { _limit, ...filters } = req.query;
        if (Object.keys(filters).length > 0) {
            pets = filterData(pets, filters);
        }

        // Apply limit
        if (_limit) {
            pets = pets.slice(0, parseInt(_limit));
        }

        res.json({
            success: true,
            count: pets.length,
            data: pets
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching pets',
            error: error.message
        });
    }
});

// GET single pet by ID
app.get('/api/pets/:id', (req, res) => {
    try {
        const data = readDataFromFile();
        const pet = data.pets.find(p => p.id === parseInt(req.params.id));
        
        if (!pet) {
            return res.status(404).json({
                success: false,
                message: 'Pet not found'
            });
        }

        res.json({
            success: true,
            data: pet
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching pet',
            error: error.message
        });
    }
});

// POST create new pet
app.post('/api/pets', (req, res) => {
    try {
        const { name, type, breed, age, status, location, description } = req.body;

        // Validation
        if (!name || !type || !breed || !age || !status || !location) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, type, breed, age, status, location'
            });
        }

        const data = readDataFromFile();
        const newPet = {
            id: generateId(data.pets),
            name,
            type,
            breed,
            age: parseInt(age),
            status,
            location,
            description: description || ''
        };

        data.pets.push(newPet);
        
        if (writeDataToFile(data)) {
            res.status(201).json({
                success: true,
                message: 'Pet created successfully',
                data: newPet
            });
        } else {
            throw new Error('Failed to save data');
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating pet',
            error: error.message
        });
    }
});

// PUT update pet by ID
app.put('/api/pets/:id', (req, res) => {
    try {
        const petId = parseInt(req.params.id);
        const updates = req.body;

        const data = readDataFromFile();
        const petIndex = data.pets.findIndex(p => p.id === petId);

        if (petIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Pet not found'
            });
        }

        // Update pet with new data
        data.pets[petIndex] = { ...data.pets[petIndex], ...updates, id: petId };

        if (writeDataToFile(data)) {
            res.json({
                success: true,
                message: 'Pet updated successfully',
                data: data.pets[petIndex]
            });
        } else {
            throw new Error('Failed to save data');
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating pet',
            error: error.message
        });
    }
});

// DELETE pet by ID
app.delete('/api/pets/:id', (req, res) => {
    try {
        const petId = parseInt(req.params.id);
        const data = readDataFromFile();
        const petIndex = data.pets.findIndex(p => p.id === petId);

        if (petIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Pet not found'
            });
        }

        const deletedPet = data.pets.splice(petIndex, 1)[0];

        if (writeDataToFile(data)) {
            res.json({
                success: true,
                message: 'Pet deleted successfully',
                data: deletedPet
            });
        } else {
            throw new Error('Failed to save data');
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting pet',
            error: error.message
        });
    }
});

// VOLUNTEERS CRUD Operations

// GET all volunteers with filtering
app.get('/api/volunteers', (req, res) => {
    try {
        const data = readDataFromFile();
        let volunteers = data.volunteers || [];

        // Apply filters
        const { _limit, ...filters } = req.query;
        if (Object.keys(filters).length > 0) {
            volunteers = filterData(volunteers, filters);
        }

        // Apply limit
        if (_limit) {
            volunteers = volunteers.slice(0, parseInt(_limit));
        }

        res.json({
            success: true,
            count: volunteers.length,
            data: volunteers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching volunteers',
            error: error.message
        });
    }
});

// GET single volunteer by ID
app.get('/api/volunteers/:id', (req, res) => {
    try {
        const data = readDataFromFile();
        const volunteer = data.volunteers.find(v => v.id === parseInt(req.params.id));
        
        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: 'Volunteer not found'
            });
        }

        res.json({
            success: true,
            data: volunteer
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching volunteer',
            error: error.message
        });
    }
});

// POST create new volunteer
app.post('/api/volunteers', (req, res) => {
    try {
        const { name, role, experience, location, contact } = req.body;

        // Validation
        if (!name || !role || !experience || !location || !contact) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, role, experience, location, contact'
            });
        }

        const data = readDataFromFile();
        const newVolunteer = {
            id: generateId(data.volunteers),
            name,
            role,
            experience: parseInt(experience),
            location,
            contact
        };

        data.volunteers.push(newVolunteer);
        
        if (writeDataToFile(data)) {
            res.status(201).json({
                success: true,
                message: 'Volunteer created successfully',
                data: newVolunteer
            });
        } else {
            throw new Error('Failed to save data');
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating volunteer',
            error: error.message
        });
    }
});

// PUT update volunteer by ID
app.put('/api/volunteers/:id', (req, res) => {
    try {
        const volunteerId = parseInt(req.params.id);
        const updates = req.body;

        const data = readDataFromFile();
        const volunteerIndex = data.volunteers.findIndex(v => v.id === volunteerId);

        if (volunteerIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Volunteer not found'
            });
        }

        // Update volunteer with new data
        data.volunteers[volunteerIndex] = { ...data.volunteers[volunteerIndex], ...updates, id: volunteerId };

        if (writeDataToFile(data)) {
            res.json({
                success: true,
                message: 'Volunteer updated successfully',
                data: data.volunteers[volunteerIndex]
            });
        } else {
            throw new Error('Failed to save data');
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating volunteer',
            error: error.message
        });
    }
});

// DELETE volunteer by ID
app.delete('/api/volunteers/:id', (req, res) => {
    try {
        const volunteerId = parseInt(req.params.id);
        const data = readDataFromFile();
        const volunteerIndex = data.volunteers.findIndex(v => v.id === volunteerId);

        if (volunteerIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Volunteer not found'
            });
        }

        const deletedVolunteer = data.volunteers.splice(volunteerIndex, 1)[0];

        if (writeDataToFile(data)) {
            res.json({
                success: true,
                message: 'Volunteer deleted successfully',
                data: deletedVolunteer
            });
        } else {
            throw new Error('Failed to save data');
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting volunteer',
            error: error.message
        });
    }
});

// DONATIONS CRUD Operations

// GET all donations with filtering
app.get('/api/donations', (req, res) => {
    try {
        const data = readDataFromFile();
        let donations = data.donations || [];

        // Apply filters
        const { _limit, ...filters } = req.query;
        if (Object.keys(filters).length > 0) {
            donations = filterData(donations, filters);
        }

        // Apply limit
        if (_limit) {
            donations = donations.slice(0, parseInt(_limit));
        }

        res.json({
            success: true,
            count: donations.length,
            data: donations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching donations',
            error: error.message
        });
    }
});

// GET single donation by ID
app.get('/api/donations/:id', (req, res) => {
    try {
        const data = readDataFromFile();
        const donation = data.donations.find(d => d.id === parseInt(req.params.id));
        
        if (!donation) {
            return res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
        }

        res.json({
            success: true,
            data: donation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching donation',
            error: error.message
        });
    }
});

// POST create new donation
app.post('/api/donations', (req, res) => {
    try {
        const { donorName, amount, type, purpose, date } = req.body;

        // Validation
        if (!donorName || !amount || !type || !purpose) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: donorName, amount, type, purpose'
            });
        }

        const data = readDataFromFile();
        const newDonation = {
            id: generateId(data.donations),
            donorName,
            amount: parseFloat(amount),
            type,
            purpose,
            date: date || new Date().toISOString().split('T')[0]
        };

        data.donations.push(newDonation);
        
        if (writeDataToFile(data)) {
            res.status(201).json({
                success: true,
                message: 'Donation created successfully',
                data: newDonation
            });
        } else {
            throw new Error('Failed to save data');
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating donation',
            error: error.message
        });
    }
});

// PUT update donation by ID
app.put('/api/donations/:id', (req, res) => {
    try {
        const donationId = parseInt(req.params.id);
        const updates = req.body;

        const data = readDataFromFile();
        const donationIndex = data.donations.findIndex(d => d.id === donationId);

        if (donationIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
        }

        // Update donation with new data
        data.donations[donationIndex] = { ...data.donations[donationIndex], ...updates, id: donationId };

        if (writeDataToFile(data)) {
            res.json({
                success: true,
                message: 'Donation updated successfully',
                data: data.donations[donationIndex]
            });
        } else {
            throw new Error('Failed to save data');
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating donation',
            error: error.message
        });
    }
});

// DELETE donation by ID
app.delete('/api/donations/:id', (req, res) => {
    try {
        const donationId = parseInt(req.params.id);
        const data = readDataFromFile();
        const donationIndex = data.donations.findIndex(d => d.id === donationId);

        if (donationIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
        }

        const deletedDonation = data.donations.splice(donationIndex, 1)[0];

        if (writeDataToFile(data)) {
            res.json({
                success: true,
                message: 'Donation deleted successfully',
                data: deletedDonation
            });
        } else {
            throw new Error('Failed to save data');
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting donation',
            error: error.message
        });
    }
});

// STATISTICS endpoint
app.get('/api/stats', (req, res) => {
    try {
        const data = readDataFromFile();
        const stats = {
            totalPets: data.pets.length,
            availablePets: data.pets.filter(p => p.status === 'Available').length,
            adoptedPets: data.pets.filter(p => p.status === 'Adopted').length,
            fosterPets: data.pets.filter(p => p.status === 'Foster Care').length,
            totalVolunteers: data.volunteers.length,
            totalDonations: data.donations.reduce((sum, d) => sum + d.amount, 0),
            donationCount: data.donations.length,
            donationsByType: data.donations.reduce((acc, d) => {
                acc[d.type] = (acc[d.type] || 0) + 1;
                return acc;
            }, {}),
            petsByType: data.pets.reduce((acc, p) => {
                acc[p.type] = (acc[p.type] || 0) + 1;
                return acc;
            }, {}),
            volunteersByRole: data.volunteers.reduce((acc, v) => {
                acc[v.role] = (acc[v.role] || 0) + 1;
                return acc;
            }, {})
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics',
            error: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        availableEndpoints: '/api'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🐾 Pawtner Hope Foundation API Server running on http://localhost:${PORT}`);
    console.log(`🌐 Open your browser and go to: http://localhost:${PORT}`);
    console.log('\n📋 Available HTML Pages:');
    console.log('- GET / or /index.html - Home page');
    console.log('- GET /service.html - Services page');
    console.log('- GET /availpets.html - Available pets page');
    console.log('\n🔗 API Endpoints:');
    console.log('- GET /api - API information');
    console.log('\n🐕 PETS CRUD:');
    console.log('- GET /api/pets - Get all pets (supports filters: type, breed, status, location, age)');
    console.log('- GET /api/pets/:id - Get pet by ID');
    console.log('- POST /api/pets - Create new pet');
    console.log('- PUT /api/pets/:id - Update pet');
    console.log('- DELETE /api/pets/:id - Delete pet');
    console.log('\n👥 VOLUNTEERS CRUD:');
    console.log('- GET /api/volunteers - Get all volunteers (supports filters: role, location, experience)');
    console.log('- GET /api/volunteers/:id - Get volunteer by ID');
    console.log('- POST /api/volunteers - Create new volunteer');
    console.log('- PUT /api/volunteers/:id - Update volunteer');
    console.log('- DELETE /api/volunteers/:id - Delete volunteer');
    console.log('\n💝 DONATIONS CRUD:');
    console.log('- GET /api/donations - Get all donations (supports filters: type, amount, donorName)');
    console.log('- GET /api/donations/:id - Get donation by ID');
    console.log('- POST /api/donations - Create new donation');
    console.log('- PUT /api/donations/:id - Update donation');
    console.log('- DELETE /api/donations/:id - Delete donation');
    console.log('\n📊 STATISTICS:');
    console.log('- GET /api/stats - Get comprehensive statistics');
    console.log('\n📁 Data is stored in: data.json');
    console.log('🚀 Ready to serve requests!');
});
