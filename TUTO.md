src = https://youtu.be/QTZTUrAbjeo?si=UcYkU0rLvTisXAjq

# Intro

Combining **Zustand** and **TanStack Query** is a common and **recommended** practice, as each solves a different **state management** need in **React** apps: 
- Zustand is ideal for global client-side management state
- TanStack Query excels at synchronizing and caching server data

Most modern apps benefit from using TanStack Query for server state and Zustand for client state, maintaining clear "**separation of concerns**".  

---

# Project Setup

- run `npm create vite@latest` to initialize a React/TypeScript project with Vite
- run `npm i` to install all required dependencies
- run `npm i @tanstack/react-query` to install TanStack Query
- run `npm i zustand` to install Zustand
- run `npm run dev` to start the development server

---

# Starter files

## Setting up the query client in `main.tsx`

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
```

## Implementing a `getUsers` function ins /src/api/user.ts

```tsx
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
```

The type `User` is declared in `/src/types/user.ts`

## Implementing the App component

```tsx
import { useQuery } from '@tanstack/react-query'
import { getUsers } from './api/user'
import './App.css'

export default function App() {
  const { data } = useQuery({
    queryKey:['users'], 
    queryFn: () => getUsers(), // expects parameters (optional filters), hence the anonymous function 
  })

  return (
    <div className="user-list-container">
      {data?.map(user => (
        <div key={user.id} className="user-item">{user.name}</div>
      ))}
    </div>
  )
}
```

Now we have TanStack Query, and we're simulating data fetching with the `getUsers` function.  
But how to add Zustand into the mix?

---

# Adding Zustand into the mix the WRONG way

In the `/src/states` folder, we create a `userStore.ts` file.  
We're going to create all of our Zustand states for our users inside this store.  

Since we're using TypeScript, we need to start by defining the type of our store.

## Defining the type of our store

In `userStore.ts`:
```ts
import type { User } from '../types/user'

type UserStore = {
  users: User[];
  setUsers: (users: User[]) => void;
}
```

## Implementing our store

In `userStore.ts`:
```tsx
import type { User } from '../types/user'
import { create } from 'zustand'

type UserStore = {
  users: User[];
  setUsers: (users: User[]) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  users: [],
  setUsers: (users) => set({ users }),
}))
```

## Using our store in the App component

### Important note

The `onSuccess` callback has been deprecated in TanStack Query for `useQuery`.  
It was removed as an option in the latest major version (v5), along with `onError` and `onSettled`.  
The maintainers recommend handling side effects using React's standard `useEffect` or other state management solutions.  
**However**, `onSuccess` and related callbacks remain supported for `useMutation`.

---

### New version of `App.tsx`

- We need to import `useUserStore` and `useEffect`
- we declare our state: `const { users, setUsers } = useUserStore()`
- we use `useEffect` instead of `onSuccess` to set the `users` state to whatever `data` is returned by `getUsers`
- finally, we replace `data` with `users` in the return statement (`.map(...)`)

```tsx
import { useQuery } from '@tanstack/react-query'
import { getUsers } from './api/user'
import './App.css'
import { useUserStore } from './states/userStore'
import { useEffect } from 'react'

export default function App() {
  const { users, setUsers } = useUserStore()

  const { data } = useQuery({
    queryKey:['users'], 
    queryFn: () => getUsers(), // expects parameters (optional filters), hence the anonymous function 
  })

  useEffect(() => {
    if (data) {
      setUsers(data)
    }
  }, [data])

  return (
    <div className="user-list-container">
      {users?.map(user => (
        <div key={user.id} className="user-item">{user.name}</div>
      ))}
    </div>
  )
}
```

---

# Adding Zustand into the mix the RIGHT way



---
@4/20