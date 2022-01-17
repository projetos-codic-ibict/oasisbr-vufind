

async function getANetworkByName(networkName) {
  try {
    const response = await axios.get(`${REMOTE_API_URL}/networks/${networkName}`)
    const network = response.data
    return network
  } catch (errors) {
    console.error(errors)
  }
}

function mountURL(link, network) {
  const currentFowardUrl = link.getAttribute('href')
  const fowardUrl = new URL(currentFowardUrl, window.location.href)
  fowardUrl.searchParams.append('name', network.name);
  fowardUrl.searchParams.append('sourceType', network.sourceType);
  fowardUrl.searchParams.append('institution', network.institution);
  fowardUrl.searchParams.append('sourceUrl', network.sourceUrl);
  fowardUrl.searchParams.append('validSize', network.validSize);
  fowardUrl.searchParams.append('issn', network.issn);
  link.setAttribute('href', `${fowardUrl.pathname}${fowardUrl.search}`)
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('working')
  const link = document.querySelector('[data-network-name]')
  const networkName = link.getAttribute('data-network-name');
  const network = await getANetworkByName(networkName)
  mountURL(link, network)
})
