import React, {useContext} from "react";
import fusion from "../../Images/ucua.png";
import './Style.css';
import {Link} from 'react-router-dom';
import { DataContext} from "../../Context/DataProvider";
import { SearchBar } from "../SearchBar/SearchBar";

export const Header = () => {
    const value = useContext(DataContext),
    [menu,setMenu]=value.menu,
    [pedido]=value.pedido;

    const showOrderToggle = () =>{
        // console.log("se ejecuto",menu)
        setMenu(!menu)
    }

    return (
        <header>
            <div className="logo">
                <Link to="/">
                    <img src={fusion} alt="fusion" /></Link>
            </div>
            
            <div className="container">

               <SearchBar/>

                <div className="orders_icon" onClick={showOrderToggle}>
                    <box-icon type='solid' name='food-menu'></box-icon>
                    <span className="item">{pedido.length}</span>
                </div>
            </div>
        </header>
    )
}
export default Header;