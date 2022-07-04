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

  let formatoData
  let diaHoje = parseInt(dayjs().$D)
  let mesHoje = parseInt(dayjs().$M)

  if (diaHoje < 10 && mesHoje < 10){
    formatoData = `0${dayjs().$D}/0${dayjs().$M}`
  } else if (diaHoje < 10 && mesHoje > 10){
    formatoData = `0${dayjs().$D}/${dayjs().$M}`
  } else if (diaHoje > 10 && mesHoje < 10){
    formatoData = `${dayjs().$D}/0${dayjs().$M}`
  } else {
    formatoData = `${dayjs().$D}/${dayjs().$M}`
  }

  const novoRegistro = {
    userId: usuario.userId,
    de: usuario.nome,
    email: usuario.email,
    valor: dados.valor,
    descricao: dados.descricao,
    tipo: dados.tipo,
    dia: formatoData,
    mes: dayjs().$M
  };

  try {
    await db.collection("registros").insertOne(novoRegistro);
    response.status(201).send(novoRegistro);
  } catch (error) {
    response.status(500).send();
  }
}

export async function renderizarRegistros(request, response) {
  
  // fazer lógica para pegar somente os registros do mês corrente

  const mesAtual = dayjs().$M

  const usuario = response.locals.usuario;

  try {
    const registros = await db
      .collection("registros")
      .find({ $and: [{ userId: usuario.userId }, {mes: mesAtual}]})
      .toArray();
    response.status(201).send(registros.reverse());
  } catch (error) {
    response.status(500).send();
  }
}
