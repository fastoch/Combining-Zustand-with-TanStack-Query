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
