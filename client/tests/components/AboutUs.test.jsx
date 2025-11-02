import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react';
import AboutUs from '../../src/components/AboutUs';

// Run test
// npm run test -- ./tests/components/AboutUs.test.jsx

// Create a mock implementation for AboutUsPartition that renders
// a simple container showing the title and number of items it received.
// This lets tests assert that AboutUs passed correct props.
vi.mock('../../src/components/AboutUsPartition', () => {
    return {
        __esModule: true,
        default: ({ title, contentArray, extraSetting, padding, customClass }) => {
            return (
                <div data-testid="mock-partition" data-title={title} data-count={contentArray?.length ?? 0}
                    data-extra={extraSetting} data-padding={padding} data-class={customClass}>
                    <h3>{title}</h3>
                </div>
            )
        }
    }
})

describe('AboutUs component', () => {
    beforeEach(() => {
        // Clear DOM between tests
        document.body.innerHTML = ''
        vi.clearAllMocks()
    })

    it('renders the page heading and intro content', () => {
        render(<AboutUs />)

        // main page heading
        expect(screen.getByRole('heading', { name: /About Us/i })).toBeInTheDocument()

        // subheading text from the intro
        expect(screen.getByText(/Empowering Sustainable Solutions/i)).toBeInTheDocument()

        // main image (chairs.png) should be in the document with correct src
        const mainImg = screen.getByAltText('')
        expect(mainImg).toBeInTheDocument()
        expect(mainImg).toHaveAttribute('src', '/chairs.png')
    })

    it('renders three AboutUsPartition instances with expected titles and counts', () => {
        render(<AboutUs />)

        // There are three partitions (Mission & Vision, Our Core Values, Meet Our Team)
        const partitions = screen.getAllByTestId('mock-partition')
        expect(partitions).toHaveLength(3)

        // Verify each partition title and the number of items passed
        const titles = partitions.map(p => p.getAttribute('data-title'))
        expect(titles).toEqual(
            expect.arrayContaining([
                'Mission & Vision',
                'Our Core Values',
                'Who We Serve'

            ])
        )

        // Check content counts:
        // Mission & Vision -> 2 items
        // Our Core Values -> 3 items
        // Meet Our Team -> 3 items
        const counts = partitions.reduce((acc, p) => {
            acc[p.getAttribute('data-title')] = Number(p.getAttribute('data-count'))
            return acc
        }, {})

        expect(counts['Mission & Vision']).toBe(2)
        expect(counts['Our Core Values']).toBe(4)
        expect(counts['Who We Serve']).toBe(4)

        // Example: check that the core values partition received the extraSetting row-cols-lg-3
        const corePartition = partitions.find(p => p.getAttribute('data-title') === 'Our Core Values')
        expect(corePartition).toHaveAttribute('data-extra', 'row-cols-lg-4')
    })
})
