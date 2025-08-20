package com.movierecommendation.service;

import com.movierecommendation.model.Movie;
import com.movierecommendation.model.MovieRecommendation;
import com.movierecommendation.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Arrays;

@Service
public class MovieService {

    @Autowired
    private MovieRepository movieRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final String PYTHON_SERVICE_URL = "http://localhost:5001";

    @Transactional
    public void saveFavoriteMovies(String userId, List<Movie> movies) {
        // Remove existing movies for this user
        movieRepository.deleteByUserId(userId);
        
        // Save new movies
        for (Movie movie : movies) {
            movie.setUserId(userId);
            movieRepository.save(movie);
        }
    }

    public List<Movie> getFavoriteMovies(String userId) {
        return movieRepository.findByUserId(userId);
    }

    public List<MovieRecommendation> getRecommendations(String userId) {
        try {
            List<Movie> favoriteMovies = getFavoriteMovies(userId);
            
            if (favoriteMovies.isEmpty()) {
                return getDefaultRecommendations();
            }

            // Call Python microservice for recommendations
            String url = PYTHON_SERVICE_URL + "/recommendations";
            
            ResponseEntity<MovieRecommendation[]> response = restTemplate.postForEntity(
                url, 
                favoriteMovies, 
                MovieRecommendation[].class
            );
            
            if (response.getBody() != null) {
                return Arrays.asList(response.getBody());
            }
            
        } catch (Exception e) {
            System.err.println("Error calling Python service: " + e.getMessage());
            // Fallback to default recommendations
        }
        
        return getDefaultRecommendations();
    }

    private List<MovieRecommendation> getDefaultRecommendations() {
        return Arrays.asList(
            new MovieRecommendation("The Shawshank Redemption", "drama", "Un classico imperdibile del cinema"),
            new MovieRecommendation("Pulp Fiction", "thriller", "Capolavoro di Quentin Tarantino"),
            new MovieRecommendation("The Dark Knight", "action", "Perfetto equilibrio tra azione e psicologia"),
            new MovieRecommendation("Forrest Gump", "drama", "Una storia toccante e indimenticabile"),
            new MovieRecommendation("Inception", "sci-fi", "Un viaggio nell'architettura dei sogni")
        );
    }
}
