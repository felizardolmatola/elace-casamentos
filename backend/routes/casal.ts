import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { sql } from '../config/db.js';
import { exigirAutenticacao, exigirTipo } from '../middlewares/auth.js';
import { mapCasal } from '../controllers/authController.js';

const router = Router();
const casalAuth = [exigirAutenticacao, exigirTipo('casal')];
const adminAuth = [exigirAutenticacao, exigirTipo('admin')];

router.get('/me', ...casalAuth, async (req, res) => {
  try { const [c] = await sql`SELECT * FROM casais WHERE id = ${req.usuario.id} LIMIT 1`; return c ? res.json({ ok: true, casal: mapCasal(c) }) : res.status(404).json({ ok: false, erro: 'Casal não encontrado.' }); }
  catch (e) { console.error(e); res.status(500).json({ ok: false, erro: 'Erro ao consultar o casal.' }); }
});

router.patch('/me', ...casalAuth, async (req, res) => {
  const id = req.usuario.id, b = req.body || {};
  try {
    const [c] = await sql`SELECT * FROM casais WHERE id = ${id} LIMIT 1`;
    if (!c) return res.status(404).json({ ok: false, erro: 'Casal não encontrado.' });
    const nome1 = String(b.nome1 ?? c.nome1).trim(), nome2 = String(b.nome2 ?? c.nome2).trim();
    const email = String(b.email ?? c.email).trim().toLowerCase();
    if (!nome1 || !nome2 || !email) return res.status(400).json({ ok: false, erro: 'Nome e email são obrigatórios.' });
    await sql`UPDATE casais SET nome1=${nome1}, nome2=${nome2}, email=${email}, telefone=${b.telefone ?? c.telefone}, data_casamento=${b.dataCasamento ?? c.data_casamento}, foto_url=${b.fotoUrl ?? c.foto_url}, cidade=${b.cidade ?? c.cidade} WHERE id=${id}`;
    const [u] = await sql`SELECT * FROM casais WHERE id=${id} LIMIT 1`;
    res.json({ ok: true, casal: mapCasal(u) });
  } catch (e) { console.error(e); res.status(e?.code === '23505' ? 409 : 500).json({ ok: false, erro: e?.code === '23505' ? 'Este email já está em uso.' : 'Não foi possível atualizar o casal.' }); }
});

router.get('/admin/casais', ...adminAuth, async (req, res) => {
  try { const rows = await sql`SELECT id,nome1,nome2,email,telefone,data_casamento,foto_url,cidade,estado_conta,criado_em,atualizado_em FROM casais ORDER BY id DESC`; res.json({ ok:true, casais: rows.map(mapCasal) }); }
  catch(e){ console.error(e); res.status(500).json({ok:false,erro:'Erro ao listar os casais.'}); }
});

router.patch('/admin/casais/:id', ...adminAuth, async (req,res)=>{
  const id=String(req.params.id||'').trim(); if(!id)return res.status(400).json({ok:false,erro:'ID inválido.'});
  try { const [c]=await sql`SELECT * FROM casais WHERE id=${id} LIMIT 1`; if(!c)return res.status(404).json({ok:false,erro:'Casal não encontrado.'}); const b=req.body||{}; const estado=String(b.estadoConta??b.estado_conta??c.estado_conta).trim(); if(!['ativo','inativo','pendente'].includes(estado))return res.status(400).json({ok:false,erro:'Estado da conta inválido.'}); await sql`UPDATE casais SET nome1=${String(b.nome1??c.nome1).trim()},nome2=${String(b.nome2??c.nome2).trim()},email=${String(b.email??c.email).trim().toLowerCase()},telefone=${b.telefone??c.telefone},data_casamento=${b.dataCasamento??c.data_casamento},foto_url=${b.fotoUrl??c.foto_url},cidade=${b.cidade??c.cidade},estado_conta=${estado} WHERE id=${id}`; const [u]=await sql`SELECT * FROM casais WHERE id=${id} LIMIT 1`; res.json({ok:true,casal:mapCasal(u)}); }
  catch(e){console.error(e);res.status(e?.code==='23505'?409:500).json({ok:false,erro:e?.code==='23505'?'Email já utilizado.':'Não foi possível atualizar o casal.'});}
});

router.delete('/admin/casais/:id', ...adminAuth, async (req,res)=>{const id=String(req.params.id||'').trim();try{const r=await sql`DELETE FROM casais WHERE id=${id} RETURNING id`;if(!r.length)return res.status(404).json({ok:false,erro:'Casal não encontrado.'});res.json({ok:true,mensagem:'Conta do casal eliminada.'});}catch(e){console.error(e);res.status(500).json({ok:false,erro:'Não foi possível eliminar o casal.'});}});

router.post('/me/password', ...casalAuth, async (req,res)=>{const atual=String(req.body?.passwordAtual||''), nova=String(req.body?.novaPassword||'');if(nova.length<8)return res.status(400).json({ok:false,erro:'A nova palavra-passe deve ter pelo menos 8 caracteres.'});try{const [c]=await sql`SELECT password_hash FROM casais WHERE id=${req.usuario.id} LIMIT 1`;if(!c||!(await bcrypt.compare(atual,c.password_hash)))return res.status(401).json({ok:false,erro:'Palavra-passe atual incorreta.'});const hash=await bcrypt.hash(nova,10);await sql`UPDATE casais SET password_hash=${hash} WHERE id=${req.usuario.id}`;res.json({ok:true,mensagem:'Palavra-passe alterada.'});}catch(e){console.error(e);res.status(500).json({ok:false,erro:'Não foi possível alterar a palavra-passe.'});}});
export default router;
