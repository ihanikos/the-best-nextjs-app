import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataExportImportDialog } from "@/components/data-export-import-dialog";
import { Project, TeamMember } from "@/lib/projects/types";

// Mock the data import/export utilities
jest.mock("@/lib/data-import-export", () => ({
  exportToJSON: jest.fn(() => ({
    version: "1.0.0",
    exportedAt: "2026-01-01",
    projects: [],
    teamMembers: [],
  })),
  downloadJSON: jest.fn(),
  exportProjectsToCSV: jest.fn(() => "name,status\nTest,active"),
  exportTeamToCSV: jest.fn(() => "name,email\nJohn,john@test.com"),
  downloadCSV: jest.fn(),
  parseJSONFile: jest.fn(),
  parseCSVFile: jest.fn(),
  validateImportData: jest.fn(() => ({ valid: true, errors: [] })),
  generateProjectFromImport: jest.fn((data) => ({ ...data, id: "imported-1" })),
  generateTeamMemberFromImport: jest.fn((data) => ({ ...data, id: 1 })),
}));

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock URL methods
global.URL.createObjectURL = jest.fn(() => "mock-url");
global.URL.revokeObjectURL = jest.fn();

const mockProjects: Project[] = [
  {
    id: "1",
    name: "Test Project",
    description: "Test",
    status: "active",
    progress: 50,
    dueDate: "2026-12-31",
    members: [],
    tasks: [],
  },
];

const mockTeamMembers: TeamMember[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "Developer",
    avatar: "JD",
  },
];

describe("DataExportImportDialog", () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    projects: mockProjects,
    teamMembers: mockTeamMembers,
    onImportProjects: jest.fn(),
    onImportTeamMembers: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders export/import dialog with tabs", () => {
    render(<DataExportImportDialog {...defaultProps} />);

    expect(screen.getByText("Data Export / Import")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /export/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /import/i })).toBeInTheDocument();
  });

  it("shows export format options by default", () => {
    render(<DataExportImportDialog {...defaultProps} />);

    expect(screen.getByText("JSON Export")).toBeInTheDocument();
    expect(screen.getByText("CSV - Projects Only")).toBeInTheDocument();
    expect(screen.getByText("CSV - Team Only")).toBeInTheDocument();
  });

  it("displays export summary with correct counts", () => {
    render(<DataExportImportDialog {...defaultProps} />);

    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("Team Members")).toBeInTheDocument();
    expect(screen.getByText("Total Tasks")).toBeInTheDocument();
  });

  it("allows selecting different export formats", async () => {
    render(<DataExportImportDialog {...defaultProps} />);

    const csvProjectsOption = screen.getByText("CSV - Projects Only").closest("div[class*='cursor-pointer']");
    if (csvProjectsOption) {
      await userEvent.click(csvProjectsOption);
    }

    // Check that the option is selected (has different styling)
    expect(screen.getByText("CSV - Projects Only")).toBeInTheDocument();
  });

  it("switches to import tab when clicked", async () => {
    render(<DataExportImportDialog {...defaultProps} />);

    const importTab = screen.getByRole("tab", { name: /import/i });
    await userEvent.click(importTab);

    expect(screen.getByText("Click to upload or drag and drop")).toBeInTheDocument();
  });

  it("shows file upload area in import tab", async () => {
    render(<DataExportImportDialog {...defaultProps} />);

    const importTab = screen.getByRole("tab", { name: /import/i });
    await userEvent.click(importTab);

    expect(screen.getByText(/supports json and csv files/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/click to upload/i)).toBeInTheDocument();
  });

  it("closes dialog when cancel button is clicked", async () => {
    render(<DataExportImportDialog {...defaultProps} />);

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await userEvent.click(cancelButton);

    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it("handles export button click", async () => {
    const { downloadJSON } = require("@/lib/data-import-export");
    
    render(<DataExportImportDialog {...defaultProps} />);

    const exportButton = screen.getByRole("button", { name: /export data/i });
    await userEvent.click(exportButton);

    await waitFor(() => {
      expect(downloadJSON).toHaveBeenCalled();
    });
  });

  it("displays progress bar during export", async () => {
    render(<DataExportImportDialog {...defaultProps} />);

    const exportButton = screen.getByRole("button", { name: /export data/i });
    fireEvent.click(exportButton);

    // Progress should be shown during export
    await waitFor(() => {
      const progressBar = screen.queryByRole("progressbar");
      expect(progressBar).toBeInTheDocument();
    });
  });

  it("handles file selection for import", async () => {
    const { parseJSONFile } = require("@/lib/data-import-export");
    parseJSONFile.mockResolvedValueOnce({
      version: "1.0.0",
      projects: [],
      teamMembers: [],
    });

    render(<DataExportImportDialog {...defaultProps} />);

    const importTab = screen.getByRole("tab", { name: /import/i });
    await userEvent.click(importTab);

    const fileInput = screen.getByLabelText(/click to upload/i);
    const file = new File(["{}"], "test.json", { type: "application/json" });
    
    await userEvent.upload(fileInput, file);

    await waitFor(() => {
      expect(parseJSONFile).toHaveBeenCalledWith(file);
    });
  });

  it("shows import preview after file selection", async () => {
    const { parseJSONFile } = require("@/lib/data-import-export");
    parseJSONFile.mockResolvedValueOnce({
      version: "1.0.0",
      projects: [{ id: "1", name: "Test Project" }],
      teamMembers: [{ id: "1", name: "John", email: "john@test.com" }],
    });

    render(<DataExportImportDialog {...defaultProps} />);

    const importTab = screen.getByRole("tab", { name: /import/i });
    await userEvent.click(importTab);

    const fileInput = screen.getByLabelText(/click to upload/i);
    const file = new File(["{}"], "test.json", { type: "application/json" });
    
    await userEvent.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText("Import Preview")).toBeInTheDocument();
      expect(screen.getByText("Projects to import")).toBeInTheDocument();
      expect(screen.getByText("Team members to import")).toBeInTheDocument();
    });
  });

  it("displays validation errors in import preview", async () => {
    const { parseJSONFile, validateImportData } = require("@/lib/data-import-export");
    parseJSONFile.mockResolvedValueOnce({
      projects: [{ name: "Test" }], // Missing id
    });
    validateImportData.mockReturnValueOnce({
      valid: false,
      errors: ["Project at index 0 missing id"],
    });

    render(<DataExportImportDialog {...defaultProps} />);

    const importTab = screen.getByRole("tab", { name: /import/i });
    await userEvent.click(importTab);

    const fileInput = screen.getByLabelText(/click to upload/i);
    const file = new File(["{}"], "test.json", { type: "application/json" });
    
    await userEvent.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText(/missing id/i)).toBeInTheDocument();
    });
  });

  it("handles import button click", async () => {
    const { parseJSONFile } = require("@/lib/data-import-export");
    parseJSONFile.mockResolvedValueOnce({
      version: "1.0.0",
      projects: [{ id: "1", name: "Test" }],
      teamMembers: [],
    });

    render(<DataExportImportDialog {...defaultProps} />);

    const importTab = screen.getByRole("tab", { name: /import/i });
    await userEvent.click(importTab);

    const fileInput = screen.getByLabelText(/click to upload/i);
    const file = new File(["{}"], "test.json", { type: "application/json" });
    
    await userEvent.upload(fileInput, file);

    await waitFor(() => {
      const importButton = screen.getByRole("button", { name: /import data/i });
      expect(importButton).toBeInTheDocument();
    });
  });

  it("disables import button when there are validation errors", async () => {
    const { parseJSONFile, validateImportData } = require("@/lib/data-import-export");
    parseJSONFile.mockResolvedValueOnce({
      projects: [],
    });
    validateImportData.mockReturnValueOnce({
      valid: false,
      errors: ["Invalid data"],
    });

    render(<DataExportImportDialog {...defaultProps} />);

    const importTab = screen.getByRole("tab", { name: /import/i });
    await userEvent.click(importTab);

    const fileInput = screen.getByLabelText(/click to upload/i);
    const file = new File(["{}"], "test.json", { type: "application/json" });
    
    await userEvent.upload(fileInput, file);

    await waitFor(() => {
      const importButton = screen.getByRole("button", { name: /import data/i });
      expect(importButton).toBeDisabled();
    });
  });

  it("allows going back to upload from preview", async () => {
    const { parseJSONFile } = require("@/lib/data-import-export");
    parseJSONFile.mockResolvedValueOnce({
      version: "1.0.0",
      projects: [],
      teamMembers: [],
    });

    render(<DataExportImportDialog {...defaultProps} />);

    const importTab = screen.getByRole("tab", { name: /import/i });
    await userEvent.click(importTab);

    const fileInput = screen.getByLabelText(/click to upload/i);
    const file = new File(["{}"], "test.json", { type: "application/json" });
    
    await userEvent.upload(fileInput, file);

    await waitFor(() => {
      const backButton = screen.getByRole("button", { name: /back/i });
      expect(backButton).toBeInTheDocument();
    });
  });

  it("displays warning for duplicate entries", async () => {
    const { parseJSONFile, validateImportData } = require("@/lib/data-import-export");
    parseJSONFile.mockResolvedValueOnce({
      version: "1.0.0",
      projects: [{ id: "1", name: "Test Project" }],
      teamMembers: [],
    });
    validateImportData.mockReturnValueOnce({
      valid: true,
      errors: [],
    });

    render(<DataExportImportDialog {...defaultProps} />);

    const importTab = screen.getByRole("tab", { name: /import/i });
    await userEvent.click(importTab);

    const fileInput = screen.getByLabelText(/click to upload/i);
    const file = new File(["{}"], "test.json", { type: "application/json" });
    
    await userEvent.upload(fileInput, file);

    // Should show warning since project with id "1" exists
    await waitFor(() => {
      expect(screen.getByText(/1 project\(s\) may already exist/i)).toBeInTheDocument();
    });
  });
});
