from flask import Flask, request, jsonify
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Database dei film per le raccomandazioni
MOVIE_DATABASE = {
    'action': [
        {'title': 'Mad Max: Fury Road', 'genre': 'action', 'reason': 'Azione adrenalinica con effetti spettacolari'},
        {'title': 'John Wick', 'genre': 'action', 'reason': 'Coreografie di combattimento mozzafiato'},
        {'title': 'The Raid', 'genre': 'action', 'reason': 'Arti marziali e azione pura'},
        {'title': 'Die Hard', 'genre': 'action', 'reason': 'Il classico film d\'azione per eccellenza'},
        {'title': 'Terminator 2', 'genre': 'action', 'reason': 'Sci-fi e azione in perfetto equilibrio'}
    ],
    'comedy': [
        {'title': 'The Grand Budapest Hotel', 'genre': 'comedy', 'reason': 'Commedia sofisticata e visualmente stupenda'},
        {'title': 'Superbad', 'genre': 'comedy', 'reason': 'Commedia brillante sui giovani'},
        {'title': 'The Big Lebowski', 'genre': 'comedy', 'reason': 'Cult movie con umorismo surreale'},
        {'title': 'Anchorman', 'genre': 'comedy', 'reason': 'Commedia demenziale irresistibile'},
        {'title': 'Groundhog Day', 'genre': 'comedy', 'reason': 'Commedia intelligente con Bill Murray'}
    ],
    'drama': [
        {'title': 'The Godfather', 'genre': 'drama', 'reason': 'Capolavoro assoluto del cinema'},
        {'title': 'Schindler\'s List', 'genre': 'drama', 'reason': 'Drama storico profondamente toccante'},
        {'title': 'One Flew Over the Cuckoo\'s Nest', 'genre': 'drama', 'reason': 'Psicologia e dramma umano'},
        {'title': 'The Social Network', 'genre': 'drama', 'reason': 'Drama moderno sulla tecnologia'},
        {'title': 'There Will Be Blood', 'genre': 'drama', 'reason': 'Performance straordinaria di Daniel Day-Lewis'}
    ],
    'horror': [
        {'title': 'Hereditary', 'genre': 'horror', 'reason': 'Horror psicologico disturbante'},
        {'title': 'The Conjuring', 'genre': 'horror', 'reason': 'Classico horror soprannaturale'},
        {'title': 'Get Out', 'genre': 'horror', 'reason': 'Horror sociale intelligente'},
        {'title': 'The Exorcist', 'genre': 'horror', 'reason': 'Il film horror più spaventoso di sempre'},
        {'title': 'A Quiet Place', 'genre': 'horror', 'reason': 'Suspense e tensione costante'}
    ],
    'sci-fi': [
        {'title': 'Blade Runner 2049', 'genre': 'sci-fi', 'reason': 'Fantascienza visivamente mozzafiato'},
        {'title': 'Interstellar', 'genre': 'sci-fi', 'reason': 'Sci-fi emotivo e spettacolare'},
        {'title': 'The Matrix', 'genre': 'sci-fi', 'reason': 'Rivoluzionario film cyberpunk'},
        {'title': 'Arrival', 'genre': 'sci-fi', 'reason': 'Fantascienza cerebrale e toccante'},
        {'title': 'Ex Machina', 'genre': 'sci-fi', 'reason': 'AI e questioni esistenziali'}
    ],
    'romance': [
        {'title': 'La La Land', 'genre': 'romance', 'reason': 'Musical romantico moderno'},
        {'title': 'The Princess Bride', 'genre': 'romance', 'reason': 'Fiaba romantica avventurosa'},
        {'title': 'Eternal Sunshine of the Spotless Mind', 'genre': 'romance', 'reason': 'Romance surreale e profondo'},
        {'title': 'Casablanca', 'genre': 'romance', 'reason': 'Classico romance intramontabile'},
        {'title': 'Before Sunset', 'genre': 'romance', 'reason': 'Dialoghi intimi e romantici'}
    ],
    'thriller': [
        {'title': 'Seven', 'genre': 'thriller', 'reason': 'Thriller psicologico dark'},
        {'title': 'Zodiac', 'genre': 'thriller', 'reason': 'Investigazione ossessiva e metodica'},
        {'title': 'No Country for Old Men', 'genre': 'thriller', 'reason': 'Thriller neo-western magistrale'},
        {'title': 'Gone Girl', 'genre': 'thriller', 'reason': 'Thriller psicologico moderno'},
        {'title': 'Heat', 'genre': 'thriller', 'reason': 'Crime thriller epico'}
    ],
    'adventure': [
        {'title': 'Indiana Jones: Raiders of the Lost Ark', 'genre': 'adventure', 'reason': 'Avventura classica'},
        {'title': 'Pirates of the Caribbean', 'genre': 'adventure', 'reason': 'Avventura marittima divertente'},
        {'title': 'Jurassic Park', 'genre': 'adventure', 'reason': 'Avventura preistorica emozionante'},
        {'title': 'The Mummy', 'genre': 'adventure', 'reason': 'Avventura archeologica'},
        {'title': 'National Treasure', 'genre': 'adventure', 'reason': 'Caccia al tesoro moderna'}
    ],
    'fantasy': [
        {'title': 'The Lord of the Rings: Fellowship', 'genre': 'fantasy', 'reason': 'Fantasy epico capolavoro'},
        {'title': 'Harry Potter: Philosopher\'s Stone', 'genre': 'fantasy', 'reason': 'Magia e avventura per tutti'},
        {'title': 'Pan\'s Labyrinth', 'genre': 'fantasy', 'reason': 'Dark fantasy visivamente stupendo'},
        {'title': 'The Shape of Water', 'genre': 'fantasy', 'reason': 'Fantasy romantico e poetico'},
        {'title': 'The Princess Mononoke', 'genre': 'fantasy', 'reason': 'Animazione fantasy giapponese'},
        {'title': 'The Chronicles of Narnia', 'genre': 'fantasy', 'reason': 'Fantasy classico per famiglie'},
        {'title': 'Game of Thrones (pilot)', 'genre': 'fantasy', 'reason': 'Fantasy medievale complesso'},
        {'title': 'The Hobbit', 'genre': 'fantasy', 'reason': 'Prequel magico del Signore degli Anelli'}
    ]
}

class RecommendationEngine:
    def __init__(self):
        self.movie_database = MOVIE_DATABASE
    
    def generate_recommendations(self, favorite_movies, num_recommendations=5):
        """
        Genera raccomandazioni basate sui film preferiti dell'utente
        
        Args:
            favorite_movies: Lista di film preferiti con title e genre
            num_recommendations: Numero di raccomandazioni da generare
        
        Returns:
            Lista di film raccomandati
        """
        if not favorite_movies:
            return self._get_random_recommendations(num_recommendations)
        
        # Estrai i generi preferiti
        preferred_genres = [movie.get('genre', '').lower() for movie in favorite_movies]
        genre_counts = {}
        
        for genre in preferred_genres:
            genre_counts[genre] = genre_counts.get(genre, 0) + 1
        
        # Ordina i generi per preferenza
        sorted_genres = sorted(genre_counts.items(), key=lambda x: x[1], reverse=True)
        
        recommendations = []
        used_titles = set(movie.get('title', '').lower() for movie in favorite_movies)
        
        # Genera raccomandazioni dai generi preferiti
        for genre, count in sorted_genres:
            if genre in self.movie_database:
                available_movies = [
                    movie for movie in self.movie_database[genre]
                    if movie['title'].lower() not in used_titles
                ]
                
                # Prendi più film dai generi più preferiti
                num_from_genre = min(len(available_movies), max(1, count))
                selected = random.sample(available_movies, num_from_genre)
                
                for movie in selected:
                    if len(recommendations) < num_recommendations:
                        movie_copy = movie.copy()
                        movie_copy['reason'] = f"Consigliato perché ti piace il genere {genre}: {movie['reason']}"
                        recommendations.append(movie_copy)
                        used_titles.add(movie['title'].lower())
        
        # Se non abbiamo abbastanza raccomandazioni, aggiungi da altri generi
        if len(recommendations) < num_recommendations:
            remaining_needed = num_recommendations - len(recommendations)
            other_movies = []
            
            for genre, movies in self.movie_database.items():
                if genre not in [g[0] for g in sorted_genres]:
                    other_movies.extend([
                        movie for movie in movies
                        if movie['title'].lower() not in used_titles
                    ])
            
            if other_movies:
                additional = random.sample(
                    other_movies, 
                    min(remaining_needed, len(other_movies))
                )
                
                for movie in additional:
                    movie_copy = movie.copy()
                    movie_copy['reason'] = f"Nuovo genere da esplorare: {movie['reason']}"
                    recommendations.append(movie_copy)
        
        return recommendations[:num_recommendations]
    
    def _get_random_recommendations(self, num_recommendations=5):
        """Genera raccomandazioni casuali quando non ci sono preferenze"""
        all_movies = []
        for movies in self.movie_database.values():
            all_movies.extend(movies)
        
        if len(all_movies) <= num_recommendations:
            return all_movies
        
        return random.sample(all_movies, num_recommendations)

# Inizializza il motore di raccomandazione
recommendation_engine = RecommendationEngine()

@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint per verificare che il servizio sia attivo"""
    return jsonify({
        'status': 'healthy',
        'service': 'Movie Recommendation Microservice',
        'version': '1.0.0'
    })

@app.route('/recommendations', methods=['POST'])
def get_recommendations():
    """
    Endpoint principale per ottenere raccomandazioni
    
    Accetta una lista di film preferiti e restituisce raccomandazioni
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Nessun dato ricevuto'}), 400
        
        # Il backend Java potrebbe inviare una lista di oggetti Movie
        favorite_movies = []
        if isinstance(data, list):
            favorite_movies = data
        elif isinstance(data, dict) and 'movies' in data:
            favorite_movies = data['movies']
        else:
            return jsonify({'error': 'Formato dati non valido'}), 400
        
        # Genera raccomandazioni
        recommendations = recommendation_engine.generate_recommendations(favorite_movies)
        
        app.logger.info(f"Generated {len(recommendations)} recommendations for {len(favorite_movies)} favorite movies")
        
        return jsonify(recommendations)
        
    except Exception as e:
        app.logger.error(f"Error generating recommendations: {str(e)}")
        return jsonify({'error': 'Errore interno del server'}), 500

@app.route('/genres', methods=['GET'])
def get_available_genres():
    """Restituisce la lista dei generi disponibili"""
    return jsonify({
        'genres': list(MOVIE_DATABASE.keys()),
        'total_movies': sum(len(movies) for movies in MOVIE_DATABASE.values())
    })

@app.route('/movies/<genre>', methods=['GET'])
def get_movies_by_genre(genre):
    """Restituisce tutti i film di un genere specifico"""
    genre = genre.lower()
    if genre not in MOVIE_DATABASE:
        return jsonify({'error': f'Genere "{genre}" non trovato'}), 404
    
    return jsonify({
        'genre': genre,
        'movies': MOVIE_DATABASE[genre]
    })

if __name__ == '__main__':
    print("🎬 Starting Movie Recommendation Microservice...")
    print("📍 Service will be available at: http://localhost:5001")
    print("🔍 Health check: http://localhost:5001/health")
    print("🎯 Recommendations endpoint: POST http://localhost:5001/recommendations")
    
    app.run(debug=True, host='0.0.0.0', port=5001)
