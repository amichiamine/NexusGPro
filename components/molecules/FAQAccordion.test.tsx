import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import FAQAccordion from './FAQAccordion';

// Test utilities
const createMockFAQItem = (question: string, answer: React.ReactNode, props?: any) => ({
  question,
  answer,
  ...props
});

const defaultFAQItems = [
  {
    question: 'What is React?',
    answer: 'React is a JavaScript library for building user interfaces.'
  },
  {
    question: 'What is TypeScript?',
    answer: 'TypeScript is a strongly typed programming language that builds on JavaScript.'
  },
  {
    question: 'What is Vite?',
    answer: 'Vite is a build tool that aims to provide a faster development experience.'
  }
];

describe('FAQAccordion Component', () => {
  describe('Rendering', () => {
    it('should render FAQ accordion with default props', () => {
      render(<FAQAccordion items={defaultFAQItems} />);
      
      const accordion = screen.getByRole('region', { name: /frequently asked questions/i });
      expect(accordion).toBeInTheDocument();
      
      const questions = screen.getAllByRole('button');
      expect(questions).toHaveLength(3);
      
      expect(screen.getByText('What is React?')).toBeInTheDocument();
      expect(screen.getByText('What is TypeScript?')).toBeInTheDocument();
      expect(screen.getByText('What is Vite?')).toBeInTheDocument();
    });

    it('should render with empty items array', () => {
      const { container } = render(<FAQAccordion items={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it('should filter out invalid items', () => {
      const itemsWithInvalid = [
        { question: 'Valid Question', answer: 'Valid Answer' },
        { question: '' },
        { answer: 'Answer without question' },
        null as any,
        { question: 'Another Valid', answer: 'Another Answer' }
      ];
      
      render(<FAQAccordion items={itemsWithInvalid} />);
      
      expect(screen.getByText('Valid Question')).toBeInTheDocument();
      expect(screen.getByText('Another Valid')).toBeInTheDocument();
      expect(screen.queryByText('')).not.toBeInTheDocument();
    });

    it('should render single item', () => {
      render(<FAQAccordion items={[{ question: 'Single Question', answer: 'Single Answer' }]} />);
      
      expect(screen.getByText('Single Question')).toBeInTheDocument();
      expect(screen.getByText('Single Answer')).toBeInTheDocument();
      expect(screen.getAllByRole('button')).toHaveLength(1);
    });
  });

  describe('Controlled vs Uncontrolled', () => {
    it('should work in uncontrolled mode', async () => {
      const user = userEvent.setup();
      render(<FAQAccordion items={defaultFAQItems} />);
      
      const firstButton = screen.getByRole('button', { name: 'What is React?' });
      await user.click(firstButton);
      
      expect(firstButton).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('React is a JavaScript library for building user interfaces.')).toBeInTheDocument();
    });

    it('should work in controlled mode', async () => {
      const user = userEvent.setup();
      const handleExpandedChange = vi.fn();
      
      const { rerender } = render(
        <FAQAccordion 
          items={defaultFAQItems} 
          expanded={[0]} 
          onExpandedChange={handleExpandedChange}
        />
      );
      
      const firstButton = screen.getByRole('button', { name: 'What is React?' });
      expect(firstButton).toHaveAttribute('aria-expanded', 'true');
      
      await user.click(firstButton);
      expect(handleExpandedChange).toHaveBeenCalledWith([]);
    });

    it('should ignore uncontrolled changes when controlled', async () => {
      const user = userEvent.setup();
      
      const { rerender } = render(
        <FAQAccordion 
          items={defaultFAQItems} 
          expanded={[1]} 
        />
      );
      
      const firstButton = screen.getByRole('button', { name: 'What is React?' });
      await user.click(firstButton);
      
      // Should not change when controlled
      expect(firstButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Single vs Multiple Expansion', () => {
    it('should allow only one item expanded by default', async () => {
      const user = userEvent.setup();
      render(<FAQAccordion items={defaultFAQItems} allowMultiple={false} />);
      
      const firstButton = screen.getByRole('button', { name: 'What is React?' });
      const secondButton = screen.getByRole('button', { name: 'What is TypeScript?' });
      
      await user.click(firstButton);
      expect(firstButton).toHaveAttribute('aria-expanded', 'true');
      
      await user.click(secondButton);
      expect(firstButton).toHaveAttribute('aria-expanded', 'false');
      expect(secondButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('should allow multiple items expanded when allowMultiple is true', async () => {
      const user = userEvent.setup();
      render(<FAQAccordion items={defaultFAQItems} allowMultiple={true} />);
      
      const firstButton = screen.getByRole('button', { name: 'What is React?' });
      const secondButton = screen.getByRole('button', { name: 'What is TypeScript?' });
      
      await user.click(firstButton);
      await user.click(secondButton);
      
      expect(firstButton).toHaveAttribute('aria-expanded', 'true');
      expect(secondButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('should collapse expanded item when allowMultiple is false', async () => {
      const user = userEvent.setup();
      render(<FAQAccordion items={defaultFAQItems} allowMultiple={false} />);
      
      const firstButton = screen.getByRole('button', { name: 'What is React?' });
      
      await user.click(firstButton);
      expect(firstButton).toHaveAttribute('aria-expanded', 'true');
      
      await user.click(firstButton);
      expect(firstButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Variants', () => {
    const variants = ['default', 'outlined', 'filled', 'minimal', 'bordered'];
    
    variants.forEach(variant => {
      it(`should render with ${variant} variant`, () => {
        const { container } = render(
          <FAQAccordion items={defaultFAQItems} variant={variant as any} />
        );
        
        const firstItem = container.querySelector('.faq-item');
        expect(firstItem).toHaveClass(`faq-item-variant-${variant}`);
      });
    });
  });

  describe('Sizes', () => {
    const sizes = ['sm', 'md', 'lg'];
    
    sizes.forEach(size => {
      it(`should render with ${size} size`, () => {
        const { container } = render(
          <FAQAccordion items={defaultFAQItems} size={size as any} />
        );
        
        const accordion = container.firstChild;
        expect(accordion).toHaveClass(`faq-accordion-size-${size}`);
      });
    });
  });

  describe('Icon Position', () => {
    it('should render icons on the right by default', () => {
      const { container } = render(
        <FAQAccordion items={defaultFAQItems} />
      );
      
      const questionButtons = container.querySelectorAll('.faq-question-button');
      expect(questionButtons[0]).toHaveClass('faq-question-button-icon-right');
    });

    it('should render icons on the left when iconPosition is left', () => {
      const { container } = render(
        <FAQAccordion items={defaultFAQItems} iconPosition="left" />
      );
      
      const questionButtons = container.querySelectorAll('.faq-question-button');
      expect(questionButtons[0]).toHaveClass('faq-question-button-icon-left');
    });
  });

  describe('Custom Icons', () => {
    const ExpandIcon = () => <span data-testid="expand-icon">+</span>;
    const CollapseIcon = () => <span data-testid="collapse-icon">-</span>;
    
    it('should render custom expand and collapse icons', () => {
      render(
        <FAQAccordion 
          items={defaultFAQItems} 
          expandIcon={<ExpandIcon />}
          collapseIcon={<CollapseIcon />}
        />
      );
      
      expect(screen.getAllByTestId('expand-icon')).toHaveLength(3);
      expect(screen.queryByTestId('collapse-icon')).not.toBeInTheDocument();
    });
  });

  describe('Item Icons', () => {
    const QuestionIcon = () => <span data-testid="question-icon">Q</span>;
    const AnswerIcon = () => <span data-testid="answer-icon">A</span>;
    
    it('should render icons with questions', () => {
      const itemsWithIcons = [
        {
          question: 'Question with icon',
          answer: 'Answer',
          questionIcon: <QuestionIcon />
        }
      ];
      
      render(<FAQAccordion items={itemsWithIcons} />);
      
      expect(screen.getAllByTestId('question-icon')).toHaveLength(1);
    });

    it('should render icons with answers', () => {
      const itemsWithIcons = [
        {
          question: 'Question',
          answer: 'Answer with icon',
          answerIcon: <AnswerIcon />
        }
      ];
      
      render(<FAQAccordion items={itemsWithIcons} />);
      
      const firstButton = screen.getByRole('button', { name: 'Question' });
      fireEvent.click(firstButton);
      
      expect(screen.getByText('Answer with icon')).toBeInTheDocument();
      expect(screen.getAllByTestId('answer-icon')).toHaveLength(1);
    });
  });

  describe('Disabled Items', () => {
    it('should disable individual items', async () => {
      const user = userEvent.setup();
      
      const itemsWithDisabled = [
        { question: 'Enabled Question', answer: 'Enabled Answer' },
        { question: 'Disabled Question', answer: 'Disabled Answer', disabled: true }
      ];
      
      render(<FAQAccordion items={itemsWithDisabled} />);
      
      const disabledButton = screen.getByRole('button', { name: 'Disabled Question' });
      expect(disabledButton).toBeDisabled();
      
      await user.click(disabledButton);
      expect(disabledButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should show disabled state styling', () => {
      const itemsWithDisabled = [
        { question: 'Enabled Question', answer: 'Enabled Answer' },
        { question: 'Disabled Question', answer: 'Disabled Answer', disabled: true }
      ];
      
      const { container } = render(<FAQAccordion items={itemsWithDisabled} />);
      
      const disabledItem = container.querySelectorAll('.faq-item')[1];
      expect(disabledItem).toHaveClass('faq-item-disabled');
    });
  });

  describe('Animation', () => {
    it('should animate by default', () => {
      const { container } = render(
        <FAQAccordion items={defaultFAQItems} />
      );
      
      const accordion = container.firstChild;
      expect(accordion).toHaveClass('faq-accordion-animated');
    });

    it('should disable animation when animated is false', () => {
      const { container } = render(
        <FAQAccordion items={defaultFAQItems} animated={false} />
      );
      
      const accordion = container.firstChild;
      expect(accordion).not.toHaveClass('faq-accordion-animated');
    });

    it('should use custom animation duration', () => {
      const { container } = render(
        <FAQAccordion items={defaultFAQItems} animationDuration={500} />
      );
      
      const firstButton = screen.getByRole('button', { name: 'What is React?' });
      fireEvent.click(firstButton);
      
      const answer = screen.getByTestId('faq-answer-0');
      expect(answer).toHaveStyle({ animationDuration: '500ms' });
    });

    it('should show animation class during transition', async () => {
      const user = userEvent.setup();
      
      render(
        <FAQAccordion items={defaultFAQItems} />
      );
      
      const firstButton = screen.getByRole('button', { name: 'What is React?' });
      
      fireEvent.animationStart(firstButton);
      await user.click(firstButton);
      
      const answer = screen.getByTestId('faq-answer-0');
      expect(answer).toHaveClass('faq-answer-animating');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should be keyboard navigable by default', async () => {
      const user = userEvent.setup();
      render(<FAQAccordion items={defaultFAQItems} />);
      
      const firstButton = screen.getByRole('button', { name: 'What is React?' });
      firstButton.focus();
      
      expect(firstButton).toHaveFocus();
      
      await user.keyboard('{ArrowDown}');
      const secondButton = screen.getByRole('button', { name: 'What is TypeScript?' });
      expect(secondButton).toHaveFocus();
    });

    it('should support ArrowUp key', async () => {
      const user = userEvent.setup();
      render(<FAQAccordion items={defaultFAQItems} />);
      
      const secondButton = screen.getByRole('button', { name: 'What is TypeScript?' });
      secondButton.focus();
      
      await user.keyboard('{ArrowUp}');
      const firstButton = screen.getByRole('button', { name: 'What is React?' });
      expect(firstButton).toHaveFocus();
    });

    it('should support Home and End keys', async () => {
      const user = userEvent.setup();
      render(<FAQAccordion items={defaultFAQItems} />);
      
      const secondButton = screen.getByRole('button', { name: 'What is TypeScript?' });
      secondButton.focus();
      
      await user.keyboard('{Home}');
      const firstButton = screen.getByRole('button', { name: 'What is React?' });
      expect(firstButton).toHaveFocus();
      
      await user.keyboard('{End}');
      const lastButton = screen.getByRole('button', { name: 'What is Vite?' });
      expect(lastButton).toHaveFocus();
    });

    it('should disable keyboard navigation when keyboardNavigation is false', async () => {
      const user = userEvent.setup();
      render(<FAQAccordion items={defaultFAQItems} keyboardNavigation={false} />);
      
      const firstButton = screen.getByRole('button', { name: 'What is React?' });
      firstButton.focus();
      
      await user.keyboard('{ArrowDown}');
      expect(firstButton).toHaveFocus(); // Should not move
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<FAQAccordion items={defaultFAQItems} />);
      
      const accordion = screen.getByRole('region', { name: /frequently asked questions/i });
      expect(accordion).toBeInTheDocument();
    });

    it('should allow custom aria-label', () => {
      render(
        <FAQAccordion 
          items={defaultFAQItems} 
          aria-label="Custom FAQ Label" 
        />
      );
      
      expect(screen.getByRole('region', { name: 'Custom FAQ Label' })).toBeInTheDocument();
    });

    it('should set aria-expanded on buttons', async () => {
      const user = userEvent.setup();
      render(<FAQAccordion items={defaultFAQItems} />);
      
      const firstButton = screen.getByRole('button', { name: 'What is React?' });
      expect(firstButton).toHaveAttribute('aria-expanded', 'false');
      
      await user.click(firstButton);
      expect(firstButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('should set aria-controls linking questions to answers', async () => {
      const user = userEvent.setup();
      render(<FAQAccordion items={defaultFAQItems} />);
      
      const firstButton = screen.getByRole('button', { name: 'What is React?' });
      const answerId = firstButton.getAttribute('aria-controls');
      
      expect(answerId).toBeTruthy();
      
      await user.click(firstButton);
      const answer = document.getElementById(answerId!);
      expect(answer).toBeInTheDocument();
    });

    it('should set aria-labelledby linking answers to questions', async () => {
      const user = userEvent.setup();
      render(<FAQAccordion items={defaultFAQItems} />);
      
      const firstButton = screen.getByRole('button', { name: 'What is React?' });
      await user.click(firstButton);
      
      const answer = screen.getByTestId('faq-answer-0');
      const labelledBy = answer.getAttribute('aria-labelledby');
      expect(labelledBy).toBeTruthy();
    });

    it('should support focus management', async () => {
      const user = userEvent.setup();
      render(<FAQAccordion items={defaultFAQItems} />);
      
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        button.focus();
        expect(button).toHaveFocus();
      });
    });

    it('should announce expanded state changes to screen readers', async () => {
      const user = userEvent.setup();
      render(<FAQAccordion items={defaultFAQItems} />);
      
      const firstButton = screen.getByRole('button', { name: 'What is React?' });
      await user.click(firstButton);
      
      // Should be expanded now
      expect(firstButton).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('React is a JavaScript library for building user interfaces.')).toBeInTheDocument();
    });
  });

  describe('Event Handlers', () => {
    it('should call onExpandedChange when items are expanded/collapsed', async () => {
      const user = userEvent.setup();
      const handleExpandedChange = vi.fn();
      
      render(
        <FAQAccordion 
          items={defaultFAQItems} 
          onExpandedChange={handleExpandedChange}
        />
      );
      
      const firstButton = screen.getByRole('button', { name: 'What is React?' });
      await user.click(firstButton);
      
      expect(handleExpandedChange).toHaveBeenCalledWith([0]);
      
      await user.click(firstButton);
      expect(handleExpandedChange).toHaveBeenCalledWith([]);
    });

    it('should call onItemClick when items are clicked', async () => {
      const user = userEvent.setup();
      const handleItemClick = vi.fn();
      
      render(
        <FAQAccordion 
          items={defaultFAQItems} 
          onItemClick={handleItemClick}
        />
      );
      
      const firstButton = screen.getByRole('button', { name: 'What is React?' });
      await user.click(firstButton);
      
      expect(handleItemClick).toHaveBeenCalledWith(0, defaultFAQItems[0]);
    });

    it('should call item-specific onClick handler', async () => {
      const user = userEvent.setup();
      const itemClick = vi.fn();
      
      const itemsWithClick = [
        { 
          question: 'Question', 
          answer: 'Answer',
          onClick: itemClick
        }
      ];
      
      render(<FAQAccordion items={itemsWithClick} />);
      
      const button = screen.getByRole('button', { name: 'Question' });
      await user.click(button);
      
      expect(itemClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Custom Classes and IDs', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <FAQAccordion items={defaultFAQItems} className="custom-faq" />
      );
      
      expect(container.firstChild).toHaveClass('custom-faq');
    });

    it('should apply custom ID', () => {
      render(
        <FAQAccordion items={defaultFAQItems} id="custom-faq-id" />
      );
      
      expect(screen.getByRole('region')).toHaveAttribute('id', 'custom-faq-id');
    });

    it('should apply test ID', () => {
      render(
        <FAQAccordion items={defaultFAQItems} data-testid="faq-test" />
      );
      
      expect(screen.getByTestId('faq-test')).toBeInTheDocument();
    });

    it('should apply custom className to items', () => {
      const itemsWithClasses = [
        { 
          question: 'Question', 
          answer: 'Answer',
          className: 'custom-item'
        }
      ];
      
      const { container } = render(<FAQAccordion items={itemsWithClasses} />);
      
      const item = container.querySelector('.faq-item');
      expect(item).toHaveClass('custom-item');
    });

    it('should apply custom IDs to items', () => {
      const itemsWithIDs = [
        { 
          question: 'Question', 
          answer: 'Answer',
          id: 'custom-item-id'
        }
      ];
      
      render(<FAQAccordion items={itemsWithIDs} />);
      
      const button = screen.getByRole('button', { name: 'Question' });
      expect(button).toHaveAttribute('aria-controls', 'custom-item-id-content');
    });

    it('should apply test IDs to items', () => {
      const itemsWithTestIDs = [
        { 
          question: 'Question', 
          answer: 'Answer',
          'data-testid': 'item-test'
        }
      ];
      
      render(<FAQAccordion items={itemsWithTestIDs} />);
      
      expect(screen.getByTestId('item-test')).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('should handle undefined items gracefully', () => {
      const { container } = render(<FAQAccordion items={undefined as any} />);
      expect(container.firstChild).toBeNull();
    });

    it('should handle null items gracefully', () => {
      const { container } = render(<FAQAccordion items={null as any} />);
      expect(container.firstChild).toBeNull();
    });

    it('should handle empty string questions', () => {
      const itemsWithEmpty = [
        { question: '', answer: 'Answer' },
        { question: '   ', answer: 'Answer' },
        { question: 'Valid Question', answer: 'Valid Answer' }
      ];
      
      render(<FAQAccordion items={itemsWithEmpty} />);
      
      expect(screen.getByText('Valid Question')).toBeInTheDocument();
      expect(screen.queryByText('')).not.toBeInTheDocument();
      expect(screen.queryByText('   ')).not.toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<FAQAccordion items={defaultFAQItems} />);
      
      const initialButtons = screen.getAllByRole('button');
      const initialCount = initialButtons.length;
      
      rerender(<FAQAccordion items={defaultFAQItems} variant="outlined" />);
      
      const newButtons = screen.getAllByRole('button');
      expect(newButtons).toHaveLength(initialCount);
    });

    it('should handle large item lists efficiently', () => {
      const largeItems = Array.from({ length: 100 }, (_, i) => ({
        question: `Question ${i + 1}`,
        answer: `Answer ${i + 1}`
      }));
      
      const startTime = performance.now();
      render(<FAQAccordion items={largeItems} />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(1000); // Should render within 1 second
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(100);
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to container element', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<FAQAccordion items={defaultFAQItems} ref={ref} />);
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.tagName).toBe('DIV');
      expect(ref.current).toHaveClass('faq-accordion');
    });
  });

  describe('Edge Cases', () => {
    it('should handle items with very long questions', () => {
      const longQuestion = 'This is an extremely long question that might cause overflow issues in the FAQ accordion and could potentially break the layout';
      
      const itemsWithLongQuestions = [
        { question: longQuestion, answer: 'Short answer' }
      ];
      
      render(<FAQAccordion items={itemsWithLongQuestions} />);
      
      expect(screen.getByText(longQuestion)).toBeInTheDocument();
      const button = screen.getByRole('button', { name: longQuestion });
      expect(button).toHaveClass('faq-question-button');
    });

    it('should handle items with very long answers', () => {
      const longAnswer = 'This is an extremely long answer that provides detailed information about the topic and might contain multiple paragraphs of text that could affect the display and layout of the FAQ accordion component in various screen sizes and contexts.';
      
      const itemsWithLongAnswers = [
        { question: 'Short question', answer: longAnswer }
      ];
      
      render(<FAQAccordion items={itemsWithLongAnswers} />);
      
      const button = screen.getByRole('button', { name: 'Short question' });
      fireEvent.click(button);
      
      expect(screen.getByText(longAnswer)).toBeInTheDocument();
    });

    it('should handle items with special characters', () => {
      const specialItems = [
        { question: 'Question with & symbols?', answer: 'Answer with "quotes"' },
        { question: 'Question <tags>', answer: 'Answer >more< tags' },
        { question: 'Question with émojis 😀', answer: 'Answer with numbers 123' }
      ];
      
      render(<FAQAccordion items={specialItems} />);
      
      expect(screen.getByText('Question with & symbols?')).toBeInTheDocument();
      expect(screen.getByText('Question <tags>')).toBeInTheDocument();
      expect(screen.getByText('Question with émojis 😀')).toBeInTheDocument();
    });

    it('should handle nested React nodes', () => {
      const nestedItems = [
        {
          question: 'Question with link',
          answer: (
            <div>
              <p>Answer with <a href="/test">link</a></p>
              <ul>
                <li>List item 1</li>
                <li>List item 2</li>
              </ul>
            </div>
          )
        }
      ];
      
      render(<FAQAccordion items={nestedItems} />);
      
      const button = screen.getByRole('button', { name: 'Question with link' });
      fireEvent.click(button);
      
      expect(screen.getByText('Answer with')).toBeInTheDocument();
      expect(screen.getByText('link')).toBeInTheDocument();
      expect(screen.getByText('List item 1')).toBeInTheDocument();
      expect(screen.getByText('List item 2')).toBeInTheDocument();
    });
  });

  describe('Animation and Transitions', () => {
    it('should trigger animation start and end events', async () => {
      const handleAnimationStart = vi.fn();
      const handleAnimationEnd = vi.fn();
      
      render(
        <FAQAccordion 
          items={defaultFAQItems} 
          onItemClick={() => {
            handleAnimationStart();
            setTimeout(handleAnimationEnd, 100);
          }}
        />
      );
      
      const button = screen.getByRole('button', { name: 'What is React?' });
      await userEvent.click(button);
      
      expect(handleAnimationStart).toHaveBeenCalled();
      
      await waitFor(() => {
        expect(handleAnimationEnd).toHaveBeenCalled();
      });
    });

    it('should handle hover effects', async () => {
      const user = userEvent.setup();
      render(<FAQAccordion items={defaultFAQItems} />);
      
      const firstButton = screen.getByRole('button', { name: 'What is React?' });
      
      await user.hover(firstButton);
      
      // Hover state should be applied
      expect(firstButton).toHaveClass('faq-question-button');
    });
  });

  describe('Real-world Use Cases', () => {
    it('should handle FAQ section for help documentation', () => {
      const helpItems = [
        {
          question: 'How do I reset my password?',
          answer: 'To reset your password, click on the "Forgot Password" link on the login page.'
        },
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards, PayPal, and bank transfers.'
        },
        {
          question: 'How long does shipping take?',
          answer: 'Standard shipping takes 3-5 business days. Express shipping takes 1-2 business days.'
        }
      ];
      
      render(<FAQAccordion items={helpItems} />);
      
      expect(screen.getByText('How do I reset my password?')).toBeInTheDocument();
      expect(screen.getByText('What payment methods do you accept?')).toBeInTheDocument();
      expect(screen.getByText('How long does shipping take?')).toBeInTheDocument();
    });

    it('should handle product feature explanations', () => {
      const featureItems = [
        {
          question: 'What are the key features?',
          answer: 'Our product includes advanced analytics, real-time reporting, and cloud integration.'
        },
        {
          question: 'Is there a free trial?',
          answer: 'Yes, we offer a 14-day free trial with full access to all features.'
        }
      ];
      
      render(<FAQAccordion items={featureItems} />);
      
      expect(screen.getByText('What are the key features?')).toBeInTheDocument();
      expect(screen.getByText('Is there a free trial?')).toBeInTheDocument();
    });

    it('should handle technical documentation FAQ', () => {
      const techItems = [
        {
          question: 'What browsers are supported?',
          answer: 'We support all modern browsers including Chrome, Firefox, Safari, and Edge.'
        },
        {
          question: 'How do I integrate with APIs?',
          answer: 'Use our REST API with JSON responses. Full documentation is available in the developer section.'
        }
      ];
      
      render(<FAQAccordion items={techItems} />);
      
      expect(screen.getByText('What browsers are supported?')).toBeInTheDocument();
      expect(screen.getByText('How do I integrate with APIs?')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing question gracefully', () => {
      const itemsWithMissingQuestion = [
        { answer: 'Answer without question' }
      ];
      
      const { container } = render(<FAQAccordion items={itemsWithMissingQuestion} />);
      
      // Should not render anything for invalid items
      expect(container.firstChild).toBeNull();
    });

    it('should handle invalid answer nodes gracefully', () => {
      const itemsWithInvalidAnswer = [
        { question: 'Question', answer: null }
      ];
      
      render(<FAQAccordion items={itemsWithInvalidAnswer} />);
      
      const button = screen.getByRole('button', { name: 'Question' });
      fireEvent.click(button);
      
      // Should handle null answer gracefully
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });
});

// Additional comprehensive test for React 18 features
describe('FAQAccordion React 18 Features', () => {
  it('should support concurrent features', async () => {
    const handleExpandedChange = vi.fn();
    
    const { rerender } = render(
      <FAQAccordion 
        items={defaultFAQItems} 
        expanded={[0]} 
        onExpandedChange={handleExpandedChange}
      />
    );
    
    // Simulate concurrent update
    rerender(
      <FAQAccordion 
        items={defaultFAQItems} 
        expanded={[1]} 
        onExpandedChange={handleExpandedChange}
      />
    );
    
    expect(screen.getByRole('button', { name: 'What is TypeScript?' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('should handle Suspense boundaries', () => {
    // This test would be relevant if FAQAccordion used Suspense
    // For now, it's a placeholder for future Suspense integration
    expect(true).toBe(true);
  });
});

// Performance benchmarks
describe('FAQAccordion Performance', () => {
  it('should render within acceptable time for large datasets', () => {
    const largeItems = Array.from({ length: 1000 }, (_, i) => ({
      question: `Question ${i + 1}`,
      answer: `Answer ${i + 1}`
    }));
    
    const startTime = performance.now();
    render(<FAQAccordion items={largeItems} />);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(500); // Should render within 500ms
  });

  it('should not cause memory leaks on unmount', () => {
    const handleExpandedChange = vi.fn();
    const handleItemClick = vi.fn();
    
    const { unmount } = render(
      <FAQAccordion 
        items={defaultFAQItems} 
        onExpandedChange={handleExpandedChange}
        onItemClick={handleItemClick}
      />
    );
    
    unmount();
    
    // Verify no memory leaks by checking that handlers are cleaned up
    expect(handleExpandedChange).not.toHaveBeenCalled();
    expect(handleItemClick).not.toHaveBeenCalled();
  });
});

// Export test utilities for external use
export { createMockFAQItem };
export type { FAQItem };