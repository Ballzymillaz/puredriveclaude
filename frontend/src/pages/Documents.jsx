import { useQuery } from '@tanstack/react-query'

// TODO: connecter à l'API correspondante
export default function Documents() {
  return (
    <>
      <div className="page-header">
        <div><div className="page-title">Documents</div></div>
      </div>
      <div className="empty">
        <div className="empty-icon">🔧</div>
        <div className="empty-text">Page Documents</div>
        <div className="empty-sub">Connecter à l'API via <code>DocumentsApi</code> depuis <code>src/api/client.js</code></div>
      </div>
    </>
  )
}
