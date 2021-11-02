import React from 'react';
import ReactDOM from 'react-dom';
import Routes from './routes/routes.js';

import "./scss/volt.scss";
import "@fortawesome/fontawesome-free/css/all.css";

ReactDOM.render(
  <React.StrictMode>
    <Routes />
  </React.StrictMode>,
  document.getElementById('root')
);
