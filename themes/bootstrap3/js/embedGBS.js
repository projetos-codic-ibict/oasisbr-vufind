/* global getBibKeyString, google */
$(document).ready(function activateGooglePreview () {
  const lang = document.documentElement.getAttribute('lang')
  google.books.load({ language: lang })
  function initialize () {
    const bibkeys = getBibKeyString().split(/\s+/)
    const viewer = new google.books.DefaultViewer(document.getElementById('gbsViewer'))
    viewer.load(bibkeys)
  }
  google.books.setOnLoadCallback(initialize)
})
