import { expect, test } from 'vitest'
import sum from '../sum';

test('adds 1 + 2 to equal 3', () => {
  // expect() and toBe() are functions from Jest
  expect(sum(1, 2)).toBe(30);
});

test('adds -5 + 10 to equal 5', () => {
    expect(sum(-5, 10)).toBe(5);
});