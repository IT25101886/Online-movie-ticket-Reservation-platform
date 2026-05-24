package com.movie.backend.movie.dto;

import java.time.LocalDate;
import java.util.List;

public class MovieRequest {
    private String title;
    private String genre;
    private String description;
    private LocalDate releaseDate;
    private String showTimes;
    private String language;
    private String movieType;
    private String posterImage;
    private List<String> moviePhotos;

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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getReleaseDate() {
        return releaseDate;
    }

    public void setReleaseDate(LocalDate releaseDate) {
        this.releaseDate = releaseDate;
    }

    public String getShowTimes() {
        return showTimes;
    }

    public void setShowTimes(String showTimes) {
        this.showTimes = showTimes;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getMovieType() {
        return movieType;
    }

    public void setMovieType(String movieType) {
        this.movieType = movieType;
    }

    public String getPosterImage() {
        return posterImage;
    }

    public void setPosterImage(String posterImage) {
        this.posterImage = posterImage;
    }

    public List<String> getMoviePhotos() {
        return moviePhotos;
    }

    public void setMoviePhotos(List<String> moviePhotos) {
        this.moviePhotos = moviePhotos;
    }
}