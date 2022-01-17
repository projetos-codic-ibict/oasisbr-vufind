async function getIndicatorsByType () {
  const indicators = await getIndicatorsBy(
    'search?type=AllFields&facet[]=format&sort=relevance&page=1&limit=0'
  )
  const data = indicators.facets.format
  return data
}

function fillArticles (indicators) {
  const articlesElement = document.querySelector('#articles')
  const articlesIndicador = indicators.filter(
    (indicator) => indicator.value == 'article'
  )
  let value = 0
  value = articlesIndicador.reduce((value, item) => value + item.count, 0)
  articlesElement.textContent = formatNumber(value)
}

function fillTeses (indicators) {
  const tesesElement = document.querySelector('#teses')
  const tesesIndicador = indicators.filter(
    (indicator) =>
      indicator.value == 'masterThesis' || indicator.value == 'doctoralThesis'
  )
  let value = 0
  value = tesesIndicador.reduce((value, item) => value + item.count, 0)
  tesesElement.textContent = formatNumber(value)
}

function fillDatasets (indicators) {
  const datasetsElement = document.querySelector('#datasets')
  const datasetsIndicador = indicators.filter(
    (indicator) => indicator.value == 'dataset'
  )
  let value = 0
  value = datasetsIndicador.reduce((value, item) => value + item.count, 0)
  datasetsElement.textContent = formatNumber(value)
}

function fillBooks (indicators) {
  const booksElement = document.querySelector('#books')
  const booksIndicador = indicators.filter(
    (indicator) => indicator.value == 'book' || indicator.value == 'bookPart'
  )
  let value = 0
  value = booksIndicador.reduce((value, item) => value + item.count, 0)
  booksElement.textContent = formatNumber(value)
}

document.addEventListener('DOMContentLoaded', async () => {
  const indicators = await getIndicatorsByType()
  fillArticles(indicators)
  fillTeses(indicators)
  fillDatasets(indicators)
  fillBooks(indicators)
})
