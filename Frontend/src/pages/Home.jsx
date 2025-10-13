
import { User,X, Shield, LogOut,Upload   } from 'lucide-react';
import { AppData } from '../Context/AppContext';
import moment from 'moment'
import Loader from '../components/Loader';
import { useState } from 'react';

export default function Home() {

  let {user,logout,loding, lastLogin} = AppData()
  const createdAtDate = new Date(user.user.createdAt);
  const formattedDate = (date) =>moment(date).format('MMMM Do YYYY, h:mm:ss a')
  const [isEditing, setIsEditing] = useState(false);

  
  const logoutHandler = async() => {
    console.log('Logout click');
    await logout()
    
  }
  if(isEditing){
    return(
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Edit Profile</h3>
              <button
                // onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col items-center">
                <img
                  // src={tempProfilePic}
                  alt="Preview"
                  className="w-24 h-24 rounded-full mb-4 object-cover border-4 border-blue-500"
                />
                <label className="relative cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    // onChange={handleProfilePicChange}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition">
                    <Upload size={18} />
                    <span>Change Photo</span>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  // value={tempName}
                  // onChange={(e) => setTempName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  // value={email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  // onClick={handleCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  // onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      
    </div>
  );
  }else{
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
          
          <button onClick={logoutHandler} className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors">
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
                    {user.user.name.slice(0,2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-semibold text-neutral-900 mb-1"> {user.user.name}</h4>
                  <p className="text-neutral-600 mb-2"> {user.user.email}</p>
                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                     {formattedDate(createdAtDate)}
                  </div>
                </div>
                <button onClick={() => setIsEditing(!isEditing)} className="px-6 py-3 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors">
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
                  <div className="text-neutral-900 font-semibold">
                      {formattedDate(lastLogin)}
                  </div>
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
}