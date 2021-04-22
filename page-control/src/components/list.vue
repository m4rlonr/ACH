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
          <template v-if="typecontrol == true">
            <v-list-item-action >
              <SetSala :item="item" />
            </v-list-item-action>
            <v-list-item-action>
              <Control :item="item" />
            </v-list-item-action>
          </template>
          <template v-else>
            <v-list-item-action>
              <SetControle :item="item" />
            </v-list-item-action>
          </template>
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
  import Control from "./controle"
  import SetSala from "./setsala"
  import SetControle from "./setcontrole"

  export default {
    props: {
      listContent: Array,
      typecontrol: Boolean,
    },
    components : {
      SetSala,
      Control,
      SetControle
    }
  }
</script>