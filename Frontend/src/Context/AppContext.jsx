
import { createContext, useContext, useEffect, useState } from "react";
import { server } from "../main.jsx";
import axios from "axios";
import toast from "react-hot-toast";


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
        return;
      }
      setUser(data)
      setIsAuth(true)
    } catch (error) {
      console.log('fetchUser error:', error);
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

    if (newPassword === oldPassword) {
      toast.error('New password must be different from old password')
      console.log('New password must be different from old password');
      setLoding(false)
      return
    }


    try {
      const { data } = await axios.post(`${server}/api/v1/profile/change/password`, {
        oldPassword,
        newPassword
      }, {
        withCredentials: true,
      })
      console.log(data)
      toast.success(data.message);
      fetchUser()
    } catch (error) {
          console.log('Failed to update password:', error);
          toast.error('Failed to change password. Please try again.');
    } finally {
      setLoding(false)
    }
  }

  async function EditProfile(name, profileImg) {
    setLoding(true);
    try {
      const formData = new FormData()
      formData.append('name', name)

      if (profileImg) {
        formData.append('profileImg', profileImg);
      }
      const { data } = await axios.post(`${server}/api/v1/profile/edit`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log(data);

      toast.success(data.message);
      setUser(data);

    } catch (error) {
      toast.error("Error While updating, please try again later")
      console.log(error.message);
      
    } finally {
      setLoding(false)
    }

  }

  function getCsrfToken() {
    // Fallback to regex method
    const match = document.cookie.match(/csrfToken=([^;]+)/);
    const token = match ? decodeURIComponent(match[1]) : null;

    return token;
  }


  async function logout(navigate, retryCount = 0, customCsrfToken = null) {
    setLoding(true)
    const csrfToken = customCsrfToken || await getCsrfToken();
    try {
      const { data } = await axios.post(`${server}/api/v1/logout`, {}, {
        withCredentials: true,
        headers: {
          'x-csrf-token': csrfToken
        }
      });
      console.log(data)
      toast.success(data.message)
      setUser(null)
      setIsAuth(false)
      if (navigate) navigate('/login')
    } catch (error) {
      if ((error.response?.data?.code === 'CSRF_TOKEN_EXPIRED' || error.response?.data?.code === 'CSRF_TOKEN_MISSING') && retryCount < 1) {
        try {
          // Refresh CSRF token and retry
          const { data: csrfData } = await axios.post(`${server}/api/v1/refresh/csrf`, {}, { withCredentials: true });
          console.log('New CSRF token for logout:', csrfData.csrfToken);
          // Retry logout with new token
          await logout(navigate, retryCount + 1, csrfData.csrfToken);
        } catch (retryError) {
          console.log('Failed to retry logout after CSRF refresh:', retryError);
          // Force logout even if CSRF fails
          setUser(null)
          setIsAuth(false)
          if (navigate) navigate('/login')
        }
      } else {
        console.log(error.response?.data?.message);
        toast.error(error.response?.data?.message || 'Logout failed')
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