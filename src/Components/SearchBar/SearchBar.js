import React from 'react'
import './Style.css'

export const SearchBar = () => {
  return (
    <div className="search">
        <input input placeholder="Buscar por nombre"
            type="text"
            className="textField"
            name="busqueda"
        />
    <box-icon name='search' color="white"  ></box-icon>
    </div>
  )
}

export default SearchBar;
