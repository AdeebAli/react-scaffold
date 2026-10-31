import type { Meta, StoryObj } from '@storybook/react-vite'
import { Counter } from '../Counter'

const meta = {
  title: 'Features/Counter',
  component: Counter,
  args: {
    label: 'Clicks',
  },
} satisfies Meta<typeof Counter>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const CustomStart: Story = {
  args: {
    initialCount: 10,
    step: 5,
  },
}
