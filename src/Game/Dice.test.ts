import { describe, it, expect, vi } from 'vitest'
import Dice from './Dice'

describe('dice after build tool migration', () => {
  it('keeps copied game state independent', () => {
    const original = new Dice(4)
    const copy = new Dice(original)
    copy.state = 6
    expect(original.state).toBe(4)
    expect(copy.state).toBe(6)
  })
  it('includes both endpoints of a six-sided die', () => {
    const random = vi.spyOn(Math, 'random')
    try {
      random.mockReturnValue(0)
      expect(new Dice().state).toBe(1)
      random.mockReturnValue(1 - Number.EPSILON)
      expect(new Dice().state).toBe(6)
    } finally { random.mockRestore() }
  })
})
