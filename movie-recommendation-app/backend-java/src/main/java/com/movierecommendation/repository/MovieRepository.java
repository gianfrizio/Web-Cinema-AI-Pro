package com.movierecommendation.repository;

import com.movierecommendation.model.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {
    List<Movie> findByUserId(String userId);
    void deleteByUserId(String userId);
}
