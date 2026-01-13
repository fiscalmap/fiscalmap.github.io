import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "정부 재정 통계 (GFS)",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "plausible",
    },
    locale: "ko-KR",
    baseUrl: "fiscalmap.github.io/",
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
          light: "#FFFFFF",           // 흰색 (배경)
          lightgray: "#F4F6F8",       // 연한 회색 (보조 배경)
          gray: "#C8D1DC",            // 회색 (경계선)
          darkgray: "#1E3A5F",        // 진한 파랑 (본문 텍스트)
          dark: "#0F2540",            // 매우 진한 파랑 (헤더 텍스트)
          secondary: "#0071BC",       // IMF 파랑 (메인 액센트)
          tertiary: "#00A3E0",        // 밝은 파랑 (서브 액센트)
          highlight: "rgba(0, 113, 188, 0.15)",  // 연한 파랑 (하이라이트)
          textHighlight: "#FFD70088", // 노란색 (텍스트 하이라이트)
        },
        darkMode: {
          light: "#0F1419",           // 어두운 회색 (배경)
          lightgray: "#1E2936",       // 약간 밝은 어두운 회색 (보조 배경)
          gray: "#3D5A80",            // 중간 파랑 (경계선)
          darkgray: "#B8D4E8",        // 밝은 파랑 (본문 텍스트)
          dark: "#E8F4F8",            // 거의 흰색 (헤더 텍스트)
          secondary: "#4A9FD8",       // 밝은 파랑 (메인 액센트)
          tertiary: "#00A3E0",        // 밝은 시안 (서브 액센트)
          highlight: "rgba(74, 159, 216, 0.15)",  // 연한 파랑 (하이라이트)
          textHighlight: "#FFD70088", // 노란색 (텍스트 하이라이트)
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
