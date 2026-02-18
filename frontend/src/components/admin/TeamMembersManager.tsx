import React, { useEffect, useState } from 'react';
import { useToast } from '../common/Toast';
import { useConfirm } from '../common/ConfirmDialog';
import { useAppSelector } from '../../store/hooks';
import apiClient from '../../models/api/apiClient';
import { TeamMember } from '../../models/types/teamTypes';
import FileUpload from '../common/FileUpload';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaUser,
  FaToggleOn,
  FaToggleOff,
  FaEye,
  FaEyeSlash,
  FaLinkedin,
  FaSortNumericDown,
} from 'react-icons/fa';

const TeamMembersManager: React.FC = () => {
  const toast = useToast();
  const confirm = useConfirm();
  const language = useAppSelector((state) => state.ui.language);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name_en: '',
    name_sv: '',
    role_en: '',
    role_sv: '',
    bio_en: '',
    bio_sv: '',
    image_url: '',
    image_file: '',
    linkedin_url: '',
    sort_order: 0,
    is_active: true,
  });

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<any>('/team/all', { page: 1, limit: 100 });
      if (response.success && response.data) {
        setMembers(response.data.members);
      }
    } catch (error) {
      console.error('Failed to load team members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingMember(null);
    setFormData({
      name_en: '',
      name_sv: '',
      role_en: '',
      role_sv: '',
      bio_en: '',
      bio_sv: '',
      image_url: '',
      image_file: '',
      linkedin_url: '',
      sort_order: members.length,
      is_active: true,
    });
    setRawFile(null);
    setShowModal(true);
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name_en: member.name_en,
      name_sv: member.name_sv,
      role_en: member.role_en,
      role_sv: member.role_sv,
      bio_en: member.bio_en,
      bio_sv: member.bio_sv,
      image_url: member.image_url || '',
      image_file: member.image_file || '',
      linkedin_url: member.linkedin_url || '',
      sort_order: member.sort_order,
      is_active: member.is_active,
    });
    setRawFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('name_en', formData.name_en);
      data.append('name_sv', formData.name_sv);
      data.append('role_en', formData.role_en);
      data.append('role_sv', formData.role_sv);
      data.append('bio_en', formData.bio_en);
      data.append('bio_sv', formData.bio_sv);
      data.append('linkedin_url', formData.linkedin_url);
      data.append('sort_order', String(formData.sort_order));
      data.append('is_active', String(formData.is_active));
      if (rawFile) {
        data.append('imageFile', rawFile);
      } else if (formData.image_url) {
        data.append('image_url', formData.image_url);
        data.append('image_file', formData.image_file);
      }

      if (editingMember) {
        await apiClient.put(`/team/${editingMember.id}`, data);
      } else {
        await apiClient.post('/team', data);
      }
      setShowModal(false);
      loadMembers();
    } catch (error) {
      console.error('Failed to save team member:', error);
      toast.error('Failed to save. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Team Member',
      message: 'Are you sure you want to delete this team member? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });

    if (!confirmed) return;
    try {
      await apiClient.delete(`/team/${id}`);
      loadMembers();
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete. Please try again.');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await apiClient.patch(`/team/${id}/toggle-active`, {});
      loadMembers();
    } catch (error) {
      console.error('Failed to toggle active:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-8">
        <div>
          <h2 className="text-3xl sm:text-4xl font-thin text-white">Team Members</h2>
          <p className="font-medium text-[10px] sm:text-xs uppercase tracking-[0.2em] text-neutral-500 mt-2">Team Management</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 font-bold text-sm active:scale-[0.98] transition"
        >
          <FaPlus size={12} />
          Add Team Member
        </button>
      </div>

      {/* Team Members */}
      <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 overflow-hidden">
        {/* Mobile Card View */}
        <div className="sm:hidden">
          {members.length === 0 ? (
            <div className="p-6 text-center text-sm text-neutral-400">
              No team members yet. Click "Add Team Member" to get started.
            </div>
          ) : (
            <div className="divide-y divide-surface-700">
              {members.map((member) => (
                <div key={member.id} className="p-3 hover:bg-surface-700 active:bg-surface-700">
                  <div className="flex gap-3">
                    {/* Member Photo */}
                    <div className="flex-shrink-0">
                      {(member.image_file || member.image_url) ? (
                        <img
                          src={member.image_file || member.image_url}
                          alt={member.name_en}
                          className="w-14 h-14 rounded-full object-cover border-2 border-surface-700"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-primary-600/20 flex items-center justify-center">
                          <FaUser className="text-primary-400 text-lg" />
                        </div>
                      )}
                    </div>

                    {/* Member Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-white truncate">
                            {language === 'en' ? member.name_en : member.name_sv}
                          </h3>
                          <p className="text-xs text-primary-400 font-medium truncate">
                            {language === 'en' ? member.role_en : member.role_sv}
                          </p>
                        </div>
                        <span
                          className={`flex-shrink-0 px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                            member.is_active
                              ? 'bg-green-900/30 text-green-400'
                              : 'bg-red-900/30 text-red-400'
                          }`}
                        >
                          {member.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] text-neutral-500 flex items-center gap-1">
                          <FaSortNumericDown size={10} />
                          Order: {member.sort_order}
                        </span>
                        {member.linkedin_url && (
                          <FaLinkedin className="text-blue-600" size={12} />
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(member)}
                          className="p-1.5 text-primary-400 hover:bg-primary-600/10 rounded-lg active:scale-[0.98]"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(member.id)}
                          className={`p-1.5 rounded-lg active:scale-[0.98] ${
                            member.is_active
                              ? 'text-yellow-600 hover:bg-yellow-900/20'
                              : 'text-green-600 hover:bg-green-900/20'
                          }`}
                        >
                          {member.is_active ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="p-1.5 text-red-600 hover:bg-red-900/20 rounded-lg active:scale-[0.98]"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-surface-700">
            <thead className="bg-surface-800">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Photo
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-surface-850 divide-y divide-surface-700">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-surface-700">
                  <td className="px-4 lg:px-6 py-4 text-sm text-neutral-400">
                    {member.sort_order}
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    {(member.image_file || member.image_url) ? (
                      <img
                        src={member.image_file || member.image_url}
                        alt={member.name_en}
                        className="w-10 h-10 rounded-full object-cover border-2 border-surface-700"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary-600/20 flex items-center justify-center">
                        <FaUser className="text-primary-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    <div className="text-sm font-semibold text-white">
                      {language === 'en' ? member.name_en : member.name_sv}
                    </div>
                    {member.linkedin_url && (
                      <a
                        href={member.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaLinkedin size={14} />
                      </a>
                    )}
                  </td>
                  <td className="px-4 lg:px-6 py-4 text-sm text-neutral-400">
                    {language === 'en' ? member.role_en : member.role_sv}
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.is_active
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-red-900/30 text-red-400'
                      }`}
                    >
                      {member.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleEdit(member)}
                        className="p-2 text-primary-400 hover:bg-primary-600/10 rounded-lg transition"
                        title="Edit"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleToggleActive(member.id)}
                        className={`p-2 rounded-lg transition ${
                          member.is_active
                            ? 'text-yellow-600 hover:bg-yellow-900/20'
                            : 'text-green-600 hover:bg-green-900/20'
                        }`}
                        title={member.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {member.is_active ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="p-2 text-red-600 hover:bg-red-900/20 rounded-lg transition"
                        title="Delete"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {members.length === 0 && (
          <div className="hidden sm:block text-center py-12 text-neutral-400">
            No team members yet. Click "Add Team Member" to get started.
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-0 sm:p-4 z-[60]">
          <div className="bg-surface-900 sm:rounded-2xl w-full h-full sm:h-auto sm:max-w-3xl sm:max-h-[90vh] overflow-hidden flex flex-col">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-surface-900 border-b border-surface-700 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-600/20 rounded-lg flex items-center justify-center">
                  <FaUser className="text-primary-400 text-sm" />
                </div>
                <h3 className="text-xl sm:text-2xl font-thin text-white">
                  {editingMember ? 'Edit Team Member' : 'Add Team Member'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-neutral-500 hover:text-neutral-300 hover:bg-surface-700 rounded-lg transition active:scale-[0.98]"
              >
                <FaTimes className="text-lg sm:text-xl" />
              </button>
            </div>

            {/* Scrollable Content */}
            <form id="member-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Name (English) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                    placeholder="e.g., John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Name (Swedish) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name_sv}
                    onChange={(e) => setFormData({ ...formData, name_sv: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                    placeholder="e.g., John Doe"
                  />
                </div>
              </div>

              {/* Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Role (English) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.role_en}
                    onChange={(e) => setFormData({ ...formData, role_en: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                    placeholder="e.g., Lead Developer"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Role (Swedish) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.role_sv}
                    onChange={(e) => setFormData({ ...formData, role_sv: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                    placeholder="e.g., Ledande Utvecklare"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Bio (English) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.bio_en}
                    onChange={(e) => setFormData({ ...formData, bio_en: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent resize-none"
                    placeholder="A short biography..."
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Bio (Swedish) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.bio_sv}
                    onChange={(e) => setFormData({ ...formData, bio_sv: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent resize-none"
                    placeholder="En kort biografi..."
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-2">
                  Member Photo
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <FileUpload
                    label=""
                    accept="image/*"
                    maxSize={3}
                    onFileSelect={(base64, file) => { setFormData({ ...formData, image_file: base64, image_url: base64 }); setRawFile(file); }}
                    currentUrl={formData.image_file || formData.image_url}
                    preview={true}
                    previewClassName="h-24 w-24 sm:h-32 sm:w-32 object-cover rounded-full"
                  />
                  <p className="text-[10px] sm:text-xs text-neutral-400">
                    Recommended: Square image, at least 200x200px, max 3MB
                  </p>
                </div>
              </div>

              {/* LinkedIn & Sort Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    LinkedIn URL
                    <span className="text-[10px] sm:text-xs text-neutral-500 ml-1 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <FaLinkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" />
                    <input
                      type="url"
                      value={formData.linkedin_url}
                      onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                  />
                  <p className="text-[10px] sm:text-xs text-neutral-400 mt-1">Lower numbers appear first</p>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 p-3 bg-surface-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                  className={`p-1 rounded-lg transition ${formData.is_active ? 'text-green-600' : 'text-neutral-500'}`}
                >
                  {formData.is_active ? <FaToggleOn size={28} /> : <FaToggleOff size={28} />}
                </button>
                <div>
                  <p className="text-sm font-medium text-neutral-300">
                    {formData.is_active ? 'Active' : 'Inactive'}
                  </p>
                  <p className="text-[10px] sm:text-xs text-neutral-400">
                    {formData.is_active ? 'Member is visible on the website' : 'Member is hidden from the website'}
                  </p>
                </div>
              </div>
            </form>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 bg-surface-800 border-t border-surface-700 px-4 sm:px-6 py-3 sm:py-4 flex gap-3">
              <button
                type="submit"
                form="member-form"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-500 font-bold text-sm active:scale-[0.98] transition"
              >
                {editingMember ? 'Update Member' : 'Create Member'}
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 border border-surface-600 rounded-lg hover:bg-surface-700 text-neutral-300 font-bold text-sm active:scale-[0.98] transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMembersManager;
