import React from 'react';
import Amplify from 'aws-amplify'
import { Provider } from 'react-redux'
import Portal from './components/Portal'
import PrivateRoute from './PrivateRoute'
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Login from './components/User_Login/Login';
import Modal from './components/Modal'
import store from './store/store'
import logo from './logo.svg';
import './App.css';

function App() {

  //Configures amplify for app
  Amplify.configure({
    Auth: {
      region: 'eu-west-2',
      userPoolId: 'eu-west-2_ZH6VzCGq4',
      userPoolWebClientId: '49v9r81qte5nfqihv3u3q9iiqf'
    }
  })

  //THeme creation for app
  const theme = createMuiTheme({
    palette: {
      primary: {
          main: '#ff822e',
          light: '#ffb35e',
          dark: '#c65300',
          contrastText: '#000000',
      },
      secondary: {
          main: '#18181b',
          light: '#3e3e43',
          dark: '#000000',
          contrastText: '#ffffff',
      },
  },
  })
  
  //Provider can allow global store to be passed through it which can be accessed by children within it, i.e. the entire webapp
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
    <div className="App">
      <Modal />
      <Router>
        <Switch>
          <Route path='/login' component={Login} />
          <PrivateRoute path='/' component={Portal}/>
          </Switch>
        </Router>
    </div>
    </ThemeProvider>
    </Provider>
  );
}

export default App;
