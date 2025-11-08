
import * as React from "react"
import { ChartConfig } from "./ChartContext"

// Format: { THEME_NAME: CSS_SELECTOR }
export const THEMES = { light: "", dark: ".dark" } as const

export const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, config]) => config.theme || config.color
  )

  // Default chart colors if no config provided
  const defaultColors = {
    1: "hsl(12 76% 61%)",
    2: "hsl(173 58% 39%)", 
    3: "hsl(197 37% 24%)",
    4: "hsl(43 74% 66%)",
    5: "hsl(27 87% 67%)",
  }

  if (!colorConfig.length) {
    return (
      <style
        dangerouslySetInnerHTML={{
          __html: Object.entries(THEMES)
            .map(
              ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
  --color-waitTime: ${defaultColors[1]};
  --color-count: ${defaultColors[2]};
  --chart-1: ${defaultColors[1]};
  --chart-2: ${defaultColors[2]};
  --chart-3: ${defaultColors[3]};
  --chart-4: ${defaultColors[4]};
  --chart-5: ${defaultColors[5]};
}
`
            )
            .join("\n"),
        }}
      />
    )
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
  --chart-1: ${defaultColors[1]};
  --chart-2: ${defaultColors[2]};
  --chart-3: ${defaultColors[3]};
  --chart-4: ${defaultColors[4]};
  --chart-5: ${defaultColors[5]};
}
`
          )
          .join("\n"),
      }}
    />
  )
}
