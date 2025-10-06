
import { User, Shield, Activity, FileText, TrendingUp, Clock, LogOut, ChevronRight } from 'lucide-react';
import { AppData } from '../Context/AppContext';
import moment from 'moment'
import Loader from '../components/Loader';

export default function Home() {

  let {user,logout,loding} = AppData()
  const createdAtDate = new Date(user.user.createdAt);
  const formattedDate = moment(createdAtDate).format('MMMM Do YYYY, h:mm:ss a');

  
  const logoutHandler = async() => {
    console.log('Logout click');
    await logout()
    
  }
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Modern Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-900 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">SecureAuth</h1>
              <p className="text-xs text-neutral-500">Welcome back, {user.user.name}</p>
            </div>
          </div>
          
          <button onClick={logoutHandler} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors">
            <LogOut className="w-4 h-4" />
            {loding ? <Loader/> : 'Logout'}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-neutral-900 mb-3">Welcome back,  {user.user.name} 👋</h2>
          <p className="text-lg text-neutral-600">Here's your account overview and recent activity</p>
        </div>


        <div className=" w-full gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Overview */}
            <div className="bg-white rounded-xl border border-neutral-200 p-8">
              <h3 className="text-xl font-semibold text-neutral-900 mb-6">Your Profile</h3>
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-neutral-800 to-neutral-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                  JD
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-semibold text-neutral-900 mb-1"> {user.user.name}</h4>
                  <p className="text-neutral-600 mb-2"> {user.user.email}</p>
                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                     {formattedDate}
                  </div>
                </div>
                <button className="px-6 py-3 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors">
                  Edit Profile
                </button>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-neutral-200">
                <div>
                  <div className="text-sm text-neutral-500 mb-2">Account Type</div>
                  <div className="text-neutral-900 font-semibold">Premium User</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-500 mb-2">Last Login</div>
                  <div className="text-neutral-900 font-semibold">Today at 9:24 AM</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-500 mb-2">Two-Factor Auth</div>
                  <div className="text-green-600 font-semibold">Enabled</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-500 mb-2">Security Score</div>
                  <div className="text-neutral-900 font-semibold">Excellent</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}