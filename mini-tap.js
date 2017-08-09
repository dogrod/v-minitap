/**
 * tap directive
 * Created by dogrod
 */

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

    el.addEventListener('touchstart', (e) => {
      if (binding.modifiers.stop) {
        e.stopPropagation()
      }
      if (binding.modifiers.prevent) {
        e.preventDefault()
      }

      handleTouchStart(e, el)
    })

    el.addEventListener('touchend', (e) => {
      if (binding.modifiers.stop) {
        e.stopPropagation()
      }
      if (binding.modifiers.prevent) {
        e.preventDefault()
      }

      handleTouchEnd(e, el, binding.value)
    })
  },
  unbind(el) {
    document.removeEventListener('touchstart', el.__touchStartHandler__)
    delete el.__touchEndHandler__

    document.removeEventListener('touchend', el.__touchEndHandler__)
    delete el.__touchStartHandler__
  },
}
