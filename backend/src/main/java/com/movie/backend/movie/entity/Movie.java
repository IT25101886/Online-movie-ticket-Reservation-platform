package com.movie.backend.movie.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Entity
@Table(name = "movies")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "movie_type")
public abstract class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String genre;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(name = "show_times", columnDefinition = "TEXT")
    private String showTimes;

    private String language;

    @Lob
    @Column(name = "poster_image", columnDefinition = "LONGTEXT")
    private String posterImage;

    @Lob
    @Column(name = "photo_gallery", columnDefinition = "LONGTEXT")
    private String photoGallery;

    public abstract String displayCategory();

    @Transient
    public String getCategory() {
        return displayCategory();
    }

    @Transient
    public List<String> getMoviePhotos() {
        if (photoGallery == null || photoGallery.isBlank()) {
            return new ArrayList<>();
        }
        return Arrays.stream(photoGallery.split("\\|\\|"))
                .filter(item -> item != null && !item.isBlank())
                .toList();
    }

    public Long getId() {
        return id;
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

    public String getPosterImage() {
        return posterImage;
    }

    public void setPosterImage(String posterImage) {
        this.posterImage = posterImage;
    }

    public String getPhotoGallery() {
        return photoGallery;
    }

    public void setPhotoGallery(String photoGallery) {
        this.photoGallery = photoGallery;
    }
}