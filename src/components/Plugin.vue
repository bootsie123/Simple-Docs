<template>
  <div class="plugin">
    <div class="pluginCard" @click="toggleDropdown">
      <img class="icon iconLight" :src="iconLight" />
      <img class="icon iconDark" :src="iconDark" />
      <sp-body size="S">{{ plugin.name }}</sp-body>
      <sp-icon class="chevron" :name="dropdown ? 'ui:ChevronDownSmall' : 'ui:ChevronRightSmall'" size="xs"></sp-icon>
    </div>
    <div v-if="dropdown" class="dropdown">
      <sp-divider class="dropdownDivider"></sp-divider>
      <div class="sideBySide">
        <img class="media" v-for="media in latestVersion.media" :key="media.id" :src="media.image.link" />
        <div class="container">
          <sp-detail>Author</sp-detail>
          <sp-label>{{ storeInfo.publisher.name }}</sp-label>
        </div>
        <div class="container">
          <sp-detail>Version</sp-detail>
          <sp-label>{{ latestVersion.version }} (installed {{ plugin.manifest.version }})</sp-label>
        </div>
        <div class="container">
          <sp-detail>Size</sp-detail>
          <sp-label>{{ calcSize(latestVersion.packageSize) }}</sp-label>
        </div>
      </div>
      <sp-detail class="heading">INFO</sp-detail>
      <sp-body class="body">{{ latestVersion.localizedMetadata[0].values.description }}</sp-body>
      <sp-detail class="heading">WHAT'S NEW</sp-detail>
      <sp-body class="body">{{ latestVersion.localizedMetadata[0].values.releaseNotes }}</sp-body>
      <sp-detail class="heading">CATEGORIES</sp-detail>
      <div class="body container categories">
        <sp-label class="category" v-for="category in categories" :key="category.id">
          {{ category.name }}
        </sp-label>
      </div>
      <sp-detail class="heading">TAGS</sp-detail>
      <div class="body container categories">
        <sp-label class="category" v-for="tag in storeInfo.localizedMetadata[0].values.keywords" :key="tag">
          {{ tag }}
        </sp-label>
      </div>
    </div>
  </div>
</template>

<script>
  import uxp from "uxp";
  import filesize from "filesize";

  export default {
    name: "Plugin",
    props: {
      plugin: Object
    },
    data() {
      return {
        iconLight: "",
        iconDark: "",
        dropdown: false,
        storeInfo: {},
        storeCategories: {}
      };
    },
    async mounted() {
      const icons = this.plugin.manifest.icons;

      if (icons) {
        for (const icon of icons) {
          const iconPath = icon.path.split(".");

          const entry = await this.plugin.folder.getEntry(iconPath[0] + "@1x." + iconPath[1]);
          const file = await entry.read({ format: uxp.storage.formats.binary });

          const src = `data:image/${iconPath[1]};base64,` + Buffer.from(file).toString("base64");

          if (icon.theme.includes("light")) {
            this.iconLight = src;
          } else if (icon.theme.includes("dark")) {
            this.iconDark = src;
          }
        }
      }

      this.getPluginInfo(this.plugin.manifest.id);
      this.getCategories();
    },
    methods: {
      toggleDropdown() {
        this.dropdown = !this.dropdown;
      },
      getPluginInfo(id) {
        fetch(`https://appregistry.adobe.io/myxchng/v1/apps?appId=${id}&api_key=APP_AdobeExchange_PROD`)
          .then(res => res.json())
          .then(data => {
            this.storeInfo = data.extensions;
          });
      },
      getCategories() {
        fetch("https://appregistry.azureedge.net/getUXPcategories")
          .then(res => res.json())
          .then(data => {
            this.storeCategories = data.categories;
          });
      },
      calcSize(num) {
        return filesize(num);
      }
    },
    computed: {
      latestVersion() {
        return this.storeInfo.versions[this.storeInfo.versions.length - 1];
      },
      categories() {
        return this.storeInfo.appTags.map(tag => {
          return this.storeCategories.find(category => category.id === tag.id);
        });
      }
    }
  };
</script>

<style lang="css" scoped>
  .pluginCard {
    display: flex;
    padding: 1em;
    border-radius: 4px;
    color: var(--uxp-host-text-color);
  }

  .plugin {
    margin: 0.4em 0;
    border: 1px solid;
    border-radius: 4px;
  }

  .pluginCard sp-body {
    margin: 0;
  }

  .pluginCard sp-button {
    padding: 0;
  }

  .icon {
    height: 24px;
    width: 24px;
    margin-right: 1em;
  }

  .chevron {
    color: var(--uxp-host-text-color-secondary);
    margin: auto 0.5em auto auto;
    align-self: flex-end;
  }

  .dropdown {
    padding: 0 1em 1em 1em;
  }

  .dropdown sp-divider {
    max-width: 95%;
    margin: auto;
    margin-bottom: 1em;
  }

  .sideBySide {
    display: flex;
    margin-bottom: 1em;
    flex-wrap: wrap;
    justify-content: space-around;
    align-items: center;
  }

  .container {
    display: flex;
    margin: 0.5em;
    flex-flow: row;
    align-items: center;
    gap: 1em;
  }

  .container sp-detail,
  .container sp-label {
    margin: 0;
    padding: 0;
    line-height: 0;
  }

  .container sp-detail {
    margin-right: 0.5em;
  }

  .categories {
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .category {
    margin: 0.5em !important;
    padding: 0.5em !important;
    border: 1px solid currentColor;
    border-radius: 4px;
    font-size: 1em;
  }

  .heading {
    width: fit-content;
    padding: 0.2em 0.45em 0.3em 0.55em;
    margin-bottom: 0.75em;
    border-radius: 4px;
    background: var(--uxp-host-widget-hover-background-color);
  }

  .body {
    margin-bottom: 1.5rem;
  }

  .body:last-child {
    margin-bottom: 0em;
  }

  .media {
    width: 100%;
  }

  @media (prefers-color-scheme: light), (prefers-color-scheme: lightest) {
    .iconDark {
      display: none;
    }
  }

  @media (prefers-color-scheme: dark), (prefers-color-scheme: darkest) {
    .iconLight {
      display: none;
    }
  }

  @media (prefers-color-scheme: lightest) {
    .plugin {
      border-color: #d8d8d8;
      background-color: #fcfcfc;
    }

    .pluginCard:hover {
      background-color: #f5f5f5;
    }
  }

  @media (prefers-color-scheme: light) {
    .plugin {
      border-color: #9d9d9d;
      background-color: #d1d1d1;
    }

    .pluginCard:hover {
      background-color: #c9c9c9;
    }
  }

  @media (prefers-color-scheme: dark) {
    .plugin {
      border-color: #606060;
      background-color: #464646;
    }

    .pluginCard:hover {
      background-color: #3d3d3d;
    }
  }

  @media (prefers-color-scheme: darkest) {
    .plugin {
      border-color: #424242;
      background-color: #292929;
    }

    .pluginCard:hover {
      background-color: #212121;
    }
  }
</style>
