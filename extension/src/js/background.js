// HashMaps background service worker (Manifest V3).
// Listens on the omnibox '#' keyword and navigates the active tab to Google
// Maps, either as a single search or as directions between two places.

import { parseInput } from './parse.js';

const UNINSTALL_FORM =
  'https://docs.google.com/forms/d/e/1FAIpQLSd_Oe7gnVbaKACY1ErzWh8DiEf8FqOvEWsZC_VckcXm-TSODg/viewform';

// Google Maps localizes results server-side by the user's IP and account, so a
// plain google.com base is enough; no third-party country lookup is needed.
const MAPS_BASE = 'https://www.google.com/maps';

/** Loads the user's saved home and work addresses from storage. */
const getOptions = async () => {
  const items = await chrome.storage.sync.get({
    homeAddress: '',
    workAddress: '',
  });
  return { home: items.homeAddress, work: items.workAddress };
};

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
    openUrl(`${MAPS_BASE}/search/`, disposition);
    return;
  }

  const { home, work } = await getOptions();
  const [origin, dest] = parseInput(inputString, home, work);

  // One place => search; two places => directions between them.
  const url =
    dest === ''
      ? `${MAPS_BASE}/search/${origin}`
      : `${MAPS_BASE}/dir/${origin}/${dest}`;
  openUrl(url, disposition);
};

chrome.omnibox.setDefaultSuggestion({ description: 'Get directions for %s' });
chrome.omnibox.onInputEntered.addListener(navigate);

// Prompt for feedback when the user uninstalls.
if (chrome.runtime.setUninstallURL) {
  chrome.runtime.setUninstallURL(UNINSTALL_FORM);
}
