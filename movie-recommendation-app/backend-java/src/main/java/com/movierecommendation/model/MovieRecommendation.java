package com.movierecommendation.model;

public class MovieRecommendation {
    private String title;
    private String genre;
    private String reason;

    // Constructors
    public MovieRecommendation() {}

    public MovieRecommendation(String title, String genre, String reason) {
        this.title = title;
        this.genre = genre;
        this.reason = reason;
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

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    @Override
    public String toString() {
        return "MovieRecommendation{" +
                "title='" + title + '\'' +
                ", genre='" + genre + '\'' +
                ", reason='" + reason + '\'' +
                '}';
    }
}
