import React from 'react'
import ConnectBase from './ConnectBase'

export { ConnectBase }

export default (Component, config) => {
  return class extends ConnectBase {
    constructor(props, context) {
      super(props, context)
      this.setConnections(props, context, config)
    }

    render() {
      return <Component {...this.getNextProps()} flux={this.flux} />
    }
  }
}
