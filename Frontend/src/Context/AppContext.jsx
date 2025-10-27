
import { createContext, useContext, useEffect, useState } from "react";
import { server } from "../main.jsx";
import axios from "axios";
import  toast  from "react-hot-toast";


const AppContext = createContext();

export const AppProvider = ({ children }) => {

  const [loding, setLoding] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [lastLogin, setLastLogin] = useState(localStorage.getItem('lastLogin') || '');

  async function fetchUser() {
    setLoding(true)
    try {
      const { data } = await axios.get(`${server}/api/v1/profile`, {
        withCredentials: true
      })
      if (!data) {
        setUser(null)
        setIsAuth(false)
      }
      setUser(data)
      setIsAuth(true)
    } catch (error) {
      console.log(error);
      setIsAuth(false)
      setUser(null)
    } finally {
      setLoding(false)
    }
  }

  async function ChangePassword(newPass, oldPass) {
    setLoding(true)
    const newPassword = newPass.toString()
    const oldPassword = oldPass.toString()
    const csrfToken = getCsrfToken();
    if (newPassword === oldPassword) {
      toast.error('New password must be different from old password')
      console.log('New password must be differnt from old Password');
      setLoding(false)
      return
    }

    try {
      const {data} = await axios.post(`${server}/api/v1/profile/change/password`, {
        oldPassword,
        newPassword
      }, {
        withCredentials: true,
        headers: {
          'x-csrf-token': csrfToken,
        }
      })
      console.log(data)
      toast.success(data.message);
      fetchUser()
    } catch (error) {
      if (error.response?.data?.code === 'CSRF_TOKEN_EXPIRED' || error.response?.data?.code === 'CSRF_TOKEN_MISSING') {
        try {
          // Refresh CSRF token and retry
          await axios.post(`${server}/api/v1/refresh/csrf`, {}, { withCredentials: true });
          // Retry change password once
          await ChangePassword(newPass, oldPass);
        } catch (retryError) {
          console.log('Failed to retry after CSRF refresh:', retryError);
          toast.error('Failed to change password. Please try again.');
        }
      } else {
        console.log(error.response?.data?.message);
        toast.error(error.response?.data?.message || 'Failed to change password')
      }
    } finally {
      setLoding(false)
    }
  }

  async function EditProfile(name, profileImg) {
    setLoding(true);
    const csrfToken = await getCsrfToken();

    try {
      const formData = new FormData();
      formData.append('name', name);
      if (profileImg) {
        formData.append('profileImg', profileImg); // send file, not base64 string
      }
      const { data } = await axios.post(`${server}/api/v1/profile/edit`, formData, {
        withCredentials: true,
        headers: {
          'x-csrf-token': csrfToken,
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log(data)
      toast.success(data.message);
      setUser(data);
    } catch (error) {
      console.log(error);
      if (error.response?.data?.code === 'CSRF_TOKEN_EXPIRED' || error.response?.data?.code === 'CSRF_TOKEN_MISSING') {
        // Refresh CSRF token and retry
        await axios.post(`${server}/api/v1/refresh/csrf`, {}, { withCredentials: true });
        // Retry logout
        await EditProfile();
      } else {
        console.log(error.response.data.message);
        toast(error.response.data.message)
      }
    } finally {
      setLoding(false)
    }

  }

  function getCsrfToken() {
    const match = document.cookie.match(/csrfToken=([^;]+)/);
    return match ? match[1] : null;
  }

  async function logout(navigate) {
    setLoding(true)
    const csrfToken = getCsrfToken();
    try {
      const {data} = await axios.post(`${server}/api/v1/logout`, {}, {
        withCredentials: true,
        headers: {
          'x-csrf-token': csrfToken
        }
      });
      console.log(data)
      toast.success(data.message)
      setUser(null)
      setIsAuth(false)
      navigate('/login')
    } catch (error) {
      if (error.response?.data?.code === 'CSRF_TOKEN_EXPIRED' || error.response?.data?.code === 'CSRF_TOKEN_MISSING') {
        // Refresh CSRF token and retry
        await axios.post(`${server}/api/v1/refresh/csrf`, {}, { withCredentials: true });
        // Retry logout
        await logout();
      } else {
        console.log(error.response.data.message);
        toast(error.response.data.message)
      }
    } finally {
      setLoding(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return <AppContext.Provider value={{ user, setIsAuth, setUser, isAuth, loding, logout, fetchUser, setLastLogin, lastLogin, EditProfile, ChangePassword }}>{children}</AppContext.Provider>
}

export const AppData = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('AppData must be use in app provider')
  }
  return context
}