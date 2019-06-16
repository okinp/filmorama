const api_key = "b5270c4ef29f7ad2f0c878c08d5e481d";
const endpoint_url = 'https://api.themoviedb.org/3';

const endpoints = {
  config: () => `${endpoint_url}/configuration?api_key=${api_key}`,
  nowPlaying: (page = 1) => `${endpoint_url}/movie/now_playing?api_key=${api_key}&language=en-US&page=${page}`,
  genreIds:  () => `${endpoint_url}/genre/movie/list?api_key=${api_key}&language=en-US`,
  search: query => ( page = 1) => `${endpoint_url}/search/movie?api_key=${api_key}&query=${query}&page=${page}&include_adult=false`,
  movieDetails: movieId => `${endpoint_url}/movie/${movieId}?api_key=${api_key}&append_to_response=videos,reviews,similar`
}


const getEndpointData = async () => {
  try {
    const [ configResponse, genreResponse ] = await Promise.all( [fetch(endpoints.config()), fetch(endpoints.genreIds())] );
    const { images } = await configResponse.json();
    const genres = await genreResponse.json();
    return await { ...images, ...genres };
  }
  catch (err) {
    console.log('getEndointDataError: ', err)
  }
}

const getMoviesInTheaters = async (page = 1) => {
  try {
    const movieResponse = await fetch(endpoints.nowPlaying(page));
    const movies = await movieResponse.json();
    return await movies;
  }
  catch (err) {
    console.log('getMoviesInTheatersError:', err)
  }
} 

const searchMovies = async ( query, page = 1) => {
  try {
    const movieResponse = await fetch(endpoints.search(query)(page));
    const movies = await movieResponse.json();
    return await movies;
  }
  catch (err) {
    console.log('searchMoviesError:', err)
  }
}

const getMovieDetails = async movieId => {
  try {
    const movieDetails = await fetch(endpoints.movieDetails(movieId));
    const details = await movieDetails.json();
    return await details;
  }
  catch (err) {
    console.log('getMovieDetailsError:', err)
  }
}

 



export { getEndpointData, getMoviesInTheaters, searchMovies, getMovieDetails };