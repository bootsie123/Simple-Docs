<template>
  <div class="stepContainer">
    <SetupStep
      title="Select your UXP plugin directory"
      label="On Windows this is usually "
      labelHighlight="%appdata%\Adobe\UXP\Plugins\External"
      @click="promptPluginDir('uxp')"
      :success="uxpToken.length > 0"
    />
    <SetupStep
      title="Select your CEP plugin directory"
      label="On Windows this is usually "
      labelHighlight="C:\Program Files (x86)\Common Files\Adobe\CEP\extensions"
      @click="promptPluginDir('cep')"
      :success="cepToken.length > 0"
    />
    <div class="submitContainer">
      <sp-button @click="$emit('setupComplete', { uxpToken, cepToken })" :disabled="!uxpToken && !cepToken">
        Finish Setup
      </sp-button>
    </div>
  </div>
</template>

<script>
  import { storage } from "uxp";

  import SetupStep from "@/components/SetupStep";

  const fs = storage.localFileSystem;

  export default {
    name: "Setup",
    props: {},
    components: {
      SetupStep
    },
    data() {
      return {
        uxpToken: localStorage.getItem("uxpToken") || "",
        cepToken: localStorage.getItem("cepToken") || ""
      };
    },
    methods: {
      async promptPluginDir(type) {
        const pluginDir = await fs.getFolder();

        if (pluginDir) {
          if (type === "uxp") {
            this.uxpToken = await fs.createPersistentToken(pluginDir);

            localStorage.setItem("uxpToken", this.uxpToken);
          } else if (type === "cep") {
            this.cepToken = await fs.createPersistentToken(pluginDir);

            localStorage.setItem("cepToken", this.cepToken);
          }
        }
      }
    }
  };
</script>

<style lang="css" scoped>
  .stepContainer {
    text-align: left;
  }

  .stepContainer * {
    margin-bottom: 3em;
  }

  .submitContainer {
    text-align: center;
  }
</style>
