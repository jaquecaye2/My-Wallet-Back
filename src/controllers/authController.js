import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import { db } from "../dbStrategy/mongo.js";
import joi from "joi";

export async function cadastrar(request, response) {
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

  const verificarUsuarioIgual = await db
    .collection("usuarios")
    .find({ email: usuario.email })
    .toArray();

  console.log(verificarUsuarioIgual);

  if (verificarUsuarioIgual.length !== 0) {
    response.status(422).send("Usuario já cadastrado");
    return;
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
}

export async function logar(request, response) {
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
}

export async function sair(request, response) {

  const token = response.locals.token;

  try {
    await db.collection("sessoes").deleteOne({ token });
    response.status(201).send();
  } catch (error) {
    response.status(500).send();
  }
}
