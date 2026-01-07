import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "일상 기록",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "plausible",
    },
    locale: "ko-KR",
    baseUrl: "quartz.jzhao.xyz",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Schibsted Grotesk",
        body: "Source Sans Pro",
        code: "IBM Plex Mono",
      },
      colors: {
        lightMode: {
          light: "#faf8ff",           // 연한 보라빛 배경
          lightgray: "#e8e5f0",       // 연한 회보라
          gray: "#b8b0d0",            // 중간 회보라
          darkgray: "#5a4e7a",        // 진한 회보라
          dark: "#2d2640",            // 매우 진한 보라
          secondary: "#7c3aed",       // Obsidian 보라 (메인 액센트)
          tertiary: "#a78bfa",        // 밝은 보라 (서브 액센트)
          highlight: "rgba(124, 58, 237, 0.15)",  // 하이라이트
          textHighlight: "#c4b5fd88", // 텍스트 하이라이트
        },
        darkMode: {
          light: "#1e1b29",           // 어두운 보라 배경
          lightgray: "#2d2640",       // 약간 밝은 어두운 보라
          gray: "#665c8a",            // 중간 보라
          darkgray: "#c4b5fd",        // 밝은 보라 (텍스트)
          dark: "#e9e3ff",            // 거의 흰색 (헤더 텍스트)
          secondary: "#a78bfa",       // Obsidian 보라 (메인)
          tertiary: "#7c3aed",        // 진한 보라 (서브)
          highlight: "rgba(167, 139, 250, 0.15)",
          textHighlight: "#a78bfa88",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Comment out CustomOgImages to speed up build time
      Plugin.CustomOgImages(),
    ],
  },
}

export default config
