import _ from 'lodash'
import Q from 'bluebird'
import load from 'load-json-xhr'

const LOADJSON = Q.promisify(load)
const P = (() => {
  function loadJson(paths) {
    return Q.map(paths, src => {
      return LOADJSON(src).then(json => {
        return json
      })
    }, {
      concurrency: 1
    }).then(results => {
      return results
    })
  }

  /*
  let homeModel = gallery[0]
        .map(obj => {
          if (obj.home) {
            return obj
          }
          return null
        }).filter(d => {
          return !!d
        })[0]

  */
  return { loadJson, }

})()
export default P
