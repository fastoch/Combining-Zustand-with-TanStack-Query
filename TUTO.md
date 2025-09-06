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

export default function App() {
  const { data } = useQuery({
    queryKey:['users'], 
    queryFn: () => getUsers(), // expects parameters (optional filters), hence the anonymous function 
  })

  return (
    <div>
      {data?.map(user => <div key={user.id}>{user.name}</div>)}
    </div>
  )
}
```

---
@3/20