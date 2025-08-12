const http = require('http');
const url = require('url');
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');

// Sample data for Pet NGO
const pets = [
    { id: 1, name: 'Buddy', type: 'Dog', breed: 'Golden Retriever', age: 3, status: 'Available', location: 'Mumbai', description: 'Friendly and energetic dog looking for a loving home' },
    { id: 2, name: 'Whiskers', type: 'Cat', breed: 'Persian', age: 2, status: 'Adopted', location: 'Delhi', description: 'Calm and affectionate cat, great with children' },
    { id: 3, name: 'Charlie', type: 'Dog', breed: 'Labrador', age: 1, status: 'Available', location: 'Bangalore', description: 'Young and playful puppy, needs training' },
    { id: 4, name: 'Mittens', type: 'Cat', breed: 'Siamese', age: 4, status: 'Available', location: 'Chennai', description: 'Independent cat, perfect for busy professionals' },
    { id: 5, name: 'Rocky', type: 'Dog', breed: 'German Shepherd', age: 5, status: 'Available', location: 'Pune', description: 'Well-trained guard dog, loyal and protective' },
    { id: 6, name: 'Luna', type: 'Cat', breed: 'Maine Coon', age: 3, status: 'Available', location: 'Hyderabad', description: 'Large and gentle cat, loves to cuddle' },
    { id: 7, name: 'Max', type: 'Dog', breed: 'Beagle', age: 2, status: 'Foster Care', location: 'Kolkata', description: 'Recovering from injury, needs temporary home' },
    { id: 8, name: 'Shadow', type: 'Cat', breed: 'Black Cat', age: 1, status: 'Available', location: 'Ahmedabad', description: 'Playful kitten, loves toys and attention' },
    { id: 9, name: 'Bella', type: 'Dog', breed: 'Poodle', age: 4, status: 'Available', location: 'Jaipur', description: 'Hypoallergenic breed, great for families with allergies' },
    { id: 10, name: 'Smokey', type: 'Cat', breed: 'British Shorthair', age: 6, status: 'Available', location: 'Lucknow', description: 'Calm senior cat, prefers quiet environment' }
];

const volunteers = [
    { id: 1, name: 'Priya Sharma', role: 'Caretaker', experience: 3, location: 'Mumbai', contact: 'priya@petcare.org' },
    { id: 2, name: 'Rahul Kumar', role: 'Veterinarian', experience: 8, location: 'Delhi', contact: 'rahul@petcare.org' },
    { id: 3, name: 'Anita Singh', role: 'Adoption Coordinator', experience: 5, location: 'Bangalore', contact: 'anita@petcare.org' },
    { id: 4, name: 'Vikash Gupta', role: 'Fundraiser', experience: 2, location: 'Chennai', contact: 'vikash@petcare.org' },
    { id: 5, name: 'Meera Patel', role: 'Transport Coordinator', experience: 4, location: 'Pune', contact: 'meera@petcare.org' }
];

const donations = [
    { id: 1, donorName: 'Anonymous', amount: 5000, type: 'Food', date: '2024-01-15', purpose: 'Monthly food supplies' },
    { id: 2, donorName: 'Ravi Mehta', amount: 10000, type: 'Medical', date: '2024-01-20', purpose: 'Emergency medical fund' },
    { id: 3, donorName: 'Corporate Sponsor ABC', amount: 25000, type: 'General', date: '2024-01-25', purpose: 'Shelter maintenance' },
    { id: 4, donorName: 'Sarah Johnson', amount: 3000, type: 'Toys', date: '2024-02-01', purpose: 'Pet toys and enrichment' },
    { id: 5, donorName: 'Local Community Group', amount: 8000, type: 'Medical', date: '2024-02-05', purpose: 'Vaccination drive' }
];

// Helper function to set CORS headers
function setCORSHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Helper function to filter data based on query parameters
function filterData(data, queryParams) {
    return data.filter(item => {
        for (const [key, value] of Object.entries(queryParams)) {
            if (item[key] && item[key].toString().toLowerCase().includes(value.toLowerCase())) {
                continue;
            } else {
                return false;
            }
        }
        return true;
    });
}

// Create server
const server = http.createServer((req, res) => {
    setCORSHeaders(res);
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    // Serve static files (HTML, CSS, JS)
    if (pathname === '/' || pathname === '/index.html') {
        try {
            const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
            res.setHeader('Content-Type', 'text/html');
            res.writeHead(200);
            res.end(htmlContent);
            return;
        } catch (error) {
            res.writeHead(404);
            res.end('HTML file not found');
            return;
        }
    }

    // Serve service.html
    if (pathname === '/service.html') {
        try {
            const htmlContent = fs.readFileSync(path.join(__dirname, 'service.html'), 'utf8');
            res.setHeader('Content-Type', 'text/html');
            res.writeHead(200);
            res.end(htmlContent);
            return;
        } catch (error) {
            res.writeHead(404);
            res.end('Service page not found');
            return;
        }
    }

    // Serve availpets.html
    if (pathname === '/availpets.html') {
        try {
            const htmlContent = fs.readFileSync(path.join(__dirname, 'availpets.html'), 'utf8');
            res.setHeader('Content-Type', 'text/html');
            res.writeHead(200);
            res.end(htmlContent);
            return;
        } catch (error) {
            res.writeHead(404);
            res.end('Available pets page not found');
            return;
        }
    }

    // Set content type to JSON for API endpoints
    res.setHeader('Content-Type', 'application/json');

    try {
        // Main API endpoint
        if (pathname === '/api') {
            res.writeHead(200);
            res.end(JSON.stringify({
                message: 'Welcome to Pet NGO API',
                endpoints: {
                    '/api/pets': 'Get all pets with optional filters (type, breed, status, location, age)',
                    '/api/volunteers': 'Get all volunteers with optional filters (role, location, experience)',
                    '/api/donations': 'Get all donations with optional filters (type, amount, donorName)',
                    '/api/stats': 'Get summary statistics'
                },
                examples: [
                    '/api/pets?type=Dog',
                    '/api/pets?status=Available&location=Mumbai',
                    '/api/volunteers?role=Veterinarian',
                    '/api/donations?type=Medical'
                ]
            }));
        }
        // Pets endpoint
        else if (pathname === '/api/pets') {
            let filteredPets = pets;
            
            if (Object.keys(query).length > 0) {
                filteredPets = filterData(pets, query);
            }
            
            res.writeHead(200);
            res.end(JSON.stringify({
                success: true,
                count: filteredPets.length,
                data: filteredPets
            }));
        }
        // Volunteers endpoint
        else if (pathname === '/api/volunteers') {
            let filteredVolunteers = volunteers;
            
            if (Object.keys(query).length > 0) {
                filteredVolunteers = filterData(volunteers, query);
            }
            
            res.writeHead(200);
            res.end(JSON.stringify({
                success: true,
                count: filteredVolunteers.length,
                data: filteredVolunteers
            }));
        }
        // Donations endpoint
        else if (pathname === '/api/donations') {
            let filteredDonations = donations;
            
            if (Object.keys(query).length > 0) {
                filteredDonations = filterData(donations, query);
            }
            
            res.writeHead(200);
            res.end(JSON.stringify({
                success: true,
                count: filteredDonations.length,
                data: filteredDonations
            }));
        }
        // Stats endpoint
        else if (pathname === '/api/stats') {
            const stats = {
                totalPets: pets.length,
                availablePets: pets.filter(p => p.status === 'Available').length,
                adoptedPets: pets.filter(p => p.status === 'Adopted').length,
                totalVolunteers: volunteers.length,
                totalDonations: donations.reduce((sum, d) => sum + d.amount, 0),
                donationCount: donations.length
            };
            
            res.writeHead(200);
            res.end(JSON.stringify({
                success: true,
                data: stats
            }));
        }
        // 404 for unknown endpoints
        else {
            res.writeHead(404);
            res.end(JSON.stringify({
                success: false,
                message: 'Endpoint not found',
                availableEndpoints: ['/api', '/api/pets', '/api/volunteers', '/api/donations', '/api/stats']
            }));
        }
    } catch (error) {
        res.writeHead(500);
        res.end(JSON.stringify({
            success: false,
            message: 'Internal server error',
            error: error.message
        }));
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Pet NGO API Server running on http://localhost:${PORT}`);
    console.log(`🌐 Open your browser and go to: http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('- GET / or /index.html - Web interface (Home page)');
    console.log('- GET /service.html - Services page');
    console.log('- GET /availpets.html - Available pets page');
    console.log('- GET /api - API information');
    console.log('- GET /api/pets - Get pets (supports query params: type, breed, status, location, age)');
    console.log('- GET /api/volunteers - Get volunteers (supports query params: role, location, experience)');
    console.log('- GET /api/donations - Get donations (supports query params: type, amount, donorName)');
    console.log('- GET /api/stats - Get statistics');
});
