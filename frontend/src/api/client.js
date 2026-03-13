const BASE = '/api'

async function req(method, path, body) {
  const token = localStorage.getItem('access_token')
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {})
  })
  if (!res.ok) { const err = new Error(); err.response = { data: await res.json().catch(()=>({})) }; throw err }
  return res.json()
}

const get    = (path)       => req('GET',    path)
const post   = (path, body) => req('POST',   path, body)
const put    = (path, body) => req('PUT',    path, body)
const del    = (path)       => req('DELETE', path)

const listFn = (entity, params={}) => {
  const qs = new URLSearchParams(Object.entries(params).filter(([,v])=>v!=null)).toString()
  return get(`/${entity}${qs?'?'+qs:''}`)
}

export const auth = {
  login: async (email, password) => {
    const body = new URLSearchParams({ username: email, password })
    const res = await fetch(BASE + '/auth/token', { method: 'POST', body })
    if (!res.ok) { const err = new Error(); err.response = { data: await res.json().catch(()=>({})) }; throw err }
    const data = await res.json()
    localStorage.setItem('access_token', data.access_token)
    return data
  },
  me:     () => get('/users/me'),
  logout: () => localStorage.clear(),
}

export const drivers       = { list: (p) => listFn('drivers', p), create: (b) => post('/drivers', b), update: (id,b) => put(`/drivers/${id}`, b) }
export const vehicles      = { list: (p) => listFn('vehicles', p), create: (b) => post('/vehicles', b), update: (id,b) => put(`/vehicles/${id}`, b) }
export const payments      = { list: (p) => listFn('payments', p), create: (b) => post('/payments', b), update: (id,b) => put(`/payments/${id}`, b) }
export const loans         = { list: () => get('/loans'), create: (b) => post('/loans', b), approve: (id) => put(`/loans/${id}/approve`), reject: (id) => put(`/loans/${id}/reject`), remove: (id) => del(`/loans/${id}`) }
export const upi           = { transactions: () => get('/upi/transactions') }
export const purchases     = { list: () => get('/purchases'), approve: (id) => put(`/purchases/${id}/approve`) }
export const maintenance   = { list: () => get('/maintenance'), create: (b) => post('/maintenance', b) }
export const messages      = {
  conversations:      ()             => get('/messages/conversations'),
  createConversation: (b)            => post('/messages/conversations', b),
  getOrCreateSupport: ()             => post('/messages/support-conversation', {}),
  getMessages:        (id)           => get(`/messages/conversations/${id}/messages`),
  send:               (id, content)  => post(`/messages/conversations/${id}/messages`, { content }),
}
export const reports       = { summary: () => get('/reports/summary'), weekly: () => get('/reports/weekly') }
export const fleetManagers = { list: () => get('/fleet-managers'), create: (b) => post('/fleet-managers', b), update: (id,b) => put(`/fleet-managers/${id}`, b), remove: (id) => del(`/fleet-managers/${id}`) }
export const users         = { list: () => get('/users'), create: (b) => post('/users', b), update: (id,b) => put(`/users/${id}`, b), remove: (id) => del(`/users/${id}`), toggleActive: (id) => put(`/users/${id}/toggle-active`) }
