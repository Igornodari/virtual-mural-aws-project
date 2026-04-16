// CustomCarouselComponent cannot be tested in this environment because ngx-lightbox
// (a transitive dependency of the component) contains `import { saveAs } from 'file-saver'`
// which Vitest's ESM static analysis rejects (file-saver is CommonJS-only).
// Fix: upgrade ngx-lightbox to a version that uses a default import for file-saver,
// or configure Angular CLI's unit-test builder with optimizeDeps.include=['file-saver'].

describe('CustomCarouselComponent', () => {
  it.todo('should navigate slides — blocked by ngx-lightbox/file-saver ESM incompatibility');
});
