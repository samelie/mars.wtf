import {
  LOAD_ALHAMBRA,
} from '../constants/action-types';

import { JSON_DIR } from '../constants/config';
import fetch from '../utils/fetch';

export function loadAlhambra() {
  return {
    type: LOAD_ALHAMBRA,
    payload: {
      promise: fetch(`${JSON_DIR}alhambra_data.json`)
        .then(response => {
          let _r = response.json()
          return _r;
        })
    },
  };
}
