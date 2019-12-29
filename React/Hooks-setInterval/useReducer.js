import React, { useState, useEffect, useRef } from "react";

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
