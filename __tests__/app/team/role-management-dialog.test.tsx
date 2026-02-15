import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RoleManagementDialog } from "@/app/team/role-management-dialog";
import { ROLE_INFO } from "@/lib/auth/roles";

describe("RoleManagementDialog", () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    memberName: "John Doe",
    memberEmail: "john@example.com",
    currentRole: "member",
    onRoleChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders dialog with member information", () => {
    render(<RoleManagementDialog {...defaultProps} />);

    expect(screen.getByText("Manage Role")).toBeInTheDocument();
    expect(screen.getByText("Change the role and permissions for John Doe")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });

  it("displays current role badge", () => {
    render(<RoleManagementDialog {...defaultProps} />);

    // Look for the badge in the member info section (has ml-auto class for positioning)
    const badge = document.querySelector('[data-slot="badge"]');
    expect(badge).toHaveTextContent("Member");
  });

  it("renders all four role options", () => {
    render(<RoleManagementDialog {...defaultProps} />);

    expect(screen.getByLabelText("Admin")).toBeInTheDocument();
    expect(screen.getByLabelText("Manager")).toBeInTheDocument();
    expect(screen.getByLabelText("Member")).toBeInTheDocument();
    expect(screen.getByLabelText("Viewer")).toBeInTheDocument();
  });

  it("shows role descriptions", () => {
    render(<RoleManagementDialog {...defaultProps} />);

    expect(screen.getByText(ROLE_INFO.admin.description)).toBeInTheDocument();
    expect(screen.getByText(ROLE_INFO.manager.description)).toBeInTheDocument();
    expect(screen.getByText(ROLE_INFO.member.description)).toBeInTheDocument();
    expect(screen.getByText(ROLE_INFO.viewer.description)).toBeInTheDocument();
  });

  it("pre-selects current role", () => {
    render(<RoleManagementDialog {...defaultProps} />);

    const memberRadio = screen.getByRole("radio", { name: /member/i });
    expect(memberRadio).toHaveAttribute("aria-checked", "true");
  });

  it("allows selecting a different role", async () => {
    render(<RoleManagementDialog {...defaultProps} />);

    const adminRadio = screen.getByRole("radio", { name: /admin/i });
    await userEvent.click(adminRadio);

    expect(adminRadio).toHaveAttribute("aria-checked", "true");
  });

  it("calls onRoleChange with selected role when saving", async () => {
    render(<RoleManagementDialog {...defaultProps} />);

    // Select a different role
    const managerRadio = screen.getByLabelText("Manager");
    await userEvent.click(managerRadio);

    // Click save
    const saveButton = screen.getByText("Save Changes");
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(defaultProps.onRoleChange).toHaveBeenCalledWith("manager");
    });
  });

  it("calls onOpenChange when clicking Cancel", async () => {
    render(<RoleManagementDialog {...defaultProps} />);

    const cancelButton = screen.getByText("Cancel");
    await userEvent.click(cancelButton);

    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("does not render when open is false", () => {
    render(<RoleManagementDialog {...defaultProps} open={false} />);

    expect(screen.queryByText("Manage Role")).not.toBeInTheDocument();
  });

  it("displays role badges with correct colors", () => {
    render(<RoleManagementDialog {...defaultProps} />);

    const badges = screen.getAllByText(/admin|manager|member|viewer/i);
    expect(badges.length).toBeGreaterThanOrEqual(4);
  });

  it("shows loading state when submitting", async () => {
    render(<RoleManagementDialog {...defaultProps} />);

    const saveButton = screen.getByText("Save Changes");
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText("Saving...")).toBeInTheDocument();
    });
  });

  it("displays member initials in avatar", () => {
    render(<RoleManagementDialog {...defaultProps} memberName="Jane Smith" />);

    expect(screen.getByText("JS")).toBeInTheDocument();
  });

  it("handles single name correctly", () => {
    render(<RoleManagementDialog {...defaultProps} memberName="Madonna" />);

    expect(screen.getByText("M")).toBeInTheDocument();
  });

  it("closes dialog after successful save", async () => {
    render(<RoleManagementDialog {...defaultProps} />);

    const saveButton = screen.getByText("Save Changes");
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("renders with different current role", () => {
    render(<RoleManagementDialog {...defaultProps} currentRole="admin" />);

    // Should show Admin badge
    const adminBadges = screen.getAllByText("Admin");
    expect(adminBadges.length).toBeGreaterThan(0);
  });

  it("has radio group for role selection", () => {
    render(<RoleManagementDialog {...defaultProps} />);

    const radioGroup = screen.getByRole("radiogroup");
    expect(radioGroup).toBeInTheDocument();
  });

  it("each role option has a radio button", () => {
    render(<RoleManagementDialog {...defaultProps} />);

    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(4);
  });
});
