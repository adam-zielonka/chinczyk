import * as React from 'react'
import { language, setLanguage, t } from '../i18n'

export function LanguageSwitch() {
  return <div className="language-switch" role="group" aria-label="Language / Język">
    <button type="button" lang="pl" aria-pressed={language === 'pl'} onClick={() => setLanguage('pl')}>Polski</button>
    <span aria-hidden="true">/</span>
    <button type="button" lang="en" aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>English</button>
  </div>
}

function RulesDialog({ onClose }: { onClose(): void }) {
  const dialogRef = React.useRef<HTMLDialogElement>(null)
  React.useLayoutEffect(() => {
    const dialog = dialogRef.current!
    const opener = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = overflow
      opener?.focus()
    }
  }, [])

  return <dialog ref={dialogRef} className="rules-dialog" aria-labelledby="rules-title"
    onCancel={event => { event.preventDefault(); onClose() }}
    onClick={event => {
      if (event.target !== event.currentTarget) return
      const bounds = event.currentTarget.getBoundingClientRect()
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose()
    }}>
    <div className="rules-content">
      <div className="rules-heading">
        <h2 id="rules-title">{t('Zasady gry')}</h2>
        <button type="button" className="dialog-close" aria-label={t('Zamknij zasady')} onClick={onClose}>×</button>
      </div>
      <ol className="rules-list">
        <li><h3>{t('Szóstka na dobry początek')}</h3><p>{t('Wyrzuć 6, żeby wyprowadzić pionek z bazy. Gdy wszystkie są w bazie, masz do trzech prób.')}</p></li>
        <li><h3>{t('Ścigaj się i zbijaj')}</h3><p>{t('Ruszaj po torze. Wejście na pole rywala odsyła jego pionek do bazy.')}</p></li>
        <li><h3>{t('Wszyscy do domu')}</h3><p>{t('Wprowadź cztery pionki na kolorową metę. Potrzebujesz dokładnego rzutu.')}</p></li>
      </ol>
    </div>
  </dialog>
}

export function RulesHelp({ onOpen }: { onOpen(): void }) {
  const [open, setOpen] = React.useState(false)
  return <>
    <button type="button" className="text-button" aria-haspopup="dialog" aria-expanded={open}
      onClick={event => { event.currentTarget.focus(); onOpen(); setOpen(true) }}>{t('Zasady gry')}</button>
    {open && <RulesDialog onClose={() => setOpen(false)}/>}
  </>
}
