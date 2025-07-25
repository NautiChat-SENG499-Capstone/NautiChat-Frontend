'use client';

import { useState, useRef, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import AdminGuard from '@/components/AdminGuard';
import api from '@/lib/api';

export default function KnowledgeBasePage() {
  const [activeTab, setActiveTab] = useState<'qa' | 'upload' | 'view'>('qa');
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [knowledgeEntries, setKnowledgeEntries] = useState<{ source: string; id: number; usage_count?: number }[]>([]);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [selectedFile, setSelectedFile] = useState<{ source: string; id: number } | null>(null);
  const [textSource, setTextSource] = useState('');
  const [uploadSource, setUploadSource] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    const handleClickOutside = () => {
      if (popoverVisible) setPopoverVisible(false);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [popoverVisible]);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const accessToken = localStorage.getItem('access_token');
        const res = await api.get('/admin/documents', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setKnowledgeEntries(res.data);
      } catch (err) {
        console.error('Error loading documents:', err);
      }
    }
    fetchDocuments();
  }, []);

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      alert('No access token found. Please log in again.');
      return;
    }

    if (!textSource.trim() || !text.trim()) {
      alert('Please fill in both the source and the text.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('source', textSource);
      formData.append('input_text', text);

      await api.post('/admin/documents/raw-data', formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // Do NOT set 'Content-Type' manually — let Axios set it automatically
        },
      });

      alert('✅ Text submitted successfully!');
      setText('');
      setTextSource('');
    } catch (err: any) {
      console.error('Submit error:', err.response || err);
      alert('Failed to submit text.');
    }
  }


  const handleUploadSubmit = async () => {
  if (!uploadFiles || uploadFiles.length === 0) {
    alert('Please select a file to upload.');
    return;
  }

  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) {
    alert('No access token found. Please log in again.');
    return;
  }

  if (!uploadSource.trim()) {
    alert('Please enter a name (source) for the uploaded document.');
    return;
  }

  try {
    const file = uploadFiles[0]; // Get the first (and only) selected file
    const formData = new FormData();
    formData.append('source', uploadSource);
    formData.append('file', file); // Make sure this is a File object

    await api.post('/admin/documents/pdf', formData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        // DO NOT set 'Content-Type' manually – let axios handle it
      },
    });

    alert('✅ Document uploaded successfully!');
    setUploadFiles(null);
    setUploadSource('');
    setActiveTab('view');

    // Refresh the document list
    const res = await api.get('/admin/documents', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    setKnowledgeEntries(res.data);

  } catch (err: any) {
    console.error('Upload error:', err.response || err);
    alert('Upload failed.');
  }
};


  return (
    <AdminGuard>
      <AdminLayout>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Knowledge Base</h1>

        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setActiveTab('qa')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              activeTab === 'qa'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            ➕ Add Information
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              activeTab === 'upload'
                ? 'bg-green-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            📄 Upload Document
          </button>
          <button
            onClick={() => setActiveTab('view')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              activeTab === 'view'
                ? 'bg-purple-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            🗂️ View All Entries
          </button>
        </div>

        <div className="bg-white shadow rounded-xl p-6">
          {activeTab === 'qa' && (
            <form className="space-y-4" onSubmit={handleTextSubmit}>
              <h2 className="text-lg font-semibold text-gray-700">Add Information to the Knowledge Base</h2>
              <div>
                <label className="block text-sm font-medium text-gray-600">Source</label>
                <input
                  type="text"
                  placeholder="Provide your source"
                  className="w-full border rounded-md p-2 mt-1"
                  value={textSource}
                  onChange={(e) => setTextSource(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Text</label>
                <textarea
                  placeholder="Enter your text"
                  rows={4}
                  className="w-full border rounded-md p-2 mt-1"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                ></textarea>
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Add to Knowledge Base
              </button>
            </form>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">Upload Documents</h2>

              <div>
                <label className="block text-sm font-medium text-gray-600">Document Name (Source)</label>
                <input
                  type="text"
                  placeholder="Enter a name for the document"
                  className="w-full border rounded-md p-2 mt-1"
                  value={uploadSource}
                  onChange={(e) => setUploadSource(e.target.value)}
                />
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,.doc,.docx"
                multiple={false}
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    setUploadFiles(files);
                  } else {
                    setUploadFiles(null);
                  }
                }}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Upload
              </button>

              {uploadFiles && (
                <div className="mt-4 space-y-2">
                  <h3 className="font-medium text-gray-700">Selected File:</h3>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    <li>{uploadFiles[0]?.name}</li>
                  </ul>
                  <button
                    type="button"
                    onClick={handleUploadSubmit}
                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Submit
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {activeTab === 'view' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Existing Knowledge Entries</h2>
            <ul className="text-sm text-blue-600 list-disc ml-5 space-y-1">
              {knowledgeEntries.map((entry, index) => (
                <li
                  key={index}
                  className="cursor-pointer hover:underline relative"
                  onClick={(e) => {
                    e.stopPropagation();
                    const rect = (e.target as HTMLElement).getBoundingClientRect();
                    setPopoverPosition({
                      top: rect.top + window.scrollY - 10,
                      left: rect.left + window.scrollX + rect.width / 2,
                    });
                    setSelectedFile(entry);
                    setPopoverVisible(true);
                  }}
                >
                  {entry.source}
                </li>
              ))}
            </ul>
          </div>
        )}

        {popoverVisible && selectedFile && (
          <div
            className="absolute z-50 bg-white border rounded-lg shadow-md p-4 text-sm flex flex-col items-center"
            style={{
              position: 'absolute',
              top: popoverPosition.top,
              left: popoverPosition.left,
              transform: 'translate(-50%, -110%)',
            }}
          >
            <p className="mb-2 text-center text-gray-800">Open file in browser<br />or download file?</p>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 rounded border text-gray-800 hover:bg-gray-100"
                onClick={() => {
                  const fileUrl = `/admin/documents/${selectedFile.id}`;
                  window.open(fileUrl, '_blank');
                  setPopoverVisible(false);
                }}
              >
                Open
              </button>

              <button
                className="px-3 py-1 rounded border text-gray-800 hover:bg-gray-100"
                onClick={() => {
                  const fileUrl = `/admin/documents/${selectedFile.id}`;
                  const a = document.createElement('a');
                  a.href = fileUrl;
                  a.download = selectedFile.source;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  setPopoverVisible(false);
                }}
              >
                Download
              </button>


            </div>
          </div>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
