<template>
  <div id="app">
    <div v-if="plugins.length < 1" class="container">
      <sp-heading class="heading" size="L">UXP Plugin Info</sp-heading>
      <sp-divider class="divider"></sp-divider>
      <sp-detail>Welcome to UXP Plugin Info! Locate your plugin directory to get started!</sp-detail>
      <sp-button class="button" @click="start">{{ pluginToken ? "Continue" : "Load Plugins" }}</sp-button>
      <sp-button v-if="pluginToken" class="button" size="xxs" variant="secondary" @click="promptPluginDir" quiet>
        Reload Plugins
      </sp-button>
    </div>
    <div v-else class="list">
      <Plugin v-for="(plugin, i) in plugins" :key="i" :plugin="plugin" />
    </div>
  </div>
</template>

<script>
  import Plugin from "@/components/Plugin";
  import { storage } from "uxp";

  const fs = storage.localFileSystem;

  export default {
    name: "App",
    components: {
      Plugin
    },
    data() {
      return {
        plugins: [],
        pluginToken: localStorage.getItem("pluginToken")
      };
    },
    methods: {
      async start() {
        if (this.pluginToken) {
          try {
            const pluginDir = await fs.getEntryForPersistentToken(this.pluginToken);

            this.loadPlugins(pluginDir);
          } catch (err) {
            console.error(err);

            this.promptPluginDir();
          }
        } else {
          this.promptPluginDir();
        }
      },
      async promptPluginDir() {
        const pluginDir = await fs.getFolder();

        if (pluginDir) {
          this.pluginToken = await fs.createPersistentToken(pluginDir);

          localStorage.setItem("pluginToken", this.pluginToken);

          this.loadPlugins(pluginDir);
        }
      },
      async loadPlugins(pluginDir) {
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

        /*let app;

        if (host.name === "Photoshop") {
          app = "PS";
        } else {

        }*/

        this.plugins = (await Promise.all(plugins)).filter(plugin => plugin?.manifest?.host?.app === "PS");
      }
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
    overflow: auto;
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
    margin-top: 2em;
  }

  .button:last-child {
    margin-top: 1em;
    font-size: 1.1em;
  }

  .list {
    padding-bottom: 1em;
  }
</style>
