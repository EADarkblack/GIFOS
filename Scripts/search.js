import api from './../Services/services.js'
import fav from './favorite.js'

// Variables//

const searchInput = document.querySelector(".search-bar");
const containerResults = document.querySelector(".content-elements");
const searchBtnActive = document.querySelector(".sug");
const searchBtn = document.querySelector(".fa-search");
const showMoreBtn = document.querySelector(".more-btn");
const displaySection = document.querySelector(".new-search-section");
const notFoundImg = document.querySelector("#not-found-img");
const notFoundText = document.querySelector("#not-found-title");
const listAutocomplete = document.querySelector(".list-sug");
const searchBar = document.querySelector(".search-bar-style");
const inputIcon = document.querySelector(".input-icon");
let titleSearch = document.querySelector(".title-search-elements");
let totalResults = 0;

/**
 *  Receive the data from the api to display it on the screen
 */

const searchResults = function() {
    const search = searchInput.value;
    const offset = totalResults || 0;
    displaySection.style.display = "flex";
    showMoreBtn.style.display = "none";
    titleSearch.innerText = search.charAt(0).toUpperCase() + search.slice(1);
    api.apiSearch(search, offset)
    .then(res => {
        const {data} = res;
        showResults(data);
        dataFavIconToggle();
    })
    .catch(err => {
        console.error(`Error al conectarse con la Api de busqueda.`, err);
    });
}

/**
 * Prints in the screen the results from the search bar
 */

const showResults = function(data) {
    if(data.length) {
        showMoreResults(data);
        notFoundImg.style.display = "none";
        notFoundText.style.display = "none";
        totalResults += data.length;
        for (let i = 0; i < data.length; i++) {  
            containerResults.innerHTML += 
            `
                <div class="gif-elements" id="${data[i].id}">
                <figure>
                    <img src="${data[i].images.downsized_medium.url}" alt="">
                    <div class="layer">
                        <div class="icons-img">
                            <span class="icon-icon-fav" id="${data[i].id}">
                                <span class="icon-icon-fav-active"></span>
                                <span class="path1"></span>
                                <span class="path2"></span>
                            </span>
                            <span class="icon-icon-download">
                                <span class="path1"></span>
                                <span class="path2"></span>
                            </span>
                            <span class="icon-icon-max-normal">
                                <span class="path1"></span>
                                <span class="path2"></span>
                            </span>
                        </div>
                        <div class="info-element">
                            <h5 class="username">${data[i].username}</h5>
                            <h1 class="title-element">${data[i].title}</h1>
                        </div>
                    </div>
                </figure>
            </div>
            `
        }
        addBtnIconFav();
        expandEventGifElement();
    }
}

/**
 * Hides the show more button when there are less than 12 gifs
 */

const showMoreResults = function(data) {
    if (data.length < 12) {
        showMoreBtn.style.display = "none";
    } else {
        showMoreBtn.style.display = "block";
    }
}

/**
 * Receive the data from the api to display it on the suggestion list
 */

const autocompleteEngine = function() {
    const search = searchInput.value;
    toggleIcon();
    api.apiAutocomplete(search)
    .then(res => {
        const {data} = res;
        listAutocomplete.innerHTML = "";
        showSuggestions(data);
    })
    .catch(err => {
        console.error(`error al conectarse con la Api de autocompletar.`, err);
    });
}

/**
 * Prints on the screen the suggestion list while the user is typing
 */

const showSuggestions = function(data) {
    if (data.length) {
        for (let i = 0; i < data.length; i++) {
            let nameData = data[i].name;
            nameData = data[i].name.charAt(0).toUpperCase() + data[i].name.slice(1);
            listAutocomplete.innerHTML += `
            <li class="suggestion"><i class="fas fa-search sug 1"><span>${nameData}</span></i></li>
            `
        }
        setAutocomplete();
        searchBar.classList.add("active");
    } else {
        searchBar.classList.remove("active");
    }
}

/**
 * Sets to the search engine the suggestion clicked by the user
 */

const setAutocomplete = function() {
    const suggestionList = document.querySelectorAll(".suggestion");
    for (let i = 0; i < suggestionList.length; i++) {
        suggestionList[i].addEventListener("click", setSearchAutocomplete);
    }
}

/**
 * Starts to finding the typed data ingresed by the user
 */

const setSearchAutocomplete = function() {
    searchInput.value = event.target.innerText.replace('suggestion-', '');
    totalResults = 0;
    searchResults();
    searchBar.classList.remove("active");
    containerResults.innerHTML = "";
    notFoundImg.style.display = "unset";
    notFoundText.style.display = "unset";
    listAutocomplete.innerHTML = "";
};

/**
 * Toggles the icon when the user type in the search engine
 */

const toggleIcon = function() {
    if (searchInput.value) {
        inputIcon.innerHTML = `
        <i class="fas fa-times"></i>
        `
        resetInputSearch();
    } else{
        inputIcon.innerHTML = `<i class="fas fa-search"></i>`
    }
}

/**
 * Resets the search engine to the default settings when the user click to the X
 */

const resetInputSearch = function() {
    const resetIcon = document.querySelector(".fa-times");
    resetIcon.addEventListener("click", () => {
        searchInput.value = "";
        inputIcon.innerHTML = `<i class="fas fa-search"></i>`;
        searchBar.classList.remove("active");
        listAutocomplete.innerHTML = "";
    });
}

/**
 * Sets the favorite button for all searched gifs
 */

const addBtnIconFav = function() {
    const content = document.querySelectorAll(".icon-icon-fav");
    for (let i = 0; i < content.length; i++) {
        content[i].addEventListener("click", () => {
            fav.addFavorite(content[i].id);
        });
    };
}

/**
 * Changes the style to the favorite button getting the data from LocalStorage
 */

const dataFavIconToggle = function() {
    const iconActive = document.querySelectorAll(".icon-icon-fav");
    const favElements = fav.getFavElementsLS() || [];
    let gifId = []; 
    for (let i = 0; i < iconActive.length; i++) {
        gifId.push(iconActive[i].id);
        if (favElements.some((favArray) => favArray.id === iconActive[i].id)) {
            iconActive[i].classList.add("active-fav");
        }
    }
}

/**
 * Adds the click event for every gif container
 */

const expandEventGifElement = function() {
    const gifsElements = document.querySelectorAll(".gif-elements");
    for (let i = 0; i < gifsElements.length; i++) {
        api.apiGetFavoriteId(gifsElements[i].id)
        .then(res => {
            const {data} = res;
            gifsElements[i].addEventListener("click", () => {
                expandGif(data);
            });
        })
    }
}

/**
 * Shows the expanded version of the image
*/

const expandGif = function(data) {
    const expandContainer = document.querySelector(".expand-view");
    window.scroll(0, 0);
    document.body.style.overflow = "hidden";
    expandContainer.innerHTML = `
            <div class="expand-elements">
            <div class="close-icon">
                <span></span>
                <span></span>
            </div>
            <div class="expand-img">
                <img src="${data.images.original.url}" alt="">
            </div>
            <div class="expand-info-elements">
                <div class="expand-info">
                    <h5 class="username">${data.username}</h5>
                    <h1 class="title-element">${data.title}</h1>
                </div>
                <div class="expand-icons">
                    <span class="icon-icon-fav expand" id="${data.id}">
                        <span class="path1"></span>
                        <span class="path2"></span>
                        <span class="icon-icon-fav-active"></span>
                    </span>
                    <span class="icon-icon-download expand-download">
                        <span class="path1"></span>
                        <span class="path2"></span>
                    </span>
                </div>
            </div>
        </div>
    `
    closeExpandView();
    addFavExpand(data);
    const iconActiveExpand = document.querySelectorAll(".expand");
    const favElements = fav.getFavElementsLS() || [];
    for (let i = 0; i < iconActiveExpand.length; i++) {
        if (favElements.some((favArray) => favArray.id === iconActiveExpand[i].id)) {
            iconActiveExpand[i].classList.add("active-fav-expand");
        }
    }
    const downloadBtnExpand = document.querySelector(".expand-download");
    downloadBtnExpand.addEventListener("click", () => {
        downloadFunction(data);
    });  
}

/**
 * Adds the event to the X button when the gif is in fullscreen mode
 */

const closeExpandView = function() {
    const close = document.querySelector(".close-icon");
    close.addEventListener("click", () => {
        const expandContainer = document.querySelector(".expand-view");
        window.scroll(0, 650);
        document.body.style.overflow = "initial";
        expandContainer.innerHTML = ``;
    })
}

/**
 * Adds functionality to the favorite button in the fullscreen mode
 */

const addFavExpand = function(data) {
    const favBtnExpand = document.querySelector(".expand");
    favBtnExpand.addEventListener("click", () => {
        fav.addFavorite(data.id);
    })
}

/**
 * Transform the gif into a local object and creates its respective download url
 */

const downloadFunction = function(data) {
    async function createUrlGif () {
        let a = document.createElement("a");
        let response = await fetch(`${data.images.original.url}`);
        let file = await response.blob();
        a.download = `${data.title}`;
        a.href = window.URL.createObjectURL(file);
        a.dataset.downloadurl = ['application/octet-stream', a.download, a.href].join(':');
        a.click();
    };
    return createUrlGif();
}

// Listeners

searchInput.addEventListener("keyup", (e) => {
    if(e.keyCode === 13){
        e.preventDefault();
        containerResults.innerHTML = "";
        notFoundImg.style.display = "unset";
        notFoundText.style.display = "unset";
        totalResults = 0;
        searchResults();
        searchBar.classList.remove("active");
        listAutocomplete.innerHTML = "";

    }
});
searchBtnActive.addEventListener("click", searchResults);
searchBtn.addEventListener("click", searchResults);
showMoreBtn.addEventListener("click", searchResults);
searchInput.addEventListener("input", autocompleteEngine);