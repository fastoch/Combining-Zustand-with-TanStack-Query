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
