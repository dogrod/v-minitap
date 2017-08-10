/**
 * tap directive
 * Created by Rodrick Zhu
 */

// adapted from https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
const detectPassiveEvents = {
  /**
   * update function
   */
  update() {
    if (
      typeof window === 'object' &&
      typeof window.addEventListener === 'function' &&
      typeof Object.defineProperty === 'function'
    ) {
      let passive = false
      const options = Object.defineProperty({}, 'passive', {
        /**
         * get property
         */
        get() { passive = true },
      })
      window.addEventListener('test', null, options)

      detectPassiveEvents.hasSupport = passive
    }
  },
}

detectPassiveEvents.update()

const handleTouchStart = (e, touchObj) => {
  const touches = e.touches[0]

  touchObj.tapObj = {
    pageX: touches.pageX,
    pageY: touches.pageY,
    time: +new Date(),
  }
}

const handleTouchEnd = (e, touchObj, handler) => {
  const touches = e.changedTouches[0]

  const moveObj = {
    distanceX: Math.abs(touches.pageX - touchObj.tapObj.pageX),
    distanceY: Math.abs(touches.pageY - touchObj.tapObj.pageY),
    time: +new Date() - touchObj.tapObj.time,
  }

  // 限定条件 横纵向距离小于9 && 时间低于250ms
  if (moveObj.distanceX < 9 && moveObj.distanceY < 9 && moveObj.time < 250) {
    handler()
  }

  // 重置
  touchObj.tapObj = {}
}

export default {
  bind(el, binding) {
    el.__touchStartHandler__ = handleTouchStart
    el.__touchEndHandler__ = handleTouchEnd

    const options = binding.modifiers.prevent ? {} : { passive: true }

    el.addEventListener('touchstart', (e) => {
      if (binding.modifiers.stop) {
        e.stopPropagation()
      }
      if (binding.modifiers.prevent) {
        e.preventDefault()
      }

      handleTouchStart(e, el)
    }, detectPassiveEvents.hasSupport ? options : false)

    el.addEventListener('touchend', (e) => {
      if (binding.modifiers.stop) {
        e.stopPropagation()
      }
      if (binding.modifiers.prevent) {
        e.preventDefault()
      }

      handleTouchEnd(e, el, binding.value)
    }, detectPassiveEvents.hasSupport ? options : false)
  },
  unbind(el) {
    document.removeEventListener('touchstart', el.__touchStartHandler__)
    delete el.__touchEndHandler__

    document.removeEventListener('touchend', el.__touchEndHandler__)
    delete el.__touchStartHandler__
  },
}
