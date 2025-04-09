import React from "react";
import aboutUs from "../../Images/AboutUs.png";
import './Style.css';
export const AboutUs = () => {
    return (
        
            <div className="containerAbout">
                <div className="about">
                    <img className="imgAbout" src={aboutUs} alt="imagen sobre nosotros"></img>
                    
                    <h2 className="aboutUs">Sobre Nosotros</h2>
                    <p className="descriptionUs">En nuestro restaurante, nos enorgullece ofrecer una experiencia gastronómica única que combina sabores e ingredientes de todo el mundo. 
                        Nuestros chefs expertos se inspiran en las culturas culinarias más diversas para crear platos de alta calidad, con sabores y texturas que 
                        deleitarán tus sentidos. Desde platos exóticos de Asia hasta delicias europeas y sudamericanas, nuestra carta ofrece una amplia variedad 
                        de opciones para satisfacer todos los gustos. Además, nuestro servicio de bar te ofrece una selección de bebidas artesanales y cócteles
                        que complementan perfectamente nuestros platos. Ven a visitarnos y disfruta de una experiencia gastronómica inolvidable en nuestro acogedor 
                        y elegante ambiente.</p>
                </div>
                
            </div>
    )
}

export default AboutUs;