import {useState, useContext, useEffect} from 'react'
import { DataContext } from '../Context/DataProvider';

const useOrder = () => {
  const [total, setTotal] = useState(0);
  const value = useContext(DataContext);
  const [pedido, setPedido] = value.pedido;

    useEffect(() =>{
        const getTotal = () =>{
            const res = pedido.reduce((prev,item) => {
                return prev + (item.price * item.count);
            },0)
        setTotal(res)
        }
        getTotal()
    },[pedido])

    const upAmount = (id) =>{
        pedido.forEach(item=>{
            if(item.id === id ){
                item.count +=1;
            }
            setPedido([...pedido])
        })
    }

    const downAmount = (id) =>{
        pedido.forEach(item=>{
            if(item.id === id){
                item.count === 1 ? item.count = 1 : item.count -=1;
            }
            setPedido([...pedido])
        })
    }

    const removeDish = (id) => {
        // if(window.confirm("¿Desea quitar el producto?")){
            pedido.forEach((item, index) => {
                if(item.id === id){
                    item.count = 1;
                    pedido.splice(index,1)
                }
            })
            setPedido([...pedido])
        // } 
    } 

  return [
    total,
    upAmount,
    downAmount,
    removeDish
  ]
}

export default useOrder