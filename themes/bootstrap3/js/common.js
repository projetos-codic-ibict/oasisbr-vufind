/* global grecaptcha, isPhoneNumberValid */
/* exported VuFind, htmlEncode, deparam, getUrlRoot, phoneNumberFormHandler, recaptchaOnLoad, resetCaptcha, bulkFormHandler, setupMultiILSLoginFields */

// IE 9< console polyfill
window.console = window.console || { log: function polyfillLog () {} }

const VuFind = (function VuFind () {
  const defaultSearchBackend = null
  const path = null
  let _initialized = false
  const _submodules = []
  const _translations = {}

  // Emit a custom event
  // Recommendation: prefix with vf-
  const emit = function emit (name, detail) {
    if (typeof detail === 'undefined') {
      document.dispatchEvent(new Event(name))
    } else {
      const event = document.createEvent('CustomEvent')
      event.initCustomEvent(name, true, true, detail) // name, canBubble, cancelable, detail
      document.dispatchEvent(event)
    }
  }
  // Listen shortcut to put everyone on the same element
  const listen = function listen (name, func) {
    document.addEventListener(name, func, false)
  }

  const register = function register (name, module) {
    if (_submodules.indexOf(name) === -1) {
      _submodules.push(name)
      this[name] = typeof module === 'function' ? module() : module

      // If the object has already initialized, we should auto-init on register:
      if (_initialized && this[name].init) {
        this[name].init()
      }
    }
  }
  const init = function init () {
    for (let i = 0; i < _submodules.length; i++) {
      if (this[_submodules[i]].init) {
        this[_submodules[i]].init()
      }
    }
    _initialized = true
  }

  const addTranslations = function addTranslations (s) {
    for (const i in s) {
      if (Object.prototype.hasOwnProperty.call(s, i)) {
        _translations[i] = s[i]
      }
    }
  }
  const translate = function translate (op, _replacements) {
    const replacements = _replacements || []
    let translation = _translations[op] || op
    if (replacements) {
      for (const key in replacements) {
        if (Object.prototype.hasOwnProperty.call(replacements, key)) {
          translation = translation.replace(key, replacements[key])
        }
      }
    }
    return translation
  }

  /**
   * Reload the page without causing trouble with POST parameters while keeping hash
   */
  const refreshPage = function refreshPage () {
    const parts = window.location.href.split('#')
    if (typeof parts[1] === 'undefined') {
      window.location.reload()
    } else {
      let href = parts[0]
      // Force reload with a timestamp
      href += href.indexOf('?') === -1 ? '?_=' : '&_='
      href += new Date().getTime() + '#' + parts[1]
      window.location.href = href
    }
  }

  // Reveal
  return {
    defaultSearchBackend: defaultSearchBackend,
    path: path,

    addTranslations: addTranslations,
    init: init,
    emit: emit,
    listen: listen,
    refreshPage: refreshPage,
    register: register,
    translate: translate
  }
})()

/* --- GLOBAL FUNCTIONS --- */
function htmlEncode (value) {
  if (value) {
    return $('<div />').text(value).html()
  } else {
    return ''
  }
}
function extractClassParams (selector) {
  const str = $(selector).attr('class')
  if (typeof str === 'undefined') {
    return []
  }
  const params = {}
  const classes = str.split(/\s+/)
  for (let i = 0; i < classes.length; i++) {
    if (classes[i].indexOf(':') > 0) {
      const pair = classes[i].split(':')
      params[pair[0]] = pair[1]
    }
  }
  return params
}
// Turn GET string into array
function deparam (url) {
  if (!url.match(/\?|&/)) {
    return []
  }
  const request = {}
  const pairs = url.substring(url.indexOf('?') + 1).split('&')
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split('=')
    let name = decodeURIComponent(pair[0].replace(/\+/g, ' '))
    if (name.length === 0) {
      continue
    }
    if (name.substring(name.length - 2) === '[]') {
      name = name.substring(0, name.length - 2)
      if (!request[name]) {
        request[name] = []
      }
      request[name].push(decodeURIComponent(pair[1].replace(/\+/g, ' ')))
    } else {
      request[name] = decodeURIComponent(pair[1].replace(/\+/g, ' '))
    }
  }
  return request
}

function getUrlRoot (url) {
  // Parse out the base URL for the current record:
  let urlroot = null
  const urlParts = url.split(/[?#]/)
  const urlWithoutFragment = urlParts[0]
  const slashSlash = urlWithoutFragment.indexOf('//')
  if (VuFind.path === '' || VuFind.path === '/') {
    // special case -- VuFind installed at site root:
    const chunks = urlWithoutFragment.split('/')
    // We need to extract different offsets if this is a full vs. relative URL:
    urlroot = slashSlash > -1
      ? ('/' + chunks[3] + '/' + chunks[4])
      : ('/' + chunks[1] + '/' + chunks[2])
  } else {
    // standard case -- VuFind has its own path under site:
    const pathInUrl = slashSlash > -1
      ? urlWithoutFragment.indexOf(VuFind.path, slashSlash + 2)
      : urlWithoutFragment.indexOf(VuFind.path)
    const parts = urlWithoutFragment.substring(pathInUrl + VuFind.path.length + 1).split('/')
    urlroot = '/' + parts[0] + '/' + parts[1]
  }
  return urlroot
}

// Phone number validation
function phoneNumberFormHandler (numID, regionCode) {
  const phoneInput = document.getElementById(numID)
  const number = phoneInput.value
  let valid = isPhoneNumberValid(number, regionCode)
  if (valid !== true) {
    if (typeof valid === 'string') {
      valid = VuFind.translate(valid)
    } else {
      valid = VuFind.translate('libphonenumber_invalid')
    }
    $(phoneInput).siblings('.help-block.with-errors').html(valid)
    $(phoneInput).closest('.form-group').addClass('sms-error')
    return false
  } else {
    $(phoneInput).closest('.form-group').removeClass('sms-error')
    $(phoneInput).siblings('.help-block.with-errors').html('')
  }
}

// Setup captchas after Google script loads
function recaptchaOnLoad () {
  if (typeof grecaptcha !== 'undefined') {
    const captchas = $('.g-recaptcha:empty')
    for (let i = 0; i < captchas.length; i++) {
      $(captchas[i]).data('captchaId', grecaptcha.render(captchas[i], $(captchas[i]).data()))
    }
  }
}
function resetCaptcha ($form) {
  if (typeof grecaptcha !== 'undefined') {
    const captcha = $form.find('.g-recaptcha')
    if (captcha.length > 0) {
      grecaptcha.reset(captcha.data('captchaId'))
    }
  }
}

function bulkFormHandler (event, data) {
  if ($('.checkbox-select-item:checked,checkbox-select-all:checked').length === 0) {
    VuFind.lightbox.alert(VuFind.translate('bulk_noitems_advice'), 'danger')
    return false
  }
  for (const i in data) {
    if (data[i].name === 'print') {
      return true
    }
  }
}

// Ready functions
function setupOffcanvas () {
  if ($('.sidebar').length > 0 && $(document.body).hasClass('offcanvas')) {
    $('[data-toggle="offcanvas"]').click(function offcanvasClick (e) {
      e.preventDefault()
      $('body.offcanvas').toggleClass('active')
    })
  }
}

function setupAutocomplete () {
  // If .autocomplete class is missing, autocomplete is disabled and we should bail out.
  const searchbox = $('#searchForm_lookfor.autocomplete')
  if (searchbox.length < 1) {
    return
  }
  // Auto-submit based on config
  let acCallback = function ac_cb_noop () {}
  if (searchbox.hasClass('ac-auto-submit')) {
    acCallback = function autoSubmitAC (item, input) {
      input.val(item.value)
      $('#searchForm').submit()
      return false
    }
  }
  // Search autocomplete
  searchbox.autocomplete({
    rtl: $(document.body).hasClass('rtl'),
    maxResults: 10,
    loadingString: VuFind.translate('loading') + '...',
    // Auto-submit selected item
    callback: acCallback,
    // AJAX call for autocomplete results
    handler: function vufindACHandler (input, cb) {
      const query = input.val()
      const searcher = extractClassParams(input)
      const hiddenFilters = []
      $('#searchForm').find('input[name="hiddenFilters[]"]').each(function hiddenFiltersEach () {
        hiddenFilters.push($(this).val())
      })
      $.fn.autocomplete.ajax({
        url: VuFind.path + '/AJAX/JSON',
        data: {
          q: query,
          method: 'getACSuggestions',
          searcher: searcher.searcher,
          type: searcher.type ? searcher.type : $('#searchForm_type').val(),
          hiddenFilters: hiddenFilters
        },
        dataType: 'json',
        success: function autocompleteJSON (json) {
          if (json.data.suggestions.length > 0) {
            const datums = []
            for (let j = 0; j < json.data.suggestions.length; j++) {
              datums.push(json.data.suggestions[j])
            }
            cb(datums)
          } else {
            cb([])
          }
        }
      })
    }
  })
  // Update autocomplete on type change
  $('#searchForm_type').change(function searchTypeChange () {
    searchbox.autocomplete().clearCache()
  })
}

/**
 * Handle arrow keys to jump to next record
 */
function keyboardShortcuts () {
  const $searchform = $('#searchForm_lookfor')
  if ($('.pager').length > 0) {
    $(window).keydown(function shortcutKeyDown (e) {
      if (!$searchform.is(':focus')) {
        let $target = null
        switch (e.keyCode) {
          case 37: // left arrow key
            $target = $('.pager').find('a.previous')
            if ($target.length > 0) {
              $target[0].click()
            }
            break
          case 38: // up arrow key
            if (e.ctrlKey) {
              $target = $('.pager').find('a.backtosearch')
              if ($target.length > 0) {
                $target[0].click()
              }
            }
            break
          case 39: // right arrow key
            $target = $('.pager').find('a.next')
            if ($target.length > 0) {
              $target[0].click()
            }
            break
          case 40: // down arrow key
            break
        }
      }
    })
  }
}

function setupIeSupport () {
  // Disable Bootstrap modal focus enforce on IE since it breaks Recaptcha.
  // Cannot use conditional comments since IE 11 doesn't support them but still has
  // the issue
  const ua = window.navigator.userAgent
  if (ua.indexOf('MSIE') || ua.indexOf('Trident/')) {
    $.fn.modal.Constructor.prototype.enforceFocus = function emptyEnforceFocus () { }
  }
}

function setupJumpMenus (_container) {
  const container = _container || $('body')
  container.find('select.jumpMenu').change(function jumpMenu () { $(this).parent('form').submit() })
}

function setupMultiILSLoginFields (loginMethods, idPrefix) {
  const searchPrefix = idPrefix ? '#' + idPrefix : '#'
  $(searchPrefix + 'target').change(function onChangeLoginTarget () {
    const target = $(this).val()
    const $usernameGroup = $(searchPrefix + 'username').closest('.form-group')
    const $password = $(searchPrefix + 'password')
    if (loginMethods[target] === 'email') {
      $usernameGroup.find('label.password-login').addClass('hidden')
      $usernameGroup.find('label.email-login').removeClass('hidden')
      $password.closest('.form-group').addClass('hidden')
      // Set password to a dummy value so that any checks for username+password work
      $password.val('****')
    } else {
      $usernameGroup.find('label.password-login').removeClass('hidden')
      $usernameGroup.find('label.email-login').addClass('hidden')
      $password.closest('.form-group').removeClass('hidden')
    }
  }).change()
}

function setupQRCodeLinks (_container) {
  const container = _container || $('body')

  container.find('a.qrcodeLink').click(function qrcodeToggle () {
    if ($(this).hasClass('active')) {
      $(this).html(VuFind.translate('qrcode_show')).removeClass('active')
    } else {
      $(this).html(VuFind.translate('qrcode_hide')).addClass('active')
    }

    const holder = $(this).next('.qrcode')
    if (holder.find('img').length === 0) {
      // We need to insert the QRCode image
      const template = holder.find('.qrCodeImgTag').html()
      holder.html(template)
    }
    holder.toggleClass('hidden')
    return false
  })
}

$(document).ready(function commonDocReady () {
  // Start up all of our submodules
  VuFind.init()
  // Setup search autocomplete
  setupAutocomplete()
  // Off canvas
  setupOffcanvas()
  // Keyboard shortcuts in detail view
  keyboardShortcuts()

  // support "jump menu" dropdown boxes
  setupJumpMenus()

  // handle QR code links
  setupQRCodeLinks()

  // Checkbox select all
  $('.checkbox-select-all').change(function selectAllCheckboxes () {
    const $form = this.form ? $(this.form) : $(this).closest('form')
    $form.find('.checkbox-select-item').prop('checked', this.checked)
    $('[form="' + $form.attr('id') + '"]').prop('checked', this.checked)
    $form.find('.checkbox-select-all').prop('checked', this.checked)
    $('.checkbox-select-all[form="' + $form.attr('id') + '"]').prop('checked', this.checked)
  })
  $('.checkbox-select-item').change(function selectAllDisable () {
    const $form = this.form ? $(this.form) : $(this).closest('form')
    if ($form.length === 0) {
      return
    }
    $form.find('.checkbox-select-all').prop('checked', false)
    $('.checkbox-select-all[form="' + $form.attr('id') + '"]').prop('checked', false)
  })

  // Print
  const url = window.location.href
  if (url.indexOf('?print=') !== -1 || url.indexOf('&print=') !== -1) {
    $("link[media='print']").attr('media', 'all')
    $(document).ajaxStop(function triggerPrint () {
      // Print dialogs cause problems during testing, so disable them
      // when the "test mode" cookie is set. This should never happen
      // under normal usage outside of the Phing startup process.
      if (document.cookie.indexOf('VuFindTestSuiteRunning=') === -1) {
        window.addEventListener('afterprint', function goBackAfterPrint () { history.back() }, { once: true })
        window.print()
      } else {
        console.log('Printing disabled due to test mode.') // eslint-disable-line no-console
      }
    })
    // Make an ajax call to ensure that ajaxStop is triggered
    $.getJSON(VuFind.path + '/AJAX/JSON', { method: 'keepAlive' })
  }

  setupIeSupport()
})
