import { jsdom } from 'jsdom'
import Alt from 'alt'
import React from 'react'
import ReactDom from 'react-dom'
import ReactDomServer from 'react-dom/server'
import connectToStores from '../'
import { assert } from 'chai'
import sinon from 'sinon'
import TestUtils from 'react-addons-test-utils'

const alt = new Alt()

const testActions = alt.generateActions('updateFoo')

const testStore = alt.createStore(
  class TestStore {
    constructor() {
      this.bindAction(testActions.updateFoo, this.onChangeFoo)
      this.foo = 'Bar'
    }
    onChangeFoo(newValue) {
      this.foo = newValue
    }
  }
)

export default {
  'connectToStores wrapper': {
    beforeEach() {
      global.document = jsdom('<!doctype html><html><body></body></html>')
      global.window = global.document.defaultView

      alt.recycle()
    },

    afterEach() {
      delete global.document
      delete global.window
    },

    'resolve props on re-render'() {
      const FooStore = alt.createStore(function () {
        this.x = 1
      }, 'FooStore')

      const getProps = sinon.stub().returns(FooStore.getState())

      const Child = connectToStores(React.createClass({
        render() {
          return <span>{this.props.x + this.props.y}</span>
        }
      }), {
        listenTo(props) {
          return [FooStore]
        },

        getProps
      })

      const Parent = React.createClass({
        getInitialState() {
          return { y: 0 }
        },
        componentDidMount() {
          this.setState({ y: 1 })
        },
        render() {
          return <Child y={this.state.y} />
        }
      })

      const node = TestUtils.renderIntoDocument(
        <Parent />
      )

      assert(getProps.callCount === 2, 'getProps called twice')

      const span = TestUtils.findRenderedDOMComponentWithTag(node, 'span')
      assert(span.innerHTML === '2', 'prop passed in is correct')
    },

    'element mounts and unmounts'() {
      const div = document.createElement('div')

      const LegacyComponent = connectToStores(React.createClass({
        render() {
          return React.createElement('div', null, `Foo${this.props.delim}${this.props.foo}`)
        }
      }), {
        listenTo() {
          return [testStore]
        },
        getProps(props) {
          return testStore.getState()
        }
      })

      ReactDom.render(
        <LegacyComponent />
      , div)

      ReactDom.unmountComponentAtNode(div)
    },

    'createClass() component can get props from stores'() {
      const LegacyComponent = React.createClass({
        render() {
          return React.createElement('div', null, `Foo${this.props.delim}${this.props.foo}`)
        }
      })

      const WrappedComponent = connectToStores(LegacyComponent, {
        listenTo() {
          return [testStore]
        },
        getProps(props) {
          return testStore.getState()
        },
      })
      const element = React.createElement(WrappedComponent, {delim: ': '})
      const output = ReactDomServer.renderToStaticMarkup(element)
      assert.include(output, 'Foo: Bar')
    },

    'component statics can see context properties'() {
      const Child = connectToStores(React.createClass({
        contextTypes: {
          store: React.PropTypes.object
        },
        render() {
          return <span>Foo: {this.props.foo}</span>
        }
      }), {
        listenTo(props, context) {
          return [context.store]
        },
        getProps(props, context) {
          return context.store.getState()
        },
      })

      const ContextComponent = React.createClass({
        getChildContext() {
          return { store: testStore }
        },
        childContextTypes: {
          store: React.PropTypes.object
        },
        render() {
          return <Child />
        }
      })
      const element = React.createElement(ContextComponent)
      const output = ReactDomServer.renderToStaticMarkup(element)
      assert.include(output, 'Foo: Bar')
    },

    'component can get use stores from props'() {
      const LegacyComponent = React.createClass({
        render() {
          return React.createElement('div', null, `Foo${this.props.delim}${this.props.foo}`)
        }
      })

      const WrappedComponent = connectToStores(LegacyComponent, {
        listenTo(props) {
          return [props.store]
        },
        getProps(props) {
          return props.store.getState()
        },
      })
      const element = React.createElement(WrappedComponent, {delim: ': ', store: testStore})
      const output = ReactDomServer.renderToStaticMarkup(element)
      assert.include(output, 'Foo: Bar')
    },

    'ES6 class component responds to store events'() {
      class ClassComponent1 extends React.Component {
        render() {
          return <span>{this.props.foo}</span>
        }
      }

      const WrappedComponent = connectToStores(ClassComponent1, {
        listenTo() {
          return [testStore]
        },
        getProps(props) {
          return testStore.getState()
        }
      })

      const node = TestUtils.renderIntoDocument(
        <WrappedComponent />
      )

      testActions.updateFoo('Baz')

      const span = TestUtils.findRenderedDOMComponentWithTag(node, 'span')

      assert(span.innerHTML === 'Baz')
    },

    'componentDidConnect hook is called '() {
      let componentDidConnect = false
      class ClassComponent2 extends React.Component {
        render() {
          return <span foo={this.props.foo} />
        }
      }
      const WrappedComponent = connectToStores(ClassComponent2, {
        listenTo() {
          return [testStore]
        },
        getProps(props) {
          return testStore.getState()
        },
        didMount() {
          componentDidConnect = true
        }
      })
      const node = TestUtils.renderIntoDocument(
        <WrappedComponent />
      )
      assert(componentDidConnect === true)
    },

    'Component receives all updates'(done) {
      let componentDidConnect = false
      class ClassComponent3 extends React.Component {
        componentDidUpdate() {
          componentDidConnect = true
          assert(this.props.foo === 'Baz')
          done()
        }
        render() {
          return <span foo={this.props.foo} />
        }
      }

      const WrappedComponent = connectToStores(ClassComponent3, {
        listenTo() {
          return [testStore]
        },
        getProps(props) {
          return testStore.getState()
        },
        didMount() {
          testActions.updateFoo('Baz')
        },
      })

      let node = TestUtils.renderIntoDocument(
        <WrappedComponent />
      )

      const span = TestUtils.findRenderedDOMComponentWithTag(node, 'span')
      assert(componentDidConnect === true)
    },


  }
}
