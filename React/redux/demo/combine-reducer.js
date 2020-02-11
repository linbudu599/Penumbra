let initState = {
  counter: {
    count: 0
  },
  info: {
    name: "前端九部",
    description: "我们都是前端爱好者！"
  }
};

const createStore = function(reducer, initState) {
  let state = initState;
  let listeners = [];

  /*订阅*/
  function subscribe(listener) {
    listeners.push(listener);
  }

  function dispatch(action) {
    state = reducer(state, action);
    /*通知*/
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      listener();
    }
  }

  function getState() {
    return state;
  }

  return {
    subscribe,
    dispatch,
    getState
  };
};

// 这里的state实际入参是根状态的counter属性值
function counterReducer(state, action) {
  switch (action.type) {
    case "INCREMENT":
      return {
        count: state.count + 1
      };
    case "DECREMENT":
      return {
        ...state,
        count: state.count - 1
      };
    default:
      return state;
  }
}

function InfoReducer(state, action) {
  switch (action.type) {
    case "SET_NAME":
      return {
        ...state,
        name: action.name
      };
    case "SET_DESCRIPTION":
      return {
        ...state,
        description: action.description
      };
    default:
      return state;
  }
}

function combineReducers(reducers) {
  /* reducerKeys = ['counter', 'info']*/
  const reducerKeys = Object.keys(reducers);

  // 返回一个根Reducer
  // 这里的入参state是根状态
  return function combinatedReducer(state = {}, action) {
    /*生成的新的state*/
    const nextState = {};

    /*遍历执行所有的reducers，整合成为一个新的state*/
    for (let i = 0; i < reducerKeys.length; i++) {
      // counter
      const key = reducerKeys[i];
      // counterReducer
      const reducer = reducers[key];
      /*之前的 key 的 state*/
      const previousStateForKey = state[key];
      /*执行 子 reducer，获得新的state*/
      const nextStateForKey = reducer(previousStateForKey, action);

      nextState[key] = nextStateForKey;
    }
    return nextState;
  };
}

const reducer = combineReducers({
  counter: counterReducer,
  info: InfoReducer
});

let store = createStore(reducer, initState);

store.subscribe(() => {
  let state = store.getState();
  console.log(state.counter.count, state.info.name, state.info.description);
});

/*自增*/
store.dispatch({
  type: "INCREMENT"
});

/*修改 name*/
store.dispatch({
  type: "SET_NAME",
  name: "前端九部2号"
});
