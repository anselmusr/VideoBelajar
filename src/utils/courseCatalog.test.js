import { describe, expect, it } from 'vitest'
import {
  courseAvatarOptions,
  courseCatalog,
  courseImageOptions,
  resolveCourseAssets,
} from './courseCatalog.js'

describe('courseCatalog', () => {
  it('memiliki 9 kursus dengan imageId dan avatarId 1-9', () => {
    expect(courseCatalog).toHaveLength(9)
    courseCatalog.forEach((course, index) => {
      expect(course.imageId).toBe(index + 1)
      expect(course.avatarId).toBe(index + 1)
    })
  })

  it('tidak menyimpan URL aset pada data yang dipersist', () => {
    courseCatalog.forEach((course) => {
      expect(course.imageUrl).toBeUndefined()
      expect(course.avatarUrl).toBeUndefined()
    })
  })
})

describe('resolveCourseAssets', () => {
  it('menghasilkan imageUrl dan avatarUrl string dari imageId/avatarId', () => {
    const resolved = resolveCourseAssets(courseCatalog[2])
    expect(typeof resolved.imageUrl).toBe('string')
    expect(resolved.imageUrl.length).toBeGreaterThan(0)
    expect(typeof resolved.avatarUrl).toBe('string')
    expect(resolved.avatarUrl.length).toBeGreaterThan(0)
  })

  it('fallback ke aset pertama saat id di luar rentang atau tidak ada', () => {
    const first = resolveCourseAssets({ imageId: 1, avatarId: 1 })
    const outOfRange = resolveCourseAssets({ imageId: 999, avatarId: -5 })
    const missing = resolveCourseAssets({})
    expect(outOfRange.imageUrl).toBe(first.imageUrl)
    expect(outOfRange.avatarUrl).toBe(first.avatarUrl)
    expect(missing.imageUrl).toBe(first.imageUrl)
    expect(missing.avatarUrl).toBe(first.avatarUrl)
  })
})

describe('picker options', () => {
  it('menyediakan 9 opsi gambar dan 9 opsi avatar', () => {
    expect(courseImageOptions).toHaveLength(9)
    expect(courseAvatarOptions).toHaveLength(9)
    expect(courseImageOptions[0]).toEqual({ id: 1, src: expect.any(String) })
    expect(courseAvatarOptions[8]).toEqual({ id: 9, src: expect.any(String) })
  })
})
