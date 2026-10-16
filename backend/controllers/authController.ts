import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sql } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';
const SALT_ROUNDS = 10;

const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
const gerarToken = payload => jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
const clean = value => value == null || String(value).trim() === '' ? null : String(value).trim();

export async function registarCasal(req, res) {
  const { nome1, nome2, email, dataCasamento, telefone, cidade, fotoUrl, password, confirmarPassword } = req.body || {};
  const erros = {};
  if (!clean(nome1)) erros.nome1 = 'Nome obrigatório.';
  if (!clean(nome2)) erros.nome2 = 'Nome obrigatório.';
  if (!validEmail(email)) erros.email = 'Email inválido.';
  if (!password || String(password).length < 8) erros.password = 'Mínimo de 8 caracteres.';
  if (password !== confirmarPassword) erros.confirmarPassword = 'As palavras-passe não coincidem.';
  if (Object.keys(erros).length) return res.status(400).json({ ok: false, erros });

  const emailNorm = String(email).trim().toLowerCase();
  try {
    const [existente] = await sql`SELECT id FROM casais WHERE LOWER(email) = ${emailNorm} LIMIT 1`;
    if (existente) return res.status(409).json({ ok: false, erros: { email: 'Este email já está registado.' } });

    const passwordHash = await bcrypt.hash(String(password), SALT_ROUNDS);
    const [row] = await sql`
      INSERT INTO casais (nome1, nome2, email, telefone, data_casamento, foto_url, cidade, password_hash)
      VALUES (${clean(nome1)}, ${clean(nome2)}, ${emailNorm}, ${clean(telefone)}, ${dataCasamento || null}, ${clean(fotoUrl)}, ${clean(cidade)}, ${passwordHash})
      RETURNING id, nome1, nome2, email, telefone, data_casamento, foto_url, cidade, estado_conta, criado_em
    `;
    const token = gerarToken({ id: row.id, tipo: 'casal', email: row.email });
    return res.status(201).json({ ok: true, token, tipo: 'casal', casal: mapCasal(row) });
  } catch (err) {
    console.error('registarCasal:', err);
    if (err?.code === '23505') return res.status(409).json({ ok: false, erros: { email: 'Este email já está registado.' } });
    return res.status(500).json({ ok: false, erro: 'Erro ao registar o casal.' });
  }
}

export async function registarFornecedor(req, res) {
  const b = req.body || {};
  const responsavel = clean(b.responsavel);
  // O formulário já não pede o nome do negócio: se não vier, usa o nome do responsável.
  const nomeNegocio = clean(b.nomeNegocio ?? b.nome_negocio) ?? responsavel;
  const telefone = clean(b.telefone);
  const email = b.emailFornecedor ?? b.email;
  const descricao = clean(b.descricao);
  const cidade = clean(b.cidade);
  const endereco = clean(b.endereco ?? b.localizacao);
  const fotoUrl = clean(b.fotoUrl ?? b.foto_url ?? b.foto);
  const faixaPreco = clean(b.faixaPreco ?? b.faixa_preco);
  const password = b.passwordFornecedor ?? b.password;
  const confirmar = b.confirmarPasswordFornecedor ?? b.confirmarPassword;
  const categoriaIdRaw = b.categoriaId ?? b.categoria_id ?? b.categoria;
  let categoriaId = categoriaIdRaw === '' || categoriaIdRaw == null ? null : Number(categoriaIdRaw);
  if (categoriaIdRaw != null && categoriaIdRaw !== '' && !Number.isInteger(categoriaId)) categoriaId = null;

  const erros = {};
  if (!responsavel) erros.responsavel = 'Responsável obrigatório.';
  if (!validEmail(email)) erros.email = 'Email inválido.';
  if (!password || String(password).length < 8) erros.password = 'Mínimo de 8 caracteres.';
  if (password !== confirmar) erros.confirmarPassword = 'As palavras-passe não coincidem.';
  if (categoriaId !== null && (!Number.isInteger(categoriaId) || categoriaId <= 0)) erros.categoriaId = 'Categoria inválida.';
  if (Object.keys(erros).length) return res.status(400).json({ ok: false, erros });

  const emailNorm = String(email).trim().toLowerCase();
  try {
    const [existente] = await sql`SELECT id FROM fornecedores WHERE LOWER(email) = ${emailNorm} LIMIT 1`;
    if (existente) return res.status(409).json({ ok: false, erros: { email: 'Este email já está registado.' } });

    if (categoriaIdRaw != null && categoriaIdRaw !== '' && categoriaId === null) {
      const termo = String(categoriaIdRaw).trim().toLowerCase();
      const slug = termo;
      const [cat] = await sql`SELECT id FROM categorias WHERE ativo=TRUE AND (LOWER(nome)=${termo} OR LOWER(REGEXP_REPLACE(nome, '[^a-zA-Z0-9]+', '-', 'g'))=${slug}) LIMIT 1`;
      if (!cat) return res.status(400).json({ ok: false, erros: { categoriaId: 'Categoria não encontrada ou inativa.' } });
      categoriaId = cat.id;
    } else if (categoriaId !== null) {
      const [cat] = await sql`SELECT id FROM categorias WHERE id = ${categoriaId} AND ativo = TRUE LIMIT 1`;
      if (!cat) return res.status(400).json({ ok: false, erros: { categoriaId: 'Categoria não encontrada ou inativa.' } });
    }

    const passwordHash = await bcrypt.hash(String(password), SALT_ROUNDS);
    const [row] = await sql`
      INSERT INTO fornecedores
        (nome_negocio, responsavel, email, telefone, password_hash, categoria_id, descricao, cidade, endereco, foto_url, faixa_preco)
      VALUES
        (${nomeNegocio}, ${responsavel}, ${emailNorm}, ${telefone}, ${passwordHash}, ${categoriaId}, ${descricao}, ${cidade}, ${endereco}, ${fotoUrl}, ${faixaPreco})
      RETURNING id, nome_negocio, responsavel, email, telefone, categoria_id, descricao, cidade, endereco, foto_url, faixa_preco, estado_conta, criado_em
    `;
    const token = gerarToken({ id: row.id, tipo: 'fornecedor', email: row.email });
    return res.status(201).json({ ok: true, token, tipo: 'fornecedor', fornecedor: mapFornecedor(row) });
  } catch (err) {
    console.error('registarFornecedor:', err);
    if (err?.code === '23505') return res.status(409).json({ ok: false, erros: { email: 'Este email já está registado.' } });
    if (err?.code === '23503') return res.status(400).json({ ok: false, erro: 'Categoria inválida.' });
    return res.status(500).json({ ok: false, erro: 'Erro ao registar o fornecedor.' });
  }
}

export async function login(req, res) {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  if (!validEmail(email) || !password) return res.status(400).json({ ok: false, erro: 'Email e palavra-passe são obrigatórios.' });

  try {
    const [casal] = await sql`SELECT * FROM casais WHERE LOWER(email) = ${email} LIMIT 1`;
    if (casal && await bcrypt.compare(password, casal.password_hash)) {
      if (casal.estado_conta !== 'ativo') return res.status(403).json({ ok: false, erro: 'A conta do casal não está ativa.' });
      const token = gerarToken({ id: casal.id, tipo: 'casal', email: casal.email });
      return res.json({ ok: true, token, tipo: 'casal', usuario: mapCasal(casal) });
    }

    const [fornecedor] = await sql`SELECT * FROM fornecedores WHERE LOWER(email) = ${email} LIMIT 1`;
    if (fornecedor && await bcrypt.compare(password, fornecedor.password_hash)) {
      if (fornecedor.estado_conta !== 'ativo') return res.status(403).json({ ok: false, erro: 'A conta do fornecedor ainda não está ativa.' });
      const token = gerarToken({ id: fornecedor.id, tipo: 'fornecedor', email: fornecedor.email });
      return res.json({ ok: true, token, tipo: 'fornecedor', usuario: mapFornecedor(fornecedor) });
    }

    const [admin] = await sql`SELECT * FROM admins WHERE LOWER(email) = ${email} AND ativo = TRUE LIMIT 1`;
    if (admin && await bcrypt.compare(password, admin.password_hash)) {
      await sql`UPDATE admins SET ultimo_login = NOW() WHERE id = ${admin.id}`;
      const token = gerarToken({ id: admin.id, tipo: 'admin', email: admin.email, nivel: admin.nivel });
      return res.json({ ok: true, token, tipo: 'admin', usuario: { id: admin.id, nome: admin.nome, email: admin.email, nivel: admin.nivel } });
    }

    return res.status(401).json({ ok: false, erro: 'Credenciais inválidas.' });
  } catch (err) {
    console.error('login:', err);
    return res.status(500).json({ ok: false, erro: 'Erro ao realizar login.' });
  }
}

export async function loginCasal(req, res) { req.body = { ...(req.body || {}) }; return loginComTipo(req, res, 'casal'); }
export async function loginFornecedor(req, res) { req.body = { ...(req.body || {}) }; return loginComTipo(req, res, 'fornecedor'); }

async function loginComTipo(req, res, tipo) {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  if (!validEmail(email) || !password) return res.status(400).json({ ok: false, erro: 'Email e palavra-passe são obrigatórios.' });
  try {
    const table = tipo === 'casal' ? sql`SELECT * FROM casais WHERE LOWER(email) = ${email} LIMIT 1` : sql`SELECT * FROM fornecedores WHERE LOWER(email) = ${email} LIMIT 1`;
    const [row] = await table;
    if (!row || !(await bcrypt.compare(password, row.password_hash))) return res.status(401).json({ ok: false, erro: 'Credenciais inválidas.' });
    if (row.estado_conta !== 'ativo') return res.status(403).json({ ok: false, erro: 'A conta ainda não está ativa.' });
    const token = gerarToken({ id: row.id, tipo, email: row.email });
    return res.json({ ok: true, token, tipo, [tipo]: tipo === 'casal' ? mapCasal(row) : mapFornecedor(row) });
  } catch (err) {
    console.error(`login${tipo}:`, err);
    return res.status(500).json({ ok: false, erro: 'Erro ao realizar login.' });
  }
}

export function mapCasal(c) {
  return { id: c.id, nome1: c.nome1, nome2: c.nome2, nome: `${c.nome1} & ${c.nome2}`, email: c.email, telefone: c.telefone || null, dataCasamento: c.data_casamento || null, fotoUrl: c.foto_url || null, cidade: c.cidade || null, estadoConta: c.estado_conta, criadoEm: c.criado_em, atualizadoEm: c.atualizado_em };
}

export function mapFornecedor(f) {
  return { id: f.id, nomeNegocio: f.nome_negocio, responsavel: f.responsavel, email: f.email, telefone: f.telefone || null, categoriaId: f.categoria_id ?? null, descricao: f.descricao || null, cidade: f.cidade || null, endereco: f.endereco || null, fotoUrl: f.foto_url || null, faixaPreco: f.faixa_preco || null, estadoConta: f.estado_conta, criadoEm: f.criado_em, atualizadoEm: f.atualizado_em };
}
