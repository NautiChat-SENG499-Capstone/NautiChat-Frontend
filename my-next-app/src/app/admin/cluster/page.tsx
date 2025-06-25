'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import AdminGuard from '@/components/AdminGuard'
import api from '@/lib/api'

export default function ClusteredQueriesAccordionGridPage() {
  const [clusters, setClusters] = useState<Record<string, string[]>>({})
  const [expanded, setExpanded] = useState<string | null>(null)
  const [modalCluster, setModalCluster] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchClusters = async () => {
      setLoading(true)
      setError('')
      try {
        const token = localStorage.getItem('access_token')
        if (!token) {
          setError('Unauthorized: Please log in as an admin.')
          return
        }

        const res = await api.get('/admin/messages/clustered', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setClusters(res.data)
      } catch (err: any) {
        console.error('Error fetching clusters:', err)
        setError('Failed to load clustered queries.')
      } finally {
        setLoading(false)
      }
    }

    fetchClusters()
  }, [])

  // Handle Escape key for modal close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalCluster(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Disable body scroll when modal is open
  useEffect(() => {
    if (modalCluster) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
  }, [modalCluster])

  const clusterKeys = Object.keys(clusters).sort((a, b) => {
    if (a === '-1') return 1
    if (b === '-1') return -1
    return Number(a) - Number(b)
  })

  const toggleExpand = (clusterId: string) => {
    setExpanded((prev) => (prev === clusterId ? null : clusterId))
  }

  return (
    <AdminGuard>
      <AdminLayout>
        {/* Main Content (blurred when modal active) */}
        <section className={`w-full max-w-screen-xl mx-auto py-4 px-6 ${modalCluster ? 'blur-sm' : ''}`}>
          <div className="ml-[-33px]">
            <header className="mb-4">
              <h1 className="text-2xl font-bold text-gray-800">User Question Groups</h1>
              <p className="text-sm text-gray-600">
                Explore clusters of similar user queries.
              </p>
            </header>

            {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

            {loading ? (
              <p className="text-center text-gray-500">Loading clustered queries...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clusterKeys.map((clusterId) => (
                  <div
                    key={clusterId}
                    className={`bg-white border border-gray-200 rounded-xl shadow-sm transition-all duration-300 relative overflow-hidden ${
                      expanded === clusterId ? 'h-[250px]' : 'h-[80px]'
                    }`}
                  >
                    <button
                      onClick={() => toggleExpand(clusterId)}
                      className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition"
                    >
                      <span className="font-semibold text-blue-600 text-sm">
                        {clusterId === '-1' ? 'Uncategorized' : `Cluster ${clusterId}`}
                      </span>
                      <span className="text-xs text-gray-500">
                        {clusters[clusterId].length} queries
                      </span>
                    </button>

                    {expanded === clusterId && (
                      <div className="px-4 pb-3 max-h-[200px] overflow-y-auto relative">
                        {/* Expand Button with Icon */}
                        <button
                          onClick={() => setModalCluster(clusterId)}
                          className="absolute top-1 right-1 text-lg text-blue-600 hover:text-blue-800 transition"
                          title="Expand"
                        >
                          ⤢
                        </button>

                        <ul className="list-disc pl-4 text-xs text-gray-800 space-y-1 pt-6">
                          {clusters[clusterId].map((query, idx) => (
                            <li key={idx}>{query}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Modal (click background OR press ESC to close) */}
        {modalCluster && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
            onClick={() => setModalCluster(null)}
          >
            <div
              className="bg-white rounded-lg shadow-xl p-6 max-w-3xl w-3/4 max-h-[80vh] overflow-y-auto border border-gray-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-blue-600">
                  {modalCluster === '-1' ? 'Uncategorized' : `Cluster ${modalCluster}`}
                </h2>
                <button
                  onClick={() => setModalCluster(null)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <ul className="list-disc pl-5 text-sm text-gray-800 space-y-2">
                {clusters[modalCluster].map((query, idx) => (
                  <li key={idx}>{query}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </AdminLayout>
    </AdminGuard>
  )
}
