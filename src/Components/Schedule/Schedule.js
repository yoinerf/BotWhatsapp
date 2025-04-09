import React from "react";
import local from "../../Images/local.png";
import local2 from "../../Images/local2.png";
import './Style.css';
export const Schedule = () => {
    return (
        
            <div className="containerHours">
                
                    <div className="hours">
                        <h3>Puntos Físicos</h3>
                        <h1>Horarios de atención</h1>
                        <p><b>Lunes - jueves:</b> 9:00 am - 8:00 pm .</p>
                        <p><b>Viernes - domingo:</b> 9:00 am - 8:00 pm .</p>
                        <p><b>Festivos : </b> 3:00 pm - 8:00 pm .</p>
                    </div>
                    <div className="imagesHours">
                        <img className="imgLocal" src={local} alt="imagen local"></img>
                        <img className="imgLocal" src={local2} alt="imagen local"></img>
                    </div>
            </div>
      
    )
}

export default Schedule;