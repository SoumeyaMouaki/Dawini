import express from 'express';
import { Router } from 'express';
import { query, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// GET /api/geo/search - Search locations
router.get('/search', [
  query('q').trim().notEmpty().withMessage('Search query is required'),
  query('type').optional().isIn(['city', 'wilaya', 'address']).withMessage('Invalid location type'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { q, type = 'city', limit = 10 } = req.query;

    // Mock data for Algerian cities/wilayas
    // In a real application, this would integrate with a geocoding service
    const algerianCities = [
      { name: 'Alger', wilaya: 'Alger', coordinates: [36.7538, 3.0588], type: 'city' },
      { name: 'Oran', wilaya: 'Oran', coordinates: [35.6971, -0.6331], type: 'city' },
      { name: 'Constantine', wilaya: 'Constantine', coordinates: [36.3650, 6.6147], type: 'city' },
      { name: 'Annaba', wilaya: 'Annaba', coordinates: [36.9000, 7.7667], type: 'city' },
      { name: 'Batna', wilaya: 'Batna', coordinates: [35.5500, 6.1667], type: 'city' },
      { name: 'Blida', wilaya: 'Blida', coordinates: [36.4700, 2.8300], type: 'city' },
      { name: 'Setif', wilaya: 'Setif', coordinates: [36.1900, 5.4100], type: 'city' },
      { name: 'Tlemcen', wilaya: 'Tlemcen', coordinates: [34.8783, -1.3150], type: 'city' },
      { name: 'Ghardaia', wilaya: 'Ghardaia', coordinates: [32.4833, 3.6667], type: 'city' },
      { name: 'Bejaia', wilaya: 'Bejaia', coordinates: [36.7500, 5.0833], type: 'city' }
    ];

    // Filter cities based on search query
    const filteredCities = algerianCities.filter(city => 
      city.name.toLowerCase().includes(q.toLowerCase()) ||
      city.wilaya.toLowerCase().includes(q.toLowerCase())
    ).slice(0, parseInt(limit));

    res.json({
      query: q,
      type: type,
      results: filteredCities,
      total: filteredCities.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/geo/cities - Get list of cities
router.get('/cities', [
  query('wilaya').optional().trim(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { wilaya, limit = 50 } = req.query;

    // Mock data for Algerian cities
    const cities = [
      { name: 'Alger', wilaya: 'Alger', coordinates: [36.7538, 3.0588] },
      { name: 'Oran', wilaya: 'Oran', coordinates: [35.6971, -0.6331] },
      { name: 'Constantine', wilaya: 'Constantine', coordinates: [36.3650, 6.6147] },
      { name: 'Annaba', wilaya: 'Annaba', coordinates: [36.9000, 7.7667] },
      { name: 'Batna', wilaya: 'Batna', coordinates: [35.5500, 6.1667] },
      { name: 'Blida', wilaya: 'Blida', coordinates: [36.4700, 2.8300] },
      { name: 'Setif', wilaya: 'Setif', coordinates: [36.1900, 5.4100] },
      { name: 'Tlemcen', wilaya: 'Tlemcen', coordinates: [34.8783, -1.3150] },
      { name: 'Ghardaia', wilaya: 'Ghardaia', coordinates: [32.4833, 3.6667] },
      { name: 'Bejaia', wilaya: 'Bejaia', coordinates: [36.7500, 5.0833] },
      { name: 'Tamanrasset', wilaya: 'Tamanrasset', coordinates: [22.7850, 5.5228] },
      { name: 'Adrar', wilaya: 'Adrar', coordinates: [27.8743, -0.2939] },
      { name: 'Laghouat', wilaya: 'Laghouat', coordinates: [33.8000, 2.8667] },
      { name: 'Ouargla', wilaya: 'Ouargla', coordinates: [31.9500, 5.3167] },
      { name: 'El Oued', wilaya: 'El Oued', coordinates: [33.3667, 6.8667] }
    ];

    let filteredCities = cities;
    if (wilaya) {
      filteredCities = cities.filter(city => 
        city.wilaya.toLowerCase().includes(wilaya.toLowerCase())
      );
    }

    filteredCities = filteredCities.slice(0, parseInt(limit));

    res.json({
      cities: filteredCities,
      total: filteredCities.length,
      wilaya: wilaya || 'all'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/geo/wilayas - Get list of wilayas (provinces)
router.get('/wilayas', async (req, res) => {
  try {
    // Mock data for Algerian wilayas
    const wilayas = [
      { code: '01', name: 'Adrar', capital: 'Adrar' },
      { code: '02', name: 'Chlef', capital: 'Chlef' },
      { code: '03', name: 'Laghouat', capital: 'Laghouat' },
      { code: '04', name: 'Oum El Bouaghi', capital: 'Oum El Bouaghi' },
      { code: '05', name: 'Batna', capital: 'Batna' },
      { code: '06', name: 'Bejaia', capital: 'Bejaia' },
      { code: '07', name: 'Biskra', capital: 'Biskra' },
      { code: '08', name: 'Bechar', capital: 'Bechar' },
      { code: '09', name: 'Blida', capital: 'Blida' },
      { code: '10', name: 'Bouira', capital: 'Bouira' },
      { code: '11', name: 'Tamanrasset', capital: 'Tamanrasset' },
      { code: '12', name: 'Tebessa', capital: 'Tebessa' },
      { code: '13', name: 'Tlemcen', capital: 'Tlemcen' },
      { code: '14', name: 'Tiaret', capital: 'Tiaret' },
      { code: '15', name: 'Tizi Ouzou', capital: 'Tizi Ouzou' },
      { code: '16', name: 'Alger', capital: 'Alger' },
      { code: '17', name: 'Djelfa', capital: 'Djelfa' },
      { code: '18', name: 'Jijel', capital: 'Jijel' },
      { code: '19', name: 'Setif', capital: 'Setif' },
      { code: '20', name: 'Saida', capital: 'Saida' },
      { code: '21', name: 'Skikda', capital: 'Skikda' },
      { code: '22', name: 'Sidi Bel Abbes', capital: 'Sidi Bel Abbes' },
      { code: '23', name: 'Annaba', capital: 'Annaba' },
      { code: '24', name: 'Guelma', capital: 'Guelma' },
      { code: '25', name: 'Constantine', capital: 'Constantine' },
      { code: '26', name: 'Medea', capital: 'Medea' },
      { code: '27', name: 'Mostaganem', capital: 'Mostaganem' },
      { code: '28', name: 'M\'Sila', capital: 'M\'Sila' },
      { code: '29', name: 'Mascara', capital: 'Mascara' },
      { code: '30', name: 'Ouargla', capital: 'Ouargla' },
      { code: '31', name: 'Oran', capital: 'Oran' },
      { code: '32', name: 'El Bayadh', capital: 'El Bayadh' },
      { code: '33', name: 'Illizi', capital: 'Illizi' },
      { code: '34', name: 'Bordj Bou Arreridj', capital: 'Bordj Bou Arreridj' },
      { code: '35', name: 'Boumerdes', capital: 'Boumerdes' },
      { code: '36', name: 'El Tarf', capital: 'El Tarf' },
      { code: '37', name: 'Tindouf', capital: 'Tindouf' },
      { code: '38', name: 'Tissemsilt', capital: 'Tissemsilt' },
      { code: '39', name: 'El Oued', capital: 'El Oued' },
      { code: '40', name: 'Khenchela', capital: 'Khenchela' },
      { code: '41', name: 'Souk Ahras', capital: 'Souk Ahras' },
      { code: '42', name: 'Tipaza', capital: 'Tipaza' },
      { code: '43', name: 'Mila', capital: 'Mila' },
      { code: '44', name: 'Ain Defla', capital: 'Ain Defla' },
      { code: '45', name: 'Naama', capital: 'Naama' },
      { code: '46', name: 'Ain Temouchent', capital: 'Ain Temouchent' },
      { code: '47', name: 'Ghardaia', capital: 'Ghardaia' },
      { code: '48', name: 'Relizane', capital: 'Relizane' }
    ];

    res.json({
      wilayas,
      total: wilayas.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/geo/coordinates - Get coordinates for address
router.get('/coordinates', [
  query('address').trim().notEmpty().withMessage('Address is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { address } = req.query;

    // Mock geocoding response
    // In a real application, this would integrate with Google Maps API or similar
    const mockCoordinates = {
      'Alger, Algeria': [36.7538, 3.0588],
      'Oran, Algeria': [35.6971, -0.6331],
      'Constantine, Algeria': [36.3650, 6.6147],
      'Annaba, Algeria': [36.9000, 7.7667],
      'Batna, Algeria': [35.5500, 6.1667]
    };

    const coordinates = mockCoordinates[address] || null;

    if (!coordinates) {
      return res.status(404).json({ 
        message: 'Address not found',
        address: address
      });
    }

    res.json({
      address: address,
      coordinates: {
        latitude: coordinates[0],
        longitude: coordinates[1]
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/geo/distance - Calculate distance between two points
router.get('/distance', [
  query('lat1').isFloat().withMessage('Valid latitude 1 is required'),
  query('lon1').isFloat().withMessage('Valid longitude 1 is required'),
  query('lat2').isFloat().withMessage('Valid latitude 2 is required'),
  query('lon2').isFloat().withMessage('Valid longitude 2 is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { lat1, lon1, lat2, lon2 } = req.query;

    // Haversine formula to calculate distance between two points
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;

    res.json({
      point1: { latitude: parseFloat(lat1), longitude: parseFloat(lon1) },
      point2: { latitude: parseFloat(lat2), longitude: parseFloat(lon2) },
      distance: {
        kilometers: Math.round(distance * 100) / 100,
        meters: Math.round(distance * 1000)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /api/geo/nearby - Find nearby locations
router.get('/nearby', [
  query('latitude').isFloat().withMessage('Valid latitude is required'),
  query('longitude').isFloat().withMessage('Valid longitude is required'),
  query('radius').optional().isFloat({ min: 0.1, max: 100 }).withMessage('Radius must be between 0.1 and 100 km'),
  query('type').optional().isIn(['pharmacy', 'doctor', 'hospital']).withMessage('Invalid location type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { latitude, longitude, radius = 5, type } = req.query;

    // Mock nearby locations
    // In a real application, this would query the database for actual locations
    const mockLocations = [
      {
        id: '1',
        name: 'Pharmacie Centrale',
        type: 'pharmacy',
        coordinates: [parseFloat(latitude) + 0.001, parseFloat(longitude) + 0.001],
        distance: 0.1,
        address: '123 Rue Principale'
      },
      {
        id: '2',
        name: 'Dr. Ahmed Benali',
        type: 'doctor',
        coordinates: [parseFloat(latitude) - 0.002, parseFloat(longitude) + 0.003],
        distance: 0.3,
        address: '456 Avenue de la Santé'
      },
      {
        id: '3',
        name: 'Hôpital Municipal',
        type: 'hospital',
        coordinates: [parseFloat(latitude) + 0.005, parseFloat(longitude) - 0.001],
        distance: 0.5,
        address: '789 Boulevard Central'
      }
    ];

    // Filter by type if specified
    let filteredLocations = mockLocations;
    if (type) {
      filteredLocations = mockLocations.filter(location => location.type === type);
    }

    // Filter by radius
    filteredLocations = filteredLocations.filter(location => location.distance <= parseFloat(radius));

    // Sort by distance
    filteredLocations.sort((a, b) => a.distance - b.distance);

    res.json({
      center: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
      radius: parseFloat(radius),
      type: type || 'all',
      locations: filteredLocations,
      total: filteredLocations.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
