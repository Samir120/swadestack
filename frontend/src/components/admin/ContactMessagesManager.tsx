import React, { useEffect, useState } from 'react';
import { useToast } from '../common/Toast';
import { useConfirm } from '../common/ConfirmDialog';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchContactMessages,
  fetchMessageById,
  updateMessageStatus,
  replyToContactMessage,
  addMessageNotes,
  deleteContactMessage,
  fetchStatistics,
  searchContactMessages,
} from '../../store/slices/contactSlice';
import { ContactMessage } from '../../models/types/contact.types';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  FaEnvelope,
  FaEnvelopeOpen,
  FaReply,
  FaArchive,
  FaSearch,
  FaTimes,
  FaTrash,
  FaEye,
  FaStickyNote,
  FaInbox,
  FaPaperPlane,
  FaBell,
} from 'react-icons/fa';

const ContactMessagesManager: React.FC = () => {
  const toast = useToast();
  const dispatch = useAppDispatch();
  const confirm = useConfirm();
  const { messages, statistics, isLoading, isSubmitting } = useAppSelector(
    (state) => state.contact
  );

  const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'replied' | 'archived'>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [replyForm, setReplyForm] = useState({
    subject: '',
    message: '',
  });
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadMessages();
    dispatch(fetchStatistics());
  }, [filter]);

  const loadMessages = () => {
    if (searchKeyword) {
      dispatch(searchContactMessages(searchKeyword));
    } else {
      const params: any = { limit: 100 };
      if (filter !== 'all') {
        params.status = filter;
      }
      dispatch(fetchContactMessages(params));
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      dispatch(searchContactMessages(searchKeyword));
    } else {
      loadMessages();
    }
  };

  const handleViewMessage = async (message: ContactMessage) => {
    try {
      const result = await dispatch(fetchMessageById(message.id)).unwrap();
      setSelectedMessage(result);
    } catch (error) {
      toast.error('Failed to load message details');
      setSelectedMessage(message); // Fallback to table data
    }
  };

  const handleUpdateStatus = async (messageId: string, status: 'new' | 'read' | 'replied' | 'archived') => {
    try {
      await dispatch(updateMessageStatus({ id: messageId, data: { status } })).unwrap();
      toast.success('Status updated successfully');
      loadMessages();
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleOpenReply = (message: ContactMessage) => {
    setSelectedMessage(message);
    setReplyForm({
      subject: `Re: ${message.subject}`,
      message: '',
    });
    setShowReplyModal(true);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage) return;

    try {
      await dispatch(
        replyToContactMessage({
          id: selectedMessage.id,
          data: replyForm,
        })
      ).unwrap();
      toast.success('Reply sent successfully');
      setShowReplyModal(false);
      setReplyForm({ subject: '', message: '' });
      loadMessages();
      setSelectedMessage(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reply');
    }
  };

  const handleOpenNotes = (message: ContactMessage) => {
    setSelectedMessage(message);
    setNotes(message.adminNotes || '');
    setShowNotesModal(true);
  };

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage) return;

    try {
      await dispatch(
        addMessageNotes({
          id: selectedMessage.id,
          data: { notes },
        })
      ).unwrap();
      toast.success('Notes saved successfully');
      setShowNotesModal(false);
      loadMessages();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save notes');
    }
  };

  const handleDelete = async (messageId: string) => {
    const confirmed = await confirm({
      title: 'Delete Message',
      message: 'Are you sure you want to delete this message? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });

    if (!confirmed) {
      return;
    }

    try {
      await dispatch(deleteContactMessage(messageId)).unwrap();
      toast.success('Message deleted successfully');
      loadMessages();
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete message');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateShort = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-900/30 text-blue-400',
      read: 'bg-surface-800 text-neutral-200',
      replied: 'bg-green-900/30 text-green-400',
      archived: 'bg-purple-900/30 text-purple-400',
    };
    return colors[status] || 'bg-surface-800 text-neutral-200';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <FaEnvelope className="text-blue-400" />;
      case 'read':
        return <FaEnvelopeOpen className="text-neutral-400" />;
      case 'replied':
        return <FaReply className="text-green-400" />;
      case 'archived':
        return <FaArchive className="text-purple-400" />;
      default:
        return <FaEnvelope className="text-neutral-400" />;
    }
  };

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4 sm:mb-8">
        <h2 className="text-3xl sm:text-4xl font-thin text-white">Contact Messages</h2>
        <p className="font-medium text-[10px] sm:text-xs uppercase tracking-[0.2em] text-neutral-500 mt-2">Inbox & Responses</p>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-surface-850 rounded-2xl shadow-dark-md p-3 sm:p-4 border border-surface-700 border-t-4 border-t-primary-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
              <div className="order-2 sm:order-1">
                <p className="text-[10px] sm:text-xs font-medium text-neutral-400 uppercase tracking-wider">Total</p>
                <p className="text-xl sm:text-2xl font-thin text-white">{statistics.total}</p>
              </div>
              <div className="order-1 sm:order-2 w-8 h-8 sm:w-10 sm:h-10 bg-primary-600/10 rounded-lg flex items-center justify-center text-primary-400">
                <FaInbox className="text-sm sm:text-base" />
              </div>
            </div>
          </div>
          <div className="bg-surface-850 rounded-2xl shadow-dark-md p-3 sm:p-4 border border-surface-700 border-t-4 border-t-blue-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
              <div className="order-2 sm:order-1">
                <p className="text-[10px] sm:text-xs font-bold text-blue-400 uppercase tracking-wider">New</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-200">{statistics.new}</p>
              </div>
              <div className="order-1 sm:order-2 w-8 h-8 sm:w-10 sm:h-10 bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-400">
                <FaEnvelope className="text-sm sm:text-base" />
              </div>
            </div>
          </div>
          <div className="bg-surface-850 rounded-2xl shadow-dark-md p-3 sm:p-4 border border-surface-700 border-t-4 border-t-gray-400">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
              <div className="order-2 sm:order-1">
                <p className="text-[10px] sm:text-xs font-medium text-neutral-400 uppercase tracking-wider">Read</p>
                <p className="text-xl sm:text-2xl font-thin text-white">{statistics.read}</p>
              </div>
              <div className="order-1 sm:order-2 w-8 h-8 sm:w-10 sm:h-10 bg-surface-800 rounded-lg flex items-center justify-center text-neutral-400">
                <FaEnvelopeOpen className="text-sm sm:text-base" />
              </div>
            </div>
          </div>
          <div className="bg-surface-850 rounded-2xl shadow-dark-md p-3 sm:p-4 border border-surface-700 border-t-4 border-t-green-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
              <div className="order-2 sm:order-1">
                <p className="text-[10px] sm:text-xs font-bold text-green-400 uppercase tracking-wider">Replied</p>
                <p className="text-lg sm:text-2xl font-bold text-green-200">{statistics.replied}</p>
              </div>
              <div className="order-1 sm:order-2 w-8 h-8 sm:w-10 sm:h-10 bg-green-900/20 rounded-lg flex items-center justify-center text-green-400">
                <FaReply className="text-sm sm:text-base" />
              </div>
            </div>
          </div>
          <div className="bg-surface-850 rounded-2xl shadow-dark-md p-3 sm:p-4 border border-surface-700 border-t-4 border-t-purple-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
              <div className="order-2 sm:order-1">
                <p className="text-[10px] sm:text-xs font-bold text-purple-400 uppercase tracking-wider">Archived</p>
                <p className="text-lg sm:text-2xl font-bold text-purple-200">{statistics.archived}</p>
              </div>
              <div className="order-1 sm:order-2 w-8 h-8 sm:w-10 sm:h-10 bg-purple-900/20 rounded-lg flex items-center justify-center text-purple-400">
                <FaArchive className="text-sm sm:text-base" />
              </div>
            </div>
          </div>
          <div className="bg-surface-850 rounded-2xl shadow-dark-md p-3 sm:p-4 border border-surface-700 border-t-4 border-t-primary-500">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
              <div className="order-2 sm:order-1">
                <p className="text-[10px] sm:text-xs font-bold text-primary-400 uppercase tracking-wider">Unread</p>
                <p className="text-lg sm:text-2xl font-bold text-primary-400">{statistics.unread}</p>
              </div>
              <div className="order-1 sm:order-2 w-8 h-8 sm:w-10 sm:h-10 bg-primary-600/10 rounded-lg flex items-center justify-center text-primary-400">
                <FaBell className="text-sm sm:text-base" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent my-6 sm:my-8" />

      {/* Search and Filters */}
      <div className="bg-surface-850 p-3 sm:p-4 rounded-2xl shadow-dark-md border border-surface-700 mb-4 sm:mb-6">
        <div className="flex flex-col gap-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Search messages..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 bg-surface-800 text-white"
              />
            </div>
            <button
              type="submit"
              className="px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition text-sm font-bold active:scale-[0.98]"
            >
              <span className="hidden sm:inline">Search</span>
              <FaSearch className="sm:hidden" />
            </button>
            {searchKeyword && (
              <button
                type="button"
                onClick={() => {
                  setSearchKeyword('');
                  loadMessages();
                }}
                className="px-3 py-2 bg-surface-700 text-neutral-300 rounded-lg hover:bg-surface-600 transition text-sm active:scale-[0.98]"
              >
                <FaTimes />
              </button>
            )}
          </form>
          <div className="flex gap-1.5 sm:gap-2 flex-wrap">
            {['all', 'new', 'read', 'replied', 'archived'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold capitalize transition active:scale-[0.98] ${
                  filter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-surface-800 text-neutral-300 hover:bg-surface-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-surface-850 rounded-2xl shadow-dark-md border border-surface-700 overflow-hidden">
        {/* Mobile Card View */}
        <div className="sm:hidden">
          {messages.length === 0 ? (
            <div className="p-6 text-center text-sm text-neutral-400">No messages found</div>
          ) : (
            <div className="divide-y divide-surface-700">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 ${!message.isRead ? 'bg-blue-900/10' : 'bg-surface-850'} active:bg-surface-700`}
                  onClick={() => handleViewMessage(message)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="flex-shrink-0">
                        {getStatusIcon(message.status)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm truncate ${!message.isRead ? 'font-bold' : 'font-semibold'} text-white`}>
                          {message.name}
                        </p>
                        <p className="text-xs text-neutral-400 truncate">{message.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full capitalize ${getStatusColor(message.status)}`}>
                        {message.status}
                      </span>
                    </div>
                  </div>
                  <p className={`text-sm ${!message.isRead ? 'font-bold' : 'font-medium'} text-white truncate mb-1`}>
                    {message.subject}
                  </p>
                  <p className="text-xs text-neutral-400 line-clamp-2 mb-2">
                    {message.message}
                  </p>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-neutral-500">
                      {formatDateShort(message.createdAt)}
                    </p>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenReply(message);
                        }}
                        className="p-1.5 text-green-400 hover:bg-green-900/20 rounded-lg active:scale-[0.98]"
                      >
                        <FaReply size={12} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenNotes(message);
                        }}
                        className="p-1.5 text-blue-400 hover:bg-blue-900/20 rounded-lg active:scale-[0.98]"
                      >
                        <FaStickyNote size={12} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(message.id);
                        }}
                        className="p-1.5 text-red-400 hover:bg-red-900/20 rounded-lg active:scale-[0.98]"
                      >
                        <FaTrash size={12} />
                      </button>
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
                  Status
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  From
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-surface-850 divide-y divide-surface-700">
              {messages.map((message) => (
                <tr
                  key={message.id}
                  className={`${!message.isRead ? 'bg-blue-900/10 font-semibold' : ''} hover:bg-surface-700`}
                >
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusColor(
                        message.status
                      )}`}
                    >
                      {message.status}
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    <div className="text-sm text-white">{message.name}</div>
                    <div className="text-sm text-neutral-400">{message.email}</div>
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    <div className="text-sm text-white">{message.subject}</div>
                    <div className="text-xs text-neutral-400">
                      {message.message.substring(0, 60)}
                      {message.message.length > 60 ? '...' : ''}
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                    {formatDate(message.createdAt)}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleViewMessage(message)}
                        className="p-2 text-primary-400 hover:bg-primary-600/10 rounded-lg transition"
                        title="View"
                      >
                        <FaEye size={14} />
                      </button>
                      <button
                        onClick={() => handleOpenReply(message)}
                        className="p-2 text-green-400 hover:bg-green-900/20 rounded-lg transition"
                        title="Reply"
                      >
                        <FaReply size={14} />
                      </button>
                      <button
                        onClick={() => handleOpenNotes(message)}
                        className="p-2 text-blue-400 hover:bg-blue-900/20 rounded-lg transition"
                        title="Notes"
                      >
                        <FaStickyNote size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(message.id)}
                        className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition"
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

        {messages.length === 0 && (
          <div className="hidden sm:block text-center py-12 text-neutral-400">No messages found</div>
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && !showReplyModal && !showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-0 sm:p-4 z-[60]">
          <div className="bg-surface-850 sm:rounded-2xl w-full h-full sm:h-auto sm:max-w-3xl sm:max-h-[90vh] overflow-hidden flex flex-col">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-surface-850 border-b border-surface-700 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-10">
              <h3 className="text-xl sm:text-2xl font-thin text-white">Message Details</h3>
              <button
                onClick={() => setSelectedMessage(null)}
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-neutral-500 hover:text-neutral-300 hover:bg-surface-700 rounded-lg transition active:scale-[0.98]"
              >
                <FaTimes className="text-lg sm:text-xl" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider">Status</span>
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusColor(
                      selectedMessage.status
                    )}`}
                  >
                    {selectedMessage.status}
                  </span>
                </div>

                <div className="bg-surface-800 rounded-lg p-3 sm:p-4 space-y-3">
                  <div>
                    <label className="text-[10px] sm:text-xs font-medium text-neutral-400 uppercase tracking-wider">From</label>
                    <p className="text-sm sm:text-base font-semibold text-white">{selectedMessage.name}</p>
                  </div>

                  <div>
                    <label className="text-[10px] sm:text-xs font-medium text-neutral-400 uppercase tracking-wider">Email</label>
                    <p className="text-sm sm:text-base text-white break-all">{selectedMessage.email}</p>
                  </div>

                  {selectedMessage.phone && (
                    <div>
                      <label className="text-[10px] sm:text-xs font-medium text-neutral-400 uppercase tracking-wider">Phone</label>
                      <p className="text-sm sm:text-base text-white">{selectedMessage.phone}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] sm:text-xs font-medium text-neutral-400 uppercase tracking-wider">Subject</label>
                  <p className="text-sm sm:text-base font-semibold text-white mt-1">{selectedMessage.subject}</p>
                </div>

                <div>
                  <label className="text-[10px] sm:text-xs font-medium text-neutral-400 uppercase tracking-wider">Message</label>
                  <p className="text-sm sm:text-base text-white whitespace-pre-wrap mt-1 bg-surface-850 border border-surface-700 rounded-lg p-3">
                    {selectedMessage.message}
                  </p>
                </div>

                {selectedMessage.adminNotes && (
                  <div>
                    <label className="text-[10px] sm:text-xs font-medium text-neutral-400 uppercase tracking-wider">Admin Notes</label>
                    <p className="text-sm sm:text-base text-white whitespace-pre-wrap bg-primary-600/10 p-3 rounded-lg mt-1 border border-primary-500/30">
                      {selectedMessage.adminNotes}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-neutral-400">
                  {selectedMessage.repliedAt && (
                    <div>
                      <span className="font-semibold">Replied:</span> {formatDate(selectedMessage.repliedAt)}
                    </div>
                  )}
                  <div>
                    <span className="font-semibold">Received:</span> {formatDate(selectedMessage.createdAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Footer Actions */}
            <div className="sticky bottom-0 bg-surface-800 border-t border-surface-700 px-4 sm:px-6 py-3 sm:py-4">
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                <button
                  onClick={() => handleOpenReply(selectedMessage)}
                  className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-bold active:scale-[0.98]"
                >
                  <FaReply size={12} />
                  <span>Reply</span>
                </button>
                <button
                  onClick={() => handleOpenNotes(selectedMessage)}
                  className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold active:scale-[0.98]"
                >
                  <FaStickyNote size={12} />
                  <span>Notes</span>
                </button>
                {selectedMessage.status !== 'archived' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedMessage.id, 'archived')}
                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-bold active:scale-[0.98]"
                  >
                    <FaArchive size={12} />
                    <span>Archive</span>
                  </button>
                )}
                <button
                  onClick={() => handleDelete(selectedMessage.id)}
                  className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-bold active:scale-[0.98]"
                >
                  <FaTrash size={12} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-0 sm:p-4 z-[60]">
          <div className="bg-surface-850 sm:rounded-2xl w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[90vh] overflow-hidden flex flex-col">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-surface-850 border-b border-surface-700 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-900/30 rounded-lg flex items-center justify-center">
                  <FaPaperPlane className="text-green-400 text-sm" />
                </div>
                <h3 className="text-xl sm:text-2xl font-thin text-white">Reply to {selectedMessage.name}</h3>
              </div>
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyForm({ subject: '', message: '' });
                }}
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-neutral-500 hover:text-neutral-300 hover:bg-surface-700 rounded-lg transition active:scale-[0.98]"
              >
                <FaTimes className="text-lg sm:text-xl" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {/* Original Message */}
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-surface-800 rounded-xl border border-surface-700">
                <h4 className="text-xs sm:text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">Original Message</h4>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div>
                    <span className="font-medium text-neutral-300">Subject:</span>
                    <span className="ml-2 text-white">{selectedMessage.subject}</span>
                  </div>
                  <div>
                    <span className="font-medium text-neutral-300">Submitted:</span>
                    <span className="ml-2 text-white">{formatDate(selectedMessage.createdAt)}</span>
                  </div>
                  <div>
                    <span className="font-medium text-neutral-300 block mb-1">Message:</span>
                    <p className="text-white whitespace-pre-wrap bg-surface-850 p-3 rounded-lg border border-surface-700 text-xs sm:text-sm">
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>
              </div>

              <form id="reply-form" onSubmit={handleSendReply} className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">Subject</label>
                  <input
                    type="text"
                    value={replyForm.subject}
                    onChange={(e) => setReplyForm({ ...replyForm, subject: e.target.value })}
                    required
                    className="w-full px-3 sm:px-4 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 bg-surface-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">Message</label>
                  <textarea
                    value={replyForm.message}
                    onChange={(e) => setReplyForm({ ...replyForm, message: e.target.value })}
                    required
                    rows={6}
                    className="w-full px-3 sm:px-4 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 resize-none bg-surface-800 text-white"
                  />
                </div>
              </form>
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 bg-surface-800 border-t border-surface-700 px-4 sm:px-6 py-3 sm:py-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyForm({ subject: '', message: '' });
                }}
                className="px-4 py-2 bg-surface-700 text-neutral-300 rounded-lg hover:bg-surface-600 text-sm font-bold active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="reply-form"
                disabled={isSubmitting}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-bold active:scale-[0.98] ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FaPaperPlane size={12} />
                {isSubmitting ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {showNotesModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-0 sm:p-4 z-[60]">
          <div className="bg-surface-850 sm:rounded-2xl w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[90vh] overflow-hidden flex flex-col">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-surface-850 border-b border-surface-700 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <FaStickyNote className="text-blue-400 text-sm" />
                </div>
                <h3 className="text-xl sm:text-2xl font-thin text-white">Admin Notes</h3>
              </div>
              <button
                onClick={() => {
                  setShowNotesModal(false);
                  setNotes('');
                }}
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-neutral-500 hover:text-neutral-300 hover:bg-surface-700 rounded-lg transition active:scale-[0.98]"
              >
                <FaTimes className="text-lg sm:text-xl" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="mb-4 p-3 bg-surface-800 rounded-lg border border-surface-700">
                <p className="text-xs sm:text-sm text-neutral-400">
                  <span className="font-bold">Message from:</span> {selectedMessage.name} ({selectedMessage.email})
                </p>
                <p className="font-medium text-[10px] sm:text-xs uppercase tracking-[0.2em] text-neutral-500 mt-2">
                  <span className="font-bold">Subject:</span> {selectedMessage.subject}
                </p>
              </div>

              <form id="notes-form" onSubmit={handleSaveNotes} className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-wider mb-1">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={6}
                    placeholder="Add internal notes about this message..."
                    className="w-full px-3 sm:px-4 py-2 text-sm border border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 resize-none bg-surface-800 text-white"
                  />
                </div>
              </form>
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 bg-surface-800 border-t border-surface-700 px-4 sm:px-6 py-3 sm:py-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowNotesModal(false);
                  setNotes('');
                }}
                className="px-4 py-2 bg-surface-700 text-neutral-300 rounded-lg hover:bg-surface-600 text-sm font-bold active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="notes-form"
                className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold active:scale-[0.98]"
              >
                <FaStickyNote size={12} />
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactMessagesManager;
