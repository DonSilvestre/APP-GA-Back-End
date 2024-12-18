import express, { json } from "express";
import cors from 'cors'
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const app = express();
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173',  // Substitua pelo endereço correto do seu frontend
}));

app.listen(3000, '0.0.0.0', () => {
  console.log('Server running on http://localhost:3000');
});
const users = [];

app.get("/usuarios", async (req, res) => {
  let users = [];
  if (req.query) {
    users = await prisma.user.findMany({
      where: {
        nomePeca: req.query.nomePeca,
      },
    });
  } else {
    users = await prisma.user.findMany();
  }
  res.status(200).json(users);
});

app.post("/usuarios", async (req, res) => {
  try {
    const totalCostura =
    (req.body.valorCostura || 0) *
    (req.body.quantidadePeca || 0) 

    const totaldVenda =
    (req.body.quantidadePeca || 0) *
    (req.body.preco || 0) 

    // Calcula o total investido somando os campos fornecidos
    const investido =
      totalCostura +
      (req.body.valorTecido || 0) +
      (req.body.valorBojo || 0);

    const ganho =
      totaldVenda - investido



    // Cria o registro no banco de dados
    const newUser = await prisma.user.create({
      data: {
        modelo: req.body.modelo,
        nomePeca: req.body.nomePeca,
        quantidadePeca: req.body.quantidadePeca,
        preco: req.body.preco,
        totalVenda: totaldVenda,
        investido: investido,
        ganho: ganho,
        valorCostura: req.body.valorCostura,
        totalCostura: totalCostura,
        valorTecido: req.body.valorTecido,
        valorBojo: req.body.valorBojo,
        totalMes: 0,  // Será calculado posteriormente
        totalAno: 0,       // Será calculado posteriormente
      },
    });

    // Calcula o total do ano (agregado)
    const totalMes = await prisma.user.aggregate({
      _sum: {
        investido: true, // Soma o totalMes de todos os registros
      },
    });

    // Atualiza o registro com o totalAno
    await prisma.user.update({
      where: { id: newUser.id },
      data: {
        totalMes: totalMes._sum.investido,
      },
    });

    res.status(201).json({ ...newUser, totalAno: totalMes._sum.investido });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar o registro" });
  }
});

app.put("/usuarios/:id", async (req, res) => {
  await prisma.user.update({
    where: {
      id: req.params.id,
    },
    data: {
      nomePeca: req.body.nomePeca,
      quantidadePeca: req.body.quantidadePeca,  
      preco: req.body.preco,
      totalVenda: req.body.totalVenda,
      investido: req.body.investido,
      ganho: req.body.ganho,
      valorCostura: req.body.valorCostura,
      valorTecido: req.body.valorTecido,
      valorBojo: req.body.valorBojo,
    },
  });
  res.status(201).json(req.body);
});

app.delete("/usuarios/:id", async (req, res) => {
  await prisma.user.delete({
    where: {
      id: req.params.id,
    },
  });
  res.status(200).json({ message: "Usuario deletado com sucesso" });
});
