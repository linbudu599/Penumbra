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

const store = createStore(counterReducer);
// /保存原版dispatch
const next = store.dispatch;

// 这样使得两个中间件可以被拆分到不同的文件中
const loggerMiddleware = store => next => action => {
  console.log("this state", store.getState());
  console.log("action", action);
  next(action);
  console.log("next state", store.getState());
};

const exceptionMiddleware = store => next => action => {
  try {
    next(action);
    console.log("成功咯");
  } catch (err) {
    console.error("错误报告: ", err);
  }
};

const timeStampMiddleware = store => next => action => {
  console.log(Date.now());
  next(action);
};

const asyncRes = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, 2000);
  });
};

const asyncMiddleware = store => next => async action => {
  await asyncRes();
  console.log("Async Middleware");
  next(action);
};

const logger = loggerMiddleware(store);
const exception = exceptionMiddleware(store);
const timeStamp = timeStampMiddleware(store);
const asyncMw = asyncMiddleware(store);

store.dispatch = exception(logger(timeStamp(asyncMw(next))));

store.dispatch({
  type: "INCREMENT"
});

