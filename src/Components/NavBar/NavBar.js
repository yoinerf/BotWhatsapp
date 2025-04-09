import React, {useContext} from "react";
import './Style.css';
import { DataContext } from "../../Context/DataProvider";
import { Link } from "react-router-dom";


export const NavBar = () => {
  
    const value = useContext(DataContext),
    [categories]=value.categories,
    filterCategory = value.filterCategory;

    return (
    
        <div className="navBar">
            {
                categories.map(category =>(
                    
                    <Link to="/dishes">
                        <button
                            className="btnCategory"
                            onClick={()=>filterCategory(category)}
                            key={category}>
                                {category}
                        </button>
                    </Link>
                ) )
            }
            <hr color="#4c525e" size="1" ></hr>
        </div>
       
    )

    // return (
    //    <div className="nav">
    //     {
            
    //         <NavBarItems/>
    //     }
        
    //     </div>
    // )
}
export default NavBar;