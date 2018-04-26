import Emitter from '../rad/Emitter'

const P = (() => {
  let activeSculptureIndex

  Emitter.on('sculpture:near', (index) => {
    activeSculptureIndex = index
  })

  Emitter.on('sculpture:out', (index) => {
    activeSculptureIndex = undefined
  })

  document.addEventListener("keydown", (event) => {
    switch (event.which) {
      case 40:
      case 83:
        Emitter.emit('keyboard:down:down')
        break
      case 38:
      case 87:
        Emitter.emit('keyboard:down:up')
        break
      case 68:
      case 39:
        Emitter.emit('keyboard:down:right')
        break
      case 37:
      case 65:
        Emitter.emit('keyboard:down:left')
        break
    }
  })

  document.addEventListener("keyup", (event) => {
    switch (event.which) {
      case 40:
      case 83:
        Emitter.emit('keyboard:up:down')
        break
      case 38:
      case 87:
        Emitter.emit('keyboard:up:up')
        break
      case 68:
      case 39:
        Emitter.emit('keyboard:up:right')
        break
      case 37:
      case 65:
        Emitter.emit('keyboard:up:left')
        break
      case 32:
        Emitter.emit('keyboard:up:space')
        if (activeSculptureIndex !== undefined) {
          //Emitter.emit('keyboard:sculpture:view', activeSculptureIndex)
        }
        break
    }
  })

  return {}

})()

export default P
