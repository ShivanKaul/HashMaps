// Pure query-parsing helpers for the omnibox, kept free of any chrome.* APIs
// so they can be unit-tested in Node. Imported by the background service
// worker.

// Matches a standalone "to" used as a separator: whitespace on both sides.
// This is deliberately NOT a plain " to" substring match, which would fire
// inside words like "toronto" or "tokyo".
const TO_SEPARATOR = /\s+to\s+/i;

/**
 * Maps the 'home'/'work' keywords to the user's saved addresses, otherwise
 * URI-encodes the raw term.
 */
export const getCorrectSearchTerm = (rawTerm, home, work) => {
  const term = rawTerm.trim().toLowerCase();
  if (term === 'home' && home !== '') {
    return encodeURIComponent(home);
  } else if (term === 'work' && work !== '') {
    return encodeURIComponent(work);
  }
  return encodeURIComponent(term);
};

/**
 * Splits "<origin> to <dest>" into an encoded [origin, dest] pair. If there is
 * no standalone "to" separator, the whole string is a single search term and
 * dest is "".
 */
export const parseInput = (inputString, home, work) => {
  const match = TO_SEPARATOR.exec(inputString);
  if (match) {
    const origin = inputString.slice(0, match.index);
    const dest = inputString.slice(match.index + match[0].length);
    return [
      getCorrectSearchTerm(origin, home, work),
      getCorrectSearchTerm(dest, home, work),
    ];
  }
  return [getCorrectSearchTerm(inputString, home, work), ''];
};
