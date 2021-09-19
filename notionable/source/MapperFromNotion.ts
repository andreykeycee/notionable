import {
  DatePropertyValue, FilesPropertyValue, FormulaPropertyValue,
  Page,
  PropertyValue,
  RichTextPropertyValue, RollupPropertyValue,
  TitlePropertyValue
} from '@notionhq/client/build/src/api-types'
import { invert, reduce } from 'lodash'
import { MapperFromNotion } from './Entities'

const mapNotionPageToItem = <ItemType extends { id: string }> (
  page: Page,
  propNames: { [propName: string]: string }
): ItemType => {
  const typeNames = invert(propNames)

  return {
    id: page.id,
    ...Object.entries(page.properties).reduce((newObject, [ propName, propValue ]) => {
      return {
        ...newObject,
        [typeNames[propName]]: getTypedValueFromNotion(propValue)
      }
    }, {})
  } as ItemType
}


const getTypedValueFromNotion = (propValue: PropertyValue) => {
  switch (propValue.type) {
    case 'title':
      return getTitleValueFromNotion(propValue.title)

    case 'rich_text':
      return getRichTextValueFromNotion(propValue.rich_text)

    case 'number':
      return propValue.number

    case 'select':
      return propValue.select

    case 'multi_select':
      return propValue.multi_select.map(select => select.name)

    case 'date':
      return getDateValueFromNotion(propValue.date)

    // @ts-ignore
    case 'relation':
      // @ts-ignore
      return propValue.relation.map(rel => rel.id) as string[]

    case 'people':
      return propValue.people.map(user => user.id)

    case 'checkbox':
      return propValue.checkbox

    case 'url':
      return propValue.url

    case 'email':
      return propValue.email

    case 'phone_number':
      return propValue.phone_number

    case 'created_by':
      return propValue.created_by.id

    case 'created_time':
      return new Date(propValue.created_time)

    case 'files':
      return getFileValueFromNotion(propValue.files)

    case 'formula':
      return getFormulaValueFromNotion(propValue.formula)

    case 'last_edited_by':
      return propValue.last_edited_by.id

    case 'last_edited_time':
      return new Date(propValue.last_edited_time)

    case 'rollup':
      return getRollupValueFromNotion(propValue.rollup)

    default:
      return 'unknown value type'
  }
}


const getTitleValueFromNotion = (value: TitlePropertyValue['title']): string => {
  return value.reduce((output, { plain_text }) => output + plain_text, '')
}


const getRichTextValueFromNotion = (value: RichTextPropertyValue['rich_text']): string => {
  return value.reduce((output, { plain_text }) => output + plain_text, '')
}


const getDateValueFromNotion = (
  value: DatePropertyValue['date']
): { start?: Date, end?: Date } | null => {
  if (!value) {
    return null
  }

  const start = { start: new Date(value.start) }
  const end = value.end ? { end: new Date(value.end) } : {}

  return { ...start, ...end }
}


const getFileValueFromNotion = (
  value: FilesPropertyValue['files']
): { name: string, url: string | undefined }[] => {
  return value.map(file => ({
    name: file.name,
    // @ts-ignore
    url: file.external
  }))
}


const getFormulaValueFromNotion = (
  value: FormulaPropertyValue['formula']
): string | boolean | number | { start?: Date, end?: Date } | null | undefined => {
  switch (value.type) {
    case 'boolean':
      return value.boolean

    case 'date':
      return getDateValueFromNotion(value.date.date)

    case 'number':
      return value.number

    case 'string':
      return value.string
  }
}


const getRollupValueFromNotion = (
  value: RollupPropertyValue['rollup']
): any[] | number | { start?: Date | undefined, end?: Date | undefined } | null | undefined => {
  switch (value.type) {
    case 'array':
      return value.array.map(value => getTypedValueFromNotion(value as PropertyValue))

    case 'number':
      return value.number

    case 'date':
      return value.date && getDateValueFromNotion(value.date.date)
  }
}

export default {
  mapNotionPageToItem
} as MapperFromNotion