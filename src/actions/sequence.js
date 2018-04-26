import {
  LOAD_SEQUENCE,
} from '../constants/action-types';

import { JSON_DIR } from '../constants/config';
import fetch from '../utils/fetch';

export function loadSequence() {
  return {
    type: LOAD_SEQUENCE,
    payload: {
      promise: fetch(`${JSON_DIR}magipack_manifest.json`)
        .then(response => {
          let _r = response.json()
          return _r;
        })
    },
  };
}
