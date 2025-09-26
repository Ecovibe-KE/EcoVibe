import { describe, test, expect } from 'vitest';
import { validateEmail, validatePhone, validateName } from '../../src/utils/Validations';

describe('validateEmail', () => {
  test('returns "Email is required" when empty', () => {
    expect(validateEmail('')).toBe('Email is required');
    expect(validateEmail('   ')).toBe('Email is required');
  });

  test('returns error for invalid email formats', () => {
    expect(validateEmail('plainaddress')).toBe('Enter a valid email');
    expect(validateEmail('missing@domain')).toBe('Enter a valid email');
    expect(validateEmail('missing@.com')).toBe('Enter a valid email');
  });

  test('returns empty string for valid emails', () => {
    expect(validateEmail('test@example.com')).toBe('');
    expect(validateEmail('user.name+tag@domain.co')).toBe('');
  });
});

describe('validatePhone', () => {
  test('returns "Phone is required" when empty', () => {
    expect(validatePhone('')).toBe('Phone is required');
    expect(validatePhone('   ')).toBe('Phone is required');
  });

  test('returns error if phone number has too few or too many digits', () => {
    expect(validatePhone('12345')).toBe('Enter a valid phone'); // too short
    expect(validatePhone('1'.repeat(20))).toBe('Enter a valid phone'); // too long
  });

  test('returns empty string for valid phone numbers', () => {
    expect(validatePhone('1234567')).toBe(''); // minimum valid
    expect(validatePhone('123456789012345')).toBe(''); // maximum valid
    expect(validatePhone('(123) 456-7890')).toBe(''); // formatted
  });
});

describe('validateName', () => {
  test('returns "Name is required" when empty', () => {
    expect(validateName('')).toBe('Name is required');
    expect(validateName('   ')).toBe('Name is required');
  });

  test('returns error if name is too short', () => {
    expect(validateName('A')).toBe('Name is too short');
  });

  test('returns empty string for valid names', () => {
    expect(validateName('John')).toBe('');
    expect(validateName('Mary Jane')).toBe('');
  });
});
