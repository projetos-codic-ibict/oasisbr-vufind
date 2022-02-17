/* global VuFind */
/* exported cartFormHandler */

VuFind.register('cart', function Cart () {
  const _COOKIE = 'vufind_cart'
  const _COOKIE_SOURCES = 'vufind_cart_src'
  const _COOKIE_DELIM = '\t'
  let _COOKIE_DOMAIN = false
  let _COOKIE_PATH = '/'
  let _COOKIE_SAMESITE = 'Lax'

  function setDomain (domain) {
    _COOKIE_DOMAIN = domain
  }

  function setCookiePath (path) {
    _COOKIE_PATH = path
  }

  function setCookieSameSite (sameSite) {
    _COOKIE_SAMESITE = sameSite
  }

  function _getCookieParams () {
    return { path: _COOKIE_PATH, domain: _COOKIE_DOMAIN, SameSite: _COOKIE_SAMESITE }
  }

  function _uniqueArray (op) {
    const ret = []
    for (let i = 0; i < op.length; i++) {
      if (ret.indexOf(op[i]) < 0) {
        ret.push(op[i])
      }
    }
    return ret
  }

  function _getItems () {
    const items = window.Cookies.get(_COOKIE)
    if (items) {
      return items.split(_COOKIE_DELIM)
    }
    return []
  }
  function _getSources () {
    const items = window.Cookies.get(_COOKIE_SOURCES)
    if (items) {
      return items.split(_COOKIE_DELIM)
    }
    return []
  }
  function getFullItems () {
    const items = _getItems()
    const sources = _getSources()
    const full = []
    if (items.length === 0) {
      return []
    }
    for (let i = items.length; i--;) {
      full[full.length] = sources[items[i].charCodeAt(0) - 65] + '|' + items[i].substr(1)
    }
    return full
  }

  function hasItem (id, _source) {
    const source = _source || VuFind.defaultSearchBackend
    return _getItems().indexOf(String.fromCharCode(65 + _getSources().indexOf(source)) + id) > -1
  }

  function _refreshToggles () {
    const $toggleBtns = $('.btn-bookbag-toggle')
    if ($toggleBtns.length > 0) {
      $toggleBtns.each(function cartIdEach () {
        const $this = $(this)
        $this.find('.cart-add,.cart-remove').addClass('hidden')
        if (hasItem($this.data('cart-id'), $this.data('cart-source'))) {
          $this.find('.cart-remove').removeClass('hidden')
        } else {
          $this.find('.cart-add').removeClass('hidden')
        }
      })
    }
  }

  function updateCount () {
    const items = VuFind.cart.getFullItems()
    $('#cartItems strong').html(items.length)
    if (items.length === parseInt(VuFind.translate('bookbagMax'), 10)) {
      $('#cartItems .full').removeClass('hidden')
    } else {
      $('#cartItems .full').addClass('hidden')
    }
    _refreshToggles()
  }

  function addItem (id, _source) {
    const source = _source || VuFind.defaultSearchBackend
    const cartItems = _getItems()
    const cartSources = _getSources()
    if (cartItems.length >= parseInt(VuFind.translate('bookbagMax'), 10)) {
      return false
    }
    const sIndex = cartSources.indexOf(source)
    if (sIndex < 0) {
      // Add source to source cookie
      cartItems[cartItems.length] = String.fromCharCode(65 + cartSources.length) + id
      cartSources[cartSources.length] = source
      window.Cookies.set(_COOKIE_SOURCES, cartSources.join(_COOKIE_DELIM), _getCookieParams())
    } else {
      cartItems[cartItems.length] = String.fromCharCode(65 + sIndex) + id
    }
    window.Cookies.set(_COOKIE, _uniqueArray(cartItems).join(_COOKIE_DELIM), _getCookieParams())
    updateCount()
    return true
  }
  function removeItem (id, source) {
    const cartItems = _getItems()
    const cartSources = _getSources()
    // Find
    const cartIndex = cartItems.indexOf(String.fromCharCode(65 + cartSources.indexOf(source)) + id)
    if (cartIndex > -1) {
      const sourceIndex = cartItems[cartIndex].charCodeAt(0) - 65
      let saveSource = false
      for (let i = cartItems.length; i--;) {
        if (i === cartIndex) {
          continue
        }
        // If this source is shared by another, keep it
        if (cartItems[i].charCodeAt(0) - 65 === sourceIndex) {
          saveSource = true
          break
        }
      }
      cartItems.splice(cartIndex, 1)
      // Remove unused sources
      if (!saveSource) {
        const oldSources = cartSources.slice(0)
        cartSources.splice(sourceIndex, 1)
        // Adjust source index characters
        for (let j = cartItems.length; j--;) {
          const si = cartItems[j].charCodeAt(0) - 65
          const ni = cartSources.indexOf(oldSources[si])
          cartItems[j] = String.fromCharCode(65 + ni) + cartItems[j].substring(1)
        }
      }
      if (cartItems.length > 0) {
        window.Cookies.set(_COOKIE, _uniqueArray(cartItems).join(_COOKIE_DELIM), _getCookieParams())
        window.Cookies.set(_COOKIE_SOURCES, _uniqueArray(cartSources).join(_COOKIE_DELIM), _getCookieParams())
      } else {
        window.Cookies.remove(_COOKIE, _getCookieParams())
        window.Cookies.remove(_COOKIE_SOURCES, _getCookieParams())
      }
      updateCount()
      return true
    }
    return false
  }

  let _cartNotificationTimeout = false
  function _registerUpdate (_form) {
    const $form = typeof _form === 'undefined'
      ? $('form[name="bulkActionForm"]')
      : $(_form)
    $('#updateCart, #bottom_updateCart').unbind('click').click(function cartUpdate () {
      const elId = this.id
      const selected = []
      const addToSelected = function processCartFormValues () {
        if (selected.indexOf(this.value) === -1) {
          selected.push(this.value)
        }
      }
      const selectedInForm = $form.find('input[name="ids[]"]:checked')
      const selectedFormAttr = $('input[form="' + $form.attr('id') + '"][name="ids[]"]:checked')
      $(selectedInForm).each(addToSelected)
      $(selectedFormAttr).each(addToSelected)
      if (selected.length > 0) {
        let msg = ''
        const orig = getFullItems()
        $(selected).each(function cartCheckedItemsAdd () {
          const data = this.split('|')
          addItem(data[1], data[0])
        })
        const updated = getFullItems()
        const added = updated.length - orig.length
        const inCart = selected.length - added
        msg += VuFind.translate('itemsAddBag', { '%%count%%': added })
        if (updated.length >= parseInt(VuFind.translate('bookbagMax'), 10)) {
          msg += '<br/>' + VuFind.translate('bookbagFull')
        }
        if (inCart > 0 && orig.length > 0) {
          msg += '<br/>' + VuFind.translate('itemsInBag', { '%%count%%': inCart })
        }
        $('#' + elId).data('bs.popover').options.content = msg
        $('#cartItems strong').html(updated.length)
      } else {
        $('#' + elId).data('bs.popover').options.content = VuFind.translate('bulk_noitems_advice')
      }
      $('#' + elId).popover('show')
      if (_cartNotificationTimeout !== false) {
        clearTimeout(_cartNotificationTimeout)
      }
      _cartNotificationTimeout = setTimeout(function notificationHide () {
        $('#' + elId).popover('hide')
      }, 5000)
      return false
    })
  }

  function _registerToggles () {
    const $toggleBtns = $('.btn-bookbag-toggle')
    if ($toggleBtns.length > 0) {
      $toggleBtns.each(function cartIdEach () {
        const $this = $(this)
        const currentId = $this.data('cart-id')
        const currentSource = $this.data('cart-source')
        $this.find('.correct').removeClass('correct hidden')
        $this.find('.cart-add').click(function cartAddClick (e) {
          e.preventDefault()
          if (addItem(currentId, currentSource)) {
            $this.find('.cart-add').addClass('hidden')
            $this.find('.cart-remove').removeClass('hidden')
          } else {
            $this.popover({ content: VuFind.translate('bookbagFull') })
            setTimeout(function recordCartFullHide () {
              $this.popover('hide')
            }, 5000)
          }
        })
        $this.find('.cart-remove').click(function cartRemoveClick (e) {
          e.preventDefault()
          removeItem(currentId, currentSource)
          $this.find('.cart-add').removeClass('hidden')
          $this.find('.cart-remove').addClass('hidden')
        })
      })
    }
  }

  function init () {
    // Record buttons
    _registerToggles()
    // Search results
    _registerUpdate()
    $('#updateCart, #bottom_updateCart').popover({
      content: '',
      html: true,
      trigger: 'manual',
      placement: $(document.body).hasClass('rtl') ? 'left' : 'right'
    })
    updateCount()
  }

  // Reveal
  return {
    // Methods
    addItem: addItem,
    getFullItems: getFullItems,
    hasItem: hasItem,
    removeItem: removeItem,
    setCookiePath: setCookiePath,
    setCookieSameSite: setCookieSameSite,
    setDomain: setDomain,
    updateCount: updateCount,
    // Init
    init: init
  }
})

// Building an array and checking indexes prevents a race situation
// We want to prioritize empty over printing
function cartFormHandler (event, data) {
  const keys = []
  for (const i in data) {
    if (Object.prototype.hasOwnProperty.call(data, i)) {
      keys.push(data[i].name)
    }
  }
  if (keys.indexOf('ids[]') === -1) {
    return null
  }
  if (keys.indexOf('print') > -1) {
    return true
  }
}

document.addEventListener('VuFind.lightbox.closed', VuFind.cart.updateCount, false)
