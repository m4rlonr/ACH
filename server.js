const axios = require('axios').default;
var controles = null
var salas = null
var cfg = null
var timeNow = null
var reservas = null

// Inicio buscando dados
buscaDados()

reservas = require('./objeto.json')

// FUNÇÕES CONTINUAS
setInterval(() => {         // Atualização dos dados
  buscaDados()
}, 600000);   //10m
setInterval(() => {         // Atualização de horas
  if (0 < new Date().getMinutes() && new Date().getMinutes() < 10) {
    timeNow = parseInt(`${new Date().getHours()}0${new Date().getMinutes()}`)
  } else if (new Date().getMinutes() == 0) {
    timeNow = parseInt(`${new Date().getHours()}00`)
  } else {
    timeNow = parseInt(`${new Date().getHours()}${new Date().getMinutes()}`)
  }
}, 5000);     //5s
setInterval(async () => {   // Verificação de horarios 
  console.log("[INFO] - Verificando horarios")
  if (timeNow == cfg.end_mat + 10 || timeNow == cfg.end_ves + 10 || timeNow == cfg.end_not + 10) {
    console.log("[INFO] - Desligamento geral")
    salas.map(async (sala, indice) => {
      try {
        let response = await action(sala, false)
        if (response) {
          salas[indice].presence = false
          salas[indice].reservada = false
        }
      } catch (error) {
        console.log(`[ERROR] - ${error}`)
      }
    })
  } else if (timeNow == convertTime(cfg.mat_aula1) - 10) {
    computed(1, 1)
  } else if (timeNow == convertTime(cfg.mat_aula2) - 10) {
    computed(1, 2)
  } else if (timeNow == convertTime(cfg.mat_aula3) - 10) {

    computed(1, 3)
  } else if (timeNow == convertTime(cfg.mat_aula4) - 10) {
    computed(1, 4)
  } else if (timeNow == convertTime(cfg.ves_aula1) - 10) {
    computed(2, 1)
  } else if (timeNow == convertTime(cfg.ves_aula2) - 10) {
    computed(2, 2)
  } else if (timeNow == convertTime(cfg.ves_aula3) - 10) {
    computed(2, 3)
  } else if (timeNow == convertTime(cfg.ves_aula4) - 10) {
    computed(2, 4)
  } else if (timeNow == convertTime(cfg.not_aula1) - 10) {
    computed(3, 1)
  } else if (timeNow == convertTime(cfg.not_aula2) - 10) {
    computed(3, 2)
  } else if (timeNow == convertTime(cfg.not_aula3) - 10) {
    computed(3, 3)
  } else if (timeNow == convertTime(cfg.not_aula4) - 10) {
    computed(3, 4)
  } else { return }
}, 15000);    //15s
setInterval(() => {         // Verificando presença e acionando
  salas.map(async (sala, indice) => {
    if (sala.reservada == false) {
      if (sala.tipoar.length != 0) {                // Se tiver ar condicionado na sala
        if (sala.ipesp != null) {                   // Se tiver um endereço pro ESP
          try {
            let preseca = await getPresence(sala)
            if (preseca == true) {                  // Se detectar presença
              if (sala.presence == false) {         // Se for uma nova presença aciona
                let response = action(sala, true)
                if (response) salas[indice].presence = true
                console.log(`[INFO] - Nova presença sala ${sala.nome}`)
              } else { return }
            } else {
              if (sala.presence == true) {          // Se for detectado uma nova ausencia desliga
                let response = action(sala, false)
                if (response) salas[indice].presence = false
                console.log(`[INFO] - Nova ausencia sala ${sala.nome}`)
              } else { return }
            }
          } catch (error) {
            console.log(`ERRO -${error}`)
          }
        } else { return }
      } else { return }
    } else { return }
  })
}, 5000);     //5s

// FUNÇÕES DE AÇÃO
async function action(sala, acao) {   // Parametro sala vem dados da sala e ação se para ligar ou desligar
  let commands = [];                  // Lista de comandos a serem executados
  console.log("[INFO] - Criando comandos")
  // Criando comandos
  sala.tipoar.map(tipo => {
    controles.map(controle => {
      if (controle.nome == tipo) {
        if (acao == true) {             // Comando ligar 22 graus
          commands.push({
            length: controle.length,
            code: controle.comandos[1]
          })
          console.log("[INFO] - Comando de ligamento criado")
        } else {                        // Comando de desligar
          commands.push({
            length: controle.length,
            code: controle.comandos[0]
          })
        }
        console.log("[INFO] - Comando de desligamento criado")
      } else {
        return
      }
    })
  })

  console.log("[INFO] - Execultando comandos")
  commands.map(async (command) => {
    try {
      await axios.post(`http://${sala.ipesp}/emissor?${command.length}=${command.code}`)
      return true
    } catch (error) {
      console.log(`[ERRO] - Não possível enviar comando para IP ${sala.nome}`);
      return false
    }
  })
}
async function getPresence(sala) {    // Função que faz requisição de presenca
  console.log("[INFO] - Buscando presença")
  try {
    var { data } = await axios.get('http://' + sala.ipesp + '/presence')
    return data
  } catch (error) {
    console.log(`[ERROR] - ${error}`);
    return null
  }
}
async function getReservas() {        // Função que faz requisições de reservas
  console.log("[INFO] - Buscando dados de reservas")
  let today = `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDay()}`
  try {
    const { data } = await axios.get(`http://${config.BASE_POSTGREST}/reserva?data_reserva=eq.${today}`)
    return data
  } catch (error) {
    console.log(`[ERRO] - ${error}`)
    return null
  }
}
function convertTime(time) {          // Conversão de horas
  let result = time - (new Date().getHours() * 100)
  if (100 < result || result < 10) {
    return time - 40
  } else if (result == 0) {
    return time - 40
  } else {
    return time
  }
}
function buscaDados() {               // Função que faz busca de dados
  try {
    controles = require('./controles.json')
    salas = require('./salas.json')
    cfg = require('./config.json')
    console.log('[INFO] - Dados obtidos de ambiente')
  } catch (error) {
    console.log(`[ERRO] - ${error}`)
  }
}

//FUNÇÕES DE MANIPULAÇÃO E VALIDAÇÃO
async function computed(periodo, aula) {    // Função valida dados e chama função de acionamento
  console.log("[INFO] - Consultando reservas")
  // reservas = await getReservas()
  if (reservas != null) {
    if (periodo == 1) {
      reservas.map(reserva => {
        let list_aulas = [reserva.mat_aula1, reserva.mat_aula2, reserva.mat_aula3, reserva.mat_aula4]
        if (aula == 1) {
          if (list_aulas[0] == true) {
            salas.map(async (sala, indice) => {
              if (sala.id == reserva.objeto_id) {
                if (sala.presence == false) {
                  let response = await action(sala, true)
                  if (response) {
                    salas[indice].reservada = true
                    await posInit(sala, indice)
                  } else { return }
                } else { return }
              } else { return }
            })
          }
        } else if (aula == 2) {
          if (list_aulas[1] == true) {
            salas.map(async (sala, indice) => {
              if (sala.id == reserva.objeto_id) {
                if (sala.presence == false) {
                  let response = await action(sala, true)
                  if (response) {
                    salas[indice].reservada = true
                    await posInit(sala, indice)
                  } else { return }
                } else { return }
              } else { return }
            })
          } else {
            return
          }
        } else if (aula == 3) {
          if (list_aulas[2] == true) {
            salas.map(async (sala, indice) => {
              if (sala.id == reserva.objeto_id) {
                if (sala.presence == false) {
                  let response = await action(sala, true)
                  if (response) {
                    salas[indice].reservada = true
                    await posInit(sala, indice)
                  } else { return }
                } else { return }
              } else { return }
            })
          }
        } else if (aula == 4) {
          if (list_aulas[3] == true) {
            salas.map(async (sala, indice) => {
              if (sala.id == reserva.objeto_id) {
                if (sala.presence == false) {
                  let response = await action(sala, true)
                  if (response) {
                    salas[indice].reservada = true
                    await posInit(sala, indice)
                  } else { return }
                } else { return }
              } else { return }
            })
          }
        }
      })
    } else if (periodo == 2) {
      reservas.map(reserva => {
        let list_aulas = [reserva.vesp_aula1, reserva.vesp_aula2, reserva.vesp_aula3, reserva.vesp_aula4]
        if (aula == 1) {
          if (list_aulas[0] == true) {
            salas.map(async (sala, indice) => {
              if (sala.id == reserva.objeto_id) {
                if (sala.presence == false) {
                  let response = await action(sala, true)
                  if (response) {
                    salas[indice].reservada = true
                    await posInit(sala, indice)
                  } else { return }
                } else { return }
              } else { return }
            })
          }
        } else if (aula == 2) {
          if (list_aulas[1] == true) {
            salas.map(async (sala, indice) => {
              if (sala.id == reserva.objeto_id) {
                if (sala.presence == false) {
                  let response = await action(sala, true)
                  if (response) {
                    salas[indice].reservada = true
                    await posInit(sala, indice)
                  } else { return }
                } else { return }
              } else { return }
            })
          }
        } else if (aula == 3) {
          if (list_aulas[2] == true) {
            salas.map(async (sala, indice) => {
              if (sala.id == reserva.objeto_id) {
                if (sala.presence == false) {
                  let response = await action(sala, true)
                  if (response) {
                    salas[indice].reservada = true
                    await posInit(sala, indice)
                  } else { return }
                } else { return }
              } else { return }
            })
          }
        } else if (aula == 4) {
          if (list_aulas[3] == true) {
            salas.map(async (sala, indice) => {
              if (sala.id == reserva.objeto_id) {
                if (sala.presence == false) {
                  if (sala.reservada == false) {
                    await action(sala, true)
                    salas[indice].reservada = true
                    await posInit(sala, indice)
                  } else { return }
                } else { return }
              } else { return }
            })
          }
        }
      })
    } else if (periodo == 3) {
      reservas.map(reserva => {
        let list_aulas = [reserva.not_aula1, reserva.not_aula2, reserva.not_aula3, reserva.not_aula4]
        if (aula == 1) {
          if (list_aulas[0] == true) {
            salas.map(async (sala, indice) => {
              if (sala.id == reserva.objeto_id) {
                if (sala.presence == false) {
                  let response = await action(sala, true)
                  if (response) {
                    salas[indice].reservada = true
                    await posInit(sala, indice)
                  } else { return }
                } else { return }
              } else { return }
            })
          }
        } else if (aula == 2) {
          if (list_aulas[1] == true) {
            salas.map(async (sala, indice) => {
              if (sala.id == reserva.objeto_id) {
                if (sala.presence == false) {
                  let response = await action(sala, true)
                  if (response) {
                    salas[indice].reservada = true
                    await posInit(sala, indice)
                  } else { return }
                } else { return }
              } else { return }
            })
          }
        } else if (aula == 3) {
          if (list_aulas[2] == true) {
            salas.map(async (sala, indice) => {
              if (sala.id == reserva.objeto_id) {
                if (sala.presence == false) {
                  let response = await action(sala, true)
                  if (response) {
                    salas[indice].reservada = true
                    await posInit(sala, indice)
                  } else { return }
                } else { return }
              } else { return }
            })
          }
        } else if (aula == 4) {
          if (list_aulas[3] == true) {
            salas.map(async (sala, indice) => {
              if (sala.id == reserva.objeto_id) {
                if (sala.presence == false) {
                  let response = await action(sala, true)
                  if (response) {
                    salas[indice].reservada = true
                    await posInit(sala, indice)
                  } else { return }
                } else { return }
              } else { return }
            })
          }
        }
      })
    } else {
      return
    }
  } else {
    return
  }
}
async function posInit(sala, indice) {      // Função de agendamento de busca de presença e desligamento
  setTimeout(async () => {
    console.log("[INFO] - Busca de presença agendada")
    let resposta = await getPresence(sala)
    if (resposta == false) {
      try {
        await action(sala, false)
        salas[indice].reservada = false
        console.log("[INFO] - Sem presença")
      } catch (error) {
        console.log(`[ERRO] - ${error}`)
      }
    } else {
      salas[indice].reservada = false
      salas[indice].presence = true
      console.log("[INFO] - Com presença")
      return
    }
  }, 45000);
}