import React, { useState, useEffect } from "react";

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

export default Index;
