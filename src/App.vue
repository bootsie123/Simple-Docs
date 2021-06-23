<template>
  <div id="app">
    <div v-if="plugins.length < 1" class="container">
      <sp-heading class="heading" size="L">Simple Docs</sp-heading>
      <sp-divider class="divider"></sp-divider>
      <sp-detail>Welcome to Simple Docs! Locate your plugin directory to get started!</sp-detail>
      <sp-button class="button" varient="cta" @click="loadPlugins">Load Plugins</sp-button>
    </div>
    <div v-else class="list">
      <Plugin v-for="(plugin, i) in plugins" :key="i" :plugin="plugin" />
    </div>
  </div>
</template>

<script>
  import Plugin from "@/components/Plugin";
  import uxp from "uxp";

  const fs = uxp.storage.localFileSystem;

  export default {
    name: "App",
    components: {
      Plugin
    },
    data() {
      return {
        plugins: []
      };
    },
    methods: {
      async loadPlugins() {
        const pluginDir = await fs.getFolder();

        if (pluginDir) {
          const plugins = (await pluginDir.getEntries()).map(async plugin => {
            if (!plugin.isFolder) return false;

            const manifest = (await plugin.getEntries()).find(entry => entry.name === "manifest.json");

            if (!manifest) return false;

            try {
              const json = JSON.parse(await manifest.read());

              return {
                id: json.id,
                name: json.name,
                version: json.version,
                manifest: json,
                folder: plugin
              };
            } catch (err) {
              console.error(err);

              return false;
            }
          });

          this.plugins = (await Promise.all(plugins)).filter(plugin => plugin);
        }
      },
      getManifest() {},
      getPluginInfo() {}
    }
  };
</script>

<style>
  #app {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    padding: 12px;
    height: 100%;
  }

  html,
  body {
    margin: 0;
    height: 100%;
    width: 100%;
  }

  .heading {
    margin-top: 0;
  }

  .divider {
    margin-top: 0.5em;
    margin-bottom: 0.75em;
    max-width: 50%;
  }

  .container {
    display: flex;
    flex-flow: column;
    text-align: center;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .button {
    margin-top: 1em;
  }
</style>
