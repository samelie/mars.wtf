import {
  RESIZE,
  ORIENTATION_CHANGE,
} from '../constants/action-types';

import { Record } from 'immutable';

/**
 * Record is like a class, but immutable and with default values.
 * https://facebook.github.io/immutable-js/docs/#/Record
 */
const InitialState = Record({
  width: window.innerWidth,
  height: window.innerHeight,
  orientation: window.orientation
});

const initialState = new InitialState;

/**
 * [projects description]
 * @param  {Record} state  =  initialState [An immutable Record defined above]
 * @param  {function} action [Redux action. Defined in '/actions/terms.js']
 * @return {Record} a new copy of the state you passed into with any changes to it
 */
export default function resize(state = initialState, action) {
  switch (action.type) {
    case RESIZE:
      {
        return state.set('width', action.payload.width)
          .set('height', action.payload.height)
      }
    case ORIENTATION_CHANGE:
      {
        return state.set('orientation', action.payload)
      }
    default:
      {
        return state;
      }
  }
}
