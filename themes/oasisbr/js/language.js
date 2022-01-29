function getSiteLanguage () {
  const urlParams = new URLSearchParams(window.location.search)
  const lng = urlParams.get('lng') || 'pt-br'
  return lng
}
const lng = getSiteLanguage()

function getTranslatedText (key) {
  let text = ''
  switch (lng) {
    case 'en':
      text = english.get(key)
      return text || key
    case 'pt-br':
      text = portuguese.get(key)
      return text || key
    default:
      text = portuguese.get(key)
      return text || key
  }
}

const english = new Map()
// gráfico de idiomas
english.set('eng', 'English')
english.set('fra', 'French')
english.set('ita', 'Italian')
english.set('por', 'Portuguese')
english.set('spa', 'Spanish')
// tipos de documento
english.set('article', 'Article')
english.set('bachelorThesis', 'Bachelor Thesis')
english.set('book', 'Book')
english.set('bookPart', 'Book Part')
english.set('conferenceObject', 'Conference Object')
english.set('dataset', 'Dataset')
english.set('doctoralThesis', 'Doctoral Thesis')
english.set('masterThesis', 'Master Thesis')
english.set('other', 'Other')
english.set('patent', 'Patent')
english.set('report', 'Report')
english.set('review', 'Review')
english.set('workingPaper', 'Working Paper')
// tipos de acesso
english.set('closedAccess', 'Closed Access')
english.set('embargoedAccess', 'Embargoed Access')
english.set('openAccess', 'Open Access')
english.set('restrictedAccess', 'Restricted Access')

english.set('Subject', 'Subject')
english.set('Author', 'Author')
english.set('Title', 'Title')
english.set('Search among', 'Search among')
english.set('documents', 'documents')

const portuguese = new Map()
// gráfico de idiomas
portuguese.set('eng', 'Inglês')
portuguese.set('fra', 'Francês')
portuguese.set('ita', 'Italiano')
portuguese.set('por', 'Português')
portuguese.set('spa', 'Espanhol')
// tipos de documento
portuguese.set('article', 'Artigo')
portuguese.set('bachelorThesis', 'TCC')
portuguese.set('book', 'Livro')
portuguese.set('bookPart', 'Capítulo de livro')
portuguese.set('conferenceObject', 'Artigo de conferência')
portuguese.set('dataset', 'Conjunto de dados')
portuguese.set('doctoralThesis', 'Tese')
portuguese.set('masterThesis', 'Dissertação')
portuguese.set('other', 'Outros')
portuguese.set('patent', 'Patente')
portuguese.set('report', 'Relatório')
portuguese.set('review', 'Artigo (review)')
portuguese.set('workingPaper', 'Artigo (working paper)')
// tipos de acesso
portuguese.set('closedAccess', 'Acesso fechado')
portuguese.set('embargoedAccess', 'Acesso embargado')
portuguese.set('openAccess', 'Acesso aberto')
portuguese.set('restrictedAccess', 'Acesso restrito')

portuguese.set('Subject', 'Assunto')
portuguese.set('Author', 'Autor')
portuguese.set('Title', 'Título')

portuguese.set('Search among', 'Pesquise entre')
portuguese.set('documents', 'documentos')
