package com.movie.backend.movie.service;

import com.movie.backend.movie.dto.MovieRequest;
import com.movie.backend.movie.entity.Movie;
import com.movie.backend.movie.entity.NowShowingMovie;
import com.movie.backend.movie.entity.UpcomingMovie;
import com.movie.backend.movie.repository.MovieRepository;
import com.movie.backend.user.entity.AdminPermission;
import com.movie.backend.user.entity.User;
import com.movie.backend.user.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class MovieService {

    private final MovieRepository movieRepository;
    private final UserRepository userRepository;

    public MovieService(MovieRepository movieRepository, UserRepository userRepository) {
        this.movieRepository = movieRepository;
        this.userRepository = userRepository;
    }

    private void requireMovieManager(Long performedByAdminId) {
        User actor = userRepository.findById(performedByAdminId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Admin not found"));

        boolean allowed = actor.isAdmin() && (
                actor.getAdminPermission() == AdminPermission.MOVIE_MANAGER ||
                        actor.getAdminPermission() == AdminPermission.ADMIN_MANAGER
        );

        if (!allowed) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only MOVIE_MANAGER or ADMIN_MANAGER can do this");
        }
    }

    private String joinPhotos(List<String> photos) {
        if (photos == null || photos.isEmpty()) return "";
        return String.join("||", photos);
    }

    public Movie addMovie(Long performedByAdminId, MovieRequest request) {
        requireMovieManager(performedByAdminId);

        Movie movie;
        String type = request.getMovieType() == null ? "NOW_SHOWING" : request.getMovieType().toUpperCase();

        switch (type) {
            case "UPCOMING" -> movie = new UpcomingMovie();
            default -> movie = new NowShowingMovie();
        }

        movie.setTitle(request.getTitle());
        movie.setGenre(request.getGenre());
        movie.setDescription(request.getDescription());
        movie.setReleaseDate(request.getReleaseDate());
        movie.setShowTimes(request.getShowTimes());
        movie.setLanguage(request.getLanguage());
        movie.setPosterImage(request.getPosterImage());
        movie.setPhotoGallery(joinPhotos(request.getMoviePhotos()));

        return movieRepository.save(movie);
    }

    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    public Movie getMovieById(Long id) {
        return movieRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Movie not found"));
    }

    public List<Movie> getNowShowingMovies() {
        return movieRepository.findAll().stream()
                .filter(movie -> "NOW_SHOWING".equalsIgnoreCase(movie.getCategory()))
                .toList();
    }

    public List<Movie> getUpcomingMovies() {
        return movieRepository.findAll().stream()
                .filter(movie -> "UPCOMING".equalsIgnoreCase(movie.getCategory()))
                .toList();
    }

    public List<Movie> searchMovies(String title, String genre, LocalDate releaseDate, String category) {
        return movieRepository.findAll().stream()
                .filter(movie -> title == null || title.isBlank() || movie.getTitle().toLowerCase().contains(title.toLowerCase()))
                .filter(movie -> genre == null || genre.isBlank() || movie.getGenre().equalsIgnoreCase(genre))
                .filter(movie -> releaseDate == null || movie.getReleaseDate().equals(releaseDate))
                .filter(movie -> category == null || category.isBlank() || movie.getCategory().equalsIgnoreCase(category))
                .toList();
    }

    public Movie updateMovie(Long performedByAdminId, Long id, MovieRequest request) {
        requireMovieManager(performedByAdminId);

        Movie movie = getMovieById(id);

        movie.setTitle(request.getTitle());
        movie.setGenre(request.getGenre());
        movie.setDescription(request.getDescription());
        movie.setReleaseDate(request.getReleaseDate());
        movie.setShowTimes(request.getShowTimes());
        movie.setLanguage(request.getLanguage());

        if (request.getPosterImage() != null && !request.getPosterImage().isBlank()) {
            movie.setPosterImage(request.getPosterImage());
        }

        if (request.getMoviePhotos() != null) {
            movie.setPhotoGallery(joinPhotos(request.getMoviePhotos()));
        }

        return movieRepository.save(movie);
    }

    

    private void insertionSortByReleaseDate(List<Movie> movies) {
        for (int i = 1; i < movies.size(); i++) {
            Movie key = movies.get(i);
            int j = i - 1;

            while (j >= 0 && movies.get(j).getReleaseDate().isAfter(key.getReleaseDate())) {
                movies.set(j + 1, movies.get(j));
                j--;
            }

            movies.set(j + 1, key);
        }
    }
}