import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const EditArticle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState({
    title: '',
    content: '',
    category: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ambil data artikel berdasarkan id
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/article/${id}`);
        setArticle(response.data);
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Gagal mengambil artikel.');
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  const handleChange = (e) => {
    setArticle({ ...article, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (status) => {
    try {
      const payload = { ...article, status };
      await axios.patch(`http://localhost:5000/article/${id}`, payload);
      navigate('/posts');
    } catch (err) {
      console.error('Error updating article:', err);
      setError('Gagal memperbarui artikel.');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container my-4">
      <h2>Edit Article</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form>
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            name="title"
            className="form-control"
            value={article.title}
            onChange={handleChange}
            required
            minLength={20}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Content</label>
          <textarea
            name="content"
            className="form-control"
            value={article.content}
            onChange={handleChange}
            required
            minLength={200}
            rows="8"
          ></textarea>
        </div>
        <div className="mb-3">
          <label className="form-label">Category</label>
          <input
            type="text"
            name="category"
            className="form-control"
            value={article.category}
            onChange={handleChange}
            required
            minLength={3}
          />
        </div>
        <div className="d-flex">
          <button
            type="button"
            className="btn btn-primary me-2"
            onClick={() => handleSubmit('publish')}
          >
            Publish
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleSubmit('draft')}
          >
            Save as Draft
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditArticle;
