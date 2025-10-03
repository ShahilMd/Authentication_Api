
import { createContext, useContext, useEffect, useState } from "react";
import api from "../apiInterseptor.js";


const AppContext = createContext();

export const AppProvider = ({children}) => {

  const [loding,setLoding] = useState(false);
  const [user,setUser] = useState(null);
  const [isAuth,setIsAuth] = useState(false);

  async function fetchUser() {
    setLoding(true)
   try {
     const {data} = await api.get(`/api/v1/profile`)
     setUser(data)
     setIsAuth(true)
   } catch (error) {
    console.log(error);
    
   }finally{
    setLoding(false)
   }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return <AppContext.Provider value={{user,setIsAuth,setUser,isAuth,loding}}>{children}</AppContext.Provider>
}

export const AppData =() => {
  const context = useContext(AppContext)
  if(!context){
    throw new Error('AppData must be use in app provider')
  }
  return context
}