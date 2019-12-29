import React, { useState, useEffect, useRef } from "react";

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
