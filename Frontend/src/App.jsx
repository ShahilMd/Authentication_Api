import React from 'react'
import {BrowserRouter , Route, Routes} from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import {ToastContainer} from 'react-toastify'
import Verifyotp from './pages/Verifyotp'
import { AppData } from './Context/AppContext'
import Dashboard from './pages/Dashboard'
import Loader from './components/Loader'
import Verify from './pages/Verify'
import EditProfile from "./pages/EditProfile.jsx";
import CenterLoader from "./components/CenterLoader.jsx";


function App() {
  const {isAuth,loding} = AppData()
  
  return (
    <>
    { loding ? (
      <CenterLoader/>
    ) : ( 
      <BrowserRouter>
        <Routes>
          <Route path='/' element= {isAuth ? <Home/> : <Login/>}/>
          <Route path='/login' element={isAuth? <Home/>:<Login/>}/>
          <Route path='/register' element={isAuth? <Home/>:<Register/>}/>
          <Route path='/edit-profile' element={isAuth? <EditProfile/>:<Login/>}/>
          <Route path='/token/:token' element={isAuth? <Home/>:<Verify/>}/>
          <Route path='/verify-otp' element={isAuth? <Home/>:<Verifyotp/>}/>
          <Route path='/dashboard' element={isAuth ? <Dashboard/> : <Login/>}/>
        </Routes>
          <ToastContainer />
      </BrowserRouter>)
    }
    </>
  )
}

export default App