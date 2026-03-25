import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LikeButton } from '../like-button';

describe('LikeButton', () => {
  describe('Rendering', () => {
    it('renders button with default props', () => {
      render(<LikeButton />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('displays vote count', () => {
      render(<LikeButton count={5} />);
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('hides count when showCount is false', () => {
      render(<LikeButton count={5} showCount={false} />);
      expect(screen.queryByText('5')).not.toBeInTheDocument();
    });

    it('renders with custom title', () => {
      render(<LikeButton title="Custom like button" />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Custom like button');
    });

    it('renders default title when not voted', () => {
      render(<LikeButton />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Like this');
    });

    it('renders default title when voted', () => {
      render(<LikeButton isVoted={true} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Unlike this');
    });
  });

  describe('States', () => {
    it('shows voted styling when isVoted is true', () => {
      const { container } = render(<LikeButton isVoted={true} count={10} />);
      const heartIcon = container.querySelector('svg');
      expect(heartIcon).toHaveClass('fill-amber-400');
    });

    it('shows not voted styling when isVoted is false', () => {
      const { container } = render(<LikeButton isVoted={false} count={10} />);
      const heartIcon = container.querySelector('svg');
      expect(heartIcon).not.toHaveClass('fill-amber-400');
    });

    it('disables button when disabled prop is true', () => {
      render(<LikeButton disabled={true} />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('disables button when isPending is true', () => {
      render(<LikeButton isPending={true} />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('keeps heart icon visible when isPending is true', () => {
      render(<LikeButton isPending={true} />);
      expect(document.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders default variant', () => {
       render(<LikeButton variant="default" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('rounded-full');
    });

    it('renders compact variant', () => {
       render(<LikeButton variant="compact" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('rounded-md');
    });

    it('renders overlay variant', () => {
       render(<LikeButton variant="overlay" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('rounded-md');
    });

    it('applies sm size variant', () => {
       render(<LikeButton size="sm" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-xs');
    });

    it('applies md size variant', () => {
       render(<LikeButton size="md" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-sm');
    });

    it('applies lg size variant', () => {
       render(<LikeButton size="lg" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-base');
    });
  });

  describe('Interactions', () => {
    it('calls onVote when button is clicked', async () => {
      const onVote = jest.fn();
      render(<LikeButton onVote={onVote} />);
      const button = screen.getByRole('button');
      
      await userEvent.click(button);
      expect(onVote).toHaveBeenCalledTimes(1);
    });

    it('does not call onVote when disabled', async () => {
      const onVote = jest.fn();
      render(<LikeButton disabled={true} onVote={onVote} />);
      const button = screen.getByRole('button');
      
      await userEvent.click(button);
      expect(onVote).not.toHaveBeenCalled();
    });

    it('does not call onVote when isPending', async () => {
      const onVote = jest.fn();
      render(<LikeButton isPending={true} onVote={onVote} />);
      const button = screen.getByRole('button');
      
      await userEvent.click(button);
      expect(onVote).not.toHaveBeenCalled();
    });

    it('handles async onVote handler', async () => {
      const onVote = jest.fn(() => Promise.resolve());
      render(<LikeButton onVote={onVote} />);
      const button = screen.getByRole('button');
      
      await userEvent.click(button);
      await waitFor(() => {
        expect(onVote).toHaveBeenCalled();
      });
    });

    it('can be clicked multiple times', async () => {
      const onVote = jest.fn(() => Promise.resolve());
      render(<LikeButton onVote={onVote} />);
      const button = screen.getByRole('button');
      
      await userEvent.click(button);
      await userEvent.click(button);
      expect(onVote).toHaveBeenCalledTimes(2);
    });
  });

  describe('Accessibility', () => {
    it('is keyboard accessible', async () => {
      const onVote = jest.fn();
      render(<LikeButton onVote={onVote} />);
      const button = screen.getByRole('button');
      
      button.focus();
      expect(button).toHaveFocus();
      
      fireEvent.keyDown(button, { code: 'Space' });
      await waitFor(() => {
        expect(button).toHaveFocus();
      });
    });

    it('has proper button role', () => {
      render(<LikeButton />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('does not render loading indicator', () => {
      render(<LikeButton isPending={true} />);
      expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument();
    });

    it('announces voted state via title', () => {
      render(<LikeButton isVoted={true} title="Unlike this post" />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Unlike this post');
    });
  });

  describe('Edge Cases', () => {
    it('handles zero count', () => {
      render(<LikeButton count={0} />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('handles large count', () => {
      render(<LikeButton count={999999} />);
      expect(screen.getByText('999999')).toBeInTheDocument();
    });

    it('handles undefined count', () => {
      render(<LikeButton />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('applies custom className', () => {
       render(<LikeButton className="custom-class" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('transitions colors smoothly', () => {
      const { container } = render(<LikeButton isVoted={false} />);
      const heartIcon = container.querySelector('svg');
      expect(heartIcon).toHaveClass('transition-all');
      expect(heartIcon).toHaveClass('duration-200');
    });
  });

  describe('Color Consistency', () => {
    it('uses amber color when voted', () => {
      const { container } = render(<LikeButton isVoted={true} count={5} />);
      const heartIcon = container.querySelector('svg');
      const countText = screen.getByText('5');
      
      expect(heartIcon).toHaveClass('fill-amber-400', 'text-amber-400');
      expect(countText).toHaveClass('text-amber-400');
    });

    it('uses white/70 when not voted', () => {
       const { container } = render(<LikeButton isVoted={false} count={5} />);
      const countText = screen.getByText('5');
      const heartIcon = container.querySelector('svg');
      
      expect(countText).toHaveClass('text-white/70');
      expect(heartIcon).toHaveClass('text-white/70');
    });

    it('uses amber on hover when not voted', () => {
      const { container } = render(<LikeButton isVoted={false} />);
      const heartIcon = container.querySelector('svg');
      
      expect(heartIcon).toHaveClass('group-hover:text-amber-400');
    });
  });
});
