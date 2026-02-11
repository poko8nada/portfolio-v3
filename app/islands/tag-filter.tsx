import { useState } from 'hono/jsx'

export default function TagFilter({ tag }: { tag: string | null }) {
  const [selectedTag, setSelectedTag] = useState(tag)

  if (!selectedTag) {
    return <div class='mb-3 h-8' />
  }

  return (
    <div class='mb-3 h-8 flex items-center'>
      <div class='flex items-center gap-2 rounded-full border border-border-primary px-3 py-1 text-sm'>
        <span class='text-text-secondary'># {selectedTag}</span>
        <button
          type='button'
          class='ml-1 cursor-pointer text-text-secondary transition-colors hover:text-text-primary flex items-center justify-center'
          onClick={() => {
            setSelectedTag(null)
            window.location.assign('/posts')
          }}
          aria-label='Remove filter'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='14'
            height='14'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            stroke-width='2'
            stroke-linecap='round'
            stroke-linejoin='round'
            aria-hidden='true'
            role='img'
          >
            <title>Remove filter</title>
            <path d='M18 6L6 18M6 6l12 12' />
          </svg>
        </button>
      </div>
    </div>
  )
}
