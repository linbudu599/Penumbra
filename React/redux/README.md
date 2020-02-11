# Redux 源码解读

## 自己实现一个五脏俱全的 Redux

> 自己理解，还不确定正误

- [具有订阅机制的 `store`，能够完成简单的状态管理, 根据 `action.type` 得到新的 `state`，有计划的状态管理器](demo/single-reducer.js)

发布-订阅模式，在这里调度中心即是 Store。
createStore 方法使用闭包保存了对初始状态的引用，同时其内部的变量也不会被回收。
在 changeState 内部通过 reducer 来实现状态变更。
提供一个 getState 方法的意义：手动获取值与控制部分中间件权限.

- [拆分 `reducer`](demo/combine-reducer.js)

实现 combineReducer 函数,为什么命名空间要与 state 内部的一致: 通过 `state[key]` 来变更那部分变量的.
一旦一个子 reducer 被触发,所有的子 reducer 都会被遍历执行一遍,对于其他的 reducer,会因为 action.type 没有匹配的而直接返回原先的状态.

- [拆分 `state`](demo/combine-state.js)

一个组件/模块的 state 和 reducer 写在一起, 比起先前的多了几个地方的处理:

在子 reducer 中, 如果状态没有初始值,就给它一个初始值(使用入参的 state).
这样,在调用 createStore 方法时可以不传入初始状态,但仍可获得初始状态.
在 createStore 方法内部还进行了一步操作,`dispatch({ type: Symbol() })`,这样在初始化时就会使 store 获得默认值. 结合上面所说,在初始化根 store 时就会遍历执行子 reducer,使所有的子 state 获得初始状态.

- [中间件机制，多个中间件的链式调用](demo/middleware.js)

中间件的工作原理:拦截 actions,把自己要做的事情做了之后再放行,reducer 更新状态. 在这里实现了日志打印/错误捕获/时间戳记录/异步流程几个比较简单的中间件,使用方式也大致相同,自己的事情做完后把控制权交给下一个中间件,最后一个中间件再去触发 reducer.

大部分中间件不需要获取 store 状态,即使需要也只能开放给 store.getStore 权限. 实现见下下个 demo.

猜测 redux-thunk 的工作机制:等待请求返回后再添加到 action.payload 传递出去.

实现方式即是重写 store 的 dispatch 方法,但我们会保留一份这个方法的副本,交给最后一个中间件.

- [合并中间件( `applyMiddleware()` )](demo/combine-middleware.js)

由于我们会重写 store.dispatch 方法,代之以一个这些中间件串起来的一个方法,那么在有多个中间件的情况下可能会显得很繁琐.因此我们实现一个函数,传入中间件能返回重写好的方法?

实现一个 `applyMiddleware` 方法,它会直接重写 createStore 方法,使之返回的 store 是一个被改写了 dispatch 方法的新的 store.

调用时只需要:

```js
const newCreateStore = applyMiddleware(
  exceptionMiddleware,
  timeMiddleware,
  loggerMiddleware
)(createStore);
```

在这个方法的内部,我们还是先保存一份 store.dispatch 方法,然后代之以`A(B(C(store.dispatch)))`这样的方法. 这里的实现方式与 redux 内部不同,但结果一样.

- [模拟重载（其实就是入参不同效果不同），收缩中间件权限，replaceReducer...](demo/detail.js)

  - createStore 方法可以传也可以不传中间件,那么就在内部做一个判断,统一一个调用方式.而且既然我们可以不传 初始状态,就也要增加一个判断.(为什么会有这种呢,因为你传给 createStore 方法和 reducer 的方法的初始状态并不一定相同)

  - 添加退订功能,这里把退订方法作为订阅方法的返回值.

  - 在前面的结合中间件中,我们为中间件传入的是整个 store,现在改为传入 store.getState 方法.

- [常与 `react-redux` 结合的 `bindActionCreators()`](demo/bindActionCreators.js)

实际上在这里把 dispatch 和 actionCreators 使用闭包的方式隐藏起来了,比如先前要先调用一个 actionCreators 得到一个 action,再 dispatch 这个 action 去触发 reducer.

现在我们实现多个方法,封装上面的重复逻辑,直接调用这个方法就可以实现上面的效果.

源码中的实现是 bindActionCreators 传入 actionCreators 和 dispatch,如果为函数,则直接调用 bindActionCreator(注意和前面的不一样)返回一个开箱即用的 dispatch 函数,如果为对象,则进行处理后返回一组 dispatch 函数(boundActionCreators)

## redux 官方实现

### createStore

入参：**reducer** **initState** **enhancer**

前面两个和自己实现的demo大致相同，可以说说最后一个。实际上enhancer就是中间件经过applyMiddleware方法包装后返回的函数。

使用方式也类似：

```js
import {createStore，applyMiddleware} from 'redux';
import reducers from './reducers';
import Logger from 'redux-logger';

export default createStore(reducers, applyMiddleware(Logger))
```

在createStore方法内部的相关逻辑是这样的：

```js
 if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.')
    }
    return enhancer(createStore)(reducer, preloadedState)
  }
```

可以比对一下自己实现的版本（注意这里enhancer实际上就是`applyMiddlewares(...middlewares)`）：

```js
const applyMiddleware = function(...middlewares) {
  return function rewriteCreateStoreFunc(oldCreateStore) {
    return function newCreateStore(reducer, initState) {
      const store = oldCreateStore(reducer, initState);
      const chain = middlewares.map(middleware => middleware(store));
      let dispatch = store.dispatch;
      chain.reverse().map(middleware => {
        dispatch = middleware(dispatch);
      });

      store.dispatch = dispatch;
      return store;
    };
  };
};
```

内部的初始化状态：

```js
  // 不会命中任何关于action的判断，直接返回初始状态
  // 控制台打印出来可以看到是乱码一样的
  dispatch({ type: ActionTypes.INIT })
```

dispatch锁

```js
// 如果正在dispatch action，进行一些限制
let isDispatching = false

// 使用
function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected the listener to be a function.')
    }
    // 由于dispatch函数会在reducer执行完毕后循环执行listeners数组内订阅的更新函数，所以要保证这个时候的listeners数组
    // 不变，既不能添加（subscribe）更新函数也不能删除（unsubscribe）更新函数
    if (isDispatching) {
      throw new Error(
        'You may not call store.subscribe() while the reducer is executing. ' +
          'If you would like to be notified after the store has been updated, subscribe from a ' +
          'component and invoke store.getState() in the callback to access the latest state. ' +
          'See https://redux.js.org/api-reference/store#subscribe(listener) for more details.'
      )
    }

  if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.')
    }

    try {
      isDispatching = true
      // 获取到当前的state
      currentState = currentReducer(currentState, action)
    } finally {
      isDispatching = false
    }
```

返回：**dispatch** **subscribe** **getState**，不做详细说明。

### combineReducers

```js
let shapeAssertionError

  // assertReducerShape用来检查这每个reducer有没有默认返回的state，
  // 我们在写reducer时候，都是要在switch中加一个default的，来默认返回初始状态
  try {
    assertReducerShape(finalReducers)
  } catch (e) {
    shapeAssertionError = e
  }
```

还有就是多了一步判断，如果子reducer返回的还是初始值，直接返回新的state

### applyMiddleware

也是这一步赋予了我们使用一个函数作为action的能力，以redux-thunk为例

```js
function loadData() {
    return (dispatch, getState) => { // 函数之内会真正dispatch action
        callApi('/url').then(res => {
            dispatch({
                type:'LOAD_SUCCESS',
                data: res.data
            })
        })
    }
}

store.dispatch(loadData()) //派发一个函数
```

redux-thunk的核心代码：

```js
function createThunkMiddleware(extraArgument) {
  return function({ dispatch, getState }) { //真正的中间件函数，内部的改造dispatch的函数是精髓
    return function(next) { //改造dispatch的函数，这里的next是外部传进来的dispatch，可能是被其他中间件处理过的，也可能是最原本的
      return function(action) { //这个函数就是改造过后的dispatch函数
        if (typeof action === 'function') {
          // 如果action是函数，那么执行它，并且将store的dispatch和getState传入，便于我们dispatch的函数内部逻辑执行完之后dispatch真正的action,
          // 如上边示例的请求成功后，dispatch的部分
          return action(dispatch, getState, extraArgument);
        }
        // 否则说明是个普通的action，直接dispatch
        return next(action);
      }
    }
  }
}
const thunk = createThunkMiddleware();
```

执行：`thunk({ dispatch, getState })(next)(action)`

`thunk({ dispatch, getState })(next)`相当于一个改造过的dispatch方法，而`{ dispatch, getState }`是真正地原来的store传入的。而`next`则是被改造之前的dispatch方法，它有可能已经被其他中间件改造过。也可能就是原来的。
