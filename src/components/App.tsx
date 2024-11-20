import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type DetailedHTMLProps,
  type HTMLAttributes,
} from 'react'
import {
  pathHash,
  type LifeEvent,
  type PathType,
  type Stats,
} from '../data/paths'
import { cn } from '../lib/utils/cn'

const keys = Object.keys(pathHash) as PathType[]
const EVENTS = [
  {
    label: 'Standard',
    description: 'Equivalent to standard array.',
    count: 12,
  },
  {
    label: 'Heroic',
    description:
      'Produces slightly stronger characters than the standard array.',
    count: 18,
  },
]
const STATS = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']
const CLASSES = [
  { name: 'Barbarian', stats: [1, 0, 2, 0, 0, 0] },
  { name: 'Bard', stats: [0, 2, 0, 0, 0, 1] },
  { name: 'Cleric', stats: [2, 0, 0, 0, 1, 0] },
  { name: 'Druid', stats: [0, 0, 2, 0, 1, 0] },
  { name: 'Fighter', stats: [1, 2, 0, 0, 0, 0] },
  { name: 'Monk', stats: [0, 1, 0, 0, 2, 0] },
  { name: 'Paladin', stats: [1, 0, 0, 0, 0, 2] },
  { name: 'Ranger', stats: [0, 1, 0, 0, 2, 0] },
  { name: 'Rogue', stats: [0, 1, 0, 2, 0, 0] },
  { name: 'Sorcerer', stats: [0, 0, 2, 0, 0, 1] },
  { name: 'Warlock', stats: [0, 0, 2, 0, 0, 1] },
  { name: 'Wizard', stats: [0, 2, 0, 1, 0, 0] },
] satisfies { name: string; stats: Stats }[]

export default function App() {
  return <CharacterInit />
}

function CharacterInit() {
  const [currentPath, currentPathAssign] = useState<PathType>()
  const [eventCount, eventCountAssign] = useState<number>()
  const [character, characterAssign] = useState<Character>({
    stats: [8, 8, 8, 8, 8, 8],
    events: [],
  })

  const walk = useCallback(
    (currentPath: PathType) => {
      if (!eventCount) return

      const defaultCharacter = {
        stats: [8, 8, 8, 8, 8, 8],
        events: [],
      } as Character
      let character = defaultCharacter
      let EVENT_COUNT = eventCount
      let jumps = 0
      let eventPool = pathHash[currentPath] as LifeEvent[]
      const charStats = [0, 0, 0, 0, 0, 0]
      const events: LifeEvent[] = []

      for (let i = 0; i < EVENT_COUNT; i++) {
        events.push(chooseEvent())
      }
      character = events.reduce((acc, event) => {
        if ('stats' in event) {
          acc.events.push(event.description)
          acc.stats = event.stats.map((stat, i) => stat + acc.stats[i]) as Stats
        } else if ('moveTo' in event) {
          acc.events.push(event.description)
        }

        return acc
      }, defaultCharacter)

      if (character.stats.some((stat) => stat > 18)) {
        walk(currentPath)
        return
      }

      characterAssign(character)

      function chooseEvent(): LifeEvent {
        const randomEvent =
          eventPool[Math.floor(Math.random() * eventPool.length)]

        if ('moveTo' in randomEvent) {
          if (jumps > 2) return chooseEvent()

          eventPool = pathHash[randomEvent.moveTo] as LifeEvent[]
          EVENT_COUNT++
          jumps++
        }

        eventPool = eventPool.filter((event) => event !== randomEvent)
        return randomEvent
      }
    },
    [eventCount]
  )

  useEffect(() => {
    if (currentPath && eventCount) {
      walk(currentPath)
    }
  }, [currentPath, eventCount])

  return (
    <article className='p-4 max-w-prose mx-auto space-y-8'>
      <section>
        <H2>Choose a starting point</H2>

        <div className='flex justify-between'>
          <div className='flex gap-4'>
            {keys.map((key) => (
              <Button
                key={key}
                onMouseDown={() => currentPathAssign(key)}
                className={
                  currentPath === key ? 'bg-blue-600 hover:bg-blue-500' : ''
                }
              >
                {key}
              </Button>
            ))}
          </div>

          <Button
            onMouseDown={() => {
              currentPathAssign(keys[Math.floor(Math.random() * keys.length)])
            }}
          >
            Random
          </Button>
        </div>
      </section>

      <section>
        <H2>Choose the number of Events</H2>

        <div className='flex gap-4'>
          {EVENTS.map(({ label, description, count }) => (
            <Button
              key={label}
              onMouseDown={() => eventCountAssign(count)}
              className={
                eventCount === count ? 'bg-blue-600 hover:bg-blue-500' : ''
              }
            >
              {label}
            </Button>
          ))}
        </div>
      </section>

      <section>
        <div className='flex justify-between mb-4'>
          <H2>The Road so far...</H2>
          <div className='flex gap-4'>
            <Button
              onMouseDown={() => {
                if (currentPath && eventCount) walk(currentPath)
              }}
            >
              Roll Again
            </Button>
            <Button className='bg-transparent hover:bg-transparent underline'>
              Reset
            </Button>
          </div>
        </div>

        {character.events.length > 0 ? (
          <div className='space-y-4'>
            <div className='flex gap-4 justify-center'>
              {character.stats.map((stat, index) => (
                <div key={index} className='flex flex-col items-center'>
                  <p>{STATS[index]}</p>
                  <p>{stat}</p>
                </div>
              ))}
            </div>

            <ul className='space-y-2'>
              {character.events.map((event, index) => (
                <li
                  key={index}
                  className={event.includes('Move') ? 'text-orange-500' : ''}
                >
                  {event}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>Choose a starting point above to begin...</p>
        )}
      </section>
    </article>
  )
}

function Button({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        'px-3 py-1 rounded bg-neutral-600 hover:bg-neutral-500',
        className
      )}
    >
      {children}
    </button>
  )
}
function H2({
  children,
  className,
  ...props
}: DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>) {
  return (
    <h2 {...props} className={cn('mb-2 font-semibold text-xl', className)}>
      {children}
    </h2>
  )
}

type Character = {
  stats: Stats
  events: string[]
}
