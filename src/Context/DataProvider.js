import React, { createContext, useState, useEffect } from "react";
import Data from '../Data.js';

export const DataContext = createContext();

export const DataProvider=(props) => {
    const [dishes, setDishes] = useState([]),
    [menu,setMenu] = useState(false),
    [visible,setVisible] = useState(false),
    [pedido, setPedido] = useState([]);

    const allCategories = ['Catalogo',...new Set(Data.items.map(item => item.category))];
    const [categories]  = useState(allCategories);

    useEffect(()=>{
        const dish = Data.items
        if(dish){
            setDishes(dish)
        }
        else{
            setDishes([])
        }
    },[])

    
    const filterCategory = (category) =>{
        // console.log(category)
        const filterData = Data.items.filter(items => items.category === category)
        if(category !== "Catalogo"){
            setDishes(filterData)
        }
        else{
            setDishes(Data.items)
            //console.log("si NO se filtra",Data.items)
        }
        //console.log("si se filtra",filterData)
    }

    const addPedido = (id)=>{
        const check = pedido.every(item =>{
            return item.id !== id;
        })
        if(check){
            const data=dishes.filter(dish=>{
                return dish.id===id
            })
            setPedido([...pedido, ...data])
        }
        else{
            alert("Este plato ya se encuentra en el listado de pedidos.")
        }
    }

    useEffect(() =>{
        const dataPedido = JSON.parse(localStorage.getItem('dataPedido'))
        if(dataPedido){
            setPedido(dataPedido)
        }
    }, [])
    
    
    const value = {
        dishes:[dishes],
        menu:[menu,setMenu],
        visible:[visible,setVisible],
        addPedido:addPedido,
        filterCategory:filterCategory,
        pedido: [pedido, setPedido],
        categories : [categories],
    }
    
    return (
        <DataContext.Provider value = {value} >
            {props.children}
        </DataContext.Provider>
    )
}
export default DataProvider;