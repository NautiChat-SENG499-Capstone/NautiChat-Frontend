'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import AdminGuard from '@/components/AdminGuard';
import api from '@/lib/api';

export default function AdminLandingPage() {
  // ✅ State
  const [queryCount, setQueryCount] = useState<number | null>(null);
  const [feedbackStats, setFeedbackStats] = useState<{
    total: number;
    thumbsUp: number;
    thumbsDown: number;
  } | null>(null);
  const [docCount, setDocCount] = useState<number | null>(null);
  const [adminUserCount, setAdminUserCount] = useState<number | null>(null);
  const [clusterCount, setClusterCount] = useState<number | null>(null);

  const [errors, setErrors] = useState<string[]>([]);

  // ✅ Fetch data on mount
  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      setErrors(prev => [...prev, 'Unauthorized']);
      return;
    }

    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    // Queries & Feedback
    api.get('/admin/messages', { headers })
      .then((res) => {
        const all = res.data;
        setQueryCount(all.length);

      const ratedMessages = all.filter((msg: any) => msg.feedback && msg.feedback.rating !== null && msg.feedback.rating !== undefined);
      const thumbsUp = ratedMessages.filter((msg: any) => msg.feedback.rating === 2).length;
      const thumbsDown = ratedMessages.filter((msg: any) => msg.feedback.rating === 1).length;
      const total = ratedMessages.length;


        setFeedbackStats({ total, thumbsUp, thumbsDown });
      })
      .catch(() => setErrors(prev => [...prev, 'Failed to load queries/feedback']));

    // Knowledge Base
    api.get('/admin/documents', { headers })
      .then((res) => setDocCount(res.data.length))
      .catch(() => setErrors(prev => [...prev, 'Failed to load documents']));

    // Admin Users
    api.get('/admin/users', { headers })
      .then((res) => {
        const admins = res.data.filter((user: any) => user.is_admin === true);
        setAdminUserCount(admins.length);
      })
      .catch(() => setErrors(prev => [...prev, 'Failed to load users']));

    // Clusters
    api.get('/admin/messages/clustered', { headers })
      .then((res) => setClusterCount(Object.keys(res.data).length))
      .catch(() => setErrors(prev => [...prev, 'Failed to load clusters']));
  }, []);

  return (
    <AdminGuard>
      <AdminLayout>
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">Admin control panel for chatbot management</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Queries */}
          <Link href="/admin/queries">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer p-6">
              <div className="mb-4">
                <div className="text-xl font-semibold text-[#002175]">User Queries</div>
                <div className="text-sm text-gray-500">Analyze and monitor submitted questions</div>
              </div>
              <div className="h-24 bg-gray-100 rounded-md flex items-center justify-center text-[#0068A3] text-lg font-medium">
                {queryCount !== null ? `${queryCount} queries` : 'Loading...'}
              </div>
            </div>
          </Link>

          {/* User Feedback */}
          <Link href="/admin/feedback">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer p-6">
              <div className="mb-4">
                <div className="text-xl font-semibold text-[#002175]">User Feedback</div>
                <div className="text-sm text-gray-500">View chatbot ratings and user comments</div>
              </div>
              <div className="h-24 bg-gray-100 rounded-md flex flex-col items-center justify-center text-[#0068A3] text font-medium leading-tight">
                {feedbackStats ? (
                  <>
                    <div>{feedbackStats.total} Ratings</div>
                    <div className="flex gap-4">
                      <span>
                        Positive: <span className="text-green-600">{Math.round((feedbackStats.thumbsUp / feedbackStats.total) * 100)}%</span>
                      </span>
                      <span>
                        Negative: <span className="text-red-600">{Math.round((feedbackStats.thumbsDown / feedbackStats.total) * 100)}%</span>
                      </span>
                    </div>
                  </>
                ) : (
                  'Loading...'
                )}
              </div>

            </div>
          </Link>

          {/* Knowledge Base */}
          <Link href="/admin/knowledge">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer p-6">
              <div className="mb-4">
                <div className="text-xl font-semibold text-[#002175]">Manage Knowledge Base</div>
                <div className="text-sm text-gray-500">Add questions, answers, and upload documents</div>
              </div>
              <div className="h-24 bg-gray-100 rounded-md flex items-center justify-center text-[#0068A3] text-lg font-medium">
                {docCount !== null ? `${docCount} documents` : 'Loading...'}
              </div>
            </div>
          </Link>

          {/* Launch NautiChat */}
          <Link href="/chat">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer p-6">
              <div className="mb-4">
                <div className="text-xl font-semibold text-[#002175]">Launch NautiChat</div>
                <div className="text-sm text-gray-500">Open the chatbot interface</div>
              </div>
              <div className="h-24 bg-gray-100 rounded-md flex items-center justify-center">
                <img src="/NautiChatLogo.png" alt="NautiChat Logo" className="h-16 object-contain" />
              </div>

            </div>
          </Link>

          {/* Admin Users */}
          <Link href="/admin/users">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer p-6">
              <div className="mb-4">
                <div className="text-xl font-semibold text-[#002175]">Manage Admin Users</div>
                <div className="text-sm text-gray-500">Add, edit, or remove system users</div>
              </div>
              <div className="h-24 bg-gray-100 rounded-md flex items-center justify-center text-[#0068A3] text-lg font-medium">
                {adminUserCount !== null ? `${adminUserCount} admins` : 'Loading...'}
              </div>
            </div>
          </Link>

          {/* Clusters */}
          <Link href="/admin/cluster">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer p-6">
              <div className="mb-4">
                <div className="text-xl font-semibold text-[#002175]">User Question Groups</div>
                <div className="text-sm text-gray-500">View grouped queries by topic or intent</div>
              </div>
              <div className="h-24 bg-gray-100 rounded-md flex items-center justify-center text-[#0068A3] text-lg font-medium">
                {clusterCount !== null ? `${clusterCount} clusters` : 'Loading...'}
              </div>
            </div>
          </Link>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
