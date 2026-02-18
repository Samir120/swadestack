import React, { useState, useEffect } from 'react';
import apiClient from '../../models/api/apiClient';
import { useAppSelector } from '../../store/hooks';
import AddressAutocomplete from '../common/AddressAutocomplete';
import LoadingSpinner from '../common/LoadingSpinner';
import { PasswordInput } from '../common/PasswordInput';

const ProfileTab: React.FC = () => {
  const language = useAppSelector((state) => state.ui.language);
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    company: '',
    organizationNumber: '',
    vatNumber: '',
    dateOfBirth: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await apiClient.get('/user/profile');
      if (response.success) {
        const data = response.data as any;
        setProfile(data);
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          postalCode: data.postalCode || '',
          country: data.country || 'Sweden',
          company: data.company || '',
          organizationNumber: data.organizationNumber || '',
          vatNumber: data.vatNumber || '',
          dateOfBirth: data.dateOfBirth || '',
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      showMessage('error', language === 'en' ? 'Failed to load profile' : 'Kunde inte ladda profil');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await apiClient.put('/user/profile', formData);
      if (response.success) {
        setProfile(response.data);
        setEditing(false);
        showMessage('success', language === 'en' ? 'Profile updated successfully' : 'Profil uppdaterad');
      } else {
        showMessage('error', response.message || (language === 'en' ? 'Failed to update profile' : 'Kunde inte uppdatera profil'));
      }
    } catch (error: any) {
      showMessage('error', error.message || (language === 'en' ? 'Failed to update profile' : 'Kunde inte uppdatera profil'));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('error', language === 'en' ? 'Passwords do not match' : 'Lösenorden matchar inte');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showMessage('error', language === 'en' ? 'Password must be at least 6 characters' : 'Lösenordet måste vara minst 6 tecken');
      return;
    }

    try {
      const response = await apiClient.put('/user/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (response.success) {
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordForm(false);
        showMessage('success', language === 'en' ? 'Password changed successfully' : 'Lösenord ändrat');
      } else {
        showMessage('error', response.message || (language === 'en' ? 'Failed to change password' : 'Kunde inte ändra lösenord'));
      }
    } catch (error: any) {
      showMessage('error', error.message || (language === 'en' ? 'Failed to change password' : 'Kunde inte ändra lösenord'));
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showMessage('error', language === 'en' ? 'File size must be less than 2MB' : 'Filstorleken måste vara mindre än 2MB');
      return;
    }

    try {
      const data = new FormData();
      data.append('imageFile', file);

      const response = await apiClient.post('/user/avatar', data);

      if (response.success) {
        setProfile(response.data);
        showMessage('success', language === 'en' ? 'Avatar updated successfully' : 'Profilbild uppdaterad');
      } else {
        showMessage('error', response.message || (language === 'en' ? 'Failed to update avatar' : 'Kunde inte uppdatera profilbild'));
      }
    } catch (error: any) {
      showMessage('error', error.message || (language === 'en' ? 'Failed to update avatar' : 'Kunde inte uppdatera profilbild'));
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-3">
        <LoadingSpinner />
        <span className="text-gray-500 dark:text-neutral-400 text-sm">
          {language === 'en' ? 'Loading profile...' : 'Laddar profil...'}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Message */}
      {message && (
        <div
          className={`p-3 sm:p-4 rounded-xl text-sm sm:text-base ${
            message.type === 'success'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-300 dark:border-green-700/30'
              : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700/30'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Avatar Section */}
      <div className="bg-gray-100 dark:bg-surface-800 p-4 sm:p-5 md:p-6 rounded-2xl border border-gray-200 dark:border-surface-700">
        <h3 className="text-base sm:text-lg md:text-xl font-thin text-gray-900 dark:text-white mb-3 sm:mb-4">
          {language === 'en' ? 'Profile Picture' : 'Profilbild'}
        </h3>
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-surface-700 flex items-center justify-center flex-shrink-0">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl sm:text-4xl text-gray-500 dark:text-neutral-400 font-bold">
                {profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
              </span>
            )}
          </div>
          <div className="text-center sm:text-left">
            <label className="px-4 py-2 sm:py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors cursor-pointer inline-block font-bold text-sm active:scale-[0.98]">
              {language === 'en' ? 'Upload Photo' : 'Ladda upp foto'}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </label>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400 mt-2">
              {language === 'en' ? 'JPG, PNG or GIF (max 2MB)' : 'JPG, PNG eller GIF (max 2MB)'}
            </p>
          </div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent my-6 sm:my-8" />

      {/* Profile Information */}
      <div className="bg-gray-100 dark:bg-surface-800 p-4 sm:p-5 md:p-6 rounded-2xl border border-gray-200 dark:border-surface-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-5">
          <h3 className="text-base sm:text-lg md:text-xl font-thin text-gray-900 dark:text-white">
            {language === 'en' ? 'Personal Information' : 'Personlig information'}
          </h3>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-colors font-bold text-sm active:scale-[0.98]"
            >
              {language === 'en' ? 'Edit Profile' : 'Redigera profil'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-1 sm:mb-1.5">
              {language === 'en' ? 'First Name' : 'Förnamn'}
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              disabled={!editing}
              className="form-input"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-1 sm:mb-1.5">
              {language === 'en' ? 'Last Name' : 'Efternamn'}
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              disabled={!editing}
              className="form-input"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-1 sm:mb-1.5">
              {language === 'en' ? 'Email' : 'E-post'}
            </label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="form-input disabled:bg-gray-200 dark:disabled:bg-surface-700 text-gray-500 dark:text-neutral-400"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-1 sm:mb-1.5">
              {language === 'en' ? 'Phone' : 'Telefon'}
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={!editing}
              className="form-input"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-1 sm:mb-1.5">
              {language === 'en' ? 'Address' : 'Adress'}
            </label>
            <AddressAutocomplete
              value={formData.address}
              onChange={(value) => setFormData({ ...formData, address: value })}
              onAddressSelect={(address) => {
                setFormData({
                  ...formData,
                  address: address.address,
                  city: address.city,
                  postalCode: address.postalCode,
                  country: address.country || formData.country,
                });
              }}
              placeholder={language === 'en' ? 'Start typing your address...' : 'Börja skriva din adress...'}
              disabled={!editing}
              className="form-input pr-10"
              language={language}
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-1 sm:mb-1.5">
              {language === 'en' ? 'City' : 'Stad'}
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              disabled={!editing}
              className="form-input"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-1 sm:mb-1.5">
              {language === 'en' ? 'Postal Code' : 'Postnummer'}
            </label>
            <input
              type="text"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              disabled={!editing}
              className="form-input"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-1 sm:mb-1.5">
              {language === 'en' ? 'Country' : 'Land'}
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              disabled={!editing}
              className="form-input"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-1 sm:mb-1.5">
              {language === 'en' ? 'Date of Birth' : 'Födelsedatum'} <span className="font-normal text-gray-500 dark:text-neutral-400">({language === 'en' ? 'Optional' : 'Valfritt'})</span>
            </label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              disabled={!editing}
              className="form-input"
            />
          </div>
        </div>

        {/* Company Information - Show if user is company type */}
        {profile?.userType === 'company' && (
          <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-gray-200 dark:border-surface-700">
            <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {language === 'en' ? 'Company Information' : 'Företagsinformation'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-1 sm:mb-1.5">
                  {language === 'en' ? 'Company Name' : 'Företagsnamn'}
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  disabled={!editing}
                  className="form-input"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-1 sm:mb-1.5">
                  {language === 'en' ? 'Organization Number' : 'Organisationsnummer'}
                </label>
                <input
                  type="text"
                  value={formData.organizationNumber}
                  onChange={(e) => setFormData({ ...formData, organizationNumber: e.target.value })}
                  disabled={!editing}
                  className="form-input"
                  placeholder="e.g. 556000-0000"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-1 sm:mb-1.5">
                  {language === 'en' ? 'VAT Number' : 'Momsnummer'}
                </label>
                <input
                  type="text"
                  value={formData.vatNumber}
                  onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                  disabled={!editing}
                  className="form-input"
                  placeholder="e.g. SE556000000001"
                />
              </div>
            </div>
          </div>
        )}

        {editing && (
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 mt-5 sm:mt-6">
            <button
              onClick={() => {
                setEditing(false);
                loadProfile();
              }}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 bg-gray-200 dark:bg-surface-700 text-gray-700 dark:text-neutral-300 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-800 transition-colors font-bold text-sm active:scale-[0.98]"
            >
              {language === 'en' ? 'Cancel' : 'Avbryt'}
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-bold text-sm active:scale-[0.98]"
            >
              {saving ? (language === 'en' ? 'Saving...' : 'Sparar...') : (language === 'en' ? 'Save Changes' : 'Spara ändringar')}
            </button>
          </div>
        )}
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent my-6 sm:my-8" />

      {/* Security Section */}
      <div className="bg-gray-100 dark:bg-surface-800 p-4 sm:p-5 md:p-6 rounded-2xl border border-gray-200 dark:border-surface-700">
        <h3 className="text-base sm:text-lg md:text-xl font-thin text-gray-900 dark:text-white mb-3 sm:mb-4">
          {language === 'en' ? 'Security' : 'Säkerhet'}
        </h3>

        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="px-4 py-2 sm:py-2.5 bg-gray-300 dark:bg-surface-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-surface-700 transition-colors font-bold text-sm active:scale-[0.98]"
          >
            {language === 'en' ? 'Change Password' : 'Ändra lösenord'}
          </button>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-1 sm:mb-1.5">
                {language === 'en' ? 'Current Password' : 'Nuvarande lösenord'}
              </label>
              <PasswordInput
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                }
                className="form-input"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-1 sm:mb-1.5">
                {language === 'en' ? 'New Password' : 'Nytt lösenord'}
              </label>
              <PasswordInput
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
                className="form-input"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-1 sm:mb-1.5">
                {language === 'en' ? 'Confirm New Password' : 'Bekräfta nytt lösenord'}
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                className="form-input"
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 bg-gray-200 dark:bg-surface-700 text-gray-700 dark:text-neutral-300 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-800 transition-colors font-bold text-sm active:scale-[0.98]"
              >
                {language === 'en' ? 'Cancel' : 'Avbryt'}
              </button>
              <button
                onClick={handleChangePassword}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold text-sm active:scale-[0.98]"
              >
                {language === 'en' ? 'Update Password' : 'Uppdatera lösenord'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileTab;
