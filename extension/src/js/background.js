// HashMaps background service worker (Manifest V3).
// Listens on the omnibox '#' keyword and navigates the active tab to Google
// Maps, either as a single search or as directions between two places.

import { parseInput } from './parse.js';

const IPINFO_URL = 'https://ipinfo.io/json';
const UNINSTALL_FORM =
  'https://docs.google.com/forms/d/e/1FAIpQLSd_Oe7gnVbaKACY1ErzWh8DiEf8FqOvEWsZC_VckcXm-TSODg/viewform';

// Cached country code (best effort; re-fetched if the worker restarts).
let country = '';

/**
 * Returns the user's lowercased country code, used for region biasing and
 * picking the right Google Maps ccTLD. Cached for the life of the worker.
 */
const getCountry = async () => {
  if (country) {
    return country;
  }
  try {
    const resp = await fetch(IPINFO_URL);
    if (resp.ok) {
      const data = await resp.json();
      // Only trust a well-formed ISO country code; it is spliced into the
      // Google Maps hostname unescaped, so reject anything else.
      const code = (data.country || '').toLowerCase();
      country = /^[a-z]{2}$/.test(code) ? code : '';
    }
  } catch (err) {
    console.log(`Error while trying to get country dynamically: ${err}`);
  }
  return country;
};

/** Loads the user's saved home and work addresses from storage. */
const getOptions = async () => {
  const items = await chrome.storage.sync.get({
    homeAddress: '',
    workAddress: '',
  });
  return { home: items.homeAddress, work: items.workAddress };
};

/** Builds the Google Maps base URL for the given (possibly empty) ccTLD code. */
const mapsBase = (countryCode) =>
  `https://www.google${countryCode ? `.${countryCode}` : '.com'}/maps`;

/**
 * Opens a URL honouring the omnibox disposition: reuse the current tab, or
 * open a new foreground/background tab as Chrome requests.
 */
const openUrl = (url, disposition) => {
  if (disposition === 'currentTab') {
    chrome.tabs.update({ url });
  } else {
    chrome.tabs.create({ url, active: disposition !== 'newBackgroundTab' });
  }
};

/**
 * Navigates to Google Maps with a single search term (one place) or to
 * directions (two places). Invoked by the omnibox on input entered.
 */
const navigate = async (inputString, disposition) => {
  // Empty query: open the Google Maps search landing page.
  if (inputString === '') {
    const countryCode = await getCountry();
    openUrl(`${mapsBase(countryCode)}/search/`, disposition);
    return;
  }

  // The country lookup (network) and the saved addresses (storage) are
  // independent, so fetch them concurrently.
  const [countryCode, { home, work }] = await Promise.all([
    getCountry(),
    getOptions(),
  ]);
  const base = mapsBase(countryCode);
  const [origin, dest] = parseInput(inputString, home, work);

  // One place => search; two places => directions between them.
  const url =
    dest === '' ? `${base}/search/${origin}` : `${base}/dir/${origin}/${dest}`;
  openUrl(url, disposition);
};

chrome.omnibox.setDefaultSuggestion({ description: 'Get directions for %s' });
chrome.omnibox.onInputEntered.addListener(navigate);

// Prompt for feedback when the user uninstalls.
if (chrome.runtime.setUninstallURL) {
  chrome.runtime.setUninstallURL(UNINSTALL_FORM);
}
