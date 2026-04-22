function statusClass(status) {
  if (status === 'processed') return 'ok';
  if (status === 'failed') return 'bad';
  return 'warn';
}

export default function VideoTable({
  videos,
  onPlay,
  onDelete,
  canDelete,
  filters,
  onFilterChange
}) {
  return (
    <section className="card">
      <h2>Video Library</h2>
      <p className="section-lead">Search, filter, and review upload status across your tenant.</p>
      <div className="filters">
        <input
          placeholder="Search title or description"
          value={filters.q}
          onChange={(e) => onFilterChange('q', e.target.value)}
        />
        <select value={filters.status} onChange={(e) => onFilterChange('status', e.target.value)}>
          <option value="">All Statuses</option>
          <option value="uploaded">Uploaded</option>
          <option value="processing">Processing</option>
          <option value="processed">Processed</option>
          <option value="failed">Failed</option>
        </select>
        <select
          value={filters.sensitivity}
          onChange={(e) => onFilterChange('sensitivity', e.target.value)}
        >
          <option value="">All Sensitivity</option>
          <option value="safe">Safe</option>
          <option value="flagged">Flagged</option>
          <option value="unknown">Unknown</option>
        </select>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Sensitivity</th>
              <th>Progress</th>
              <th>Size (MB)</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video) => (
              <tr key={video._id}>
                <td>{video.title}</td>
                <td>
                  <span className={`pill ${statusClass(video.status)}`}>{video.status}</span>
                </td>
                <td>{video.sensitivity}</td>
                <td>
                  <div className="tiny-progress">
                    <div style={{ width: `${video.processingProgress || 0}%` }} />
                  </div>
                  <small>{video.processingProgress || 0}%</small>
                </td>
                <td>{(video.size / (1024 * 1024)).toFixed(1)}</td>
                <td>{video.category || 'general'}</td>
                <td className="actions">
                  <button
                    onClick={() => onPlay(video)}
                    disabled={video.status !== 'processed'}
                    className="ghost"
                  >
                    Play
                  </button>
                  {canDelete ? (
                    <button onClick={() => onDelete(video._id)} className="danger">
                      Delete
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
            {!videos.length ? (
              <tr>
                <td colSpan={7}>No videos found for selected filters.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
