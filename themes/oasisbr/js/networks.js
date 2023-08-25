let networksList = null;

function obterRegiaoPorUF(uf) {
  const regioesPorUF = {
    AC: 'Norte',
    AL: 'Nordeste',
    AP: 'Norte',
    AM: 'Norte',
    BA: 'Nordeste',
    CE: 'Nordeste',
    DF: 'Centro-Oeste',
    ES: 'Sudeste',
    GO: 'Centro-Oeste',
    MA: 'Nordeste',
    MT: 'Centro-Oeste',
    MS: 'Centro-Oeste',
    MG: 'Sudeste',
    PA: 'Norte',
    PB: 'Nordeste',
    PR: 'Sul',
    PE: 'Nordeste',
    PI: 'Nordeste',
    RJ: 'Sudeste',
    RN: 'Nordeste',
    RS: 'Sul',
    RO: 'Norte',
    RR: 'Norte',
    SC: 'Sul',
    SP: 'Sudeste',
    SE: 'Nordeste',
    TO: 'Norte',
  };

  return regioesPorUF[uf] || 'Região não encontrada';
}

async function getAllNetworks() {
  try {
    showLoader();
    const response = await axios.get(`${REMOTE_API_URL}/networks`);
    hideLoader();
    const networks = response.data;
    return networks;
  } catch (errors) {
    hideLoader();
    showMessageError('#networks-page');
    console.error(errors);
  }
}

function fillDatanetworks(networks) {
  // remover referência para o array original, tem alterações aqui que só faz
  // sentido para este item
  networks = JSON.parse(JSON.stringify(networks));
  networks.forEach((item) => {
    item.link = `datasource?name=${item.name}`;
  });
  const options = {
    valueNames: [
      'name',
      'institution',
      'validSize',
      { data: ['id'] },
      { attr: 'href', name: 'link' },
    ],

    // Since there are no elements in the list, this will be used as template.
    item: `<li class="network-item">
      <h3><a href="" class="link name"></a></h3>
      <p><b>${getTranslatedText(
        'Instituição responsável'
      )}</b>: <span class="institution"></span></p>
      <p><b>${getTranslatedText(
        'Número de documentos coletados'
      )}</b>: <span class="validSize"></span></p>
      </li>`,
    page: 10,
    pagination: [
      {
        outerWindow: 2,
      },
    ],
  };

  networksList = new List('networks', options, networks);
}

function sortDatanetworks() {
  const sortSelectElement = document.querySelector('#sort-select');
  let sortOrder = 'asc';
  sortSelectElement.addEventListener('change', (e) => {
    if (sortOrder != sortSelectElement.value) {
      networksList.sort('name', { order: sortSelectElement.value });
      sortOrder = sortSelectElement.value;
    }
  });
}

function watchingUpdateOnList() {
  const list = document.querySelector('.list');
  networksList.on('updated', (element) => {
    list.style.counterReset = `item ${element.i - 1}`;
  });
}

async function getIndicatorsByDocumentType() {
  try {
    showLoader();
    const response = await axios.get(
      `${REMOTE_API_URL}/indicators?type=sourceType`
    );
    hideLoader();
    const indicators = response.data;
    return indicators;
  } catch (errors) {
    hideLoader();
    console.error(errors);
  }
}

function getAllInstitutions(networks) {
  const institutions = networks.map((network) => network.institution);
  const counts = {};
  institutions.forEach((x) => {
    counts[x] = (counts[x] || 0) + 1;
  });
  const institutionsIndicators = [];
  for (item in counts) {
    institutionsIndicators.push({ name: item, value: counts[item] });
  }
  institutionsIndicators.sort((a, b) => b.value - a.value);
  return institutionsIndicators;
}

function getAllUfs(networks) {
  const ufs = networks.map((network) => network.uf);
  const counts = {};
  ufs.forEach((x) => {
    counts[x] = (counts[x] || 0) + 1;
  });
  const ufsIndicators = [];
  for (item in counts) {
    ufsIndicators.push({ name: item || 'Indefinido', value: counts[item] });
  }
  ufsIndicators.sort((a, b) => b.value - a.value);
  return ufsIndicators;
}

function getAllRegions(networks) {
  const regions = networks.map((network) => obterRegiaoPorUF(network.uf));
  const counts = {};
  regions.forEach((x) => {
    counts[x] = (counts[x] || 0) + 1;
  });
  const regionsIndicators = [];
  for (item in counts) {
    regionsIndicators.push({ name: item || 'Indefinido', value: counts[item] });
  }
  regionsIndicators.sort((a, b) => b.value - a.value);
  return regionsIndicators;
}

function fillIndicatorsByDocumentInstitution(indicators) {
  const sidebarElement = document.querySelector('#side-collapse-institution');
  indicators.sort((a, b) => b.value - a.value);
  indicators.forEach((indicator) => {
    const item = `<a onclick="filterNetworks('${
      indicator.name
    }', 'institution')"  class="facet js-facet-item facetAND">
    <span class="text">
      <span class="facet-value">${getTranslatedText(indicator.name)}</span>
    </span>
    <span class="badge"> ${formatNumber(indicator.value)} </span>
  </a>`;
    sidebarElement.innerHTML = sidebarElement.innerHTML + item;
  });
}

function fillIndicatorsByUf(indicators) {
  const sidebarElement = document.querySelector('#side-collapse-uf');
  indicators.sort((a, b) => b.value - a.value);
  indicators.forEach((indicator) => {
    const item = `<a onclick="filterNetworks('${
      indicator.name
    }', 'uf')"  class="facet js-facet-item facetAND">
    <span class="text">
      <span class="facet-value">${getTranslatedText(indicator.name)}</span>
    </span>
    <span class="badge"> ${formatNumber(indicator.value)} </span>
  </a>`;
    sidebarElement.innerHTML = sidebarElement.innerHTML + item;
  });
}

function fillIndicatorsByRegion(indicators) {
  const sidebarElement = document.querySelector('#side-collapse-region');
  indicators.sort((a, b) => b.value - a.value);
  indicators.forEach((indicator) => {
    const item = `<a onclick="filterNetworks('${
      indicator.name
    }', 'region')"  class="facet js-facet-item facetAND">
    <span class="text">
      <span class="facet-value">${getTranslatedText(indicator.name)}</span>
    </span>
    <span class="badge"> ${formatNumber(indicator.value)} </span>
  </a>`;
    sidebarElement.innerHTML = sidebarElement.innerHTML + item;
  });
}

function fillIndicatorsByDocumentType(indicators) {
  const sidebarElement = document.querySelector('#side-collapse-format');
  indicators.sort((a, b) => b.value - a.value);
  indicators.forEach((indicator) => {
    const item = `<a onclick="filterNetworks('${indicator.name}', 'format')"  
    class="facet js-facet-item facetAND">
    <span class="text">
      <span class="facet-value">${getTranslatedText(indicator.name)}</span>
    </span>
    <span class="badge"> ${formatNumber(indicator.value)} </span>
  </a>`;
    sidebarElement.innerHTML = sidebarElement.innerHTML + item;
  });
}

function filterNetworks(filter, filterType) {
  if (filter) {
    let foud = 0;
    if (filterType == 'format') {
      networksList.filter((item) => {
        if (item.values().sourceType === filter) {
          foud += 1;
          return true;
        } else {
          return false;
        }
      });
    } else if (filterType == 'institution') {
      networksList.filter((item) => {
        if (item.values().institution === filter) {
          foud += 1;
          return true;
        } else {
          return false;
        }
      });
    } else if (filterType == 'uf') {
      networksList.filter((item) => {
        if (item.values().uf === filter) {
          foud += 1;
          return true;
        } else {
          return false;
        }
      });
    } else if (filterType == 'region') {
      networksList.filter((item) => {
        if (obterRegiaoPorUF(item.values().uf) === filter) {
          foud += 1;
          return true;
        } else {
          return false;
        }
      });
    }
    showTotalFind(foud);
  } else {
    showTotalFind(networksList.size());
    networksList.filter();
  }
}

function exportsCSV(networks) {
  const btnExport = document.querySelector('.btn-export-csv');
  btnExport.addEventListener('click', () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    const jsonObject = networksList.filtered
      ? JSON.stringify(networksList.matchingItems.map((i) => i._values))
      : networks;

    // Convert JSON to CSV & Display CSV
    csvContent = csvContent + ConvertToCSV(jsonObject);
    const encodedUri = encodeURI(csvContent);
    window.open(encodedUri);
  });
}

function showTotalFind(total) {
  const totalLabel = document.querySelector('.networks-label');
  totalLabel.innerHTML = `${getTranslatedText('Retornaram')} ${formatNumber(
    total
  )} ${getTranslatedText('fontes')}`;
}

function showTotal(total) {
  const badgesTotal = document.querySelectorAll('.badge-total');
  badgesTotal.forEach(
    (badgeTotal) => (badgeTotal.innerHTML = formatNumber(total))
  );
  showTotalFind(total);
}

function ConvertToCSV(objArray) {
  const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
  let csv = 'Nome,Instituição,Tipo de fonte,URL,Email,ISSN,Quantidade de itens';
  csv += '\r\n';
  array.forEach((item) => {
    let line =
      `"${item.name}"` +
      ',' +
      `"${item.institution}"` +
      ',' +
      item.sourceType +
      ',' +
      item.sourceUrl +
      ',' +
      `"${item.email}"` +
      ',' +
      item.issn +
      ',' +
      item.validSize;
    line = line.replaceAll('#', '%23');
    csv += line + '\r\n';
  });
  return csv;
}

function listenerListAllNetworks() {
  const listAll = document.querySelector('#list-all');
  listAll.addEventListener('click', () => {
    filterNetworks();
  });
}

function activeSelectedItem() {
  const itens = document.querySelectorAll('.js-facet-item');
  itens.forEach((item) => {
    item.addEventListener('click', () => {
      itens.forEach((item) => {
        item.classList.remove('active');
      });
      item.classList.add('active');
    });
  });
}

function collapseFilter() {
  const btnTitles = document.querySelectorAll('.title');
  btnTitles.forEach((btnTitle) => {
    btnTitle.addEventListener('click', () => {
      btnTitle.classList.toggle('collapsed');
      btnTitle['area-expanded'] = !btnTitle['area-expanded'];
      btnTitle.nextElementSibling.classList.toggle('in');
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const allNetworks = await getAllNetworks();
  const indicators = await getIndicatorsByDocumentType();
  fillIndicatorsByDocumentType(indicators);
  fillIndicatorsByDocumentInstitution(getAllInstitutions(allNetworks));
  fillIndicatorsByUf(getAllUfs(allNetworks));
  fillIndicatorsByRegion(getAllRegions(allNetworks));
  showTotal(allNetworks.length);
  fillDatanetworks(allNetworks);
  sortDatanetworks();
  watchingUpdateOnList();
  listenerListAllNetworks();
  exportsCSV(allNetworks);
  activeSelectedItem();
  collapseFilter();
});
