package com.movie.backend.movie.controller;

import com.movie.backend.movie.dto.MovieRequest;
import com.movie.backend.movie.entity.Movie;
import com.movie.backend.movie.service.MovieService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/movies")
@CrossOrigin
public class MovieController {

    private final MovieService movieService;

    public MovieController(MovieService movieService) {
        this.movieService = movieService;
    }

    @PostMapping
    public Movie addMovie(@RequestParam Long performedByAdminId,
                          @RequestBody MovieRequest request) {
        return movieService.addMovie(performedByAdminId, request);
    }

    @GetMapping
    public List<Movie> getAllMovies() {
        return movieService.getAllMovies();
    }

    @GetMapping("/now-showing")
    public List<Movie> getNowShowingMovies() {
        return movieService.getNowShowingMovies();
    }

    @GetMapping("/upcoming")
    public List<Movie> getUpcomingMovies() {
        return movieService.getUpcomingMovies();
    }

    @GetMapping("/{id}")
    public Movie getMovieById(@PathVariable Long id) {
        return movieService.getMovieById(id);
    }

    @GetMapping("/search")
    public List<Movie> searchMovies(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate releaseDate,
            @RequestParam(required = false) String category
    ) {
        return movieService.searchMovies(title, genre, releaseDate, category);
    }

    @GetMapping("/sorted/release-date")
    public List<Movie> getMoviesSortedByReleaseDate() {
        return movieService.getMoviesSortedByReleaseDate();
    }

    @PutMapping("/{id}")
    public Movie updateMovie(@PathVariable Long id,
                             @RequestParam Long performedByAdminId,
                             @RequestBody MovieRequest request) {
        return movieService.updateMovie(performedByAdminId, id, request);
    }

    @DeleteMapping("/{id}")
    public String deleteMovie(@PathVariable Long id,
                              @RequestParam Long performedByAdminId) {
        movieService.deleteMovie(performedByAdminId, id);
        return "Movie deleted successfully";
    }
}