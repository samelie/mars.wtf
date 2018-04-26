import {
  LOAD_BODYMOVIN,
} from '../constants/action-types';

import { JSON_DIR } from '../constants/config';
import fetch from '../utils/fetch';

export function loadBodymovin() {
  return {
    type: LOAD_BODYMOVIN,
    payload: {
      promise: fetch(`${JSON_DIR}bodymovin.json`)
        .then(response => {
          let _r = response.json()
          return _r;
        })
    },
  };
}
