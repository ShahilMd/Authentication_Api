import React from 'react'
import {BrowserRouter , Route, Routes} from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import {ToastContainer} from 'react-toastify'
import Verifyotp from './pages/Verifyotp'
import { AppData } from './Context/AppContext'

function App() {
  
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/register' element={<Register/>}/>
          <Route path='/verify-otp' element={<Verifyotp/>}/>
        </Routes>
        <ToastContainer/>
      </BrowserRouter>
    </>
  )
}

export default App