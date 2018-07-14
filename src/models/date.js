import atom from 'atom-js';

const model = atom('months', [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' }
]);

model.SEC = 1000;
model.MIN = 60 * model.SEC;
model.HOUR = 60 * model.MIN;
model.DAY = 24 * model.HOUR;
model.WEEK = 7 * model.DAY;
model.YEAR = 365.25 * model.DAY;
model.MONTH = model.YEAR / 12;

model.MIN_AGE_OF_ELIGIBILITY = 18;
model.MAX_AGE_OF_ELIGIBILITY = 150;
model.OLDEST_PERSON_BIRTHDATE = '1900-03-10';

/**
 * Formats input parts into DD/MM/YYYY format with padding. It's ommiting Date
 * format and operates on strings, so we don't loose OCR data.
 *
 * @param  {[type]} mm   Month
 * @param  {[type]} dd   Day
 * @param  {[type]} yyyy Year
 */
model.formatUSDate = (mm = 0, dd = 0, yyyy = 0) => {
  if (!parseInt(mm, 10) && !parseInt(dd, 10) && !parseInt(yyyy, 10)) {
    return '';
  }

  const mmPad = `00${mm}`.slice(-2);
  const ddPad = `00${dd}`.slice(-2);
  const yyyyPad = `0000${yyyy}`.slice(-4);

  return `${mmPad}/${ddPad}/${yyyyPad}`;
};


/**
 * toISODate returns date in format: YYYY-MM-DD
 * @param  {Date} dateObj
 * @return {string}
 */
model.toISODate = (dateObj) => {
  if (!(dateObj instanceof Date)) throw new Error('Not a valid instance of Date.');
  const yyyy = dateObj.getFullYear();
  const mm = `0${(dateObj.getMonth() + 1)}`.slice(-2);
  const dd = `0${dateObj.getDate()}`.slice(-2);

  return `${yyyy}-${mm}-${dd}`;
};

model.getDate = (usDateString) => {
  if (!usDateString) throw new Error('No US date string provided.');
  return new Date(usDateString);
};

export default model;
