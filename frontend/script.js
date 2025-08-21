// Movie Recommendation App - Enhanced with Autocomplete
class MovieRecommendationApp {
    constructor() {
        this.favoriteMovies = this.loadFavoriteMovies();
        this.API_BASE_URL = 'http://localhost:8080/api';
        this.currentRecommendations = [];
        this.animationFrame = null;
        this.selectedRating = 0;
        
        // Movie database for autocomplete
        this.movieDatabase = [
            { title: "Inception", year: 2010, genre: "Sci-Fi" },
            { title: "The Matrix", year: 1999, genre: "Sci-Fi" },
            { title: "Interstellar", year: 2014, genre: "Sci-Fi" },
            { title: "Avatar", year: 2009, genre: "Sci-Fi" },
            { title: "Blade Runner 2049", year: 2017, genre: "Sci-Fi" },
            { title: "The Avengers", year: 2012, genre: "Action" },
            { title: "John Wick", year: 2014, genre: "Action" },
            { title: "Mad Max: Fury Road", year: 2015, genre: "Action" },
            { title: "Die Hard", year: 1988, genre: "Action" },
            { title: "Gladiator", year: 2000, genre: "Action" },
            { title: "The Shawshank Redemption", year: 1994, genre: "Drama" },
            { title: "Forrest Gump", year: 1994, genre: "Drama" },
            { title: "The Godfather", year: 1972, genre: "Drama" },
            { title: "Schindler's List", year: 1993, genre: "Drama" },
            { title: "Pulp Fiction", year: 1994, genre: "Drama" },
            { title: "The Dark Knight", year: 2008, genre: "Action" },
            { title: "Fight Club", year: 1999, genre: "Drama" },
            { title: "Goodfellas", year: 1990, genre: "Drama" },
            { title: "The Lord of the Rings", year: 2001, genre: "Fantasy" },
            { title: "Star Wars", year: 1977, genre: "Sci-Fi" },
            { title: "Titanic", year: 1997, genre: "Romance" },
            { title: "The Notebook", year: 2004, genre: "Romance" },
            { title: "Casablanca", year: 1942, genre: "Romance" },
            { title: "When Harry Met Sally", year: 1989, genre: "Romance" },
            { title: "Pride and Prejudice", year: 2005, genre: "Romance" },
            { title: "The Exorcist", year: 1973, genre: "Horror" },
            { title: "Halloween", year: 1978, genre: "Horror" },
            { title: "A Nightmare on Elm Street", year: 1984, genre: "Horror" },
            { title: "The Shining", year: 1980, genre: "Horror" },
            { title: "Get Out", year: 2017, genre: "Horror" },
            { title: "Superbad", year: 2007, genre: "Comedy" },
            { title: "The Hangover", year: 2009, genre: "Comedy" },
            { title: "Anchorman", year: 2004, genre: "Comedy" },
            { title: "Dumb and Dumber", year: 1994, genre: "Comedy" },
            { title: "Borat", year: 2006, genre: "Comedy" },
            { title: "Harry Potter and the Philosopher's Stone", year: 2001, genre: "Fantasy" },
            { title: "The Hobbit", year: 2012, genre: "Fantasy" },
            { title: "Pirates of the Caribbean", year: 2003, genre: "Fantasy" },
            { title: "The Chronicles of Narnia", year: 2005, genre: "Fantasy" },
            { title: "Game of Thrones", year: 2011, genre: "Fantasy" }
        ];
        
        this.initializeApp();
    }

    initializeApp() {
        this.setupEventListeners();
        this.displayFavoriteMovies();
        this.updateStats();
        this.toggleEmptyState();
        this.setupAutocomplete();
    }

    setupEventListeners() {
        // Form submission
        const movieForm = document.getElementById('movieForm');
        if (movieForm) {
            movieForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addMovie();
            });
        }

        // Get recommendations button
        const getRecommendationsBtn = document.getElementById('getRecommendations');
        if (getRecommendationsBtn) {
            getRecommendationsBtn.addEventListener('click', () => {
                this.getRecommendations();
            });
        }

        // Clear all movies button
        const clearMoviesBtn = document.getElementById('clearMovies');
        if (clearMoviesBtn) {
            clearMoviesBtn.addEventListener('click', () => {
                this.clearAllMovies();
            });
        }

        // Filter and sort controls
        const genreFilter = document.getElementById('genreFilter');
        if (genreFilter) {
            genreFilter.addEventListener('change', () => {
                this.applyFilters();
            });
        }

        const sortBy = document.getElementById('sortBy');
        if (sortBy) {
            sortBy.addEventListener('change', () => {
                this.applyFilters();
            });
        }

        // Rating system event listeners
        document.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', (e) => {
                this.setRating(parseInt(e.target.dataset.value));
            });
            
            star.addEventListener('mouseenter', (e) => {
                this.highlightStars(parseInt(e.target.dataset.value));
            });
        });

        const ratingContainer = document.querySelector('.rating');
        if (ratingContainer) {
            ratingContainer.addEventListener('mouseleave', () => {
                this.highlightStars(this.selectedRating);
            });
        }
    }

    setupAutocomplete() {
        const titleInput = document.getElementById('movieTitle');
        if (!titleInput) return;
        
        // Create suggestions dropdown
        const suggestionsDropdown = document.createElement('div');
        suggestionsDropdown.className = 'suggestions-dropdown';
        suggestionsDropdown.style.display = 'none';
        titleInput.parentNode.appendChild(suggestionsDropdown);

        titleInput.addEventListener('input', (e) => {
            this.handleAutocomplete(e.target.value, suggestionsDropdown);
        });

        titleInput.addEventListener('blur', () => {
            // Delay hiding to allow click on suggestions
            setTimeout(() => {
                suggestionsDropdown.style.display = 'none';
            }, 200);
        });

        titleInput.addEventListener('focus', (e) => {
            if (e.target.value.length > 0) {
                this.handleAutocomplete(e.target.value, suggestionsDropdown);
            }
        });
    }

    handleAutocomplete(query, dropdown) {
        if (query.length < 2) {
            dropdown.style.display = 'none';
            return;
        }

        const suggestions = this.movieDatabase.filter(movie =>
            movie.title.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);

        if (suggestions.length === 0) {
            dropdown.style.display = 'none';
            return;
        }

        dropdown.innerHTML = suggestions.map(movie => `
            <div class="suggestion-item" data-title="${movie.title}" data-year="${movie.year}" data-genre="${movie.genre}">
                <strong>${movie.title}</strong> (${movie.year}) - <em>${movie.genre}</em>
            </div>
        `).join('');

        dropdown.style.display = 'block';

        // Add click listeners to suggestions
        dropdown.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectMovie(item.dataset.title, item.dataset.year, item.dataset.genre, dropdown);
            });
        });
    }

    selectMovie(title, year, genre, dropdown) {
        document.getElementById('movieTitle').value = title;
        document.getElementById('movieYear').value = year;
        
        // Map genre to select option value
        const genreMapping = {
            'Action': 'action',
            'Comedy': 'comedy',
            'Drama': 'drama',
            'Horror': 'horror',
            'Romance': 'romance',
            'Sci-Fi': 'sci-fi',
            'Fantasy': 'fantasy'
        };
        
        const genreSelect = document.getElementById('movieGenre');
        if (genreSelect && genreMapping[genre]) {
            genreSelect.value = genreMapping[genre];
        }
        
        dropdown.style.display = 'none';
        
        // Show notification
        this.showNotification(`✨ Film rilevato automaticamente: ${title} (${year})`, 'success');
    }

    setRating(rating) {
        this.selectedRating = rating;
        this.highlightStars(rating);
        const ratingValue = document.getElementById('ratingValue');
        if (ratingValue) {
            ratingValue.textContent = rating;
        }
    }

    highlightStars(rating) {
        document.querySelectorAll('.star').forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    addMovie() {
        const titleInput = document.getElementById('movieTitle');
        const genreInput = document.getElementById('movieGenre');
        const yearInput = document.getElementById('movieYear');
        
        if (!titleInput || !genreInput || !yearInput) {
            this.showNotification('⚠️ Errore: campi del form non trovati!', 'error');
            return;
        }
        
        const title = titleInput.value.trim();
        const genre = genreInput.value;
        const year = parseInt(yearInput.value);
        const rating = this.selectedRating || 0;

        if (!title || !genre || !year) {
            this.showNotification('⚠️ Compila tutti i campi richiesti!', 'error');
            return;
        }

        if (year < 1900 || year > new Date().getFullYear() + 2) {
            this.showNotification('⚠️ Anno non valido!', 'error');
            return;
        }

        // Check for duplicates
        const exists = this.favoriteMovies.some(movie => 
            movie.title.toLowerCase() === title.toLowerCase() && movie.year === year
        );

        if (exists) {
            this.showNotification('⚠️ Questo film è già nella tua lista!', 'warning');
            return;
        }

        const movie = {
            id: Date.now(),
            title,
            genre,
            rating,
            year,
            addedAt: new Date()
        };

        this.favoriteMovies.push(movie);
        this.saveFavoriteMovies();
        this.displayFavoriteMovies();
        this.updateStats();
        
        // Animate the movies counter when adding a new movie
        this.animateNumber('totalMovies', this.favoriteMovies.length);
        
        this.toggleEmptyState();

        // Reset form
        const movieForm = document.getElementById('movieForm');
        if (movieForm) {
            movieForm.reset();
        }
        this.selectedRating = 0;
        this.highlightStars(0);
        const ratingValue = document.getElementById('ratingValue');
        if (ratingValue) {
            ratingValue.textContent = '0';
        }

        this.showNotification(`✅ "${title}" aggiunto ai preferiti!`, 'success');
    }

    async getRecommendations() {
        if (this.favoriteMovies.length === 0) {
            this.showNotification('⚠️ Aggiungi almeno un film ai preferiti per ottenere raccomandazioni!', 'warning');
            return;
        }

        const button = document.getElementById('getRecommendations');
        if (!button) return;
        
        const originalText = button.textContent;
        button.textContent = '🔄 Generando raccomandazioni...';
        button.disabled = true;

        try {
            const userFavorites = {
                movies: this.favoriteMovies.map(movie => ({
                    title: movie.title,
                    genre: movie.genre,
                    year: movie.year,
                    rating: movie.rating
                }))
            };

            const response = await fetch(`${this.API_BASE_URL}/movies/recommendations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userFavorites)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const recommendations = await response.json();
            this.currentRecommendations = recommendations;
            this.displayRecommendations(recommendations);
            
            // Animate recommendations counter
            this.animateNumber('totalRecommendations', recommendations.length);
            
            this.showNotification(`🎬 ${recommendations.length} nuove raccomandazioni generate!`, 'success');

        } catch (error) {
            console.error('Error getting recommendations:', error);
            this.showNotification('❌ Errore nel recupero delle raccomandazioni. Verifica che i servizi siano attivi.', 'error');
        } finally {
            button.textContent = originalText;
            button.disabled = false;
        }
    }

    displayRecommendations(recommendations) {
        const container = document.getElementById('recommendationsList');
        if (!container) return;
        
        if (recommendations.length === 0) {
            container.innerHTML = `
                <div class="no-recommendations">
                    <p>🤔 Nessuna nuova raccomandazione trovata al momento.</p>
                    <p>Prova ad aggiungere più film con generi diversi!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = recommendations.map(movie => `
            <div class="recommendation-card">
                <div class="movie-header">
                    <h3>${movie.title}</h3>
                    <span class="year-badge">${movie.year}</span>
                </div>
                <div class="movie-details">
                    <span class="genre-tag">${movie.genre}</span>
                    <div class="recommendation-reason">
                        <strong>Perché te lo consiglio:</strong>
                        <p>${movie.reason}</p>
                    </div>
                    <div class="confidence-score">
                        <span>Compatibilità: <strong>${Math.round(movie.score * 100)}%</strong></span>
                        <div class="confidence-bar">
                            <div class="confidence-fill" style="width: ${movie.score * 100}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    displayFavoriteMovies() {
        const container = document.getElementById('favoriteMoviesList');
        if (!container) return;
        
        if (this.favoriteMovies.length === 0) {
            container.innerHTML = '';
            return;
        }

        // Apply filters before displaying
        this.applyFilters();
    }

    applyFilters() {
        const container = document.getElementById('favoriteMoviesList');
        if (!container) return;

        // Get filter values
        const genreFilter = document.getElementById('genreFilter');
        const sortBy = document.getElementById('sortBy');
        
        const selectedGenre = genreFilter ? genreFilter.value : '';
        const sortOption = sortBy ? sortBy.value : 'recent';

        // Filter movies by genre
        let filteredMovies = [...this.favoriteMovies];
        if (selectedGenre) {
            filteredMovies = filteredMovies.filter(movie => movie.genre === selectedGenre);
        }

        // Sort movies
        switch (sortOption) {
            case 'recent':
                filteredMovies.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
                break;
            case 'rating':
                filteredMovies.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'title':
                filteredMovies.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'year':
                filteredMovies.sort((a, b) => b.year - a.year);
                break;
        }

        // Update display
        this.renderMoviesList(filteredMovies);
        
        // Update counter
        const moviesCountElement = document.getElementById('moviesCount');
        if (moviesCountElement) {
            const totalMovies = this.favoriteMovies.length;
            const filteredCount = filteredMovies.length;
            
            if (selectedGenre) {
                moviesCountElement.textContent = `${filteredCount} di ${totalMovies} film (filtrati per ${this.getGenreDisplayName(selectedGenre)})`;
            } else {
                moviesCountElement.textContent = `${totalMovies} film nella collezione`;
            }
        }
    }

    getGenreDisplayName(genreValue) {
        const genreNames = {
            'action': 'Azione',
            'comedy': 'Commedia', 
            'drama': 'Drama',
            'horror': 'Horror',
            'sci-fi': 'Fantascienza',
            'romance': 'Romantico',
            'thriller': 'Thriller',
            'adventure': 'Avventura',
            'animation': 'Animazione',
            'documentary': 'Documentario',
            'fantasy': 'Fantasy'
        };
        return genreNames[genreValue] || genreValue;
    }

    renderMoviesList(movies) {
        const container = document.getElementById('favoriteMoviesList');
        if (!container) return;

        if (movies.length === 0) {
            container.innerHTML = `
                <div class="no-movies-filtered">
                    <p>🔍 Nessun film trovato con i filtri selezionati.</p>
                    <p>Prova a cambiare i criteri di filtro.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = movies.map(movie => `
            <li class="movie-card" data-movie-id="${movie.id}">
                <div class="movie-header">
                    <h3>${movie.title}</h3>
                    <button class="remove-btn" onclick="app.removeMovie(${movie.id})" title="Rimuovi film">
                        🗑️
                    </button>
                </div>
                <div class="movie-details">
                    <span class="year-badge">${movie.year}</span>
                    <span class="genre-tag">${this.getGenreDisplayName(movie.genre)}</span>
                    ${movie.rating > 0 ? `
                        <div class="movie-rating">
                            <span class="rating-label">Voto:</span>
                            <div class="stars-display">
                                ${'⭐'.repeat(movie.rating)}
                            </div>
                        </div>
                    ` : ''}
                </div>
                <div class="movie-meta">
                    <small>Aggiunto il ${new Date(movie.addedAt).toLocaleDateString('it-IT')}</small>
                </div>
            </li>
        `).join('');
    }

    removeMovie(id) {
        const movieIndex = this.favoriteMovies.findIndex(movie => movie.id === id);
        if (movieIndex !== -1) {
            const removedMovie = this.favoriteMovies[movieIndex];
            this.favoriteMovies.splice(movieIndex, 1);
            this.saveFavoriteMovies();
            this.displayFavoriteMovies();
            this.updateStats();
            this.toggleEmptyState();
            
            // Animate the movies counter when removing a movie
            this.animateNumber('totalMovies', this.favoriteMovies.length);
            
            this.showNotification(`🗑️ "${removedMovie.title}" rimosso dai preferiti!`, 'info');
        }
    }

    clearAllMovies() {
        if (this.favoriteMovies.length === 0) {
            this.showNotification('📭 La lista è già vuota!', 'info');
            return;
        }

        if (confirm('🗑️ Sei sicuro di voler rimuovere tutti i film dalla lista?')) {
            const count = this.favoriteMovies.length;
            this.favoriteMovies = [];
            this.saveFavoriteMovies();
            this.displayFavoriteMovies();
            this.updateStats();
            this.toggleEmptyState();
            
            // Clear recommendations
            const recommendationsContainer = document.getElementById('recommendationsContainer');
            if (recommendationsContainer) {
                recommendationsContainer.innerHTML = '';
            }
            this.currentRecommendations = [];
            
            // Reset counters with animation
            this.animateNumber('totalMovies', 0);
            this.animateNumber('totalRecommendations', 0);
            
            this.showNotification(`🧹 Rimossi ${count} film dalla lista!`, 'success');
        }
    }

    updateStats() {
        const totalMovies = this.favoriteMovies.length;
        const totalRecommendations = this.currentRecommendations.length;
        
        const totalMoviesElement = document.getElementById('totalMovies');
        const totalRecommendationsElement = document.getElementById('totalRecommendations');
        const moviesCountElement = document.getElementById('moviesCount');
        
        if (totalMoviesElement) {
            totalMoviesElement.textContent = totalMovies;
        }
        if (totalRecommendationsElement) {
            totalRecommendationsElement.textContent = totalRecommendations;
        }
        if (moviesCountElement) {
            moviesCountElement.textContent = `${totalMovies} film nella collezione`;
        }

        // Enable/disable recommendations button
        const getRecommendationsBtn = document.getElementById('getRecommendations');
        if (getRecommendationsBtn) {
            getRecommendationsBtn.disabled = totalMovies === 0;
        }

        // Update genre distribution
        const genreCount = {};
        this.favoriteMovies.forEach(movie => {
            genreCount[movie.genre] = (genreCount[movie.genre] || 0) + 1;
        });

        const favoriteGenre = Object.keys(genreCount).reduce((a, b) => 
            genreCount[a] > genreCount[b] ? a : b, 'Nessuno'
        );

        const favoriteGenreElement = document.getElementById('favoriteGenre');
        if (favoriteGenreElement) {
            favoriteGenreElement.textContent = totalMovies > 0 ? favoriteGenre : 'Nessuno';
        }

        // Update average rating
        const totalRating = this.favoriteMovies.reduce((sum, movie) => sum + (movie.rating || 0), 0);
        const averageRating = totalMovies > 0 ? (totalRating / totalMovies).toFixed(1) : '0.0';
        
        const averageRatingElement = document.getElementById('averageRating');
        if (averageRatingElement) {
            averageRatingElement.textContent = averageRating;
        }
    }

    animateNumber(elementId, targetNumber) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const startNumber = parseInt(element.textContent) || 0;
        const difference = targetNumber - startNumber;
        const duration = 500; // Animation duration in milliseconds
        const startTime = performance.now();

        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentNumber = Math.round(startNumber + (difference * easeOutQuart));

            element.textContent = currentNumber;

            if (progress < 1) {
                this.animationFrame = requestAnimationFrame(animate);
            }
        };

        this.animationFrame = requestAnimationFrame(animate);
    }

    toggleEmptyState() {
        const emptyState = document.getElementById('emptyState');
        const hasMovies = this.favoriteMovies.length > 0;
        
        if (emptyState) {
            emptyState.style.display = hasMovies ? 'none' : 'block';
        }
    }

    loadFavoriteMovies() {
        try {
            const stored = localStorage.getItem('favoriteMovies');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading favorite movies:', error);
            return [];
        }
    }

    saveFavoriteMovies() {
        try {
            localStorage.setItem('favoriteMovies', JSON.stringify(this.favoriteMovies));
        } catch (error) {
            console.error('Error saving favorite movies:', error);
            this.showNotification('⚠️ Errore nel salvataggio dei dati!', 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        // Add to page
        document.body.appendChild(notification);

        // Auto remove after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('fade-out');
                setTimeout(() => notification.remove(), 300);
            }
        }, 4000);
    }
}

// Notification styles
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .notification.success {
        background: linear-gradient(135deg, #10b981, #059669);
    }

    .notification.error {
        background: linear-gradient(135deg, #ef4444, #dc2626);
    }

    .notification.warning {
        background: linear-gradient(135deg, #f59e0b, #d97706);
    }

    .notification.info {
        background: linear-gradient(135deg, #3b82f6, #2563eb);
    }

    .notification.fade-out {
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease-in;
    }

    @media (max-width: 768px) {
        .notification {
            top: 10px;
            right: 10px;
            left: 10px;
            max-width: none;
            margin-left: auto;
        }
    }

    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }

    .empty-message {
        text-align: center;
        color: #718096;
        padding: 40px 20px;
        font-style: italic;
    }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Initialize the app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new MovieRecommendationApp();
});
