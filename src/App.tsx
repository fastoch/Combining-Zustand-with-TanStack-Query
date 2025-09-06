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
