import { useQuery } from '@tanstack/react-query'

// TODO: connecter à l'API correspondante
export default function Ranking() {
  return (
    <>
      <div className="page-header">
        <div><div className="page-title">Ranking</div></div>
      </div>
      <div className="empty">
        <div className="empty-icon">🔧</div>
        <div className="empty-text">Page Ranking</div>
        <div className="empty-sub">Connecter à l'API via <code>RankingApi</code> depuis <code>src/api/client.js</code></div>
      </div>
    </>
  )
}
