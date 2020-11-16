import { Auth } from 'aws-amplify';
import React, { Component } from 'react';
import { Redirect, Route, useHistory } from 'react-router-dom';

export default class ProtectedRoute extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ready: false,
            authenticated: false
        };
        Auth.currentUserInfo()
        .then((user) => {
            console.log('logged in', user)
            if(user){
                console.log('user', user)
                this.setState({authenticated: true})
                this.setState({ready: true})
            }
            else{
                this.setState({authenticated: false})
                this.setState({ready: true})
            }
        })
        .catch((err) => {
            console.log('USER NOT LOGGED IN', err)
            this.setState({ready: true})
            this.setState({authenticated: false})
        })  
    }
    render() {
        const { component: Component, ...props } = this.props;
        console.log('auth', this.state.authenticated)
        console.log('ready', this.state.ready)
        if (this.state.ready) {
            return (
                this.state.authenticated ?
                <Route
                    {...props}
                    render={(props) =>
                            <Component {...props} />
                    }
                /> : <Redirect to='/login' />
            );
        }
        return null;
    }
}
