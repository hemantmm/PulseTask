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

  const canUpload = useMemo(() => ['editor', 'admin'].includes(user?.role), [user?.role]);
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

    const greeting = useMemo(() => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Good morning';
      if (hour < 18) return 'Good afternoon';
      return 'Good evening';
    }, []);

  const homeStats = useMemo(() => {
    const processed = videos.filter((video) => video.status === 'processed').length;
    const processing = videos.filter((video) => video.status === 'processing').length;
      const failed = videos.filter((video) => video.status === 'failed').length;
    const flagged = videos.filter((video) => video.sensitivity === 'flagged').length;
      const safe = videos.filter((video) => video.sensitivity === 'safe').length;
      const totalSizeMb = videos.reduce((sum, video) => sum + (video.size || 0), 0) / (1024 * 1024);
      const completionRate = videos.length ? Math.round((processed / videos.length) * 100) : 0;
      const newestVideo = [...videos]
        .filter((video) => video.createdAt)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    return {
      total: videos.length,
      processed,
      processing,
        failed,
        flagged,
        safe,
        totalSizeMb,
        completionRate,
        newestVideo
    };
  }, [videos]);

    const role = user?.role || 'viewer';

  return (
    <main className="page-shell home-page">
      <NavBar />
      <section className="home-hero">
          <p className="home-kicker">PulseTask Command Center</p>
          <h2 className="home-title">{greeting}, keep content operations moving</h2>
          <p className="home-subtitle">
            Live visibility across ingest, moderation, and playback for your <strong>{role}</strong>{' '}
            workspace.
          </p>
          <div className="home-chips">
            <span className="home-chip">Tenant: {user?.tenantId}</span>
            <span className="home-chip">Role: {role}</span>
            <span className="home-chip">Completion: {homeStats.completionRate}%</span>
          </div>
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
          <article className="home-stat">
            <strong>{homeStats.failed}</strong>
            <span>Failed Jobs</span>
          </article>
        </div>
        <div className="home-signal-strip" aria-label="Processing signal strip">
          <div className="signal-block">
            <p>Storage footprint</p>
            <strong>{homeStats.totalSizeMb.toFixed(1)} MB</strong>
          </div>
          <div className="signal-block">
            <p>Safe assets</p>
            <strong>{homeStats.safe}</strong>
          </div>
          <div className="signal-block">
            <p>Latest ingest</p>
            <strong>{homeStats.newestVideo?.title || 'No uploads yet'}</strong>
          </div>
        </div>
      </section>

      <section className="home-insights" aria-label="Operational insights">
        <article className="home-insight-card">
          <h3>Queue Health</h3>
          <p className="insight-note">
            {homeStats.processing > 0
              ? `${homeStats.processing} video(s) are still in processing.`
              : 'No active processing queue right now.'}
          </p>
          <div className="insight-meter">
            <div style={{ width: `${Math.max(homeStats.completionRate, 6)}%` }} />
          </div>
          <small>{homeStats.completionRate}% of assets are ready to play.</small>
        </article>

        <article className="home-insight-card">
          <h3>Moderation Radar</h3>
          <p className="insight-note">
            {homeStats.flagged > 0
              ? `${homeStats.flagged} flagged video(s) require review.`
              : 'No flagged content detected in current filters.'}
          </p>
          <div className="insight-tags">
            <span>Safe: {homeStats.safe}</span>
            <span>Flagged: {homeStats.flagged}</span>
            <span>Unknown: {Math.max(homeStats.total - homeStats.safe - homeStats.flagged, 0)}</span>
          </div>
        </article>
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
