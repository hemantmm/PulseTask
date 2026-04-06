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
  const filteredVideos = useMemo(() => {
    if (!filters.q) return videos;

    const term = filters.q.toLowerCase();
    return videos.filter(
      (video) =>
        video.title.toLowerCase().includes(term) ||
        video.description?.toLowerCase().includes(term) ||
        video.originalName?.toLowerCase().includes(term)
    );
  }, [videos, filters.q]);

  const homeStats = useMemo(() => {
    const processed = videos.filter((video) => video.status === 'processed').length;
    const processing = videos.filter((video) => video.status === 'processing').length;
    const flagged = videos.filter((video) => video.sensitivity === 'flagged').length;

    return {
      total: videos.length,
      processed,
      processing,
      flagged
    };
  }, [videos]);

  return (
    <main className="page-shell home-page">
      <NavBar />
      <section className="home-hero">
        <p className="home-kicker">PulseTask Command Center</p>
        <h2 className="home-title">Video operations at a glance</h2>
        <p className="home-subtitle">
          Manage ingest, moderation, and playback from a single workspace built for {user.role} users.
        </p>
        <div className="home-stats">
          <article className="home-stat">
            <strong>{homeStats.total}</strong>
            <span>Total Videos</span>
          </article>
          <article className="home-stat">
            <strong>{homeStats.processed}</strong>
            <span>Ready To Play</span>
          </article>
          <article className="home-stat">
            <strong>{homeStats.processing}</strong>
            <span>In Processing</span>
          </article>
          <article className="home-stat">
            <strong>{homeStats.flagged}</strong>
            <span>Flagged Content</span>
          </article>
        </div>
      </section>

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
          videos={filteredVideos}
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
