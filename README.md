# alt-react

* Connect your react component to your flux store.
* Automatically pass the flux instance to your component.
* Has hooks for shouldComponentUpdate, didMount, willMount, etc.
* Can be extended to create your own connectors.

Example

```js
import { connect } from 'alt-react'
import React from 'react'
import UserStore from '../stores/UserStore'

class MyComponent extends React.Component {
  render() {
    return <div>Hello, {this.props.userName}!</div>
  }
}

connect(MyComponent, {
  listenTo() {
    return [UserStore]
  },

  getProps() {
    return {
      userName: UserStore.getUserName(),
    }
  },
})
```

and providing the flux context at your root component

```js
import { supplyFluxContext } from 'alt-react'

export default supplyFluxContext(alt)(Root)
```
