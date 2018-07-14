import React from 'react';
import noop from 'no-op';
import PropTypes from 'prop-types';

import BaseComponent from 'components/BaseComponent';

const ELLIPSIS = '…';

export default class Pagination extends BaseComponent {
  className = 'sk-Pagination';

  static propTypes = {
    activePage: PropTypes.number,
    /**
     * when `aggregateNumber` is provided pagination with multiple pages will
     * collapse some numbers.
     * 0 is disabled
     *
     * aggregateNumber={ 2 } means: show 2 elements before and 2 after current element,
     *                              and then hide rest with '...'
     * < prev, 1, ..., 10, 11, [12], 13, 14, ..., 50 next >
     */
    aggregateNumber: PropTypes.number,
    onPageSelect: PropTypes.func,
    pagesCount: PropTypes.number,
    showPrevAndNext: PropTypes.bool, // < prev, 1, 2, [3], 4, 5, next >
  };

  static defaultProps = {
    activePage: 1,
    aggregateNumber: 0,
    onPageSelect: noop,
    pagesCount: 1,
    showPrevAndNext: false,
  };

  handlePageSelect = (event, selectedPage) => {
    event.preventDefault();
    this.props.onPageSelect(selectedPage);
  }

  itemRenderer = (item, index, overrideOptions = {}) => {
    const options = {
      name: index + 1,
      classNames: {},
      key: `page-${index}`,
      onClick: (event) => this.handlePageSelect(event, index + 1),
      ...overrideOptions,
    };
    const classNames = {
      '__item': true,
      '__item--active': index + 1 === this.props.activePage,
      ...options.classNames,
    };
    if (
      this.props.aggregateNumber &&
      Math.abs(index + 1 - this.props.activePage) > this.props.aggregateNumber &&
      index !== 0 &&
      index + 1 !== this.props.pagesCount
    ) {
      return ELLIPSIS;
    }

    return (
      <a
        className={ this.cn(classNames) }
        href={ options.onClick === noop ? '' : `#page-${index}` }
        key={ options.key }
        onClick={ options.onClick }
      >
        { options.name }
      </a>
    );
  }

  render() {
    if (this.props.pagesCount < 2) return null;

    const pagesMarkup = Array.from(
      { length: this.props.pagesCount },
      this.itemRenderer,
    ).map((el, index, arr) => {
      if (el !== ELLIPSIS) return el;

      if (arr[index + 1] !== ELLIPSIS) {
        return this.itemRenderer(null, 0, {
          classNames: {
            '__ellipsis': true,
            '__item': false,
            '__item--active': false,
          },
          key: `ellipsis-${index}`,
          name: ELLIPSIS,
          onClick: noop,
        });
      }

      return null;
    }).filter(Boolean);

    if (this.props.showPrevAndNext) {
      if (this.props.activePage > 1) {
        pagesMarkup.unshift(
          this.itemRenderer(null, this.props.activePage - 2, {
            name: '< prev',
            key: 'prev',
          })
        );
      }

      if (this.props.activePage < this.props.pagesCount) {
        pagesMarkup.push(
          this.itemRenderer(null, this.props.activePage, {
            name: 'next >',
            key: 'next',
          })
        );
      }
    }

    return (
      <div className={ this.rootcn`` }>
        { pagesMarkup }
      </div>
    );
  }
}
