import React from "react";
import portada from "../../Images/ucuaimage.svg";
import './Style.css';
export const FrontPage = () => {
    return (
            <div className="inicio">
                <div className="containerCover">
                    <img className="imgCover" src={portada} alt="imagen"></img>
                </div>
            </div>
    )
}

export default FrontPage;