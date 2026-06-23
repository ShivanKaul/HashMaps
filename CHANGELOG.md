### Changelog

#### 1.4.0
- Migrated to Manifest V3 (background service worker) so the extension runs on current Chrome and can be published again
- Fixed places containing 'to' (e.g. 'pai toronto') being misread as directions instead of a search
- Dropped the bundled jQuery and the broken Google Geocoding omnibox suggestions
- Switched all requests to HTTPS
- Dropped the third-party Google Fonts request on the Options page in favour of a system font
- Honour the omnibox disposition so Ctrl/Cmd+Enter opens results in a new tab
- Added ESLint, Prettier and a unit test suite for the query parser

#### 1.3.6/7
- Centered heading for Options
- Get ccTLD dynamically for region biasing and redirecting

#### 1.3.5
- Prettier Options menu
- Paying back technical debt: code cleanup
- New screenshots

#### 1.3.4
- Ability to store and use 'Home' and 'Work' addresses
- Reduced permissions needed