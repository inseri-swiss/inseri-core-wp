import { atomFamily } from 'recoil'

export const downloadLinkState = atomFamily({ key: 'downloadLink', default: '' })
export const extensionState = atomFamily({ key: 'extension', default: '' })
export const wizardState = atomFamily({ key: 'isWizardMode', default: true })
