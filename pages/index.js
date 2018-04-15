import Head from 'next/head'
import css from '../styles/index.scss';

export default () =>
  <div>
    <Head>
      <title>My page title</title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <link rel="stylesheet" href="/_next/static/style.css" />
    </Head>
    <p className={ css.example }>Hello world!</p>
  </div>