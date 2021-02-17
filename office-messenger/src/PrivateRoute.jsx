import { Auth } from 'aws-amplify';
import React, { Component } from 'react';
import { Redirect, Route, useHistory } from 'react-router-dom';

export default class ProtectedRoute extends Component {
    //constructor, initialises state, this is another way of executing the useState() functionality
    constructor(props) {
        //calls the parent class coponent
        super(props);
        this.state = {
            //Checks if user is ready or authenticated. At first these are both assumedto be false until they are verified to do so
            ready: false,
            authenticated: false
        };
        //Gets current user information about whoever might be logged in... Returns a promise
        Auth.currentUserInfo()
        .then((user) => {
            console.log('logged in', user)
            //DOes a suer exist?
            if(user){
                //If there is the user is authenticated and ready to have a web session in the app
                console.log('user', user)
                this.setState({authenticated: true})
                this.setState({ready: true})
            }
            else{
                //The user will be ready however they are not authenitcated to access this specific page
                this.setState({authenticated: false})
                this.setState({ready: true})
            }
        })
        .catch((err) => {
            //If there is an error in getting any user info, it will also set authenitcated to calse
            console.log('USER NOT LOGGED IN', err)
            this.setState({ready: true})
            this.setState({authenticated: false})
        })  
    }
    render() {
        //What needs to be rendered for this component
        //TIt has no front end, but it will generate the appropriate routes, which is why it is deigned as a component in a class
        const { component: Component, ...props } = this.props;
        console.log('auth', this.state.authenticated)
        console.log('ready', this.state.ready)
        if (this.state.ready) {
            return (
                //Ternery statement to check if user is authenticated which will generate the route passed into this component as a "prop"
                this.state.authenticated ?
                <Route
                    {...props}
                    render={(props) =>
                            <Component {...props} />
                    }
                    //Otherwise we redirect the user to login
                /> : <Redirect to='/login' />
            );
        }
        return null;
    }
}
