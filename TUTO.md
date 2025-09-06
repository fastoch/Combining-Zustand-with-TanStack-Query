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
- finally, we replace `data` with `users` in the return statement (`.map(...)`) since `data` data is now into `users`
- we can remove the question mark from `users.map` because `users` cannot be undefined

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
      {users.map(user => (
        <div key={user.id} className="user-item">{user.name}</div>
      ))}
    </div>
  )
}
```

We have now successfully connected TanStack Query to Zustand through a `useEffect` hook.  
And we're using the actual values from the Zustand store (`useUserStore`) to render our UI. 

---

## Why is this the wrong way of combining Zustand and TanStack Query?

Although what we've done is working fine, it's actually inefficient, because we've duplicated a lot of code
and we've added unnecessary complexity to our app.  

First of all, our array of users is stored in 2 places: in `users` and in `data`.  
But TanStack Query is not just a data fetching library, it's an "**asynchronous state management solution**".  

Every time that the query function `queryFn: () => getUsers()` is called, whatever it returns will be 
stored in the TanStack query **cache**. So if we try to access it from another component, it will return 
the cached version instead of making a **fetch** from scratch once again.  

In the way we've done things, we've just added complexity for no reason, and we could have achieved the same 
result without ever using Zustand.

---

# Adding Zustand into the mix the RIGHT way

## Server state vs. Client state

TanStack Query is a **server** state management solution, while Zustand is a **client** state management solution.  
- "Client" means **frontend**, that's the Web browser where our React app is running
- "Server" means **backend**, the part that communicates with the database  

In our case, the backend data is provided by the `/src/api/user.ts` file.  
It's giving the users data to the App component.  

What we've done so far is putting server state (what the query returns) inside Zustand, which is why it's thew wrong way.  

## What is client state in our case?

Currently, we don't have any client state, only server state provided by `useQuery`.  
The thing that wil provide client state is our `filters` parameter that is passed to `getUsers`.  
The state of those filters (`limit` and `page`) lives on the client, this is the only client state that we have.  

So the right choice here is to use Zustand for those filters, and let TanStack Query handle the server state 
(the `users` data that is returned from our fake API).  

## Updating our userStore

Let's update that store to make use of client state instead of server state.  

- first, we need to remove everything that has to do with `users`
- then, in `/src/api/user.ts`, we need to export `GetUsersFilters` so we can use it in `userStore.ts`

Here's how our userStore looks like now:
```ts
import { create } from 'zustand'
import type { GetUsersFilters } from '../api/user'

type UserStore = {
  filters?: GetUsersFilters;
  setFilters: (filters?: GetUsersFilters) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  filters: undefined,
  setFilters: (filters) => set({ filters }),
}))
```

## Updating the App component

- we can remove the `useEffect`

Here's the new version of `App.tsx`:
```tsx
import { useQuery } from '@tanstack/react-query'
import { getUsers } from './api/user'
import './App.css'
import { useUserStore } from './states/userStore'

export default function App() {
  // ZUSTAND part
  const { filters } = useUserStore()

  // TANSTACK QUERY part
  const { data } = useQuery({
    queryKey:['users', filters], 
    queryFn: () => getUsers(filters), 
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

## Conclusion

And now we have combined TanStack Query with Zustand in an efficient way, using both libraries 
for what they're good at instead of having them overlap with each other.  

We've used **Zustand** for managing the state of `filters` on the client-side.  
Those filters will only live on the client, which will be able to update the filters by setting the page or the limit.  

When the filters state changes, their new state is going to be sent over to **TanStack** Query.  
And then, **TanStack** Query is going to use the new filters to actually get a new list of users (refetch).  

The new filtered list of users will be stored into `data`, and we will see it displayed in the browser 
thanks to the `map` function in the JSX part of the App component.
