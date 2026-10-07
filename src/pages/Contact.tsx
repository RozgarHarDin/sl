import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { SEO } from '../components/common/SEO';

export const Contact: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Preset Specification Update Request');
  const [message, setMessage] = useState('');
  const [ticketId, setTicketId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTicket = 'SKP-TKT-' + Math.floor(100000 + Math.random() * 900000);
    setTicketId(newTicket);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 pb-16">
      <SEO
        title="Contact & Support – SarkariPixel"
        description="Get in touch with the SarkariPixel team for feedback, portal dimension updates, or technical suggestions."
        canonicalUrl="https://sarkaripixel.klyvix.workers.dev/contact"
      />

      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-4xl font-black text-white">Contact & Support</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Found a recruitment notification update or have a feature suggestion?
        </p>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        {ticketId ? (
          <div className="text-center space-y-4 py-6">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">Inquiry Received!</h3>
            <p className="text-xs text-slate-300">
              Your inquiry has been logged with ticket ID: <strong>{ticketId}</strong>. Thank you for helping keep SarkariPixel accurate for all candidates.
            </p>
            <button
              type="button"
              onClick={() => {
                setTicketId(null);
                setMessage('');
              }}
              className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold transition"
            >
              Send Another Query
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Rahul Sharma"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Preset Specification Update Request">Exam Preset Rule Update</option>
                  <option value="Technical Bug Report">Technical Bug Report</option>
                  <option value="General Feedback">General Feedback</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Message Details</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={4}
                placeholder="Describe your suggestion or provide official recruitment notification link..."
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Inquiry</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
