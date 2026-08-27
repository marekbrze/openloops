import type { Announcements, ScreenReaderInstructions } from '@dnd-kit/core'

/**
 * Polskie komunikaty screen-readera dla drag & drop (luka #12 audytu).
 * dnd-kit domyślnie mówi po angielsku — nadpisujemy na poziomie DndContext.
 */
export const plScreenReaderInstructions: ScreenReaderInstructions = {
  draggable:
    'Aby podnieść element, naciśnij spację lub Enter. Przeciągaj strzałkami. Spacja lub Enter upuszcza element, Escape anuluje przeciąganie.',
}

const GENERIC = 'Element listy'

export const plAnnouncements: Announcements = {
  onDragStart({ active }) {
    return `Podniesiono ${GENERIC} „${String(active.id).slice(0, 24)}”.`
  },
  onDragOver({ over }) {
    return over ? `Przeniesiono nad pozycję docelową (${GENERIC.toLowerCase()}).` : `${GENERIC} poza strefą upuszczenia.`
  },
  onDragEnd({ over }) {
    return over ? 'Upuszczono — kolejność zmieniona.' : 'Upuszczono — brak zmiany kolejności.'
  },
  onDragCancel() {
    return 'Przeciąganie anulowane — kolejność bez zmian.'
  },
}

/* Props zbiorczy, żeby oba DndContext (wątki i akcje) korzystały z tej samej konfiguracji PL. */
export const plDndAccessibility = {
  announcements: plAnnouncements,
  screenReaderInstructions: plScreenReaderInstructions,
} as const
