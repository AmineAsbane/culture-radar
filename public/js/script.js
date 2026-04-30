// Configuration API - À adapter selon ton environnement
const API_URL = 'http://localhost:5000/api';

// Variables globales
let allEvents = []; // Tous les événements du backend
let filteredEvents = []; // Événements filtrés

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initialisation CultureRadar...');
    
    // ===== 1. GESTION DES COOKIES =====
    initCookieBanner();
    
    // ===== 2. MENU MOBILE =====
    initMobileMenu();
    
    // ===== 3. FORMULAIRES =====
    initRegisterForm();
    initLoginForm();
    initContactForm();
    initEventCreationForm();
    
    // ===== 4. ÉVÉNEMENTS =====
    loadAndDisplayEvents();
    
    // ===== 5. FILTRES =====
    setupFilters();
    
    // ===== 6. INTERACTIONS =====
    setupSmoothScroll();
    setupAnimations();
    setupParallax();
    setupHeaderScroll();
    
    // ===== 7. CARTE GÉOGRAPHIQUE =====
    initMapWithEvents();
    
    // ===== 8. CAPTCHA SIMPLE =====
    initCaptcha();
});

// ============================================
// 1. GESTION DES COOKIES
// ============================================
function initCookieBanner() {
    const cookieBanner = document.getElementById('cookie-banner');
    if (!cookieBanner) return;
    
    if (!localStorage.getItem('cookieConsent')) {
        setTimeout(() => cookieBanner.classList.add('show'), 1000);
    }

    const acceptBtn = document.getElementById('accept-cookies');
    const refuseBtn = document.getElementById('refuse-cookies');

    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'accepted');
            cookieBanner.classList.remove('show');
            console.log('✅ Cookies acceptés');
        });
    }

    if (refuseBtn) {
        refuseBtn.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'refused');
            cookieBanner.classList.remove('show');
            console.log('❌ Cookies refusés');
        });
    }
}

// ============================================
// 2. MENU MOBILE
// ============================================
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navList = document.querySelector('.nav-list');
    
    if (hamburger && navList) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navList.classList.toggle('active');
        });
        
        // Fermer le menu quand on clique sur un lien
        document.querySelectorAll('.nav-list a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navList.classList.remove('active');
            });
        });
    }
}

// ============================================
// 3. FORMULAIRE INSCRIPTION
// ============================================
function initRegisterForm() {
    const registerForm = document.getElementById('register-form');
    if (!registerForm) return;

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const pseudo = document.getElementById('pseudo')?.value.trim();
        const email = document.getElementById('email')?.value.trim();
        const password = document.getElementById('password')?.value.trim();
        const confirmPassword = document.getElementById('confirm-password')?.value.trim();

        // Validation
        if (!pseudo || !email || !password || !confirmPassword) {
            showAlert('❌ Tous les champs sont requis', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showAlert('❌ Les mots de passe ne correspondent pas', 'error');
            return;
        }

        if (password.length < 6) {
            showAlert('❌ Le mot de passe doit contenir au moins 6 caractères', 'error');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pseudo, email, password })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                showAlert(`✅ Bienvenue ${pseudo}! Redirection...`, 'success');
                setTimeout(() => window.location.href = 'index.html', 1500);
            } else {
                showAlert(`❌ Erreur: ${data.error || 'Erreur serveur'}`, 'error');
            }
        } catch(e) {
            showAlert(`❌ Erreur réseau: ${e.message}`, 'error');
            console.error('Erreur inscription:', e);
        }
    });
}

// ============================================
// 4. FORMULAIRE CONNEXION
// ============================================
function initLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('username')?.value.trim();
        const password = document.getElementById('password')?.value.trim();

        if (!email || !password) {
            showAlert('❌ Email et mot de passe requis', 'error');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                showAlert(`✅ Bienvenue ${data.user.pseudo}!`, 'success');
                setTimeout(() => window.location.href = 'index.html', 1500);
            } else {
                showAlert(`❌ Erreur: ${data.error || 'Identifiants incorrects'}`, 'error');
            }
        } catch(e) {
            showAlert(`❌ Erreur réseau: ${e.message}`, 'error');
            console.error('Erreur connexion:', e);
        }
    });
}

// ============================================
// 5. FORMULAIRE DE CONTACT
// ============================================
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name')?.value.trim();
        const email = document.getElementById('email')?.value.trim();
        const subject = document.getElementById('subject')?.value.trim();
        const message = document.getElementById('message')?.value.trim();
        const captcha = document.getElementById('captcha')?.value.trim();

        // Validation
        if (!name || !email || !message) {
            showAlert('❌ Nom, email et message sont requis', 'error');
            return;
        }

        if (message.length < 10) {
            showAlert('❌ Le message doit contenir au moins 10 caractères', 'error');
            return;
        }

        // Vérifier le captcha
        if (!validateCaptcha(captcha)) {
            showAlert('❌ La réponse au captcha est incorrecte', 'error');
            return;
        }

        // Vérifier les conditions d'utilisation
        if (!document.getElementById('privacy')?.checked) {
            showAlert('❌ Vous devez accepter la politique de confidentialité', 'error');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, subject, message })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                showAlert('✅ Message envoyé! Nous vous répondrons bientôt.', 'success');
                contactForm.reset();
                regenerateCaptcha();
            } else {
                showAlert(`❌ Erreur: ${data.error || 'Erreur serveur'}`, 'error');
            }
        } catch(e) {
            showAlert(`❌ Erreur réseau: ${e.message}`, 'error');
            console.error('Erreur contact:', e);
        }
    });
}

// ============================================
// 6. FORMULAIRE CRÉATION D'ÉVÉNEMENT
// ============================================
function initEventCreationForm() {
    const eventForm = document.getElementById('event-form');
    if (!eventForm) return;

    eventForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem('token');
        if (!token) {
            showAlert('⚠️ Veuillez vous connecter pour créer un événement', 'warning');
            window.location.href = 'connexion.html';
            return;
        }

        const title = document.getElementById('event-title')?.value.trim();
        const description = document.getElementById('event-description')?.value.trim();
        const category = document.getElementById('event-category')?.value;
        const location = document.getElementById('event-location')?.value.trim();
        const event_date = document.getElementById('event-date')?.value;
        const price = parseFloat(document.getElementById('event-price')?.value || 0);
        const max_participants = parseInt(document.getElementById('event-max-participants')?.value || 20);

        // Validation
        if (!title || !description || !category || !location || !event_date) {
            showAlert('❌ Tous les champs sont requis', 'error');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    description,
                    category,
                    location,
                    event_date,
                    price,
                    max_participants
                })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                showAlert('✅ Événement créé avec succès!', 'success');
                eventForm.reset();
                setTimeout(() => window.location.href = 'index.html', 1500);
            } else {
                showAlert(`❌ Erreur: ${data.error || 'Erreur serveur'}`, 'error');
            }
        } catch(e) {
            showAlert(`❌ Erreur réseau: ${e.message}`, 'error');
            console.error('Erreur création événement:', e);
        }
    });
}

// ============================================
// 7. CHARGER ET AFFICHER LES ÉVÉNEMENTS
// ============================================
async function loadAndDisplayEvents() {
    try {
        console.log('📥 Chargement des événements depuis l\'API...');
        
        const response = await fetch(`${API_URL}/events`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        allEvents = data.events || [];
        filteredEvents = [...allEvents];
        
        console.log(`✅ ${allEvents.length} événements chargés`);
        
        displayEvents(allEvents);
        
    } catch(error) {
        console.error('❌ Erreur chargement événements:', error);
        showAlert(`Impossible de charger les événements: ${error.message}`, 'error');
        // Fallback : afficher un message d'erreur
        const container = document.querySelector('.events-grid');
        if (container) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <p>⚠️ Impossible de charger les événements</p>
                    <p style="font-size: 12px; color: #666;">Vérifiez que le serveur backend est lancé sur http://localhost:5000</p>
                </div>
            `;
        }
    }
}

// ============================================
// 8. AFFICHER LES ÉVÉNEMENTS
// ============================================
function displayEvents(eventsToDisplay) {
    const eventsContainer = document.querySelector('.events-grid');
    
    if (!eventsContainer) {
        console.warn('⚠️ Conteneur .events-grid non trouvé');
        return;
    }
    
    if (!eventsToDisplay || eventsToDisplay.length === 0) {
        eventsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Aucun événement disponible</p>';
        return;
    }
    
    eventsContainer.innerHTML = '';
    
    eventsToDisplay.forEach(event => {
        const eventDate = new Date(event.event_date);
        const formattedDate = eventDate.toLocaleDateString('fr-FR', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
        }).toUpperCase();
        
        const imageUrl = event.image_url || 'https://images.unsplash.com/photo-1540575467063-178f50c2dff0?w=400&h=300&fit=crop';
        
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        eventCard.setAttribute('data-event-id', event.id);
        eventCard.setAttribute('data-category', event.category || 'autre');
        eventCard.setAttribute('data-price', event.price || 0);
        eventCard.setAttribute('data-date', formattedDate);
        
        eventCard.innerHTML = `
            <a href="evenement.html?id=${event.id}" style="text-decoration: none; color: inherit; display: block;">
                <div class="event-image" style="background-image: url('${imageUrl}');">
                    <div class="event-date">${formattedDate}</div>
                    <span class="event-category-badge">${event.category || 'Événement'}</span>
                </div>
                <div class="event-details">
                    <h3>${event.title}</h3>
                    <p class="event-location">
                        <i class="fas fa-map-marker-alt"></i> ${event.location || 'Paris'}
                    </p>
                    <p class="event-description">${event.description || 'Événement culturel'}</p>
                    <div class="event-info">
                        <span class="event-price">${event.price}€</span>
                        <span class="event-participants">
                            ${event.current_participants || 0}/${event.max_participants || 30} inscrits
                        </span>
                    </div>
                </div>
            </a>
            <div style="padding: 0 20px 20px 20px;">
                <button class="btn btn-participate btn-small" data-event-id="${event.id}" onclick="event.preventDefault(); event.stopPropagation();">
                    Participer
                </button>
            </div>
        `;
        
        eventsContainer.appendChild(eventCard);
    });
    
    // Attacher les listeners de participation
    attachParticipateListeners();
}

// ============================================
// 9. PARTICIPATION AUX ÉVÉNEMENTS
// ============================================
function attachParticipateListeners() {
    const participateButtons = document.querySelectorAll('.btn-participate');
    
    participateButtons.forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            
            const token = localStorage.getItem('token');
            
            if (!token) {
                showAlert('⚠️ Veuillez vous connecter pour participer', 'warning');
                window.location.href = 'connexion.html';
                return;
            }
            
            const eventId = this.getAttribute('data-event-id');
            const originalText = this.textContent;
            
            try {
                this.disabled = true;
                this.textContent = 'Inscription en cours...';
                
                const res = await fetch(`${API_URL}/events/${eventId}/join`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                const data = await res.json();
                
                if (res.ok) {
                    this.textContent = '✅ Inscrit!';
                    this.classList.add('disabled');
                    showAlert('✅ Vous êtes inscrit à cet événement!', 'success');
                    
                    // Recharger les événements pour mettre à jour le compteur
                    setTimeout(() => loadAndDisplayEvents(), 2000);
                } else {
                    showAlert(`❌ ${data.error || 'Erreur lors de l\'inscription'}`, 'error');
                    this.disabled = false;
                    this.textContent = originalText;
                }
            } catch(e) {
                showAlert(`❌ Erreur: ${e.message}`, 'error');
                this.disabled = false;
                this.textContent = originalText;
                console.error('Erreur participation:', e);
            }
        });
    });
}

// ============================================
// 10. FILTRES
// ============================================
function setupFilters() {
    const dateFilter = document.getElementById('date-filter');
    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');
    const resetBtn = document.getElementById('reset-filters');
    
    function applyFilters() {
        let filtered = [...allEvents];
        
        // Filtre par date
        const dateValue = dateFilter?.value;
        if (dateValue) {
            filtered = filtered.filter(event => {
                const eventDate = new Date(event.event_date);
                const today = new Date();
                
                switch(dateValue) {
                    case 'today':
                        return eventDate.toDateString() === today.toDateString();
                    case 'week':
                        const weekEnd = new Date(today);
                        weekEnd.setDate(weekEnd.getDate() + 7);
                        return eventDate >= today && eventDate <= weekEnd;
                    case 'month':
                        return eventDate.getMonth() === today.getMonth() && 
                               eventDate.getFullYear() === today.getFullYear();
                    default:
                        return true;
                }
            });
        }
        
        // Filtre par catégorie
        const categoryValue = categoryFilter?.value;
        if (categoryValue) {
            filtered = filtered.filter(event => event.category === categoryValue);
        }
        
        // Filtre par prix
        const priceValue = priceFilter?.value;
        if (priceValue) {
            filtered = filtered.filter(event => {
                const price = event.price || 0;
                switch(priceValue) {
                    case 'free':
                        return price === 0;
                    case '0-15':
                        return price > 0 && price <= 15;
                    case '15-30':
                        return price > 15 && price <= 30;
                    case '30+':
                        return price > 30;
                    default:
                        return true;
                }
            });
        }
        
        filteredEvents = filtered;
        displayEvents(filtered);
        console.log(`🔍 ${filtered.length} événements après filtrage`);
    }
    
    if (dateFilter) dateFilter.addEventListener('change', applyFilters);
    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
    if (priceFilter) priceFilter.addEventListener('change', applyFilters);
    
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (dateFilter) dateFilter.value = '';
            if (categoryFilter) categoryFilter.value = '';
            if (priceFilter) priceFilter.value = '';
            applyFilters();
            showAlert('✅ Filtres réinitialisés', 'success');
        });
    }
}

// ============================================
// 11. SCROLL FLUIDE
// ============================================
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ============================================
// 12. ANIMATIONS
// ============================================
function setupAnimations() {
    const animateElements = document.querySelectorAll('.event-card, .feature');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease-out';
    });
    
    const animateOnScroll = () => {
        animateElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight * 0.8;
            
            if (isVisible) {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }
        });
    };
    
    window.addEventListener('scroll', animateOnScroll);
    window.addEventListener('load', animateOnScroll);
}

// ============================================
// 13. PARALLAX
// ============================================
function setupParallax() {
    const hero = document.querySelector('.hero');
    
    if (hero) {
        window.addEventListener('scroll', () => {
            const offset = window.pageYOffset;
            hero.style.backgroundPositionY = (offset * 0.5) + 'px';
        });
    }
}

// ============================================
// 14. HEADER SCROLL
// ============================================
function setupHeaderScroll() {
    const header = document.querySelector('.header');
    
    if (!header) return;
    
    const originalBgColor = window.getComputedStyle(header).backgroundColor;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            
            document.querySelectorAll('.nav-list a, .logo').forEach(el => {
                el.style.color = '#1a1a1a';
            });
        } else {
            header.style.background = originalBgColor;
            header.style.boxShadow = 'none';
            
            document.querySelectorAll('.nav-list a, .logo').forEach(el => {
                el.style.color = 'white';
            });
        }
    });
}

// ============================================
// 15. CARTE GÉOGRAPHIQUE
// ============================================
function initMapWithEvents() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;
    
    // Vérifier si Google Maps est disponible
    if (typeof google === 'undefined' || !google.maps) {
        console.warn('⚠️ Google Maps API non chargée');
        
        // Charger la clé API
        const script = document.createElement('script');
        script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDemoKey123456';
        script.async = true;
        script.defer = true;
        script.onload = () => createMap();
        document.head.appendChild(script);
    } else {
        createMap();
    }
    
    function createMap() {
        if (!window.google || !window.google.maps) {
            console.error('❌ Google Maps API non disponible');
            mapContainer.innerHTML = '<p>Impossible de charger la carte</p>';
            return;
        }
        
        const parisCenter = { lat: 48.8566, lng: 2.3522 };
        const map = new google.maps.Map(mapContainer, {
            zoom: 12,
            center: parisCenter,
            styles: [
                {
                    featureType: 'all',
                    elementType: 'labels.text.fill',
                    stylers: [{ color: '#616161' }]
                }
            ]
        });
        
        // Ajouter les marqueurs pour les événements chargés
        if (allEvents.length > 0) {
            allEvents.forEach(event => {
                if (event.latitude && event.longitude) {
                    const marker = new google.maps.Marker({
                        position: { lat: event.latitude, lng: event.longitude },
                        map: map,
                        title: event.title,
                        icon: 'http://maps.google.com/mapfiles/ms/icons/FF6B6B.png'
                    });
                    
                    const infoWindow = new google.maps.InfoWindow({
                        content: `
                            <div style="padding: 10px; max-width: 250px;">
                                <h4 style="margin: 0 0 5px 0;">${event.title}</h4>
                                <p style="margin: 0 0 5px 0; font-size: 12px;">${event.location}</p>
                                <p style="margin: 0 0 5px 0; font-size: 12px;">
                                    <strong>Prix:</strong> ${event.price}€
                                </p>
                                <p style="margin: 0; font-size: 12px;">
                                    <strong>Catégorie:</strong> ${event.category}
                                </p>
                            </div>
                        `
                    });
                    
                    marker.addListener('click', () => {
                        infoWindow.open(map, marker);
                    });
                }
            });
        } else {
            console.log('⚠️ Aucun événement avec géolocalisation');
        }
    }
}

// ============================================
// 16. CAPTCHA SIMPLE
// ============================================
let captchaAnswer = 0;

function initCaptcha() {
    regenerateCaptcha();
}

function generateRandomCaptcha() {
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let answer;
    switch(operator) {
        case '+':
            answer = num1 + num2;
            break;
        case '-':
            answer = num1 - num2;
            break;
        case '*':
            answer = num1 * num2;
            break;
        default:
            answer = num1 + num2;
    }
    
    return {
        question: `${num1} ${operator} ${num2} = ?`,
        answer: answer
    };
}

function regenerateCaptcha() {
    const captcha = generateRandomCaptcha();
    captchaAnswer = captcha.answer;
    
    const questionElement = document.getElementById('captcha-question');
    if (questionElement) {
        questionElement.textContent = `Combien font ${captcha.question}`;
    }
    
    const captchaInput = document.getElementById('captcha');
    if (captchaInput) {
        captchaInput.value = '';
    }
}

function validateCaptcha(userAnswer) {
    return parseInt(userAnswer) === captchaAnswer;
}

// ============================================
// 17. UTILITAIRES
// ============================================
function showAlert(message, type = 'info') {
    // Créer une notification temporaire
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background-color: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196F3'};
        color: white;
        border-radius: 4px;
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    alertDiv.textContent = message;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

// ============================================
// FIN DU SCRIPT
// ============================================
console.log('✅ CultureRadar initialisé avec succès!');