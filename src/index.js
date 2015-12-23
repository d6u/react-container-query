import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { requestAnimationFrame, cancelAnimationFrame } from './raf';
import { getComputedStyle } from './getComputedStyle';

function takeNumber(str) {
  return parseInt(/(\d+)px$/i.exec(str)[1]);
}

/**
 * Apply provided container query to target Component
 *
 * @param {Component}      ComposedComponent A react component
 * @param {ContainerQuery} queries           A dictionary of queries
 *
 * @return {Component} A new component
 */
export default function apply(ComposedComponent, queries) {
  return class extends Component {
    constructor() {
      super();

      this.state = {classNames: []};

      this.__cq = {
        height: null,
        width: null,
        id: null,
      };
    }

    componentDidMount() {
      const element = findDOMNode(this.refs.container);
      const computedStyles = getComputedStyle(element);

      const checkDimension = () => {
        const width = computedStyles.getPropertyValue('width');
        const height = computedStyles.getPropertyValue('height');

        let changed = false;

        if (this.__cq.width !== width) {
          changed = true;
        }

        this.__cq.width = width;
        this.__cq.height = height;

        if (changed) {
          this.updateClasses();
        }

        this.__cq.id = requestAnimationFrame(checkDimension);
      };

      checkDimension();
    }

    componentWillUnmount() {
      cancelAnimationFrame(this.__cq.id);
      this.__cq.id = null;
    }

    render() {
      return <ComposedComponent {...this.props}
        classNames={this.state.classNames}
        ref='container' />;
    }

    updateClasses() {
      let classNames = [];

      for (const className of Object.keys(queries)) {
        const rules = queries[className];
        const { minWidth } = rules;

        if (minWidth && takeNumber(minWidth) <= takeNumber(this.__cq.width)) {
          classNames.push(className);
        }
      }

      this.setState({ classNames });
    }
  }
}
