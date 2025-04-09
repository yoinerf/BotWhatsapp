import {useState, useContext, useEffect} from 'react'
import { DataContext } from '../Context/DataProvider';

const useVisibilities = () => {

    const value = useContext(DataContext),
    [menu, setMenu] = value.menu,
    [visible,setVisible] = value.visible;
    const [pedido, setPedido] = value.pedido;

    const closePopUp = () =>{
        setVisible(!visible);
    }

    const sendOrders = () =>{
        showPop();
        closeOrdersToggle();
        removeOrders();
    }

    const showPop = () =>{
        setVisible(!visible);
    }

    const closeOrdersToggle = () =>{
        setMenu(!menu);
    }

    const removeOrders = () =>{
        // console.log("se remueven las ordenes")
        setPedido([])
    }

   
  return [
    menu,
    visible,
    closePopUp,
    sendOrders,
    closeOrdersToggle

  ]
}

export default useVisibilities