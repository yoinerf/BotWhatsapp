import './App.css';
import React, { useEffect } from 'react';
import Header from './Components/Header/Header';
import Main from './Router/Main';
import NavBar from './Components/NavBar/NavBar';
import 'boxicons';
import { DataProvider } from './Context/DataProvider';
import { BrowserRouter as Router} from 'react-router-dom';
import { Order } from './Components/Order/Order';
import PopUp from './Components/PopUp/PopUp';



function App() {
  useEffect(()=>{
    document.title = "FUSION Restaurant"
  })
  return (
    <DataProvider>
      <div className="App">
        <Router>
          <Header/>
          <Order/>
          <PopUp/>
          <NavBar/>
          <Main/>
        </Router>
        
      </div>
    </DataProvider>
  );
}

export default App;
