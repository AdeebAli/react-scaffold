import { Link } from 'react-router'
import { PageTitle } from '../../components/layouts/PageTitle'
import { paths } from '../../config/paths'

const actionClasses =
  'rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'

// Not lazy-loaded: it must render even when a page's chunk fails to load,
// e.g. after a deploy removes the chunk an open tab still points to.
export function ErrorRoute() {
  return (
    <div className="space-y-4">
      <PageTitle title="Something went wrong" />
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p role="alert">
        This page couldn't be shown. Reloading usually fixes it, especially
        after an update.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          className={actionClasses}
          onClick={() => window.location.reload()}
        >
          Reload
        </button>
        <Link to={paths.home.getHref()} className={actionClasses}>
          Go home
        </Link>
      </div>
    </div>
  )
}
