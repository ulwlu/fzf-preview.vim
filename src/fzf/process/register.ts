import { setRegister } from "@/fzf/process/consumer"
import { createProcess } from "@/fzf/process/process"
import type { Processes } from "@/type"

const createRegisterProcess = createProcess("register")

export const registerProcesses: Processes = [createRegisterProcess("enter", setRegister)]
