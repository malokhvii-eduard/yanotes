export function formatDate (value: string) {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    hour: 'numeric',
    hour12: false,
    minute: '2-digit',
    month: 'short'
  }).format(new Date(value))
}
