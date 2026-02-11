import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/login/page";
import { useAuth } from "@/lib/auth";

const mockPush = jest.fn();
const mockLogin = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => "/login",
}));

jest.mock("@/lib/auth", () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PublicRoute: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: mockLogin,
      logout: jest.fn(),
      error: null,
      clearError: jest.fn(),
    });
  });

  it("should render login form", () => {
    render(<LoginPage />);
    
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("should show demo credentials", () => {
    render(<LoginPage />);
    
    expect(screen.getByText(/demo credentials/i)).toBeInTheDocument();
    expect(screen.getByText(/admin@nexus.dev/)).toBeInTheDocument();
    expect(screen.getByText(/password123/)).toBeInTheDocument();
  });

  it("should toggle password visibility", async () => {
    render(<LoginPage />);
    
    const passwordInput = screen.getByLabelText("Password");
    const toggleButton = screen.getByRole("button", { name: "" });
    
    expect(passwordInput).toHaveAttribute("type", "password");
    
    await userEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");
    
    await userEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("should submit form with email and password", async () => {
    mockLogin.mockResolvedValue(undefined);
    
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitButton = screen.getByRole("button", { name: /sign in/i });
    
    await userEvent.type(emailInput, "admin@nexus.dev");
    await userEvent.type(passwordInput, "password123");
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("admin@nexus.dev", "password123");
    });
  });

  it("should show loading state during login", async () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: mockLogin,
      logout: jest.fn(),
      error: null,
      clearError: jest.fn(),
    });
    
    render(<LoginPage />);
    
    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();
  });

  it("should display error message when login fails", async () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: mockLogin,
      logout: jest.fn(),
      error: "Invalid email or password",
      clearError: jest.fn(),
    });
    
    render(<LoginPage />);
    
    expect(screen.getByText("Invalid email or password")).toBeInTheDocument();
  });

  it("should have link to go back home", () => {
    render(<LoginPage />);
    
    const homeLink = screen.getByRole("link", { name: /go back home/i });
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("should have link to home with logo", () => {
    render(<LoginPage />);
    
    const logoLink = screen.getByRole("link", { name: /nexus/i });
    expect(logoLink).toHaveAttribute("href", "/");
  });

  it("should disable inputs while loading", async () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: mockLogin,
      logout: jest.fn(),
      error: null,
      clearError: jest.fn(),
    });
    
    render(<LoginPage />);
    
    expect(screen.getByLabelText("Email")).toBeDisabled();
    expect(screen.getByLabelText("Password")).toBeDisabled();
  });

  it("should handle form validation", async () => {
    render(<LoginPage />);
    
    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    
    // HTML5 validation should be present
    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toHaveAttribute("required");
    expect(passwordInput).toHaveAttribute("required");
  });
});
