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

