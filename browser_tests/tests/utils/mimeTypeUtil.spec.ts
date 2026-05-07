/**
 * Unit-style tests for getMimeType().
 *
 * These run via Playwright's test runner (no browser page required) so they
 * integrate with the existing `pnpm exec playwright test` invocation while
 * still exercising a pure utility function.
 */
import { test, expect } from '@playwright/test'

import { getMimeType } from '@e2e/fixtures/utils/mimeTypeUtil'

test.describe('getMimeType', () => {
  test.describe('supported image types', () => {
    test('returns image/png for .png', () => {
      expect(getMimeType('photo.png')).toBe('image/png')
    })

    test('returns image/jpeg for .jpg', () => {
      expect(getMimeType('photo.jpg')).toBe('image/jpeg')
    })

    test('returns image/jpeg for .jpeg', () => {
      expect(getMimeType('photo.jpeg')).toBe('image/jpeg')
    })

    test('returns image/webp for .webp', () => {
      expect(getMimeType('image.webp')).toBe('image/webp')
    })

    test('returns image/svg+xml for .svg', () => {
      expect(getMimeType('icon.svg')).toBe('image/svg+xml')
    })

    test('returns image/avif for .avif', () => {
      expect(getMimeType('image.avif')).toBe('image/avif')
    })
  })

  test.describe('supported video types', () => {
    test('returns video/webm for .webm', () => {
      expect(getMimeType('video.webm')).toBe('video/webm')
    })

    test('returns video/mp4 for .mp4', () => {
      expect(getMimeType('clip.mp4')).toBe('video/mp4')
    })
  })

  test.describe('supported data types', () => {
    test('returns application/json for .json', () => {
      expect(getMimeType('data.json')).toBe('application/json')
    })

    test('returns model/gltf-binary for .glb', () => {
      expect(getMimeType('model.glb')).toBe('model/gltf-binary')
    })
  })

  test.describe('audio types are no longer recognised (removed in PR)', () => {
    test('returns application/octet-stream for .mp3', () => {
      // audio/mpeg support was removed; callers should handle audio themselves
      expect(getMimeType('track.mp3')).toBe('application/octet-stream')
    })

    test('returns application/octet-stream for .flac', () => {
      // audio/flac support was removed
      expect(getMimeType('track.flac')).toBe('application/octet-stream')
    })

    test('returns application/octet-stream for .ogg', () => {
      // audio/ogg support was removed
      expect(getMimeType('track.ogg')).toBe('application/octet-stream')
    })

    test('returns application/octet-stream for .opus', () => {
      // audio/ogg (opus) support was removed
      expect(getMimeType('track.opus')).toBe('application/octet-stream')
    })
  })

  test.describe('default fallback', () => {
    test('returns application/octet-stream for unknown extensions', () => {
      expect(getMimeType('file.xyz')).toBe('application/octet-stream')
    })

    test('returns application/octet-stream for files with no extension', () => {
      expect(getMimeType('Makefile')).toBe('application/octet-stream')
    })
  })

  test.describe('case insensitivity', () => {
    test('normalises uppercase .PNG to image/png', () => {
      expect(getMimeType('PHOTO.PNG')).toBe('image/png')
    })

    test('normalises mixed-case .WebP to image/webp', () => {
      expect(getMimeType('image.WebP')).toBe('image/webp')
    })

    test('normalises .MP3 to application/octet-stream (audio removed)', () => {
      expect(getMimeType('TRACK.MP3')).toBe('application/octet-stream')
    })
  })

  test.describe('boundary and regression cases', () => {
    test('handles file name with multiple dots correctly', () => {
      // Uses the last extension segment
      expect(getMimeType('archive.tar.gz')).toBe('application/octet-stream')
      expect(getMimeType('photo.backup.png')).toBe('image/png')
    })

    test('handles path with directory separators', () => {
      expect(getMimeType('assets/images/photo.jpg')).toBe('image/jpeg')
    })
  })
})