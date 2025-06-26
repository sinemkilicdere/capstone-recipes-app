import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [recipes, setRecipes] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', image: '', category: '' });
  const [search, setSearch] = useState('');
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({ email: '', password: '', isLogin: true });

  useEffect(() => {
    fetch("http://localhost:3000/recipes", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then((res) => res.json())
      .then(setRecipes)
      .catch((err) => console.error("Fetch error:", err.message));

    const token = localStorage.getItem("token");
    const email = localStorage.getItem("userEmail");
    if (token && email) {
      setUser({ email });
    }
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const url = `http://localhost:3000/auth/${authForm.isLogin ? "login" : "register"}`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authForm.email, password: authForm.password }),
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userEmail", data.user.email);
        setUser({ email: data.user.email });
        setAuthForm({ email: '', password: '', isLogin: true });
      } else {
        alert(data.error || "Authentication failed");
      }
    } catch (error) {
      alert("Auth error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = form.id ? 'PUT' : 'POST';
    const url = form.id
      ? `http://localhost:3000/recipes/${form.id}`
      : 'http://localhost:3000/recipes';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (method === 'POST') {
        setRecipes([...recipes, data]);
      } else {
        setRecipes(recipes.map((r) => (r.id === data.id ? data : r)));
      }

      setForm({ title: '', description: '', image: '', category: '' });
    } catch (error) {
      console.error("Submit error:", error.message);
    }
  };

  const handleEdit = (recipe) => {
    setForm(recipe);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await fetch(`http://localhost:3000/recipes/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setRecipes(recipes.filter((r) => r.id !== id));
    } catch (error) {
      console.error("Delete error:", error.message);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'unsigned_upload');
    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dukrycgwy/image/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      setForm((prev) => ({ ...prev, image: data.secure_url }));
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  return (
    <>
      <div className="banner">
        <img
          src="https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=1350&q=80"
          alt="Capstone Recipes"
        />
        <h1 className="banner-title">🍝 Capstone Recipes</h1>
      </div>

      {!user ? (
        <form onSubmit={handleAuthSubmit} className="form">
          <h2>{authForm.isLogin ? "Login" : "Register"}</h2>
          <input
            type="email"
            placeholder="Email"
            value={authForm.email}
            onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={authForm.password}
            onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
            required
          />
          <button type="submit">{authForm.isLogin ? "Login" : "Register"}</button>
          <button type="button" onClick={() => setAuthForm({ ...authForm, isLogin: !authForm.isLogin })}>
            Switch to {authForm.isLogin ? "Register" : "Login"}
          </button>
        </form>
      ) : (
        <>
          <p>Welcome, {user.email} <button onClick={handleLogout}>Logout</button></p>

          <form onSubmit={handleSubmit} className="form">
            <input
              type="text"
              placeholder="Recipe Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            >
              <option value="">Select Category</option>
              <option value="Pasta">Pasta</option>
              <option value="Dessert">Dessert</option>
              <option value="Vegan">Vegan</option>
              <option value="Soup">Soup</option>
              <option value="Appetizer">Appetizer</option>
              <option value="Other">Other</option>
            </select>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
            {form.image && <img src={form.image} alt="Preview" style={{ maxWidth: '200px', marginTop: '10px' }} />}
            <button type="submit">{form.id ? 'Update Recipe' : 'Add Recipe'}</button>
            {form.id && (
              <button
                type="button"
                onClick={() => setForm({ title: '', description: '', image: '', category: '' })}
              >
                Cancel Edit
              </button>
            )}
          </form>
        </>
      )}

      <input
        type="text"
        placeholder="Search recipes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search"
      />

      <div className="recipes">
        {recipes
          .filter((r) =>
            r.title?.toLowerCase().includes(search.toLowerCase()) ||
            r.description?.toLowerCase().includes(search.toLowerCase()) ||
            r.category?.toLowerCase().includes(search.toLowerCase())
          )
          .map((recipe) => (
            <div className="recipe-card" key={recipe.id}>
              <h2>{recipe.title}</h2>
              {recipe.image && <img src={recipe.image} alt={recipe.title} />}
              <p>{recipe.description}</p>
              <p><strong>Category:</strong> {recipe.category}</p>
              {user && (
                <div className="buttons">
                  <button onClick={() => handleEdit(recipe)}>Edit</button>
                  <button onClick={() => handleDelete(recipe.id)}>Delete</button>
                </div>
              )}
            </div>
          ))}
      </div>
    </>
  );
}

export default App;
