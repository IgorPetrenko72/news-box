import moment from 'moment';
import ApiArticlesService from '../service/articles';
import articleTpl from './templates/article.hbs'

const apiArticleService = new ApiArticlesService();

class NewsBox {
  #markup = `
  <section class="news-app">
    <section class="header">
        <div class='header__wrapper'>
            <a class='header__logo'>
                <i class="fa-regular fa-newspaper"></i>
            </a>
            <div class='header__brand'>News Box</div>
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
    <div class="articles"></article> 
    </div>
    <section class="load-more">
    <button class="load-more__btn" hidden>More</button>
    </section>
    </section>
  `;
  #targetElement = null;
  #refs = {};
  #articles = [];
  #articleService = () => {};

  constructor({ targetElement, articlesService } = {}) {
    this.#targetElement = targetElement || document.body;
    this.#articleService = articlesService;
  }

  init() {
    this.#targetElement.innerHTML = this.#markup;
      this.#initRefs();
      this.#initListeners();
  }

  #initRefs() {
    this.#refs.search = document.querySelector('.news-app .search');
    this.#refs.articles = document.querySelector('.news-app .articles');
 }

  #initListeners() {
    this.#refs.search.addEventListener('submit', this.#onSearch.bind(this));
  }

  #updateArticles(articles) {
    this.#articles = articles;
    this.#render();
  }

  #onSearch(e) {
     e.preventDefault();
  const searchQuery = e.currentTarget.elements.search.value;
  
  this.#articleService
    .fetchData(searchQuery)
    .then((articles) => {
      this.#updateArticles(articles)
    })
    .catch((error) => {
      console.log(error);
    })
    .finally(() => {
      e.target.reset();
    });
  }

  #render() {
     const mockup = this.#articles
      .map(({ author, title, url, urlToImage, publishedAt, content }) => {
        const { text, timeForReading } = parseContent(content);

        return articleTpl({
          author,
          title,
          url,
          content,
          text,
          urlToImage,
          timeForReading,
          publishDate: moment(publishedAt).format('lll'),
        });
      })
      .join('');

    this.#refs.articles.innerHTML = mockup;
  }
}
// const apiArticlesService = new ApiArticlesService()
// const markup = `
//
//     `;
// add to DOM
// document.body.innerHTML = markup;

// const ref = {
//   search: document.querySelector('.news-app .search'),
//   articles: document.querySelector('.news-app .articles'),
// };

// ref.search.addEventListener('submit', (e) => {
//   e.preventDefault();
//   const searchQuery = e.currentTarget.elements.search.value;
  
//   apiArticlesService
//     .fetchData(searchQuery)
//     .then((articles) => {
//     renderArticles(articles);
//     })
//     .finally(() => {
//       e.target.reset();
//     });
  
// });

// function renderArticles(articles) {
//   const markup = articles.map(({ author, title, url, urlToImage, publishedAt, content }) => {
//     const { text, timeForReading } = parseContent(content);

//     return `
//     <article class="article">
//       <h2 class="article__title">${title}</h2>
//       <div class="article__publish-date">${moment(publishedAt).format('lll')}</div>
//       <div class="article__author">${author}</div>
//       <figure class="article__image">
//         <img src="${urlToImage}" alt="article__image">
//       </figure>
//       <div class="article__content">
//         ${text}
//         <a href="${url}" target="_blank">read more</a>
//       </div>
//       <div class="article__time-for-reading">${timeForReading} for reading</div>
//     </article>
//     `;
//   })
//     .join('');
//   ref.articles.innerHTML = markup;
// };

const newsBox = new NewsBox({articleService: new ApiArticlesService()});
newsBox.init();

function parseContent(content) {
  const firstSeparatorPosition = content.indexOf('[');
  const secondSeparatorPosition = content.indexOf(']');
  const parseResult = {
    text: null,
    timeForReading: null,
  };
  if (firstSeparatorPosition >= 0 && secondSeparatorPosition >= 0) {
    const numberOfChars = parseInt(content.substring(firstSeparatorPosition + 1, secondSeparatorPosition));
    parseResult.text = content.substring(0, firstSeparatorPosition);
    parseResult.timeForReading = calculateTimeForReading(numberOfChars);
  }
}

function calculateTimeForReading(numberOfChars) {
  const minutes = Math.floor(numberOfChars / 255);
  if (minutes === 0) {
    return 'less then one minute';
  }
  if (minutes > 0 && minutes < 2) {
    return 'more then one minute';
  }
  return `${minutes} minutes`;
}

