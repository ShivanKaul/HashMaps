// HashMaps background service worker (Manifest V3).
// Listens on the omnibox '#' keyword and navigates the active tab to Google
// Maps, either as a single search or as directions between two places.

import { parseInput } from './parse.js';

const IPINFO_URL = 'https://ipinfo.io/json';
const UNINSTALL_FORM = 'https://docs.google.com/forms/d/e/1FAIpQLSd_Oe7gnVbaKACY1ErzWh8DiEf8FqOvEWsZC_VckcXm-TSODg/viewform';

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
      country = (data.country || '').toLowerCase();
    }
  } catch (err) {
    console.log(`Error while trying to get country dynamically: ${err}`);
  }
  return country;
};

/** Loads the user's saved home and work addresses from storage. */
const getOptions = async () => {
  const items = await chrome.storage.sync.get({ homeAddress: '', workAddress: '' });
  return { home: items.homeAddress, work: items.workAddress };
};

/**
 * Navigates to Google Maps with a single search term (one place) or to
 * directions (two places). Invoked by the omnibox on input entered.
 */
const navigate = async (inputString) => {
  const countryCode = await getCountry();
  const countryTLD = countryCode ? `.${countryCode}` : '.com';
  const base = `https://www.google${countryTLD}/maps`;

  // Empty query: open the Google Maps search landing page in a new tab.
  if (inputString === '') {
    chrome.tabs.create({ url: `${base}/search/`, active: true });
    return;
  }

  const { home, work } = await getOptions();
  const [origin, dest] = parseInput(inputString, home, work);

  // One place => search; two places => directions between them.
  const url = dest === ''
    ? `${base}/search/${origin}`
    : `${base}/dir/${origin}/${dest}`;
  chrome.tabs.update({ url });
};

chrome.omnibox.setDefaultSuggestion({ description: 'Get directions for %s' });
chrome.omnibox.onInputEntered.addListener(navigate);

// Prompt for feedback when the user uninstalls.
if (chrome.runtime.setUninstallURL) {
  chrome.runtime.setUninstallURL(UNINSTALL_FORM);
}
