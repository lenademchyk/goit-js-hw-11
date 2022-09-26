import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

const KEY_Pixabay = '30153953-c2efe0b6c1d70b35b33114bd2';

let gallery = new SimpleLightbox('.gallery .photo-card a', {
  captionDelay: 250,
});
let searchQuery = '';
let page = 1;
let perPage = 40;

const formEl = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

formEl.addEventListener('submit', onSearchImages);
loadMoreBtn.addEventListener('click', onLoadMore);
galleryEl.addEventListener('click', onOpenImageWindow);

function onSearchImages(evt) {
  evt.preventDefault();
  searchQuery = evt.currentTarget.elements.searchQuery.value;

  if (searchQuery === '') {
    clearContent();
  }

  clearContent();
  page = 1;

  renderImagesMarkup(searchQuery.trim());
}

function onLoadMore() {
  fetchImages(searchQuery.trim())
    .then(images => {
      const totalPages = images.totalHits / perPage;
      insertImageMarkup(images);
      loadMoreBtn.classList.remove('is-hidden');
      scroll();

      if (page > totalPages) {
        loadMoreBtn.classList.add('is-hidden');
        Notiflix.Notify.warning(
          `We're sorry, but you've reached the end of search results.`
        );
      }

      page += 1;
      gallery.refresh();
    })
    .catch(error => console.log(error));
}

async function fetchImages(name) {
  const url = `https://pixabay.com/api/?key=${KEY_Pixabay}&q=${name}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${perPage}&page=${page}`;
  const response = await axios.get(url);
  const images = await response.data;
  if (name === '') {
    Notiflix.Notify.info(`Please, enter the text to find images.`);
    loadMoreBtn.classList.add('is-hidden');
    return;
  }

  return images;
}

async function renderImagesMarkup(searchQuery) {
  try {
    const images = await fetchImages(searchQuery.trim());
    const renderMarkup = await insertImageMarkup(images);
    loadMoreBtn.classList.add('is-hidden');

    if (images.totalHits > 0) {
      Notiflix.Notify.success(`Hooray! We found ${images.totalHits} images.`);
      loadMoreBtn.classList.remove('is-hidden');
    }
    if (images.totalHits === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }

    page += 1;
    gallery.refresh();
  } catch (error) {
    console.log(error);
  }
}

function renderImageCardMarkup(images) {
  return images.hits
    .map(
      image => `<div class="photo-card">
  <a class="gallery__item" href="${image.largeImageURL}"><img class="gallery__image" src="${image.webformatURL}" alt="${image.tags}" loading="lazy" /></a>
  <div class="info">
    <p class="info-item">
      <b>Likes</b>
       <br/>
      ${image.likes}
    </p>
    <p class="info-item">
      <b>Views</b>
      <br/>
      ${image.views}
    </p>
    <p class="info-item">
      <b>Comments</b>
      <br/>
      ${image.comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>
      <br/>
      ${image.downloads}
    </p>
  </div>
</div>`
    )
    .join('');
}

function onOpenImageWindow(event) {
  event.preventDefault();
  if (event.target.nodeName !== 'IMG') {
    return;
  }
}

function insertImageMarkup(images) {
  const markup = renderImageCardMarkup(images);
  galleryEl.insertAdjacentHTML('beforeend', markup);
}

function clearContent() {
  galleryEl.innerHTML = '';
}

function scroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
