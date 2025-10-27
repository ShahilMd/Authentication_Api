import React, { useState } from 'react';
import {AppData} from "../Context/AppContext.jsx";
import {ArrowLeft} from "lucide-react";
import {useNavigate} from "react-router-dom";
import Loader from "../components/Loader.jsx";
import CenterLoader from "../components/CenterLoader.jsx";

const EditProfile = () => {
    // Initial state for user data (in a real app, fetch this from an API or context)
    const {user,loding,EditProfile,ChangePassword} = AppData()
    const [name, setName] = useState(user.user.name); // Editable name
    const [profileImage, setProfileImage] = useState('https://via.placeholder.com/150'); // Initial image URL
    const [newImage, setNewImage] = useState(null); // For the new selected image file

    const navigate = useNavigate();
    // States for password change
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // Handler for changing the profile image
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewImage(file); // Store the file for upload
            // Create a preview of the image
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result); // Update state for preview
            };
            reader.readAsDataURL(file);
        }
    };

    // Handler for updating profile (name and image)
    const handleUpdateProfile =async () => {
        console.log(`start updating profile`);
        
        await EditProfile(name,newImage)
        navigate('/')
        console.log('navigate to home');
        
    };

    // Handler for changing password
    const handleChangePassword =async () => {
         
        if (oldPassword && newPassword) {
            console.log('Changing password...');
            console.log('Old Password:', oldPassword);
            console.log('New Password:', newPassword);
            await ChangePassword(newPassword,oldPassword)
            setOldPassword(''); // Clear inputs
            setNewPassword('');
        } else {
            alert('Please enter both old and new passwords!');
        }
    };

    return (
        <>
        {loding &&
            <CenterLoader/>
        }
        <div className="min-h-screen bg-gray-50 font-sans">
            <div className=" mt-4 p-4">
                <ArrowLeft onClick={()=>navigate('/')}/>
            </div>
            <div className="max-w-md mx-auto p-8"> {/* Centered container for minimal layout */}
                <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Edit Profile</h1>

                {/* Profile Information Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-6">Profile Details</h2>

                    {/* Profile Image and Update Option */}
                    <div className="flex flex-col items-center mb-6">
                        {newImage ? (
                            // Show preview of newly selected image
                            <img
                                src={profileImage}
                                alt="Profile"
                                className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-gray-200 shadow-sm"
                            />
                        ) : user.user.profileImg ? (
                            // Show user's profile image from appData
                            <img
                                src={user.user.profileImg}
                                alt="Profile"
                                className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-gray-200 shadow-sm"
                            />
                        ) : (
                            // Show initials if no image available
                            <div className="w-24 h-24 bg-gradient-to-br from-neutral-800 to-neutral-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 border-2 border-gray-200 shadow-sm">
                                {user.user.name.slice(0,2).toUpperCase()}
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-500 file:text-white file:cursor-pointer hover:file:bg-blue-600 transition duration-200"
                        />
                    </div>

                    {/* Name Input (Editable) */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-600 mb-2">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-gray-50"
                            placeholder="Enter your name"
                        />
                    </div>

                    {/* Email Display (Not Editable) */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
                        <p className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                            {user.user.email}
                        </p>
                    </div>

                    {/* Single Button to Update Name and Image */}
                    <button
                        onClick={handleUpdateProfile}
                        className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-200 font-medium"
                    >
                        Update Profile
                    </button>
                </div>

                {/* Change Password Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-6">Change Password</h2>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-600 mb-2">Old Password</label>
                        <input
                            type="text"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 bg-gray-50"
                            placeholder="Enter your old password"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-600 mb-2">New Password</label>
                        <input
                            type="text"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 bg-gray-50"
                            placeholder="Enter your new password"
                        />
                    </div>

                    <button
                        onClick={handleChangePassword}
                        className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition duration-200 font-medium"
                    >
                        Change Password
                    </button>
                </div>
            </div>
        </div>
        </>
    );
};

export default EditProfile;
