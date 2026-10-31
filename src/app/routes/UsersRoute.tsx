import { PageTitle } from '../../components/layouts/PageTitle'
import { UserList } from '../../features/users/components/UserList'

export function UsersRoute() {
  return (
    <>
      <PageTitle title="Users" />
      <h1 className="text-3xl font-bold">Users</h1>
      <UserList />
    </>
  )
}
