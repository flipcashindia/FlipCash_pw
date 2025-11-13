import React, { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const Helpdesk: React.FC = () => {
  const toast = useToast();
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message sent! We will get back to you soon.');
    setMessage('');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <MessageCircle size={32} className="text-teal-600" />
          <h1 className="text-3xl font-bold">Helpdesk</h1>
        </div>
        <p className="text-gray-600 mb-6">Need assistance? Send us a message and our team will help you.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} placeholder="Describe your issue..." className="w-full p-4 border rounded-lg" required />
          <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600">
            <Send size={20} />
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default Helpdesk;