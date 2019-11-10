export default () =>
  Math.random().toString(36).slice(2)+(new Date).getTime().toString(36)