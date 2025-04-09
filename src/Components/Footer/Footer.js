import React from "react";
import logo from "../../Images/ucua.png";
import './Style.css';
import {Link} from 'react-router-dom';

export const Footer = () => {
    return (
        <footer>
            <div className="footer">
            <hr className="hr" color="#4c525e" size="1" ></hr>
                <div>
                    <Link to="/"><img src={logo} alt="logo"></img></Link>
                </div>
                
                <div className="derechos">
                    <h1>© 2023 - Developed by Yoiner Idrobo.</h1>
                </div>
               
            </div>

        </footer>
    )
}
export default Footer;
