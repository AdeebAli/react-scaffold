import { Link } from 'react-router'
import { PageTitle } from '../../components/layouts/PageTitle'
import { paths } from '../../config/paths'

export function NotFoundRoute() {
  return (
    <>
      <PageTitle title="Page not found" />
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p>
        <Link
          to={paths.home.getHref()}
          className="text-blue-700 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Go home
        </Link>
      </p>
    </>
  )
}
