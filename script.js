const axios = require('axios').default;

// Variaveis
var dadosLocais = loadLocaData()
var controles = dadosLocais.controles
var salas = dadosLocais.salas
var horaAtual;

// Busca de dados locais
function loadLocaData() {
  return require('./dados.json')                       // Busca arquivos locais
}
// Faz atualização das hora a cada 30s
setInterval(() => {
  horaAtual = new Date().getHours() + new Date().getMinutes()
}, 10000);
// Função que faz o acionamento do ar
async function action(sala, acao) {   // Parametro sala vem dados da sala e ação se para ligar ou desligar
  let commands = [];    // Lista de comandos a serem executados

  // Criando comandos
  sala.tipoar.map(tipo => {           // Para cada tipo de ar que há na sala
    controles.map(controle => {
      if (controle.modelo == tipo) {  // Compara cada modelo de ar com o ar da sala
        if (acao == 1) {              // Se um pega comando de ligar com temperatura 22
          commands.push({
            length: controle.length,
            code: controle.act22
          })
        } else {                      // Se um pega comando de desligar
          commands.push({
            length: controle.length,
            code: controle.actoff
          })
        }
      }
    })
  })

  // Executando comandos
  commands.map(async (command) => {
    try {
      // Caminho para as requisições
      // `http://${sala.ipesp}/emissor?${command.length}=${command.code}`
      await axios.post(`http://${sala.ipesp}/emissor?${command.length}=${command.code}`)
    } catch (error) {
      console.log(error);
    }
  })
}
// Função que faz getHttp da presensa
async function httpGet(sala) {
  try {
    return await axios.get('http://' + sala.ipesp + '/presence')
  } catch (error) {
    console.log(error);
  }
}

// Verifica se o arquivo de dados local foi alterado a cada 5min
setInterval(() => {
  if (dadosLocais.atualizar == true) {
    dadosLocais = loadLocaData()
    controles = dadosLocais.controles
    salas = dadosLocais.salas
  }
}, 300000);
// Busca de presença a cada 5min e aciona o arcondicioando caso haja
setInterval(() => {
  salas.map(async (sala, indice) => {
    if (sala.tipoar.length != 0) {          // Se tiver ar condicionado na sala
      if (sala.ipesp != null) {             // Se tiver um endereço pro ESP
        var info = await httpGet(sala)
        if (info.data == true) {            // Se detectar presença
          if (sala.presence == false) {     // Se for uma nova presença aciona
            console.log("ligando")
            salas[indice].presence = true
            action(sala, 1)
          } else {                           // Se não for uma nova presensa retorna
            return
          }
        } else {
          if (sala.presence == true) {       // Se for detectado uma nova ausencia desliga
            console.log("desligando")
            salas[indice].presence = false
            action(sala, 0)
          } else {                            // Se não for uma nova ausencia retorna
            return
          }
        }
      }
    } else {
      return
    }
  })
}, 5000);