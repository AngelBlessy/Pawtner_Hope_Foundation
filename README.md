# Pawtner Hope Foundation - Full-Stack Web Application

A comprehensive pet adoption and care management system built with modern web technologies.

## 🚀 Technologies Used

- **Backend**: Node.js, Express.js
- **Data Storage**: Node.js File System (fs) module with JSON file
- **Frontend**: HTML5, Tailwind CSS
- **API**: RESTful API with full CRUD operations
- **Domain**: Pet Care & Adoption Management

## 📋 Features

### Frontend (HTML5 + Tailwind CSS)
- **Home Page** (`index.html`) - Main landing page with hero section, video, audio, gallery
- **Services Page** (`service.html`) - Pet care services offered
- **Available Pets Page** (`availpets.html`) - Interactive pet listings with filters

### Backend (Node.js + Express.js)
- **RESTful API** with full CRUD operations
- **File-based storage** using JSON files
- **Express.js middleware** for CORS, JSON parsing
- **Error handling** and validation
- **Filtering and pagination** support

## 🗃️ Data Management

All data is stored in `data.json` file with three main collections:
- **Pets** - Pet information (name, type, breed, age, status, location, description)
- **Volunteers** - Volunteer details (name, role, experience, location, contact)
- **Donations** - Donation records (donor, amount, type, purpose, date)

## 🔗 API Endpoints

### Pets CRUD
- `GET /api/pets` - Get all pets (supports filtering)
- `GET /api/pets/:id` - Get specific pet
- `POST /api/pets` - Create new pet
- `PUT /api/pets/:id` - Update pet
- `DELETE /api/pets/:id` - Delete pet

### Volunteers CRUD
- `GET /api/volunteers` - Get all volunteers
- `GET /api/volunteers/:id` - Get specific volunteer
- `POST /api/volunteers` - Create new volunteer
- `PUT /api/volunteers/:id` - Update volunteer
- `DELETE /api/volunteers/:id` - Delete volunteer

### Donations CRUD
- `GET /api/donations` - Get all donations
- `GET /api/donations/:id` - Get specific donation
- `POST /api/donations` - Create new donation
- `PUT /api/donations/:id` - Update donation
- `DELETE /api/donations/:id` - Delete donation

### Statistics
- `GET /api/stats` - Get comprehensive statistics

## 🛠️ Installation & Setup

1. **Clone/Download** the project
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the server**:
   ```bash
   npm start
   ```
4. **Access the application**:
   - Open browser: `http://localhost:3000`

## 📁 Project Structure

```
pawtner_fome_foundation/
├── server.js          # Express.js server with CRUD operations
├── data.json          # JSON database file
├── package.json       # Project dependencies
├── index.html         # Home page
├── service.html       # Services page
├── availpets.html     # Available pets page
└── README.md          # This file
```

## 🧪 Testing API Endpoints

### Create a new pet:
```bash
POST http://localhost:3000/api/pets
Content-Type: application/json

{
  "name": "Fluffy",
  "type": "Cat",
  "breed": "Persian",
  "age": 2,
  "status": "Available",
  "location": "Mumbai",
  "description": "Beautiful and friendly cat"
}
```

### Get all pets with filtering:
```bash
GET http://localhost:3000/api/pets?type=Dog&status=Available
```

### Update a pet:
```bash
PUT http://localhost:3000/api/pets/1
Content-Type: application/json

{
  "status": "Adopted",
  "description": "Found a loving home!"
}
```

## 🌟 Key Features Implemented

✅ **Node.js & Express.js** - Modern server framework  
✅ **File System (fs) module** - JSON file-based data storage  
✅ **REST API** - Complete CRUD operations  
✅ **HTML5** - Semantic markup and modern features  
✅ **Tailwind CSS** - Responsive, utility-first styling  
✅ **Domain-focused** - Pet adoption and care management  
✅ **Error handling** - Comprehensive error responses  
✅ **Data validation** - Input validation for API endpoints  
✅ **Filtering & Search** - Query parameter support  
✅ **Statistics** - Data analytics endpoints  

## 📊 Sample Data

The application comes pre-loaded with:
- 10 pets (dogs and cats)
- 5 volunteers (various roles)
- 5 donation records

## 🔧 Development

For development with auto-restart:
```bash
npm run dev
```

## 📝 License

MIT License - Feel free to use this project for learning and development.

---

**Made with ❤️ for our furry friends**  
Pawtner Hope Foundation © 2024
