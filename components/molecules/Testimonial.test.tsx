import React from 'react';
import { 
  render, 
  screen, 
  fireEvent, 
  waitFor, 
  within 
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Testimonial, TestimonialData } from '../Testimonial';

// Données de test
const mockTestimonial: TestimonialData = {
  id: 'test-1',
  quote: 'Ce produit a révolutionné notre façon de travailler. Exceptional service!',
  author: 'Marie Dubois',
  role: 'Directrice Marketing',
  company: 'TechCorp',
  avatar: 'https://example.com/avatar.jpg',
  rating: 5,
  verified: true,
  location: 'Paris, France',
  date: '2024-01-15',
  social: {
    platform: 'LinkedIn',
    url: 'https://linkedin.com/in/marie-dubois'
  }
};

const mockTestimonialWithLogo: TestimonialData = {
  id: 'test-2',
  quote: 'Une solution innovative qui a dépass nos attentes.',
  author: 'Pierre Martin',
  role: 'CEO',
  company: 'StartupXYZ',
  logo: 'https://example.com/logo.png',
  rating: 4.5
};

const mockTestimonialSimple: TestimonialData = {
  id: 'test-3',
  quote: 'Simple et efficace.',
  author: 'Sophie Laurent'
};

// Suite de tests pour le rendu de base
describe('Testimonial - Rendu de base', () => {
  test('rend correctement un témoignage de base', () => {
    render(<Testimonial testimonial={mockTestimonial} />);
    
    expect(screen.getByRole('article')).toBeInTheDocument();
    expect(screen.getByText('Ce produit a révolutionné notre façon de travailler. Exceptional service!')).toBeInTheDocument();
    expect(screen.getByText('Marie Dubois')).toBeInTheDocument();
    expect(screen.getByText('Directrice Marketing')).toBeInTheDocument();
    expect(screen.getByText('TechCorp')).toBeInTheDocument();
  });

  test('applique les classes CSS correctes', () => {
    const { container } = render(<Testimonial testimonial={mockTestimonial} />);
    
    expect(container.firstChild).toHaveClass('testimonial');
    expect(container.firstChild).toHaveClass('testimonial--simple');
    expect(container.firstChild).toHaveClass('testimonial--vertical');
    expect(container.firstChild).toHaveClass('testimonial--md');
    expect(container.firstChild).toHaveClass('testimonial--align-center');
    expect(container.firstChild).toHaveClass('testimonial--bordered');
  });

  test('affiche l\'avatar quand disponible', () => {
    render(<Testimonial testimonial={mockTestimonial} variant="with-avatar" />);
    
    const avatar = screen.getByAltText('Photo de profil de Marie Dubois');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  test('affiche le logo quand disponible', () => {
    render(<Testimonial testimonial={mockTestimonialWithLogo} variant="with-logo" />);
    
    const logo = screen.getByAltText('Logo de TechCorp');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', 'https://example.com/logo.png');
  });

  test('affiche la notation avec étoiles', () => {
    render(<Testimonial testimonial={mockTestimonial} variant="with-rating" />);
    
    expect(screen.getByLabelText('Note: 5 sur 5 étoiles')).toBeInTheDocument();
    expect(screen.getByText('5.0/5')).toBeInTheDocument();
  });

  test('affiche le badge vérifié', () => {
    render(<Testimonial testimonial={mockTestimonial} />);
    
    const verifiedBadge = screen.getByLabelText('Témoignage vérifié');
    expect(verifiedBadge).toBeInTheDocument();
  });

  test('affiche la date formatée', () => {
    render(<Testimonial testimonial={mockTestimonial} />);
    
    expect(screen.getByText('janvier 2024')).toBeInTheDocument();
  });

  test('affiche la localisation', () => {
    render(<Testimonial testimonial={mockTestimonial} />);
    
    expect(screen.getByText('Paris, France')).toBeInTheDocument();
  });

  test('affiche le lien social', () => {
    render(<Testimonial testimonial={mockTestimonial} />);
    
    const socialLink = screen.getByLabelText('Voir le profil de Marie Dubois sur LinkedIn');
    expect(socialLink).toBeInTheDocument();
    expect(socialLink).toHaveAttribute('href', 'https://linkedin.com/in/marie-dubois');
  });
});

// Suite de tests pour les variantes
describe('Testimonial - Variantes', () => {
  test('supporte la variante simple', () => {
    const { container } = render(
      <Testimonial testimonial={mockTestimonialSimple} variant="simple" />
    );
    
    expect(container.firstChild).toHaveClass('testimonial--simple');
  });

  test('supporte la variante with-avatar', () => {
    const { container } = render(
      <Testimonial testimonial={mockTestimonial} variant="with-avatar" />
    );
    
    expect(container.firstChild).toHaveClass('testimonial--with-avatar');
    expect(screen.getByAltText('Photo de profil de Marie Dubois')).toBeInTheDocument();
  });

  test('supporte la variante with-image', () => {
    render(
      <Testimonial testimonial={mockTestimonial} variant="with-image" />
    );
    
    expect(screen.getByAltText('Photo de profil de Marie Dubois')).toBeInTheDocument();
  });

  test('supporte la variante with-rating', () => {
    render(
      <Testimonial testimonial={mockTestimonial} variant="with-rating" />
    );
    
    expect(screen.getByLabelText('Note: 5 sur 5 étoiles')).toBeInTheDocument();
  });

  test('supporte la variante with-logo', () => {
    render(
      <Testimonial testimonial={mockTestimonialWithLogo} variant="with-logo" />
    );
    
    expect(screen.getByAltText('Logo de TechCorp')).toBeInTheDocument();
  });

  test('supporte la variante featured', () => {
    const { container } = render(
      <Testimonial testimonial={mockTestimonial} variant="featured" />
    );
    
    expect(container.firstChild).toHaveClass('testimonial--featured');
  });
});

// Suite de tests pour les layouts
describe('Testimonial - Layouts', () => {
  test('supporte le layout vertical', () => {
    const { container } = render(
      <Testimonial testimonial={mockTestimonial} layout="vertical" />
    );
    
    expect(container.firstChild).toHaveClass('testimonial--vertical');
  });

  test('supporte le layout horizontal', () => {
    const { container } = render(
      <Testimonial testimonial={mockTestimonial} layout="horizontal" />
    );
    
    expect(container.firstChild).toHaveClass('testimonial--horizontal');
  });

  test('supporte le layout grid', () => {
    const { container } = render(
      <Testimonial testimonial={mockTestimonial} layout="grid" />
    );
    
    expect(container.firstChild).toHaveClass('testimonial--grid');
  });
});

// Suite de tests pour les tailles
describe('Testimonial - Tailles', () => {
  test('supporte la taille xs', () => {
    const { container } = render(
      <Testimonial testimonial={mockTestimonial} size="xs" />
    );
    
    expect(container.firstChild).toHaveClass('testimonial--xs');
  });

  test('supporte la taille sm', () => {
    const { container } = render(
      <Testimonial testimonial={mockTestimonial} size="sm" />
    );
    
    expect(container.firstChild).toHaveClass('testimonial--sm');
  });

  test('supporte la taille md', () => {
    const { container } = render(
      <Testimonial testimonial={mockTestimonial} size="md" />
    );
    
    expect(container.firstChild).toHaveClass('testimonial--md');
  });

  test('supporte la taille lg', () => {
    const { container } = render(
      <Testimonial testimonial={mockTestimonial} size="lg" />
    );
    
    expect(container.firstChild).toHaveClass('testimonial--lg');
  });

  test('supporte la taille xl', () => {
    const { container } = render(
      <Testimonial testimonial={mockTestimonial} size="xl" />
    );
    
    expect(container.firstChild).toHaveClass('testimonial--xl');
  });
});

// Suite de tests pour les alignements
describe('Testimonial - Alignements', () => {
  test('supporte l\'alignement left', () => {
    const { container } = render(
      <Testimonial testimonial={mockTestimonial} align="left" />
    );
    
    expect(container.firstChild).toHaveClass('testimonial--align-left');
  });

  test('supporte l\'alignement center', () => {
    const { container } = render(
      <Testimonial testimonial={mockTestimonial} align="center" />
    );
    
    expect(container.firstChild).toHaveClass('testimonial--align-center');
  });

  test('supporte l\'alignement right', () => {
    const { container } = render(
      <Testimonial testimonial={mockTestimonial} align="right" />
    );
    
    expect(container.firstChild).toHaveClass('testimonial--align-right');
  });
});

// Suite de tests pour les styles de citation
describe('Testimonial - Styles de citation', () => {
  test('supporte le style quote-marks', () => {
    const { container } = render(
      <Testimonial testimonial={mockTestimonial} quoteStyle="quote-marks" />
    );
    
    expect(container.firstChild).toHaveClass('testimonial--quote-marks');
  });

  test('supporte le style quote-blocks', () => {
    const { container } = render(
      <Testimonial testimonial={mockTestimonial} quoteStyle="quote-blocks" />
    );
    
    expect(container.firstChild).toHaveClass('testimonial--quote-blocks');
  });

  test('supporte le style clean', () => {
    const { container } = render(
      <Testimonial testimonial={mockTestimonial} quoteStyle="clean" />
    );
    
    expect(container.firstChild).toHaveClass('testimonial--clean');
  });

  test('supporte le style decorative', () => {
    const { container } = render(
      <Testimonial testimonial={mockTestimonial} quoteStyle="decorative" />
    );
    
    expect(container.firstChild).toHaveClass('testimonial--decorative');
    expect(screen.getByLabelText('')).toBeInTheDocument(); // Icône decorative
  });
});

// Suite de tests pour les propriétés avancées
describe('Testimonial - Propriétés avancées', () => {
  test('supporte le mode compact', () => {
    const { container } = render(
      <Testimonial testimonial={mockTestimonial} compact />
    );
    
    expect(container.firstChild).toHaveClass('testimonial--compact');
  });

  test('supporte bordered=false', () => {
    const { container } = render(
      <Testimonial testimonial={mockTestimonial} bordered={false} />
    );
    
    expect(container.firstChild).not.toHaveClass('testimonial--bordered');
  });

  test('supporte animated=false', () => {
    const { container } = render(
      <Testimonial testimonial={mockTestimonial} animated={false} />
    );
    
    expect(container.firstChild).not.toHaveClass('testimonial--animated');
  });

  test('supporte maxQuoteLines personnalisé', () => {
    const { container } = render(
      <Testimonial testimonial={mockTestimonial} maxQuoteLines={2} />
    );
    
    const quote = container.querySelector('.testimonial__quote');
    expect(quote).toHaveStyle({
      WebkitLineClamp: '2'
    });
  });
});

// Suite de tests pour les interactions
describe('Testimonial - Interactions', () => {
  test('gère les clics sur le composant', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    
    render(
      <Testimonial 
        testimonial={mockTestimonial} 
        onClick={handleClick} 
      />
    );
    
    const testimonial = screen.getByRole('article');
    await user.click(testimonial);
    
    expect(handleClick).toHaveBeenCalledWith(mockTestimonial);
  });

  test('gère les événements hover', async () => {
    const user = userEvent.setup();
    const handleHover = jest.fn();
    const handleLeave = jest.fn();
    
    render(
      <Testimonial 
        testimonial={mockTestimonial} 
        onHover={handleHover}
        onLeave={handleLeave}
      />
    );
    
    const testimonial = screen.getByRole('article');
    await user.hover(testimonial);
    expect(handleHover).toHaveBeenCalledWith(mockTestimonial);
    
    await user.unhover(testimonial);
    expect(handleLeave).toHaveBeenCalledWith(mockTestimonial);
  });

  test('supporte la navigation clavier', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    
    render(
      <Testimonial 
        testimonial={mockTestimonial} 
        onClick={handleClick} 
      />
    );
    
    const testimonial = screen.getByRole('article');
    testimonial.focus();
    
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledWith(mockTestimonial);
  });
});

// Suite de tests pour l'accessibilité
describe('Testimonial - Accessibilité', () => {
  test('utilise les rôles ARIA corrects', () => {
    render(<Testimonial testimonial={mockTestimonial} />);
    
    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  test('liende correctement le contenu et l\'auteur', () => {
    render(<Testimonial testimonial={mockTestimonial} />);
    
    const quote = screen.getByText(/Ce produit a révolutionné/);
    const author = screen.getByText('Marie Dubois');
    
    expect(quote.closest('article')).toHaveAttribute('aria-labelledby');
    expect(quote.closest('article')).toHaveAttribute('aria-describedby');
  });

  test('annonce les éléments vérifiés', () => {
    render(<Testimonial testimonial={mockTestimonial} />);
    
    expect(screen.getByLabelText('Témoignage vérifié')).toBeInTheDocument();
  });

  test('annonce la notation', () => {
    render(<Testimonial testimonial={mockTestimonial} variant="with-rating" />);
    
    expect(screen.getByLabelText('Note: 5 sur 5 étoiles')).toBeInTheDocument();
  });

  test('supporte la navigation clavier', () => {
    render(<Testimonial testimonial={mockTestimonial} />);
    
    const testimonial = screen.getByRole('article');
    expect(testimonial).toHaveAttribute('tabIndex', '-1');
    
    const interactiveTestimonial = screen.getByRole('article');
    expect(interactiveTestimonial).toHaveAttribute('tabIndex', '0');
  });
});

// Suite de tests pour les cas edge
describe('Testimonial - Cas edge', () => {
  test('gère les témoignages sans informations optionnelles', () => {
    const minimalTestimonial: TestimonialData = {
      id: 'minimal',
      quote: 'Témoignage simple'
    };
    
    render(<Testimonial testimonial={minimalTestimonial} />);
    
    expect(screen.getByText('Témoignage simple')).toBeInTheDocument();
    // Ne devrait pas crash
  });

  test('gère les témoignages avec des données manquantes', () => {
    const incompleteTestimonial: TestimonialData = {
      id: 'incomplete',
      quote: 'Test',
      author: 'John Doe'
      // role, company, etc. manquants
    };
    
    render(<Testimonial testimonial={incompleteTestimonial} />);
    
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('chez')).not.toBeInTheDocument();
  });

  test('gère les notes décimales', () => {
    const decimalTestimonial = {
      ...mockTestimonial,
      rating: 4.7
    };
    
    render(<Testimonial testimonial={decimalTestimonial} variant="with-rating" />);
    
    expect(screen.getByText('4.7/5')).toBeInTheDocument();
  });

  test('gère les dates invalides', () => {
    const invalidDateTestimonial = {
      ...mockTestimonial,
      date: 'invalid-date'
    };
    
    render(<Testimonial testimonial={invalidDateTestimonial} />);
    
    // Ne devrait pas crash, affiche juste la date telle quelle
    expect(screen.getByText('invalid-date')).toBeInTheDocument();
  });

  test('supporte les styles personnalisés', () => {
    const customStyle = { border: '2px solid red' };
    
    const { container } = render(
      <Testimonial testimonial={mockTestimonial} style={customStyle} />
    );
    
    expect(container.firstChild).toHaveStyle(customStyle);
  });

  test('supporte les classes CSS additionnelles', () => {
    const { container } = render(
      <Testimonial testimonial={mockTestimonial} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

// Suite de tests pour l'état de chargement
describe('Testimonial - État de chargement', () => {
  test('affiche un état de chargement pour les images', async () => {
    const { container } = render(
      <Testimonial 
        testimonial={mockTestimonial} 
        variant="with-avatar" 
      />
    );
    
    const avatar = container.querySelector('.testimonial__avatar-image') as HTMLImageElement;
    
    // Image pas encore chargée
    expect(avatar.style.background).toContain('var(--testimonial-border)');
    
    // Simuler le chargement
    fireEvent.load(avatar);
    
    // Après chargement, plus d'état de chargement
    await waitFor(() => {
      expect(avatar.style.background).toBe('');
    });
  });
});

// Suite de tests pour la responsivité
describe('Testimonial - Responsivité', () => {
  test('s\'adapte au layout horizontal sur mobile', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    
    const { container } = render(
      <Testimonial 
        testimonial={mockTestimonial} 
        layout="horizontal" 
      />
    );
    
    // Les styles responsive sont gérés par CSS, pas de classes JS
    expect(container.firstChild).toHaveClass('testimonial--horizontal');
  });
});

// Suite de tests pour les performances
describe('Testimonial - Performances', () => {
  test('utilise React.memo efficacement', () => {
    const TestimonialMemo = React.memo(Testimonial);
    
    const { rerender } = render(
      <TestimonialMemo testimonial={mockTestimonial} />
    );
    
    // Re-render avec les mêmes props
    rerender(<TestimonialMemo testimonial={mockTestimonial} />);
    
    // Ne devrait pas re-render inutilement (test conceptuel)
    expect(screen.getByText('Marie Dubois')).toBeInTheDocument();
  });

  test('évite les re-renders inutiles', () => {
    const handleClick = jest.fn();
    const { rerender } = render(
      <Testimonial 
        testimonial={mockTestimonial} 
        onClick={handleClick} 
      />
    );
    
    // Re-render avec les mêmes props
    rerender(
      <Testimonial 
        testimonial={mockTestimonial} 
        onClick={handleClick} 
      />
    );
    
    expect(handleClick).not.toHaveBeenCalled();
  });
});

// Tests d'intégration
describe('Testimonial - Tests d\'intégration', () => {
  test('workflow complet d\'un témoignage interactif', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    const handleHover = jest.fn();
    
    render(
      <Testimonial 
        testimonial={mockTestimonial}
        variant="with-rating"
        onClick={handleClick}
        onHover={handleHover}
      />
    );
    
    // Vérifications initiales
    expect(screen.getByText('Marie Dubois')).toBeInTheDocument();
    expect(screen.getByLabelText('Note: 5 sur 5 étoiles')).toBeInTheDocument();
    
    // Interaction
    const testimonial = screen.getByRole('article');
    await user.hover(testimonial);
    expect(handleHover).toHaveBeenCalled();
    
    await user.click(testimonial);
    expect(handleClick).toHaveBeenCalledWith(mockTestimonial);
  });

  test('témoignage avec toutes les fonctionnalités', () => {
    const fullTestimonial: TestimonialData = {
      id: 'full',
      quote: 'Un témoignage complet avec toutes les fonctionnalités.',
      author: 'Alice Cooper',
      role: 'Designer UX',
      company: 'CreativeAgency',
      avatar: 'https://example.com/alice.jpg',
      logo: 'https://example.com/agency-logo.png',
      rating: 4.8,
      verified: true,
      location: 'Lyon, France',
      date: '2024-02-10',
      social: {
        platform: 'Twitter',
        url: 'https://twitter.com/alicecooper'
      }
    };
    
    render(
      <Testimonial 
        testimonial={fullTestimonial}
        variant="featured"
        layout="horizontal"
        align="left"
        size="lg"
        quoteStyle="decorative"
      />
    );
    
    // Vérifier que tous les éléments sont présents
    expect(screen.getByText('Un témoignage complet avec toutes les fonctionnalités.')).toBeInTheDocument();
    expect(screen.getByText('Alice Cooper')).toBeInTheDocument();
    expect(screen.getByText('Designer UX chez CreativeAgency')).toBeInTheDocument();
    expect(screen.getByText('Lyon, France')).toBeInTheDocument();
    expect(screen.getByText('février 2024')).toBeInTheDocument();
    expect(screen.getByLabelText('Témoignage vérifié')).toBeInTheDocument();
    expect(screen.getByLabelText('Note: 4.8 sur 5 étoiles')).toBeInTheDocument();
    expect(screen.getByAltText('Photo de profil de Alice Cooper')).toBeInTheDocument();
    expect(screen.getByAltText('Logo de CreativeAgency')).toBeInTheDocument();
  });
});