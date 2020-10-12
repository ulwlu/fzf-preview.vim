import { commandDefinition } from "@/association/command"
import { dispatchResumeQuery } from "@/connector/resume"
import { HANDLER_NAME } from "@/const/fzf-handler"
import { cacheProjectRoot } from "@/fzf/cache"
import { executeCommand } from "@/fzf/command"
import { getDefaultProcesses } from "@/fzf/function"
import { callProcess } from "@/fzf/handler"
import { executeProcess, processesDefinition } from "@/fzf/process"
import { saveStore } from "@/module/persist"
import { pluginRegisterAutocmd, pluginRegisterCommand, pluginRegisterFunction } from "@/plugin"
import { dispatch } from "@/store"
import { CallbackLines } from "@/type"

const initializeRemotePlugin = async (): Promise<void> => {
  await cacheProjectRoot()
  await dispatch(saveStore({ modules: ["cache"] }))
}

export const registerRemoteCommands = (): void => {
  commandDefinition.forEach((fzfCommand) => {
    pluginRegisterCommand(
      fzfCommand.commandName,
      async (params: ReadonlyArray<string>) => {
        const args = params[0] != null ? params[0] : ""
        await executeCommand(args, fzfCommand)
      },
      fzfCommand.vimCommandOptions
    )
  })
}

export const registerProcesses = (): void => {
  processesDefinition.forEach(({ processes }) => {
    processes.forEach((process) => {
      pluginRegisterFunction(
        process.name,
        async ([lines]: [CallbackLines, ...Array<unknown>]) => {
          await executeProcess(lines, process)
        },
        { sync: false }
      )
    })
  })
}

export const registerFunction = (): void => {
  pluginRegisterFunction(HANDLER_NAME, callProcess, { sync: true })

  pluginRegisterFunction("FzfPreviewInitializeRemotePlugin", initializeRemotePlugin, { sync: false })

  pluginRegisterFunction(
    "FzfPreviewGetDefaultProcesses",
    ([processesName]: ReadonlyArray<string>) => getDefaultProcesses(processesName),
    { sync: true }
  )

  pluginRegisterFunction("FzfPreviewDispatchResumeQuery", dispatchResumeQuery, { sync: false })
}

export const registerAutocmd = (): void => {
  pluginRegisterAutocmd(
    "DirChanged",
    async () => {
      await cacheProjectRoot()
      await dispatch(saveStore({ modules: ["cache"] }))
    },
    {
      sync: false,
      pattern: "*",
    }
  )
}
