// src/components/partner/ChatBox.tsx
/**
 * Chat Box Component
 * Real-time messaging between partner and customer
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Image as ImageIcon, File, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { privateApiClient } from '../../api/client/apiClient'

interface Message {
  id: string;
  sender_type: 'partner' | 'customer' | 'system';
  sender_name: string;
  message: string;
  attachments?: { url: string; type: string; name: string }[];
  created_at: string;
  is_read: boolean;
}

interface ChatBoxProps {
  visitId: string;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ visitId }) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch messages
  const { data: messages, isLoading } = useQuery({
    queryKey: ['visit-messages', visitId],
    queryFn: async () => {
      const response = await privateApiClient.get(`/visits/${visitId}/messages/`);
      return response.data as Message[];
    },
    refetchInterval: 5000, // Poll every 5 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { message: string; file?: File }) => {
      const formData = new FormData();
      formData.append('message', data.message);
      if (data.file) {
        formData.append('attachment', data.file);
      }
      const response = await privateApiClient.post(
        `/visits/${visitId}/messages/`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visit-messages', visitId] });
      setMessage('');
      setSelectedFile(null);
    },
  });

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim() && !selectedFile) return;
    sendMessageMutation.mutate({ message: message.trim(), file: selectedFile || undefined });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#FEC925]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px]">
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages && messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_type === 'partner' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  msg.sender_type === 'partner'
                    ? 'bg-[#FEC925] text-[#1C1C1B]'
                    : msg.sender_type === 'system'
                    ? 'bg-gray-200 text-gray-700 text-center'
                    : 'bg-white border-2 border-gray-200 text-[#1C1C1B]'
                }`}
              >
                {msg.sender_type !== 'system' && (
                  <p className="text-xs font-semibold mb-1 opacity-70">{msg.sender_name}</p>
                )}
                <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                
                {/* Attachments */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {msg.attachments.map((att, index) => (
                      <a
                        key={index}
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 bg-black bg-opacity-10 rounded hover:bg-opacity-20 transition-colors"
                      >
                        {att.type.startsWith('image/') ? (
                          <ImageIcon className="w-4 h-4" />
                        ) : (
                          <File className="w-4 h-4" />
                        )}
                        <span className="text-xs truncate">{att.name}</span>
                      </a>
                    ))}
                  </div>
                )}
                
                <p className="text-xs opacity-60 mt-1">
                  {new Date(msg.created_at).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation with the customer</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Selected File Preview */}
      {selectedFile && (
        <div className="mb-3 p-3 bg-gray-100 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <File className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-700">{selectedFile.name}</span>
          </div>
          <button
            onClick={() => setSelectedFile(null)}
            className="text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-2">
        <label className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors">
          <Paperclip className="w-5 h-5 text-gray-600" />
          <input
            type="file"
            className="hidden"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            accept="image/*,.pdf,.doc,.docx"
          />
        </label>

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#FEC925] focus:outline-none"
          disabled={sendMessageMutation.isPending}
        />

        <button
          onClick={handleSend}
          disabled={(!message.trim() && !selectedFile) || sendMessageMutation.isPending}
          className="flex items-center justify-center w-10 h-10 bg-[#FEC925] hover:bg-[#e6b31f] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sendMessageMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5 text-[#1C1C1B]" />
          )}
        </button>
      </div>
    </div>
  );
};