import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Testing Library does not unmount between tests on its own outside of its own
// runner integration, and a leaked tree makes the next `getBy*` ambiguous.
afterEach(() => {
  cleanup();
});
