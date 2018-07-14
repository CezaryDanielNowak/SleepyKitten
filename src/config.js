// TODO Remove me.

const BASE_PATH = global.location && global.location.pathname.match(/^.*[\\/]/, '')[0] || '/';

export default {
  /* eslint-enable */
  backendURL: BACKEND_URL,
  // BASE_PATH is used in cases, when website is hosted from subdirectory.
  BASE_PATH: BASE_PATH,
  assetsURL: BASE_PATH.slice(0, -1),
};
