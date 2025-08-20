package com.movierecommendation.dto;

import java.util.List;

public class RecommendationRequest {
    private List<MovieRequest> movies;

    // Constructors
    public RecommendationRequest() {}

    public RecommendationRequest(List<MovieRequest> movies) {
        this.movies = movies;
    }

    // Getters and Setters
    public List<MovieRequest> getMovies() {
        return movies;
    }

    public void setMovies(List<MovieRequest> movies) {
        this.movies = movies;
    }

    public static class MovieRequest {
        private String title;
        private String genre;
        private Integer year;
        private Integer rating;

        // Constructors
        public MovieRequest() {}

        public MovieRequest(String title, String genre, Integer year, Integer rating) {
            this.title = title;
            this.genre = genre;
            this.year = year;
            this.rating = rating;
        }

        // Getters and Setters
        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getGenre() {
            return genre;
        }

        public void setGenre(String genre) {
            this.genre = genre;
        }

        public Integer getYear() {
            return year;
        }

        public void setYear(Integer year) {
            this.year = year;
        }

        public Integer getRating() {
            return rating;
        }

        public void setRating(Integer rating) {
            this.rating = rating;
        }
    }
}
