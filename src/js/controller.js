import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookMarksView from './views/bookMarksView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';

import icons from 'url:../img/icons.svg';
import 'core-js/stable'; //polyfill everything else
import 'regenerator-runtime/runtime'; //polyfill async await

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipes = async function() {
  try{
    const id = window.location.hash.slice(1);

    if(!id) return;

    recipeView.renderSpinner();

    // update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    // update bookmarks
    bookMarksView.update(model.state.bookmarks);
    
    // 1) Loading Recipe
    await model.loadRecipe(id); // returns a promise so need await
    
    // 2) Render Recipe
    recipeView.render(model.state.recipe);

    
  } catch(err) {
    recipeView.renderError();
    console.error(err);
  };
};

const controlSearchResults = async function() {
  try{
    resultsView.renderSpinner();

    // get search query
    const query = searchView.getQuery();
    if(!query) return;

    // load search results
    await model.loadSearchResults(query);

    // render results
    resultsView.render(model.getSearchResultsPage());

    // render initial pagination buttons
    paginationView.render(model.state.search);

  } catch (err) {
    console.error(err);
  };
};

// Publisher/Subcriber Method

const controlPagination = function(goToPage) {
  // render new results
  resultsView.render(model.getSearchResultsPage(goToPage));
  
  // render new buttons
  paginationView.render(model.state.search);
};

const controlServings = function(newServings) {
  // update the recipe servings (in state)
  model.updateServings(newServings);

  // update recipe view
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function() {
  // add/remove bookmark
  if(!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe) 
  else model.deleteBookmark(model.state.recipe.id);
  
  // update recipe view
  recipeView.update(model.state.recipe);

  // render bookmarks
  bookMarksView.render(model.state.bookmarks);
};

const controlBookmarks = function() {
  bookMarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function(newRecipe) {
  try{
    // Show loading spinner
    addRecipeView.renderSpinner();

    // Upload new reciple data
    await model.uploadRecipe(newRecipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Success Message
    addRecipeView.renderMessage();

    // Render bookmarkview
    bookMarksView.render(model.state.bookmarks);

    // Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close form
    setTimeout(function() {
      addRecipeView.toggleWindow()
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('💥💥', err);
    addRecipeView.renderError(err.message);
  };
};

const controlToggleModal = function() {
    recipeView.toggleModal();
};

const controlDeleteRecipe = async function() {
  await model.deleteRecipe(model.state.recipe.id);
  model.deleteBookmark(model.state.recipe.id);
  bookMarksView.update(model.state.bookmarks);
  location.reload();
};

const init = function() {
  bookMarksView.addhandlerRender(controlBookmarks);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  recipeView.addHandlerToggleModal(controlToggleModal);
  recipeView.addHandlerDeleteRecipe(controlDeleteRecipe);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();