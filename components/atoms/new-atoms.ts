// Nouveaux Atoms ajoutés - NexusG Lite v1.0.0
// Composants créés lors de la Phase Immédiate

export { default as Checkbox } from './Checkbox'
export { default as Select } from './Select'
export { default as Progress } from './Progress'
export { default as Alert } from './Alert'
export { default as Divider } from './Divider'
export { default as Slider } from './Slider'

// Types pour les nouveaux composants
export type { CheckboxProps } from './Checkbox'
export type { SelectProps, Option } from './Select'
export type { ProgressProps } from './Progress'
export type { AlertProps, AlertWithActionsProps, AlertErrorListProps, AlertNotificationProps } from './Alert'
export type { DividerProps, TextDividerProps, IconDividerProps, ListDividerProps } from './Divider'
export type { SliderProps, DiscreteSliderProps, PriceSliderProps } from './Slider'

// Métadonnées
export const NEW_ATOMS_VERSION = '1.0.0'
export const NEW_ATOMS_COUNT = 6
export const BONUS_ATOMS_COUNT = 1
export const TOTAL_NEW_ATOMS = 7