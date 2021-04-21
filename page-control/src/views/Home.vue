<template>
  <v-app id="inspire">
    <!-- <v-navigation-drawer
      v-model="drawer"
      app
    >
    </v-navigation-drawer> -->

    <v-app-bar app>
      <!-- <v-app-bar-nav-icon @click="drawer = !drawer" /> -->
      <v-toolbar-title>Painel de controle</v-toolbar-title>
    </v-app-bar>

    <v-main >
      <template >
        <v-row>
          <v-col cols="6">
            <List :listContent="salas" :typecontrol="true" />
          </v-col>
          <v-col cols="6">
            <List :listContent="controles" :typecontrol="false" />
          </v-col>
        </v-row>
      </template>
    </v-main>
  </v-app>
</template>

<script>
  import List from "@/components/list.vue"
  import controles from "../../../controles.json"
  import salas from "../../../salas.json"

  export default {
    components : {
      List
    },
    data: () => ({
      drawer: false,
      salas: [],
      controles: []
    }),
    async mounted() {
      this.salas = salas
      this.controles = controles
    }
  }
</script>