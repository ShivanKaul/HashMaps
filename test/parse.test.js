import test from 'node:test';
import assert from 'node:assert/strict';

import { parseInput } from '../extension/src/js/parse.js';

test('a place name that merely contains "to" is one search, not directions', () => {
  // Regression for "pai toronto": the old " to" substring check matched the
  // "to" inside "toronto" and produced directions from "pai" to "onto".
  assert.deepEqual(parseInput('pai toronto', '', ''), ['pai%20toronto', '']);
});

test('other "to"-containing place names stay single searches', () => {
  assert.deepEqual(parseInput('shibuya tokyo', '', ''), ['shibuya%20tokyo', '']);
  assert.deepEqual(parseInput('toledo', '', ''), ['toledo', '']);
});

test('"X to Y" is parsed as directions', () => {
  assert.deepEqual(parseInput('montreal to toronto', '', ''), ['montreal', 'toronto']);
});

test('"to" as a standalone word still separates, even next to a "to" place', () => {
  assert.deepEqual(parseInput('go to toronto', '', ''), ['go', 'toronto']);
});

test('home/work keywords resolve to saved addresses', () => {
  assert.deepEqual(
    parseInput('home to work', '123 Main St', '456 King St'),
    ['123%20Main%20St', '456%20King%20St']
  );
});

test('both endpoints can be "to"-containing places', () => {
  assert.deepEqual(parseInput('tokyo to kyoto', '', ''), ['tokyo', 'kyoto']);
});

test('the destination keyword resolves to a saved address', () => {
  assert.deepEqual(
    parseInput('office to home', '123 Main St', ''),
    ['office', '123%20Main%20St']
  );
});

test('a keyword with no saved address falls back to a literal search', () => {
  assert.deepEqual(parseInput('home', '', ''), ['home', '']);
});

test('the separator is case-insensitive', () => {
  assert.deepEqual(parseInput('Montreal TO Toronto', '', ''), ['montreal', 'toronto']);
});

test('extra whitespace around the separator and terms is tolerated', () => {
  assert.deepEqual(parseInput('  montreal   to   toronto  ', '', ''), ['montreal', 'toronto']);
});

test('only the first standalone "to" splits; the rest stays in the destination', () => {
  assert.deepEqual(parseInput('a to b to c', '', ''), ['a', 'b%20to%20c']);
});

test('a trailing "to " with no destination collapses to a single search', () => {
  assert.deepEqual(parseInput('montreal to ', '', ''), ['montreal', '']);
});

test('a trailing "to" with no surrounding space stays a literal search', () => {
  // Still being typed: no whitespace after "to", so it is not a separator yet.
  assert.deepEqual(parseInput('montreal to', '', ''), ['montreal%20to', '']);
});

test('an empty query yields empty origin and destination', () => {
  assert.deepEqual(parseInput('', '', ''), ['', '']);
});

test('special characters in addresses are URI-encoded', () => {
  assert.deepEqual(
    parseInput('home', '1 King St W, Toronto', ''),
    ['1%20King%20St%20W%2C%20Toronto', '']
  );
});
