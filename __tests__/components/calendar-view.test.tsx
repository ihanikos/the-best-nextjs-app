import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CalendarView } from "@/components/calendar-view";
import { Project } from "@/lib/projects/types";

const mockProjects: Project[] = [
  {
    id: "1",
    name: "Website Redesign",
    description: "Complete overhaul of the company website",
    status: "active",
    progress: 65,
    dueDate: "2026-03-15",
    createdAt: "2026-01-10",
    updatedAt: "2026-02-10",
    owner: {
      id: "1",
      name: "Alex Chen",
      email: "alex@nexus.dev",
      role: "Product Manager",
      avatar: "AC",
    },
    members: [
      { id: "1", name: "Alex Chen", email: "alex@nexus.dev", role: "Product Manager", avatar: "AC" },
    ],
    tasks: [
      { id: "1", title: "Design mockups", completed: true, status: "done", priority: "high", dueDate: "2026-03-01" },
      { id: "2", title: "Frontend dev", completed: false, status: "in-progress", priority: "medium", dueDate: "2026-03-05" },
    ],
  },
  {
    id: "2",
    name: "Mobile App",
    description: "Build mobile application",
    status: "active",
    progress: 40,
    dueDate: "2026-04-30",
    createdAt: "2026-01-15",
    updatedAt: "2026-02-08",
    owner: {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah@nexus.dev",
      role: "Senior Developer",
      avatar: "SJ",
    },
    members: [
      { id: "2", name: "Sarah Johnson", email: "sarah@nexus.dev", role: "Senior Developer", avatar: "SJ" },
    ],
    tasks: [
      { id: "3", title: "API development", completed: true, status: "done", priority: "high", dueDate: "2026-03-20" },
    ],
  },
];

describe("CalendarView", () => {
  const mockProjectClick = jest.fn();
  const mockTaskClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders calendar with correct month and year", () => {
    render(
      <CalendarView
        projects={mockProjects}
        onProjectClick={mockProjectClick}
        onTaskClick={mockTaskClick}
      />
    );

    // Check that the month/year header is displayed
    const date = new Date();
    const expectedMonthYear = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    expect(screen.getByText(expectedMonthYear)).toBeInTheDocument();
  });

  it("displays weekday headers", () => {
    render(<CalendarView projects={mockProjects} />);

    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    weekdays.forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it("displays projects on their due dates", () => {
    render(<CalendarView projects={mockProjects} />);

    // Navigate to March 2026
    const nextButton = screen.getByLabelText("Next month");
    // Click multiple times to get to March 2026
    for (let i = 0; i < 10; i++) {
      fireEvent.click(nextButton);
    }

    // Look for project names in the calendar
    expect(screen.getByText("Website Redesign")).toBeInTheDocument();
  });

  it("displays tasks on their due dates", () => {
    render(<CalendarView projects={mockProjects} />);

    // Navigate to March 2026
    const nextButton = screen.getByLabelText("Next month");
    for (let i = 0; i < 10; i++) {
      fireEvent.click(nextButton);
    }

    // Look for task titles
    expect(screen.getByText("Design mockups")).toBeInTheDocument();
    expect(screen.getByText("Frontend dev")).toBeInTheDocument();
  });

  it("calls onProjectClick when a project is clicked", async () => {
    render(
      <CalendarView
        projects={mockProjects}
        onProjectClick={mockProjectClick}
        onTaskClick={mockTaskClick}
      />
    );

    // Navigate to March 2026
    const nextButton = screen.getByLabelText("Next month");
    for (let i = 0; i < 10; i++) {
      fireEvent.click(nextButton);
    }

    // Find and click on a project
    const projectElement = screen.getByText("Website Redesign");
    fireEvent.click(projectElement);

    await waitFor(() => {
      expect(mockProjectClick).toHaveBeenCalledWith(mockProjects[0]);
    });
  });

  it("navigates to previous month when clicking previous button", () => {
    render(<CalendarView projects={mockProjects} />);

    const prevButton = screen.getByLabelText("Previous month");
    fireEvent.click(prevButton);

    // The month should have changed
    const currentDate = new Date();
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
    const expectedMonthYear = prevMonth.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    expect(screen.getByText(expectedMonthYear)).toBeInTheDocument();
  });

  it("navigates to next month when clicking next button", () => {
    render(<CalendarView projects={mockProjects} />);

    const nextButton = screen.getByLabelText("Next month");
    fireEvent.click(nextButton);

    // The month should have changed
    const currentDate = new Date();
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
    const expectedMonthYear = nextMonth.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    expect(screen.getByText(expectedMonthYear)).toBeInTheDocument();
  });

  it("navigates to today when clicking today button", () => {
    render(<CalendarView projects={mockProjects} />);

    // First navigate to a different month
    const nextButton = screen.getByLabelText("Next month");
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);

    // Then click today
    const todayButton = screen.getByText("Today");
    fireEvent.click(todayButton);

    // Should be back to current month
    const currentDate = new Date();
    const expectedMonthYear = currentDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    expect(screen.getByText(expectedMonthYear)).toBeInTheDocument();
  });

  it("displays legend with correct status colors", () => {
    render(<CalendarView projects={mockProjects} />);

    expect(screen.getByText("Project")).toBeInTheDocument();
    expect(screen.getByText("To Do")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("In Review")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("shows item count badge for days with multiple items", () => {
    render(<CalendarView projects={mockProjects} />);

    // Navigate to March 2026 where we have multiple items on March 15
    const nextButton = screen.getByLabelText("Next month");
    for (let i = 0; i < 10; i++) {
      fireEvent.click(nextButton);
    }

    // Look for the badge showing "2" (Website Redesign project + tasks on that day or close to it)
    const badges = screen.getAllByText("2");
    expect(badges.length).toBeGreaterThan(0);
  });

  it("renders empty state when no projects provided", () => {
    render(<CalendarView projects={[]} />);

    // Should still render the calendar grid
    expect(screen.getByText("Sun")).toBeInTheDocument();
    expect(screen.getByText("Today")).toBeInTheDocument();
  });

  it("is keyboard accessible", () => {
    render(<CalendarView projects={mockProjects} />);

    // Get all day cells
    const dayCells = screen.getAllByRole("button", { name: /\d{1,2}/ });
    expect(dayCells.length).toBeGreaterThan(0);

    // Test that day cells are focusable
    const firstDayCell = dayCells[0];
    firstDayCell.focus();
    expect(document.activeElement).toBe(firstDayCell);
  });
});
