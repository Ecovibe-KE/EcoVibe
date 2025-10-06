import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ServiceAdminTop from '../../src/components/admin/ServiceAdminTop';

describe('ServiceAdminTop Component', () => {
    const props = {
        imageSource: '/test-icon.png',
        number: 42,
        text: 'Services Available',
        imageSetting: 'primary',
        colSetting: 'col-md-6',
    };

    it('renders without crashing', () => {
        render(<ServiceAdminTop {...props} />);
        expect(screen.getByText('Services Available')).toBeInTheDocument();
    });

    it('renders the correct number', () => {
        render(<ServiceAdminTop {...props} />);
        expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('renders the image with correct src and alt', () => {
        render(<ServiceAdminTop {...props} />);
        const image = screen.getByAltText('service summary icon');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', '/test-icon.png');
    });

    it('applies the correct image class based on imageSetting', () => {
        render(<ServiceAdminTop {...props} />);
        const image = screen.getByAltText('service summary icon');
        expect(image).toHaveClass('bg-primary-subtle');
    });

    it('applies the correct column class based on colSetting', () => {
        const { container } = render(<ServiceAdminTop {...props} />);
        expect(container.firstChild).toHaveClass('col-md-6');
    });
});
