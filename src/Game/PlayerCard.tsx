import * as React from 'react'
import { t } from '../i18n'
import { Colors } from './Consts'
import { ColorNames, PlayerProfiles, PlayersTypes, PlayerType } from './PlayerProfiles'
import PlayerPawn from './PlayerPawn'

type Props = {
  id: number
  type: PlayerType
  started: boolean
  active: boolean
  finished: number
  progress: number
  onSelect(type: PlayerType): void
}

function PlayerDialog({ id, type, onSelect, onClose }: Pick<Props, 'id' | 'type' | 'onSelect'> & { onClose(): void }) {
  const dialogRef = React.useRef<HTMLDialogElement>(null)
  const selectedRef = React.useRef<HTMLButtonElement>(null)

  React.useLayoutEffect(() => {
    const dialog = dialogRef.current!
    const opener = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    dialog.showModal()
    selectedRef.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      opener?.focus()
    }
  }, [])

  return <dialog ref={dialogRef} className={`player-dialog color-${Colors[id]}`}
    aria-labelledby={`picker-title-${id}`} aria-describedby={`picker-hint-${id}`}
    onCancel={event => { event.preventDefault(); onClose() }}
    onClick={event => { if (event.target === event.currentTarget) onClose() }}>
    <div className="player-dialog-content">
      <div className="player-dialog-heading">
        <span className="picker-pawn"><PlayerPawn player={id}/></span>
        <div><span className="player-color">{t(ColorNames[id])}</span><h2 id={`picker-title-${id}`}>{t('Wybierz gracza')}</h2></div>
        <button type="button" className="dialog-close" aria-label={t('Zamknij wybór gracza')} onClick={onClose}>×</button>
      </div>
      <p className="picker-hint" id={`picker-hint-${id}`}>{t('Kliknij kafelek, aby wybrać gracza dla tego koloru.')}</p>
      <div className="player-options">{PlayersTypes.map(option => {
        const profile = PlayerProfiles[option]
        const selected = option === type
        return <button key={option} type="button" className="player-option" aria-pressed={selected}
          ref={selected ? selectedRef : undefined} onClick={() => { onSelect(option); onClose() }}>
          <span className="option-heading"><span className="avatar" aria-hidden="true">{t(profile.initial)}</span>
            <span className="player-badge">{t(profile.badge)}</span>
            {selected && <span className="option-check" aria-hidden="true">✓</span>}
          </span>
          <span className="player-name">{t(profile.name)}</span>
          <span className="player-description">{t(profile.description)}</span>
        </button>
      })}</div>
    </div>
  </dialog>
}

export default function PlayerCard({ id, type, started, active, finished, progress, onSelect }: Props) {
  const [open, setOpen] = React.useState(false)
  const profile = PlayerProfiles[type]
  React.useEffect(() => { if (started) setOpen(false) }, [started])

  return <>
    <button type="button" id={`player-${id}`} disabled={started}
      className={`player-card color-${Colors[id]} ${active ? 'is-current' : ''} ${type === PlayerType.None ? 'is-empty' : ''}`}
      aria-haspopup="dialog" aria-expanded={open && !started}
      aria-label={t('Gracz: {color}, {name}', { color: t(ColorNames[id]), name: t(profile.name) })}
      onClick={event => { event.currentTarget.focus(); setOpen(true) }}>
      <span className="player-card-top"><span className="avatar pawn-avatar"><PlayerPawn player={id}/></span>
        <span className="player-card-identity"><span className="player-color">{t(ColorNames[id])}</span><span className="player-badge">{active ? t('Teraz gra') : t(profile.badge)}</span></span>
        {started ? <span className="home-count" title={t('Pionki na mecie')}>{finished}<span> / 4</span></span>
          : <span className="player-edit" aria-hidden="true">↗</span>}
      </span>
      <span className="player-name">{t(profile.name)}</span>
      {started && type !== PlayerType.None && <span className="progress-track" aria-label={t('Postęp: {color}', { color: t(ColorNames[id]) })}><span style={{ width: `${Math.min(100, progress * 100)}%` }}/></span>}
    </button>
    {open && !started && <PlayerDialog id={id} type={type} onSelect={onSelect} onClose={() => setOpen(false)}/>}
  </>
}
