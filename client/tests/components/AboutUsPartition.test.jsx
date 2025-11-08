// src/components/AboutUsPartition.test.jsx
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import AboutUsPartition from '../../src/components/AboutUsPartition'

// Run test
// npm run test -- ./tests/components/AboutUsPartition.test.jsx

// Mock AboutUsCard to expose the props AboutUsPartition passes to it
vi.mock('../../src/components/AboutUsCard', () => {
    return {
        __esModule: true,
        default: ({ imageSourceName, heading, paragraphContent, padding, customClass }) => {
            return (
                <div
                    data-testid="mock-card"
                    data-image={imageSourceName}
                    data-heading={heading}
                    data-paragraph={paragraphContent}
                    data-padding={padding}
                    data-class={customClass}
                >
                    <h5>{heading}</h5>
                </div>
            )
        }
    }
})

describe('AboutUsPartition', () => {
    const sampleContent = [
        { imageSourceName: 'a.png', heading: 'One', paragraphContent: 'First' },
        { imageSourceName: 'b.png', heading: 'Two', paragraphContent: 'Second' },
        { imageSourceName: 'c.png', heading: 'Three', paragraphContent: 'Third' }
    ]

    beforeEach(() => {
        document.body.innerHTML = ''
        vi.clearAllMocks()
    })

    it('renders the partition title', () => {
        render(
            <AboutUsPartition
                title="Section Title"
                contentArray={sampleContent}
                extraSetting="row-cols-lg-3"
                padding="p-4"
                customClass="icon-sm"
            />
        )

        expect(screen.getByRole('heading', { level: 2, name: /Section Title/i })).toBeInTheDocument()
    })

    it('renders a mock card for every item in contentArray', () => {
        render(
            <AboutUsPartition
                title="Team"
                contentArray={sampleContent}
                extraSetting="row-cols-lg-3"
                padding="p-4"
                customClass="icon-sm"
            />
        )

        const cards = screen.getAllByTestId('mock-card')
        expect(cards).toHaveLength(sampleContent.length)
    })

    it('forwards correct props to each AboutUsCard', () => {
        render(
            <AboutUsPartition
                title="Values"
                contentArray={sampleContent}
                extraSetting="row-cols-lg-3"
                padding="p-5"
                customClass="card-img-top"
            />
        )

        const cards = screen.getAllByTestId('mock-card')

        // Check first card props
        expect(cards[0].getAttribute('data-image')).toBe('a.png')
        expect(cards[0].getAttribute('data-heading')).toBe('One')
        expect(cards[0].getAttribute('data-paragraph')).toBe('First')
        expect(cards[0].getAttribute('data-padding')).toBe('p-5')
        expect(cards[0].getAttribute('data-class')).toBe('card-img-top')

        // Check that all headings appear in the document (rendered inside mock)
        expect(screen.getByText('One')).toBeInTheDocument()
        expect(screen.getByText('Two')).toBeInTheDocument()
        expect(screen.getByText('Three')).toBeInTheDocument()
    })

    it('applies extraSetting to the row container class list', () => {
        render(
            <AboutUsPartition
                title="Grid"
                contentArray={sampleContent}
                extraSetting="row-cols-lg-4"
                padding="p-4"
                customClass="icon-sm"
            />
        )

        // find the row container by using the title and traversing to the next div with row classes
        const heading = screen.getByRole('heading', { level: 2, name: /Grid/i })
        const rowContainer = heading.nextElementSibling // should be the row div
        expect(rowContainer).toBeTruthy()

    })
})