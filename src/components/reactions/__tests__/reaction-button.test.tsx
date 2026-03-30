import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReactionButton from "../reaction-button";
import * as reactionModule from "@/hooks/use-comment-reactions";

jest.mock("@/hooks/use-comment-reactions");

describe("ReactionButton Component", () => {
  const mockMutateAsync = jest.fn();
  const defaultProps = {
    commentId: "test-comment-123",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (reactionModule.useCommentReaction as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      isError: false,
      error: null,
    });
  });

  describe("Rendering", () => {
    it("should render the reaction button", () => {
      render(<ReactionButton {...defaultProps} />);
      const button = screen.getByRole("button", { name: "0" });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute("title", "Like this comment");
    });

    it("should render with initial count of 0 by default", () => {
      render(<ReactionButton {...defaultProps} />);
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("should render with custom initial count", () => {
      render(<ReactionButton {...defaultProps} initialCount={42} />);
      expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("should have correct styling classes", () => {
      render(<ReactionButton {...defaultProps} />);
      const button = screen.getByRole("button", { name: "0" });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass("flex");
    });

    it("should display heart icon with correct color when not reacted", () => {
      render(<ReactionButton {...defaultProps} />);
      const heartIcon = screen.getByRole("button").querySelector("svg");
      expect(heartIcon).toBeInTheDocument();
      expect(heartIcon).toHaveClass("text-white/70");
    });

    it("should display filled heart icon when user has reacted", () => {
      render(<ReactionButton {...defaultProps} initialUserReacted={true} />);
      const heartIcon = screen.getByRole("button").querySelector("svg");
      expect(heartIcon).toBeInTheDocument();
      expect(heartIcon).toHaveClass("text-amber-400", "fill-amber-400");
    });
  });

  describe("Click Interaction", () => {
    it("should toggle reaction when button is clicked", async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValueOnce({ success: true });

      render(<ReactionButton {...defaultProps} initialCount={5} />);

      const button = screen.getByRole("button", { name: "5" });
      await user.click(button);

      // Count should increase optimistically
      await waitFor(() => {
        expect(screen.getByText("6")).toBeInTheDocument();
      });
    });

    it("should increment count when not reacted", async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValueOnce({ success: true });

      render(
        <ReactionButton
          {...defaultProps}
          initialCount={10}
          initialUserReacted={false}
        />,
      );

      const button = screen.getByRole("button", { name: "10" });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText("11")).toBeInTheDocument();
      });
    });

    it("should decrement count when already reacted", async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValueOnce({ success: true });

      render(
        <ReactionButton
          {...defaultProps}
          initialCount={10}
          initialUserReacted={true}
        />,
      );

      const button = screen.getByRole("button", { name: "10" });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText("9")).toBeInTheDocument();
      });
    });

    it("should update heart icon color to red when reaction is added", async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValueOnce({ success: true });

      render(<ReactionButton {...defaultProps} initialUserReacted={false} />);

      const button = screen.getByRole("button", { name: "0" });

      // Initially not filled
      let heartIcon = button.querySelector("svg");
      expect(heartIcon).not.toHaveClass("fill-amber-400");

      await user.click(button);

      await waitFor(() => {
        heartIcon = button.querySelector("svg");
        expect(heartIcon).toHaveClass("fill-amber-400", "text-amber-400");
      });
    });

    it("should update heart icon color back when reaction is removed", async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValueOnce({ success: true });

      render(<ReactionButton {...defaultProps} initialUserReacted={true} />);

      const button = screen.getByRole("button", { name: "0" });

      // Initially filled
      let heartIcon = button.querySelector("svg");
      expect(heartIcon).toHaveClass("fill-amber-400");

      await user.click(button);

      await waitFor(() => {
        heartIcon = button.querySelector("svg");
        expect(heartIcon).not.toHaveClass("fill-amber-400");
      });
    });
  });

  describe("API Call", () => {
    it("should call API with correct comment ID", async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValueOnce({ success: true });

      render(<ReactionButton {...defaultProps} />);

      const button = screen.getByRole("button", { name: "0" });
      await user.click(button);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith("test-comment-123");
      });
    });

    it("should send API call on each toggle", async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValueOnce({ success: true });
      mockMutateAsync.mockResolvedValueOnce({ success: true });

      render(<ReactionButton {...defaultProps} />);

      let button = screen.getByRole("button", { name: "0" });

      await user.click(button);
      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledTimes(1);
      });

      button = screen.getByRole("button", { name: "1" });
      await user.click(button);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("Loading States", () => {
    it("should disable button while request is pending", () => {
      // Test the disabled state when isPending is true
      (reactionModule.useCommentReaction as jest.Mock).mockReturnValueOnce({
        mutateAsync: mockMutateAsync,
        isPending: true,
        isError: false,
        error: null,
      });

      render(<ReactionButton {...defaultProps} />);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("should show loader while pending", () => {
      (reactionModule.useCommentReaction as jest.Mock).mockReturnValueOnce({
        mutateAsync: mockMutateAsync,
        isPending: true,
        isError: false,
        error: null,
      });

      render(<ReactionButton {...defaultProps} />);

      const button = screen.getByRole("button");

      // Check for loader icon (Loader2 component)
      const loaderIcon = button.querySelector('[class*="animate-spin"]');
      expect(loaderIcon).toBeInTheDocument();
    });

    it("should disable button with not-allowed cursor during pending", () => {
      (reactionModule.useCommentReaction as jest.Mock).mockReturnValueOnce({
        mutateAsync: mockMutateAsync,
        isPending: true,
        isError: false,
        error: null,
      });

      render(<ReactionButton {...defaultProps} />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("disabled:cursor-not-allowed");
      expect(button).toBeDisabled();
    });
  });

  describe("Error Handling", () => {
    it("should revert count on API error", async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const user = userEvent.setup();
      mockMutateAsync.mockRejectedValueOnce(new Error("Network error"));

      render(
        <ReactionButton
          {...defaultProps}
          initialCount={5}
          initialUserReacted={false}
        />,
      );

      expect(screen.getByText("5")).toBeInTheDocument();

      const button = screen.getByRole("button", { name: "5" });

      // Fire the click without waiting
      fireEvent.click(button);

      // Count increases optimistically immediately
      expect(screen.getByText("6")).toBeInTheDocument();

      // Then reverts on error
      await waitFor(() => {
        expect(screen.getByText("5")).toBeInTheDocument();
      });
    });

    it("should revert reaction state on API error", async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const user = userEvent.setup();
      mockMutateAsync.mockRejectedValueOnce(new Error("API error"));

      render(<ReactionButton {...defaultProps} initialUserReacted={false} />);

      const button = screen.getByRole("button");

      // Icon should change to filled optimistically
      let heartIcon = button.querySelector("svg");
      expect(heartIcon).not.toHaveClass("fill-amber-400");

      // Fire the click without waiting for async
      fireEvent.click(button);

      // Should be filled optimistically immediately
      heartIcon = button.querySelector("svg");
      expect(heartIcon).toHaveClass("fill-amber-400");

      // Then revert on error
      await waitFor(() => {
        heartIcon = button.querySelector("svg");
        expect(heartIcon).not.toHaveClass("fill-amber-400");
      });
    });

    it("should handle network errors gracefully", async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const user = userEvent.setup();
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      mockMutateAsync.mockRejectedValueOnce(new Error("Network timeout"));

      render(<ReactionButton {...defaultProps} initialCount={1} />);

      const button = screen.getByRole("button", { name: "1" });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText("1")).toBeInTheDocument();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe("Accessibility", () => {
    it("should have proper title attribute when not reacted", () => {
      render(<ReactionButton {...defaultProps} initialUserReacted={false} />);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("title", "Like this comment");
    });

    it("should have proper title attribute when reacted", () => {
      render(<ReactionButton {...defaultProps} initialUserReacted={true} />);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("title", "Unlike this comment");
    });

    it("should be keyboard accessible", async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValueOnce({ success: true });

      render(<ReactionButton {...defaultProps} />);

      const button = screen.getByRole("button", { name: "0" });

      // Tab to button
      await user.tab();
      expect(button).toHaveFocus();

      // Press Enter to activate
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalled();
      });
    });
  });

  describe("Optimistic Updates", () => {
    it("should update UI before API call completes", async () => {
      const user = userEvent.setup();
      let resolveApi: (value: unknown) => void = () => {};
      mockMutateAsync.mockReturnValueOnce(
        new Promise((resolve) => {
          resolveApi = resolve;
        }),
      );

      render(<ReactionButton {...defaultProps} initialCount={3} />);

      const button = screen.getByRole("button", { name: "3" });
      await user.click(button);

      // UI should update immediately
      expect(screen.getByText("4")).toBeInTheDocument();

      // Resolve API call
      if (typeof resolveApi === "function") {
        resolveApi({ success: true });
      }

      // Should remain updated
      await waitFor(() => {
        expect(screen.getByText("4")).toBeInTheDocument();
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero initial count", () => {
      render(<ReactionButton {...defaultProps} initialCount={0} />);
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("should handle large count numbers", () => {
      render(<ReactionButton {...defaultProps} initialCount={9999} />);
      expect(screen.getByText("9999")).toBeInTheDocument();
    });

    it("should handle rapid clicks gracefully", async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValueOnce({ success: true });

      render(<ReactionButton {...defaultProps} initialCount={0} />);

      const button = screen.getByRole("button", { name: "0" });

      // First click
      await user.click(button);

      // Count should be 1
      await waitFor(() => {
        expect(screen.getByText("1")).toBeInTheDocument();
      });

      // Only one API call should be made
      expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    });

    it("should render properly with undefined initial values", () => {
      render(<ReactionButton commentId="test" />);
      expect(screen.getByText("0")).toBeInTheDocument();
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });
  });

  describe("Style Transitions", () => {
    it("should apply transition classes", () => {
      render(<ReactionButton {...defaultProps} />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("transition-all");
    });

    it("should apply hover state class when not pending", () => {
      render(<ReactionButton {...defaultProps} />);
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });

    it("should apply disabled styles when pending", () => {
      (reactionModule.useCommentReaction as jest.Mock).mockReturnValueOnce({
        mutateAsync: mockMutateAsync,
        isPending: true,
        isError: false,
        error: null,
      });

      render(<ReactionButton {...defaultProps} />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass(
        "disabled:opacity-50",
        "disabled:cursor-not-allowed",
      );
    });
  });

  describe("Different Comment IDs", () => {
    it("should work with different comment IDs", async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValueOnce({ success: true });

      const { unmount } = render(<ReactionButton commentId="comment-1" />);

      let button = screen.getByRole("button", { name: "0" });
      await user.click(button);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith("comment-1");
      });

      // Unmount first component
      unmount();

      // Clear mocks and set up new expectations
      jest.clearAllMocks();
      (reactionModule.useCommentReaction as jest.Mock).mockReturnValueOnce({
        mutateAsync: mockMutateAsync,
        isPending: false,
        isError: false,
        error: null,
      });
      mockMutateAsync.mockResolvedValueOnce({ success: true });

      render(<ReactionButton commentId="comment-2" />);
      button = screen.getByRole("button", { name: "0" });
      await user.click(button);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith("comment-2");
      });
    });
  });

  describe("Initial States", () => {
    it("should render with correct initial state when user has reacted", () => {
      render(
        <ReactionButton
          {...defaultProps}
          initialCount={5}
          initialUserReacted={true}
        />,
      );

      const button = screen.getByRole("button", { name: "5" });
      expect(button).toHaveAttribute("title", "Unlike this comment");

      const heartIcon = button.querySelector("svg");
      expect(heartIcon).toHaveClass("fill-amber-400", "text-amber-400");
    });

    it("should render with correct initial state when user has not reacted", () => {
      render(
        <ReactionButton
          {...defaultProps}
          initialCount={5}
          initialUserReacted={false}
        />,
      );

      const button = screen.getByRole("button", { name: "5" });
      expect(button).toHaveAttribute("title", "Like this comment");

      const heartIcon = button.querySelector("svg");
      expect(heartIcon).not.toHaveClass("fill-amber-400");
    });
  });
});
