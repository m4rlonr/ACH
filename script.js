var controles = null;
var reservas = null;
let data = new Date()
let horario = Date.now()

if (controles == null) {
  var response = require('./dados2.json')
  console.log(response.controles[0].act22)
}

// Primeira consulta 7:40
// Ligamento 07:50
// Desligamento se não tiver presença 8:10
// Desligamento 11:10
// ----------------------------------------------
// Segunda consulta 12:40
// Ligamento 12:50
// Desligamento se não tiver presença 13:10
// Desligamento 17:10
// ----------------------------------------------
// Terceira consulta 18:40
// Ligamento 18:50
// Desligamento se não tiver presença 19:10
// Desligamento 23:10

function compararHora(hora1, hora2) {
  hora1 = hora1.split(":");
  hora2 = hora2.split(":");

  var d = new Date();
  var data1 = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hora1[0], hora1[1]);
  var data2 = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hora2[0], hora2[1]);

  return data1 > data2;
};