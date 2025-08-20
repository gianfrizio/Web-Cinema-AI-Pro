// Enhanced Movie Recommendation App with Advanced Features
class MovieRecommendationApp {
    constructor() {
        this.favoriteMovies = JSON.parse(localStorage.getItem('favoriteMovies')) || [];
        this.currentFilter = '';
        this.currentSort = 'recent';
        this.selectedRating = 0;
        this.totalRecommendations = 0;
        this.apiBaseUrl = 'http://localhost:8080/api';
        
        // Database di film popolari per autocompletamento
        this.moviesDatabase = [
            // Film famosi con dati completi
            { title: "The Shawshank Redemption", genre: "drama", year: 1994 },
            { title: "The Godfather", genre: "drama", year: 1972 },
            { title: "The Dark Knight", genre: "action", year: 2008 },
            { title: "Pulp Fiction", genre: "thriller", year: 1994 },
            { title: "The Lord of the Rings: The Fellowship of the Ring", genre: "fantasy", year: 2001 },
            { title: "Forrest Gump", genre: "drama", year: 1994 },
            { title: "Inception", genre: "sci-fi", year: 2010 },
            { title: "The Matrix", genre: "sci-fi", year: 1999 },
            { title: "Goodfellas", genre: "thriller", year: 1990 },
            { title: "The Silence of the Lambs", genre: "horror", year: 1991 },
            { title: "Saving Private Ryan", genre: "drama", year: 1998 },
            { title: "Terminator 2: Judgment Day", genre: "action", year: 1991 },
            { title: "Interstellar", genre: "sci-fi", year: 2014 },
            { title: "The Avengers", genre: "action", year: 2012 },
            { title: "Avatar", genre: "sci-fi", year: 2009 },
            { title: "Titanic", genre: "romance", year: 1997 },
            { title: "The Departed", genre: "thriller", year: 2006 },
            { title: "Fight Club", genre: "drama", year: 1999 },
            { title: "The Empire Strikes Back", genre: "sci-fi", year: 1980 },
            { title: "The Return of the King", genre: "fantasy", year: 2003 },
            { title: "Harry Potter and the Philosopher's Stone", genre: "fantasy", year: 2001 },
            { title: "Spider-Man", genre: "action", year: 2002 },
            { title: "Iron Man", genre: "action", year: 2008 },
            { title: "Jurassic Park", genre: "adventure", year: 1993 },
            { title: "E.T. the Extra-Terrestrial", genre: "sci-fi", year: 1982 },
            { title: "The Lion King", genre: "animation", year: 1994 },
            { title: "Toy Story", genre: "animation", year: 1995 },
            { title: "Back to the Future", genre: "sci-fi", year: 1985 },
            { title: "Gladiator", genre: "action", year: 2000 },
            { title: "The Prestige", genre: "thriller", year: 2006 },
            { title: "Memento", genre: "thriller", year: 2000 },
            { title: "The Social Network", genre: "drama", year: 2010 },
            { title: "Her", genre: "romance", year: 2013 },
            { title: "Mad Max: Fury Road", genre: "action", year: 2015 },
            { title: "Blade Runner 2049", genre: "sci-fi", year: 2017 },
            { title: "Parasite", genre: "thriller", year: 2019 },
            { title: "Joker", genre: "drama", year: 2019 },
            { title: "Once Upon a Time in Hollywood", genre: "drama", year: 2019 },
            { title: "Avengers: Endgame", genre: "action", year: 2019 },
            { title: "The Grand Budapest Hotel", genre: "comedy", year: 2014 }
        ];
        
        this.initializeApp();
        this.setupEventListeners();
        this.displayFavoriteMovies();
        this.updateStats();
    }

    initializeApp() {
        // Initialize star rating
        this.setupStarRating();
        
        // Set current year as default
        const currentYear = new Date().getFullYear();
        document.getElementById('movieYear').value = currentYear;
        
        // Show/hide empty state
        this.toggleEmptyState();
        
        // Add some sample data for demo (remove in production)
        if (this.favoriteMovies.length === 0) {
            this.addSampleData();
        }
    }

    addSampleData() {
        // Add some sample movies for demonstration
        const sampleMovies = [
            { id: 1, title: "Inception", genre: "sci-fi", rating: 5, year: 2010, addedAt: new Date('2024-01-01') },
            { id: 2, title: "The Shawshank Redemption", genre: "drama", rating: 5, year: 1994, addedAt: new Date('2024-01-02') },
            { id: 3, title: "Pulp Fiction", genre: "thriller", rating: 4, year: 1994, addedAt: new Date('2024-01-03') }
        ];
        
        this.favoriteMovies = sampleMovies;
        this.saveFavoriteMovies();
        this.displayFavoriteMovies();
        this.updateStats();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('movieForm').addEventListener('submit', (e) => this.handleAddMovie(e));
        
        // Autocompletamento per il titolo del film
        const titleInput = document.getElementById('movieTitle');
        titleInput.addEventListener('input', (e) => this.handleTitleInput(e));
        titleInput.addEventListener('keydown', (e) => this.handleTitleKeydown(e));
        titleInput.addEventListener('blur', () => this.hideSuggestions());
        
        // Recommendations button
        document.getElementById('getRecommendations').addEventListener('click', () => this.getRecommendations());
        
        // Clear all button
        const clearAllBtn = document.getElementById('clearAll');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
                console.log('Clear all button clicked'); // Debug
                this.clearAllMovies();
            });
        } else {
            console.error('clearAll button not found!');
        }
        
        // Filters and sorting
        document.getElementById('genreFilter').addEventListener('change', (e) => this.handleFilterChange(e));
        document.getElementById('sortBy').addEventListener('change', (e) => this.handleSortChange(e));
        
        // Recommendation controls
        document.getElementById('recommendationCount').addEventListener('change', () => this.updateRecommendationSettings());
        document.getElementById('similarityLevel').addEventListener('change', () => this.updateRecommendationSettings());
    }

    setupStarRating() {
        const stars = document.querySelectorAll('.star');
        const ratingText = document.getElementById('ratingText');
        const ratingInput = document.getElementById('movieRating');

        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                this.selectedRating = index + 1;
                ratingInput.value = this.selectedRating;
                
                // Update visual state
                stars.forEach((s, i) => {
                    s.classList.toggle('active', i < this.selectedRating);
                });
                
                // Update text
                const ratingTexts = ['Pessimo', 'Scarso', 'Discreto', 'Buono', 'Eccellente'];
                ratingText.textContent = `${this.selectedRating}/5 - ${ratingTexts[this.selectedRating - 1]}`;
            });

            star.addEventListener('mouseenter', () => {
                stars.forEach((s, i) => {
                    s.style.filter = i <= index ? 'grayscale(0%)' : 'grayscale(100%)';
                    s.style.opacity = i <= index ? '1' : '0.4';
                });
            });
        });

        // Reset on mouse leave
        document.querySelector('.star-rating').addEventListener('mouseleave', () => {
            stars.forEach((s, i) => {
                const isActive = i < this.selectedRating;
                s.style.filter = isActive ? 'grayscale(0%)' : 'grayscale(100%)';
                s.style.opacity = isActive ? '1' : '0.4';
            });
        });
    }

    handleAddMovie(e) {
        e.preventDefault();
        
        const titleInput = document.getElementById('movieTitle');
        const genreSelect = document.getElementById('movieGenre');
        const ratingInput = document.getElementById('movieRating');
        const yearInput = document.getElementById('movieYear');
        
        const title = titleInput.value.trim();
        const genre = genreSelect.value;
        const rating = parseInt(ratingInput.value) || 3; // Default 3 stelle se non specificato
        const year = parseInt(yearInput.value) || new Date().getFullYear();

        // Validation - solo titolo e genere sono obbligatori
        if (!title || !genre) {
            this.showError('Per favore inserisci almeno il titolo e il genere del film.');
            return;
        }

        // Check duplicates
        if (this.favoriteMovies.some(movie => 
            movie.title.toLowerCase() === title.toLowerCase())) {
            this.showError('Questo film è già nella tua collezione!');
            return;
        }

        // Add movie
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
        this.resetForm();
        this.showSuccess(`"${title}" aggiunto alla tua collezione!`);
    }

    handleTitleInput(e) {
        const query = e.target.value.trim();
        if (query.length < 2) {
            this.hideSuggestions();
            return;
        }

        // Cerca film che matchano
        const matches = this.moviesDatabase.filter(movie => 
            movie.title.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5); // Massimo 5 suggerimenti

        this.showSuggestions(matches, e.target);
    }

    handleTitleKeydown(e) {
        const suggestionsList = document.getElementById('suggestions-list');
        if (!suggestionsList || suggestionsList.style.display === 'none') return;

        const items = suggestionsList.querySelectorAll('.suggestion-item');
        let currentIndex = [...items].findIndex(item => item.classList.contains('selected'));

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
            this.updateSelectedSuggestion(items, currentIndex);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
            this.updateSelectedSuggestion(items, currentIndex);
        } else if (e.key === 'Enter' && currentIndex >= 0) {
            e.preventDefault();
            this.selectMovie(items[currentIndex].dataset.movieData);
        } else if (e.key === 'Escape') {
            this.hideSuggestions();
        }
    }

    showSuggestions(matches, inputElement) {
        let suggestionsList = document.getElementById('suggestions-list');
        
        if (!suggestionsList) {
            suggestionsList = document.createElement('div');
            suggestionsList.id = 'suggestions-list';
            suggestionsList.className = 'suggestions-dropdown';
            inputElement.parentNode.appendChild(suggestionsList);
        }

        if (matches.length === 0) {
            this.hideSuggestions();
            return;
        }

        suggestionsList.innerHTML = matches.map(movie => `
            <div class="suggestion-item" data-movie-data='${JSON.stringify(movie)}'>
                <div class="suggestion-title">${movie.title}</div>
                <div class="suggestion-details">${movie.year} • ${this.getGenreIcon(movie.genre)} ${this.capitalizeFirst(movie.genre)}</div>
            </div>
        `).join('');

        suggestionsList.style.display = 'block';

        // Event listeners per i click sui suggerimenti
        suggestionsList.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('mousedown', (e) => {
                e.preventDefault(); // Previene il blur
                this.selectMovie(item.dataset.movieData);
            });
        });
    }

    hideSuggestions() {
        const suggestionsList = document.getElementById('suggestions-list');
        if (suggestionsList) {
            suggestionsList.style.display = 'none';
        }
    }

    updateSelectedSuggestion(items, index) {
        items.forEach((item, i) => {
            item.classList.toggle('selected', i === index);
        });
    }

    selectMovie(movieDataString) {
        const movie = JSON.parse(movieDataString);
        
        // Compila automaticamente i campi
        document.getElementById('movieTitle').value = movie.title;
        document.getElementById('movieGenre').value = movie.genre;
        document.getElementById('movieYear').value = movie.year;
        
        this.hideSuggestions();
        
        // Mostra notifica
        this.showSuccess(`Film riconosciuto: ${movie.title} (${movie.year})`);
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

        // Smooth scroll to movie list
        document.querySelector('.favorite-movies').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
        });
    }

    resetForm() {
        document.getElementById('movieForm').reset();
        this.selectedRating = 0;
        document.getElementById('movieRating').value = '';
        document.getElementById('ratingText').textContent = 'Seleziona una valutazione';
        document.querySelectorAll('.star').forEach(star => star.classList.remove('active'));
        document.getElementById('movieYear').value = new Date().getFullYear();
    }

    removeMovie(movieId) {
        this.favoriteMovies = this.favoriteMovies.filter(movie => movie.id !== movieId);
        this.saveFavoriteMovies();
        this.displayFavoriteMovies();
        this.updateStats();
        this.toggleEmptyState();
        
        this.showSuccess('Film rimosso dalla collezione');
    }

    clearAllMovies() {
        console.log('clearAllMovies called'); // Debug
        console.log('Current movies count:', this.favoriteMovies.length); // Debug
        
        if (confirm('Sei sicuro di voler rimuovere tutti i film dalla tua collezione?')) {
            console.log('User confirmed clear all'); // Debug
            
            try {
                this.favoriteMovies = [];
                this.saveFavoriteMovies();
                this.displayFavoriteMovies();
                this.updateStats();
                this.toggleEmptyState();
                this.clearRecommendations();
                
                this.showSuccess('Collezione svuotata');
                console.log('Clear all completed successfully'); // Debug
            } catch (error) {
                console.error('Error in clearAllMovies:', error);
            }
        } else {
            console.log('User cancelled clear all'); // Debug
        }
    }

    handleFilterChange(e) {
        this.currentFilter = e.target.value;
        this.displayFavoriteMovies();
    }

    handleSortChange(e) {
        this.currentSort = e.target.value;
        this.displayFavoriteMovies();
    }

    getFilteredAndSortedMovies() {
        let movies = [...this.favoriteMovies];

        // Apply filter
        if (this.currentFilter) {
            movies = movies.filter(movie => movie.genre === this.currentFilter);
        }

        // Apply sorting
        switch (this.currentSort) {
            case 'rating':
                movies.sort((a, b) => b.rating - a.rating);
                break;
            case 'title':
                movies.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'year':
                movies.sort((a, b) => b.year - a.year);
                break;
            case 'recent':
            default:
                movies.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
                break;
        }

        return movies;
    }

    displayFavoriteMovies() {
        const moviesList = document.getElementById('favoriteMoviesList');
        const moviesCount = document.getElementById('moviesCount');
        const movies = this.getFilteredAndSortedMovies();
        
        // Update count
        const total = this.favoriteMovies.length;
        const filtered = movies.length;
        moviesCount.textContent = this.currentFilter ? 
            `${filtered} di ${total} film` : 
            `${total} film nella collezione`;

        if (movies.length === 0) {
            moviesList.innerHTML = this.currentFilter ? 
                '<li class="empty-message">Nessun film trovato per questo genere</li>' :
                '<li class="empty-message">Nessun film nella collezione</li>';
            return;
        }

        moviesList.innerHTML = movies.map(movie => `
            <li class="movie-item" data-genre="${movie.genre}">
                <div class="movie-info">
                    <div class="movie-title">${this.escapeHtml(movie.title)}</div>
                    <div class="movie-details">
                        <span class="movie-genre">${this.getGenreIcon(movie.genre)} ${movie.genre}</span>
                        <div class="movie-rating">
                            ${this.generateStars(movie.rating)}
                            <span>${movie.rating}/5</span>
                        </div>
                        <span class="movie-year">${movie.year}</span>
                    </div>
                </div>
                <div class="movie-actions">
                    <button class="remove-btn" onclick="app.removeMovie(${movie.id})" 
                            title="Rimuovi dalla collezione">
                        <span style="font-size: 1.2em;">🗑️</span>
                    </button>
                </div>
            </li>
        `).join('');

        // Update buttons state
        const hasMovies = this.favoriteMovies.length > 0;
        document.getElementById('getRecommendations').disabled = !hasMovies;
        document.getElementById('clearAll').disabled = !hasMovies;
        
        // Force enable clearAll button for testing if it has movies
        if (hasMovies) {
            const clearBtn = document.getElementById('clearAll');
            clearBtn.disabled = false;
            clearBtn.style.pointerEvents = 'auto';
            clearBtn.style.cursor = 'pointer';
            console.log('Clear button should be enabled now, movies count:', this.favoriteMovies.length);
        }
    }

    generateStars(rating) {
        return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
    }

    getGenreIcon(genre) {
        const icons = {
            'action': '🎬',
            'comedy': '😂',
            'drama': '🎭',
            'horror': '👻',
            'sci-fi': '🚀',
            'romance': '💕',
            'thriller': '🔥',
            'adventure': '🗺️',
            'fantasy': '🧙',
            'animation': '🎨',
            'documentary': '📚'
        };
        return icons[genre] || '🎥';
    }

    async getRecommendations() {
        if (this.favoriteMovies.length === 0) {
            this.showError('Aggiungi almeno un film per ottenere raccomandazioni!');
            return;
        }

        this.showLoading();
        this.clearRecommendations();

        try {
            // Simulate loading steps
            this.updateLoadingStep(0);
            await this.delay(1000);
            
            this.updateLoadingStep(1);
            await this.delay(1000);
            
            this.updateLoadingStep(2);
            await this.delay(500);

            // Send to backend
            const userResponse = await fetch(`${this.apiBaseUrl}/users/favorites`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: 'user123',
                    favoriteMovies: this.favoriteMovies
                })
            });

            if (!userResponse.ok) throw new Error('Backend error');

            const recommendationsResponse = await fetch(`${this.apiBaseUrl}/recommendations/user123`);
            if (!recommendationsResponse.ok) throw new Error('Recommendations error');

            const recommendations = await recommendationsResponse.json();
            this.renderRecommendations(recommendations);

        } catch (error) {
            console.error('Error:', error);
            // Show enhanced mock recommendations
            this.showEnhancedMockRecommendations();
        } finally {
            this.hideLoading();
        }
    }

    updateLoadingStep(activeIndex) {
        const steps = document.querySelectorAll('.step');
        steps.forEach((step, index) => {
            step.classList.toggle('active', index === activeIndex);
        });
    }

    showEnhancedMockRecommendations() {
        const count = parseInt(document.getElementById('recommendationCount').value);
        const similarity = document.getElementById('similarityLevel').value;
        
        const allRecommendations = [
            { title: "Blade Runner 2049", genre: "sci-fi", reason: "Basato sul tuo amore per la fantascienza cerebrale", score: 95, year: 2017 },
            { title: "Interstellar", genre: "sci-fi", reason: "Complessa narrativa sci-fi come Inception", score: 92, year: 2014 },
            { title: "The Prestige", genre: "thriller", reason: "Altro capolavoro di Christopher Nolan", score: 88, year: 2006 },
            { title: "Ex Machina", genre: "sci-fi", reason: "AI e temi filosofici profondi", score: 85, year: 2014 },
            { title: "Arrival", genre: "sci-fi", reason: "Fantascienza intellettuale e emozionante", score: 83, year: 2016 },
            { title: "The Matrix", genre: "sci-fi", reason: "Rivoluzionario come i tuoi film preferiti", score: 90, year: 1999 },
            { title: "Memento", genre: "thriller", reason: "Narrativa non lineare di Nolan", score: 87, year: 2000 },
            { title: "Her", genre: "romance", reason: "Sci-fi emotiva e originale", score: 81, year: 2013 },
            { title: "Eternal Sunshine", genre: "romance", reason: "Complesso e emotivamente profondo", score: 84, year: 2004 },
            { title: "Mad Max: Fury Road", genre: "action", reason: "Azione visivamente spettacolare", score: 89, year: 2015 }
        ];

        // Filter based on similarity level
        let recommendations = allRecommendations;
        if (similarity === 'high') {
            // Prefer similar genres
            const userGenres = [...new Set(this.favoriteMovies.map(m => m.genre))];
            recommendations = recommendations.filter(r => userGenres.includes(r.genre));
        }

        // Take requested count
        recommendations = recommendations.slice(0, count);
        
        this.totalRecommendations += recommendations.length;
        this.updateStats();
        
        // Animate the recommendations counter when getting new recommendations
        this.animateNumber('totalRecommendations', this.totalRecommendations);
        
        this.renderRecommendations(recommendations);
    }

    renderRecommendations(recommendations) {
        const recommendationsList = document.getElementById('recommendationsList');
        
        if (!recommendations || recommendations.length === 0) {
            recommendationsList.innerHTML = '<div class="empty-state"><h3>Nessuna raccomandazione disponibile</h3></div>';
            return;
        }

        recommendationsList.innerHTML = recommendations.map(movie => `
            <div class="recommendation-card">
                <div class="recommendation-title">${this.escapeHtml(movie.title)}</div>
                <div class="recommendation-genre">${this.getGenreIcon(movie.genre)} ${movie.genre}</div>
                <div class="recommendation-reason">${this.escapeHtml(movie.reason)}</div>
                <div class="recommendation-meta">
                    <span>Anno: ${movie.year || 'N/A'}</span>
                    <span class="recommendation-score">Match: ${movie.score || 85}%</span>
                </div>
            </div>
        `).join('');

        // Hide empty state
        document.getElementById('noRecommendations').classList.add('hidden');
    }

    updateStats() {
        const moviesCount = this.favoriteMovies.length;
        const recsCount = this.totalRecommendations;
        
        // Update text directly without animation to avoid conflicts
        document.getElementById('totalMovies').textContent = moviesCount;
        document.getElementById('totalRecommendations').textContent = recsCount;
        
        // Only animate on significant changes (when adding/removing movies or getting recommendations)
        // This prevents the flickering bug
    }

    animateNumber(elementId, targetNumber) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const startNumber = parseInt(element.textContent) || 0;
        if (startNumber === targetNumber) return; // Don't animate if same number
        
        const duration = 800;
        const steps = 20;
        const increment = (targetNumber - startNumber) / steps;
        
        // Clear any existing animation
        if (element.animationTimer) {
            clearInterval(element.animationTimer);
        }
        
        let current = startNumber;
        element.animationTimer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= targetNumber) || 
                (increment < 0 && current <= targetNumber)) {
                current = targetNumber;
                clearInterval(element.animationTimer);
                element.animationTimer = null;
            }
            element.textContent = Math.round(current);
        }, duration / steps);
    }

    toggleEmptyState() {
        const isEmpty = this.favoriteMovies.length === 0;
        document.getElementById('noRecommendations').classList.toggle('hidden', !isEmpty);
    }

    showLoading() {
        document.getElementById('loadingSpinner').classList.remove('hidden');
        document.getElementById('recommendationsList').innerHTML = '';
    }

    hideLoading() {
        document.getElementById('loadingSpinner').classList.add('hidden');
    }

    clearRecommendations() {
        document.getElementById('recommendationsList').innerHTML = '';
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    updateRecommendationSettings() {
        // This could trigger re-generation of recommendations if needed
        console.log('Recommendation settings updated');
    }

    saveFavoriteMovies() {
        localStorage.setItem('favoriteMovies', JSON.stringify(this.favoriteMovies));
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, creating app...');
    try {
        window.app = new MovieRecommendationApp();
        window.movieApp = window.app; // For debugging/alternative access
        console.log('App created successfully:', window.app);
        
        // Test function directly accessible
        window.testClearFunction = function() {
            console.log('Test clear function called');
            if (window.app && window.app.clearAllMovies) {
                window.app.clearAllMovies();
            } else {
                console.error('App or clearAllMovies method not found');
            }
        };
        
    } catch (error) {
        console.error('Error creating app:', error);
    }
});

// Add notification styles dynamically
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    }
    
    .notification.success {
        background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
    }
    
    .notification.error {
        background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
    }
    
    .notification button {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        margin-left: auto;
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
