/* global deparam, getUrlRoot, recaptchaOnLoad, resetCaptcha, syn_get_widget, userIsLoggedIn, VuFind, setupJumpMenus */
/* exported ajaxTagUpdate, recordDocReady, refreshTagListCallback */

/**
 * Functions and event handlers specific to record pages.
 */
function checkRequestIsValid (element, requestType) {
  const recordId = element.href.match(/\/Record\/([^/]+)\//)[1]
  const vars = deparam(element.href)
  vars.id = recordId

  const url = VuFind.path + '/AJAX/JSON?' + $.param({
    method: 'checkRequestIsValid',
    id: recordId,
    requestType: requestType,
    data: vars
  })
  $.ajax({
    dataType: 'json',
    cache: false,
    url: url
  })
    .done(function checkValidDone (response) {
      if (response.data.status) {
        $(element).removeClass('disabled')
          .attr('title', response.data.msg)
          .html('<i class="fa fa-flag" aria-hidden="true"></i>&nbsp;' + response.data.msg)
      } else {
        $(element).remove()
      }
    })
    .fail(function checkValidFail (/* response */) {
      $(element).remove()
    })
}

function setUpCheckRequest () {
  $('.checkRequest').each(function checkRequest () {
    checkRequestIsValid(this, 'Hold')
  })
  $('.checkStorageRetrievalRequest').each(function checkStorageRetrievalRequest () {
    checkRequestIsValid(this, 'StorageRetrievalRequest')
  })
  $('.checkILLRequest').each(function checkILLRequest () {
    checkRequestIsValid(this, 'ILLRequest')
  })
}

function deleteRecordComment (element, recordId, recordSource, commentId) {
  const url = VuFind.path + '/AJAX/JSON?' + $.param({ method: 'deleteRecordComment', id: commentId })
  $.ajax({
    dataType: 'json',
    url: url
  })
    .done(function deleteCommentDone (/* response */) {
      $($(element).closest('.comment')[0]).remove()
    })
}

function refreshCommentList ($target, recordId, recordSource) {
  const url = VuFind.path + '/AJAX/JSON?' + $.param({
    method: 'getRecordCommentsAsHTML',
    id: recordId,
    source: recordSource
  })
  $.ajax({
    dataType: 'json',
    url: url
  })
    .done(function refreshCommentListDone (response) {
      // Update HTML
      const $commentList = $target.find('.comment-list')
      $commentList.empty()
      $commentList.append(response.data.html)
      $commentList.find('.delete').unbind('click').click(function commentRefreshDeleteClick () {
        const commentId = $(this).attr('id').substr('recordComment'.length)
        deleteRecordComment(this, recordId, recordSource, commentId)
        return false
      })
      $target.find('.comment-form input[type="submit"]').button('reset')
      resetCaptcha($target)
    })
}

function registerAjaxCommentRecord (_context) {
  const context = typeof _context === 'undefined' ? document : _context
  // Form submission
  $(context).find('form.comment-form').unbind('submit').submit(function commentFormSubmit () {
    const form = this
    const id = form.id.value
    const recordSource = form.source.value
    const url = VuFind.path + '/AJAX/JSON?' + $.param({ method: 'commentRecord' })
    const data = {}
    $(form).find('input,textarea').each(function appendCaptchaData () {
      const input = $(this)
      data[input.attr('name')] = input.val()
    })
    $.ajax({
      type: 'POST',
      url: url,
      data: data,
      dataType: 'json'
    })
      .done(function addCommentDone (/* response, textStatus */) {
        const $form = $(form)
        let $tab = $form.closest('.list-tab-content')
        if (!$tab.length) {
          $tab = $form.closest('.tab-pane')
        }
        refreshCommentList($tab, id, recordSource)
        $form.find('textarea[name="comment"]').val('')
        $form.find('input[type="submit"]').button('loading')
        resetCaptcha($form)
      })
      .fail(function addCommentFail (response, textStatus) {
        if (textStatus === 'abort' || typeof response.responseJSON === 'undefined') { return }
        VuFind.lightbox.alert(response.responseJSON.data, 'danger')
      })
    return false
  })
  // Delete links
  $('.delete').click(function commentDeleteClick () {
    const commentId = this.id.substr('recordComment'.length)
    deleteRecordComment(this, $('.hiddenId').val(), $('.hiddenSource').val(), commentId)
    return false
  })
  // Prevent form submit
  return false
}

// Forward declaration
let ajaxLoadTab = function ajaxLoadTabForward () {
}

function handleAjaxTabLinks (_context) {
  const context = typeof _context === 'undefined' ? document : _context
  // Form submission
  $(context).find('a').each(function handleLink () {
    const $a = $(this)
    const href = $a.attr('href')
    if (typeof href !== 'undefined' && href.match(/\/AjaxTab[/?]/)) {
      $a.unbind('click').click(function linkClick () {
        const tabid = $('.record-tabs .nav-tabs li.active').data('tab')
        const $tab = $('.' + tabid + '-tab')
        $tab.html('<i class="fa fa-spinner fa-spin" aria-hidden="true"></i> ' + VuFind.translate('loading') + '...</div>')
        ajaxLoadTab($tab, '', false, href)
        return false
      })
    }
  })
}

function registerTabEvents () {
  // Logged in AJAX
  registerAjaxCommentRecord()
  // Render recaptcha
  recaptchaOnLoad()

  setUpCheckRequest()

  handleAjaxTabLinks()

  VuFind.lightbox.bind('.tab-pane.active')

  if (typeof VuFind.openurl !== 'undefined') {
    VuFind.openurl.init($('.tab-pane.active'))
  }
}

function removeHashFromLocation () {
  if (window.history.replaceState) {
    const href = window.location.href.split('#')
    window.history.replaceState({}, document.title, href[0])
  } else {
    window.location.hash = '#'
  }
}

ajaxLoadTab = function ajaxLoadTabReal ($newTab, tabid, setHash, tabUrl) {
  // Request the tab via AJAX:
  let url = ''
  const postData = {}
  // If tabUrl is defined, it overrides base URL and tabid
  if (typeof tabUrl !== 'undefined') {
    url = tabUrl
  } else {
    url = VuFind.path + getUrlRoot(document.URL) + '/AjaxTab'
    postData.tab = tabid
  }
  $.ajax({
    url: url,
    type: 'POST',
    data: postData
  })
    .always(function ajaxLoadTabDone (data) {
      if (typeof data === 'object') {
        $newTab.html(data.responseText ? data.responseText : VuFind.translate('error_occurred'))
      } else {
        $newTab.html(data)
      }
      registerTabEvents()
      if (typeof syn_get_widget === 'function') {
        syn_get_widget()
      }
      if (typeof setHash === 'undefined' || setHash) {
        window.location.hash = tabid
      } else {
        removeHashFromLocation()
      }
      setupJumpMenus($newTab)
    })
  return false
}

function refreshTagList (_target, _loggedin) {
  const loggedin = !!_loggedin || userIsLoggedIn
  const target = _target || document
  const recordId = $(target).find('.hiddenId').val()
  const recordSource = $(target).find('.hiddenSource').val()
  const $tagList = $(target).find('.tagList')
  if ($tagList.length > 0) {
    const url = VuFind.path + '/AJAX/JSON?' + $.param({
      method: 'getRecordTags',
      id: recordId,
      source: recordSource
    })
    $.ajax({
      dataType: 'json',
      url: url
    })
      .done(function getRecordTagsDone (response) {
        $tagList.empty()
        $tagList.replaceWith(response.data.html)
        if (loggedin) {
          $tagList.addClass('loggedin')
        } else {
          $tagList.removeClass('loggedin')
        }
      })
  }
}
function refreshTagListCallback () {
  refreshTagList(false, true)
}

function ajaxTagUpdate (_link, tag, _remove) {
  const link = _link || document
  const remove = _remove || false
  const $target = $(link).closest('.record')
  const recordId = $target.find('.hiddenId').val()
  const recordSource = $target.find('.hiddenSource').val()
  $.ajax({
    url: VuFind.path + '/AJAX/JSON?method=tagRecord',
    method: 'POST',
    data: {
      tag: '"' + tag.replace(/\+/g, ' ') + '"',
      id: recordId,
      source: recordSource,
      remove: remove
    }
  })
    .always(function tagRecordAlways () {
      refreshTagList($target, false)
    })
}

function getNewRecordTab (tabid) {
  return $('<div class="tab-pane ' + tabid + '-tab"><i class="fa fa-spinner fa-spin" aria-hidden="true"></i> ' + VuFind.translate('loading') + '...</div>')
}

function backgroundLoadTab (tabid) {
  if ($('.' + tabid + '-tab').length > 0) {
    return
  }
  const newTab = getNewRecordTab(tabid)
  $('[data-tab="' + tabid + '"]').closest('.result,.record').find('.tab-content').append(newTab)
  return ajaxLoadTab(newTab, tabid, false)
}

function applyRecordTabHash (scrollToTabs) {
  const activeTab = $('.record-tabs li.active').attr('data-tab')
  const $initiallyActiveTab = $('.record-tabs li.initiallyActive a')
  const newTab = typeof window.location.hash !== 'undefined'
    ? window.location.hash.toLowerCase()
    : ''

  // Open tab in url hash
  if (newTab.length <= 1 || newTab === '#tabnav') {
    $initiallyActiveTab.click()
  } else if (newTab.length > 1 && '#' + activeTab !== newTab) {
    const $tabLink = $('.record-tabs .' + newTab.substr(1) + ' a')
    if ($tabLink.length > 0) {
      $tabLink.click()
      if (typeof scrollToTabs === 'undefined' || scrollToTabs !== false) {
        $('html, body').animate({
          scrollTop: $('.record-tabs').offset().top
        }, 500)
      }
    }
  }
}

$(window).on('hashchange', applyRecordTabHash)

function removeCheckRouteParam () {
  if (window.location.search.indexOf('checkRoute=1') >= 0) {
    const newHref = window.location.href.replace('?checkRoute=1&', '?').replace(/[?&]checkRoute=1/, '')
    if (window.history && window.history.replaceState) {
      window.history.replaceState({}, '', newHref)
    }
  }
}

function recordDocReady () {
  removeCheckRouteParam()
  $('.record-tabs .nav-tabs a').click(function recordTabsClick () {
    const $li = $(this).parent()
    // If it's an active tab, click again to follow to a shareable link.
    if ($li.hasClass('active')) {
      return true
    }
    const tabid = $li.attr('data-tab')
    const $top = $(this).closest('.record-tabs')
    // if we're flagged to skip AJAX for this tab, we need special behavior:
    if ($li.hasClass('noajax')) {
      // if this was the initially active tab, we have moved away from it and
      // now need to return -- just switch it back on.
      if ($li.hasClass('initiallyActive')) {
        $(this).tab('show')
        $top.find('.tab-pane.active').removeClass('active')
        $top.find('.' + tabid + '-tab').addClass('active')
        window.location.hash = 'tabnav'
        return false
      }
      // otherwise, we need to let the browser follow the link:
      return true
    }
    $top.find('.tab-pane.active').removeClass('active')
    $(this).tab('show')
    if ($top.find('.' + tabid + '-tab').length > 0) {
      $top.find('.' + tabid + '-tab').addClass('active')
      if ($(this).parent().hasClass('initiallyActive')) {
        removeHashFromLocation()
      } else {
        window.location.hash = tabid
      }
      return false
    } else {
      const newTab = getNewRecordTab(tabid).addClass('active')
      $top.find('.tab-content').append(newTab)
      return ajaxLoadTab(newTab, tabid, !$(this).parent().hasClass('initiallyActive'))
    }
  })

  $('[data-background]').each(function setupBackgroundTabs (index, el) {
    backgroundLoadTab(el.dataset.tab)
  })

  registerTabEvents()
  applyRecordTabHash(false)
}
