const createStore = function(reducer, initState) {
  let state = initState;
  let listeners = [];

  /*订阅*/
  function subscribe(listener) {
    listeners.push(listener);
  }

  function changeState(action) {
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
    changeState,
    getState
  };
};

let initState = {
  count: 0
};

function reducer(state, action) {
  switch (action.type) {
    case "INCREMENT":
      return {
        ...state,
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

// 每个store上就具有了changeState getState subscribe
let store = createStore(reducer, initState);

store.subscribe(() => {
  let state = store.getState();
  console.log(state.count);
});
/*自增*/
store.changeState({
  type: "INCREMENT"
});
/*自减*/
store.changeState({
  type: "DECREMENT"
});
/*我想随便改 计划外的修改是无效的！*/
store.changeState({
  count: "abc"
});
