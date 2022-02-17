/* global Hunt, VuFind */

VuFind.register('recordVersions', function recordVersions () {
  function checkRecordVersions (_container) {
    const container = typeof _container === 'undefined' ? $(document) : $(_container)

    const elements = container.hasClass('record-versions') && container.hasClass('ajax')
      ? container
      : container.find('.record-versions.ajax')
    elements.each(function checkVersions () {
      const $elem = $(this)
      if ($elem.hasClass('loaded')) {
        return
      }
      $elem.addClass('loaded')
      $elem.removeClass('hidden')
      $elem.append('<span class="js-load">' + VuFind.translate('loading') + '...</span>')
      const $item = $(this).parents('.result')
      const id = $item.find('.hiddenId')[0].value
      const source = $item.find('.hiddenSource')[0].value
      $.getJSON(
        VuFind.path + '/AJAX/JSON',
        {
          method: 'getRecordVersions',
          id: id,
          source: source
        }
      )
        .done(function onGetVersionsDone (response) {
          if (response.data.length > 0) {
            $elem.html(response.data)
          } else {
            $elem.text('')
          }
        })
        .fail(function onGetVersionsFail () {
          $elem.text(VuFind.translate('error_occurred'))
        })
    })
  }

  function init (_container) {
    if (typeof Hunt === 'undefined') {
      checkRecordVersions(_container)
    } else {
      const container = typeof _container === 'undefined'
        ? document.body
        : _container
      new Hunt(
        $(container).find('.record-versions.ajax').toArray(),
        { enter: checkRecordVersions }
      )
    }
  }

  return { init: init, check: checkRecordVersions }
})
