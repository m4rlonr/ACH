<template>
  <v-list two-line style="padding: 1rem">
    <v-list-item-group
      multiple
    >
      <template v-for="(item, count) in listContent">
        <v-list-item :key="item.nome" >
          <!-- Content -->
          <v-list-item-content>
            <v-list-item-title style="text-transform: uppercase;" v-text="item.nome"></v-list-item-title>
          </v-list-item-content>

          <!-- Actions -->
          <v-list-item-action >
            <Config :item="item"/>
          </v-list-item-action>
          <v-list-item-action v-if="typecontrol === true">
            <Control :item="item"/>
          </v-list-item-action>
        </v-list-item>
        <v-divider
          v-if="count < listContent.length - 1"
          :key="count"
        />
      </template>
    </v-list-item-group>
  </v-list>
</template>

<script>
  import Config from "./config"
  import Control from "./controle"

  export default {
    props: {
      listContent: Array,
      typecontrol: Boolean,
    },
    components : {
      Config,
      Control
    }
  }
</script>