import React, { useContext } from "react";
import './Style.css';
import { DataContext } from "../../Context/DataProvider";
import useOrder from "../../hooks/useOrder";
import useVisibilities from "../../hooks/useVisibilities";


export const Order = () => {
    const value = useContext(DataContext),
    [pedido] = value.pedido,
    [total, upAmount, downAmount, removeDish] = useOrder();
    const [menu, visible, closePopUp, sendOrders, closeOrdersToggle] = useVisibilities();

    const showOrders = menu ? "orders show" : "orders",
    showOrder = menu ? "order show" : "order",
    showInfo = pedido.length === 0 ? "info show" : "info",
    showPayment = pedido.length !== 0 ? "order_footer show" : "order_footer";
    
    return(
        <div className={showOrders}>
            <div className={showOrder}>
                
                <div className="order_close" onClick={closeOrdersToggle}>
                    <box-icon name='x'></box-icon>
                </div>

                <h2>Lista de pedidos</h2>
                <div className={showInfo}>
                    <h2>¡Ups! nada por aqui.</h2>
                </div>
                
                <div className="order_center">
                {
                    pedido.map((dish)=>(
                        <div className="order_item" key={dish.key}>
                            <div>
                                <img src={dish.image} alt="item"/>
                            </div>
                            <div>
                                <h3>{dish.title}</h3>
                                <p className="price">${dish.price}</p>
                            </div>
                            <div className="countBtn">
                                <box-icon name='chevron-up' onClick={()=> upAmount(dish.id)} ></box-icon>
                                <p className="count">{dish.count}</p>
                                <box-icon name='chevron-down' onClick={()=> downAmount(dish.id)} ></box-icon>
                            </div>
                            <div className="order_remove" onClick={() => removeDish(dish.id)}>
                                <box-icon name='trash-alt'></box-icon>                       
                            </div>
                        </div>
                    ))
                }
                </div>

                <div className={showPayment}>
                    <h3>Total: ${total}</h3>
                    <button className="btn" onClick={sendOrders} >Continuar</button>
                </div>
            </div>
            
        </div>
    )
}