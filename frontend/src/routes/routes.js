import React from 'react';
import PrivateRoute from './routeWrapper';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

//Public pages
import LoginPage from '../public/Login';

//Private pages
import DashboardPage from '../private/Dashboard/Dashboard';

export default function Routes() {
    return (
        <Router>
            <Switch>
                <Route exact path='/' component={LoginPage} />
                <PrivateRoute path='/dashboard' component={DashboardPage} />
            </Switch>
        </Router>
    )
}