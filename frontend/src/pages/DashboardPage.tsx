import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { api } from '../api/client';
import type { Project } from '../types';

export function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.projects
      .list()
      .then(setProjects)
      .catch(() => setError('Could not load your projects.'))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError('Project name must be at least 2 characters.');
      return;
    }
    try {
      const project = await api.projects.create({ name: name.trim(), description: description.trim() || undefined });
      setProjects((prev) => [...prev, project]);
      setName('');
      setDescription('');
      setShowCreateForm(false);
      setError(null);
    } catch {
      setError('Could not create the project. Please try again.');
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">Your projects</h1>
            <p className="text-sm text-muted">Projects you own or have been added to.</p>
          </div>
          <button type="button" className="btn-primary" onClick={() => setShowCreateForm(true)}>
            + New project
          </button>
        </div>

        {error && (
          <p role="alert" className="mb-4 rounded bg-rust-light px-3 py-2 text-sm text-rust">
            {error}
          </p>
        )}

        {isLoading && <p className="text-sm text-muted">Loading projects…</p>}

        {!isLoading && projects.length === 0 && (
          <div className="card p-10 text-center">
            <p className="mb-2 font-display text-lg text-ink">No projects yet</p>
            <p className="text-sm text-muted">Create your first project to start tracking tasks.</p>
          </div>
        )}

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                to={`/projects/${project.id}`}
                className="card block h-full p-5 transition-shadow hover:shadow-md"
              >
                <h2 className="font-display text-lg font-semibold text-ink">{project.name}</h2>
                {project.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{project.description}</p>
                )}
                <p className="mt-4 font-mono text-xs text-muted">
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </Link>
            </li>
          ))}
        </ul>

        {showCreateForm && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-project-title"
            className="fixed inset-0 z-20 flex items-center justify-center bg-ink/40 p-4"
            onClick={() => setShowCreateForm(false)}
          >
            <form
              onSubmit={handleCreate}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded bg-surface p-6 shadow-xl"
            >
              <h2 id="create-project-title" className="mb-4 font-display text-xl font-semibold text-ink">
                New project
              </h2>
              <div className="mb-3">
                <label htmlFor="project-name" className="field-label">
                  Name
                </label>
                <input
                  id="project-name"
                  className="field-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="mb-5">
                <label htmlFor="project-description" className="field-label">
                  Description
                </label>
                <textarea
                  id="project-description"
                  className="field-input"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create project
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
