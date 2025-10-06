import React, { useState, useRef, useEffect } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import {server} from "../main.jsx";
import {toast} from "react-toastify";
import Loader from "../components/Loader.jsx";
import { AppData } from '../Context/AppContext.jsx';

export default function Verifyotp() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [email, setEmail] = useState('');
  const [btnLoading , setBtnLoading] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const { fetchUser } = AppData();

  useEffect(() => {
      const email = localStorage.getItem('email');
      setEmail(email);
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    if (pastedData.every(char => !isNaN(char))) {
      const newOtp = [...otp];
      pastedData.forEach((char, idx) => {
        if (idx < 6) newOtp[idx] = char;
      });
      setOtp(newOtp);
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  const handleResend =async () => {
    if (canResend) {
      setTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      
      try {
        const {data} = await axios.post(`${server}/api/v1/login/verify/resend/otp`,{
            email
        },{
            withCredentials: true,
        })
        toast.success(data.message)
      } catch (error) {
        console.error(error);
        toast.error(error.response.data.message);
      }
    }
  };

  const handleVerify =async (e) => {
    e.preventDefault();
    setBtnLoading(true);
    const otpCode = otp.join('');
    if (otpCode.length === 6) {
      console.log('Verifying OTP:', otpCode);
    }
    try {

        const {data} = await axios.post(`${server}/api/v1/login/verify/otp`,{
            email,
            otp:otpCode
        },{
            withCredentials: true,
        })
        toast.success(data.message)
        localStorage.clear('email')
        await fetchUser()
        navigate('/')
    } catch (error) {
        console.error(error);
        toast.error(error.response.data.message);
    }finally {
        setBtnLoading(false);
    }

  };

  const isComplete = otp.every(digit => digit !== '');

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <form  className="w-full max-w-md">
        {/* Back Button */}
        <button onClick={() => navigate('/login')} className="flex items-center text-slate-600 hover:text-slate-900 transition-colors mb-8">
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">Back to login</span>
        </button>

        {/* OTP Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center">
              <Mail className="w-8 h-8 text-indigo-600" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Verify your email</h1>
            <p className="text-slate-600 text-sm">
              We've sent a 6-digit code to
              <br />
              <span className="font-medium text-slate-900">{email}</span>
            </p>
          </div>

          {/* OTP Input */}
          <div className="mb-8">
            <div className="flex justify-center gap-3 mb-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-14 text-center text-xl font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              ))}
            </div>
          </div>

          {/* Verify Button */}
          <button
            disabled={!isComplete || btnLoading}
            onClick={(e) => handleVerify(e)}
            className={` ${btnLoading ? 'opacity-50 cursor-not-allowed' : ''} w-full py-3 rounded-xl font-medium transition-all shadow-sm ${
              isComplete
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-98'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
              {btnLoading ? <Loader/> : 'Verify email'}
          </button>

          {/* Resend Section */}
          <div className="mt-6 text-center">
            {canResend ? (
              <button
                onClick={handleResend}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Resend code
              </button>
            ) : (
              <p className="text-sm text-slate-600">
                Didn't receive the code?{' '}
                <span className="font-medium text-slate-900">
                  Resend in {timer}s
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Help Text */}
        <p className="text-center mt-6 text-sm text-slate-600">
          Having trouble?{' '}
          <a href="#" className="font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
            Contact support
          </a>
        </p>
      </form>
    </div>
  );
}