function formatNumber(value) {
  const number = Number(value);
  if (isNaN(number)) {
    return '';
  }
  const formatPtBr = new Intl.NumberFormat('pt-BR');
  return formatPtBr.format(number);
}
