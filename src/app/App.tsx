import { AppProvider } from './AppProvider'
import { AppRouter } from './AppRouter'

export function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  )
}
