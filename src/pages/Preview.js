// src/pages/Preview.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Preview = () => {
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchArticles();
  }, [page]);

  const fetchArticles = async () => {
    try {
      const offset = (page - 1) * limit;
      const response = await axios.get(`/article/${limit}/${offset}?status=publish`);
      setArticles(response.data);
    } catch (error) {
      console.error("Error fetching articles", error);
    }
  };

  return (
    <div className="container my-4">
      <h2>Blog Preview</h2>
      {articles.map(article => (
        <div key={article.id} className="card mb-3">
          <div className="card-body">
            <h3 className="card-title">{article.title}</h3>
            <p className="card-text">
              {article.content.substring(0, 200)}...
            </p>
          </div>
        </div>
      ))}
  
      {/* Pagination */}
      <nav>
        <ul className="pagination">
          <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => setPage(prev => Math.max(prev - 1, 1))}>
              Prev
            </button>
          </li>
          <li className="page-item disabled">
            <button className="page-link">Page {page}</button>
          </li>
          <li className="page-item">
            <button className="page-link" onClick={() => setPage(prev => prev + 1)}>
              Next
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
  
};

export default Preview;
