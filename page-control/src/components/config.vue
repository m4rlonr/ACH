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
      max-width="290"
    >
      <v-card>
        <v-card-title class="headline">
          Configurações
        </v-card-title>

        <v-card-text>
          Let Google help apps determine location. This means sending anonymous location data to Google, even when no apps are running.
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
      }
    },
  }
</script>