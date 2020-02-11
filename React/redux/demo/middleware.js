// 个人理解：拦截actions 处理完毕后再dispatch一个reducer到store
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

/*重写store.dispatch，在原来的基础上新增了额外处理*/
// store.dispatch = action => {
//   console.log("this state", store.getState());
//   console.log("action", action);
//   next(action);
//   console.log("next state", store.getState());
// };

// 另外一个中间件，要怎么合并？如果也重写，只会执行后面的
// store.dispatch = action => {
//   try {
//     next(action);
//   } catch (err) {
//     console.error("错误报告: ", err);
//   }
// };

// const loggerMiddleware = action => {
//   console.log("this state", store.getState());
//   console.log("action", action);
//   next(action);
//   console.log("next state", store.getState());
// };

// store.dispatch = action => {
//   try {
//     loggerMiddleware(action);
//   } catch (err) {
//     console.error("错误报告: ", err);
//   }
// };

// // 这种方式把两个中间件紧密耦合咯
// const exceptionMiddleware = action => {
//   try {
//     /*next(action)*/
//     loggerMiddleware(action);
//   } catch (err) {
//     console.error("错误报告: ", err);
//   }
// };

const loggerMiddleware = next => action => {
  console.log("this state", store.getState());
  console.log("action", action);
  next(action);
  console.log("next state", store.getState());
};

const exceptionMiddleware = next => action => {
  try {
    console.log("成功！");
    next(action);
  } catch (err) {
    console.error("错误报告: ", err);
  }
};

// 错误处理中间件会执行完自己的任务之后再去调用日志中间件，而日志中间件中的next恒为原本的store.dispatch
store.dispatch = exceptionMiddleware(loggerMiddleware(next));

store.dispatch({
  type: "INCREMENT"
});
