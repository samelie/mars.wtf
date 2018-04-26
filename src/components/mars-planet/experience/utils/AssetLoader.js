import _ from 'lodash'
import Q from 'bluebird'
import AssetsLoader from 'assets-loader';

const P = (() => {

  function load(paths) {
    return new Q((resolve, reject) => {
      let loader = new AssetsLoader({
          assets: paths,
          crossOrigin: 'anonymous',
        }).on('error', (error) => {
          console.error(error);
        }).on('progress', (p) => {

        }).on('complete', (assets) => {
          resolve({loader,assets})
        })
        .start();
    })
  }

  function createObject3dModel(scultputeId){
    return [{
      id: 'model',
      url: `${REMOTE_ASSET_PATH}models/${scultputeId}.obj`,
      type: 'bin'
    }, {
      id: 'texture',
      url: `${REMOTE_ASSET_PATH}models/${scultputeId}.png`
    }]
  }

  return { load, createObject3dModel }

})()
export default P

