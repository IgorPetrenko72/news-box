const BASE_URL = 'https://newsapi.org/v2';
const API_KEY = 'f709789d6e894d2ca4072f45d44a83bb';
const OPTIONS = {
    headers: {
      Authorization: API_KEY,
    },
  };
export default class ArticlesService {
    fetchData(searchQuery) {
    const searchParams = new URLSearchParams({
    q: searchQuery,
    sortBy: 'publishedAt',
    pageSize: 10,
  })

    return fetch(`${BASE_URL}/everything?${searchParams}`, OPTIONS)
    .then((response) => response.json())
    .then(({articles}) => articles)
    .catch((error) => {
      console.log(error);
    });
    }
}