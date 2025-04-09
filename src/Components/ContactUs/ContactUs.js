import React from "react";
import './Style.css';
import {Link} from 'react-router-dom';

export const ContactUs = () => {
    return (
        
            <div className="containerContact">
                
                    <div className="contact">
                        <h3 className="contactUs">Contactanos</h3>
                        <h3 className="contactMedia">Medios de contacto</h3>
                        <p><b>Whatsapp :</b> +57 3124569874 .</p>
                        <p><b>Teléfono : </b> +57 3124569874 - 8 4356984 .</p>
                        <p><b>Correo : </b> fusionrestaurantebar@gmail.com</p>
                    </div>
                    <div className="containerSocial">
                        <h2>SIGUENOS</h2>
                        <div className="social">
                            <Link to="#" className="facebok"><box-icon   type='logo' name='facebook'></box-icon></Link>
                            <Link to="#" className="instagram"><box-icon  name='instagram' type='logo' ></box-icon></Link>
                            <Link to="#" className="twitter"><box-icon  name='twitter' type='logo' ></box-icon></Link>
                            <Link to="#"  className="whatsapp"><box-icon name='whatsapp' type='logo' ></box-icon></Link>
                        </div>
                     </div>
                   
            </div>
            
      
    )
}

export default ContactUs;