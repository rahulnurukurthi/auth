// NotFound.js

import React from 'react';
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const router = useNavigate();

  const onClickLogout = () => {
    localStorage.removeItem('token');
    router("/login");
  };

  return (
    <>
      <h2 style={{color: "white"}}>404 Not Found</h2>
      <button onClick={onClickLogout}>Login</button>
    </>
  );
};

export default NotFound;
