const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
require('dotenv').config();

const app = express();

// ===== MIDDLEWARE =====
app.use(cors({
    origin: function(origin, callback) {
        const allowedOrigins = ['http://localhost:8000', 'http://127.0.0.1:8000', 'http://localhost:5000', 'https://melodious-comfort-production-1295.up.railway.app'];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());

// Servir les fichiers statiques (images)
app.use('/images', express.static('public/images'));

// Servir les fichiers statiques du frontend (HTML, CSS, JS)
app.use(express.static('public'));

// ===== DATA =====
let users = [];
let events = [];
let participations = [];
let messages = [];

// ===== TEST USER =====
const testUser = {
    id: uuidv4(),
    pseudo: 'demo_user',
    email: 'demo@example.com',
    password_hash: bcrypt.hashSync('Password123', 10),
    created_at: new Date(),
    is_active: true
};
users.push(testUser);

// ===== 18 ÉVÉNEMENTS AVEC IMAGES LOCALES =====
const testEvents = [
    {
        id: uuidv4(),
        title: 'Visite Guidée Nocturne',
        description: 'Découvrez le Louvre sous un nouveau jour avec un guide expert',
        category: 'visite',
        event_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        location: 'Musée du Louvre, Paris',
        latitude: 48.8606,
        longitude: 2.3352,
        price: 25,
        max_participants: 20,
        current_participants: 0,
        creator_id: testUser.id,
        image_url: 'https://melodious-comfort-production-1295.up.railway.app/images/visite_nocturne.jpg',
        created_at: new Date(),
        is_published: true
    },
    {
        id: uuidv4(),
        title: 'Soirée Jazz au Sunset',
        description: 'Une soirée jazz inoubliable avec des musiciens talentueux',
        category: 'musique',
        event_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        location: 'Sunset Jazz Club, Marais',
        latitude: 48.8698,
        longitude: 2.3073,
        price: 30,
        max_participants: 50,
        current_participants: 0,
        creator_id: testUser.id,
        image_url: 'https://melodious-comfort-production-1295.up.railway.app/images/Soiree_Jazz_au_Sunset.jpg',
        created_at: new Date(),
        is_published: true
    },
    {
        id: uuidv4(),
        title: 'Street Art Tour à Belleville',
        description: 'Découvrez l\'art urbain et les fresques de Belleville',
        category: 'art',
        event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        location: 'Belleville, Paris 20e',
        latitude: 48.8722,
        longitude: 2.3823,
        price: 15,
        max_participants: 30,
        current_participants: 0,
        creator_id: testUser.id,
        image_url: 'https://melodious-comfort-production-1295.up.railway.app/images/Street_Art_Tour.jpg',
        created_at: new Date(),
        is_published: true
    },
    {
        id: uuidv4(),
        title: 'Rencontre Littéraire',
        description: 'Discussion autour des derniers romans avec des auteurs',
        category: 'littérature',
        event_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        location: 'Bibliothèque Sainte-Geneviève, Quartier Latin',
        latitude: 48.8508,
        longitude: 2.3431,
        price: 10,
        max_participants: 40,
        current_participants: 0,
        creator_id: testUser.id,
        image_url: 'https://melodious-comfort-production-1295.up.railway.app/images/Rencontre_Litteraire.png',
        created_at: new Date(),
        is_published: true
    },
    {
        id: uuidv4(),
        title: 'Exposition Picasso',
        description: 'Exposition temporaire des chefs-d\'oeuvres de Picasso',
        category: 'art',
        event_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        location: 'Musée Picasso, Paris',
        latitude: 48.8575,
        longitude: 2.3020,
        price: 20,
        max_participants: 60,
        current_participants: 0,
        creator_id: testUser.id,
        image_url: 'https://melodious-comfort-production-1295.up.railway.app/images/Exposition_Picasso.jpg',
        created_at: new Date(),
        is_published: true
    },
    {
        id: uuidv4(),
        title: 'Cinéma en plein air',
        description: 'Projection de films classiques en plein air sous les étoiles',
        category: 'cinéma',
        event_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        location: 'Jardin des Plantes, Paris',
        latitude: 48.8404,
        longitude: 2.3568,
        price: 8,
        max_participants: 100,
        current_participants: 0,
        creator_id: testUser.id,
        image_url: 'https://melodious-comfort-production-1295.up.railway.app/images/Cinema_en_plein_air.jpg',
        created_at: new Date(),
        is_published: true
    },
    {
        id: uuidv4(),
        title: 'Atelier de Peinture',
        description: 'Atelier créatif pour apprendre les techniques de peinture',
        category: 'atelier',
        event_date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
        location: 'Studio Art Marais, Paris 3e',
        latitude: 48.8633,
        longitude: 2.3622,
        price: 35,
        max_participants: 15,
        current_participants: 0,
        creator_id: testUser.id,
        image_url: 'https://melodious-comfort-production-1295.up.railway.app/images/Atelier_de_Peinture.jfif',
        created_at: new Date(),
        is_published: true
    },
    {
        id: uuidv4(),
        title: 'Concert Classique à Notre-Dame',
        description: 'Concert de musique classique dans la majestueuse Notre-Dame',
        category: 'musique',
        event_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        location: 'Cathédrale Notre-Dame, Île de la Cité',
        latitude: 48.8530,
        longitude: 2.3499,
        price: 40,
        max_participants: 80,
        current_participants: 0,
        creator_id: testUser.id,
        image_url: 'https://melodious-comfort-production-1295.up.railway.app/images/Concert_Classique_a_Notre-Dame.JFIF',
        created_at: new Date(),
        is_published: true
    },
    {
        id: uuidv4(),
        title: 'Visite du Château de Versailles',
        description: 'Journée complète au château de Versailles avec guide expert',
        category: 'visite',
        event_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        location: 'Château de Versailles',
        latitude: 48.8047,
        longitude: 2.1200,
        price: 50,
        max_participants: 40,
        current_participants: 0,
        creator_id: testUser.id,
        image_url: 'https://melodious-comfort-production-1295.up.railway.app/images/Visite_du_Chateau_de_Versailles.JFIF',
        created_at: new Date(),
        is_published: true
    },
    {
        id: uuidv4(),
        title: 'Théâtre Contemporain',
        description: 'Pièce de théâtre contemporaine d\'un jeune auteur parisien',
        category: 'théâtre',
        event_date: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
        location: 'Théâtre de la Huchette, Quartier Latin',
        latitude: 48.8540,
        longitude: 2.3467,
        price: 28,
        max_participants: 60,
        current_participants: 0,
        creator_id: testUser.id,
        image_url: 'https://melodious-comfort-production-1295.up.railway.app/images/Theatre_Contemporain.JFIF',
        created_at: new Date(),
        is_published: true
    },
    {
        id: uuidv4(),
        title: 'Danse Contemporaine',
        description: 'Performance de danse contemporaine d\'artistes reconnus',
        category: 'danse',
        event_date: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000),
        location: 'Opéra Bastille, Paris 12e',
        latitude: 48.8525,
        longitude: 2.3691,
        price: 45,
        max_participants: 70,
        current_participants: 0,
        creator_id: testUser.id,
        image_url: 'https://melodious-comfort-production-1295.up.railway.app/images/Danse_Contemporaine.JFIF',
        created_at: new Date(),
        is_published: true
    },
    {
        id: uuidv4(),
        title: 'Photography Walk Paris',
        description: 'Balade photo guidée à travers les plus beaux quartiers de Paris',
        category: 'photographie',
        event_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        location: 'Île Saint-Louis, Paris',
        latitude: 48.8513,
        longitude: 2.3527,
        price: 18,
        max_participants: 25,
        current_participants: 0,
        creator_id: testUser.id,
        image_url: 'https://melodious-comfort-production-1295.up.railway.app/images/Photography_Walk_Paris.jpg',
        created_at: new Date(),
        is_published: true
    },
    {
        id: uuidv4(),
        title: 'Musée d\'Orsay - Impressionnistes',
        description: 'Visite guidée des collections impressionnistes du musée',
        category: 'visite',
        event_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        location: 'Musée d\'Orsay, Rive Gauche',
        latitude: 48.8601,
        longitude: 2.3265,
        price: 22,
        max_participants: 50,
        current_participants: 0,
        creator_id: testUser.id,
        image_url: 'https://melodious-comfort-production-1295.up.railway.app/images/Musee_d_Orsay.JFIF',
        created_at: new Date(),
        is_published: true
    },
    {
        id: uuidv4(),
        title: 'Dégustation de Vins',
        description: 'Dégustation guidée de vins français avec sommelier expert',
        category: 'gastronomie',
        event_date: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
        location: 'Wine Bar Marais, Paris 3e',
        latitude: 48.8643,
        longitude: 2.3650,
        price: 38,
        max_participants: 20,
        current_participants: 0,
        creator_id: testUser.id,
        image_url: 'https://melodious-comfort-production-1295.up.railway.app/images/Degustation_de_Vins.jpg',
        created_at: new Date(),
        is_published: true
    },
    {
        id: uuidv4(),
        title: 'Poésie & Slam Night',
        description: 'Soirée de poésie et slam avec jeunes artistes émergents',
        category: 'littérature',
        event_date: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
        location: 'Café Broca, Montparnasse',
        latitude: 48.8380,
        longitude: 2.3430,
        price: 12,
        max_participants: 35,
        current_participants: 0,
        creator_id: testUser.id,
        image_url: 'https://melodious-comfort-production-1295.up.railway.app/images/Poesie_Slam_Night.png',
        created_at: new Date(),
        is_published: true
    },
    {
        id: uuidv4(),
        title: 'Atelier de Sculpture',
        description: 'Apprentissage de la sculpture avec artiste professionnel',
        category: 'atelier',
        event_date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        location: 'Atelier Montmartre, Paris 18e',
        latitude: 48.8867,
        longitude: 2.3431,
        price: 42,
        max_participants: 12,
        current_participants: 0,
        creator_id: testUser.id,
        image_url: 'https://melodious-comfort-production-1295.up.railway.app/images/Atelier_de_Sculpture.jpg',
        created_at: new Date(),
        is_published: true
    },
    {
        id: uuidv4(),
        title: 'Festival de Musique Électronique',
        description: 'Festival avec DJs et producteurs de musique électronique',
        category: 'musique',
        event_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        location: 'Palais Omnisports de Paris-Bercy, Paris 12e',
        latitude: 48.8400,
        longitude: 2.3869,
        price: 55,
        max_participants: 200,
        current_participants: 0,
        creator_id: testUser.id,
        image_url: 'https://melodious-comfort-production-1295.up.railway.app/images/Festival_de_Musique_Electronique.JFIF',
        created_at: new Date(),
        is_published: true
    },
    {
        id: uuidv4(),
        title: 'Visite Catacombes de Paris',
        description: 'Exploration des mystérieuses catacombes sous Paris',
        category: 'visite',
        event_date: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000),
        location: 'Entrée Catacombes, Montparnasse',
        latitude: 48.8333,
        longitude: 2.3333,
        price: 32,
        max_participants: 25,
        current_participants: 0,
        creator_id: testUser.id,
        image_url: 'https://melodious-comfort-production-1295.up.railway.app/images/Visite_Catacombes_de_Paris.JFIF',
        created_at: new Date(),
        is_published: true
    }
];

events.push(...testEvents);

// ===== HELPERS =====
function generateToken(userId, pseudo) {
    return jwt.sign(
        { id: userId, pseudo },
        process.env.JWT_SECRET || 'secret_key_123',
        { expiresIn: '7d' }
    );
}

function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token manquant' });

    jwt.verify(token, process.env.JWT_SECRET || 'secret_key_123', (err, user) => {
        if (err) return res.status(403).json({ error: 'Token invalide' });
        req.user = user;
        next();
    });
}

// ===== ROUTES API =====

// HEALTH
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK' });
});

// REGISTER
app.post('/api/users/register', async (req, res) => {
    const { pseudo, email, password } = req.body;

    if (!pseudo || !email || !password) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    if (users.find(u => u.pseudo === pseudo)) {
        return res.status(409).json({ error: 'Ce pseudo existe déjà' });
    }

    const user = {
        id: uuidv4(),
        pseudo,
        email,
        password_hash: await bcrypt.hash(password, 10),
        created_at: new Date(),
        is_active: true
    };

    users.push(user);

    res.json({
        user: { id: user.id, pseudo: user.pseudo, email: user.email },
        token: generateToken(user.id, user.pseudo)
    });
});

// LOGIN
app.post('/api/users/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const user = users.find(u => u.email === email);
    if (!user) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });

    res.json({
        user: { id: user.id, pseudo: user.pseudo, email: user.email },
        token: generateToken(user.id, user.pseudo)
    });
});

// GET EVENTS
app.get('/api/events', (req, res) => {
    res.json({ total: events.length, events });
});

// CREATE EVENT
app.post('/api/events', authenticateToken, (req, res) => {
    const event = {
        id: uuidv4(),
        ...req.body,
        creator_id: req.user.id,
        created_at: new Date(),
        current_participants: 0,
        is_published: true
    };

    events.push(event);
    res.json(event);
});

// JOIN EVENT
app.post('/api/events/:id/join', authenticateToken, (req, res) => {
    const event = events.find(e => e.id === req.params.id);
    if (!event) return res.status(404).json({ error: 'Événement non trouvé' });

    if (event.current_participants >= event.max_participants) {
        return res.status(400).json({ error: 'Événement plein' });
    }

    event.current_participants++;
    res.json({ message: 'Inscrit à l\'événement' });
});

// CONTACT
app.post('/api/contact', (req, res) => {
    messages.push({ id: uuidv4(), ...req.body, created_at: new Date() });
    res.json({ message: 'Message reçu' });
});

// ===== ROUTE POUR SPA (toutes les pages HTML) =====
app.get('*', (req, res) => {
    // Si c'est pas une requête API, renvoyer index.html
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
});

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Frontend disponible sur http://localhost:${PORT}`);
    console.log(`🔌 API disponible sur http://localhost:${PORT}/api`);
});