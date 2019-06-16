const genreReducer = (acc, curr, idx) => {
  let seperator = idx === 0 ? "" : ", ";
  return acc + seperator + curr;
};

const movieCardFilter = node => node.getAttribute("class").includes("movie-card");


export const genreArrayToString = genreArray => genreArray.reduce(genreReducer, "");


export const getIndexOfFirstElementInNextRow = function (
  itemIndex,
  itemWidth,
  containerWidth
) {
  let numColumns = Math.floor(containerWidth / itemWidth);
  return itemIndex - (itemIndex % numColumns) + numColumns;
};

export const itemIsExtraInfo = function (index, containerNode) {
  let itemExists = containerNode.children.length > index;
  return itemExists && containerNode.children.item(index)
    .getAttribute("class")
    .includes("movie-extra");
}

export const removeExtraInfoFromDom = function (containerNode) {
  let extraInfoCard = containerNode.querySelector('.movie-extra');
  if (extraInfoCard) {
    containerNode.removeChild(extraInfoCard);
  }
}

export const getMovieCardNode = function (cardIndex, containerNode) {
  return [...containerNode.children].filter(movieCardFilter)[cardIndex];
};

export const toggleExpandingClass = function (cardNode, containerNode ) {
  let oldClass = cardNode.getAttribute("class");
  let cardClass = "movie-card";
  let expandedCardClass = "movie-card is-expanded";
  //Reset all card classes
  [...containerNode.children]
    .filter(movieCardFilter)
    .forEach(card => card.setAttribute("class", cardClass));
  let newClass = cardClass;
  if (oldClass === newClass) {
    newClass = expandedCardClass;
    cardNode.setAttribute("class", newClass);
    return true;
  }
  return false;
};