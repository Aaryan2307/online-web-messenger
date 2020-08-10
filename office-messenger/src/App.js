import React from 'react';
import { Provider } from 'react-redux'
import Login from './components/Login'
import store from './store/store'
import logo from './logo.svg';
import './App.css';

function App() {

  return (
    <Provider store={store}>
    <div className="App">
      This is my react app
      <Login />
    </div>
    </Provider>
  );
}

export default App;
