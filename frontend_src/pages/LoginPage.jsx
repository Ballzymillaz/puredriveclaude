import { useState } from 'react'
import { auth } from '../api/client.js'

export default function LoginPage({ onLogin }) {
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const data = await auth.login(email, password)
      onLogin(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Email ou mot de passe incorrect')
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: 16,
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🚗</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>PureDrivePT</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>Gestão de frota TVDE</p>
        </div>

        <div className="card" style={{ padding: 28 }}>
          <form onSubmit={submit}>
            <div className="form-group">
              <label>Email</label>
              <input className="input" type="email" value={email}
                onChange={e => setEmail(e.target.value)} placeholder="email@exemplo.pt" required />
            </div>
            <div className="form-group">
              <label>Palavra-passe</label>
              <input className="input" type="password" value={password}
                onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            {error && (
              <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 8, padding: '10px 14px', color: 'var(--red)', fontSize: 13, marginBottom: 14 }}>
                {error}
              </div>
            )}
            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '11px 16px', fontSize: 14 }}>
              {loading ? <span className="spinner" /> : 'Entrar'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--faint)', fontSize: 12, marginTop: 20 }}>
          PureDrivePT © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
