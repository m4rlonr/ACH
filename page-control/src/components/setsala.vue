<template>
  <v-container fluid>
    <v-row>
      <v-icon
        color="green darken-1"
        dark
        @click.stop="loadSelect"
      >
        mdi-cog-outline
      </v-icon>

      
      <v-dialog
        v-model="dialog"
        max-width="600"
      >
        <v-card class="display= block">
          <v-container fluid>
            <v-card-title class="headline">
              Configurações individuais de sala
            </v-card-title>

            <v-card-text>
              <v-container fluid>
                <v-row>
                  <v-col>
                    <v-text-field
                      label="Modelo"
                      v-model="item.nome"
                    />
                  </v-col>
                  <v-col>
                    <v-text-field
                      label="IP do ESP"
                      v-model="item.ipesp"
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col
                    cols="12"
                    sm=""
                  >
                    <v-select
                      v-model="selectValues"
                      :items="selectItens"
                      attach
                      chips
                      label="Tipos de ar"
                      multiple
                    ></v-select>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>

              <v-btn
                color="green darken-1"
                text
                @click="dialog = false"
              >
                Salvar
              </v-btn>
              <v-btn
                color="green darken-1"
                text
                @click="dialog = false"
              >
                Fechar
              </v-btn>
            </v-card-actions>
          </v-container>
        </v-card>
      </v-dialog>
    </v-row>
  </v-container>
</template>

<script>
  import Controles from "../../../controles.json"

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
        selectItens: [],
        selectValues: [""],
      }
    },
    methods: {
      loadSelect () {
        this.dialog = true
        Controles.map(item => {
          this.selectItens.push(item.nome)
        })
        if(this.item.tipoar.length !== 0){
          this.selectValues = this.item.tipoar
        }
      }
    }
  }
</script>