import React, { useContext } from 'react'
import useVisibilities from '../../hooks/useVisibilities';
import './Style.css';


export const PopUp = () => {
    const [menu, visible, closePopUp, sendOrders, closeOrdersToggle] = useVisibilities();
    
    const showModal = visible ? "overlay show" : "overlay";
  return (
    <div className={showModal}>
        <div className='popup'>
            <div href='' id="close-popup" onClick={closePopUp} className='close-popup'>
                <box-icon name='x'></box-icon>
            </div>
                
            <h2 className='animate'>Orden enviada correctamente</h2>
            <box-icon className="i-check" name='check-circle' type='solid' color='#0bc52b' ></box-icon>
            
        </div>
    </div>
  )
}

export default PopUp
