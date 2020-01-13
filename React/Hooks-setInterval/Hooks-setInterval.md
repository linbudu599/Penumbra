# React Hooks 与 setInterval

> 会突然想到这个细节问题，是因为上一周在写家园的前端项目时碰到的问题，修改信息部分的逻辑，点击修改 -> 弹出模态框 -> 点击获取验证码 -> 禁用验证码按钮 60 秒 -> 60 秒结束后解除禁用。（虽然产品给的需求还没到这一块，但是肯定以后会，想着先提前写好，讲道理我感觉我对产品也有点兴趣~）
>
> 但是由于上一个比较完整的 React 项目是个外包，比较简单，没接触过这方面的逻辑，所以就卡壳了，查了一下发现还是有不少值得学习的地方的，故也记录一篇。

## 一个最基础的例子

- 使用 dependency array

```javascript
function Index() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [count]);

  return <div>{count}</div>;
}
```

原理也很简单，在初始化时设定了一个 `setInterval` ，在销毁时清除它，并在 **count** 变化时重新执行 `useEffect` 。即在 **count** 更新后清除上一个定时器，并启动下一个定时器。且启动时的 **count** 是最新的值，这样一来 `setInterval` 在后续执行拿到的就是最新的 **count** 值了。

但是这样一来，`useEffect` 里的函数所包含的所有状态、属性都需要被写到依赖数组里，例如在其中进行发送 axios 请求并更新页面，该请求的所有参数都必须写进依赖数组。

- 使用 useCallback 拆分依赖数组

  ```javascript
  function Index() {
    const [stationId, setStationId] = useState(1);
    const [startDate, setStartDate] = useState("2019-01-01");
    const [endDate, setEndDate] = useState("2019-01-10");

    const fetchData = useCallback(() => {
      axios
        .get("url", {
          params: {
            stationId,
            startDate,
            endDate
          }
        })
        .then(res => console.log(res.data));
    }, [stationId, startDate, endDate]);

    useEffect(() => {
      const timer = setInterval(() => {
        fetchData();
      }, 1000);
      return () => clearInterval(timer);
    }, [fetchData]);
  }
  ```

  本质上没有啥改变，只是把 **监听状态** 变为了 **监听函数** ，并且让 `useEffect` 变得更好管理。

  这两种写法本质上一样，也都存在一个不太符合常人逻辑的问题：这里的定时器实际上只执行一次就被清除了...下一个又是一个新的定时器。正常来说我们想要的是一个一经启动就一直驻留内存中直到被手动清除的计时器。

## 使用 useRef

在第一种写法中，如果不添加依赖数组，那么 `setInterval` 里的回掉函数只能取到当前 **闭包** 中的值，使得每一次获取的都是同一个 **count** 值。

在简单场景下可以使用这种方法：

```javascript
setCount(count => count + 1);
```

**但是！**

- 这种方式可以获取到最新的 state，但无法获取最新的 props！因此如果定时器回调函数中需要用到 props，它就莫得法子了。
- 在有些情况下定时器需要执行的是读取数据，并不会用到 `setState` 。

> `useRef` 具有一个贼好用的特性，在每次渲染中它返回的值都指向同一个对象，同时该对象具有一个可以直接被修改、可以被读取、能够被传递到下次渲染的属性：**current**

```javascript
function Index() {
  const [count, setCount] = useState(0);
  const ref = useRef();

  useEffect(() => {
    ref.current = count;

    const timer = setInterval(() => {
      setCount(ref.current + 1);
    }, 1000);
    return () => clearInterval(timer);
  });

  return <div>{count}</div>;
}
```

在每次初始化时获取到上一轮的 count 值，并传入新的定时器里...新的！是的，这还是走了老路，不断销毁与创建定时器。

在控制台中打印 `timer` 和 `ref` 看看

![timer](https://linbudu-img-store.oss-cn-shenzhen.aliyuncs.com/img/TIM截图20191229134523.png)

想要真正实现一个定时器安享晚年（？），应该做的是每次直接为它传入最新的回调函数。

也就是说，我们在这里应该用 `useRef().current` 保存的是那个回调函数。

> 这里我们使用自定义 hooks，[useRef.js](useRef.js)

```javascript
function useSetInterval(callback) {
  const ref = useRef();

  useEffect(() => {
    ref.current = callback;
  });

  useEffect(() => {
    const cb = () => {
      ref.current();
    };
    const timer = setInterval(cb, 1000);
    console.log(timer, ref);
    return () => clearInterval(timer);
  }, []);
}

export default function Index() {
  const [count, setCount] = useState(0);

  useSetInterval(() => {
    setCount(count + 1);
  });

  return <div>{count}</div>;
}
```

每当组件 rerender，current 都会得到最新的回调函数保存起来，然后再扔到定时器里去执行，这样确保始终得到的都是最新的回调函数以及 count，而不会再被困在闭包里。

但是这种方式显得或多或少有些 hack，之前看程墨大神有一篇文章也提到过这个方法，并也给予了类似的评价。如果不用考虑闭包、依赖树组啥的就好了，于是我们又有了下面这种方法。

## useReducer

> 因为闭包的原因，回调函数无法取到最新的 state，而大多数场景下我们更新 state 前又必须先获取 state 的当前值。那如何才能够在不读取最新 state 的前提下，对 state 进行增量更新？[useReducer.js](useReducer.js)

```javascript
function reducer(state = 0) {
  return { count: state.count + 1 };
}

export default function Index() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  useEffect(() => {
    setInterval(() => {
      dispatch();
    }, 1000);
  }, []);

  return <div>{state.count}</div>;
}
```

通过使用这种方式，避免了在更新 state 之前还要获取旧的 state，而是通过 dispatch 一个 action 进行更新数据。

但很明显的，使用 `useReducer` 能很好的以开发者的思维处理复杂场景，同时便于后期维护，但是会增加代码量噢~

## 验证码

> 2020-1-11 更新: 用自定义hooks的方式来实现 [useCountDown](https://github.com/linbudu599/Effective-Customize-Hooks/blob/master/hooks/useCountDown/useCountDown.js)
> 验证码的逻辑和前面几个并不太一样，这里我就暂时先放上自己摸索的写法 [send-verify-code.js](send-verify-code.js)

能够正常工作：

![sendCode](https://linbudu-img-store.oss-cn-shenzhen.aliyuncs.com/img/preview_01.gif)

```javascript
let countInterval = null;

const Index = () => {
  const [count, setCount] = useState(3);
  const [disableBtn, setDisableBtn] = useState(false);

  const interval = () => {
    countInterval = setInterval(() => {
      if (count - 1 === 0) {
        clearInterval(countInterval);
        setDisableBtn(false);
        return;
      }
      setCount(count - 1);
    }, 1000);
  };

  useEffect(() => {
    if (disableBtn) {
      interval();
    } else {
      setCount(3);
    }
    return () => clearInterval(countInterval);
    // 没有依赖数组，即每次重渲染该函数组件都会执行
  });
  return (
    <>
      {!disableBtn ? (
        <button
          onClick={() => {
            setDisableBtn(true);
          }}
        >
          send verify code
        </button>
      ) : (
        <button>send again ({count})</button>
      )}
    </>
  );
};
```

## 参考文章

- [React Hooks 中使用 setInterval 的若干方法](https://zhuanlan.zhihu.com/p/96030406)
