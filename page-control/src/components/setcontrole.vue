<template>
  <v-row>
    <v-icon
      @click="() => {}"
      color="green darken-1"
      dark
      @click.stop="dialog = true"
    >
      mdi-cog-outline
    </v-icon>

    
    <v-dialog
      v-model="dialog"
      max-width="80%"
    >
      <v-card>
        <v-card-title class="headline">
          Configurações individuais de controle
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
                  label="Tamanho do comando"
                  v-model="item.length"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-text-field
                  label="Comando OFF"
                  v-model="item.comandos[0]"
                />
                <v-text-field
                  label="Comando de 22 graus"
                  v-model="item.comandos[1]"
                />
                <v-text-field
                  label="Comando de 23 graus"
                  v-model="item.comandos[2]"
                />
              </v-col>
              <v-col>
                <v-text-field
                  label="Comando de 24 graus"
                  v-model="item.comandos[3]"
                />
                <v-text-field
                  label="Comando de 25 graus"
                  v-model="item.comandos[4]"
                />
                <v-text-field
                  label="Comando de 26 graus"
                  v-model="item.comandos[5]"
                />
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            color="green darken-1"
            text
            @click="savefile"
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
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
  import { saveAs } from "file-saver"

  export default {
    props: {
      item: {
        type: Object,
        default: null,
      }
    },
    data () {
      return {
        dialog: false,
      }
    },
    methods: {
      savefile() {
        var file = new Blob(["Hello, world!"], {type: "text/json;charset=utf-8"});
        saveAs(file, `nome.json`);
        this.dialog = false
      }
    }
  }
</script>