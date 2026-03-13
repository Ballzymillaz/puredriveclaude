import { useState, useEffect, useRef } from 'react'
import { messages as msgsAPI, users as usersAPI } from '../api/client.js'

const ROLE_PT = { admin:'Admin', fleet_manager:'Fleet Manager', driver:'Motorista' }

export default function Messages({ user }) {
  const [convs, setConvs]       = useState([])
  const [msgs, setMsgs]         = useState([])
  const [selected, setSelected] = useState(null)
  const [content, setContent]   = useState('')
  const [loading, setLoading]   = useState(true)
  const [newModal, setNewModal] = useState(false)
  const [allUsers, setAllUsers] = useState([])
  const [selected2, setSelected2] = useState([])
  const [convTitle, setConvTitle] = useState('')
  const bottomRef = useRef(null)

  const loadConvs = () => msgsAPI.conversations().then(r=>{setConvs(r.entities||[]);setLoading(false)})

  useEffect(()=>{
    loadConvs()
    if (user.role === 'driver') {
      msgsAPI.getOrCreateSupport().then(c=>{
        if (c) { setSelected(c); msgsAPI.getMessages(c.id).then(r=>setMsgs(r.entities||[])) }
      }).catch(()=>{})
    } else {
      usersAPI.list().then(r=>setAllUsers((r.entities||[]).filter(u=>u.id!==user.id&&u.is_active)))
    }
  },[])

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:'smooth'}) },[msgs])

  const selectConv = (c) => {
    setSelected(c)
    msgsAPI.getMessages(c.id).then(r=>setMsgs(r.entities||[]))
  }

  const send = async()=>{
    if (!content.trim()||!selected) return
    const txt = content; setContent('')
    await msgsAPI.send(selected.id, txt)
    msgsAPI.getMessages(selected.id).then(r=>setMsgs(r.entities||[]))
  }

  const createConv = async()=>{
    if (!selected2.length) return
    try {
      const title = convTitle || (selected2.length===1
        ? allUsers.find(u=>u.id===selected2[0])?.full_name
        : `Grupo (${selected2.length})`)
      const c = await msgsAPI.createConversation({ title, participant_ids: selected2 })
      await loadConvs()
      setNewModal(false); setSelected2([]); setConvTitle('')
      selectConv(c)
    } catch(e){ alert(e.response?.data?.detail||'Erro ao criar conversa') }
  }

  const toggleUser = (id) => setSelected2(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id])
  const toggleGroup = (role) => {
    const ids = allUsers.filter(u=>u.role===role).map(u=>u.id)
    const allIn = ids.every(id=>selected2.includes(id))
    setSelected2(s=>allIn ? s.filter(id=>!ids.includes(id)) : [...new Set([...s,...ids])])
  }

  if (loading) return <div className="loading-page"><div className="spinner" style={{width:32,height:32}}/></div>

  // Driver — chat suporte uniquement
  if (user.role==='driver') {
    return (
      <div>
        <div className="page-header"><div><h1>Suporte</h1><div className="sub">Contacte a equipa PureDrivePT</div></div></div>
        <div className="card" style={{display:'flex',flexDirection:'column',height:500}}>
          <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:32,height:32,borderRadius:'50%',background:'var(--indigo)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:'#fff'}}>P</div>
            <div><div style={{fontWeight:600,fontSize:13}}>PureDrivePT Suporte</div><div style={{fontSize:11,color:'var(--green)'}}>● Online</div></div>
          </div>
          <div style={{flex:1,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:10}}>
            {msgs.length===0&&<div style={{textAlign:'center',color:'var(--muted)',fontSize:13,marginTop:40}}>Envie uma mensagem para o suporte</div>}
            {msgs.map(m=>{
              const isMe = m.sender_id===user.id
              return <div key={m.id} style={{alignSelf:isMe?'flex-end':'flex-start',maxWidth:'75%'}}>
                {!isMe&&<div style={{fontSize:11,color:'var(--muted)',marginBottom:3}}>Suporte</div>}
                <div style={{background:isMe?'var(--indigo)':'var(--surface2)',borderRadius:isMe?'12px 12px 4px 12px':'12px 12px 12px 4px',padding:'9px 14px',fontSize:13}}>{m.content}</div>
                <div style={{fontSize:10,color:'var(--faint)',marginTop:3,textAlign:isMe?'right':'left'}}>{m.created_date?.slice(11,16)}</div>
              </div>
            })}
            <div ref={bottomRef}/>
          </div>
          <div style={{padding:12,borderTop:'1px solid var(--border)',display:'flex',gap:8}}>
            <input className="input" value={content} onChange={e=>setContent(e.target.value)} placeholder="Escrever mensagem..." onKeyDown={e=>e.key==='Enter'&&send()} style={{flex:1}}/>
            <button className="btn btn-primary" onClick={send}>Enviar</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div><h1>Mensagens</h1></div>
        <button className="btn btn-primary" onClick={()=>setNewModal(true)}>+ Nova conversa</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'260px 1fr',gap:16,height:560}}>
        <div className="card" style={{overflowY:'auto'}}>
          {convs.length===0 ? <div className="empty"><div className="icon">💬</div><p>Sem conversas</p></div> :
          convs.map(c=>(
            <div key={c.id} onClick={()=>selectConv(c)} style={{padding:'12px 16px',cursor:'pointer',background:selected?.id===c.id?'rgba(99,102,241,.1)':'transparent',borderLeft:selected?.id===c.id?'2px solid var(--indigo)':'2px solid transparent',borderBottom:'1px solid var(--border)'}}>
              <div style={{fontWeight:500,fontSize:13}}>{c.title}</div>
              {c.last_message&&<div style={{fontSize:11,color:'var(--muted)',marginTop:3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.last_message}</div>}
            </div>
          ))}
        </div>
        <div className="card" style={{display:'flex',flexDirection:'column'}}>
          {!selected ? <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'var(--muted)'}}>
            <div style={{fontSize:32,marginBottom:12}}>💬</div><p>Selecione uma conversa</p>
          </div> : (
            <>
              <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border)',fontWeight:600}}>{selected.title}</div>
              <div style={{flex:1,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:10}}>
                {msgs.map(m=>{
                  const isMe = m.sender_id===user.id
                  return <div key={m.id} style={{alignSelf:isMe?'flex-end':'flex-start',maxWidth:'70%'}}>
                    {!isMe&&<div style={{fontSize:11,color:'var(--muted)',marginBottom:3}}>{m.sender_name}</div>}
                    <div style={{background:isMe?'var(--indigo)':'var(--surface2)',borderRadius:isMe?'12px 12px 4px 12px':'12px 12px 12px 4px',padding:'8px 14px',fontSize:13}}>{m.content}</div>
                    <div style={{fontSize:10,color:'var(--faint)',marginTop:3,textAlign:isMe?'right':'left'}}>{m.created_date?.slice(11,16)}</div>
                  </div>
                })}
                <div ref={bottomRef}/>
              </div>
              <div style={{padding:12,borderTop:'1px solid var(--border)',display:'flex',gap:8}}>
                <input className="input" value={content} onChange={e=>setContent(e.target.value)} placeholder="Responder..." onKeyDown={e=>e.key==='Enter'&&send()} style={{flex:1}}/>
                <button className="btn btn-primary" onClick={send}>Enviar</button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Nova conversa */}
      {newModal && (
        <div className="modal-overlay" onClick={()=>setNewModal(false)}>
          <div className="modal" style={{maxWidth:480}} onClick={e=>e.stopPropagation()}>
            <div className="modal-header"><h3>Nova conversa</h3><button onClick={()=>setNewModal(false)} style={{background:'none',border:'none',color:'var(--muted)',fontSize:20,cursor:'pointer'}}>×</button></div>
            <div className="modal-body">
              <div className="form-group"><label>Título (opcional)</label><input className="input" value={convTitle} onChange={e=>setConvTitle(e.target.value)} placeholder="Nome da conversa"/></div>

              {/* Grupos rápidos */}
              <div style={{display:'flex',gap:8,marginBottom:14}}>
                {['driver','fleet_manager'].map(role=>{
                  const ids = allUsers.filter(u=>u.role===role).map(u=>u.id)
                  const allIn = ids.length>0&&ids.every(id=>selected2.includes(id))
                  return <button key={role} onClick={()=>toggleGroup(role)} className={`btn ${allIn?'btn-primary':'btn-ghost'}`} style={{fontSize:12,padding:'5px 12px'}}>
                    {allIn?'✓ ':''}{role==='driver'?'Todos motoristas':'Todos fleet managers'}
                  </button>
                })}
              </div>

              <div style={{maxHeight:260,overflowY:'auto',border:'1px solid var(--border)',borderRadius:8}}>
                {['fleet_manager','driver'].map(role=>(
                  <div key={role}>
                    <div style={{padding:'6px 12px',background:'var(--surface2)',fontSize:11,fontWeight:700,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.06em'}}>{ROLE_PT[role]}</div>
                    {allUsers.filter(u=>u.role===role).map(u=>(
                      <div key={u.id} onClick={()=>toggleUser(u.id)} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',cursor:'pointer',background:selected2.includes(u.id)?'rgba(99,102,241,.1)':'transparent',borderBottom:'1px solid rgba(51,65,85,.3)'}}>
                        <div style={{width:18,height:18,borderRadius:4,border:`2px solid ${selected2.includes(u.id)?'var(--indigo)':'var(--border)'}`,background:selected2.includes(u.id)?'var(--indigo)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'#fff',flexShrink:0}}>
                          {selected2.includes(u.id)&&'✓'}
                        </div>
                        <span style={{fontSize:13}}>{u.full_name||u.email}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              {selected2.length>0&&<div style={{marginTop:8,fontSize:12,color:'var(--muted)'}}>{selected2.length} participante(s) selecionado(s)</div>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={()=>setNewModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={createConv} disabled={!selected2.length}>Criar conversa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
