import { isGitDirectory } from "@/connector/util"
import { GIT_ACTIONS } from "@/const/git"
import { globalVariableSelector } from "@/module/selector/vim-variable"
import { currentFilePath } from "@/system/file"
import type { FzfCommandDefinitionDefaultOption, Resource, SourceFuncArgs } from "@/type"

const createDisplayText = async (action: typeof GIT_ACTIONS[number]) => {
  if (action === "current-log") {
    return `${action}:${await currentFilePath()}`
  } else {
    return action
  }
}

export const gitActions = async (_args: SourceFuncArgs): Promise<Resource> => {
  if (!(await isGitDirectory())) {
    throw new Error("The current directory is not a git project")
  }

  const displayTextList = await Promise.all(
    GIT_ACTIONS.map(async (action) => {
      return await createDisplayText(action)
    })
  )

  return {
    type: "json",
    lines: GIT_ACTIONS.map((action, i) => ({
      data: {
        command: "FzfPreviewGitActions",
        type: "git-actions",
        action,
      },
      displayText: displayTextList[i],
    })),
  }
}

export const gitActionsDefaultOptions = (): FzfCommandDefinitionDefaultOption => ({
  "--prompt": '"GitActions> "',
  "--preview": `"${globalVariableSelector("fzfPreviewScriptDir") as string}/git_actions_preview {-1}"`,
  "--preview-window": '"down:50%"',
})