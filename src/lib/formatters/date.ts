import { format, formatRelative, isToday, isYesterday } from 'date-fns'
import { id } from 'date-fns/locale'

export function formatDateTime(dateStr: string): string {
  return format(new Date(dateStr), 'dd MMM yyyy, HH:mm', { locale: id })
}

export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), 'dd MMM yyyy', { locale: id })
}

export function formatTime(dateStr: string): string {
  return format(new Date(dateStr), 'HH:mm')
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  if (isToday(date)) return `Today, ${formatTime(dateStr)}`
  if (isYesterday(date)) return `Yesterday, ${formatTime(dateStr)}`
  return formatDateTime(dateStr)
}

export function formatShortDate(date: Date): string {
  return format(date, 'dd/MM')
}
