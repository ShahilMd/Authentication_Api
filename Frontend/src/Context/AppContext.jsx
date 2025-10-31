
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
      console.log('fetchUser response:', data);
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

  async function ChangePassword(newPass, oldPass, retryCount = 0, customCsrfToken = null) {
    setLoding(true)
    const newPassword = newPass.toString()
    const oldPassword = oldPass.toString()
    const csrfToken = customCsrfToken || getCsrfToken();

    if (newPassword === oldPassword) {
      toast.error('New password must be different from old password')
      console.log('New password must be different from old password');
      setLoding(false)
      return
    }

    if (!csrfToken) {
      toast.error('No CSRF token available. Please refresh the page.');
      setLoding(false)
      return
    }

    try {
      const { data } = await axios.post(`${server}/api/v1/profile/change/password`, {
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
      if ((error.response?.data?.code === 'CSRF_TOKEN_EXPIRED' || error.response?.data?.code === 'CSRF_TOKEN_MISSING') && retryCount < 1) {
        try {
          // Refresh CSRF token and retry
          const { data: csrfData } = await axios.post(`${server}/api/v1/refresh/csrf`, {}, { withCredentials: true });
          console.log('New CSRF token for password change:', csrfData.csrfToken);
          // Retry change password with new token
          await ChangePassword(newPass, oldPass, retryCount + 1, csrfData.csrfToken);
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

  async function EditProfile(name, profileImg, retryCount = 0, customCsrfToken = null) {
    setLoding(true);
    try {
      const csrfToken = customCsrfToken || getCsrfToken()
      console.log(csrfToken);

      if (!csrfToken) {
        toast.error('No CSRF token available. Please refresh the page.');
        return;
      }
      const formData = new FormData()
      formData.append('name',name)

      if(profileImg){
          formData.append('profileImg', profileImg);
      }
      const { data } = await axios.post(`${server}/api/v1/profile/edit`, formData, {
        withCredentials: true,
        headers: {
          'x-csrf-token': csrfToken,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success(data.message);
      setUser(data);

    } catch (error) {
          if ((error.response?.data?.code === 'CSRF_TOKEN_EXPIRED' || error.response?.data?.code === 'CSRF_TOKEN_MISSING') && retryCount < 1) {
        try {
          console.log('Refreshing CSRF token...');
          const { data: csrfData } = await axios.post(`${server}/api/v1/refresh/csrf`, {}, { withCredentials: true });
          console.log('New CSRF token received:', csrfData.csrfToken);

          // Use the token directly from the response instead of waiting for cookie
          await EditProfile(name, profileImg, retryCount + 1, csrfData.csrfToken);
        } catch (retryError) {
          console.error('Failed to retry after CSRF refresh:', retryError);
          toast.error('Failed to update profile after token refresh. Please try again.');
        }
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile';
        console.error('EditProfile final error:', errorMessage);
        toast.error(errorMessage);
      }
    }finally {
      setLoding(false)
    }

  }

  function getCsrfToken() {
    const match = document.cookie.match(/csrfToken=([^;]+)/);
    return match ? match[1] : null;
  }

  async function logout(navigate, retryCount = 0, customCsrfToken = null) {
    setLoding(true)
    const csrfToken = customCsrfToken || getCsrfToken();
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