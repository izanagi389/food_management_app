import { describe, it, expect } from 'vitest'
import { useGlobalMenu } from '~/app/composables/useGlobalMenu'

describe('useGlobalMenu', () => {
  it('shares state across instances (singleton)', () => {
    const a = useGlobalMenu()
    const b = useGlobalMenu()

    expect(a.isMenuOpen.value).toBe(false)
    a.openMenu()
    expect(a.isMenuOpen.value).toBe(true)
    expect(b.isMenuOpen.value).toBe(true)

    b.closeMenu()
    expect(a.isMenuOpen.value).toBe(false)
    expect(b.isMenuOpen.value).toBe(false)
  })
})


