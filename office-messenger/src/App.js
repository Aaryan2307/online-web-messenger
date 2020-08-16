import React from 'react';
import Amplify from 'aws-amplify'
import { Provider } from 'react-redux'
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Login from './components/User_Login/Login'
import store from './store/store'
import logo from './logo.svg';
import './App.css';

function App() {

  Amplify.configure({
    Auth: {
      region: 'eu-west-2',
      userPoolId: 'eu-west-2_ZH6VzCGq4',
      userPoolWebClientId: '49v9r81qte5nfqihv3u3q9iiqf'
    }
  })

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

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
    <div className="App">
      <Router>
        <Switch>
          <Route path='/' component={Login} />
          </Switch>
        </Router>
    </div>
    </ThemeProvider>
    </Provider>
  );
}

export default App;
