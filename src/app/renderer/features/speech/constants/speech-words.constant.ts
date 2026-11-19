/** The row under the field while a recording is made and heard (4j). */
export const HEARING_LABEL = "РОЗПІЗНАЄМО…";
export const RECORDING_CANCEL_LABEL = "СКАСУВАТИ";
export const MICROPHONE_LABEL = "Сказати питання";
export const MICROPHONE_FINISH_LABEL = "Закінчити запис";

/** The app's line when a recording or a reading cannot go (4j, 4k). */
export const SPEECH_NOT_SET_NOTE = "Розпізнавання не налаштоване";
export const VOICE_NOT_SET_NOTE = "Голос не налаштований";
export const MICROPHONE_DENIED_NOTE = "Немає доступу до мікрофона";
export const SPEECH_DENIED_NOTE = "Немає доступу до розпізнавання мовлення";
export const NOTHING_HEARD_NOTE = "У записі не почуто слів";
export const HEARING_FAILED_MIDDLE = " не розпізнав: ";
export const SPEECH_SECTION_ACT = "МОВЛЕННЯ";
export const MICROPHONE_SETTINGS_ACT = "ПАРАМЕТРИ СИСТЕМИ";
export const HEAR_AGAIN_ACT = "ЩЕ РАЗ";

/** The speaker over an answer, and the word that stands while it reads (4k). */
export const READ_ALOUD_LABEL = "Озвучити відповідь";
export const READ_STOP_LABEL = "Зупинити читання";
export const READING_LABEL = "ЧИТАЄ";

/** The section of the rail (38c): one card for hearing, one for the voice. */
export const HEARING_CARD_TITLE = "Розпізнавання";
export const HEARING_MODEL_LABEL = "МОДЕЛЬ";
export const HEARING_NONE_NOTE = "У каталозі немає моделі з видом «Розпізнавання».";
export const HEARING_NONE_ACT = "До моделей";
export const HEARING_LOST_NAME = "моделі немає";
export const HEARING_LOST_NOTE =
  "Модель, обрану для розпізнавання, з каталогу видалено. Посилання лишилось — оберіть іншу.";
export const VOICE_CARD_TITLE = "Голос";
export const VOICE_MACHINE_NOTE = "Ця машина · у project.yaml не йде";
export const VOICE_FIELD_LABEL = "ГОЛОС ДЛЯ АНГЛІЙСЬКОЇ";
export const UKRAINIAN_VOICE_FIELD_LABEL = "ГОЛОС ДЛЯ УКРАЇНСЬКОЇ";
/** The Ukrainian voice's field while none is chosen: the voice above reads the Ukrainian too. */
export const UKRAINIAN_VOICE_SAME_WORDS = "Той самий голос";
export const VOICE_LISTEN_LABEL = "ПОСЛУХАТИ";
export const VOICE_RATE_LABEL = "ШВИДКІСТЬ";
/** How many places a rate is written with: «1.2». */
export const VOICE_RATE_PLACES = 1;
export const VOICE_SAMPLE = "Так звучатимуть відповіді агентів.";
/** The English voice's sample, so it is heard in its own language. */
export const ENGLISH_VOICE_SAMPLE = "This is how the agents' answers will sound.";
/** The id the sample is read under, so the one voice knows it from any answer. */
export const VOICE_SAMPLE_ID = "voice-sample";
export const VOICE_NAME_SEPARATOR = " · ";
/** The note a written choice of the hearing model leaves. */
export const WRITE_SPEECH_LABEL = "Мовлення збережено";
/** The line when the machine did not take a change of its speech; its own words follow. */
export const SPEECH_SAVE_FAILED_PREFIX = "Мовлення не збережено: ";

/** A recording's length and how far it is played (4j, 4l). */
export const CLOCK_SEPARATOR = ":";
export const PLAYED_SEPARATOR = " / ";
export const PLAY_CLIP_LABEL = "Програти запис";
export const STOP_CLIP_LABEL = "Зупинити запис";
export const DROP_CLIP_LABEL = "Зняти запис";

/** macOS's own hearing, first in the hearing model's list (38c, 38d) and refused by the system (38e). */
export const MAC_HEARING_NAME = "macOS";
export const MAC_HEARING_TITLE = "macOS · на цій машині";
export const MAC_HEARING_ROW_NOTE = "Безкоштовно · без мережі · ключа не треба";
export const MAC_HEARING_DENIED_TITLE = "macOS · немає дозволу";
export const MAC_HEARING_DENIED_NOTE = "macOS не дала дозволу на розпізнавання мовлення. Без нього мікрофон не почує.";
export const MAC_HEARING_WAITING_NOTE = "Чекаємо дозволу macOS";
/** Said in capitals by hand, since the model's own name after it keeps its case. */
export const MAC_HEARING_KEPT_PREFIX = "У PROJECT.YAML ЛИШАЄТЬСЯ ";
export const MAC_LOCALE_LABEL = "МОВА";
export const MAC_SECOND_LOCALE_LABEL = "ДРУГА МОВА";
/** The second language's field while none is chosen. */
export const MAC_SECOND_LOCALE_NONE_WORDS = "Немає";
export const MAC_LOCALE_FOOT = "Мови, які macOS розпізнає на цій машині";
/** The language a locale names, in Ukrainian. */
export const MAC_LOCALE_LANGUAGE = "uk";
