import { useState } from 'react'

export type CounterProps = {
  label: string
  initialCount?: number
  step?: number
}

const buttonClasses =
  'rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'

export function Counter({ label, initialCount = 0, step = 1 }: CounterProps) {
  const [count, setCount] = useState(initialCount)

  return (
    <div className="space-y-3">
      {/* The label is inside <output> so screen readers announce "Clicks: 3", not just "3". */}
      <output className="block text-lg">
        {label}: <span className="font-semibold tabular-nums">{count}</span>
      </output>
      <div className="flex gap-2">
        <button
          type="button"
          className={buttonClasses}
          onClick={() => setCount((c) => c - step)}
        >
          Decrement
        </button>
        <button
          type="button"
          className={buttonClasses}
          onClick={() => setCount((c) => c + step)}
        >
          Increment
        </button>
        <button
          type="button"
          className={buttonClasses}
          onClick={() => setCount(initialCount)}
        >
          Reset
        </button>
      </div>
    </div>
  )
}
