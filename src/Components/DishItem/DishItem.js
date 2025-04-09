import React, {useContext} from "react";
import './Style.css';
import { DataContext } from "../../Context/DataProvider";



export const DishesItem = (props) => {

    const value = useContext(DataContext);
    const addPedido = value.addPedido

    return (
        <div className="dish">
            <img src={props.image} alt={props.title} />
            <h2 className="nameDish"> {props.title} </h2>
            <p className="price">${props.price}</p>
            <p className="descriptionDish"> {props.description} </p>
            <div className="button">
                <button className="btn" onClick={()=>addPedido(props.id)}>Agregar al pedido</button>
            </div>
    </div>
    )
}
export default DishesItem;