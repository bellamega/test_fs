import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddNewArticle = () => {
  // State untuk menyimpan data form
  const [article, setArticle] = useState({
    title: '',
    content: '',
    category: '',
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fungsi untuk meng-handle perubahan di setiap input
  const handleChange = (e) => {
    setArticle({
      ...article,
      [e.target.name]: e.target.value,
    });
  };

  // Fungsi untuk submit data form ke backend
  // status bisa 'publish' atau 'draft'
  const handleSubmit = async (status) => {
    try {
      // Gabungkan data dari state dengan status yang dipilih
      const payload = { ...article, status };
      await axios.post('http://localhost:5000/article/', payload);
      navigate('/posts'); // Setelah berhasil, arahkan ke Dashboard
    } catch (error) {
      console.error('Error adding new article', error);
      setError('Gagal menambahkan artikel.');
    }
  };

  return (
    <div className="container my-4">
      <h2>Add New Article</h2>
      {error && <p className="text-danger">{error}</p>}
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
          />
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
          Draft
        </button>
      </form>
    </div>
  );
};

export default AddNewArticle;
