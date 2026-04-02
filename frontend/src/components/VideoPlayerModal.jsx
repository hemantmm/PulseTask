export default function VideoPlayerModal({ video, token, onClose }) {
  if (!video) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{video.title}</h3>
          <button className="ghost" onClick={onClose}>
            Close
          </button>
        </div>
        <video
          controls
          autoPlay
          src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'}/videos/${video._id}/stream?token=${token}`}
          className="player"
        />
      </div>
    </div>
  );
}
