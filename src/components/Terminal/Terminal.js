import React from 'react';
import BaseComponent from 'components/BaseComponent';
import TerminalInReact from 'terminal-in-react';

/**
 * Terminal components acts like browser's console.
 * It's meant to be used in extreme cases, when you're not able
 * to debug your code in other way.
 *
 * Possible use cases:
 * - You need to debug code in in-app-browser
 * - You need to debug browser on iOS, but your mac's graphic card fried to dead
 * - You need to debug some weird mobile browser, that don't really have remote debugger
 */

export default class Terminal extends BaseComponent {
  className = 'sk-Terminal';

  constructor(props) {
    super(props);
    // eslint-disable-next-line no-console
    console.error('WARNING: Terminal components is meant to be used for local development only');
  }

  render() {
    return (
      <TerminalInReact
        color="#BFBFBF"
        watchConsoleLogging={ true }
        // eslint-disable-next-line no-console, no-sequences
        commandPassThrough={ ([cmd]) => (console.log(getValue(cmd)), undefined) }
      />
    );
  }
}

function getValue(cmd) {
  // eslint-disable-next-line no-eval
  let result = eval(cmd);
  if (typeof result === 'boolean') {
    result = result.toString();
  }

  if (result === undefined) {
    result = `${result}`;
  }

  return result;
}
