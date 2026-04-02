import { useEffect, useMemo, useState } from 'react';
import NavBar from '../components/NavBar';
import UploadForm from '../components/UploadForm';
import VideoTable from '../components/VideoTable';
import VideoPlayerModal from '../components/VideoPlayerModal';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { connectSocket } from '../services/socket';

export default function DashboardPage() {
  const { token, user } = useAuth();

  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ q: '', status: '', sensitivity: '' });

  useEffect(() => {
    fetchVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.sensitivity, filters.q]);

  useEffect(() => {
    const socket = connectSocket(token);

    socket.on('video:progress', (payload) => {
      setVideos((prev) =>
        prev.map((video) =>
          video._id === payload.videoId
            ? {
                ...video,
                processingProgress: payload.progress,
                status: payload.status,
                sensitivity: payload.sensitivity
              }
            : video
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  async function fetchVideos() {
    try {
      setError('');
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.sensitivity) params.sensitivity = filters.sensitivity;
      if (filters.q) params.q = filters.q;

      const res = await api.get('/videos', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setVideos(res.data.videos);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load videos');
    }
  }

  async function deleteVideo(videoId) {
    try {
      await api.delete(`/videos/${videoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVideos((prev) => prev.filter((video) => video._id !== videoId));
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  }

  const canUpload = useMemo(() => ['editor', 'admin'].includes(user.role), [user.role]);
  const canDelete = canUpload;

  return (
    <main className="page-shell">
      <NavBar />
      <section className="content-grid">
        {canUpload ? (
          <UploadForm
            token={token}
            onCreated={(video) => {
              setVideos((prev) => [video, ...prev]);
            }}
          />
        ) : (
          <section className="card">
            <h2>Read-only Access</h2>
            <p>Your role is viewer. You can stream processed videos but cannot upload or delete.</p>
          </section>
        )}

        <VideoTable
          videos={videos.filter((video) => {
            if (!filters.q) return true;
            const term = filters.q.toLowerCase();
            return (
              video.title.toLowerCase().includes(term) ||
              video.description?.toLowerCase().includes(term) ||
              video.originalName?.toLowerCase().includes(term)
            );
          })}
          filters={filters}
          onFilterChange={(key, value) => {
            setFilters((prev) => ({ ...prev, [key]: value }));
          }}
          onPlay={setSelectedVideo}
          onDelete={deleteVideo}
          canDelete={canDelete}
        />
      </section>

      {error ? <p className="error-text app-error">{error}</p> : null}
      <VideoPlayerModal video={selectedVideo} token={token} onClose={() => setSelectedVideo(null)} />
    </main>
  );
}
