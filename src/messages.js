import React from 'react';

/* eslint-disable max-len */

export const HELP_DATA_FORM_VALIDATION_FAIL = ({ validation } = {}) => ({
  headerInfo: 'I’M SORRY',
  theme: 'error',
  title: 'There are errors in following fields:',
  content: (
    <span>
      { Object.keys(validation).map((key) => (
        <span>{ key.replace(/_/g, ' ') }: { validation[key] }</span>
      )) }
    </span>
  ),
});

export const HELP_DATA_GENERIC_ERROR = ({ text } = {}) => ({
  theme: 'error',
  title: 'We encountered an error',
  content: text,
});
