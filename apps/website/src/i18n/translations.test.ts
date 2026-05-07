import { describe, expect, it } from 'vitest'

import { hasKey, t, translationKeys } from './translations'

describe('translations – pricing plan feature key removals', () => {
  describe('pricing.plan.creator.feature2 – removed (was: "3 concurrent API jobs")', () => {
    it('is not present in the translations object', () => {
      expect(hasKey('pricing.plan.creator.feature2')).toBe(false)
    })

    it('is not present in the exported translationKeys array', () => {
      expect(translationKeys).not.toContain('pricing.plan.creator.feature2')
    })
  })

  describe('pricing.plan.pro.feature2 – removed (was: "5 concurrent API jobs")', () => {
    it('is not present in the translations object', () => {
      expect(hasKey('pricing.plan.pro.feature2')).toBe(false)
    })

    it('is not present in the exported translationKeys array', () => {
      expect(translationKeys).not.toContain('pricing.plan.pro.feature2')
    })
  })

  describe('remaining feature keys still resolve correctly', () => {
    it('pricing.plan.creator.feature1 returns correct English text', () => {
      expect(t('pricing.plan.creator.feature1')).toBe('Import your own LoRAs')
    })

    it('pricing.plan.creator.feature1 returns correct zh-CN text', () => {
      expect(t('pricing.plan.creator.feature1', 'zh-CN')).toBe(
        '导入你自己的 LoRA'
      )
    })

    it('pricing.plan.pro.feature1 returns correct English text', () => {
      expect(t('pricing.plan.pro.feature1')).toBe(
        'Longer workflow runtime (up to 1 hour)'
      )
    })

    it('pricing.plan.pro.feature1 returns correct zh-CN text', () => {
      expect(t('pricing.plan.pro.feature1', 'zh-CN')).toBe(
        '更长工作流运行时长（最长 1 小时）'
      )
    })
  })

  describe('adjacent plan keys are unaffected', () => {
    it('pricing.plan.creator.featureIntro still exists', () => {
      expect(hasKey('pricing.plan.creator.featureIntro')).toBe(true)
    })

    it('pricing.plan.pro.featureIntro still exists', () => {
      expect(hasKey('pricing.plan.pro.featureIntro')).toBe(true)
    })

    it('enterprise plan feature keys are unaffected', () => {
      expect(hasKey('pricing.enterprise.feature1')).toBe(true)
      expect(hasKey('pricing.enterprise.feature2')).toBe(true)
    })
  })

  describe('regression guard – no other concurrent-job keys slipped through', () => {
    it('no remaining translation key contains "concurrent API jobs"', () => {
      const keysWithConcurrent = translationKeys.filter((key) => {
        const en = t(key)
        return en.toLowerCase().includes('concurrent api jobs')
      })
      expect(keysWithConcurrent).toHaveLength(0)
    })
  })
})