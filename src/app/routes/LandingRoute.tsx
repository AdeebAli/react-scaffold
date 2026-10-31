import { PageTitle } from '../../components/layouts/PageTitle'
import { Counter } from '../../features/counter/components/Counter'

export function LandingRoute() {
  return (
    <>
      <PageTitle />
      <h1 className="text-3xl font-bold">React Scaffold</h1>
      <Counter label="Clicks" />
    </>
  )
}
