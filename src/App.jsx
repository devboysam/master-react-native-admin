import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'https://master-react-native-backend-production.up.railway.app';

const ICON_CHOICES = [
  { value: 'book', label: 'Book', emoji: '📘' },
  { value: 'code', label: 'Code', emoji: '💻' },
  { value: 'design', label: 'Design', emoji: '🎨' },
  { value: 'video', label: 'Video', emoji: '🎬' },
  { value: 'quiz', label: 'Quiz', emoji: '🧠' },
  { value: 'project', label: 'Project', emoji: '🛠️' },
];

function getIconEmoji(icon) {
  const match = ICON_CHOICES.find((item) => item.value === icon);
  return match?.emoji || '📁';
}

const initialModuleForm = {
  title: '',
  description: '',
  icon: 'book',
  order_index: 0,
};

function App() {
  const [modules, setModules] = useState([]);
  const [moduleForm, setModuleForm] = useState(initialModuleForm);
  const [message, setMessage] = useState('');
  const [isLoadingModules, setIsLoadingModules] = useState(false);
  const [isSavingModule, setIsSavingModule] = useState(false);

  const orderedModules = useMemo(
    () => [...modules].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)),
    [modules]
  );

  async function fetchModules() {
    setIsLoadingModules(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/modules`);
      const payload = response.data.data || [];
      setModules(payload);
    } finally {
      setIsLoadingModules(false);
    }
  }

  useEffect(() => {
    fetchModules().catch(() => setMessage('Failed to load modules'));
  }, []);

  async function handleCreateModule(event) {
    event.preventDefault();
    setMessage('');
    setIsSavingModule(true);

    try {
      await axios.post(`${API_BASE_URL}/api/modules`, {
        ...moduleForm,
        order_index: Number(moduleForm.order_index),
      });
      setModuleForm(initialModuleForm);
      await fetchModules();
      setMessage('Module created');
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Failed to create module');
    } finally {
      setIsSavingModule(false);
    }
  }


  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Course CMS</p>
          <h1>Master React Native Admin</h1>
          <p className="hero-subtitle">Task 1: create modules and sync them to the mobile app.</p>
        </div>
        <div className="stats-grid">
          <article>
            <span>Modules</span>
            <strong>{modules.length}</strong>
          </article>
        </div>
      </header>

      {message && <div className="message">{message}</div>}

      <div className="layout">
        <section className="card">
          <h2>Create Module (Live)</h2>
          <form className="form-grid" onSubmit={handleCreateModule}>
            <input
              required
              placeholder="Title"
              value={moduleForm.title}
              onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
            />
            <input
              placeholder="Description"
              value={moduleForm.description}
              onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
            />
            <select
              value={moduleForm.icon}
              onChange={(e) => setModuleForm({ ...moduleForm, icon: e.target.value })}
            >
              {ICON_CHOICES.map((icon) => (
                <option key={icon.value} value={icon.value}>
                  {icon.emoji} {icon.label}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Order"
              value={moduleForm.order_index}
              onChange={(e) => setModuleForm({ ...moduleForm, order_index: e.target.value })}
            />
            <button type="submit" disabled={isSavingModule}>
              {isSavingModule ? 'Saving...' : 'Create Module'}
            </button>
          </form>
        </section>

        <section className="card">
          <h2>How To Test</h2>
          <ol className="steps">
            <li>Create a module here.</li>
            <li>Open mobile app tab: Modules.</li>
            <li>Confirm the module card appears.</li>
          </ol>
        </section>
      </div>

      <section className="card">
        <h2>Current Modules</h2>
        {isLoadingModules ? <p>Loading modules...</p> : null}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Icon</th>
                <th>Title</th>
                <th>Description</th>
                <th>Order</th>
              </tr>
            </thead>
            <tbody>
              {orderedModules.length ? (
                orderedModules.map((module) => (
                  <tr key={module.id}>
                    <td>{getIconEmoji(module.icon)}</td>
                    <td>{module.title}</td>
                    <td>{module.description || 'No description'}</td>
                    <td>{module.order_index}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="empty">No modules yet. Create your first one above.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default App;
