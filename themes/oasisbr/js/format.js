function formatNumber (value) {
  const formatPtBr = new Intl.NumberFormat('pt-BR', { maximumSignificantDigits: 3 })
  return formatPtBr.format(value)
}
