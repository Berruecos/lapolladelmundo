import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [participante, setParticipante] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchParticipante(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchParticipante(session.user.id)
      else { setParticipante(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchParticipante(userId) {
    const { data } = await supabase
      .from('participantes')
      .select('*')
      .eq('user_id', userId)
      .single()
    setParticipante(data)
    setLoading(false)
  }

  async function signUp(email, password, nombre) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    if (data.user) {
      const { error: pe } = await supabase.from('participantes').insert({
        user_id: data.user.id,
        nombre,
        pago: false,
        es_admin: false,
      })
      if (pe) throw pe
    }
    return data
  }

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, participante, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
