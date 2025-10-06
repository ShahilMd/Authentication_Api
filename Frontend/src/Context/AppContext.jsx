
import { createContext, useContext, useEffect, useState } from "react";
import { server } from "../main.jsx";
import axios from "axios";
import { toast } from "react-toastify";


const AppContext = createContext();

export const AppProvider = ({children}) => {

  const [loding,setLoding] = useState(false);
  const [user,setUser] = useState(null);
  const [isAuth,setIsAuth] = useState(false);

  async function fetchUser() {
    setLoding(true)
   try {
     const {data} = await axios.get(`${server}/api/v1/profile`,{
      withCredentials:true
     })
     if(!data){
      setUser(null)
      setIsAuth(false)
     }
     setUser(data)
     setIsAuth(true)
   } catch (error) {
    console.log(error);
    setIsAuth(false)
    setUser(null)
   }finally{
    setLoding(false)
   }
  }

  async function logout() { 
    setLoding(true)
    try {
      const data = await axios.post(`${server}/api/v1/logout`,{},{withCredentials:true})
      toast.success(data.message)
      setUser(null)
      setIsAuth(false)
    } catch (error) {
      console.log(error.response.data.message);
      toast(error.response.data.message)
    }finally{
      setLoding(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return <AppContext.Provider value={{user,setIsAuth,setUser,isAuth,loding,logout,fetchUser}}>{children}</AppContext.Provider>
}

export const AppData =() => {
  const context = useContext(AppContext)
  if(!context){
    throw new Error('AppData must be use in app provider')
  }
  return context
}