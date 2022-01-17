const INDICATORS_FACETS =
  'search?type=AllFields&page=0&limit=0&sort=relevance&facet[]=author_facet&facet[]=dc.subject.por.fl_str_mv&facet[]=eu_rights_str_mv&facet[]=dc.publisher.program.fl_str_mv&facet[]=dc.subject.cnpq.fl_str_mv&facet[]=publishDate&facet[]=language&facet[]=format&facet[]=institution&facet[]=dc.contributor.advisor1.fl_str_mv'

const API_BASE_URL =
  window.location.hostname === 'localhost'
    ? `http://${window.location.host}/vufind/api/v1`
    : `https://${window.location.host}/vufind/api/v1`

const REMOTE_API_URL =
  window.location.hostname === 'localhost'
    ? `http://${window.location.host}:3000/api/v1`
    : `https://api-${window.location.host}/api/v1`

async function getIndicatorsBy (filter) {
  try {
    const response = await axios.get(`${API_BASE_URL}/${filter}`)
    return response.data
  } catch (errors) {
    console.error(errors)
  }
}

async function getIndicatorsFromVufindApi (lookfor, type) {
  try {
    let URL = `${API_BASE_URL}/${INDICATORS_FACETS}`
    if (lookfor) {
      URL = URL + `&lookfor=${lookfor}`
    }
    if (type) {
      URL = URL + `&type=${type}`
    }
    const response = await axios.get(URL)
    return response.data
  } catch (errors) {
    console.error(errors)
  }
}

async function getIndicatorsFromRemoteApiBy (filter) {
  try {
    const response = await axios.get(`${REMOTE_API_URL}${filter}`)
    const indicators = response.data
    return indicators
  } catch (errors) {
    console.error(errors)
  }
}

async function getTotalOfDocuments () {
  const resp = await getIndicatorsBy(
    'search?limit=0'
  )
  setPlaceholderInputSearch(resp.resultCount)
  return resp.resultCount
}

function setPlaceholderInputSearch (totalDocuments) {
  const inputSearch = document.querySelector('[data-search]')
  if (inputSearch) {
    inputSearch.placeholder = `Pesquise entre ${formatNumber(
      totalDocuments
    )} documentos`
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  getTotalOfDocuments()
})
