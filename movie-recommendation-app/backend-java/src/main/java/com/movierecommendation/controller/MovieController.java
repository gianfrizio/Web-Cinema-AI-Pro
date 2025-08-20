package com.movierecommendation.controller;

import com.movierecommendation.dto.UserFavoritesRequest;
import com.movierecommendation.dto.RecommendationRequest;
import com.movierecommendation.model.Movie;
import com.movierecommendation.model.MovieRecommendation;
import com.movierecommendation.service.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allow CORS for frontend
public class MovieController {

    @Autowired
    private MovieService movieService;

    @PostMapping("/users/favorites")
    public ResponseEntity<String> saveFavoriteMovies(@RequestBody UserFavoritesRequest request) {
        try {
            List<Movie> movies = request.getFavoriteMovies().stream()
                .map(dto -> new Movie(dto.getTitle(), dto.getGenre(), request.getUserId()))
                .collect(Collectors.toList());
            
            movieService.saveFavoriteMovies(request.getUserId(), movies);
            return ResponseEntity.ok("Film preferiti salvati con successo");
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Errore nel salvare i film: " + e.getMessage());
        }
    }

    @GetMapping("/users/{userId}/favorites")
    public ResponseEntity<List<Movie>> getFavoriteMovies(@PathVariable String userId) {
        try {
            List<Movie> movies = movieService.getFavoriteMovies(userId);
            return ResponseEntity.ok(movies);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/recommendations/{userId}")
    public ResponseEntity<List<MovieRecommendation>> getRecommendations(@PathVariable String userId) {
        try {
            List<MovieRecommendation> recommendations = movieService.getRecommendations(userId);
            return ResponseEntity.ok(recommendations);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/movies/recommendations")
    public ResponseEntity<List<MovieRecommendation>> getRecommendationsFromMovies(@RequestBody RecommendationRequest request) {
        try {
            // Save favorite movies first
            List<Movie> movies = request.getMovies().stream()
                .map(dto -> new Movie(dto.getTitle(), dto.getGenre(), "temp-user"))
                .collect(Collectors.toList());
            
            movieService.saveFavoriteMovies("temp-user", movies);
            
            // Get recommendations
            List<MovieRecommendation> recommendations = movieService.getRecommendations("temp-user");
            return ResponseEntity.ok(recommendations);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Backend Java is running!");
    }
}
