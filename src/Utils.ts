export const overlayPortalContainerId = 'overlayPortalContainerId';

// Utility function to pull out a property (curried):
export function getProperty<T, K extends keyof T>(key: K) {
  return (obj: T): T[K] => obj[key];
}
