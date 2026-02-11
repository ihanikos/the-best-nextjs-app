import { render, screen, waitFor } from "@testing-library/react";
import { AuthGuard, PublicRoute } from "@/lib/auth/auth-guard";
import { useAuth } from "@/lib/auth/auth-context";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => "/dashboard",
}));

jest.mock("@/lib/auth/auth-context", () => ({
  useAuth: jest.fn(),
}));

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe("AuthGuard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should show loading state when auth is loading", () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: jest.fn(),
      logout: jest.fn(),
      error: null,
      clearError: jest.fn(),
    });

    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("should redirect to login when not authenticated", async () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      error: null,
      clearError: jest.fn(),
    });

    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("should render children when authenticated", () => {
    mockedUseAuth.mockReturnValue({
      user: { id: "1", email: "test@test.com", name: "Test User" },
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      error: null,
      clearError: jest.fn(),
    });

    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByTestId("protected-content")).toHaveTextContent("Protected Content");
    expect(mockPush).not.toHaveBeenCalled();
  });
});

describe("PublicRoute", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should show loading state when auth is loading", () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: jest.fn(),
      logout: jest.fn(),
      error: null,
      clearError: jest.fn(),
    });

    render(
      <PublicRoute>
        <div data-testid="public-content">Public Content</div>
      </PublicRoute>
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByTestId("public-content")).not.toBeInTheDocument();
  });

  it("should redirect to dashboard when authenticated on login page", async () => {
    jest.doMock("next/navigation", () => ({
      useRouter: () => ({ push: mockPush }),
      usePathname: () => "/login",
    }));

    mockedUseAuth.mockReturnValue({
      user: { id: "1", email: "test@test.com", name: "Test User" },
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      error: null,
      clearError: jest.fn(),
    });

    render(
      <PublicRoute>
        <div data-testid="public-content">Public Content</div>
      </PublicRoute>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("should render children when not authenticated", () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      error: null,
      clearError: jest.fn(),
    });

    render(
      <PublicRoute>
        <div data-testid="public-content">Public Content</div>
      </PublicRoute>
    );

    expect(screen.getByTestId("public-content")).toHaveTextContent("Public Content");
    expect(mockPush).not.toHaveBeenCalled();
  });
});
