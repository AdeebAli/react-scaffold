import { render, screen, userEvent } from '../../../../testing/test-utils'
import { Counter } from '../Counter'

describe('Counter', () => {
  it('shows the starting count', () => {
    render(<Counter label="Clicks" initialCount={3} />)

    expect(screen.getByText(/clicks/i)).toHaveTextContent('Clicks: 3')
  })

  it('goes up and down when the user clicks the buttons', async () => {
    const user = userEvent.setup()
    render(<Counter label="Clicks" />)

    await user.click(screen.getByRole('button', { name: 'Increment' }))
    await user.click(screen.getByRole('button', { name: 'Increment' }))
    await user.click(screen.getByRole('button', { name: 'Decrement' }))

    expect(screen.getByRole('status')).toHaveTextContent('Clicks: 1')
  })

  it('returns to the starting count when the user resets it', async () => {
    const user = userEvent.setup()
    render(<Counter label="Clicks" initialCount={5} step={5} />)

    await user.click(screen.getByRole('button', { name: 'Increment' }))
    expect(screen.getByRole('status')).toHaveTextContent('10')

    await user.click(screen.getByRole('button', { name: 'Reset' }))
    expect(screen.getByRole('status')).toHaveTextContent('5')
  })
})
