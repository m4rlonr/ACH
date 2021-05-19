<template>
  <v-row>
    <v-icon
      @click="openModal"
      color="green darken-1"
      dark
      @click.stop="dialog = true"
    >
      mdi-remote
    </v-icon>

    <v-dialog
      v-model="dialog"
      max-width="400"
    >
      <v-card>
        <v-card-title class="headline">
          Controle  remoto
        </v-card-title>

        <v-card-text>
          <p v-if="comandosAres.length === 0">Nenhum arcondicionado cadastrado</p>
        
          <template v-else>
            <h3>Modelos:</h3>
            <div v-for="item in comandosAres" :key="item.nome"> {{ item.nome }}</div>
            <v-divider />
          </template>
        </v-card-text>

        <v-card-text v-if="comandosAres.length !== 0" class="d-flex justify-center align-center ">
          <v-btn
            @click="sendComand(botao.code, item)"
            v-for="botao in botoes"
            :key="botao.nome"
            fab
            dark
            :color="botao.cor"
            class="ma-1"
          >
            {{botao.nome}}
          </v-btn>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            text
            @click="dialog = false"
          >
            Fechar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
  import controles from "../../../controles.json"
  import axios from "axios"
  
  export default {
    props: {
      item: {
        type: Object,
        default: null
      }
    },
    data () {
      return {
        dialog: false,
        controles: [],
        comandosAres: [],
        botoes: [
          {nome: "Power", cor:"red", code: 0},
          {nome: "22", cor:"green darken-1", code: 1},
          {nome: "23", cor:"green darken-1", code: 2},
          {nome: "24", cor:"green darken-1", code: 3},
          {nome: "25", cor:"green darken-1", code: 4},
          {nome: "26", cor:"green darken-1", code: 5},
        ]
      }
    },
    mounted() {
      this.controles = controles
    },
    watch: {
      dialog: function (val) {
        if(val === false) {
          this.comandosAres = []
        }
      }
    },
    methods : {
      openModal() { // Criar isso dentro de um método
        this.dialog = true
        if(this.item.tipoar.length !== 0) {
          this.item.tipoar.map((ar, count) => {
            this.controles.map(controle => {
              if(controle.nome === ar) {
                controle.id = count
                this.comandosAres.push(controle)
              }
            })
          })
        }
      },
      sendComand(code, device) {
        // Usar o axios para fazer as requisições
        this.comandosAres.map(async item => {
          await axios.post(`http://${device.ipesp}/emissor?${item.length}=${item.comandos[code]}`)
          // console.log({
          //   ip: device.ipesp,
          //   command: item.comandos[code],
          //   length: item.length
          // })
        })
      }
    }
  }
</script>