/* global VuFind */
function loadCoverByElement (data, element) {
  const url = VuFind.path + '/AJAX/JSON?method=' + 'getRecordCover'
  const img = element.find('img')
  const spinner = element.children('div.spinner')
  const container = element.children('div.cover-container')
  function coverCallback (response) {
    spinner.hide()
    container.show()
    if (typeof response.data.url !== 'undefined' && response.data.url !== false) {
      img.attr('src', response.data.url)
      container.children().not('img').hide()
    } else {
      img.remove()
      if (typeof response.data.html !== 'undefined') {
        container.html(response.data.html)
      } else {
        container.html()
      }
    }
  }
  $.ajax({
    dataType: 'json',
    url: url,
    method: 'GET',
    data: data,
    element: element,
    success: coverCallback
  })
}

function loadCovers () {
  $('.ajaxcover').each(function getDataAndLoadCovers () {
    const img = $(this).find('img')
    const data = {
      source: img.data('recordsource'),
      recordId: img.data('recordid'),
      size: img.data('coversize')
    }
    loadCoverByElement(data, $(this))
  })
}
$(document).ready(loadCovers)
