let genres, imagePath, backdropSizes, posterSizes;

const init = function(config) {
  genres = config.genres;
  imagePath = config.base_url;
  backdropSizes = config.backdrop_sizes;
  posterSizes = config.poster_sizes;
};

const imagePathReducer = path => (acc, curr) => {
  let imageUrl = path
    ? imagePath + curr + path
    : "https://dummyimage.com/240x359/000000/ffffff";
  let currentImage = { [curr]: imageUrl };
  return { ...acc, ...currentImage };
};

const getMovieGenres = genreId => {
  let movieGenre = genres.find(genre => genre.id === genreId);
  return movieGenre ? movieGenre.name : "unknown genre";
};

const movieBasicInfoFn = function(movieData) {
  movieData.posters = posterSizes.reduce(
    imagePathReducer(movieData.poster_path),
    {}
  );
  movieData.backdrops = backdropSizes.reduce(
    imagePathReducer(movieData.backdrop_path),
    {}
  );
  movieData.genres = movieData.genre_ids.map(getMovieGenres);
  movieData.year = new Date(movieData.release_date).getFullYear();
  //Lets remove unused data from the object.
  let {
    vote_count,
    video,
    popularity,
    poster_path,
    original_language,
    original_title,
    genre_ids,
    backdrop_path,
    adult,
    release_date,
    ...rest
  } = movieData;

  return rest;
};

const moviesMapper = singlePageData => {
  singlePageData.results = singlePageData.results.map(movieBasicInfoFn);
  return singlePageData;
};

export { init, moviesMapper, movieBasicInfoFn };
