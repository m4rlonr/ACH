console.log("[INFO] - Aguarde, iniciando...")
// Importação do axios
const axios = require('axios').default;

// Variaveis ambienteconsole.log("[INFO] - Buscando impostações")
var controles = require('./controles.json')
var salas = require('./salas.json')
var cfg = require('./config.json')
// var reservas = null
var reservas = require('./objeto.json')

// Atualização de horas
console.log("[INFO] - Obtendo horas")
var timeNow = null
setInterval(() => {
  if (new Date().getMinutes() < 10) {
    timeNow = parseInt(`${new Date().getHours()}0${new Date().getMinutes()}`)
  } else if (new Date().getMinutes() == 0) {
    timeNow = parseInt(`${new Date().getHours()}00`)
  } else {
    timeNow = parseInt(`${new Date().getHours()}${new Date().getMinutes()}`)
  }
}, 5000);

// Acionamento automatico de ar com base em reservas e desligamento geral
setInterval(async () => {
  console.log("[INFO] - Verificando reservas")
  // Verificando de final de aula para desligar geral
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
        console.log(error)
      }
    })
  }

  // Verificando de inicio de aula matutino para acionamento
  if (timeNow == convertTime(cfg.mat_aula1) - 10) {
    computed(1, 1)
  } else if (timeNow == convertTime(cfg.mat_aula2) - 10) {
    computed(1, 2)
  } else if (timeNow == convertTime(cfg.mat_aula3) - 10) {
    computed(1, 3)
  } else if (timeNow == convertTime(cfg.mat_aula4) - 10) {
    computed(1, 4)
  }

  // Verificando de inicio de aula vespertino para acionamento
  if (timeNow == convertTime(cfg.ves_aula1) - 10) {
    computed(2, 1)
  } else if (timeNow == convertTime(cfg.ves_aula2) - 10) {
    computed(2, 2)
  } else if (timeNow == convertTime(cfg.ves_aula3) - 10) {
    computed(2, 3)
  } else if (timeNow == convertTime(cfg.ves_aula4) - 10) {
    computed(2, 4)
  }

  // Verificando de inicio de aula noturno para acionamento
  if (timeNow == convertTime(cfg.not_aula1) - 10) {
    computed(3, 1)
  } else if (timeNow == convertTime(cfg.not_aula2) - 10) {
    computed(3, 2)
  } else if (timeNow == convertTime(cfg.not_aula3) - 10) {
    computed(3, 3)
  } else if (timeNow == convertTime(cfg.not_aula4) - 10) {
    computed(3, 4)
  }
}, 15000); // 15 sec

// Acionamento de ar com base em presença
setInterval(() => {
  salas.map(async (sala, indice) => {
    if (sala.reservada == false) {
      if (sala.tipoar.length != 0) {          // Se tiver ar condicionado na sala
        if (sala.ipesp != null) {             // Se tiver um endereço pro ESP
          try {
            let preseca = await getPresence(sala)
            if (preseca == true) {            // Se detectar presença
              if (sala.presence == false) {     // Se for uma nova presença aciona
                let response = action(sala, true)
                if (response) {
                  salas[indice].presence =
                    salas[indice].reservada = true
                  await posInit(sala, indice)
                }
                console.log(`[INFO] - Nova presença ${sala.nome}`)
              } else {                           // Se não for uma nova presença retorna
                return
              }
            } else {
              if (sala.presence == true) {       // Se for detectado uma nova ausencia desliga
                let response = action(sala, false)
                if (response) salas[indice].presence = false
                console.log(`[INFO] - Nova ausencia ${sala.nome}`)
              } else {                            // Se não for uma nova ausencia retorna
                return
              }
            }
          } catch (error) {
            console.log(`ERRO - Erro na verificação de presença sala ${sala.nome}`)
          }
        }
      } else {
        return
      }
    } else {
      return
    }
  })
}, 5000); // 5s

// Função que faz o acionamento do ar
async function action(sala, acao) {   // Parametro sala vem dados da sala e ação se para ligar ou desligar
  let commands = [];                  // Lista de comandos a serem executados

  // Criando comandos
  sala.tipoar.map(tipo => {
    controles.map(controle => {
      if (controle.nome == tipo) {
        if (acao == true) {             // Comando ligar 22 graus
          commands.push({
            length: controle.length,
            code: controle.comandos[1]
          })
          console.log(`[INFO] - Ativando ${controle.nome}`)
        } else {                        // Comando de desligar
          commands.push({
            length: controle.length,
            code: controle.comandos[0]
          })
          console.log(`[INFO] - Desativando ar ${controle.nome}`)
        }
      }
    })
  })

  // Executando comandos
  commands.map(async (command) => {
    try {
      await axios.post(`http://${sala.ipesp}/emissor?${command.length}=${command.code}`)
      console.log("[INFO} - Comando enviado")
      return true
    } catch (error) {
      console.log(`ERRO - Não possível enviar comando para IP${sala.ipesp}`);
      return false
    }
  })
}

// Função que faz requisição de presenca
async function getPresence(sala) {
  console.log("[INFO] - Buscando presença")
  try {
    const { data } = await axios.get('http://' + sala.ipesp + '/presence')
    return data
  } catch (error) {
    console.log(`ERROR - Requisição de presensa ${sala.nome}`);
    return null
  }
}

// Função que faz requisições de reservas
async function getReservas() {
  console.log("[INFO] - Buscando dados de reservas")
  let today = `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDay()}`
  try {
    const { data } = await axios.get(`http://${config.BASE_POSTGREST}/reserva?data_reserva=eq.${today}`)
    return data
  } catch (error) {
    console.log(`ERRO - Requisição de reservas feita sem sucesso`)
    return null
  }
}

// Função valida dados e chama função de acionamento
async function computed(periodo, aula) {
  console.log("[INFO] - Validando dados de reservas e acionando")
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
                    salas[indice].presence = true
                    salas[indice].reservada = true
                    await posInit(sala, indice)
                  }
                }
              }
            })
          }
        } else if (aula == 2) {
          if (list_aulas[1] == true) {
            salas.map(async (sala, indice) => {
              if (sala.id == reserva.objeto_id) {
                if (sala.presence == false) {
                  let response = await action(sala, true)
                  if (response) {
                    salas[indice].presence = true
                    salas[indice].reservada = true
                    await posInit(sala, indice)
                  }
                }
              }
            })
          }
        } else if (aula == 3) {
          if (list_aulas[2] == true) {
            salas.map(async (sala, indice) => {
              if (sala.id == reserva.objeto_id) {
                if (sala.presence == false) {
                  let response = await action(sala, true)
                  if (response) {
                    salas[indice].presence = true
                    salas[indice].reservada = true
                    await posInit(sala, indice)
                  }
                }
              }
            })
          }
        } else if (aula == 4) {
          if (list_aulas[3] == true) {
            salas.map(async (sala, indice) => {
              if (sala.id == reserva.objeto_id) {
                if (sala.presence == false) {
                  let response = await action(sala, true)
                  if (response) {
                    salas[indice].presence = true
                    salas[indice].reservada = true
                    await posInit(sala, indice)
                  }
                }
              }
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
                  let response = action(sala, true)
                  if (response) {
                    salas[indice].presence = true
                    salas[indice].reservada = true
                    await posInit(sala, indice)
                  }
                }
              }
            })
          }
        } else if (aula == 2) {
          if (list_aulas[1] == true) {
            salas.map(async (sala, indice) => {
              if (sala.id == reserva.objeto_id) {
                if (sala.presence == false) {
                  let response = action(sala, true)
                  if (response) {
                    salas[indice].presence = true
                    salas[indice].reservada = true
                    await posInit(sala, indice)
                  }
                }
              }
            })
          }
        } else if (aula == 3) {
          if (list_aulas[2] == true) {
            salas.map(async (sala, indice) => {
              if (sala.id == reserva.objeto_id) {
                if (sala.presence == false) {
                  let response = action(sala, true)
                  if (response) {
                    salas[indice].presence = true
                    salas[indice].reservada = true
                    await posInit(sala, indice)
                  }
                }
              }
            })
          }
        } else if (aula == 4) {
          if (list_aulas[3] == true) {
            salas.map(async (sala, indice) => {
              if (sala.id == reserva.objeto_id) {
                if (sala.presence == false) {
                  let response = action(sala, true)
                  if (response) {
                    salas[indice].presence = true
                    salas[indice].reservada = true
                    await posInit(sala, indice)
                  }
                }
              }
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
                  let response = action(sala, true)
                  if (response) {
                    salas[indice].presence = true
                    salas[indice].reservada = true
                    await posInit(sala, indice)
                  }
                }
              }
            })
          }
        } else if (aula == 2) {
          if (list_aulas[1] == true) {
            salas.map(async (sala, indice) => {
              if (sala.id == reserva.objeto_id) {
                if (sala.presence == false) {
                  let response = action(sala, true)
                  if (response) {
                    salas[indice].presence = true
                    salas[indice].reservada = true
                    await posInit(sala, indice)
                  }
                }
              }
            })
          }
        } else if (aula == 3) {
          if (list_aulas[2] == true) {
            salas.map(async (sala, indice) => {
              if (sala.id == reserva.objeto_id) {
                if (sala.presence == false) {
                  let response = action(sala, true)
                  if (response) {
                    salas[indice].presence = true
                    salas[indice].reservada = true
                    await posInit(sala, indice)
                  }
                }
              }
            })
          }
        } else if (aula == 4) {
          if (list_aulas[3] == true) {
            salas.map(async (sala, indice) => {
              if (sala.id == reserva.objeto_id) {
                if (sala.presence == false) {
                  let response = action(sala, true)
                  if (response) {
                    salas[indice].presence = true
                    salas[indice].reservada = true
                    await posInit(sala, indice)
                  }
                }
              }
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

// Conversão de horas
function convertTime(time) {
  let result = time - (new Date().getHours() * 100)
  if (result < 10) {
    return time - 40
  } else if (result == 0) {
    return time - 40
  } else if (result > 100) {
    return time - 40
  } else {
    return time
  }
}

async function posInit(sala, indice) {
  setTimeout(async () => {
    let resposta = await getPresence(sala)
    if (resposta == false) {
      try {
        await action(sala, false)
        salas[indice].reservada = false
      } catch (error) {
        console.log(error)
      }
    } else {
      return
    }
  }, 1200000);
}