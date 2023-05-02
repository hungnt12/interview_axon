import React, {Component} from 'react';
import {Button} from "@mui/material";
import {Route, Routes, Navigate, useLocation, useHistory} from "react-router-dom";
import Layouts from "./layouts";
import Error from "./layout/Error";

const MainRouter = props => {
    let location = useLocation();


    return (
        <Routes>
            <Route path="/" element={<Layouts.Layout/>}>
                <Route index exact={true} element={<Layouts.Index/>}/>
            </Route>
            <Route path='' exact={false} element={Error}/>
        </Routes>
    );
}

export default MainRouter;

const AuthVerify = props => {
    let token = localStorage.getItem("tk");
    let location = useLocation();
    if (token) {
        return props?.children
    } else {
        return <Navigate to="/login" state={{from: location}} replace/>;
    }
}

