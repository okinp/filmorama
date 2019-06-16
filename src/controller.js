/** 
* TODO:
* - Clean up code make DRY
* - Use hidden nodes as templates instead of HTML templates
* - Decrease specificity of rules - depth
*/

import { getEndpointData, getMoviesInTheaters, searchMovies, getMovieDetails } from './requests';
import { init as initializeMappingFunctions, moviesMapper, movieBasicInfoFn } from './mappingFns';

import  { genreArrayToString,
          getIndexOfFirstElementInNextRow,
          itemIsExtraInfo,
          removeExtraInfoFromDom,
          getMovieCardNode,
          toggleExpandingClass } from "./utils";

let resultsContainer = null;
let movieCardTemplate = null;
let movieExtraTemplate = null;
let reviewTemplate = null;
let currentPage = 1;
let nextPage = 2;
let totalPages = 0;
let numInsertedCards = 0;
let inSearchMode = false;
let searchQuery = '';

const init = function () {
  resultsContainer = document.querySelector(".js-results-container");
  movieCardTemplate = document.querySelector("#movie-card-temlate");
  movieExtraTemplate = document.querySelector("#movie-extra-template");
  reviewTemplate = document.querySelector("#movie-review-template");
  attachWindowListeners();
  attachSearchListener();
  getEndpointData().then(initializeMappingFunctions)
                   .then(getMoviesInTheaters)
                   .then(moviesMapper)
                   .then(insertMovies)

};

const insertMovies = function(mappedResponse) {
  totalPages = mappedResponse.total_pages;
  mappedResponse.results.forEach(appendMovieCard);
}

const getExtraInfoNode = () => resultsContainer.querySelector('.movie-extra');

const attachWindowListeners = function(){
  removeExtraInfoOnWindowResize();
  enableInfiniteScrolling();
}

const searchHandler = (evt) => {
  inSearchMode = true;
  //Clear contents
  while (resultsContainer.firstChild) {
    resultsContainer.removeChild(resultsContainer.firstChild);
  }
  currentPage = 1;
  nextPage = 2;
  numInsertedCards = 0;
  searchQuery = evt.target.value;
  if ( searchQuery === ''){
    //TheaterMode
    inSearchMode = false;
    getMoviesInTheaters().then(moviesMapper)
                         .then(insertMovies);
  } else {
    inSearchMode = true;
    searchMovies(searchQuery).then(moviesMapper)
                                  .then(insertMovies);
  }
}

const attachSearchListener = function(){
  document.querySelector('#search-field').addEventListener('keyup', searchHandler )
}

async function loadMoreInTheaters(){
  if ( nextPage < totalPages ){
    currentPage++;
    await getMoviesInTheaters(nextPage).then(moviesMapper)
                                       .then(insertMovies);
  }
}

async function loadMoreSearchResults(){
  if ( nextPage < totalPages ){
    currentPage++;
    await searchMovies(searchQuery,nextPage).then(moviesMapper)
                                            .then(insertMovies);
  }
}

const enableInfiniteScrolling = function() {
  //Should have used a timeout or requestAnimationFrame here
	window.addEventListener("scroll", function() {
    if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight - 150 ) {
      if ( !inSearchMode && ( nextPage !== currentPage ) ){
        loadMoreInTheaters().then( () => {
          nextPage++;
        })
      } else if (inSearchMode && ( nextPage !== currentPage ) ){
        loadMoreSearchResults().then( () => {
          nextPage++;
        })        
      }
    }
	});
};


const removeExtraInfoOnWindowResize = function(){
  const delay = 50;  
  let timerId = null;
  const resizeFn = evt => {
    let extraInfoNode = getExtraInfoNode();
    if ( extraInfoNode ){
      extraInfoNode.remove();
      let selectedCard = resultsContainer.querySelector('.movie-card.is-expanded');
      if ( selectedCard ){
        selectedCard.setAttribute("class", "movie-card");
      }
    }
  };
  window.addEventListener('resize', evt => {
    if (timerId !== null) {
      clearTimeout(timerId);
    }

    timerId = setTimeout(() => {
      timerId = null;
      resizeFn(evt);
    }, delay);
  });
}



function getMovieCardClone(state){
  let movieCardClone = document.importNode(movieCardTemplate.content, true);
  movieCardClone.querySelector(".movie-card__poster").src = state.posters.w342;
  movieCardClone.querySelector(".movie-title").textContent = state.title;
  movieCardClone.querySelector(".year").textContent = state.year;
  movieCardClone.querySelector(".score").textContent = state.vote_average + "/10";
  movieCardClone.querySelector(".movie-genres").textContent = genreArrayToString(state.genres);
  movieCardClone.querySelector(".movie-description").textContent = state.overview;
  return movieCardClone;
}

function getReviewClone(state){
  let reviewClone = document.importNode(reviewTemplate.content, true);
  reviewClone.querySelector('.movie-review__author').textContent = 'By ' + state.author;
  reviewClone.querySelector('.movie-review__content').textContent = state.content;
  reviewClone.querySelector('.movie-review__link').href = state.url;
  return reviewClone;
}

function insertBasicInfoToExtraInfoCard(state){
  let movieExtraNode = getExtraInfoNode();
  movieExtraNode.querySelector(".backdrop__image").src = state.backdrops.w780;
  movieExtraNode.querySelector(".movie-title").textContent = state.title;
  movieExtraNode.querySelector(".year").textContent = state.year;
  movieExtraNode.querySelector(".score").textContent = state.vote_average + "/10";
  movieExtraNode.querySelector(".movie-genres").textContent = genreArrayToString(state.genres);
  movieExtraNode.querySelector(".movie-description").textContent = state.overview;
}


function insertDetailedInfoToExtraInfoCard(state){
  let movieExtraNode = getExtraInfoNode();
  //Find a youtube video if any
  let video = state.videos.results.find( video => video.size == 1080 && video.site == "YouTube");
  if ( video ){
    movieExtraNode.querySelector('.movie-card__trailers > iframe').src = `https://www.youtube.com/embed/${video.key}?controls=0`;
    movieExtraNode.querySelector('#tab-trailer').classList.remove('is-hidden');
  } else {
    //Hide menu tab
    movieExtraNode.querySelector('#tab-trailer').classList.add('is-hidden');
  }
  //Get up to 2 reviews 
  let reviews = state.reviews.results.slice(0,2)
                                     .map( r => {
                                       r.content = r.content.slice(0, 750) + '...';
                                       return r;
                                     })
  if ( reviews.length > 0 ){
    let reviewsNode = movieExtraNode.querySelector('.movie-card__reviews');
    // Clear previous reviews
    while (reviewsNode.firstChild) {
      reviewsNode.removeChild(reviewsNode.firstChild);
    }
    // Insert reviews
    reviews.forEach( review => {
      let reviewClone = getReviewClone(review);

      reviewsNode.appendChild(reviewClone);
    })
    movieExtraNode.querySelector('#tab-reviews').classList.remove('is-hidden');
  } else {
    movieExtraNode.querySelector('#tab-reviews').classList.add('is-hidden');
  }
  

  let similarNode = movieExtraNode.querySelector('.movie-card__similar');
  // Clear previous entries
  while (similarNode.firstChild) {
    similarNode.removeChild(similarNode.firstChild);
  }
  //Get Up to 4 similar movies
  let similar = state.similar.results.slice(0,4).map(movieBasicInfoFn);
  if ( similar.length > 0 ){
    similar.forEach( similarMovie => {
      let movieCardClone = getMovieCardClone(similarMovie);
      similarNode.appendChild(movieCardClone);
    })
    movieExtraNode.querySelector('#tab-similar').classList.remove('is-hidden');
  } else {
    movieExtraNode.querySelector('#tab-similar').classList.add('is-hidden');
  }
  movieExtraNode.querySelector('ul.menu').classList.remove('is-hidden');
}

const appendMovieCard = function (state) {

  // We are using HTML content templates that returns a doc fragment,
  // so we cannot use the return of appendChild to add listeners to.
  // We could have used hidden dom elements instead to simplify things and not have to search
  // for the inserted node.
  let cardsAfter = [];
  let rowStartIdx = 0;
  let cardIndex = numInsertedCards;

  resultsContainer.appendChild(getMovieCardClone(state));

  let currentCard = getMovieCardNode(cardIndex, resultsContainer);
  addCardListeners();
  
  function resetExtraInfoSelections(){
    let extraInfoNode = getExtraInfoNode();
    if ( extraInfoNode ){
      let menu = extraInfoNode.querySelector('ul.menu');
      menu.classList.add('is-hidden');    
      let tabMenuButtons = menu.querySelectorAll('li > a');
      let sections = extraInfoNode.querySelectorAll('.movie-extra__content > section');
      let sectionsArray = [...sections];
      let tabMenuButtonsArray = [...tabMenuButtons];
      tabMenuButtonsArray.forEach( b => {
        b.parentElement.classList.remove('active');
      });
      tabMenuButtonsArray[0].parentElement.classList.add('active');
      sectionsArray.forEach( s => {
        s.classList.add('is-hidden');
      })
      sectionsArray[0].classList.remove('is-hidden');
    }
  }

  function addExtraInfoListeners(){
    let extraInfoNode = getExtraInfoNode();
    if ( extraInfoNode ){
      let tabMenuButtons = extraInfoNode.querySelectorAll('ul.menu > li > a');
      let sections = extraInfoNode.querySelectorAll('.movie-extra__content > section');
      let sectionsArray = [...sections];
      let tabMenuButtonsArray = [...tabMenuButtons];
      tabMenuButtonsArray.forEach( (button, index) =>{
        button.addEventListener("mousedown", () => {
          tabMenuButtonsArray.forEach( b => {
            b.parentElement.classList.remove('active');
          });
          button.parentElement.classList.add('active');
          sectionsArray.forEach( s => {
            s.classList.add('is-hidden');
          })
          sectionsArray[index].classList.remove('is-hidden');

        })
      })
    }
  }

  function addCardListeners() {
    
    const mousedownHandler = function (evt) {      
      let expanded = toggleExpandingClass(currentCard, resultsContainer);
      
      if ( expanded ) {

        getMovieDetails(state.id).then(insertDetailedInfoToExtraInfoCard);
        rowStartIdx = getIndexOfFirstElementInNextRow(cardIndex, currentCard.offsetWidth, resultsContainer.offsetWidth);
        
        //Check if extra info is already in place

        if ( itemIsExtraInfo( rowStartIdx, resultsContainer ) ) {

          //do not remove extra info just fill with new data
          insertBasicInfoToExtraInfoCard(state);
          resetExtraInfoSelections();
       
        } else {
          
          removeExtraInfoFromDom( resultsContainer );

          cardsAfter = [...resultsContainer.children].slice(rowStartIdx);
          
          cardsAfter.forEach(card => card.setAttribute("class", "movie-card moved"));
          
          //Insert movieExtras
          
          let movieExtraClone = document.importNode(movieExtraTemplate.content, true);
          resultsContainer.insertBefore(movieExtraClone, resultsContainer.children.item(rowStartIdx));
          addExtraInfoListeners();
          insertBasicInfoToExtraInfoCard(state);
        }
      } else {
        //Contracting
        removeExtraInfoFromDom( resultsContainer );
      }
      //Execute current call stack before making changes required for the animation to happen
      setTimeout(timedHandler, 0);
    };
  
    const timedHandler = function () {
      cardsAfter.forEach(card => card.setAttribute("class", "movie-card"));
      let movieExtraNode = getExtraInfoNode();
      if ( movieExtraNode ){
        movieExtraNode.setAttribute("class", "movie-extra open");
      }
    }
    currentCard.addEventListener("mousedown", mousedownHandler, true);
  };

  numInsertedCards++;
};

export { init, appendMovieCard };