import React from "react";
import { render, screen } from "@testing-library/react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

describe("Alert Component", () => {
  it("renders alert with default variant", () => {
    render(
      <Alert>
        <AlertTitle>Test Title</AlertTitle>
        <AlertDescription>Test description</AlertDescription>
      </Alert>
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test description")).toBeInTheDocument();
  });

  it("renders alert with destructive variant", () => {
    render(
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Something went wrong</AlertDescription>
      </Alert>
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("border-destructive/50");
    expect(alert).toHaveClass("text-destructive");
  });

  it("renders alert with custom className", () => {
    render(
      <Alert className="custom-class">
        <AlertDescription>Content</AlertDescription>
      </Alert>
    );

    expect(screen.getByRole("alert")).toHaveClass("custom-class");
  });

  it("renders AlertTitle with proper styling", () => {
    render(<AlertTitle>Title Only</AlertTitle>);

    const title = screen.getByText("Title Only");
    expect(title.tagName).toBe("H5");
    expect(title).toHaveClass("font-medium");
    expect(title).toHaveClass("tracking-tight");
  });

  it("renders AlertDescription with proper styling", () => {
    render(<AlertDescription>Description Only</AlertDescription>);

    const desc = screen.getByText("Description Only");
    expect(desc).toHaveClass("text-sm");
  });

  it("renders complex alert with icon", () => {
    render(
      <Alert>
        <svg data-testid="alert-icon" />
        <AlertTitle>Notification</AlertTitle>
        <AlertDescription>You have a new message</AlertDescription>
      </Alert>
    );

    expect(screen.getByTestId("alert-icon")).toBeInTheDocument();
    expect(screen.getByText("Notification")).toBeInTheDocument();
    expect(screen.getByText("You have a new message")).toBeInTheDocument();
  });
});
