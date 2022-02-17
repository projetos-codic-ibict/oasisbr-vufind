/* global VuFind */
/* exported collapseTopFacets, initFacetTree */
function buildFacetNodes (data, currentPath, allowExclude, excludeTitle, counts) {
  const json = []

  $(data).each(function facetNodesEach () {
    let $html = $('<div/>').addClass('facet')
    const url = currentPath + this.href
    const $item = $('<span/>')
      .addClass('main text' + (this.isApplied ? ' applied' : ''))
      .attr('role', 'menuitem')
      .attr('title', this.displayText)

    const $i = $('<i/>').addClass('fa')
    if (this.operator === 'OR') {
      if (this.isApplied) {
        $i.addClass('fa-check-square-o').attr('title', VuFind.translate('Selected'))
      } else {
        $i.addClass('fa-square-o').attr('aria-hidden', 'true')
      }
      $i.appendTo($item)
      $item.append(' ')
    } else if (this.isApplied) {
      $i.addClass('fa-check pull-right').attr('title', VuFind.translate('Selected'))
      $i.appendTo($item)
      $item.append(' ')
    }
    const $description = $('<span/>')
      .addClass('facet-value')
      .append(this.displayText)
    $item.append($description)

    $item.appendTo($html)

    if (!this.isApplied && counts) {
      $('<span/>')
        .addClass('badge')
        .html(
          this.count.toString().replace(/\B(?=(\d{3})+\b)/g, VuFind.translate('number_thousands_separator'))
        )
        .appendTo($html)

      if (allowExclude) {
        const excludeUrl = currentPath + this.exclude
        const $a = $('<a/>')
          .addClass('exclude')
          .attr('href', excludeUrl)
          .attr('title', excludeTitle)
        $('<i/>').addClass('fa fa-times').appendTo($a)
        $a.appendTo($html)
      }
    }

    $html = $('<div/>').append($html)

    let children = null
    if (typeof this.children !== 'undefined' && this.children.length > 0) {
      children = buildFacetNodes(this.children, currentPath, allowExclude, excludeTitle, counts)
    }
    json.push({
      text: $html.html(),
      children: children,
      applied: this.isApplied,
      state: {
        opened: this.hasAppliedChildren
      },
      li_attr: this.isApplied ? { class: 'active' } : {},
      data: {
        url: url.replace(/&amp;/g, '&')
      }
    })
  })

  return json
}

function buildFacetTree (treeNode, facetData, inSidebar) {
  // Enable keyboard navigation also when a screen reader is active
  treeNode.bind('select_node.jstree', VuFind.sideFacets.showLoadingOverlay)

  const currentPath = treeNode.data('path')
  const allowExclude = treeNode.data('exclude')
  const excludeTitle = treeNode.data('exclude-title')

  const results = buildFacetNodes(facetData, currentPath, allowExclude, excludeTitle, inSidebar)
  treeNode.find('.fa-spinner').parent().remove()
  if (inSidebar) {
    treeNode.on('loaded.jstree open_node.jstree', function treeNodeOpen (/* e, data */) {
      treeNode.find('ul.jstree-container-ul > li.jstree-node').addClass('list-group-item')
      treeNode.find('a.exclude').click(VuFind.sideFacets.showLoadingOverlay)
    })
  }
  treeNode.jstree({
    core: {
      data: results
    }
  })
}

function initFacetTree (treeNode, inSidebar) {
  const loaded = treeNode.data('loaded')
  if (loaded) {
    return
  }
  treeNode.data('loaded', true)

  if (inSidebar) {
    treeNode.prepend('<li class="list-group-item"><i class="fa fa-spinner fa-spin" aria-hidden="true"></i></li>')
  } else {
    treeNode.prepend('<div><i class="fa fa-spinner fa-spin" aria-hidden="true"></i><div>')
  }
  const request = {
    method: 'getFacetData',
    source: treeNode.data('source'),
    facetName: treeNode.data('facet'),
    facetSort: treeNode.data('sort'),
    facetOperator: treeNode.data('operator'),
    query: treeNode.data('query'),
    querySuppressed: treeNode.data('querySuppressed'),
    extraFields: treeNode.data('extraFields')
  }
  $.getJSON(VuFind.path + '/AJAX/JSON?' + request.query,
    request,
    function getFacetData (response/*, textStatus */) {
      buildFacetTree(treeNode, response.data.facets, inSidebar)
    }
  )
}

function collapseTopFacets () {
  $('.top-facets').each(function setupToCollapses () {
    $(this).find('.collapse').removeClass('in')
    $(this).on('show.bs.collapse', function toggleTopFacet () {
      $(this).find('.top-title .fa').removeClass('fa-caret-right')
      $(this).find('.top-title .fa').addClass('fa-caret-down')
    })
    $(this).on('hide.bs.collapse', function toggleTopFacet () {
      $(this).find('.top-title .fa').removeClass('fa-caret-down')
      $(this).find('.top-title .fa').addClass('fa-caret-right')
    })
  })
}

/* --- Side Facets --- */
VuFind.register('sideFacets', function SideFacets () {
  function showLoadingOverlay (e, data) {
    e.preventDefault()
    const overlay = '<div class="facet-loading-overlay">' +
      '<span class="facet-loading-overlay-label">' + VuFind.translate('loading') +
      '...</span></div>'
    $(this).closest('.collapse').append(overlay)
    // This callback operates both as a click handler and a JSTree callback;
    // if the data element is undefined, we assume we are handling a click.
    const href = typeof data === 'undefined' || typeof data.node.data.url === 'undefined'
      ? $(this).attr('href')
      : data.node.data.url
    window.location.assign(href)
    return false
  }

  function activateFacetBlocking (context) {
    const finalContext = (typeof context === 'undefined') ? $(document.body) : context
    finalContext.find('a.facet:not(.narrow-toggle),.facet a').click(showLoadingOverlay)
  }

  function activateSingleAjaxFacetContainer () {
    const $container = $(this)
    const facetList = []
    const $facets = $container.find('div.collapse.in[data-facet], .checkbox-filter[data-facet]')
    $facets.each(function addFacet () {
      if (!$(this).data('loaded')) {
        facetList.push($(this).data('facet'))
      }
    })
    if (facetList.length === 0) {
      return
    }
    const request = {
      method: 'getSideFacets',
      searchClassId: $container.data('searchClassId'),
      location: $container.data('location'),
      configIndex: $container.data('configIndex'),
      query: $container.data('query'),
      querySuppressed: $container.data('querySuppressed'),
      extraFields: $container.data('extraFields'),
      enabledFacets: facetList
    }
    $container.find('.facet-load-indicator').removeClass('hidden')
    $.getJSON(VuFind.path + '/AJAX/JSON?' + request.query, request)
      .done(function onGetSideFacetsDone (response) {
        $.each(response.data.facets, function initFacet (facet, facetData) {
          const containerSelector = typeof facetData.checkboxCount !== 'undefined'
            ? '.checkbox-filter'
            : ':not(.checkbox-filter)'
          const $facetContainer = $container.find(containerSelector + '[data-facet="' + facet + '"]')
          $facetContainer.data('loaded', 'true')
          if (typeof facetData.checkboxCount !== 'undefined') {
            if (facetData.checkboxCount !== null) {
              $facetContainer.find('.avail-count').text(
                facetData.checkboxCount.toString().replace(/\B(?=(\d{3})+\b)/g, VuFind.translate('number_thousands_separator'))
              )
            }
          } else if (typeof facetData.html !== 'undefined') {
            $facetContainer.html(facetData.html)
            activateFacetBlocking($facetContainer)
          } else {
            const treeNode = $facetContainer.find('.jstree-facet')
            VuFind.emit('VuFind.sidefacets.treenodeloaded', { node: treeNode })

            buildFacetTree(treeNode, facetData.list, true)
          }
          $facetContainer.find('.facet-load-indicator').remove()
        })
        VuFind.lightbox.bind($('.sidebar'))
        VuFind.emit('VuFind.sidefacets.loaded')
      })
      .fail(function onGetSideFacetsFail () {
        $container.find('.facet-load-indicator').remove()
        $container.find('.facet-load-failed').removeClass('hidden')
      })
  }

  function loadAjaxSideFacets () {
    $('.side-facets-container-ajax').each(activateSingleAjaxFacetContainer)
  }

  function facetSessionStorage (e) {
    const source = $('#result0 .hiddenSource').val()
    const id = e.target.id
    const key = 'sidefacet-' + source + id
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, document.getElementById(id).className)
    } else {
      sessionStorage.removeItem(key)
    }
  }

  function init () {
    // Display "loading" message after user clicks facet:
    activateFacetBlocking()

    // Side facet status saving
    $('.facet-group .collapse').each(function openStoredFacets (index, item) {
      const source = $('#result0 .hiddenSource').val()
      const storedItem = sessionStorage.getItem('sidefacet-' + source + item.id)
      if (storedItem) {
        const saveTransition = $.support.transition
        try {
          $.support.transition = false
          if ((' ' + storedItem + ' ').indexOf(' in ') > -1) {
            $(item).collapse('show')
          } else if (!$(item).data('forceIn')) {
            $(item).collapse('hide')
          }
        } finally {
          $.support.transition = saveTransition
        }
      }
    })
    $('.facet-group').on('shown.bs.collapse', facetSessionStorage)
    $('.facet-group').on('hidden.bs.collapse', facetSessionStorage)

    // Side facets loaded with AJAX
    $('.side-facets-container-ajax')
      .find('div.collapse[data-facet]:not(.in)')
      .on('shown.bs.collapse', function expandFacet () {
        loadAjaxSideFacets()
      })
    loadAjaxSideFacets()

    // Keep filter dropdowns on screen
    $('.search-filter-dropdown').on('shown.bs.dropdown', function checkFilterDropdownWidth (e) {
      const $dropdown = $(e.target).find('.dropdown-menu')
      if ($(e.target).position().left + $dropdown.width() >= window.innerWidth) {
        $dropdown.addClass('dropdown-menu-right')
      } else {
        $dropdown.removeClass('dropdown-menu-right')
      }
    })
  }

  return { init: init, showLoadingOverlay: showLoadingOverlay }
})

/* --- Lightbox Facets --- */
VuFind.register('lightbox_facets', function LightboxFacets () {
  function lightboxFacetSorting () {
    const sortButtons = $('.js-facet-sort')
    function sortAjax (button) {
      const sort = $(button).data('sort')
      const list = $('#facet-list-' + sort)
      if (list.find('.js-facet-item').length === 0) {
        list.find('.js-facet-next-page').html(VuFind.translate('loading') + '...')
        $.ajax(button.href + '&layout=lightbox')
          .done(function facetSortTitleDone (data) {
            list.prepend($('<span>' + data + '</span>').find('.js-facet-item'))
            list.find('.js-facet-next-page').html(VuFind.translate('more') + ' ...')
          })
      }
      $('.full-facet-list').addClass('hidden')
      list.removeClass('hidden')
      sortButtons.removeClass('active')
    }
    sortButtons.click(function facetSortButton () {
      sortAjax(this)
      $(this).addClass('active')
      return false
    })
  }

  function setup () {
    lightboxFacetSorting()
    $('.js-facet-next-page').click(function facetLightboxMore () {
      const button = $(this)
      const page = parseInt(button.attr('data-page'), 10)
      if (button.attr('disabled')) {
        return false
      }
      button.attr('disabled', 1)
      button.html(VuFind.translate('loading') + '...')
      $.ajax(this.href + '&layout=lightbox')
        .done(function facetLightboxMoreDone (data) {
          const htmlDiv = $('<div>' + data + '</div>')
          const list = htmlDiv.find('.js-facet-item')
          button.before(list)
          if (list.length && htmlDiv.find('.js-facet-next-page').length) {
            button.attr('data-page', page + 1)
            button.attr('href', button.attr('href').replace(/facetpage=\d+/, 'facetpage=' + (page + 1)))
            button.html(VuFind.translate('more') + ' ...')
            button.removeAttr('disabled')
          } else {
            button.remove()
          }
        })
      return false
    })
    const margin = 230
    $('#modal').on('show.bs.modal', function facetListHeight () {
      $('#modal .lightbox-scroll').css('max-height', window.innerHeight - margin)
    })
    $(window).resize(function facetListResize () {
      $('#modal .lightbox-scroll').css('max-height', window.innerHeight - margin)
    })
  }

  return { setup: setup }
})

function registerMoreLessFacetsEventHandlers () {
  $('.more-facets, .less-facets').off('click')
  $('.more-facets').click(function moreFacets () {
    const id = 'narrowGroupHidden-' + $(this).data('title')
    $('.' + id).removeClass('hidden')
    $('#more-' + id).addClass('hidden')
    return false
  })

  $('.less-facets').click(function lessFacets () {
    const id = 'narrowGroupHidden-' + $(this).data('title')
    $('.' + id).addClass('hidden')
    $('#more-' + id).removeClass('hidden')
    return false
  })
}

VuFind.listen('VuFind.sidefacets.loaded', registerMoreLessFacetsEventHandlers)
