// This file runs before any module loading happens in Jest.
// It provides polyfills needed by Expo 54's module system.

// Polyfill __ExpoImportMetaRegistry for Expo 54 compatibility
if (typeof globalThis.__ExpoImportMetaRegistry === 'undefined') {
  Object.defineProperty(globalThis, '__ExpoImportMetaRegistry', {
    value: new Proxy({}, {
      get() {
        return {};
      },
    }),
    writable: true,
    configurable: true,
  });
}
