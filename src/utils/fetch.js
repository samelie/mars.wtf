/* FOR BROWSER WITHOUT PROMISE SUPPORT */
require('es6-promise').polyfill();
/* END */
import isomorphicFetch from 'isomorphic-fetch';

function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    }
    const error = new Error(response.statusText);
    error.response = response;
    throw error;
}

export function fetch(url) {
    return isomorphicFetch(url)
        .then(checkStatus);
}

export function fetchJson(url) {
    return fetch(url)
        .then(response => {
            let _r = response.json()
            return _r;
        })
}