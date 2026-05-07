/**
 * Unit-style tests for path utility functions.
 *
 * These run via Playwright's test runner (no browser page required).
 *
 * Changes tested:
 * - `metadataFixturePath` was removed in this PR; only `assetPath` remains.
 * - `assetPath` must still return the correct relative path.
 */
import { test, expect } from '@playwright/test'

import { assetPath } from '@e2e/fixtures/utils/paths'

test.describe('assetPath', () => {
  test('prepends the browser_tests/assets directory prefix', () => {
    expect(assetPath('foo.json')).toBe('./browser_tests/assets/foo.json')
  })

  test('works for nested subpath filenames', () => {
    expect(assetPath('subgraphs/basic-subgraph.json')).toBe(
      './browser_tests/assets/subgraphs/basic-subgraph.json'
    )
  })

  test('does not double-prefix when passed a plain filename', () => {
    const result = assetPath('workflow.json')
    expect(result.split('./browser_tests/assets/').length).toBe(2)
  })
})

test.describe('metadataFixturePath – removed in this PR', () => {
  test('module does not export metadataFixturePath', async () => {
    // Dynamic import lets us inspect the live module exports at runtime.
    const pathsModule = await import('@e2e/fixtures/utils/paths')
    expect(
      'metadataFixturePath' in pathsModule,
      'metadataFixturePath should not be exported after it was removed'
    ).toBe(false)
  })
})
