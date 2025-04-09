import React from "react";
import FrontPage from "../FrontPage/FrontPage";
import Schedule from "../Schedule/Schedule";
import AboutUs from "../AboutUs/AboutUs";
import Footer from "../Footer/Footer";
import ContactUs from "../ContactUs/ContactUs";

export const Inicio = () => {
    return (
        <div className="frontPage">
            <FrontPage/>
            <Schedule/>
            <AboutUs/>
            <ContactUs/>
            <Footer/>
        </div>
    )
}

export default Inicio;