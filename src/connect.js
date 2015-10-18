import React from 'react'
import ConnectBase from './ConnectBase'

export default (Component, config) => {
  return class extends ConnectBase {
    constructor() {
      super()
      this.setConnections(config)
    }

    render() {
      return <Component {...this.getNextProps()} flux={this.flux} />
    }
  }
}
