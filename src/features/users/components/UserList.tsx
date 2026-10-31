import { useUsers } from '../../../api/users/get-users'

export function UserList() {
  const { data: users, isPending, isError } = useUsers()

  if (isError) {
    return <p role="alert">Couldn't load users.</p>
  }

  let status = ''
  if (isPending) {
    status = 'Loading users…'
  } else if (users.length === 0) {
    status = 'No users yet.'
  }

  return (
    <div>
      {/* Stays mounted so screen readers announce the loading and empty states. */}
      <p role="status">{status}</p>
      {!isPending && users.length > 0 && (
        <ul
          aria-label="Users"
          className="divide-y divide-gray-200 rounded-md border border-gray-200"
        >
          {users.map((user) => (
            <li key={user.id} className="px-4 py-2">
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
