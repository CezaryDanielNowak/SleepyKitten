import BaseComponent from 'components/BaseComponent';
import is from 'next-is';
import { scrollTo } from 'helpers/domHelper';

export default class BasePage extends BaseComponent {
  /**
   * getComponentData is used for server side rendering.
   * It can set data to models before constructor is called.
   *
   * @param  {object} props  Props from router.
   * @return {object[Promise]}
   */
  getComponentData() {
    return Promise.resolve();
  }

  constructor(props) {
    super(props);
    setTimeout(() => {
      // this.title is available AFTER constructor
      if (is.browser()) {
        if (!document.location.hash) {
          scrollTo(0);
        }
        document.title = this.title
          ? `${this.title} - ${DEFAULT_PAGE_TITLE}`
          : DEFAULT_PAGE_TITLE;
      }
    });
  }
}
