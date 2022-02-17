/* global L, VuFind */
/* exported loadMapSelection */
// Coordinate order:  Storage and Query: WENS ; Display: WSEN

function loadMapSelection (geoField, boundingBox, baseURL, homeURL, searchParams, resultsCoords, basemap) {
  // Initialize variables
  const searchboxLayer = L.featureGroup()
  const drawnItemsLayer = L.featureGroup()
  const mcgIDs = []
  let clickedIDs = []
  let clickedBounds = []
  let drawnItems
  const basemapLayer = new L.TileLayer(basemap[0], { attribution: basemap[1] })
  let mapSearch
  // Define styles for icons and clusters
  const searchIcon = L.Icon.extend({
    options: {
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    }
  })

  // Red will be used for search results display
  const redIcon = new searchIcon({
    iconUrl: VuFind.path + '/themes/bootstrap3/css/vendor/leaflet/images/marker-icon-2x-red.png',
    shadowUrl: VuFind.path + '/themes/bootstrap3/css/vendor/leaflet/images/marker-shadow.png'
  })

  const redRectIcon = new searchIcon({
    iconUrl: VuFind.path + '/themes/bootstrap3/css/vendor/leaflet/images/rectangle-icon-2x-red.png',
    shadowUrl: VuFind.path + '/themes/bootstrap3/css/vendor/leaflet/images/marker-shadow.png'
  })

  // Blue will be used when a user selects a geofeature
  const blueIcon = new searchIcon({
    iconUrl: VuFind.path + '/themes/bootstrap3/css/vendor/leaflet/images/marker-icon-2x-blue.png',
    shadowUrl: VuFind.path + '/themes/bootstrap3/css/vendor/leaflet/images/marker-shadow.png'
  })
  const blueRectIcon = new searchIcon({
    iconUrl: VuFind.path + '/themes/bootstrap3/css/vendor/leaflet/images/rectangle-icon-2x-blue.png',
    shadowUrl: VuFind.path + '/themes/bootstrap3/css/vendor/leaflet/images/marker-shadow.png'
  })

  // Initialize marker clusters with icon colors
  const markerClusters = new L.MarkerClusterGroup({
    iconCreateFunction: function icf (cluster) {
      const childCount = cluster.getChildCount()
      const markers = cluster.getAllChildMarkers()
      let cstatus = ''
      for (let i = 0; i < markers.length; i++) {
        cstatus = markers[i].options.recStatus
        i = i + markers[i].options.total
      }
      let c = ' marker-cluster-'
      if (cstatus === 'active') {
        c += 'active'
      } else {
        c += 'inactive'
      }
      return new L.DivIcon({ html: '<div><span><b>' + childCount + '</b></span></div>', className: 'marker-cluster' + c, iconSize: new L.Point(40, 40) })
    }
  })

  // Handle user interaction with markers and rectangles
  // ----------------------------------------------------//
  function onClick () {
    mapSearch.eachLayer(function msl (layer) {
      if (layer.options.id === 'mRect') {
        mapSearch.removeLayer(layer)
      }
    })

    // Reset previously selected features to inactive color - RED
    if (clickedIDs.length > 0) {
      markerClusters.eachLayer(function mcl (layer) {
        if (layer.options.recID === clickedIDs[0]) {
          layer.options.recStatus = 'inactive'
          layer._popup.setContent(layer.options.recPopup)
          if (layer.options.recType === 'rectangle') {
            layer.setIcon(redRectIcon)
          } else {
            layer.setIcon(redIcon)
          }
        }
      })
      clickedIDs = []
      clickedBounds = []
    }

    // Handle current feature selection
    // Change color of all features with thisID to BLUE
    let thisID = this.options.recID
    clickedIDs.push(thisID)
    let j = 0
    markerClusters.eachLayer(function mc (layer) {
      if (layer.options.recID === thisID) {
        j = j++
        layer.options.recStatus = 'active'
        if (layer.options.recType === 'rectangle') {
          layer.setIcon(blueRectIcon)
        } else {
          layer.setIcon(blueIcon)
        }
        clickedBounds.push([layer.getLatLng().lat, layer.getLatLng().lng])
        if (layer.options.recType === 'rectangle') {
          // create rectangle from options and show
          const mRect_sw = L.latLng([layer.options.recS, layer.options.recW])
          const mRect_ne = L.latLng([layer.options.recN, layer.options.recE])
          const mRect = L.rectangle([[mRect_sw, mRect_ne]], {
            color: '#3388ff',
            fillOcpacity: 0.1,
            weight: 2,
            id: 'mRect'
          })
          mRect.bindPopup(L.popup().setContent(layer.options.rmPopup))
          const mrBounds = mRect.getBounds()
          clickedBounds.push([
            [mrBounds.getSouthWest().lat, mrBounds.getSouthWest().lng],
            [mrBounds.getNorthEast().lat, mrBounds.getNorthEast().lng]
          ])
          mapSearch.addLayer(mRect)
        }
      }
    })
    markerClusters.refreshClusters()

    // Check if there are multiple markers at this location
    // If so, update popup to show title for all rectangles by
    // combining popup content.
    thisID = this.options.recID
    const thisLat = this.getLatLng().lat
    const thisLng = this.getLatLng().lng
    const updatePopup = [this._popup.getContent()]
    markerClusters.eachLayer(function mc (layer) {
      const mLat = layer.getLatLng().lat
      const mLng = layer.getLatLng().lng
      const mPopup = layer._popup.getContent()
      if ((mLat === thisLat && mLng === thisLng) && updatePopup.indexOf(mPopup) < 0) {
        updatePopup.push(mPopup)
      }
    })
    this._popup.setContent(updatePopup.join(' '))
  }

  // Searchbox
  // -------------------------------------//
  // Retrieve searchbox coordinates
  let sb_west = boundingBox[0]
  const sb_south = boundingBox[1]
  let sb_east = boundingBox[2]
  const sb_north = boundingBox[3]

  // Adjust searchbox to a 0-360 grid if it crosses the dateline
  if (sb_west > sb_east) {
    // Move west left of east
    if (sb_east >= 0) {
      sb_west = sb_west - 360
    } else {
      // Move east right of west
      sb_east = sb_east + 360
    }
  }
  const sb_sw = L.latLng([sb_south, sb_west])
  const sb_ne = L.latLng([sb_north, sb_east])

  // Create searchBox feature
  const searchboxFeature = L.rectangle([[sb_sw, sb_ne]], {
    color: 'red',
    fillColor: 'red',
    fillOcpacity: 0.4,
    weight: 2
  })

  const sb_bounds = searchboxFeature.getBounds()
  const sb_center = sb_bounds.getCenter()
  searchboxFeature.addTo(searchboxLayer)

  // Search results
  // -------------------------------------//
  // Create a new vector type for rectangle features
  // with getLatLng and setLatLng methods.
  L.RectangleClusterable = L.Rectangle.extend({
    _originalInitialize: L.Rectangle.prototype.initialize,
    initialize: function lrc (bounds, options) {
      this._originalInitialize(bounds, options)
      this._latlng = this.getBounds().getCenter()
    },
    getLatLng: function e () {
      return this._latlng
    },
    setLatLng: function e () {}
  })

  // Process result coordinates
  for (let i = 0; i < resultsCoords.length; ++i) {
    var rcType
    var rcFeature
    const rcStatus = 'inactive'
    const recID = resultsCoords[i][0]
    const recTitle = resultsCoords[i][1]
    const popupContent = '<article class="geoItem"><a href="' + homeURL + 'Record/' + recID + '">' + recTitle + '</a></article>'
    const popup = L.popup().setContent(popupContent)
    let rc_west = resultsCoords[i][2]
    let rc_east = resultsCoords[i][3]
    const rc_north = resultsCoords[i][4]
    const rc_south = resultsCoords[i][5]
    sb_west = searchboxFeature.getBounds().getWest()
    sb_east = searchboxFeature.getBounds().getEast()

    if (sb_west >= -180 && sb_east <= 180) {
      // do nothing
    } else {
      // move coordinates if they are outside of searchbox bounds
      if (rc_west < sb_west) {
        rc_west = rc_west + 360
        rc_east = rc_east + 360
      }
      if (rc_east > sb_east) {
        rc_west = rc_west - 360
        rc_east = rc_east - 360
      }
    }

    if (rc_west === rc_east && rc_north === rc_south) {
      rcType = 'point'
      rcFeature = L.marker([rc_south, rc_west], {
        recID: recID,
        recType: rcType,
        recStatus: rcStatus,
        recPopup: popupContent,
        icon: redIcon
      })
    } else {
      rcType = 'rectangle'
      rcFeature = new L.RectangleClusterable([
        [rc_south, rc_west],
        [rc_north, rc_east]
      ], { recID: recID, recType: rcType, recStatus: rcStatus, recPopup: popupContent, color: '#910a0a' })
    }
    rcFeature.bindPopup(popup)
    rcFeature.on('click', onClick)

    // Only add feature to markerClusters if it is within or intersects searchbox
    if (rcType === 'rectangle') {
      if (searchboxFeature.getBounds().intersects(rcFeature.getBounds())) {
        // add center point to layer
        const rectCtr = rcFeature.getBounds().getCenter()
        const rmPopupContent = '<article class="geoItem"><a href="' + homeURL +
          'Record/' + recID + '">' + recTitle + '</a><br><em>' +
          VuFind.translate('rectangle_center_message') + '</em></article>'
        const rmPopup = L.popup().setContent(rmPopupContent)
        const rectMarker = L.marker(rectCtr, {
          recID: recID,
          recType: 'rectangle',
          recStatus: rcStatus,
          recPopup: rmPopupContent,
          rmPopup: popupContent,
          recN: rc_north,
          recS: rc_south,
          recE: rc_east,
          recW: rc_west,
          icon: redRectIcon
        })
        rectMarker.bindPopup(rmPopup)
        rectMarker.on('click', onClick)
        markerClusters.addLayer(rectMarker)
        mcgIDs.push(recID)
      }
    } else if (searchboxFeature.getBounds().contains(rcFeature.getLatLng())) {
      markerClusters.addLayer(rcFeature)
      mcgIDs.push(recID)
    }
  }

  // Turn on map selection pane
  $('#geo_search').show()

  // Create map
  mapSearch = new L.Map('geo_search_map', {
    layers: [basemapLayer, searchboxLayer, markerClusters, drawnItemsLayer],
    center: sb_center
  })
  mapSearch.fitBounds(sb_bounds)

  // Add search functionality
  drawnItems = new L.Draw.Rectangle(mapSearch)

  mapSearch.on('draw:created', function ms (e) {
    const layer = e.layer
    drawnItemsLayer.addLayer(layer)

    // Get search box coordinates SW, NW, NE, SE
    // note the wrap() function creates 180 to -180 compliant longitude values.
    const di_ne = layer.getBounds().getNorthEast().wrap()
    const di_sw = layer.getBounds().getSouthWest().wrap()
    const di_north = di_ne.lat
    const di_east = di_ne.lng
    const di_south = di_sw.lat
    const di_west = di_sw.lng

    // Create search query
    const rawFilter = geoField + ':Intersects(ENVELOPE(' + di_west + ', ' + di_east + ', ' + di_north + ', ' + di_south + '))'
    location.href = baseURL + searchParams + '&filter[]=' + rawFilter
  }, this)

  document.getElementById('draw_box').onclick = function drawSearchBox () {
    drawnItemsLayer.clearLayers()
    new L.Draw.Rectangle(mapSearch, drawnItems.options.rectangle).enable()
  }

  // If user clicks on map anywhere turn all features to inactive color - RED
  // and reset clicked arrays
  mapSearch.on('click', function ms () {
    mapSearch.eachLayer(function msl (layer) {
      if (layer.options.id === 'mRect') {
        mapSearch.removeLayer(layer)
      }
    })

    if (clickedIDs.length > 0) {
      markerClusters.eachLayer(function mc (layer) {
        layer.options.recStatus = 'inactive'
        if (layer.options.recType === 'rectangle') {
          layer.setIcon(redRectIcon)
        } else {
          layer.setIcon(redIcon)
        }
      })
      clickedIDs = []
      clickedBounds = []
      markerClusters.refreshClusters()
    }
  })
}
