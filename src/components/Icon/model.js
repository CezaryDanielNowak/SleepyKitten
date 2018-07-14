import atom from 'atom-js';
import { asset } from 'helpers';
import { get } from 'helpers/request';

const noIcon = '<?xml version="1.0"?><svg width="40" height="40" viewBox="0 0 40 40"></svg>';
const requestCache = {};

const model = atom();

model.fetchIcon = (iconName, iconSet, callback) => {
  const iconID = `${iconSet}/${iconName}`;
  const cachedIcon = model.get(iconID);
  if (cachedIcon) {
    return callback(cachedIcon);
  }

  model.once(iconID, callback);
  if (!requestCache[iconID]) {
    get(asset`icons/${iconID}.svg`)
      .set('Accept', 'image/svg+xml')
      .end((err, res) => {
        if (err) {
          console.error('fetching icon failed', iconID, err); // eslint-disable-line no-console

          model.set(iconID, noIcon);
        } else {
          model.set(iconID, res.text);
        }
      }, { disableMediator: true });
    requestCache[iconID] = true; // prevent from multiple ajax calls
  }
};

export default model;
