import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from '../src/pages/LoginPage';
import { AuthProvider } from '../src/context/AuthContext';
import * as apiClient from '../src/api/client';

function renderLoginPage() {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </BrowserRouter>,
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders email and password fields with accessible labels', () => {
    renderLoginPage();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('calls the API with entered credentials and shows an error on failure', async () => {
    const user = userEvent.setup();
    vi.spyOn(apiClient.api.auth, 'login').mockRejectedValue(
      new apiClient.ApiError(401, 'Invalid email or password'),
    );

    renderLoginPage();

    await user.type(screen.getByLabelText(/email/i), 'wrong@taskflow.dev');
    await user.type(screen.getByLabelText(/password/i), 'WrongPass1');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password');
    });
  });

  it('links to the registration page', () => {
    renderLoginPage();
    expect(screen.getByRole('link', { name: /create an account/i })).toHaveAttribute(
      'href',
      '/register',
    );
  });
});
