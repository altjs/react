import React from 'react'
import ConnectBase from './ConnectBase'

export default (Component, config = {}) => {
  return class extends ConnectBase {
    static displayName = `Stateful${Component.displayName || Component.name}Container`
    static contextTypes = Component.contextTypes || config.contextTypes || {}

    constructor(props, context) {
      super(props, context)
      this.setConnections(props, context, config)
    }

    render() {
      return (
        <Component
          flux={this.flux}
          {...this.props}
          {...this.getNextProps()}
        />
      )
    }
  }
}
