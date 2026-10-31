import { NavLink, Outlet } from 'react-router'
import { paths } from '../../config/paths'
import { useFocusOnRouteChange } from '../../hooks/useFocusOnRouteChange'

const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
    isActive ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'
  }`

export function MainLayout() {
  const mainRef = useFocusOnRouteChange<HTMLElement>()

  return (
    <div className="mx-auto max-w-xl p-8 font-sans">
      <nav aria-label="Main" className="mb-8 flex gap-2">
        <NavLink to={paths.home.getHref()} end className={navLinkClasses}>
          Home
        </NavLink>
        <NavLink to={paths.users.getHref()} className={navLinkClasses}>
          Users
        </NavLink>
      </nav>
      <main ref={mainRef} className="space-y-6">
        <Outlet />
      </main>
    </div>
  )
}
