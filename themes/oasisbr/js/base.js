const INDICATORS_FACETS =
  'search?type=AllFields&page=0&limit=0&sort=relevance&facet[]=author_facet&facet[]=dc.subject.por.fl_str_mv&facet[]=eu_rights_str_mv&facet[]=dc.publisher.program.fl_str_mv&facet[]=dc.subject.cnpq.fl_str_mv&facet[]=publishDate&facet[]=language&facet[]=format&facet[]=institution&facet[]=dc.contributor.advisor1.fl_str_mv';

let API_BASE_URL;
let REMOTE_API_URL;

let loader = '';

function showLoader() {
  try {
    loader.style.display = 'block';
    console.log('show loader');
  } catch (error) { }
}
function hideLoader() {
  try {
    loader.style.display = 'none';
    console.log('hide loader');
  } catch (error) { }
}

function showMessageError(element) {
  const networksElement = document.querySelector(element);
  if (networksElement) {
    networksElement.innerHTML = `<div class="alert alert-danger" role="alert">
    ${getTranslatedText('Failed to load data sources, please try again later')}
    </div>`;
  }
}

if (window.location.hostname === 'oasisbr.ibict.br' || window.location.hostname === 'oasisbrhm.ibict.br') {
  API_BASE_URL = `https://${window.location.host}/vufind/api/v1`;
  REMOTE_API_URL = `https://api-${window.location.host}/api/v1`;
} else {
  API_BASE_URL = `http://${window.location.host}/vufind/api/v1`;
  REMOTE_API_URL = `http://${window.location.host}:3000/api/v1`;
}

async function getIndicatorsBy(filter) {
  try {
    const response = await axios.get(`${API_BASE_URL}/${filter}`);
    return response.data;
  } catch (errors) {
    console.error(errors);
  }
}

async function getIndicatorsFromVufindApi(lookfor, type) {
  try {
    let URL = `${API_BASE_URL}/${INDICATORS_FACETS}`;
    if (lookfor) {
      URL = URL + `&lookfor=${lookfor}`;
    }
    if (type) {
      URL = URL + `&type=${type}`;
    }
    const response = await axios.get(URL);
    return response.data;
  } catch (errors) {
    console.error(errors);
  }
}

async function getTotalOfDocuments() {
  const resp = await getIndicatorsBy('search?limit=0');
  setPlaceholderInputSearch(resp.resultCount);
  return resp.resultCount;
}

function setPlaceholderInputSearch(totalDocuments) {
  const inputSearch = document.querySelector('[data-search]');
  if (inputSearch) {
    inputSearch.placeholder = `${getTranslatedText(
      'Search among'
    )} ${formatNumber(totalDocuments)} ${getTranslatedText('documents')}`;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  getTotalOfDocuments();
  console.log('loader');
  loader = document.querySelector('.loader');
});
