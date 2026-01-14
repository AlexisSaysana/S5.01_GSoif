import '@testing-library/jest-native/extend-expect';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const originalConsoleError = console.error;

jest.spyOn(console, 'error').mockImplementation((msg, ...args) => {
  if (typeof msg === 'string' && msg.includes('Encountered two children with the same key')) {
    return; // on ignore juste ce warning spécifique
  }
  originalConsoleError(msg, ...args); // on appelle l'original pour tout le reste
});
