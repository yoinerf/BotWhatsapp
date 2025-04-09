import React from "react";
import {  BrowserRouter, Routes, Route, Link } from "react-router-dom";
import DishesList from "../Components/Dishes/Dishes";
import Start from "../Components/Start/Index";



export const Main = () => {
    return (
        <section>
            <Routes>
                <Route exact path="/" element={<Start/>}/>
                <Route exact path="/dishes" element={<DishesList/>}/>
            </Routes>
        </section>
       
    )
}

export default Main;