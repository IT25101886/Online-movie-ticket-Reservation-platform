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

    
}