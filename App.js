const API_KEY = 'api key';

const ENDPOINTS = {
    popular: `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=es-ES&page=1`,
    trending: `https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}&language=es-ES`,
    animated: `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=es-ES&with_genres=16`,
    adult: `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=es-ES&certification_country=US&certification=R`,
    upcoming: `https://api.themoviedb.org/3/movie/upcoming?api_key=${API_KEY}&language=es-ES&page=1`,
    topRated: `https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&language=es-ES&page=1`,
    tvPopular: `https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}&language=es-ES&page=1`,
    top10: `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=es-ES&page=1`
};

async function fetchMovies(endpoint, containerId) {
    try {
        const response = await fetch(endpoint);
        const data = await response.json();
        const movies = data.results;

        const container = document.getElementById(containerId);
        container.innerHTML = '';

        movies.forEach(movie => {
            const slide = document.createElement('div');
            slide.classList.add('swiper-slide');
            slide.innerHTML = ` 
            <div class="movie-container">
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" 
                alt="${movie.title}" 
                title="${movie.title}" 
                onclick="openModal(${movie.id})">
            <button class="like-button" onclick="toggleLike(${movie.id}, '${movie.title}', '${movie.poster_path}')">❤️</button>
        </div>
        `;
            container.appendChild(slide);
        });

        new Swiper(`.${containerId}`, {
            speed: 800,
            spaceBetween: 20,
            slidesPerGroup: 2,
            navigation: {
                nextEl: `.${containerId}-next`,
                prevEl: `.${containerId}-prev`,
            },
            breakpoints: {
                300: { slidesPerView: 2, slidesPerGroup: 1 },
                480: { slidesPerView: 3, slidesPerGroup: 1 },
                768: { slidesPerView: 4, slidesPerGroup: 2 },
                1024: { slidesPerView: 4, slidesPerGroup: 2 },
                1201: { slidesPerView: 5, slidesPerGroup: 3 },
            }
        });

    } catch (error) {
        console.error(`Error al cargar películas (${containerId}):`, error);
    }
}

// 🔥 Cargar las diferentes categorías 
fetchMovies(ENDPOINTS.popular, 'popular-movies');
fetchMovies(ENDPOINTS.trending, 'trending-movies');
fetchMovies(ENDPOINTS.animated, 'animated-movies');
fetchMovies(ENDPOINTS.adult, 'adult-movies');
fetchMovies(ENDPOINTS.upcoming, 'upcoming-movies');
fetchMovies(ENDPOINTS.topRated, 'top-rated-movies');
fetchMovies(ENDPOINTS.tvPopular, 'tv-popular-movies');

// Top 10 de las diferentes categorias 
async function fetchTop10Movies() {
    try {
        const response = await fetch(ENDPOINTS.top10);
        const data = await response.json();
        const movies = data.results.slice(0, 20); // Solo las 10 primeras

        const container = document.getElementById("top10-movies");
        container.innerHTML = '';

        movies.forEach((movie, index) => {
            const slide = document.createElement("div");
            slide.classList.add("swiper-slide");
            slide.innerHTML = `
          <div class="top-movie-card">
            <span class="top-number">${index + 1}</span>
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" title="${movie.title}">
          </div>
        `;
            container.appendChild(slide);
        });

        new Swiper(".top10-swiper", {
            slidesPerView: 5,
            spaceBetween: 15,
            navigation: {
                nextEl: ".top10-next",
                prevEl: ".top10-prev",
            },
            breakpoints: {
                300: { slidesPerView: 2 },
                480: { slidesPerView: 3 },
                768: { slidesPerView: 4 },
                1024: { slidesPerView: 5 },
            }
        });

    } catch (error) {
        console.error("Error al cargar el Top 10:", error);
    }
}

fetchTop10Movies();

// Pestaña emergente Trailer Descripción etc

function openModal(movieId) {
    fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&append_to_response=videos,recommendations`)
        .then(response => response.json())
        .then(data => {
            document.getElementById("movieTitle").innerText = data.title;
            document.getElementById("movieDescription").innerText = data.overview;

            const modal = document.getElementById("movieModal");
            modal.style.display = "block";
            document.body.classList.add("modal-open");

            // Mostrar el tráiler si existe
            const trailer = data.videos.results.find(video => video.type === "Trailer");
            document.getElementById("trailer").src = trailer ? `https://www.youtube.com/embed/${trailer.key}` : "";

            // Mostrar recomendaciones
            const recommendationsDiv = document.getElementById("recommendations");
            recommendationsDiv.innerHTML = data.recommendations.results.map(movie => `
                <div onclick="openModal(${movie.id})">
                    <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}">
                    <p>${movie.title}</p>
                </div>
            `).join("");

            document.getElementById("movieModal").style.display = "block";
        });

}

function closeModal() {
    document.getElementById("movieModal").style.display = "none";
    document.getElementById("trailer").src = "";
    document.body.classList.remove("modal-open");
}

//Proceso del like 

function toggleLike(movieId, title, posterPath) {
    let likedMovies = JSON.parse(localStorage.getItem("likedMovies")) || [];

    const index = likedMovies.findIndex(m => m.id === movieId);

    if (index === -1) {
        likedMovies.push({ id: movieId, title, poster_path: posterPath });
    } else {
        likedMovies.splice(index, 1);
    }

    localStorage.setItem("likedMovies", JSON.stringify(likedMovies));
    renderLikedMovies();

    document.querySelectorAll(`.like-button[onclick*="${movieId}"]`).forEach(button => {
        button.classList.toggle("liked", index === -1);
    });
}

function renderLikedMovies() {
    const container = document.getElementById("liked-movies");
    container.innerHTML = "";

    let likedMovies = JSON.parse(localStorage.getItem("likedMovies")) || [];

    likedMovies.forEach(movie => {
        const slide = document.createElement("div");
        slide.classList.add("swiper-slide");
        slide.innerHTML = `
            <div class="movie-container">
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" 
                    alt="${movie.title}" 
                    title="${movie.title}" 
                    onclick="openModal(${movie.id})">
                <button class="like-button liked" onclick="toggleLike(${movie.id}, '${movie.title}', '${movie.poster_path}')">❤️</button>
            </div>
        `;
        container.appendChild(slide);
    });
    new Swiper(".liked-movies", {
        speed: 800,
        spaceBetween: 20,
        slidesPerGroup: 2,
        navigation: {
            nextEl: ".liked-movies-next",
            prevEl: ".liked-movies-prev",
        },
        breakpoints: {
            300: { slidesPerView: 2, slidesPerGroup: 1 },
            480: { slidesPerView: 3, slidesPerGroup: 1 },
            768: { slidesPerView: 4, slidesPerGroup: 2 },
            1024: { slidesPerView: 4, slidesPerGroup: 2 },
            1201: { slidesPerView: 5, slidesPerGroup: 3 },
        }
    });
}



document.addEventListener("DOMContentLoaded", renderLikedMovies);

