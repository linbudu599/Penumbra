let initState = {
  count: 0
};

const createStore = function(reducer, initState) {
  let state = initState;
  let listeners = [];

  function subscribe(listener) {
    listeners.push(listener);
  }

  function dispatch(action) {
    state = reducer(state, action);
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      listener();
    }
  }

  function getState() {
    return state;
  }

  // 初始化时就会执行，Symbol值不匹配任何action type
  // 遍历执行时 rootReducer内部的每个子reducer都会获得初始状态（默认的）
  dispatch({ type: Symbol() });

  return {
    subscribe,
    dispatch,
    getState
  };
};

function reducer(state, action) {
  /*注意：如果 state 没有初始值，那就给他初始值！！*/
  if (!state) {
    state = counterInitState;
  }
  switch (action.type) {
    case "INCREMENT":
      return {
        count: state.count + 1
      };
    case "DECRIMENT":
      return {
        count: state.count - 1
      };
    default:
      return state;
  }
}

// 如何实现applyMiddleware？

// 期望使用方式
/*接收旧的 createStore与要使用的中间件，返回新的 createStore*/
const newCreateStore = applyMiddleware(
  exceptionMiddleware,
  timeMiddleware,
  loggerMiddleware
)(createStore);

/*返回了一个 dispatch 被重写过的 store*/
// 现在的dispatch在执行前还会走一遍中间件
const store = newCreateStore(reducer);

const applyMiddleware = function(...middlewares) {
  /*返回一个重写createStore的方法*/
  return function rewriteCreateStoreFunc(oldCreateStore) {
    /*返回重写后新的 createStore*/
    return function newCreateStore(reducer, initState) {
      /*执行createStore方法 生成store*/
      const store = oldCreateStore(reducer, initState);
      /*给每个 middleware 传下store，相当于 const logger = loggerMiddleware(store);*/
      /* const chain = [exception(store), time(store), logger(store)]*/
      const chain = middlewares.map(middleware => middleware(store));
      // 保存原本的dispatch
      let dispatch = store.dispatch;
      /* 实现 exception(time((logger(dispatch))))*/
      chain.reverse().map(middleware => {
        // 原本的dispatch被包在内部
        // dispatch = logger(dispatch) = time(logger(dispatch)) ...
        dispatch = middleware(dispatch);
      });

      /*2. 重写 dispatch*/
      store.dispatch = dispatch;
      return store;
    };
  };
};
