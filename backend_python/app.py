from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
import pymysql
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Aktifkan CORS untuk seluruh aplikasi

# Koneksi ke database MySQL
def get_db_connection():
    return pymysql.connect(
        host='localhost',
        user='root',
        password='',
        database='article',  # nama DB yang sudah kamu buat
        cursorclass=pymysql.cursors.DictCursor
    )

# Fungsi validasi input artikel
def validate_article(data):
    errors = []
    title = data.get('title', '')
    content = data.get('content', '')
    category = data.get('category', '')
    status = data.get('status', '').lower()

    if len(title) < 20:
        errors.append('Title minimal 20 karakter')
    if len(content) < 200:
        errors.append('Content minimal 200 karakter')
    if len(category) < 3:
        errors.append('Category minimal 3 karakter')
    # Perbarui nilai status yang diizinkan
    if status not in ['publish', 'draft', 'trash']:
        errors.append('Status harus salah satu: publish, draft, trash')

    return errors


# 1. POST /article/ - Membuat artikel baru
@app.route('/article/', methods=['POST'])
def create_article():
    data = request.json
    errors = validate_article(data)
    if errors:
        return jsonify({'errors': errors}), 400

    title = data['title']
    content = data['content']
    category = data['category']
    status = data['status'].lower()

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            sql = """
                INSERT INTO posts (title, content, category, status, created_date, updated_date)
                VALUES (%s, %s, %s, %s, %s, %s)
            """
            now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            cursor.execute(sql, (title, content, category, status, now, now))
            conn.commit()
            new_id = cursor.lastrowid
        return jsonify({'message': 'Article created', 'id': new_id}), 201
    except Exception as e:
        print("Error in create_article:", e)
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# 2. GET /article/<limit>/<offset>?status=...
@app.route('/article/<int:limit>/<int:offset>', methods=['GET'])
def get_articles(limit, offset):
    status = request.args.get('status', None)
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            base_sql = "SELECT * FROM posts"
            params = []
            if status:
                base_sql += " WHERE status = %s"
                params.append(status.lower())
            base_sql += " ORDER BY created_date DESC LIMIT %s OFFSET %s"
            params.extend([limit, offset])
            cursor.execute(base_sql, params)
            results = cursor.fetchall()
        return jsonify(results), 200
    except Exception as e:
        print("Error in get_articles:", e)
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# 3. GET /article/<id> - Menampilkan detail artikel
@app.route('/article/<int:article_id>', methods=['GET'])
def get_article_by_id(article_id):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            sql = "SELECT * FROM posts WHERE id = %s"
            cursor.execute(sql, (article_id,))
            result = cursor.fetchone()
        if not result:
            return jsonify({'error': 'Article not found'}), 404
        return jsonify(result), 200
    except Exception as e:
        print("Error in get_article_by_id:", e)
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# 4. PATCH /article/<id> - Mengupdate artikel dengan dukungan partial update
@app.route('/article/<int:article_id>', methods=['PATCH'])
def update_article(article_id):
    data = request.json

    # Ambil data artikel saat ini dari database
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM posts WHERE id = %s", (article_id,))
            current_article = cursor.fetchone()
        if not current_article:
            return jsonify({'error': 'Article not found'}), 404
    except Exception as e:
        print("Error fetching article for update:", e)
        return jsonify({'error': str(e)}), 500

    # Gabungkan data yang dikirim dengan data yang sudah ada
    updated_title = data.get('title', current_article['title'])
    updated_content = data.get('content', current_article['content'])
    updated_category = data.get('category', current_article['category'])
    updated_status = data.get('status', current_article['status']).lower()

    # Buat payload lengkap untuk validasi
    full_data = {
        'title': updated_title,
        'content': updated_content,
        'category': updated_category,
        'status': updated_status
    }

    errors = validate_article(full_data)
    if errors:
        return jsonify({'errors': errors}), 400

    # Lakukan update ke database
    try:
        with conn.cursor() as cursor:
            sql = """
                UPDATE posts
                SET title = %s,
                    content = %s,
                    category = %s,
                    status = %s,
                    updated_date = %s
                WHERE id = %s
            """
            now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            cursor.execute(sql, (updated_title, updated_content, updated_category, updated_status, now, article_id))
            conn.commit()
            if cursor.rowcount == 0:
                return jsonify({'error': 'Article not found'}), 404
        return jsonify({'message': 'Article updated'}), 200
    except Exception as e:
        print("Error in update_article:", e)
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# 5. DELETE /article/<id> - Menghapus artikel
@app.route('/article/<int:article_id>', methods=['DELETE'])
def delete_article(article_id):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            sql = "DELETE FROM posts WHERE id = %s"
            cursor.execute(sql, (article_id,))
            conn.commit()
            if cursor.rowcount == 0:
                return jsonify({'error': 'Article not found'}), 404
        return jsonify({'message': 'Article deleted'}), 200
    except Exception as e:
        print("Error in delete_article:", e)
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
