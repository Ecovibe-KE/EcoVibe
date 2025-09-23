// src/components/AboutUsCard.test.jsx
import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import AboutUsCard from '../../src/components/AboutUsCard'

// Run test
// npm run test -- ./tests/components/AboutUsCard.test.jsx

describe('AboutUsCard', () => {
    it('renders image heading and paragraph from props', () => {
        render(
            <AboutUsCard
                imageSourceName="Target.png"
                heading="Innovation"
                paragraphContent="We innovate constantly."
                padding="p-4"
                customClass="icon-sm mx-auto"
            />
        )

        // image rendered with correct src and alt
        const img = screen.getByAltText('target icon')
        expect(img).toBeInTheDocument()
        expect(img).toHaveAttribute('src', '/Target.png')
        expect(img).toHaveClass('icon-sm', 'mx-auto')

        // heading and paragraph text
        expect(screen.getByText('Innovation')).toBeInTheDocument()
        expect(screen.getByText('We innovate constantly.')).toBeInTheDocument()
    })

    it('applies card padding class to card element', () => {
        render(
            <AboutUsCard
                imageSourceName="ceo.png"
                heading="CEO"
                paragraphContent="Leader"
                padding="p-3"
                customClass="card-img-top"
            />
        )

        // the card element should include the padding class passed via props
        const card = screen.getByText('CEO').closest('.card')
        expect(card).toBeTruthy()
        expect(card).toHaveClass('p-3')
    })
})