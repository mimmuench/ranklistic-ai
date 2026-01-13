
import React, { useState, useRef, useEffect } from 'react';
import type { AuditItem, ChatMessage } from '../types';
import { CloseIcon, SparklesIcon, PaperClipIcon } from './icons';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditItem: AuditItem;
  history: ChatMessage[];
  onSendMessage: (message: string, image: string | null) => void;
  isLoading: boolean;
}

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // remove the `data:image/jpeg;base64,` part
        resolve(base64String.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
};

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, auditItem, history, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ preview: string; data: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, isLoading]);

  if (!isOpen) return null;

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      const data = await blobToBase64(file);
      setSelectedImage({ preview, data });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || selectedImage) && !isLoading) {
      onSendMessage(input.trim(), selectedImage?.data || null);
      setInput('');
      setSelectedImage(null);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      aria-labelledby="chat-modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-gray-800 border border-orange-500/30 rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="w-6 h-6 text-orange-400" />
            <h2 id="chat-modal-title" className="text-xl font-bold text-white">
              AI Assistant: <span className="text-orange-400">{auditItem.category}</span>
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close chat">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          {history.map((msg, index) => (
            <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-white" /></div>}
              <div className={`max-w-md p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-orange-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-300 rounded-bl-none'}`}>
                {msg.image && <img src={`data:image/jpeg;base64,${msg.image}`} alt="User upload" className="rounded-lg mb-2 max-h-60" />}
                {msg.text && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                
                {/* Feedback Icons for AI messages */}
                {msg.sender === 'ai' && (
                    <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-gray-600/50">
                        <button className="text-gray-500 hover:text-green-400 transition-colors" title="Helpful">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                        </button>
                        <button className="text-gray-500 hover:text-red-400 transition-colors" title="Not Helpful">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" /></svg>
                        </button>
                    </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-end gap-2 justify-start">
               <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-white" /></div>
               <div className="max-w-md p-3 rounded-2xl bg-gray-700 text-gray-300 rounded-bl-none">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                  </div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        <footer className="p-4 border-t border-gray-700">
          {selectedImage && (
            <div className="relative w-24 h-24 mb-2 p-1 border border-gray-600 rounded-lg">
                <img src={selectedImage.preview} alt="Preview" className="w-full h-full object-cover rounded" />
                <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-0.5">
                    <CloseIcon className="w-4 h-4" />
                </button>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask for help or upload an image..."
                className="w-full pl-12 pr-24 py-3 bg-gray-900 border border-gray-600 rounded-full focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-white placeholder-gray-500"
                disabled={isLoading}
              />
               <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                className="hidden"
                accept="image/png, image/jpeg"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute left-3 text-gray-400 hover:text-orange-400 transition-colors"
                aria-label="Attach image"
              >
                <PaperClipIcon className="w-6 h-6" />
              </button>
              <button
                type="submit"
                disabled={isLoading || (!input.trim() && !selectedImage)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            </div>
          </form>
        </footer>
      </div>
    </div>
  );
};
