import { Router } from 'express';
import { sql } from '../config/db.js';
import { exigirAutenticacao } from '../middlewares/auth.js';
const router=Router();
router.get('/',exigirAutenticacao,async(req,res)=>{try{const uid=Number(req.usuario.id);const rows=req.usuario.tipo==='casal'?await sql`SELECT * FROM notificacoes WHERE casal_id=${uid} ORDER BY id DESC`:req.usuario.tipo==='fornecedor'?await sql`SELECT * FROM notificacoes WHERE fornecedor_id=${uid} ORDER BY id DESC`:await sql`SELECT * FROM notificacoes ORDER BY id DESC`;res.json({ok:true,notificacoes:rows});}catch(e){console.error(e);res.status(500).json({ok:false,erro:'Erro ao listar notificações.'});}});
router.patch('/:id/lida',exigirAutenticacao,async(req,res)=>{try{const id=Number(req.params.id),uid=Number(req.usuario.id);const where=req.usuario.tipo==='casal'?sql`AND casal_id=${uid}`:req.usuario.tipo==='fornecedor'?sql`AND fornecedor_id=${uid}`:sql``;const [r]=await sql`UPDATE notificacoes SET lida=TRUE WHERE id=${id} ${where} RETURNING *`;if(!r)return res.status(404).json({ok:false,erro:'Notificação não encontrada.'});res.json({ok:true,notificacao:r});}catch(e){console.error(e);res.status(500).json({ok:false,erro:'Erro ao marcar notificação.'});}});
export default router;
