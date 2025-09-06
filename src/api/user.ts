import type { User } from '../types/user'

type GetUsersFilters = {
  limit: number;
  page: number;
}

export async function getUsers(filters?: GetUsersFilters) {
  // Do something cool with the filters
  console.log(`active filters: ${JSON.stringify(filters)}`)

  await new Promise((resolve) => setTimeout(resolve, 1000))
  return [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }] as User[]
}