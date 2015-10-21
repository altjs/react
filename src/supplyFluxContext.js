import React from 'react'

export default flux => Component => React.createClass({
  childContextTypes: {
    flux: React.PropTypes.object,
  },

  getChildContext() {
    return { flux }
  },

  render() {
    return <Component {...this.props} />
  },
})
