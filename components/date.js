import { parseISO, format } from 'date-fns'

export default function Date({ dateString, dateFormat }) {
  const date = parseISO(dateString)
  const finalFormat = dateFormat || 'LLLL d, yyyy'

  return <time dateTime={dateString}>{format(date, finalFormat)}</time>
}
