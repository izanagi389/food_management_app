import { ref } from 'vue'

/**
 * グローバルメニュー状態を共有するためのシングルトン
 */
class GlobalMenuState {
  private static instance: GlobalMenuState
  private _isMenuOpen = ref<boolean>(false)

  private constructor() {}

  static getInstance(): GlobalMenuState {
    if (!GlobalMenuState.instance) {
      GlobalMenuState.instance = new GlobalMenuState()
    }
    return GlobalMenuState.instance
  }

  get isMenuOpen() {
    return this._isMenuOpen
  }

  openMenu(): void {
    this._isMenuOpen.value = true
  }

  closeMenu(): void {
    this._isMenuOpen.value = false
  }
}

/**
 * グローバルメニュー管理の共通composable
 */
export const useGlobalMenu = () => {
  const globalMenuState = GlobalMenuState.getInstance()

  return {
    isMenuOpen: globalMenuState.isMenuOpen,
    openMenu: () => globalMenuState.openMenu(),
    closeMenu: () => globalMenuState.closeMenu()
  }
}

