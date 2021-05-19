// Importação do axios
const axios = require('axios').default;

// Variaveis ambiente
var controles = require('./controles.json')
var salas = require('./salas.json')
var config = require('./config.json')
var reservas = null

// Atualização de horas
var timeNow = null
setInterval(() => {
  timeNow = parseInt(`${new Date().getHours()}${new Date().getMinutes()}`)
}, 5000);

// Acionamento automatico de ar com base em reservas e desligamento geral
setInterval(async () => {
  if (timeNow == config.end_matutino + 10 ||
    timeNow == config.end_vespertino + 10 ||
    timeNow == config.end_noturno + 10) {
    salas.map(async (sala, indice) => {
      try {
        let response = await action(sala, false)
        if (response) salas[indice].presence = false
      } catch (error) {
        console.log(error)
      }
    })
  } else if (timeNow == config.init_matutino - 10) {
    computed(true, 1)
  } else if (timeNow == config.init_vespertino - 10) {
    computed(true, 2)
  } else if (timeNow == config.init_noturno - 10) {
    computed(true, 3)
  } else if (timeNow == config.end_matutino + 10) {
    computed(false, null)
  } else if (timeNow == config.end_vespertino + 10) {
    computed(false, null)
  } else if (timeNow == config.end_noturno + 10) {
    computed(false, null)
  }
}, 45000); // 45 sec

// Acionamento de ar com base em presença
setInterval(() => {
  salas.map(async (sala, indice) => {
    if (sala.tipoar.length != 0) {          // Se tiver ar condicionado na sala
      if (sala.ipesp != null) {             // Se tiver um endereço pro ESP
        try {
          let preseca = await getPresence(sala)
          if (preseca == true) {            // Se detectar presença
            if (sala.presence == false) {     // Se for uma nova presença aciona
              let response = action(sala, true)
              if (response) salas[indice].presence = true
            } else {                           // Se não for uma nova presença retorna
              return
            }
          } else {
            if (sala.presence == true) {       // Se for detectado uma nova ausencia desliga
              let response = action(sala, false)
              if (response) salas[indice].presence = false
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
          console.log(`Ativando ${controle.nome}`)
        } else {                        // Comando de desligar
          commands.push({
            length: controle.length,
            code: controle.comandos[0]
          })
          console.log(`Desativando ${controle.nome}`)
        }
      }
    })
  })

  // Executando comandos
  commands.map(async (command) => {
    try {
      await axios.post(`http://${sala.ipesp}/emissor?${command.length}=${command.code}`)
      return true
    } catch (error) {
      console.log(`ERRO - Não possível enviar comando para IP${sala.ipesp}`);
      return false
    }
  })
}

// Função que faz requisição de presenca
async function getPresence(sala) {
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
async function computed(moment, e) {
  reservas = await getReservas()
  if (reservas != null) {
    if (moment == true) {
      if (e == 1) {
        reservas.map(reserva => {
          if (reserva.mat_aula1 == true) {
            salas.map(async sala => {
              if (sala.id == reserva.objeto_id) {
                await action(sala, true)
              }
            })
          }
        })
      } else if (e == 2) {
        reservas.map(reserva => {
          if (reserva.vesp_aula1 == true) {
            salas.map(async sala => {
              if (sala.id == reserva.objeto_id) {
                await action(sala, true)
              }
            })
          }
        })
      } else {
        reservas.map(reserva => {
          if (reserva.not_aula1 == true) {
            salas.map(async sala => {
              if (sala.id == reserva.objeto_id) {
                await action(sala, true)
              }
            })
          }
        })
      }
    } else {
      reservas.map(reserva => {
        salas.map(async sala => {
          if (sala.id == reserva.objeto_id) {
            let preseca = await getPresence(sala)
            if (!preseca) await action(sala, false)
          }
        })
      })
    }
  } else {
    return
  }
}