import type { User } from '../types/user'

export type GetUsersFilters = {
  limit: number;
  page: number;
}

export async function getUsers(filters?: GetUsersFilters) {
  // Do something cool with the filters
  console.log(`active filters: ${JSON.stringify(filters)}`)

  await new Promise((resolve) => setTimeout(resolve, 1000))
  return [
    { id: 1, name: 'John' }, 
    { id: 2, name: 'Jane' },
    { id: 3, name: 'Bob' },
    { id: 4, name: 'Alice' },
    { id: 5, name: 'Eve' },
    { id: 6, name: 'Roger' },
    { id: 7, name: 'Devon' },
  ] as User[]
}