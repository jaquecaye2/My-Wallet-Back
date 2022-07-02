import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import joi from "joi";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";

dotenv.config();

const client = new MongoClient("mongodb://127.0.0.1:27017");
let db;

client.connect().then(() => {
  db = client.db("myWallet");
});

const app = express();
app.use(cors());
app.use(express.json());

app.post("/cadastrar", async (request, response) => {
  const usuario = request.body;

  const usuarioSchema = joi.object({
    nome: joi.string().required(),
    email: joi.string().email().required(),
    senha: joi.string().required(),
  });

  const { error } = usuarioSchema.validate(usuario);

  if (error) {
    return response.sendStatus(422);
  }

  const senhaCriptografada = bcrypt.hashSync(usuario.senha, 10);

  const userCadastrado = {
    ...usuario,
    senha: senhaCriptografada,
  };

  try {
    await db.collection("usuarios").insertOne(userCadastrado);
    response.status(201).send(userCadastrado);
  } catch (error) {
    response.status(500).send();
  }
});

app.post("/login", async (request, response) => {
  const usuario = request.body;

  const usuarioSchema = joi.object({
    email: joi.string().email().required(),
    senha: joi.string().required(),
  });

  const { error } = usuarioSchema.validate(usuario);

  if (error) {
    response.status(422).send;
    return;
  }

  const user = await db
    .collection("usuarios")
    .findOne({ email: usuario.email });

  if (user && bcrypt.compareSync(usuario.senha, user.senha)) {
    const token = uuid();

    const novoUsuarioLogado = {
      userId: user._id,
      token,
      nome: user.nome,
      email: user.email,
      senha: user.senha,
    };

    await db.collection("sessoes").insertOne(novoUsuarioLogado);
    response.status(201).send(novoUsuarioLogado);
  } else {
    response.status(401).send("Senha ou email incorretos!");
  }
});

const PORT = process.env.PORT;
app.listen(PORT);
