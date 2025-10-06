import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import { server } from '../main';
import { toast } from 'react-toastify';
import { AppData } from '../Context/AppContext';
import Loader from '../components/Loader';

function Verify() {
  const { token } = useParams();
  const navigate = useNavigate();
  const requested = useRef(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;

    const verify = async () => {
      try {
        const { data } = await axios.post(`${server}/api/v1/register/verify/${token}`, {}, { withCredentials: true });
        toast.success(data.message);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Verification failed");
      } finally {
        setLoading(false);
      }
    };

    verify();
    navigate('/login');
  }, [token]);

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100 px-4">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 max-w-md w-full p-8 flex flex-col items-center">
        <div className="mb-6 flex items-center justify-center w-20 h-20 rounded-full bg-indigo-100">
          <ShieldCheck className="w-10 h-10 text-indigo-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Verifying your email</h1>
        <p className="text-slate-600 text-center mb-6">
          Please wait while we verify your account.<br />
          This should only take a moment.
        </p>
        <div className="w-full flex justify-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
        <div className="text-sm text-slate-500 text-center">
          If you are not redirected automatically, <br />
          <button
            onClick={() => navigate('/login')}
            className="mt-2 text-indigo-600 font-medium hover:text-indigo-700 transition-colors underline"
          >
            Click here to login
          </button>
        </div>
      </div>
    </div>
  );
}

export default Verify;