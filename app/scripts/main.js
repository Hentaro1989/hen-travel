/*!
 *
 *  Web Starter Kit
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */
/* eslint-env browser */
(function() {
  'use strict';

  // Check to make sure service workers are supported in the current browser,
  // and that the current page is accessed from a secure origin. Using a
  // service worker from an insecure origin will trigger JS console errors. See
  // http://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features
  var isLocalhost = Boolean(window.location.hostname === 'localhost' ||
      // [::1] is the IPv6 localhost address.
      window.location.hostname === '[::1]' ||
      // 127.0.0.1/8 is considered localhost for IPv4.
      window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
      )
    );

  if ('serviceWorker' in navigator &&
      (window.location.protocol === 'https:' || isLocalhost)) {
    navigator.serviceWorker.register('service-worker.js')
    .then(function(registration) {
      // updatefound is fired if service-worker.js changes.
      registration.onupdatefound = function() {
        // updatefound is also fired the very first time the SW is installed,
        // and there's no need to prompt for a reload at that point.
        // So check here to see if the page is already controlled,
        // i.e. whether there's an existing service worker.
        if (navigator.serviceWorker.controller) {
          // The updatefound event implies that registration.installing is set:
          // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
          var installingWorker = registration.installing;

          installingWorker.onstatechange = function() {
            switch (installingWorker.state) {
              case 'installed':
                // At this point, the old content will have been purged and the
                // fresh content will have been added to the cache.
                // It's the perfect time to display a "New content is
                // available; please refresh." message in the page's interface.
                break;

              case 'redundant':
                throw new Error('The installing ' +
                                'service worker became redundant.');

              default:
                // Ignore
            }
          };
        }
      };
    }).catch(function(e) {
      console.error('Error during service worker registration:', e);
    });
  }

  // Your custom JavaScript goes here
  const queryString = require('query-string');
  const moment = require('moment');
  const MaterialDateTimePicker = require('material-datetime-picker/dist/material-datetime-picker.js');
  require('material-datetime-picker/dist/material-datetime-picker.css');
  const picker = new MaterialDateTimePicker({
    el: document.getElementById('dateTextBox'),
    format: 'YYYY/MM/DD',
    default: moment(),
    container: document.getElementById('search'),
    dateValidator: () => {}
  })
    .on('submit', val => console.log(`data: ${val}`))
    .on('open', () => document.getElementById('dateTextBoxFrame').classList.add('is-dirty'))
    .on('close', () => {
      if (!document.getElementById('dateTextBox').value) {
        document.getElementById('dateTextBoxFrame').classList.remove('is-dirty');
      }
    });

  document.getElementById('dateTextBox').addEventListener('click', () => picker.open());

  // Constants
  const API_KEY = '7ce4c7750105067b';
  const SCRIPT_CONTAINER = document.getElementById('scriptContainer');
  const AREA_SELECT_BOX = document.getElementById('areaSelectBox');
  const COUNTRY_SELECT_BOX = document.getElementById('countrySelectBox');
  const CITY_SELECT_BOX = document.getElementById('citySelectBox');
  const DATE_TEXT_BOX = document.getElementById('dateTextBox');
  const FREE_WORD_TEXT_BOX = document.getElementById('freeWordTextBox');
  const NUMERATOR = document.getElementById('numerator');
  const DENOMINATOR = document.getElementById('denominator');

  // Previous tours data
  let toursResult = {
    start: 0,
    returned: 0,
    available: 0
  };

  // This is a click event what change pages.
  const nav = document.getElementsByTagName('nav')[0];
  nav.addEventListener('click', event => {
    const sections = document.getElementsByTagName('section');
    for (let i = 0; i < sections.length; i++) {
      sections[i].classList.remove('is-active');
    }
    const menuName = event.target.textContent;
    const footer = document.getElementById('footer');
    if (menuName === 'tours') {
      footer.removeAttribute('hidden');
    } else {
      footer.setAttribute('hidden', 'hidden');
    }
    document.getElementById(menuName).classList.add('is-active');
    const drawer = document.getElementsByClassName('mdl-layout__drawer')[0];
    const obfuscator = document.getElementsByClassName('mdl-layout__obfuscator')[0];
    drawer.classList.remove('is-visible');
    obfuscator.classList.remove('is-visible');
  });

  // This is a click event what the refresh button.
  const refreshButton = document.getElementById('refresh-button');
  refreshButton.addEventListener('click', () => searchTours(Number(NUMERATOR.textContent)));

  window.onArea = jsonp => {
    const result = jsonp && jsonp.results;
    console.log(result);
    if (result && result.area) {
      removeChildren(AREA_SELECT_BOX);
      const firstOption = document.createElement('option');
      firstOption.textContent = 'エリア一覧';
      firstOption.value = null;
      AREA_SELECT_BOX.appendChild(firstOption);
      result.area.forEach(area => {
        const option = document.createElement('option');
        option.textContent = area.name;
        option.value = area.code;
        AREA_SELECT_BOX.appendChild(option);
      });
    }
    removeChildren(SCRIPT_CONTAINER);
  };

  AREA_SELECT_BOX.addEventListener('change', e => {
    const selectedOption = e.target.selectedOptions[0];
    if (selectedOption && selectedOption.value) {
      const script = document.createElement('script');
      const queryObject = {};
      queryObject.key = API_KEY;
      queryObject.area = selectedOption.value;
      queryObject.format = 'jsonp';
      queryObject.callback = 'onCountry';
      queryObject.count = 100;
      const urlQuery = queryString.stringify(queryObject);
      script.src = 'https://webservice.recruit.co.jp/ab-road/country/v1/?' + urlQuery;
      SCRIPT_CONTAINER.appendChild(script);
    }
  });

  window.onCountry = jsonp => {
    const result = jsonp && jsonp.results;
    console.log(result);
    if (result && result.country) {
      removeChildren(COUNTRY_SELECT_BOX);
      const firstOption = document.createElement('option');
      firstOption.textContent = '国一覧';
      firstOption.value = null;
      COUNTRY_SELECT_BOX.appendChild(firstOption);
      result.country.forEach(country => {
        const option = document.createElement('option');
        option.textContent = country.name;
        option.value = country.code;
        COUNTRY_SELECT_BOX.appendChild(option);
      });
    }
    removeChildren(SCRIPT_CONTAINER);
  };

  COUNTRY_SELECT_BOX.addEventListener('change', e => {
    const selectedOption = e.target.selectedOptions[0];
    if (selectedOption && selectedOption.value) {
      const script = document.createElement('script');
      const queryObject = {};
      queryObject.key = API_KEY;
      queryObject.country = selectedOption.value;
      queryObject.format = 'jsonp';
      queryObject.callback = 'onCity';
      queryObject.count = 100;
      const urlQuery = queryString.stringify(queryObject);
      script.src = 'https://webservice.recruit.co.jp/ab-road/city/v1/?' + urlQuery;
      SCRIPT_CONTAINER.appendChild(script);
    }
  });

  window.onCity = jsonp => {
    const result = jsonp && jsonp.results;
    console.log(result);
    if (result && result.city) {
      removeChildren(CITY_SELECT_BOX);
      const firstOption = document.createElement('option');
      firstOption.textContent = '都市一覧';
      firstOption.value = null;
      CITY_SELECT_BOX.appendChild(firstOption);
      result.city.forEach(city => {
        const option = document.createElement('option');
        option.textContent = city.name;
        option.value = city.code;
        CITY_SELECT_BOX.appendChild(option);
      });
    }
    removeChildren(SCRIPT_CONTAINER);
  };

  window.onTour = jsonp => {
    const results = jsonp && jsonp.results;
    console.log(results);
    if (results && results.tour) {
      toursResult.returned = Number(results.results_returned);
      toursResult.start = Number(results.results_start);
      toursResult.available = Number(results.results_available);
      DENOMINATOR.textContent = Math.ceil(toursResult.available / 10) || 0;
      NUMERATOR.textContent = Number(DENOMINATOR.textContent) - Math.ceil((toursResult.available - (toursResult.start + toursResult.returned - 1)) / 10) || 0;
      results.tour.forEach(tour => {
        const card = document.querySelector('#templateCard');
        const clone = document.importNode(card.content, true);
        clone.querySelector('.mdl-card').setAttribute('id', tour.id);
        clone.querySelector('.mdl-card__title').textContent = tour.title;
        clone.querySelector('.term').textContent = tour.term + '日間';
        clone.querySelector('.dept-city').textContent = tour.dept_city.name;
        clone.querySelector('.url').setAttribute('href', tour.urls.pc);
        clone.querySelector('.url').setAttribute('target', '_blank');
        const priceHtml = '<span style="color:red; font-size:20px;">' + tour.price.min + '</span> ~ <span style="color:red; font-size:20px;">' + tour.price.max + '</span>円';
        clone.querySelector('.price').innerHTML = priceHtml;
        document.querySelector('#tours .page-content').appendChild(clone);
      });
    } else {
      console.error('Result is not found.');
    }
    removeChildren(SCRIPT_CONTAINER);
  };

  document.getElementById('searchButton').addEventListener('click', () => {
    searchTours();
    document.getElementById('tourNav').click();
  });

  document.getElementById('previous').addEventListener('click', () => {
    if (NUMERATOR.textContent <= 1) {
      return;
    }
    searchTours(toursResult.start - 10);
  });
  document.getElementById('next').addEventListener('click', () => {
    if (Number(NUMERATOR.textContent) >= Number(DENOMINATOR.textContent)) {
      return;
    }
    searchTours(toursResult.start + 10);
  });

  /**
   * Remove all child elements.
   * @param {DOM} element an element
   */
  function removeChildren(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  /**
   * Search tours.
   * @param {Number} searchIndex Index of Tour
   */
  function searchTours(searchIndex) {
    const main = document.querySelector('#tours .page-content');
    removeChildren(main);
    const script = document.createElement('script');
    const queryObject = {};
    queryObject.area = getSelectedCode(AREA_SELECT_BOX);
    queryObject.country = getSelectedCode(COUNTRY_SELECT_BOX);
    queryObject.city = getSelectedCode(CITY_SELECT_BOX);
    queryObject.ymd = DATE_TEXT_BOX.value.replace(/\//g, '');
    queryObject.keyword = FREE_WORD_TEXT_BOX.value;
    queryObject.key = API_KEY;
    queryObject.format = 'jsonp';
    queryObject.callback = 'onTour';
    queryObject.count = 10;
    queryObject.start = searchIndex || 1;
    Object.keys(queryObject).forEach(key => {
      if (!queryObject[key]) {
        delete queryObject[key];
      }
    });
    const urlQuery = queryString.stringify(queryObject);
    script.src = 'https://webservice.recruit.co.jp/ab-road/tour/v1/?' + urlQuery;
    console.log(script.src);
    document.body.appendChild(script);
  }

  /**
   * Get a selected code from a selectbox.
   * @param {DOM} selectbox a selectbox
   * @return {String} a code of area, country and city
   */
  function getSelectedCode(selectbox) {
    let code = '';
    for (let i = 0; i < selectbox.children.length; i++) {
      const option = selectbox.children[i];
      if (option.selected && option.value !== 'null') {
        code = option.value;
      }
    }
    return code;
  }

  let firstOption = document.createElement('option');
  firstOption.textContent = '国一覧';
  firstOption.value = null;
  COUNTRY_SELECT_BOX.appendChild(firstOption);
  firstOption = document.createElement('option');
  firstOption.textContent = '都市一覧';
  firstOption.value = null;
  CITY_SELECT_BOX.appendChild(firstOption);

  const script = document.createElement('script');
  const queryObject = {};
  queryObject.key = API_KEY;
  queryObject.format = 'jsonp';
  queryObject.callback = 'onArea';
  queryObject.count = 20;
  const urlQuery = queryString.stringify(queryObject);
  script.src = 'https://webservice.recruit.co.jp/ab-road/area/v1/?' + urlQuery;
  SCRIPT_CONTAINER.appendChild(script);
})();
