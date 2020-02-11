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

/* counter 自己的 state 和 reducer 写在一起*/
let counterInitState = {
  count: 0
};

function counterReducer(state, action) {
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

// 即使不传初始状态 也可以获得初始状态
// 触发初始dispatch - 执行state = reducer(state, action) - 在counterReducer中获得初始值
const counterStore = createStore(counterReducer);

console.log(counterStore.getState());
