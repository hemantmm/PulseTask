import { useMemo, useState } from 'react';
import api from '../services/api';

export default function UploadForm({ token, onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [videoFile, setVideoFile] = useState(null);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const canSubmit = useMemo(() => Boolean(title && videoFile && !busy), [title, videoFile, busy]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!videoFile) {
      setError('Please choose a video file.');
      return;
    }

    try {
      setBusy(true);
      const form = new FormData();
      form.append('title', title);
      form.append('description', description);
      form.append('category', category);
      form.append('video', videoFile);

      const res = await api.post('/videos', form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (evt) => {
          if (!evt.total) return;
          setUploadPercent(Math.round((evt.loaded / evt.total) * 100));
        }
      });

      setTitle('');
      setDescription('');
      setCategory('general');
      setVideoFile(null);
      setUploadPercent(0);
      onCreated(res.data.video);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Upload Video</h2>
      <div className="grid-2">
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <input
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="file"
        accept="video/*"
        onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
      />
      {uploadPercent > 0 ? (
        <div className="progress-wrap">
          <div className="progress-bar" style={{ width: `${uploadPercent}%` }} />
          <span>{uploadPercent}% uploaded</span>
        </div>
      ) : null}
      {error ? <p className="error-text">{error}</p> : null}
      <button disabled={!canSubmit}>{busy ? 'Uploading...' : 'Upload Video'}</button>
    </form>
  );
}
