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
