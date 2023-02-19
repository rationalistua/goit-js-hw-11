'use strict';

const axios = require('axios').default;
import Notiflix from 'notiflix';
import simpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const formRef = document.querySelector('#search-form');
const galleryRef = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
const loadMoreText = document.querySelector('.button-span');

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '30820534-071dc1085067688ec0ddc9858';

let pageToFetch = 1;
let searchword = '';

async function fetchImages(page, searchword) {
  const response = await axios.get(`${BASE_URL}?key=${API_KEY}`, {
    params: {
      q: searchword,
      per_page: 40,
      page: page,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
    },
  });
  if (response.status !== 200) {
    console.log('error mfk');
    throw new Error(response.status);
  }
  const images = await response.data;
  return images;
}

async function getImages(page, searchword) {
  try {
    const data = await fetchImages(page, searchword);
    if (page === 1 && data.totalHits !== 0) {
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
    }
    if (data.hits.length === 0) {
      loadMoreBtn.classList.add('invisible');
      loadMoreText.classList.add('invisible');
      Notiflix.Notify.failure(
        `Sorry, there are no images matching your search ${searchword}. Please try again.`
      );
    }
    const images = data.hits;
    renderImages(images);
    new simpleLightbox('.gallery a').refresh();
    if (pageToFetch === Math.ceil(data.totalHits / 40)) {
      loadMoreBtn.classList.add('invisible');
      loadMoreText.classList.add('invisible');
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
      return;
    }
    pageToFetch += 1;
    if (data.totalHits / 40 > 1) {
      loadMoreBtn.classList.remove('invisible');
      loadMoreText.classList.remove('invisible');
    }
  } catch (error) {
    console.log(error);
  }
}

function renderImages(images) {
  const markup = images
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<a href="${largeImageURL}">
        <div class="photo-card">
  <img src="${webformatURL}" alt="${tags}" width=320 height=213 loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b>Likes</b>${likes}
    </p>
    <p class="info-item">
      <b>Views</b>${views}
    </p>
    <p class="info-item">
      <b>Comments</b>${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>${downloads}
    </p>
  </div>
</div></a>`;
      }
    )
    .join('');
  galleryRef.insertAdjacentHTML('beforeend', markup);
}

formRef.addEventListener('submit', onFormSubmit);

function onFormSubmit(event) {
  event.preventDefault();
  const query = event.target.elements.searchQuery.value;
  searchword = query;
  pageToFetch = 1;
  galleryRef.innerHTML = '';
  
  if (query === '' || query.match(/\s/)) {
    loadMoreBtn.classList.add('invisible');
    loadMoreText.classList.add('invisible');
    return;
  }
  getImages(pageToFetch, query);
}

loadMoreBtn.addEventListener('click', () => {
  getImages(pageToFetch, searchword);
});
