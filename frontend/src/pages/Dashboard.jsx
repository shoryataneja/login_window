import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import InputField from '../components/ui/InputField';
import Spinner from '../components/ui/Spinner';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmNew: '' });
  const [nameLoading, setNameLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setNameLoading(true);
    try {
      const res = await api.put('/user/profile', { name });
      updateUser(res.data.user);
      toast.success('Name updated!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setNameLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmNew) return toast.error('Passwords do not match');
    if (passwords.newPassword.length < 6) return toast.error('Minimum 6 characters');
    setPassLoading(true);
    try {
      await api.put('/user/change-password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password updated!');
      setPasswords({ currentPassword: '', newPassword: '', confirmNew: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">

        {/* User info header */}
        <div>
          <p className="text-xl font-semibold">{user?.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
        </div>

        {/* Two cards side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Update Name */}
          <div className="card p-6 flex flex-col">
            <h2 className="text-base font-semibold mb-1">Update Name</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Change how your name appears.</p>
            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4 flex-1">
              <InputField label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
              <button type="submit" className="btn-primary mt-auto" disabled={nameLoading}>
                {nameLoading ? <Spinner size="sm" /> : 'Save'}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="card p-6 flex flex-col">
            <h2 className="text-base font-semibold mb-1">Change Password</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Update your account password.</p>
            {user?.googleId ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">You signed in with Google. Password is managed through your Google account.</p>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="flex flex-col gap-4 flex-1">
                <InputField label="Current Password" type="password" placeholder="••••••••" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} />
                <InputField label="New Password" type="password" placeholder="••••••••" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} />
                <InputField label="Confirm New Password" type="password" placeholder="••••••••" value={passwords.confirmNew} onChange={(e) => setPasswords({ ...passwords, confirmNew: e.target.value })} />
                <button type="submit" className="btn-primary mt-auto" disabled={passLoading}>
                  {passLoading ? <Spinner size="sm" /> : 'Update Password'}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
