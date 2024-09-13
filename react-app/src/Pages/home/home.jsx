import React from 'react'
import Header from '../../Components/header/header';


const Home =()=> {
   
    const headerStyle={
      backgroundColor:"white",
    }

  return (
    <div >
        <Header style={headerStyle} logoFlag={false}/>
        <div style={{display: "flex",flexDirection:"row",flexWrap:"wrap",alignItems:"center"}}>
        </div>
        <div>
        </div>
    </div>
  )
}

export default Home;