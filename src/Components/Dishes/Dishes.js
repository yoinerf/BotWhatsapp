import React, { useContext } from "react";
import DishItem from "../DishItem/DishItem";
import './Style.css';
import { DataContext } from "../../Context/DataProvider";

export const DishesList = () => {
    const value = useContext(DataContext);
    const [dishes] = value.dishes;
    
    return (
        <>
            <h1 className="title">Nuestros productos</h1>
            <div className="dishes">
                {
                    dishes.map(dish => (
                        <DishItem
                            key={dish.id}
                            id={dish.id}
                            title={dish.title}
                            description={dish.description}
                            price={dish.price}
                            image={dish.image}
                            category={dish.category}
                            count={dish.count}
                        />
                    ))
                }
            </div>
        </>
    )
}
export default DishesList;