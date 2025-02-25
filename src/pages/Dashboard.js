import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('Published');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Mapping untuk mengonversi nama tab ke status yang sesuai dengan backend
  const statusMapping = {
    Published: 'publish',
    Drafts: 'draft',
    Trashed: 'trash' // Pastikan ini konsisten dengan validasi backend
  };

  // Fungsi untuk mengambil data artikel
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `http://localhost:5000/article/10/0?status=${statusMapping[activeTab]}`
      );
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching posts", error);
      if (error.response) {
        setError(`Error: ${error.response.status} - ${error.response.data.message}`);
      } else if (error.request) {
        setError("Tidak ada respon dari server. Periksa koneksi jaringan Anda.");
      } else {
        setError("Terjadi kesalahan. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  // Memanggil fetchPosts ketika activeTab berubah
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Fungsi navigasi ke halaman edit
  const handleEdit = (id) => {
    navigate(`/edit/${id}`);
  };

  // Fungsi untuk mengubah status artikel menjadi "trash" (trash) dan pindah ke tab Trashed
  const handleTrash = async (id) => {
    try {
      // Mengirim update dengan payload status "trash"
      await axios.patch(`http://localhost:5000/article/${id}`, { status: 'trash' });
      // Set activeTab ke "Trashed" agar daftar di-refresh dengan status "trash"
      setActiveTab('Trashed');
    } catch (error) {
      console.error("Error updating post", error);
      setError("Gagal memperbarui artikel.");
    }
  };

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>All Posts</h2>
        <button className="btn btn-primary" onClick={() => navigate('/add-new')}>
          New Article
        </button>
      </div>

      {/* Tabs menggunakan komponen Nav Bootstrap */}
      <ul className="nav nav-tabs">
        {['Published', 'Drafts', 'Trashed'].map((tab) => (
          <li className="nav-item" key={tab}>
            <button
              className={`nav-link ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          </li>
        ))}
      </ul>

      {loading && (
        <div className="text-center my-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {error && <p className="text-danger">{error}</p>}

      {/* Table untuk menampilkan list artikel */}
      <table className="table table-striped table-bordered mt-3">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th style={{ width: '150px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {posts.length > 0 ? (
            posts.map(post => (
              <tr key={post.id}>
                <td>{post.title}</td>
                <td>{post.category}</td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => handleEdit(post.id)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleTrash(post.id)}
                  >
                    Trash
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center">Tidak ada artikel ditemukan.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
