import { Page, PropertyValue, RichTextPropertyValue, TitlePropertyValue } from '@notionhq/client/build/src/api-types'
import { invert } from 'lodash'
import { MapperFromNotion } from './Entities'

const mapNotionPageToItem = <ItemType extends object> (
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
  }
}


const getTitleValueFromNotion = (value: TitlePropertyValue['title']): string => {
  return value.reduce((output, { plain_text }) => output + plain_text, '')
}


const getRichTextValueFromNotion = (value: RichTextPropertyValue['rich_text']): string => {
  return value.reduce((output, { plain_text }) => output + plain_text, '')
}

export default {
  mapNotionPageToItem
} as MapperFromNotion