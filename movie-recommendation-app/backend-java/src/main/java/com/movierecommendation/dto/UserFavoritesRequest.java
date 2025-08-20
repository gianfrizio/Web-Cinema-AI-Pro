package com.movierecommendation.dto;

import java.util.List;

public class UserFavoritesRequest {
    private String userId;
    private List<MovieDto> favoriteMovies;

    // Constructors
    public UserFavoritesRequest() {}

    public UserFavoritesRequest(String userId, List<MovieDto> favoriteMovies) {
        this.userId = userId;
        this.favoriteMovies = favoriteMovies;
    }

    // Getters and Setters
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public List<MovieDto> getFavoriteMovies() {
        return favoriteMovies;
    }

    public void setFavoriteMovies(List<MovieDto> favoriteMovies) {
        this.favoriteMovies = favoriteMovies;
    }

    public static class MovieDto {
        private Long id;
        private String title;
        private String genre;

        // Constructors
        public MovieDto() {}

        public MovieDto(Long id, String title, String genre) {
            this.id = id;
            this.title = title;
            this.genre = genre;
        }

        // Getters and Setters
        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

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
    }
}
