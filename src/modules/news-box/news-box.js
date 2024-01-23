import articlesService from '../service/articles';
import notifier from '../service/notifier';
import articleTpl from './templates/article.hbs';

class NewsBox {
  #markup = `
    <section class="news-app">
    <section class="header">

    <div class="inner-header flex">
      <svg version="1.1" class="logo" baseProfile="tiny" id="Layer_1" xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 500 500" xml:space="preserve">
        <path fill="#FFFFFF" stroke="#000000" stroke-width="10" stroke-miterlimit="10" d="M57,283" />
          <g><path fill="#fff"
          d="M250.4,0.8C112.7,0.8,1,112.4,1,250.2c0,137.7,111.7,249.4,249.4,249.4c137.7,0,249.4-111.7,249.4-249.4
          C499.8,112.4,388.1,0.8,250.4,0.8z M383.8,326.3c-62,0-101.4-14.1-117.6-46.3c-17.1-34.1-2.3-75.4,13.2-104.1
          c-22.4,3-38.4,9.2-47.8,18.3c-11.2,10.9-13.6,26.7-16.3,45c-3.1,20.8-6.6,44.4-25.3,62.4c-19.8,19.1-51.6,26.9-100.2,24.6l1.8-39.7		c35.9,1.6,59.7-2.9,70.8-13.6c8.9-8.6,11.1-22.9,13.5-39.6c6.3-42,14.8-99.4,141.4-99.4h41L333,166c-12.6,16-45.4,68.2-31.2,96.2	c9.2,18.3,41.5,25.6,91.2,24.2l1.1,39.8C390.5,326.2,387.1,326.3,383.8,326.3z" />
          </g>
      </svg>
      <h1>News Waves</h1>
    </div>

    <div>
      <svg class="waves" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 24 150 28" preserveAspectRatio="none" shape-rendering="auto">
        <defs>
          <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
        </defs>
          <g class="parallax">
            <use xlink:href="#gentle-wave" x="48" y="0" fill="rgba(255,255,255,0.7" />
            <use xlink:href="#gentle-wave" x="48" y="3" fill="rgba(255,255,255,0.5)" />
            <use xlink:href="#gentle-wave" x="48" y="5" fill="rgba(255,255,255,0.3)" />
            <use xlink:href="#gentle-wave" x="48" y="7" fill="#fff" />
          </g>
      </svg>
    </div>
        
    </section>
    <form class="search">
        <div class="search__wrapper">
            <input class="search__field" type="text" placeholder="What are you looking for?" name="search">
            <button class="search__btn" type="submit">
            <span class="search__icon">
                <i class="fa-solid fa-magnifying-glass"></i>
                <i class="fa-solid fa-circle-notch"></i>
            </span>
            </button>
        </div>
    </form>
      <div class="articles"></div> 
      </div>
      <section class="load-more">
        <button class="load-more__btn load-more__btn_hidden">More</button>
      </section>
    </section>
    `;
  #targetElement = null;
  #infinityLoading = false;
  #searchQuery = null;
  #refs = {};
  #articles = [];

  constructor({ targetElement, infinityLoading = false } = {}) {
    this.#targetElement = targetElement || document.body;
    this.#infinityLoading = infinityLoading;
  }

  init() {
    this.#targetElement.innerHTML = this.#markup;
    this.#initRefs();
    this.#initListeners();

    if (this.#infinityLoading) {
      this.#initInfinityLoading();
    }
  }

  #initRefs() {
    this.#refs.search = document.querySelector('.news-app .search');
    this.#refs.articles = document.querySelector('.news-app .articles');
    this.#refs.moreBtn = document.querySelector('.news-app .load-more__btn');
  }

  #initListeners() {
    this.#refs.search.addEventListener('submit', this.#onSearch.bind(this));
    this.#refs.moreBtn.addEventListener('click', this.#onClickLoadMoreBtn.bind(this));
  }

  #updateArticles(articles) {
    this.#articles = articles;
    this.#render();

    if (!this.#infinityLoading) {
      this.#toggleMoreButton();
    }
  }

  #onSearch(e) {
    e.preventDefault();
    this.#searchQuery = e.currentTarget.elements.search.value;

    this.#fetchArticles()
      .then((articles) => {
        if (articles.length === 0) {
          return notifier.info('No results. Please clarify your search');
        }

        this.#updateArticles(articles);
      })
      .finally(() => {
        e.target.reset();
      });
  }

  #fetchArticles() {
    return articlesService
      .fetchData(this.#searchQuery)
      .then((articles) => articles)
      .catch((error) => {
        console.error(error); // dev
        notifier.error('Something went wrong. Please try later'); //
      });
  }

  #loadMore() {
    return this.#fetchArticles().then((articles) => {
      this.#updateArticles([...this.#articles, ...articles]);
    });
  }

  #onClickLoadMoreBtn() {
    this.#refs.moreBtn.classList.add('load-more__btn_loading');
    this.#refs.moreBtn.disabled = true;

    this.#loadMore().finally(() => {
      this.#refs.moreBtn.classList.remove('load-more__btn_loading');
      this.#refs.moreBtn.disabled = false;
    });
  }

  #toggleMoreButton() {
    if (this.#articles.length > 0) {
      this.#refs.moreBtn.classList.remove('load-more__btn_hidden');
    } else {
      this.#refs.moreBtn.classList.add('load-more__btn_hidden');
    }
  }

  #initInfinityLoading() {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && this.#articles.length > 0) {
            this.#loadMore();
          }
        }
      },
      { rootMargin: '400px' },
    );

    observer.observe(this.#refs.moreBtn);
  }

  #render() {
    const mockup = this.#articles.map((data) => articleTpl({ ...data })).join('');

    this.#refs.articles.innerHTML = mockup;
  }
}

const newsBox = new NewsBox({ infinityLoading: true });
newsBox.init();
