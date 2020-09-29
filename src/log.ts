import chalk from 'chalk'
import * as Log from 'loglevel'
import prefix from 'loglevel-plugin-prefix'
const log = Log.getLogger('webhook2github')
interface IColors {
  [key: string]: chalk.Chalk
}
export const colors: IColors = {
  TRACE: chalk.magenta,
  DEBUG: chalk.cyan,
  INFO: chalk.green,
  WARN: chalk.yellow,
  ERROR: chalk.red,
}
prefix.reg(Log)
const logLevel = typeof LOG_LEVEL === 'undefined' ? 'info' : LOG_LEVEL
log.setDefaultLevel((logLevel as Log.LogLevelDesc) || 'info')
if (ENVIRONMENT === 'development') {
  log.setLevel('debug')
}
prefix.apply(log, {
  format(level, name, timestamp) {
    return `${chalk.gray(`[${timestamp}]`)} ${colors[level.toUpperCase()](
      level,
    )} ${chalk.green(`${name}:`)}`
  },
})
export { log, Log, prefix }
