import {
  TOUR_LOCATION_CHANGED,
  TOUR_SPEAKING_CHANGED,
  TOUR_BEARING_CHANGED,
  TOUR_SPEAKING_PLAYBACK,
  TOUR_DOMINANT_PLAYBACK,
  TOUR_AMBIENT_PLAYBACK,
  TOUR_NEXT_LOCATION,
  TOUR_SHOW_MAP,
  TOUR_USER_COORDS_CHANGED,
  TOUR_PAUSE_EXPERIENCE,
} from '../constants/action-types';

export function locationChanged(payload = {}) {
  return {
    type: TOUR_LOCATION_CHANGED,
    payload: payload
  };
}

export function speakingChanged(payload = {}) {
  return {
    type: TOUR_SPEAKING_CHANGED,
    payload: payload
  };
}

export function bearingChanged(payload = {}) {
  return {
    type: TOUR_BEARING_CHANGED,
    payload: payload
  };
}

export function speakingPlaying(payload = {}) {
  return {
    type: TOUR_SPEAKING_PLAYING,
    payload: payload
  };
}

export function speakingPlayback(payload = {}) {
  return {
    type: TOUR_SPEAKING_PLAYBACK,
    payload: payload
  };
}

export function dominantPlayback(payload = {}) {
  return {
    type: TOUR_DOMINANT_PLAYBACK,
    payload: payload
  };
}
export function ambientPlayback(payload = {}) {
  return {
    type: TOUR_AMBIENT_PLAYBACK,
    payload: payload
  };
}
export function nextLocation(payload = {}) {
  return {
    type: TOUR_NEXT_LOCATION,
    payload: payload
  };
}
export function showMap(payload = {}) {
  return {
    type: TOUR_SHOW_MAP,
    payload: payload
  };
}

export function userCoordsChanged(payload = {}) {
  return {
    type: TOUR_USER_COORDS_CHANGED,
    payload: payload
  };
}
export function experiencePaused(payload = {}) {
  return {
    type: TOUR_PAUSE_EXPERIENCE,
    payload: payload
  };
}
