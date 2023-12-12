let allNetworks = null;
let networksList = null;
let filters = new Map();

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
    const response = await axios.get(`${REMOTE_API_URL}/networks`);
    const networks = response.data;
    return networks;
  } catch (errors) {
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

function getIndicators(networks) {
  let sourceTypes = [];
  let institutions = [];
  let ufs = [];
  let regions = [];
  if (filters.size > 0) {
    const { sourceType, institution, uf, region } = getFiltersByType();
    networks.forEach((network) => {
      if (
        (sourceType ? network.sourceType === sourceType : true) &&
        (institution ? network.institution === institution : true) &&
        (uf ? network.uf === uf : true) &&
        (region ? obterRegiaoPorUF(network.uf) === region : true)
      ) {
        sourceTypes.push(network.sourceType);
        institutions.push(network.institution);
        ufs.push(network.uf);
        regions.push(obterRegiaoPorUF(network.uf));
      }
    });
  } else {
    sourceTypes = networks.map((network) => network.sourceType);
    institutions = networks.map((network) => network.institution);
    ufs = networks.map((network) => network.uf);
    regions = networks.map((network) => obterRegiaoPorUF(network.uf));
  }
  const sourceTypesIndicadors = getSourceTypesIndicators();
  const institutionsIndicadors = getInstitutionsIndicators();
  const ufsIndicadors = getUfsIndicators();
  const regionsIndicadors = getRegionsIndicators();

  return {
    sourceTypesIndicadors,
    institutionsIndicadors,
    ufsIndicadors,
    regionsIndicadors,
  };

  function getSourceTypesIndicators() {
    const sourceTypesCounts = {};
    sourceTypes.forEach((x) => {
      sourceTypesCounts[x] = (sourceTypesCounts[x] || 0) + 1;
    });
    const sourceTypesIndicadors = [];
    for (item in sourceTypesCounts) {
      sourceTypesIndicadors.push({
        name: item || getTranslatedText('Indefinido'),
        value: sourceTypesCounts[item],
      });
    }
    sourceTypesIndicadors.sort((a, b) => b.value - a.value);
    return sourceTypesIndicadors;
  }

  function getInstitutionsIndicators() {
    const institutionsCounts = {};
    institutions.forEach((x) => {
      institutionsCounts[x] = (institutionsCounts[x] || 0) + 1;
    });
    const institutionsIndicadors = [];
    for (item in institutionsCounts) {
      institutionsIndicadors.push({
        name: item || getTranslatedText('Indefinido'),
        value: institutionsCounts[item],
      });
    }
    institutionsIndicadors.sort((a, b) => b.value - a.value);
    return institutionsIndicadors;
  }

  function getUfsIndicators() {
    const ufsCounts = {};
    ufs.forEach((x) => {
      ufsCounts[x] = (ufsCounts[x] || 0) + 1;
    });
    const ufsIndicators = [];
    for (item in ufsCounts) {
      ufsIndicators.push({
        name: item || getTranslatedText('Indefinido'),
        value: ufsCounts[item],
      });
    }
    ufsIndicators.sort((a, b) => b.value - a.value);
    return ufsIndicators;
  }

  function getRegionsIndicators() {
    const regionsCounts = {};
    regions.forEach((x) => {
      regionsCounts[x] = (regionsCounts[x] || 0) + 1;
    });
    const regionsIndicators = [];
    for (item in regionsCounts) {
      regionsIndicators.push({
        name: item || getTranslatedText('Indefinido'),
        value: regionsCounts[item],
      });
    }
    regionsIndicators.sort((a, b) => b.value - a.value);
    return regionsIndicators;
  }
}

function fillIndicators(indicators, querySelector, indicatorType) {
  const sidebarElement = document.querySelector(querySelector);
  sidebarElement.innerHTML = sidebarElement.firstElementChild;

  indicators.sort((a, b) => b.value - a.value);
  indicators.forEach((indicator) => {
    const item = `<a onclick="filterNetworks('${
      indicator.name
    }', '${indicatorType}')" title="${getTranslatedText(
      'Select filter'
    )}"  class="facet js-facet-item facetAND">
    <span class="text">
      <span class="facet-value">${getTranslatedText(indicator.name)}</span>
    </span>
    <span class="badge"> ${formatNumber(indicator.value)} </span>
  </a>`;
    sidebarElement.innerHTML = sidebarElement.innerHTML + item;
  });
}

function filterNetworks(filter, filterType) {
  showLoader();
  if (filters.get(filterType) == filter) {
    filters.delete(filterType);
  } else {
    filters.set(filterType, filter);
  }
  let foud = 0;
  const { sourceType, institution, uf, region } = getFiltersByType();
  if (filters.size == 0) {
    foud = networksList.size();
    networksList.filter();
  } else {
    networksList.filter((item) => {
      if (
        (sourceType ? item.values().sourceType === sourceType : true) &&
        (institution ? item.values().institution === institution : true) &&
        (uf ? item.values().uf === uf : true) &&
        (region ? obterRegiaoPorUF(item.values().uf) === region : true)
      ) {
        foud += 1;
        return true;
      } else {
        return false;
      }
    });
  }
  // foi adiconado este timeout pq a função fillIndicatorsSidebar estava travando a exibição do loader.
  setTimeout(() => {
    fillIndicatorsSidebar(allNetworks);
    activeSelectedItem();
    showTotalFind(foud);
    hideLoader();
  }, 1);
}

function getFiltersByType() {
  const sourceType = filters.get('sourceType');
  const institution = filters.get('institution');
  const uf = filters.get('uf');
  const region = filters.get('region');
  return { sourceType, institution, uf, region };
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
    showLoader();
    filterNetworks();
  });
}

function activeSelectedItem() {
  const itens = document.querySelectorAll('.js-facet-item');
  itens.forEach((item) => {
    if (
      Array.from(filters.values()).includes(
        item.firstElementChild.firstElementChild.textContent
      )
    ) {
      item.classList.add('active');
      item.title = getTranslatedText('Remove filter');
    }
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

function fillIndicatorsSidebar(allNetworks) {
  const {
    sourceTypesIndicadors,
    institutionsIndicadors,
    ufsIndicadors,
    regionsIndicadors,
  } = getIndicators(allNetworks);
  fillIndicators(sourceTypesIndicadors, '#side-collapse-format', 'sourceType');
  fillIndicators(
    institutionsIndicadors,
    '#side-collapse-institution',
    'institution'
  );
  fillIndicators(ufsIndicadors, '#side-collapse-uf', 'uf');
  fillIndicators(regionsIndicadors, '#side-collapse-region', 'region');
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    showLoader();
    allNetworks = await getAllNetworks();
    // foi adiconado este timeout pq a função fillIndicatorsSidebar estava travando a exibição do loader.
    setTimeout(() => {
      fillIndicatorsSidebar(allNetworks);
      showTotal(allNetworks.length);
      fillDatanetworks(allNetworks);
      sortDatanetworks();
      watchingUpdateOnList();
      exportsCSV(allNetworks);
      collapseFilter();
      hideLoader();
    }, 1);
  } catch (error) {
    console.log(error);
    hideLoader();
  }
});
