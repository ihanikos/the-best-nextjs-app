import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "@/lib/auth/auth-context";

const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

function TestComponent() {
  const { user, isAuthenticated, isLoading, login, logout, error, clearError } = useAuth();

  return (
    <div>
      <div data-testid="loading">{isLoading ? "loading" : "not-loading"}</div>
      <div data-testid="authenticated">{isAuthenticated ? "true" : "false"}</div>
      <div data-testid="user">{user ? user.name : "no-user"}</div>
      <div data-testid="error">{error || "no-error"}</div>
      <button
        data-testid="login-btn"
        onClick={() => login("admin@nexus.dev", "password123")}
      >
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
      <button data-testid="clear-error-btn" onClick={clearError}>
        Clear Error
      </button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it("should show loading state initially", () => {
    renderWithProvider();
    expect(screen.getByTestId("loading")).toHaveTextContent("loading");
  });

  it("should not be authenticated initially", async () => {
    renderWithProvider();
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");
    });
    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("user")).toHaveTextContent("no-user");
  });

  it("should login with correct credentials", async () => {
    renderWithProvider();
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");
    });

    const loginBtn = screen.getByTestId("login-btn");
    await userEvent.click(loginBtn);

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    });
    expect(screen.getByTestId("user")).toHaveTextContent("Admin User");
    expect(mockLocalStorage.setItem).toHaveBeenCalled();
  });

  it("should show error with incorrect credentials", async () => {
    renderWithProvider();
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");
    });

    const loginBtn = screen.getByTestId("login-btn");
    // Mock wrong credentials by changing the button handler
    const wrongLoginBtn = screen.getByTestId("login-btn");
    wrongLoginBtn.onclick = () => {
      const { login } = require("@/lib/auth/auth-context").useAuth();
      login("wrong@email.com", "wrongpassword");
    };
    
    // We need to test the actual error state
    const TestErrorComponent = () => {
      const { login, error } = useAuth();
      return (
        <div>
          <div data-testid="error">{error || "no-error"}</div>
          <button
            data-testid="wrong-login"
            onClick={() => login("wrong@email.com", "wrongpassword")}
          >
            Wrong Login
          </button>
        </div>
      );
    };

    const { getByTestId } = render(
      <AuthProvider>
        <TestErrorComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId("error")).toHaveTextContent("no-error");
    });

    await userEvent.click(getByTestId("wrong-login"));

    await waitFor(() => {
      expect(getByTestId("error")).toHaveTextContent("Invalid email or password");
    });
  });

  it("should logout user", async () => {
    renderWithProvider();
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");
    });

    // Login first
    await userEvent.click(screen.getByTestId("login-btn"));
    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    });

    // Then logout
    await userEvent.click(screen.getByTestId("logout-btn"));
    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    });
    expect(screen.getByTestId("user")).toHaveTextContent("no-user");
    expect(mockLocalStorage.removeItem).toHaveBeenCalled();
  });

  it("should clear error", async () => {
    const TestClearError = () => {
      const { error, clearError, login } = useAuth();
      return (
        <div>
          <div data-testid="error">{error || "no-error"}</div>
          <button data-testid="clear" onClick={clearError}>Clear</button>
          <button data-testid="trigger-error" onClick={() => login("wrong", "wrong")}>
            Trigger Error
          </button>
        </div>
      );
    };

    const { getByTestId } = render(
      <AuthProvider>
        <TestClearError />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId("error")).toHaveTextContent("no-error");
    });

    // Trigger error first
    await userEvent.click(getByTestId("trigger-error"));
    await waitFor(() => {
      expect(getByTestId("error")).not.toHaveTextContent("no-error");
    });

    // Clear error
    await userEvent.click(getByTestId("clear"));
    expect(getByTestId("error")).toHaveTextContent("no-error");
  });

  it("should restore session from localStorage", async () => {
    const storedUser = {
      id: "1",
      email: "test@test.com",
      name: "Test User",
    };
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ user: storedUser }));

    const TestRestore = () => {
      const { user, isAuthenticated, isLoading } = useAuth();
      return (
        <div>
          <div data-testid="loading">{isLoading ? "loading" : "not-loading"}</div>
          <div data-testid="authenticated">{isAuthenticated ? "true" : "false"}</div>
          <div data-testid="user">{user?.name || "no-user"}</div>
        </div>
      );
    };

    const { getByTestId } = render(
      <AuthProvider>
        <TestRestore />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId("loading")).toHaveTextContent("not-loading");
    });

    expect(getByTestId("authenticated")).toHaveTextContent("true");
    expect(getByTestId("user")).toHaveTextContent("Test User");
  });
});

describe("useAuth hook", () => {
  it("should throw error when used outside AuthProvider", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    
    function Component() {
      useAuth();
      return null;
    }

    expect(() => render(<Component />)).toThrow("useAuth must be used within an AuthProvider");
    
    consoleError.mockRestore();
  });
});
