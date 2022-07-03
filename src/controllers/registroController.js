import { db } from "../dbStrategy/mongo.js";
import joi from "joi";
import dayjs from "dayjs";

export async function cadastrarRegistro(request, response) {
  const dados = request.body;

  const usuario = response.locals.usuario;

  const registroSchema = joi.object({
    valor: joi.number().required(),
    descricao: joi.string().required(),
    tipo: joi.string().valid("entrada", "saida"),
  });

  const validou = registroSchema.validate(dados);

  if (validou.error) {
    response.status(422).send();
    return;
  }

  const novoRegistro = {
    userId: usuario.userId,
    de: usuario.nome,
    email: usuario.email,
    valor: dados.valor,
    descricao: dados.descricao,
    tipo: dados.tipo,
    dia: `${dayjs().$D}/${dayjs().$M}`,
  };

  try {
    await db.collection("registros").insertOne(novoRegistro);
    response.status(201).send(novoRegistro);
  } catch (error) {
    response.status(500).send();
  }
}

export async function renderizarRegistros(request, response) {
  
  const usuario = response.locals.usuario;

  try {
    const registros = await db
      .collection("registros")
      .find({ userId: usuario.userId })
      .toArray();
    response.status(201).send(registros);
  } catch (error) {
    response.status(500).send();
  }
}
