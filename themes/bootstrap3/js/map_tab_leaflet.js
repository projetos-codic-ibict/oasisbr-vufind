/* global L, VuFind */
/* exported loadMapTab */
// Coordinate order:  Storage and Query: WENS ; Display: WSEN

function loadMapTab (mapData, mapGraticule, basemap) {
  const basemapLayer = new L.TileLayer(basemap[0], { attribution: basemap[1] })
  const geoFeatureGroup = L.featureGroup()
  // Define styles for icons
  const displayIcon = L.Icon.extend({
    options: {
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    }
  })
  const redIcon = new displayIcon({
    iconUrl: VuFind.path + '/themes/bootstrap3/css/vendor/leaflet/images/marker-icon-2x-red.png',
    shadowUrl: VuFind.path + '/themes/bootstrap3/css/vendor/leaflet/images/marker-shadow.png'
  })

  $('#map-canvas').show()
  const init = function drawMap () {
    const featureCount = mapData.length
    let label, label_name, label_coords, split_coords
    let i = 0
    // Construct geofeatures with labels
    for (i; i < featureCount; i++) {
      // Construct the label names
      label_name = mapData[i][4]
      // Construct the coordinate labels
      label_coords = mapData[i][5].split(/[ ]+/).join(', ')
      if (label_coords.split(',').length - 1 === 3) {
        split_coords = label_coords.match('(.*,.*),(.*,.*)')
        label_coords = split_coords[1] + '<br>' + split_coords[2]
      }
      // Construct the entire label string
      const labelParts = []
      if (label_name) {
        labelParts[labelParts.length] = '<strong>' + label_name + '</strong>'
      }
      if (label_coords) {
        labelParts[labelParts.length] = VuFind.translate('Coordinates') + ':<br>' +
          label_coords
      }
      label = labelParts.length > 0
        ? labelParts.join('<br>')
        : VuFind.translate('no_description')
      // Get coordinate data
      let west = mapData[i][0]
      const south = mapData[i][1]
      let east = mapData[i][2]
      const north = mapData[i][3]

      // Create features
      var geoFeature
      if (west === east && north === south) {
        geoFeature = L.marker([south, west], { icon: redIcon })
      } else { // It's a polygon feature //
        // Adjust rectangle display if it crosses the dateline
        if (west > east) {
          // Move west left of east
          if (east >= 0) {
            west = west - 360
          } else {
            // Move east right of west
            east = east + 360
          }
        }
        geoFeature = L.rectangle([[south, west], [north, east]], {
          color: '#910a0a',
          fillColor: '#f03',
          fillOcpacity: 0.3,
          weight: 2
        })
      }
      geoFeature.bindPopup(label)
      geoFeature.addTo(geoFeatureGroup)
    }
    // Get center of geoFeatures group
    const geoBounds = geoFeatureGroup.getBounds()
    const geoCenter = geoBounds.getCenter()

    // Draw map and add layers
    const mapTab = new L.Map('map-canvas', {
      layers: [basemapLayer, geoFeatureGroup],
      center: geoCenter
    })

    mapTab.fitBounds(geoBounds)

    // Reset zoom level if we have only a few features and high zoom level
    if (mapTab.getZoom() > 8 && featureCount < 3) {
      mapTab.setZoom(2)
    }

    // Create the graticule component
    if (mapGraticule) {
      L.latlngGraticule({
        showLabel: true,
        zoomInterval: [
          { start: 2, end: 3, interval: 30 },
          { start: 4, end: 4, interval: 10 },
          { start: 5, end: 7, interval: 5 },
          { start: 8, end: 10, interval: 1 }
        ]
      }).addTo(mapTab)
    }
  }
  init()
}
