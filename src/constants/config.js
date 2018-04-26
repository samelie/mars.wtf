// TODO: define logic behind difference between:
// - assets that loaded and
// - assets that are bundled // eg: `require()`
// bundled path doesn't change whereas loaded assets path might

export const REMOTE_ASSETS_DIR = process.env.REMOTE_ASSETS_DIR+'assets/'
export const ASSETS_DIR = process.env.ASSETS_DIR+'assets/'
export const JSON_DIR = `${ASSETS_DIR}json/`;
export const AUDIO_DIR = `${REMOTE_ASSETS_DIR}audio/`;
export const IMAGE_DIR = `${REMOTE_ASSETS_DIR}image/`;
export const SVG_DIR = `${REMOTE_ASSETS_DIR}svg/`;

//TOUR
export const FILTER_ONLY_MP3 = true
export const TIME_ON_LOCATION_COVER = 10000
