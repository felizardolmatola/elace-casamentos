import { Router } from 'express';
import { login, loginCasal, loginFornecedor, registarCasal, registarFornecedor } from '../controllers/authController.js';
import { exigirAutenticacao } from '../middlewares/auth.js';
import { sql } from '../config/db.js';

const router = Router();
router.post('/login', login);
router.post('/registar/casal', registarCasal);
router.post('/registar/fornecedor', registarFornecedor);
router.post('/login/casal', loginCasal);
router.post('/login/fornecedor', loginFornecedor);
router.get('/me', exigirAutenticacao, async (req, res) => {
  try {
    if (req.usuario.tipo === 'casal') {
      const [r] = await sql`SELECT * FROM casais WHERE id = ${Number(req.usuario.id)} LIMIT 1`;
      return r ? res.json({ ok: true, tipo: 'casal', usuario: r }) : res.status(404).json({ ok: false, erro: 'Utilizador não encontrado.' });
    }
    if (req.usuario.tipo === 'fornecedor') {
      const [r] = await sql`SELECT * FROM fornecedores WHERE id = ${Number(req.usuario.id)} LIMIT 1`;
      return r ? res.json({ ok: true, tipo: 'fornecedor', usuario: r }) : res.status(404).json({ ok: false, erro: 'Utilizador não encontrado.' });
    }
    const [r] = await sql`SELECT id, nome, email, nivel, ativo FROM admins WHERE id = ${Number(req.usuario.id)} LIMIT 1`;
    return r ? res.json({ ok: true, tipo: 'admin', usuario: r }) : res.status(404).json({ ok: false, erro: 'Administrador não encontrado.' });
  } catch (err) { console.error(err); res.status(500).json({ ok: false, erro: 'Erro ao consultar a sessão.' }); }
});
export default router;
