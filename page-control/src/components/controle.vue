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
            <div class="font-weight-medium">Modelos:</div>
            <div class="font-weight-medium" v-for="item in comandosAres" :key="item.nome"> {{ item.nome }}</div>
            <v-divider />
          </template>
        </v-card-text>

        <v-card-text class="d-flex justify-center align-center">
          <v-btn
            v-for="i in 7"
            :key="i"
            class="mx-2"
            fab
            small
            color="green darken-1"
          >
            <v-icon dark>
              mdi-power
            </v-icon>
          </v-btn>
        </v-card-text>
        
        <v-card-actions>
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
      }
    }
  }
</script>