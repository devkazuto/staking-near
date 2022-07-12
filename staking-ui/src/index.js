import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// import FetchingData from './pages/FetchingData';
import App from './App';
// import CreateToken from './pages/CreateToken';
import reportWebVitals from './reportWebVitals';
import CreateToken from './pages/CreateToken';
import { getWalletAccount } from './lib/contract';

function doWork(){
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
      {/* <CreateToken /> */}
      {/* <FetchingData /> */}
    </React.StrictMode>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

getWalletAccount().then(doWork).catch(console.error);

reportWebVitals();
