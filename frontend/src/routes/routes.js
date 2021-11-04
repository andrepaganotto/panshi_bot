import React from 'react';
import PrivateRoute from './routeWrapper';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

//Public pages
import LoginPage from '../public/Login';

//Private pages
import DashboardPage from '../private/Dashboard/Dashboard';
import SettingsPage from '../private/Settings/Settings';
import AutomationsPage from '../private/Automations/Automations';

export default function Routes() {
    return (
        <Router>
            <Switch>
                <Route exact path='/' component={LoginPage} />
                <PrivateRoute path='/dashboard' component={DashboardPage} />
                <PrivateRoute path='/settings' component={SettingsPage} />
                <PrivateRoute path='/automations' component={AutomationsPage} />
            </Switch>
        </Router>
    )
}