export function isObject(value) {
    return typeof value === 'object' && value !== null
}
export function hasChanged(value, oldValue) {
    return !Object.is(value, oldValue)
}
const hasOwnProperty = Object.prototype.hasOwnProperty
export const hasOwn = (
  val,
  key,
) => hasOwnProperty.call(val, key)