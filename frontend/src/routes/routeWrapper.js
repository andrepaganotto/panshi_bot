import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import authService from '../services/AuthService';

export default function RouteWrapper({ component: Component, ...rest }) {
    return (
        <Route
            {...rest}
            render={() =>
                authService.isAuthenticated()
                    ? <Component />
                    : <Redirect to='/' />
            }
        />
    )
}